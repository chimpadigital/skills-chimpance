# 04 · Roadmap y decisiones

## Documentos relacionados

- Reporte de la sesión fundacional (11/08/2026, artifact de Santiago): https://claude.ai/code/artifact/b74f8d8c-098a-4a20-814b-bfe1c4cbd11e
- Documentos históricos dentro del repo: `replit.md` y `STACK_TECNOLOGICO.md` (escritos por el agente de Replit, describen el sistema hasta abr 2026). **Son historia, no fuente de verdad**: la fuente de verdad es este skill + el código. Replit no participa del proyecto desde la des-replitización.

## Estado actual (línea base 11/08/2026)

- Etapa (desde el 8/9/2026): **producción viva en la nube**. **Desde el 12/9/2026 no hay ambiente local**: todo cambio va primero a dev-finanzas, se prueba ahí, y lo aprobado por Santiago se migra a producción. Lo que sigue de este párrafo es historia: Ya no hay ambiente local con datos reales: el `:5000` (`erp-real` / `chimpance_erp`) se dio de baja y el local pasó a ser `erp-local` :5001 sobre `chimpance_local` (descartable, creada desde `migrations/`). Ver SKILL.md › Los tres ambientes y capítulo 01.
- Commits propios: `f3fb12c` (Titular + Mi Deuda Total + chat deudas/por-cobrar, PUSHEADO) y `d97c26e` (des-replitización + seguridad para nube, local).
- **HECHO por el CTO (1/9/2026): producción vive en el droplet de Chimpancé con CI/CD por GitHub Actions** — `main` → https://finanzas.chimpance.digital (producción), `dev` → https://dev-finanzas.chimpance.digital (pruebas en la nube). Migraciones versionadas de Drizzle (`migrations/`, baseline `0000` del CTO). Detalle operativo en el capítulo 01 › Nube.
- **7/9/2026: primer push del trabajo local a `dev`** (44 commits: Módulo Trabajo completo, Growth OS, Cuentas multi-entidad, Medios de Pago, DS Chimpa) + merge de los 5 commits del CTO + migración `0001_modulo_trabajo_growth_cuentas` (generada con drizzle-kit y corregida a mano para bases con datos). Deploy en dev OK (migró, reinició, health check). **Pendiente: push a `main` (producción) cuando Santiago dé el OK**, y confirmar con el CTO que el `.env` de ambos servidores tenga `OPENAI_API_KEY` (sin ella el server no arranca) y `PUBLIC_BASE_URL` (para los enlaces públicos de revisión y el snippet de Growth; hay fallback al host de la request).
- Historia previa: construido por Replit Agent hasta abr 2026; repo conectado a GitHub y clonado el 11/08/2026.
- Datos reales: recién arrancando (Santiago tiene que crear sus cajas y empezar a cargar).

## Features ya construidas por nosotros (no re-proponer)

- Campo **Titular** (santiago/chimpance) en obligaciones y deudas + selectores + badges.
- **Mi Deuda Total** en Dashboard (`/api/analytics/debt-summary`).
- Chat: **CREATE_AR_OBLIGATION** y **CREATE_FINANCIAL_DEBT** (cuotas automáticas), deducción de titular, fecha de hoy, occurredAt=vencimiento, creación directa sin preguntas.
- **Pantalla Hoy (7/9/2026, commit 9d80044):** home `/` para todos los roles (Dashboard financiero → `/finanzas`): lista única de prioridades cruzando tareas, seguimientos de leads, cobros/pagos y feedback con orden automático explicable; agenda del día con Google Calendar por dirección iCal (solo lectura, sync 15 min, vínculo por nombre a proyecto/empresa/oportunidad), reuniones con hora y llamadas del CRM; bloques plegados por sombrero según rol con preferencias por usuario; tarea rápida vía Agente (que ahora entiende la hora); fijar arriba / pasar a mañana. Decisiones de Santiago: home = Hoy, Google Calendar vinculado (OAuth para crear eventos queda para fase 2), "las mías" por defecto, completo-pero-simple para él y reducido para el CTO. Detalle en el capítulo 07 › "Pantalla Hoy".

- **Módulo Trabajo – Fase 1 (3/9/2026, commits locales 68dc444 + chat):** tareas ligadas a proyectos del ERP y/o a oportunidades del CRM (preventa), subtareas de un nivel, comentarios, registro de horas (schema listo para costo), Kanban drag&drop + Lista + "Mis tareas" + filtros, página `/tareas` (sidebar › Principal), tarjeta "Tareas del proyecto" en ProyectoDetalle y "Tareas de preventa" en CrmOpportunityDetalle, botón **Crear proyecto** en la oportunidad (crea el proyecto y arrastra las tareas). Documento fundacional: `docs/modulo-trabajo/investigacion-feedback-to-execution.md` (deep research 1/9/2026, ya sin contexto del ERP: lo que dice de "no hacer CRM/facturación" no aplica porque el ERP ya lo tiene) + `investigacion-growth-sales-os.md`.

## Módulo Trabajo — fases pendientes (decididas 3/9/2026 con Santiago)

Santiago confirmó: el módulo vive **dentro del ERP** (no producto aparte), se construye **acá, no en Replit**. Habrá **colaboradores con distintos roles** que carguen sus horas (no prioritario todavía; el schema ya lo soporta: `work_time_entries.userId` + `users.role`).

1. ~~Fase 1: tareas + proyectos + horas básicas~~ ✅.
2. **Fase 2a – Colaboradores** ✅ (4/9/2026, commit 4a9e705): rol `collaborator` + gestión de usuarios en Admin + guard global de API + scoping en work + chat solo tareas. Ver capítulo 00 "Roles".
   **Rehecho el 12/9/2026**: el colaborador pasó de "solo sus tareas" a "todo menos la plata" — guard invertido a lista
   negra, redacción de montos en las respuestas, y se eliminó el scoping por visibilidad en tareas y documentación.
   Ver capítulo 00 "Roles" y `tests/roleGuard.test.ts`.
   En **producción** desde el 12/9/2026 (pase `e2b0894`), junto con los arreglos del login (usuario sin distinguir
   mayúsculas ni espacios, ojito para ver la contraseña). Santiago lo dio por cerrado el 14/9/2026.
   **Decisión pendiente de Santiago — bandeja de Correo para el colaborador:** hoy está CERRADA (`mailGuard` en
   `server/domains/work/email/email.routes.ts` + redirect de `/correo` en `App.tsx`), porque el correo crudo trae lo
   que el cliente escriba, precios incluidos, y no se puede clasificar ni redactar. Si decide abrirla: sacar el
   `mailGuard`, sumar `/correo` a `COLLABORATOR_SECTIONS` y a `isPathAllowedForCollaborator`, y ajustar el test
   "la bandeja de correo sigue cerrada al colaborador" de `tests/roleGuard.test.ts`.
   **Fase 2b – Tiempo y costo (PENDIENTE):** costo por hora por usuario con vigencia (tabla nueva `work_user_rates` o similar), costo real por tarea/proyecto, Rentabilidad con margen real (ingresos netos − horas × costo − gastos AP), alertas horas > estimado. Santiago dijo que las horas no son prioridad todavía.
3. **Fase 3 – Feedback del cliente, primer corte** ✅ (4/9/2026, commit e19a4bc): entregables + enlace mágico + página pública + IA de clasificación + Inbox con Crear/Vincular/Responder/Descartar. Ver capítulo 00 "Feedback".
   **Fase 3b** ✅ (4/9/2026, commit e240ded, dos subagentes backend/frontend en paralelo): SDK sobre la web real con pin anclado al elemento + demo local, rondas de aprobación con versiones, notificaciones internas (campana), avisos al cliente por WhatsApp/email con traza. Ver capítulo 00 "Feedback › Fase 3b".
   **Fase 3c** ✅ (4/9/2026, commit 887d54e, dos subagentes backend/frontend): revisores sin login (nombre una vez, varios por empresa), editar/borrar propios mientras "recibido", hilo cliente ↔ equipo + línea de tiempo (estilo Figma), captura con marcado, video de pantalla y nota de voz transcripta, guardados en el servidor. Ver capítulo 00 "Feedback › Fase 3c".
   **Pendiente después:** extensión de navegador para sitios sin el script, comparación antes/después por versión, email automático cuando haya SMTP (hoy el aviso lo manda una persona con el texto armado), marcador "visto" por revisor.
   **Para usarlo con un cliente real hace falta el ERP público** (droplet): el script del sitio y la página de revisión le pegan a la API del ERP; con el ERP en localhost solo funciona la demo local. Desde el 8/9/2026 esto está resuelto sin túneles: el piloto va contra **dev-finanzas** (o producción), que ya son públicas con HTTPS.
4. **Fase 4 – Agentic:** agentes que implementan tareas de bajo riesgo con revisión humana. Recién con historial real.
5. ~~Chat crea tareas~~ ✅ (3/9/2026, segundo commit): acción `CREATE_TASK`, tools `createTaskDraft`/`patchTaskDraft`/`listUsers`, `TaskDraftCard` en BotChat. Ver capítulo 02.

## Módulo Cuentas / Multi-entidad (decidido 4/9/2026 con Santiago)

Santiago plantea 3 "grandes cuentas" a gestionar en el ERP: **Santi** (personal), **Chimpancé**, **QueVibra** (SAS con las mismas condiciones fiscales que Chimpancé: factura A/B, IVA). De ahí salieron 7 conflictos reales, resueltos así:

