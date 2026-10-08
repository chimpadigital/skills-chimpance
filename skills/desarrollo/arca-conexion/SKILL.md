---
name: arca-conexion
description: Experto en conectar sistemas con ARCA (ex AFIP) por web services, con lo aprendido al conectar el ERP Chimpa-Finanzas en sep 2026. Cubre el trámite con clave fiscal (certificado digital, delegar servicios, punto de venta web services, certificado de homologación por WSASS), el login WSAA, el padrón por CUIT (ws_sr_constancia_inscripcion) y la factura electrónica (wsfe, CAE, notas de crédito, QR, PDF), cómo guardar el certificado sin exponerlo, cómo separar prueba de producción y cómo verificar. Trae código de referencia probado en producción y un script de prueba. Usar SIEMPRE que Santiago pida conectar un sistema (el ERP, un sistema de un cliente, un e-commerce, una app) con ARCA o AFIP, factura electrónica, CAE, "facturar desde el sistema", buscar datos de una empresa por CUIT, padrón, certificado digital de ARCA, WSAA, WSASS, homologación, punto de venta para web services, o cuando algo de ARCA falle ("no emite", "no aparece en ARCA", "TA válido", "dh key too small", "rechazó la factura"), aunque no diga "ARCA".
---

# ARCA — conectar sistemas (padrón + factura electrónica)

Conectar el ERP con ARCA llevó **5 sesiones** entre el 8/9 y el 17/9/2026, con idas y vueltas. Casi todo el tiempo se fue en cosas que no eran técnicas: el trámite se cortó a mitad de camino y hubo que reconstruirlo, pasos de ARCA dichos mal, el certificado esperando al CTO, cuatro cambios de plan sobre el certificado de prueba y una "facturación" que en realidad no emitía. Este skill ordena todo eso en un **camino corto con las decisiones tomadas de antemano**. Con él, un sistema nuevo se conecta en **una sesión y un solo turno de trámite** de la persona con clave fiscal.

Santiago no programa: los pasos de ARCA se le explican en criollo, **con el nombre exacto de cada pantalla**, y él manda capturas. Lo técnico lo decide el skill.

## En 30 segundos

- ARCA no tiene una API REST: son **web services SOAP** autenticados con un **certificado digital** del CUIT que consulta o factura.
- El login es **WSAA**: se firma un pedido con el certificado y ARCA devuelve un **ticket de acceso (TA)** de 12 h para **un** servicio.
- Los servicios que usamos:
  - `ws_sr_constancia_inscripcion` (padrón A5, `getPersona_v2`): razón social, condición de IVA, domicilio y actividades de cualquier CUIT. Es de solo lectura.
  - `wsfe` (factura electrónica A/B/C y sus notas de crédito): `FECAESolicitar` devuelve el **CAE**.
  - La factura E de exportación va por `wsfex`. Está fuera de alcance hasta que se pida.
- **Un certificado sirve para varios servicios**, pero hay que delegarle cada uno. El certificado de **prueba (homologación)** se saca aparte, en **WSASS**, y sale a nombre de la **persona** que entra, no de la empresa.

## El camino corto (6 pasos, en este orden)

**0 · Arranque: pedir todo junto** (cap. 01 › "Checklist de arranque"). Se hace **una sola** ronda de preguntas, no diez:
- CUIT y condición del emisor: RI → A/B; monotributo → C.
- Qué servicios hacen falta (padrón, factura o los dos).
- Tipos de comprobante y moneda.
- Dónde corre el sistema y quién maneja los secretos.
- Quién hace el trámite con clave fiscal, y su CUIT personal (para WSASS).
- **Un PDF de una factura hecha en "Comprobantes en línea"**: de ahí salen IIBB, inicio de actividades, domicilio y el formato del PDF.

**1 · Generar las dos claves y los dos CSR de una vez** (cap. 01 › "Claves y CSR"):
- Producción: CUIT de la empresa.
- Homologación: CUIT de la persona que va a entrar a WSASS.

