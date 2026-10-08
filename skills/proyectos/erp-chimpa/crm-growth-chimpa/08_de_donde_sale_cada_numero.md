# 08 · De dónde sale cada número

> Definiciones **leídas del código** (29/9/2026), no de memoria. Antes de contestar una pregunta de negocio con datos del
> ERP, buscar el número acá: la mayoría de los errores salen de contar leads archivados, mezclar workspaces, cortar el
> período en UTC o sumar plata con IVA.

## Las cuatro reglas que arruinan cualquier número si se olvidan

1. **Todo se filtra por workspace.** Si la consulta no tiene `workspace_id`, mezcla Chimpancé con los clientes.
2. **Los días son de Buenos Aires** (`arDayStart` / `arDayEnd` de `shared/growthConsultas.ts`). En UTC, la consulta de las
   22:30 cae al día siguiente.
3. **La plata es neta de IVA y en ARS al BNA.** Los cobros se normalizan con el tipo de cambio; nunca mezclar con montos
   con IVA de las facturas.
4. **Los leads archivados no cuentan** (`status != 'archived'`) y los leads se cuentan **por fecha de creación**, no por
   fecha de conversión.

## El Resumen de un workspace (`GET /api/growth/workspaces/:id/overview?from&to`)

Todo sale de `server/domains/growth/analytics.service.ts › overview`.

| Número | Cómo se calcula exactamente |
|---|---|
| **Visitas** | Filas de `crm_sessions` del workspace iniciadas en el rango, **excluyendo las sesiones que tienen algún evento con `properties.proposal`** (una propuesta abierta no es tráfico del sitio) |
| **Visitantes** | `anonymousVisitorId` distintos de esas sesiones |
| **Consultas / Leads** | Workspace `internal`: `crm_leads` no archivados creados en el rango, con su atribución (`growth_lead_attribution`). Workspace `client`: filas `accepted` de `growth_form_submissions` (no hay leads) |
| **Calificados** | Lead con `status = 'qualified'` **o** que ya tenga al menos una oportunidad. Ojo: es una definición generosa, no un juicio comercial |
| **Oportunidades / Ganadas** | Oportunidades cuyo `lead_id` está en ese conjunto; ganadas = `status = 'won'` |
| **Ingresos** | `revenueArsByLeadIds`: lead → oportunidad **ganada** → proyecto (`projects.opportunityId`) → **cobros AR reales** del proyecto, netos y en ARS. Un lead sin proyecto cobrado no aporta nada |
| **Inversión** | `spendService.spendArsInRange`: `growth_spend` prorrateado por días al cruzar el rango; el USD ya viene congelado al BNA venta del día de carga |
| **CPL** | inversión ÷ leads · **CPQL** inversión ÷ calificados · **CPO** inversión ÷ oportunidades · **CAC** inversión ÷ ganadas |
| **ROI** | (ingresos − inversión) ÷ inversión · **ROAS** ingresos ÷ inversión |
| Por campaña / landing / variante | Las mismas cuentas con el subconjunto de sesiones y leads de esa campaña, landing o variante |
| Origen del tráfico | Sesiones por `utm_source` / `utm_medium`. Los leads sin formulario web entran con la **fuente del CRM** y el medio `(carga manual)` / `(Chimpa IA)` / `(importado)` |

En un workspace de **cliente** el Resumen no muestra calificados, oportunidades, ingresos ni ROI: solo consultas y costo por
consulta.

## Plata por oportunidad, sin pasar por el lead

`revenueArsByOpportunityIds` (mismo archivo `revenue.ts`): oportunidad ganada → proyecto → cobros. **Es el camino correcto
para las ventas a clientes que ya existían** (sin consulta, sin lead). Si alguien pide "cuánto facturamos de esta venta",
va por acá, nunca creando un lead.

## Otras preguntas frecuentes

| Pregunta | De dónde sale |
|---|---|
| ¿Cuánto nos dejó lo que trajo tal referidor? | `GET /api/crm/referrers/:kind/:id/value` → `totals{leadCount, wonCount, projectCount, totalIncomeArs}`, con la misma cadena de cobros reales. Una empresa suma también lo que refirió su gente |
| ¿Qué fuente de leads rinde? | `GET /api/analytics/profitability-by-source` (`server/domains/analytics-extra/analytics-extra.routes.ts`), pestaña Rentabilidad › Origen y referidos |
| ¿Cuánto vale un cliente? | `GET /api/analytics/client-ltv` (mismo router) |
| ¿Cómo viene el pipeline? | `GET /api/crm/dashboard?workspaceId=` (`crm.routes.ts:1217`). **Ojo: hoy agrupa por mes de creación de la oportunidad y no trae pronóstico ponderado ni win rate por vendedor** — es el pendiente D-04 |
| ¿Qué leads atiendo primero? | Chimp Score: `GET /api/growth/leads/:id/score`, `GET /api/growth/workspaces/:id/scores/top`. Reglas explicables, sin calibrar (D-05) |
| ¿Qué hizo este lead en la web? | `GET /api/growth/leads/:id/web-journey` (tarjeta "Recorrido en la web") |
| ¿Qué pasó con este cliente, en orden? | Pestaña **Historia** del lead o de la persona (`crm/history/history.service.ts`), que lee de las tablas de siempre |
| ¿Quién abrió la propuesta y hasta dónde leyó? | Eventos con `properties.proposal = <slug>`; la demo, con `properties.demo`. Lo resume `proposal.service.ts › stats` y el journey de la oportunidad |
| ¿Me lo pasás a Excel? | `GET /workspaces/:id/submissions.csv` (consultas) y `/leads.csv` (leads), **solo admin**, con `;` + BOM y teléfonos como texto |
| ¿Cómo viene el mes de Growth? | Brief de inteligencia (`brief.service.ts`): hallazgos por reglas (período vs. anterior, mejores y peores campañas y landings, experimentos, leads estancados, spam, salud del tracking) + narración con gpt-4o-mini limitada a esa evidencia |

## Trampas conocidas al reportar

- **"Tenemos N leads" no es comparable entre meses** si en el medio se archivaron leads: el archivado los saca del conteo
  retroactivamente.
- **Si la oportunidad ganada no generó proyecto**, el ingreso no aparece en ningún número de Growth. Es el corte de cadena
  más común: revisarlo antes de decir que una campaña no dejó plata.
- **Calificado ≠ calificado comercialmente**: hoy alcanza con tener una oportunidad abierta.
- **El pipeline mezcla workspaces** si no se pasa `workspaceId`.
- **El brief narra la inversión en texto**, así que un usuario que no debe ver plata no puede verlo: por eso está cerrado
  por ruta y no por campo.
- Antes de afirmar que algo "no está en producción", correr `git log origin/main..origin/dev`.
