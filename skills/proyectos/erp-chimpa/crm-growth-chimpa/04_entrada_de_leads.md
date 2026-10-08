# 04 · Por dónde entra un lead

> Las seis puertas de entrada al CRM, qué crea cada una y qué NO. Los pendientes, en el cap. [05_backlog.md](05_backlog.md).

> **Estado al 29/9/2026: todo lo que está en este capítulo YA ESTÁ EN PRODUCCIÓN** (`origin/main` y `origin/dev` a la par,
> migraciones hasta 0045). Los sellos "en dev" de algunos títulos son de cuando se escribió cada sección: verificar siempre
> con `git log origin/main..origin/dev` antes de afirmar dónde está algo.


## Tabla de puertas

| Puerta | `origin` | Crea lead | Crea empresa | Notas |
|---|---|---|---|---|
| Formulario web del sitio (workspace `internal`) | `api` | **sí** (con dedupe) | no | Atribución completa (campaña, landing, experimento, first/last touch) |
| Formulario de un cliente (workspace `client`) | — | **no**: queda como **consulta** | no | Ver cap. 02 › Consultas |
| Plugin de Gmail | `manual` | sí, **solo si el mail es una consulta real** | sí, siempre en `crm_accounts` | La persona se puede agregar sin crear lead |
| Entrada de correo (bandeja de Gmail del ERP) | — | no crea lead solo | no | Atribuye el mail a empresa/contacto; el lead lo crea una persona |
| Chimpa IA (chat) | `chat` | sí, con confirmación humana | según el flujo | Borrador → confirmar |
| Carga a mano | `manual` | sí | sí (CRM) si hace falta | Único camino que elige empresa explícitamente |
| Importación de CSV | `import` | sí, con la fecha original | no | Solo admin; rechaza leads/contactos en un workspace de cliente |

**Regla que gobierna todo**: un lead es una **consulta real**. Si hace falta colgar algo de un lead por comodidad técnica,
está mal diseñado: colgarlo de la persona o de la oportunidad.

## 1. Formularios web

- `chimp.lead({ formKey, name, email, phone, company, message })` desde el navegador, o
  `POST /api/public/growth/:key/leads` con header `X-Growth-Server-Key` desde el backend del sitio (server actions de
  Next.js).
- Pipeline en `ingest.service.submitLead`: honeypot → reCAPTCHA (opcional) → validación → **dedupe** por email/teléfono
  dentro de `leadDedupDays` (30) → lead + atribución + identity + evento `lead_created` + notificación `lead.new`.
- Cada POST deja una fila inmutable en `growth_form_submissions` con status `accepted | duplicate | spam | rejected`.
- El dueño del lead es `workspace.defaultOwnerUserId` y la fuente `defaultAcquisitionSourceId` (seed: "Web / Formulario"),
  salvo que la campaña tenga la suya.
- **Estado real (21/9/2026)**: el snippet está instalado y midiendo en chimpance.digital, pero **los formularios del sitio
  todavía NO mandan el lead al ERP** (Prompt 2 de `Chimpa/web/3-replit/integracion-erp-crm.md`): las visitas se cuentan
  anónimas y no se juntan solas con el lead.

## 2. Plugin de Gmail (21/9/2026, en producción, migración 0036 — falta que Santiago lo instale y lo pruebe)

> Pedido de Santiago: "que cuando esté en Gmail pueda añadir fácil un contacto en Personas del CRM".

Una **extensión de Chrome** que corre dentro de Gmail (`mail.google.com`) y, para cada contacto de la pantalla —o cualquier
mail pegado a mano— ofrece dos cosas, siempre con un click de por medio:

1. **Agregar la persona** a Personas del CRM, asociada a una empresa.
2. **Crear el lead**, cuando ese mail es una consulta real. El asunto va de título y el cuerpo de mensaje.

La extensión **no vive en el servidor**: es una carpeta del repo (`gmail-plugin/`) que se instala en Chrome con "Cargar
descomprimida". No hay que publicarla en la Chrome Web Store ni pasa por el deploy.

### Las tres decisiones que lo explican todo

