# Sistema visual de slides — Chimpancé

Cómo se ve un deck Chimpancé y cómo se arma sobre `assets/plantilla-deck.html`. La estética sale del theme de marca (Digitaal): dark, tipografía gigante, grano, una idea por slide, formato póster editorial. Norte de referencia: las slides de Leo Farfán (Domestika) — pero en colores y voz Chimpancé.

---

## Tokens (ya en la plantilla, no hace falta tocarlos)

### Paleta EXTENDIDA de decks (off-brand · solo presentaciones)

> Importante: el DS del **sitio** está cerrado (2 acentos: lima + celeste). Los **decks** usan una paleta más amplia y audaz — decisión de Santiago para acercarse al look editorial de las refs. Esta paleta vive solo en presentaciones; **no toca el sitio**.

Cada color es un **bloque a toda placa** (clase `s-*`) con su rol. La gracia es **rotar** entre ellos para dar ritmo, no usarlos todos en un mismo deck.

| Clase / Token | Valor | Rol del bloque |
|---|---|---|
| `s-dark` / `--c-negro` | `#0A0A0A` (deg. cálido) | Base narrativa. La mayoría de las placas. |
| `s-surface` | `#121310` | Base alterna (para que dos oscuros no se fundan). |
| `s-night` / `--c-night` | `#121C27` | Azul noche, divisor de sección sobrio. |
| `s-celeste` | `#36A9E1` | Identidad / tecnología / datos. Texto oscuro. |
| `s-violeta` ✦ | `#7A5AF8` | Futuro / data / lo que viene. Texto blanco. |
| `s-rosa` ✦ | `#FF4D87` | Quiebre / lo creativo / energía pink. Texto oscuro. |
| `s-coral` | `#FD5B38` | Tensión / el enemigo / golpe de energía. Texto oscuro. |
| `s-claro` / `--offwhite` | `#FDFDF5` | Respiro visual. Texto **negro**. |
| `s-lima` / `--lima` | `#D9F45F` | **Acción / clímax / CTA.** Texto **negro**. El pico, escaso. |

✦ = colores NUEVOS fuera de la marca, exclusivos de decks.

**Tipografía:** Plus Jakarta Sans (500–800), display 800, leading `.98`. **Etiquetas:** mono. **Grano:** `feTurbulence` saturate 0, opacity `.12`, por slide, siempre.

**Reglas que se mantienen sí o sí:** texto blanco sobre oscuros/violeta · texto negro sobre claro, lima, celeste, rosa, coral. **Lima sigue siendo solo acción/clímax** (no la malgastes de fondo decorativo).

### Destacados (resaltar palabras con caja de color)

Para el look editorial de las refs (varias palabras pintadas en una frase). Envolvé la palabra en un `<span>`:
- `hl-lima` · `hl-celeste` · `hl-rosa` — caja de color con texto legible encima.
- `hl-line` — subrayado grueso lima (más sutil).
- `<em>` sigue sirviendo para **una** palabra en lima sin caja.

Ej: `El <span class="hl-rosa">futuro</span> se hace con <span class="hl-celeste">datos</span> y <span class="hl-line">comunidad</span>.` — usá 2-3 por placa como máximo, no más.

---

## Anatomía de un slide

```html
<section class="slide [ARCHETYPE] [COLOR]">
  <span class="kicker">02 <span class="dot">·</span> La observación</span>  <!-- etiqueta sección, arriba izq -->
  <span class="brandmark">CHIMPANCÉ · <b>Software Factory</b></span>        <!-- marca, arriba der -->
  <div class="scene"> ... contenido del archetype ... </div>
  <aside class="notes">Lo que Santiago DICE en este slide (guión).</aside>     <!-- tecla N -->
</section>
```
- `[COLOR]` = una de: `s-dark` (default, degradado cálido) · `s-surface` · `s-night` · `s-claro` · `s-lima`.
- El `kicker` marca la fase de la historia; el `brandmark` es constante. `pagemark`/`footnote` son opcionales (abajo der/izq).
- **`notes` es obligatorio**: el deck muestra poco, el guión carga el resto.

