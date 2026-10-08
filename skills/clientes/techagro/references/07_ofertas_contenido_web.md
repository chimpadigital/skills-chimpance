# 07 — Ofertas, contenido y web de captación TechAgro

## Contenido
1. Escalera de ofertas
2. Recursos descargables por segmento
3. Contenido: pilares, formatos y grilla
4. Web de captación: arquitectura
5. Home: bloques y copy base
6. Landings por segmento
7. Formularios, WhatsApp y medición
8. Requisitos técnicos para el agro
9. Cómo se pasa al design system y al build

---

## 1. Escalera de ofertas

Del contacto frío al cliente, cada escalón con su oferta. El error de 2025 fue saltar de "eBook" a "asesoría" sin escalones intermedios.

| Escalón | Oferta | Qué pide a cambio | Para |
|---|---|---|---|
| 1 · Descubrir | Contenido gratuito (video, nota, carrusel) | Nada | Todos |
| 2 · Útil | Recurso descargable (plantilla, guía, checklist) | Nombre + WhatsApp o mail | Todos, sobre todo C |
| 3 · Diagnosticar solo | **Autodiagnóstico interactivo** (calculadora o test con resultado inmediato) | Nombre + WhatsApp + 3 preguntas de filtro | A y C |
| 4 · Diagnosticar con un experto | **Diagnóstico** Comercial / de Gestión / de Comunicación | 30-40 minutos + datos del negocio | Calificados |
| 5 · Primer paso | Proyecto de entrada acotado (ej.: web con WhatsApp y CRM; módulo de stock de hacienda) | Inversión chica, en cuotas | Clientes |
| 6 · Crecer | Fase 2: plataforma, app, integraciones, fee de campañas | Inversión mayor y recurrencia | Clientes satisfechos |

## 2. Recursos descargables por segmento

**A · Proveedores del agro**
- **Calculadora "¿Cuántas consultas estás perdiendo?"**: consultas por mes × % sin seguimiento × % de cierre × venta promedio = plata en juego por mes. Resultado inmediato + invitación al diagnóstico. *(Recurso estrella de A.)*
- Checklist: "La web de un agronegocio que genera consultas: 12 puntos para revisar hoy".
- Guía: "WhatsApp que vende: cómo ordenar las consultas de una agronomía o un concesionario".
- Plantilla de seguimiento de consultas por vendedor (el paso previo a un CRM).

**C · Empresas agropecuarias**
- **Test "¿Qué tan ordenado está tu campo?"** (10 preguntas → puntaje por área: hacienda, agricultura, personal, números → 3 recomendaciones). *(Recurso estrella de C.)*
- Plantilla de **margen bruto por lote** (soja, maíz, trigo) con instrucciones. Imán de SEO muy fuerte.
- Plantilla de **stock y movimientos de hacienda**.
- Guía (el eBook del plan 2025, con foco): **"Del cuaderno al celular: cómo ordenar los datos del campo sin complicarse"**: por qué fallan los sistemas que nadie usa, qué registrar primero, cómo lograr que carguen el encargado y el personal, cuándo la planilla ya no alcanza. 12-15 páginas, no 40.

**B · Instituciones**
- Checklist: "Comunicación institucional para asociaciones del agro".
- Guía: "Cómo digitalizar socios, cuotas y eventos sin depender de un proveedor".

**Reglas de los recursos**: una página de descarga liviana; se entregan **por WhatsApp y por mail** (el campo abre más WhatsApp); cada recurso termina con **un paso siguiente** (test o diagnóstico); nada de PDFs pesados.

## 3. Contenido

### Pilares
| Pilar | Qué | % |
|---|---|---|
| **Gestionar con números** | Tips y guías de gestión agro: costos, márgenes, hacienda, registros | 35% |
| **Vender más en el agro** | Consultas, WhatsApp, Google, web, ferias, para proveedores | 30% |
| **Casos reales** | Clientes, antes y después, resultados | 20% |
| **Campo real y equipo** | Visitas a campo, ferias, detrás de escena, personas | 15% |

### Formatos
- **Microcápsulas** (el formato del plan 2025): videos de 30-60" con **una sola idea**. Series con nombre: *"Un minuto de gestión"*, *"El error de la semana"*, *"Así lo resolvió…"*.
- Carruseles educativos (5-7 placas) con el dato grande del key visual.
- Notas del blog (SEO) de 800-1.500 palabras, cada una con un recurso asociado.
- Casos: página + video de 1-2 minutos + carrusel.
- Cobertura de ferias: video recap + nota "lo que vimos".
- Audios o videos cortos para las listas de WhatsApp.

