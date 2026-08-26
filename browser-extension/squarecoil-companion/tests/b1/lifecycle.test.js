'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createLifecycleController } = require('../../src/core/lifecycle');

function createAdapters(overrides = {}) {
  const teardownCounts = { persistence: 0, ui: 0, features: 0, bridge: 0, coordination: 0 };
  const adapters = {
    persistence: {
      ensure: async () => ({ available: true }),
      teardown: async () => { teardownCounts.persistence += 1; }
    },
    ui: {
      ensure: async () => ({ rootCount: 1, owned: true, interactionReady: true, teardownRegistered: true }),
      teardown: async () => { teardownCounts.ui += 1; }
    },
    features: {
      ensure: async () => ({ initialized: true, teardownRegistered: true }),
      teardown: async () => { teardownCounts.features += 1; }
    },
    bridge: {
      ensure: async () => ({ initialized: true, teardownRegistered: true }),
      observeInitial: async () => ({ attempted: true, kind: 'STATE_UNKNOWN' }),
      teardown: async () => { teardownCounts.bridge += 1; }
    },
    coordination: {
      ensure: async () => ({ disposition: 'OWNER' }),
      teardown: async () => { teardownCounts.coordination += 1; }
    }
  };

  for (const [name, patch] of Object.entries(overrides)) {
    adapters[name] = { ...adapters[name], ...patch };
  }
  return { adapters, teardownCounts };
}

function createController(adapters) {
  return createLifecycleController({
    runtimeInstanceId: 'runtime-test-1',
    buildId: 'rebuild-b1-shell-lifecycle',
    packageVersion: '0.7.1',
    adapters,
    recoveryDelays: [0, 0, 0],
    sleep: async () => {}
  });
}

test('READY requires all L1 readiness assertions including positive coordination', async () => {
  const { adapters } = createAdapters();
  const lifecycle = createController(adapters);
  const result = await lifecycle.boot();
  assert.equal(result.state, 'READY');
  assert.equal(result.reason, 'ready');
  assert.equal(result.readiness.coordinationDisposition, 'OWNER');
  assert.equal(result.readiness.interactionReady, true);
});

test('B1 live coordination placeholder cannot falsely report READY', async () => {
  const { adapters } = createAdapters({
    coordination: { ensure: async () => ({ disposition: 'UNAVAILABLE_B1' }) }
  });
  const lifecycle = createController(adapters);
  const result = await lifecycle.boot();
  assert.equal(result.state, 'DEGRADED');
  assert.equal(result.reason, 'coordination-not-implemented-b1');
  assert.equal(result.readiness.coordinationPositive, false);
});

test('persistence failure denies READY', async () => {
  const { adapters } = createAdapters({
    persistence: { ensure: async () => ({ available: false }) }
  });
  const lifecycle = createController(adapters);
  const result = await lifecycle.boot();
  assert.equal(result.state, 'DEGRADED');
  assert.equal(result.reason, 'persistence-unavailable');
});

test('recover can return a known runtime to READY without creating another lifecycle owner', async () => {
  let uiChecks = 0;
  const { adapters } = createAdapters({
    ui: {
      ensure: async () => {
        uiChecks += 1;
        return { rootCount: 1, owned: true, interactionReady: uiChecks > 1, teardownRegistered: true };
      }
    }
  });
  const lifecycle = createController(adapters);
  const first = await lifecycle.boot();
  assert.equal(first.state, 'DEGRADED');
  assert.equal(first.reason, 'interaction-init-failed');
  const recovered = await lifecycle.recover();
  assert.equal(recovered.state, 'READY');
  assert.equal(recovered.runtimeInstanceId, first.runtimeInstanceId);
});

test('teardown is idempotent and releases owned adapters once', async () => {
  const { adapters, teardownCounts } = createAdapters();
  const lifecycle = createController(adapters);
  await lifecycle.boot();
  const first = await lifecycle.teardown();
  const second = await lifecycle.teardown();
  assert.equal(first.state, 'UNINITIALIZED');
  assert.equal(second.state, 'UNINITIALIZED');
  assert.deepEqual(teardownCounts, { persistence: 1, ui: 1, features: 1, bridge: 1, coordination: 1 });
});
