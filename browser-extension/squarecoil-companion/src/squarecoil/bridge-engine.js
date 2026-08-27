'use strict';

const {
  EVIDENCE_KINDS,
  NEGATIVE_KINDS,
  STATE_CERTAINTY
} = require('./bridge-parser');

const NATIVE_ACTIONS = Object.freeze({
  FULL_CLOCK_OUT: 2,
  CHANGE_CONTEXT: 3,
  LEAVE_CONTEXT: 4
});

const EVENT_TYPES = Object.freeze({
  CONTEXT_DETECTED: 'CONTEXT_DETECTED',
  CONTEXT_CHANGED: 'CONTEXT_CHANGED',
  CONTEXT_VERIFIED: 'CONTEXT_VERIFIED',
  CONTEXT_METADATA_UPDATED: 'CONTEXT_METADATA_UPDATED',
  CONTEXT_LEFT: 'CONTEXT_LEFT',
  CLOCKED_OUT: 'CLOCKED_OUT',
  STATE_UNKNOWN: 'STATE_UNKNOWN',
  STATE_CONFLICT: 'STATE_CONFLICT'
});

const BOUNDARY_CERTAINTY = Object.freeze({
  NATIVE_CONFIRMED: 'NATIVE_CONFIRMED',
  DETECTED: 'DETECTED',
  NONE: 'NONE'
});

const DEFAULT_CANDIDATE_WINDOW_MS = 5_000;

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function frozenClone(value) {
  return deepFreeze(clone(value));
}

function assertSafeCounter(value, name, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new Error(`${name} must be a safe integer >= ${minimum}`);
  }
  return value;
}

function assertTimestamp(value, name) {
  return assertSafeCounter(value, name, 0);
}

function nextCounter(value, name) {
  assertSafeCounter(value, name);
  if (value === Number.MAX_SAFE_INTEGER) throw new Error(`${name} exhausted`);
  return value + 1;
}

function assertRuntimeId(value) {
  const runtimeId = String(value || '').trim();
  if (!runtimeId) throw new Error('sourceRuntimeId is required');
  return runtimeId;
}

function freezeState(value) {
  return frozenClone({
    active: value.active,
    bridgeGeneration: value.bridgeGeneration,
    bridgeSeq: value.bridgeSeq,
    stateSequence: value.stateSequence,
    candidateSequence: value.candidateSequence,
    requestSequence: value.requestSequence,
    candidateWindowMs: value.candidateWindowMs,
    candidate: value.candidate,
    activeRequest: value.activeRequest,
    lastConfirmed: value.lastConfirmed,
    pendingNegative: value.pendingNegative
  });
}

function assertState(state) {
  if (!state || typeof state !== 'object') throw new Error('bridge state is required');
  if (typeof state.active !== 'boolean') throw new Error('bridge active flag is invalid');
  assertSafeCounter(state.bridgeGeneration, 'bridgeGeneration', 1);
  assertSafeCounter(state.bridgeSeq, 'bridgeSeq');
  assertSafeCounter(state.stateSequence, 'stateSequence');
  assertSafeCounter(state.candidateSequence, 'candidateSequence');
  assertSafeCounter(state.requestSequence, 'requestSequence');
  assertSafeCounter(state.candidateWindowMs, 'candidateWindowMs', 1);
  return state;
}

function createBridgeEngineState(options = {}) {
  const candidateWindowMs = options.candidateWindowMs === undefined
    ? DEFAULT_CANDIDATE_WINDOW_MS
    : assertSafeCounter(options.candidateWindowMs, 'candidateWindowMs', 1);
  const bridgeGeneration = options.bridgeGeneration === undefined
    ? 1
    : assertSafeCounter(options.bridgeGeneration, 'bridgeGeneration', 1);
  return freezeState({
    active: true,
    bridgeGeneration,
    bridgeSeq: 0,
    stateSequence: 0,
    candidateSequence: 0,
    requestSequence: 0,
    candidateWindowMs,
    candidate: null,
    activeRequest: null,
    lastConfirmed: null,
    pendingNegative: null
  });
}

