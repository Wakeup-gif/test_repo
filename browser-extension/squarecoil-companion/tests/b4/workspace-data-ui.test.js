'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { ROOT_ID, createWorkspaceUi } = require('../../src/ui/workspace-ui');
const { DATA_COMMANDS } = require('../../src/data/data-safety');

function timer() {
  return {
    revision: 7,
    sourcePreferenceRevision: 0,
    workdayZone: 'UTC',
    timeBasis: { disclosed: false },
    currentContextId: null,
    lastObservation: null,
    focusIntent: null,
    contextRows: [{ contextId: 'job:401', kind: 'job', projectId: '401', label: 'Job 401', shortLabel: '401',
      todayMs: 10_000, totalMs: 20_000, thresholdLevel: 'NONE', status: 'NOT_RUNNING', isOperational: false,
      isProvisional: false, isSafetyHeld: false, archivedAtMs: null, workspaceMembership: 'RECENT', lastSeenAtMs: 1,
      lastRecordedActivityAtMs: 1, legacyUnattributedMs: 0 }],
    todayTotalMs: 10_000,
    weekTotalMs: 10_000,
    todayByContext: [],
    byDayRows: [],
    byContextRows: [],
    contextDetails: {},
    historyRows: [],
    historyTotal: 0,
    historyHasMore: false,
    availableActions: { localPause: false, resume: false, startFresh: false, localResume: false },
    running: null
  };
}

async function harness({ confirmAnswers = [] } = {}) {
  const listeners = {};
  const staged = [];
  const committed = [];
  const timerActions = [];
  const confirms = [];
  const root = { dataset: {}, innerHTML: '', classList: { add() {} }, contains() { return true; }, querySelector() { return null; },
    addEventListener(type, listener) { listeners[type] = listener; }, removeEventListener(type, listener) { if (listeners[type] === listener) delete listeners[type]; } };
  const document = { getElementById(id) { return id === ROOT_ID ? root : null; } };
  const core = {
    status: 'trusted-core-owner-active', blocked: false, timer: timer(),
    data: { revision: 7, datasetId: 'dataset-ui', quiescent: true,
      recentRows: [{ contextId: 'job:401', label: 'Job 401', totalMs: 20_000, protected: false }],
      archivedRows: [{ contextId: 'job:402', label: 'Job 402', totalMs: 30_000, archivedAtMs: 100, protected: false }] }
  };
  const handle = {
    coreSnapshot() { return structuredClone(core); },
    async timerAction(type) { timerActions.push(type); },
    async syncBridge() {},
    async stageDataAction(type, values) {
      staged.push({ type, values: structuredClone(values) });
      const requiredConfirmations = type === DATA_COMMANDS.DELETE_CONTEXT ? [`DELETE:${values.contextId}`]
        : type === DATA_COMMANDS.WIPE_HISTORY ? ['WIPE_ALL_TIME_HISTORY'] : [];
      return { operation: type, planId: `plan-${staged.length}`, stagedRevision: 7, blocked: false,
        conflicts: [], requiredConfirmations, summary: { segmentsAdded: 0 } };
    },
    async commitDataAction(planId, values) { committed.push({ planId, values: structuredClone(values) }); }
  };
  const window = { location: new URL('https://ussignandmill.squarecoil.net/'), open() {},
    setInterval() { return 1; }, clearInterval() {}, confirm(message) { confirms.push(message); return confirmAnswers.length ? confirmAnswers.shift() : true; } };
  const storage = { async get(defaults) { return defaults; }, async set() {} };
  const ui = createWorkspaceUi({ document, window, storage, getCoreHandle: () => handle });
  await ui.start();
  function click(dataset, trusted = true) {
    const target = { dataset, closest(selector) { return selector === '[data-action]' ? target : null; } };
    listeners.click({ target, isTrusted: trusted, stopPropagation() {} });
  }
  async function drain() { await new Promise(resolve => setImmediate(resolve)); await new Promise(resolve => setImmediate(resolve)); }
  return { ui, root, core, staged, committed, confirms, timerActions, click, drain };
}

test('UT-B4-UI-001 Archives and Backup names the three file products and destructive safety boundary', async () => {
  const h = await harness();
  h.click({ action: 'view', view: 'settings' });
  h.click({ action: 'view', view: 'data-tools' });
  assert.match(h.root.innerHTML, /Full Backup JSON/);
  assert.match(h.root.innerHTML, /History CSV/);
  assert.match(h.root.innerHTML, /Time Report CSV/);
  assert.match(h.root.innerHTML, /SquareCoil official time is never changed/);
  h.ui.teardown();
});

test('UT-B4-UI-002 a trusted Archive action stages and commits through data authority without Timer mutation', async () => {
  const h = await harness();
  h.click({ action: 'view', view: 'recent' });
  h.click({ action: 'data-context', dataType: DATA_COMMANDS.ARCHIVE_CONTEXT, context: 'job:401', label: 'Job 401' }, false);
  await h.drain();
  assert.equal(h.staged.length, 0);
  h.click({ action: 'data-context', dataType: DATA_COMMANDS.ARCHIVE_CONTEXT, context: 'job:401', label: 'Job 401' }, true);
  await h.drain();
  assert.equal(h.staged[0].type, DATA_COMMANDS.ARCHIVE_CONTEXT);
  assert.equal(h.committed[0].planId, 'plan-1');
  assert.equal(h.timerActions.length, 0);
  h.ui.teardown();
});

test('UT-B4-UI-003 one-Context Delete carries the exact target confirmation token', async () => {
  const h = await harness();
  h.click({ action: 'data-context', dataType: DATA_COMMANDS.DELETE_CONTEXT, context: 'job:402', label: 'Job 402' }, true);
  await h.drain();
  assert.match(h.confirms[0], /Job 402/);
  assert.match(h.confirms[0], /SquareCoil official time is unaffected/);
  assert.deepEqual(h.committed[0].values.confirmationTokens, ['DELETE:job:402']);
  h.ui.teardown();
});

test('UT-B4-UI-004 global wipe offers Full Backup before exact destructive confirmation', async () => {
  const h = await harness({ confirmAnswers: [false, true] });
  h.click({ action: 'data-simple', dataType: DATA_COMMANDS.WIPE_HISTORY }, true);
  await h.drain();
  assert.match(h.confirms[0], /Create a Full Backup before continuing/);
  assert.equal(h.confirms.length, 2);
  assert.deepEqual(h.committed[0].values, {
    confirmationTokens: ['WIPE_ALL_TIME_HISTORY'],
    preBackupDisposition: 'DECLINED'
  });
  h.ui.teardown();
});
