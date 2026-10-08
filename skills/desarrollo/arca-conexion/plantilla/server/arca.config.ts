import fs from "fs";
import path from "path";
import forge from "node-forge";

/**
 * Conexión con los web services de ARCA (ex AFIP), sep 2026.
 *
 * Todo pasa por un certificado digital de Chimpancé (Administración de Certificados Digitales, con clave
 * fiscal) al que se le delegan los servicios en el Administrador de Relaciones.
 *   alias `chimpafinanzas-padron` (padrón + facturación electrónica)
 *
 * De dónde sale el certificado (nunca del repo), en este orden:
 *   1. Archivos `<cwd>/.arca/cert.pem` y `<cwd>/.arca/key.pem` (o ARCA_CERT_FILE / ARCA_KEY_FILE). Los escribe
 *      el deploy (.github/workflows/deploy.yml) desde los secretos cifrados de GitHub ARCA_CERT_B64 /
 *      ARCA_KEY_B64, legibles solo por el usuario del servicio. No hace falta tocar el .env del servidor.
 *   2. Variables del .env: ARCA_CERT / ARCA_KEY — el PEM en base64 (una línea) o con \n literales.
 * Desde el 14/9/2026 dev y producción usan el MISMO certificado para el padrón (solo lectura, sin riesgo).
 *
 * Factura electrónica (wsfe, 16/9/2026) — ver getWsfeConfig(): emite comprobantes REALES solo si existe
 * `<cwd>/.arca/wsfe-produccion`, que el deploy escribe únicamente en producción (rama main). En cualquier
 * otro ambiente usa el certificado de HOMOLOGACIÓN de ARCA (`.arca/homo/cert.pem|key.pem`, alias
 * `chimpafinanzas-dev`, secretos ARCA_HOMO_CERT_B64 / ARCA_HOMO_KEY_B64): facturas de prueba sin validez
 * fiscal. Sin ninguno de los dos, la emisión queda apagada. Así dev-finanzas nunca emite una factura real.
 *
 * Opcionales:
 *   ARCA_CUIT   CUIT de la empresa que consulta/factura (default Chimpancé)
 *   ARCA_ENV    "produccion" (default) | "homologacion"
 *   ARCA_CACHE_DIR  dónde se guarda el ticket de acceso para sobrevivir reinicios (default <cwd>/.arca-cache)
 */
export type ArcaEnv = "produccion" | "homologacion";

export interface ArcaConfig {
  certPem: string;
  keyPem: string;
  cuit: string;
  env: ArcaEnv;
  cacheDir: string;
}

const URLS = {
  produccion: {
    wsaa: "https://wsaa.afip.gov.ar/ws/services/LoginCms",
    padronA5: "https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA5",
    wsfe: "https://servicios1.afip.gov.ar/wsfev1/service.asmx",
  },
  homologacion: {
    wsaa: "https://wsaahomo.afip.gov.ar/ws/services/LoginCms",
    padronA5: "https://awshomo.afip.gov.ar/sr-padron/webservices/personaServiceA5",
    wsfe: "https://wswhomo.afip.gov.ar/wsfev1/service.asmx",
  },
} as const;

export function arcaUrls(env: ArcaEnv) {
  return URLS[env];
}

/** Acepta el PEM tal cual, con "\n" escapados (típico de un .env) o en base64 de una línea. */
export function decodePem(raw: string | undefined): string | null {
  const v = (raw || "").trim();
  if (!v) return null;
  if (v.includes("-----BEGIN")) return v.replace(/\\n/g, "\n");
  try {
    const decoded = Buffer.from(v, "base64").toString("utf8");
    return decoded.includes("-----BEGIN") ? decoded : null;
  } catch {
    return null;
  }
}

