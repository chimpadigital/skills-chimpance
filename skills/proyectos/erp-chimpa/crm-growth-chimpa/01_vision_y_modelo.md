# 01 · La visión y el modelo inteligente

> Destilado del documento maestro `CRM/chimpance_growth_intelligence_os_documento_maestro_estrategico_v1.md` (63 KB, 30 capítulos)
> más las decisiones que Santiago fue tomando al construirlo dentro del ERP (sep 2026). Si algo de acá contradice al
> documento maestro, mandan las decisiones tomadas: el documento es la ambición, el ERP es la realidad.

## 1. La hipótesis estratégica

> **El CRM + Growth del ERP es el corazón de adquisición, desarrollo y evolución de clientes: una infraestructura de datos
> e inteligencia que conecta marketing, experimentación, ventas, revenue, retención y aprendizaje para hacer crecer una
> empresa de forma más rentable.**

Primero para Chimpancé. Después, el mismo motor conectado a cada cliente (MT Agro vendiendo pivotes, una veterinaria
generando turnos, OG generando consultas B2B), cada uno con su workspace. Por eso es **multi-cliente desde el día uno**,
aunque hoy el único workspace `internal` sea Chimpancé.

**Lo que NO es** (y conviene repetirlo cuando aparece la tentación de agregar features): no es otro CRM, ni otro
administrador de campañas, ni otro dashboard, ni otro Clay, ni otro HubSpot. Toma principios de todos ellos y los conecta
alrededor de un solo objetivo: **crecimiento rentable**.

## 2. El recorrido completo que hay que poder medir

```
AUDIENCIA → ANUNCIO/CANAL → VISITA → INTENCIÓN → IDENTIDAD → EXPERIENCIA/LANDING → LEAD
→ INVESTIGACIÓN → CALIFICACIÓN → OPORTUNIDAD → REUNIÓN → PROPUESTA → VENTA
→ REVENUE/MARGEN → RETENCIÓN → RECURRENCIA/CROSS-SELL → APRENDIZAJE → MEJOR AUDIENCIA/OFERTA/CAMPAÑA
```

Cada eslabón roto es un lugar donde el sistema deja de aprender. Antes de proponer una función nueva, ubicarla en esta
cadena y preguntarse **qué eslabón mejora**; si no mejora ninguno, probablemente sea un tablero más.

## 3. Los tres problemas que justifican el sistema

1. **Optimización local**: si a Meta o Google se les dice que `FORM_SUBMIT` es éxito, buscan gente propensa a llenar
   formularios, no empresas con capacidad de pago. La señal tiene que subir por la escalera
   `Lead → Qualified Lead → Opportunity → Sale → Revenue → Margin → LTV`.
2. **Dashboards que solo responden "¿qué pasó?"**: hace falta también por qué pasó, qué significa, qué conviene hacer,
   qué aprendimos y si ese aprendizaje se repite.
3. **Conocimiento perdido**: la experiencia comercial vive en personas, chats, reuniones e intuiciones. Cuando una
   campaña termina, el aprendizaje se evapora. El sistema tiene que convertirlo en **conocimiento estructurado**.

## 4. La unidad central: no es el lead

El modelo no puede ser "lead + campaña". Tiene que modelar:

```
PERSONA + EMPRESA/ACCOUNT + OPORTUNIDAD + JOURNEY + REVENUE
```

…conectado con `CAMPAÑA · AUDIENCIA · CREATIVIDAD · LANDING · EXPERIMENTO · VARIANTE`.

Esto es exactamente lo que se implementó el 19/9/2026 con **Personas** (identidad única por mail exacto): la persona es el
DNI, el lead es *una consulta* de esa persona, el contacto de empresa es *una relación*, y la oportunidad es *una venta en
curso*. Ver cap. 03.

## 5. Las cuatro patas del modelo

