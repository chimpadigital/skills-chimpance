import { describe, it, expect } from "vitest";
import forge from "node-forge";
import { parsePadronResponse } from "../server/domains/integrations/arca/padron.map";
import { isValidCuit } from "../server/domains/integrations/arca/cuitLookup.service";
import { buildTra, signTra, parseLoginResponse, ArcaAuthError } from "../server/domains/integrations/arca/arcaWsaa";
import { decodePem, getArcaConfig } from "../server/domains/integrations/arca/arca.config";
import fs from "fs";
import os from "os";
import path from "path";

const envelope = (inner: string) =>
  `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>` +
  `<ns2:getPersona_v2Response xmlns:ns2="http://a5.soap.ws.server.puc.sr/"><personaReturn>${inner}` +
  `<metadata><fechaHora>2026-09-12T19:00:00-03:00</fechaHora><servidor>x</servidor></metadata>` +
  `</personaReturn></ns2:getPersona_v2Response></soap:Body></soap:Envelope>`;

// Respuesta real de ARCA para Chimpancé (12/9/2026), recortada.
const SOCIEDAD_RI = envelope(
  `<datosGenerales><domicilioFiscal><codPostal>5021</codPostal><descripcionProvincia>CORDOBA</descripcionProvincia>` +
    `<direccion>DOERING ADOLFO 6518</direccion><idProvincia>3</idProvincia><localidad>BARRIO SILVANO FUNES</localidad>` +
    `<tipoDomicilio>FISCAL</tipoDomicilio></domicilioFiscal><estadoClave>ACTIVO</estadoClave><idPersona>30718030648</idPersona>` +
    `<razonSocial>CHIMPANCE DIGITAL S.A.S.</razonSocial><tipoClave>CUIT</tipoClave><tipoPersona>JURIDICA</tipoPersona></datosGenerales>` +
    `<datosRegimenGeneral>` +
    `<actividad><descripcionActividad>PORTALES WEB</descripcionActividad><idActividad>631200</idActividad><orden>2</orden></actividad>` +
    `<actividad><descripcionActividad>SERVICIOS DE CONSULTORES EN INFORMÁTICA Y SUMINISTROS DE PROGRAMAS DE INFORMÁTICA</descripcionActividad><idActividad>620100</idActividad><orden>1</orden></actividad>` +
    `<impuesto><descripcionImpuesto>GANANCIAS SOCIEDADES</descripcionImpuesto><estadoImpuesto>AC</estadoImpuesto><idImpuesto>10</idImpuesto></impuesto>` +
    `<impuesto><descripcionImpuesto>IVA</descripcionImpuesto><estadoImpuesto>AC</estadoImpuesto><idImpuesto>30</idImpuesto></impuesto>` +
    `</datosRegimenGeneral>`,
);

const MONOTRIBUTO = envelope(
  `<datosGenerales><apellido>PEREZ</apellido><nombre>JUAN</nombre><domicilioFiscal><descripcionProvincia>CIUDAD AUTONOMA BUENOS AIRES</descripcionProvincia>` +
    `<direccion>CORRIENTES 1234</direccion></domicilioFiscal><estadoClave>ACTIVO</estadoClave><tipoPersona>FISICA</tipoPersona></datosGenerales>` +
    `<datosMonotributo><actividadMonotributista><descripcionActividad>SERVICIOS DE DISEÑO</descripcionActividad><idActividad>741000</idActividad><orden>1</orden></actividadMonotributista>` +
    `<categoriaMonotributo><descripcionCategoria>B LOCACIONES DE SERVICIOS</descripcionCategoria></categoriaMonotributo>` +
    `<impuesto><descripcionImpuesto>MONOTRIBUTO</descripcionImpuesto><idImpuesto>20</idImpuesto></impuesto></datosMonotributo>`,
);

describe("padrón de ARCA → datos del ERP", () => {
  it("sociedad responsable inscripta: nombre, condición, domicilio y actividades en orden", () => {
    const r = parsePadronResponse(SOCIEDAD_RI, "30718030648");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data).toMatchObject({
      razonSocial: "CHIMPANCE DIGITAL S.A.S.",
      tipoPersona: "juridica",
      estadoClave: "ACTIVO",
      fiscalCondition: "responsable_inscripto",
      address: "DOERING ADOLFO 6518",
      city: "BARRIO SILVANO FUNES",
      province: "CORDOBA",
      postalCode: "5021",
      source: "arca",
      warnings: [],
    });
    expect(r.data.activities.map((a) => a.code)).toEqual(["620100", "631200"]);
  });

  it("monotributista persona humana: arma el nombre y en CABA la ciudad es la provincia", () => {
    const r = parsePadronResponse(MONOTRIBUTO, "20123456786");
    expect(r.ok && r.data).toMatchObject({
      razonSocial: "PEREZ JUAN",
      tipoPersona: "fisica",
      fiscalCondition: "monotributista",
      city: "CIUDAD AUTONOMA BUENOS AIRES",
    });
    expect(r.ok && r.data.activities[0].description).toBe("SERVICIOS DE DISEÑO");
  });

  it("IVA dado de baja no cuenta como inscripto; persona humana sin IVA = consumidor final", () => {
    const xml = MONOTRIBUTO.replace(/<datosMonotributo>[\s\S]*<\/datosMonotributo>/, "<datosRegimenGeneral><impuesto><idImpuesto>30</idImpuesto><estadoImpuesto>BD</estadoImpuesto></impuesto></datosRegimenGeneral>");
    const r = parsePadronResponse(xml, "20123456786");
    expect(r.ok && r.data.fiscalCondition).toBe("consumidor_final");
  });

  it("constancia con errores pero con nombre: devuelve el nombre y los avisos", () => {
    const xml = envelope(
      `<errorConstancia><apellido>VELAZQUEZ ANIBAL</apellido><error>Domicilio Incompleto</error><idPersona>20000000516</idPersona></errorConstancia>`,
    );
    const r = parsePadronResponse(xml, "20000000516");
    expect(r.ok && r.data).toMatchObject({ razonSocial: "VELAZQUEZ ANIBAL", fiscalCondition: null, warnings: ["Domicilio Incompleto"] });
  });

  it("CUIT inexistente es un 'no encontrado' definitivo; otros fallos no", () => {
    const fault = (msg: string) => `<soap:Envelope><soap:Body><soap:Fault><faultcode>soap:Server</faultcode><faultstring>${msg}</faultstring></soap:Fault></soap:Body></soap:Envelope>`;
    expect(parsePadronResponse(fault("No existe persona con ese Id"), "20000000001")).toEqual({ ok: false, notFound: true, error: "El CUIT no existe en el padrón de ARCA" });
    const other = parsePadronResponse(fault("token expirado"), "20000000001");
    expect(other.ok === false && other.notFound).toBe(false);
  });
});

