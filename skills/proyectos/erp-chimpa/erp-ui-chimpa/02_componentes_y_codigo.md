# 02 · Componentes y código de la UI (estado en `origin/dev`, 12/9/2026)

> **La verdad es `origin/dev`.** La carpeta `Chimpa-Finanzas` puede estar parada en otra rama sin nada de esto. Para leer sin tocar: `git show origin/dev:<ruta>` y `git ls-tree -r --name-only origin/dev <carpeta>`. Antes de escribir código, confirmar con `git status`/`git branch` en qué rama estás y seguir el workflow del skill `erp-chimpa-finanzas` (cap. 01 y 10). Leer siempre el archivo real para ver las props exactas: esto es un mapa, no la API completa.

## Stack de estilos
- **Tailwind 3.4** (`tailwind.config.ts`, `darkMode: ["class"]`, `tailwindcss-animate`, `@tailwindcss/typography`). `@tailwindcss/vite` 4 y `tw-animate-css` están instalados pero **no se usan**.
- Orden de CSS en `client/src/main.tsx`: `styles/tokens.css` (generado) → `styles/ds.css` (generado, clases `ds-*`) → `styles/ds-erp.css` (a mano, variante A) → `index.css` (alias del sidebar, body, grano).
- **Tema**: `components/ThemeProvider.tsx` (localStorage `chimpance-theme`, oscuro por defecto) pone la clase `.dark` (shadcn) **y** `data-theme` (tokens). Script inline en `client/index.html` evita el destello.
- Fuentes: Plus Jakarta Sans + JetBrains Mono (Google Fonts). Motion de página: framer-motion vía `components/motion.tsx` (`MotionPage`).
- Router: **wouter**, rutas en `client/src/App.tsx` con listas de rutas permitidas por rol (colaborador, contador, ventas). Públicas: `/review/:token`, `/compartir`.
- Providers: QueryClient · Theme · Tooltip · `ConfirmProvider` · `NotificationProvider`.

## Clases de token de Tailwind (usar estas, nunca paleta ni hex)
`bg-surface` · `bg-surface-page/raised/data/warm/jungle` · `text-ink` · `text-ink-body/secondary/muted/data/link` · `border-line` · `border-line-subtle` · `bg-lima-soft` · `text-lima-ink` · `border-lima-line` · `bg-celeste-soft` · `text-celeste-ink` · `border-celeste-line` · `bg-state-{success,danger,warning,info}-soft` · `text-state-*-ink` · `border-state-*-line` · `text-state-danger` · `text-money-positive/negative` · `rounded-sm/md/lg/xl/pill` (10/14/18/30/pill) · `duration-fast/base/rev/hero` · `ease-brand` · `shadow-overlay` · `shadow-glow-lima`. También `var(--color-…)` en estilos. Los shadcn (`bg-primary`, `bg-background`…) siguen andando vía el puente HSL de `tokens.css`. Ojo: `chart-*` todavía son los HSL viejos.

## Primitivos shadcn restilizados — `client/src/components/ui/`
- **Button** variantes: `default` (primario lima, UNO por pantalla) · `secondary`/`outline` (neutro — 304 usos de outline eran secundarias, por eso no son lima) · `ghost` · `link` · `danger-soft` · `destructive` (solo en confirmación) · `ai` · `brand` (contorno lima) · `light`. Tamaños `default | sm | lg | icon | icon-sm`.
- **Badge**: `default` neutro · `info` · `success` · `warning` · `danger` · `lima` · `ai` · `outline`. Para estados de catálogo usar `StatusPill`; para tipos `TypeChip`.
- **Toast**: `success | info | warning | destructive`, hasta 3. En la práctica se usa `useNotification()` → `toastSuccess/Error/Info/Warning`.
- Card, Input, Select, Dialog, Sheet, Table, Tabs, Tooltip, Command (cmdk)… ya con tokens.
- **Table = tabla estándar (19/9/2026)**, no reinventar por pantalla: si no entra de ancho muestra flechas ‹ › centradas en lo visible y, desde 640 px, fija la 1ª columna y la de acciones (encabezado `<span className="sr-only">Acciones</span>`, así la detecta). **Toda la fila abre el registro**: prioridad botón `data-row-open` (ej. "Ver detalle" que abre un diálogo) › link `data-row-link` › primer `<a href>` de la fila; `<TableRow rowLink={false}>` lo apaga; si la fila tiene `onClick` propio se respeta. Filas nuevas: poné el link al detalle en la 1ª columna y listo. Nombres largos: `max-w-[15rem] xl:max-w-[20rem]` en el bloque interno + `truncate` + `title` (el `max-width` en `td` no anda). Estilos de columnas fijas en `index.css` (sección "Tabla estándar").

