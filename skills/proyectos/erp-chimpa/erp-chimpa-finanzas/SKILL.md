---
name: erp-chimpa-finanzas
description: Experto en el ERP+CRM interno de Chimpancé Digital (Chimpa-Finanzas) — el sistema de finanzas, facturación, obligaciones, deudas, proyectos y CRM que vive SOLO en la nube, en dos ambientes: dev-finanzas.chimpance.digital (desarrollo/testing, rama dev, adonde va PRIMERO todo cambio) → finanzas.chimpance.digital (PRODUCCIÓN, rama main, por merge desde dev cuando Santiago lo pide); el ambiente local volvió el 29/9/2026 y es el primer escalón, con CI/CD por GitHub Actions en el servidor del CTO. Carga toda la lógica del sistema (obligaciones AR/AP como núcleo, multi-moneda ARS/USD/USD_BNA, IVA, cuotas), el stack (React+Vite+Express+Drizzle+PostgreSQL), los dos ambientes y cómo se pasa de uno a otro, el orden correcto de las migraciones versionadas, el Agente Chat con IA (arquitectura de borradores + confirmación humana), los bugs conocidos por corregir, los gotchas técnicos (drizzle-kit push prohibido, migraciones que corren solas en cada deploy) y el roadmap de futures. Incluye el capítulo 07 del Módulo Trabajo (proyectos → tareas → plantillas → feedback del cliente con IA, rondas, SDK, métricas): qué se hizo, cómo funciona y qué falta. Invocar SIEMPRE que Santiago trabaje en CUALQUIER tarea del ERP, o pregunte por "el módulo de proyectos", "las tareas", "el feedback del cliente", "las plantillas de proyecto", "la revisión del cliente", "el inbox de feedback", "qué falta del módulo Trabajo": "levantá el ERP", "el sistema de finanzas", "Chimpa-Finanzas", "el agente de captura", "bot-chat", cargar/ver deudas u obligaciones, "mi deuda total", titular Santiago/Chimpancé, tocar código del repo Chimpa-Finanzas, cambios de schema, migraciones, deploys a testing o producción, "migrá lo aprobado", "subí a producción", "pasá lo ✅", "hacé el pase", "qué falta migrar", debuggear el chat contable, o cuando pregunte cómo funciona algo del ERP. El CRM y el Growth OS (leads, oportunidades, pipeline, personas, empresas del CRM, tracking, propuestas medidas, audiencias, plugin de Gmail) tienen su propio skill, `crm-growth-chimpa`: invocar ese para esas tareas, y los dos juntos cuando haya que escribir código. También activar antes de proponer features nuevas, corregir bugs, o cualquier deploy a testing o producción. Si una tarea contradice las reglas de oro del workflow (se prueba en local, todo commit pasa por dev-finanzas para que las ramas no diverjan, y de ahí se mergea a main cuando Santiago lo pide; nunca sincronizar datos entre ambientes; migración versionada antes que SQL manual), frenar y avisar antes de avanzar.
---

# ERP Chimpa-Finanzas — Experto del sistema

Skill que carga todo el conocimiento del ERP+CRM interno de Chimpancé para operar, mantener y evolucionar el sistema sin redescubrirlo cada vez. Santiago NO programa: explicarle en criollo, decidir con criterio técnico propio, y verificar todo antes de reportar.

## Qué es (en una frase)

ERP+CRM a medida, hoy 100% propio, que vive **solo en la nube**, en dos escalones: **dev-finanzas (desarrollo/testing) → producción**. Desde el **12/9/2026 no se usa más ambiente local** (decisión de Santiago): el código se edita en la compu, pero se prueba en la nube. Desde el **8/9/2026 corre en PRODUCCIÓN en la nube del CTO**: https://finanzas.chimpance.digital (rama `main`), con https://dev-finanzas.chimpance.digital (rama `dev`) como ambiente de testing donde el resto del equipo prueba antes de que algo llegue a producción. Repo: `C:\Users\santi\Downloads\Chimpa2026\Chimpa-Finanzas` (GitHub `scastro-glitch/Chimpa-Finanzas`). El CTO montó el CI/CD el 1/9/2026; el 7/9/2026 se pusheó todo a `dev` y el 8/9/2026 Santiago dio el OK y todo el trabajo local se desplegó a `main`. La base de la nube arrancó vacía: no hubo migración de datos.

