# Sitio web y landings — experiencia de conversión

Fuente de verdad de UX y textos del sitio: el prototipo lo-fi en `Chimpa/web/2-prototipo-ux/`. Botón "◇ Notas UX" en cada página; se ve con el server `prototipo-ux`, puerto 8005. Rutas en `Chimpa/web/1-estrategia/sitemap.md`. Plantilla de casos en `Chimpa/web/4-casos/_plantilla-caso.md`.

## Contenido
1. Quién llega y qué necesita
2. Orgánicas vs. landings de Ads
3. Arco de la Home
4. Landing sin fugas
5. Formulario de contacto
6. Página de gracias
7. Mobile dedicado
8. Movimiento y peso
9. Otras páginas

---

## 1. Quién llega y qué necesita

- **Founder/CTO que ya se quemó con otra agencia:** evalúa seriedad y criterio. Teme equipos que rotan, proyectos que se descontrolan y no ser dueño del código.
- **CEO/CMO de PYME:** quiere resultados, no tecnología. Le importa que lo atiendan personas.
- **Campañas políticas:** otro público. Va en su propia sección, fuera del bloque de soluciones, y solo en español.

Insight de fondo: "me trataron como un número". La experiencia tiene que transmitir **que del otro lado hay un equipo que responde**. El texto nunca usa "ticket" (ver reglas de tono en SKILL.md).

## 2. Orgánicas vs. landings de Ads

| | Orgánica (Home, internas, casos) | Landing de Ads |
|---|---|---|
| Objetivo | Rankear + convertir | Convertir, y nada más |
| Navegación | Header con menú, footer, migas, links internos | **Sin menú ni footer de navegación**; el logo no saca de la página |
| Indexación | Sí | `noindex` |
| CTA | A `/contacto` | Formulario en el hero y al cierre |
| Casos | Con link al caso | Sin link (convencen ahí mismo) |

## 3. Arco de la Home

1. **Hero:** comunica el resultado (transformación digital, de punta a punta). **Un solo CTA principal** ("Hablemos") y una salida para quien necesita prueba ("Ver casos").
2. **Dolores:** conectar con lo que le pasa al comprador antes de hablar de lo que hacemos. Cada dolor se une con la solución que lo resuelve.
3. **Soluciones que lideran con el resultado:** la unidad de negocio queda como etiqueta. Software Factory primero.
4. **Logos temprano:** prueba social apenas mostramos lo que resolvemos.
5. **Demostración** (scrollytelling del producto) → quiénes somos en pocas líneas → casos con **la métrica grande** → números → testimonio con gente real.
6. **FAQ que baja objeciones** justo antes del cierre, así nadie sale a buscar respuestas afuera.
7. **CTA final al mismo destino** que el del header. No dispersar la conversión en varios destinos.

## 4. Landing sin fugas

**Una fuga es cualquier link que saca a alguien de la decisión.** En una landing de Ads, el único camino posible es el formulario.

- **Formulario en el hero:** se puede convertir sin scrollear. Viene contextualizado a la unidad (ya dice "Software Factory").
- **Dolores → capacidades por su beneficio:** tarjetas informativas, no links.
- **Proceso que baja el riesgo percibido:** "Plan, tiempos y demos frecuentes" responde el miedo a que el proyecto se descontrole.
- **Casos como prueba**, sin "Ver caso →".
- **CTA intermedio en el momento caliente** (después de la prueba), al mismo formulario. Repetir el CTA hacia el mismo lugar **no** es fuga.
- **Segundo formulario al cierre, más corto:** quien llegó hasta abajo no tiene que volver a scrollear.
- **Test A/B:** versión A completa, versión B comprimida.

## 5. Formulario de contacto

- **Pocos campos.** Teléfono opcional (y dicho: "opcional").
- **"¿Qué te interesa?"** deriva el contacto a la unidad correcta y se autocompleta si el formulario vive en la landing de esa unidad.
- **Texto que baja la fricción:** respuesta en menos de 24 h como compromiso explícito, "Un humano del equipo te escribe…".
- **Señales de confianza al lado del botón:** "Datos protegidos · Sin compromiso".
- **Canal alternativo** (mail, WhatsApp) para quien no quiere completar un formulario.
- **Estados:**
  - error en línea, al lado del campo, diciendo qué hacer
  - enviando, con el botón en "Enviando…" y sin doble envío
  - éxito → `/gracias`
  - sin conexión → lo escrito no se pierde
- Nunca un formulario que se borra si falla el envío.

### Checklist a prueba de boludos para formularios web

Salió de la primera prueba del skill sobre `contacto.html` (12/09/2026).

