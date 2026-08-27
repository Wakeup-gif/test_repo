'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ACTION_7_PATH,
  ACTION_7_BODY,
  readAuditedDomSnapshot,
  createSquareCoilBridgeService
} = require('../../src/squarecoil/bridge-service');

function element(innerHTML = '', textContent = '') {
  return {
    innerHTML,
    textContent,
    hidden: false,
    style: { display: '', visibility: '' },
    getAttribute() { return null; }
  };
}

function browserFixture(overrides = {}) {
  const listeners = new Map();
  const selectors = new Map([
    ['#clockin-remaining-time', [element(
      '<a href="/project.php?id=260702">260702 - Fabrication</a>',
      '260702 - Fabrication'
    )]],
    ['#clockin-debug', []],
    ['#clockin', []],
    ['#clockout', [element()]],
    ['.timeclock-container', [element()]]
  ]);
  for (const [key, value] of Object.entries(overrides.selectors || {})) selectors.set(key, value);
  const document = {
    visibilityState: 'visible',
    documentElement: {},
    querySelectorAll(selector) { return selectors.get(selector) || []; },
    addEventListener(type, listener) { listeners.set(`document:${type}`, listener); },
    removeEventListener(type) { listeners.delete(`document:${type}`); }
  };
  class MutationObserver {
    constructor(callback) { this.callback = callback; }
    observe() { this.connected = true; }
    disconnect() { this.connected = false; }
  }
  const window = {
    location: { origin: 'https://ussignandmill.squarecoil.net' },
    URL,
    AbortController,
    MutationObserver,
    Element: class {},
    addEventListener(type, listener) { listeners.set(`window:${type}`, listener); },
    removeEventListener(type) { listeners.delete(`window:${type}`); }
  };
  const intervals = new Map();
  const timeouts = new Map();
  let timerSequence = 0;
  const timers = {
    setInterval(callback, delayMs) {
      const id = ++timerSequence;
      intervals.set(id, { callback, delayMs });
      return id;
    },
    clearInterval(id) { intervals.delete(id); },
    setTimeout(callback, delayMs) {
      const id = ++timerSequence;
      timeouts.set(id, { callback, delayMs });
      return id;
    },
    clearTimeout(id) { timeouts.delete(id); }
  };
  return { document, window, timers, listeners, intervals, timeouts };
}

test('UT-B2-BRIDGE-025 audited DOM extraction rejects duplicate clock ownership and reads no arbitrary project links', () => {
  const duplicate = browserFixture({
    selectors: {
      '#clockin-remaining-time': [element(), element()]
    }
  });
  assert.deepEqual(readAuditedDomSnapshot(duplicate.document), {
    available: false,
    snapshot: null,
    reason: 'AMBIGUOUS_AUDITED_CLOCK_DOM'
  });

  const scoped = browserFixture();
  scoped.document.querySelectorAll = selector => selector === 'a[href*="project.php"]'
    ? [element('', 'arbitrary job link')]
    : new Map([
      ['#clockin-remaining-time', []],
      ['#clockin-debug', []],
      ['#clockin', []],
      ['#clockout', []],
      ['.timeclock-container', []]
    ]).get(selector) || [];
  const captured = readAuditedDomSnapshot(scoped.document);
  assert.equal(captured.available, true);
  assert.equal(captured.snapshot.remainingTime.html, '');
  assert.equal(captured.snapshot.debug.html, '');
});

test('UT-B2-BRIDGE-026 live Bridge transport can issue only exact read-only action 7 and commits ordered semantic events', async () => {
  const fixture = browserFixture();
  const requests = [];
  const events = [];
  let time = 100;
  const bridge = createSquareCoilBridgeService({
    document: fixture.document,
    window: fixture.window,
    timers: fixture.timers,
    fetch: async (url, options) => {
      requests.push({ url, options });
      return {
        ok: true,
        async text() {
          return '<span id="clockin-remaining-time"><a href="/project.php?id=260702">260702 - Fabrication</a></span>';
        }
      };
    },
    now: () => time++,
    sourceRuntimeId: 'runtime-bridge-service-001',
    onEvents: async values => { events.push(...values); }
  });

  const health = await bridge.ensure({ owner: true });
  assert.equal(requests.length, 1);
  assert.equal(new URL(requests[0].url).pathname, ACTION_7_PATH);
  assert.equal(requests[0].options.method, 'POST');
  assert.equal(requests[0].options.body, ACTION_7_BODY);
  assert.equal(requests[0].options.credentials, 'same-origin');
  assert.equal(events.length, 1);
  assert.equal(events[0].type, 'CONTEXT_DETECTED');
  assert.equal(events[0].context.contextId, 'job:260702');
  assert.equal(health.nativeMutationRequestCount, 0);
  assert.equal(health.capability, 'FULL_NO_NATIVE_COMPLETION_HOOK');

  const tornDown = await bridge.teardown();
  assert.equal(tornDown.active, false);
  assert.equal(tornDown.listenersAttached, false);
  assert.equal(fixture.intervals.size, 0);
});

test('UT-B2-BRIDGE-027 OBSERVER attaches passive audited listeners but performs no server verification or Timer delivery', async () => {
  const fixture = browserFixture();
  let requests = 0;
  let deliveries = 0;
  const bridge = createSquareCoilBridgeService({
    document: fixture.document,
    window: fixture.window,
    timers: fixture.timers,
    fetch: async () => { requests += 1; throw new Error('observer-fetch-prohibited'); },
    now: () => 200,
    sourceRuntimeId: 'runtime-bridge-observer-001',
    onEvents: async () => { deliveries += 1; }
  });

  const health = await bridge.ensure({ owner: false });
  assert.equal(health.owner, false);
  assert.equal(health.listenersAttached, true);
  assert.equal(requests, 0);
  assert.equal(deliveries, 0);
  assert.equal((await bridge.verifyNow('observer-manual')).reason, 'observer-no-server-verification');
  await bridge.teardown();
});
