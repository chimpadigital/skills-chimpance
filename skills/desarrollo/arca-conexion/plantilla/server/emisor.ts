/**
 * Datos fiscales del emisor que van impresos en la factura (RG 1415). Son fijos por CUIT: no hace falta
 * pantalla para editarlos. Domicilio y razón social salen del padrón de ARCA (consulta del 12/9/2026).
 * Ingresos Brutos e inicio de actividades: del encabezado de una factura de Comprobantes en línea (Factura B 0001-00000117, 16/9/2026).
 */
export interface EmisorFiscal {
  razonSocial: string;
  cuit: string;
  domicilio: string;
  condicionIva: string;
  iibb: string | null;
  /** YYYY-MM-DD */
  inicioActividades: string | null;
}

const EMISORES: Record<string, EmisorFiscal> = {
  "30718030648": {
    razonSocial: "CHIMPANCE DIGITAL S.A.S.",
    cuit: "30718030648",
    domicilio: "Doering Adolfo 6518, Barrio Silvano Funes, Córdoba (5021)",
    condicionIva: "IVA Responsable Inscripto",
    iibb: "287552564",
    inicioActividades: "2023-05-01",
  },
};

export function emisorFiscal(cuit: string): EmisorFiscal | null {
  return EMISORES[cuit.replace(/\D/g, "")] || null;
}