function result(state, accepted, reason, extras = {}) {
  return deepFreeze({
    accepted,
    reason,
    state,
    events: extras.events || [],
    request: extras.request || null,
    candidate: extras.candidate || null,
    supersededCandidateId: extras.supersededCandidateId || null
  });
}

function reject(state, reason) {
  return result(state, false, reason);
}

function currentContext(state) {
  return state.lastConfirmed && state.lastConfirmed.kind === 'CONTEXT'
    ? state.lastConfirmed.context
    : null;
}

function generationMatches(state, generation) {
  return state.active && generation === state.bridgeGeneration;
}

function recordNativeCompletion(inputState, options = {}) {
  const state = assertState(inputState);
  if (!generationMatches(state, options.bridgeGeneration)) {
    return reject(state, 'STALE_BRIDGE_GENERATION');
  }
  const nativeAction = Number(options.nativeAction);
  if (![2, 3, 4].includes(nativeAction)) return reject(state, 'UNSUPPORTED_NATIVE_ACTION');

  const completedAtMs = assertTimestamp(options.completedAtMs, 'completedAtMs');
  const candidateSequence = nextCounter(state.candidateSequence, 'candidateSequence');
  const expiresAtMs = completedAtMs + state.candidateWindowMs;
  if (!Number.isSafeInteger(expiresAtMs)) throw new Error('candidate expiry exceeds safe integer range');
  const prior = currentContext(state);
  const candidate = frozenClone({
    candidateId: `candidate:${state.bridgeGeneration}:${candidateSequence}`,
    bridgeGeneration: state.bridgeGeneration,
    nativeAction,
    completedAtMs,
    expiresAtMs,
    requestProjectId: options.requestProjectId == null ? null : String(options.requestProjectId).trim(),
    requestDepartment: options.requestDepartment == null ? null : String(options.requestDepartment).trim(),
    priorConfirmedContextId: prior ? prior.contextId : null,
    sourceRuntimeId: assertRuntimeId(options.sourceRuntimeId),
    verificationStatus: 'PENDING'
  });
  const supersededCandidateId = state.candidate ? state.candidate.candidateId : null;
  const next = freezeState({
    ...state,
    stateSequence: nextCounter(state.stateSequence, 'stateSequence'),
    candidateSequence,
    candidate
  });
  return result(next, true, 'TRANSITION_CANDIDATE_RECORDED', { candidate, supersededCandidateId });
}

function candidateAt(state, nowMs) {
  if (!state.candidate) return null;
  return nowMs < state.candidate.expiresAtMs ? state.candidate : null;
}

function beginVerification(inputState, options = {}) {
  let state = assertState(inputState);
  if (!generationMatches(state, options.bridgeGeneration)) {
    return reject(state, 'STALE_BRIDGE_GENERATION');
  }
  const requestStartedAtMs = assertTimestamp(options.requestStartedAtMs, 'requestStartedAtMs');
  const liveCandidate = candidateAt(state, requestStartedAtMs);
  if (state.candidate && !liveCandidate) {
    state = freezeState({ ...state, candidate: null });
  }

  let candidateId = options.candidateId === undefined
    ? (liveCandidate ? liveCandidate.candidateId : null)
    : options.candidateId;
  if (candidateId !== null) candidateId = String(candidateId);
  if (candidateId && (!liveCandidate || liveCandidate.candidateId !== candidateId)) {
    return reject(state, 'CANDIDATE_UNAVAILABLE');
  }

  const requestSequence = nextCounter(state.requestSequence, 'requestSequence');
  const request = frozenClone({
    bridgeGeneration: state.bridgeGeneration,
    requestId: `verification:${state.bridgeGeneration}:${requestSequence}`,
    requestStartedAtMs,
    candidateId,
    stateSequenceAtStart: state.stateSequence
  });
  const next = freezeState({ ...state, requestSequence, activeRequest: request });
  return result(next, true, 'VERIFICATION_STARTED', { request });
}

