# 10 · El espacio de cada cliente (workspace)

> Cada cliente con campañas tiene su **propio espacio, separado del de Chimpancé**. Este capítulo tiene dos mitades:
> **cómo funciona hoy** (lo que ya se puede operar) y **qué falta para que el espacio sea del cliente** (que entre a verlo).
> Verificado contra `shared/schema.ts` y las rutas el 29/9/2026.

---

# Parte 1 · Cómo funciona hoy

## Qué es y por qué está separado

Un **workspace** (`growth_workspaces`) es un espacio de adquisición aislado: sus campañas, landings, formularios,
visitas, experimentos, inversión y consultas no se mezclan con los de nadie más. Hay dos tipos:

| | `internal` | `client` |
|---|---|---|
| Quién | **Chimpancé** (workspace "chimpance", trae todo el CRM histórico) | cada cliente con campañas: MT Agro, OG, Regio… |
| Un formulario genera | **lead** en el CRM, con dueño, score, aviso y atribución | **consulta** (`growth_form_submissions`), y nada más |
| Se mide el recorrido del cliente | sí (visita → lead → propuesta → venta → cobros) | no: eso es de Chimpancé |
| Aparece en el Resumen | visitas, leads, calificados, oportunidades, ingresos, ROI | visitas, **consultas** y **costo por consulta**. Nada de ganadas, ingresos ni ROI |

**Por qué es así** (decisión de Santiago, 15/9/2026): el CRM es la máquina comercial de Chimpancé. Los contactos de los
clientes no son prospectos nuestros, no tienen que ensuciar el pipeline, el score ni los tableros — y tampoco tienen que
poder verse desde otro cliente.

## Dar de alta un workspace de cliente

Growth › **Nuevo** (`POST /api/growth/workspaces`, **solo admin**). Lo que se carga y lo que conviene saber de cada campo:

| Campo | Qué es |
|---|---|
`name` / `slug` | Únicos en todo el sistema |
`kind` | **⚠️ el default es `client`.** Si el workspace es para algo PROPIO de Chimpancé hay que ponerlo en `internal` a mano, o no genera leads ni score |
`companyId` | La empresa cliente (de Empresas). Ata el espacio a la ficha del cliente |
`publicKey` (`gw_pub_…`) | Va en el navegador: snippet, GTM, formularios |
`serverKey` (`gw_srv_…`) | **Solo server-to-server** (server actions). Saltea captcha y honeypot: nunca al browser |
`allowedOrigins` | Los dominios del cliente |
`timezone` / `baseCurrency` | Buenos Aires y ARS por default |
`recaptchaSecret` / `recaptchaMinScore` | Opcional (0,50 por default) |
`defaultOwnerUserId` | Quién queda dueño de lo que entra (en un cliente casi no aplica, pero conviene ponerlo) |
`defaultAcquisitionSourceId` | Fuente con la que entran las consultas (seed: "Web / Formulario") |
`leadDedupDays` | 30: dentro de esa ventana, el mismo mail o teléfono queda como `duplicate` |
`active` | Apagarlo deja de aceptar ingest sin borrar nada |

`POST /workspaces/:id/rotate-key` rota las claves. **Ojo: rotar rompe el snippet ya instalado** en el sitio del cliente
hasta que se actualice el código o el tag de GTM. Avisar antes.

## Conectar el sitio del cliente

1. Pestaña **Instalación** (`GET /workspaces/:id/install`) da el snippet listo:
   `<script src="ERP/growth.js" data-key="gw_pub_…" data-endpoint="ERP" defer>`. Se pega en el sitio o como tag HTML
   personalizado en GTM (All Pages).
2. Formularios: `chimp.lead({ formKey, name, email, phone, company, message })` desde el navegador, o
   `POST /api/public/growth/:key/leads` con `X-Growth-Server-Key` desde el backend del sitio.
3. Cargar las **campañas** con su `utm_campaign` (y alias, que no distinguen mayúsculas) y las **landings** con su URL:
   con eso la atribución sale sola.
4. La **inversión** se carga a mano o por CSV de Google/Meta Ads (pestaña Inversión), con el USD congelado al BNA venta.

## Qué se puede hacer con las consultas

Pestaña **Consultas** en `/growth/:id`: planilla con fecha, nombre, mail, teléfono, empresa, mensaje, otros datos,
formulario, landing, campaña, origen y estado (`accepted` | `duplicate` | `spam` | `rejected`), más **Descargar para Excel**
(`submissions.csv`, separador `;` + BOM, teléfonos como texto, **solo admin**, respeta el período y el estado elegidos).
Ese CSV es hoy la forma de pasarle los contactos al cliente.

## Quién ve qué

- **admin**: todo.
- **operador**: el workspace completo **menos Inversión, Inteligencia e Importar** (esas tres muestran plata).
- **sales**: Growth de **solo lectura**, y todavía sin filtrar por dueño (pendiente A-12).
- **el cliente: no entra.** El enum de roles es `admin · operator · sales · read_only · collaborator · accountant`:
  **no existe un rol de cliente**. Eso es la Parte 2.

