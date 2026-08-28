'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { ROOT_ID, createWorkspaceUi } = require('../../src/ui/workspace-ui');

function timer() {
  return { revision: 4, sourcePreferenceRevision: 1, workdayZone: 'UTC', timeBasis: { disclosed: false },
    currentContextId: null, lastObservation: null, focusIntent: null, contextRows: [], todayByContext: [], byDayRows: [],
    byContextRows: [], contextDetails: {}, historyRows: [], historyTotal: 0, historyHasMore: false,
    todayTotalMs: 0, weekTotalMs: 0, availableActions: {}, running: null };
}

async function harness({ confirms = [], clipboardAvailable = true, cinematicPermission = true } = {}) {
  const listeners = {};
  const preferenceCommands = [];
  const opens = [];
  const copied = [];
  const permissionCalls = [];
  function makeRoot() {
    return { dataset: {}, innerHTML: '', classList: { add() {} }, contains() { return true; }, querySelector() { return null; },
      addEventListener(type, listener) { listeners[type] = listener; }, removeEventListener(type, listener) { if (listeners[type] === listener) delete listeners[type]; } };
  }
  let activeRoot = makeRoot();
  const document = { getElementById(id) { return id === ROOT_ID ? activeRoot : null; }, querySelectorAll() { return [activeRoot]; } };
  const window = { location: new URL('https://ussignandmill.squarecoil.net/project.php?id=private-job'), localStorage: { getItem() { return null; } },
    navigator: { userAgent: 'Mozilla/5.0 Chrome/151.0.7922.174 Safari/537.36', clipboard: { async writeText(value) {
      if (!clipboardAvailable) throw new Error('clipboard unavailable');
      copied.push(value);
    } } },
    open(...args) { opens.push(args); }, confirm() { return confirms.length ? confirms.shift() : true; },
    setInterval() { return 1; }, clearInterval() {} };
  const core = { initialized: true, blocked: false, status: 'trusted-core-owner-active', timer: timer(),
    bridge: { initialized: true, active: true, capability: 'FULL' },
    preferences: { initialized: true, preferenceRevision: 1, timerAppearance: 'LIGHT', panelFinish: 'SOLID', websiteTheme: 'ORIGINAL',
      cinematicBackground: 'NONE', dashboardProfile: 'OFF',
      yellowMinutes: 60, orangeMinutes: 120, redMinutes: 240 },
    presentation: { timerAppearanceEffective: 'LIGHT', panelFinishEffective: 'SOLID', websiteThemeEffective: 'ORIGINAL', logoStatus: 'native-logo',
      optional: { cinematic: { state: 'DISABLED' }, dashboard: { state: 'INACTIVE_PAGE' } } },
    data: { quiescent: true, recentRows: [], archivedRows: [] } };
  const handle = { coreSnapshot() { return core; }, async syncBridge() {},
    async preferenceAction(patch, expectedPreferenceRevision) {
      preferenceCommands.push({ patch: structuredClone(patch), expectedPreferenceRevision });
      Object.assign(core.preferences, patch);
      core.preferences.preferenceRevision += 1;
      core.timer.sourcePreferenceRevision = core.preferences.preferenceRevision;
      if (patch.timerAppearance) core.presentation.timerAppearanceEffective = patch.timerAppearance;
      if (patch.panelFinish) core.presentation.panelFinishEffective = patch.panelFinish;
      if (patch.websiteTheme) core.presentation.websiteThemeEffective = patch.websiteTheme;
      if (patch.cinematicBackground) core.presentation.optional.cinematic.state = patch.cinematicBackground === 'CINEMATIC' ? 'DEGRADED_FALLBACK' : 'DISABLED';
      if (patch.dashboardProfile) core.presentation.optional.dashboard.state = patch.dashboardProfile === 'ON' ? 'INACTIVE_PAGE' : 'INACTIVE_THEME';
    },
    async requestCinematicAccess() { permissionCalls.push('request'); return { ok: cinematicPermission, granted: cinematicPermission }; },
    async removeCinematicAccess() { permissionCalls.push('remove'); return { ok: true, removed: true }; } };
  const storage = { async get(defaults) { return defaults; }, async set() {} };
  const ui = createWorkspaceUi({ document, window, storage, packageVersion: '0.7.1', userAgent: window.navigator.userAgent,
    getCoreHandle: () => handle });
  await ui.start();
  function click(dataset, trusted = true) {
    const target = { dataset, closest(selector) { return selector === '[data-action]' ? target : null; } };
    listeners.click({ target, isTrusted: trusted, stopPropagation() {} });
  }
  function inputLimit(name, value) {
    const target = { name, value, closest(selector) { return selector === '[data-sc-limits-form] input[name]' ? target : null; } };
    listeners.input({ target });
  }
  function supportField(kind, field, value, checked = false, change = false) {
    const form = { dataset: { supportKind: kind } };
    const target = { value, checked, type: field === 'includeDiagnostics' ? 'checkbox' : 'text', dataset: { supportField: field },
      closest(selector) { if (selector === '[data-support-field]') return target; if (selector === '[data-sc-support-form]') return form; return null; } };
    listeners[change ? 'change' : 'input']({ target });
  }
  function submit(kind) {
    const target = { dataset: kind ? { supportKind: kind } : {}, matches(selector) {
      return kind ? selector === '[data-sc-support-form]' : selector === '[data-sc-limits-form]';
    } };
    listeners.submit({ target, isTrusted: true, preventDefault() {} });
  }
  async function drain() { await new Promise(resolve => setImmediate(resolve)); await new Promise(resolve => setImmediate(resolve)); }
  return { ui, get root() { return activeRoot; }, core, preferenceCommands, permissionCalls, opens, copied, click, inputLimit, supportField, submit, drain,
    replaceRoot() { activeRoot = makeRoot(); ui.render(); } };
}

