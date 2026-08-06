// ==UserScript==
// @name         US Sign - Design Job Tools
// @namespace    us-sign-local-tools
// @version      4.2.1
// @description  Stable Design workspace with Designs and Files aligned beside Job Overview with refined spacing.
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

  const STYLE_ID = "us-sign-design-v421-layout-style";
  const LAYOUT_CLASS = "us-sign-design-v421-layout";

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${LAYOUT_CLASS} {
        display: grid !important;
        grid-template-columns:
          minmax(0, 6.25fr)
          minmax(270px, 1.75fr) !important;
        grid-template-rows: auto auto auto auto !important;
        column-gap: 14px !important;
        row-gap: 0 !important;
        align-items: stretch !important;
        width: 100% !important;
        min-width: 0 !important;
      }

      .${LAYOUT_CLASS} > * {
        box-sizing: border-box !important;
        min-width: 0 !important;
      }

      .${LAYOUT_CLASS} > #us-sign-design-actionbar {
        grid-column: 1 !important;
        grid-row: 1 !important;
        width: 100% !important;
        margin: 0 !important;
      }

      .${LAYOUT_CLASS} > #us-sign-job-overview {
        grid-column: 1 !important;
        grid-row: 2 !important;
        align-self: stretch !important;
        width: 100% !important;
        margin: 0 !important;
      }

      .${LAYOUT_CLASS} > #us-sign-design-summary {
        grid-column: 1 !important;
        grid-row: 3 !important;
        align-self: stretch !important;
        width: 100% !important;
        margin: 0 !important;
      }

      .${LAYOUT_CLASS} > #us-sign-design-bottom-grid {
        display: contents !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack {
        grid-column: 2 !important;
        grid-row: 1 / 4 !important;
        display: grid !important;
        grid-template-rows: auto minmax(68px, 1fr) !important;
        align-self: stretch !important;
        align-content: stretch !important;
        gap: 14px !important;
        width: 100% !important;
        min-width: 0 !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      > .us-sign-designs-panel,
      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      > .us-sign-files-panel {
        box-sizing: border-box !important;
        width: 100% !important;
        min-width: 0 !important;
        min-height: 0 !important;
        margin: 0 !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      > .us-sign-files-panel {
        align-self: stretch !important;
        height: 100% !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      > .panel
      > .panel-heading {
        min-height: 40px !important;
        padding: 7px 9px !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      > .panel
      > .panel-body {
        min-width: 0 !important;
        padding: 8px 9px !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-bottom-grid
      > .us-sign-description-panel {
        grid-column: 1 / -1 !important;
        grid-row: 4 !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 14px 0 0 !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      table,
      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      .table {
        width: 100% !important;
        table-layout: auto !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      td,
      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      th {
        min-width: 0 !important;
        padding: 5px 7px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        word-break: normal !important;
        overflow-wrap: normal !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      td:first-child {
        width: 55% !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      td:last-child {
        width: 45% !important;
        text-align: right !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      td a,
      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      th a {
        display: block !important;
        min-width: 0 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-design-right-stack
      .btn {
        flex: 0 0 auto !important;
        white-space: nowrap !important;
      }

      @media (max-width: 1220px) {
        .${LAYOUT_CLASS} {
          grid-template-columns:
            minmax(0, 1fr)
            minmax(250px, 0.34fr) !important;
          column-gap: 12px !important;
        }
      }

      @media (max-width: 960px) {
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
          height: auto !important;
        }

        .${LAYOUT_CLASS}
        #us-sign-design-bottom-grid
        > .us-sign-description-panel {
          margin-top: 0 !important;
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

    parent.classList.remove("us-sign-design-v42-layout");
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
