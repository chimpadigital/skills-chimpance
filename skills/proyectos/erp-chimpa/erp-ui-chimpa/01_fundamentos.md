# 01 · Fundamentos visuales — Selva señalizada (variante A)

Fuente de verdad: `docs/design-system/_build/styleguide.src.html` (secciones `#color`, `#tipografia`, `#forma`, `#iconos`, `#iconos-animados`, `#imagen`, `#movimiento`, `#datos`) + `tokens.json`. Marca madre: `Chimpa/brand/styleguide-theme.html` y `motion-styleguide.html`. **Si falta un valor: primero se busca en la guía de marca; si no está, se agrega un token marcado `[ERP]` en `build_tokens.py` y se regenera. Nunca un hex suelto.**

La idea en una línea: *oscuro para concentrarse, señales para decidir*. Mismos negros, lima, celeste, Plus Jakarta y grano que la marca; lo que suma el ERP son **señales**: un ícono por significado, una forma por estado y un peso por acción.

## Color — dos acentos, dos trabajos

| Color | Trabajo | Nunca |
|---|---|---|
| **Lima #D9F45F** | Acción: el primario (UNO por pantalla/diálogo), foco, selección, filtro/pestaña/página activa, lo que está en curso (cronómetro) | Decorar, títulos, etiquetas, datos, un estado de negocio ("lead caliente", "deuda activa") |
| **Celeste #36A9E1** | Identidad y datos: íconos de módulo, tipos de tarea, canales, categorías, cifras informativas, links, kicker/títulos chicos, info | Un botón |
| Verde success #3DD68C | "Terminó bien": pagada, hecha, ganada, aprobada, cobrado | "Activo" (lo normal no se pinta) |
| Naranja #FD5B38 | Problema o irreversible: vencida, error, anular/eliminar | Por pagar como "alerta" (es un − rojo) |
| Ámbar #FFAA18 `[ERP]` | Atención ahora: vence hoy, prioridad alta, advertencia | Pendiente, dueño, BNA (colisiones viejas) |
| IA | **Solo lima y negro** (`--color-ai-line`: lima-400 oscuro / lima-700 claro) | Celeste o gradiente lima→celeste en cualquier cosa de IA |

**Fondos que se alternan, cada uno con un trabajo** (clases `ds-section--*` / `bg-surface-*`):
- Negro base `#0A0A0A` fondo de pantalla · superficie `#121310` cards/paneles · elevado `#202020` menús/diálogos/botón neutro · hover `#272824`.
- **Cálido** `#17180F` (`ds-section--warm`): cabecera de Hoy, login, aperturas.
- **Petróleo** `#121C27` (`ds-section--data`): bandas de KPIs, plata, métricas.
- **Selva** `#0E1A12` (`ds-section--jungle`): logros (ganada, aprobada, cobrado).
- Off-white `#FDFDF5`: tema claro (`data-theme="light"`). Lima de fondo solo como escenario del mono en vacíos.

**Grises consolidados — de acá no se sale**: `#FFFFFF` títulos · `#CFD0CB` cuerpo · `#A7A79E` apoyo/metadatos (lo que hay que leer) · `#707070` solo texto grande o no esencial (3,7:1). Bordes blancos con alfa .06/.1/.2; borde de input .34 `[ERP]` por WCAG.

**Lo normal no se muestra**: prioridad normal, estado activo, moneda ARS en tablas en pesos, responsable ya asignado → sin badge. Menos ruido = lo raro salta solo.

## Plata con signo (decisión 12/9/2026)
- **+ verde** lo que entra o suma · **− rojo** (menos tipográfico `−`) lo que sale o resta · **0 gris** sin signo · **montos de referencia** (presupuesto, monto de oportunidad, precio, tarifa) en blanco **sin signo**.
- El signo va siempre escrito (se entiende sin color). Cifras tabulares, a la derecha. Totales en 800 con el color de su signo.
- Atraso ≠ negativo: una cobranza vencida sigue **+ verde**; el atraso lo dicen anillo, fecha y franja naranja de la fila.
- Tarjeta de crédito / deuda / consumos / cuotas / IVA a pagar / Mi Deuda → saldo en −.
- Anulado: tachado, gris, no suma a ningún total.
- Growth (gasto, CPL, CAC, ingresos atribuidos) va sin signo (es análisis, no caja); solo ROI con +/−. Gráfico de flujo: ingresos celeste, egresos gris.
- Tokens: `--color-money-positive` / `--color-money-negative` → clases `text-money-positive/negative`. Componente: `Money` / `GuardedMoney` (este respeta permisos de plata por rol).
- Formato argentino: `$ 1.234.567,89` · `USD 8.900` · abreviado `+$ 12,48 M` en KPIs · horas `2,5 h` · fechas `DD/MM`, relativas ("hace 5 días", "Hoy 18:00", "vie 19/09") · CUIT `30-71234567-1` en mono.