---

## Archetypes (clase + cuándo usarlo)

| Clase | Para qué | Contenido |
|---|---|---|
| `cover` | Portada/gancho | `eyebrow` (cliente × Chimpancé) + `h1` gigante + `tag`. |
| `divider` | Abrir una sección/fase | `idx` (número gigante) + `ttl`. Lima para problema, **celeste** para identidad. |
| `statement` | Insight, solución, manifiesto | `over` (overline mono) + `h2` gigante con un `<em>` lima. `lead` opcional. |
| `triptych` | Repetición de impacto (3 líneas) | 3 `row`; las primeras atenuadas, la última full + `<em>`. Estilo "te tratan como X". |
| `stat` | Dato / agitación | `num` gigante (lima) + `desc` + `src` (fuente). |
| `quote` | Testimonio | `blockquote` + `by`. Va bien en `s-claro` (respiro). |
| `list` | Pilares / método (máx 3-4) | `row` con `n` + `it` (+ `small` opcional). |
| `proof` | Prueba | `cases` (cards Geomiel/Perikos/…) **o** `grid` de logos de clientes. |
| `media` | Momento 3D / foto | `copy` (texto) + `visual` (model-viewer / img). Layout a 2 columnas. |
| `cta` | Cierre | `over` + `h2` + `contact` (mail/web/IG) + `footnote` (tagline). |

Archetypes con assets (3D, foto full-bleed, grid de logos, motivo "scatter") están listos para copiar en el bloque comentado **ARCHETYPES OPCIONALES** al final de la plantilla.

---

## Ritmo de color (clave para que impacte y NO sea monótono)

El error a evitar es el deck todo-negro-y-lima (monótono). Pero el opuesto —un arcoíris sin sistema— es peor. La regla: **base oscura + 2-3 colores de acento elegidos para ESE deck**, rotando.

- **Base oscura** (`s-dark` / `s-surface` / `s-night`) para la columna narrativa — alternalos para que no se fundan.
- **Elegí 2-3 bloques de color de acento por deck** (no los seis). Asignalos a momentos con sentido:
  - el **enemigo / tensión** → `s-coral`
  - **identidad / tecnología** → `s-celeste`
  - **futuro / datos** → `s-violeta`
  - **quiebre / lo creativo** → `s-rosa`
  - **respiro** → `s-claro`
- **Cambiá de fondo seguido** (cada 1-2 placas algo cambia: color, o al menos oscuro↔oscuro). Que ninguna sección se sienta igual a la anterior.
- **Lima = un solo pico.** Reservalo para el clímax/CTA. Si hay dos placas lima a menos de 3 de distancia, sacá una. El impacto vive en la escasez.
- **Coherencia:** el mismo rol siempre el mismo color dentro del deck (si el enemigo es coral, todos los momentos de tensión son coral).

Adaptá la audacia al cliente: para un pitch institucional/gobierno, menos saturación y más sobrio (celeste/claro). Para una marca joven/creativa, dale rosa/violeta/coral con todo.

## Variación de tamaño + repetición (dinamismo tipográfico)

No todo el texto grita al mismo volumen. En una misma placa mezclá escalas:
- **Gigante** (`clamp(56px,13vw,230px)`) para la palabra-ancla.
- **Mediano** (`clamp(20px,3vw,50px)`) para bajar la idea.
- **Pie chico** (`clamp(13px,1.4vw,18px)`, opacity .5) para el detalle que no compite.

**Repetición / scatter:** repetir una palabra (vertical, o desparramada y rotada con `transform:rotate()` + `position:absolute`) para enfatizar — estilo "no olvidarlo / pregunta.pregunta" de las refs. El ejemplo está en el bloque **ARCHETYPES OPCIONALES** de la plantilla. Usar con criterio, 1 vez por deck como mucho.

---

