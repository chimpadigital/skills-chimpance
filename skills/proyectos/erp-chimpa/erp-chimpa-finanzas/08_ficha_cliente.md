# 08 · Ficha del cliente: Playbook (docs + accesos) y Soporte por horas (8/9/2026)

> **Nota 12/9/2026:** ya no hay ambiente local. Donde este capítulo diga "local :5001", `erp-local` o `admin/admin1234`, leerlo como historia: hoy se prueba en https://dev-finanzas.chimpance.digital (ver cap. 01).

Reemplaza dos cosas que vivían fuera del ERP: la documentación/contraseñas de cada cliente (hosting, dominio, Google
Workspace, etc.) desperdigadas, y el Excel donde se sumaban las horas de soporte consumidas por cliente.

## Dónde vive en la pantalla

| Lugar | Qué hay |
|---|---|
| **Empresas** (`/empresas`) | la lista ahora muestra el logo y cada fila abre la ficha |
| **Ficha del cliente** (`/empresas/:id`) | logo (subir/quitar, drag&drop), datos + "Editar datos", tabs **Playbook** (default) · **Soporte** · **Contactos** · **Proyectos** |
| **Soporte por horas** (`/soporte`, sidebar › Comercial) | tarjetas por plan con logo del cliente, barra de progreso del mes, "Cargar horas"; selector de mes; 4 KPIs; toggle inactivos/vencidos; "Nuevo plan" |
| **Detalle del plan** (`/soporte/:id`) | período vigente grande (incluidas/arrastre/disponibles/consumidas/saldo, excedente valorizado si hay valor hora), historial mes a mes, registros con anular (motivo), editar plan, desactivar/reactivar |

Guías de onboarding: `/soporte` y `/empresas/:id` (useOnboarding normaliza `/empresas/N` y `/soporte/N`).

## "¿De dónde vino?" — la fuente de la empresa (21/9/2026)

El formulario de empresa (alta y edición, `CompanyFormDialog`) tiene **"¿De dónde vino?"**, debajo de *Relación*:
opcional, pero a la vista (no en "Más datos"). Sale del **mismo catálogo que los leads del CRM y las campañas de
Growth** (`acquisition_sources`, ABM en Admin › Catálogos › Fuentes), no de una lista aparte: esa es la gracia, porque
permite cruzar el canal con lo que la empresa terminó facturando. Se puede crear una fuente nueva desde el mismo
desplegable. Columna: `companies.acquisition_source_id` (migración **0035**, FK nullable).

**"¿Quién nos la refirió?" (21/9/2026):** si la fuente elegida es de tipo Referido (`isReferralSourceName`: "Referido",
"Recomendación", "Boca a boca"…), debajo aparece el mismo buscador del lead (`ReferrerPicker`: personas y empresas de
Empresas y del CRM; lo que se agrega ahí nace en el CRM). Se guarda en los MISMOS cinco campos que el lead, uno solo a
la vez (`referral_contact_id` / `referral_company_id` / `referral_crm_contact_id` / `referral_account_id` /
`referral_name_text`, migración **0040**), así el referidor es el mismo dato de los dos lados. Si la fuente deja de ser
Referido, el referidor se borra en el guardado. Al ganar un lead referido, la empresa hereda la fuente **y** el referidor.

En la **ficha** se lee arriba, junto a los datos: "Vino de <fuente> · la trajo <referidor>", o "Sin fuente cargada · se carga en «Editar
datos»" cuando falta, para que se note que hay algo para completar (los clientes viejos se cargan a mano).

Las empresas que nacen del CRM al **ganar la oportunidad** heredan la fuente del lead
(`crm/accounts/account.service › promoteForOpportunity`). Sin eso, todo lo que entra por el CRM nacía sin canal.

> Ojo `CreatableSelect` (21/9/2026): crear una opción nueva y elegirla en el acto **perdía el valor en silencio** —el
> desplegable todavía no tenía esa opción y la descartaba, así que se guardaba vacío—. Ahora `onSuccess` espera el
> refetch del catálogo y recién ahí selecciona. Vale para todos los que usan ese selector (leads, proyectos,
> movimientos). Agregar la opción "optimista" al render NO alcanza: la lista de opciones se arma un paso después.

## Pestaña "Nos trajo" — antes "Referidos" (21/9/2026)

En `/empresas/:id`, la pestaña lista **los leads que ESA empresa nos trajo** (filtra `crm_leads.referral_company_id`
= la empresa de la ficha, más los leads referidos por sus contactos). La dirección siempre estuvo bien, pero el título
decía *"Leads que nos refirió"* y se leía al revés —como si el lead nos hubiera referido a nosotros—. Ahora el nombre
va adentro del título: pestaña **"Nos trajo"**, título **"A quiénes nos trajo <empresa>"**, y el estado vacío también
la nombra (`ReferrerValuePanel` recibe `name`). Regla de copy: cuando una frase puede leerse en las dos direcciones,
meter el sujeto adentro en vez de aclararlo en la bajada.

