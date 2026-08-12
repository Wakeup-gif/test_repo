// ==UserScript==
// @name         Adobe Acrobat - US Sign Colors
// @namespace    us-sign-local-tools
// @version      1.0.0
// @description  Color-only dark graphite theme for Acrobat Web. Leaves button layout and button-specific styling untouched.
// @match        https://acrobat.adobe.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/Adobe-Acrobat-US-Sign-Colors.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/Adobe-Acrobat-US-Sign-Colors.user.js
// ==/UserScript==

(function () {
  "use strict";

  GM_addStyle(String.raw`
    :root {
      color-scheme: dark;
      --us-acrobat-bg: #111418;
      --us-acrobat-surface: #171b20;
      --us-acrobat-surface-soft: #1c2127;
      --us-acrobat-surface-hover: #242a31;
      --us-acrobat-text: #f4f6f8;
      --us-acrobat-text-soft: #c9ced5;
      --us-acrobat-text-muted: #8f98a3;
      --us-acrobat-accent: #c1ccd7;
      --us-acrobat-border: rgba(255, 255, 255, 0.085);
      --us-acrobat-border-strong: rgba(255, 255, 255, 0.14);
      --us-acrobat-selection: rgba(193, 204, 215, 0.25);
    }

    html,
    body {
      color: var(--us-acrobat-text-soft) !important;
      background: var(--us-acrobat-bg) !important;
      background-color: var(--us-acrobat-bg) !important;
    }

    ::selection {
      color: var(--us-acrobat-text) !important;
      background: var(--us-acrobat-selection) !important;
    }

    /* App shell and viewer surroundings. PDF page/canvas content is intentionally untouched. */
    #root,
    #app,
    [id*="root" i],
    [id*="app" i],
    main,
    [role="main"],
    [class*="app-shell" i],
    [class*="appshell" i],
    [class*="workspace" i],
    [class*="work-space" i],
    [class*="viewer-container" i],
    [class*="viewercontainer" i] {
      color: var(--us-acrobat-text-soft) !important;
      background-color: var(--us-acrobat-bg) !important;
    }

    /* Header, navigation and side rails. */
    header,
    nav,
    aside,
    [role="navigation"],
    [role="complementary"],
    [class*="header" i],
    [class*="topbar" i],
    [class*="top-bar" i],
    [class*="sidebar" i],
    [class*="side-bar" i],
    [class*="rail" i] {
      color: var(--us-acrobat-text-soft) !important;
      background-color: var(--us-acrobat-surface) !important;
      border-color: var(--us-acrobat-border) !important;
    }

    /* Panels, trays, drawers and cards. */
    [class*="panel" i],
    [class*="drawer" i],
    [class*="tray" i],
    [class*="card" i],
    [class*="property" i],
    [class*="properties" i],
    [class*="inspector" i] {
      color: var(--us-acrobat-text-soft) !important;
      background-color: var(--us-acrobat-surface) !important;
      border-color: var(--us-acrobat-border) !important;
    }

    /* Menus, popovers, listboxes and dialogs. */
    [role="menu"],
    [role="listbox"],
    [role="dialog"],
    [role="alertdialog"],
    [class*="menu" i],
    [class*="popover" i],
    [class*="popup" i],
    [class*="dialog" i],
    [class*="modal" i],
    [class*="tooltip" i] {
      color: var(--us-acrobat-text-soft) !important;
      background-color: var(--us-acrobat-surface-soft) !important;
      border-color: var(--us-acrobat-border-strong) !important;
    }

    [role="menuitem"],
    [role="option"] {
      color: var(--us-acrobat-text-soft) !important;
    }

    [role="menuitem"]:hover,
    [role="option"]:hover,
    [role="option"][aria-selected="true"] {
      color: var(--us-acrobat-text) !important;
      background-color: var(--us-acrobat-surface-hover) !important;
    }

    /* Text and secondary labels. No button selectors are included. */
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    label,
    legend,
    [role="heading"] {
      color: var(--us-acrobat-text) !important;
    }

    small,
    [class*="muted" i],
    [class*="secondary" i],
    [class*="description" i],
    [class*="subtitle" i],
    [class*="sub-title" i] {
      color: var(--us-acrobat-text-muted) !important;
    }

    a:not([role="button"]) {
      color: var(--us-acrobat-accent) !important;
    }

    a:not([role="button"]):hover,
    a:not([role="button"]):focus {
      color: var(--us-acrobat-text) !important;
    }

    /* Inputs only. Buttons are intentionally excluded. */
    input:not([type="button"]):not([type="submit"]):not([type="reset"]),
    textarea,
    select {
      color: var(--us-acrobat-text) !important;
      background-color: var(--us-acrobat-surface-soft) !important;
      border-color: var(--us-acrobat-border) !important;
    }

    input:not([type="button"]):not([type="submit"]):not([type="reset"])::placeholder,
    textarea::placeholder {
      color: var(--us-acrobat-text-muted) !important;
    }

    select option,
    select optgroup {
      color: var(--us-acrobat-text-soft) !important;
      background-color: var(--us-acrobat-surface) !important;
    }

    /* Common separators. */
    hr,
    [role="separator"] {
      border-color: var(--us-acrobat-border) !important;
      background-color: var(--us-acrobat-border) !important;
    }

    /* Scrollbars. */
    * {
      scrollbar-color: #444c55 #171b20;
    }

    *::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    *::-webkit-scrollbar-track {
      background: #171b20;
    }

    *::-webkit-scrollbar-thumb {
      background: #444c55;
      border: 2px solid #171b20;
      border-radius: 10px;
    }

    *::-webkit-scrollbar-thumb:hover {
      background: #59636e;
    }

    /* Keep document rendering surfaces alone. */
    canvas,
    iframe,
    embed,
    object,
    svg {
      color-scheme: normal;
    }
  `);
})();
