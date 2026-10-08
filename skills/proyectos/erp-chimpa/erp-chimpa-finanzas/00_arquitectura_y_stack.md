# 00 · Arquitectura y stack

> **Nota 12/9/2026:** ya no hay ambiente local. Donde este capítulo diga "local :5001", `erp-local` o `admin/admin1234`, leerlo como historia: hoy se prueba en https://dev-finanzas.chimpance.digital (ver cap. 01).

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite 5/6, TypeScript, Tailwind 3, shadcn/ui (Radix), wouter (routing), TanStack Query v5, framer-motion, Recharts, react-hook-form |
| Backend | Node 20, Express 4, TypeScript (ejecutado con tsx en dev, esbuild en prod) |
| DB | PostgreSQL + Drizzle ORM 0.39 + drizzle-zod (validación Zod autogenerada) |
| IA | OpenAI SDK directo (`server/lib/openai.ts`): gpt-4o-mini (chat/tools), gpt-4o-mini-transcribe (audio), gpt-4o (visión) |
| Auth | express-session (store en memoria) + bcrypt; roles admin/operator |
| Tema visual | Dark fintech tipo BankDash: navy #1a2537, acento #0074ba, Manrope + JetBrains Mono. NO es el DS Digitaal del sitio Chimpa |

Estructura del repo:
```
client/src/pages/       ~30 páginas (Hoy = home `/`, Dashboard = `/finanzas`, ObligacionesList, DeudasFinancieras, BotChat, Crm*, Tareas, ...)
client/src/components/today/  Pantalla Hoy: todayMeta (labels/fechas AR/dinero) + CalendarFeedsDialog (conectar Google Calendar por iCal)
client/src/components/chat/  AgentChat (chat completo reutilizable) + AgentWidget (burbuja flotante global, Ctrl+J, contexto de pantalla) — ver capítulo 02
client/src/components/work/  Módulo Trabajo: TaskWorkspace (toolbar+filtros+Kanban/Lista+dialog+sheet, embebible con projectId/opportunityId), TaskBoard (dnd-kit), TaskTable, TaskFormDialog, TaskDetailSheet, taskMeta (labels/colores)
client/src/components/  ObligationCreateModal, MoneyText, MoneyInput, Layout, app-sidebar, ui/ (shadcn)
server/routes.ts        ~1600 líneas, TODOS los endpoints REST (formato {ok, data} | {ok:false, error})
server/services/        21 servicios por dominio (obligations, movements, invoices, iva, financialDebts,
                        recurring, analytics, botIntakes, botChatAgent, cashboxes, ...)
server/domains/crm/     CRM modular: leads, opportunities, pipelines, tasks, events (43 rutas propias)
server/domains/work/    Módulo Trabajo: tareas, horas (/api/work) — scoping por rol collaborator; templates/ = plantillas de proyecto (M7)
server/domains/users/   Gestión de usuarios (/api/users, solo admin): crear, rol, activo, reset password
server/domains/today/   Pantalla Hoy (7/9/2026): today.service (arma el día por rol: prioridades, agenda, bloques), calendar.service (feeds iCal, sync cada 15 min con node-ical, vínculo por nombre), today.routes (/api/today, todos los roles)
server/domains/feedback/ Feedback del cliente: feedback.routes (/api/feedback, autenticado), public.routes
                        (/api/public/review/:token, SIN auth, rate-limit), feedback.service, feedbackAi (gpt-4o-mini)
server/lib/roleGuard.ts Guard global de API para el rol collaborator (montado antes de las rutas)
server/domains/work/    Módulo Trabajo (sep 2026): work.routes.ts (/api/work) + tasks/task.service.ts + time/timeEntry.service.ts
server/domains/clientes/ Ficha del cliente (8/9/2026): logo (/api/companies/:id/logo), playbook cifrado (/api/playbook) y soporte por horas (/api/support) — capítulo 08
server/index.ts         boot: seed admin + datos canónicos, listen (¡con reusePort!), job diario recurrentes
shared/schema.ts        ~960 líneas: TODAS las tablas Drizzle + enums + insert schemas
lib/db/index.ts         pool pg (driver node-postgres, NO neon en local); lib/money.ts formato argentino
```

## Modelo de datos (lo esencial de ~60 tablas)

**Núcleo financiero:**
- `obligations` — el centro. Campos clave: `direction` (AR/AP), `status` (draft→pending→partial→paid | canceled; overdue se computa en lectura), `sourceType` (manual/recurring/invoice/tax_iva/financial_debt/commercial_agreement), `owner` (santiago/chimpance), `currency`, `amountOriginal`, `paidAmountOriginal`, `isFloating`+`fxSnapshotRate`+`amountFrozenArs` (USD_BNA), `projectId` NOT NULL, `invoiceId`, `installmentId`, `recurringRuleId`.
- `movements` + `movement_lines` — cobros/pagos; tipos inflow/outflow/opening/adjustment/transfer; líneas tipadas (net_income, bank_fee, tax_debito_credito, interest, discount...). `obligation_links` vincula movimiento↔obligación con monto aplicado.
- `cashboxes` + `cashbox_transfers` — cajas por moneda; saldos DERIVADOS de movimientos (nunca editar saldo a mano).

**Facturación (auditoría IVA 14/9/2026):** `invoices` (sale/purchase, tipos A/B/C/E, `kind` invoice|credit_note + `related_invoice_id`, `iva_rate` por comprobante; E y C sin IVA), `iva_entries` (NC y anulaciones con monto negativo en la misma columna), `iva_periods` (el AP de IVA se crea SOLO en `ivaService.closePeriod`, NUNCA por factura; arrastre `technical/free_balance_in/out` y `due_date` del mes siguiente por CUIT), `withholdings` (IVA imputado por fecha), `obligation_tax_links`. **Todo cálculo de IVA sale de `shared/fiscal.ts`** (cliente y servidor). Convención: el monto de una obligación es NETO; al facturar pasa al total con IVA.

**Deudas:** `financial_debts` (type loan/tax_plan/partner_loan/supplier_financing/other, sistemas de amortización francés/alemán/americano/custom, interés fijo/variable/none, `owner`) + `financial_debt_installments` (status pending→generated) + `financial_debt_obligation_links`. Al generar obligaciones desde cuotas, heredan `owner` de la deuda. El importador de PDFs ARCA "Mis Facilidades" se quitó el 4/10/2026 (no se usaba y duplicaba planes al rebajar el PDF): los planes de ARCA se cargan por lote desde Claude con `POST /api/financial-debts` (tipo `tax_plan`, cuotas iguales con `interestType: none`) + `generate-obligations`. Las tablas `arca_plan_imports`/`arca_plan_import_items` quedaron en la base sin uso.

**Deudas abiertas (19/9/2026, migración 0027, en `dev`):** `financial_debts.mode` = `installments` (lo histórico) | `open`. Una deuda abierta no tiene cuotas: fecha de pago (`due_date`) e interés opcionales; tipos nuevos `overdraft`, `credit_card`, `personal_loan`. **El saldo vive en UNA obligación AP enlazada** (`financial_debts.obligation_id`, `sourceType financial_debt`; sin fecha = status `draft`): monto de la obligación = inicial + intereses + ajustes, pagado = pagos parciales. Por eso suma sola en "Mi Deuda Total" y se paga con el motor de siempre (`payObligation`, anulable con VOID). `financial_debt_entries` = cuenta corriente (initial / interest / adjustment); los pagos NO se guardan ahí, se leen de `obligation_links`. Interés: `shared/debtInterest.ts` (puro, tasas NOMINALES: TNA/365 diaria, TNA/12 mensual; `accrual_frequency` daily = compuesto día a día con un renglón por mes, monthly = una vez por mes el `accrual_day`; `interest_iva` suma 21 %). `server/services/openDebts.ts` (`create`, `accrue` idempotente por `last_accrual_date`, `accrueAll`, `pay`, `adjustBalance`, `update`: la tasa nueva rige desde hoy). Job en `server/index.ts` al boot y cada 6 h. Pago en otra moneda: `fxRate` (pesos por dólar) en `PayReceiveInput` de `obligations.ts`. Rutas: `POST /api/financial-debts/open`, `PATCH /:id/open`, `POST /:id/payments`, `POST /:id/adjust-balance`, `POST /accrue`; `summary` devuelve `byOwner`. UI: `client/src/components/deudas/` (`OpenDebtFormDialog`, `OpenDebtDetail`), "Nueva deuda" abre un selector abierta / con cuotas. Tests: `tests/deudasAbiertas.test.ts`. Pendiente: que el Agente Chat cree deudas abiertas (hoy solo crea con cuotas), conectar la tarjeta refinanciada con `card_statements`, y cargar las 21 deudas reales de Santiago en producción después del pase (faltan tasas y día de vencimiento de bancos y tarjetas). Las deudas sin fecha no aparecen en "Por pagar" del mes (esa pantalla filtra por vencimiento).

**Préstamo recibido → a qué cuenta entró el dinero (24/9/2026, migración 0045, EN PRODUCCIÓN desde el 25/9):** `financial_debts.disbursement_movement_id` (null = no entró a ninguna cuenta) apunta a un movimiento `inflow` en la cuenta donde entró el dinero, creado con el motor único (`registrarEntrada`: pago cruzado si la cuenta es de otro titular). No es ganancia: rentabilidad solo cuenta cobros de obligaciones AR. Servicio `server/services/debtDisbursement.ts` (`validarIngresoPrestamo`, que se llama ANTES de crear la deuda; `registrarIngresoPrestamo`; `anularIngresoPrestamo`, que se llama al borrar la deuda y anula el ingreso con VOID; `detalleIngresoPrestamo` → `getById().disbursement`). Reglas: nunca a una tarjeta de crédito; si la cuenta es de otra moneda que la deuda, se pide el monto que entró en la moneda de la cuenta; un solo ingreso vigente por deuda. Rutas: `disbursement` opcional en `POST /api/financial-debts` y `/open`, y `POST /api/financial-debts/:id/disbursement` para deudas ya cargadas. UI: `client/src/components/deudas/DebtDisbursement.tsx` (`DisbursementField` en los dos formularios de alta, `DisbursementPanel` en los dos detalles con el botón "Registrar a qué cuenta entró"). Chat: ver cap. 02. Tests: `tests/deudaIngresoACuenta.test.ts`.

