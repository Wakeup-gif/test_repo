// ==UserScript==
// @name         SquareCoil Job Timer Manager
// @namespace    us-sign-squarecoil-tools
// @version      1.1.4
// @description  SquareCoil Job Timer with centered close control and explicit minimize/reopen state icon.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-end
// @grant        none
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/6b8c3b7d8a0c9f40ae35a0e8fdd8e881e2925a22/tampermonkey/SquareCoil-Job-Timer-v1.1.2.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/5740c14d47f9fc7aae9fee541c915ddbf97c60e6/tampermonkey/SquareCoil-Job-Timer-v1.1.3.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// ==/UserScript==

(() => {
  'use strict';

  const ROOT_ID = 'ussign-job-timer';
  const STYLE_ID = 'ussign-job-timer-v114-state-control';

  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
#${ROOT_ID} header > button[data-action="collapse"] {
  position: relative !important;
  display: block !important;
  padding: 0 !important;
  line-height: 0 !important;
  font-size: 0 !important;
  color: transparent !important;
  overflow: hidden !important;
}

/* Expanded state: clear centered minus */
#${ROOT_ID}:not(.jt-collapsed) header > button[data-action="collapse"]::before {
  content: "" !important;
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  width: 11px !important;
  height: 1.8px !important;
  border: 0 !important;
  border-radius: 999px !important;
  background: rgba(235,239,244,.82) !important;
  transform: translate(-50%, -50%) !important;
  transform-origin: center !important;
  pointer-events: none !important;
}

#${ROOT_ID}:not(.jt-collapsed) header > button[data-action="collapse"]::after {
  content: none !important;
}

/* Collapsed state: centered up chevron to reopen */
#${ROOT_ID}.jt-collapsed header > button[data-action="collapse"]::before,
#${ROOT_ID}.jt-collapsed header > button[data-action="collapse"]::after {
  content: "" !important;
  position: absolute !important;
  top: 50% !important;
  width: 7px !important;
  height: 1.8px !important;
  border: 0 !important;
  border-radius: 999px !important;
  background: rgba(235,239,244,.82) !important;
  pointer-events: none !important;
}

#${ROOT_ID}.jt-collapsed header > button[data-action="collapse"]::before {
  left: 50% !important;
  transform-origin: right center !important;
  transform: translate(-100%, 1px) rotate(-42deg) !important;
}

#${ROOT_ID}.jt-collapsed header > button[data-action="collapse"]::after {
  left: 50% !important;
  transform-origin: left center !important;
  transform: translate(0, 1px) rotate(42deg) !important;
}

#${ROOT_ID} header > button[data-action="collapse"]:hover::before,
#${ROOT_ID} header > button[data-action="collapse"]:hover::after {
  background: rgba(255,255,255,.98) !important;
}
`;

  document.documentElement.appendChild(style);
})();
