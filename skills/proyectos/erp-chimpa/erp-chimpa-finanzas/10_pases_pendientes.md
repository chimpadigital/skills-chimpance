# 10 · Tablero de sesiones del ERP: desarrollo → prueba de Santiago → listo para migrar → archivada

> Creado el 12/9/2026 a pedido de Santiago (ese mismo día se sumó el estado 🧪 "falta que pruebe Santiago"). La barra lateral de Claude funciona como tablero de las sesiones del ERP: se ve de un vistazo qué se está programando, qué está en dev-finanzas esperando que Santiago lo pruebe, qué ya probó y está listo para producción. Lo terminado desaparece (se archiva) para que no sea una lista sin fin.

## Los estados

| Estado | Grupo de la barra lateral | Cuándo entra | Cuándo sale |
|---|---|---|---|
| **🛠️ En desarrollo** | `🛠️ ERP · En desarrollo` | al arrancar una tarea del ERP (código, diseño, análisis) | al subir a dev → 🧪 · si no lleva código, al entregarse → archivada |
| **🧪 Falta que pruebe Santiago** | `🧪 ERP · En dev, falta que pruebe Santiago` | push a `dev` con el deploy en verde | Santiago dice que anda → ✅ · dice que falla → 🛠️ |
| **✅ Aprobado, listo para producción** | `✅ ERP · Aprobado, listo para producción` | Santiago lo probó en dev-finanzas y dio el OK | al migrar a producción → archivada |
| **⏸️ Pausada** | `⏸️ ERP · Pausadas` | Santiago la pone en pausa (espera una decisión, un dato del CTO o de un cliente, o se deja para más adelante), a mano o pidiéndolo | al retomarla → vuelve al estado en que estaba (🛠️ si no subió nada; 🧪 si ya tenía algo en dev sin probar) · si se descarta → archivada |
| **📦 Archivada** | **Archivadas** (sale de la barra; se recupera desde la lista de archivadas) | ya está en producción, o sesión sin código ya entregada | — |

Lo que se hizo no se pierde al archivar: queda en git (`git log origin/main`), en los capítulos del skill (07, 08, 09…) y en la memoria. **Lo pendiente de decidir no vive en la barra lateral**: se anota en el cap. 04 (roadmap) y la sesión se archiva igual.

Hay **dos marcas** que siempre dicen lo mismo:

1. **La verdad técnica = git.** Lo que está en dev y no en producción es exactamente `git log origin/main..origin/dev`. Esto no se equivoca nunca.
2. **La marca visual = los grupos.** El ícono en el nombre del grupo y en el título de la sesión es la marca (la app no deja pintar sesiones). Git no sabe si Santiago probó algo: eso lo sabe solo el grupo (🧪 vs ✅).

**Ojo**: la historia de `dev` es una fila. Pasar a producción es mover `main` hasta un punto de esa fila: lleva **todo lo anterior a ese punto**, lo ✅ y lo que no. No se puede elegir cambios salteados. Por eso el pase se hace con el procedimiento del **Paso C** (inventario → punto de corte → chequeos → un OK → subir), que nunca manda a producción algo que no se probó en dev.

**Archivar siempre con OK de Santiago** (la herramienta lo exige): nunca de oficio. El OK se pide nombrando las sesiones, junto con el OK de la migración.

**Íconos, no colores (14/9/2026, pedido de Santiago)**: los estados se marcan con íconos en dos lugares, siempre los dos juntos:
1. **Nombre del grupo** (`🛠️ ERP · …`, `🧪 ERP · …`, `✅ ERP · …`, `⏸️ ERP · …`).
2. **Título de cada sesión**, con el ícono adelante: `🧪 Crear proyectos en ERP`. Así la marca se ve en la fila aunque la sesión esté fijada o fuera del grupo. Cada vez que una sesión cambia de estado: `move_sessions` **y** `mcp__ccd_session_mgmt__set_session_title` sacando el ícono viejo del principio (🛠️ / 🧪 / ✅ / ⏸️) y poniendo el nuevo. Nunca dos íconos de estado en el mismo título. Si Santiago puso el título a mano, la app le pide aprobar el cambio: es esperable.

Los puntitos de color que la app muestra al lado de cada sesión (trabajando, necesita respuesta, falló) son del sistema: no se pueden cambiar ni reemplazar por íconos. El ícono del título convive con ellos.

Cómo encontrar los grupos: `mcp__ccd_sidebar__list_groups` y buscar por el ícono inicial (🛠️ / 🧪 / ✅ / ⏸️ + `ERP`). Si alguno no existe, crearlo con `create_group` y el nombre exacto de la tabla. Mover la propia sesión (`session_ids: ["self"]`) no pide permiso; mover otras, sí.

## Paso S — Sincronizar los íconos con los grupos (automático)

Santiago mueve sesiones de grupo a mano (arrastrándolas en la barra lateral). La app no avisa cuando eso pasa, así que **el grupo manda y el título se corrige solo** en estos momentos:
- al arrancar cualquier sesión que cargue este skill (Paso 0),
- al subir a dev (Paso A), al registrar una prueba (Paso A2), en "¿qué falta migrar?" (Paso B) y al migrar (Paso C),
- cuando Santiago pida "sincronizá el tablero" o "acomodá los íconos",
- **cada 15 minutos**, con la tarea programada `sincronizar-tablero-erp` (14/9/2026; sección Programadas de la app; corre solo mientras la app está abierta). Su prompt vive en `C:/Users/santi/.claude/scheduled-tasks/sincronizar-tablero-erp/SKILL.md`: si cambian los grupos o los íconos, actualizarlo también ahí.

