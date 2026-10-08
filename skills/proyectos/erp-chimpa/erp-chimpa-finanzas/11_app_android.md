# 11 · App Android (PMV) y avisos push

> Creado el 17/9/2026 (sesión "App Android MVP finanzas"). En dev desde ese día; falta que Santiago pruebe y, con OK, el pase a producción.

## Qué es

No es una app aparte: es **la web del ERP en modo App** (`/app`) + **avisos push reales** + un **APK de Android** (Trusted Web Activity) que abre `/app` a pantalla completa. Decisiones de Santiago (17/9): APK propio (sin Play Store por ahora), avisos de todo + lead nuevo + tarea asignada a quien tenga la sesión iniciada, para todo el equipo (cada rol recibe solo lo que puede ver).

## Pantalla `/app` (`client/src/pages/app/MobileApp.tsx`) — rediseñada el 20/9/2026

Se monta en `App.tsx › AppShell` antes del shell autenticado (sin sidebar ni header del ERP).
**Cimientos, razones y maquetas: `docs/design-system/propuestas/app-cimientos/`** (propuesta visual +
`SPEC.md`), aprobados por Santiago el 20/9/2026. El alcance no cambió (dinero, registrar, avisos):
cambió la cáscara, la jerarquía y los textos.

**Cuatro destinos y el + al medio** (`ds-bnav`): **Dinero · Día · [ + ] · Chimpa IA · Avisos**.
La barra se arma según el rol (`navSlots`) y ninguna pantalla prohibida es alcanzable: si el rol no
tiene esa pantalla, la ruta redirige a la primera que sí.

- **Barra de arriba, 52 px** (`ds-abar`): iso · nombre de la pantalla en una palabra · campana con el
  contador (o "Marcar leído" en Avisos) · avatar. El avatar abre una hoja (`BottomSheet`) con
  **Abrir el ERP completo**, el tema y **Salir de la cuenta**.
- **Dinero** (`/app`): titular primero (chips, se recuerda en `chimpa:app:owner`), **una sola cifra
  grande** (En cuentas), por cobrar y por pagar como apoyo (`ds-duo2`), y los movimientos en filas de
  60 px (`ds-arow`) **agrupadas por día** (Hoy · Ayer · 14 de septiembre). Solo roles que ven dinero.
  `GET /api/analytics/dashboard?owner=`.
- **Día** (`/app/dia`): salió de adentro de Resumen. Veredicto de tres números (vencidas en naranja,
  para hoy, reuniones — `ds-vdict`) y las primeras seis cosas. `GET /api/today?limit=8`.
- **Chimpa IA** (`/app/chimpa`): el `AgentChat variant="page"` como destino propio (antes estaba
  enterrado abajo de los botones de Registrar).
- **Avisos** (`/app/avisos`): la tarjeta de push es una **fila** con el estado escrito que abre una
  hoja; la lista se separa en "Sin leer" y "Antes". La invitación a activar avisos **ya no ocupa la
  portada**: si falta el permiso, la campana de arriba lleva un punto.
- **El `+`** abre `QuickActionSheet` (la hoja de las seis acciones que ya existía en el ERP y que la
  App no montaba), ahora en **dos columnas** (`ds-qgrid--2`). El formulario de registrar sigue siendo
  `RegistrarMovimientoDialog`, con su interruptor **Salió dinero / Entró dinero / Entre cuentas**.
- **`/app/registrar` redirige a `/app/chimpa`**: los avisos push viejos (`agente.borrador`) apuntan
  ahí y tienen que seguir funcionando. **No sacar ese redirect.**
- **`/app?quick=`** (accesos directos de la PWA) ahora los atiende la App, no solo el ERP.
- Clases nuevas en `client/src/styles/ds-erp.css` (capa ERP, **no** en la guía todavía): `ds-abar`,
  `ds-bal`, `ds-duo2`, `ds-vdict`, `ds-alb`, `ds-aday`, `ds-arow`, `ds-qgrid--2`.
- Login: en `/app` "Recordarme" viene tildado. La sesión es `rolling: true` (desde 17/9 para TODO el
  ERP): vence por inactividad (24 h o 30 días con Recordarme), no a hora fija.

**La interfaz dice "dinero", no "plata"** (20/9/2026, en todo el ERP). No se tocaron las rutas
(`/api/plata/...`), la carpeta `components/plata/`, los `data-testid`, `localStorage` ni los tipos de
aviso del server (`plata.movimiento`, `plata.vencimientos`, `plata.cierre`).

## Push (Web Push estándar, sin Firebase)

