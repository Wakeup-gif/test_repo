// ==UserScript==
// @name         ChatGPT - US Sign Dark Glass Theme
// @namespace    us-sign-full-modules
// @version      2.1.3
// @description  Modern graphite glass for ChatGPT with bounded live blur on compact UI panels, cached reading frost, restrained semantic color, Bing UHD rotation, native layout, and optimized cursor coverage.
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

  if (window.__chatgptUsSignDarkGlassThemeV213) return;
  window.__chatgptUsSignDarkGlassThemeV213 = true;

  const root = document.documentElement;
  root?.classList.add("us-sign-theme-dark-glass");
  if (root) root.dataset.usSignTheme = "dark-glass";

  const DEFAULT_CURSOR = 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2226%22%20height%3D%2226%22%20viewBox%3D%220%200%2022%2022%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%224%22%20y1%3D%223%22%20x2%3D%2217%22%20y2%3D%2218%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23FFFFFF%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23DCEFFF%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M3%202.6L20%2010.7L7.7%2020Z%22%20fill%3D%22%236FA8D0%22%20opacity%3D%22.14%22%20transform%3D%22translate%28.55%20.7%29%22%2F%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M3%202.6L20%2010.7L7.7%2020ZM8.05%207.65L14.5%2010.72L9.75%2014.65Z%22%20fill%3D%22url%28%23g%29%22%2F%3E%3C%2Fsvg%3E") 4 4, default';
  const POINTER_CURSOR = 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2027%2027%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%225%22%20y1%3D%224%22%20x2%3D%2221%22%20y2%3D%2222%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23FFFFFF%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23D6ECFF%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M3.6%203L24.2%2012.9L9.3%2024Z%22%20fill%3D%22%236FA8D0%22%20opacity%3D%22.17%22%20transform%3D%22translate%28.7%20.85%29%22%2F%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M3.6%203L24.2%2012.9L9.3%2024ZM9.7%209.1L17.4%2012.85L11.65%2017.6Z%22%20fill%3D%22url%28%23g%29%22%2F%3E%3C%2Fsvg%3E") 5 4, pointer';

  GM_addStyle(String.raw`
    @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;650;700&display=swap");

    :root,
    html.dark,
    html[data-theme="dark"] {
      --us-bg: rgba(8, 8, 10, 0.30);
      --us-bg-elevated: rgba(15, 15, 18, 0.68);
      --us-bg-soft: rgba(20, 20, 23, 0.52);
      --us-glass: rgba(10, 10, 13, 0.48);
      --us-glass-strong: rgba(8, 8, 10, 0.72);
      --us-glass-soft: rgba(255, 255, 255, 0.030);
      --us-hover: rgba(255, 255, 255, 0.060);
      --us-active: rgba(255, 255, 255, 0.085);
      --us-text: #f2f4f6;
      --us-text-soft: #d5d5d8;
      --us-text-muted: #92959b;
      --us-accent: #8ecbff;
      --us-accent-soft: rgba(10, 132, 255, 0.15);
      --us-border: rgba(255, 255, 255, 0.070);
      --us-border-strong: rgba(255, 255, 255, 0.100);
      --us-border-focus: rgba(142, 203, 255, 0.48);
      --us-shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.20);
      --us-shadow-md: 0 16px 42px rgba(0, 0, 0, 0.24);
      --us-radius-sm: 7px;
      --us-radius-md: 10px;
      --us-radius-lg: 14px;
      --us-frost: blur(18px) saturate(112%) brightness(92%);
      --us-frost-soft: blur(14px) saturate(108%) brightness(94%);
      --us-font: "Manrope", "Avenir Next", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      --us-wallpaper: url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1");

      /* Let native controls inherit the palette without turning the whole app
         into one opaque sheet. */
      --main-surface-primary: rgba(10, 10, 12, 0.24) !important;
      --main-surface-secondary: rgba(15, 15, 18, 0.34) !important;
      --main-surface-tertiary: rgba(20, 20, 23, 0.44) !important;
      --sidebar-surface-primary: rgba(12, 12, 15, 0.14) !important;
      --sidebar-surface-secondary: rgba(18, 18, 21, 0.18) !important;
      --sidebar-surface-tertiary: rgba(24, 24, 27, 0.15) !important;
      --composer-surface: rgba(10, 10, 13, 0.64) !important;
      --composer-surface-primary: rgba(10, 10, 13, 0.64) !important;
      --composer-blue-bg: rgba(10, 132, 255, 0.12) !important;
      --message-surface: rgba(15, 15, 18, 0.24) !important;
      --text-primary: var(--us-text) !important;
      --text-secondary: var(--us-text-soft) !important;
      --text-tertiary: var(--us-text-muted) !important;
      --border-light: var(--us-border) !important;
      --border-medium: var(--us-border-strong) !important;
      --interactive-bg-secondary-default: rgba(255, 255, 255, 0.025) !important;
      --interactive-bg-secondary-hover: rgba(255, 255, 255, 0.060) !important;
    }

    html {
      min-height: 100% !important;
      color-scheme: dark !important;
      background: #09090b !important;
    }

    /* One wallpaper plane. No pointer-driven animation and no second copy
       painted onto the sidebar. */
    html::before {
      content: "" !important;
      position: fixed !important;
      inset: -4vh -4vw !important;
      z-index: 0 !important;
      pointer-events: none !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(255, 255, 255, 0.030), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(255, 255, 255, 0.014), transparent 34%),
        linear-gradient(rgba(0, 0, 0, 0.20), rgba(0, 0, 0, 0.42)),
        var(--us-wallpaper) !important;
      background-position: center !important;
      background-size: auto, auto, auto, cover !important;
      background-repeat: no-repeat !important;
      transform: scale(1.06) !important;
      transform-origin: center center !important;
      transition: none !important;
      backface-visibility: hidden !important;
    }

    body,
    #__next,
    #root {
      min-height: 100% !important;
      color: var(--us-text) !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      font-family: var(--us-font) !important;
    }

    body {
      scrollbar-color: rgba(210, 231, 248, 0.20) transparent !important;
    }

    body,
    input,
    textarea,
    select,
    button {
      font-family: var(--us-font) !important;
    }

    /* Only the true canvas is transparent. Native small surfaces remain useful
       for hierarchy and accessibility. */
    #main,
    #thread,
    [class~="group/scroll-root"] {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    #thread {
      position: relative !important;
      isolation: isolate !important;
    }

    /* PERFORMANCE: this is a viewport-bounded duplicate of the wallpaper,
       blurred as an image. It is not a live backdrop-filter over the very tall
       conversation DOM. */
    #thread::before {
      content: "" !important;
      display: block !important;
      position: sticky !important;
      top: -28px !important;
      align-self: center !important;
      flex: 0 0 auto !important;
      box-sizing: border-box !important;
      width: min(1040px, calc(100% - 24px)) !important;
      height: calc(100dvh + 56px) !important;
      margin-bottom: calc(-100dvh - 56px) !important;
      pointer-events: none !important;
      z-index: -1 !important;
      background-image:
        linear-gradient(180deg, rgba(8, 8, 10, 0.44), rgba(5, 5, 7, 0.58)),
        var(--us-wallpaper) !important;
      background-position: center, center !important;
      background-size: auto, cover !important;
      background-repeat: no-repeat !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      -webkit-filter: blur(14px) saturate(108%) brightness(90%) !important;
      filter: blur(14px) saturate(108%) brightness(90%) !important;
      transform: translateZ(0) scale(1.028) !important;
      backface-visibility: hidden !important;
      contain: paint !important;
      -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 3%, rgba(0,0,0,0.62) 9%, #000 17%, #000 83%, rgba(0,0,0,0.62) 91%, rgba(0,0,0,0.18) 97%, transparent 100%) !important;
      mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 3%, rgba(0,0,0,0.62) 9%, #000 17%, #000 83%, rgba(0,0,0,0.62) 91%, rgba(0,0,0,0.18) 97%, transparent 100%) !important;
    }

    #thread-bottom-container::after {
      background: linear-gradient(180deg, rgba(8, 8, 10, 0) 0%, rgba(8, 8, 10, 0.12) 48%, rgba(8, 8, 10, 0.32) 100%) !important;
      opacity: 1 !important;
    }

    /* One live blur for the whole navigation rail. Children stay transparent,
       so we do not stack Gaussian filters. */
    #stage-slideover-sidebar {
      color: var(--us-text-soft) !important;
      background: rgba(10, 10, 13, 0.46) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.040), rgba(255,255,255,0.006)) !important;
      border-inline-end: 1px solid rgba(255,255,255,0.075) !important;
      box-shadow: 12px 0 36px rgba(0,0,0,0.16), inset -1px 0 0 rgba(255,255,255,0.030) !important;
      -webkit-backdrop-filter: var(--us-frost) !important;
      backdrop-filter: var(--us-frost) !important;
    }

    #stage-slideover-sidebar nav,
    #stage-sidebar-tiny-bar,
    #stage-slideover-sidebar [class*="bg-token-sidebar-surface-primary"] {
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    #stage-slideover-sidebar a,
    #stage-slideover-sidebar .__menu-item {
      border-radius: var(--us-radius-sm) !important;
    }

    #stage-slideover-sidebar a:hover,
    #stage-slideover-sidebar button:hover,
    #stage-slideover-sidebar .__menu-item:hover {
      background: var(--us-hover) !important;
    }

    #stage-slideover-sidebar [aria-current="page"] {
      background: var(--us-active) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.035) !important;
    }

    /* Keep the native header geometry. Only the compact action group is glass. */
    #page-header {
      color: var(--us-text) !important;
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    #conversation-header-actions {
      background: rgba(10, 10, 13, 0.56) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.036), rgba(255,255,255,0.004)) !important;
      border: 1px solid rgba(255,255,255,0.085) !important;
      box-shadow: 0 10px 28px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.040) !important;
      -webkit-backdrop-filter: var(--us-frost-soft) !important;
      backdrop-filter: var(--us-frost-soft) !important;
    }

    #conversation-header-actions button:hover {
      background: var(--us-hover) !important;
    }

    [data-message-author-role="assistant"],
    .markdown,
    .prose {
      color: var(--us-text-soft) !important;
    }

    [data-message-author-role="user"] {
      color: var(--us-text) !important;
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
    .prose h6,
    .markdown strong,
    .markdown b,
    .prose strong,
    .prose b {
      color: var(--us-text) !important;
    }

    .markdown h1,
    .markdown h2,
    .markdown h3,
    .prose h1,
    .prose h2,
    .prose h3 {
      letter-spacing: -0.018em !important;
    }

    .markdown a,
    .prose a {
      color: var(--us-accent) !important;
      text-decoration-color: rgba(155, 211, 255, 0.50) !important;
      text-underline-offset: 2px !important;
    }

    .markdown hr,
    .prose hr {
      border-color: var(--us-border) !important;
    }

    blockquote {
      color: var(--us-text-soft) !important;
      border-color: rgba(142, 203, 255, 0.22) !important;
      background: rgba(12, 12, 15, 0.40) !important;
      border-radius: 0 var(--us-radius-sm) var(--us-radius-sm) 0 !important;
    }

    .markdown pre,
    .prose pre,
    [data-testid="code-block"] {
      color: #e8eff5 !important;
      background: rgba(5, 5, 7, 0.72) !important;
      border: 1px solid rgba(255,255,255,0.080) !important;
      border-radius: var(--us-radius-md) !important;
      box-shadow: var(--us-shadow-sm) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    .markdown :not(pre) > code,
    .prose :not(pre) > code {
      color: #edf4fa !important;
      background: rgba(255, 255, 255, 0.09) !important;
      border: 1px solid rgba(190, 225, 255, 0.10) !important;
      border-radius: 5px !important;
      padding: 0.08em 0.32em !important;
    }

    .markdown table,
    .prose table {
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-md) !important;
      background: rgba(10, 10, 12, 0.46) !important;
    }

    .markdown th,
    .prose th {
      color: var(--us-text) !important;
      background: rgba(255, 255, 255, 0.055) !important;
      border-color: var(--us-border) !important;
    }

    .markdown td,
    .prose td {
      color: var(--us-text-soft) !important;
      border-color: var(--us-border) !important;
    }

    /* The composer is small and viewport-bound, so this is an appropriate place
       to spend a real blur. Do not blur its nested editor. */
    form[class*="group/composer"] [class*="bg-(--composer-surface-primary)"] {
      color: var(--us-text) !important;
      background: rgba(9, 9, 12, 0.58) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.006)) !important;
      border: 1px solid rgba(255,255,255,0.100) !important;
      box-shadow: 0 16px 42px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.050) !important;
      -webkit-backdrop-filter: var(--us-frost) !important;
      backdrop-filter: var(--us-frost) !important;
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

    button[aria-label*="Send" i],
    button[data-testid*="send" i] {
      color: #07111b !important;
      background: linear-gradient(180deg, #e1f3ff, #a7d5f6) !important;
      border-color: rgba(218, 240, 255, 0.86) !important;
    }

    button[aria-label*="Send" i]:hover,
    button[data-testid*="send" i]:hover {
      background: linear-gradient(180deg, #f0f9ff, #bce0f8) !important;
    }

    /* Transient panels can afford richer frost because they are bounded and
       short-lived. */
    [role="menu"],
    [data-radix-popper-content-wrapper] > div,
    [data-headlessui-state] [role="menu"],
    [data-radix-popper-content-wrapper] [role="listbox"],
    [data-radix-popper-content-wrapper] [data-radix-menu-content],
    [data-radix-popper-content-wrapper] [data-radix-select-content],
    [role="listbox"] {
      color: var(--us-text-soft) !important;
      background: rgba(11, 11, 14, 0.70) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.006)) !important;
      border: 1px solid rgba(255,255,255,0.100) !important;
      box-shadow: 0 20px 48px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.050) !important;
      -webkit-backdrop-filter: var(--us-frost) !important;
      backdrop-filter: var(--us-frost) !important;
    }

    [role="dialog"],
    [data-testid*="modal" i] {
      color: var(--us-text-soft) !important;
      background: rgba(10, 10, 13, 0.76) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.040), rgba(255,255,255,0.004)) !important;
      border: 1px solid rgba(255,255,255,0.100) !important;
      box-shadow: 0 26px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.045) !important;
      -webkit-backdrop-filter: blur(22px) saturate(112%) brightness(90%) !important;
      backdrop-filter: blur(22px) saturate(112%) brightness(90%) !important;
    }

    [role="menuitem"] {
      border-radius: var(--us-radius-sm) !important;
    }

    [role="menuitem"]:hover,
    [role="option"]:hover,
    [data-highlighted] {
      background: var(--us-hover) !important;
    }

    /* One cursor system only. The old pre-v2.1.2 duplicate block is gone. */
    @media (pointer: fine) {
      html,
      body,
      body * {
        cursor: ${DEFAULT_CURSOR} !important;
      }

      input,
      textarea,
      [contenteditable="true"],
      [contenteditable="true"] *,
      [role="textbox"],
      [role="textbox"] *,
      .markdown,
      .markdown *,
      .prose,
      .prose * {
        cursor: text !important;
      }

      a,
      a *,
      button,
      button *,
      [role="button"],
      [role="button"] *,
      [role="menuitem"],
      [role="menuitem"] *,
      [role="option"],
      [role="option"] *,
      summary,
      summary *,
      label[for],
      label[for] * {
        cursor: ${POINTER_CURSOR} !important;
      }

      button:disabled,
      button:disabled *,
      [aria-disabled="true"],
      [aria-disabled="true"] * {
        cursor: not-allowed !important;
      }

      [draggable="true"] {
        cursor: grab !important;
      }

      [aria-grabbed="true"] {
        cursor: grabbing !important;
      }

      [data-resize-handle],
      [class*="resize-handle" i],
      [style*="cursor: col-resize" i],
      [style*="cursor: row-resize" i] {
        cursor: revert !important;
      }
    }

    ::-webkit-scrollbar {
      width: 9px;
      height: 9px;
    }

    ::-webkit-scrollbar-track {
      background: transparent !important;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.16) !important;
      border: 2px solid transparent !important;
      background-clip: padding-box !important;
      border-radius: 999px !important;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.26) !important;
      background-clip: padding-box !important;
    }

    ::selection {
      color: var(--us-text) !important;
      background: rgba(255,255,255,0.20) !important;
    }

    @media (max-width: 768px) {
      #thread::before {
        top: -18px !important;
        width: calc(100% - 2px) !important;
        height: calc(100dvh + 36px) !important;
        margin-bottom: calc(-100dvh - 36px) !important;
        border-radius: 0 !important;
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
        -webkit-filter: blur(10px) saturate(106%) brightness(90%) !important;
        filter: blur(10px) saturate(106%) brightness(90%) !important;
        transform: translateZ(0) scale(1.022) !important;
        -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.42) 3%, #000 11%, #000 89%, rgba(0,0,0,0.42) 97%, transparent 100%) !important;
        mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.42) 3%, #000 11%, #000 89%, rgba(0,0,0,0.42) 97%, transparent 100%) !important;
      }

      form[class*="group/composer"] [class*="bg-(--composer-surface-primary)"] {
        border-radius: 18px !important;
      }
    }

    @supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      #stage-slideover-sidebar,
      #conversation-header-actions,
      form[class*="group/composer"] [class*="bg-(--composer-surface-primary)"],
      [role="menu"],
      [role="listbox"],
      [role="dialog"],
      [data-testid*="modal" i] {
        background-color: rgba(10, 10, 13, 0.88) !important;
      }
    }

    @media (pointer: coarse), (prefers-reduced-motion: reduce) {
      html::before {
        transition: none !important;
      }
    }
  `);

  const ROTATE_MS = 30 * 60 * 1000;
  const CACHE_MS = 6 * 60 * 60 * 1000;
  const CACHE_KEY = "chatgpt-us-sign-dark-glass-bing-wallpaper-pool-v1";
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

    if (slot !== lastAppliedSlot && images.length > 1 && image.key === lastWallpaperKey) {
      index = (index + 1) % images.length;
      image = images[index];
    }

    document.documentElement.style.setProperty(
      "--us-wallpaper",
      `url("${image.url.replace(/"/g, "%22")}")`
    );
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
        onerror() {
          resolve([]);
        },
        ontimeout() {
          resolve([]);
        }
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

      const images = Array.from(unique.values()).sort(
        (a, b) => hashString(a.key) - hashString(b.key)
      );

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

    window.addEventListener("pageshow", syncWallpaperRotation, { passive: true });
    window.addEventListener("focus", syncWallpaperRotation, { passive: true });
    document.addEventListener(
      "visibilitychange",
      () => {
        if (!document.hidden) syncWallpaperRotation();
      },
      { passive: true }
    );
  }

  initWallpapers();
})();
