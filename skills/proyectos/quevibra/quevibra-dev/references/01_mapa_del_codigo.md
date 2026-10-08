# 01 · Mapa del código de QueVibra

Relevado el 30/9/2026 sobre `origin/main` (6dc92cf). Rutas relativas a la raíz del repo. **Si el código contradice este mapa, gana el código** (y actualizá el mapa). `replit.md` está desactualizado ("33 scrapers / 41 crons"; hay ~47 módulos y ~59 jobs) y `docs/design-system.md` usa la paleta vieja.

## Contenido
1. Stack, alias y comandos
2. Frontend: arranque, rutas, componentes, datos, estilos, admin
3. Backend: arranque, rutas, auth, servicios, cron
4. Scrapers: contrato, sync, registro y qué tocar para agregar uno
5. Ciudades: todas las listas que hay que mantener alineadas
6. Esquema de la base
7. Dónde está cada cosa (índice rápido)

---

## 1 · Stack, alias y comandos

- **Front**: React 18 + TypeScript + Vite + wouter + TanStack Query v5 + Tailwind 3 + shadcn/ui + Framer Motion. PWA mobile-first.
- **Back**: Express 4 + Drizzle ORM + PostgreSQL. Scrapers con fetch/cheerio (y Puppeteer donde hace falta). node-cron.
- **IA**: OpenAI GPT-4o (visión de flyers, clasificación, detección de ciudad). Anthropic solo para copys de landings de organizador (`server/lib/anthropicClient.ts`). Sumar otra dependencia de IA → consultarlo con Santiago.
- **Email**: MailerSend, siempre a través de la cola (`server/services/email/emailQueue.ts`).
- **Imágenes subidas**: Replit Object Storage → URLs relativas `/cdn/...`.
- **Alias** (vite, tsconfig, vitest): `@/` → `client/src`, `@shared/` → `shared`, `@assets/` → `attached_assets`.
- **Comandos**: `npm run dev` (tsx server/index.ts; Vite en modo middleware, un solo puerto) · `npm run build` (`script/build.ts`: Vite → `dist/public`, esbuild → `dist/index.cjs` en **CJS**) · `npm run check` (tsc) · `npm run db:push` (drizzle-kit push). **No hay `npm test`**: `npx vitest run [archivo]`.
- **tsconfig excluye `**/*.test.ts`**: los tests no se chequean con tsc (un test puede tener errores de tipos y pasar igual).

## 2 · Frontend (`client/src`)

### Arranque
- `main.tsx`: `captureNewSignupFlag()` (guarda `?signup=google` antes de que se borre), `removeServerPrerenderFallbacks()` (saca el HTML de SEO que inyecta el servidor), registra `/sw.js`, y el **kill-switch de versión**: pide `/api/version`, compara con `localStorage.qv-bundle-version` y si cambió desregistra el service worker, limpia caché y recarga una vez por sesión. La versión del servidor es `Date.now()` al arrancar el proceso → **cada reinicio cuenta como versión nueva**.
- `App.tsx`: providers QueryClient › Theme › City › OrganizerMode › AuthModal › PWAInstall › WelcomeGuide › Tooltip; `<Toaster/>`, `<GlobalAuthModal/>`, `<SignupTracker/>`, One Tap. `AppLayout` = BetaBanner, RuntimeScripts (scripts de tracking cargados desde el admin), **Preloader** (splash ~1 s por sesión: tapa las capturas de pantalla), Router, banners de PWA e in-app browser.
- Solo Landing, UserHome y NotFound cargan de entrada; el resto es `lazy()` con `<Suspense fallback={null}>` (una ruta rota se ve **en blanco**, no con error).

### Rutas: DOS árboles `<Switch>` en `App.tsx`
Mientras carga la sesión el Router devuelve `null`. Después renderiza el árbol **logueado** o el **anónimo**. **Una ruta nueva que necesitan los dos públicos va en los dos árboles.**

