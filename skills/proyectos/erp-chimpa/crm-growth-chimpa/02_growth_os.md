# 02 · Growth OS: adquisición, tracking, formularios, A/B, inversión

> Los **pendientes** de todo lo que está acá viven en el cap. [05_backlog.md](05_backlog.md). Este capítulo cuenta **cómo
> funciona** lo que ya existe. Si algo se termina, se documenta acá y se tacha allá.

> **Estado al 29/9/2026: todo lo que está en este capítulo YA ESTÁ EN PRODUCCIÓN** (`origin/main` y `origin/dev` a la par,
> migraciones hasta 0045). Los sellos "en dev" de algunos títulos son de cuando se escribió cada sección: verificar siempre
> con `git log origin/main..origin/dev` antes de afirmar dónde está algo.


Módulo construido el 5/9/2026 (commit `db613a6` fase 0+1 backend + snippet; fase 2 UI en curso) a partir de dos documentos
de Santiago guardados en el repo (`CRM/chimpance_growth_intelligence_os_documento_maestro_estrategico_v1.md` = visión
"Chimpancé Growth Intelligence OS"; y la documentación del panel de conversiones del sitio Next.js). Decisión:
**centralizar TODO en el ERP** (el sitio y los sitios de clientes pasan a ser clientes delgados que hablan por API) y
**no** construir un producto aparte en Next.js/Supabase como sugería el documento.

**Fuente de verdad técnica: `docs/growth/api-contract.md`** (contrato público e interno, algoritmo A/B, definiciones de
métricas, qué hace el snippet). Leerlo antes de tocar cualquier cosa del módulo.

## Conceptos (todo en `shared/schema.ts`, sección GROWTH OS)

- **Workspace** (`growth_workspaces`): espacio aislado de adquisición. `chimpance` (kind `internal`) es el default y contiene
  todo el CRM histórico; cada cliente con campañas (MT Agro, Regio, OG…) tendrá el suyo (kind `client`, `companyId`).
  Claves: `publicKey` (`gw_pub_…`, va al navegador) y `serverKey` (`gw_srv_…`, solo server-to-server, saltea captcha/honeypot).
  Config: `defaultOwnerUserId` (dueño de los leads que entran por API), `defaultAcquisitionSourceId` (seed: "Web / Formulario"),
  `leadDedupDays` (30), `recaptchaSecret`/`recaptchaMinScore` (opcional).
- **Scoping del CRM**: `crm_leads`, `crm_opportunities`, `crm_pipelines`, `crm_sessions`, `crm_identities`, `crm_events`
  tienen `workspace_id NOT NULL` (backfilleado a Chimpancé). Pipeline default y nombre único son POR workspace
  (`pipelineService.getDefaultPipeline(workspaceId)`, `createStandardPipeline(workspaceId)` para uno nuevo).
  `crm_leads.origin` = manual | api | chat | import. Las rutas del CRM aceptan `?workspaceId=`/`body.workspaceId`;
  si falta, usan el default (`workspaceService.getDefaultId()`).
- **Campañas** (`growth_campaigns`): canal + mapeo de atribución `utmCampaign` exacto y `utmAliases` (case-insensitive);
  `acquisitionSourceId` opcional para que los leads de esa campaña caigan en esa fuente del CRM (así siguen vivos
  `profitability-by-source` y `client-ltv`).
- **Landings** (`growth_landings`): slug único por workspace + URL (match por origin+pathname).
- **Experimentos** (`growth_experiments` + `_variants` + `_exposures`): asignación determinística `fnv1a32` (con `Math.imul`)
  idéntica en `server/domains/growth/stats.ts` y en `client/public/growth.js`; el `workspace.id` viaja en `/config` porque
  entra en el hash. Modos `redirect` (una URL por variante) / `flag` (el sitio aplica el cambio). Resultados: z-test de dos
  proporciones vs control, lift, SRM (chi²), warnings (<100 exposiciones, <14 días). Cambiar la `key` fuera de `draft`
  está prohibido (re-barajaría a todos).
- **Inversión** (`growth_spend`): monto + moneda; USD se congela al BNA venta (`fxRate`, `amountArs`); prorrateo por días al
  cruzar con un rango; anulación lógica; `obligationId` opcional para atarlo a la factura AP real.
- **Ingresos**: NUNCA se cargan a mano. `server/domains/growth/revenue.ts` → lead → oportunidad ganada → proyecto
  (`projects.opportunityId`) → cobros reales (`fetchArCollectionsArs`, ahora exportada de `services/analytics.ts`).
