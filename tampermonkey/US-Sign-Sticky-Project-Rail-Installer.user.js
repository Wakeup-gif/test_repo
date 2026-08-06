// ==UserScript==
// @name         US Sign Sticky Project Rail
// @namespace    us-sign-full-modules
// @version      2.1.0
// @description  Keeps the native project rail visible and clickable above the content workspace.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Sticky-Project-Rail-Installer.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Sticky-Project-Rail-Installer.user.js
// ==/UserScript==

(function () {
  "use strict";

  GM_addStyle(`
    html.us-sign-sticky-rail #pmlt {
      position: sticky !important;
      top: 58px !important;
      z-index: 10000 !important;
      isolation: isolate !important;
      align-self: flex-start !important;
      max-height: calc(100vh - 58px) !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      pointer-events: auto !important;
      scrollbar-width: thin !important;
    }

    html.us-sign-sticky-rail #pmlt,
    html.us-sign-sticky-rail #pmlt * {
      pointer-events: auto !important;
    }

    html.us-sign-sticky-rail #pmlt a {
      position: relative !important;
      z-index: 10001 !important;
      cursor: pointer !important;
      user-select: none !important;
    }

    html.us-sign-sticky-rail #content > .tray-center,
    html.us-sign-sticky-rail #content .tray-center {
      position: relative !important;
      z-index: 1 !important;
      min-width: 0 !important;
    }

    html.us-sign-sticky-rail #pmlt::before,
    html.us-sign-sticky-rail #pmlt::after {
      pointer-events: none !important;
    }

    @media (max-width: 900px) {
      html.us-sign-sticky-rail #pmlt {
        position: static !important;
        z-index: auto !important;
        max-height: none !important;
        overflow: visible !important;
      }
    }
  `);

  function apply() {
    document.documentElement.classList.toggle(
      "us-sign-sticky-rail",
      Boolean(document.getElementById("pmlt"))
    );
  }

  apply();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  }

  window.setTimeout(apply, 350);
  window.setTimeout(apply, 1200);
  window.addEventListener("pageshow", () => window.setTimeout(apply, 50));
})();
