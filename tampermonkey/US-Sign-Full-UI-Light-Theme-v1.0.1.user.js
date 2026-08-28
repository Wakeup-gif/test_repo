// ==UserScript==
// @name         US Sign Full UI Light Theme
// @namespace    us-sign-full-modules
// @version      1.0.1
// @description  Refined SquareCoil light skin with the current US Sign logo, native semantic palette, corrected dropdowns, forms, FullCalendar, and CKEditor.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  if (window.__usSignFullUILightThemeV101) return;
  window.__usSignFullUILightThemeV101 = true;

  const root = document.documentElement;
  if (!root) return;

  const ENABLED_KEY = "us-sign-light-v100-enabled";
  const CUSTOM_LOGO_DATA_URL = "data:image/png;base64,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";
  const enabled = typeof GM_getValue === "function" ? GM_getValue(ENABLED_KEY, true) !== false : true;

  const routeName = (() => {
    const path = location.pathname.toLowerCase();
    if (path.endsWith("/dashboard.php")) return "dashboard";
    if (path.endsWith("/leads.php")) return "leads";
    if (path.endsWith("/calendar.php")) return "install-calendar";
    if (path.endsWith("/vacation_calendar.php")) return "vacation-calendar";
    if (path.endsWith("/project_milestones.php")) return "project-milestones";
    if (path.endsWith("/project_designs.php") || path.endsWith("/edit_design.php")) return "project-designs";
    if (path.endsWith("/project_tasks.php")) return "project-tasks";
    if (path.endsWith("/project.php")) return "project-overview";
    if (path.endsWith("/projects.php")) return "projects";
    if (path.endsWith("/shopping_list.php")) return "shopping-list";
    if (path.includes("report")) return "report";
    return "generic";
  })();

  root.dataset.usSignLightThemeVersion = "1.0.1";
  root.dataset.usSignLightThemeMode = enabled ? "enabled" : "disabled";
  root.dataset.usSignV240Route = routeName;

  if (enabled) {
    root.classList.remove("us-sign-v230", "us-sign-theme-dark-glass");
    root.classList.add("us-sign-v240", "us-sign-theme-refined-light");
    root.dataset.usSignActiveSkin = "light";
  }

  if (typeof GM_registerMenuCommand === "function") {
    GM_registerMenuCommand(
      enabled ? "Disable SquareCoil Light v1.0.1" : "Enable SquareCoil Light v1.0.1",
      () => {
        if (typeof GM_setValue === "function") GM_setValue(ENABLED_KEY, !enabled);
        location.reload();
      }
    );
  }

  GM_addStyle(String.raw`
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;650;700&family=Space+Grotesk:wght@500;600;700&display=swap");

html.us-sign-v240 {
  color-scheme: light;
  --usl-page: #edf4f8;
  --usl-page-top: #f8fbfd;
  --usl-surface: rgba(255,255,255,.96);
  --usl-surface-soft: #f4f8fb;
  --usl-surface-blue: #edf6fd;
  --usl-text: #1b2935;
  --usl-text-soft: #3b4d5d;
  --usl-muted: #6f8191;
  --usl-line: #d3e0e9;
  --usl-line-strong: #b6cad9;
  --usl-primary: #4a89dc;
  --usl-info: #3bafda;
  --usl-success: #70ca63;
  --usl-warning: #f6bb42;
  --usl-danger: #e9573f;
  --usl-shadow-sm: 0 3px 12px rgba(33,62,82,.07);
  --usl-shadow-md: 0 10px 28px rgba(33,62,82,.10);
  --usl-font-ui: Manrope, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --usl-font-display: "Space Grotesk", Manrope, system-ui, sans-serif;
}

html.us-sign-v240 body,
html.us-sign-v240 #main,
html.us-sign-v240 #content_wrapper,
html.us-sign-v240 #content,
html.us-sign-v240 #content > .tray,
html.us-sign-v240 #content > .tray-center,
html.us-sign-v240 .tray.tray-center {
  color: var(--usl-text) !important;
  background: linear-gradient(180deg,var(--usl-page-top) 0,var(--usl-page) 52%,#e8f0f5 100%) !important;
  font-family: var(--usl-font-ui) !important;
}

html.us-sign-v240 :is(h1,h2,h3,h4,h5,h6,.panel-title) {
  color: var(--usl-text) !important;
  font-family: var(--usl-font-display) !important;
  letter-spacing: -.018em !important;
}

html.us-sign-v240 header.navbar,
html.us-sign-v240 .navbar-fixed-top {
  min-height: 58px !important;
  background: rgba(255,255,255,.97) !important;
  border-bottom: 1px solid var(--usl-line) !important;
  box-shadow: 0 4px 18px rgba(28,62,86,.08) !important;
  -webkit-backdrop-filter: blur(14px) saturate(118%) !important;
  backdrop-filter: blur(14px) saturate(118%) !important;
}

html.us-sign-v240 header.navbar img[data-us-sign-light-logo="true"] {
  display: block !important;
  visibility: visible !important;
  width: auto !important;
  height: 46px !important;
  max-height: 46px !important;
  padding: 3px 8px !important;
  object-fit: contain !important;
  opacity: 1 !important;
  background: linear-gradient(135deg,rgba(15,35,50,.98),rgba(20,51,70,.94)) !important;
  border: 1px solid rgba(74,137,220,.36) !important;
  border-radius: 9px !important;
  box-shadow: 0 5px 14px rgba(20,48,67,.18),inset 0 1px 0 rgba(255,255,255,.12) !important;
}

html.us-sign-v240 #topbar {
  color: var(--usl-text-soft) !important;
  background: rgba(238,246,251,.94) !important;
  border-bottom: 1px solid var(--usl-line) !important;
}

html.us-sign-v240 #sidebar_left {
  background: linear-gradient(180deg,#152433 0,#10202e 100%) !important;
  border-right: 1px solid #0b1924 !important;
  box-shadow: 4px 0 18px rgba(23,49,67,.12) !important;
}

html.us-sign-v240 #sidebar_left .active > a,
html.us-sign-v240 #sidebar_left .nav > li.active > a {
  background: linear-gradient(90deg,rgba(74,137,220,.32),rgba(59,175,218,.12)) !important;
  border-left: 3px solid #69b9ec !important;
}

html.us-sign-v240 :is(.panel,.well,.modal-content,.popover,.tab-content) {
  color: var(--usl-text-soft) !important;
  background: var(--usl-surface) !important;
  border: 1px solid var(--usl-line) !important;
  border-radius: 12px !important;
  box-shadow: var(--usl-shadow-sm) !important;
}

html.us-sign-v240 :is(.panel-heading,.panel-footer,.modal-header,.modal-footer) {
  color: var(--usl-text) !important;
  background: linear-gradient(180deg,#fbfdff,#f2f7fa) !important;
  border-color: var(--usl-line) !important;
}

html.us-sign-v240 .navbar .dropdown-menu.list-group.dropdown-persist {
  overflow: hidden !important;
  color: var(--usl-text-soft) !important;
  background: rgba(255,255,255,.99) !important;
  border: 1px solid var(--usl-line) !important;
  border-top: 3px solid var(--usl-primary) !important;
  border-radius: 10px !important;
  box-shadow: var(--usl-shadow-md) !important;
}

html.us-sign-v240 .navbar .dropdown-menu.list-group.dropdown-persist > :is(li,.list-group-item,.dropdown-footer) {
  color: var(--usl-text-soft) !important;
  background: #fff !important;
  border-color: #e5edf3 !important;
}

html.us-sign-v240 .navbar .dropdown-menu.list-group.dropdown-persist :is(a,button) {
  color: #36556d !important;
  background: transparent !important;
}

html.us-sign-v240 .navbar .dropdown-menu.list-group.dropdown-persist :is(a,button):is(:hover,:focus-visible) {
  color: #1d5b8e !important;
  background: var(--usl-surface-blue) !important;
}

html.us-sign-v240 :is(.form-control,.gui-input,.gui-textarea,input[type="text"],input[type="search"],input[type="number"],input[type="email"],input[type="date"],input[type="time"],input[type="password"],textarea,select) {
  color: var(--usl-text) !important;
  caret-color: var(--usl-primary) !important;
  background: #fff !important;
  border: 1px solid var(--usl-line-strong) !important;
  border-radius: 8px !important;
  box-shadow: inset 0 1px 2px rgba(31,63,84,.035) !important;
  font-family: var(--usl-font-ui) !important;
  color-scheme: light !important;
}

html.us-sign-v240 select option {
  color: var(--usl-text) !important;
  background: #fff !important;
}

html.us-sign-v240 :is(input,textarea)::placeholder {
  color: var(--usl-muted) !important;
  opacity: .82 !important;
}

html.us-sign-v240 :is(.form-control,.gui-input,input,textarea,select,a,button,.btn,[tabindex]):focus-visible {
  outline: 2px solid var(--usl-primary) !important;
  outline-offset: 2px !important;
  border-color: #72a9e7 !important;
  box-shadow: 0 0 0 4px rgba(74,137,220,.14) !important;
}

html.us-sign-v240 .btn {
  color: #31495d !important;
  background: #fff !important;
  border: 1px solid var(--usl-line-strong) !important;
  border-radius: 8px !important;
  box-shadow: 0 1px 3px rgba(31,63,84,.06) !important;
  font-family: var(--usl-font-ui) !important;
}

html.us-sign-v240 .btn:hover {
  color: #1f5f93 !important;
  background: #f0f7fc !important;
  border-color: #91b7d5 !important;
}

html.us-sign-v240 .btn-primary { color:#fff !important; background:var(--usl-primary) !important; border-color:#3978c5 !important; }
html.us-sign-v240 .btn-info { color:#fff !important; background:var(--usl-info) !important; border-color:#269dc9 !important; }
html.us-sign-v240 .btn-success { color:#173a1d !important; background:var(--usl-success) !important; border-color:#58b64b !important; }
html.us-sign-v240 .btn-warning { color:#4a3708 !important; background:var(--usl-warning) !important; border-color:#df9f22 !important; }
html.us-sign-v240 .btn-danger { color:#fff !important; background:var(--usl-danger) !important; border-color:#d94730 !important; }

html.us-sign-v240 :is(table,.table,table.dataTable) {
  color: var(--usl-text-soft) !important;
  background: #fff !important;
  border-color: var(--usl-line) !important;
}

html.us-sign-v240 :is(table,.table,table.dataTable) :is(th,td) {
  color: var(--usl-text-soft) !important;
  background: transparent !important;
  border-color: #e1eaf0 !important;
}

html.us-sign-v240 :is(table,.table,table.dataTable) thead th {
  color: #29465d !important;
  background: linear-gradient(180deg,#f8fbfd,#edf4f8) !important;
  font-weight: 700 !important;
}

html.us-sign-v240 :is(table,.table,table.dataTable) tbody tr:hover > * {
  background: #f1f7fb !important;
}

html.us-sign-v240 :is(.select2-container--default .select2-selection--single,.select2-container--default .select2-selection--multiple,.select2-dropdown,.ui-datepicker,.ui-autocomplete,.daterangepicker,.bootstrap-datetimepicker-widget,.multiselect-container) {
  color: var(--usl-text) !important;
  background: #fff !important;
  border-color: var(--usl-line-strong) !important;
  box-shadow: var(--usl-shadow-sm) !important;
}

html.us-sign-v240 .select2-results__option--highlighted {
  color: #fff !important;
  background: var(--usl-primary) !important;
}

html.us-sign-v240[data-us-sign-v240-route="install-calendar"] .fc :is(th,td,.fc-axis,.fc-day-header,.fc-widget-header,.fc-widget-content) {
  color: var(--usl-text-soft) !important;
  background: rgba(255,255,255,.88) !important;
  border-color: var(--usl-line) !important;
}

html.us-sign-v240[data-us-sign-v240-route="install-calendar"] .fc .fc-other-month {
  color: #9aabb8 !important;
  background: #f4f8fb !important;
}

html.us-sign-v240[data-us-sign-v240-route="install-calendar"] .fc .fc-today {
  background: #e5f2fc !important;
  box-shadow: inset 0 0 0 1px rgba(74,137,220,.30) !important;
}

html.us-sign-v240[data-us-sign-v240-route="install-calendar"] .fc .fc-event {
  color: var(--usl-text) !important;
  background: rgba(255,255,255,.98) !important;
  border-width: 2px !important;
  border-style: solid !important;
  border-radius: 7px !important;
  box-shadow: 0 4px 12px rgba(32,61,81,.11) !important;
}

html.us-sign-v240[data-us-sign-v240-route="install-calendar"] .fc .fc-event :is(.fc-content,.fc-title,.event-title) {
  color: var(--usl-text) !important;
}

html.us-sign-v240[data-us-sign-v240-route="install-calendar"] .fc .fc-event .cp {
  height: 6px !important;
  background: #edf3f7 !important;
  border: 1px solid #c5d4df !important;
  border-radius: 999px !important;
  box-shadow: inset 0 1px 2px rgba(31,63,84,.08) !important;
}

html.us-sign-v240 :is(.cke,.cke_inner,.cke_top,.cke_bottom,.cke_contents) {
  color: var(--usl-text-soft) !important;
  background: #fff !important;
  border-color: var(--usl-line) !important;
  box-shadow: none !important;
}

html.us-sign-v240 .cke_top,
html.us-sign-v240 .cke_toolbox,
html.us-sign-v240 .cke_toolgroup,
html.us-sign-v240 .cke_combo_button {
  color: var(--usl-text-soft) !important;
  background: #edf4f8 !important;
  border-color: var(--usl-line) !important;
}

html.us-sign-v240 iframe.cke_wysiwyg_frame {
  color: var(--usl-text) !important;
  background: #fff !important;
  color-scheme: light !important;
}

html.us-sign-v240 .cke_button_icon {
  filter: none !important;
  opacity: .74 !important;
}

html.us-sign-v240 .cke_button:is(:hover,:focus-visible) .cke_button_icon,
html.us-sign-v240 .cke_button_on .cke_button_icon { opacity: 1 !important; }
html.us-sign-v240 .cke_button_disabled .cke_button_icon { opacity: .30 !important; }

html.us-sign-v240 :is(.bg-info,.label-info,.alert-info) { color:#123845 !important; background:var(--usl-info) !important; }
html.us-sign-v240 :is(.bg-success,.label-success,.alert-success) { color:#173a1d !important; background:var(--usl-success) !important; }
html.us-sign-v240 :is(.bg-warning,.label-warning,.alert-warning) { color:#4a3708 !important; background:var(--usl-warning) !important; }
html.us-sign-v240 :is(.bg-danger,.label-danger,.alert-danger) { color:#fff !important; background:var(--usl-danger) !important; }

html.us-sign-v240[data-us-sign-v240-route="dashboard"] :is(#widget-tasks,#widget-designs,#widget-estimates,.widget-task) {
  border: 0 !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 22px rgba(31,63,84,.12) !important;
}

@media (max-width: 1100px) {
  html.us-sign-v240 body.mobile-view.sb-l-m #content_wrapper,
  html.us-sign-v240 body.mobile-view.sb-l-m #topbar,
  html.us-sign-v240 body.mobile-view.sb-l-m #content {
    left: 0 !important;
    margin-left: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  html.us-sign-v240 #content :is(.panel-body,.tab-content,.table-responsive) {
    max-width: 100% !important;
    overflow-x: auto !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  html.us-sign-v240 *, html.us-sign-v240 *::before, html.us-sign-v240 *::after {
    scroll-behavior: auto !important;
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}

@media (forced-colors: active) {
  html.us-sign-v240, html.us-sign-v240 body, html.us-sign-v240 #main,
  html.us-sign-v240 #content_wrapper, html.us-sign-v240 #content,
  html.us-sign-v240 header.navbar, html.us-sign-v240 #sidebar_left,
  html.us-sign-v240 :is(.panel,.well,.modal-content,.dropdown-menu,.popover,table,.table) {
    color: CanvasText !important;
    background: Canvas !important;
    border-color: CanvasText !important;
    box-shadow: none !important;
  }
  html.us-sign-v240 :focus-visible { outline: 2px solid Highlight !important; }
}

@media print {
  html.us-sign-v240, html.us-sign-v240 body, html.us-sign-v240 #main,
  html.us-sign-v240 #content_wrapper, html.us-sign-v240 #content,
  html.us-sign-v240 :is(.panel,.well,table,.table,th,td) {
    color: #111 !important;
    background: #fff !important;
    border-color: #bbb !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }
}

`);

  function findHeaderLogo() {
    return (
      document.querySelector("header.navbar .navbar-brand img") ||
      document.querySelector(".navbar-branding .navbar-brand img") ||
      document.querySelector('img[src*="US-Sign" i]') ||
      document.querySelector('img[src*="USSIGN" i]')
    );
  }

  function applyLogo(dataUrl) {
    const logo = findHeaderLogo();
    if (!logo || !dataUrl) return false;
    logo.dataset.usSignOriginalSrc = logo.dataset.usSignOriginalSrc || logo.getAttribute("src") || "";
    logo.src = dataUrl;
    logo.removeAttribute("srcset");
    logo.dataset.usSignLightLogo = "true";
    logo.alt = logo.alt || "US Sign & Mill";
    return true;
  }

  function restoreCustomLogo() {
    if (!enabled) return;
    applyLogo(CUSTOM_LOGO_DATA_URL);
  }

  const EDITOR_STYLE_ID = "us-sign-light-v101-ckeditor-document";
  const observedEditorFrames = new WeakSet();

  function applyEditorDocumentTheme(iframe) {
    if (!iframe) return;
    iframe.style.setProperty("background", "#ffffff", "important");
    iframe.style.setProperty("background-color", "#ffffff", "important");
    iframe.style.setProperty("border", "0", "important");
    iframe.style.setProperty("color-scheme", "light", "important");

    const apply = () => {
      try {
        const editorDocument = iframe.contentDocument;
        if (!editorDocument?.documentElement || !editorDocument?.body) return;
        let style = editorDocument.getElementById(EDITOR_STYLE_ID);
        if (!style) {
          style = editorDocument.createElement("style");
          style.id = EDITOR_STYLE_ID;
          style.textContent = `
            html, body, body.cke_editable, body.cke_editable_themed {
              color: #243441 !important;
              background: #ffffff !important;
              background-color: #ffffff !important;
              background-image: none !important;
              caret-color: #2f78bd !important;
              color-scheme: light !important;
              font-family: Manrope, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
              line-height: 1.58 !important;
            }
            body { padding: 14px 18px !important; }
            a { color: #2f78bd !important; }
            strong, b, h1, h2, h3, h4, h5, h6 { color: #172532 !important; }
            font[color="black"], font[color="#000000"], [style*="color: black" i], [style*="#000000" i], [style*="rgb(0, 0, 0)" i] { color: #243441 !important; }
            font[color="blue"], [style*="color: blue" i], [style*="#0000ff" i] { color: #236ea7 !important; }
            font[color="red"], [style*="color: red" i], [style*="#ff0000" i] { color: #b84135 !important; }
            font[color="green"], [style*="color: green" i], [style*="#008000" i] { color: #2f7d3d !important; }
          `;
          (editorDocument.head || editorDocument.documentElement).appendChild(style);
        }
      } catch (_) {}
    };

    if (!observedEditorFrames.has(iframe)) {
      observedEditorFrames.add(iframe);
      iframe.addEventListener("load", apply, { once: true });
    }
    apply();
  }

  function scanEditorFrames() {
    if (!enabled) return;
    for (const iframe of document.querySelectorAll("iframe.cke_wysiwyg_frame")) applyEditorDocumentTheme(iframe);
  }

  for (const delay of [0, 350, 1000, 2400]) window.setTimeout(scanEditorFrames, delay);
  for (const delay of [0, 350, 1000, 2400]) window.setTimeout(restoreCustomLogo, delay);
  window.addEventListener("pageshow", scanEditorFrames);
  window.addEventListener("pageshow", restoreCustomLogo);
  window.addEventListener("us-sign-location-change", () => window.setTimeout(scanEditorFrames, 100));
  window.addEventListener("us-sign-location-change", () => window.setTimeout(restoreCustomLogo, 100));
})();
