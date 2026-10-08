# Expresión visual: iconos, imagen, movimiento y ritmo

Un design system correcto pero visualmente plano es un entregable a medias. Esta referencia cubre las cuatro capas que hacen que un sistema se sienta vivo y user-friendly: iconografía, imagen, micro-interacciones y ritmo visual. Ninguna es opcional.

## Iconografía (sistema, no decoración)

Los iconos son la capa de usabilidad más barata que existe: reducen tiempo de escaneo, refuerzan el significado de las acciones y le bajan la carga de lectura al usuario. Reglas:

- **Toda acción lleva icono.** CTAs, botones, links de acción, items de menú, tabs, estados vacíos, alerts: siempre icono + texto (el icono refuerza, el texto desambigua — icono solo únicamente en icon-buttons con `aria-label`). Un botón "Agregar al carrito" sin carrito es una oportunidad perdida.
- **Un solo estilo en todo el sistema**, derivado del concepto: outline con stroke consistente (1.5–2px) para sistemas livianos y modernos, filled para sistemas contundentes, duotone si el concepto pide riqueza. Nunca mezclar estilos.
- **Implementación autocontenida**: definí un sprite SVG inline (`<svg style="display:none"><symbol id="icon-cart">...</symbol></svg>`) al inicio del HTML y usalo con `<svg><use href="#icon-cart"/></svg>`. Dibujá los iconos en viewBox 24×24 con el vocabulario visual de librerías tipo Lucide/Phosphor (trazos limpios, esquinas coherentes con los radios del sistema). Color siempre `currentColor` para que hereden del texto.
- **Tokens de icono**: tamaños (`icon-sm: 16px`, `icon-md: 20px`, `icon-lg: 24px`, `icon-xl: 32px` para estados vacíos/features) y la regla de alineación con el texto (mismo line-height, `vertical-align` o flex + gap).
- **Set mínimo del sistema** (~25–35 iconos): navegación (home, menú, búsqueda, usuario, configuración, volver, cerrar), acciones (agregar, editar, eliminar, compartir, descargar, copiar, filtrar, ordenar), feedback (éxito, error, alerta, info, ayuda), dirección (chevrons, flechas, externo) + los del dominio del cliente (carrito, taza, tarjeta, gráfico...). Los iconos del dominio son los que le dan personalidad al set: dedicales cariño.
- La style guide incluye una **sección de Iconografía**: grilla completa del set con nombres, tamaños, y ejemplos de icono+texto en botones y menús.

## Imagen e ilustración

Icono + texto solo, a lo largo de páginas enteras, aburre. El sistema define un **lenguaje de imagen** y la guía lo muestra:

- **Definí el rol de la imagen según el rubro**: fotografía (gastronomía, retail, turismo — con tratamiento: overlay de marca, duotono, esquinas del sistema), ilustración SVG propia (SaaS, fintech — motivos abstractos derivados del concepto), o mixto.
- **En el HTML autocontenido no hay fotos**: construí **ilustraciones SVG inline de la marca** — motivos geométricos, patterns, escenas abstractas que salgan del concepto creativo (ej.: curvas de nivel para una marca "Cumbre", barras que suben para una fintech). Estas ilustraciones se usan en heros, estados vacíos, banners y cards destacadas de la propia guía, y quedan como assets reutilizables del sistema.
- **Documentá el tratamiento fotográfico** aunque no haya fotos: proporción(es) del sistema (16:9, 4:5, 1:1), radios, overlay/filtro de marca (demo con CSS sobre un placeholder SVG), y qué NO hacer (stock genérico de gente dándose la mano).
- Placeholders con personalidad: los avatares, thumbnails y covers de ejemplo en la guía se generan como SVG con las iniciales/colores del sistema — nunca cajas grises.

### Tramas (patterns)

Toda marca del sistema tiene al menos una **trama propia**: un patrón repetible derivado del mismo motivo que las ilustraciones (las curvas de nivel, las barras, los granos, la retícula — lo que el concepto haya dado). La trama es el recurso que viste superficies grandes sin recurrir a color plano ni a fotos, y es de los elementos más reconocibles de una identidad digital bien hecha.

