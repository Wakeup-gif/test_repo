'use strict';

const {
  DOCUMENT_TOKEN_DATASET_KEY,
  isSupportedTopLevelContext,
  isConcreteDocumentToken
} = require('../core/document-eligibility');
const { BUILD_ID, CANDIDATE_FINGERPRINT } = require('../core/build-identity');
const {
  AUTHORITY_PROTOCOL_VERSION,
  AUTHORITY_CONTROL_MESSAGES,
  KERNEL_ONLY_DISPOSITION,
  createB2SettlementAcknowledgment
} = require('../extension/authority-protocol');
const { createAuthorityClient } = require('../extension/authority-client');
const { createTrustedTransitionCore } = require('./trusted-transition-core');

const DEFAULTS = Object.freeze({ timerEnabled: true });
const BOOT_MESSAGE = 'SC_COMPANION_BOOT';
const ENABLE_MESSAGE = 'SC_COMPANION_SET_ENABLED';
const REVALIDATE_MESSAGE = 'SC_COMPANION_REVALIDATE';
const TRANSPORT_RETRY_DELAYS_MS = Object.freeze([250, 1000, 3000]);
const PACKAGE_VERSION = String(chrome.runtime.getManifest().version || '0.0.0');
const AUTHORITY_HEALTH_KEY = '__squareCoilCompanionAuthorityHealth';

