# QA en Comunidad Emprendedora (PROME / Banco Provincia)

Carpeta raíz: `C:\Users\santi\Downloads\Comunidad prome`. Dos repos en `code/`:
- **Back:** `code/comunidad-prome-back` — Laravel 12 / PHP 8.4 / MySQL 8.4. Rama de integración `laravel`; funcionalidades en `laravel-<modulo>` (ese prefijo dispara el CI `tests`).
- **Front:** `code/comunidad-prome-front` — Next.js 15 / React 19, PWA. Rama de integración `refactor/front-stack-laravel`; funcionalidades en `feat/<nombre>`.

Casi toda entrega toca **los dos repos**: se prueban y se fusionan de a pares.

## Requisitos del entorno (Windows, Git Bash)

- MySQL de usuario (sin servicio): `"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --defaults-file="C:\Users\santi\.mysql-prome\my.ini" --console` (en segundo plano). Ver `C:\Users\santi\.mysql-prome\LEEME.txt`. El usuario `prome` puede crear bases `comunidad_prome*`.
- Composer: `export PATH="$PATH:/c/Users/santi/bin"`.
- pnpm: `corepack pnpm@10.26.1 <comando>` (el front pide Node 22; con 24 solo avisa).
- Playwright ya tiene Chromium en `%LOCALAPPDATA%\ms-playwright`.

## Ambientes y puertos

| Ambiente | Front | Back | Base | Para qué |
|---|---|---|---|---|
| Desarrollo | `localhost:3000` (`next dev`) | `127.0.0.1:3001` | `comunidad_prome` | Trabajar |
| **Prueba local** | **`127.0.0.1:3200`** (`next build` + `start`) | `127.0.0.1:3201` (`APP_ENV=staging`) | `comunidad_prome_prueba` | Probar lo integrado, como lo vería el cliente |
| E2E contra back real | `127.0.0.1:3600` | `127.0.0.1:3601` | `comunidad_prome_t_e2e` | La batería e2e real |
| Paridad | — | `127.0.0.1:3011` (o 3311/3411 por agente) | `comunidad_prome_parity*` | Contrato con el Express viejo |
| Agentes en paralelo | `127.0.0.1:3700`, `3800`… | `3701`, `3801`… | `comunidad_prome_t_<agente>` | Cada agente con su worktree, su base y su par de puertos |
| Producción | comunidadprome.manada.me | Replit (Express, todavía) | Neon | No se prueba desde acá |

`.claude/launch.json` (raíz) tiene `api-laravel`, `front-next`, `prueba-api` y `prueba-front`.

**El ambiente de prueba se abre con `127.0.0.1:3200`, nunca `localhost:3200`**: las cookies no distinguen puerto y una sesión ahí pisa la de desarrollo. Instructivo: `code/ambiente-prueba/LEEME.md`.

Pasar una funcionalidad terminada a prueba:
```bash
git -C code/ambiente-prueba/back  merge --no-ff laravel-<funcionalidad>
git -C code/ambiente-prueba/front merge --no-ff feat/<funcionalidad>
bash code/ambiente-prueba/actualizar.sh        # --base-limpia borra y recarga demo
```
Y reiniciar `prueba-api` y `prueba-front`.

## Datos de prueba

- 10 usuarios demo (`database/seeders/DemoUsersSeeder.php`; la contraseña la imprime el seed). Se ingresa con DNI o CUIT; el alta nueva es solo con CUIT/CUIL.
- Padrón ficticio: `app/Support/Identity/MockPadron.php` (43 registros). Para un alta nueva hace falta un CUIT del padrón que no tenga cuenta.
- Modo demo (`DEMO_MODE=true`, `AUTH_VALIDATION_MODE=mock`): el código de verificación se ve en pantalla y `000000` sirve siempre.
- `POST /api/dev/reset-mock-users` y `POST /api/dev/seed-demo-users` con `X-Dev-Token` (= `DEV_RESET_TOKEN`) resetean los usuarios del padrón. **Nunca** en un ambiente compartido (prueba) mientras otro lo está usando.

