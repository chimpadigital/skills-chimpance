# 01 · Negocio y cliente

## Quién es Grupo Gester

- Desarrollista inmobiliario de Córdoba que se presenta como **"broker de capitales"**: estructura fideicomisos al costo y vende a inversores.
- Tiene **varios proyectos en simultáneo**, en distintas etapas: preventa, stock terminado y edificios ya entregados.
- Decisor: **Alexis Maffini**. Compra confianza y solidez antes que diseño.
- Comercializa con la inmobiliaria **Red Expande** (y puede sumar otras).
- Manual de marca: Ideah! Diseño+Creatividad, julio 2021.

## Proyectos

| Proyecto | Etapa | Qué hay en la demo |
|---|---|---|
| **Caseros 933** | Preventa. Refuncionalización de un edificio existente, hoy deteriorado. 45 unidades reales, todas por vender | 30 unidades **inventadas** (8 pisos, tipologías A-D + 2 premium). Faltan las reales |
| **Torres Aurum, Renencia, Odogan** | Stock terminado: 14 unidades | Datos **reales** del Excel (superficies, precios, ajustes) |
| **Rivera Privato** | 35 cocheras en el 3er subsuelo | Datos **reales** del Excel (suba general del 20%) |
| **Torre Renencia** (Caseros 881) | Entregada el 4/7/2026, 70 unidades | Postventa con datos **reales**: unidades, % de expensas, documentos, contactos |

Tour 3D del estado actual de Caseros 933 (RealSee, embebible): https://realsee.ai/kzaawrlm. Es un escaneo del edificio **como está hoy**, no un render del proyecto. La narrativa de la demo es **"hoy vs. proyecto"**: el activo existe y se puede recorrer, transparencia que el inversor valora.

## Cómo venden hoy (el dolor)

- Cada proyecto arranca con **su Excel, su landing y sus links sueltos de Drive**.
- Los precios se cambian escribiendo cuentas **dentro de las fórmulas** del Excel (`=182000*0.97`, `=(117400+5000)/1.03`). No queda historial.
- Las cotizaciones se arman a mano en una hoja; el ejemplo de "Juan Pérez" tenía la cuota mal calculada (el financiado quedaba USD 100.000 más barato que el contado).
- No hay estado de unidad ni plazo máximo de financiación en el Excel.
- A los propietarios les mandan documentos por links de Drive que se pierden. No tienen formulario de reclamos.
- **Dolor mayor**: gestión de tareas y operaciones. Hoy usan **Lebane** (SaaS para desarrollistas; en la minuta figura como "Levani"). **No entra en la propuesta**: Santiago lo descartó. Queda para conversar a futuro.

## Lo que pidió Alexis (reunión del 7/9/2026) y cómo se resuelve

| # | Lo que dijo | Solución | Entrega |
|---|---|---|---|
| 1 | "Que la web tome los precios sola" | Un solo lugar de precios | 1 |
| 2 | "Cambio precios unidad por unidad" (y según el mercado) | Ajustes individuales o masivos, con motivo, fecha e historial | 1 |
| 3 | "Que la inmobiliaria juegue con las cuotas" (su tasa, hasta 36 meses) | Simulador con las reglas de cada proyecto | 1 |
| 4 | "Respetar en octubre el precio de agosto" | Cotización en PDF numerada, con precio congelado y vigencia | 1 |
| 5 | "Una general de Gester y cada torre" | Portada general + sala de ventas por edificio | 1 |
| 6 | "No hacer un sistemita por proyecto" | Un proyecto nuevo se carga, no se programa | 1 |
| 7 | "Que el propietario no pierda el Drive" | Portal del propietario | 2 |
| 8 | "No tenemos formulario de reclamos" | Reclamos con fotos, derivación y seguimiento | 2 |

En la reunión se habló de **1 mes de trabajo** y un precio **"entre 3 y 4"** (USD 3.000 a 4.000). La propuesta final superó eso porque el alcance creció (ver [02](02-propuesta.md)).

Ojo: en la minuta quedó "acordado" que la landing tome los precios de un **Google Sheet**. La propuesta vende otra cosa: **un solo lugar de precios dentro del sistema**, que reemplaza el Excel. La integración con Sheets está explícitamente fuera de alcance.

## Decisiones de Santiago

- Un solo ecosistema y un solo acceso (23-24/9).
- Máxima flexibilidad: método de financiación y tipo de carga de precio por proyecto.
- Inmobiliarias con usuario propio y permisos que define Gester.
- La intranet de propietarios vive dentro del mismo sistema.
- Enfoque multiproyecto, nunca "una landing de Caseros" (24/9).
- Reemplazar Lebane: descartado de la propuesta.

## Pendientes con el cliente

- Las **45 unidades reales** de Caseros 933, planos y renders del proyecto terminado.
- **WhatsApp de ventas de Gester** (la demo usa el de Chimpancé como placeholder, en `demo/js/data.js`).
- Validar si la demo publicada puede mostrar datos reales (precios del stock, reglamento firmado, teléfonos de terceros).
- Lista de inmobiliarias que van a tener usuario.
- Reglas de financiación confirmadas por proyecto (tasa, anticipo mínimo, cuotas máximas).
