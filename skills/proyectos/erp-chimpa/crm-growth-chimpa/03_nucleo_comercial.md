# 03 · Núcleo comercial del CRM

> Cómo funciona hoy la pata **Desarrollar**: de la consulta a la venta. Los pendientes y los bugs vivos están en el
> cap. [05_backlog.md](05_backlog.md).

> **Estado al 29/9/2026: todo lo que está en este capítulo YA ESTÁ EN PRODUCCIÓN** (`origin/main` y `origin/dev` a la par,
> migraciones hasta 0045). Los sellos "en dev" de algunos títulos son de cuando se escribió cada sección: verificar siempre
> con `git log origin/main..origin/dev` antes de afirmar dónde está algo.


## El modelo, en cuatro objetos

```
PERSONA (identidad, por mail)
   ├── LEAD                 = una consulta de esa persona (puede tener varias)
   ├── CONTACTO de empresa   = su relación con una empresa cliente (company_contacts)
   └── CONTACTO del CRM      = su rol en una empresa en prospección (crm_contacts)

EMPRESA:  crm_accounts (prospección)  →  companies (cliente/proveedor real, al ganar)
OPORTUNIDAD: la venta en curso; dueña de la propuesta y del proyecto que nace al ganar
```

Tablas: `crm_leads` (+ `tags`, `needs`, `interactions`, `tasks`, `status_history`), `crm_pipelines` + stages,
`crm_opportunities` (+ `stage_history`), `crm_accounts`, `crm_contacts`, `people` + `person_duplicate_candidates`,
`crm_proposals`, y el tracking anónimo `crm_sessions` / `crm_identities` / `crm_events`. **Todas con `workspace_id`.**

## Personas: la identidad única (19/9/2026, EN PRODUCCIÓN desde el 21/9/2026, migración 0028)

Decisión de Santiago: **Persona es la identidad central.** Las tres tablas de siempre NO se reemplazan: ganaron
`person_id` (opcional), igual que `crm_identities` y `crm_events`. Documento: `docs/growth/personas.md`.

- **Regla única de unión: mail exacto normalizado.** Nombre, teléfono, empresa, LinkedIn, similitud o IA NUNCA unen: van a
  `person_duplicate_candidates`. Una casilla genérica (`info@…`) con nombres distintos no une (identificador `shared`).
  Los vínculos explícitos que ya existían (promoción, `crm_leads.contact_id`, referidor que pasó a Empresas) valen, salvo
  que los mails se contradigan.
- **Toda decisión de identidad pasa por `server/domains/crm/people/person.service.ts`** (`resolvePerson`,
  `findOrCreatePersonByEmail`, `linkLead`, `linkCompanyContact`, `linkCrmContact`). No escribir matching propio en otro
  módulo. Los `safe*` nunca frenan el alta original. Concurrencia: `pg_advisory_xact_lock` por workspace+mail + índice
  único parcial de mails.
- `promoteForOpportunity` ya no pierde la identidad: el contacto que nace del lead hereda su `person_id`.
- **Carga inicial**: `POST /api/crm/people/backfill` (solo admin, `dryRun` por defecto), repetible, informe en `audit_log`
  (`person_backfill`). Se corre UNA vez por ambiente después del deploy. Consulta: `/api/crm/people/stats`, `/duplicates`,
  `/backfill/history`, `/by-lead/:id`.
- **Pantalla Personas (fase 1b, en producción)**: `/crm/personas` (lista), `/crm/personas/:id` (ficha con Journey unificado, Relación,
  Datos, Identidades) y `/crm/personas/duplicados` (unir o descartar; admin y operador). Lectura en
  `personView.service.ts` (estado calculado, alcance del vendedor, `merge` que no borra nada).
- Tests: `tests/people.test.ts`, `tests/personas.api.test.ts`.

## Leads

- **Origen** (`crm_leads.origin`): `manual` | `api` (formulario web) | `chat` (Chimpa IA) | `import`. Por dónde entra cada
  uno: cap. [04_entrada_de_leads.md](04_entrada_de_leads.md).
