# Recetario QueVibra · cómo hacer cada entregable

> Pasos concretos por tipo de pieza. Todo se apoya en `_branding-v2/index.html` (Vibra DS v0.3) + `tokens-v3.css`. Reglas duras, voz, negocio y gotchas: ver `SKILL.md`.

---

## R1 · Calendario de posts / contenido de redes

**Referencia:** `_branding-v2/social-playbook-lab.html` (el playbook completo).

**Los 4 pilares de contenido** (rotar entre ellos, no repetir):
1. **Curaduría** — "lo del finde", la selección. El corazón (resolvemos el FOMO).
2. **Dato / FOMO** — el número que para el scroll ("147 eventos esta semana"). Estética BigNumber.
3. **Circuito** — organizador, sala o artista destacado. Construye legitimidad. Imagen individual + **mención (arrobar)**.
4. **Comunidad** — Mi Vibra, perfiles, lo que vibró la gente, repost de usuarios.

**Semana tipo** (ajustable): Lun = reel resumen (BigNumber) · Mar = story agenda + repost organizador · Mié = carrusel por categoría · Jue = post "este finde" (Marquee) · Vie = carrusel hero del finde (foto custom) · Sáb = stories en vivo · Dom = comunidad (Mi Vibra). Fijos: reel del lunes + carrusel del viernes.

**Formatos:** feed = **portrait 4:5** (default, rinde más) · stories/reels = 9:16 · 1:1 solo para grilla del perfil.

**Caption** (anatomía): gancho 1 línea (lo único que se ve antes del "ver más") → cuerpo corto (qué/cuándo) → **un** CTA (guardá / mandáselo a quien va con vos / link en bio) → hashtags. Emojis funcionales (👇📍🎟️), 2-3 máx.

**Hashtags:** 5-10. Mezcla = ciudad + categoría/nicho + `#QueVibra`. Evitar genéricos gigantes.

**Menciones (la jugada que más rinde):** arrobá SIEMPRE al organizador, sala y artista → te repostean (alcance gratis) y te prestan legitimidad. En stories, sticker de mención.

**Cadencia sostenible > viral esporádico.** 1 reel + 2-3 posts/carruseles + stories diarias por semana.

---

## R2 · Newsletter / email

**Referencia:** `_branding-v2/index.html` sección 24 (Email: header/footer branded + email "resumen semanal" con eventos).

**Es un email de verdad, no una web:**
- Layout 100% con `<table>` (NADA flex/grid — Outlook no los soporta). Ancho máx 600px, centrado, responsive.
- TODO el CSS **inline** (`style="…"`). Nada crítico en `<style>` del head (Gmail lo recorta).
- Botones "bulletproof" (padding sobre `<a>`, no imagen).
- Fuentes por `<link>`/`@font-face` para quien las soporte (Apple Mail), pero **diseñar para fallback** (Arial): la marca se sostiene por color + layout + lima, no por la tipo pixel.
- Cada foto con `alt`; diseñar para **imágenes bloqueadas** (que se entienda sin fotos).
- Footer con dirección + **link de baja** (obligatorio).

**Estructura:** header ink + wordmark + etiqueta lima → gancho corto (voz QueVibra) → bloques de evento (foto + eyebrow temporalidad + **fecha lima** + título bicolor + lugar + categoría + "Ver evento") → CTA principal → footer branded.

**Cuerpo claro** (off-white cálido), header/footer en ink. Dark-first pero el cuerpo va claro por lectura.

---

## R3 · Card de evento (EventCard)

**Referencia:** `_branding-v2/index.html` sec 19 (Feed) + sec 12 (Chips).

**Las 3 anclas anti-Airbnb (obligatorias, son la identidad del feed):**
1. **Eyebrow de temporalidad** — Silkscreen 10px + punto cuadrado pixel T3 ("Esta noche" / "El domingo" / "Este finde").
2. **Fecha en Silkscreen 15px lima** — primera lectura del card.
3. **CategoryChip** — sello pixel **cuadrado** (radius 2px), Silkscreen UPPER, color de la categoría. NO pill estilo Airbnb.

**Estructura:** foto del evento (3:2) con cat-chip top-left + FAB Me Vibra (magenta) top-right → body: eyebrow · fecha lima · título (Plus Jakarta 700) · lugar/meta · footer (PriceTag + ReasonChip).
**PriceTag:** Gratis = lima · Pago = T3 muted · A la gorra = warm + border ferias.
**Clases:** reusar `.card`, `.card-img`, `.card-body`, `.card-eye`, `.card-date`, `.card-ttl`, `.card-foot`, `.cat-chip`, `.pt`. Variantes: `.mobile-2x1`, `.mobile-poster`, `.agenda-mini`.
**Sin foto →** placeholder de gradiente por categoría (`.eip.{cat}`).
**Título:** el nombre del evento va en UN color (es nombre propio). El bicolor T3 es para títulos editoriales/de portada, no para nombres de evento.
**⚠️ Gotcha:** `.card-img img{width:100%;height:100%;object-fit:cover}` pisa cualquier `<img>` nuevo dentro → si agregás overlay/glifo, subí especificidad y verificá.

---

