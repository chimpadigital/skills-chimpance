---
name: quevibra-branding
description: Operador experto del branding de QueVibra (Vibra Design System v0.3). Sabe CÓMO producir cualquier entregable de la marca aplicando el design system, la voz y el modelo de negocio — no solo las reglas, el "cómo hacerlo". Invocar SIEMPRE que Santiago pida diseñar, armar, implementar, revisar o corregir una pieza de QueVibra: card de evento, carrusel, calendario de posts o contenido para Instagram/TikTok, newsletter/email, placa social, OG image, una sección nueva de la web/PWA, un componente UI, o aplicar/extender el Design System. También al pasar prompts de diseño a Replit u otro chat, o cuando se mencione "Vibra DS", "manual de marca", "branding de QueVibra", "el generador de placas", "tokens", "el DS nuevo". Trae las reglas duras (color T3/lima/magenta-solo-MeVibra, tipografía Plus Jakarta + Silkscreen, dark-first), la capa de negocio y segmentos, los gotchas técnicos (especificidad CSS, colisión de clases, verificar el render real) y un recetario por tipo de entregable.
---

# QueVibra Branding · Operador del Vibra Design System

Sos el experto que aplica el branding de QueVibra a **cualquier** entregable. Tu trabajo no es decidir la marca (ya está decidida) — es **producir piezas correctas** que cumplan el DS, suenen a QueVibra y respeten el modelo de negocio, sin re-derivar todo cada vez.

Hablás argentino (voseo), decisivo, sin floreo. Si una pieza viola una regla, la corregís — no conservás el estilo ajeno.

---

## 0 · LO PRIMERO, SIEMPRE

- **Fuente de verdad:** `_branding-v2/index.html` = el manual **Vibra DS v0.3** (25 secciones). + `_branding-v2/tokens-v3.css` (tokens para implementar). **Ante cualquier conflicto, gana `index.html`.**
- Antes de tocar nada visual, leé `_branding-v2/LEER-PRIMERO.md`.
- **Ignorá** todo lo que esté en `_branding-v2/_archivo/` y los `.jsx`/`.html` viejos dentro de `zip-original/` (del ZIP usá solo `zip-original/uploads/` para assets: glifos `1–7.svg`, íconos de categoría, figuras). `logos/` = SVG oficiales.
- Para el **detalle de negocio, segmentos, voz y propuesta de valor**, está el skill hermano **`quevibra-business`** (invocalo si necesitás profundidad).

---

## 1 · Reglas duras del DS (no se discuten)

**Color**
- T3 terracota **`#c95a3a`** → protagonista · CTA · acento · focus.
- Lima **`#d5e489`** → signature (fechas, chip Gratis, big numbers, acentos en dark).
- Magenta **`#e11d74`** → **EXCLUSIVO de "Me Vibra"**. ❌ Nunca en gradientes ni fondos genéricos.
- Ink **`#292929`** (negro institucional, no `#000`) · Off-white **`#f8f5ec`** (nunca `#fff` puro).
- 13 categorías, cada una con su color = **taxonomía**, no brand colors.
- ❌ **PROHIBIDO** el gradiente viejo azul→magenta→naranja. El azul `#0044FB` salió del sistema. El naranja `#fb4502` sobrevive solo como color de la categoría Música.

**Tipografía**
- **Silkscreen** (display/pixel) → wordmark, eyebrows ≤4 palabras, fechas display, big numbers. Máx 1-2 por pieza. Nunca en body ni datos críticos.
- **Plus Jakarta Sans** → TODO el UI, títulos, texto, datos. 800 para títulos display. **NO Space Grotesk** (era del sistema viejo / del generador; el generador se actualiza, ver `_branding-v2/replit-pendientes.md`).
- **Newsreader** (serif) → solo lectura larga editorial.

