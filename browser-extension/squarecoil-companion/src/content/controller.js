'use strict';

const {
  DOCUMENT_TOKEN_DATASET_KEY,
  isSupportedTopLevelContext,
  isConcreteDocumentToken
} = require('../core/document-eligibility');
const { BUILD_ID, CANDIDATE_FINGERPRINT } = require('../core/build-identity');

const DEFAULTS = Object.freeze({ timerEnabled: true });
const BOOT_MESSAGE = 'SC_COMPANION_BOOT';
const ENABLE_MESSAGE = 'SC_COMPANION_SET_ENABLED';
const REVALIDATE_MESSAGE = 'SC_COMPANION_REVALIDATE';
const TRANSPORT_RETRY_DELAYS_MS = Object.freeze([250, 1000, 3000]);
const PACKAGE_VERSION = String(chrome.runtime.getManifest().version || '0.0.0');

(function startContentController() {
  if (!isSupportedTopLevelContext(window)) return;

  let bootRequested = false;
  let responseEpoch = 0;
  let transportRetryAttempt = 0;
  let transportRetryTimer = null;

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

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.timerEnabled) return;
    clearTransportRetry();
    const enabled = changes.timerEnabled.newValue !== false;
    setDataset('squarecoilCompanionEnabled', enabled ? 'true' : 'false');
    bootRequested = enabled;
    const epoch = ++responseEpoch;
    const message = { type: ENABLE_MESSAGE, enabled };
    send(message).then(result => {
      handleResult(epoch, result, enabled, message);
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
    }).catch(() => {});
  });

  scheduleBoot();
})();