## Errores típicos con workspaces

1. **Crear un workspace `client` para algo propio** (el default engaña) → no genera leads, no hay score, no se mide el
   recorrido. Se arregla cambiando el `kind`, pero lo que entró como consulta no se convierte solo en lead.
2. **Esperar leads en un workspace de cliente**: las consultas no entran al CRM, a propósito. La importación de leads o
   contactos ahí se rechaza.
3. **Rotar la clave sin avisar** → el sitio del cliente deja de medir.
4. **El rate limit es por clave del workspace**, no por visitante: un cliente con mucho tráfico se limita solo, y no afecta
   a los demás (una razón más para no compartir claves).
5. Cargar un workspace por cliente **sin campañas ni landings**: se mide tráfico anónimo y no se puede atribuir nada.
   Conviene abrir el espacio recién cuando hay algo que medir.

---

# Parte 2 · Lo que falta: que el espacio sea del cliente

## El punto de partida (importante para no construir dos veces)

El cliente **ya entra a un espacio del ERP**, pero no es el de Growth: es el del Módulo Trabajo. Funciona con un **enlace
por persona** (`work_client_access`: contacto, `person_id`, permiso, token con hash, vencimiento, último uso), sin login ni
portal nuevo, y hoy muestra dos secciones: **Estado** (cómo viene el proyecto, fase, próximo hito, lo que hace falta de
ellos, último reporte) y **Revisar** (comentarios, rondas, aprobar).

Ese espacio ya trae decididas las reglas difíciles:

- **El estado del proyecto es compartido; el feedback está aislado por enlace** (dos áreas del mismo cliente ven el mismo
  estado, pero cada una solo sus comentarios).
- **Hacia el cliente, el equipo firma como "Equipo Chimpancé"** salvo que sea una persona real.
- **Nunca sale**: tareas internas, nombres de usuario y roles del ERP, fases o pedidos internos, borradores de reporte,
  **montos y presupuestos**, identificadores internos y cualquier dato de la IA que clasifica el feedback.

**Recomendación técnica: no inventar un rol `client` ni un login nuevo.** Extender ese mismo acceso por persona con una
sección **"Resultados"** atada al workspace del cliente. Se reusa algo que el cliente ya sabe usar, hereda las reglas de
privacidad y evita abrir una superficie de login nueva. (El documento maestro propone un portal con roles `Client Admin` /
`Client Sales` / `Client Marketing`: eso recién tiene sentido si algún día el cliente **trabaja** sus leads adentro del
sistema, que no es el caso hoy.)

## Qué mostraría y qué no

| Mostrar | Esconder |
|---|---|
| Sus **consultas** con datos de contacto y mensaje, y la descarga a Excel | Cualquier dato de otro cliente o del CRM de Chimpancé |
| Visitas, visitantes y evolución en el período | Nuestros costos, márgenes y horas |
| Rendimiento por **campaña** y por **landing** | Los nombres internos de usuarios y roles del ERP |
| Estado de los formularios (aceptada, duplicada, spam) | El brief de inteligencia tal como está hoy (narra la inversión en texto) |
| Inversión y costo por consulta **si es plata del cliente** → decisión Q-08 | Notas internas, scoring y cualquier juicio comercial |

## Qué falta técnicamente (lo mínimo, en orden)

1. **Alcance por workspace en la lectura**: un endpoint público (con token) que devuelva solo el overview y las consultas de
   ese workspace, sin tocar las rutas internas de `/api/growth`.
2. **Acceso a nivel empresa**: hoy `work_client_access` es **por proyecto** y con unique `(project_id, company_contact_id)`.
   Para "resultados del cliente" hace falta un acceso por empresa o por workspace.
3. **Registro de qué vio y cuándo** (`lastUsedAt` existe; conviene audit por sección, como el revelado del Playbook).
4. **Onboarding del espacio**: al dar de alta un cliente con campañas, crear el workspace, sus campañas y sus landings, y
   entregar el snippet listo para su sitio o su GTM (UC-019 del documento maestro).
5. **Aviso al cliente** cuando entra una consulta, si se decide que lo tenga (hoy el aviso `lead.new` es interno y en
   workspaces de cliente no se manda).

## Lo que hay que decidir con Santiago

- **Q-08 · ¿Se le muestra la inversión?** Es su plata, pero también deja ver nuestro fee y el costo por consulta.
- **Q-09 · ¿El espacio es parte del servicio o se cobra?** Cambia si se construye como argumento de venta (incluido en el
  fee mensual) o como producto aparte.
- **¿Acceso por empresa o por proyecto?** De eso depende el punto 2 de arriba.
- **¿Quiénes del cliente entran?** Uno por empresa, o varios con enlaces distintos (como ya pasa con el feedback).

Las fichas correspondientes están en el cap. [05_backlog.md](05_backlog.md): **E-04** (espacio del cliente sobre Growth),
**E-05** (acceso reusando `work_client_access`), **E-06** (onboarding del workspace), **Q-08** y **Q-09**.
