'use strict';

const STATES = Object.freeze({
  UNINITIALIZED: 'UNINITIALIZED',
  BOOTING: 'BOOTING',
  READY: 'READY',
  DEGRADED: 'DEGRADED',
  RECOVERING: 'RECOVERING',
  FAILED: 'FAILED'
});

const MODES = Object.freeze({ ENABLED: 'ENABLED', DISABLED: 'DISABLED' });
const POSITIVE_COORDINATION = new Set(['OWNER', 'OBSERVER_CONNECTED']);
const DEFAULT_RECOVERY_DELAYS = Object.freeze([250, 1000, 3000]);

function errorMessage(error) {
  return String(error && (error.message || error) || 'unknown-error');
}

function isReloadRequiredReason(value) {
  return /reload-required|ownership-conflict|version-mismatch|legacy-runtime|teardown-incomplete/.test(String(value || ''));
}

function classifyCapabilityError(error, fallbackReason) {
  const message = errorMessage(error);
  const normalized = message.toLowerCase();
  if (normalized.includes('ownership-conflict') || normalized.includes('duplicate-runtime')) {
    return { state: STATES.FAILED, reason: 'ownership-conflict', error };
  }
  if (normalized.includes('version-mismatch')) {
    return { state: STATES.FAILED, reason: 'version-mismatch-reload-required', error };
  }
  if (normalized.includes('legacy-runtime')) {
    return { state: STATES.FAILED, reason: 'legacy-runtime-reload-required', error };
  }
  return { state: STATES.DEGRADED, reason: fallbackReason, error };
}

function isConcreteIdentity(value, unknownValue) {
  const normalized = String(value || '').trim();
  return Boolean(normalized && normalized !== unknownValue);
}

