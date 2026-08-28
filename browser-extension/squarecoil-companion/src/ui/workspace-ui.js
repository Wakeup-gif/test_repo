'use strict';

const { TIMER_COMMANDS } = require('../timer/commands');
const { DATA_COMMANDS } = require('../data/data-safety');
const {
  MAX_VISIBLE_JOB_TABS,
  THRESHOLD_LABELS,
  deriveTabWorkspace,
  focusIntentIsCurrent,
  moveContext
} = require('../workspace/model');

const ROOT_ID = 'ussign-job-timer';
const UI_STORAGE_DEFAULTS = Object.freeze({
  protoUiTheme: 'light',
  protoUiSurface: 'solid',
  protoUiCollapsed: false,
  protoUiHiddenTabs: [],
  b3WorkspaceOrder: [],
  b3LastSelectedContextId: null,
  b3WorkspaceRevision: 0
});
const WORKSPACE_STORAGE_KEYS = new Set(['protoUiHiddenTabs', 'b3WorkspaceOrder', 'b3WorkspaceRevision']);
const VIEW_IDS = new Set(['main', 'recent', 'overview', 'by-day', 'by-context', 'history', 'context-detail', 'settings', 'data-tools']);
const TIMER_ACTIONS = Object.freeze({
  pause: TIMER_COMMANDS.LOCAL_PAUSE,
  resume: TIMER_COMMANDS.RESUME,
  fresh: TIMER_COMMANDS.START_FRESH,
  localResume: TIMER_COMMANDS.LOCAL_RESUME
});
const REFRESH_MS = 1_000;
const HISTORY_PAGE_SIZE = 100;

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatDuration(value, options = {}) {
  const ms = Math.max(0, Number(value) || 0);
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (options.compact === true) return hours > 0 ? `${hours}h ${String(minutes).padStart(2, '0')}m` : `${minutes}m`;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatClockTime(timestampMs) {
  if (!Number.isSafeInteger(timestampMs)) return 'Unknown';
  try { return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(timestampMs)); }
  catch (_) { return 'Unknown'; }
}

function formatDateTime(timestampMs) {
  if (!Number.isSafeInteger(timestampMs)) return 'Unknown';
  try { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestampMs)); }
  catch (_) { return 'Unknown'; }
}

