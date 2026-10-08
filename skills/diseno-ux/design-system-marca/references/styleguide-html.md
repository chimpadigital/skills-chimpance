# Estructura de la style guide HTML

Un solo archivo `styleguide.html`, autocontenido (CSS y JS inline; única dependencia externa permitida: Google Fonts). Debe abrir perfecto con doble click, sin servidor.

## Principio rector

**La guía se construye con el sistema que documenta.** El `<style>` de la guía importa/replica `tokens.css` y toda la UI de la guía (navegación, títulos, cards de documentación) usa esos tokens. El cliente experimenta el sistema mientras lo lee. Esto también obliga a que el sistema sea realmente usable — si no podés construir la guía cómodamente con los tokens, los devs tampoco van a poder construir el producto.

## Chrome de la guía

- **Sidebar fija** (desktop) con navegación por secciones y scroll-spy simple; colapsa a menú hamburguesa/top bar en mobile. La guía es responsive: es la primera demo del sistema.
- **Toggle claro/oscuro** persistente en el header (variable JS en memoria — sin localStorage), que cambia `data-theme` en `<html>`. Todo el contenido, incluidos los componentes de ejemplo, responde al tema.
- **Botones de copiado** en todo valor copiable: hex de colores, nombres de token, snippets de código.

## Secciones, en orden

1. **Portada** — Nombre de la marca, nombre del design system, versión y fecha, y el **concepto creativo** en una frase protagonista. Es un hero: primera impresión del sistema en acción.
2. **Dirección creativa** — El concepto con su justificación (2–4 párrafos), el bloque **"Para quién diseñamos"** (perfil del target en 2–3 líneas y las decisiones de UI que determinó — ver `brief.md`), qué convención del rubro se rompe y cuál se respeta, y las decisiones clave en formato "decisión → porqué". Si el proyecto era desde cero, mencioná qué direcciones alternativas se consideraron. Si hubo brief asumido (sin interlocutor), va acá, al inicio, para que el cliente corrija rápido.
3. **Logo y marca** *(si hay material de marca)* — Usos sobre fondos del sistema, zona de seguridad, tamaños mínimos en pantalla.
4. **Color** — Rampas primitivas completas (swatches clickeables con hex), luego los semánticos mostrados **en contexto** (mini-ejemplos: texto sobre superficie, acción sobre página), y una tabla de pares de contraste con su ratio y ✓ AA. En ambos temas.
5. **Tipografía** — Especímenes de cada rol de la escala con texto real del rubro del cliente (no lorem ipsum), tabla de la escala (rol, familia, tamaño/clamp, line-height, peso), y el par display+body mostrado conviviendo.
6. **Espaciado y forma** — Escala de espaciado visualizada, radios, elevación/sombras con ejemplos apilados, grilla y breakpoints.
7. **Iconografía** — Grilla del set completo de iconos del sistema (sprite SVG inline) con nombres y tamaños, más ejemplos de icono+texto aplicado en botones, menús y estados. Ver `expresion-visual.md`.
8. **Imagen e ilustración** — Las ilustraciones SVG de marca del sistema, las tramas (patterns) en sus variantes de densidad con su código aplicable, el tratamiento fotográfico documentado (proporciones, overlay, radios) y los placeholders con personalidad. Ver `expresion-visual.md`.
9. **Movimiento y micro-interacciones** — Duraciones y easings, más el catálogo de micro-interacciones con demos vivas y disparables (CTA con icono que se desliza, card que se eleva, reveal al scroll, contador animado, switch elástico...), y la regla de `prefers-reduced-motion`.
10. **Componentes** — El grueso. Organizado por los bloques del inventario (ver `componentes.md`), cada componente con render vivo de estados + uso + código copiable. Usá `<details>` o tabs para el código, que no ensucie la lectura visual.
11. **Mobile** — Sección dedicada con demos en marcos de teléfono: menú mobile con su animación, cards reorganizadas (scroll horizontal con snap o columna), zonas de pulgar, targets y tipografía táctil, gestos y safe areas. Ver `expresion-visual.md`.
12. **Composiciones** — Las 1–2 vistas de ejemplo armadas con el sistema; al menos una mostrada también en su versión mobile enmarcada.
13. **Voz de interfaz** *(si se pidieron guidelines)* — Tono de microcopy, ejemplos de mensajes de error/vacío/éxito escritos en la voz de la marca, en español del mercado del cliente.
14. **Para desarrollo** — Cómo usar `tokens.json`/`tokens.css`, convención de nombres, y qué hacer cuando falta un token (agregarlo al sistema, no hardcodear).

Entre bloques temáticos largos, intercalá los banners de contraste del propio sistema (CTA banner, stat band): la guía practica el ritmo visual que predica. Las secciones de la guía entran con el reveal-al-scroll del sistema.

## Notas de construcción

- Archivo largo (1500–3000+ líneas): construilo por secciones en varias pasadas de escritura/edición. Escribí primero el esqueleto (chrome + secciones vacías + tokens en `<style>`), después llená sección por sección.
- El JS es vainilla y mínimo: toggle de tema, copiado al portapapeles, scroll-spy, tabs/accordions. Nada de frameworks.
- Sin `localStorage`/`sessionStorage` (no disponible en algunos entornos de preview): el estado del tema vive en una variable.
- Probá mentalmente el archivo antes de entregar: ¿cada `id` de sección existe para su link del sidebar? ¿el toggle cubre los ejemplos incrustados? ¿los `<pre>` escapan el HTML de los snippets (`&lt;`)?
