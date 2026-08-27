'use strict';

const { inspectLegacyPresence } = require('../data/legacy-preflight');
const { timerKind, deepClone, deepFreeze } = require('../data/model');
const { TIMER_COMMANDS } = require('../timer/commands');
const { createTimerReadModel } = require('../timer/read-model');
const { createSquareCoilBridgeService } = require('../squarecoil/bridge-service');

const RECOVERY_MODES = Object.freeze({
  CONTROLLED: 'CONTROLLED_RELOAD',
  INTERRUPTED: 'UNEXPECTED_INTERRUPTION'
});

const RECOVERY_ELIGIBLE_EVENTS = new Set([
  'CONTEXT_DETECTED',
  'CONTEXT_CHANGED',
  'CONTEXT_VERIFIED',
  'CONTEXT_METADATA_UPDATED',
  'CONTEXT_LEFT',
  'CLOCKED_OUT'
]);

const USER_TIMER_COMMANDS = new Set([
  TIMER_COMMANDS.RESUME,
  TIMER_COMMANDS.START_FRESH,
  TIMER_COMMANDS.LOCAL_PAUSE,
  TIMER_COMMANDS.LOCAL_RESUME
]);

function defaultId(prefix) {
  try {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  } catch (_) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function createTrustedTransitionCore(options = {}) {
  const authorityClient = options.authorityClient;
  const legacyStorage = options.legacyStorage;
  const now = options.now || (() => Date.now());
  const randomId = options.randomId || defaultId;
  const onStatusChange = typeof options.onStatusChange === 'function' ? options.onStatusChange : () => {};
  const createBridge = options.createBridge || (bridgeOptions => createSquareCoilBridgeService(bridgeOptions));
  if (!authorityClient || typeof authorityClient.ensure !== 'function' ||
      typeof authorityClient.read !== 'function' || typeof authorityClient.command !== 'function' ||
      typeof authorityClient.subscribe !== 'function') {
    throw new Error('trusted-transition-authority-client-required');
  }

  let initialized = false;
  let disposed = false;
  let blocked = false;
  let preflight = null;
  let authorityDocument = null;
  let authorityOwner = false;
  let bridge = null;
  let unsubscribe = null;
  let recoveryMode = null;
  let commandQueue = Promise.resolve();
  let prepareDisablePromise = null;
  let lastStatus = 'not-initialized';
  let lastError = null;

  function adopt(value) {
    const documentValue = value?.document || null;
    if (documentValue && typeof documentValue === 'object') {
      authorityDocument = deepFreeze(deepClone(documentValue));
      return true;
    }
    return false;
  }

  function determineRecoveryMode(force = false) {
    if (!authorityDocument?.timer?.active) {
      recoveryMode = null;
      return;
    }
    if (recoveryMode && !force) return;
    const checkpoint = authorityDocument.checkpoint;
    const controlled = checkpoint?.terminationDisposition === 'CONTROLLED_RELOAD' &&
      checkpoint?.sessionId === authorityDocument.timer.active.sessionId &&
      checkpoint?.contextId === authorityDocument.timer.active.contextId;
    recoveryMode = controlled ? RECOVERY_MODES.CONTROLLED : RECOVERY_MODES.INTERRUPTED;
  }

  function viewDocument() {
    if (!authorityDocument) return null;
    const value = deepClone(authorityDocument);
    if (recoveryMode && value.timer?.active) {
      value.timer.active.safetyHold = {
        holdAtMs: value.timer.active.lastVerifiedAtMs,
        reason: 'recovery-verification-pending'
      };
      value.timer.active.provisionalSinceMs = value.timer.active.lastVerifiedAtMs;
    }
    return value;
  }

  function timerView() {
    if (!authorityDocument) return null;
    return createTimerReadModel(viewDocument, { now }).snapshot({ atMs: now() });
  }

  function snapshot() {
    let readModel = null;
    let readModelError = null;
    try { readModel = timerView(); }
    catch (error) { readModelError = String(error?.message || error); }
    return deepFreeze({
      initialized,
      disposed,
      blocked,
      status: lastStatus,
      lastError,
      authorityOwner,
      revision: authorityDocument?.revision ?? null,
      ledgerSegmentCount: Array.isArray(authorityDocument?.ledger) ? authorityDocument.ledger.length : null,
      recoveryMode,
      preflight: preflight ? {
        checked: preflight.checked,
        blocked: preflight.blocked,
        reason: preflight.reason,
        presentKeys: [...preflight.presentKeys]
      } : null,
      bridge: bridge ? bridge.snapshot() : null,
      timer: readModel,
      readModelError
    });
  }

  function publishStatus(status, error = null) {
    lastStatus = status;
    lastError = error ? String(error?.message || error) : null;
    try { onStatusChange(snapshot()); } catch (_) {}
  }

  function serialize(task) {
    const run = commandQueue.then(task, task);
    commandQueue = run.then(() => undefined, () => undefined);
    return run;
  }

  async function refreshDocument() {
    const read = await authorityClient.read();
    if (!adopt(read)) throw new Error('trusted-transition-document-unavailable');
    return authorityDocument;
  }

  function commandEnvelope(type, values = {}) {
    if (!authorityDocument || !Number.isSafeInteger(authorityDocument.revision)) {
      throw new Error('trusted-transition-revision-unavailable');
    }
    return {
      type,
      commandId: randomId('trusted-command'),
      expectedRevision: authorityDocument.revision,
      ...values
    };
  }

  async function commit(type, values = {}) {
    const envelope = commandEnvelope(type, values);
    try {
      const result = await authorityClient.command(envelope);
      await refreshDocument();
      return result;
    } catch (error) {
      try { await refreshDocument(); } catch (_) {}
      throw error;
    }
  }

  function shouldForwardNonPositive(event) {
    if (!['STATE_UNKNOWN', 'STATE_CONFLICT'].includes(event.type)) return true;
    return Boolean(authorityDocument?.timer?.active || authorityDocument?.timer?.pending);
  }

  async function acceptBridgeEvents(events) {
    return serialize(async () => {
      if (disposed || blocked || !authorityOwner) return { accepted: false, reason: 'trusted-core-not-owner' };
      for (const event of events) {
        if (recoveryMode) {
          if (!RECOVERY_ELIGIBLE_EVENTS.has(event.type)) {
            publishStatus('recovery-verification-pending');
            continue;
          }
          const recoveryType = recoveryMode === RECOVERY_MODES.CONTROLLED
            ? TIMER_COMMANDS.RECONCILE_OWNERSHIP
            : TIMER_COMMANDS.RECOVER_INTERRUPTION;
          await commit(recoveryType, { observation: event });
          recoveryMode = null;
          publishStatus('recovery-reconciled');
          continue;
        }
        if (!shouldForwardNonPositive(event)) continue;
        await commit(TIMER_COMMANDS.ACCEPT_OBSERVATION, { observation: event });
        publishStatus('bridge-event-committed');
      }
      return { accepted: true, revision: authorityDocument?.revision ?? null };
    });
  }

  function bridgeOptions() {
    const bridgeEnvironment = options.bridgeEnvironment || {};
    return {
      ...bridgeEnvironment,
      sourceRuntimeId: authorityClient.snapshot().runtimeInstanceId,
      onEvents: acceptBridgeEvents,
      onHealthChange: value => {
        if (value.lastError) publishStatus('bridge-degraded', value.lastError);
      }
    };
  }

  async function ensure(connection = null) {
    if (disposed) throw new Error('trusted-transition-core-disposed');
    if (initialized) return snapshot();
    unsubscribe = authorityClient.subscribe(event => {
      if (adopt(event)) publishStatus('authority-document-updated');
    });
    const connected = connection || await authorityClient.ensure();
    adopt(connected?.initialRead);
    await refreshDocument();
    const authority = authorityClient.snapshot();
    authorityOwner = authority.healthy === true && authority.disposition === 'OWNER';
    preflight = inspectLegacyPresence(legacyStorage);
    blocked = preflight.blocked;
    initialized = true;
    if (blocked) {
      publishStatus(preflight.reason);
      return snapshot();
    }
    determineRecoveryMode();
    bridge = createBridge(bridgeOptions());
    await bridge.ensure({ owner: authorityOwner });
    publishStatus(authorityOwner ? 'trusted-core-owner-active' : 'trusted-core-observer-active');
    return snapshot();
  }

  async function handleAuthoritySnapshot(authority) {
    if (!initialized || disposed || blocked || !bridge) return snapshot();
    const nextOwner = authority?.healthy === true && authority.disposition === 'OWNER';
    const acquired = !authorityOwner && nextOwner;
    authorityOwner = nextOwner;
    if (acquired) {
      await refreshDocument();
      determineRecoveryMode(true);
    }
    await bridge.setOwner(authorityOwner);
    publishStatus(authorityOwner ? 'trusted-core-owner-active' : 'trusted-core-observer-active');
    return snapshot();
  }

  async function verifyNow(trigger = 'manual') {
    if (!bridge || blocked || disposed) return snapshot();
    await bridge.verifyNow(trigger);
    return snapshot();
  }

  async function userCommand(type) {
    if (!USER_TIMER_COMMANDS.has(type)) throw new Error('trusted-transition-user-command-unsupported');
    return serialize(async () => {
      const view = timerView();
      if (!view) throw new Error('trusted-transition-timer-view-unavailable');
      const values = {
        contextId: view.currentContextId,
        originatedAtMs: now()
      };
      if (type === TIMER_COMMANDS.LOCAL_PAUSE) values.expectedSessionId = view.running?.sessionId || null;
      const result = await commit(type, values);
      publishStatus('user-command-committed');
      return result;
    });
  }

  async function prepareDisable() {
    if (prepareDisablePromise) return prepareDisablePromise;
    const task = serialize(async () => {
      if (disposed) return { disabled: true, alreadyDisposed: true };
      if (blocked) return { disabled: false, blocked: true, reason: preflight.reason };
      if (!authorityDocument) await refreshDocument();
      const state = timerKind(authorityDocument.timer);
      if (state !== 'IDLE') {
        await commit(TIMER_COMMANDS.COMPANION_DISABLE, {
          contextId: authorityDocument.timer.active?.contextId ||
            authorityDocument.timer.pending?.contextId ||
            authorityDocument.timer.localPause?.contextId || null,
          expectedSessionId: authorityDocument.timer.active?.sessionId || null,
          originatedAtMs: now()
        });
      }
      if (bridge) await bridge.teardown();
      publishStatus('companion-disable-finalized');
      return { disabled: true, revision: authorityDocument?.revision ?? null };
    });
    prepareDisablePromise = task;
    try { return await task; }
    finally { if (prepareDisablePromise === task) prepareDisablePromise = null; }
  }

  async function prepareControlledTeardown() {
    return serialize(async () => {
      if (disposed || blocked) return { checkpointed: false };
      if (bridge) await bridge.teardown();
      if (authorityOwner && authorityDocument?.timer?.active) {
        await commit(TIMER_COMMANDS.CONTROLLED_TEARDOWN, {
          contextId: authorityDocument.timer.active.contextId,
          expectedSessionId: authorityDocument.timer.active.sessionId
        });
        publishStatus('controlled-teardown-checkpointed');
        return { checkpointed: true };
      }
      return { checkpointed: false };
    });
  }

  async function teardown() {
    if (disposed) return snapshot();
    disposed = true;
    if (bridge) await bridge.teardown();
    if (unsubscribe) unsubscribe();
    unsubscribe = null;
    publishStatus('trusted-core-torn-down');
    return snapshot();
  }

  return Object.freeze({
    ensure,
    handleAuthoritySnapshot,
    verifyNow,
    userCommand,
    prepareDisable,
    prepareControlledTeardown,
    teardown,
    snapshot,
    acceptBridgeEvents
  });
}

module.exports = {
  RECOVERY_MODES,
  RECOVERY_ELIGIBLE_EVENTS,
  createTrustedTransitionCore
};
