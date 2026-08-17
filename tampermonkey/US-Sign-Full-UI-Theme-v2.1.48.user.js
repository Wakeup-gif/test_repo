// ==UserScript==
// @name         US Sign Full UI Theme
// @namespace    us-sign-full-modules
// @version      2.1.48
// @description  Stable SquareCoil frosted-glass UI with a dedicated usable collapsed-sidebar toggle row, one shared wallpaper behind sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      www.bing.com
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Full-UI-Theme.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Full-UI-Theme.user.js
// ==/UserScript==

(function () {
  "use strict";

  const usSignIsProjectStatusPage = /\/project_milestones\.php$/i.test(location.pathname);
  if (usSignIsProjectStatusPage && document.documentElement) {
    document.documentElement.classList.add("us-sign-project-status-page");
  }

  GM_addStyle(String.raw`
    @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;650;700&display=swap");

    :root {
      --us-bg: rgba(9, 15, 23, 0.52);
      --us-bg-elevated: rgba(16, 24, 34, 0.82);
      --us-bg-soft: rgba(22, 31, 42, 0.76);
      --us-glass: rgba(18, 27, 38, 0.70);
      --us-glass-strong: rgba(13, 21, 31, 0.86);
      --us-glass-soft: rgba(255, 255, 255, 0.045);
      --us-hover: rgba(100, 180, 255, 0.10);
      --us-text: #f5f8fb;
      --us-text-soft: #d2d9e1;
      --us-text-muted: #96a5b5;
      --us-accent: #8ecbff;
      --us-accent-soft: rgba(10, 132, 255, 0.18);
      --us-design-surface: rgba(7, 15, 25, 0.14);
      --us-design-surface-strong: rgba(7, 15, 25, 0.17);
      --us-design-surface-soft: rgba(255, 255, 255, 0.018);
      --us-design-hover: rgba(118, 190, 246, 0.055);
      --us-design-border: rgba(226, 242, 255, 0.07);
      --us-design-border-strong: rgba(226, 242, 255, 0.105);
      --us-design-accent-soft: rgba(80, 165, 238, 0.10);
      --us-success: #78a88a;
      --us-warning: #c7a96b;
      --us-danger: #c47a7a;
      --us-info: #78c7ff;
      --us-border: rgba(169, 211, 247, 0.12);
      --us-border-strong: rgba(181, 220, 252, 0.19);
      --us-border-focus: rgba(10, 132, 255, 0.52);
      --us-shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.18);
      --us-shadow-md: 0 12px 32px rgba(0, 0, 0, 0.24);
      --us-shadow-lg: 0 22px 54px rgba(0, 0, 0, 0.34);
      --us-radius-sm: 7px;
      --us-radius-md: 10px;
      --us-radius-lg: 14px;
      --us-font: "Manrope", "Avenir Next", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      --us-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      --us-wallpaper: url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1");
    }

    html,
    body {
      min-height: 100% !important;
      margin: 0 !important;
      padding-top: 0 !important;
      color: var(--us-text) !important;
      background: var(--us-bg) !important;
      background-color: var(--us-bg) !important;
      background-image: none !important;
      font-family: var(--us-font) !important;
      letter-spacing: 0 !important;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    ::selection {
      color: var(--us-text) !important;
      background: rgba(193, 204, 215, 0.28) !important;
    }

    /* Canvas and tray repair. This intentionally overrides native white tray backgrounds. */
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
      background: var(--us-bg) !important;
      background-color: var(--us-bg) !important;
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
      min-height: calc(100vh - 60px) !important;
    }

    .container,
    .container-fluid {
      margin-right: auto;
      margin-left: auto;
      padding-right: 11px;
      padding-left: 11px;
    }

    .row {
      margin-right: -11px !important;
      margin-left: -11px !important;
    }

    .row::before,
    .row::after {
      display: table;
      content: " ";
    }

    .row::after {
      clear: both;
    }

    [class*="col-xs-"],
    [class*="col-sm-"],
    [class*="col-md-"],
    [class*="col-lg-"],
    [class*="col-xl-"] {
      position: relative;
      min-height: 1px;
      padding-right: 11px !important;
      padding-left: 11px !important;
    }

    body,
    input,
    textarea,
    select,
    button {
      font-family: var(--us-font) !important;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    .panel-title,
    #pmlt h1,
    #pmlt h2 {
      color: var(--us-text) !important;
      font-family: var(--us-font) !important;
      font-weight: 650 !important;
      letter-spacing: -0.015em !important;
      text-transform: none !important;
      text-shadow: none !important;
    }

    p,
    li,
    label,
    td,
    th,
    address {
      color: var(--us-text-soft) !important;
    }

    small,
    .text-muted,
    .help-block,
    .panel-heading small,
    #pmlt small {
      color: var(--us-text-muted) !important;
    }

    strong,
    b {
      color: var(--us-text) !important;
      font-weight: 650 !important;
    }

    a,
    .design-link,
    .panel-body a,
    #pmlt a,
    #project_menu a {
      color: var(--us-accent) !important;
      text-decoration: none !important;
      text-shadow: none !important;
    }

    a:hover,
    a:focus,
    .design-link:hover,
    .panel-body a:hover,
    #pmlt a:hover,
    #project_menu a:hover {
      color: #fff !important;
    }

    header,
    header.navbar,
    .navbar,
    .navbar-fixed-top,
    #topbar,
    .topbar {
      top: 0 !important;
      margin-top: 0 !important;
      color: var(--us-text) !important;
      background: rgba(20, 24, 29, 0.96) !important;
      background-image: none !important;
      border: 0 !important;
      border-bottom: 1px solid var(--us-border) !important;
      box-shadow: var(--us-shadow-sm) !important;
      transform: none !important;
    }

    header::before,
    header::after,
    .navbar::before,
    .navbar::after,
    #topbar::before,
    #topbar::after {
      content: none !important;
      display: none !important;
    }

    header.navbar .navbar-brand,
    header.navbar .navbar-branding,
    html body #logo,
    html body .logo,
    html body .brand {
      overflow: visible !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    header.navbar .navbar-brand img,
    header.navbar img[src*="US-Sign" i],
    header.navbar img[src*="USSIGN" i],
    header.navbar img[src*="logo" i] {
      position: relative !important;
      z-index: 20 !important;
      display: block !important;
      visibility: visible !important;
      width: auto !important;
      max-width: 180px !important;
      height: auto !important;
      max-height: 52px !important;
      object-fit: contain !important;
      object-position: left center !important;
      opacity: 1 !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      filter: none !important;
    }

    #sidebar_left {
      color: var(--us-text-soft) !important;
      background: rgba(18, 22, 27, 0.96) !important;
      background-image: none !important;
      border-right: 1px solid var(--us-border) !important;
      box-shadow: var(--us-shadow-sm) !important;
    }

    #sidebar_left a,
    #sidebar_left .nav > li > a {
      min-height: 34px !important;
      color: var(--us-text-soft) !important;
      background: transparent !important;
      border: 0 !important;
      border-radius: var(--us-radius-sm) !important;
      font-weight: 500 !important;
      text-transform: none !important;
    }

    #sidebar_left a:hover,
    #sidebar_left .nav > li > a:hover {
      color: var(--us-text) !important;
      background: var(--us-hover) !important;
    }

    #sidebar_left .nav > li.active > a,
    #sidebar_left .active > a,
    #sidebar_left a.active {
      color: var(--us-text) !important;
      background: var(--us-accent-soft) !important;
      border: 1px solid rgba(193, 204, 215, 0.12) !important;
    }

    #pmlt {
      min-height: calc(100vh - 60px) !important;
      color: var(--us-text-soft) !important;
      background: rgba(18, 22, 27, 0.96) !important;
      background-image: none !important;
      border-right: 1px solid var(--us-border) !important;
      box-shadow: none !important;
    }

    #pmlt::before,
    #pmlt::after {
      content: none !important;
      display: none !important;
    }

    #pmlt h1,
    #pmlt h1 * {
      color: var(--us-text) !important;
      text-shadow: none !important;
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
      background: var(--us-glass) !important;
      background-image: none !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-lg) !important;
      box-shadow: var(--us-shadow-sm) !important;
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
      background: rgba(255, 255, 255, 0.025) !important;
      background-image: none !important;
      border-color: var(--us-border) !important;
      box-shadow: none !important;
    }

    .panel-body,
    .modal-body,
    .popover-content {
      color: var(--us-text) !important;
      background: transparent !important;
      border: 0 !important;
    }

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
      background: rgba(255, 255, 255, 0.018) !important;
      border: 1px solid var(--us-border) !important;
      border-collapse: separate !important;
      border-spacing: 0 !important;
      border-radius: var(--us-radius-md) !important;
      box-shadow: none !important;
    }

    html body #content table thead,
    html body #content table thead tr,
    html body #content table thead th,
    html body .tray-center table thead th {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.035) !important;
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
      border-color: var(--us-border) !important;
      box-shadow: none !important;
    }

    html body #content table tbody tr:hover,
    html body .tray-center table tbody tr:hover {
      color: var(--us-text) !important;
      background: var(--us-hover) !important;
    }

    .btn,
    button,
    input[type="button"],
    input[type="submit"] {
      position: relative !important;
      overflow: visible !important;
      min-height: 34px !important;
      padding: 7px 12px !important;
      color: var(--us-text) !important;
      background: rgba(255, 255, 255, 0.055) !important;
      background-image: none !important;
      border: 1px solid var(--us-border-strong) !important;
      border-radius: var(--us-radius-sm) !important;
      box-shadow: none !important;
      font-weight: 550 !important;
      text-transform: none !important;
      text-shadow: none !important;
      transform: none !important;
      animation: none !important;
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
      background: rgba(255, 255, 255, 0.09) !important;
      border-color: rgba(255, 255, 255, 0.22) !important;
    }

    .btn-primary,
    .btn-info {
      color: #edf2f6 !important;
      background: rgba(155, 172, 189, 0.18) !important;
      border-color: rgba(193, 204, 215, 0.24) !important;
    }

    .btn-success {
      color: #dce9e0 !important;
      background: rgba(120, 168, 138, 0.17) !important;
      border-color: rgba(120, 168, 138, 0.28) !important;
    }

    .btn-warning,
    a[href*="clock"],
    .clock-actions,
    .btn[href*="clock"] {
      color: #eee5d2 !important;
      background: rgba(199, 169, 107, 0.16) !important;
      border-color: rgba(199, 169, 107, 0.27) !important;
    }

    .btn-danger {
      color: #f0dcdc !important;
      background: rgba(196, 122, 122, 0.16) !important;
      border-color: rgba(196, 122, 122, 0.28) !important;
    }

    input,
    textarea,
    select,
    .form-control {
      color: var(--us-text) !important;
      background: rgba(255, 255, 255, 0.035) !important;
      background-image: none !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-sm) !important;
      box-shadow: none !important;
    }

    input:focus,
    textarea:focus,
    select:focus,
    .form-control:focus {
      border-color: var(--us-border-focus) !important;
      box-shadow: 0 0 0 3px rgba(193, 204, 215, 0.08) !important;
      outline: none !important;
    }

    input::placeholder,
    textarea::placeholder {
      color: var(--us-text-muted) !important;
    }

    select,
    select.form-control,
    #pmlt select,
    #content select,
    .panel select,
    .panel-body select {
      padding-right: 10px !important;
      appearance: auto !important;
      -webkit-appearance: auto !important;
    }

    /* Existing Projects filters: own the complete select wrapper, not just the native select. */
    html body #content .tray-left form#form label.field.select,
    html body #content .tray-left form#form .field.select {
      color-scheme: dark !important;
      color: var(--us-text-soft) !important;
      background: var(--us-bg-soft) !important;
      background-color: var(--us-bg-soft) !important;
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
      background: #1c2127 !important;
      background-color: #1c2127 !important;
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
      background: #1c2127 !important;
      background-color: #1c2127 !important;
      border-color: var(--us-border) !important;
      opacity: 1 !important;
      cursor: default !important;
    }

    html body #content .tray-left form#form .field.select select:hover,
    html body #content .tray-left form#form .field.select select:focus,
    html body #content .tray-left form#form select.input-sm:hover,
    html body #content .tray-left form#form select.input-sm:focus {
      color: var(--us-text) !important;
      -webkit-text-fill-color: var(--us-text) !important;
      background: #242a31 !important;
      background-color: #242a31 !important;
      border-color: var(--us-border-focus) !important;
      outline: none !important;
    }

    html body #content .tray-left form#form .field.select > i.arrow.double {
      color: var(--us-text-muted) !important;
      border-top-color: var(--us-text-muted) !important;
      border-bottom-color: var(--us-text-muted) !important;
      opacity: 0.9 !important;
      pointer-events: none !important;
    }

    html body #content .tray-left form#form select option,
    html body #content .tray-left form#form select optgroup {
      color: var(--us-text-soft) !important;
      background: var(--us-bg-elevated) !important;
      background-color: var(--us-bg-elevated) !important;
    }

    select option,
    select optgroup {
      color: var(--us-text) !important;
      background: var(--us-bg-elevated) !important;
    }

    .alert,
    .alert-info,
    .alert-success,
    .alert-warning,
    .alert-danger,
    .alert-micro {
      background: rgba(255, 255, 255, 0.035) !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-md) !important;
      box-shadow: none !important;
    }

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
      background: rgba(25, 29, 35, 0.99) !important;
      background-image: none !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-md) !important;
      box-shadow: var(--us-shadow-lg) !important;
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
      color: var(--us-text) !important;
      background: var(--us-hover) !important;
    }

    .tab-block,
    .tab-block .tab-content,
    .page-tabs,
    .tabs-bg.nav-tabs,
    .tabs-bg.tabs-below {
      color: var(--us-text) !important;
      background: var(--us-glass) !important;
      background-image: none !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-lg) !important;
      box-shadow: var(--us-shadow-sm) !important;
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
      color: var(--us-text) !important;
      background: var(--us-accent-soft) !important;
      border-color: rgba(193, 204, 215, 0.14) !important;
    }

    .cke,
    .cke_chrome,
    .admin-skin.cke_chrome,
    .cke_inner,
    .note-editor,
    .markItUp,
    .md-editor {
      color: var(--us-text) !important;
      background: var(--us-glass-strong) !important;
      background-image: none !important;
      border-color: var(--us-border) !important;
      box-shadow: var(--us-shadow-sm) !important;
    }

    .cke_toolgroup,
    .cke_combo_button,
    .note-btn-group,
    .note-editor .btn-group,
    .md-editor > .md-header .btn-group {
      background: rgba(255, 255, 255, 0.03) !important;
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
      background: rgba(17, 20, 24, 0.92) !important;
      border-color: var(--us-border) !important;
      text-shadow: none !important;
    }

    .pagination,
    .dataTables_paginate {
      background: transparent !important;
      border: 0 !important;
    }

    .pagination > li > a,
    .pagination > li > span,
    .dataTables_paginate .paginate_button {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.035) !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-sm) !important;
      box-shadow: none !important;
    }

    .pagination > .active > a,
    .pagination > .active > span,
    .dataTables_paginate .paginate_button.current {
      color: var(--us-text) !important;
      background: var(--us-accent-soft) !important;
      border-color: rgba(193, 204, 215, 0.18) !important;
    }

    .duplicate-modal,
    .modal-backdrop,
    #modal-overlay.duplicate-modal-2,
    .duplicate-modal-2,
    #time-remaining-popup-container {
      background: rgba(5, 7, 9, 0.68) !important;
    }

    .duplicate-modal-content,
    .modal-content,
    .bootbox .modal-content,
    .ui-dialog,
    .ui-widget-content,
    .duplicate-modal-content-2,
    #time-remaining-popup-modal,
    #remaining-time-in-popup,
    #show-materials-used-warning-modal {
      color: var(--us-text) !important;
      background: var(--us-glass-strong) !important;
      background-image: none !important;
      border: 1px solid var(--us-border-strong) !important;
      border-radius: var(--us-radius-lg) !important;
      box-shadow: var(--us-shadow-lg) !important;
    }

    mark,
    .marker,
    [style*="background-color: yellow" i],
    [style*="background: yellow" i],
    [style*="#ffff00" i],
    [style*="#ff0" i] {
      display: inline !important;
      color: var(--us-text) !important;
      -webkit-text-fill-color: var(--us-text) !important;
      background: rgba(211, 186, 134, 0.18) !important;
      border-radius: 4px !important;
      text-shadow: none !important;
      box-shadow: inset 0 0 0 1px rgba(211, 186, 134, 0.16) !important;
    }

    html body :is(#descriptionbox, #designbox, .us-sign-description-panel, .us-sign-readable-content)
    :is([style*="color:blue" i], [style*="color: blue" i], [style*="#0000ff" i], [style*="#00f" i], [style*="rgb(0, 0, 255)" i], font[color="blue" i], font[color="#0000ff" i]) {
      color: #a9c2d8 !important;
      -webkit-text-fill-color: #a9c2d8 !important;
      text-shadow: none !important;
      filter: none !important;
    }

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

    /* Description rich-text cleanup: remove inherited highlight chips while preserving text formatting. */
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

    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    ::-webkit-scrollbar-track {
      background: var(--us-bg) !important;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.16) !important;
      border: 2px solid var(--us-bg) !important;
      border-radius: 999px !important;
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
       v2.1.1 VISUAL-ONLY WALLPAPER + BLUE GLASS
       Source layout is the known-good v1.1.2 immediately before the
       wallpaper commit. Paint changes only: no display/position/spacing,
       tray geometry, widths, transforms, or runtime DOM mutation.
    ========================================================= */

    html {
      background-color: #081019 !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.18), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.08), transparent 34%),
        linear-gradient(rgba(4, 8, 13, 0.30), rgba(6, 11, 17, 0.56)),
        var(--us-wallpaper) !important;
      background-position: center center !important;
      background-size: cover !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
    }

    body {
      background: rgba(7, 11, 16, 0.10) !important;
      background-color: rgba(7, 11, 16, 0.10) !important;
      background-image: none !important;
    }

    header,
    header.navbar,
    .navbar,
    .navbar-fixed-top,
    #topbar,
    .topbar {
      background: rgba(11, 18, 28, 0.84) !important;
      background-color: rgba(11, 18, 28, 0.58) !important;
      border-bottom-color: rgba(100, 210, 255, 0.13) !important;
    }

    #sidebar_left,
    #pmlt {
      background: rgba(10, 17, 26, 0.84) !important;
      background-color: rgba(10, 17, 26, 0.84) !important;
      border-color: rgba(100, 210, 255, 0.13) !important;
    }

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
      background: var(--us-glass) !important;
      background-color: var(--us-glass) !important;
      border-color: var(--us-border) !important;
    }


    html body #main,
    html body #content_wrapper {
      background-color: #081019 !important;
      background-image:
        linear-gradient(rgba(4, 8, 13, 0.28), rgba(6, 11, 17, 0.54)),
        var(--us-wallpaper) !important;
      background-position: center center !important;
      background-size: cover !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
    }

    /* =========================================================
       v2.1.4 CANVAS WALLPAPER STACK
       Keep the v1.1.2 geometry untouched. These structural wrappers retain
       their normal dimensions and flow; only their paint is made lighter so
       the root wallpaper remains visible through stacked canvas layers.
    ========================================================= */

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
      background: rgba(8, 14, 22, 0.10) !important;
      background-color: rgba(8, 14, 22, 0.10) !important;
      background-image: none !important;
    }

    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      header.navbar,
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
      #filesbox,
      #descriptionbox,
      #projectbox,
      #designbox {
        -webkit-backdrop-filter: blur(16px) saturate(130%) !important;
        backdrop-filter: blur(16px) saturate(130%) !important;
      }
    }

    #sidebar_left .nav > li.active > a,
    #sidebar_left .active > a,
    #sidebar_left a.active,
    .pagination > .active > a,
    .pagination > .active > span {
      background: rgba(10, 132, 255, 0.20) !important;
      border-color: rgba(100, 210, 255, 0.20) !important;
    }



    /* =========================================================
       v2.1.5 GLASS POLISH
       Visual hierarchy only. No display, position, sizing, spacing,
       transforms, tray geometry, or runtime DOM mutation.
    ========================================================= */

    :root {
      --us-glass-rail: rgba(9, 17, 27, 0.50);
      --us-glass-header: rgba(10, 18, 28, 0.58);
      --us-glass-hero: rgba(19, 31, 45, 0.32);
      --us-glass-card: rgba(13, 23, 35, 0.40);
      --us-glass-card-strong: rgba(10, 19, 30, 0.48);
      --us-glass-inner: rgba(5, 12, 20, 0.24);
      --us-glass-edge: rgba(174, 219, 255, 0.15);
      --us-glass-edge-soft: rgba(174, 219, 255, 0.09);
      --us-glass-highlight: rgba(255, 255, 255, 0.055);
      --us-glow-blue: rgba(44, 145, 255, 0.12);
      --us-shadow-glass: 0 10px 30px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.045);
      --us-shadow-glass-strong: 0 14px 36px rgba(0, 0, 0, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.055);
    }

    header.navbar,
    #topbar,
    .topbar {
      background:
        linear-gradient(180deg, rgba(29, 48, 68, 0.54), rgba(6, 14, 23, 0.50)) !important;
      background-color: var(--us-glass-header) !important;
      border-bottom-color: var(--us-glass-edge-soft) !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.20), inset 0 -1px 0 rgba(92, 180, 255, 0.035) !important;
    }

    #sidebar_left {
      background:
        linear-gradient(180deg, rgba(18, 34, 49, 0.66), rgba(6, 14, 23, 0.58)) !important;
      background-color: rgba(9, 17, 27, 0.62) !important;
      border-right-color: var(--us-glass-edge-soft) !important;
      box-shadow: 10px 0 28px rgba(0, 0, 0, 0.12), inset -1px 0 0 rgba(255, 255, 255, 0.025) !important;
    }

    #pmlt {
      background:
        linear-gradient(180deg, rgba(20, 39, 56, 0.48), rgba(5, 13, 22, 0.46)) !important;
      background-color: var(--us-glass-rail) !important;
      border-right-color: var(--us-glass-edge) !important;
      box-shadow: 12px 0 30px rgba(0, 0, 0, 0.15), inset -1px 0 0 rgba(255, 255, 255, 0.035) !important;
    }

    #customer-name {
      background:
        linear-gradient(180deg, rgba(112, 150, 186, 0.22), rgba(20, 36, 54, 0.28)) !important;
      background-color: var(--us-glass-hero) !important;
      border-color: rgba(185, 222, 255, 0.16) !important;
      box-shadow: var(--us-shadow-glass), inset 0 1px 0 rgba(255, 255, 255, 0.065) !important;
    }

    #customer-info,
    #projectbox,
    #showbtns {
      background:
        linear-gradient(180deg, rgba(19, 36, 53, 0.50), rgba(6, 15, 25, 0.46)) !important;
      background-color: var(--us-glass-card-strong) !important;
      border-color: var(--us-glass-edge-soft) !important;
      box-shadow: var(--us-shadow-glass-strong) !important;
    }

    #descriptionbox,
    #designbox,
    #filesbox,
    .panel,
    .panel-default,
    .well {
      background:
        linear-gradient(180deg, rgba(25, 46, 65, 0.42), rgba(5, 14, 24, 0.38)) !important;
      background-color: var(--us-glass-card) !important;
      border-color: var(--us-glass-edge-soft) !important;
      box-shadow: var(--us-shadow-glass) !important;
    }

    #descriptionbox > .panel-heading,
    #designbox > .panel-heading,
    #filesbox > .panel-heading,
    .panel > .panel-heading {
      background:
        linear-gradient(180deg, rgba(106, 169, 222, 0.075), rgba(255, 255, 255, 0.012)) !important;
      background-color: rgba(255, 255, 255, 0.018) !important;
      border-bottom-color: var(--us-glass-edge-soft) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035) !important;
    }

    #descriptionbox .panel-body,
    #designbox .panel-body,
    #filesbox .panel-body,
    #projectbox .panel-body,
    #customer-info .panel-body {
      background: rgba(3, 9, 16, 0.035) !important;
      background-color: rgba(3, 9, 16, 0.035) !important;
    }

    html body #content table,
    html body #content .table,
    html body .panel table,
    html body .panel .table {
      background: rgba(4, 11, 19, 0.20) !important;
      border-color: rgba(174, 219, 255, 0.085) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.018) !important;
    }

    html body #content table thead,
    html body #content table thead tr,
    html body #content table thead th,
    html body .panel table thead th {
      background: rgba(116, 173, 224, 0.035) !important;
      border-color: rgba(174, 219, 255, 0.075) !important;
    }

    html body #content table tbody tr:hover,
    html body .panel table tbody tr:hover {
      background: rgba(76, 158, 230, 0.065) !important;
    }

    input:not([type="button"]):not([type="submit"]):not([type="reset"]),
    textarea,
    select,
    .form-control {
      background: rgba(3, 10, 18, 0.36) !important;
      background-color: rgba(3, 10, 18, 0.36) !important;
      border-color: rgba(174, 219, 255, 0.11) !important;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.018) !important;
    }

    input:not([type="button"]):not([type="submit"]):not([type="reset"]):focus,
    textarea:focus,
    select:focus,
    .form-control:focus {
      border-color: rgba(86, 177, 255, 0.40) !important;
      box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.10), inset 0 1px 2px rgba(0, 0, 0, 0.14) !important;
    }

    #sidebar_left .nav > li.active > a,
    #sidebar_left .active > a,
    #sidebar_left a.active {
      background:
        linear-gradient(180deg, rgba(35, 145, 255, 0.24), rgba(10, 90, 170, 0.16)) !important;
      border-color: rgba(115, 197, 255, 0.18) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035) !important;
    }

    #pmlt a:hover,
    #project_menu a:hover {
      color: #ffffff !important;
      text-shadow: 0 0 14px rgba(104, 194, 255, 0.22) !important;
    }

    /* Blur only the large glass surfaces. Avoid nested backdrop filters. */
    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      header.navbar,
      #sidebar_left,
      #pmlt,
      #customer-name,
      #customer-info,
      #projectbox,
      #descriptionbox,
      #designbox,
      #filesbox {
        -webkit-backdrop-filter: blur(18px) saturate(125%) !important;
        backdrop-filter: blur(18px) saturate(125%) !important;
      }

      #descriptionbox .panel,
      #designbox .panel,
      #filesbox .panel,
      #projectbox .panel,
      #customer-info .panel,
      #descriptionbox .well,
      #designbox .well,
      #filesbox .well {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
    }



    /* =========================================================
       v2.1.7 TRUE GLASS SYSTEM
       ChatGPT-like restraint + macOS frosted translucency.
       Paint and typography only. No display, sizing, spacing,
       positioning, transforms, tray geometry, or DOM mutation.
    ========================================================= */

    :root {
      --us-glass-clear: rgba(8, 15, 24, 0.16);
      --us-glass-soft-clear: rgba(10, 18, 29, 0.21);
      --us-glass-medium-clear: rgba(9, 17, 28, 0.28);
      --us-glass-readable: rgba(8, 16, 27, 0.34);
      --us-glass-nav: rgba(8, 16, 27, 0.52);
      --us-hairline: rgba(220, 239, 255, 0.105);
      --us-hairline-bright: rgba(230, 244, 255, 0.16);
      --us-surface-shine: rgba(255, 255, 255, 0.045);
      --us-blue-haze: rgba(72, 151, 231, 0.065);
      --us-blue-haze-strong: rgba(74, 158, 245, 0.105);
      --us-text: rgba(247, 250, 253, 0.96);
      --us-text-soft: rgba(220, 228, 237, 0.84);
      --us-text-muted: rgba(166, 181, 198, 0.68);
      --us-accent: #83c4ff;
    }

    html,
    body,
    input,
    textarea,
    select,
    button,
    table,
    th,
    td,
    .panel,
    .panel-heading,
    .panel-body,
    #pmlt {
      font-family: var(--us-font) !important;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    .panel-title,
    #customer-name,
    #customer-name * {
      font-family: var(--us-font) !important;
      letter-spacing: -0.022em !important;
    }

    /* Navigation glass remains a little denser for legibility. */
    header.navbar,
    #topbar,
    .topbar {
      background:
        linear-gradient(180deg, rgba(29, 45, 62, 0.32), rgba(4, 11, 19, 0.24)),
        rgba(7, 14, 23, 0.38) !important;
      background-color: rgba(7, 14, 23, 0.38) !important;
      border-bottom-color: var(--us-hairline) !important;
      box-shadow:
        0 10px 28px rgba(0, 0, 0, 0.12),
        inset 0 -1px 0 rgba(255, 255, 255, 0.025) !important;
      -webkit-backdrop-filter: blur(24px) saturate(155%) !important;
      backdrop-filter: blur(24px) saturate(155%) !important;
    }

    #sidebar_left {
      background:
        linear-gradient(180deg, rgba(17, 31, 45, 0.44), rgba(5, 12, 21, 0.38)),
        rgba(7, 14, 23, 0.42) !important;
      background-color: rgba(7, 14, 23, 0.42) !important;
      border-right-color: var(--us-hairline) !important;
      box-shadow:
        10px 0 30px rgba(0, 0, 0, 0.09),
        inset -1px 0 0 rgba(255, 255, 255, 0.025) !important;
      -webkit-backdrop-filter: blur(24px) saturate(150%) !important;
      backdrop-filter: blur(24px) saturate(150%) !important;
    }

    #pmlt {
      background:
        linear-gradient(145deg, rgba(92, 166, 230, 0.055), transparent 44%),
        linear-gradient(180deg, rgba(11, 23, 36, 0.28), rgba(5, 12, 21, 0.22)) !important;
      background-color: rgba(7, 15, 25, 0.24) !important;
      border-right-color: var(--us-hairline) !important;
      box-shadow:
        10px 0 30px rgba(0, 0, 0, 0.08),
        inset -1px 0 0 rgba(255, 255, 255, 0.035) !important;
      -webkit-backdrop-filter: blur(22px) saturate(145%) !important;
      backdrop-filter: blur(22px) saturate(145%) !important;
    }

    /* Hero/title surface: luminous glass, not a solid banner. */
    #customer-name {
      background:
        linear-gradient(115deg, rgba(255, 255, 255, 0.075), transparent 32%),
        linear-gradient(180deg, rgba(114, 177, 230, 0.095), rgba(9, 17, 28, 0.12)) !important;
      background-color: rgba(10, 18, 29, 0.15) !important;
      border-color: var(--us-hairline-bright) !important;
      box-shadow:
        0 12px 34px rgba(0, 0, 0, 0.10),
        inset 0 1px 0 rgba(255, 255, 255, 0.075) !important;
      -webkit-backdrop-filter: blur(24px) saturate(150%) !important;
      backdrop-filter: blur(24px) saturate(150%) !important;
    }

    /* Job overview stays slightly denser because the data is tiny. */
    #customer-info,
    #projectbox,
    #showbtns {
      background:
        linear-gradient(145deg, rgba(88, 165, 232, 0.045), transparent 38%),
        linear-gradient(180deg, rgba(7, 16, 27, 0.31), rgba(5, 12, 21, 0.25)) !important;
      background-color: var(--us-glass-readable) !important;
      border-color: var(--us-hairline) !important;
      box-shadow:
        0 12px 30px rgba(0, 0, 0, 0.105),
        inset 0 1px 0 rgba(255, 255, 255, 0.035) !important;
      -webkit-backdrop-filter: blur(20px) saturate(145%) !important;
      backdrop-filter: blur(20px) saturate(145%) !important;
    }

    /* Main work panels: mostly transparent, like floating ChatGPT panes. */
    #descriptionbox,
    #designbox,
    #filesbox,
    .panel,
    .panel-default,
    .well {
      background:
        linear-gradient(145deg, rgba(119, 187, 241, 0.045), transparent 34%),
        linear-gradient(180deg, rgba(9, 18, 30, 0.20), rgba(5, 12, 21, 0.16)) !important;
      background-color: var(--us-glass-soft-clear) !important;
      border-color: var(--us-hairline) !important;
      box-shadow:
        0 10px 28px rgba(0, 0, 0, 0.085),
        inset 0 1px 0 rgba(255, 255, 255, 0.04) !important;
    }

    #descriptionbox,
    #designbox,
    #filesbox {
      -webkit-backdrop-filter: blur(20px) saturate(145%) !important;
      backdrop-filter: blur(20px) saturate(145%) !important;
    }

    #descriptionbox > .panel-heading,
    #designbox > .panel-heading,
    #filesbox > .panel-heading,
    .panel > .panel-heading,
    .panel-heading,
    .panel-footer {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(86, 165, 231, 0.025)) !important;
      background-color: rgba(255, 255, 255, 0.018) !important;
      border-color: var(--us-hairline) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035) !important;
    }

    #descriptionbox .panel-body,
    #designbox .panel-body,
    #filesbox .panel-body,
    #projectbox .panel-body,
    #customer-info .panel-body,
    .panel-body {
      background: rgba(5, 12, 20, 0.025) !important;
      background-color: rgba(5, 12, 20, 0.025) !important;
    }

    /* Tables should read as content, not nested black boxes. */
    html body #content table,
    html body #content .table,
    html body .panel table,
    html body .panel .table {
      background: rgba(5, 12, 20, 0.10) !important;
      background-color: rgba(5, 12, 20, 0.10) !important;
      border-color: rgba(220, 239, 255, 0.065) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.014) !important;
    }

    html body #content table thead,
    html body #content table thead tr,
    html body #content table thead th,
    html body .panel table thead th {
      background: rgba(117, 185, 239, 0.022) !important;
      border-color: rgba(220, 239, 255, 0.06) !important;
    }

    html body #content table tbody tr:hover,
    html body .panel table tbody tr:hover {
      background: rgba(92, 176, 246, 0.055) !important;
    }

    /* Inputs use a translucent smoked inset, not opaque charcoal. */
    input:not([type="button"]):not([type="submit"]):not([type="reset"]),
    textarea,
    select,
    .form-control {
      background: rgba(4, 11, 19, 0.24) !important;
      background-color: rgba(4, 11, 19, 0.24) !important;
      border-color: rgba(220, 239, 255, 0.085) !important;
      box-shadow:
        inset 0 1px 2px rgba(0, 0, 0, 0.11),
        inset 0 1px 0 rgba(255, 255, 255, 0.022) !important;
    }

    input:not([type="button"]):not([type="submit"]):not([type="reset"]):focus,
    textarea:focus,
    select:focus,
    .form-control:focus {
      border-color: rgba(103, 190, 255, 0.34) !important;
      box-shadow:
        0 0 0 2px rgba(10, 132, 255, 0.075),
        inset 0 1px 2px rgba(0, 0, 0, 0.10) !important;
    }

    /* Existing button geometry is untouched; paint becomes frosted. */
    .btn,
    button,
    input[type="button"],
    input[type="submit"] {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(60, 125, 183, 0.025)),
        rgba(7, 15, 25, 0.24) !important;
      background-color: rgba(7, 15, 25, 0.24) !important;
      border-color: rgba(220, 239, 255, 0.10) !important;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.035),
        0 4px 12px rgba(0, 0, 0, 0.07) !important;
    }

    .btn:hover,
    button:hover,
    input[type="button"]:hover,
    input[type="submit"]:hover {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(72, 152, 220, 0.04)),
        rgba(9, 20, 33, 0.31) !important;
      border-color: rgba(131, 196, 255, 0.18) !important;
    }

    #sidebar_left .nav > li.active > a,
    #sidebar_left .active > a,
    #sidebar_left a.active {
      background:
        linear-gradient(180deg, rgba(53, 153, 245, 0.16), rgba(14, 92, 172, 0.075)) !important;
      border-color: rgba(126, 200, 255, 0.14) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
    }

    #pmlt a,
    #project_menu a {
      color: rgba(218, 230, 242, 0.88) !important;
    }

    #pmlt a:hover,
    #project_menu a:hover {
      color: #ffffff !important;
      text-shadow: 0 0 16px rgba(105, 193, 255, 0.18) !important;
    }


    /* =========================================================
       v2.1.8 PERFORMANCE TRUE GLASS
       Keep the wallpaper and layout. Remove expensive blur from scrolling
       content and override Design Job Tools' opaque runtime surfaces.
    ========================================================= */

    :root {
      --us-perf-glass: rgba(7, 15, 25, 0.13);
      --us-perf-glass-soft: rgba(9, 18, 30, 0.10);
      --us-perf-glass-readable: rgba(7, 15, 25, 0.20);
      --us-perf-hairline: rgba(226, 242, 255, 0.09);
      --us-perf-highlight: rgba(255, 255, 255, 0.035);
    }

    /* Scrolling content gets transparent paint only. Backdrop-filter on
       large moving surfaces is the main source of scroll/compositing jank. */
    html body #customer-name,
    html body #customer-info,
    html body #projectbox,
    html body #showbtns,
    html body #descriptionbox,
    html body #designbox,
    html body #filesbox,
    html body #content .panel,
    html body #content .panel-default,
    html body #content .well,
    html body #content .modal-content,
    html body #content .popover,
    html body #content .dropdown-menu {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html body #descriptionbox,
    html body #designbox,
    html body #filesbox,
    html body #content .panel,
    html body #content .panel-default,
    html body #content .well {
      background:
        linear-gradient(145deg, rgba(128, 194, 246, 0.028), transparent 32%),
        linear-gradient(180deg, rgba(8, 17, 28, 0.13), rgba(4, 10, 18, 0.09)) !important;
      background-color: var(--us-perf-glass) !important;
      border-color: var(--us-perf-hairline) !important;
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.055),
        inset 0 1px 0 var(--us-perf-highlight) !important;
    }

    html body #customer-name {
      background:
        linear-gradient(110deg, rgba(255, 255, 255, 0.055), transparent 30%),
        linear-gradient(180deg, rgba(103, 174, 232, 0.07), rgba(7, 15, 25, 0.08)) !important;
      background-color: rgba(8, 16, 27, 0.10) !important;
      border-color: rgba(226, 242, 255, 0.12) !important;
      box-shadow:
        0 8px 26px rgba(0, 0, 0, 0.055),
        inset 0 1px 0 rgba(255, 255, 255, 0.055) !important;
    }

    html body #customer-info,
    html body #projectbox,
    html body #showbtns {
      background:
        linear-gradient(145deg, rgba(104, 176, 236, 0.026), transparent 36%),
        linear-gradient(180deg, rgba(6, 14, 24, 0.20), rgba(4, 10, 18, 0.15)) !important;
      background-color: var(--us-perf-glass-readable) !important;
      border-color: var(--us-perf-hairline) !important;
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.065),
        inset 0 1px 0 rgba(255, 255, 255, 0.028) !important;
    }

    html body #content .panel-heading,
    html body #descriptionbox > .panel-heading,
    html body #designbox > .panel-heading,
    html body #filesbox > .panel-heading {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.028), rgba(91, 168, 230, 0.014)) !important;
      background-color: rgba(255, 255, 255, 0.010) !important;
      border-color: var(--us-perf-hairline) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
    }

    html body #content .panel-body,
    html body #descriptionbox .panel-body,
    html body #designbox .panel-body,
    html body #filesbox .panel-body,
    html body #projectbox .panel-body,
    html body #customer-info .panel-body {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    html body #content table,
    html body #content .table,
    html body #content .panel table,
    html body #content .panel .table {
      background: rgba(5, 12, 20, 0.055) !important;
      background-color: rgba(5, 12, 20, 0.055) !important;
      border-color: rgba(226, 242, 255, 0.05) !important;
      box-shadow: none !important;
    }

    /* Design Job Tools consumes theme-owned paint tokens. Layout remains owned by Design Job Tools. */

    html body #us-sign-design-actionbar {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(77, 151, 213, 0.012)),
        rgba(7, 15, 25, 0.16) !important;
      background-color: rgba(7, 15, 25, 0.16) !important;
      border-color: rgba(226, 242, 255, 0.075) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.026) !important;
    }

    html body #us-sign-job-overview,
    html body #us-sign-design-summary {
      background:
        linear-gradient(180deg, rgba(111, 181, 237, 0.018), rgba(5, 12, 20, 0.105)) !important;
      background-color: rgba(7, 15, 25, 0.13) !important;
      border-color: rgba(226, 242, 255, 0.065) !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html body #us-sign-job-overview .us-sign-overview-title,
    html body #us-sign-job-overview .us-sign-overview-field,
    html body #us-sign-design-summary > .us-sign-djt-summary-cell {
      background: transparent !important;
      background-color: transparent !important;
      border-color: rgba(226, 242, 255, 0.05) !important;
    }

    html body #us-sign-design-bottom-grid,
    html body #us-sign-design-right-stack,
    html body .us-sign-design-workbench,
    html body .us-sign-design-workspace-column {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      box-shadow: none !important;
    }

    html body #us-sign-design-bottom-grid > .us-sign-description-panel,
    html body #us-sign-design-right-stack > .us-sign-designs-panel,
    html body #us-sign-design-right-stack > .us-sign-files-panel {
      background:
        linear-gradient(145deg, rgba(119, 187, 241, 0.024), transparent 32%),
        rgba(6, 14, 24, 0.105) !important;
      background-color: rgba(6, 14, 24, 0.105) !important;
      border-color: rgba(226, 242, 255, 0.07) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      box-shadow:
        0 7px 22px rgba(0, 0, 0, 0.045),
        inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
    }

    /* Keep real blur on fixed chrome only. This preserves the macOS feel
       without forcing the GPU to continuously re-blur long scrolling cards. */
    html body header.navbar,
    html body #sidebar_left,
    html body #pmlt {
      -webkit-backdrop-filter: blur(12px) saturate(130%) !important;
      backdrop-filter: blur(12px) saturate(130%) !important;
    }


    /* =========================================================
       v2.1.9 ROXBOROUGH + MATCHED GLASS CHROME
       Typography and paint only. Roxborough CF is loaded locally when the
       licensed font is installed; elegant serif fallbacks keep the intent.
    ========================================================= */

    @font-face {
      font-family: "US Roxborough";
      src:
        local("Roxborough CF"),
        local("RoxboroughCF"),
        local("Roxborough");
      font-style: normal;
      font-weight: 300 800;
      font-display: swap;
    }

    :root {
      --us-display-font: "US Roxborough", "Iowan Old Style", "Baskerville", "Times New Roman", serif;
      --us-chrome-blue: rgba(7, 22, 37, 0.50);
      --us-chrome-blue-deep: rgba(4, 13, 23, 0.58);
      --us-chrome-line: rgba(150, 207, 255, 0.12);
      --us-chrome-line-bright: rgba(176, 220, 255, 0.17);
    }

    /* Display serif is deliberate and sparse: project identity, not UI data. */
    html body #customer-name h1,
    html body #customer-name h2,
    html body #customer-name h3,
    html body #customer-name .panel-title,
    html body #pmlt h1,
    html body #pmlt h2,
    html body #pmlt .project-number,
    html body #pmlt [class*="project-number" i] {
      font-family: var(--us-display-font) !important;
      font-weight: 500 !important;
      letter-spacing: -0.028em !important;
      font-variant-numeric: lining-nums tabular-nums !important;
      text-rendering: optimizeLegibility !important;
    }

    /* Keep operational UI crisp and modern. */
    html body #customer-info,
    html body #customer-info *,
    html body #us-sign-design-actionbar,
    html body #us-sign-job-overview,
    html body #us-sign-design-summary,
    html body #sidebar_left,
    html body button,
    html body input,
    html body select,
    html body textarea,
    html body table,
    html body th,
    html body td {
      font-family: var(--us-font) !important;
    }

    /* Top chrome: transparent macOS-style gradient instead of a dark slab. */
    html body header.navbar,
    html body .navbar-fixed-top,
    html body #topbar,
    html body .topbar {
      background:
        linear-gradient(110deg,
          rgba(4, 12, 22, 0.56) 0%,
          rgba(8, 27, 47, 0.43) 32%,
          rgba(14, 48, 72, 0.31) 63%,
          rgba(8, 27, 45, 0.36) 82%,
          rgba(4, 13, 23, 0.50) 100%),
        linear-gradient(180deg,
          rgba(255, 255, 255, 0.055) 0%,
          rgba(255, 255, 255, 0.012) 42%,
          rgba(0, 0, 0, 0.045) 100%) !important;
      background-color: rgba(6, 18, 31, 0.42) !important;
      border-bottom: 1px solid var(--us-chrome-line) !important;
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.10),
        inset 0 1px 0 rgba(255, 255, 255, 0.052),
        inset 0 -1px 0 rgba(75, 167, 236, 0.028) !important;
      -webkit-backdrop-filter: blur(14px) saturate(138%) !important;
      backdrop-filter: blur(14px) saturate(138%) !important;
    }

    /* Main left menu: blue-black glass, not neutral gray. */
    html body #sidebar_left {
      background:
        radial-gradient(circle at 4% 10%, rgba(62, 151, 219, 0.14), transparent 34%),
        linear-gradient(180deg,
          rgba(7, 25, 41, 0.69) 0%,
          rgba(5, 18, 31, 0.63) 48%,
          rgba(3, 13, 23, 0.68) 100%) !important;
      background-color: rgba(5, 18, 30, 0.65) !important;
      border-right: 1px solid var(--us-chrome-line) !important;
      box-shadow:
        10px 0 30px rgba(0, 0, 0, 0.09),
        inset -1px 0 0 rgba(255, 255, 255, 0.025),
        inset 0 1px 0 rgba(125, 192, 244, 0.025) !important;
      -webkit-backdrop-filter: blur(12px) saturate(132%) !important;
      backdrop-filter: blur(12px) saturate(132%) !important;
    }

    html body #sidebar_left .nav > li > a,
    html body #sidebar_left a {
      color: rgba(211, 225, 238, 0.82) !important;
    }

    html body #sidebar_left .nav > li > a:hover,
    html body #sidebar_left a:hover {
      color: rgba(248, 251, 255, 0.97) !important;
      background:
        linear-gradient(90deg, rgba(79, 169, 240, 0.11), rgba(79, 169, 240, 0.035)) !important;
    }

    html body #sidebar_left .nav > li.active > a,
    html body #sidebar_left .active > a,
    html body #sidebar_left a.active {
      color: #f5faff !important;
      background:
        linear-gradient(90deg,
          rgba(50, 151, 234, 0.22),
          rgba(27, 102, 177, 0.105) 72%,
          rgba(18, 71, 126, 0.055)) !important;
      border-color: rgba(127, 202, 255, 0.17) !important;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.032),
        inset 3px 0 0 rgba(108, 191, 255, 0.38) !important;
    }

    /* Project rail uses the same family, but is lighter so the two rails
       separate without looking like unrelated gray/red columns. */
    html body #pmlt {
      background:
        radial-gradient(circle at 0 18%, rgba(70, 155, 220, 0.075), transparent 38%),
        linear-gradient(180deg,
          rgba(7, 22, 37, 0.39) 0%,
          rgba(5, 16, 28, 0.31) 52%,
          rgba(4, 13, 23, 0.37) 100%) !important;
      background-color: rgba(5, 17, 29, 0.34) !important;
      border-right: 1px solid rgba(156, 208, 250, 0.10) !important;
      box-shadow:
        8px 0 26px rgba(0, 0, 0, 0.055),
        inset -1px 0 0 rgba(255, 255, 255, 0.022) !important;
      -webkit-backdrop-filter: blur(10px) saturate(126%) !important;
      backdrop-filter: blur(10px) saturate(126%) !important;
    }

    html body #pmlt a,
    html body #project_menu a {
      color: rgba(211, 227, 241, 0.88) !important;
    }

    html body #pmlt a:hover,
    html body #project_menu a:hover {
      color: #ffffff !important;
      text-shadow: 0 0 14px rgba(103, 190, 255, 0.16) !important;
    }


    /* =========================================================
       v2.1.10 DESCRIPTION TEXT CLEANUP
       Preserve rich-text color and emphasis, but remove pasted/highlighter
       background paint from Description content only.
    ========================================================= */

    html body #descriptionbox .panel-body mark,
    html body #descriptionbox .panel-body .highlight,
    html body #descriptionbox .panel-body [class*="highlight" i],
    html body #descriptionbox .panel-body [style*="background" i],
    html body .us-sign-description-panel .panel-body mark,
    html body .us-sign-description-panel .panel-body .highlight,
    html body .us-sign-description-panel .panel-body [class*="highlight" i],
    html body .us-sign-description-panel .panel-body [style*="background" i] {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }

    /* Keep warning/markup copy readable without the tan/yellow block. */
    html body #descriptionbox .panel-body .text-danger,
    html body #descriptionbox .panel-body font[color="red" i],
    html body #descriptionbox .panel-body [style*="color: red" i],
    html body #descriptionbox .panel-body [style*="color:red" i],
    html body .us-sign-description-panel .panel-body .text-danger,
    html body .us-sign-description-panel .panel-body font[color="red" i],
    html body .us-sign-description-panel .panel-body [style*="color: red" i],
    html body .us-sign-description-panel .panel-body [style*="color:red" i] {
      color: #c98b8b !important;
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }


    /* v2.1.11 icon restore and light center blur */
    html body .fa,html body i.fa,html body span.fa,html body [class^="fa-"],html body [class*=" fa-"]{font-family:"FontAwesome"!important;font-style:normal!important;font-weight:normal!important;line-height:1!important;}
    html body .glyphicon,html body [class^="glyphicon-"],html body [class*=" glyphicon-"]{font-family:"Glyphicons Halflings"!important;font-style:normal!important;font-weight:normal!important;line-height:1!important;}
    html body .glyphicons,html body [class^="glyphicons-"],html body [class*=" glyphicons-"]{font-family:"Glyphicons"!important;font-style:normal!important;font-weight:normal!important;line-height:1!important;}
    html body .imoon,html body [class^="imoon-"],html body [class*=" imoon-"],html body i[class^="icon-"],html body i[class*=" icon-"],html body span[class^="icon-"],html body span[class*=" icon-"]{font-family:"icomoon"!important;font-style:normal!important;font-weight:normal!important;line-height:1!important;}
    html body #customer-name,html body #customer-info,html body #projectbox,html body #showbtns,html body #descriptionbox,html body #designbox,html body #filesbox,html body #us-sign-design-actionbar,html body #us-sign-job-overview,html body #us-sign-design-summary,html body #us-sign-design-bottom-grid>.us-sign-description-panel,html body #us-sign-design-right-stack>.us-sign-designs-panel,html body #us-sign-design-right-stack>.us-sign-files-panel{-webkit-backdrop-filter:blur(4px) saturate(112%)!important;backdrop-filter:blur(4px) saturate(112%)!important;}
    html body #descriptionbox .panel-body,html body #designbox .panel-body,html body #filesbox .panel-body,html body #projectbox .panel-body,html body #customer-info .panel-body,html body #content table,html body #content .table{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;}


    /* v2.1.12 remove Description rich-text highlight paint */
    html body #descriptionbox :is(mark,.marker,.highlight,[class*="highlight" i],span[style*="background" i],font[style*="background" i],strong[style*="background" i],b[style*="background" i],em[style*="background" i],u[style*="background" i],[bgcolor]),
    html body .us-sign-description-panel :is(mark,.marker,.highlight,[class*="highlight" i],span[style*="background" i],font[style*="background" i],strong[style*="background" i],b[style*="background" i],em[style*="background" i],u[style*="background" i],[bgcolor]),
    html body .us-sign-readable-content :is(mark,.marker,.highlight,[class*="highlight" i],span[style*="background" i],font[style*="background" i],strong[style*="background" i],b[style*="background" i],em[style*="background" i],u[style*="background" i],[bgcolor]){background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;text-shadow:none!important;border:0!important;border-radius:0!important;padding:0!important;}
    html body #descriptionbox :is([style*="color:red" i],[style*="color: red" i],font[color="red" i],font[color="#ff0000" i]),
    html body .us-sign-description-panel :is([style*="color:red" i],[style*="color: red" i],font[color="red" i],font[color="#ff0000" i]),
    html body .us-sign-readable-content :is([style*="color:red" i],[style*="color: red" i],font[color="red" i],font[color="#ff0000" i]){color:#c98b8b!important;-webkit-text-fill-color:#c98b8b!important;background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;text-shadow:none!important;border:0!important;border-radius:0!important;padding:0!important;}


    /* v2.1.13 final Description highlight neutralizer */
    html body :is(#descriptionbox,.us-sign-description-panel,.us-sign-readable-content) :is(mark,.marker,.highlight,[class*="highlight" i],[style*="background" i],[bgcolor]){background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important;text-shadow:none!important;border:0!important;border-radius:0!important;padding:0!important;}


    /* =========================================================
       v2.1.14 PROJECT SEARCH GLASS
       Search-page paint only. No geometry, widths, positioning, or polling.
    ========================================================= */
    html.us-sign-search-page #content > .tray320 .admin-form > .panel,
    html.us-sign-search-page #push-down > .pl20.pr50 > .panel,
    html.us-sign-search-page #push-down .panel.heading-border.panel-primary {
      background:
        linear-gradient(145deg, rgba(132, 198, 248, 0.045), transparent 34%),
        linear-gradient(180deg, rgba(8, 18, 30, 0.19), rgba(4, 11, 20, 0.13)) !important;
      background-color: rgba(7, 16, 27, 0.15) !important;
      border: 1px solid rgba(220, 239, 255, 0.10) !important;
      box-shadow:
        0 10px 28px rgba(0, 0, 0, 0.09),
        inset 0 1px 0 rgba(255, 255, 255, 0.045) !important;
      -webkit-backdrop-filter: blur(7px) saturate(126%) !important;
      backdrop-filter: blur(7px) saturate(126%) !important;
    }

    html.us-sign-search-page #content > .tray320 .panel-body.bg-light,
    html.us-sign-search-page #push-down .panel-body.bg-light,
    html.us-sign-search-page #push-down .panel-body {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-search-page #push-down .alert.alert-success {
      color: rgba(238, 247, 255, 0.95) !important;
      background:
        linear-gradient(90deg, rgba(78, 165, 235, 0.11), rgba(255, 255, 255, 0.025)) !important;
      background-color: rgba(8, 18, 30, 0.12) !important;
      border: 1px solid rgba(170, 219, 255, 0.12) !important;
      box-shadow:
        0 8px 22px rgba(0, 0, 0, 0.065),
        inset 0 1px 0 rgba(255, 255, 255, 0.04) !important;
      -webkit-backdrop-filter: blur(6px) saturate(124%) !important;
      backdrop-filter: blur(6px) saturate(124%) !important;
    }

    html.us-sign-search-page #form .gui-input,
    html.us-sign-search-page #form select,
    html.us-sign-search-page #form .field.select > select {
      color: rgba(238, 244, 250, 0.92) !important;
      background: rgba(5, 13, 23, 0.34) !important;
      background-color: rgba(5, 13, 23, 0.34) !important;
      border: 1px solid rgba(206, 232, 255, 0.10) !important;
      box-shadow:
        inset 0 1px 2px rgba(0, 0, 0, 0.16),
        inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-search-page #form select option {
      color: #e9f0f6 !important;
      background: #101a25 !important;
    }

    html.us-sign-search-page #form .field.select .arrow,
    html.us-sign-search-page #form .field.select .arrow:before,
    html.us-sign-search-page #form .field.select .arrow:after {
      color: rgba(190, 211, 230, 0.72) !important;
      border-color: rgba(190, 211, 230, 0.72) transparent transparent !important;
    }

    html.us-sign-search-page #datatable1,
    html.us-sign-search-page #datatable1 > thead,
    html.us-sign-search-page #datatable1 > tbody,
    html.us-sign-search-page #datatable1 > tbody > tr,
    html.us-sign-search-page #datatable1 > tbody > tr > td {
      background-color: transparent !important;
      background-image: none !important;
    }

    html.us-sign-search-page #datatable1 > thead > tr > th {
      color: rgba(216, 229, 241, 0.90) !important;
      background: rgba(112, 177, 230, 0.055) !important;
      border-color: rgba(220, 239, 255, 0.065) !important;
    }

    html.us-sign-search-page #datatable1 > tbody > tr:hover > td {
      background: rgba(91, 174, 242, 0.06) !important;
    }

    html.us-sign-search-page .pagination > li > a,
    html.us-sign-search-page .pagination > li > span {
      background: rgba(7, 16, 27, 0.24) !important;
      border-color: rgba(220, 239, 255, 0.09) !important;
      color: rgba(215, 228, 240, 0.88) !important;
    }

    html.us-sign-search-page .pagination > .active > a,
    html.us-sign-search-page .pagination > .active > span {
      background: rgba(72, 160, 231, 0.26) !important;
      border-color: rgba(125, 199, 255, 0.18) !important;
      color: #f6fbff !important;
    }


    /* =========================================================
       v2.1.15 TASK PAGE TEXT CONTRAST
       Task-page only. Fix native black task copy without changing
       layout, geometry, or the red completion/status messaging.
    ========================================================= */
    html.us-sign-task-page #content .panel-body,
    html.us-sign-task-page #content .panel-body td,
    html.us-sign-task-page #content .panel-body th,
    html.us-sign-task-page #content .panel-body p,
    html.us-sign-task-page #content .panel-body div,
    html.us-sign-task-page #content .panel-body span,
    html.us-sign-task-page #content .panel-body li,
    html.us-sign-task-page #content .panel-body label,
    html.us-sign-task-page #content .panel-body small,
    html.us-sign-task-page #content .panel-body strong,
    html.us-sign-task-page #content .panel-body b {
      color: rgba(232, 239, 247, 0.90) !important;
      -webkit-text-fill-color: currentColor !important;
      text-shadow: none !important;
    }

    html.us-sign-task-page #content .panel-body a:not(.btn) {
      color: rgba(174, 216, 250, 0.94) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-task-page #content .panel-body :is(
      [style*="color: black" i],
      [style*="color:black" i],
      [style*="color: #000" i],
      [style*="color:#000" i],
      [style*="color: rgb(0" i],
      font[color="black" i],
      font[color="#000" i],
      font[color="#000000" i]
    ) {
      color: rgba(232, 239, 247, 0.90) !important;
      -webkit-text-fill-color: rgba(232, 239, 247, 0.90) !important;
    }

    /* Preserve completion/error emphasis after the broad task text repair. */
    html.us-sign-task-page #content .panel-body :is(
      .text-danger,
      .danger,
      [style*="color: red" i],
      [style*="color:red" i],
      [style*="color: #ff0000" i],
      [style*="color:#ff0000" i],
      font[color="red" i],
      font[color="#ff0000" i]
    ) {
      color: #ff6257 !important;
      -webkit-text-fill-color: #ff6257 !important;
    }


    /* =========================================================
       v2.1.23 JOB DASHBOARD GLASS SYSTEM
       Paint-only dashboard unification. Preserve native geometry while
       replacing opaque widget layers with the shared restrained glass UI.
    ========================================================= */
    html.us-sign-job-dashboard #content .tray-center {
      color: var(--us-text-soft) !important;
    }

    html.us-sign-job-dashboard #customer-name,
    html.us-sign-job-dashboard #customer-info,
    html.us-sign-job-dashboard #content .tray-center > .pl15.pr15 > .well:has(.important-notes) {
      background:
        linear-gradient(145deg, rgba(118, 190, 246, 0.038), transparent 36%),
        linear-gradient(180deg, rgba(8, 17, 28, 0.19), rgba(5, 11, 19, 0.12)) !important;
      background-color: rgba(7, 15, 25, 0.16) !important;
      border: 1px solid rgba(226, 242, 255, 0.10) !important;
      box-shadow:
        0 14px 34px rgba(0, 0, 0, 0.11),
        inset 0 1px 0 rgba(255, 255, 255, 0.040) !important;
      -webkit-backdrop-filter: blur(8px) saturate(118%) !important;
      backdrop-filter: blur(8px) saturate(118%) !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(
      .panel,
      .well,
      .panel-tile,
      .tab-content
    ) {
      color: var(--us-text-soft) !important;
      background: rgba(7, 15, 25, 0.095) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.070) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.022) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(
      .panel-heading,
      .panel-menu,
      .panel-footer
    ) {
      color: var(--us-text) !important;
      background: rgba(255, 255, 255, 0.025) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.070) !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-job-dashboard #content .tray-center .panel-heading {
      border-bottom-color: rgba(226, 242, 255, 0.080) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .panel-footer {
      background: rgba(255, 255, 255, 0.018) !important;
      border-top-color: rgba(226, 242, 255, 0.065) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .panel-body {
      color: var(--us-text-soft) !important;
      background: transparent !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.060) !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(
      .panel-title,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      strong,
      b
    ) {
      color: var(--us-text) !important;
      -webkit-text-fill-color: currentColor !important;
      text-shadow: none !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(
      p,
      li,
      td,
      th,
      label,
      address,
      .timeline-desc
    ) {
      color: rgba(222, 231, 240, 0.90) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(
      small,
      .text-muted,
      .help-block,
      .timeline-date
    ) {
      color: var(--us-text-muted) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-job-dashboard #content .tray-center a:not(.btn) {
      color: rgba(174, 216, 250, 0.96) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-job-dashboard #content .tray-center a:not(.btn):hover,
    html.us-sign-job-dashboard #content .tray-center a:not(.btn):focus {
      color: #ffffff !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(
      [style*="color: black" i],
      [style*="color:black" i],
      [style*="color: #000" i],
      [style*="color:#000" i],
      [style*="color: rgb(0" i],
      font[color="black" i],
      font[color="#000" i],
      font[color="#000000" i]
    ) {
      color: rgba(232, 239, 247, 0.92) !important;
      -webkit-text-fill-color: rgba(232, 239, 247, 0.92) !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(table, .table) {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.012) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.065) !important;
      box-shadow: none !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(table, .table) :is(th, td) {
      background: transparent !important;
      border-color: rgba(226, 242, 255, 0.055) !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(table, .table) thead :is(th, td) {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.026) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .table-hover > tbody > tr:hover > :is(td, th) {
      background: rgba(118, 190, 246, 0.050) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .list-group-item {
      color: var(--us-text-soft) !important;
      background: transparent !important;
      border-color: rgba(226, 242, 255, 0.060) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .panel-tile .icon-bg {
      color: var(--us-accent) !important;
      opacity: 0.10 !important;
    }

    html.us-sign-job-dashboard #content .tray-center ol.timeline-list {
      color: var(--us-text-muted) !important;
    }

    html.us-sign-job-dashboard #content .tray-center ol.timeline-list li.timeline-item::after {
      background: rgba(226, 242, 255, 0.075) !important;
    }

    html.us-sign-job-dashboard #content .tray-center ol.timeline-list li.timeline-item + .timeline-item {
      border-top-color: rgba(226, 242, 255, 0.060) !important;
    }

    html.us-sign-job-dashboard #content .tray-center ol.timeline-list li.timeline-item .timeline-icon {
      color: var(--us-text) !important;
      background: rgba(80, 165, 238, 0.18) !important;
      border-color: rgba(226, 242, 255, 0.12) !important;
      opacity: 0.92 !important;
    }

    html.us-sign-job-dashboard #content .tray-center .task-widget ul.task-list,
    html.us-sign-job-dashboard #content .tray-center .task-widget.task-alt ul.task-list {
      background: transparent !important;
      border-color: rgba(226, 242, 255, 0.060) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .task-widget ul.task-list .task-label {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.026) !important;
      border-bottom-color: rgba(226, 242, 255, 0.060) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .task-widget ul.task-list .task-item {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.014) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .task-widget ul.task-list .task-item + .task-item {
      border-top: 1px solid rgba(226, 242, 255, 0.045) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .task-widget ul.task-list .task-item.item-checked .task-desc {
      color: rgba(150, 165, 181, 0.78) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .calendar-widget :is(
      .fc-toolbar,
      .fc-bg,
      th.fc-day-header,
      .fc-view-container .fc-event
    ) {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.016) !important;
      border-color: rgba(226, 242, 255, 0.060) !important;
      box-shadow: none !important;
    }

    html.us-sign-job-dashboard #content .tray-center .calendar-widget .fc-bg .fc-other-month {
      background: rgba(255, 255, 255, 0.008) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .tab-block .nav-tabs > li > a {
      color: var(--us-text-muted) !important;
      background: rgba(255, 255, 255, 0.012) !important;
      border-color: rgba(226, 242, 255, 0.055) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .tab-block .nav-tabs > li.active > a,
    html.us-sign-job-dashboard #content .tray-center .tab-block .nav-tabs > li > a:hover {
      color: var(--us-text) !important;
      background: rgba(118, 190, 246, 0.060) !important;
      border-color: rgba(226, 242, 255, 0.090) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .progress {
      background: rgba(255, 255, 255, 0.045) !important;
      box-shadow: none !important;
    }

    html.us-sign-job-dashboard #customer-info :is(
      .panel,
      .panel-heading,
      .panel-body,
      .panel-footer,
      .panel-menu,
      input,
      textarea,
      select,
      button,
      a.btn
    ),
    html.us-sign-job-dashboard #content .tray-center > .pl15.pr15 > .well:has(.important-notes) :is(
      .panel,
      .panel-heading,
      .panel-body,
      .panel-footer,
      .panel-menu,
      input,
      textarea,
      select,
      button,
      a.btn
    ) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }


    /* =========================================================
       v2.1.24 DESIGN PAGE GLASS SYSTEM
       Paint-only unification for the Design workspace. Geometry, mounting,
       ordering, and responsive layout remain owned by Design Job Tools.
    ========================================================= */
    html.us-sign-design-page #customer-name,
    html.us-sign-design-page #customer-info {
      background:
        linear-gradient(145deg, rgba(118, 190, 246, 0.040), transparent 36%),
        linear-gradient(180deg, rgba(8, 17, 28, 0.18), rgba(5, 11, 19, 0.11)) !important;
      background-color: rgba(7, 15, 25, 0.15) !important;
      border-color: rgba(226, 242, 255, 0.10) !important;
      box-shadow:
        0 12px 30px rgba(0, 0, 0, 0.09),
        inset 0 1px 0 rgba(255, 255, 255, 0.040) !important;
      -webkit-backdrop-filter: blur(8px) saturate(118%) !important;
      backdrop-filter: blur(8px) saturate(118%) !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column > .panel {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #us-sign-design-actionbar {
      background:
        linear-gradient(145deg, rgba(118, 190, 246, 0.036), transparent 42%),
        linear-gradient(180deg, rgba(9, 18, 29, 0.18), rgba(5, 12, 20, 0.12)) !important;
      background-color: rgba(7, 15, 25, 0.15) !important;
      border-color: rgba(226, 242, 255, 0.085) !important;
      box-shadow:
        0 9px 24px rgba(0, 0, 0, 0.07),
        inset 0 1px 0 rgba(255, 255, 255, 0.032) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #us-sign-job-overview,
    html.us-sign-design-page #us-sign-design-summary {
      color: var(--us-text-soft) !important;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.018), rgba(84, 160, 222, 0.008)),
        rgba(7, 15, 25, 0.095) !important;
      background-color: rgba(7, 15, 25, 0.095) !important;
      border-color: rgba(226, 242, 255, 0.065) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.022) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #us-sign-job-overview .us-sign-overview-title {
      color: var(--us-text) !important;
      background: rgba(255, 255, 255, 0.020) !important;
      border-color: rgba(226, 242, 255, 0.060) !important;
      text-shadow: none !important;
    }

    html.us-sign-design-page #us-sign-job-overview .us-sign-overview-field,
    html.us-sign-design-page #us-sign-design-summary > .us-sign-djt-summary-cell {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.012) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.050) !important;
      box-shadow: none !important;
    }

    html.us-sign-design-page #us-sign-job-overview .us-sign-overview-field:hover,
    html.us-sign-design-page #us-sign-job-overview .us-sign-overview-field:focus-visible {
      background: rgba(118, 190, 246, 0.045) !important;
      border-color: rgba(226, 242, 255, 0.085) !important;
      outline: none !important;
    }

    html.us-sign-design-page #us-sign-job-overview :is(.us-sign-overview-label),
    html.us-sign-design-page #us-sign-design-summary :is(.us-sign-djt-summary-label) {
      color: var(--us-text-muted) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-design-page #us-sign-job-overview :is(.us-sign-overview-value),
    html.us-sign-design-page #us-sign-design-summary :is(.us-sign-djt-summary-value) {
      color: rgba(238, 245, 251, 0.96) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-design-page #us-sign-design-bottom-grid,
    html.us-sign-design-page #us-sign-design-right-stack,
    html.us-sign-design-page .us-sign-design-workbench,
    html.us-sign-design-page .us-sign-design-workspace-column {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #us-sign-design-bottom-grid > .us-sign-description-panel,
    html.us-sign-design-page #us-sign-design-right-stack > .us-sign-designs-panel,
    html.us-sign-design-page #us-sign-design-right-stack > .us-sign-files-panel {
      color: var(--us-text-soft) !important;
      background:
        linear-gradient(145deg, rgba(119, 187, 241, 0.025), transparent 35%),
        linear-gradient(180deg, rgba(7, 15, 25, 0.105), rgba(4, 10, 18, 0.075)) !important;
      background-color: rgba(6, 14, 24, 0.105) !important;
      border-color: rgba(226, 242, 255, 0.070) !important;
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.050),
        inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #us-sign-design-bottom-grid > .us-sign-description-panel > .panel-heading,
    html.us-sign-design-page #us-sign-design-right-stack > .us-sign-designs-panel > .panel-heading,
    html.us-sign-design-page #us-sign-design-right-stack > .us-sign-files-panel > .panel-heading,
    html.us-sign-design-page #content .us-sign-design-workspace-column :is(.panel-menu, .panel-footer) {
      color: var(--us-text) !important;
      background: rgba(255, 255, 255, 0.020) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.060) !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column .panel-body {
      color: var(--us-text-soft) !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.050) !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column :is(
      .panel-title,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      strong,
      b
    ) {
      color: var(--us-text) !important;
      -webkit-text-fill-color: currentColor !important;
      text-shadow: none !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column :is(
      p,
      li,
      td,
      th,
      label,
      address
    ) {
      color: rgba(222, 231, 240, 0.90) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column :is(
      small,
      .text-muted,
      .help-block
    ) {
      color: var(--us-text-muted) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column :is(table, .table) {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.010) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.055) !important;
      box-shadow: none !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column :is(table, .table) :is(th, td) {
      background: transparent !important;
      border-color: rgba(226, 242, 255, 0.050) !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column :is(table, .table) thead :is(th, td) {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.022) !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column .table-hover > tbody > tr:hover > :is(td, th) {
      background: rgba(118, 190, 246, 0.045) !important;
    }

    html.us-sign-design-page #us-sign-design-actionbar :is(button, a.btn, .us-sign-native-action),
    html.us-sign-design-page #us-sign-job-overview .us-sign-overview-field {
      color: var(--us-text-soft) !important;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.032), rgba(74, 148, 210, 0.012)),
        rgba(7, 15, 25, 0.16) !important;
      border-color: rgba(226, 242, 255, 0.075) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
    }

    html.us-sign-design-page #us-sign-design-actionbar :is(button, a.btn, .us-sign-native-action):hover,
    html.us-sign-design-page #us-sign-design-actionbar :is(button, a.btn, .us-sign-native-action):focus-visible {
      color: #ffffff !important;
      background: rgba(118, 190, 246, 0.060) !important;
      border-color: rgba(174, 219, 255, 0.12) !important;
      outline: none !important;
    }

    html.us-sign-design-page #customer-info :is(
      .panel,
      .panel-heading,
      .panel-body,
      .panel-footer,
      .panel-menu,
      input,
      textarea,
      select,
      button,
      a.btn
    ) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }



    /* =========================================================
       v2.1.25 VISIBLE GLASS BLUR RESTORE
       Restore true frosted-glass blur to primary Dashboard and Design cards.
       Inner surfaces remain blur-free to avoid stacked backdrop filters.
    ========================================================= */
    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      /* Dashboard: one blur layer per visible card. */
      html.us-sign-job-dashboard #customer-name,
      html.us-sign-job-dashboard #customer-info,
      html.us-sign-job-dashboard #content .tray-center > .pl15.pr15 > .well:has(.important-notes) {
        -webkit-backdrop-filter: blur(14px) saturate(132%) !important;
        backdrop-filter: blur(14px) saturate(132%) !important;
      }

      html.us-sign-job-dashboard #content .tray-center :is(.panel, .well, .panel-tile, .tab-content) {
        -webkit-backdrop-filter: blur(10px) saturate(124%) !important;
        backdrop-filter: blur(10px) saturate(124%) !important;
      }

      /* Do not stack blur inside an already blurred Dashboard card. */
      html.us-sign-job-dashboard #content .tray-center :is(.panel, .well, .panel-tile, .tab-content) :is(.panel, .well, .panel-tile, .tab-content),
      html.us-sign-job-dashboard #content .tray-center :is(.panel-heading, .panel-body, .panel-footer, .panel-menu),
      html.us-sign-job-dashboard #customer-info :is(.panel, .panel-heading, .panel-body, .panel-footer, .panel-menu, input, textarea, select, button, a.btn),
      html.us-sign-job-dashboard #content .tray-center > .pl15.pr15 > .well:has(.important-notes) :is(.panel, .panel-heading, .panel-body, .panel-footer, .panel-menu, input, textarea, select, button, a.btn) {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }

      /* Design: primary identity cards get stronger frost. */
      html.us-sign-design-page #customer-name,
      html.us-sign-design-page #customer-info {
        -webkit-backdrop-filter: blur(14px) saturate(132%) !important;
        backdrop-filter: blur(14px) saturate(132%) !important;
      }

      /* Design workspace modules get a restrained but clearly visible frost. */
      html.us-sign-design-page #us-sign-design-actionbar,
      html.us-sign-design-page #us-sign-job-overview,
      html.us-sign-design-page #us-sign-design-summary,
      html.us-sign-design-page #us-sign-design-bottom-grid > .us-sign-description-panel,
      html.us-sign-design-page #us-sign-design-right-stack > .us-sign-designs-panel,
      html.us-sign-design-page #us-sign-design-right-stack > .us-sign-files-panel {
        -webkit-backdrop-filter: blur(11px) saturate(126%) !important;
        backdrop-filter: blur(11px) saturate(126%) !important;
      }

      /* Keep nested Design controls/surfaces crisp and cheap. */
      html.us-sign-design-page #us-sign-design-actionbar :is(button, a.btn, .us-sign-native-action),
      html.us-sign-design-page #us-sign-job-overview :is(.us-sign-overview-title, .us-sign-overview-field),
      html.us-sign-design-page #us-sign-design-summary > .us-sign-djt-summary-cell,
      html.us-sign-design-page #us-sign-design-bottom-grid > .us-sign-description-panel :is(.panel-heading, .panel-body, .panel-footer, .panel-menu),
      html.us-sign-design-page #us-sign-design-right-stack > .us-sign-designs-panel :is(.panel-heading, .panel-body, .panel-footer, .panel-menu),
      html.us-sign-design-page #us-sign-design-right-stack > .us-sign-files-panel :is(.panel-heading, .panel-body, .panel-footer, .panel-menu),
      html.us-sign-design-page #customer-info :is(.panel, .panel-heading, .panel-body, .panel-footer, .panel-menu, input, textarea, select, button, a.btn) {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
    }



    /* =========================================================
       v2.1.27 MAIN DASHBOARD TRUE FROST
       The landing Dashboard is a separate surface from project/job pages.
       Blur only its visible cards and leave their inner content unblurred.
    ========================================================= */
    html.us-sign-main-dashboard #content :is(
      .panel,
      .panel-default,
      .well,
      .tab-block > .tab-content,
      .task-widget,
      .calendar-widget
    ) {
      background:
        linear-gradient(145deg, rgba(138, 202, 252, 0.050), transparent 35%),
        linear-gradient(180deg, rgba(8, 17, 28, 0.32), rgba(4, 10, 18, 0.22)) !important;
      background-color: rgba(7, 15, 25, 0.26) !important;
      border-color: rgba(226, 242, 255, 0.095) !important;
      box-shadow:
        0 14px 36px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.050) !important;
      -webkit-backdrop-filter: blur(16px) saturate(132%) brightness(0.95) !important;
      backdrop-filter: blur(16px) saturate(132%) brightness(0.95) !important;
    }

    /* The three request/task tiles need a stronger, obvious frost. */
    html.us-sign-main-dashboard #content .panel-tile {
      background:
        linear-gradient(145deg, rgba(165, 216, 255, 0.070), transparent 38%),
        linear-gradient(180deg, rgba(14, 23, 35, 0.34), rgba(5, 12, 21, 0.24)) !important;
      background-color: rgba(9, 17, 28, 0.28) !important;
      border-color: rgba(226, 242, 255, 0.11) !important;
      box-shadow:
        0 12px 32px rgba(0, 0, 0, 0.11),
        inset 0 1px 0 rgba(255, 255, 255, 0.060) !important;
      -webkit-backdrop-filter: blur(22px) saturate(145%) brightness(0.96) !important;
      backdrop-filter: blur(22px) saturate(145%) brightness(0.96) !important;
    }

    /* Inner paint stays transparent so the parent frost remains visible. */
    html.us-sign-main-dashboard #content :is(
      .panel,
      .panel-default,
      .well,
      .panel-tile,
      .tab-block > .tab-content
    ) :is(.panel-heading, .panel-body, .panel-footer, .panel-menu) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-main-dashboard #content :is(.panel, .well, .panel-tile) > .panel-body {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    html.us-sign-main-dashboard #content :is(.panel, .well, .panel-tile) > :is(.panel-heading, .panel-footer, .panel-menu) {
      background: rgba(255, 255, 255, 0.026) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.065) !important;
    }

    /* Avoid expensive stacked blur if SquareCoil nests panels/widgets. */
    html.us-sign-main-dashboard #content :is(.panel, .well, .panel-tile, .tab-content) :is(
      .panel,
      .well,
      .panel-tile,
      .tab-content,
      .task-widget,
      .calendar-widget
    ) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-main-dashboard #content .panel-tile .icon-bg {
      opacity: 0.16 !important;
    }




    /* =========================================================
       v2.1.29 SOURCE-TARGETED MAIN DASHBOARD FROST
       Targets the actual dashboard.php DOM from source: the three native
       widget-task panels and the AJAX-loaded #page-content panel body.
    ========================================================= */
    html.us-sign-main-dashboard #widget-tasks,
    html.us-sign-main-dashboard #widget-designs,
    html.us-sign-main-dashboard #widget-estimates {
      background:
        linear-gradient(145deg, rgba(168, 218, 255, 0.075), transparent 38%),
        linear-gradient(180deg, rgba(12, 22, 34, 0.30), rgba(5, 12, 21, 0.20)) !important;
      background-color: rgba(8, 17, 28, 0.22) !important;
      border-color: rgba(226, 242, 255, 0.11) !important;
      box-shadow:
        0 12px 32px rgba(0, 0, 0, 0.10),
        inset 0 1px 0 rgba(255, 255, 255, 0.060) !important;
      -webkit-backdrop-filter: blur(22px) saturate(145%) brightness(0.97) !important;
      backdrop-filter: blur(22px) saturate(145%) brightness(0.97) !important;
    }

    html.us-sign-main-dashboard #widget-tasks > div,
    html.us-sign-main-dashboard #widget-designs > div,
    html.us-sign-main-dashboard #widget-estimates > div {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    /* The loaded Designs/Tasks/Estimates shell must NOT be the backdrop root. */
    html.us-sign-main-dashboard #page-content > div > .panel,
    html.us-sign-main-dashboard #page-content .panel.heading-border {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      box-shadow: none !important;
    }

    /* This is the large visible queue surface shown in DevTools. */
    html.us-sign-main-dashboard #page-content .panel-body.bg-light {
      background:
        linear-gradient(145deg, rgba(142, 204, 252, 0.050), transparent 36%),
        linear-gradient(180deg, rgba(7, 15, 25, 0.23), rgba(4, 10, 18, 0.15)) !important;
      background-color: rgba(7, 15, 25, 0.18) !important;
      border-color: rgba(226, 242, 255, 0.085) !important;
      box-shadow:
        0 16px 38px rgba(0, 0, 0, 0.10),
        inset 0 1px 0 rgba(255, 255, 255, 0.045) !important;
      -webkit-backdrop-filter: blur(20px) saturate(138%) brightness(0.96) !important;
      backdrop-filter: blur(20px) saturate(138%) brightness(0.96) !important;
    }

    html.us-sign-main-dashboard #page-content .panel-body.bg-light > :is(.row, div, table, .table) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    /* =========================================================
       v2.1.26 TOPBAR GEOMETRY REPAIR
       Restore SquareCoil's native 60px navbar rhythm, then center content
       inside those native boxes. Horizontal positioning remains native.
    ========================================================= */
    html body header.navbar,
    html body .navbar.navbar-fixed-top {
      height: 60px !important;
      min-height: 60px !important;
      margin-bottom: 0 !important;
    }

    html body header.navbar .navbar-branding {
      height: 60px !important;
    }

    html body header.navbar .navbar-branding .navbar-brand {
      display: flex !important;
      align-items: center !important;
      height: 60px !important;
      line-height: 58px !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }

    html body header.navbar .navbar-branding .navbar-brand img {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      align-self: center !important;
    }

    html body header.navbar #toggle_sidemenu_l,
    html body header.navbar #toggle_sidemenu_t {
      height: 60px !important;
      max-height: 60px !important;
      line-height: 58px !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }

    html body header.navbar .navbar-nav.navbar-left {
      max-height: 60px !important;
    }

    html body header.navbar .navbar-nav > li {
      height: 60px !important;
      max-height: 60px !important;
    }

    html body header.navbar .navbar-nav > li > a {
      display: flex !important;
      align-items: center !important;
      height: 59px !important;
      max-height: 59px !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      line-height: 1.2 !important;
    }

    html body header.navbar .navbar-form {
      display: flex !important;
      align-items: center !important;
      height: 60px !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }

    html body header.navbar .navbar-form.navbar-search.square input {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }

    html body header.navbar .navbar-text {
      display: flex !important;
      align-items: center !important;
      height: 60px !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      line-height: 1.2 !important;
    }

    html body header.navbar .navbar-btn {
      margin-top: 15px !important;
      margin-bottom: 15px !important;
      vertical-align: middle !important;
    }


    /* =========================================================
       v2.1.23 CUTOUT GEOMETRIC CURSOR
       CSS-only brand-like triangle glyph. No outline, mouse tracking,
       DOM overlay, observer, or animation loop.
    ========================================================= */
    @media (pointer: fine) {
      html,
      body {
        cursor: url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-cutout-v2123.svg") 3 3, default !important;
      }

      a,
      button,
      .btn,
      [role="button"],
      summary,
      select,
      label[for],
      input[type="button"],
      input[type="submit"],
      input[type="reset"],
      input[type="checkbox"],
      input[type="radio"] {
        cursor: url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-cutout-hover-v2123.svg") 4 3, pointer !important;
      }

      input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]),
      textarea,
      [contenteditable="true"],
      .cke_editable,
      .cke_contents,
      .cke_contents iframe {
        cursor: text !important;
      }

      [disabled],
      .disabled,
      [aria-disabled="true"] {
        cursor: not-allowed !important;
      }

      [class*="resize" i],
      [class*="resizer" i],
      .ui-resizable-handle {
        cursor: revert !important;
      }
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
        box-shadow: none !important;
      }
    }


    /* =========================================================
       v2.1.31 BING WALLPAPER PARALLAX
       Reduced overscan plus pointer-driven background position for sharper UHD rendering. The runtime
       updates only CSS variables; touch and reduced-motion stay centered.
    ========================================================= */
    :root {
      --us-wallpaper-x: 50%;
      --us-wallpaper-y: 50%;
      --us-wallpaper-size: auto 106vh;
    }

    html,
    html body #main,
    html body #content_wrapper {
      background-position: var(--us-wallpaper-x) var(--us-wallpaper-y) !important;
      background-size: var(--us-wallpaper-size) !important;
    }

    @media (pointer: coarse), (prefers-reduced-motion: reduce) {
      :root {
        --us-wallpaper-x: 50%;
        --us-wallpaper-y: 50%;
      }
    }


    /* =========================================================
       v2.1.33 PROJECT STATUS / MILESTONES
       Snapshot-grounded native structure. Paint the real SquareCoil layout
       instead of turning it into the generic Project/Scope dashboard grid.
       Native geometry from the captured page remains authoritative:
       app sidebar -> #pmlt project rail -> tray-center workspace, with the
       milestone tabs remaining a left rail + right tab-content split pane.
    ========================================================= */

    html.us-sign-project-status-page #customer-name {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-project-status-page #customer-info {
      background:
        linear-gradient(180deg, rgba(117, 184, 238, 0.040), rgba(5, 13, 22, 0.10)) !important;
      background-color: rgba(7, 15, 25, 0.16) !important;
      border: 1px solid rgba(226, 242, 255, 0.075) !important;
      border-radius: 7px !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.025) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-project-status-page #content .tray-center > .pl15.pr15 > .alert.alert-micro {
      background:
        linear-gradient(90deg, rgba(64, 145, 222, 0.24), rgba(37, 102, 168, 0.12)) !important;
      border: 1px solid rgba(128, 196, 255, 0.15) !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }

    html.us-sign-project-status-page #content .tray-center > .pl15.pr15 > .well {
      background:
        linear-gradient(145deg, rgba(126, 194, 246, 0.022), transparent 36%),
        rgba(6, 14, 24, 0.11) !important;
      background-color: rgba(6, 14, 24, 0.11) !important;
      border: 1px solid rgba(226, 242, 255, 0.065) !important;
      border-radius: 8px !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.020) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-project-status-page #content .tray-center > .pl15.pr15 > .tab-block {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-project-status-page .tab-block > .tabs-left {
      background: rgba(5, 13, 22, 0.13) !important;
      border: 1px solid rgba(226, 242, 255, 0.060) !important;
      border-right: 0 !important;
      box-shadow: none !important;
    }

    html.us-sign-project-status-page .tabs-left > li > a {
      min-height: 0 !important;
      margin: 0 !important;
      padding: 12px 16px !important;
      color: rgba(215, 226, 237, 0.78) !important;
      background: rgba(255,255,255,0.018) !important;
      border: 0 !important;
      border-bottom: 1px solid rgba(226,242,255,0.045) !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      font-size: 13px !important;
      line-height: 19.37px !important;
    }

    html.us-sign-project-status-page .tabs-left > li > a:hover {
      color: #fff !important;
      background: rgba(95, 174, 239, 0.075) !important;
    }

    html.us-sign-project-status-page .tabs-left > li > a.active-tab {
      color: #fff !important;
      background:
        linear-gradient(90deg, rgba(62, 153, 235, 0.24), rgba(53, 123, 188, 0.10)) !important;
      border-left: 2px solid rgba(137, 205, 255, 0.72) !important;
    }

    html.us-sign-project-status-page .tab-block > .tab-content {
      background:
        linear-gradient(145deg, rgba(119, 187, 241, 0.022), transparent 34%),
        rgba(5, 12, 20, 0.10) !important;
      background-color: rgba(5, 12, 20, 0.10) !important;
      border: 1px solid rgba(226, 242, 255, 0.060) !important;
      border-radius: 0 8px 8px 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-project-status-page .tab-content > .tab-pane {
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    /* Preserve the compact native controls captured on this page. The generic
       theme's 34px button floor was changing the milestone-page rhythm. */
    html.us-sign-project-status-page .btn-xs,
    html.us-sign-project-status-page input.btn-xs,
    html.us-sign-project-status-page a.btn-xs {
      min-height: 0 !important;
      height: auto !important;
      padding: 1px 5px !important;
      font-size: 12px !important;
      line-height: 18px !important;
    }

    html.us-sign-project-status-page .btn-sm,
    html.us-sign-project-status-page input.btn-sm,
    html.us-sign-project-status-page a.btn-sm {
      min-height: 0 !important;
      height: auto !important;
      padding: 5px 10px !important;
      font-size: 12px !important;
      line-height: 18px !important;
    }

    html.us-sign-project-status-page .tab-content :is(.btn, input.btn, a.btn):not(.btn-xs):not(.btn-sm) {
      min-height: 0 !important;
      height: auto !important;
      padding: 9px 12px !important;
      font-size: 13px !important;
      line-height: 19.37px !important;
    }

    html.us-sign-project-status-page #notes {
      min-height: 0 !important;
      height: 76px !important;
      resize: vertical !important;
    }


    /* =========================================================
       v2.1.34 PROJECT STATUS TRUE GLASS
       Match the primary-card frost used elsewhere while preserving the
       snapshot-grounded native Status/Milestones geometry from v2.1.33.
       One blur layer per visible surface; nested controls remain blur-free.
    ========================================================= */
    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      html.us-sign-project-status-page #customer-info,
      html.us-sign-project-status-page #content .tray-center > .pl15.pr15 > .well,
      html.us-sign-project-status-page .tab-block > .tabs-left,
      html.us-sign-project-status-page .tab-block > .tab-content {
        -webkit-backdrop-filter: blur(14px) saturate(132%) !important;
        backdrop-filter: blur(14px) saturate(132%) !important;
      }

      html.us-sign-project-status-page #customer-info :is(
        .panel,
        .panel-heading,
        .panel-body,
        .panel-footer,
        .panel-menu,
        input,
        textarea,
        select,
        button,
        a.btn
      ),
      html.us-sign-project-status-page #content .tray-center > .pl15.pr15 > .well :is(
        .panel,
        .panel-heading,
        .panel-body,
        .panel-footer,
        .panel-menu,
        input,
        textarea,
        select,
        button,
        a.btn
      ),
      html.us-sign-project-status-page .tab-block > .tabs-left *,
      html.us-sign-project-status-page .tab-block > .tab-content * {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
    }


    /* =========================================================
       v2.1.35 CLOCK OUT / MATERIAL USED MODAL
       Snapshot-grounded repair for #modal-overlay. The native dialog uses
       margin:15% auto (vertical percentages resolve from width), full-width
       btn-lg controls, Bootstrap columns, and a static close glyph. Keep all
       native IDs/click handlers; repair paint and geometry with CSS only.
    ========================================================= */
    #modal-overlay.duplicate-modal-2 {
      box-sizing: border-box !important;
      padding: clamp(48px, 12vh, 132px) 24px 28px !important;
      overflow: auto !important;
      background: rgba(3, 8, 14, 0.18) !important;
      background-image:
        radial-gradient(circle at 50% 34%, rgba(94, 174, 238, 0.040), transparent 46%),
        linear-gradient(180deg, rgba(7, 18, 29, 0.025), rgba(2, 6, 10, 0.060)) !important;
      -webkit-backdrop-filter: blur(14px) saturate(108%) brightness(0.80) !important;
      backdrop-filter: blur(14px) saturate(108%) brightness(0.80) !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {
      box-sizing: border-box !important;
      position: relative !important;
      width: min(620px, calc(100vw - 48px)) !important;
      max-width: 620px !important;
      min-width: 0 !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      margin: 0 auto !important;
      padding: 18px !important;
      overflow: visible !important;
      color: var(--us-text) !important;
      background:
        linear-gradient(145deg, rgba(205, 236, 255, 0.095), transparent 34%),
        linear-gradient(180deg, rgba(24, 48, 68, 0.18), rgba(6, 14, 23, 0.12)) !important;
      background-color: rgba(8, 18, 29, 0.16) !important;
      border: 1px solid rgba(210, 236, 255, 0.24) !important;
      border-radius: 16px !important;
      box-shadow:
        0 20px 52px rgba(0, 0, 0, 0.20),
        inset 0 1px 0 rgba(255, 255, 255, 0.12),
        inset 0 0 0 1px rgba(255, 255, 255, 0.025) !important;
      transition: none !important;
    }

    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {
        /* The full-screen overlay already owns the Gaussian blur. Keeping the
           dialog itself filter-free avoids Chrome's nested-backdrop root, which
           was making the panel read as a dark slab instead of transparent glass. */
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }

      #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 :is(
        .row,
        [class*="col-"],
        .alert,
        .btn,
        input,
        select,
        textarea
      ) {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
    }


    /* v2.1.37: one Gaussian backdrop layer only. The overlay blurs the live page;
       the dialog is deliberately low-opacity glass so that blurred page color and
       structure remain visibly present through the surface. */
    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {
      isolation: isolate !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > br {
      display: none !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-cancel-button {
      position: absolute !important;
      z-index: 4 !important;
      top: 11px !important;
      right: 11px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 30px !important;
      min-width: 30px !important;
      height: 30px !important;
      min-height: 30px !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      color: transparent !important;
      background: rgba(255, 255, 255, 0.040) !important;
      border: 1px solid rgba(208, 231, 249, 0.12) !important;
      border-radius: 9px !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035) !important;
      font-size: 0 !important;
      line-height: 1 !important;
      cursor: pointer !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-cancel-button::before {
      content: "×" !important;
      display: block !important;
      color: var(--us-text-soft) !important;
      font-size: 18px !important;
      font-weight: 500 !important;
      line-height: 1 !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-cancel-button:hover {
      background: rgba(255, 255, 255, 0.080) !important;
      border-color: rgba(208, 231, 249, 0.20) !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row::before,
    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row::after,
    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12::before,
    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12::after {
      content: none !important;
      display: none !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 {
      box-sizing: border-box !important;
      display: grid !important;
      grid-template-columns: minmax(132px, 0.34fr) minmax(0, 1fr) !important;
      grid-template-areas:
        "warning warning"
        "yes proceed"
        "clock clock"
        "divider divider"
        "footer footer" !important;
      gap: 10px !important;
      float: none !important;
      width: 100% !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > br {
      display: none !important;
    }

    #modal-overlay.duplicate-modal-2 #tc-warning {
      grid-area: warning !important;
      width: 100% !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 10px 42px 10px 12px !important;
      color: var(--us-text) !important;
      background: rgba(189, 102, 102, 0.105) !important;
      border: 1px solid rgba(217, 152, 152, 0.16) !important;
      border-radius: 10px !important;
      font-size: 12.5px !important;
      font-weight: 600 !important;
      line-height: 1.4 !important;
    }

    #modal-overlay.duplicate-modal-2 #tc-yes-btn,
    #modal-overlay.duplicate-modal-2 #no-btn {
      box-sizing: border-box !important;
      position: static !important;
      inset: auto !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 38px !important;
      height: auto !important;
      margin: 0 !important;
      padding: 8px 12px !important;
      border-radius: 9px !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035), 0 5px 16px rgba(0, 0, 0, 0.08) !important;
      font-size: 12.5px !important;
      font-weight: 600 !important;
      line-height: 1.35 !important;
      text-align: center !important;
      white-space: normal !important;
      transform: none !important;
    }

    #modal-overlay.duplicate-modal-2 #tc-yes-btn {
      grid-area: yes !important;
      color: #dcebe1 !important;
      background: rgba(72, 142, 96, 0.18) !important;
      border: 1px solid rgba(132, 191, 151, 0.20) !important;
    }

    #modal-overlay.duplicate-modal-2 #no-btn {
      grid-area: proceed !important;
      color: #e6edf4 !important;
      background: rgba(65, 130, 187, 0.16) !important;
      border: 1px solid rgba(130, 190, 239, 0.18) !important;
    }

    #modal-overlay.duplicate-modal-2 #tc-yes-btn:hover,
    #modal-overlay.duplicate-modal-2 #no-btn:hover {
      color: #fff !important;
      border-color: rgba(212, 235, 252, 0.26) !important;
      background-color: rgba(88, 155, 210, 0.22) !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-into-project-dept-2 {
      grid-area: clock !important;
      width: 100% !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-into-project-dept-2 > br {
      display: none !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-into-project-dept-2 > :is(input, select, textarea, .alert, a.btn) {
      width: 100% !important;
      margin: 0 0 8px !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-into-project-dept-2 textarea {
      min-height: 72px !important;
      resize: vertical !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > hr {
      grid-area: divider !important;
      width: 100% !important;
      height: 1px !important;
      margin: 2px 0 0 !important;
      border: 0 !important;
      border-top: 1px solid rgba(202, 228, 248, 0.12) !important;
      opacity: 1 !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > .row {
      grid-area: footer !important;
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) auto !important;
      align-items: center !important;
      gap: 10px !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > .row::before,
    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > .row::after {
      content: none !important;
      display: none !important;
    }

    #modal-overlay.duplicate-modal-2 #cocbtn {
      grid-column: 1 !important;
      float: none !important;
      width: auto !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > .row > .col-md-9 {
      display: none !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > .row > .col-md-3 {
      grid-column: 2 !important;
      justify-self: end !important;
      float: none !important;
      width: auto !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-out-completely,
    #modal-overlay.duplicate-modal-2 #clock-actions-cancel {
      box-sizing: border-box !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: auto !important;
      min-width: 100px !important;
      min-height: 34px !important;
      height: auto !important;
      margin: 0 !important;
      padding: 7px 12px !important;
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.035) !important;
      border: 1px solid rgba(205, 229, 247, 0.13) !important;
      border-radius: 9px !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.030) !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
      text-align: center !important;
      white-space: normal !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-out-completely {
      min-width: 170px !important;
      color: #eddede !important;
      background: rgba(159, 73, 73, 0.14) !important;
      border-color: rgba(207, 131, 131, 0.18) !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-actions-cancel:hover,
    #modal-overlay.duplicate-modal-2 #clock-out-completely:hover {
      color: #fff !important;
      background: rgba(255, 255, 255, 0.070) !important;
      border-color: rgba(214, 235, 251, 0.22) !important;
    }

    @media (max-width: 640px) {
      #modal-overlay.duplicate-modal-2 {
        padding: 24px 14px !important;
      }

      #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {
        width: 100% !important;
        padding: 14px !important;
      }

      #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 {
        grid-template-columns: minmax(0, 1fr) !important;
        grid-template-areas:
          "warning"
          "yes"
          "proceed"
          "clock"
          "divider"
          "footer" !important;
      }
    }


    /* =========================================================
       v2.1.39 SEMANTIC PROJECT UX
       Snapshot-grounded state hierarchy. Color now communicates workflow
       meaning instead of making every glass control equally prominent.
    ========================================================= */
    html.us-sign-semantic-project-ux {
      --us-state-blue: #91ceff;
      --us-state-blue-bg: rgba(53, 139, 214, 0.17);
      --us-state-blue-border: rgba(115, 190, 248, 0.16);
      --us-state-teal: #93e0dc;
      --us-state-teal-bg: rgba(57, 157, 153, 0.16);
      --us-state-teal-border: rgba(126, 213, 207, 0.15);
      --us-state-green: #9bd7ad;
      --us-state-green-bg: rgba(70, 145, 93, 0.18);
      --us-state-green-border: rgba(135, 207, 157, 0.16);
      --us-state-amber: #f1cf83;
      --us-state-amber-bg: rgba(196, 139, 42, 0.18);
      --us-state-amber-border: rgba(235, 181, 88, 0.17);
      --us-state-red: #f0a0a0;
      --us-state-red-bg: rgba(177, 67, 67, 0.18);
      --us-state-red-border: rgba(231, 120, 120, 0.18);
      --us-state-purple: #cdb8ff;
      --us-state-purple-bg: rgba(119, 89, 180, 0.16);
      --us-state-purple-border: rgba(181, 157, 230, 0.15);
    }

    /* Summary cells gain a restrained semantic rail. */
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell {
      position: relative !important;
      border-radius: 8px !important;
      transition: background-color 120ms ease, border-color 120ms ease !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-state] {
      padding-left: 10px !important;
      border: 1px solid transparent !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-state]::before {
      content: "" !important;
      position: absolute !important;
      left: 2px !important;
      top: 9px !important;
      bottom: 9px !important;
      width: 2px !important;
      border-radius: 999px !important;
      background: currentColor !important;
      opacity: 0.76 !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state] {
      display: inline-flex !important;
      align-items: center !important;
      min-height: 24px !important;
      padding: 3px 9px !important;
      border: 1px solid !important;
      border-radius: 999px !important;
      font-weight: 650 !important;
      line-height: 1.25 !important;
      box-shadow: none !important;
    }

    html.us-sign-semantic-project-ux [data-us-state="pending"] {
      color: var(--us-state-blue) !important;
      border-color: var(--us-state-blue-border) !important;
      background-color: var(--us-state-blue-bg) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="submitted"] {
      color: var(--us-state-teal) !important;
      border-color: var(--us-state-teal-border) !important;
      background-color: var(--us-state-teal-bg) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="success"] {
      color: var(--us-state-green) !important;
      border-color: var(--us-state-green-border) !important;
      background-color: var(--us-state-green-bg) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="due-today"],
    html.us-sign-semantic-project-ux [data-us-state="due-soon"] {
      color: var(--us-state-amber) !important;
      border-color: var(--us-state-amber-border) !important;
      background-color: var(--us-state-amber-bg) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="urgent"] {
      color: var(--us-state-red) !important;
      border-color: var(--us-state-red-border) !important;
      background-color: rgba(177, 67, 67, 0.24) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="overdue"],
    html.us-sign-semantic-project-ux [data-us-state="danger"] {
      color: var(--us-state-red) !important;
      border-color: var(--us-state-red-border) !important;
      background-color: var(--us-state-red-bg) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="hold"] {
      color: var(--us-state-purple) !important;
      border-color: var(--us-state-purple-border) !important;
      background-color: var(--us-state-purple-bg) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="unset"] {
      color: rgba(190, 203, 216, 0.72) !important;
      border-color: rgba(190, 203, 216, 0.12) !important;
      background-color: rgba(255, 255, 255, 0.028) !important;
    }

    /* Pending banners read as workflow state, not plain white decoration. */
    html.us-sign-semantic-project-ux .alert[data-us-state="pending"] {
      color: #d8edff !important;
      background:
        linear-gradient(90deg, rgba(48, 137, 213, 0.21), rgba(18, 60, 96, 0.10)) !important;
      border: 1px solid rgba(111, 188, 248, 0.22) !important;
      border-left: 3px solid rgba(115, 193, 255, 0.72) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.035) !important;
      font-weight: 650 !important;
    }

    /* Utility actions stay quiet; primary/destructive actions become obvious. */
    html.us-sign-semantic-project-ux [data-us-action="utility"] {
      color: rgba(221, 230, 239, 0.86) !important;
      background: rgba(7, 15, 25, 0.18) !important;
      border-color: rgba(226, 242, 255, 0.065) !important;
    }
    html.us-sign-semantic-project-ux [data-us-action="utility"]:hover,
    html.us-sign-semantic-project-ux [data-us-action="utility"]:focus-visible {
      color: #fff !important;
      background: rgba(87, 161, 220, 0.12) !important;
      border-color: rgba(142, 205, 252, 0.13) !important;
    }

    html.us-sign-semantic-project-ux [data-us-action="primary"] {
      color: #eaf7ff !important;
      background: linear-gradient(180deg, rgba(44, 137, 208, 0.27), rgba(25, 98, 157, 0.19)) !important;
      border-color: rgba(112, 191, 249, 0.18) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important;
    }
    html.us-sign-semantic-project-ux [data-us-action="primary"]:hover,
    html.us-sign-semantic-project-ux [data-us-action="primary"]:focus-visible {
      background: linear-gradient(180deg, rgba(60, 155, 228, 0.36), rgba(30, 108, 171, 0.26)) !important;
      border-color: rgba(137, 207, 255, 0.23) !important;
    }

    html.us-sign-semantic-project-ux [data-us-action="clock-in"] {
      color: #eaffef !important;
      background: linear-gradient(180deg, rgba(69, 145, 91, 0.25), rgba(40, 104, 58, 0.17)) !important;
      border-color: rgba(132, 207, 153, 0.16) !important;
    }

    html.us-sign-semantic-project-ux [data-us-action="danger"] {
      color: #ffdcdc !important;
      background: rgba(151, 55, 55, 0.12) !important;
      border-color: rgba(220, 105, 105, 0.15) !important;
    }
    html.us-sign-semantic-project-ux [data-us-action="danger"]:hover,
    html.us-sign-semantic-project-ux [data-us-action="danger"]:focus-visible {
      color: #fff0f0 !important;
      background: rgba(181, 61, 61, 0.24) !important;
      border-color: rgba(239, 127, 127, 0.23) !important;
    }

    html.us-sign-semantic-project-ux [data-us-action="warning"] {
      color: #f4e5bd !important;
      background: rgba(176, 130, 49, 0.16) !important;
      border-color: rgba(223, 177, 91, 0.16) !important;
    }

    /* The sidebar numbers are queue counts, not errors. Reserve red for danger. */
    html.us-sign-semantic-project-ux #badge-task-count,
    html.us-sign-semantic-project-ux #badge-design-count,
    html.us-sign-semantic-project-ux #badge-estimate-count {
      min-width: 20px !important;
      padding: 2px 6px !important;
      color: #d9eeff !important;
      background: rgba(54, 137, 205, 0.32) !important;
      border: 1px solid rgba(119, 190, 246, 0.22) !important;
      border-radius: 999px !important;
      box-shadow: none !important;
    }
    html.us-sign-semantic-project-ux #badge-task-count[data-us-zero="true"],
    html.us-sign-semantic-project-ux #badge-design-count[data-us-zero="true"],
    html.us-sign-semantic-project-ux #badge-estimate-count[data-us-zero="true"] {
      color: rgba(185, 200, 214, 0.70) !important;
      background: rgba(255,255,255,0.035) !important;
      border-color: rgba(210, 230, 246, 0.10) !important;
    }

    /* Small action controls were 29-30px in the audit. Give frequent actions a
       consistent 32px floor without enlarging the dense project rail links. */
    html.us-sign-semantic-project-ux #us-sign-design-actionbar :is(a, button, .btn),
    html.us-sign-semantic-project-ux #us-sign-job-copy-tools :is(a, button, .btn),
    html.us-sign-semantic-project-ux #us-sign-native-action-group :is(a, button, .btn),
    html.us-sign-semantic-project-ux #time-clock-clock-in-to-project-from-project,
    html.us-sign-semantic-project-ux #duplicate {
      min-height: 32px !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-label {
      color: rgba(174, 192, 208, 0.76) !important;
      font-weight: 600 !important;
    }

    /* v2.1.40: Hours is plain operational data, not a semantic badge. */
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-field="hours"] {
      border-color: transparent !important;
      background: transparent !important;
      padding-left: 0 !important;
    }
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-field="hours"]::before {
      content: none !important;
      display: none !important;
    }
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-field="hours"] .us-sign-djt-summary-value {
      display: block !important;
      min-height: 0 !important;
      padding: 0 !important;
      color: rgba(234, 241, 247, 0.90) !important;
      background: transparent !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
    }


    /* =========================================================
       v2.1.41 SEMANTIC PILL POLISH
       Match the rest of the glass UI: low-contrast hairlines, state carried
       by translucent fill, and Urgent promoted to a true danger/red state.
    ========================================================= */
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state] {
      border: 1px solid rgba(226, 242, 255, 0.055) !important;
      box-shadow: none !important;
      text-shadow: none !important;
      outline: none !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="pending"] {
      color: #b9ddfa !important;
      background: rgba(51, 124, 183, 0.16) !important;
      border: 1px solid rgba(132, 193, 237, 0.085) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="submitted"] {
      color: #bce9e5 !important;
      background: rgba(49, 131, 126, 0.16) !important;
      border: 1px solid rgba(139, 211, 204, 0.085) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="success"] {
      color: #c8ebd2 !important;
      background: rgba(56, 125, 78, 0.17) !important;
      border: 1px solid rgba(148, 211, 166, 0.085) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="urgent"] {
      color: #ffd6d6 !important;
      background: rgba(165, 49, 49, 0.28) !important;
      border: 1px solid rgba(241, 128, 128, 0.12) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="due-today"],
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="due-soon"] {
      color: #f4dfa6 !important;
      background: rgba(151, 105, 29, 0.20) !important;
      border: 1px solid rgba(230, 184, 96, 0.095) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="overdue"],
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="danger"] {
      color: #ffd1d1 !important;
      background: rgba(160, 46, 46, 0.25) !important;
      border: 1px solid rgba(238, 120, 120, 0.11) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="hold"] {
      color: #ddcff8 !important;
      background: rgba(103, 79, 148, 0.16) !important;
      border: 1px solid rgba(190, 171, 226, 0.08) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="unset"] {
      color: rgba(205, 216, 226, 0.78) !important;
      background: rgba(255, 255, 255, 0.026) !important;
      border: 1px solid rgba(220, 237, 250, 0.055) !important;
    }

    /* Urgent is a danger signal; due dates remain amber until overdue. */
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-state="urgent"] {
      color: #f0a0a0 !important;
      background: rgba(151, 46, 46, 0.055) !important;
      border-color: transparent !important;
    }
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-state="urgent"]::before {
      background: rgba(229, 99, 99, 0.78) !important;
    }

    /* Keep operational data compact; Hours should never resemble a status. */
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-field="hours"] .us-sign-djt-summary-value {
      font-size: 12.5px !important;
      font-weight: 600 !important;
      letter-spacing: 0 !important;
    }


    /* =========================================================
       v2.1.43 LEFT SIDEBAR WALLPAPER-VISIBLE GLASS + ALIGNMENT
       Main navigation only. Keep Menu Cleanup responsible for what is shown;
       this block owns paint/alignment and collapsed separator containment.
    ========================================================= */

    html body #sidebar_left {
      background:
        radial-gradient(circle at 7% 8%, rgba(76, 165, 230, 0.060), transparent 36%),
        linear-gradient(180deg,
          rgba(7, 25, 41, 0.24) 0%,
          rgba(5, 18, 31, 0.18) 48%,
          rgba(3, 13, 23, 0.22) 100%) !important;
      background-color: rgba(5, 18, 30, 0.10) !important;
      border-right-color: rgba(156, 208, 250, 0.070) !important;
      box-shadow:
        7px 0 24px rgba(0, 0, 0, 0.060),
        inset -1px 0 0 rgba(255, 255, 255, 0.018),
        inset 0 1px 0 rgba(125, 192, 244, 0.018) !important;
      -webkit-backdrop-filter: blur(9px) saturate(122%) brightness(0.96) !important;
      backdrop-filter: blur(9px) saturate(122%) brightness(0.96) !important;
    }

    /* Native sidebar wrappers must not repaint an opaque gray layer over the
       wallpaper. Let #sidebar_left own the single glass surface. */
    html body #sidebar_left .sidebar-left-content,
    html body #sidebar_left .sidebar-menu,
    html body #sidebar_left .nav.sidebar-menu {
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    /* Give every top-level nav item one predictable icon/text/badge rhythm. */
    html body #sidebar_left .sidebar-menu > li > a,
    html body #sidebar_left .nav.sidebar-menu > li > a {
      display: grid !important;
      grid-template-columns: 22px minmax(0, 1fr) auto !important;
      align-items: center !important;
      column-gap: 10px !important;
      min-width: 0 !important;
      padding-left: 14px !important;
      padding-right: 12px !important;
      line-height: 1.25 !important;
    }

    html body #sidebar_left .sidebar-menu > li > a > :is(
      .fa,
      .glyphicon,
      .glyphicons,
      .imoon,
      [class^="icon-"],
      [class*=" icon-"]
    ),
    html body #sidebar_left .sidebar-menu > li > a > span:first-child:not(.sidebar-title):not(.label):not(.badge) {
      grid-column: 1 !important;
      justify-self: center !important;
      align-self: center !important;
      width: 22px !important;
      min-width: 22px !important;
      margin: 0 !important;
      padding: 0 !important;
      text-align: center !important;
      vertical-align: middle !important;
    }

    html body #sidebar_left .sidebar-menu > li > a > .sidebar-title {
      grid-column: 2 !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      line-height: 1.25 !important;
    }

    html body #sidebar_left .sidebar-menu > li > a > :is(.label, .badge),
    html body #sidebar_left .sidebar-menu > li > a > .sidebar-title + :is(.label, .badge) {
      grid-column: 3 !important;
      justify-self: end !important;
      align-self: center !important;
      margin: 0 !important;
    }

    /* Section separators must always size from the live sidebar width. Native
       fixed-width HR/divider rules were visibly protruding after collapse. */
    html body #sidebar_left hr,
    html body #sidebar_left .sidebar-menu > hr,
    html body #sidebar_left .sidebar-menu > li.divider,
    html body #sidebar_left .sidebar-menu > li.sidebar-divider,
    html body #sidebar_left .sidebar-menu > li.nav-divider {
      box-sizing: border-box !important;
      width: auto !important;
      max-width: none !important;
      height: 1px !important;
      margin-left: 18px !important;
      margin-right: 18px !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: rgba(214, 233, 248, 0.095) !important;
      border: 0 !important;
      border-top: 0 !important;
      box-shadow: none !important;
    }

    /* Common AdminDesigns collapsed states. Keep icon and separators centered
       without forcing any title visibility that SquareCoil already manages. */
    body.sb-l-m #sidebar_left .sidebar-menu > li > a,
    body.sidebar-collapsed #sidebar_left .sidebar-menu > li > a,
    body.sidebar-mini #sidebar_left .sidebar-menu > li > a,
    html.sb-l-m body #sidebar_left .sidebar-menu > li > a {
      grid-template-columns: minmax(0, 1fr) !important;
      column-gap: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      justify-items: center !important;
    }

    body.sb-l-m #sidebar_left .sidebar-menu > li > a > :is(
      .fa,
      .glyphicon,
      .glyphicons,
      .imoon,
      [class^="icon-"],
      [class*=" icon-"]
    ),
    body.sidebar-collapsed #sidebar_left .sidebar-menu > li > a > :is(
      .fa,
      .glyphicon,
      .glyphicons,
      .imoon,
      [class^="icon-"],
      [class*=" icon-"]
    ),
    body.sidebar-mini #sidebar_left .sidebar-menu > li > a > :is(
      .fa,
      .glyphicon,
      .glyphicons,
      .imoon,
      [class^="icon-"],
      [class*=" icon-"]
    ),
    html.sb-l-m body #sidebar_left .sidebar-menu > li > a > :is(
      .fa,
      .glyphicon,
      .glyphicons,
      .imoon,
      [class^="icon-"],
      [class*=" icon-"]
    ) {
      grid-column: 1 !important;
      width: 24px !important;
      min-width: 24px !important;
      margin: 0 !important;
      justify-self: center !important;
    }

    body.sb-l-m #sidebar_left :is(hr, .sidebar-divider, .nav-divider, li.divider),
    body.sidebar-collapsed #sidebar_left :is(hr, .sidebar-divider, .nav-divider, li.divider),
    body.sidebar-mini #sidebar_left :is(hr, .sidebar-divider, .nav-divider, li.divider),
    html.sb-l-m body #sidebar_left :is(hr, .sidebar-divider, .nav-divider, li.divider) {
      width: auto !important;
      max-width: none !important;
      margin-left: 9px !important;
      margin-right: 9px !important;
    }



    /* =========================================================
       v2.1.44 SIDEBAR DIRECT WALLPAPER MAPPING
       Backdrop-filter alone was compositing against SquareCoil's painted body
       layer, so the sidebar looked like flat gray even when its alpha was low.
       Paint the same live --us-wallpaper directly on the sidebar, with the
       same viewport-fixed position/size as the page, then add only a restrained
       dark tint. This guarantees the photo remains visible and aligned.
    ========================================================= */

    html body #sidebar_left {
      background-color: rgba(5, 14, 23, 0.18) !important;
      background-image:
        linear-gradient(180deg,
          rgba(5, 17, 28, 0.34) 0%,
          rgba(4, 14, 24, 0.28) 52%,
          rgba(3, 11, 20, 0.34) 100%),
        var(--us-wallpaper) !important;
      background-position:
        center center,
        var(--us-wallpaper-x, 50%) var(--us-wallpaper-y, 50%) !important;
      background-size:
        auto,
        var(--us-wallpaper-size, cover) !important;
      background-repeat: no-repeat, no-repeat !important;
      background-attachment: fixed, fixed !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      border-right-color: rgba(171, 215, 248, 0.10) !important;
      box-shadow:
        7px 0 24px rgba(0, 0, 0, 0.08),
        inset -1px 0 0 rgba(255, 255, 255, 0.025) !important;
    }

    /* Nothing inside the rail gets to repaint a gray plate over the photo. */
    html body #sidebar_left,
    html body #sidebar_left .sidebar-left-content,
    html body #sidebar_left .sidebar-menu,
    html body #sidebar_left .nav.sidebar-menu,
    html body #sidebar_left .sidebar-menu > li,
    html body #sidebar_left .nav.sidebar-menu > li {
      background-color: transparent !important;
    }

    html body #sidebar_left .sidebar-left-content,
    html body #sidebar_left .sidebar-menu,
    html body #sidebar_left .nav.sidebar-menu,
    html body #sidebar_left .sidebar-menu > li,
    html body #sidebar_left .nav.sidebar-menu > li {
      background-image: none !important;
    }

    /* Re-apply the photo/tint to the owning rail after the transparency reset. */
    html body #sidebar_left {
      background-color: rgba(5, 14, 23, 0.18) !important;
      background-image:
        linear-gradient(180deg,
          rgba(5, 17, 28, 0.34) 0%,
          rgba(4, 14, 24, 0.28) 52%,
          rgba(3, 11, 20, 0.34) 100%),
        var(--us-wallpaper) !important;
    }



    /* =========================================================
       v2.1.45 ONE SHARED WALLPAPER BEHIND SIDEBAR GLASS
       v2.1.44 proved the image could be visible, but painting --us-wallpaper
       directly on #sidebar_left created a second copy. The correct layering is:
       html owns the single wallpaper, body is transparent, and the sidebar is
       only translucent glass over the same root image.
    ========================================================= */

    /* Reveal the root/html wallpaper beneath fixed side chrome instead of
       letting the body paint a gray plate across the viewport. Main/content
       surfaces already own their page-specific paint later in the cascade. */
    html body:has(#sidebar_left) {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    /* Remove the v2.1.44 second wallpaper copy. This rail now contains tint +
       frost only, so the root image flows continuously behind it. */
    html body #sidebar_left {
      background:
        linear-gradient(180deg,
          rgba(7, 22, 35, 0.31) 0%,
          rgba(5, 18, 30, 0.25) 52%,
          rgba(4, 14, 24, 0.31) 100%) !important;
      background-color: rgba(5, 17, 28, 0.20) !important;
      background-image:
        linear-gradient(180deg,
          rgba(7, 22, 35, 0.31) 0%,
          rgba(5, 18, 30, 0.25) 52%,
          rgba(4, 14, 24, 0.31) 100%) !important;
      background-attachment: scroll !important;
      -webkit-backdrop-filter: blur(8px) saturate(120%) brightness(0.96) !important;
      backdrop-filter: blur(8px) saturate(120%) brightness(0.96) !important;
      border-right-color: rgba(171, 215, 248, 0.09) !important;
      box-shadow:
        6px 0 22px rgba(0, 0, 0, 0.07),
        inset -1px 0 0 rgba(255, 255, 255, 0.022) !important;
    }

    /* Inner rail elements remain paint-free. */
    html body #sidebar_left .sidebar-left-content,
    html body #sidebar_left .sidebar-menu,
    html body #sidebar_left .nav.sidebar-menu,
    html body #sidebar_left .sidebar-menu > li,
    html body #sidebar_left .nav.sidebar-menu > li {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }



    /* =========================================================
       v2.1.46 SIDEBAR BACKDROP SOURCE FIX
       The sidebar audit identified the real blocker: SquareCoil's native
       #main::before is a viewport-sized fixed #eeeeee plate. Because the
       sidebar uses backdrop-filter, Chrome was blurring that gray plate,
       not the wallpaper painted on #main underneath it. Remove only that
       obsolete pseudo paint so the existing #main wallpaper becomes the
       true shared backdrop under the fixed sidebar.
    ========================================================= */

    html body #main::before {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      pointer-events: none !important;
    }

    /* Keep the sidebar itself as one restrained glass layer. With the gray
       native plate gone, this blur now samples the same #main wallpaper that
       is visible immediately to the right instead of averaging #eeeeee. */
    html body #sidebar_left {
      background:
        linear-gradient(180deg,
          rgba(7, 22, 35, 0.24) 0%,
          rgba(5, 18, 30, 0.18) 52%,
          rgba(4, 14, 24, 0.24) 100%) !important;
      background-color: rgba(5, 17, 28, 0.14) !important;
      background-image:
        linear-gradient(180deg,
          rgba(7, 22, 35, 0.24) 0%,
          rgba(5, 18, 30, 0.18) 52%,
          rgba(4, 14, 24, 0.24) 100%) !important;
      -webkit-backdrop-filter: blur(6px) saturate(116%) brightness(0.94) !important;
      backdrop-filter: blur(6px) saturate(116%) brightness(0.94) !important;
    }



    /* =========================================================
       v2.1.47 COLLAPSED SIDEBAR TOGGLE SEPARATION
       SquareCoil exposes two left-nav controls: the navbar toggle
       (#toggle_sidemenu_l) and the dedicated mini-rail toggle
       (.sidebar-toggle-mini). In sb-l-m the navbar toggle's 45px box can
       visually collide with the first Dashboard icon. Keep the navbar toggle
       for the expanded rail, but remove it from the minified state and make
       the dedicated bottom mini-toggle the single restore control.
    ========================================================= */

    body.sb-l-m header.navbar #toggle_sidemenu_l,
    body.sb-l-m .navbar #toggle_sidemenu_l,
    html.sb-l-m body header.navbar #toggle_sidemenu_l,
    html.sb-l-m body .navbar #toggle_sidemenu_l {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /* Keep the Dashboard/home row completely independent of collapse chrome. */
    body.sb-l-m #sidebar_left .sidebar-menu > li:first-of-type > a,
    html.sb-l-m body #sidebar_left .sidebar-menu > li:first-of-type > a {
      position: relative !important;
      z-index: 1 !important;
    }

    /* The native mini toggle is the purpose-built control for the collapsed
       rail. Give it an explicit 60px lane and a centered click target so its
       geometry cannot drift back into menu-item space. */
    body.sb-l-m #sidebar_left .sidebar-toggle-mini,
    html.sb-l-m body #sidebar_left .sidebar-toggle-mini {
      display: block !important;
      width: 60px !important;
      height: 36px !important;
      margin: 18px 0 0 !important;
      padding: 0 !important;
      position: relative !important;
      left: 0 !important;
      right: auto !important;
      clear: both !important;
    }

    body.sb-l-m #sidebar_left .sidebar-toggle-mini > a,
    html.sb-l-m body #sidebar_left .sidebar-toggle-mini > a {
      position: static !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 60px !important;
      height: 36px !important;
      min-height: 36px !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    body.sb-l-m #sidebar_left .sidebar-toggle-mini > a > span,
    html.sb-l-m body #sidebar_left .sidebar-toggle-mini > a > span {
      margin: 0 !important;
      position: static !important;
    }



    /* =========================================================
       v2.1.48 COLLAPSED SIDEBAR USABLE TOGGLE ROW
       v2.1.47 hid the real working navbar toggle and relied on the native
       bottom mini-toggle. In this deployment that left no practical way to
       restore the expanded rail. Re-show the real #toggle_sidemenu_l only in
       the minified state, move it into a dedicated row directly below the
       60px navbar, and reserve matching space above the first nav item.
    ========================================================= */

    body.sb-l-m header.navbar #toggle_sidemenu_l,
    body.sb-l-m .navbar #toggle_sidemenu_l,
    html.sb-l-m body header.navbar #toggle_sidemenu_l,
    html.sb-l-m body .navbar #toggle_sidemenu_l {
      display: flex !important;
      visibility: visible !important;
      pointer-events: auto !important;
      position: fixed !important;
      top: 68px !important;
      left: 11px !important;
      right: auto !important;
      z-index: 1042 !important;
      width: 38px !important;
      min-width: 38px !important;
      max-width: 38px !important;
      height: 34px !important;
      min-height: 34px !important;
      max-height: 34px !important;
      margin: 0 !important;
      padding: 0 !important;
      align-items: center !important;
      justify-content: center !important;
      line-height: 1 !important;
      color: rgba(224, 234, 242, 0.86) !important;
      background: rgba(7, 18, 29, 0.34) !important;
      border: 1px solid rgba(190, 220, 243, 0.10) !important;
      border-radius: 8px !important;
      box-shadow: 0 5px 16px rgba(0, 0, 0, 0.11), inset 0 1px 0 rgba(255,255,255,0.025) !important;
      transform: none !important;
      cursor: pointer !important;
    }

    body.sb-l-m header.navbar #toggle_sidemenu_l:hover,
    body.sb-l-m .navbar #toggle_sidemenu_l:hover,
    html.sb-l-m body header.navbar #toggle_sidemenu_l:hover,
    html.sb-l-m body .navbar #toggle_sidemenu_l:hover {
      color: #fff !important;
      background: rgba(46, 109, 159, 0.24) !important;
      border-color: rgba(150, 205, 245, 0.18) !important;
    }

    /* Reserve a real control row so Dashboard can never share the same y-space. */
    body.sb-l-m #sidebar_left .sidebar-menu,
    body.sb-l-m #sidebar_left .nav.sidebar-menu,
    html.sb-l-m body #sidebar_left .sidebar-menu,
    html.sb-l-m body #sidebar_left .nav.sidebar-menu {
      padding-top: 44px !important;
    }

    /* Keep the functional toggle icon centered regardless of native float/line-height rules. */
    body.sb-l-m #toggle_sidemenu_l > *,
    html.sb-l-m body #toggle_sidemenu_l > * {
      margin: 0 !important;
      padding: 0 !important;
      line-height: 1 !important;
      transform: none !important;
    }

  `);

  // =========================================================
  // v2.1.30 CURATED BING WALLPAPER ROTATION
  // Fetch a small global pool of recent Bing homepage images, cache metadata,
  // and rotate locally every 30 minutes. Network refresh is capped at 6 hours.
  // The static --us-wallpaper value above remains the offline/failure fallback.
  // =========================================================
  const US_SIGN_BING_ROTATE_MS = 30 * 60 * 1000;
  const US_SIGN_BING_CACHE_MS = 6 * 60 * 60 * 1000;
  const US_SIGN_BING_CACHE_KEY = 'us-sign-bing-wallpaper-pool-v2';
  const US_SIGN_BING_MARKETS = ['en-US', 'en-GB', 'en-AU', 'ja-JP'];
  let usSignBingPool = [];
  let usSignBingRotateTimer = 0;
  let usSignBingRefreshInFlight = false;

  function usSignReadBingCache() {
    try {
      const raw = window.localStorage.getItem(US_SIGN_BING_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.images) || !parsed.images.length) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function usSignWriteBingCache(images) {
    try {
      window.localStorage.setItem(
        US_SIGN_BING_CACHE_KEY,
        JSON.stringify({ fetchedAt: Date.now(), images })
      );
    } catch (_) {
      // Storage may be blocked; live rotation still works for the current page.
    }
  }

  function usSignHashString(value) {
    let hash = 2166136261;
    const textValue = String(value || '');
    for (let i = 0; i < textValue.length; i += 1) {
      hash ^= textValue.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function usSignNormalizeBingImage(image, market) {
    if (!image || typeof image.url !== 'string') return null;
    try {
      const url = new URL(image.url, 'https://www.bing.com/');
      if (url.protocol !== 'https:') return null;
      return {
        url: url.href,
        key: String(image.urlbase || url.pathname),
        title: String(image.title || image.copyright || 'Bing wallpaper'),
        startdate: String(image.startdate || ''),
        market: String(market || '')
      };
    } catch (_) {
      return null;
    }
  }

  function usSignApplyBingWallpaper(images = usSignBingPool) {
    if (!Array.isArray(images) || !images.length || !document.documentElement) return;
    const slot = Math.floor(Date.now() / US_SIGN_BING_ROTATE_MS);
    const image = images[slot % images.length];
    if (!image || !image.url) return;

    const cssUrl = image.url.replace(/"/g, '%22');
    document.documentElement.style.setProperty('--us-wallpaper', `url("${cssUrl}")`);
    document.documentElement.dataset.usBingWallpaper = image.title || 'Bing wallpaper';
    document.documentElement.dataset.usBingMarket = image.market || '';
  }

  function usSignRequestBingMarket(market) {
    return new Promise((resolve) => {
      if (typeof GM_xmlhttpRequest !== 'function') {
        resolve([]);
        return;
      }

      const endpoint = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=${encodeURIComponent(market)}&uhd=1&uhdwidth=3840&uhdheight=2160`;
      GM_xmlhttpRequest({
        method: 'GET',
        url: endpoint,
        timeout: 9000,
        headers: { Accept: 'application/json,text/plain,*/*' },
        onload(response) {
          if (response.status < 200 || response.status >= 300) {
            resolve([]);
            return;
          }
          try {
            const payload = JSON.parse(response.responseText || '{}');
            const images = Array.isArray(payload.images) ? payload.images : [];
            resolve(images.map((image) => usSignNormalizeBingImage(image, market)).filter(Boolean));
          } catch (_) {
            resolve([]);
          }
        },
        onerror() { resolve([]); },
        ontimeout() { resolve([]); }
      });
    });
  }

  async function usSignRefreshBingPool(force = false) {
    if (usSignBingRefreshInFlight) return;

    const cached = usSignReadBingCache();
    if (cached?.images?.length) {
      usSignBingPool = cached.images;
      usSignApplyBingWallpaper();
      const cacheAge = Date.now() - Number(cached.fetchedAt || 0);
      if (!force && cacheAge >= 0 && cacheAge < US_SIGN_BING_CACHE_MS) return;
    }

    usSignBingRefreshInFlight = true;
    try {
      const batches = await Promise.all(US_SIGN_BING_MARKETS.map(usSignRequestBingMarket));
      const unique = new Map();
      batches.flat().forEach((image) => {
        if (image?.url && !unique.has(image.key)) unique.set(image.key, image);
      });

      const images = Array.from(unique.values())
        .sort((a, b) => usSignHashString(a.key) - usSignHashString(b.key));

      if (images.length) {
        usSignBingPool = images;
        usSignWriteBingCache(images);
        usSignApplyBingWallpaper();
      }
    } finally {
      usSignBingRefreshInFlight = false;
    }
  }

  function usSignScheduleBingRotation() {
    if (usSignBingRotateTimer) window.clearTimeout(usSignBingRotateTimer);
    const now = Date.now();
    const untilNextSlot = US_SIGN_BING_ROTATE_MS - (now % US_SIGN_BING_ROTATE_MS) + 500;
    usSignBingRotateTimer = window.setTimeout(() => {
      usSignApplyBingWallpaper();
      usSignRefreshBingPool(false);
      usSignScheduleBingRotation();
    }, untilNextSlot);
  }

  function usSignInitBingWallpapers() {
    const cached = usSignReadBingCache();
    if (cached?.images?.length) {
      usSignBingPool = cached.images;
      usSignApplyBingWallpaper();
    }
    usSignRefreshBingPool(false);
    usSignScheduleBingRotation();
  }

  usSignInitBingWallpapers();


  // =========================================================
  // v2.1.31 SUBTLE POINTER PARALLAX
  // One passive pointer listener. RAF runs only while easing toward a target,
  // then stops. No permanent animation loop or DOM overlay.
  // =========================================================
  const US_SIGN_PARALLAX_X = 6;
  const US_SIGN_PARALLAX_Y = 4;
  const US_SIGN_PARALLAX_EASE = 0.14;
  let usSignParallaxTargetX = 50;
  let usSignParallaxTargetY = 50;
  let usSignParallaxCurrentX = 50;
  let usSignParallaxCurrentY = 50;
  let usSignParallaxRaf = 0;

  function usSignUpdateWallpaperOverscan() {
    if (!document.documentElement) return;
    const ratio = Math.max(1, window.innerWidth) / Math.max(1, window.innerHeight);
    document.documentElement.style.setProperty(
      '--us-wallpaper-size',
      ratio >= (16 / 9) ? '106vw auto' : 'auto 106vh'
    );
  }

  function usSignRenderParallax() {
    usSignParallaxRaf = 0;
    const dx = usSignParallaxTargetX - usSignParallaxCurrentX;
    const dy = usSignParallaxTargetY - usSignParallaxCurrentY;

    usSignParallaxCurrentX += dx * US_SIGN_PARALLAX_EASE;
    usSignParallaxCurrentY += dy * US_SIGN_PARALLAX_EASE;

    document.documentElement.style.setProperty('--us-wallpaper-x', `${usSignParallaxCurrentX.toFixed(3)}%`);
    document.documentElement.style.setProperty('--us-wallpaper-y', `${usSignParallaxCurrentY.toFixed(3)}%`);

    if (Math.abs(dx) > 0.025 || Math.abs(dy) > 0.025) {
      usSignParallaxRaf = window.requestAnimationFrame(usSignRenderParallax);
    }
  }

  function usSignRequestParallaxFrame() {
    if (!usSignParallaxRaf) {
      usSignParallaxRaf = window.requestAnimationFrame(usSignRenderParallax);
    }
  }

  function usSignCenterParallax() {
    usSignParallaxTargetX = 50;
    usSignParallaxTargetY = 50;
    usSignRequestParallaxFrame();
  }

  function usSignInitWallpaperParallax() {
    const motionQuery = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    usSignUpdateWallpaperOverscan();

    window.addEventListener('resize', usSignUpdateWallpaperOverscan, { passive: true });

    if (!motionQuery.matches) return;

    window.addEventListener('pointermove', (event) => {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      const nx = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;

      // Positive background-position moves an oversized image opposite the pointer,
      // giving the glass a restrained depth/parallax effect.
      usSignParallaxTargetX = 50 + (nx * US_SIGN_PARALLAX_X);
      usSignParallaxTargetY = 50 + (ny * US_SIGN_PARALLAX_Y);
      usSignRequestParallaxFrame();
    }, { passive: true });

    document.addEventListener('mouseleave', usSignCenterParallax, { passive: true });
    window.addEventListener('blur', usSignCenterParallax, { passive: true });
  }

  usSignInitWallpaperParallax();

  // v2.1.13: bounded cleanup for inline rich-text highlight paint that can
  // outrank stylesheet rules. No observer and no recurring interval.
  function usSignClearDescriptionHighlightPaint() {
    const roots = document.querySelectorAll('#descriptionbox, .us-sign-description-panel, .us-sign-readable-content');
    roots.forEach((root) => {
      root.querySelectorAll('mark, .marker, .highlight, [class*="highlight" i], [style*="background" i], [bgcolor]').forEach((el) => {
        if (el.hasAttribute('bgcolor')) el.removeAttribute('bgcolor');
        el.style.setProperty('background', 'transparent', 'important');
        el.style.setProperty('background-color', 'transparent', 'important');
        el.style.setProperty('background-image', 'none', 'important');
        el.style.setProperty('box-shadow', 'none', 'important');
        el.style.setProperty('text-shadow', 'none', 'important');
        el.style.setProperty('border', '0', 'important');
        el.style.setProperty('border-radius', '0', 'important');
        el.style.setProperty('padding', '0', 'important');
      });
    });
  }

  function usSignScheduleDescriptionCleanup() {
    [0, 180, 500, 1100, 2200, 3600].forEach((delay) => {
      window.setTimeout(usSignClearDescriptionHighlightPaint, delay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', usSignScheduleDescriptionCleanup, { once: true });
  } else {
    usSignScheduleDescriptionCleanup();
  }
  window.addEventListener('pageshow', usSignScheduleDescriptionCleanup);


  // =========================================================
  // v2.1.39 SEMANTIC PROJECT UX TAGGING
  // Bounded DOM-ready passes only. No MutationObserver and no recurring timer.
  // =========================================================
  function usSignSemanticStateFromText(text) {
    const value = String(text || '').trim().toLowerCase();
    if (!value) return '';
    if (/overdue|failed|rejected|cancel(?:led|ed)|blocked|critical/.test(value)) return 'danger';
    if (/urgent|high priority|rush/.test(value)) return 'urgent';
    if (/approved|complete(?:d)?|ready|released|installed/.test(value)) return 'success';
    if (/submitted|sent/.test(value)) return 'submitted';
    if (/on hold|hold|paused/.test(value)) return 'hold';
    if (/pending|in progress|review|open|awaiting|estimating/.test(value)) return 'pending';
    if (/not set|none|n\/a|tbd/.test(value)) return 'unset';
    return '';
  }

  function usSignParseShortDate(text) {
    const match = String(text || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function usSignDueState(text) {
    const due = usSignParseShortDate(text);
    if (!due) return '';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
    const days = Math.round((due.getTime() - today.getTime()) / 86400000);
    if (days < 0) return 'overdue';
    if (days === 0) return 'due-today';
    if (days <= 3) return 'due-soon';
    return '';
  }

  function usSignApplyProjectSemanticUX() {
    const summary = document.querySelector('#us-sign-design-summary');
    const actionbar = document.querySelector('#us-sign-design-actionbar');
    if (!summary || !actionbar) return;

    document.documentElement.classList.add('us-sign-semantic-project-ux');

    summary.querySelectorAll('.us-sign-djt-summary-cell').forEach((cell) => {
      const label = (cell.querySelector('.us-sign-djt-summary-label')?.textContent || '').trim().toLowerCase();
      const valueEl = cell.querySelector('.us-sign-djt-summary-value');
      if (!valueEl) return;
      const value = (valueEl.textContent || '').trim();
      let state = '';

      if (label === 'due date') state = usSignDueState(value);
      else if (label === 'priority' || label === 'status') state = usSignSemanticStateFromText(value);
      if (label === 'hours') cell.dataset.usField = 'hours';

      cell.removeAttribute('data-us-state');
      valueEl.removeAttribute('data-us-state');
      if (state) {
        cell.dataset.usState = state;
        valueEl.dataset.usState = state;
      }
    });

    document.querySelectorAll('.alert').forEach((alert) => {
      const text = (alert.textContent || '').replace(/\s+/g, ' ').trim();
      alert.removeAttribute('data-us-state');
      if (/^pending\b/i.test(text)) alert.dataset.usState = 'pending';
      else {
        const state = usSignSemanticStateFromText(text);
        if (state) alert.dataset.usState = state;
      }
    });

    const tagAction = (el, action) => {
      if (el) el.dataset.usAction = action;
    };

    actionbar.querySelectorAll('a, button, .btn').forEach((el) => {
      const text = (el.textContent || el.value || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!text) return;
      if (/delete|remove/.test(text)) tagAction(el, 'danger');
      else if (/^new$|^\+$|create|add/.test(text)) tagAction(el, 'primary');
      else tagAction(el, 'utility');
    });

    document.querySelectorAll('#us-sign-job-copy-tools button, #us-sign-job-copy-tools a').forEach((el) => tagAction(el, 'utility'));
    document.querySelectorAll('#us-sign-native-action-group a, #us-sign-native-action-group button').forEach((el) => {
      const text = (el.textContent || '').trim().toLowerCase();
      tagAction(el, /delete|remove/.test(text) ? 'danger' : 'utility');
    });

    tagAction(document.querySelector('#delete-design'), 'danger');
    tagAction(document.querySelector('#time-clock-clock-in-to-project-from-project'), 'clock-in');
    tagAction(document.querySelector('#clockout'), 'warning');
    tagAction(document.querySelector('#duplicate'), 'utility');

    document.querySelectorAll('#badge-task-count, #badge-design-count, #badge-estimate-count').forEach((badge) => {
      const count = Number.parseInt((badge.textContent || '').trim(), 10);
      badge.dataset.usZero = Number.isFinite(count) && count === 0 ? 'true' : 'false';
    });
  }

  function usSignScheduleProjectSemanticUX() {
    [0, 120, 350, 800, 1600, 2800].forEach((delay) => window.setTimeout(usSignApplyProjectSemanticUX, delay));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', usSignScheduleProjectSemanticUX, { once: true });
  } else {
    usSignScheduleProjectSemanticUX();
  }
  window.addEventListener('pageshow', usSignScheduleProjectSemanticUX);


  // v2.1.14: URL-scoped Project Search marker. No observer or polling.
  if (/\/search\.php$/i.test(window.location.pathname)) {
    document.documentElement.classList.add("us-sign-search-page");
  }


  // v2.1.15: mark the project Task page from its own native UI.
  // One DOM-ready check plus pageshow; no observer and no polling.
  function usSignMarkTaskPage() {
    const taskSearch = document.querySelector('input[placeholder*="Search Tasks" i]');
    if (!taskSearch) return;

    const headings = document.querySelectorAll('.panel-heading, .panel-title, h1, h2, h3, h4');
    const hasSelectedTask = Array.from(headings).some((el) => /Selected\s+Task/i.test(el.textContent || ''));
    const hasTasksPanel = Array.from(headings).some((el) => /^\s*Tasks\s*$/i.test(el.textContent || ''));

    if (hasSelectedTask || hasTasksPanel) {
      document.documentElement.classList.add('us-sign-task-page');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', usSignMarkTaskPage, { once: true });
  } else {
    usSignMarkTaskPage();
  }
  window.addEventListener('pageshow', usSignMarkTaskPage);


  // v2.1.29: source-targeted landing Dashboard detection.
  // dashboard.php owns #page-content plus the three native widget IDs.
  // Bounded checks only; no permanent observer or polling loop.
  function usSignMarkMainDashboard() {
    document.documentElement.classList.remove('us-sign-main-dashboard');

    const projectContext = document.querySelector(
      '#customer-info, #customer-name, #us-sign-design-actionbar, #us-sign-design-bottom-grid, #ps-select, .us-sign-scope-enhanced, .important-notes'
    );
    if (projectContext) return;

    const isDashboardPath = /\/dashboard\.php$/i.test(window.location.pathname);
    const hasPageContent = !!document.querySelector('#page-content');
    const hasNativeWidgets = !!(
      document.querySelector('#widget-tasks') &&
      document.querySelector('#widget-designs') &&
      document.querySelector('#widget-estimates')
    );
    const hasDashboardBreadcrumb = /^\s*Dashboard\s*$/i.test(
      (document.querySelector('#bread-crumb')?.textContent || '')
    );

    if ((isDashboardPath && hasPageContent) || hasNativeWidgets || hasDashboardBreadcrumb) {
      document.documentElement.classList.add('us-sign-main-dashboard');
    }
  }

  function usSignScheduleMainDashboardMark() {
    [0, 120, 350, 700, 1400, 2600, 4200].forEach((delay) => window.setTimeout(usSignMarkMainDashboard, delay));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', usSignScheduleMainDashboardMark, { once: true });
  } else {
    usSignScheduleMainDashboardMark();
  }
  window.addEventListener('pageshow', usSignScheduleMainDashboardMark);
  window.addEventListener('us-sign-location-change', usSignScheduleMainDashboardMark);


  function usSignMarkJobDashboard() {
    const hasCustomer = !!document.querySelector('#customer-info');
    const hasImportantNotes = !!document.querySelector('.important-notes');
    const isScope = !!document.querySelector('#ps-select, .us-sign-scope-enhanced');
    const isDesign = !!document.querySelector('#us-sign-design-actionbar, #us-sign-design-bottom-grid');
    const isStatus = usSignIsProjectStatusPage || document.documentElement.classList.contains('us-sign-project-status-page');
    if (isStatus) {
      document.documentElement.classList.remove('us-sign-job-dashboard');
      return;
    }
    if (hasCustomer && hasImportantNotes && !isScope && !isDesign) document.documentElement.classList.add('us-sign-job-dashboard');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', usSignMarkJobDashboard, { once: true });
  else usSignMarkJobDashboard();
  window.addEventListener('pageshow', usSignMarkJobDashboard);

})();
