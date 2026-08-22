// ==UserScript==
// @name         ChatGPT - US Sign Dark Glass Theme
// @namespace    us-sign-full-modules
// @version      2.1.6
// @description  Modern graphite glass for ChatGPT with strong cinematic Bing UHD motion and a true live backdrop-filter reading glass panel.
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

  if (window.__chatgptUsSignDarkGlassThemeV216) return;
  window.__chatgptUsSignDarkGlassThemeV216 = true;

  const root = document.documentElement;
  if (!root) return;

  root.dataset.usSignTheme = "dark-glass-cinematic-live-reading-glass";
  root.dataset.usSignThemeVersion = "2.1.6";
  root.dataset.usReadingGlass = "live-backdrop";

  GM_addStyle(String.raw`
    /* v2.1.6: the reading column is now real live glass. The v2.1.3 base used
       a duplicated wallpaper image plus filter: blur(...). v2.1.5 kept that
       duplicate synchronized during image changes. This override removes the
       duplicated image entirely and lets the moving cinematic wallpaper be
       sampled live through backdrop-filter. */
    #thread {
      isolation: auto !important;
    }

    #thread::before {
      background-color: rgba(7, 7, 10, 0.24) !important;
      background-image: linear-gradient(
        180deg,
        rgba(10, 10, 13, 0.18) 0%,
        rgba(7, 7, 10, 0.27) 52%,
        rgba(5, 5, 8, 0.36) 100%
      ) !important;
      -webkit-filter: none !important;
      filter: none !important;
      -webkit-backdrop-filter: blur(26px) saturate(122%) brightness(86%) !important;
      backdrop-filter: blur(26px) saturate(122%) brightness(86%) !important;
      transform: translateZ(0) !important;
      z-index: 0 !important;
      will-change: auto !important;
    }

    /* Keep the actual conversation above the sticky viewport-sized glass
       sheet. This does not blur the thousands-of-pixels-tall conversation DOM. */
    #thread > * {
      position: relative;
      z-index: 1;
    }

    @media (max-width: 768px) {
      #thread::before {
        -webkit-filter: none !important;
        filter: none !important;
        -webkit-backdrop-filter: blur(18px) saturate(116%) brightness(87%) !important;
        backdrop-filter: blur(18px) saturate(116%) brightness(87%) !important;
        transform: translateZ(0) !important;
      }
    }

    @supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      #thread::before {
        background: rgba(8, 8, 11, 0.78) !important;
      }
    }
  `);

  function readingGlassDebug() {
    const thread = document.querySelector("#thread");
    if (!thread) {
      return {
        version: root.dataset.usSignThemeVersion,
        readingGlass: root.dataset.usReadingGlass,
        foundThread: false
      };
    }

    const style = getComputedStyle(thread, "::before");
    return {
      version: root.dataset.usSignThemeVersion,
      readingGlass: root.dataset.usReadingGlass,
      foundThread: true,
      backdropFilter: style.backdropFilter,
      webkitBackdropFilter: style.webkitBackdropFilter,
      filter: style.filter,
      backgroundImage: style.backgroundImage,
      backgroundColor: style.backgroundColor,
      position: style.position,
      zIndex: style.zIndex,
      width: style.width,
      height: style.height
    };
  }

  window.__usReadingGlassDebug = readingGlassDebug;
})();
