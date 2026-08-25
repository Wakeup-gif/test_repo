(() => {
  'use strict';

  const VERSION = '0.6.0';
  const DEFAULTS = {
    themePreference: 'light',
    squareCoilTheme: 'original',
    timerEnabled: true
  };
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let timerPreference = 'light';
  let squareCoilPreference = 'original';

  function normalizeTimerTheme(value) {
    return ['light', 'dark', 'auto'].includes(value) ? value : 'light';
  }

  function normalizeSquareCoilTheme(value) {
    return ['original', 'light', 'dark'].includes(value) ? value : 'original';
  }

  function effectiveTimerTheme(value) {
    if (value === 'light' || value === 'dark') return value;
    return media.matches ? 'dark' : 'light';
  }

  function notifyThemeState() {
    try { window.dispatchEvent(new Event('USX_THEME_STATE')); } catch (_) {}
  }

  function applyTimerTheme(value) {
    timerPreference = normalizeTimerTheme(value);
    const root = document.documentElement;
    if (!root) return;
    root.dataset.usxExtension = VERSION;
    root.dataset.usxTimerThemePreference = timerPreference;
    root.dataset.usxTheme = effectiveTimerTheme(timerPreference);
    notifyThemeState();
  }

  function applySquareCoilTheme(value) {
    squareCoilPreference = normalizeSquareCoilTheme(value);
    const root = document.documentElement;
    if (!root) return;
    root.dataset.usxExtension = VERSION;
    root.dataset.usxSquarecoilTheme = squareCoilPreference;
    notifyThemeState();
  }

  async function setTimerTheme(value) {
    const next = normalizeTimerTheme(value);
    await chrome.storage.local.set({ themePreference: next });
    applyTimerTheme(next);
  }

  async function setSquareCoilTheme(value) {
    const next = normalizeSquareCoilTheme(value);
    await chrome.storage.local.set({ squareCoilTheme: next });
    applySquareCoilTheme(next);
  }

  function bootTimer() {
    chrome.storage.local.get(DEFAULTS).then(settings => {
      if (!settings.timerEnabled) {
        document.documentElement.dataset.usxTimerSource = 'disabled';
        return;
      }

      const existing = document.getElementById('ussign-job-timer');
      if (existing) document.documentElement.dataset.usxTimerSource = 'existing';

      chrome.runtime.sendMessage({ type: 'USX_BOOT_TIMER' }).then(result => {
        document.documentElement.dataset.usxTimerSource = result?.source || (result?.ok ? 'extension' : 'error');
        if (result?.existingVersion) {
          document.documentElement.dataset.usxExistingTimerVersion = result.existingVersion;
        }
      }).catch(() => {
        document.documentElement.dataset.usxTimerSource = 'error';
      });
    });
  }

  chrome.storage.local.get(DEFAULTS).then(settings => {
    applyTimerTheme(settings.themePreference);
    applySquareCoilTheme(settings.squareCoilTheme);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.themePreference) applyTimerTheme(changes.themePreference.newValue);
    if (changes.squareCoilTheme) applySquareCoilTheme(changes.squareCoilTheme.newValue);
  });

  window.addEventListener('USX_SET_TIMER_THEME', () => {
    const root = document.documentElement;
    const requested = root?.dataset.usxRequestedTimerTheme;
    if (root) delete root.dataset.usxRequestedTimerTheme;
    setTimerTheme(requested).catch(() => {});
  });

  window.addEventListener('USX_SET_SQUARECOIL_THEME', () => {
    const root = document.documentElement;
    const requested = root?.dataset.usxRequestedSquarecoilTheme;
    if (root) delete root.dataset.usxRequestedSquarecoilTheme;
    setSquareCoilTheme(requested).catch(() => {});
  });

  media.addEventListener('change', () => {
    if (timerPreference === 'auto') applyTimerTheme('auto');
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(bootTimer, 1100), { once: true });
  } else {
    setTimeout(bootTimer, 1100);
  }
})();
