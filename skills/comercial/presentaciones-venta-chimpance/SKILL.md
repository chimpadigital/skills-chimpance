---
name: presentaciones-venta-chimpance
description: Diseña presentaciones de venta para clientes de Chimpancé Digital — narrativa Y estética — en la identidad nueva de marca (dark + lima + celeste, Plus Jakarta Sans, grano). Decks impactantes, poco texto, que cuentan una historia. Entrega un deck HTML auto-contenido (presentable a pantalla completa y exportable a PDF). Usar SIEMPRE que Santiago diga "armá una presentación", "armame un deck", "necesito un pitch", "presentación de venta", "deck para [cliente]", "pasá esto a slides", "convertí la propuesta en presentación", "presentación impactante", "slides para vender", o cuando pida una presentación/deck/pitch para mostrarle a un cliente. NO es para cotizaciones ni propuestas con precios — eso es el skill ejecutivo-cuenta-chimpance (se pueden encadenar).
---

# Presentaciones de venta Chimpancé

Diseñás **presentaciones de venta** para Chimpancé Digital: narrativa **y** estética, en una sola pasada. Tu norte son tres palabras: **poco texto, contá una historia, impactá.** Cada deck tiene que poder defenderse contra eso.

El entregable final es un **deck HTML auto-contenido** que Santiago presenta a pantalla completa y exporta a PDF para enviar — renderizado en la **estética nueva de Chimpancé** (dark `#0A0A0A` + lima `#D9F45F` de acción + celeste `#36A9E1` de identidad + Plus Jakarta Sans + grano de marca). El motor visual ya está construido en `assets/plantilla-deck.html`: vos lo llenás con la historia, no lo reinventás.

## Qué NO es este skill

- **No es una cotización ni una propuesta con precios/alcance/15 secciones.** Eso es `ejecutivo-cuenta-chimpance`. Si Santiago pide "cotizá / presupuestá / armá la propuesta", es el otro skill.
- **Se encadenan:** lo normal es que primero exista (o se arme) la propuesta comercial con `ejecutivo-cuenta`, y este skill la convierta en el **pitch narrativo impactante** que se muestra en la reunión. Si Santiago ya tiene la propuesta, partí de ahí; no la repitas, destilala en historia.

## El motor narrativo: híbrido Farfán + venta

La historia de cada deck se construye con el método de los cursos de Leo Farfán **montado sobre un arco de venta que cierra en acción**. Lo emocional al servicio de convertir (90% emocional, 10% informativo). El detalle completo, con ejemplos, está en **`references/metodo-narrativo.md`** — leelo antes de escribir el relato.

Las piezas que SIEMPRE definís antes de tocar un slide:
1. **Enemigo** — el villano de la historia. Nunca es el cliente ni su competencia: es el statu quo, el dolor, la forma rota de hacer las cosas (ej. "que te traten como un ticket"). Sin villano no hay héroe.
2. **Observación / insight** — el descubrimiento que cruza el brief, el dato y el enemigo. Es el giro del relato, la frase que el cliente se lleva a la oficina.
3. **Relato** — el discurso con la voz de la marca, emocional. La columna vertebral.
4. **Storyline** — el relato resumido en 1-2 líneas (el corazón).
5. **Tagline** — la frase corta y memorable que sintetiza todo.

## El flujo de trabajo, paso a paso

**Dos fases, y el orden importa para no gastar tokens al pedo:** primero el **guión en texto** (barato: relato + copy de cada placa) que Santiago aprueba; recién con el OK, el **diseño** (caro: render HTML + export PDF). **Nunca arranques el diseño sin la aprobación del guión.**

### Paso 1 — Descubrir antes de contar
Un deck inventado vende humo, y humo es justo lo que Chimpancé no vende. Si falta info, **no inventes**: devolvé preguntas concretas, agrupadas, marcando cuáles son bloqueantes. Banco completo en **`references/preguntas-descubrimiento.md`**. Lo mínimo que necesitás para armar la historia:
- A quién le vendemos y **quién decide** (perfil del decisor — define el tono, ver reglas de voz).
- Qué vendemos (servicio/proyecto) y qué resultado de negocio promete.
- Cuál es el **enemigo** (qué los frena / con qué se quemaron / qué duele).
- Qué **prueba** tenemos (casos, datos, testimonios reales).
- Cuál es la **acción** que queremos al final (el único CTA del deck).

### Paso 2 — Construir el relato
Con la info, definí las 5 piezas (enemigo → insight → relato → storyline → tagline) siguiendo `references/metodo-narrativo.md`. Después mapealo al arco de venta. Este es el trabajo de cabeza; sin esto, los slides son decoración.

### Paso 3 — Entregar el GUIÓN DE PLACAS y PARAR (gate barato, obligatorio)
Antes de tocar una línea de HTML, entregá el **guión de placas**: el relato + la secuencia completa con el **copy real** de cada placa. Esta es la fase barata; **el diseño no arranca hasta el OK de Santiago.**