**Recurrentes:** `recurring_rules` + `recurring_rule_runs` (ejecución idempotente, job diario en index.ts).

**Acuerdos comerciales:** `commercial_agreements` + installments (planes de pago con o sin factura). Desde el 2/10/2026 cada cuota se **cobra sin factura** desde la tabla del acuerdo (botón "Cobrar": abre `PagoCuentaForm` con la obligación de la cuota; si está proyectada, primero hace `create-ar`). El `list` de acuerdos devuelve cada cuota con su `obligation` (con `companyName`/`projectName`), y la UI muestra "Cobrada"/"Cobrada en parte" derivado de esa obligación (`installmentDisplayStatus` en `lib/meta/projects.ts`, sin migración). Una cuota con cobros no se puede borrar (422). USD BNA sigue exigiendo factura antes de cobrar. **Recibo e Invoice de Chimpancé (4/10/2026, no fiscales):** `server/domains/invoicing/clientDocs.*` arma los PDF (pdf-lib, Helvetica, diseño del DS sección «Recibo e Invoice»), rutas `GET /api/client-docs/invoice/:obligationId/pdf` (inglés, pide el pago, número INV-<id obligación>) y `GET /api/client-docs/receipt/:obligationId/pdf?movementId=` (español, del último cobro vigente, número REC-<id movimiento>, monto en letras, saldo del acuerdo). Numeración = ids internos a propósito (sin tabla ni migración; puede tener saltos). Solo owner chimpance, nunca USD BNA. Botones: cuota del acuerdo (avión = invoice, documento = recibo) y menú ⋯ de la cuenta por cobrar; helper `client/src/lib/clientDocs.ts`. **Forma de facturar del cliente + envío por mail (5/10/2026, migración 0059):** `companies.billing_method` (`arca` | `receipt` | `invoice`, null = sin definir → se ofrecen todos los documentos, así quedaron las empresas viejas) y `companies.doc_language` (`es`/`en`, solo cuenta con invoice); reglas en `shared/billing.ts` (`billingAllows`, `docLanguageFor`). Se elige en el alta de empresa (sección «Cómo le facturamos», ARCA marcada de entrada; con Invoice aparece el idioma) y se ve en la ficha. La UI ofrece solo lo que corresponde: ARCA → «Emitir factura»; solo recibo → recibo en español; invoice → invoice (PDF siempre en inglés) y, cobrado, el recibo en el idioma elegido. `companyBillingMethod` viaja en `/api/obligations` y en el `list` de acuerdos. Envío: mismo diálogo que la factura (`EnviarDocClienteDialog` en `EnviarFacturaDialog.tsx`), rutas `GET/POST /api/client-docs/:kind/:obligationId/email[/body|/send]` (`clientDocsEmail.service/compose/ai.ts`, reusa `senderGmailState`/`sendWithGmail`/`cleanRecipients` de `invoiceEmail.service`), constancia en `client_doc_email_sends` (el recibo es de UN cobro: `movementId` fijado en el borrador) + audit `receipt_email_sent`/`invoice_email_sent`. En la cuota, el invoice y el recibo son un menú «Enviar por mail / Ver PDF». Permisos: `/api/client-docs` vedado al colaborador, el contador solo GET. Tests: `tests/clientDocsEmail.test.ts` y `.api.test.ts`.

**Bot:** `bot_intakes` (borradores: parsed JSONB, warnings, confidence, desiredAction), `bot_chat_sessions` + `bot_chat_messages` (append-only, guarda tool_calls en meta).

**CRM:** `crm_leads` (+tags/needs/interactions/tasks/status_history), `crm_pipelines`+stages, `crm_opportunities` (+stage_history), tracking anónimo estilo HubSpot: `crm_sessions`, `crm_identities`, `crm_events`.

**Trabajo (módulo propio, sep 2026):** `work_tasks` (título, `projectId` y/o `opportunityId` — CHECK: al menos uno; `parentTaskId` un solo nivel de subtareas; enums `work_task_status` backlog/todo/in_progress/review/done/canceled, `work_task_type` design/development/content/marketing/strategy/qa/admin/meeting/other, `work_priority`, `work_task_source` manual/chat/feedback/system/meeting; assignee, due/start, `estimatedHours`, `position` para el Kanban, completedAt/canceledAt), `work_task_comments`, `work_time_entries` (horas por tarea+usuario+fecha, `projectId` desnormalizado, void con motivo; base del costo real de fase 2). `projects.opportunityId` vincula proyecto ← oportunidad (una oportunidad → un proyecto).

**Importar reunión (9/9/2026):** `work_meetings` (proyecto, `roundId` y `docId` que se completan al confirmar, título, `meetingDate`, `source` paste/google_doc + `sourceUrl`, `rawText` con la minuta tal como entró, clientName, summary, `decisions`/`openQuestions` jsonb, `aiJson`/`aiModel`, asunto y cuerpo del mail al cliente, `status` draft/imported/discarded, importedAt) + `work_meeting_items` (uno por pedido detectado: `side` internal/client, título, descripción, `quote` textual, tipo/prioridad/responsable/vencimiento/horas sugeridos, `confidence`, `selected`, `status` pending/created/dismissed, `feedbackId` y `taskId` cuando se creó, `position`). Migración `0007_importar_reunion` (también suma `meeting` al enum `work_task_source`). Detalle en el capítulo 07.

**Entrada de correo (10/9/2026):** `email_messages` (bandeja de Gmail ya parseada: `userId`, `gmailId`+`threadId`, `fromEmail`/`fromName`, `subject`, `body`, `receivedAt`, `status` pendiente/procesado/descartado/error, `motivo` por el que quedó así —lo que se muestra en la bandeja—, `companyId`/`contactId` cuando se atribuye, `atribuidoPor` contacto/hilo/dominio/nombre/ia/ninguno, `aiJson`/`aiModel`, `processedAt`; unique (`userId`,`gmailId`) es la red de seguridad si el sondeo de Gmail se superpone y evita procesar el mismo mail dos veces) + `email_blocked_senders` (remitentes que el usuario bloqueó: `patron` con mail completo o dominio "@x.com" siempre en minúsculas, unique por `userId`+`patron`). Migración `0008_entrada_de_correo`.

**Pantalla Hoy (7/9/2026):** `calendar_feeds` (por usuario: nombre, `url` secreta iCal — nunca se devuelve completa —, active, lastSyncedAt, lastError, eventCount) + `calendar_events` (ocurrencias ya expandidas: uid, `instanceKey` único por feed, título, starts/ends, allDay, meetingUrl, `projectId`/`opportunityId`/`companyId` vinculados por nombre, syncedAt; se reemplazan enteras por feed en cada sync). `work_tasks` suma `dueTime` (time), `durationMin`, `meetingUrl`, `pinnedAt`. `users.dashboardPrefs` jsonb `{hiddenBlocks, blockOrder}`. Índices parciales `work_tasks_due_date_idx` (abiertas) y `crm_lead_tasks_due_at_idx` (open). SQL `scripts/sql/2026-09-07_hoy.sql` + migración `0002_pantalla_hoy`.

**Sistema:** `users`, `audit_log` (entityType+entityId+action+details JSONB), `exchange_rates` (BNA billete compra/venta, se actualiza al boot), `payment_methods`.

**Motor único de plata (14/9/2026, `server/domains/plata/registrar.service.ts`):** TODA carga de plata pasa por acá — `registrarSalida` / `registrarEntrada` (movimiento + líneas + tags en una transacción; proyecto por titular vía `resolverProyecto`: personal → PERSONAL-SANTIAGO, empresa → "Chimpancé – General / Overhead", el proyecto personal no vale para la empresa; pago cruzado si `owner` ≠ dueño de la caja: salida → titular debe al dueño, entrada → dueño debe al titular; cuotas si es tarjeta; memoria de comercios con `aprender`; `ambito: "estricto"` valida categoría del titular), `registrarPendiente` (obligación AP/AR), `registrarEntreCuentas` (transferencia, cruce opcional, `cardStatementId`) y `deshacer`. `createInstallmentPlan`/`splitInstallments`/`addMonths` viven acá (card.service los re-exporta). Lo llaman `movementService.create`/`createTransfer`, `gastoService`, `cardService.createPurchase`/`payStatement`, `botIntakeService.confirm` (egreso y AP/AR) y `obligationService._executePayment` (con `proyectoFijo`, `validarLineas: false`, `amountTotal` neto y cruce en la moneda de la obligación). **No insertar movimientos a mano en servicios nuevos: usar el motor.** Test: `tests/registrarMovimiento.test.ts`. **Formulario y pantalla únicos (etapas 2–4, 14/9/2026):** `client/src/components/plata/` — `RegistrarMovimientoDialog` (se abre con `openRegistrarMovimiento(preset)`: `que`, `owner`, `paid`, `cashboxId`, `obligation` → `PagoCuentaForm`, `draft` → borrador del Chimpa IA), `useObligationActions` (editar/facturar/reprogramar/anular cuentas). API `POST /api/plata/registrar` y `/api/plata/deshacer` (`server/domains/plata/plata.*`, acepta `botIntakeId`). `pages/Movimientos.tsx` = pantalla única (hecho + pendiente + proyectadas); Por pagar/Por cobrar = `MovimientosScreen preset`. `ObligacionesList` y `ObligationCreateModal` ya no existen. Tests: `tests/plataFormulario.test.ts`.

