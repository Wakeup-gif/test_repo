'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { ROOT_ID, createWorkspaceUi } = require('../../src/ui/workspace-ui');

function makeTimer() {
  const rows = ['101', '202', '303'].map((projectId, index) => ({
    contextId: `job:${projectId}`,
    kind: 'job',
    projectId,
    label: `Job ${projectId}`,
    shortLabel: projectId,
    todayMs: (index + 1) * 60 * 60 * 1000,
    totalMs: (index + 1) * 120 * 60 * 1000,
    thresholdLevel: ['YELLOW', 'ORANGE', 'RED'][index],
    status: index === 0 ? 'RUNNING' : 'NOT_RUNNING',
    isOperational: index === 0,
    isProvisional: false,
    isSafetyHeld: false,
    archivedAtMs: null,
    workspaceMembership: 'RECENT',
    lastSeenAtMs: 3_000 - index,
    lastRecordedActivityAtMs: 2_000 - index,
    legacyUnattributedMs: 0
  }));
  return {
    revision: 1,
    sourcePreferenceRevision: 0,
    workdayZone: 'UTC',
    timeBasis: { disclosed: true, label: 'Time basis: UTC fallback', deviceMismatch: false },
    currentContextId: 'job:101',
    lastObservation: null,
    focusIntent: null,
    contextRows: rows,
    todayTotalMs: rows.reduce((sum, row) => sum + row.todayMs, 0),
    weekTotalMs: 12 * 60 * 60 * 1000,
    todayByContext: rows.map(row => ({ ...row, durationMs: row.todayMs })),
    byDayRows: [{ localDate: '2026-08-28', durationMs: 6 * 60 * 60 * 1000, contextCount: 3, topContextLabel: 'Job 303', topContextDurationMs: 3 * 60 * 60 * 1000 }],
    byContextRows: rows,
    contextDetails: Object.fromEntries(rows.map(row => [row.contextId, { ...row, weekMs: row.todayMs, datedMs: row.totalMs, dailyRows: [], finalizedSessions: [] }])),
    historyRows: Array.from({ length: 100 }, (_, index) => ({ logicalSessionId: `logical-${index}`, sessionId: `session-${index}`, cycleId: `cycle-${index}`, contextId: 'job:101', label: 'Job 101', startAtMs: index * 1000, endAtMs: index * 1000 + 500, durationMs: 500, localDate: '2026-08-28', localDates: ['2026-08-28'], segmentIds: [`segment-${index}`] })),
    historyTotal: 150,
    historyHasMore: true,
    availableActions: { localPause: true, resume: false, startFresh: false, localResume: false },
    running: { elapsedMs: 60_000, provisional: false }
  };
}

async function harness(options = {}) {
  const listeners = {};
  const storageListeners = new Set();
  const writes = [];
  const timerActions = [];
  let intervalCallback = null;
  let throwRead = false;
  const root = {
    dataset: {}, innerHTML: '', classList: { add() {} },
    addEventListener(type, listener) { listeners[type] = listener; },
    removeEventListener(type, listener) { if (listeners[type] === listener) delete listeners[type]; },
    contains() { return true; }, querySelector() { return null; }
  };
  const document = { getElementById(id) { return id === ROOT_ID ? root : null; } };
  const window = {
    location: new URL('https://ussignandmill.squarecoil.net/project.php?id=101'),
    open() {}, setInterval(callback) { intervalCallback = callback; return 1; }, clearInterval() { intervalCallback = null; }
  };
  const preferences = { ...(options.preferences || {}) };
  const storage = {
    async get(defaults) { return { ...defaults, ...preferences }; },
    async set(values) { Object.assign(preferences, values); writes.push(structuredClone(values)); }
  };
  const storageChanges = {
    addListener(listener) { storageListeners.add(listener); }, removeListener(listener) { storageListeners.delete(listener); }
  };
  const timer = makeTimer();
  options.prepareTimer?.(timer);
  const core = { status: 'trusted-core-owner-active', blocked: false, timer };
  const handle = {
    coreSnapshot(view) {
      if (throwRead) throw new Error('transient-read');
      timer.historyHasMore = view.historyLimit < timer.historyTotal;
      timer.historyRows = Array.from({ length: Math.min(view.historyLimit, timer.historyTotal) }, (_, index) => ({ logicalSessionId: `logical-${index}`, sessionId: `session-${index}`, cycleId: `cycle-${index}`, contextId: 'job:101', label: 'Job 101', startAtMs: index * 1000, endAtMs: index * 1000 + 500, durationMs: 500, localDate: '2026-08-28', localDates: ['2026-08-28'], segmentIds: [`segment-${index}`] }));
      return structuredClone(core);
    },
    async timerAction(type) { timerActions.push(type); }, async syncBridge() {}
  };
  const ui = createWorkspaceUi({ document, window, storage, storageChanges, getCoreHandle: () => handle });
  await ui.start();
  function click(dataset, trusted = true) {
    const target = { dataset, closest(selector) { return selector === '[data-action]' ? target : null; } };
    listeners.click({ target, isTrusted: trusted, stopPropagation() {} });
  }
  function doubleClick(contextId) {
    const target = { dataset: { context: contextId }, closest(selector) { return selector === '.sc-tab[data-context]' ? target : null; } };
    listeners.dblclick({ target, isTrusted: true });
  }
  function storageChange(changes) { for (const listener of storageListeners) listener(changes, 'local'); }
  return { ui, root, timer, core, writes, timerActions, click, doubleClick, storageChange, setThrowRead(value) { throwRead = value; }, intervalCallback: () => intervalCallback };
}

