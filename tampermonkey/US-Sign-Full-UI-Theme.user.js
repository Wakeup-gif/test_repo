// ==UserScript==
// @name         US Sign Full UI Theme
// @namespace    us-sign-full-modules
// @version      2.0.4
// @description  Blue macOS-inspired glass theme for SquareCoil with corrected wallpaper stacking, compact project-page top spacing, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Full-UI-Theme.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Full-UI-Theme.user.js
// ==/UserScript==

(function () {
  "use strict";

  GM_addStyle(String.raw`
    :root {
      color-scheme: dark;

      --us-bg: #0b1017;
      --us-bg-deep: #070b10;
      --us-bg-elevated: rgba(18, 25, 34, 0.82);
      --us-bg-soft: rgba(27, 36, 47, 0.74);

      --us-glass: rgba(19, 27, 37, 0.62);
      --us-glass-strong: rgba(15, 22, 31, 0.80);
      --us-glass-soft: rgba(255, 255, 255, 0.045);
      --us-glass-hover: rgba(255, 255, 255, 0.075);
      --us-glass-active: rgba(10, 132, 255, 0.16);

      --us-text: #f5f8fb;
      --us-text-soft: #d2d9e1;
      --us-text-muted: #99a6b3;
      --us-text-faint: #73808d;

      --us-blue: #0a84ff;
      --us-blue-bright: #64d2ff;
      --us-blue-soft: rgba(10, 132, 255, 0.16);
      --us-blue-softer: rgba(100, 210, 255, 0.08);
      --us-blue-border: rgba(100, 210, 255, 0.25);
      --us-blue-focus: rgba(10, 132, 255, 0.48);

      --us-success: #79c99e;
      --us-warning: #d1b46d;
      --us-danger: #d58d8d;
      --us-info: #7fc8f8;

      --us-border: rgba(210, 230, 248, 0.10);
      --us-border-strong: rgba(215, 235, 255, 0.16);
      --us-border-highlight: rgba(255, 255, 255, 0.13);

      --us-shadow-sm: 0 8px 24px rgba(0, 0, 0, 0.20);
      --us-shadow-md: 0 18px 48px rgba(0, 0, 0, 0.28);
      --us-shadow-lg: 0 28px 70px rgba(0, 0, 0, 0.38);
      --us-inner-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.055);

      --us-radius-xs: 6px;
      --us-radius-sm: 9px;
      --us-radius-md: 13px;
      --us-radius-lg: 18px;

      --us-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", system-ui, sans-serif;
      --us-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;

      --us-wallpaper: url("https://bing.gifposter.com/bingImages/LagoPehoe_1920x1080.jpg");
    }

    html {
      min-height: 100% !important;
      color: var(--us-text) !important;
      background-color: var(--us-bg-deep) !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.22), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.10), transparent 34%),
        linear-gradient(rgba(6, 10, 15, 0.42), rgba(7, 11, 16, 0.70)),
        var(--us-wallpaper) !important;
      background-position: center center, center center, center center, center center !important;
      background-size: cover, cover, cover, cover !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
    }

    body {
      min-height: 100vh !important;
      margin: 0 !important;
      padding-top: 0 !important;
      color: var(--us-text) !important;
      background: rgba(7, 11, 16, 0.20) !important;
      background-color: rgba(7, 11, 16, 0.20) !important;
      background-image: none !important;
      font-family: var(--us-font) !important;
      letter-spacing: 0 !important;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    ::selection {
      color: #fff !important;
      background: rgba(10, 132, 255, 0.42) !important;
    }

    /* Main canvas stays transparent so the wallpaper reads through the interface. */
    html body #main,
    html body #content_wrapper,
    html body #content,
    html body #content > .tray,
    html body #content > .tray-left,
    html body #content > .tray-right,
    html body #content > .tray-center,
    html body .tray,
    html body .tray-left,
    html body .tray-right,
    html body .tray-center,
    html body .tray-inner,
    html body [class^="tray-"],
    html body [class*=" tray-"],
    html body .content,
    html body .content-wrapper,
    html body .page-content,
    html body .content-body,
    html body .main-content,
    html body .main-panel,
    html body .admin-panels,
    html body .dashboard,
    html body .dashboard-page,
    html body .container,
    html body .container-fluid,
    html body .pl15,
    html body .pr15,
    html body .pl15.pr15 {
      color: var(--us-text) !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    html body #content .row,
    html body .tray .row,
    html body .tray-center .row,
    html body #content [class*="col-"],
    html body .tray [class*="col-"],
    html body .tray-center [class*="col-"] {
      background-color: transparent !important;
      background-image: none !important;
    }

    #content {
      display: block !important;
      min-height: calc(100vh - 58px) !important;
    }

    /* High-level macOS style glass shells. */
    header.navbar,
    .navbar.navbar-default,
    .navbar.navbar-inverse,
    #sidebar_left,
    #pmlt {
      color: var(--us-text-soft) !important;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012)),
        var(--us-glass-strong) !important;
      background-color: var(--us-glass-strong) !important;
      background-image:
        linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012)) !important;
      border-color: var(--us-border) !important;
      box-shadow: var(--us-inner-highlight), var(--us-shadow-sm) !important;
    }

    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      header.navbar,
      .navbar.navbar-default,
      .navbar.navbar-inverse,
      #sidebar_left,
      #pmlt,
      .panel,
      .panel-default,
      .well,
      .modal-content,
      .popover,
      .dropdown-menu,
      #customer-info,
      #customer-name,
      #showbtns,
      #mapcontainer,
      #filesbox,
      #descriptionbox,
      #projectbox,
      #designbox,
      .note-editor,
      .cke {
        -webkit-backdrop-filter: blur(18px) saturate(135%);
        backdrop-filter: blur(18px) saturate(135%);
      }
    }

    header.navbar,
    .navbar.navbar-default,
    .navbar.navbar-inverse {
      border: 0 !important;
      border-bottom: 1px solid var(--us-border) !important;
      box-shadow: var(--us-inner-highlight), 0 10px 30px rgba(0, 0, 0, 0.22) !important;
    }

    header.navbar .navbar-brand,
    header.navbar .navbar-brand:hover,
    header.navbar .navbar-brand:focus {
      color: var(--us-text) !important;
      background: transparent !important;
    }

    header.navbar .navbar-brand img {
      filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.20));
    }

    header.navbar a,
    header.navbar span,
    header.navbar i,
    header.navbar .navbar-text {
      color: var(--us-text-soft) !important;
      text-shadow: none !important;
    }

    /* Main left navigation. */
    #sidebar_left {
      border-right: 1px solid var(--us-border) !important;
      box-shadow: var(--us-inner-highlight), 10px 0 30px rgba(0, 0, 0, 0.12) !important;
    }

    #sidebar_left .sidebar-title,
    #sidebar_left .sidebar-label,
    #sidebar_left h1,
    #sidebar_left h2,
    #sidebar_left h3,
    #sidebar_left h4 {
      color: var(--us-text-muted) !important;
      text-shadow: none !important;
    }

    #sidebar_left a,
    #sidebar_left .nav > li > a {
      color: var(--us-text-soft) !important;
      background: transparent !important;
      border: 1px solid transparent !important;
      border-radius: var(--us-radius-sm) !important;
      text-shadow: none !important;
      transition: color 120ms ease, background-color 120ms ease, border-color 120ms ease !important;
    }

    #sidebar_left a:hover,
    #sidebar_left .nav > li > a:hover {
      color: #fff !important;
      background: rgba(255, 255, 255, 0.055) !important;
      border-color: rgba(255, 255, 255, 0.055) !important;
    }

    #sidebar_left .nav > li.active > a,
    #sidebar_left .active > a,
    #sidebar_left a.active {
      color: #fff !important;
      background:
        linear-gradient(135deg, rgba(10, 132, 255, 0.28), rgba(100, 210, 255, 0.08)) !important;
      border-color: rgba(100, 210, 255, 0.20) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 6px 18px rgba(10, 132, 255, 0.10) !important;
    }

    #sidebar_left hr,
    #sidebar_left .sidebar-divider {
      border-color: var(--us-border) !important;
      opacity: 1 !important;
    }

    /* Project rail. */
    #pmlt {
      min-height: calc(100vh - 60px) !important;
      border-right: 1px solid var(--us-border) !important;
    }

    #pmlt::before,
    #pmlt::after {
      content: none !important;
      display: none !important;
    }

    #pmlt h1,
    #pmlt h1 * {
      color: #fff !important;
      text-shadow: 0 3px 14px rgba(0, 0, 0, 0.22) !important;
    }

    #pmlt h2,
    #pmlt h3,
    #pmlt small,
    #pmlt strong,
    #pmlt div,
    #pmlt li,
    #pmlt address {
      color: var(--us-text-soft) !important;
    }

    #pmlt a {
      color: var(--us-text-soft) !important;
      text-shadow: none !important;
    }

    #pmlt a:hover,
    #pmlt a:focus,
    #pmlt a.active {
      color: var(--us-blue-bright) !important;
    }

    #pmlt hr {
      border-color: var(--us-border-strong) !important;
    }

    /* Glass cards and panels. */
    .panel,
    .panel-default,
    .well,
    .modal-content,
    .popover,
    .dropdown-menu,
    #customer-info,
    #customer-name,
    #showbtns,
    #mapcontainer,
    #filesbox,
    #descriptionbox,
    #projectbox,
    #designbox,
    .note-editor,
    .cke {
      position: relative !important;
      color: var(--us-text) !important;
      background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.014) 42%, rgba(10, 132, 255, 0.018)),
        var(--us-glass) !important;
      background-color: var(--us-glass) !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-lg) !important;
      box-shadow: var(--us-inner-highlight), var(--us-shadow-sm) !important;
      animation: none !important;
    }

    .panel::before,
    .panel::after,
    .well::before,
    .well::after,
    .modal-content::before,
    .modal-content::after,
    #customer-info::before,
    #customer-info::after,
    #filesbox::before,
    #filesbox::after,
    #descriptionbox::before,
    #descriptionbox::after,
    #designbox::before,
    #designbox::after {
      content: none !important;
      display: none !important;
    }

    .panel-heading,
    .panel-footer,
    .modal-header,
    .modal-footer,
    .cke_top,
    .cke_bottom,
    .note-toolbar {
      color: var(--us-text) !important;
      background:
        linear-gradient(90deg, rgba(10, 132, 255, 0.06), transparent 48%),
        rgba(255, 255, 255, 0.025) !important;
      background-color: rgba(255, 255, 255, 0.025) !important;
      border-color: var(--us-border) !important;
      box-shadow: none !important;
    }

    .panel-heading:first-child,
    .modal-header:first-child {
      border-radius: calc(var(--us-radius-lg) - 1px) calc(var(--us-radius-lg) - 1px) 0 0 !important;
    }

    .panel-body,
    .modal-body,
    .popover-content {
      color: var(--us-text) !important;
      background: transparent !important;
      border: 0 !important;
    }

    .panel-title,
    .panel-title a,
    .modal-title {
      color: var(--us-text) !important;
    }

    /* Typography. */
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    strong,
    b {
      color: var(--us-text) !important;
      text-shadow: none !important;
    }

    p,
    li,
    td,
    th,
    label,
    address,
    .help-block {
      color: var(--us-text-soft) !important;
      text-shadow: none !important;
    }

    small,
    .text-muted,
    .muted,
    .help-block,
    .subtext,
    .sub-text {
      color: var(--us-text-muted) !important;
    }

    a:not(.btn) {
      color: #89c8ff !important;
      text-shadow: none !important;
    }

    a:not(.btn):hover,
    a:not(.btn):focus {
      color: var(--us-blue-bright) !important;
    }

    /* Tables. */
    html body #content table,
    html body #content .table,
    html body .tray-center table,
    html body .tray-center .table,
    html body .panel table,
    html body .panel .table,
    html body .tab-content table,
    html body .tab-content .table {
      width: 100%;
      color: var(--us-text) !important;
      background: rgba(12, 18, 25, 0.34) !important;
      border: 1px solid var(--us-border) !important;
      border-collapse: separate !important;
      border-spacing: 0 !important;
      border-radius: var(--us-radius-md) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
      overflow: hidden;
    }

    html body #content table thead,
    html body #content table thead tr,
    html body #content table thead th,
    html body .tray-center table thead th {
      color: #e4edf6 !important;
      background:
        linear-gradient(180deg, rgba(10, 132, 255, 0.10), rgba(255, 255, 255, 0.025)) !important;
      border-color: var(--us-border) !important;
      font-weight: 600 !important;
      text-transform: none !important;
    }

    html body #content table tbody,
    html body #content table tbody tr,
    html body #content table tbody td,
    html body #content table tbody th,
    html body .tray-center table tbody tr,
    html body .tray-center table tbody td,
    html body .tray-center table tbody th {
      color: var(--us-text-soft) !important;
      background: transparent !important;
      border-color: rgba(215, 235, 255, 0.075) !important;
      box-shadow: none !important;
    }

    html body #content table tbody tr:hover,
    html body .tray-center table tbody tr:hover {
      color: #fff !important;
      background: rgba(10, 132, 255, 0.075) !important;
    }

    html body #content table tbody tr:hover td,
    html body .tray-center table tbody tr:hover td {
      color: #eef7ff !important;
    }

    /* Buttons: visual treatment only. No forced heights or padding. */
    .btn,
    button,
    input[type="button"],
    input[type="submit"] {
      position: relative !important;
      color: var(--us-text-soft) !important;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.085), rgba(255, 255, 255, 0.035)) !important;
      background-color: rgba(30, 39, 50, 0.72) !important;
      background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.085), rgba(255, 255, 255, 0.035)) !important;
      border: 1px solid var(--us-border-strong) !important;
      border-radius: var(--us-radius-sm) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 3px 10px rgba(0, 0, 0, 0.12) !important;
      font-weight: 550 !important;
      text-transform: none !important;
      text-shadow: none !important;
      transform: none !important;
      animation: none !important;
      transition: color 120ms ease, background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease !important;
    }

    .btn::before,
    .btn::after,
    button::before,
    button::after {
      content: none !important;
      display: none !important;
    }

    .btn:hover,
    .btn:focus,
    button:hover,
    button:focus,
    input[type="button"]:hover,
    input[type="submit"]:hover {
      color: #fff !important;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(10, 132, 255, 0.09)) !important;
      border-color: rgba(100, 210, 255, 0.28) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10), 0 5px 16px rgba(0, 0, 0, 0.16) !important;
      outline: none !important;
    }

    .btn-primary,
    .btn-info,
    .btn.active,
    button.active {
      color: #fff !important;
      background:
        linear-gradient(180deg, rgba(36, 150, 255, 0.92), rgba(10, 105, 214, 0.90)) !important;
      border-color: rgba(100, 210, 255, 0.38) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 6px 18px rgba(10, 132, 255, 0.20) !important;
    }

    .btn-success {
      color: #e8f8ef !important;
      background: rgba(67, 139, 96, 0.26) !important;
      border-color: rgba(121, 201, 158, 0.32) !important;
    }

    .btn-warning,
    a[href*="clock"],
    .clock-actions,
    .btn[href*="clock"] {
      color: #f7eedc !important;
      background: rgba(169, 132, 61, 0.24) !important;
      border-color: rgba(209, 180, 109, 0.34) !important;
    }

    .btn-danger {
      color: #fae9e9 !important;
      background: rgba(159, 75, 75, 0.25) !important;
      border-color: rgba(213, 141, 141, 0.34) !important;
    }

    .btn:disabled,
    button:disabled,
    input[type="button"]:disabled,
    input[type="submit"]:disabled {
      opacity: 0.46 !important;
      filter: saturate(0.75) !important;
      cursor: default !important;
    }

    /* Forms. */
    input,
    textarea,
    select,
    .form-control {
      color: var(--us-text) !important;
      background: rgba(10, 16, 23, 0.58) !important;
      background-color: rgba(10, 16, 23, 0.58) !important;
      background-image: none !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-sm) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
      text-shadow: none !important;
    }

    input:hover,
    textarea:hover,
    select:hover,
    .form-control:hover {
      border-color: rgba(215, 235, 255, 0.16) !important;
    }

    input:focus,
    textarea:focus,
    select:focus,
    .form-control:focus {
      color: #fff !important;
      background-color: rgba(10, 16, 23, 0.72) !important;
      border-color: var(--us-blue-focus) !important;
      box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.035) !important;
      outline: none !important;
    }

    input::placeholder,
    textarea::placeholder {
      color: var(--us-text-faint) !important;
      opacity: 1 !important;
    }

    select,
    select.form-control,
    #pmlt select,
    #content select,
    .panel select,
    .panel-body select {
      color-scheme: dark !important;
      padding-right: 10px !important;
    }

    select option,
    select optgroup {
      color: var(--us-text-soft) !important;
      background: #141b24 !important;
      background-color: #141b24 !important;
    }

    /* Existing Projects search filters. */
    html body #content .tray-left form#form label.field.select,
    html body #content .tray-left form#form .field.select {
      color-scheme: dark !important;
      color: var(--us-text-soft) !important;
      background: rgba(10, 16, 23, 0.62) !important;
      background-color: rgba(10, 16, 23, 0.62) !important;
      background-image: none !important;
      border-radius: var(--us-radius-sm) !important;
      box-shadow: none !important;
    }

    html body #content .tray-left form#form label.field.select::before,
    html body #content .tray-left form#form label.field.select::after,
    html body #content .tray-left form#form .field.select::before,
    html body #content .tray-left form#form .field.select::after {
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    html body #content .tray-left form#form .field.select select,
    html body #content .tray-left form#form select.input-sm {
      color-scheme: dark !important;
      forced-color-adjust: none !important;
      color: var(--us-text-soft) !important;
      -webkit-text-fill-color: var(--us-text-soft) !important;
      background: rgba(10, 16, 23, 0.78) !important;
      background-color: rgba(10, 16, 23, 0.78) !important;
      background-image: none !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-sm) !important;
      box-shadow: none !important;
      opacity: 1 !important;
      filter: none !important;
      mix-blend-mode: normal !important;
      appearance: none !important;
      -webkit-appearance: none !important;
    }

    html body #content .tray-left form#form .field.select select:disabled,
    html body #content .tray-left form#form .field.select select[disabled],
    html body #content .tray-left form#form select.input-sm:disabled,
    html body #content .tray-left form#form select.input-sm[disabled] {
      color: var(--us-text-muted) !important;
      -webkit-text-fill-color: var(--us-text-muted) !important;
      background: rgba(17, 24, 33, 0.78) !important;
      background-color: rgba(17, 24, 33, 0.78) !important;
      border-color: var(--us-border) !important;
      opacity: 1 !important;
    }

    html body #content .tray-left form#form .field.select > i.arrow.double {
      color: var(--us-text-muted) !important;
      border-top-color: var(--us-text-muted) !important;
      border-bottom-color: var(--us-text-muted) !important;
      opacity: 0.95 !important;
      pointer-events: none !important;
    }

    /* Menus, popovers, date pickers and Select2. */
    .dropdown-menu,
    .popover,
    .tooltip-inner,
    .tt-dropdown-menu,
    .daterangepicker.dropdown-menu,
    .colorpicker.dropdown-menu,
    .datepicker,
    .ui-datepicker,
    .bootstrap-datetimepicker-widget,
    .multiselect-container.dropdown-menu,
    .select2-dropdown,
    .select2-container .select2-selection,
    .select2-container .select2-selection--single,
    .select2-container .select2-selection--multiple {
      z-index: 2147483000 !important;
      color: var(--us-text) !important;
      background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.04), transparent 50%),
        rgba(16, 23, 32, 0.94) !important;
      background-color: rgba(16, 23, 32, 0.94) !important;
      background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.04), transparent 50%) !important;
      border: 1px solid var(--us-border-strong) !important;
      border-radius: var(--us-radius-md) !important;
      box-shadow: var(--us-inner-highlight), var(--us-shadow-lg) !important;
    }

    .dropdown-menu > li > a,
    .tt-suggestion,
    .multiselect-container.dropdown-menu > li > a > label,
    .select2-results__option {
      color: var(--us-text-soft) !important;
      border-radius: var(--us-radius-sm) !important;
    }

    .dropdown-menu > li > a:hover,
    .dropdown-menu > li > a:focus,
    .tt-suggestion:hover,
    .tt-suggestion.tt-cursor,
    .select2-results__option--highlighted,
    .select2-results__option[aria-selected="true"] {
      color: #fff !important;
      background: rgba(10, 132, 255, 0.14) !important;
    }

    /* Alerts. */
    .alert,
    .alert-info,
    .alert-success,
    .alert-warning,
    .alert-danger,
    .alert-micro {
      color: var(--us-text-soft) !important;
      background: rgba(18, 25, 34, 0.74) !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-md) !important;
      box-shadow: var(--us-inner-highlight) !important;
    }

    .alert-info {
      border-color: rgba(127, 200, 248, 0.24) !important;
      background: rgba(42, 121, 174, 0.13) !important;
    }

    .alert-success {
      border-color: rgba(121, 201, 158, 0.24) !important;
      background: rgba(66, 137, 96, 0.13) !important;
    }

    .alert-warning {
      border-color: rgba(209, 180, 109, 0.26) !important;
      background: rgba(148, 115, 47, 0.13) !important;
    }

    .alert-danger {
      border-color: rgba(213, 141, 141, 0.26) !important;
      background: rgba(151, 67, 67, 0.14) !important;
    }

    /* Tabs. */
    .tab-block,
    .tab-block .tab-content,
    .page-tabs,
    .tabs-bg.nav-tabs,
    .tabs-bg.tabs-below {
      color: var(--us-text) !important;
      background: rgba(18, 25, 34, 0.64) !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-lg) !important;
      box-shadow: var(--us-inner-highlight), var(--us-shadow-sm) !important;
    }

    .nav-tabs > li > a,
    .tabs-left > li > a,
    .tabs-right > li > a,
    .tabs-below > li > a,
    .panel-tabs > li > a {
      color: var(--us-text-muted) !important;
      background: transparent !important;
      border: 1px solid transparent !important;
      border-radius: var(--us-radius-sm) !important;
      text-transform: none !important;
    }

    .nav-tabs > li.active > a,
    .nav-tabs > li.active > a:hover,
    .nav-tabs > li.active > a:focus,
    .tabs-left > li.active > a {
      color: #fff !important;
      background: rgba(10, 132, 255, 0.14) !important;
      border-color: rgba(100, 210, 255, 0.20) !important;
    }

    /* Editors. */
    .cke,
    .cke_chrome,
    .admin-skin.cke_chrome,
    .cke_inner,
    .note-editor,
    .markItUp,
    .md-editor {
      color: var(--us-text) !important;
      background: rgba(15, 22, 31, 0.82) !important;
      background-color: rgba(15, 22, 31, 0.82) !important;
      background-image: none !important;
      border-color: var(--us-border) !important;
      box-shadow: var(--us-inner-highlight), var(--us-shadow-sm) !important;
    }

    .cke_toolgroup,
    .cke_combo_button,
    .note-btn-group,
    .note-editor .btn-group,
    .md-editor > .md-header .btn-group {
      background: rgba(255, 255, 255, 0.035) !important;
      border-color: var(--us-border) !important;
      box-shadow: none !important;
    }

    .cke_contents,
    .cke_wysiwyg_frame,
    .cke_wysiwyg_div,
    .note-editor .note-editable,
    .markItUpEditor,
    .md-editor > textarea,
    .md-editor > .md-preview {
      color: var(--us-text) !important;
      background: rgba(8, 13, 19, 0.82) !important;
      border-color: var(--us-border) !important;
      text-shadow: none !important;
    }

    /* Pagination. */
    .pagination,
    .dataTables_paginate {
      background: transparent !important;
      border: 0 !important;
    }

    .pagination > li > a,
    .pagination > li > span,
    .dataTables_paginate .paginate_button {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.045) !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-sm) !important;
      box-shadow: none !important;
    }

    .pagination > .active > a,
    .pagination > .active > span,
    .dataTables_paginate .paginate_button.current {
      color: #fff !important;
      background: rgba(10, 132, 255, 0.22) !important;
      border-color: rgba(100, 210, 255, 0.28) !important;
    }

    /* Labels and badges. */
    .label,
    .badge {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.075) !important;
      border: 1px solid rgba(255, 255, 255, 0.075) !important;
      text-shadow: none !important;
    }

    .label-primary,
    .badge-primary,
    .label-info,
    .badge-info {
      color: #eaf6ff !important;
      background: rgba(10, 132, 255, 0.22) !important;
      border-color: rgba(100, 210, 255, 0.18) !important;
    }

    /* Important notes, rich text and Description repairs. */
    html body :is(#descriptionbox, #designbox, .us-sign-description-panel, .us-sign-readable-content)
    :is([style*="color:red" i], [style*="color: red" i], [style*="#ff0000" i], [style*="#f00" i], font[color="red" i], font[color="#ff0000" i]) {
      color: #c49a96 !important;
      -webkit-text-fill-color: #c49a96 !important;
    }

    html body :is(#descriptionbox, #designbox, .us-sign-description-panel, .us-sign-readable-content)
    :is([style*="color:green" i], [style*="color: green" i], [style*="#008000" i], [style*="#00ff00" i], font[color="green" i], font[color="#008000" i]) {
      color: #acd0b5 !important;
      -webkit-text-fill-color: #acd0b5 !important;
    }

    html body :is(#descriptionbox, .us-sign-description-panel)
    .panel-body :is(
      mark,
      .marker,
      [style*="background:" i],
      [style*="background-color:" i],
      [bgcolor]
    ) {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      text-shadow: none !important;
    }

    /* Keep status colors readable on glass. */
    .text-success { color: #93d9b2 !important; }
    .text-warning { color: #dec384 !important; }
    .text-danger { color: #dfa0a0 !important; }
    .text-info { color: #91d2ff !important; }
    .text-primary { color: #8ccaff !important; }

    /* Scrollbars. */
    * {
      scrollbar-color: rgba(104, 173, 230, 0.42) rgba(7, 11, 16, 0.38);
    }

    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(7, 11, 16, 0.34) !important;
    }

    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, rgba(100, 210, 255, 0.38), rgba(10, 132, 255, 0.30)) !important;
      border: 2px solid rgba(7, 11, 16, 0.42) !important;
      border-radius: 999px !important;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, rgba(100, 210, 255, 0.54), rgba(10, 132, 255, 0.46)) !important;
    }

    @media (min-width: 992px) {
      .col-md-1 { width: 8.33333333% !important; }
      .col-md-2 { width: 16.66666667% !important; }
      .col-md-3 { width: 25% !important; }
      .col-md-4 { width: 33.33333333% !important; }
      .col-md-5 { width: 41.66666667% !important; }
      .col-md-6 { width: 50% !important; }
      .col-md-7 { width: 58.33333333% !important; }
      .col-md-8 { width: 66.66666667% !important; }
      .col-md-9 { width: 75% !important; }
      .col-md-10 { width: 83.33333333% !important; }
      .col-md-11 { width: 91.66666667% !important; }
      .col-md-12 { width: 100% !important; }
    }

    @media (max-width: 760px) {
      header.navbar .navbar-brand img {
        max-width: 150px !important;
      }

      .navbar-form,
      .timeclock-container {
        max-width: 100% !important;
      }
    }


    /* =========================================================
       v2.0.1 WALLPAPER VISIBILITY + LATE SHELL OWNERSHIP
       The native Design page and later userscripts can repaint outer
       workspace layers after the theme starts. These selectors own only
       structural shells, leaving functional cards and content panels intact.
    ========================================================= */

    html,
    body {
      background-color: var(--us-bg-deep) !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.18), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.08), transparent 34%),
        linear-gradient(rgba(5, 9, 14, 0.38), rgba(7, 11, 16, 0.66)),
        var(--us-wallpaper) !important;
      background-position: center center !important;
      background-size: cover !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
    }

    html body #main,
    html body #content_wrapper,
    html body #content,
    html body #content > .tray,
    html body #content > .tray-left,
    html body #content > .tray-right,
    html body #content > .tray-center,
    html body .tray,
    html body .tray-left,
    html body .tray-right,
    html body .tray-center,
    html body .tray-inner,
    html body .tray-center > .pl15,
    html body .tray-center > .pr15,
    html body .tray-center > .pl15.pr15,
    html body #content .us-sign-design-workbench,
    html body #content .us-sign-design-workspace-column {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    /* The outer Design panel is a layout shell. Inner panels remain glass. */
    html body #content .us-sign-design-workspace-column > .panel,
    html body #content .us-sign-design-workspace-column > .panel > .panel-body {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    /* Force the project rail to stay dark glass even when later project CSS runs. */
    html.us-sign-project-page body #pmlt,
    html body:has(#pmlt) #pmlt {
      color: var(--us-text-soft) !important;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012)),
        rgba(9, 15, 23, 0.70) !important;
      background-color: rgba(9, 15, 23, 0.70) !important;
      background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012)) !important;
      border-right: 1px solid var(--us-blue-border) !important;
      box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.035), 10px 0 32px rgba(0, 0, 0, 0.18) !important;
      -webkit-backdrop-filter: blur(20px) saturate(140%) !important;
      backdrop-filter: blur(20px) saturate(140%) !important;
    }

    /* Keep the main Design content readable while letting wallpaper breathe around it. */
    html body #content #us-sign-design-actionbar,
    html body #content #us-sign-job-overview,
    html body #content #us-sign-design-summary,
    html body #content #us-sign-design-bottom-grid .panel,
    html body #content #customer-name,
    html body #content #customer-info,
    html body #content .well {
      border-color: rgba(165, 210, 245, 0.13) !important;
    }

    /* =========================================================
       v2.0.2 DEDICATED WALLPAPER LAYER
       Keep the image in its own fixed layer so SquareCoil's native table
       layout cannot replace the viewport background with a flat color.
    ========================================================= */

    body {
      position: relative !important;
      isolation: isolate !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    body::before {
      content: "" !important;
      position: fixed !important;
      inset: 0 !important;
      z-index: -1 !important;
      pointer-events: none !important;
      background-color: #0a1018 !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.18), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.08), transparent 34%),
        linear-gradient(rgba(4, 8, 13, 0.34), rgba(6, 11, 17, 0.62)),
        var(--us-wallpaper) !important;
      background-position: center center !important;
      background-size: cover !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
    }

    html body #main,
    html body #content_wrapper,
    html body section#content_wrapper,
    html body #content,
    html body section#content,
    html body #content.table-layout,
    html body .table-layout,
    html body #content > .tray,
    html body #content > aside.tray,
    html body #content > section.tray,
    html body #content > .tray-left,
    html body #content > .tray-right,
    html body #content > .tray-center,
    html body #content .tray-center,
    html body #content .tray-left,
    html body #content .tray-right,
    html body .tray-inner,
    html body .tray-center > .pl15,
    html body .tray-center > .pr15,
    html body .tray-center > .pl15.pr15,
    html body #content .us-sign-design-workbench,
    html body #content .us-sign-design-workspace-column {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    html body #main::before,
    html body #main::after,
    html body #content_wrapper::before,
    html body #content_wrapper::after,
    html body #content::before,
    html body #content::after,
    html body #content.table-layout::before,
    html body #content.table-layout::after,
    html body .tray-center::before,
    html body .tray-center::after {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    /* Project rail remains translucent instead of reverting to native gray. */
    html.us-sign-project-page body #pmlt,
    html body:has(#pmlt) #pmlt {
      background:
        linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012)),
        rgba(8, 14, 22, 0.67) !important;
      background-color: rgba(8, 14, 22, 0.67) !important;
      border-right-color: rgba(100, 210, 255, 0.22) !important;
    }

    /* =========================================================
       v2.0.3 WALLPAPER STACKING FIX
       v2.0.2 used body::before with a negative stack level inside an
       isolated body. Move the image to the root stacking context instead.
    ========================================================= */

    html {
      position: relative !important;
      isolation: isolate !important;
      background: #081019 !important;
      background-color: #081019 !important;
      background-image: none !important;
    }

    html::before {
      content: "" !important;
      position: fixed !important;
      inset: 0 !important;
      z-index: 0 !important;
      display: block !important;
      pointer-events: none !important;
      background-color: #0a1018 !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.20), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.10), transparent 34%),
        linear-gradient(rgba(4, 8, 13, 0.30), rgba(6, 11, 17, 0.58)),
        url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1"),
        url("https://bing.gifposter.com/bingImages/LagoPehoe_1920x1080.jpg") !important;
      background-position: center center !important;
      background-size: cover !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
    }

    body {
      position: relative !important;
      z-index: 1 !important;
      isolation: auto !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    body::before {
      content: none !important;
      display: none !important;
      background: none !important;
    }

    /* Keep the real app above the root wallpaper layer. */
    header.navbar,
    #main,
    #content_wrapper,
    #content {
      position: relative !important;
      z-index: 1 !important;
    }

    /* Structural shells only. Functional cards keep their glass surfaces. */
    html body #main,
    html body #content_wrapper,
    html body #content,
    html body #content.table-layout,
    html body #content > .tray,
    html body #content > aside.tray,
    html body #content > section.tray,
    html body #content .tray-center,
    html body #content .tray-left,
    html body #content .tray-right,
    html body #content .tray-inner,
    html body #content .tray-center > .pl15,
    html body #content .tray-center > .pr15,
    html body #content .tray-center > .pl15.pr15,
    html body #content .us-sign-design-workbench,
    html body #content .us-sign-design-workspace-column,
    html body #content .us-sign-design-workspace-column > .panel,
    html body #content .us-sign-design-workspace-column > .panel > .panel-body {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    /* =========================================================
       v2.0.4 PROJECT PAGE TOP-GAP CLEANUP
       Native tray padding plus project-wrapper margins were stacking into
       the large empty band below the navbar. Keep one small consistent gap.
    ========================================================= */

    html.us-sign-project-page body #content,
    html body:has(#pmlt) #content {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }

    html.us-sign-project-page body #content > .tray,
    html.us-sign-project-page body #content > .tray-left,
    html.us-sign-project-page body #content > .tray-center,
    html.us-sign-project-page body #content > .tray-right,
    html body:has(#pmlt) #content > .tray,
    html body:has(#pmlt) #content > .tray-left,
    html body:has(#pmlt) #content > .tray-center,
    html body:has(#pmlt) #content > .tray-right {
      margin-top: 0 !important;
      padding-top: 10px !important;
    }

    html.us-sign-project-page body #pmlt,
    html body:has(#pmlt) #pmlt {
      margin-top: 0 !important;
    }

    html.us-sign-project-page body #content .tray-center > .pl15,
    html.us-sign-project-page body #content .tray-center > .pr15,
    html.us-sign-project-page body #content .tray-center > .pl15.pr15,
    html body:has(#pmlt) #content .tray-center > .pl15,
    html body:has(#pmlt) #content .tray-center > .pr15,
    html body:has(#pmlt) #content .tray-center > .pl15.pr15 {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }

    html.us-sign-project-page body #content .tray-center > .pl15 > :first-child,
    html.us-sign-project-page body #content .tray-center > .pr15 > :first-child,
    html.us-sign-project-page body #content .tray-center > .pl15.pr15 > :first-child,
    html body:has(#pmlt) #content .tray-center > .pl15 > :first-child,
    html body:has(#pmlt) #content .tray-center > .pr15 > :first-child,
    html body:has(#pmlt) #content .tray-center > .pl15.pr15 > :first-child {
      margin-top: 0 !important;
    }

    @media print {
      html,
      body,
      #main,
      #content_wrapper,
      #content,
      .tray,
      .tray-left,
      .tray-right,
      .tray-center,
      .panel,
      .well,
      table,
      .table {
        color: #000 !important;
        background: #fff !important;
        background-image: none !important;
        box-shadow: none !important;
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
    }
  `);


  /* v2.0.3: bounded late-shell cleanup. Design Job Tools mounts after this
     theme, so clear only its outer ancestor shells a few times during startup.
     No observer and no recurring interval. */
  function usSignClearWallpaperShell(element) {
    if (!(element instanceof Element)) return;
    element.style.setProperty("background", "transparent", "important");
    element.style.setProperty("background-color", "transparent", "important");
    element.style.setProperty("background-image", "none", "important");
  }

  function usSignWallpaperPass() {
    [
      "#main",
      "#content_wrapper",
      "#content",
      "#content.table-layout",
      "#content > .tray",
      "#content .tray-center",
      "#content .tray-left",
      "#content .tray-right",
      "#content .tray-inner",
      "#content .tray-center > .pl15",
      "#content .tray-center > .pr15",
      "#content .tray-center > .pl15.pr15",
      "#content .us-sign-design-workbench",
      "#content .us-sign-design-workspace-column"
    ].forEach((selector) => {
      document.querySelectorAll(selector).forEach(usSignClearWallpaperShell);
    });

    const actionbar = document.getElementById("us-sign-design-actionbar");
    if (actionbar) {
      let current = actionbar.parentElement;
      while (current && current !== document.body) {
        usSignClearWallpaperShell(current);
        if (current.id === "content") break;
        current = current.parentElement;
      }
    }

    const rail = document.getElementById("pmlt");
    if (rail) {
      rail.style.setProperty(
        "background",
        "linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.012)), rgba(8,14,22,.67)",
        "important"
      );
      rail.style.setProperty("background-color", "rgba(8,14,22,.67)", "important");
    }
  }

  function usSignScheduleWallpaperPasses() {
    [0, 220, 650, 1300, 2400, 3600].forEach((delay) => {
      window.setTimeout(usSignWallpaperPass, delay);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", usSignScheduleWallpaperPasses, { once: true });
  } else {
    usSignScheduleWallpaperPasses();
  }
  window.addEventListener("pageshow", usSignScheduleWallpaperPasses);


})();