- **Envíos** (`growth_form_submissions`): fila inmutable por cada POST a `/leads` con status accepted | duplicate | spam |
  rejected. **Atribución del lead** (`growth_lead_attribution`, 1:1): landing, campaña, experimento/variante, click IDs,
  `firstTouch` (sesión más vieja del visitante en el workspace) y `lastTouch` (sesión del envío).

## Archivos

`server/domains/growth/`: `workspace.service` (CRUD, cache por publicKey, `getDefault`), `campaign.service` (campañas +
landings + `resolveLanding`/`resolveCampaign` con cache 60 s), `experiment.service` + `stats.ts`, `spend.service`,
`analytics.service` (`overview`), `ingest.service` (eventos batch, identify por email, `submitLead` con honeypot →
reCAPTCHA → validación → dedupe → lead + atribución + identity + evento `lead_created` + notificación `lead.new`),
`revenue.ts`, `public.routes.ts` (`/api/public/growth/:key`, CORS abierto, rate limit por clave), `growth.routes.ts`
(`/api/growth`, sesión; workspaces solo admin para crear/editar/rotar claves; `sales` tiene acceso al prefijo).
`server/domains/crm/events/event.service.ts` reescrito por workspace (sesión 24 h, nueva sesión si cambia la atribución,
`eventKey` idempotente, click IDs). `client/public/growth.js` (snippet) + `client/public/growth-demo.html?key=gw_pub_…`.
Frontend: `client/src/pages/GrowthWorkspaces.tsx`, `GrowthWorkspace.tsx`, `client/src/components/growth/*`; rutas
`/growth` y `/growth/:id`; sidebar "Growth / Workspaces" (admin y sales).

## Cómo se conecta un sitio (propio o de un cliente)

1. Crear el workspace (Growth › Nuevo) → pestaña Instalación: snippet `<script src="ERP/growth.js" data-key="gw_pub_…"
   data-endpoint="ERP" defer>` directo o como tag HTML personalizado en GTM (All Pages).
2. Formulario: `chimp.lead({ formKey, name, email, phone, company, message })` desde el navegador, o `POST
   /api/public/growth/:key/leads` desde el backend del sitio con header `X-Growth-Server-Key` (server actions de Next.js).
3. Campañas con su `utm_campaign` y landings con su URL → la atribución sale sola.
4. Requiere el ERP público (droplet) para sitios reales; en local se prueba con la demo y curl.

## Fase 3 (commit `bae318c`, 5/9/2026)

- **Chimp Score v1** (`growth_lead_scores`, `score.service.ts`, rutas `GET /leads/:id/score`, `POST /workspaces/:id/scores/recompute`,
  `GET /workspaces/:id/scores/top`): reglas explicables (contacto, calidad histórica de la fuente, campaña paga, engagement por
  eventos/identities, interacciones, negativos; hot ≥ 70 / warm ≥ 40 / cold). Se calcula al entrar un lead por API y a demanda.
  UI: columna Score en Leads (`lead.score`/`scoreBand` vienen en `GET /api/crm/leads`), tarjeta en el detalle, "Leads
  prioritarios" en el Resumen del workspace.
- **Brief de inteligencia** (`growth_briefs`, `brief.service.ts`): `computeFindings` por reglas (período vs anterior, campañas y
  landings mejores/peores, experimentos, leads estancados, spam/duplicados, salud del tracking) → narrativa con gpt-4o-mini
  restringida a esa evidencia (fallback `rules-only` si la IA falla). Pestaña "Inteligencia".
- **Importador** (`growth_imports`, `import.service.ts` + `csv.ts` parser propio): CSVs del panel del sitio
  (`landing_visits`, `leads`, `contacts`, `ad_spend`; `campaign_revenue` NO se importa) con preview dry-run y ejecución
  idempotente; crea las campañas "Software Factory (AdWords)" / "Web Express" y las 4 landings del sitio si faltan; leads con
  fecha original (origin `import`). También gasto desde CSV de Google/Meta Ads con mapeo de columnas. Solo admin ejecuta.
  Cómo exportar del panel viejo del sitio: Database → tabla → Export CSV, una por tabla. Pestaña "Importar".
- **Workspace en el CRM**: selector global (`client/src/lib/workspaceStore.ts`, localStorage, componente `WorkspaceSelect`) en
  Dashboard, Oportunidades y Config (Leads pendiente de sumar el selector); pipelines por workspace; todo workspace nuevo nace
  con el pipeline "Ventas" estándar; `GET /api/crm/dashboard?workspaceId=`. El snippet viejo de CrmConfig se reemplazó por un
  aviso que lleva a Growth › Instalación.

