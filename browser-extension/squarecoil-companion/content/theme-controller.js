(() => {
  'use strict';

  const VERSION = '0.1.0';
  const DEFAULTS = { themePreference: 'auto', timerEnabled: true };
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'auto';

  function effectiveTheme(value) {
    if (value === 'light' || value === 'dark') return value;
    return media.matches ? 'dark' : 'light';
  }

  function applyTheme(value) {
    preference = ['light', 'dark', 'auto'].includes(value) ? value : 'auto';
    const root = document.documentElement;
    if (!root) return;
    root.dataset.usxExtension = VERSION;
    root.dataset.usxThemePreference = preference;
    root.dataset.usxTheme = effectiveTheme(preference);
  }

  function bootTimer() {
    chrome.storage.local.get(DEFAULTS).then(settings => {
      if (!settings.timerEnabled) {
        document.documentElement.dataset.usxTimerSource = 'disabled';
        return;
      }

      const existing = document.getElementById('ussign-job-timer');
      if (existing) {
        document.documentElement.dataset.usxTimerSource = 'existing';
      }

      chrome.runtime.sendMessage({ type: 'USX_BOOT_TIMER' }).then(result => {
        document.documentElement.dataset.usxTimerSource = result?.source || (result?.ok ? 'extension' : 'error');
        if (result?.existingVersion) document.documentElement.dataset.usxExistingTimerVersion = result.existingVersion;
      }).catch(() => {
        document.documentElement.dataset.usxTimerSource = 'error';
      });
    });
  }

  chrome.storage.local.get(DEFAULTS).then(settings => {
    applyTheme(settings.themePreference);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.themePreference) applyTheme(changes.themePreference.newValue);
  });

  media.addEventListener('change', () => {
    if (preference === 'auto') applyTheme('auto');
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(bootTimer, 1100), { once: true });
  } else {
    setTimeout(bootTimer, 1100);
  }
})();
