(() => {
  'use strict';

  const DEFAULTS = { themePreference: 'light', timerSurface: 'solid' };
  const themeButtons = [...document.querySelectorAll('[data-theme]')];
  const surfaceButtons = [...document.querySelectorAll('[data-surface]')];
  const status = document.getElementById('status');
  const installedVersion = document.getElementById('installedVersion');
  const latestVersion = document.getElementById('latestVersion');
  const updateMessage = document.getElementById('updateMessage');
  const releaseNotes = document.getElementById('releaseNotes');
  const checkUpdate = document.getElementById('checkUpdate');
  const browserName = /Edg\//.test(navigator.userAgent) ? 'Edge' : /Chrome\//.test(navigator.userAgent) ? 'Chrome' : 'browser';
  let currentTheme = 'light';
  let currentSurface = 'solid';

  function renderStatus() {
    if (!status) return;
    const themeLabel = currentTheme === 'auto' ? 'Auto' : currentTheme[0].toUpperCase() + currentTheme.slice(1);
    const surfaceLabel = currentSurface === 'glass' ? 'Glass / Blur' : 'Solid';
    status.textContent = `${themeLabel} · ${surfaceLabel}`;
  }

  function setThemeSelected(value) {
    currentTheme = ['light', 'dark', 'auto'].includes(value) ? value : 'light';
    themeButtons.forEach(button => {
      button.setAttribute('aria-checked', String(button.dataset.theme === currentTheme));
    });
    renderStatus();
  }

  function setSurfaceSelected(value) {
    currentSurface = ['solid', 'glass'].includes(value) ? value : 'solid';
    surfaceButtons.forEach(button => {
      button.setAttribute('aria-checked', String(button.dataset.surface === currentSurface));
    });
    renderStatus();
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
      updateMessage.textContent = `${formatVersion(update.pendingBrowserUpdateVersion)} has been downloaded by ${browserName} and will install automatically when the extension becomes idle or ${browserName} restarts.`;
      updateMessage.dataset.state = 'available';
      return;
    }

    if (update?.releaseUpdateAvailable) {
      updateMessage.textContent = `${formatVersion(update.latestVersion)} is published on the stable channel. ${browserName} will deliver it automatically once this installation is connected to a store or signed self-host update channel.`;
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

  chrome.storage.local.get(DEFAULTS).then(settings => {
    setThemeSelected(settings.themePreference);
    setSurfaceSelected(settings.timerSurface);
  });
  installedVersion.textContent = formatVersion(chrome.runtime.getManifest().version);
  getUpdateStatus(true);

  themeButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const value = button.dataset.theme;
      if (!['light', 'dark', 'auto'].includes(value)) return;
      await chrome.storage.local.set({ themePreference: value });
      setThemeSelected(value);
    });
  });

  surfaceButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const value = button.dataset.surface;
      if (!['solid', 'glass'].includes(value)) return;
      await chrome.storage.local.set({ timerSurface: value });
      setSurfaceSelected(value);
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
        updateMessage.textContent += ` ${browserName} temporarily throttled the manual browser check.`;
      }
    } catch (_) {
      await getUpdateStatus(true);
    } finally {
      checkUpdate.disabled = false;
      checkUpdate.textContent = oldText;
    }
  });
})();
