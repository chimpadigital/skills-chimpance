# Arquitectura de tokens

Dos capas, siempre:

1. **Primitivos**: la paleta cruda del sistema. Rampas de color, escala de tamaños, familia tipográfica. No saben nada de uso. Nombres descriptivos: `green-700`, `space-4`, `font-display`.
2. **Semánticos**: el significado. Apuntan a primitivos y son lo que usan los componentes: `color-bg-surface`, `color-text-primary`, `color-action-primary`. El modo oscuro se implementa **solo** en esta capa: los semánticos re-mapean a otros primitivos, los primitivos no cambian.

Los componentes consumen únicamente tokens semánticos. Si durante el diseño de un componente aparece la necesidad de un valor nuevo, se crea el token semántico correspondiente — nunca se hardcodea.

## Color

### Rampas primitivas

Cada color del sistema (marca, acento, neutros, funcionales) se expande en una rampa de 10–11 pasos (`50, 100, 200 ... 900, 950`). Reglas para que las rampas sean de calidad profesional:

- **No generes rampas por interpolación lineal de lightness.** Ajustá el matiz a lo largo de la rampa (los amarillos rotan hacia naranja al oscurecer, los azules hacia violeta) y comprimí la saturación en los extremos para que el 50 no sea lavado y el 950 no sea barro.
- El color de marca original debe caer **exactamente** en uno de los pasos de su rampa (típicamente 500 o 600). El cliente tiene que encontrar *su* color en el sistema.
- Los neutros se tintan hacia la temperatura del concepto (2–6% de saturación del matiz de marca suele alcanzar).
- Funcionales: `success`, `warning`, `danger`, `info` — con rampas también (mínimo 100/500/700/900), armonizadas con la paleta.

### Semánticos mínimos

```
Fondos:    bg-page, bg-surface, bg-surface-raised, bg-inset, bg-inverse
Texto:     text-primary, text-secondary, text-muted, text-inverse, text-on-action, text-link
Bordes:    border-default, border-strong, border-focus
Acción:    action-primary, action-primary-hover, action-primary-active,
           action-secondary (+hover/active), action-disabled
Estado:    (bg|text|border)-(success|warning|danger|info)
```

Extendé según alcance (ej. `bg-chart-1..6` para dashboards, `bg-sale`/`text-price` para e-commerce).

## Tipografía

- Primitivos: familias (`font-display`, `font-body`, `font-mono` si aplica), pesos disponibles.
- Escala modular con nombre de rol, no de tamaño: `text-display-xl`, `text-heading-1..4`, `text-body-lg`, `text-body`, `text-body-sm`, `text-caption`, `text-overline`. Cada rol define tamaño + line-height + peso + letter-spacing + familia.
- Usá `clamp()` para los roles display/heading (fluidez entre mobile y desktop): `font-size: clamp(2rem, 1.2rem + 3vw, 3.5rem)`. Los roles de cuerpo quedan fijos o casi fijos.
- Base de cuerpo: nunca menos de 16px para texto de lectura; 14px aceptable solo en UI densa (dashboards).

## Espaciado, forma y elevación

- **Espaciado**: escala base 4px: `space-1 (4) ... space-24 (96)`. La escala es geométrica-ish en los extremos (4, 8, 12, 16, 24, 32, 48, 64, 96), no lineal pura.
- **Radios**: 3–4 valores coherentes con el concepto: `radius-sm/md/lg/full`. La relación entre ellos importa (un sistema de esquinas rectas usa 0/2/4; uno redondeado 8/12/20).
- **Sombras/elevación**: 3–5 niveles (`elevation-0..4`). En modo oscuro las sombras pierden eficacia: compensá con bordes sutiles o superficies más claras por nivel.
- **Movimiento**: duraciones (`duration-fast: 120ms`, `duration-base: 200ms`, `duration-slow: 320ms`) y easings con carácter (`ease-out` seco vs `cubic-bezier` elástico, según concepto). Incluí `prefers-reduced-motion` en el CSS.

## Formato de archivos

### tokens.json

Estructura por capas, con `$value` y `$type` (inspirado en el estándar W3C Design Tokens):

```json
{
  "primitive": {
    "color": { "green": { "500": { "$value": "#1B7A4A", "$type": "color" } } },
    "space": { "4": { "$value": "16px", "$type": "dimension" } }
  },
  "semantic": {
    "light": { "color-bg-page": { "$value": "{primitive.color.warmgray.50}", "$type": "color" } },
    "dark":  { "color-bg-page": { "$value": "{primitive.color.warmgray.950}", "$type": "color" } }
  },
  "_contrast_pairs": [
    { "fg": "semantic.light.color-text-primary", "bg": "semantic.light.color-bg-page", "level": "AA-normal" },
    { "fg": "semantic.light.color-text-on-action", "bg": "semantic.light.color-action-primary", "level": "AA-normal" },
    { "fg": "semantic.dark.color-text-primary", "bg": "semantic.dark.color-bg-page", "level": "AA-normal" }
  ]
}
```

El bloque `_contrast_pairs` declara todo par texto/fondo que el sistema promete: texto sobre página, sobre superficie, sobre acción primaria y secundaria, texto de estados sobre sus fondos, links sobre página — en ambos temas. `level` es `AA-normal` (4.5:1), `AA-large` (3:1) o `AA-ui` (3:1, para bordes de inputs e iconos informativos). Sé exhaustivo acá: cada par declarado es un par que el script verifica.

### tokens.css

```css
:root {
  /* Primitivos */
  --green-500: #1B7A4A;
  /* Semánticos (tema claro) */
  --color-bg-page: var(--warmgray-50);
}
[data-theme="dark"] {
  --color-bg-page: var(--warmgray-950);
}
```

Semánticos como `var()` de primitivos — así el archivo documenta el mapeo. Incluí un comentario de cabecera con nombre del sistema, versión y fecha.