- **Un lead es una consulta real.** Nunca se crea uno por necesidad técnica (regla canónica; ver SKILL.md).
- **Ficha** (`CrmLeadDetalle.tsx`): hero con logo, datos de contacto, Consulta y **Notas internas** en `LongTextField`
  (texto largo completo, links clickeables, se edita en diálogo), necesidades, tags, interacciones, tareas, estados,
  archivos, propuestas, y las pestañas **Historia** y **Recorrido en la web**.
- **Sitio web, logo y datos públicos** (migración 0018): `POST /leads/:id/web/lookup {domain?}` visita la home (dominio:
  el escrito a mano → `website` → dominio propio del mail del contacto) y devuelve **sin guardar** `{domain, website,
  logo, info{siteName, description, socials, emails, phones}}`; `POST /leads/:id/web/apply` guarda lo aprobado (logo en
  `uploads/logos/`); `GET/DELETE /leads/:id/logo`. UI: `crm/LeadWebDialog.tsx` (vista previa → Guardar).
- **Necesidades sugeridas por IA**: `POST /leads/:id/needs/suggest` (gpt-4o-mini, `needs/needAi.ts`) lee `message` +
  `qualifyingNotes` y propone del catálogo o nombres nuevos, **sin guardar**; `POST /leads/:id/needs/bulk` confirma (crea
  en el catálogo lo que falte, una sola principal). UI `crm/NeedSuggestions.tsx` (ds-ai-box con tildes).
- **Chimp Score** en la lista y en el detalle (`lead.score` / `scoreBand` vienen en `GET /api/crm/leads`). Reglas
  explicables, ver cap. 02.
- **Estados** con historial (`crm_lead_status_history`), y **tareas** del lead (`crm_lead_tasks`) que aparecen en la
  pantalla Hoy.

## Interacciones y próxima acción

- `QuickLog` registra la interacción (llamada, WhatsApp, mail, reunión) y **cambia el estado solo**.
- La **próxima acción** crea una **tarea real** (`crm_lead_tasks.title` + `source_interaction_id`, migración 0016) y el
  server rechaza fechas pasadas: una tarea no nace vencida.
- Las interacciones `system` (tareas cumplidas, mails enviados) también entran a la Historia.

## Oportunidades, pipeline y cierre

- **Pipeline por workspace**: `pipelineService.getDefaultPipeline(workspaceId)`; todo workspace nuevo nace con el pipeline
  "Ventas" estándar de 6 etapas (seed del boot). Las etapas marcan `isWonStage` / `isLostStage` (**no** `type`: ese fue un
  bug clásico).
- **Ganar** exige monto y **perder** exige motivo, en el detalle y en el kanban (`assertClosingData` en el server;
  `ClosingDialogs.tsx` con `WinDialog` / `LossReasonDialog` y Deshacer de 6 s).
- **Empresa**: `CompanyPicker` busca o crea (con CUIT); el PATCH de la oportunidad acepta `companyId`, `contactId`,
  `proposalUrl`.
- **Proyecto**: `POST /api/crm/opportunities/:id/create-project` (empresa obligatoria; moneda y monto estimado como
  presupuesto; `projects.opportunityId`) arrastra las tareas de preventa y sus horas; 422 si ya existe. `GET
  /api/crm/opportunities/:id` devuelve `linkedProject`. **Esta cadena es la que hace que el ingreso real se pueda
  atribuir**: si se corta, Growth no puede medir plata.
- **Notas e historial** de la oportunidad en "Historial y notas". Ojo: `opportunityService.ensureLead` todavía crea un lead
  al anotar en una oportunidad sin lead → pendiente de decisión (cap. 05).

## Empresas del CRM y prospección (16/9/2026, EN PRODUCCIÓN, migración 0020)

Decisión de Santiago: *"no toda empresa y lead se convierten en clientes, no deben convivir con Empresas"*.

- `crm_accounts` = empresa en prospección (`name`, `website`, `domain` normalizado sin www, `logo_path`, `web_info`,
  `phone`, `email`, `city`, y `company_id` + `promoted_at` cuando pasa a Empresas). `crm_contacts` = personas del CRM.
  `crm_leads.account_id`, `referral_account_id`, `referral_crm_contact_id`.
