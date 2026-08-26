'use strict';

const { createLifecycleController, MODES } = require('../core/lifecycle');
const { createFeatureRegistry } = require('../core/feature-registry');
const { createRuntimeUi } = require('../platform/runtime-ui');
const { createBridgeShell } = require('../squarecoil/bridge-shell');

const BUILD_ID = 'rebuild-b1-shell-lifecycle';
const GLOBAL_KEY = '__squareCoilCompanionRuntime';
const BOOTSTRAP_KEY = '__squareCoilCompanionBootstrap';

function randomId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return `sc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

(function startCompanionRuntime() {
  const existing = window[GLOBAL_KEY];
  if (existing) {
    if (existing.buildId === BUILD_ID) return;
    document.documentElement.dataset.squarecoilCompanionReloadRequired = 'version-mismatch';
    return;
  }

  const bootstrap = window[BOOTSTRAP_KEY] || {};
  try { delete window[BOOTSTRAP_KEY]; } catch (_) { window[BOOTSTRAP_KEY] = undefined; }

  const runtimeInstanceId = randomId();
  const packageVersion = String(bootstrap.packageVersion || '0.0.0');
  const ui = createRuntimeUi({ document, runtimeInstanceId, buildId: BUILD_ID });
  const bridge = createBridgeShell();
  const registry = createFeatureRegistry();

  let pageShowBound = false;
  let runtime = null;

  function onPageShow(event) {
    if (!event || event.persisted !== true || !runtime) return;
    runtime.revalidate().catch(() => {});
  }

  registry.register('page-lifecycle-events', {
    initialize: async () => {
      if (!pageShowBound) {
        window.addEventListener('pageshow', onPageShow);
        pageShowBound = true;
      }
    },
    teardown: async () => {
      if (pageShowBound) window.removeEventListener('pageshow', onPageShow);
      pageShowBound = false;
    }
  });

  const persistence = {
    ensure: async () => ({ available: bootstrap.persistenceAvailable === true }),
    teardown: async () => {}
  };

  const coordination = {
    ensure: async () => ({ disposition: bootstrap.coordinationDisposition || 'UNAVAILABLE_B1' }),
    teardown: async () => {}
  };

  const lifecycle = createLifecycleController({
    runtimeInstanceId,
    buildId: BUILD_ID,
    packageVersion,
    adapters: {
      persistence,
      ui,
      features: registry,
      bridge,
      coordination
    },
    onTransition: snapshot => ui.setLifecycle(snapshot)
  });

  async function boot() {
    const result = await lifecycle.boot();
    ui.setLifecycle(result);
    return getHealth();
  }

  async function revalidate() {
    const result = await lifecycle.revalidate();
    ui.setLifecycle(result);
    return getHealth();
  }

  async function recover() {
    const result = await lifecycle.recover();
    ui.setLifecycle(result);
    return getHealth();
  }

  async function teardown(reason = 'teardown-complete') {
    const result = await lifecycle.teardown(reason);
    if (window[GLOBAL_KEY] === runtime) {
      try { delete window[GLOBAL_KEY]; } catch (_) { window[GLOBAL_KEY] = null; }
    }
    return result;
  }

  async function setEnabled(enabled) {
    if (!enabled) return lifecycle.setMode(MODES.DISABLED);
    const result = await lifecycle.setMode(MODES.ENABLED);
    ui.setLifecycle(result);
    return getHealth();
  }

  function getHealth() {
    return {
      ...lifecycle.snapshot(),
      buildStage: 'B1',
      ui: ui.snapshot(),
      bridge: bridge.snapshot()
    };
  }

  runtime = Object.freeze({
    buildId: BUILD_ID,
    runtimeInstanceId,
    packageVersion,
    boot,
    revalidate,
    recover,
    teardown,
    setEnabled,
    getHealth
  });

  window[GLOBAL_KEY] = runtime;
  boot().catch(error => {
    document.documentElement.dataset.squarecoilCompanionBootError = String(error && (error.message || error) || 'boot-error');
  });
})();
