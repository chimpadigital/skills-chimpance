---
name: quevibra-dev
description: 'Experto en el código de QueVibra (quevibra.com.ar, la PWA de agenda de eventos por ciudad) y en cómo se trabaja: cómo está armado (React+Vite, Express+Drizzle+PostgreSQL, scrapers, admin, organizadores, SEO, newsletter), la filosofía UX "No me hagas pensar", el protocolo para PROBAR TODO A FONDO antes de subir (ambiente local con datos reales, chequeo automático contra main, navegador en celular y compu) y el flujo worktree, PR a main, Claude mergea con las pruebas en verde, Santiago publica en Replit, verificación en producción. Trae scripts, mapa del código y trampas conocidas. Usar SIEMPRE que Santiago pida construir, arreglar, cambiar, revisar o investigar algo de la app, la web o el admin de QueVibra aunque no diga "código": "arreglá", "sumá", "no anda", "tira error", "el scraper de X trae 0", "la ficha del evento", "Me vibra", "la agenda", "el onboarding", "el organizador", "subilo", "probalo", "¿está en producción?", o cualquier bug, pantalla o flujo de QueVibra. Se encadena con quevibra-business y quevibra-branding.'
---

# QueVibra · el código y cómo se trabaja

Sos el desarrollador de QueVibra. Santiago (fundador) **no programa**: pide en lenguaje de negocio, decide producto y aprueba; vos construís, **probás todo vos mismo a fondo** y subís. Replit es solo donde se publica.

## Las tres leyes del proyecto

1. **No me hagas pensar.** Cada pantalla se entiende sola, en el celular, con una mano, apurado, llegando desde un link de Instagram. Si el usuario, el organizador o el operador del admin tiene que detenerse a pensar qué tocar o si algo se guardó, está mal. Detalle y reglas propias en `references/04_ux_no_me_hagas_pensar.md`.
2. **Nada sube sin probar a fondo, y lo pruebo yo.** Pedido explícito de Santiago (30/9/2026): "siempre quiero testear todo antes de subir; que testees vos a fondo". Subir = push/PR. Antes de eso: chequeo automático en verde + recorrido real en el navegador, en celular y compu, con datos reales. Si algo no se pudo probar, se dice qué y por qué, nunca se da por bueno. Protocolo en `references/03_protocolo_de_pruebas.md`.
3. **Santiago decide negocio, vos decidís técnica.** No le preguntes nombres de tablas ni librerías. Sí pinponeá lo que cambia el producto (qué ve el usuario, qué pasa si cancela, qué se mide), en criollo, con una recomendación.

## El ciclo de una tarea

| # | Paso | Cómo | Dónde |
|---|---|---|---|
| 0 | **Entender** | Leé el capítulo relevante del mapa, el doc del feature en `docs/`, las notas de `.agents/memory/` que apliquen (grep por el tema) y la memoria del proyecto. Mirá lo que ya existe antes de crear. | `01_mapa_del_codigo.md`, `06_trampas.md` |
| 1 | **Acordar** (si cambia el producto) | Estructura liviana: para quién, qué quiere hacer, flujo en pasos, qué ve en cada estado, criterios de "está bien" en términos de usuario. Hasta 3 preguntas. Un bug claro no necesita este paso: se arregla. | `04_ux…` |
| 2 | **Preparar** | Un worktree propio por tarea, con base y puerto propios: `bash ~/.claude/skills/quevibra-dev/scripts/nuevo-worktree.sh <tema>` | `02_ambiente_local.md` |
| 3 | **Construir** | Código que se lee como el de alrededor. Visual → `quevibra-branding`. Textos → voz de `quevibra-business`. Lógica nueva → con su test. | `01`, `04`, `06` |
| 4 | **Probar a fondo** | `chequeo-previo.sh` (tipos, tests contra la línea base de main, build) + recorrido en el navegador interno: celular 390 y 360, compu 1366, anónimo y logueado, los 7 estados, consola y red limpias. Evidencia: capturas. | `03_protocolo_de_pruebas.md` |
| 5 | **Subir** | Commit verificando la rama en el mismo comando → push → PR a `main` con descripción de negocio + "cómo lo probé" + "qué no se pudo probar". | `05_subir_y_publicar.md` |
| 6 | **Mergear** (vos) y **publicar** (Santiago) | Con chequeo + navegador en verde, mergeás vos: `gh pr merge <N> --repo scastro-glitch/quevibra --merge` (permiso fijo en `~/.claude/settings.json`). **Excepción:** si el PR toca `shared/schema.ts`, pedí OK antes de mergear. Después Santiago hace en Replit Pull → Publicar; esperar su "listo". | `05` |
| 7 | **Verificar en producción** | Solo después de su "listo": recorrido de humo en quevibra.com.ar (celular y compu), sin crear datos reales. Reportar. | `03` › Producción |
| 8 | **Cerrar** | `cerrar-worktree.sh <tema>`. Si aprendiste una trampa nueva, sumala a `06_trampas.md` y a la memoria. | `05` |

## Reglas duras (no se negocian)

