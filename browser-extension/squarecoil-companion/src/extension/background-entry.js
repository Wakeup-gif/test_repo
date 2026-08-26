'use strict';

const { PROBE_RESULTS, classifyRuntimeProbe } = require('../core/runtime-probe');
const { BUILD_ID } = require('../core/build-identity');

const BOOT_MESSAGE = 'SC_COMPANION_BOOT';
const HEALTH_MESSAGE = 'SC_COMPANION_GET_HEALTH';
const ENABLE_MESSAGE = 'SC_COMPANION_SET_ENABLED';
const REVALIDATE_MESSAGE = 'SC_COMPANION_REVALIDATE';
const PERSISTENCE_PROBE_KEY = '__scCompanionB1PersistenceProbe';
const EXPECTED_B1_DEGRADED_REASON = 'coordination-not-implemented-b1';

async function collectPageProbe(tabId) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () => {
      let runtimeSnapshot = null;
      try {
        runtimeSnapshot = window.__squareCoilCompanionRuntime?.getHealth?.() || null;
      } catch (_) {}
      const roots = [...document.querySelectorAll('#ussign-job-timer')].map(root => ({
        rebuildOwned: root.dataset.squarecoilCompanionRoot === 'rebuild',
        runtimeInstanceId: root.dataset.runtimeInstanceId || null,
        buildId: root.dataset.buildId || null
      }));
      return {
        runtimeSnapshot,
        rootCount: roots.length,
        roots,
        hasLegacyRuntime: Boolean(
          window.__squareCoilJobTimerUiVersion ||
          window.__squareCoilJobTimerInteractionVersion ||
          window.__usxTimerControls ||
          window.__usxTimerWorkspace ||
          window.__usxTimerSurface
        )
      };
    }
  });
  return result?.[0]?.result || { runtimeSnapshot: null, rootCount: 0, roots: [], hasLegacyRuntime: false };
}

async function invokeRuntime(tabId, method, ...args) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: async (methodName, methodArgs) => {
      const runtime = window.__squareCoilCompanionRuntime;
      const target = runtime && runtime[methodName];
      if (typeof target !== 'function') return null;
      return target(...methodArgs);
    },
    args: [method, args]
  });
  return result?.[0]?.result || null;
}

async function checkPersistence() {
  const token = `${Date.now()}:${Math.random()}`;
  try {
    await chrome.storage.local.set({ [PERSISTENCE_PROBE_KEY]: token });
    const read = await chrome.storage.local.get(PERSISTENCE_PROBE_KEY);
    await chrome.storage.local.remove(PERSISTENCE_PROBE_KEY);
    return read[PERSISTENCE_PROBE_KEY] === token;
  } catch (_) {
    try { await chrome.storage.local.remove(PERSISTENCE_PROBE_KEY); } catch (_) {}
    return false;
  }
}

async function removeSafeOrphan(tabId) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () => {
      if (window.__squareCoilCompanionRuntime) return { removed: false, reason: 'runtime-present' };
      const roots = [...document.querySelectorAll('#ussign-job-timer')];
      if (roots.length !== 1) return { removed: false, reason: 'root-count-not-one' };
      const root = roots[0];
      if (root.dataset.squarecoilCompanionRoot !== 'rebuild') {
        return { removed: false, reason: 'foreign-root' };
      }
      root.remove();
      return { removed: true };
    }
  });
  return result?.[0]?.result || { removed: false, reason: 'no-result' };
}

async function setBootstrap(tabId, payload) {
  await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: config => {
      window.__squareCoilCompanionBootstrap = Object.freeze({ ...config });
    },
    args: [payload]
  });
}

function responseForProbe(classification, probe, extra = {}) {
  return {
    ok: [
      PROBE_RESULTS.HEALTHY_SAME_BUILD,
      PROBE_RESULTS.BOOTING_SAME_BUILD,
      PROBE_RESULTS.DEGRADED_SAME_BUILD,
      PROBE_RESULTS.RECOVERING_SAME_BUILD
    ].includes(classification),
    ready: classification === PROBE_RESULTS.HEALTHY_SAME_BUILD,
    classification,
    health: probe.runtimeSnapshot || null,
    ...extra
  };
}

