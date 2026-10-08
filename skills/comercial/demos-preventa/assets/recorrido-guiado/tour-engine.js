/**
 * Recorrido guiado para demos de preventa (reutilizable, sin dependencias).
 *
 * Qué hace:
 *  - Bienvenida al entrar por primera vez.
 *  - Pasos que resaltan una zona de la pantalla (spotlight) con una tarjeta explicativa.
 *  - Pasos "probalo": esperan a que la persona haga la acción real (un evento de la demo).
 *  - Lista de misiones ("Qué podés probar") que se tildan solas, con progreso.
 *  - Se pausa sola cuando hay un modal abierto y guarda el avance en el navegador.
 *
 * Cómo se usa:
 *   const tour = createTour({ id, title, steps, missions });
 *   tour.mount();
 * La demo avisa lo que pasa con window.dispatchEvent(new CustomEvent('demo:event', { detail: { name } })).
 *
 * Paso:    { title, body, route?, routeMatch? (no navegar si el hash ya coincide), target?, waitFor?: { event, test?(detail) }, try?, nextLabel?, skipLabel? }
 * Misión:  { id, label, event, test?(detail), step? (índice al que lleva "Mostrame") }
 */

const EVENT = 'demo:event';
const ico = (id, cls = '') => `<svg class="ico ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function createTour({ id, title = 'Recorrido guiado', steps, missions = [], modalSelector = '.scrim' }) {
  const KEY = `tour:${id}`;
  let st = load();
  let current = -1;       // paso visible (-1 = cerrado)
  let raf = 0;
  let els = {};

  function load() {
    try { return { done: {}, step: 0, welcomed: false, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
    catch { return { done: {}, step: 0, welcomed: false }; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* ignorar */ } }

  // ---------- estructura ----------
  function mount() {
    const root = document.createElement('div');
    root.className = 'tour';
    root.innerHTML = `
      <div class="tour-hole" hidden></div>
      <div class="tour-card" role="dialog" aria-live="polite" aria-labelledby="tour-title" hidden></div>
      <button type="button" class="tour-fab" aria-expanded="false" aria-controls="tour-panel">${ico('help')}<span>Guía</span><span class="count" hidden></span></button>
      <section class="tour-panel" id="tour-panel" aria-label="${esc(title)}" hidden></section>`;
    document.body.append(root);
    els = {
      root, hole: root.querySelector('.tour-hole'), card: root.querySelector('.tour-card'),
      fab: root.querySelector('.tour-fab'), panel: root.querySelector('.tour-panel'),
    };
    els.fab.addEventListener('click', () => togglePanel());
    els.card.addEventListener('click', onCardClick);
    els.panel.addEventListener('click', onPanelClick);
    window.addEventListener(EVENT, (e) => onDemoEvent(e.detail));
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('hashchange', () => setTimeout(schedule, 60));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current >= 0 && !isModalOpen()) stop(); });
    new MutationObserver(() => { root.classList.toggle('is-paused', isModalOpen()); schedule(); })
      .observe(document.body, { childList: true });
    renderFab();
    if (!st.welcomed) show(0);
  }

  const isModalOpen = () => !!document.querySelector(modalSelector);

  // ---------- pasos ----------
  async function show(i) {
    if (i < 0 || i >= steps.length) return stop();
    current = i; st.step = i; save();
    closePanel();
    const step = steps[i];
    const stay = step.routeMatch && step.routeMatch.test(location.hash);
    if (step.route && !stay && location.hash !== step.route) location.hash = step.route;
    els.card.hidden = false;
    renderCard();
    const target = step.target ? await waitForTarget(step.target) : null;
    if (current !== i) return;
    if (target) target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setTimeout(position, target ? 380 : 0);
  }

  function waitForTarget(sel, ms = 2500) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const tick = () => {
        const el = visible(sel);
        if (el || performance.now() - t0 > ms) return resolve(el);
        requestAnimationFrame(tick);
      };
      tick();
    });
  }
  function visible(sel) {
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      if (r.width && r.height && getComputedStyle(el).visibility !== 'hidden') return el;
    }
    return null;
  }

  function renderCard() {
    const step = steps[current];
    const n = current + 1, total = steps.length;
    const waiting = !!step.waitFor;
    els.card.classList.toggle('is-center', !step.target);
    els.card.innerHTML = `
      <div class="tour-card__top">
        <span class="t-overline">${current === 0 ? esc(title) : `Paso ${n - 1} de ${total - 1}`}</span>
        <button type="button" class="icon-btn" data-tour="stop" aria-label="Salir del recorrido">${ico('x')}</button>
      </div>
      ${current > 0 ? `<div class="progress" aria-hidden="true"><i style="width:${Math.round(((n - 1) / (total - 1)) * 100)}%"></i></div>` : ''}
      <h3 id="tour-title">${esc(step.title)}</h3>
      <div class="tour-card__body">${step.body}</div>
      ${waiting ? `<div class="tour-try">${ico('arrow', 'ico--sm')}<span><b>Probalo:</b> ${esc(step.try || 'hacé la acción marcada')}</span></div>` : ''}
      <div class="tour-card__actions">
        ${current > 0 ? `<button type="button" class="btn btn--ghost btn--sm" data-tour="prev">${ico('chev-l', 'ico--sm')}Anterior</button>` : ''}
        <span class="tour-card__sp"></span>
        ${step.skipLabel ? `<button type="button" class="btn btn--secondary btn--sm" data-tour="stop">${esc(step.skipLabel)}</button>` : ''}
        ${waiting
          ? `<button type="button" class="btn btn--secondary btn--sm" data-tour="next">Saltar este paso</button>`
          : `<button type="button" class="btn btn--primary btn--sm" data-tour="next">${esc(step.nextLabel || (current === total - 1 ? 'Terminar' : 'Siguiente'))}${ico('arrow', 'ico--sm')}</button>`}
      </div>`;
  }

  function onCardClick(e) {
    const a = e.target.closest('[data-tour]')?.dataset.tour;
    if (a === 'next') current === steps.length - 1 ? finish() : show(current + 1);
    if (a === 'prev') show(current - 1);
    if (a === 'stop') current === 0 ? finish() : stop();
  }

  function stop() {
    current = -1; st.welcomed = true; save();
    els.card.hidden = true; els.hole.hidden = true;
    renderFab();
  }
  function finish() { stop(); openPanel(); }

  // ---------- posición ----------
  function schedule() { cancelAnimationFrame(raf); raf = requestAnimationFrame(position); }

  function position() {
    if (current < 0) return;
    const step = steps[current];
    const el = step.target ? visible(step.target) : null;
    const card = els.card;
    if (!el) {
      els.hole.hidden = true;
      card.classList.add('is-center');
      card.style.cssText = '';
      return;
    }
    card.classList.remove('is-center');
    const r = el.getBoundingClientRect();
    const pad = 6;
    Object.assign(els.hole.style, { top: `${r.top - pad}px`, left: `${r.left - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
    els.hole.hidden = false;
    if (window.innerWidth < 640) { card.style.cssText = ''; return; } // en celular la tarjeta va abajo (CSS)
    const cw = card.offsetWidth, ch = card.offsetHeight, gap = 14, vw = window.innerWidth, vh = window.innerHeight;
    let top = r.bottom + gap;
    if (top + ch > vh - 12) top = r.top - ch - gap;           // arriba si no entra abajo
    if (top < 12) top = Math.min(vh - ch - 12, Math.max(12, r.top + 12)); // superpuesta si no entra ninguna
    let left = Math.min(Math.max(12, r.left), vw - cw - 12);
    card.style.cssText = `top:${top}px;left:${left}px`;
  }

  // ---------- eventos de la demo ----------
  function onDemoEvent(d) {
    let changed = false;
    for (const m of missions) {
      if (!st.done[m.id] && m.event === d.name && (!m.test || m.test(d))) { st.done[m.id] = true; changed = true; }
    }
    if (changed) { save(); renderFab(); if (!els.panel.hidden) renderPanel(); }
    const step = steps[current];
    if (step?.waitFor && step.waitFor.event === d.name && (!step.waitFor.test || step.waitFor.test(d))) {
      const next = current + 1;
      // Si hay un modal abierto (ej.: la confirmación), avanza cuando se cierra.
      const go = () => (isModalOpen() ? setTimeout(go, 250) : show(next));
      setTimeout(go, 400);
    }
  }

  // ---------- panel de misiones ----------
  const doneCount = () => missions.filter(m => st.done[m.id]).length;

  function renderFab() {
    const left = missions.length - doneCount();
    const c = els.fab.querySelector('.count');
    c.hidden = !left; c.textContent = left;
    els.fab.classList.toggle('is-done', !left && missions.length > 0);
  }

  function renderPanel() {
    const d = doneCount(), t = missions.length;
    els.panel.innerHTML = `
      <header class="tour-panel__head">
        <div><span class="t-overline">${esc(title)}</span><h3>Qué podés probar</h3></div>
        <button type="button" class="icon-btn" data-panel="close" aria-label="Cerrar">${ico('x')}</button>
      </header>
      <p class="tour-panel__lead">${d === t ? 'Probaste todo. Podés seguir explorando libremente.' : `Llevás ${d} de ${t}. Todo lo que hagas funciona de verdad dentro de la demo.`}</p>
      <div class="progress" aria-hidden="true"><i style="width:${t ? Math.round((d / t) * 100) : 0}%"></i></div>
      <ul class="tour-missions">
        ${missions.map(m => `
          <li class="${st.done[m.id] ? 'is-done' : ''}">
            <span class="tour-missions__ck">${st.done[m.id] ? ico('check', 'ico--sm') : ''}</span>
            <span class="tour-missions__txt">${esc(m.label)}</span>
            ${Number.isInteger(m.step) && !st.done[m.id] ? `<button type="button" class="link" data-panel="goto" data-step="${m.step}">Mostrame</button>` : ''}
          </li>`).join('')}
      </ul>
      <div class="tour-panel__actions">
        <button type="button" class="btn btn--primary btn--sm btn--block" data-panel="start">${ico('eye', 'ico--sm')}${st.step > 0 && st.step < steps.length - 1 ? 'Retomar el recorrido' : 'Hacer el recorrido guiado'}</button>
        <button type="button" class="btn btn--ghost btn--sm" data-panel="reset">Reiniciar la guía</button>
      </div>`;
  }

  function onPanelClick(e) {
    const b = e.target.closest('[data-panel]'); if (!b) return;
    const a = b.dataset.panel;
    if (a === 'close') closePanel();
    if (a === 'start') show(st.step > 0 && st.step < steps.length - 1 ? st.step : 1);
    if (a === 'goto') show(Number(b.dataset.step));
    if (a === 'reset') { st = { done: {}, step: 0, welcomed: true }; save(); renderFab(); renderPanel(); }
  }

  function openPanel() { renderPanel(); els.panel.hidden = false; els.fab.setAttribute('aria-expanded', 'true'); }
  function closePanel() { els.panel.hidden = true; els.fab.setAttribute('aria-expanded', 'false'); }
  function togglePanel() {
    if (current >= 0) stop();
    els.panel.hidden ? openPanel() : closePanel();
  }

  return { mount, start: () => show(1), show, stop, openPanel };
}