Cómo:
1. `mcp__ccd_sidebar__list_groups` → ids de los cuatro grupos (🛠️ / 🧪 / ✅ / ⏸️ + `ERP`).
2. `mcp__ccd_session_mgmt__list_sessions {group: <id>, limit: 100}` para cada uno. Ícono que corresponde: 🛠️ → `🛠️`, 🧪 → `🧪`, ✅ → `✅`, ⏸️ → `⏸️`.
3. Para cada sesión: sacar del principio del título cualquier ícono de estado (🛠️ y ⏸️ con o sin `U+FE0F`, 🧪, ✅, y los viejos 🔵 🟠 🟢 🟡) y los espacios; armar `<ícono> <resto>`. Si difiere del título actual → `mcp__ccd_session_mgmt__set_session_title`.
4. Sesiones que **salieron** del tablero (movidas a otro grupo o sin grupo) y todavía tienen un ícono de estado adelante: buscarlas en `list_sessions {limit: 100}` y sacarles el ícono.
5. Las archivadas no se tocan.
6. Hacerlo en silencio: solo se menciona si se corrigió algo ("acomodé el ícono de X, que moviste a ✅").

Mover una sesión a ✅ a mano **es** la aprobación de Santiago: no se le vuelve a preguntar si la probó.

## Paso 0 — Al arrancar una tarea del ERP (automático)

Primero, **Paso S** (sincronizar íconos de todo el tablero).

Cuando la sesión empieza a trabajar en algo concreto del ERP (no una consulta de dos líneas): `move_sessions {session_ids: ["self"], group_id: <🛠️>}`.

**Excepción — sesiones sobre skills** (14/9/2026): si el trabajo es sobre un skill **del ERP** (este mismo, erp-ui-chimpa, o ux-chimpa aplicado al ERP: capítulos, reglas, crear uno nuevo), la sesión va al grupo **`🧩 ERP · Skills`**, sin ícono de estado en el título y fuera del tablero, aunque commitee la copia del skill al repo. Si mezcla código del ERP + skill, manda el código: va al tablero. Las sesiones sobre skills de **otros proyectos** (techagro, ejecutivo-cuenta, presentaciones, etc.) no van a ese grupo: quedan en el grupo de su proyecto.

## Paso A — Al subir a dev (automático, sin preguntar)

1. **Marca en el commit**: todo commit que va a dev lleva, antes del `Co-Authored-By`, la línea
   ```
   Sesion: <título de la sesión>
   ```
   (el título sale de `mcp__ccd_session_mgmt__get_session {session_id: "self"}`). Así `git log` agrupa lo pendiente por sesión aunque esté archivada.
2. `git push origin HEAD:dev` → `gh run watch` hasta verde → **test obligatorio en dev-finanzas** con el Chrome logueado como admin (cap. 01 › "Test obligatorio antes de terminar").
3. **Mover la sesión al 🧪**: `move_sessions {session_ids: ["self"], group_id: <🧪>}`. Si el deploy falló **o el test no pasó**, **no** se mueve: sigue en 🛠️ hasta que dev quede en verde y el test pase.
4. **Cerrar con el reporte del test** (qué se probó ✅, qué no se pudo ⚠️, captura con `SendUserFile`) **y el guion de prueba para Santiago**: una lista corta de 3 a 6 pasos concretos para hacer en https://dev-finanzas.chimpance.digital ("entrá a X, tocá Y, tiene que pasar Z"), y la línea: *"Queda en 🧪: cuando lo pruebes, decime si anda o qué falla."*

## Paso A2 — Santiago avisa el resultado de su prueba

- **"Anda" / "probé X, ok"** → `move_sessions` de esa sesión al ✅. Si lo dice en otra sesión, mover la que corresponde (buscarla en `list_sessions {group: "🧪 ..."}` por título).
- **"Falla" / "no anda Y"** → la sesión vuelve al 🛠️, se arregla, y el arreglo recorre de nuevo el Paso A (vuelve al 🧪 con un guion de prueba nuevo, solo de lo arreglado).
- **"Anda a medias, lo demás después"** → queda en 🧪; lo pendiente se anota en el mensaje.

## Paso B — "¿Qué falta probar / migrar?" (a pedido)

```bash
git fetch origin -q
git rev-list --count origin/main..origin/dev          # cuántos commits
git log --format='%h|%ad|%s|%(trailers:key=Sesion,valueonly)' --date=format:'%d/%m' origin/main..origin/dev
git diff --stat origin/main..origin/dev -- migrations/  # ¿hay migraciones de schema en el pase?
```

Más `list_sessions {group: <🧪>}` y `list_sessions {group: <✅>}`.

Responder con dos bloques cortos, **agrupados por sesión** (o por tema si los commits no tienen la línea `Sesion:`):
- **🧪 Falta que pruebes**: qué cambió + el guion de prueba de cada una.
- **✅ Listo para migrar**: qué cambió, fecha, si trae migración de schema (⚠️ si es destructiva).

Si hay commits en dev que no son de ninguna sesión del tablero (viejos o del CTO), listarlos aparte: van en el próximo pase igual. Terminar con la pregunta concreta que corresponda: *"¿Probás estas?"* o *"¿Migro esto a producción?"*.

## Paso C — Pase a producción de lo aprobado (✅)

Se activa cuando Santiago dice "migrá lo aprobado", "subí a producción", "pasá lo ✅", "hacé el pase". Objetivo: que llegue a producción **todo lo aprobado que se pueda, en orden, sin pisar nada y sin mandar nada que no se haya probado en dev**. Nada se sube hasta el paso C5 (el OK).

### Lo prohibido en un pase (no negociable)

