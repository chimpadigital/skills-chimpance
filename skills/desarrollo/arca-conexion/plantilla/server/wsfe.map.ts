import { escapeXml, xmlBlocks, xmlText } from "./arcaXml";

/**
 * Factura electrónica de ARCA (wsfe v1) · 16/9/2026. Funciones puras: arman el pedido FECAESolicitar y leen
 * las respuestas. Sin red ni base, para poder testearlas con respuestas reales.
 * Manual: https://www.arca.gob.ar/fe/documentos/manual-desarrollador-ARCA-COMPG-v4-0.pdf
 * Orden de los campos confirmado contra el WSDL de producción (el servicio es .NET y respeta la secuencia).
 */

export type InvoiceLetter = "A" | "B";
export type ComprobanteKind = "invoice" | "credit_note";

/** Código de comprobante de ARCA: 1 Factura A, 3 NC A, 6 Factura B, 8 NC B. */
export function cbteTipoOf(letter: InvoiceLetter, kind: ComprobanteKind): number {
  if (letter === "A") return kind === "invoice" ? 1 : 3;
  return kind === "invoice" ? 6 : 8;
}

/** Id de alícuota de ARCA (FEParamGetTiposIva): 3 = 0 %, 4 = 10,5 %, 5 = 21 %, 6 = 27 %. */
export const ARCA_IVA_ID: Record<string, number> = { "0": 3, "10.5": 4, "21": 5, "27": 6 };

export const CONCEPTO_SERVICIOS = 2;
export const DOC_TIPO_CUIT = 80;

/** "2026-09-16" → "20260916". */
export function toArcaDate(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`VALIDATION_DATE_INVALID: Fecha inválida para ARCA (${date})`);
  return date.replace(/-/g, "");
}

/** "20260926" → "2026-09-26"; null si no viene. */
export function fromArcaDate(raw: string | null | undefined): string | null {
  const v = (raw || "").trim();
  if (!/^\d{8}$/.test(v)) return null;
  return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
}

const money = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

/** Primer y último día del mes de la fecha: el período facturado por defecto de un servicio. */
export function monthServicePeriod(date: string): { from: string; to: string } {
  const [y, m] = date.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const mm = String(m).padStart(2, "0");
  return { from: `${y}-${mm}-01`, to: `${y}-${mm}-${String(last).padStart(2, "0")}` };
}

export interface WsfeAuth {
  token: string;
  sign: string;
  cuit: string;
}

export interface WsfeComprobante {
  letter: InvoiceLetter;
  kind: ComprobanteKind;
  pointOfSale: number;
  number: number;
  /** CUIT del cliente, 11 dígitos. */
  docNro: string;
  /** Condición frente al IVA del receptor (tabla de ARCA, RG 5616). */
  receptorConditionId: number;
  issueDate: string;
  serviceFrom: string;
  serviceTo: string;
  paymentDueDate: string;
  /** Importes en PESOS. total = net + iva. */
  net: number;
  ivaRate: number;
  iva: number;
  total: number;
  /** Nota de crédito: la factura que corrige. */
  associated?: { letter: InvoiceLetter; pointOfSale: number; number: number; issueDate: string; cuit: string } | null;
}

function authXml(auth: WsfeAuth): string {
  return `<ar:Auth><ar:Token>${escapeXml(auth.token)}</ar:Token><ar:Sign>${escapeXml(auth.sign)}</ar:Sign><ar:Cuit>${auth.cuit}</ar:Cuit></ar:Auth>`;
}

export function soapEnvelope(method: string, auth: WsfeAuth, inner = ""): string {
  return (
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">` +
    `<soap:Body><ar:${method}>${authXml(auth)}${inner}</ar:${method}></soap:Body></soap:Envelope>`
  );
}

export const soapActionOf = (method: string) => `http://ar.gov.afip.dif.FEV1/${method}`;