## Estado / pendientes

- Schema `scripts/sql/2026-09-05_growth_workspaces.sql` + `2026-09-05b_growth_score_briefs_imports.sql` aplicados en su momento a las bases locales viejas; hoy vive todo en la migración `0001` (ya en producción)
  (la DB real está atrasada también con cuentas/multi-entidad/retenciones/plantillas; aplicar todo junto con OK de Santiago).
- Se eliminó `client/src/lib/crmTracker.ts` (rastreaba navegación interna del ERP en `crm_events`; era ruido).
- Fix de paso: `crm_identities` nunca tuvo el unique (visitor, entity_type, entity_id) del schema → identify siempre fallaba.
- **Pendientes: en el cap. [05_backlog.md](05_backlog.md)** (importación real de los CSV del panel viejo, selector de workspace en
  Leads, brief automático, gasto por API, conversion feedback, portal del cliente, onboarding de `/growth`).

## Consultas de clientes y recorrido del lead de Chimpancé (15/9/2026, en dev)

Decisión de Santiago: **el recorrido del cliente (visita → lead → propuesta → cliente) se mide solo para Chimpancé**; lo de
los clientes no se mezcla con el CRM.

- **Workspace de cliente (`kind = client`)**: el formulario NO crea lead. Queda solo el envío como **consulta**
  (`accepted`, o `duplicate` por email/teléfono dentro de `leadDedupDays`), sin notificación ni score. Pestaña
  **Consultas** en `/growth/:id` (planilla: fecha, nombre, email, teléfono, empresa, mensaje, otros datos, formulario,
  landing, campaña, origen, estado) + **Descargar para Excel** (`submissions.csv`, `;` + BOM, solo admin, respeta
  período y estado). El Resumen muestra Consultas y costo por consulta, sin calificados/oportunidades/ingresos/ROI ni
  leads prioritarios. La importación rechaza leads/contactos en un cliente. OJO: el `kind` por defecto al crear un
  workspace es `client`; si alguna vez se arma un workspace para algo PROPIO de Chimpancé, tiene que ser `internal`.
- **Chimpancé (`internal`)**: todo lead, venga de formulario, carga a mano, Chimpa IA o importación, tiene **link
  personal** `?chl=<id base36>.<firma>` (`server/domains/growth/leadLink.ts`, HMAC con `SESSION_SECRET`: si se rota,
  los links viejos dejan de vincular). Al abrir cualquier página del sitio con el snippet y ese código, `growth.js`
  hace `POST /identify {visitorId, lead}`, limpia la URL, y el server vincula el navegador al lead y le asigna TODAS
  sus visitas previas (backfill de `eventService.identify`). Tarjeta **Recorrido en la web** en `/crm/leads/:id`
  (`LeadWebJourney.tsx`, `GET /api/growth/leads/:id/web-journey`): visitas, antes de ser lead, dispositivos, primera
  y última visita con origen, interacciones (WhatsApp, CTA, formularios, propuesta), páginas más vistas y el link
  para copiar. El dominio del link sale de la primera landing del workspace (en dev: chimpance.digital), si no
  `chimpancedigital.com.ar`.
- **Resumen de Chimpancé**: los leads sin formulario web cuentan en "Origen del tráfico" con la **fuente del CRM** y
  el medio `(carga manual)` / `(Chimpa IA)` / `(importado)`.
- Tests: `tests/leadLink.test.ts` (unit) y `tests/growthConsultasRecorrido.api.test.ts` (API, corre en el CI).
- Pendiente (punto 2 acordado con Santiago): vista única del recorrido de punta a punta (web + interacciones +
  propuesta + oportunidad + cobros) y tablero de etapas y tiempos solo de Chimpancé. Requisito para que todo esto
  mida en real: el snippet instalado en el sitio de Chimpancé (al 16/9/2026 NO estaba: ni en el código ni en el GTM
  `GTM-WBMRVJJ`; prompt listo en `Chimpa/web/3-replit/integracion-erp-crm.md` › Prompt 3). **Instalado y midiendo desde el
  17/9/2026**: el snippet está en el layout raíz del sitio (Replit, `app/layout.tsx`, `next/script`) con la clave de
  producción; verificado el 21/9 (71 visitas en 30 días). Los formularios del sitio siguen SIN mandar el lead al ERP
  (Prompt 2, pendiente): las visitas se cuentan anónimas y no se juntan solas con el lead.

### Cómo se asocia un visitante a un lead (explicado a Santiago el 16/9/2026)

