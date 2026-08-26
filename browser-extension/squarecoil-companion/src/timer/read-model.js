'use strict';

const {
  TIMER_STATES,
  deepClone,
  deepFreeze,
  isNonNegativeInteger,
  isTimestamp,
  timerKind,
  validateDocument
} = require('../data/model');
const { createQueryService, effectiveActiveEnd } = require('../data/ledger');

const DEFAULT_VERIFICATION_GRACE_MS = 90 * 1000;

function operationalContextId(timer) {
  return timer.active?.contextId || timer.pending?.contextId || timer.localPause?.contextId || null;
}

function freshPositiveObservation(timer, contextId, atMs, verificationGraceMs) {
  const observation = timer.lastObservation;
  if (!observation || observation.contextId !== contextId) return false;
  if (!isTimestamp(observation.observedAtMs) || observation.observedAtMs > atMs) return false;
  if (atMs - observation.observedAtMs > verificationGraceMs) return false;
  return ['CONTEXT_DETECTED', 'CONTEXT_CHANGED', 'CONTEXT_VERIFIED', 'CONTEXT_METADATA_UPDATED']
    .includes(observation.type);
}

function createTimerReadModel(getDocument, options = {}) {
  if (typeof getDocument !== 'function') throw new Error('timer-read-model-source-required');
  const now = options.now || (() => Date.now());
  const verificationGraceMs = options.verificationGraceMs ?? DEFAULT_VERIFICATION_GRACE_MS;
  if (!isNonNegativeInteger(verificationGraceMs)) {
    throw new Error('timer-read-model-verification-grace-invalid');
  }

  function snapshot(view = {}) {
    const source = getDocument();
    if (!source) throw new Error('data-document-unavailable');
    const document = deepClone(source);
    validateDocument(document);
    const atMs = view.atMs === undefined ? now() : view.atMs;
    if (!isTimestamp(atMs)) throw new Error('timer-read-model-at-invalid');
    const queries = createQueryService(() => document, { now: () => atMs });
    const state = timerKind(document.timer);
    const currentContextId = operationalContextId(document.timer);
    const requestedSelection = view.selectedContextId || currentContextId;
    const selectedContextId = requestedSelection && document.contexts[requestedSelection]
      ? requestedSelection
      : null;
    const active = document.timer.active;
    const held = Boolean(active?.safetyHold);
    const provisional = Boolean(active?.provisionalSinceMs) && !held;
    const effectiveEndAtMs = active ? effectiveActiveEnd(active, atMs) : null;
    const positiveCurrent = currentContextId
      ? freshPositiveObservation(document.timer, currentContextId, atMs, verificationGraceMs)
      : false;
    const pendingReady = state === TIMER_STATES.PENDING &&
      document.timer.pending.continuityState === 'VALID' &&
      positiveCurrent;
    const localResumeReady = state === TIMER_STATES.LOCAL_PAUSED && positiveCurrent;

    return deepFreeze({
      revision: document.revision,
      updatedAtMs: document.updatedAtMs,
      workdayZone: document.workdayZone,
      timerState: state,
      reason: document.timer.lastReason || null,
      currentContextId,
      currentContext: currentContextId ? deepClone(document.contexts[currentContextId]) : null,
      selectedContextId,
      selectedContext: selectedContextId ? deepClone(document.contexts[selectedContextId]) : null,
      todayTotalMs: queries.getTodayTotal(atMs),
      weekTotalMs: queries.getWeekTotal(atMs),
      currentContextTodayMs: currentContextId ? queries.getContextToday(currentContextId, atMs) : 0,
      currentContextTotalMs: currentContextId ? queries.getContextTotal(currentContextId, atMs) : 0,
      selectedContextTodayMs: selectedContextId ? queries.getContextToday(selectedContextId, atMs) : 0,
      selectedContextTotalMs: selectedContextId ? queries.getContextTotal(selectedContextId, atMs) : 0,
      running: active ? {
        sessionId: active.sessionId,
        cycleId: active.cycleId,
        startedAtMs: active.startedAtMs,
        effectiveEndAtMs,
        elapsedMs: Math.max(0, effectiveEndAtMs - active.startedAtMs),
        lastVerifiedAtMs: active.lastVerifiedAtMs,
        provisional,
        held,
        holdAtMs: active.safetyHold?.holdAtMs ?? null,
        holdReason: active.safetyHold?.reason ?? null
      } : null,
      availableActions: {
        localPause: state === TIMER_STATES.ACTIVE,
        resume: pendingReady,
        startFresh: pendingReady,
        localResume: localResumeReady
      },
      commandPreconditions: {
        expectedRevision: document.revision,
        expectedContextId: currentContextId,
        expectedSessionId: active?.sessionId || null
      }
    });
  }

  return { snapshot };
}

module.exports = {
  DEFAULT_VERIFICATION_GRACE_MS,
  operationalContextId,
  freshPositiveObservation,
  createTimerReadModel
};