## Tipografía — Plus Jakarta Sans
| Token | Uso | Spec |
|---|---|---|
| display | Solo pantallas de marca | 400 · 50→34 |
| h1 | Título de página (PageHeader) | 500 · 36 |
| h2 | Título de panel | 700 · 24 |
| h3 | Título de card | 700 · 17 |
| body-lg / body | Lectura / UI | 400 · 16 / 15 |
| ui | UI densa | 500 · 14 |
| small / caption | Chips / captions | 600 · 13 / 12 |
| kicker | Rótulo de sección | 700 · 14 · +.04em · lima sobre oscuro |
| label | Encabezados de tabla | 700 · 12 · +.04em |
| stat / number-lg / number | KPIs y montos | 800 · 60→40 / 800 · 30 / 700 · 16 · tabular |
| mono | CUIT, IDs, timers | ui-monospace |

Mínimo 12 px en toda la interfaz; inputs 15 (16 en mobile para que iOS no haga zoom). El H2 liviano es firma de marca. Hero 80/800 solo en login/onboarding, nunca dentro del ERP. Texto lima solo sobre oscuro (sobre claro va como resaltador).

## Forma y espacio
- Múltiplos de 4 (`--space-1…24`: 4·8·12·16·20·24·32·48·64·72·96). Gap de cards 18; padding de sección 72/48.
- **Radios con rol**: 10 inputs/tiles · 14 avisos/celdas · 18 paneles/tarjetas (`rounded-lg`) · 30 cards base (`rounded-xl`) · pill botones y chips. (En el ERP `rounded-lg` = 18 y `rounded-xl` = 30.)
- **Todo botón es píldora.** Tamaños sm 32 (filas/toolbars) · md 40 (default) · lg 52 (mobile y diálogos).
- En oscuro la profundidad sale de **alternar negros + borde .06–.1**, no de sombras. Única sombra: lo que flota (menús, diálogos, toasts) `0 24px 56px rgba(0,0,0,.45)` → `shadow-overlay`.
- Breakpoints: `<640` una columna, navegación abajo, detalle como hoja inferior, botones 52 · `640–900` kanban con scroll horizontal y snap, sidebar como cajón · `>900` sidebar fija 260 px, contenido hasta 1216 en 12 columnas.
- Grano global .12 (claro .05). Nada de tramas de puntos ni ilustraciones de trazo.

## Capas y el rincón de la X (v1.11, 21/9/2026)
Salió de un reclamo de Santiago: *"la cruz para cerrar queda siempre sobreexpuesta con el texto de ayuda o con algún tooltip… no quiero seguir renegando con esto"*. Se arregló en el sistema, no pantalla por pantalla.
- **Nunca se escribe un `z-index` a mano.** Se elige una capa (tokens `--z-*`, clases Tailwind): `z-behind` −1 · `z-base` 0 · `z-raised` 1 (celda fija de tabla, flechas ‹ ›, sellos) · `z-sticky` 20 (barras pegadas dentro de un panel) · `z-header` 30 · `z-floating` 40 (Chimpa IA, barra de abajo) · `z-overlay` 50 (diálogos, sheets, drawers, menús, popovers, select) · `z-overlay-top` 60 (lo que se abre arriba de un diálogo) · `z-close` 70 · `z-snack` 90 · `z-toast` 100 · `z-tooltip` 120 (la ayuda **siempre** gana) · `--z-grain` 9998. `tests/uiTokens.test.ts` falla si aparece un `z-50` o un `z-[999]` suelto en `client/src`.
- **El rincón de arriba a la derecha es de la X.** `--close-gutter` (3,5 rem; 4 rem en el celular) → clase `pr-close-gutter` / `closeGutter`. `DialogHeader` y `SheetHeader` ya lo traen puesto. Red de seguridad en `index.css`: el panel lleva `data-ds-panel` y el título `data-ds-title`, y la primera fila reserva el ancho de la cruz aunque la pantalla arme su propio encabezado. **Ningún chip de estado, título largo ni botón de ayuda entra ahí.**
- **La X es una sola pieza**: `client/src/components/ui/close-button.tsx` (`closeButtonClass` + `<CloseIcon />`). Fondo sólido y borde propios (se lee aunque algo quede atrás), 36 px en escritorio y 44 px en el celular, rótulo «Cerrar». No se escribe una cruz suelta en una pantalla.
- En las tablas: lo que la persona tiene que ver va en la 1ª o en la última columna (las fijas); las flechas ‹ › se paran en el borde de esas columnas, nunca encima.

