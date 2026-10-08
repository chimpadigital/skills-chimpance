# 02 · Código (plantilla probada en producción)

Stack de referencia: Node 20 + TypeScript, `node-forge` para firmar, `pdf-lib` + `qrcode` para el PDF. **No hace falta** una librería de AFIP (afip.js, AfipSDK) ni un parser XML ni SOAP: son pocos métodos y alcanza con plantillas de texto y regex. Así no hay dependencias con costo y se ve todo lo que viaja.

En otro lenguaje se porta el mismo diseño. Lo que importa son las reglas de esta página, no el código.

## Mapa de la plantilla ([plantilla/](plantilla/))

| Archivo | Qué hace | Qué adaptar |
|---|---|---|
| `server/arca.config.ts` | URLs de producción y homologación. Lee el certificado de `.arca/cert.pem` y `key.pem` (o de las env `ARCA_CERT`/`ARCA_KEY` en base64). `getWsfeConfig()` = **candado**: producción solo con la marca `.arca/wsfe-produccion`; si no hay marca, homologación con `.arca/homo/`; si no hay certificado, apagado con el motivo. Lee el CUIT del certificado de homologación (`serialNumber`). | CUIT por defecto y punto de venta por defecto (`ARCA_CUIT`, `ARCA_WSFE_PTO_VTA`) |
| `server/arcaWsaa.ts` | Arma el TRA, lo firma como CMS/PKCS#7 con `node-forge` (sha256, contenido adentro) y hace `loginCms`. El TA se cachea en **memoria → disco (`.arca-cache/`, 0600) → WSAA**, con clave `env-huellaCert-servicio`, **una sola llamada en vuelo** por servicio y margen de 5 min. Traduce las fallas: `ALREADY_AUTHENTICATED`, `NOT_AUTHORIZED`. | Nada |
| `server/arcaHttp.ts` | POST SOAP con `https` + agente `SECLEVEL=1` (para wsfe de producción). Devuelve el cuerpo aunque venga con HTTP 500 (los SOAP Fault llegan así). Errores tipados `TIMEOUT`/`NETWORK`/`HTTP`. | Nada |
| `server/arcaXml.ts` | `xmlText`, `xmlBlocks`, `escapeXml`, `decodeEntities`. | Nada |
| `server/padron.map.ts` | Traduce `getPersona_v2`: razón social (o apellido + nombre), domicilio fiscal, actividades, avisos (`errorConstancia`) y **condición de IVA**: monotributo si hay `datosMonotributo`; RI si tiene el impuesto 30 activo; exento si tiene el 32; persona física sin IVA → consumidor final. | Los valores de condición fiscal del sistema |
| `server/cuitLookup.service.ts` | Valida el **dígito verificador** antes de gastar una consulta. Pide al padrón con `cuitRepresentada` = CUIT del emisor. Si ARCA no está configurado, usa el respaldo CuitOnline, que es pobre. | Sacar el respaldo si no se quiere |
| `server/wsfe.map.ts` | Funciones puras: `buildCaeRequest` (orden de campos igual al WSDL, que es .NET y respeta la secuencia), `parseCaeResponse`, `parseUltimoAutorizado`, `parseCompConsultar`, `isTokenError` (código 600), `buildQrUrl`, `redactAuth`. | Concepto (fijo en 2 = servicios), moneda (fija en PES), tipos A/B → sumar C |
| `server/wsfe.service.ts` | `emit()`: **lock por env+pv+tipo** → `FECompUltimoAutorizado` → si ≠ último del sistema, `ARCA_OUT_OF_SYNC` y no emite → `FECAESolicitar` → si hay timeout, `FECompConsultar` de ese número y lo **recupera** solo si coinciden CAE, resultado A, documento y total. Si el TA es inválido (600), lo invalida y reintenta una vez. | Nada |
| `server/invoiceArca.ts` | Orquesta con la base del ERP: valida la ventana de fecha (±10 días en servicios), el emisor, el CUIT y la condición del receptor, que A/B corresponda, los pesos al BNA, el número del sistema y la constancia en `arca_data`. Si ARCA autorizó pero no se pudo guardar, deja rastro fuerte (`recordUnsavedEmission`). | Es específico del ERP: tomarlo como guía |
| `server/emisor.ts` | Datos impresos del emisor: razón social, domicilio, condición, **IIBB e inicio de actividades**. | Todos |
| `server/facturaPdf.ts` | PDF de una página como el de "Comprobantes en línea": banda ORIGINAL, letra al medio con "COD. 006", período, receptor, detalle, totales, QR + CAE. Leyenda "sin validez fiscal" en homologación. Sanea el texto a WinAnsi. | Logo o colores si se quiere |
| `tests/*.test.ts` | Vitest con **respuestas reales** de ARCA. | Rutas de import |
| `deploy-steps.yml` | Pasos de GitHub Actions (cap. 03). | Rutas y usuarios del servidor |

