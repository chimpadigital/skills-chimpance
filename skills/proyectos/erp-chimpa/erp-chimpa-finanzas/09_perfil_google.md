# 09 · Perfil de usuario + Google Calendar/Meet (8/9/2026)

> **Nota 12/9/2026:** ya no hay ambiente local. Donde este capítulo diga "local :5001", `erp-local` o `admin/admin1234`, leerlo como historia: hoy se prueba en https://dev-finanzas.chimpance.digital (ver cap. 01).

Pedido de Santiago: "que cada usuario tenga su perfil, que pueda modificar su avatar, y poner las
credenciales para conectar con Google Calendar y Google Meet". Se armó en una sesión: perfil propio +
avatar (código completo, probado de punta a punta en pruebas) y la infraestructura de OAuth de Google
(código completo, probado el estado "no configurado"; falta que Santiago cree la app en Google Cloud
Console y pegue las credenciales para probarlo conectando de verdad).

## Dónde vive en la pantalla

| Lugar | Qué hay |
|---|---|
| **Mi perfil** (`/perfil`, entrás desde el avatar del header › "Mi perfil") | tu foto (subir/cambiar/quitar, click o drag&drop), tu nombre (editable inline), usuario y rol (solo lectura), tarjeta **Google Calendar y Meet** con el estado de conexión |
| **Header** (`Layout.tsx`) | el círculo del avatar ahora muestra la foto real si subiste una (antes solo la inicial); el dropdown suma "Mi perfil" arriba de "Cerrar sesión" |
| **Admin › Usuarios** | la lista muestra el avatar de cada usuario junto al nombre (sin uploader ahí: cada uno sube el suyo desde su perfil) |

Todos los roles llegan a `/perfil` (admin, operator, collaborator, accountant, sales): cada quien conecta
su propia cuenta de Google, no es un ajuste de admin.

## Avatar

Mismo patrón que el logo de empresa (cap. 08): archivo en `uploads/avatars/<uuid>.<ext>` (PNG/JPG/WebP,
≤ 2 MB, firma real validada), ruta en `users.avatar_path`. Un usuario solo puede subir/quitar el **suyo**
(`POST`/`DELETE /api/users/me/avatar`); cualquiera autenticado puede **ver** el de otro
(`GET /api/users/:id/avatar`, hoy usado en Admin › Usuarios). `GET /api/users/me/avatar` es la ruta que
usan el header y `/perfil` (no requiere saber el uuid propio y está en la allowlist de todos los roles).
Componentes: `UserAvatar` (circular, iniciales de fallback — a diferencia de `CompanyLogo` que es
cuadrado) y `AvatarUploader` (subir/cambiar/quitar) en `client/src/components/users/`.

## Google Calendar + Meet (OAuth por usuario)

Hasta ahora el calendario de "Hoy" es **solo lectura** vía URL secreta iCal (cap. 07). Esto es distinto:
cada usuario **conecta su cuenta de Google** por OAuth para que el ERP pueda **crear** eventos con link
de Meet automático en su calendario real (googleCalendarService.createMeetEvent, expuesto en
`/perfil` como botón "Crear reunión de prueba" — todavía no está enganchado a ningún flujo automático
como crear una tarea tipo Reunión; es la base para eso).

- **Tokens cifrados**: se reutiliza la bóveda AES-256-GCM del playbook de clientes (`server/domains/clientes/vault.ts`,
  `VAULT_KEY` — mismo gotcha del cap. 08: si `VAULT_KEY` cambia, las cuentas de Google quedan
  ilegibles y hay que reconectar).
- **Flujo**: `/perfil` → "Conectar con Google" → `GET /api/integrations/google/connect` arma la URL de
  Google con `access_type=offline&prompt=consent` (fuerza refresh_token siempre) y un `state`
  anti-CSRF guardado en la sesión → Google → el usuario acepta → Google vuelve por
  `GET /api/integrations/google/callback` (navegación del browser, no fetch de la UI: los errores
  también vuelven como redirect a `/perfil?google=error&reason=...`) → se guarda `user_google_accounts`
  (email, tokens cifrados, scope, vencimiento) → redirige a `/perfil?google=connected`.
