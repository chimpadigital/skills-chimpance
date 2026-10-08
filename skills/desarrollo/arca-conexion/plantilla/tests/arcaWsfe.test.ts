import { describe, it, expect, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import {
  buildCaeRequest,
  buildQrUrl,
  cbteTipoOf,
  describeArcaMessages,
  isTokenError,
  monthServicePeriod,
  parseCaeResponse,
  parseCompConsultar,
  parseUltimoAutorizado,
  redactAuth,
  type WsfeComprobante,
} from "../server/domains/integrations/arca/wsfe.map";
import forge from "node-forge";
import { cuitFromCertificate, getWsfeConfig } from "../server/domains/integrations/arca/arca.config";
import { ARCA_RECEPTOR_CONDITION, invoiceConceptText, saleInvoiceTypeMismatch, servicePeriodLabel, suggestSaleInvoiceType } from "../shared/fiscal";

const auth = { token: "TOKEN+secreto==", sign: "FIRMA/secreta", cuit: "30718030648" };

const facturaB: WsfeComprobante = {
  letter: "B",
  kind: "invoice",
  pointOfSale: 2,
  number: 1,
  docNro: "30648389392",
  receptorConditionId: 4,
  issueDate: "2026-09-16",
  serviceFrom: "2026-09-01",
  serviceTo: "2026-09-30",
  paymentDueDate: "2026-09-26",
  net: 841500,
  ivaRate: 21,
  iva: 176715,
  total: 1018215,
};

const envelope = (inner: string) =>
  `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>${inner}</soap:Body></soap:Envelope>`;

describe("factura electrónica · pedido a ARCA", () => {
  it("códigos de comprobante: A 1 / NC A 3 / B 6 / NC B 8", () => {
    expect(cbteTipoOf("A", "invoice")).toBe(1);
    expect(cbteTipoOf("A", "credit_note")).toBe(3);
    expect(cbteTipoOf("B", "invoice")).toBe(6);
    expect(cbteTipoOf("B", "credit_note")).toBe(8);
  });

  it("factura B de servicios en pesos: campos en el orden del WSDL, IVA 21 % y condición del receptor", () => {
    const xml = buildCaeRequest(auth, facturaB);
    const order = ["Concepto", "DocTipo", "DocNro", "CbteDesde", "CbteHasta", "CbteFch", "ImpTotal", "ImpTotConc", "ImpNeto", "ImpOpEx", "ImpTrib", "ImpIVA", "FchServDesde", "FchServHasta", "FchVtoPago", "MonId", "MonCotiz", "CondicionIVAReceptorId", "Iva"];
    const positions = order.map((t) => xml.indexOf(`<ar:${t}>`));
    expect(positions.every((p) => p > 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(xml).toContain("<ar:PtoVta>2</ar:PtoVta><ar:CbteTipo>6</ar:CbteTipo>");
    expect(xml).toContain("<ar:Concepto>2</ar:Concepto><ar:DocTipo>80</ar:DocTipo><ar:DocNro>30648389392</ar:DocNro>");
    expect(xml).toContain("<ar:ImpTotal>1018215.00</ar:ImpTotal>");
    expect(xml).toContain("<ar:ImpNeto>841500.00</ar:ImpNeto>");
    expect(xml).toContain("<ar:ImpIVA>176715.00</ar:ImpIVA>");
    expect(xml).toContain("<ar:FchServDesde>20260901</ar:FchServDesde><ar:FchServHasta>20260930</ar:FchServHasta><ar:FchVtoPago>20260926</ar:FchVtoPago>");
    expect(xml).toContain("<ar:MonId>PES</ar:MonId><ar:MonCotiz>1</ar:MonCotiz><ar:CondicionIVAReceptorId>4</ar:CondicionIVAReceptorId>");
    expect(xml).toContain("<ar:AlicIva><ar:Id>5</ar:Id><ar:BaseImp>841500.00</ar:BaseImp><ar:Importe>176715.00</ar:Importe></ar:AlicIva>");
    expect(xml).not.toContain("CbtesAsoc");
  });

  it("exento (alícuota 0): va en ImpOpEx y sin detalle de IVA", () => {
    const xml = buildCaeRequest(auth, { ...facturaB, ivaRate: 0, iva: 0, net: 1000, total: 1000 });
    expect(xml).toContain("<ar:ImpNeto>0.00</ar:ImpNeto><ar:ImpOpEx>1000.00</ar:ImpOpEx>");
    expect(xml).not.toContain("<ar:Iva>");
  });

  it("nota de crédito: asociada a la factura, antes del detalle de IVA", () => {
    const xml = buildCaeRequest(auth, {
      ...facturaB,
      kind: "credit_note",
      number: 1,
      associated: { letter: "B", pointOfSale: 2, number: 1, issueDate: "2026-09-16", cuit: "30718030648" },
    });
    expect(xml).toContain("<ar:CbteTipo>8</ar:CbteTipo>");
    expect(xml).toContain("<ar:CbtesAsoc><ar:CbteAsoc><ar:Tipo>6</ar:Tipo><ar:PtoVta>2</ar:PtoVta><ar:Nro>1</ar:Nro><ar:Cuit>30718030648</ar:Cuit><ar:CbteFch>20260916</ar:CbteFch></ar:CbteAsoc></ar:CbtesAsoc>");
    expect(xml.indexOf("<ar:CbtesAsoc>")).toBeLessThan(xml.indexOf("<ar:Iva>"));
  });

  it("la constancia no guarda token ni firma", () => {
    const redacted = redactAuth(buildCaeRequest(auth, facturaB));
    expect(redacted).not.toContain("secreto");
    expect(redacted).not.toContain("secreta");
    expect(redacted).toContain("<ar:Cuit>30718030648</ar:Cuit>");
  });

  it("período del servicio por defecto: el mes de la fecha (también febrero)", () => {
    expect(monthServicePeriod("2026-09-16")).toEqual({ from: "2026-09-01", to: "2026-09-30" });
    expect(monthServicePeriod("2028-02-10")).toEqual({ from: "2028-02-01", to: "2028-02-29" });
  });
});

describe("factura electrónica · respuestas de ARCA", () => {
  it("aprobada: CAE, vencimiento y número", () => {
    const xml = envelope(
      `<FECAESolicitarResponse xmlns="http://ar.gov.afip.dif.FEV1/"><FECAESolicitarResult>` +
        `<FeCabResp><Cuit>30718030648</Cuit><PtoVta>2</PtoVta><CbteTipo>6</CbteTipo><FchProceso>20260916120000</FchProceso><CantReg>1</CantReg><Resultado>A</Resultado><Reproceso>N</Reproceso></FeCabResp>` +
        `<FeDetResp><FECAEDetResponse><Concepto>2</Concepto><DocTipo>80</DocTipo><DocNro>30648389392</DocNro><CbteDesde>1</CbteDesde><CbteHasta>1</CbteHasta><CbteFch>20260916</CbteFch><Resultado>A</Resultado>` +
        `<CAE>76384512345678</CAE><CAEFchVto>20260926</CAEFchVto></FECAEDetResponse></FeDetResp>` +
        `</FECAESolicitarResult></FECAESolicitarResponse>`,
    );
    const r = parseCaeResponse(xml);
    expect(r).toMatchObject({ result: "A", cae: "76384512345678", caeDueDate: "2026-09-26", number: 1, errors: [], observations: [] });
  });

  it("rechazada: junta observaciones y errores en un mensaje legible", () => {
    const xml = envelope(
      `<FECAESolicitarResponse xmlns="http://ar.gov.afip.dif.FEV1/"><FECAESolicitarResult>` +
        `<FeCabResp><Resultado>R</Resultado></FeCabResp>` +
        `<FeDetResp><FECAEDetResponse><CbteDesde>1</CbteDesde><Resultado>R</Resultado>` +
        `<Observaciones><Obs><Code>10243</Code><Msg>El campo  Condicion IVA receptor no es valido para la clase de comprobante</Msg></Obs></Observaciones>` +
        `<CAE></CAE><CAEFchVto></CAEFchVto></FECAEDetResponse></FeDetResp>` +
        `</FECAESolicitarResult></FECAESolicitarResponse>`,
    );
    const r = parseCaeResponse(xml);
    expect(r.result).toBe("R");
    expect(r.cae).toBeNull();
    expect(describeArcaMessages([...r.errors, ...r.observations])).toBe("El campo Condicion IVA receptor no es valido para la clase de comprobante (código 10243)");
  });

  it("último autorizado (respuesta real del 16/9/2026, punto de venta 2 sin comprobantes)", () => {
    const xml = envelope(
      `<FECompUltimoAutorizadoResponse xmlns="http://ar.gov.afip.dif.FEV1/"><FECompUltimoAutorizadoResult><PtoVta>2</PtoVta><CbteTipo>6</CbteTipo><CbteNro>0</CbteNro>` +
        `<Events><Evt><Code>63</Code><Msg>aviso</Msg></Evt></Events></FECompUltimoAutorizadoResult></FECompUltimoAutorizadoResponse>`,
    );
    expect(parseUltimoAutorizado(xml)).toEqual({ number: 0, errors: [] });
  });

  it("ticket vencido (código 600): se reconoce para pedir otro", () => {
    const xml = envelope(
      `<FECompUltimoAutorizadoResponse xmlns="http://ar.gov.afip.dif.FEV1/"><FECompUltimoAutorizadoResult><PtoVta>0</PtoVta><CbteTipo>0</CbteTipo><CbteNro>0</CbteNro>` +
        `<Errors><Err><Code>600</Code><Msg>ValidacionDeToken: No validaron las credenciales</Msg></Err></Errors></FECompUltimoAutorizadoResult></FECompUltimoAutorizadoResponse>`,
    );
    expect(isTokenError(parseUltimoAutorizado(xml).errors)).toBe(true);
  });

  it("consulta de un comprobante: encontrado y no encontrado", () => {
    const found = parseCompConsultar(envelope(
      `<FECompConsultarResponse xmlns="http://ar.gov.afip.dif.FEV1/"><FECompConsultarResult><ResultGet><DocNro>30648389392</DocNro><CbteFch>20260916</CbteFch><ImpTotal>1018215</ImpTotal>` +
        `<Resultado>A</Resultado><CodAutorizacion>76384512345678</CodAutorizacion><EmisionTipo>CAE</EmisionTipo><FchVto>20260926</FchVto></ResultGet></FECompConsultarResult></FECompConsultarResponse>`,
    ));
    expect(found).toMatchObject({ found: true, result: "A", cae: "76384512345678", caeDueDate: "2026-09-26", total: 1018215, docNro: "30648389392", issueDate: "2026-09-16" });
    const missing = parseCompConsultar(envelope(
      `<FECompConsultarResponse xmlns="http://ar.gov.afip.dif.FEV1/"><FECompConsultarResult><Errors><Err><Code>602</Code><Msg>Sin Resultados</Msg></Err></Errors></FECompConsultarResult></FECompConsultarResponse>`,
    ));
    expect(missing.found).toBe(false);
  });

  it("QR de ARCA: JSON en base64 con los datos del comprobante", () => {
    const url = buildQrUrl({ issueDate: "2026-09-16", cuit: "30718030648", pointOfSale: 2, cbteTipo: 6, number: 1, total: 1018215, docNro: "30648389392", cae: "76384512345678" });
    expect(url.startsWith("https://www.afip.gob.ar/fe/qr/?p=")).toBe(true);
    const payload = JSON.parse(Buffer.from(url.split("?p=")[1], "base64").toString("utf8"));
    expect(payload).toEqual({ ver: 1, fecha: "2026-09-16", cuit: 30718030648, ptoVta: 2, tipoCmp: 6, nroCmp: 1, importe: 1018215, moneda: "PES", ctz: 1, tipoDocRec: 80, nroDocRec: 30648389392, tipoCodAut: "E", codAut: 76384512345678 });
  });
});

describe("factura electrónica · candado de ambientes", () => {
  const dirs: string[] = [];
  const tmp = () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), "wsfe-"));
    dirs.push(d);
    return d;
  };
  const cert = "-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----\n";
  const key = "-----BEGIN PRIVATE KEY-----\nMIIE\n-----END PRIVATE KEY-----\n";
  afterEach(() => {
    for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
  });

  it("sin marca de producción ni certificado de prueba: apagada, aunque esté el certificado real", () => {
    const d = tmp();
    fs.mkdirSync(path.join(d, ".arca"));
    fs.writeFileSync(path.join(d, ".arca", "cert.pem"), cert);
    fs.writeFileSync(path.join(d, ".arca", "key.pem"), key);
    const r = getWsfeConfig(d);
    expect(r.ok).toBe(false);
  });

  it("con certificado de prueba y sin marca: homologación (nunca el certificado real)", () => {
    const d = tmp();
    fs.mkdirSync(path.join(d, ".arca", "homo"), { recursive: true });
    fs.writeFileSync(path.join(d, ".arca", "cert.pem"), cert.replace("MIIB", "REAL"));
    fs.writeFileSync(path.join(d, ".arca", "key.pem"), key);
    fs.writeFileSync(path.join(d, ".arca", "homo", "cert.pem"), cert);
    fs.writeFileSync(path.join(d, ".arca", "homo", "key.pem"), key);
    const r = getWsfeConfig(d);
    expect(r.ok && r.config.env).toBe("homologacion");
    expect(r.ok && r.config.certPem.includes("REAL")).toBe(false);
    expect(r.ok && r.config.pointOfSale).toBe(2);
  });

  it("homologación: factura con el CUIT del certificado de prueba (WSASS lo emite a nombre de la persona)", () => {
    const keys = forge.pki.rsa.generateKeyPair(1024);
    const c = forge.pki.createCertificate();
    c.publicKey = keys.publicKey;
    c.serialNumber = "01";
    c.validity.notBefore = new Date("2026-09-16");
    c.validity.notAfter = new Date("2028-09-15");
    const attrs = [{ name: "commonName", value: "chimpafinanzas" }, { type: "2.5.4.5", value: "CUIT 20345986317" }];
    c.setSubject(attrs);
    c.setIssuer([{ name: "commonName", value: "Computadores Test" }]);
    c.sign(keys.privateKey);
    const pem = forge.pki.certificateToPem(c);
    expect(cuitFromCertificate(pem)).toBe("20345986317");
    expect(cuitFromCertificate(cert)).toBeNull();

    const d = tmp();
    fs.mkdirSync(path.join(d, ".arca", "homo"), { recursive: true });
    fs.writeFileSync(path.join(d, ".arca", "homo", "cert.pem"), pem);
    fs.writeFileSync(path.join(d, ".arca", "homo", "key.pem"), key);
    const r = getWsfeConfig(d);
    expect(r.ok && r.config.env).toBe("homologacion");
    expect(r.ok && r.config.cuit).toBe("20345986317");
  });

  it("con la marca de producción: emite de verdad con el certificado real", () => {
    const d = tmp();
    fs.mkdirSync(path.join(d, ".arca", "homo"), { recursive: true });
    fs.writeFileSync(path.join(d, ".arca", "cert.pem"), cert.replace("MIIB", "REAL"));
    fs.writeFileSync(path.join(d, ".arca", "key.pem"), key);
    fs.writeFileSync(path.join(d, ".arca", "homo", "cert.pem"), cert);
    fs.writeFileSync(path.join(d, ".arca", "homo", "key.pem"), key);
    fs.writeFileSync(path.join(d, ".arca", "wsfe-produccion"), "");
    const r = getWsfeConfig(d);
    expect(r.ok && r.config.env).toBe("produccion");
    expect(r.ok && r.config.certPem.includes("REAL")).toBe(true);
  });
});

