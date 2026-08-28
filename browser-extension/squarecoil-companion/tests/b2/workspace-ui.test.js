'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { TIMER_COMMANDS } = require('../../src/timer/commands');
const {
  ROOT_ID,
  formatDuration,
  safeProjectId,
  deriveVisibleTabs,
  createWorkspaceUi
} = require('../../src/ui/workspace-ui');

function makeTimer() {
  return {
    revision: 9,
    workdayZone: 'America/New_York',
    currentContextId: 'job:101',
    contextRows: [
      {
        contextId: 'job:101',
        kind: 'job',
        projectId: '101',
        label: 'Job 101 - Active',
        shortLabel: '101',
        todayMs: 3_600_000,
        totalMs: 7_200_000,
        status: 'RUNNING',
        isOperational: true,
        archivedAtMs: null,
        workspaceMembership: 'RECENT',
        lastActivityAtMs: 2_000
      },
      {
        contextId: 'job:202',
        kind: 'job',
        projectId: '202',
        label: 'Job 202 - Selected',
        shortLabel: '202',
        todayMs: 600_000,
        totalMs: 1_800_000,
        status: 'NOT_RUNNING',
        isOperational: false,
        archivedAtMs: null,
        workspaceMembership: 'RECENT',
        lastActivityAtMs: 1_000
      }
    ],
    todayTotalMs: 4_200_000,
    weekTotalMs: 9_000_000,
    todayByContext: [
      { contextId: 'job:101', label: 'Job 101 - Active', shortLabel: '101', durationMs: 3_600_000 },
      { contextId: 'job:202', label: 'Job 202 - Selected', shortLabel: '202', durationMs: 600_000 }
    ],
    historyRows: [
      {
        contextId: 'job:101',
        label: 'Job 101 - Active',
        localDate: '2026-08-27',
        startAtMs: 1_000,
        endAtMs: 61_000,
        durationMs: 60_000,
        endReason: 'fixture'
      }
    ],
    availableActions: {
      localPause: true,
      resume: false,
      startFresh: false,
      localResume: false
    },
    running: { elapsedMs: 120_000 }
  };
}

async function createHarness() {
  const listeners = {};
  const writes = [];
  const opens = [];
  const timerActions = [];
  let syncCount = 0;
  let intervalCallback = null;

  const root = {
    dataset: {},
    innerHTML: '',
    classList: { add() {} },
    addEventListener(type, listener) { listeners[type] = listener; },
    removeEventListener(type, listener) {
      if (listeners[type] === listener) delete listeners[type];
    },
    contains() { return true; }
  };

  const document = {
    getElementById(id) { return id === ROOT_ID ? root : null; }
  };

  const window = {
    location: new URL('https://ussignandmill.squarecoil.net/project.php?id=101'),
    open(...args) { opens.push(args); return null; },
    setInterval(callback) { intervalCallback = callback; return 1; },
    clearInterval() { intervalCallback = null; }
  };

  const preferences = {};
  const storage = {
    async get(defaults) { return { ...defaults, ...preferences }; },
    async set(values) {
      Object.assign(preferences, values);
      writes.push(structuredClone(values));
    }
  };

  const timer = makeTimer();
  const core = {
    status: 'trusted-core-owner-active',
    blocked: false,
    timer
  };

  const handle = {
    coreSnapshot() { return core; },
    async timerAction(type) { timerActions.push(type); },
    async syncBridge() { syncCount += 1; }
  };

  const ui = createWorkspaceUi({
    document,
    window,
    storage,
    getCoreHandle: () => handle
  });
  await ui.start();

  function click(dataset, trusted = true) {
    const target = {
      dataset,
      closest(selector) { return selector === '[data-action]' ? target : null; }
    };
    listeners.click({
      target,
      isTrusted: trusted,
      stopPropagation() {}
    });
  }

  async function drain() {
    await new Promise(resolve => setImmediate(resolve));
    await new Promise(resolve => setImmediate(resolve));
  }

  return {
    ui,
    root,
    timer,
    core,
    writes,
    opens,
    timerActions,
    click,
    drain,
    getSyncCount: () => syncCount,
    getIntervalCallback: () => intervalCallback
  };
}

test('UT-B2-PROTOUI-001 duration formatting stays stable for live and compact surfaces', () => {
  assert.equal(formatDuration(3_661_000), '01:01:01');
  assert.equal(formatDuration(3_661_000, { compact: true }), '1h 01m');
  assert.equal(formatDuration(-1), '00:00:00');
});

test('UT-B2-PROTOUI-002 job navigation accepts only positive integer SquareCoil IDs', () => {
  assert.equal(safeProjectId('260701'), '260701');
  assert.equal(safeProjectId(' 42 '), '42');
  assert.equal(safeProjectId('0'), null);
  assert.equal(safeProjectId('260701x'), null);
  assert.equal(safeProjectId('../260701'), null);
});

test('UT-B2-PROTOUI-003 visible tabs keep operational and selected contexts protected inside the five-job cap', () => {
  const rows = Array.from({ length: 8 }, (_, index) => ({
    contextId: `job:${index + 1}`,
    label: `Job ${index + 1}`,
    lastActivityAtMs: 100 - index
  }));
  const visible = deriveVisibleTabs(rows, {
    hiddenContextIds: ['job:8', 'job:7'],
    selectedContextId: 'job:8',
    operationalContextId: 'job:7'
  });
  assert.equal(visible.length, 5);
  assert.equal(visible.some(row => row.contextId === 'job:8'), true);
  assert.equal(visible.some(row => row.contextId === 'job:7'), true);
});

