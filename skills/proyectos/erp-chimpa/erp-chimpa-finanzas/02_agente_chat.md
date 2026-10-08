# 02 · Agente Chat (bot contable)

La interfaz principal de carga de datos: Santiago escribe/dicta/pega una foto y el sistema arma la entidad financiera. Diseño human-in-the-loop estricto: **la IA solo crea BORRADORES; la creación final ocurre únicamente cuando Santiago aprieta un botón** (enforced server-side, el modelo no tiene tool de confirmar).

## Arquitectura

```
AgentChat.tsx (client/src/components/chat/) = el chat completo, reutilizable
  ├── pages/BotChat.tsx (/bot-chat) = <AgentChat variant="page"/>
  └── AgentWidget.tsx = burbuja flotante abajo a la derecha en TODAS las pantallas (montada en Layout.tsx),
      panel no modal 440×640, atajo Ctrl+J / Cmd+J, Esc cierra, estado abierto/cerrado en localStorage;
      se oculta en /bot-chat. Deduce CONTEXTO DE PANTALLA de la ruta (/proyectos/:id → projectId+name;
      /crm/opportunities/:id → opportunityId+title y el proyecto vinculado si existe) y lo manda en
      body.context de POST /messages → el server lo guarda en meta del mensaje y lo agrega al system prompt
      ("si no menciona otro proyecto, usá este sin preguntar").
  → POST /api/bot-chat/sessions/:id/messages   (texto o media procesada)
  → botChatAgent.sendMessage()
      - historial completo de la sesión → OpenAI gpt-4o-mini con TOOLS (loop máx 5 iteraciones)
      - tools: createDraftFromText | patchDraft | getDraft | listProjectsRecent | listCashboxesByCurrency | listUsers | createTaskDraft | patchTaskDraft
      - guarda TODO en bot_chat_messages (user/assistant/tool, tool_calls en meta)
  → la UI extrae el último resultado de createDraftFromText/patchDraft del meta.toolResults
    y renderiza la DraftPreviewCard con botones según draft.desiredAction
  → botón → POST /api/bot-chat/sessions/:id/confirm {intakeId, desiredAction, cashboxId?}
  → botIntakeService.confirm() — transaccional, con lock FOR UPDATE e idempotencia
```

`botIntakes.parseAndCreateDraft` hace un parseo por REGEX (monto, moneda, fecha, contraparte, proyecto) ANTES de la IA; el prompt obliga al modelo a revisar ese draft y corregir con patchDraft lo que el parser leyó mal. El draft vive en `bot_intakes.parsed` (JSONB): amount, currency (ARS/USD), occurredAt, counterpartyName, concept, projectId, supplierId, categoryId, tagIds, **owner, installmentsTotal, firstDueDate**.

## Las 4 acciones confirmables (enum bot_intake_action)

| Acción | Crea | Notas |
|---|---|---|
| `CREATE_AP_OBLIGATION` | Obligación por pagar | occurredAt = VENCIMIENTO |
| `CREATE_OUTFLOW_MOVEMENT` | Egreso pagado | Requiere cashboxId con moneda compatible |
| `CREATE_AR_OBLIGATION` | Obligación por cobrar | "me deben", "facturé a" |
| `CREATE_FINANCIAL_DEBT` | Deuda financiera + N cuotas | Cuotas mensuales IGUALES, interés none, amortización custom; firstDueDate default = occurredAt + 1 mes. Deudas complejas (interés, sistemas) van por el formulario, no por chat . **Desde 24/9/2026:** si el borrador trae `cashboxId` (la cuenta donde entró el dinero del préstamo; nunca tarjeta de crédito) también crea el ingreso en esa cuenta (`registrarIngresoPrestamo` dentro de la misma transacción). El agente pregunta "¿A qué cuenta te entró el dinero?" si no lo dijo, y la tarjeta tiene el selector con "No entró a ninguna cuenta" por defecto |
| `CREATE_TASK` (sep 2026) | **Tarea del Módulo Trabajo** | Acepta `projectId` y/o `opportunityId` (tarea de preventa sin proyecto; si la oportunidad tiene proyecto vinculado lo usa). NO es financiera: el modelo usa `createTaskDraft` / `patchTaskDraft` (no `createDraftFromText`); `parsed` = {kind:"task", taskTitle, description, projectId+projectName (obligatorio), dueDate, priority, type, estimatedHours, assignedToUserId+assigneeName}; confidence 95 con proyecto / 60 sin (la UI deshabilita el botón). Tool `listUsers` para responsables. Confirm → INSERT en `work_tasks` con `source: "chat"`, `confirmedEntityType: "work_task"`. La UI muestra `TaskDraftCard` (BotChat.tsx) con botón **Crear tarea**. Enum `bot_intake_action` ampliado por SQL (`scripts/sql/2026-09-03_chat_create_task.sql`) y la ruta `/confirm` en routes.ts valida el enum (agregar ahí cualquier acción nueva). |

