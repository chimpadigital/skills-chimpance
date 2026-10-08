# Changelog — web-performance-optimization

Basado en el skill original `web-performance-optimization` (community).

## Mejoras aplicadas

### P1 — picture no genera preload automatico
- Agregado warning: cuando se usa `<picture>` + `<source media>` para variantes mobile/desktop, el browser NO hace preload.
- Agregado codigo de ejemplo con `<link rel="preload">` manuales por variante.
- Origen: proyecto PROME, LCP /tutoriales 11.9s->4.8s tras el fix.

### Fase 2 — Diagnostico LCP con background-image CSS
- Expandido el punto de LCP element: si PSI muestra LCP alto pero phases suman bajo, el culpable probable es un background-image CSS que el browser descubre tarde.
- Agregado paso de diagnostico via image-delivery-insight de PSI.
- Origen: proyecto PROME, LCP /quienes-somos 10.87s->3.00s tras migrar div background-image a Image fill priority.

### Fase 5 — PSI flakiness en preview con force-dynamic
- Advertencia: PSI en deploys preview de Vercel con force-dynamic puede saltar +-20 puntos entre runs por cold starts.
- Recomendacion: correr minimo 3 veces o esperar field data de CrUX/GSC en produccion.

### P7 CLS — patrones adicionales
- Agregado: Suspense fallback con altura minima (usar min-h-screen en lugar de texto generico).
- Agregado: Lighthouse reporta el ultimo elemento desplazado, no el causante real. Revisar lo que esta arriba en el DOM.

### Checklist — URL hardcodeada removida
- Eliminada referencia a URL especifica de un proyecto.
- Reemplazada por indicacion generica de runs multiples.
