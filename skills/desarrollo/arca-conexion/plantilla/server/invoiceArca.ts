import { db } from "../../lib/db/index";
import { invoices, auditLog } from "@shared/schema";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import {
  ARCA_RECEPTOR_CONDITION,
  FISCAL_CONDITION_LABEL,
  computeInvoiceAmounts,
  round2,
  saleInvoiceTypeMismatch,
  type FiscalCondition,
  type InvoiceType,
} from "@shared/fiscal";
import { wsfeService, type WsfeEmission } from "../domains/integrations/arca/wsfe.service";
import { cbteTipoOf, monthServicePeriod, type InvoiceLetter } from "../domains/integrations/arca/wsfe.map";
import { isValidCuit } from "../domains/integrations/arca/cuitLookup.service";
import { todayAR } from "../lib/dates";
import { resolveOwnerForIssuer } from "./iva";

/**
 * Factura electrónica desde el ERP (16/9/2026). Decisiones de Santiago:
 * - Se emite en PESOS: las cuentas en USD / USD BNA se convierten con la cotización BNA venta que el ERP congela al facturar.
 * - Solo ventas A y B de Chimpancé (el certificado es de su CUIT). La E (exportación) usa otro servicio de ARCA (wsfex):
 *   por ahora se hace en ARCA y se registra a mano.
 * - Concepto "Servicios": período facturado (por defecto el mes de la fecha) y vencimiento del pago.
 * La constancia (pedido sin credenciales + respuesta) queda en invoices.arca_data.
 */

export interface ArcaInvoiceData {
  cbteTipo: number;
  /** CUIT con el que se pidió el CAE (en homologación puede ser el del certificado de prueba). */
  issuerCuit?: string;
  receptor: { cuit: string; razonSocial: string; condicionIvaId: number; condicionIva: string; domicilio: string | null };
  itemDescription: string;
  serviceFrom: string;
  serviceTo: string;
  paymentDueDate: string;
  amountsArs: { net: number; ivaRate: number; iva: number; total: number };
  /** Cuentas en dólares: de qué monto y cotización salen los pesos. */
  fx: { currency: string; rate: number; totalOriginal: number } | null;
  /** Nota de crédito: la factura que corrige. */
  associated?: { invoiceId: number; letter: InvoiceLetter; pointOfSale: number; number: number; issueDate: string } | null;
  observations: { code: string; msg: string }[];
  recovered: boolean;
  emittedAt: string;
  requestXml: string;
  responseXml: string;
}

export interface ArcaResult {
  emission: WsfeEmission;
  data: ArcaInvoiceData;
}