**Campos**
- **Máximo 3 obligatorios** (qué le interesa, nombre y un medio de contacto). Todo lo demás, opcional y dicho.
- **Marcá lo opcional, no lo obligatorio.** Así nadie tiene que leer "los campos con * son obligatorios".
- **"Empresa" nunca obligatoria:** hay candidatos, emprendedores y freelancers.
- **"Mensaje" opcional,** con una pregunta que ayude ("¿Querés contarnos algo más?"). La hoja en blanco frena.
- **"¿En qué te podemos ayudar?"** con opciones a la vista (chips o radios), no un desplegable. Opciones en lenguaje del visitante ("Una web, plataforma o app", "Todavía no lo sé"), no con los nombres de nuestras unidades. **Viene elegida según la página de origen.**
- **Cada campo marcado para el celular** (`autocomplete` de nombre, mail, organización y teléfono; `inputmode`), para que se autocomplete y abra el teclado correcto. Teléfono con "+54 9" ya puesto.
- **Letra de 16 px en todos los campos** (si no, el iPhone hace zoom) y **44 px o más** en todo lo que se toca.

**Validación**
- **Al salir del campo, al lado y en voz humana:** "Falta tu mail para poder responderte".
- **Espacios solos cuentan como vacío.**
- **El mail se valida en serio** (algo@dominio.algo) y se sugiere la corrección de los errores típicos: "¿Quisiste decir juan@gmail.com?" ante gmial, hotmial, .con.
- **Al enviar con errores, la pantalla salta al primer campo con error.** El aviso nunca queda fuera de la pantalla en el celular.

**Envío**
- **Botón "Enviando consulta…" bloqueado mientras envía:** sin doble envío.
- **Borrador en el navegador mientras escribe;** se borra recién cuando el envío salió bien.
- **Si falla:** "No se pudo enviar. Lo que escribiste sigue acá; probá de nuevo o escribinos por WhatsApp".
- **Anti-spam que no descarte leads reales.** El campo trampa oculto no puede llamarse `website`, `email2` ni nada que el navegador autocomplete. Si reCAPTCHA falla, no se muestra "gracias" como si hubiera salido.

**Gracias y conversión**
- **Gracias solo después de un envío real.** Si alguien entra directo, recarga o vuelve atrás, lo lleva a /contacto.
- **La conversión de Ads se cuenta una vez por envío,** no por visita a /gracias. Si se cuenta por visita, las recargas ensucian la optimización de la campaña.
- **Gracias muestra el mail al que vamos a escribir, con "¿Está mal? Corregir"** (vuelve al formulario completo). Así se detecta el lead perdido por un mail mal tipeado.
- **Canal alternativo que se pueda tocar:** mail que abre la app de correo y WhatsApp con el mensaje escrito, en Contacto y en Gracias.
- **El mismo texto de botón en todos los formularios del sitio.** En /contacto se oculta el "Hablemos" del header (llevaría a la misma página).

## 6. Página de gracias

- **Nunca un callejón sin salida:** siempre 2-3 próximos pasos (casos, blog, redes).
- **El mensaje se adapta al origen:** si vino del contacto, "te escribimos en menos de 24 h"; si vino de una descarga, "te enviamos el PDF a tu mail".
- **Dice qué va a pasar y cuándo.** La ansiedad de "¿llegó?" se resuelve con una promesa concreta.

## 7. Mobile dedicado, no achicado

El celular no es un escritorio chico: se **edita** el contenido, no solo se reacomoda.

- **Hero:** título corto + 1 línea + CTA arriba de todo. Se entiende en 3 segundos.
- **Prueba social** en scroll horizontal, que no ocupa alto (lo escaso en el celular).
- **Soluciones apiladas** con solo título + "Conocé más"; se saca la descripción larga.
- **Scrollytelling pesado → bloque estático de 3 líneas:** misma idea, cero peso. También es el reemplazo para quien tiene el movimiento reducido.
- **Menos contenido:** de 3 casos a 2 (los más fuertes) + "ver todos"; números en grilla 2×2; FAQ en acordeón, de 5 preguntas a las 4 decisivas.
- **Barra de pestañas abajo, estilo app:** Inicio · Servicios · Casos · Menú, con "Hablemos" elevado en el centro. Arriba, solo el logo.

## 8. Movimiento y peso

- **Con movimiento reducido activado, todo queda quieto** y el contenido se lee igual (bloques apilados).
- **Lo pesado (3D) se carga después** y nunca frena la primera carga; si no carga, hay una imagen de reemplazo.
- **Las animaciones de entrada ocurren una sola vez;** nada rebota.
- **La pantalla de un mockup muestra siempre interfaz real.**

## 9. Otras páginas

- **Nosotros:** primero seriedad y después alma. La voz más juguetona tiene lugar acá. Si no hay fotos reales, la sección se corta: nunca fotos de stock.
- **Casos** (`/casos/[slug]`): 8 bloques, cada uno = 1 título + 1 línea + imagen. La métrica de resultado bien visible.
- **Header:** transparente arriba y sólido al scrollear. En el celular, panel a pantalla completa con CTA fijo abajo.
- **Idioma:** Marketing Político solo en español; si alguien llega desde /en/, se le avisa de la redirección antes de mandarlo.
