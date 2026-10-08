# 01 · Ambientes y operación

> **Actualizado el 29/9/2026: el ambiente local VOLVIÓ.** Son tres escalones: **local → dev-finanzas → producción**. Historia: hasta el 8/9 hubo dos locales (`:5000` "real" y `:5001` de práctica) y el schema se cambiaba con SQL manual, lo que hizo derivar las bases locales de la nube. El 8/9 quedó un solo local (`erp-local` :5001) + migración versionada. El 12/9 se dio de baja ese local y todo se probaba en dev-finanzas. El 29/9 se reactivó, porque el deploy de la nube se cayó por facturación de GitHub y sin local no había dónde probar nada; además el CTO puso "desarrollar y testear en local" como primer paso de su protocolo.

## La escalera (única forma de que algo llegue a producción)

```
LOCAL (:5001)            →   DEV-FINANZAS            →   PRODUCCIÓN (finanzas)
  se desarrolla y             banco de pruebas             la operación real
  se prueba acá               del equipo
  preview_start               git push origin HEAD:dev     git push origin <hash>:main
    {name:"erp-local"}        (TODO commit pasa por acá)   (cuando Santiago lo pide)
```

| | Local | Desarrollo / testing | Producción |
|---|---|---|---|
| URL | http://localhost:5001 | https://dev-finanzas.chimpance.digital | https://finanzas.chimpance.digital |
| Rama | lo que tengas editado en la compu | `dev` | `main` |
| Servidor | tu máquina, `npx tsx server/index.ts` | droplet del CTO, `/opt/chimpa-dev`, systemd `chimpa-dev`, puerto interno 5001 | droplet del CTO, `/opt/chimpa`, systemd `chimpa`, puerto interno 5000 |
| Base | `chimpance_local`, PostgreSQL 18 propio en el puerto 5433 | base dev del servidor | base real del servidor |
| Migraciones | las corrés a mano con `drizzle-kit migrate` | las corre el deploy de `dev` | las corre el deploy de `main` |
| Se puede romper | sí, es descartable | se evita (es el banco de pruebas del equipo); si pasa, se avisa y se arregla con otro push | **no** |
| Quién lo usa | solo vos, mientras desarrollás | Santiago y el equipo, para probar | la operación real |

### LA regla de oro

1. **Local primero.** Se desarrolla y se prueba en `localhost:5001` (`preview_start {name: "erp-local"}`).
2. **Después dev.** TODO commit pasa por la rama `dev` (`git push origin HEAD:dev`), **sin excepción**. No es por testing: es para que `main` y `dev` no diverjan (regla del CTO, 29/9/2026).
3. **Después producción.** `git push origin <hash de dev>:main` cuando Santiago lo pide. **Probar en dev NO es requisito**: es rutina de dos minutos y se hace sin ronda de confirmación. Lo único que se avisa antes, en una línea y sin frenar, es una migración destructiva (DROP, cambio de tipo, NOT NULL sobre tablas con filas) o una variable de entorno nueva.

**"Subilo directo a producción"** = los pasos 2 y 3 seguidos, en la misma corrida, sin frenar a probar. NO significa pushear a `main` salteando `dev`.

Nunca salteando dev, nunca directo a `main`.

## Lo que se dio de baja (no revivir)

**El ambiente local ya NO está de baja** (se reactivó el 29/9/2026): ver la sección "Trabajar en local" más abajo. El gate del CI sí sigue sin reproducirse en la compu: los tests los corre el CI en cada push, y si fallan no despliega.