1. **Gastos sin proyecto puntual** → crear un proyecto "Overhead" por cuenta (hoy solo existe el de Chimpancé); la UI lo auto-selecciona cuando se elige la cuenta sin picar proyecto. No es cambio de schema.
2. **Medios de pago por cuenta** → agregar `owner` a `cashboxes` (hoy no tiene dueño; `payment_methods` es solo una etiqueta genérica sin caja asociada).
3. **Pagos cruzados** (ej: Santi paga con su Visa un gasto de Chimpancé) → **decisión: cuenta corriente simple** entre titulares (saldo acumulado, sin interés/cuotas, se liquida con una transferencia cuando se quiera) — NO usar `financial_debts`/partner_loan (eso queda para préstamos reales, no para este uso diario).
4. **QueVibra como entidad facturante** → **decisión: solo Chimpancé y QueVibra facturan** (las dos SAS con CUIT propio); Santiago (persona física) NO emite comprobantes por el ERP.
5. **Libro de IVA único** (hallazgo, no estaba contemplado) → `iva_periods.period` es hoy una clave global sin distinguir empresa (confirmado en código: `iva.ts` y `invoices.ts` filtran todo por `period` a secas). Si QueVibra factura, su IVA se mezclaría con el de Chimpancé. **Decisión: separar por entidad emisora** — agregar `issuerCompanyId` a `invoices`/`iva_entries`/`iva_periods` (period pasa a clave compuesta issuer+mes) y dar de alta "QueVibra SAS" como empresa interna. Migrar facturas existentes de Chimpancé sin romper el histórico real.
6. **Ganancia/pérdida por cuenta** → falta un "estado de resultado" simple (ingresos AR cobrados − egresos AP pagados) por owner y mes; ya existe el lado deuda (`debt-summary`). Sin cambio de schema.
7. **Rentabilidad por fuente/referido/LTV** → ✅ 15/9/2026 (en dev): quién refiere (persona o empresa del catálogo, creable desde el campo) + valor generado por referidor en la ficha de empresa y en Rentabilidad (cap. 00 › Referidores). Original:  la base ya existe: `crm_leads.acquisitionSourceId` + `referralContactId/referralCompanyId/referralNameText` + `crm_opportunities.leadId` + `projects.opportunityId` conectan lead→oportunidad→proyecto. Falta el reporte que cruce esa cadena con ingresos reales. Sin cambio de schema.
8. **Retenciones al facturar A/B** (hallazgo, gap real de plata) → ya existe una base parcial: al cobrar se pueden cargar "gastos asociados" tipo `tax_withholding` (`obligations.ts` función pay/receive) que reducen el efectivo cobrado SIN reducir lo que se da por saldado de la obligación (tratamiento contable correcto). Pero: (a) no guarda tipo de impuesto (Ganancias/IIBB/IVA/SUSS) ni nº de certificado ni agente retenedor, y (b) más grave, el cierre de IVA (`iva.ts` `closePeriod`) calcula `débito − crédito` de facturas SIN restar las retenciones de IVA sufridas — riesgo de pagarle de más a ARCA. **Decisión: tabla nueva `withholdings`** + que el cierre de IVA descuente las de tipo IVA.

**Plan de implementación en 4 fases** — construidas EN PARALELO (5/9/2026, 3 subagentes con archivos exclusivos + integración serial de la sesión principal, ver capítulo 05) y verificadas end-to-end en `chimpance_pruebas` (API + browser). `npx tsc --noEmit` se mantuvo en la línea base de 29 errores durante todo el proceso. **Aplicado a `chimpance_erp` el 6/9/2026** (junto con Growth OS, backup previo `chimpance_erp_2026-09-06_pre-migraciones.dump`, ver capítulo 00) — `erp-real` reiniciado y verificado.

- **Fase 1 — Base de cuentas** ✅: Titular a 3 valores (santiago/chimpance/vibra), `cashboxes.owner` (con selector en Cajas.tsx), 3 proyectos Overhead (uno por cuenta, cada uno con su propia empresa interna), cuenta corriente entre titulares (`inter_owner_ledger_entries`, detección automática de pago cruzado dentro de la transacción de pago/cobro en `obligations.ts`, página `/cuenta-corriente` con botón Liquidar), módulo Presupuestos (`budgets`, página `/presupuestos` con presupuestado vs. real por cuenta y mes). `client/src/lib/ownerMeta.ts` centraliza labels/colores de titular (Santiago ámbar, Chimpancé neutro, QueVibra celeste `#739DCA`) y reemplazó los `Record` duplicados de cada página.
- **Fase 2 — Facturación multi-entidad** ✅: `issuerCompanyId` en invoices/iva_entries/iva_periods (period pasa a clave compuesta issuer+mes), empresa interna "QueVibra SAS" dada de alta, selector de Entidad Emisora en Facturas.tsx, columna Entidad + filtro en IVA.tsx. Probado con facturas reales de ambas entidades en la misma corrida: libros de IVA separados, y **se encontraron y corrigieron 2 bugs durante la integración** que el smoke test del agente no había detectado: (a) la numeración de comprobantes (PV+nº fiscal) no distinguía entidad emisora — dos SAS no podían usar el mismo número aunque en la realidad son series independientes; (b) `POST/PATCH /api/invoices` en `routes.ts` no tenía `issuerCompanyId` en el schema Zod, así que el selector del frontend no tenía efecto real (toda factura se emitía como Chimpancé). Ambos corregidos.
- **Fase 3 — Retenciones** ✅: tabla `withholdings` (tipo Ganancias/IIBB/IVA/SUSS/other, certificado, agente retenedor), `POST /api/withholdings`, el cierre de IVA descuenta las de tipo IVA del período (`netIva = débito − crédito − retenciones`, probado: $105 − $20 = $85 neto). **Pendiente (no bloqueante):** no hay UI todavía para cargar una retención estructurada desde el flujo de "cobrar obligación" (`ObligacionesList.tsx` associatedExpenses) — hoy se carga vía IVA.tsx/API directamente. Registrado como pendiente más abajo.
- **Fase 4 — Rentabilidad y CRM** ✅: P&L por cuenta y mes (`/api/analytics/pnl-by-owner`), rentabilidad por fuente de adquisición y por referido (`/api/analytics/profitability-by-source`), LTV por cliente (`/api/analytics/client-ltv`), todo integrado como tabs nuevas en Rentabilidad.tsx.
- **Fase 5 — "Medios de Pago" en vez de "Cajas"** ✅ (6-7/9/2026, commit `b5bd87e`): Santiago planteó que una tarjeta de crédito no es lo mismo que una caja/cuenta bancaria (activo vs. pasivo) y que "caja" no era el nombre correcto para dar de alta una tarjeta. En vez de un sistema paralelo (hubiera duplicado la lógica de saldo y de detección de pago cruzado; además `movements.cashboxId` es NOT NULL, todo pago necesita colgar de una cashbox sí o sí), se amplió el mismo concepto: `cashboxTypeEnum` suma `credit_card`, la UI entera pasa a llamarse "Medios de Pago" (Cajas.tsx, CajaDetalle.tsx, sidebar, onboarding), el saldo de una tarjeta se lee como "Deuda" (rojo) en vez de "Saldo" cuando es negativo, y el selector de medio de pago al cobrar/pagar en ObligacionesList.tsx ahora muestra el Titular de cada uno. Probado por Santiago mismo en pruebas antes de commitear. Migración pendiente de aplicar a la base real (un solo agregado de valor a un enum, sin tocar datos existentes) — quedó frenada por el classifier de seguridad de escrituras a la base real; falta la confirmación explícita de Santiago para completarla.

**Otros bugs de integración encontrados y corregidos en la pasada final** (ninguno estaba en los archivos exclusivos de los subagentes, todos en troncales): `debtSummary` en `analytics.ts` colapsaba "vibra" dentro de "chimpance" en dos lugares; el tipo `owner` de `CreateObligationInput`/`update` en `obligations.ts` y de `financialDebts.ts` seguía restringido a 2 valores; 5 endpoints en `routes.ts` (`z.enum(["santiago","chimpance"])`) no aceptaban "vibra" — ninguno de estos rompía en runtime porque el enum de Postgres sí tenía los 3 valores, pero silenciosamente impedían usar Vibra en esos flujos.

## DS Chimpa "Digitaal" aplicado al ERP (4/9/2026, en curso, por fases, no prioritario)

Fase 1 HECHA y verificada en erp-pruebas (sin commitear, sin aplicar a erp-real todavía): tokens de color del `.dark` en `client/src/index.css` (negro `#0A0A0A`/`#121310`/`#202020` + lima `#D9F45F` + destructivo `#FD5B38`), tipografía Manrope→Plus Jakarta Sans, logo real (`client/src/assets/chimpance-logo.svg`) reemplazando el placeholder morado/celeste del sidebar, y barrido global de los colores ingreso/egreso/pendiente hardcodeados a los funcionales del DS. **Resuelto (5/9/2026):** el celeste/morado viejo (~25 archivos) se separó en decorativo (→ gris neutro `text-muted-foreground`) y semántico real — estado "parcial"/"transferencia", categorías, cifras de datos (→ celeste apagado propio `#739DCA`, derivado del azul petróleo de la marca). Banner del Dashboard y botón flotante del chat → gradiente oscuro neutro. Verificado sin errores en erp-pruebas. Fases siguientes (charts Recharts que sí usan color con significado, Agente Chat, pulido de radios/spacing) sin arrancar. Ver [[project_theme_digitaal]] para la paleta fuente.

**Actualización 10-11/9/2026 — DS del ERP "Selva señalizada"** (reemplaza como spec a lo de arriba): tokens, style guide y build en `docs/design-system/` (v1.1 alineada 1:1 a `Chimpa/brand/styleguide-theme.html`: 2 acentos lima + celeste, píldoras, radios/grises/motion de marca; extensiones [ERP]: ámbar = advertencia, naranja relleno solo en diálogos irreversibles). v1.2 suma la capa UX (patrones de interacción, estados de pantalla, componentes comerciales). Solo diseño, sin commitear ni implementar; plan de implementación en fases dentro de la guía (sección "Para desarrollo"). Artifact: https://claude.ai/code/artifact/df8a99ba-cb7c-4dda-ae66-943988ac014f