| Ruta | Componente | Para |
|---|---|---|
| `/` | anónimo: `Landing` (→ `home-v2/NetflixGridHome`, con SU PROPIO header); logueado: `UserHome` (usa `components/Header.tsx`) | visitante / usuario |
| `/explorar` | `Explore` | todos |
| `/que-hacer-hoy` | `QueHacerHoy` (ruleta, `components/ruleta/*`) | todos |
| `/agenda`, `/vibras` (Guardados/"Me vibra"), `/mi-vibra`, `/perfil`, `/home` | Agenda, Vibras, MiVibra, Profile, UserHome | solo logueado |
| `/onboarding`, `/comunidad`, `/empresas`, `/organizadores` | intereses, Community, Empresas, OrganizerLanding | todos |
| `/cordoba` `/buenos-aires` `/rosario` `/salta` `/mendoza` `/mar-del-plata` `/la-plata` `/tucuman` `/jujuy` `/rio-cuarto` `/junin` | `pages/<Ciudad>.tsx` → `<CityLanding slug/>` | todos |
| `/lugar/:slug` | `VenuePage` (páginas de lugar generadas solas) | todos |
| `/evento/:slug` | `EventDetail` (slug = `<titulo>-<uuid>`); es la puerta de entrada de los links compartidos. Se llega desde un link, la home anónima, las landings de ciudad y "similares". **En Explorar, tocar una card abre `EventDetailModal`, no esta página** (dos pantallas de detalle: un cambio en una no cambia la otra) | todos |
| `/beta`, `/unirme`, `/descubri`, `/bienvenida` | embudo beta / bienvenida | todos |
| `/contacto` `/privacidad` `/terminos` `/verificar-email` | estáticas | todos |
| `/organizador/{login,cambiar-password,recuperar-password,nueva-password,verificar-mail,onboarding}` | `pages/organizador/*` | todos |
| `/organizador/{perfil,registro-organizador,dashboard,eventos,eventos/nuevo,eventos/:id/editar}` | idem | **solo árbol logueado** |
| `/admin`, `/admin/invite/:token` | `Admin`, `AdminInviteAccept` | admin |

**Código muerto que parece vivo**: `pages/Home.tsx`, `pages/OrganizerDashboard.tsx` (el vivo es `pages/organizador/OrganizerDashboard.tsx`), `components/OrganizerEventForm.tsx` (el formulario vivo es `pages/organizador/OrganizerEventForm.tsx`, wizard de 2 pasos), `pages/OrganizerPublicLanding.tsx` (sin ruta). Antes de editar "el formulario de organizador" o "el header de la home", confirmá en `App.tsx` qué se renderiza.

### Componentes clave
- **`components/EventCard.tsx`** (~1.5k líneas): la ÚNICA card. `variant`: `default | compact | list | mobile | mobile-condensed | featured | agenda` (tabla de usos en el comentario de arriba). Exporta `EventCardSkeleton` y el tipo `Event`. Like y Agendar viven en `useEventCardActions`.
- **`components/EventSection.tsx`**: fila de eventos con skeleton; **devuelve null si no hay eventos** (la fila desaparece). Wrappers: `RecommendedSection`, `HappeningNowSection`, `NearbySection`. `FeaturedEvents` es aparte (fetch propio, estados de error y vacío).
- `components/mobile/`: `MobileBottomNav` (3 juegos: usuario Inicio/Agenda/**Explorar**/Guardados/Perfil · organizador Dashboard/Eventos/**Crear**/Explorar/Perfil · invitado **Qué hacer hoy**/Explorar/Registrarse), `MobileAppShell`, `MobileTopBar`, `EventCarousel`. La nav se importa página por página.
- Modales: `EventDetailModal` (tiene barra de acciones fija abajo en celular: patrón a reutilizar), `GlobalAuthModal` (vía `AuthModalContext.openAuthModal({variant})`), `LoginModal`, `FeedbackModal`, `schedule/ConflictDialog`.
- Onboarding: `/onboarding` (intereses) + `WelcomeGuide.tsx` (se abre sola si `user.welcomeGuideSeen` es false).
- Post-login: `hooks/useReturnTo.ts` + `decidePostLoginNavigation` (función pura, testeada) retoman la acción pendiente ("Me vibra"/"Agendar") y la vuelta al lugar.
- `CitySelector.tsx` + `useCity()` (localStorage `quevibra_city`; `""` = "Todas las ciudades").
- Otros: `home-v2/*`, `filters/*`, `agenda/*`, `SEOHead`, `EventImagePlaceholder` (gradiente por categoría cuando no hay foto), `OccurrencesEditor`, `ObjectUploader`.