function createLifecycleController(options = {}) {
  const runtimeInstanceId = String(options.runtimeInstanceId || 'runtime-unknown');
  const buildId = String(options.buildId || 'build-unknown');
  const packageVersion = String(options.packageVersion || '0.0.0');
  const adapters = options.adapters || {};
  const sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
  const recoveryDelays = Array.isArray(options.recoveryDelays) && options.recoveryDelays.length
    ? options.recoveryDelays.slice(0, 3)
    : DEFAULT_RECOVERY_DELAYS.slice();

  let mode = MODES.ENABLED;
  let state = STATES.UNINITIALIZED;
  let reason = 'not-started';
  let readiness = null;
  let lastError = null;
  let bootPromise = null;
  let recoveryPromise = null;
  let teardownPromise = null;
  let readinessPromise = null;
  let teardownComplete = false;
  let teardownRequested = false;
  let recoveryAttempt = 0;
  let operationEpoch = 0;

  function transition(nextState, nextReason, error = null) {
    state = nextState;
    reason = String(nextReason || '').trim() || nextState.toLowerCase();
    lastError = error ? errorMessage(error) : null;
    if (typeof options.onTransition === 'function') options.onTransition(snapshot());
  }

  function snapshot() {
    return {
      buildId,
      packageVersion,
      runtimeInstanceId,
      mode,
      state,
      reason,
      lastError,
      recoveryAttempt,
      teardownInProgress: Boolean(teardownPromise || teardownRequested),
      readiness: readiness ? { ...readiness } : null
    };
  }

  async function callAdapter(name, method, fallback) {
    const adapter = adapters[name];
    if (!adapter || typeof adapter[method] !== 'function') return fallback;
    return adapter[method]();
  }

  function firstReadinessFailure(assertions) {
    const order = [
      ['oneLifecycleOwner', 'lifecycle-owner-unconfirmed'],
      ['validRuntimeIdentity', 'runtime-identity-invalid'],
      ['persistenceAvailable', 'persistence-unavailable'],
      ['oneOwnedRoot', 'timer-root-unavailable'],
      ['interactionReady', 'interaction-init-failed'],
      ['bridgeInitialized', 'bridge-init-failed'],
      ['initialObservationAttempted', 'bridge-initial-observation-missing'],
      ['featureRegistryInitialized', 'feature-registry-init-failed'],
      ['teardownRegistered', 'teardown-unregistered'],
      ['coordinationPositive', 'coordination-not-implemented-b1']
    ];
    for (const [key, code] of order) {
      if (!assertions[key]) return code;
    }
    return 'readiness-failed';
  }

  async function evaluateReadiness() {
    if (readinessPromise) return readinessPromise;

    const task = (async () => {
      const ownership = await callAdapter('ownership', 'ensure', { oneOwner: false });
      const persistence = await callAdapter('persistence', 'ensure', { available: false });
      const ui = await callAdapter('ui', 'ensure', { rootCount: 0, owned: false, interactionReady: false });
      const features = await callAdapter('features', 'ensure', { initialized: false, teardownRegistered: false });
      const bridge = await callAdapter('bridge', 'ensure', { initialized: false, teardownRegistered: false });
      const observation = await callAdapter('bridge', 'observeInitial', { attempted: false, kind: 'STATE_UNKNOWN' });
      const coordination = await callAdapter('coordination', 'ensure', { disposition: 'UNAVAILABLE' });

      const assertions = {
        oneLifecycleOwner: ownership && ownership.oneOwner === true,
        validRuntimeIdentity: isConcreteIdentity(runtimeInstanceId, 'runtime-unknown') && isConcreteIdentity(buildId, 'build-unknown'),
        oneOwnedRoot: Number(ui && ui.rootCount) === 1 && ui && ui.owned === true,
        interactionReady: ui && ui.interactionReady === true,
        persistenceAvailable: persistence && persistence.available === true,
        bridgeInitialized: bridge && bridge.initialized === true,
        initialObservationAttempted: observation && observation.attempted === true,
        featureRegistryInitialized: features && features.initialized === true,
        teardownRegistered: Boolean(
          ui && ui.teardownRegistered === true &&
          bridge && bridge.teardownRegistered === true &&
          features && features.teardownRegistered === true
        ),
        coordinationPositive: POSITIVE_COORDINATION.has(coordination && coordination.disposition)
      };

      readiness = {
        ...assertions,
        coordinationDisposition: coordination && coordination.disposition || 'UNAVAILABLE',
        bridgeObservation: observation && observation.kind || 'STATE_UNKNOWN'
      };

      return {
        ok: Object.values(assertions).every(Boolean),
        reason: firstReadinessFailure(assertions),
        readiness: { ...readiness }
      };
    })();

    readinessPromise = task;
    try {
      return await task;
    } finally {
      if (readinessPromise === task) readinessPromise = null;
    }
  }

  function operationStillCurrent(epoch) {
    return epoch === operationEpoch && !teardownRequested && mode === MODES.ENABLED;
  }

  async function boot() {
    if (mode === MODES.DISABLED) {
      transition(STATES.UNINITIALIZED, 'user-disabled');
      return snapshot();
    }
    if (teardownPromise) await teardownPromise;
    if (mode === MODES.DISABLED) return snapshot();
    if (state === STATES.FAILED) return snapshot();
    if (bootPromise) return bootPromise;
    if (state === STATES.READY) return snapshot();
    if (state === STATES.RECOVERING && recoveryPromise) return recoveryPromise;

    teardownComplete = false;
    teardownRequested = false;
    recoveryAttempt = 0;
    const epoch = ++operationEpoch;

    const task = (async () => {
      transition(STATES.BOOTING, 'boot-in-progress');
      try {
        const result = await evaluateReadiness();
        if (!operationStillCurrent(epoch)) return snapshot();
        if (result.ok) transition(STATES.READY, 'ready');
        else transition(STATES.DEGRADED, result.reason);
      } catch (error) {
        if (!operationStillCurrent(epoch)) return snapshot();
        const failure = classifyCapabilityError(error, 'boot-capability-failed');
        transition(failure.state, failure.reason, failure.error);
      }
      return snapshot();
    })();

    bootPromise = task;
    try {
      return await task;
    } finally {
      if (bootPromise === task) bootPromise = null;
    }
  }

  async function revalidate() {
    if (teardownPromise) await teardownPromise;
    if (mode === MODES.DISABLED || teardownRequested) return snapshot();
    if (state === STATES.FAILED) return snapshot();
    if (bootPromise) return bootPromise;
    if (recoveryPromise) return recoveryPromise;

    const epoch = operationEpoch;
    try {
      const result = await evaluateReadiness();
      if (!operationStillCurrent(epoch)) return snapshot();
      if (result.ok) transition(STATES.READY, 'ready');
      else transition(STATES.DEGRADED, result.reason);
    } catch (error) {
      if (!operationStillCurrent(epoch)) return snapshot();
      const failure = classifyCapabilityError(error, 'revalidation-failed');
      transition(failure.state, failure.reason, failure.error);
    }
    return snapshot();
  }

  async function recover() {
    if (teardownPromise) await teardownPromise;
    if (mode === MODES.DISABLED || teardownRequested) return snapshot();
    if (recoveryPromise) return recoveryPromise;
    if (bootPromise) await bootPromise;
    if (mode === MODES.DISABLED || teardownRequested) return snapshot();
    if (state === STATES.FAILED && isReloadRequiredReason(reason)) return snapshot();

    teardownRequested = false;
    recoveryAttempt = 0;
    const epoch = ++operationEpoch;

    const task = (async () => {
      transition(STATES.RECOVERING, 'recovery-in-progress');
      for (let index = 0; index < recoveryDelays.length; index += 1) {
        recoveryAttempt = index + 1;
        if (recoveryDelays[index] > 0) await sleep(recoveryDelays[index]);
        if (!operationStillCurrent(epoch)) return snapshot();

        try {
          const result = await evaluateReadiness();
          if (!operationStillCurrent(epoch)) return snapshot();
          if (result.ok) {
            transition(STATES.READY, 'ready');
            return snapshot();
          }
          reason = result.reason;
          lastError = null;
        } catch (error) {
          if (!operationStillCurrent(epoch)) return snapshot();
          const failure = classifyCapabilityError(error, 'recovery-capability-failed');
          if (failure.state === STATES.FAILED) {
            transition(failure.state, failure.reason, failure.error);
            return snapshot();
          }
          reason = failure.reason;
          lastError = errorMessage(error);
        }
      }

      if (operationStillCurrent(epoch)) transition(STATES.FAILED, 'recovery-exhausted', lastError);
      return snapshot();
    })();

    recoveryPromise = task;
    try {
      return await task;
    } finally {
      if (recoveryPromise === task) recoveryPromise = null;
    }
  }

  async function teardown(nextReason = 'teardown-complete') {
    if (teardownPromise) return teardownPromise;
    if (teardownComplete && state === STATES.UNINITIALIZED) return snapshot();

    teardownRequested = true;
    operationEpoch += 1;

    const task = (async () => {
      const pending = [bootPromise, recoveryPromise, readinessPromise].filter(Boolean);
      if (pending.length) await Promise.allSettled(pending);

      const errors = [];
      const order = ['bridge', 'features', 'coordination', 'ui', 'persistence', 'ownership'];
      for (const name of order) {
        try {
          await callAdapter(name, 'teardown', null);
        } catch (error) {
          errors.push(`${name}:${errorMessage(error)}`);
        }
      }

      readiness = null;
      recoveryAttempt = 0;
      if (errors.length) {
        teardownComplete = false;
        transition(STATES.FAILED, 'teardown-incomplete', new Error(errors.join('; ')));
      } else {
        teardownComplete = true;
        transition(STATES.UNINITIALIZED, nextReason);
      }
      teardownRequested = false;
      return snapshot();
    })();

    teardownPromise = task;
    try {
      return await task;
    } finally {
      if (teardownPromise === task) teardownPromise = null;
    }
  }

  async function setMode(nextMode) {
    mode = nextMode === MODES.DISABLED ? MODES.DISABLED : MODES.ENABLED;
    if (mode === MODES.DISABLED) return teardown('user-disabled');
    if (state === STATES.FAILED && isReloadRequiredReason(reason)) return snapshot();
    if (state === STATES.UNINITIALIZED) return boot();
    return snapshot();
  }

  return {
    STATES,
    MODES,
    snapshot,
    boot,
    revalidate,
    recover,
    teardown,
    setMode
  };
}

module.exports = {
  STATES,
  MODES,
  DEFAULT_RECOVERY_DELAYS,
  isReloadRequiredReason,
  createLifecycleController
};
