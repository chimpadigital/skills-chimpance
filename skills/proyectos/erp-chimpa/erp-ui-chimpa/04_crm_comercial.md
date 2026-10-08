# 04 · CRM / Comercial — pantallas, flujo y piezas

Fuente: styleguide `#comercial` (v1.2), `#dominio`, `#patrones`; auditoría `docs/auditorias/crm-2026-09/` (BRIEF.md + auditoria-crm.html, artifact https://claude.ai/code/artifact/cca175d4-ffc2-44fd-ac06-b9cae19e36b0); skill `erp-chimpa-finanzas` cap. 04 › Auditoría del CRM (plan y estado de backend). Principio: **las piezas del CRM están pensadas para vender, no para cargar.**

## Mapa de pantallas (`origin/dev`)
| Ruta | Archivo | Piezas principales |
|---|---|---|
| `/crm/leads` | `pages/CrmLeads.tsx` | PageHeader, ScreenState, StatusPill, TypeChip (canal), PriorityBars, Avatar, alta rápida (FormField, PhoneInputAR, MoreFields, SubmitBar, ErrorSummary), `crm/CallQueue`, `DuplicateWarning`, `AgingBadge` (todavía `CreatableSelect` legacy) |
| `/crm/leads/:id` | `pages/CrmLeadDetalle.tsx` (1091 líneas) | `crm/LeadHero`, `NextStep`, `ContactActions`, `StageStepper`, `QuickLogInteraction`; InlineField + SaveIndicator; ActivityTimeline; DueChip; useConfirm; `growth/LeadScoreBadge`; `LeadArchivos` |
| `/crm/opportunities` | `pages/CrmOpportunities.tsx` (kanban) | `DealCard`, `StageColumnHead`, `MobileStageList`, `MoveToMenu`, alta con MoneyField/DateField/EntityCombobox, `WinDialog`/`LossReasonDialog`, `WorkspaceSelect`, GuardedMoney |
| `/crm/opportunities/:id` | `pages/CrmOpportunityDetalle.tsx` | InlineField, `CompanyPicker`, LeadHero, StageStepper, `work/TaskWorkspace`, `CreateProjectFromOpportunityDialog` |
| `/crm/dashboard` | `pages/CrmDashboard.tsx` | KpiCard, Money, `ForecastBar`, Section data |
| `/crm/config` | `pages/CrmConfig.tsx` | StatePanel, useConfirm — **solo admin** |
| `/empresas`, `/empresas/:id` | `Empresas.tsx`, `EmpresaDetalle.tsx` | FilterChip, `clientes/CompanyFormDialog` (CUIT primero), `CompletarLogosDialog`; contactos viven dentro del detalle (no hay página de contactos) |
| `/crm/personas`, `/crm/personas/:id`, `/crm/personas/duplicados` | `pages/CrmPeople.tsx`, `CrmPersonDetalle.tsx`, `CrmPeopleDuplicates.tsx` (19/9/2026 · Growth OS 1b) | Personas = identidad única (lead = consulta, contacto = relación con empresa). Lista con useListView + FilterChip por estado calculado (`lib/meta/people.ts` PERSON_STATE), ficha con LeadHero + pestañas Journey (`CustomerHistory personId`) · Relación · Datos (InlineField) · Identidades; duplicados con useConfirm `risk` para unir y snackbar con Deshacer para descartar. Reglas en `docs/growth/personas.md` |
| Hoy | `pages/Hoy.tsx` | `CallQueue` + TodayRow (tareas CRM del próximo paso) |

Piezas en `client/src/components/crm/`: `AgingBadge{since,days,suffix,basis,neverLabel}` · `CallQueue{items:[{id,title,icon,unread,meta,phone,email,name,onOpen}],title,max}` · `ClosingDialogs` (`CompanyPicker{value,valueLabel,onChange,initialQuery,autoFocus,label,hint}`, `WinDialog`, `LossReasonDialog`, `companyLogoUrl`) · `ContactActions{phone,email,name,primary,iconOnly,size,onContact,testIdPrefix}` · `DealCard` (`DealLike`: title, stageId, companyName, estimatedAmount, currency, probability, expectedCloseDate, ownerDisplayName, updatedAt…) · `DuplicateWarning{matches,onOpen,onIgnore}` · `ForecastBar{won,weighted,open,goal,currency,note}` · `LeadHero{name,company,title,subtitle,meta,score,actions}` · `MobileStageList{stages,deals,onOpen,renderActions,logoFor}` · `NextStep{task,lastActivityAt,contact,onDone,onPostpone…}` (+ `nextStepState` → ok/missing/overdue) · `QuickLogInteraction` (`QuickLogPayload{type,occurredAt,summary,details,nextActionAt,nextActionTitle,nextActionType}`) · `StageStepper{steps,current,onSelect,completed,disabled,end}` · `LeadArchivos`.
Catálogos: `lib/meta/crm.ts` (LEAD_STATUS, LEAD_FLOW = new→contacted→qualified, OPPORTUNITY_STATUS, INTERACTION_TYPE + INTERACTION_SUBMIT_LABEL, CRM_TASK_TYPE/STATUS, CHANNEL, SCORE_BAND hot/warm/cold, TRACKING_EVENT, EMAIL_STATUS, AGING_TONE).

## El flujo comercial de punta a punta (lo que la UI tiene que hacer fácil)
```
Lead entra (formulario web / Growth / a mano / correo)
  → ¿a quién llamo hoy? (CallQueue en Hoy y en Leads)
  → contacto (ContactActions: llamar / WhatsApp / mail, al volver abre QuickLog)
  → QuickLogInteraction: interacción + tarea del próximo paso + Nuevo→Contactado (1 envío)
  → califica → Convertir → Oportunidad (con empresa vía CompanyPicker, buscar antes de crear)
  → pipeline (DealCard, StageStepper, "Mover a…")
  → WinDialog (monto final + empresa + crear proyecto con plantilla) | LossReasonDialog (motivo obligatorio)
  → Proyecto → cobros → ingreso atribuido en Growth
```
Si un paso de esta cadena queda sin salida (ej.: "Crear proyecto" sin empresa), es un bug de severidad 4, no un detalle visual.

## Reglas de diseño específicas del CRM
**Detalle del lead/oportunidad arranca por lo que hay que hacer**
- `LeadHero`: avatar + nombre + cargo · empresa · rasgos (StatusPill de estado, canal/referido, score band, **días sin contacto** con AgingBadge, responsable con Avatar) + Chimp Score a la derecha.
- `NextStep` debajo del hero, siempre: `ok` ("Próximo paso: llamar para cerrar la reunión con el directorio · hoy 10:30" + acción), `missing` ("Sin próximo paso · Hace 9 días que nadie lo toca · Agendar", tono advertencia), `overdue` ("Mandar propuesta · vencido hace 2 días · Hecho", tono danger).
- Datos editables en su lugar (`InlineField`), PATCH parcial al mismo endpoint campo por campo; vaciar un campo manda `null` (no `undefined`).
- `StageStepper`: etapas abiertas en la barra; **Ganada… / Perdida… no están en la barra**: son botones que abren su diálogo.
- Timeline única (`ActivityTimeline`): brief de IA, propuesta vista (tracking), WhatsApp, propuesta enviada, cambios de etapa — con quién (`createdByName/changedByName/assigneeName`, esos son los nombres que manda la API).

**QuickLogInteraction — "Registrar llamada"**
Tipo (Llamada · WhatsApp · Reunión · Mail) en chips → resumen → **próximo paso obligatorio** con DateQuickPicks (Próximo día hábil · En 3 días hábiles · En 1 semana · Elegir) → frase "Vence: mié 16/09 · 10:00 · a vos" → botón con el verbo del tipo (`INTERACTION_SUBMIT_LABEL`). Resultado en un toast con Deshacer. Default próximo día hábil 10:00; el server rechaza fechas pasadas.

**Cierre — decidir con datos**
- `WinDialog`: "Marcar ganada · <empresa>" · monto final (MoneyField, obligatorio) · empresa (CompanyPicker) · opción "Crear proyecto con plantilla Web" · [Volver] [Marcar ganada]. Banda selva de logro + `Banner` "Oportunidad ganada: … · Crear proyecto".
- `LossReasonDialog`: "¿Por qué se perdió?" · chips obligatorios (Precio · Eligió a otro · Sin presupuesto · No respondió · Timing) + nota opcional · botón `danger-soft` "Marcar perdida". Salir de Perdida borra el motivo.
- Los dos se abren también **al soltar una tarjeta** en Ganada/Perdida del kanban; el cambio se deshace durante 6 s.
- Descalificar un lead: mismo patrón con motivo (No es nuestro perfil · Sin presupuesto · Spam · No respondió).

**Pipeline (kanban)**
- `StageColumnHead`: nombre + cantidad + **total de la columna en celeste** (dato).
- `DealCard`: **el monto manda** (blanco, sin signo: es referencia) · `CompanyLogo` + empresa · rasgo (Caliente / Vista 2 veces / Ganada) · título · próximo paso o alerta ("Seguimiento vencido") · **días en la etapa** (gris ≤7, ámbar ≤14, naranja después) · Avatar del responsable. Ganada con "Crear proyecto"; perdida con "Motivo: precio".
- Hover −4 px + borde lima; foco visible; `MoveToMenu` en cada tarjeta (Tab + M). En <640 → `MobileStageList` (tocar → "Mover a…"), nunca arrastrar con el dedo.
- Selector de workspace/pipeline visible (antes el kanban ocultaba los que no eran default).

**Listas de leads**
- "Míos" por defecto; `FilterChip` con conteo: Míos · Vencidos · Calientes · **Sin próximo paso**. Búsqueda con debounce 250 ms sin volver a skeleton; filtros y vista en la URL.
- Fila: Avatar + nombre · empresa · próximo paso (DueChip) · AgingBadge · canal (chip neutro con ícono celeste).
- Alta rápida (patrón 1): Nombre · WhatsApp (+54 9) · ¿De dónde vino? (chips) · Más datos plegado · "Crear y abrir" · `DuplicateWarning` ("Puede que ya exista: … · Abrir el existente · Crear igual").

**CallQueue — "¿a quién llamo hoy?"** (en Hoy y en Leads)
Orden: 1) seguimientos vencidos, del más viejo al más nuevo · 2) los de hoy, por hora · 3) leads nuevos sin contactar, por Chimp Score. Cabecera "Para llamar hoy 4 · Empezar por el primero". Cada ítem con ContactActions.