async function recoverExistingIfNeeded(tabId, probe, classification, source = 'existing-runtime') {
  if (classification !== PROBE_RESULTS.DEGRADED_SAME_BUILD) {
    return responseForProbe(classification, probe, { source });
  }
  if (probe.runtimeSnapshot?.reason === EXPECTED_B1_DEGRADED_REASON) {
    return responseForProbe(classification, probe, { source, expectedB1Degraded: true });
  }

  try { await invokeRuntime(tabId, 'recover'); } catch (_) {}
  const nextProbe = await collectPageProbe(tabId);
  const nextClassification = classifyRuntimeProbe(nextProbe, BUILD_ID);
  return responseForProbe(nextClassification, nextProbe, { source: `${source}-recovery` });
}

async function bootPage(tabId) {
  if (!Number.isInteger(tabId)) return { ok: false, reason: 'missing-tab-id' };
  let probe = await collectPageProbe(tabId);
  let classification = classifyRuntimeProbe(probe, BUILD_ID);

  if (classification === PROBE_RESULTS.HEALTHY_SAME_BUILD ||
      classification === PROBE_RESULTS.BOOTING_SAME_BUILD ||
      classification === PROBE_RESULTS.RECOVERING_SAME_BUILD) {
    return responseForProbe(classification, probe, { source: 'existing-runtime' });
  }

  if (classification === PROBE_RESULTS.DEGRADED_SAME_BUILD) {
    return recoverExistingIfNeeded(tabId, probe, classification);
  }

  if (classification === PROBE_RESULTS.FAILED_SAME_BUILD) {
    return { ok: false, classification, health: probe.runtimeSnapshot || null, reason: 'runtime-failed' };
  }
  if (classification === PROBE_RESULTS.LEGACY_RUNTIME) {
    return { ok: false, classification, reloadRequired: true, reason: 'legacy-runtime-reload-required' };
  }
  if (classification === PROBE_RESULTS.VERSION_MISMATCH) {
    return { ok: false, classification, reloadRequired: true, reason: 'version-mismatch-reload-required' };
  }
  if (classification === PROBE_RESULTS.OWNERSHIP_CONFLICT) {
    return { ok: false, classification, reloadRequired: true, reason: 'ownership-conflict' };
  }

  let source = 'fresh-boot';
  if (classification === PROBE_RESULTS.ORPHAN_ROOT_ONLY) {
    const removal = await removeSafeOrphan(tabId);
    probe = await collectPageProbe(tabId);
    classification = classifyRuntimeProbe(probe, BUILD_ID);

    if (!removal.removed) {
      if ([PROBE_RESULTS.HEALTHY_SAME_BUILD, PROBE_RESULTS.BOOTING_SAME_BUILD, PROBE_RESULTS.RECOVERING_SAME_BUILD].includes(classification)) {
        return responseForProbe(classification, probe, { source: 'orphan-race-existing-runtime' });
      }
      if (classification === PROBE_RESULTS.DEGRADED_SAME_BUILD) {
        return recoverExistingIfNeeded(tabId, probe, classification, 'orphan-race-existing-runtime');
      }
      if (classification !== PROBE_RESULTS.NONE) {
        return { ok: false, classification: PROBE_RESULTS.OWNERSHIP_CONFLICT, reloadRequired: true, reason: removal.reason || 'orphan-removal-failed' };
      }
      source = 'orphan-cleared-concurrently';
    } else {
      source = 'orphan-root-recovered';
      if (classification !== PROBE_RESULTS.NONE) {
        if ([PROBE_RESULTS.HEALTHY_SAME_BUILD, PROBE_RESULTS.BOOTING_SAME_BUILD, PROBE_RESULTS.RECOVERING_SAME_BUILD].includes(classification)) {
          return responseForProbe(classification, probe, { source: 'orphan-recovery-race-existing-runtime' });
        }
        if (classification === PROBE_RESULTS.DEGRADED_SAME_BUILD) {
          return recoverExistingIfNeeded(tabId, probe, classification, 'orphan-recovery-race-existing-runtime');
        }
        return { ok: false, classification, reloadRequired: true, reason: 'orphan-recovery-state-changed' };
      }
    }
  }

  const persistenceAvailable = await checkPersistence();
  const manifest = chrome.runtime.getManifest();
  await setBootstrap(tabId, {
    buildId: BUILD_ID,
    packageVersion: manifest.version,
    persistenceAvailable,
    coordinationDisposition: 'UNAVAILABLE_B1'
  });

  await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    files: ['dist/companion-app.js']
  });

  probe = await collectPageProbe(tabId);
  classification = classifyRuntimeProbe(probe, BUILD_ID);
  return responseForProbe(classification, probe, {
    source,
    expectedB1Degraded: classification === PROBE_RESULTS.DEGRADED_SAME_BUILD && probe.runtimeSnapshot?.reason === EXPECTED_B1_DEGRADED_REASON
  });
}