**Ámbito personal (12/9/2026, migración `0014_ambito_personal`):** para registrar los gastos domésticos de Santiago con su propia lógica (spec en `docs/personal/spec-ambito-personal.md`).
- `categories` suma `scope` (enum `category_scope` business|personal), `parent_id` (dos niveles: categoría → subcategoría; la hija hereda ámbito y tipo) y `position`; **el nombre ya no es único global** (la unicidad entre hermanos la valida `catalogService`). Obligaciones/movimientos guardan la hoja elegida. `GET /api/categories` devuelve `parentName` y `fullName` ("Salud › Farmacia"). POST/PATCH/DELETE **solo admin**; se administran en **Admin › Categorías** (`components/admin/CategoriesAdmin.tsx`: pestañas Empresa/Personal, árbol, crear sub, renombrar, tipo, activar/desactivar en cascada). En los formularios se elige con `CategorySelect` (filtra por titular: santiago → personal; chimpance/vibra → empresa; ya no se crean categorías desde los selectores). Presupuestos y "gastos por categoría" del Dashboard suman las subcategorías en su categoría.
- `category_rules` (memoria del chat: `match_key` único → categoría + titular, `hits`) — ver cap. 02 › Velocidad y comprobantes.
- `recurring_rules.owner` (antes no existía y todo nacía de Chimpancé); las obligaciones generadas heredan titular **y categoría** (la categoría antes se perdía).
- `cashboxes` suma `card_issuer` (clave de `shared/cardIssuers.ts`: naranjax, galicia, santander, bbva, macro, nacion, provincia, bancor, icbc, hsbc, supervielle, credicoop, brubank, uala, mercadopago, personalpay, lemon, amex — o texto libre), `card_network` (visa/mastercard/amex/cabal/naranja/diners/maestro), `last4`, `card_color`, `logo_path` (mismo almacenamiento que el logo de empresas: `saveLogoFile`/`removeLogoFile` en `logo.service.ts`; `GET|POST|DELETE /api/cashboxes/:id/logo`). Medios de pago muestra la franja "Tarjetas y cuentas" con `PaymentCard` (logos de red de `react-icons/si`).
- Proyecto técnico **"Personal – Santiago"** (`code = PERSONAL-SANTIAGO`, empresa interna "Santiago Castro (personal)"), lo crea `ensurePersonalProject()` (`server/services/personalScope.ts`) al boot. Los formularios lo preseleccionan al elegir titular Santiago.
- **Dashboard por titular**: `GET /api/analytics/dashboard|monthly-chart|expenses-by-category?owner=chimpance|santiago|vibra` (sin owner = todos). La UI arranca SIEMPRE en Chimpancé (no se recuerda). Saldo de cajas filtra por `cashboxes.owner`; cobros/pagos/IVA/USD_BNA por `obligations.owner`; el proyecto personal no aparece mirando Chimpancé/QueVibra. "Mi Deuda Total" sigue consolidada a propósito.
- **Presupuestos, "real" (corregido 12/9)**: `realSpendRows` en `budgets.ts` suma (1) lo pendiente de cuentas a pagar que vencen en el mes (sin canceladas/borradores), (2) los pagos de cuentas hechos en el mes, (3) egresos directos sin cuenta asociada (titular = el del pago cruzado si existe, si no el dueño de la caja) y (4) cuotas de tarjeta por `billing_date`. Transferencias no cuentan. Test `tests/budgetsReal.test.ts`.
- **Tarjetas de crédito (12/9, migración `0015_tarjetas`)**: `cashboxes.credit_limit`; `card_statements` (resumen cargado A MANO: `closing_date`, `due_date`, `statement_total` opcional = lo que dice el banco; período = (cierre anterior, cierre]); `card_installment_plans` + `card_installments` (compra en cuotas: el egreso queda por el total y las cuotas se reparten por `billing_date` = fecha de compra + k−1 meses); `cashbox_transfers.card_statement_id` (el pago del resumen es una transferencia cuenta → tarjeta atada al resumen; si la cuenta es de otro titular, cruce en la cuenta corriente). Servicio y rutas en `server/domains/cards/` (`/api/cards/:cashboxId`, `/purchases`, `/statements`, `/statements/:id/pay`; en la lista negra del colaborador y de lectura del contador). Pantalla `client/src/pages/TarjetaDetalle.tsx` en `/tarjetas/:id` (Medios de pago abre ahí las tarjetas de crédito): deuda, próximo vencimiento, límite/disponible, consumos desde el último cierre por categoría, resúmenes con estado y Pagar, cuotas por venir. El chat crea el plan si el comprobante trae cuotas y la caja es tarjeta (`parsed.cardInstallments`, override en la tarjeta del borrador). Test `tests/cards.test.ts`.
- **Pendiente de la spec** (no hecho): privacidad del ámbito personal (hoy lo ve cualquiera que vea finanzas), lista "a quién le pago", pantallas Personal › Resumen/Gastos.

## Endpoints clave

