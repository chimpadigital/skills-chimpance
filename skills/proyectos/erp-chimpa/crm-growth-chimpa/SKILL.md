---
name: crm-growth-chimpa
description: Experto en el CRM y el Growth OS del ERP de Chimpancé (Chimpa-Finanzas) — todo lo que pasa ANTES y DESPUÉS de la plata: cómo se consigue, se desarrolla, se cierra y se fideliza un cliente, y cómo el sistema aprende de eso. Carga la visión completa (Chimpancé Growth Intelligence OS: adquirir → desarrollar → evolucionar → aprender), el estado real de lo construido (workspaces de Growth, campañas, landings, snippet growth.js, eventos y atribución, A/B, inversión, Chimp Score, briefs, consultas de clientes, recorrido web, propuestas y demos medidas, leads, oportunidades, pipeline, empresas del CRM/prospección, referidores, Personas como identidad única, historia del cliente, plugin de Gmail, entrada de correo), las reglas canónicas que no se negocian (lead = consulta real, las personas se unen SOLO por mail exacto, los ingresos nunca se cargan a mano, un workspace de cliente no crea leads, revenue > leads, la IA propone y la persona confirma) y el BACKLOG VIVO de todo lo que queda por desarrollar (Audience Engine, devolver conversiones a Google/Meta/LinkedIn, retención y LTV, portal del cliente, bugs y decisiones abiertas). Invocar SIEMPRE que Santiago trabaje en o pregunte por: CRM, leads, oportunidades, pipeline, kanban comercial, empresas del CRM, prospección, referidores, Personas, duplicados, contactos, Growth, workspaces, campañas, landings, UTM, atribución, tracking, snippet, eventos web, visitas, A/B testing, experimentos, inversión publicitaria, CPL, Chimp Score, brief de inteligencia, importador de CSV, consultas de clientes, recorrido del cliente, propuestas medidas, demos medidas, link personal del lead, envío de propuestas por mail, plugin de Gmail, llaves de la API, audiencias, públicos, remarketing, conversiones offline, CAPI, retención, recompra, LTV, cross-sell, portal del cliente, "cómo medimos", "de dónde salen los leads", "qué falta del CRM", "qué falta de Growth", "anotá esta idea del CRM". Es el hermano de erp-chimpa-finanzas (finanzas, facturación, Trabajo, ambientes y deploys): el workflow técnico y la escalera dev → producción viven allá; se invocan JUNTOS cuando hay que escribir código.
---

# CRM + Growth del ERP de Chimpancé

Skill dueño de la mitad comercial del ERP: **cómo Chimpancé consigue, desarrolla, cierra y hace crecer clientes, y cómo el sistema aprende de eso**. Existe para que el skill del ERP no cargue todo junto: allá vive la plata y la operación técnica, acá vive el negocio de crecer.

Santiago NO programa: explicarle en criollo, decidir con criterio técnico propio, y verificar todo antes de reportar.

## Qué es, en una frase

El CRM y el Growth OS del ERP son **un solo sistema de inteligencia de crecimiento de clientes**, no dos módulos: la misma base guarda la visita anónima, el formulario, el lead, la persona, la oportunidad, la propuesta que se abrió, la venta, el cobro real y el margen — y esa cadena completa es la que permite aprender qué genera buenos clientes.

## El objetivo (por qué existe todo esto)

El problema que resuelve está escrito en el documento maestro y no cambió: cada plataforma sabe una parte (Meta sabe que hubo 100 formularios, el CRM que 12 llegaron a propuesta, administración que 3 compraron) y **nadie sabe automáticamente qué campaña, audiencia, landing y variante produjo esos 3 clientes ni cuánto dejaron**. Sin esa cadena, Google y Meta optimizan para "gente que llena formularios", no para "gente que compra".

La apuesta: **medir hasta la plata cobrada y el margen, devolverle esa señal a los canales, y convertir la experiencia comercial en conocimiento del sistema en vez de memoria de personas.**

```
ADQUIRIR → DESARROLLAR → EVOLUCIONAR → APRENDER → ADQUIRIR MEJOR
```

