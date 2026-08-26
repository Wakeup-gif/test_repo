'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { PROBE_RESULTS, classifyRuntimeProbe } = require('../../src/core/runtime-probe');
const { BUILD_ID } = require('../../src/core/build-identity');

function probe(overrides = {}) {
  return {
    runtimeSnapshot: null,
    rootCount: 0,
    roots: [],
    hasLegacyRuntime: false,
    ...overrides
  };
}

function readyRuntime(overrides = {}) {
  return {
    buildId: BUILD_ID,
    state: 'READY',
    runtimeInstanceId: 'r1',
    readiness: {
      oneLifecycleOwner: true,
      validRuntimeIdentity: true,
      oneOwnedRoot: true,
      interactionReady: true,
      persistenceAvailable: true,
      bridgeInitialized: true,
      initialObservationAttempted: true,
      featureRegistryInitialized: true,
      teardownRegistered: true,
      coordinationPositive: true
    },
    ui: { rootPresent: true, interactionReady: true },
    ...overrides
  };
}

function ownedRoot(overrides = {}) {
  return { rebuildOwned: true, runtimeInstanceId: 'r1', buildId: BUILD_ID, ...overrides };
}

test('fresh page classifies NONE', () => {
  assert.equal(classifyRuntimeProbe(probe(), BUILD_ID), PROBE_RESULTS.NONE);
});

test('legacy timer globals classify LEGACY_RUNTIME', () => {
  assert.equal(classifyRuntimeProbe(probe({ hasLegacyRuntime: true }), BUILD_ID), PROBE_RESULTS.LEGACY_RUNTIME);
});

test('one unowned rebuild root classifies ORPHAN_ROOT_ONLY', () => {
  assert.equal(classifyRuntimeProbe(probe({
    rootCount: 1,
    roots: [{ rebuildOwned: true, runtimeInstanceId: 'old-runtime', buildId: BUILD_ID }]
  }), BUILD_ID), PROBE_RESULTS.ORPHAN_ROOT_ONLY);
});

test('foreign root without lifecycle owner is an ownership conflict', () => {
  assert.equal(classifyRuntimeProbe(probe({
    rootCount: 1,
    roots: [{ rebuildOwned: false }]
  }), BUILD_ID), PROBE_RESULTS.OWNERSHIP_CONFLICT);
});

test('same build READY runtime with complete readiness and live interaction is healthy', () => {
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: readyRuntime(),
    rootCount: 1,
    roots: [ownedRoot()]
  }), BUILD_ID), PROBE_RESULTS.HEALTHY_SAME_BUILD);
});

test('visible READY root with dead interaction is degraded, never healthy', () => {
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: readyRuntime({ ui: { rootPresent: true, interactionReady: false } }),
    rootCount: 1,
    roots: [ownedRoot()]
  }), BUILD_ID), PROBE_RESULTS.DEGRADED_SAME_BUILD);
});

test('READY label without complete readiness assertions is degraded', () => {
  const runtime = readyRuntime();
  runtime.readiness.coordinationPositive = false;
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: runtime,
    rootCount: 1,
    roots: [ownedRoot()]
  }), BUILD_ID), PROBE_RESULTS.DEGRADED_SAME_BUILD);
});

test('same build DEGRADED runtime is reused rather than reinjected', () => {
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: { buildId: BUILD_ID, state: 'DEGRADED', runtimeInstanceId: 'r1' },
    rootCount: 1,
    roots: [ownedRoot()]
  }), BUILD_ID), PROBE_RESULTS.DEGRADED_SAME_BUILD);
});

test('different rebuild build requires version-mismatch handling', () => {
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: { buildId: 'other-build', state: 'READY', runtimeInstanceId: 'r1' },
    rootCount: 1,
    roots: [ownedRoot()]
  }), BUILD_ID), PROBE_RESULTS.VERSION_MISMATCH);
});

test('runtime/root ownership mismatch is conflict', () => {
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: readyRuntime(),
    rootCount: 1,
    roots: [ownedRoot({ runtimeInstanceId: 'r2' })]
  }), BUILD_ID), PROBE_RESULTS.OWNERSHIP_CONFLICT);
});

test('runtime root missing ownership metadata is conflict', () => {
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: readyRuntime(),
    rootCount: 1,
    roots: [{ rebuildOwned: true, runtimeInstanceId: null, buildId: null }]
  }), BUILD_ID), PROBE_RESULTS.OWNERSHIP_CONFLICT);
});

test('duplicate roots are conflict even when a runtime exists', () => {
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: readyRuntime(),
    rootCount: 2,
    roots: [ownedRoot(), ownedRoot()]
  }), BUILD_ID), PROBE_RESULTS.OWNERSHIP_CONFLICT);
});

test('UNINITIALIZED runtime global is not mistaken for a fresh page', () => {
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: { buildId: BUILD_ID, state: 'UNINITIALIZED', runtimeInstanceId: 'r1' },
    rootCount: 0
  }), BUILD_ID), PROBE_RESULTS.DEGRADED_SAME_BUILD);
});
