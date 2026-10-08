# 05 · Backlog vivo del CRM + Growth

> **Esta es la memoria del módulo.** Todo lo que queda por desarrollar, la idea que apareció al pasar, el bug que se vio y
> no se arregló, y la decisión que Santiago todavía no tomó. Última revisión: **29/9/2026**.

## Cómo se anota

Una ficha por cosa, con id estable para poder nombrarla después:

```
### [ID] Título corto
**Qué**: en una o dos líneas, en criollo.
**Por qué**: qué eslabón del recorrido mejora (cap. 01) o qué duele hoy.
**Dónde**: archivos, tablas o pantallas.
**Tamaño**: XS (menos de media sesión) · S (media) · M (una sesión) · L (varias).
**Estado**: idea | acordado | diseñado | en dev | esperando decisión de Santiago | esperando algo de afuera.
```

Prefijos: **A-** adquirir · **D-** desarrollar · **E-** evolucionar · **L-** aprender · **P-** plataforma y seguridad ·
**B-** bugs vivos · **Q-** decisiones de Santiago · **I-** ideas en carpeta.

Al terminar algo: tacharlo (`~~así~~ HECHO en dev DD/MM`) y documentar **cómo funciona** en el cap. 02, 03 o 04. Lo tachado
se borra de acá al pasar a producción.

## El orden acordado (plan del 19/9/2026, cada fase con OK de Santiago)

| Fase | Qué incluye | Estado |
|---|---|---|
| 1a · Cimiento de Persona | Tablas, carga inicial por mail exacto, enganche al crear lead/contacto/ganar | **en producción** desde el 21/9 (migración 0028) · falta correr la carga inicial en producción (P-04) |
| 1b · Pantalla Personas | Lista, ficha con Journey, duplicados | **en producción** desde el 21/9 |
| 2 · Envío individual de propuestas | Mail por persona con su código, Opportunity Journey | **en producción** desde el 21/9 (migraciones 0029 y 0031) · falta un envío real de prueba (P-05) |
| 3 · Audience Engine interno | Reglas, miembros, vista previa, 5 audiencias, descarga para Meta/LinkedIn, eventos de servicio y caso. En paralelo: trámites de Meta y LinkedIn | **sin arrancar** (A-01) |
| 4 · Devolver conversiones | Lead → calificado → oportunidad → venta → ingreso, primero a Google | **sin arrancar** (A-02) |
| 5 · Meta Audience Sync | Custom Audiences + comportamiento por píxel y CAPI | sin arrancar (A-03) |
| 6 · LinkedIn Audience Sync | Matched Audiences | sin arrancar (A-04) |
| Después | Google Customer Match, TikTok, lectores anónimos de propuestas | ideas |

---

# A · Adquirir

### [A-01] Audience Engine interno (fase 3)
**Qué**: audiencias dentro del ERP. `DATA → SEGMENT (reglas de catálogo cerrado, combinables con Y / EXCEPTO) → AUDIENCE
(miembros recalculados solos, con fecha de entrada y salida) → DESTINATION → SYNC`. **Dos tipos que no se mezclan**: de
**visitantes** (un navegador) y de **personas** (alguien con mail). Por workspace, como todo Growth. Siempre se puede ver
**por qué** alguien está adentro. Primera entrega: **descarga** en el formato de cada plataforma, sin conectar ninguna API.
**Las 5 audiencias pedidas por Santiago**: High Intent Website (visitantes) · Proposal Engaged (personas) · Best Customers
(personas, necesita el margen) · Lost Opportunities (personas, 180 días) · Existing Customers (personas).
**Por qué**: hoy no hay ninguna forma de accionar sobre la gente que ya mostró intención.
**Tamaño**: L. **Estado**: diseñado (diagnóstico 19/9 § 5), esperando OK de fase.

### [A-02] Devolver conversiones a los canales (fase 4) — lo que más mueve la aguja
**Qué**: informarle a la plataforma cada escalón atado al clic original: `Lead → Qualified Lead → Opportunity → Sale →
Revenue (cobrado real, neto) → Margin`. Google con el `gclid` **que ya guardamos** (conversiones offline), Meta por CAPI con
`fbclid` y cookies, LinkedIn con `li_fat_id`.
**Por qué**: la campaña que Chimpancé paga hoy es Google Ads Search (/agenciaweb), con pocas conversiones y el objetivo de
pasar a tCPA. Devolverle "lead calificado" y "venta" es lo que más rápido mejora lo que ya se está pagando.
**Dónde**: `crm_events` ya guarda los click IDs; falta el adapter y el barrido.
**Tamaño**: M-L. **Estado**: diseñado; ver Q-02 (por dónde empezar).

### [A-03] Meta Audience Sync (fase 5) · [A-04] LinkedIn Matched Audiences (fase 6)
**Qué**: subir las audiencias solas, con hash de los mails antes de salir, y estado de sincronización por destino.
**Límites reales**: Meta necesita ~100 personas reconocidas y LinkedIn ~300; las listas de Chimpancé son chicas, así que
sirven sobre todo para **excluir clientes** y como **semilla de similares**. El remarketing fuerte viene por comportamiento.
**Trámites**: el acceso a la API de LinkedIn puede tardar semanas → iniciarlo durante la fase 3.
**Tamaño**: M cada uno. **Estado**: sin arrancar. Requiere Q-03 (privacidad).

### [A-05] Eventos de intención que faltan
**Qué**: disparar y guardar "vio un servicio", "vio un caso", "vio precios" desde el sitio.
**Por qué**: sin ellos la audiencia High Intent Website no se puede armar y el Chimp Score no ve intención real.
**Dónde**: `growth.js` + el sitio (Replit).
**Tamaño**: S. **Estado**: acordado dentro de la fase 3.

