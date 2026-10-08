# 07 · Módulo Trabajo — proyectos, tareas, feedback del cliente y pantalla Hoy (estado al 7/9/2026 noche)

> **Nota 12/9/2026:** ya no hay ambiente local. Donde este capítulo diga "local :5001", `erp-local` o `admin/admin1234`, leerlo como historia: hoy se prueba en https://dev-finanzas.chimpance.digital (ver cap. 01).

Capítulo-resumen para responder rápido "qué se hizo, cómo funciona y qué falta" del módulo de proyectos/tareas/feedback,
sin releer el código ni los capítulos largos. El detalle técnico vive en el capítulo 00 (secciones "Módulo Trabajo",
"Plantillas de proyecto" y "Feedback del cliente" con sus sub-bloques Fase 3b / 3c / M3 / M5 / M4) y el roadmap en el 04.
**Regla de mantenimiento:** cada módulo nuevo que se termine se refleja acá (tabla "Qué está hecho", "Qué falta" y la checklist
de prueba), además de tildarlo en el 04 y describirlo en el 00.

## Para qué existe

Cerrar el círculo **oportunidad → proyecto → tareas → entrega → feedback del cliente → tarea → resuelto**, todo dentro del ERP.
Antes, las tareas vivían en la cabeza y el feedback en WhatsApp/mails. Ahora: el proyecto del ERP es el eje; las tareas cuelgan de
él (o de una oportunidad mientras es preventa); el cliente comenta sobre el entregable real (una web, un PDF, una imagen) desde un
enlace sin cuenta; la IA clasifica, sugiere título/categoría/prioridad/responsable y, si no se entiende, una pregunta; el equipo
decide en el inbox; el cliente ve el estado de cada comentario y aprueba versiones. Se mide cuánto tarda el equipo y cuánto acierta
la IA para que con el tiempo pueda hacer más sola (Fase 4 agentic, todavía lejos).

Principios que no se negocian: **lo que dijo el cliente es inmutable** (el feedback no se edita ni se borra desde el equipo; la
tarea es "cómo lo trabajamos"); **la IA sugiere, el humano decide** (nunca crea tareas ni responde sola); **nada bloquea la recepción**
(si la IA falla, el comentario entra igual); **el cliente nunca ve nada interno** (ni clasificación, ni responsable, ni contexto técnico).

## Dónde vive en la pantalla

| Lugar | Qué hay |
|---|---|
| **Hoy** (`/`, home de TODOS los roles desde el 7/9/2026) | el día de la persona: lista única de prioridades (tareas + seguimientos de leads + cobros/pagos que vencen + feedback sin atender, orden automático), agenda del día (Google Calendar por iCal + tareas tipo Reunión con hora + llamadas/reuniones del CRM), tarea rápida (va al Agente), chips de foco, bloques plegados por sombrero (Operativo / Comercial / Finanzas / Clientes) según rol, toggle Mías/Equipo (admin). El Dashboard financiero viejo pasó a **Finanzas** (`/finanzas`). Ver sección "Pantalla Hoy" abajo |
| **Proyectos › detalle** (`/proyectos/:id`) — el hub | tarjeta **Documentación** (páginas tipo Notion: brief, alcance, minutas, notas; lista a la izquierda, editor a la derecha, autoguardado e historial), tarjeta **Tareas del proyecto** (Kanban/Lista embebidos, botón **Aplicar plantilla**, badges "Plantilla Web"), tarjeta **Entregables y revisión del cliente** (entregables, enlaces mágicos con vencimiento, snippet `</>` del SDK, rondas, "Quién revisó", badge "N novedades sin avisar" + WhatsApp/mailto) |
| **Tareas** (`/tareas`, sidebar › Principal) | todas las tareas: Kanban drag&drop, Lista, "Mis tareas", filtros (Responsable · **Proyecto** · Tipo · Prioridad), **cronómetro** por tarea (botón Iniciar/Detener en la tarjeta, en la columna Cronómetro de la lista y en el detalle), detalle lateral con subtareas, comentarios, horas e historial. `?task=N` abre una |
| **Proyectos › detalle** › tarjeta **Reuniones** | importar la minuta de una reunión (pegada o desde un Doc de Google): la IA la parte en pedidos, se revisan y se crean las tareas. Cada reunión importada abre una **ronda** del proyecto. Ver sección "Importar reunión" abajo |
| **Feedback** (`/feedback`) | inbox de comentarios de clientes: filtros (pendientes / con tarea / respondidos / descartados / eliminados / con respuesta del cliente / por proyecto y ronda), detalle con bloque IA, hilo, línea de tiempo, acciones; botón **Métricas**; **Cargar feedback** a mano (reunión, WhatsApp, mail) |
| **CRM › oportunidad › detalle** | tarjeta **Tareas de preventa** y botón **Crear proyecto** (con plantilla opcional; arrastra las tareas y horas de preventa al proyecto) |
| **Admin › Usuarios** (solo admin) | roles: admin · contador (solo lectura financiera) · vendedor (solo CRM) · **colaborador** (solo sus tareas + chat) |
| **Admin › Plantillas** (solo admin) | Web / Branding / Marketing: fases con horas y vencimientos relativos; editar, duplicar, activar/desactivar |
| **Agente Chat** (burbuja flotante, Ctrl+J) | "creá una tarea para el proyecto X…" → borrador → botón **Crear tarea** (acción `CREATE_TASK`); sabe en qué proyecto/oportunidad estás parado |
| **Campana** (header) | notificaciones internas: feedback nuevo, respuesta del cliente, ronda aprobada, tarea asignada, comentario en tarea, feedback resuelto |
| **Lo que ve el cliente** | página `/review/:token` (dark Chimpancé, sin login, nombre una vez) y el **widget** `review-sdk.js` incrustado en su web real (neutro claro, botón "Dejar comentario", pin sobre el elemento, capturar/grabar/voz, "Mis comentarios", aprobar versión). Demo local: `/review-demo.html?token=…` |

## El flujo de punta a punta (así funciona hoy)

1. **Preventa.** En la oportunidad del CRM se cargan tareas de preventa (o las crea el chat). Cuando se gana, **Crear proyecto** arma el
   proyecto (empresa obligatoria; monto estimado como presupuesto), opcionalmente aplica una plantilla y mueve las tareas de preventa.
2. **Arranque del proyecto.** **Aplicar plantilla** (Web/Branding/Marketing) crea las fases como tareas reales con fecha de inicio +
   días de offset, opcionalmente todas a un responsable (le llega una notificación agrupada). Se agregan, nunca reemplazan.
3. **Trabajo diario.** Kanban/Lista en `/tareas` o dentro del proyecto; subtareas de un nivel; comentarios; horas (0 < h ≤ 24; cargar
   horas pasa la tarea a "en curso"). Los colaboradores ven solo lo suyo. Estados: backlog · todo · in_progress · review · done · canceled.
4. **Entrega.** En el proyecto se crea el **entregable** (web/imagen/PDF, con URL y versión) y un **enlace mágico** (token, vencimiento
   opcional, contacto del cliente). Se abre una **ronda** de revisión (R1, R2… con etiqueta de versión). Para una web real, se pega el
   snippet del SDK en el sitio del cliente.
5. **El cliente comenta.** Desde el enlace o desde el widget sobre la página: pone su nombre una vez, señala dónde (pin anclado por
   selector + texto + posición), escribe, adjunta captura con marcado / video ≤ 90 s / nota de voz (se transcribe sola) / imagen.
   Puede editar o borrar lo propio mientras esté "recibido". Varios empleados del cliente = varias claves de revisor.
6. **La IA clasifica en segundo plano** (gpt-4o-mini, 3-10 s): intención (cambio / bug / pregunta / aprobación / idea / preferencia /
   duplicado / ambiguo), categoría, título sugerido, resumen, prioridad, confianza, duplicado probable, **responsable sugerido** (por
   historial de asignaciones por categoría) y, si es ambiguo o la confianza < 60, **una pregunta para el cliente**.
7. **El equipo decide en el inbox:** **Crear tarea** (prellenada, responsable preseleccionado) · **Vincular** a una tarea existente ·
   **Responder** · **Descartar** (con o sin mensaje al cliente) · **Enviar pregunta al hilo** (un click) · Reabrir · Reclasificar.
   El hilo cliente ↔ equipo queda en el mismo comentario. Cada decisión se registra contra lo que sugirió la IA (overrides).
8. **El cliente ve el estado** de cada comentario: recibido · en curso (tiene tarea) · resuelto (todas las tareas hechas) · respondido ·
   no se hará. Y la línea de tiempo resumida. Cuando hay novedades, el sistema arma el texto del aviso y una persona lo manda por
   WhatsApp/mail (sin SMTP todavía); queda traza.
9. **Aprobación.** El cliente aprueba la versión desde su enlace (o se carga a mano) → la ronda cierra; una ronda nueva cierra la anterior.
10. **Métricas** (botón en `/feedback`): tiempos del equipo (primera acción, feedback → tarea, resueltos), aciertos de la IA (aceptado sin
    cambios, título/categoría/prioridad/responsable mantenidos, intención acertada, duplicados confirmados, preguntas enviadas y
    respondidas) y rondas por proyecto.

## Qué está hecho (cronología)

| Cuándo | Bloque | Commit | Qué entrega | Detalle |
|---|---|---|---|---|
| 3/9/2026 | **Fase 1 · Tareas** | 68dc444 | tareas ligadas a proyecto y/o oportunidad, subtareas, comentarios, horas, Kanban/Lista/Mis tareas, `/tareas`, tarjetas en proyecto y oportunidad, Crear proyecto desde oportunidad | 00 › Endpoints › Módulo Trabajo |
| 3/9/2026 | Chat crea tareas | (2.º commit) | acción `CREATE_TASK`, `TaskDraftCard`, burbuja flotante en todas las pantallas | 02 |
| 4/9/2026 | **Fase 2a · Colaboradores** | 4a9e705 | rol `collaborator`, Admin › Usuarios, guard global de API, scoping en tareas/horas/chat | 00 › Roles |
| 12/9/2026 | **Colaborador ve todo menos la plata** | — | guard invertido a lista negra + redacción de montos; se fue el scoping por visibilidad: el colaborador ve y opera TODAS las tareas, edita documentación, aplica plantillas e importa reuniones (solo las horas siguen siendo propias) | 00 › Roles |
| 4/9/2026 | **Fase 3 · Feedback, primer corte** | e19a4bc | entregables, enlace mágico, página pública, IA de clasificación, inbox con Crear/Vincular/Responder/Descartar | 00 › Feedback |
| 4/9/2026 | **Fase 3b** | e240ded | SDK sobre la web real (pin anclado), rondas con versiones, campana de notificaciones, avisos al cliente con traza | 00 › Feedback › 3b |
| 4/9/2026 | **Fase 3c** | 887d54e | revisores sin login, editar/borrar propios, hilo + línea de tiempo, captura con marcado, video, nota de voz transcripta | 00 › Feedback › 3c |
| 4/9/2026 | Rediseño UX de lo que ve el cliente | 3fe8ae2 + SDK v2.0 | widget neutro claro con acento lima, página /review dark, base 15-16 px, AA, botones con texto | 00 › Feedback › Rediseño |
| 5/9/2026 | Adopción por nombre | — | la clave nueva del navegador se queda con los feedbacks huérfanos del mismo nombre | 00 › Feedback › 3c |
| 5/9/2026 | **M7 · Plantillas** | 1643f8a | Web/Branding/Marketing sembradas, Aplicar plantilla, plantilla al crear proyecto, Admin › Plantillas | 00 › Plantillas |
| 5/9/2026 | **M3 · Overrides + métricas** | 70ff15c | `work_ai_overrides`, `GET /api/feedback/metrics`, botón Métricas (Equipo · IA · Rondas) | 00 › Feedback › M3 |
| 5/9/2026 | **M5 · Contexto técnico** | e84fbc0 | SDK v2.1 manda navegador/SO/pantalla/URL exacta/últimos 10 errores; inbox lo muestra en "Dónde"; tarea prellenada lo trae | 00 › Feedback › M5 |
| 8/9/2026 | **Cronómetro de tareas** | d7c33c1 | contar las horas mientras se trabaja en vez de estimarlas después + filtro por proyecto y copy de los filtros en `/tareas` | esta sección › Cronómetro |
| 8/9/2026 | **Documentación del proyecto** | (8/9) | tarjeta Documentación en el proyecto: páginas con editor tipo Notion, plantillas (Brief / Alcance / Minuta / En blanco), autoguardado, historial con restaurar, soft delete | 00 › Documentación del proyecto |
| 9/9/2026 | **Importar reunión** | (9/9) | minuta de Gemini → ronda + feedback clasificado + tareas + mail para el cliente; tablas `work_meetings` / `work_meeting_items`, migración `0007_importar_reunion` | esta sección › Importar reunión |
| 5/9/2026 | **M4 · Responsable + pregunta** | 93fd4dd | responsable sugerido por historial, pregunta al cliente cuando es ambiguo (un click al hilo), `assignee_changed` en overrides, tiles Responsable/Preguntas | 00 › Feedback › M4 |
| 7/9/2026 | **Pantalla Hoy** (M16) | 9d80044 | home `/` para todos los roles: prioridades del día cruzando tareas/CRM/obligaciones/feedback, agenda con Google Calendar (iCal), bloques por rol con preferencias, fijar arriba / pasar a mañana, hora+duración+link en tareas, el chat entiende la hora; Dashboard → `/finanzas`. SQL `2026-09-07_hoy.sql` + migración `0002_pantalla_hoy` aplicados a pruebas y a real; erp-real reiniciado | sección "Pantalla Hoy" abajo · 00 › Pantalla Hoy |