test('UT-B2-PROTOUI-004 nested menu routes enter Recent, Overview, History, and Settings and return to main', async () => {
  const h = await createHarness();
  for (const [view, marker] of [
    ['recent', 'Recent Jobs'],
    ['overview', 'Time Overview'],
    ['history', 'History'],
    ['settings', 'Settings']
  ]) {
    h.click({ action: 'view', view });
    assert.match(h.root.innerHTML, /sc-view-head/);
    assert.match(h.root.innerHTML, new RegExp(marker));
    h.click({ action: 'back' });
    assert.match(h.root.innerHTML, /sc-nav-grid/);
  }
  h.ui.teardown();
});

test('UT-B2-PROTOUI-005 selecting inactive history is inspection-only and never exposes operational Pause against that selection', async () => {
  const h = await createHarness();
  h.click({ action: 'select', context: 'job:202' });
  assert.match(h.root.innerHTML, /Actually running \/ observed/);
  assert.match(h.root.innerHTML, /Job 202 - Selected/);
  assert.doesNotMatch(h.root.innerHTML, /data-timer-action="pause"/);
  assert.deepEqual(h.timerActions, []);
  h.ui.teardown();
});

test('UT-B2-PROTOUI-006 theme, surface, and collapse controls update presentation state and persist preferences', async () => {
  const h = await createHarness();
  h.click({ action: 'theme', value: 'dark' });
  assert.equal(h.root.dataset.protoTheme, 'dark');
  h.click({ action: 'surface', value: 'glass' });
  assert.equal(h.root.dataset.protoSurface, 'glass');
  h.click({ action: 'collapse' });
  assert.equal(h.root.dataset.protoCollapsed, 'true');
  await h.drain();
  assert.equal(h.writes.some(write => write.protoUiTheme === 'dark'), true);
  assert.equal(h.writes.some(write => write.protoUiSurface === 'glass'), true);
  assert.equal(h.writes.some(write => write.protoUiCollapsed === true), true);
  h.ui.teardown();
});

test('UT-B2-PROTOUI-007 hidden tabs remain in Recent and can be restored without changing Timer state', async () => {
  const h = await createHarness();
  h.click({ action: 'hide-tab', context: 'job:202' });
  assert.doesNotMatch(h.root.innerHTML, /data-context="job:202"/);
  assert.deepEqual(h.timerActions, []);

  h.click({ action: 'view', view: 'recent' });
  assert.match(h.root.innerHTML, /data-action="show-tab" data-context="job:202"/);
  h.click({ action: 'show-tab', context: 'job:202' });
  h.click({ action: 'back' });
  assert.match(h.root.innerHTML, /data-context="job:202"/);
  assert.deepEqual(h.timerActions, []);
  h.ui.teardown();
});

test('UT-B2-PROTOUI-008 Timer buttons reject synthetic clicks and route a trusted Pause through the bounded Timer API', async () => {
  const h = await createHarness();
  h.click({ action: 'timer', timerAction: 'pause' }, false);
  assert.match(h.root.innerHTML, /Timer actions require a real user click/);
  assert.deepEqual(h.timerActions, []);

  h.click({ action: 'timer', timerAction: 'pause' }, true);
  await h.drain();
  assert.deepEqual(h.timerActions, [TIMER_COMMANDS.LOCAL_PAUSE]);
  assert.equal(h.getSyncCount(), 1);
  h.ui.teardown();
});

test('UT-B2-PROTOUI-009 Open Job rejects synthetic clicks and opens only the validated same-origin project route', async () => {
  const h = await createHarness();
  h.click({ action: 'open-job', project: '101' }, false);
  assert.equal(h.opens.length, 0);

  h.click({ action: 'open-job', project: '101' }, true);
  assert.deepEqual(h.opens, [[
    'https://ussignandmill.squarecoil.net/project.php?id=101',
    '_blank',
    'noopener'
  ]]);
  h.ui.teardown();
});

test('UT-B2-PROTOUI-010 a real operational Context change exits a nested menu and focuses the incoming Context', async () => {
  const h = await createHarness();
  h.click({ action: 'view', view: 'settings' });
  assert.match(h.root.innerHTML, /Data tools/);

  h.timer.currentContextId = 'job:202';
  h.timer.contextRows[0].isOperational = false;
  h.timer.contextRows[0].status = 'NOT_RUNNING';
  h.timer.contextRows[1].isOperational = true;
  h.timer.contextRows[1].status = 'RUNNING';
  h.ui.render();

  assert.match(h.root.innerHTML, /Job 202 - Selected/);
  assert.doesNotMatch(h.root.innerHTML, /Data tools/);
  assert.match(h.root.innerHTML, /sc-nav-grid/);
  h.ui.teardown();
});

test('UT-B2-PROTOUI-011 B4 data controls cannot bypass an unavailable trusted data authority', async () => {
  const h = await createHarness();
  h.click({ action: 'view', view: 'settings' });
  assert.match(h.root.innerHTML, /Archives &amp; Backup/);
  h.click({ action: 'view', view: 'data-tools' });
  h.click({ action: 'data-simple', dataType: 'DATA_WIPE_HISTORY' }, true);
  await h.drain();
  assert.match(h.root.innerHTML, /Trusted data staging is not available yet/);
  assert.equal(h.timerActions.length, 0);
  h.ui.teardown();
});