- `cherry-pick` de cambios sueltos a `main`, `rebase` o `reset` de `dev`/`main`, `push --force` a cualquier rama. Arman combinaciones que nunca corrieron en dev.
- Pushear a `main` una rama local. **Siempre se pushea un hash que ya existe en `origin/dev`**: `git push origin <hash>:main`. Así el pase no depende de lo que haya en la carpeta del repo (otra sesión puede tener cambios sin guardar ahí, y no se tocan).
- Resolver conflictos "a ojo" durante un pase. Si algo no cierra solo, se frena y se le explica a Santiago.
- Seguir si Santiago no dio el OK del paso C5, aunque lo haya dado para un pase anterior.

### C1 — Inventario (solo lectura)

```bash
git fetch origin -q
git rev-list --count origin/main..origin/dev
git log --reverse --first-parent --format='%h|%ad|%an|%s|%(trailers:key=Sesion,valueonly,separator=%x2C)' --date=format:'%d/%m %H:%M' origin/main..origin/dev
```

Y el tablero: `list_sessions {group: <✅>}`, `{group: <🧪>}`, `{group: <🛠️>}`.

Armar una tabla **en el orden de git (del más viejo al más nuevo)**, un renglón por cambio, con su estado:

| Estado | Regla |
|---|---|
| ✅ aprobado | la línea `Sesion:` coincide con una sesión del grupo ✅. Comparar **sin íconos de estado** de ningún lado: la línea guarda el título del momento del commit y a veces trae 🛠️/🧪/✅ adelante (p. ej. `Sesion: 🧪 Perfil colaborador…`). Si la sesión se renombró después, buscar por palabras del título |
| 🧪 sin probar | la sesión está en 🧪 o en 🛠️ |
| 📦 ya archivada | la sesión está archivada (`list_sessions {include_archived: true}`): contar como aprobada solo si Santiago lo confirma |
| ❓ sin dueño | sin línea `Sesion:`, o de otro autor (el CTO): mostrar el mensaje y preguntarle a Santiago. Cambios de solo documentación (skill, `docs/`) se proponen como ✅ |

Los deploys de dev que todavía están corriendo (`conclusion` vacío) no cuentan como verdes: esperar a que terminen antes de fijar el corte.

Commits de merge: con `--first-parent` cada merge aparece como un renglón que trae su rama entera; su estado es el peor de los cambios que trae (`git log --format='%h %s' <merge>^1..<merge>^2`).

**El orden no se elige**: es el orden en que los cambios entraron a dev. "Ordenar" es mostrar la fila y encontrar hasta dónde se puede llegar.

### C2 — Punto de corte

Recorrer la tabla de arriba hacia abajo. El **corte ideal** es el último renglón antes del primer cambio que no es ✅. Si todo es ✅, el corte es la punta de `origin/dev`.

Después, **el corte tiene que ser un estado que haya estado desplegado en dev con el deploy en verde** (así es exactamente lo que se probó):

```bash
gh run list --workflow deploy.yml --branch dev --limit 60 --json headSha,conclusion,createdAt
```

Si el hash del corte ideal no figura con `success`, bajar al renglón anterior más cercano que sí figure. Ese es el **corte real**.

### C3 — Si quedan aprobados atrapados después de algo sin probar

Pasa cuando la fila es, por ejemplo, `✅ ✅ 🧪 ✅ ✅`: los dos últimos ✅ no pueden pasar sin llevarse el 🧪. Opciones para ofrecer a Santiago, en este orden:

1. **Pase parcial**: subir hasta el corte real y el resto espera. Lo más seguro, y lo que se recomienda por defecto.
2. **Probar lo que traba**: Santiago prueba el 🧪 del medio. Si anda, pasa a ✅ y se rehace el inventario (C1).
3. **Sacar lo que traba de dev**: `git revert` de esos cambios en una rama tomada de `origin/dev` → push a `dev` → deploy en verde → **test obligatorio** (que lo aprobado siga andando y lo sacado ya no esté) → recién ahí el nuevo corte es la punta de dev. Lo sacado vuelve más adelante con `git revert <hash del revert>` y otra vuelta por 🧪. **No se puede** si lo que traba incluye una migración de base: la base de dev ya la tiene aplicada y revertir el archivo rompe el orden de las migraciones. En ese caso solo quedan las opciones 1, 2 o 4.
4. **Llevarlo sin probar**: solo si Santiago lo acepta explícitamente, nombrando qué va sin probar.

Si el `git revert` da conflicto: frenar, no resolver a mano, explicarle a Santiago y quedarse con la opción 1.

### C4 — Chequeos antes de pedir el OK (todos tienen que dar bien)

```bash
C=<hash del corte real>
git merge-base --is-ancestor origin/main $C && echo "OK avanza en línea recta"
git merge-base --is-ancestor $C origin/dev  && echo "OK el corte está en dev"
git diff --name-only origin/main $C -- 'migrations/*.sql'
git diff origin/main $C -- 'migrations/*.sql' | grep -inE '^\+.*(DROP (TABLE|COLUMN)|ALTER COLUMN .* TYPE|SET NOT NULL|DELETE FROM|TRUNCATE|RENAME)'
git diff origin/main $C -- server shared lib | grep -oE '^\+.*process\.env\.[A-Z_]+' | grep -oE 'process\.env\.[A-Z_]+' | sort -u
git grep -ohE 'process\.env\.[A-Z_]+' origin/main -- server shared lib | sort -u
```