/** Detalle del comprobante (FECAEDetRequest), sin el Auth. */
export function buildDetalle(c: WsfeComprobante): string {
  const exento = c.ivaRate === 0;
  const ivaId = ARCA_IVA_ID[String(c.ivaRate)];
  if (!exento && !ivaId) throw new Error(`VALIDATION_IVA_RATE_INVALID: ARCA no tiene la alícuota ${c.ivaRate} %`);
  const parts = [
    `<ar:Concepto>${CONCEPTO_SERVICIOS}</ar:Concepto>`,
    `<ar:DocTipo>${DOC_TIPO_CUIT}</ar:DocTipo>`,
    `<ar:DocNro>${c.docNro}</ar:DocNro>`,
    `<ar:CbteDesde>${c.number}</ar:CbteDesde>`,
    `<ar:CbteHasta>${c.number}</ar:CbteHasta>`,
    `<ar:CbteFch>${toArcaDate(c.issueDate)}</ar:CbteFch>`,
    `<ar:ImpTotal>${money(c.total)}</ar:ImpTotal>`,
    `<ar:ImpTotConc>0.00</ar:ImpTotConc>`,
    // "Exento · sin IVA" del ERP = operación exenta: va en ImpOpEx y sin detalle de alícuotas.
    `<ar:ImpNeto>${exento ? "0.00" : money(c.net)}</ar:ImpNeto>`,
    `<ar:ImpOpEx>${exento ? money(c.net) : "0.00"}</ar:ImpOpEx>`,
    `<ar:ImpTrib>0.00</ar:ImpTrib>`,
    `<ar:ImpIVA>${money(c.iva)}</ar:ImpIVA>`,
    `<ar:FchServDesde>${toArcaDate(c.serviceFrom)}</ar:FchServDesde>`,
    `<ar:FchServHasta>${toArcaDate(c.serviceTo)}</ar:FchServHasta>`,
    `<ar:FchVtoPago>${toArcaDate(c.paymentDueDate)}</ar:FchVtoPago>`,
    `<ar:MonId>PES</ar:MonId>`,
    `<ar:MonCotiz>1</ar:MonCotiz>`,
    `<ar:CondicionIVAReceptorId>${c.receptorConditionId}</ar:CondicionIVAReceptorId>`,
  ];
  if (c.associated) {
    parts.push(
      `<ar:CbtesAsoc><ar:CbteAsoc>` +
        `<ar:Tipo>${cbteTipoOf(c.associated.letter, "invoice")}</ar:Tipo>` +
        `<ar:PtoVta>${c.associated.pointOfSale}</ar:PtoVta>` +
        `<ar:Nro>${c.associated.number}</ar:Nro>` +
        `<ar:Cuit>${c.associated.cuit}</ar:Cuit>` +
        `<ar:CbteFch>${toArcaDate(c.associated.issueDate)}</ar:CbteFch>` +
        `</ar:CbteAsoc></ar:CbtesAsoc>`,
    );
  }
  if (!exento) {
    parts.push(`<ar:Iva><ar:AlicIva><ar:Id>${ivaId}</ar:Id><ar:BaseImp>${money(c.net)}</ar:BaseImp><ar:Importe>${money(c.iva)}</ar:Importe></ar:AlicIva></ar:Iva>`);
  }
  return parts.join("");
}

export function buildCaeRequest(auth: WsfeAuth, c: WsfeComprobante): string {
  const inner =
    `<ar:FeCAEReq><ar:FeCabReq><ar:CantReg>1</ar:CantReg><ar:PtoVta>${c.pointOfSale}</ar:PtoVta>` +
    `<ar:CbteTipo>${cbteTipoOf(c.letter, c.kind)}</ar:CbteTipo></ar:FeCabReq>` +
    `<ar:FeDetReq><ar:FECAEDetRequest>${buildDetalle(c)}</ar:FECAEDetRequest></ar:FeDetReq></ar:FeCAEReq>`;
  return soapEnvelope("FECAESolicitar", auth, inner);
}

export interface ArcaMessage {
  code: string;
  msg: string;
}

function messages(xml: string, container: string, item: string): ArcaMessage[] {
  const [block] = xmlBlocks(xml, container);
  if (!block) return [];
  return xmlBlocks(block, item).map((b) => ({ code: xmlText(b, "Code") || "", msg: xmlText(b, "Msg") || "" }));
}

/** Error SOAP (faultstring) o errores de negocio de ARCA (Errors/Err). */
export function soapFault(xml: string): string | null {
  return xmlText(xml, "faultstring");
}

export interface CaeResponse {
  /** A = aprobado, R = rechazado, P = parcial (no aplica con un solo comprobante). */
  result: "A" | "R" | "P" | null;
  cae: string | null;
  caeDueDate: string | null;
  number: number | null;
  observations: ArcaMessage[];
  errors: ArcaMessage[];
  events: ArcaMessage[];
}

