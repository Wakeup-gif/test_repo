// ==UserScript==
// @name         US Sign - Design Job Tools
// @namespace    us-sign-local-tools
// @version      4.2.0
// @description  Stable Design workspace with Designs and Files aligned beside Job Overview.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Design-Job-Tools-v4.1.0.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Design-Job-Tools.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Design-Job-Tools.user.js
// ==/UserScript==

(function () {
  "use strict";

  const STYLE_ID = "us-sign-design-v42-layout-style";
  const LAYOUT_CLASS = "us-sign-design-v42-layout";

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${LAYOUT_CLASS} {
        display: grid !important;
        grid-template-columns:
          minmax(0, 7fr)
          minmax(220px, 1fr) !important;
        grid-template-rows: auto auto auto auto !important;
        column-gap: 12px !important;
        row-gap: 0 !important;
        align-items: stretch !important;
        width: 100% !important;
        min-width: 0 !important;
      }

      .${LAYOUT_CLASS} > * {
        min-width: 0 !important;
      }

      .${LAYOUT_CLASS} > #us-sign-design-actionbar {
        grid-column: 1 !important;
        grid-row: 1 !important;
        margin-top: 0 !important;
      }

      .${LAYOUT_CLASS} > #us-sign-job-overview {
        grid-column: 1 !important;
        grid-row: 2 !important;
        align-self: stretch !important;
        margin-top: 0 !important;
      }

      .${LAYOUT_CLASS} > #us-sign-design-summary {
        grid-column: 1 !important;
        grid-row: 3 !important;
        align-self: stretch !important;
        margin-top: 0 !important;
      }

      .${LAYOUT_CLASS} > #us-sign-design-bottom-grid {
        display: contents !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack {
        grid-column: 2 !important;
        grid-row: 1 / span 3 !important;
        display: grid !important;
        grid-template-rows: auto minmax(0, 1fr) !important;
        align-self: stretch !important;
        gap: 12px !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      > .us-sign-designs-panel,
      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      > .us-sign-files-panel {
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      > .us-sign-files-panel {
        align-self: stretch !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-bottom-grid
      > .us-sign-description-panel {
        grid-column: 1 / -1 !important;
        grid-row: 4 !important;
        width: 100% !important;
        min-width: 0 !important;
        margin-top: 12px !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      table,
      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      .table {
        table-layout: fixed !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      td,
      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      th,
      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      a {
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
      }

      @media (max-width: 1120px) {
        .${LAYOUT_CLASS} {
          grid-template-columns:
            minmax(0, 1fr)
            minmax(200px, 0.28fr) !important;
        }
      }

      @media (max-width: 900px) {
        .${LAYOUT_CLASS} {
          grid-template-columns: minmax(0, 1fr) !important;
          grid-template-rows: auto !important;
          row-gap: 12px !important;
        }

        .${LAYOUT_CLASS} > #us-sign-design-actionbar,
        .${LAYOUT_CLASS} > #us-sign-job-overview,
        .${LAYOUT_CLASS} > #us-sign-design-summary,
        .${LAYOUT_CLASS} #us-sign-design-right-stack,
        .${LAYOUT_CLASS}
        #us-sign-design-bottom-grid
        > .us-sign-description-panel {
          grid-column: 1 !important;
          grid-row: auto !important;
        }

        .${LAYOUT_CLASS}
        #us-sign-design-right-stack {
          grid-template-rows: auto auto !important;
        }
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function applyLayout() {
    installStyle();

    const overview = document.getElementById("us-sign-job-overview");
    const actionbar = document.getElementById("us-sign-design-actionbar");
    const summary = document.getElementById("us-sign-design-summary");
    const bottomGrid = document.getElementById("us-sign-design-bottom-grid");
    const rightStack = document.getElementById("us-sign-design-right-stack");

    if (!overview || !bottomGrid || !rightStack) return false;

    const parent = overview.parentElement;
    if (!parent) return false;

    if (actionbar && actionbar.parentElement !== parent) return false;
    if (summary && summary.parentElement !== parent) return false;
    if (bottomGrid.parentElement !== parent) return false;

    parent.classList.add(LAYOUT_CLASS);
    return true;
  }

  let scheduled = false;

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;

    window.requestAnimationFrame(() => {
      scheduled = false;
      applyLayout();
    });
  }

  scheduleApply();
  window.setTimeout(scheduleApply, 250);
  window.setTimeout(scheduleApply, 900);
  window.addEventListener("pageshow", scheduleApply);

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.addedNodes.length || mutation.removedNodes.length)) {
      scheduleApply();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
