'use strict';

const { TIMER_COMMANDS } = require('../timer/commands');

const ROOT_ID = 'ussign-job-timer';
const UI_STORAGE_DEFAULTS = Object.freeze({
  protoUiTheme: 'light',
  protoUiSurface: 'solid',
  protoUiCollapsed: false,
  protoUiHiddenTabs: []
});
const VIEW_IDS = new Set(['main', 'recent', 'overview', 'history', 'settings']);
const TIMER_ACTIONS = Object.freeze({
  pause: TIMER_COMMANDS.LOCAL_PAUSE,
  resume: TIMER_COMMANDS.RESUME,
  fresh: TIMER_COMMANDS.START_FRESH,
  localResume: TIMER_COMMANDS.LOCAL_RESUME
});
const MAX_VISIBLE_JOB_TABS = 5;
const REFRESH_MS = 500;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDuration(value, options = {}) {
  const ms = Math.max(0, Number(value) || 0);
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (options.compact === true) {
    if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
    return `${minutes}m`;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatClockTime(timestampMs) {
  if (!Number.isSafeInteger(timestampMs)) return 'Unknown';
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
      .format(new Date(timestampMs));
  } catch (_) {
    return 'Unknown';
  }
}

function statusLabel(status) {
  return ({
    RUNNING: 'Running',
    RUNNING_PROVISIONAL: 'Running · verifying',
    VERIFICATION_HOLD: 'Verification hold',
    AWAITING_CHOICE: 'Resume?',
    LOCALLY_PAUSED: 'Locally paused',
    NOT_RUNNING: 'Not running'
  })[status] || 'Syncing';
}

function statusTone(status) {
  if (status === 'RUNNING') return 'positive';
  if (status === 'RUNNING_PROVISIONAL' || status === 'AWAITING_CHOICE') return 'warning';
  if (status === 'VERIFICATION_HOLD') return 'danger';
  if (status === 'LOCALLY_PAUSED') return 'paused';
  return 'muted';
}

function safeProjectId(value) {
  const id = String(value || '').trim();
  return /^[1-9]\d*$/.test(id) ? id : null;
}

function eligibleRows(timer) {
  return (timer?.contextRows || []).filter(row =>
    row.archivedAtMs == null &&
    String(row.workspaceMembership || '').toUpperCase() !== 'ARCHIVED'
  );
}

function deriveVisibleTabs(rows, state = {}) {
  const hidden = new Set(state.hiddenContextIds || []);
  const selectedContextId = state.selectedContextId || null;
  const operationalContextId = state.operationalContextId || null;
  const protectedIds = new Set([selectedContextId, operationalContextId].filter(Boolean));
  const candidates = rows
    .filter(row => !hidden.has(row.contextId) || protectedIds.has(row.contextId))
    .slice()
    .sort((left, right) => {
      const leftProtected = protectedIds.has(left.contextId);
      const rightProtected = protectedIds.has(right.contextId);
      if (leftProtected !== rightProtected) return leftProtected ? -1 : 1;
      if (left.contextId === operationalContextId) return -1;
      if (right.contextId === operationalContextId) return 1;
      if (left.contextId === selectedContextId) return -1;
      if (right.contextId === selectedContextId) return 1;
      return (right.lastActivityAtMs || 0) - (left.lastActivityAtMs || 0) ||
        left.label.localeCompare(right.label);
    });

  const visible = candidates.slice(0, MAX_VISIBLE_JOB_TABS);
  for (const protectedId of protectedIds) {
    if (visible.some(row => row.contextId === protectedId)) continue;
    const protectedRow = candidates.find(row => row.contextId === protectedId);
    if (!protectedRow) continue;
    if (visible.length >= MAX_VISIBLE_JOB_TABS) visible.pop();
    visible.push(protectedRow);
  }
  return visible;
}

function createWorkspaceUi(options = {}) {
  const document = options.document;
  const window = options.window;
  const storage = options.storage;
  const getCoreHandle = options.getCoreHandle;
  if (!document || !window || !storage || typeof getCoreHandle !== 'function') {
    throw new Error('workspace-ui-options-required');
  }

  let started = false;
  let disposed = false;
  let intervalId = null;
  let root = null;
  let selectedContextId = null;
  let lastOperationalContextId = null;
  let view = 'main';
  let theme = 'light';
  let surface = 'solid';
  let collapsed = false;
  let hiddenTabs = new Set();
  let busyAction = null;
  let errorMessage = null;
  let preferencesLoaded = false;

  function coreHandle() {
    return getCoreHandle() || null;
  }

  function coreSnapshot() {
    const handle = coreHandle();
    if (!handle || typeof handle.coreSnapshot !== 'function') return null;
    try { return handle.coreSnapshot(); }
    catch (_) { return null; }
  }

  function mountRoot() {
    const candidate = document.getElementById(ROOT_ID);
    if (!candidate) return null;
    if (root === candidate) return root;
    root = candidate;
    root.classList.add('sc-proto-root');
    root.addEventListener('click', onClick);
    root.addEventListener('submit', onSubmit);
    return root;
  }

  async function loadPreferences() {
    if (preferencesLoaded) return;
    preferencesLoaded = true;
    try {
      const value = await storage.get(UI_STORAGE_DEFAULTS);
      theme = ['light', 'dark'].includes(value.protoUiTheme) ? value.protoUiTheme : 'light';
      surface = ['solid', 'glass'].includes(value.protoUiSurface) ? value.protoUiSurface : 'solid';
      collapsed = value.protoUiCollapsed === true;
      hiddenTabs = new Set(Array.isArray(value.protoUiHiddenTabs) ? value.protoUiHiddenTabs.map(String) : []);
    } catch (_) {}
  }

  function savePreferences() {
    storage.set({
      protoUiTheme: theme,
      protoUiSurface: surface,
      protoUiCollapsed: collapsed,
      protoUiHiddenTabs: [...hiddenTabs]
    }).catch(() => {});
  }

  function currentRow(timer) {
    const rows = timer?.contextRows || [];
    return rows.find(row => row.contextId === timer.currentContextId) || null;
  }

  function selectedRow(timer) {
    const rows = timer?.contextRows || [];
    return rows.find(row => row.contextId === selectedContextId) ||
      rows.find(row => row.contextId === timer.currentContextId) || rows[0] || null;
  }

  function syncSelection(timer) {
    const rows = timer?.contextRows || [];
    const operational = timer?.currentContextId || null;
    const operationalChanged = lastOperationalContextId !== null &&
      operational !== null && operational !== lastOperationalContextId;

    if (!selectedContextId || !rows.some(row => row.contextId === selectedContextId)) {
      selectedContextId = operational || rows[0]?.contextId || null;
    }
    if (operationalChanged) {
      selectedContextId = operational;
      view = 'main';
      collapsed = false;
      savePreferences();
    }
    lastOperationalContextId = operational;
  }

  function styleBlock() {
    return `<style data-sc-proto-style>
#${ROOT_ID}.sc-proto-root{all:initial;position:fixed!important;right:20px!important;bottom:20px!important;z-index:2147483640!important;width:380px!important;max-width:calc(100vw - 32px)!important;color-scheme:light;--sc-bg:#f4f6f8;--sc-panel:#fff;--sc-panel-2:#eef2f5;--sc-text:#18212b;--sc-muted:#65707c;--sc-border:#d8dee5;--sc-accent:#315c7a;--sc-accent-soft:#e7f0f6;--sc-positive:#26734d;--sc-positive-soft:#e5f4ec;--sc-warning:#8b5a12;--sc-warning-soft:#fff1d7;--sc-danger:#a13a3a;--sc-danger-soft:#fae6e6;--sc-shadow:0 18px 48px rgba(20,32,44,.22),0 3px 12px rgba(20,32,44,.12);font:400 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
#${ROOT_ID}.sc-proto-root[data-proto-theme="dark"]{color-scheme:dark;--sc-bg:#11161c;--sc-panel:#191f26;--sc-panel-2:#222a33;--sc-text:#e7edf3;--sc-muted:#9aa6b2;--sc-border:#343e49;--sc-accent:#8cb9d6;--sc-accent-soft:#203543;--sc-positive:#75c69d;--sc-positive-soft:#173628;--sc-warning:#edbe6f;--sc-warning-soft:#3b2f1b;--sc-danger:#ef9a9a;--sc-danger-soft:#442323;--sc-shadow:0 18px 52px rgba(0,0,0,.46),0 3px 14px rgba(0,0,0,.32)}
#${ROOT_ID}.sc-proto-root *{box-sizing:border-box!important;font:inherit}#${ROOT_ID} .sc-proto-shell{overflow:hidden;border:1px solid var(--sc-border);border-radius:14px;background:var(--sc-bg);color:var(--sc-text);box-shadow:var(--sc-shadow)}#${ROOT_ID}[data-proto-surface="glass"] .sc-proto-shell{background:color-mix(in srgb,var(--sc-bg) 82%,transparent);backdrop-filter:blur(18px) saturate(125%)}
#${ROOT_ID} .sc-proto-topbar{display:flex;align-items:center;gap:10px;min-height:44px;padding:9px 10px 8px 12px;background:var(--sc-panel);border-bottom:1px solid var(--sc-border)}#${ROOT_ID} .sc-proto-brand{min-width:0;flex:1}#${ROOT_ID} .sc-proto-brand strong{display:block;font-weight:650;font-size:13px;letter-spacing:.01em}#${ROOT_ID} .sc-proto-brand small{display:block;margin-top:1px;color:var(--sc-muted);font-size:10.5px}#${ROOT_ID} .sc-proto-lifecycle{color:var(--sc-muted);font-size:10px;white-space:nowrap}
#${ROOT_ID} button,#${ROOT_ID} input{color:inherit}#${ROOT_ID} button{border:1px solid var(--sc-border);background:var(--sc-panel);border-radius:8px;padding:6px 9px;cursor:pointer}#${ROOT_ID} button:hover{background:var(--sc-panel-2)}#${ROOT_ID} button:focus-visible,#${ROOT_ID} input:focus-visible{outline:2px solid var(--sc-accent);outline-offset:2px}#${ROOT_ID} button[disabled]{opacity:.5;cursor:not-allowed}#${ROOT_ID} .sc-icon-btn{width:30px;height:30px;padding:0;display:grid;place-items:center}
#${ROOT_ID} .sc-tabs{display:flex;gap:3px;align-items:flex-end;padding:8px 8px 0;overflow:hidden;background:var(--sc-panel-2);border-bottom:1px solid var(--sc-border)}#${ROOT_ID} .sc-tab{min-width:0;max-width:92px;height:31px;display:flex;align-items:center;gap:5px;padding:0 7px;border-radius:8px 8px 0 0;border-bottom:0;background:transparent;color:var(--sc-muted)}#${ROOT_ID} .sc-tab[data-selected="true"]{background:var(--sc-bg);color:var(--sc-text);border-color:var(--sc-border);position:relative;top:1px}#${ROOT_ID} .sc-tab-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:600}#${ROOT_ID} .sc-dot{width:6px;height:6px;border-radius:50%;flex:0 0 auto;background:var(--sc-muted)}#${ROOT_ID} .sc-dot[data-tone="positive"]{background:var(--sc-positive);box-shadow:0 0 0 3px var(--sc-positive-soft)}#${ROOT_ID} .sc-dot[data-tone="warning"]{background:var(--sc-warning)}#${ROOT_ID} .sc-dot[data-tone="danger"]{background:var(--sc-danger)}#${ROOT_ID} .sc-tab-x{border:0;background:transparent;padding:0;width:14px;height:14px;color:var(--sc-muted);font-size:12px}
#${ROOT_ID} .sc-content{max-height:510px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--sc-border) transparent}#${ROOT_ID} .sc-view{padding:12px}#${ROOT_ID} .sc-current-strip{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;margin-bottom:9px;border:1px solid var(--sc-border);background:var(--sc-panel);border-radius:9px}#${ROOT_ID} .sc-eyebrow{color:var(--sc-muted);font-size:10px;text-transform:uppercase;letter-spacing:.06em}#${ROOT_ID} .sc-title{margin-top:2px;font-size:15px;font-weight:680;line-height:1.25;overflow-wrap:anywhere}#${ROOT_ID} .sc-status{display:inline-flex;align-items:center;gap:6px;margin-top:6px;border-radius:999px;padding:3px 7px;font-size:10.5px;font-weight:650;background:var(--sc-panel-2);color:var(--sc-muted)}#${ROOT_ID} .sc-status[data-tone="positive"]{background:var(--sc-positive-soft);color:var(--sc-positive)}#${ROOT_ID} .sc-status[data-tone="warning"]{background:var(--sc-warning-soft);color:var(--sc-warning)}#${ROOT_ID} .sc-status[data-tone="danger"]{background:var(--sc-danger-soft);color:var(--sc-danger)}
#${ROOT_ID} .sc-timer-card{padding:13px;border:1px solid var(--sc-border);border-radius:11px;background:var(--sc-panel)}#${ROOT_ID} .sc-metrics{display:grid;grid-template-columns:1.25fr 1fr;gap:9px;margin-top:12px}#${ROOT_ID} .sc-metric{padding:10px;border-radius:9px;background:var(--sc-panel-2)}#${ROOT_ID} .sc-metric strong{display:block;margin-top:2px;font-size:19px;font-weight:700;letter-spacing:-.025em}#${ROOT_ID} .sc-session{margin-top:10px;color:var(--sc-muted);font-size:11px;display:flex;justify-content:space-between;gap:8px}#${ROOT_ID} .sc-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:11px}#${ROOT_ID} .sc-actions .sc-primary{background:var(--sc-accent);border-color:var(--sc-accent);color:var(--sc-bg);font-weight:650}#${ROOT_ID}[data-proto-theme="dark"] .sc-actions .sc-primary{color:#0f1820}
#${ROOT_ID} .sc-nav-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}#${ROOT_ID} .sc-nav-grid button{text-align:left;min-height:44px}#${ROOT_ID} .sc-nav-grid strong{display:block;font-size:11.5px;font-weight:650}#${ROOT_ID} .sc-nav-grid small{display:block;color:var(--sc-muted);font-size:9.5px;margin-top:2px}#${ROOT_ID} .sc-search{display:flex;gap:7px;margin-top:10px}#${ROOT_ID} .sc-search input{min-width:0;flex:1;border:1px solid var(--sc-border);border-radius:8px;background:var(--sc-panel);padding:7px 9px;font-size:12px}
#${ROOT_ID} .sc-view-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}#${ROOT_ID} .sc-view-head strong{flex:1;font-size:14px;font-weight:680}#${ROOT_ID} .sc-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--sc-border)}#${ROOT_ID} .sc-row:last-child{border-bottom:0}#${ROOT_ID} .sc-row-title{font-weight:620;font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#${ROOT_ID} .sc-row-meta{color:var(--sc-muted);font-size:10px;margin-top:2px}#${ROOT_ID} .sc-row-actions{display:flex;gap:5px}#${ROOT_ID} .sc-row-actions button{padding:4px 7px;font-size:10px}
#${ROOT_ID} .sc-summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}#${ROOT_ID} .sc-summary{padding:10px;border:1px solid var(--sc-border);border-radius:9px;background:var(--sc-panel)}#${ROOT_ID} .sc-summary strong{display:block;font-size:17px;margin-top:2px}#${ROOT_ID} .sc-choice{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px}#${ROOT_ID} .sc-choice button[data-active="true"]{border-color:var(--sc-accent);background:var(--sc-accent-soft);color:var(--sc-accent);font-weight:650}#${ROOT_ID} .sc-note{margin-top:9px;padding:8px 9px;border-radius:8px;background:var(--sc-panel-2);color:var(--sc-muted);font-size:10px}#${ROOT_ID} .sc-error{margin:0 12px 10px;padding:8px 9px;border-radius:8px;background:var(--sc-danger-soft);color:var(--sc-danger);font-size:10px}#${ROOT_ID} .sc-empty{padding:18px 8px;text-align:center;color:var(--sc-muted);font-size:11px}#${ROOT_ID} .sc-foot{padding:7px 10px;border-top:1px solid var(--sc-border);background:var(--sc-panel);color:var(--sc-muted);font-size:9.5px}#${ROOT_ID}[data-proto-collapsed="true"]{width:292px!important}#${ROOT_ID}[data-proto-collapsed="true"] .sc-tabs,#${ROOT_ID}[data-proto-collapsed="true"] .sc-content,#${ROOT_ID}[data-proto-collapsed="true"] .sc-foot{display:none}@media(max-width:460px){#${ROOT_ID}.sc-proto-root{right:8px!important;bottom:8px!important;width:calc(100vw - 16px)!important}}
</style>`;
  }

  function tabMarkup(timer) {
    const rows = eligibleRows(timer);
    const visible = deriveVisibleTabs(rows, {
      hiddenContextIds: [...hiddenTabs],
      selectedContextId,
      operationalContextId: timer.currentContextId
    });
    if (!visible.length) return '<div class="sc-tabs"><span class="sc-empty">No recent jobs</span></div>';
    return `<div class="sc-tabs">${visible.map(row => {
      const selected = row.contextId === selectedContextId;
      const canHide = !row.isOperational && !selected;
      return `<button class="sc-tab" data-action="select" data-context="${escapeHtml(row.contextId)}" data-selected="${selected}">
        <span class="sc-dot" data-tone="${statusTone(row.status)}"></span>
        <span class="sc-tab-label">${escapeHtml(row.shortLabel)}</span>
        ${canHide ? `<span class="sc-tab-x" data-action="hide-tab" data-context="${escapeHtml(row.contextId)}" aria-label="Hide tab">×</span>` : ''}
      </button>`;
    }).join('')}</div>`;
  }

  function viewHeader(title) {
    return `<div class="sc-view-head"><button class="sc-icon-btn" data-action="back" aria-label="Back">‹</button><strong>${escapeHtml(title)}</strong></div>`;
  }

  function openButton(row, label = 'Open Job') {
    if (!safeProjectId(row?.projectId)) return '';
    return `<button data-action="open-job" data-project="${escapeHtml(row.projectId)}">${escapeHtml(label)}</button>`;
  }

  function searchMarkup() {
    return `<form class="sc-search" data-sc-search-form><input name="projectId" inputmode="numeric" autocomplete="off" placeholder="Open job #"><button type="submit">Open</button></form>`;
  }

  function mainView(timer) {
    const selected = selectedRow(timer);
    const operational = currentRow(timer);
    if (!selected) return `<div class="sc-view"><div class="sc-empty">No Companion job history yet. Open a SquareCoil job to begin.</div>${searchMarkup()}</div>`;
    const selectedOperational = selected.contextId === timer.currentContextId;
    const status = selected.status || 'NOT_RUNNING';
    const activeSession = selectedOperational && status.startsWith('RUNNING') && timer.running;
    const actions = [];
    if (selectedOperational && timer.availableActions?.localPause) actions.push('<button class="sc-primary" data-action="timer" data-timer-action="pause">Pause locally</button>');
    if (selectedOperational && timer.availableActions?.resume) {
      actions.push('<button class="sc-primary" data-action="timer" data-timer-action="resume">Resume</button>');
      actions.push('<button data-action="timer" data-timer-action="fresh">Start fresh</button>');
    }
    if (selectedOperational && timer.availableActions?.localResume) actions.push('<button class="sc-primary" data-action="timer" data-timer-action="localResume">Resume locally</button>');
    const open = openButton(selected);
    if (open) actions.push(open);
    const currentStrip = operational && operational.contextId !== selected.contextId
      ? `<div class="sc-current-strip"><div><div class="sc-eyebrow">Actually running / observed</div><div class="sc-row-title">${escapeHtml(operational.label)}</div></div><button data-action="select" data-context="${escapeHtml(operational.contextId)}">View</button></div>` : '';

    return `<div class="sc-view">${currentStrip}<section class="sc-timer-card">
      <div class="sc-eyebrow">${selected.kind === 'job' ? `Job ${escapeHtml(selected.projectId)}` : 'General context'}</div>
      <div class="sc-title">${escapeHtml(selected.label)}</div>
      <div class="sc-status" data-tone="${statusTone(status)}"><span class="sc-dot" data-tone="${statusTone(status)}"></span>${escapeHtml(statusLabel(status))}</div>
      <div class="sc-metrics"><div class="sc-metric"><span class="sc-eyebrow">Today</span><strong>${formatDuration(selected.todayMs)}</strong></div><div class="sc-metric"><span class="sc-eyebrow">Job total</span><strong>${formatDuration(selected.totalMs)}</strong></div></div>
      ${activeSession ? `<div class="sc-session"><span>Current session</span><strong>${formatDuration(timer.running.elapsedMs)}</strong></div>` : ''}
      <div class="sc-actions">${busyAction ? '<button disabled>Working…</button>' : actions.join('')}</div></section>
      <div class="sc-nav-grid"><button data-action="view" data-view="recent"><strong>Recent Jobs</strong><small>Tabs, totals, open jobs</small></button><button data-action="view" data-view="overview"><strong>Time Overview</strong><small>Today and this week</small></button><button data-action="view" data-view="history"><strong>History</strong><small>Recorded sessions</small></button><button data-action="view" data-view="settings"><strong>Settings</strong><small>Theme and surface</small></button></div>${searchMarkup()}</div>`;
  }

  function recentView(timer) {
    const rows = eligibleRows(timer);
    return `<div class="sc-view">${viewHeader('Recent Jobs')}${rows.length ? rows.map(row => {
      const hidden = hiddenTabs.has(row.contextId);
      return `<div class="sc-row"><div><div class="sc-row-title">${escapeHtml(row.label)}</div><div class="sc-row-meta">Today ${formatDuration(row.todayMs,{compact:true})} · Total ${formatDuration(row.totalMs,{compact:true})} · ${escapeHtml(statusLabel(row.status))}</div></div><div class="sc-row-actions"><button data-action="select" data-context="${escapeHtml(row.contextId)}">View</button>${hidden ? `<button data-action="show-tab" data-context="${escapeHtml(row.contextId)}">Show tab</button>` : ''}${openButton(row,'Open')}</div></div>`;
    }).join('') : '<div class="sc-empty">No recent jobs yet.</div>'}</div>`;
  }

  function overviewView(timer) {
    const rows = timer.todayByContext || [];
    return `<div class="sc-view">${viewHeader('Time Overview')}<div class="sc-summary-grid"><div class="sc-summary"><span class="sc-eyebrow">Today total</span><strong>${formatDuration(timer.todayTotalMs)}</strong></div><div class="sc-summary"><span class="sc-eyebrow">This week</span><strong>${formatDuration(timer.weekTotalMs)}</strong></div></div><div class="sc-eyebrow">Today by context</div>${rows.length ? rows.map(row => `<div class="sc-row"><div><div class="sc-row-title">${escapeHtml(row.label)}</div><div class="sc-row-meta">${escapeHtml(row.shortLabel)}</div></div><strong>${formatDuration(row.durationMs,{compact:true})}</strong></div>`).join('') : '<div class="sc-empty">No recorded Companion time today.</div>'}<div class="sc-note">Companion time is your local productivity record, not official payroll time.</div></div>`;
  }

  function historyView(timer) {
    const rows = timer.historyRows || [];
    return `<div class="sc-view">${viewHeader('History')}${rows.length ? rows.map(row => `<div class="sc-row"><div><div class="sc-row-title">${escapeHtml(row.label)}</div><div class="sc-row-meta">${escapeHtml(row.localDate)} · ${escapeHtml(formatClockTime(row.startAtMs))} to ${escapeHtml(formatClockTime(row.endAtMs))}${row.endReason ? ` · ${escapeHtml(row.endReason)}` : ''}</div></div><strong>${formatDuration(row.durationMs,{compact:true})}</strong></div>`).join('') : '<div class="sc-empty">No completed Companion sessions yet.</div>'}</div>`;
  }

  function settingsView() {
    return `<div class="sc-view">${viewHeader('Settings')}<div class="sc-eyebrow">Appearance</div><div class="sc-choice"><button data-action="theme" data-value="light" data-active="${theme==='light'}">Light</button><button data-action="theme" data-value="dark" data-active="${theme==='dark'}">Dark</button></div><div class="sc-choice"><button data-action="surface" data-value="solid" data-active="${surface==='solid'}">Solid</button><button data-action="surface" data-value="glass" data-active="${surface==='glass'}">Glass</button></div><div class="sc-note">This prototype styles only the Companion widget. It does not restyle SquareCoil.</div><div class="sc-eyebrow" style="margin-top:12px">Data tools</div><div class="sc-note">Archive, delete, CSV restore/export, and full-history wipe remain locked until their mutation safety layer is connected.</div></div>`;
  }

  function bodyMarkup(timer) {
    if (!timer) return '<div class="sc-view"><div class="sc-empty">Connecting to the trusted Companion core…</div></div>';
    if (view === 'recent') return recentView(timer);
    if (view === 'overview') return overviewView(timer);
    if (view === 'history') return historyView(timer);
    if (view === 'settings') return settingsView();
    return mainView(timer);
  }

  function render() {
    if (disposed) return;
    const target = mountRoot();
    if (!target) return;
    const core = coreSnapshot();
    const timer = core?.timer || null;
    if (timer) syncSelection(timer);
    target.dataset.protoTheme = theme;
    target.dataset.protoSurface = surface;
    target.dataset.protoCollapsed = collapsed ? 'true' : 'false';
    const status = core?.blocked ? 'Blocked by legacy data' : core?.status ? String(core.status).replace(/-/g,' ') : 'Connecting';
    target.innerHTML = `${styleBlock()}<div class="sc-proto-shell"><div class="sc-proto-topbar"><div class="sc-proto-brand"><strong>SquareCoil Companion</strong><small>Proto Squirel Coil Plugin</small></div><span class="sc-proto-lifecycle" data-sc-status>${escapeHtml(status)}</span><button class="sc-icon-btn" data-action="sync" aria-label="Sync">↻</button><button class="sc-icon-btn" data-action="collapse" aria-label="${collapsed?'Expand':'Collapse'}">${collapsed?'▣':'–'}</button></div>${timer ? tabMarkup(timer) : ''}<div class="sc-content">${bodyMarkup(timer)}</div>${errorMessage ? `<div class="sc-error">${escapeHtml(errorMessage)}</div>` : ''}<div class="sc-foot">Revision ${timer?.revision ?? '—'} · ${escapeHtml(timer?.workdayZone || 'waiting for time basis')}</div></div>`;
  }

  async function invokeTimerAction(key, event) {
    const type = TIMER_ACTIONS[key];
    if (!type) return;
    if (event?.isTrusted !== true) { errorMessage = 'Timer actions require a real user click.'; render(); return; }
    const handle = coreHandle();
    if (!handle || typeof handle.timerAction !== 'function') { errorMessage = 'Trusted timer core is not available yet.'; render(); return; }
    busyAction = key; errorMessage = null; render();
    try {
      await handle.timerAction(type);
      if (typeof handle.syncBridge === 'function') await handle.syncBridge();
    } catch (error) { errorMessage = String(error?.message || error); }
    finally { busyAction = null; render(); }
  }

  function openJob(projectId) {
    const id = safeProjectId(projectId);
    if (!id) { errorMessage = 'Enter a valid SquareCoil job number.'; render(); return; }
    window.open(new URL(`/project.php?id=${id}`, window.location.origin).href, '_blank', 'noopener');
  }

  function onClick(event) {
    const button = event.target.closest?.('[data-action]');
    if (!button || !root?.contains(button)) return;
    const action = button.dataset.action;
    if (action === 'collapse') { collapsed = !collapsed; savePreferences(); render(); return; }
    if (action === 'back') { view = 'main'; render(); return; }
    if (action === 'view') { const next=button.dataset.view; if(VIEW_IDS.has(next)) view=next; render(); return; }
    if (action === 'select') { selectedContextId=button.dataset.context||selectedContextId; view='main'; render(); return; }
    if (action === 'hide-tab') { event.stopPropagation(); const id=button.dataset.context; if(id) hiddenTabs.add(id); savePreferences(); render(); return; }
    if (action === 'show-tab') { const id=button.dataset.context; if(id) hiddenTabs.delete(id); savePreferences(); render(); return; }
    if (action === 'timer') { invokeTimerAction(button.dataset.timerAction,event); return; }
    if (action === 'open-job') { if(event.isTrusted===true) openJob(button.dataset.project); return; }
    if (action === 'theme') { theme=button.dataset.value==='dark'?'dark':'light'; savePreferences(); render(); return; }
    if (action === 'surface') { surface=button.dataset.value==='glass'?'glass':'solid'; savePreferences(); render(); return; }
    if (action === 'sync' && event.isTrusted===true) {
      const handle=coreHandle();
      if(handle&&typeof handle.syncBridge==='function') handle.syncBridge().then(render,error=>{errorMessage=String(error?.message||error);render();});
    }
  }

  function onSubmit(event) {
    if (!event.target.matches?.('[data-sc-search-form]')) return;
    event.preventDefault();
    if (event.isTrusted !== true) return;
    openJob(new FormData(event.target).get('projectId'));
  }

  async function start() {
    if (started) return;
    started = true;
    await loadPreferences();
    render();
    intervalId = window.setInterval(render, REFRESH_MS);
  }

  function teardown() {
    if (disposed) return;
    disposed = true;
    if (intervalId !== null) window.clearInterval(intervalId);
    intervalId = null;
    if (root) { root.removeEventListener('click',onClick); root.removeEventListener('submit',onSubmit); }
    root = null;
  }

  return Object.freeze({ start, render, teardown });
}

module.exports = { ROOT_ID, UI_STORAGE_DEFAULTS, MAX_VISIBLE_JOB_TABS, formatDuration, safeProjectId, deriveVisibleTabs, createWorkspaceUi };
