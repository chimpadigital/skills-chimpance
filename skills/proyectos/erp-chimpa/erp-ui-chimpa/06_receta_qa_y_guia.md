# 06 · Receta por pantalla, QA visual y cómo se cambia la guía

## A · Receta por pantalla (migrar, arreglar o construir) — en este orden
Sale de `docs/design-system/ZONAS.md` (la usaron los agentes de zona el 12/9/2026). Vale igual para una pantalla nueva.

1. **Colores** — cero hex, `rgb()`, `hsl()` sueltos y cero colores de paleta Tailwind (`text-green-600`, `bg-amber-100`, `border-red-500`…). Todo por tokens o componentes. Variante A: lima acción/selección/en curso; celeste identidad y datos; verde/naranja/ámbar estados; plata con signo.
2. **Jerarquía de botones** — UN primario por pantalla o diálogo. Resto neutro/ghost. Riesgo reversible → `danger-soft`. Eliminar/anular/cerrar período → `useConfirm`/`ConfirmDialog` (tone `risk` o `danger`), botón `destructive` solo adentro del diálogo. Nada de `window.confirm`.
3. **Estados y catálogos** — estado → `StatusPill`/`StatusGlyph`; tipo/categoría/canal → `TypeChip`; prioridad → `PriorityBars`; vencimiento → `DueChip`. Mapas locales de label/color/ícono → `client/src/lib/meta/<zona>.ts` (`MetaCatalog`) y se borran las copias.
4. **Íconos** — dominio con `<Icon name>` del sprite (buscar en `icons.generated.ts`); lucide solo genéricos. Aplicar el diccionario de verbos.
5. **Estructura** — `PageHeader` arriba (migas, título, subtítulo, stats en línea, acciones con un primario). `Section` con fondo de variante A cuando corresponde (data plata/métricas · jungle logros · warm aperturas). Sin `hover-elevate` ni `no-default-active-elevate` (restos de Replit).
6. **Estados de pantalla** — cada consulta principal en `ScreenState` (skeleton con forma, vacío primera vez con `EmptyState`, vacío por filtro, error con reintentar, sin permiso, desactualizado). Cuidado con `fetch().json()` que no dispara error ante caída de red: usar el `apiRequest`/queryFn común.
7. **Datos** — `Money`/`GuardedMoney` (borrar `formatMoney` locales), `HoursMeter`, `Avatar`/`AvatarStack`, `CompanyLogo`, `Timer`, `KpiCard` (+ `Delta`, `Sparkline`), `ActivityTimeline`.
8. **Formularios** — `FormField` + campos específicos (`MoneyField`, `DateField` con `todayAR`, `CuitInput`, `HoursField`, `CbuField`, `PhoneInputAR`, `EntityCombobox` en selects con muchas opciones), `ErrorSummary` + `translateError`, `SubmitBar` con verbo, `useDirtyGuard` en diálogos/sheets con datos, `useDraftAutosave` en altas largas, `MoreFields`, `DateQuickPicks` en vencimientos. **El payload a la API no cambia.**
9. **Patrones v1.2** — detalle editable → `InlineField` + `SaveIndicator`; tableros → `MoveToMenu` además del arrastre; listas del celular → `SwipeRow` para las 2 acciones más comunes.
10. **Voz** — botones con verbo de lo que pasa, avisos con qué pasó y qué hacer, vacíos que invitan, voseo, sin emojis, "el Chimpa IA".
11. **Responsive y tema claro** — se usa bien a 375 px y en `data-theme="light"` (si todo es token, sale solo).

**Límites de una tarea de UI**: no se cambia lógica de negocio, llamadas a la API, query keys, payloads, rutas, permisos por rol ni `data-testid` (los usan los tests). Si la pantalla necesita un dato que la API no da → se anota en `IMPLEMENTACION.md › Pendientes que necesitan backend` y se avisa, o se pasa la parte de backend por el skill `erp-chimpa-finanzas`.

