---
name: web-performance-optimization
description: "Optimize website and web application performance including loading speed, Core Web Vitals, bundle size, caching strategies, and runtime performance. Uses PageSpeed Insights thresholds and workflow as the verification step."
risk: unknown
source: community
---

# Web Performance Optimization (con verificación por PageSpeed Insights)

## Overview

Skill unificada para optimización de performance web end-to-end. Combina:

- **Implementación**: imágenes, JS/CSS, caching, CWV fixes, runtime.
- **Verificación final**: PageSpeed Insights (lab + field) como paso de cierre para confirmar que las optimizaciones funcionan.

## When to Use

- Sitio o app carga lento.
- Optimizar Core Web Vitals (LCP, INP, CLS).
- Reducir bundle size / TTI.
- Debug de performance bottlenecks.
- Cierre de auditoría SEO técnica.

## Workflow (5 fases)

### Fase 1: Medir baseline

- Lighthouse / PSI mobile + desktop por ruta.
- Anotar: Perf score, LCP, CLS, INP, TBT, TTFB.
- Network waterfall para ver preloads, orden de recursos.
- Bundle size (`webpack-bundle-analyzer`, `source-map-explorer`).

### Fase 2: Identificar issues

Revisar en orden de impacto:

1. **LCP element** — ¿imagen pesada? ¿background-image CSS (no preloadea)? ¿web font que tarda?
   - Si PSI muestra LCP alto pero phases (TTFB + load delay + load time) suman bajo (ej: 1.7s total pero LCP = 10s), el elemento se descubre tarde — candidato típico: `<div style={{ backgroundImage: "url(...)" }}>` que el browser detecta recién al parsear CSS.
   - Diagnosticar con el audit `image-delivery-insight` de PSI para ver el node snippet del LCP element.
   - Fix: migrar a `<Image fill priority fetchPriority="high">` con el contenedor en `position: relative; overflow: hidden`.
2. **CLS** — imágenes sin dims, fonts FOUT, skeletons de altura distinta, `useIsMobile` hidratando.
3. **TBT/INP** — JS blocking main thread, third-party scripts, hydration costosa.
4. **Render-blocking** — CSS no crítico sin defer, JS sin `async`/`defer`.
5. **Resource hints faltantes** — `preconnect`, `dns-prefetch`, `preload`.
6. **Caching** — `Cache-Control` missing / no `immutable` para assets versionados.

### Fase 3: Priorizar

Orden de impacto:
1. Critical path (LCP element + fonts críticos).
2. Core Web Vitals (LCP → CLS → INP).
3. Eliminar render-blocking.
4. Optimizar imágenes (formato, tamaño, responsive).
5. Third-party scripts (defer/lazy).
6. Caching.

### Fase 4: Implementar

Ver **playbooks** abajo (imágenes, JS, CSS, fonts, caching, CWV).

### Fase 5: Verificar con PageSpeed Insights

Este es el paso final **obligatorio** para confirmar que las optimizaciones funcionan. No declarar "hecho" sin este paso.

#### Thresholds objetivo (75th percentile de usuarios reales)

| Métrica | Good | Needs Improvement | Poor |
|---|---|---|---|
| **FCP** | ≤ 1.8s | 1.8–3.0s | > 3.0s |
| **LCP** | ≤ 2.5s | 2.5–4.0s | > 4.0s |
| **CLS** | ≤ 0.1 | 0.1–0.25 | > 0.25 |
| **INP** | ≤ 200ms | 200–500ms | > 500ms |
| **TTFB** | ≤ 800ms | 800ms–1.8s | > 1.8s |

#### Lab score (Lighthouse)

| Score | Rating |
|---|---|
| 90–100 | Good 🟢 |
| 50–89 | Needs Improvement 🟡 |
| 0–49 | Poor 🔴 |

**Objetivo: 90+ en Performance.**

#### Procedimiento de verificación

