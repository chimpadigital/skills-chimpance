# Punto 4 — Design System web de la marca (andamiaje)

La **ley de diseño** del demo, atada a la marca y al dolor. Norte único del build + pieza de pitch. Reemplaza al viejo "key visual" (que era solo un hero).

## Paso 0 — Pedir material
Antes de arrancar, preguntá qué hay: logo (SVG ideal), manual de marca, paleta, tipografías, fotos, capturas del sitio actual. Con eso el DS usa la marca real; lo que falte se deriva mínimo y se marca provisorio.

## Paso 1 — Elegir la ORIENTACIÓN (la decisión que manda todo)
Sale de los **adjetivos de personalidad del brief + el rubro**. No dejes que salga "cuadrado" por defecto.

### Institucional / Cuadrada
- **Cuándo:** industria, banca, legal, salud, energía, B2B serio.
- **Color:** paleta contenida, 1 color de marca usado con criterio, mucho neutro.
- **Tipografía:** robusta/neutra, jerarquía clara, poco contraste tipográfico.
- **Layout:** grillas rígidas, simetría, orden, mucho respeto por el aire.
- **Motion:** sutil (fades, reveals suaves). Nada llamativo.
- **Sensación:** confianza, escala, solidez, seriedad.

### Comercial / Conversión
- **Cuándo:** SaaS, e-commerce, servicios, generación de leads, retail.
- **Color:** contraste alto, acento vibrante para CTAs, señales de acción.
- **Tipografía:** titulares con gancho, tamaños fuertes, legibilidad total.
- **Layout:** jerarquía de venta (beneficio → prueba → CTA), social proof, secciones orientadas a la acción, repetición de CTA.
- **Motion:** guía la mirada hacia el CTA (no decora).
- **Sensación:** claridad, urgencia sana, "esto me conviene".

### Artística / Editorial
- **Cuándo:** estudios creativos, cultura, moda, arquitectura, gastronomía, marcas de autor.
- **Color:** arriesgado, expresivo, paletas menos convencionales.
- **Tipografía:** protagonista, display expresiva/experimental, contrastes grandes.
- **Layout:** asimetría, mucho aire y movimiento, grillas rotas, scroll con intención.
- **Motion:** expresivo, parte del mensaje (parallax, transiciones, cursor).
- **Sensación:** audacia, distinción, "estos tienen ojo".

### Modificadores (se combinan sobre la orientación base)
- **minimal/tech** — menos elementos, más aire, mono/geométrica, precisión.
- **cálida/humana** — curvas, tonos cálidos, fotografía de personas, cercanía.
- **premium/lujo** — negro/dorado/contención, tipografía fina, lujo por resta.

## Paso 2 — Definir el sistema (tokens + componentes)
- **Fundamentos:** paleta con roles (marca / acento / fondos / texto / líneas) · tipografía (familias display+text, escala fluida con clamp) · espaciado · grilla · radios · sombras · **motion** (duraciones, easing, reglas).
- **Componentes:** botones (primario/secundario/estados) · cards · formularios (inputs, selects, validación) · header/nav (+ sticky, mobile) · footer · secciones tipo (hero, stats, features, proyectos, CTA) · badges/chips · estados (hover, vacío, error).
- **Imagen/iconografía:** tratamiento (duotono, overlays, ratios) e iconos (línea/relleno) según orientación.
- **Voz visual:** 2-3 líneas de "cómo se siente" según la orientación elegida.

## Paso 3 — Entregable
`.zip` con styleguide autocontenido:
```
design-system-[cliente]/
├── styleguide.html   ← el DS aplicado y presentable a pantalla completa
├── README.md         ← orientación elegida + decisiones y por qué (atado al dolor)
└── assets/           ← logo, fotos, fondos
```

### Secciones que debe mostrar `styleguide.html`
1. Portada / marca + **orientación elegida** (nombrarla).
2. Color (swatches con hex + rol + regla de uso).
3. Tipografía (specímenes reales: display + text, la escala).
4. Botones y estados.
5. Componentes clave (cards, formularios, badges, nav).
6. **Hero de muestra** (lo que antes era el key visual, ahora dentro del DS).
7. Ritmo de secciones / grilla / motion (nota).
8. Regla de fidelidad al pie (esto se aplica, no se reinventa).

### README debe decir
- La **orientación** y por qué (qué adjetivos del brief la justifican).
- Decisiones de color/tipo/motion atadas al dolor y a la marca real.
- Qué es definitivo y qué placeholder.
- Pendientes del cliente (logo vectorial, fotos reales, etc.).

## Anclaje (no inventar de la nada)
El DS ancla en: personalidad del brief (→ orientación) · manual de marca (→ color/tipo/logo oficiales) · jerga del rubro (→ tono) · el dolor (→ qué tiene que transmitir para ganar al cliente).