- `POST /api/obligations` (+ `/:id/pay`, `/:id/receive`, `/:id/cancel`, `/:id/reschedule`) — validación Zod inline en routes.ts; create/patch aceptan `owner`.
- `POST /api/financial-debts` (+ `/:id/generate-obligations`) — acepta `owner`.
- `GET /api/analytics/debt-summary` — Mi Deuda Total: suma AP vivas (draft/pending/partial, remaining = amountOriginal − paidAmountOriginal) + cuotas pending NO generadas (evita doble conteo), por owner y moneda; USD→ARS al BNA venta. Feature propia, commit f3fb12c.
- `GET /api/analytics/dashboard|monthly-chart|projections|profitability/*` — KPIs.
- `POST /api/bot-chat/sessions/:id/messages` y `/confirm` — el chat (ver capítulo 02).
- `GET /api/cuit/:cuit` (con login) — padrón oficial de ARCA (`ws_sr_constancia_inscripcion`): razón social, condición fiscal, domicilio fiscal, actividades y avisos; respaldo CuitOnline si falta el certificado o ARCA falla. Código en `server/domains/integrations/arca/` (WSAA con node-forge + ticket cacheado en memoria y en `.arca-cache/`), tests en `tests/arcaPadron.test.ts`. Env: `ARCA_CERT`/`ARCA_KEY` (PEM en base64), opcionales `ARCA_CUIT`, `ARCA_ENV`, `ARCA_CACHE_DIR`. Un certificado por ambiente: producción `chimpafinanzas-padron` (padrón + wsfe, punto de venta WS = 2), dev `chimpafinanzas-dev` (solo padrón). Certificados y claves en `certs/arca/` (gitignored), nunca en el repo (12/9/2026).
- **Factura electrónica ARCA (wsfe, 16/9/2026, migración 0019)** — el ERP pide el CAE: `POST /api/invoices` con `emitInArca: true` (+ `itemDescription`, `serviceFrom`, `serviceTo`, `paymentDueDate`; punto de venta y número los pone ARCA) · `POST /api/invoices/:id/credit-notes` sale sola por ARCA si la factura tiene CAE (asociada con `CbtesAsoc`) · `GET /api/invoices/:id/pdf` (formato ARCA, QR RG 4892, transparencia fiscal en B; `?download=1`) · `GET /api/arca/facturacion` → `{enabled, env, pointOfSale, reason}`. Columnas `invoices.cae`, `cae_due_date`, `arca_env` (`produccion`/`homologacion`), `arca_data` (receptor, período, importes en pesos, fx, observaciones, pedido sin credenciales + respuesta). Código: `server/domains/integrations/arca/{wsfe.map,wsfe.service,arcaHttp,facturaPdf,emisor}.ts`, `server/services/{invoiceArca,invoicePdf}.ts`; UI `client/src/components/facturacion/{ArcaInvoiceSection,EmitirFacturaDialog}.tsx` (diálogo global, `openEmitirFactura(cuenta)`, montado en `Layout`). Reglas (Santiago): **en pesos** (USD/USD BNA al BNA venta congelado), solo **A y B de Chimpancé** (E = wsfex, QueVibra = otro CUIT: se registran a mano), concepto servicios, tipo propuesto por la condición IVA del cliente (`suggestSaleInvoiceType` en `shared/fiscal.ts`: RI/monotributo → A, exento/CF → B, exterior → E). Numeración: antes de emitir, último de ARCA == último del ERP (si no, `ARCA_OUT_OF_SYNC` y no emite); si ARCA no responde se consulta el número (`FECompConsultar`). Con CAE no se anula (`ARCA_VOID_BLOCKED`): nota de crédito. Tests `tests/arcaWsfe.test.ts`, `tests/facturaPdf.test.ts`.
- **Pantalla Hoy** (`/api/today`, todos los roles; el servicio decide qué devuelve a cada uno): `GET /?date=YYYY-MM-DD&scope=mine|team&limit=7` → `{date, tomorrow, isToday, nowTime, user, scope, canTeam, hats[], hatCounts, prefs, summary, overdue[], priorities[], agenda[], agendaTomorrow[], calendar.feeds[], blocks{op,com,fin,cli}}` (ítems con `kind` task/crm_task/receivable/payable/feedback/client_reply, `hat`, `priority` efectiva, `score`, `link`) · `GET|PATCH /prefs` `{hiddenBlocks?, blockOrder?}` · `GET /calendar/feeds` (url enmascarada) · `POST /calendar/feeds {name?, url}` (valida https/webcal y host público, sincroniza en el acto) · `POST /calendar/feeds/:id/sync` · `DELETE /calendar/feeds/:id` (solo el dueño). En `/api/work`: `POST /tasks/:id/pin {pinned?}` (alterna) · `POST /tasks/:id/postpone {to: today|tomorrow|next_week|YYYY-MM-DD}`; `POST/PATCH /tasks` aceptan `dueTime` (HH:MM), `durationMin` (5-1440), `meetingUrl`. Job en `index.ts`: `calendarService.syncAll()` a los 20 s del boot y cada 15 min.
- **Módulo Trabajo** (`/api/work`, dominio propio, respuesta `{ok,data}`): `GET /users` (activos, para responsables) · `GET /tasks?projectId|opportunityId|assignedToUserId|mine=1|status=a,b|type|priority|search|includeClosed=1|onlyRoot=1|parentTaskId` · `GET /tasks/summary` (counts por estado, vencidas, horas cargadas/estimadas) · `GET /tasks/:id` (subtareas, comentarios, horas, historial de audit, padre) · `POST /tasks` (subtarea hereda proyecto/oportunidad del padre; tarea de oportunidad con proyecto vinculado cae en el proyecto) · `PATCH /tasks/:id` (status → completedAt/canceledAt automáticos y position al final de la columna) · `POST /tasks/:id/cancel` · `POST /tasks/reorder` · `POST /tasks/:id/comments` · `POST /tasks/:id/time-entries` (0 < horas ≤ 24; si la tarea estaba backlog/todo pasa a in_progress) · `POST /time-entries/:id/void` · `GET /time-entries?projectId` · `GET /time-entries/by-user?projectId`.
- **Importar reunión** (`/api/work/meetings`, admin/operador; el colaborador recibe 403): `GET /google-status` (si el servidor tiene credenciales de Google y si el usuario conectó su cuenta) · `GET /?projectId` (sin `projectId` devuelve todas) · `POST /parse {projectId, text? | docUrl?, meetingDate?}` → borrador con `items[]` (side internal/client, tipo, prioridad, responsable sugerido, cita, confianza) + resumen, decisiones, dudas y el mail; **no crea nada** · `GET /:id` · `PATCH /items/:itemId` (title, description, suggestedType/Priority/AssigneeId/DueDate, estimatedHours, selected) · `PATCH /:id/email {subject, body}` · `POST /:id/confirm {useOpenRound?, createDoc?}` → abre la ronda `Reunión DD/MM`, inserta un `work_feedback` (`source: meeting`, campos `ai_*` prellenados) por punto nuestro y lo convierte en tarea, crea las tareas `Esperando de <cliente>: …` de los puntos del cliente, guarda la minuta en Documentación y marca la reunión `imported` (reconfirmar = 422) · `POST /:id/discard`. Detalle en el capítulo 07 › Importar reunión.
- **Ficha del cliente** (`/api/companies/:id/logo`, `/api/playbook/...`, `/api/support/...`): ver capítulo 08.
- **Referidores** (`/api/crm/referrers`, 15/9/2026, en dev): quién nos trajo un lead. La fuente "Referido" se reconoce por el nombre en cualquier forma (`shared/referral.ts` › `isReferralSourceName`: referid / recomend / boca a boca) y con ella el alta y el PATCH del lead exigen `referralContactId` | `referralCompanyId` | `referralNameText` (uno solo: al elegir otro, el servicio limpia los demás; con otra fuente se rechazan con 422). `GET /referrers?search=` busca personas (`company_contacts`, con su empresa) y empresas; `POST /referrers` alta rápida `{kind:"company", name}` o `{kind:"contact", firstName, lastName?, companyId? | companyName?}` (una persona necesita empresa: se crea junto si viene `companyName`; si no hay, la UI ofrece "solo el nombre" = texto); `GET /referrers/:kind/:id` una opción; `GET /referrers/:kind/:id/value` → `{referrer, totals{leadCount, wonCount, projectCount, totalIncomeArs}, leads[]}` (para una empresa suma también lo referido por su gente; ingreso real cobrado neto de IVA en ARS, misma cadena lead→oportunidad ganada→proyecto→cobros AR que Rentabilidad). Código: `server/domains/crm/referrers/referrer.service.ts`. UI: `components/crm/ReferrerPicker.tsx` (EntityCombobox + diálogo de alta rápida Persona/Empresa/Solo el nombre) en el alta de lead y en el detalle; `ReferrerValuePanel.tsx` en la ficha de empresa, pestaña **Referidos** (`/empresas/:id?tab=referidos`); Rentabilidad › Origen y referidos suma la columna "Leads referidos" (`byReferral[].leadCount`, `companyId`) y linkea a la ficha. Tests: `tests/referidos.api.test.ts`.
- **Sitio web, logo y datos públicos del lead + necesidades por IA** (15/9/2026, en dev, migración `0018_crm_lead_web_logo`: `crm_leads.website`, `logo_path`, `web_info` jsonb). `POST /leads/:id/web/lookup {domain?}` visita la home (dominio: el escrito a mano → `website` → mail del contacto con dominio propio; misma red resguardada que el logo de empresas, `logo.fetch.ts` › `fetchHomepage` + `findLogoForDomain(domain, home)`) y devuelve sin guardar `{domain, website, logo{dataUrl,…}|null, info{siteName, description, socials[], emails[], phones[]}}` (extracción pura en `leads/leadWeb.info.ts`, tests `leadWebInfo.test.ts`); `POST /leads/:id/web/apply {website, logoDataUrl?, info?}` guarda lo aprobado (logo en `uploads/logos/`, `express.json` subió a 5 MB por el data URL); `GET/DELETE /leads/:id/logo`. `getById` devuelve además `companyHasLogo` y `companyWebsite` (el hero usa el logo del lead o, si no, el de la empresa atada). Necesidades: `POST /leads/:id/needs/suggest` → el Chimpa IA (gpt-4o-mini, `needs/needAi.ts`, normalización pura en `needAi.parse.ts` + tests) lee `message` + `qualifyingNotes` y propone del catálogo o nombres nuevos, sin guardar; `POST /leads/:id/needs/bulk {items:[{needId?|name, isPrimary}]}` confirma (crea en el catálogo lo que falte, una sola principal). UI (`CrmLeadDetalle.tsx`): `ds/form/LongTextField` (texto largo leído completo con links clickeables, editado en diálogo con Guardar; reemplaza al InlineNotes de 3 renglones) para Consulta y **Notas internas** (= `qualifyingNotes`, antes "Notas de calificación"), `crm/LeadWebDialog.tsx` (vista previa → Guardar), `crm/NeedSuggestions.tsx` (ds-ai-box con tildes → "Agregar N necesidades"). Al ganar, la empresa del CRM pasa a `companies` con web y copia del logo (ver el punto siguiente).
- **Empresas del CRM / prospección** (16/9/2026, EN PRODUCCIÓN desde el 16/9 con el pase `8e4ca47`, migración `0020_crm_empresas_prospeccion`, decisión de Santiago: "no toda empresa y lead se convierten en clientes, no deben convivir con Empresas"). Tablas `crm_accounts` (empresa en prospección: `name`, `website`, `domain` normalizado sin www, `logo_path`, `web_info`, `phone`, `email`, `city`, `company_id` + `promoted_at` cuando pasa a Empresas) y `crm_contacts` (personas del CRM; hoy solo referidores, `account_id` nullable); `crm_leads.account_id`, `referral_account_id`, `referral_crm_contact_id`. **`companies` (Empresas) queda solo para clientes y proveedores reales** (facturación, IVA, proyectos, buscador, agente no ven prospectos). Código: `server/domains/crm/accounts/account.service.ts` (`search`, `match` por dominio o nombre normalizado, `resolveForNewLead`, `promoteForOpportunity`), reglas puras en `shared/prospects.ts` (`normalizeCompanyName` saca S.A./SRL/SAS y tildes, `hostFromWebsite`, `cleanSiteName`, `splitPersonName`; tests `prospects.test.ts`). Rutas: `GET /crm/accounts?search=` (clientes + CRM para el campo Empresa), `GET /crm/accounts/match?name=&website=` ("¿ya la tenemos?", `reason: domain|name`), `GET /crm/accounts/:id/logo`, `POST /crm/web/lookup {website}` (logo y datos de una web sin lead, no guarda). **Alta a mano** (`origin` manual; Growth y mails no cambian): `companyId` (cliente elegido) → `accountId` (del CRM) → `newAccount` ("es otra empresa") → si no se eligió nada, busca por dominio/nombre y si no está crea en el CRM; `logoDataUrl` + `webInfo` del formulario van a la empresa del CRM. `leads.website` se guarda siempre con https://. `getById` del lead devuelve `logoPath`/`website`/`webInfo` efectivos (del lead o de su empresa del CRM) + `account`; `leadWebService.apply/getLogo/removeLogo` escriben/leen el logo de la empresa del CRM si el lead tiene una; editar nombre o web del lead sincroniza la empresa del CRM mientras no pasó. **Ganar**: `PATCH /opportunities/:id {promoteProspect: true}` crea el cliente desde la empresa del CRM (o se ata al que ya existe por dominio/nombre), copia el logo (archivo propio), suma el contacto del lead a `company_contacts` sin duplicar mail, marca `crm_accounts.company_id/promoted_at` y ata lead y oportunidad; elegir `companyId` en una oportunidad con lead hace lo mismo con esa empresa. Oportunidad (lista y detalle) devuelve `prospect {accountId, name, logoUrl}` mientras no tiene empresa. **Referidores** (`referrer.service.ts`): kinds `contact | company | crm_contact | crm_account`; el alta rápida crea en el CRM (persona puede tener cliente `companyId`, empresa del CRM `accountId`, empresa nueva `companyName` o ninguna); `lifetimeValue` de una empresa de Empresas suma lo que refirió cuando era prospección; Rentabilidad cuenta claves `crm_contact-N` / `crm_account-N`. UI: `crm/LeadCompanyFields.tsx` (bloque Empresa del alta: Web con tarjeta de lo encontrado + EntityPicker con "Crear «X» en el CRM", aviso automático si la web coincide y "Es otra empresa", pregunta si coincide el nombre), `ClosingDialogs.WinDialog` (chips "Pasarla a Empresas" / "Ya está en Empresas"), `CrmOpportunityDetalle` (botón "Pasar a Empresas" junto al campo Empresa y en "¿De qué empresa es el proyecto?"), ficha del lead con chip "En el CRM" / "Cliente". Tests `crmProspectos.api.test.ts` + `referidos.api.test.ts`.
- `POST /api/crm/opportunities/:id/create-project` — crea el proyecto desde la oportunidad (empresa obligatoria; moneda y monto estimado como presupuesto; `projects.opportunityId`), arrastra las tareas de preventa (y sus horas) al proyecto; 422 si ya existe. `GET /api/crm/opportunities/:id` devuelve `linkedProject`.