**Replit no se usa para nada** (des-replitización, 8/9/2026): no es hosting, no es ambiente, no es agente de desarrollo. Quedan restos históricos en el repo (`.replit`, `replit.md`, `client/replit_integrations/audio`, textos en `attached_assets/`) que son basura a limpiar, no partes vivas del proceso. Si algo dice "Replit" en la documentación vieja, leerlo como historia, no como instrucción.

## La lógica central del sistema

**Toda operación financiera nace como una OBLIGACIÓN** (`obligations`): dirección `AR` (por cobrar) o `AP` (por pagar). De ahí deriva todo:

```
Obligación (AR/AP, con owner: santiago|chimpance)
    ├── Cobro/Pago → Movement → MovementLines → actualiza saldo de Cashbox
    ├── Factura → IvaEntry → obligación AP de IVA SOLO al cierre de período (M+3)
    ├── FinancialDebt → cuotas (installments) → obligaciones AP al generarse
    └── RecurringRule → obligaciones periódicas idempotentes
```

Reglas duras del dominio:
- **Multi-moneda**: ARS, USD, USD_BNA (flotante: el monto ARS se congela con snapshot BNA al facturar; hasta entonces flota). El chat NO acepta USD_BNA.
- **Titular (`owner`)**: campo en `obligations` y `financial_debts`, enum `debt_owner` = `santiago` | `chimpance` (default chimpance). Las cuotas de deuda heredan el owner de la deuda. "Mi Deuda Total" en el Dashboard consolida ambos (USD al BNA venta) + por cobrar + neto.
- **Proyecto obligatorio** en toda obligación (fallback: "Chimpancé – General / Overhead").
- **Integridad**: soft delete, VOID pattern (anulación por contra-asiento), audit log en todo, transacciones DB. EXCEPCIÓN peligrosa: borrar un proyecto hace DELETE físico en cascada (ver bugs).
- **Rentabilidad usa netAmount** (sin IVA). En cobros AR con factura, las líneas se separan automáticamente en `net_income` + `tax_debito_credito`.

## Los dos ambientes (regla de oro) — actualizado 12/9/2026

**Ambiente local reactivado el 29/9/2026** (revierte la baja del 12/9): volvio a ser el primer escalon, porque sin el no hay donde probar si el deploy de la nube se cae. La escalera va siempre en el mismo orden: **local → dev-finanzas → produccion**.

**0. Local** — `preview_start {name: "erp-local"}` en http://localhost:5001, con su propio PostgreSQL 18 en el puerto 5433 y la base `chimpance_local`; arrancador `C:\Users\santi\.chimpa-finanzas-db\dev-local.cmd`, entry `erp-local` en `C:\Users\santi\Downloads\Chimpa2026\.claude\launch.json`. Es descartable: se prueba aca antes de subir nada. Si la base quedo atrasada, se pone al dia con `drizzle-kit migrate`. Los dos de la nube:

| | 1. Desarrollo / testing | 2. Producción |
|---|---|---|
| Quién lo usa | el que programa + Santiago y el equipo, para probar | la operación real |
| Dónde | https://dev-finanzas.chimpance.digital | https://finanzas.chimpance.digital |
| Rama | `dev` | `main` |
| Cómo llega el código | `git push origin HEAD:dev` | merge de `dev` a `main` cuando Santiago lo pide (rutina, sin ronda de confirmación) |
| Base de datos | base del servidor dev (independiente) | base del servidor (**la real**) |
| Migraciones de schema | las aplica solo el deploy al pushear a `dev` | las aplica solo el deploy al pushear a `main` |
| Datos | de prueba, los pisa cualquiera | **los únicos datos reales que existen** |

### LA regla de oro: local → dev → producción

1. **Local** (`preview_start {name: "erp-local"}`, :5001). Acá se desarrolla y se
   prueba. Reactivado el 29/9/2026: PostgreSQL 18 en :5433, base `chimpance_local`,
   arrancador `C:\Users\santi\.chimpa-finanzas-db\dev-local.cmd`.
2. **dev** (`git push origin HEAD:dev`). TODO commit pasa por esta rama, sin
   excepción. No es por testing: es para que `main` y `dev` no diverjan (regla del
   CTO, 29/9/2026).