**Pronóstico**: `ForecastBar` Ganado · Ponderado (monto × probabilidad de la etapa, cierre esperado este mes) · Resto del pipeline; tooltip con el **tipo de dólar** (solidario para desarrollo, blue para marketing). Montos de oportunidad = referencia, sin signo.

**Teléfonos y contacto**: `PhoneInputAR` guarda E.164 (+5493516503470), avisa si falta código de área, muestra "Listo para WhatsApp". Botones de WhatsApp/mail registran la interacción al volver (abren QuickLog). Mandar algo al cliente siempre lo dispara una persona.

## Roles y permisos visibles en la UI
- `sales` (vendedor): ve y edita **lo propio y lo sin asignar** (entró solo y no lo tiene ningún vendedor); lo demás da 404 → `ScreenState` sin permiso/no existe con voz humana. Solo se asigna a sí mismo. Growth en solo lectura. No borra empresas.
- Configuración del CRM (pipelines, etapas, motivos) y export CSV: **solo admin** → no mostrar el botón a quien no puede (y si llega, estado "Esta sección es de administración…").
- Plata: `GuardedMoney` para montos que un rol no debe ver.
- `sales` recibe 403 en `/api/bot-chat`: no mostrarle entradas al Chimpa IA que después fallan.

## Estado (12/9/2026)
- **En dev** (falta verificación en navegador con sesión y OK para producción): seguridad global (`3ae66fe`), sev. 4 y sev. 3 del CRM (`5f8dd46`: CompanyPicker, Win/LossReasonDialog con Deshacer, próxima acción → tarea real, staleTime 45 s, nombres de campo, permisos de `sales`), y la migración visual completa de la zona CRM al DS (`424311b` y siguientes).
- **Pendientes que necesitan backend** (no inventar en la UI; anotar y avisar): fecha de la próxima tarea por lead para `CallQueue` · pronóstico con objetivo del mes, ponderado y tipo de dólar · endpoint de duplicados para `DuplicateWarning` · logos en la lista de oportunidades · que el registro rápido pase el lead a Contactado solo · convertir dos veces crea dos oportunidades (`opportunity.service.ts`) · buscador del header sin backend.
- **IA en el CRM (más adelante)**: el Chimpa IA no tiene tools de CRM; plan en la auditoría: "Llamé a…" por voz → interacción + tarea, brief por lead, una tarjeta viva por borrador, confianza también en el server. En UI, todo con `AIBox` + ChimpaMark y confirmación humana.

## Checklist rápido de una pantalla comercial
- [ ] ¿Se ve el próximo paso sin scrollear? ¿Lo abierto sin próximo paso está marcado?
- [ ] ¿Anotar un contacto es un solo envío? ¿La fecha por defecto es próximo día hábil 10:00?
- [ ] ¿Ganar pide monto y empresa? ¿Perder pide motivo? ¿Se puede deshacer el cambio de etapa?
- [ ] ¿Se puede mover sin arrastrar (teclado y celular)?
- [ ] ¿"Míos" por defecto y filtros con conteo en la URL?
- [ ] ¿Montos de oportunidad sin signo, totales de columna en celeste, días en la etapa con su tono?
- [ ] ¿El vendedor ve solo lo suyo y no ve botones de admin?
- [ ] ¿Empresa elegida con buscador (nunca texto libre) y aviso de duplicado?
