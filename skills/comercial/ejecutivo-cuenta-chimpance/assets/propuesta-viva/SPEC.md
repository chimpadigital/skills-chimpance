# Propuesta Viva — formato de propuesta interactiva

> **Validado:** ganó la propuesta de **Tiempo Judicial** (junio 2026). El formato gusta y cierra.
> Ejemplo canónico (clonable): `ejemplo-tiempo-judicial.html` (en esta misma carpeta).

## Qué es

Una propuesta comercial en **una sola página HTML autocontenida** (CSS + JS adentro, sin assets externos salvo la fuente de Google y la API del dólar) que mezcla:

- la **narrativa visual de una presentación** (cuenta una historia, poco texto, impacto), y
- el **cotizador interactivo** que veníamos usando (financiación que se arma sola, configurador, dólar en vivo).

Pirámide invertida: el cliente ve **primero el precio y la forma de pago**, y después —si quiere— despliega el detalle.

## Cuándo usarla

- Propuestas de **producto/proyecto con un precio claro**: web, plataforma, sistema, branding+web, e-commerce.
- Cuando el decisor "no lee" y lo primero que quiere es **el número**.
- Es el formato de **cierre / presentación**. No reemplaza la propuesta redactada de 15 secciones (`assets/plantilla-propuesta.md`) para licitaciones formales o expedientes — esos conviven: la redactada como documento, la Viva como la experiencia que se manda a decidir.

## Principio rector

> La gente no lee, primero mira cuánto le va a salir. Después, quizás, la propuesta de valor.

Orden inamovible: **precio → forma de pago → valor → detalle a demanda**.

## La arquitectura, en 6 capas

| Capa | Qué muestra | Tiempo de lectura |
|---|---|---|
| **0 · Apertura narrativa** | **1-2 placas máximo** (la que vendió tenía 1), poco texto, estilo Corrientes: una frase bisagra fuerte y/o la visión + marca. Con atajo "Ver la inversión". | 5-10 seg |
| **1 · Resumen ejecutivo** | **Precio grande + IVA + forma de pago elegible + 4 beneficios.** 2 CTAs + Descargar PDF. | 15 seg |
| **2 · La historia** | Hoy → Mañana + 3 pilares. Poco texto, visual. | 30 seg |
| **3 · El detalle** | Acordeones **colapsados** (alcance, etapas, tecnología, migración, requisitos, qué NO incluye). Los abre quien quiere. | a demanda |
| **4 · Configurador** | Módulos opcionales con checkbox; **el total se actualiza solo**. Sirve también para separar Fase 1 / Fase 2. | a gusto |
| **5 · Cierre** | Por qué nosotros (3) + próximos pasos (3) + CTA final + firma. | 15 seg |

Más una **barra fija de inversión** que aparece tras la apertura y se esconde al llegar al cierre (para no tapar la firma; ahí ya está el CTA grande).

## La apertura narrativa (estilo Corrientes)

Le da el golpe emocional que a una propuesta de precio le falta. Modelada en los decks de Corrientes ("De cuenta a comunidad", `Chimpa/content/decks/corrientes-futuro-tecno/`): **poco texto, una idea por pantalla, arco emocional**.

**REGLA DE ORO: 1-2 placas, NUNCA más.** La gente no lee. La propuesta que ganó (Tiempo Judicial) tenía **1 sola frase** al inicio. Los momentos de abajo son un **menú** — elegí 1 o 2 (lo más fuerte suele ser la **bisagra** y/o la **visión + marca**), no los pongas todos. Más de 2 placas mata el "precio arriba" y aburre.

Menú de momentos (del arco Corrientes — elegí 1-2):
1. **Concreto / humano** — una imagen real del que espera el producto, no una abstracción. *"Ahora mismo, alguien busca…"*
2. **Tensión** — el problema, dicho simple. *"El talento ya está; la web no acompaña."*
3. **Problema nombrado** — qué frena hoy. *"Publica, pero no fideliza."*
4. **Frase bisagra (antítesis)** ⭐ — la línea memorable. Pasado apagado (gris) vs futuro encendido (lima): *"Una web vieja muestra lo que pasó. Una plataforma editorial construye lo que viene."*
5. **Visión + marca** ⭐ — el lugar luminoso + el título de la propuesta + "Chimpancé ✕ [Cliente]". Fluye al resumen.