3. **main** (`git push origin <hash de dev>:main`). El merge a producción.

Probar en dev NO es requisito para mergear a main. Cuando Santiago pide subir a
producción, se hace: es rutina de dos minutos, sin ronda de confirmación. Lo único
que se avisa antes, en una línea y sin frenar, es una migración destructiva (DROP,
cambio de tipo, NOT NULL sobre tablas con filas) o una variable de entorno nueva.

"Subilo directo a producción" = pasos 2 y 3 seguidos, en la misma corrida, sin
frenar a probar. NO significa pushear a `main` salteando `dev`.

Nunca al revés, nunca salteando dev, nunca directo a `main`.

### Reglas que acompañan

- **Ambiente local (reactivado el 29/9/2026)**: se levanta con `preview_start {name: "erp-local"}` (:5001) contra el PostgreSQL 18 de `C:\Users\santi\.chimpa-finanzas-db` (puerto 5433, base `chimpance_local`). Es el primer escalon: aca se prueba antes de subir a dev, y sirve aunque el deploy de la nube este caido. Para probar la UI alcanza el navegador interno (`mcp__Claude_Browser__*`) apuntando a localhost, que en local no necesita la sesion del Chrome. El `:5000` (`erp-real`/`chimpance_erp`) sigue dado de baja desde el 8/9/2026.
- **Dev-finanzas es el banco de pruebas compartido** (el local es individual): si un push rompe dev, el equipo se queda sin poder probar. Por eso, antes de cada push a dev: `npm run build` sin errores + `tsc` sin errores nuevos (cap. 01). Y como no tenemos SSH, una migración que rompa la base de dev la tiene que arreglar el CTO: revisar el SQL a mano siempre, y avisar a Santiago antes de pushear migraciones destructivas (DROP, cambios de tipo, NOT NULL sobre tablas con filas).
- **Los datos NO se sincronizan entre ambientes**: nada se copia de producción a dev ni al revés. Bajar o subir datos es una decisión puntual con Santiago y el CTO, nunca parte del flujo.
- **Replit no participa de nada** — ni hosting, ni ambiente, ni agente. El único camino a la nube es el CI/CD por GitHub Actions al servidor del CTO.
- **Migraciones, el orden importa**: todo cambio de schema empieza por `shared/schema.ts` → `drizzle-kit generate` → revisar el SQL a mano → commit → push a `dev` (el CI la prueba sobre una base vacía y el deploy la aplica a la base de dev) → probar en dev → con OK, push a `main` (el deploy la aplica a producción). **La migración versionada es la fuente de verdad**; NUNCA `drizzle-kit push` ni SQL manual contra ninguna base (cap. 01 › Cambios de schema).

## Capítulos de referencia (leer según la tarea)