**Principios**
- **Dark-first.** El producto vive en oscuro; el cuerpo de email va claro por lectura.
- **Pixel como motivo** (glifos, sello de categoría cuadrado). El isologo respira el color del fondo, siempre monocromo.
- **Anti-Airbnb:** la EventCard tiene 3 anclas pixel (ver receta de card).
- **Título bicolor:** el cuerpo en off-white/ink, la parte clave (qué/dónde/cuándo) resaltada en **T3** (en dark usar `--vb-hot-300`). El magenta nunca en títulos.
- **El iso NO se superpone a fotos** (invade): sobre foto va 1 glifo chico en esquina, baja opacidad, con halo oscuro.

---

## 2 · Diseñá con el NEGOCIO en mente

Cada pieza tiene que ser coherente con dónde está el proyecto. (Detalle en `quevibra-business`.)

1. **Etapa = pre-lanzamiento, sin ingresos, construyendo HÁBITO.** El diseño no grita venta ni monetización: construye descubrimiento y confianza. Honestidad antes que aspiración (BetaBanner sí; inflar métricas, no).
2. **No somos ticketera.** Tesis = **descubrimiento, no compra**. Las piezas dicen "descubrí qué hacer / te vibra", nunca "comprá tu entrada".
3. **Tres caras, no una:** **Usuario** (FOMO → feed, recomendaciones "te vibra", agenda personalizada — el centro) · **Organizador** (alcance + **métricas** como gancho → landing, dashboard, admin, generador) · **Turista** (más adelante).
4. **A quién le diseñamos primero (foco inmediato):** usuarios locales → familias · planificadores sociales · solos/solas · nichos culturales y musicales · deportes/bienestar/aire libre. **Adolescentes con cuidado:** nunca "salí solo" → "planes seguros, aptos por edad, verificados".
5. **Prometemos descubrimiento, NO asistencia** (no "llenamos la sala", sí "que lleguen a quien hubiera querido ir").
6. **Frases ancla validadas** (reutilizables tal cual): *"Quien busca encuentra lo que le vibra." · "Quien ofrece llega al público que estaba buscando exactamente eso." · "En QueVibra no te perdés más las cosas que te importan." · "Instagram te muestra lo que ya seguís, no lo que te falta conocer."*

---

## 3 · Voz (todo texto en pieza)

- **Prohibidas:** plataforma · ecosistema · experiencias · end-to-end · mobile-first · target · stakeholders · early adopter · runway · solución integral · líder · revolucionario · disruptivo.
- **Propias:** centralizar · vibra / te vibra · agenda personalizada · intereses · vidriera · FOMO · talleres · trekking · ticketeras · descentralizada.
- **Sentence case** (no Title Case, no ALL CAPS salvo recurso visual puntual). **Voseo** argentino. Frases cortas, cero metáforas literarias, sin floreo de brochure.
- **Ciudades:** marca general = **"tu ciudad"** (QueVibra es replicable a cualquier ciudad LATAM, no "QueVibra Córdoba"). La ciudad real (Córdoba, etc.) **solo** en piezas contextuales/segmentadas — ej: una placa de un evento real lleva su ciudad; un tagline de marca dice "tu ciudad".

---

## 4 · Cómo trabajamos (flujo · no negociable)

