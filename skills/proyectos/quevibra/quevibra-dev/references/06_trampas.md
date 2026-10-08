# 06 · Trampas conocidas

Cosas que ya costaron horas. Leé la sección que toca antes de debuggear o de cambiar algo de esa zona. Fuentes: memoria del proyecto, notas del agente de Replit en `.agents/memory/*.md` (el detalle de cada una está ahí: hacé grep) y el relevamiento del 30/9/2026. **Cuando descubras una nueva, sumala acá con fecha.**

## Contenido
1. Producción, Cloudflare y caché
2. Probar sin engañarse
3. Fechas y horas
4. Ciudades
5. Scrapers
6. Sesión, login y roles
7. Frontend
8. Esquema y base
9. Email
10. Analytics y medición
11. Imágenes y almacenamiento
12. Riesgos detectados, todavía sin verificar
13. Hallazgos de las pruebas del skill (confirmados)

---

## 1 · Producción, Cloudflare y caché

- **Límite de ~100 s.** quevibra.com.ar está detrás de Cloudflare: todo pedido que tarde más de ~100 s muere con 524 aunque el servidor siga trabajando (y termine bien). Cualquier acción pesada del admin (scraper, backfill, IA en lote, regenerar) va **fire-and-forget**: validar → registrar la corrida "running" → responder 202 al instante → trabajar en segundo plano → la UI consulta el estado. Nunca un endpoint que espere más de ~60 s. ("Ejecutar todos" del admin todavía es serial: va a chocar el día que se use con un scraper lento.)
- **La caché del edge ignora el query string.** `?cb=123` no rompe la caché. Todo endpoint cuya respuesta depende de la sesión tiene que mandar `Cache-Control: no-store, no-cache, must-revalidate` (y `/api/auth/user` además borra `If-None-Match`). *Pasó:* `/api/auth/user` sin no-store → después del login seguía llegando el `null` cacheado → la app se congelaba (jun-2026).
- **El kill-switch de versión**: `/api/version` es la hora de arranque del proceso. Cada reinicio o instancia nueva hace recargar una vez a los clientes. No lo uses como "número de versión del código".
- **Autoscale**: puede haber varias instancias; nada en memoria del proceso es compartido ni persistente (contadores de la cola de email, cachés).
- **Disco efímero**: lo que se escribe en el disco del contenedor desaparece al redeployar. Archivos de usuarios → Object Storage (`11`).
- **IPs de servidor bloqueadas**: algunos sitios bloquean a Replit/centros de datos (AllAccess vía CloudFront da 403 siempre). Que un scraper ande desde la compu no prueba que ande desde Replit.

## 2 · Probar sin engañarse

