# 06 · Reglas duras, seguridad y trampas que ya costaron

> Checklist para no repetir errores. El detalle de cada caso está donde se indica; acá está lo que hay que tener presente
> **antes** de tocar código o de abrir algo al público.

## 1. Antes de tocar el módulo

- [ ] **Leer `docs/growth/api-contract.md`** si el cambio toca el snippet, las rutas públicas, el A/B o una métrica: es la
      fuente de verdad técnica del contrato.
- [ ] **¿La consulta nueva filtra por `workspace_id`?** Todo el CRM y Growth es multi-workspace.
- [ ] **¿Respeta el alcance del rol `sales`?** (`crm/salesScope.ts`: lo propio + lo sin asignar; 404 al resto).
- [ ] **¿Necesita plata?** Pedirla a la cadena lead → oportunidad ganada → proyecto → cobros (`revenue.ts`,
      `fetchArCollectionsArs`), nunca a un campo cargado a mano.
- [ ] **¿Crea un lead?** Si no es una consulta real de una persona, no va (regla canónica).
- [ ] **¿Une identidades?** Solo por mail exacto y solo a través de `person.service.ts`.

## 2. Seguridad

- **Candado global**: `apiAuthGuard` (`server/lib/apiAuth.ts`) está montado antes de toda ruta. Las únicas públicas son
  `/api/auth/login|logout|me|register`, `/api/public/review/*`, `/api/public/growth/*` y
  `/api/integrations/google/callback`. **Una ruta pública nueva hay que sumarla a esa lista o responde 401.**
- **Guards de rol con ruta normalizada**: Express rutea `/API/x` igual que `/api/x`, y eso esquivaba el guard del
  colaborador. Cualquier prefijo nuevo (por ejemplo `/api/gmail-plugin`) hay que sumarlo a `SALES_ALLOWED_PREFIXES` /
  listas de `roleGuard.ts`, o el guardia lo bloquea antes de llegar al router.
- **Ids escritos de otra forma** (`+12`, `1e1`, `0xc`, `12%20`): los guardias matchean con `\d+` pero las rutas leen el id
  con `Number()`, así que esquivaban el alcance del vendedor y el candado solo-admin de las descargas. Lo corta
  `canonicalIdGuard` (`apiAuth.ts`). Al agregar una ruta con id no hace falta nada nuevo, pero **no inventar ids raros**.
- **Endpoints legacy borrados**: `POST /api/crm/events` e `/identify` públicos ya no existen (el viejo `identify` permitía
  reescribir eventos de cualquier lead). No revivirlos: el ingest público entra por `/api/public/growth/:key`.
- **Sal de IP**: `IP_HASH_SALT` o derivada de `SESSION_SECRET` en producción.
- **Llaves del workspace**: `publicKey` (`gw_pub_…`) va al navegador; `serverKey` (`gw_srv_…`) es solo server-to-server y
  **saltea captcha y honeypot** — nunca ponerla en el cliente. Rotarlas es una acción de admin.
- **Llaves personales de la API** (plugin de Gmail): valen lo mismo que su dueño. En la base queda solo el SHA-256 y se
  muestran una única vez.

## 3. Secretos que invalidan links si se rotan

| Secreto | Qué rompe al cambiar |
|---|---|
| `LEAD_LINK_SECRET` (o su derivada de `SESSION_SECRET`) | Todos los links personales `?chl=` y códigos de persona `?chp=` emitidos antes dejan de vincular. No desloguea a nadie ni rompe el Playbook. |
| `SESSION_SECRET` | Además de las sesiones, arrastra las derivadas (link, sal de IP) si no están puestas aparte. |

## 4. El snippet y las rutas públicas

- **Nada de `navigator.sendBeacon`**: siempre lleva credenciales y con `Access-Control-Allow-Origin: *` el navegador lo
  bloquea desde cualquier dominio que no sea el ERP → **ningún sitio externo registraba visitas** (bug del 17/9/2026). Hoy
  va `fetch` con `credentials: "omit"` + `keepalive` (reintento sin keepalive). **No volver a sendBeacon ni abrir el ERP a
  credenciales desde cualquier origen.** Test: `tests/growthSnippetEnvio.test.ts`.
- **Rate limit por clave del workspace, no por visitante** (`identify`: 300 / 10 min para todo el sitio). Ojo al diseñar
  algo que dispare muchos pedidos por visita.
