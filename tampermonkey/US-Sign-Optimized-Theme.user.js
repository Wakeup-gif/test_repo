// ==UserScript==
// @name         US Sign Optimized Theme
// @namespace    us-sign-optimized
// @version      1.0.1
// @description  Lightweight dark interface theme for US Sign SquareCoil.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  GM_addStyle(String.raw`
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

    :root {
      --us-bg: #101419;
      --us-bg-2: #171c22;
      --us-panel: rgba(25, 30, 37, 0.94);
      --us-panel-soft: rgba(255, 255, 255, 0.035);
      --us-hover: rgba(255, 255, 255, 0.075);
      --us-text: #edf1f5;
      --us-soft: #c5ccd4;
      --us-muted: #8f99a5;
      --us-line: rgba(255, 255, 255, 0.105);
      --us-line-strong: rgba(255, 255, 255, 0.17);
      --us-accent: #a9bac9;
      --us-green: #9fc4aa;
      --us-red: #d3a0a0;
      --us-gold: #d4bd8c;
      --us-blue: #a9c2d8;
      --us-radius: 10px;
      --us-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
      --us-font: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    html,
    body {
      min-height: 100% !important;
      background: var(--us-bg) !important;
      color: var(--us-text) !important;
      font-family: var(--us-font) !important;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    body,
    input,
    textarea,
    select,
    button {
      font-family: var(--us-font) !important;
    }

    #main,
    #content_wrapper,
    #content,
    .tray,
    .tray-center,
    .container,
    .container-fluid {
      background: transparent !important;
      color: var(--us-text) !important;
    }

    header.navbar,
    .navbar-fixed-top,
    #sidebar_left,
    #pmlt {
      background: rgba(16, 20, 25, 0.96) !important;
      border-color: var(--us-line) !important;
      box-shadow: none !important;
    }

    header.navbar {
      border-bottom: 1px solid var(--us-line) !important;
    }

    #sidebar_left {
      border-right: 1px solid var(--us-line) !important;
    }

    header.navbar .navbar-brand,
    header.navbar .navbar-branding {
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      overflow: visible !important;
    }

    header.navbar .navbar-brand img,
    header.navbar img[src*="US-Sign" i],
    header.navbar img[src*="logo" i] {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      width: auto !important;
      max-width: 180px !important;
      height: auto !important;
      max-height: 52px !important;
      object-fit: contain !important;
      background: transparent !important;
      filter: none !important;
    }

    a,
    #sidebar_left a,
    #pmlt a,
    .panel a {
      color: var(--us-accent) !important;
      text-decoration: none !important;
    }

    a:hover,
    a:focus {
      color: #ffffff !important;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    strong,
    b,
    .panel-title {
      color: var(--us-text) !important;
      text-shadow: none !important;
    }

    p,
    li,
    td,
    th,
    label,
    address,
    .help-block,
    small {
      color: var(--us-soft) !important;
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
    .cke,
    .note-editor {
      background: var(--us-panel) !important;
      background-image: none !important;
      border: 1px solid var(--us-line) !important;
      border-radius: var(--us-radius) !important;
      color: var(--us-text) !important;
      box-shadow: var(--us-shadow) !important;
    }

    .panel-heading,
    .panel-footer,
    .modal-header,
    .modal-footer,
    .cke_top,
    .cke_bottom {
      background: var(--us-panel-soft) !important;
      border-color: var(--us-line) !important;
      color: var(--us-text) !important;
      box-shadow: none !important;
    }

    .panel-body,
    .modal-body,
    .popover-content {
      background: transparent !important;
      color: var(--us-text) !important;
    }

    .btn,
    button,
    input[type="button"],
    input[type="submit"] {
      min-height: 34px !important;
      padding: 7px 12px !important;
      background: rgba(255, 255, 255, 0.055) !important;
      background-image: none !important;
      border: 1px solid var(--us-line-strong) !important;
      border-radius: 7px !important;
      color: var(--us-text) !important;
      box-shadow: none !important;
      text-shadow: none !important;
      transform: none !important;
    }

    .btn:hover,
    button:hover,
    input[type="button"]:hover,
    input[type="submit"]:hover {
      background: var(--us-hover) !important;
      border-color: rgba(255, 255, 255, 0.24) !important;
      color: #ffffff !important;
    }

    .btn-success {
      background: rgba(109, 156, 124, 0.22) !important;
      color: #dce9e0 !important;
    }

    .btn-warning {
      background: rgba(187, 153, 84, 0.22) !important;
      color: #eee4d0 !important;
    }

    .btn-danger {
      background: rgba(184, 103, 103, 0.22) !important;
      color: #f0dddd !important;
    }

    input,
    textarea,
    select,
    .form-control {
      background: rgba(255, 255, 255, 0.04) !important;
      background-image: none !important;
      border: 1px solid var(--us-line) !important;
      border-radius: 7px !important;
      color: var(--us-text) !important;
      box-shadow: none !important;
    }

    input:focus,
    textarea:focus,
    select:focus,
    .form-control:focus {
      border-color: rgba(169, 186, 201, 0.48) !important;
      box-shadow: 0 0 0 3px rgba(169, 186, 201, 0.09) !important;
      outline: none !important;
    }

    select option,
    select optgroup {
      background: var(--us-bg-2) !important;
      color: var(--us-text) !important;
    }

    .dropdown-menu,
    .multiselect-container.dropdown-menu,
    .select2-dropdown,
    .bootstrap-datetimepicker-widget,
    .datepicker,
    .ui-datepicker {
      background: rgba(20, 24, 30, 0.99) !important;
      border: 1px solid var(--us-line-strong) !important;
      border-radius: 9px !important;
      color: var(--us-text) !important;
      box-shadow: 0 18px 45px rgba(0, 0, 0, 0.42) !important;
      z-index: 2147483000 !important;
    }

    .dropdown-menu > li > a,
    .multiselect-container > li > a > label,
    .select2-results__option {
      color: var(--us-soft) !important;
    }

    .dropdown-menu > li > a:hover,
    .dropdown-menu > li > a:focus,
    .multiselect-container > li > a:hover,
    .select2-results__option--highlighted {
      background: var(--us-hover) !important;
      color: var(--us-text) !important;
    }

    table,
    .table {
      background: rgba(255, 255, 255, 0.018) !important;
      border-color: var(--us-line) !important;
      color: var(--us-soft) !important;
    }

    table th,
    table td,
    .table > thead > tr > th,
    .table > tbody > tr > td {
      background: transparent !important;
      border-color: var(--us-line) !important;
      color: var(--us-soft) !important;
    }

    table tbody tr:hover,
    .table > tbody > tr:hover {
      background: var(--us-hover) !important;
    }

    #pmlt {
      color: var(--us-soft) !important;
    }

    #pmlt h1,
    #pmlt h1 * {
      color: var(--us-text) !important;
    }

    #sidebar_left .nav > li > a {
      background: transparent !important;
      border-radius: 7px !important;
      color: var(--us-soft) !important;
    }

    #sidebar_left .nav > li > a:hover {
      background: var(--us-hover) !important;
      color: var(--us-text) !important;
    }

    #sidebar_left .nav > li.active > a,
    #sidebar_left .active > a {
      background: rgba(169, 186, 201, 0.14) !important;
      color: var(--us-text) !important;
    }

    .cke,
    .cke_inner,
    .cke_chrome {
      background: var(--us-panel) !important;
      border-color: var(--us-line) !important;
      box-shadow: none !important;
    }

    .cke_toolgroup,
    .cke_combo_button {
      background: rgba(255, 255, 255, 0.04) !important;
      border-color: var(--us-line) !important;
      box-shadow: none !important;
    }

    .cke_combo_text,
    .cke_button_label {
      color: var(--us-soft) !important;
    }

    mark,
    [style*="background-color: yellow" i],
    [style*="background: yellow" i],
    [style*="#ffff00" i],
    [style*="#ff0" i] {
      background: rgba(212, 189, 140, 0.20) !important;
      color: var(--us-text) !important;
      -webkit-text-fill-color: var(--us-text) !important;
      border-radius: 4px !important;
      text-shadow: none !important;
    }

    [style*="color: blue" i],
    [style*="color:blue" i],
    [style*="#0000ff" i],
    [style*="#00f" i],
    [style*="rgb(0, 0, 255)" i],
    font[color="blue" i],
    font[color="#0000ff" i] {
      color: var(--us-blue) !important;
      -webkit-text-fill-color: var(--us-blue) !important;
      text-shadow: none !important;
      filter: none !important;
    }

    [style*="color: red" i],
    [style*="color:red" i],
    [style*="#ff0000" i],
    font[color="red" i] {
      color: var(--us-red) !important;
      -webkit-text-fill-color: var(--us-red) !important;
    }

    [style*="color: green" i],
    [style*="color:green" i],
    [style*="#008000" i],
    font[color="green" i] {
      color: var(--us-green) !important;
      -webkit-text-fill-color: var(--us-green) !important;
    }

    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    ::-webkit-scrollbar-track {
      background: var(--us-bg);
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.17);
      border: 2px solid var(--us-bg);
      border-radius: 999px;
    }

    body.us-sign-project-page #customer-name {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      min-height: 48px !important;
      padding: 8px 13px !important;
    }

    body.us-sign-project-page #customer-name h1,
    body.us-sign-project-page #customer-name h2 {
      margin: 0 !important;
      font-size: clamp(23px, 2vw, 30px) !important;
      line-height: 1.05 !important;
    }

    body.us-sign-project-page #mapcontainer {
      margin-top: 7px !important;
    }

    body.us-sign-project-page #descriptionbox,
    body.us-sign-project-page #filesbox,
    body.us-sign-design-page #descriptionbox,
    body.us-sign-design-page #filesbox {
      margin-top: 10px !important;
    }

    body.us-sign-project-page .multiselect-native-select,
    body.us-sign-project-page .multiselect-native-select > .btn-group {
      position: relative !important;
      overflow: visible !important;
    }

    body.us-sign-project-page .multiselect-container.dropdown-menu {
      position: absolute !important;
      top: calc(100% + 5px) !important;
      right: 0 !important;
      left: auto !important;
      width: min(430px, calc(100vw - 32px)) !important;
      max-height: 360px !important;
      overflow-y: auto !important;
    }

    @media (max-width: 760px) {
      .navbar-form,
      .timeclock-container {
        max-width: 100% !important;
      }

      body.us-sign-project-page #customer-name {
        align-items: flex-start !important;
        flex-direction: column !important;
      }
    }

    @media print {
      html,
      body,
      #main,
      #content_wrapper,
      #content,
      .panel,
      .well,
      table,
      .table {
        background: #ffffff !important;
        color: #000000 !important;
        box-shadow: none !important;
      }
    }
  `);

  function classifyPage() {
    const body = document.body;

    if (!body) {
      return;
    }

    const path = location.pathname.toLowerCase();

    if (
      path.endsWith("/project.php") ||
      document.querySelector("#ps-select, textarea#description")
    ) {
      body.classList.add("us-sign-project-page");
    }

    if (
      path.includes("design") ||
      document.querySelector("#designbox, #projectbox")
    ) {
      body.classList.add("us-sign-design-page");
    }
  }

  function restoreNativeLogo() {
    const logo =
      document.querySelector("header.navbar .navbar-brand img") ||
      document.querySelector('img[src*="US-Sign" i]');

    if (!logo) {
      return;
    }

    const nativeSource =
      "images/US-Sign&-Mill-Logo - sized for SC site.png";

    if (!logo.getAttribute("src")) {
      logo.setAttribute("src", nativeSource);
    }

    logo.removeAttribute("srcset");
    logo.style.setProperty("display", "block", "important");
    logo.style.setProperty("visibility", "visible", "important");
    logo.style.setProperty("opacity", "1", "important");
  }

  function start() {
    classifyPage();
    restoreNativeLogo();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
