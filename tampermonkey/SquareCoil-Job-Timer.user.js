// ==UserScript==
// @name         SquareCoil Job Timer Manager
// @namespace    us-sign-squarecoil-tools
// @version      1.0.3
// @description  Job Timer v1.0.2 plus drag-to-reorder recent tabs with persistent cross-tab ordering.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-end
// @grant        none
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/82cc8d7c86bfe8d0175f21f1427e878185c140ca/tampermonkey/SquareCoil-Job-Timer-v1.0.0.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/13914a24592e255739fa1d67bae5cdc6d6cb8a89/tampermonkey/SquareCoil-Job-Timer-v1.0.1.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/b3626c03fd05ab514233a668d02df18896bc338c/tampermonkey/SquareCoil-Job-Timer-v1.0.2.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// ==/UserScript==

(() => {
  'use strict';

  const VERSION = '1.0.3';
  const ROOT_ID = 'ussign-job-timer';
  const STORAGE_KEY = 'ussign-squarecoil-job-timer-v1';
  const CHANNEL = 'ussign-squarecoil-job-timer';
  const ORIGIN = `tab-order-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  let dragged = null;
  let dragChanged = false;
  let dragStartedAt = 0;
  let refineRaf = 0;
  let observer = null;
  let bc = null;

  window.__squareCoilJobTimerUiVersion = VERSION;

  function loadState() {
    try {
      const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return state && typeof state === 'object' ? state : null;
    } catch (_) {
      return null;
    }
  }

  function saveOrder(keys) {
    const state = loadState();
    if (!state) return;

    state.ui = state.ui && typeof state.ui === 'object' ? state.ui : {};
    state.ui.tabOrder = [...new Set(keys.filter(Boolean))];
    state.rev = Math.max(0, Number(state.rev) || 0) + 1;
    state.updatedAt = Date.now();
    state.origin = ORIGIN;
    state.lastReason = 'tab-reorder';

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    try {
      bc?.postMessage({
        origin: ORIGIN,
        at: state.updatedAt,
        type: 'tab-reorder'
      });
    } catch (_) {}
  }

  function orderFor(bar, state) {
    const tabs = [...bar.querySelectorAll(':scope > .jt-tab[data-key]')];
    if (!tabs.length) return;

    const saved = Array.isArray(state?.ui?.tabOrder) ? state.ui.tabOrder : [];
    const byKey = new Map(tabs.map(tab => [tab.dataset.key, tab]));
    const seen = new Set();

    for (const key of saved) {
      const tab = byKey.get(key);
      if (!tab || seen.has(key)) continue;
      bar.appendChild(tab);
      seen.add(key);
    }

    for (const tab of tabs) {
      const key = tab.dataset.key;
      if (seen.has(key)) continue;
      bar.appendChild(tab);
      seen.add(key);
    }
  }

  function currentOrder(bar) {
    return [...bar.querySelectorAll(':scope > .jt-tab[data-key]')]
      .map(tab => tab.dataset.key)
      .filter(Boolean);
  }

  function clearDropHints(bar) {
    bar.querySelectorAll('.jt-drop-before,.jt-drop-after')
      .forEach(tab => tab.classList.remove('jt-drop-before', 'jt-drop-after'));
  }

  function setupTab(tab) {
    if (tab.dataset.dragReady === '1') return;

    tab.dataset.dragReady = '1';
    tab.draggable = true;
    tab.setAttribute('aria-grabbed', 'false');

    tab.addEventListener('dragstart', event => {
      if (event.target.closest('.jt-x')) {
        event.preventDefault();
        return;
      }

      dragged = tab;
      dragChanged = false;
      dragStartedAt = Date.now();

      tab.classList.add('jt-dragging');
      tab.setAttribute('aria-grabbed', 'true');

      try {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', tab.dataset.key || '');
        event.dataTransfer.setDragImage(tab, Math.min(70, tab.offsetWidth / 2), 18);
      } catch (_) {}
    });

    tab.addEventListener('dragend', () => {
      const bar = tab.parentElement;
      tab.classList.remove('jt-dragging');
      tab.setAttribute('aria-grabbed', 'false');

      if (bar?.classList.contains('jt-tabs')) {
        clearDropHints(bar);
        if (dragChanged) saveOrder(currentOrder(bar));
      }

      dragged = null;
      dragChanged = false;
    });
  }

  function setupBar(bar) {
    if (bar.dataset.dragBarReady !== '1') {
      bar.dataset.dragBarReady = '1';

      bar.addEventListener('dragover', event => {
        if (!dragged || dragged.parentElement !== bar) return;
        event.preventDefault();

        try { event.dataTransfer.dropEffect = 'move'; } catch (_) {}

        const target = event.target.closest('.jt-tab[data-key]');
        clearDropHints(bar);

        if (!target || target === dragged) return;

        const rect = target.getBoundingClientRect();
        const after = event.clientX > rect.left + rect.width / 2;

        target.classList.add(after ? 'jt-drop-after' : 'jt-drop-before');

        const reference = after ? target.nextElementSibling : target;
        if (reference === dragged || (!reference && dragged === bar.lastElementChild)) return;

        if (reference) bar.insertBefore(dragged, reference);
        else bar.appendChild(dragged);

        dragChanged = true;
      });

      bar.addEventListener('drop', event => {
        if (!dragged) return;
        event.preventDefault();
        clearDropHints(bar);
        dragChanged = true;
        saveOrder(currentOrder(bar));
        dragChanged = false;
      });

      bar.addEventListener('dragleave', event => {
        if (event.relatedTarget && bar.contains(event.relatedTarget)) return;
        clearDropHints(bar);
      });
    }

    bar.querySelectorAll(':scope > .jt-tab[data-key]').forEach(setupTab);
  }

  function refine() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return false;

    const bar = root.querySelector('.jt-tabs');
    if (!bar) return false;

    root.dataset.uiVersion = VERSION;
    orderFor(bar, loadState());
    setupBar(bar);
    return true;
  }

  function scheduleRefine() {
    cancelAnimationFrame(refineRaf);
    refineRaf = requestAnimationFrame(refine);
  }

  function watch() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return false;

    observer?.disconnect();
    observer = new MutationObserver(mutations => {
      if (dragged) return;

      const relevant = mutations.some(mutation => {
        const target = mutation.target instanceof Element
          ? mutation.target
          : mutation.target?.parentElement;

        return target?.closest?.('.jt-tabs,#ussign-job-timer');
      });

      if (relevant) scheduleRefine();
    });

    observer.observe(root, { childList: true, subtree: true });
    scheduleRefine();
    return true;
  }

  function injectStyle() {
    if (document.getElementById('ussign-job-timer-ui-v103')) return;

    const style = document.createElement('style');
    style.id = 'ussign-job-timer-ui-v103';
    style.textContent = `
#${ROOT_ID} .jt-tab[data-key]{
  cursor:grab!important;
  user-select:none;
  -webkit-user-select:none;
  transition:
    transform 140ms ease,
    opacity 140ms ease,
    border-color 140ms ease,
    background-color 140ms ease,
    box-shadow 140ms ease!important;
}
#${ROOT_ID} .jt-tab[data-key]:active{cursor:grabbing!important}
#${ROOT_ID} .jt-tab.jt-dragging{
  cursor:grabbing!important;
  opacity:.42!important;
  transform:translateY(2px) scale(.985)!important;
  box-shadow:none!important;
}
#${ROOT_ID} .jt-tab.jt-drop-before::after,
#${ROOT_ID} .jt-tab.jt-drop-after::after{
  content:"";
  position:absolute;
  top:6px;
  bottom:5px;
  width:3px;
  border-radius:999px;
  background:rgb(var(--tc));
  box-shadow:0 0 0 3px rgba(var(--tc),.12),0 0 12px rgba(var(--tc),.36);
  pointer-events:none;
}
#${ROOT_ID} .jt-tab.jt-drop-before::after{left:-3px}
#${ROOT_ID} .jt-tab.jt-drop-after::after{right:-3px}
#${ROOT_ID} .jt-tab .jt-x{cursor:pointer!important}
#${ROOT_ID} .jt-tabs{touch-action:pan-x}
`;
    document.documentElement.appendChild(style);
  }

  injectStyle();

  try {
    bc = new BroadcastChannel(CHANNEL);
    bc.addEventListener('message', event => {
      if (event.data?.origin === ORIGIN) return;
      scheduleRefine();
    });
  } catch (_) {}

  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY) scheduleRefine();
  });

  document.addEventListener('click', event => {
    if (Date.now() - dragStartedAt > 260) return;
    if (!event.target.closest(`#${ROOT_ID} .jt-tab[data-key]`)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  let tries = 0;
  const wait = setInterval(() => {
    if (watch() || ++tries >= 80) clearInterval(wait);
  }, 150);
})();