## Biblioteca del DS — `import { … } from "@/components/ds"`
| Archivo | Piezas (props clave) |
|---|---|
| `Icon.tsx` | `Icon{name,size,play,busy}` (129 del sprite, 51 animados; nombres en `icons.generated.ts`), `ICON_MOTION`, `playIcon` |
| `status.tsx` | `StatusPill{meta,label,tone,glyph,pct,icon,dot}` · `StatusGlyph` · `TypeChip{meta,variant}` · `PriorityBars{priority}` · `DueChip{date,done,withTime,soonDays}` (+ `dueStatus`, `formatDue`) · `Tile{icon,tone,size}` · `Stamp{kind}` · `Kbd` |
| `identity.tsx` | `Avatar{name,src,size,tone}` · `AvatarStack{people,max}` · `CompanyLogo{name,src,size}` · `Iso` |
| `money.tsx` | `Money{value,currency,signed,size,total,muted,voided}` · `GuardedMoney` (oculta montos a roles sin permiso de plata) · `CurrencyChip` · `Flow{direction,value}` · `formatMoneyAR`/`formatAmountAR` |
| `feedback.tsx` | `Notice{tone,title,actions}` · `Banner` · `AIBox` · `AIMark` · `ConfidenceMeter` · `ConfirmDialog` / `ConfirmProvider` / `useConfirm({title,description,tone:"neutral"|"risk"|"danger",confirmLabel,consequences,typed})` |
| `screen.tsx` | `ScreenState{query,children(data),isEmpty,empty…}` (cargando/vacío/error/403/desactualizado) · `SkeletonRows{rows,variant}` · `SkeletonLine` · `EmptyState{title,description,action,image}` · `StatePanel` · `StaleBanner` · `httpStatusOf` |
| `layout.tsx` | `PageHeader{title,subtitle,icon,stats:[{value,label,warn}],actions,breadcrumbs}` · `Section{tone:"warm"|"data"|"jungle"|"surface"|"page",title,kicker,actions}` · `Breadcrumbs` · `FilterChip` · `Segmented` · `Pager` |
| `data.tsx` | `KpiCard{label,icon,tone,value,format,delta,sparkline,loading}` · `Delta` · `Sparkline` · `HoursMeter{used,estimated}` · `Timer` · `ActivityTimeline{items}` |
| `actions.tsx` | `SplitButton` · `OutcomeBar` (ganar/perder/posponer) |
| `chimpa.tsx` | `Chimpa{state,size}` (8 estados) · `ChimpaMark` · `ChimpaTyping` · `ChimpaFab` |
| re-export | `toneClass`, `metaOf`, `TONES`, `Tone`, `MetaEntry`, `MetaCatalog` (de `@/lib/meta/tones`) |

### Agregados 14/9/2026 (tandas 2–4)
- **Listas** (`ds/listView.tsx`): `useListView(screen, defaults)` → búsqueda/filtros/orden/vista en la URL y recordados por usuario (`q` no se recuerda) · `ListMetaBar` (barra fina arriba de los resultados: "N de M cosas · Orden: X ▾" + `UpdatedAgo` + `end`) · `UpdatedAgo`. **El orden nunca va como Select en la fila de filtros**: va en `ListMetaBar` (decisión de Santiago 14/9). Fila de filtros: buscador `ds-search !h-9`, `FilterChip className="!h-9"`, SelectTrigger `h-9`.
- `useConfirmReason()` (devuelve el motivo o null) · `ConfirmDialog` con `reason`, `confirmTestId`, `cancelTestId` · `OutcomeBar` con `winTestId/loseTestId/postponeTestId`.
- React Query refresca cada 60 s con la pestaña a la vista (queryClient).

