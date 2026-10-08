# 01 · Trámite en ARCA (lo que hace la persona con clave fiscal)

## Checklist de arranque (una sola ronda de preguntas)

Preguntar todo junto, con AskUserQuestion o en una lista. Lo que se pueda averiguar solo (el padrón del emisor, por ejemplo) no se pregunta.

| Dato | Para qué | De dónde sale si no lo saben |
|---|---|---|
| CUIT y razón social del **emisor** | CSR, pedidos y PDF | El padrón (con el certificado ya hecho) |
| Condición del emisor: RI / monotributo / exento | RI → A/B (cbte 1/6, NC 3/8) · Monotributo → C (11, NC 13) · sistema del punto de venta | Padrón: impuesto 30 = IVA, `datosMonotributo` |
| Qué hace falta: padrón, factura o los dos | Qué servicios delegar | — |
| Tipos: facturas, NC, ¿ND?, ¿exportación E? | E = `wsfex`, otro servicio y fuera del alcance base | — |
| Moneda | El ERP factura **en pesos** (el USD se convierte al BNA venta del día y se congela). Facturar en dólares = `MonId DOL` + `MonCotiz`, a decidir | — |
| Concepto: productos (1), servicios (2), ambos (3) | Servicios exige período (`FchServDesde/Hasta`) y `FchVtoPago` | — |
| **PDF de una factura de "Comprobantes en línea"** | IIBB, inicio de actividades, domicilio, formato del PDF | Pedírselo: lo tienen seguro |
| ¿Qué número de punto de venta usan hoy? | El nuevo tiene que ser otro (el siguiente libre) | Pantalla de puntos de venta |
| Quién hace el trámite y **su CUIT personal** | WSASS saca el certificado de prueba a nombre de esa persona | — |
| Dónde corre el sistema: repo, CI/CD, servidor, quién tiene acceso | Cómo llega el certificado al servidor (cap. 03) | — |

## Claves y CSR (las dos de una vez)

Se generan en una carpeta **fuera del repo** o en una ignorada (`certs/` en `.gitignore`). En Git Bash siempre con `MSYS_NO_PATHCONV=1`.

```bash
cd certs/arca
# Producción: CUIT de la EMPRESA. El CN = alias que se va a cargar en ARCA.
openssl genrsa -out empresa-arca.key 2048
MSYS_NO_PATHCONV=1 openssl req -new -key empresa-arca.key -subj "/C=AR/O=RAZON SOCIAL SAS/CN=sistema-prod/serialNumber=CUIT 30XXXXXXXXX" -out empresa-arca.csr
# Homologación (WSASS): CUIT de la PERSONA que va a entrar a WSASS.
openssl genrsa -out empresa-arca-homo.key 2048
MSYS_NO_PATHCONV=1 openssl req -new -key empresa-arca-homo.key -subj "/C=AR/O=RAZON SOCIAL SAS/CN=sistema-homo/serialNumber=CUIT 20YYYYYYYYY" -out empresa-arca-homo.csr
openssl req -in empresa-arca.csr -noout -subject   # verificar
cp empresa-arca.csr ~/Downloads/                  # para que lo encuentre al subirlo
```

- El `.crt` que devuelve ARCA **solo funciona con su `.key`**. Nunca regenerar la clave si el CSR ya se subió.
- Para verificar que el .crt y la .key son pareja: `openssl x509 -noout -modulus -in X.crt | md5sum` tiene que dar igual que `openssl rsa -noout -modulus -in X.key | md5sum`.
- **Anotar en memoria** el nombre de cada archivo y el paso en que quedó el trámite.

## Guion del trámite (mandarlo entero; el usuario manda captura en cada bloque)

Se entra con clave fiscal (nivel 3) en https://auth.afip.gob.ar. Si pregunta a quién representa, **se elige la empresa**, no la persona.

### Bloque A · Certificado de producción
1. En "Mis Servicios" buscar **"Administración de Certificados Digitales"**.
   - Si no aparece: **"Administrador de Relaciones de Clave Fiscal"** → elegir la empresa → **"Adherir servicio"** → ARCA → Servicios Interactivos → "Administración de Certificados Digitales" → confirmar. Después cerrar sesión y volver a entrar.
