import { getArcaConfig, arcaUrls } from "./arca.config";
import { getAccessTicket, ArcaAuthError } from "./arcaWsaa";
import { escapeXml } from "./arcaXml";
import { parsePadronResponse, type CuitInfo } from "./padron.map";

export type CuitLookupResult = { ok: true; data: CuitInfo } | { ok: false; error: string };

const PADRON_SERVICE = "ws_sr_constancia_inscripcion";

/** Dígito verificador del CUIT (módulo 11). Evita gastar una consulta en un CUIT mal tipeado. */
export function isValidCuit(cuit: string): boolean {
  if (!/^\d{11}$/.test(cuit)) return false;
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((acc, w, i) => acc + w * Number(cuit[i]), 0);
  const mod = 11 - (sum % 11);
  const dv = mod === 11 ? 0 : mod === 10 ? 9 : mod;
  return dv === Number(cuit[10]);
}

async function lookupArca(cuit: string): Promise<CuitLookupResult | null> {
  const config = getArcaConfig();
  if (!config) return null;
  const ta = await getAccessTicket(config, PADRON_SERVICE);
  const body =
    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:a5="http://a5.soap.ws.server.puc.sr/">` +
    `<soapenv:Header/><soapenv:Body><a5:getPersona_v2>` +
    `<token>${escapeXml(ta.token)}</token><sign>${escapeXml(ta.sign)}</sign>` +
    `<cuitRepresentada>${config.cuit}</cuitRepresentada><idPersona>${cuit}</idPersona>` +
    `</a5:getPersona_v2></soapenv:Body></soapenv:Envelope>`;
  const res = await fetch(arcaUrls(config.env).padronA5, {
    method: "POST",
    headers: { "Content-Type": "text/xml; charset=utf-8", SOAPAction: '""' },
    body,
    signal: AbortSignal.timeout(15000),
  });
  const parsed = parsePadronResponse(await res.text(), cuit);
  if (parsed.ok) return parsed;
  // "No existe" es una respuesta definitiva; cualquier otro error deja probar el respaldo.
  if (parsed.notFound) return { ok: false, error: parsed.error };
  throw new Error(parsed.error);
}

/** Respaldo sin certificado: CuitOnline solo da el nombre y el tipo de persona. */
async function lookupCuitOnline(cuit: string): Promise<CuitLookupResult> {
  const response = await fetch(`https://www.cuitonline.com/detalle/${cuit}/x.html`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(10000),
  });
  const html = await response.text();
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || "";
  if (!title || title.includes("ERROR 404") || title.toLowerCase().includes("error")) {
    return { ok: false, error: "CUIT no encontrado" };
  }
  const razonSocial = title.includes(" (") ? title.substring(0, title.indexOf(" (")).trim() : title.split(",")[0].trim();
  const description = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i)?.[1] || "";
  const tipoPersona = description.includes("Persona Jurídica") ? "juridica" : description.includes("Persona Física") ? "fisica" : null;
  return {
    ok: true,
    data: {
      cuit, razonSocial, tipoPersona, estadoClave: null, fiscalCondition: null,
      address: null, city: null, province: null, postalCode: null, activities: [],
      warnings: ["ARCA no disponible: solo se trajo el nombre"], source: "cuitonline", fetchedAt: new Date().toISOString(),
    },
  };
}

export async function lookupCuit(rawCuit: string): Promise<CuitLookupResult> {
  const cuit = rawCuit.replace(/\D/g, "");
  if (cuit.length !== 11) return { ok: false, error: "El CUIT debe tener 11 dígitos" };
  if (!isValidCuit(cuit)) return { ok: false, error: "El CUIT no es válido (revisá el dígito verificador)" };

  try {
    const fromArca = await lookupArca(cuit);
    if (fromArca) return fromArca;
  } catch (e) {
    const msg = e instanceof ArcaAuthError ? `${e.code}: ${e.message}` : (e as Error).message;
    console.error(`[arca] padrón falló para ${cuit}, se usa el respaldo:`, msg);
  }

  try {
    return await lookupCuitOnline(cuit);
  } catch (e) {
    return { ok: false, error: (e as Error).name === "TimeoutError" ? "Timeout al consultar el CUIT" : "Error al consultar el CUIT" };
  }
}