**1. Entra con una llave, no con la cookie.** La cookie de sesión del ERP es `sameSite: "lax"`, así que un pedido hecho
desde `mail.google.com` no la lleva. Aflojarla a `None` debilitaría el ERP entero, así que la llave va aparte: tabla
`user_api_tokens`, `Authorization: Bearer chimpa_…`. La llave la genera cada usuario en **Mi perfil → Plugin de Gmail**, se
ve **una sola vez** (en la base queda su SHA-256) y vale lo mismo que su dueño: su rol, sus permisos y su nombre en el
audit log. Generar otra con el mismo nombre revoca la anterior.

**2. La empresa se reconoce por el dominio del mail**, con las señales que el ERP ya tenía:
- el sitio del cliente (`companies.website`), vía `accountService.match`;
- el dominio de la prospección (`crm_accounts.domain`), mismo camino;
- y, si nada de eso da, los **contactos que la empresa ya tiene cargados** con un mail de ese dominio — **excluyendo los
  `autoLearned`** (los que aprendió sola la entrada de correo), para no prestarle a un cliente el dominio de la agencia que
  quedó en copia.

Las casillas personales (`DOMINIOS_PUBLICOS` de `emailFunnel.ts`: gmail, hotmail, outlook…) **nunca** sugieren empresa.

**3. Una empresa creada desde el plugin nace SIEMPRE en el CRM** (`crm_accounts`, prospección), nunca en Empresas. Un
contacto suelto de Gmail no es un cliente; si gana, pasa a Empresas por el camino que ya existe
(`accountService.promoteForOpportunity`). Si la empresa **ya** es cliente, la persona se suma a esa empresa como
`company_contact`.

### Mapa del código

| Dónde | Qué |
|---|---|
| `shared/schema.ts` › `userApiTokens` | Llaves personales: huella SHA-256, prefijo visible, `scope` ("gmail"), `lastUsedAt`, `revokedAt`. Migración **0036**. |
| `server/domains/integrations/gmail-plugin/apiToken.service.ts` | Crear / listar / revocar / verificar la llave. |
| `server/domains/integrations/gmail-plugin/gmailPlugin.routes.ts` | `/api/gmail-plugin/*` + `gmailTokenAuth`. |
| `server/domains/integrations/gmail-plugin/gmailPlugin.service.ts` | `lookup`, `companyForDomain`, `resolveCompany`, `addPerson`, `addLead`. |
| `server/domains/users/users.routes.ts` | `/api/users/me/tokens` (GET, POST, DELETE). |
| `client/src/components/users/GmailPluginCard.tsx` | La tarjeta de Mi perfil. |
| `gmail-plugin/` | La extensión: `manifest.json`, `background.js` (habla con el ERP, tiene la llave), `content.js` + `content.css` (el panel), `popup.*` (ambiente + llave), `README.md` (cómo instalarla). |
| `tests/gmailPlugin.api.test.ts` | 14 tests de integración contra el server real. |

### Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/gmail-plugin/me` | Con qué usuario entró la llave. |
| GET | `/api/gmail-plugin/sources` | Fuentes de adquisición, para el desplegable del lead. |
| POST | `/api/gmail-plugin/lookup` | Por cada mail: persona conocida, dónde está y qué empresa sugiere el dominio. Solo lectura. |
| GET | `/api/gmail-plugin/companies?q=` | Buscador de empresas (clientes + CRM). |
| POST | `/api/gmail-plugin/person` | Agrega la persona + el contacto en la empresa. Idempotente por mail. |
| POST | `/api/gmail-plugin/lead` | Lo anterior + el lead. |

### Gotchas que ya costaron

- **`req.session.touch is not a function`**: la sesión del ERP es `rolling: true`, así que express-session llama `touch()`
  (y `save()`) al cerrar cada respuesta. La sesión de mentira que arma `gmailTokenAuth` tiene que traer esos métodos como
  no-ops; si no, todas las rutas del plugin cortan con 500.
- **El lead necesita `companyNameText`**: la ficha del lead lee de ahí el nombre de la empresa. Con solo `accountId`, el
  lead queda bien atado pero la ficha muestra "Agregar empresa".