- **Implementación**: `<pattern>` de SVG inline (o un `<defs>` reutilizable con `fill="url(#trama-x)"`), o bien un SVG codificado como `background-image` en un token/clase utilitaria. Siempre autocontenida y tintable: la trama se dibuja con `currentColor` u opacidades del color de marca, de modo que funciona sobre cualquier fondo del sistema y en ambos temas.
- **Variantes de densidad/escala**: al menos dos (sutil para fondos amplios — opacidad 3–8%, escala grande; protagonista para banners y heros — más contraste, escala menor). Documentá cuándo usar cada una.
- **Dónde aplica**: fondos de heros y banners de contraste, cabeceras de cards destacadas, estados vacíos, portada de la guía, separadores de sección. Regla: la trama acompaña, nunca compite con el contenido — sobre texto largo va la variante sutil o no va.
- La sección de Imagen de la guía muestra la trama en sus variantes, con el código/token para aplicarla, y los banners de la propia guía la usan.

## Micro-interacciones y movimiento

El movimiento es parte de la personalidad, no un adorno final. Además de los tokens de duración/easing, el sistema define un **catálogo de micro-interacciones** con demos vivas en la guía (CSS + JS vainilla; el efecto "Framer Motion" se logra con transiciones bien afinadas, `transform`, `IntersectionObserver` y springs aproximados con `cubic-bezier`):

- **Botones/CTAs**: elevación o compresión al hover (`translateY(-2px)` / `scale(0.98)` al press), y el icono del CTA que se desplaza sutilmente al hover (`translateX(3px)` en la flecha) — es la micro-interacción de mayor rendimiento percibido/costo.
- **Cards**: lift al hover (sombra + translate), imagen con zoom sutil (`scale(1.03)` con overflow hidden).
- **Entradas**: reveal al scroll con `IntersectionObserver` + stagger (los hijos entran con 40–80ms de delay incremental), fade+rise de 12–20px. La guía misma usa estos reveals en sus secciones: es la demo.
- **Feedback**: toast que entra con spring, switch con transición elástica, checkbox con check animado (stroke-dashoffset), contador numérico animado en KPIs, skeleton con shimmer.
- **Navegación**: indicador de tab que se desliza, subrayado de link que crece desde la izquierda, menú mobile que entra con easing del sistema.
- Todo con `@media (prefers-reduced-motion: reduce)` que apaga transforms y deja solo fades.

El carácter del movimiento sale del concepto (seco y rápido vs elástico y juguetón), pero la *cantidad* no se negocia: un sistema sin micro-interacciones definidas está incompleto.

## Ritmo visual: banners y bloques de contraste

Las páginas largas de fondo uniforme se vuelven papilla visual. El sistema define **bloques de ruptura** y la propia guía los usa entre secciones:

- **Banner de contraste**: sección full-width con fondo de color fuerte del sistema (el color de marca, el inverso, o un funcional según contexto) con texto en el color de contraste verificado, para CTAs, anuncios o transiciones entre bloques temáticos.
- Variantes como componentes del núcleo: **CTA banner** (título + botón con icono), **announcement bar** (fina, arriba), **stat band** (cifras destacadas sobre fondo de marca), **banner promocional** (e-commerce: oferta + countdown).
- Regla de ritmo documentada en la guía: en páginas de marketing, cada 2–3 bloques sobre fondo neutro entra un bloque de color/contraste o con ilustración. La guía lo dice y lo practica: sus propias secciones largas se separan con estos banners.

## Sección Mobile dedicada

Mobile no es "los mismos componentes más angostos": la guía incluye una sección **Mobile** propia, con demos dentro de marcos de teléfono (`div` con borde redondeado, ~375px de ancho) mostrando los patrones reales:

- **Menú mobile**: cómo colapsa la navegación (bottom tab bar para apps, drawer/fullscreen menu para web), con demo interactiva del menú abriéndose con la animación del sistema.
- **Cards en mobile**: cómo se reorganizan (grillas que pasan a scroll horizontal con snap, o a columna), densidad y padding recalibrados.
- **Zonas de pulgar**: las acciones primarias viven en el tercio inferior de la pantalla; documentalo con un diagrama del sistema.
- **Targets y tipografía**: ≥44px táctil, tamaños de fuente que no bajan de 16px en inputs (evita el zoom automático de iOS).
- **Gestos y estados**: swipe donde aplique, pull-to-refresh, safe areas (notch), y el comportamiento de los banners/heros en pantalla chica.

Esta sección va después de Componentes y antes de Composiciones, y al menos una de las composiciones finales se muestra también en su versión mobile enmarcada.