- **Adquirir**: audiencia → anuncio → visita → intención → lead.
- **Desarrollar**: lead → calificación → oportunidad → reunión → propuesta → venta.
- **Evolucionar**: cliente → retención → recompra → cross-sell → referido.
- **Aprender**: cada vuelta mejora la anterior. Regla de oro del documento maestro: *el sistema no existe para mostrar más datos, existe para transformar datos en aprendizaje y aprendizaje en mejores decisiones de crecimiento.*

La visión completa, los principios rectores, los 4 niveles de inteligencia, la métrica norte y el mapa de madurez (qué de todo eso ya existe y qué no) están en **[01_vision_y_modelo.md](01_vision_y_modelo.md)**. Leerlo antes de diseñar cualquier función nueva del CRM o de Growth: casi todo lo que parece "idea nueva" ya está pensado ahí.

## Las reglas que no se negocian

Decisiones tomadas por Santiago o aprendidas a golpes. Romper una es un bug, no una variante de diseño.

1. **Lead = consulta REAL.** Nunca se crea un lead por necesidad técnica. La propuesta es de la **oportunidad**; una oportunidad de un cliente que ya existe no tiene lead y todo funciona igual. (Pendiente vivo: `opportunityService.ensureLead` todavía crea uno al anotar en una oportunidad sin lead.)
2. **Persona es la identidad central**, y las personas se unen **solo por mail exacto normalizado**. Nombre, teléfono, empresa, LinkedIn, similitud o IA NUNCA unen: van a `person_duplicate_candidates`. Toda decisión de identidad pasa por `person.service.ts`.
3. **Los ingresos nunca se cargan a mano.** Salen de la cadena lead → oportunidad ganada → proyecto → cobros reales, netos de IVA. Si una métrica de Growth necesita plata, la pide a esa cadena.
4. **Un workspace de cliente (`kind: client`) no genera leads**: su formulario deja una **consulta**. El CRM es de Chimpancé; lo de los clientes no se mezcla. Ojo: el `kind` por defecto al crear un workspace es `client`.
5. **Revenue > leads.** Ningún tablero cierra en "cantidad de leads": la pregunta siempre es qué pasó con la plata.
6. **La IA propone, la persona confirma.** Score, briefs, sugerencias de necesidades, clasificación de mails: siempre con la evidencia a la vista y un paso humano antes de que quede algo cargado. Nada de automatizar decisiones comerciales sin aprobación.
7. **Explicabilidad**: todo score o recomendación tiene que poder responder "¿por qué?" con las reglas que lo produjeron.
8. **Todo dato pertenece a un workspace.** `crm_leads`, `crm_opportunities`, `crm_pipelines`, `crm_sessions`, `crm_identities`, `crm_events` tienen `workspace_id NOT NULL`. Ninguna consulta nueva puede ignorarlo.
9. **Empresas (`companies`) es solo para clientes y proveedores reales.** La prospección vive en `crm_accounts` y pasa a Empresas recién al ganar.
10. **Nada de datos de un cliente expuestos a otro.** El aprendizaje transversal es anonimizado, agregado y metodológico.

## Qué es mío y qué no

| Tema | Skill |
|---|---|
| Leads, oportunidades, pipeline, personas, empresas del CRM, referidores, propuestas medidas, Growth, tracking, audiencias, retención, plugin de Gmail | **este** |
| Obligaciones, cobros, facturación, IVA, ARCA, deudas, cajas, Módulo Trabajo, proyectos, mapas, ambientes, deploys, migraciones, bugs generales | `erp-chimpa-finanzas` |
| Cómo se ve: componentes, colores, patrones, DS "Selva señalizada" | `erp-ui-chimpa` |
| Armar la propuesta comercial en sí (estructura, precios, formato) | `ejecutivo-cuenta-chimpance` |
| Campañas reales de Google Ads / Meta, palabras clave, copy de anuncios | `googleadssearch`, `metaadsleads`, `techagro`, `mt-agro` |

**Para escribir código hay que cargar también `erp-chimpa-finanzas`**: la escalera dev-finanzas → producción, los comandos, las migraciones versionadas, el tablero de sesiones y el test obligatorio en Chrome viven allá (caps. 01 y 10). Este skill no repite nada de eso.

