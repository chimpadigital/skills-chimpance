// Bus mínimo de eventos de la demo. La app avisa lo que pasa ("se validó un pago",
// "se abrió un alumno") y el recorrido guiado escucha, sin que se conozcan entre sí.

export const EVENT = 'demo:event';

export function emit(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { name, ...detail } }));
}
