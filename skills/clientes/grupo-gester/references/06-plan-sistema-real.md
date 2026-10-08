# 06 · Plan del sistema real

**Se arranca solo con la propuesta aprobada y OK de Santiago.** Hasta entonces, esto es el plan para no empezar de cero el día que cierre.

## Principio

La demo es la **especificación funcional** (flujos, pantallas, reglas, textos), no la base de código. El sistema real se construye nuevo en el stack prometido, y se valida contra la demo pantalla por pantalla.

## Stack (prometido en la propuesta)

- **Next.js (App Router) + React + TypeScript**.
- **PostgreSQL** con ORM y **migraciones versionadas** (nunca cambios de esquema a mano).
- Autenticación con usuario y contraseña, sesiones seguras, permisos por perfil en el servidor (nunca solo en el front).
- Almacenamiento de archivos (planos, documentos, fotos de reclamos) en un bucket.
- Emails transaccionales (invitaciones, avisos) por un servicio de terceros.
- PDF de cotización generado en el servidor.
- Todo a nombre de Gester: repositorio, servidor, dominio y servicios.

## Modelo de datos (sale de `demo/js/store.js`)

| Tabla | Campos clave |
|---|---|
| `proyectos` | nombre, subtítulo, público (sí/no), método (`lista`/`total`), tasa anual, anticipo def/mín, cuotas def/máx, comisión, redondeos, carga (`base`/`final`), validez |
| `unidades` | proyecto, código, nombre, piso, letra, tipología, ambientes, m² (propia/balcón/patio), precio base, estado (`disponible`/`reservada`/`vendida`), fechas de reserva/venta |
| `ajustes_precio` | unidad, tipo (`pct`/`monto`), valor, motivo, fecha, usuario. **Solo se agregan, nunca se editan** (historial) |
| `inmobiliarias` | nombre, interna (sí/no), permisos: proyectos habilitados, descuento máx., salir de límites, pedir reserva, ver todas |
| `usuarios` | nombre, email, rol (`gester`/`inmobiliaria`/`propietario`), inmobiliaria, cargo, estado de acceso |
| `cotizaciones` | número `GG-AAAA-NNNN`, unidad, usuario, inmobiliaria, cliente (nombre, DNI/CUIT, tel), opciones, **copia congelada** de precio, reglas y resultado, vencimiento, estado |
| `cotizacion_eventos` | cotización, fecha, texto (emitida, enviada, reserva pedida, confirmada…) |
| `consultas` | proyecto, unidad, nombre, WhatsApp, interés, plan simulado, estado (`nueva`/`contactada`/`cotizada`) |
| `historial` | fecha, usuario, texto: todo cambio relevante |
| `edificios` | nombre, dirección, fecha de entrega, meses de garantía, imagen, contactos |
| `unidades_postventa` | edificio, unidad, tipología, sup. cubierta/total, % expensas, expensas estimadas, propietario(s) |
| `documentos` | edificio, título, categoría, archivo, tipo, alcance (`edificio`/`tipologia`/`unidad`), guía asociada |
| `reclamos` | número `R-NNNN`, unidad, propietario, categoría, subcategoría, ambiente, descripción, fotos, franja horaria, estado (`recibido`/`revision`/`visita`/`resuelto`), derivado a, valoración |
| `reclamo_eventos` | reclamo, fecha, autor, texto, tipo (`estado`/`msg`) |
| `comunicados` | edificio, fecha, autor, título, texto |

Decisión a tomar al diseñar: si `unidades` y `unidades_postventa` son la misma tabla (recomendado: **una sola unidad** que cambia de etapa, así el "pase automático a postventa" es un cambio de estado y no una copia).

## Orden de trabajo sugerido

**Entrega 1 · ventas (6 semanas)**
1. Base: repo, esquema, migraciones, auth, roles y permisos, semilla con los datos de la demo.
2. Motor de financiación portado a TypeScript **con los valores de control de [04](04-motor-financiacion.md) como tests**.
3. Back office: proyectos y reglas → planilla de unidades con ajustes e historial → vista edificio.
4. Web pública: portada multiproyecto → sala por proyecto → ficha con simulador → consulta.
5. Portal de inmobiliarias: unidades del día → cotizador → PDF → mis cotizaciones → pedido de reserva.
6. Back office: cotizaciones y reservas, CRM de consultas, inicio con pendientes, buscador.
7. QA de punta a punta con los 3 perfiles de ventas, capacitación, publicación.

**Entrega 2 · postventa (6 semanas)**
1. Edificios, propietarios e invitaciones por email.
2. Pase automático: unidad vendida → postventa + invitación al comprador.
3. Documentación con visibilidad por edificio/tipología/unidad.
4. Portal del propietario: mi departamento, planos, documentos, guías.
5. Reclamos con fotos, derivación automática, conversación, visitas; comunicados.
6. QA con perfil propietario, capacitación, publicación.

## Calidad

- Antes de decir "listo": tests del motor en verde, recorrido completo con cada perfil y verificación en celular (skill `qa-chimpa`).
- Permisos probados del lado del servidor: una inmobiliaria no puede ver proyectos no habilitados ni pasarse de sus límites aunque manipule la petición.
- UX "No me hagas pensar" (skill `ux-chimpa`): la demo ya resolvió muchas decisiones de interfaz; respetarlas salvo motivo claro.

## Preguntas abiertas para el arranque

- ¿Dónde se aloja? (Vercel + Postgres administrado, o servidor propio: lo decide el equipo técnico con Santiago, a nombre de Gester.)
- ¿Una unidad puede tener varios propietarios? (La demo asigna uno por unidad, con propietarios de varias unidades.)
- ¿La reserva bloquea la unidad automáticamente o la confirma Gester? (La demo: la inmobiliaria pide, Gester confirma.)
- ¿Qué se muestra públicamente de cada proyecto? (Hoy `publico: true` solo en Caseros.)
