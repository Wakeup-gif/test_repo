(() => {
  'use strict';

  const DEFAULTS = { themePreference: 'light' };
  const buttons = [...document.querySelectorAll('[data-theme]')];
  const status = document.getElementById('status');
  const installedVersion = document.getElementById('installedVersion');
  const latestVersion = document.getElementById('latestVersion');
  const updateMessage = document.getElementById('updateMessage');
  const releaseNotes = document.getElementById('releaseNotes');
  const checkUpdate = document.getElementById('checkUpdate');

  function setSelected(value) {
    buttons.forEach(button => {
      button.setAttribute('aria-checked', String(button.dataset.theme === value));
    });
    if (status) {
      const label = value === 'auto'
        ? 'Following system appearance'
        : `${value[0].toUpperCase()}${value.slice(1)} mode active`;
      status.textContent = label;
    }
  }

  function formatVersion(value) {
    return value ? `v${String(value).replace(/^v/i, '')}` : 'Unknown';
  }

  function renderUpdateState(update) {
    const manifestVersion = chrome.runtime.getManifest().version;
    if (installedVersion) installedVersion.textContent = formatVersion(update?.installedVersion || manifestVersion);
    if (latestVersion) latestVersion.textContent = formatVersion(update?.latestVersion || manifestVersion);

    if (releaseNotes) {
      const notes = String(update?.releaseNotes || '').trim();
      releaseNotes.textContent = notes;
      releaseNotes.hidden = !notes;
    }

    if (!updateMessage) return;

    if (update?.browserUpdateReady) {
      updateMessage.textContent = `${formatVersion(update.pendingBrowserUpdateVersion)} has been downloaded by Edge and will install automatically when the extension becomes idle or Edge restarts.`;
      updateMessage.dataset.state = 'available';
      return;
    }

    if (update?.releaseUpdateAvailable) {
      updateMessage.textContent = `${formatVersion(update.latestVersion)} is published on the stable channel. Edge will deliver it automatically once this installation is connected to the Edge Add-ons or signed self-host update channel.`;
      updateMessage.dataset.state = 'available';
      return;
    }

    if (update?.lastReleaseCheckError) {
      updateMessage.textContent = `Installed ${formatVersion(update.installedVersion)}. Could not reach the release channel just now.`;
      updateMessage.dataset.state = 'warning';
      return;
    }

    updateMessage.textContent = 'Up to date on the stable channel.';
    updateMessage.dataset.state = 'current';
  }

  async function getUpdateStatus(refresh = false) {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'USX_GET_UPDATE_STATUS', refresh });
      if (!response?.ok) throw new Error(response?.reason || 'update status unavailable');
      renderUpdateState(response.status);
      return response.status;
    } catch (_) {
      const version = chrome.runtime.getManifest().version;
      renderUpdateState({
        installedVersion: version,
        latestVersion: version,
        lastReleaseCheckError: 'status unavailable'
      });
      return null;
    }
  }

  chrome.storage.local.get(DEFAULTS).then(settings => setSelected(settings.themePreference));
  installedVersion.textContent = formatVersion(chrome.runtime.getManifest().version);
  getUpdateStatus(true);

  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const value = button.dataset.theme;
      if (!['light', 'dark', 'auto'].includes(value)) return;
      await chrome.storage.local.set({ themePreference: value });
      setSelected(value);
    });
  });

  checkUpdate?.addEventListener('click', async () => {
    const oldText = checkUpdate.textContent;
    checkUpdate.disabled = true;
    checkUpdate.textContent = 'Checking…';
    try {
      const response = await chrome.runtime.sendMessage({ type: 'USX_CHECK_UPDATE' });
      if (!response?.ok) throw new Error(response?.reason || 'update check failed');
      renderUpdateState(response.updateStatus);
      const browserStatus = response.browserCheck?.status;
      if (browserStatus === 'throttled' && updateMessage) {
        updateMessage.textContent += ' Edge temporarily throttled the manual browser check.';
      }
    } catch (_) {
      await getUpdateStatus(true);
    } finally {
      checkUpdate.disabled = false;
      checkUpdate.textContent = oldText;
    }
  });
})();