## R4 · Sección nueva en la web / manual

**Referencia:** la estructura de `_branding-v2/index.html` (cualquier `<section class="sec">`).

**Pasos:**
1. Estructura: `<section class="sec" id="…">` → `.sec-head` (`.sec-num` + `.sec-ttl` + `.sec-note`) → `.sec-lead` → sub-bloques con `.sub-head` (`.dot` + `.sub-ttl`) → `.callout` para reglas.
2. **Reusá clases existentes** (botones `.btn`, chips, cards, `.callout`, grids). Solo CSS nuevo si no existe.
3. CSS nuevo: agregalo antes del `@media` final; si tiene grid, sumalo al colapso responsive.
4. **Nav:** agregá la entrada al índice lateral; si insertás en el medio, renumerá las siguientes (sec-num + nav). Si es estructural grande, **consultá antes**.
5. **Nombres de clase:** grep que no colisionen con clases existentes (`.acc`, `.tab`, `.menu`, etc.).
6. **Especificidad:** si tu regla compite con una base, dale suficiente especificidad y **verificá midiendo**.
7. **Balance:** chequeá `<section>`/`<div>` balanceados tras editar.
8. Avisá dónde quedó (sec número + sub-sección).

---

## R5 · Carrusel

**Referencia:** `_branding-v2/social-playbook-lab.html` (cap. 05) + sec 24 manual.

**Anatomía (orden fijo del ZIP):** `01-portada` → `NN-evento` (una por evento) → `cta-comunidad` → `cta-organizadores`.

**La placa de evento muestra la FOTO del evento** (regla de Santiago): foto a sangre + degradado de legibilidad + las 3 anclas (eyebrow temporalidad, fecha lima, sello de categoría) + lugar + precio. Sin foto → gradiente de categoría (no dejar hueco).

**Reglas:** 2-20 eventos · **sin numeración "X/N" en la placa** (condiciona la cantidad/orden) · portada con título auto + estética elegida · la placa de evento es la misma EventCard del manual llevada a vertical (coherencia con el feed).
En el generador: la "foto en cada placa" = layout **Encima** o **Marco**; recomendado **Auto** (foto si hay, gradiente si no).

---

## R6 · Placa social / portada del generador

**Referencia:** `_branding-v2/social-playbook-lab.html` (cap. 03) + sec 20 manual.

**8 estéticas de portada y cuándo usar cada una:**
- **Clásica** (default) — fondo **ink + glow T3** (re-skineada al nuevo DS; ❌ NO el gradiente viejo azul/magenta/naranja). Contenido diario sin foto.
- **A Editorial** (crema, revista) — curaduría/recomendaciones.
- **B Stack** (bloques) — rankings/listas.
- **C Nocturno** (ink + lima) — vida nocturna, electrónica.
- **D BigNumber** (número lima gigante) — el dato/FOMO.
- **E Marquee** (cintas lima ticker) — urgencia, "esta noche".
- **F FramePoster** (marco lima) — teatro, cine.
- **Foto custom** — cuando hay UNA foto potente. Solo carrusel (no reel, no imagen individual).

**Reglas transversales:** título bicolor (cuerpo off-white, clave en T3) · fecha/eyebrow en Silkscreen · números grandes en Silkscreen lima · el **iso NO va sobre foto** (usar 1 glifo chico en esquina, baja opacidad + halo) · magenta nunca (salvo Me Vibra).
**Foto custom:** foto nítida, con derechos, sin texto quemado, buena en vertical. Eyebrow Silkscreen ≤60 car (o vacío si la foto habla sola).

---

## R7 · OG image (preview al compartir)

**Referencia:** `_branding-v2/index.html` sec 20 (OG templates).

**1200×630** (1.91:1). Dos plantillas:
- **Evento:** foto + gradiente ink→T3 + fecha lima + título Plus Jakarta + isologo lima + URL Silkscreen.
- **Vibe profile:** dark + grilla pixel + número grande Silkscreen lima + chips de categoría + glifo.

Texto en `cqw` para escalar con el lienzo. Se renderiza server-side al compartir.

---

## R8 · Componente UI

**Referencia:** `_branding-v2/index.html` capítulo Componentes (sec 11-17): botones, chips, feedback, estados, navegación mobile, filtros, modales/sheets, forms, tabs, dropdown, accordion, etc.

**Antes de crear, buscá:** el manual ya tiene ~40 componentes documentados. Reusá la clase existente. Solo diseñás uno nuevo si genuinamente no existe — y ahí seguí la receta R4 (estructura + nombres + especificidad + balance).

**Reglas de componente:** botones pill con ícono leading (lucide stroke 2.5) · radius `--r-md` chips/inputs, `--r-pill` botones, `--r-xl` cards · focus ring T3 · spring (`--ease-spring`) en FAB/Me Vibra/micro-celebraciones · touch targets ≥44px en mobile.

---

## Verificación (vale para todo)

Levantá el preview (`.claude/launch.json` → `branding-preview`) y **medí el render real** con `preview_inspect`/`preview_eval` (no asumas). Si el screenshot se cuelga por imágenes externas, la medición del DOM igual sirve. Después, pasá el checklist universal del `SKILL.md`.
