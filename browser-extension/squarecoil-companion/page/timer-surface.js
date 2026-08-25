(() => {
  'use strict';

  const VERSION = '0.7.1';
  const ROOT_ID = 'ussign-job-timer';
  const STYLE_ID = 'usx-timer-surface-v071';
  const SURFACES = ['solid', 'glass'];

  const previous = window.__usxTimerSurface;
  if (previous?.teardown) {
    try { previous.teardown(); } catch (_) {}
  }

  let root = null;
  let observer = null;
  let mountTimer = 0;
  let patchQueued = false;

  function currentSurface() {
    const value = document.documentElement.dataset.usxTimerSurface;
    return SURFACES.includes(value) ? value : 'solid';
  }

  function requestSurface(surface) {
    if (!SURFACES.includes(surface)) return;
    const html = document.documentElement;
    html.dataset.usxRequestedTimerSurface = surface;
    html.dataset.usxTimerSurface = surface;
    window.dispatchEvent(new Event('USX_SET_TIMER_SURFACE'));
    patchSettings();
  }

  function injectStyle() {
    document.getElementById(STYLE_ID)?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
html[data-usx-timer-surface="glass"][data-usx-theme="dark"] #${ROOT_ID} .jt-shell{
  background:rgba(14,19,24,.72)!important;
  background-image:linear-gradient(145deg,rgba(255,255,255,.025),rgba(255,255,255,.006))!important;
  border-color:rgba(255,255,255,.10)!important;
  box-shadow:0 20px 48px rgba(0,0,0,.34)!important;
  backdrop-filter:blur(18px) saturate(112%)!important;
  -webkit-backdrop-filter:blur(18px) saturate(112%)!important;
}
html[data-usx-timer-surface="glass"][data-usx-theme="dark"] #${ROOT_ID} :is(.jt-main,.jt-empty,.jt-settings,.jt-resume){
  background:rgba(23,29,35,.58)!important;
  background-image:none!important;
  border-color:rgba(255,255,255,.075)!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
html[data-usx-timer-surface="glass"][data-usx-theme="dark"] #${ROOT_ID} .jt-tab{
  background:rgba(20,26,32,.72)!important;
  border-color:rgba(var(--tc),.28)!important;
  border-bottom-color:rgba(255,255,255,.07)!important;
  box-shadow:0 7px 18px rgba(0,0,0,.22)!important;
  backdrop-filter:blur(14px) saturate(108%)!important;
  -webkit-backdrop-filter:blur(14px) saturate(108%)!important;
}
html[data-usx-timer-surface="glass"][data-usx-theme="dark"] #${ROOT_ID} .jt-tab.jt-selected{
  background:rgba(31,39,47,.84)!important;
  border-bottom-color:rgba(31,39,47,.84)!important;
}
html[data-usx-timer-surface="glass"][data-usx-theme="dark"] #${ROOT_ID} header>button{
  background:rgba(34,42,50,.62)!important;
  border-color:rgba(255,255,255,.09)!important;
}

html[data-usx-timer-surface="glass"][data-usx-theme="light"] #${ROOT_ID} .jt-shell{
  background:rgba(250,252,254,.78)!important;
  background-image:linear-gradient(145deg,rgba(255,255,255,.34),rgba(255,255,255,.08))!important;
  border-color:rgba(72,84,96,.15)!important;
  box-shadow:0 18px 44px rgba(31,42,52,.18)!important;
  backdrop-filter:blur(18px) saturate(118%)!important;
  -webkit-backdrop-filter:blur(18px) saturate(118%)!important;
}
html[data-usx-timer-surface="glass"][data-usx-theme="light"] #${ROOT_ID} :is(.jt-main,.jt-empty,.jt-settings,.jt-resume){
  background:rgba(250,252,254,.66)!important;
  background-image:none!important;
  border-color:rgba(55,67,78,.12)!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
