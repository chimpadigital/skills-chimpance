# Dirección creativa

Esta es la etapa que separa un design system memorable de una plantilla. El objetivo es llegar a un **concepto creativo**: una idea central, con nombre, que gobierna todas las decisiones visuales del sistema.

## El método: de personalidad a decisiones

### 1. Mapear la personalidad de la marca

Ubicá la marca en estos ejes (no hace falta documentar los ejes en el entregable; son herramienta de pensamiento):

- Formal ↔ Cercana
- Clásica ↔ Vanguardista
- Sobria ↔ Expresiva
- Técnica ↔ Humana
- Económica ↔ Premium
- Seria ↔ Juguetona

Con marca existente, la posición sale del material que ya hay (¿cómo habla? ¿cómo es su logo? ¿a quién le vende?). Desde cero, sale del mini brief (`brief.md`): rubro, target, competencia, aspiración, y los 3 adjetivos negativos ("que NO parezca...") que suelen ser la pista más útil.

### 2. Encontrar la tensión interesante

Las direcciones memorables casi siempre viven en una tensión: *técnica pero cálida*, *premium pero accesible*, *seria pero con un guiño*. Una marca que es solo "moderna y limpia" no tiene concepto — tiene ausencia de concepto. Buscá el par de cualidades que conviven en la marca y hacé que el sistema exprese esa convivencia.

### 3. Nombrar el concepto

Dale un nombre corto y evocador al concepto, en español: "Precisión con pulso", "Lujo silencioso", "Energía de barrio". El nombre obliga a que la dirección sea una idea y no una lista de adjetivos, y le da al cliente algo que recordar y repetir.

### 4. Traducir el concepto a decisiones

Cada dimensión del sistema debe poder justificarse desde el concepto:

| Dimensión | Pregunta que responde el concepto |
|---|---|
| Tipografía | ¿Qué voz tiene la marca en pantalla? ¿Una sola familia versátil o un dúo display/texto con contraste? |
| Color | ¿Qué temperatura y saturación? ¿El color de marca es protagonista o acento quirúrgico? |
| Forma | ¿Esquinas rectas, sutiles o generosas? ¿Bordes o sombras o color plano para delimitar? |
| Espacio | ¿Denso y eficiente o aireado y editorial? |
| Movimiento | ¿Transiciones rápidas y secas o suaves y elásticas? |
| Imagen/ilustración | ¿Fotografía, ilustración, iconografía pura? ¿Qué tratamiento? |

Si una decisión no se puede justificar desde el concepto, o el concepto es débil o la decisión es arbitraria. Revisá una de las dos.

## Decisiones tipográficas

La tipografía es la decisión de mayor impacto en la distintividad. Guías:

- **Preferí un dúo con contraste** (display + texto) salvo que el concepto pida monotonía deliberada. El contraste puede ser serif/sans, geométrica/humanista, ancha/condensada.
- **Evitá los defaults por inercia**: Inter, Roboto y Open Sans son excelentes tipografías que aparecen en todo; elegilas solo si el concepto las justifica activamente. Google Fonts tiene cientos de familias de calidad profesional menos gastadas (ej.: Fraunces, Space Grotesk, Sora, Instrument Serif, Bricolage Grotesque, IBM Plex, Manrope, Newsreader, Archivo, Spectral...). Esta lista es punto de partida, no catálogo cerrado.
- **Con marca existente**, si la tipografía corporativa no está en Google Fonts, buscá el equivalente más cercano y documentá la sustitución ("Impreso: GT America / Digital: Archivo").
- La tipografía de UI (botones, labels, inputs) puede ser distinta de la de texto largo. Los números tabulares importan en dashboards y e-commerce.

## Decisiones de color

- **Partí del color de marca** cuando existe, y construí el sistema alrededor: qué lo acompaña, qué lo hace respirar, sobre qué fondos vive.
- **Definí el rol del color**: hay sistemas donde el color de marca pinta superficies enteras (expresivo) y sistemas donde aparece solo en acciones y acentos (quirúrgico). Elegí un rol y sé consistente.
- **Los neutros también son marca.** Un gris cálido, un gris azulado o un blanco roto cambian la temperatura de todo el sistema. Nunca uses gris puro `#808080`-style por defecto; tintá los neutros hacia la temperatura del concepto.
- Los colores funcionales (éxito, error, advertencia, información) deben armonizar con la paleta — ajustá su tono y saturación para que parezcan de la familia, no pegados de una librería.

## Proponer direcciones (proyectos desde cero)

Cuando hay interlocutor, presentá 2–3 direcciones antes de construir el sistema completo. Cada dirección se presenta con: nombre del concepto, párrafo de justificación, paleta tentativa (4–6 colores), dúo tipográfico, y una frase sobre forma y espacio. Suficiente para decidir, sin construir tres sistemas enteros.

Cuando no hay interlocutor (tarea desatendida), elegí la dirección más fiel al brief, construí el sistema completo sobre ella, y documentá al inicio de la style guide qué otras direcciones se consideraron y por qué se eligió esta.

## Ejemplo condensado

Brief: fintech argentina para pymes, quiere transmitir solidez sin la frialdad de un banco.

- **Tensión**: institucional pero de trato directo.
- **Concepto**: "Banco de camisa arremangada".
- **Traducción**: serif de peso generoso para display (solidez con carácter) + sans humanista para UI (trato directo); verde oscuro institucional como base con un amarillo cálido de acento (energía, no corporativismo azul); esquinas apenas redondeadas (2–4px: seriedad sin rigidez); espaciado generoso en marketing, denso y eficiente en el dashboard; movimiento rápido y sin rebotes (un banco no hace piruetas).

Notá cómo cada decisión se defiende sola citando el concepto. Ese es el estándar.