## Contactos de facturación (17/9/2026)

En la pestaña Contactos, cada contacto puede tener **"Recibe las facturas"** (`company_contacts.receives_invoices`,
migración 0024): se muestra como etiqueta "Facturación" y es el destinatario precargado al enviar una factura por
mail (cap. 09 › Enviar factura por email). Pueden ser varios; un buzón genérico (facturas@cliente) se carga como un
contacto más ("Administración"). Si al enviar se escribe un mail nuevo, el diálogo ofrece guardarlo como contacto de
facturación.

## LinkedIn del contacto (17/9/2026)

Lo mismo que en el lead (skill `crm-growth-chimpa`), en la pestaña Contactos: el formulario del contacto (alta y edición) tiene el
campo **LinkedIn** con el botón **"Traer datos"**. Abre el diálogo compartido `LinkedinProfileDialog`, el servidor lee
la **vista previa pública** del perfil (la misma que se ve al pegar el link en WhatsApp: foto, cargo, empresa,
educación, ubicación), se revisa y al aceptar **vuelve al formulario**: completa lo que está vacío (nombre, apellido,
cargo), nunca pisa lo escrito, y deja la foto lista. Se guarda **todo junto** al guardar el contacto, así también sirve
en el alta, cuando el contacto todavía no existe.

- Columnas (migración 0026, aditiva): `company_contacts.linkedin_url` (siempre normalizado a
  `https://www.linkedin.com/in/<usuario>`), `linkedin_info` (jsonb con lo leído) y `photo_path` (mismo almacenamiento
  que los logos, `uploads/logos/`).
- La **foto se ve** en la tabla de contactos (avatar) y en el formulario, con "Quitar"; al lado del nombre aparece el
  ícono de LinkedIn como link al perfil.
- Borrar el link borra también los datos leídos (`linkedin_info`); la foto solo se va con "Quitar".
- Si LinkedIn no deja ver el perfil sin iniciar sesión, se avisa y se puede **guardar solo el link**.
- Al pasar un lead a cliente (`accounts/account.service.ts`), el contacto se lleva su LinkedIn, sus datos y una copia
  de la foto.
- Una sola implementación para el lead y para el contacto: `shared/linkedin.ts` (normalizar el link, lo usa también el
  navegador), `server/domains/clientes/linkedin.lookup.ts` (leer el perfil y guardar la foto) y
  `client/src/components/LinkedinProfileDialog.tsx` (la pantalla). `LeadLinkedinDialog` quedó como envoltorio.

## Playbook

- Un ítem = **Acceso** (usuario + contraseña), **Enlace** (p. ej. carpeta de Drive: Chimpancé usa Google Workspace, la documentación
  larga vive ahí y acá va el link) o **Nota**. Categorías fijas: hosting, dominio, dns, email, workspace, cms, redes, ads, analytics,
  api, pagos, otro (labels/íconos en `client/src/components/clientes/playbook/playbookMeta.ts`).
- **Categorías propias** (21/9/2026): además de las fijas, el desplegable del diálogo trae "+ Nueva categoría…" → se escribe el
  nombre (máx. 40) y se guarda en `company_playbook_items.category_label` (migración 0037), con `category = "otro"`. Arma su propio
  grupo en el panel (después de las fijas, alfabético) y queda disponible para cualquier cliente: `GET /api/playbook/category-labels`
  lista las ya usadas. Si se escribe una que ya existe con otra ortografía ("facturacion arca"), el server reusa la que estaba.
  Elegir una categoría fija vuelve a dejar `category_label` en NULL.
- **Contraseñas cifradas** con AES-256-GCM (`server/domains/clientes/vault.ts`). Nunca viajan en el listado (`hasSecret: true/false`);
  se piden de a una con `POST /api/playbook/items/:id/reveal`, la UI la muestra 30 s con botón copiar, y queda `audit_log`
  (`company_playbook_item` / `revealed`) + `last_revealed_at`. Crear/editar/borrar también auditan. Borrado = soft (`deleted_at`).
- **Clave de cifrado**: `VAULT_KEY` del entorno; si falta, se deriva de `SESSION_SECRET`; en dev, constante fija (ambos servers
  locales comparten la misma → un dump de la real restaurado en pruebas se lee igual). **En la nube el CTO tiene que poner `VAULT_KEY`
  en el `.env` (32+ caracteres aleatorios) ANTES de cargar accesos, y no cambiarla nunca**: cambiar la clave deja ilegible todo lo
  guardado (error `VALIDATION_VAULT_KEY` al revelar). Si solo hay `SESSION_SECRET`, rotarla rompe lo mismo.
