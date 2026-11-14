(function () {
  'use strict';
  const key = 'serie.install.tip.v2';
  let nativeInstallPrompt = null;
  function isInstalled() {
    return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  }
  function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function isMobile() {
    return isIOS() || /Android/i.test(navigator.userAgent);
  }
  function previouslyShown() {
    try { return localStorage.getItem(key) === '1'; } catch (_) { return false; }
  }
  function markShown() {
    try { localStorage.setItem(key, '1'); } catch (_) {}
  }
  function steps() {
    if (isIOS()) return '<li>Abre <strong>SERIE</strong> en <strong>Safari</strong>.</li><li>Toca <strong>Compartir</strong> (el cuadrado con una flecha hacia arriba).</li><li>Elige <strong>Añadir a pantalla de inicio</strong> y confirma con <strong>Añadir</strong>.</li>';
    if (/Android/i.test(navigator.userAgent)) return '<li>Abre <strong>SERIE</strong> en Chrome.</li><li>Toca el menú <strong>⋮</strong> y selecciona <strong>Instalar aplicación</strong> o <strong>Añadir a pantalla de inicio</strong>.</li><li>Confirma la instalación.</li>';
    return '<li>Abre esta página en un navegador compatible con aplicaciones web.</li><li>Busca <strong>Instalar</strong> o <strong>Añadir a pantalla de inicio</strong> en el menú del navegador.</li>';
  }
  function openInstallGuide(automatic) {
    const auto = automatic === true;
    if (auto && (isInstalled() || !isMobile() || previouslyShown() ||
        sessionId || document.getElementById('dialog').open ||
        document.visibilityState === 'hidden' ||
        document.activeElement?.matches('input, textarea, select, [contenteditable="true"]'))) return false;
    const action = nativeInstallPrompt ? '<button class="primary" type="button" onclick="installSerie()">Instalar ahora</button>' : '';
    modal('SERIE en tu móvil',
      '<div class="install-guide"><div class="install-intro"><img src="icon.svg?v=4" alt=""><p>' +
      (isInstalled() ? 'Ya tienes SERIE instalada en este dispositivo. Estas instrucciones también te sirven para instalarla en otro móvil.' : 'Guarda SERIE en tu pantalla de inicio para abrir tus entrenamientos como una app, sin entrar cada vez al navegador.') +
      '</p></div>' +
      '<ol>' + steps() + '</ol><p class="muted small">Tus entrenamientos se guardan en este dispositivo. Exporta una copia desde Ajustes si cambias de móvil. Tras la primera carga, la app también puede funcionar sin conexión.</p>' +
      '<div class="row">' + action + '<button type="button" onclick="closeDialog()">Entendido</button></div></div>');
    // Only remember a successful display, never a deferred attempt.
    if (auto) markShown();
    return true;
  }
  window.openInstallGuide = openInstallGuide;
  window.installSerie = async function () {
    if (!nativeInstallPrompt) return;
    const pending = nativeInstallPrompt;
    nativeInstallPrompt = null;
    try {
      await pending.prompt();
      const result = await pending.userChoice;
      if (result && result.outcome === 'accepted') closeDialog();
    } catch (_) { toast('No se ha podido iniciar la instalación. Usa el menú del navegador.'); }
  };
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    nativeInstallPrompt = event;
  });
  window.addEventListener('appinstalled', () => { nativeInstallPrompt = null; markShown(); closeDialog(); });
  // New visitors see the guide once. A workout or another modal must never
  // suppress it permanently: retry when the interface is available again.
  function showInitialGuide() {
    if (!isMobile() || isInstalled() || previouslyShown()) return true;
    return openInstallGuide(true) === true;
  }
  setTimeout(() => {
    if (showInitialGuide()) return;
    const retry = setInterval(() => {
      if (showInitialGuide()) clearInterval(retry);
    }, 3000);
  }, 1000);
})();