## B · Checks automáticos antes de subir a dev
```bash
# hex, rgb/hsl y colores de paleta Tailwind en lo que tocaste (debe dar vacío)
git diff --name-only origin/dev -- 'client/src/**/*.tsx' | xargs grep -nE "#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|\b(bg|text|border|ring|fill|stroke)-(red|green|amber|yellow|blue|sky|indigo|slate|gray|zinc|emerald|orange|rose|cyan|teal|violet|purple)-[0-9]{2,3}\b"
```
```bash
# más de un primario por archivo (revisar a mano los que den > 1)
grep -c '<Button\b[^>]*\(variant="default"\|>\)' client/src/pages/Archivo.tsx
```
- `window.confirm`, `hover-elevate`, `"Cargando..."` suelto, `new Date().toISOString().slice(0, 10)`, `toast(... error.message)` crudo → deben dar 0 en lo tocado.
- `npm run build` sin errores + `npx tsc --noEmit 2>&1 | grep "error TS" | grep -E "<tus archivos>"` sin errores nuevos (la línea base general está en el skill `erp-chimpa-finanzas` cap. 03).
- Tests del DS: `client/src/components/ds/form/__tests__/` (147 tests de format/errors/form). Si tocaste `ds/` o `lib/format`/`lib/errors`, correrlos.
- Hooks antes de cualquier `return` temprano (gotcha que ya rompió `ReviewPublic.tsx`).

## C · QA visual (no se reporta "listo" sin verlo)
Se verifica en **https://dev-finanzas.chimpance.digital** (no hay ambiente local) con el **Chrome real (Claude in Chrome, `mcp__claude-in-chrome__*`)**, donde **siempre está logueado el admin de dev**. No usar el panel Browser interno (`preview_start`): no tiene sesión. Si el Chrome aparece deslogueado, **Santiago inicia sesión él mismo** (Claude no escribe contraseñas en formularios). Este recorrido visual se suma al **test obligatorio antes de terminar** del skill `erp-chimpa-finanzas` (cap. 01): camino feliz que persiste, bordes, regresión, consola, evidencia y limpieza.

Recorrido mínimo por pantalla tocada:
1. **Escritorio** (~1440): jerarquía (un lima), estados y señales, plata con signo, alineación de cifras, foco visible con Tab.
2. **Celular 375** (`resize_window` del Chrome a 375 de ancho, recargar): una columna, BottomNav, nada tapado, botones ≥ 44, inputs 16 px, sin scroll horizontal del body.
3. **Tema claro**: cambiar tema desde la app (o `document.documentElement.dataset.theme = "light"` + quitar `.dark` vía `javascript_tool` solo para inspeccionar); revisar contraste de texto lima (en claro va `lima-800`/resaltador) y bordes.
4. **Los 7 estados**: forzar vacío (filtro imposible "zzz"), error (red offline en DevTools no se puede → revisar que el código use `ScreenState` con `isError`), skeleton (recarga lenta).
5. **Interacciones**: toast con Deshacer, DirtyGuard al cerrar con cambios, ConfirmDialog con la gravedad correcta, SaveIndicator en InlineField, íconos animados (uno solo latiendo).
6. `read_console_messages onlyErrors` sin errores nuevos.
7. Evidencia: screenshot de escritorio + mobile de lo cambiado en el reporte a Santiago.

Para páginas largas o la styleguide (HTML estático): **Playwright** desde Python en el scratchpad (`page.screenshot(full_page=True)`, partir con PIL; mobile a 390). Edge headless y capturas del panel con viewport emulado fallan.

**Estado al 14/9/2026**: tandas 1–4 en dev (todo el sistema aplicado; guardián `tests/uiTokens.test.ts` hace fallar el deploy con hex, rgb, paleta Tailwind o window.confirm). Pendiente: que Santiago pruebe en dev (celular y tema claro incluidos) y el pase a producción con su OK; lo de backend del CRM (fecha de próxima tarea por lead, registrar contacto + estado en una transacción, motivo de descalificación en `statusChangeReason`). Estado vivo: `docs/design-system/IMPLEMENTACION.md › Checklist` (🟨 = en dev falta verlo · ✅ verificado). **Tachar ahí lo que se verifica.** Gotcha QA: si la ventana de Chrome está minimizada (`innerWidth` 0) no hay capturas; verificar leyendo el DOM con `javascript_tool` y avisar.

## C2 · Probar a 375 px de verdad (22/9/2026)

Chrome no deja achicar la ventana desde las herramientas, y el navegador interno no tiene sesión del ERP. La forma que funciona: **un iframe de 375 px dentro de la propia página de dev-finanzas** — misma sesión, mismas media queries, breakpoints reales.

```js
// en la consola de la página de dev-finanzas, ya logueado
const f = document.createElement('iframe');
f.id = 'qa-frame';
f.style.cssText = 'position:fixed;right:8px;top:8px;width:375px;height:812px;z-index:999999;border:2px solid #D9F45F';
f.src = '/proyectos/7?tab=reuniones';
document.body.appendChild(f);
```

Con `f.contentDocument` se navega, se hace clic y se mide. La medición que importa, por cada panel abierto:

```js
[...f.contentDocument.querySelectorAll('[data-ds-panel]')].map(p => ({
  titulo: p.querySelector('[data-ds-title]')?.textContent,
  desborde: p.scrollWidth - p.clientWidth,       // > 0 = se sale de la pantalla
  izq: p.getBoundingClientRect().left,            // margen contra el borde
}));
```

Para saber **quién** desborda: quedarse con los elementos cuyo `getBoundingClientRect().right` supera el borde derecho del panel, y de esos con los que no tienen un ancestro también culpable — esos son las raíces del problema.

Dos detalles del instrumental:
- Los menús de Radix (`DropdownMenuTrigger`) **no se abren con `.click()`**: hay que despachar `pointerdown`/`mousedown`/`pointerup`/`mouseup`/`click`.
- Para comparar "antes y después" de la red de contención del panel sin tocar el código, se la apaga con una regla de más peso: `[data-ds-panel] :is(div,ul,li,...){min-width:auto}`.
- Evaluar de a 3 o 4 pantallas por vez: más de ~45 s en una sola evaluación corta la conexión con el navegador.

## D · Cambiar el design system (la guía y los tokens)
Cuando algo no está en la guía o Santiago pide un cambio de diseño:
1. Buscar primero en la marca (`Chimpa/brand/styleguide-theme.html`, `motion-styleguide.html`). Si no está → token `[ERP]`.
2. Editar las fuentes, nunca los generados:
   - Tokens: `docs/design-system/_build/build_tokens.py` → `python build_tokens.py` (genera `tokens.json`/`tokens.css`).
   - Guía: `_build/styleguide.src.html` + `styleguide.css` + `styleguide.js` (+ `icon-motion.css/js`, `sprite.svg`) → `python _build/build_styleguide.py [salida_artifact.html]` genera `styleguide.html`.
   - Al ERP: `python docs/design-system/_build/build_erp.py` genera `client/src/styles/tokens.css`, `client/src/styles/ds.css` (toda clase con prefijo `ds-`: `.btn--primary` → `.ds-btn--primary`, estados `is-running` → `ds-is-running`, keyframes `ds-spin`) y `client/src/components/ds/icons.generated.ts`.
   - Capa a mano: `client/src/styles/ds-erp.css` (variante A, color por movimiento, fondos por sección).
3. Contraste: `python ~/.claude/skills/design-system-marca/scripts/check_contrast.py docs/design-system/tokens.json` → tiene que seguir 112/112 (o el nuevo total, todos AA).
4. Actualizar `_ESTADO.md` (versión y qué cambió) e `IMPLEMENTACION.md › Decisiones` si afecta el código; republicar el artifact de la guía si Santiago lo quiere ver: https://claude.ai/code/artifact/df8a99ba-cb7c-4dda-ae66-943988ac014f
5. Otras páginas con el DS (auditorías, propuestas de diseño): `_build/build_page.py <src> <salida> [artifact]` con `page.css` al lado.

**Explorar direcciones antes de decidir**: cuando Santiago no tiene claro qué quiere (pasó con el Chimpa IA: 6 direcciones → eligió 1), armar una página de propuestas en `docs/design-system/propuestas/<tema>/` (`src.html` + `page.css` + `build.py`), mostrar 3–6 opciones lado a lado con el mismo contenido real y pedirle que elija. Él decide rápido viendo; no leer párrafos.

## E · Gotchas del entorno
- **Comandos Bash de más de ~8.000 caracteres fallan en Windows**: escribir el contenido largo con Write en archivos `_algo.*` y unirlo con un script corto.
- **Sesiones en paralelo sobre los mismos archivos del DS** (pasó el 12/9 con v1.6 y v1.7): antes de editar `_build/` o `_ESTADO.md`, mirar fechas de modificación y `git status`; si otra sesión los tocó hace poco, avisar a Santiago.
- La implementación se hizo en el worktree `Chimpa-Finanzas-ds` (rama `design-system`) y ya está en `origin/dev`. **La verdad es `origin/dev`**: la carpeta `Chimpa-Finanzas` puede estar en otra rama vieja; leer con `git show origin/dev:<ruta>` y no pisar cambios sin commitear de otra sesión.
- Troncales que no se tocan en simultáneo: `App.tsx`, `index.css`, `tailwind.config.ts`, `components/ui/*`, `components/ds/*`, `layout`/sidebar. Una pantalla de zona sí.
- Clases de la guía en React siempre con `ds-`: copiar HTML de la guía sin el prefijo no pinta nada.
- Especificidad: una utilidad Tailwind puede pisar una clase `ds-*`; si algo "no toma", inspeccionar el computed style con `javascript_tool` antes de agregar `!important`.