test('UT-B5-UI-001 one Settings router exposes core appearance Library data Support and About destinations', async () => {
  const h = await harness();
  h.click({ action: 'view', view: 'settings' });
  for (const label of ['Appearance &amp; Finish', 'Timer Limits', 'Recent Jobs', 'Time Overview', 'History', 'Archives &amp; Backup',
    'Website Theme', 'Optional Presentation', 'Submit a Ticket', 'Send Feedback', 'Support the Developer']) assert.match(h.root.innerHTML, new RegExp(label));
  h.ui.teardown();
});

test('UT-B5-UI-002 appearance controls require a trusted click and commit through the revisioned Preferences service', async () => {
  const h = await harness();
  h.click({ action: 'view', view: 'settings' });
  h.click({ action: 'settings-route', view: 'timer-appearance' });
  h.click({ action: 'preference', value: 'DARK' }, false);
  assert.equal(h.preferenceCommands.length, 0);
  h.click({ action: 'preference', value: 'DARK' }, true);
  await h.drain();
  assert.deepEqual(h.preferenceCommands[0], { patch: { timerAppearance: 'DARK' }, expectedPreferenceRevision: 1 });
  assert.equal(h.root.dataset.protoTheme, 'dark');
  h.ui.teardown();
});

test('UT-B5-UI-003 valid Timer Limits save as one coherent batch while invalid order remains uncommitted', async () => {
  const h = await harness();
  h.click({ action: 'view', view: 'settings' });
  h.click({ action: 'settings-route', view: 'timer-limits' });
  h.inputLimit('yellowMinutes', '90'); h.inputLimit('orangeMinutes', '30'); h.inputLimit('redMinutes', '120');
  h.submit();
  assert.equal(h.preferenceCommands.length, 0);
  assert.match(h.root.innerHTML, /1 ≤ Yellow ≤ Orange ≤ Red/);
  h.inputLimit('yellowMinutes', '30'); h.inputLimit('orangeMinutes', '60'); h.inputLimit('redMinutes', '120');
  h.submit(); await h.drain();
  assert.deepEqual(h.preferenceCommands[0].patch, { yellowMinutes: 30, orangeMinutes: 60, redMinutes: 120 });
  h.ui.teardown();
});

test('UT-B5-UI-004 a newer cross-tab preference revision marks an unsaved Limits draft stale and blocks Save', async () => {
  const h = await harness();
  h.click({ action: 'view', view: 'settings' }); h.click({ action: 'settings-route', view: 'timer-limits' });
  h.inputLimit('yellowMinutes', '30');
  h.core.preferences.preferenceRevision = 2;
  h.ui.render();
  assert.match(h.root.innerHTML, /newer preference revision/);
  h.submit();
  assert.equal(h.preferenceCommands.length, 0);
  h.ui.teardown();
});

test('UT-B5-UI-005 modified Support draft cannot be silently discarded by Back', async () => {
  const h = await harness({ confirms: [false, true] });
  h.click({ action: 'view', view: 'settings' }); h.click({ action: 'settings-route', view: 'submit-ticket' });
  h.supportField('ticket', 'subject', 'Do not lose this');
  h.click({ action: 'settings-back', view: 'settings' });
  h.ui.render();
  assert.match(h.root.innerHTML, /Do not lose this/);
  h.click({ action: 'settings-back', view: 'settings' });
  assert.match(h.root.innerHTML, /Appearance &amp; Finish/);
  h.ui.teardown();
});

