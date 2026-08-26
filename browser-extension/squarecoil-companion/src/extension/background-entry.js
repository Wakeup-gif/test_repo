'use strict';

const { PROBE_RESULTS, classifyRuntimeProbe } = require('../core/runtime-probe');
const { BUILD_ID, CANDIDATE_FINGERPRINT } = require('../core/build-identity');
const {
  isSupportedSquareCoilUrl,
  isConcreteDocumentToken
} = require('../core/document-eligibility');

const BOOT_MESSAGE = 'SC_COMPANION_BOOT';
const HEALTH_MESSAGE = 'SC_COMPANION_GET_HEALTH';
const ENABLE_MESSAGE = 'SC_COMPANION_SET_ENABLED';
const REVALIDATE_MESSAGE = 'SC_COMPANION_REVALIDATE';
const RETRY_TEARDOWN_MESSAGE = 'SC_COMPANION_RETRY_TEARDOWN';
const PERSISTENCE_PROBE_KEY = '__scCompanionB1PersistenceProbe';
const EXPECTED_B1_DEGRADED_REASON = 'coordination-not-implemented-b1';
const PACKAGE_VERSION = String(chrome.runtime.getManifest().version || '0.0.0');
const tabOperationQueues = new Map();

function classifyPageProbe(probe) {
  return classifyRuntimeProbe(probe, BUILD_ID, PACKAGE_VERSION, CANDIDATE_FINGERPRINT);
}