describe("tipo de factura según el cliente", () => {
  it("A a inscriptos y monotributistas, B a exentos y consumidores finales, E al exterior", () => {
    expect(suggestSaleInvoiceType("responsable_inscripto")).toBe("A");
    expect(suggestSaleInvoiceType("monotributista")).toBe("A");
    expect(suggestSaleInvoiceType("exento", "Argentina")).toBe("B");
    expect(suggestSaleInvoiceType("consumidor_final")).toBe("B");
    expect(suggestSaleInvoiceType("responsable_inscripto", "Uruguay")).toBe("E");
    expect(suggestSaleInvoiceType("otro")).toBeNull();
    expect(suggestSaleInvoiceType(null)).toBeNull();
  });

  it("avisa si se elige A para un exento (el caso de Aapresid)", () => {
    expect(saleInvoiceTypeMismatch("A", "exento", "Argentina")).toBe("El cliente es IVA Sujeto Exento: le corresponde factura B, no A.");
    expect(saleInvoiceTypeMismatch("B", "exento", "Argentina")).toBeNull();
  });

  it("códigos de condición del receptor de ARCA", () => {
    expect(ARCA_RECEPTOR_CONDITION).toEqual({ responsable_inscripto: 1, monotributista: 6, exento: 4, consumidor_final: 5, otro: null });
  });
});

