(() => {
  'use strict';

  const VERSION = '0.7.1';
  const DEFAULTS = {
    themePreference: 'light',
    timerSurface: 'solid',
    squareCoilTheme: 'original',
    timerEnabled: true
  };
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let timerPreference = 'light';
  let timerSurfacePreference = 'solid';
  let squareCoilPreference = 'original';
  let darkLogoData = '';
  let darkLogoTask = null;
  let logoSyncGeneration = 0;

  function normalizeTimerTheme(value) {
    return ['light', 'dark', 'auto'].includes(value) ? value : 'light';
  }

  function normalizeTimerSurface(value) {
    return ['solid', 'glass'].includes(value) ? value : 'solid';
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

  function applyTimerSurface(value) {
    timerSurfacePreference = normalizeTimerSurface(value);
    const root = document.documentElement;
    if (!root) return;
    root.dataset.usxExtension = VERSION;
    root.dataset.usxTimerSurface = timerSurfacePreference;
    notifyThemeState();
  }

  function findHeaderLogo() {
    return (
      document.querySelector('header.navbar .navbar-brand img') ||
      document.querySelector('.navbar-branding .navbar-brand img') ||
      document.querySelector('img[src*="US-Sign" i]') ||
      document.querySelector('img[src*="USSIGN" i]')
    );
  }

  async function getDarkLogoData() {
    if (darkLogoData) return darkLogoData;
    if (darkLogoTask) return darkLogoTask;
    darkLogoTask = chrome.runtime.sendMessage({ type: 'USX_GET_DARK_LOGO' })
      .then(result => {
        if (result?.ok && typeof result.dataUrl === 'string' && result.dataUrl.startsWith('data:image/')) {
          darkLogoData = result.dataUrl;
          return darkLogoData;
        }
        return '';
      })
      .catch(() => '')
      .finally(() => { darkLogoTask = null; });
    return darkLogoTask;
  }

  async function syncHeaderLogo(theme) {
    const logo = findHeaderLogo();
    if (!logo) return false;

    if (theme !== 'dark') {
      const original = logo.dataset.usxDarkLogoOriginalSrc;
      if (original) logo.src = original;
      const srcset = logo.dataset.usxDarkLogoOriginalSrcset;
      if (srcset) logo.setAttribute('srcset', srcset);
      else logo.removeAttribute('srcset');
      delete logo.dataset.usxDarkLogoApplied;
      return true;
    }

    if (!logo.dataset.usxDarkLogoOriginalSrc) {
      logo.dataset.usxDarkLogoOriginalSrc = logo.getAttribute('src') || logo.src || '';
      logo.dataset.usxDarkLogoOriginalSrcset = logo.getAttribute('srcset') || '';
    }

    const dataUrl = await getDarkLogoData();
    if (!dataUrl) return false;
    logo.src = dataUrl;
    logo.removeAttribute('srcset');
    logo.dataset.usxDarkLogoApplied = 'true';
    logo.style.setProperty('display', 'block', 'important');
    logo.style.setProperty('visibility', 'visible', 'important');
    logo.style.setProperty('opacity', '1', 'important');
    logo.style.setProperty('max-height', '52px', 'important');
    logo.style.setProperty('width', 'auto', 'important');
    return true;
  }

  function scheduleLogoSync(theme = squareCoilPreference) {
    const generation = ++logoSyncGeneration;
    let attempts = 0;
    const tick = async () => {
      if (generation !== logoSyncGeneration || theme !== squareCoilPreference) return;
      const done = await syncHeaderLogo(theme);
      if (done || attempts >= 32) return;
      attempts += 1;
      setTimeout(tick, 220);
    };
    tick();
  }

  function applySquareCoilTheme(value) {
    squareCoilPreference = normalizeSquareCoilTheme(value);
    const root = document.documentElement;
    if (!root) return;
    root.dataset.usxExtension = VERSION;
    root.dataset.usxSquarecoilTheme = squareCoilPreference;
    scheduleLogoSync(squareCoilPreference);
    notifyThemeState();
  }

  async function setTimerTheme(value) {
    const next = normalizeTimerTheme(value);
    await chrome.storage.local.set({ themePreference: next });
    applyTimerTheme(next);
  }

  async function setTimerSurface(value) {
    const next = normalizeTimerSurface(value);
    await chrome.storage.local.set({ timerSurface: next });
    applyTimerSurface(next);
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
        if (result?.interactionVersion) {
          document.documentElement.dataset.usxTimerInteractionVersion = result.interactionVersion;
        }
      }).catch(() => {
        document.documentElement.dataset.usxTimerSource = 'error';
      });
    });
  }

  chrome.storage.local.get(DEFAULTS).then(settings => {
    applyTimerTheme(settings.themePreference);
    applyTimerSurface(settings.timerSurface);
    applySquareCoilTheme(settings.squareCoilTheme);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.themePreference) applyTimerTheme(changes.themePreference.newValue);
    if (changes.timerSurface) applyTimerSurface(changes.timerSurface.newValue);
    if (changes.squareCoilTheme) applySquareCoilTheme(changes.squareCoilTheme.newValue);
  });

  window.addEventListener('USX_SET_TIMER_THEME', () => {
    const root = document.documentElement;
    const requested = root?.dataset.usxRequestedTimerTheme;
    if (root) delete root.dataset.usxRequestedTimerTheme;
    setTimerTheme(requested).catch(() => {});
  });

  window.addEventListener('USX_SET_TIMER_SURFACE', () => {
    const root = document.documentElement;
    const requested = root?.dataset.usxRequestedTimerSurface;
    if (root) delete root.dataset.usxRequestedTimerSurface;
    setTimerSurface(requested).catch(() => {});
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

  window.addEventListener('pageshow', () => scheduleLogoSync(squareCoilPreference));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      scheduleLogoSync(squareCoilPreference);
      setTimeout(bootTimer, 1100);
    }, { once: true });
  } else {
    scheduleLogoSync(squareCoilPreference);
    setTimeout(bootTimer, 1100);
  }
})();
