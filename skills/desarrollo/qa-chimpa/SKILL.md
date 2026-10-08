---
name: qa-chimpa
description: 'QA y testing automático de Chimpancé Digital: cómo Claude verifica que una entrega funciona ANTES de decir que está terminada, en cualquier proyecto con código (Comunidad Emprendedora / PROME con Laravel + Next.js, el ERP Chimpa-Finanzas, QueVibra, landings y apps). Cubre la definición de terminado, la pirámide de pruebas (estáticas, unitarias, API con base real, contrato, e2e con Playwright contra el back real, controles automáticos de usabilidad del test del pulgar, verificación exploratoria en el navegador), cómo diseñar los casos, cómo escribir tests que no fallen al azar, qué correr antes de pasar al ambiente de prueba o a producción, y cómo informarle el resultado a Santiago, que no programa, sin maquillarlo. Usar SIEMPRE que Santiago diga "probalo", "testealo", "hacé QA", "¿anda?", "verificá que funcione", "¿se rompió algo?", "tests automáticos", "e2e", "Playwright", "regresión", "cobertura", "antes de pasarlo a prueba", "antes de producción", "cierre del hito", "checklist de entrega", y también sin que lo pida: al terminar cualquier funcionalidad, arreglo o migración, antes de un merge a la rama de integración o de un deploy, y antes de escribir "listo" o "funciona". Se encadena con ux-chimpa (qué es usable), git-deploy (cuándo y cómo se sube) y los skills de cada proyecto (comandos propios).'
---

# QA Chimpa: nada está terminado hasta que está probado

Santiago no programa. Cuando Claude dice "listo", Santiago no tiene cómo revisarlo línea por línea: **el informe de QA es la única garantía que tiene**. Por eso este skill no es un paso opcional al final; es cómo se trabaja desde que se entiende el pedido.

Dos ideas lo ordenan todo:

1. **Probado quiere decir ejecutado y observado, no leído.** "El código parece correcto" no es una prueba. Una prueba es un comando que corrió, con su resultado, o una pantalla que se usó de verdad. Lo que no se ejecutó se informa como "no probado", con el motivo.
2. **Nunca mentir** (regla 7 de `ux-chimpa`, aplicada al trabajo propio). Un "funciona" que después falla frente al cliente vacía el depósito de confianza de Santiago de un solo golpe. Es preferible decir "anda el caso principal, no pude probar la subida desde iOS" que un "listo" redondo.

## Definición de terminado

Una funcionalidad, un arreglo o una migración está terminada cuando se cumple todo esto, en este orden:

1. **Plan de casos escrito antes de codear** (ver "Cómo diseñar los casos"): qué tiene que pasar y qué no tiene que pasar.
2. **Tests automáticos escritos junto con el cambio**, en la capa más baja que alcance para probarlo (ver la pirámide). Si es un bug, **primero un test que falla**, después el arreglo.
3. **Toda la batería del repo en verde**, no solo los tests nuevos: estáticos, unitarios, API, contrato. Un cambio chico rompe cosas lejanas; la batería completa es barata comparada con un bug en producción.
4. **E2E de los flujos que toca el cambio contra el back real**, en escritorio y en celular de 390 px, con los controles de usabilidad.
5. **Verificación exploratoria en el navegador**: lo que los tests no ven (se ve bien, los textos, los 7 estados, mala conexión). Con captura como evidencia.
6. **Pasado al ambiente de prueba y probado ahí** (no solo en el ambiente de desarrollo). El ambiente de prueba es lo que va a ver el cliente.
7. **Informe a Santiago** con el formato de abajo.

Si un paso no se puede hacer (falta un insumo del cliente, no hay ambiente), el cambio puede avanzar, pero el informe lo dice con todas las letras.

## La pirámide de pruebas

De abajo hacia arriba: cuanto más abajo, más rápido, más estable y más barato. Cada caso se prueba en la capa más baja posible, y arriba solo lo que necesita las piezas juntas.