## Seed automático al boot

`server/index.ts` crea si faltan: usuario `admin/admin1234` (¡hardcodeado!), empresa interna "Chimpancé", proyecto "Chimpancé – General / Overhead", pipeline "Ventas" con 6 etapas, 6 loss reasons. Por eso una DB vacía queda operativa sola.


## Roles de usuario (enum `user_role`)

Enum completo: `admin` · `operator` (legacy, sin uso) · `sales` · `read_only` (legacy, sin uso) · `collaborator` ·
`accountant` (5/9/2026). Usuarios se administran en Admin › Usuarios, **exclusivo de admin** (el último admin activo
no se puede desactivar ni degradar, ni auto-degradarse). El selector de rol al crear/editar solo ofrece
`CREATABLE_USER_ROLES` = admin/accountant/sales/collaborator (server/domains/users/user.service.ts) — operator y
read_only quedan como valores legacy del enum sin usuarios reales y sin forma de asignarlos desde la UI.

Los tres roles no-admin están **aplicados de verdad** vía guards globales de API montados en `server/routes.ts`
(`server/lib/roleGuard.ts`). `accountant` y `sales` usan **lista blanca** (solo pasa lo enumerado); `collaborator`
usa **lista negra** desde el 12/9/2026 (pasa todo menos lo enumerado). Si no matchea, 403 `AUTH_FORBIDDEN`. El front
espeja la restricción (sidebar filtrado + redirect de rutas no permitidas en `App.tsx`/`app-sidebar.tsx`) pero la
seguridad real es el guard del server. Los cuatro guards tienen test propio: `tests/roleGuard.test.ts` (51 checks,
sin base de datos).

- **`collaborator`** (Colaborador, sep 2026; **lógica invertida el 12/9/2026**): ve y **opera todo el ERP menos la plata**.
  Antes tenía una lista blanca chiquita (Hoy + Tareas + Chat, y dentro de Trabajo solo sus propias tareas). Ahora el guard
  es una **lista negra** (`COLLABORATOR_DENIED_PREFIXES`): todo lo que no esté enumerado pasa.
  - **Entra a**: Hoy, Tareas (todas las del equipo), Feedback, Agente Chat, Proyectos (con documentación, reuniones,
    entregables y plantillas), Empresas + **Playbook** (con revelado de contraseñas, que queda auditado en `audit_log`
    como `company_playbook_item/revealed`), Soporte por horas (carga horas), CRM completo (leads, oportunidades,
    pipeline, config) y Growth (menos Inversión e Importar).
  - **No entra a** (403): `/api/obligations`, `/api/projected-obligations`, `/api/movements`, `/api/transfers`,
    `/api/cashboxes`, `/api/payment-methods`, `/api/invoices`, `/api/iva`, `/api/financial-debts`, `/api/recurring-rules`,
    `/api/commercial-agreements`, `/api/withholdings`, `/api/arca`, `/api/suppliers`, `/api/supplier-bank-details`,
    `/api/budgets`, `/api/ledger`, `/api/analytics`, `/api/exchange-rates`, `/api/bot-intakes`, `/api/audit`,
    `/api/admin`, `/api/jobs`. Más rutas sueltas: la inversión de Growth (`/growth/workspaces/:id/spend`,
    `/growth/spend/...`, `imports/spend-csv`), **el brief de Growth** (`/growth/briefs`,
    `/growth/workspaces/:id/briefs` — narra la inversión EN TEXTO, "Mejor CPL: $ 40.000", así que la redacción por
    claves no lo alcanza y hay que cerrarlo por ruta), fijar el precio del soporte (`POST /api/support/plans`,
    `PATCH /api/support/plans/:id`) y lo destructivo (`DELETE /api/projects/:id`, `DELETE /api/companies/:id/permanent`).
    La gestión de usuarios no hace falta enumerarla: el `adminGuard` del propio dominio ya la cierra.
  - **La bandeja de correo (`/api/work/email`, pantalla `/correo`) sigue CERRADA** — es la única parte del módulo
    Trabajo que no se abrió. No la corta el guard global (cae bajo `/api/work` y pasa) sino el `mailGuard` del propio
    módulo, más el redirect de `/correo` en `App.tsx`. El motivo: el correo crudo es lo que el cliente haya escrito,
    precios y negociaciones incluidas, y eso no se puede clasificar ni redactar. **Decisión pendiente de Santiago**:
    si la abre, se saca el `mailGuard`, se suma `/correo` a `COLLABORATOR_SECTIONS` y a `isPathAllowedForCollaborator`.
  - **Los montos que viven dentro de módulos permitidos se borran de la respuesta** con el middleware
    `collaboratorMoneyRedaction` (lista cerrada `COLLABORATOR_HIDDEN_MONEY_KEYS`: `budgetAmount`, `estimatedAmount`,
    `estimatedAmountArs`, `totalAmount`, `totalOpenArs/WonArs/LostArs`, `hourlyRate`, `spendArs`, `revenueArs`, `spend`,
    `revenue`, `cpl`, `roi`, `roas`, `amountArs`, `amountUsd`, `totalArs`, `unmappedAmount` + los genéricos
    financieros; `conversionRate` y `controlRate` NO están, son porcentajes de test A/B, no plata).
    **Si se agrega una clave de plata nueva a una respuesta,
    hay que sumarla a esa lista.** En la UI el espejo es `canSeeMoney(user)` de `client/src/lib/roles.ts` (expuesto por
    `useAuth`), que esconde las tarjetas y columnas de plata, y `MoneyText`, que muestra "—" como red de seguridad.
    En Growth esconde las pestañas **Inversión**, **Inteligencia** e **Importar**.
  - **Lo único que sigue acotado dentro de Trabajo**: carga y anula **horas propias** (`onlyOwn`). Todo lo demás
    (reasignar, mover de proyecto, editar documentación, aplicar plantillas, importar reuniones) está habilitado.
    Editar una plantilla sigue siendo solo de admin (`assertAdmin`). Por chat solo puede confirmar `CREATE_TASK`
    (las demás acciones del bot son financieras).
  - Pantalla Hoy: sombreros `op + com + cli` (sin `fin`) y puede ver el día del equipo (`canTeam: true`).
  (`/api/today` está permitido para TODOS los roles — también accountant y sales — porque la pantalla Hoy es la home de todos;
  el servicio recorta los "sombreros" por rol, ver capítulo 07.)
- **`accountant`** (Contador, 5/9/2026): ve TODO lo financiero/contable pero **solo lectura** (de momento no opera:
  ni cobra, ni paga, ni carga facturas ni asientos) — `accountantApiGuard`. GET permitido en obligaciones,
  movimientos, cajas, facturas, IVA, deudas financieras, recurrentes, acuerdos comerciales, retenciones, analytics,
  cotizaciones, medios de pago, ARCA, transferencias, proyectadas, proveedores, presupuestos, cuenta corriente,
  empresas/contactos, proyectos, categorías/tags/product-services, cuit, audit. Cualquier método que no sea GET, o
  cualquier ruta de CRM/Trabajo/Admin/Chat → 403. UI: "/" queda en Dashboard, sidebar sin CRM/Tareas/Admin.
- **`sales`** (Vendedor): solo CRM (leads, oportunidades, pipeline, config) + catálogos de apoyo (empresas,
  contactos, tags, categorías, product-services, acquisition-sources, cuit) — `salesApiGuard`. Cero acceso a lo
  financiero/contable. Ve (solo lectura) las tareas de Trabajo ligadas a sus oportunidades (`GET /api/work/tasks`,
  `/summary`, `/:id`) para que la tarjeta "Tareas de preventa" de la oportunidad no rompa, pero no gestiona Trabajo
  (crear/editar/comentar/horas → 403). Excepción explícita: `DELETE /api/companies/:id/permanent` (borrado físico)
  bloqueado aunque el resto de `/api/companies` esté permitido. UI: "/" → /crm/leads, sidebar solo CRM + Empresas.

Migración de schema (`ALTER TYPE user_role ADD VALUE 'accountant'`) en `scripts/sql/2026-09-05_rol_contador.sql`.

## Privacidad por titular (29/9/2026) — `server/lib/ownerScope.ts`

El rol dice a qué **módulos** entra alguien; esto dice de qué **cuentas**. Cada usuario tiene sus titulares en
`users.visible_owners` (enum `debt_owner[]`, default `{chimpance}`, migración 0046, se editan en Admin › Usuarios).
Decisión de Santiago: QueVibra y lo personal son suyos; `admin` y el rol `accountant` nacen con los tres, el resto
solo con Chimpancé. Nadie puede otorgar una cuenta que él mismo no ve (chequeo en `users.routes.ts`).

Cómo funciona: `ownerScopeMiddleware` (montado en `routes.ts` antes de los guards de rol) busca los titulares del
usuario —cachecita de 60 s, `clearOwnerScopeCache` al editarlo— y corre el pedido dentro de un `AsyncLocalStorage`.
Los servicios de plata leen ese contexto:

- `ownerCond(col)` / `ownerCondArr(col)` → condición `inArray` para el `where` (obligaciones, cajas, deudas,
  recurrentes, presupuestos, reglas de categoría).
- `cashboxOwnerCondArr(col)` → para lo que cuelga de una caja (movimientos, transferencias).
- `issuerOwnerCondArr(col)` (en `services/iva.ts`) → para lo que va por **entidad emisora** (facturas, libros de IVA):
  Chimpancé → `chimpance`, QueVibra SAS → `vibra`.
