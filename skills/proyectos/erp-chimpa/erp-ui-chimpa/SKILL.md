---
name: erp-ui-chimpa
description: Especialista en UI/UX del Chimpancé ERP+CRM (Chimpa-Finanzas) — diseña, implementa, revisa y corrige la interfaz aplicando el design system "Selva señalizada" (v1.7, variante A) que ya está implementado en la rama dev. Sabe las reglas visuales (lima = acción, un solo primario por pantalla; celeste = identidad y datos; plata con signo + verde / − rojo; ámbar = advertencia; IA solo lima y negro), la biblioteca real de componentes (`@/components/ds`, `ds/form`, `components/mobile`, `components/crm`, catálogos `lib/meta`), los 9 patrones de interacción, los 7 estados de pantalla, las 12 reglas de carga de datos, el celular con acciones rápidas, la voz de interfaz y El Chimpa IA, las piezas comerciales del CRM (LeadHero, NextStep, QuickLog, WinDialog/LossReasonDialog, DealCard, CallQueue, ForecastBar) y cómo se verifica en dev-finanzas. Invocar SIEMPRE que Santiago pida algo de la INTERFAZ del ERP o del CRM, por ejemplo "diseñá la pantalla de… del ERP", "cómo debería verse…", "esto se ve mal / feo / todo igual", "rediseñá el detalle del lead / el pipeline / Hoy / el formulario de…", "armá un componente", "revisá la UI del ERP", "auditoría visual", "pasalo al design system", "aplicá Selva señalizada", "el botón / el color / el ícono / el vacío / el toast de…", "cómo queda en el celular", "tema claro", "el Chimpa IA en la pantalla…", "cambiá la guía / los tokens / el DS del ERP", o cualquier tarea en `client/src` que cambie lo que el usuario ve. Se encadena con otros dos — `ux-chimpa` define la experiencia en abstracto (flujo, pasos, wireframe lo-fi en gris, textos) para todos los productos Chimpa; ESTE la baja al ERP con Selva señalizada y los componentes reales; `erp-chimpa-finanzas` manda en dominio, ambientes dev → producción, migraciones, deploys y tablero de sesiones.
---

# Chimpancé ERP · Especialista en UI/UX

Skill que carga todo el criterio de interfaz del ERP+CRM interno de Chimpancé para diseñar y construir pantallas que se lean de un vistazo, sin redescubrir la guía cada vez. Santiago **no programa**: decide viendo. Mostrarle opciones visuales y capturas, explicarle en criollo, y no reportar nada como listo sin haberlo visto en pantalla.

**Cómo se reparten los skills**
| Skill | Manda en | Cuándo pasarle la posta |
|---|---|---|
| `ux-chimpa` | La experiencia en abstracto, para cualquier producto Chimpa: intención, flujo en pasos, clics, wireframe lo-fi en gris, microcopy, auditoría de usabilidad | Cuando el pedido todavía es "cómo debería funcionar" y no hay flujo acordado, o es de otro producto (sitio, propuestas). Su resultado entra acá como insumo |
| **`erp-ui-chimpa`** (este) | La interfaz concreta del ERP/CRM: Selva señalizada, qué componente de `@/components/ds` va, estados, tokens, celular, El Chimpa IA, implementación visual y QA en dev | Siempre que la salida sea una pantalla del ERP (diseño de alta fidelidad, código o revisión) |
| `erp-chimpa-finanzas` | Dominio, API, schema, ambientes dev → producción, rama, tablero de sesiones (cap. 10), gotchas (cap. 03) | Si la tarea toca código del repo, invocarlo también. Este skill no repite el workflow de deploy; lo respeta |

Si `ux-chimpa` y este dicen distinto sobre el ERP, gana lo que está en la guía del DS (`#patrones`, `#pantallas`, `#carga`), que ya fue decidida con Santiago.

## Dónde está la verdad
| Qué | Dónde |
|---|---|
| Guía visual (fuente de verdad) | `Chimpa-Finanzas/docs/design-system/_build/styleguide.src.html` (secciones por `id`) + `styleguide.css` + `styleguide.js` · artifact https://claude.ai/code/artifact/df8a99ba-cb7c-4dda-ae66-943988ac014f |
| Tokens | `docs/design-system/tokens.json` / `tokens.css` (generados por `_build/build_tokens.py`) |
| Reglas de implementación + checklist vivo | `docs/design-system/IMPLEMENTACION.md` (qué entró, 🟨 en dev / ✅ verificado, decisiones, pendientes de backend) |
| Receta de migración por pantalla | `docs/design-system/ZONAS.md` |
| Historia de versiones del DS | `docs/design-system/_ESTADO.md` |
| Código | **`origin/dev`** (la carpeta local puede estar en otra rama: leer con `git show origin/dev:<ruta>`) |
| Marca madre | `Chimpa/brand/styleguide-theme.html` + `motion-styleguide.html` |
| Auditoría CRM | `docs/auditorias/crm-2026-09/` |

