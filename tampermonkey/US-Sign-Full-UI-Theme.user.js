// ==UserScript==
// @name         US Sign Full UI Theme
// @namespace    us-sign-full-modules
// @version      2.1.0
// @description  Stable SquareCoil layout from the v1.2.0 restore point with blue macOS-inspired glass colors and a fixed scenic wallpaper. No project geometry overrides.
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
      --us-bg: rgba(9, 15, 23, 0.46);
      --us-bg-elevated: rgba(16, 24, 34, 0.80);
      --us-bg-soft: rgba(22, 31, 42, 0.74);
      --us-glass: rgba(18, 27, 38, 0.68);
      --us-glass-strong: rgba(13, 21, 31, 0.84);
      --us-glass-soft: rgba(255, 255, 255, 0.045);
      --us-hover: rgba(100, 180, 255, 0.10);
      --us-text: #f5f8fb;
      --us-text-soft: #d2d9e1;
      --us-text-muted: #96a5b5;
      --us-accent: #8ecbff;
      --us-accent-soft: rgba(10, 132, 255, 0.18);
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
      --us-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", system-ui, sans-serif;
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

    /* Site-wide fixed wallpaper. Main canvas wrappers are transparent so the image remains visible behind the UI. */
    html {
      background-color: #111418 !important;
      background-image:
        linear-gradient(rgba(11, 14, 17, 0.44), rgba(11, 14, 17, 0.62)),
        url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1") !important;
      background-position: center center, center center !important;
      background-size: cover, cover !important;
      background-repeat: no-repeat, no-repeat !important;
      background-attachment: fixed, fixed !important;
    }

    body {
      background: rgba(17, 20, 24, 0.30) !important;
      background-color: rgba(17, 20, 24, 0.30) !important;
      background-image: none !important;
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
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
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
       v2.1.0 VISUAL-ONLY WALLPAPER + BLUE GLASS
       Built on the known-good v1.2.0 layout. These rules intentionally
       change paint only. No project/tray geometry is modified here.
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
      background: var(--us-bg) !important;
      background-color: var(--us-bg) !important;
      background-image: none !important;
    }

    header,
    header.navbar,
    .navbar,
    .navbar-fixed-top,
    #topbar,
    .topbar {
      background: rgba(11, 18, 28, 0.84) !important;
      background-color: rgba(11, 18, 28, 0.84) !important;
      border-bottom-color: rgba(100, 210, 255, 0.13) !important;
    }

    #sidebar_left,
    #pmlt {
      background: rgba(10, 17, 26, 0.82) !important;
      background-color: rgba(10, 17, 26, 0.82) !important;
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
  `);
})();
