/* Keeps the installed SERIE PWA current without interrupting an active workout. */
(() => {
  'use strict';
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  const API = navigator.serviceWorker;
  const RESTORE_KEY = 'serie.pwa.update.restore.v1';
  const CHECK_EVERY_MS = 5 * 60 * 1000;
  const selector = 'link[href],script[src]';
  const fingerprint = (root) => [...root.querySelectorAll(selector)]
    .map((node) => node.tagName + ':' + (node.getAttribute('href') || node.getAttribute('src') || ''))
    .join('|');
  const loadedFingerprint = fingerprint(document.head);
  let hadController = !!API.controller;
  let registration = null;
  let checking = false;
  let pending = false;
  let reloading = false;

  // Restore the selected day/view only following a version-triggered reload.
  try {
    const raw = sessionStorage.getItem(RESTORE_KEY);
    if (raw) {
      sessionStorage.removeItem(RESTORE_KEY);
      const state = JSON.parse(raw);
      if (['train', 'history', 'progress', 'settings'].includes(state.tab)) tab = state.tab;
      if (typeof state.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(state.date)) selectedDate = state.date;
      if (state.session && db.sessions.some((s) => s.id === state.session)) {
        sessionId = state.session;
        tab = 'train';
      }
      render();
    }
  } catch (_) { /* Storage access is optional. */ }

  const busy = () =>
    document.visibilityState === 'hidden' ||
    !!sessionId ||
    restEnd > Date.now() ||
    !!document.querySelector('dialog[open]') ||
    !!document.activeElement?.matches('input, textarea, select, [contenteditable="true"]');

  const banner = () => {
    let el = document.getElementById('serie-update-banner');
    if (!el) {
      el = document.createElement('aside');
      el.id = 'serie-update-banner';
      el.setAttribute('role', 'status');
      el.innerHTML = '<div><strong>Nueva versión de SERIE lista</strong><small>Se aplicará al salir del entrenamiento.</small></div>' +
        '<button type="button" class="small primary">Actualizar ahora</button>';
      el.querySelector('button').addEventListener('click', () => apply(true));
      document.body.appendChild(el);
    }
  };

  function apply(manual = false) {
    if (!pending || reloading) return;
    if (!manual && busy()) { banner(); return; }
    if (manual && busy()) {
      if (!confirm('¿Actualizar SERIE ahora? Se guardará el entrenamiento actual y la pantalla se recargará.')) return;
      document.activeElement?.blur?.(); // Commit a notes field with an onchange handler.
      if (typeof save === 'function' && !save()) return;
    }
    const el = document.getElementById('serie-update-banner');
    if (el) el.remove();
    try {
      sessionStorage.setItem(RESTORE_KEY, JSON.stringify({
        tab, date: selectedDate, session: sessionId
      }));
    } catch (_) { /* A reload still works without sessionStorage. */ }
    reloading = true;
    location.reload();
  }

  function newVersion() {
    pending = true;
    apply(false);
  }

  async function checkDocument() {
    try {
      const response = await fetch('./index.html', { cache: 'no-store' });
      if (!response.ok) return;
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      if (fingerprint(html.head) !== loadedFingerprint) newVersion();
    } catch (_) { /* Offline: stay on the working version. */ }
  }

  async function check() {
    if (checking || pending || document.visibilityState === 'hidden') return;
    checking = true;
    try {
      await Promise.allSettled([
        registration ? registration.update() : Promise.resolve(),
        checkDocument()
      ]);
    } finally { checking = false; }
  }

  API.addEventListener('controllerchange', () => {
    // First-ever installation of a worker should not cause a needless reload.
    if (hadController) newVersion();
    else hadController = true;
  });

  API.register('./sw.js', { updateViaCache: 'none' }).then((reg) => {
    registration = reg;
    const activate = (worker) => {
      if (!worker) return;
      const ready = () => {
        if (worker.state === 'installed' && API.controller) worker.postMessage({ type: 'SKIP_WAITING' });
      };
      worker.addEventListener('statechange', ready);
      ready();
    };
    if (reg.installing) activate(reg.installing);
    if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    reg.addEventListener('updatefound', () => activate(reg.installing));
    check();
  }).catch(() => { /* Browser may restrict service workers. */ });

  window.addEventListener('focus', check);
  window.addEventListener('pageshow', check);
  window.addEventListener('online', check);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (pending) apply(false);
      else check();
    }
  });
  // After the user leaves a workout/modal, apply the ready version automatically.
  document.addEventListener('click', () => {
    if (pending) setTimeout(() => apply(false), 0);
  });
  setInterval(() => {
    if (pending) apply(false);
    else check();
  }, CHECK_EVERY_MS);
})();
