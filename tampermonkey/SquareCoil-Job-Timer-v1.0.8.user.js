// ==UserScript==
// @name         SquareCoil Job Timer Manager
// @namespace    us-sign-squarecoil-tools
// @version      1.0.8
// @description  Job Timer v1.0.5 with explicit click-to-focus state control, drag-safe reordering, and centered close controls.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-end
// @grant        none
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/82cc8d7c86bfe8d0175f21f1427e878185c140ca/tampermonkey/SquareCoil-Job-Timer-v1.0.0.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/13914a24592e255739fa1d67bae5cdc6d6cb8a89/tampermonkey/SquareCoil-Job-Timer-v1.0.1.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/b3626c03fd05ab514233a668d02df18896bc338c/tampermonkey/SquareCoil-Job-Timer-v1.0.2.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/80b36561fe492edb205cecb585315077ea0dfc3a/tampermonkey/SquareCoil-Job-Timer-v1.0.3.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/8a310be6524e4478d9d00f81cb3e2a19001d3abd/tampermonkey/SquareCoil-Job-Timer-v1.0.4.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/1d740e7dac0f4449fdbade1c18782fe7168e444f/tampermonkey/SquareCoil-Job-Timer-v1.0.5.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// ==/UserScript==

(() => {
  'use strict';

  const VERSION = '1.0.8';
  const ROOT_ID = 'ussign-job-timer';
  const STORAGE_KEY = 'ussign-squarecoil-job-timer-v1';
  const CHANNEL = 'ussign-squarecoil-job-timer';
  const ORIGIN = `focus-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  let lastDragEndAt = 0;
  let observer = null;
  let bc = null;

  window.__squareCoilJobTimerUiVersion = VERSION;
  window.__squareCoilJobTimerInteractionVersion = VERSION;

  function loadState() {
    try {
      const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return state && typeof state === 'object' ? state : null;
    } catch (_) {
      return null;
    }
  }

  function tabFromEvent(event, root) {
    const target = event.target instanceof Element ? event.target : null;
    const tab = target?.closest?.('.jt-tab[data-key]');
    return tab && root.contains(tab) ? tab : null;
  }

  function pushRender(state) {
    try {
      bc?.postMessage({ origin: ORIGIN, at: state.updatedAt, type: 'tab-focus' });
    } catch (_) {}

    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(state),
        storageArea: localStorage,
        url: location.href
      }));
    } catch (_) {}
  }

  function selectKey(root, key) {
    const state = loadState();
    if (!state?.contexts?.[key]) return false;

    state.ui = state.ui && typeof state.ui === 'object' ? state.ui : {};
    state.ui.selectedKey = key;
    if (Array.isArray(state.ui.hiddenKeys)) {
      state.ui.hiddenKeys = state.ui.hiddenKeys.filter(k => k !== key);
    }
    state.rev = Math.max(0, Number(state.rev) || 0) + 1;
    state.updatedAt = Date.now();
    state.origin = ORIGIN;
    state.lastReason = 'tab-focus';

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    root.querySelectorAll('.jt-tab[data-key]').forEach(tab => {
      tab.classList.toggle('jt-selected', tab.dataset.key === key);
      tab.setAttribute('aria-selected', tab.dataset.key === key ? 'true' : 'false');
    });

    pushRender(state);
    return true;
  }

  function refreshHints(root) {
    root.querySelectorAll('.jt-tab[data-key]').forEach(tab => {
      const label = (tab.getAttribute('title') || tab.dataset.key || 'Timer')
        .replace(/\s*[•·]\s*(Double-click|Click) to view.*$/i, '')
        .trim();
      tab.setAttribute('title', `${label} • Click to view • Drag to reorder`);
      tab.dataset.selectMode = 'explicit-click';
      tab.setAttribute('role', 'tab');
    });
  }

  function install(root) {
    if (root.dataset.explicitFocusReady === '1') return true;
    root.dataset.explicitFocusReady = '1';

    try { bc = new BroadcastChannel(CHANNEL); } catch (_) {}

    root.addEventListener('dragend', event => {
      if (!tabFromEvent(event, root)) return;
      lastDragEndAt = Date.now();
    }, true);

    root.addEventListener('click', event => {
      const tab = tabFromEvent(event, root);
      if (!tab) return;
      if (event.target.closest?.('.jt-x')) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (Date.now() - lastDragEndAt < 260) return;
      selectKey(root, tab.dataset.key);
    }, true);

    root.addEventListener('dblclick', event => {
      const tab = tabFromEvent(event, root);
      if (!tab) return;
      if (event.target.closest?.('.jt-x')) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      selectKey(root, tab.dataset.key);
    }, true);

    observer = new MutationObserver(() => refreshHints(root));
    observer.observe(root, { childList: true, subtree: true });
    refreshHints(root);
    return true;
  }

  if (!document.getElementById('ussign-job-timer-ui-v108')) {
    const style = document.createElement('style');
    style.id = 'ussign-job-timer-ui-v108';
    style.textContent = `
#${ROOT_ID} .jt-tab[data-key]{cursor:grab!important}
#${ROOT_ID} .jt-tab[data-key]:active{cursor:grabbing!important}
#${ROOT_ID} .jt-tab.jt-selected{
  outline:1px solid rgba(var(--tc),.13)!important;
  outline-offset:-2px!important;
}
#${ROOT_ID} .jt-x{
  width:18px!important;
  height:18px!important;
  min-width:18px!important;
  min-height:18px!important;
  flex:0 0 18px!important;
  display:grid!important;
  place-items:center!important;
  padding:0!important;
  margin:0!important;
  border:0!important;
  border-radius:7px!important;
  background:rgba(255,255,255,.035)!important;
  color:transparent!important;
  font-size:0!important;
  line-height:0!important;
  overflow:hidden!important;
}
#${ROOT_ID} .jt-x::before{
  content:"×";
  display:block;
  color:rgba(225,230,236,.62)!important;
  font:400 13px/1 Arial,sans-serif!important;
  line-height:1!important;
  transform:translateY(-.35px);
}
#${ROOT_ID} .jt-x:hover{
  background:rgba(255,255,255,.08)!important;
}
#${ROOT_ID} .jt-x:hover::before{color:#fff!important}
`;
    document.documentElement.appendChild(style);
  }

  let tries = 0;
  const wait = setInterval(() => {
    const root = document.getElementById(ROOT_ID);
    if ((root && install(root)) || ++tries >= 80) clearInterval(wait);
  }, 125);
})();