**El 8/9/2026 — ambiente `erp-real` :5000** (base `chimpance_erp`) y base `chimpance_pruebas`: congeladas, los `.cmd` renombrados a `_deprecado_2026-09-08_*.cmd.txt`. Backups viejos de `chimpance_erp` en `G:\Mi unidad\Backups Chimpa-Finanzas\`. ⚠️ **Pendiente real**: confirmar con el CTO que la base de PRODUCCIÓN tenga backup automático en el droplet (cap. 04).

## Trabajar en local

**Levantarlo** (verificado funcionando el 29/9/2026):

1. Arrancar el cluster si no está: `"C:\Program Files\PostgreSQL\18\bin\pg_ctl" -D "C:\Users\santi\.chimpa-finanzas-db\data" -l "C:\Users\santi\.chimpa-finanzas-db\postgres.log" start`
   Ojo: desde la herramienta Bash ese comando **no devuelve el control** y se va a segundo plano; el cluster igual arranca. Verificar con `netstat -ano | grep 5433`.
2. Poner la base al día si quedó atrasada: `DATABASE_URL="postgresql://postgres@localhost:5433/chimpance_local" npx drizzle-kit migrate` desde el repo.
3. Levantar la app: `preview_start {name: "erp-local"}` → http://localhost:5001
4. Entrar con el usuario de prueba que crea el seed del proyecto.

**Las piezas**: PostgreSQL 18 dedicado en el puerto **5433**, datos en `C:\Users\santi\.chimpa-finanzas-db\data`; base **`chimpance_local`**; app en **:5001**; arrancador `C:\Users\santi\.chimpa-finanzas-db\dev-local.cmd` (setea `DATABASE_URL`, arranca postgres y corre `npx tsx server/index.ts`); entry `erp-local` en `C:\Users\santi\Downloads\Chimpa2026\.claude\launch.json` (está fuera del repo).

**Para probar la UI en local alcanza el navegador interno** (`mcp__Claude_Browser__*`) apuntando a `localhost:5001`: como el login es de la base local, no hace falta la sesión del Chrome. Eso vale SOLO para local; contra dev-finanzas sigue haciendo falta el Chrome real (ver más abajo).

**Gotcha**: el cluster de :5433 se cae solo cada tanto (falla de carga de DLL en Windows, cap. 03). Si el server tira `ECONNREFUSED :5433`, arrancar postgres otra vez y reiniciar el server de Node.

**Seguridad**: `dev-local.cmd` tiene la `OPENAI_API_KEY` en texto plano. Está fuera del repo, pero conviene rotarla y leerla de otro lado.

## Chequeos que no necesitan base ni server

| Chequeo | Comando | Para qué |
|---|---|---|
| Compila | `npm run build` | que el deploy no se caiga en el build |
| Tipos | `npx tsc --noEmit \| grep -c "error TS"` | comparar contra la cuenta del arranque de la sesión (**9 al 29/9/2026**, todos en `server/`, ver cap. 03): más que eso = introduje un error |
| Migración | `DATABASE_URL=postgresql://x@localhost/x npx drizzle-kit generate --name <tema>` | genera el SQL; NO toca ninguna base (la URL es de mentira, `drizzle.config.ts` solo exige que exista) |

Estos tres se corren siempre antes de pushear a `dev`, aunque el cambio ya se haya probado en local.

## Probar en dev-finanzas

**Sesión API** (curl con cookies). El usuario admin de dev lo crea el server con `ADMIN_PASSWORD` del `.env` del droplet: la clave la tiene Santiago/el CTO. **Nunca escribirla en el skill, en commits ni en archivos del repo**; pedirla en el chat y usarla solo en la shell.
```
curl -s -c ck.txt -X POST https://dev-finanzas.chimpance.digital/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"<clave de dev>"}'
curl -s -b ck.txt https://dev-finanzas.chimpance.digital/api/...
```
Borrar `ck.txt` al terminar.

**Navegador = Chrome real (Claude in Chrome, herramientas `mcp__claude-in-chrome__*`)**. Ahí **está siempre logueado el admin de dev** (verificado 12/9/2026: `/api/auth/me` → `admin`, rol `admin`). **Contra dev-finanzas no sirve el navegador interno** (`mcp__Claude_Browser__*`): ese no tiene la sesión y muestra la pantalla de "Entrar". Sí sirve para **local**, donde el login es de la base propia (ver "Trabajar en local"). Como el Chrome ya tiene la cookie, las llamadas a la API también se prueban desde la página con `javascript_tool` (`await fetch('/api/...').then(r=>r.json())`) sin pedir la clave. Playwright queda solo para capturas full-page largas.

## Test obligatorio antes de terminar (pedido de Santiago, 12/9/2026)

**Ninguna tarea del ERP se da por terminada sin este test.** Va después de que el deploy a `dev` termine en verde y **antes** de mover la sesión al 🧪 y de avisarle a Santiago. Si falla: se arregla, se vuelve a pushear y se testea de nuevo desde el paso 1. Nunca decir "listo" con un test en rojo o sin hacerlo.