1. **Línea recta**: si `origin/main` no está dentro del corte, alguien subió algo a producción por fuera de dev (el CTO). Frenar: primero llevar eso a dev (merge de `origin/main` en una rama de `origin/dev` → push a dev → test) y rehacer desde C1.
2. **Migraciones**: listar cada una con qué hace, en criollo. Si alguna es **destructiva** (borra tablas o columnas, cambia tipos, pone obligatorio un campo con filas, borra datos), marcarla ⚠️ y exigir antes del OK la confirmación de que **producción tiene backup** (pendiente con el CTO, cap. 04). Sin backup confirmado, una destructiva no pasa.
3. **Variables nuevas del servidor**: comparar las `process.env.X` que aparecen en el pase contra las que ya usaba `main`. Cada variable nueva (p. ej. `VAULT_KEY`, las de ARCA, `GOOGLE_CLIENT_ID`) tiene que estar cargada en el `.env` de producción por el CTO **antes** del pase; si no, avisar qué función no va a andar o si el server puede no arrancar, y dejar que Santiago decida.
4. **CI en verde** para el hash del corte (dato de C2).

### C5 — Resumen y un solo OK

Mensaje corto para Santiago:

- **Va a producción** (por sesión, en orden): qué cambia en palabras simples, fecha en que entró a dev.
- **Cambios de base**: cuáles, qué hacen, ⚠️ si alguna es destructiva.
- **Hace falta del CTO antes**: variables nuevas o backup, si corresponde.
- **Queda en dev** y por qué (sin probar, sin dueño, atrapado detrás de algo sin probar).
- **Sesiones que se archivan** después del pase.

Cerrar con la pregunta exacta: *"¿Hago el pase a producción hasta `<hash>` y archivo A, B y C?"*. Sin un sí a esa pregunta, no se sigue.

### C6 — Subir

```bash
git fetch origin -q
git merge-base --is-ancestor origin/main $C && git merge-base --is-ancestor $C origin/dev   # repetir: nadie movió nada mientras se esperaba el OK
git push origin $C:main          # sin --force. Si lo rechaza: frenar y volver a C1
gh run list --branch main --limit 1
gh run watch <id> --exit-status
```

- **Falla el job de tests**: no se desplegó nada. Leer el log (`gh run view --job=<id> --log`), contarle a Santiago qué falló y no reintentar a ciegas.
- **Falla el deploy después de las migraciones**: producción puede haber quedado a medio camino. Avisar enseguida a Santiago para que llame al CTO (tiene el SSH). No pushear nada más a `main` hasta que el CTO confirme el estado.
- En cualquier falla, **no se toca el tablero**.

### C7 — Verificación en producción (solo lectura)

En https://finanzas.chimpance.digital, desde el Chrome real: abrir las pantallas que cambiaron y las vecinas, que carguen, y consola sin errores nuevos (`read_console_messages {onlyErrors: true}`). **No se cargan datos de prueba en producción** ni se dispara nada que salga del sistema (mails, facturas, calendario). Si el Chrome no tiene sesión en producción, pedirle a Santiago que entre él (Claude no escribe contraseñas) o que haga el chequeo con la lista de pantallas. Captura de evidencia con `SendUserFile`.

### C8 — Cierre

1. `git rev-list --count origin/main..origin/dev` → lo que quedó en dev (0 si fue pase completo; si no, tiene que coincidir con lo que se dijo en C5).
2. Archivar **solo** las sesiones con todos sus cambios en `main` (`git merge-base --is-ancestor <hash> origin/main` para cada uno):
   - Sesión **quieta** (`isRunning: false`) → `mcp__ccd_session_mgmt__archive_session`.
   - Sesión **todavía trabajando** o con cosas sin subir → no se archiva: `move_sessions` al 🛠️ y su ícono en el título.
   - Si la herramienta rechaza alguna (abierta en pantalla, fijada, a mitad de turno): dejarla donde está y avisar cuál.
   - Sesión con **parte** de sus cambios en `main`: se queda en ✅ con lo que falta.
3. Actualizar la memoria (`project_chimpa_finanzas.md`: qué quedó en producción, hasta qué migración) y los capítulos del skill que decían "en dev" (07, 08, 09, 04…), copiar el skill al repo y subirlo a dev (Paso A).
4. Mensaje final corto: qué quedó en producción, qué quedó en dev esperando y por qué.

## Paso D — Sesiones sin código (análisis, diseño, auditoría, consulta)

No pasan por dev ni por 🧪/✅. Cuando el entregable está hecho, al cerrar la tarea preguntar: *"¿La archivo?"*. Si queda algo por decidir, se anota en el cap. 04 antes de archivar.

## Pausadas (⏸️) — qué cuidar

- **Pausar no saca el código de dev.** Si la sesión ya había subido algo a `dev`, eso sigue en la fila de `dev` y cuenta como **no probado** al elegir el punto de corte del pase. Por eso en el **Paso B** y el **Paso C** se revisa también el grupo ⏸️: los commits de una pausada (buscar por la línea `Sesion:` en `origin/main..origin/dev`) se tratan igual que los de una 🧪 — el corte no puede pasar por encima de ellos sin avisarle a Santiago.
- **Pausar a pedido** ("pausá esta", "dejala en pausa"): `move_sessions` al ⏸️ + ícono `⏸️` en el título + una línea en el mensaje con **por qué** quedó en pausa y **qué hace falta para retomarla**. Si lo que falta es una decisión de Santiago, anotarlo también en el cap. 04.
- **Retomar**: al volver a trabajar en una pausada, Paso 0 la manda al 🛠️ (o al 🧪 si lo único pendiente era la prueba de Santiago).
- **No es un archivo**: si una pausada lleva semanas sin moverse, en el Paso B preguntar si se retoma o se archiva.

## Historial de pases