- **[00_arquitectura_y_stack.md](00_arquitectura_y_stack.md)** — stack completo, modelo de datos (~60 tablas), servicios backend, páginas, API. Leer antes de tocar código o diseñar features.
- **[01_ambientes_y_operacion.md](01_ambientes_y_operacion.md)** — comandos exactos: la escalera dev → producción, cómo probar contra dev-finanzas, cambios de schema (migración versionada primero, NUNCA `drizzle-kit push`), cómo seguir un deploy y qué quedó dado de baja del local. Leer para cualquier operación de infraestructura o de deploy.
- **[02_agente_chat.md](02_agente_chat.md)** — arquitectura del bot contable (borradores, tools, confirmación humana, acciones, prompt). Leer antes de tocar el chat o debuggear capturas.
- **[03_bugs_y_gotchas.md](03_bugs_y_gotchas.md)** — bugs conocidos por corregir + trampas técnicas del entorno (Windows, PG18, tsx). Leer SIEMPRE antes de debuggear o cambiar schema.
- **[04_roadmap.md](04_roadmap.md)** — futures acordados, pendientes de seguridad, y el plan de migración final a la nube. Incluye la **Auditoría del CRM (10/9/2026)**: seguridad (API con login obligatorio) y bugs sev. 4/3 en producción desde el 14/9/2026 (lo que quedó abierto del CRM pasó al skill `crm-growth-chimpa`, cap. 05). Incluye también **"Que Claude tome trabajo del ERP y lo ejecute" (22/9/2026)**: los catorce hallazgos de la ronda completa de feedback del DS de Mendive y de cargar la ficha del proyecto (incluido el bug del cap. 03: el ERP dice que el cliente ve una respuesta que no ve) y qué hay que construir para M14/M15 — leer antes de diseñar el MCP del ERP o cualquier automatización en la que un agente tome feedback y lo aplique.
- **`docs/design-system/` (en el repo)** — DS del ERP "Selva señalizada": `tokens.json`/`tokens.css` (con puente shadcn), `styleguide.html` y `_build/` (generadores). Leer antes de tocar UI: colores, componentes, patrones de UX y plan de implementación.
- **[07_modulo_trabajo.md](07_modulo_trabajo.md)** — resumen ejecutivo del **Módulo Trabajo** (proyectos → tareas → plantillas → feedback del cliente con IA → rondas) y de la **pantalla Hoy** (home por rol: prioridades del día, agenda con Google Calendar por iCal, bloques por sombrero, tarea rápida — sección propia con el orden automático y cómo conectar el calendario): dónde vive en la UI, flujo de punta a punta, cronología de lo hecho (Fase 1/2a/3/3b/3c, M7, M3, M5, M4), cómo funciona cada pieza, qué falta en orden, checklist de prueba para Santiago, tests reproducibles y mapa del código. Leer PRIMERO cuando Santiago pregunte "qué se hizo / cómo funciona / qué falta" del módulo de proyectos, tareas o feedback; mantenerlo al día con cada módulo terminado.
- **[07_modulo_trabajo.md] › Documentación del proyecto** — páginas tipo Notion en `/proyectos/:id` (brief, alcance, minutas) con editor visual, autoguardado, historial y plantillas; detalle técnico y el gotcha del editor en el cap. 00 › "Documentación del proyecto".
- **[08_ficha_cliente.md](08_ficha_cliente.md)** — **Ficha del cliente** (8/9/2026): `/empresas/:id` con logo, **Playbook** (accesos cifrados AES-256-GCM con revelado auditado, enlaces a Drive, notas, por categoría) y **Soporte por horas** (`/soporte`: planes mensuales con arrastre o bolsas de horas, registros con VOID, período vigente e historial, excedente valorizado). Leer para cualquier tarea de documentación/contraseñas de clientes, horas de soporte o logos. Ojo `VAULT_KEY` en la nube.
- **[05_trabajo_en_paralelo.md](05_trabajo_en_paralelo.md)** — playbook para varios cambios a la vez: subagentes en una sesión, archivos troncales que no se tocan en simultáneo (routes/schema/storage), dev-finanzas como embudo único de verificación, y qué NO hacer (multi-sesión sobre el ERP, worktrees, schema en paralelo). Leer cuando Santiago pida trabajar módulos en paralelo.
- **[09_perfil_google.md](09_perfil_google.md)** — **Mi perfil** (8/9/2026): `/perfil` (todos los roles) con avatar propio (subir/cambiar/quitar, también visible en el header y en Admin › Usuarios) y **Google Calendar/Meet por OAuth** (cada usuario conecta su cuenta para que el ERP cree eventos con Meet — distinto del iCal de solo lectura del cap. 07). Falta que Santiago cargue `GOOGLE_CLIENT_ID`/`SECRET` (pasos exactos en el capítulo) para probarlo conectando de verdad. Leer para cualquier tarea de perfil de usuario, avatar, o integración con Google.
- **[11_app_android.md](11_app_android.md)** — **App Android (PMV, 17/9/2026)**: pantalla `/app` (Resumen · Registrar · Avisos), **avisos push** Web Push sin Firebase (tablas, puente con la campana, avisos de plata/leads/tareas/borradores y sus horarios), proyecto `android/` (TWA dev/prod), workflow "APK Android", keystore y secretos, `assetlinks.json`. Leer para cualquier tarea de la app del celular, notificaciones push o el APK.
- **CRM y Growth → skill aparte `crm-growth-chimpa`** (29/9/2026): leads, oportunidades, pipeline, empresas del CRM y prospección, referidores, Personas, propuestas y demos medidas, Growth OS (workspaces, campañas, landings, snippet, atribución, A/B, inversión, Chimp Score, briefs, consultas de clientes, recorrido web), plugin de Gmail, audiencias, retención y LTV, **y el backlog vivo de todo lo que falta de esos temas**. Los capítulos 06 (Growth OS) y 12 (plugin de Gmail) se mudaron allá. Invocar `crm-growth-chimpa` para cualquier tarea comercial o de medición; los dos skills se cargan JUNTOS cuando hay que escribir código (acá vive la escalera dev → producción, las migraciones y el tablero de sesiones).
- **[10_pases_pendientes.md](10_pases_pendientes.md)** — **Tablero de sesiones** (12/9/2026): la barra lateral como tablero de estados. Al arrancar una tarea del ERP la sesión va SOLA a **`🛠️ ERP · En desarrollo`**; al subir a dev (deploy en verde, commits con `Sesion: <título>`) pasa a **`🧪 ERP · En dev, falta que pruebe Santiago`** con un guion de prueba; cuando Santiago dice que anda pasa a **`✅ ERP · Aprobado, listo para producción`**; si se frena queda en **`⏸️ ERP · Pausadas`** (ojo: lo que ya subió a dev viaja igual en el próximo pase); al migrar a producción se **archiva** (con OK de Santiago, pedido junto con el de la migración). El **pase a producción** es rutina desde el 29/9/2026: se mira `git log origin/main..origin/dev`, se avisa en una línea si hay migración destructiva o variable de entorno nueva, y se hace `git push origin <hash de dev>:main`; sin punto de corte, sin exigir que todo esté probado y sin ronda de confirmación. Nunca cherry-pick ni force. Las sesiones sin código se archivan al entregarse. La verdad técnica es `git log origin/main..origin/dev`. Si Santiago mueve sesiones de grupo a mano, el ícono del título se corrige solo al arrancar cualquier sesión del ERP (Paso S). Leer SIEMPRE al arrancar una tarea, al pushear a dev, cuando Santiago avise que probó algo, al migrar, o cuando pregunte "¿qué falta probar/migrar?".

