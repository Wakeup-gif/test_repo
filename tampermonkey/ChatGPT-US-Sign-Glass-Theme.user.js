// ==UserScript==
// @name         ChatGPT - US Sign Glass Theme
// @namespace    us-sign-full-modules
// @version      1.0.0
// @description  Lightweight ChatGPT restyle using the US Sign graphite glass palette, compact controls, and low-overhead static CSS.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__chatgptUsSignGlassThemeV100) return;
  window.__chatgptUsSignGlassThemeV100 = true;

  GM_addStyle(String.raw`
    :root,
    html.dark,
    html[data-theme="dark"] {
      --us-bg: #111418;
      --us-bg-elevated: #171b20;
      --us-bg-soft: #1c2127;
      --us-glass: rgba(30, 35, 42, 0.78);
      --us-glass-strong: rgba(25, 29, 35, 0.94);
      --us-glass-soft: rgba(255, 255, 255, 0.035);
      --us-hover: rgba(255, 255, 255, 0.065);
      --us-text: #f4f6f8;
      --us-text-soft: #c9ced5;
      --us-text-muted: #8f98a3;
      --us-accent: #c1ccd7;
      --us-accent-soft: rgba(155, 172, 189, 0.16);
      --us-success: #78a88a;
      --us-warning: #c7a96b;
      --us-danger: #c47a7a;
      --us-info: #7d9eb8;
      --us-border: rgba(255, 255, 255, 0.085);
      --us-border-strong: rgba(255, 255, 255, 0.14);
      --us-border-focus: rgba(193, 204, 215, 0.42);
      --us-shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.18);
      --us-shadow-md: 0 12px 32px rgba(0, 0, 0, 0.24);
      --us-radius-sm: 7px;
      --us-radius-md: 10px;
      --us-radius-lg: 14px;

      /* ChatGPT surface variable overrides. These fail harmlessly if a variable is unused. */
      --main-surface-primary: var(--us-bg) !important;
      --main-surface-secondary: var(--us-bg-elevated) !important;
      --main-surface-tertiary: var(--us-bg-soft) !important;
      --sidebar-surface-primary: #101419 !important;
      --sidebar-surface-secondary: var(--us-bg-elevated) !important;
      --sidebar-surface-tertiary: var(--us-bg-soft) !important;
      --composer-surface: rgba(25, 29, 35, 0.95) !important;
      --composer-blue-bg: rgba(125, 158, 184, 0.16) !important;
      --message-surface: rgba(255, 255, 255, 0.025) !important;
      --text-primary: var(--us-text) !important;
      --text-secondary: var(--us-text-soft) !important;
      --text-tertiary: var(--us-text-muted) !important;
      --border-light: var(--us-border) !important;
      --border-medium: var(--us-border-strong) !important;
      --interactive-bg-secondary-default: rgba(255, 255, 255, 0.04) !important;
      --interactive-bg-secondary-hover: rgba(255, 255, 255, 0.075) !important;
    }

    html,
    body,
    #__next {
      min-height: 100% !important;
      color: var(--us-text) !important;
      background: var(--us-bg) !important;
      background-color: var(--us-bg) !important;
      background-image: none !important;
    }

    body {
      scrollbar-color: rgba(255, 255, 255, 0.16) var(--us-bg) !important;
    }

    /* Main application surfaces */
    main,
    [role="main"],
    [data-testid="conversation-turn-list"],
    [data-testid="conversation-turn-list"] > div,
    .relative.flex.h-full,
    .flex.h-full.w-full {
      background-color: transparent !important;
      background-image: none !important;
    }

    /* Sidebar / navigation */
    nav,
    aside,
    [data-testid="left-sidebar"],
    [data-testid="sidebar"],
    [data-testid="navigation-sidebar"] {
      color: var(--us-text-soft) !important;
      background: rgba(16, 20, 25, 0.97) !important;
      background-image: none !important;
      border-color: var(--us-border) !important;
      box-shadow: none !important;
    }

    nav a,
    aside a,
    [data-testid="left-sidebar"] a,
    [data-testid="sidebar"] a {
      border-radius: var(--us-radius-sm) !important;
    }

    nav a:hover,
    aside a:hover,
    [data-testid="left-sidebar"] a:hover,
    [data-testid="sidebar"] a:hover,
    nav button:hover,
    aside button:hover {
      background: var(--us-hover) !important;
    }

    /* Top bars and floating chrome */
    header,
    [data-testid="model-switcher-dropdown-button"],
    [data-testid="accounts-profile-button"] {
      border-color: var(--us-border) !important;
    }

    header {
      background: rgba(17, 20, 24, 0.9) !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    /* Conversation text */
    [data-message-author-role="assistant"],
    [data-message-author-role="assistant"] *,
    [data-message-author-role="user"],
    [data-message-author-role="user"] * {
      text-shadow: none !important;
    }

    [data-message-author-role="assistant"] {
      color: var(--us-text) !important;
    }

    [data-message-author-role="user"] > div,
    [data-message-author-role="user"] .whitespace-pre-wrap {
      color: var(--us-text) !important;
      background: rgba(255, 255, 255, 0.055) !important;
      border: 1px solid var(--us-border) !important;
      border-radius: 16px !important;
      box-shadow: none !important;
    }

    /* Markdown */
    .markdown,
    .prose,
    [data-message-author-role="assistant"] {
      color: var(--us-text-soft) !important;
    }

    .markdown h1,
    .markdown h2,
    .markdown h3,
    .markdown h4,
    .markdown h5,
    .markdown h6,
    .prose h1,
    .prose h2,
    .prose h3,
    .prose h4,
    .prose h5,
    .prose h6 {
      color: var(--us-text) !important;
      letter-spacing: -0.015em !important;
    }

    .markdown strong,
    .markdown b,
    .prose strong,
    .prose b {
      color: var(--us-text) !important;
    }

    .markdown a,
    .prose a {
      color: #aebdca !important;
      text-decoration-color: rgba(174, 189, 202, 0.42) !important;
    }

    .markdown hr,
    .prose hr {
      border-color: var(--us-border) !important;
    }

    /* Code and data surfaces */
    pre,
    code,
    .markdown pre,
    .prose pre {
      border-color: var(--us-border) !important;
      box-shadow: none !important;
    }

    .markdown pre,
    .prose pre,
    [data-testid="code-block"] {
      color: #d7dde3 !important;
      background: #0d1115 !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-md) !important;
    }

    .markdown :not(pre) > code,
    .prose :not(pre) > code {
      color: #d7dde3 !important;
      background: rgba(255, 255, 255, 0.055) !important;
      border: 1px solid rgba(255, 255, 255, 0.07) !important;
      border-radius: 5px !important;
      padding: 0.08em 0.32em !important;
    }

    .markdown table,
    .prose table {
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-md) !important;
      background: rgba(255, 255, 255, 0.018) !important;
    }

    .markdown th,
    .prose th {
      color: var(--us-text) !important;
      background: rgba(255, 255, 255, 0.04) !important;
      border-color: var(--us-border) !important;
    }

    .markdown td,
    .prose td {
      color: var(--us-text-soft) !important;
      border-color: var(--us-border) !important;
    }

    blockquote {
      color: var(--us-text-soft) !important;
      border-color: rgba(193, 204, 215, 0.28) !important;
      background: rgba(255, 255, 255, 0.018) !important;
      border-radius: 0 var(--us-radius-sm) var(--us-radius-sm) 0 !important;
    }

    /* Composer */
    form,
    [data-testid="composer"],
    [data-testid="composer-container"],
    [data-testid="composer-footer-actions"] {
      border-color: var(--us-border) !important;
    }

    [data-testid="composer"],
    [data-testid="composer-container"],
    div:has(> textarea#prompt-textarea),
    div:has(> div > textarea#prompt-textarea) {
      background: rgba(25, 29, 35, 0.96) !important;
      background-image: none !important;
      border-color: var(--us-border-strong) !important;
      box-shadow: var(--us-shadow-md) !important;
      border-radius: 18px !important;
    }

    #prompt-textarea,
    textarea,
    [contenteditable="true"] {
      color: var(--us-text) !important;
      caret-color: var(--us-text) !important;
    }

    #prompt-textarea::placeholder,
    textarea::placeholder {
      color: var(--us-text-muted) !important;
    }

    /* Buttons: visual cleanup only, no forced global sizing. */
    button,
    [role="button"] {
      text-shadow: none !important;
      box-shadow: none !important;
    }

    button:not([disabled]):hover,
    [role="button"]:not([aria-disabled="true"]):hover {
      border-color: var(--us-border-strong) !important;
    }

    button[aria-label*="Send" i],
    button[data-testid*="send" i] {
      color: #111418 !important;
      background: #c1ccd7 !important;
      border-color: #c1ccd7 !important;
    }

    button[aria-label*="Send" i]:hover,
    button[data-testid*="send" i]:hover {
      background: #d3dbe2 !important;
    }

    /* Menus, popovers, modals */
    [role="menu"],
    [role="dialog"],
    [data-radix-popper-content-wrapper] > div,
    [data-headlessui-state] [role="menu"],
    [data-testid*="modal" i] {
      color: var(--us-text-soft) !important;
      background: rgba(25, 29, 35, 0.985) !important;
      background-image: none !important;
      border-color: var(--us-border-strong) !important;
      box-shadow: var(--us-shadow-md) !important;
    }

    [role="menuitem"] {
      border-radius: var(--us-radius-sm) !important;
    }

    [role="menuitem"]:hover,
    [role="option"]:hover,
    [data-highlighted] {
      background: var(--us-hover) !important;
    }

    /* Inputs / settings */
    input,
    select,
    textarea {
      border-color: var(--us-border) !important;
      box-shadow: none !important;
    }

    input:focus,
    select:focus,
    textarea:focus,
    [contenteditable="true"]:focus {
      outline: none !important;
      border-color: var(--us-border-focus) !important;
    }

    /* Remove strong gradients / glow without flattening functional overlays. */
    main [class*="bg-gradient"],
    main [style*="linear-gradient" i] {
      background-image: none !important;
    }

    /* Scrollbars */
    ::-webkit-scrollbar {
      width: 9px;
      height: 9px;
    }

    ::-webkit-scrollbar-track {
      background: var(--us-bg) !important;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15) !important;
      border: 2px solid var(--us-bg) !important;
      border-radius: 999px !important;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.22) !important;
    }

    ::selection {
      color: var(--us-text) !important;
      background: rgba(193, 204, 215, 0.28) !important;
    }

    @media (max-width: 768px) {
      [data-testid="composer"],
      [data-testid="composer-container"],
      div:has(> textarea#prompt-textarea),
      div:has(> div > textarea#prompt-textarea) {
        border-radius: 14px !important;
      }
    }
  `);
})();
