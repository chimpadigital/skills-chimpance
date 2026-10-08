# 02 · Ambiente local: dónde y cómo se prueba

Armado y verificado el 30/9/2026. Todo es **descartable**: si algo se rompe, se borra y se vuelve a crear. Producción no se toca nunca desde acá.

## Cómo está armado

```
C:\Users\santi\.quevibra-db\           PostgreSQL 18 PROPIO de QueVibra, puerto 5434 (no es el del ERP, que usa 5433;
                                      ni el del sistema, 5432). Lo creó Claude con initdb: no necesita la clave de admin.
   └─ base quevibra_plantilla          esquema de main + ~5.800 eventos reales copiados de la API pública de producción.
                                      NUNCA se le conecta un servidor (si no, no se puede copiar).
   └─ base qv_<tema>                   una por tarea, copia instantánea de la plantilla. Se rompe sin miedo.

GitRepo\quevibra-main\                 clon principal. NO se trabaja acá (puede haber otra sesión). Aporta node_modules y el .env base.
GitRepo\qv-referencia-main\            worktree solo lectura en origin/main: línea base para comparar tests.
GitRepo\qv-<tema>\                     worktree de cada tarea: su rama, su .env, su base y su puerto (5011+).
Que Vibra Cluade Code\.claude\launch.json   una entrada "qv-<tema>" por tarea para preview_start.
```

## Primera vez en una compu (o si se borró)

```bash
bash ~/.claude/skills/quevibra-dev/scripts/preparar-base-local.sh
```
Crea el cluster, el usuario `quevibra` (clave de prueba `quevibra`, solo local), la plantilla con el esquema de main y la carga de datos. Si el cluster ya existe, solo lo prende. **Después de reiniciar la compu el cluster queda apagado**: cualquiera de los scripts lo prende solo.

Refrescar los datos (eventos nuevos de producción): `preparar-base-local.sh --refrescar-datos` (copia nuevamente lo público; ~15 s). Las bases de tareas ya creadas no cambian.

## Cada tarea

```bash
bash ~/.claude/skills/quevibra-dev/scripts/nuevo-worktree.sh <tema> [rama]
```
- `<tema>`: corto y en criollo, con guiones: `ficha-volver-44px`, `scraper-passline-cero`.
- Rama por defecto `feature/<tema>`; para arreglos pasá `fix/<tema>` como segundo argumento. Si la rama ya existe (local o en GitHub), la reutiliza.
- Tarda ~40 s. Imprime el preview a usar.

Después:
```
preview_start {name: "qv-<tema>"}      → http://localhost:<puerto>
```
Todos los comandos (git, npm, tests) se corren **dentro de `GitRepo/qv-<tema>`**. Antes de cada commit verificá la rama en el mismo comando (ver `05`).

## Qué trae el `.env` de la tarea

Lo arma el script copiando el `.env` de `quevibra-main` y cambiando: `DATABASE_URL` (su base), `PORT`/`PUBLIC_BASE_URL` (su puerto), `CRON_ENABLED=false` (no corren scrapers, newsletter ni carrusel solos), `AUTH_MODE=simple`, **`TZ=UTC`** (producción corre en UTC: con la hora argentina de la compu los errores de horario no se ven; ver `06` › Fechas), y **claves de Google de mentira** (`local-sin-google.apps.googleusercontent.com`). Esto último no es decorativo: sin `GOOGLE_CLIENT_ID` el servidor no monta las sesiones y nadie puede loguearse (ver `06` › Auth). El botón "Ingresar con Google" en local lleva a Google y falla: es esperable.

Las claves reales (OpenAI, MailerSend, Meta, Object Storage) están vacías en local. Lo que depende de ellas no se puede probar acá: ver "Lo que NO se prueba en local".

## Loguearse en local (navegador interno)

La cookie de sesión es `Secure` y el local es `http`: el servidor solo la entrega si el pedido dice que viene por https. Por eso el login de la interfaz no "pega" en local, pero este atajo sí (verificado): ejecutalo con `mcp__Claude_Browser__javascript_tool` en una pestaña ya abierta en el `localhost` de la tarea, y después navegá.

