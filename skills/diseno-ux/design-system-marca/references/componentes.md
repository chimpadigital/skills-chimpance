# Inventario y especificación de componentes

## Cómo especificar un componente

Cada componente de la style guide incluye:

1. **Render en vivo** de todas las variantes y estados (no capturas, no descripciones: HTML/CSS real).
2. **Estados**: default, hover, focus-visible, active, disabled — y loading, error, empty donde el componente los tenga. El estado de foco se diseña (anillo con `border-focus`, offset consistente), nunca se deja el default del navegador ni se elimina.
3. **Anatomía y uso**: una línea sobre cuándo usarlo y cuándo no (ej.: "Botón primario: una sola vez por vista").
4. **Código copiable**: el snippet HTML+clases del componente, en un `<pre>` con botón de copiar.
5. **Accesibilidad aplicada**: target táctil ≥44px en interactivos mobile, contraste verificado, atributos ARIA donde el patrón lo exige (no decorativos).

Todos los valores salen de tokens semánticos. Un componente con un `#hex` o un `13px` suelto es un bug del sistema.

## Inventario por alcance

El inventario se arma según el ecosistema acordado. **Núcleo** siempre; los demás bloques según alcance.

### Núcleo (siempre)

- **Acciones**: Button (primary, secondary, ghost/tertiary, danger; tamaños sm/md/lg; loading), Link, Icon button. Todo botón y CTA lleva icono + texto por defecto (ver `expresion-visual.md`); la variante sin icono es la excepción, no la regla.
- **Formularios**: Text input, Textarea, Select, Checkbox, Radio, Switch, Field (label + input + helper + error como unidad)
- **Contención**: Card (variantes según elevación/borde), Divider, Section/Container con anchos máximos
- **Feedback**: Alert/Banner (4 estados funcionales), Toast, Badge/Tag, Skeleton loader, Empty state, Spinner/Progress
- **Overlay**: Modal, Tooltip, Dropdown/Menu
- **Navegación base**: Navbar/Header, Footer, Breadcrumbs, Tabs (con indicador deslizante), Pagination — items de menú con icono
- **Ritmo**: CTA banner, announcement bar, stat band — bloques full-width de fondo contrastante que rompen la lectura (especificados en `expresion-visual.md`); en e-commerce se suma el banner promocional

### Web marketing / institucional

- Hero (título display + CTA — acá la tipografía display muestra los dientes)
- Feature grid / cards de beneficios, bloque de testimonios, pricing table, FAQ (accordion), CTA section, formulario de contacto/lead

### Mobile app

- Bottom navigation / tab bar (targets ≥44px, safe areas), App bar, List item (base de toda app: con avatar/icono, con chevron, swipeable si aplica), Bottom sheet, FAB si el concepto lo tolera, Pull-to-refresh y estados offline
- Documentá los breakpoints del sistema (`sm/md/lg/xl` con valores) y qué cambia en cada uno (tipografía fluida, navegación que colapsa, densidad)

### Dashboard / producto interno

- Sidebar de navegación (colapsable), Table (densa: hover de fila, sort, selección, paginación), KPI/stat card, filtros y search, Chart tokens (paleta `chart-1..6` distinguible para daltonismo, tooltips, grillas sutiles), Date picker (al menos especificado), Tag/status pills
- Tipografía: números tabulares (`font-variant-numeric: tabular-nums`) en toda celda numérica

### E-commerce

- Product card (imagen, precio, precio tachado, badge de oferta/envío), galería de producto, selector de variantes (talle/color), Add to cart + stepper de cantidad, mini-cart/drawer, checkout steps, rating stars, trust badges

### Email

Los emails viven en clientes de correo hostiles: nada de flexbox/grid confiable, CSS inline, tipografías con fallback a system stack. No renderices los emails en la guía como los demás componentes; documentá en su lugar la **traducción del sistema a email**: qué colores hex usar, qué stack tipográfico de fallback (`font-display` → Georgia/system serif, etc.), botones como tabla con padding, ancho máximo 600px, y un mini-template de ejemplo (header, cuerpo, CTA, footer) en HTML de email real.

## Jerarquía y composición

Cerrá la sección de componentes de la guía con 1–2 **composiciones de ejemplo**: una vista real armada solo con los componentes del sistema (ej.: una landing hero + features, o una pantalla de dashboard). Es la prueba de fuego de coherencia sistémica y lo primero que el cliente va a entender emocionalmente. Elegí la composición según el rubro del cliente.
