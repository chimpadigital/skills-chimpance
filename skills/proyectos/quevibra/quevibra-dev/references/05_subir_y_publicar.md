# 05 · Subir y publicar

Flujo vigente desde el 25/9/2026: **Claude programa en un worktree y sube a GitHub → Claude mergea con todo en verde (desde el 3/10/2026, pedido de Santiago; antes mergeaba él) → Santiago hace Pull y Publica en Replit → Claude verifica en producción**. Merge: `gh pr merge <N> --repo scastro-glitch/quevibra --merge` (permiso fijo en `~/.claude/settings.json`; otra forma del comando la frena el control de permisos). Excepción: PR que toca `shared/schema.ts` → OK de Santiago antes de mergear, porque el Pull aplica el esquema a la base de producción. Repo: `github.com/scastro-glitch/quevibra` (gh CLI logueado como `scastro-glitch`). No hay rama de desarrollo intermedia: cada tema va en su rama y entra a `main` por PR.

## Ramas

- Una rama por tema, creada desde `origin/main` actualizado (lo hace `nuevo-worktree.sh`): `feature/<tema>` para algo nuevo, `fix/<tema>` para un arreglo.
- Nunca se trabaja ni se commitea en `main`, ni en el clon `quevibra-main` (otra sesión puede estar ahí y cambiar de rama entre dos comandos tuyos: pasó el 30/9/2026 y un commit cayó en la rama equivocada).
- `git worktree list` muestra qué otras tareas hay abiertas. No toques los worktrees de otros.
- Si `main` avanzó mientras trabajabas: `git fetch origin && git merge origin/main` dentro de tu rama (merge, no rebase: así no hace falta forzar el push). Volvé a correr el chequeo después.

## Commit

```bash
cd "/c/Users/santi/Downloads/Que Vibra Cluade Code/GitRepo/qv-<tema>"
git status --short                      # revisá que todo lo que aparece sea tuyo
git add <archivo1> <archivo2> …         # por nombre, nunca -A ni .
[ "$(git branch --show-current)" = "feature/<tema>" ] && git commit -m "$(cat <<'EOF'
Ficha del evento: el botón Volver se puede tocar con el pulgar

Qué cambia para el usuario, en una o dos líneas.
Detalle técnico breve si ayuda a quien lea el historial.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```
- Primera línea en español, en términos de producto ("Agenda: …", "Scraper Eden: …", "Admin: …"), sin prefijos tipo `feat:` obligatorios (el historial mezcla los dos estilos; preferí el de producto).
- La línea `Co-Authored-By` va siempre (la que indique el sistema en esa sesión).
- Nunca entra `.env`, claves, `cookies.txt`, dumps de base ni capturas de datos personales.

## Push y PR

```bash
git push -u origin feature/<tema>
gh pr create --base main --head feature/<tema> --title "<igual que el commit principal>" --body-file <archivo con la descripción>
```
- **Siempre `--base main`.** Nunca un PR sobre otra rama de feature (mayo 2026: tres PR apilados, Santiago mergeó los tres y a `main` llegó solo el primero).
- Un PR por tema, completo y mergeable solo. Si un feature tiene partes (esquema + servidor + pantalla), van juntas en un PR, aunque sea grande: para Santiago importa que el merge sea simple, no que el PR sea chico.
- Después de abrirlo, vinculalo a la sesión (herramientas `ccd_pr`: `get_status` y, si no aparece, `bind_pr`).

### Descripción del PR (plantilla)

