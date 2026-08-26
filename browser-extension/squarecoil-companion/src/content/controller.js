'use strict';

const DEFAULTS = Object.freeze({ timerEnabled: true });
const BOOT_MESSAGE = 'SC_COMPANION_BOOT';
const ENABLE_MESSAGE = 'SC_COMPANION_SET_ENABLED';
const REVALIDATE_MESSAGE = 'SC_COMPANION_REVALIDATE';

(function startContentController() {
  let bootRequested = false;

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

  async function send(message) {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      setDataset('squarecoilCompanionController', 'error');
      setDataset('squarecoilCompanionControllerReason', String(error?.message || error));
      return null;
    }
  }

  async function syncEnabled() {
    try {
      const settings = await chrome.storage.local.get(DEFAULTS);
      const enabled = settings.timerEnabled !== false;
      if (!enabled) {
        bootRequested = false;
        const result = await send({ type: ENABLE_MESSAGE, enabled: false });
        renderResult(result, false);
        return;
      }

      if (bootRequested) return;
      bootRequested = true;
      const result = await send({ type: BOOT_MESSAGE });
      renderResult(result, true);
      if (!result || (!result.ok && !result.reloadRequired)) bootRequested = false;
    } catch (error) {
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
    const enabled = changes.timerEnabled.newValue !== false;
    bootRequested = enabled;
    send({ type: ENABLE_MESSAGE, enabled }).then(result => {
      renderResult(result, enabled);
      if (enabled && !result?.ok && !result?.reloadRequired) bootRequested = false;
      if (!enabled) bootRequested = false;
    }).catch(() => {
      if (enabled) bootRequested = false;
    });
  });

  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    send({ type: REVALIDATE_MESSAGE }).then(result => renderResult(result, true)).catch(() => {});
  });

  scheduleBoot();
})();
