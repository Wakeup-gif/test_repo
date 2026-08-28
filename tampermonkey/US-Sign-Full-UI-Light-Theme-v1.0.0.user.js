// ==UserScript==
// @name         US Sign Full UI Light Theme
// @namespace    us-sign-full-modules
// @version      1.0.0
// @description  Refined SquareCoil light skin using the native blue, cyan, green, gold, and red semantic palette with corrected dropdowns, forms, FullCalendar, and CKEditor.
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

  if (window.__usSignFullUILightThemeV100) return;
  window.__usSignFullUILightThemeV100 = true;

  const root = document.documentElement;
  if (!root) return;

  const ENABLED_KEY = "us-sign-light-v100-enabled";
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

  root.dataset.usSignLightThemeVersion = "1.0.0";
  root.dataset.usSignLightThemeMode = enabled ? "enabled" : "disabled";
  root.dataset.usSignV240Route = routeName;

  if (enabled) {
    root.classList.remove("us-sign-v230", "us-sign-theme-dark-glass");
    root.classList.add("us-sign-v240", "us-sign-theme-refined-light");
    root.dataset.usSignActiveSkin = "light";
  }

  if (typeof GM_registerMenuCommand === "function") {
    GM_registerMenuCommand(
      enabled ? "Disable SquareCoil Light v1.0.0" : "Enable SquareCoil Light v1.0.0",
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

  const EDITOR_STYLE_ID = "us-sign-light-v100-ckeditor-document";
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
  window.addEventListener("pageshow", scanEditorFrames);
  window.addEventListener("us-sign-location-change", () => window.setTimeout(scanEditorFrames, 100));
})();