## Roadmap por módulos chicos (5/9/2026, pedido de Santiago para no agotar tokens)

Regla: **un módulo = una sesión corta**. Arrancar con "cargá el skill erp-chimpa-finanzas y hacé el módulo M-n"; leer solo los
archivos que el módulo nombra; subagentes solo si hay dos frentes realmente independientes; probar en erp-local, commitear,
subir a dev-finanzas, tildar acá. Tamaños: XS = menos de media sesión · S = media sesión · M = una sesión entera · L = varias.

| # | Módulo | Tamaño | Qué entrega | Toca | Depende de |
|---|---|---|---|---|---|
| M1 | Puesta a punto operativa | XS | En **producción**: confirmar la password del admin con el CTO y crear los usuarios del equipo (colaboradores/contador) para que empiecen a usarlo. (La parte local de este módulo quedó sin sentido con la baja del `:5000`.) | Admin › Usuarios, `.env` del servidor | — |
| M2 | Deploy al droplet | M (ops, con CTO) | ERP público con HTTPS en subdominio propio, PG en el droplet, restore de la base real, backup, env vars (`DATABASE_URL`, `SESSION_SECRET`, `OPENAI_API_KEY`, `ADMIN_PASSWORD`), ffmpeg | infra, docs | M1 (password) |
| ~~M3~~ ✅ | Overrides + métricas mínimas (5/9/2026) | S | Tabla `work_ai_overrides` (una fila por decisión convertir/vincular/responder/descartar sobre feedback clasificado: snapshot IA vs. lo que quedó, flags `title/category/priority_changed`, `intent_matched`, `accepted_all`); `GET /api/feedback/metrics?projectId=&days=`; botón **Métricas** en el inbox con 3 bloques (Equipo / IA / Rondas). Ver capítulo 00 "Feedback › M3". SQL aplicado a pruebas y a real; test `scripts/tests/test_m3_api.py` (24 checks) | override.service, metrics.service, feedback.service, feedback.routes, FeedbackMetricsPanel, FeedbackInbox | — |
| ~~M4~~ ✅ | Responsable sugerido + pregunta cuando es ambiguo (5/9/2026, commit 93fd4dd) | S | `feedbackAi` recibe el equipo activo con historial por categoría y devuelve `suggestedAssigneeId` (validado; fallback por historial) + `suggestedQuestion` solo si intención "ambiguous" o confianza < 60; `POST /api/feedback/:id/ask` manda la pregunta al hilo con un click; `work_ai_overrides` mide `assignee_changed`; tiles Responsable / Preguntas en Métricas. Ver capítulo 00 "Feedback › M4". SQL `2026-09-05d_m4_responsable_pregunta.sql` aplicado a pruebas y a real; tests `test_m4_api.py` (33) + `test_m4_e2e.py` (19) | feedbackAi, feedback.service, override/metrics.service, feedback.routes, thread.service, FeedbackInbox, FeedbackMetricsPanel | M3 |
| ~~M5~~ ✅ | Contexto técnico automático del SDK (5/9/2026) | XS | SDK v2.1 manda `anchor.tech` (navegador+versión, SO, celular/táctil, idioma, tz, pantalla, viewport, dpr, URL exacta, últimos 10 errores: console.error / JS con archivo:línea / promesas / recursos); server lo sanea con topes propios y lo oculta de todo lo que ve el cliente; inbox lo muestra en "Dónde" (resumen + URL exacta + errores plegables) y la tarea prellenada lo trae. Sin SQL. Tests `test_m5_api.py` (26) + `test_m5_e2e.py` (Playwright, 19). Ver capítulo 00 "Feedback › M5" | review-sdk.js, feedback.service, FeedbackInbox, review-demo.html | — |
| M6 | Marcado sobre la página + resaltado de texto | M | Rectángulo y flecha dibujados sobre el DOM (coordenadas relativas al elemento, se re-anclan como el pin); selección de texto → highlight anclado por rango + texto; ambos visibles para el equipo | review-sdk.js, anchor (jsonb), FeedbackInbox/ReviewPublic | M5 |
| ~~M7~~ ✅ | Plantillas por tipo de proyecto (5/9/2026) | S | Web / Branding / Marketing sembradas al boot; "Aplicar plantilla" en ProyectoDetalle (fecha de inicio + responsable + vista previa de fechas), plantilla opcional al crear proyecto desde oportunidad, Admin › Plantillas (editor de fases, duplicar, activar/desactivar). Ver capítulo 00 "Plantillas de proyecto". **SQL aplicado a pruebas y a real; erp-real todavía SIN reiniciar** (ver nota abajo) | work domain, ProyectoDetalle, CrmOpportunityDetalle, Admin | — |
| M8 | Agente por Telegram | S | Bot con webhook → mismo `botChatService`, sesión por chat id, botones inline para confirmar borradores; foto/audio pasan por el mismo pipeline | server/domains/telegram, routes.ts (1 línea) | M2 |
| M9 | Extensión de navegador | M | Chrome/Edge extension que inyecta el SDK en cualquier sitio (token por proyecto); para sitios donde no se puede pegar el script | carpeta nueva `extension/`, reutiliza review-sdk.js | M2 |
| M10 | Antes/después + revisión responsive | M | Captura server-side con Playwright por ronda y por breakpoint (móvil/tablet/desktop), comparación lado a lado y diff visual | server (Playwright), rounds, ReviewPublic, DeliverablesCard | M2 (Chromium en el droplet) |
| M11 | Dependencias, hitos y vistas guardadas | M | "Bloqueada por", hitos por proyecto con fecha, vistas guardadas de filtros en Tareas, tablero por proyecto | work domain, Tareas, TaskWorkspace | — |
| M12 | Email automático | S | Avisos al cliente (novedades, ronda abierta, resuelto) y resumen diario al equipo vía SMTP/Resend; plantillas en español | notice.service, notifications, env vars | M2 + proveedor de email |
| M13 | Costo por hora + rentabilidad real | S | Costo por usuario con vigencia, costo real por tarea/proyecto, margen real en Rentabilidad, alerta horas > estimado | work domain, analytics, Rentabilidad | — (no prioritario, decisión de Santiago) |
| M14 | Servidor MCP del ERP | S | Exponer proyectos, tareas, feedback y rondas como tools MCP para Claude/otros agentes (lectura + acciones con confirmación) | server/domains/mcp | M2 |
| ~~M16~~ ✅ | Pantalla Hoy (7/9/2026, commit 9d80044) | M | Home por rol con prioridades del día + agenda (Google Calendar iCal + reuniones + CRM) + bloques por sombrero con preferencias + tarea rápida por el Agente + fijar/posponer. SQL `2026-09-07_hoy.sql` y migración `0002_pantalla_hoy` aplicados a pruebas y a real; erp-real reiniciado. **Fase 2 pendiente:** vista semana, reordenar arrastrando, crear eventos en Google (OAuth), "buen día" automático (M8/M12), bloque Clientes para colaboradores | server/domains/today, work.routes, botChatAgent/botIntakes, Hoy.tsx, components/today, App/sidebar/onboarding | — |
| M15 | Fase 4 agentic | L | Agent Context por proyecto, matriz de riesgo, agente implementador + agente revisor + aprobación humana; empieza por cambios de copy | todo | M3, M14 y meses de historial |

**PLAN DE CRECIMIENTO SIN PRUEBAS DE SANTIAGO (5/9/2026, actualizado 8/9/2026):** cuando Santiago no llega a probar, se sigue
construyendo solo lo que se verifica sin él (curl + navegador + tests automáticos en el local :5001) y se sube a **dev-finanzas**
para que pueda mirarlo cuando pueda; a producción solo con su OK. Orden: **M7 plantillas → M3 overrides+métricas → M5 contexto técnico → M4 responsable+pregunta →
M6 marcado sobre la página → M11 dependencias/hitos/vistas → M10 antes/después (Playwright local) → M9 extensión (probable
contra localhost) → M14 MCP (probable con Claude Code como cliente) → M13 costo por hora → M8 Telegram por long polling
(sin URL pública; solo necesita un token de BotFather, 2 minutos de Santiago) → M12 email (necesita proveedor)**.
Cada módulo termina con su fila tildada acá y una nota de "cómo probarlo cuando puedas" en el capítulo 00.

> **Nota del 8/9/2026:** los estados que siguen hablan de `erp-real`/`erp-pruebas`, ambientes dados de baja. Se leen como historia:
> ningún "pendiente de reiniciar erp-real" ni "falta aplicar el SQL a `chimpance_erp`" sigue vigente — todo eso está en producción,
> aplicado por las migraciones versionadas.

**Estado 5/9/2026 (sesión M7):** M7 hecho, probado en pruebas (30 checks de API + navegador) y commiteado. `scripts/sql/2026-09-05_plantillas_proyecto.sql`
ya está aplicado a `chimpance_erp`, pero **erp-real no se reinició** a propósito: en paralelo otra sesión de Claude está construyendo el
módulo Growth (`server/domains/growth/`, `scripts/sql/2026-09-05_growth_workspaces.sql`, cambios en App.tsx/routes.ts/schema.ts sin commitear)
y su schema (p. ej. `crm_opportunities.workspace_id NOT NULL`) está aplicado solo en pruebas. Reiniciar erp-real hoy cargaría ese código a medias
contra una base sin esas columnas. **Pendiente:** cuando Growth esté commiteado y su SQL aplicado a real, reiniciar erp-real → el boot siembra las
3 plantillas solo. ~~Próximo módulo del plan: **M3 overrides + métricas**.~~

