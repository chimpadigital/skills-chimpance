# 03 · Protocolo de pruebas: "testeá vos, a fondo, antes de subir"

Pedido de Santiago (30/9/2026): **siempre se prueba todo antes de subir, y lo prueba Claude a fondo**. Subir = push / PR. Santiago no tiene cómo revisar el código: el informe de pruebas es su única garantía, así que nunca se redondea para arriba.

El método general (pirámide, diseño de casos, tests que no fallan al azar, formato del informe) está en el skill `qa-chimpa`. Este capítulo es **cómo se aplica en QueVibra**, con sus comandos y herramientas. Si chocan, manda este.

## Contenido
1. Antes de codear: los criterios de "está bien"
2. Nivel 1 · Chequeo automático (`chequeo-previo.sh`)
3. Nivel 2 · Tests nuevos que acompañan el cambio
4. Nivel 3 · Recorrido en el navegador (celular y compu)
5. Nivel 4 · Barrido de regresión de los flujos críticos
6. Qué probar según el tipo de cambio
7. Antes de subir: checklist
8. Después de publicar: verificación en producción
9. Cómo se informa

---

## 1 · Antes de codear: los criterios de "está bien"

Escribí 3 a 7 criterios **en palabras del usuario**, observables, incluyendo lo que NO tiene que pasar. Son los que después se recorren uno por uno en el navegador y los que van al PR.

> Ej. "Botón Volver de la ficha":
> - En el celular, el botón "Volver" se puede tocar cómodo con el pulgar (≥ 44 px).
> - Si llegué desde Explorar, vuelve a Explorar en el mismo lugar del scroll.
> - Si llegué desde un link de WhatsApp (sin historial), no me saca de QueVibra: me lleva a Explorar.
> - En la compu se ve igual que antes.

Si es un bug: primero reproducilo (local o producción, solo lectura) y escribí el test que falla. Recién después arreglá.

## 2 · Nivel 1 · Chequeo automático

Desde el worktree de la tarea, en segundo plano (tarda 3-5 min):
```bash
bash ~/.claude/skills/quevibra-dev/scripts/chequeo-previo.sh
```
| Paso | Vara | Por qué |
|---|---|---|
| Archivos cambiados | Avisa si tocaste `shared/`, `analytics.ts`, archivos de registro o dependencias | Son los que necesitan OK o generan conflictos |
| Tipos (`tsc`) | **0 errores** (main está en 0 desde el 30/9/2026) | Un error de tipos casi siempre es un bug real |
| Tests (`vitest`, suite completa, ~1.570 tests, **con `TZ=UTC` como producción**) | **0 fallas nuevas.** Main tiene ~16 fallas viejas conocidas (newsletter, Cinemark, PaseShow, Rosario…; ver `06` › Pruebas); el script las compara contra `origin/main` y las descuenta. Las inestables (fallan al azar también en main) se informan aparte | Un cambio chico rompe cosas lejanas; y la compu en hora argentina esconde errores de horario que en producción se ven |
| Build de producción | Tiene que compilar | Es lo mismo que corre Replit al publicar |

Sale "✅ CHEQUEO AUTOMÁTICO EN VERDE" o "⛔ NO SUBIR TODAVÍA". Con rojo no se sube: se arregla. Si una falla "nueva" es en realidad del entorno, demostralo (corriendo ese test en `qv-referencia-main`) y decilo en el PR; no la ignores en silencio.

Ojo: `tsc` **no mira los archivos de test** (están excluidos en tsconfig). Que el test compile lo garantiza vitest al correrlo.

## 3 · Nivel 2 · Tests nuevos

Todo cambio de lógica viene con su test, en la capa más baja que alcance:
- **Función pura** (fechas, ciudades, clasificación, armado de textos, reglas de recomendación) → unitario en `server/tests/` o `client/src/**/*.test.ts` (corren en node, sin DOM; para componentes, `renderToStaticMarkup`).
- **Scraper** → fixture HTML/JSON guardado en `server/scrapers/__fixtures__/<fuente>/` + test que parsea el fixture. Incluí un fixture "roto" (markup cambiado, página anti-bot) y verificá que **tira error** en vez de devolver vacío.
- **Endpoint** → supertest montando el router (patrones en `organizerDevLogin.test.ts`, `schedule.integration.test.ts` con `testAppFactory.ts`). Los de base real escriben en la `DATABASE_URL` de la tarea: nunca otra.
- **Bug** → el test que lo reproduce va primero y tiene que fallar antes del arreglo.
- Nombres que se leen como la regla: `"un show a las 21:00 AR cuenta para el mismo día"`, no `"test 3"`.