1. Correr PSI mobile (prioritario) y desktop por cada ruta optimizada.
2. Comparar contra baseline de Fase 1.
3. Lab vs field: si lab mejora pero field no, revisar hydration/third-party que Lighthouse no captura bien.
4. Si LCP sigue alto con phases bajas → el LCP element se descubre tarde (probable bg-image CSS, ver playbook).
5. Re-test en real mobile throttling (`--throttling.cpuSlowdownMultiplier=4`) si hay gap desktop/mobile grande.
6. **PSI es ruidoso en deploys preview con `force-dynamic`**: cold starts de serverless pueden hacer saltar el score ±20 puntos entre runs. Correr al menos 3 veces y promediar, o esperar a tener field data de CrUX/GSC en producción — ese número es el autoritativo.

---

## Playbooks

### P1. Imágenes

**Reglas duras:**
- Formato moderno: WebP (universal) o AVIF (mejor compresión).
- Heroes: < 150 KB. Recursos decorativos: < 80 KB.
- `width`/`height` **siempre** (evita CLS).
- Above-the-fold → `priority` + `fetchPriority="high"` + `loading="eager"`.
- Below-the-fold → `loading="lazy"`.
- Nunca usar `background-image` CSS para el LCP element (no preloadea).

**Next.js `<Image>`:**
```tsx
// Above-the-fold
<Image src="/hero.webp" alt="" width={1200} height={600} priority fetchPriority="high" sizes="100vw" />

// Decorativo full-width con fill
<div className="relative overflow-hidden">
  <Image src="/bg.webp" alt="" fill priority fetchPriority="high" sizes="100vw" quality={60} aria-hidden />
</div>
```

**Reencode con sharp:**
```js
import sharp from "sharp";
await sharp(input).webp({ quality: 75 }).toFile(output);
// Hero grande → resize a 1920 max + quality 70
```

**Responsive `<picture>`** (cuando hay variantes mobile/desktop distintas):
```html
<picture>
  <source media="(min-width: 640px)" srcset="/hero-desktop.webp" />
  <img src="/hero-mobile.webp" width="..." height="..." alt="" />
</picture>
```

> ⚠️ **`<picture>` no genera preload automático.** A diferencia de `next/image` con `priority`, el browser no hace preload de ninguna variante cuando se usa `<picture>` nativo. Agregar preloads manuales en el mismo componente:
```tsx
<link rel="preload" as="image" href={imageMobile} media="(max-width: 639px)" fetchPriority="high" />
<link rel="preload" as="image" href={image} media="(min-width: 640px)" fetchPriority="high" />
```

### P2. JavaScript

- Bundle target: < 200 KB gzipped main.
- Code split por ruta (Next.js automático).
- Dynamic imports para componentes pesados:
  ```tsx
  const Chart = dynamic(() => import("./Chart"), { ssr: false, loading: () => <div>...</div> });
  ```
- Tree shaking: importar named exports (`import { format } from 'date-fns'`, no `import _ from 'lodash'`).
- Reemplazar libs pesadas: `moment` → `date-fns` o `dayjs`, `lodash` completo → imports selectivos o nativo.
- Third-party: `async`/`defer`, o cargar on-demand post-`load`.

### P3. CSS

- Critical CSS inline (Next.js lo hace automático).
- Non-critical → deferir con `media="print" onload="this.media='all'"`.
- Eliminar CSS no usado (Tailwind ya purga).
- `font-display: swap` en `@font-face`.

### P4. Fonts

- Formato: **woff2** (mejor compresión, universal).
- Subset: `latin` + `latin-ext`.
- Preload de fonts críticos (el que usa el LCP element):
  ```html
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin />
  ```
- `font-display: swap` o `optional` para evitar FOIT.

### P5. Resource hints

```html
<link rel="preconnect" href="https://api.external.com" />
<link rel="dns-prefetch" href="https://analytics.external.com" />
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high" />
```

### P6. Caching

```
Cache-Control: public, max-age=31536000, immutable
```

Para assets versionados (`/images/`, `/fonts/`, `/_next/static/`).

### P7. CLS

