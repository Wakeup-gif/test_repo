'use strict';

const HEALTH_MESSAGE = 'SC_COMPANION_GET_HEALTH';
const ENABLE_MESSAGE = 'SC_COMPANION_SET_ENABLED';

async function activeTabId() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs?.[0]?.id ?? null;
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = String(value ?? '');
}

function renderHealth(result) {
  setText('classification', result?.classification || 'UNKNOWN');
  const health = result?.health || {};
  setText('lifecycle', health.state || 'UNAVAILABLE');
  setText('reason', health.reason || result?.reason || '');
  setText('runtimeId', health.runtimeInstanceId || '—');
  const attention = Boolean(result?.reloadRequired || (health.state && health.state !== 'READY'));
  document.body.dataset.health = attention ? 'attention' : 'ok';
}

async function refreshHealth() {
  const tabId = await activeTabId();
  if (!Number.isInteger(tabId)) {
    renderHealth({ ok: false, classification: 'NO_ACTIVE_TAB', reason: 'Open a SquareCoil tab to inspect lifecycle health.' });
    return;
  }
  try {
    renderHealth(await chrome.runtime.sendMessage({ type: HEALTH_MESSAGE, tabId }));
  } catch (error) {
    renderHealth({ ok: false, classification: 'ERROR', reason: String(error?.message || error) });
  }
}

async function setEnabled(enabled) {
  const tabId = await activeTabId();
  await chrome.storage.local.set({ timerEnabled: Boolean(enabled) });
  try {
    const result = await chrome.runtime.sendMessage({ type: ENABLE_MESSAGE, enabled: Boolean(enabled), tabId });
    renderHealth(result);
  } catch (error) {
    renderHealth({ ok: false, classification: 'ERROR', reason: String(error?.message || error) });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const manifest = chrome.runtime.getManifest();
  setText('version', `v${manifest.version}`);
  setText('stage', 'B1 · Shell / Lifecycle');

  const settings = await chrome.storage.local.get({ timerEnabled: true });
  const toggle = document.getElementById('enabled');
  if (toggle) {
    toggle.checked = settings.timerEnabled !== false;
    toggle.addEventListener('change', () => setEnabled(toggle.checked));
  }

  document.getElementById('refresh')?.addEventListener('click', refreshHealth);
  await refreshHealth();
});