| Capa | Qué atrapa | Herramientas típicas |
|---|---|---|
| 1. Estáticas | Tipos, estilo, imports, errores obvios | `tsc --noEmit`, ESLint, Pint, PHPStan |
| 2. Unitarias | Reglas puras: cálculos, formatos, normalizaciones | `node --test`, Vitest, PHPUnit Unit |
| 3. API / feature con base real | Endpoints, validación, permisos, base de datos, concurrencia | PHPUnit Feature contra MySQL real, Supertest |
| 4. Contrato | Que front y back hablen igual: spec OpenAPI al día, tipos regenerados, paridad | `composer openapi`, `pnpm gen:api`, baterías de paridad, oráculos |
| 5. E2E contra el back real | Que el recorrido completo funcione con las piezas reales | Playwright, escritorio + celular 390 px |
| 6. Usabilidad automática | Test del pulgar y reglas de `ux-chimpa` medibles | Helper de Playwright (ver `references/controles-usabilidad.md`) |
| 7. Exploratoria | Lo que ninguna máquina juzga: si se entiende, si se ve bien | Navegador real, capturas, los 7 tests de `ux-chimpa` |

**Base real, no simulada.** Los tests de API corren contra el mismo motor de producción (MySQL, Postgres), no contra SQLite ni mocks: las colaciones, las fechas y las restricciones únicas son justamente donde se esconden los bugs. Los e2e con la API simulada sirven para la interfaz, pero **no reemplazan** un e2e contra el back real.

## Cómo diseñar los casos

Antes de escribir un test, listar los casos. Para cada cambio, recorrer estas preguntas (el detalle por tipo de cambio está en `references/diseno-de-casos.md`):

- **Camino feliz:** el uso normal, con datos realistas (tildes, eñes, nombres largos).
- **Validación:** vacío, `null`, tipos equivocados, límites exactos (el máximo y el máximo + 1), espacios, formatos que la gente escribe de verdad ("20-12345678-3", "1.234,56").
- **Permisos:** sin sesión, con la sesión de otro usuario, cuenta suspendida, sin verificar.
- **Estados:** vacío la primera vez, sin resultados, error, cargando (los 7 estados de `ux-chimpa`).
- **Privacidad:** qué datos salen en la respuesta y quién los ve. Un endpoint público nunca devuelve documento, email ni dirección de una persona.
- **Seguridad del dato que carga el usuario:** URLs (`javascript:`), archivos (tipo real, peso, tamaño), HTML, inyección en búsquedas (`%`, `_`).
- **Concurrencia e idempotencia:** doble clic, dos pedidos a la vez, reintento después de un corte.
- **Regresión:** qué funcionalidad vecina puede romperse, y qué test existente la cubre.

Un buen test **se lee como la regla de negocio** que protege: `test_el_whatsapp_sale_solo_si_es_publico`, no `test_show_2`.

**Un bug que cruza front y back** (un dato que el front arma y el back interpreta, como un CUIT con guiones) se encierra primero con un test chico de cada lado, porque cada uno dice dónde está la falla y corre en segundos: el unitario de la normalización en el front y el de API en el back. Recién después va el e2e que los une, que es el que demuestra que la persona ya no lo sufre. Arrancar por el e2e es tentador porque "prueba todo", pero cuando falla no dice qué parte falló y tarda minutos por corrida.

## Tests que no fallan al azar

Un test que a veces falla es peor que no tener test: enseña a ignorar el rojo.

- **Esperar por estado, nunca por tiempo.** `await expect(page).toHaveURL(...)`, no `waitForTimeout(3000)`.
- **Datos propios y estado conocido.** Cada test crea lo que necesita o parte de un reset conocido; nunca depende del orden de otros tests ni de datos que dejó alguien.
- **Sin reintentos que tapen fallas.** Si un test es inestable, se busca la causa (una carrera, un estado compartido) y se arregla.
- **Aislamiento por ambiente:** cada agente o corrida con su base, sus puertos y su carpeta. Las cookies no distinguen puerto: dos ambientes en `localhost` se pisan la sesión; usar `127.0.0.1` para uno de ellos.
- **Escribir como una persona.** En formularios de React (React Hook Form), `fill` o un `value` inyectado puede no disparar la validación: clic + tipeo.
- **El tiempo y el azar, controlados:** zona horaria fija (UTC), semillas, fechas relativas calculadas.

