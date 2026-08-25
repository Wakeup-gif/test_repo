// ==UserScript==
// @name         SquareCoil Job Timer Manager
// @namespace    us-sign-squarecoil-tools
// @version      1.0.5
// @description  Job Timer v1.0.4 with a softer rounded collapsed shell and darker frosted inactive tabs.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-end
// @grant        none
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/82cc8d7c86bfe8d0175f21f1427e878185c140ca/tampermonkey/SquareCoil-Job-Timer-v1.0.0.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/13914a24592e255739fa1d67bae5cdc6d6cb8a89/tampermonkey/SquareCoil-Job-Timer-v1.0.1.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/b3626c03fd05ab514233a668d02df18896bc338c/tampermonkey/SquareCoil-Job-Timer-v1.0.2.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/80b36561fe492edb205cecb585315077ea0dfc3a/tampermonkey/SquareCoil-Job-Timer-v1.0.3.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/8a310be6524e4478d9d00f81cb3e2a19001d3abd/tampermonkey/SquareCoil-Job-Timer-v1.0.4.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// ==/UserScript==

(() => {
  'use strict';

  const VERSION = '1.0.5';
  const ROOT_ID = 'ussign-job-timer';
  window.__squareCoilJobTimerUiVersion = VERSION;

  if (document.getElementById('ussign-job-timer-ui-v105')) return;

  const style = document.createElement('style');
  style.id = 'ussign-job-timer-ui-v105';
  style.textContent = `
/* Softer compact shell when collapsed */
#${ROOT_ID}.jt-collapsed .jt-shell{
  border-radius:18px!important;
  overflow:visible!important;
  border:1px solid rgba(255,255,255,.085)!important;
  background:
    linear-gradient(180deg,rgba(255,255,255,.028),rgba(255,255,255,.004)),
    rgba(15,16,20,.66)!important;
  box-shadow:
    0 14px 34px rgba(0,0,0,.20),
    inset 0 1px 0 rgba(255,255,255,.03)!important;
  -webkit-backdrop-filter:blur(20px) saturate(116%) brightness(92%)!important;
  backdrop-filter:blur(20px) saturate(116%) brightness(92%)!important;
}
#${ROOT_ID}.jt-collapsed .jt-shell>header{
  min-height:50px!important;
  padding:7px 9px 7px 14px!important;
  border:0!important;
  border-radius:18px!important;
  background:transparent!important;
}
#${ROOT_ID}.jt-collapsed .jt-shell>header>button{
  width:34px!important;
  height:34px!important;
  flex-basis:34px!important;
  border-radius:11px!important;
  background:rgba(255,255,255,.045)!important;
  border-color:rgba(255,255,255,.085)!important;
}
#${ROOT_ID}.jt-collapsed .jt-shell>header>button:hover{
  background:rgba(255,255,255,.085)!important;
}

/* Inactive tabs should read as real frosted dark glass, not transparent cards */
#${ROOT_ID} .jt-tab:not(.jt-selected){
  background:
    linear-gradient(180deg,rgba(var(--tc),.055),rgba(var(--tc),.012)),
    rgba(16,17,22,.74)!important;
  border:1px solid rgba(255,255,255,.07)!important;
  border-color:rgba(var(--tc),.16)!important;
  border-bottom-color:rgba(255,255,255,.055)!important;
  box-shadow:
    0 6px 16px rgba(0,0,0,.14),
    inset 0 1px 0 rgba(255,255,255,.02)!important;
  -webkit-backdrop-filter:blur(16px) saturate(114%) brightness(90%)!important;
  backdrop-filter:blur(16px) saturate(114%) brightness(90%)!important;
}
#${ROOT_ID} .jt-tab:not(.jt-selected):hover{
  background:
    linear-gradient(180deg,rgba(var(--tc),.09),rgba(var(--tc),.018)),
    rgba(18,19,24,.82)!important;
  border-color:rgba(var(--tc),.24)!important;
}

/* Selected tab stays darker and more substantial while still glassy */
#${ROOT_ID} .jt-tab.jt-selected{
  background:
    linear-gradient(180deg,rgba(var(--tc),.085),rgba(var(--tc),.018)),
    rgba(19,20,26,.84)!important;
  border-color:rgba(var(--tc),.27)!important;
  border-bottom-color:rgba(15,16,20,.84)!important;
  box-shadow:
    0 -4px 14px rgba(0,0,0,.12),
    inset 0 1px 0 rgba(255,255,255,.03)!important;
  -webkit-backdrop-filter:blur(17px) saturate(115%) brightness(92%)!important;
  backdrop-filter:blur(17px) saturate(115%) brightness(92%)!important;
}

/* Softer close control */
#${ROOT_ID} .jt-x{
  width:19px!important;
  height:19px!important;
  flex-basis:19px!important;
  border-radius:7px!important;
  background:rgba(255,255,255,.025)!important;
  color:rgba(229,233,239,.48)!important;
}
#${ROOT_ID} .jt-x:hover{
  background:rgba(255,255,255,.085)!important;
  color:#fff!important;
}

/* Keep the top tab row cohesive while collapsed */
#${ROOT_ID}.jt-collapsed .jt-tabs{
  filter:none!important;
}
#${ROOT_ID}.jt-collapsed .jt-tab:not(.jt-selected){
  background:
    linear-gradient(180deg,rgba(var(--tc),.05),rgba(var(--tc),.01)),
    rgba(14,15,20,.78)!important;
}

@media(max-width:640px){
  #${ROOT_ID}.jt-collapsed .jt-shell{border-radius:16px!important}
  #${ROOT_ID}.jt-collapsed .jt-shell>header{border-radius:16px!important}
}
`;

  document.documentElement.appendChild(style);
})();