Para correr solo lo tuyo mientras trabajás: `DATABASE_URL=$(grep ^DATABASE_URL= .env | cut -d= -f2-) npx vitest run <archivo>`.

## 4 · Nivel 3 · Recorrido en el navegador

Lo que los tests no ven: si se entiende, si se ve bien, si el flujo completo anda con las piezas reales. **Siempre**, para cualquier cambio que se vea.

1. `preview_start {name: "qv-<tema>"}`. Esperá a que responda (la primera compilación tarda).
2. **Por cada criterio del punto 1**, hacelo como lo haría una persona: clics y tipeo reales (`computer` / `form_input`), no `fetch` (salvo el atajo de login de `02`).
3. **Tres tamaños**: 390×844 (celular), 360×640 (celular chico: acá se cortan los botones), y compu (`preset: "desktop"`). Recargá después de cambiar el tamaño.
4. **Los públicos que toca el cambio**: anónimo, usuario logueado, usuario nuevo (sin onboarding), organizador, admin. Recordá que `/` muestra dos homes distintas según la sesión.
5. **Los 7 estados** de cada pantalla tocada (ver `04`): cargando, vacío la primera vez, sin resultados, error, sin permiso, no existe, guardando. Cómo provocarlos:
   - Vacío / sin resultados: elegí una ciudad o filtro sin eventos, o un usuario sin guardados.
   - Error del servidor: en la pestaña, forzá una respuesta fallida para ese endpoint antes de la acción:
     ```js
     const _f = window.fetch; window.fetch = (u, o) => String(u).includes('/api/events/') && o?.method === 'POST'
       ? Promise.resolve(new Response('{"message":"falla de prueba"}', {status: 500})) : _f(u, o);
     ```
     y verificá que la pantalla **diga la verdad** (no muestre "guardado") y que se pueda reintentar. Recargá para sacarlo.
   - Lento: lo mismo con un `setTimeout` antes de resolver → ¿se ve que está cargando? ¿se puede tocar dos veces?
   - No existe: `/evento/slug-inventado-<uuid-falso>` y un evento pasado.
6. **Controles automáticos de usabilidad**: leé `scripts/controles-usabilidad.js` y pegalo en `javascript_tool` en cada pantalla tocada, en 390 y en 360. Mide desborde horizontal, botones < 44 px, campos < 16 px, controles sin nombre, imágenes sin alt, palabras prohibidas, texto roto (`undefined`, `NaN`, JSON crudo, HTML codificado) y qué acciones quedan fijas abajo. Lo que ya estaba mal antes de tu cambio se anota como deuda, no se silencia.
7. **Consola y red limpias**: `read_console_messages {onlyErrors:true}` (los avisos de CSP "report-only" de Google Ads son esperables) y `read_network_requests {urlPattern:"/api/"}` sin 4xx/5xx inesperados. `preview_logs {level:"error"}` del servidor.
8. **Persistencia**: después de una acción que guarda, recargá la página y confirmá que sigue ahí (y en la base si hace falta: `psql` contra la base de la tarea). La interfaz optimista puede mentir; la recarga no.
9. **Evidencia**: captura (`computer screenshot`, `scale` 0.5-0.6) del antes/después en celular, y de la compu si cambió. Si la captura sale verde con manchas, es el splash: esperá y repetí.


### Celulares de verdad (Safari y Chrome reales) · `scripts/celulares.py` (3/10/2026)

El navegador interno es Chrome achicado: no ve cómo dibuja **Safari de iPhone** (donde más se rompe) ni toca con el dedo. Para la ficha del evento (y cualquier cambio que la toque: `EventDetail`, barra fija, header, banner beta, `index.css`):
```bash
python ~/.claude/skills/quevibra-dev/scripts/celulares.py --base http://localhost:<puerto> --out "<carpeta>"   # local, antes de subir
python ~/.claude/skills/quevibra-dev/scripts/celulares.py --out "<carpeta>"                                    # producción, solo lectura
```
7 celulares (iPhone SE, 13 mini, 15 Pro, 15 Pro Max con motor de Safari; Android 360, Galaxy A55, Pixel 7 con Chrome) × 7 eventos difíciles elegidos solos (título larguísimo, sin foto, gratis, sin entradas, varios días, muchas funciones, descripción larga). Mide: desborde, contenido cortado, botones < 44 px, texto < 12 px, barra fija (pegada abajo, botones cortados por el borde, tapa el final), **título visible en la primera pantalla**, foto principal (carga y ≥ 400 px), texto roto, toque real de "Me vibra" anónimo → panel de registro → cerrar tocando afuera → la pantalla sigue respondiendo; consola y pedidos fallidos. Deja `informe.html` (hallazgos agrupados + capturas arriba/abajo/registro por celular) y `resultados.json`. **Igual mirá las capturas vos**: los dos hallazgos graves del 3/10 se vieron primero a ojo y después se convirtieron en control.
Ampliarlo a otra pantalla: copiar el patrón (rutas + `MEDIR_JS` con los `data-testid` de esa pantalla).