### [A-06] Guardar `_fbp` y `_fbc`
**Qué**: el snippet todavía no guarda las cookies de Meta, necesarias para CAPI.
**Tamaño**: XS. **Estado**: acordado (prerequisito de A-02/A-03).

### [A-07] Los formularios del sitio todavía no mandan el lead al ERP
**Qué**: el snippet mide visitas desde el 17/9/2026, pero los formularios de chimpance.digital no llaman a `chimp.lead`
(Prompt 2 de `Chimpa/web/3-replit/integracion-erp-crm.md`). Resultado: las visitas quedan anónimas y no se juntan solas con
el lead.
**Por qué**: es **el** camino principal de identificación; sin él todo depende de links personales.
**Tamaño**: S (lo hace Replit en el sitio). **Estado**: pendiente de ejecución en el sitio.

### [A-08] Landings del workspace Chimpancé sin cargar en producción
**Qué**: producción no tiene landings cargadas, así que el dominio de los links personales cae en un default roto
(`chimpancedigital.com.ar`, que no tiene web). Santiago decidió esperar a tener campañas.
**Consecuencia hoy**: un link personal copiado hoy no abre nada → avisarle antes de mandar uno.
**Arreglo**: cargar las landings de `https://chimpance.digital/…` o corregir el default de `settings.siteUrl`.
**Tamaño**: XS. **Estado**: decidido esperar.

### [A-09] Importación real de los CSV del panel viejo del sitio
**Qué**: correr el importador con los CSV que exporte Santiago (visitas, leads, contactos, gasto) para tener historia.
**Tamaño**: S. **Estado**: esperando los archivos.

### [A-10] Gasto por API de Meta/Google
**Qué**: hoy la inversión se carga a mano o por CSV.
**Tamaño**: M. **Estado**: idea acordada, sin fecha.

### [A-11] Selector de workspace en la pantalla Leads
**Qué**: Dashboard, Oportunidades y Config tienen selector; Leads no.
**Dónde**: `client/src/lib/workspaceStore.ts`, `WorkspaceSelect`.
**Tamaño**: XS. **Estado**: pendiente desde el 5/9.

### [A-12] Growth no filtra por dueño para el rol `sales`
**Qué**: envíos y leads de Growth se ven completos aunque el CRM sí respeta el alcance del vendedor.
**Tamaño**: S. **Estado**: pendiente de la auditoría del CRM.

### [A-13] Asociar el botón de WhatsApp a un lead
**Qué**: hoy WhatsApp no asocia (no le pasa el número a la web). Idea anotada: mensaje precargado con un código corto de
referencia que se carga en el lead.
**Tamaño**: S. **Estado**: idea.

---

### [A-14] Analítica de comportamiento tipo Hotjar dentro del workspace del cliente
**Qué**: pedido de Santiago (30/9/2026): que cada workspace de cliente tenga las funciones de Hotjar/Contentsquare —
**mapas de calor** (clic, movimiento, scroll), **grabaciones de sesión**, **encuestas en el sitio**, **embudos de
abandono**, **señales de frustración** (rage click, clic muerto, vuelta atrás), **errores JS y performance**, y un
**resumen con IA** del período.
**Punto de partida real**: `client/public/growth.js` ya mide `page_view`, `scroll` (25/50/75/100 en propuestas),
`cta_click`, `whatsapp_click`, `form_start`/`form_submit`, tiene `visitorId`, sesión de 24 h en `crm_events` y cola con
`sendBeacon`. Nada de coordenadas de clic, snapshot del DOM, encuestas ni grabación.
**Plan propuesto por fases** (a validar con Santiago):
1. **Comportamiento agregado** (S-M): coordenadas de clic normalizadas + viewport en bucket, profundidad de scroll por
   página en cualquier sitio (hoy solo propuestas), rage/dead click y error JS. Tabla agregada por página/día, no fila
   por clic. Pestaña "Comportamiento" en `/growth/:id`.
2. **Mapa de calor visible** (M): hace falta una **imagen o snapshot del DOM** de la página para pintar encima; el iframe
   directo se cae con `X-Frame-Options`. Decisión técnica pendiente: snapshot rrweb una vez por página vs captura propia.
3. **Encuestas en el sitio** (M): widget de 1 pregunta / NPS / "¿encontraste lo que buscabas?". Respuestas al workspace,
   **nunca lead** (regla del cap. 10).
4. **Embudos** (S): con los eventos que ya existen, paso a paso y caída.
5. **Grabaciones de sesión** (L, la más cara): rrweb con muestreo, enmascarado de inputs por defecto, retención corta y
   almacenamiento **fuera de Postgres** (objeto/archivo). No arrancar por acá.
6. **Resumen con IA** (S): reusar `brief.service.ts` con los hallazgos de comportamiento.
**Cuidados**: privacidad y consentimiento en el sitio del cliente (esto graba comportamiento de terceros), enmascarado de
datos personales, peso del snippet, rate limit por clave del workspace, y **todo con `workspace_id`**; jamás cruzar datos
entre clientes.
**Relación**: es el contenido con el que el espacio del cliente (**E-04**) pasa de "planilla de consultas" a producto.
**Tamaño**: XL en total. **Estado**: **CONSTRUIDO el 30/9/2026 y pusheado a `dev`** (migración `0052`, contrato en
`docs/growth/behavior-spec.md`). Se hizo todo de una: snippet, backend, cuatro pestañas y rrweb servido por el ERP.
Probado de punta a punta **en el ambiente local** (ingesta por curl + las cuatro pestañas en Chrome): la ingesta agrega
bien, el mapa de calor pinta sobre la foto reconstruida, la grabación entra sólo con aviso de privacidad y el NPS sale.
**Al 4/10/2026 está EN PRODUCCIÓN**: el deploy de GitHub volvió a andar y los merges posteriores a `main` se lo
llevaron puesto. Ojo: **nunca se probó en dev-finanzas ni en producción**, sólo en local. No es grave porque **nace
apagado** (`behaviorEnabled = false` y muestreo 0 en todos los workspaces): no mide ni graba nada hasta que alguien lo
prenda a mano en Growth › Instalación. La primera vez que se encienda, mirar que entren datos y que el mapa pinte.
Pendientes chicos en **A-15**.