### Grilla semanal base (se ajusta según el calendario de 03)
| Día | Pieza | Pilar |
|---|---|---|
| Lun | Microcápsula de gestión | Gestionar con números |
| Mié | Carrusel de ventas para proveedores | Vender más |
| Jue | Nota del blog + difusión por WhatsApp o mail | Rotativo |
| Vie | Caso o campo real | Casos / campo real |

**Cada mes**: 1 tema principal alineado con el calendario (ej.: julio = "planificar la campaña con números"; marzo = Expoagro), un recurso nuevo o actualizado y un caso.

## 4. Web de captación: arquitectura

**Objetivo de la web**: llevar a cada visitante calificado a **su** diagnóstico o a WhatsApp en la menor cantidad de pasos. Todo lo demás (nosotros, blog, servicios) existe para sumar confianza y tráfico.

```
/                          Home: propuesta de valor + selector de 3 recorridos
├─ /proveedores-agro       Landing A: Vender más → calculadora → Diagnóstico Comercial
├─ /empresas-agropecuarias Landing C: Gestionar mejor → test → Diagnóstico de Gestión
├─ /instituciones          Landing B: Comunicar mejor → Diagnóstico de Comunicación
├─ /diagnostico            Los 3 diagnósticos + agenda (y /diagnostico/calculadora, /diagnostico/test)
├─ /soluciones/[slug]      Páginas para SEO por necesidad (ej.: crm-para-agronomias, software-ganadero, web-para-concesionarios)
├─ /casos · /casos/[slug]  Casos agro (plantilla de 8 bloques de los casos de Chimpancé, en marca TechAgro)
├─ /recursos · /recursos/[slug]  Plantillas, guías y checklists (con formulario)
├─ /blog · /blog/[slug]    Temas agrupados de SEO (06)
├─ /nosotros               Equipo, cómo trabajamos, respaldo de Chimpancé Digital
└─ /contacto               WhatsApp primero, formulario corto, datos
```

**Landings de campaña** (sin menú, un solo objetivo): variantes de /proveedores-agro y /empresas-agropecuarias por grupo de palabras clave o por pieza de Meta.

## 5. Home: bloques y copy base

> Copy base para arrancar; se ajusta en la sesión de UX/copy. Voz: capítulo 04.

1. **Hero**
   - Eyebrow: *TechAgro · Soluciones Tecnológicas para el agro*
   - Titular: *"El agro se transforma con datos, marca y estructura."* (claim de marca) o, más orientado a conversión: *"Tecnología simple para vender más y gestionar mejor en el agro."*
   - Bajada: *"Sistemas, apps y marketing digital pensados para cómo trabaja el campo: fáciles de usar, que funcionan con poca señal y con acompañamiento de personas que conocen el rubro."*
   - CTA primario: *Pedí tu diagnóstico sin cargo* · secundario: *Hablemos por WhatsApp*
2. **Selector "¿Qué tipo de empresa sos?"** (el bloque más importante): 3 tarjetas → Proveedor del agro / Empresa agropecuaria / Institución, cada una con su dolor en una línea y un link a su landing. Además, **segmenta y mide** desde el primer clic.
3. **Problemas que resolvemos** (en su idioma, 4-6): *"Consultas que se pierden en WhatsApp"*, *"Planillas que tiene una sola persona"*, *"No saber el costo por lote hasta que termina la campaña"*, *"Stock de hacienda con diferencias"*, *"Una web que nadie actualiza"*.
4. **Soluciones en 3 necesidades**: Vender más / Gestionar mejor / Comunicar mejor (01 §Servicios), cada una con 2-3 servicios y un link.
5. **Cómo trabajamos** (4 pasos): Diagnóstico → Hoja de ruta y propuesta → Implementación por etapas → Acompañamiento. Mensaje: *"Arrancamos por lo que más rinde y lo medimos antes de seguir."*
6. **Casos agro**: 2-3 tarjetas con resultado concreto (reales, con permiso).
7. **Por qué TechAgro** (desactivar la desconfianza): *"Pensado para quien carga los datos en el campo"* · *"Funciona sin señal"* · *"Integramos lo que ya usan"* · *"Personas que conocen el rubro"* · *"Respaldo de Chimpancé Digital, más de 12 años desarrollando software"*.
8. **Recursos**: los 2 recursos estrella (calculadora A, test C).
9. **Preguntas frecuentes**: ¿Cuánto cuesta? (rango + "siempre + IVA, en cuotas") · ¿Tengo que dejar lo que uso? · ¿Funciona sin señal? · ¿Lo va a usar mi personal? · ¿En cuánto tiempo está? · ¿Qué pasa si después quiero sumar cosas? · ¿Trabajan en mi zona? (remoto + visitas)
10. **Cierre**: *"Contanos cómo trabajan hoy y te decimos por dónde empezar."* + CTA diagnóstico + WhatsApp.
11. **Pie de página**: *"TechAgro es una empresa de Chimpancé Digital"*, contacto, redes, legales.