1. **Pestaña propia en el Chrome**: `tabs_context_mcp {createIfEmpty: true}` → `navigate` a https://dev-finanzas.chimpance.digital. Confirmar la sesión con `javascript_tool` → `await fetch('/api/auth/me').then(r=>r.json())` tiene que dar `admin`. Si da `data: null`, avisar a Santiago que se deslogueó (Claude no escribe contraseñas en formularios).
2. **Confirmar que dev tiene la versión nueva**: recargar y chequear que aparece lo cambiado (un texto, una pantalla, un endpoint). Si no aparece, el deploy no llegó: no testear algo viejo.
3. **Camino feliz, como lo usaría Santiago**: recorrer el cambio por la interfaz (clics, completar formularios, guardar) con `browser_batch`. Verificar que el resultado **persiste** (recargar y que siga ahí) y que impacta donde tiene que impactar (saldos, listados, tablero, ficha).
4. **Bordes y errores**: obligatorios vacíos, valores inválidos, montos con coma/punto argentino, fechas DD/MM, lista vacía. Si el cambio toca permisos, chequear también lo que ve un rol no admin (por API o preguntando).
5. **Regresión**: abrir las pantallas vecinas que usan los mismos archivos/tablas (p. ej. si se tocó obligaciones: Resumen, Cobros y pagos, Proyectos) y confirmar que cargan sin errores.
6. **Consola y red**: `read_console_messages {onlyErrors: true, pattern: "error|Error|failed"}` sin errores nuevos; las llamadas a la API del flujo con status 2xx.
7. **Celular** si se tocó UI: repetir lo principal en ancho de celular.
8. **Evidencia**: `computer {action: "screenshot", save_to_disk: true}` de la pantalla que demuestra que anda → mandarla con `SendUserFile`.
9. **Limpieza**: datos de prueba con nombre "PRUEBA – ..." y, si se puede, anularlos al terminar (VOID o soft delete; nunca tocar datos de otros). Cerrar la pestaña propia (`tabs_close_mcp`).

**Cuidado con lo que sale del sistema**: mails a clientes (p. ej. Importar reunión), eventos de Google Calendar/Meet, facturas en ARCA, WhatsApp. En el test **no se disparan contra destinatarios reales sin preguntarle antes a Santiago**: usar un destinatario propio de prueba, o frenar en el paso previo al envío y avisarlo.

**Reporte del test** (en el mensaje final, corto): qué se probó y anduvo ✅, qué falló y se arregló, y qué **no** se pudo testear y por qué ⚠️. Después, el guion de prueba para Santiago (cap. 10 › Paso A).

En **producción** (después de migrar) solo un chequeo de lectura: la pantalla cambiada carga y la consola no tira errores. No se cargan datos de prueba en producción.

**Datos de prueba**: se cargan en dev a mano o por API. Dev es compartido con el equipo: usar nombres reconocibles ("PRUEBA – ...") y no borrar lo que cargaron otros.

## Cambios de schema — la migración manda, NUNCA `drizzle-kit push`

`drizzle-kit push` y el SQL manual quedan prohibidos contra cualquier base (fueron lo que hizo derivar las bases viejas). Además no tenemos SSH: una base de dev rota la arregla el CTO. Orden correcto, siempre el mismo:

1. Editar `shared/schema.ts` (la verdad para el código).
2. Generar la migración versionada (ver tabla de arriba). `generate` compara `shared/schema.ts` contra `migrations/meta/<último>_snapshot.json`, no se conecta a nada.
3. **Revisar a mano el SQL generado**, porque Drizzle asume tablas vacías (y la base de dev y la de producción tienen filas):
   - `ADD COLUMN ... NOT NULL` sin default → convertir en: agregar nullable → `UPDATE` de backfill → `ALTER COLUMN ... SET NOT NULL`.
   - Cambios de PK → Drizzle deja un bloque comentado "can't get name for primary key": reemplazarlo por `DROP CONSTRAINT IF EXISTS "<tabla>_pkey"` antes de agregar la nueva PK.
   - `ALTER TYPE ... ADD VALUE` anda dentro de la transacción del migrator en PG ≥ 12 mientras el valor nuevo no se use en la misma migración.
   - Seeds e índices de performance que no estén declarados en `schema.ts`: agregarlos al final del archivo separados con `--> statement-breakpoint`.
   - Todo el archivo corre en UNA transacción: si algo falla no queda nada a medias.
   - **Destructivas** (DROP TABLE/COLUMN, cambio de tipo, NOT NULL sobre tablas con filas): avisar a Santiago qué se pierde ANTES de pushear a dev.