```js
// Usuario común (dev-user-1, sin onboarding)
await fetch('/api/dev/login', {method:'POST', credentials:'include',
  headers:{'content-type':'application/json','x-forwarded-proto':'https'}, body: '{}'});

// Organizador (promueve al dev user si todavía no hizo el onboarding de usuario)
await fetch('/api/dev/login', {method:'POST', credentials:'include',
  headers:{'content-type':'application/json','x-forwarded-proto':'https'}, body: JSON.stringify({intent:'organizer'})});

// Admin del panel: usuario y clave son ADMIN_USERNAME / ADMIN_PASSWORD del .env de la tarea
// (valores de prueba locales; leelos del archivo y no los repitas en el chat). Base nueva = sin 2FA.
await fetch('/api/admin/login', {method:'POST', credentials:'include',
  headers:{'content-type':'application/json','x-forwarded-proto':'https'}, body: JSON.stringify({username:'…', password:'…'})});

// Salir
await fetch('/api/logout', {credentials:'include'});
```

- Comprobá con `await fetch('/api/auth/user',{cache:'no-store'}).then(r=>r.json())`.
- Para probar como **usuario nuevo** (onboarding, primer ingreso): el dev user arranca con `onboardingCompleted=false`. Para volver a cero: `UPDATE users SET onboarding_completed=false, welcome_guide_seen=false WHERE id='dev-user-1'` en la base de la tarea, o borrá sus filas.
- Para probar **anónimo**: otra pestaña sin login, o salir.
- Con curl (pruebas de API): `-H 'X-Forwarded-Proto: https'` en el login **y** en cada pedido, con un solo cookie jar (`-c/-b`).

## Si hay otras sesiones o agentes trabajando a la vez

El panel del navegador interno y la carpeta temporal (scratchpad) son **compartidos** entre sesiones y subagentes. Pasó el 30/9/2026: un agente navegó la pestaña de la preview de otro y le cambió la pantalla en medio de su prueba.
- Trabajá en **tu propia pestaña**: `tabs_create` (o la que te devuelve tu `preview_start`) y pasá siempre su `tabId`. Nunca navegues una pestaña que no abriste.
- Archivos temporales en una subcarpeta con el nombre de tu tarea (`scratchpad/qv-<tema>/`), no sueltos.
- Puertos y bases: cada worktree tiene los suyos; no levantes nada en el 5000 ni contra la plantilla.
- **Las cookies de `localhost` se comparten entre puertos**: si otra tarea se logueó, tu pestaña puede aparecer logueada sin que hagas nada. Para probar **anónimo** usá `http://127.0.0.1:<puerto>` (otro "sitio" para las cookies) en vez de deslogear a nadie.
- **Con el panel del navegador oculto, las esperas (`setTimeout`) dentro de `javascript_tool` se frenan** y la llamada puede cortar por tiempo: hacé consultas cortas, sin `await new Promise(setTimeout…)`; esperá con `computer {action:"wait"}`.
- `node_modules` es compartido (junction) y Vite guarda su caché ahí (`node_modules/.vite`). Con varias previews a la vez puede aparecer "Re-optimizing dependencies" o "Outdated Optimize Dep": recargá; si molesta, hacé `npm ci` propio en tu worktree (ver Dependencias nuevas).
- `chequeo-previo.sh` usa `qv-referencia-main` para la línea base. Si otra sesión lo está usando al mismo tiempo, podés apuntar a otro: `QV_REF_WT=".../GitRepo/qv-ref-<tema>" bash chequeo-previo.sh` (se crea solo).

## Celular de verdad (viewport)

El navegador interno sí emula celular (el problema de "viewport trabado en 1366" era de Claude in Chrome, ya no aplica):
```
mcp__Claude_Browser__resize_window {tabId, width: 390, height: 844}   // iPhone 12-14
mcp__Claude_Browser__resize_window {tabId, width: 360, height: 640}   // Android chico: donde se cortan las cosas
mcp__Claude_Browser__resize_window {tabId, preset: "desktop"}          // al terminar
```
Con ancho < 768 además simula touch y user-agent de Android (las pantallas cambian a su versión mobile). Recargá después de cambiar el tamaño. El tamaño se resetea al terminar cada turno: volvé a fijarlo en el turno siguiente.

## Datos de prueba

