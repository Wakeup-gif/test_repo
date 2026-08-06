// ==UserScript==
// @name         US Sign Sticky Project Rail
// @namespace    us-sign-full-modules
// @version      2.0.0
// @description  Keeps the native SquareCoil project rail visible without cloning or rebuilding it.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  GM_addStyle(`
    html.us-sign-sticky-rail #pmlt {
      position: sticky !important;
      top: 58px !important;
      align-self: flex-start !important;
      max-height: calc(100vh - 58px) !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      scrollbar-width: thin !important;
    }

    @media (max-width: 900px) {
      html.us-sign-sticky-rail #pmlt {
        position: static !important;
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