function randomId(prefix) {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function normalizeRequest(value, context = {}) {
  if (value && typeof value === 'object') {
    return {
      tabId: Number.isInteger(value.tabId) ? value.tabId : null,
      expectedDocumentId: value.expectedDocumentId || null,
      documentToken: value.documentToken || null,
      source: value.source || 'direct'
    };
  }
  return {
    tabId: Number.isInteger(value) ? value : null,
    expectedDocumentId: context.expectedDocumentId || null,
    documentToken: context.documentToken || null,
    source: context.source || 'direct'
  };
}

function serializeTabOperation(request, task) {
  const key = Number.isInteger(request.tabId) ? request.tabId : 'no-tab';
  const prior = tabOperationQueues.get(key) || Promise.resolve();
  const run = prior.then(task, task);
  const tail = run.then(() => undefined, () => undefined);
  tabOperationQueues.set(key, tail);
  tail.then(() => {
    if (tabOperationQueues.get(key) === tail) tabOperationQueues.delete(key);
  });
  return run;
}

function injectionTarget(request) {
  const target = { tabId: request.tabId };
  if (request.expectedDocumentId) target.documentIds = [request.expectedDocumentId];
  else target.frameIds = [0];
  return target;
}

async function executeMain(request, details) {
  const result = await chrome.scripting.executeScript({
    target: injectionTarget(request),
    world: 'MAIN',
    ...details
  });
  return result?.[0] || null;
}

async function collectPageProbe(requestValue) {
  const request = normalizeRequest(requestValue);
  const first = await executeMain(request, {
    func: () => {
      function safeRead(key) {
        let present = false;
        try { present = Object.prototype.hasOwnProperty.call(window, key); } catch (_) { return { present: true, readable: false, value: null }; }
        if (!present) return { present: false, readable: true, value: null };
        try { return { present: true, readable: true, value: window[key] }; } catch (_) { return { present: true, readable: false, value: null }; }
      }
      function safeValue(object, key) {
        try { return object && object[key] != null ? object[key] : null; } catch (_) { return null; }
      }

      let topLevel = false;
      let eligible = false;
      try {
        topLevel = window.top === window;
        eligible = topLevel && window.location.origin === 'https://ussignandmill.squarecoil.net';
      } catch (_) {}

      const runtimeProperty = safeRead('__squareCoilCompanionRuntime');
      const runtime = runtimeProperty.readable ? runtimeProperty.value : null;
      let runtimeSnapshot = null;
      let runtimeHealthReadable = false;
      try {
        if (runtime && typeof runtime.getHealth === 'function') {
          runtimeSnapshot = runtime.getHealth();
          runtimeHealthReadable = Boolean(runtimeSnapshot && typeof runtimeSnapshot === 'object');
        }
      } catch (_) {}
      const runtimeMethodSurfaceValid = Boolean(runtime &&
        ['boot', 'revalidate', 'recover', 'teardown', 'retryTeardown', 'setEnabled', 'getHealth']
          .every(name => typeof safeValue(runtime, name) === 'function'));

      const claimProperty = safeRead('__squareCoilCompanionInjectionClaim');
      const claimValue = claimProperty.readable ? claimProperty.value : null;
      const claim = claimValue && typeof claimValue === 'object' ? {
        claimId: safeValue(claimValue, 'claimId'),
        buildId: safeValue(claimValue, 'buildId'),
        packageVersion: safeValue(claimValue, 'packageVersion'),
        candidateFingerprint: safeValue(claimValue, 'candidateFingerprint'),
        runtimeInstanceId: safeValue(claimValue, 'runtimeInstanceId'),
        documentToken: safeValue(claimValue, 'documentToken')
      } : null;

      const rootElements = [...document.querySelectorAll('#ussign-job-timer')];
      for (const marked of document.querySelectorAll('[data-squarecoil-companion-root="rebuild"]')) {
        if (!rootElements.includes(marked)) rootElements.push(marked);
      }
      const roots = rootElements.map(root => ({
        canonicalId: root.id === 'ussign-job-timer',
        rebuildOwned: root.dataset.squarecoilCompanionRoot === 'rebuild',
        runtimeInstanceId: root.dataset.runtimeInstanceId || null,
        buildId: root.dataset.buildId || null,
        packageVersion: root.dataset.packageVersion || null,
        candidateFingerprint: root.dataset.candidateFingerprint || null,
        documentToken: root.dataset.documentToken || null
      }));
      const legacyKeys = [
        '__squareCoilJobTimerUiVersion',
        '__squareCoilJobTimerInteractionVersion',
        '__usxTimerControls',
        '__usxTimerWorkspace',
        '__usxTimerSurface'
      ];
      const hasLegacyRuntime = legacyKeys.some(key => {
        const property = safeRead(key);
        return property.present && (!property.readable || Boolean(property.value));
      });

      return {
        eligible,
        topLevel,
        url: String(window.location.href || ''),
        documentToken: document.documentElement?.dataset?.squarecoilCompanionDocumentToken || null,
        runtimeGlobalPresent: runtimeProperty.present,
        runtimeGlobalReadable: runtimeProperty.readable,
        runtimeHealthReadable,
        runtimeMethodSurfaceValid,
        runtimeBuildId: safeValue(runtime, 'buildId'),
        runtimePackageVersion: safeValue(runtime, 'packageVersion'),
        runtimeCandidateFingerprint: safeValue(runtime, 'candidateFingerprint'),
        runtimeInstanceId: safeValue(runtime, 'runtimeInstanceId'),
        runtimeDocumentToken: safeValue(runtime, 'documentToken'),
        runtimeSnapshot,
        claimPresent: claimProperty.present,
        claimReadable: claimProperty.readable,
        claim,
        rootCount: roots.length,
        roots,
        hasLegacyRuntime
      };
    }
  });
  return {
    ...(first?.result || {
      probeUnavailable: true,
      eligible: false,
      topLevel: true,
      documentToken: null,
      runtimeGlobalPresent: false,
      runtimeGlobalReadable: true,
      runtimeHealthReadable: false,
      runtimeMethodSurfaceValid: false,
      runtimeBuildId: null,
      runtimePackageVersion: null,
      runtimeCandidateFingerprint: null,
      runtimeInstanceId: null,
      runtimeDocumentToken: null,
      runtimeSnapshot: null,
      claimPresent: false,
      claimReadable: true,
      claim: null,
      rootCount: 0,
      roots: [],
      hasLegacyRuntime: false
    }),
    browserDocumentId: first?.documentId || null,
    frameId: Number.isInteger(first?.frameId) ? first.frameId : 0
  };
}

function guardProbe(request, probe) {
  if (probe.probeUnavailable === true) {
    return {
      ok: false,
      reason: request.expectedDocumentId ? 'document-changed' : 'page-inspection-unavailable',
      classification: PROBE_RESULTS.OWNERSHIP_CONFLICT
    };
  }
  if (probe.eligible !== true || probe.topLevel !== true || probe.frameId !== 0) {
    return { ok: false, reason: 'unsupported-document', classification: PROBE_RESULTS.NONE };
  }
  if (request.expectedDocumentId && probe.browserDocumentId && request.expectedDocumentId !== probe.browserDocumentId) {
    return { ok: false, reason: 'document-changed', classification: PROBE_RESULTS.OWNERSHIP_CONFLICT };
  }
  if (request.documentToken && request.documentToken !== probe.documentToken) {
    return { ok: false, reason: 'document-changed', classification: PROBE_RESULTS.OWNERSHIP_CONFLICT };
  }
  if (!isConcreteDocumentToken(probe.documentToken)) {
    return { ok: false, reason: 'document-identity-missing', classification: PROBE_RESULTS.OWNERSHIP_CONFLICT };
  }
  return null;
}

async function invokeRuntime(request, method, runtimeInstanceId, ...args) {
  const first = await executeMain(request, {
    func: async (
      methodName,
      methodArgs,
      expectedBuildId,
      expectedPackageVersion,
      expectedCandidateFingerprint,
      expectedRuntimeInstanceId,
      expectedDocumentToken
    ) => {
      try {
        if (window.top !== window || window.location.origin !== 'https://ussignandmill.squarecoil.net') return { invoked: false };
        if (document.documentElement?.dataset?.squarecoilCompanionDocumentToken !== expectedDocumentToken) return { invoked: false };
        const runtime = window.__squareCoilCompanionRuntime;
        if (
          !runtime ||
          runtime.buildId !== expectedBuildId ||
          runtime.packageVersion !== expectedPackageVersion ||
          runtime.candidateFingerprint !== expectedCandidateFingerprint ||
          runtime.runtimeInstanceId !== expectedRuntimeInstanceId ||
          runtime.documentToken !== expectedDocumentToken
        ) {
          return { invoked: false };
        }
        const target = runtime[methodName];
        if (typeof target !== 'function') return { invoked: false };
        return { invoked: true, value: await target(...methodArgs) };
      } catch (error) {
        return { invoked: false, error: String(error?.message || error) };
      }
    },
    args: [
      method,
      args,
      BUILD_ID,
      PACKAGE_VERSION,
      CANDIDATE_FINGERPRINT,
      runtimeInstanceId,
      request.documentToken
    ]
  });
  return first?.result?.invoked ? first.result.value : null;
}

async function checkPersistence() {
  const token = `${Date.now()}:${Math.random()}`;
  const probeKey = `${PERSISTENCE_PROBE_KEY}:${token}`;
  try {
    await chrome.storage.local.set({ [probeKey]: token });
    const read = await chrome.storage.local.get(probeKey);
    await chrome.storage.local.remove(probeKey);
    return read[probeKey] === token;
  } catch (_) {
    try { await chrome.storage.local.remove(probeKey); } catch (_) {}
    return false;
  }
}

async function removeSafeOrphan(request, proof) {
  const first = await executeMain(request, {
    func: expected => {
      function safeRead(key) {
        try {
          if (!Object.prototype.hasOwnProperty.call(window, key)) return { present: false, readable: true, value: null };
          return { present: true, readable: true, value: window[key] };
        } catch (_) {
          return { present: true, readable: false, value: null };
        }
      }
      try {
        if (window.top !== window || window.location.origin !== 'https://ussignandmill.squarecoil.net') {
          return { removed: false, reason: 'unsupported-document' };
        }
        if (document.documentElement?.dataset?.squarecoilCompanionDocumentToken !== expected.documentToken) {
          return { removed: false, reason: 'document-changed' };
        }
        if (safeRead('__squareCoilCompanionRuntime').present) return { removed: false, reason: 'runtime-present' };
        if (safeRead('__squareCoilCompanionInjectionClaim').present) return { removed: false, reason: 'claim-present' };
        const legacy = ['__squareCoilJobTimerUiVersion', '__squareCoilJobTimerInteractionVersion', '__usxTimerControls', '__usxTimerWorkspace', '__usxTimerSurface']
          .some(key => {
            const property = safeRead(key);
            return property.present && (!property.readable || Boolean(property.value));
          });
        if (legacy) return { removed: false, reason: 'legacy-runtime-present' };
        const roots = [...document.querySelectorAll('#ussign-job-timer')];
        for (const marked of document.querySelectorAll('[data-squarecoil-companion-root="rebuild"]')) {
          if (!roots.includes(marked)) roots.push(marked);
        }
        if (roots.length !== 1) return { removed: false, reason: 'root-count-not-one' };
        const root = roots[0];
        if (
          root.dataset.squarecoilCompanionRoot !== 'rebuild' ||
          root.dataset.buildId !== expected.buildId ||
          root.dataset.packageVersion !== expected.packageVersion ||
          root.dataset.candidateFingerprint !== expected.candidateFingerprint ||
          root.dataset.runtimeInstanceId !== expected.runtimeInstanceId ||
          root.dataset.documentToken !== expected.documentToken
        ) {
          return { removed: false, reason: 'orphan-proof-changed' };
        }
        root.remove();
        return { removed: true };
      } catch (error) {
        return { removed: false, reason: String(error?.message || error) };
      }
    },
    args: [proof]
  });
  return first?.result || { removed: false, reason: 'no-result' };
}

async function claimInjection(request) {
  const candidate = {
    claimId: randomId('claim'),
    buildId: BUILD_ID,
    packageVersion: PACKAGE_VERSION,
    candidateFingerprint: CANDIDATE_FINGERPRINT,
    runtimeInstanceId: randomId('runtime'),
    documentToken: request.documentToken
  };
  const first = await executeMain(request, {
    func: claim => {
      function safeRead(key) {
        try {
          if (!Object.prototype.hasOwnProperty.call(window, key)) return { present: false, readable: true, value: null };
          return { present: true, readable: true, value: window[key] };
        } catch (_) {
          return { present: true, readable: false, value: null };
        }
      }
      try {
        if (window.top !== window || window.location.origin !== 'https://ussignandmill.squarecoil.net') return { status: 'CONFLICT', reason: 'unsupported-document' };
        if (document.documentElement?.dataset?.squarecoilCompanionDocumentToken !== claim.documentToken) return { status: 'CONFLICT', reason: 'document-changed' };
        if (safeRead('__squareCoilCompanionRuntime').present) return { status: 'RUNTIME_PRESENT' };
        const existingClaim = safeRead('__squareCoilCompanionInjectionClaim');
        if (existingClaim.present) {
          const existing = existingClaim.readable ? existingClaim.value : null;
          if (
            existing &&
            existing.buildId === claim.buildId &&
            existing.packageVersion === claim.packageVersion &&
            existing.candidateFingerprint === claim.candidateFingerprint &&
            existing.documentToken === claim.documentToken &&
            existing.claimId &&
            existing.runtimeInstanceId
          ) return { status: 'JOINED', claim: existing };
          return { status: 'CONFLICT', reason: 'claim-ownership-conflict' };
        }
        const legacy = ['__squareCoilJobTimerUiVersion', '__squareCoilJobTimerInteractionVersion', '__usxTimerControls', '__usxTimerWorkspace', '__usxTimerSurface']
          .some(key => {
            const property = safeRead(key);
            return property.present && (!property.readable || Boolean(property.value));
          });
        if (legacy) return { status: 'CONFLICT', reason: 'legacy-runtime-present' };
        const roots = [...document.querySelectorAll('#ussign-job-timer')];
        for (const marked of document.querySelectorAll('[data-squarecoil-companion-root="rebuild"]')) {
          if (!roots.includes(marked)) roots.push(marked);
        }
        if (roots.length !== 0) return { status: 'CONFLICT', reason: 'root-present' };
        Object.defineProperty(window, '__squareCoilCompanionInjectionClaim', {
          configurable: true,
          enumerable: false,
          writable: false,
          value: Object.freeze({ ...claim })
        });
        return { status: 'CLAIMED', claim };
      } catch (error) {
        return { status: 'CONFLICT', reason: String(error?.message || error) };
      }
    },
    args: [candidate]
  });
  return first?.result || { status: 'CONFLICT', reason: 'claim-no-result' };
}

async function setBootstrap(request, payload) {
  const first = await executeMain(request, {
    func: config => {
      try {
        if (window.top !== window || window.location.origin !== 'https://ussignandmill.squarecoil.net') return { ok: false, reason: 'unsupported-document' };
        if (document.documentElement?.dataset?.squarecoilCompanionDocumentToken !== config.documentToken) return { ok: false, reason: 'document-changed' };
        const claim = window.__squareCoilCompanionInjectionClaim;
        if (
          !claim ||
          claim.claimId !== config.claimId ||
          claim.runtimeInstanceId !== config.runtimeInstanceId ||
          claim.buildId !== config.buildId ||
          claim.packageVersion !== config.packageVersion ||
          claim.candidateFingerprint !== config.candidateFingerprint
        ) {
          return { ok: false, reason: 'claim-changed' };
        }
        if (Object.prototype.hasOwnProperty.call(window, '__squareCoilCompanionBootstrap')) return { ok: false, reason: 'bootstrap-present' };
        Object.defineProperty(window, '__squareCoilCompanionBootstrap', {
          configurable: true,
          enumerable: false,
          writable: false,
          value: Object.freeze({ ...config })
        });
        return { ok: true };
      } catch (error) {
        return { ok: false, reason: String(error?.message || error) };
      }
    },
    args: [payload]
  });
  return first?.result || { ok: false, reason: 'bootstrap-no-result' };
}

async function cancelInjection(request, claim, bootstrap = null) {
  const first = await executeMain(request, {
    func: (expectedClaim, expectedBootstrap) => {
      function safeRead(key) {
        try {
          if (!Object.prototype.hasOwnProperty.call(window, key)) return { present: false, readable: true, value: null };
          return { present: true, readable: true, value: window[key] };
        } catch (_) {
          return { present: true, readable: false, value: null };
        }
      }
      function exactIdentity(value, expected, keys) {
        return Boolean(value && expected && keys.every(key => value[key] === expected[key]));
      }
      function release(key, expected, keys, label) {
        const property = safeRead(key);
        if (!property.readable) return { ok: false, reason: `${label}-unreadable` };
        if (!property.present) return { ok: true };
        if (!exactIdentity(property.value, expected, keys)) return { ok: false, reason: `${label}-changed` };
        let deleted = false;
        try { deleted = delete window[key]; } catch (error) { return { ok: false, reason: `${label}-delete-failed:${String(error?.message || error)}` }; }
        if (!deleted || safeRead(key).present) return { ok: false, reason: `${label}-delete-failed` };
        return { ok: true };
      }
      try {
        if (window.top !== window || window.location.origin !== 'https://ussignandmill.squarecoil.net') return { released: false, reason: 'unsupported-document' };
        if (document.documentElement?.dataset?.squarecoilCompanionDocumentToken !== expectedClaim.documentToken) return { released: false, reason: 'document-changed' };
        if (safeRead('__squareCoilCompanionRuntime').present) return { released: false, reason: 'runtime-present' };
        if (expectedBootstrap) {
          const bootstrapRelease = release(
            '__squareCoilCompanionBootstrap',
            expectedBootstrap,
            ['claimId', 'runtimeInstanceId', 'documentToken', 'buildId', 'packageVersion', 'candidateFingerprint', 'persistenceAvailable', 'coordinationDisposition', 'enabled'],
            'bootstrap'
          );
          if (!bootstrapRelease.ok) return { released: false, reason: bootstrapRelease.reason };
        }
        const claimRelease = release(
          '__squareCoilCompanionInjectionClaim',
          expectedClaim,
          ['claimId', 'runtimeInstanceId', 'documentToken', 'buildId', 'packageVersion', 'candidateFingerprint'],
          'claim'
        );
        return claimRelease.ok ? { released: true } : { released: false, reason: claimRelease.reason };
      } catch (error) {
        return { released: false, reason: String(error?.message || error) };
      }
    },
    args: [claim, bootstrap]
  });
  return first?.result || { released: false, reason: 'cancellation-no-result' };
}

function responseForProbe(classification, probe, extra = {}) {
  const health = probe.runtimeSnapshot || null;
  const reloadRequired = Boolean(
    extra.reloadRequired ||
    [
      PROBE_RESULTS.VERSION_MISMATCH,
      PROBE_RESULTS.LEGACY_RUNTIME,
      PROBE_RESULTS.OWNERSHIP_CONFLICT,
      PROBE_RESULTS.FAILED_SAME_BUILD
    ].includes(classification) ||
    health?.reason === 'teardown-incomplete'
  );
  return {
    ok: [
      PROBE_RESULTS.HEALTHY_SAME_BUILD,
      PROBE_RESULTS.BOOTING_SAME_BUILD,
      PROBE_RESULTS.DEGRADED_SAME_BUILD,
      PROBE_RESULTS.RECOVERING_SAME_BUILD
    ].includes(classification),
    ready: classification === PROBE_RESULTS.HEALTHY_SAME_BUILD,
    classification,
    health,
    reloadRequired,
    ...extra
  };
}

function shellHealthyExceptCoordination(health) {
  const readiness = health?.readiness;
  const required = [
    'oneLifecycleOwner',
    'validRuntimeIdentity',
    'oneOwnedRoot',
    'interactionReady',
    'persistenceAvailable',
    'bridgeInitialized',
    'initialObservationAttempted',
    'featureRegistryInitialized',
    'teardownRegistered'
  ];
  return Boolean(
    health?.mode === 'ENABLED' &&
    health?.teardownInProgress !== true &&
    readiness &&
    required.every(key => readiness[key] === true) &&
    health.ui?.rootPresent === true &&
    health.ui?.interactionReady === true
  );
}

async function recoverExistingIfNeeded(request, probe, classification, source = 'existing-runtime') {
  if (classification !== PROBE_RESULTS.DEGRADED_SAME_BUILD) {
    return responseForProbe(classification, probe, { source });
  }
  if (probe.runtimeSnapshot?.reason === EXPECTED_B1_DEGRADED_REASON && shellHealthyExceptCoordination(probe.runtimeSnapshot)) {
    return responseForProbe(classification, probe, { source, expectedB1Degraded: true });
  }

  const runtimeId = probe.runtimeSnapshot?.runtimeInstanceId || probe.runtimeInstanceId;
  try { await invokeRuntime(request, 'revalidate', runtimeId); } catch (_) {}
  let nextProbe = await collectPageProbe(request);
  let nextClassification = classifyPageProbe(nextProbe);
  if (
    nextClassification === PROBE_RESULTS.DEGRADED_SAME_BUILD &&
    nextProbe.runtimeSnapshot?.reason !== EXPECTED_B1_DEGRADED_REASON
  ) {
    try { await invokeRuntime(request, 'recover', nextProbe.runtimeSnapshot?.runtimeInstanceId || nextProbe.runtimeInstanceId); } catch (_) {}
    nextProbe = await collectPageProbe(request);
    nextClassification = classifyPageProbe(nextProbe);
  }
  return responseForProbe(nextClassification, nextProbe, {
    source: `${source}-recovery`,
    expectedB1Degraded: nextClassification === PROBE_RESULTS.DEGRADED_SAME_BUILD &&
      nextProbe.runtimeSnapshot?.reason === EXPECTED_B1_DEGRADED_REASON &&
      shellHealthyExceptCoordination(nextProbe.runtimeSnapshot)
  });
}

async function observeDisabledPageUnsafe(request) {
  let probe;
  try { probe = await collectPageProbe(request); } catch (_) {
    return { ok: false, enabled: false, classification: PROBE_RESULTS.OWNERSHIP_CONFLICT, reason: 'page-inspection-failed', reloadRequired: true, health: null };
  }
  const guard = guardProbe(request, probe);
  if (guard) {
    if (guard.reason === 'unsupported-document') {
      return { ...guard, enabled: false, health: { state: 'UNINITIALIZED', mode: 'DISABLED', reason: 'unsupported-document' } };
    }
    return { ...guard, enabled: false, reloadRequired: true, health: probe.runtimeSnapshot || null };
  }
  const classification = classifyPageProbe(probe);
  if (classification === PROBE_RESULTS.NONE) {
    return { ok: true, enabled: false, classification, health: { state: 'UNINITIALIZED', mode: 'DISABLED', reason: 'user-disabled' }, ready: false, reloadRequired: false };
  }
  const reason = classification === PROBE_RESULTS.VERSION_MISMATCH
    ? 'version-mismatch-reload-required'
    : classification === PROBE_RESULTS.LEGACY_RUNTIME
      ? 'legacy-runtime-reload-required'
      : classification === PROBE_RESULTS.OWNERSHIP_CONFLICT
        ? 'ownership-conflict'
        : classification === PROBE_RESULTS.FAILED_SAME_BUILD
          ? 'runtime-failed'
          : undefined;
  return responseForProbe(classification, probe, { enabled: false, source: 'disabled-observation', reason });
}

async function bootPageUnsafe(request) {
  if (!Number.isInteger(request.tabId)) return { ok: false, reason: 'missing-tab-id' };

  const settings = await chrome.storage.local.get({ timerEnabled: true });
  if (settings.timerEnabled === false) return observeDisabledPageUnsafe(request);

  let probe = await collectPageProbe(request);
  const guard = guardProbe(request, probe);
  if (guard) return { ...guard, reloadRequired: guard.reason !== 'unsupported-document', health: probe.runtimeSnapshot || null };
  request = { ...request, documentToken: probe.documentToken, expectedDocumentId: request.expectedDocumentId || probe.browserDocumentId };
  let classification = classifyPageProbe(probe);

  if (classification === PROBE_RESULTS.FAILED_SAME_BUILD) {
    return responseForProbe(classification, probe, { reason: 'runtime-failed' });
  }
  if (classification === PROBE_RESULTS.BOOTING_SAME_BUILD && probe.claimPresent && !probe.runtimeSnapshot) {
    return responseForProbe(classification, probe, {
      ok: false,
      reason: 'injection-claim-incomplete',
      reloadRequired: true,
      source: 'page-owned-injection-claim'
    });
  }

  if (
    [
      PROBE_RESULTS.HEALTHY_SAME_BUILD,
      PROBE_RESULTS.BOOTING_SAME_BUILD,
      PROBE_RESULTS.RECOVERING_SAME_BUILD,
      PROBE_RESULTS.DEGRADED_SAME_BUILD
    ].includes(classification) &&
    (probe.runtimeSnapshot.teardownInProgress === true || probe.runtimeSnapshot.mode === 'DISABLED')
  ) {
    await invokeRuntime(request, 'setEnabled', probe.runtimeSnapshot.runtimeInstanceId, true);
    probe = await collectPageProbe(request);
    classification = classifyPageProbe(probe);
  }

  if ([PROBE_RESULTS.HEALTHY_SAME_BUILD, PROBE_RESULTS.BOOTING_SAME_BUILD, PROBE_RESULTS.RECOVERING_SAME_BUILD].includes(classification)) {
    return responseForProbe(classification, probe, { source: 'existing-runtime' });
  }
  if (classification === PROBE_RESULTS.DEGRADED_SAME_BUILD) {
    return recoverExistingIfNeeded(request, probe, classification);
  }
  if (classification === PROBE_RESULTS.FAILED_SAME_BUILD) {
    return responseForProbe(classification, probe, { reason: 'runtime-failed' });
  }
  if (classification === PROBE_RESULTS.LEGACY_RUNTIME) {
    return responseForProbe(classification, probe, { reason: 'legacy-runtime-reload-required', reloadRequired: true });
  }
  if (classification === PROBE_RESULTS.VERSION_MISMATCH) {
    return responseForProbe(classification, probe, { reason: 'version-mismatch-reload-required', reloadRequired: true });
  }
  if (classification === PROBE_RESULTS.OWNERSHIP_CONFLICT) {
    return responseForProbe(classification, probe, { reason: 'ownership-conflict', reloadRequired: true });
  }

  let source = 'fresh-boot';
  if (classification === PROBE_RESULTS.ORPHAN_ROOT_ONLY) {
    const orphan = probe.roots[0];
    const removal = await removeSafeOrphan(request, {
      buildId: BUILD_ID,
      packageVersion: PACKAGE_VERSION,
      candidateFingerprint: CANDIDATE_FINGERPRINT,
      runtimeInstanceId: orphan.runtimeInstanceId,
      documentToken: probe.documentToken
    });
    probe = await collectPageProbe(request);
    classification = classifyPageProbe(probe);
    if (!removal.removed || classification !== PROBE_RESULTS.NONE) {
      if ([PROBE_RESULTS.HEALTHY_SAME_BUILD, PROBE_RESULTS.BOOTING_SAME_BUILD, PROBE_RESULTS.RECOVERING_SAME_BUILD].includes(classification)) {
        return responseForProbe(classification, probe, { source: 'orphan-race-existing-runtime' });
      }
      if (classification === PROBE_RESULTS.DEGRADED_SAME_BUILD) {
        return recoverExistingIfNeeded(request, probe, classification, 'orphan-race-existing-runtime');
      }
      return responseForProbe(PROBE_RESULTS.OWNERSHIP_CONFLICT, probe, { reason: removal.reason || 'orphan-removal-failed', reloadRequired: true });
    }
    source = 'orphan-root-recovered';
  }

  const finalSettings = await chrome.storage.local.get({ timerEnabled: true });
  if (finalSettings.timerEnabled === false) return observeDisabledPageUnsafe(request);

  const claimResult = await claimInjection(request);
  if (claimResult.status === 'JOINED') {
    const joinedProbe = await collectPageProbe(request);
    return responseForProbe(classifyPageProbe(joinedProbe), joinedProbe, { source: 'injection-claim-existing' });
  }
  if (claimResult.status === 'RUNTIME_PRESENT') {
    const existingProbe = await collectPageProbe(request);
    const existingClassification = classifyPageProbe(existingProbe);
    return existingClassification === PROBE_RESULTS.DEGRADED_SAME_BUILD
      ? recoverExistingIfNeeded(request, existingProbe, existingClassification, 'claim-race-existing-runtime')
      : responseForProbe(existingClassification, existingProbe, { source: 'claim-race-existing-runtime' });
  }
  if (claimResult.status !== 'CLAIMED') {
    return { ok: false, classification: PROBE_RESULTS.OWNERSHIP_CONFLICT, reason: claimResult.reason || 'injection-claim-failed', reloadRequired: true };
  }

  async function cancelDisabledBoot(bootstrap = null, extra = {}) {
    const cancellation = await cancelInjection(request, claimResult.claim, bootstrap);
    if (!cancellation.released) {
      return {
        ok: false,
        enabled: false,
        classification: PROBE_RESULTS.OWNERSHIP_CONFLICT,
        reason: cancellation.reason || 'injection-cancellation-failed',
        reloadRequired: true,
        ...extra
      };
    }
    return {
      ok: true,
      enabled: false,
      ready: false,
      classification: PROBE_RESULTS.NONE,
      reloadRequired: false,
      health: { state: 'UNINITIALIZED', mode: 'DISABLED', reason: 'user-disabled' },
      source: 'boot-cancelled-disabled',
      ...extra
    };
  }

  const persistenceAvailable = await checkPersistence();
  const settingsAfterClaim = await chrome.storage.local.get({ timerEnabled: true });
  if (settingsAfterClaim.timerEnabled === false) return cancelDisabledBoot();
  const bootstrap = {
    claimId: claimResult.claim.claimId,
    runtimeInstanceId: claimResult.claim.runtimeInstanceId,
    documentToken: request.documentToken,
    buildId: BUILD_ID,
    packageVersion: PACKAGE_VERSION,
    candidateFingerprint: CANDIDATE_FINGERPRINT,
    persistenceAvailable,
    coordinationDisposition: 'UNAVAILABLE_B1',
    enabled: true
  };
  const bootstrapResult = await setBootstrap(request, bootstrap);
  if (!bootstrapResult.ok) {
    return { ok: false, classification: PROBE_RESULTS.OWNERSHIP_CONFLICT, reason: bootstrapResult.reason || 'bootstrap-failed', reloadRequired: true };
  }

  const settingsBeforeInjection = await chrome.storage.local.get({ timerEnabled: true });
  if (settingsBeforeInjection.timerEnabled === false) return cancelDisabledBoot(bootstrap);

  await executeMain(request, { files: ['dist/companion-app.js'] });
  probe = await collectPageProbe(request);
  classification = classifyPageProbe(probe);
  const settingsAfterInjection = await chrome.storage.local.get({ timerEnabled: true });
  if (settingsAfterInjection.timerEnabled === false) {
    const runtimeId = probe.runtimeSnapshot?.runtimeInstanceId || probe.runtimeInstanceId;
    if (runtimeId) {
      const disabled = await invokeRuntime(request, 'setEnabled', runtimeId, false);
      const disabledProbe = await collectPageProbe(request);
      const disabledClassification = classifyPageProbe(disabledProbe);
      return {
        ...responseForProbe(disabledClassification, disabledProbe, {
          enabled: false,
          source: 'post-injection-disabled-reconcile',
          injectionPerformed: true
        }),
        health: disabled || disabledProbe.runtimeSnapshot || null,
        ok: disabled?.state === 'UNINITIALIZED',
        reloadRequired: !disabled || disabled.state === 'FAILED'
      };
    }
    return cancelDisabledBoot(bootstrap, { injectionPerformed: true });
  }
  if (!probe.runtimeSnapshot) {
    const cancellation = probe.claimPresent
      ? await cancelInjection(request, claimResult.claim, bootstrap)
      : { released: false, reason: 'runtime-and-claim-missing' };
    if (cancellation.released) probe = await collectPageProbe(request);
    return responseForProbe(PROBE_RESULTS.OWNERSHIP_CONFLICT, probe, {
      ok: false,
      source: 'fresh-boot-publication-failed',
      reason: 'injection-did-not-publish-runtime',
      reloadRequired: true,
      injectionPerformed: true,
      injectionClaimReleased: cancellation.released === true,
      cancellationReason: cancellation.released ? null : cancellation.reason
    });
  }
  return responseForProbe(classification, probe, {
    source,
    injectionPerformed: true,
    expectedB1Degraded: classification === PROBE_RESULTS.DEGRADED_SAME_BUILD &&
      probe.runtimeSnapshot?.reason === EXPECTED_B1_DEGRADED_REASON &&
      shellHealthyExceptCoordination(probe.runtimeSnapshot)
  });
}

async function getHealthUnsafe(request) {
  if (!Number.isInteger(request.tabId)) return { ok: false, reason: 'missing-tab-id' };
  const settings = await chrome.storage.local.get({ timerEnabled: true });
  if (settings.timerEnabled === false) return observeDisabledPageUnsafe(request);
  const probe = await collectPageProbe(request);
  const guard = guardProbe(request, probe);
  if (guard) return { ...guard, health: probe.runtimeSnapshot || null, reloadRequired: guard.reason !== 'unsupported-document' };
  return responseForProbe(classifyPageProbe(probe), probe);
}

async function setPageEnabledUnsafe(request, enabled) {
  const nextEnabled = Boolean(enabled);
  const settings = await chrome.storage.local.get({ timerEnabled: true });
  const authoritativeEnabled = settings.timerEnabled !== false;
  if (!Number.isInteger(request.tabId)) return { ok: true, enabled: authoritativeEnabled };
  if (authoritativeEnabled !== nextEnabled) {
    const reconciled = authoritativeEnabled
      ? await bootPageUnsafe(request)
      : await observeDisabledPageUnsafe(request);
    return {
      ...reconciled,
      enabled: authoritativeEnabled,
      requestedEnabled: nextEnabled,
      staleRequestIgnored: true
    };
  }
  if (nextEnabled) return bootPageUnsafe(request);

  let probe;
  try { probe = await collectPageProbe(request); } catch (_) {
    return { ok: false, enabled: false, classification: PROBE_RESULTS.OWNERSHIP_CONFLICT, reason: 'page-inspection-failed', reloadRequired: true, health: null };
  }
  const guard = guardProbe(request, probe);
  if (guard) return { ...guard, enabled: false, health: probe.runtimeSnapshot || null, reloadRequired: guard.reason !== 'unsupported-document' };
  request = { ...request, documentToken: probe.documentToken, expectedDocumentId: request.expectedDocumentId || probe.browserDocumentId };
  let classification = classifyPageProbe(probe);

  async function reconcileNewerEnable() {
    const latest = await chrome.storage.local.get({ timerEnabled: true });
    if (latest.timerEnabled === false) return null;
    const reconciled = await bootPageUnsafe(request);
    return {
      ...reconciled,
      enabled: true,
      requestedEnabled: false,
      staleRequestIgnored: true
    };
  }

  if ([PROBE_RESULTS.VERSION_MISMATCH, PROBE_RESULTS.LEGACY_RUNTIME, PROBE_RESULTS.OWNERSHIP_CONFLICT].includes(classification)) {
    return responseForProbe(classification, probe, {
      enabled: false,
      reason: classification === PROBE_RESULTS.VERSION_MISMATCH
        ? 'version-mismatch-reload-required'
        : classification === PROBE_RESULTS.LEGACY_RUNTIME
          ? 'legacy-runtime-reload-required'
          : 'ownership-conflict',
      reloadRequired: true
    });
  }
  if (
    classification === PROBE_RESULTS.FAILED_SAME_BUILD &&
    probe.runtimeSnapshot?.reason === 'teardown-incomplete'
  ) {
    return responseForProbe(classification, probe, {
      enabled: false,
      reason: 'teardown-incomplete'
    });
  }
  const enableBeforeMutation = await reconcileNewerEnable();
  if (enableBeforeMutation) return enableBeforeMutation;
  if (classification === PROBE_RESULTS.ORPHAN_ROOT_ONLY) {
    const orphan = probe.roots[0];
    await removeSafeOrphan(request, {
      buildId: BUILD_ID,
      packageVersion: PACKAGE_VERSION,
      candidateFingerprint: CANDIDATE_FINGERPRINT,
      runtimeInstanceId: orphan.runtimeInstanceId,
      documentToken: probe.documentToken
    });
    probe = await collectPageProbe(request);
    classification = classifyPageProbe(probe);
    if (classification !== PROBE_RESULTS.NONE) {
      if ([PROBE_RESULTS.VERSION_MISMATCH, PROBE_RESULTS.LEGACY_RUNTIME, PROBE_RESULTS.OWNERSHIP_CONFLICT].includes(classification)) {
        return responseForProbe(classification, probe, {
          enabled: false,
          reason: classification === PROBE_RESULTS.VERSION_MISMATCH
            ? 'version-mismatch-reload-required'
            : classification === PROBE_RESULTS.LEGACY_RUNTIME
              ? 'legacy-runtime-reload-required'
              : 'ownership-conflict',
          reloadRequired: true
        });
      }
      return responseForProbe(PROBE_RESULTS.OWNERSHIP_CONFLICT, probe, { enabled: false, reason: 'orphan-removal-failed', reloadRequired: true });
    }
  }
  const enableBeforeTeardown = await reconcileNewerEnable();
  if (enableBeforeTeardown) return enableBeforeTeardown;
  if (classification === PROBE_RESULTS.NONE) {
    return { ok: true, enabled: false, classification, ready: false, reloadRequired: false, health: { state: 'UNINITIALIZED', mode: 'DISABLED', reason: 'user-disabled' } };
  }

  const runtimeId = probe.runtimeSnapshot?.runtimeInstanceId || probe.runtimeInstanceId;
  const result = await invokeRuntime(request, 'setEnabled', runtimeId, false);
  if (!result) return { ok: false, enabled: false, classification, reason: 'runtime-disable-unavailable', reloadRequired: true };
  probe = await collectPageProbe(request);
  classification = classifyPageProbe(probe);
  const settingsAfterTeardown = await chrome.storage.local.get({ timerEnabled: true });
  if (settingsAfterTeardown.timerEnabled !== false && result.state === 'UNINITIALIZED') {
    const restarted = await bootPageUnsafe(request);
    return {
      ...restarted,
      enabled: true,
      requestedEnabled: false,
      staleRequestIgnored: true,
      source: 'post-teardown-enabled-reconcile'
    };
  }
  const cleanupComplete = Boolean(
    result.state === 'UNINITIALIZED' &&
    classification === PROBE_RESULTS.NONE &&
    probe.runtimeGlobalPresent !== true &&
    probe.claimPresent !== true &&
    probe.rootCount === 0
  );
  const response = responseForProbe(classification, probe, {
      enabled: settingsAfterTeardown.timerEnabled !== false,
      requestedEnabled: false,
      staleRequestIgnored: settingsAfterTeardown.timerEnabled !== false
    });
  return {
    ...response,
    health: result,
    ok: cleanupComplete,
    reason: cleanupComplete ? response.reason : (response.reason || result.reason || 'runtime-disable-incomplete'),
    reloadRequired: response.reloadRequired || !cleanupComplete
  };
}

async function retryTeardownUnsafe(request) {
  if (!Number.isInteger(request.tabId)) return { ok: false, reason: 'missing-tab-id' };
  let probe = await collectPageProbe(request);
  const guard = guardProbe(request, probe);
  if (guard) return { ...guard, health: probe.runtimeSnapshot || null, reloadRequired: true };
  request = { ...request, documentToken: probe.documentToken, expectedDocumentId: request.expectedDocumentId || probe.browserDocumentId };
  const classification = classifyPageProbe(probe);
  if (classification !== PROBE_RESULTS.FAILED_SAME_BUILD || probe.runtimeSnapshot?.reason !== 'teardown-incomplete') {
    return responseForProbe(classification, probe, { reason: 'cleanup-retry-not-applicable' });
  }
  const runtimeId = probe.runtimeSnapshot.runtimeInstanceId;
  const result = await invokeRuntime(request, 'retryTeardown', runtimeId);
  if (!result) return responseForProbe(classification, probe, { reason: 'cleanup-retry-unavailable', reloadRequired: true });
  probe = await collectPageProbe(request);
  const nextClassification = classifyPageProbe(probe);
  return {
    ...responseForProbe(nextClassification, probe, {
      cleanupAttempted: true,
      cleanupComplete: result.state === 'UNINITIALIZED',
      restartAvailable: result.state === 'UNINITIALIZED'
    }),
    health: result,
    ok: result.state === 'UNINITIALIZED',
    reloadRequired: result.state === 'FAILED'
  };
}

async function revalidatePageUnsafe(request) {
  if (!Number.isInteger(request.tabId)) return { ok: false, reason: 'missing-tab-id' };
  const settings = await chrome.storage.local.get({ timerEnabled: true });
  // A BFCache-restored document may have been frozen while the authoritative
  // storage change event was delivered. Revalidation must reconcile disabled
  // mode, not merely observe the still-live page runtime.
  if (settings.timerEnabled === false) return setPageEnabledUnsafe(request, false);
  let probe = await collectPageProbe(request);
  const guard = guardProbe(request, probe);
  if (guard) return { ...guard, health: probe.runtimeSnapshot || null, reloadRequired: guard.reason !== 'unsupported-document' };
  request = { ...request, documentToken: probe.documentToken, expectedDocumentId: request.expectedDocumentId || probe.browserDocumentId };
  let classification = classifyPageProbe(probe);
  if ([PROBE_RESULTS.NONE, PROBE_RESULTS.ORPHAN_ROOT_ONLY].includes(classification)) return bootPageUnsafe(request);
  if ([PROBE_RESULTS.RECOVERING_SAME_BUILD, PROBE_RESULTS.BOOTING_SAME_BUILD, PROBE_RESULTS.FAILED_SAME_BUILD].includes(classification)) {
    return responseForProbe(classification, probe, { source: 'existing-runtime' });
  }
  if (![PROBE_RESULTS.HEALTHY_SAME_BUILD, PROBE_RESULTS.DEGRADED_SAME_BUILD].includes(classification)) {
    return responseForProbe(classification, probe);
  }

  const runtimeId = probe.runtimeSnapshot?.runtimeInstanceId || probe.runtimeInstanceId;
  await invokeRuntime(request, 'revalidate', runtimeId);
  probe = await collectPageProbe(request);
  classification = classifyPageProbe(probe);
  return classification === PROBE_RESULTS.DEGRADED_SAME_BUILD
    ? recoverExistingIfNeeded(request, probe, classification, 'revalidated-runtime')
    : responseForProbe(classification, probe, { source: 'revalidated-runtime' });
}

function bootPage(value, context) {
  const request = normalizeRequest(value, context);
  return serializeTabOperation(request, () => bootPageUnsafe(request));
}

function getHealth(value, context) {
  const request = normalizeRequest(value, context);
  return serializeTabOperation(request, () => getHealthUnsafe(request));
}

function setPageEnabled(value, enabled, context) {
  const request = normalizeRequest(value, context);
  return serializeTabOperation(request, () => setPageEnabledUnsafe(request, enabled));
}

function retryTeardown(value, context) {
  const request = normalizeRequest(value, context);
  return serializeTabOperation(request, () => retryTeardownUnsafe(request));
}

function revalidatePage(value, context) {
  const request = normalizeRequest(value, context);
  return serializeTabOperation(request, () => revalidatePageUnsafe(request));
}

function requestFromMessage(message, sender = {}) {
  if (sender.tab && Number.isInteger(sender.tab.id)) {
    if (sender.frameId !== 0) return { error: 'unsupported-frame' };
    const senderUrl = sender.url || sender.tab.url || '';
    if (!isSupportedSquareCoilUrl(senderUrl)) return { error: 'unsupported-document' };
    if (!isConcreteDocumentToken(message?.documentToken)) return { error: 'document-identity-missing' };
    if (
      message?.buildId !== BUILD_ID ||
      message?.packageVersion !== PACKAGE_VERSION ||
      message?.candidateFingerprint !== CANDIDATE_FINGERPRINT
    ) {
      return {
        error: 'content-controller-version-mismatch',
        classification: PROBE_RESULTS.VERSION_MISMATCH,
        reloadRequired: true
      };
    }
    return {
      request: {
        tabId: sender.tab.id,
        expectedDocumentId: sender.documentId || null,
        documentToken: message.documentToken,
        source: 'content'
      }
    };
  }
  const tabId = Number.isInteger(message?.tabId) ? message.tabId : null;
  return { request: { tabId, expectedDocumentId: null, documentToken: null, source: 'extension' } };
}

chrome.runtime.onInstalled.addListener(async () => {
  try {
    const current = await chrome.storage.local.get('timerEnabled');
    if (typeof current.timerEnabled !== 'boolean') await chrome.storage.local.set({ timerEnabled: true });
  } catch (_) {}
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const resolved = requestFromMessage(message, sender);
  if (resolved.error) {
    sendResponse({
      ok: false,
      reason: resolved.error,
      classification: resolved.classification || PROBE_RESULTS.NONE,
      reloadRequired: resolved.reloadRequired === true
    });
    return false;
  }
  const request = resolved.request;
  let task = null;
  if (message?.type === BOOT_MESSAGE) task = bootPage(request);
  if (message?.type === HEALTH_MESSAGE) task = getHealth(request);
  if (message?.type === ENABLE_MESSAGE) task = setPageEnabled(request, message.enabled !== false);
  if (message?.type === REVALIDATE_MESSAGE) task = revalidatePage(request);
  if (message?.type === RETRY_TEARDOWN_MESSAGE) task = retryTeardown(request);
  if (!task) return undefined;
  task.then(sendResponse).catch(error => sendResponse({ ok: false, reason: String(error?.message || error) }));
  return true;
});

module.exports = {
  BUILD_ID,
  BOOT_MESSAGE,
  HEALTH_MESSAGE,
  ENABLE_MESSAGE,
  REVALIDATE_MESSAGE,
  RETRY_TEARDOWN_MESSAGE,
  bootPage,
  getHealth,
  setPageEnabled,
  retryTeardown,
  revalidatePage,
  collectPageProbe,
  responseForProbe,
  checkPersistence,
  requestFromMessage
};