- La plantilla trae categorías, tags, audiencias y los eventos activos de producción de ese momento (sin funciones múltiples ni organizadores reales: `organizer_id` queda vacío).
- **Las fechas envejecen**: los eventos de la plantilla son los futuros del día en que se cargó. Si la plantilla tiene más de una semana, refrescala antes de probar cosas de "hoy / este finde".
- Para casos puntuales (evento sin foto, título larguísimo, gratis, sin hora, ciudad sin eventos), creá los datos en la base de la tarea con SQL o con el admin local. Nunca en producción.
- Imágenes: las de eventos de scrapers son URLs externas y se ven. Las `/cdn/...` (subidas o espejadas en Object Storage) **no se ven en local** (no hay Object Storage): no es un bug de tu cambio.

## Lo que NO se prueba en local (y qué hacer)

| Qué | Por qué | Cómo cubrirlo |
|---|---|---|
| Subir imágenes (logo, foto de evento, foto custom del generador) y servir `/cdn/...` | Object Storage es de Replit | Test unitario del armado + verificación en producción después de publicar, con OK de Santiago para crear algo de prueba |
| IA (visión de flyers, clasificación con OpenAI, copys con Claude) | Sin claves en local | Tests con mocks (ya hay muchos en `server/tests/`); en producción, probarlo desde el admin |
| Emails reales (verificación, newsletter, baja) | Sin MailerSend | Las plantillas se testean con unitarios; el envío real, en producción con una casilla de Santiago |
| Login real con Google, One Tap | Claves de mentira | En producción, con la cuenta de Santiago, solo si el cambio toca el login |
| Publicar en Instagram/Facebook | Sin token de Meta | Producción, con OK explícito (publica de verdad) |
| Scrapers contra el sitio real | En local sí se puede correr un scraper a mano, pero el resultado no garantiza el de Replit (hay sitios que bloquean IPs de servidores, p. ej. AllAccess) | Probar parser con fixtures + corrida local + "Ejecutar ahora" en el admin de producción después de publicar |
| Caché de Cloudflare / edge, límite de 100 s | Solo existe en producción | Verificar headers (`Cache-Control`) y tiempos en producción |
| Crons | `CRON_ENABLED=false` en local | Llamar la función a mano; en producción mirar la corrida en el admin |

Todo lo que caiga en esta tabla se nombra en el PR y en el reporte a Santiago como "no probado en local", con el plan de verificación.

## Dependencias nuevas

`node_modules` es un junction compartido con `quevibra-main` (y con las otras tareas). Si la tarea agrega o actualiza un paquete:
1. En tu worktree: borrá el junction (`rm node_modules` — borra el enlace, no la carpeta original) y corré `npm ci` (~1 min) para tener uno propio.
2. Instalá ahí el paquete. Nunca corras `npm install` sobre el junction: cambiaría el de todos.
3. Mencioná la dependencia nueva en el PR (Replit corre `npm install` al hacer Pull).

## Cerrar la tarea

Cuando el PR está mergeado y publicado:
```bash
bash ~/.claude/skills/quevibra-dev/scripts/cerrar-worktree.sh <tema>
```
Borra el worktree (si no tiene cambios sin commitear), la base `qv_<tema>`, la entrada de `launch.json` y la rama local (la de GitHub queda). Pará antes el preview (`preview_stop`).

## Si algo del local falla

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| `password authentication failed for user "quevibra"` | `.env` apunta al Postgres del sistema (5432) en vez del propio (5434) | Usá el `.env` que arma `nuevo-worktree.sh` |
| `connection refused` en 5434 | Cluster apagado (reinicio) | `preparar-base-local.sh` lo prende |
| `/api/dev/login` → 500 "Dev login failed" | Sin `GOOGLE_CLIENT_ID` no hay sesión | Revisá que el `.env` tenga las claves de mentira |
| Login 200 pero `/api/auth/user` → null | Faltó `x-forwarded-proto: https` | Repetí el login con el header |
| `CREATE DATABASE … TEMPLATE` falla "being accessed by other users" | Algo quedó conectado a la plantilla | Cerrá esa conexión; nunca levantes un server contra la plantilla |
| La pantalla queda verde con manchas | Splash (~1 s) o la compu cargada compilando | Esperá 3-5 s; la primera carga de Vite es lenta |
| La pantalla queda en blanco | Error de render en una ruta lazy (`Suspense fallback={null}`) | Mirá la consola (`read_console_messages`) |
| Logs del server ilegibles | El logger imprime respuestas JSON enteras | `preview_logs` con `search` o `level:"error"` |