4. Commitear juntos `migrations/<n>_<tema>.sql` + `migrations/meta/<n>_snapshot.json` + `_journal.json` y el cambio de `shared/schema.ts`.
5. `git push origin HEAD:dev`. El CI la aplica primero sobre una **base vacía** (postgres:16) y corre los tests; si pasa, el deploy la aplica a la **base de dev**, que tiene filas (así se prueban los backfills).
6. Probar en dev-finanzas lo que usa las columnas nuevas.
7. Con OK de Santiago, `git push origin main`: la misma migración corre sobre producción.

Una migración por vez: dos generadas en paralelo se pisan el snapshot. `scripts/sql/` guarda los SQL manuales de la etapa vieja: son historia, no se aplican.

## Nube: droplet del CTO con CI/CD (desde el 1/9/2026)

El CTO (usuario GitHub `chimpadigialr`) montó en el repo `.github/workflows/ci.yml` (tests en PR) y `deploy.yml` (deploy en cada push a `dev` o `main`).

Qué hace el deploy: job de tests (postgres:16 limpio → `drizzle-kit migrate` → `npm run test:ci`; el typecheck corre pero no bloquea) → `npm run build` → tar sin `.env` → scp por SSH → `npm ci` + `drizzle-kit migrate` sobre la base del servidor → `systemctl restart` → health check por SSH al puerto local. **Si los tests fallan NO despliega.** Los secretos (`DATABASE_URL`, `SESSION_SECRET`, `OPENAI_API_KEY`, `ADMIN_PASSWORD`, `PUBLIC_BASE_URL`, `IP_HASH_SALT`, `PORT`, y desde el 8/9/2026 **`VAULT_KEY`** para cifrar los accesos del playbook — ver capítulo 08) viven en el `.env` del servidor, que el deploy no pisa; nosotros no tenemos acceso SSH, eso lo maneja el CTO. Documentos del CTO en el repo: `TESTS_PENDIENTES.md` y `TYPECHECK.md`.

Cómo operar desde acá:
- **Subir a dev**: `git push origin HEAD:dev` (lo que está en la rama de trabajo va a la rama `dev` remota). Si el push es rechazado por no ser fast-forward, NO forzar: ver qué hay en `origin/dev` que no tenemos (`git log HEAD..origin/dev`), integrarlo y volver a pushear.
- **Migrar a producción**: `git push origin <hash>:main` con un hash que ya está en `origin/dev`, cuando Santiago lo pide. Es rutina: **no se pide confirmación de nuevo** ni se exige que esté probado (protocolo del CTO, 29/9/2026). Sí se avisa en una línea si hay migración destructiva o variable de entorno nueva. `main` no puede llevar commits que no pasaron por `dev`; nunca cherry-pick, rebase ni force.
- Seguir el deploy: `gh run list --branch dev --limit 3` y `gh run watch <id> --exit-status` (gh está logueado como scastro-glitch). Logs de un job: `gh run view --job=<id> --log`. No avisarle a Santiago "ya está en dev" hasta que el deploy termine en verde.
- Traer lo del CTO: `git fetch origin` + `git merge origin/main`.
- Datos: cada ambiente tiene su base y NO se sincronizan. Copiar datos de producción a dev (o al revés) es una decisión puntual con Santiago y el CTO, nunca parte del flujo.

## Flujo de trabajo estándar para un cambio

1. `git status` limpio (o consciente de qué hay) + `git fetch origin`.
2. Editar código → si toca schema: `generate` → revisar el SQL (sección de arriba).
3. **Probar en local** (:5001): levantarlo, recorrer el cambio en el navegador y verificar que anda (sección "Trabajar en local"). Si toca schema, aplicar la migración a `chimpance_local` primero.
4. Chequeos en la compu: `npm run build` + conteo de `tsc`.
5. Commit en español + línea `Sesion: <título de la sesión>` + `Co-Authored-By: Claude` (cap. 10).
6. `git push origin HEAD:dev` → `gh run watch` hasta verde.
7. **Test en dev-finanzas** con el Chrome logueado como admin (sección "Test obligatorio antes de terminar"). Si falla, volver al paso 2. Con el test en verde: mover la sesión al grupo `🧪 ERP · En dev, falta que pruebe Santiago` → avisar a Santiago qué cambió, el reporte del test con la captura y el guion de prueba (cap. 10).
8. Cuando Santiago pide subir a producción: `git push origin <hash de dev>:main`, **sin volver a preguntar**. Si además probó y dio el OK, la sesión pasa de 🧪 a ✅ y se archiva (cap. 10).
8. Actualizar memoria/skill si cambió algo estructural.