- **12/9/2026** → `e2b0894`: 66 commits, migraciones 0007–0014.
- **14/9/2026** → `3761731`: 84 commits (DS Selva señalizada completo, seguridad + CRM, ARCA, tarjetas y ámbito personal, IVA/notas de crédito, Registrar movimiento unificado, logos, correcciones), migraciones 0015–0017, todas aditivas. Pase completo: `dev` quedó igual a `main`. Se archivaron 13 sesiones ✅; "Solución de logos de clientes" quedó en ✅ porque estaba con un turno en curso.
- **15/9/2026** → `191139c`: 2 sesiones (Fuente de referido con subcategoría; CRM consulta completa del lead — sitio web+logo, consulta, notas, necesidades por IA), migración 0018 (aditiva, 3 columnas nullable en `crm_leads`). Caso C3: la Auditoría UX fase 0.1 (sesión "Auditoria UX COMPLETA", sin probar) había entrado a dev *antes* que las dos aprobadas y las bloqueaba; se sacó con `git revert` en una rama de `origin/dev` (push + deploy verde + test) y recién ahí el corte quedó en la punta de dev. La auditoría vuelve más adelante con su propia vuelta por pruebas. Se archivaron las 2 sesiones ✅.
- **25/9/2026 (mediodía)** → `0012f19`: "Medir la demo del cliente (otro dominio)" (growth.js `data-demo` + `?chv=`, código de la demo en lead y oportunidad, link de la demo en Enviar propuesta, fila de la demo en la historia) + docs del skill. Sin migraciones ni variables nuevas. Mapas (🛠️/🧪, ~16 commits mezclados antes y después) se sacó con UN commit en un worktree de `origin/dev` que deja sus archivos como en `main` (sin migración que revertir: la 0044 ya estaba en producción) → deploy verde → test en dev → **enseguida `git revert` en dev (`50f93ea`)**. El push a `main` lo frena el clasificador de permisos ("Production Deploy"): lo corrió Santiago a mano (`git push origin <hash>:main`); el hash sigue en la historia de dev, así que se puede devolver Mapas antes de que él lo corra.
- **16/9/2026** → `8f8ef2e`: 1 sesión ("Aviso de pendiente al entrar a un lead": la lista de Leads preguntaba "¿Descartar el lead nuevo?" al entrar a cualquier lead, porque `String(null)` daba "null" en el control de cambios del alta) + 3 commits de documentación del skill. Sin migraciones ni variables nuevas. Caso C3 con la regla mecánica: 3 commits de Growth de la sesión 🧪 "Growth: formularios de clientes en lista + recorrido del lead" (4565ecf, 67a1f2f, 34f0e22) estaban antes; se revirtieron en un worktree de `origin/dev` (push + deploy verde + test), se pasó, y **enseguida se volvieron a aplicar en dev** (revert de los reverts) para que la sesión 🧪 siga probable. Variante nueva: si lo que traba está en 🧪 (no en 🛠️), se reaplica en dev apenas termina el pase; así el tablero no miente.
- **16/9/2026 (tarde)** → `8e4ca47`: "Nuevo lead con web, empresa y contacto" (Empresas del CRM, migración 0020) + migración 0019 de ARCA sola (4 columnas nullable en `invoices`) + docs del skill. Adelante estaban sin probar la factura electrónica ARCA (sesión en 🛠️ trabajando, con migración 0019) y 3 arreglos de Growth (🧪). Como lo que trababa traía migración, se le preguntó a Santiago y eligió **sacar el código y dejar la migración**: un solo commit en un worktree de `origin/dev` con `git revert --no-commit` de los commits de código (el choque en `_journal.json` se resolvió tomando la versión de dev, porque la migración se queda) + `git checkout origin/dev -- migrations/0019* migrations/meta/_journal.json shared/schema.ts`; diff contra `main` = solo lo aprobado + migraciones. Push a dev → CI verde → test en dev (Empresas del CRM anda, la ruta de ARCA ya no existe) → pase → verificación en producción solo lectura → **enseguida `git revert` del commit del pase en dev** (`1e7c970`) para devolver ARCA y Growth. Ojo: la sesión de ARCA siguió subiendo mientras tanto (hubo que rehacer el revert dos veces con sus commits nuevos): antes de pushear, `git fetch` y comparar `origin/dev` con la base del revert.
- **16/9/2026 (noche)** → `f5be5a5`: "Facturación ARCA bugs" (factura electrónica ARCA: "Cobrar → Facturar" abre la factura de la cuenta, tipo A/B según la condición IVA del cliente, CAE por el punto de venta 2 en pesos, PDF con QR, NC por ARCA; concepto para facturar por proyecto, solo o con el mes; migración 0021 aditiva) + docs del skill de "Nuevo lead con web, empresa y contacto". El commit que había devuelto ARCA a dev (`1e7c970`) traía también los 3 arreglos de Growth (🧪): se sacaron con `git revert` de sus commits de reapply (520693f, 5049ddc, 494e7a1) en un worktree de `origin/dev` (`66d2f0e`; auto-merge limpio en `routes.ts` y `crm.routes.ts`; diff contra `main` = solo ARCA), + el concepto encima, push → CI verde → test en dev contra el ARCA de prueba → pase → verificación en producción solo lectura (`/api/arca/facturacion` = produccion, PV 2, CUIT Chimpancé; Aapresid con botón Facturar) → **enseguida `git revert 66d2f0e` en dev** para devolver Growth. Desde este pase **producción emite facturas REALES ante ARCA** (marca `.arca/wsfe-produccion` escrita por el deploy de main).
- **17/9/2026** → `6d41c79`: "Facturación ARCA bugs" (Crear tag con nombre repetido avisa y elige la existente, `2762b9c`; PDF de la factura con Ingresos Brutos, inicio de actividades y COD. 006, `cd3abd0`) + docs del skill + **migración 0022 sola** (4 columnas nullable en `crm_leads`, sin su código). Lo aprobado quedó entre trabajo sin aprobar: antes, Growth (`e8762dc`, 🛠️); después, "Mejoras tarjeta lead ERP" (`e409014` con la 0022, `c9fdd82`) y la tanda de duplicados (`8ce42c7`…`2efc6c0`, 🧪). Regla mecánica: un solo commit en un worktree de `origin/dev` con `git revert --no-commit` de los 9 commits de código + `git checkout origin/dev -- migrations/0022* migrations/meta/_journal.json shared/schema.ts` (diff contra `main` = solo lo aprobado + la 0022) → CI verde → test en dev → pase → **enseguida `git revert 6d41c79` en dev** (`c732927`, idéntico a `8620d43`). Ojo: los duplicados los hizo una sesión **bifurcada** de "Facturación ARCA bugs" que siguió firmando `Sesion: 🛠️ Facturación ARCA bugs`: el trailer no alcanzó para saber de quién era cada commit, hubo que mirar el tablero y el contenido.
- **19/9/2026 (noche)** → `aa4c311`: **pase completo** de 70 commits, migraciones 0025–0032 (push, LinkedIn del contacto, deudas abiertas, personas, envío individual de propuestas, estado del proyecto, propuesta sin lead, reporte semanal), todas aditivas. Aprobadas: Deudas con intereses y pagos parciales, Proyección financiera, Tablas + Tableros, LinkedIn en contactos, App Android. **Sin probar por Santiago, con su OK explícito ("confío en que está ok, pasales", opción C3.4)**: Growth OS Personas y envío de propuestas (fases 1 y 2), Estado del proyecto (Fase 1) + Reporte semanal, Propuestas del lead (revisión + las dos pausadas), Chimpa IA flotante solo cara y chat que arranca en limpio. Como había 8 migraciones intercaladas entre 6 sesiones, se descartó la regla mecánica (revert) y se fue a pase único con dev congelado y en verde. Las `VAPID_*` no bloquean: si faltan, `push.service.ts` genera las claves y las guarda en la base. **No se archivó nada** (pedido de Santiago, "por las dudas"): las sesiones siguen en el tablero aunque su código ya está en producción. Pendiente en producción: la **carga inicial de Personas** (`POST /api/crm/people/backfill`, manual y solo admin) no se corrió; `/crm/personas` está vacía hasta que Santiago la pida. Plan y control "que nada se pierda" en `Chimpa2026/plan-pase-produccion-2026-09-19.md`.