### [A-15] Pendientes chicos del comportamiento (A-14)
Lo que quedó suelto después de construirlo y probarlo en local el 30/9/2026:
1. **El reproductor de grabaciones no se probó con una sesión de verdad**: la de prueba era un archivo armado a mano y el
   player mostró (bien) "esta grabación no se puede reproducir". Falta grabar una sesión real con el snippet y mirarla.
2. **`reach` y `seconds` del mapa de calor son ESTIMADOS**, no medidos: la base guarda el scroll en cuatro marcas por
   página y el server interpola entre ellas (manda `reachSource: "scroll_interpolado"`). Los modos scroll y atención son
   una aproximación; para el dato real por banda hacen falta columnas nuevas.
3. **Dos selectores de período apilados**: la pantalla del workspace tiene el suyo y cada pestaña nueva el propio (la
   firma acordada era sólo `{ workspaceId }`). En el celular se ven los dos, uno arriba del otro. Conviene pasar el
   período por prop.
4. **El snapshot se toma una vez por página y dispositivo y se refresca a los 7 días**: si el cliente rediseña la página,
   el mapa queda sobre la foto vieja hasta que venza. Falta un botón de "sacar la foto de nuevo".
5. **Sin encuestas ni comportamiento en el espacio del cliente todavía** (decisión de Santiago: interno primero, ver **E-04**).
6. **Nunca se probó fuera de local**: la primera prueba de verdad va a ser la primera vez que se encienda la medición en
   un workspace (ver **A-14**).
**Tamaño**: S cada uno. **Estado**: anotados, sin arrancar.


# D · Desarrollar

### [D-01] Vista única del recorrido punta a punta + tablero de etapas y tiempos
**Qué**: el punto 2 acordado con Santiago: una vista que junte web + interacciones + propuesta + oportunidad + cobros, y un
tablero de etapas y tiempos **solo de Chimpancé**.
**Estado**: la Historia del lead cubre la mitad; falta el tablero.
**Tamaño**: M. **Estado**: acordado.

### [D-02] Recorrido del cliente, fase 3
**Qué**: fecha real de ganada/perdida, tiempo por etapa, motivo de pérdida que no se borra, embudo por fuente.
**Dónde**: `docs/growth/recorrido-cliente.md`.
**Tamaño**: M. **Estado**: acordado.

### [D-03] Recorrido del cliente, fase 4: barrido diario de avisos
**Qué**: lead frío, tarea vencida, volvió a la web, propuesta vista sin respuesta.
**Por qué**: es lo que convierte la medición en acción sin que nadie mire un tablero.
**Tamaño**: M. **Estado**: acordado.

### [D-04] Dashboard comercial de verdad
**Qué**: pronóstico ponderado, win rate por vendedor y por fuente, ciclo de venta, motivos de pérdida, tipo de dólar
explícito. Hoy agrupa por **mes de creación** y **mezcla workspaces**.
**Tamaño**: M. **Estado**: pendiente de la auditoría del CRM.

### [D-05] Chimp Score v2 calibrado
**Qué**: hoy son 15 reglas que premian completitud, sin calibrar contra resultados reales. Calibrar con las ventas ganadas y
perdidas que ya hay.
**Tamaño**: M. **Estado**: pendiente.

### [D-06] Tools de CRM para el Chimpa IA
**Qué**: `/api/bot-chat` está en 403 para `sales` y el bot **no tiene ninguna tool de CRM**. Sumar registro de tools por
dominio con rol y nivel de riesgo, y habilitar las del CRM.
**Ideas asociadas**: "Llamé a…" por voz → interacción + tarea; resumen + próxima mejor acción por lead; clasificación de
leads entrantes.
**Tamaño**: L. **Estado**: pendiente (mes 2 de la auditoría).

### [D-07] Cosas chicas del núcleo comercial que siguen abiertas
- Responsable editable + filtro "Míos" por defecto + reparto de leads de Growth. **S**
- Interacciones también en la oportunidad + timeline única. **S**
- Botones de WhatsApp (wa.me con +54 9 normalizado) y mail que **registran** la interacción. **S**
- QuickLog en un solo POST (hoy hace varios). **XS**
- CallQueue (cola de llamadas del día, ya diseñada en el DS). **M**
- Necesidades sin endpoint de alta propio. **XS**
- Pantalla propia de empresas del CRM (lista con sus leads, unir duplicadas, archivar). **M**, ver Q-04.
- Hero de la oportunidad sin logo de la empresa del CRM (muestra iniciales hasta que pasa a Empresas). **XS**

---

# E · Evolucionar (la pata más floja)

### [E-01] Recorrido del cliente, fase 5: historia por empresa, recompra y LTV
**Qué**: la historia unificada a nivel empresa (no solo lead/persona), señales de recompra y LTV real.
**Por qué**: hoy la pata Evolucionar del modelo casi no existe; lo único que hay es el LTV en Rentabilidad y el valor de los
referidores.
**Tamaño**: L. **Estado**: acordado, sin arrancar.