| Pata | Qué significa | Dónde vive hoy en el ERP |
|---|---|---|
| **Adquirir** | Awareness → tráfico → intención → lead | Growth OS: campañas, landings, snippet, eventos, atribución, A/B, inversión (cap. 02) |
| **Desarrollar** | Lead → calificación → discovery → propuesta → negociación → venta | CRM: leads, oportunidades, pipeline, propuestas medidas (cap. 03) |
| **Evolucionar** | Cliente → retención → satisfacción → cross-sell → upsell → recurrencia → referido | **Casi nada construido.** Hay referidores con su valor, LTV por cliente y soporte por horas; falta todo el resto (cap. 05) |
| **Aprender** | Conecta las tres anteriores y mejora la siguiente vuelta | Embrionario: Chimp Score v1 y el brief de inteligencia por reglas + narración (cap. 02) |

La pata floja hoy es **Evolucionar**, y la que devuelve más plata a corto plazo es cerrar el círculo de **Adquirir**
(devolverle las conversiones reales a Google Ads, que es la campaña que Chimpancé paga hoy).

## 6. Principios rectores (los 11 del documento maestro)

1. **Revenue > leads** — el éxito no es volumen de formularios.
2. **Pedir menos, inferir más** — formulario corto + enriquecimiento + investigación.
3. **Detectar intención antes del formulario** — la visita y el comportamiento también son señales.
4. **First-party data primero** — aprender de información real del negocio, no de proxies.
5. **Closed loop** — `Ads → Lead → Revenue → Ads`.
6. **IA basada en datos** — `datos → evidencia → análisis → recomendación`, nunca opinión genérica.
7. **Explicabilidad** — toda recomendación responde "¿por qué?".
8. **Human in the loop** — `recomendar → aprobar → ejecutar`.
9. **Multi-cliente desde el inicio** — todo dato pertenece a un workspace.
10. **Aprender sin mezclar información sensible** — el conocimiento transversal es anónimo y agregado.
11. **No reinventar commodities** — infraestructura, enriquecimiento, transcripción y APIs se usan; el diferencial se
    construye.

## 7. Los cuatro niveles de inteligencia (y dónde estamos)

| Nivel | Pregunta | Estado |
|---|---|---|
| 1 · Descriptivo | ¿Qué pasó? | **Hecho**: overview del workspace, visitas, consultas, leads, CPL, inversión, ingresos atribuidos |
| 2 · Diagnóstico | ¿Por qué pasó? | **Parcial**: el brief de inteligencia compara períodos y señala campañas/landings mejores y peores, tracking roto, spam |
| 3 · Prescriptivo | ¿Qué conviene hacer? | **Apenas**: "leads prioritarios" por Chimp Score. Falta el Decision Engine (recomendaciones de campaña con aprobación) |
| 4 · Learning | ¿Ese aprendizaje se repite? | **No existe**: nada guarda "esto funcionó" como patrón reutilizable |
| 5 · Predictivo (futuro) | ¿Qué va a pasar? | No está en el alcance cercano |

Al diseñar algo nuevo, decir explícitamente en qué nivel juega. Subir de nivel vale más que agregar otra tabla del nivel 1.

## 8. La métrica norte

El documento propone **Contribution Margin generated per Growth Dollar**, y como aproximaciones prácticas
`Qualified Revenue / Spend` o `Gross Profit / Acquisition Spend`. Debe ser **configurable por modelo de negocio**.

Hoy el ERP puede calcular *ingreso cobrado atribuido / inversión* (ROI del workspace) porque los cobros reales y el gasto
están en la misma base. Lo que falta para la métrica norte de verdad es el **margen por proyecto** (costo real de horas vs.
cobrado) enganchado a la cadena de atribución.

## 9. Qué construir y qué no

**NO construir** (usar lo que existe): infraestructura, almacenamiento, enriquecimiento de datos de terceros,
transcripción, orquestación genérica, administradores de campañas.

**SÍ construir** (el diferencial): el modelo de datos propio, la taxonomía de eventos, el **Chimp Score**, el Signal
Engine, la capa experimento → revenue, el Decision Engine, el Learning Engine, el workspace del cliente, el conocimiento
de crecimiento y los playbooks.

## 10. Mapa de madurez: qué mide hoy el ERP, eslabón por eslabón