- **20/9/2026** → `6db63ef`: **pase completo** de 8 commits, **una sola migración (`0033`, aditiva**: 4 tablas de meeting polls + `pick_slot` en `client_action_kind`). Sube Coordinar reunión / Meeting Polls (Fase 4), el Espacio del cliente Fase 3 (Estado dentro del enlace de revisión), la fase nueva que nace visible, el arreglo del link absoluto del mail de invitación, 27 tests de permisos y filtraciones, y el APK Android de otra sesión (solo `android/`). Tres cosas de este pase que conviene repetir: **(1)** la migración se probó **sobre una base puesta exactamente como producción** (se extraen las migraciones de `origin/main` con `git archive origin/main migrations | tar -x -C <tmp>`, se aplican con un config temporal *dentro del repo* —desde afuera `drizzle-kit` no resuelve su propio módulo—, y recién ahí se corre `drizzle-kit migrate` con las de dev: tiene que aplicar solo la nueva). Es el chequeo que hay que hacer siempre que la migración toque un enum, porque `ALTER TYPE ... ADD VALUE` adentro de una transacción solo es seguro en PostgreSQL 12+. **(2)** La **Fase 3 subió sin que Santiago la probara**: estaba en 🧪 y sus commits venían ANTES de los de la Fase 4, así que separarlas pedía cherry-pick (prohibido). Se le avisó en el checkpoint y aprobó igual. Cuando algo en 🧪 queda atrapado abajo de algo aprobado, esa es la conversación que hay que tener, no una maniobra de git. **(3)** Lo que se verifica en producción no es que lo nuevo ande, sino **que lo viejo no cambió**: acá lo que importaba era abrir un enlace de revisión de un cliente REAL (Nueva Web NM, 23 comentarios) y comprobar que se sigue viendo igual, porque sin Estado cargado la sección nueva ni aparece. Vuelta atrás = `aa4c311`, solo código: la migración es aditiva y no se revierte.

- **20/9/2026 (noche)** → `4e5a4f1`: **Recordarle a los que faltan** (botón en la matriz de la coordinación) + migración `0034` (dos columnas en `meeting_poll_participants`, aditivas) + los dos capítulos del skill. **Caso C3 con la regla mecánica**: 6 commits de la sesión 🧪 "Diseño mejorado para ERP UI Chimpa" (rediseño de la App del celular, el cambio de "plata" a "dinero" en toda la interfaz, y la propuesta app-cimientos del DS) estaban ABAJO del recordatorio en el historial. Se revirtieron los 6 en un worktree de `origin/dev` (`4e5a4f1`, sin un solo conflicto), se comprobó que el diff contra `main` fuera **solo** el recordatorio, push a dev → CI verde → pase → verificación en producción solo lectura (endpoint `/remind` montado, tarjeta Coordinar reunión en un proyecto real) → **enseguida `git revert` del commit del pase en dev** (`95f99ca`), y se verificó que el árbol de dev quedara **idéntico** a como estaba antes (`git diff 32a8b92 HEAD` vacío): la sesión de la App no perdió nada.