Si la guía y `IMPLEMENTACION.md` no coinciden, **manda la guía**; si la guía no dice nada, se decide con criterio, se anota en `IMPLEMENTACION.md › Decisiones` y se le cuenta a Santiago.

## Reglas de oro (no se negocian)
1. **Un solo primario lima por pantalla o diálogo.** Lo demás neutro/ghost. El lima nunca decora ni marca un estado de negocio.
2. **Celeste = identidad y datos** (módulos, tipos, canales, cifras, links). Nunca un botón.
3. **Estado = forma + color**: anillo (`StatusPill`/`StatusGlyph`), categoría = chip celeste con ícono (`TypeChip`), urgencia = barras o fecha. Se entiende sin distinguir colores. Lo normal no se muestra.
4. **Plata con signo**: + verde entra, − rojo sale, 0 gris, referencia (presupuesto, monto de oportunidad) blanca sin signo. Siempre con `Money`/`GuardedMoney`. Atraso ≠ negativo.
5. **Cero hex, rgb, hsl o colores de paleta Tailwind en `.tsx`.** Solo tokens (`bg-surface`, `text-ink-secondary`, `text-money-positive`…) o componentes. Si falta algo: marca → token `[ERP]` → regenerar.
6. **Un significado, un ícono** del sprite (`<Icon name>`); diccionario cancelar / anular / descartar / desactivar / archivar / eliminar. Lucide solo para genéricos. El movimiento sale del nombre; un solo latido por pantalla.
7. **Deshacer antes que confirmar**: reversible → toast con Deshacer; riesgo → diálogo `risk`; irreversible → `ConfirmDialog` `danger` con escribir para confirmar y botón naranja solo adentro. Nada que salga al cliente sin clic humano. Nunca `window.confirm`.
8. **Siete estados por pantalla** con `ScreenState`: cargando con forma, vacío primera vez (mono sobre lima), sin resultados, error (nunca disfrazado de "no hay datos"), sin permisos, archivado, desactualizado/guardando.
9. **Cargar datos no es un trámite**: `FormField` único, empezar por el dato que completa el resto, buscar antes de crear (`EntityCombobox`), lo mínimo visible, formatos argentinos al tipear, `todayAR()`, nunca perder lo cargado (`useDirtyGuard`/`useDraftAutosave`), errores humanos al lado del campo (`translateError`), botón que dice qué crea.
10. **Todo lo abierto tiene próximo paso** y las fechas por defecto son el próximo día hábil 10:00, nunca "ahora".
11. **La IA propone, la persona confirma.** Todo lo de IA con borde lima + firma del Chimpa IA + confianza; el botón nombra exactamente lo que va a pasar. Solo lima y negro, sin celeste ni gradiente.
12. **Voz**: voseo, sin emojis, verbo + objeto ("Registrar cobro"), el aviso dice qué pasó y qué hacer, nunca "Éxito" ni "¿Estás seguro?".
13. **Celular**: zona del pulgar, ≥ 44 px, inputs 16 px, gestos solo para lo reversible y siempre con botón visible; la plata no se encola sin conexión ni se confirma desde una notificación.
14. **Las tablas y el desplazamiento no se hacen a mano.** *(21/9/2026, Santiago: "no estás aplicando las soluciones que implementamos para desplazarse por las tablas".)*
    - Toda tabla usa `<Table>` de `@/components/ui/table`: flechas ‹ ›, 1ª columna fija a la izquierda y la de acciones fija a la derecha, sombra de "hay más para este lado". **Nunca** un `<table>` suelto, un `overflow-x-auto` propio ni un `position:sticky` escrito para esa pantalla.
    - Lo que no es tabla y no entra de ancho: `HScroll` / `useHScroll` de `@/components/ds/scroller`.
    - Corolario de diseño: en una tabla ancha, **lo que la persona tiene que ver siempre va en la 1ª o en la última columna**, porque son las que quedan fijas (la última se reconoce por su encabezado en `sr-only`). Ejemplo: en la grilla pública de reuniones, la 1ª columna es el horario **y** los botones de la persona, y la última es el resumen del horario.
    - Antes de inventar una solución de UI, buscar si ya existe: `@/components/ds`, `ds/form`, `components/ui`, `components/mobile`.
    - **Gotcha resuelto en la pieza (22/9/2026)**: una tabla adentro de un diálogo, una grilla (`grid`) o un flex ensanchaba al padre hasta el ancho de la tabla, y el que scrolleaba era el diálogo entero, sin flechas ni columnas fijas (pasó en el detalle de "Coordinar reunión" con ocho invitados). `<Table>` y `HScroll` llevan `contain: inline-size` en su envoltorio: no hace falta `min-w-0` ni `overflow-hidden` en cada pantalla. Si una tabla nueva "no muestra las flechas", verificar primero que sea `<Table>` de `components/ui/table` y que el que scrollea sea SU envoltorio (`scrollWidth > clientWidth`), no un ancestro.
