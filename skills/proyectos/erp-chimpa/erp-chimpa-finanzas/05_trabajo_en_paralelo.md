# 05 — Trabajo en paralelo (orquestación de módulos)

Playbook para cuando Santiago pide varios cambios del ERP a la vez ("hacé estas 3 cosas en paralelo"). El orquestador es la sesión principal con este skill cargado; NO hace falta un skill ni agente "arquitecto" aparte — este skill ES el arquitecto.

## La restricción estructural

Aunque el ERP se ve como módulos (Obligaciones, Deudas, Proyectos, Chat, Dashboard...), casi todos pasan por los mismos archivos troncales:

- `server/routes.ts` (~80 KB, TODOS los endpoints juntos)
- `shared/schema.ts` (las ~60 tablas)
- `server/storage.ts` y `server/index.ts`

Dos agentes editando cualquiera de estos a la vez se pisan. Y hay **un solo lugar de pruebas: dev-finanzas** (desde el 12/9/2026 no hay ambiente local; ver `01`): la verificación es siempre un embudo secuencial, y cada push a `dev` pisa lo que había.

## El método (subagentes en UNA sesión)

1. **Repartir por módulo** solo si los cambios son realmente independientes (ej.: una página del frontend + un service del backend). Si dos cambios tocan el mismo archivo troncal, se hacen en serie, no en paralelo.
2. **Instruir a cada subagente** que lea primero los capítulos relevantes de este skill (`00`, `03` como mínimo) — los subagentes NO cargan skills automáticamente; hay que pasarles las rutas (`C:\Users\santi\.claude\skills\erp-chimpa-finanzas\`).
3. **Asignar archivos exclusivos**: en el prompt de cada agente, decirle explícitamente qué archivos puede tocar y cuáles NO (los troncales quedan reservados para la sesión principal o para un solo agente).
4. **Integrar en la sesión principal**: los cambios a `routes.ts` / `schema.ts` / `storage.ts` los aplica la sesión principal al final, de una sola pasada.
5. **Verificar todo junto**: chequeos en la compu (`npm run build` + `tsc`), un commit por feature (no un mega-commit), UN solo push a `dev` con todo, esperar el deploy en verde y pasar el test obligatorio (cap. 01) de cada cambio en dev-finanzas con el Chrome logueado como admin.

## Qué NO hacer

- **Varias sesiones de Claude Code sobre el ERP a la vez**: se pisan en los troncales sin saberlo y cada una, al pushear a `dev`, reemplaza lo que desplegó la otra. Varias sesiones solo si los temas son de mundos distintos (una ERP, otra propuestas).
- **Worktrees para módulos del ERP**: la fusión genera conflictos en los troncales y cada copia no tiene su propio ambiente de pruebas. Reservar para algo excepcional y grande.
- **Paralelizar cambios de schema**: van SIEMPRE de a uno (una migración versionada por vez, ver `01`); dos migraciones generadas en paralelo se pisan el snapshot.

## Si algún día hace falta paralelismo real de pruebas

No se resuelve con ambientes locales (dados de baja el 12/9/2026). La opción sería pedirle al CTO un tercer ambiente en la nube (otra rama + otro servicio en el droplet). Solo si Santiago lo pide; hasta ahora nunca hizo falta.

## Dos sesiones sobre la misma carpeta de Mapas (25/9/2026, pasó de verdad)

La sesión de Mapas (rediseño) y la de "Mapas con Chimpa IA" trabajaron a la vez en `client/src/components/maps/` y
`server/domains/work/maps/`. Un `git add client/src/components/maps` (la carpeta entera) se llevó al commit los archivos a medio
hacer de la otra sesión y rompió el build en el CI. Regla: **en carpetas compartidas se agrega por archivo, nunca por carpeta**, y antes
de commitear se mira `git diff --stat` y `git status` de esa carpeta para reconocer hunks ajenos (`git add -p` si un archivo tiene de los
dos). Si otra sesión avisa qué archivos toca, esos no se agregan aunque aparezcan modificados.
