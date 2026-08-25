(() => {
  'use strict';

  const DEFAULTS = { themePreference: 'auto' };
  const buttons = [...document.querySelectorAll('[data-theme]')];
  const status = document.getElementById('status');

  function setSelected(value) {
    buttons.forEach(button => {
      button.setAttribute('aria-checked', String(button.dataset.theme === value));
    });
    if (status) {
      const label = value === 'auto' ? 'Following system appearance' : `${value[0].toUpperCase()}${value.slice(1)} mode active`;
      status.textContent = label;
    }
  }

  chrome.storage.local.get(DEFAULTS).then(settings => setSelected(settings.themePreference));

  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const value = button.dataset.theme;
      if (!['light', 'dark', 'auto'].includes(value)) return;
      await chrome.storage.local.set({ themePreference: value });
      setSelected(value);
    });
  });
})();
