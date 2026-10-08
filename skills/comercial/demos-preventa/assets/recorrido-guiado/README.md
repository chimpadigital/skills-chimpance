# Recorrido guiado — pieza estándar de todo demo funcional

El potencial cliente tiene que poder recorrer la demo **solo**, sin que Santiago esté al lado.
Esta carpeta es el motor listo para copiar. Primera versión: demo de CHB Promos (sep 2026),
en `propuestas/CHB Uniformes/demo/`.

## Archivos

| Archivo | Qué es | ¿Se toca? |
|---|---|---|
| `tour-engine.js` | Motor genérico: bienvenida, spotlight, tarjetas, pasos "Probalo", misiones, pausa con modales, avance guardado | No (salvo mejoras para todas las demos) |
| `tour.css` | Estilos. Usa tokens semánticos (`--color-*`, `--space-*`, `--radius-*`, `--elevation-*`) y las clases `.btn`, `.icon-btn`, `.progress`, `.count`, `.link` | Mapear a los tokens/clases del DS del cliente si se llaman distinto |
| `events.js` | `emit(nombre, datos)`: la demo avisa lo que pasa | No |
| `ejemplo-guion-chb.js` | Guion de ejemplo (14 pasos + 7 misiones) | Es el modelo para escribir el guion de cada cliente |

Íconos: el motor usa `#i-help`, `#i-x`, `#i-arrow`, `#i-chev-l`, `#i-check`, `#i-eye` del sprite de la demo.

## Cómo se integra (4 pasos)

1. Copiar `tour-engine.js`, `events.js` y `tour.css` a la demo y linkear el CSS.
2. En cada acción que importa, avisar: `emit('payment:validated')`, `emit('route', { path })` al cambiar de pantalla, `emit('filter:status', { status })`, etc.
3. Escribir el guion del cliente (`<cliente>-tour.js`) con `createTour({ id, title, steps, missions })`.
4. Al arrancar la app: `tour.mount()`. La primera vez muestra la bienvenida sola.

## Reglas del guion

- **Bienvenida** (paso 0, sin target): qué es la plataforma, "en 3 minutos te mostramos lo importante", **"Todo funciona de verdad"**, datos ficticios. Botones: *Empezar el recorrido* / *Explorar por mi cuenta*.
- **10 a 15 pasos**, siguiendo el recorrido de la venta (el mismo que haría Santiago en vivo), atados al **dolor del brief**.
- Cada paso: título corto que es un beneficio ("Quién debe, cuánto y desde cuándo"), 1 o 2 párrafos cortos, en la **jerga del cliente**.
- Al menos la mitad de los pasos tienen que ser **"Probalo"** (`waitFor` + `try`): la persona hace la acción real y el recorrido avanza solo. Ese es el momento "anda de verdad".
- `route` lleva a la pantalla correcta; `routeMatch` evita sacarlo de donde ya está (ej.: si abrió otro alumno, seguimos con ese).
- Último paso: "Lo que viene" (módulos futuros) + aviso de que la guía queda en el botón **Guía**.
- **Misiones** (5 a 8): las acciones que prueban el valor. Se tildan solas y cada una tiene "Mostrame" (lleva al paso).
- La guía nunca bloquea: todos los clics funcionan, se puede saltar cualquier paso y salir con Esc.
- Cambiar el `id` del tour (`cliente-v2`) si se reescribe el guion, para que vuelva a aparecer la bienvenida.

## Verificación

Recorrer el tour completo con Playwright (clic por clic, incluidos los "Probalo") en 1440 px y 390 px, sin errores en consola.