describe("CUIT", () => {
  it("valida el dígito verificador", () => {
    expect(isValidCuit("30718030648")).toBe(true);
    expect(isValidCuit("30500010912")).toBe(true);
    expect(isValidCuit("30718030649")).toBe(false);
    expect(isValidCuit("3071803064")).toBe(false);
  });
});

describe("WSAA", () => {
  it("el PEM se acepta tal cual, con \\n escapados o en base64", () => {
    const pem = "-----BEGIN CERTIFICATE-----\nABC\n-----END CERTIFICATE-----";
    expect(decodePem(pem)).toBe(pem);
    expect(decodePem(pem.replace(/\n/g, "\\n"))).toBe(pem);
    expect(decodePem(Buffer.from(pem).toString("base64"))).toBe(pem);
    expect(decodePem("")).toBeNull();
    expect(decodePem("no-es-un-pem")).toBeNull();
  });

  it("firma el pedido como CMS con el contenido adentro", () => {
    const keys = forge.pki.rsa.generateKeyPair(1024);
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = "01";
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date(Date.now() + 86400000);
    cert.setSubject([{ name: "commonName", value: "test" }]);
    cert.setIssuer([{ name: "commonName", value: "test" }]);
    cert.sign(keys.privateKey, forge.md.sha256.create());

    const tra = buildTra("ws_sr_constancia_inscripcion", new Date("2026-09-12T20:00:00Z"));
    expect(tra).toContain("<generationTime>2026-09-12T16:50:00-03:00</generationTime>");
    expect(tra).toContain("<expirationTime>2026-09-12T17:10:00-03:00</expirationTime>");

    const b64 = signTra(tra, forge.pki.certificateToPem(cert), forge.pki.privateKeyToPem(keys.privateKey));
    const msg = forge.pkcs7.messageFromAsn1(forge.asn1.fromDer(forge.util.decode64(b64))) as any;
    expect(msg.rawCapture.content.value[0].value).toContain("<service>ws_sr_constancia_inscripcion</service>");
  });

  it("lee el ticket y reconoce 'ya posee un TA válido'", () => {
    const inner = `<loginTicketResponse><header><expirationTime>2026-09-13T06:51:09.266-03:00</expirationTime></header><credentials><token>TK</token><sign>SG</sign></credentials></loginTicketResponse>`;
    const ok = `<soapenv:Envelope><soapenv:Body><loginCmsResponse><loginCmsReturn>${inner.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</loginCmsReturn></loginCmsResponse></soapenv:Body></soapenv:Envelope>`;
    expect(parseLoginResponse(ok)).toEqual({ token: "TK", sign: "SG", expiresAt: "2026-09-13T09:51:09.266Z" });

    const already = `<soapenv:Envelope><soapenv:Body><soapenv:Fault><faultcode xmlns:ns1="http://xml.apache.org/axis/">ns1:coe.alreadyAuthenticated</faultcode><faultstring>El CEE ya posee un TA valido para el acceso al WSN solicitado</faultstring></soapenv:Fault></soapenv:Body></soapenv:Envelope>`;
    expect(() => parseLoginResponse(already)).toThrow(ArcaAuthError);
    try { parseLoginResponse(already); } catch (e) { expect((e as ArcaAuthError).code).toBe("ALREADY_AUTHENTICATED"); }
  });
});

describe("configuración del certificado", () => {
  it("toma el certificado de los archivos que deja el deploy, antes que del .env", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "arca-"));
    const pem = (t: string) => `-----BEGIN ${t}-----
XYZ
-----END ${t}-----`;
    fs.writeFileSync(path.join(dir, "cert.pem"), pem("CERTIFICATE"));
    fs.writeFileSync(path.join(dir, "key.pem"), pem("PRIVATE KEY"));
    const prev = { ...process.env };
    try {
      process.env.ARCA_CERT_FILE = path.join(dir, "cert.pem");
      process.env.ARCA_KEY_FILE = path.join(dir, "key.pem");
      process.env.ARCA_CERT = Buffer.from(pem("OTRO")).toString("base64");
      process.env.ARCA_KEY = Buffer.from(pem("OTRO")).toString("base64");
      expect(getArcaConfig()?.certPem).toBe(pem("CERTIFICATE"));
      expect(getArcaConfig()?.keyPem).toBe(pem("PRIVATE KEY"));

      process.env.ARCA_CERT_FILE = path.join(dir, "no-existe.pem");
      expect(getArcaConfig()?.certPem).toBe(pem("OTRO"));

      delete process.env.ARCA_CERT;
      expect(getArcaConfig()).toBeNull();
    } finally {
      process.env = prev;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
