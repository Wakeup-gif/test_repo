// ==UserScript==
// @name         US Sign Full UI Light Glass Theme
// @namespace    us-sign-full-modules
// @version      1.0.0
// @description  Optimized SquareCoil light cinematic glass with one Bing wallpaper engine, frosted surfaces, the SC lockup, native semantic colors, FullCalendar, and CKEditor. Presentation only; no business actions.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      www.bing.com
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/b0a89382eabdbcb873b3f8d20bcacb05ada7b63c/tampermonkey/US-Sign-Full-UI-Theme-v2.2.7.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__usSignFullUILightGlassThemeV100) return;
  window.__usSignFullUILightGlassThemeV100 = true;

  const root = document.documentElement;
  if (!root) return;

  const ENABLED_KEY = "us-sign-light-glass-v100-enabled";
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

  root.dataset.usSignLightGlassThemeVersion = "1.0.0";
  root.dataset.usSignLightGlassThemeMode = enabled ? "enabled" : "disabled";
  root.dataset.usSignV240Route = routeName;

  if (enabled) {
    root.classList.remove("us-sign-v230", "us-sign-theme-dark-glass", "us-sign-theme-refined-light");
    root.classList.add("us-sign-v240", "us-sign-theme-light-glass");
    root.dataset.usSignActiveSkin = "light";
    root.dataset.usSignActiveSkinVariant = "light-glass";
  }

  if (typeof GM_registerMenuCommand === "function") {
    GM_registerMenuCommand(
      enabled ? "Disable SquareCoil Light Glass v1.0.0" : "Enable SquareCoil Light Glass v1.0.0",
      () => {
        if (typeof GM_setValue === "function") GM_setValue(ENABLED_KEY, !enabled);
        location.reload();
      }
    );
  }

  GM_addStyle(String.raw`
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;650;700&family=Space+Grotesk:wght@500;600;700&display=swap");

html.us-sign-v240.us-sign-theme-light-glass {
  color-scheme: light;
  --usl-page: rgba(230,241,248,.16);
  --usl-page-top: rgba(250,253,255,.18);
  --usl-surface: rgba(255,255,255,.54);
  --usl-surface-soft: rgba(245,250,253,.46);
  --usl-surface-blue: rgba(223,242,254,.64);
  --usl-text: #172532;
  --usl-text-soft: #344858;
  --usl-muted: #667c8d;
  --usl-line: rgba(59,96,122,.18);
  --usl-line-strong: rgba(59,96,122,.30);
  --usl-primary: #4a89dc;
  --usl-info: #3bafda;
  --usl-success: #70ca63;
  --usl-warning: #f6bb42;
  --usl-danger: #e9573f;
  --usl-shadow-sm: 0 8px 22px rgba(28,55,74,.12);
  --usl-shadow-md: 0 18px 42px rgba(28,55,74,.16);
  --usl-font-ui: Manrope, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --usl-font-display: "Space Grotesk", Manrope, system-ui, sans-serif;
  --us-squarecoil-glass: rgba(242,249,253,.62);
  --us-squarecoil-glass-soft: rgba(255,255,255,.48);
  --us-squarecoil-glass-strong: rgba(246,251,254,.74);
  --us-squarecoil-glass-line: rgba(59,96,122,.18);
  --us-squarecoil-live-frost: blur(10px) saturate(112%) brightness(104%);
  --us-squarecoil-live-frost-soft: blur(8px) saturate(108%) brightness(103%);
  background: #d9e8f0 !important;
}

html.us-sign-v240 body,
html.us-sign-v240 #main,
html.us-sign-v240 #content_wrapper,
html.us-sign-v240 #content,
html.us-sign-v240 #content > .tray,
html.us-sign-v240 #content > .tray-center,
html.us-sign-v240 .tray.tray-center {
  color: var(--usl-text) !important;
  background: transparent !important;
  font-family: var(--usl-font-ui) !important;
}

html.us-sign-v240 #us-squarecoil-cinematic-wallpaper .us-squarecoil-cine-layer {
  background-image:
    linear-gradient(180deg,rgba(246,251,254,.22),rgba(232,244,251,.42)),
    var(--us-squarecoil-cine-image) !important;
  background-position: center,center !important;
  background-size: auto,cover !important;
  filter: saturate(.88) brightness(1.08) !important;
}

html.us-sign-v240 :is(h1,h2,h3,h4,h5,h6,.panel-title) {
  color: var(--usl-text) !important;
  font-family: var(--usl-font-display) !important;
  letter-spacing: -.018em !important;
}

html.us-sign-v240 header.navbar,
html.us-sign-v240 .navbar-fixed-top {
  min-height: 58px !important;
  background: linear-gradient(180deg,rgba(255,255,255,.78),rgba(239,248,253,.64)) !important;
  border-bottom: 1px solid var(--usl-line) !important;
  box-shadow: 0 4px 18px rgba(28,62,86,.08) !important;
  -webkit-backdrop-filter: blur(10px) saturate(112%) !important;
  backdrop-filter: blur(10px) saturate(112%) !important;
}

html.us-sign-v240 body header.navbar .navbar-branding .navbar-brand {
  display: inline-flex !important;
  align-items: center !important;
  gap: 10px !important;
  min-width: 176px !important;
  overflow: visible !important;
  padding-right: 10px !important;
  font-size: 0 !important;
  line-height: 1 !important;
}

html.us-sign-v240 body header.navbar .navbar-branding .navbar-brand img {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  opacity: 0 !important;
}

html.us-sign-v240 body header.navbar .navbar-branding .navbar-brand::before {
  content: "SC" !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 32px !important;
  width: 32px !important;
  height: 32px !important;
  color: #061725 !important;
  background: linear-gradient(145deg,#8ad7ff,#3a99dc) !important;
  border: 1px solid rgba(42,118,170,.32) !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 20px rgba(42,136,204,.22),inset 0 1px 0 rgba(255,255,255,.58) !important;
  font-family: var(--usl-font-display) !important;
  font-size: 12px !important;
  font-weight: 700 !important;
}

html.us-sign-v240 body header.navbar .navbar-branding .navbar-brand::after {
  content: "SquareCoil" !important;
  color: var(--usl-text) !important;
  font-family: var(--usl-font-display) !important;
  font-size: 17px !important;
  font-weight: 700 !important;
  letter-spacing: -.03em !important;
  white-space: nowrap !important;
}

html.us-sign-v240 #topbar {
  color: var(--usl-text-soft) !important;
  background: rgba(240,248,252,.56) !important;
  border-bottom: 1px solid var(--usl-line) !important;
}

html.us-sign-v240 #sidebar_left {
  color: var(--usl-text) !important;
  background: linear-gradient(180deg,rgba(247,251,254,.70),rgba(224,239,247,.60)) !important;
  border-right: 1px solid var(--usl-line) !important;
  box-shadow: 4px 0 18px rgba(23,49,67,.12) !important;
  -webkit-backdrop-filter: blur(10px) saturate(110%) !important;
  backdrop-filter: blur(10px) saturate(110%) !important;
}

html.us-sign-v240 #sidebar_left :is(a,.sidebar-title,.sidebar-label,.menu-row) {
  color: var(--usl-text-soft) !important;
}

html.us-sign-v240 #sidebar_left .active > a,
html.us-sign-v240 #sidebar_left .nav > li.active > a {
  background: linear-gradient(90deg,rgba(74,137,220,.32),rgba(59,175,218,.12)) !important;
  border-left: 3px solid #69b9ec !important;
}

html.us-sign-v240 header.navbar .navbar-right > li > .dropdown-toggle,
html.us-sign-v240 .navbar-fixed-top .navbar-right > li > .dropdown-toggle {
  color: var(--usl-text-soft) !important;
  background: transparent !important;
  box-shadow: none !important;
}

html.us-sign-v240 header.navbar .navbar-right > li > .dropdown-toggle:is(:hover,:focus,:focus-visible),
html.us-sign-v240 header.navbar .navbar-right > li.open > .dropdown-toggle,
html.us-sign-v240 .navbar-fixed-top .navbar-right > li > .dropdown-toggle:is(:hover,:focus,:focus-visible),
html.us-sign-v240 .navbar-fixed-top .navbar-right > li.open > .dropdown-toggle {
  color: #1b527b !important;
  background: rgba(110,190,242,.20) !important;
  box-shadow: inset 0 -2px 0 rgba(47,126,184,.50) !important;
}

html.us-sign-v240 :is(.panel,.well,.modal-content,.popover,.tab-content) {
  color: var(--usl-text-soft) !important;
  background: linear-gradient(180deg,rgba(255,255,255,.58),rgba(242,249,253,.46)) !important;
  border: 1px solid var(--usl-line) !important;
  border-radius: 12px !important;
  box-shadow: var(--usl-shadow-sm) !important;
  -webkit-backdrop-filter: blur(10px) saturate(110%) !important;
  backdrop-filter: blur(10px) saturate(110%) !important;
}

html.us-sign-v240 :is(.panel,.well,.modal-content,.popover,.tab-content) :is(.panel,.well,.panel-body,.panel-heading,.panel-footer) {
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

html.us-sign-v240 :is(.panel-heading,.panel-footer,.modal-header,.modal-footer) {
  color: var(--usl-text) !important;
  background: rgba(255,255,255,.30) !important;
  border-color: var(--usl-line) !important;
}

html.us-sign-v240 .navbar .dropdown-menu.list-group.dropdown-persist {
  overflow: hidden !important;
  color: var(--usl-text-soft) !important;
  background: rgba(250,253,255,.82) !important;
  border: 1px solid var(--usl-line) !important;
  border-top: 3px solid var(--usl-primary) !important;
  border-radius: 10px !important;
  box-shadow: var(--usl-shadow-md) !important;
  -webkit-backdrop-filter: blur(8px) saturate(108%) !important;
  backdrop-filter: blur(8px) saturate(108%) !important;
}

html.us-sign-v240 .navbar .dropdown-menu.list-group.dropdown-persist > :is(li,.list-group-item,.dropdown-footer) {
  color: var(--usl-text-soft) !important;
  background: transparent !important;
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
  background: rgba(255,255,255,.68) !important;
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
  background: rgba(255,255,255,.66) !important;
  border: 1px solid var(--usl-line-strong) !important;
  border-radius: 8px !important;
  box-shadow: 0 1px 3px rgba(31,63,84,.06) !important;
  font-family: var(--usl-font-ui) !important;
}

html.us-sign-v240 .btn:hover {
  color: #1f5f93 !important;
  background: rgba(226,243,254,.84) !important;
  border-color: #91b7d5 !important;
}

html.us-sign-v240 .btn-primary { color:#fff !important; background:var(--usl-primary) !important; border-color:#3978c5 !important; }
html.us-sign-v240 .btn-info { color:#fff !important; background:var(--usl-info) !important; border-color:#269dc9 !important; }
html.us-sign-v240 .btn-success { color:#173a1d !important; background:var(--usl-success) !important; border-color:#58b64b !important; }
html.us-sign-v240 .btn-warning { color:#4a3708 !important; background:var(--usl-warning) !important; border-color:#df9f22 !important; }
html.us-sign-v240 .btn-danger { color:#fff !important; background:var(--usl-danger) !important; border-color:#d94730 !important; }

html.us-sign-v240 :is(table,.table,table.dataTable) {
  color: var(--usl-text-soft) !important;
  background: rgba(255,255,255,.52) !important;
  border-color: var(--usl-line) !important;
}

html.us-sign-v240 :is(table,.table,table.dataTable) :is(th,td) {
  color: var(--usl-text-soft) !important;
  background: transparent !important;
  border-color: #e1eaf0 !important;
}

html.us-sign-v240 :is(table,.table,table.dataTable) thead th {
  color: #29465d !important;
  background: rgba(239,248,253,.62) !important;
  font-weight: 700 !important;
}

html.us-sign-v240 :is(table,.table,table.dataTable) tbody tr:hover > * {
  background: rgba(223,242,254,.48) !important;
}

html.us-sign-v240 :is(.select2-container--default .select2-selection--single,.select2-container--default .select2-selection--multiple,.select2-dropdown,.ui-datepicker,.ui-autocomplete,.daterangepicker,.bootstrap-datetimepicker-widget,.multiselect-container) {
  color: var(--usl-text) !important;
  background: rgba(255,255,255,.82) !important;
  border-color: var(--usl-line-strong) !important;
  box-shadow: var(--usl-shadow-sm) !important;
}

html.us-sign-v240 .select2-results__option--highlighted {
  color: #fff !important;
  background: var(--usl-primary) !important;
}

html.us-sign-v240[data-us-sign-v240-route="install-calendar"] .fc :is(th,td,.fc-axis,.fc-day-header,.fc-widget-header,.fc-widget-content) {
  color: var(--usl-text-soft) !important;
  background: rgba(255,255,255,.56) !important;
  border-color: var(--usl-line) !important;
}

html.us-sign-v240[data-us-sign-v240-route="install-calendar"] .fc .fc-other-month {
  color: #9aabb8 !important;
  background: rgba(235,245,250,.48) !important;
}

html.us-sign-v240[data-us-sign-v240-route="install-calendar"] .fc .fc-today {
  background: rgba(210,237,253,.66) !important;
  box-shadow: inset 0 0 0 1px rgba(74,137,220,.30) !important;
}

html.us-sign-v240[data-us-sign-v240-route="install-calendar"] .fc .fc-event {
  color: var(--usl-text) !important;
  background: rgba(255,255,255,.86) !important;
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
  background: rgba(249,252,254,.72) !important;
  border-color: var(--usl-line) !important;
  box-shadow: none !important;
}

html.us-sign-v240 .cke_top,
html.us-sign-v240 .cke_toolbox,
html.us-sign-v240 .cke_toolgroup,
html.us-sign-v240 .cke_combo_button {
  color: var(--usl-text-soft) !important;
  background: rgba(229,241,248,.76) !important;
  border-color: var(--usl-line) !important;
}

html.us-sign-v240 iframe.cke_wysiwyg_frame {
  color: var(--usl-text) !important;
  background: rgba(255,255,255,.92) !important;
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

html.us-sign-v240 #pmlt,
html.us-sign-v240 #project_menu {
  color: var(--usl-text-soft) !important;
  background: linear-gradient(180deg,rgba(250,253,255,.62),rgba(230,242,249,.52)) !important;
  border-color: var(--usl-line) !important;
  -webkit-backdrop-filter: blur(10px) saturate(110%) !important;
  backdrop-filter: blur(10px) saturate(110%) !important;
}

html.us-sign-v240 #project_menu {
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
  overflow: hidden !important;
  border-radius: 9px !important;
}

html.us-sign-v240 #project_menu a {
  display: flex !important;
  align-items: center !important;
  min-height: 29px !important;
  padding: 5px 10px !important;
  color: var(--usl-text-soft) !important;
  border-left: 2px solid transparent !important;
}

html.us-sign-v240 #project_menu a:is(:hover,.selected) {
  color: #174d75 !important;
  background: rgba(105,185,236,.22) !important;
  border-left-color: #3f99d4 !important;
}

html.us-sign-v240 #pmlt > div:has(> #duplicate) {
  display: flex !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  gap: 4px !important;
}

html.us-sign-v240 #pmlt > div:has(> #duplicate) > :is(a,button,.btn) {
  flex: 0 0 auto !important;
  margin: 0 !important;
  white-space: nowrap !important;
}

@media (max-width: 767px) {
  html.us-sign-v240 body header.navbar .navbar-branding .navbar-brand {
    gap: 0 !important;
    min-width: 46px !important;
  }
  html.us-sign-v240 body header.navbar .navbar-branding .navbar-brand::after {
    content: none !important;
    display: none !important;
  }
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

  function prepareBrandLockup() {
    if (!enabled) return;
    const brand = document.querySelector("header.navbar .navbar-branding .navbar-brand");
    if (!brand) return;
    brand.dataset.usSignLightGlassBrand = "true";
    const image = brand.querySelector("img");
    if (image) image.alt = image.alt || "SquareCoil";
  }

  const EDITOR_STYLE_ID = "us-sign-light-glass-v100-ckeditor-document";
  const observedEditorFrames = new WeakSet();

  function applyEditorDocumentTheme(iframe) {
    if (!iframe) return;
    iframe.style.setProperty("background", "#f8fbfd", "important");
    iframe.style.setProperty("background-color", "#f8fbfd", "important");
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
              background: #f8fbfd !important;
              background-color: #f8fbfd !important;
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

  for (const delay of [0, 500, 1500]) window.setTimeout(scanEditorFrames, delay);
  for (const delay of [0, 500, 1500]) window.setTimeout(prepareBrandLockup, delay);
  window.addEventListener("pageshow", scanEditorFrames);
  window.addEventListener("pageshow", prepareBrandLockup);
  window.addEventListener("us-sign-location-change", () => window.setTimeout(scanEditorFrames, 100));
  window.addEventListener("us-sign-location-change", () => window.setTimeout(prepareBrandLockup, 100));
})();
