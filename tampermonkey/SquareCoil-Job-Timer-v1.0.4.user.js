// ==UserScript==
// @name         SquareCoil Job Timer Manager
// @namespace    us-sign-squarecoil-tools
// @version      1.0.4
// @description  Job Timer v1.0.3 with SquareCoil-matched live glass styling and cleaner product copy.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-end
// @grant        none
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/82cc8d7c86bfe8d0175f21f1427e878185c140ca/tampermonkey/SquareCoil-Job-Timer-v1.0.0.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/13914a24592e255739fa1d67bae5cdc6d6cb8a89/tampermonkey/SquareCoil-Job-Timer-v1.0.1.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/b3626c03fd05ab514233a668d02df18896bc338c/tampermonkey/SquareCoil-Job-Timer-v1.0.2.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/80b36561fe492edb205cecb585315077ea0dfc3a/tampermonkey/SquareCoil-Job-Timer-v1.0.3.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// ==/UserScript==

(() => {
  'use strict';

  const VERSION = '1.0.4';
  const ROOT_ID = 'ussign-job-timer';
  const STORAGE_KEY = 'ussign-squarecoil-job-timer-v1';
  let observer = null;
  let raf = 0;

  window.__squareCoilJobTimerUiVersion = VERSION;

  function loadState() {
    try {
      const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return state && typeof state === 'object' ? state : null;
    } catch (_) {
      return null;
    }
  }

  function clock(ms) {
    const total = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function friendlyReason(raw) {
    const key = String(raw || '').trim().toLowerCase();
    const map = {
      'switched-context': 'Switched jobs',
      'clocked-out-completely': 'Clocked out',
      'clocked-out': 'Clocked out',
      'left-job-context': 'Switched jobs',
      'paused': 'Paused'
    };
    return map[key] || String(raw || 'Paused').replace(/[-_]+/g, ' ').replace(/^./, c => c.toUpperCase());
  }

  function cleanStatus(root) {
    const badge = root.querySelector('.jt-main-head em');
    if (!badge) return;

    const raw = badge.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
    let label = 'Paused';
    let state = 'paused';

    if (raw.includes('running')) {
      label = 'Running';
      state = 'running';
    } else if (raw.includes('resume')) {
      label = 'Resume';
      state = 'resume';
    } else if (raw.includes('clocked out')) {
      label = 'Clocked out';
      state = 'clocked-out';
    }

    if (badge.textContent !== label) badge.textContent = label;
    badge.dataset.timerState = state;
  }

  function cleanResume(root, state) {
    const resume = root.querySelector('.jt-resume');
    if (!resume) return;

    const span = resume.querySelector(':scope > span');
    const pendingKey = state?.pending?.key;
    const context = pendingKey ? state?.contexts?.[pendingKey] : null;

    if (span && context) {
      const text = `Saved time ${clock(context.accumulatedMs)}`;
      if (span.textContent !== text) span.textContent = text;
    }
  }

  function cleanSettings(root) {
    const settings = root.querySelector('.jt-settings');
    if (!settings) return;

    settings.querySelectorAll('.jt-archive-section').forEach(section => {
      const heading = section.querySelector(':scope > h5');
      if (!heading) return;

      if (/hidden recent tabs/i.test(heading.textContent)) heading.textContent = 'Hidden tabs';
      if (/recent history/i.test(heading.textContent)) heading.textContent = 'History';

      if (/history/i.test(heading.textContent)) {
        section.querySelectorAll('.jt-row').forEach(row => {
          const title = row.querySelector('b');
          const meta = row.querySelector('small');

          if (title) {
            const parts = title.textContent.split('·');
            if (parts.length > 1) {
              const reason = friendlyReason(parts.pop());
              title.textContent = `${parts.join('·').trim()} · ${reason}`;
            }
          }

          if (meta) {
            meta.textContent = meta.textContent.replace(/\s*·\s*(detected|exact)\s*$/i, '').trim();
          }
        });
      }
    });

    settings.querySelectorAll('.jt-archive-empty').forEach(el => {
      if (/No hidden recent tabs/i.test(el.textContent)) el.textContent = 'No hidden tabs.';
      if (/No completed timer segments/i.test(el.textContent)) el.textContent = 'No history yet.';
    });

    const clearAll = settings.querySelector('[data-action="clear-all"]');
    if (clearAll && clearAll.textContent !== 'Clear all') clearAll.textContent = 'Clear all';
  }

  function cleanCopy() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return false;

    const state = loadState();
    root.dataset.uiVersion = VERSION;

    cleanStatus(root);
    cleanResume(root, state);
    cleanSettings(root);

    const empty = root.querySelector('.jt-empty');
    if (empty && empty.textContent !== 'No recent timers.') empty.textContent = 'No recent timers.';

    return true;
  }

  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(cleanCopy);
  }

  function watch() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return false;

    observer?.disconnect();
    observer = new MutationObserver(() => schedule());
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    schedule();
    return true;
  }

  function injectStyle() {
    if (document.getElementById('ussign-job-timer-ui-v104')) return;

    const style = document.createElement('style');
    style.id = 'ussign-job-timer-ui-v104';
    style.textContent = `
#${ROOT_ID}{
  --jt-glass:var(--us-glass,rgba(10,10,13,.55));
  --jt-glass-soft:var(--us-glass-soft,rgba(10,10,13,.46));
  --jt-glass-strong:var(--us-glass-strong,rgba(10,10,13,.64));
  --jt-line:var(--us-line,rgba(255,255,255,.08));
  --jt-text:var(--us-text,#eef1f5);
  --jt-text-soft:var(--us-text-soft,rgba(218,223,230,.78));
  color:var(--jt-text)!important;
  font-family:var(--us-font,"Manrope","Segoe UI",Arial,sans-serif)!important;
}
#${ROOT_ID} .jt-shell{
  border:1px solid var(--jt-line)!important;
  border-radius:14px!important;
  background:
    linear-gradient(180deg,rgba(255,255,255,.022),rgba(255,255,255,.003)),
    var(--jt-glass)!important;
  box-shadow:0 14px 38px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.025)!important;
  -webkit-backdrop-filter:blur(18px) saturate(114%) brightness(91%)!important;
  backdrop-filter:blur(18px) saturate(114%) brightness(91%)!important;
}
#${ROOT_ID} .jt-shell>header{
  min-height:52px!important;
  padding:8px 10px 8px 14px!important;
  border-bottom:1px solid rgba(255,255,255,.065)!important;
  background:transparent!important;
}
#${ROOT_ID}.jt-collapsed .jt-shell>header{min-height:54px!important}
#${ROOT_ID} .jt-brand{
  gap:9px!important;
  color:rgba(235,239,244,.88)!important;
  font-size:12.5px!important;
  font-weight:650!important;
}
#${ROOT_ID} .jt-brand>i{
  position:relative;
  width:14px!important;
  height:14px!important;
  flex:0 0 14px;
  border:2px solid rgba(113,177,229,.90);
  border-radius:50%;
  color:transparent!important;
  font-size:0!important;
  box-sizing:border-box;
}
#${ROOT_ID} .jt-brand>i::before{
  content:"";
  position:absolute;
  left:4px;
  top:-5px;
  width:3px;
  height:3px;
  border-radius:1px;
  background:rgba(113,177,229,.90);
}
#${ROOT_ID} .jt-brand>i::after{
  content:"";
  position:absolute;
  left:5px;
  top:2px;
  width:1px;
  height:5px;
  background:rgba(113,177,229,.90);
  transform-origin:bottom center;
  transform:rotate(18deg);
}
#${ROOT_ID} .jt-head-context{
  color:rgba(242,245,248,.90)!important;
  font-size:12px!important;
  font-weight:650!important;
}
#${ROOT_ID} .jt-head-v102>[data-role="compact-time"]{
  color:rgba(245,247,249,.94)!important;
  font:700 14px/1 var(--us-font,"Manrope","Segoe UI",sans-serif)!important;
  letter-spacing:-.01em!important;
}
#${ROOT_ID} .jt-shell>header>button{
  width:33px!important;
  height:33px!important;
  flex:0 0 33px!important;
  border:1px solid rgba(255,255,255,.075)!important;
  border-radius:9px!important;
  background:rgba(255,255,255,.035)!important;
  color:rgba(235,239,244,.76)!important;
  box-shadow:none!important;
}
#${ROOT_ID} .jt-shell>header>button:hover{
  background:rgba(255,255,255,.075)!important;
  border-color:rgba(255,255,255,.11)!important;
  color:#fff!important;
}

/* Tabs use the same restrained glass language as the page while preserving time color. */
#${ROOT_ID} .jt-tab{
  background:
    linear-gradient(180deg,rgba(var(--tc),.065),rgba(var(--tc),.012)),
    var(--jt-glass-soft)!important;
  border-color:rgba(var(--tc),.18)!important;
  border-bottom-color:rgba(255,255,255,.055)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.018)!important;
}
#${ROOT_ID} .jt-tab:hover{
  background:
    linear-gradient(180deg,rgba(var(--tc),.095),rgba(var(--tc),.018)),
    var(--jt-glass-strong)!important;
  border-color:rgba(var(--tc),.28)!important;
}
#${ROOT_ID} .jt-tab.jt-selected{
  background:
    linear-gradient(180deg,rgba(var(--tc),.085),rgba(var(--tc),.015)),
    var(--jt-glass-strong)!important;
  border-color:rgba(var(--tc),.28)!important;
  border-bottom-color:rgba(10,10,13,.72)!important;
  box-shadow:0 -5px 14px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.025)!important;
}
#${ROOT_ID} .jt-tab.jt-active::before{display:none!important}
#${ROOT_ID} .jt-tab-dot{
  width:6px!important;
  height:6px!important;
  flex-basis:6px!important;
  box-shadow:0 0 0 3px rgba(var(--tc),.085)!important;
}
#${ROOT_ID} .jt-tab>span{
  color:inherit!important;
  font-size:11px!important;
  font-weight:650!important;
}
#${ROOT_ID} .jt-tab-time{
  color:rgba(var(--tc),.82)!important;
  font:650 10px/1 var(--us-font,"Manrope","Segoe UI",sans-serif)!important;
  letter-spacing:0!important;
}
#${ROOT_ID} .jt-x{
  color:rgba(225,230,236,.45)!important;
}

/* Main timer surface now follows the same panel hierarchy as SquareCoil. */
#${ROOT_ID} section{padding:10px!important}
#${ROOT_ID} .jt-main,
#${ROOT_ID} .jt-empty{
  border:1px solid rgba(255,255,255,.065)!important;
  border-radius:12px!important;
  background:rgba(255,255,255,.016)!important;
  box-shadow:none!important;
}
#${ROOT_ID} .jt-main{padding:14px 14px 13px!important}
#${ROOT_ID} .jt-main-head b{
  color:rgba(242,245,248,.92)!important;
  font-size:12.5px!important;
  font-weight:650!important;
}
#${ROOT_ID} .jt-main-head span{
  margin-top:2px!important;
  color:rgba(210,216,224,.63)!important;
  font-size:11.5px!important;
}
#${ROOT_ID} .jt-main-head em{
  padding:5px 8px!important;
  border:1px solid rgba(255,255,255,.065)!important;
  border-radius:8px!important;
  background:rgba(255,255,255,.025)!important;
  color:rgba(215,221,229,.64)!important;
  font-size:9px!important;
  font-weight:700!important;
  letter-spacing:.02em!important;
}
#${ROOT_ID} .jt-main-head em[data-timer-state="running"]{
  border-color:rgba(80,151,205,.20)!important;
  background:rgba(80,151,205,.09)!important;
  color:rgba(184,217,242,.88)!important;
}
#${ROOT_ID} .jt-main-head em[data-timer-state="resume"]{
  border-color:rgba(217,185,105,.18)!important;
  background:rgba(217,185,105,.07)!important;
  color:rgba(232,207,149,.88)!important;
}
#${ROOT_ID} .jt-main>strong{
  margin-top:11px!important;
  color:rgba(247,249,251,.96)!important;
  font-family:var(--us-display-font,var(--us-font,"Manrope","Segoe UI",sans-serif))!important;
  font-size:34px!important;
  font-weight:650!important;
  line-height:1!important;
  letter-spacing:-.035em!important;
}
#${ROOT_ID} .jt-main>small{display:none!important}

/* Resume prompt stays functional but no longer reads like debug copy. */
#${ROOT_ID} .jt-resume{
  margin-bottom:8px!important;
  padding:9px 10px!important;
  border:1px solid rgba(217,185,105,.14)!important;
  border-radius:10px!important;
  background:rgba(217,185,105,.05)!important;
}
#${ROOT_ID} .jt-resume>b{color:rgba(246,240,226,.94)!important;font-size:11.5px!important}
#${ROOT_ID} .jt-resume>span{margin-top:2px!important;color:rgba(219,209,187,.62)!important;font-size:10.5px!important}

/* Settings uses the same light nested surfaces and controls as the main project UI. */
#${ROOT_ID} .jt-settings{
  margin-top:9px!important;
  border:1px solid rgba(255,255,255,.065)!important;
  border-radius:12px!important;
  background:var(--jt-glass-soft)!important;
  box-shadow:none!important;
}
#${ROOT_ID} .jt-settings>h4{
  padding:11px 11px 7px!important;
  color:rgba(239,242,246,.90)!important;
  font-size:11.5px!important;
  font-weight:650!important;
}
#${ROOT_ID} .jt-settings>.jt-thresholds{padding:0 11px 11px!important}
#${ROOT_ID} .jt-thresholds{gap:7px!important}
#${ROOT_ID} .jt-thresholds label{
  color:rgba(207,213,221,.60)!important;
  font-size:9.5px!important;
  font-weight:550!important;
}
#${ROOT_ID} .jt-thresholds input{
  height:32px!important;
  margin-top:4px!important;
  padding:5px 8px!important;
  border:1px solid rgba(255,255,255,.07)!important;
  border-radius:8px!important;
  background:rgba(255,255,255,.025)!important;
  color:rgba(240,243,247,.90)!important;
  box-shadow:none!important;
}
#${ROOT_ID} .jt-thresholds input:focus{
  border-color:rgba(103,169,218,.28)!important;
  box-shadow:0 0 0 3px rgba(103,169,218,.055)!important;
  outline:none!important;
}
#${ROOT_ID} .jt-archive-scroll{
  border-color:rgba(255,255,255,.05)!important;
  background:transparent!important;
}
#${ROOT_ID} .jt-archive-section h5{
  background:linear-gradient(180deg,rgba(10,10,13,.90) 70%,rgba(10,10,13,.68))!important;
  color:rgba(223,228,234,.68)!important;
  font-size:9px!important;
  font-weight:700!important;
  letter-spacing:.065em!important;
}
#${ROOT_ID} .jt-row{
  padding:7px 8px!important;
  border:1px solid rgba(255,255,255,.05)!important;
  border-radius:8px!important;
  background:rgba(255,255,255,.015)!important;
}
#${ROOT_ID} .jt-row b{
  color:rgba(229,233,238,.82)!important;
  font-size:10.5px!important;
  font-weight:600!important;
}
#${ROOT_ID} .jt-row small{
  color:rgba(198,205,214,.47)!important;
  font-size:9.5px!important;
}
#${ROOT_ID} .jt-row code{
  color:rgba(224,229,235,.68)!important;
  background:transparent!important;
}
#${ROOT_ID} .jt-settings>.jt-actions{
  padding:9px 11px 11px!important;
  background:transparent!important;
}
#${ROOT_ID} .jt-btn{
  min-height:31px!important;
  padding:6px 10px!important;
  border:1px solid rgba(255,255,255,.07)!important;
  border-radius:8px!important;
  background:rgba(255,255,255,.035)!important;
  color:rgba(237,240,244,.84)!important;
  box-shadow:none!important;
  font-size:10.5px!important;
  font-weight:600!important;
}
#${ROOT_ID} .jt-btn:hover{
  background:rgba(255,255,255,.07)!important;
  border-color:rgba(255,255,255,.10)!important;
  color:#fff!important;
}
#${ROOT_ID} .jt-danger{
  border-color:rgba(206,115,115,.12)!important;
  background:rgba(206,115,115,.035)!important;
  color:rgba(237,196,196,.78)!important;
}

@media(max-width:640px){
  #${ROOT_ID} .jt-main>strong{font-size:31px!important}
  #${ROOT_ID} .jt-shell{-webkit-backdrop-filter:blur(14px) saturate(112%) brightness(92%)!important;backdrop-filter:blur(14px) saturate(112%) brightness(92%)!important}
}
`;

    document.documentElement.appendChild(style);
  }

  injectStyle();

  let tries = 0;
  const wait = setInterval(() => {
    if (watch() || ++tries >= 60) clearInterval(wait);
  }, 150);

  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY) schedule();
  });
})();