## Back: la batería (desde `code/comunidad-prome-back` o su worktree)

```bash
vendor/bin/pint --test                   # estilo (el CI lo exige)
php artisan test --compact               # ~2000 tests, ~1 min, MySQL real (.env.testing)
composer openapi                         # regenera resources/api/openapi.json; el CI falla si quedó desactualizada
```

**Contrato con Express (paridad).** Todo endpoint heredado responde igual que el Express viejo, salvo desvíos aceptados en `parity/accepted-deviations.json`. Correrla local:
```bash
DB_DATABASE=comunidad_prome_parity php artisan migrate:fresh --force
(cd parity && corepack pnpm@10.26.1 install --frozen-lockfile)
export DEV_TOKEN=parity-local-$(openssl rand -hex 8) DB_DATABASE=comunidad_prome_parity PORT=3011 PARITY_SERVER_LOG_DIR=<scratchpad>/parity-logs
bash parity/ci/laravel-up.sh default .
(cd parity && BASE_URL=http://127.0.0.1:3011 PARITY_TARGET=laravel corepack pnpm@10.26.1 verify)
kill "$(cat "$PARITY_SERVER_LOG_DIR/server.pid")"
```
Resultado esperado: 0 diff y 0 fallidos (al 30/9, con logo, fotos y catálogo: 117 escenarios, 98 idénticos + 19 aceptados). Cada desvío nuevo lleva su motivo y su decisión en `parity/accepted-deviations.json`.

**Un back propio para un agente o una prueba** (sin tocar el `.env` ni la rama del clon):
```bash
DB_DATABASE=comunidad_prome_t_<algo> php artisan migrate:fresh --seed --force
DB_DATABASE=comunidad_prome_t_<algo> RATE_LIMITS_ENABLED=false DEMO_MODE=true AUTH_VALIDATION_MODE=mock \
  ALLOWED_ORIGINS=http://127.0.0.1:<puerto-front> php artisan serve --host=127.0.0.1 --port=<puerto> --no-reload
```
`--no-reload` hace que `artisan serve` pase las variables al proceso hijo.

**Prueba de control de un arreglo:** el test nuevo tiene que fallar sin el arreglo. Se comprueba volviendo el archivo arreglado a la versión de la rama base (`git checkout <base> -- <archivo>`), corriendo solo ese test (`--filter`) y restaurando.

**Oráculo de Zod.** Toda clase en `app/Http/Requests/*/*Request.php` extiende `ZodRequest` y está en `tests/Unit/Zod/ZodParityTest::REQUESTS`, contrastada contra Zod 3.25.76 real. Al sumar un Form Request:
1. Schema equivalente en `tests/Unit/Zod/zod-oracle.cjs` y casos **al final del archivo** (así no se mueven los índices de los casos existentes).
2. `npm install zod@3.25.76` en el scratchpad y `ZOD_PATH=<scratchpad>/node_modules/zod node tests/Unit/Zod/zod-oracle.cjs > tests/Unit/Zod/zod-oracle.json`.
3. Verificar que los casos anteriores quedaron idénticos (comparar el prefijo del JSON).
Las subidas multipart no usan Form Request: se validan en un servicio.

**Operación nueva en la API:** sumarla a `OPERACIONES_NUEVAS` en `tests/Feature/Docs/ApiReferenceTest.php` (con su decisión) y al `reason` del desvío `meta/openapi-json-es-publico-y-documenta-la-api` en la paridad.

## Front: la batería (desde `code/comunidad-prome-front` o su worktree)

```bash
corepack pnpm@10.26.1 typecheck
corepack pnpm@10.26.1 lint
corepack pnpm@10.26.1 test:unit          # node --test tests/*.test.ts
corepack pnpm@10.26.1 test:e2e           # Playwright con la API simulada (interfaz)
BACKEND_URL=http://127.0.0.1:3001 corepack pnpm@10.26.1 gen:api   # tipos desde la spec del back
```

