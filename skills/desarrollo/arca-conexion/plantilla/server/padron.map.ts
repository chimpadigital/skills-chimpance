import { xmlBlocks, xmlText, xmlTexts } from "./arcaXml";

/** Condición fiscal en los valores del enum `fiscal_condition` de shared/schema.ts. */
export type FiscalCondition = "responsable_inscripto" | "monotributista" | "exento" | "consumidor_final";

export interface CuitInfo {
  cuit: string;
  razonSocial: string;
  tipoPersona: "fisica" | "juridica" | null;
  estadoClave: string | null;
  fiscalCondition: FiscalCondition | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  activities: { code: string; description: string }[];
  /** Avisos de ARCA que no impiden usar los datos (p. ej. "Domicilio Incompleto"). */
  warnings: string[];
  source: "arca" | "cuitonline";
  fetchedAt: string;
}

export type PadronResult = { ok: true; data: CuitInfo } | { ok: false; notFound: boolean; error: string };

// Códigos de impuesto del padrón de ARCA.
const IMPUESTO_IVA = "30";
const IMPUESTO_IVA_EXENTO = "32";

function activeTaxIds(block: string): Set<string> {
  const ids = new Set<string>();
  for (const imp of xmlBlocks(block, "impuesto")) {
    const id = xmlText(imp, "idImpuesto");
    const estado = xmlText(imp, "estadoImpuesto");
    if (id && (!estado || estado === "AC")) ids.add(id);
  }
  return ids;
}

export function deriveFiscalCondition(xml: string, tipoPersona: CuitInfo["tipoPersona"]): FiscalCondition | null {
  const [mono] = xmlBlocks(xml, "datosMonotributo");
  if (mono && mono.trim()) return "monotributista";
  const [general] = xmlBlocks(xml, "datosRegimenGeneral");
  const taxes = general ? activeTaxIds(general) : new Set<string>();
  if (taxes.has(IMPUESTO_IVA)) return "responsable_inscripto";
  if (taxes.has(IMPUESTO_IVA_EXENTO)) return "exento";
  // Persona humana sin IVA ni monotributo: a efectos de facturarle, consumidor final.
  // Una sociedad sin IVA es un caso raro: se deja para que lo elija una persona.
  return tipoPersona === "fisica" ? "consumidor_final" : null;
}

/** Traduce la respuesta de getPersona_v2 (ws_sr_constancia_inscripcion) a los campos del ERP. */
export function parsePadronResponse(xml: string, cuit: string, now = new Date()): PadronResult {
  const fault = xmlText(xml, "faultstring");
  if (fault) {
    const notFound = /no existe/i.test(fault);
    return { ok: false, notFound, error: notFound ? "El CUIT no existe en el padrón de ARCA" : `ARCA: ${fault}` };
  }

  const [general] = xmlBlocks(xml, "datosGenerales");
  const [errorConstancia] = xmlBlocks(xml, "errorConstancia");
  const warnings = errorConstancia ? xmlTexts(errorConstancia, "error") : [];

  if (!general) {
    // ARCA no emite la constancia (datos incompletos, clave inactiva, …) pero a veces devuelve el nombre.
    const nombre = errorConstancia
      ? [xmlText(errorConstancia, "apellido"), xmlText(errorConstancia, "nombre")].filter(Boolean).join(" ")
      : "";
    if (!nombre) {
      return { ok: false, notFound: warnings.length === 0, error: warnings[0] ? `ARCA: ${warnings.join(" · ")}` : "CUIT no encontrado en ARCA" };
    }
    return {
      ok: true,
      data: {
        cuit, razonSocial: nombre, tipoPersona: null, estadoClave: null, fiscalCondition: null,
        address: null, city: null, province: null, postalCode: null, activities: [], warnings,
        source: "arca", fetchedAt: now.toISOString(),
      },
    };
  }

  const tipo = xmlText(general, "tipoPersona");
  const tipoPersona = tipo === "JURIDICA" ? "juridica" : tipo === "FISICA" ? "fisica" : null;
  const razonSocial =
    xmlText(general, "razonSocial") ||
    [xmlText(general, "apellido"), xmlText(general, "nombre")].filter(Boolean).join(" ");

  const [dom] = xmlBlocks(general, "domicilioFiscal");
  const province = dom ? xmlText(dom, "descripcionProvincia") : null;

  const [regimen] = xmlBlocks(xml, "datosRegimenGeneral");
  const [mono] = xmlBlocks(xml, "datosMonotributo");
  const actividades = [...xmlBlocks(regimen || "", "actividad"), ...xmlBlocks(mono || "", "actividadMonotributista")]
    .map((a) => ({
      code: xmlText(a, "idActividad") || "",
      description: xmlText(a, "descripcionActividad") || "",
      order: Number(xmlText(a, "orden") || 99),
    }))
    .filter((a) => a.description)
    .sort((a, b) => a.order - b.order)
    .map(({ code, description }) => ({ code, description }));

  return {
    ok: true,
    data: {
      cuit,
      razonSocial,
      tipoPersona,
      estadoClave: xmlText(general, "estadoClave"),
      fiscalCondition: deriveFiscalCondition(xml, tipoPersona),
      address: dom ? xmlText(dom, "direccion") : null,
      // En CABA ARCA no manda localidad: la provincia ya es la ciudad.
      city: dom ? xmlText(dom, "localidad") || province : null,
      province,
      postalCode: dom ? xmlText(dom, "codPostal") : null,
      activities: actividades,
      warnings,
      source: "arca",
      fetchedAt: now.toISOString(),
    },
  };
}