La web no sabe quién la visita: todos son anónimos (`_chimp_vid`) hasta que dan una señal. Tres caminos:
1. **Formulario de la web → ERP** (`chimp.lead` o server action con `visitorId`): automático y oculto, vincula y trae las
   visitas previas. Es el principal; falta que el sitio mande los formularios al ERP (Prompt 2 del mismo documento).
2. **Link personal `?chl=`** o **Propuesta Viva con `data-lead`**: para leads que no llegaron por formulario.
3. **Botón de WhatsApp**: hoy NO asocia (WhatsApp no le pasa el número a la web). Idea anotada, no hecha: mensaje
   precargado con un código corto de referencia que se carga en el lead.

Santiago no quiere mandarle al cliente un link "raro": el link va detrás de botones (propuesta, mail) o en la propuesta.

Gotchas vistos el 16/9/2026: `chimpancedigital.com.ar` NO tiene web (solo mail): el dominio del link sale de
`settings.siteUrl` → `allowedOrigins` → primera landing → ese default roto. En producción el workspace Chimpancé no tenía
landings, así que el link salía con ese dominio (cargar landings de `https://chimpance.digital/…` o corregir el default).
**Al 21/9/2026 sigue así en producción**: Santiago decidió no cargar landings todavía (no hay campañas), así que los links
personales que se copien hoy no abren nada. Avisarle antes de mandar uno.
El rate limit público es **por clave del workspace**, no por visitante (`identify` 300 / 10 min para todo el sitio).

**CORS del snippet (17/9/2026, commit `018fd82`, en dev):** hasta ese día `growth.js` mandaba `/events` con
`navigator.sendBeacon`, que SIEMPRE lleva credenciales; con `Access-Control-Allow-Origin: *` el navegador lo bloquea en
cualquier dominio que no sea el ERP → **ningún sitio externo registraba visitas** (solo andaban `/config`, `/identify` y
`/leads`, que ya iban con `credentials: "omit"`). Lo detectó Replit al instalar el snippet en chimpance.digital. Arreglo:
`fetch` con `credentials: "omit"` + `keepalive` (reintento sin keepalive). Verificado desde chimpance.digital contra dev:
`config` 200, `events` 201. Test `tests/growthSnippetEnvio.test.ts`. **No volver a sendBeacon ni abrir el ERP a
credenciales desde cualquier origen.** En producción los sitios no registran visitas hasta que este commit pase a `main`.

### Propuestas Vivas medidas → ver `docs/growth/recorrido-cliente.md` (fase 2, en dev desde el 17/9/2026)

Lo hizo la sesión "Growth: recorrido del cliente" (tabla `crm_proposals`, bloque "Propuestas" en lead y oportunidad,
`growth.js` con `data-lead` + `data-proposal`, `?vista=equipo` para revisar sin medir). La sesión "Growth: link personal
del lead en la web" (16-17/9) había empezado una versión propia más chica del mismo pedido y la **descartó sin subirla**
al ver la otra en dev (parche en su scratchpad, `propuesta-b-descartado.patch`). Dos ideas de esa versión que la otra no
tiene, por si sirven: (a) en vistas previas (`*.replit.dev`, `localhost`, `file:`) no vincular al lead, porque mientras se
arma la propuesta en Replit el navegador de quien la arma queda vinculado; (b) que el modo equipo quede guardado en el
navegador (localStorage) y no solo en la pestaña. Las Propuestas Vivas son HTML sueltos publicados en Replit
(`Chimpa2026/propuestas/<cliente>/`, Deploy Static).

### Auditoría del 15/9/2026 (hallazgos arreglados, en dev)

Se auditó todo lo de arriba con 8 lentes y se arreglaron los hallazgos reales. Lo que conviene recordar:

- **Ids escritos de otra forma** (`+12`, `1e1`, `0xc`, `12%20`): los guardias por rol matchean con `\d+` pero las rutas
  leen el id con `Number()`, así que esquivaban el alcance del vendedor y el candado solo-admin de las descargas
  (bug preexistente, también en producción para `leads.csv`). Ahora `canonicalIdGuard` (`server/lib/apiAuth.ts`,
  montado en `routes.ts` después del candado de sesión) corta con 404 cualquier tramo de ruta que `Number()` lea como
  número y no sean solo dígitos. **Al agregar una ruta con id no hace falta nada nuevo, pero no inventar ids raros.**