**E2E contra el back real** (rama `feat/e2e-flujos` desde el 30/9, decisión del front 0012; ver «Batería e2e real» en su `README.md`):
```bash
export PATH="$PATH:/c/Users/santi/bin"
corepack pnpm@10.26.1 test:e2e:real -- --back ../wt-e2e-back                  # resetea la base, compila, corre y apaga
corepack pnpm@10.26.1 test:e2e:real -- --back ../wt-e2e-back --sin-build      # reusa el build
corepack pnpm@10.26.1 test:e2e:real -- --back ../wt-e2e-back --sin-build --project=mobile-390 -g "Alta"
```
- El runner (`scripts/e2e-real.mjs`) le pregunta a Laravel qué base va a usar y **aborta si el nombre no tiene «e2e»**: nunca borra otra base. Hace `migrate:fresh --seed`, levanta back 3601 y front 3600 (`next start`), corre `playwright.real.config.ts` (desktop-chrome y mobile-390) y apaga todo aunque se corte.
- Resultados: `playwright-report-real/index.html` y `playwright-report-real/usabilidad.md` (violaciones de usabilidad separadas del resultado funcional). Logs de servidores en `.e2e-real/`.
- Navegador: Playwright 1.59.1 pide Chromium build 1217 y en la máquina hay 1208 y 1228. Sin descargar nada: `E2E_CHROMIUM_EXECUTABLE="$LOCALAPPDATA/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe"`. La solución prolija es `pnpm test:e2e:install` (descarga el navegador; pedir OK).
- Tarda ~4–7 min en Windows (`artisan serve` atiende de a un pedido). Al 30/9 da rojo a propósito: cada bug conocido tiene su test que falla hasta que se arregla.

## Verificación en el navegador

- Desarrollo: `localhost:3000` (recarga en caliente). Prueba: `127.0.0.1:3200` (compilado).
- En formularios, escribir con clic + tipeo: `form_input` no dispara la validación de React Hook Form.
- Revisar siempre: celular 375–390 px (sin desborde, botones ≥ 44 px), título de la pestaña, consola sin errores propios (los 401/404 del chequeo de sesión y de "¿ya tenés negocio?" son esperables), y los estados de error.
- Los 404 de `/api/emprendimientos/me` antes de crear el negocio son esperables.

## Trampas conocidas

- Cookies por host, no por puerto (ver arriba).
- La historia de `laravel` y `refactor/front-stack-laravel` fue reescrita el 29–30/9: antes de probar, `git fetch` y comparar con el remoto.
- `sitioWeb` solo acepta http/https desde la decisión 0015 (rama `laravel-perfiles-fotos`); antes aceptaba `javascript:`. El front igual filtra al enlazar.
- `LimitRequestBody` corta en 100 KB todo `/api`; las subidas de logo y fotos tienen su excepción (5 MB + 64 KB) y en App Service necesitan `PHP_INI_SCAN_DIR` (decisión 0016).
- Los CUIT de prueba tienen que ser **válidos** (dígito verificador): un CUIT inválido prueba el camino de la validación, no el que se quiere probar. Calcularlo con `DocumentNumber::isValidCuit` en vez de inventarlo.
- Con varios agentes en paralelo, cada uno numera su decisión con «el siguiente libre» y chocan (el 30/9 hubo tres 0012 en el front). Asignar el número a cada agente al encargarle el trabajo; si igual chocan, renumerar al fusionar y cambiar solo las referencias de los archivos de esa rama (las de decisiones del back con el mismo número quedan).
- La máquina de Santiago se satura con varios agentes compilando: en `next dev` una pantalla nueva puede tardar casi un minuto en compilar y una navegación quedar abortada. Para verificar flujos, mejor el ambiente de prueba compilado.
- El proxy del front agrega `Cache-Control: private, no-store` a todo `/api/*`: revisarlo para imágenes.
- `.env.testing` del back no está versionado: cada worktree necesita el suyo, con una base de tests propia.
