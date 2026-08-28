// ==UserScript==
// @name         US Sign Full UI Theme v2.3.4
// @name:en      US Sign Full UI Theme v2.3.4
// @namespace    us-sign-full-modules
// @version      2.3.4
// @description  Optimized SquareCoil dark cinematic glass with one wallpaper engine, lighter transparency, corrected top-nav hover, inline project actions, FullCalendar, and CKEditor contrast. Presentation only; no business actions.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      www.bing.com
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/0e6e6ef36534b33383358b4223ae1ae9054848aa/tampermonkey/US-Sign-Full-UI-Theme-v2.2.6-static-base.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/b0a89382eabdbcb873b3f8d20bcacb05ada7b63c/tampermonkey/US-Sign-Full-UI-Theme-v2.2.7.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__usSignFullUIThemeV234) return;
  window.__usSignFullUIThemeV234 = true;

  const root = document.documentElement;
  if (!root) return;

  const ENABLED_KEY = "us-sign-v234-dark-adapter-enabled";
  const enabled = typeof GM_getValue === "function" ? GM_getValue(ENABLED_KEY, true) !== false : true;

  root.dataset.usSignThemeAuditVersion = "2.3.4";
  root.dataset.usSignThemeAuditMode = enabled ? "enabled" : "disabled";

  const routeName = (() => {
    const path = location.pathname.toLowerCase();
    if (path.endsWith("/dashboard.php")) return "dashboard";
    if (path.endsWith("/project_milestones.php")) return "project-milestones";
    if (path.endsWith("/project_designs.php")) return "project-designs";
    if (path.endsWith("/project_tasks.php")) return "project-tasks";
    if (path.endsWith("/project_documents.php")) return "project-documents";
    if (path.endsWith("/project_site_photos.php")) return "project-photos";
    if (path.endsWith("/project.php")) return "project-overview";
    if (path.endsWith("/projects.php")) return "projects";
    if (path.endsWith("/leads.php")) return "leads";
    if (path.endsWith("/shopping_list.php")) return "shopping-list";
    if (path.endsWith("/purchase_orders.php")) return "purchase-orders";
    if (path.endsWith("/tracking.php")) return "tracking";
    if (path.endsWith("/receiving.php")) return "receiving";
    if (path.endsWith("/schedule.php")) return "schedule";
    if (path.endsWith("/calendar.php")) return "install-calendar";
    if (path.endsWith("/vacation_calendar.php")) return "vacation-calendar";
    if (path.endsWith("/active_inventory.php")) return "active-inventory";
    if (path.endsWith("/sign_criteria.php")) return "sign-criteria";
    if (path.endsWith("/branding.php")) return "branding";
    if (path.includes("report")) return "report";
    return "generic";
  })();

  root.dataset.usSignV230Route = routeName;
  if (enabled && root.dataset.usSignActiveSkin !== "light") {
    root.classList.add("us-sign-v230");
    root.dataset.usSignActiveSkin = "dark";
  } else if (root.dataset.usSignActiveSkin === "light") {
    root.classList.remove("us-sign-v230", "us-sign-theme-dark-glass");
  }

  if (typeof GM_registerMenuCommand === "function") {
    GM_registerMenuCommand(
      enabled ? "Disable SquareCoil Dark v2.3.4" : "Enable SquareCoil Dark v2.3.4",
      () => {
        if (typeof GM_setValue === "function") GM_setValue(ENABLED_KEY, !enabled);
        location.reload();
      }
    );
  }

  GM_addStyle(String.raw`
    @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;650;700&family=Space+Grotesk:wght@500;600;700&display=swap");

    html.us-sign-v230 {
      color-scheme: dark;
      --v230-page: rgba(5,11,17,.12);
      --v230-shell: rgba(7,15,23,.62);
      --v230-shell-strong: rgba(5,12,19,.76);
      --v230-surface: rgba(9,18,27,.57);
      --v230-surface-strong: rgba(7,15,23,.74);
      --v230-surface-soft: rgba(255,255,255,.035);
      --v230-surface-hover: rgba(97,174,247,.085);
      --v230-text: #eef5fb;
      --v230-text-soft: #cbd7e2;
      --v230-muted: #91a3b4;
      --v230-line: rgba(192,221,244,.13);
      --v230-line-strong: rgba(192,221,244,.22);
      --v230-focus: #66b6ff;
      --v230-accent: #61aef7;
      --v230-accent-soft: rgba(97,174,247,.16);
      --v230-success: #77b889;
      --v230-warning: #d0ad62;
      --v230-danger: #d37b7b;
      --v230-info: #6fc1ff;
      --v230-shadow-sm: 0 6px 18px rgba(0,0,0,.18);
      --v230-shadow-md: 0 16px 38px rgba(0,0,0,.25);
      --v230-shadow-lg: 0 26px 64px rgba(0,0,0,.34);
      --v230-radius-sm: 7px;
      --v230-radius-md: 12px;
      --v230-radius-lg: 14px;
      --v230-font-ui: "Manrope","Avenir Next",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      --v230-font-display: "Space Grotesk","Manrope","Avenir Next",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      /* v2.2.7 consumes these variables on native outer surfaces. Rebind them
         here so warm wallpapers cannot wash operational panels pink. */
      --us-squarecoil-glass: rgba(7,13,20,.62);
      --us-squarecoil-glass-soft: rgba(8,15,23,.54);
      --us-squarecoil-glass-strong: rgba(5,11,18,.76);
      --us-squarecoil-glass-line: rgba(192,221,244,.14);
    }

    html.us-sign-v230,
    html.us-sign-v230 body,
    html.us-sign-v230 #main,
    html.us-sign-v230 #content_wrapper,
    html.us-sign-v230 #content,
    html.us-sign-v230 #content > .tray-center,
    html.us-sign-v230 .tray.tray-center {
      color: var(--v230-text) !important;
      font-family: var(--v230-font-ui) !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    html.us-sign-v230 body {
      min-height: 100vh !important;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    html.us-sign-v230 #content_wrapper,
    html.us-sign-v230 #content,
    html.us-sign-v230 .tray-center,
    html.us-sign-v230 .panel-body,
    html.us-sign-v230 .tab-content {
      min-width: 0 !important;
    }

    html.us-sign-v230 header.navbar,
    html.us-sign-v230 .navbar-fixed-top {
      color: var(--v230-text) !important;
      background: linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.004)),var(--v230-shell-strong) !important;
      border: 1px solid var(--v230-line) !important;
      border-top: 0 !important;
      box-shadow: var(--v230-shadow-sm),inset 0 1px 0 rgba(255,255,255,.035) !important;
      -webkit-backdrop-filter: blur(10px) saturate(112%) brightness(92%) !important;
      backdrop-filter: blur(10px) saturate(112%) brightness(92%) !important;
    }

    html.us-sign-v230 header.navbar :is(a,button,.btn),
    html.us-sign-v230 .navbar-fixed-top :is(a,button,.btn) {
      color: var(--v230-text-soft) !important;
    }

    /* Native dropdown hover paints these links white. Keep the top-right
       controls inside the dark glass palette in hover, focus, and open states. */
    html.us-sign-v230 header.navbar .navbar-right > li > .dropdown-toggle,
    html.us-sign-v230 .navbar-fixed-top .navbar-right > li > .dropdown-toggle {
      color: var(--v230-text-soft) !important;
      background: transparent !important;
      box-shadow: none !important;
      transition: color 120ms ease,background-color 120ms ease,box-shadow 120ms ease !important;
    }

    html.us-sign-v230 header.navbar .navbar-right > li > .dropdown-toggle:is(:hover,:focus,:focus-visible),
    html.us-sign-v230 header.navbar .navbar-right > li.open > .dropdown-toggle,
    html.us-sign-v230 .navbar-fixed-top .navbar-right > li > .dropdown-toggle:is(:hover,:focus,:focus-visible),
    html.us-sign-v230 .navbar-fixed-top .navbar-right > li.open > .dropdown-toggle {
      color: #fff !important;
      background: rgba(97,174,247,.10) !important;
      box-shadow: inset 0 -2px 0 rgba(97,174,247,.55) !important;
    }

    /* v2.3.1 preview lockup. The native image remains in the accessibility
       tree and returns immediately when the scoped adapter is disabled. */
    html.us-sign-v230 body header.navbar .navbar-branding .navbar-brand {
      display: inline-flex !important;
      align-items: center !important;
      gap: 10px !important;
      min-width: 176px !important;
      overflow: visible !important;
      padding-right: 10px !important;
      font-size: 0 !important;
      line-height: 1 !important;
    }

    html.us-sign-v230 body header.navbar .navbar-branding .navbar-brand img {
      position: absolute !important;
      width: 1px !important;
      min-width: 1px !important;
      max-width: 1px !important;
      height: 1px !important;
      min-height: 1px !important;
      max-height: 1px !important;
      margin: -1px !important;
      padding: 0 !important;
      overflow: hidden !important;
      clip: rect(0 0 0 0) !important;
      clip-path: inset(50%) !important;
      opacity: 0 !important;
      white-space: nowrap !important;
    }

    html.us-sign-v230 body header.navbar .navbar-branding .navbar-brand::before {
      content: "SC" !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex: 0 0 32px !important;
      width: 32px !important;
      height: 32px !important;
      color: #05131f !important;
      background: linear-gradient(145deg,#78ccff,#2a88cc) !important;
      border: 1px solid rgba(168,224,255,.45) !important;
      border-radius: 8px !important;
      box-shadow: 0 8px 22px rgba(42,136,204,.28),inset 0 1px 0 rgba(255,255,255,.34) !important;
      font-family: var(--v230-font-display) !important;
      font-size: 12px !important;
      font-weight: 700 !important;
      letter-spacing: -.04em !important;
      line-height: 1 !important;
    }

    html.us-sign-v230 body header.navbar .navbar-branding .navbar-brand::after {
      content: "SquareCoil" !important;
      display: inline-block !important;
      color: var(--v230-text) !important;
      font-family: var(--v230-font-display) !important;
      font-size: 17px !important;
      font-weight: 700 !important;
      letter-spacing: -.03em !important;
      line-height: 1 !important;
      text-shadow: 0 1px 14px rgba(0,0,0,.34) !important;
      white-space: nowrap !important;
    }

    @media (max-width: 767px) {
      html.us-sign-v230 body header.navbar .navbar-branding .navbar-brand {
        gap: 0 !important;
        min-width: 46px !important;
        padding-right: 4px !important;
      }

      html.us-sign-v230 body header.navbar .navbar-branding .navbar-brand::after {
        content: none !important;
        display: none !important;
      }
    }

    html.us-sign-v230 #sidebar_left {
      color: var(--v230-text) !important;
      background: linear-gradient(180deg,rgba(255,255,255,.018),rgba(255,255,255,.003)),var(--v230-shell-strong) !important;
      border-right: 1px solid var(--v230-line) !important;
      box-shadow: 10px 0 28px rgba(0,0,0,.18),inset -1px 0 0 rgba(255,255,255,.018) !important;
      -webkit-backdrop-filter: blur(10px) saturate(110%) brightness(90%) !important;
      backdrop-filter: blur(10px) saturate(110%) brightness(90%) !important;
    }

    html.us-sign-v230 #sidebar_left :is(a,.sidebar-title,.sidebar-label) {
      color: var(--v230-text-soft) !important;
      font-family: var(--v230-font-ui) !important;
    }

    html.us-sign-v230 #sidebar_left .nav > li > a {
      border-left: 3px solid transparent !important;
      transition: color 140ms ease,background-color 140ms ease,border-color 140ms ease !important;
    }

    html.us-sign-v230 #sidebar_left .nav > li > a:hover,
    html.us-sign-v230 #sidebar_left .nav > li.active > a,
    html.us-sign-v230 #sidebar_left .active > a {
      color: #fff !important;
      background: linear-gradient(90deg,var(--v230-accent-soft),rgba(97,174,247,.035)) !important;
      border-left-color: var(--v230-accent) !important;
    }

    html.us-sign-v230 #topbar {
      color: var(--v230-text-soft) !important;
      background: rgba(7,15,23,.34) !important;
      border-bottom: 1px solid var(--v230-line) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.018) !important;
    }

    html.us-sign-v230 #topbar :is(a,.breadcrumb,.breadcrumb > li,.breadcrumb > li + li::before) {
      color: var(--v230-text-soft) !important;
    }

    html.us-sign-v230 :is(h1,h2,.page-title,.panel-title) {
      color: var(--v230-text) !important;
      font-family: var(--v230-font-display) !important;
      letter-spacing: -.015em !important;
    }

    html.us-sign-v230 #pmlt,
    html.us-sign-v230 #project_menu {
      color: var(--v230-text-soft) !important;
      background-color: rgba(5,12,19,.68) !important;
      background-image: linear-gradient(180deg,rgba(255,255,255,.022),rgba(255,255,255,.003)) !important;
      border-color: var(--v230-line-strong) !important;
      box-shadow: 10px 0 30px rgba(0,0,0,.24),inset -1px 0 0 rgba(255,255,255,.018) !important;
    }

    html.us-sign-v230 #pmlt :is(h1,h2,strong,b) {
      color: var(--v230-text) !important;
      font-family: var(--v230-font-display) !important;
    }

    html.us-sign-v230 #pmlt a,
    html.us-sign-v230 #project_menu a {
      color: var(--v230-text-soft) !important;
      border-color: transparent !important;
    }

    html.us-sign-v230 #project_menu {
      padding: 7px 0 !important;
      border-radius: 9px !important;
      overflow: hidden !important;
    }

    html.us-sign-v230 #project_menu a {
      display: flex !important;
      align-items: center !important;
      min-height: 29px !important;
      padding: 5px 10px !important;
      border-left: 2px solid transparent !important;
      line-height: 1.25 !important;
    }

    /* The three native project actions share one plain wrapper. Its content
       fits within the 220px project rail when native margins are normalized. */
    html.us-sign-v230 #pmlt > div:has(> #duplicate) {
      display: flex !important;
      flex-wrap: nowrap !important;
      align-items: center !important;
      gap: 4px !important;
    }

    html.us-sign-v230 #pmlt > div:has(> #duplicate) > :is(a,button,.btn) {
      flex: 0 0 auto !important;
      margin: 0 !important;
      white-space: nowrap !important;
    }

    html.us-sign-v230 #pmlt a:hover,
    html.us-sign-v230 #pmlt a.selected,
    html.us-sign-v230 #project_menu a:hover,
    html.us-sign-v230 #project_menu a.selected {
      color: #fff !important;
      background: var(--v230-accent-soft) !important;
      border-left-color: var(--v230-accent) !important;
    }

    /* v2.3.2 ICON FONT REPAIR
       v2.2.7 intentionally puts Manrope on #pmlt descendants after the older
       icon repair. Restore each native icon family late in the cascade. */
    html.us-sign-v230 body :is(.fa,i.fa,span.fa,[class^="fa-"],[class*=" fa-"]),
    html.us-sign-v230 body #pmlt :is(.fa,i.fa,span.fa,[class^="fa-"],[class*=" fa-"]) {
      font-family: "FontAwesome" !important;
      font-style: normal !important;
      font-weight: normal !important;
      font-variant: normal !important;
      line-height: 1 !important;
      text-transform: none !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
    }

    html.us-sign-v230 body :is(.glyphicon,[class^="glyphicon-"],[class*=" glyphicon-"]),
    html.us-sign-v230 body #pmlt :is(.glyphicon,[class^="glyphicon-"],[class*=" glyphicon-"]) {
      font-family: "Glyphicons Halflings" !important;
      font-style: normal !important;
      font-weight: normal !important;
      font-variant: normal !important;
      line-height: 1 !important;
      text-transform: none !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
    }

    html.us-sign-v230 body :is(.glyphicons,[class^="glyphicons-"],[class*=" glyphicons-"]),
    html.us-sign-v230 body #pmlt :is(.glyphicons,[class^="glyphicons-"],[class*=" glyphicons-"]) {
      font-family: "Glyphicons" !important;
      font-style: normal !important;
      font-weight: 400 !important;
      font-variant: normal !important;
      line-height: 1 !important;
      text-transform: none !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
    }

    html.us-sign-v230 body :is(.imoon,[class^="imoon-"],[class*=" imoon-"],i[class^="icon-"],i[class*=" icon-"],span[class^="icon-"],span[class*=" icon-"]),
    html.us-sign-v230 body #pmlt :is(.imoon,[class^="imoon-"],[class*=" imoon-"],i[class^="icon-"],i[class*=" icon-"],span[class^="icon-"],span[class*=" icon-"]) {
      font-family: "icomoon" !important;
      font-style: normal !important;
      font-weight: normal !important;
      font-variant: normal !important;
      line-height: 1 !important;
      text-transform: none !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
    }

    /* Critical project controls also get dependency-free glyph fallbacks.
       These override only the named pseudo-icons that were boxed in the live
       screenshot; the working global navigation icon system is untouched. */
    html.us-sign-v230 body :is(.fa-fast-backward,.glyphicon-fast-backward,.glyphicons-fast-backward)::before {
      content: "«" !important;
      font-family: "Segoe UI Symbol","Arial Unicode MS",sans-serif !important;
      font-size: 1.12em !important;
      font-weight: 600 !important;
    }

    html.us-sign-v230 body :is(.fa-backward,.fa-chevron-left,.fa-angle-left,.glyphicon-backward,.glyphicon-chevron-left,.glyphicons-chevron-left)::before {
      content: "‹" !important;
      font-family: "Segoe UI Symbol","Arial Unicode MS",sans-serif !important;
      font-size: 1.28em !important;
      font-weight: 600 !important;
    }

    html.us-sign-v230 body :is(.fa-forward,.fa-chevron-right,.fa-angle-right,.glyphicon-forward,.glyphicon-chevron-right,.glyphicons-chevron-right)::before {
      content: "›" !important;
      font-family: "Segoe UI Symbol","Arial Unicode MS",sans-serif !important;
      font-size: 1.28em !important;
      font-weight: 600 !important;
    }

    html.us-sign-v230 body :is(.fa-fast-forward,.glyphicon-fast-forward,.glyphicons-fast-forward)::before {
      content: "»" !important;
      font-family: "Segoe UI Symbol","Arial Unicode MS",sans-serif !important;
      font-size: 1.12em !important;
      font-weight: 600 !important;
    }

    html.us-sign-v230 body :is(.fa-star-o,.fa-star,.glyphicon-star,.glyphicon-star-empty,.glyphicons-star,.glyphicons-star-empty)::before {
      content: "☆" !important;
      font-family: "Segoe UI Symbol","Arial Unicode MS",sans-serif !important;
      font-size: 1.06em !important;
      font-weight: 600 !important;
    }

    html.us-sign-v230 body :is(.fa-map-marker,.glyphicon-map-marker,.glyphicons-map-marker)::before,
    html.us-sign-v230 body :is(.fa-folder,.fa-folder-open,.glyphicon-folder-close,.glyphicon-folder-open,.glyphicons-folder_closed,.glyphicons-folder_open)::before {
      content: "" !important;
      display: inline-block !important;
      width: .92em !important;
      height: .92em !important;
      background-color: currentColor !important;
      background-image: none !important;
      vertical-align: -.08em !important;
    }

    html.us-sign-v230 body :is(.fa-map-marker,.glyphicon-map-marker,.glyphicons-map-marker)::before {
      -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.6A2.6 2.6 0 1 1 12 6a2.6 2.6 0 0 1 0 5.6Z'/%3E%3C/svg%3E") center/contain no-repeat !important;
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.6A2.6 2.6 0 1 1 12 6a2.6 2.6 0 0 1 0 5.6Z'/%3E%3C/svg%3E") center/contain no-repeat !important;
    }

    html.us-sign-v230 body :is(.fa-folder,.fa-folder-open,.glyphicon-folder-close,.glyphicon-folder-open,.glyphicons-folder_closed,.glyphicons-folder_open)::before {
      -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M2.5 5.5h7l2 2h10v11h-19v-13Zm1.8 3.8v7.4h15.4V9.3H4.3Z'/%3E%3C/svg%3E") center/contain no-repeat !important;
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M2.5 5.5h7l2 2h10v11h-19v-13Zm1.8 3.8v7.4h15.4V9.3H4.3Z'/%3E%3C/svg%3E") center/contain no-repeat !important;
    }

    html.us-sign-v230 :is(.panel,.well,.modal-content,.dropdown-menu,.popover,.tab-content,.bg-light,.bg-white),
    html.us-sign-v230 :is(#customer-info,#filesbox,#descriptionbox,#projectbox,#designbox) {
      color: var(--v230-text-soft) !important;
      background-color: var(--v230-surface) !important;
      background-image: linear-gradient(180deg,rgba(255,255,255,.022),rgba(255,255,255,.002)) !important;
      border-color: var(--v230-line) !important;
      box-shadow: var(--v230-shadow-sm),inset 0 1px 0 rgba(255,255,255,.025) !important;
    }

    html.us-sign-v230 :is(#customer-name,#customer-info,#showbtns,#mapcontainer,#filesbox,#descriptionbox,#projectbox,#designbox,#us-sign-design-project-header,#us-sign-design-actionbar,#us-sign-job-overview,#us-sign-design-summary,.us-sign-designs-panel,.us-sign-files-panel,.us-sign-description-panel) {
      background-color: var(--v230-surface) !important;
      background-image: linear-gradient(180deg,rgba(255,255,255,.024),rgba(255,255,255,.003)) !important;
      border-color: var(--v230-line) !important;
      box-shadow: var(--v230-shadow-sm),inset 0 1px 0 rgba(255,255,255,.024) !important;
    }

    html.us-sign-v230 :is(.alert,.notification,.notice) {
      color: var(--v230-text-soft) !important;
      background-color: rgba(7,15,23,.86) !important;
      background-image: linear-gradient(90deg,rgba(111,193,255,.075),rgba(255,255,255,.008)) !important;
      border: 1px solid var(--v230-line) !important;
      border-left: 3px solid rgba(111,193,255,.52) !important;
      border-radius: 9px !important;
      box-shadow: var(--v230-shadow-sm) !important;
      text-shadow: none !important;
    }

    html.us-sign-v230 :is(.alert,.notification,.notice)[data-us-state="pending"],
    html.us-sign-v230 :is(.alert-info,.alert-primary) {
      color: #dff3ff !important;
      background-color: rgba(8,24,36,.88) !important;
      border-left-color: var(--v230-info) !important;
    }

    html.us-sign-v230 :is(.panel,.well,.modal-content,.dropdown-menu,.popover) {
      border-radius: var(--v230-radius-md) !important;
    }

    html.us-sign-v230 :is(.panel-heading,.panel-footer,.modal-header,.modal-footer) {
      color: var(--v230-text) !important;
      background: rgba(255,255,255,.026) !important;
      border-color: var(--v230-line) !important;
    }

    html.us-sign-v230 :is(.panel-body,.modal-body,.well) {
      color: var(--v230-text-soft) !important;
    }

    html.us-sign-v230 .modal-content,
    html.us-sign-v230 .dropdown-menu,
    html.us-sign-v230 .popover {
      background-color: var(--v230-surface-strong) !important;
      -webkit-backdrop-filter: blur(8px) saturate(110%) brightness(92%) !important;
      backdrop-filter: blur(8px) saturate(110%) brightness(92%) !important;
    }

    /* Avoid paying for nested blur layers; the outer glass surface already
       provides the visual separation and the nested content remains readable. */
    html.us-sign-v230 :is(.panel,.well,.modal-content,.dropdown-menu,.popover) :is(.panel,.well,.panel-body,.panel-heading,.panel-footer) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-v230 :is(.form-control,input[type="text"],input[type="search"],input[type="number"],input[type="email"],input[type="date"],input[type="time"],input[type="password"],textarea,select) {
      color: var(--v230-text) !important;
      caret-color: var(--v230-focus) !important;
      background: rgba(4,11,17,.52) !important;
      border: 1px solid var(--v230-line) !important;
      border-radius: var(--v230-radius-sm) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.018) !important;
      font-family: var(--v230-font-ui) !important;
      text-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-v230 :is(.form-control,input,textarea)::placeholder {
      color: var(--v230-muted) !important;
      opacity: .78 !important;
    }

    html.us-sign-v230 :is(.form-control,input,textarea,select):disabled {
      color: rgba(203,215,226,.56) !important;
      background: rgba(255,255,255,.025) !important;
      border-color: rgba(192,221,244,.075) !important;
      opacity: .86 !important;
    }

    html.us-sign-v230 :is(.form-control,input,textarea,select,a,button,.btn,[tabindex]):focus-visible {
      outline: 2px solid var(--v230-focus) !important;
      outline-offset: 2px !important;
      border-color: rgba(102,182,255,.66) !important;
      box-shadow: 0 0 0 3px rgba(102,182,255,.15) !important;
    }

    html.us-sign-v230 .btn {
      color: var(--v230-text-soft) !important;
      background: rgba(255,255,255,.045) !important;
      border-color: var(--v230-line) !important;
      border-radius: var(--v230-radius-sm) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.028) !important;
      font-family: var(--v230-font-ui) !important;
      text-shadow: none !important;
    }

    html.us-sign-v230 .btn:hover {
      color: #fff !important;
      background: rgba(255,255,255,.085) !important;
      border-color: var(--v230-line-strong) !important;
    }

    html.us-sign-v230 .btn-primary { background: rgba(45,128,207,.78) !important; border-color: rgba(102,182,255,.55) !important; }
    html.us-sign-v230 .btn-success { background: rgba(60,120,78,.76) !important; border-color: rgba(119,184,137,.55) !important; }
    html.us-sign-v230 .btn-warning { color: #fff7e5 !important; background: rgba(145,109,42,.78) !important; border-color: rgba(208,173,98,.58) !important; }
    html.us-sign-v230 .btn-danger { background: rgba(143,61,61,.78) !important; border-color: rgba(211,123,123,.58) !important; }

    html.us-sign-v230 :is(table,.table,table.dataTable) {
      color: var(--v230-text-soft) !important;
      background: rgba(5,13,20,.42) !important;
      border-color: var(--v230-line) !important;
      border-collapse: separate !important;
      border-spacing: 0 !important;
    }

    html.us-sign-v230 :is(table,.table,table.dataTable) :is(th,td) {
      color: var(--v230-text-soft) !important;
      background-color: transparent !important;
      border-color: var(--v230-line) !important;
      text-shadow: none !important;
    }

    html.us-sign-v230 :is(table,.table,table.dataTable) thead th {
      color: var(--v230-text) !important;
      background: rgba(255,255,255,.04) !important;
      font-weight: 650 !important;
      letter-spacing: .01em !important;
    }

    html.us-sign-v230 :is(table,.table,table.dataTable) tbody tr:hover > * {
      background-color: var(--v230-surface-hover) !important;
    }

    html.us-sign-v230 :is(.dataTables_wrapper,.dataTables_info,.dataTables_length,.dataTables_filter) {
      color: var(--v230-text-soft) !important;
    }

    html.us-sign-v230 .dataTables_wrapper .dataTables_paginate .paginate_button {
      color: var(--v230-text-soft) !important;
      background: rgba(255,255,255,.035) !important;
      border: 1px solid var(--v230-line) !important;
      border-radius: 6px !important;
      box-shadow: none !important;
    }

    html.us-sign-v230 .dataTables_wrapper .dataTables_paginate .paginate_button:hover,
    html.us-sign-v230 .dataTables_wrapper .dataTables_paginate .paginate_button.current {
      color: #fff !important;
      background: var(--v230-accent-soft) !important;
      border-color: rgba(102,182,255,.48) !important;
    }

    html.us-sign-v230 :is(.select2-container--default .select2-selection--single,.select2-container--default .select2-selection--multiple,.select2-dropdown) {
      color: var(--v230-text) !important;
      background: var(--v230-surface-strong) !important;
      border-color: var(--v230-line) !important;
      border-radius: var(--v230-radius-sm) !important;
    }

    html.us-sign-v230 :is(.select2-selection__rendered,.select2-results__option,.select2-search__field) {
      color: var(--v230-text-soft) !important;
    }

    html.us-sign-v230 .select2-results__option--highlighted,
    html.us-sign-v230 .select2-results__option[aria-selected="true"] {
      color: #fff !important;
      background: var(--v230-accent-soft) !important;
    }

    html.us-sign-v230 :is(.ui-datepicker,.ui-autocomplete,.daterangepicker,.bootstrap-datetimepicker-widget,.multiselect-container) {
      color: var(--v230-text-soft) !important;
      background: var(--v230-surface-strong) !important;
      border: 1px solid var(--v230-line) !important;
      border-radius: var(--v230-radius-md) !important;
      box-shadow: var(--v230-shadow-md) !important;
    }

    html.us-sign-v230 :is(.ui-datepicker,.daterangepicker,.bootstrap-datetimepicker-widget) :is(td,th,a,span) {
      color: var(--v230-text-soft) !important;
      border-color: var(--v230-line) !important;
    }

    html.us-sign-v230 :is(.fc,.fc-unthemed,.fc-view-container,.fc-view,.fc-row,.fc-day-grid) {
      color: var(--v230-text-soft) !important;
      background: transparent !important;
      border-color: var(--v230-line) !important;
    }

    html.us-sign-v230 .fc :is(th,td,.fc-axis,.fc-day-header,.fc-widget-header,.fc-widget-content) {
      color: var(--v230-text-soft) !important;
      background-color: rgba(6,14,22,.44) !important;
      border-color: var(--v230-line) !important;
    }

    html.us-sign-v230 .fc .fc-today { background: rgba(97,174,247,.09) !important; }
    html.us-sign-v230 .fc .fc-event { box-shadow: var(--v230-shadow-sm) !important; }

    html.us-sign-v230 :is(.qtip,.mfp-content,.fancybox-skin,.fancybox-inner) {
      color: var(--v230-text-soft) !important;
      background: var(--v230-surface-strong) !important;
      border-color: var(--v230-line) !important;
      border-radius: var(--v230-radius-md) !important;
      box-shadow: var(--v230-shadow-lg) !important;
    }

    html.us-sign-v230 :is(.mfp-bg,.fancybox-overlay) {
      background: rgba(2,7,11,.76) !important;
      -webkit-backdrop-filter: blur(7px) saturate(108%) !important;
      backdrop-filter: blur(7px) saturate(108%) !important;
    }

    html.us-sign-v230 .dropzone {
      color: var(--v230-text-soft) !important;
      background: rgba(5,13,20,.44) !important;
      border: 1px dashed rgba(102,182,255,.38) !important;
      border-radius: var(--v230-radius-md) !important;
    }

    html.us-sign-v230 .dropzone.dz-drag-hover {
      background: var(--v230-accent-soft) !important;
      border-color: var(--v230-focus) !important;
    }

    html.us-sign-v230 :is(.cke,.cke_inner,.cke_top,.cke_bottom,.cke_contents) {
      color: var(--v230-text-soft) !important;
      background: var(--v230-surface-strong) !important;
      border-color: var(--v230-line) !important;
      box-shadow: none !important;
    }

    /* v2.3.4 live-probe corrections: native controls and nested rows repaint
       after the broad skin rules, so these adapters intentionally come last. */
    html.us-sign-v230 .navbar .dropdown-menu.list-group.dropdown-persist,
    html.us-sign-v230 .navbar .dropdown-menu.list-group.dropdown-persist > li,
    html.us-sign-v230 .navbar .dropdown-menu.list-group.dropdown-persist > .list-group-item,
    html.us-sign-v230 .navbar .dropdown-menu.list-group.dropdown-persist > .dropdown-footer {
      color: var(--v230-text-soft) !important;
      background: rgba(7,15,23,.97) !important;
      border-color: var(--v230-line) !important;
    }

    html.us-sign-v230 .navbar .dropdown-menu.list-group.dropdown-persist :is(a,button) {
      color: var(--v230-text-soft) !important;
      background: transparent !important;
      border-color: transparent !important;
      text-shadow: none !important;
    }

    html.us-sign-v230 .navbar .dropdown-menu.list-group.dropdown-persist :is(a,button):is(:hover,:focus-visible) {
      color: #fff !important;
      background: var(--v230-accent-soft) !important;
    }

    html.us-sign-v230[data-us-sign-v230-route="leads"] .admin-form :is(.gui-input,.gui-textarea,select.input-sm),
    html.us-sign-v230[data-us-sign-v230-route="leads"] .admin-form .panel :is(input,select,textarea) {
      color: var(--v230-text) !important;
      background: rgba(5,13,20,.78) !important;
      border: 1px solid var(--v230-line-strong) !important;
      border-radius: 8px !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.025) !important;
      color-scheme: dark !important;
    }

    html.us-sign-v230[data-us-sign-v230-route="leads"] .admin-form select option {
      color: var(--v230-text) !important;
      background: #0b141d !important;
    }

    html.us-sign-v230[data-us-sign-v230-route="install-calendar"] .fc .fc-day,
    html.us-sign-v230[data-us-sign-v230-route="install-calendar"] .fc .fc-widget-content,
    html.us-sign-v230[data-us-sign-v230-route="install-calendar"] .fc .fc-widget-header {
      color: var(--v230-text-soft) !important;
      background-color: rgba(7,16,24,.60) !important;
      border-color: var(--v230-line) !important;
    }

    html.us-sign-v230[data-us-sign-v230-route="install-calendar"] .fc .fc-other-month {
      color: rgba(203,215,226,.48) !important;
      background-color: rgba(5,12,18,.42) !important;
    }

    html.us-sign-v230[data-us-sign-v230-route="install-calendar"] .fc .fc-today {
      background-color: rgba(48,118,177,.22) !important;
      box-shadow: inset 0 0 0 1px rgba(102,182,255,.22) !important;
    }

    html.us-sign-v230[data-us-sign-v230-route="install-calendar"] .fc .fc-event {
      color: var(--v230-text) !important;
      background: rgba(9,19,28,.94) !important;
      border-width: 2px !important;
      border-style: solid !important;
      border-radius: 7px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.035) !important;
    }

    html.us-sign-v230[data-us-sign-v230-route="install-calendar"] .fc .fc-event :is(.fc-content,.fc-title,.event-title) {
      background: transparent !important;
      text-shadow: none !important;
    }

    html.us-sign-v230[data-us-sign-v230-route="install-calendar"] .fc .fc-event .cp {
      height: 6px !important;
      background: rgba(255,255,255,.075) !important;
      border: 1px solid rgba(192,221,244,.20) !important;
      border-radius: 999px !important;
      box-shadow: inset 0 1px 2px rgba(0,0,0,.32) !important;
    }

    html.us-sign-v230 .cke_contents,
    html.us-sign-v230 iframe.cke_wysiwyg_frame {
      color: var(--v230-text) !important;
      background: #0a1118 !important;
      border-color: var(--v230-line) !important;
      color-scheme: dark !important;
    }

    html.us-sign-v230 .cke_top,
    html.us-sign-v230 .cke_toolbox,
    html.us-sign-v230 .cke_toolgroup,
    html.us-sign-v230 .cke_combo_button {
      color: var(--v230-text-soft) !important;
      background: #0d1822 !important;
      border-color: var(--v230-line) !important;
      box-shadow: none !important;
    }

    html.us-sign-v230 .cke_button_icon {
      filter: brightness(0) invert(1) !important;
      opacity: .86 !important;
    }

    html.us-sign-v230 .cke_button:is(:hover,:focus-visible) .cke_button_icon,
    html.us-sign-v230 .cke_button_on .cke_button_icon {
      opacity: 1 !important;
    }

    html.us-sign-v230 .cke_button_disabled .cke_button_icon {
      opacity: .28 !important;
    }

    html.us-sign-v230 .cke_combo_text,
    html.us-sign-v230 .cke_combo_arrow {
      color: var(--v230-text-soft) !important;
      text-shadow: none !important;
    }

    html.us-sign-v230 :is([class*="gantt"],[id*="gantt"]) {
      color: var(--v230-text-soft) !important;
      border-color: var(--v230-line) !important;
    }

    html.us-sign-v230[data-us-sign-v230-route="dashboard"] :is(#widget-tasks,#widget-designs,#widget-estimates) {
      min-height: 94px !important;
      height: auto !important;
      color: var(--v230-text) !important;
      background: linear-gradient(180deg,rgba(255,255,255,.028),rgba(255,255,255,.004)),rgba(8,17,26,.58) !important;
      border: 1px solid var(--v230-line) !important;
      border-radius: var(--v230-radius-lg) !important;
      box-shadow: var(--v230-shadow-md),inset 0 1px 0 rgba(255,255,255,.03) !important;
      -webkit-backdrop-filter: blur(8px) saturate(108%) brightness(92%) !important;
      backdrop-filter: blur(8px) saturate(108%) brightness(92%) !important;
      overflow: hidden !important;
    }

    html.us-sign-v230[data-us-sign-v230-route="dashboard"] #widget-tasks { box-shadow: inset 3px 0 0 rgba(111,193,255,.58),var(--v230-shadow-md) !important; }
    html.us-sign-v230[data-us-sign-v230-route="dashboard"] #widget-designs { box-shadow: inset 3px 0 0 rgba(208,173,98,.56),var(--v230-shadow-md) !important; }
    html.us-sign-v230[data-us-sign-v230-route="dashboard"] #widget-estimates { box-shadow: inset 3px 0 0 rgba(211,123,123,.54),var(--v230-shadow-md) !important; }

    html.us-sign-v230[data-us-sign-v230-route="project-milestones"] #content :is(.panel,.well,table) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-v230[data-us-sign-v230-route="shopping-list"] #content,
    html.us-sign-v230[data-us-sign-v230-route="project-milestones"] #content,
    html.us-sign-v230[data-us-sign-v230-route="install-calendar"] #content {
      overflow-x: auto !important;
      scrollbar-color: rgba(102,182,255,.36) rgba(255,255,255,.03);
    }

    html.us-sign-v230 :is(.label-success,.alert-success,.text-success) { color: #dff6e5 !important; border-color: rgba(119,184,137,.48) !important; }
    html.us-sign-v230 :is(.label-warning,.alert-warning,.text-warning) { color: #fff2d2 !important; border-color: rgba(208,173,98,.52) !important; }
    html.us-sign-v230 :is(.label-danger,.alert-danger,.text-danger) { color: #ffe1e1 !important; border-color: rgba(211,123,123,.54) !important; }
    html.us-sign-v230 :is(.label-info,.alert-info,.text-info) { color: #dff3ff !important; border-color: rgba(111,193,255,.50) !important; }

    html.us-sign-v230 #ussign-job-timer,
    html.us-sign-v230 #ussign-job-timer * {
      font-family: inherit;
    }

    @supports not ((backdrop-filter: blur(2px)) or (-webkit-backdrop-filter: blur(2px))) {
      html.us-sign-v230 header.navbar,
      html.us-sign-v230 .navbar-fixed-top,
      html.us-sign-v230 #sidebar_left,
      html.us-sign-v230 .modal-content,
      html.us-sign-v230 .dropdown-menu,
      html.us-sign-v230 .popover,
      html.us-sign-v230[data-us-sign-v230-route="dashboard"] :is(#widget-tasks,#widget-designs,#widget-estimates) {
        background-color: rgba(6,14,22,.94) !important;
      }
    }

    @media (max-width: 1100px) {
      html.us-sign-v230 body.mobile-view.sb-l-m #content_wrapper {
        left: 0 !important;
        margin-left: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }

      html.us-sign-v230 body.mobile-view.sb-l-m #topbar,
      html.us-sign-v230 body.mobile-view.sb-l-m #content {
        left: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }

      html.us-sign-v230 #content :is(.panel-body,.tab-content,.table-responsive) {
        max-width: 100% !important;
        overflow-x: auto !important;
      }
    }

    @media (max-width: 767px) {
      html.us-sign-v230 #content { padding: 14px 10px 38px !important; }
      html.us-sign-v230 #topbar { padding: 9px 12px !important; }
      html.us-sign-v230 :is(.panel,.well,.modal-content) { border-radius: 10px !important; }
      html.us-sign-v230[data-us-sign-v230-route="dashboard"] :is(#widget-tasks,#widget-designs,#widget-estimates) {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
        background-color: rgba(7,15,23,.90) !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      html.us-sign-v230 *,
      html.us-sign-v230 *::before,
      html.us-sign-v230 *::after {
        scroll-behavior: auto !important;
        animation-duration: .001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .001ms !important;
      }
    }

    @media (forced-colors: active) {
      html.us-sign-v230,
      html.us-sign-v230 body,
      html.us-sign-v230 #main,
      html.us-sign-v230 #content_wrapper,
      html.us-sign-v230 #content,
      html.us-sign-v230 header.navbar,
      html.us-sign-v230 #sidebar_left,
      html.us-sign-v230 :is(.panel,.well,.modal-content,.dropdown-menu,.popover,table,.table) {
        color: CanvasText !important;
        background: Canvas !important;
        border-color: CanvasText !important;
        box-shadow: none !important;
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }

      html.us-sign-v230 :focus-visible { outline: 2px solid Highlight !important; }
    }

    @media print {
      html.us-sign-v230,
      html.us-sign-v230 body,
      html.us-sign-v230 #main,
      html.us-sign-v230 #content_wrapper,
      html.us-sign-v230 #content,
      html.us-sign-v230 :is(.panel,.well,table,.table,th,td) {
        color: #111 !important;
        background: #fff !important;
        border-color: #bbb !important;
        box-shadow: none !important;
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
        text-shadow: none !important;
      }

      html.us-sign-v230 #us-squarecoil-cinematic-wallpaper { display: none !important; }
    }
  `);

  const EDITOR_STYLE_ID = "us-sign-v234-ckeditor-document";
  const observedEditorFrames = new WeakSet();

  function applyEditorDocumentTheme(iframe) {
    if (!iframe) return;
    iframe.setAttribute("allowtransparency", "true");
    iframe.style.setProperty("background", "#0a1118", "important");
    iframe.style.setProperty("background-color", "#0a1118", "important");
    iframe.style.setProperty("border", "0", "important");
    iframe.style.setProperty("color-scheme", "dark", "important");

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
              color: #dce5ee !important;
              background: #0a1118 !important;
              background-color: #0a1118 !important;
              background-image: none !important;
              caret-color: #ffffff !important;
              color-scheme: dark !important;
              font-family: Manrope, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
              line-height: 1.58 !important;
            }
            body { padding: 14px 18px !important; }
            a { color: #8fc9ff !important; }
            strong, b, h1, h2, h3, h4, h5, h6 { color: #f5f8fb !important; }
            font[color="black"], font[color="#000000"], [style*="color: black" i], [style*="#000000" i], [style*="rgb(0, 0, 0)" i] { color: #e6edf4 !important; }
            font[color="blue"], [style*="color: blue" i], [style*="#0000ff" i] { color: #8fc9ff !important; }
            font[color="red"], [style*="color: red" i], [style*="#ff0000" i] { color: #ffaaa7 !important; }
            font[color="green"], [style*="color: green" i], [style*="#008000" i] { color: #9ed7aa !important; }
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
    for (const iframe of document.querySelectorAll("iframe.cke_wysiwyg_frame")) {
      applyEditorDocumentTheme(iframe);
    }
  }

  for (const delay of [0, 500, 1500]) window.setTimeout(scanEditorFrames, delay);
  window.addEventListener("pageshow", scanEditorFrames);
  window.addEventListener("us-sign-location-change", () => window.setTimeout(scanEditorFrames, 100));
})();
