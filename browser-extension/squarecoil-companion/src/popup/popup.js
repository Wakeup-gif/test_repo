'use strict';

const HEALTH_MESSAGE = 'SC_COMPANION_GET_HEALTH';
const ENABLE_MESSAGE = 'SC_COMPANION_SET_ENABLED';
const RETRY_TEARDOWN_MESSAGE = 'SC_COMPANION_RETRY_TEARDOWN';
let operationEpoch = 0;
let settingQueue = Promise.resolve();

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
  const cleanupRetryAvailable = health.reason === 'teardown-incomplete';
  let reason = health.reason || result?.reason || '';
  if (result?.reloadRequired && !cleanupRetryAvailable) {
    reason = `${reason ? `${reason} — ` : ''}Reload the SquareCoil tab.`;
  }
  setText('lifecycle', health.state || 'UNAVAILABLE');
  setText('reason', reason);
  setText('runtimeId', health.runtimeInstanceId || '—');
  const attention = Boolean(
    !result ||
    result.ok === false ||
    result.reloadRequired ||
    health.state !== 'READY'
  );
  document.body.dataset.health = attention ? 'attention' : 'ok';
  const retry = document.getElementById('retryCleanup');
  if (retry) retry.hidden = !cleanupRetryAvailable;
  const startFresh = document.getElementById('startFresh');
  if (startFresh) startFresh.hidden = result?.restartAvailable !== true;
}

async function refreshHealth() {
  const epoch = ++operationEpoch;
  await settingQueue;
  const tabId = await activeTabId();
  if (!Number.isInteger(tabId)) {
    if (epoch === operationEpoch) renderHealth({ ok: false, classification: 'NO_ACTIVE_TAB', reason: 'Open a SquareCoil tab to inspect lifecycle health.' });
    return;
  }
  try {
    const result = await chrome.runtime.sendMessage({ type: HEALTH_MESSAGE, tabId });
    if (epoch === operationEpoch) renderHealth(result);
  } catch (error) {
    if (epoch === operationEpoch) renderHealth({ ok: false, classification: 'ERROR', reason: String(error?.message || error) });
  }
}

function setEnabled(enabled) {
  const epoch = ++operationEpoch;
  const task = settingQueue.then(async () => {
    try {
      const tabId = await activeTabId();
      await chrome.storage.local.set({ timerEnabled: Boolean(enabled) });
      const result = await chrome.runtime.sendMessage({ type: ENABLE_MESSAGE, enabled: Boolean(enabled), tabId });
      if (epoch === operationEpoch) renderHealth(result);
    } catch (error) {
      if (epoch === operationEpoch) renderHealth({ ok: false, classification: 'ERROR', reason: String(error?.message || error) });
    }
  });
  settingQueue = task.catch(() => {});
  return task;
}

function sendToActiveTab(type) {
  const epoch = ++operationEpoch;
  const task = settingQueue.then(async () => {
    const tabId = await activeTabId();
    if (!Number.isInteger(tabId)) {
      if (epoch === operationEpoch) renderHealth({ ok: false, classification: 'NO_ACTIVE_TAB', reason: 'Open a SquareCoil tab to inspect lifecycle health.' });
      return;
    }
    try {
      const result = await chrome.runtime.sendMessage({ type, tabId });
      if (epoch === operationEpoch) renderHealth(result);
    } catch (error) {
      if (epoch === operationEpoch) renderHealth({ ok: false, classification: 'ERROR', reason: String(error?.message || error) });
    }
  });
  settingQueue = task.catch(() => {});
  return task;
}

document.addEventListener('DOMContentLoaded', async () => {
  const manifest = chrome.runtime.getManifest();
  setText('version', `v${manifest.version}`);
  setText('stage', 'B2 · Settlement-gated runtime');

  const settings = await chrome.storage.local.get({ timerEnabled: true });
  const toggle = document.getElementById('enabled');
  if (toggle) {
    toggle.checked = settings.timerEnabled !== false;
    toggle.addEventListener('change', () => setEnabled(toggle.checked));
  }

  document.getElementById('refresh')?.addEventListener('click', refreshHealth);
  document.getElementById('retryCleanup')?.addEventListener('click', () => sendToActiveTab(RETRY_TEARDOWN_MESSAGE));
  document.getElementById('startFresh')?.addEventListener('click', () => {
    const toggle = document.getElementById('enabled');
    if (toggle) toggle.checked = true;
    setEnabled(true);
  });
  await refreshHealth();
});
