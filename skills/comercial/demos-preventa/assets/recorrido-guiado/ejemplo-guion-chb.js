// Guion del recorrido guiado de CHB Promos. El motor es genérico (tour-engine.js);
// acá solo va el contenido: qué se muestra, en qué pantalla y qué se invita a probar.

import { createTour } from './tour-engine.js';

const ALUMNO = '#/alumnos/al-5a-10';   // Mateo Quinteros: cuotas vencidas
const DIVISION = '#/divisiones/dfs-5a';

const steps = [
  { // 0 · bienvenida
    title: 'Bienvenido a CHB Promos',
    body: `<p>Esta es la plataforma para gestionar promociones escolares de punta a punta: colegios, divisiones, alumnos, pedidos, cuotas, pagos y facturación.</p>
           <p>En 3 minutos te mostramos lo más importante. <b>Todo funciona de verdad</b>: lo que hagas acá se guarda y se refleja en el resto de las pantallas. Los datos son ficticios.</p>`,
    nextLabel: 'Empezar el recorrido', skipLabel: 'Explorar por mi cuenta', route: '#/inicio',
  },
  { // 1
    route: '#/inicio', target: '.kpi-row',
    title: 'La foto económica del día',
    body: '<p>Lo comprometido, lo cobrado, el saldo y lo vencido de todas las promociones activas. No se carga a mano: se calcula con la cuenta de cada alumno.</p>',
  },
  { // 2
    route: '#/inicio', target: '.atencion',
    title: '¿Qué necesita atención hoy?',
    body: '<p>La pantalla de inicio no es un tablero de gráficos: es una lista de tareas. Comprobantes para validar, cuotas vencidas, vencimientos de la semana, datos incompletos y pagos para facturar.</p><p>Cada fila se despliega y muestra quién es y cuánto debe.</p>',
  },
  { // 3
    route: '#/inicio', target: '.promo-card',
    title: 'Las promociones activas',
    body: '<p>Cada promoción tiene su color y su número, como la campera. La barra muestra cuánto se cobró, cuánto está en revisión y cuánto está vencido.</p>',
    waitFor: { event: 'route', test: (d) => d.path.startsWith('/promociones/') }, try: 'tocá la tarjeta de la Promo 2027 para entrar.',
  },
  { // 4
    route: '#/promociones/dfs-2027', target: '.block .table-wrap',
    title: 'Una promoción, cuatro divisiones',
    body: '<p>El contrato se firma por división con un representante de los padres, pero <b>la deuda nunca es del representante</b>: cada alumno tiene su propia cuenta.</p><p>Más abajo están el producto, el diseño aprobado, la condición comercial vigente y el calendario.</p>',
    waitFor: { event: 'route', test: (d) => d.path.startsWith('/divisiones/') }, try: 'entrá a la división 5A.',
  },
  { // 5
    route: DIVISION, target: '#chips',
    title: 'El estado de todo el curso',
    body: '<p>Cada alumno tiene un estado: pago por validar, vencido, próximo a vencer, al día o pago completo. Se puede buscar y filtrar por estado, plan de pago o situación.</p>',
    waitFor: { event: 'filter:status', test: (d) => d.status === 'vencido' }, try: 'filtrá por "Vencido".',
  },
  { // 6
    route: DIVISION, target: '#tabla-alumnos .table-wrap',
    title: 'Quién debe, cuánto y desde cuándo',
    body: '<p>Saldo, próximo vencimiento y plan de cada alumno, en una sola tabla. Los íconos de la derecha permiten revisar un comprobante o mandar un recordatorio sin salir de acá.</p>',
    waitFor: { event: 'route', test: (d) => d.path.startsWith('/alumnos/') }, try: 'abrí la cuenta de un alumno vencido (por ejemplo, Mateo Quinteros).',
  },
  { // 7
    route: ALUMNO, routeMatch: /^#\/alumnos\//, target: '.page-head',
    title: 'La cuenta de cada alumno',
    body: '<p>Arriba, el estado general y las acciones: registrar un pago, cargar un comprobante, enviar un recordatorio y emitir la factura.</p>',
  },
  { // 8
    route: ALUMNO, routeMatch: /^#\/alumnos\//, target: '.cuenta',
    title: 'Cuotas, una por una',
    body: '<p>Total, pagado y saldo, y cada cuota con su vencimiento y su estado. Los pagos se imputan solos a las cuotas en orden.</p>',
  },
  { // 9
    route: ALUMNO, routeMatch: /^#\/alumnos\//, target: '.page-head__actions [data-action="register"]',
    title: 'Registrá un pago',
    body: '<p>Cuando una familia paga en la oficina o por transferencia, se registra acá. El saldo, el estado y los totales de la división se actualizan al instante.</p>',
    waitFor: { event: 'payment:registered' }, try: 'tocá "Registrar pago" y confirmá.',
  },
  { // 10
    route: ALUMNO, routeMatch: /^#\/alumnos\//, target: '.page-head__actions [data-action="invoice"]',
    title: 'Facturá ese pago',
    body: '<p>Cada pago validado se puede facturar: factura A o B según la condición frente al IVA del responsable. En la demo la emisión es simulada; está preparada para conectarse con ARCA.</p>',
    waitFor: { event: 'invoice:emitted' }, try: 'tocá "Emitir factura" y confirmá.',
  },
  { // 11
    route: ALUMNO, routeMatch: /^#\/alumnos\//, target: '.page-head__actions [data-action="remind"]',
    title: 'Recordale a la familia',
    body: '<p>El mensaje se arma solo con el nombre, la cuota, el saldo y el vencimiento, listo para WhatsApp. También hay recordatorios automáticos programados antes de cada vencimiento.</p>',
    waitFor: { event: 'reminder:sent' }, try: 'tocá "Enviar recordatorio" y enviá el mensaje.',
  },
  { // 12
    route: DIVISION, target: '[data-action="filter-review"]',
    title: 'Validá un comprobante',
    body: '<p>Hoy los comprobantes llegan por WhatsApp con el nombre, el colegio y el curso. Acá se revisan contra la cuota que corresponde y, al validarlos, se imputan a la cuenta.</p>',
    waitFor: { event: 'payment:validated' }, try: 'tocá "Revisar comprobantes", elegí uno y validalo.',
  },
  { // 13
    route: '#/inicio', target: '.side',
    title: 'Lo que viene',
    body: '<p>Las secciones marcadas como <b>Pronto</b> son las próximas etapas: cotizador, productos, automatizaciones por WhatsApp y el portal para que las familias vean su cuenta y suban comprobantes desde el celular.</p><p>La guía queda abajo a la derecha con la lista de todo lo que podés probar.</p>',
    nextLabel: 'Terminar',
  },
];

const missions = [
  { id: 'filtrar', label: 'Filtrar los alumnos de una división por estado', event: 'filter:status', step: 5 },
  { id: 'alumno', label: 'Abrir la cuenta de un alumno', event: 'route', test: (d) => d.path.startsWith('/alumnos/'), step: 6 },
  { id: 'pago', label: 'Registrar un pago', event: 'payment:registered', step: 9 },
  { id: 'factura', label: 'Emitir una factura', event: 'invoice:emitted', step: 10 },
  { id: 'recordatorio', label: 'Enviar un recordatorio por WhatsApp', event: 'reminder:sent', step: 11 },
  { id: 'validar', label: 'Validar un comprobante', event: 'payment:validated', step: 12 },
  { id: 'comprobante', label: 'Cargar un comprobante de transferencia', event: 'receipt:uploaded' },
];

export default createTour({ id: 'chb-promos-v1', title: 'Guía de la demo', steps, missions });
