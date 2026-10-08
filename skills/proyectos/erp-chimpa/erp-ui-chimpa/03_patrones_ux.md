# 03 · Patrones de experiencia, estados de pantalla y carga de datos

Fuente: styleguide `#acciones`, `#avisos`, `#patrones` (v1.2), `#pantallas` (v1.2), `#carga` (v1.5), `#mobile`, `#mobile-rapidas` (v1.3). Estas reglas valen para **todo** el ERP; el CRM es donde más se notan (cap. 04).

## Jerarquía de acciones — el peso lo da el relleno

| Peso | Variante `Button` | Cuándo | Ejemplos |
|---|---|---|---|
| Primario lima | `default` | Lo que viniste a hacer. **UNO por pantalla o diálogo** | Nueva tarea · Registrar cobro (en el diálogo) · Crear proyecto |
| Contorno lima | `brand` | Acompañante del primario (casi nunca) | Aplicar plantilla · Importar |
| Neutro #202020 | `secondary` / `outline` | Acciones frecuentes en filas, toolbars y detalles (el resto) | Cobrar · Pagar · Editar · Llamar · Cargar horas |
| Ghost | `ghost` | Ajustes livianos y "Volver" en diálogos | Posponer · Fijar · Copiar enlace |
| Blanco | `light` | Solo sobre bandas de color (lima, selva, petróleo) | Banda de oportunidad ganada |
| Riesgo `[ERP]` | `danger-soft` | Saca de circulación pero vuelve | Cancelar tarea · Descartar feedback · Desactivar · Marcar perdida |
| Irreversible `[ERP]` | `destructive` | **Solo dentro del diálogo que confirma**, nunca suelto | Eliminar proveedor · Cerrar período IVA · Anular movimiento |
| IA | `ai` | La IA hace el trabajo y deja un borrador | Leer la minuta · Reclasificar · Completar con el Chimpa IA |

- Cargando = spinner centrado sobre el botón + texto "Creando tarea…". Deshabilitado = opacidad .4 **y** tooltip que dice por qué; en formularios el botón nunca queda mudo (se puede tocar y dice qué falta).
- **Un primario, más caminos**: si hay varias formas de crear, `SplitButton` (Nueva tarea ▾ en blanco / desde plantilla / importar minuta IA). Resuelve los "5 primarios apilados".
- **En filas**: la acción principal visible con texto + ícono propio (nunca solo en hover); el resto en "Más" (⋯) con cancelar/anular al final en naranja. El lima aparece recién en el diálogo.
- **Ganar/perder** nunca es un Select de etapa + "Guardar": `OutcomeBar` → `WinDialog` / `LossReasonDialog`.

## Estados y señales — tres canales que no se mezclan
1. **Estado = anillo que se llena** (`StatusGlyph` / `StatusPill`): borrador punteado · pendiente vacío · en curso a medias · revisión · hecho lleno · cancelado · vencido · anulado. En obligaciones parciales el anillo muestra el % real cobrado. El color funcional acompaña; la forma alcanza.
2. **Categoría = chip celeste con ícono** (`TypeChip`): tipo de tarea, intención del feedback, canal. Los distingue el ícono, no un color nuevo. Canal/interacción = chip neutro con ícono celeste (metadato secundario).
3. **Urgencia = barras o fecha**: `PriorityBars` (baja / alta / ! urgente; normal no se muestra) · `DueChip` relativo ("Vencida hace 5 días", "Hoy 18:00", "Mañana", "vie 19/09", "Cobrada 08/09").
- `AgingBadge` días sin actividad: gris ≤7 · ámbar ≤14 · naranja después (desde la última **interacción**, no la última edición). Feedback: antigüedad naranja pasadas 48 h.
- `Stamp` (sellos) para estados terminales arriba a la derecha del detalle: Pagada · Anulada · Aprobada · Cancelada.
- Moneda: `CurrencyChip` — ARS no se marca; USD; USD BNA "flota" hasta facturar (ahí muestra la cotización congelada).
- **Catálogos**: todo enum tiene UNA entrada en `client/src/lib/meta/<zona>.ts` (`MetaCatalog`: label + ícono + tono + glyph). Nunca un mapa local de label/color en la página. Leer con `metaOf(catalog, value)` (no rompe si llega un valor nuevo).