test('UT-B5-UI-006 diagnostics are opt-in frozen previews and mailto remains an explicit user action', async () => {
  const h = await harness();
  h.click({ action: 'view', view: 'settings' }); h.click({ action: 'settings-route', view: 'send-feedback' });
  h.supportField('feedback', 'description', 'A useful idea');
  h.supportField('feedback', 'includeDiagnostics', '', true, true);
  const frozen = /<pre[^>]*>([\s\S]*?)<\/pre>/.exec(h.root.innerHTML)?.[1];
  assert.ok(frozen);
  h.core.status = 'changed-after-preview';
  h.ui.render();
  assert.equal(/<pre[^>]*>([\s\S]*?)<\/pre>/.exec(h.root.innerHTML)?.[1], frozen);
  assert.equal(h.opens.length, 0);
  h.submit('feedback');
  assert.equal(h.opens.length, 1);
  assert.match(h.opens[0][0], /^mailto:/);
  h.ui.teardown();
});

test('UT-B5-UI-007 unavailable clipboard exposes the full requested value for manual copy', async () => {
  const h = await harness({ clipboardAvailable: false });
  h.click({ action: 'view', view: 'settings' }); h.click({ action: 'settings-route', view: 'submit-ticket' });
  h.click({ action: 'copy-support-email' });
  await h.drain();
  assert.match(h.root.innerHTML, /Clipboard access was unavailable/);
  assert.match(h.root.innerHTML, /cristian@ussignandmill\.com/);
  h.ui.teardown();
});

test('UT-B5-UI-008 recovered Companion root returns to Settings Home without restoring transient Support text', async () => {
  const h = await harness();
  h.click({ action: 'view', view: 'settings' }); h.click({ action: 'settings-route', view: 'submit-ticket' });
  h.supportField('ticket', 'subject', 'transient private draft');
  h.replaceRoot();
  assert.match(h.root.innerHTML, /Appearance &amp; Finish/);
  assert.doesNotMatch(h.root.innerHTML, /transient private draft/);
  h.ui.teardown();
});

test('UT-B5-UI-009 Cinematic enable requires optional permission while denial remains off', async () => {
  const denied = await harness({ cinematicPermission: false });
  denied.click({ action: 'view', view: 'settings' }); denied.click({ action: 'settings-route', view: 'presentation-packs' });
  denied.click({ action: 'preference-cinematic', value: 'CINEMATIC' }); await denied.drain();
  assert.deepEqual(denied.permissionCalls, ['request']); assert.equal(denied.preferenceCommands.length, 0);
  assert.match(denied.root.innerHTML, /Fresh Bing access was not granted/); denied.ui.teardown();

  const granted = await harness({ cinematicPermission: true });
  granted.click({ action: 'view', view: 'settings' }); granted.click({ action: 'settings-route', view: 'presentation-packs' });
  granted.click({ action: 'preference-cinematic', value: 'CINEMATIC' }); await granted.drain();
  assert.deepEqual(granted.preferenceCommands[0], { patch: { cinematicBackground: 'CINEMATIC' }, expectedPreferenceRevision: 1 });
  granted.ui.teardown();
});

test('UT-B5-UI-010 Restore Native commits one fenced presentation batch and removes optional origin access', async () => {
  const h = await harness();
  Object.assign(h.core.preferences, { websiteTheme: 'SLEEK_DARK', cinematicBackground: 'CINEMATIC', dashboardProfile: 'ON' });
  h.ui.render(); h.click({ action: 'view', view: 'settings' }); h.click({ action: 'settings-route', view: 'presentation-packs' });
  h.click({ action: 'restore-native' }); await h.drain();
  assert.deepEqual(h.preferenceCommands[0].patch, { websiteTheme: 'ORIGINAL', cinematicBackground: 'NONE', dashboardProfile: 'OFF' });
  assert.deepEqual(h.permissionCalls, ['remove']); h.ui.teardown();
});

test('UT-B5-UI-011 zero-history Home keeps Library and Settings reachable before the first clock-in', async () => {
  const h = await harness();
  assert.match(h.root.innerHTML, /No Companion job history yet/);
  for (const destination of ['recent', 'overview', 'history', 'settings']) {
    assert.match(h.root.innerHTML, new RegExp(`data-action="view" data-view="${destination}"`));
  }
  const before = structuredClone(h.core.timer);
  h.click({ action: 'view', view: 'settings' });
  assert.match(h.root.innerHTML, /Appearance &amp; Finish/);
  assert.deepEqual(h.core.timer, before);
  assert.equal(h.preferenceCommands.length, 0);
  h.ui.teardown();
});