- **CSV**: `server/domains/growth/csvExport.ts` (`csvText`, `csvPhone`, `csvDateTimeAR`, `csvDocument`) se usa en las dos
  descargas. Neutraliza fórmulas de Excel (`'` adelante si la celda empieza con `= + - @`), manda los teléfonos como
  `="…"` y va con `Cache-Control: no-store` (el navegador servía descargas viejas).
- **Períodos en hora de Buenos Aires**: `arDayStart` / `arDayEnd` / `arYmd` en `shared/growthConsultas.ts`, usados en
  `overview`, `submissions`, las dos descargas y el brief. Antes el corte era UTC y la consulta de las 22:30 caía al día
  siguiente.
- **Vínculo del link personal**: no vincula robots (user agent), leads archivados ni un navegador ya vinculado a OTRO
  lead (link reenviado o alguien del equipo probándolo). El recorrido se cuenta por los EVENTOS del lead
  (`crm_events.entity_id`), no por el navegador. Se puede deshacer con
  `DELETE /api/crm/leads/:id/web-browsers/:visitorId` (botón Desvincular en la tarjeta; queda en `audit_log`).
- **Clave del link**: `LEAD_LINK_SECRET` si está; si no, una derivada de `SESSION_SECRET` con etiqueta propia. Cambiarla
  invalida todos los links viejos sin desloguear a nadie ni romper el Playbook. Los links emitidos antes del 15/9 a la
  noche ya no sirven (no se había mandado ninguno).
- **Payload del formulario**: los campos de contacto se guardan siempre como texto (un objeto se descarta: antes
  `[object Object]` rompía la pantalla) y un campo gigante ya no tumba la recepción. `pageUrl` y `referrer` quedan
  guardados en el payload.
- **Snippet**: saca `?chl=` sin reescribir el resto de la dirección, reintenta si el envío falla (sessionStorage),
  avisa el resultado (`chimp:linked` + `dataLayer chimp_lead_link`), contempla el router de Next.js y no corre en
  navegadores automáticos. La demo (`/growth-demo.html`) tiene un campo para probar un link personal.
- Tests: `tests/growthConsultasRecorrido.api.test.ts` (consultas, recorrido, desvincular, ids raros) y
  `tests/apiAuth.test.ts` (candado de ids).

## Recorrido del cliente: historia única y propuesta medida (17/9/2026, en dev)

Plan completo, de dónde sale cada dato y reglas para no pisar: `docs/growth/recorrido-cliente.md` (fases 1-5; 1 y 2
hechas). Contrato: `docs/growth/api-contract.md` › "Propuesta medida" y "Recorrido del cliente — API del CRM".

- **Historia** (pestaña del lead, reemplazó "Actividad web"; `?tab=historia` abre directo): `server/domains/crm/history/history.service.ts`
  + `client/src/components/crm/CustomerHistory.tsx`. Lee de las tablas de siempre (no copia nada): lead creado, formularios,
  web agrupada por sesión, aperturas de propuesta agrupadas por sesión, interacciones (incluye las `system`: tareas
  cumplidas, mails), estados, archivos, oportunidades y etapas (ganada/perdida con motivo), proyectos y cobros (solo
  admin/operador/contador). Solo lectura: se anota en QuickLog del lead o "Historial y notas" de la oportunidad.
- **Propuestas** (`crm_proposals`, migración 0023): `server/domains/crm/proposals/proposal.service.ts` + `LeadProposals.tsx`
  (en el Resumen del lead y en la oportunidad). Registrar crea la interacción `proposal_sent` y pisa
  `crm_opportunities.proposal_url` con el último link. `stats` salen de `crm_events` con `properties.proposal = slug`.
- **growth.js**: `data-lead` + `data-proposal` en el `<script>`; mide apertura, profundidad, tiempo por sección, precios y
  opción del cotizador (`data-chimp-quote`). `?vista=equipo` apaga la medición en la pestaña. Aviso `crm.proposal.viewed`
  al dueño del lead (primera apertura y reapertura después de 24 h). Robots ignorados. Sesiones de propuesta excluidas de
  las visitas del sitio (overview y tarjeta del recorrido).
- **Propuestas Vivas**: el skill `ejecutivo-cuenta-chimpance` (SPEC de propuesta-viva y cotizador-campana › Medición)
  explica cómo dejar la plantilla lista y pegar el código.
- La sesión "Growth: link personal del lead en la web" se ocupa de instalar el script en el sitio; la medición de la
  apertura de propuestas ("forma B" que proponía) quedó hecha acá.