**Estado 5/9/2026 (sesión M3):** M3 hecho, probado en pruebas (24 checks de API + navegador) y commiteado. `scripts/sql/2026-09-05c_ai_overrides.sql`
aplicado a pruebas y a `chimpance_erp` (backup previo `chimpance_erp_2026-09-05_1917.dump`). **erp-real sigue SIN reiniciar** (corre código del
5/9 08:25): la base real todavía no tiene el schema de Growth (`growth_*`, `crm_opportunities.workspace_id`), que el código commiteado ya exige →
reiniciar erp-real hoy rompería el CRM. **Pendiente para destrabar erp-real:** aplicar `2026-09-05_growth_workspaces.sql` + `2026-09-05b_growth_score_briefs_imports.sql`
a `chimpance_erp` (decisión de Santiago: son 12 tablas + backfill del workspace default) → reiniciar erp-real → verificar Dashboard, CRM, /tareas, /feedback.
~~Próximo módulo del plan: **M5 contexto técnico del SDK**.~~

**Estado 5/9/2026 (sesión M5):** M5 hecho, probado en pruebas (26 checks de API + 19 e2e Playwright) y commiteado (`e84fbc0`). **No hay SQL**
(`anchor` ya era jsonb). erp-real sigue SIN reiniciar por el pendiente de Growth: el SDK nuevo ya se sirve desde erp-real (Vite lee
`client/public/` del disco) pero el server viejo guarda `tech` sin sanear y lo devuelve en los pins públicos hasta el reinicio; como
todavía no hay ningún cliente usando el SDK sobre erp-real, no importa. Hallazgo para un M0: el rate limit público es **30 req / 10 min
POR TOKEN** (compartido entre todos los revisores del enlace) y el SDK gasta 3 por carga de página → un cliente con 2-3 personas
navegando 5 páginas lo agota; subirlo o pasarlo a por token+clave de revisor antes del piloto (Etapa B).
~~Próximo módulo del plan: **M4 responsable sugerido + pregunta cuando es ambiguo**.~~

**Estado 5/9/2026 (sesión M4):** M4 hecho, probado en pruebas (33 checks de API con IA real + 19 e2e Playwright con capturas) y commiteado
(`93fd4dd`). `scripts/sql/2026-09-05d_m4_responsable_pregunta.sql` (6 `ADD COLUMN IF NOT EXISTS`) aplicado a pruebas y a `chimpance_erp`
(backup previo `chimpance_erp_2026-09-05_2337.dump`). erp-real sigue SIN reiniciar por el pendiente de Growth (ídem M3/M5). El :5001 lo
había levantado otra sesión con código viejo: se mató y se relevantó desde acá (gotcha cap. 03). Queda sin commitear un cambio ajeno de
una línea en blanco en `opportunity.service.ts` (no es de esta sesión).
Próximo módulo del plan: **M6 marcado sobre la página + resaltado de texto**.

**Estado 7/9/2026 (sesión Pantalla Hoy):** M16 hecho a pedido de Santiago (propuesta → wireframe lo-fi validado → build). Probado en pruebas con
datos sembrados (`[HOY] …` en `chimpance_pruebas`: 13 tareas, 2 leads con 4 tareas de CRM, 5 obligaciones, 3 feedbacks, 2 feeds de calendario —
uno real: feriados de Argentina de Google, leído OK) por API con los tres roles (admin/colaborador/contador) y en navegador; gate del CI en local
(107 tests, 5 skipped) y `npm run build` OK con `node-ical`. SQL aplicado a real y erp-real reiniciado (backup `chimpance_erp_2026-09-07_2142.dump`).
**Pendiente de Santiago:** pegar la dirección secreta iCal de su Google Calendar en Hoy (ícono de calendario) y recorrer el punto 0 de la
checklist del capítulo 07. Sin push (premisa vigente).

**PLAN VIGENTE (actualizado 8/9/2026, ya con producción en la nube):**
- **Etapa A · Uso interno real:** M1 (usuarios del equipo en producción) → el equipo usa Tareas, Hoy y el chat sobre proyectos reales **en producción** → sesiones XS de pulido con lo que moleste ("M0", una por hallazgo).
- **Etapa B · Piloto de feedback con UN cliente:** ya no hace falta túnel ni cloudflared — el piloto se hace contra **dev-finanzas** (URL pública, datos descartables) y, cuando esté aceitado, contra producción. Snippet en el sitio del cliente (candidato: MT Agro); M6 (marcado sobre la página) según lo que pida el piloto.
- **Etapa C · Lo que sigue:** M6 → M11 → M10 → M9 → M14 → M13 → M8 (Telegram) → M12 (email) → M15.

**Cómo entra cada módulo ahora (12/9/2026):** se construye → `git push origin HEAD:dev` y se prueba en dev-finanzas, también el equipo (sin ambiente local) → con el OK de Santiago, `git push origin main` (producción). El viejo "no hay push ni deploy hasta probar" quedó sin efecto el 8/9/2026.

**Para ahorrar tokens en cada sesión:** no releer el informe fundacional ni el código entero; el capítulo 00 ya describe el módulo;
pedir al agente que lea solo los archivos de la columna "Toca"; verificar con curl + una pasada de navegador, no con capturas
repetidas; commitear y tildar el módulo acá antes de cerrar la sesión.

## Auditoría del CRM (10/9/2026) — seguridad + sev. 4 + sev. 3 EN PRODUCCIÓN desde el 14/9/2026

**Estado 12/9/2026 (sesión "Arreglar seguridad y núcleo del CRM")** — en producción desde el pase del 14/9/2026 (`3761731`):
- `3ae66fe` **Seguridad**: candado global `apiAuthGuard` (`server/lib/apiAuth.ts`) montado antes de toda ruta; públicas SOLO `/api/auth/login|logout|me|register`, `/api/public/review/*`, `/api/public/growth/*` y `/api/integrations/google/callback`. Guards de rol con ruta normalizada (Express rutea `/API/x` igual que `/api/x` y eso esquivaba el guard del colaborador). Borrados `POST /api/crm/events` e `/identify`. Sal de IP: `IP_HASH_SALT` o derivada de `SESSION_SECRET` en producción. Verificado con curl en dev (401 sin login; review, growth, callback de Google, login y `review-sdk.js`/`growth.js` responden). **Regla nueva: una ruta pública nueva hay que sumarla a la lista de `apiAuth.ts` o responde 401.**
- `5f8dd46` **CRM**: `CompanyPicker` + `WinDialog` + `LossReasonDialog` (`client/src/components/crm/ClosingDialogs.tsx`) en detalle y kanban (Deshacer 6 s); el server exige monto para ganar y motivo para perder (`assertClosingData`, también en el alta); PATCH de oportunidad acepta `companyId`/`contactId`/`proposalUrl`; próxima acción → tarea real (`crm_lead_tasks.title` + `source_interaction_id`, migración 0016); tareas no nacen vencidas (server rechaza días pasados); vaciar campos del lead guarda null; `staleTime` 45 s + refetch al foco; nombres `createdByName/changedByName/assigneeName`; rol `sales` con alcance (`server/domains/crm/salesScope.ts`: propio + "sin asignar" = entró solo y su dueño no es vendedor; 404 al resto; solo se asigna a sí mismo; Growth solo lectura; no borra empresas); config del CRM y CSV de leads solo admin (`adminOnlyApiGuard`). Tests: `tests/crmAuditoria.api.test.ts` (36, server real) + `tests/apiAuth.test.ts` (78).
- **Verificado en navegador en dev (13/9/2026, Chrome de Santiago como admin)** sobre la versión rediseñada por la sesión "DISEÑO UI UX - 3" (que construyó encima y respetó los arreglos): crear empresa desde la oportunidad → ganar con monto (sin monto lo frena) → crear proyecto; perder desde el kanban con motivo obligatorio; Deshacer; próxima acción → tarea con título en "Próximo paso"; vaciar email guarda null. Arreglos que salieron de esa prueba: `b052b11` (Deshacer al sacar de Perdida devuelve motivo y nota; empresa creada se guardaba dos veces) + `861c54c` y `df317dd` (buscador de empresa que no dejaba escribir dentro de un diálogo: causa raíz, dos copias de `react-focus-scope`; ver cap. 03). El alcance de `sales` quedó probado solo por los tests de API (no hay usuario vendedor en dev).
- Pendiente de esta auditoría: convertir dos veces duplica oportunidades, kanban oculta pipelines no default, Leads sin selector de workspace, dashboard por mes de creación, QuickLog en un solo POST, WhatsApp/mail que registran, responsable editable + "Míos", CallQueue; Growth (envíos/leads) todavía no se filtra por dueño para `sales`.


Santiago la dejó en espera el 11/9/2026 para priorizar el DS del ERP (capa UX/UI). Informe completo (funcional + UX/UI + IA y bot,
con `archivo:línea` de cada hallazgo): `docs/auditorias/crm-2026-09/auditoria-crm.html` (fuente en `_build/`, se arma con
`docs/design-system/_build/build_page.py`) · artifact https://claude.ai/code/artifact/cca175d4-ffc2-44fd-ac06-b9cae19e36b0 .
Veredicto: captación (Growth) 4/5 · núcleo comercial 2/5 · UX 2/5 · IA y bot en el CRM 1/5.

**Lo que quedó abierto de esta auditoría (bugs, núcleo comercial, IA y reporting del CRM) vive en el skill `crm-growth-chimpa`,
cap. 05 (backlog vivo).** Acá queda solo el registro de lo que ya está arreglado y en producción.