Se guardan fuera del repo y se deja una copia del CSR en Descargas. **Anotar en memoria el estado del trámite en cada paso**: si se corta, se retoma sin reconstruir nada.

**2 · Trámite de ARCA en una sola sentada** (cap. 01 › "Guion del trámite"). Tiene 4 bloques:
1. Certificado de producción.
2. Delegar los servicios.
3. Punto de venta **"RECE para aplicativo y web services"**.
4. WSASS: certificado de prueba y autorización a `wsfe`.

Se le pasa el guion entero y se verifica cada captura.

**3 · Probar desde la compu, solo lectura**, con [scripts/arca_smoke.sh](scripts/arca_smoke.sh) (cap. 04):
- `login`, `persona`, `tipos`, `ptosventa` y `ultimo`, con el certificado de producción.
- El ciclo completo, con el de homologación.
- **Nunca** pedir CAE con el certificado de producción desde la compu.

**4 · Código: copiar la plantilla** ([plantilla/](plantilla/), cap. 02). Está probada en producción. Se adaptan el CUIT, el punto de venta, los datos del emisor, la moneda y los tipos. Los tests van con respuestas reales de ARCA.

**5 · Secretos y candado de ambientes** (cap. 03):
- El certificado va en **secretos cifrados del CI** (base64) y el deploy lo escribe en el servidor. **No** se espera a que alguien lo cargue en un `.env`.
- Solo producción emite comprobantes reales, gracias a un archivo marca que escribe el deploy de `main`.
- Dev emite contra homologación.

**6 · Probar en dev contra homologación y después pasar a producción** (cap. 04):
- En dev se prueba el circuito completo: factura, PDF, nota de crédito y el bloqueo de anular. Los comprobantes de prueba se compensan con NC.
- En producción se verifica **solo leyendo**. La primera factura real la emite el usuario, y se confirma con `FECompConsultar` porque "Mis Comprobantes" demora 1 o 2 días.

## Reglas duras (cada una costó una vuelta)