## Tipografía y aire
- Headlines en 800, `letter-spacing` negativo, leading `.98`. Que la palabra ocupe la pantalla.
- **El texto respira, no llena.** Mucho margen. Si el slide se ve "lleno", sacá palabras, no achiques la fuente.
- Una palabra en lima por slide. Los `kicker`/`over` en mono, chiquitos, en mayúscula, con tracking.
- Tamaños ya resueltos con `clamp()` (escalan a cualquier pantalla). No pongas px fijos.

---

## Imágenes y 3D: ¿de quién son? (REGLA DE ORO)

**En un deck de cliente, las imágenes y objetos aluden al CLIENTE, nunca a Chimpancé.** El mono, la selva y las fotos de marca son el mundo de Chimpancé → reservados para decks **DE Chimpancé** (credenciales / quiénes somos). Meter nuestro mono en el pitch de un cliente hace que la presentación hable de nosotros, no de ellos. (Detalle en `SKILL.md` → *Regla de imágenes y objetos 3D*.)

Cuando un slide pida imagen/3D/logo, **copiá el archivo a `Chimpa/content/decks/<cliente>/assets/`** para que el deck sea portable.

### Para un deck de CLIENTE (la mayoría de los casos)
Todo alude al producto / servicio / mundo del cliente. Entra como **placeholder marcado** que Santiago reemplaza con material real.

| Necesito | De dónde sale | Cómo |
|---|---|---|
| Foto del producto / mundo / público del cliente | la pasa el cliente (placeholder hasta tenerla) | full-bleed con grano + tinte (archetype foto full-bleed). |
| Mockup de lo que le construimos | su pantalla en un dispositivo (phone/laptop) | archetype "device mockup". |
| Objeto 3D alusivo a SU rubro | render/stock de su industria — **no el mono** | ej. nodos/red para tech, packaging 3D para retail, dispositivo para una app. |
| Logos de clientes (prueba) | `Chimpa/brand/Logos/clientes/*.svg` | OK como credibilidad en la placa "quiénes somos" (no es objeto de marca de relleno). aapresid, banco-provincia, **muni-corrientes**, unc, copa, molinos-agro, etc. |

### Solo para decks DE Chimpancé (credenciales / quiénes somos institucional)
**Nunca** en el pitch de producto de un cliente.

| Asset | Archivo en `Chimpa/brand/` |
|---|---|
| Mono 3D (rotación) | `monkey+3d+model.glb` → `mono.glb` (con `<model-viewer>`) · renders `recursos/monkey-1.png`, `monkey-2.png` |
| Selva / hojas | `recursos/selva.png`, `hoja-monstera.png`, `kv-assets/hoja-palmera.webp` |
| Logo Chimpancé | `Logos/chimpance-offwhite-sobre-oscuro.svg`, `IsoChimpance-blanco.png` |
| Fotos de marca | `recursos/fotos/{branding,caso-exito,proyecto1,testimonio}.webp` |

---

## Renderizar y exportar

1. **Clonar:** copiá `plantilla-deck.html` → `Chimpa/content/decks/<cliente>/index.html`. (La plantilla ya trae un deck Software Factory completo como ejemplo y vara de calidad: reemplazá su contenido, no empieces de cero el CSS.)
2. **Llenar:** reemplazá los `<section class="slide">` dentro de `<main id="deck">`. Actualizá el `<title>`. El `count` de la nav y el progreso se calculan solos.
3. **Assets:** copiá a `./assets/` lo que uses; si metés 3D, agregá el `<script type="module">` de model-viewer en el `<head>` (está indicado en el archetype opcional).
4. **Presentar:** abrir el `.html` en el navegador → **F** pantalla completa. **←/→** navegar, **N** guión del presentador, click mitad izq/der.
5. **Exportar PDF:** `python assets/exportar-pdf.py "Chimpa/content/decks/<cliente>/index.html"`. Genera 1 slide = 1 página, 16:9, sin páginas en blanco. (Agregá `--png` si querés las imágenes sueltas de cada slide.)

> El deck NO se reescribe desde cero: se clona la plantilla y se reemplaza contenido. Todo el CSS, la navegación, el grano, el guión y el print ya están resueltos y testeados.