### Desplazamiento lateral — `@/components/ds/scroller` (19/9/2026)
Una sola pieza para todo lo que no entra de ancho. `HScroll` = tira horizontal ya armada (flechas ‹ › en los bordes, centradas en la parte visible, + arrastrar con el mouse para trasladar): la usan Tareas › Tablero, el pipeline de Oportunidades, la tira de Cajas y las cuotas de TarjetaDetalle. `useHScroll` + `ScrollArrow` sueltos los usa `ui/table.tsx` (la tabla no arrastra: rompería seleccionar y copiar texto). `useDragPan` no arranca desde `button/input/select/textarea/label/[role=button]/[data-no-pan]` ni desde el ⠿ de dnd-kit, apaga el scroll-snap mientras arrastra y se come el clic que cierra el arrastre. Tablero nuevo: `<HScroll className="flex gap-3 pb-3">` en vez de `<div className="flex gap-3 overflow-x-auto pb-3">`.

## Carga de datos — `@/components/ds/form`
- Cáscara: `FormField{label,name,required,optional,hint,error,success,source,icon,prefix}` · `FormSection` · `FormRow` · `SubmitBar{label,icon,pending,onSubmit,form,onCancel,dirty,status}` · `ErrorSummary` · `ChoiceGroup` (chips de un toque).
- Campos: `MoneyField{value,onChange,currency,onCurrencyChange,allowNegative,bnaRate}` + `CurrencyChoice` + `IvaChoice` · `DateField` + `DateQuickPicks` · `HoursField` · `CbuField` · `CuitInput` (ARCA, dígito verificador, duplicados; `invoiceHintFor`) · `PhoneInputAR` (guarda +54 9) · `EntityCombobox` / `EntityPicker` (búsqueda + "Crear «…»").
- Comportamiento: `DirtyGuard`/`useDirtyGuard` · `DraftAutosave`/`useDraftAutosave` · `SaveIndicator` · `InlineField` · `MoreFields` · `MoveToMenu` · `FillWithChimpa` + `ChimpaFillProvider`.
- Helpers: `@/lib/format/money` (`parseMoneyAR`, `formatMoneyAR`, `splitIva`, `IVA_RATES`) · `@/lib/format/dates` (`todayAR`, `parseDateAR`, `formatDateAR`, `relativeDayAR`, `feriadosAR`, `isBusinessDay`, `addBusinessDays`, `quickPicks`) · `@/lib/format/ids` (`formatCuit`, `isValidCuit`, `isValidCbu`, `bankFromCbu`, `normalizePhoneAR`) · `@/lib/format/hours` (`parseHours`, `formatHours`) · `@/lib/errors/translate` (`translateError`). BNA: `hooks/useBnaRates.ts`.

- Agregados 14/9: `FormField compact` (celdas de grillas; lo heredan MoneyField, DateField, CuitInput, CbuField, PhoneInputAR, EntityCombobox) · `DateTimeField` (valor `YYYY-MM-DDTHH:mm`) · `DateField pastMessage` · `InlineField type="date"` y `multiline` (Ctrl+Enter guarda) y aviso si otra persona cambió el dato mientras se editaba · `SubmitBar tone="risk"|"danger"` (el pie baja de línea en diálogos angostos) · `FillWithChimpa` usa `POST /api/bot-intakes/parse` (solo lectura, no crea borrador).

## Mobile — `@/components/mobile`
`BottomSheet` · `SwipeRow` · `LongPressSheet` · `UndoSnackbar`/`showSnackbar` · `SuggestionChips` · `AgentVoiceCapture` · `MobileDraftCard` · `BottomNav` · `QuickActionSheet` · `OfflineBanner` · `MobileShell`. PWA: manifest + `sw.js` + `shell/registerServiceWorker.ts`; `useIsMobile`. Debajo de `md` el layout pasa a BottomNav.

- Agregados 14/9: `MobileDraftCard` con `blockedReason` y testids (lo usa AgentChat en celular) · `SwipeRow` suprime el click al soltar tras deslizar o mantener apretado; fondo del frente con `--swipe-fg-bg`.

