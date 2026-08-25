(() => {
  'use strict';

  if (window.__usxTimerControlsV040) return;
  window.__usxTimerControlsV040 = true;

  const ROOT_ID = 'ussign-job-timer';
  const STYLE_ID = 'usx-timer-controls-v040';
  const THEMES = ['light', 'dark', 'auto'];

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${ROOT_ID} .jt-shell {
  border-radius: 16px !important;
  background-clip: padding-box !important;
}
#${ROOT_ID}:not(.jt-collapsed) header {
  border-radius: 15px 15px 0 0 !important;
}
#${ROOT_ID}.jt-collapsed .jt-shell,
#${ROOT_ID}.jt-collapsed header {
  border-radius: 18px !important;
}

#${ROOT_ID} .jt-x {
  position: relative !important;
  display: block !important;
  width: 20px !important;
  height: 20px !important;
  min-width: 20px !important;
  min-height: 20px !important;
  flex: 0 0 20px !important;
  padding: 0 !important;
  margin: 0 !important;
  line-height: 0 !important;
  text-align: center !important;
  overflow: hidden !important;
}
#${ROOT_ID} .jt-x svg {
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  width: 10px !important;
  height: 10px !important;
  display: block !important;
  margin: 0 !important;
  transform: translate(-50%, -50%) !important;
  transform-origin: center !important;
  pointer-events: none !important;
  overflow: visible !important;
}
#${ROOT_ID} .jt-x path {
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 1.7 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
  vector-effect: non-scaling-stroke !important;
}

#${ROOT_ID} header > button[data-action="collapse"] {
  position: relative !important;
  display: block !important;
  padding: 0 !important;
  line-height: 0 !important;
  font-size: 0 !important;
  color: inherit !important;
  overflow: hidden !important;
}
#${ROOT_ID} header > button[data-action="collapse"] > .usx-collapse-icon {
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  width: 16px !important;
  height: 16px !important;
  display: block !important;
  transform: translate(-50%, -50%) !important;
  pointer-events: none !important;
  overflow: visible !important;
}
#${ROOT_ID} header > button[data-action="collapse"] .usx-minimize-path,
#${ROOT_ID} header > button[data-action="collapse"] .usx-expand-path {
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 1.7 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
  vector-effect: non-scaling-stroke !important;
}
#${ROOT_ID}:not(.jt-collapsed) .usx-expand-path { display: none !important; }
#${ROOT_ID}.jt-collapsed .usx-minimize-path { display: none !important; }

#${ROOT_ID} .usx-theme-setting {
  padding: 10px 11px 11px !important;
  border-bottom: 1px solid rgba(255,255,255,.05) !important;
}
#${ROOT_ID} .usx-theme-setting-head {
  display: flex !important;
  align-items: baseline !important;
  justify-content: space-between !important;
  gap: 10px !important;
  margin-bottom: 7px !important;
}
#${ROOT_ID} .usx-theme-setting-head b {
  font-size: 10px !important;
  font-weight: 700 !important;
  letter-spacing: .055em !important;
  text-transform: uppercase !important;
}
#${ROOT_ID} .usx-theme-setting-head small {
  font-size: 9px !important;
}
#${ROOT_ID} .usx-theme-options {
  display: grid !important;
  grid-template-columns: repeat(3,1fr) !important;
  gap: 5px !important;
  padding: 3px !important;
  border: 1px solid rgba(255,255,255,.07) !important;
  border-radius: 9px !important;
  background: rgba(0,0,0,.12) !important;
}
#${ROOT_ID} .usx-theme-option {
  min-height: 29px !important;
  padding: 5px 7px !important;
  margin: 0 !important;
  border: 1px solid transparent !important;
  border-radius: 6px !important;
  background: transparent !important;
  color: rgba(220,226,233,.66) !important;
  font-size: 10px !important;
  font-weight: 650 !important;
  cursor: pointer !important;
  box-shadow: none !important;
}
#${ROOT_ID} .usx-theme-option:hover {
  color: rgba(244,247,250,.94) !important;
  background: rgba(255,255,255,.05) !important;
}
#${ROOT_ID} .usx-theme-option[data-selected="true"] {
  color: rgba(246,249,252,.96) !important;
  background: rgba(123,170,242,.13) !important;
  border-color: rgba(123,170,242,.22) !important;
}

