// ==UserScript==
// @name         US Sign - Design Job Tools
// @namespace    us-sign-local-tools
// @version      4.2.2
// @description  Stable Design workspace with a true two-row layout, compact side panels, and corrected spacing.
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

  const STYLE_ID = "us-sign-design-v422-layout-style";
  const LAYOUT_CLASS = "us-sign-design-v422-layout";
  const OLD_STYLE_IDS = [
    "us-sign-design-v42-layout-style",
    "us-sign-design-v421-layout-style"
  ];
  const OLD_LAYOUT_CLASSES = [
    "us-sign-design-v42-layout",
    "us-sign-design-v421-layout"
  ];

  function installStyle() {
    for (const id of OLD_STYLE_IDS) {
      document.getElementById(id)?.remove();
    }

    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${LAYOUT_CLASS} {
        display: grid !important;
        grid-template-columns:
          minmax(0, 1fr)
          minmax(270px, 0.24fr) !important;
        grid-template-rows: auto auto auto auto !important;
        column-gap: 14px !important;
        row-gap: 0 !important;
        align-items: start !important;
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
        width: 100% !important;
        margin: 0 !important;
      }

      .${LAYOUT_CLASS} > #us-sign-design-summary {
        grid-column: 1 !important;
        grid-row: 3 !important;
        width: 100% !important;
        margin: 0 !important;
      }

      .${LAYOUT_CLASS} > #us-sign-design-right-stack {
        grid-column: 2 !important;
        grid-row: 1 / span 3 !important;
        display: flex !important;
        flex-direction: column !important;
        align-self: start !important;
        gap: 14px !important;
        width: 100% !important;
        min-width: 0 !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .${LAYOUT_CLASS}
      > #us-sign-design-right-stack
      > .us-sign-designs-panel,
      .${LAYOUT_CLASS}
      > #us-sign-design-right-stack
      > .us-sign-files-panel {
        box-sizing: border-box !important;
        flex: 0 0 auto !important;
        width: 100% !important;
        min-width: 0 !important;
        height: auto !important;
        min-height: 0 !important;
        margin: 0 !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS}
      > #us-sign-design-right-stack
      > .us-sign-files-panel {
        min-height: 72px !important;
      }

      .${LAYOUT_CLASS}
      > #us-sign-design-right-stack
      > .panel
      > .panel-heading {
        min-height: 40px !important;
        padding: 7px 9px !important;
      }

      .${LAYOUT_CLASS}
      > #us-sign-design-right-stack
      > .panel
      > .panel-body {
        min-width: 0 !important;
        min-height: 34px !important;
        padding: 8px 9px !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS} > .us-sign-description-panel {
        grid-column: 1 / -1 !important;
        grid-row: 4 !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 16px 0 0 !important;
        clear: both !important;
      }

      .${LAYOUT_CLASS} > #us-sign-design-bottom-grid.us-sign-v422-shell {
        display: none !important;
      }

      .${LAYOUT_CLASS}
      > #us-sign-design-right-stack
      table,
      .${LAYOUT_CLASS}
      > #us-sign-design-right-stack
      .table {
        width: 100% !important;
        table-layout: fixed !important;
      }

      .${LAYOUT_CLASS}
      > #us-sign-design-right-stack
      td,
      .${LAYOUT_CLASS}
      > #us-sign-design-right-stack
      th {
        min-width: 0 !important;
        padding: 5px 7px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .${LAYOUT_CLASS}
      > #us-sign-design-right-stack
      td:first-child {
        width: 56% !important;
      }

      .${LAYOUT_CLASS}
      > #us-sign-design-right-stack
      td:last-child {
        width: 44% !important;
        text-align: right !important;
      }

      .${LAYOUT_CLASS}
      #us-sign-job-overview
      .us-sign-overview-value {
        display: -webkit-box !important;
        overflow: hidden !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        -webkit-box-orient: vertical !important;
        -webkit-line-clamp: 2 !important;
        line-height: 1.25 !important;
      }

      @media (max-width: 1220px) {
        .${LAYOUT_CLASS} {
          grid-template-columns:
            minmax(0, 1fr)
            minmax(250px, 0.31fr) !important;
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
        .${LAYOUT_CLASS} > #us-sign-design-right-stack,
        .${LAYOUT_CLASS} > .us-sign-description-panel {
          grid-column: 1 !important;
          grid-row: auto !important;
        }

        .${LAYOUT_CLASS} > .us-sign-description-panel {
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
    const description =
      bottomGrid?.querySelector(":scope > .us-sign-description-panel") ||
      document.querySelector(".us-sign-description-panel");

    if (!overview || !bottomGrid || !rightStack || !description) return false;

    const parent = overview.parentElement;
    if (!parent) return false;

    if (actionbar && actionbar.parentElement !== parent) return false;
    if (summary && summary.parentElement !== parent) return false;
    if (bottomGrid.parentElement !== parent) return false;

    for (const className of OLD_LAYOUT_CLASSES) {
      parent.classList.remove(className);
    }
    parent.classList.add(LAYOUT_CLASS);

    if (rightStack.parentElement !== parent) {
      parent.insertBefore(rightStack, bottomGrid);
    }

    if (description.parentElement !== parent) {
      parent.insertBefore(description, bottomGrid);
    }

    bottomGrid.classList.add("us-sign-v422-shell");
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