- `assertPuedeVerOwner(owner)` / `assertPuedeUsarOwner(owner)` → cortan la escritura con `AUTH_FORBIDDEN_OWNER` (403).
  El motor único de plata (`registrar.service`) los aplica, así que todo lo que carga plata queda cubierto.
- `ownerRedaction` → red de seguridad: borra de la respuesta cualquier ítem con `owner` ajeno (mismo patrón que
  `collaboratorMoneyRedaction`). No reemplaza al filtro en la consulta: los totales se calculan en la base.

**Fuera de un pedido no hay contexto y no se filtra nada**: los jobs (recurrentes, intereses) siguen viendo todo. Los
**avisos push** son la excepción: corren en un job, así que filtran por los titulares de **cada destinatario**
(`avisos.service`). La UI lo espeja con `useAuth().visibleOwners`, `useOwnerOptions()` y `issuersVisibles()`.

**Lo que NO separa**: proyecciones y acuerdos comerciales (no tienen titular en el modelo: cuelgan del proyecto).
Si alguna vez QueVibra carga acuerdos, hay que agregarles la cuenta.

**Al sumar una pantalla o una consulta de plata**: agregarle la condición de titular, igual que hoy hay que sumar las
claves nuevas a `COLLABORATOR_HIDDEN_MONEY_KEYS`. Tests: `tests/ownerScope.test.ts` (13 checks, sin base).

## Plantillas de proyecto (M7, 5/9/2026 — tablas `work_project_templates`, `work_project_template_tasks`)

Una plantilla = lista ordenada de **fases** (tareas modelo: título, descripción, tipo, prioridad, horas estimadas, `dueOffsetDays` =
días desde la fecha de inicio). Al aplicarla sobre un proyecto, cada fase se convierte en una `work_tasks` real con `source='system'`,
`status='todo'`, `startDate` = fecha base, `dueDate` = base + offset, posición al final de la columna. **Se agregan, nunca reemplazan**
(la UI avisa si el proyecto ya tiene tareas). Queda traza en `audit_log`: `project/template_applied` (templateId, templateName,
createdTasks, startDate, assignedToUserId) y `work_task/created` con `details.templateName`; el contador "aplicada N veces" del Admin
sale de ahí. Si se elige responsable, recibe una notificación `task.assigned` agrupada.

- **Seed al boot** (`templateService.seedDefaults`, llamado en `server/index.ts` tras `ensureCanonicalData`): si la tabla está vacía crea
  **Web** (9 fases, 89 h, ~62 días), **Branding** (8 fases, 58 h, ~55 días) y **Marketing** (9 fases, 51 h, ~32 días). Solo corre con tabla
  vacía: si Santiago borra/desactiva todo, no se recrean solas (editarlas en Admin).
- **API** (`/api/work/templates`, en `work.routes.ts`): `GET /` (`?includeInactive=1`) con taskCount/totalHours/maxOffsetDays/timesApplied ·
  `GET /:id` (con `tasks`) · `POST /` y `PATCH /:id` (**solo admin**; si viene `tasks[]` REEMPLAZA la lista completa; `active` para
  desactivar) · `POST /:id/apply` `{projectId, startDate?, assignedToUserId?}` → 201 `{createdTasks, tasks…}`; 422 si la plantilla está
  inactiva o sin fases · `GET /api/work/projects/:projectId/template-applications` (historial). **Collaborator → 403 en todo**
  (assertNotCollaborator); sales/accountant ya quedan afuera por sus guards globales.
- **Crear proyecto desde oportunidad**: `POST /api/crm/opportunities/:id/create-project` acepta `templateId` y `templateAssigneeId`; aplica la
  plantilla dentro de la MISMA transacción que crea el proyecto y mueve las tareas de preventa; devuelve `templateTasks` y `templateName`.
- **UI**: `client/src/components/work/ProjectTemplates.tsx` (TemplatePicker con resumen —oculta plantillas sin fases—, TemplatePhasesPreview
  con las fechas calculadas, ApplyTemplateDialog, CreateProjectFromOpportunityDialog, AppliedTemplatesBadges) y
  `ProjectTemplatesAdmin.tsx` (Admin › pestaña **Plantillas**, solo admin: lista con switch activa, duplicar, editor con tabla de fases
  subir/bajar/quitar). ProyectoDetalle: botón **Aplicar plantilla** en la tarjeta "Tareas del proyecto" (oculto para collaborator) + badges
  "Plantilla Web". CrmOpportunityDetalle: "Crear proyecto" abre el diálogo con selector "Sin plantilla / Web / Branding / Marketing".
- **Cómo probarlo cuando puedas (Santiago)**: Admin › Plantillas → revisar/editar las fases de Web (¿faltan pasos reales de Chimpancé?
  ¿horas realistas?) → Proyectos › un proyecto nuevo › "Aplicar plantilla" → Web, fecha de inicio, responsable → ver las 9 tareas en la lista
  y el Kanban de /tareas con sus vencimientos → CRM › una oportunidad ganada con empresa › "Crear proyecto" eligiendo Branding.
- Test de API reproducible: `scratchpad/test_m7.py` de la sesión del 5/9 (30 checks; necesita una oportunidad sin proyecto, `OPP_ID=`).

## Documentación del proyecto (8/9/2026 — tablas `project_docs`, `project_doc_versions`)

Páginas de texto propias de cada proyecto, tipo Notion: el **brief**, el alcance, minutas de reunión, notas. Viven en la tarjeta
**Documentación** de `/proyectos/:id`, arriba de "Entregables y revisión del cliente".

- **Tablas**: `project_docs` (projectId, title, icon = emoji, `kind` enum `project_doc_kind` = brief · scope · minutes · note,
  `content_html`, `content_text` = texto plano derivado para preview/búsqueda, position, created/updatedByUserId, `deleted_at` =
  soft delete) y `project_doc_versions` (foto del documento ANTES de un cambio: docId, title, contentHtml, editedByUserId).
  Enum + tablas en `migrations/0005_documentacion_proyecto.sql` y `scripts/sql/2026-09-08_documentacion_proyecto.sql`.
- **Editor**: TipTap 3 (`@tiptap/react`, `starter-kit`, `extensions` para el placeholder, `extension-list` para las checklists) en
  `client/src/components/work/docs/RichTextEditor.tsx`. Guarda HTML acotado al esquema del editor; ese HTML **nunca** se renderiza con
  innerHTML (siempre vuelve a pasar por el editor), así que no puede inyectar nada. Estilos: bloque `.doc-editor` al final de `index.css`.
- **Gotcha resuelto (importante si se reusa el editor)**: TipTap dispara `onUpdate` al montarse y al reemplazar contenido. Con el
  autoguardado atado a ese evento, abrir un documento **guardaba una versión vacía encima**. La solución que quedó: el editor recuerda
  en un ref lo que "ya aplicó" y solo avisa cuando el HTML cambia de verdad; la tarjeta además monta el editor recién cuando el
  documento está cargado (`loadedId === doc.id`, `key={doc.id}`) e ignora los guardados iguales a lo último que devolvió el server.
- **Autoguardado**: debounce de 1,2 s, se fuerza al cambiar de documento o desmontar; indicador Guardando / Guardado / Sin guardar.
  Al `audit_log` van los cambios de cabecera (crear, renombrar, cambiar ícono/tipo, borrar, restaurar), no cada tecleo.
- **Historial**: se guarda una copia previa como mucho **cada 10 minutos por autor** (y siempre que cambia el autor). "Restaurar"
  guarda antes el estado actual, así que no se pierde nada. Se listan las últimas 30.
- **API** (en `work.routes.ts`, servicio `server/domains/work/docs/projectDoc.service.ts`):
  `GET /api/work/doc-templates` (menú de plantillas) · `GET|POST /api/work/projects/:projectId/docs` · `POST …/docs/reorder` ·
  `GET|PATCH|DELETE /api/work/docs/:id` · `POST /api/work/docs/:id/duplicate` · `GET /api/work/docs/:id/versions[/:versionId]` ·
  `POST /api/work/docs/:id/versions/:versionId/restore`.
- **Plantillas de documento** (`docs/docTemplates.ts`, HTML fijo en español): **Brief del proyecto** (qué necesita el cliente,
  objetivo, punto de partida, público, alcance entra/no entra, entregables, hitos, insumos del cliente, quién decide, referencias,
  riesgos), **Alcance y entregables**, **Minuta de reunión** y **En blanco**.
- **Permisos**: collaborator **lee** solo la documentación de proyectos donde tiene tareas (asignadas o creadas por él) y **no puede
  editar** (403); admin/operador editan. Sales y accountant no llegan a `/api/work` por sus guards globales.

## Feedback del cliente (tablas `work_deliverables`, `work_review_links`, `work_feedback`, `work_feedback_task_links`, `work_ai_overrides`)

Principios: el feedback es INMUTABLE (lo que dijo el cliente); la tarea es cómo Chimpancé lo trabaja (N↔N vía
`work_feedback_task_links`, tareas con `source='feedback'`). Flujo: Proyecto → entregables + enlace mágico (token
base64url de 24 bytes, vencimiento opcional) → el cliente entra a `/review/:token` sin cuenta (página fuera del shell
autenticado, `ReviewPublic.tsx`), ve el entregable y comenta (nombre, dónde, mensaje, imagen ≤5 MB guardada en
`uploads/feedback/`, gitignoreada) → `feedbackAi.classify` corre asíncrono (intención, categoría, título sugerido,
prioridad, confianza, duplicado probable entre los abiertos del proyecto) sin bloquear nunca la recepción → Inbox
`/feedback` (`FeedbackInbox.tsx`): Crear tarea prellenada / Vincular / Responder / Descartar (con o sin mensaje al
cliente) / Reabrir / Reclasificar. `clientStatus` derivado para el cliente: recibido · en_curso · resuelto (todas las
tareas vinculadas done) · respondido · no_se_hara. Tarjeta "Entregables y revisión del cliente" en ProyectoDetalle.
**Fase 3b (4/9/2026, commit e240ded):**
- **SDK sobre la web real**: `client/public/review-sdk.js` (vanilla, Shadow DOM, sin deps) se incluye en el sitio del cliente
  con `<script src="ERP/review-sdk.js" data-token="TOKEN" defer>`; modo "Comentar" resalta el elemento, el pin se ancla por
  selector + texto + posición relativa (re-anclaje por selector → por texto → "no encontrado en esta versión"), popover con
  estado/respuesta, lista de pins, `#chimp-feedback=ID` abre uno. Demo local: `/review-demo.html?token=TOKEN`.
  API pública con CORS `*`: `POST /feedback` acepta JSON con `anchor` (jsonb ≤ 8 KB), `GET /pins?url=` (match por
  origin+pathname), `POST /approve`. Snippet de instalación en la tarjeta del proyecto (ícono `</>` del enlace).