- Tablas (migración `0025_push_notificaciones`): `push_subscriptions` (endpoint único, p256dh, auth, user_agent, last_success_at, fail_count), `push_vapid_keys` (una fila id=1: las claves se **generan solas por ambiente** si el `.env` no trae `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`; opcional `VAPID_SUBJECT`), `push_digest_log` (unique usuario+clave: evita repetir resúmenes aunque el server reinicie).
- `server/domains/push/push.service.ts`: `subscribe`, `unsubscribe`, `status`, `sendToUsers` (nunca lanza; 404/410 o 10 fallos seguidos → borra la suscripción), `claimDigest`, `MONEY_ROLES` = admin/operator/accountant.
- Endpoints en `/api/notifications/push/*` (ahí pasan todos los roles por los guards): `GET public-key`, `GET status?endpoint=`, `POST subscribe {subscription}`, `POST unsubscribe {endpoint}`, `POST test`.
- **Puente**: `notificationService.notify()` manda push de cada fila insertada, con la misma `tag` que el cartel de escritorio (`tipo:entidad:id` o `notificacion:<id>`), así no se duplican. Todo lo que ya avisaba la campana (feedback, tareas, menciones, leads de Growth, propuestas…) sale también al celular.
- `client/public/sw.js`: eventos `push` (muestra el aviso y avisa a las pestañas con `postMessage {type:"chimpa:push"}`) y `pushsubscriptionchange`. `client/src/lib/push.ts`: `pushSupport`, `enablePush`, `disablePush`, `syncPushSubscription` (al abrir la app), `sendTestPush`.

## Avisos nuevos (17/9)

| Tipo | Cuándo | A quién | Dónde |
|---|---|---|---|
| `lead.new` | lead cargado a mano (`POST /api/crm/leads`) o entrado por correo | equipo (admin/operator/sales); a mano sin quien lo cargó; por correo incluye a quien recibió el mail | `crm/leads/leadNotify.ts`, `crm.routes.ts`, `email.service.ts` |
| `task.assigned` | tarea confirmada desde el chat a nombre de otra persona | la persona asignada | `botIntakes.confirm` (antes solo avisaba el alta manual) |
| `plata.movimiento` | ingreso/egreso confirmado nuevo (cualquier camino), revisado cada 2 min | roles de plata menos quien lo cargó; más de 3 juntos → uno agrupado | `push/avisos.service.ts` (marca en memoria: lo cargado durante un reinicio no avisa) |
| `plata.vencimientos` | entre 8:30 y 12:00 AR, una vez por día | roles de plata | vencidas, hoy y mañana, por pagar y por cobrar |
| `plata.cierre` | entre 20:30 y 23:30 AR, solo si hubo movimientos | roles de plata | entró / salió / saldo en pesos |
| `agente.borrador` | borrador del Chimpa IA sin confirmar > 15 min (y < 24 h), una vez | quien lo armó | link `/app/registrar?agente=1` |

Relojes: `avisosService.start(log)` en `server/index.ts` (movimientos cada 2 min; programados cada 5 min).

## APK (`android/`)

- TWA con `androidbrowserhelper` 2.5.0, AGP 8.7.3, Gradle 8.9, compileSdk 35. Flavors: **dev** `digital.chimpance.finanzas.dev` "Chimpancé DEV" → dev-finanzas; **prod** `digital.chimpance.finanzas` "Chimpancé" → finanzas. Delegación de notificaciones + pedido de permiso Android 13+. Instrucciones para Santiago en `android/README.md`.
- Workflow **"APK Android"** (`.github/workflows/android-apk.yml`): corre en push a dev/main que toque `android/**` o a mano (Run workflow, input dev/prod/both). Si faltan los secretos, avisa y no arma (no queda en rojo). Artefactos `chimpance-dev-apk` / `chimpance-prod-apk`.
- **Firma**: keystore `C:\Users\santi\.chimpa-android\chimpance-release.jks` (alias `chimpance`), clave en `LEEME-clave.txt`, base64 en `keystore.b64`. **Nunca al repo.** Secretos a cargar en GitHub (Settings › Secrets › Actions): `ANDROID_KEYSTORE_B64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` (Claude no puede escribir secretos: lo hace Santiago). Si se pierde el keystore, hay que cambiar la huella en `assetlinks` y reinstalar la app.
- `GET /.well-known/assetlinks.json` (en `server/routes.ts`, antes de la sesión) declara los dos paquetes con la huella SHA-256 `81:BB:94:…:FE:0A`. Sin eso la app abre con barra de navegador.

## Probado en el celular de Santiago (19/9/2026, Samsung S25)

APK `chimpance-dev-apk` instalado a mano (run 35480324416; antes hubo que sacar el paquete viejo `tools`
del `setup-android` del workflow). Resultado:
- ✅ Abre **sin barra de navegador** (assetlinks OK), entra con la sesión, Resumen con datos reales.
- ✅ **El push llega con la app cerrada** y suena.
- ⚠️ **Lo muestra Chrome, no la app**: sale con la marca del navegador en vez del ícono Chimpancé. La
  delegación de notificaciones del TWA no se activó aunque el permiso del sitio se dio desde la app y
  `Chimpancé DEV` tiene las notificaciones habilitadas. Pendiente probar: borrar el permiso del sitio en
  Chrome (Configuración › Configuración de sitios › Notificaciones › el dominio › Borrar y restablecer) y
  volver a activarlo desde adentro de la app. **No bloquea nada**: el aviso llega, suena y al tocarlo abre la app.