function eventFor(state, type, observedAtMs, fields = {}) {
  const bridgeSeq = nextCounter(state.bridgeSeq, 'bridgeSeq');
  return frozenClone({
    type,
    bridgeGeneration: state.bridgeGeneration,
    bridgeSeq,
    observationId: `observation:${state.bridgeGeneration}:${bridgeSeq}`,
    observedAtMs,
    boundaryAtMs: null,
    boundaryCertainty: BOUNDARY_CERTAINTY.NONE,
    transitionCandidateId: null,
    ...fields
  });
}

function stateWithEvent(state, event, changes = {}) {
  return freezeState({
    ...state,
    bridgeSeq: event.bridgeSeq,
    ...changes
  });
}

function sameContextMetadata(left, right) {
  if (!left || !right || left.contextId !== right.contextId) return false;
  return String(left.label || '') === String(right.label || '') &&
    String(left.department || '') === String(right.department || '') &&
    String(left.shortLabel || '') === String(right.shortLabel || '');
}

function candidateMatchesPositive(candidate, context) {
  if (!candidate) return false;
  if (candidate.nativeAction === NATIVE_ACTIONS.FULL_CLOCK_OUT) return false;
  if (candidate.nativeAction === NATIVE_ACTIONS.LEAVE_CONTEXT) {
    return Boolean(candidate.priorConfirmedContextId && candidate.priorConfirmedContextId !== context.contextId);
  }
  if (!candidate.requestProjectId) return true;
  if (candidate.requestProjectId === '0') return context.contextId === 'general:production-general';
  return String(context.projectId || '') === candidate.requestProjectId;
}

function candidateMatchesNegative(candidate, negativeKind) {
  if (!candidate) return false;
  if (candidate.nativeAction === NATIVE_ACTIONS.FULL_CLOCK_OUT) {
    return negativeKind === NEGATIVE_KINDS.CLOCKED_OUT || negativeKind === NEGATIVE_KINDS.NO_CONTEXT;
  }
  if (candidate.nativeAction === NATIVE_ACTIONS.LEAVE_CONTEXT) {
    return negativeKind === NEGATIVE_KINDS.NO_TRACKABLE_CONTEXT || negativeKind === NEGATIVE_KINDS.NO_CONTEXT;
  }
  return false;
}