| Eslabón | Estado | Detalle |
|---|---|---|
| Audiencia | ❌ | No hay audiencias. Diseñado (Audience Engine, fase 3) y sin construir |
| Anuncio / canal | 🟡 | Campañas con `utm_campaign` + alias e inversión cargada a mano o por CSV; no hay conexión a las APIs de Ads |
| Visita | ✅ | `growth.js` instalado en chimpance.digital desde el 17/9/2026 (verificado 21/9: 71 visitas en 30 días) |
| Intención | 🟡 | Eventos genéricos y profundidad de propuesta. Faltan los eventos "vio un servicio", "vio un caso", "vio precios" |
| Identidad | ✅ | Visitante anónimo → lead por formulario, link `?chl=`, código de persona `?chp=`, pase de visitante a la demo `?chv=` |
| Landing / experiencia | 🟡 | Landings y A/B implementados; sin landings cargadas en producción (Santiago decidió esperar a tener campañas) |
| Lead | ✅ | Formulario, plugin de Gmail, correo, chat, carga a mano, importación; dedupe y atribución primera/última |
| Investigación | 🟡 | Sitio, logo y datos públicos del lead + necesidades sugeridas por IA. Sin enriquecimiento de terceros |
| Calificación | 🟡 | Chimp Score v1 (15 reglas explicables, sin calibrar), estados del lead |
| Oportunidad | ✅ | Pipeline por workspace, etapas, ganar con monto, perder con motivo obligatorio |
| Reunión | ✅ | Coordinar reunión y minuta → tareas (vive en el Módulo Trabajo, skill del ERP) |
| Propuesta | ✅ | Propuestas Vivas medidas (apertura, profundidad, secciones, precios, opción del cotizador) + demos en otro dominio |
| Venta | ✅ | Oportunidad ganada → proyecto |
| Revenue | ✅ | Cobros reales netos de IVA atribuidos a la campaña/fuente |
| Margen | ❌ | Las horas se cargan en el Módulo Trabajo pero no llegan a la lectura de Growth |
| Retención / recurrencia | ❌ | Solo soporte por horas y LTV por cliente en Rentabilidad. Nada de recompra, churn ni cross-sell |
| Aprendizaje | 🟡 | Brief por reglas + narración con IA. Sin memoria de patrones ni playbooks |
| Devolver la señal a los canales | ❌ | `gclid`, `fbclid` y `li_fat_id` se guardan; no se devuelve ninguna conversión |

Leyenda: ✅ funciona · 🟡 parcial · ❌ no existe.

## 11. Los casos de uso del documento maestro que siguen abiertos

De los 40 casos de uso del documento, estos son los que hoy tienen más valor y no están hechos (el detalle operativo, con
lo que haría falta, está en el cap. 05):

- **UC-007 Audience & Conversion Feedback** — la mitad más valiosa a corto plazo: devolverle a Google (que es lo que
  Chimpancé paga hoy) "lead calificado", "venta" y "plata cobrada" usando el `gclid` que ya se guarda.
- **UC-004 Campaign Decision Engine** — recomendaciones de campaña con aprobación humana.
- **UC-026 Daily Growth Brief** — el brief existe pero se pide a mano; falta el barrido diario.
- **UC-028 Lost Opportunity Recovery** y **UC-029 Retention & Cross-Sell** — la pata Evolucionar.
- **UC-040 Growth Memory** / **UC-017 Knowledge Layer** — que el aprendizaje quede guardado como patrón.
- **UC-038 Client Executive Dashboard** / **UC-018 Multi-Client Workspace** — el portal del cliente (rol `client` scoped).

## 12. Cómo se conversa esto con Santiago

- Él decide negocio, el skill decide técnica. Las decisiones de producto se anotan en el cap. 05 con fecha.
- La visión es grande y el ERP es real: **una fase por vez, cada una con valor visible al terminar**, y cada fase con su
  OK antes de arrancar (así se acordó el plan de Personas/Audience/propuestas el 19/9/2026).
- No prometer inteligencia que no tenga datos atrás. Si falta un dato (el margen, los eventos de servicio, los píxeles),
  decirlo primero: es lo que separa un tablero honesto de uno decorativo.
