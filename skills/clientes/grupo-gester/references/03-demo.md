# 03 · Demo

Carpeta `demo/`. **Front puro, sin servidor ni base**: HTML + CSS + JS sin framework ni build. Los datos viven en el `localStorage` del navegador (clave `gester_ecosistema_v2`). Sirve para vender y para validar flujos; no es la base del sistema real (ver [06](06-plan-sistema-real.md)).

## Cómo correrla

```bash
python tools/serve-nocache.py 8010 demo
```

Abrir http://localhost:8010 (web pública) o http://localhost:8010/login.html (acceso). El servidor manda sin caché para ver siempre la última versión. En Claude Code hay una configuración `demo-gester` en `.claude/launch.json` (`preview_start {name: "demo-gester"}`).

Para empezar de cero: menú de cuenta → restablecer datos, o borrar `localStorage` del sitio.

## Perfiles (contraseña de todos: `gester`)

| Perfil | Usuario | Qué ve |
|---|---|---|
| Gester (admin) | Alexis Maffini · alexis@grupogester.com.ar | Todo: ventas, postventa y configuración |
| Inmobiliaria | Paula Ríos · paula@redexpande.com.ar (Red Expande) | 3 proyectos, descuento máx. 3%, puede pedir reserva |
| Inmobiliaria limitada | Martín Sosa · martin@inmonorte.com.ar (Inmobiliaria Norte, ficticia) | Solo Caseros 933, sin descuento, sin reserva |
| Propietaria | Martina Olmos · martina.olmos@gmail.com | 3°B y 5°F de Torre Renencia |

El login tiene los 4 perfiles a un clic. El menú de cuenta permite cambiar de perfil.

## Páginas

| Archivo | Qué es |
|---|---|
| `index.html` | Web pública de Caseros 933: hero, stats vivos, selector de pisos, hoy vs. proyecto, tour RealSee, mapa |
| `unidades.html` | Grilla de unidades con filtros (`?piso=` prefiltra) |
| `unidad.html?u=3B` | Ficha de unidad: tour, plano, **simulador** y formulario de consulta con la unidad precargada |
| `consultas.html` | Redirección vieja a `login.html` |
| `login.html` | Ingreso con email + contraseña y perfiles a un clic |
| `app.html` | Aplicación interna (SPA por `#hash`) para Gester, inmobiliarias y propietarios |
| `cotizacion.html` | Cotización imprimible / PDF |

## JavaScript

| Archivo | Qué hace |
|---|---|
| `js/engine.js` | **Motor de financiación** (réplica del Excel). Ver [04](04-motor-financiacion.md) |
| `js/store.js` | Datos semilla + persistencia + lecturas/escrituras. Es el **modelo de datos de facto** |
| `js/data.js` | Datos y piezas de la web pública (header, footer, `WHATSAPP` placeholder) |
| `js/app.js` | Back office y portal de inmobiliarias: navegación (`NAV`), inicio, unidades, cotizador, cotizaciones, consultas, proyectos, inmobiliarias, historial |
| `js/postventa.js` | Módulo `PV`: portal del propietario y postventa de Gester |
| `js/renencia-data.js` | `RENENCIA_UNIDADES`: las 70 unidades reales de Torre Renencia |
| `js/ui.js` | Componentes propios: modales, popovers, toasts, íconos |
| `css/styles.css` / `css/app.css` | Web pública / aplicación interna |

## Rutas de `app.html` y quién las ve

`G` = Gester, `I` = inmobiliaria, `O` = propietario (owner).

| Ruta | Pantalla | Perfiles |
|---|---|---|
| `#inicio` | Inicio / Mi departamento | G I O |
| `#cotizar` | Nueva cotización | G I |
| `#cotizaciones` | Cotizaciones / Mis cotizaciones | G I |
| `#unidades` | Unidades y precios (planilla + vista edificio) | G I |
| `#consultas` | Consultas web (CRM) | G |
| `#edificios` | Edificios entregados | G |
| `#propietarios` | Propietarios | G |
| `#documentacion` | Documentación | G |
| `#reclamos` | Reclamos / Mis reclamos | G O |
| `#planos` | Planos e instalaciones | O |
| `#documentos` | Documentos y manuales | O |
| `#guias` | Guías paso a paso | O |
| `#proyectos` | Proyectos y reglas | G |
| `#inmobiliarias` | Inmobiliarias y permisos | G |
| `#historial` | Historial de cambios | G |

## Datos semilla

- 3 proyectos (`caseros`, `stock`, `privato`), **79 unidades** (30 + 14 + 35).
- 3 inmobiliarias (Gester interna, Red Expande, Norte), 3 usuarios de ventas + 43 propietarios generados.
- 5 cotizaciones de ejemplo, 3 consultas, 6 reclamos, 2 comunicados, 7 documentos.
- Los **ajustes** de las unidades de stock son las cuentas que estaban escondidas en las fórmulas del Excel.

## Lo que la demo simula y el sistema real tiene que hacer de verdad

- Login (no hay seguridad: todo está en el navegador).
- Persistencia compartida entre usuarios (cada navegador tiene su copia).
- Envío de emails de invitación y avisos.
- Subida de archivos (las fotos de reclamos se guardan como base64 reducido).
- PDF (hoy se imprime desde el navegador).
- Pase automático a postventa: hoy solo para Renencia.

## Publicación

- https://grupogester.manada.me está en **Vercel**, subida como sitio estático (no en Replit).
- Para enlazarla al repo: en Vercel, importar este repo con **Root Directory = `demo`**, sin build. Después cada push a `main` la actualiza sola. El dominio `*.manada.me` está en Cloudflare con la nube **gris** (skill `git-deploy`, caps. 04 y 05).
- Antes de publicar, confirmar con Santiago qué datos reales pueden quedar en una URL pública.

## Pendientes de la demo

- Reemplazar las 30 unidades inventadas por las 45 reales de Caseros 933 cuando lleguen.
- WhatsApp real de Gester en `js/data.js`.
- Renders del proyecto terminado para el bloque "Proyecto".
- Deep-link del tour RealSee a unidades específicas (validar con la cuenta RealSee).
- Solo 3°B y 5°F tienen planos en imagen (por peso). El resto de los planos reales está en `cliente/docs-propietarios/`.
