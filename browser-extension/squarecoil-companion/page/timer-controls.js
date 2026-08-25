(() => {
  'use strict';

  if (window.__usxTimerControlsV010) return;
  window.__usxTimerControlsV010 = true;

  const ROOT_ID = 'ussign-job-timer';
  const STYLE_ID = 'usx-timer-controls-v010';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
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
html[data-usx-theme="light"] #${ROOT_ID} .jt-row b {
  color: #343a40 !important;
}
html[data-usx-theme="light"] #${ROOT_ID} .jt-main-head span,
html[data-usx-theme="light"] #${ROOT_ID} .jt-row small,
html[data-usx-theme="light"] #${ROOT_ID} .jt-archive-empty {
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

  function patchControls() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return false;

    const collapse = root.querySelector('header > button[data-action="collapse"]');
    if (collapse && !collapse.querySelector('.usx-collapse-icon')) {
      collapse.replaceChildren(makeCollapseIcon());
    }

    root.querySelectorAll('.jt-x').forEach(button => {
      button.setAttribute('type', 'button');
    });
    return true;
  }

  injectStyle();
  patchControls();

  const observer = new MutationObserver(() => patchControls());
  observer.observe(document.documentElement, { subtree: true, childList: true });
})();