### Datos (TanStack Query)
- `lib/queryClient.ts`: `apiRequest(method, url, data)` con `credentials:"include"`; ante error tira `Error("<status>: <cuerpo crudo>")` (si mostrás `err.message` en un toast, el usuario ve JSON crudo: traducilo).
- **queryFn por defecto = `queryKey.join("/")`**. Convención: la key ES la URL (`["/api/user/likes"]`, `["/api/events", id, "occurrences"]`). Con query string: URL completa en la key, o key con objeto + `queryFn` propio (una key objeto con el queryFn por defecto pide `[object Object]`).
- Defaults: `staleTime: Infinity`, `retry: false`, `refetchOnWindowFocus: false` → **después de cada mutación hay que `invalidateQueries`** o la pantalla muestra datos viejos.
- `hooks/useAuth.ts` → `["/api/auth/user"]` (devuelve `null` deslogueado, no 401).
- **Analytics**: `lib/analytics.ts` está PROTEGIDO. Para eventos nuevos: `lib/trackEvent.ts` o `analytics.ctaClick` con props cerradas (`ctaId`, `action`, `reasonCode`, `source`, `eventId`); los nombres válidos están en `ANALYTICS_EVENT_NAMES` (`shared/schema.ts`). Meta Pixel + CAPI: `lib/trackMeta.ts`.
- Fechas: `lib/dateUtils.ts` (`parseEventDate`, `formatEventDate`, `getEventDisplayTime`), `lib/occurrences.ts`. Ver trampas de fechas en `06`.
- Login: `lib/googleLogin.ts` (`startGoogleLogin` — todo botón de Google pasa por acá o la conversión no se cuenta), `lib/devAuth.ts` (`loginAsDevUser`, solo en dev).

### Estados de pantalla hoy
- Cargando: `EventCardSkeleton`, `components/ui/skeleton`, `home-v2/Skeletons.tsx`, skeletons locales (`EventDetailSkeleton`, `EventGridSkeletons`, `VibeLoadingSkeleton`). Varias páginas no muestran nada mientras cargan.
- Vacío: **no hay componente común**; cada página escribe el suyo (`AgendaListView` "Tu agenda está vacía", `Vibras`, `Explore` "No encontramos eventos", `FeaturedEvents`). El DS v0.3 (`docs/vibra-ds/`, §4.7) define un EmptyState/ErrorState/OfflineIndicator unificados **todavía no implementados**.
- Error: texto inline por página (`FeaturedEvents`, `VibeErrorState`, `BienvenidaBeta`), `not-found.tsx`.
- Toasts: shadcn (`hooks/use-toast`), solo variantes `default` y `destructive` (el DS pide 5). Un toast a la vez. No hay indicador offline.

### Estilos
- `client/src/index.css`: tokens shadcn en HSL (primary = terracota T3), `--brand-*` (legado, apuntan al DS nuevo), primitivas Vibra DS v0.3 `--vb-hot-*` (terracota), `--vb-lime-*`, `--vb-magenta-*` (**solo "Me Vibra"**), `--vb-ink-*`, `--vb-warm-*`, colores de categoría `--c-*`, utilidades `hover-elevate`, `.pb-safe`, `.touch-target`.
- `styles/v3-tokens.css`: solo `LandingV3`.
- Fuentes (`client/index.html`): Plus Jakarta Sans (`--font-sans`), Silkscreen (`--font-display`), Newsreader (`--font-read`).
- Muchos elementos tienen `data-testid`: mantenelos y sumalos en lo nuevo.

### Admin (`client/src/pages/Admin.tsx`, ~7.1k líneas)
Secciones: dashboard, inbox, marketing, beta, events, import, vision ("IA Eventos"), generator, carousel-tray ("Bandeja de redes"), venues, scrapers, reports, feedback, scripts, insights, searches, email, categories, tags, organizadores* y users* (*super-admin), security (2FA). Extraídas a `components/admin/`: `InboxSection`, `AdminInsights`, `VisionEventCreate`, `ContentGeneratorSection`, `CarouselTraySection`, `VenuesAdmin`, `OrganizersSection`, `AdminCommandPalette`. `SOURCE_LABELS` (≈L160) = nombres visibles de cada scraper.