**Las tres trampas que costaron la tarde** (revisar SIEMPRE en este orden si alguien dice "no me llegan"):
1. **Notificaciones de Chrome apagadas en Android** (Ajustes › Aplicaciones › Mostrar apps del sistema ›
   Chrome › Notificaciones). Chrome es quien recibe el push por debajo: si las tiene apagadas, Android lo
   descarta en silencio y el servidor igual lo da por entregado. **Fue la causa real.**
2. **Misma `tag` en todos los avisos**: Android reemplaza el anterior en el cajón y parece que no llegó
   ninguno. Por eso el aviso de prueba ahora lleva `push-test-<timestamp>` y la hora en el título.
3. **Prioridad**: `urgency: "normal"` deja que Android guarde el aviso hasta que el celular despierte.
   Todos salen con `urgency: "high"`.

**Diagnóstico incluido**: el service worker confirma cada push recibido (`POST /api/notifications/push/ack`
con `{tag, shown, error}`; se guarda en memoria, últimos 10 por persona) y se consulta con
`GET /api/notifications/push/ack`. Con eso se distingue "no llegó al aparato" de "llegó y Android no lo mostró".

## Diseño (rediseñado el 19/9/2026)

La primera versión era una pantalla de escritorio apretada en 400 px (se iba al costado). Se rehízo con los
patrones **Mobile** del DS: cabecera con `Tile` lima + título + fecha, KPIs en tira con `scroll-snap`
(`ds-kpi`, 172 px), filas `ds-mrow` de 60 px con tile por tipo y plata con signo a la derecha, acciones en
`ds-qgrid`/`ds-qact` (Entró plata · Salió plata · Entre cuentas) y `ds-bnav` con el **+ lima al medio**.
**QA a 412 px**: el Chrome del escritorio no se achica; se verifica metiendo `/app` en un `<iframe>` de
412×880 en la misma pestaña logueada (las media queries responden al tamaño del iframe) y midiendo
`scrollWidth === clientWidth`. Ojo con el service worker: si el deploy recién terminó, hay que pedir la
página con `?v=<timestamp>` o borrar `caches` para no mirar la versión vieja.

## Pendientes / ideas

- Preferencias por persona (apagar tipos de aviso) — hoy llegan todos los que corresponden al rol.
- Play Store (cuenta de desarrollador USD 25) cuando el APK esté probado.
- iPhone: la misma `/app` instalada como PWA recibe push desde iOS 16.4 (no probado).
- **Que el aviso salga con la marca de la app** (delegación del TWA) en vez de Chrome.
- El campo del chat en Registrar muestra el placeholder largo cortado en pantallas angostas.

## Probar la App en LOCAL con Android simulado (3/10/2026)

Dos niveles, los dos contra el ERP local (:5001):

1. **Rutina (sin instalar nada):** navegador interno (`mcp__Claude_Browser__*`) con `resize_window {preset:"mobile"}` (375×812, se presenta como Chrome de Android, táctil) en `http://localhost:5001/app`. Cubre pantallas, barra, `+`, registrar, Día, Chimpa IA. No cubre push con la App cerrada, el APK ni Compartir.
2. **Emulador oficial (Android 15 con Google Play):** SDK en `%LOCALAPPDATA%\Android\Sdk` (cmdline-tools, platform-tools/`adb`, emulator, imagen `system-images;android-35;google_apis_playstore;x86_64`), AVD **`Chimpa_Pixel`** (pixel_8, teclado físico activado). Aceleración WHPX OK. Acceso directo de Santiago: `OneDrive\Escritorio\Celular Android (ERP local).cmd` (prende el emulador, espera el arranque, `adb reverse tcp:5001 tcp:5001`, abre `/app` en Chrome). Con `adb reverse`, `localhost` adentro del emulador es la compu → Chrome lo toma como seguro y andan service worker y push.
   - APKs para instalar: `%LOCALAPPDATA%\Android\apks\` (`chimpance-dev.apk`, `chimpance-prod.apk`); `adb install -r <apk>`. Ojo: esas apuntan a dev/producción, no al local. Si hace falta probar el TWA contra local, sumar un flavor `local` (no hecho).
   - Ya configurado en el emulador: Chrome sin pantallas de bienvenida (`/data/local/tmp/chrome-command-line` + `set-debug-app`), permiso de notificaciones de Chrome dado.
   - Gotchas: `avdmanager` quiere el paquete con `;` y `ANDROID_HOME` seteado (con `--sdk_root` falla); `sdkmanager` lista con `/` pero instala igual. `adb shell input text` se come el `-` si se tipea rápido: tipear de a un campo. Usuario de prueba local en `C:\Users\santi\.chimpa-finanzas-db\usuario-prueba-local.txt`.
   - La primera carga de `/app` en el emulador tarda ~30 s (Vite compila todo).