| # | Regla | Qué pasó sin ella |
|---|---|---|
| 1 | **Nunca regenerar la clave si el CSR ya se subió.** El .crt solo funciona con esa .key. Se verifica con el módulo: `openssl x509 -noout -modulus` contra `openssl rsa -noout -modulus`. | El 8/9 el trámite quedó a medias sin registro. El 12/9 hubo que reconstruir dónde había quedado. |
| 2 | **Punto de venta = "RECE para aplicativo y web services"** (RI) o "Factura Electrónica - Monotributo - Web Services" (monotributo). El de "Comprobantes en línea" / Factura en Línea **no sirve por API**. "Bonos Fiscales" tampoco. | Se le indicó mal el sistema del PV. La primera factura se emitió manual en PV 1, sin CAE, y hubo que anularla. |
| 3 | En "Nueva Relación", el campo **"CUIT/CUIL/CDI Usuario" queda vacío**: se elige el alias en "Computador Fiscal" y se confirma. | Duda en la pantalla, hubo que frenar a explicar. |
| 4 | **WSASS emite el certificado a nombre de la persona.** El CSR de homologación va con el CUIT de ella, y en homologación se factura **con ese CUIT** (el código lo lee del certificado). La confirmación puede decir `SERVICIO=ws://arbccf` y **anda igual**. | Se armó el CSR con el CUIT de la empresa, hubo que rehacerlo, y el `arbccf` hizo dudar de la autorización. |
| 5 | **El certificado no va al repo ni por WhatsApp o mail.** Va a los **secretos cifrados de GitHub** (`gh secret set`, base64), y el deploy lo escribe con `umask 077`. | Se esperó al CTO para cargar el `.env` y la tarea quedó trabada dos días. |
| 6 | **Candado:** solo la rama de producción escribe `.arca/wsfe-produccion`. Sin esa marca, se emite contra homologación o la emisión queda apagada. Nunca crear la marca a mano. | Evita facturas reales desde dev y numeración descuadrada (`ARCA_OUT_OF_SYNC`). |
| 7 | **"Conectado" no es "emite".** Tener el certificado y probar `FEParamGetTiposCbte` no significa que el sistema pida CAE. Hay que decir explícitamente qué quedó andando y qué no. | Santiago creyó que el ERP facturaba. El botón solo registraba una factura hecha a mano. |
| 8 | **wsfe de producción exige TLS con `SECLEVEL=1`** (`dh key too small`). En Node se usa `https.Agent({ciphers:"DEFAULT@SECLEVEL=1"})` solo para wsfe, porque `fetch` no deja cambiarlo. WSAA y el padrón andan con `fetch`. | Error de conexión el primer día de la factura electrónica. |
| 9 | **El TA se cachea en memoria y en disco, y se pide uno a la vez.** Si ARCA dice "ya posee un TA válido", no se emitió nada: hay que esperar el vencimiento. Evitar pedir TA de `wsfe` de producción desde la compu el día del pase. | El pase a producción quedó con un TA pedido desde la compu hasta las 23:04. |
| 10 | **Antes de pedir el CAE:** `FECompUltimoAutorizado` tiene que ser igual al último número que tiene el sistema. Si difieren, **no emitir**. Si hay timeout, **`FECompConsultar` ese número antes de reintentar**. | Diseño que evita duplicados y huecos en la numeración. |
| 11 | **`CondicionIVAReceptorId` obligatorio** (RG 5616; ARCA rechaza sin él desde el **01/12/2026**). Sale del padrón. | Aviso que ARCA manda en cada respuesta de wsfe. |
| 12 | **Exento del emisor** (operación sin IVA): el neto va en `ImpOpEx`, sin bloque `<Iva>`. El **receptor** exento con emisor RI recibe **Factura B con IVA**. | Confusión entre "cliente exento" y "operación exenta". |
| 13 | **"Mis Comprobantes" de ARCA demora 1 o 2 días.** Para confirmar una emisión se usa `FECompConsultar` o el QR. | Santiago pensó que la primera factura real no se había creado. |
| 14 | **El PDF necesita IIBB, inicio de actividades y "COD. 006"**, que no vienen del padrón. Se piden al arrancar (del PDF de Comprobantes en línea). Duplicado y triplicado no hacen falta. | El PDF salió con "—" y hubo que hacer otra vuelta. |
| 15 | **Una factura con CAE no se anula**: se corrige con nota de crédito. El sistema bloquea "anular" y ofrece la NC. Las pruebas en homologación también se compensan con NC. | Diseño. |
| 16 | **No confiar en respaldos que no sean ARCA** (CuitOnline): les faltan muchos CUIT. Un guion de prueba nunca debe depender de ellos. | Santiago probó en dev y "no traía nada". |
| 17 | **Git Bash:** `openssl req -subj "/C=AR/..."` necesita `MSYS_NO_PATHCONV=1`, porque si no la barra se convierte en una ruta de Windows. | El CSR falló la primera vez. |
| 18 | **Cambios de deploy que envían secretos**: el clasificador de permisos puede bloquear el push. Se deja todo listo y se le pasa a Santiago **un comando por bloque** para que lo corra. No buscarle la vuelta al bloqueo. | Pasó el 14/9. |

| 19 | **Una sociedad que nunca usó web services no tiene adheridos ni "Administración de Certificados Digitales" ni "Administración de puntos de venta y domicilios".** Se los delega a la persona con **"Nueva Relación"**, no con "Adherir Servicio": esa pantalla avisa que no vale en representación de otro. Después **no hace falta cerrar sesión**: el servicio aparece enseguida. | 30/9/2026: con QVTECH, la pantalla de certificados abría siempre como Chimpancé y parecía que faltaba permiso. |
| 20 | **La representada se cambia desde "Administrador de relaciones" del portal** (`selectAuthority.aspx`), no desde el servicio. El servicio abre con la última elegida y **no muestra selector**: siempre verificar la línea "Actuando en representación de…" antes de tocar algo. | Casi se crea el certificado de QVTECH a nombre de Chimpancé. |
| 21 | **El alta de punto de venta pide un campo "Actividad"** (código del padrón) que aparece recién al elegir el domicilio. | Cambio de ARCA posterior al trámite de Chimpancé. |
| 22 | **No clickear CONFIRMAR dos veces.** La segunda tira "La autorizacion … ya existe", que es inofensivo pero asusta. | 30/9/2026. |