- **`companies` (Empresas) queda solo para clientes y proveedores reales**: facturación, IVA, proyectos, buscador y el
  agente no ven prospectos.
- Código: `crm/accounts/account.service.ts` (`search`, `match` por dominio o nombre normalizado, `resolveForNewLead`,
  `promoteForOpportunity`); reglas puras en `shared/prospects.ts` (`normalizeCompanyName` saca S.A./SRL/SAS y tildes,
  `hostFromWebsite`, `cleanSiteName`, `splitPersonName`).
- Rutas: `GET /crm/accounts?search=`, `GET /crm/accounts/match?name=&website=` ("¿ya la tenemos?", `reason: domain|name`),
  `GET /crm/accounts/:id/logo`, `POST /crm/web/lookup {website}`.
- **Alta a mano**: `companyId` (cliente elegido) → `accountId` (del CRM) → `newAccount` ("es otra empresa") → si no se
  eligió nada, busca por dominio/nombre y si no está, crea en el CRM. `leads.website` se guarda siempre con `https://`.
  Editar nombre o web del lead sincroniza la empresa del CRM mientras no se promovió.
- **Ganar**: `PATCH /opportunities/:id {promoteProspect: true}` crea el cliente desde la empresa del CRM (o la ata a la que
  ya existe por dominio/nombre), copia el logo, suma el contacto del lead a `company_contacts` sin duplicar mail, marca
  `crm_accounts.company_id/promoted_at` y ata lead y oportunidad. En el WinDialog son los chips "Pasarla a Empresas" /
  "Ya está en Empresas".
- UI: `crm/LeadCompanyFields.tsx` (bloque Empresa del alta, con aviso automático si la web coincide y "Es otra empresa"),
  chip "En el CRM" / "Cliente" en la ficha del lead, `prospect {accountId, name, logoUrl}` en la oportunidad mientras no
  tiene empresa.
- Tests: `crmProspectos.api.test.ts`.

## Referidores: quién nos trajo el lead (15/9/2026)

- La fuente "Referido" se reconoce por el nombre en cualquier forma (`shared/referral.ts` › `isReferralSourceName`:
  referid / recomend / boca a boca) y con ella el alta y el PATCH del lead **exigen** `referralContactId` |
  `referralCompanyId` | `referralNameText` (uno solo; con otra fuente se rechazan con 422).
- `GET /crm/referrers?search=` busca personas y empresas; `POST /crm/referrers` da de alta rápido (persona o empresa; una
  persona necesita empresa, o queda "solo el nombre" como texto); `GET /crm/referrers/:kind/:id/value` →
  `{referrer, totals{leadCount, wonCount, projectCount, totalIncomeArs}, leads[]}` — **ingreso real cobrado neto de IVA**,
  por la misma cadena lead → oportunidad ganada → proyecto → cobros AR que usa Rentabilidad.
- Kinds: `contact | company | crm_contact | crm_account`. El alta rápida crea en el CRM.
- UI: `crm/ReferrerPicker.tsx` en el alta y el detalle del lead; `ReferrerValuePanel.tsx` en la ficha de empresa, pestaña
  **Referidos**; Rentabilidad › Origen y referidos suma la columna "Leads referidos".
- Tests: `referidos.api.test.ts`. **Ojo operativo**: los referidores creados entre el 15 y el 16/9 en producción entraron a
  Empresas como "cliente" (`audit_log` con `details.via = 'referrer'`) → revisarlos con Santiago (cap. 05).

## La Historia del cliente (17/9/2026)

Pestaña del lead que reemplazó "Actividad web" (`?tab=historia` abre directo).
`crm/history/history.service.ts` + `components/crm/CustomerHistory.tsx`.

- **Lee de las tablas de siempre, no copia nada**: lead creado, formularios, web agrupada por sesión, aperturas de
  propuesta y de demo agrupadas por sesión, interacciones (incluidas las `system`), estados, archivos, oportunidades y
  etapas (ganada/perdida con motivo), proyectos y cobros (estos últimos solo para admin/operador/contador).