- Tests: `tests/recorridoCliente.api.test.ts`.
- Pendiente: fase 3 (fecha real de ganada/perdida, tiempo por etapa, motivo que no se borra, embudo por fuente), fase 4
  (barrido diario de avisos: lead frío, tarea vencida, volvió a la web, propuesta vista sin respuesta) y fase 5 (historia
  por empresa, recompra, LTV). También: la historia usa la hora del sondeo para los mails que entran solos
  (`email.service` guarda `occurred_at = now()`), corregir a `received_at` coordinando con la sesión de correo.

## Personas: identidad única (fase 1a, 19/9/2026, en dev · migración 0028)

Decisión de Santiago: **Persona es la identidad central**; un **lead es una consulta** de una persona, un contacto de
empresa es su relación con esa empresa y un contacto del CRM es otro rol. Las tres tablas de siempre NO se reemplazan:
ganaron `person_id` (opcional), igual que `crm_identities` y `crm_events`. Documento: **`docs/growth/personas.md`**
(reglas, tablas, dónde se engancha, carga inicial). Plan de fases y diagnóstico:
`Chimpa2026/diagnostico-personas-audience-propuestas-2026-09-19.md`.

- **Regla única de unión: mail exacto normalizado.** Nombre, teléfono, empresa, LinkedIn, similitud o IA NUNCA unen:
  van a `person_duplicate_candidates`. Casilla genérica (info@…) con nombres distintos no une (identificador `shared`).
  Vínculos explícitos ya existentes (promoción, `crm_leads.contact_id`, referidor que pasó a Empresas) valen salvo que
  los mails se contradigan.
- **Toda decisión de identidad pasa por `server/domains/crm/people/person.service.ts`** (`resolvePerson`,
  `findOrCreatePersonByEmail`, `linkLead`, `linkCompanyContact`, `linkCrmContact`). No escribir matching propio en otro
  módulo. Los `safe*` nunca frenan el alta original. Concurrencia: `pg_advisory_xact_lock` por workspace+mail + índice
  único parcial de mails.
- **`promoteForOpportunity` ya no pierde la identidad**: el contacto que nace del lead hereda su `person_id`.
- **Tracking intacto**: `entity_type`/`entity_id` siguen mandando; `person_id` acompaña.
- **Carga inicial**: `POST /api/crm/people/backfill` (solo admin; `dryRun` por defecto), repetible, informe en
  `audit_log` (`person_backfill`). Se corre UNA vez por ambiente después del deploy (en producción, con OK de Santiago).
  Consulta: `/api/crm/people/stats`, `/duplicates`, `/backfill/history`, `/by-lead/:id`.
- Tests: `tests/people.test.ts` (reglas) y `tests/personas.api.test.ts` (7 casos de Santiago + concurrencia + carga).
- **Fase 1b (19/9/2026, en dev): pantalla Personas.** `/crm/personas` (lista), `/crm/personas/:id` (ficha con Journey
  unificado, Relación, Datos, Identidades) y `/crm/personas/duplicados` (unir o descartar; admin y operador). Servicio
  de lectura `personView.service.ts` (estado calculado, alcance del vendedor, `merge` que no borra nada). Detalle en
  `docs/growth/personas.md › Pantalla Personas`.
- **Fase 2 (19/9/2026, en dev · migración 0029): "Enviar propuesta" desde la oportunidad.** Un mail por persona desde
  el Gmail de quien envía (reusa lo de Enviar factura), cada uno con su código de persona `?chp=` (`leadLink.ts`);
  `growth.js` lo lee y manda sobre `data-lead`; `identifyByPersonLink` en `ingest.service`; recorrido de la oportunidad
  en `proposalSend.service.ts › journey` + `components/crm/OpportunityProposalJourney.tsx`. Cliente sin lead: la propuesta queda en la oportunidad, SIN crear lead. Límite decidido: el reenvío del mail cuenta como esa persona. Detalle en
  `docs/growth/personas.md › Envío individual de propuestas`.
- **REGLA CANÓNICA (Santiago, 19/9/2026): nunca se crea un lead por una necesidad técnica.** Lead = consulta REAL.
  La propuesta es de la OPORTUNIDAD (`crm_proposals.lead_id` opcional); una oportunidad de un cliente que ya existe no
  tiene lead y todo anda igual (envío, lectura por persona, journeys, ingresos por `revenueArsByOpportunityIds`). Esas
  ventas no cuentan en el embudo de adquisición de Growth. OJO: `opportunityService.ensureLead` (notas de la oportunidad,
  17/9) todavía crea un lead al anotar en una oportunidad sin lead: pendiente de decisión de Santiago, NO copiar ese patrón.