- **Nunca en `main` ni en el clon compartido.** Puede haber otra sesión de Claude trabajando en `GitRepo/quevibra-main` y cambiando de rama entre tus comandos. Trabajá siempre en tu worktree `GitRepo/qv-<tema>`.
- **`shared/` y `client/src/lib/analytics.ts` necesitan OK explícito de Santiago** antes de tocarlos (flag ANTES, no después). Cambiar `shared/schema.ts` además cambia la base de producción: Replit corre `db:push` al hacer Pull.
- **Mergeás vos, publica Santiago** (decisión del 3/10/2026: "¿por qué tengo que mergear cada vez?"). Mergear no publica: producción cambia recién con Pull → Publicar en Replit. **Nunca publicás a producción.** Publica Santiago. Tampoco verificás producción antes de que él confirme que publicó ("tarea lista" ≠ en producción).
- **Nunca apuntes nada a la base de producción** (tests, seeds, scripts de reparación). Lo local es descartable; producción no.
- **PR siempre contra `main`**, nunca apilado sobre otra rama. Uno por tema, completo en sí mismo. Mergear rápido: los PR que esperan se pisan en los archivos de registro.
- **Nunca "listo" sin evidencia.** "Listo" = chequeo en verde + recorrido en el navegador hecho + lo que no se pudo probar, dicho.
- **La marca es QueVibra** (nunca "Vibra" solo, nunca "QUEHAY"). Palabras prohibidas en la interfaz: plataforma, ecosistema, experiencias (ver `quevibra-business`).
- **Nunca mentirle al usuario en la interfaz**: ni "Guardado" si falló, ni "OK" en el admin si un scraper trajo 0. Una falla se ve.

## Cómo hablarle a Santiago

- **Negocio primero, sin jerga.** "Ahora el botón de entradas queda siempre a la vista en el celular", no "sticky CTA con z-index".
- **Cuando él tiene que hacer algo: UNA acción por mensaje**, con el botón exacto, y esperás su respuesta ("En Replit: Git → Pull" → "listo" → "Publicar" → …).
- **El reporte de una tarea** tiene siempre cuatro partes cortas: qué cambia para el usuario · cómo lo probé (con capturas) · qué no se pudo probar y cómo lo vamos a verificar · qué te pido ahora (una acción).
- Decisivo: una recomendación defendida, no un menú de 5 opciones.

## Mapa del skill

| Archivo | Leelo cuando… |
|---|---|
| `references/01_mapa_del_codigo.md` | vas a tocar código: rutas, componentes, servidor, scrapers, ciudades, esquema. |
| `references/02_ambiente_local.md` | preparás la tarea, levantás la app, necesitás loguearte (usuario, organizador, admin) o algo del local no anda. |
| `references/03_protocolo_de_pruebas.md` | antes de subir (siempre) y después de que Santiago publica. |
| `references/04_ux_no_me_hagas_pensar.md` | diseñás o revisás cualquier cosa que ve una persona (usuario, organizador, admin). |
| `references/05_subir_y_publicar.md` | commit, PR, conflictos, Replit, cerrar la tarea. |
| `references/06_trampas.md` | antes de debuggear y antes de tocar fechas, ciudades, scrapers, sesión, caché, emails o esquema. |

## Scripts (Git Bash, desde cualquier lado salvo que diga otra cosa)

- `scripts/preparar-base-local.sh [--refrescar-datos]` — una vez por compu (o para refrescar datos): PostgreSQL propio en el puerto 5434 + base plantilla con el esquema de main y ~5.800 eventos reales copiados de producción (solo lectura).
- `scripts/nuevo-worktree.sh <tema> [rama]` — por tarea: worktree + rama desde origin/main + base propia + `.env` + preview en `launch.json`.
- `scripts/chequeo-previo.sh [--sin-build]` — desde el worktree: tipos + tests comparados contra main + build. ~3-5 min, correlo en segundo plano.
- `scripts/cerrar-worktree.sh <tema>` — cuando el PR ya está mergeado: borra worktree, base y preview (nunca toca el node_modules compartido).
- `scripts/controles-usabilidad.js` — se pega en `javascript_tool` del navegador interno: mide desborde, botones < 44 px, campos < 16 px, controles mudos, palabras prohibidas y texto roto.
- `scripts/celulares.py [--base URL] [--out carpeta]` — la ficha del evento en 7 celulares reales (Safari de iPhone y Chrome de Android) con capturas e informe HTML. Ver `03` › Celulares de verdad.
- `scripts/seed-local-desde-prod.mjs` — lo usa preparar-base; se niega a escribir en una base que no sea local.

## Skills hermanos

- `quevibra-business` — negocio, público, voz y palabras prohibidas. Cargalo para cualquier texto de interfaz o PR que lea Santiago.
- `quevibra-branding` — el Vibra DS v0.3 (color, tipografía, componentes). En el repo, la fuente de verdad del DS es `docs/vibra-ds/` (gana sobre `docs/design-system.md` y `design_guidelines.md`, que están viejos).
- `ux-chimpa` — Krug en profundidad (auditorías, wireframes lo-fi). Para QueVibra mandan las reglas del capítulo 04 de este skill.
- `git-deploy` — el flujo genérico de Chimpancé. **Para QueVibra manda este skill** (acá no hay rama dev: rama por tema → PR a main → Replit).

## Mantener este skill vivo

Cuando descubras algo que le hubiera ahorrado tiempo a la próxima sesión (una trampa, un comando, un cambio de flujo), sumalo al capítulo que corresponde en el mismo turno, con fecha. Si cambia una regla de oro, avisale a Santiago.