test('UT-B3-UI-001 compact tabs expose Today, threshold meaning, operational status, and accessibility text together', async () => {
  const h = await harness();
  assert.match(h.root.innerHTML, /data-threshold="YELLOW"/);
  assert.match(h.root.innerHTML, /Yellow timer limit/);
  assert.match(h.root.innerHTML, /Today 1h 00m/);
  assert.match(h.root.innerHTML, /Running/);
  h.ui.teardown();
});

test('UT-B3-UI-002 a real authoritative A to B intent selects, reveals, opens Main, and expands exactly once', async () => {
  const h = await harness();
  h.click({ action: 'view', view: 'settings' });
  h.click({ action: 'collapse' });
  h.timer.revision = 2;
  h.timer.currentContextId = 'job:202';
  h.timer.contextRows.forEach(row => { row.isOperational = row.contextId === 'job:202'; row.status = row.isOperational ? 'RUNNING' : 'NOT_RUNNING'; });
  h.timer.focusIntent = { intentId: 'focus:b', contextId: 'job:202', priorContextId: 'job:101', transitionType: 'CONTEXT_CHANGED', sourceStateRevision: 2 };
  h.ui.render();
  assert.equal(h.root.dataset.protoCollapsed, 'false');
  assert.match(h.root.innerHTML, /Job 202/);
  assert.doesNotMatch(h.root.innerHTML, /Local data and backups/);
  const writesAfterFirst = h.writes.length;
  h.ui.render();
  assert.equal(h.writes.length, writesAfterFirst);
  h.ui.teardown();
});

test('UT-B3-UI-003 same-Context heartbeat or metadata refresh never steals selection or reopens collapse', async () => {
  const h = await harness();
  h.click({ action: 'select', context: 'job:202' });
  h.click({ action: 'collapse' });
  h.timer.revision = 2;
  h.timer.lastObservation = { type: 'CONTEXT_METADATA_UPDATED', contextId: 'job:101' };
  h.timer.focusIntent = null;
  h.ui.render();
  assert.equal(h.root.dataset.protoCollapsed, 'true');
  h.click({ action: 'collapse' });
  assert.match(h.root.innerHTML, /Job 202/);
  h.ui.teardown();
});

test('UT-B3-UI-004 dirty route defers native focus and a newer explicit user selection defeats the older intent', async () => {
  const h = await harness();
  h.click({ action: 'view', view: 'settings' });
  h.ui.setRouteProtection({ dirty: true });
  h.timer.revision = 2;
  h.timer.currentContextId = 'job:202';
  h.timer.focusIntent = { intentId: 'focus:b', contextId: 'job:202', priorContextId: 'job:101', transitionType: 'CONTEXT_CHANGED', sourceStateRevision: 2 };
  h.ui.render();
  assert.match(h.root.innerHTML, /Local data and backups/);
  h.click({ action: 'select', context: 'job:303' });
  h.ui.setRouteProtection({ dirty: false });
  assert.match(h.root.innerHTML, /Job 303/);
  h.ui.teardown();
});

test('UT-B3-UI-005 transient failure and an older revision retain the last trusted values with visible stale state', async () => {
  const h = await harness();
  assert.match(h.root.innerHTML, /Job 101/);
  h.setThrowRead(true);
  h.ui.render();
  assert.match(h.root.innerHTML, /Showing the last saved view while Companion reconnects/);
  assert.match(h.root.innerHTML, /Job 101/);
  h.setThrowRead(false);
  h.timer.revision = 0;
  h.ui.render();
  assert.match(h.root.innerHTML, /An older update was ignored/);
  h.ui.teardown();
});

test('UT-B3-UI-006 History loads beyond the initial bounded page without using the page size as retention', async () => {
  const h = await harness();
  h.click({ action: 'view', view: 'history' });
  assert.match(h.root.innerHTML, /Load more \(100 of 150\)/);
  h.click({ action: 'load-history' });
  assert.doesNotMatch(h.root.innerHTML, /Load more/);
  assert.match(h.root.innerHTML, /data-history-session="session-149"/);
  h.ui.teardown();
});

test('UT-B3-UI-007 cross-tab visibility and order synchronization changes presentation without Timer commands or selection writes', async () => {
  const h = await harness();
  h.storageChange({
    protoUiHiddenTabs: { newValue: ['job:202'] },
    b3WorkspaceOrder: { newValue: ['job:303', 'job:101', 'job:202'] },
    b3WorkspaceRevision: { newValue: Date.now() + 1000 }
  });
  assert.equal(h.timerActions.length, 0);
  h.click({ action: 'view', view: 'recent' });
  assert.match(h.root.innerHTML, /job:202/);
  assert.match(h.root.innerHTML, /Show in Tabs/);
  h.ui.teardown();
});