## Auditoría de formularios (12/9/2026) — PENDIENTE

Pedida por Santiago (captura del diálogo "Editar datos" de empresa). ~50 formularios auditados en código. Diseño de la solución en el DS v1.5 › "Carga de datos" (`docs/design-system/styleguide.html#carga`). **Primero los 5 bugs de severidad 4, que pierden datos o plata:**
1. ~~**IVA de más al facturar**~~ → resuelto en dev 14/9/2026 (auditoría IVA, ver sección de abajo): el alta de obligación pide el monto "con IVA incluido" (`ObligationCreateModal.tsx:271`, `ObligacionesList.tsx:1087`), pero "Emitir factura" lo toma como neto y suma 21 % (`ObligacionesList.tsx:976`, `invoices.ts:65`); además aplica 21 % a facturas B y E.
2. **Nueva deuda descarta campos**: Nº de préstamo, sistema de amortización y sellos no están en el schema del POST (`routes.ts:1007-1023`); la UI ofrece 7 frecuencias y el server acepta mensual/trimestral (`DeudasFinancieras.tsx:396`).
3. ~~**Editar factura imposible**~~ → resuelto en dev 14/9/2026 con nota de crédito: el lápiz solo aparece en emitidas (`Facturas.tsx:337`) y el server rechaza editar emitidas (`invoices.ts:428`).
4. **Vaciar campos del lead no se guarda** (`formX || undefined`, `CrmLeadDetalle.tsx:281-290`) y muestra "actualizado".
5. **Motivo de pérdida**: compara `stage.type === "lost"` pero el schema usa `isLostStage` (`CrmOpportunityDetalle.tsx:110,247,255`).

Después (sev. 3): errores crudos (`queryClient.ts:5` → traductor único); fecha "hoy" en UTC en 11 lugares (→ `todayAR()`); modales largos que pierden lo cargado sin avisar; `MoneyInput` pega "1234.56" como 123.456 (`MoneyInput.tsx:132`); foco de Radix que selecciona todo el texto al abrir un diálogo de edición; selects de empresa/proyecto/lead sin búsqueda (cmdk instalado sin uso); tarea CRM que nace vencida; horas sin "1:30"; cuotas del acuerdo comercial que se recortan al tipear (`ProyectoDetalle.tsx:969`); `/api/cuit` solo lee el title de CuitOnline (para condición IVA y domicilio hace falta padrón ARCA; guardar en `afipVerified`/`afipPublicData`); CUIT sin dígito verificador ni unique; IVA sin formulario de retenciones. Base común propuesta: FormField único (19 copias hoy, 1 `htmlFor`), react-hook-form + zod de `shared/`, EntityCombobox, MoneyField neto/IVA/total, DirtyGuard, DraftAutosave, ErrorSummary, "Completar con Chimpa".

## Auditoría IVA y facturación (14/9/2026) — EN PRODUCCIÓN desde el 14/9/2026 (migración 0017); falta validarla con un contador

Brief en `docs/auditorias/iva-2026-09/BRIEF.md`. **Diagnóstico de producción: no había facturas emitidas → no hubo datos que corregir.** Decisiones de Santiago (14/9) y hoja para la contadora en `DECISIONES-contadora.md`:
1. **El monto de una obligación es NETO, sin IVA.** Al facturar se suma el IVA y la obligación pasa al total (audit `linked_to_invoice` guarda `previousAmount`, `previousSourceType`, etc.). Alta y edición de obligación dicen "neto, sin IVA".
2. **Alícuota por comprobante** (21 / 10,5 / 27 / 0) en `invoices.iva_rate`. E y C siempre 0. **Tipo C** nuevo, solo compras; E solo ventas.
3. **Vencimiento de la DJ**: mes siguiente, 5 hábiles seguidos desde el 18 por terminación de CUIT del emisor (`ivaDueDate`, saltea fines de semana, no feriados → puede dar un día antes, nunca después). Se guarda en `iva_periods.due_date`.
4. **Saldo a favor** arrastrado: `technical_balance_in/out`, `free_balance_in/out`. Se cierra en orden (bloquea si hay un mes anterior abierto) y nunca el mes en curso.
5. **Nota de crédito** total/parcial (`invoices.kind = credit_note`, `related_invoice_id`): IVA negativo en el mes de la NC, baja la deuda (si queda en 0 sin cobros, la cancela); no puede superar lo pendiente de cobro. **Anular** = cargado por error: bloqueado en período cerrado (`VOID_BLOCKED_PERIOD_CLOSED`) o con NC vigentes; si la factura salió de una obligación, la devuelve a como estaba en vez de cancelarla.

Qué más entró (commit `beda0e5`, migración **0017**, aditiva): `shared/fiscal.ts` (cálculo único cliente+servidor, 26 tests) · `invoice.test.ts` reescrito y de vuelta en el CI · retenciones al cobrar (tipo + certificado → fila en `withholdings`, IVA imputado por **fecha** de retención) · la parte IVA de un cobro va con `line_type = tax_iva` (antes `tax_debito_credito`, que es el impuesto al cheque) · proyecto opcional al facturar · próximo número sugerido (`GET /api/invoices/next-number`) · `POST /api/invoices/:id/credit-notes` · vista previa del cierre en `GET /api/iva/periods/:period` (`preview`) · **eliminado `runIvaUsdBnaFix` del arranque y `/api/admin/fix-iva-usd-bna`**: creaban una deuda de IVA por cada factura en dólares además de la del cierre y recalculaban períodos mezclando emisores.

Pendientes:
- **Validar con un contador** los 6 puntos de `DECISIONES-contadora.md` antes de migrar a producción. (21/9/2026: Pia ya no trabaja con Chimpancé, así que este pendiente quedó sin responsable.)
- **Anular un cobro no anula sus retenciones** (avisado 14/9 por la sesión "Unificar Registrar movimiento"): la fila de `withholdings` queda viva y la de IVA sigue sumando en `iva_periods.withholding_total` → el mes pagaría de menos. Arreglo: al anular el movimiento, borrar/anular las retenciones con ese `movement_id` y restar la de IVA del período (bloquear si el período está cerrado). Mientras tanto, el formulario "Registrar" no ofrece Deshacer cuando hay retenciones.
- Feriados en el vencimiento (hoy solo fines de semana).
- NC que supera lo cobrado → devolución al cliente (hoy se bloquea y se registra aparte).
- Varias alícuotas en una misma factura (hoy una por comprobante).
- **Factura electrónica ARCA (16/9/2026, sesión "Facturación ARCA bugs")**: **EN PRODUCCIÓN desde el pase del 16/9 noche (`f5be5a5`), emite facturas reales** (commits `92e7ccd`, `9cdf2d2`, `c3f3149`, `26d5215`, migración 0019) y **PROBADA contra el ARCA de prueba** el 16/9: Factura B en pesos y en USD BNA con CAE, PDF, nota de crédito asociada (mismos pesos), "Anular" bloqueado. Certificado de homologación: WSASS lo emitió a nombre de **Santiago (CUIT 20345986317)**, DN `chimpafinanzas`, clave `certs/arca/chimpance-arca-dev.key`, certificado `certs/arca/chimpafinanzas-homo.crt` (vence 15/9/2028), secretos `ARCA_HOMO_CERT_B64`/`ARCA_HOMO_KEY_B64` cargados; en homologación se factura con el CUIT del certificado (`cuitFromCertificate`). En el ARCA de prueba ya hay B 0002-1..3 y NC B 0002-1..3 (la base de dev las tiene: no borrarlas o salta `ARCA_OUT_OF_SYNC`). Pendientes: (1) **Ingresos Brutos e inicio de actividades** de Chimpancé en `server/domains/integrations/arca/emisor.ts` (el PDF muestra "—"); (2) primera factura real: Aapresid (Factura B), cargar antes el concepto en su proyecto "Hosting Mantenimiento"; el 16/9 se pidió desde la compu un ticket WSAA de producción para wsfe que vence 23:04: si la primera emisión de ese día falla con "ya posee un TA válido", reintentar después; (3) probar en celular (no se pudo: Chrome no se achicó); (4) después: herramienta para resolver `ARCA_OUT_OF_SYNC`/`ARCA_NOT_SAVED` (hoy queda en `audit_log` `arca_authorized_not_saved`), factura E por wsfex, mandar el PDF por mail, varios renglones por factura.

## Estado de producción (8/9/2026, 19:49)

Producción corre `730ae15`, con migraciones **0001–0005** aplicadas. Todo el trabajo de la etapa local está desplegado:
Módulo Trabajo, Growth OS, Cuentas, Pantalla Hoy, Ficha del cliente + Playbook + Soporte por horas, Perfil + Google OAuth,
**Documentación del proyecto tipo Notion** y la descripción legible de las tareas que nacen de un feedback. `dev` y `main`
están a la par. Verificado tras el deploy: home 200, `/api/work/docs/1` responde 401 JSON (la ruta nueva existe), y
`admin/admin1234` da 401 (la clave la fija `ADMIN_PASSWORD` del CTO).

## Pendientes de operación tras el cambio de ambientes (8/9/2026)