## 5 · Nivel 4 · Barrido de regresión de los flujos críticos

Si tocaste algo compartido (`EventCard`, `EventSection`, `App.tsx`, `queryClient`, `useAuth`, `index.css`, el header o la barra inferior, `storage.ts`, `routes.ts` en lo público, la sesión), recorré en celular estos flujos, 5-10 minutos:

1. Anónimo: home → Explorar → filtrar por ciudad → abrir un evento → "Ver entradas" (abre la ticketera) → volver.
2. Anónimo toca "Me vibra" → aparece el pedido de registro (no se congela la pantalla).
3. Logueado: "Me vibra" y "Agendar" en un evento → recargar → siguen marcados → aparecen en Guardados y en Agenda.
4. Landing de ciudad (`/cordoba`) con eventos, y la de una ciudad chica.
5. Organizador: `/organizador/eventos/nuevo` → completar los 2 pasos → queda en su lista.
6. Admin: entrar → Estado de scrapers → la lista carga.
7. `/evento/<uno real>` sin JS de por medio: `curl` devuelve 200 con título y JSON-LD; un slug inventado devuelve 404.

## 6 · Qué probar según el tipo de cambio

| Cambio | Además de lo general |
|---|---|
| **Pantalla / componente** | 3 tamaños, 7 estados, controles de usabilidad, textos con la voz de QueVibra, colores y tipografía del DS (`quevibra-branding`), modo oscuro si la pantalla lo tiene |
| **Formulario** (organizador, admin, contacto) | Tipear como persona; formatos reales (tildes, "$ 1.500", "21 hs", Instagram con y sin @); error por campo sin borrar lo cargado; doble clic en enviar = un solo envío; volver atrás no pierde lo cargado |
| **Endpoint** | Sin sesión, sesión de otro usuario, datos inválidos, respuesta con la forma exacta; **si la respuesta cambia con la sesión → `Cache-Control: no-store`** (ver `06`) |
| **Scraper** (regla de Santiago, 2/10/2026: "que traiga los eventos, que la info sea consistente, y me importa mucho la foto") | **Siempre en el admin**: los archivos de registro (`01` › Scrapers) y verlo en "Estado de scrapers". Fixture bueno + fixture roto → error visible. **Corrida de punta a punta contra la base local** (la función `sync…`, no solo el scrape) y revisar lo GUARDADO: cantidad > 0 y parecida a la del sitio; título; fecha y hora AR contra la fuente en 5 eventos; lugar; ciudad (nunca "Córdoba" por defecto); precio; link de entradas; descripción con el formato único (`descriptionFormat.ts`: sin HTML, sin mayúsculas gritando, sin relleno). **Foto**: % con imagen; que cada URL cargue (200 y tipo imagen); tamaño razonable (≥ ~400 px de ancho, no un ícono); que no sea la misma imagen en muchos eventos (logo o placeholder); y mirarlas juntas en el navegador (hoja de contactos) en celular y compu. Que no cree duplicados con otra fuente. Todo eso, con números, en "Cómo lo probé" del PR |
| **Job pesado del admin** | Responde en < 1 s (202) y sigue en segundo plano; el estado se puede consultar; nunca un endpoint que espere > 60 s |
| **Fechas / horas** | Tests con `TZ=UTC` **y** con `TZ=America/Argentina/Cordoba` (tienen que pasar en las dos); un evento a las 21:00, otro a las 23:30 y otro a las 00:00 AR (cruzan el día UTC), uno sin hora, uno de varios días; comparar 5-10 eventos contra la fuente original (misma hora que en la ticketera); probar "hoy / este finde / esta semana" un viernes y un domingo (cambiando datos, no el reloj) |
| **Scraper que "trae poco" o "no trae"** | Comparar contra la fuente **completa**, paginando hasta el final (no solo la primera página): cuántos tiene la fuente vs cuántos tenemos, por ciudad; horas de una muestra contra la fuente; ver si varias ciudades comparten una sola tarjeta en el admin (una falla de una la tapa el verde de otra) |
| **Ciudades** | Las listas que hay que alinear (`01` › Ciudades); ciudad nueva aparece en selector, filtro, landing y sitemap; un evento sin ciudad no termina en Córdoba |
| **SEO / páginas públicas** | `curl` de la ruta: status, `<title>`, description, canonical, OG, JSON-LD; ruta nueva registrada en `buildStaticPageMeta` (si no, 404 + noindex); sitemap |
| **Email** | Render de la plantilla en test; ver el HTML generado en el navegador; enlaces absolutos (`https://quevibra.com.ar/...`); en producción, envío a una casilla de Santiago |
| **Esquema (`shared/schema.ts`)** | OK de Santiago antes. `drizzle-kit push` sobre una copia con datos (la base de la tarea lo es): qué pasa con las filas existentes; ninguna columna creada por SQL crudo se borra (ver `06` › Esquema) |
| **Analytics / tracking** | El evento llega a `/api/track` con las props correctas y sin errores; nada de esto bloquea la acción del usuario |
| **Auth / sesión / onboarding** | Usuario nuevo, recurrente, organizador, admin; volver a la acción pendiente después del login; nada se congela; `/api/auth/user` sin caché |