2. **"Agregar alias"** → alias = el CN del CSR (exacto) → "Examinar" y elegir el `.csr` de Descargas → "Agregar alias".
3. Entrar al alias con **"Ver"** → descargar el certificado (.crt) → dejarlo en Descargas y avisar.
4. **Verificar vos**: emisor ARCA, sujeto = la empresa, vencimiento (2 años) y que el módulo coincida con la .key.

### Bloque B · Delegar los servicios (uno por uno)
1. **"Administrador de Relaciones de Clave Fiscal"** → elegir la empresa → **"Nueva Relación"**.
2. "Buscar" → **ARCA** → **WebServices** → elegir el servicio:
   - **"Consulta de constancia de inscripción"** (`ws_sr_constancia_inscripcion`) para el padrón.
   - **"Facturación Electrónica"** (`wsfe`).
3. En "Representante" → "Buscar" → **"Computador Fiscal"** → elegir el alias. **El campo "CUIT/CUIL/CDI Usuario" queda vacío.** → **CONFIRMAR**.
4. Sale un comprobante **F. 3283/E**: con eso está hecho. Repetir para el otro servicio.
5. **Verificar vos** con el script (cap. 04):
   - `login` + `persona` → trae los datos del propio emisor.
   - `tipos` → devuelve 36 tipos de comprobante, o sea que wsfe está delegado.
   - `ptosventa` → devuelve `602 Sin Resultados` hasta que exista el PV web services. Es normal.

### Bloque C · Punto de venta para web services (solo si factura)
1. "Mis Servicios" → **"Administración de puntos de venta y domicilios"** → elegir la empresa → **"A/B/M de Puntos de venta"** → **"Agregar"**.
2. Completar:
   - **Número:** el siguiente libre (si usan el 1, el 2).
   - **Nombre:** algo como "ERP <Empresa>".
   - **Sistema:**
     - Si es **RI**: **"RECE para aplicativo y web services"**.
     - Si es monotributo: la opción "Factura Electrónica - Monotributo - Web Services".
     - **No** elegir "Factura en Línea", "Comprobantes en línea" ni "Bonos Fiscales".
   - **Domicilio:** el fiscal.
   - **Dominio asociado:** vacío.
3. **Verificar vos:**
   - `ptosventa` → aparece el número con `EmisionTipo` "CAE - Ri Iva" (o similar) y `Bloqueado N`.
   - `ultimo <pv> <tipo>` → 0 si es nuevo.

### Bloque D · Certificado de prueba (WSASS, homologación)
1. Primero hay que habilitar WSASS: **"Administrador de Relaciones"** → **"Adherir servicio"** → ARCA → Servicios Interactivos → **"WSASS - Autogestión Certificados Homologación"**. Sale un F. 3283/E. Después cerrar sesión y volver a entrar.
2. Entrar a **WSASS** → **"Nuevo Certificado"**:
   - **Nombre simbólico del DN:** el alias de homologación.
   - **CUIT del contribuyente:** aparece **el de la persona** y no se puede cambiar. Es normal, por eso el CSR de homologación ya va con ese CUIT.
   - **Solicitud PKCS#10:** pegar el contenido del `.csr` de homologación completo, con las líneas BEGIN y END. Se le pasa en un bloque de código.
   - **"Crear DN y obtener certificado"** → copiar el texto `-----BEGIN CERTIFICATE-----…` y pegarlo en el chat. Es público, no hay problema. Guardarlo como `.crt`.
3. **"Crear autorización a servicio"**:
   - DN = el alias.
   - CUIT representada = el de la persona.
   - Servicio = **wsfe**.
   - → "Crear Autorización de Acceso".
   - La constancia puede decir `SERVICIO=ws://arbccf`: **anda igual**. Se verifica con el script.
4. **Verificar vos**:
   - `tipos` y `ultimo 2 6` con el certificado de homologación (en homologación el `<cuitEmisor>` es el de la persona).
   - En homologación **no hace falta crear punto de venta**: `ptosventa` da 602, pero se emite igual con cualquier número (se usó el 2).

## Si el trámite se corta

Se busca en memoria el último paso anotado. Si no hay nada:
- ¿Existe la `.key`?
- ¿Hay `.crt` en Descargas más nuevo que el `.csr`? Se busca con `find ~/Downloads -newer X.csr -name "*.crt"`.
- El script dice qué servicios responden.

Con eso se sabe dónde quedó sin preguntarle nada a la persona.
