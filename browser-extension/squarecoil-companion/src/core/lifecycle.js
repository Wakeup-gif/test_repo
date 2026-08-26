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
  let teardownComplete = false;
  let recoveryAttempt = 0;

  function transition(nextState, nextReason, error = null) {
    state = nextState;
    reason = String(nextReason || '').trim() || nextState.toLowerCase();
    lastError = error ? errorMessage(error) : null;
    if (typeof options.onTransition === 'function') {
      options.onTransition(snapshot());
    }
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
    const persistence = await callAdapter('persistence', 'ensure', { available: false });
    const ui = await callAdapter('ui', 'ensure', { rootCount: 0, owned: false, interactionReady: false });
    const features = await callAdapter('features', 'ensure', { initialized: false, teardownRegistered: false });
    const bridge = await callAdapter('bridge', 'ensure', { initialized: false, teardownRegistered: false });
    const observation = await callAdapter('bridge', 'observeInitial', { attempted: false, kind: 'STATE_UNKNOWN' });
    const coordination = await callAdapter('coordination', 'ensure', { disposition: 'UNAVAILABLE' });

    const assertions = {
      oneLifecycleOwner: true,
      validRuntimeIdentity: Boolean(runtimeInstanceId && buildId),
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
  }

  async function boot() {
    if (mode === MODES.DISABLED) {
      transition(STATES.UNINITIALIZED, 'user-disabled');
      return snapshot();
    }
    if (teardownPromise) await teardownPromise;
    if (bootPromise) return bootPromise;
    if (state === STATES.READY) return snapshot();
    if (state === STATES.RECOVERING && recoveryPromise) return recoveryPromise;

    teardownComplete = false;
    bootPromise = (async () => {
      transition(STATES.BOOTING, 'boot-in-progress');
      try {
        const result = await evaluateReadiness();
        if (result.ok) transition(STATES.READY, 'ready');
        else transition(STATES.DEGRADED, result.reason);
      } catch (error) {
        transition(STATES.DEGRADED, 'boot-capability-failed', error);
      } finally {
        bootPromise = null;
      }
      return snapshot();
    })();

    return bootPromise;
  }

  async function revalidate() {
    if (mode === MODES.DISABLED) return snapshot();
    try {
      const result = await evaluateReadiness();
      if (result.ok) transition(STATES.READY, 'ready');
      else transition(STATES.DEGRADED, result.reason);
    } catch (error) {
      transition(STATES.DEGRADED, 'revalidation-failed', error);
    }
    return snapshot();
  }

  async function recover() {
    if (mode === MODES.DISABLED) return snapshot();
    if (recoveryPromise) return recoveryPromise;
    if (state === STATES.FAILED && /reload-required|ownership-conflict|version-mismatch|legacy-runtime/.test(reason)) {
      return snapshot();
    }

    recoveryPromise = (async () => {
      transition(STATES.RECOVERING, 'recovery-in-progress');
      for (let index = 0; index < recoveryDelays.length; index += 1) {
        recoveryAttempt = index + 1;
        if (recoveryDelays[index] > 0) await sleep(recoveryDelays[index]);
        try {
          const result = await evaluateReadiness();
          if (result.ok) {
            transition(STATES.READY, 'ready');
            recoveryPromise = null;
            return snapshot();
          }
          reason = result.reason;
        } catch (error) {
          lastError = errorMessage(error);
        }
      }
      transition(STATES.FAILED, 'recovery-exhausted', lastError);
      recoveryPromise = null;
      return snapshot();
    })();

    return recoveryPromise;
  }

  async function teardown(nextReason = 'teardown-complete') {
    if (teardownPromise) return teardownPromise;
    if (teardownComplete && state === STATES.UNINITIALIZED) return snapshot();

    teardownPromise = (async () => {
      const errors = [];
      const order = ['bridge', 'features', 'coordination', 'ui', 'persistence'];
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
      teardownPromise = null;
      return snapshot();
    })();

    return teardownPromise;
  }

  async function setMode(nextMode) {
    mode = nextMode === MODES.DISABLED ? MODES.DISABLED : MODES.ENABLED;
    if (mode === MODES.DISABLED) return teardown('user-disabled');
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
  createLifecycleController
};
