# Plantillas de prompts para Replit

Texto base de cada paso, listo para adaptar y pegar en Replit. Reemplazá los `[PLACEHOLDERS]`. Están en orden de uso. Todos en español argentino, una tarea por prompt.

Índice:
1. Implementar la plantilla + elegir UNA home (Fase 0)
2. Pedirle a Replit el plan de intake (Fase 1)
3. Parte 1 — Contexto + estructura (la armás vos con UX)
4. Parte 2 — Identidad visual (design system) + key visual como norte
5. Parte 3 — Copy / contenido (lo escribís vos, en la jerga del cliente)
6. Parte 4 — Imágenes / assets
7. Confirmación / luz verde (checkpoint)
8. Feature grande por fases (ej. admin)

Nota: la estructura (3) y el copy (5) NO son placeholders — los redactás vos con
talento UX + UX Writing, atados al dolor del brief y en la jerga del rubro que
investigaste. Estos prompts solo los empaquetan para Replit.

---

## 1. Implementar la plantilla + elegir UNA home (Fase 0)

> Atómico, sin contexto todavía. Primero que la levante; después narrow a UNA home.
> La plantilla trae muchas homes y páginas demo: trabajar sobre todas dispara
> tiempo y tokens. **Elegir una y descartar el resto es el mayor ahorro del proceso.**
>
> ⚠️ **FIDELIDAD POR DEFECTO (lo más importante).** El instinto de Replit es rediseñar:
> si no lo blindás desde acá, monta el key visual como portada y arma otra web
> "inspirada" en el theme. Incluí la **frase de blindaje** desde el primer prompt.

**FRASE DE BLINDAJE (reusá esto en todo prompt que toque una página del theme):**
```text
Montá [esta página/demo exacto] tal cual. Solo cambiá 3 cosas: marca (color/tipo/logo),
textos (al español) e imágenes. NO reordenes, NO inventes secciones, NO rediseñes ni
"mejores" ningún bloque, NO cambies la estructura ni el orden. Si algo no entra o no
tiene sentido en español, PREGUNTAME antes en vez de resolverlo por tu cuenta.
```

**1a. Implementar y relevar:**
```text
Implementá esta plantilla. Solo eso: levantala corriendo tal cual viene, sin
modificar su base, sin rediseñar ni agregar nada. Cuando esté andando, decime qué
páginas y qué variantes de home trae, y cómo correrla.
```

**1b. Narrow a una home + fijar la fuente de verdad (apenas Replit lista las variantes):**
```text
La home del sitio es [index-3.html / la que elijas]: ESA es la fuente de verdad.
Dejá el demo original intacto como referencia y compará contra él antes de tocar.
Vamos a usar SOLO esa home y estas páginas: [lista]. El resto de las variantes de
home y las páginas demo NO las uses: dejalas sin enlazar (no las borres) y no trabajes
ni "mejores" sobre ellas.

[FRASE DE BLINDAJE]

Confirmame la home elegida antes de seguir.
```

---

## 2. Pedirle a Replit el plan de intake (Fase 1)

> Dejá que Replit proponga el orden. Ve el theme por dentro y secuencia mejor.

```text
Ya tenés la plantilla corriendo. Quiero construir sobre ella un sitio para
[CLIENTE / TIPO DE SITIO], reusando lo máximo posible del theme (estructura,
componentes, efectos) y aplicando arriba la identidad y el contenido del cliente.

Antes de que te pase nada: decime cómo preferís recibir el material para hacerlo
bien, en qué orden, y qué necesitás de mí en cada parte (contexto, mapa de sitio,
design system, copy, imágenes). No toques código todavía.
```

---

## 3. Parte 1 — Contexto + estructura (el esqueleto)

> De lo estructural a lo cosmético. Intención del lado cliente; que Replit la calce al theme.

```text
PARTE 1 — Contexto + estructura

## Contexto del cliente — [NOMBRE]
[2-4 líneas: qué es, a qué se dedica, público, tono. Slogan si tiene.]

## Home base (ya elegida en Fase 0)
Usamos la home [X]. Ignorá las demás variantes (sin enlazar, no borrar). [Si NO
se eligió aún: ELEGÍ VOS la que mejor calce con [CRITERIO, ej. "un sitio serio y
jerarquizado, con destacados arriba y franjas por sección"] y mostrámela antes de
seguir.]

## Mapa de sitio (intención — calzalo a las páginas que YA trae el theme)
Páginas: [Home, Listado/Categoría, Detalle/Nota, Perfil, etc.]
Navegación (labels exactos): [Item 1 · Item 2 (con sub-items: ...) · Item 3 ...]
Páginas del theme que descartamos: [las que no apliquen]. Decime cuáles quedan.

## Secciones de la home en orden (reusá los bloques de la variante; no inventes)
1. [Header + nav]
2. [Sección...]
...
Mapealas a los bloques que ya trae la variante. Si alguna no existe, usá el más
parecido o descartala — no crees componentes nuevos.

## Footer
[Columnas, links, legal.]

## Antes de implementar, confirmame:
1. La variante de home elegida (mostrámela).
2. El mapa final calzado al theme: qué reusás, qué adaptás, qué descartás.
No toques código hasta que confirmemos estos dos puntos.
```