- **Rondas de revisión** (`work_review_rounds`, `round.service.ts`): una abierta por scope (entregable o proyecto), número
  correlativo, abrir una nueva cierra la anterior (salvo aprobada), el feedback nuevo cae en la ronda abierta (si no hay,
  se abre la N+1 sola), aprobación desde el enlace del cliente o cargada a mano; `versionLabel` actualiza
  `work_deliverables.version`. UI: `RoundsSection` en DeliverablesCard, cabecera + "Aprobar esta versión" en ReviewPublic,
  filtro por ronda y badge "R2 · v1.8" en el inbox.
- **Notificaciones internas** (`work_notifications`, `server/domains/notifications`, `/api/notifications`, campana real en
  Layout con polling 30 s): `feedback.new`, `round.approved`, `task.assigned`, `task.comment`, `feedback.resolved`
  (cuando no queda ninguna tarea abierta del feedback). Dedup 60 s. Los collaborator reciben las de tareas.
  Links: `/feedback?id=N`, `/proyectos/N`, `/tareas?task=N` (TaskWorkspace lo abre).
- **Avisos al cliente** (`work_client_notices`, `notice.service.ts`): sin SMTP, el sistema arma el texto y la persona lo
  manda: `GET /review-links/:id/pending-notice` (novedades desde el último aviso: respondido/en curso/resuelto/aprobado),
  `whatsappUrl` (wa.me con `contactPhone`) / `mailtoUrl`, `POST /notices` deja traza; badge "N novedades sin avisar".
**Fase 3c (4/9/2026, commit 887d54e):**
- **Revisor sin login** (`work_reviewers`, `reviewer.service.ts`): el navegador genera una clave uuid (`chimp_reviewer_key`) y
  pide el nombre UNA vez; toda llamada pública manda `X-Reviewer-Key`. Varios empleados del cliente = varias claves.
  `mine`/`canEdit` en cada feedback público, `GET /:token/mine` (todas las páginas), `GET /api/feedback/reviewers?projectId=`
  ("Quién revisó" en DeliverablesCard). La clave es global por navegador: si entra a otro enlace, la fila se muda de proyecto.
- **Editar/borrar propios** (`PATCH`/`DELETE /:token/feedback/:id`): solo con la clave del autor y solo mientras status `new`
  sin tareas ni respuesta del equipo (422 `VALIDATION_FEEDBACK_LOCKED`); ediciones a `edit_history`, borrado lógico
  (`deleted_at`) visible en el inbox con filtro `status=deleted`, excluido de contadores/stats/IA.
- **Hilo por comentario** (`work_feedback_messages`, `thread.service.ts`): cliente `POST /:token/feedback/:id/replies`,
  equipo `POST /api/feedback/:id/replies`; `answer` y `dismiss` con mensaje también dejan mensaje team. Notificación
  `feedback.reply`, `hasUnreadClientReply` + `POST /api/feedback/:id/seen`, filtro `unreadReplies=1`.
  **Línea de tiempo** derivada de audit_log (feedback + tareas vinculadas) + mensajes + ronda (`timelinesFor`).
- **Adjuntos múltiples** (`work_feedback_attachments`, `attachment.service.ts`): hasta 4 por envío / 12 por feedback en
  `attachments[]` multipart con `attachmentKinds`/`attachmentMeta`; imagen ≤ 5 MB, captura (PNG con marcado hecho en el
  navegador), video webm/mp4 ≤ 25 MB y ≤ 90 s, audio ≤ 10 MB transcripto en background con `transcribeAudio` del bot
  (mensaje vacío permitido solo con audio; el transcript completa `message` y recién ahí corre la IA). Firma real por magic
  bytes; descarga con `Range` (`sendFile`), balde de rate-limit aparte (300/10 min) para adjuntos. En el droplet los
  archivos viven en `uploads/feedback/` del servidor.
- **SDK v1.1** (`review-sdk.js`, ~1.000 líneas): nombre una vez, Capturar (getDisplayMedia + editor de marcado en canvas:
  rectángulo, flecha, lápiz, texto), Grabar pantalla (MediaRecorder, tope 90 s), Voz, pestañas "En esta página" /
  "Mis comentarios", puntito de respuestas nuevas. `navigator.mediaDevices` exige HTTPS o localhost: en http plano los
  botones de captura/voz se ocultan solos.
- **Adopción por nombre** (5/9/2026): `POST /:token/reviewer` registra la clave del navegador; `reviewerService.adoptOrphans`
  asigna al revisor los feedbacks del proyecto sin `reviewer_id` cuyo `author_name` coincide (case-insensitive). El SDK y
  la página lo llaman al cargar si hay nombre guardado y el server no conoce la clave. Los propios en "recibido" muestran
  Editar/Borrar también en la lista del widget. OJO al probar por API: una clave de prueba con el mismo nombre se queda
  con los huérfanos (pasó con el comentario "Santi" de Santiago; se reasignó a mano).
**M3 · Overrides de la IA + métricas (5/9/2026):**
- **`work_ai_overrides`** (`override.service.ts`): una fila por decisión de triage (`action` = converted | linked | answered | dismissed)
  sobre un feedback que la IA había clasificado (sin `aiIntent` no se registra nada). Guarda el snapshot de la IA (`ai_intent`, `ai_category`,
  `ai_priority`, `ai_title`, `ai_confidence`, `ai_duplicate_of_id`) y lo que quedó (`final_title/category/priority` = la tarea creada o
  vinculada; en responder/descartar van null), más las comparaciones ya resueltas: `title_changed` (títulos normalizados: minúsculas,
  espacios, puntuación final), `category_changed`, `priority_changed`, `intent_matched` (acción esperada por intención: change/bug/idea/
  preference → tarea; question → responder; approval → responder o descartar; duplicate → vincular o descartar; ambiguous → sin
  expectativa, null) y `accepted_all` (nada cambió y la intención coincidió). Se llama al final de `convertToTask`, `linkToTask`, `dismiss`
  y `answer` (esta última SOLO si el feedback estaba pendiente: responder algo ya convertido no es triage). Nunca bloquea: error → log.
- **`GET /api/feedback/metrics?projectId=&days=30|90|365`** (`metrics.service.ts`, SQL crudo con `db.execute`, sin `days` = todo):
  `volume` (total, clasificados %, pendientes y pendientes > 48 h, por estado, decididos sin IA), `timing` (mediana y promedio en horas:
  primera acción = `triaged_at − created_at`; feedback → tarea = primer `work_feedback_task_links.created_at`; resueltos = feedback con
  tareas todas done/canceled y su tiempo), `ai` (decisiones, aceptado sin cambios %, título/categoría/prioridad mantenidos %, intención
  acertada %, confianza media cuando acierta vs. cuando la corrigen, por acción, top 5 correcciones de categoría IA → humano, duplicados
  detectados y confirmados = descartado o vinculado a la misma tarea que el original), `rounds` (total, aprobadas, proyectos, promedio por
  proyecto, mediana hasta aprobación = `approved_at − opened_at`, detalle por proyecto). Los tiempos se recortan a ≥ 0 (filas anteriores al
  fix de zona horaria).
- **UI**: botón **Métricas** (ícono barras) en la cabecera de `/feedback` abre/cierra `FeedbackMetricsPanel` (recordado en `localStorage`
  `chimp_feedback_metrics_open`); respeta el proyecto filtrado en el inbox y tiene selector de período (30/90/365/todo). Tres bloques:
  Equipo · IA · Rondas. Estado vacío explica que se arma con el uso. Formato argentino (`1,5 h`, `3,3 por proyecto`, `2 días`).
- **Cómo probarlo cuando puedas (Santiago)**: /feedback → botón "Métricas" → mirar los tres bloques con "Todo el historial" → tomar un
  feedback pendiente clasificado → "Crear tarea" cambiando la categoría → volver a Métricas: "Aceptado sin cambios" baja y aparece la
  corrección en "Categorías que más corrigen". Test de API reproducible: `python scripts/tests/test_m3_api.py 2` contra el local (:5001)
  (24 checks; crea 6 feedbacks y 2 tareas de prueba en el proyecto indicado).
- ~~Para M4~~: hecho (ver M4 abajo): `ai_assignee_user_id` / `final_assignee_user_id` / `assignee_changed` en la misma tabla.
**M5 · Contexto técnico automático del SDK (5/9/2026, commit e84fbc0):**
- **SDK v2.1** (`review-sdk.js`): apenas carga instala captura de errores (`window 'error'` en fase de captura → errores JS con
  `archivo:línea:col` y recursos `<img>/<script>/<link>` que no cargan, `unhandledrejection`, y envuelve `console.error`); anillo de los
  últimos 10 (`MAX_TECH_ERRORS`, mensajes ≤ 240) ignorando los avisos propios `[chimp-review]`. Solo ve lo que pasa DESPUÉS de cargar
  (el script es `defer`): los errores de arranque del sitio no llegan. `withTech(anchor)` se llama en `sendComment` → `anchor.tech` =
  `{ v, sdk, url (exacta, con query+hash), referrer, browser, browserVersion (userAgentData si existe, si no regex de UA: Edge/Opera/
  Samsung/Firefox/Chrome iOS/Chrome/Safari), os, osVersion (Windows NT 10.0 → "10/11"; iPadOS se detecta por MacIntel+touch), mobile,
  touch, lang, languages (≤5), tz, screen, viewport, dpr, online, ua (300), errors[], at }`. Solo el SDK lo manda; la página `/review/:token`
  no (no tiene errores del sitio que reportar).