## Íconos — un significado, un ícono
- Sprite propio de **129 íconos** (`<Icon name="cobrar" size="md" />`, nombres en `client/src/components/ds/icons.generated.ts`). Line 2 px, puntas redondas, máx 3 trazos, área útil 18 px en grilla 24. Lucide **solo** para genéricos que el sprite no tiene (Video, Upload, Ban, Tag, flechas del editor).
- Tamaños 16 chips · 18 botones · 20 base · 24 celdas. Celeste cuando identifican (módulo/tipo/canal); lima cuando acompañan una acción. Ícono delante (acción) o detrás (flecha de avance). Ícono solo = botón de ícono con `aria-label`.
- **Diccionario de verbos** (cada uno con su dibujo y su palabra):
  - **cancelar** = salir sin guardar / sacar de circulación pero vuelve
  - **anular** = VOID contable (contra-asiento)
  - **descartar** = borrador o feedback
  - **desactivar** = ítem de catálogo
  - **archivar** = se oculta y se recupera
  - **eliminar** = irreversible (solo en diálogo de confirmación)
  - **cobrar ≠ pagar** (moneda con + / −), **facturar ≠ factura ≠ propuesta**, **reprogramar ≠ generar**, **revelar clave** = acción auditada. Sparkles/IA solo si interviene la IA.

### Íconos animados (v1.7) — "el ícono hace lo que dice"
51 de 129 se mueven, **solo para repetir su verbo**, una vez, con tokens existentes. El movimiento sale del **nombre** (catálogo `ICON_MOTION`), no de una prop: no inventar animaciones propias.
- **Mientras** (hover/foco del control, no de la fila): avanzar (flecha 2–2,5 px), mostrar (tapa, hoja, +, lápiz).
- **Una vez** (`play`): girar (actualizar, restaurar, posponer), trazar (tilde al completar — nunca en hover), avisar (campana al llegar algo, temblor en error; única oscilación del sistema).
- **En curso** (`busy` / `aria-busy`): latir 1,6 s (dictar, cronómetro, Chimpa IA). **Máximo un latido por pantalla**; el texto del botón cambia a la vez ("Actualizando…").
- No: animar íconos de identidad, loops en listas/tableros, rebotes, >600 ms, >3 px. `prefers-reduced-motion` deja todo quieto (ya global).

## Movimiento
Tokens cerrados: `--dur-fast 150` hover de links/chips/filas · `--dur-base 250` botones, lift de cards, toggles, toasts · `--dur-rev 450` reveals, indicador de pestañas, sheets · `--dur-hero 600` contadores de KPI, login. Curva única `ease-brand` = `cubic-bezier(.22,1,.36,1)`; `ease-io` para ida y vuelta (reordenar kanban). Sin rebotes ni resortes.
Firmas: CTA hover −2 px + brillo + glow lima · card de kanban hover −4 px + borde lima · anillo que se llena y pasa a verde en 250 ms · KPI que cuenta desde el valor anterior en 600 ms · toast con barra de deshacer · punto lima del cronómetro que late cada 1,6 s.

## Imagen y mundo 3D
> **Cambio de criterio (5/10/2026, Santiago: "es absurdo no brandear el ERP, todos los datos que vemos son aburridos, hay que darle el espíritu de la marca").** Se levanta la restricción de que el 3D y los recursos de marca vivan solo en login, onboarding y vacíos: las **portadas y bandas de los tableros** (Finanzas, Comercial, etc.) llevan marca — fondo petróleo/cálido con brillo, grano, hoja de monstera o selva como marca de agua, kicker celeste + título liviano grande, cifras grandes. Límites que siguen: la marca nunca tapa ni compite con un dato, el lima sigue siendo solo acción, la IA sigue en lima y negro. Referencia aprobada: `docs/design-system/propuestas/modo-trabajo/prints/H-A-banda-de-datos.png`. **La guía todavía dice lo contrario: actualizarla en el mismo commit que implemente la primera portada.** Los niveles de abajo quedan como estaban para lo demás.
- **Nivel 01 flat**: iso en sidebar, favicon, avatar de Chimpancé (iso real con pupilas; verificar contra `Logos/IsoChimpance-blanco.png`). Nunca en 3D.
- **Nivel 02 mono mate sobre lima**: estados vacíos. Un solo objeto 3D por composición. Assets en `Chimpa/brand/recursos/`.
- **Nivel 03 premium glossy con glow**: solo login y onboarding, nunca dentro de un bloque de UI.
- El mono 3D **no** es el Chimpa IA. Avatares: iniciales en lima o celeste suave con aro; clientes con `CompanyLogo` (blanco uniforme sobre negro); dueño con avatar/iniciales, nunca con un color.