**Bases y ambientes (histórico; el 8/9/2026 se dieron de baja `erp-real`/`erp-pruebas` y el local pasó a ser `chimpance_local`, creada desde `migrations/`):** todo el SQL del módulo (incluido `2026-09-07_hoy.sql`) está aplicado a `chimpance_pruebas` y a `chimpance_erp`; erp-real reiniciado el 7/9 a las 21:42 con el commit `9d80044` (backup previo automático). El SQL de la versión anterior:
(`scripts/sql/2026-09-03_modulo_trabajo.sql`, `2026-09-03_chat_create_task.sql`, `2026-09-04_feedback_y_colaboradores.sql`,
`2026-09-04b_rondas_pins_notificaciones.sql`, `2026-09-04c_hilos_revisores_adjuntos.sql`, `2026-09-05_plantillas_proyecto.sql`,
`2026-09-05c_ai_overrides.sql`, `2026-09-05d_m4_responsable_pregunta.sql`). erp-real fue reiniciado el 6/9/2026 con el código commiteado
(el boot sembró las 3 plantillas). La base real sigue casi vacía: **Santiago todavía no probó nada del módulo con datos propios**; todo lo
verificado fue con tests automáticos y navegador en erp-pruebas (empresa "ACME Pruebas SA", proyecto "Sitio web ACME", 5 enlaces activos).

## Cómo funciona cada pieza (lo justo para explicarlo)

- **Tareas** (`work_tasks`): `projectId` y/o `opportunityId` (al menos uno, CHECK en la DB), `parentTaskId` un nivel, tipo (design ·
  development · content · marketing · strategy · qa · admin · meeting · other), prioridad (low · normal · high · urgent), `source`
  (manual · chat · feedback · system), horas estimadas, `position` por columna. Cambiar a done/canceled setea `completedAt`/`canceledAt`.
  Horas en `work_time_entries` (con VOID). Dominio `server/domains/work/`, UI `client/src/components/work/` (`TaskWorkspace` es embebible).
- **Plantillas** (`work_project_templates` + `_tasks`): fases con `dueOffsetDays`; aplicar = tareas `source='system'`; traza en `audit_log`
  (`project/template_applied`); seed solo con tabla vacía. Solo admin edita; colaborador 403.
- **El enlace lleva DIRECTO a la web del cliente (8/9/2026, decisión de Santiago):** `GET /review/:token` responde **302 a la URL del entregable** cuando el enlace apunta a una sola web (tipo `web` o `link`, con URL http/https). El cliente aterriza en su propio sitio y comenta con el widget; no ve ninguna página intermedia. Requiere el snippet del SDK pegado en ese sitio. Si el enlace no resuelve a una web única (varios entregables, imagen/PDF, sin URL, enlace vencido o desactivado), sigue mostrando la página `/review/:token` de siempre. **`?panel=1` fuerza la página del ERP** (rondas, aprobar versión, lista completa de comentarios). Lógica en `feedbackService.resolveDirectSiteUrl` (registra el uso del enlace), ruta en `server/routes.ts` antes del catch-all del SPA; tests en `tests/reviewLinkRedirect.test.ts` (11).
- **Sin "página del medio" (25/9/2026, pedido de Santiago; en producción desde el 26/9 sin probar en dev, por decisión de Santiago):** los comentarios se hacen y se gestionan **en el entregable mismo**, no en una página aparte. `/review/:token` sin `#estado` = **la página del entregable**: web → 302 al sitio (widget, que ahora trae **"Aprobar esta versión"** arriba del panel de comentarios); **mapa → el lienzo en solo lectura** (`GET /api/public/review/:token/maps/:id`, solo mapas del entregable del enlace) con botón **"Comentar"** que abre un panel al costado (`MapCommentsPanel`: aprobar, comentar con adjuntos, ver los propios; "¿Dónde?" precargado solo en submapas); PDF/imagen/enlace → título = el entregable, vista previa grande, aprobar y comentarios (se fueron "Revisión de…" y "Lo que hay para revisar"). El **enlace personal del mapa** (`/mapa/:token`, Personas) también tiene "Comentar" si la persona tiene permiso `comment`/`edit`: `GET /api/public/mapa/:token` devuelve `reviewToken` por mapa (el enlace vigente del entregable) y los comentarios viajan por el circuito de siempre con el nombre de la persona. `#estado` (`?panel=1#estado`) = **solo el Estado del proyecto**, sin pestañas (se borró `SpaceNav`) ni chip de nombre, con una lista nueva **"Entregables"** (`deliverables[]` en `/status`: id, name, type, version, openUrl) con "Abrir y comentar"; "Revisar y aprobar" lleva a `/review/:token?panel=1`. Código: `useReviewSpace` (toda la lógica de comentar/aprobar) + `CommentsList` en `client/src/components/review/`; `feedbackService.activeLinkTokenForDeliverable` y `rootMapIds`. Sin migración.
- **Entregables y enlaces** (`work_deliverables`, `work_review_links`): token base64url de 24 bytes, vencimiento opcional, desactivable,
  `contactName/Phone/Email` para los avisos. Un enlace puede ser de un entregable o de todo el proyecto.
- **Feedback** (`work_feedback`): `source` (review_link · sdk · manual: meeting/whatsapp/email…), `anchor` jsonb (pin + `tech`), `roundId`,
  `reviewerId`, adjuntos en `work_feedback_attachments` (archivos en `uploads/feedback/`, gitignoreado), mensajes del hilo en
  `work_feedback_messages`, vínculo N↔N con tareas en `work_feedback_task_links`. Estados internos: new · triaged · converted · answered ·
  dismissed (+ `deletedAt` si el autor lo borró). `clientStatus` se **deriva** (no se guarda): recibido / en_curso / resuelto / respondido /
  no_se_hara.
- **IA** (`feedbackAi.ts`): un solo prompt devuelve intención, categoría, título, resumen, prioridad, confianza, duplicado (validado contra
  los abiertos del proyecto), responsable (validado contra usuarios activos, fallback por historial) y pregunta (solo ambiguo o confianza
  < 60). Se guarda en columnas `ai_*` + `ai_json`. Reclasificar vuelve a correrla. Sin `aiIntent` no hay override.
- **Overrides y métricas** (`work_ai_overrides`, `metrics.service.ts`): una fila por decisión (converted · linked · answered · dismissed) con
  snapshot IA vs. final y flags `title/category/priority/assignee_changed`, `intent_matched`, `accepted_all`. Métricas en SQL crudo por
  proyecto y ventana (30/90/365/todo).
- **Rondas** (`work_review_rounds`): una abierta por scope; abrir cierra la anterior salvo aprobada; feedback nuevo cae en la abierta (si
  no hay, se abre la N+1 sola); aprobar desde el enlace o a mano; `versionLabel` actualiza la versión del entregable.
- **Revisores** (`work_reviewers`): clave uuid en el navegador del cliente (`chimp_reviewer_key`) + nombre; `mine/canEdit`; la clave es
  global por navegador (si entra a otro enlace, la fila se muda de proyecto).
- **Notificaciones internas** (`work_notifications`, polling 30 s, dedup 60 s) y **avisos al cliente** (`work_client_notices`: texto
  armado + `whatsappUrl`/`mailtoUrl` + traza; sin SMTP).
- **API pública** (`/api/public/review/:token`, CORS `*`, rate limit 300 req/10 min **por visitante** + 3.000 por token, desde el 8/9/2026): ver, mis comentarios, pins por URL,
  crear/editar/borrar propio, responder en el hilo, adjuntos, aprobar, registrar revisor. Nunca devuelve campos `ai*` ni `tech`.
- **Roles**: admin todo · colaborador solo Tareas/Chat (lo suyo) · vendedor ve solo lectura las tareas de sus oportunidades · contador nada
  de Trabajo. Guards reales en el server (`roleGuard.ts`), el front solo espeja.

## Pantalla Hoy (7/9/2026) — cómo funciona

Nació del pedido de Santiago "un dashboard de tareas con las prioridades del día y las reuniones", con un wireframe lo-fi validado antes de
codear (`docs/modulo-trabajo/wireframe-hoy.html`, dos vistas: admin y CTO). Decisiones de Santiago: es la **home** (el Dashboard financiero
pasa a "Finanzas"), Google Calendar se **vincula** (empezamos por la dirección secreta iCal, solo lectura; OAuth para crear eventos queda para
después), por defecto se ven **las mías**, y el tablero tiene que ser "súper completo pero simple" para él (vendedor + contador + dev a la vez)
y reducido para el CTO (solo gestión de proyectos).

- **Una sola lista** ("Prioridades de hoy", tope 7 + contador) mezcla los cuatro sombreros con una etiqueta por ítem (Tarea / Lead / Cobro /
  Pago / Feedback / Cliente). Orden automático: **fijado > vencido > urgente > alta > normal > baja, lo de hoy primero**. Reglas cruzadas:
  cobro que vence hoy = urgente; cobro vencido = urgente + vencido; pago que vence hoy = alta; seguimiento de lead vencido = alta; feedback con
  más de 24 h sin respuesta = alta; respuesta del cliente sin ver = alta. Las vencidas van en un plegable arriba con contador rojo. Entran a la
  lista: tareas vencidas, de hoy, fijadas y las urgentes/altas sin fecha; tareas de CRM vencidas o de hoy; obligaciones de hoy y vencidas
  (tope 8, ordenadas por monto); un ítem por proyecto con feedback pendiente. El check marca hecha (tarea o seguimiento de CRM) sin abrir;
  "Mañana" pasa el vencimiento; el pin fija arriba (`work_tasks.pinned_at`).
- **Unirse a la videollamada y abrir el evento (10/9/2026)**: el chip **Unirse** ya no depende de que Google
  registre la videollamada: si no hay `hangoutLink` ni `conferenceData`, se busca el link **dentro de la descripción
  y la ubicación** con `MEETING_URL_RE` (Meet, Zoom, Teams, Whereby, Jitsi, Webex). Ese es el caso de las reuniones
  con clientes que usan Zoom o Teams, donde el organizador pega el link en el texto. La regex vive en
  `googleEventMap.ts` (módulo puro) porque la comparten las dos ramas de la agenda. Además, el **título del evento
  linkea a ese evento en Google Calendar** (`htmlLink`, solo los que vienen de la cuenta conectada): es la salida
  para cuando el link está en un formato que el detector no reconoce.