describe("concepto de la factura (concepto del proyecto + mes)", () => {
  it("un mes, varios meses y cambio de año", () => {
    expect(servicePeriodLabel("2026-09-01", "2026-09-30")).toBe("septiembre 2026");
    expect(servicePeriodLabel("2026-09-01", "2026-11-30")).toBe("septiembre a noviembre 2026");
    expect(servicePeriodLabel("2026-12-01", "2027-01-31")).toBe("diciembre 2026 a enero 2027");
    expect(servicePeriodLabel("")).toBe("");
  });

  it("arma el detalle; sin concepto no inventa nada", () => {
    expect(invoiceConceptText("Hosting y mantenimiento web", "2026-09-01", "2026-09-30")).toBe("Hosting y mantenimiento web · septiembre 2026");
    expect(invoiceConceptText("  Desarrollo sitio web  ", "2026-10-01", "2026-10-31")).toBe("Desarrollo sitio web · octubre 2026");
    expect(invoiceConceptText("Hosting", "", "")).toBe("Hosting");
    expect(invoiceConceptText(null, "2026-09-01", "2026-09-30")).toBe("");
    // Proyecto de una vez: el concepto va solo, sin mes
    expect(invoiceConceptText("Desarrollo web", "2026-09-01", "2026-09-30", false)).toBe("Desarrollo web");
  });
});

describe("datos del emisor impresos en la factura", () => {
  it("Chimpancé: Ingresos Brutos e inicio de actividades como en la factura de ARCA (B 0001-00000117)", async () => {
    const { emisorFiscal } = await import("../server/domains/integrations/arca/emisor");
    expect(emisorFiscal("30-71803064-8")).toMatchObject({ cuit: "30718030648", iibb: "287552564", inicioActividades: "2023-05-01", condicionIva: "IVA Responsable Inscripto" });
  });
});