## Cómo trabajar

- **Antes de escribir código, validar la idea con Santiago** (pedido suyo, 18/9/2026): en pocas líneas qué se va a hacer y cómo se va a ver, o la pregunta que falte. Recién con su OK se edita. Las consultas y diagnósticos no necesitan este paso.
- **Si el pedido admite más de una lectura, preguntar antes de hacer.** "Solo leé" = leer y reportar, sin cálculos ni supuestos propios.
- Toda tarea de código recorre la escalera del skill del ERP: sesión al grupo 🛠️ → editar → `npm run build` + `tsc` → commit con la línea `Sesion:` → `git push origin HEAD:dev` → **test en Chrome real contra dev-finanzas** → grupo 🧪 → OK de Santiago → `git push origin main`.
- Los montos en formato argentino ($ 1.234.567,89) y las fechas DD/MM. Los períodos de Growth se cortan en **hora de Buenos Aires** (`shared/growthConsultas.ts`), nunca en UTC.

## Regla de memoria: el backlog vivo

**Este skill es la memoria de todo lo que queda suelto del CRM y de Growth.** Al cerrar cualquier sesión del tema, antes de reportar:

1. Anotar en **[05_backlog.md](05_backlog.md)** lo que quedó pendiente, la idea que apareció al pasar, el bug que se vio y no se arregló, y la decisión que Santiago todavía no tomó. Una ficha por cosa, con fecha, dónde se vio y qué haría falta. **Nada se deja "para acordarse".**
2. Tachar (`~~así~~` + "HECHO en dev DD/MM") lo que se terminó, y moverlo a **[02](02_growth_os.md)**, **[03](03_nucleo_comercial.md)** o **[04](04_entrada_de_leads.md)** si pasó a ser cómo funciona el sistema.
3. Si cambió una regla canónica o una decisión estructural, actualizar este SKILL.md y el cap. **[06](06_reglas_y_gotchas.md)**.
4. Copiar los cambios a la copia versionada del repo (`Chimpa-Finanzas/.claude/skills/crm-growth-chimpa/`) y commitearlos.
5. Si la decisión también cambia el resumen corto, actualizar la memoria (`project_growth_persona_audience.md`, `project_crm_growth_pendientes.md`, `project_chimpa_finanzas.md`).

Cuando Santiago diga "anotá esta idea", "esto queda para después" o "no lo hagas ahora": va al cap. 05, no queda en la conversación.

## Capítulos