- **"Tarea lista" ≠ en producción.** No verifiques producción hasta que Santiago confirme que publicó (dos falsos positivos el 13/6/2026).
- **`fetch` con sesión desde un navegador de testing**: en producción (https) un login por `fetch` suelto puede no arrastrar la cookie entre pedidos y parecer "la sesión no persiste" cuando sí persiste. Para flujos con sesión, usá la interfaz real con clics. En local, el atajo de `02` (con `x-forwarded-proto`) sí está verificado.
- **Antes de concluir "bug de sesión", mirá los headers** (`Cache-Control`, `cf-cache-status`): puede ser caché.
- **401 justo después de un login 200 en local** = falta `X-Forwarded-Proto: https` (cookie `Secure` sobre http). Artefacto del test, no bug.
- **Capturas verdes con manchas** = el splash (`Preloader`, ~1 s por sesión). Esperá y repetí. Una ruta rota se ve en **blanco** (Suspense con `fallback={null}`), y deja error en consola.
- **El badge "FAILED" del workflow de Replit** al reiniciar suele ser un corte del log durante el arranque. Confirmá con `curl` a `/health` y a un endpoint liviano.
- **Tests que fallan en main** (con `TZ=UTC`, 30/9/2026, 6dc92cf): 16 — newsletter (6), Cinemark (5), PaseShow, OAuth callback, password reset, Rosario (este es un **bug real** de horario, ver `3`) y `allaccessIngestRoute › oversized body`, que falla al azar en Windows (ECONNRESET). `chequeo-previo.sh` los descuenta solo; si arreglás uno, mejor.
- **Pestañas del navegador compartidas**: con varias sesiones o agentes en paralelo, una puede navegar la pestaña de otra y arruinarle la prueba (30/9/2026). Siempre tu propia pestaña y su `tabId` (`02` › Si hay otras sesiones).
- **El build de producción NO chequea tipos** (Vite + esbuild compilan aunque haya errores de TypeScript): un build verde no reemplaza a `tsc` (verificado el 30/9/2026 con un error metido a propósito).
- `tsc` no chequea los `*.test.ts`. Vitest no lee `.env` (hay que pasar `DATABASE_URL`), y `server/db.ts` tira error al importarse sin ella.
- *(2/10/2026)* **Pestaña oculta = sin refresco automático**: si la ventana de Claude está minimizada, la pestaña del navegador interno queda "hidden" y TanStack Query no hace polling (`refetchInterval` se pausa). Parece que la pantalla "no se actualiza" y no es un bug: tocá el botón de actualizar o hacé `refetch`. Además las capturas pueden fallar: usá `resize_window` y `get_page_text`.
- *(2/10/2026)* **Datos de prueba con fechas: correr con `TZ=UTC`**. Un script que inserta `Date` en columnas `timestamp` sin zona desde la compu (hora AR) las guarda 3 h corridas respecto de lo que lee el servidor (que corre en UTC, como producción).
- *(2/10/2026)* **`nuevo-worktree.sh` no se pipea** (`| tail`, `| sed`): el script termina pero la tubería queda abierta y el comando "se cuelga". Redirigí a un archivo (`> log 2>&1 < /dev/null`).
- *(2/10/2026)* **Scripts con barras invertidas: escribilos con Write, no con heredoc en Bash** (la terminal se come los `\\` de las regex y el script falla o, peor, hace otra cosa).
- *(2/10/2026)* **El servidor local (tsx) no recarga el backend**: cambiar algo de `server/` pide reiniciar la preview (`preview_stop` + `preview_start`); el front sí recarga solo.

## 3 · Fechas y horas

- **🔴 Producción corre en UTC; la compu, en hora argentina.** Cualquier fecha armada con la zona del proceso (`new Date(año, mes, día, hora, min)`, `setHours`, `toLocale…` sin zona) da bien en la compu y **corrida 3 horas en producción**, y los tests pasan en local. Siempre `-03:00` explícito o los helpers de `server/utils/argentinaDay.ts`. Por eso `nuevo-worktree.sh` pone `TZ=UTC` en el `.env` y `chequeo-previo.sh` corre los tests con `TZ=UTC`. Para tests de fechas, además probá con `TZ=America/Argentina/Cordoba`: tienen que pasar en las dos.
  - *Detectado el 30/9/2026 (sin arreglar al cierre):* Passline (~1.720 eventos) se ve 3 h antes ("ALL NIGHT LONG", viernes 00:00 → jueves 21:00 en prod); lo mismo en Eden, Alpogo, Antesala, Autoentrada, Ticketek y Córdoba Run (las 93 carreras figuran a las 05:00). La agenda municipal de Rosario al revés: +3 h (el test `rosarioScraper › toma la hora real de la primera función` falla con `TZ=UTC`: 13:00 en vez de 10:00). Los tests de Alpogo, Eden y Antesala que "fallaban en main" en la compu pasan con `TZ=UTC`.