function statusLabel(status) {
  return ({
    RUNNING: 'Running',
    RUNNING_PROVISIONAL: 'Running · verifying',
    VERIFICATION_HOLD: 'Verification hold',
    AWAITING_CHOICE: 'Awaiting choice',
    LOCALLY_PAUSED: 'Locally paused',
    NOT_RUNNING: 'Not running',
    SYNCING: 'Syncing'
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
  return (timer?.contextRows || []).filter(row => row.archivedAtMs == null &&
    String(row.workspaceMembership || '').toUpperCase() !== 'ARCHIVED');
}

function deriveVisibleTabs(rows, state = {}) {
  const protectedIds = new Set([state.selectedContextId, state.operationalContextId].filter(Boolean).map(String));
  return deriveTabWorkspace(rows, {
    ...state,
    hiddenContextIds: (state.hiddenContextIds || []).filter(value => !protectedIds.has(String(value)))
  }).visibleRows;
}

function createWorkspaceUi(options = {}) {
  const document = options.document;
  const window = options.window;
  const storage = options.storage;
  const storageChanges = options.storageChanges || null;
  const getCoreHandle = options.getCoreHandle;
  if (!document || !window || !storage || typeof getCoreHandle !== 'function') throw new Error('workspace-ui-options-required');

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
  let durableOrder = [];
  let workspaceRevision = 0;
  let busyAction = null;
  let errorMessage = null;
  let preferencesLoaded = false;
  let lastGoodCore = null;
  let snapshotStale = false;
  let historyLimit = HISTORY_PAGE_SIZE;
  let processedFocusIntentId = null;
  let pendingFocusIntent = null;
  let selectionSerial = 0;
  let routeProtection = { dirty: false, inProgress: false };
  let draggedContextId = null;
  let pendingFileMode = null;
  let pendingImport = null;
  let dataMessage = null;

  function coreHandle() { return getCoreHandle() || null; }

  function deviceTimeZone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || null; }
    catch (_) { return null; }
  }

  function readCoreSnapshot() {
    const handle = coreHandle();
    if (!handle || typeof handle.coreSnapshot !== 'function') {
      snapshotStale = Boolean(lastGoodCore);
      return lastGoodCore;
    }
    try {
      const candidate = handle.coreSnapshot({ selectedContextId, historyLimit, deviceTimeZone: deviceTimeZone() });
      const currentRevision = lastGoodCore?.timer?.revision;
      const nextRevision = candidate?.timer?.revision;
      if (!candidate?.timer) throw new Error(candidate?.readModelError || 'trusted-read-model-unavailable');
      if (Number.isSafeInteger(currentRevision) && (!Number.isSafeInteger(nextRevision) || nextRevision < currentRevision)) {
        snapshotStale = true;
        errorMessage = 'A stale workspace revision was rejected; showing the last trusted values.';
        return lastGoodCore;
      }
      lastGoodCore = candidate;
      snapshotStale = false;
      return candidate;
    } catch (_) {
      snapshotStale = Boolean(lastGoodCore);
      return lastGoodCore;
    }
  }

  function mountRoot() {
    const candidate = document.getElementById(ROOT_ID);
    if (!candidate) return null;
    if (root === candidate) return root;
    root = candidate;
    root.classList.add('sc-proto-root');
    root.addEventListener('click', onClick);
    root.addEventListener('dblclick', onDoubleClick);
    root.addEventListener('submit', onSubmit);
    root.addEventListener('dragstart', onDragStart);
    root.addEventListener('dragover', onDragOver);
    root.addEventListener('drop', onDrop);
    root.addEventListener('change', onChange);
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
      durableOrder = Array.isArray(value.b3WorkspaceOrder) ? value.b3WorkspaceOrder.map(String) : [];
      selectedContextId = value.b3LastSelectedContextId ? String(value.b3LastSelectedContextId) : null;
      workspaceRevision = Number.isSafeInteger(value.b3WorkspaceRevision) ? value.b3WorkspaceRevision : 0;
    } catch (_) {}
  }

  function savePreferences() {
    workspaceRevision = Math.max(workspaceRevision + 1, Date.now());
    storage.set({
      protoUiTheme: theme,
      protoUiSurface: surface,
      protoUiCollapsed: collapsed,
      protoUiHiddenTabs: [...hiddenTabs],
      b3WorkspaceOrder: [...durableOrder],
      b3LastSelectedContextId: selectedContextId,
      b3WorkspaceRevision: workspaceRevision
    }).catch(() => {});
  }

  function onStorageChanged(changes, areaName) {
    if (areaName && areaName !== 'local') return;
    if (!Object.keys(changes || {}).some(key => WORKSPACE_STORAGE_KEYS.has(key))) return;
    const incomingRevision = changes.b3WorkspaceRevision?.newValue;
    if (Number.isSafeInteger(incomingRevision) && incomingRevision < workspaceRevision) return;
    if (changes.protoUiHiddenTabs) hiddenTabs = new Set(Array.isArray(changes.protoUiHiddenTabs.newValue) ? changes.protoUiHiddenTabs.newValue.map(String) : []);
    if (changes.b3WorkspaceOrder) durableOrder = Array.isArray(changes.b3WorkspaceOrder.newValue) ? changes.b3WorkspaceOrder.newValue.map(String) : [];
    if (Number.isSafeInteger(incomingRevision)) workspaceRevision = incomingRevision;
    render();
  }

  function currentRow(timer) { return (timer?.contextRows || []).find(row => row.contextId === timer.currentContextId) || null; }

  function selectedRow(timer) {
    const rows = timer?.contextRows || [];
    return rows.find(row => row.contextId === selectedContextId) || rows.find(row => row.contextId === timer.currentContextId) || rows[0] || null;
  }

  function applyFocusIntent(intent, timer) {
    if (!focusIntentIsCurrent(intent, timer)) return false;
    hiddenTabs.delete(intent.contextId);
    selectedContextId = intent.contextId;
    view = 'main';
    collapsed = false;
    processedFocusIntentId = intent.intentId;
    pendingFocusIntent = null;
    savePreferences();
    return true;
  }

  function syncSelection(timer) {
    const rows = timer?.contextRows || [];
    const operational = timer?.currentContextId || null;
    const intent = timer?.focusIntent || null;
    const firstSnapshot = lastOperationalContextId === null && processedFocusIntentId === null;
    let visibilityChanged = false;
    if (operational && hiddenTabs.has(operational)) {
      hiddenTabs.delete(operational);
      visibilityChanged = true;
    }
    if (firstSnapshot && intent && focusIntentIsCurrent(intent, timer)) {
      selectedContextId = operational;
    } else if (!selectedContextId || !rows.some(row => row.contextId === selectedContextId)) {
      const visible = deriveTabWorkspace(rows, { hiddenContextIds: [...hiddenTabs], durableOrder, selectedContextId: null, operationalContextId: operational });
      selectedContextId = (intent && operational) || visible.visibleRows[0]?.contextId || null;
    }

    if (firstSnapshot) {
      processedFocusIntentId = intent?.intentId || '__baseline__';
    } else if (intent && intent.intentId !== processedFocusIntentId && focusIntentIsCurrent(intent, timer)) {
      if (routeProtection.dirty || routeProtection.inProgress) {
        if (!pendingFocusIntent || intent.sourceStateRevision >= pendingFocusIntent.intent.sourceStateRevision) {
          pendingFocusIntent = { intent, selectionSerialAtDeferral: selectionSerial };
        }
        processedFocusIntentId = intent.intentId;
      } else applyFocusIntent(intent, timer);
    } else if (timer.lastObservation === undefined && operational && lastOperationalContextId && operational !== lastOperationalContextId) {
      // Compatibility for the inherited B2 prototype fixture. Canonical B3
      // snapshots always include lastObservation/focusIntent provenance.
      selectedContextId = operational;
      view = 'main';
      collapsed = false;
    }
    lastOperationalContextId = operational;
    if (visibilityChanged) savePreferences();
  }

  function flushDeferredFocus(timer) {
    if (!pendingFocusIntent || routeProtection.dirty || routeProtection.inProgress) return false;
    const pending = pendingFocusIntent;
    pendingFocusIntent = null;
    if (selectionSerial !== pending.selectionSerialAtDeferral) return false;
    return applyFocusIntent(pending.intent, timer);
  }

  function styleBlock() {
    return `<style data-sc-proto-style>
#${ROOT_ID}.sc-proto-root{all:initial;position:fixed!important;right:20px!important;bottom:20px!important;z-index:2147483640!important;width:410px!important;max-width:calc(100vw - 32px)!important;color-scheme:light;--sc-bg:#f4f6f8;--sc-panel:#fff;--sc-panel-2:#eef2f5;--sc-text:#18212b;--sc-muted:#65707c;--sc-border:#d8dee5;--sc-accent:#315c7a;--sc-accent-soft:#e7f0f6;--sc-positive:#26734d;--sc-positive-soft:#e5f4ec;--sc-warning:#8b5a12;--sc-warning-soft:#fff1d7;--sc-danger:#a13a3a;--sc-danger-soft:#fae6e6;--sc-shadow:0 18px 48px rgba(20,32,44,.22),0 3px 12px rgba(20,32,44,.12);font:400 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
#${ROOT_ID}.sc-proto-root[data-proto-theme="dark"]{color-scheme:dark;--sc-bg:#11161c;--sc-panel:#191f26;--sc-panel-2:#222a33;--sc-text:#e7edf3;--sc-muted:#9aa6b2;--sc-border:#343e49;--sc-accent:#8cb9d6;--sc-accent-soft:#203543;--sc-positive:#75c69d;--sc-positive-soft:#173628;--sc-warning:#edbe6f;--sc-warning-soft:#3b2f1b;--sc-danger:#ef9a9a;--sc-danger-soft:#442323;--sc-shadow:0 18px 52px rgba(0,0,0,.46),0 3px 14px rgba(0,0,0,.32)}
#${ROOT_ID}.sc-proto-root *{box-sizing:border-box!important;font:inherit}#${ROOT_ID} .sc-proto-shell{overflow:hidden;border:1px solid var(--sc-border);border-radius:14px;background:var(--sc-bg);color:var(--sc-text);box-shadow:var(--sc-shadow)}#${ROOT_ID}[data-proto-surface="glass"] .sc-proto-shell{background:color-mix(in srgb,var(--sc-bg) 82%,transparent);backdrop-filter:blur(18px) saturate(125%)}
#${ROOT_ID} .sc-proto-topbar{display:flex;align-items:center;gap:10px;min-height:44px;padding:9px 10px 8px 12px;background:var(--sc-panel);border-bottom:1px solid var(--sc-border)}#${ROOT_ID} .sc-proto-brand{min-width:0;flex:1}#${ROOT_ID} .sc-proto-brand strong{display:block;font-weight:650;font-size:13px}#${ROOT_ID} .sc-proto-brand small,#${ROOT_ID} .sc-proto-lifecycle{color:var(--sc-muted);font-size:10px}#${ROOT_ID} button,#${ROOT_ID} input{color:inherit}#${ROOT_ID} button{border:1px solid var(--sc-border);background:var(--sc-panel);border-radius:8px;padding:6px 9px;cursor:pointer}#${ROOT_ID} button:hover{background:var(--sc-panel-2)}#${ROOT_ID} button:focus-visible,#${ROOT_ID} input:focus-visible{outline:2px solid var(--sc-accent);outline-offset:2px}#${ROOT_ID} button[disabled]{opacity:.5;cursor:not-allowed}#${ROOT_ID} .sc-icon-btn{width:30px;height:30px;padding:0;display:grid;place-items:center}
#${ROOT_ID} .sc-tabs{display:flex;gap:4px;align-items:stretch;padding:8px 8px 0;overflow-x:auto;background:var(--sc-panel-2);border-bottom:1px solid var(--sc-border)}#${ROOT_ID} .sc-tab{min-width:68px;max-width:108px;min-height:42px;display:grid;grid-template-columns:8px minmax(0,1fr) auto;grid-template-rows:auto auto;gap:0 5px;padding:4px 6px;border-radius:8px 8px 0 0;border-bottom:0;background:transparent;color:var(--sc-muted)}#${ROOT_ID} .sc-tab[data-selected="true"]{background:var(--sc-bg);color:var(--sc-text);position:relative;top:1px}#${ROOT_ID} .sc-tab-label,#${ROOT_ID} .sc-tab-time{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}#${ROOT_ID} .sc-tab-label{font-size:10.5px;font-weight:650}#${ROOT_ID} .sc-tab-time{font-size:9px}#${ROOT_ID} .sc-tab-x{border:0;background:transparent;padding:0;width:14px;height:14px;font-size:12px}#${ROOT_ID} .sc-dot{width:6px;height:6px;border-radius:50%;align-self:center;background:var(--sc-muted)}#${ROOT_ID} .sc-dot[data-tone="positive"]{background:var(--sc-positive)}#${ROOT_ID} .sc-dot[data-tone="warning"]{background:var(--sc-warning)}#${ROOT_ID} .sc-dot[data-tone="danger"]{background:var(--sc-danger)}#${ROOT_ID} .sc-tab[data-threshold="YELLOW"]{box-shadow:inset 0 3px #d9a51f}#${ROOT_ID} .sc-tab[data-threshold="ORANGE"]{box-shadow:inset 0 3px #d97820}#${ROOT_ID} .sc-tab[data-threshold="RED"]{box-shadow:inset 0 3px var(--sc-danger)}
#${ROOT_ID} .sc-content{max-height:540px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin}#${ROOT_ID} .sc-view{padding:12px}#${ROOT_ID} .sc-current-strip{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;margin-bottom:9px;border:1px solid var(--sc-border);background:var(--sc-panel);border-radius:9px}#${ROOT_ID} .sc-eyebrow{color:var(--sc-muted);font-size:10px;text-transform:uppercase;letter-spacing:.06em}#${ROOT_ID} .sc-title{margin-top:2px;font-size:15px;font-weight:680;overflow-wrap:anywhere}#${ROOT_ID} .sc-status{display:inline-flex;align-items:center;gap:6px;margin-top:6px;border-radius:999px;padding:3px 7px;font-size:10.5px;font-weight:650;background:var(--sc-panel-2);color:var(--sc-muted)}#${ROOT_ID} .sc-status[data-tone="positive"]{background:var(--sc-positive-soft);color:var(--sc-positive)}#${ROOT_ID} .sc-status[data-tone="warning"]{background:var(--sc-warning-soft);color:var(--sc-warning)}#${ROOT_ID} .sc-status[data-tone="danger"]{background:var(--sc-danger-soft);color:var(--sc-danger)}
#${ROOT_ID} .sc-timer-card{padding:13px;border:1px solid var(--sc-border);border-radius:11px;background:var(--sc-panel)}#${ROOT_ID} .sc-metrics,#${ROOT_ID} .sc-summary-grid{display:grid;grid-template-columns:1.25fr 1fr;gap:9px;margin-top:12px}#${ROOT_ID} .sc-metric,#${ROOT_ID} .sc-summary{padding:10px;border:1px solid var(--sc-border);border-radius:9px;background:var(--sc-panel-2)}#${ROOT_ID} .sc-metric strong,#${ROOT_ID} .sc-summary strong{display:block;margin-top:2px;font-size:18px;font-weight:700}#${ROOT_ID} .sc-session{margin-top:10px;color:var(--sc-muted);font-size:11px;display:flex;justify-content:space-between}#${ROOT_ID} .sc-actions,#${ROOT_ID} .sc-row-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}#${ROOT_ID} .sc-actions .sc-primary{background:var(--sc-accent);border-color:var(--sc-accent);color:var(--sc-bg);font-weight:650}#${ROOT_ID} .sc-nav-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}#${ROOT_ID} .sc-nav-grid button{text-align:left;min-height:44px}#${ROOT_ID} .sc-nav-grid strong{display:block;font-size:11.5px;font-weight:650}#${ROOT_ID} .sc-nav-grid small{display:block;color:var(--sc-muted);font-size:9.5px;margin-top:2px}#${ROOT_ID} .sc-search{display:flex;gap:7px;margin-top:10px}#${ROOT_ID} .sc-search input{min-width:0;flex:1;border:1px solid var(--sc-border);border-radius:8px;background:var(--sc-panel);padding:7px 9px}
#${ROOT_ID} .sc-view-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}#${ROOT_ID} .sc-view-head strong{flex:1;font-size:14px;font-weight:680}#${ROOT_ID} .sc-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--sc-border)}#${ROOT_ID} .sc-row-title{font-weight:620;font-size:11.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#${ROOT_ID} .sc-row-meta{color:var(--sc-muted);font-size:10px;margin-top:2px}#${ROOT_ID} .sc-row-actions{margin-top:0;justify-content:flex-end}#${ROOT_ID} .sc-row-actions button{padding:4px 7px;font-size:10px}#${ROOT_ID} .sc-choice{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px}#${ROOT_ID} .sc-choice button[data-active="true"]{border-color:var(--sc-accent);background:var(--sc-accent-soft);color:var(--sc-accent);font-weight:650}#${ROOT_ID} .sc-note,#${ROOT_ID} .sc-stale{margin-top:9px;padding:8px 9px;border-radius:8px;background:var(--sc-panel-2);color:var(--sc-muted);font-size:10px}#${ROOT_ID} .sc-stale{background:var(--sc-warning-soft);color:var(--sc-warning)}#${ROOT_ID} .sc-error{margin:0 12px 10px;padding:8px 9px;border-radius:8px;background:var(--sc-danger-soft);color:var(--sc-danger);font-size:10px}#${ROOT_ID} .sc-empty{padding:18px 8px;text-align:center;color:var(--sc-muted);font-size:11px}#${ROOT_ID} .sc-foot{padding:7px 10px;border-top:1px solid var(--sc-border);background:var(--sc-panel);color:var(--sc-muted);font-size:9.5px}#${ROOT_ID}[data-proto-collapsed="true"]{width:292px!important}#${ROOT_ID}[data-proto-collapsed="true"] .sc-tabs,#${ROOT_ID}[data-proto-collapsed="true"] .sc-content,#${ROOT_ID}[data-proto-collapsed="true"] .sc-foot{display:none}@media(max-width:460px){#${ROOT_ID}.sc-proto-root{right:8px!important;bottom:8px!important;width:calc(100vw - 16px)!important}}
</style>`;
  }

  function marker(row) {
    if (row?.isSafetyHeld) return ' · held';
    if (row?.isProvisional) return ' · provisional';
    return '';
  }

  function tabMarkup(timer) {
    const workspace = deriveTabWorkspace(eligibleRows(timer), { hiddenContextIds: [...hiddenTabs], durableOrder, selectedContextId, operationalContextId: timer.currentContextId });
    durableOrder = [...workspace.order];
    if (!workspace.visibleRows.length) return '<div class="sc-tabs"><span class="sc-empty">No recent jobs</span></div>';
    return `<div class="sc-tabs">${workspace.visibleRows.map(row => {
      const selected = row.contextId === selectedContextId;
      const canHide = !row.isOperational && !selected;
      const threshold = row.thresholdLevel || 'NONE';
      const thresholdText = THRESHOLD_LABELS[threshold] || THRESHOLD_LABELS.NONE;
      return `<button class="sc-tab" draggable="true" data-action="select" data-context="${escapeHtml(row.contextId)}" data-selected="${selected}" data-threshold="${escapeHtml(threshold)}" aria-label="${escapeHtml(`${row.label}, Today ${formatDuration(row.todayMs, { compact: true })}, ${thresholdText}, ${statusLabel(row.status)}${marker(row)}`)}">
        <span class="sc-dot" data-tone="${statusTone(row.status)}"></span><span class="sc-tab-label">${escapeHtml(row.shortLabel)}</span>${canHide ? `<span class="sc-tab-x" data-action="hide-tab" data-context="${escapeHtml(row.contextId)}" aria-label="Hide tab">×</span>` : '<span></span>'}<span></span><span class="sc-tab-time">${formatDuration(row.todayMs, { compact: true })}${row.isProvisional ? '*' : ''} · ${escapeHtml(threshold)}</span><span></span>
      </button>`;
    }).join('')}</div>`;
  }

  function viewHeader(title, backView = 'main') { return `<div class="sc-view-head"><button class="sc-icon-btn" data-action="view" data-view="${escapeHtml(backView)}" aria-label="Back">‹</button><strong>${escapeHtml(title)}</strong></div>`; }
  function openButton(row, label = 'Open Job') { return safeProjectId(row?.projectId) ? `<button data-action="open-job" data-project="${escapeHtml(row.projectId)}">${escapeHtml(label)}</button>` : ''; }
  function searchMarkup() { return `<form class="sc-search" data-sc-search-form><input name="projectId" inputmode="search" autocomplete="off" placeholder="Find known context or open job #"><button type="submit">Find</button></form>`; }

  function currentStrip(timer, operational, selected) {
    if (!operational) return '';
    const different = operational.contextId !== selected?.contextId;
    return `<div class="sc-current-strip"><div><div class="sc-eyebrow">Actually running / observed</div><div class="sc-row-title">${escapeHtml(operational.label)}</div><div class="sc-row-meta">Today ${formatDuration(operational.todayMs, { compact: true })}${marker(operational)} · ${escapeHtml(statusLabel(operational.status))}</div></div>${different ? `<button data-action="select" data-context="${escapeHtml(operational.contextId)}">View</button>` : ''}</div>`;
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
    if (selectedOperational && timer.availableActions?.resume) { actions.push('<button class="sc-primary" data-action="timer" data-timer-action="resume">Resume</button>'); actions.push('<button data-action="timer" data-timer-action="fresh">Start fresh</button>'); }
    if (selectedOperational && timer.availableActions?.localResume) actions.push('<button class="sc-primary" data-action="timer" data-timer-action="localResume">Resume locally</button>');
    const open = openButton(selected); if (open) actions.push(open);
    actions.push(`<button data-action="context-detail" data-context="${escapeHtml(selected.contextId)}">Context detail</button>`);
    const pending = selectedOperational && timer.pending ? `<div class="sc-note">Awaiting choice. Resume can begin from ${escapeHtml(formatClockTime(timer.pending.safeStartAnchorMs))}; this safe anchor is not counted until a choice commits.</div>` : '';
    const hold = selected.isSafetyHeld ? '<div class="sc-note">Companion stopped extending the local value at the shared verification boundary. This does not claim that the native SquareCoil clock was paused.</div>' : '';
    const native = timer.nativeDisposition && timer.nativeDisposition !== 'TRACKABLE_CONTEXT'
      ? `<div class="sc-note">Native disposition: ${escapeHtml(timer.nativeDisposition.toLowerCase().replace(/_/g, ' '))}. This is separate from the selected Context status.</div>` : '';
    return `<div class="sc-view">${currentStrip(timer, operational, selected)}<section class="sc-timer-card"><div class="sc-eyebrow">${selected.kind === 'job' ? `Job ${escapeHtml(selected.projectId)}` : 'General context'}</div><div class="sc-title">${escapeHtml(selected.label)}</div><div class="sc-status" data-tone="${statusTone(status)}"><span class="sc-dot" data-tone="${statusTone(status)}"></span>${escapeHtml(statusLabel(status))}</div><div class="sc-metrics"><div class="sc-metric"><span class="sc-eyebrow">Today</span><strong>${formatDuration(selected.todayMs)}${selected.isProvisional ? '*' : ''}</strong></div><div class="sc-metric"><span class="sc-eyebrow">${selected.kind === 'job' ? 'Job total' : 'Context total'}</span><strong>${formatDuration(selected.totalMs)}${selected.isProvisional ? '*' : ''}</strong></div></div>${activeSession ? `<div class="sc-session"><span>Current session${timer.running.provisional ? ' · provisional' : ''}</span><strong>${formatDuration(timer.running.elapsedMs)}</strong></div>` : ''}${pending}${hold}${native}<div class="sc-actions">${busyAction ? '<button disabled>Working…</button>' : actions.join('')}</div></section><div class="sc-nav-grid"><button data-action="view" data-view="recent"><strong>Recent Jobs</strong><small>Visibility, recency, status</small></button><button data-action="view" data-view="overview"><strong>Time Overview</strong><small>Today, week, day, context</small></button><button data-action="view" data-view="history"><strong>History</strong><small>Finalized logical sessions</small></button><button data-action="view" data-view="settings"><strong>Settings</strong><small>Inherited appearance only</small></button></div>${searchMarkup()}</div>`;
  }

  function recentView(timer) {
    const rows = eligibleRows(timer);
    const workspace = deriveTabWorkspace(rows, { hiddenContextIds: [...hiddenTabs], durableOrder, selectedContextId, operationalContextId: timer.currentContextId });
    return `<div class="sc-view">${viewHeader('Recent Jobs')}<div class="sc-actions"><button data-action="data-simple" data-data-type="${DATA_COMMANDS.ARCHIVE_ELIGIBLE}">Archive eligible</button><button data-action="data-simple" data-data-type="${DATA_COMMANDS.CLEAR_RECENT}">Clear Recent</button></div><div class="sc-note">Clear Recent only removes inactive jobs from this workspace. It never deletes their Companion history.</div>${rows.length ? rows.map(row => {
      const disposition = workspace.dispositionByContextId[row.contextId] || 'OVERFLOW';
      return `<div class="sc-row"><div><div class="sc-row-title">${escapeHtml(row.label)}</div><div class="sc-row-meta">Today ${formatDuration(row.todayMs, { compact: true })}${marker(row)} · Total ${formatDuration(row.totalMs, { compact: true })} · ${escapeHtml(statusLabel(row.status))}</div><div class="sc-row-meta">Last seen ${escapeHtml(formatDateTime(row.lastSeenAtMs))} · Last recorded ${escapeHtml(formatDateTime(row.lastRecordedActivityAtMs))} · ${escapeHtml(disposition.toLowerCase())}</div></div><div class="sc-row-actions"><button data-action="select" data-context="${escapeHtml(row.contextId)}">View</button><button data-action="data-context" data-data-type="${DATA_COMMANDS.ARCHIVE_CONTEXT}" data-context="${escapeHtml(row.contextId)}" ${row.status !== 'NOT_RUNNING' ? 'disabled' : ''}>Archive</button>${disposition !== 'VISIBLE' ? `<button data-action="show-tab" data-context="${escapeHtml(row.contextId)}">Show in Tabs</button>` : ''}${openButton(row, 'Open')}</div></div>`;
    }).join('') : '<div class="sc-empty">No recent jobs in the workspace.</div>'}</div>`;
  }

  function overviewView(timer) {
    const rows = timer.todayByContext || [];
    const basis = timer.timeBasis?.disclosed ? `<div class="sc-note">${escapeHtml(timer.timeBasis.label)}${timer.timeBasis.deviceMismatch ? ` · device uses ${escapeHtml(timer.timeBasis.deviceTimeZone)}` : ''}${timer.timeBasis.diagnostic ? ` · ${escapeHtml(timer.timeBasis.diagnostic)}` : ''}</div>` : '';
    return `<div class="sc-view">${viewHeader('Time Overview')}<div class="sc-summary-grid"><div class="sc-summary"><span class="sc-eyebrow">Today total</span><strong>${formatDuration(timer.todayTotalMs)}${timer.todayTotalIsProvisional ? '*' : ''}</strong></div><div class="sc-summary"><span class="sc-eyebrow">This week</span><strong>${formatDuration(timer.weekTotalMs)}${timer.weekTotalIsProvisional ? '*' : ''}</strong></div></div><div class="sc-eyebrow">Today by job / context</div>${rows.length ? rows.map(row => `<div class="sc-row"><div><div class="sc-row-title">${escapeHtml(row.label)}</div><div class="sc-row-meta">${escapeHtml(statusLabel(row.status))}${marker(row)}</div></div><button data-action="context-detail" data-context="${escapeHtml(row.contextId)}">${formatDuration(row.durationMs, { compact: true })}</button></div>`).join('') : '<div class="sc-empty">No Companion time recorded today.</div>'}<div class="sc-nav-grid"><button data-action="view" data-view="by-day"><strong>By Day</strong><small>Persisted workday dates</small></button><button data-action="view" data-view="by-context"><strong>By Job / Context</strong><small>Recorded activity order</small></button></div>${basis}<div class="sc-note">Companion time is your local productivity record, not official payroll time.</div></div>`;
  }

  function byDayView(timer) {
    const rows = timer.byDayRows || [];
    return `<div class="sc-view">${viewHeader('By Day', 'overview')}${rows.length ? rows.map(row => `<div class="sc-row"><div><div class="sc-row-title">${escapeHtml(row.localDate)}</div><div class="sc-row-meta">${row.contextCount} context${row.contextCount === 1 ? '' : 's'}${row.topContextLabel ? ` · top ${escapeHtml(row.topContextLabel)} ${formatDuration(row.topContextDurationMs, { compact: true })}` : ''}</div></div><strong>${formatDuration(row.durationMs, { compact: true })}</strong></div>`).join('') : '<div class="sc-empty">No dated Companion history yet.</div>'}</div>`;
  }

  function byContextView(timer) {
    const rows = timer.byContextRows || [];
    return `<div class="sc-view">${viewHeader('By Job / Context', 'overview')}${rows.length ? rows.map(row => `<div class="sc-row"><div><div class="sc-row-title">${escapeHtml(row.label)}</div><div class="sc-row-meta">Today ${formatDuration(row.todayMs, { compact: true })} · Last recorded ${escapeHtml(formatDateTime(row.lastRecordedActivityAtMs))}${row.legacyUnattributedMs ? ` · older undated ${formatDuration(row.legacyUnattributedMs, { compact: true })}` : ''}</div></div><button data-action="context-detail" data-context="${escapeHtml(row.contextId)}">${formatDuration(row.totalMs, { compact: true })}</button></div>`).join('') : '<div class="sc-empty">No authoritative Companion time yet.</div>'}</div>`;
  }

  function historyView(timer) {
    const rows = timer.historyRows || [];
    return `<div class="sc-view">${viewHeader('History')}${rows.length ? rows.map(row => `<div class="sc-row"><div><div class="sc-row-title">${escapeHtml(row.label)}</div><div class="sc-row-meta">${escapeHtml(row.localDates?.join(' → ') || row.localDate)} · ${escapeHtml(formatClockTime(row.startAtMs))} to ${escapeHtml(formatClockTime(row.endAtMs))}${row.endReason ? ` · ${escapeHtml(row.endReason)}` : ''}</div><div class="sc-row-meta">Session ${escapeHtml(row.sessionId)} · cycle ${escapeHtml(row.cycleId)} · ${row.segmentIds?.length || 1} ledger segment${(row.segmentIds?.length || 1) === 1 ? '' : 's'}</div></div><strong>${formatDuration(row.durationMs, { compact: true })}</strong></div>`).join('') : '<div class="sc-empty">No completed Companion sessions yet.</div>'}${timer.historyHasMore ? `<div class="sc-actions"><button data-action="load-history">Load more (${timer.historyRows.length} of ${timer.historyTotal})</button></div>` : ''}<div class="sc-note">History contains finalized Companion work only. Live sessions remain in the current-session area.</div></div>`;
  }

  function contextDetailView(timer) {
    const detail = timer.contextDetails?.[selectedContextId] || null;
    if (!detail) return `<div class="sc-view">${viewHeader('Context Detail', 'overview')}<div class="sc-empty">No matching job found.</div></div>`;
    return `<div class="sc-view">${viewHeader('Context Detail', 'overview')}<div class="sc-title">${escapeHtml(detail.label)}</div><div class="sc-status" data-tone="${statusTone(detail.status)}">${escapeHtml(statusLabel(detail.status))}${marker(detail)}</div><div class="sc-summary-grid"><div class="sc-summary"><span class="sc-eyebrow">Recorded Today</span><strong>${formatDuration(detail.todayMs)}</strong></div><div class="sc-summary"><span class="sc-eyebrow">This Week</span><strong>${formatDuration(detail.weekMs)}</strong></div><div class="sc-summary"><span class="sc-eyebrow">Context Total</span><strong>${formatDuration(detail.totalMs)}</strong></div><div class="sc-summary"><span class="sc-eyebrow">Dated history</span><strong>${formatDuration(detail.datedMs)}</strong></div></div>${detail.legacyUnattributedMs ? `<div class="sc-note">Older time without date detail: ${formatDuration(detail.legacyUnattributedMs)}. It is included in Total but not fabricated into Today, Week, or daily history.</div>` : ''}<div class="sc-eyebrow" style="margin-top:12px">Daily attributed totals</div>${detail.dailyRows?.length ? detail.dailyRows.slice().reverse().map(day => `<div class="sc-row"><span>${escapeHtml(day.localDate)}</span><strong>${formatDuration(day.durationMs, { compact: true })}</strong></div>`).join('') : '<div class="sc-empty">No dated history for this context.</div>'}<div class="sc-eyebrow" style="margin-top:12px">Finalized logical sessions</div>${detail.finalizedSessions?.length ? detail.finalizedSessions.slice(0, 20).map(session => `<div class="sc-row"><span>${escapeHtml(formatDateTime(session.endAtMs))}</span><strong>${formatDuration(session.durationMs, { compact: true })}</strong></div>`).join('') : '<div class="sc-empty">No finalized sessions.</div>'}<div class="sc-actions">${openButton(detail)}</div></div>`;
  }

  function settingsView() {
    return `<div class="sc-view">${viewHeader('Settings')}<div class="sc-eyebrow">Appearance</div><div class="sc-choice"><button data-action="theme" data-value="light" data-active="${theme === 'light'}">Light</button><button data-action="theme" data-value="dark" data-active="${theme === 'dark'}">Dark</button></div><div class="sc-choice"><button data-action="surface" data-value="solid" data-active="${surface === 'solid'}">Solid</button><button data-action="surface" data-value="glass" data-active="${surface === 'glass'}">Glass</button></div><div class="sc-note">This inherited appearance surface styles only the Companion widget. Full B5 settings follow after the B4 data gate.</div><div class="sc-eyebrow" style="margin-top:12px">Data tools</div><div class="sc-nav-grid"><button data-action="view" data-view="data-tools"><strong>Archives &amp; Backup</strong><small>Safe cleanup, backup, restore, and CSV</small></button></div></div>`;
  }

  function conflictMarkup() {
    if (!pendingImport?.plan?.conflicts?.length) return '';
    return `<div class="sc-note"><strong>Import needs review.</strong> Nothing has been written.</div>${pendingImport.plan.conflicts.map(conflict => `<div class="sc-row"><div><div class="sc-row-title">${escapeHtml(conflict.code)}</div><div class="sc-row-meta">${escapeHtml(conflict.contextId || '')}${conflict.incomingSegmentId ? ` · incoming ${escapeHtml(conflict.incomingSegmentId)}` : ''}</div></div>${conflict.resolvable ? `<div class="sc-row-actions"><button data-action="resolve-conflict" data-conflict="${escapeHtml(conflict.id)}" data-resolution="KEEP_CURRENT">Keep Current</button><button data-action="resolve-conflict" data-conflict="${escapeHtml(conflict.id)}" data-resolution="USE_INCOMING">Use Incoming</button></div>` : '<span class="sc-status" data-tone="danger">Must fix file</span>'}</div>`).join('')}`;
  }

  function dataToolsView(core) {
    const data = core?.data;
    const archived = data?.archivedRows || [];
    const readiness = data ? (data.quiescent ? 'Idle · global destructive operations available' : 'Timer/recovery state is not quiescent · Replace and Wipe are blocked') : 'Data safety read model unavailable';
    return `<div class="sc-view">${viewHeader('Archives & Backup', 'settings')}${dataMessage ? `<div class="sc-note">${escapeHtml(dataMessage)}</div>` : ''}<div class="sc-eyebrow">Portable files</div><div class="sc-actions"><button data-action="data-export" data-export="FULL_BACKUP">Full Backup JSON</button><button data-action="data-export" data-export="HISTORY_CSV">History CSV</button><button data-action="data-export" data-export="TIME_REPORT_CSV">Time Report CSV</button></div><div class="sc-actions"><button data-action="pick-file" data-file-mode="BACKUP_MERGE">Restore Backup · Merge</button><button data-action="pick-file" data-file-mode="BACKUP_REPLACE" ${data?.quiescent ? '' : 'disabled'}>Restore Backup · Replace</button><button data-action="pick-file" data-file-mode="HISTORY_CSV">Import History CSV</button></div><input data-sc-data-file type="file" accept=".json,.csv,application/json,text/csv" hidden><div class="sc-note">Full Backup is disaster recovery. History CSV is portable finalized history. Time Report CSV is reporting-only and cannot be imported.</div>${conflictMarkup()}<div class="sc-eyebrow" style="margin-top:12px">Archived contexts</div>${archived.length ? archived.map(row => `<div class="sc-row"><div><div class="sc-row-title">${escapeHtml(row.label)}</div><div class="sc-row-meta">Total ${formatDuration(row.totalMs, { compact: true })} · archived ${escapeHtml(formatDateTime(row.archivedAtMs))}</div></div><div class="sc-row-actions"><button data-action="data-context" data-data-type="${DATA_COMMANDS.RESTORE_ARCHIVED}" data-context="${escapeHtml(row.contextId)}">Restore</button><button data-action="data-context" data-data-type="${DATA_COMMANDS.DELETE_CONTEXT}" data-context="${escapeHtml(row.contextId)}" data-label="${escapeHtml(row.label)}" ${row.protected ? 'disabled' : ''}>Delete Data</button></div></div>`).join('') : '<div class="sc-empty">No archived Contexts.</div>'}<div class="sc-eyebrow" style="margin-top:12px">High-impact cleanup</div><div class="sc-actions"><button data-action="data-simple" data-data-type="${DATA_COMMANDS.DELETE_ALL_ARCHIVED}" ${archived.length ? '' : 'disabled'}>Delete All Archived Data</button><button data-action="data-simple" data-data-type="${DATA_COMMANDS.WIPE_HISTORY}" ${data?.quiescent ? '' : 'disabled'}>Wipe All Time History</button></div><div class="sc-note">${escapeHtml(readiness)}. These tools only affect Companion data; SquareCoil official time is never changed.</div></div>`;
  }

  function bodyMarkup(timer, core) {
    if (!timer) return '<div class="sc-view"><div class="sc-empty">Connecting to the trusted Companion core…</div></div>';
    if (view === 'recent') return recentView(timer);
    if (view === 'overview') return overviewView(timer);
    if (view === 'by-day') return byDayView(timer);
    if (view === 'by-context') return byContextView(timer);
    if (view === 'history') return historyView(timer);
    if (view === 'context-detail') return contextDetailView(timer);
    if (view === 'settings') return settingsView();
    if (view === 'data-tools') return dataToolsView(core);
    return mainView(timer);
  }

  function render({ allowInteractionDeferral = false } = {}) {
    if (disposed) return;
    const target = mountRoot(); if (!target) return;
    if (allowInteractionDeferral && (collapsed || draggedContextId || pendingFileMode || target.querySelector?.('button:hover, input:hover, input:focus, button:focus-visible'))) return;
    const previousScroll = target.querySelector?.('.sc-content')?.scrollTop || 0;
    const core = readCoreSnapshot();
    const timer = core?.timer || null;
    if (timer) { syncSelection(timer); flushDeferredFocus(timer); }
    target.dataset.protoTheme = theme;
    target.dataset.protoSurface = surface;
    target.dataset.protoCollapsed = collapsed ? 'true' : 'false';
    target.dataset.workspaceState = snapshotStale ? 'stale' : timer ? 'loaded' : 'loading';
    const status = core?.blocked ? 'Blocked by legacy data' : core?.status ? String(core.status).replace(/-/g, ' ') : 'Connecting';
    const basis = timer?.timeBasis?.disclosed ? timer.timeBasis.label : timer?.workdayZone || 'waiting for time basis';
    target.innerHTML = `${styleBlock()}<div class="sc-proto-shell"><div class="sc-proto-topbar"><div class="sc-proto-brand"><strong>SquareCoil Companion</strong><small>B4 data safety</small></div><span class="sc-proto-lifecycle" data-sc-status>${escapeHtml(status)}</span><button class="sc-icon-btn" data-action="sync" aria-label="Sync">↻</button><button class="sc-icon-btn" data-action="collapse" aria-label="${collapsed ? 'Expand' : 'Collapse'}">${collapsed ? '▣' : '–'}</button></div>${timer ? tabMarkup(timer) : ''}<div class="sc-content">${snapshotStale ? '<div class="sc-stale">Showing the last trusted revision while the workspace revalidates.</div>' : ''}${bodyMarkup(timer, core)}</div>${errorMessage ? `<div class="sc-error">${escapeHtml(errorMessage)}</div>` : ''}<div class="sc-foot">Revision ${timer?.revision ?? '—'} · preference ${timer?.sourcePreferenceRevision ?? '—'} · ${escapeHtml(basis)}</div></div>`;
    const content = target.querySelector?.('.sc-content'); if (content) content.scrollTop = previousScroll;
  }

  async function invokeTimerAction(key, event) {
    const type = TIMER_ACTIONS[key]; if (!type) return;
    if (event?.isTrusted !== true) { errorMessage = 'Timer actions require a real user click.'; render(); return; }
    const handle = coreHandle();
    if (!handle || typeof handle.timerAction !== 'function') { errorMessage = 'Trusted timer core is not available yet.'; render(); return; }
    busyAction = key; errorMessage = null; render();
    try { await handle.timerAction(type); if (typeof handle.syncBridge === 'function') await handle.syncBridge(); }
    catch (error) { errorMessage = String(error?.message || error); }
    finally { busyAction = null; render(); }
  }

  function openJob(projectId) {
    const id = safeProjectId(projectId);
    if (!id) { errorMessage = 'Enter a valid SquareCoil job number.'; render(); return; }
    window.open(new URL(`/project.php?id=${id}`, window.location.origin).href, '_blank', 'noopener');
  }

  function selectContext(contextId, targetView = 'main') {
    if (!contextId) return;
    selectionSerial += 1;
    selectedContextId = String(contextId);
    pendingFocusIntent = null;
    view = targetView;
    savePreferences();
  }

  function workspaceData() {
    return {
      workspace: { order: [...durableOrder], hiddenContextIds: [...hiddenTabs] },
      preferences: { theme, surface }
    };
  }

  function downloadArtifact(kind) {
    const handle = coreHandle();
    if (!handle || typeof handle.dataExport !== 'function') throw new Error('Trusted data export is not available yet.');
    const exportedAtMs = Date.now();
    const result = handle.dataExport(kind, {
      ...workspaceData(),
      exportedAtMs,
      backupId: `backup-${exportedAtMs}-${Math.random().toString(36).slice(2)}`,
      sourcePlatform: navigator.userAgent || 'browser-extension'
    });
    const isBackup = kind === 'FULL_BACKUP';
    const text = isBackup ? `${JSON.stringify(result, null, 2)}\n` : result.text;
    const filename = isBackup
      ? `squarecoil-companion-backup-${new Date(exportedAtMs).toISOString().slice(0, 10)}.json`
      : result.filename;
    const blob = new Blob([text], { type: isBackup ? 'application/json;charset=utf-8' : result.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    dataMessage = `${isBackup ? 'Full Backup' : kind === 'HISTORY_CSV' ? 'History CSV' : 'Time Report CSV'} prepared from revision ${result.snapshotRevision ?? lastGoodCore?.timer?.revision ?? '—'}.`;
    return result;
  }

  function destructiveDescription(type, values = {}) {
    if (type === DATA_COMMANDS.DELETE_CONTEXT) return `Permanently delete ${values.label || values.contextId} Companion history, time, and Context metadata? SquareCoil official time is unaffected.`;
    if (type === DATA_COMMANDS.DELETE_ALL_ARCHIVED) return 'Permanently delete every archived Companion Context and its recorded time? Non-archived data and SquareCoil official time are unaffected.';
    if (type === DATA_COMMANDS.WIPE_HISTORY) return 'Permanently remove all Companion-recorded time history? Workspace Contexts remain and SquareCoil official time is unaffected.';
    if (type === DATA_COMMANDS.RESTORE_BACKUP && values.mode === 'REPLACE') return 'Replace the current restorable Companion dataset with this validated backup? No live timer state will be restored.';
    return null;
  }

  async function commitDataPlan(plan, values = {}) {
    if (plan.blocked) {
      errorMessage = `Nothing was changed. ${plan.conflicts.length} conflict${plan.conflicts.length === 1 ? '' : 's'} require review.`;
      render();
      return false;
    }
    const handle = coreHandle();
    if (!handle || typeof handle.commitDataAction !== 'function') throw new Error('Trusted data mutation is not available yet.');
    const confirmations = [...plan.requiredConfirmations];
    let preBackupDisposition;
    const globalDestructive = confirmations.some(token => ['DELETE_ALL_ARCHIVED', 'WIPE_ALL_TIME_HISTORY', 'RESTORE_REPLACE'].includes(token));
    if (globalDestructive) {
      const createBackup = window.confirm('Create a Full Backup before continuing? Choose OK to download it now, or Cancel to review the destructive action without a backup.');
      if (createBackup) {
        downloadArtifact('FULL_BACKUP');
        preBackupDisposition = 'CREATED';
      } else preBackupDisposition = 'DECLINED';
    }
    const description = values.description || (confirmations.includes('USE_INCOMING')
      ? 'Use incoming data for the selected conflicts? Existing Companion historical records will be replaced and all overlap rules will be revalidated.'
      : null);
    if ((confirmations.length || values.confirm === true) && !window.confirm(description || 'Commit this Companion data operation?')) return false;
    await handle.commitDataAction(plan.planId, { confirmationTokens: confirmations, preBackupDisposition });
    pendingImport = null;
    dataMessage = `Completed ${plan.operation.replace(/^DATA_/, '').replace(/_/g, ' ').toLowerCase()} at one authoritative revision.`;
    return true;
  }

  async function runDataAction(type, values = {}) {
    const handle = coreHandle();
    if (!handle || typeof handle.stageDataAction !== 'function') throw new Error('Trusted data staging is not available yet.');
    const request = { ...workspaceData(), ...values };
    if ([DATA_COMMANDS.ARCHIVE_CONTEXT, DATA_COMMANDS.ARCHIVE_ELIGIBLE].includes(type)) request.atMs = Date.now();
    const plan = await handle.stageDataAction(type, request);
    await commitDataPlan(plan, {
      confirm: type === DATA_COMMANDS.DELETE_CONTEXT,
      description: destructiveDescription(type, values)
    });
  }

  async function stageImport(type, values) {
    const handle = coreHandle();
    if (!handle || typeof handle.stageDataAction !== 'function') throw new Error('Trusted data staging is not available yet.');
    const request = { ...workspaceData(), ...values };
    const plan = await handle.stageDataAction(type, request);
    pendingImport = { type, values: request, plan, resolutions: { ...(request.resolutions || {}) } };
    if (plan.blocked) {
      dataMessage = 'Import is staged only. Resolve every listed conflict before any write can occur.';
      render();
      return;
    }
    await commitDataPlan(plan, {
      confirm: true,
      description: destructiveDescription(type, values) || `Import ${plan.summary.segmentsAdded || 0} new finalized Segment${plan.summary.segmentsAdded === 1 ? '' : 's'}? Duplicate records add no time.`
    });
  }

  async function withBusy(label, task) {
    if (busyAction) return;
    busyAction = label;
    errorMessage = null;
    dataMessage = null;
    render();
    try { await task(); }
    catch (error) { errorMessage = String(error?.message || error); }
    finally { busyAction = null; render(); }
  }

  function onClick(event) {
    const button = event.target.closest?.('[data-action]'); if (!button || !root?.contains(button)) return;
    const action = button.dataset.action;
    if (action === 'collapse') { collapsed = !collapsed; savePreferences(); render(); return; }
    if (action === 'back') { view = 'main'; render(); return; }
    if (action === 'view') { const next = button.dataset.view; if (VIEW_IDS.has(next)) view = next; render(); return; }
    if (action === 'select') { selectContext(button.dataset.context); render(); return; }
    if (action === 'context-detail') { selectContext(button.dataset.context, 'context-detail'); render(); return; }
    if (action === 'hide-tab') { event.stopPropagation(); const id = button.dataset.context; const timer = lastGoodCore?.timer; if (id && id !== selectedContextId && id !== timer?.currentContextId) hiddenTabs.add(id); savePreferences(); render(); return; }
    if (action === 'show-tab') { const id = button.dataset.context; if (id) hiddenTabs.delete(id); savePreferences(); render(); return; }
    if (action === 'load-history') { historyLimit += HISTORY_PAGE_SIZE; render(); return; }
    if (action === 'timer') { invokeTimerAction(button.dataset.timerAction, event); return; }
    if (action === 'open-job') { if (event.isTrusted === true) openJob(button.dataset.project); return; }
    if (action === 'theme') { theme = button.dataset.value === 'dark' ? 'dark' : 'light'; savePreferences(); render(); return; }
    if (action === 'surface') { surface = button.dataset.value === 'glass' ? 'glass' : 'solid'; savePreferences(); render(); return; }
    if (action === 'data-export' && event.isTrusted === true) {
      withBusy('data-export', async () => { downloadArtifact(button.dataset.export); });
      return;
    }
    if (action === 'data-context' && event.isTrusted === true) {
      const type = button.dataset.dataType;
      withBusy('data-context', () => runDataAction(type, { contextId: button.dataset.context, label: button.dataset.label || button.dataset.context }));
      return;
    }
    if (action === 'data-simple' && event.isTrusted === true) {
      const type = button.dataset.dataType;
      withBusy('data-simple', () => runDataAction(type, { description: destructiveDescription(type) }));
      return;
    }
    if (action === 'pick-file' && event.isTrusted === true) {
      pendingFileMode = button.dataset.fileMode;
      root.querySelector?.('[data-sc-data-file]')?.click();
      return;
    }
    if (action === 'resolve-conflict' && event.isTrusted === true && pendingImport) {
      pendingImport.resolutions[button.dataset.conflict] = button.dataset.resolution;
      withBusy('conflict-resolution', async () => {
        await stageImport(pendingImport.type, { ...pendingImport.values, resolutions: pendingImport.resolutions });
      });
      return;
    }
    if (action === 'sync' && event.isTrusted === true) { const handle = coreHandle(); if (handle && typeof handle.syncBridge === 'function') handle.syncBridge().then(render, error => { errorMessage = String(error?.message || error); render(); }); }
  }

  function onChange(event) {
    const input = event.target?.closest?.('[data-sc-data-file]');
    if (!input || !root?.contains(input) || !input.files?.[0] || !pendingFileMode) return;
    const file = input.files[0];
    const mode = pendingFileMode;
    pendingFileMode = null;
    withBusy('data-import', async () => {
      const text = await file.text();
      if (mode === 'HISTORY_CSV') await stageImport(DATA_COMMANDS.IMPORT_HISTORY_CSV, { input: text });
      else await stageImport(DATA_COMMANDS.RESTORE_BACKUP, { input: text, mode: mode === 'BACKUP_REPLACE' ? 'REPLACE' : 'MERGE', importWorkspace: true, importPreferences: true });
      input.value = '';
    });
  }

  function onDoubleClick(event) {
    const tab = event.target.closest?.('.sc-tab[data-context]'); if (!tab || !root?.contains(tab)) return;
    selectContext(tab.dataset.context); collapsed = false; savePreferences(); render();
  }

  function onDragStart(event) {
    const tab = event.target.closest?.('.sc-tab[data-context]'); if (!tab || !root?.contains(tab)) return;
    draggedContextId = tab.dataset.context || null;
    try { event.dataTransfer?.setData('text/plain', draggedContextId); if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'; } catch (_) {}
  }

  function onDragOver(event) { if (event.target.closest?.('.sc-tab[data-context]')) event.preventDefault(); }

  function onDrop(event) {
    const target = event.target.closest?.('.sc-tab[data-context]'); if (!target || !root?.contains(target)) return;
    event.preventDefault();
    const source = draggedContextId || event.dataTransfer?.getData('text/plain');
    const before = target.dataset.context;
    if (source && before && source !== before) { durableOrder = moveContext(durableOrder, source, before); savePreferences(); render(); }
    draggedContextId = null;
  }

  function onSubmit(event) {
    if (!event.target.matches?.('[data-sc-search-form]')) return;
    event.preventDefault(); if (event.isTrusted !== true) return;
    const query = String(new FormData(event.target).get('projectId') || '').trim();
    const rows = lastGoodCore?.timer?.contextRows || [];
    const lower = query.toLowerCase();
    const known = rows.find(row => row.contextId.toLowerCase() === lower || row.label.toLowerCase().includes(lower) || String(row.projectId || '') === query);
    if (known) { selectContext(known.contextId); render(); return; }
    if (safeProjectId(query)) { openJob(query); return; }
    errorMessage = 'No matching job found.'; render();
  }

  async function start() {
    if (started) return;
    started = true;
    await loadPreferences();
    storageChanges?.addListener?.(onStorageChanged);
    render();
    intervalId = window.setInterval(() => render({ allowInteractionDeferral: true }), REFRESH_MS);
  }

  function setRouteProtection(value = {}) {
    routeProtection = { dirty: value.dirty === true, inProgress: value.inProgress === true };
    render();
  }

  function teardown() {
    if (disposed) return;
    disposed = true;
    if (intervalId !== null) window.clearInterval(intervalId);
    intervalId = null;
    storageChanges?.removeListener?.(onStorageChanged);
    if (root) {
      root.removeEventListener('click', onClick); root.removeEventListener('dblclick', onDoubleClick);
      root.removeEventListener('submit', onSubmit); root.removeEventListener('dragstart', onDragStart);
      root.removeEventListener('dragover', onDragOver); root.removeEventListener('drop', onDrop);
      root.removeEventListener('change', onChange);
    }
    root = null;
  }

  return Object.freeze({ start, render, setRouteProtection, teardown });
}

module.exports = { ROOT_ID, UI_STORAGE_DEFAULTS, MAX_VISIBLE_JOB_TABS, formatDuration, safeProjectId, deriveVisibleTabs, createWorkspaceUi };