### [E-02] Margen por proyecto conectado a Growth
**Qué**: las horas se cargan en el Módulo Trabajo (`work_time_entries`) pero no llegan a la lectura de Growth, así que no se
puede calcular la métrica norte (margen por peso invertido) ni la audiencia Best Customers.
**Tamaño**: M. **Estado**: idea acordada.

### [E-03] Recuperar oportunidades perdidas y cross-sell
**Qué**: UC-028 y UC-029 del documento maestro: avisos y campañas sobre perdidas con propuesta, y recomendación de servicio
para clientes actuales.
**Tamaño**: L. **Estado**: idea.

### [E-04] Espacio del cliente sobre Growth: que vea sus resultados
**Qué**: que cada cliente entre a ver **sus** consultas, visitas, campañas y landings — el workspace que ya tiene, pero
desde su lado. Detalle, qué mostrar y qué esconder: cap. [10_espacio_del_cliente.md](10_espacio_del_cliente.md) › Parte 2.
**Por qué**: hoy el cliente no entra a Growth (el enum de roles no tiene rol de cliente) y los contactos se le pasan por CSV
a mano. Además es argumento de venta: Chimpancé deja de entregar solo campañas.
**Recomendación**: **no** crear un rol `client` ni un login nuevo — extender el enlace por persona que ya usa para
entregables y reuniones con una sección "Resultados".
**Tamaño**: L. **Estado**: acordado como dirección (29/9/2026), sin arrancar. Depende de Q-08 y Q-09.

### [E-05] Acceso del cliente a nivel empresa (hoy es por proyecto)
**Qué**: `work_client_access` tiene unique `(project_id, company_contact_id)`: el acceso es por proyecto. Para "los
resultados del cliente" hace falta un acceso por empresa o por workspace, con registro de qué vio y cuándo.
**Dónde**: `shared/schema.ts › workClientAccess`, rutas públicas de revisión.
**Tamaño**: M. **Estado**: prerequisito de E-04.

### [E-06] Onboarding del espacio de un cliente nuevo
**Qué**: al dar de alta un cliente con campañas, crear el workspace, sus campañas y sus landings y entregar el snippet listo
para su sitio o su GTM, en un paso (UC-019 del documento maestro). Hoy son cinco pantallas y es fácil olvidarse las landings.
**Tamaño**: S-M. **Estado**: idea.

---

# L · Aprender

### [L-01] Brief automático diario/semanal
**Qué**: el brief de inteligencia existe pero se pide a mano; falta el job y el aviso.
**Tamaño**: S. **Estado**: pendiente desde el 5/9.

### [L-02] Decision Engine: recomendaciones de campaña con aprobación
**Qué**: nivel 3 del modelo (prescriptivo). "Subí presupuesto acá / pausá esto", con evidencia y un botón de aprobar.
**Tamaño**: L. **Estado**: idea del documento maestro (UC-004, UC-027).

### [L-03] Growth Memory: que el aprendizaje quede guardado
**Qué**: nivel 4. Hoy nada guarda "esto funcionó" como patrón reutilizable (UC-040, UC-017).
**Tamaño**: L. **Estado**: idea.

---

# P · Plataforma, seguridad y UX

### [P-01] Guía de onboarding de `/growth`
**Qué**: falta la entrada en `onboardingContent.ts`.
**Tamaño**: XS.

### [P-02] Dejar un solo lugar para el código de medición
**Qué**: hoy se ofrece en tres (tarjeta de la propuesta en la oportunidad, cada propuesta en la ficha del lead, y el bloque
"Recorrido en la web"). Ver Q-01.
**Tamaño**: XS.

### [P-03] Estado del pase: todo lo del CRM y Growth ya está en producción
**Qué**: verificado el 29/9/2026 — `git log origin/main..origin/dev` no muestra nada del CRM, Growth ni del plugin de Gmail:
Personas (1a/1b), envío individual de propuestas, consultas y recorrido, demos medidas y el plugin viajaron en los pases del
21 al 25/9 (migraciones hasta 0045). **Antes de decir que algo "está en dev", correr ese comando.**
**Ojo**: los commits `1b51f4b` / `5fabaee`, que Santiago había rechazado, pasaron a producción **sin revertir** → la tarjeta
"código de la propuesta" en la ficha del lead sigue viva allá (se cruza con P-02 / Q-01).

### [P-04] Carga inicial de personas en producción: nunca se corrió
**Qué**: `POST /api/crm/people/backfill` (primero `dryRun`) todavía no se corrió en producción. Al 21/9
`/api/crm/people/stats` daba 5 leads con 0 vinculados y 7 de 9 contactos. Hasta que se corra, las personas de producción no
tienen su identidad armada y la ficha de Personas se ve vacía o parcial.
**Tamaño**: XS (más el OK de Santiago). **Estado**: esperando el OK para correrla.

### [P-05] Envío real de prueba de una propuesta
**Qué**: en dev se probó sin mandar mails reales (el Gmail conectado del admin de dev es de otra cuenta). Falta que Santiago
haga un envío real a una casilla suya y que instale el plugin de Gmail con su llave.
**Tamaño**: XS. **Estado**: esperando a Santiago.

### [P-06] Borrar el worktree `Chimpa2026/Chimpa-Finanzas-wt-propuestas`
**Qué**: quedó de cuando la sesión de propuestas trabajó aparte. Limpieza.
**Tamaño**: XS.

---

# B · Bugs vivos

### [B-01] Convertir dos veces duplica la oportunidad
`opportunity.service.ts:426-523`. Sin guarda de idempotencia. **Severidad alta** (ensucia el embudo y el pronóstico).

### [B-02] El kanban oculta los pipelines que no son el default
`CrmOpportunities.tsx`. Si alguien crea un pipeline nuevo, sus oportunidades desaparecen de la vista.