test('UT-B3-UI-008 Context Detail discloses undated legacy balance separately from dated totals', async () => {
  const h = await harness();
  h.timer.contextDetails['job:202'].legacyUnattributedMs = 60_000;
  h.timer.contextDetails['job:202'].totalMs += 60_000;
  h.click({ action: 'context-detail', context: 'job:202' });
  assert.match(h.root.innerHTML, /Older time without date detail/);
  assert.match(h.root.innerHTML, /not fabricated into Today, Week, or daily history/);
  h.ui.teardown();
});

test('UT-B3-UI-009 A to none keeps historical inspection, while later none to B focuses only the real re-entry', async () => {
  const h = await harness();
  h.click({ action: 'select', context: 'job:303' });
  h.timer.revision = 2;
  h.timer.currentContextId = null;
  h.timer.lastObservation = { type: 'CLOCKED_OUT', contextId: null, priorContextId: 'job:101' };
  h.timer.focusIntent = null;
  h.ui.render();
  assert.match(h.root.innerHTML, /Job 303/);
  h.timer.revision = 3;
  h.timer.currentContextId = 'job:202';
  h.timer.lastObservation = { type: 'CONTEXT_DETECTED', contextId: 'job:202' };
  h.timer.focusIntent = { intentId: 'focus:reentry-b', contextId: 'job:202', priorContextId: null, transitionType: 'CONTEXT_DETECTED', sourceStateRevision: 3 };
  h.ui.render();
  assert.match(h.root.innerHTML, /Job 202/);
  h.ui.teardown();
});

test('UT-B3-UI-010 boot baseline honors current-focus selection priority without impersonating entry or expanding', async () => {
  const h = await harness({
    preferences: { protoUiCollapsed: true, b3LastSelectedContextId: 'job:202' },
    prepareTimer(timer) {
      timer.focusIntent = { intentId: 'focus:boot-a', contextId: 'job:101', priorContextId: null, transitionType: 'CONTEXT_DETECTED', sourceStateRevision: 1 };
    }
  });
  assert.equal(h.root.dataset.protoCollapsed, 'true');
  h.click({ action: 'collapse' });
  assert.match(h.root.innerHTML, /data-context="job:101" data-selected="true"/);
  h.ui.teardown();
});

test('UT-B3-UI-011 a hidden incoming Context is revealed before current focus applies', async () => {
  const h = await harness({ preferences: { protoUiHiddenTabs: ['job:202'] } });
  assert.doesNotMatch(h.root.innerHTML, /data-context="job:202"/);
  h.timer.revision = 2;
  h.timer.currentContextId = 'job:202';
  h.timer.focusIntent = { intentId: 'focus:hidden-b', contextId: 'job:202', priorContextId: 'job:101', transitionType: 'CONTEXT_CHANGED', sourceStateRevision: 2 };
  h.ui.render();
  assert.match(h.root.innerHTML, /data-context="job:202" data-selected="true"/);
  assert.equal(h.writes.some(write => Array.isArray(write.protoUiHiddenTabs) && !write.protoUiHiddenTabs.includes('job:202')), true);
  h.ui.teardown();
});

test('UT-B3-UI-012 newer native C supersedes deferred B and stale B cannot override current C', async () => {
  const h = await harness();
  h.ui.setRouteProtection({ dirty: true });
  h.timer.revision = 2;
  h.timer.currentContextId = 'job:202';
  h.timer.focusIntent = { intentId: 'focus:b-old', contextId: 'job:202', priorContextId: 'job:101', transitionType: 'CONTEXT_CHANGED', sourceStateRevision: 2 };
  h.ui.render();
  h.timer.revision = 3;
  h.timer.currentContextId = 'job:303';
  h.timer.focusIntent = { intentId: 'focus:c-new', contextId: 'job:303', priorContextId: 'job:202', transitionType: 'CONTEXT_CHANGED', sourceStateRevision: 3 };
  h.ui.render();
  h.ui.setRouteProtection({ dirty: false });
  assert.match(h.root.innerHTML, /Job 303/);
  h.timer.focusIntent = { intentId: 'focus:b-replayed', contextId: 'job:202', priorContextId: 'job:101', transitionType: 'CONTEXT_CHANGED', sourceStateRevision: 2 };
  h.ui.render();
  assert.match(h.root.innerHTML, /Job 303/);
  h.ui.teardown();
});

test('UT-B3-UI-013 double click selects and expands while the single-click path never changes Timer state', async () => {
  const h = await harness();
  h.click({ action: 'collapse' });
  h.doubleClick('job:202');
  assert.equal(h.root.dataset.protoCollapsed, 'false');
  assert.match(h.root.innerHTML, /Job 202/);
  assert.deepEqual(h.timerActions, []);
  h.ui.teardown();
});
