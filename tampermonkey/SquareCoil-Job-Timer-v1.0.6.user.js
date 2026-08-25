// ==UserScript==
// @name         SquareCoil Job Timer Manager
// @namespace    us-sign-squarecoil-tools
// @version      1.0.6
// @description  Job Timer v1.0.5 with drag-safe double-click tab selection.
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

  const VERSION = '1.0.6';
  const ROOT_ID = 'ussign-job-timer';
  let allowBaseSelect = false;
  let observer = null;

  window.__squareCoilJobTimerUiVersion = VERSION;
  window.__squareCoilJobTimerInteractionVersion = VERSION;

  function tabFromEvent(event, root) {
    const target = event.target instanceof Element ? event.target : null;
    const tab = target?.closest?.('.jt-tab[data-key]');
    return tab && root.contains(tab) ? tab : null;
  }

  function refreshHints(root) {
    root.querySelectorAll('.jt-tab[data-key]').forEach(tab => {
      const label = tab.getAttribute('title') || tab.dataset.key || 'Timer';
      const clean = label.replace(/\s*•\s*Double-click to view.*$/i, '').trim();
      tab.setAttribute('title', `${clean} • Double-click to view • Drag to reorder`);
      tab.dataset.selectMode = 'double-click';
    });
  }

  function install(root) {
    if (root.dataset.doubleClickSelectReady === '1') return true;
    root.dataset.doubleClickSelectReady = '1';

    root.addEventListener('click', event => {
      const tab = tabFromEvent(event, root);
      if (!tab) return;
      if (event.target.closest?.('.jt-x')) return;
      if (allowBaseSelect) return;

      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);

    root.addEventListener('dblclick', event => {
      const tab = tabFromEvent(event, root);
      if (!tab) return;
      if (event.target.closest?.('.jt-x')) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      allowBaseSelect = true;
      try {
        tab.click();
      } finally {
        allowBaseSelect = false;
      }

      tab.classList.remove('jt-double-selected');
      void tab.offsetWidth;
      tab.classList.add('jt-double-selected');
      setTimeout(() => tab.classList.remove('jt-double-selected'), 260);
    }, true);

    observer = new MutationObserver(() => refreshHints(root));
    observer.observe(root, { childList: true, subtree: true });
    refreshHints(root);
    return true;
  }

  if (!document.getElementById('ussign-job-timer-ui-v106')) {
    const style = document.createElement('style');
    style.id = 'ussign-job-timer-ui-v106';
    style.textContent = `
#${ROOT_ID} .jt-tab[data-key]{
  cursor:grab!important;
}
#${ROOT_ID} .jt-tab[data-key]:active{
  cursor:grabbing!important;
}
#${ROOT_ID} .jt-tab.jt-double-selected{
  animation:jtDoubleSelectFlash 240ms ease-out;
}
@keyframes jtDoubleSelectFlash{
  0%{box-shadow:0 0 0 0 rgba(var(--tc),.28),inset 0 1px 0 rgba(255,255,255,.03)}
  100%{box-shadow:0 0 0 5px rgba(var(--tc),0),inset 0 1px 0 rgba(255,255,255,.03)}
}
`;
    document.documentElement.appendChild(style);
  }

  let tries = 0;
  const wait = setInterval(() => {
    const root = document.getElementById(ROOT_ID);
    if ((root && install(root)) || ++tries >= 80) clearInterval(wait);
  }, 125);
})();