## 3 · Backend (`server/`)

### Arranque (`server/index.ts`)
1. `import "dotenv/config"` (en local lee `.env`; en Replit los secretos vienen del panel).
2. compression, helmet (CSP según `CSP_MODE`, por defecto report-only), **router de ingesta AllAccess antes de `express.json()`** (límite de body propio).
3. `express.json` (100 kb) + logger de `/api` (imprime las respuestas JSON enteras: los logs de `/api/events` son enormes, filtrá con `search`).
4. Bootstraps por SQL crudo: `ensureEmailVerificationSchema()`, `ensureWeeklyOptOutColumn()`, `storage.ensureWelcomeGuideSchema()` → necesitan la base con tablas.
5. `registerRoutes(app)` → middleware de error → `serveStatic` (prod) o `setupVite` (dev). Ambos pasan el HTML por `renderSpaPage()` (SEO).
6. `listen(PORT || 5000)` (sin `reusePort` en Windows).
7. **Crons**, solo si `CRON_ENABLED !== "false"` (zona `America/Argentina/Cordoba`): scrapers ~04:00–10:30 AR (Puppeteer pesados 04–08, agendas institucionales después de las 09), limpiador de corridas colgadas (al arrancar + cada 10 min, umbral 20 min), dedupe 08:30, newsletter lunes 12:00, carrusel cada 15 min, inbox cada 3 min.

### `server/routes.ts` (~8.6k líneas, un solo `registerRoutes`)
De arriba a abajo: helpers (`ANALYTICS_PROPS_SCHEMA`, `getUserId(req)` — admin → `"SYSTEM_ADMIN"`, luego `req.user.id`, `session.userId`, passport…), middlewares `isAdminWeb` / `isOrganizer` / `isOrganizerOrUser` / `isSuperAdmin` → `/unsubscribe` → **`setupGoogleAuth(app)` (acá se monta la sesión)** → `/api/version` → `/sitemap.xml` → dev-auth (`/api/dev/login`, solo fuera de producción) → login admin + 2FA → `/api/track*` → `/api/auth/user` (no-store) → públicos (`/api/categories`, `/api/meta/*`, `/api/events` y derivados) → `/cdn/*` → organizador `/api/organizer/*` → usuario `/api/user/*` → admin `/api/admin/*` → públicos de lugar/organizador, `/health`, contacto, feedback.

Otros archivos de rutas: `inboxRoutes.ts`, `carouselDraftRoutes.ts` (+ `POST /api/cron/carousel-tick` con `x-cron-secret`, lo llama un GitHub Action), `cityLandings.ts`, `cityLandingSeo.ts` (HTML indexable de landings), `venuePages.ts`, `eventOgTags.ts` (`renderSpaPage`: meta y JSON-LD de `/evento/:slug` — **404 si el evento no está activo y publicado** —, de `/lugar/:slug`, y de las páginas estáticas vía `buildStaticPageMeta()`; **cualquier ruta que no esté ahí ni en `KNOWN_NON_INDEXABLE_ROUTES` responde 404 + noindex** → una página pública nueva hay que registrarla ahí), `devAuthRoutes.ts`.

### Datos
- `server/db.ts`: Pool de pg + drizzle. **Tira error al importarse si falta `DATABASE_URL`** (también en tests).
- `server/storage.ts` (~3.4k líneas): `DatabaseStorage`. `buildEventConditions` (compartido por `getEvents` — límite por defecto 500 — y `countEvents`): filtra `isActive` y fecha ≥ hoy, **no** filtra `status='published'`. Muchas rutas usan `db` directo: es normal.

