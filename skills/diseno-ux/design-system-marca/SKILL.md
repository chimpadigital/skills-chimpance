---
name: design-system-marca
description: >-
  Genera design systems completos, creativos y presentables a clientes para todo el
  ecosistema digital de una marca (web, mobile, dashboards, e-commerce, email), con foco
  en UX/UI de interfaces. Produce una style guide HTML interactiva con componentes
  renderizados en vivo, más design tokens en JSON y CSS listos para desarrollo. Usá este
  skill siempre que el usuario mencione "design system", "sistema de diseño", "UI kit",
  "style guide", "guía de estilos", "tokens", "librería de componentes", "identidad
  visual para una app o sitio", "branding digital", o pida definir/unificar la apariencia
  de las interfaces de una marca — incluso si no usa la palabra "design system" (por
  ejemplo "necesitamos que la web y la app se vean consistentes", "armame la base visual
  del producto").
---

# Design System de Marca — UX/UI para el ecosistema digital

Este skill produce design systems con calidad de agencia: creativos, coherentes, accesibles y listos tanto para presentar a un cliente como para entregar a un equipo de desarrollo. El resultado nunca debe verse como "otra plantilla genérica de SaaS": cada sistema tiene que sentirse diseñado *para esa marca* y para nadie más.

## Entregables

Todo design system generado con este skill produce, como mínimo:

1. **`styleguide.html`** — Una style guide interactiva, autocontenida en un solo archivo HTML (CSS y JS inline), navegable, con todos los componentes renderizados en vivo y en todos sus estados. Es la pieza que se presenta al cliente. Estructura detallada en `references/styleguide-html.md`.
2. **`tokens.json`** — Design tokens en formato estándar (estructura primitivos → semánticos), para herramientas de diseño y pipelines de desarrollo.
3. **`tokens.css`** — Los mismos tokens como custom properties de CSS (`:root` + `[data-theme="dark"]`), listos para usar.

Si el usuario pide además documentación de guidelines (principios UX, voz de interfaz, criterios de uso), agregala como sección dentro de la style guide, no como archivo suelto — así todo vive en una sola pieza compartible.

Los entregables van **en español** por defecto (etiquetas, documentación, nombres de secciones), salvo los nombres técnicos de tokens y componentes, que van en inglés (`color-primary-500`, `Button`) porque así los consumen los devs. Si el usuario indica otro idioma, respetalo.

## Flujo de trabajo

El orden importa: la dirección creativa se decide **antes** de tocar tokens o componentes. Un sistema técnicamente perfecto sobre una dirección visual mediocre es un entregable mediocre.

### 1. Brief: marca, target y alcance

Leé `references/brief.md` antes de este paso.

Completá el mini brief (negocio, target y contexto de uso, acción principal, personalidad, competencia, material existente, alcance, mercado, restricciones). Con interlocutor presente, preguntá solo lo que el pedido no responda, en un solo intercambio; sin interlocutor, inferí y documentá el **"Brief asumido"** al inicio de la style guide. El target no es contexto decorativo: define perillas concretas de UI (densidad, tamaños, contraste, convencionalismo de patrones) según la tabla de `brief.md`, y la guía documenta en "Para quién diseñamos" qué decisiones determinó.

Identificá también cuál de los dos puntos de partida aplica:

- **Marca existente**: hay logo, colores, tipografías o un manual de marca. Tu trabajo es *traducir* esa identidad al lenguaje de interfaces — no inventar una nueva. Extraé los colores exactos, identificá las tipografías (o sus equivalentes web/open-source más cercanos si las originales no están disponibles) y respetá la personalidad ya definida.
- **Desde cero**: solo hay un brief o descripción del negocio. Acá el skill propone la dirección visual completa. Antes de avanzar, definí el concepto creativo (ver paso 2).

Definí también el alcance del ecosistema: ¿solo web? ¿web + app móvil? ¿incluye dashboards internos, e-commerce, emails? Si el usuario no lo especifica y hay con quién dialogar, preguntá (junto con el resto del mini brief, no como pregunta suelta). Si no hay respuesta posible, asumí web + mobile y decilo explícitamente en el entregable.

### 2. Dirección creativa

Leé `references/direccion-creativa.md` antes de este paso.

El corazón del skill. Definí un **concepto creativo** con nombre y justificación: qué personalidad tiene la marca en pantalla, qué la distingue, y cómo eso se traduce a decisiones concretas de tipografía, color, forma, espacio y movimiento. Si partís desde cero y el contexto lo permite, proponé 2–3 direcciones distintas para que el usuario elija; si no hay interlocutor, elegí una con criterio y justificala.

La dirección creativa se documenta al inicio de la style guide: un cliente tiene que poder leer esa primera sección y entender *por qué* su sistema se ve como se ve.

### 3. Tokens

Leé `references/tokens.md` antes de este paso.

Construí la arquitectura de tokens en dos capas (primitivos → semánticos), con rampas de color completas, escala tipográfica, espaciado, radios, sombras, elevación y movimiento. Incluí modo oscuro desde el día uno: no como inversión mecánica sino como tema diseñado.

### 4. Verificación de accesibilidad

Corré el script de contraste sobre los pares de color reales del sistema:

```bash
python scripts/check_contrast.py tokens.json
```

El script valida los pares semánticos declarados en el bloque `_contrast_pairs` del JSON contra WCAG AA. Si algún par falla, **ajustá los tokens** (normalmente basta con mover el color al paso más oscuro/claro de la misma rampa) y volvé a correr hasta que pase todo. Un design system de agencia no se entrega con contrastes que fallan.

### 5. Componentes y expresión visual

Leé `references/componentes.md` y `references/expresion-visual.md` antes de este paso.

Definí el inventario según el alcance acordado y especificá cada componente con todos sus estados (default, hover, focus, active, disabled, loading, error donde aplique). Los componentes se construyen **solo con tokens** — si un componente necesita un valor que no existe como token, el token faltante se agrega al sistema, no se hardcodea.

En paralelo al inventario, construí las capas de expresión visual (`expresion-visual.md`): el set de iconos del sistema (toda acción lleva icono), las ilustraciones SVG de marca, el catálogo de micro-interacciones con demos vivas, los banners de contraste y la sección Mobile dedicada. Estas capas no son un extra de pulido final: son parte del inventario.

### 6. Ensamblar la style guide

Leé `references/styleguide-html.md` antes de este paso.

Armá el `styleguide.html` siguiendo esa estructura. Regla de oro: **la style guide se diseña con el propio sistema que documenta**. Si el sistema define una tipografía display serif y esquinas rectas, la style guide usa esa tipografía y esas esquinas. Una guía que documenta una marca cálida con estética de documento técnico frío se contradice a sí misma.

Como es un archivo largo (típicamente 1500–3000 líneas), construilo por secciones en varias pasadas, no en una sola escritura.

### 7. Control de calidad final

Antes de entregar, verificá:

- El HTML abre sin errores y sin dependencias externas rotas (las tipografías de Google Fonts son la única dependencia externa aceptable; todo lo demás inline).
- Todos los componentes listados en el inventario aparecen renderizados, con sus estados.
- Los valores mostrados en la guía coinciden con `tokens.json` y `tokens.css` (nada de documentar `#2B6CB0` y usar `#2C6CB2`).
- El toggle de modo oscuro funciona y ningún texto desaparece sobre su fondo.
- El script de contraste pasa.
- La navegación de la guía funciona en mobile (la guía misma es responsive — es una demo implícita del sistema).

## Criterios de calidad no negociables

**Distintividad.** Antes de cerrar la dirección creativa, hacete esta pregunta: si tapo el logo, ¿este sistema podría ser de cualquier otra empresa del rubro? Si la respuesta es sí, la dirección es débil. Los síntomas típicos del "diseño genérico de IA" a evitar: gradiente violeta/azul sobre fondo oscuro, Inter/Roboto como única tipografía, esquinas redondeadas medianas en todo, sombras suaves idénticas en todas las cards, emojis como iconografía. Cada uno de estos elementos es legítimo cuando es una *elección*; el problema es cuando aparecen por defecto.

**Coherencia sistémica.** Cada decisión visual deriva de la dirección creativa y se expresa como token. La prueba: cualquier pantalla nueva que un diseñador o dev construya usando solo los tokens y componentes debería verse inequívocamente "de la marca".

**Accesibilidad real, no declarativa.** Contraste AA verificado con el script (no estimado a ojo), targets táctiles de mínimo 44×44px en mobile, estados de foco visibles y diseñados (no el outline azul del navegador), y jerarquía que funciona también para quien no distingue colores.

**Vivo, no plano.** Un sistema técnicamente correcto pero visualmente estático es un entregable a medias. El estándar: toda acción acompañada de icono, un lenguaje de imagen propio (ilustración SVG y trama de marca — icono + texto solo, aburre), micro-interacciones definidas y demostradas (el CTA cuyo icono se desliza al hover, la card que se eleva, el reveal al scroll), y ritmo visual con banners de fondos contrastantes que rompen la lectura. La guía misma practica todo esto: si recorrerla no produce ningún momento de "qué lindo esto", falta trabajo.

**Pensado para el usuario final.** Cada componente se juzga desde quien lo usa: ¿el label dice lo que pasa al tocarlo? ¿el icono refuerza el significado? ¿el feedback de la acción es inmediato y visible? ¿lo importante está a un toque de distancia en mobile? La sección Mobile dedicada de la guía no es opcional.

**Utilidad para desarrollo.** Los tokens tienen nombres semánticos predecibles, el CSS es copiable tal cual, y cada componente de la guía muestra su código. Un dev tiene que poder empezar a construir sin hacer ninguna pregunta.