## Confirmar según gravedad (deshacer antes que confirmar)
| Acción | Tratamiento |
|---|---|
| Reversible: marcar hecha, mover de etapa, archivar, quitar tag, pasar a mañana | Se hace en el acto + **toast con Deshacer** (≈6 s) |
| Riesgo que vuelve: cancelar tarea, descartar feedback, marcar perdida | Diálogo de riesgo (`useConfirm` tone `risk`), botón `danger-soft`, dice cómo se recupera |
| Irreversible: eliminar, cerrar período IVA, anular movimiento | `ConfirmDialog` tone `danger`: consecuencias listadas + **escribir para confirmar** ("Escribí 08/2026") + botón `destructive` |
| Sale del ERP: mail, WhatsApp, aviso al cliente | **Siempre lo manda una persona** con un clic explícito |

Nunca `window.confirm`. Nunca "¿Estás seguro?" como título: el título nombra el hecho ("Cerrar el período IVA 08/2026").

## Avisos
- `Notice` (4 tonos, fondo 10 % / borde 35 % / texto teñido / ícono pleno con forma propia: círculo info, tilde éxito, triángulo advertencia, octógono error) · `Banner` de página con acción · `Toast` con variantes `success | info | warning | destructive`, hasta 3 a la vez, con Deshacer cuando aplica.
- La advertencia **no** sale en rojo. Éxito dice el hecho y la cifra: "Cobro registrado · $ 1.200.000 → Caja Galicia ARS · Deshacer".
- `AIBox` (borde lima) para todo lo que propone la IA, con `ChimpaMark` + `ConfidenceMeter`. Confianza baja (<60) → pregunta una sola cosa concreta.

## Los 9 patrones de interacción (v1.2)
1. **Crear rápido, completar después** — alta con 3-4 campos en una columna (nombre, un contacto, de dónde vino); el resto en `MoreFields` "Más datos"; buscar antes de crear (`EntityPicker` + `DuplicateWarning`); el botón dice adónde va: "Crear y abrir".
2. **Editar donde se lee** — en detalles no hay formulario con "Guardar": `InlineField` (clic/Enter edita, Enter/blur guarda, Esc cancela) + `SaveIndicator` siempre visible (Guardando… · Guardado · No se pudo guardar). Si falla vuelve el valor anterior y dice por qué. Cambios de varios campos juntos sí van en diálogo. En el CRM se guarda campo por campo (PATCH parcial al mismo endpoint).
3. **Una intención, un envío** — "anoté la llamada" es un botón aunque atrás se creen 3 cosas (interacción + tarea del próximo paso + cambio de estado). Una transacción: todo o nada.
4. **Deshacer antes que confirmar** — tabla de arriba.
5. **Decidir con datos** — cuando una decisión alimenta un reporte (ganar, perder, descalificar, cancelar) se pide el dato en ese momento, en chips de un toque. Motivo obligatorio al perder/descalificar (nota opcional); monto final y fecha al ganar.
6. **Encontrar rápido** — debounce 250 ms, los resultados anteriores quedan hasta que llegan los nuevos (sin parpadeo a skeleton), "Míos" por defecto, filtros como `FilterChip` con conteo, búsqueda/filtros/vista en la URL y recordados por usuario, orden visible ("Próximo paso ↑"), sin resultados ofrece salida.
7. **Todo lo abierto tiene un próximo paso** — lead/oportunidad/feedback abierto sin próximo paso se marca y se pide. `DateQuickPicks` en días hábiles (próximo día hábil, 3 días, 1 semana). **Nunca "ahora" por defecto** (nace vencida): próximo día hábil 10:00. Filtro "Sin próximo paso" en listas comerciales.
8. **Mover sin arrastrar** — todo lo arrastrable tiene `MoveToMenu` "Mover a…"; filas y tarjetas son links reales con foco visible; Tab + Enter abre. Atajos: `/` buscar · `N` nuevo · `M` mover · `Ctrl+J` Chimpa IA. Botones de ícono con `aria-label`.
9. **Datos frescos** — `staleTime` ~45 s + refetch al volver a la pestaña; "Actualizado hace 2 min" en listas largas; `StaleBanner` si otro cambió lo que estás viendo ("Rocío cambió esta oportunidad hace 1 min: etapa y monto · Ver cambios · Actualizar").

