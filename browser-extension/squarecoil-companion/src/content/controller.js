'use strict';

const DEFAULTS = Object.freeze({ timerEnabled: true });
const BOOT_MESSAGE = 'SC_COMPANION_BOOT';
const ENABLE_MESSAGE = 'SC_COMPANION_SET_ENABLED';
const REVALIDATE_MESSAGE = 'SC_COMPANION_REVALIDATE';

(function startContentController() {
  let bootRequested = false;

  async function send(message) {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      document.documentElement.dataset.squarecoilCompanionController = 'error';
      document.documentElement.dataset.squarecoilCompanionControllerReason = String(error?.message || error);
      return null;
    }
  }

  async function syncEnabled() {
    const settings = await chrome.storage.local.get(DEFAULTS);
    const enabled = settings.timerEnabled !== false;
    if (!enabled) {
      bootRequested = false;
      document.documentElement.dataset.squarecoilCompanionController = 'disabled';
      await send({ type: ENABLE_MESSAGE, enabled: false });
      return;
    }

    if (bootRequested) return;
    bootRequested = true;
    const result = await send({ type: BOOT_MESSAGE });
    document.documentElement.dataset.squarecoilCompanionController = result?.ok ? 'booted' : 'attention';
    document.documentElement.dataset.squarecoilCompanionProbe = result?.classification || 'UNKNOWN';
    if (result?.reason) document.documentElement.dataset.squarecoilCompanionReason = result.reason;
    if (result?.reloadRequired) document.documentElement.dataset.squarecoilCompanionReloadRequired = 'true';
  }

  function scheduleBoot() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', syncEnabled, { once: true });
    } else {
      queueMicrotask(syncEnabled);
    }
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.timerEnabled) return;
    const enabled = changes.timerEnabled.newValue !== false;
    bootRequested = false;
    send({ type: ENABLE_MESSAGE, enabled }).then(result => {
      document.documentElement.dataset.squarecoilCompanionController = enabled
        ? (result?.ok ? 'booted' : 'attention')
        : 'disabled';
    });
  });

  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    send({ type: REVALIDATE_MESSAGE }).catch(() => {});
  });

  scheduleBoot();
})();