- `width`/`height` explícitos en `<img>`/`<video>`/`<iframe>`.
- `aspect-ratio` CSS para contenedores responsive.
- No usar `useIsMobile()` para montar/desmontar layouts en SSR — usar CSS breakpoints (`md:hidden` / `hidden md:block`).
- Skeletons: matchear altura exacta del contenido final. Preferir SSR sobre skeleton.
- SVG con `width`/`height` que matchee `viewBox` (evita "Media element lacking explicit size").
- **Suspense fallback con altura mínima**: un fallback tipo `<div>Cargando...</div>` en un Suspense que wrappea contenido de pantalla completa genera CLS masivo cuando el contenido resuelve. Usar `<div className="min-h-screen" />` o la altura aproximada del contenido como fallback.
- Lighthouse señala el *último elemento que se desplazó* como culpable del CLS, no el causante real. Revisar todo lo que está ARRIBA en el DOM — skeletons que desaparecen, contenido condicional, toggles `useIsMobile` — que pueda cambiar de tamaño y empujar al elemento reportado.

### P8. INP / TBT

- Chunks de JS < 50ms por task.
- `requestIdleCallback` / `scheduler.postTask` para trabajo diferible.
- Debounce/throttle en handlers frecuentes.
- Memoizar re-renders pesados (`useMemo`, `React.memo`).

---

## Bad practices (checklist rápido)

- ❌ `<img>` sin `width`/`height`.
- ❌ `background-image` CSS en el LCP element.
- ❌ Scripts síncronos en `<head>`.
- ❌ Fonts sin `font-display`.
- ❌ Bundle monolítico (sin code split).
- ❌ Third-party scripts sin `async`/`defer`.
- ❌ Cache headers ausentes en assets estáticos.
- ❌ `useIsMobile()` controlando qué se monta en SSR.
- ❌ Skeleton con altura distinta al contenido.
- ❌ Declarar "optimizado" sin re-correr PSI.

## Accessibility & SEO (paralelo a perf)

- `alt` descriptivo en todas las imágenes (vacío `alt=""` + `aria-hidden` si es decorativa).
- Contrast ratio ≥ 4.5:1 texto normal, 3:1 grande.
- `aria-label` en botones icon-only.
- `<meta viewport>`, `<title>`, `<meta description>` presentes.
- Heading hierarchy (h1 único por página).
- Link text descriptivo (no "click aquí").

## Checklist final (antes de declarar "hecho")

### Performance
- [ ] Imágenes en WebP/AVIF con dims explícitas.
- [ ] LCP image con `priority` + `fetchPriority="high"`.
- [ ] No hay `background-image` CSS en el LCP element.
- [ ] Fonts en woff2 con `font-display: swap` y subset.
- [ ] Bundle main < 200 KB gzipped.
- [ ] Third-party async/defer.
- [ ] Cache-Control immutable en `/images/`, `/fonts/`, `/_next/static/`.
- [ ] Resource hints (preconnect/dns-prefetch) para dominios externos.

### Core Web Vitals (PSI mobile, 75th percentile)
- [ ] LCP ≤ 2.5s
- [ ] CLS ≤ 0.1
- [ ] INP ≤ 200ms
- [ ] FCP ≤ 1.8s
- [ ] TTFB ≤ 800ms

### Accessibility
- [ ] Alt text en todas las imágenes.
- [ ] Contrast WCAG AA.
- [ ] ARIA labels en elementos interactivos.

### Verificación
- [ ] PSI re-corrido post-cambios (mínimo 3 runs en preview; field data en prod es el número autoritativo).
- [ ] Comparación baseline vs post documentada.

---

## Herramientas

### Medición
- **PSI** (https://pagespeed.web.dev/) — lab + field
- **Lighthouse** (Chrome DevTools)
- **WebPageTest** — waterfall detallado
- **Web Vitals extension** — live CWV

### Análisis
- `webpack-bundle-analyzer`
- `source-map-explorer`
- **Bundlephobia** — pesar libs antes de instalar

### Monitoring
- Google Analytics (CWV events)
- Sentry / Datadog RUM

---

## Specification Reference

Basado en:
- [PageSpeed Insights docs](https://developers.google.com/speed/docs/insights/v5/about)
- [web.dev/vitals](https://web.dev/vitals/)
- [Lighthouse scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