### [B-03] Archivar un lead por PATCH no guarda la fecha y sus tareas desaparecen de Hoy
Queda sin rastro de cuándo se archivó y las tareas abiertas se esfuman de la pantalla Hoy.

### [B-04] `ensureLead` crea un lead al anotar en una oportunidad sin lead
`opportunityService.ensureLead` (17/9). **Rompe la regla canónica** "lead = consulta real". Ver Q-05.

### [B-05] Los mails entrantes se ordenan por la hora del sondeo
`email.service` guarda `occurred_at = now()` en vez de `received_at`, así que la Historia los ubica mal. Coordinar con la
sesión de correo.

### [B-06] Referidores viejos cargados como clientes en producción
Los creados desde el lead entre el 15 y el 16/9 entraron a Empresas como "cliente" (`audit_log` con
`details.via = 'referrer'`). No se movieron solos porque producción no tiene backup confirmado: revisarlos con Santiago y,
si no son clientes, pasarlos al CRM a mano.

### [B-07] Operativo: propuestas con el link pegado y sin registrar
Ej.: la oportunidad de ASAGA en producción. Un clic en "Enviar propuesta" o "Código para medirla" la registra. Para medir la
lectura hay que pegar el código en la página de la propuesta.

---

# Q · Decisiones que espera Santiago

### [Q-01] ¿Un solo lugar para el código de medición?
Hoy está en tres lugares. Propuesta: dejar el de la oportunidad.

### [Q-02] ¿Por dónde se empieza a devolver conversiones?
Santiago pidió Meta y LinkedIn primero y Google después. **Recomendación técnica: empezar por Google**, porque la campaña
activa es Google Search y el `gclid` ya se guarda. Es decisión de negocio.

### [Q-03] Privacidad antes de subir mails a las plataformas
Subir mails, aunque vayan con hash, es tratamiento de datos personales (Ley 25.326): hay que actualizar la política de
privacidad del sitio antes de la fase 5 y, para workspaces de clientes, sumar una cláusula al contrato. No frena las fases
1 a 4.

### [Q-04] ¿Pantalla propia de empresas del CRM?
Hoy se ven desde cada lead. Se construye solo si Santiago la pide.

### [Q-05] ¿Qué hacemos con `ensureLead`?
Opciones: (a) que la nota cuelgue de la oportunidad y no cree lead (coherente con la regla), (b) dejarlo. Recomendación: (a).

### [Q-06] ¿Copia fija de las propuestas a alguna casilla?
El envío sale del Gmail de quien aprieta Enviar. Falta decidir si además va una copia a una casilla de Chimpancé.

### [Q-08] ¿Al cliente se le muestra la inversión en su espacio?
Es su plata, pero mostrarla deja ver también nuestro fee y el costo por consulta. Decide si el espacio del cliente (E-04)
incluye Inversión y costo por consulta o solo volumen y resultados.

### [Q-09] ¿El espacio del cliente es parte del servicio o se cobra aparte?
Cambia cómo se construye: incluido en el fee mensual como argumento de venta, o producto aparte con su precio. También hay
que decidir si el acceso es uno por empresa o varios enlaces por área (como ya pasa con el feedback).

### [Q-07] Expectativa con las audiencias de personas conocidas
Con el volumen de Chimpancé sirven para excluir clientes y como semilla de similares, no como público de remarketing en sí.
Conviene tenerlo claro **antes** de invertir en las fases 5 y 6.

### [Q-10] Hotjar interno: decidido el 30/9/2026
Ficha **A-14**. Lo que Santiago decidió:
- **Alcance**: se hace **todo** (mapas de calor, grabaciones, encuestas, embudos, frustración, errores, resumen IA) y
  **los frentes se desarrollan en paralelo**, no en fases una atrás de otra.
- **Para quién**: **interna primero, cliente después**. Se construye para que Chimpancé optimice landings y campañas; se
  suma al espacio del cliente (**E-04**) cuando esté madura. No se le promete al cliente todavía.
- **Grabaciones**: **sí**, con **inputs enmascarados por defecto**, muestreo, retención corta y **aviso de privacidad en
  el sitio del cliente**. Sin enmascarado y sin aviso no se graba.
Queda abierto: cuánto tráfico tienen los sitios de los clientes (define si el almacenamiento de grabaciones entra en el
droplet o hace falta almacenamiento aparte).

---

# I · Ideas en carpeta

### [I-01] Lectores anónimos de propuestas
Hoy la propuesta se atribuye a la persona del link. Para lecturas sin código (reenvíos), quedaría medir el lector anónimo.
Decidido dejarlo afuera de la etapa actual.

### [I-02] No vincular el lead en vistas previas
Idea de la versión descartada (parche `propuesta-b-descartado.patch`): en `*.replit.dev`, `localhost` y `file:` no vincular,
porque mientras se arma la propuesta el navegador de quien la arma queda vinculado al lead.

### [I-03] Modo equipo recordado en el navegador
Misma versión descartada: que `?vista=equipo` quede en `localStorage` y no solo en la pestaña.

### [I-04] Google Customer Match y TikTok
Después de Meta y LinkedIn.

### [I-05] Agente por WhatsApp/Telegram con tools de CRM
La misma lógica del chat con otra puerta de entrada (el pedido original es del skill del ERP, pero si entra por ahí un lead,
las reglas de este skill valen igual).

---

## Growth: A/B y micro-eventos en workspaces de cliente (29/9/2026, visto armando el A/B de MT AGRO)