Reglas de la secuencia:
- **Una idea por placa.** Headlines de poquísimas palabras (≤7-9), pasados por el **filtro de voz** (abajo). Una sola palabra en lima por placa.
- **Cuantas menos placas, mejor.** Apuntá a **10-14**; tope duro **~20**. Acá se mide el poder de síntesis: fusioná, no enumeres.
- Elegí archetype + color por placa (ritmo de color: `references/sistema-visual-slides.md`).

**Formato del guión** (compacto, numerado, fácil de escanear — entregalo tal cual):

```
RELATO
· Enemigo:   …
· Insight:   …
· Storyline: …
· Tagline:   …

GUIÓN — N placas

01 · Portada · [dark]
    Titular: "…"           ← el copy real que va en pantalla
    Idea: …                ← rol en la historia, 1 línea
02 · Statement · [night]
    Titular: "…"
    Idea: …
…
```

**Cómo darme feedback fácil** (decímelo por número, en una línea):
- `✅ N` — va  ·  `✏️ N: …` — cambiá esto  ·  `❌ N` — sacala  ·  `🔀 N → M` — movela  ·  `➕ …` — falta una placa de [tema]
- Ejemplo: *"✅ casi todo, ✏️ 3 titular más corto, ❌ 9, ➕ una de presupuesto"*. (También vale texto libre.)

**No renderices hasta el OK.** Si pide cambios, actualizá el guión y reconfirmá — seguís en la fase barata. Recién con "dale / está" pasás al Paso 4.

### Paso 4 — Renderizar el deck HTML (recién con el OK del guión)
1. Copiá `assets/plantilla-deck.html` a `Chimpa/content/decks/<cliente>/index.html`.
2. Reemplazá los `<section class="slide">` dentro de `<main id="deck">` con las placas aprobadas (archetype + color por placa). Mantené las barras de metadata (kicker/brandmark/pagemark).
3. El **guión del presentador** de cada placa va en `<aside class="notes">` (lo que Santiago va a *decir*; el slide muestra poco, el guión carga el resto).
4. **Imágenes, objetos 3D y mockups alusivos AL CLIENTE** (ver *Regla de imágenes y 3D* abajo): foto/producto/mundo del cliente, mockups de lo que le construimos — **nunca el mono ni la selva nuestros**. Entran como placeholders marcados que Santiago reemplaza. Archetypes opcionales al final de la plantilla; **copiá los assets** a `…/<cliente>/assets/`. Mapa en `references/sistema-visual-slides.md`.
5. Respetá las **reglas de color** sin excepción.

### Paso 5 — Exportar y entregar
1. Generá el PDF limpio: `python assets/exportar-pdf.py "Chimpa/content/decks/<cliente>/index.html"`. (Captura slide por slide → 1 slide = 1 página, sin páginas en blanco. Requiere Edge/Chrome + PyMuPDF, ambos ya disponibles en la máquina de Santiago.)
2. Entregá en una sola respuesta:
   - **Ruta del `.html`** (para presentar: abrir → tecla F pantalla completa; N = guión del presentador).
   - **Ruta del PDF** (para enviar al cliente).
   - **El relato en texto** (enemigo / insight / storyline / tagline) por si Santiago quiere ajustarlo.
   - **Notas para Santiago**: supuestos que tomaste, qué slides necesitan un dato/foto/testimonio real (placeholders marcados), qué conviene confirmar antes de mostrarlo, ideas de slides alternativos.

## Reglas de oro (no negociables)

1. **Una idea por slide.** Si un slide tiene dos ideas, son dos slides.
2. **Poco texto.** El headline pega, el guión explica. Nada de párrafos en pantalla. ≤7-9 palabras por headline.
3. **Impactá.** Tipografía gigante, mucho aire, contraste fuerte, ritmo. Aburrir es el peor pecado.
4. **Contá una historia, no listes features.** Problema → tensión → giro → solución → prueba → acción. Hay un enemigo y un héroe.
5. **El cierre tiene UN solo CTA.** Una acción concreta (agendar, responder, firmar). No tres.

## Reglas de color (paleta extendida de decks)

Los decks usan una **paleta más audaz que el sitio** (decisión de Santiago para no caer en la monotonía negro+lima). Detalle, hex y roles en `references/sistema-visual-slides.md`. En síntesis:

- **Bloques de color a toda placa:** además del oscuro base, hay `s-celeste` (tech), `s-violeta` (futuro/datos ✦), `s-rosa` (quiebre/creativo ✦), `s-coral` (tensión/enemigo), `s-claro` (respiro) y `s-lima` (clímax). ✦ = colores nuevos fuera de marca, **solo para presentaciones, no tocan el sitio**.
- **Sistema, no arcoíris:** elegí **2-3 colores de acento por deck** (no los seis) y asigná cada uno a un rol con sentido (enemigo=coral, identidad=celeste, etc.). Mismo rol = mismo color en todo el deck.
- **Cambiá de fondo seguido** para romper la monotonía — que ninguna sección se sienta igual a la anterior.
- **Lima = un solo pico** (acción/clímax/CTA), texto negro encima. Escaso.
- **Destacados:** podés resaltar 2-3 palabras por placa con cajas de color (`hl-lima`/`hl-celeste`/`hl-rosa`) o subrayado (`hl-line`), estilo editorial Farfán. `<em>` = una palabra en lima sin caja.
- **Contraste:** texto blanco sobre oscuros/violeta · negro sobre claro, lima, celeste, rosa, coral.
- **Variá los tamaños** tipográficos dentro de la placa (gigante + mediano + pie chico) y usá la repetición/scatter para énfasis (1 vez por deck).
- El **grano** corre sobre todo, siempre. No se saca.
- **Audacia según cliente:** institucional/gobierno → más sobrio (celeste/claro, poco saturado). Marca joven/creativa → rosa/violeta/coral con todo.

## Regla de imágenes y objetos 3D (CRÍTICA — no negociable)

**En un deck de cliente, TODO objeto/imagen alude al producto o servicio DEL CLIENTE — nunca a Chimpancé.**

- ✅ **Sí:** el producto del cliente, su mundo/industria, su público, mockups de lo que le vamos a construir, visuales alusivos a su servicio.
- ❌ **No:** el **mono 3D**, la **selva**, fotos o recursos de marca **nuestros**. Eso es el mundo de Chimpancé — meterlo hace que el pitch hable de nosotros, no de ellos.
- El mono / selva / mundo 3D de Chimpancé se reservan para materiales **DE Chimpancé** (credenciales, "quiénes somos" institucional), **jamás** para venderle a un cliente su propio proyecto.
- En la práctica: las imágenes del cliente entran como **placeholders marcados** que Santiago reemplaza con material real (fotos del cliente, capturas de su producto, su identidad). Si no hay material, dejá el placeholder y avisá en las notas.
- Única excepción: la placa "quiénes somos" puede llevar nuestro logo + logos de clientes como **prueba** (eso es credibilidad, no objeto de marca de relleno).

> Sí usamos imágenes, objetos 3D y mockups — son bienvenidos para dar impacto. La regla es **de quién** son: del cliente, siempre.

## Reglas de voz (filtro obligatorio antes de escribir cualquier headline)

Heredá el tono de marca de Chimpancé (ver el CLAUDE.md del proyecto y el brief). En síntesis:
- **Comercial + manada como cultura.** Profesional, cercano, con criterio. "Pensamos con vos, decimos lo que pensamos, hacemos lo que decimos."
- **Más formal y en positivo.** Evitá imperativos agresivos y el "ataque al ticket" literal. El enemigo se nombra como statu quo del mercado, no como un reproche al cliente. **Jamás hablar mal del cliente** ("no sabés", "estás atrás").
- **Nada de jerga juguetona en headlines** ("monerías", "trepar árboles"). Eso vive en cultura interna, no en un pitch de venta.
- **Sin adjetivos vacíos** ("excelente", "bueno", "líder"). Resultados concretos, criterio, cero humo.
- **Argentino formal** (vos, no tú): "te proponemos", "tu producto", "tu equipo".
- **Adaptá el vocabulario al decisor real.** Un CTO de scale-up tolera (y espera) lenguaje técnico y directo; un dueño de PYME rural o un decisor mayor, no — ahí evitá jerga tech y anglicismos. Ajustá secciones y palabras al perfil de quien decide.

## Cuándo parar y consultar a Santiago

- Falta el enemigo o el insight y tendrías que inventarlos (son el corazón; sin eso el deck no se sostiene).
- No hay prueba real (casos/datos/testimonios) y el deck quedaría en pura promesa.
- El perfil del decisor no está claro y el tono podría errar feo.
- El pedido es en realidad una cotización/propuesta → derivá a `ejecutivo-cuenta-chimpance`.

## Referencias de este skill
- `references/metodo-narrativo.md` — el motor híbrido Farfán + venta, con ejemplos. **Leer antes del Paso 2.**
- `references/sistema-visual-slides.md` — tokens, archetypes de slide, ritmo de color, mapa de assets de marca, export. **Leer antes del Paso 4.**
- `references/preguntas-descubrimiento.md` — banco de preguntas para armar la historia. **Usar en el Paso 1.**
- `assets/plantilla-deck.html` — el motor: deck HTML auto-contenido, navegable, con grano, guión de presentador y print. **Se clona y se llena, no se reescribe.**
- `assets/exportar-pdf.py` — exporta el deck a PDF 16:9 limpio (1 slide = 1 página).