const addDays = (date: string, days: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const fmtDate = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;

export const formatArcaNumber = (pointOfSale: number, number: number) =>
  `${String(pointOfSale).padStart(4, "0")}-${String(number).padStart(8, "0")}`;

function assertIssueDateWindow(issueDate: string) {
  // ARCA acepta servicios con fecha hasta 10 días antes o después del día en que se pide el CAE.
  const today = todayAR();
  if (issueDate < addDays(today, -10) || issueDate > addDays(today, 10)) {
    throw new Error(`VALIDATION_ARCA_DATE_WINDOW: ARCA solo acepta facturas de servicios con fecha entre el ${fmtDate(addDays(today, -10))} y el ${fmtDate(addDays(today, 10))}.`);
  }
}

async function assertChimpanceIssuer(issuerCompanyId: number) {
  const owner = await resolveOwnerForIssuer(issuerCompanyId);
  if (owner !== "chimpance") {
    throw new Error("VALIDATION_ARCA_ISSUER: La factura electrónica por ahora sale solo de Chimpancé (el certificado de ARCA es de su CUIT). Para QueVibra, hacela en ARCA y registrala.");
  }
}

function assertStatusEnabled() {
  const status = wsfeService.status();
  if (!status.enabled) throw new Error(`ARCA_NOT_CONFIGURED: ${status.reason}`);
  return status;
}

/** Último número que el ERP tiene de ese comprobante en el punto de venta (los emitidos en este ambiente de ARCA y los cargados a mano). */
async function erpLastNumber(p: { issuerCompanyId: number; invoiceType: InvoiceType; kind: "invoice" | "credit_note"; pointOfSale: number; env: string }): Promise<number> {
  const [row] = await db.select({ max: sql<number | null>`max(${invoices.fiscalNumber})` }).from(invoices).where(and(
    eq(invoices.direction, "sale"),
    eq(invoices.issuerCompanyId, p.issuerCompanyId),
    eq(invoices.invoiceType, p.invoiceType),
    eq(invoices.kind, p.kind),
    eq(invoices.pointOfSale, p.pointOfSale),
    or(eq(invoices.arcaEnv, p.env), isNull(invoices.arcaEnv)),
  ));
  return Number(row?.max || 0);
}

function receptorOf(company: any, invoiceType: InvoiceType) {
  const cuit = String(company.cuit || "").replace(/\D/g, "");
  const name = company.tradeName || company.legalName;
  if (!isValidCuit(cuit)) throw new Error(`VALIDATION_ARCA_CUIT: El CUIT de ${name} no es válido. Corregilo en la ficha de la empresa antes de facturar.`);
  const condition = company.fiscalCondition as FiscalCondition | null;
  const conditionId = condition ? ARCA_RECEPTOR_CONDITION[condition] : null;
  if (!condition || !conditionId) {
    throw new Error(`VALIDATION_ARCA_CONDITION: ${name} no tiene una condición frente al IVA que ARCA acepte. Cargala en la ficha de la empresa (Responsable Inscripto, Monotributo, Exento o Consumidor Final).`);
  }
  const mismatch = saleInvoiceTypeMismatch(invoiceType, condition, company.country);
  if (mismatch) throw new Error(`VALIDATION_ARCA_INVOICE_TYPE: ${mismatch}`);
  const publicData = (company.afipPublicData || {}) as { razonSocial?: string };
  return {
    cuit,
    razonSocial: publicData.razonSocial || company.legalName,
    condicionIvaId: conditionId,
    condicionIva: FISCAL_CONDITION_LABEL[condition],
    domicilio: [company.address, company.city, company.province].filter(Boolean).join(", ") || null,
  };
}

/** Pesos que van a ARCA. Con una cuenta en dólares, el neto se pasa a pesos y el IVA se calcula sobre ese neto. */
function amountsInPesos(net: number, invoiceType: InvoiceType, ivaRate: number, fxRate: number | null) {
  const netArs = fxRate ? round2(net * fxRate) : net;
  return computeInvoiceAmounts({ net: netArs, invoiceType, ivaRate });
}

/** Deja rastro si ARCA autorizó y el ERP no pudo guardar: sin esto la factura existiría solo en ARCA. */
export async function recordUnsavedEmission(r: ArcaResult, error: unknown, userId?: string | null): Promise<never> {
  const message = error instanceof Error ? error.message : String(error);
  const { requestXml, responseXml, ...data } = r.data;
  console.error("[arca] comprobante AUTORIZADO en ARCA pero NO guardado en el ERP", { env: r.emission.env, pointOfSale: r.emission.pointOfSale, number: r.emission.number, cbteTipo: r.emission.cbteTipo, cae: r.emission.cae, message });
  try {
    await db.insert(auditLog).values({
      entityType: "invoice",
      entityId: 0,
      action: "arca_authorized_not_saved",
      details: { ...data, env: r.emission.env, pointOfSale: r.emission.pointOfSale, number: r.emission.number, cae: r.emission.cae, caeDueDate: r.emission.caeDueDate, error: message, responseXml },
      userId: userId || null,
    });
  } catch (e) {
    console.error("[arca] tampoco se pudo guardar el aviso en audit_log:", (e as Error).message);
  }
  const label = r.data.associated ? "nota de crédito" : "factura";
  throw new Error(`ARCA_NOT_SAVED: ARCA autorizó la ${label} ${formatArcaNumber(r.emission.pointOfSale, r.emission.number)} (CAE ${r.emission.cae}) pero el ERP no pudo guardarla (${message.replace(/^[A-Z_]+:\s*/, "")}). No la vuelvas a emitir: avisá para cargarla.`);
}

export const invoiceArca = {
  status: () => wsfeService.status(),

  /** Factura de venta A o B: valida todo lo que ARCA va a revisar y pide el CAE. */
  async emitSale(p: {
    issuerCompanyId: number;
    company: any;
    invoiceType: InvoiceType;
    issueDate: string;
    currency: string;
    /** Neto en la moneda de la cuenta. */
    net: number;
    ivaRate: number;
    /** Cotización BNA venta congelada (cuentas en dólares); null en pesos. */
    fxRate: number | null;
    totalOriginal: number;
    itemDescription?: string | null;
    serviceFrom?: string | null;
    serviceTo?: string | null;
    paymentDueDate?: string | null;
    /** Vencimiento de la cuenta que se factura, para proponer el del pago. */
    linkedDueDate?: string | null;
  }): Promise<ArcaResult> {
    const status = assertStatusEnabled();
    if (p.invoiceType !== "A" && p.invoiceType !== "B") {
      throw new Error("VALIDATION_ARCA_INVOICE_TYPE: La factura E (exportación) todavía no se emite desde el ERP: hacela en ARCA y registrala acá.");
    }
    await assertChimpanceIssuer(p.issuerCompanyId);
    const receptor = receptorOf(p.company, p.invoiceType);
    assertIssueDateWindow(p.issueDate);

    const period = monthServicePeriod(p.issueDate);
    const serviceFrom = p.serviceFrom || period.from;
    const serviceTo = p.serviceTo || period.to;
    if (serviceTo < serviceFrom) throw new Error("VALIDATION_ARCA_SERVICE_PERIOD: El período facturado termina antes de empezar.");
    const suggestedDue = p.linkedDueDate && p.linkedDueDate > p.issueDate ? p.linkedDueDate : p.issueDate;
    const paymentDueDate = p.paymentDueDate || suggestedDue;
    if (paymentDueDate < p.issueDate) throw new Error("VALIDATION_ARCA_PAYMENT_DUE: El vencimiento del pago no puede ser anterior a la fecha de la factura.");

    const itemDescription = (p.itemDescription || "").trim();
    if (!itemDescription) throw new Error("VALIDATION_ARCA_DESCRIPTION: Escribí el detalle que va en la factura (qué servicio se factura).");

    const amounts = amountsInPesos(p.net, p.invoiceType, p.ivaRate, p.fxRate);
    const letter = p.invoiceType as InvoiceLetter;
    const last = await erpLastNumber({ issuerCompanyId: p.issuerCompanyId, invoiceType: p.invoiceType, kind: "invoice", pointOfSale: status.pointOfSale!, env: status.env! });

    const emission = await wsfeService.emit({
      letter,
      kind: "invoice",
      docNro: receptor.cuit,
      receptorConditionId: receptor.condicionIvaId,
      issueDate: p.issueDate,
      serviceFrom,
      serviceTo,
      paymentDueDate,
      net: amounts.net,
      ivaRate: amounts.ivaRate,
      iva: amounts.iva,
      total: amounts.total,
    }, last);

    return {
      emission,
      data: {
        cbteTipo: cbteTipoOf(letter, "invoice"),
        issuerCuit: status.cuit!,
        receptor,
        itemDescription: itemDescription.slice(0, 500),
        serviceFrom,
        serviceTo,
        paymentDueDate,
        amountsArs: amounts,
        fx: p.fxRate ? { currency: p.currency, rate: p.fxRate, totalOriginal: p.totalOriginal } : null,
        associated: null,
        observations: emission.observations,
        recovered: emission.recovered,
        emittedAt: emission.emittedAt,
        requestXml: emission.requestXml,
        responseXml: emission.responseXml,
      },
    };
  },

  /** Nota de crédito sobre una factura que salió por ARCA: también sale por ARCA, asociada a la factura. */
  async emitCreditNote(p: { invoice: any; issueDate: string; net: number; totalOriginal: number; reason: string }): Promise<ArcaResult> {
    const status = assertStatusEnabled();
    const inv = p.invoice;
    const original = inv.arcaData as ArcaInvoiceData | null;
    if (!original || !inv.cae) throw new Error("VALIDATION_ARCA_CREDIT_NOTE: La factura no salió por ARCA.");
    if (inv.arcaEnv !== status.env) {
      throw new Error(`ARCA_NOT_CONFIGURED: La factura se emitió en el ambiente ${inv.arcaEnv === "homologacion" ? "de prueba" : "real"} de ARCA y este servidor emite en el ${status.env === "homologacion" ? "de prueba" : "real"}: la nota de crédito no se puede asociar.`);
    }
    if (inv.pointOfSale !== status.pointOfSale) {
      throw new Error(`ARCA_NOT_CONFIGURED: La factura salió por el punto de venta ${inv.pointOfSale} y hoy el ERP emite por el ${status.pointOfSale}.`);
    }
    assertIssueDateWindow(p.issueDate);
    const type = inv.invoiceType as InvoiceType;
    const letter = type as InvoiceLetter;

    // Nota de crédito total: los mismos pesos que la factura (sin redondeos distintos). Parcial: el neto a la cotización de la factura.
    const isFull = Math.abs(p.net - parseFloat(inv.netAmount)) < 0.005;
    const fxRate = original.fx?.rate ?? null;
    const amounts = isFull ? original.amountsArs : amountsInPesos(p.net, type, parseFloat(inv.ivaRate), fxRate);

    const last = await erpLastNumber({ issuerCompanyId: inv.issuerCompanyId, invoiceType: type, kind: "credit_note", pointOfSale: status.pointOfSale!, env: status.env! });
    const associated = { invoiceId: inv.id, letter, pointOfSale: inv.pointOfSale, number: inv.fiscalNumber, issueDate: inv.issueDate };

    const emission = await wsfeService.emit({
      letter,
      kind: "credit_note",
      docNro: original.receptor.cuit,
      receptorConditionId: original.receptor.condicionIvaId,
      issueDate: p.issueDate,
      serviceFrom: original.serviceFrom,
      serviceTo: original.serviceTo,
      paymentDueDate: p.issueDate,
      net: amounts.net,
      ivaRate: amounts.ivaRate,
      iva: amounts.iva,
      total: amounts.total,
      associated: { letter, pointOfSale: inv.pointOfSale, number: inv.fiscalNumber, issueDate: inv.issueDate, cuit: status.cuit! },
    }, last);

    return {
      emission,
      data: {
        cbteTipo: cbteTipoOf(letter, "credit_note"),
        issuerCuit: status.cuit!,
        receptor: original.receptor,
        itemDescription: `Nota de crédito sobre la Factura ${type} ${formatArcaNumber(inv.pointOfSale, inv.fiscalNumber)}: ${p.reason.trim()}`.slice(0, 500),
        serviceFrom: original.serviceFrom,
        serviceTo: original.serviceTo,
        paymentDueDate: p.issueDate,
        amountsArs: amounts,
        fx: fxRate ? { currency: inv.currency, rate: fxRate, totalOriginal: p.totalOriginal } : null,
        associated,
        observations: emission.observations,
        recovered: emission.recovered,
        emittedAt: emission.emittedAt,
        requestXml: emission.requestXml,
        responseXml: emission.responseXml,
      },
    };
  },
};