### [B-08] El resultado de un experimento A/B es ciego en un workspace de cliente
`experiment.service.ts` › `computeResults` cuenta `crm_leads` (atribución + identidades). Un workspace `kind: client`
**nunca crea leads**: el z-test, el lift, el SRM y las tasas darían 0 en todas las variantes para siempre, sin avisar.
Lo único que sí cuenta consultas por variante es el bloque "Experimentos" del Resumen
(`analytics.service.ts`, `leadsByVariant` sobre `growth_form_submissions.variantId`). **Severidad media**: no rompe nada,
pero invita a leer un número falso. Arreglo posible: que `computeResults` use envíos aceptados cuando el workspace es
cliente, o que la pantalla del experimento avise que ahí no hay resultados.

### [B-09] Los micro-eventos no se ven por landing en ninguna pantalla
`form_start`, `scroll`, `whatsapp_click`, `cta_click` y `return_visit` se guardan bien en `crm_events` con su
`landing_id`, pero el Resumen solo muestra visitas y consultas por landing. Para comparar dos versiones de una página
con poco volumen —que es el caso normal de un cliente— hay que salir a GA4 o consultar la base. Falta un bloque
"Qué hizo la gente en cada landing" con los eventos por tipo.

### [B-10] Atar una landing a una campaña le suma el tráfico orgánico a la campaña paga
`campaign.service.ts` › `resolveCampaign` usa `landing.campaignId` como respaldo cuando el evento no trae
`utm_campaign`. Consecuencia: si la landing de una campaña está atada a esa campaña, **toda visita directa u orgánica a
esa página se cuenta como visita paga**, y lo mismo con las consultas. Pasó en MT AGRO y se corrigió desatando las
landings. No está dicho en ningún lado de la interfaz, y el campo "Campaña" del formulario de landing invita a atarla.
Mínimo: una aclaración en la ayuda del campo.

### [I-06] Segmentar Consultas por un campo del payload
Los campos libres de `chimp.lead(...)` (por ejemplo `variante`, `hectareas`) se guardan enteros y salen en "Otros datos",
pero no se pueden filtrar ni agrupar desde la pantalla ni desde el Excel. Con un filtro por clave/valor del payload,
un A/B de landing se leería entero adentro del ERP y no haría falta GA4.

### ~~[P-07] Borrar el worktree `Chimpa2026/Chimpa-Finanzas-wt-a14`~~ — HECHO el 4/10/2026
**Por qué existe**: el 30/9/2026 `origin/dev` ya tenía un `0050` (soporte por horas) y el árbol principal tenía cambios
sin commitear de la sesión de ARCA en `server/routes.ts`, así que el merge no se podía hacer ahí sin pisar trabajo ajeno.
Se hizo en un worktree aparte (con `node_modules` enganchado por junction) y se pusheó desde ahí.
**Qué se hizo**: la rama `a14-merge` quedó entera adentro de `origin/dev`, así que se borraron el worktree y la rama, y
se paró el servidor local que corría desde ahí.
**Tamaño**: S. **Estado**: hecho.

### ~~[B-11] El deploy está caído por facturación de GitHub (30/9/2026)~~ — RESUELTO el 4/10/2026
**Qué pasa**: todas las corridas del workflow "Deploy" mueren a los 4 segundos, en `dev` y en `main`, desde las 18:05 del
30/9. El mensaje es de GitHub, no del código: *"The job was not started because recent account payments have failed or
your spending limit needs to be increased"*.
**Qué implica**: lo que se pushea a `dev` **no llega a dev-finanzas**, así que no se puede probar nada en la nube ni
migrar a producción. Las migraciones pendientes (`0050`, `0051`, `0052`) se aplican recién cuando el deploy vuelva.
**Quién lo arregló**: Santiago, en Billing & plans de GitHub. Al 4/10 las corridas vuelven a salir en verde, en `dev`
y en `main`, y las migraciones `0050`, `0051` y `0052` se aplicaron solas en los deploys siguientes.

## Growth para SEO y conversiones configurables (1/10/2026, charla con Santiago, QueVibra como primer caso)

Pregunta de Santiago: el Growth OS está pensado para SEM; ¿qué pasa si queremos lo mismo a nivel SEO, por ejemplo para
QueVibra? Respuesta corta: **la cañería sirve igual** (el snippet ya mide toda visita, venga de donde venga); lo que
está pensado para SEM es cómo se clasifica y qué se cuenta. QueVibra es el primer caso porque se va a implementar, pero
**todo lo de abajo es genérico para cualquier workspace**, no "cosas de Vibra".
**Ojo, coordinar**: la sesión "🛠️ Growth: Workspace más simple (auditoría UX)" (1/10/2026) está repensando la UX del
workspace al mismo tiempo. Todo lo que cambie pantallas (tarjetas del Resumen, Configuración, tabla de grupos de
páginas) se diseña junto con lo que salga de esa sesión, no por separado.

### [A-16] Conversiones configurables por workspace
**Qué**: que cada workspace defina **qué cuenta como conversión**, como los eventos clave de GA4, en vez de que el ERP
cuente siempre "consultas" (formulario). Cada conversión: **nombre** + **regla** + **principal o secundaria** + **cómo
cuenta** (una vez por visita o cada vez). Tipos de regla:
1. **Evento**: `chimp.track("registro", { rol: "organizador" })`, con filtro opcional por una propiedad.
2. **Página**: `/gracias*` (exacta o prefijo con `*`, igual que los embudos).
3. **Formulario**: lo que hoy es "consulta" (por `formKey` o cualquiera).
4. **Enganche**: visita con ≥ N páginas, ≥ X minutos o alguna interacción de una lista de eventos.
5. **Vuelve**: el visitante vuelve dentro de N días.