- **El "día" de un evento es el día calendario en Argentina**, nunca el día UTC. Un show a las 21:00 AR es 00:00 UTC del día siguiente. Para "mismo día" usá `getArgentinaDayUtcRange()` (`server/utils/argentinaDay.ts`). *Pasó:* el dedupe entre fuentes buscaba en el día equivocado los shows de 21 a 24 hs.
- **12:00 AR = "sin hora"** (sentinel). Eventos sin hora se guardan al mediodía. `ScrapedEvent.startTime` es tri-estado: `"HH:MM"` manda; `null` = sin hora explícito; `undefined` = inferir de `date`. Cuidado con `x ?? null` (convierte "no sé" en "sin hora").
- **Mostrar día/fecha de `event.date`: con getters UTC** (`getUTCDay`, `getUTCDate`), como `formatDate`. Nunca `toLocaleDateString` con zona AR sobre esas fechas normalizadas: corre al día anterior.
- **Agenda: conflicto solo si los dos eventos tienen hora real** (`eventHasKnownTime`). Si no, decenas de eventos "al mediodía" chocan entre sí y "Agendar" da 409 falso.
- **Conteos por período** (`/api/events/count?overlap=true`): HOY / ESTE FINDE (vie-dom) / ESTA SEMANA (lun-dom) son períodos de calendario; lo que empezó antes y sigue (muestras, obras en cartel) cuenta con `overlap`. El listado normal filtra por fecha de inicio ≥ hoy.
- `buildEventConditions` corta "lo pasado" con la medianoche del proceso del servidor (UTC en Replit salvo `TZ`): cerca de la medianoche AR puede haber ~3 h de deriva (conocido, no resuelto).
- Argentina tuvo horario de verano hasta 2009: el contrato de AllAccess rechaza años < 2010 y usa `-03:00` fijo.

## 4 · Ciudades

- **Córdoba por defecto en varios lados**: el sync guarda `city ?? "Córdoba"` y `location || "Córdoba"`; formularios de admin y organizador arrancan en Córdoba; `EventCard` muestra `location ?? "Córdoba"`; el prompt de clasificación dice "eventos culturales en Córdoba". **Una ciudad no detectada termina en Córdoba en silencio.** Fuente nueva con ciudades nuevas → sumarlas a `server/scrapers/utils/argentinaCities.ts` (no a `shared/`).
- **Varias listas de ciudades alineadas a mano** (servidor, cliente, landings, coberturas): `01` › Ciudades. Un test (`citySelectorSync.test.ts`) controla servidor ↔ cliente; el resto no.
- `?city=` inválida **se ignora sin error** y devuelve todas las ciudades. El filtro de ciudad también incluye eventos con ciudad vacía.
- "Buenos Aires" (provincia/GBA) y "CABA" son valores distintos.
- Calles con nombre de otra ciudad (Rosario: "Av. Córdoba 3475") engañan a la detección por dirección: preferí el lugar (venue) y después el título.
- Marca general: "tu ciudad". La ciudad real solo en piezas de un evento concreto.

## 5 · Scrapers