- **20/9/2026 (cierre de etapa)** → `aeb96e4`: los dos arreglos que aparecieron al revisar la etapa antes de cerrarla, **sin migraciones** (delta de 2 commits, el otro es documentación). (1) El recordatorio chequeaba las reglas y escribía después: dos clicks casi simultáneos mandaban dos mails, gastaban los dos recordatorios y el segundo rotaba el token otra vez, así que el link del primer mail nacía muerto. Ahora se **reserva** con un UPDATE condicional que lleva las cinco reglas en el WHERE y rota el token en la misma operación (mismo patrón que el candado de `confirm`); si el mail no sale, el recordatorio se devuelve. (2) "Ya respondieron todos" miraba un ESTADO y no una transición: con todos respondidos, cualquiera que corrigiera su voto lo volvía a disparar. Ahora pide que esa persona no hubiera contestado antes **y** que no falte nadie. Verificado en producción con una coordinación interna en el proyecto propio de Chimpancé y `sendInvites:false` (cero mails): el aviso salió una sola vez y no se repitió con dos ediciones — eso mismo prueba que corre el build nuevo, porque el viejo lo habría repetido. Ojo con un detalle del CI: el commit intermedio (`c8396de`, solo docs) figura en rojo por un `tar` transitorio del paso de Deploy mientras corrían dos deploys juntos; tests y typecheck habían pasado y el push siguiente desplegó bien.