La **principal** ocupa la tarjeta grande del Resumen y es la base del "costo por conversión"; las secundarias van al lado.
**Ejemplos**: QueVibra → principal registro, secundarias registro de organizador, Me Vibra, vuelve en 30 días.
MT AGRO → principal consulta, secundaria clic en WhatsApp.
**Reglas que no se tocan**:
- **Chimpancé (`internal`) queda fijo**: su conversión es el lead real (lead = consulta real). Ahí no se configura.
- **Compatible hacia atrás**: todo workspace de cliente arranca con "Consulta" como principal → MT AGRO se ve igual.
- **Una conversión no lleva "valor" en plata cargado a mano**: los ingresos siguen saliendo de cobros reales.
- Una conversión **no es lead ni consulta** (igual que una respuesta de encuesta).

**Por qué**: hoy un workspace cuyo objetivo no es un formulario (QueVibra: registros, enganche, vuelta) ve "Consultas: 0".
**Se apoya en**: el matcher de los embudos (`funnel.service.ts` › `parseSteps`/`stepMatches`: evento o página con `*`),
así que no es un motor nuevo; los embudos podrían elegir conversiones ya cargadas como pasos.
**Destraba**: **B-08** (el A/B en un workspace de cliente pasaría a medirse contra la conversión principal) e **I-06**
(el filtro por propiedad es el mismo mecanismo).
**Dónde**: tabla nueva de conversiones por workspace (migración versionada), `analytics.service.ts` › `overview`,
`experiment.service.ts` › `computeResults`, Growth › Instalación › Configuración, tarjetas del Resumen.
**Tamaño**: M-L. **Estado**: acordado en lo conceptual (1/10/2026); falta diseño de pantalla con la sesión de UX y OK
para programar.

### [A-17] Distinguir orgánico de directo (y redes) por el referrer
**Qué**: hoy toda visita sin UTM cae en "(directo)" (`analytics.service.ts:35`, placeholder `PH.source`). El `referrer`
**se guarda** en la sesión (`event.service.ts`) pero nadie lo usa para clasificar. Derivar canal cuando no hay UTM:
google/bing/duckduckgo → **búsqueda orgánica**; instagram/facebook/tiktok/linkedin → **redes**; otro dominio →
**referido**; vacío → **directo**. Los UTM siguen mandando cuando están.
**Por qué**: sin esto el ERP no puede decir "esto vino de Google orgánico". Afecta a TODOS los workspaces: en MT AGRO las
visitas orgánicas hoy están mezcladas con las directas.
**Ojo**: el referrer solo cuenta en la **primera** página de la sesión (las internas tienen el propio sitio como referrer).
Ver también **B-10** (una landing atada a campaña le suma el orgánico a la paga).
**Tamaño**: S. **Estado**: acordado; primero en el orden recomendado.

### [A-18] Grupos de páginas (por plantilla o prefijo) en vez de "campaña" para SEO
**Qué**: en SEO la unidad no es la campaña sino el **grupo de páginas**: fichas de evento, páginas de ciudad, categorías.
Las landings hoy se reconocen por origin+pathname **exacto**; QueVibra tiene miles de fichas que vencen. Permitir
landings/grupos por prefijo (`/eventos/cordoba*`) o patrón, y una tabla en el Resumen por grupo (visitas orgánicas,
enganche, conversiones).
**Se apoya en**: el comodín `*` que ya usan los embudos.
**Tamaño**: S-M. **Estado**: acordado; segundo en el orden.

### [A-19] Conectar Google Search Console (lo que pasa antes del clic)
**Qué**: el snippet recién ve a la persona cuando entra; el SEO se juega antes: **impresiones, clics, CTR, posición media y
búsquedas**, que solo tiene Search Console. Conector por workspace a la API de GSC con importación diaria página ×
búsqueda × día, y el embudo SEO completo en el Resumen:
**Impresiones → Clics orgánicos (CTR) → Visitas → Conversiones (A-16) → Posición media**, más las búsquedas que más traen
por grupo de páginas (A-18).
**Inversión en SEO**: no hay costo por clic; se cargan **horas × tarifa** en Inversión con canal `organic` (ya soportado)
y sale el costo por conversión. Es criterio, no código.
**Tamaño**: M. **Estado**: acordado; tercero en el orden (después de A-17 y A-18).

### [A-20] Métricas de enganche: % que vuelve, visitas con interacción, minutos por visita
**Qué**: lo que Santiago quiere ver de QueVibra además de los registros (hoy "es bajo"). Estado real:
- **% que vuelve**: el snippet ya manda `return_visit`, pero ninguna pantalla lo muestra. Falta la tarjeta + la ventana.
- **Rebote**: no se calcula (los datos están: sesiones + `page_view`). **Recomendación**: medir **visitas con
  interacción** en vez de rebote, porque en una agenda el rebote engaña (alguien ve día/lugar/precio en la ficha y se va
  a comprar la entrada: cuenta como rebote y QueVibra cumplió). Interacción = tocó entradas / Me Vibra / compartir /
  agendar, o ≥ 2 páginas, o ≥ X segundos. Es una regla tipo "Enganche" de A-16.
- **Minutos navegando**: hoy solo con "Medir comportamiento" prendido, y agregado por página y día, no por visita ni
  por persona. Falta sumarlo por visita.

**Ojo al leer "vuelve"**: se reconoce por la marca del navegador; Safari (iPhone) la borra a los 7 días y otro
dispositivo cuenta como otra persona → **subestima**. Para usuarios registrados, la vuelta se mide mejor desde la base
del producto (inicios de sesión) que desde el snippet.
**Tamaño**: S-M. **Estado**: acordado; va junto con A-16.

### [Q-11] Decisiones abiertas de Growth para SEO / QueVibra
1. **Ventana de "vuelve"**: ¿7 o 30 días? (o configurable dentro de A-16).
2. **Privacidad del workspace de QueVibra**: en el ERP, QueVibra y lo personal son solo para `admin` (Santiago,
   `users.visible_owners`, migración 0046). Los workspaces de Growth **no tienen titular**: confirmar en el código que el
   otro admin no lo vería antes de crearlo, o sumarle titular al workspace.