- **Crear una reunión desde la agenda (10/9/2026)**: el ícono de calendario pasó a la izquierda del título (abre
  "Calendarios de la agenda", donde se tilda qué calendarios se ven) y a la derecha quedó un **+** que abre
  `NuevaReunionDialog`: título, día, desde/hasta, participantes y descripción. Crea el evento en el Google Calendar
  del usuario **con link de Meet** e invita por mail (Google manda la invitación). Los participantes salen de
  `GET /api/work/people`, que junta TRES fuentes sin repetidos: **los contactos de Google del usuario**
  (People API: `connections` guardados + `otherContacts`, la gente a la que le escribio pero nunca guardo —
  scopes `contacts.readonly` y `contacts.other.readonly`, cacheados 10 min y filtrados en memoria para que el
  buscador responda sin ir a Google en cada tecla), contactos de clientes con mail + los del equipo que conectaron su cuenta (la tabla
  `users` NO guarda email, el del equipo sale de `user_google_accounts`; al que no conectó se le escribe el mail a
  mano). **Solo crea el evento, NO una tarea del ERP** — decisión de Santiago: la agenda ya junta eventos y tareas
  tipo Reunión, así que crear las dos cosas mostraría la reunión duplicada en el día; lo de después de la reunión
  lo cubre "Importar reunión". Al crear se limpia la caché de la agenda para que aparezca al instante.
- **Agenda del día (fuente cambiada el 10/9/2026)**: si el usuario conectó su cuenta de Google en `/perfil`, la agenda lee **en vivo** de la
  API de Calendar (calendario principal, `calendarService.eventsForUser` bifurca ahí) y ésa manda sobre los feeds iCal — con las dos activas los
  eventos se verían duplicados. Ventajas sobre el iCal: aparece al toque (el iCal tarda hasta 15 min), no hay URL secreta que buscar, y trae los
  **invitados** de cada reunión (se muestran como "con Fulano +2" y son la base del futuro botón de armar un Meet hacia el cliente). Caché de 60 s
  por usuario (`clearGoogleAgendaCache` al conectar/desconectar). Si Google falla, se loguea y **cae a los feeds iCal**: la pantalla nunca se rompe.
  El mapeo de la respuesta de Google vive puro y testeado en `googleEventMap.ts` (11 tests): descarta cancelados y sin fecha, y pone los eventos de
  día completo a medianoche UTC como el iCal (si no, caen un día antes). Tres fuentes en una línea de tiempo con marca de origen — eventos del calendario,
  tareas tipo Reunión con `due_time` (+ `duration_min`, `meeting_url`) y tareas del CRM tipo llamada/reunión (`crm_lead_tasks.due_at`).
  Marcador "ahora", "Mañana" abajo. Acciones por evento: Unirse (link de videollamada, detectado de Google Meet/Zoom/Teams), Proyecto /
  Oportunidad / Lead, **Cargar feedback** (abre `/feedback?projectId=&manual=1` con el formulario manual ya abierto) y **Crear tarea**
  (formulario prellenado con el proyecto y la fecha).
- **Google Calendar**: diálogo "Calendarios conectados" (ícono de calendario en la agenda): se pega la *dirección secreta en formato iCal*
  (Configuración → Integrar calendario); el server la valida (https/webcal, nada de hosts privados), la lee al conectar y cada 15 min
  (`node-ical`, recurrencias expandidas, ventana −7/+60 días, filas reemplazadas por feed en cada sync, un error no borra lo anterior), y
  **vincula por nombre** cada evento con un proyecto, empresa u oportunidad del ERP (para que aparezcan los botones). La URL nunca vuelve
  completa a la UI (se enmascara). Santiago va a pasar su dirección cuando quiera: se pega desde la pantalla, no hace falta código.
- **Sombreros por rol** (decide el server, `hatsForRole`): admin/operator → Operativo, Comercial, Finanzas, Clientes + toggle **Mías/Equipo**;
  **colaborador → solo Operativo con lo suyo** (sin Clientes por ahora: el rol no entra al inbox de feedback, 403); vendedor → Operativo (sus
  tareas) + Comercial; contador → solo Finanzas. Cada usuario puede **ocultar y reordenar** bloques (engranaje → `users.dashboard_prefs`).
  Los **chips de foco** filtran la lista y muestran solo ese bloque abierto. Los bloques arrancan plegados con su resumen en el título.
- **Tarea rápida**: el texto se manda al Agente (evento global que abre el widget con el mensaje "Creá una tarea: …") → borrador → botón
  Crear tarea. El chat ahora entiende la **hora** (`dueTime` en `createTaskDraft`/`patchTaskDraft`, normalizada "10.30"/"15hs" → HH:MM) y
  la tarea creada entra en la agenda.
- Navegación por día (← →, "Volver a hoy"); "hoy" se calcula en hora Argentina (UTC−3 fijo) tanto en el server como en el front.

## Documentación del proyecto (8/9/2026) — cómo funciona

**Para qué**: que el brief y todo lo escrito del proyecto vivan al lado de las tareas y los entregables, y no en un Drive suelto o en
la cabeza de alguien. Cada proyecto tiene sus **páginas**: el brief, el alcance, minutas de reunión, notas.

- **Dónde**: `/proyectos/:id`, tarjeta **Documentación** (arriba de Entregables). Lista de páginas a la izquierda, editor a la derecha;
  el botón de panel oculta la lista para escribir más ancho.
- **Arrancar una página**: botón **Nuevo documento** → *Brief del proyecto* · *Alcance y entregables* · *Minuta de reunión* · *En blanco*.
  Cada plantilla trae los títulos y las preguntas ya escritas, para completar y no empezar de cero. Con el proyecto sin documentación,
  la tarjeta muestra los cuatro botones directamente.