function contextEvent(state, request, evidence, candidate) {
  const prior = currentContext(state);
  if (candidate && !candidateMatchesPositive(candidate, evidence.context)) {
    const event = eventFor(state, EVENT_TYPES.STATE_CONFLICT, evidence.observedAtMs, {
      source: evidence.source,
      stateCertainty: STATE_CERTAINTY.CONFLICT,
      reason: 'TRANSITION_CANDIDATE_POSTSTATE_CONFLICT',
      transitionCandidateId: candidate.candidateId,
      verificationId: request.requestId,
      lastConfirmedContextId: prior ? prior.contextId : null
    });
    return {
      state: stateWithEvent(state, event, { candidate: null, activeRequest: null }),
      event,
      reason: 'POSTSTATE_CONFLICT'
    };
  }

  const correlated = Boolean(candidate);
  const sameIdentity = Boolean(prior && prior.contextId === evidence.context.contextId);
  const metadataChanged = sameIdentity && !sameContextMetadata(prior, evidence.context);
  let type;
  if (sameIdentity) type = metadataChanged ? EVENT_TYPES.CONTEXT_METADATA_UPDATED : EVENT_TYPES.CONTEXT_VERIFIED;
  else type = prior ? EVENT_TYPES.CONTEXT_CHANGED : EVENT_TYPES.CONTEXT_DETECTED;

  const hasBoundary = !sameIdentity;
  const boundaryAtMs = hasBoundary
    ? (correlated ? candidate.completedAtMs : evidence.observedAtMs)
    : null;
  const boundaryCertainty = hasBoundary
    ? (correlated ? BOUNDARY_CERTAINTY.NATIVE_CONFIRMED : BOUNDARY_CERTAINTY.DETECTED)
    : BOUNDARY_CERTAINTY.NONE;
  const stateCertainty = correlated
    ? STATE_CERTAINTY.NATIVE_CONFIRMED_POSTSTATE
    : evidence.stateCertainty;
  const event = eventFor(state, type, evidence.observedAtMs, {
    context: evidence.context,
    priorContextId: prior ? prior.contextId : null,
    source: evidence.source,
    stateCertainty,
    boundaryAtMs,
    boundaryCertainty,
    transitionCandidateId: correlated ? candidate.candidateId : null,
    verificationId: request.requestId,
    metadataChanged
  });
  const confirmed = frozenClone({
    kind: 'CONTEXT',
    context: evidence.context,
    observedAtMs: evidence.observedAtMs,
    stateCertainty,
    verificationId: request.requestId
  });
  return {
    state: stateWithEvent(state, event, {
      stateSequence: nextCounter(state.stateSequence, 'stateSequence'),
      candidate: correlated ? null : state.candidate,
      activeRequest: null,
      lastConfirmed: confirmed,
      pendingNegative: null
    }),
    event,
    reason: type
  };
}

function conflictFromNegative(state, request, evidence, candidate, reason) {
  const prior = currentContext(state);
  const event = eventFor(state, EVENT_TYPES.STATE_CONFLICT, evidence.observedAtMs, {
    source: evidence.source,
    stateCertainty: STATE_CERTAINTY.CONFLICT,
    reason,
    transitionCandidateId: candidate ? candidate.candidateId : null,
    verificationId: request.requestId,
    lastConfirmedContextId: prior ? prior.contextId : null
  });
  return {
    state: stateWithEvent(state, event, { candidate: candidate ? null : state.candidate, activeRequest: null }),
    event,
    reason
  };
}

function confirmedNegative(state, request, evidence, type, observationKind, candidate) {
  const correlated = Boolean(candidate);
  const event = eventFor(state, type, evidence.observedAtMs, {
    source: evidence.source,
    stateCertainty: correlated ? STATE_CERTAINTY.NATIVE_CONFIRMED_POSTSTATE : evidence.stateCertainty,
    boundaryAtMs: correlated ? candidate.completedAtMs : evidence.observedAtMs,
    boundaryCertainty: correlated ? BOUNDARY_CERTAINTY.NATIVE_CONFIRMED : BOUNDARY_CERTAINTY.DETECTED,
    transitionCandidateId: correlated ? candidate.candidateId : null,
    verificationId: request.requestId,
    priorContextId: currentContext(state) ? currentContext(state).contextId : null
  });
  const confirmed = frozenClone({
    kind: observationKind,
    observedAtMs: evidence.observedAtMs,
    stateCertainty: event.stateCertainty,
    verificationId: request.requestId
  });
  return {
    state: stateWithEvent(state, event, {
      stateSequence: nextCounter(state.stateSequence, 'stateSequence'),
      candidate: correlated ? null : state.candidate,
      activeRequest: null,
      lastConfirmed: confirmed,
      pendingNegative: null
    }),
    event,
    reason: type
  };
}

function compatibleNegative(left, right) {
  return left === right || left === NEGATIVE_KINDS.NO_CONTEXT || right === NEGATIVE_KINDS.NO_CONTEXT;
}

function resolvedNegativeKind(left, right) {
  if (left === NEGATIVE_KINDS.CLOCKED_OUT || right === NEGATIVE_KINDS.CLOCKED_OUT) return NEGATIVE_KINDS.CLOCKED_OUT;
  return NEGATIVE_KINDS.NO_TRACKABLE_CONTEXT;
}