## Capítulos (leer solo el que toca)

- **[01_tramite_arca.md](01_tramite_arca.md)** — checklist de arranque, claves y CSR (comandos), guion paso a paso de ARCA para la persona (producción + WSASS), qué verificar en cada captura. Leer al empezar cualquier conexión nueva o si el trámite se traba.
- **[02_codigo.md](02_codigo.md)** — mapa de la plantilla (qué hace cada archivo, qué adaptar), el formato exacto de los pedidos SOAP, tablas de códigos (comprobantes, IVA, condición del receptor), el QR y el PDF. Leer antes de escribir código.
- **[03_ambientes_y_secretos.md](03_ambientes_y_secretos.md)** — certificado por secretos del CI, pasos del deploy, candado producción/homologación, qué certificado usa cada ambiente. Leer al desplegar o si cambia el hosting.
- **[04_pruebas_y_errores.md](04_pruebas_y_errores.md)** — el script de prueba, guion de test en dev y verificación de producción, y la **tabla de errores de ARCA** con su causa y solución. Leer al probar o cuando algo falla.

## Referencia viva

La implementación completa está en el ERP: `Chimpa-Finanzas/server/domains/integrations/arca/` + `server/services/invoiceArca.ts` + `shared/fiscal.ts` (condiciones, A/B, concepto) + `client/src/components/facturacion/` (diálogo de emisión) + pasos "Certificado de ARCA" y "Factura electronica de ARCA" de `.github/workflows/deploy.yml`. La [plantilla/](plantilla/) es una copia al 18/9/2026 (rama `main`), para usar en otros proyectos sin el repo. Si en el ERP cambia algo de ARCA, hay que actualizar la plantilla y este skill.

Estado del ERP y datos de Chimpancé:
- CUIT 30718030648, RI, PV 2 "ERP CHIMPA" (RECE).
- Certificado `chimpafinanzas-padron`, vence el **11/09/2028**; el de homologación vence el 15/09/2028.
- IIBB 287552564, inicio de actividades 01/05/2023.
- 1ª factura real: B 0002-00000001, 16/9/2026.

Segundo emisor, QVTECH S.A.S. (QueVibra), conectado el 30/9/2026 en **una sola sesión**:
- CUIT 30719471451, RI, PV 2 "ERP QVTECH" (RECE). El padrón es la fuente de la razón social y el domicilio.
- Certificado `qvtech-erp`, serie 211ff7c77c542b49, **vence el 29/09/2028**.
- Trámite de 3 bloques: **no hizo falta WSASS**, porque las dos emisoras comparten el certificado de prueba de
  la persona y solo cambian el punto de venta de homologación (así no se pisa la numeración).
- El padrón tampoco se delega por emisora: la búsqueda por CUIT sale siempre con el certificado de Chimpancé.
- Pendiente: IIBB e inicio de actividades (del PDF de Comprobantes en línea).

El detalle está en la memoria `project_arca_integracion.md`. **Renovar los certificados antes de que venzan**: se genera un CSR nuevo con la misma clave, se sube en el mismo alias y se actualizan los secretos.

## Cómo trabajar

- Lo operativo del ERP (escalera dev → producción, tablero de sesiones, test obligatorio en Chrome) lo manda `erp-chimpa-finanzas`. Este skill aporta lo específico de ARCA.
- Para un sistema de un cliente, el trámite lo hace **el cliente con su clave fiscal**: el guion del cap. 01 se le manda tal cual, cambiando los datos.
- Montos en formato argentino ($ 1.234.567,89) y fechas DD/MM.
- Al terminar, actualizar la memoria del proyecto y, si se aprendió algo nuevo de ARCA, **sumarlo a este skill** (regla dura o fila de la tabla de errores).