---

## 4. Parte 2 — Identidad visual (design system)

> El DS va como **paquete** (tokens + logos + styleguide). Indicás cómo aplicarlo; no lo recreás.

```text
PARTE 2 — Identidad visual

Te adjunto / subí el paquete del design system: [styleguide.html + tokens.css +
assets/logos]. Es la fuente de verdad visual. Aplicalo sobre el theme así:

- Colores: usá los tokens de tokens.css. [Color de marca/acento] → mapealo a la
  variable de acento del theme. [Indicar fondos oscuros vs claros si aplica.]
- Tipografías: [fuentes + de dónde salen, ej. Google Fonts].
- Etiquetas/labels, botones, cards: seguí el estilo del styleguide.
- Logo: usá los archivos reales de assets/. [Para fondos oscuros, recoloreá por
  CSS / usá la variante clara — no hace falta otro archivo si el SVG usa clases.]
- Para fidelidad de componentes [ej. cards, detalle, perfil], mirá el styleguide.

Mantené todo el CSS propio en UN archivo aparte y los colores como variables, para
no tocar la base del theme. Aplicá la identidad y mostrame la home.
```

**+ Key visual como norte del hero** (adjuntá el `key-visual.zip`):
```text
Te adjunto el key-visual (key-visual.html + assets): es el NORTE del look y del
hero. Reskineá el hero de la plantilla para que se parezca a este key visual
(composición, mensaje, uso de color/tipo), PERO aprovechando las animaciones y
efectos que la plantilla ya trae — no los pierdas, son parte del valor. El resto
del sitio sigue la misma dirección visual. Mostrame el hero antes de seguir.
```

---

## 5. Parte 3 — Copy / contenido

```text
PARTE 3 — Copy / contenido

Por página y sección (siguiendo el orden de la Parte 1). Para cada tarjeta/ítem:
[categoría, título, bajada/extracto, autor, fecha, a qué imagen va]. Con ~3-6 de
ejemplo por sección alcanza para una demo creíble.

[Pegar el contenido organizado por sección.]
```

---

## 6. Parte 4 — Imágenes / assets

```text
PARTE 4 — Imágenes / assets

Te paso las imágenes mapeadas a su lugar [ej. "hero", "nota-1", "categoria-x"].
Las que falten, cubrilas con stock acorde y marcalas como placeholder.

[Adjuntar / listar URLs con su mapeo.]
```

---

## 7. Confirmación / luz verde (checkpoint)

> Para responder cuando Replit propone algo y espera tu OK antes de codear.

```text
[Punto] aprobado, quedó bien. [Si tomó micro-decisiones sensatas: confirmалas y
decí por qué suman.] [Ajustes puntuales si hay.]

Avanzá con [lo siguiente]. [Recordatorio del foco si aplica.] No avances a [la
fase siguiente] hasta que confirme.
```

---

## 8. Feature grande por fases (ej. admin / panel)

> Para módulos que el theme no trae. Alcance completo para contexto, ejecución fase por fase.

```text
[NOMBRE DE LA FEATURE, ej. ADMIN / PANEL]

## Objetivo
[Qué es y para qué. Es un DEMO FUNCIONAL de venta: el flujo clave tiene que ANDAR de
verdad (no una maqueta). Aclará cuál es ese flujo y por qué ataca el dolor del cliente.]

## Enfoque técnico (funcional pero sin sobre-ingeniería)
[El flujo central FUNCIONA y el dato PERSISTE (persistencia liviana: DB de Replit /
JSON / localStorage). Sin backend productivo, auth segura ni integraciones reales.
Si hay módulos relacionados, COMPARTEN la misma base (ej. front que guarda + admin que
lee de ahí). Definí el modelo de datos acá, para que los módulos siguientes lo reusen.
Ruta separada; responsive total; reusar la identidad del DS.]

## CONSTRUÍ POR FASES (importante)
Hacé SOLO la Fase 1 ahora y mostrámela. No avances hasta que te confirme. Te dejo
el alcance completo para que tengas el panorama, pero ejecutá de a una fase.

### Fase 1 — [Shell + base]  ← HACÉ ESTO AHORA
[Layout/navegación + lo mínimo navegable, ej. dashboard.]

### Fase 2 — [Módulo central]
[Detalle de campos/acciones.]

### Fase 3..N — [Otros módulos]
[...]

## Datos seed
[Qué precargar para que la demo se vea llena y creíble.]

## NO hagas
[Integraciones reales, pagos, seguridad productiva, etc. — pero el flujo de venta SÍ funciona.]

## Verificación del circuito
[El momento "anda de verdad" que vas a mostrar en la presentación, ej. "quiero poder
hacer X en el front y ver que aparece/cambia Y en el admin".]

Arrancá con la Fase 1 y mostrámela.
```
