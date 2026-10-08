# 04 · Web, landings, voz y decisiones del cliente

## Contenido
1. Design system "Ingeniería a cielo abierto"
2. Home (one page)
3. Landing de riego por aspersión
4. Flyer y landing RIMI (beneficio impositivo)
5. Construcción en Replit
6. Voz de MT AGRO
7. Registro de decisiones del cliente
8. Frases a corregir en los wireframes

---

## 1. Design system "Ingeniería a cielo abierto" (v1.2, 31/8/2026)

**Archivos**: `styleguide.html` (guía interactiva autocontenida, 2,8 MB con fotos y logos embebidos), `tokens.json`, `tokens.css`. Publicada también como artifact: https://claude.ai/code/artifact/0600b655-2737-4682-9076-c5339ff5e23e

**Concepto**: MT AGRO vende ingeniería de precisión (pivotes que riegan círculos exactos, caudales calculados) a gente de campo, cara a cara, al lado de la Ruta 9. El sistema une las dos cosas: orden, datos y precisión técnica con el verde del cultivo regado, el azul del agua y una voz directa. Motivo gráfico: **el círculo del pivote visto desde arriba**.

**Decisiones clave**
- **Color**: verde `green` (600 = #208D32, el del logo; 700 = #1A7229 para botones y acción, que es WhatsApp). Azul petróleo `petrol` (600 = #1D698B, el del logo; 700 para links; 950 = #0A2432 para fondos inversos). Neutros "gris pampa" tintados al petróleo. Acento `sol` #E8A53B (destacados y advertencias, nunca acción). Rojo tierra para errores. **39/39 pares de contraste AA verificados** con `design-system-marca/scripts/check_contrast.py`; texto principal en AAA (16:1).
- **Tipografía**: Archivo expandida para títulos (señalética industrial), IBM Plex Sans para el cuerpo con base de **17px** (público de 35 a 65 años que lee al sol), IBM Plex Mono con números tabulares para datos técnicos (hectáreas, m³/h, kW).
- **Forma**: radios chicos (2, 4, 8 y 12 px); redondeo total solo en pastillas y switches.
- **Movimiento**: seco, sin rebotes (120, 200 y 320 ms).
- **Modo oscuro** llamado "modo cabina".
- **Iconos**: 34 propios, outline de 1,75 px, incluidos los del rubro (pivote, gota, bomba, panel solar, tractor, brote, llave, manómetro). Toda acción lleva icono y texto.
- **Tramas**: `trama-pivote` (arcos concéntricos) y `trama-aspersion` (gotas).
- **Bloques de venta** (v1.2): franja de marcas representadas, sello promocional + lista de beneficios, testimonio, FAQ en acordeón, galería. Composiciones de ejemplo: home y landing RIMI.
- **Reglas de marca**: logo en versión plana en digital (los brillos quedan para lo impreso); logos de marcas representadas en sus colores originales sobre fondo claro; fotos con tratamiento real (equipos instalados, service en el campo), nada de stock genérico de trigo al atardecer.

Para cualquier cambio visual, trabajar sobre este sistema con el skill `design-system-marca` y volver a correr el control de contraste.

## 2. Home (one page) — `wireframe-home.html`

Wireframe en baja (grises, foco en estructura y copy), aprobado con los cambios del cliente del 2/9/2026. Menú con las cinco líneas como anclas; WhatsApp fijo en el encabezado y flotante en el celular.

| Bloque | Contenido y copy clave |
|---|---|
| 00 · Barra de anuncio | "¿Ganancias este año? Invertí en riego y deducí el 100%. Conocé el beneficio →" (lleva a la landing RIMI; se apaga si la promo vence) |
| 01 · Encabezado | Logo, anclas: Aspersión · Goteo · Bombas solares · Pasturas · Servicio técnico, botón de WhatsApp |
| 02 · Hero | Antetítulo "Ruta 9 km 757 · Sinsacate · Córdoba". Título: **"El agua justa, en el lote justo"**. Cifras 15+ años, 200+ equipos y 24 h de respuesta (**las dos últimas son relleno a validar**) |
| 03 · Marcas | "Representantes oficiales": Reinke, Toro, Lorentz |
| 04 · Somos MT AGRO | **Sección corta pedida por el cliente, con el logo grande**: "Hace más de 15 años que hacemos riego en el centro-norte de Córdoba…" |
| 05 · Puente | Título del cliente: **"La rentabilidad de tu campo no puede depender del pronóstico"** |
| 06 · Servicios | Título del cliente: **"Nuestros servicios"**. Cinco tarjetas, cada una con su botón de WhatsApp y mensaje precargado por línea |
| 07 · Banner RIMI | "Si tenés que pagar Ganancias este año, mejor que quede en tu campo" → landing RIMI |
| 08 · Cómo trabajamos | "Así de simple": contanos tu lote → visita técnica → propuesta con números |
| 09 · Por qué MT AGRO | Diferenciales, testimonio y fotos de service |
| 10 · FAQ | Instalación, financiación, zona, service de otras marcas (**tres respuestas a validar**) |
| 11 · Cierre | "Contanos de tu lote y te armamos la propuesta" + WhatsApp + teléfono. Sin formulario en la home |
| 12 · Pie | Datos de contacto como links y mapa |

## 3. Landing de riego por aspersión — `wireframe-landing-aspersion.html` (v4, 7/9/2026)

**Objetivo**: generar consultas. **Requisitos del cliente**: sin puntos de fuga, con formulario y WhatsApp. El archivo tiene **cero links**.

| Bloque | Contenido y copy clave |
|---|---|
| 00 · Encabezado mínimo | Logo sin link, teléfono y WhatsApp; sin menú |
| 01 · Hero con formulario corto | Antetítulo "Pivotes Reinke · Representante oficial en Córdoba". **Título pendiente** (ver abajo). Lista: 1 a 30 torres; ingeniería, instalación y service; garantía de 10 años o 16.000 h en cajas de rueda; financiación. Formulario de 3 campos: nombre, WhatsApp, hectáreas |
| 02 · Números | 1 a 300 ha · hasta 30 torres · 10 años o 16.000 h de garantía en cajas de rueda · 15+ años |
| 03 · Equipos | "Hay un equipo para la forma de tu lote": pivote central, avance frontal, remolcable, esquinas. Sus botones llevan al formulario final con el equipo preseleccionado |
| 04 · Tecnología | "El equipo trabaja en el lote. Vos lo manejás desde donde estés." Panel RPM, ReinCloud, Navigator |
| 05 · Servicio completo | "Del relevamiento a la puesta en marcha, sin que te muevas del campo": ingeniería, instalación, repuestos y mantenimiento, financiación |
| 06 · Confianza | Una cita de Franco Rizzi con el video chico al costado (ver `01`) y sellos: Reinke oficial, base en Ruta 9, repuestos en la zona |
| 07 · FAQ | "Preguntas antes de invertir": lote chico, qué necesito, plazos, financiación, roturas (plazos y financiación a validar) |
| 08 · Formulario final | "Contanos tu lote y recibí tu cotización". Campos: nombre, WhatsApp, localidad, hectáreas en rangos, equipo de interés (incluye "No sé, asesorenme"), comentario opcional. Gracias en la misma página |
| 09 · Pie mínimo | Una línea con identidad y contacto |

### Título principal pendiente
- **Rechazado por el cliente**: "Regá de 1 a 300 hectáreas con un pivote que se maneja desde el celular" (sigue escrito en el archivo; hay que reemplazarlo).
- **Dirección del cliente**: "riego inteligente a medida para campos, o algo así".
- **Opciones presentadas el 9/9/2026**:
  - A. "Riego inteligente, a la medida de tu campo" (la más fiel al pedido)
  - B. "Cada campo es distinto. Tu equipo de riego también." (la recomendada)
  - C. "Riego a medida para campos de 1 a 300 hectáreas"
  - D. "Riego inteligente que se adapta a la forma de tu campo"
  - E. "El riego no se compra: se diseña"
  - F. "Riego inteligente a medida, de 1 a 300 hectáreas"
- **Criterio**: "inteligente" solo es genérico; el diferencial real es "a medida" (relevamiento, pluviometría y cálculo hidráulico propios). Si el título no lleva "1 a 300 hectáreas", ese dato sube a la bajada, porque es lo que retiene al productor de pocas hectáreas. Bajada propuesta para B: *"Diseñamos, instalamos y damos service a equipos Reinke de 1 a 300 hectáreas, según la forma, el suelo y el agua de tu lote."*
- **Ojo con E**: es un contraste del tipo "X, no Y", que la regla de Chimpancé evita en piezas públicas. Si el cliente la elige, avisarlo.

## 4. Flyer y landing RIMI (beneficio impositivo)

**Flyer del cliente (formato Instagram)**: "Si tenés que pagar Ganancias este año, no pagues: invertí en riego". Sello: "RIMI · Rígimen de Incentivo para Grandes Inversiones · Beneficios que impulsan tu campo". Texto: "Con el RIMI amortizás el 100% de tu inversión en riego en 1 cuota y la deducis totalmente de Ganancias". Cierre: "Tu inversión en riego, 100% deducible en Ganancias este año". Logos MT AGRO y Reinke, web mtagro.com.ar.

**Problemas del flyer**
- **Nombre del régimen inconsistente**: la sigla RIMI corresponde a "Régimen de Incentivo para **Medianas** Inversiones", mientras que "Grandes Inversiones" es el RIGI, pensado para proyectos de gran escala y que no aplica a un productor que compra un pivote. **Corrección**: en esta sesión se había sugerido que el nombre correcto podía ser RIGI; lo más probable es lo contrario, que la sigla RIMI esté bien y el nombre largo esté mal. **El nombre exacto, la vigencia, los requisitos y el alcance los confirma un contador** antes de publicar nada.
- **Errores de tipeo**: "Rígimen" → "Régimen"; "deducis" → "deducís".

**Landing RIMI**: sin wireframe propio. Hay una composición de referencia en el design system (hero con sello, lista de beneficios, co-branding MT AGRO × Reinke, FAQ y formulario corto). Todo claim cierra con "Beneficio sujeto a condiciones del régimen. Validalo con tu contador."

## 5. Construcción en Replit

- Santiago construye en **Replit**. Stack pedido: HTML, CSS y JavaScript sin frameworks, sitio estático.
- **Prompt de contexto**: `prompt-replit-contexto.md`. Presenta el proyecto, explica los archivos a subir (styleguide y wireframe) y fija ocho reglas: tokens obligatorios, copy intocable, mobile-first, icono + texto, WhatsApp con mensaje precargado por línea, lo marcado "a validar" no se publica, contacto siempre como link, stack estático. Termina pidiendo un resumen y **que no construya hasta recibir la orden**.
- **Recomendación**: pedirle la construcción **bloque por bloque**, siguiendo la numeración del wireframe, para corregir temprano.
- Para la landing de aspersión todavía no hay prompt: se arma igual, sumando la regla de cero salidas y el formulario con pantalla de gracias en la misma página.

## 6. Voz de MT AGRO

Habla como su mejor vendedor técnico: de vos, con datos, sin humo.

- **Voseo siempre**: contanos, elegí, revisá, cotizá.
- **Datos antes que adjetivos**: "riega 62 ha" gana a "máxima eficiencia".
- **Formato argentino**: coma decimal, punto de miles, "ha", "m³/h", "kW".
- **Cada mensaje dice el próximo paso** (éxito, error, vacío).
- **Cercano sin caricatura**: nada de diminutivos ni gauchismos de utilería.
- **Palabras que el cliente aprobó o usa**: "Nuestros servicios", "rentabilidad de tu campo", "a medida", "representantes oficiales", "servicio técnico".
- **Palabras a cuidar**: "inteligente" (genérica si va sola), "revolucionario", "innovador", "solución integral".
- **Claims impositivos**: sigla correcta, ortografía impecable y "validalo con tu contador".
- **En público**: sin contrastes "X, no Y", sin "ticket", sin política.

## 7. Registro de decisiones del cliente

| Fecha | Tema | Decisión |
|---|---|---|
| 27/8/2026 | Datos | Teléfono fijo, WhatsApp y dirección km 757 (vía Flor Bossio) |
| 31/8/2026 | Fotos | Quiere más protagonismo de las fotos en el sistema |
| 31/8/2026 | Líneas | Las cinco líneas de la web son aspersión, goteo, solar, pasturas y service; se sacó maquinaria de los ejemplos |
| 31/8/2026 | Landing | La landing de venta es la del beneficio impositivo (flyer RIMI) |
| 2/9/2026 | Home | Wireframe en baja con foco en el copy |
| 2/9/2026 | Home, bloque puente | Rechazó "El rinde de tu campaña no puede depender del pronóstico" y cinco alternativas; eligió **"La rentabilidad de tu campo no puede depender del pronóstico"** |
| 2/9/2026 | Home, servicios | "Qué hacemos / Elegí por dónde empezar" → **"Nuestros servicios"** |
| 2/9/2026 | Home, marca | Sección corta de MT AGRO en la segunda o tercera posición, con el logo bien visible |
| 7/9/2026 | Landing aspersión | Sin fugas, con formulario y WhatsApp; objetivo leads |
| 7/9/2026 | Video Rizzi | Es un testimonio de 1:30, no pieza principal: va en el bloque de confianza |
| 7/9/2026 | Nota Rizzi | No agregar la nota a la landing; solo una cita que refuerce la confianza |
| 9/9/2026 | Título landing | Rechazó "Regá de 1 a 300 hectáreas con un pivote que se maneja desde el celular"; pidió la línea "riego inteligente a medida" |

Patrón del cliente: prefiere títulos **directos y en positivo, con palabras de negocio** (rentabilidad, servicios, a medida) antes que frases ingeniosas o con imágenes de uso (celular, pronóstico como amenaza).

## 8. Frases a corregir en los wireframes

Por la regla de Chimpancé de no usar contrastes "X, no Y" en piezas públicas. Propuestas en afirmativo:

| Archivo | Frase actual | Propuesta |
|---|---|---|
| Home · Servicios, aspersión | "…y repuestos acá, no a tres meses de barco." | "…y repuestos acá, en la zona." |
| Home · Cómo trabajamos, paso 3 | "Números para decidir, no folletos." | "Números claros para decidir." |
| Home · Por qué MT AGRO | "…con tu caudal y tu cultivo, no se adivina." | "…con tu caudal y tu cultivo." |
| Home · Por qué MT AGRO | "…sobre la Ruta 9, no un 0800 en Buenos Aires." | "…sobre la Ruta 9, cerca de tu campo." |
| Home · FAQ | "El equipo queda regando, no en cajas." | "Te entregamos el equipo regando." |
| Landing · Servicio, paso 1 | "El equipo se diseña para tu campo, no al revés." | "El equipo se diseña a la medida de tu campo." |
| Landing · Servicio, paso 2 | "Te lo entregamos regando, no en cajas." | "Te lo entregamos regando." |
| Landing · Confianza | "Técnicos y repuestos acá, no a tres meses de barco" | "Técnicos y repuestos originales, acá en la zona" |
| Landing · FAQ financiación | "…las opciones con números, no promesas." | "…las opciones con números concretos." |
