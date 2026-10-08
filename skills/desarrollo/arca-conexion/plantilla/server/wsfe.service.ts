import { arcaUrls, getWsfeConfig, type WsfeConfig } from "./arca.config";
import { getAccessTicket, invalidateAccessTicket } from "./arcaWsaa";
import { ArcaHttpError, soapPost } from "./arcaHttp";
import {
  buildCaeRequest,
  cbteTipoOf,
  describeArcaMessages,
  isTokenError,
  parseCaeResponse,
  parseCompConsultar,
  parseUltimoAutorizado,
  redactAuth,
  soapActionOf,
  soapEnvelope,
  soapFault,
  type ArcaMessage,
  type ComprobanteKind,
  type InvoiceLetter,
  type WsfeAuth,
  type WsfeComprobante,
} from "./wsfe.map";

/**
 * Emisión de comprobantes en ARCA (wsfe) · 16/9/2026.
 *
 * Reglas:
 * - Un comprobante a la vez por punto de venta + tipo (la numeración la lleva ARCA y es correlativa).
 * - Antes de pedir el CAE se compara el último número que tiene ARCA con el último que tiene el ERP:
 *   si ARCA tiene uno más nuevo, hubo un comprobante que el ERP no registró (un corte a mitad de camino)
 *   y NO se emite otro encima hasta revisarlo.
 * - Si ARCA no contesta, se consulta ese número: si quedó autorizado se usa; si no, se informa que no se emitió.
 * Errores con prefijo ARCA_* (el mensaje después de ":" es para la persona).
 */

export interface WsfeStatus {
  enabled: boolean;
  env: "produccion" | "homologacion" | null;
  pointOfSale: number | null;
  cuit: string | null;
  reason: string | null;
}

export interface WsfeEmission {
  env: "produccion" | "homologacion";
  pointOfSale: number;
  number: number;
  cbteTipo: number;
  cae: string;
  caeDueDate: string;
  observations: ArcaMessage[];
  /** Pedido sin token ni firma y respuesta cruda, como constancia. */
  requestXml: string;
  responseXml: string;
  recovered: boolean;
  emittedAt: string;
}

export type WsfeRequest = Omit<WsfeComprobante, "pointOfSale" | "number">;

const locks = new Map<string, Promise<unknown>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const previous = locks.get(key) || Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((r) => (release = r));
  const chained = previous.then(() => current);
  locks.set(key, chained);
  await previous.catch(() => undefined);
  try {
    return await fn();
  } finally {
    release();
    if (locks.get(key) === chained) locks.delete(key);
  }
}

function requireConfig(): WsfeConfig {
  const r = getWsfeConfig();
  if (!r.ok) throw new Error(`ARCA_NOT_CONFIGURED: ${r.reason}`);
  return r.config;
}

/** Llama a un método de wsfe. `build` arma el sobre con el ticket; si ARCA dice que el ticket no vale, pide otro y reintenta una vez. */
async function call(config: WsfeConfig, method: string, build: (auth: WsfeAuth) => string, timeoutMs?: number): Promise<{ xml: string; requestXml: string }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    let ticket;
    try {
      ticket = await getAccessTicket(config, "wsfe");
    } catch (e: any) {
      throw new Error(`ARCA_AUTH: No se pudo entrar a ARCA con el certificado (${e.message}).`);
    }
    const body = build({ token: ticket.token, sign: ticket.sign, cuit: config.cuit });
    const xml = await soapPost(arcaUrls(config.env).wsfe, soapActionOf(method), body, timeoutMs);
    const fault = soapFault(xml);
    if (fault) throw new Error(`ARCA_UNAVAILABLE: ARCA devolvió un error técnico (${fault}).`);
    if (attempt === 0 && isTokenError(parseUltimoAutorizado(xml).errors)) {
      await invalidateAccessTicket(config, "wsfe");
      continue;
    }
    return { xml, requestXml: redactAuth(body) };
  }
  throw new Error("ARCA_AUTH: ARCA rechazó el ticket de acceso dos veces seguidas.");
}

