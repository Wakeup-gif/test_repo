const bootedTabs = new Set();

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

  bootedTabs.add(tabId);
  return {
    ok: true,
    source: probe.hasTimerGlobal || probe.hasTimerRoot ? 'existing-timer' : 'extension',
    existingVersion: probe.timerVersion || null
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'USX_BOOT_TIMER') return;
  const tabId = sender.tab?.id;
  bootTimer(tabId)
    .then(sendResponse)
    .catch(error => sendResponse({ ok: false, reason: String(error?.message || error) }));
  return true;
});
