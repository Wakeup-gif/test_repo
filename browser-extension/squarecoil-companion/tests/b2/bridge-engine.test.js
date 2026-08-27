'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseServerSnapshot,
  parseDomSnapshot
} = require('../../src/squarecoil/bridge-parser');
const {
  NATIVE_ACTIONS,
  EVENT_TYPES,
  BOUNDARY_CERTAINTY,
  createBridgeEngineState,
  recordNativeCompletion,
  beginVerification,
  acceptVerification,
  teardownBridge,
  reinitializeBridge
} = require('../../src/squarecoil/bridge-engine');

function jobEvidence(projectId, label, observedAtMs, department) {
  return parseServerSnapshot(`
    <span id="clockin-remaining-time">
      <a href="/project.php?id=${projectId}">${label}</a>
    </span>
  `, { observedAtMs, department });
}

function serverNoContext(observedAtMs) {
  return parseServerSnapshot('<span id="clockin-remaining-time"></span>', { observedAtMs });
}

function verify(state, evidence, requestStartedAtMs, candidateId) {
  const started = beginVerification(state, {
    bridgeGeneration: state.bridgeGeneration,
    requestStartedAtMs,
    ...(candidateId === undefined ? {} : { candidateId })
  });
  assert.equal(started.accepted, true);
  return acceptVerification(started.state, { request: started.request, evidence });
}

function confirmJob(state, projectId, label, atMs, department) {
  return verify(state, jobEvidence(projectId, label, atMs, department), atMs - 1);
}

function nativeCandidate(state, nativeAction, completedAtMs, options = {}) {
  return recordNativeCompletion(state, {
    bridgeGeneration: state.bridgeGeneration,
    nativeAction,
    completedAtMs,
    sourceRuntimeId: options.sourceRuntimeId || 'runtime-owner',
    requestProjectId: options.requestProjectId,
    requestDepartment: options.requestDepartment
  });
}

test('UT-B2-BRIDGE-001 action 3 A-to-B verification emits one native-confirmed Context change', () => {
  const initial = confirmJob(createBridgeEngineState(), '260701', '260701 - Design', 100);
  const candidate = nativeCandidate(initial.state, NATIVE_ACTIONS.CHANGE_CONTEXT, 200, {
    requestProjectId: '260702',
    requestDepartment: 'Fabrication'
  });
  const changed = verify(
    candidate.state,
    jobEvidence('260702', '260702 - Fabrication', 202, 'Fabrication'),
    201
  );

  assert.equal(changed.events.length, 1);
  assert.equal(changed.events[0].type, EVENT_TYPES.CONTEXT_CHANGED);
  assert.equal(changed.events[0].priorContextId, 'job:260701');
  assert.equal(changed.events[0].context.contextId, 'job:260702');
  assert.equal(changed.events[0].boundaryAtMs, 200);
  assert.equal(changed.events[0].boundaryCertainty, BOUNDARY_CERTAINTY.NATIVE_CONFIRMED);
  assert.equal(changed.state.candidate, null);
  assert.equal('ledger' in changed.events[0], false);
  assert.equal('timerState' in changed.events[0], false);
});

test('UT-B2-BRIDGE-002 action 3 same-project label or department change is metadata-only', () => {
  const initial = confirmJob(
    createBridgeEngineState(),
    '260701',
    '260701 - Design',
    300,
    'Design'
  );
  const candidate = nativeCandidate(initial.state, NATIVE_ACTIONS.CHANGE_CONTEXT, 310, {
    requestProjectId: '260701',
    requestDepartment: 'Engineering'
  });
  const updated = verify(
    candidate.state,
    jobEvidence('260701', '260701 - Engineering', 312, 'Engineering'),
    311
  );

  assert.equal(updated.events[0].type, EVENT_TYPES.CONTEXT_METADATA_UPDATED);
  assert.equal(updated.events[0].context.contextId, 'job:260701');
  assert.equal(updated.events[0].boundaryAtMs, null);
  assert.equal(updated.events[0].boundaryCertainty, BOUNDARY_CERTAINTY.NONE);
  assert.equal(updated.events[0].metadataChanged, true);
  assert.equal(updated.state.candidate, null);
});