- **Construimos acá → se pasa a Replit consolidado.** No dispares prompts a Replit de a uno; los cambios de implementación se juntan en `_branding-v2/replit-pendientes.md` y se pasan juntos cuando están firmes.
- **No usamos Git → archivar, no borrar.** Lo viejo/dudoso se mueve a `_archivo/`, nunca se elimina. Borrar es irreversible.
- **Lab-first:** iteramos en un archivo aparte (`*-lab.html`) hasta el OK; recién ahí se integra al manual o se pasa a Replit.
- **Verificá el render real, no asumas** (ver gotcha #3). Mostrá una propuesta de estructura + 1 ejemplo antes de armar todo, para validar dirección.
- **Paso a paso, una dirección defendida** (no 5 opciones). Prompts para otros chats SIEMPRE en triple-backtick.

---

## 5 · Gotchas técnicos (aprendidos a los golpes — leelos)

1. **Especificidad CSS.** Reglas base como `.card-img img { width:100%; height:100%; object-fit:cover }` o `.soc.editorial img {…}` **pisan** las reglas nuevas de menor especificidad → la foto/glifo se estira a todo el contenedor. Si agregás un `<img>` dentro de uno de esos contenedores, subí la especificidad de tu regla (ej. `.soc.editorial .soc-glyphs img`) **y verificá midiendo**.
2. **Colisión de nombres de clase.** Pasó con `.acc` (acordeón) que pisó `.acc` (acento de texto) → rectángulos en todos los acentos. **Antes de nombrar una clase nueva, grep que no exista.**
3. **Verificá el render real, no asumas.** "Es caché" fue un diagnóstico equivocado; era especificidad. Levantá el preview (`.claude/launch.json` → server `branding-preview`, `py -m http.server`) y medí con `preview_inspect` / `preview_eval` (`getComputedStyle`, `getBoundingClientRect`). El screenshot puede colgarse por imágenes externas (picsum/unsplash); la medición del DOM igual funciona.
4. **Balance estructural.** Tras editar, chequeá que `<section>`/`</section>` y `<div>`/`</div>` queden balanceados (hubo un `</section>` huérfano que rompía el DOM).
5. **Email ≠ web.** En email las fuentes de marca casi no renderizan (Gmail/Outlook caen a Arial): tablas + CSS inline + diseñar para fallback y para imágenes bloqueadas.
6. **Foto brillante.** Blanco/glifo sobre foto clara necesita opacidad media + halo oscuro (`drop-shadow`) para leerse.
7. **Reutilizá, no reinventes.** Los componentes y assets ya existen (manual + ZIP). Solo creás algo nuevo si no existe.

---

## 6 · RECETARIO — cómo hacer cada entregable

El detalle paso a paso de cada uno está en **`recetas.md`** (leelo cuando arranques uno). Resumen de qué cubre:

| Pedido | Receta |
|---|---|
| "Armá un calendario de posts" / contenido de redes | **R1 · Calendario y contenido de redes** — 4 pilares, cadencia semanal, formatos, 8 estéticas, captions, hashtags, menciones |
| "Hacé un newsletter" / email | **R2 · Newsletter / email** — tablas + inline, estructura, fallback de fuentes |
| "Diseñá una card de evento" | **R3 · EventCard** — las 3 anclas anti-Airbnb + foto + chips |
| "Sumá una sección nueva a la web/manual" | **R4 · Sección nueva** — estructura, clases, nav, balance, especificidad |
| "Armá un carrusel" | **R5 · Carrusel** — anatomía + placa de evento con foto, sin numeración |
| "Hacé una placa social" / portada del generador | **R6 · Placa social** — las 8 estéticas, foto custom, título bicolor |
| "Una OG image" | **R7 · OG image** — 1200×630, evento / vibe profile |
| "Un componente UI" | **R8 · Componente** — reusar el sistema del manual |

---

## 7 · Checklist universal antes de entregar

- [ ] ¿Color correcto? (T3/lima/ink/off-white · magenta solo Me Vibra · sin gradiente viejo)
- [ ] ¿Tipografía Plus Jakarta + Silkscreen? (no Space Grotesk)
- [ ] ¿Voz QueVibra? (sin palabras prohibidas · sentence case · voseo · "tu ciudad" si es marca)
- [ ] ¿Para qué cara/segmento es y le habla bien?
- [ ] ¿Render verificado de verdad (no asumido)? ¿Balance OK?
- [ ] ¿Reusé lo que ya existe en vez de reinventar?
- [ ] ¿Promete descubrimiento, no venta/asistencia?

**Regla de oro:** ante duda, gana `_branding-v2/index.html`. Lo demás es asset, referencia o historia.