(function startContentController() {
  if (!isSupportedTopLevelContext(window)) return;

  let bootRequested = false;
  let responseEpoch = 0;
  let transportRetryAttempt = 0;
  let transportRetryTimer = null;
  let authorityClient = null;
  let authorityRuntimeInstanceId = null;
  let trustedCore = null;
  let settingChangeQueue = Promise.resolve();

  function createDocumentToken() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') return globalThis.crypto.randomUUID();
    return `document-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  }

  function ensureDocumentToken() {
    const root = document.documentElement;
    if (!root) return null;
    const existing = root.dataset[DOCUMENT_TOKEN_DATASET_KEY];
    if (isConcreteDocumentToken(existing)) return existing;
    const token = createDocumentToken();
    root.dataset[DOCUMENT_TOKEN_DATASET_KEY] = token;
    return token;
  }

  function setDataset(key, value) {
    const root = document.documentElement;
    if (!root) return;
    if (value === null || value === undefined || value === '') delete root.dataset[key];
    else root.dataset[key] = String(value);
  }

  function unavailableAuthoritySnapshot() {
    return {
      enabled: false,
      healthy: false,
      disposition: 'UNAVAILABLE',
      workerInstanceId: null,
      coordinationEpoch: null,
      coordinationRevision: null,
      leaseExpiry: null,
      revision: null,
      subscribed: false,
      lastSequence: 0,
      lastError: null,
      runtimeInstanceId: authorityRuntimeInstanceId,
      documentToken: document.documentElement?.dataset?.[DOCUMENT_TOKEN_DATASET_KEY] || null
    };
  }

  function authoritySnapshot() {
    return authorityClient ? authorityClient.snapshot() : unavailableAuthoritySnapshot();
  }

  function coreSnapshot() {
    return trustedCore ? trustedCore.snapshot() : {
      initialized: false,
      disposed: false,
      blocked: false,
      status: 'unavailable',
      authorityOwner: false,
      revision: null,
      recoveryMode: null,
      preflight: null,
      bridge: null,
      timer: null,
      readModelError: null
    };
  }

  function settlementAuthoritySnapshot() {
    const current = authoritySnapshot();
    return {
      enabled: current.enabled === true,
      healthy: current.healthy === true,
      disposition: current.disposition || 'UNAVAILABLE'
    };
  }

  function settlementCoreSnapshot() {
    const current = coreSnapshot();
    return {
      initialized: current.initialized === true,
      disposed: current.disposed === true,
      blocked: current.blocked === true,
      status: current.status || 'unavailable',
      preflight: current.preflight ? {
        checked: current.preflight.checked === true,
        blocked: current.preflight.blocked === true,
        reason: current.preflight.reason || null,
        disposition: current.preflight.disposition || 'UNAVAILABLE',
        activityChanged: current.preflight.activityChanged === true,
        presentKeys: Array.isArray(current.preflight.presentKeys) ? [...current.preflight.presentKeys] : []
      } : null,
      bridge: current.bridge ? {
        initialized: current.bridge.initialized === true,
        active: current.bridge.active === true,
        owner: current.bridge.owner === true,
        disposed: current.bridge.disposed === true,
        capability: current.bridge.capability || 'UNAVAILABLE',
        listenersAttached: current.bridge.listenersAttached === true,
        requestCount: current.bridge.requestCount,
        nativeMutationRequestCount: current.bridge.nativeMutationRequestCount,
        lastReason: current.bridge.lastReason || null,
        lastError: current.bridge.lastError || null
      } : null,
      readModelError: current.readModelError || null
    };
  }

  // This handle exists only in Chrome's isolated content world. The website's
  // MAIN world cannot read or invoke it. It exposes health and a reconnect
  // probe and bounded Timer actions, never a session or fencing identifier.
  Object.defineProperty(globalThis, AUTHORITY_HEALTH_KEY, {
    configurable: false,
    enumerable: false,
    writable: false,
    value: Object.freeze({
      snapshot: authoritySnapshot,
      revalidate: async () => {
        if (!authorityClient) throw new Error('authority-client-unavailable');
        await authorityClient.heartbeat();
        if (trustedCore) {
          await trustedCore.handleAuthoritySnapshot(authorityClient.snapshot());
          await trustedCore.verifyNow('isolated-health-revalidate');
        }
        return authorityClient.snapshot();
      },
      coreSnapshot,
      syncBridge: async () => {
        if (!trustedCore) throw new Error('trusted-transition-core-unavailable');
        return trustedCore.verifyNow('isolated-health-sync');
      },
      timerAction: async type => {
        if (!trustedCore) throw new Error('trusted-transition-core-unavailable');
        return trustedCore.userCommand(type);
      },
      teardown: () => teardownAuthority({ controlled: true })
    })
  });

  function renderResult(result, enabled = true) {
    const classification = result?.classification || 'UNKNOWN';
    const healthState = result?.health?.state || null;
    const attention = Boolean(
      !result ||
      result?.ok === false ||
      result?.transportError ||
      result?.reloadRequired ||
      classification === 'DEGRADED_SAME_BUILD' ||
      classification === 'FAILED_SAME_BUILD' ||
      classification === 'VERSION_MISMATCH' ||
      classification === 'LEGACY_RUNTIME' ||
      classification === 'OWNERSHIP_CONFLICT' ||
      (healthState && !['READY', 'BOOTING', 'RECOVERING'].includes(healthState))
    );

    setDataset('squarecoilCompanionController', enabled ? (attention ? 'attention' : 'booted') : 'disabled');
    setDataset('squarecoilCompanionProbe', classification);
    setDataset('squarecoilCompanionReason', result?.health?.reason || result?.reason || null);
    setDataset('squarecoilCompanionReloadRequired', result?.reloadRequired ? 'true' : null);
  }

  function renderAuthority(snapshot, error = null) {
    const current = snapshot || authoritySnapshot();
    setDataset('squarecoilCompanionAuthority', current.healthy ? 'connected' : 'unavailable');
    // Detailed authority identity and failures remain inside the isolated-world
    // health handle; the website receives no worker, lease, or error details.
    void error;
  }

  function renderCore(snapshot, error = null) {
    const current = snapshot || coreSnapshot();
    setDataset('squarecoilCompanionTrustedCore', current.blocked
      ? 'blocked'
      : current.initialized && !current.disposed
        ? 'partial'
        : 'unavailable');
    setDataset('squarecoilCompanionTrustedCoreReason', error
      ? String(error?.message || error)
      : current.status || null);
  }

  function effectiveEnabled(result, fallback) {
    if (typeof result?.enabled === 'boolean') return result.enabled;
    if (result?.health?.mode === 'ENABLED') return true;
    if (result?.health?.mode === 'DISABLED') return false;
    return Boolean(fallback);
  }

  function clearTransportRetry(resetAttempt = true) {
    if (transportRetryTimer !== null) clearTimeout(transportRetryTimer);
    transportRetryTimer = null;
    if (resetAttempt) transportRetryAttempt = 0;
  }

  function scheduleTransportRetry(message, enabled, expectedEpoch) {
    if (transportRetryTimer !== null || transportRetryAttempt >= TRANSPORT_RETRY_DELAYS_MS.length) return;
    const delay = TRANSPORT_RETRY_DELAYS_MS[transportRetryAttempt];
    transportRetryAttempt += 1;
    transportRetryTimer = setTimeout(() => {
      transportRetryTimer = null;
      if (expectedEpoch !== responseEpoch) return;
      const epoch = ++responseEpoch;
      send(message).then(result => {
        handleResult(epoch, result, enabled, message);
      }).catch(() => {});
    }, delay);
  }

  function handleResult(epoch, result, fallbackEnabled, retryMessage) {
    if (epoch !== responseEpoch) return false;
    const enabled = effectiveEnabled(result, fallbackEnabled);
    setDataset('squarecoilCompanionEnabled', enabled ? 'true' : 'false');
    renderResult(result, enabled);
    if (!result || result.transportError === true || result.classification === 'TRANSPORT_ERROR') {
      bootRequested = false;
      scheduleTransportRetry(retryMessage, enabled, epoch);
      return true;
    }
    clearTransportRetry();
    bootRequested = enabled && Boolean(result.ok || result.reloadRequired);
    return true;
  }

  async function send(message) {
    const documentToken = ensureDocumentToken();
    if (!documentToken) return null;
    try {
      return await chrome.runtime.sendMessage({
        ...message,
        documentToken,
        buildId: BUILD_ID,
        packageVersion: PACKAGE_VERSION,
        candidateFingerprint: CANDIDATE_FINGERPRINT
      });
    } catch (error) {
      return {
        ok: false,
        classification: 'TRANSPORT_ERROR',
        reason: String(error?.message || error),
        transportError: true
      };
    }
  }

  function runtimeIdentityFromResult(result) {
    const value = String(result?.health?.runtimeInstanceId || '');
    return value.length >= 8 && value.length <= 200 ? value : null;
  }

  function kernelAdvertisedBy(result) {
    return result?.health?.readiness?.coordinationDisposition === KERNEL_ONLY_DISPOSITION ||
      result?.health?.authority?.kernelTransportAvailable === true;
  }

  async function ensureAuthority(result) {
    if (!kernelAdvertisedBy(result)) throw new Error('authority-kernel-not-advertised');
    const runtimeInstanceId = runtimeIdentityFromResult(result);
    const documentToken = ensureDocumentToken();
    if (!runtimeInstanceId || !documentToken) throw new Error('authority-runtime-identity-unavailable');

    const authorityHealth = authorityClient ? authorityClient.snapshot() : null;
    if (
      authorityClient &&
      (authorityRuntimeInstanceId !== runtimeInstanceId || authorityHealth?.enabled !== true)
    ) {
      // A new generation, or a same-generation client already fenced for
      // teardown, must finish exact cleanup before authority is reacquired.
      if (trustedCore) await trustedCore.teardown();
      trustedCore = null;
      await authorityClient.teardown();
      authorityClient = null;
      authorityRuntimeInstanceId = null;
    }
    if (!authorityClient) {
      authorityRuntimeInstanceId = runtimeInstanceId;
      authorityClient = createAuthorityClient({
        runtimeInstanceId,
        documentToken,
        send,
        runtimeOnMessage: chrome.runtime.onMessage,
        onHealthChange: snapshot => {
          renderAuthority(snapshot);
          if (trustedCore) {
            trustedCore.handleAuthoritySnapshot(snapshot)
              .then(renderCore, error => renderCore(coreSnapshot(), error));
          }
        }
      });
    }
    const connected = await authorityClient.ensure();
    if (!trustedCore) {
      trustedCore = createTrustedTransitionCore({
        authorityClient,
        legacyStorage: {
          getItem(key) { return window.localStorage.getItem(key); }
        },
        bridgeEnvironment: {
          document,
          window,
          fetch: (...args) => fetch(...args),
          timers: globalThis
        },
        onStatusChange: renderCore
      });
    }
    await trustedCore.ensure(connected);
    renderAuthority(authorityClient.snapshot());
    renderCore(trustedCore.snapshot());
    return connected;
  }

  async function teardownAuthority(options = {}) {
    let controlledError = null;
    if (trustedCore) {
      const core = trustedCore;
      if (options.controlled === true) {
        try { await core.prepareControlledTeardown(); }
        catch (error) { controlledError = error; }
      }
      await core.teardown();
      if (trustedCore === core) trustedCore = null;
      renderCore(coreSnapshot());
    }
    if (!authorityClient) {
      setDataset('squarecoilCompanionAuthorityCleanup', null);
      return { disconnected: true, absent: true };
    }
    const client = authorityClient;
    try {
      const response = await client.teardown();
      if (authorityClient === client) {
        authorityClient = null;
        authorityRuntimeInstanceId = null;
      }
      setDataset('squarecoilCompanionAuthorityCleanup', null);
      renderAuthority(unavailableAuthoritySnapshot());
      if (controlledError) {
        setDataset('squarecoilCompanionTrustedCoreReason', 'controlled-checkpoint-failed');
      }
      return {
        ...response,
        controlledCheckpointed: options.controlled === true ? !controlledError : undefined
      };
    } catch (error) {
      setDataset('squarecoilCompanionAuthorityCleanup', 'incomplete');
      throw error;
    }
  }

  async function prepareDisableAndTeardownAuthority() {
    if (trustedCore) {
      await trustedCore.prepareDisable();
    }
    return teardownAuthority();
  }

  function onAuthorityControl(message, _sender, sendResponse) {
    if (![AUTHORITY_CONTROL_MESSAGES.PREPARE_DISABLE, AUTHORITY_CONTROL_MESSAGES.GET_B2_SETTLEMENT].includes(message?.type)) return undefined;
    const documentToken = ensureDocumentToken();
    if (
      message.protocolVersion !== AUTHORITY_PROTOCOL_VERSION ||
      message.documentToken !== documentToken ||
      (message.runtimeInstanceId && authorityRuntimeInstanceId && message.runtimeInstanceId !== authorityRuntimeInstanceId)
    ) {
      sendResponse({
        ok: false,
        disconnected: false,
        reason: 'authority-control-identity-mismatch',
        protocolVersion: AUTHORITY_PROTOCOL_VERSION,
        documentToken,
        runtimeInstanceId: authorityRuntimeInstanceId
      });
      return false;
    }
    if (message.type === AUTHORITY_CONTROL_MESSAGES.GET_B2_SETTLEMENT) {
      sendResponse(createB2SettlementAcknowledgment(message, settlementAuthoritySnapshot(), settlementCoreSnapshot()));
      return false;
    }
    prepareDisableAndTeardownAuthority().then(response => sendResponse({
      ok: true,
      disconnected: response?.disconnected === true,
      protocolVersion: AUTHORITY_PROTOCOL_VERSION,
      documentToken,
      runtimeInstanceId: message.runtimeInstanceId || authorityRuntimeInstanceId
    }), error => sendResponse({
      ok: false,
      disconnected: false,
      reason: String(error?.message || error),
      protocolVersion: AUTHORITY_PROTOCOL_VERSION,
      documentToken,
      runtimeInstanceId: authorityRuntimeInstanceId || message.runtimeInstanceId
    }));
    return true;
  }

  if (chrome.runtime.onMessage && typeof chrome.runtime.onMessage.addListener === 'function') {
    chrome.runtime.onMessage.addListener(onAuthorityControl);
  }

  const retirementObserver = new MutationObserver(() => {
    const reason = document.documentElement?.dataset?.squarecoilCompanionReloadRequired;
    if (!['runtime-ownership-lost', 'ownership-conflict'].includes(reason)) return;
    teardownAuthority().catch(error => renderAuthority(authoritySnapshot(), error));
  });
  retirementObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-squarecoil-companion-reload-required']
  });

  async function syncEnabled() {
    clearTransportRetry();
    const epoch = ++responseEpoch;
    try {
      const settings = await chrome.storage.local.get(DEFAULTS);
      if (epoch !== responseEpoch) return;
      const enabled = settings.timerEnabled !== false;
      setDataset('squarecoilCompanionEnabled', enabled ? 'true' : 'false');
      if (!enabled) {
        bootRequested = false;
        const result = await send({ type: BOOT_MESSAGE });
        handleResult(epoch, result, false, { type: BOOT_MESSAGE });
        return;
      }

      if (bootRequested) return;
      bootRequested = true;
      const result = await send({ type: BOOT_MESSAGE });
      handleResult(epoch, result, true, { type: BOOT_MESSAGE });
      if (epoch === responseEpoch && result?.ok === true) {
        try { await ensureAuthority(result); }
        catch (error) { renderAuthority(authoritySnapshot(), error); }
      }
    } catch (error) {
      if (epoch !== responseEpoch) return;
      bootRequested = false;
      setDataset('squarecoilCompanionController', 'error');
      setDataset('squarecoilCompanionControllerReason', String(error?.message || error));
    }
  }

  function scheduleBoot() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { syncEnabled().catch(() => {}); }, { once: true });
    } else {
      queueMicrotask(() => { syncEnabled().catch(() => {}); });
    }
  }

  function queueSettingChange(task) {
    const run = settingChangeQueue.then(task, task);
    settingChangeQueue = run.then(() => undefined, () => undefined);
    return run;
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.timerEnabled) return;
    clearTransportRetry();
    const enabled = changes.timerEnabled.newValue !== false;
    setDataset('squarecoilCompanionEnabled', enabled ? 'true' : 'false');
    bootRequested = enabled;
    const epoch = ++responseEpoch;
    const message = { type: ENABLE_MESSAGE, enabled };
    queueSettingChange(async () => {
      if (epoch !== responseEpoch) return;
      if (!enabled) {
        try { await prepareDisableAndTeardownAuthority(); }
        catch (error) {
          renderAuthority(authoritySnapshot(), error);
          bootRequested = true;
          return;
        }
      }
      if (epoch !== responseEpoch) return;
      const result = await send(message);
      handleResult(epoch, result, enabled, message);
      if (enabled && epoch === responseEpoch && result?.ok === true) {
        try { await ensureAuthority(result); }
        catch (error) { renderAuthority(authoritySnapshot(), error); }
      }
    }).catch(() => {
      if (enabled) bootRequested = false;
    });
  });

  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    clearTransportRetry();
    const epoch = ++responseEpoch;
    const message = { type: REVALIDATE_MESSAGE };
    send(message).then(result => {
      handleResult(epoch, result, document.documentElement?.dataset?.squarecoilCompanionEnabled !== 'false', message);
      if (result?.ok === true) ensureAuthority(result).catch(error => renderAuthority(authoritySnapshot(), error));
    }).catch(() => {});
  });

  window.addEventListener('pagehide', event => {
    if (event.persisted === true) return;
    retirementObserver.disconnect();
    teardownAuthority({ controlled: true }).catch(error => renderAuthority(authoritySnapshot(), error));
  });

  scheduleBoot();
})();