- Roles: admin, operator y **collaborator** llegan a `/api/playbook` (desde el 12/9/2026 el guard del colaborador es
  lista negra y el playbook no está en ella: es justo lo que necesita para trabajar, y cada revelado queda auditado).
  accountant y sales no, sus allowlists no lo incluyen. El colaborador **no ve la tarifa** de los planes de soporte
  (`hourlyRate` se borra de la respuesta) ni puede crear/editar planes, pero sí carga horas.

## Soporte por horas

- **Plan** (`support_plans`): `kind` = `monthly` (X h por mes calendario; `rollover` = arrastrar el saldo POSITIVO al mes siguiente,
  el excedente nunca se arrastra) o `bag` (bolsa de X h totales entre `start_date` y `end_date`, ej. COPA 5 h hasta 31/12).
  `hourly_rate` + `currency` valorizan el excedente ("Excedente a facturar: 2 h × $ 55.000 = $ 110.000 + IVA"). `project_id` opcional.
- **Registros** (`support_hours_entries`): fecha, horas (0 < h ≤ 24), qué se hizo (obligatorio), quién (`user_id`), tarea opcional
  (`task_id`, sin UI todavía). Anulación por VOID con motivo; nunca se borra. Plan inactivo no acepta horas.
- **Matemática pura** en `server/domains/clientes/support.periods.ts` (`computePeriods`, `currentPeriod`, `planStatus`), testeada en
  `tests/supportPeriods.test.ts` (9 tests, sin DB: incluye la bóveda). `status` = active / expired (end_date pasado) / inactive / upcoming.
- "Hoy" y el mes por defecto se calculan en hora Argentina (UTC−3 fijo, `todayAr()`), igual que la pantalla Hoy.

## Logo del cliente

`companies.logo_path` → archivo en `uploads/logos/<uuid>.<ext>` (carpeta gitignoreada, como feedback). `POST /api/companies/:id/logo`
(multipart `file`, PNG/JPG/WebP/SVG sin `<script>`, ≤ 2 MB, firma real validada), `GET` lo sirve (autenticado), `DELETE` lo quita.
El componente `CompanyLogo` (`client/src/components/clientes/CompanyLogo.tsx`) muestra logo o iniciales; `LogoUploader` sube.
**Nube**: los logos son archivos en disco del droplet; el deploy no los toca (igual que los adjuntos de feedback), pero no hay backup
de `uploads/` fuera del servidor.

### Cargar logos sin buscarlos a mano (12/9/2026)

Cuatro caminos además de subir el archivo; todos guardan con el mismo `POST /logo`:

| Camino | Dónde | Cómo |
|---|---|---|
| **Traer de la web** | ficha, debajo del logo (`LogoPreviewDialog`) | `POST /api/companies/:id/logo/lookup {domain?}` busca el ícono y lo devuelve como data URL **sin guardar**; se puede probar otro dominio |
| **Ctrl+V** | ficha (listener en `LogoUploader`) | imagen copiada del portapapeles; si pasa de 512 px o 2 MB se achica a PNG en el navegador. Se ignora si el foco está en un campo o hay un diálogo abierto |
| **Al crear la empresa** (21/9/2026) | alta de empresa, campo "Sitio web" (`CompanyFormDialog`) | 700 ms después de escribir un dominio (o un mail corporativo) busca solo con `POST /api/companies/logo/lookup {website?, email?}` —la misma búsqueda pero **sin empresa creada todavía**, `logoLookupService.lookupDraft`— y muestra la miniatura ("Logo encontrado · Quitar"). Se sube recién con la empresa ya creada, dentro del `mutationFn`; si falla, el alta sigue igual. Si no encuentra nada no avisa nada |
| **Completar logos (N)** | Empresas, arriba (`CompletarLogosDialog`) | recorre clientes activos sin logo (no proveedores), de a 3 búsquedas en paralelo desde el navegador (no un pedido largo), grilla con checkbox; baja resolución queda destildada; reintento por dominio en cada fila |

**De qué dominio busca** (`logo.lookup.ts › pickCompanyDomain`): dominio escrito a mano → `companies.website` → `companies.email` →
mail de un contacto activo, primero el principal, **excluyendo `autoLearned`** (pueden ser de otra agencia). Casillas personales
(`DOMINIOS_PUBLICOS` de `emailFunnel.ts` + ISPs argentinos) no prestan dominio.

**Qué ícono elige** (`logo.fetch.ts › findLogoForDomain`): lee la home (https → www → http), ordena `apple-touch-icon`, `icon` con
`sizes`, SVG, `msapplication-TileImage`, prueba `/apple-touch-icon.png` aunque no esté declarado, y al final el favicon de Google
(`s2/favicons?sz=256`). Corta en el primero ≥ 120 px (SVG gana siempre); descarta < 32 px; marca `lowRes` < 64 px. No usa `.ico`
(no es formato de logo admitido) ni `og:image` (suele ser un banner). Sitios que solo tienen `favicon.ico` de 16 px (p. ej. Banco
Provincia) dan "No encontramos un logo" → Ctrl+V.