### Auth
- `server/googleAuth.ts` → `setupGoogleAuth`: **si faltan `GOOGLE_CLIENT_ID`/`SECRET` (o el ID no termina en `.apps.googleusercontent.com`) retorna antes de montar la sesión** → sin sesión nadie se puede loguear (ver `02`). Sesión en Postgres (tabla `sessions`, 30 días, cookie `secure:true`, `sameSite:lax`), `trust proxy 1`. Rutas `/auth/google/start|callback` (intención organizador en el `state` `org_`/`usr_`), One Tap, `/api/logout`. **El `isAuthenticated` que usan las rutas es el de este archivo.**
- `server/replitAuth.ts`: solo `getSession()` está vivo; el OIDC de Replit está muerto.
- Organizadores con email/contraseña: bcrypt, política en `server/lib/passwordPolicy.ts` (12 caracteres), códigos de 6 dígitos (`organizerVerificationService.ts`, `organizerPasswordResetService.ts`).
- **Admin del panel**: `POST /api/admin/login` compara contra `ADMIN_USERNAME`/`ADMIN_PASSWORD` del entorno y marca `session.isAdmin`; 2FA TOTP solo si está activado en la base. `isAdminWeb` mira **solo** esa marca de sesión (los roles `admin` de la tabla users no pasan). `ADMIN_EMAILS` no lo lee ningún código.
- `server/middleware/security.ts`: rate limiters (`RATE_LIMIT_DISABLED=true` los apaga), `validateApiKey` (`ADMIN_API_KEY`), `redactSensitiveData`. `sanitizer.ts`: XSS de eventos.

### Servicios (`server/services/`)
- `eventSyncService.ts` (~6.1k líneas): todas las funciones `sync*` de scrapers + `classifyScrapedEvent`, `saveEventTags`, `findDuplicateFromOtherSource`, `buildSanitizedEventValues`.
- Clasificación: `categoryClassifierV2.ts` (reglas + OpenAI de respaldo), `classificationService.ts`, y reglas compartidas en `shared/`.
- `cityDetectionService.ts` (+ `flyerCityVisionService.ts` con visión).
- Duplicados: `eventDedupeService.ts` (similitud) y `eventDedupePass.ts` (pasada diaria que oculta copias; nunca oculta manuales, destacados, de organizador o editados por admin).
- `recommendation/` (motor V2, `/api/events?personalized=true`).
- Ingesta con IA: `eventVisionIngestService.ts`, `event-ingestion/` (orquestador, extractores de Instagram/URL/texto/PDF, `textCleanup.ts`, `instagramImageStorage.ts`).
- `imageMirror.ts`: `mirrorRemoteImage` / `uploadImageBuffer` → Object Storage → `/cdn/...`.
- Email: `email/` (cliente, **cola con cupo reservado para transaccionales**, plantillas, baja), `weeklyEmail/` (newsletter), `emailVerificationService.ts`.
- Redes: `carouselDrafts.ts`, `carouselSchedule.ts`, `metaPublisher.ts` (IG/FB Graph), `socialCard*.ts` (@napi-rs/canvas), `socialReel.ts`, `socialVideo.ts`.
- Otros: `inbox/`, `vibeService.ts`, `scheduleService.ts` (conflictos de agenda), `ruletaInsights.ts`, `productRatesInsights.ts`.

## 4 · Scrapers

