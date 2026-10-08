# 05 · Design system

Carpeta `design-system/`: `styleguide.html` (autocontenido, abrir en el navegador), `README.md` y logos extraídos del manual a 400 dpi.

## Orientación

**Institucional / cuadrada + toque premium.** Gester es broker de capitales: el decisor compra confianza. Grillas rígidas, simetría, navy dominante, movimiento sutil. Lo premium sale del tracking tipográfico, el aire entre secciones y el gradiente usado con avaricia.

## Tokens

| Token | Valor | Uso |
|---|---|---|
| `--navy` | `#0F206C` (Pantone 2756 C) | Fondos institucionales, títulos |
| `--grad-a → --grad-b` | `#186B99 → #22A5AB` | Gradiente del isotipo: **solo CTAs y números de inversión**. Nunca de fondo ni en texto de lectura |
| `--ink` | `#3D3935` (Pantone Black 7C) | Texto |
| `--bone` | `#F7F7F5` | Fondo de página |
| Disponible | `#1B8489` | Estado de unidad |
| Reservada | `#B97909` | Estado de unidad |
| Vendida | `#8B8885` | Estado de unidad, opacidad 55%, sin hover |
| Tipografía | Inter 300–800 | Única familia. Display ExtraBold con tracking −3%; etiquetas 700 en mayúsculas espaciadas |
| Espaciado / radio | base 8 px / 6 px | Grilla rígida |

## Decisiones

1. **El estado actual no se esconde, se enmarca**: badge "Estado actual", velo navy y al lado el bloque "Proyecto". Narrativa hoy vs. proyecto.
2. **Gradiente = acción, navy = institución.**
3. **Estados de unidad como sistema**: la proporción de reservadas y vendidas en la grilla cuenta sola que la preventa avanza.
4. **Lead calificado**: el formulario siempre lleva la unidad precargada ("Tu selección · 3°B"); el CTA es "Consultar por esta unidad".

## La aplicación interna

`demo/css/app.css` aplica el DS a un producto (no a una landing): barra lateral clara con logo color, buscador global con `/`, avisos, menú de cuenta, modales propios (nunca `prompt`/`alert`), barra de cambios sin guardar. Se rediseñó el 23/9 porque "estaba muy demo": el sistema real tiene que sentirse producto.

## Prohibiciones del manual

Colores sin alterar, tipografía corporativa, área de protección del isologotipo, sin inclinar ni deformar el logo.