- **0 eventos = falla invisible.** El sync trata la lista vacía como "no toques nada" (correcto, protege el catálogo), así que un scraper roto corre todos los días, figura "OK" y no aporta nada. *Pasó:* Eden, meses en 0 (Plaza de la Música y Club Paraguay fuera del catálogo de Córdoba). **Regla: ante una falla real el scraper tira error con el motivo**; nunca devuelve vacío en silencio (AllAccess, sep-2026).
- **Auditar desde afuera**: `curl -s "https://quevibra.com.ar/api/events?limit=6000"` y contar por `source`. Fuente del cron en 0 o muy por debajo de su sitio = rota.
- **Antes de usar Puppeteer, probá `fetch` + cheerio**: muchos sitios que "parecen" SPA vienen server-rendered, y el navegador dentro del contenedor es lo que más se rompe. Si hace falta Puppeteer: detectar Chromium rápido (`PUPPETEER_EXECUTABLE_PATH` → `which chromium` → el glob de `/nix/store` al final, con timeout), timeout global (~90 s) y `browser.close` con tope.
- **Baja lógica solo con evidencia**: desactivar lo no visto solo si se vio algo y no falló ningún listado; si >30 % de los detalles fallan, marcar el listado como fallido.
- **Corridas colgadas**: si el proceso muere a mitad, la corrida queda "running" y el botón da 409. El limpiador y la ventana del 409 usan el **mismo** umbral (20 min): si cambiás uno, cambiá el otro.
- **Que aparezca en el admin requiere 6 archivos** (`01` › Scrapers). Varios scrapers corrieron meses sin tarjeta ni botón por faltar en `getScrapersStatus()`.
- **Imágenes con anti-hotlink** (Plateanet, probablemente PaseShow/Ticketek): se ven rotas en el navegador pero bajan bien con el `Referer` correcto → espejarlas con `mirrorRemoteImage`. Un backfill con mucha concurrencia da falsos "sin imagen": reintentar.
- Duración en producción ≠ en aislado (Plateanet: 40 s solo, 17-41 min en prod por concurrencia con otros scrapers del mismo horario).
- Dos mecanismos de duplicados distintos: al ingerir (`findDuplicateFromOtherSource`) y la pasada diaria (`eventDedupePass`). No los mezcles. Un evento editado por el admin queda protegido vía audit log (`ADMIN_EVENT_UPDATED`).
- **Título = texto entero de la tarjeta** (Antesala, 3/10/2026): si el sitio mueve el nombre a otra etiqueta (Antesala pasó a `<h1>`), los fallbacks caen a `textContent`, que pega todo sin espacios ("25AbrilTEATROGriegosDesde$22.000,00…"). En `page.evaluate` usá `innerText` (respeta saltos de línea y omite lo oculto) y dejá una red de seguridad testeable fuera del navegador. Dentro de `page.evaluate` no declares funciones con nombre (esbuild puede meter `__name`, que no existe en el navegador). Como el `remoteId` sale del link, la próxima corrida pisa el título sucio de los activos; los inactivos necesitan un script (PR #36).
- **psql desde Git Bash rompe las tildes** de un SQL inline ("invalid byte sequence for encoding UTF8"): escribí el SQL en un archivo UTF-8 y usá `PGCLIENTENCODING=UTF8 psql -f archivo.sql`.
- **`nuevo-worktree.sh` escribe el preview en el `launch.json` de la carpeta de QueVibra**; si la sesión corre desde otra carpeta (ej. Chimpa2026), `preview_start` no lo encuentra. Sumalo al `.claude/launch.json` de la sesión con un `.cmd` envoltorio (`cd /d "<worktree>"` + `npm run dev`): con `npm --prefix` y espacios en la ruta falla con "C:\Program no se reconoce".
- Dominios que cambian: Eden pasó a `.com`; Cultural San Martín es `.ar` (el `.org` está tomado); Recoleta solo por `http`; La Ticketera es `laticketera.ar`.

## 6 · Sesión, login y roles

- **Sin `GOOGLE_CLIENT_ID`/`SECRET` válidos no hay sesión** (`setupGoogleAuth` retorna antes de montarla) → en local nadie puede loguearse. El `.env` de la tarea trae valores de mentira a propósito.
- **Cookie `Secure`**: en http local el servidor no la entrega salvo `X-Forwarded-Proto: https` (`02`).
- **Admin del panel = marca de sesión** por usuario/clave del entorno (+2FA si está activado). Un usuario con rol `admin` en la tabla NO entra al panel por eso. `getUserId` devuelve `"SYSTEM_ADMIN"` para el admin web: **no lo uses como FK** (`audit_logs.actor_user_id` → error 23503); guardá el actor en `metadata`.
- **Verificación de email doble**: link para cuentas Google, código de 6 dígitos para organizadores con contraseña. Se distingue por `passwordHash`, **nunca por rol** (un organizador recién registrado es `role:"user"`). El backfill que corre en cada arranque solo auto-verifica `password_hash IS NULL`.
- Códigos de 6 dígitos: cooldown de 60 s por usuario (y 3/hora). En tests, un solo envío por usuario; para conocer el código, pisar el hash en la base de la tarea.
- **Conversión anónimo → registrado**: todo botón de Google pasa por `startGoogleLogin()`; el "usuario nuevo" se captura al entrar a la app (`captureNewSignupFlag`), no al emitir el evento. Organizadores usan providers `*_organizer` para no contaminar la métrica.
- `/api/auth/user` nunca devuelve `passwordHash` (ni register/login).
- La política de contraseñas (12 caracteres) solo aplica a contraseñas nuevas; la lista de comunes nunca se dispara en el servidor (todas tienen < 12).

## 7 · Frontend

- **Dos árboles de rutas** (logueado / anónimo) en `App.tsx`: una ruta para los dos públicos va en los dos.
- **Dos headers en `/`**: logueado usa `components/Header.tsx`; anónimo usa el header interno de `home-v2/NetflixGridHome.tsx`. Arreglar uno no arregla el otro.
- **Formulario de organizador vivo**: `pages/organizador/OrganizerEventForm.tsx`. El de `components/` es código muerto.
- **Ruta pública nueva = registrarla para SEO** (`buildStaticPageMeta` en `server/eventOgTags.ts` o `KNOWN_NON_INDEXABLE_ROUTES`); si no, el servidor la responde con **404 + noindex** aunque la app la muestre.
- **HTML de SEO inyectado por el servidor**: se borra antes de montar React (`removeServerPrerenderFallbacks`) y la vista de React tiene que mostrar contenido equivalente (mismas consultas, mismo orden, mismo límite). Solo eventos activos y publicados.
- **TanStack Query con `staleTime: Infinity`**: después de mutar, `invalidateQueries`, o la pantalla queda vieja.
- `apiRequest` mete el cuerpo crudo en `err.message`: no lo muestres tal cual.
- Wordmark de QueVibra = SVG oficial monocromo (`QueVibraWordmark`, `currentColor`), nunca texto en una fuente, nunca terracota. En una frase, "QueVibra" va como texto normal.
- Tokens `--brand-*` son el puente al DS nuevo: cambiar su definición cambia toda la app. Los SVG decorativos (splash) traen el color adentro.
- **Color con transparencia sobre una variable NO genera CSS**: `hover:bg-[var(--brand-azul)]/90`, `bg-[var(--brand-azul)]/10`, `border-[var(--brand-negro)]/20`, `text-[var(--brand-negro)]/40`… Tailwind no puede aplicar el `/NN` a un `var()` y descarta la clase en silencio (verificado en el CSS del build el 30/9/2026: 0 apariciones; hay ~38 usos en ~29 archivos, sobre todo hovers y fondos tenues que hoy no se ven). Para clases nuevas usá tokens de Tailwind con alfa (`bg-primary/10`, `border-border`, `bg-black/5`) o `color-mix()` en CSS. Arreglar los existentes = tarea aparte.
- Magenta `#E11D74` solo en "Me Vibra". Prohibidos `#0044FB` y el gradiente azul→magenta→naranja; `#FB4502` solo como color de Música.
- Subidas multipart: no filtrar por `mimetype` exacto (el navegador manda `application/octet-stream` o vacío para imágenes válidas); validar decodificando.

## 8 · Esquema y base

- **`shared/` necesita OK de Santiago.** Por eso hay lógica duplicada a propósito en `server/lib/` y `client/src/lib/` (p. ej. política de contraseñas).
- **`db:push` corre solo en Replit después de cada Pull.** Cambios destructivos piden confirmación interactiva (ver `05`).
- **Columnas creadas por SQL crudo y no declaradas en el esquema**: `users.weekly_opt_out` (baja del newsletter, `ensureWeeklyOptOutColumn` al arrancar). `users.email_verified` y `welcome_guide_seen` están declaradas y además tienen su `ALTER … IF NOT EXISTS`; `email_verified` no se escribe vía Drizzle. Ver riesgo en `12`.
- `AUDIT_ACTIONS` es una unión cerrada y vieja: para consultar acciones nuevas hay que castear (`as unknown as AuditAction[]`).
- `getEvents` no filtra `status='published'` (el sitemap y la ficha SSR sí).
- Texto con mojibake: `textCleanup.ts` (reglas con escapes `\uXXXX` explícitos, nunca literales).

## 9 · Email

- **Todo envío pasa por la cola** (`enqueueEmail`), nunca directo a MailerSend: la cola limita por minuto y reserva cupo diario para los transaccionales. *Pasó:* el newsletter de 137 envíos seguidos agotó el cupo y los códigos de verificación fallaron el resto del día. "No activity found" en MailerSend = rechazo por cupo, no problema de dominio.
- Baja del newsletter: token HMAC sin vencimiento firmado con un secreto estable; nunca un secreto de respaldo literal; si falla guardar, 500 (nunca un 200 falso).
- En email las fuentes de marca casi no se ven (Gmail/Outlook): tablas, CSS inline, diseñar para Arial y para imágenes bloqueadas. Las URLs de imágenes tienen que ser absolutas (las `/cdn/...` relativas no sirven en un mail ni en OG).

## 10 · Analytics y medición

- `client/src/lib/analytics.ts` no se toca. Eventos nuevos: `trackEvent` o `analytics.ctaClick` codificando la info en las props cerradas (`ctaId`, `action`, `reasonCode`, `source`, `eventId`). Lo que va fuera de esas props el servidor lo descarta en silencio.
- Una sola clave de sesión de analytics (`vibra_session_id` en sessionStorage).
- `/api/track` es best-effort: nunca bloquea ni rompe la acción del usuario.
- Meta Pixel + CAPI comparten un `event_id` generado una vez en el cliente; CompleteRegistration se manda siempre, aunque un bloqueador frene el Pixel.
- Al medir conversiones en un período, filtrá por fecha **los dos lados** del join.

## 11 · Imágenes y almacenamiento

- Subidas y espejos → Object Storage → `/cdn/<prefijo>/<hash>.<ext>` (relativo). Nunca `public/uploads/` en disco (desaparece al redeployar). Usar `uploadImageBuffer` / `mirrorRemoteImage` (`server/services/imageMirror.ts`).
- En local no hay Object Storage: las `/cdn/...` no se ven y las subidas fallan (no es tu bug; probalo en producción).
- `sanitizeUrl` rechaza URLs relativas: el flujo cae al valor crudo a propósito.
- PNG generados por OpenAI pueden traer chunks que `@napi-rs/canvas` no decodifica ("Invalid SVG image"): sacar los chunks auxiliares antes.

## 12 · Riesgos detectados, todavía sin verificar (30/9/2026)

Hallazgos del relevamiento que conviene confirmar cuando se toque la zona (y avisar a Santiago si se confirman):

- **`users.weekly_opt_out` y `db:push`**: como la columna no está en el esquema, `drizzle-kit push` la ve como sobrante. Si alguna vez se aplica el drop, se perderían las bajas del newsletter (gente desuscripta volvería a recibirlo). Verificar qué hace el post-merge de Replit y, si hace falta, declararla en el esquema (toca `shared/`: OK de Santiago).
- **`GET /api/events` devuelve `isLiked`/`isScheduled` por usuario y no manda `Cache-Control`**. Con un edge que cachea respuestas de API (ya pasó con `/api/auth/user`), un usuario podría ver marcas de otro o datos viejos. Verificar headers en producción (`cf-cache-status`).
- **El login de admin sin sesión montada** escribe en `req.session` dentro de un handler async sin try/catch: en un ambiente sin Google configurado podría tirar el proceso. Solo afecta ambientes mal configurados.
- **"Volver" de la ficha de evento en celular mide 20 px de alto** (< 44). Deuda chica de UX. (Arreglo probado en la rama local `fix/ev1-volver`, sin subir.)
- **Volver a una página larga (p. ej. /cordoba) arranca arriba de todo**, no donde estabas (también con el atrás del navegador).

## 13 · Hallazgos de las pruebas del skill (30/9/2026, confirmados con datos de producción)

- **Horarios corridos 3 h** en Passline y 6 scrapers de Córdoba (−3 h) y en Rosario (+3 h): ver `3`.
- **Passline BA a medias**: el scraper lee 600 por región y CABA tiene ~1.700 → faltan ~1.000 eventos de BA/CABA. Arreglo con paginación completa probado en la rama local `fix/ev3-passline` (sin subir).
- **Tarjeta del admin compartida entre ciudades**: Passline (5 ciudades), Fever, Cinemark, Ticketek, Showcase registran todas sus corridas con un solo `source`; la tarjeta muestra la última y una falla de Córdoba queda tapada por el verde de BA.
- **Passline de La Plata (70), Mar del Plata (26) y Junín (8) guardados como "Buenos Aires"**: quien elige esas ciudades no los ve.
- **Edad mínima a medias**: `events.audience` existe; 6 formatos distintos; la ficha dice "Mayores de Todo público" (8 eventos); 3 formularios ponen "Todo público" por defecto; el sync borra la edad corregida a mano.

## 14 · Aprendido el 2/10/2026 (home logueada, PR #29)

- **Preview desde una sesión con otra carpeta de trabajo** (ej. Chimpa2026): `npm --prefix "…Que Vibra Cluade Code…"` falla por los espacios ("C:\Program no se reconoce") y `cd /d` con la ruta corta 8.3 rompe Vite ("Failed to load /src/main.tsx"). Lo que anda: un `.cmd` en el scratchpad con `cd /d "<ruta larga>"` + `npm run dev`, y en `launch.json` `runtimeExecutable` = ese `.cmd`.
- **Playwright contra el local**: el header `x-forwarded-proto` va SOLO a localhost con `ctx.route("http://localhost:PUERTO/**", …)`. Si va con `extra_http_headers` a todo, Google Fonts lo rechaza por CORS y las capturas salen con la fuente de reemplazo. Para simular vacío o error con `route.fulfill`, el contexto necesita `service_workers="block"` (si no, `/sw.js` responde y la ruta nunca se intercepta). El handler de `ctx.route` recibe `(route, request)`.
- **PostgreSQL local (5434) se puede caer solo** (Windows, excepción 0xC0000142, visto el 2/10 a las 16:00): la API responde "Error al obtener eventos" con ECONNRESET/ECONNREFUSED. Se levanta con `pg_ctl -D ~/.quevibra-db/data -l ~/.quevibra-db/postgres.log -w start`, sin tocar nada más.

## 15 · Aprendido el 3/10/2026 (pruebas en celulares, `celulares.py`)

- **El pedido de registro en celular es un panel que sube desde abajo (vaul Drawer) sin botón X**: se cierra tocando lo oscuro de arriba o deslizando. En pruebas, cerrarlo con `Escape` y mirar a los 600 ms da un **falso "pantalla congelada"** en WebKit (la animación sigue y `body` tiene `pointer-events:none`). Cerrar con `touchscreen.tap` afuera, esperar 1,5 s y comprobar tocando de nuevo.
- `urllib` de Python contra quevibra.com.ar → **403 de Cloudflare** por el user-agent: mandá uno de navegador.
- Los "errores" de consola de Google (iframes de google.com/adtrafficquality, `[Report Only]` de la CSP con mayúsculas) son ruido esperable: filtrarlos sin distinguir mayúsculas.
- No borres con `rm -rf` una carpeta de informe que es el directorio de trabajo de la sesión ("Device or resource busy"): sobrescribí.