## Los 7 estados de pantalla — `ScreenState`
Toda consulta principal (lista o detalle) resuelve los siete, no solo el feliz:
1. **Cargando** — `SkeletonRows` con la forma de lo que viene. Nunca "Cargando…" suelto ni pantalla en blanco.
2. **Vacío la primera vez** — `EmptyState` con mono mate sobre lima + qué va a aparecer acá + acción ("Todavía no hay leads · Cuando entren por el formulario del sitio aparecen solos · Nuevo lead").
3. **Sin resultados** (por filtro/búsqueda) — "Nada con “zzz” en Mis leads · Limpiar filtros · Buscar en todos".
4. **Error** — humano + Reintentar + detalle técnico plegado ("503 · /api/crm/leads · 11/09 10:42"). **Un error de red nunca se ve como "no encontrado" ni como "no hay datos".**
5. **Sin permisos** — de quién es la sección y a quién pedirle.
6. **Archivado o no existe** — quién y cuándo, Restaurar / Ver igual.
7. **Desactualizado o guardando** — se superpone a los anteriores ("Hay 3 leads nuevos · Mostrar", "No se pudo guardar · Reintentar").

## Carga de datos — las 12 reglas (v1.5)
1. **Un solo `FormField`** para todo el ERP: label asociado, `*` en obligatorio y "opcional" escrito, ayuda y error debajo, `aria-invalid`.
2. **Empezar por el dato que completa el resto**: CUIT en empresas (`CuitInput` busca en ARCA), factura o texto en obligaciones (`FillWithChimpa`), lead en oportunidades.
3. **Buscar antes de crear**: todo selector de empresa/proyecto/lead/persona es `EntityCombobox` con búsqueda y "Crear «…»". **Y nunca un duplicado sin aviso (16/9/2026)**: listas → `ExistingHint` + botón "Elegir «X»"; identificadores (CUIT, usuario, CBU) → `DuplicateWarning mode="block"` con "Abrir el existente"; nombres que pueden repetirse → `DuplicateWarning` "Puede que ya exista · Abrir · Crear igual". Regla de comparación única en `shared/dedupe.ts` (ver skill erp-chimpa-finanzas cap. 03).
4. **Lo mínimo visible, lo demás en "Más datos"**, agrupado por tema (`FormSection`: fiscal, contacto, domicilio).
5. **Una columna en mobile, máximo dos en escritorio** (salvo cortos juntos: ciudad + provincia → `FormRow`).
6. **Formatos argentinos al tipear**: `MoneyField` ($ 1.234,56; acepta "1234.56", "1.234,56", "1,2 M"), CUIT con guiones + dígito verificador, `PhoneInputAR` (+54 9, guarda E.164), `CbuField` (22 dígitos, detecta banco), `DateField` DD/MM, `HoursField` ("1:30", presets 30 min/1 h/2 h/media jornada).
7. **Defaults con criterio**: hoy en hora argentina (`todayAR()`, nunca `new Date().toISOString().slice(0,10)`), responsable = vos, próximo día hábil 10:00, moneda y proyecto del contexto, medio de pago si hay uno solo.
8. **El sistema hace las cuentas**: neto/IVA/total (`MoneyField` con `IvaChoice`), cuotas y cronograma, saldo pendiente, recurrencias, cotización del día. Moneda antes que monto.
9. **Nunca perder lo cargado**: `useDraftAutosave` en altas largas + `useDirtyGuard` ("¿Descartar los cambios? Cambiaste 2 campos…") al cerrar. El clic afuera no cierra ventanas con datos.
10. **Foco al primer campo vacío** y nunca seleccionar el texto existente al abrir.
11. **Enter avanza, Ctrl+Enter guarda**; `SubmitBar` con el primario que dice qué crea ("Crear por cobrar") y "Guardando…". Frase final de lo que se va a crear.
12. **Completar con el Chimpa IA** donde hay texto o archivos de origen; lo precargado se marca (borde IA) y lo confirma una persona.