html[data-usx-theme="light"] #${ROOT_ID} {
  --jt-line: rgba(0,0,0,.10) !important;
  color: #40464d !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .jt-shell,
html[data-usx-theme="light"] #${ROOT_ID}.jt-collapsed .jt-shell {
  background: #ffffff !important;
  background-image: none !important;
  border-color: rgba(0,0,0,.10) !important;
  box-shadow: 0 12px 28px rgba(0,0,0,.13) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
html[data-usx-theme="light"] #${ROOT_ID} header {
  border-bottom-color: rgba(0,0,0,.08) !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .jt-brand,
html[data-usx-theme="light"] #${ROOT_ID} .jt-head-context,
html[data-usx-theme="light"] #${ROOT_ID} header > [data-role="compact-time"] {
  color: #3f454c !important;
}
html[data-usx-theme="light"] #${ROOT_ID} header > button {
  color: #68717a !important;
  background: #f5f6f7 !important;
  border-color: #dfe3e6 !important;
}
html[data-usx-theme="light"] #${ROOT_ID} header > button:hover {
  color: #30363c !important;
  background: #eceff1 !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .jt-main,
html[data-usx-theme="light"] #${ROOT_ID} .jt-empty,
html[data-usx-theme="light"] #${ROOT_ID} .jt-settings,
html[data-usx-theme="light"] #${ROOT_ID} .jt-resume {
  color: #51575d !important;
  background: #f8f9fa !important;
  border-color: #e1e4e7 !important;
  box-shadow: none !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .jt-main-head b,
html[data-usx-theme="light"] #${ROOT_ID} .jt-main > strong,
html[data-usx-theme="light"] #${ROOT_ID} .jt-settings > h4,
html[data-usx-theme="light"] #${ROOT_ID} .jt-row b,
html[data-usx-theme="light"] #${ROOT_ID} .usx-theme-setting-head b {
  color: #343a40 !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .jt-main-head span,
html[data-usx-theme="light"] #${ROOT_ID} .jt-row small,
html[data-usx-theme="light"] #${ROOT_ID} .jt-archive-empty,
html[data-usx-theme="light"] #${ROOT_ID} .usx-theme-setting-head small {
  color: #7e858c !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .jt-tab {
  background: #f4f5f6 !important;
  border-color: rgba(var(--tc),.24) !important;
  border-bottom-color: #d8dde1 !important;
  box-shadow: 0 5px 14px rgba(0,0,0,.08) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .jt-tab.jt-selected {
  background: #ffffff !important;
  border-bottom-color: #ffffff !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .jt-x {
  background: rgba(0,0,0,.045) !important;
  color: #6e767f !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .usx-theme-setting {
  border-bottom-color: rgba(0,0,0,.07) !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .usx-theme-options {
  background: #eef1f3 !important;
  border-color: #dfe3e6 !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .usx-theme-option {
  color: #717981 !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .usx-theme-option:hover {
  color: #343a40 !important;
  background: rgba(255,255,255,.70) !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .usx-theme-option[data-selected="true"] {
  color: #2f5278 !important;
  background: #ffffff !important;
  border-color: rgba(75,150,230,.30) !important;
  box-shadow: 0 1px 3px rgba(0,0,0,.08) !important;
}

html[data-usx-theme="dark"] #${ROOT_ID} {
  --jt-line: rgba(255,255,255,.085) !important;
  color: #eef2f5 !important;
}
html[data-usx-theme="dark"] #${ROOT_ID} .jt-shell,
html[data-usx-theme="dark"] #${ROOT_ID}.jt-collapsed .jt-shell {
  background: #14191f !important;
  background-image: none !important;
  border-color: rgba(255,255,255,.085) !important;
  box-shadow: 0 16px 36px rgba(0,0,0,.28) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
html[data-usx-theme="dark"] #${ROOT_ID} header {
  border-bottom-color: rgba(255,255,255,.075) !important;
}
html[data-usx-theme="dark"] #${ROOT_ID} .jt-main,
html[data-usx-theme="dark"] #${ROOT_ID} .jt-empty,
html[data-usx-theme="dark"] #${ROOT_ID} .jt-settings {
  background: #191f26 !important;
  border-color: rgba(255,255,255,.075) !important;
}
html[data-usx-theme="dark"] #${ROOT_ID} .jt-tab {
  background: #1a2027 !important;
  border-color: rgba(var(--tc),.24) !important;
  border-bottom-color: rgba(255,255,255,.065) !important;
  box-shadow: 0 5px 14px rgba(0,0,0,.18) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
