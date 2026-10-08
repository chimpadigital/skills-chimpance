---
name: avatar-grupo-whatsapp
description: Genera el avatar co-branded para grupos de WhatsApp de clientes de Chimpancé Digital — círculo partido al medio, mitad blanca con el ISO del cliente y mitad lima con el iso "pa" de Chimpancé — y SIEMPRE entrega el PNG final de 1080×1080 listo para subir. Usar SIEMPRE que Santiago pida "el avatar/la imagen/la foto para el grupo de WhatsApp de [cliente]", "armá el grupo de [cliente]", "hacé uno como el de Tiempo Judicial para [cliente]", o cualquier pieza de identidad para un grupo de WhatsApp compartido con un cliente. También activar si pide actualizar o corregir un avatar de grupo existente.
---

# Avatar de grupo de WhatsApp — cliente × Chimpancé

Pieza de identidad para los grupos de WhatsApp que Chimpancé comparte con cada cliente. El formato está validado (Tiempo Judicial, MT AGRO): un círculo partido al medio donde conviven las dos marcas. El entregable es **siempre un PNG de 1080×1080** — nunca terminar la tarea entregando solo el HTML: el PNG exportado y enviado a Santiago con SendUserFile es lo que cierra el trabajo.

## El formato (fijo, no se rediseña por cliente)

Lienzo 1080×1080 con fondo dark `#0A0A0A`, círculo de 900px centrado (WhatsApp recorta el círculo solo; el marco dark queda como aro):

- **Mitad izquierda — cliente**: fondo blanco `#fff`, ISO del cliente centrado.
- **Mitad derecha — Chimpancé**: fondo lima `#D9F45F`, iso "pa" completo en dark `#0A0A0A` (ya está embebido en la plantilla, no se toca). Mismo esquema que `ig-avatar-lima` de brand. **Nunca celeste** `#36A9E1` — está deprecado del sistema (ago 2026).

Lo único que cambia entre clientes es la marca de la mitad izquierda.

## Regla de oro: ISO, nunca el logo completo

Del lado del cliente va **su ISO (isotipo / símbolo / versión favicon-avatar)**, no el lockup completo con texto. Por qué: en la lista de chats el avatar mide 48px y la mitad del cliente ~24px — un logo con texto se convierte en una mancha ilegible; el ISO identifica igual a cualquier tamaño.

Cómo obtenerlo, en orden de preferencia:

1. **Del Design System del cliente**: leer SOLO la sección de logo/marca del styleguide (no todo el archivo — buscar con Grep `logo|iso|favicon|avatar` y leer esa sección). Muchos DS ya definen la versión favicon/avatar: usar exactamente esa.
2. **Si el DS no define ISO**: derivarlo con criterio — el bloque o símbolo más compacto y reconocible de la marca (ej. MT AGRO: el bloque "mt" verde, sin "agro"). Reconstruirlo con los tokens del DS (colores exactos, tipografía, radius), no aproximar a ojo.
3. **Si solo hay un archivo de logo** (SVG/PNG): recortar/usar el símbolo. Si es tipográfico puro, usar la primera palabra o las iniciales con los colores y tipografía de la marca.

Ideal SVG inline (escala perfecto); un PNG de buena resolución también sirve como `<img>`.

## Workflow

1. **Conseguir el ISO del cliente** (regla de arriba). Si no hay ningún material de marca del cliente ni en el proyecto ni pasado por Santiago, pedírselo — no inventar una marca.
2. **Copiar la plantilla** `assets/plantilla.html` de este skill a la carpeta de avatares de grupos del proyecto: `Chimpa/brand/whatsapp/avatares-grupos/grupo-<cliente>.html`. Ahí quedan versionados todos los grupos, cada HTML junto a su PNG (referencia viva: `grupo-mtagro.html`).
3. **Pegar el ISO** en el bloque marcado `<!-- ISO_CLIENTE -->`. Si el ISO usa una tipografía web (ej. Archivo para MT AGRO), agregar el `<link>` de Google Fonts en el `<head>`.
4. **Tamaño**: el ISO debe ocupar ~60–70% del ancho de su mitad (la mitad mide 450px). Ni miniatura perdida ni tocando el borde del círculo.
5. **Exportar**: `python <skill>/scripts/exportar.py <ruta-al-html> <ruta-salida>.png` — corre Edge headless y verifica que salga 1080×1080. Guardar el PNG al lado del HTML: `Chimpa/brand/whatsapp/avatares-grupos/grupo-<cliente>.png`.
6. **Verificar mirando el PNG** (Read del archivo): checklist abajo. Si algo falla, corregir el HTML y re-exportar — no entregar sin mirar.
7. **Entregar el PNG** con SendUserFile (display render). Una sola variante salvo que Santiago pida opciones.

## Checklist visual antes de entregar

- **Contraste real**: ningún trazo del mismo color que su fondo — así se "pierden los ojos" (pasó con el pa sobre celeste). Ojos/detalles del ISO visibles.
- **Forma del círculo**: las dos mitades se distinguen del marco dark; si una mitad fuera oscura, el círculo se funde con el fondo (por eso la mitad Chimpa es lima, no dark).
- **Legibilidad a 48px**: imaginar el PNG a 48px — ¿se identifican las dos marcas? Si el ISO del cliente tiene texto fino, agrandarlo o simplificarlo.
- **Colores exactos del DS del cliente** (hex del styleguide, no aproximados) y lima/dark exactos de Chimpa.
- **Centrado**: cada marca centrada vertical y horizontalmente en su mitad.

## Gotchas técnicos

- Edge headless en Windows: el script ya maneja los flags correctos (`--headless=new`, perfil temporal, `--virtual-time-budget` para que carguen las fuentes). Si el PNG sale gris plano o sin fuente, la página falló en cargar: revisar rutas relativas — la plantilla es auto-contenida justamente para evitar servers.
- Google Fonts carga bien desde `file://`; los `<script src>` relativos no siempre — por eso el iso "pa" va inline en la plantilla, mantenerlo así.
- Verificar dimensiones y mirar el PNG SIEMPRE: el script valida 1080×1080, pero el contenido (ojos, tamaños, contraste) solo se valida con los propios ojos.
