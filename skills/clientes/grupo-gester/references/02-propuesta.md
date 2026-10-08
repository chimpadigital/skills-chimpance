# 02 · Propuesta

Archivo: `propuesta/index.html` (Propuesta Viva compacta, tema oscuro, autocontenida). Incluye botón de PDF con dos documentos: **presupuesto tipo boleta** (1 hoja, IVA aparte) y **propuesta completa** (alcance, condiciones y firma).

Estado: **enviada, sin respuesta** (al 8/10/2026).

## Precio vigente (OK de Santiago, 29/9/2026)

| Opción | Precio |
|---|---|
| **Las dos entregas** (por defecto) | **USD 4.500 + IVA** · plazo 3 meses |
| Solo Entrega 1 · ventas | USD 3.200 + IVA · 1 mes y medio |
| Solo Entrega 2 · postventa | USD 2.200 + IVA · 1 mes y medio |
| Forma de pago | 6 cuotas sin interés (USD 750/mes) **o** contado −20% (USD 3.600 por las dos) |
| Mantenimiento | USD 180/mes + IVA, después de los 2 meses de garantía |

- Se puede quitar cualquiera de las dos entregas, **nunca las dos**. Por separado suman USD 5.400: juntas ahorran USD 900. En la página, el precio grande, la barra, el WhatsApp y el PDF siguen a lo elegido.
- Todo en **USD + IVA (21%)**, pagadero en pesos al **dólar oficial venta del día de pago**.
- Historia del precio: 24/9 eran dos fases (USD 3.900 + USD 4.900). El 29/9 Santiago lo bajó a "precio de amigo" todo junto. Costo estimado del sistema real ≈ USD 3.100 (tokens, dev que dirige la IA, PM, QA, servidor); la demo costó ~USD 55 en tokens.

## Las dos entregas

**Entrega 1 · Plataforma de ventas (mes 1½)**
- Web de Gester: portada con todos los proyectos, sala de ventas por proyecto (vista por pisos, grilla con estados, filtros), ficha de unidad con simulador, consulta que llega con la unidad y el plan simulado, WhatsApp. Celular y SEO básico.
- Portal de inmobiliarias: usuario por persona, proyectos habilitados por Gester, precios del día, cotizador dentro de las reglas, PDF numerado con precio congelado y vigencia, "Mis cotizaciones" y pedido de reserva.
- Back office de ventas: proyectos y reglas, planilla de precios con ajustes por unidad o masivos (% o monto, con motivo y fecha), estados, vista del edificio, historial, cotizaciones y reservas (confirmar/rechazar), CRM de consultas (nueva, contactada, cotizada), inicio con pendientes, buscador general, usuarios de Gester.

**Entrega 2 · Postventa y propietarios (mes 3)**
- Back office: edificios entregados con estado de acceso de cada propietario, alta e invitación de propietarios, **pase automático** de unidad vendida a postventa, documentación con visibilidad por edificio/tipología/unidad, reclamos con derivación automática, estados, conversación y visitas, comunicados.
- Portal del propietario: mi departamento y garantía, planos conforme a obra y ficha de materiales, documentos y manuales, guías paso a paso, reclamos con fotos, comunicados.

## Tecnología prometida

- Una sola plataforma web, un acceso, cuatro perfiles (público, inmobiliaria, Gester, propietario).
- **Next.js (React) + PostgreSQL**. HTTPS, permisos por perfil. Navegadores actuales, sin app nativa.
- Emails de invitación y avisos por un servicio de terceros.
- Servidor, dominio y servicios de terceros **a nombre de Gester** (estimado USD 30-60/mes, lo paga Gester directo).

## Entrega y garantía (diferencial obligatorio)

- Código fuente completo en un repositorio **a nombre de Gester**, accesos, manual y una capacitación por videollamada en cada entrega.
- **Garantía de 2 meses** desde la publicación de cada entrega.
- Titularidad a nombre de Gester con el pago completo.

## Qué NO incluye

- Carga de proyectos, unidades, precios, planos y documentos (se entrega el panel y se capacita).
- Renders, fotos, videos o textos.
- Integraciones: Google Sheets, Lebane, portales inmobiliarios, facturación.
- CRM avanzado (embudo por etapas, recordatorios, campañas).
- App nativa.
- Costos de servidor, dominio y terceros.

## Condiciones

- Trabajo por etapas con aprobación. Cada entrega se presenta por videollamada; Gester tiene 5 días hábiles para devolver comentarios numerados y por escrito.
- Plazos corren desde que llegan los materiales.
- Cambios fuera de alcance se cotizan y aprueban por escrito.
- Cuotas vencen a los 5 días corridos; mora 0,5% diario.
- Más de 20 días hábiles sin devolución → proyecto concluido, se recotiza para retomar.
- Tribunales de Córdoba.

## Qué necesitamos de Gester para arrancar

Proyectos y unidades con superficies y precios (empezando por Caseros 933), planos y renders, reglas de financiación por proyecto, logo, WhatsApp de ventas, inmobiliarias con usuario, aprobación y primer pago.

## Si hay que tocar la propuesta

- Regla de oro de Chimpancé: primero se discute estructura y precio en texto con Santiago, se espera el OK, y recién después se diseña.
- El bloque de precio nombra lo que se vende, sin "Fase" ni "Inversión".
- Skill relacionado: `ejecutivo-cuenta-chimpance`.