## Cáscara
`components/Layout.tsx` (header sticky con `shell/HeaderControls.tsx`: BnaChip, HeaderSearch — **sin backend** —, HelpButton, NotificationBell, ThemeToggle, UserMenu; contenido `max-w-[1200px]`; `AgentWidget`; `MobileShell`) · `components/app-sidebar.tsx` sobre `ui/sidebar.tsx` con ítems de `shell/navConfig.ts` por rol y sombrero, contadores de `useNavCounts`.

## Catálogos — `client/src/lib/meta/`
`tones` (base) · `crm` (LEAD_STATUS, LEAD_FLOW, OPPORTUNITY_STATUS, INTERACTION_TYPE, INTERACTION_SUBMIT_LABEL, CRM_TASK_TYPE/STATUS, TRACKING_EVENT, CHANNEL, SCORE_BAND, EMAIL_STATUS, AGING_TONE…) · `clients` (tipo de empresa, condición fiscal, contacto, playbook, rol de usuario, categoría) · `finance` (titular, movimiento, caja, ledger, deuda, cuota, resumen de tarjeta, proyección) · `obligations` (dirección, estado, origen, factura, período/asiento IVA, recurrente) · `projects` · `work` (TASK_STATUS/TYPE/PRIORITY, BOARD_COLUMNS, HAT, tipos de Hoy) · `feedback` · `growth` · `support`. Nuevo enum en la API → nueva entrada acá, nunca un mapa en la página.

## Carpetas de dominio
`components/crm/` (cap. 04) · `work/` (`board/`, `docs/`, `meetings/`, `TaskWorkspace`) · `clientes/` (`playbook/`, `support/`, `CompanyFormDialog`, `CompletarLogosDialog`) · `feedback/` · `review/` · `growth/` · `shell/` · `chat/` (`AgentChat variant="page"`).

## Datos en la UI
- `lib/queryClient.ts`: `apiRequest(method, url, data)` (tira `"status: body"`), queryFn por defecto que une la `queryKey` como URL, `staleTime` 45 s, sin reintentos, `invalidatePrefix(...)`.
- `ScreenState` envuelve las consultas principales (57 archivos). `useConfirm` en 30, `window.confirm` en 0.

## Deuda de UI conocida (candidatos cuando se toca esa zona)
- **Tres formateadores de plata**: `lib/money.ts` en la raíz (tipo `Currency`; lo usan `MoneyInput`/`MoneyText` y 6 páginas), `client/src/lib/format/money.ts` y `ds/money.tsx`. `MoneyText` ya es un wrapper de `GuardedMoney`. Converger a `lib/format/money` + `Money`.
- **Pies de diálogo a mano**: `DialogSubmit` local en Cajas, CuentaCorriente, DeudaFinancieraDetalle, DeudasFinancieras, Movimientos, Presupuestos, TarjetaDetalle + `FormFooter` en `growth/shared.tsx` → `SubmitBar` (Fase 9).
- `growth/shared.tsx` con su propio `Field`, `EmptyState`, `KpiCard`, `TableSkeleton`, `cleanError`, `fmt*`.
- `feedback/feedbackMeta.ts` (`formatDateAR`, `cleanError`, `timeAgo`) y `clientes/support/supportMeta.ts` (`fmtHours`) duplican `lib/format`.
- `Field` local en `ObligacionesList.tsx`; formateadores de fecha locales en Admin, CrmLeadDetalle, CrmOpportunityDetalle, IVA; `nextBusinessDayLocalISO` duplicado en `crm/QuickLogInteraction`.
- Dos `CompanyLogo` (`ds/identity` y `clientes/CompanyLogo`).
- Legacy en uso: `MoneyInput`, `ObligationCreateModal`, `CreatableSelect`, `CategorySelect`.
- `translateError` solo en 3 archivos → muchos errores crudos del server todavía llegan a toasts.
- Lucide en 13 archivos (genéricos). `chart-*` con HSL viejo.
- Páginas más grandes (líneas): FeedbackInbox 1634 · ProyectoDetalle 1500 · ObligacionesList 1351 · CrmLeadDetalle 1091 · Hoy 1028 · DeudasFinancieras 1016 · Admin 814 · CrmOpportunities 778. Al tocarlas, extraer subcomponentes a la carpeta de dominio en vez de engordarlas.

Regla para la deuda: **se limpia al pasar por la zona**, dentro del alcance de la tarea y avisando; no se abre una refactorización transversal sin OK de Santiago.