- **Pendiente (con OK de Santiago por fase):** 3 Audience Engine interno ·
  4 devolver conversiones (sugerido: Google primero) · 5 Meta · 6 LinkedIn. El Chimp Score, la Historia y el recorrido
  web siguen por lead hasta la 1b.

## Demo medida en otro dominio (25/9/2026, EN PRODUCCIÓN)

La demo de una propuesta vive en otro dominio: el navegador guarda la marca del visitante por dominio, así que en la demo arrancaría como anónimo.
- **Script de la demo** = el de la propuesta con `data-demo="<slug de la propuesta>"` en vez de `data-proposal` (+ `data-lead` si la propuesta es de un lead). Todo evento lleva `properties.demo`: no ensucia la lectura de la propuesta. Va en TODAS las páginas de la demo. Rutas: `GET /api/crm/opportunities/:id/demo-snippet`, `GET /api/crm/leads/:id/proposals/:pid/demo-snippet`. UI: bloque "Código para medir la demo" en el recorrido web del lead y botón "Código de la demo" en la oportunidad (`components/growth/DemoCode.tsx`).
- **Pase de visitante**: los links de la propuesta con `data-chimp-demo` se llevan `?chv=<visitorId>` al tocarlos; la demo lo adopta (misma persona) y lo borra de la dirección. En `?vista=equipo` el link lleva `vista=equipo`.
- **Por mail**: "Enviar propuesta" tiene "Link de la demo" (opcional, se recuerda en el navegador por oportunidad): cada mail suma "Ver la demo" con `?chp=` de esa persona.
- **Recorrido**: fila "X abrió la demo de «…» (N pantallas)" en la historia (separada de la fila de la propuesta aunque el servidor las junte en la misma visita), pill "Recorrió la demo" por destinatario, y en "Páginas que más miró" las de otro dominio salen con el dominio adelante.
- Tests: `tests/growthDemo.test.ts`.

## Analítica de comportamiento: mapas de calor, grabaciones, encuestas y embudos (30/9/2026, en dev)

Ficha **A-14**, aprobada por Santiago el 30/9/2026 ("se hace todo, y en paralelo"; **interno primero**, el cliente lo ve
después). **Contrato técnico: `docs/growth/behavior-spec.md`** — leerlo antes de tocar nada de esto.

**Nada se enciende solo.** Un workspace nace con `behaviorEnabled = false` y `recordingSampleRate = 0`. Se prende en
**Growth › Instalación › Configuración del workspace** (switch "Medir comportamiento", % de grabación, días de retención
y URL del aviso de privacidad). Dos reglas duras, en el server **y** en la pantalla:

1. **Sin `privacyNoticeUrl` cargada no se graba ni una sesión** — el `/config` devuelve `recordingSampleRate: 0` aunque
   la base diga otra cosa, así que la regla no depende de la interfaz.
2. **No se graba con la medición apagada.**

Y tres más que vienen de las reglas del skill: los inputs van **enmascarados** (nunca sale del navegador lo que la gente
escribe), **una respuesta de encuesta no es lead ni consulta** en ningún tipo de workspace, y todo lleva `workspace_id`.

### Qué hace cada pieza

- **Snippet** (`client/public/growth.js`, 654 → 1340 líneas): celda de clic (`gx` 0-99 del ancho, `gy` en bandas de
  20 px), **clic muerto** (no pasa nada en 700 ms), **rage click** (3 clics en 1 s dentro de 30 px), scroll 25/50/75/100 y
  permanencia en **cualquier** página, errores JS, tiempo de carga. Todo en **lote** cada 5 s por `fetch` con `keepalive`
  (sendBeacon sigue prohibido). Grabación con **rrweb diferido** sólo si el visitante cae en la muestra; ante un 403/409
  se apaga para toda la sesión; respeta `doNotTrack`. Widget de encuesta en **Shadow DOM** para no romper el CSS del
  sitio del cliente. Contra un server viejo que no manda `behavior`, anda igual que antes.
- **rrweb 2.1.6 lo sirve el ERP** (`client/public/rrweb-record.min.js`, lo genera `scripts/vendor-rrweb.mjs`): el sitio de
  un cliente **no carga un script de un CDN de terceros**.
- **Backend** (`server/domains/growth/behavior|recording|survey|funnel.service.ts` + `behavior.routes.ts` y
  `behaviorPublic.routes.ts`): clics y scroll se guardan **agregados** por (workspace, path, dispositivo, día) con upsert
  —nunca una fila por clic—; las grabaciones van a `uploads/growth-recordings/<wsId>/<key>.jsonl`, **no a Postgres**, con
  tope de 2 MB por chunk, 20 MB por grabación y 500 grabaciones por día por workspace; un **barrido diario** (enganchado
  en `server/index.ts`) borra archivo y ficha al vencer la retención.