Reglas:
- **Reconciliar con "precio arriba":** atajo fijo arriba a la derecha **"Ver la inversión →"** (a `#resumen`) para el que solo quiere el número. La narrativa es para quien se engancha, nunca una trampa.
- Placas full-screen, type grande (clamp ~32–66px), **una** palabra clave en celeste, mucho aire, halos sutiles según el momento (gris en la tensión, celeste en la visión).
- **Reveal cinematográfico**: cada placa hace fade-up al entrar en viewport (IntersectionObserver → clase `.in`). En print se desactiva (`opacity:1`) y las placas se compactan (no una página por placa).
- **Cortísimo**: 1-2 placas, máximo 2. Es una propuesta, no un deck. Si dudás, 1.
- La barra fija aparece recién al pasar **toda** la apertura → observar `.apertura` (el contenedor), no la primera placa.

## El módulo de financiación (lo crítico — es el factor de decisión)

**Por defecto, DOS formas de pago elegibles** (segmented control). Al cambiar, el desglose se rearma solo:

- **En cuotas** — N cuotas sin interés, con el valor mensual calculado. (Cantidad de cuotas: la define Santiago — preguntar antes de construir.)
- **Contado** — total con descuento + badge "Ahorrás USD X". (% de descuento: lo define Santiago — preguntar antes de construir.)

⚠️ **NUNCA incluir "Por etapas" (40/30/30) salvo que el cliente lo haya pedido expresamente.** Si lo pide, se suma como tercer botón (anticipo, hito de diseño, pre-entrega; sin costo extra). Por defecto va solo Cuotas + Contado, y el botón de Cuotas arranca activo.

Características que SIEMPRE van:

1. **Tramos automáticos**: a mayor monto, más cuotas (y, si se quiere, más descuento). En el ejemplo: `<6k → 3 cuotas · <10k → 4 · ≥10k → 4`. Sumar módulos puede cruzar un tramo y mejorar la financiación → es un gancho de venta.
2. **Descuento contado configurable** (en TJ quedó **25% fijo**). Cuidado: el contado no puede caer por debajo del costo directo (ver `references/costos-internos.md`). Si el % regala margen, subir el ancla en vez de descontar más.
3. **Conversión USD → ARS en vivo** vía DolarAPI (dólar oficial BNA), con fallback editable. Cada cifra muestra su equivalente en pesos.

Lógica JS de referencia (copiar/adaptar):

```js
var BASE = 4200;            // precio del producto (Fase 1)
var COTIZACION = 1415;      // fallback; se actualiza desde DolarAPI
var CONTADO_OFF = 0.25;     // descuento por pago contado

function getTier(t){        // cuotas según monto
  if(t < 6000)  return {discount:CONTADO_OFF, cuotas:3};
  if(t < 10000) return {discount:CONTADO_OFF, cuotas:4};
  return                {discount:CONTADO_OFF, cuotas:4};
}
// fetch('https://dolarapi.com/v1/dolares/oficial') -> COTIZACION = data.venta
// modos: 'etapas' (40/30/30) | 'cuotas' (total/cuotas) | 'contado' (total*(1-discount))
```

## Reglas duras (no negociables)

- **Precios SIEMPRE + IVA (21%), no incluido.** Etiquetar en el precio grande, en la barra fija y en la nota al pie ("Todos los valores son en USD + IVA 21%").
- **La marca de la propuesta es Chimpancé** (theme Digitaal), NO la del cliente. El color del cliente entra solo como guiño puntual ("así se ve tu identidad"), nunca como base.
- **Lima `#D9F45F` = solo acción/CTA.** **Celeste `#36A9E1` = identidad, NUNCA CTA.**
- **Dólar oficial en vivo**, con fallback por si la API no responde.

## Diseño — theme Digitaal (resumen de tokens)

- Fondos: `--bg:#0A0A0A` · `--bg-2:#121310` · `--bg-3:#1a1b17`. Líneas: blanco a 6–10% alpha.
- Acción/CTA: `--lime:#D9F45F`. Identidad: `--sky:#36A9E1`.
- Texto: `#F4F5F0` / `#a9ada0` / `#6f7268`.
- Tipografía: **Plus Jakarta Sans** (400–800). Títulos con `letter-spacing:-.02em`.
- **Grano global**: overlay SVG fractalNoise fijo, `opacity ~.06`, `mix-blend-mode:overlay`.
- Radios generosos (14–28px), botones pill.

## PDF / impresión

Botón "Descargar PDF" → `window.print()`. Una hoja `@media print` que:
- mantiene la marca (`print-color-adjust:exact`), apaga el grano,
- esconde barra fija, scroll cue y botones,
- **abre todos los acordeones** antes de imprimir (listener `beforeprint`; se restauran en `afterprint`), para que el PDF salga completo.
- Nota al cliente: activar **"Gráficos de fondo / Background graphics"** en el diálogo de impresión.

