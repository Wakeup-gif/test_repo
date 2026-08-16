// ==UserScript==
// @name         ChatGPT - US Sign Glass Theme
// @namespace    us-sign-full-modules
// @version      2.0.18
// @description  US Sign-inspired ChatGPT theme with bottom-continuous tapered reading glass, resilient Bing UHD rotation, direct-rule low-overhead parallax, single-layer sidebar/composer frost, improved contrast, native layout, and a cutout geometric cursor.
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

  if (window.__chatgptUsSignGlassThemeV218) return;
  window.__chatgptUsSignGlassThemeV218 = true;

  const themeStyle = GM_addStyle(String.raw`
    @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;650;700&display=swap");

    :root,
    html.dark,
    html[data-theme="dark"] {
      --us-bg: rgba(9, 15, 23, 0.18);
      --us-bg-elevated: rgba(20, 31, 43, 0.62);
      --us-bg-soft: rgba(24, 37, 50, 0.46);
      --us-glass: rgba(18, 30, 43, 0.54);
      --us-glass-strong: rgba(14, 25, 37, 0.76);
      --us-glass-soft: rgba(255, 255, 255, 0.05);
      --us-hover: rgba(123, 194, 255, 0.12);
      --us-text: #f6f9fc;
      --us-text-soft: #eaf0f5;
      --us-text-muted: #b6c2ce;
      --us-accent: #9bd3ff;
      --us-accent-soft: rgba(72, 166, 244, 0.18);
      --us-border: rgba(184, 220, 249, 0.14);
      --us-border-strong: rgba(195, 227, 252, 0.22);
      --us-border-focus: rgba(111, 190, 255, 0.62);
      --us-shadow-sm: 0 5px 16px rgba(0, 0, 0, 0.18);
      --us-shadow-md: 0 16px 42px rgba(0, 0, 0, 0.24);
      --us-radius-sm: 8px;
      --us-radius-md: 12px;
      --us-radius-lg: 20px;
      --us-font: "Manrope", "Avenir Next", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      --us-wallpaper: url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1");
      --us-wallpaper-transform: translate3d(0px, 0px, 0) scale(1.06);

      /* Keep incidental ChatGPT surfaces readable while the actual page/thread
         stay transparent over the wallpaper. */
      --main-surface-primary: rgba(17, 29, 42, 0.30) !important;
      --main-surface-secondary: rgba(23, 37, 51, 0.40) !important;
      --main-surface-tertiary: rgba(29, 45, 60, 0.48) !important;
      --sidebar-surface-primary: rgba(27, 43, 58, 0.12) !important;
      --sidebar-surface-secondary: rgba(38, 58, 76, 0.13) !important;
      --sidebar-surface-tertiary: rgba(48, 68, 86, 0.11) !important;
      --composer-surface: rgba(15, 28, 40, 0.70) !important;
      --composer-surface-primary: rgba(15, 28, 40, 0.70) !important;
      --composer-blue-bg: rgba(80, 165, 238, 0.14) !important;
      --message-surface: rgba(20, 34, 48, 0.30) !important;
      --text-primary: var(--us-text) !important;
      --text-secondary: var(--us-text-soft) !important;
      --text-tertiary: var(--us-text-muted) !important;
      --border-light: var(--us-border) !important;
      --border-medium: var(--us-border-strong) !important;
      --interactive-bg-secondary-default: rgba(255, 255, 255, 0.045) !important;
      --interactive-bg-secondary-hover: rgba(123, 194, 255, 0.10) !important;
    }

    html {
      min-height: 100% !important;
      color-scheme: dark !important;
      background: #081019 !important;
    }

    /* One compositor-friendly wallpaper plane. Mouse parallax only changes
       this transform variable once per pointer animation frame. */
    html::before {
      content: "" !important;
      position: fixed !important;
      inset: -4vh -4vw !important;
      z-index: 0 !important;
      pointer-events: none !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.12), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.055), transparent 34%),
        linear-gradient(rgba(4, 8, 13, 0.20), rgba(6, 11, 17, 0.38)),
        var(--us-wallpaper) !important;
      background-position: center !important;
      background-size: auto, auto, auto, cover !important;
      background-repeat: no-repeat !important;
      transform: var(--us-wallpaper-transform) !important;
      transform-origin: center center !important;
      transition: none !important;
      will-change: transform !important;
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

    /* Snapshot-grounded page ownership. Do not globally erase every
       bg-token-main-surface class: those small native surfaces are useful for
       contrast. Only the real page/scroll/thread canvas is transparent. */
    #main,
    #thread,
    [class~="group/scroll-root"] {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    /* PERFORMANCE: the old rear rail was ~920px x 58,000px and carried a
       backdrop-filter across the entire conversation. This sticky pseudo-item
       is viewport bounded, so Chrome only maintains roughly one screen of
       frosted pixels while the thread scrolls underneath it. */
    #thread {
      position: relative !important;
      isolation: isolate !important;
    }

    /* v2.0.15: make the reading atmosphere meet the top of the viewport instead
       of reading like a floating card. The elliptical mask keeps the center
       opaque enough for text while progressively tapering the side/lower frost. */
    /* v2.0.17: the rear glass now remains present all the way through the
       disclaimer/composer zone. Only the left/right edges feather away, so
       there is no horizontal transparency seam behind the footer copy. */
    #thread::before {
      content: "" !important;
      display: block !important;
      position: sticky !important;
      top: 0 !important;
      align-self: center !important;
      flex: 0 0 auto !important;
      box-sizing: border-box !important;
      width: min(1000px, calc(100% - 32px)) !important;
      height: 100dvh !important;
      margin-bottom: -100dvh !important;
      pointer-events: none !important;
      z-index: -1 !important;
      background: rgba(10, 23, 36, 0.69) !important;
      background-image: linear-gradient(180deg, rgba(198, 229, 252, 0.066), rgba(3, 10, 17, 0.050)) !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: 0 18px 64px rgba(0,0,0,0.11) !important;
      -webkit-backdrop-filter: blur(9px) saturate(116%) !important;
      backdrop-filter: blur(9px) saturate(116%) !important;
      -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.22) 4%, rgba(0,0,0,0.62) 10%, #000 18%, #000 82%, rgba(0,0,0,0.62) 90%, rgba(0,0,0,0.22) 96%, transparent 100%) !important;
      mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.22) 4%, rgba(0,0,0,0.62) 10%, #000 18%, #000 82%, rgba(0,0,0,0.62) 90%, rgba(0,0,0,0.22) 96%, transparent 100%) !important;
    }

    /* ChatGPT's native footer fade was an 80% solid-black strip in the
       snapshot. Keep the fade, but make it atmospheric instead of a black bar. */
    #thread-bottom-container::after {
      background: linear-gradient(180deg, rgba(10, 23, 36, 0) 0%, rgba(10, 23, 36, 0.12) 48%, rgba(10, 23, 36, 0.30) 100%) !important;
      opacity: 1 !important;
    }

    /* One sidebar frost layer only. The previous generic nav/aside selector
       blurred both the visible 260px nav and the invisible 52px tiny rail. */
    #stage-slideover-sidebar {
      color: var(--us-text-soft) !important;
      background: rgba(22, 38, 53, 0.46) !important;
      background-image: linear-gradient(180deg, rgba(190, 222, 247, 0.040), rgba(255,255,255,0.008)) !important;
      border-inline-end: 1px solid rgba(190, 224, 250, 0.13) !important;
      box-shadow: 10px 0 32px rgba(0,0,0,0.12), inset -1px 0 0 rgba(255,255,255,0.025) !important;
      -webkit-backdrop-filter: blur(14px) saturate(116%) !important;
      backdrop-filter: blur(14px) saturate(116%) !important;
    }

    #stage-slideover-sidebar nav,
    #stage-sidebar-tiny-bar {
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    #stage-slideover-sidebar [class*="bg-token-sidebar-surface-primary"] {
      background-color: transparent !important;
      background-image: none !important;
    }

    #stage-slideover-sidebar a {
      border-radius: var(--us-radius-sm) !important;
    }

    #stage-slideover-sidebar a:hover,
    #stage-slideover-sidebar button:hover,
    #stage-slideover-sidebar [aria-current="page"] {
      background: var(--us-hover) !important;
    }

    /* Preserve ChatGPT's native sticky header geometry. Only paint the small
       action capsule that otherwise reads as a near-black island. */
    #page-header {
      color: var(--us-text) !important;
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    #conversation-header-actions {
      background: rgba(20, 34, 48, 0.62) !important;
      border: 1px solid rgba(192, 224, 249, 0.16) !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.035) !important;
      -webkit-backdrop-filter: blur(12px) saturate(118%) !important;
      backdrop-filter: blur(12px) saturate(118%) !important;
    }

    #conversation-header-actions button:hover {
      background: rgba(123, 194, 255, 0.11) !important;
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
      border-color: rgba(155, 211, 255, 0.32) !important;
      background: rgba(13, 27, 41, 0.42) !important;
      border-radius: 0 var(--us-radius-sm) var(--us-radius-sm) 0 !important;
    }

    .markdown pre,
    .prose pre,
    [data-testid="code-block"] {
      color: #e8eff5 !important;
      background: rgba(5, 11, 18, 0.84) !important;
      border: 1px solid rgba(184, 220, 249, 0.15) !important;
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
      background: rgba(10, 22, 34, 0.52) !important;
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

    /* Snapshot-grounded composer shell. Style the real 768px native surface,
       not the inner ProseMirror scroller, and avoid broad :has() selectors. */
    form[class*="group/composer"] [class*="bg-(--composer-surface-primary)"] {
      color: var(--us-text) !important;
      background: rgba(15, 28, 40, 0.70) !important;
      background-image: linear-gradient(180deg, rgba(201, 229, 250, 0.045), rgba(255,255,255,0.010)) !important;
      border: 1px solid rgba(195, 227, 252, 0.19) !important;
      box-shadow: 0 14px 38px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.040) !important;
      -webkit-backdrop-filter: blur(14px) saturate(120%) !important;
      backdrop-filter: blur(14px) saturate(120%) !important;
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

    /* Menus should be clearly readable, but only transient surfaces pay a
       modest blur cost. */
    [role="menu"],
    [data-radix-popper-content-wrapper] > div,
    [data-headlessui-state] [role="menu"],
    [data-radix-popper-content-wrapper] [role="listbox"],
    [data-radix-popper-content-wrapper] [data-radix-menu-content],
    [data-radix-popper-content-wrapper] [data-radix-select-content],
    [role="listbox"] {
      color: var(--us-text-soft) !important;
      background: rgba(28, 44, 59, 0.76) !important;
      background-image: linear-gradient(180deg, rgba(176, 218, 249, 0.055), rgba(255,255,255,0.012)) !important;
      border: 1px solid rgba(196, 226, 250, 0.20) !important;
      box-shadow: 0 18px 44px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.045) !important;
      -webkit-backdrop-filter: blur(12px) saturate(120%) !important;
      backdrop-filter: blur(12px) saturate(120%) !important;
    }

    [role="dialog"],
    [data-testid*="modal" i] {
      color: var(--us-text-soft) !important;
      background: rgba(24, 38, 52, 0.90) !important;
      border: 1px solid rgba(196, 226, 250, 0.20) !important;
      box-shadow: 0 24px 64px rgba(0,0,0,0.32) !important;
      -webkit-backdrop-filter: blur(8px) saturate(112%) !important;
      backdrop-filter: blur(8px) saturate(112%) !important;
    }

    [role="menuitem"] {
      border-radius: var(--us-radius-sm) !important;
    }

    [role="menuitem"]:hover,
    [role="option"]:hover,
    [data-highlighted] {
      background: var(--us-hover) !important;
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
      background: rgba(205, 229, 247, 0.18) !important;
      border: 2px solid transparent !important;
      background-clip: padding-box !important;
      border-radius: 999px !important;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(205, 229, 247, 0.30) !important;
      background-clip: padding-box !important;
    }

    ::selection {
      color: var(--us-text) !important;
      background: rgba(142, 203, 255, 0.30) !important;
    }

    @media (max-width: 768px) {
      #thread::before {
        top: 0 !important;
        width: calc(100% - 6px) !important;
        height: 100dvh !important;
        margin-bottom: -100dvh !important;
        border-radius: 0 !important;
        background: rgba(10, 23, 36, 0.72) !important;
        -webkit-backdrop-filter: blur(7px) saturate(110%) !important;
        backdrop-filter: blur(7px) saturate(110%) !important;
        -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.42) 4%, #000 12%, #000 88%, rgba(0,0,0,0.42) 96%, transparent 100%) !important;
        mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.42) 4%, #000 12%, #000 88%, rgba(0,0,0,0.42) 96%, transparent 100%) !important;
      }

      form[class*="group/composer"] [class*="bg-(--composer-surface-primary)"] {
        border-radius: 18px !important;
      }
    }

    @media (pointer: coarse), (prefers-reduced-motion: reduce) {
      :root {
        --us-wallpaper-transform: translate3d(0px, 0px, 0) scale(1.06);
      }
      html::before {
        transition: none !important;
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

  /* v2.0.13: no thread discovery observer is needed. The uploaded visual
     snapshot exposes the stable native #thread container directly. */

  /* v2.0.17: pointer motion is sampled once per animation frame, but the
     transform is written directly to the one html::before CSS rule instead of
     mutating an inherited root custom property across the entire ChatGPT tree. */
  const PARALLAX_X_PX = 9;
  const PARALLAX_Y_PX = 5;
  let wallpaperRule = null;
  let parallaxRaf = 0;
  let pendingShiftX = 0;
  let pendingShiftY = 0;
  let lastPointerX = -9999;
  let lastPointerY = -9999;

  function resolveWallpaperRule() {
    if (wallpaperRule) return wallpaperRule;
    try {
      const sheet = themeStyle?.sheet;
      if (!sheet) return null;
      for (const rule of sheet.cssRules) {
        if (rule?.selectorText === "html::before") {
          wallpaperRule = rule;
          return wallpaperRule;
        }
      }
    } catch (_) {}
    return null;
  }

  function commitParallax() {
    parallaxRaf = 0;
    const transform = `translate3d(${pendingShiftX.toFixed(2)}px, ${pendingShiftY.toFixed(2)}px, 0) scale(1.06)`;
    const rule = resolveWallpaperRule();
    if (rule) {
      rule.style.setProperty("transform", transform, "important");
      return;
    }
    // Rare fallback for userscript engines that do not expose the inserted
    // stylesheet object. This path is only used if direct-rule mutation fails.
    document.documentElement.style.setProperty("--us-wallpaper-transform", transform);
  }

  function queueParallax() {
    if (!parallaxRaf) parallaxRaf = window.requestAnimationFrame(commitParallax);
  }

  function centerParallax() {
    pendingShiftX = 0;
    pendingShiftY = 0;
    queueParallax();
  }

  function initParallax() {
    const motionQuery = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!motionQuery.matches) return;

    window.addEventListener("pointermove", (event) => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      if (Math.abs(event.clientX - lastPointerX) < 2 && Math.abs(event.clientY - lastPointerY) < 2) return;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;

      const nx = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      pendingShiftX = -(nx * PARALLAX_X_PX);
      pendingShiftY = -(ny * PARALLAX_Y_PX);
      queueParallax();
    }, { passive: true });

    document.addEventListener("mouseleave", centerParallax, { passive: true });
    window.addEventListener("blur", centerParallax, { passive: true });
  }

  initParallax();
})();