- Es **solo lectura**: se anota en QuickLog del lead o en "Historial y notas" de la oportunidad.
- Gotcha conocido: los mails que entran solos se ordenan por la hora del sondeo (`email.service` guarda
  `occurred_at = now()`); corregir a `received_at` coordinando con la sesión de correo (cap. 05).

## Propuestas: registro, medición y envío

- **Tabla `crm_proposals`** (migración 0023; `lead_id` pasó a opcional en la 0031) + `crm/proposals/proposal.service.ts` + `LeadProposals.tsx`.
- La propuesta es de la **oportunidad**; `crm_proposals.lead_id` es opcional. Registrarla crea la interacción
  `proposal_sent` y pisa `crm_opportunities.proposal_url` con el último link.
- El link pegado en el campo "Propuesta" de la oportunidad se registra solo (`syncFromOpportunity`); si estaba pegado sin
  registrar, se registra al enviar o al pedir el código (`ensureForOpportunity`).
- En la oportunidad quedó **una sola tarjeta**: la de enviar y medir (`OpportunityProposalJourney`). La lista del lead
  (`LeadProposals`) es de lectura.
- **Envío individual por mail** (fase 2, 19/9/2026, en producción; migraciones 0029 y 0031 = `crm_proposals.lead_id` opcional): un mail **por persona** desde el Gmail de quien envía
  (reusa lo de Enviar factura), cada uno con su código de persona `?chp=`; `growth.js` lo lee y manda sobre `data-lead`;
  `identifyByPersonLink` en `ingest.service`; recorrido de la oportunidad en `proposalSend.service.ts › journey` +
  `components/crm/OpportunityProposalJourney.tsx`. Cliente sin lead: la propuesta queda en la oportunidad, SIN crear lead.
  Límite decidido: el reenvío del mail cuenta como esa persona.
- **Link de la demo** (opcional, se recuerda por oportunidad en el navegador): cada mail suma "Ver la demo" con el `?chp=`
  de esa persona. Cómo se mide la demo en otro dominio: cap. 02.
- Cómo se deja la plantilla lista y dónde se pega el código: skill `ejecutivo-cuenta-chimpance` (SPEC de propuesta-viva y
  cotizador-campana › Medición).

## Quién ve qué (roles)

- **`admin`**: todo.
- **`operador`**: CRM completo (leads, oportunidades, pipeline, config) y Growth **menos Inversión, Inteligencia e
  Importar** (el brief narra la inversión en texto, así que se cierra por ruta). No entra a nada financiero.
- **`sales` (Vendedor)**: solo CRM + catálogos de apoyo (`salesApiGuard`). **Alcance** (`crm/salesScope.ts`): lo propio +
  lo "sin asignar" (entró solo y su dueño no es vendedor); 404 al resto; solo se asigna a sí mismo; Growth de solo
  lectura; no borra empresas. Config del CRM y CSV de leads: **solo admin** (`adminOnlyApiGuard`). UI: "/" → `/crm/leads`,
  sidebar solo CRM + Empresas. Pendiente: Growth (envíos y leads) todavía no filtra por dueño para `sales`.
- **`accountant`**: no entra al CRM.
- Una ruta pública nueva hay que sumarla a la lista de `server/lib/apiAuth.ts` o responde 401 (cap. 06).

## Lo que la auditoría del CRM (10/9/2026) dejó arreglado

En producción desde el pase del 14/9/2026 (`3761731`), commits `3ae66fe` (seguridad) y `5f8dd46` (CRM):
`CompanyPicker` + `WinDialog` + `LossReasonDialog` en detalle y kanban; monto obligatorio para ganar y motivo para perder;
PATCH con `companyId`/`contactId`/`proposalUrl`; próxima acción → tarea real; tareas que no nacen vencidas; vaciar campos
del lead guarda `null`; `staleTime` 45 s + refetch al foco; nombres `createdByName`/`changedByName`/`assigneeName`; alcance
del rol `sales`. Verificado en Chrome en dev el 13/9 (crear empresa desde la oportunidad → ganar con monto → crear
proyecto; perder desde el kanban; Deshacer; vaciar email). Tests: `crmAuditoria.api.test.ts` (36) + `apiAuth.test.ts` (78).
**Lo que quedó abierto de esa auditoría está en el cap. 05.**
