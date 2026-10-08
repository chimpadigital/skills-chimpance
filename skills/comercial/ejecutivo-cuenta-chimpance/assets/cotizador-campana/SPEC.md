# Cotizador de Campaña (Modelo 4) — comparador de planes + calculadora con ticket

> **Origen:** propuesta MT AGRO (agosto 2026, Google Ads + Web One Page + CRM). Formato nacido de iterar
> con Santiago: la Propuesta Viva le resultó confusa para servicios mensuales, y pidió un pricing table
> estilo Hostinger. El resultado mezcla ambos: comparador estático + calculadora amigable.
> Ejemplo canónico (clonable): `ejemplo-mtagro.html` (en esta misma carpeta).

## Qué es

Una página HTML autocontenida (sin build, solo la fuente de Google y DolarAPI como externos) para cotizar
**servicios mensuales con niveles** (típicamente paid media: Google Ads, Meta Ads) que pueden combinarse con
**un ítem de pago único** (web, landing, CRM, setup). El cliente compara niveles a la vista y arma su
combinación en una calculadora que le muestra **cuánto paga por mes, con la pauta incluida**.

## Cuándo usar este formato (y cuándo no)

**Usarlo cuando:**
- El servicio principal es **mensual/recurrente con 2-3 niveles** (planes de pauta, planes de social media).
- Hay que separar con claridad **honorarios vs. inversión publicitaria** (el cliente confunde los dos).
- El decisor es **no técnico / persona de campo**: necesita comparar de un vistazo y saber el número final por mes.
- Hay un ítem one-time opcional (web/landing/CRM) que se puede financiar en cuotas.

**NO usarlo cuando:**
- El proyecto es un **producto único con precio cerrado** (web, plataforma, branding+web) → usar **Propuesta Viva** (Modelo 3).
- Es un configurador de módulos múltiples estilo social media + agregados → usar **Modelo 2** (INDES).

## La estructura, en 7 bloques (orden fijo)

1. **Gancho narrativo** — UNA placa breve (no full-screen): frase concreta sobre el lead que se está
   perdiendo, con la keyword real entre comillas. Patrón validado:
   *"Ahora mismo, alguien en Córdoba está buscando 'sistema de riego por goteo' en Google."* (gris) →
   *"Esa consulta puede llegarle a [Cliente] — o a la competencia."* (lima).
   ⚠️ Feedback de Santiago: el gancho se enfoca en **el lead concreto**, no en "estar presente en Google".