## Empaquetado para Replit

Santiago lo monta/deploya en Replit. Entregar un `.zip` con:
- `index.html` (la propuesta),
- `.replit` (`deploymentTarget = "static"`, `publicDir = "."`, port 8000→80, `run = "python3 -m http.server 8000"`),
- `README.md` con los pasos (Import from ZIP → Run → Deploy → Static).

## Cómo armar una Propuesta Viva para un cliente nuevo (checklist)

1. **Cotizá primero** con las reglas del skill (catálogo, costos internos, markup 2.5x, piso). El formato NO cambia cómo se cotiza, solo cómo se presenta.
2. Cloná `ejemplo-tiempo-judicial.html` → `index.html`.
3. **CONFIG (en `<script>`)**: `BASE`, `CONTADO_OFF`, tramos de `getTier`.
4. **Estáticos** (para que no parpadeen antes del JS): `#num-total`, `#precioArs` (≈ BASE × cotización), `#bar-total`, `#segOffBadge`, `#finTier`.
5. **Apertura narrativa**: **1-2 placas máximo** (la bisagra adaptada al cliente y/o la visión + marca). NO más — la gente no lee. El atajo "Ver la inversión" ya está cableado a `#resumen`.
6. **Resumen**: `precio-cap` (qué es + plazo), los 4 beneficios (en clave de negocio, no features).
7. **Historia**: Hoy → Mañana + 3 pilares del proyecto.
8. **Detalle**: los 6 acordeones con el alcance real. Si hay fases, marcar Fase 1 / Fase 2.
9. **Configurador**: módulos opcionales con su precio (`data-add`).
10. **Cierre**: próximos pasos.
11. **CTAs de acción → WhatsApp con mensaje pre-cargado.** Los botones de conversión ("Quiero avanzar", "Avanzar" de la barra fija, "Aceptar y arrancar") apuntan a `https://wa.me/<NUMERO>?text=<mensaje urlencoded>`, con `target="_blank" rel="noopener"`. Los de navegación interna ("Ver la inversión", "Ver todo el detalle", "Descargar PDF") NO cambian. Número Chimpancé: `5493516503470` (ver memoria `reference_whatsapp_chimpance`). Mensaje tipo: `Hola Chimpancé, vi la propuesta de <Cliente> y quiero avanzar.`
11b. **Si la propuesta tiene una demo funcionando, sumar un BANNER GRANDE "Ver la demo"** (regla de Santiago, 24/9/2026): bloque propio antes de las fases, con el estilo `appbnr` del DS (fondo oscuro con halo lima), título tipo "Ya lo pueden probar.", una línea de qué se puede ver, botón lima "Ver la demo →" (`target="_blank"`, `data-chimp-cta="ver-demo"` **y `data-chimp-demo`**) y una captura real de la demo dentro de un marco de navegador (JPEG en base64, ~40 KB, para que la propuesta siga autocontenida). Ejemplo: `Chimpa2026/propuestas/gester/index.html` (`#demo`). **Medición (25/9/2026): TODO link o botón que lleve a la demo (el del banner, la captura, el del cierre) lleva el atributo `data-chimp-demo`**: con eso el código de medición de la propuesta le pasa a la demo quién es el lector, aunque la demo esté en otro dominio. Sin el atributo, el cliente llega a la demo como anónimo. La demo lleva su propio código ("Código de la demo" en la oportunidad del ERP), en todas sus páginas.
12. **Verificar el render real**: servir, tocar las 2 formas de pago, sumar un módulo y confirmar que el total y el tramo se actualizan, y que los CTA de acción abren WhatsApp.
13. **Dejarla lista para medir** (desde 17/9/2026): ver "Medición" abajo.

## Medición (qué leyó el cliente)

La propuesta publicada se mide con el script de Growth del ERP. En la ficha del lead (bloque Propuestas y pestaña
Historia) se ve si la abrió, cuántas veces, cuánto leyó, hasta dónde bajó, si miró la inversión, qué opción armó y si
tocó WhatsApp; al dueño del lead le llega un aviso la primera vez que la abre. Detalle técnico en
`Chimpa-Finanzas/docs/growth/recorrido-cliente.md`.