- **Panel de Conexiones (9/9/2026)**: `/perfil` ya no muestra una sola tarjeta "Google Calendar y Meet" sino
  la tarjeta **Conexiones**, con una fila por servicio (ícono + descripción + pastilla Conectado/Sin conectar +
  botón). El catálogo vive en `GOOGLE_SERVICES` (`google.config.ts`) y es la fuente de verdad: el server lo
  devuelve en `GET /status` junto con el estado de cada fila, y el cliente solo mapea `id` → ícono.
  - `GET /connect?service=calendar|meet|drive|gmail` pide **solo** los permisos de esa fila. Como el OAuth
    manda `include_granted_scopes=true`, Google **suma** lo nuevo a lo ya concedido: se conecta de a uno sin
    perder lo anterior, y sin tabla nueva ni migración (el estado sale de la columna `scope` que ya se guardaba).
  - `connectedServiceIds(scope)` (pura, 14 tests en `tests/googleServices.test.ts`) traduce los permisos
    concedidos al estado de cada fila. Un servicio cuenta como conectado **solo si están TODOS sus scopes**:
    con uno solo el botón fallaría igual y mostrarlo en verde sería mentir.
  - **Meet no tiene scope propio**: comparte `calendar.events` con Calendar (el link sale del evento). Es fila
    aparte porque para Santiago son dos cosas, pero conectar una prende la otra — y la descripción lo dice.
  - **Desconectar es todo o nada**: Google no permite revocar un permiso suelto, se corta la cuenta entera.
  - Sin credenciales en el servidor, las cuatro filas se dibujan igual (grises, botón `outline` deshabilitado)
    con el aviso de que falta configurar; antes no se mostraba nada y parecía que la función no existía.
- **GOTCHA de scopes (10/9/2026, costó un ida y vuelta)**: `calendar.events` da acceso a los EVENTOS de todos
  tus calendarios, pero **no alcanza para enumerar la lista de calendarios** — `calendarList.list` responde
  `insufficient authentication scopes`. Eso necesita `calendar.calendarlist.readonly` aparte. Va como
  `extraScopes` del servicio (se pide al conectar pero NO define el estado): así sumarlo no desconecta a quien
  ya estaba conectado ni le corta la agenda, y lo gana cuando aprieta "Reconectar". El diálogo de calendarios
  detecta que falta (`hasGrantedScope`) y devuelve `needsReconnect: true` en vez de un error — antes ese 422
  se veía en pantalla como "todavía no conectaste tu cuenta", que era mentira y confundía.
- **Scopes por servicio**: identidad (`openid`, `email`) en toda conexión; **Calendar/Meet** `calendar.events`
  + `calendar.calendarlist.readonly` (extra);
  **Drive** `drive.file` (solo los archivos que crea o abre el ERP, NO todo el Drive) + `documents.readonly`
  (leer los Docs de Gemini para "Importar reunión", cap. 07); **Gmail** `gmail.send` (mandar, no leer la bandeja).
  **Los scopes de Docs (9/9), Drive y Gmail (9/9) se sumaron después**: quien ya estuviera conectado tiene que
  conectar de nuevo la fila que le falte desde `/perfil`. Ojo: pedir permisos que la app todavía no usa (Drive y
  Gmail no tienen función detrás al 9/9/2026) puede demorar la aprobación de Google si la app queda **External**;
  decisión explícita de Santiago para tener el panel completo desde el arranque.
- **La agenda de "Hoy" lee de acá (10/9/2026)**: `googleCalendarService.listEvents` trae los eventos del calendario
  principal (`singleEvents=true` para expandir las series repetidas) y `calendarService.eventsForUser` decide la fuente:
  cuenta de Google conectada → Google; si no → feeds iCal. Detalle y gotchas en el capítulo 07 › Agenda del día.
- **Refresh automático**: `googleOAuthService.getValidAccessToken` refresca solo si falta menos de 1
  minuto para que venza (margen), sin que el usuario haga nada.
- **Desconectar**: `POST /api/integrations/google/disconnect` revoca el token en Google y borra la fila.
- **Sin `googleapis` (paquete npm)**: todo por `fetch` nativo a los endpoints de Google (mismo criterio
  que `calendar.service.ts` con node-ical y `exchangeRate.ts`), para no sumar una dependencia pesada.

### Credenciales: cargadas en dev (10/9/2026) y en producción (verificado 16/9/2026)

Santiago creó el cliente OAuth en Google Cloud y `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` están en
`/opt/chimpa-dev/.env` y en `/opt/chimpa/.env`: `GET /api/integrations/google/status` da `configured: true` en los dos.
Cuentas conectadas al 16/9/2026: en **producción** el usuario `admin` tiene el Google de **scastro@** (Gmail conectado);
en **dev** el `admin` tiene el de **sprados@** (Calendar/Meet/Gmail, sin Drive). Ojo al probar algo que manda mails
desde dev: sale de la casilla que esté conectada en ese usuario.
Sin esas variables, `/perfil` dibuja igual las cuatro filas pero grises, con el aviso de que falta configurar.

Gotcha del 10/9/2026: el admin de dev tenía la contraseña vieja. `seedDefaultAdmin` siembra el usuario
**una sola vez** y nunca le actualiza la clave, así que cambiar `ADMIN_PASSWORD` en el `.env` no cambia
la del usuario ya creado. Se resincronizó a mano (bcrypt + UPDATE). Puede pasar lo mismo en producción.

Pasos originales, por si hay que rehacerlo:

Pasos en [console.cloud.google.com](https://console.cloud.google.com) (con el proyecto ya existente):
1. **APIs & Services › Library** → buscar "Google Calendar API" → Habilitar.
2. **APIs & Services › OAuth consent screen** → si el proyecto está dentro del Workspace de Chimpancé,
   tipo **Internal** (evita el límite de 7 días de refresh token de las apps "External" sin verificar);
   si no, **External** + agregar como test users los emails del equipo. Scopes: `.../auth/calendar.events`,
   `.../auth/drive.file`, `.../auth/documents.readonly`, `.../auth/gmail.send`, `openid`, `email` (los del
   catálogo `GOOGLE_SERVICES`). Habilitar también en la Library (paso 1) la **Google Docs API**, la
   **Google Drive API**, la **Gmail API** y la **People API**, además de la de Calendar.
   **OJO con la People API**: es la de los contactos y es fácil de olvidar porque se sumó después (10/9/2026).
   Si falta, el buscador de participantes muestra solo los contactos del ERP y en el log aparece
   `People API has not been used in project ... or it is disabled`. El diálogo ahora lo avisa en pantalla
   (`googleContacts: "error"`) en vez de mostrar "sin resultados" como si la libreta estuviera vacía.
3. **APIs & Services › Credentials › Create Credentials › OAuth client ID** → tipo **Web application** →
   nombre "Chimpa Finanzas" → **Authorized redirect URIs**, las 3 (un mismo Client ID sirve para todo):
   - `http://localhost:5001/api/integrations/google/callback` (erp-local)
   - `https://dev-finanzas.chimpance.digital/api/integrations/google/callback`
   - `https://finanzas.chimpance.digital/api/integrations/google/callback`
4. Copiar **Client ID** y **Client secret**.

Dónde van (nunca en el repo, no hay `.env` versionado):
- **Local** (erp-local): agregar dos líneas `set GOOGLE_CLIENT_ID=...` y `set GOOGLE_CLIENT_SECRET=...`
  en `C:\Users\santi\.chimpa-finanzas-db\dev-local.cmd` (mismo lugar que `OPENAI_API_KEY`), después reiniciar el server.
- **Nube** (dev/producción): el CTO tiene que agregarlas al `.env` del servidor (igual que hizo con
  `VAULT_KEY`, cap. 01/08) — nosotros no tenemos acceso SSH.

`googleRedirectUri()` arma la URL sola a partir de `PUBLIC_BASE_URL` (si está seteada, como en Growth) o
del host de la request: por eso no hace falta una variable de entorno separada por ambiente.

## API (`server/domains/integrations/google/`, montado en `/api/integrations/google`)

`GET /status` (`{configured, connected, email?}`) · `GET /connect` (redirect a Google) ·
`GET /callback` (Google vuelve acá) · `POST /disconnect` · `POST /events` (crea evento con Meet:
`summary`, `description?`, `startsAt`, `endsAt`, `attendeeEmails?` → `{eventId, htmlLink, meetingUrl}`).
Agregado a las allowlists de collaborator/accountant/sales en `roleGuard.ts` (prefijo `/api/integrations`)
para que cualquier rol pueda conectar su propia cuenta.

Perfil propio (`server/domains/users/`, en `/api/users`): `PATCH /me` (`{displayName}`) ·
`POST`/`DELETE /me/avatar` · `GET /me/avatar` · `GET /:id/avatar`.

## Mapa del código

| Qué | Dónde |
|---|---|
| Schema | `shared/schema.ts` › `users.avatarPath`, tabla `userGoogleAccounts` |
| SQL manual / migración | `scripts/sql/2026-09-08_perfil_google.sql` · `migrations/0004_perfil_google.sql` |
| Avatar | `server/domains/users/avatar.service.ts` (servicio) + rutas en `users.routes.ts` |
| Google OAuth | `server/domains/integrations/google/` (`google.config.ts`, `googleOAuth.service.ts`, `googleCalendar.service.ts`, `google.routes.ts`) |
| UI | `client/src/pages/Perfil.tsx` · `client/src/components/users/` (`UserAvatar`, `AvatarUploader`) · header en `Layout.tsx` |

## Estado al 8/9/2026 y qué falta

- **Hecho y probado** (servidor de verificación aparte en :5002 contra `chimpance_pruebas`, sin tocar la
  sesión de pruebas de otra persona en :5001): subir/cambiar/quitar avatar (curl + navegador), avatar en
  el header y en Admin › Usuarios, editar nombre propio, permisos por rol (collaborator llega a
  `/api/integrations` y a su propio avatar, sigue sin llegar a `/api/companies`), estado "no configurado"
  de Google. SQL aplicado a `chimpance_pruebas`; migración `0004` generada y verificada contra una base
  vacía.
- **Pendiente de Santiago:** crear la app OAuth en Google Cloud (pasos arriba) y pasar
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`; una vez conectado, probar "Crear reunión de prueba" en `/perfil` end-to-end. (La migración `0004` ya está
  en producción; el pendiente viejo de aplicar el SQL a `chimpance_erp` murió con la baja de ese ambiente.)
- **Ideas no acordadas:** enganchar `createMeetEvent` a las tareas tipo Reunión (botón "Generar con Meet"
  en el campo `meetingUrl` que ya existe, cap. 07) en vez de ser solo un botón de prueba en el perfil;
  dejar que el header muestre el avatar de otros usuarios en listas (asignados de tareas, etc.).

## Enviar factura por email con Gmail (17/9/2026, en `dev`, migración 0024)

Primer uso real de `gmail.send`. Pedido de Santiago: mandarle la factura al cliente sin salir del ERP.

- **Decisiones de Santiago (16-17/9/2026)**: se manda **siempre a mano** (nunca automático al emitir); sale del
  **Gmail de quien envía** con **su firma de Gmail**; **CC fijo a scastro@** (constante `INVOICE_EMAIL_FIXED_CC`
  en `invoiceEmail.compose.ts`; si quien manda es esa casilla, no se agrega).
- **Contactos de facturación**: `company_contacts.receives_invoices` (varios por empresa). Casilla "Recibe las facturas"
  en el alta/edición de contacto de `/empresas/:id` (exige mail) y etiqueta "Facturación" en la lista (cap. 08).
- **Diálogo** `client/src/components/facturacion/EnviarFacturaDialog.tsx`: se abre desde el cierre "emitida en ARCA"
  (`ArcaEmittedDialog`, botón principal "Enviar por email") y desde Facturas › ⋯ › "Enviar por email…" (facturas y NC
  con CAE; no para el contador). Para precargado con los contactos de facturación + sugeridos + mails sueltos (con
  "Guardar como contacto de facturación", tildado por defecto si la empresa no tenía ninguno), CC, asunto
  "Factura B 0002-00000001 · concepto" (con "PRUEBA – " si es de homologación), mensaje del Chimpa IA editable
  ("Redactar de nuevo"; si la IA falla queda un texto base), PDF adjunto y aviso de la firma. Estados: sin Google en
  el server, sin Gmail conectado (lleva a Mi perfil antes de escribir), comprobante de prueba, ya enviada, Gmail
  rechazó (reconectar), doble envío (mismo destinatario < 60 s → 422).
- **Backend** `server/domains/invoicing/invoiceEmail.*` montado en `/api/invoices`: `GET /:id/email` (borrador),
  `POST /:id/email/body` (IA, gpt-4o-mini), `POST /:id/email/send`. El MIME se arma a mano en
  `google/gmailCompose.ts` (multipart texto+HTML+PDF, encabezados UTF-8, sin inyección de encabezados) y sale por
  `googleGmailService.sendMessage` (`users.messages.send`). La firma se lee con `getSendAsIdentity`
  (`settings/sendAs`), que necesita **`gmail.readonly`** (el permiso extra de la entrada de correo): sin él sale
  "Nombre · Chimpancé Digital".
- **Registro**: tabla `invoice_email_sends` (factura, quién, desde qué casilla, para, CC, asunto, cuerpo, si lo
  redactó la IA sin tocar, adjunto, id y thread de Gmail, fecha) + audit log `invoice/email_sent`.
  `invoiceService.list` suma `emailSends {count, lastSentAt, lastTo}` y Facturas muestra "Enviada dd/mm" con tooltip.
- **Tests**: `tests/invoiceEmail.test.ts` (MIME, asunto, saludo, texto base sin "su/sus", firma, nombre desde mail).


## Fotos en todos los avatares (24/9/2026)

Regla: **todo avatar de una persona usa `PersonAvatar`** (`client/src/components/users/PersonAvatar.tsx`), no el `Avatar` pelado de `@/components/ds`. Le pasás lo que tengas (`userId`, `personId`, `leadId`, `contactId`, `email`; `userName` SOLO para gente del equipo) y busca la foto en el **índice de fotos** (`GET /api/crm/people/photo-index`, `photoIndex.service.ts`): una sola foto por persona (contacto › lead, igual que la ficha de Personas) repartida a todos sus registros, más los avatares del equipo (Mi perfil). Sin foto → iniciales. Los mails no viajan al rol `sales`.
- Excepciones: páginas públicas (`/review/:token`, `/reunion/:token`, sin sesión → iniciales), el iso de Chimpancé y el "sin asignar".
- Al cambiar una foto (LinkedIn del lead o del contacto) invalidar `/api/crm/people` para refrescar el índice.
- Hilo de feedback: en la vista del equipo cada mensaje trae `reviewerId`; la foto se muestra solo en los mensajes del revisor del feedback.