**Resguardos de red (SSRF)**: solo http/https en 80/443, sin credenciales en la URL; la IP se valida **al conectar** con un `lookup`
propio (bloquea loopback, privadas, link-local, CGNAT, multicast, IPv6 ULA/link-local y mapeadas), así no pasa ni con DNS rebinding;
máx. 4 redirecciones revalidadas, 5 s por pedido, HTML ≤ 1,5 MB, imagen ≤ 2 MB y la imagen pasa por `sniffLogo` (mismo filtro que
la subida, SVG sin `<script>`). Tests de la lógica pura: `tests/logoLookup.test.ts`. El servidor necesita salida a internet.

## API (`server/domains/clientes/clientes.routes.ts`, montado en `/api`, respuesta `{ok,data}`)

- Logo: `GET|POST|DELETE /api/companies/:id/logo` · `POST /api/companies/:id/logo/lookup` (busca en la web, no guarda).
- LinkedIn del contacto: `POST /api/company-contacts/linkedin/lookup` `{url}` (vista previa, no guarda ni necesita
  contacto creado) · `GET|POST|DELETE /api/company-contacts/:id/photo` (`POST {dataUrl}` guarda la foto aprobada).
  El link y los datos (`linkedinUrl`, `linkedinInfo`) viajan en el alta/edición normal del contacto.
- Playbook: `GET|POST /api/playbook/companies/:id/items` · `PATCH|DELETE /api/playbook/items/:id` · `POST /api/playbook/items/:id/reveal`.
  En PATCH, `secret` undefined = no tocar, `""` = borrar, texto = reemplazar.
- Soporte: `GET /api/support/summary?month=YYYY-MM&includeInactive=1` (tarjetas + totals) · `GET|POST /api/support/plans` ·
  `GET /api/support/plans/:id?month=` (período, `periods` historial, `entries`) · `PATCH /api/support/plans/:id` (incl. `active`) ·
  `POST /api/support/plans/:id/entries` · `POST /api/support/entries/:id/void` · `GET /api/support/companies/:id`.

## Mapa del código

| Qué | Dónde |
|---|---|
| Schema | `shared/schema.ts` › `companies.logoPath`, enums `playbook_item_type` / `playbook_category` / `support_plan_kind`, tablas `company_playbook_items`, `support_plans`, `support_hours_entries` |
| SQL manual / migración | `scripts/sql/2026-09-08_playbook_soporte.sql` · `migrations/0003_ficha_cliente_playbook_soporte.sql` |
| Server | `server/domains/clientes/` (`vault.ts`, `playbook.service.ts`, `support.periods.ts`, `support.service.ts`, `logo.service.ts`, `logo.lookup.ts` (pura), `logo.fetch.ts` (red), `linkedin.lookup.ts` (perfil público), `contactLinkedin.service.ts` (foto del contacto), `clientes.routes.ts`) · normalización del link en `shared/linkedin.ts` · contactos en `server/services/companies.ts` |
| UI | `client/src/pages/EmpresaDetalle.tsx`, `Soporte.tsx`, `SoportePlanDetalle.tsx` · `client/src/components/clientes/` (`CompanyLogo`, `LogoUploader`, `LogoPreviewDialog`, `CompletarLogosDialog`, `logoApi.ts`, `playbook/`, `support/`) · `client/src/components/LinkedinProfileDialog.tsx` (compartido con el lead) |

## Qué falta (ideas, ninguna acordada todavía)

- Vista del cliente: enlace público (tipo review link) para que el cliente vea sus horas consumidas del mes.
- Vincular registros de soporte con tareas del Módulo Trabajo (el campo `task_id` ya existe) o generar la obligación AR del excedente.
- Aviso automático (campana / WhatsApp) cuando un plan pasa el 80 % o se excede.
- Importar el Excel histórico de horas (a pedido, con el archivo).
- Adjuntar archivos al playbook (hoy: enlaces a Drive).

## Checklist de prueba para Santiago (local :5001 o dev-finanzas)

1. Empresas › abrir una empresa cliente › subir el logo (PNG) › ver que aparece en la lista y en Soporte.
2. Ficha › Playbook › Agregar acceso "Hosting" con contraseña › Revelar (30 s) › copiar › editar sin tocar la contraseña › ver que sigue.
3. Soporte por horas › Nuevo plan (mensual 10 h con arrastre, o bolsa) › Cargar horas desde la tarjeta › abrir el detalle › anular un registro.
4. Cambiar de mes con las flechas y mirar el historial mes a mes.