## Cómo trabajar con Santiago en el ERP

- Explicar en español argentino, sin jerga innecesaria; él decide negocio, el skill decide técnica.
- **Antes de escribir código, validar la idea con Santiago** (pedido suyo, 18/9/2026): contarle en pocas líneas qué se va a hacer y cómo se va a ver (maqueta o captura si ayuda), o preguntarle lo que no esté claro, y esperar su OK. Recién ahí se edita. Las consultas y diagnósticos no necesitan este paso.
- Todo cambio recorre la escalera: sesión al grupo 🛠️ (cap. 10) → editar → chequeos sin base (`npm run build` + `tsc` sin errores nuevos; si tocó schema, `generate` + revisión del SQL) → commit con mensaje descriptivo en español + línea `Sesion: <título>` + `Co-Authored-By: Claude` → `git push origin HEAD:dev` → seguir el deploy (`gh run watch`; los tests corren en el CI y si fallan no despliega) → **TEST OBLIGATORIO en el navegador** (cap. 01): en **local** (:5001, navegador interno) mientras se desarrolla, y en **dev-finanzas** con el Chrome logueado como admin una vez desplegado → con el test en verde, **mover la sesión al grupo 🧪** (cap. 10) → avisar a Santiago qué se probó (con evidencia) y qué probar → cuando pida subir a producción, `git push origin <hash de dev>:main` **sin volver a preguntar** → archivar las sesiones del ✅ (cap. 10).
- **Nunca se termina una tarea sin testear** (pedido de Santiago, 12/9/2026): ningún "listo", "ya está en dev" ni pase a 🧪 sin haber recorrido el cambio en el navegador contra dev-finanzas y verificado que anda. Si algo no se pudo testear, se dice explícitamente qué y por qué. Esto aplica a dar por terminada una tarea, no a migrar a producción: el pase a `main` es rutina y no espera al test (cap. "LA regla de oro", punto 3).
- Después de features o decisiones importantes, actualizar la memoria (`project_chimpa_finanzas.md`) y este skill si cambia algo estructural.
- Este skill tiene una **copia versionada dentro del repo** (`Chimpa-Finanzas/.claude/skills/erp-chimpa-finanzas/`): al actualizar cualquier capítulo acá, copiar los cambios allá (cp -r) y commitearlos. La copia personal (~/.claude/skills/) es la que se carga en sesiones; la del repo es para versionado y para el CTO.
- Los montos siempre en formato argentino ($ 1.234.567,89) y las fechas DD/MM.
