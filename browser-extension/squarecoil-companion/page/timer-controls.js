(() => {
  'use strict';

  const VERSION = '0.5.3';
  const ROOT_ID = 'ussign-job-timer';
  const STYLE_ID = 'usx-timer-controls-v053';
  const ACTIVITY_KEY = 'ussign-squarecoil-job-timer-activity-v1';
  const TIMER_THEMES = ['light', 'dark', 'auto'];
  const SQ_THEMES = ['original', 'light', 'dark'];
  const MAX_ACTIVITY = 200;

  const previous = window.__usxTimerControls;
  if (previous?.teardown) {
    try { previous.teardown(); } catch (_) {}
  }

  let root = null;
  let rootObserver = null;
  let settingsView = 'home';
  let mountTimer = 0;

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[ch]));
  }

  function fmt(ms, compact = true) {
    const total = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (compact) return hours ? `${hours}h ${String(mins).padStart(2, '0')}m` : `${mins}m ${String(secs).padStart(2, '0')}s`;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function friendlyReason(reason) {
    const map = {
      'switched-context': 'Switched jobs',
      'clocked-out-completely': 'Clocked out',
      'clocked-out': 'Clocked out',
      'left-job-context': 'Left job context',
      'switch-start-context': 'Started job timer',
      'start-new-context': 'Started timer',
      'switch-ask-resume': 'Job detected, resume requested',
      'ask-resume': 'Resume requested',
      'resume-timer': 'Resumed timer',
      'start-fresh': 'Started fresh timer',
      'confirmed-idle-context': 'Left job context',
      'hide-tab': 'Hid recent job',
      'restore-tab': 'Restored recent job',
      'clear-selected': 'Cleared selected timer',
      'clear-all': 'Cleared all timer history',
      'settings': 'Updated timer limits',
      'active-label-update': 'Updated active job label'
    };
    return map[reason] || String(reason || '').replace(/[-_]+/g, ' ').replace(/^./, c => c.toUpperCase());
  }

  function debugSnapshot() {
    try {
      return typeof window.__squareCoilJobTimerDebug === 'function'
        ? window.__squareCoilJobTimerDebug()
        : null;
    } catch (_) {
      return null;
    }
  }

  function currentTimerTheme() {
    const value = document.documentElement.dataset.usxTimerThemePreference;
    return TIMER_THEMES.includes(value) ? value : 'auto';
  }

  function currentSquareCoilTheme() {
    const value = document.documentElement.dataset.usxSquarecoilTheme;
    return SQ_THEMES.includes(value) ? value : 'original';
  }

  function effectiveElapsed(context, state, now = Date.now()) {
    if (!context) return 0;
    let ms = Math.max(0, Number(context.accumulatedMs) || 0);
    if (state?.active?.key === context.key) {
      ms += Math.max(0, now - Number(state.active.startedAt || now));
    }
    return ms;
  }

  function statusFor(context, state) {
    if (!context) return 'Paused';
    if (state?.active?.key === context.key) return 'Running';
    if (state?.pending?.key === context.key) return 'Resume';
    const reason = context.lastPausedReason;
    if (reason === 'clocked-out' || reason === 'clocked-out-completely') return 'Clocked out';
    return 'Paused';
  }

  function readActivityStore() {
    try {
      const raw = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || 'null');
      if (Array.isArray(raw)) return { entries: raw.slice(-MAX_ACTIVITY), lastRuntimeSignature: null };
      if (raw && typeof raw === 'object') {
        return {
          entries: Array.isArray(raw.entries) ? raw.entries.slice(-MAX_ACTIVITY) : [],
          lastRuntimeSignature: raw.lastRuntimeSignature || null
        };
      }
    } catch (_) {}
    return { entries: [], lastRuntimeSignature: null };
  }

  function writeActivityStore(store) {
    try {
      store.entries = (Array.isArray(store.entries) ? store.entries : []).slice(-MAX_ACTIVITY);
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(store));
    } catch (_) {}
  }

  function addActivity(label, detail = '', at = Date.now()) {
    const store = readActivityStore();
    const previousEntry = store.entries[store.entries.length - 1];
    if (previousEntry && previousEntry.label === label && previousEntry.detail === detail && Math.abs(at - previousEntry.at) < 1000) return;
    store.entries.push({ id: `${at}-${Math.random().toString(36).slice(2, 8)}`, at, label, detail });
    writeActivityStore(store);
  }

  function captureRuntimeActivity() {
    const snap = debugSnapshot();
    const state = snap?.state;
    if (!state || !state.lastReason || !state.rev) return;

    const allowed = new Set([
      'switch-start-context', 'start-new-context', 'switch-ask-resume', 'ask-resume',
      'resume-timer', 'start-fresh', 'clocked-out', 'confirmed-idle-context',
      'hide-tab', 'restore-tab', 'clear-selected', 'clear-all', 'settings',
      'active-label-update'
    ]);
    if (!allowed.has(state.lastReason)) return;

    const signature = `${state.rev}:${state.lastReason}`;
    const store = readActivityStore();
    if (store.lastRuntimeSignature === signature) return;

    const key = state.active?.key || state.pending?.key || state.ui?.selectedKey || null;
    const context = key ? state.contexts?.[key] : null;
    const detail = context ? `${context.shortLabel || context.projectId || ''}${context.label ? ` · ${context.label}` : ''}` : '';
    store.entries.push({
      id: `${state.updatedAt || Date.now()}-${state.rev}`,
      at: Number(state.updatedAt) || Date.now(),
      label: friendlyReason(state.lastReason),
      detail
    });
    store.lastRuntimeSignature = signature;
    writeActivityStore(store);
  }

  function injectStyle() {
    document.getElementById(STYLE_ID)?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${ROOT_ID} .jt-shell{border-radius:16px!important;background-clip:padding-box!important}
#${ROOT_ID}:not(.jt-collapsed) header{border-radius:15px 15px 0 0!important}
#${ROOT_ID}.jt-collapsed .jt-shell,#${ROOT_ID}.jt-collapsed header{border-radius:18px!important}
#${ROOT_ID} .jt-x{position:relative!important;display:block!important;width:20px!important;height:20px!important;min-width:20px!important;min-height:20px!important;flex:0 0 20px!important;padding:0!important;margin:0!important;line-height:0!important;text-align:center!important;overflow:hidden!important}
#${ROOT_ID} .jt-x svg{position:absolute!important;left:50%!important;top:50%!important;width:10px!important;height:10px!important;display:block!important;margin:0!important;transform:translate(-50%,-50%)!important;pointer-events:none!important;overflow:visible!important}
#${ROOT_ID} .jt-x path{fill:none!important;stroke:currentColor!important;stroke-width:1.7!important;stroke-linecap:round!important;stroke-linejoin:round!important;vector-effect:non-scaling-stroke!important}
#${ROOT_ID} header>button[data-action="collapse"]{position:relative!important;display:block!important;padding:0!important;line-height:0!important;font-size:0!important;color:inherit!important;overflow:hidden!important}
#${ROOT_ID} .usx-collapse-icon{position:absolute!important;left:50%!important;top:50%!important;width:16px!important;height:16px!important;display:block!important;transform:translate(-50%,-50%)!important;pointer-events:none!important;overflow:visible!important}
#${ROOT_ID} .usx-minimize-path,#${ROOT_ID} .usx-expand-path{fill:none!important;stroke:currentColor!important;stroke-width:1.7!important;stroke-linecap:round!important;stroke-linejoin:round!important;vector-effect:non-scaling-stroke!important}
#${ROOT_ID}:not(.jt-collapsed) .usx-expand-path{display:none!important}
#${ROOT_ID}.jt-collapsed .usx-minimize-path{display:none!important}

#${ROOT_ID} .jt-settings.usx-settings-managed>h4,#${ROOT_ID} .jt-settings.usx-settings-managed>.jt-thresholds,#${ROOT_ID} .jt-settings.usx-settings-managed>.jt-archive-scroll,#${ROOT_ID} .jt-settings.usx-settings-managed>.jt-actions{display:none!important}
#${ROOT_ID} .usx-settings-app{display:flex;flex-direction:column;min-height:0}
#${ROOT_ID} .usx-settings-page{display:flex;flex-direction:column;min-height:0}
#${ROOT_ID} .usx-page-head{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;padding:10px 11px 8px;border-bottom:1px solid rgba(255,255,255,.055)}
#${ROOT_ID} .usx-page-head h4{margin:0!important;font-size:11.5px!important;font-weight:700!important;color:rgba(239,242,246,.92)!important}
#${ROOT_ID} .usx-page-head small{font-size:9.5px!important;color:rgba(197,204,214,.52)!important}
#${ROOT_ID} .usx-back{width:27px;height:27px;display:grid;place-items:center;padding:0;border:1px solid rgba(255,255,255,.07);border-radius:7px;background:rgba(255,255,255,.035);color:rgba(235,240,245,.82);cursor:pointer}
#${ROOT_ID} .usx-back:hover{background:rgba(255,255,255,.075);color:#fff}
#${ROOT_ID} .usx-home-body{padding:10px 11px 11px}
#${ROOT_ID} .usx-section-label{margin:2px 0 6px;color:rgba(201,208,216,.50);font-size:8.5px;font-weight:750;letter-spacing:.075em;text-transform:uppercase}
#${ROOT_ID} .usx-segmented{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:3px;border:1px solid rgba(255,255,255,.07);border-radius:9px;background:rgba(0,0,0,.12)}
#${ROOT_ID} .usx-segmented button{min-height:29px;padding:5px 7px;border:1px solid transparent;border-radius:6px;background:transparent;color:rgba(220,226,233,.66);font-size:10px;font-weight:650;cursor:pointer}
#${ROOT_ID} .usx-segmented button:hover{color:rgba(244,247,250,.94);background:rgba(255,255,255,.05)}
#${ROOT_ID} .usx-segmented button[data-selected="true"]{color:rgba(246,249,252,.96);background:rgba(123,170,242,.13);border-color:rgba(123,170,242,.22)}
#${ROOT_ID} .usx-nav-stack{display:grid;gap:6px;margin-top:7px}
#${ROOT_ID} .usx-nav-card{width:100%;display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px;padding:9px 10px;border:1px solid rgba(255,255,255,.06);border-radius:9px;background:rgba(255,255,255,.022);color:rgba(232,236,241,.88);text-align:left;cursor:pointer}
#${ROOT_ID} .usx-nav-card:hover{background:rgba(255,255,255,.055);border-color:rgba(255,255,255,.10)}
#${ROOT_ID} .usx-nav-card b{display:block;font-size:10.5px;font-weight:650;color:inherit!important}
#${ROOT_ID} .usx-nav-card small{display:block;margin-top:2px;font-size:9px;color:rgba(193,201,211,.47)!important}
#${ROOT_ID} .usx-nav-card>span:last-child{font-size:16px;color:rgba(206,214,223,.42)}
#${ROOT_ID} .usx-limits{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:7px}
#${ROOT_ID} .usx-limits label{color:rgba(202,209,218,.58);font-size:9px;font-weight:600}
#${ROOT_ID} .usx-limits input{display:block;width:100%;height:31px;margin-top:4px;padding:5px 7px;border:1px solid rgba(255,255,255,.07);border-radius:7px;background:rgba(255,255,255,.025);color:rgba(240,243,247,.90);box-shadow:none}
#${ROOT_ID} .usx-home-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}
#${ROOT_ID} .usx-view-list{min-height:92px;max-height:min(370px,45vh);overflow-y:auto;overscroll-behavior:contain;padding:5px 9px 10px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.15) transparent}
#${ROOT_ID} .usx-list-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;margin-top:5px;padding:8px 9px;border:1px solid rgba(255,255,255,.05);border-radius:8px;background:rgba(255,255,255,.016)}
#${ROOT_ID} .usx-list-row b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(230,234,239,.84)!important;font-size:10.5px;font-weight:650}
#${ROOT_ID} .usx-list-row small{display:block;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(195,202,211,.48)!important;font-size:9.5px}
#${ROOT_ID} .usx-row-meta{display:flex;flex-direction:column;align-items:flex-end;gap:3px;white-space:nowrap}
#${ROOT_ID} .usx-row-meta code{color:rgba(224,229,235,.70);background:transparent;font:10px/1.2 ui-monospace,monospace}
#${ROOT_ID} .usx-pill{padding:3px 5px;border:1px solid rgba(255,255,255,.06);border-radius:999px;background:rgba(255,255,255,.025);color:rgba(205,212,220,.58);font-size:8px;font-weight:700;text-transform:uppercase}
#${ROOT_ID} .usx-inline-btn{min-height:26px;padding:4px 7px;border:1px solid rgba(255,255,255,.07);border-radius:6px;background:rgba(255,255,255,.035);color:rgba(232,236,241,.82);font-size:9px;font-weight:650;cursor:pointer}
#${ROOT_ID} .usx-inline-btn:hover{background:rgba(255,255,255,.075);color:#fff}
#${ROOT_ID} .usx-empty{padding:18px 10px;text-align:center;color:rgba(195,202,211,.48);font-size:10px}
#${ROOT_ID} .usx-site-theme-list{display:grid;gap:7px;padding:9px 10px 11px}
#${ROOT_ID} .usx-site-theme-card{width:100%;display:grid;grid-template-columns:32px 1fr auto;align-items:center;gap:9px;padding:9px;border:1px solid rgba(255,255,255,.06);border-radius:9px;background:rgba(255,255,255,.018);color:rgba(233,237,242,.88);text-align:left;cursor:pointer}
#${ROOT_ID} .usx-site-theme-card[data-selected="true"]{border-color:rgba(123,170,242,.24);background:rgba(123,170,242,.075)}
#${ROOT_ID} .usx-theme-swatch{width:28px;height:24px;border-radius:6px;border:1px solid rgba(255,255,255,.10)}
#${ROOT_ID} .usx-theme-swatch.original{background:linear-gradient(90deg,#303842 0 27%,#f1f1f1 27% 100%)}
#${ROOT_ID} .usx-theme-swatch.light{background:linear-gradient(135deg,#fafafa,#e7ebef)}
#${ROOT_ID} .usx-theme-swatch.dark{background:linear-gradient(135deg,#222831,#101419)}
#${ROOT_ID} .usx-site-theme-card b{display:block;font-size:10.5px;color:inherit!important}
#${ROOT_ID} .usx-site-theme-card small{display:block;margin-top:2px;font-size:9px;color:rgba(194,202,211,.48)!important}
#${ROOT_ID} .usx-check{font-size:13px;color:rgba(135,190,238,.92)}

html[data-usx-theme="light"] #${ROOT_ID}{--jt-line:rgba(0,0,0,.10)!important;color:#40464d!important}
html[data-usx-theme="light"] #${ROOT_ID} .jt-shell,html[data-usx-theme="light"] #${ROOT_ID}.jt-collapsed .jt-shell{background:#fff!important;background-image:none!important;border-color:rgba(0,0,0,.10)!important;box-shadow:0 12px 28px rgba(0,0,0,.13)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
html[data-usx-theme="light"] #${ROOT_ID} header{border-bottom-color:rgba(0,0,0,.08)!important}
html[data-usx-theme="light"] #${ROOT_ID} .jt-brand,html[data-usx-theme="light"] #${ROOT_ID} .jt-head-context,html[data-usx-theme="light"] #${ROOT_ID} header>[data-role="compact-time"]{color:#3f454c!important}
html[data-usx-theme="light"] #${ROOT_ID} header>button{color:#68717a!important;background:#f5f6f7!important;border-color:#dfe3e6!important}
html[data-usx-theme="light"] #${ROOT_ID} .jt-main,html[data-usx-theme="light"] #${ROOT_ID} .jt-empty,html[data-usx-theme="light"] #${ROOT_ID} .jt-settings,html[data-usx-theme="light"] #${ROOT_ID} .jt-resume{color:#51575d!important;background:#f8f9fa!important;border-color:#e1e4e7!important;box-shadow:none!important}
html[data-usx-theme="light"] #${ROOT_ID} .jt-main-head b,html[data-usx-theme="light"] #${ROOT_ID} .jt-main>strong,html[data-usx-theme="light"] #${ROOT_ID} .usx-page-head h4,html[data-usx-theme="light"] #${ROOT_ID} .usx-list-row b,html[data-usx-theme="light"] #${ROOT_ID} .usx-nav-card b,html[data-usx-theme="light"] #${ROOT_ID} .usx-site-theme-card b{color:#343a40!important}
html[data-usx-theme="light"] #${ROOT_ID} .jt-tab{background:#f4f5f6!important;border-color:rgba(var(--tc),.24)!important;border-bottom-color:#d8dde1!important;box-shadow:0 5px 14px rgba(0,0,0,.08)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
html[data-usx-theme="light"] #${ROOT_ID} .jt-tab.jt-selected{background:#fff!important;border-bottom-color:#fff!important}
html[data-usx-theme="light"] #${ROOT_ID} .usx-segmented{background:#eef1f3;border-color:#dfe3e6}
html[data-usx-theme="light"] #${ROOT_ID} .usx-segmented button{color:#717981}
html[data-usx-theme="light"] #${ROOT_ID} .usx-segmented button[data-selected="true"]{color:#2f5278;background:#fff;border-color:rgba(75,150,230,.30);box-shadow:0 1px 3px rgba(0,0,0,.08)}
html[data-usx-theme="light"] #${ROOT_ID} .usx-nav-card,html[data-usx-theme="light"] #${ROOT_ID} .usx-list-row,html[data-usx-theme="light"] #${ROOT_ID} .usx-site-theme-card{background:#fff;border-color:#e1e4e7;color:#51575d}
html[data-usx-theme="light"] #${ROOT_ID} .usx-limits input{background:#fff;border-color:#dfe3e6;color:#444}
html[data-usx-theme="light"] #${ROOT_ID} .usx-back,html[data-usx-theme="light"] #${ROOT_ID} .usx-inline-btn{background:#f5f6f7;border-color:#dfe3e6;color:#68717a}

html[data-usx-theme="dark"] #${ROOT_ID}{--jt-line:rgba(255,255,255,.085)!important;color:#eef2f5!important}
html[data-usx-theme="dark"] #${ROOT_ID} .jt-shell,html[data-usx-theme="dark"] #${ROOT_ID}.jt-collapsed .jt-shell{background:#14191f!important;background-image:none!important;border-color:rgba(255,255,255,.085)!important;box-shadow:0 16px 36px rgba(0,0,0,.28)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
html[data-usx-theme="dark"] #${ROOT_ID} .jt-main,html[data-usx-theme="dark"] #${ROOT_ID} .jt-empty,html[data-usx-theme="dark"] #${ROOT_ID} .jt-settings{background:#191f26!important;border-color:rgba(255,255,255,.075)!important}
html[data-usx-theme="dark"] #${ROOT_ID} .jt-tab{background:#1a2027!important;border-color:rgba(var(--tc),.24)!important;border-bottom-color:rgba(255,255,255,.065)!important;box-shadow:0 5px 14px rgba(0,0,0,.18)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
html[data-usx-theme="dark"] #${ROOT_ID} .jt-tab.jt-selected{background:#20272f!important;border-bottom-color:#20272f!important}
html[data-usx-theme="dark"] #${ROOT_ID} header>button{color:rgba(235,240,245,.80)!important;background:#20272f!important;border-color:rgba(255,255,255,.08)!important}
`;
    document.documentElement.appendChild(style);
  }

  function makeCollapseIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('usx-collapse-icon');

    const minus = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    minus.setAttribute('d', 'M4 8H12');
    minus.classList.add('usx-minimize-path');

    const expand = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    expand.setAttribute('d', 'M4.25 9.75 8 6l3.75 3.75');
    expand.classList.add('usx-expand-path');

    svg.append(minus, expand);
    return svg;
  }

  function pageHeader(title, subtitle = '') {
    return `<div class="usx-page-head"><button type="button" class="usx-back" data-usx-back aria-label="Back">‹</button><h4>${esc(title)}</h4><small>${esc(subtitle)}</small></div>`;
  }

  function renderTimerThemeControl() {
    const selected = currentTimerTheme();
    return `<div class="usx-segmented" role="group" aria-label="Job Timer appearance">
      ${TIMER_THEMES.map(theme => `<button type="button" data-usx-timer-theme="${theme}" data-selected="${selected === theme}">${theme === 'auto' ? 'Auto' : theme[0].toUpperCase() + theme.slice(1)}</button>`).join('')}
    </div>`;
  }

  function homeView(state) {
    const settings = state?.settings || { yellow: 60, orange: 120, red: 240 };
    return `<div class="usx-settings-page">
      <div class="usx-page-head"><span></span><h4>Timer settings</h4><small>v${VERSION}</small></div>
      <div class="usx-home-body">
        <div class="usx-section-label">Timer appearance</div>
        ${renderTimerThemeControl()}

        <div class="usx-section-label" style="margin-top:11px">Library</div>
        <div class="usx-nav-stack">
          <button type="button" class="usx-nav-card" data-usx-view="recent"><span><b>Recent Jobs</b><small>Saved job timers and hidden tabs</small></span><span>›</span></button>
          <button type="button" class="usx-nav-card" data-usx-view="history"><span><b>History</b><small>Completed and paused timer sessions</small></span><span>›</span></button>
          <button type="button" class="usx-nav-card" data-usx-view="activity"><span><b>Activity Log</b><small>Timer and theme events</small></span><span>›</span></button>
        </div>

        <div class="usx-section-label" style="margin-top:11px">SquareCoil</div>
        <div class="usx-nav-stack">
          <button type="button" class="usx-nav-card" data-usx-view="site-theme"><span><b>Website Theme</b><small>Original, refined light, or sleek dark</small></span><span>›</span></button>
        </div>

        <div class="usx-section-label" style="margin-top:11px">Timer limits</div>
        <div class="usx-limits">
          <label>Yellow<input type="number" min="1" data-setting="yellow" value="${esc(settings.yellow)}"></label>
          <label>Orange<input type="number" min="1" data-setting="orange" value="${esc(settings.orange)}"></label>
          <label>Red<input type="number" min="1" data-setting="red" value="${esc(settings.red)}"></label>
        </div>
        <div class="usx-home-actions">
          <button class="jt-btn" data-action="clear-selected">Clear selected</button>
          <button class="jt-btn jt-danger" data-action="clear-all">Clear all</button>
        </div>
      </div>
    </div>`;
  }

  function recentJobsView(state) {
    const hidden = new Set(state?.ui?.hiddenKeys || []);
    const contexts = Object.values(state?.contexts || {})
      .sort((a, b) => (b.lastTouchedAt || 0) - (a.lastTouchedAt || 0))
      .slice(0, 60);

    const rows = contexts.length ? contexts.map(context => {
      const ms = effectiveElapsed(context, state);
      const status = statusFor(context, state);
      const isHidden = hidden.has(context.key);
      return `<div class="usx-list-row">
        <div><b>${esc(context.shortLabel || context.projectId || context.label)}</b><small>${esc(context.label || '')}</small></div>
        <div class="usx-row-meta"><code>${esc(fmt(ms))}</code><span class="usx-pill">${esc(isHidden ? 'Hidden' : status)}</span><button type="button" class="usx-inline-btn" data-usx-job-key="${esc(context.key)}">${isHidden ? 'Show' : 'View'}</button></div>
      </div>`;
    }).join('') : '<div class="usx-empty">No recent jobs yet.</div>';

    return `<div class="usx-settings-page">${pageHeader('Recent Jobs', `${contexts.length}`)}<div class="usx-view-list">${rows}</div></div>`;
  }

  function historyView(state) {
    const rows = [];
    for (const context of Object.values(state?.contexts || {})) {
      for (const session of Array.isArray(context.sessions) ? context.sessions : []) {
        rows.push({ context, session });
      }
    }
    rows.sort((a, b) => (b.session.endAt || 0) - (a.session.endAt || 0));
    const limited = rows.slice(0, 250);

    const html = limited.length ? limited.map(({ context, session }) => {
      const when = new Date(session.endAt || Date.now()).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      return `<div class="usx-list-row"><div><b>${esc(context.shortLabel || context.projectId || context.label)} · ${esc(friendlyReason(session.reason))}</b><small>${esc(when)}</small></div><div class="usx-row-meta"><code>${esc(fmt(session.durationMs))}</code></div></div>`;
    }).join('') : '<div class="usx-empty">No timer history yet.</div>';

    return `<div class="usx-settings-page">${pageHeader('History', `${limited.length}`)}<div class="usx-view-list">${html}</div></div>`;
  }

  function activityView() {
    const store = readActivityStore();
    const rows = [...store.entries].sort((a, b) => b.at - a.at).slice(0, MAX_ACTIVITY);
    const html = rows.length ? rows.map(entry => {
      const when = new Date(entry.at || Date.now()).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      return `<div class="usx-list-row"><div><b>${esc(entry.label)}</b><small>${esc(entry.detail || when)}</small></div><div class="usx-row-meta"><small>${esc(when)}</small></div></div>`;
    }).join('') : '<div class="usx-empty">No activity recorded yet.</div>';
    return `<div class="usx-settings-page">${pageHeader('Activity Log', `${rows.length}`)}<div class="usx-view-list">${html}</div></div>`;
  }

  function siteThemeView() {
    const selected = currentSquareCoilTheme();
    const cards = [
      ['original', 'Original', 'No website styling. Native SquareCoil.', 'original'],
      ['light', 'Refined Light', 'Original SquareCoil with subtle cleanup.', 'light'],
      ['dark', 'Sleek Dark', 'Solid graphite SquareCoil night mode.', 'dark']
    ].map(([key, title, note, swatch]) => `<button type="button" class="usx-site-theme-card" data-usx-site-theme="${key}" data-selected="${selected === key}"><span class="usx-theme-swatch ${swatch}"></span><span><b>${esc(title)}</b><small>${esc(note)}</small></span><span class="usx-check">${selected === key ? '✓' : ''}</span></button>`).join('');
    return `<div class="usx-settings-page">${pageHeader('SquareCoil Theme', 'Website only')}<div class="usx-site-theme-list">${cards}</div></div>`;
  }

  function renderSettingsApp() {
    if (!root || !root.classList.contains('jt-settings-open') || root.classList.contains('jt-collapsed')) return;
    const settings = root.querySelector('.jt-settings');
    if (!settings) return;

    settings.classList.add('usx-settings-managed');
    let app = settings.querySelector(':scope > .usx-settings-app');
    if (!app) {
      app = document.createElement('div');
      app.className = 'usx-settings-app';
      settings.appendChild(app);
    }

    const snap = debugSnapshot();
    const state = snap?.state || {};
    if (settingsView === 'recent') app.innerHTML = recentJobsView(state);
    else if (settingsView === 'history') app.innerHTML = historyView(state);
    else if (settingsView === 'activity') app.innerHTML = activityView();
    else if (settingsView === 'site-theme') app.innerHTML = siteThemeView();
    else {
      settingsView = 'home';
      app.innerHTML = homeView(state);
    }
  }

  function patchCollapseIcon() {
    if (!root) return;
    const collapse = root.querySelector('header > button[data-action="collapse"]');
    if (collapse && !collapse.querySelector('.usx-collapse-icon')) {
      collapse.replaceChildren(makeCollapseIcon());
    }
    root.querySelectorAll('.jt-x').forEach(button => button.setAttribute('type', 'button'));
  }

  function patchRuntimeRender() {
    if (!root) return;
    captureRuntimeActivity();
    patchCollapseIcon();
    if (root.classList.contains('jt-settings-open') && !root.classList.contains('jt-collapsed')) {
      renderSettingsApp();
    } else {
      settingsView = 'home';
    }
  }

  function requestTimerTheme(theme) {
    if (!TIMER_THEMES.includes(theme)) return;
    document.documentElement.dataset.usxRequestedTimerTheme = theme;
    document.documentElement.dataset.usxTimerThemePreference = theme;
    document.documentElement.dataset.usxTheme = theme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    window.dispatchEvent(new Event('USX_SET_TIMER_THEME'));
    addActivity('Timer appearance changed', theme === 'auto' ? 'Auto' : theme[0].toUpperCase() + theme.slice(1));
    renderSettingsApp();
  }

  function requestSquareCoilTheme(theme) {
    if (!SQ_THEMES.includes(theme)) return;
    document.documentElement.dataset.usxRequestedSquarecoilTheme = theme;
    document.documentElement.dataset.usxSquarecoilTheme = theme;
    window.dispatchEvent(new Event('USX_SET_SQUARECOIL_THEME'));
    const label = theme === 'original' ? 'Original' : theme === 'light' ? 'Refined Light' : 'Sleek Dark';
    addActivity('SquareCoil theme changed', label);
    renderSettingsApp();
  }

  function onRootClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const back = target.closest('[data-usx-back]');
    if (back) {
      event.preventDefault();
      event.stopPropagation();
      settingsView = 'home';
      renderSettingsApp();
      return;
    }

    const nav = target.closest('[data-usx-view]');
    if (nav) {
      event.preventDefault();
      event.stopPropagation();
      const view = nav.dataset.usxView;
      if (['recent', 'history', 'activity', 'site-theme'].includes(view)) {
        settingsView = view;
        renderSettingsApp();
      }
      return;
    }

    const timerTheme = target.closest('[data-usx-timer-theme]');
    if (timerTheme) {
      event.preventDefault();
      event.stopPropagation();
      requestTimerTheme(timerTheme.dataset.usxTimerTheme);
      return;
    }

    const siteTheme = target.closest('[data-usx-site-theme]');
    if (siteTheme) {
      event.preventDefault();
      event.stopPropagation();
      requestSquareCoilTheme(siteTheme.dataset.usxSiteTheme);
      return;
    }

    const job = target.closest('[data-usx-job-key]');
    if (job) {
      event.preventDefault();
      event.stopPropagation();
      const key = job.dataset.usxJobKey;
      try { window.__squareCoilJobTimerSelect?.(key); } catch (_) {}
      return;
    }
  }

  function onRootMutation() {
    patchRuntimeRender();
  }

  function onThemeState() {
    if (root?.classList.contains('jt-settings-open')) renderSettingsApp();
  }

  function attachRoot(nextRoot) {
    if (!nextRoot || root === nextRoot) return;
    if (root) root.removeEventListener('click', onRootClick);
    rootObserver?.disconnect();

    root = nextRoot;
    root.addEventListener('click', onRootClick);
    rootObserver = new MutationObserver(onRootMutation);
    rootObserver.observe(root, { childList: true });
    patchRuntimeRender();
  }

  function findRootWithRetry() {
    const found = document.getElementById(ROOT_ID);
    if (found) {
      attachRoot(found);
      return;
    }
    let attempts = 0;
    clearInterval(mountTimer);
    mountTimer = setInterval(() => {
      const candidate = document.getElementById(ROOT_ID);
      if (candidate) {
        clearInterval(mountTimer);
        mountTimer = 0;
        attachRoot(candidate);
      } else if (++attempts >= 40) {
        clearInterval(mountTimer);
        mountTimer = 0;
      }
    }, 100);
  }

  function teardown() {
    clearInterval(mountTimer);
    mountTimer = 0;
    rootObserver?.disconnect();
    rootObserver = null;
    root?.removeEventListener('click', onRootClick);
    window.removeEventListener('USX_THEME_STATE', onThemeState);
    document.getElementById(STYLE_ID)?.remove();
    root = null;
  }

  window.__usxTimerControls = { version: VERSION, teardown };
  window.addEventListener('USX_THEME_STATE', onThemeState);
  injectStyle();
  findRootWithRetry();
})();
