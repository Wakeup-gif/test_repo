// ==UserScript==
// @name         ChatGPT - US Sign Glass Theme
// @namespace    us-sign-full-modules
// @version      2.0.6
// @description  US Sign-inspired ChatGPT theme with resilient 30-minute Bing UHD rotation, optimized parallax, translucent sidebar glass, a wallpaper-only frosted reading rail, brighter menus, and a cutout geometric cursor.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      www.bing.com
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__chatgptUsSignGlassThemeV206) return;
  window.__chatgptUsSignGlassThemeV206 = true;

  GM_addStyle(String.raw`
    @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;650;700&display=swap");

    :root,
    html.dark,
    html[data-theme="dark"] {
      --us-bg: rgba(9, 15, 23, 0.18);
      --us-bg-elevated: rgba(16, 24, 34, 0.42);
      --us-bg-soft: rgba(22, 31, 42, 0.34);
      --us-glass: rgba(18, 27, 38, 0.42);
      --us-glass-strong: rgba(13, 21, 31, 0.62);
      --us-glass-soft: rgba(255, 255, 255, 0.045);
      --us-hover: rgba(100, 180, 255, 0.10);
      --us-text: #f5f8fb;
      --us-text-soft: #d2d9e1;
      --us-text-muted: #96a5b5;
      --us-accent: #8ecbff;
      --us-accent-soft: rgba(10, 132, 255, 0.18);
      --us-border: rgba(169, 211, 247, 0.12);
      --us-border-strong: rgba(181, 220, 252, 0.19);
      --us-border-focus: rgba(10, 132, 255, 0.52);
      --us-shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.18);
      --us-shadow-md: 0 16px 42px rgba(0, 0, 0, 0.26);
      --us-shadow-lg: 0 26px 70px rgba(0, 0, 0, 0.34);
      --us-radius-sm: 8px;
      --us-radius-md: 12px;
      --us-radius-lg: 18px;
      --us-font: "Manrope", "Avenir Next", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      --us-wallpaper: url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1");
      --us-wallpaper-x: 50%;
      --us-wallpaper-y: 50%;
      --us-wallpaper-size: 106vw auto;
      --us-wallpaper-shift-x: 0px;
      --us-wallpaper-shift-y: 0px;
      --main-surface-primary: rgba(8, 14, 22, 0.12) !important;
      --main-surface-secondary: rgba(15, 23, 33, 0.30) !important;
      --main-surface-tertiary: rgba(21, 31, 43, 0.34) !important;
      --sidebar-surface-primary: rgba(29, 45, 61, 0.18) !important;
      --sidebar-surface-secondary: rgba(34, 52, 69, 0.14) !important;
      --sidebar-surface-tertiary: rgba(42, 60, 78, 0.12) !important;
      --composer-surface: rgba(12, 20, 30, 0.46) !important;
      --composer-blue-bg: rgba(80, 165, 238, 0.12) !important;
      --message-surface: rgba(255, 255, 255, 0.035) !important;
      --text-primary: var(--us-text) !important;
      --text-secondary: var(--us-text-soft) !important;
      --text-tertiary: var(--us-text-muted) !important;
      --border-light: var(--us-border) !important;
      --border-medium: var(--us-border-strong) !important;
      --interactive-bg-secondary-default: rgba(255, 255, 255, 0.035) !important;
      --interactive-bg-secondary-hover: rgba(100, 180, 255, 0.085) !important;
    }

    html {
      min-height: 100% !important;
      color-scheme: dark !important;
      background: #081019 !important;
      isolation: isolate !important;
    }

    /* v2.0.1: one fixed, compositor-friendly wallpaper layer.
       Parallax moves this layer with transform instead of repainting the
       root background-position on every pointer frame / scroll. */
    html::before {
      content: "" !important;
      position: fixed !important;
      inset: -4vh -4vw !important;
      z-index: 0 !important;
      pointer-events: none !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.15), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.07), transparent 34%),
        linear-gradient(rgba(4, 8, 13, 0.24), rgba(6, 11, 17, 0.48)),
        var(--us-wallpaper) !important;
      background-position: center !important;
      background-size: auto, auto, auto, cover !important;
      background-repeat: no-repeat !important;
      transform: translate3d(var(--us-wallpaper-shift-x), var(--us-wallpaper-shift-y), 0) scale(1.06) !important;
      transform-origin: center center !important;
      will-change: transform !important;
      backface-visibility: hidden !important;
    }

    body,
    #__next,
    #root {
      position: relative !important;
      z-index: 1 !important;
      min-height: 100% !important;
      color: var(--us-text) !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      font-family: var(--us-font) !important;
    }

    body {
      scrollbar-color: rgba(210, 231, 248, 0.18) transparent !important;
    }

    body,
    input,
    textarea,
    select,
    button {
      font-family: var(--us-font) !important;
    }

    main,
    [role="main"],
    [data-testid="conversation-turn-list"] > div,
    [class*="bg-token-main-surface-primary"],
    [class*="bg-token-main-surface-secondary"] {
      background-color: transparent !important;
      background-image: none !important;
    }

    /* v2.0.3: ChatGPT changes the conversation list wrapper frequently.
       Do not depend on it for the visual frost; the dedicated fixed reading
       rail below owns the one center backdrop-filter layer. */
    [data-testid="conversation-turn-list"] {
      position: relative !important;
      background: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    /* v2.0.5: body-owned glass rail. It sits above only the Bing wallpaper
       and below every top-level ChatGPT app layer, so it cannot blur chat text. */
    body::before {
      content: "" !important;
      position: fixed !important;
      top: 48px !important;
      bottom: 0 !important;
      left: calc(var(--us-chat-sidebar-edge, 0px) + ((100vw - var(--us-chat-sidebar-edge, 0px)) / 2)) !important;
      width: min(860px, calc(100vw - var(--us-chat-sidebar-edge, 0px) - 52px)) !important;
      transform: translateX(-50%) !important;
      pointer-events: none !important;
      z-index: 0 !important;
      background: rgba(15, 29, 43, 0.20) !important;
      background-image: linear-gradient(180deg, rgba(183, 220, 249, 0.034), rgba(255,255,255,0.008)) !important;
      border-left: 1px solid rgba(195, 225, 249, 0.070) !important;
      border-right: 1px solid rgba(195, 225, 249, 0.070) !important;
      box-shadow: 0 0 54px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.024) !important;
      -webkit-backdrop-filter: blur(22px) saturate(122%) !important;
      backdrop-filter: blur(22px) saturate(122%) !important;
    }

    body > :not(script):not(style):not(link) {
      position: relative !important;
      z-index: 2 !important;
    }

    nav,
    aside,
    [data-testid="left-sidebar"],
    [data-testid="sidebar"],
    [data-testid="navigation-sidebar"] {
      color: var(--us-text-soft) !important;
      background: rgba(25, 40, 55, 0.20) !important;
      background-image: linear-gradient(180deg, rgba(175, 216, 247, 0.028), rgba(255,255,255,0.006)) !important;
      border-color: rgba(182, 219, 247, 0.11) !important;
      box-shadow: 10px 0 32px rgba(0, 0, 0, 0.11), inset -1px 0 0 rgba(255,255,255,0.022) !important;
      -webkit-backdrop-filter: blur(18px) saturate(124%) !important;
      backdrop-filter: blur(18px) saturate(124%) !important;
    }

    nav [class*="bg-token-sidebar-surface"],
    aside [class*="bg-token-sidebar-surface"],
    [data-testid="left-sidebar"] [class*="bg-token-sidebar-surface"],
    [data-testid="sidebar"] [class*="bg-token-sidebar-surface"],
    [data-testid="navigation-sidebar"] [class*="bg-token-sidebar-surface"] {
      background-color: rgba(34, 52, 70, 0.075) !important;
      background-image: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
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

    header {
      color: var(--us-text) !important;
      background: rgba(9, 16, 25, 0.30) !important;
      background-image: none !important;
      border-color: var(--us-border) !important;
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.035) !important;
      -webkit-backdrop-filter: blur(16px) saturate(128%) !important;
      backdrop-filter: blur(16px) saturate(128%) !important;
    }

    [data-testid="model-switcher-dropdown-button"],
    [data-testid="accounts-profile-button"] {
      border-color: var(--us-border) !important;
    }

    [data-message-author-role="assistant"],
    [data-message-author-role="assistant"] *,
    [data-message-author-role="user"],
    [data-message-author-role="user"] * {
      text-shadow: none !important;
    }

    [data-message-author-role="assistant"] {
      color: var(--us-text-soft) !important;
    }

    [data-message-author-role="user"] > div,
    [data-message-author-role="user"] .whitespace-pre-wrap,
    [data-message-author-role="user"] [class*="bg-token-message-surface"] {
      color: var(--us-text) !important;
      background: rgba(11, 21, 32, 0.30) !important;
      border: 1px solid var(--us-border) !important;
      border-radius: 18px !important;
      box-shadow: var(--us-shadow-sm) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

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
      letter-spacing: -0.018em !important;
    }

    .markdown strong,
    .markdown b,
    .prose strong,
    .prose b {
      color: var(--us-text) !important;
    }

    .markdown a,
    .prose a {
      color: var(--us-accent) !important;
      text-decoration-color: rgba(142, 203, 255, 0.42) !important;
    }

    .markdown hr,
    .prose hr {
      border-color: var(--us-border) !important;
    }

    blockquote {
      color: var(--us-text-soft) !important;
      border-color: rgba(142, 203, 255, 0.26) !important;
      background: rgba(12, 22, 33, 0.20) !important;
      border-radius: 0 var(--us-radius-sm) var(--us-radius-sm) 0 !important;
    }

    .markdown pre,
    .prose pre,
    [data-testid="code-block"] {
      color: #e0e8ef !important;
      background: rgba(5, 11, 18, 0.72) !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-md) !important;
      box-shadow: var(--us-shadow-sm) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    .markdown :not(pre) > code,
    .prose :not(pre) > code {
      color: #e4edf5 !important;
      background: rgba(255, 255, 255, 0.06) !important;
      border: 1px solid rgba(190, 225, 255, 0.08) !important;
      border-radius: 5px !important;
      padding: 0.08em 0.32em !important;
    }

    .markdown table,
    .prose table {
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-md) !important;
      background: rgba(9, 18, 28, 0.24) !important;
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

    form,
    [data-testid="composer"],
    [data-testid="composer-container"],
    [data-testid="composer-footer-actions"] {
      border-color: var(--us-border) !important;
    }

    [data-testid="composer"],
    [data-testid="composer-container"],
    div:has(> textarea#prompt-textarea),
    div:has(> div > textarea#prompt-textarea),
    div:has(> #prompt-textarea) {
      color: var(--us-text) !important;
      background: rgba(10, 18, 28, 0.40) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012)) !important;
      border-color: var(--us-border-strong) !important;
      box-shadow: 0 18px 46px rgba(0,0,0,0.27), inset 0 1px 0 rgba(255,255,255,0.035) !important;
      border-radius: 22px !important;
      -webkit-backdrop-filter: blur(24px) saturate(138%) !important;
      backdrop-filter: blur(24px) saturate(138%) !important;
    }

    #prompt-textarea,
    textarea,
    [contenteditable="true"] {
      color: var(--us-text) !important;
      caret-color: var(--us-accent) !important;
      background: transparent !important;
    }

    #prompt-textarea::placeholder,
    textarea::placeholder {
      color: var(--us-text-muted) !important;
    }

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
      color: #07111b !important;
      background: linear-gradient(180deg, #d9efff, #9fcdf2) !important;
      border-color: rgba(213, 238, 255, 0.82) !important;
    }

    button[aria-label*="Send" i]:hover,
    button[data-testid*="send" i]:hover {
      background: linear-gradient(180deg, #edf8ff, #b7dcf7) !important;
    }

    [role="menu"],
    [role="dialog"],
    [data-radix-popper-content-wrapper] > div,
    [data-headlessui-state] [role="menu"],
    [data-testid*="modal" i] {
      color: var(--us-text-soft) !important;
      background: rgba(28, 43, 58, 0.54) !important;
      background-image: linear-gradient(180deg, rgba(167, 216, 255, 0.055), rgba(255,255,255,0.012)) !important;
      border: 1px solid rgba(191, 225, 252, 0.18) !important;
      box-shadow: 0 18px 48px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.045) !important;
      -webkit-backdrop-filter: blur(18px) saturate(128%) !important;
      backdrop-filter: blur(18px) saturate(128%) !important;
    }

    [data-radix-popper-content-wrapper] [role="listbox"],
    [data-radix-popper-content-wrapper] [data-radix-menu-content],
    [data-radix-popper-content-wrapper] [data-radix-select-content],
    [role="listbox"] {
      color: var(--us-text-soft) !important;
      background: rgba(28, 43, 58, 0.54) !important;
      border: 1px solid rgba(191, 225, 252, 0.18) !important;
      box-shadow: 0 18px 48px rgba(0,0,0,0.28) !important;
      -webkit-backdrop-filter: blur(18px) saturate(128%) !important;
      backdrop-filter: blur(18px) saturate(128%) !important;
    }

    [role="menuitem"] {
      border-radius: var(--us-radius-sm) !important;
    }

    [role="menuitem"]:hover,
    [role="option"]:hover,
    [data-highlighted] {
      background: var(--us-hover) !important;
    }

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

    html,
    body {
      cursor: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2222%22%20height%3D%2222%22%20viewBox%3D%220%200%2022%2022%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%224%22%20y1%3D%223%22%20x2%3D%2217%22%20y2%3D%2218%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23FFFFFF%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23DCEFFF%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M3%202.6L20%2010.7L7.7%2020Z%22%20fill%3D%22%236FA8D0%22%20opacity%3D%22.14%22%20transform%3D%22translate%28.55%20.7%29%22%2F%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M3%202.6L20%2010.7L7.7%2020ZM8.05%207.65L14.5%2010.72L9.75%2014.65Z%22%20fill%3D%22url%28%23g%29%22%2F%3E%3C%2Fsvg%3E") 3 3, default !important;
    }

    a,
    button,
    [role="button"],
    [role="menuitem"],
    [role="option"],
    summary,
    label[for] {
      cursor: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2227%22%20height%3D%2227%22%20viewBox%3D%220%200%2027%2027%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%225%22%20y1%3D%224%22%20x2%3D%2221%22%20y2%3D%2222%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23FFFFFF%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23D6ECFF%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M3.6%203L24.2%2012.9L9.3%2024Z%22%20fill%3D%22%236FA8D0%22%20opacity%3D%22.17%22%20transform%3D%22translate%28.7%20.85%29%22%2F%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M3.6%203L24.2%2012.9L9.3%2024ZM9.7%209.1L17.4%2012.85L11.65%2017.6Z%22%20fill%3D%22url%28%23g%29%22%2F%3E%3C%2Fsvg%3E") 4 3, pointer !important;
    }

    input,
    textarea,
    [contenteditable="true"],
    .markdown,
    .prose {
      cursor: text !important;
    }

    button:disabled,
    [aria-disabled="true"] {
      cursor: not-allowed !important;
    }

    ::-webkit-scrollbar {
      width: 9px;
      height: 9px;
    }

    ::-webkit-scrollbar-track {
      background: transparent !important;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(205, 229, 247, 0.16) !important;
      border: 2px solid transparent !important;
      background-clip: padding-box !important;
      border-radius: 999px !important;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(205, 229, 247, 0.26) !important;
      background-clip: padding-box !important;
    }

    ::selection {
      color: var(--us-text) !important;
      background: rgba(142, 203, 255, 0.28) !important;
    }

    @media (max-width: 768px) {
      [data-testid="composer"],
      [data-testid="composer-container"],
      div:has(> textarea#prompt-textarea),
      div:has(> div > textarea#prompt-textarea) {
        border-radius: 16px !important;
      }
    }

    @media (pointer: coarse), (prefers-reduced-motion: reduce) {
      :root {
        --us-wallpaper-x: 50%;
        --us-wallpaper-y: 50%;
      }
    }
  `);

  const ROTATE_MS = 30 * 60 * 1000;
  const CACHE_MS = 6 * 60 * 60 * 1000;
  const CACHE_KEY = "chatgpt-us-sign-bing-wallpaper-pool-v3";
  const MIN_ROTATION_POOL = 2;
  const MARKETS = ["en-US", "en-GB", "en-AU", "ja-JP"];
  let wallpaperPool = [];
  let rotateTimer = 0;
  let refreshInFlight = false;
  let lastAppliedSlot = -1;
  let lastWallpaperKey = "";

  function hashString(value) {
    const text = String(value || "");
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || !Array.isArray(parsed.images)) return null;
      const unique = new Map();
      parsed.images.forEach((image) => {
        if (image?.url && image?.key && !unique.has(image.key)) unique.set(image.key, image);
      });
      const images = Array.from(unique.values());
      if (images.length < MIN_ROTATION_POOL) return null;
      return { ...parsed, images };
    } catch (_) {
      return null;
    }
  }

  function writeCache(images) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), images }));
    } catch (_) {}
  }

  function normalizeImage(image, market) {
    if (!image || typeof image.url !== "string") return null;
    try {
      const url = new URL(image.url, "https://www.bing.com/");
      if (url.protocol !== "https:") return null;
      return {
        url: url.href,
        key: String(image.urlbase || url.pathname),
        title: String(image.title || image.copyright || "Bing wallpaper"),
        startdate: String(image.startdate || ""),
        market: String(market || "")
      };
    } catch (_) {
      return null;
    }
  }

  function applyWallpaper(images = wallpaperPool) {
    if (!Array.isArray(images) || images.length < MIN_ROTATION_POOL || !document.documentElement) return;
    const slot = Math.floor(Date.now() / ROTATE_MS);
    let index = slot % images.length;
    let image = images[index];
    if (!image?.url) return;

    // If Bing ever returns duplicate-looking entries under different metadata,
    // guarantee that a new half-hour slot still advances visually.
    if (slot !== lastAppliedSlot && images.length > 1 && image.key === lastWallpaperKey) {
      index = (index + 1) % images.length;
      image = images[index];
    }

    document.documentElement.style.setProperty("--us-wallpaper", `url("${image.url.replace(/"/g, "%22")}")`);
    document.documentElement.dataset.usBingWallpaper = image.title || "Bing wallpaper";
    document.documentElement.dataset.usBingMarket = image.market || "";
    document.documentElement.dataset.usBingPoolSize = String(images.length);
    document.documentElement.dataset.usBingSlot = String(slot);
    lastAppliedSlot = slot;
    lastWallpaperKey = image.key || image.url;
  }

  function requestMarket(market) {
    return new Promise((resolve) => {
      if (typeof GM_xmlhttpRequest !== "function") {
        resolve([]);
        return;
      }

      const endpoint = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=${encodeURIComponent(market)}&uhd=1&uhdwidth=3840&uhdheight=2160`;
      GM_xmlhttpRequest({
        method: "GET",
        url: endpoint,
        timeout: 9000,
        headers: { Accept: "application/json,text/plain,*/*" },
        onload(response) {
          if (response.status < 200 || response.status >= 300) {
            resolve([]);
            return;
          }
          try {
            const payload = JSON.parse(response.responseText || "{}");
            const images = Array.isArray(payload.images) ? payload.images : [];
            resolve(images.map((image) => normalizeImage(image, market)).filter(Boolean));
          } catch (_) {
            resolve([]);
          }
        },
        onerror() { resolve([]); },
        ontimeout() { resolve([]); }
      });
    });
  }

  async function refreshPool(force = false) {
    if (refreshInFlight) return;

    const cached = readCache();
    if (cached?.images?.length) {
      wallpaperPool = cached.images;
      applyWallpaper();
      const age = Date.now() - Number(cached.fetchedAt || 0);
      if (!force && age >= 0 && age < CACHE_MS) return;
    }

    refreshInFlight = true;
    try {
      const batches = await Promise.all(MARKETS.map(requestMarket));
      const unique = new Map();
      batches.flat().forEach((image) => {
        if (image?.url && !unique.has(image.key)) unique.set(image.key, image);
      });

      const images = Array.from(unique.values())
        .sort((a, b) => hashString(a.key) - hashString(b.key));

      if (images.length >= MIN_ROTATION_POOL) {
        wallpaperPool = images;
        writeCache(images);
        applyWallpaper();
      }
    } finally {
      refreshInFlight = false;
    }
  }

  function scheduleRotation() {
    if (rotateTimer) window.clearTimeout(rotateTimer);
    const now = Date.now();
    const untilNext = ROTATE_MS - (now % ROTATE_MS) + 500;
    rotateTimer = window.setTimeout(() => {
      applyWallpaper();
      refreshPool(false);
      scheduleRotation();
    }, untilNext);
  }

  function syncWallpaperRotation() {
    applyWallpaper();
    refreshPool(false);
    scheduleRotation();
  }

  function initWallpapers() {
    const cached = readCache();
    if (cached?.images?.length >= MIN_ROTATION_POOL) {
      wallpaperPool = cached.images;
      applyWallpaper();
    }
    refreshPool(false);
    scheduleRotation();

    // Browsers aggressively throttle background tabs. Re-sync immediately
    // whenever ChatGPT becomes active so a missed half-hour boundary cannot
    // leave the wallpaper stuck on an old slot.
    window.addEventListener("pageshow", syncWallpaperRotation, { passive: true });
    window.addEventListener("focus", syncWallpaperRotation, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) syncWallpaperRotation();
    }, { passive: true });
  }

  initWallpapers();

  /* v2.0.4 center rail geometry only. The visual frost is owned by
     main::before so it always stays behind ChatGPT's conversation content. */
  function initCenterGlassRailGeometry() {
    const updateSidebarEdge = () => {
      const candidates = Array.from(document.querySelectorAll(
        'aside, [data-testid="left-sidebar"], [data-testid="sidebar"], [data-testid="navigation-sidebar"], nav'
      ));
      const sidebar = candidates
        .map((node) => ({ node, rect: node.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width >= 170 && rect.width <= 420 && rect.height >= window.innerHeight * 0.55 && rect.left <= 8)
        .sort((a, b) => b.rect.height - a.rect.height)[0];
      const edge = sidebar ? Math.max(0, Math.round(sidebar.rect.right)) : 0;
      document.documentElement.style.setProperty("--us-chat-sidebar-edge", `${edge}px`);
      return sidebar?.node || null;
    };

    const sidebarNode = updateSidebarEdge();
    window.addEventListener("resize", updateSidebarEdge, { passive: true });
    if (sidebarNode && typeof ResizeObserver === "function") {
      const ro = new ResizeObserver(updateSidebarEdge);
      ro.observe(sidebarNode);
    }
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initCenterGlassRailGeometry, { once: true });
  } else {
    initCenterGlassRailGeometry();
  }

  const PARALLAX_X = 5;
  const PARALLAX_Y = 3.5;
  const PARALLAX_EASE = 0.14;
  let targetX = 50;
  let targetY = 50;
  let currentX = 50;
  let currentY = 50;
  let parallaxRaf = 0;

  function updateOverscan() {
    document.documentElement.style.setProperty("--us-wallpaper-size", "cover");
  }

  function renderParallax() {
    parallaxRaf = 0;
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    currentX += dx * PARALLAX_EASE;
    currentY += dy * PARALLAX_EASE;
    const shiftX = (currentX - 50) * 3.2;
    const shiftY = (currentY - 50) * 3.2;
    document.documentElement.style.setProperty("--us-wallpaper-shift-x", `${shiftX.toFixed(2)}px`);
    document.documentElement.style.setProperty("--us-wallpaper-shift-y", `${shiftY.toFixed(2)}px`);
    if (Math.abs(dx) > 0.025 || Math.abs(dy) > 0.025) {
      parallaxRaf = window.requestAnimationFrame(renderParallax);
    }
  }

  function requestParallaxFrame() {
    if (!parallaxRaf) parallaxRaf = window.requestAnimationFrame(renderParallax);
  }

  function centerParallax() {
    targetX = 50;
    targetY = 50;
    requestParallaxFrame();
  }

  function initParallax() {
    const motionQuery = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    updateOverscan();
    window.addEventListener("resize", updateOverscan, { passive: true });
    if (!motionQuery.matches) return;

    window.addEventListener("pointermove", (event) => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const nx = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      targetX = 50 + (nx * PARALLAX_X);
      targetY = 50 + (ny * PARALLAX_Y);
      requestParallaxFrame();
    }, { passive: true });

    document.addEventListener("mouseleave", centerParallax, { passive: true });
    window.addEventListener("blur", centerParallax, { passive: true });
  }

  initParallax();
})();
