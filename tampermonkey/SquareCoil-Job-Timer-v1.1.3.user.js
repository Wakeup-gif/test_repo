// ==UserScript==
// @name         SquareCoil Job Timer Manager
// @namespace    us-sign-squarecoil-tools
// @version      1.1.3
// @description  SquareCoil Job Timer v1.1.2 with geometry-centered close and collapse controls.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-end
// @grant        none
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/6b8c3b7d8a0c9f40ae35a0e8fdd8e881e2925a22/tampermonkey/SquareCoil-Job-Timer-v1.1.2.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// ==/UserScript==

(() => {
  'use strict';

  const ROOT_ID = 'ussign-job-timer';
  const STYLE_ID = 'ussign-job-timer-v113-control-centering';

  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
#${ROOT_ID} .jt-x {
  position: relative !important;
  display: block !important;
  width: 20px !important;
  height: 20px !important;
  min-width: 20px !important;
  min-height: 20px !important;
  flex: 0 0 20px !important;
  padding: 0 !important;
  margin: 0 !important;
  line-height: 0 !important;
  text-align: center !important;
  overflow: hidden !important;
}

#${ROOT_ID} .jt-x svg {
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  width: 10px !important;
  height: 10px !important;
  margin: 0 !important;
  display: block !important;
  transform: translate(-50%, -50%) !important;
  transform-origin: center !important;
  pointer-events: none !important;
  overflow: visible !important;
}

#${ROOT_ID} .jt-x path {
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 1.7 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
  vector-effect: non-scaling-stroke !important;
}

#${ROOT_ID} header > button {
  display: grid !important;
  place-items: center !important;
  padding: 0 !important;
  line-height: 0 !important;
  text-align: center !important;
}

#${ROOT_ID} header > button[data-action="collapse"] {
  position: relative !important;
  font-size: 0 !important;
  color: transparent !important;
  overflow: hidden !important;
}

#${ROOT_ID} header > button[data-action="collapse"]::before {
  content: "" !important;
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  width: 7px !important;
  height: 7px !important;
  box-sizing: border-box !important;
  border-style: solid !important;
  border-color: rgba(235,239,244,.78) !important;
  border-width: 0 1.6px 1.6px 0 !important;
  transform: translate(-50%, -64%) rotate(45deg) !important;
  transform-origin: center !important;
  pointer-events: none !important;
}

#${ROOT_ID}.jt-collapsed header > button[data-action="collapse"]::before {
  transform: translate(-50%, -36%) rotate(-135deg) !important;
}

#${ROOT_ID} header > button[data-action="collapse"]:hover::before {
  border-color: rgba(255,255,255,.96) !important;
}
`;

  document.documentElement.appendChild(style);
})();