## 7 · Antes de subir: checklist

- [ ] Criterios del punto 1 recorridos uno por uno en el navegador, con evidencia.
- [ ] `chequeo-previo.sh` en verde (sin `--sin-build`).
- [ ] Controles de usabilidad sin violaciones nuevas en 390 y 360.
- [ ] Consola, red y log del servidor sin errores nuevos.
- [ ] Barrido de regresión si tocaste algo compartido.
- [ ] Lista de lo que NO se pudo probar en local, con el plan para producción (`02` › Lo que NO se prueba en local).
- [ ] Nada de `.env`, claves ni datos reales en el commit; archivos agregados por nombre.
- [ ] Sin cambios en `shared/` o `analytics.ts` sin el OK escrito de Santiago.

## 8 · Después de publicar: verificación en producción

Solo cuando Santiago confirma que publicó (antes estarías probando la versión vieja).

1. **Confirmá que es la versión nueva**: `curl -s https://quevibra.com.ar/api/version` devuelve la hora (en milisegundos) en que arrancó el servidor. Si es anterior al momento en que Santiago publicó, todavía no está (también cambia con cualquier reinicio, así que solo sirve para descartar). La prueba definitiva es ver el cambio en la pantalla o en la respuesta.
2. **Recorrido de humo** de los criterios del punto 1 en `https://quevibra.com.ar`, con el navegador interno en 390 y en compu, **anónimo** (o con la sesión que Santiago tenga abierta, sin cambiar nada de su cuenta).
3. **Solo lectura** salvo OK explícito: no crear usuarios, eventos, likes ni publicaciones en producción para probar. Si hace falta escribir, pedíselo a Santiago como un paso aparte.
4. Endpoints que cambiaste: status, forma y headers (`curl -sD - -o /dev/null <url>`), sobre todo `Cache-Control` en lo que depende de la sesión. Si algo parece raro con la sesión, primero sospechá de la caché del edge y del método de prueba (`06` › Pruebas).
5. Lo que quedó "no probado en local" se prueba acá, con el plan que pusiste en el PR.
6. Scrapers: después de publicar, Santiago aprieta "Ejecutar ahora" (o esperás la corrida del cron) y se mira la tarjeta. Desde afuera: `curl -s "https://quevibra.com.ar/api/events?limit=6000"` y contar por `source`.

## 9 · Cómo se informa

A Santiago, en criollo y sin redondear (formato de `qa-chimpa`, adaptado):

```
**Qué cambia:** [en palabras del usuario]
**Cómo lo probé:** chequeo automático en verde (tipos 0 errores · N tests pasan, 0 fallas nuevas · build OK);
  recorrido en celular y compu: [criterios ✓]; [captura]
**Qué no pude probar y por qué:** [p. ej. "subir una foto: en mi compu no hay almacenamiento de imágenes — lo probamos en producción"]
**Problemas que encontré en el camino:** [si hubo, con gravedad y si ya están arreglados o anotados]
**Ahora te pido:** [UNA acción]
```

Si algo falló, va primero. Nunca "listo" sin la línea "Cómo lo probé".
