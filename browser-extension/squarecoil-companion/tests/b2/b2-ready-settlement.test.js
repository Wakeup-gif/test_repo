'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateB2ReadySettlement } = require('../../src/core/b2-ready-settlement');
const {
  AUTHORITY_PROTOCOL_VERSION,
  AUTHORITY_CONTROL_MESSAGES,
  createB2SettlementAcknowledgment,
  isB2SettlementAcknowledgment
} = require('../../src/extension/authority-protocol');

function shell() {
  return {
    mode: 'ENABLED',
    state: 'DEGRADED',
    reason: 'coordination-not-implemented-b1',
    teardownInProgress: false,
    readiness: {
      oneLifecycleOwner: true,
      validRuntimeIdentity: true,
      oneOwnedRoot: true,
      interactionReady: true,
      persistenceAvailable: true,
      bridgeInitialized: true,
      initialObservationAttempted: true,
      featureRegistryInitialized: true,
      teardownRegistered: true
    }
  };
}

function authority(disposition = 'OWNER') {
  return { enabled: true, healthy: true, disposition };
}

function core(overrides = {}) {
  return {
    initialized: true,
    disposed: false,
    blocked: false,
    readModelError: null,
    preflight: { disposition: 'NOT_REQUIRED', reason: 'legacy-not-present' },
    bridge: {
      initialized: true,
      active: true,
      disposed: false,
      listenersAttached: true,
      capability: 'FULL',
      requestCount: 1
    },
    ...overrides
  };
}

test('UT-B2-READY-001 READY-C01 settles an OWNER only after lifecycle, migration, trusted core, and Bridge prerequisites pass', () => {
  assert.deepEqual(evaluateB2ReadySettlement(shell(), authority(), core()), {
    ready: true,
    reason: 'ready',
    authorityDisposition: 'OWNER',
    migrationDisposition: 'NOT_REQUIRED',
    bridgeCapability: 'FULL'
  });
});

test('UT-B2-READY-002 READY-C02 settles an OBSERVER_CONNECTED with initialized listeners without making it a writer', () => {
  const observerCore = core({ bridge: { ...core().bridge, owner: false, requestCount: 0 } });
  assert.equal(evaluateB2ReadySettlement(shell(), authority('OBSERVER_CONNECTED'), observerCore).ready, true);
});

test('UT-B2-READY-003 READY-C03 every unresolved or blocked migration disposition fails closed', () => {
  for (const disposition of ['REQUIRED', 'IN_PROGRESS', 'SOURCE_CHANGED_AFTER_COMPLETION', 'UNAVAILABLE', 'FAILED']) {
    const value = evaluateB2ReadySettlement(shell(), authority(), core({
      blocked: true,
      preflight: { disposition, reason: `migration-${disposition.toLowerCase()}` }
    }));
    assert.equal(value.ready, false, disposition);
  }
});

test('UT-B2-READY-004 READY-C04 verification fallback is READY but UNAVAILABLE Bridge is not', () => {
  const fallback = core({ bridge: { ...core().bridge, capability: 'VERIFICATION_FALLBACK' } });
  assert.equal(evaluateB2ReadySettlement(shell(), authority(), fallback).ready, true);
  const unavailable = core({ bridge: { ...core().bridge, capability: 'UNAVAILABLE' } });
  assert.deepEqual(evaluateB2ReadySettlement(shell(), authority(), unavailable), {
    ready: false,
    reason: 'bridge-unavailable',
    bridgeCapability: 'UNAVAILABLE'
  });
});

test('UT-B2-READY-005 READY remains fail closed for stale shell, unhealthy authority, incomplete core, and malformed evidence', () => {
  assert.equal(evaluateB2ReadySettlement({ ...shell(), teardownInProgress: true }, authority(), core()).ready, false);
  assert.equal(evaluateB2ReadySettlement(shell(), { ...authority(), healthy: false }, core()).ready, false);
  assert.equal(evaluateB2ReadySettlement(shell(), authority(), core({ initialized: false })).ready, false);
  assert.equal(evaluateB2ReadySettlement(shell(), authority(), {}).ready, false);
});

test('UT-B2-READY-006 B2 settlement delivery requires an exact runtime and document acknowledgment', () => {
  const message = {
    type: AUTHORITY_CONTROL_MESSAGES.GET_B2_SETTLEMENT,
    protocolVersion: AUTHORITY_PROTOCOL_VERSION,
    documentToken: 'document-settlement-001',
    runtimeInstanceId: 'runtime-settlement-001'
  };
  const acknowledgment = createB2SettlementAcknowledgment(message, authority(), core());
  assert.equal(isB2SettlementAcknowledgment(acknowledgment, message), true);
  assert.equal(isB2SettlementAcknowledgment({ ...acknowledgment, extra: true }, message), false);
  assert.equal(isB2SettlementAcknowledgment({ ...acknowledgment, runtimeInstanceId: 'runtime-stale-001' }, message), false);
  assert.equal(isB2SettlementAcknowledgment({ ...acknowledgment, documentToken: 'document-stale-001' }, message), false);
});