html[data-usx-timer-surface="glass"][data-usx-theme="light"] #${ROOT_ID} .jt-tab{
  background:rgba(246,249,251,.72)!important;
  border-color:rgba(var(--tc),.26)!important;
  border-bottom-color:rgba(55,67,78,.12)!important;
  box-shadow:0 7px 18px rgba(31,42,52,.12)!important;
  backdrop-filter:blur(14px) saturate(112%)!important;
  -webkit-backdrop-filter:blur(14px) saturate(112%)!important;
}
html[data-usx-timer-surface="glass"][data-usx-theme="light"] #${ROOT_ID} .jt-tab.jt-selected{
  background:rgba(255,255,255,.88)!important;
  border-bottom-color:rgba(255,255,255,.88)!important;
}
html[data-usx-timer-surface="glass"][data-usx-theme="light"] #${ROOT_ID} header>button{
  background:rgba(247,249,251,.68)!important;
  border-color:rgba(55,67,78,.13)!important;
}
#${ROOT_ID} .usx-surface-settings{margin-top:11px}
#${ROOT_ID} .usx-surface-settings .usx-section-label{margin-top:0!important}
`;
    document.documentElement.appendChild(style);
  }

  function patchSettings() {
    if (!root || !root.classList.contains('jt-settings-open') || root.classList.contains('jt-collapsed')) return;
    const settings = root.querySelector('.jt-settings');
    const page = settings?.querySelector('.usx-settings-app > .usx-settings-page');
    const body = page?.querySelector(':scope > .usx-home-body');
    if (!body) return;

    const versionNode = page.querySelector(':scope > .usx-page-head small');
    const packageVersion = document.documentElement.dataset.usxExtension || VERSION;
    if (versionNode && versionNode.textContent !== `v${packageVersion}`) versionNode.textContent = `v${packageVersion}`;

    let block = body.querySelector(':scope > .usx-surface-settings');
    if (!block) {
      block = document.createElement('div');
      block.className = 'usx-surface-settings';
      block.innerHTML = `<div class="usx-section-label">Panel finish</div>
        <div class="usx-segmented usx-surface-segmented" role="group" aria-label="Job Timer panel finish">
          <button type="button" data-usx-timer-surface="solid">Solid</button>
          <button type="button" data-usx-timer-surface="glass">Glass / Blur</button>
        </div>`;
      const appearance = body.querySelector(':scope > .usx-segmented');
      if (appearance) appearance.insertAdjacentElement('afterend', block);
      else body.prepend(block);
    }

    const selected = currentSurface();
    block.querySelectorAll('[data-usx-timer-surface]').forEach(button => {
      button.dataset.selected = String(button.dataset.usxTimerSurface === selected);
    });
  }

  function queuePatch() {
    if (patchQueued) return;
    patchQueued = true;
    queueMicrotask(() => {
      patchQueued = false;
      patchSettings();
    });
  }

  function onRootClick(event) {
    const target = event.target instanceof Element ? event.target.closest('[data-usx-timer-surface]') : null;
    if (!target) {
      // Runtime/controls own the click. Patch after their synchronous render settles.
      setTimeout(queuePatch, 0);
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    requestSurface(target.dataset.usxTimerSurface);
  }

  function attachRoot(nextRoot) {
    if (!nextRoot || nextRoot === root) return;
    observer?.disconnect();
    root?.removeEventListener('click', onRootClick, true);
    root = nextRoot;
    root.addEventListener('click', onRootClick, true);
    observer = new MutationObserver(queuePatch);
    // Stability rule: observe only direct runtime root replacement. Never watch the
    // entire timer subtree, because settings rendering mutates that subtree itself.
    observer.observe(root, { childList: true });
    patchSettings();
  }

  function findRootWithRetry() {
    const found = document.getElementById(ROOT_ID);
    if (found) return attachRoot(found);
    let attempts = 0;
    clearInterval(mountTimer);
    mountTimer = setInterval(() => {
      const candidate = document.getElementById(ROOT_ID);
      if (candidate) {
        clearInterval(mountTimer);
        mountTimer = 0;
        attachRoot(candidate);
      } else if (++attempts >= 50) {
        clearInterval(mountTimer);
        mountTimer = 0;
      }
    }, 100);
  }

  function onThemeState() {
    queuePatch();
  }

  function teardown() {
    clearInterval(mountTimer);
    mountTimer = 0;
    observer?.disconnect();
    observer = null;
    root?.removeEventListener('click', onRootClick, true);
    window.removeEventListener('USX_THEME_STATE', onThemeState);
    document.getElementById(STYLE_ID)?.remove();
    root = null;
  }

  window.__usxTimerSurface = { version: VERSION, teardown };
  window.addEventListener('USX_THEME_STATE', onThemeState);
  injectStyle();
  findRootWithRetry();
})();