function readPemFile(file: string): string | null {
  try {
    return decodePem(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/** null = ARCA no está configurado en este ambiente (la búsqueda de CUIT cae al respaldo). */
export function getArcaConfig(): ArcaConfig | null {
  const dir = path.resolve(process.cwd(), ".arca");
  const certPem = readPemFile(process.env.ARCA_CERT_FILE || path.join(dir, "cert.pem")) || decodePem(process.env.ARCA_CERT);
  const keyPem = readPemFile(process.env.ARCA_KEY_FILE || path.join(dir, "key.pem")) || decodePem(process.env.ARCA_KEY);
  if (!certPem || !keyPem) return null;
  return {
    certPem,
    keyPem,
    cuit: (process.env.ARCA_CUIT || "30718030648").replace(/\D/g, ""),
    env: process.env.ARCA_ENV === "homologacion" ? "homologacion" : "produccion",
    cacheDir: process.env.ARCA_CACHE_DIR || path.resolve(process.cwd(), ".arca-cache"),
  };
}

/* ---------- Factura electrónica (wsfe) ---------- */

/** Punto de venta "ERP CHIMPA" (sistema RECE para web services), creado en ARCA el 12/9/2026. El 1 es Factura en Línea. */
export const DEFAULT_WSFE_POINT_OF_SALE = 2;

export interface WsfeConfig extends ArcaConfig {
  pointOfSale: number;
}

export type WsfeConfigResult =
  | { ok: true; config: WsfeConfig }
  | { ok: false; reason: string };

function fileExists(file: string): boolean {
  try {
    return fs.statSync(file).isFile();
  } catch {
    return false;
  }
}

/**
 * Con qué certificado y contra qué ARCA se emite. Producción solo con la marca `.arca/wsfe-produccion`
 * (la escribe el deploy de main); si no, homologación con `.arca/homo/`; si no, apagado.
 * `baseDir` es para los tests.
 */
export function getWsfeConfig(baseDir = process.cwd()): WsfeConfigResult {
  const dir = path.resolve(baseDir, ".arca");
  const pointOfSale = Number(process.env.ARCA_WSFE_PTO_VTA) > 0 ? Number(process.env.ARCA_WSFE_PTO_VTA) : DEFAULT_WSFE_POINT_OF_SALE;
  const cuit = (process.env.ARCA_CUIT || "30718030648").replace(/\D/g, "");
  const cacheDir = process.env.ARCA_CACHE_DIR || path.resolve(baseDir, ".arca-cache");

  if (fileExists(path.join(dir, "wsfe-produccion"))) {
    const certPem = readPemFile(path.join(dir, "cert.pem"));
    const keyPem = readPemFile(path.join(dir, "key.pem"));
    if (!certPem || !keyPem) return { ok: false, reason: "Falta el certificado de ARCA en el servidor de producción." };
    return { ok: true, config: { certPem, keyPem, cuit, env: "produccion", cacheDir, pointOfSale } };
  }

  const certPem = readPemFile(path.join(dir, "homo", "cert.pem"));
  const keyPem = readPemFile(path.join(dir, "homo", "key.pem"));
  if (certPem && keyPem) {
    // WSASS emite el certificado de prueba a nombre de la persona que entra (16/9/2026: el de Santiago) y
    // la autoriza a facturar por su propio CUIT: en homologación se factura con el CUIT del certificado.
    const homoCuit = (process.env.ARCA_HOMO_CUIT || cuitFromCertificate(certPem) || cuit).replace(/\D/g, "");
    return { ok: true, config: { certPem, keyPem, cuit: homoCuit, env: "homologacion", cacheDir, pointOfSale } };
  }
  return {
    ok: false,
    reason: "En este ambiente todavía no está cargado el certificado de prueba de ARCA: la factura electrónica está apagada. Se puede registrar una factura hecha a mano en ARCA.",
  };
}

/** CUIT del campo serialNumber ("CUIT 20345986317") de un certificado de ARCA; null si no se puede leer. */
export function cuitFromCertificate(certPem: string): string | null {
  try {
    const cert = forge.pki.certificateFromPem(certPem);
    const attr = cert.subject.attributes.find((a) => a.type === "2.5.4.5");
    const match = String(attr?.value ?? "").match(/\d{11}/);
    return match ? match[0] : null;
  } catch {
    return null;
  }
}
