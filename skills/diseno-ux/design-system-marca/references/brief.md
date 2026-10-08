# Brief, target y contexto

La dirección creativa se afina o se arruina acá. Un sistema visualmente hermoso diseñado para el usuario equivocado es un sistema fallido. Esta referencia estructura qué averiguar antes de diseñar y cómo cada dato mueve decisiones concretas de UI.

## El mini brief

Diez preguntas. Si hay interlocutor, hacé las que falten (no interrogues: si el pedido ya trae la respuesta, no la repreguntes; agrupá lo que preguntes en un solo intercambio). Si no hay interlocutor, completalo por inferencia y documentá el resultado al inicio de la style guide como **"Brief asumido"** — el cliente corrige lo asumido mucho más rápido de lo que responde un cuestionario en blanco.

1. **Negocio**: ¿qué vende, cómo gana plata, qué lo hace distinto de verdad?
2. **Target primario**: ¿quién usa esto? Edad aproximada, contexto socioeconómico, relación con la tecnología. Si hay más de un usuario (el que paga vs el que usa — típico B2B), identificá a ambos.
3. **Contexto de uso**: ¿dónde y cuándo? ¿Parado en la calle con una mano, o sentado con dos monitores? ¿Diario o esporádico? ¿Con apuro o con calma?
4. **Acción principal**: ¿cuál es LA conversión? (comprar, aprobar, pedir, suscribirse). El sistema entero debe empujar hacia ella.
5. **Personalidad deseada**: 3 adjetivos que la marca quiere ser y 3 que NO quiere ser. Los negativos suelen ser más reveladores ("que no parezca un banco viejo" dice más que "moderna").
6. **Competencia y referentes**: ¿contra quién compite? ¿Qué marcas (de cualquier rubro) le gustan visualmente y cuáles detesta?
7. **Material existente**: logo, manual de marca, tipografías (¿con licencia web?), fotos propias, un sitio actual. Todo lo que exista condiciona; todo lo que falte hay que proponerlo.
8. **Alcance del ecosistema**: web institucional, e-commerce, app, dashboard, emails — qué piezas existen o van a existir.
9. **Mercado e idioma**: país, registro (voseo/tuteo/neutro), formatos locales (moneda, fechas, unidades).
10. **Restricciones**: técnicas (framework del equipo dev, CMS), legales (normativa del rubro: finanzas, salud), de accesibilidad más allá de AA si aplica.

Las respuestas 1–6 alimentan la dirección creativa (`direccion-creativa.md`); 7–10 definen alcance y restricciones del sistema.

## Del target a decisiones de UI

El target no es un párrafo decorativo del brief: cada rasgo mueve perillas concretas. Las principales:

| Rasgo del target | Perillas que mueve |
|---|---|
| **Edad 50+** o visión cansada | Cuerpo base 17–18px, contraste por encima del mínimo AA (apuntar a 7:1 en texto principal), targets táctiles más generosos (48px+), menos dependencia del color como único código |
| **Uso con apuro / una mano / en la calle** | Jerarquía brutal (una acción dominante por pantalla), CTAs en zona de pulgar, menos pasos, textos cortos, feedback inmediato y visible |
| **Uso prolongado de escritorio** (dashboard, back-office) | Densidad alta bienvenida, tipografía de UI 14px aceptable, atajos y estados hover ricos, modo oscuro más importante |
| **Baja madurez digital** | Patrones ultra-convencionales (el carrito arriba a la derecha, el menú donde se espera), labels literales sobre ingenio, más texto de ayuda |
| **Alta madurez digital / early adopters** | Tolera (y premia) patrones novedosos, micro-interacciones más expresivas, densidad informativa |
| **B2B / decisor económico** | Sobriedad relativa, números protagonistas (tabulares), credibilidad visual (orden, precisión), el "wow" va en la calidad del detalle, no en fuegos artificiales |
| **B2C aspiracional / lifestyle** | La imagen manda (fotografía/ilustración protagonista), más expresividad tipográfica y de color, el sistema puede ser más teatral |
| **Público mixto** (ej. marketplace) | El núcleo del sistema se calibra para el usuario menos capaz; la expresividad se concentra en las capas de marketing |

Cuando dos rasgos tiran para lados opuestos (dashboard denso + usuarios 50+), la accesibilidad gana la pulseada y la densidad se recupera con jerarquía, no con tamaño.

En la style guide, la sección de dirección creativa incluye un bloque **"Para quién diseñamos"**: el perfil del usuario en 2–3 líneas y las 3–4 decisiones del sistema que ese perfil determinó. Eso le demuestra al cliente que el diseño no es gusto: es criterio.

## Paisaje competitivo

Diferenciarse a ciegas es azar. Antes de cerrar la dirección:

- **Mapeá el paisaje visual del rubro** (3–5 competidores directos): ¿todos azules? ¿todos con la misma sans geométrica? ¿todos foto de stock sonriente? Si hay acceso a búsqueda web, mirá sus sitios; si no, usá el conocimiento del rubro y decláralo como supuesto.
- **Elegí qué convención romper y cuál respetar.** Romper todas = ilegible para el usuario del rubro; no romper ninguna = invisible. La dirección creativa declara explícitamente: "el rubro hace X, nosotros hacemos Y, porque Z".
- Los referentes que el cliente admira se usan como brújula de gusto, no como molde: identificá *qué* les gusta de esa referencia (¿la limpieza? ¿el color? ¿el humor?) y traducilo al sistema propio.

## Plantilla de brief para el cliente

Si el usuario lo pide (o si el proyecto amerita una instancia formal con el cliente final), generá un `brief.md` o mini formulario con las 10 preguntas redactadas en lenguaje de cliente (sin jerga de diseño), listo para enviar. Es un entregable barato que a las agencias les ahorra una reunión.