## 6. Landings por segmento

Estructura común (una sola columna, pensada para el celular):
1. Titular del dolor + bajada con la solución + CTA (autodiagnóstico) + WhatsApp.
2. **"¿Te pasa esto?"**: 3-4 síntomas del segmento (02).
3. Qué cambia: antes / después con números o ejemplos del rubro.
4. Cómo funciona (3 pasos) con captura del sistema en el celular.
5. Caso o testimonio del mismo segmento.
6. Qué incluye el diagnóstico y qué te llevás (hoja de ruta).
7. Objeciones del segmento como preguntas frecuentes (02).
8. CTA final + formulario de 4 preguntas.

Copies de titulares por segmento: capítulo 04 §5 y capítulo 05 §3.

## 7. Formularios, WhatsApp y medición

- **Formulario**: nombre · WhatsApp · tipo de empresa · tamaño · qué quiere resolver · para cuándo (02 §8). Mail opcional. Nada más.
- **WhatsApp flotante** con mensaje ya escrito según la página.
- **Página de gracias** con próximo paso concreto (agenda del diagnóstico o "te escribimos por WhatsApp en minutos") y el recurso.
- **Medición**: GA4 con eventos (`selector_segmento`, `whatsapp_click`, `form_submit`, `autodiagnostico_completo`, `diagnostico_agendado`, `recurso_descarga`), Meta Pixel + API de Conversiones, conversiones de Google Ads, UTMs, y **envío de la consulta al CRM con origen** (skill `analytics-tracking`; CRM de Chimpa-Finanzas).
- **Consentimiento** para WhatsApp y mail explícito en el formulario.

## 8. Requisitos técnicos para el agro

- **Primero el celular, y liviano**: la mayoría entra desde el celular y con señal irregular. Imágenes optimizadas (WebP/AVIF), fuentes limitadas (Montserrat en 3 pesos), sin videos de fondo pesados, carga útil rápida en 3G/4G débil.
- **Legibilidad**: textos grandes, alto contraste (el verde oscuro #182E2C sobre claros y el #DCF0C5 sobre oscuro rinden bien, pero hay que verificar contraste AA en el DS), botones grandes para usar con una mano (y con guantes o sol de frente).
- **Autodiagnósticos que funcionan con conexión intermitente**: se calculan en el navegador y guardan el progreso.
- **SEO**: stack del sitio Chimpancé (Next.js con App Router, renderizado del lado del servidor), datos estructurados (Organization, FAQ, HowTo en guías), una URL por necesidad.
- **Panel propio** para blog, recursos y casos, así el equipo carga sin programar (mismo criterio que el admin del sitio Chimpancé).

## 9. Cómo se pasa al design system y al build

1. **Estrategia y copy (este skill)** → arquitectura, recorridos, bloques y copy base.
2. **UX** (`ux-chimpa`) → flujos, formularios, estados y wireframe lo-fi en gris, si hace falta validar el recorrido.
3. **Design system** (`design-system-marca`, **en otra sesión**) → a partir del **Key Visual TechAgro 2025** (paleta, Montserrat, isotipo) y de **los diseños web que ya existen (a modificar)**. Llevar a esa sesión: la personalidad y los sí/no del capítulo 01, los requisitos del §8 y la lista de componentes que pide esta web (selector de segmento, tarjeta de problema, antes/después, calculadora, test con puntaje, tarjeta de caso, preguntas frecuentes, botón de WhatsApp flotante, formulario de 4 preguntas, dato grande).
4. **Build**: según el proceso vigente de Chimpancé (Santiago no programa; se preparan specs y prompts).