export function parseCaeResponse(xml: string): CaeResponse {
  const [det] = xmlBlocks(xml, "FECAEDetResponse");
  const [cab] = xmlBlocks(xml, "FeCabResp");
  const result = (xmlText(det || "", "Resultado") || xmlText(cab || "", "Resultado")) as CaeResponse["result"];
  const cae = det ? xmlText(det, "CAE") : null;
  const desde = det ? Number(xmlText(det, "CbteDesde")) : NaN;
  return {
    result: result === "A" || result === "R" || result === "P" ? result : null,
    cae: cae && /^\d+$/.test(cae) ? cae : null,
    caeDueDate: det ? fromArcaDate(xmlText(det, "CAEFchVto")) : null,
    number: Number.isFinite(desde) && desde > 0 ? desde : null,
    observations: det ? messages(det, "Observaciones", "Obs") : [],
    errors: messages(xml, "Errors", "Err"),
    events: messages(xml, "Events", "Evt"),
  };
}

export function parseUltimoAutorizado(xml: string): { number: number | null; errors: ArcaMessage[] } {
  const errors = messages(xml, "Errors", "Err");
  const raw = xmlText(xml, "CbteNro");
  const n = raw === null ? NaN : Number(raw);
  return { number: Number.isFinite(n) && n >= 0 ? n : null, errors };
}

export interface ComprobanteConsultado {
  found: boolean;
  result: string | null;
  cae: string | null;
  caeDueDate: string | null;
  total: number | null;
  docNro: string | null;
  issueDate: string | null;
  errors: ArcaMessage[];
}

export function parseCompConsultar(xml: string): ComprobanteConsultado {
  const errors = messages(xml, "Errors", "Err");
  const [get] = xmlBlocks(xml, "ResultGet");
  if (!get) return { found: false, result: null, cae: null, caeDueDate: null, total: null, docNro: null, issueDate: null, errors };
  const total = Number(xmlText(get, "ImpTotal"));
  return {
    found: true,
    result: xmlText(get, "Resultado"),
    cae: xmlText(get, "CodAutorizacion"),
    caeDueDate: fromArcaDate(xmlText(get, "FchVto")),
    total: Number.isFinite(total) ? total : null,
    docNro: xmlText(get, "DocNro"),
    issueDate: fromArcaDate(xmlText(get, "CbteFch")),
    errors,
  };
}

/** Código 600: el ticket de acceso ya no vale (vencido o revocado). Se pide otro y se reintenta una vez. */
export const isTokenError = (errors: ArcaMessage[]) => errors.some((e) => e.code === "600" || (/token|sign/i.test(e.msg) && /valid/i.test(e.msg)));

/** Mensaje para una persona a partir de lo que devolvió ARCA. */
export function describeArcaMessages(list: ArcaMessage[]): string {
  return list
    .filter((m) => m.msg)
    .map((m) => `${m.msg.replace(/\s+/g, " ").trim()}${m.code ? ` (código ${m.code})` : ""}`)
    .join(" · ");
}

/**
 * URL del código QR obligatorio (RG 4892/2020): JSON en base64 con los datos del comprobante.
 * https://www.arca.gob.ar/fe/qr/especificaciones.asp
 */
export function buildQrUrl(p: {
  issueDate: string;
  cuit: string;
  pointOfSale: number;
  cbteTipo: number;
  number: number;
  total: number;
  docNro: string;
  cae: string;
}): string {
  const payload = {
    ver: 1,
    fecha: p.issueDate,
    cuit: Number(p.cuit),
    ptoVta: p.pointOfSale,
    tipoCmp: p.cbteTipo,
    nroCmp: p.number,
    importe: Math.round(p.total * 100) / 100,
    moneda: "PES",
    ctz: 1,
    tipoDocRec: DOC_TIPO_CUIT,
    nroDocRec: Number(p.docNro),
    tipoCodAut: "E",
    codAut: Number(p.cae),
  };
  return `https://www.afip.gob.ar/fe/qr/?p=${Buffer.from(JSON.stringify(payload), "utf8").toString("base64")}`;
}

/** El pedido sin token ni firma, para guardarlo como constancia sin dejar credenciales en la base. */
export function redactAuth(xml: string): string {
  return xml.replace(/<ar:Token>[\s\S]*?<\/ar:Token>/, "<ar:Token>…</ar:Token>").replace(/<ar:Sign>[\s\S]*?<\/ar:Sign>/, "<ar:Sign>…</ar:Sign>");
}