- **CRÍTICO (detectado 10/9/2026): la API del ERP responde sin login a 60 de 66 lecturas, también en PRODUCCIÓN.** Arreglado en `dev` el 12/9/2026 (commit `3ae66fe`, › Auditoría del CRM › Estado); **Cerrado en producción el 14/9/2026 (pase `3761731`).**
- **Backup automático de la base de PRODUCCIÓN**: hay que confirmarlo con el CTO. El backup automático que existía (a `G:\Mi unidad\Backups Chimpa-Finanzas\`) corría al arrancar el `:5000` local, ambiente que ya no existe; hoy los únicos datos reales están en el droplet. **Preguntar: ¿el servidor hace `pg_dump` programado, dónde queda y cómo se restaura?** Hasta tener respuesta, cargar datos reales en producción es un riesgo asumido.
- **Password del admin de producción**: la maneja el CTO (`ADMIN_PASSWORD` en el `.env`); Santiago la necesita para crear los usuarios del equipo (M1).
- **`VAULT_KEY` en producción** antes de guardar la primera contraseña de cliente en el Playbook (cap. 08).
- **ARCA (búsqueda por CUIT) — resuelto sin el CTO (14/9/2026)**: el certificado de producción está en los secretos cifrados de GitHub `ARCA_CERT_B64` / `ARCA_KEY_B64`; el paso "Certificado de ARCA" de `deploy.yml` lo escribe en `$DIR/.arca/` en cada deploy (dev y producción usan el mismo por ahora). Probado en dev-finanzas: Aapresid → Exento + domicilio de Rosario. En producción desde el pase del 14/9/2026; no requiere nada del `.env`. **Antes del módulo de facturación**: dev pasa a su propio certificado (`certs/arca/chimpance-arca-dev.csr`, alias `chimpafinanzas-dev`, solo padrón) con secretos separados por rama.
- **Limpieza de restos de Replit** en el repo: `.replit`, `replit.md`, `attached_assets/Pasted-REPLIT-*`, y renombrar `client/replit_integrations/audio` (código vivo del grabador de voz, solo el nombre es histórico). Es cosmético pero confunde a cualquiera que abra el repo.
- **M0 · `/api/` inexistente devuelve HTML 200 en producción** (`server/prodStatic.ts:18`): agregar un 404 JSON para `/api/*` antes del catch-all del SPA. Media hora, detalle en cap. 03.
- **Bases locales congeladas**: `chimpance_erp` y `chimpance_pruebas` siguen en el PG18 local sin usarse. Dropearlas cuando Santiago confirme que no quiere mirar nada de ahí.

## Propuestas (17-21/9/2026) — EN PRODUCCIÓN, con pendientes
- Resuelto: el link pegado en el campo "Propuesta" de la oportunidad registra la propuesta (`proposalService.syncFromOpportunity`); si estaba pegado y sin registrar, se registra al enviar o al pedir el código (`ensureForOpportunity`). En la oportunidad quedó **una sola tarjeta**, la de enviar y medir (`OpportunityProposalJourney`); la lista del lead (`LeadProposals`) quedó solo en la ficha del lead, de lectura. Todo en producción con el pase del 21/9.
- **Pendientes (código de medición en tres lugares, `ensureLead`): skill `crm-growth-chimpa`, cap. 05** (P-02, B-04, Q-01, Q-05).
- Operativo, no de código: la oportunidad de ASAGA en producción tiene el link pegado y la propuesta sin registrar (un clic en "Enviar propuesta" o "Código para medirla" la registra); para medir la lectura hay que pegar el código en la página de la propuesta.

## Empresas del CRM (16/9/2026) — en producción desde el 16/9, pendientes
- Cómo funciona: skill `crm-growth-chimpa`, cap. 03. **Pendientes (referidores viejos cargados como clientes, pantalla propia de empresas del CRM, hero sin logo): cap. 05** (B-06, Q-04, D-07).
- Leads de formularios de Growth y de mails no crean empresa del CRM (a propósito: los workspaces de clientes no son prospectos de Chimpancé).

## Mapas (24/9/2026) — en dev, pendientes de fase 2 y 3

- **Revisores anónimos por entregable** (pedido de Santiago 24/9): un interruptor en cada entregable que diga si el enlace/widget acepta
  revisores sin identificar ("poné tu nombre") o solo personas con acceso (`work_client_access`). Vale para mapas y para el widget de la web.
- ~~**Completar con Chimpa IA desde un documento**~~ **HECHO en dev 25/9/2026** (sesión "Mapas con Chimpa IA"; detalle en cap. 07 › Mapas). Falta: prueba de Santiago y estrenarlo con Mendive. Pedido original: Importar →
  "Desde un documento" (texto pegado o una página de la Documentación del proyecto: brief, minuta, el mapa de sitio que manda el cliente). La IA
  propone nodos, jerarquía y flechas, sugiere qué tipo de mapa es (sitio / user flow / casos de uso) y la persona confirma con VISTA PREVIA
  (lista de nodos a crear, sacar los que sobran) antes de que entre al lienzo. Reusa `importJson` (formato `{nodes:[{ref,kind,label,children,submap}],edges}`)
  y el patrón "la IA propone, la persona confirma" del chat. Caso de estreno: Mendive.
- **Comentar sobre nodos** del mapa (permiso `comment`), anclado al nodo y cayendo en la ronda del entregable como cualquier feedback.
- Versión ↔ ronda (aprobar la ronda congela el mapa), deshacer, grupos que arrastran su contenido, export PNG/PDF, Completar con Chimpa IA,
  documentos por nodo con versión, crear tareas desde nodos. Detalle en el cap. 07 › Mapas.

## Futures acordados / ideas en carpeta

- **Agente por WhatsApp/Telegram** (pedido de Santiago, 3/9/2026): la misma lógica del chat con otra puerta de entrada; requiere el ERP en el droplet (endpoint público). Telegram es gratis y rápido; WhatsApp necesita API oficial de Meta.
- **PWA con share target (decidido 8/9/2026, va ANTES que Telegram):** Santiago usa Samsung S25 (Android, soporte completo). Instalar el ERP como PWA desde dev-finanzas.chimpance.digital (HTTPS obligatorio) y declararlo destino del menú Compartir: comprobante de transferencia o captura → "Chimpa Finanzas" → cae en el chat del bot → borrador para confirmar. Falta construir: manifest + service worker mínimo + ruta de recepción (`/bot-chat/share`) que abra AgentChat con la imagen cargada; el chat ya acepta imágenes pegadas (AgentChat.tsx, handler de paste), así que el pipeline foto→borrador existe. ~1 día, sin terceros. iPhone no soporta share target (plan B: pegar/adjuntar en la app).
- **Ficha del cliente + Playbook + Soporte por horas (HECHO 8/9/2026):** `/empresas/:id` (logo, datos, contactos, proyectos, playbook con accesos cifrados y revelado auditado) y `/soporte` (planes mensuales con arrastre / bolsas de horas, registros con VOID, historial, excedente valorizado). Capítulo 08. Pendientes sugeridos allí: enlace público para el cliente, aviso al 80 %, vínculo con tareas/obligación AR del excedente, importar el Excel histórico.
- **Playbook de paralelismo validado (4/9/2026):** dos subagentes con archivos exclusivos + sesión principal integrando schema/routes/App funcionó sin conflictos (ver capítulo 05).

- **Cargar cajas reales** y arrancar la operación diaria (primer pendiente de Santiago).
- **Owner en movements** (egresos directos por caja hoy no se atribuyen a titular).
- ~~**UI de retenciones desde "cobrar obligación"**~~ (hecho en dev 14/9/2026, auditoría IVA): extender `ObligacionesList.tsx`/`obligations.ts` para que el gasto asociado tipo "Retención impositiva" cree además una fila estructurada en `withholdings` (hoy se carga aparte, vía IVA.tsx o la API). Requiere que `withholdingService.create` acepte una transacción externa para mantener atomicidad con el pago.
- **Editar titular desde ObligacionDetalle** (el PATCH ya lo acepta; falta UI en el detalle).
- **Filtro por titular** en listados de obligaciones/deudas y en Rentabilidad.
- Revisar el **borrado físico de proyectos** (volver a archivado o blindar).
- Lo que Santiago pida al usarlo — su criterio de producto manda; registrar acá lo que se acuerde.

## Plan de migración final — EJECUTADO el 8/9/2026

**Resultado (8/9/2026, con OK de Santiago "migremos todo a producción")**: gate local (base migrada desde cero + 116 tests + build) → push a `dev` (deploy verde, migración 0003 probada contra la base del servidor) → `git push origin main` (run 34251383605 verde: tests + `drizzle-kit migrate` aplicó 0001–0003 en la base de producción + restart + health check). Verificado: https://finanzas.chimpance.digital responde 200 y `admin/admin1234` devuelve 401 (la clave de producción es la `ADMIN_PASSWORD` del CTO). **Datos: no se migró nada** — la base local `chimpance_erp` estaba vacía (0 obligaciones, 0 movimientos), así que producción arranca limpia y Santiago carga ahí directamente. Desde acá: el local es espejo de desarrollo y **cada push a `main` toca producción** (siempre con OK puntual de Santiago). Pendientes que quedaron: `VAULT_KEY` en el `.env` de producción ANTES de cargar la primera contraseña de cliente (hoy el cifrado cae a `SESSION_SECRET`; si el CTO agrega `VAULT_KEY` después, lo ya guardado queda ilegible — cap. 08), y confirmar `OPENAI_API_KEY`/`PUBLIC_BASE_URL` con el CTO.

Plan original (7/9/2026), como referencia:
1. **Código**: ya resuelto por el CI/CD. `git push origin main` despliega producción y aplica las migraciones pendientes de `migrations/`. Antes: gate del CI en local (capítulo 01 › Nube) y OK explícito de Santiago.
2. **Seguridad**: `ADMIN_PASSWORD` y `SESSION_SECRET` en el `.env` del servidor (los maneja el CTO); verificar que el admin de producción no sea admin1234.
3. **Datos**: no hubo migración (la base local estaba vacía). Si alguna vez hace falta mover datos entre ambientes, es una decisión puntual con Santiago y el CTO, nunca parte del deploy; ojo con `drizzle.__drizzle_migrations` (al restaurar con `--clean` conservar esa tabla o reinsertar las filas, o el próximo deploy intenta reaplicar migraciones).
4. **Verificación**: login, Mi Deuda Total, un alta por chat, saldos de cajas contra el local, un proyecto con tareas y un enlace de revisión público.
5. Recién ahí el local pasa a ser espejo de desarrollo y la nube vuelve a ser producción.

## Reglas de actualización de este skill

Cuando se corrija un bug del capítulo 03, moverlo acá como "resuelto (commit X)". Cuando se sume una feature, listarla arriba. Cuando cambie una decisión de workflow, actualizar SKILL.md. Este skill es la fuente de verdad operativa del ERP junto con la memoria `project_chimpa_finanzas.md` (la memoria = resumen corto; el skill = profundidad).

## Reuniones: vista de organizador de la pantalla pública (anotado 22/9/2026)

Hoy "Ver como lo ven ellos" usa el link personal de quien mira, así que solo aparece si está invitado. Falta, cuando Santiago lo pida, una **vista de organizador** de solo lectura (`/reunion/<token firmado del organizador>`, cartel "Así la ven los invitados", sin poder votar) para mirarla sin estar invitado y sin riesgo de responder en nombre de otro. Media jornada. También pendiente de OK: el reordenamiento del detalle (barra de acciones fija con Confirmar el que más cierra + Ver como lo ven ellos + Recordar; "Faltan responder" como una línea de nombres, con los botones por persona solo en "Links de cada uno").

## Que Claude tome trabajo del ERP y lo ejecute (aprendizajes del 22/9/2026 — sesión del DS de Mendive)

**Insumo para M14 (servidor MCP) y M15 (Fase 4 agentic).** No es una idea nueva: los dos ya estaban en el
cap. 07 › pendientes. Lo que sigue son **catorce hallazgos** sacados de una ronda completa de punta a punta — la primera evidencia
real de qué les falta a M14 y M15. Anotado para trabajarlo en una sesión exclusiva del ERP; **nada de esto está
construido**.

### El caso, en dos líneas
Juliana dejó 23 comentarios anclados sobre `mendive.manada.me` (design system de Mendive, proyecto 6).
Claude los leyó, resolvió 16 en el archivo real, creó 6 tareas, vinculó los feedbacks, marcó las tareas hechas
y le respondió 5 comentarios a la clienta. La ronda cerró en **23 de 23 atendidos, inbox en cero**. Todo por
**automatización de navegador contra producción**, porque no hay otra puerta.

### Los primeros seis hallazgos (haciendo el trabajo)

**1. El ancla vale más que el texto, y no se puede leer sin scrapear.**
El clasificador marcó tres comentarios como "Pedir aclaración · Ambiguo" (confianza 50 %) porque el texto
era *"No tiene legibilidad"*. Mirando el `anchor.selector` se ve que apuntan a las **tres ilustraciones SVG**
de la sección Imagen: perfectamente accionables, cero ambigüedad. Para saberlo hubo que pegarle a
`GET /api/public/review/:token/pins?url=…` (el endpoint del widget) porque el inbox del equipo muestra el
ancla como texto suelto, no como dato.
→ **Cambiar:** (a) que `feedbackAi.ts` reciba el ancla en el prompt (tag, texto del elemento, id de sección,
selector), no solo el mensaje; (b) que el ancla salga en cualquier API que consuma un agente.

**2. Falta la intención "delega el criterio".**
*"No se guíen por la maqueta. Confío en el criterio de ustedes para que me recomienden lo ideal"* se clasificó
como ambiguo. No es ambiguo: es un encargo con libertad. Hoy cae en "pedir aclaración" y se frena solo.
→ **Cambiar:** intención nueva (`delegated` / "decide el equipo") en el enum de `feedbackAi`. Es la única que
un agente puede ejecutar con margen creativo sin volver a preguntar.

**3. "Resuelto" miente hasta que se publica. Este es el hallazgo grande.**
Marcar la tarea hecha pone el feedback en **Resuelto** y el cliente lo ve verde en el widget. Pero el archivo
estaba en la compu: `mendive.manada.me` seguía sirviendo la v0.1. O sea, Juliana podía ver "Resuelto" y abajo
el contenido viejo. El ERP tiene rondas y versiones (`work_review_rounds`, R1·v1) pero **nada ata "tarea
hecha" con "versión nueva publicada"**.
→ **Cambiar:** estado intermedio **"listo, falta publicar"**, y que lo que flipea a Resuelto sea el **bump de
versión del entregable**, no el check de la tarea. Es la diferencia entre un tablero que informa y uno que
miente.

**4. Hay dos cajas para "responder" y una no le llega al cliente.**
En el detalle conviven el cuadro **"Hilo con el cliente"** y el botón **"Responder"** de la barra de acciones.
Parecen lo mismo. No lo son: solo "Responder" escribe `answerText`, que es de dónde el SDK saca la respuesta
(`messagesOf()` devuelve `it.messages` o, si no, arma un mensaje con `answerText`). Escribir en el hilo guarda
la fila y **el ERP confirma "Respuesta enviada: el cliente la ve en el hilo"**, pero el widget le sigue diciendo
al cliente *"Todavía no hay respuestas"*, el estado no se mueve y el contador "Respondidos" queda en 0.
Se detectó recién cuando Santiago preguntó por qué no se veía la respuesta; hubo que leer el SDK para entenderlo.
Con el botón correcto el pin pasa a `respondido` y el hilo aparece. **Un agente no tiene cómo distinguirlos:
los dos aceptan texto y los dos dicen que salieron bien.**
→ **Cambiar:** que el cuadro del hilo también llegue al cliente (o que diga claramente que es nota interna), y que
el toast no afirme "el cliente la ve" cuando no la ve. En el MCP, **una sola tool `responder_al_cliente`** mapeada
al camino que sí publica.

**5. Todo es de a uno, y eso es justo lo que rompe la automatización.**
16 vinculaciones = 16 veces (buscar tarjeta → abrir detalle → Vincular → filtrar → elegir → confirmar). Sin
selección múltiple, sin acción en lote. Encima el filtro del diálogo de vincular **no matchea por `#id`**
(escribir `#42` da "Nada con #42"), hay que buscar por título. Y en una de esas pasadas **se escapó un click
sobre "Marcar hecha"** de la tarea #38: el resultado terminó siendo el buscado, pero fue un click perdido
sobre producción, no una decisión.
→ **Cambiar:** selección múltiple en el inbox + "vincular seleccionados a la tarea X"; que el filtro acepte
`#id`. Y sobre todo: que un agente no tenga que clickear coordenadas sobre producción para hacer esto.

**6. Crear tarea desde feedback pisa el contexto.**
El diálogo autocompleta la Descripción con la cita del cliente + el ancla + el contexto técnico. Escribir ahí
por API/automatización **borra todo eso**. Hubo que reconstruirlo a mano y después apendear al final.
→ **Cambiar:** separar el bloque "contexto del cliente" (inmutable, generado) de la descripción libre. Mismo
principio que ya rige el módulo: *lo que dijo el cliente no se edita*.

### Segunda tanda: lo que apareció al cerrar la ronda (misma sesión, más tarde)

Los seis de arriba salieron de *hacer el trabajo*. Estos cuatro salieron de *cerrar el círculo con la
clienta*, que es la parte que ningún agente había recorrido nunca. **Resultado final de la ronda: 23 de 23
atendidos (18 resueltos + 5 respondidos), inbox en cero.**

**7. El estado del feedback no se puede tocar: se deduce de otras cosas.**
No hay "marcar resuelto". Lo que hay es: tarea vinculada marcada hecha → `resuelto`; `answerText` cargado →
`respondido`; `Descartar` → descartado. Nada más. Es coherente (obliga a que un cierre tenga respaldo real),
pero tiene dos consecuencias: un agente no puede corregir un estado sin crear o mover una tarea, y **cerrar
una aprobación obliga a inventar una tarea que no existe**. Para cerrar los dos "Ok!" y "Perfecto!" de esta
ronda hubo que crear la tarea #46 *"Aprobaciones de Juliana (R1) — sin trabajo pendiente"* y marcarla hecha.
Queda una tarea fantasma en el tablero para siempre.
→ **Cambiar:** acción **"Acusar recibo y cerrar"** para los feedback con intención `approval`, sin tarea de
por medio. Es el caso más frecuente que no tiene salida propia.

**8. La tarjeta del inbox no se abre por el árbol de accesibilidad.**
Cada tarjeta figura como `button` con su título, pero hacerle click por referencia de accesibilidad **no abre
el detalle**: hay que clickear por coordenada. Toda la sesión se hizo así, y ahí es donde se escapó el click
que marcó hecha la tarea #38.
→ **Cambiar:** vale la pena revisar por qué, porque si un click sintético sobre el `button` no lo abre,
probablemente **tampoco lo abra Enter desde el teclado** — sería un problema de accesibilidad real, no solo
una molestia de automatización. Verificar antes de asumir.

**9. La regla de verificación que hay que escribir en piedra.**
El ERP confirmó "Respuesta enviada: el cliente la ve en el hilo" y no era cierto (hallazgo 4). Lo que sí
sirvió, y funcionó todas las veces, fue **verificar contra el endpoint público del widget**, que es
literalmente lo que ve el cliente:

```
GET /api/public/review/<token>/pins?url=<url del entregable>
→ items[].clientStatus  (recibido · en_curso · respondido · resuelto)
→ items[].answerText     (si es null, el cliente NO ve ninguna respuesta)
→ items[].anchor.selector
```

El token sale del snippet del SDK en el sitio del cliente, y el endpoint es público (de solo lectura y sin
login: así funciona el widget).
→ **Regla:** ningún agente reporta "resuelto" o "respondido" por lo que dijo la UI del ERP. Se confirma acá,
porque esto es lo que ve el cliente. Los `clientStatus` que devuelve este endpoint son la única fuente de
verdad de cara afuera.

**10. Sobre los subagentes, lo que sí escaló y lo que no.**
Cinco agentes sobre copias exclusivas del mismo archivo: 39 hunks, 1 rechazado. Escaló bien. Lo que no escaló
fue **el trabajo de ERP**: 16 vinculaciones + 5 tareas + 5 respuestas, todo secuencial, de a un click, sobre
producción. Esa asimetría es el argumento entero de M14: no hace falta que los agentes sean más listos, hace
falta que el ERP tenga una puerta.

### Tercera tanda: cargar el estado de un proyecto (misma sesión)

Después de cerrar la ronda se completó la ficha del proyecto (Nueva Web NM: descripción, código, salud,
responsable, 8 fases y 4 pedidos al cliente). Aparecieron cuatro cosas más.

**11. El hueco real: un feedback no se puede convertir en pedido al cliente. Es el hallazgo de esta tanda.**
La pestaña Estado tiene el bloque **"Necesitamos de ustedes"**, que es exactamente donde va lo que depende
del cliente. Pero el inbox de feedback **no sabe que ese bloque existe**: las acciones de un feedback son
Crear tarea · Vincular a tarea existente · Responder · Descartar, y nada más. Dos de los comentarios de esta
ronda (#5 "ajustá el logo", #6 "puedo agrandar la paloma") **no eran trabajo nuestro: eran cosas que ella se
ofrecía a mandar**. Hubo que volver a tipearlos a mano como pedidos, perdiendo el vínculo con el feedback que
los origina.
→ **Cambiar:** acción **"Convertir en pedido al cliente"** al lado de "Crear tarea", con el mismo vínculo
N↔N que ya existe para tareas. Esto **reemplaza y mejora la prioridad 6** (el estado "no lo hacemos
nosotros"): no hace falta un estado nuevo, hace falta un destino nuevo. Un feedback que pide algo del cliente
se convierte en pedido, el pedido aparece en el enlace de revisión, y cuando se marca Hecho el feedback se
cierra solo. El circuito cierra sin inventar estados.

**12. Todo lo que se carga en Estado lo lee el cliente, y viene tildado así por defecto.**
Las fases y los pedidos traen **"Visible para el cliente"** marcado: aparecen en el enlace de revisión. O sea
que completar la ficha del proyecto **es escribirle al cliente**, aunque no lo parezca (no hay toast de
"esto sale", ni diferencia visual entre lo interno y lo publicado hasta que se destilda).
→ **Regla para agentes:** los nombres de fase, los hitos y los pedidos se redactan en voz de cara al cliente,
con las mismas reglas que una respuesta. Y un agente **no carga fases ni pedidos sin OK**, por el mismo
criterio que no responde solo (hallazgo 4). Se propone el texto, se aprueba, se carga.

**13. La pestaña Estado tiene cinco bloques y tres están abajo del pliegue.**
Arriba se ven ¿Cómo venimos? · A cargo · Próximo hito · Fases. Abajo, sin ningún indicio, están
**Necesitamos de ustedes**, **Contactos del proyecto** y **Reporte semanal** (el mail de los viernes, que
arranca prellenado con lo que ya sabe el proyecto). Los tres son la capa de relación con el cliente y son los
más fáciles de no completar nunca: en el proyecto que se cargó estaban los tres vacíos.
→ **Cambiar:** que el encabezado de Estado muestre qué falta ("2 de 5 bloques completos", o un aviso cuando
no hay contactos cargados). Hoy un proyecto puede verse prolijo arriba y estar vacío donde importa.

**14. El "Reporte semanal" es la mejor candidata a tool del MCP que nadie había pedido.**
Ya existe, ya arranca prellenado con lo que sabe el proyecto, y es justo lo que un agente puede redactar bien:
qué se hizo, qué sigue, qué falta del cliente. Toda esa información ya está estructurada (tareas hechas,
feedback resuelto, pedidos pendientes).
→ **Sumar al MCP:** `borrador_reporte_semanal(projectId)` que devuelve el texto propuesto **sin enviarlo**.
Enviar sigue siendo humano.

**Gotchas de UI para quien automatice esta pantalla:** los campos de cabecera (descripción, código) son
inputs de **una sola línea** que guardan con **Enter** (Esc cancela); los diálogos de fase y de pedido guardan
con **Ctrl+Enter**; y la descripción larga rompe el layout (cap. 03). Antes de completar un proyecto conviene
chequear que el cliente no tenga **dos proyectos abiertos** — Nicolás Mendive tenía "Nicolas Mendive" (#15) y
"Nueva Web NM" (#6), los dos vacíos y con las tareas repartidas; el bueno es el que tiene el acuerdo y los
entregables.

### Lo que habría que construir, en orden

| Prioridad | Qué | Por qué ahora |
|---|---|---|
| **1** | **Estado "listo, falta publicar"** + Resuelto atado al bump de versión del entregable | Sin esto el tablero le miente al cliente. Es chico y es correctitud, no comodidad |
| **2** | **M14 · MCP del ERP**, con auth por `user_api_tokens` (`Bearer chimpa_…`, el patrón del plugin de Gmail, skill `crm-growth-chimpa` cap. 04) | Es la puerta. Todo lo demás cuelga de acá |
| **3** | Ancla al prompt de `feedbackAi` + intención `delegated` | Sube la precisión del triage justo donde hoy falla |
| **4** | Acciones en lote en el inbox + filtro por `#id` | Ahorra trabajo humano aunque nunca se construya el MCP |
| **5** | Bloque de contexto inmutable, separado de la descripción libre | Hoy la automatización lo destruye |
| **6** | **"Convertir en pedido al cliente"** como acción del feedback, al lado de "Crear tarea" (ver hallazgo 11) | De los 22 pendientes, 5 no eran trabajo nuestro y dos eran cosas que la clienta se ofrecía a mandar. El bloque "Necesitamos de ustedes" ya existe; falta el puente desde el feedback |
| **7** | Unificar las dos cajas de respuesta (o marcar cuál es interna) y arreglar el toast que miente | Es el único hallazgo donde el ERP **afirma** algo falso, no donde le falta algo |
| **8** | Acción **"Acusar recibo y cerrar"** para los feedback de intención `approval` | Hoy cerrar un "Ok!" obliga a inventar una tarea que queda fantasma en el tablero |
| **9** | Revisar por qué la tarjeta del inbox no abre por teclado / click sintético | Si Enter no la abre, es accesibilidad, no automatización |
| **10** | Aviso de completitud en la pestaña Estado (hoy tres de los cinco bloques quedan vacíos sin que nada lo marque) | Un proyecto puede verse prolijo arriba y estar vacío donde importa |
| **11** | Cómo se publica el entregable, como dato del entregable | El ERP sabe la URL pero no el camino de deploy. Sin eso ningún agente puede cerrar el círculo solo |

### Las tools mínimas del MCP (M14), sacadas de lo que hubo que hacer a mano

`listar_feedback(projectId, estado, ronda)` con **ancla y selector incluidos** · `leer_feedback(id)` con hilo y
adjuntos · `crear_tarea_desde_feedback(ids[], titulo, tipo, descripcion)` **aceptando varios feedbacks**, que
es el caso real · `vincular_feedback_a_tarea(feedbackIds[], tareaId)` · `cambiar_estado_tarea(id, estado)` ·
`responder_al_cliente(feedbackId, texto)` — **una sola**, mapeada al camino que escribe `answerText`, no al hilo (ver hallazgo 4) · `cerrar_aprobacion(feedbackId)` · `adjuntar_evidencia(tareaId, archivos[])` · `bump_version(entregableId)` · `convertir_en_pedido(feedbackId, texto, tipo)` · `borrador_reporte_semanal(projectId)` — devuelve el texto, no lo manda.

Regla que no se negocia: **responder al cliente y publicar una versión nunca son automáticos.** En esta
sesión Santiago revisó el texto de la respuesta antes de que saliera, y estuvo bien que así fuera. Las tools
de lectura y de ordenar el tablero pueden ser autónomas; las que hablan con el cliente, no.

### Conecta con lo que ya estaba
- **M15 (Fase 4 agentic)** ya pedía "agente implementador + revisor + aprobación humana". Esta sesión fue
  exactamente eso a mano: 5 subagentes con alcances exclusivos + integración + verificación en navegador.
  Funcionó. El cuello de botella no fue la ejecución, fue **entrar y salir del ERP**.
- **M10 (antes/después con Playwright por ronda)** es la pieza de evidencia que faltó: el trabajo se reportó
  como texto libre en la descripción de la tarea. Con M10, cada ítem resuelto podría mostrar la captura.
- **Cap. 05 (paralelismo)**: el patrón de 5 agentes sobre copias exclusivas de **un mismo archivo**, mergeadas
  por `diff -u` + `patch`, anduvo (1 solo hunk rechazado sobre 39). Gotcha nuevo: los agentes normalizan
  CRLF→LF al escribir, así que **hay que normalizar las dos puntas antes de diffear** o el diff da el archivo
  entero como un solo hunk.

### Para decidir con Santiago en la sesión del ERP
1. ¿"Resuelto" pasa a exigir versión publicada? Es el cambio correcto pero toca el flujo que ya usa el equipo.
2. ¿El MCP escribe en producción o solo en dev-finanzas al principio?
3. ¿Qué puede hacer un agente sin OK? Propuesta: leer y ordenar el tablero sí; responder, publicar y marcar
   resuelto, no.