- **Pantallas** (`/growth/:id`): **Comportamiento** (tabla de páginas + mapa de calor en tres modos sobre la foto de la
  página), **Grabaciones** (lista con señales de frustración + reproductor rrweb diferido), **Encuestas** (alta con vista
  previa, NPS calculado, CSV) y **Embudos** (pasos y caída).
- **La foto de la página**: el endpoint devuelve el **JSON de rrweb** y la pantalla lo reconstruye en el navegador con el
  `Replayer` (que arma su propio iframe y quita lo ejecutable). No servimos el HTML del sitio de un cliente desde nuestro
  dominio. `?as=html` quedó como salida de emergencia.

### Lo que hay que saber al leer estos números

- **`rage` y `dead` están contados adentro de `clicks`**: son la misma acción marcada, no clics aparte. Sumarlos al total
  es contar dos veces (la pantalla lo aclara).
- **`reach` y `seconds` del mapa de calor son estimados**: la base guarda el scroll en cuatro marcas por página y el
  server interpola (`reachSource: "scroll_interpolado"`). Los modos scroll y atención son aproximación, no medición.
- **`scrollAvg` viaja como fracción 0-1**, no como puntos de porcentaje.
- La foto de una página se toma una vez por dispositivo y se refresca a los 7 días: si el cliente rediseña, el mapa queda
  sobre la foto vieja hasta que venza.

Lo que quedó suelto está en el cap. [05_backlog.md](05_backlog.md) › **A-15**, y el deploy caído en **B-11**.

## Workspace en 6 pestañas (auditoría UX 1/10/2026, en dev · migración 0053)

`client/src/pages/GrowthWorkspace.tsx` arma las pestañas desde el array `TABS` (clave, etiqueta, si usa el período,
quién la ve). Estado en la URL: `?tab=resumen|consultas|campanas|sitio|ia|config&vista=…&periodo=7d|30d|this_month|
last_month|90d|custom&desde=&hasta=`. Solo se monta la pestaña abierta.

| Pestaña | Qué hay | Archivo |
|---|---|---|
| Resumen | aviso "Falta cargar la inversión desde el …" (`overview.spendGap`), KPIs, gráfico, **últimas consultas** (cliente) o embudo (Chimpancé), por campaña, por landing, **De dónde vienen** (origen en criollo, agrupa el número de anuncio), pruebas A/B si hay | `OverviewTab.tsx` |
| Consultas / Formularios | planilla + **"Es una prueba"** con Deshacer y filtro **Pruebas** | `SubmissionsTab.tsx` |
| Campañas | sub-vistas Campañas (con visitas, consultas y costo por fila) · Landings · Inversión (solo quien ve plata; muestra lo que cuenta en el período) | `AcquisitionTab.tsx` |
| Mejorar el sitio | sub-vistas Pruebas A/B · Mapa de calor · Grabaciones · Embudos · Encuestas; un solo estado "medición apagada" con **Encender medición** (admin, con Deshacer). Embudos anda con la medición apagada (usa `crm_events`) | `SiteTab.tsx` |
| Chimpa IA | brief (en cliente dice consultas y no muestra oportunidades/ingresos) | `BriefTab.tsx` |
| Configuración | Conectar el sitio (¿está midiendo? + un solo código + formularios automáticos + datos del workspace + "Para programadores" plegado) · Importar datos | `InstallTab.tsx`, `ImportTab.tsx` |

- **Pruebas del equipo**: `growth_form_submissions.is_test`. `PATCH /api/growth/submissions/:id/test`. No cuentan en overview,
  lista de workspaces (`consultas30d`), brief ni dedupe; no salen en la descarga (salvo `status=test`).
- **Lista de Growth**: un cliente muestra sus consultas de 30 días (`consultas30d`), Chimpancé sus leads.
- **Formularios automáticos** (`settings.autoForms`, apagado por defecto): `growth.js` captura el `submit` de cualquier
  `<form>` con mail o teléfono; reglas y doble envío en `docs/growth/api-contract.md` › Snippet. Test `tests/growthAutoForms.test.ts`.
- **¿Está midiendo?**: `GET /api/growth/workspaces/:id/install-status` (`installStatus.ts`).
- El mes global del encabezado (`DateNavigator`) no aparece en `/growth` (pisaba la URL).
