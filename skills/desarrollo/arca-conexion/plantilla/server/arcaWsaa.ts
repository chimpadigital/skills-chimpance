import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import forge from "node-forge";
import { arcaUrls, type ArcaConfig } from "./arca.config";
import { xmlText, decodeEntities } from "./arcaXml";

/**
 * WSAA: el "login" de ARCA. Se firma un pedido (TRA) con el certificado y ARCA devuelve un ticket de
 * acceso (token + sign) que vale ~12 h para UN servicio (ws_sr_constancia_inscripcion, wsfe, …).
 *
 * El manual de WSAA dice que mientras un ticket siga vigente rechaza pedir otro ("ya posee un TA válido").
 * En la prueba del 12/9/2026 entregó uno nuevo igual, pero no conviene depender de eso: si el servidor se
 * reinicia (cada deploy) y el ticket vivía solo en memoria, podría quedar sin acceso hasta que venza.
 * Por eso el ticket se reusa y se guarda también en disco, fuera del repo.
 */

export interface AccessTicket {
  token: string;
  sign: string;
  expiresAt: string; // ISO
}

export class ArcaAuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

// Margen para no usar un ticket que vence en medio de una consulta.
const EXPIRY_MARGIN_MS = 5 * 60 * 1000;

const memory = new Map<string, AccessTicket>();
const inFlight = new Map<string, Promise<AccessTicket>>();

function isUsable(t: AccessTicket | undefined | null): t is AccessTicket {
  return !!t && new Date(t.expiresAt).getTime() - EXPIRY_MARGIN_MS > Date.now();
}

/** Clave del ticket: servicio + huella del certificado (si se cambia de certificado no se reusa el viejo). */
function cacheKey(config: ArcaConfig, service: string): string {
  const fp = crypto.createHash("sha256").update(config.certPem).digest("hex").slice(0, 16);
  return `${config.env}-${fp}-${service}`;
}

async function readDisk(config: ArcaConfig, key: string): Promise<AccessTicket | null> {
  try {
    const raw = await fs.readFile(path.join(config.cacheDir, `ta-${key}.json`), "utf8");
    return JSON.parse(raw) as AccessTicket;
  } catch {
    return null;
  }
}

async function writeDisk(config: ArcaConfig, key: string, t: AccessTicket): Promise<void> {
  try {
    await fs.mkdir(config.cacheDir, { recursive: true, mode: 0o700 });
    await fs.writeFile(path.join(config.cacheDir, `ta-${key}.json`), JSON.stringify(t), { mode: 0o600 });
  } catch (e) {
    console.error("[arca] no se pudo guardar el ticket en disco:", (e as Error).message);
  }
}

/** Fecha ISO con offset de Argentina, como la documenta WSAA. */
function isoAr(d: Date): string {
  const ar = new Date(d.getTime() - 3 * 3600 * 1000);
  return ar.toISOString().replace(/\.\d{3}Z$/, "-03:00");
}

export function buildTra(service: string, now = new Date()): string {
  const uniqueId = Math.floor(now.getTime() / 1000);
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<loginTicketRequest version="1.0"><header>` +
    `<uniqueId>${uniqueId}</uniqueId>` +
    `<generationTime>${isoAr(new Date(now.getTime() - 10 * 60 * 1000))}</generationTime>` +
    `<expirationTime>${isoAr(new Date(now.getTime() + 10 * 60 * 1000))}</expirationTime>` +
    `</header><service>${service}</service></loginTicketRequest>`
  );
}

/** Firma el TRA como CMS/PKCS#7 con el contenido adentro, en base64 (lo que espera loginCms). */
export function signTra(tra: string, certPem: string, keyPem: string): string {
  const cert = forge.pki.certificateFromPem(certPem);
  const key = forge.pki.privateKeyFromPem(keyPem);
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(tra, "utf8");
  p7.addCertificate(cert);
  p7.addSigner({
    key,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime, value: new Date() as any },
    ],
  });
  p7.sign();
  return forge.util.encode64(forge.asn1.toDer(p7.toAsn1()).getBytes());
}

/** Lee la respuesta de loginCms: ticket o error con el código de ARCA. */
export function parseLoginResponse(xml: string): AccessTicket {
  const fault = xmlText(xml, "faultstring");
  if (fault) {
    const code = xmlText(xml, "faultcode") || "wsaa.error";
    if (/alreadyAuthenticated/i.test(code) || /TA valido/i.test(fault)) {
      throw new ArcaAuthError(
        "ARCA ya entregó un ticket para este certificado y todavía no venció (dura 12 h). Si el servidor lo perdió, hay que esperar a que venza o usar otro certificado.",
        "ALREADY_AUTHENTICATED",
      );
    }
    if (/notAuthorized|cms\.cert/i.test(code)) {
      throw new ArcaAuthError(`El certificado no está autorizado para este servicio en ARCA (${fault}).`, "NOT_AUTHORIZED");
    }
    throw new ArcaAuthError(`ARCA rechazó el login: ${fault}`, "WSAA_FAULT");
  }
  const ret = xmlText(xml, "loginCmsReturn");
  if (!ret) throw new ArcaAuthError("Respuesta de WSAA sin ticket", "WSAA_EMPTY");
  const inner = decodeEntities(ret);
  const token = xmlText(inner, "token");
  const sign = xmlText(inner, "sign");
  const expiration = xmlText(inner, "expirationTime");
  if (!token || !sign || !expiration) throw new ArcaAuthError("Ticket de WSAA incompleto", "WSAA_EMPTY");
  return { token, sign, expiresAt: new Date(expiration).toISOString() };
}

async function requestTicket(config: ArcaConfig, service: string): Promise<AccessTicket> {
  const cms = signTra(buildTra(service), config.certPem, config.keyPem);
  const body =
    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">` +
    `<soapenv:Header/><soapenv:Body><wsaa:loginCms><wsaa:in0>${cms}</wsaa:in0></wsaa:loginCms></soapenv:Body></soapenv:Envelope>`;
  const res = await fetch(arcaUrls(config.env).wsaa, {
    method: "POST",
    headers: { "Content-Type": "text/xml; charset=utf-8", SOAPAction: '""' },
    body,
    signal: AbortSignal.timeout(20000),
  });
  return parseLoginResponse(await res.text());
}

/** Ticket vigente para el servicio: memoria → disco → WSAA (una sola llamada a la vez por servicio). */
export async function getAccessTicket(config: ArcaConfig, service: string): Promise<AccessTicket> {
  const key = cacheKey(config, service);
  const cached = memory.get(key);
  if (isUsable(cached)) return cached;

  const pending = inFlight.get(key);
  if (pending) return pending;

  const p = (async () => {
    const fromDisk = await readDisk(config, key);
    if (isUsable(fromDisk)) {
      memory.set(key, fromDisk);
      return fromDisk;
    }
    const fresh = await requestTicket(config, service);
    memory.set(key, fresh);
    await writeDisk(config, key, fresh);
    return fresh;
  })();
  inFlight.set(key, p);
  try {
    return await p;
  } finally {
    inFlight.delete(key);
  }
}

/** Descarta el ticket guardado (ARCA dijo que ya no vale): el próximo pedido va a WSAA por uno nuevo. */
export async function invalidateAccessTicket(config: ArcaConfig, service: string): Promise<void> {
  const key = cacheKey(config, service);
  memory.delete(key);
  try {
    await fs.unlink(path.join(config.cacheDir, `ta-${key}.json`));
  } catch {
    /* no estaba en disco */
  }
}