Titular: el prompt instruye deducir owner del contexto ("me prestó a mí" → santiago; "de la agencia" → chimpance), preguntar UNA vez si es ambiguo, default chimpance **en gastos y cobros**.

**Titular, cuentas repetidas y proyecto por titular (25/9/2026, EN PRODUCCIÓN desde el pase `e1c70ff` del 25/9; commits 8bec36c → 7fa2eb3):** bug de producción: la tarjeta del préstamo mostraba tres "Galicia" iguales (hay una por titular) y la deuda quedaba de Chimpancé en silencio porque "De quién es" estaba oculto en préstamos. Qué quedó:
- **Selectores de cuenta del chat** ("¿A qué cuenta entró el dinero?" y "¿Con qué se pagó?") muestran el titular de cada cuenta (`CashboxOptionLabel`: "Galicia · Santiago (personal)").
- **Préstamo**: la tarjeta muestra "¿De quién es la deuda?"; se completa solo con el dueño de la cuenta elegida; sin titular el botón queda bloqueado ("Elegilo para poder crear la deuda"). El servidor, al confirmar un préstamo sin titular, toma el dueño de la cuenta y, sin ninguno de los dos, tira `VALIDATION_OWNER_REQUIRED`. La deuda **no lleva proyecto**: `draftView` no manda `projectName`/`projectId` en deudas (el modelo lo nombraba igual si lo veía), la tarjeta no muestra el chip y `computeConfidence` no la castiga por el proyecto.
- **Cuenta repetida entre titulares (regla fija, no de prompt)**: en `createDraftFromText`, si la cuenta que eligió el modelo tiene el mismo nombre y moneda que otra activa de otro titular y ni el `rawText` ni el mensaje del usuario de esa vuelta nombran al titular (`mencionaTitular`: Santiago/personal/mío, Chimpancé/empresa/agencia, QueVibra; bordes de palabra con `\p{L}` porque `\b` falla con tildes), el borrador queda sin cuenta ni titular y con el aviso "Hay varias cuentas «X», una por titular…"; el aviso se va solo al elegir titular o cuenta. **Se hizo así porque el modelo ignoraba el prompt** y elegía un Galicia cualquiera.
- **Proyecto por defecto según el titular** (`proyectoPorDefecto` en `server/domains/plata/registrar.service.ts`): Santiago → "Personal – Santiago", QueVibra → "QueVibra – General / Overhead" (antes caía en el de Chimpancé), Chimpancé → "Chimpancé – General / Overhead". Lo usan el motor único (`resolverProyecto`), `updateDraft` del chat, el confirm del chat (si el proyecto fue asumido, lo decide el motor según el titular final) y las cuotas de deudas personales o de QueVibra. En la tarjeta, si el proyecto fue asumido y se cambia el titular, el chip muestra el general del titular nuevo (`DEFAULT_PROJECT_NAME_BY_OWNER` en `ownerMeta.ts`, solo para mostrar).
- Los avisos del borrador se muestran en palabras (`draftWarningText`): nunca más el código `PROJECT_ASSUMED_OVERHEAD` en la tarjeta. "Listo: deuda #N creada" (antes decía "movimiento").
- Test: `tests/titularPorDefecto.test.ts`.

## Decisiones de prompt que costaron aprender (no retroceder)

Están en `SYSTEM_PROMPT` de `server/services/botChatAgent.ts`:
1. **Fecha de hoy inyectada** al final del prompt (timezone AR) — sin esto el modelo pone años pasados (2023). Desde sep 2026 la arma `todayContext()`: hoy + día de semana + los próximos 7 días con su nombre ("viernes 2026-09-04"), porque gpt-4o-mini calculaba mal "el viernes".
2. **occurredAt = vencimiento** para obligaciones, con ejemplo explícito de patch ("vence el 25" → patchDraft) — el parser regex nunca detecta frases relativas.
3. **Crear directo sin preguntar** cuando el mensaje trae todos los datos — la confirmación real es el botón; menos pasos era el pedido explícito de Santiago.
4. **El resumen mostrado debe coincidir con el draft** — el modelo tendía a "decir" datos correctos sin patchearlos.

## Rol collaborator y el chat

Un colaborador puede usar el chat (incluida la burbuja), pero `POST .../confirm` solo le acepta `CREATE_TASK`
(403 para cualquier acción financiera) — las demás acciones del bot son todas financieras. Desde el 12/9/2026 la tarea
puede ir en cualquier proyecto y a nombre de cualquiera: el scoping viejo (solo a su nombre, solo donde tenía trabajo)
se eliminó al invertir el guard del rol (cap. 00 › Roles).

## Hardening existente (mantener al tocar)

Rate limit 20 req/5min por usuario · idempotency keys (TTL 60s, in-memory) · ownership en todos los endpoints · gate de confianza (UI deshabilita confirmar si confidence < 70) · bloqueo de mismatch caja/moneda · rechazo de USD_BNA con warning · máx 4000 chars · audit log de cada tool call y confirmación.

