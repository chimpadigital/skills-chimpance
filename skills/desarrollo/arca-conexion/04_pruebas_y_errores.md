# 04 · Pruebas y errores

## Script de prueba (solo lectura)

[scripts/arca_smoke.sh](scripts/arca_smoke.sh) usa openssl + curl, anda en Git Bash y Linux, y reusa el ticket en `./.arca-smoke/`. Se corre **desde el scratchpad**, no desde el repo. Probado el 18/9/2026 contra homologación.

```bash
S=~/.claude/skills/arca-conexion/scripts/arca_smoke.sh
bash $S cert.crt clave.key prod persona 30718030648 30500010912     # padrón: emisor, CUIT buscado
bash $S cert.crt clave.key prod tipos 30718030648                   # wsfe delegado → "tipos de comprobante: 36"
bash $S cert.crt clave.key prod ptosventa 30718030648               # ¿el PV web services existe?
bash $S cert.crt clave.key prod ultimo 30718030648 2 6              # último Factura B en PV 2
bash $S cert.crt clave.key prod consultar 30718030648 2 6 1         # ¿existe B 0002-1? CAE, total, receptor
bash $S homo.crt homo.key homo ultimo 20345986317 2 6               # homologación: CUIT de la persona
```

- Emitir de prueba (pedir CAE) **se hace desde el sistema en dev**, no con el script. Así se prueba el código de verdad.
- Si igual hace falta emitir a mano en homologación, se hace con `FECAESolicitar` usando el formato del cap. 02 y **solo** con el certificado de homologación.

CUIT útiles para probar el padrón:
- 30500010912: Banco Nación, RI.
- 30648389392: Aapresid, exento.
- Uno propio, persona física.
- Uno mal tipeado, por ejemplo 30718030649: el sistema lo tiene que frenar sin consultar a ARCA.

## Guion de test en dev (homologación)

Se crean datos propios con el prefijo "PRUEBA –" y al final se limpian.

1. Cliente **exento** con CUIT y cuenta por cobrar en **USD**:
   - "Facturar" tiene que precargar **Factura B**, el aviso de la condición, el concepto, el período y el vencimiento.
2. Emitir → aparece el CAE en unos 3 s. La cuenta queda congelada en pesos.
3. **Ver PDF**: letra, "COD. 006", CAE, QR, IIBB, inicio de actividades y "sin validez fiscal".
   - Chrome no deja capturar su visor de PDF: el PDF se baja con `fetch` y se renderiza en la compu con el mismo código.
4. Menú de la factura con CAE: **no** tiene "Anular", solo "Ver PDF" y "Nota de crédito".
5. Emitir la **NC** → CAE y asociada a la factura; la cuenta queda cancelada.
6. Cliente sin CUIT o sin condición → aviso + "Completar ficha", y no emite.
7. **Limpieza:** las facturas de prueba con CAE se compensan con su NC, y los clientes y cuentas "PRUEBA" se anulan.

Si Chrome da "Cannot take screenshot with 0 width", la ventana está minimizada. Se sigue con `read_page` / `javascript_tool` y se avisa que la captura quedó pendiente.

## Verificación de producción (después del pase)

- **Solo lectura:** un endpoint de estado (`/api/.../status`) tiene que devolver `env: produccion`, el PV y el CUIT correctos, y el botón "Facturar" tiene que estar visible. **No emitir nada.**
- La primera factura real la emite el usuario. Antes, se le pasa:
  - Qué revisar en el diálogo: letra, detalle, período y total en pesos.
  - Qué hacer si hay un error: copiar el texto y **no reintentar a ciegas** si dice "no se pudo confirmar" o `OUT_OF_SYNC`.
- Se confirma con `consultar`: `Resultado A` + CAE, y tienen que coincidir con el sistema.
- "Mis Comprobantes" de ARCA la muestra recién al día siguiente, o hasta 48 hs. Es normal.

## Tabla de errores de ARCA

Los códigos numéricos de wsfe (10016, 10015, 10242…) son de referencia: el que manda es el texto de `Err/Msg` u `Obs/Msg` que devuelve ARCA, que el sistema muestra entero.

| Síntoma / mensaje | Causa | Qué hacer |
|---|---|---|
| `dh key too small` / `EPROTO` al llamar a wsfe | El servidor de ARCA usa DH chico; el OpenSSL de Node o de Linux lo rechaza | Agente `https` con `ciphers: "DEFAULT@SECLEVEL=1"` solo para wsfe; con curl, `--ciphers DEFAULT@SECLEVEL=1` |
| WSAA `coe.alreadyAuthenticated` / "ya posee un TA válido" | Ya hay un ticket vigente para ese certificado y servicio, y se perdió (reinicio sin cache en disco, o se pidió desde otra máquina) | No se emitió nada. Cachear el TA en disco; esperar a que venza (12 h desde que se pidió) |
| WSAA `cms.cert.untrusted` / `notAuthorized` | Certificado de un ambiente usado contra el otro (homologación ↔ producción), o servicio no delegado | Revisar las URL del ambiente; delegar el servicio (cap. 01 › B) |
| WSAA `xml.generationTime.invalid` / expiración | Reloj corrido o fechas sin offset | `generationTime` = ahora − 10 min, `expirationTime` = ahora + 10 min, en ISO con `-03:00` |
| wsfe `600` token/sign inválido | TA vencido o de otro certificado | Invalidar el TA cacheado y pedir uno nuevo (reintento automático una vez) |
| wsfe `602 Sin Resultados` en `FEParamGetPtosVenta` | No hay PV web services. En homologación es **normal** | En producción, crear el PV (cap. 01 › C) |
| `10016` número de comprobante no es el próximo | Se calculó el número sin preguntar a ARCA | Siempre `FECompUltimoAutorizado` + 1, dentro del lock |
| `10015`/`10013` documento del receptor | CUIT inválido o DocTipo equivocado | Validar el dígito verificador; DocTipo 80 para CUIT |
| `10242`/`10243` condición IVA del receptor | Falta o no corresponde a la letra (RG 5616) | Mandar `CondicionIVAReceptorId` según la letra (cap. 02 › Tablas) |
| Rechazo por fecha del comprobante | En servicios, la fecha tiene que estar a ±10 días de hoy | Validar antes de emitir |
| Rechazo por importes | `ImpTotal` ≠ suma de las partes, o redondeo | Redondear a 2 decimales cada parte y sumar |
| `ARCA_OUT_OF_SYNC` (nuestro) | ARCA tiene un número que el sistema no tiene, o al revés | **No emitir.** `consultar` ese número; si es nuestro (corte), registrarlo en el sistema; si no, revisar con el usuario |
| `ARCA_UNCERTAIN` (nuestro) | Timeout y ARCA tampoco respondió la consulta | **No reemitir.** Esperar y `consultar` |
| Padrón: `No existe persona con ese Id` | CUIT inexistente | Respuesta definitiva, no hay que reintentar con otro servicio |
| Padrón sin `datosGenerales`, con `errorConstancia` | CUIT cancelado, domicilio incompleto, etc. | Mostrar los avisos; si viene el nombre, usarlo |
| La factura "no aparece en ARCA" | "Mis Comprobantes" no es en tiempo real | `consultar` o el QR |
| El respaldo sin certificado "no trae nada" | CuitOnline no tiene todos los CUIT | Configurar ARCA; no basar pruebas en el respaldo |
| `openssl req` falla con `/C=AR` en Git Bash | MSYS convierte la barra en una ruta de Windows | `MSYS_NO_PATHCONV=1` |

Si aparece un error nuevo, se agrega una fila acá.