- **21/9/2026** → `0934e9a`: **pase completo** de 14 commits, **sin migraciones ni variables nuevas** (desde `927dd0f`, que es la vuelta atrás). Todo de sesiones ✅, con 🧪 y 🛠️ vacíos: Reunión F2 (pantalla del invitado, las dos matrices con la tabla estándar, resumen corto, tilde de "ya respondió", mail sin dos puntos), script de medición siempre listo para copiar en el recorrido del lead, textos de IVA sin la contadora, DS v1.10 (sección #app) y docs del skill. Verificado en producción solo lectura: matriz nueva en una coordinación interna cancelada del proyecto propio, Leads, Growth y `/app`, consola limpia. Ojo: tres `archive_session` los frenó el clasificador del modo automático (no se insiste: se le avisa a Santiago y las archiva él o da el permiso).

- **21/9/2026 (noche)** → `e08b443`: **pase completo** de 8 commits, **sin migraciones ni variables nuevas**, hecho **sin OK por pase** porque Santiago lo pidió así ("hacelo sin ninguna aprobación mía, dale rienda suelta"): ese pedido reemplaza el C5 solo para ese pase. Todo de sesiones ✅ (🧪 y 🛠️ vacíos): Reuniones "volver a escribirles" + recordatorios medidos contra la reunión (ventana corta, cuarto tono), DS v1.11 (capas `--z-*` y rincón de la cruz de cerrar), silueta al lado de "vos" en la grilla pública, docs del skill. Ojo con el historial de CI: cuatro deploys de dev intermedios figuran en rojo (tests, `Deploy: skipped`, la base no se tocó) porque la sesión de reuniones subió tests que fallaban y los fue arreglando en commits siguientes; solo cuenta el hash del corte, que estaba en verde con deploy hecho. Verificado en producción solo lectura: matriz de la coordinación interna cancelada del proyecto propio, la X nueva cierra sin pisarse con el chip "Cancelada", `--z-close`/`--close-gutter` en el `:root`, consola limpia; el botón "Volver a escribirles" no aparece en una coordinación cancelada (correcto) y no se creó ninguna para no mandar mails. Archivada una sesión; las otras dos las frenó el clasificador del modo automático (quedan en ✅ con el código ya en producción: Santiago las archiva).

- **25/9/2026 (tarde)** → `e1c70ff`: "Préstamo en el chat: cuentas con titular y QueVibra a su Overhead" (bug de producción: 3 «Galicia» iguales en la tarjeta del préstamo y la deuda de Chimpancé en silencio), sin migraciones ni variables nuevas, + docs del skill. Justo antes, Santiago había corrido a mano el pase de "Medir la demo del cliente" (`0012f19`): el sistema de permisos le frena a Claude el `git push origin <hash>:main` en algunas sesiones y en esta no. **Caso C3 con la regla mecánica**: Mapas (con Chimpa IA) y Comentarios en el mapa (🧪) estaban antes en la fila (`50f93ea` devolvía todo Mapas de una vez, `0b7a051`); sin archivos en común con el arreglo, así que `git revert --no-commit 0b7a051 50f93ea` en un worktree de `origin/dev` salió limpio (diff contra `main` = solo el arreglo + 2 capítulos del skill) → CI verde → chequeo del bundle servido (textos nuevos presentes, «submapa» ausente) → pase → verificación en producción solo lectura con el borrador real de Santiago (la lista muestra «Galicia · QueVibra / Chimpancé / Santiago (personal)», botón bloqueado sin titular) → **enseguida `git revert e1c70ff` en dev** (`bc54bd0`); dev quedó idéntico salvo un commit de docs que otra sesión subió en el medio. Truco útil cuando el Chrome no conecta: bajar el `index-*.js` servido (y sus chunks) con `curl` y buscar los textos nuevos.

## Casos borde

- **Sesión bifurcada (fork)**: la copia hereda el título y sigue firmando la misma línea `Sesion:`. Al bifurcar, renombrar la copia (p. ej. agregarle el tema) para que el inventario del pase no mezcle commits de dos sesiones distintas.
- **Una sesión que ya está en ✅ sube otro cambio a dev**: vuelve al 🧪 (lo nuevo no está probado).
- **Sesión que no subió nada**: nunca va a 🧪/✅.
- **Sesiones viejas de antes del tablero** (grupo `ERP CHIMPA`, 12/9/2026): se archivaron con OK de Santiago; `ERP CHIMPA` quedó vacío y no se usa más.
- **Retomar algo archivado**: se desarchiva desde la lista de Archivadas y vuelve al 🛠️ (Paso 0).
- **Commits del CTO en dev**: aparecen en el Paso B aunque no haya sesión en el tablero. En el pase son ❓ sin dueño: se le pregunta a Santiago antes de incluirlos (C1).
- **Commits del CTO directo en `main`**: el pase ya no avanza en línea recta (C4.1). Se llevan primero a dev y se testean.
- **Dos pases seguidos**: cada uno arranca de cero en C1; el OK de uno no sirve para el otro.
- **Varias sesiones abiertas a la vez** (desaconsejado, ver `05`): cada una recorre sola 🛠️ → 🧪; Santiago las pasa a ✅ a medida que prueba; el Paso C las archiva juntas.

### Pase a producción 22/9/2026 (commit `513b7e6`, pase COMPLETO, dev = main; OK de Santiago "manda a aprobado y subí a producción")

5 commits, sin migraciones ni variables nuevas. Sube (1) la tabla estándar y `HScroll` con `contain: inline-size` (flechas y columnas fijas adentro de diálogos y grillas; caso: matriz de reuniones con ocho invitados); (2) **Reunión: "Ver como lo ven ellos"** (`myUrl` en lista y detalle, botón secundario en la tarjeta y arriba del detalle; solo si estás invitado); (3) docs del skill (cap. 03, 07, 10). Verificado en producción solo lectura con el admin: matriz de Prome con "Confirmar este horario" fija a la derecha y flecha ›; `myUrl` null para el admin porque no está invitado (Santiago, con su usuario, sí lo está). Vuelta atrás = `e08b443`. Pendiente anotado en el cap. 04: vista de organizador para que el botón aparezca aunque no estés invitado.

### Pase a producción 22/9/2026 (2º, commit `fb1b258`, pase COMPLETO, dev = main; OK de Santiago "subí a producción")

4 commits, sin migraciones ni variables nuevas. Sube el **primer pantallazo del detalle de la coordinación**: barra de acciones (Confirmar el que más cierra, solo si alguien ya puede · Ver como lo ven ellos · Recordar a los N que faltan / al que falta · menú Más con volver a escribirles, links de cada uno y cancelar), "Faltan responder" como línea de nombres, y reenviar / anular por persona dentro de "Links de cada uno". Verificado en producción solo lectura con la coordinación de Prome (barra completa, 0 botones en Faltan responder, columna de acciones fija). Vuelta atrás = `513b7e6`.

### Pase a producción 22/9/2026 (3º, commit `9dc154a`, pase COMPLETO, dev = main; OK de Santiago "deployá lo que está en aprobado")

14 commits de 4 sesiones ✅, sin migraciones ni variables nuevas. Sube (1) **Diálogos del ERP: celular y escritorio**: ningún diálogo se sale de la pantalla en el celular, tablas que se desplazan solas, `HScroll` sin contarle su ancho al diálogo, en escritorio los diálogos usan el ancho que hay, Nuevo lead / Regla recurrente / Nueva empresa con campos de a dos y formularios largos en dos columnas cuando el panel da el ancho, escala de anchos de panel escrita en Decisiones del DS; (2) **buscador de Proyectos** también encuentra por nombre del cliente; (3) **link público del Estado del proyecto** (sección Compartir › El link del estado › "Armar el link" en la pestaña Estado; abre siempre en #estado, se crea sin etiqueta); (4) historial del 2º pase en el skill. Verificado en producción solo lectura con el admin: buscador con placeholder nuevo, diálogo Nuevo lead en dos columnas, botón "Armar el link" en Chungará (no se creó ninguno). Vuelta atrás = `fb1b258`. Archivadas: Diálogos, Buscador, Reuniones; la sesión "Link público del Estado del proyecto" quedó en ✅ porque el archivado fue bloqueado por el clasificador (archivarla a mano o en la próxima sesión).
- **24/9/2026 (tarde)** → `4dca787`: "Contacto referido: edición y LinkedIn" (Personas: traer foto y datos de LinkedIn, mails y teléfonos a mano). Pase completo, sin migraciones.
- **24/9/2026 (noche)** → `aba3d95`: misma sesión, foto de LinkedIn pegando el link de la imagen (`POST /api/crm/people/photo-from-url`, lo usan Personas, lead y contactos). Adelante estaba Mapas (🧪, sesión trabajando, migración 0044 aditiva): un commit en un worktree de `origin/dev` con `git revert --no-commit` de sus 5 commits de código + `git checkout origin/dev -- migrations/0044* migrations/meta/_journal.json shared/schema.ts` → CI verde → test en dev → pase → **enseguida `git revert aba3d95` en dev** (`473001d`, diff contra el estado previo = vacío). Producción tiene las tablas de Mapas vacías, sin su código. Gotcha: el worktree necesita `node_modules` para `tsc`: junction con `New-Item -ItemType Junction` (el `mklink` desde bash falla) y borrarla con `cmd /c rmdir` antes de sacar el worktree, nunca con borrado recursivo.
- **25/9/2026 (mañana)** → `f88e3da`: "Préstamos: a qué cuenta entró el dinero" (migración 0045, solo agrega `financial_debts.disbursement_movement_id`). Adelante y atrás estaba Mapas (🧪): se sacó su código con un commit en dev armado en una carpeta aparte (árbol = `main` + lo aprobado; la migración 0044 ya estaba en producción), deploy en verde y test en dev, pase, y se devolvió Mapas con el revert `f5d378e` (dev quedó idéntico a antes). Queda en dev solo ese revert (Mapas, sin probar). OK de Santiago: "aprobalo y pasalo a producción".