## Antes de pasar al ambiente de prueba o a producción

Checklist corta, en este orden (los comandos exactos de cada proyecto están en su archivo de `references/`):

1. Batería completa del repo en verde, en los **dos** repos si el cambio toca front y back.
2. Artefactos de contrato regenerados y commiteados (spec, tipos, oráculos).
3. E2E contra el back real de los flujos tocados + controles de usabilidad sin violaciones nuevas.
4. Verificación en el navegador del ambiente de prueba, con captura en celular y escritorio.
5. Nada de secretos, `.env` ni datos reales en el commit (`git add` por nombre, nunca `-A`).
6. **Subir a GitHub también es un pase**: un `git push` dispara el CI y deja el trabajo a la vista de otros. Un plan de QA lo puede proponer como paso, pero se hace recién con el OK de Santiago (`git-deploy`), nunca como parte automática de "correr las pruebas".
7. Para producción, además: el OK explícito de Santiago para ese pase puntual, migraciones revisadas (qué hacen con los datos existentes) y un plan para volver atrás.

Los comandos salen del archivo del proyecto en `references/`, tal cual: ahí están los detalles que hacen que un comando funcione en esta máquina (`corepack pnpm`, el `PATH` de Composer, qué worktree usa cada batería). Un comando "genérico" que parece correcto suele apuntar a la base o al back equivocado.

## Cómo se informa a Santiago

Santiago lee títulos y números. El informe va en español llano, sin jerga, y **nunca redondea para arriba**:

```
**Qué se probó:** [la funcionalidad, en palabras del usuario]
**Resultado:** [N] pruebas automáticas en verde en el back, [M] en el front; [K] recorridos completos en celular y escritorio.
**Probado en:** desarrollo / ambiente de prueba (link) — con captura.
**Qué NO se probó y por qué:** [ej. "la subida desde un iPhone real: no tengo uno"; "el mail real: falta el servidor de correo del banco"].
**Riesgos o dudas:** [lo que puede fallar y cómo nos daríamos cuenta].
**Problemas encontrados en el camino:** [bugs, con gravedad y si ya se arreglaron].
```

Si algo falló, el informe lo dice primero, con la salida del error, y qué se va a hacer.

## Cuando QA encuentra un problema

1. Reproducirlo y escribir el test que lo muestra (falla).
2. Arreglarlo en la rama de la funcionalidad, nunca directo en el ambiente de prueba.
3. Ver pasar el test nuevo y la batería completa.
4. Si el problema es de UX (confunde, no se ve, texto que no dice qué hacer), va con `ux-chimpa`, con gravedad 1 a 4.
5. Si el problema está fuera del alcance del cambio, se anota como pendiente con su gravedad; no se mezcla en el mismo commit.

## Proyectos

Cada proyecto tiene su archivo con los comandos exactos, los ambientes, los puertos y las trampas conocidas. **Leelo antes de probar**:

- **Comunidad Emprendedora (PROME)** → `references/comunidad-emprendedora.md`
- **QueVibra** → su protocolo de pruebas vive en `quevibra-dev` (manda ese); este skill aporta el método y el formato del informe.
- **ERP Chimpa-Finanzas** → ambientes y comandos en `erp-chimpa-finanzas` (manda ese).
- Un proyecto nuevo → copiar `references/_plantilla-proyecto.md` y completarlo la primera vez que se prueba ese proyecto.

Referencias transversales:
- `references/diseno-de-casos.md` — casos por tipo de cambio (endpoint, formulario, subida de archivos, pantalla pública, migración, permisos, integración externa).
- `references/controles-usabilidad.md` — los controles automáticos que salen de `ux-chimpa` (44 px, 16 px, sin desborde, nombres accesibles, consola limpia) y el helper de Playwright para copiar.