- **[01_vision_y_modelo.md](01_vision_y_modelo.md)** — la visión completa (Chimpancé Growth Intelligence OS), el loop adquirir/desarrollar/evolucionar/aprender, los principios rectores, los 4 niveles de inteligencia, la métrica norte, qué construir y qué no, y el **mapa de madurez**: etapa por etapa, qué ya mide el ERP y qué falta. Leer antes de diseñar cualquier función nueva.
- **[02_growth_os.md](02_growth_os.md)** — Growth OS: workspaces, campañas, landings, snippet `growth.js`, eventos y sesiones, atribución, experimentos A/B, inversión, ingresos reales, Chimp Score, briefs, importador, consultas de clientes, recorrido web, link personal, propuestas y demos medidas. Contrato técnico: `docs/growth/api-contract.md`.
- **[03_nucleo_comercial.md](03_nucleo_comercial.md)** — el CRM: leads, oportunidades, pipeline y kanban, interacciones y tareas comerciales, ganar/perder, empresas del CRM y prospección, referidores, Personas (identidad única) y duplicados, la Historia del cliente, envío de propuestas por mail, y el alcance del rol vendedor.
- **[04_entrada_de_leads.md](04_entrada_de_leads.md)** — por dónde entra un lead: formularios web, plugin de Gmail, entrada de correo, Chimpa IA, carga a mano, importación, referidos. Qué crea lead y qué no, y cómo se reconoce la empresa.
- **[05_backlog.md](05_backlog.md)** — **el backlog vivo**: todo lo que queda por desarrollar, por pata del modelo, más bugs conocidos, decisiones abiertas de Santiago e ideas en carpeta. Leer al arrancar cualquier sesión del tema y actualizar al cerrarla.
- **[07_negocio_chimpance.md](07_negocio_chimpance.md)** — **el negocio real que este CRM mide**: qué vende Chimpancé (Software Factory como faro, Web Express, marketing, soporte, TechAgro), a quién, por dónde llegan los clientes hoy (referidos primero, Google Ads /agenciaweb como única campaña paga), cómo es el ciclo, y qué implica todo eso para el diseño del CRM. Leer antes de definir "lead calificado", calibrar el score, armar audiencias o priorizar el backlog. Tiene cuatro números marcados ⚠️ que Santiago todavía no confirmó.
- **[08_de_donde_sale_cada_numero.md](08_de_donde_sale_cada_numero.md)** — **de dónde sale cada dato**, leído del código: visitas, consultas, calificados, oportunidades, ingresos reales, inversión, CPL/CPQL/CPO/CAC/ROI, valor de un referidor, LTV, score, propuestas y demos. Más las trampas al reportar. Leer antes de contestar cualquier pregunta con números del ERP.
- **[09_pantallas_y_prueba.md](09_pantallas_y_prueba.md)** — mapa de rutas y pestañas del CRM y de Growth + **el guion de prueba en Chrome contra dev-finanzas** (cadena comercial completa, cierre, medición, personas, permisos, celular) y dónde mirar cuando algo no anda. Leer antes de cerrar cualquier tarea.
- **[10_espacio_del_cliente.md](10_espacio_del_cliente.md)** — **el espacio de cada cliente, que va por separado**: cómo funciona hoy el workspace de un cliente (alta campo por campo, claves, conectar su sitio o su GTM, consultas y descarga a Excel, qué nunca se mezcla con el CRM de Chimpancé, errores típicos) y el plan para que el cliente entre a verlo, reusando el enlace por persona del espacio del cliente que ya existe en lugar de inventar un login. Leer antes de abrir un workspace para un cliente o de prometerle acceso.
- **[06_reglas_y_gotchas.md](06_reglas_y_gotchas.md)** — las trampas que ya costaron (CORS del snippet, ids escritos raro, CSV y Excel, períodos en hora argentina, secretos de los links, dedupe, rate limit por clave) y las reglas de seguridad y privacidad del módulo. Leer antes de debuggear o de abrir una ruta pública.

## Documentos fuente (no duplicar: leerlos cuando haga falta el detalle)

| Documento | Qué tiene |
|---|---|
| `Chimpa-Finanzas/CRM/chimpance_growth_intelligence_os_documento_maestro_estrategico_v1.md` | La visión completa, 30 capítulos: benchmark de 19 plataformas, 40 casos de uso, taxonomía de eventos, arquitectura, riesgos. 63 KB. |
| `Chimpa-Finanzas/CRM/benchmark_plataformas_chimpance_growth_sales_os.md` | El benchmark en detalle (HYROS, Triple Whale, Clay, Madgicx, Apollo, Hightouch, Segment, Factors, Mutiny, Common Room, Gong, 6sense, Palantir, Glean, Optimizely, VWO…). |
| `Chimpa-Finanzas/docs/growth/api-contract.md` | Contrato público e interno, algoritmo A/B, definiciones de métricas, qué hace el snippet. **Fuente de verdad técnica.** |
| `Chimpa-Finanzas/docs/growth/personas.md` | Personas: reglas de unión, tablas, dónde se engancha, pantalla, envío individual de propuestas. |
| `Chimpa-Finanzas/docs/growth/recorrido-cliente.md` | Recorrido del cliente, fases 1-5 (1 y 2 hechas). |
| `Chimpa2026/diagnostico-personas-audience-propuestas-2026-09-19.md` | Diagnóstico y plan de fases: Persona, Audience Engine, envío de propuestas, conversion feedback. |
| `Chimpa-Finanzas/docs/auditorias/crm-2026-09/auditoria-crm.html` | Auditoría del CRM (10/9/2026) con `archivo:línea` de cada hallazgo. |