1. **Plantilla** (no cambia el diseño):
   - Cada bloque es un `<section id="…">` con ids que se entiendan (`resumen`, `historia`, `detalle`, `configurador`,
     `inversion`, `roadmap`, `cierre`). Los ids con "resumen", "inversion", "precio", "plan" o "cotiz" cuentan como
     "miró la inversión".
   - El configurador va dentro de un contenedor con `data-chimp-quote`: cada módulo con `data-name="…"`, los botones de
     forma de pago con `data-mode="contado|cuotas"` + `aria-pressed`, y el total con `data-chimp-total`. Si el JS arma
     el estado de otra forma, llamar `window.chimp && chimp.proposalOption({ option, items, mode, total })` al cambiar.
   - Botones importantes con `data-chimp-cta="…"` (`quiero-avanzar`, `descargar-pdf`). Los links a `wa.me` se miden solos.
2. **Registrarla en el ERP** al mandarla: lead › Propuestas › Registrar propuesta (nombre, link publicado, monto sin
   IVA, fecha). Queda en el historial como "Propuesta enviada".
3. **Pegar el código** de "Código para medirla" en el `index.html`, justo antes de `</body>`, y volver a publicar. El
   código es de ESA persona: si la propuesta se reutiliza para otro cliente, se cambia el código.
4. **Revisarla sin ensuciar**: abrirla con `?vista=equipo` al final del link (botón "Ver sin medir" en el ERP).

## Anti-patrones (lo que hacía mal la propuesta vieja)

- 22 secciones planas, todas desplegadas, lineales → el cliente se ahoga antes de llegar al precio.
- El precio escondido al final.
- Demasiadas opciones a la vez sin jerarquía.
- "Tu tramo" y otra jerga interna a la vista del cliente. El texto del cliente va en lenguaje normal.

## Gotchas de UX/UI (ya corregidos en el ejemplo — no volver a romperlos)

Estos errores aparecieron y se arreglaron. El `ejemplo-tiempo-judicial.html` ya viene con los fixes; si clonás de ahí, respetalos. Si escribís el CSS a mano, aplicalos:

1. **Viñetas de `.tick li`: con `position:absolute`, NUNCA con `display:flex`.** Si el `li` es flex y adentro hay `<b>negrita</b>` seguida de texto, el navegador toma la negrita y el texto como **dos flex-items distintos** → se parten en dos columnas (la negrita en una, el resto en otra), feísimo cuando el label es largo. Fix correcto:
   ```css
   .tick li{position:relative;padding-left:16px;line-height:1.45}
   .tick li::before{content:"";position:absolute;left:0;top:9px;width:6px;height:6px;border-radius:50%;background:var(--lime)}
   ```
   Así el contenido fluye inline y wrappea natural.

2. **Listas de "label + descripción": formato definición, NO "label: texto".** El patrón `<b>Label</b>: descripción` con dos puntos queda desprolijo: cuando el label wrappea, el ":" flota y desalinea entre columnas. Usar el label arriba (blanco) y la descripción abajo (atenuada), con la clase `.tick.defs`:
   ```html
   <li><span class="d"><b>Label</b><span>Descripción.</span></span></li>
   ```
   ```css
   .tick.defs li::before{top:7px}
   .tick.defs .d{display:flex;flex-direction:column;gap:1px}
   .tick.defs .d b{color:var(--txt);font-weight:700;font-size:14.5px}
   .tick.defs .d span{color:var(--txt-2);font-size:13.5px;line-height:1.4}
   ```

3. **Ícono toggle del acordeón (`.plus`): SVG, NO el carácter "+".** El "+" de texto no centra exacto en el círculo por las métricas de la fuente (y al rotar a "×" se nota). Usar SVG, que con el centrado flex queda perfecto:
   ```html
   <span class="plus"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></span>
   ```
   La rotación a 45° (`.acc[open] .plus{transform:rotate(45deg)}`) lo convierte en "×" igual de centrado.

4. **"Próximos pasos" como cards conectadas, NUNCA texto suelto.** Los 3 pasos del cierre como texto inline con numeritos quedan flotando y pobres (feedback Santiago, AgroGlobal jul 2026). El patrón validado (ya aplicado en el ejemplo clonable): grid de 3 cards (`bg` oscuro, borde `line-soft`, radius 16px, padding 24px), número en **círculo celeste** (36px, borde `rgba(54,169,225,.5)`, fondo `.12`), texto centrado abajo, y flechas "→" en `::after` entre cards (en mobile: apiladas y "↓"). Hover: borde celeste + translateY(-3px).

5. **Verificá el render por medición, no por screenshot.** El `preview_screenshot` se cuelga con el grano global + IntersectionObservers. Confirmá con `preview_eval`: medí `getBoundingClientRect()` para centrados/alineaciones, leé textContent para el copy, y tocá el cotizador para validar que el total y el tramo se actualizan. Acordate de recargar (`location.reload()`) tras cada edición — el server estático no tiene HMR.