```markdown
## Qué cambia
[2-4 líneas en criollo, desde el usuario: qué ve distinto, qué problema resuelve]

## Cómo lo probé
- Chequeo automático: tipos 0 errores · N tests pasan, 0 fallas nuevas (M fallas viejas de main) · build OK
- En el navegador (local, datos reales de producción), celular 390/360 y compu:
  - ✓ [criterio 1]
  - ✓ [criterio 2]
- Controles de usabilidad: sin violaciones nuevas [o: lista]
- [capturas o descripción de la evidencia]

## Lo que no se pudo probar en local
- [qué] → [cómo lo verificamos en producción]

## Después de publicar
1. [lo que voy a verificar yo en quevibra.com.ar]
2. [si hace falta algo de Santiago: "apretar Ejecutar ahora en el scraper X"]

## Para tener en cuenta
[solo si aplica: cambia la base de datos / dependencia nueva / variable de entorno nueva / toca shared/ con OK de Santiago del <fecha>]

## Detalle técnico
[archivos principales y decisiones, breve]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## Lo que hace Santiago (un paso por mensaje)

Santiago no usa la terminal. Cada paso suyo va en un mensaje aparte, con el nombre exacto del botón, y se espera su respuesta antes del siguiente:

1. (Ya no se le pide: mergeás vos con todo en verde. Solo si toca `shared/schema.ts`: pedile OK y recién ahí mergeás.)
2. "En Replit, pestaña **Git**: apretá **Pull** (o **Sync changes**). Esperá a que termine (corre la instalación y actualiza la base solo). Contame si aparece algún error."
3. "Ahora **Publish** (o **Republish**). Avisame cuando diga que está publicado."
4. Recién con su "listo": verificación en producción (`03` › Después de publicar) y reporte.

- Si Replit muestra conflictos o errores en el Pull, **los resuelve Claude** en local y sube el arreglo; nunca se le pide a Santiago que resuelva un conflicto.
- Nunca le pidas a Santiago que use el agente de Replit para escribir código. Replit solo baja y publica.
- Replit a veces agrega commits propios a `main` ("Published your App", assets): por eso siempre se parte de `origin/main` recién bajado.

## Cambios en la base (`shared/schema.ts` o `server/schema/*`)

- Antes de tocar: OK explícito de Santiago (regla del repo), explicado en negocio ("para guardar la edad mínima de cada evento hace falta un campo nuevo en la base; no borra nada").
- No hay migraciones versionadas: al hacer Pull, Replit corre `npm install && npm run db:push`. Implicancias:
  - Agregar tablas o columnas que aceptan vacío: seguro.
  - Borrar o renombrar columnas, cambiar tipos, `NOT NULL` sin default sobre una tabla con filas: **drizzle pide confirmación interactiva** y el post-merge puede fallar o quedar trabado. No lo hagas sin plan: avisá antes y pensá la transición en dos pasos.
  - Columnas que se crean por SQL crudo al arrancar y no están declaradas en el esquema (`users.weekly_opt_out`) pueden aparecer como "a borrar" para `db:push`. Probá el push sobre la base de la tarea y mirá qué propone antes de subir (ver `06` › Esquema).
- Probá el `drizzle-kit push` en la base de la tarea (que tiene datos reales copiados) y anotá en el PR qué hace con las filas existentes.

## Conflictos

- Casi siempre son los **archivos de registro** que tocan todas las ramas: `server/index.ts` (imports + cron), `server/services/eventSyncService.ts`, `server/storage.ts` (listas de scrapers), `server/routes.ts` (`pickScraperFn`), `client/src/pages/Admin.tsx` (`SOURCE_LABELS`), listas de ciudades. Se resuelven **quedándose con los dos lados**.
- ⚠️ Excepción peligrosa: si dos ramas agregaron funciones copiadas de la misma plantilla (pasó con Rosario y Mendoza), git las entrelaza línea por línea y "quedarse con ambos" arma una función Frankenstein. Ahí: tomá el archivo de `main` entero e insertale el bloque completo de tu rama.
- Después de resolver: chequeo completo de nuevo.
- Prevención: **mergear apenas el PR está verde**. El 30/9/2026 se juntaron 6 PR abiertos y cayeron en conflicto en cadena.

## Documentación

Cuando se cierra un feature, se documenta en `docs/` dentro del mismo PR (regla del `CLAUDE.md` del repo). Si cambia algo de cómo se trabaja, actualizá este skill y la memoria.

## Cerrar la tarea

Con el PR mergeado y publicado y la verificación en producción hecha:
```bash
bash ~/.claude/skills/quevibra-dev/scripts/cerrar-worktree.sh <tema>
```
Si la sesión estaba en un grupo de la barra lateral, se puede marcar como completada.
