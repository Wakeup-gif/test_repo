'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { PROBE_RESULTS, classifyRuntimeProbe } = require('../../src/core/runtime-probe');

const BUILD_ID = 'rebuild-b1-shell-lifecycle';

function probe(overrides = {}) {
  return {
    runtimeSnapshot: null,
    rootCount: 0,
    roots: [],
    hasLegacyRuntime: false,
    ...overrides
  };
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
    roots: [{ rebuildOwned: true, runtimeInstanceId: 'old-runtime' }]
  }), BUILD_ID), PROBE_RESULTS.ORPHAN_ROOT_ONLY);
});

test('foreign root without lifecycle owner is an ownership conflict', () => {
  assert.equal(classifyRuntimeProbe(probe({
    rootCount: 1,
    roots: [{ rebuildOwned: false }]
  }), BUILD_ID), PROBE_RESULTS.OWNERSHIP_CONFLICT);
});

test('same build READY runtime with matching root is healthy', () => {
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: { buildId: BUILD_ID, state: 'READY', runtimeInstanceId: 'r1' },
    rootCount: 1,
    roots: [{ rebuildOwned: true, runtimeInstanceId: 'r1' }]
  }), BUILD_ID), PROBE_RESULTS.HEALTHY_SAME_BUILD);
});

test('same build DEGRADED runtime is reused rather than reinjected', () => {
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: { buildId: BUILD_ID, state: 'DEGRADED', runtimeInstanceId: 'r1' },
    rootCount: 1,
    roots: [{ rebuildOwned: true, runtimeInstanceId: 'r1' }]
  }), BUILD_ID), PROBE_RESULTS.DEGRADED_SAME_BUILD);
});

test('different rebuild build requires version-mismatch handling', () => {
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: { buildId: 'other-build', state: 'READY', runtimeInstanceId: 'r1' },
    rootCount: 1,
    roots: [{ rebuildOwned: true, runtimeInstanceId: 'r1' }]
  }), BUILD_ID), PROBE_RESULTS.VERSION_MISMATCH);
});

test('runtime/root ownership mismatch is conflict', () => {
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: { buildId: BUILD_ID, state: 'READY', runtimeInstanceId: 'r1' },
    rootCount: 1,
    roots: [{ rebuildOwned: true, runtimeInstanceId: 'r2' }]
  }), BUILD_ID), PROBE_RESULTS.OWNERSHIP_CONFLICT);
});

test('duplicate roots are conflict even when a runtime exists', () => {
  assert.equal(classifyRuntimeProbe(probe({
    runtimeSnapshot: { buildId: BUILD_ID, state: 'READY', runtimeInstanceId: 'r1' },
    rootCount: 2,
    roots: [
      { rebuildOwned: true, runtimeInstanceId: 'r1' },
      { rebuildOwned: true, runtimeInstanceId: 'r1' }
    ]
  }), BUILD_ID), PROBE_RESULTS.OWNERSHIP_CONFLICT);
});
