// ==UserScript==
// @name         SquareCoil Job Timer Manager
// @namespace    us-sign-squarecoil-tools
// @version      1.0.1
// @description  SquareCoil Job Timer v1.0.0 logic with Chrome-style recent-job tabs and one shared scrollable settings archive.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-end
// @grant        none
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/82cc8d7c86bfe8d0175f21f1427e878185c140ca/tampermonkey/SquareCoil-Job-Timer-v1.0.0.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// ==/UserScript==

(() => {
  'use strict';

  const UI_VERSION = '1.0.1';
  const ROOT_ID = 'ussign-job-timer';
  const STORAGE_KEY = 'ussign-squarecoil-job-timer-v1';
  const MAX_ARCHIVE_ROWS = 200;
  let observer = null;
  let raf = 0;

  window.__squareCoilJobTimerUiVersion = UI_VERSION;

  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  }

  function fmt(ms) {
    const t = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m ${String(s).padStart(2, '0')}s`;
  }

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return raw && typeof raw === 'object' ? raw : null;
    } catch (_) {
      return null;
    }
  }

  function archiveHtml(state) {
    if (!state) return '';
    const contexts = state.contexts && typeof state.contexts === 'object' ? state.contexts : {};
    const hiddenKeys = Array.isArray(state.ui?.hiddenKeys) ? state.ui.hiddenKeys : [];

    const hidden = hiddenKeys
      .map(k => contexts[k])
      .filter(Boolean)
      .sort((a,b) => (b.lastTouchedAt || 0) - (a.lastTouchedAt || 0));

    const history = [];
    for (const c of Object.values(contexts)) {
      for (const s of Array.isArray(c.sessions) ? c.sessions : []) history.push({ c, s });
    }
    history.sort((a,b) => (b.s.endAt || 0) - (a.s.endAt || 0));

    const hiddenRows = hidden.length
      ? hidden.map(c => `<div class="jt-row"><div><b>${esc(c.shortLabel || c.projectId || c.label)} · ${esc(c.label || '')}</b><small>Saved ${esc(fmt(c.accumulatedMs))}</small></div><button class="jt-btn" data-action="restore" data-key="${esc(c.key)}">Show</button></div>`).join('')
      : '<small class="jt-archive-empty">No hidden recent tabs.</small>';

    const historyRows = history.length
      ? history.slice(0, MAX_ARCHIVE_ROWS).map(({c,s}) => {
          const when = new Date(s.endAt || Date.now()).toLocaleString([], { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' });
          const certainty = s.certainty === 'detected' ? 'detected' : 'exact';
          return `<div class="jt-row"><div><b>${esc(c.shortLabel || c.projectId || c.label)} · ${esc(s.reason || 'paused')}</b><small>${esc(when)} · ${esc(certainty)}</small></div><code>${esc(fmt(s.durationMs))}</code></div>`;
        }).join('')
      : '<small class="jt-archive-empty">No completed timer segments yet.</small>';

    const capped = history.length > MAX_ARCHIVE_ROWS
      ? `<small class="jt-archive-cap">Showing newest ${MAX_ARCHIVE_ROWS} of ${history.length} history entries.</small>`
      : '';

    return `<div class="jt-archive-section"><h5>Hidden recent tabs</h5>${hiddenRows}</div><div class="jt-archive-section"><h5>Recent history</h5>${historyRows}${capped}</div>`;
  }

  function refineSettings(root, state) {
    const settings = root.querySelector('.jt-settings');
    if (!settings) return;

    const rev = String(state?.rev ?? '0');
    let archive = settings.querySelector(':scope > .jt-archive-scroll');

    if (!archive) {
      const actions = settings.querySelector(':scope > .jt-actions');
      const thresholds = settings.querySelector(':scope > .jt-thresholds');
      if (!actions || !thresholds) return;

      let node = thresholds.nextSibling;
      const remove = [];
      while (node && node !== actions) {
        const next = node.nextSibling;
        remove.push(node);
        node = next;
      }
      remove.forEach(n => n.remove());

      archive = document.createElement('div');
      archive.className = 'jt-archive-scroll';
      settings.insertBefore(archive, actions);
    }

    if (archive.dataset.rev !== rev) {
      archive.innerHTML = archiveHtml(state);
      archive.dataset.rev = rev;
    }
  }

  function refine() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    root.dataset.uiVersion = UI_VERSION;
    refineSettings(root, loadState());
  }

  function scheduleRefine() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(refine);
  }

  function installObserver() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return false;
    observer?.disconnect();
    observer = new MutationObserver(scheduleRefine);
    observer.observe(root, { childList:true, subtree:true });
    scheduleRefine();
    return true;
  }

  function injectStyle() {
    const style = document.createElement('style');
    style.id = 'ussign-job-timer-ui-v101';
    style.textContent = `
#${ROOT_ID}{width:min(430px,calc(100vw - 24px))}
#${ROOT_ID} section{padding:10px 10px 11px}

/* Chrome-style recent-job tab strip */
#${ROOT_ID} .jt-tabs{position:relative;z-index:4;display:flex;align-items:flex-end;gap:2px;overflow-x:auto;margin:0 0 -1px;padding:6px 4px 0;scrollbar-width:thin}
#${ROOT_ID} .jt-tab{position:relative;flex:0 0 auto;max-width:150px;min-width:74px;min-height:35px;display:flex;align-items:center;gap:7px;margin:0;padding:7px 8px 7px 11px;border:1px solid rgba(255,255,255,.07);border-bottom-color:rgba(255,255,255,.055);border-radius:11px 11px 0 0;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.012)),rgba(8,9,12,.58);color:rgba(204,211,220,.66);box-shadow:none;cursor:pointer;transition:background-color 120ms ease,border-color 120ms ease,color 120ms ease,transform 120ms ease}
#${ROOT_ID} .jt-tab:hover{background:rgba(255,255,255,.05);color:rgba(239,243,247,.92)}
#${ROOT_ID} .jt-tab>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px;font-weight:760}
#${ROOT_ID} .jt-tab.jt-selected{z-index:3;min-height:38px;margin-top:-3px;color:#fff;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.018)),rgba(12,13,16,.96);border-color:rgba(255,255,255,.11);border-bottom-color:rgba(12,13,16,.98);box-shadow:0 -5px 18px rgba(0,0,0,.16);transform:translateY(1px)}
#${ROOT_ID} .jt-tab.jt-active::before{content:"";width:6px;height:6px;flex:0 0 6px;border-radius:50%;background:var(--a);box-shadow:0 0 0 3px var(--as)}
#${ROOT_ID} .jt-tab.jt-active{box-shadow:none}
#${ROOT_ID} .jt-tab.jt-selected.jt-active{box-shadow:0 -5px 18px rgba(0,0,0,.16)}
#${ROOT_ID} .jt-x{width:18px;height:18px;flex:0 0 18px;padding:0;border:0;border-radius:50%;background:transparent;color:rgba(210,216,224,.40);font-size:13px;line-height:18px;cursor:pointer}
#${ROOT_ID} .jt-x:hover{background:rgba(255,255,255,.09);color:#fff}

/* Active tab visually connects to one content body */
#${ROOT_ID} .jt-main{position:relative;z-index:2;margin:0;padding:16px 14px 14px;border:1px solid rgba(255,255,255,.09);border-radius:0 13px 13px 13px;background:linear-gradient(180deg,rgba(255,255,255,.030),rgba(255,255,255,.008)),rgba(6,7,9,.40);box-shadow:inset 0 1px 0 rgba(255,255,255,.015)}
#${ROOT_ID} .jt-empty{position:relative;z-index:2;margin:0;padding:14px;border:1px solid rgba(255,255,255,.08);border-radius:0 13px 13px 13px;background:rgba(6,7,9,.35)}

/* Settings stays compact like an app panel */
#${ROOT_ID} .jt-settings{display:none;margin-top:10px;padding:0;overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:12px;background:rgba(6,7,9,.62)}
#${ROOT_ID}.jt-settings-open .jt-settings{display:flex;flex-direction:column}
#${ROOT_ID} .jt-settings>h4{flex:0 0 auto;margin:0;padding:12px 12px 7px;font-size:12px}
#${ROOT_ID} .jt-settings>.jt-thresholds{flex:0 0 auto;margin:0;padding:0 12px 12px}

/* Hidden tabs + all recent history share one scrolling archive */
#${ROOT_ID} .jt-archive-scroll{flex:0 1 auto;min-height:92px;max-height:min(360px,43vh);overflow-y:auto;overscroll-behavior:contain;padding:4px 10px 10px;border-top:1px solid rgba(255,255,255,.055);border-bottom:1px solid rgba(255,255,255,.055);scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.16) transparent}
#${ROOT_ID} .jt-archive-scroll::-webkit-scrollbar{width:8px}
#${ROOT_ID} .jt-archive-scroll::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(255,255,255,.15)}
#${ROOT_ID} .jt-archive-section{padding-top:4px}
#${ROOT_ID} .jt-archive-section+ .jt-archive-section{margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.055)}
#${ROOT_ID} .jt-archive-section h5{position:sticky;top:-4px;z-index:2;margin:0 -2px 6px;padding:8px 2px 6px;background:linear-gradient(180deg,rgba(8,9,12,.98) 72%,rgba(8,9,12,.76));color:rgba(235,239,244,.82);font-size:9.5px;letter-spacing:.07em;text-transform:uppercase}
#${ROOT_ID} .jt-archive-empty,#${ROOT_ID} .jt-archive-cap{display:block;padding:6px 2px;color:rgba(198,205,214,.47);font-size:9.5px}
#${ROOT_ID} .jt-archive-cap{padding-top:9px;text-align:center}

/* Bottom cleanup actions never scroll away */
#${ROOT_ID} .jt-settings>.jt-actions{flex:0 0 auto;display:flex;gap:7px;flex-wrap:wrap;margin:0;padding:10px 12px 12px;background:rgba(9,10,13,.88)}
#${ROOT_ID} .jt-row{margin-top:5px}

@media(max-width:640px){
  #${ROOT_ID}{width:calc(100vw - 16px)}
  #${ROOT_ID} .jt-archive-scroll{max-height:38vh}
  #${ROOT_ID} .jt-tab{max-width:132px}
}
`;
    document.documentElement.appendChild(style);
  }

  injectStyle();

  let tries = 0;
  const wait = setInterval(() => {
    if (installObserver() || ++tries >= 60) clearInterval(wait);
  }, 150);

  window.addEventListener('storage', e => {
    if (e.key === STORAGE_KEY) scheduleRefine();
  });
})();