function negativeEvent(state, request, evidence, candidate) {
  if (candidate) {
    if (!candidateMatchesNegative(candidate, evidence.negativeKind)) {
      return conflictFromNegative(state, request, evidence, candidate, 'TRANSITION_CANDIDATE_POSTSTATE_CONFLICT');
    }
    if (candidate.nativeAction === NATIVE_ACTIONS.FULL_CLOCK_OUT) {
      return confirmedNegative(state, request, evidence, EVENT_TYPES.CLOCKED_OUT, 'CLOCKED_OUT', candidate);
    }
    return confirmedNegative(state, request, evidence, EVENT_TYPES.CONTEXT_LEFT, 'NO_TRACKABLE_CONTEXT', candidate);
  }

  const pending = state.pendingNegative;
  if (!pending) {
    return {
      state: freezeState({
        ...state,
        activeRequest: null,
        pendingNegative: {
          negativeKind: evidence.negativeKind,
          observedAtMs: evidence.observedAtMs,
          source: evidence.source
        }
      }),
      event: null,
      reason: 'NEGATIVE_CONFIRMATION_PENDING'
    };
  }
  if (!compatibleNegative(pending.negativeKind, evidence.negativeKind)) {
    return conflictFromNegative(state, request, evidence, null, 'NEGATIVE_EVIDENCE_CONFLICT');
  }
  if (evidence.observedAtMs <= pending.observedAtMs) {
    return {
      state: freezeState({ ...state, activeRequest: null }),
      event: null,
      reason: 'NEGATIVE_CONFIRMATION_NOT_SEPARATED'
    };
  }

  const resolved = resolvedNegativeKind(pending.negativeKind, evidence.negativeKind);
  if (resolved === NEGATIVE_KINDS.CLOCKED_OUT) {
    return confirmedNegative(state, request, evidence, EVENT_TYPES.CLOCKED_OUT, 'CLOCKED_OUT', null);
  }
  return confirmedNegative(state, request, evidence, EVENT_TYPES.CONTEXT_LEFT, 'NO_TRACKABLE_CONTEXT', null);
}

function unknownEvent(state, request, evidence, candidate) {
  const strongUnconfirmedTransition = candidate && candidate.nativeAction === NATIVE_ACTIONS.FULL_CLOCK_OUT
    ? frozenClone({
      kind: 'CLOCKED_OUT',
      strength: 'STRONG_UNCONFIRMED',
      candidateId: candidate.candidateId,
      boundaryAtMs: candidate.completedAtMs,
      nativeAction: candidate.nativeAction
    })
    : null;
  const event = eventFor(state, EVENT_TYPES.STATE_UNKNOWN, evidence.observedAtMs, {
    source: evidence.source,
    stateCertainty: STATE_CERTAINTY.UNKNOWN,
    reason: evidence.reason || 'VERIFICATION_UNKNOWN',
    verificationId: request.requestId,
    transitionCandidateId: candidate ? candidate.candidateId : null,
    strongUnconfirmedTransition
  });
  const retainedCandidate = strongUnconfirmedTransition
    ? frozenClone({ ...candidate, verificationStatus: 'STRONG_UNCONFIRMED' })
    : state.candidate;
  return {
    state: stateWithEvent(state, event, { activeRequest: null, candidate: retainedCandidate }),
    event,
    reason: strongUnconfirmedTransition ? 'STRONG_UNCONFIRMED_CLOCK_OUT' : EVENT_TYPES.STATE_UNKNOWN
  };
}

