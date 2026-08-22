// ==UserScript==
// @name         ChatGPT - US Sign Dark Glass Theme
// @namespace    us-sign-full-modules
// @version      2.1.7
// @description  Modern graphite glass for ChatGPT with cinematic Bing UHD motion and a true sibling-layer live reading glass that samples the moving wallpaper directly.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      www.bing.com
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme-v2.1.3.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme-v2.1.5.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__chatgptUsSignDarkGlassThemeV217) return;
  window.__chatgptUsSignDarkGlassThemeV217 = true;

  const root = document.documentElement;
  if (!root) return;

  root.dataset.usSignTheme = "dark-glass-cinematic-sibling-reading-glass";
  root.dataset.usSignThemeVersion = "2.1.7";
  root.dataset.usReadingGlass = "sibling-live-backdrop";

  GM_addStyle(String.raw`
    /* Three explicit sibling depth planes inside the isolated body:
       wallpaper (-2), live reading glass (-1), ChatGPT UI (auto/0+).
       This lets backdrop-filter sample the actual animated Bing pixels. */
    body {
      position: relative !important;
      isolation: isolate !important;
    }

    #us-cinematic-wallpaper {
      z-index: -2 !important;
    }

    #us-reading-glass {
      position: fixed !important;
      top: -28px !important;
      height: calc(100dvh + 56px) !important;
      left: 50%;
      width: min(1040px, calc(100vw - 24px));
      z-index: -1 !important;
      pointer-events: none !important;
      background:
        linear-gradient(
          180deg,
          rgba(10, 10, 13, 0.16) 0%,
          rgba(7, 7, 10, 0.22) 52%,
          rgba(5, 5, 8, 0.30) 100%
        ) !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      -webkit-filter: none !important;
      filter: none !important;
      -webkit-backdrop-filter: blur(20px) saturate(118%) brightness(89%) !important;
      backdrop-filter: blur(20px) saturate(118%) brightness(89%) !important;
      transform: translateX(-50%) !important;
      transform-origin: center center !important;
      isolation: auto !important;
      contain: none !important;
      will-change: auto !important;
      backface-visibility: hidden !important;
      -webkit-mask-image: linear-gradient(
        90deg,
        transparent 0%,
        rgba(0,0,0,0.20) 3%,
        rgba(0,0,0,0.66) 9%,
        #000 17%,
        #000 83%,
        rgba(0,0,0,0.66) 91%,
        rgba(0,0,0,0.20) 97%,
        transparent 100%
      ) !important;
      mask-image: linear-gradient(
        90deg,
        transparent 0%,
        rgba(0,0,0,0.20) 3%,
        rgba(0,0,0,0.66) 9%,
        #000 17%,
        #000 83%,
        rgba(0,0,0,0.66) 91%,
        rgba(0,0,0,0.20) 97%,
        transparent 100%
      ) !important;
    }

    /* Completely remove the old pseudo-element reading panel. No duplicated
       wallpaper, no cached-image blur, and no second backdrop-filter here. */
    #thread::before {
      content: none !important;
      display: none !important;
      background: none !important;
      background-image: none !important;
      -webkit-filter: none !important;
      filter: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      transform: none !important;
    }

    @media (max-width: 768px) {
      #us-reading-glass {
        top: -18px !important;
        height: calc(100dvh + 36px) !important;
        width: calc(100vw - 2px);
        -webkit-backdrop-filter: blur(14px) saturate(114%) brightness(90%) !important;
        backdrop-filter: blur(14px) saturate(114%) brightness(90%) !important;
        -webkit-mask-image: linear-gradient(
          90deg,
          transparent 0%,
          rgba(0,0,0,0.46) 3%,
          #000 11%,
          #000 89%,
          rgba(0,0,0,0.46) 97%,
          transparent 100%
        ) !important;
        mask-image: linear-gradient(
          90deg,
          transparent 0%,
          rgba(0,0,0,0.46) 3%,
          #000 11%,
          #000 89%,
          rgba(0,0,0,0.46) 97%,
          transparent 100%
        ) !important;
      }
    }

    @supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      #us-reading-glass {
        background: rgba(8, 8, 11, 0.78) !important;
      }
    }
  `);

  let glass = null;
  let thread = null;
  let resizeObserver = null;
  let geometryFrame = 0;
  let findTimer = 0;
  let findAttempts = 0;

  function ensureGlass() {
    if (!document.body) return false;

    glass = document.getElementById("us-reading-glass");
    if (!glass) {
      glass = document.createElement("div");
      glass.id = "us-reading-glass";
      glass.setAttribute("aria-hidden", "true");
      document.body.appendChild(glass);
    }

    return true;
  }

  function scheduleGeometry() {
    if (geometryFrame) cancelAnimationFrame(geometryFrame);
    geometryFrame = requestAnimationFrame(() => {
      geometryFrame = 0;
      updateGeometry();
    });
  }

  function updateGeometry() {
    if (!ensureGlass()) return false;

    thread = document.querySelector("#thread");
    if (!thread) {
      glass.style.display = "none";
      return false;
    }

    const rect = thread.getBoundingClientRect();
    const width = Math.min(1040, Math.max(0, rect.width - 24));
    const centerX = rect.left + rect.width / 2;

    if (width < 120 || !Number.isFinite(centerX)) {
      glass.style.display = "none";
      return false;
    }

    glass.style.display = "block";
    glass.style.width = `${Math.round(width * 100) / 100}px`;
    glass.style.left = `${Math.round(centerX * 100) / 100}px`;

    root.dataset.usReadingGlassWidth = String(Math.round(width));
    root.dataset.usReadingGlassCenterX = String(Math.round(centerX));

    return true;
  }

  function attachGeometryObserver() {
    thread = document.querySelector("#thread");
    if (!thread) return false;

    resizeObserver?.disconnect();
    if (typeof ResizeObserver === "function") {
      resizeObserver = new ResizeObserver(scheduleGeometry);
      resizeObserver.observe(thread);

      let node = thread.parentElement;
      let observed = 0;
      while (node && node !== document.body && observed < 3) {
        const style = getComputedStyle(node);
        if (style.display !== "contents") {
          resizeObserver.observe(node);
          observed += 1;
        }
        node = node.parentElement;
      }
    }

    scheduleGeometry();
    return true;
  }

  function findThreadAndAttach() {
    if (attachGeometryObserver()) {
      if (findTimer) clearTimeout(findTimer);
      findTimer = 0;
      return;
    }

    findAttempts += 1;
    if (findAttempts > 40) return;
    findTimer = setTimeout(findThreadAndAttach, findAttempts < 12 ? 250 : 1000);
  }

  function styleSnapshot(style) {
    if (!style) return null;
    return {
      display: style.display,
      position: style.position,
      zIndex: style.zIndex,
      isolation: style.isolation,
      opacity: style.opacity,
      backgroundImage: style.backgroundImage,
      backgroundColor: style.backgroundColor,
      filter: style.filter,
      backdropFilter: style.backdropFilter,
      webkitBackdropFilter: style.webkitBackdropFilter,
      transform: style.transform,
      contain: style.contain
    };
  }

  function readingGlassDebug() {
    const liveGlass = document.getElementById("us-reading-glass");
    const liveThread = document.querySelector("#thread");
    const host = document.getElementById("us-cinematic-wallpaper");

    return {
      capturedAt: new Date().toISOString(),
      version: root.dataset.usSignThemeVersion,
      readingGlass: root.dataset.usReadingGlass,
      support: {
        backdropFilter: CSS.supports("backdrop-filter", "blur(10px)"),
        webkitBackdropFilter: CSS.supports("-webkit-backdrop-filter", "blur(10px)")
      },
      glass: liveGlass ? {
        rect: liveGlass.getBoundingClientRect().toJSON(),
        style: styleSnapshot(getComputedStyle(liveGlass))
      } : null,
      cinematicHost: host ? {
        rect: host.getBoundingClientRect().toJSON(),
        style: styleSnapshot(getComputedStyle(host))
      } : null,
      thread: liveThread ? {
        rect: liveThread.getBoundingClientRect().toJSON(),
        style: styleSnapshot(getComputedStyle(liveThread)),
        before: styleSnapshot(getComputedStyle(liveThread, "::before"))
      } : null,
      body: styleSnapshot(getComputedStyle(document.body))
    };
  }

  function downloadReadingGlassDebug() {
    const result = readingGlassDebug();
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chatgpt-reading-glass-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return result;
  }

  window.__usReadingGlassDebug = readingGlassDebug;
  window.__usReadingGlassDownloadDebug = downloadReadingGlassDebug;

  function initReadingGlass() {
    if (!ensureGlass()) return;
    findThreadAndAttach();

    window.addEventListener("resize", scheduleGeometry, { passive: true });
    window.addEventListener("pageshow", scheduleGeometry, { passive: true });
    window.addEventListener("focus", scheduleGeometry, { passive: true });
    document.addEventListener("transitionend", scheduleGeometry, { passive: true, capture: true });
  }

  if (document.body) initReadingGlass();
  else document.addEventListener("DOMContentLoaded", initReadingGlass, { once: true });
})();