- **Server** (`feedback.service.ts`): `parseAnchor` separa `tech`, aplica el tope de 8 KB al RESTO del anchor (regla vieja intacta) y pasa
  `tech` por `sanitizeTech` (tipos estrictos, strings recortados, ≤ `TECH_MAX_ERRORS`=10 errores de ≤ `TECH_MAX_ERROR_MSG`=300, `src` 200,
  `kind` ∈ error|console|promise|resource o cae en "error", fechas inválidas → null, `dpr`/`mobile` inválidos → null; se queda con los
  ÚLTIMOS 10 válidos). Nunca lanza: tech basura se descarta y el comentario entra igual. `publicAnchor()` quita `tech` en TODO lo que ve el
  cliente (publicShape → `GET /:token`, `/mine`, respuesta del `POST`; `pinsFor` → `/pins`). El inbox y `GET /api/feedback/:id` lo traen entero.
- **Inbox** (`FeedbackInbox.tsx`, componente `TechContext` dentro del bloque "Dónde"): línea resumen (`techSummary`: "Chrome 128 · Windows
  10/11 · celular|táctil · es-AR · 1920×1080 @1,5× · ventana 1440×900 · scroll x,y · sin conexión al enviar", tooltip = UA completo), "URL
  exacta" solo cuando tiene query o hash (si no, ya está en "Página"), botón "N errores de consola" (ámbar, plegable; "Sin errores de consola
  desde que cargó el widget" en verde) con lista hora 24 h · badge tipo (JS/console/promesa/recurso) · mensaje · archivo:línea. Los anchors
  viejos sin `tech` siguen mostrando la línea "Viewport …". `techForTask()` agrega "Contexto técnico + URL + hasta 5 errores" a la
  descripción de la tarea prellenada ("Crear tarea").
- **Demo**: `/review-demo.html?token=…` tiene el botón **"Provocar error de prueba"** en el footer (console.error + `<img>` 404 + throw).
- **Cómo probarlo cuando puedas (Santiago)**: abrir la demo con un token del local (:5001) → "Provocar error de prueba" → "Dejar comentario"
  sobre cualquier elemento → enviar → en `/feedback` el comentario muestra bajo "Dónde" tu navegador/pantalla, la URL exacta y "3 errores
  de consola" desplegables; "Crear tarea" trae el mismo contexto en la descripción. Tests reproducibles contra el local (:5001):
  `python scripts/tests/test_m5_api.py` (26 checks, usa el último enlace activo) y `python scripts/tests/test_m5_e2e.py [TOKEN]`
  (Playwright, 19 checks, capturas en `scripts/tests/out/`). Correr con `PYTHONIOENCODING=utf-8` en Windows.
- **Para M6** (marcado sobre la página): usa el mismo `anchor` (agregar `marks[]` al lado de `tech`) y el mismo `publicAnchor` decide qué ve el cliente.
**M4 · Responsable sugerido + pregunta cuando es ambiguo (5/9/2026, commit 93fd4dd):**
- **IA** (`feedbackAi.ts`): `ClassifyContext.team` = `buildTeamContext(projectId)` (feedback.service): usuarios activos salvo `accountant`/
  `read_only`, con `byCategory` (tareas asignadas por tipo, todos los proyectos, sin canceladas), `inProject` y `openTasks`. El prompt pide
  `suggestedAssigneeId` (por afinidad con la categoría, prioriza quien ya trabajó en el proyecto y menos carga), `assigneeReasoning` y
  `suggestedQuestion`. Validación: el id tiene que existir en el equipo; si no, `suggestAssigneeByHistory(category, team)` (más tareas de esa
  categoría → más en el proyecto → menos abiertas; nadie con historial → null). Sin responsable para `approval`/`duplicate`. La pregunta solo
  queda si `intent === "ambiguous"` o `confidence < LOW_CONFIDENCE (60)`; si es ambiguo y la IA no redactó, `DEFAULT_AMBIGUOUS_QUESTION`.
- **Schema**: `work_feedback.ai_suggested_assignee_id` (FK users), `ai_suggested_question`, `ai_question_sent_at`; `work_ai_overrides.
  ai_assignee_user_id`, `final_assignee_user_id`, `assignee_changed` (solo convertir/vincular y solo si la IA sugirió; `accepted_all` lo
  incluye; `linkToTask` ahora lee el assignee de la tarea). `aiJson` guarda `suggestedAssigneeId`, `assigneeReasoning`, `suggestedQuestion`.
  El select del inbox/detalle trae `aiSuggestedAssigneeName` (alias `fb_suggested_assignee`). Lo público (`shapePublicFeedback`/`publicColumns`)
  no expone nada de esto.
- **`POST /api/feedback/:id/ask` `{ text? }`** (`feedbackService.askClient`): usa `text` o la sugerida (422 si no hay ninguna; 404 si no existe;
  422 si el cliente lo borró) → `threadService.addTeamMessage(source: "ai_question")` → `aiQuestionSentAt = now`, `new → triaged` con
  `triagedAt` (es la primera acción del equipo, cuenta en `timing.toFirstAction`), sin tocar otros estados; audit `question_sent {messageId,
  text, fromAi, edited}`; timeline interno "Pregunta (sugerida por la IA) enviada al cliente" (tipo `question_sent`, punto ámbar; el cliente
  solo ve el mensaje del hilo). Se puede volver a preguntar las veces que haga falta.
- **Métricas**: `ai.assignee { suggested, n, kept, keptPct }` y `ai.questions { suggested, sent, sentPct, replied (last_client_reply_at >
  ai_question_sent_at), repliedPct, medianHoursToReply }`; tiles **Responsable** y **Preguntas** en el bloque IA del panel.
- **Inbox** (`FeedbackInbox.tsx`): "Responsable sugerido" (+ motivo) en el bloque IA; tarjeta ámbar `card-ai-question` ("No queda claro qué
  pide el cliente" / "La IA no está segura…") con textarea editable, **Enviar pregunta al hilo** → después "Pregunta enviada DD/MM HH:mm" +
  **Volver a preguntar**, botón "Volver a la sugerida" al editar; badges de lista `Pedir aclaración` (ámbar) / `Pregunta enviada`; "Crear
  tarea" preselecciona al sugerido (" · sugerido" en el select + hint "Sugerido por la IA"). Labels `question_sent` en `feedbackMeta.ts`.
- **Cómo probarlo cuando puedas (Santiago)**: cargá un feedback vago ("esto está raro") por "Cargar feedback" → en unos segundos aparece la
  tarjeta ámbar con la pregunta; editala si querés y "Enviar pregunta al hilo" → el cliente la ve en su enlace y vos en el hilo/línea de
  tiempo. Cargá uno claro de diseño → el bloque IA muestra "Responsable sugerido" (quien más tareas de diseño tomó) y "Crear tarea" ya lo
  trae elegido; si lo cambiás, en Métricas › IA baja "Responsable". Tests reproducibles contra el local (:5001) (con `PYTHONIOENCODING=utf-8`):
  `python scripts/tests/test_m4_api.py 2` (33 checks; siembra 2 tareas de diseño al colaborador y crea 6 feedbacks + 3 tareas en el proyecto)
  y `python scripts/tests/test_m4_e2e.py 2` (Playwright, 19 checks, capturas `m4_*.png` en `scripts/tests/out/`).
- **Para M6**: nada de M4 lo condiciona; la pregunta y el responsable siguen apareciendo igual para feedbacks con marcas.
Pendiente: extensión de navegador para sitios que no incluyen el script, comparación antes/después por versión, marcador
"visto" por revisor en el schema (hoy `unreadTeamReplies` se calcula contra el último mensaje propio).

**Rediseño UX/UI de las superficies del cliente (4/9/2026, commits 3fe8ae2 + el del SDK v2.0)** tras el feedback de Santiago
("poco accesible, intuitivo y legible"). Decisiones de diseño cerradas con él:
- **Widget del sitio (`review-sdk.js` v2.0)**: NEUTRO CLARO con acento Chimpancé (blanco / `#F4F4F2` / texto `#111` /
  secundario `#5C5C5C` / borde `#E4E4E1`; lima `#D9F45F` SOLO sobre negro), tipografía del sistema (no cargar fuentes en
  sitios ajenos), base 15 px / mínimo 13, botón flotante "Dejar comentario" + "Comentarios (N)", hilo y "Responder" siempre
  visibles, "Historial" como botón, diálogos accesibles (pila de foco, Esc por capas, aria), celular = hojas inferiores.
  Smoke test: `scratchpad/sdk_ui_smoke.py` (Playwright, API mockeada, mide tamaños/contrastes).
- **Página de revisión (`/review/:token`)**: DARK CHIMPANCÉ (`#0A0A0A` / `#121310` / `#1C1D1A`, texto `#F5F5F3`, lima como
  botón primario con texto negro, Plus Jakarta Sans), base 16 px / mínimo 13, componentes propios en
  `client/src/components/review/` (tokens.ts define la paleta y los estados). `MediaCaptureBar` acepta `variant="review"`.
- Regla para lo que ve el cliente: contraste AA, botones con ícono + texto (nunca links grises), acciones primarias
  visibles sin desplegables, áreas ≥ 44 px, microcopy corto en rioplatense. El inbox interno NO se tocó (lo restylea la
  sesión de DS Digitaal).
