// ==UserScript==
// @name         SquareCoil Job Timer Manager
// @namespace    us-sign-squarecoil-tools
// @version      1.0.9
// @description  Job Timer v1.0.5 with reliable tab focus, drag-safe reordering, centered close controls, and auto-open on SquareCoil context switches.
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

  const VERSION = '1.0.9';
  const ROOT_ID = 'ussign-job-timer';
  const STORAGE_KEY = 'ussign-squarecoil-job-timer-v1';
  const ORIGIN = `focus-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  let observer = null;
  let lastDragEndAt = 0;
  let lastClockKey = null;
  let initializedClockKey = false;
  let syncingUi = false;

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

  function emitStorageRefresh(state) {
    try {
      const event = new Event('storage');
      Object.defineProperties(event, {
        key: { value: STORAGE_KEY },
        newValue: { value: JSON.stringify(state) },
        oldValue: { value: null },
        storageArea: { value: localStorage },
        url: { value: location.href }
      });
      window.dispatchEvent(event);
    } catch (_) {}
  }

  function writeUi(key, expand, reason) {
    const state = loadState();
    if (!state?.contexts?.[key]) return false;

    state.ui = state.ui && typeof state.ui === 'object' ? state.ui : {};
    state.ui.selectedKey = key;
    if (expand) state.ui.collapsed = false;
    if (Array.isArray(state.ui.hiddenKeys)) {
      state.ui.hiddenKeys = state.ui.hiddenKeys.filter(k => k !== key);
    }

    state.rev = Math.max(0, Number(state.rev) || 0) + 1;
    state.updatedAt = Date.now();
    state.origin = ORIGIN;
    state.lastReason = reason;

    syncingUi = true;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      emitStorageRefresh(state);
    } finally {
      setTimeout(() => { syncingUi = false; }, 0);
    }
    return true;
  }

  function clockKey(state) {
    return state?.active?.key || state?.pending?.key || null;
  }

  function tabFromEvent(event, root) {
    const target = event.target instanceof Element ? event.target : null;
    const tab = target?.closest?.('.jt-tab[data-key]');
    return tab && root.contains(tab) ? tab : null;
  }

  function refreshHints(root) {
    root.querySelectorAll('.jt-tab[data-key]').forEach(tab => {
      const label = (tab.getAttribute('title') || tab.dataset.key || 'Timer')
        .replace(/\s*[•·]\s*(Double-click|Click) to view.*$/i, '')
        .trim();
      tab.setAttribute('title', `${label} • Click to view • Double-click to open • Drag to reorder`);
      tab.dataset.selectMode = 'click';
      tab.setAttribute('role', 'tab');
    });
  }

  function detectContextSwitch(root) {
    if (syncingUi) return;
    const state = loadState();
    if (!state) return;

    const current = clockKey(state);
    if (!initializedClockKey) {
      lastClockKey = current;
      initializedClockKey = true;
      return;
    }

    if (!current || current === lastClockKey) return;
    lastClockKey = current;

    writeUi(current, true, 'auto-open-context-switch');
  }

  function install(root) {
    if (root.dataset.focusV109Ready === '1') return true;
    root.dataset.focusV109Ready = '1';

    root.addEventListener('dragend', event => {
      if (!tabFromEvent(event, root)) return;
      lastDragEndAt = Date.now();
    }, true);

    root.addEventListener('click', event => {
      const tab = tabFromEvent(event, root);
      if (!tab) return;
      if (event.target.closest?.('.jt-x')) return;
      if (Date.now() - lastDragEndAt < 280) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      writeUi(tab.dataset.key, false, 'tab-focus');
    }, true);

    root.addEventListener('dblclick', event => {
      const tab = tabFromEvent(event, root);
      if (!tab) return;
      if (event.target.closest?.('.jt-x')) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      writeUi(tab.dataset.key, true, 'tab-focus-open');
    }, true);

    observer = new MutationObserver(() => {
      refreshHints(root);
      detectContextSwitch(root);
    });
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

    refreshHints(root);
    detectContextSwitch(root);
    return true;
  }

  if (!document.getElementById('ussign-job-timer-ui-v109')) {
    const style = document.createElement('style');
    style.id = 'ussign-job-timer-ui-v109';
    style.textContent = `
#${ROOT_ID} .jt-tab[data-key]{cursor:grab!important}
#${ROOT_ID} .jt-tab[data-key]:active{cursor:grabbing!important}
#${ROOT_ID} .jt-x{
  width:18px!important;height:18px!important;min-width:18px!important;min-height:18px!important;
  flex:0 0 18px!important;display:grid!important;place-items:center!important;
  padding:0!important;margin:0!important;border:0!important;border-radius:7px!important;
  background:rgba(255,255,255,.035)!important;color:transparent!important;font-size:0!important;
  line-height:0!important;overflow:hidden!important;position:relative!important;
}
#${ROOT_ID} .jt-x::before{
  content:"";position:absolute!important;left:50%!important;top:50%!important;
  width:9px!important;height:1.4px!important;border-radius:999px!important;
  background:rgba(225,230,236,.64)!important;transform:translate(-50%,-50%) rotate(45deg)!important;
  transform-origin:center!important;
}
#${ROOT_ID} .jt-x::after{
  content:"";position:absolute!important;left:50%!important;top:50%!important;
  width:9px!important;height:1.4px!important;border-radius:999px!important;
  background:rgba(225,230,236,.64)!important;transform:translate(-50%,-50%) rotate(-45deg)!important;
  transform-origin:center!important;
}
#${ROOT_ID} .jt-x:hover{background:rgba(255,255,255,.08)!important}
#${ROOT_ID} .jt-x:hover::before,#${ROOT_ID} .jt-x:hover::after{background:#fff!important}
`;
    document.documentElement.appendChild(style);
  }

  let tries = 0;
  const wait = setInterval(() => {
    const root = document.getElementById(ROOT_ID);
    if ((root && install(root)) || ++tries >= 80) clearInterval(wait);
  }, 125);
})();