html[data-usx-theme="dark"] #${ROOT_ID} .jt-tab.jt-selected {
  background: #20272f !important;
  border-bottom-color: #20272f !important;
}
html[data-usx-theme="dark"] #${ROOT_ID} header > button {
  color: rgba(235,240,245,.80) !important;
  background: #20272f !important;
  border-color: rgba(255,255,255,.08) !important;
}
html[data-usx-theme="dark"] #${ROOT_ID} header > button:hover {
  color: #fff !important;
  background: #29323c !important;
}
`;
    document.documentElement.appendChild(style);
  }

  function makeCollapseIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('usx-collapse-icon');

    const minus = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    minus.setAttribute('d', 'M4 8H12');
    minus.classList.add('usx-minimize-path');

    const expand = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    expand.setAttribute('d', 'M4.25 9.75 8 6l3.75 3.75');
    expand.classList.add('usx-expand-path');

    svg.append(minus, expand);
    return svg;
  }

  function currentPreference() {
    const value = document.documentElement.dataset.usxTimerThemePreference;
    return THEMES.includes(value) ? value : 'auto';
  }

  function syncThemeButtons(root = document.getElementById(ROOT_ID)) {
    if (!root) return;
    const selected = currentPreference();
    root.querySelectorAll('.usx-theme-option').forEach(button => {
      const active = button.dataset.usxThemeChoice === selected;
      button.dataset.selected = String(active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function makeThemeSettings() {
    const wrap = document.createElement('div');
    wrap.className = 'usx-theme-setting';
    wrap.innerHTML = `
      <div class="usx-theme-setting-head">
        <b>Appearance</b>
        <small>Job Timer only</small>
      </div>
      <div class="usx-theme-options" role="group" aria-label="Job Timer appearance">
        <button type="button" class="usx-theme-option" data-usx-theme-choice="light">Light</button>
        <button type="button" class="usx-theme-option" data-usx-theme-choice="dark">Dark</button>
        <button type="button" class="usx-theme-option" data-usx-theme-choice="auto">Auto</button>
      </div>`;
    return wrap;
  }

  function patchControls() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return false;

    const collapse = root.querySelector('header > button[data-action="collapse"]');
    if (collapse && !collapse.querySelector('.usx-collapse-icon')) {
      collapse.replaceChildren(makeCollapseIcon());
    }

    root.querySelectorAll('.jt-x').forEach(button => button.setAttribute('type', 'button'));

    if (root.classList.contains('jt-settings-open')) {
      const settings = root.querySelector('.jt-settings');
      if (settings && !settings.querySelector('.usx-theme-setting')) {
        const themeSetting = makeThemeSettings();
        const heading = settings.querySelector(':scope > h4');
        if (heading) heading.insertAdjacentElement('afterend', themeSetting);
        else settings.prepend(themeSetting);
      }
      syncThemeButtons(root);
    }

    return true;
  }

  document.addEventListener('click', event => {
    const button = event.target.closest?.(`#${ROOT_ID} .usx-theme-option[data-usx-theme-choice]`);
    if (!button) return;
    const theme = button.dataset.usxThemeChoice;
    if (!THEMES.includes(theme)) return;

    event.preventDefault();
    event.stopPropagation();

    document.documentElement.dataset.usxTimerThemePreference = theme;
    document.documentElement.dataset.usxTheme = theme === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    syncThemeButtons();
    window.dispatchEvent(new CustomEvent('USX_SET_TIMER_THEME', { detail: { theme } }));
  }, true);

  injectStyle();
  patchControls();

  const observer = new MutationObserver(() => patchControls());
  observer.observe(document.documentElement, { subtree: true, childList: true });

  const themeObserver = new MutationObserver(() => syncThemeButtons());
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-usx-timer-theme-preference', 'data-usx-theme']
  });
})();
