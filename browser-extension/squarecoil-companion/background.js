const bootedTabs = new Set();
const RELEASE_URL = 'https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/browser-extension/squarecoil-companion/release.json';
const RELEASE_CACHE_MS = 15 * 60 * 1000;

function versionParts(value) {
  return String(value || '0')
    .split('.')
    .map(part => Math.max(0, Number.parseInt(part, 10) || 0));
}

function compareVersions(a, b) {
  const left = versionParts(a);
  const right = versionParts(b);
  const size = Math.max(left.length, right.length);
  for (let index = 0; index < size; index += 1) {
    const av = left[index] || 0;
    const bv = right[index] || 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

async function probeTimer(tabId) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () => ({
      hasTimerGlobal: Boolean(window.__squareCoilJobTimerUiVersion),
      hasTimerRoot: Boolean(document.getElementById('ussign-job-timer')),
      timerVersion: window.__squareCoilJobTimerUiVersion || null
    })
  });
  return result?.[0]?.result || {};
}

async function bootTimer(tabId) {
  if (!tabId) return { ok: false, reason: 'missing-tab' };

  const probe = await probeTimer(tabId);
  if (!probe.hasTimerGlobal && !probe.hasTimerRoot) {
    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      files: ['page/timer-runtime.js']
    });
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    files: ['page/timer-controls.js']
  });

  await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    files: ['page/timer-workspace.js']
  });

  bootedTabs.add(tabId);
  return {
    ok: true,
    source: probe.hasTimerGlobal || probe.hasTimerRoot ? 'existing-timer' : 'extension',
    existingVersion: probe.timerVersion || null
  };
}

async function fetchReleaseMetadata() {
  const checkedAt = Date.now();
  try {
    const response = await fetch(`${RELEASE_URL}?t=${checkedAt}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`release metadata HTTP ${response.status}`);
    const metadata = await response.json();
    if (!metadata || typeof metadata.latestVersion !== 'string') {
      throw new Error('invalid release metadata');
    }

    await chrome.storage.local.set({
      latestKnownVersion: metadata.latestVersion,
      latestReleaseNotes: String(metadata.releaseNotes || ''),
      latestReleaseDistribution: metadata.distribution || null,
      lastReleaseCheckAt: checkedAt,
      lastReleaseCheckError: null
    });
    return metadata;
  } catch (error) {
    await chrome.storage.local.set({
      lastReleaseCheckAt: checkedAt,
      lastReleaseCheckError: String(error?.message || error)
    });
    throw error;
  }
}

async function getUpdateStatus(refreshMetadata = false) {
  const manifest = chrome.runtime.getManifest();
  let stored = await chrome.storage.local.get({
    latestKnownVersion: null,
    latestReleaseNotes: '',
    latestReleaseDistribution: null,
    lastReleaseCheckAt: 0,
    lastReleaseCheckError: null,
    pendingBrowserUpdateVersion: null,
    lastBrowserUpdateCheckStatus: null,
    lastBrowserUpdateCheckAt: 0
  });

  const stale = Date.now() - Number(stored.lastReleaseCheckAt || 0) > RELEASE_CACHE_MS;
  if (refreshMetadata || stale || !stored.latestKnownVersion) {
    try {
      await fetchReleaseMetadata();
    } catch (_) {
      // Keep the last known release metadata if the network check fails.
    }
    stored = await chrome.storage.local.get({
      latestKnownVersion: null,
      latestReleaseNotes: '',
      latestReleaseDistribution: null,
      lastReleaseCheckAt: 0,
      lastReleaseCheckError: null,
      pendingBrowserUpdateVersion: null,
      lastBrowserUpdateCheckStatus: null,
      lastBrowserUpdateCheckAt: 0
    });
  }

  const latestVersion = stored.latestKnownVersion || manifest.version;
  return {
    installedVersion: manifest.version,
    versionName: manifest.version_name || manifest.version,
    latestVersion,
    releaseUpdateAvailable: compareVersions(latestVersion, manifest.version) > 0,
    releaseNotes: stored.latestReleaseNotes || '',
    distribution: stored.latestReleaseDistribution || null,
    pendingBrowserUpdateVersion: stored.pendingBrowserUpdateVersion || null,
    browserUpdateReady: Boolean(stored.pendingBrowserUpdateVersion),
    lastReleaseCheckAt: stored.lastReleaseCheckAt || 0,
    lastReleaseCheckError: stored.lastReleaseCheckError || null,
    lastBrowserUpdateCheckStatus: stored.lastBrowserUpdateCheckStatus || null,
    lastBrowserUpdateCheckAt: stored.lastBrowserUpdateCheckAt || 0
  };
}

async function checkBrowserUpdate() {
  try {
    await fetchReleaseMetadata();
  } catch (_) {
    // Browser-native update checks can still run without GitHub metadata.
  }

  const checkedAt = Date.now();
  let result = { status: 'unavailable' };
  try {
    if (typeof chrome.runtime.requestUpdateCheck === 'function') {
      result = await chrome.runtime.requestUpdateCheck();
    }
  } catch (error) {
    result = { status: 'error', message: String(error?.message || error) };
  }

  const patch = {
    lastBrowserUpdateCheckStatus: result?.status || 'unknown',
    lastBrowserUpdateCheckAt: checkedAt
  };
  if (result?.status === 'update_available' && result.version) {
    patch.pendingBrowserUpdateVersion = result.version;
  }
  await chrome.storage.local.set(patch);

  return {
    browserCheck: result,
    updateStatus: await getUpdateStatus(false)
  };
}

async function setUpdateBadge(version) {
  try {
    await chrome.action.setBadgeText({ text: version ? 'UP' : '' });
    if (version) await chrome.action.setBadgeBackgroundColor({ color: '#4f88c6' });
  } catch (_) {}
}

chrome.runtime.onInstalled.addListener(details => {
  const version = chrome.runtime.getManifest().version;
  chrome.storage.local.set({
    lastInstalledVersion: version,
    lastInstallReason: details.reason,
    lastInstalledAt: Date.now(),
    pendingBrowserUpdateVersion: null
  }).catch(() => {});
  setUpdateBadge(null);
  fetchReleaseMetadata().catch(() => {});
});

chrome.runtime.onStartup.addListener(() => {
  fetchReleaseMetadata().catch(() => {});
});

chrome.runtime.onUpdateAvailable.addListener(details => {
  const version = details?.version || null;
  chrome.storage.local.set({
    pendingBrowserUpdateVersion: version,
    browserUpdateAvailableAt: Date.now()
  }).catch(() => {});
  setUpdateBadge(version);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'USX_BOOT_TIMER') {
    const tabId = sender.tab?.id;
    bootTimer(tabId)
      .then(sendResponse)
      .catch(error => sendResponse({ ok: false, reason: String(error?.message || error) }));
    return true;
  }

  if (message?.type === 'USX_GET_UPDATE_STATUS') {
    getUpdateStatus(Boolean(message.refresh))
      .then(status => sendResponse({ ok: true, status }))
      .catch(error => sendResponse({ ok: false, reason: String(error?.message || error) }));
    return true;
  }

  if (message?.type === 'USX_CHECK_UPDATE') {
    checkBrowserUpdate()
      .then(result => sendResponse({ ok: true, ...result }))
      .catch(error => sendResponse({ ok: false, reason: String(error?.message || error) }));
    return true;
  }
});