export const wsfeService = {
  status(): WsfeStatus {
    const r = getWsfeConfig();
    if (!r.ok) return { enabled: false, env: null, pointOfSale: null, cuit: null, reason: r.reason };
    return { enabled: true, env: r.config.env, pointOfSale: r.config.pointOfSale, cuit: r.config.cuit, reason: null };
  },

  async lastAuthorized(config: WsfeConfig, letter: InvoiceLetter, kind: ComprobanteKind): Promise<number> {
    const inner = `<ar:PtoVta>${config.pointOfSale}</ar:PtoVta><ar:CbteTipo>${cbteTipoOf(letter, kind)}</ar:CbteTipo>`;
    let xml: string;
    try {
      ({ xml } = await call(config, "FECompUltimoAutorizado", (auth) => soapEnvelope("FECompUltimoAutorizado", auth, inner), 20000));
    } catch (e: any) {
      if (e instanceof ArcaHttpError) throw new Error(`ARCA_UNAVAILABLE: ARCA no responde en este momento (${e.message}). No se emitió nada: probá de nuevo en unos minutos.`);
      throw e;
    }
    const { number, errors } = parseUltimoAutorizado(xml);
    if (number === null) {
      throw new Error(`ARCA_UNAVAILABLE: ARCA no informó el último número del punto de venta ${config.pointOfSale}${errors.length ? `: ${describeArcaMessages(errors)}` : ""}.`);
    }
    return number;
  },

  async consult(config: WsfeConfig, letter: InvoiceLetter, kind: ComprobanteKind, number: number) {
    const inner = `<ar:FeCompConsReq><ar:CbteTipo>${cbteTipoOf(letter, kind)}</ar:CbteTipo><ar:CbteNro>${number}</ar:CbteNro><ar:PtoVta>${config.pointOfSale}</ar:PtoVta></ar:FeCompConsReq>`;
    const { xml } = await call(config, "FECompConsultar", (auth) => soapEnvelope("FECompConsultar", auth, inner), 20000);
    return { ...parseCompConsultar(xml), xml };
  },

  /**
   * Pide el CAE del próximo comprobante. `erpLastNumber` = último número de ese tipo y punto de venta que tiene
   * registrado el ERP en este ambiente de ARCA (0 si ninguno).
   */
  async emit(req: WsfeRequest, erpLastNumber: number): Promise<WsfeEmission> {
    const config = requireConfig();
    const cbteTipo = cbteTipoOf(req.letter, req.kind);
    return withLock(`${config.env}-${config.pointOfSale}-${cbteTipo}`, async () => {
      const last = await wsfeService.lastAuthorized(config, req.letter, req.kind);
      const label = `${req.kind === "invoice" ? "Factura" : "Nota de crédito"} ${req.letter}`;
      const fmt = (n: number) => `${String(config.pointOfSale).padStart(4, "0")}-${String(n).padStart(8, "0")}`;
      if (last !== erpLastNumber) {
        throw new Error(
          last > erpLastNumber
            ? `ARCA_OUT_OF_SYNC: ARCA ya tiene la ${label} ${fmt(last)} y el ERP no la tiene registrada (puede haber quedado de un corte). No se emitió nada: hay que revisarla antes de emitir otra.`
            : `ARCA_OUT_OF_SYNC: El ERP tiene registrada la ${label} ${fmt(erpLastNumber)} pero ARCA dice que el último autorizado es el ${fmt(last)}. No se emitió nada: hay que revisarlo antes de emitir otra.`,
        );
      }
      const number = last + 1;
      const comprobante: WsfeComprobante = { ...req, pointOfSale: config.pointOfSale, number };
      const emittedAt = new Date().toISOString();

      let xml: string;
      let requestXml: string;
      try {
        ({ xml, requestXml } = await call(config, "FECAESolicitar", (auth) => buildCaeRequest(auth, comprobante), 45000));
      } catch (e: any) {
        if (!(e instanceof ArcaHttpError)) throw e;
        // No sabemos si llegó: se pregunta por ese número antes de dar nada por perdido.
        let check;
        try {
          check = await wsfeService.consult(config, req.letter, req.kind, number);
        } catch {
          throw new Error(`ARCA_UNCERTAIN: ARCA no respondió y no se pudo confirmar si la ${label} ${fmt(number)} quedó emitida. No la vuelvas a emitir: esperá unos minutos y avisá para revisarla.`);
        }
        if (check.found && check.cae && check.result === "A" && check.docNro === req.docNro && check.total !== null && Math.abs(check.total - req.total) < 0.01) {
          return {
            env: config.env, pointOfSale: config.pointOfSale, number, cbteTipo, cae: check.cae, caeDueDate: check.caeDueDate || req.issueDate,
            observations: [], requestXml: redactAuth(buildCaeRequest({ token: "", sign: "", cuit: config.cuit }, comprobante)), responseXml: check.xml, recovered: true, emittedAt,
          };
        }
        throw new Error(`ARCA_UNAVAILABLE: ARCA no respondió (${e.message}) y la ${label} no quedó emitida. Probá de nuevo en unos minutos.`);
      }

      const res = parseCaeResponse(xml);
      if (res.result !== "A" || !res.cae) {
        const detail = describeArcaMessages([...res.errors, ...res.observations]);
        throw new Error(`ARCA_REJECTED: ARCA rechazó la ${label}${detail ? `: ${detail}` : "."}`);
      }
      return {
        env: config.env,
        pointOfSale: config.pointOfSale,
        number: res.number || number,
        cbteTipo,
        cae: res.cae,
        caeDueDate: res.caeDueDate || req.issueDate,
        observations: res.observations,
        requestXml,
        responseXml: xml,
        recovered: false,
        emittedAt,
      };
    });
  },
};