- **Escribir**: editor visual (no hay que saber markdown). Barra con título/subtítulo, negrita, cursiva, tachado, link, listas,
  **checklist**, cita, código y separador; y atajos al tipear: `# ` título, `- ` lista, `1. ` numerada, `> ` cita, ` ``` ` código, `---` separador.
- **Guardado**: solo, mientras se escribe (indicador *Guardando… / Guardado hace X / Sin guardar*). Título e ícono (emoji) se cambian
  en el encabezado del documento.
- **Menú ⋮**: *Ver historial* (copias previas cada 10 min de edición o cambio de autor, con **Restaurar** — lo actual se guarda antes),
  *Duplicar*, *Eliminar* (soft delete, con confirmación).
- **Quién puede**: admin y operador editan; el **colaborador** solo lee, y únicamente en proyectos donde tiene tareas.
- **Qué falta / futuro**: buscar dentro de la documentación desde el buscador global, adjuntar imágenes dentro del documento,
  compartir una página con el cliente (hoy la documentación es interna), y que el chat pueda redactar el brief desde una reunión.

## Importar reunión (9/9/2026) — cómo funciona

**El pedido de Santiago**: Gemini graba las reuniones y deja la minuta en un Doc de Google (resumen, decisiones, próximos
pasos y la transcripción completa). Que la IA lea eso, separe **lo que tenemos que hacer nosotros** —volcado directo a la tabla
de tareas, clasificado por proyecto y con la clasificación que ya usa la IA— de **lo que tiene que hacer el cliente**, que sale
como un mail listo para mandar. **Decisión de diseño de Santiago: "debería ser como una ronda de revisión"** → una reunión ES
una ronda del proyecto.

- **Dónde**: `/proyectos/:id`, tarjeta **Reuniones** (arriba de Documentación). Botón **Importar reunión**; la lista muestra
  las reuniones anteriores con "Sin confirmar" o "N tareas".
- **Cómo entra el texto**: dos solapas. *Pegar la minuta* (funciona siempre) o *Link del Doc* (lee el documento con la cuenta de
  Google del usuario, scope `documents.readonly`, pestañas incluidas). Sin `GOOGLE_CLIENT_ID`/`SECRET` la solapa del link avisa
  que hay que pegar el texto (cap. 09). Mínimo 200 caracteres.
- **Dos pasos, siempre** (mismo principio que el chat y el feedback: la IA sugiere, el humano decide):
  1. **Leer la reunión** (`POST /api/work/meetings/parse`, gpt-4o-mini, 8-15 s) deja un **borrador**: `work_meetings` +
     `work_meeting_items`. No crea ni una tarea. Devuelve resumen, decisiones, dudas abiertas, los pedidos de cada lado y el mail.
  2. **Crear N tareas** (`POST /.../confirm`) es lo único que escribe en el resto del ERP.
- **Qué pasa al confirmar**:
  - se abre una **ronda** del proyecto llamada `Reunión DD/MM` (cierra la abierta anterior, como cualquier ronda nueva);
  - cada punto **nuestro** entra como `work_feedback` con `source: "meeting"` y los campos `ai_*` ya cargados (intención `change`,
    categoría, título, prioridad, confianza, responsable) y se convierte en tarea con `feedbackService.convertToTask` → queda el
    vínculo feedback↔tarea, el audit y el override, y el cliente ve el estado de cada cosa que pidió;
  - cada punto **del cliente** tildado deja una tarea nuestra `Esperando de <cliente>: …` (tipo admin, `source: "meeting"`,
    asignada a quien importó);
  - la minuta se guarda como página **Minuta DD/MM** en la Documentación del proyecto (kind `minutes`, con link al Doc original);
  - un solo aviso al equipo (no uno por punto).
- **El mail**: lo redacta la misma pasada de IA con el tono de Chimpancé (ustedes, sin "su/sus", en positivo). Editable antes de
  confirmar; botones Copiar / Abrir en el mail / WhatsApp. Si la IA no lo devuelve, hay un texto de respaldo armado en código.
- **Lo que se aprendió del prompt** (no retroceder): con la minuta de Gemini el modelo tendía a **copiar los "Próximos pasos"**
  ya agrupados y devolver una sola tarea "Actualizar página web". El prompt ahora prohíbe agrupar, dice explícitamente que esa
  sección es un resumen que no se copia, y trae un ejemplo de cómo partir un próximo paso en cuatro ítems. Con eso, la reunión
  de More Trac del 8/9 pasó de **3 ítems a 10 nuestros + 2 del cliente**, cada uno con su cita textual.
- **Trazabilidad**: cada ítem guarda la frase de la reunión (`quote`), que va al mensaje del feedback y a la descripción de la tarea.
- **Reglas duras**: un borrador se puede editar y destildar entero; confirmar dos veces devuelve 422
  (`VALIDATION_ALREADY_IMPORTED`); lo destildado queda `dismissed` y no vuelve a aparecer; el colaborador no importa reuniones (403).
- **Qué falta**: una pantalla global de Reuniones (el endpoint ya lista todas sin `projectId`), importar sobre una oportunidad del
  CRM (hoy pide proyecto), enganchar el envío del mail cuando haya SMTP, y probar el camino del Doc de verdad (bloqueado por las
  credenciales de Google del cap. 09).

## Coordinar reunión · Meeting Polls (Fase 4, 20/9/2026) — cómo funciona

**Para qué**: juntar a cuatro personas en un horario sin la cadena de WhatsApp. Reemplaza el
"¿el martes te sirve?" × 4 por una propuesta de horarios que cada uno marca por su cuenta.

**Dónde vive**: Proyecto → pestaña **Reuniones**, arriba de "Importar reunión" (que es otra cosa:
esa es la minuta de DESPUÉS). Del lado del cliente, la página pública `/reunion/:token`.

### El flujo

1. **Coordinar reunión**: título, duración, participantes y los horarios propuestos (entre 2 y 10).
   Los participantes salen de cuatro lados, en este orden: contactos del proyecto → otros contactos
   de la empresa → equipo (solo los que tienen Google conectado) → invitado suelto (nombre y mail,
   no queda cargado como contacto). Cada uno arranca como **requerido** y se puede pasar a opcional.
2. Al crear se mandan las invitaciones por el **Gmail de quien organiza**, un mail por persona, cada
   uno con **su** link. La pantalla los muestra para copiarlos, y quedan guardados: se vuelven a ver
   con **Ver los links** en la matriz.
3. **La persona abre su link y marca "Disponible / No disponible"** en cada horario. Sin cuenta, sin
   contraseña, sin nada que completar: el token ya dice quién es. Puede volver y cambiarlo mientras
   la coordinación siga abierta. Ve los horarios en la zona de su navegador, con una nota discreta
   si difiere de la zona de la propuesta.
4. El equipo ve la **matriz** (tabla en la compu, tarjetas en el celular): ✓ / × / — por persona y
   horario, el resultado ("3 de 3 disponibles", "Requeridos: 2 de 2") y, aparte del voto, el
   **conflicto de Google Calendar** de cada interno. El mejor horario se destaca con "El que más
   cierra"; nada se auto-confirma.
5. **Confirmar este horario**: se revalida la agenda, se crea el evento en el Google Calendar del
   organizador con link de Meet, y **Google** manda las invitaciones (no se manda un segundo mail).
   La coordinación queda cerrada y deja de aceptar respuestas.

### Fase 2: quiénes están invitados y cómo van eligiendo (21/9/2026)

Sale de un pedido real: Dardo (Prome) abrió su link y preguntó si el mail les había llegado a los
demás, porque el `Para:` lleva una sola dirección (cada uno lleva SU link). Y avisó lo obvio: sin
ver al resto, cada uno marca a ciegas. Santiago decidió abrir la pantalla pública.

- **El mail** (invitación y recordatorio) suma una línea con los **nombres de pila** de los demás
  —"También invitamos a Dardo, Ezequiel y Maribel."— y cierra con "Cuando estén todas las
  respuestas confirmamos el horario que le sirva a la mayoría y les llega la invitación al
  calendario". Las **direcciones de los demás no entran en ningún mail**. La inicial del apellido
  se agrega solo cuando dos invitados se llaman igual ("Santi C." y "Santi P.").
- **La pantalla pública muestra la misma grilla que el organizador**: los invitados con nombre
  **y mail**, "3 de 4 respondieron", quién votó qué, y "El que más cierra". En la compu es una
  tabla con la columna propia en lima (la única que se toca); en el celular, tarjetas con
  "Pueden 3 de 4" y los tres grupos. Tres estados distinguidos: ✓ puede · ✕ no puede · — todavía
  no contestó.
- **Ninguna acción de gestión en la pública**: reenviar, recordar, confirmar y cancelar siguen
  siendo del organizador.
- **Proponer otro horario = una nota**, no un horario nuevo (`meeting_poll_participants.suggestion`,
  migración 0039, tope 300). Le llega un aviso al organizador (`meeting_poll_suggestion`) y se ve
  arriba de la matriz. NO toca la grilla a propósito: un horario nuevo obliga a reescribirles a
  todos los que ya votaron. Si al organizador le sirve, agrega el horario y reenvía.
- **Cómo se lee sin leer** (ajustes del 21/9 tras probarlo con Santiago, que dijo "tengo que leer
  para entender"): la **columna propia va primera** y se llama **VOS** (también en el celular y en
  la lista de invitados); **solo la columna propia tiene palabras** ("Puedo" / "No puedo") y las
  ajenas son símbolos apagados; la última columna dice **cuántos pueden** y nada
  más ("4 de 10", chiquito y a la derecha: la barra y los puntitos que tenía antes se robaban la
  pantalla); en la lista de invitados, **un tilde marca al que ya contestó** (al que falta no se le
  pone nada); la fila que más cierra lleva **fondo y barra lima**; los
  **días se agrupan** en un renglón en vez de repetir la fecha; y la nota es una **tarjeta con el
  campo a la vista**, no un link. Las dos grillas (la pública y la del organizador) van sobre la
  **tabla estándar** `components/ui/table` —flechas ‹ ›, 1ª y última columna fijas—, así que la 1ª
  columna es el horario **y** tus botones y la última el resumen: son las que quedan a la vista con
  10 invitados. **Ninguna pantalla reimplementa el desplazamiento de una tabla.** El DS solo aporta
  `tbl--matriz` (el renglón del día y la fila que más cierra), y ojo: **`client/src/styles/ds.css`
  es generado, lo que se escribe ahí a mano se lo lleva la próxima regeneración** (ya pasó con la
  v1.10).
- **Lo que sigue sin salir por el link**: ids, tokens, `meetUrl`, el proyecto, la empresa, el
  organizador, los conflictos de calendario de los nuestros, `required` y las notas ajenas. El DTO
  se arma a mano en `publicPoll.ts` y el barrido lo custodia `tests/meetingPollPublico.test.ts`;
  el porqué del cambio está escrito en los dos archivos y en el contrato.

### Lo que hay que saber sí o sí

- **Los links quedan a mano y no se rompen solos (21/9/2026).** Lo que valida la entrada sigue
  siendo el hash (sha-256), pero al lado se guarda una copia del token **cifrada** con la bóveda del
  playbook (`clientes/vault.ts`, columna `meeting_poll_participants.token_cipher`, migración 0038).
  Por eso:
  - **Ver los links** en la matriz los muestra las veces que haga falta, sin cambiar ninguno. Queda
    auditado (`links_viewed`), porque ver el link de alguien es poder responder por esa persona.
  - **Reenviar invitación** manda EL MISMO link, y **Recordar a los que faltan** también. Antes los
    dos rotaban el token, así que el link que la persona ya tenía en el mail moría sin que nadie le
    avisara: descoordinaba la reunión. Reenviar ya no pregunta nada porque ya no rompe nada.
  - **Anular y mandar otro** (`rotate: true`) es la rotación, ahora explícita y confirmada. Es para
    cuando el link llegó a quien no iba. Las respuestas que la persona ya dejó se conservan.
  - Las coordinaciones **anteriores al 21/9/2026** no tienen copia: la pantalla dice que ese link no
    se puede mostrar (sigue funcionando) y ofrece mandar uno nuevo. Lo mismo pasaría si alguna vez
    cambia `VAULT_KEY`: se pierde poder mostrarlos, nunca el link en sí.
  - Quién puede: el mismo permiso que administrar la coordinación (organizador, responsable del
    proyecto o admin). `GET /api/work/meeting-polls/:id/links`.
- **Sin Google conectado no se puede crear la coordinación.** Es a propósito: si el organizador no
  va a poder confirmar después, mejor que se entere antes de mandar los mails.
- **El conflicto de calendario avisa, no decide.** Tres estados: libre, ocupado y *no verificable*
  (el que no tiene Google conectado, o Google que no contestó). Un conflicto nunca esconde un
  horario ni bloquea la confirmación; al confirmar se vuelve a chequear y, si apareció uno nuevo, se
  muestra y se puede confirmar igual.
- **Confirmar dos veces no crea dos reuniones.** Hay un candado en la base y, sobre todo, el evento
  se crea en Google con un id determinístico: un reintento lee el que ya existe.
- **Si Google crea el evento y el ERP no lo puede guardar**, el error lo dice con todas las letras,
  muestra el link de Meet y deja el rastro en la auditoría. No se esconde detrás de "error interno".
- El pedido al cliente (`pick_slot`, "Estamos coordinando la próxima reunión") aparece en el Espacio
  del Cliente **sin botón**: los links son personales y no se pueden meter en un portal compartido.
  Se cierra solo al confirmar.

### Volver a escribirles: la aclaración del organizador (21/9/2026)

Sale de otro pedazo del mismo caso de Prome: la invitación salió un mail por persona, **una invitada
creyó que era solo para ella y armó la reunión por Meet invitando al resto**. Reenviar el mismo
texto no alcanzaba: había algo que explicar y el mail no tenía dónde decirlo.

**El primer pantallazo del detalle** (22/9/2026, en producción; Santiago: "las acciones que tengo que hacer no las veo"): la matriz abre con una **barra de acciones**: un solo botón principal "Confirmar <día> <hora> · pueden X de N" (el horario que más cierra, solo si al menos uno puede), "Ver como lo ven ellos", "Recordar a los N que faltan" y un menú **Más** (Volver a escribirles · Links de cada uno · Cancelar coordinación). "Faltan responder" es una línea de nombres, sin botones. **Reenviar** (mismo link) y **Anular y mandar otro** (con confirmación) viven ahora por persona en "Links de cada uno" (`LinksDialog` + `ListaDeLinks`). El botón "Cancelar coordinación" del pie desapareció: está en Más.

**Ver como lo ven ellos** (22/9/2026, en producción): la pantalla pública no tiene una dirección única —se entra con el link personal de cada invitado—, así que la lista y el detalle devuelven `myUrl` (tu propio link, si estás invitado; `null` si no; no audita porque es el propio) y aparece un botón secundario "Ver como lo ven ellos" al lado de cada tarjeta de la lista y arriba del detalle, que abre `/reunion/<token>` en otra pestaña. Pendiente decidido a futuro: una vista de organizador de solo lectura para cuando el organizador no está invitado (cap. 04).

En la matriz, arriba a la derecha (al lado de **Ver los links**), **Volver a escribirles**. Abre un
diálogo con tres cosas: a quiénes les llega (**todos** por defecto, también los que ya contestaron),
un campo obligatorio "Qué les querés aclarar" (600 caracteres, con un texto de ejemplo a un click) y
el aviso del link. El mail que sale es **el de siempre** con la aclaración **arriba de todo**,
apenas después del saludo y destacada con una barra lima: si lo nuevo va al final, la persona lee el
mail que ya leyó y cierra.

Lo que NO cambia: el **asunto** (para que caiga en el mismo hilo de Gmail), el **link** de cada uno y
el resto del cuerpo. Y **no gasta recordatorios ni pasa por sus topes**: esto no es insistir, es
avisar. La aclaración **queda guardada en la auditoría** (`invited`, campo `note`): si alguien
pregunta qué se les dijo, la respuesta está en el ERP y no en el Gmail de alguno.

Es `POST /meeting-polls/:id/invite` con `note`. Para una coordinación anterior al 21/9 (sin copia
recuperable del token) el reenvío genera links nuevos; el diálogo lo avisa antes y el toast dice a
cuántos les llegó uno nuevo.

### Los topes se miden contra la reunión, no contra el mail (21/9/2026)

También de un caso real, que encontró Santiago: invitación mandada a las 20:11 con horarios
propuestos para el día siguiente al mediodía. Con el tope de 24 h **desde la invitación**, el
recordatorio a los que faltaban se habilitaba **después** de la reunión. La regla no estaba mal:
estaba atada a la fecha equivocada.

Ahora manda el **horizonte**: cuánto falta para el horario propuesto más cercano que todavía no pasó
(`urgency` en el detalle: `horizonMs`, `short`, `tooClose`, `passed`).

| Horizonte | Desde la invitación | Entre recordatorios | Máximo |
|---|---|---|---|
| Más de 48 h | 24 h | 24 h | 2 |
| Entre 4 y 48 h (**ventana corta**) | 2 h | 4 h | 3 |
| Menos de 4 h | no se manda nada: el mail no llega, hay que llamar | | |

Dos motivos nuevos: **`too_close`** ("Falta muy poco para la reunión: mejor llamarlo") y
**`slots_passed`** ("Los horarios propuestos ya pasaron"), que se ven en el botón apagado y en la
lista de "no le va a llegar a". Y la advertencia de horario hábil **desaparece en ventana corta**:
si la reunión es mañana al mediodía, escribir a las 20:11 no es inoportuno, es lo único que sirve.

### El cuarto tono: "la mayoría ya eligió" (21/9/2026)

Lo pidió Santiago y probablemente sea el mejor de los cuatro. Cuando **hay un horario que puede la
mayoría**, faltan **dos o menos** y la reunión es **ya** (ventana corta), el recordatorio deja de
pedir "marcá tus horarios" y pasa a decir el horario **con todas las letras**, asunto incluido:
*"¿Podés martes 22 a las 12?"*. El cuerpo dice cuántos pueden y pide **una sola cosa**: que conteste
si puede o no. El cierre también cambia: "con eso cerramos el horario y les llega la invitación al
calendario".

Para que se dispare, el horario que más cierra lo tiene que poder la mayoría de los que YA
contestaron (`mejorYes >= max(2, 60 % de los que respondieron)`): si están repartidos, todavía no
hay nada que anunciar y vuelve a ser un empujón suave.

**Ojo con el consejo que le dimos a Santiago**: si ocho de diez ya pueden y faltan dos, muchas veces
conviene **confirmar** el horario en vez de insistir. A los dos que faltan les llega la invitación
del calendario de Google con el Meet adentro, que es bastante más difícil de ignorar que otro mail.

### Recordarle a los que faltan (20/9/2026)

En la matriz, **Recordar a los que faltan**. Antes de mandar muestra a quiénes les va a llegar y a
quiénes todavía no corresponde, con el motivo. **Es a mano**: el automático quedó escrito y para
después, cuando Santiago vea si el botón le alcanza.

El principio, que decidió él: *un recordatorio es un favor, no una campaña. Si molesta, la próxima
vez no abren el link.* De ahí salen los topes, y de ahí sale que los haga cumplir el servidor
(`server/domains/work/polls/reminder.ts`) y no la pantalla.

Reglas duras:

- Solo a los que **no respondieron**, y solo con la coordinación **abierta**.
- Mínimo **24 h desde la invitación**. Sin excepción: aunque los otros cuatro contesten en una hora,
  al quinto no se le escribe el mismo día.
- Mínimo **24 h desde el recordatorio anterior**.
- Máximo **2 por persona** y por coordinación. Nunca un tercero.
- **Reenviar la invitación a mano NO gasta un recordatorio**, pero sí corre el reloj de las 24 h.

El horario hábil (lunes a viernes, 9 a 18, hora de Argentina) es una **advertencia** en el botón
manual —si Santiago decide escribir a las 22, es su decisión y la pantalla se lo dice— y va a ser
regla dura el día que esto lo mande un reloj.

El texto cambia solo según la situación: *"ya nos respondieron todos menos vos"* cuando falta uno
solo (es el que funciona, porque es concreto y es cierto), *"estamos por cerrar los horarios"* si
vence en menos de 48 h, y *"te dejamos de nuevo el link, por si se traspapeló"* si faltan varios.
Nunca "urgente", "última oportunidad" ni "no respondiste": del otro lado hay un cliente ocupado.

**Ojo (corregido el 21/9/2026)**: el recordatorio **ya no rota el token**: manda el mismo link, igual que reenviar. Lo que sigue abajo es el razonamiento viejo, cuando sí rotaba. Es lo único posible teniendo solo
el hash, y a quien no contestó un link viejo que muere no le cuesta nada. La pantalla lo avisa.
Vale siempre el último mail que la persona recibió. Se evaluó guardar el token de forma recuperable
para no romper el link viejo y se descartó: obligaría a guardar un secreto reversible sólo para
ahorrarle una molestia menor a quien todavía no contestó.

**La reserva (lo que hace que dos clicks no manden dos mails).** Chequear con `canRemind` y después
escribir deja una ventana: dos requests casi simultáneas leen el mismo estado, las dos pasan, y a la
persona le llegan DOS mails, se le gastan DOS recordatorios y el segundo le rota el token otra vez,
así que el link del primer mail nace muerto. Por eso el envío no se decide leyendo: se **reserva**
con un UPDATE condicional que lleva todas las reglas en el WHERE y rota el token en la misma
operación (mismo patrón que el candado de `confirm.service.ts`). Gana la que devuelve fila; la otra
relee y reporta el motivo en `skipped`. Si después el mail no sale, el recordatorio **se devuelve**
(el token no: eso no tiene vuelta atrás, por eso el fallo se muestra para reintentar).

Del otro lado, cuando **responde el último**, la campana ya no dice "fulano marcó sus horarios"
sino **"Ya respondieron todos: podés confirmar"**: es el momento en que hay algo para hacer.

Ese aviso es una **TRANSICIÓN, no un estado**. Pide dos condiciones: que esa persona no hubiera
contestado antes **y** que ahora no falte nadie. Sin la primera, cualquiera que corrigiera su voto
lo volvería a disparar, porque seguirían estando todos. A quien corrige se le avisa distinto
("cambió su disponibilidad"). Aparte, `notificationService` agrupa: no repite un aviso del mismo
tipo y entidad si el anterior sigue sin leer y tiene menos de un minuto — es una red, no el
mecanismo.

### Lo que NO hace todavía (a propósito)

Recordatorios **automáticos** (el botón a mano sí está, ahora con la ventana corta; el disparo solo
espera a que haya un reloj en el ERP), **agregar o cambiar horarios** de una coordinación ya creada
(hoy solo se puede cancelar y crear otra), **editar el título o la descripción** desde la pantalla
(la API lo permite, la UI no), "tal vez", reprogramar, cancelar el evento
de Google, varias cuentas de Google, elegir otro calendario, FreeBusy, auto-confirmar y sugerencia de
horarios con IA.
Cancelar la coordinación sí se puede, mientras no esté confirmada.

### Dónde está el código

- Contrato: `docs/modulo-trabajo/contrato-api-meeting-polls.md`.
- Base: `meeting_polls`, `meeting_poll_slots`, `meeting_poll_participants`, `meeting_poll_votes`
  (migración `0033_coordinacion_de_reuniones.sql`). Instantes en `timestamptz`; el fin de un horario
  no se guarda, sale de `startsAt + durationMin`.
- Reglas puras compartidas: `shared/meetingPoll.ts` (topes, `tallySlot`, `rankSlots`, `effectiveStatus`).
- Servidor: `server/domains/work/polls/` — `token.ts`, `meetingPoll.service.ts`, `publicPoll.ts`
  (DTO público puro), `inviteEmail.ts`, `availability.ts` (Google), `confirm.service.ts`,
  `poll.routes.ts` y `publicPoll.routes.ts`.
- Cliente: `client/src/components/work/polls/` (interno), `client/src/pages/ReunionPublica.tsx` +
  `client/src/components/reunion/` (público), catálogo en `client/src/lib/meta/meetingPolls.ts`.
- Tests: `tests/meetingPoll*.test.ts`, `tests/reunionPublica.test.ts`, `tests/meetingPollsUi.test.ts`.

## Qué falta (ordenado como el plan vigente del capítulo 04)

| Prioridad | Pendiente | Qué es | Depende de |
|---|---|---|---|
| **Ya, cuando Santiago pueda** | Probar con datos propios | recorrer la checklist de abajo en producción (https://finanzas.chimpance.digital) o en dev-finanzas; anotar "M0" (pulido XS, uno por hallazgo) | — |
| ~~Ya~~ | ~~Conectar el Google Calendar de Santiago~~ | HECHO el 10/9/2026: se conecta la cuenta desde `/perfil` (panel de Conexiones, cap. 09) y la agenda lee de ahí. El iCal queda como respaldo | — |
| Hoy · fase 2 | Vista semana, reordenar arrastrando, crear eventos en Google (OAuth), "buen día" automático por Telegram/mail, bloque Clientes para colaboradores (requiere darles acceso al inbox de sus proyectos) | | M8 / M12 para el aviso |
| Etapa A | **M1** puesta a punto operativa | en producción: confirmar la password del admin con el CTO y crear los usuarios reales del equipo (colaboradores) | Santiago (2 min) |
| ~~Etapa B~~ HECHO 8/9/2026 | Rate limit público por visitante | 300 req/10 min por clave de revisor o IP + 3.000 por token (commit 5151230) | — |
| Etapa B | Piloto con UN cliente | contra **dev-finanzas** (ya es pública con HTTPS, sin túneles); snippet en el sitio del cliente (candidato MT Agro) | M1 |
| Siguiente módulo | **M6** marcado sobre la página + resaltado de texto | rectángulo/flecha sobre el DOM y highlight de texto anclados como el pin, visibles para el equipo (`anchor.marks[]`) | M5 ✅ |
| Local | **M11** dependencias, hitos y vistas guardadas | "bloqueada por", hitos con fecha, filtros guardados en Tareas, tablero por proyecto | — |
| Local | **M10** antes/después + revisión responsive | captura server-side con Playwright por ronda y breakpoint, comparación lado a lado | Chromium en el droplet para producción |
| Local | **M9** extensión de navegador | inyecta el SDK en sitios donde no se puede pegar el script | — |
| Local | **M14** servidor MCP del ERP | proyectos, tareas, feedback y rondas como tools para Claude | — |
| Local, no prioritario | **M13 / Fase 2b** costo por hora + rentabilidad real | costo por usuario con vigencia, costo real por tarea/proyecto, margen real, alerta horas > estimado (decisión de Santiago: las horas no son prioridad) | — |
| Necesita 1 token | **M8** agente por Telegram (long polling) | mismo bot, sesión por chat, botones inline; foto/audio por el mismo pipeline | token de BotFather |
| Necesita proveedor | **M12** email automático | avisos al cliente y resumen diario al equipo (hoy el aviso lo manda una persona) | SMTP/Resend |
| Deploy | **M2** ERP público en el droplet | necesario para que un cliente real use el enlace/SDK sobre su web (con localhost solo funciona la demo) | CTO |
| Lejos | **M15** Fase 4 agentic | agente implementador + revisor + aprobación humana, empezando por copy | M3 + M14 + meses de historial |
| Menores | marcador "visto" por revisor en el schema · tarjeta de borrador del chat no refresca tras confirmar (bug 3 del cap. 03) · pin del SDK sin `tech` en anchors viejos (cosmético) | | |

**Decisiones ya tomadas (no re-preguntar):** el módulo vive dentro del ERP y se construye acá (no Replit, no producto aparte) · habrá
colaboradores con roles que carguen horas, sin apuro · costo por hora no es prioridad · desde el 8/9/2026 el camino es local → dev-finanzas → producción
(la premisa vieja de "nada de push ni deploy" quedó sin efecto) · lo que Santiago no pueda probar se verifica solo (curl + Playwright en el local :5001).

## Checklist para probarlo cuando puedas (≈ 20 minutos, en dev-finanzas o producción)

0. **Hoy** (al entrar): mirá la lista de prioridades y la agenda; conectá tu Google Calendar desde el ícono de calendario; probá el check, "Mañana", el pin, los chips de foco, el engranaje (ocultar un bloque), Mías/Equipo, y la tarea rápida ("Llamar a X mañana 10:30"). Entrá como colaborador y fijate que vea solo lo suyo.
1. **Admin › Usuarios**: creá un colaborador real. **Admin › Plantillas**: revisá las fases de "Web" (¿faltan pasos de Chimpancé? ¿horas realistas?).
2. **Proyectos › un proyecto nuevo › Aplicar plantilla** Web con fecha de inicio y responsable → mirá las tareas en `/tareas` (Kanban) con vencimientos.
3. **CRM › una oportunidad con empresa › Crear proyecto** eligiendo Branding → aparece el proyecto con las tareas.
4. En el proyecto: **Entregables › nuevo** (URL de una web tuya) → **enlace** → abrilo en una ventana privada: poné tu nombre, comentá algo claro
   ("achicar el título del hero"), algo vago ("esto está raro") y una aprobación ("perfecto así"); probá captura con marcado y nota de voz.
5. **`/feedback`**: en unos segundos cada uno trae intención, título, prioridad, **responsable sugerido**; el vago trae la **tarjeta ámbar
   con la pregunta** → "Enviar pregunta al hilo" → en la ventana del cliente aparece en el hilo; contestá desde ahí → badge "Respuesta del cliente".
6. El claro → **Crear tarea** (viene con responsable) → en la ventana del cliente el comentario pasa a "En curso"; cerrá la tarea → "Resuelto".
7. La aprobación → **Responder**. En el proyecto: **Rondas › Aprobar esta versión** (o desde el enlace del cliente).
8. Botón **Métricas** en `/feedback`: tiempos, "Aceptado sin cambios", Responsable, Preguntas, Rondas.
9. Demo del widget: `/review-demo.html?token=TU_TOKEN` → "Provocar error de prueba" → comentar → en el inbox "Dónde" muestra navegador/errores.
10. Chat (Ctrl+J) parado en el proyecto: "creá una tarea de diseño para revisar el hero, para Juan, vence el viernes" → confirmar.

Anotá cada cosa que moleste: eso es un "M0" (sesión chica de pulido).

## Tests reproducibles (contra el local :5001, `PYTHONIOENCODING=utf-8`)

| Test | Checks | Qué cubre |
|---|---|---|
| `python scripts/tests/test_m3_api.py 2` | 24 | overrides por convertir/vincular/responder/descartar + `/metrics` |
| `python scripts/tests/test_m5_api.py` | 26 | `anchor.tech` saneado, oculto al cliente, visible al equipo |
| `python scripts/tests/test_m5_e2e.py [TOKEN]` | 19 (Playwright) | demo → errores → comentario → inbox "Dónde" → tarea prellenada |
| `python scripts/tests/test_m4_api.py 2` | 33 | responsable sugerido, pregunta, `POST /ask`, `assignee_changed`, métricas, nada filtra a lo público |
| `python scripts/tests/test_m4_e2e.py 2` | 19 (Playwright) | tarjeta de pregunta, envío al hilo, badges, preselección en Crear tarea, tiles de métricas |
| `scratchpad/test_m7.py` (sesión del 5/9) | 30 | plantillas: listar/aplicar/crear proyecto con plantilla/admin |

Gotchas al testear: la IA real tarda 3-10 s (esperar `aiIntent` antes de pisar por SQL); tildes por `psql` desde la consola de Windows
rompen (`invalid byte sequence`): usar textos sin tildes en los UPDATE; el rate limit público es 300/10 min por clave de revisor (cambiar la clave o reiniciar
:5001); Playwright: loguear por API, cerrar el onboarding, `chimp-review` con `state="attached"` (cap. 03).

## Dónde está el código

| Qué | Dónde |
|---|---|
| Tareas, horas, plantillas | `server/domains/work/` (`work.routes.ts`, `tasks/task.service.ts`, `time/timeEntry.service.ts`, `templates/`) · `client/src/components/work/` · `client/src/pages/Tareas.tsx` |
| Pantalla Hoy, calendario iCal | `server/domains/today/` (`today.service.ts` arma el día por rol; `calendar.service.ts` feeds/sync/vínculo por nombre; `today.routes.ts` = `/api/today`) · `client/src/pages/Hoy.tsx` · `client/src/components/today/` (`todayMeta.ts`, `CalendarFeedsDialog.tsx`) · pin/postpone en `work.routes.ts` · hora en el chat: `botChatAgent.ts` + `botIntakes.ts` (`normalizeTime`) · wireframe `docs/modulo-trabajo/wireframe-hoy.html` |
| Feedback, IA, rondas, hilo, adjuntos, revisores, overrides, métricas, avisos | `server/domains/feedback/` (`feedback.service.ts` ~1.500 líneas es el corazón; `feedbackAi.ts`; `public.routes.ts` = API del cliente) · `client/src/pages/FeedbackInbox.tsx` · `client/src/components/feedback/` (`feedbackMeta.ts` = labels/estados) |
| Lo que ve el cliente | `client/src/pages/ReviewPublic.tsx` + `client/src/components/review/` (tokens dark) · `client/public/review-sdk.js` (widget, ~1.100 líneas, vanilla + Shadow DOM) · `client/public/review-demo.html` |
| Notificaciones | `server/domains/notifications/` · campana en `Layout` |
| Proyecto y oportunidad | `client/src/pages/ProyectoDetalle.tsx` (tarjetas Tareas / Entregables) · `CrmOpportunityDetalle.tsx` (Tareas de preventa, Crear proyecto) · `server/domains/crm/opportunities/opportunity.service.ts` (`create-project`) |
| Chat → tareas | `server/domains/bot-chat/` (`createTaskDraft`), `BotChat.tsx` (`TaskDraftCard`) |
| Documentación del proyecto | `server/domains/work/docs/` (`projectDoc.service.ts`, `docTemplates.ts`) · rutas al final de `work.routes.ts` · `client/src/components/work/docs/` (`ProjectDocsCard.tsx`, `RichTextEditor.tsx`) · estilos `.doc-editor` en `index.css` |
| Importar reunión | `server/domains/work/meetings/` (`meeting.service.ts` = orquesta; `meetingAi.ts` = prompt; `meetingParse.ts` + `meetingText.ts` = puros y testeados; `googleDoc.ts` = API de Docs) · rutas `/api/work/meetings*` al final de `work.routes.ts` · `client/src/components/work/meetings/` (`MeetingsCard.tsx`, `MeetingImportDialog.tsx`) · tests `tests/meetingImport.test.ts` (17) |
| Schema | `shared/schema.ts` (tablas `work_*`, `project_docs`, `project_doc_versions`) · SQL aplicado en `scripts/sql/2026-09-0[3-5]*.sql` |
| Documentos fundacionales | `docs/modulo-trabajo/investigacion-feedback-to-execution.md` (deep research 1/9/2026) + `investigacion-growth-sales-os.md` |

## Cómo pedir cosas sobre este módulo

- "Cargá el skill erp-chimpa-finanzas y hacé el módulo M6" → una sesión = un módulo (cap. 04).
- "Explicame cómo funciona [las rondas / la pregunta al cliente / el responsable sugerido]" → responder desde este capítulo + el 00, sin abrir código.
- "Qué falta del módulo de proyectos" → la tabla "Qué falta" de arriba, en ese orden.
- "Explicame la pantalla Hoy / por qué esto está arriba / cómo conecto el calendario" → sección "Pantalla Hoy" de este capítulo.
- "Probé X y pasó Y" → registrar como M0 en el 04, corregir en pruebas, aplicar a real, tildar.
- Cualquier cambio de schema: SQL manual a pruebas → real (cap. 01), nunca drizzle push.


## Cronómetro de tareas (8/9/2026)

Antes las horas se cargaban a mano y de memoria. Ahora se pueden contar mientras se trabaja: **▶ Iniciar** en la tarjeta del
tablero, en la columna **Cronómetro** de la lista o en el detalle (bloque Horas), y **■ Detener y cargar** cuando terminás.
Mientras corre, el reloj se ve en la tarjeta, en el detalle y en un **indicador lima en el header** (visible en toda la app,
con el nombre de la tarea, link a ella y botón para detener) para que nadie se lo olvide corriendo.

Reglas del dominio:
- **Un cronómetro por usuario** (unique en `work_task_timers.user_id`). Arrancar en otra tarea **detiene el anterior y le carga
  las horas** (el aviso dice cuánto y en cuál).
- Al detener nace un `work_time_entries` normal (mismo circuito de siempre: rentabilidad, anulación con VOID, historial). La nota
  que haya escrita en "Qué se hizo" del detalle viaja al registro.
- **Menos de un minuto se descarta** (no ensucia con registros de 0). **Tope de 24 h** por si quedó olvidado: se cargan 24 y la
  nota lo aclara. La **fecha** del registro es el día argentino en que se **empezó**, no en el que se detuvo.
- **Arrancar mueve la tarea a "en curso"** (igual que cargar horas a mano). No se puede arrancar en tareas canceladas ni hechas.
- La **X** al lado de Detener descarta el cronómetro sin cargar nada (pide confirmación).
- Todo queda en el historial de la tarea: `timer_started` / `timer_stopped` / `timer_discarded`.

Dónde vive el código: `server/domains/work/time/timer.service.ts` (+ `timer.math.ts`, matemática pura testeada en
`tests/taskTimer.test.ts`), rutas `GET /api/work/timer`, `POST /api/work/tasks/:id/timer/start`, `POST /api/work/timer/stop`,
`POST /api/work/timer/discard`; en el front `client/src/components/work/useTaskTimer.tsx` (provider único montado en `App.tsx`,
un solo reloj y una sola consulta para toda la app) y `TaskTimerButton.tsx` (botón + indicador del header).
Migración `0006_cronometro_tareas.sql`.

**Filtros de `/tareas`**: se sumó **Proyecto** (lista solo los proyectos que tienen tareas en la vista, más "Sin proyecto
(preventa)") y las opciones "todos" pasaron a llamarse Responsable / Proyecto / Tipo / Prioridad.

## Acciones en lote: tareas y feedback (30/9/2026, en `dev`, sin migración)

Tildar varias filas y hacerles lo mismo a todas. Nació de una minuta importada que dejó 25 tareas sueltas: sacarlas
de a una era media hora.

**Dónde está**: lista y tablero de tareas (`/tareas` y los de adentro de un proyecto o una oportunidad), bandeja de
feedback (`/feedback`) y comentarios del cliente dentro de cada entregable.

**Cómo se usa** (patrón único, `client/src/components/ds/selection.tsx`): una casilla por fila (en el feedback aparece
al pasar el mouse, para no tapar el anillo de estado), una casilla “Seleccionar todos” arriba, **clic con Shift** para
agarrar un rango, y una barra abajo que dice cuántos son y qué se les puede hacer, con **Limpiar** siempre a mano. En
el celular las casillas aparecen recién cuando hay algo tildado; la selección arranca desde *Seleccionar varias* de la
hoja de mantener apretado (en feedback, desde “Seleccionar todos”). Piezas: `useSelection`, `SelectBox`, `SelectionBar`.

**Tareas** (`POST /api/work/tasks/bulk`): cambiar estado, asignar responsable, mover el vencimiento (hoy / mañana / en
una semana / sin fecha), **descartar** (queda cancelada con motivo opcional, se reabre) y **eliminar**.

**Eliminar tareas es nuevo** (antes solo se podía cancelar). `DELETE /api/work/tasks/:id` y la acción en lote borran de
verdad la tarea **y sus subtareas**, con sus comentarios, cronómetros y dependencias; sueltan (sin borrar) lo que solo
la mencionaba: los renglones de una minuta importada, el registro de aciertos de la IA y las horas de soporte.
**El freno**: no se elimina lo que tiene rastro de trabajo real — horas cargadas, horas de soporte o haber nacido de un
feedback del cliente. En esos casos el server contesta `VALIDATION_TASK_HAS_WORK` diciendo cuál y por qué, y la
pantalla ofrece descartarla. El botón *Eliminar* también está en el detalle de la tarea.

**Feedback** (`POST /api/feedback/bulk`): **descartar** (motivo interno obligatorio, uno para todas), **eliminar** y
**restaurar**. Eliminar del lado del equipo es **borrado lógico** (`deleted_at`, el mismo que usa el autor): sale de la
bandeja, aparece en el filtro *Eliminados* y desde ahí vuelve con *Restaurar*. No deja eliminar un comentario que ya
tiene una tarea vinculada: eso se descarta. También quedaron sueltos `POST /api/feedback/:id/delete` y `/restore`.

**Lo que falla en uno no frena a los demás**: las dos rutas devuelven `{ done, skipped }` y `skipped` trae el título y el
motivo de cada uno. La pantalla muestra lo hecho en un snackbar y lo que quedó afuera en un toast, en vez de fallar todo junto.

**Código**: `server/domains/work/tasks/task.service.ts` (`family`, `deleteBlocker`, `remove`, `bulk`),
`server/domains/feedback/feedback.service.ts` (`removeByTeam`, `restore`, `bulk`), `client/src/components/ds/selection.tsx`,
`TaskTable`, `TaskBoard`/`TaskCard`, `TaskWorkspace`, `TaskDetailSheet`, `FeedbackInbox`, `DeliverableFeedbackList`.

**Ojo**: se probó entero en el ambiente local (:5001). No llegó a dev-finanzas porque desde el 26/9 los deploys de
GitHub Actions están cortados por facturación.

## Dependencias entre tareas (29/9/2026, en `dev`, migración 0047)

Hasta ahora una tarea solo podía **colgar** de otra (subtarea, `parent_task_id`). Ahora dos tareas **hermanas del mismo
proyecto** se pueden atar: *"esta no arranca hasta que aquella esté lista"*. Tabla `work_task_dependencies`
(`task_id` = la que espera, `depends_on_task_id` = a la que espera).

**La regla que define todo: el ERP AVISA, no traba.** Al pasar una tarea a *En curso*, *Revisión* o *Hecha* con algo
pendiente antes, el server responde `VALIDATION_DEPENDENCIA_ABIERTA` nombrando lo que falta, el front pregunta
*"Esta tarea está esperando a otra"* y ofrece **Seguir igual** (reenvía con `forceDependencies: true`) o **Volver**.
Una dependencia mal cargada no puede dejar a nadie clavado. **Cancelar y volver atrás nunca preguntan**: no son arrancar.

Reglas del dominio:
- Solo entre tareas del **mismo proyecto** (o de la misma oportunidad, si todavía no hay proyecto): `VALIDATION_DEPENDENCIA_CONTEXTO`.
- **Sin vueltas redondas**: si A espera a B, ni B ni nada que cuelgue de B puede esperar a A (CTE recursiva,
  `VALIDATION_DEPENDENCIA_CICLO`). Las que armarían una vuelta **ni aparecen** en el selector (`dependency-candidates`).
- Nada de esperarse a sí misma ni repetir el par (`_MISMA`, `_REPETIDA`, más `unique` y `check` en la base).
- Al **terminar o cancelar** una tarea, al responsable de la que quedaba esperando le llega el aviso
  *"Ya podés arrancar: …"* (`task.unblocked`), solo si no le queda ninguna otra pendiente.
- Queda en el **historial de las dos tareas** (`dependency_added` en la que espera, `dependency_blocks` en la otra).

Dónde se ve:
- **Detalle de la tarea**: aviso ámbar arriba (*"Antes hay que terminar otra tarea"*, con el link a la que falta) y sección
  **Depende de** (`0/1 listas`) con lo que espera, el botón *Esperar a otra tarea* y, al pie, **Están esperando esta tarea**.
- **Tablero y lista**: marca de *esperando* (reloj de arena) en las tareas que tienen algo pendiente antes
  (`blockedByOpenCount`, que viaja en el listado).

Código: `server/domains/work/tasks/dependency.service.ts`; los estados salieron a `tasks/taskStatus.ts` para que los dos
services los compartan sin importarse en círculo (`task.service` los sigue re-exportando). Rutas
`GET /api/work/tasks/:id/dependency-candidates`, `POST /api/work/tasks/:id/dependencies`,
`DELETE /api/work/tasks/:id/dependencies/:dependsOnTaskId`. En el front, el hook `client/src/components/work/usePatchTarea.tsx`
envuelve **todos** los cambios de estado (detalle, tablero y pantalla Hoy) para hacer la pregunta y reintentar.
Pruebas: `tests/dependenciasEntreTareas.test.ts` (7).

## Entregable como madre (23/9/2026, EN PRODUCCIÓN desde el 24/9/2026, migraciones 0042–0043)

Rediseño de la pestaña **Entregables** del proyecto pedido por Santiago después del caso Mendive (se confundían "rondas del proyecto" con "rondas del entregable"): **el entregable es la madre**. Cada tarjeta trae adentro su **enlace del cliente** (nace con el entregable, `POST /deliverables` acepta contacto y `createLink:false`), sus **rondas** (`RoundsSection` con `deliverableId`) y sus **comentarios** (`DeliverableFeedbackList`: filtro por estado del cliente y por ronda, acciones Crear tarea / Responder / Descartar, "Ver detalle" abre la bandeja con `?id=`). Desaparecen las secciones sueltas "Rondas del proyecto" y "Enlaces de revisión"; los enlaces viejos de todo el proyecto quedan plegados si existen.

- **Regla del motor**: un comentario con entregable cae SIEMPRE en la ronda abierta de ese entregable (o se abre una); nunca en una del proyecto (`round.service.ensureRoundForFeedback`).
- **Pedidos sin entregable** (reuniones importadas, carga manual): franja al pie + `AssignFeedbackDialog` → `POST /api/feedback/:id/assign { deliverableId }` o `{ projectScoped: true }` ("del proyecto", columna `work_feedback.project_scoped`, migración 0043) o descartar. `GET /inbox?deliverableId=none` los lista. **Importar reunión ya no abre rondas del proyecto**: los pedidos nacen sueltos.
- **Migración 0042 (datos)**: en proyectos con exactamente un entregable activo, enlaces, rondas (no las de reuniones) y comentarios del proyecto pasan a ese entregable. En producción (24/9) movió en Mendive el enlace + 2 rondas + 25 comentarios al "Design System" (verificado: 25 pins en el sitio); los 5 pedidos de la reunión quedaron en la franja "Pedidos sin entregable".
- Los diálogos de acción de la bandeja viven en `components/feedback/FeedbackActionDialogs.tsx` (+ `feedbackTaskText.ts`), compartidos por `/feedback` y la tarjeta.
- Maqueta validada: `docs/design-system/propuestas/entregables-madre/`. Fase 3 pendiente: sugerencia del Chimpa IA en Asignar, asignar al importar la reunión, bandeja → entregable.
- **Widget del cliente** (`review-sdk.js`, en producción 23/9): filtro por estado con tooltips en el panel Comentarios.

## Mapas: lienzo de nodos por entregable (24/9/2026, migración 0044; EN PRODUCCIÓN desde el 26/9/2026, pase sin probar en dev por decisión de Santiago)

**Para qué**: lo que hicimos a mano para Comunidad Prome (un HTML de 600 KB con 8 áreas, 36 flujos, documentos y comentarios que
Claude editaba y copiaba en tres lugares) vive ahora adentro del proyecto como una herramienta. Pedido de Santiago: "una herramienta
para crear mapas de sitio, user flows, casos de uso… como en Miro, que se actualice sola y con permiso de ver/comentar/editar al cliente".
Maqueta validada: `docs/design-system/propuestas/mapas/maqueta.html`.

- **Dónde**: entregable de tipo **`mapa`** (`work_deliverable_type` sumó `mapa`). En la pestaña Entregables aparece "Abrir el mapa" →
  `/mapas/entregable/:deliverableId` (resuelve o crea el mapa raíz) → `/mapas/:id` (editor a pantalla completa, dentro del shell).
- **Modelo** (`shared/maps.ts` + `server/domains/work/maps/`): `work_maps` (raíz por entregable, índice único con `parent_node_id IS NULL`;
  un **submapa** es otro `work_maps` cuyo `parent_node_id` es el nodo que lo abre), `work_map_nodes` (kind, label, subtitle, number, status
  idea·proposed·approved·in_progress·done·future, actor, description, url, `meta` jsonb ≤ 32 KB con capa técnica/docs/tags, x/y/width/height,
  `group_node_id`, borrado lógico), `work_map_edges` (`child` = jerarquía, **varios padres por nodo** desde el 25/9 (feedback del CTO: el «+» soltado sobre otro nodo SUMA una línea, nunca muda; para mudar se borra la línea vieja; el padre principal = conexión más vieja, `primaryChildEdges`, manda en Numerar y radial), sin círculos (`wouldCycle` recorre todos los antecesores); `flow` = "lleva a" con etiqueta),
  `work_map_versions` (foto completa raíz + submapas; al guardar actualiza `work_deliverables.version`).
- **Moldes** (`MAP_MOLDS`): sitemap (árbol), usecases (radial), userflow y process (carriles por actor), free. El molde define la paleta,
  la conexión por defecto y cómo acomoda (`client/src/components/maps/layout.ts`, dagre + radial propio + carriles).
- **Editor** (`client/src/components/maps/MapEditor.tsx`, React Flow `@xyflow/react`) — **rediseño 25/9/2026 "No me hagas pensar"** tras el
  feedback del CTO (menos formulario, más lienzo): **pantalla completa** sin el shell del ERP (`/mapas/:id` se resuelve en `AppShell` después del
  login, como `/app`), barra fina (volver, nombre editable, versión, guardado, Técnica, Acomodar, ojo = ajustar, importar, guía, extras).
  **Sin moldes ni tipo de conexión que elegir**: paleta única (`PALETTE` en `shared/maps.ts`: Nodo, Decisión, Inicio, Fin, Actor, Grupo, Nota; los
  tipos viejos siguen valiendo, `anyKindOf`) y **el gesto decide** la conexión: manija «+» abajo = colgar (child; un clic sin arrastrar = agregar
  debajo, detectado en `onConnectEnd` por distancia < 6 px), manija «→» a la derecha = lleva a (flow, abre el texto de la línea al soltar).
  **Edición en la tarjeta** con doble clic (nombre, número, subtítulo; `InlineEditor` en `MapNodes.tsx`; Enter guarda, Esc cancela; los primeros
  700 ms ignora el blur que provoca React Flow). **Texto de la línea sobre la línea** (`MapEdges.tsx`, doble clic). **Ficha cerrada** hasta tocar un
  nodo (`NodePanel`: estado y actor como chips, descripción, enlace, submapa, capa técnica plegada, Borrar); Esc o el vacío la cierran. **Supr borra
  con Deshacer** (`restoreNode` devuelve nodo + conexiones borradas en el mismo instante; barra 8 s). **Acomodar = menú** árbol · radial · carriles
  (`LAYOUTS`, guarda `settings.layout`) + **Numerar** (`autoNumber` → `setNumbers`, raíz única sin número). Lienzo vacío = tarjeta "Escribí el primer
  nodo". Tab hijo · Enter hermano · F2 editar · Supr · Esc, a nivel documento. Gotchas: React Flow deja los nodos `visibility:hidden` hasta medirlos
  y con las recargas la medida se perdía → `.mp-canvas .react-flow__node{visibility:visible!important}` + se conserva `measured` al reconstruir;
  el clic de pane que dispara React Flow al soltar una conexión se ignora 500 ms para no perder la selección del nodo recién creado.
  **Arreglos 25/9 tarde (feedback del CTO "no entiendo la flecha de la derecha")**: mientras se arrastra una manija, `MapConnectionLine`
  (`MapEdges.tsx`, `connectionLineComponent`) dibuja un cartelito junto al cursor con lo que pasa al soltar; la «→» soltada en el vacío crea ahí
  un nodo unido con `flow` (`addFlowNodeAt`, `createNode` con `edgeKind:"flow"`); la «lleva a» es **siempre curva** (en ángulo recto rodeaba
  tarjetas). Gotcha: React Flow 12 solo arranca una conexión si el mouse se mueve > `connectionDragThreshold` (1 px) → el clic quieto en el
  «+» no disparaba `onConnectEnd`; ahora el «+» tiene `onClick` propio (`onAddChild`) y `connectOnClick={false}`.
- **API con sesión** (`/api/work/maps…`, `map.routes.ts`): `GET /maps?deliverableId=` · `GET|PATCH /maps/:id` · nodos (`POST`, `PATCH /:nid`,
  `PATCH /positions`, `DELETE`, `POST|DELETE /:nid/submap`) · edges · `POST /import` · `POST /import-json` · versiones.
- **Acceso del cliente = SIEMPRE desde Personas** (decisión de Santiago 24/9): `work_client_access` (proyecto × `company_contacts`, único),
  permiso `view|comment|edit` **por proyecto**, enlace personal con token de 32 bytes: hash sha-256 valida, copia cifrada (vault) para volver a
  mostrarlo, `rotate` para uno nuevo. Solo contactos de la empresa del proyecto (`VALIDATION_CONTACT_COMPANY`). Sin contraseñas.
  Rutas: `GET /projects/:pid/access`, `GET …/access/candidates`, `POST …/access`, `PATCH /access/:id`, `POST /access/:id/link|rotate`.
  UI: `ShareDialog` (botón Compartir del editor). El enlace se muestra en la fila al darlo o copiarlo.
- **Página pública** `/mapa/:token` (`MapaPublico.tsx`, fuera del shell; API `/api/public/mapa/:token…`, en `PUBLIC_PREFIXES`): mismo editor,
  solo lectura o edición según el permiso (editar: nodos, conexiones, submapas, nombre; **no** molde, importar, versiones ni permisos).
  Con varios mapas en el proyecto muestra la lista; `?map=ID` abre uno. 404 genérico para todo token inválido; rate limit 600/10 min por token+IP.
- **PROME**: `scripts/mapas/html-mapa-a-json.mjs <mapa.html> salida.json` convierte el mapa viejo (TREE/DIAGRAMS/DOCS/PLAN) al JSON de
  importación: 276 nodos, 38 user flows, 45 fichas con docs. El JSON queda en `C:\Users\santi\Downloads\Comunidad prome\mapa-prome.json`
  (fuera del repo, es confidencial); se importa desde el editor con Importar › JSON completo.
- **Guía adentro del editor** (24/9, pedido de Santiago: "quiero ver la guía ahí mientras testeo"): botón **Guía** en la barra (solo equipo) abre en la
  columna derecha `MapGuide` con «Cómo funciona» y el «Guion de prueba» (22 pasos con qué hacer / qué tiene que pasar, marcas Pasó/Falló, nota por paso,
  avance en `localStorage`, «Copiar reporte» para pegar en el chat). Se abre sola la primera vez en cada navegador. Contenido en `guideContent.ts`;
  al cambiar el editor, actualizar ahí los pasos. También hay guía de onboarding para `/mapas` en `onboardingContent.ts`.
- **Chimpa IA en el mapa** (25/9/2026, en producción desde el 26/9, sin migración; revisado con ux-chimpa y probado con los documentos reales de
  Mendive: mapa de sitio A/B y user flow de 5 recorridos). Decisiones de Santiago: los nodos **vienen armados** (nombre, subtítulo
  = ruta si el documento la da, descripción) y **sin estado**, salvo «Futuro» cuando el documento lo deja para después (Fase B,
  alcance propuesto); la **cara del Chimpa IA reemplaza al ícono de Importar** en la barra (lista/rutas/JSON quedan en «Más formas
  de importar»); mapa vacío = botón «Armar con Chimpa IA»; **mapa con nodos = la IA compara** y la vista previa dice
  **Ya está · Cambia (antes → ahora) · Nuevo**, nunca borra (lo que no está en el documento solo se avisa).
  - Flujo: elegir página de la Documentación (arranca en la primera) o pegar texto → «Leer con Chimpa IA» (renglones grises +
    Cancelar real con AbortController) → vista previa con tildes (nuevo destildado = se va con sus hijos; cambio destildado = el nodo
    queda como está) → «Agregar N nodos» / «Aplicar N nuevos y M cambios» → barra **Deshacer** 10 s.
  - Código: `shared/mapAiDraft.ts` (puro: `shapeMapDraft(raw, existing)`, `draftChangeOf`, `countDraft`, `keptEdges`, `draftToApply`,
    `similar`), `server/domains/work/maps/mapAi.ts` (prompt, gpt-4.1-mini, 16k tokens; con mapa existente le pasa la lista con
    `[#id]`), `mapAi.service.ts` (`draft` / `apply` / `undo`; rutas `POST /maps/:id/ai-draft|ai-apply|ai-undo`), `ImportDialog.tsx`,
    `MapEditor.tsx` (`aiUndo`, `pendingArrange`, `arrangeOnOpen`).
  - Lo nuevo con padre existente se ubica **al final de sus hermanos, sin mover nada**; si choca con otra rama baja de a medio nivel.
    Mapa vacío: se acomoda entero según «Ordenar como: Árbol · Pasos por persona · Radial».
  - User flow con **varios recorridos** = un nodo por recorrido con sus pasos en un **submapa** (carriles, `settings.arrangeOnOpen`
    → se acomoda solo la primera vez que se abre).
  - Anti-ruido (aprendido con Mendive): la IA declara `changed` por nodo existente; una descripción cuenta como cambio solo si
    ≥ 50 % de sus palabras son nuevas; un «nuevo» con el mismo nombre que un nodo sin usar se toma como ese nodo; misma ruta = mismo
    nodo; títulos de sección no son páginas; «candidatas» van en la descripción; notas cuelgan del nodo del que hablan.
  - Límite conocido: releer el mismo documento todavía puede marcar 2-3 «Cambia» cuando la IA amplía una descripción (p. ej. lista
    los 8 delitos); se destildan.
  - Gotcha: `.ds-linkbtn` hace `all:unset` y heredaba `pointer-events:none` de `.mp-empty`.
- **Ajustes del CTO al lienzo** (25/9/2026 tarde, en producción desde el 26/9, doc "Ajustes ERP Mapas- Chimpanzé"): (1) en Árbol, cuando todos los hijos de un
  nodo son hojas (3+) van en **columna** a la derecha del tronco (`layout.ts`: la columna entra a dagre como un nodo alto `col-<padre>`
  y después se reparte; `COLUMN_MIN/GAP/INDENT`); (2 y 4) cada línea **entra y sale por el lado más cercano** (`sidesFor` en `layout.ts`;
  anclas invisibles `s-*`/`t-*` en los cuatro lados de cada nodo, `mp-h-anchor`; el blanco de soltar sigue siendo `t-drop`; las manijas
  «+»/«→» no cambian); (3) **punta de flecha también en la jerarquía** (gris; «lleva a» celeste); (5) nodo Inicio: texto negro sobre lima
  en los dos temas (`--color-text-on-action`); (6) botón «N nodos · Abrir» y `.mp-subcard`: chip lima con texto negro. Test puro:
  `tests/mapasLayout.test.ts`. Regla de coordinación desde ese día: **una sola sesión ("Mapas con Chimpa IA") es dueña de todo Mapas**.
- **Cajas y flechas** (25/9/2026 noche, en producción desde el 26/9, sin migración; feedback del CTO en video + OK de Santiago: colores como fondo suave,
  círculo sí, celular igual que escritorio). La regla es **crear primero, estilizar después**: paleta de tres (**Caja · Grupo · Nota**,
  `PALETTE` en `shared/maps.ts`; los tipos viejos decision/start/end/actor siguen dibujándose vía `LEGACY_KINDS`). **Cuatro puntos**, uno por
  lado (`s-<lado>`, clase `mp-h-dot`, visibles al pasar el mouse): arrastrar a otra caja = línea; soltar en el vacío = caja nueva unida
  (`addLinkedNodeAt`); clic en el de abajo = caja debajo. Se fueron las manijas «+»/«→», el cartelito de «lleva a» y `addFlowNodeAt`.
  **La línea nace sólida** (`child`); al tocarla, barrita encima (`MapEdges.tsx`, `mp-bar--edge`): **Cuelga de · Lleva a** (cambia `kind`) ·
  **Flecha** (`meta.arrow === false` la saca) · **Texto**. **La caja, al tocarla**: `NodeToolbar` arriba con **forma** (rect · pill · diamond ·
  circle → `meta.shape`) y **color** (lima · celeste · success · warning · danger · neutral · sin color → `meta.color`; clases
  `.mp-node.mp-node--c-<color>`, doble clase porque `.mp-node` pisaba el fondo). `styleOfNode(n)` resuelve forma y color (meta manda; sin
  meta, el tipo viejo: start → píldora lima, end → píldora verde, decision → rombo); `layoutShapeOf` para tamaños. **Actor** ya no es un tipo:
  es un dato de la ficha (carriles). «Carriles por actor» → «Pasos por persona». Probado en Chrome (mapa 37 de PRUEBA): puntos, barrita de
  caja (píldora + celeste guardados en meta), barrita de línea (Lleva a, Flecha off), arrastrar a otra caja, soltar en el vacío, clic abajo.
  Gotcha: el cuadro del Chrome puede quedar en 0×0 (ventana minimizada) y las líneas no se dibujan: abrir otra pestaña.
- **Tests**: `tests/mapasOutline.test.ts` (puro, incluye `styleOfNode`), `tests/mapasLayout.test.ts` (puro: columna de hojas y `sidesFor`), `tests/mapAiDraft.test.ts` (puro: borrador, comparar, anti-ruido, duplicados), `tests/mapas.service.test.ts` (motor + accesos, con base).
- **Fase 2 pendiente**: comentarios del cliente anclados a nodos (permiso `comment`, hoy es igual a `view`), versiones atadas a rondas/aprobación,
  interruptor "revisores anónimos sí/no" por entregable (aplica también al widget), grupos que arrastren su contenido, deshacer, export PNG/PDF.
- **Fase 3 pendiente**: ~~Completar con Chimpa IA desde el brief~~ (hecho 25/9, en producción 26/9), documentos por nodo con versión, crear tareas desde nodos, rastrear un sitio existente.

## Estado del proyecto público con marca y fechas (5/10/2026, rama `estado-publico-marca`, migración 0061)

Pedido de Santiago, pasado por wireframe (`ux-chimpa`) → alta fidelidad → portada B. Diseño y decisiones en
`docs/design-system/propuestas/estado-publico/DECISIONES.md`.

**El link del cliente** (`/review/:token?panel=1#estado`):
- **Pantalla nueva** en `client/src/components/review/estado/` con framer-motion; reemplaza a `components/review/status/`.
- **Portada**:
  - «Estado del proyecto», empresa + proyecto, la frase de cómo va;
  - «Estamos en X desde el…», los puntos del recorrido;
  - próxima entrega y entrega final con cuenta regresiva, y «N cosas para ustedes».
- **Debajo**: pedidos (con «Lo pedimos hace…» y «Para el…»), cronograma con fechas o «A confirmar», entregables (versión, cuándo llegó, si espera aprobación) y «Lo que pasó».
- **Por qué hacían falta fechas**: al 5/10 en producción solo 2 de 17 proyectos tenían fases y había una sola fecha cargada. El cliente no veía ninguna fecha.
- **Sin conexión ≠ enlace vencido**: antes las dos situaciones decían «Este enlace no está disponible».

**Fechas movidas**:
- Tabla `project_phase_date_changes` (de cuál a cuál, cuándo, quién, porqué). `phaseService.update` escribe una fila cada vez que cambia `targetDate`.
- El cliente ve «Se movió · antes 9 oct» y una línea en «Lo que pasó».
- Si pasó la fecha estimada y nadie la movió, ve «Confirmando fecha».

**Diálogo de fase**: la fecha es obligatoria, con la opción «A confirmar». Al mover una fecha avisa y pide «Por qué se movió (lo lee el cliente)».

**Hoy** (`kind: "phase_date"`, sombrero Clientes, para el responsable del proyecto):
- una entrega vencida con la fase abierta;
- fases «a confirmar» hace más de 7 días.

**Pendiente**: botón propio para el pedido de elegir horario (`pick_slot`) y el logo del cliente en la portada.

**Fases en paralelo y tipo de trabajo** (decisión de Santiago, 5/10/2026):
- Puede haber más de una fase en curso. Se sacó el índice único `project_phases_one_active_uq`.
- `PATCH /api/work/phases/:id` con `{ status: "active", parallel: true }` la suma sin tocar las otras («Trabajar también en esta fase» en el menú). Activar normal sigue moviendo el «estamos acá».
- Cada fase tiene `work_type` (los tipos de las tareas). El diálogo lo propone según el nombre. El cliente lo ve como ícono.
- La portada pública muestra «Ahora estamos trabajando en» con una fila por fase en curso, cada una con su cuándo grande. La entrega final va chica y «cómo va» en una línea.

