'use strict';

const HEALTH_MESSAGE = 'SC_COMPANION_GET_HEALTH';
const ENABLE_MESSAGE = 'SC_COMPANION_SET_ENABLED';
const RETRY_TEARDOWN_MESSAGE = 'SC_COMPANION_RETRY_TEARDOWN';
const SETTLEMENT_RETRY_DELAYS_MS = Object.freeze([50, 150, 450]);
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

function isSettlementStartupResult(result) {
  const reason = result?.health?.reason || result?.reason || '';
  const state = result?.health?.state;
  if (state === 'BOOTING' || state === 'RECOVERING') return true;
  return state === 'DEGRADED' && [
    'coordination-not-implemented-b1',
    'b2-settlement-required',
    'coordination-unavailable',
    'coordination-not-current',
    'settlement-runtime-unavailable',
    'settlement-refresh-in-progress',
    'settlement-health-timeout',
    'settlement-worker-generation-mismatch',
    'settlement-worker-generation-changed',
    'authority-transport-timeout',
    'settlement-authority-refresh-failed',
    'trusted-core-not-initialized',
    'trusted-core-authority-mismatch',
    'trusted-core-not-current',
    'migration-preflight-incomplete',
    'bridge-not-initialized',
    'bridge-authority-mismatch',
    'bridge-initial-observation-missing'
  ].includes(reason);
}

async function settledHealthAfterEnable(tabId, initialResult, epoch) {
  let result = initialResult;
  // Command responses never establish B2 READY. Confirm the dedicated health
  // path before rendering even if an older worker returns raw lifecycle READY.
  if (result?.ready === true && epoch === operationEpoch) {
    result = await chrome.runtime.sendMessage({ type: HEALTH_MESSAGE, tabId });
  }
  for (const delayMs of SETTLEMENT_RETRY_DELAYS_MS) {
    if (!isSettlementStartupResult(result) || epoch !== operationEpoch) break;
    await new Promise(resolve => setTimeout(resolve, delayMs));
    if (epoch !== operationEpoch) break;
    result = await chrome.runtime.sendMessage({ type: HEALTH_MESSAGE, tabId });
  }
  return result;
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
    let result = await chrome.runtime.sendMessage({ type: HEALTH_MESSAGE, tabId });
    result = await settledHealthAfterEnable(tabId, result, epoch);
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
       let result = await chrome.runtime.sendMessage({ type: ENABLE_MESSAGE, enabled: Boolean(enabled), tabId });
       if (enabled) result = await settledHealthAfterEnable(tabId, result, epoch);
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
  setText('stage', 'B3 · Canonical workspace');

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