## Multimodal

Audio → `gpt-4o-mini-transcribe` (conversión de formato vía ffmpeg en `server/lib/audioFormat.ts`; el grabador del navegador todavía vive en `client/replit_integrations/audio`, carpeta con nombre histórico). Clave en `OPENAI_API_KEY` (en el `.env` del servidor en la nube).

## Velocidad y comprobantes (12/9/2026)

Santiago se quejó de que el chat respondía muy lento. Diagnóstico: una foto hacía **5 llamadas a OpenAI en fila** (gpt-4o para leer la imagen → createDraftFromText → patchDraft obligatorio → listCashboxes → respuesta) y cada vuelta mandaba **la sesión entera** como historial. Lo que quedó:

- **Modelos** en `server/lib/aiModels.ts`: `gpt-4.1-mini` para conversar y para leer imágenes (antes gpt-4o / gpt-4o-mini). Configurables con `OPENAI_CHAT_MODEL` / `OPENAI_VISION_MODEL` en el `.env`; si la cuenta no tiene el modelo, `withModelFallback` reintenta con gpt-4o-mini.
- **Camino rápido de comprobantes** (`server/services/receiptIntake.ts`): `extractFromImage` (botMediaService) devuelve un `ReceiptExtraction` rico (monto, fecha, comercio limpio, `statementName` tal como figura en el resumen —"MERPAGO*CARREFOUR"—, tarjeta: emisor/red/`last4`, cuotas, si es boleta impaga, `categoryHint`). Con monto legible, **el borrador y la respuesta se arman sin volver a la IA**: caja por `cashboxes.last4` (o por emisor si hay una sola de ese banco), titular = dueño de la caja, categoría por la memoria de comercios, acción = egreso si está pagado / cuenta a pagar si es boleta impaga, proyecto personal si el titular es Santiago. El mensaje del asistente se guarda con `meta.fastPath="receipt"` + `toolResults` con formato de `createDraftFromText` (así la UI dibuja la tarjeta igual). Sin monto → cae al flujo conversacional de siempre.
- **Memoria de comercios** (`category_rules`, `server/services/categoryRules.ts`): `merchantKey()` normaliza el nombre (sin acentos, sin "MERPAGO*", sin S.A./SAU). Se **aprende solo al confirmar** un borrador con categoría (comprobante o texto), dentro de la transacción del confirm; nunca por lo que adivina la IA. `topCategories(scope)` arma los botones sugeridos (más usadas por reglas + últimos 120 días).
- **Tarjeta del borrador** (AgentChat › DraftPreviewCard): muestra el chip de la tarjeta (`PaymentCard xs`), botones "¿De quién es?" si falta titular, y **"¿En qué categoría va «X»?" con botones** + "Otra…" (CategorySelect del ámbito del titular). Lo elegido viaja como `overrides {categoryId, owner}` en `POST /confirm`. Toast "La próxima vez «X» se clasifica solo".
- **Texto**: historial acotado a 24 mensajes (arranca en un mensaje de usuario para no dejar tools huérfanas; resultados de tools recortados a 1500 chars); el system prompt trae el catálogo compacto (`MEDIOS DE PAGO id|nombre|moneda|titular` y `CATEGORÍAS id|fullName|ámbito`) y `createDraftFromText` acepta todos los campos (monto, titular, acción, categoryId, cashboxId…) para dejar el borrador bien **en un solo paso**; patchDraft queda para correcciones. `parallel_tool_calls`, `max_tokens` 700. Si la contraparte ya tiene regla, se aplica sola.
- **Confirm** (`botIntakes.confirm`): un egreso sin titular toma el de la caja; titular Santiago con proyecto supuesto → proyecto personal (y al revés vuelve a Overhead); si el titular del gasto ≠ dueño de la caja, se registra el **pago cruzado** en `inter_owner_ledger_entries` (mismo criterio que obligationService).
- En el cliente, las fotos > 700 KB se achican a 1600 px JPEG antes de subir (`shrinkImage`), y el indicador dice "Leyendo el comprobante…".

## Conversación nueva al abrir el chat (20/9/2026, en dev · commit f1f0d1f)
Decisión de Santiago: no quiere ver el historial cada vez que abre el chat. `AgentChat` revisa **una sola vez al montarse** la última sesión activa y crea una sesión nueva si: (a) el último mensaje es del Chimpa IA y su borrador ya está **confirmado**, o (b) la charla lleva **más de 30 min** quieta (`STALE_CHAT_MS`). **Nunca renueva** si hay un borrador sin confirmar, si el último mensaje es del usuario, o si llega un pedido de afuera (`initialText` / `initialFiles`). Mientras decide muestra el esqueleto (`holdingHistory`) para que no parpadee el historial viejo. Las sesiones viejas quedan en la base (no hay pantalla para verlas: pendiente si Santiago la pide). Solo cliente, sin cambios de API.