2. **Encabezado** — título del servicio + lead de 2-3 líneas + **badge de alcance** (ej. "📍 Segmentación
   exclusiva: ciudad de Córdoba"). Si los ítems se cotizan por separado, decirlo acá.
3. **Franja de logos** — referentes del sector como prueba social. Si no hay archivos de logo reales,
   badges de texto como placeholder (y avisar a Santiago que falta confirmarlos).
4. **Mapa del flujo** — 5 pasos con flechas (grid horizontal, cards con número en círculo celeste, el paso
   final destacado en lima): búsqueda → anuncio → web → WhatsApp → CRM. En mobile se apila con "↓".
5. **Ítem one-time** (si existe) — card propia ANTES de los niveles: nombre, precio grande alineado a la
   izquierda (mismo patrón que las cards de nivel: `price-num` + `price-iva` debajo — NUNCA un flex
   space-between que al envolverse deja el precio flotando), checklist, CTA propio, adicionales como nota.
6. **Pricing table de niveles** — 3 cards lado a lado estilo Hostinger: nombre, descripción de 1 línea,
   precio mensual grande + IVA, caja de pauta aparte, botón CTA propio, checklist ✓/– . La del medio
   `featured` (borde lima + badge "★ Recomendado" + botón primario).
7. **Calculadora "¿Cuánto pagan por mes?"** — el corazón del formato (ver abajo) + Qué NO incluye +
   garantía/autonomía + próximos pasos en una línea + firma.

## La calculadora (el diferencial del formato)

Dos columnas dentro de una card con borde lima:

**Izquierda — 4 preguntas numeradas** (círculos celestes como el mapa del flujo, lenguaje llano):
1. *¿Qué nivel de campaña eligen?* → **filas apiladas tipo radio** (NO segmented control apretado), cada una
   con nombre + cobertura y debajo `Pauta a Google: $X/mes · Gestión Chimpancé: USD Y/mes`.
   ⚠️ Gotcha validado: si el botón muestra solo la pauta, **parece el precio del plan** ("pareciera que el
   Esencial vale $600.000"). Siempre etiquetar ambos montos por separado.
2. *¿Suman [el ítem one-time]?* → check-row: "Sí, quiero la web — USD 850, en 6 cuotas de USD 142".
3. *¿[Adicionales]?* → stepper −/+. Reglas de coherencia: destildar el ítem base resetea los adicionales;
   sumar un adicional activa el ítem base.
4. *¿Cómo prefieren pagar?* → "Mes a mes (6 cuotas sin interés)" / "Todo junto al inicio (X% de descuento)".
   Numerarla como paso: si queda como control suelto abajo, se pierde.

**Derecha — ticket "ASÍ QUEDA LA CUENTA"** (borde lima, header en lima, separadores punteados tipo recibo):
- Modo mensual: caption *"Cada mes, durante N meses, pagan en total:"* → **total grande en ARS** →
  nota *"después del mes N la web ya está paga"* → "ESE NÚMERO INCLUYE" con líneas: ítem en cuotas /
  trabajo de Chimpancé / pauta directo a Google. ARS primero grande, USD chiquito de referencia.
- Modo contado: *"Un solo pago al inicio, con X% de descuento:"* → **USD grande** → badge "Se ahorran
  USD Z" → "Y DESPUÉS, MES A MES" → solo la pauta.
- El descuento contado aplica sobre honorarios + ítem one-time; **la pauta nunca lleva descuento** (va
  directo a Google) — decirlo en la nota al pie.

## Reglas duras (heredadas del skill + validadas acá)

- **Precios SIEMPRE + IVA (21%), no incluido** — en cards, ticket y nota al pie.
- **Pauta ≠ honorarios, siempre separados y etiquetados.** La pauta la abona el cliente directo a Google
  (factura A de Google), nunca pasa por Chimpancé.
- **Pocos números en las cards.** Sin totales a 6 meses en las cards de nivel ("son muchos números") —
  el número final vive SOLO en la calculadora.
- **Theme Digitaal**: dark #0A0A0A / #121310, lima #D9F45F solo acción/CTA, celeste #36A9E1 identidad
  (números de paso, badges informativos), Plus Jakarta Sans, grano global SVG.
- **CTAs → WhatsApp** (5493516503470) con el ítem/nivel ya mencionado en el mensaje precargado.
- **Dólar blue venta en vivo** vía `https://dolarapi.com/v1/dolares/blue` con fallback editable
  (`COTIZACION`). Marketing se cotiza a blue venta (no oficial).
- Checklist de cada nivel: solo va en "–" (apagado) lo que de verdad NO tiene ese nivel. Lo que sí tiene,
  aunque sea limitado ("Cobertura: 1 producto"), va con ✓.

## CONFIG del JS (todo en un solo objeto arriba del script)

```js
var TIERS = {
  esencial:    {label:'Esencial',    ads:600000,  fee:450},   // ads en ARS, fee en USD
  recomendado: {label:'Recomendado', ads:900000,  fee:550},
  premium:     {label:'Premium',     ads:1200000, fee:650}
};
var WEB = 850;            // ítem one-time (USD)
var PAGE_EXTRA = 400;     // adicional por unidad (USD)
var MESES = 6;            // duración del contrato = cuotas del one-time
var CONTADO_OFF = 0.20;   // descuento pago total al inicio
var COTIZACION = 1525;    // fallback dólar blue venta
```

## Empaquetado

Igual que la Propuesta Viva: carpeta con `index.html` + `.replit` (static, publicDir ".", python http.server
8000→80) + `README.md`, y un `.zip` para Import from ZIP en Replit → Run → Deploy → Static.

## Checklist de customización para un cliente nuevo

1. Cotizá primero con las reglas del skill (catálogo, costos, markup). El formato no cambia cómo se cotiza.
2. Cloná `ejemplo-mtagro.html` → `index.html` y ajustá el CONFIG del JS.
3. Gancho: reescribí la búsqueda real del rubro (keyword entre comillas) + el "o a la competencia".
4. Badge de alcance geográfico si aplica; franja de logos (pedí los archivos reales a Santiago).
5. Mapa del flujo: ajustá los 5 pasos al canal de conversión del cliente (WhatsApp/formulario/llamada).
6. Ítem one-time: nombre, precio, cuota (precio/MESES redondeado), qué incluye, qué no (hosting/dominio).
7. Cards de nivel: cobertura real por nivel, pauta y fee por nivel, mensajes de WhatsApp por nivel.
8. Preguntá a Santiago: cantidad de cuotas (= MESES) y % contado. **No los inventes.**
9. Verificá en el navegador: click en cada nivel, toggle mensual/contado, stepper, reglas de coherencia
   del one-time, y que los CTA abran WhatsApp con el texto correcto.
10. **Medirlo** (desde 17/9/2026): mismas reglas que la Propuesta Viva (`../propuesta-viva/SPEC.md` › Medición). Acá la
    calculadora va dentro de `data-chimp-quote`, cada nivel con `data-chimp-option="nivel-1|nivel-2|nivel-3"` +
    `aria-pressed`, el toggle con `data-mode="mensual|contado"` y el total con `data-chimp-total`. Registrar el cotizador en
    el ERP (lead › Propuestas) y pegar su código antes de `</body>`.