15. **El panel manda sobre su contenido** *(22/9/2026, Santiago: "no se respetó ninguna regla de UX/UI en responsive")*. Un hijo de un flex o de un grid trae `min-width: auto` y **no se achica por debajo de su contenido**: una fila con un nombre y un mail largos estira el diálogo y en el celular el botón principal queda fuera de la pantalla (pasó en "Volver a escribirles": 126 px afuera a 375 px; en "Ver los links", 142 px).
    - El DS ya trae la **red de contención** en `index.css`: dentro de `[data-ds-panel]` los contenedores de maquetación pasan a `min-width: 0`, con `:where()` (especificidad 0). No toca botones, campos, tablas ni medios.
    - La red no exime de lo correcto: **`min-w-0` en la fila** y `truncate` en lo que se corta. Y la red **no puede** con un ancho duro escrito a mano (`min-w-[760px]`): eso es un desplazamiento hecho a mano y va con `<Table>` o `HScroll` (regla 14).
    - **Una fila de persona no va en una sola línea**: nombre arriba, mail abajo truncado, estado que no se parte, y 44 px de alto en el celular. En una línea se cortan los dos y no se distingue a dos personas con el mismo nombre de pila.
    - `DialogContent` es `w-[calc(100%-2rem)]` y `p-4 sm:p-6`: el panel nunca toca los bordes.
    - **El ancho lo da la escala, no el gusto** (22/9/2026): `max-w-panel-confirm` 560 (avisos, confirmaciones) · `panel-form` 760 (formularios) · `panel-list` 980 (con lista o tabla) · `panel-max` 1200 (techo, entra en una notebook de 14"). Nada de `sm:max-w-md` nuevo.
    - **En escritorio, ancho sin pares de campos no sirve**: estirar los campos no baja la altura. Un formulario de 5+ campos va con `FormRow` (dos columnas, `cols={3}` para campos cortos); `FormRow` mide contra el PANEL, no contra la ventana. Referencia: Nuevo lead pasó de 385 px de scroll a 0.
    - **Lo que NO funciona**: dos columnas de *secciones* (`FormColumns`, probado y revertido el 22/9): cada columna queda en 427 px, los pares de adentro se deshacen y el scroll sube. Para un formulario largo de verdad, pasos o agrupación.
    - **Cómo se verifica a 375 px**: el navegador no deja achicar la ventana, así que se abre un `<iframe>` de 375 px contra dev-finanzas desde la consola de la propia página (misma sesión, breakpoints reales) y se mide `scrollWidth - clientWidth` de cada `[data-ds-panel]`. Receta completa en el cap. 06.
16. **Capas y el rincón de la X** *(21/9/2026, Santiago: "la cruz para cerrar queda siempre sobreexpuesta… no quiero seguir renegando con esto")*. Nunca un `z-index` a mano: se elige una capa del DS (`z-raised · z-sticky · z-header · z-floating · z-overlay · z-overlay-top · z-close · z-snack · z-toast · z-tooltip`). El rincón de arriba a la derecha de todo panel es de la cruz: los encabezados lo reservan con `closeGutter` y la X sale siempre de `components/ui/close-button.tsx`. Ver cap. 01.
17. **Una tarea de UI no cambia** lógica de negocio, API, query keys, payloads, rutas, permisos ni `data-testid`. Si falta un dato del backend, se anota y se avisa (o se pasa por `erp-chimpa-finanzas`).

## Cómo trabajar según el pedido

**A · "Diseñá / cómo debería ser" (pantalla o flujo nuevo, o rediseño grande)**
1. Entender la tarea real: quién la hace (rol: admin, PM, ventas, contador, colaborador), en qué dispositivo, cada cuánto, qué decisión toma ahí. Leer el capítulo del dominio en `erp-chimpa-finanzas`.
2. Inventario: qué piezas de `@/components/ds`, `ds/form`, `crm/`, `mobile/` ya resuelven esto (cap. 02). No inventar un componente si existe; si de verdad falta, diseñarlo con tokens y proponerlo para la guía.
3. **Estructura liviana primero**: jerarquía en texto (PageHeader → qué se ve arriba → acción principal → estados) o una maqueta HTML chica con las clases `ds-`/tokens. Si hay dudas de dirección, 2–4 opciones lado a lado en `docs/design-system/propuestas/<tema>/` y que Santiago elija (cap. 06 D).
4. Con el OK, implementar (B) o sumarlo a la guía (D).

**B · "Implementá / pasalo al DS / arreglá esta pantalla"**
Receta de 11 pasos del cap. 06 A (colores → botones → estados/catálogos → íconos → estructura → estados de pantalla → datos → formularios → patrones → voz → 375 px y tema claro), checks automáticos del cap. 06 B, QA visual del cap. 06 C en dev-finanzas. Limpiar la deuda de la zona que se toca (cap. 02) sin abrir refactors transversales.

**C · "Revisá la UI / auditá / esto se ve mal"**
Recorrer en dev-finanzas (escritorio, 375, tema claro) contra las reglas de oro y los checklists (cap. 03, 04). Cada hallazgo: qué se ve, qué regla rompe, `archivo:línea`, severidad (4 pierde datos o plata · 3 bloquea o miente · 2 confunde · 1 cosmético), pieza del sistema que lo resuelve. Si es largo, entregarlo como página con `_build/build_page.py` y publicarlo como artifact. Priorizar lo que pierde datos o plata.

**D · "Cambiá la guía / un token / un componente del sistema"**
Cap. 06 D: fuentes en `_build/`, `build_tokens.py` → `build_styleguide.py` → `build_erp.py`, contraste 112/112, `_ESTADO.md` e `IMPLEMENTACION.md` al día. Revisar antes que no haya otra sesión editando los mismos archivos.

## Al terminar (siempre)
- Evidencia visual: captura de escritorio + celular de lo que cambió (cap. 06 C).
- Contarle a Santiago en criollo qué cambió, qué tiene que probar y dónde (URL de dev), sin jerga.
- Tachar en `IMPLEMENTACION.md` lo que se verificó; anotar decisiones y pendientes de backend.
- Seguir el tablero de sesiones y la escalera dev → producción de `erp-chimpa-finanzas` (nunca a producción sin OK puntual).
- Si se decidió algo nuevo de diseño con Santiago, llevarlo a la guía (o anotarlo como pendiente de la guía) para que no quede solo en el código.

## Capítulos
- **[01_fundamentos.md](01_fundamentos.md)** — color (variante A, fondos por sección, grises), plata con signo, tipografía, forma y breakpoints, íconos + diccionario de verbos + íconos animados, movimiento, imagen y mundo 3D. Leer antes de decidir cualquier cosa visual.
- **[02_componentes_y_codigo.md](02_componentes_y_codigo.md)** — stack de estilos, clases de token de Tailwind, variantes de Button/Badge/Toast, API de `@/components/ds`, `ds/form`, `mobile`, catálogos `lib/meta`, cáscara y datos, **deuda de UI conocida**. Leer antes de escribir código.
- **[03_patrones_ux.md](03_patrones_ux.md)** — jerarquía de acciones, estados y señales, confirmar según gravedad, avisos, 9 patrones de interacción, 7 estados de pantalla, 12 reglas de carga y errores, celular y acciones rápidas, navegación. Leer para cualquier flujo, formulario o pantalla nueva.
- **[04_crm_comercial.md](04_crm_comercial.md)** — mapa de pantallas del CRM, flujo lead → proyecto, reglas de LeadHero/NextStep/QuickLog/cierre/pipeline/listas/CallQueue/pronóstico, roles visibles, estado y pendientes de backend, checklist comercial. Leer para todo lo de Leads, Oportunidades, Empresas o ventas en Hoy.
- **[05_voz_y_chimpa_ia.md](05_voz_y_chimpa_ia.md)** — voz de interfaz con ejemplos sí/no, El Chimpa IA (nombre, cara, 8 estados, tamaños, personalidad, borradores). Leer para textos, avisos, vacíos y todo lo que toque IA.
- **[06_receta_qa_y_guia.md](06_receta_qa_y_guia.md)** — receta por pantalla, checks automáticos, QA visual en dev-finanzas, pendientes de Fase 9, cómo cambiar la guía y los tokens, explorar direcciones, gotchas del entorno. Leer al implementar, al revisar y al tocar el DS.

## Mantener este skill vivo
Cuando cambie la guía (nueva versión en `_ESTADO.md`), la API de `components/ds`, el estado del checklist o una decisión de diseño de Santiago, actualizar el capítulo que corresponde en la misma sesión (fecha absoluta incluida). Si algo de acá contradice lo que hay en `origin/dev`, gana el código real: corregir el capítulo.