- **Rol `sales`**: `/api/gmail-plugin` tuvo que sumarse a `SALES_ALLOWED_PREFIXES` en `roleGuard.ts`, o el guardia lo
  bloquea antes de llegar al router.
- **Lo que lee de Gmail**: los contactos salen del atributo `email` (y `name`) de los nodos de Gmail, el asunto de `h2.hP`
  y el cuerpo de `div.a3s`. Es lo más estable que expone la interfaz, pero es DOM de Google: si algún día deja de encontrar
  contactos, mirar ahí primero.
- **Nada de CORS**: los pedidos salen del service worker de la extensión (`background.js`), que tiene `host_permissions`
  sobre el dominio del ERP. Por eso no hizo falta abrir CORS en el server, y la llave nunca queda en la página de Google.

## 3. Entrada de correo (10/9/2026, migración 0008)

- `email_messages` = bandeja de Gmail ya parseada por usuario (`gmailId` + `threadId` únicos por usuario, remitente,
  asunto, cuerpo, `receivedAt`, `status` pendiente/procesado/descartado/error, `motivo`, `companyId`/`contactId` cuando se
  atribuye, `atribuidoPor` contacto/hilo/dominio/nombre/ia/ninguno, `aiJson`/`aiModel`). El unique evita procesar el mismo
  mail dos veces si el sondeo se superpone.
- `email_blocked_senders` = remitentes bloqueados por usuario (mail completo o dominio `@x.com`, siempre en minúsculas).
- Pantalla `/correo`, ruta `/api/work/email`. **El colaborador no entra.**
- La bandeja **atribuye**, no prospecta: el lead lo crea una persona (desde el plugin o a mano). Los contactos que aprende
  sola quedan marcados `autoLearned` y por eso el plugin los ignora al adivinar la empresa.
- Gotcha: guarda `occurred_at = now()` en las interacciones, así que en la Historia los mails entrantes se ordenan por la
  hora del sondeo (pendiente en el cap. 05).

## 4. Chimpa IA (chat)

- El chat arma un **borrador** (`bot_intakes`) y **nada se guarda hasta que una persona confirma**. Arquitectura completa:
  cap. 02 del skill `erp-chimpa-finanzas`.
- Un lead cargado por chat queda con `origin: chat` y, en el Resumen de Growth, cuenta en "Origen del tráfico" con la
  fuente del CRM y el medio `(Chimpa IA)`.
- **Hoy el bot no tiene ninguna tool de CRM** y `/api/bot-chat` está en 403 para `sales`: habilitarlo con tools de CRM es
  un pendiente (cap. 05).

## 5. Carga a mano

Único camino donde se elige la empresa explícitamente, en este orden: `companyId` (cliente) → `accountId` (empresa del CRM)
→ `newAccount` ("es otra empresa") → si no se eligió nada, busca por dominio/nombre y si no está la crea en el CRM.
Si la fuente es "Referido", el alta exige el referidor (cap. 03).

## 6. Importación de CSV (solo admin)

- `growth_imports` + `import.service.ts` + parser propio (`csv.ts`). Tipos: `landing_visits`, `leads`, `contacts`,
  `ad_spend` (`campaign_revenue` NO se importa: los ingresos salen de los cobros reales).
- Preview dry-run + ejecución idempotente; crea las campañas "Software Factory (AdWords)" / "Web Express" y las 4 landings
  del sitio si faltan; los leads entran con **fecha original** y `origin: import`.
- Cómo exportar del panel viejo del sitio: Database → tabla → Export CSV, una por tabla.
- **Rechaza leads y contactos en un workspace de cliente** (esos no son prospectos de Chimpancé).
- Gasto de Google/Meta Ads también por CSV, con mapeo de columnas.

## 7. Referidos

No es una puerta técnica distinta (entra a mano o por el plugin) pero sí una fuente con reglas propias: ver
cap. [03_nucleo_comercial.md](03_nucleo_comercial.md) › Referidores.

## Qué NO crea empresa del CRM, a propósito

Los leads de formularios de Growth y los de mails **no crean empresa del CRM**: los workspaces de clientes no son
prospectos de Chimpancé y un remitente cualquiera no es una empresa en prospección. Si hace falta, se crea en el momento en
que una persona lo decide.