**Errores**: al salir del campo (no mientras escribe ni solo al final) · al lado del campo, diciendo qué hacer, nunca solo un toast · al enviar con errores `ErrorSummary` arriba con links y foco en el primero · errores del server siempre por `translateError` (`@/lib/errors/translate`): "projectId: Expected number, received null" → "Elegí un proyecto para poder facturarla"; "duplicate key" → "Ya hay una empresa con ese CUIT: Agrosur S.A. · Abrirla"; "Failed to fetch" → "No hay conexión. Lo que cargaste sigue acá"; 500 → "Algo falló de nuestro lado y no se guardó. Ya quedó registrado."
**Validación**: la guía propone react-hook-form + zod de `shared/`, pero **hoy el cliente no los usa** (0 imports al 12/9): los formularios son `useState` + piezas de `ds/form`. No meter react-hook-form en un formulario suelto; si se decide adoptarlo, es una decisión transversal para charlar con Santiago. **El payload que va a la API no cambia por una migración visual.**

## Mobile (<640) y acciones rápidas (v1.3)
- En el celular el ERP sirve para **ver qué hay hoy y resolverlo rápido**. Hoy primero.
- Zona del pulgar: crear, marcar hecha, cobrar y navegar en el tercio de abajo; arriba solo se lee. Botones 52 px, todo lo tocable ≥ 44, filas 56, inputs 16 px. KPIs y kanban en scroll horizontal con snap; detalles como hoja inferior (`BottomSheet`) con acciones fijas.
- `BottomNav` (Hoy · Tareas · **+ central lima** · Chimpa IA · Más) → `QuickActionSheet` con **6 acciones fijas**, siempre iguales: arriba las 2 de IA (Dictar al Chimpa IA, Foto de comprobante), abajo 4 manuales (Tarea rápida, Llamada o WhatsApp, Cobro, Gasto). La memoria muscular vale más que personalizar.
- `AgentVoiceCapture` (mantener apretado para dictar) + `SuggestionChips` según la pantalla desde donde se abrió (el contexto viaja) + `MobileDraftCard` (preguntar responde; cargar deja borrador con Confirmar al pulgar).
- `SwipeRow` → hecha / ← mañana, **solo para lo reversible** y siempre con `UndoSnackbar`; cancelar, anular o pagar nunca en un gesto. Todo gesto tiene su botón visible (⋯ / `LongPressSheet`). Vibración 10 ms al pasar el umbral y al empezar a grabar.
- Kanban en el celular = `MobileStageList` + "Mover a…", nada de arrastrar con el dedo.
- PWA: `shortcuts` del manifest (Dictar, Foto, Tarea rápida, Registrar llamada), `share_target` → `/compartir` → borrador del Chimpa IA. `NotificationActions` máx 2; lo que mueve plata abre el formulario completado, **nunca confirma desde la notificación**. `OfflineQueue` encola llamadas/tareas/notas; **la plata no se encola** (evita duplicar movimientos).

## Navegación
- `PageHeader` en toda pantalla: migas (mono) · ícono del módulo en celeste · título h1 36/500 · subtítulo · stats en línea ("13 abiertas · 2 vencidas · 2,02 h cargadas hoy") · acciones con **un** primario.
- Sidebar agrupada **por sombrero** (Principal · Trabajo · Comercial · Finanzas · Asistente), activo en lima, contadores; fija 260 px en escritorio, cajón en tablet.
- `Tabs` con barra lima que se desliza · `FilterChip` (activo = lima relleno texto negro, con conteo) · `Segmented` para vistas (Kanban/Lista/Calendario, con ícono) · `Pager` · `Breadcrumbs` en detalles · `Kbd` para atajos.
