// ==UserScript==
// @name         SquareCoil Job Timer Manager
// @namespace    us-sign-squarecoil-tools
// @version      1.0.7
// @description  Job Timer v1.0.5 with click-to-focus tabs, drag-safe reordering, and centered close controls.
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

  const VERSION = '1.0.7';
  const ROOT_ID = 'ussign-job-timer';
  let lastDragEndAt = 0;
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
      const label = (tab.getAttribute('title') || tab.dataset.key || 'Timer')
        .replace(/\s*[•·]\s*(Double-click|Click) to view.*$/i, '')
        .trim();
      tab.setAttribute('title', `${label} • Click to view • Drag to reorder`);
      tab.dataset.selectMode = 'click';
    });
  }

  function install(root) {
    if (root.dataset.clickFocusReady === '1') return true;
    root.dataset.clickFocusReady = '1';

    root.addEventListener('dragend', event => {
      if (!tabFromEvent(event, root)) return;
      lastDragEndAt = Date.now();
    }, true);

    root.addEventListener('click', event => {
      const tab = tabFromEvent(event, root);
      if (!tab) return;
      if (event.target.closest?.('.jt-x')) return;

      // Let the proven v1.0.0 bubble handler select the tab on a normal click.
      // Only suppress the synthetic/release click that can occur right after drag.
      if (Date.now() - lastDragEndAt < 260) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    observer = new MutationObserver(() => refreshHints(root));
    observer.observe(root, { childList: true, subtree: true });
    refreshHints(root);
    return true;
  }

  if (!document.getElementById('ussign-job-timer-ui-v107')) {
    const style = document.createElement('style');
    style.id = 'ussign-job-timer-ui-v107';
    style.textContent = `
#${ROOT_ID} .jt-tab[data-key]{
  cursor:grab!important;
}
#${ROOT_ID} .jt-tab[data-key]:active{
  cursor:grabbing!important;
}
#${ROOT_ID} .jt-tab.jt-selected{
  outline:1px solid rgba(var(--tc),.10)!important;
  outline-offset:-2px!important;
}
#${ROOT_ID} .jt-x{
  width:18px!important;
  height:18px!important;
  min-width:18px!important;
  min-height:18px!important;
  flex:0 0 18px!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  padding:0!important;
  margin:0!important;
  border:0!important;
  border-radius:7px!important;
  line-height:1!important;
  font-family:Arial,sans-serif!important;
  font-size:13px!important;
  font-weight:400!important;
  text-align:center!important;
  vertical-align:middle!important;
  transform:none!important;
  appearance:none!important;
  -webkit-appearance:none!important;
}
#${ROOT_ID} .jt-x:hover{
  background:rgba(255,255,255,.075)!important;
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