test('UT-B2-BRIDGE-003 separate action 4 and action 3 completions preserve both real boundaries', () => {
  const initial = confirmJob(createBridgeEngineState(), '260701', '260701 - Design', 400);
  const leaveCandidate = nativeCandidate(initial.state, NATIVE_ACTIONS.LEAVE_CONTEXT, 410);
  const left = verify(leaveCandidate.state, serverNoContext(412), 411);

  assert.equal(left.events[0].type, EVENT_TYPES.CONTEXT_LEFT);
  assert.equal(left.events[0].boundaryAtMs, 410);
  assert.equal(left.events[0].boundaryCertainty, BOUNDARY_CERTAINTY.NATIVE_CONFIRMED);

  const enterCandidate = nativeCandidate(left.state, NATIVE_ACTIONS.CHANGE_CONTEXT, 430, {
    requestProjectId: '260702'
  });
  const entered = verify(
    enterCandidate.state,
    jobEvidence('260702', '260702 - Fabrication', 432),
    431
  );

  assert.equal(entered.events[0].type, EVENT_TYPES.CONTEXT_DETECTED);
  assert.equal(entered.events[0].boundaryAtMs, 430);
  assert.equal(entered.events[0].boundaryCertainty, BOUNDARY_CERTAINTY.NATIVE_CONFIRMED);
  assert.equal(entered.events[0].bridgeSeq, left.events[0].bridgeSeq + 1);
  assert.notEqual(left.events[0].boundaryAtMs, entered.events[0].boundaryAtMs);
});

test('UT-B2-BRIDGE-004 action 2 retains strong unconfirmed evidence until compatible post-state arrives', () => {
  const initial = confirmJob(createBridgeEngineState(), '260701', '260701 - Design', 500);
  const clockOutCandidate = nativeCandidate(initial.state, NATIVE_ACTIONS.FULL_CLOCK_OUT, 510);
  const unavailableEvidence = parseServerSnapshot(null, {
    observedAtMs: 512,
    available: false
  });
  const unconfirmed = verify(clockOutCandidate.state, unavailableEvidence, 511);

  assert.equal(unconfirmed.events[0].type, EVENT_TYPES.STATE_UNKNOWN);
  assert.equal(unconfirmed.events[0].strongUnconfirmedTransition.strength, 'STRONG_UNCONFIRMED');
  assert.equal(unconfirmed.events[0].strongUnconfirmedTransition.boundaryAtMs, 510);
  assert.equal(unconfirmed.state.lastConfirmed.context.contextId, 'job:260701');
  assert.equal(unconfirmed.state.candidate.verificationStatus, 'STRONG_UNCONFIRMED');
  assert.equal(unconfirmed.events.some(event => event.type === EVENT_TYPES.CLOCKED_OUT), false);

  const confirmed = verify(unconfirmed.state, serverNoContext(514), 513);
  assert.equal(confirmed.events[0].type, EVENT_TYPES.CLOCKED_OUT);
  assert.equal(confirmed.events[0].boundaryAtMs, 510);
  assert.equal(confirmed.events[0].boundaryCertainty, BOUNDARY_CERTAINTY.NATIVE_CONFIRMED);
  assert.equal(confirmed.state.candidate, null);
});

test('UT-B2-BRIDGE-005 request generations reject action-7 evidence started before a newer mutation', () => {
  const initial = confirmJob(createBridgeEngineState(), '260701', '260701 - Design', 600);
  const oldRequest = beginVerification(initial.state, {
    bridgeGeneration: initial.state.bridgeGeneration,
    requestStartedAtMs: 601,
    candidateId: null
  });
  const newerCandidate = nativeCandidate(oldRequest.state, NATIVE_ACTIONS.CHANGE_CONTEXT, 602, {
    requestProjectId: '260702'
  });
  const stale = acceptVerification(newerCandidate.state, {
    request: oldRequest.request,
    evidence: jobEvidence('260701', '260701 - Design', 603)
  });

  assert.equal(stale.accepted, false);
  assert.equal(stale.reason, 'STALE_REQUEST_STATE_GENERATION');
  assert.equal(stale.state.lastConfirmed.context.contextId, 'job:260701');

  const fresh = verify(
    stale.state,
    jobEvidence('260702', '260702 - Fabrication', 605),
    604
  );
  assert.equal(fresh.events[0].type, EVENT_TYPES.CONTEXT_CHANGED);
  assert.equal(fresh.state.lastConfirmed.context.contextId, 'job:260702');
});