Errores hacia la interfaz: prefijo `ARCA_*` (`NOT_CONFIGURED`, `AUTH`, `UNAVAILABLE`, `REJECTED`, `OUT_OF_SYNC`, `UNCERTAIN`) con HTTP **422**, y el texto después de ":" es para la persona. Se muestra **entero** en el diálogo: si pasa por un traductor genérico, se pierde el detalle de ARCA.

## Pedidos SOAP (formato exacto)

**WSAA loginCms** (`SOAPAction: ""`):
- TRA: `<loginTicketRequest version="1.0"><header><uniqueId>epoch</uniqueId><generationTime>now-10min</generationTime><expirationTime>now+10min</expirationTime></header><service>wsfe</service></loginTicketRequest>`, con fechas ISO y offset `-03:00`.
- Se firma CMS con el contenido adentro (`openssl cms -sign -nodetach -outform DER` o forge), en base64.
- Va dentro de `<wsaa:loginCms><wsaa:in0>` con el namespace `http://wsaa.view.sua.dvadac.desein.afip.gov`.
- La respuesta `loginCmsReturn` viene **escapada**: se hace `decodeEntities` y después se leen `token`, `sign` y `expirationTime`.

**Padrón A5** (`SOAPAction: ""`, namespace `http://a5.soap.ws.server.puc.sr/`):
- `<a5:getPersona_v2><token/><sign/><cuitRepresentada>EMISOR</cuitRepresentada><idPersona>BUSCADO</idPersona></a5:getPersona_v2>`.
- "No existe persona con ese Id" llega como `faultstring`.

**wsfe** (namespace `http://ar.gov.afip.dif.FEV1/`, `SOAPAction: http://ar.gov.afip.dif.FEV1/<Método>`):
- Todo método lleva `<ar:Auth><ar:Token/><ar:Sign/><ar:Cuit>EMISOR</ar:Cuit></ar:Auth>`.
- Orden de `FECAEDetRequest`:
  `Concepto, DocTipo(80=CUIT; 96=DNI; 99=CF sin identificar), DocNro, CbteDesde, CbteHasta, CbteFch(AAAAMMDD), ImpTotal, ImpTotConc, ImpNeto, ImpOpEx, ImpTrib, ImpIVA, FchServDesde, FchServHasta, FchVtoPago, MonId, MonCotiz, CondicionIVAReceptorId, [CbtesAsoc], [Iva]`.
- **ImpTotal = ImpNeto + ImpIVA + ImpOpEx + ImpTotConc + ImpTrib**, redondeado a 2 decimales. Si no suma exacto, ARCA rechaza.
- NC: `CbtesAsoc/CbteAsoc` con `Tipo, PtoVta, Nro, Cuit (emisor), CbteFch` de la factura original.
- Las respuestas se leen así:
  - `FECAEDetResponse/Resultado` (A/R), `CAE`, `CAEFchVto` y `Observaciones/Obs`.
  - `Errors/Err`.
  - `Events/Evt`: avisos de ARCA, por ejemplo el de RG 5616. **No son errores.**

## Tablas

- **Comprobantes:** 1 FA · 2 NDA · 3 NCA · 6 FB · 7 NDB · 8 NCB · 11 FC · 12 NDC · 13 NCC (el PDF lleva "COD. 006" con 3 dígitos).
- **Alícuota IVA (Id):** 3 = 0 % · 4 = 10,5 % · 5 = 21 % · 6 = 27 % · 8 = 5 % · 9 = 2,5 %.
- **Condición IVA del receptor** (`CondicionIVAReceptorId`, RG 5616): 1 RI · 4 Exento · 5 Consumidor Final · 6 Monotributo · 13 Monotributista Social · 16 Monotributo Trabajador Independiente Promovido.
  - Válidos para **A**: {1, 6, 13, 16}.
  - Válidos para **B**: {4, 5, 7, 8, 9, 10, 15}.
  - Se confirma con `FEParamGetCondicionIvaReceptor`.
- **Letra (emisor RI):** receptor RI o monotributo → **A**; exento o consumidor final → **B**; exterior → **E** (wsfex). Emisor monotributo → siempre **C**.
- **QR** (RG 4892): `https://www.afip.gob.ar/fe/qr/?p=` + base64 de `{ver:1, fecha, cuit, ptoVta, tipoCmp, nroCmp, importe, moneda:"PES", ctz:1, tipoDocRec:80, nroDocRec, tipoCodAut:"E", codAut}`.

## Decisiones de diseño que conviene repetir

- **El PDF se arma cada vez que se pide**, a partir de los datos guardados: si se corrige el formato o los datos del emisor, las facturas viejas salen bien sin reemitirlas.
- Se guarda como constancia el **pedido sin token ni firma** (`redactAuth`) y la respuesta cruda.
- **Concepto por proyecto o cliente**, con la opción de agregar el mes del período ("Mantenimiento web · septiembre 2026") o no ("Desarrollo web"). Precargado y editable en cada factura.
- **Tipo A/B precalculado** según la condición del cliente, con aviso si falta el CUIT o la condición y un botón "Completar ficha".
- Se factura en **pesos**; para una cuenta en USD, el neto se convierte al BNA venta del día y el IVA se calcula sobre ese neto. El monto queda congelado al facturar.