- **Payload del formulario**: los campos de contacto se guardan siempre como texto (un objeto se descarta: antes
  `[object Object]` rompía la pantalla) y un campo gigante no tumba la recepción. `pageUrl` y `referrer` quedan en el
  payload.
- **El snippet no corre en navegadores automáticos** y saca `?chl=` sin reescribir el resto de la dirección.
- **Vinculación del link personal**: no vincula robots, ni leads archivados, ni un navegador ya vinculado a OTRO lead. El
  recorrido se cuenta por los **eventos** del lead (`crm_events.entity_id`), no por el navegador. Se deshace con
  `DELETE /api/crm/leads/:id/web-browsers/:visitorId` (queda en `audit_log`).

## 5. Datos, fechas y archivos

- **Períodos en hora de Buenos Aires**: `arDayStart` / `arDayEnd` / `arYmd` de `shared/growthConsultas.ts`, usados en
  `overview`, `submissions`, las descargas y el brief. Antes el corte era UTC y la consulta de las 22:30 caía al día
  siguiente.
- **CSV para Excel**: `server/domains/growth/csvExport.ts` (`csvText`, `csvPhone`, `csvDateTimeAR`, `csvDocument`), separador
  `;` + BOM. Neutraliza fórmulas (`'` adelante si la celda empieza con `= + - @`), manda los teléfonos como `="…"` y va con
  `Cache-Control: no-store` (el navegador servía descargas viejas).
- **Dedupe de leads**: por email o teléfono dentro de `leadDedupDays` (30 por default). El duplicado **no se descarta**:
  queda como fila `duplicate` en `growth_form_submissions`.
- **USD**: en `growth_spend` el dólar se congela al BNA venta (`fxRate`, `amountArs`) y el gasto se prorratea por días al
  cruzar con un rango. El chat **no acepta** `USD_BNA`.
- **`crm_identities`** necesita el unique `(visitor, entity_type, entity_id)`: sin él, `identify` falla siempre (bug ya
  corregido, pero es fácil de perder en una migración).

## 6. Experimentos A/B

- La asignación es determinística (`fnv1a32` con `Math.imul`) y **tiene que ser idéntica** en
  `server/domains/growth/stats.ts` y en `client/public/growth.js`. El `workspace.id` viaja en `/config` porque entra en el
  hash.
- **Cambiar la `key` de un experimento fuera de `draft` está prohibido**: re-barajaría a todos los visitantes.
- Los resultados traen warnings por muestra chica (<100 exposiciones, <14 días) y SRM (chi²). En B2B de bajo volumen, un
  "ganador" sin esas condiciones no es un ganador: decirlo antes de que alguien tome una decisión de plata.

## 7. Workspaces

- **El `kind` por defecto al crear un workspace es `client`.** Si alguna vez se arma uno para algo PROPIO de Chimpancé,
  tiene que ser `internal` (si no, no genera leads ni score y el recorrido no se mide).
- Un workspace de cliente: sin notificación, sin score, sin leads, sin calificados/oportunidades/ingresos/ROI en el
  Resumen. Solo **consultas** y costo por consulta.
- La importación **rechaza** leads y contactos en un workspace de cliente.

## 8. Privacidad

- Subir mails o teléfonos a Meta/LinkedIn, aunque vayan con hash, es tratamiento de datos personales (**Ley 25.326**):
  antes de la fase 5 hay que actualizar la política de privacidad del sitio y, para workspaces de clientes, sumar una
  cláusula al contrato.
- **Datos de un cliente nunca visibles para otro.** Lo transversal es anónimo, agregado y metodológico.
- Las contraseñas y accesos de clientes viven cifrados en el Playbook (cap. 08 del skill del ERP), no en el CRM.

## 9. Pruebas que ya existen (correrlas antes de tocar algo cerca)

`tests/`: `growthConsultasRecorrido.api.test.ts` · `growthSnippetEnvio.test.ts` · `growthDemo.test.ts` ·
`recorridoCliente.api.test.ts` · `leadLink.test.ts` · `people.test.ts` · `personas.api.test.ts` ·
`crmAuditoria.api.test.ts` · `crmProspectos.api.test.ts` · `referidos.api.test.ts` · `apiAuth.test.ts` ·
`gmailPlugin.api.test.ts` · `leadWebInfo.test.ts` · `prospects.test.ts`.

Corren en el CI: si fallan, el deploy no sale. El test obligatorio en Chrome real contra dev-finanzas es aparte y sigue
siendo obligatorio (cap. 01 del skill del ERP).
