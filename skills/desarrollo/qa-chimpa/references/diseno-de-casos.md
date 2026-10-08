# Casos por tipo de cambio

Checklists para no olvidar casos. No hace falta un test por renglón: hace falta **haber pensado** cada renglón y probar los que pueden fallar en este cambio. Cada caso se escribe en la capa más baja que alcance (ver la pirámide en `SKILL.md`).

## Endpoint nuevo (API)

- Camino feliz con datos realistas (tildes, eñes, textos largos) y la **forma exacta** de la respuesta (claves, tipos, `null` vs `""`).
- Autenticación: sin sesión (401), sesión vencida, email sin verificar, cuenta suspendida o dada de baja.
- Autorización: el recurso de **otro** usuario (404 o 403 según el contrato; que no filtre existencia si no corresponde).
- CSRF en las mutaciones.
- Validación: cada campo vacío, `null`, tipo equivocado, límite exacto y límite + 1, claves desconocidas, body que no es JSON, body enorme (413).
- Query strings: repetidos (`a[]=`), vacíos, espacios, `%` y `_` en búsquedas.
- Paginación: primera, última, fuera de rango, tamaño máximo.
- Privacidad: la respuesta no trae datos de otras personas ni internos (ids de usuario, email, documento, dirección, hashes).
- Límite de pedidos (rate limit) si el endpoint es público o costoso.
- Auditoría: si la acción cambia datos de una persona, queda registrada sin valores sensibles.
- Documentación: aparece en la spec con ejemplos y errores; los tipos del front se regeneran.

## Formulario (front)

- Se completa escribiendo como una persona (clic + tipeo), con y sin mouse (teclado, Enter envía).
- Formatos reales: con y sin guiones, puntos o espacios; mayúsculas; espacios al principio y al final.
- Error por campo: dice qué pasó y qué hacer, al lado del campo, sin borrar lo cargado.
- Error del servidor y corte de red: el texto no culpa a la persona y lo cargado sigue ahí.
- Doble clic en enviar: un solo envío (botón en estado "enviando").
- Volver atrás y adelante, recargar a mitad: qué se conserva.
- Celular: teclado correcto (`inputmode`), inputs de 16 px, botón principal alcanzable con el pulgar.

## Subida de archivos

- Tipos válidos, y el tipo **real** por contenido (un `.txt` renombrado a `.jpg` se rechaza), SVG y GIF si no se aceptan.
- Peso: justo en el límite y apenas arriba; el error llega antes de esperar toda la subida si se puede.
- Dimensiones mínimas y máximas.
- Reemplazo: el archivo viejo se borra del almacenamiento.
- Borrado ajeno: 404.
- Servido: `Content-Type` correcto, `nosniff`, caché acorde, y que no se sirva si el dueño ya no es visible.
- Front: progreso, error por archivo, reintento, y que una falla no pierda las otras fotos.

## Pantalla pública (sin sesión)

- Se ve sin cuenta y con cuenta; el dueño ve lo mismo que un visitante más sus accesos.
- Título de la pestaña, descripción y Open Graph (lo que muestra WhatsApp al compartir).
- 404 con su título ("Página no encontrada"), id malformado, recurso de cuenta suspendida.
- Back caído: mensaje que no culpa al link.
- Enlaces armados con datos del usuario: solo esquemas seguros (`http`, `https`, `wa.me`, `mailto:`).
- Indexación: respeta la configuración (`ALLOW_INDEXING`).

## Migración de base de datos

- `migrate` sobre una base vacía y sobre una copia con datos existentes.
- Qué pasa con las filas que ya existen (valores por defecto, backfill, nulos).
- Índices y restricciones únicas contra datos reales (colación que ignora mayúsculas o tildes).
- Se puede volver atrás, o está escrito por qué no.

## Permisos y roles

- Cada rol contra cada acción: la tabla completa, no solo el rol que se está tocando.
- Cambiar el rol o suspender con la sesión abierta: la próxima acción ya lo respeta.

## Integración externa (CRM, mail, WhatsApp, almacenamiento)

- Respuesta correcta, "no encontrado", error del servicio (5xx), demora (timeout), respuesta con forma inesperada.
- Que una caída del servicio no se informe como un dato ("no estás en el padrón" cuando el CRM no respondió).
- Reintentos con espera y sin duplicar efectos.
- Logs sin datos personales.
- En tests: el servicio simulado; en el ambiente de prueba, el real solo si existe una cuenta de prueba.