async function getHealth(tabId) {
  if (!Number.isInteger(tabId)) return { ok: false, reason: 'missing-tab-id' };
  const probe = await collectPageProbe(tabId);
  const classification = classifyRuntimeProbe(probe, BUILD_ID);
  return responseForProbe(classification, probe);
}

async function setPageEnabled(tabId, enabled) {
  const nextEnabled = Boolean(enabled);
  const current = await chrome.storage.local.get({ timerEnabled: true });
  if (current.timerEnabled !== nextEnabled) {
    await chrome.storage.local.set({ timerEnabled: nextEnabled });
  }
  if (!Number.isInteger(tabId)) return { ok: true, enabled: nextEnabled };

  if (nextEnabled) return bootPage(tabId);

  try {
    const result = await invokeRuntime(tabId, 'setEnabled', false);
    if (!result) return { ok: true, enabled: false, classification: PROBE_RESULTS.NONE, health: { state: 'UNINITIALIZED', reason: 'user-disabled' } };

    const probe = await collectPageProbe(tabId);
    const classification = classifyRuntimeProbe(probe, BUILD_ID);
    return {
      ok: result.state !== 'FAILED',
      enabled: false,
      classification,
      health: result,
      reason: result.reason || null,
      reloadRequired: result.state === 'FAILED'
    };
  } catch (error) {
    return { ok: false, enabled: false, reason: String(error?.message || error) };
  }
}

async function revalidatePage(tabId) {
  if (!Number.isInteger(tabId)) return { ok: false, reason: 'missing-tab-id' };
  let probe = await collectPageProbe(tabId);
  let classification = classifyRuntimeProbe(probe, BUILD_ID);
  if ([PROBE_RESULTS.NONE, PROBE_RESULTS.ORPHAN_ROOT_ONLY].includes(classification)) return bootPage(tabId);
  if (classification === PROBE_RESULTS.RECOVERING_SAME_BUILD || classification === PROBE_RESULTS.BOOTING_SAME_BUILD) {
    return responseForProbe(classification, probe, { source: 'existing-runtime' });
  }
  if (![PROBE_RESULTS.HEALTHY_SAME_BUILD, PROBE_RESULTS.DEGRADED_SAME_BUILD].includes(classification)) {
    return responseForProbe(classification, probe);
  }

  await invokeRuntime(tabId, 'revalidate');
  probe = await collectPageProbe(tabId);
  classification = classifyRuntimeProbe(probe, BUILD_ID);
  return responseForProbe(classification, probe, { source: 'revalidated-runtime' });
}

chrome.runtime.onInstalled.addListener(async () => {
  try {
    const current = await chrome.storage.local.get('timerEnabled');
    if (typeof current.timerEnabled !== 'boolean') await chrome.storage.local.set({ timerEnabled: true });
  } catch (_) {}
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = Number.isInteger(message?.tabId) ? message.tabId : sender.tab?.id;
  let task = null;

  if (message?.type === BOOT_MESSAGE) task = bootPage(tabId);
  if (message?.type === HEALTH_MESSAGE) task = getHealth(tabId);
  if (message?.type === ENABLE_MESSAGE) task = setPageEnabled(tabId, message.enabled !== false);
  if (message?.type === REVALIDATE_MESSAGE) task = revalidatePage(tabId);

  if (!task) return undefined;
  task.then(sendResponse).catch(error => sendResponse({ ok: false, reason: String(error?.message || error) }));
  return true;
});

module.exports = {
  BUILD_ID,
  bootPage,
  getHealth,
  setPageEnabled,
  revalidatePage,
  collectPageProbe,
  responseForProbe
};