- `server/scrapers/<nombre>Scraper.ts` (~47), `utils/` (`fetchWithRetry.ts`, `muchTicketParser.ts` compartido por Norte Ticket / La Ticketera / Entrada Play, `argentinaCities.ts` = diccionario de ciudades y lugares). Fixtures en `server/scrapers/__fixtures__/<fuente>/`; tests en `server/scrapers/__tests__/` y `server/tests/*Scraper.test.ts` (parsean fixtures o stubean fetch; ninguno sale a internet).
- **Contrato**: devuelven `ScrapedEvent[]` (`shared/schema.ts`: `remoteId`, `title`, `priceType`, `date` obligatorios; `startTime`, `city`, `sourceCategoryRaw`, `image`, `externalUrl`, `organizerName`, `endDate` opcionales) o, los nuevos, `{ events, listingsAttempted/Succeeded/Failed, detailsAttempted/... }` para que el sync sepa si es seguro dar de baja.
- **Reglas del sync** (`sync*` en `eventSyncService.ts`):
  - Lista vacía → log y `{synced:0}`, **no se desactiva nada** (por eso un scraper roto pasa desapercibido: ver `06`).
  - Por evento: clasificar → (fuentes secundarias) buscar duplicado de otra fuente mismo día AR + ciudad → upsert por `(source, remoteId)` vía `buildSanitizedEventValues` (**`city ?? "Córdoba"`**) → tags.
  - Baja lógica (`isActive=false` de lo no visto) solo si se vio algo y no falló ningún listado.
  - Ante una falla real (pantalla anti-bot, grilla ilegible, 0 eventos válidos) **el scraper tiene que tirar error**, no devolver vacío.
  - **Fuente con un job por ciudad** (mismo `source`): la baja por ausencia se acota a las ciudades de esa corrida (`inArray(events.city, [...seenCities])`, o la lista de exclusión de Passline). Hasta el 30/9/2026 los jobs de Córdoba de Ticketek/Fever/Cinemark/Showcase apagaban BA y Mendoza (PR #28).
- **Auditar (30/9/2026)**: catálogo público por `source`+`city`+`lastSyncedAt` y cada `scrapeX()` corrido aislado con tsx. Los scrapers con Puppeteer **no arrancan en Windows** (`--single-process`, rutas Nix): un 0 local con Puppeteer no prueba nada.
- **Corridas**: tabla `scraper_runs`. "Ejecutar ahora" del admin → `POST /api/admin/scrapers/:source/run` (`source` en minúsculas) → lock + 409 si hay una corriendo hace <20 min → **responde 202 al instante y corre en segundo plano** (Cloudflare corta a los 100 s) → la UI consulta `/api/admin/scrapers/status`.
- **Para agregar el scraper X** (desde el PR del 2/10/2026 hay UNA lista de rutinas; si ese PR todavía no está en main, seguí la lista vieja de abajo):
  1. `server/scrapers/xScraper.ts` + test + fixtures.
  2. `server/services/eventSyncService.ts`: `SOURCE_X = "X"` y `export async function syncXEvents()`.
  3. `server/scrapers/scraperSchedule.ts`: una entrada `{ name, source, label, time }` (+ `city` si la fuente tiene una rutina por ciudad). **Con esto ya aparece en el admin** ("Estado de scrapers") y en la rutina diaria.
  4. `server/scraperJobs.ts`: su función en `SCRAPER_JOB_FNS` (TypeScript no compila si falta).
  5. `server/routes.ts`: `pickScraperFn` (key en minúsculas) si la fuente tiene una sola rutina — `scraperSchedule.test.ts` falla si falta.
  6. **Probar antes del PR** (regla de Santiago, ver `03` › Scraper): `npx tsx scripts/probar-scraper.ts "<rutina>"` contra la base del worktree → resolver los ✘, mirar la hoja de contactos de fotos en celular y compu, y poner los números en el PR.
  7. Opcional: prioridad en `eventDedupePass.ts` (`SOURCE_PRIORITY`), alias de ciudades/lugares en `server/cities.ts` y `server/scrapers/utils/argentinaCities.ts`, nombre en `SOURCE_LABELS` de `Admin.tsx` (solo para el filtro de fuente de la lista de eventos).
  - Lista vieja (antes del 2/10): `server/index.ts` (import + `CRON_SOURCE_MAP` + `scraperJobs`), `routes.ts` (`pickScraperFn`), `storage.ts` (`getScrapersStatus` y `getScrapersHealth`), `Admin.tsx` (`SOURCE_LABELS`).
  - `drizzle.config.ts` solo se toca si agregás una tabla en `server/schema/`.
  - `scraperSchedule.ts`, `scraperJobs.ts` y `eventSyncService.ts` son "archivos de registro" que casi todas las ramas tocan → mergear rápido.

## 5 · Ciudades (varias listas, alineadas a mano)

1. **`server/cities.ts`** — `SUPPORTED_CITIES` (13: Córdoba, Buenos Aires, CABA, Rosario, Mendoza, Salta, Mar del Plata, La Plata, Tucumán, Jujuy, Río Cuarto, Junín, Bariloche), `CITY_ALIASES`, `DEFAULT_CITY="Córdoba"`, `isValidCity`. Valida `?city=`: **una ciudad inválida se ignora en silencio y devuelve todas**. "Buenos Aires" y "CABA" son valores distintos.
2. **`client/src/lib/cities.ts`** — selector, `useCity`, selects de admin y organizador. Mismas 13 (lo controla `server/tests/citySelectorSync.test.ts`). `client/src/lib/geolocation.ts` `CITY_CENTERS` (detectar mi ciudad).
3. **Landings** (11 slugs): `client/src/lib/cityLandings.ts` (copys) + `server/cityLandings.ts` (espejo a mano + `storageCity`; alimenta sitemap, meta y SEO) + `client/src/pages/<Ciudad>.tsx` + `<Route>` en los **dos** árboles de `App.tsx`. Bariloche no tiene landing; Junín no tiene scraper propio.
4. Secundarias: `shared/cityEventSelection.ts`, `shared/cityCoverage.ts` (copy "en Córdoba, Buenos Aires…"), `shared/argentinaProvinces.ts` ↔ `server/scrapers/utils/argentinaCities.ts`.

## 6 · Esquema

`shared/schema.ts` (~1k líneas) + tablas en `server/schema/` (eventIngestions, feedback, siteScripts, userVibe, emailVerification, emailDispatchLog, carouselDrafts, inbox), todas listadas en `drizzle.config.ts`. **No hay migraciones versionadas**: se aplica con `db:push`, y Replit lo corre solo después de cada Pull (`scripts/post-merge.sh` = `npm install && npm run db:push`).

- Usuarios y auth: `sessions`, `users` (roles `user|organizer|admin|super_admin`, columnas `organizer*`, `onboardingCompleted`, `welcomeGuideSeen`, `emailVerified`…), `admin_invites`, `admin_security`, `admin_backup_codes`, `audit_logs` (`AUDIT_ACTIONS` es una unión cerrada y vieja: castear), `organizer_verification_codes`, `email_verification_tokens`.
- Eventos: `events` (`date` = ancla del día; `startTime` "HH:MM"; `endDate`; `timeOfDay`; `priceType FREE|PAID|CONTRIBUTION`; `status draft|published|paused`; `isActive`; `source`+`remoteId`; `city`; `organizerId`; `isFeatured`), `event_occurrences` (funciones), `venues`.
- Taxonomía: `categories`, `tags`, `audiences`, `event_tags`, `shared/meta/categoryTagMap.ts`.
- Interacciones: `user_likes` ("Me vibra"), `user_schedules` (Agendar), `user_preferences`, `user_category_weights`, `user_tag_weights`, `event_reports`, `event_shares`, `event_invites`, `user_vibe_snapshots`.
- Organizadores: `organizer_profiles` (la fila ES el permiso de landing pública), `organizer_followers`.
- Medición: `analytics_events`, `contact_messages`, `feedbacks`, `site_scripts`.
- Scrapers e ingesta: `scraper_runs`, `event_ingestions`. Email/inbox/redes: `email_dispatch_log`, `inbox_*`, `carousel_drafts`.
- **Columnas creadas por SQL crudo al arrancar y NO declaradas en el esquema**: `users.weekly_opt_out` (baja del newsletter). Ver `06` › Esquema.

## 7 · Índice rápido: "¿dónde está…?"

| Busco | Archivo |
|---|---|
| La card de evento | `client/src/components/EventCard.tsx` |
| La ficha de evento | `client/src/pages/EventDetail.tsx` (+ `EventDetailModal.tsx`) |
| Explorar y filtros | `client/src/pages/Explore.tsx`, `components/filters/*` |
| Home logueado / anónimo | `pages/UserHome.tsx` / `components/home-v2/NetflixGridHome.tsx` |
| Agenda / Guardados | `pages/Agenda.tsx` + `components/agenda/*` / `pages/Vibras.tsx` |
| Onboarding | `pages/Onboarding.tsx`, `pages/BienvenidaBeta.tsx` (`/unirme`), `pages/Descubri.tsx`, `components/WelcomeGuide.tsx` |
| Organizador | `client/src/pages/organizador/*` |
| Landing de ciudad | `client/src/pages/CityLanding.tsx` + `lib/cityLandings.ts` + `server/cityLandings.ts` |
| Recomendaciones | `server/services/recommendation/*`, `hooks/usePersonalizedRanking.ts` |
| Newsletter | `server/services/weeklyEmail/*`, `server/services/email/*` |
| Generador de placas / carrusel | `server/services/socialCard*.ts`, `carouselDrafts.ts`, `components/admin/ContentGeneratorSection.tsx`, `CarouselTraySection.tsx` |
| SEO | `server/eventOgTags.ts`, `server/cityLandingSeo.ts`, `server/venuePages.ts`, `components/SEOHead.tsx`, sitemap en `routes.ts` |
| Notas del agente de Replit (trampas aprendidas) | `.agents/memory/*.md` |