3. **Identidad sin mails**: para unir visitas con usuarios de QueVibra mandar un **id anónimo + rol**, nunca el mail
   (si no, cada usuario pasaría a ser una Persona del ERP y se mezcla con Chimpancé).
4. **Del lado de QueVibra** (skill `quevibra-dev`): emitir `chimp.track("registro", { rol })` al registrarse bien, y los
   eventos de interacción (entradas, Me Vibra, compartir, agendar). Comparar contra GA4 si QueVibra lo tiene, para
   calibrar.

## Workspace más simple: auditoría UX del 1/10/2026 (sesión "🛠️ Growth: Workspace más simple (auditoría UX)")

Auditoría con `ux-chimpa` (Krug) sobre MT AGRO en producción. **HECHO en dev 1/10** (commits `1a133ea`, `335011a`,
`588099f`, migración 0053): 13 → 6 pestañas (Resumen · Consultas · Campañas · Mejorar el sitio · Chimpa IA ·
Configuración), pestaña y período en la URL, un solo período, consultas de prueba que no cuentan, lista de Growth que
cuenta consultas, aviso de inversión que falta, un solo código por sitio con formularios automáticos. Cómo funciona: cap. 02
› "Workspace en 6 pestañas". **Para la sesión de SEO**: una pestaña nueva se suma en el array `TABS` de
`client/src/pages/GrowthWorkspace.tsx` (clave, etiqueta, si usa el período, quién la ve); "De dónde vienen" del Resumen ya
agrupa por origen en criollo (`OverviewTab.tsx` › `originLabel`), A-17 lo reemplaza por el canal real.

### [E-07] Página pública de resultados para el cliente
**Qué**: Santiago confirmó (1/10/2026) que **va a haber una página pública** para que el cliente vea su workspace. El
Resumen ya quedó pensado para eso (sin jerga, últimas consultas a la vista, sin columnas del CRM). Falta: qué secciones
salen (Resumen + Consultas, ¿inversión? → Q-08), el acceso (E-05: reusar el enlace por persona) y que las pruebas del
equipo nunca se vean.
**Tamaño**: M. **Estado**: acordado que existe; falta diseño y Q-08.

### [B-12] El mes global del encabezado aparece en pantallas que no lo usan
**Qué**: `DateNavigator` (Octubre 2026 · 6M) se ve en todo el ERP pero solo lo leen las pantallas de finanzas; al tocarlo
navega a `?range=month&ym=…` y **pisa los parámetros de la URL** de la pantalla. En Growth se ocultó (1/10/2026); en el
CRM y el resto sigue.
**Dónde**: `client/src/components/DateNavigator.tsx`, `Layout.tsx`. **Tamaño**: XS-S. **Estado**: idea.

### [A-21] Formularios automáticos: decisiones abiertas
**Qué**: con `settings.autoForms` encendido, (1) un formulario sin campo de nombre manda el mail o el teléfono como nombre
(si no, `/leads` lo rechaza y se pierde); (2) con reCAPTCHA cargado en el workspace, lo capturado solo queda como spam
(la pantalla lo avisa); (3) si el sitio llama `chimp.lead` más de 1,5 s después del envío, puede haber dos consultas.
**Tamaño**: XS cada una. **Estado**: decidido por Santiago (4/10/2026): (1) queda así; (2) queda con el aviso "por ahora".
**Ojo**: Santiago dice que en teoría **todos** los formularios deberían tener reCAPTCHA. Si es así, lo capturado solo va a
caer siempre como spam: la próxima vuelta es que el snippet mande también el token de reCAPTCHA del sitio
(`g-recaptcha-response`, hoy excluido a propósito) o que el server confíe en la captura automática por otro lado.

### [I-08] Probar el workspace nuevo con 3 personas
**Qué**: guion de Krug: "fijate si entraron consultas esta semana y de quién", "cuánto nos costó cada una", "marcá la
de prueba", "prendé el mapa de calor". Anotar dónde dudan. **Tamaño**: XS. **Estado**: idea.

### [A-22] "Medir todo": lo que el código del sitio ya no puede medir solo (4/10/2026)
**Hecho en local 4/10** (rama `growth-periodo`, sin subir): el script mide solo teléfono, mail, descargas, salidas a otros
sitios, botones sin marcar, búsquedas del sitio y formularios/agendas de HubSpot, Typeform, Tally y Calendly; tarjeta "Qué
hicieron en el sitio" en el Resumen (`overview.actions`). Lo que **no** se resuelve con el script y queda pendiente:
1. **Inversión automática** desde Google Ads y Meta (API con OAuth + developer token de Google Ads). Hoy a mano o CSV.
2. **Devolver conversiones** a Google y Meta (fases 4-6 del plan del 19/9). Mientras tanto, GTM puede mandar los
   eventos `chimp_*` del dataLayer como conversión.
3. **Search Console** (A-19, sesión de SEO).
4. **Hechos propios del producto** ("se registró"): una línea `chimp.track` en el sitio, o conversiones por página (A-16).
5. **Videos de YouTube** incrustados: necesita `enablejsapi=1` en el iframe; no hecho.
6. **Google Forms** incrustado: no avisa nada al sitio, no se puede medir desde afuera.
7. **Bloqueadores y banners de cookies** que frenan GTM: no se puede evitar con el script; con el código pegado directo
   en el sitio (sin GTM) se pierde menos.
**Tamaño**: 1 y 2 son M-L cada una. **Estado**: idea / esperando OK.