function directConflictEvent(state, request, evidence, candidate) {
  const prior = currentContext(state);
  const event = eventFor(state, EVENT_TYPES.STATE_CONFLICT, evidence.observedAtMs, {
    source: evidence.source,
    stateCertainty: STATE_CERTAINTY.CONFLICT,
    reason: evidence.reason || 'EVIDENCE_CONFLICT',
    verificationId: request.requestId,
    transitionCandidateId: candidate ? candidate.candidateId : null,
    lastConfirmedContextId: prior ? prior.contextId : null
  });
  return {
    state: stateWithEvent(state, event, { activeRequest: null, candidate: candidate ? null : state.candidate }),
    event,
    reason: EVENT_TYPES.STATE_CONFLICT
  };
}

function acceptVerification(inputState, options = {}) {
  let state = assertState(inputState);
  const request = options.request;
  if (!request || typeof request !== 'object') throw new Error('verification request is required');
  if (!state.active || request.bridgeGeneration !== state.bridgeGeneration) {
    return reject(state, 'STALE_BRIDGE_GENERATION');
  }
  if (!state.activeRequest || request.requestId !== state.activeRequest.requestId) {
    return reject(state, 'STALE_OR_SUPERSEDED_REQUEST');
  }
  if (request.stateSequenceAtStart !== state.stateSequence) {
    state = freezeState({ ...state, activeRequest: null });
    return reject(state, 'STALE_REQUEST_STATE_GENERATION');
  }

  const evidence = options.evidence;
  if (!evidence || typeof evidence !== 'object' || !Object.values(EVIDENCE_KINDS).includes(evidence.kind)) {
    throw new Error('normalized Bridge evidence is required');
  }
  assertTimestamp(evidence.observedAtMs, 'evidence.observedAtMs');
  if (evidence.observedAtMs < request.requestStartedAtMs) {
    state = freezeState({ ...state, activeRequest: null });
    return reject(state, 'STALE_EVIDENCE_CAPTURE_TIME');
  }

  let candidate = state.candidate;
  if (candidate && evidence.observedAtMs >= candidate.expiresAtMs) {
    state = freezeState({ ...state, candidate: null });
    candidate = null;
  }
  if (!request.candidateId || !candidate || request.candidateId !== candidate.candidateId) candidate = null;

  let handled;
  if (evidence.kind === EVIDENCE_KINDS.CONTEXT) {
    handled = contextEvent(state, request, evidence, candidate);
  } else if (evidence.kind === EVIDENCE_KINDS.NEGATIVE_CANDIDATE) {
    handled = negativeEvent(state, request, evidence, candidate);
  } else if (evidence.kind === EVIDENCE_KINDS.STATE_CONFLICT) {
    handled = directConflictEvent(state, request, evidence, candidate);
  } else {
    handled = unknownEvent(state, request, evidence, candidate);
  }

  return result(handled.state, true, handled.reason, { events: handled.event ? [handled.event] : [] });
}

function teardownBridge(inputState) {
  const state = assertState(inputState);
  if (!state.active) return result(state, true, 'BRIDGE_ALREADY_TORN_DOWN');
  const bridgeGeneration = nextCounter(state.bridgeGeneration, 'bridgeGeneration');
  const next = freezeState({
    ...state,
    active: false,
    bridgeGeneration,
    stateSequence: nextCounter(state.stateSequence, 'stateSequence'),
    candidate: null,
    activeRequest: null,
    pendingNegative: null
  });
  return result(next, true, 'BRIDGE_TORN_DOWN');
}

function reinitializeBridge(inputState) {
  const state = assertState(inputState);
  if (state.active) return reject(state, 'BRIDGE_ALREADY_ACTIVE');
  const next = freezeState({ ...state, active: true });
  return result(next, true, 'BRIDGE_REINITIALIZED');
}

module.exports = {
  NATIVE_ACTIONS,
  EVENT_TYPES,
  BOUNDARY_CERTAINTY,
  DEFAULT_CANDIDATE_WINDOW_MS,
  createBridgeEngineState,
  recordNativeCompletion,
  beginVerification,
  acceptVerification,
  teardownBridge,
  reinitializeBridge
};
