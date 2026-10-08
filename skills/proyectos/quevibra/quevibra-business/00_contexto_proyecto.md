# Contexto del proyecto QueVibra

> Datos duros consolidados. Última actualización: 2026-05-27.

## Identidad

- **Nombre:** QueVibra (siempre así escrito — no "Vibra" suelto, no "Que Vibra" con espacio).
- **Dominio:** quevibra.com.ar.
- **Qué es:** agenda personalizada de eventos y actividades por ciudad.
- **Forma del producto:** sitio web diseñado primero para celular, instalable como app sin pasar por las tiendas.

## Etapa y ambición

- **Etapa actual:** pre-lanzamiento. Beta operativa. Sin ingresos validados.
- **Tiempo de desarrollo:** 6 meses, desde noviembre 2025.
- **Mercado wedge:** Córdoba (Argentina). Es el mercado donde se valida el playbook antes de replicar.
- **Ambición:** LATAM. Replicación ciudad por ciudad después de validar.
- **Decisión estratégica clave:** QueVibra NO es ticketera (al menos no todavía). Puede serlo a largo plazo.
- **Tesis del pre-lanzamiento:** primero hábito. Después tráfico. Después oferta. Después monetización.

## Aceleradora y mentoras

- **Aceleradora:** KunturLab / CULTECH S.A.S.
- **Programa:** CultTech — 3 meses, USD 850/mes.
- **Mentoras:**
  - Carina Valoni — estrategia y legal.
  - Nohelia Sánchez — tecnología, marketing y desarrollo de negocio.
- **Red regional:** CultTech con presencia en Vienna, INARIA, EU-LAC y alumni LATAM.

## Equipo

- **Equipo actual:** fundador único (Santiago Castro) con dedicación completa.
- **Perfil del fundador:** background de negocios y producto, no técnico. No programa. Construye QueVibra con asistencia de IA (Claude) sobre Replit.
- **Roles a sumar en pre-lanzamiento:**
  - Community Manager para alimentar Instagram y TikTok a diario.
  - Operador de carga manual de eventos desde Instagram (cuello de botella hasta tener masa crítica).
  - Supervisor de las fuentes automáticas (las 34 scrapers).

## Activos del producto (lo que ya está construido)

- **Catálogo automático:** 34 fuentes de scraping que traen eventos a diario.
- **IA Vision:** lee flyers de Instagram, PDFs y links automáticamente y extrae el evento.
- **Panel de administración** completo.
- **Recomendaciones personalizadas:** según intereses declarados + comportamiento real + atribución.
- **Sistema de login:** Google + email/contraseña + doble verificación para administradores.
- **Generador propio** de placas y carruseles para Instagram y TikTok, brand-consistent, sin costo por imagen.
- **Cuentas de Instagram y TikTok** configuradas.
- **Meta Ads y Google Ads** listos para activar (con seguimiento ya instalado).
- **Sitio indexado en Google** con páginas propias para cada evento y cada ciudad (SEO).
- **13 categorías** de eventos cubiertas.
- **10 ciudades soportadas** (con cobertura profunda en Córdoba y CABA).
- **Sistema de email transaccional** (MailerSend): verificación, bienvenida, resumen semanal personalizado.

## Datos como activo único (no replicable fácilmente)

- Intereses declarados por cada usuario (categorías + tags).
- Comportamiento real (qué vibró, qué guardó, qué clickeó, qué agendó).
- Atribución completa (de qué red social vino cada usuario, qué link).
- Métricas por fuente automática (salud de cada scraper) y por evento.

## Costo operativo

- **25 a 50 USD por mes** para correr todo (servidor, base de datos, scrapers, IA Vision, emails).

Eso significa que el costo de operación es prácticamente despreciable. Es una ventaja estratégica fuerte: cualquier monetización mínima ya cubre la infraestructura.

## Capital simbólico construido

- Aceleradora cultural reconocida (KunturLab / CultTech).
- Red regional LATAM (CultTech con presencia en Vienna, INARIA, EU-LAC y alumni LATAM).
- Marca QueVibra con identidad consolidada (ver Vibra DS v0.3 en `_branding-v2/`).
- Diálogo abierto con Secretaría de Cultura de Córdoba.

## Hipótesis lean que guían el pre-lanzamiento

- **H1:** Ningún organizador paga si no hay tráfico.
- **H2:** Ningún organizador da beneficios (descuentos, entradas gratis) si no hay tráfico.

**Refinaciones:** ambas hipótesis no son universales. Hay subsegmentos donde pueden ser FALSAS:

- **H1 refinada:** algunos organizadores podrían pagar por HERRAMIENTAS (identidad digital, gestión, inscripciones) sin esperar tráfico. Ej.: talleristas independientes que no tienen sitio propio.
- **H2 refinada:** algunos subsegmentos institucionales (espacios culturales aliados, embajadas) podrían ceder cupos como TRADE DE DIFUSIÓN sin esperar tráfico.

Para detalle de las hipótesis y los experimentos diseñados para validarlas, consultar el skill complementario `quevibra-segmentos-detallado` o el documento de estrategia de pre-lanzamiento.

## Dos motores posibles del modelo de negocio

| Motor | Lógica | Cuándo arranca |
|---|---|---|
| Marketplace / media (eventos destacados, sponsors) | "Te traemos público" | Después de tráfico crítico (mes 6+ aproximado) |
| Herramienta SaaS (perfil profesional, gestión) | "Te damos herramientas" | Testeable en pre-lanzamiento |

El foco principal sigue siendo construir hábito y tráfico (motor marketplace). En paralelo, en bajo costo, se testea el motor SaaS.

## Documentos relacionados del proyecto (fuera del skill)

- `Brief_Canvas_KunturLab_QUEVIBRA.md` — brief consolidado del canvas KunturLab (en el directorio del proyecto).
- `Mapa_Segmentos_QUEVIBRA.md` — mapa de segmentos previo (versión anterior, ahora hay versión más completa basada en CSV).
- `_branding-v2/` — Design System Vibra DS v0.3 (manual + tokens). Ante cualquier tarea visual, leer primero `_branding-v2/LEER-PRIMERO.md`.