test('UT-B2-BRIDGE-006 expired candidates cannot donate boundaries and consumed requests cannot emit twice', () => {
  const initial = confirmJob(
    createBridgeEngineState({ candidateWindowMs: 10 }),
    '260701',
    '260701 - Design',
    700
  );
  const candidate = nativeCandidate(initial.state, NATIVE_ACTIONS.CHANGE_CONTEXT, 710, {
    requestProjectId: '260702'
  });
  const started = beginVerification(candidate.state, {
    bridgeGeneration: candidate.state.bridgeGeneration,
    requestStartedAtMs: 719
  });
  const expired = acceptVerification(started.state, {
    request: started.request,
    evidence: jobEvidence('260702', '260702 - Fabrication', 720)
  });

  assert.equal(expired.events[0].type, EVENT_TYPES.CONTEXT_CHANGED);
  assert.equal(expired.events[0].boundaryAtMs, 720);
  assert.equal(expired.events[0].boundaryCertainty, BOUNDARY_CERTAINTY.DETECTED);
  assert.equal(expired.events[0].transitionCandidateId, null);

  const nextCandidate = nativeCandidate(expired.state, NATIVE_ACTIONS.CHANGE_CONTEXT, 730, {
    requestProjectId: '260703'
  });
  const nextRequest = beginVerification(nextCandidate.state, {
    bridgeGeneration: nextCandidate.state.bridgeGeneration,
    requestStartedAtMs: 731
  });
  const consumed = acceptVerification(nextRequest.state, {
    request: nextRequest.request,
    evidence: jobEvidence('260703', '260703 - Install', 732)
  });
  const duplicate = acceptVerification(consumed.state, {
    request: nextRequest.request,
    evidence: jobEvidence('260703', '260703 - Install', 733)
  });

  assert.equal(consumed.events[0].boundaryAtMs, 730);
  assert.equal(consumed.state.candidate, null);
  assert.equal(duplicate.accepted, false);
  assert.equal(duplicate.reason, 'STALE_OR_SUPERSEDED_REQUEST');
  assert.equal(duplicate.events.length, 0);
});

test('UT-B2-BRIDGE-007 passive negative evidence requires two separated observations', () => {
  const initial = confirmJob(createBridgeEngineState(), '260701', '260701 - Design', 800);
  const first = verify(initial.state, parseDomSnapshot({
    clockInVisible: true,
    clockOutVisible: false
  }, { observedAtMs: 802 }), 801, null);

  assert.equal(first.reason, 'NEGATIVE_CONFIRMATION_PENDING');
  assert.equal(first.events.length, 0);
  assert.equal(first.state.lastConfirmed.context.contextId, 'job:260701');

  const second = verify(first.state, parseDomSnapshot({
    clockInVisible: true,
    clockOutVisible: false
  }, { observedAtMs: 804 }), 803, null);
  assert.equal(second.events[0].type, EVENT_TYPES.CLOCKED_OUT);
  assert.equal(second.events[0].boundaryCertainty, BOUNDARY_CERTAINTY.DETECTED);
});

test('UT-B2-BRIDGE-008 teardown invalidates old-generation requests, candidates, and callbacks', () => {
  const state = createBridgeEngineState();
  const candidate = nativeCandidate(state, NATIVE_ACTIONS.CHANGE_CONTEXT, 900, {
    requestProjectId: '260701'
  });
  const started = beginVerification(candidate.state, {
    bridgeGeneration: candidate.state.bridgeGeneration,
    requestStartedAtMs: 901
  });
  const oldGeneration = started.state.bridgeGeneration;
  const tornDown = teardownBridge(started.state);

  assert.equal(tornDown.state.active, false);
  assert.equal(tornDown.state.bridgeGeneration, oldGeneration + 1);
  assert.equal(tornDown.state.candidate, null);
  assert.equal(tornDown.state.activeRequest, null);

  const late = acceptVerification(tornDown.state, {
    request: started.request,
    evidence: jobEvidence('260701', '260701 - Design', 902)
  });
  assert.equal(late.accepted, false);
  assert.equal(late.reason, 'STALE_BRIDGE_GENERATION');

  const reinitialized = reinitializeBridge(tornDown.state);
  const oldCallback = recordNativeCompletion(reinitialized.state, {
    bridgeGeneration: oldGeneration,
    nativeAction: NATIVE_ACTIONS.CHANGE_CONTEXT,
    completedAtMs: 903,
    sourceRuntimeId: 'runtime-old'
  });
  const currentCallback = nativeCandidate(
    reinitialized.state,
    NATIVE_ACTIONS.CHANGE_CONTEXT,
    904,
    { requestProjectId: '260701' }
  );

  assert.equal(oldCallback.accepted, false);
  assert.equal(oldCallback.reason, 'STALE_BRIDGE_GENERATION');
  assert.equal(currentCallback.accepted, true);
  assert.equal(currentCallback.candidate.bridgeGeneration, oldGeneration + 1);
});
