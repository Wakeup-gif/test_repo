// ==UserScript==
// @name         US Sign - Design Job Tools
// @namespace    us-sign-local-tools
// @version      4.2.3
// @description  Stable Design workspace with corrected top-row alignment, panel spacing, and non-overlapping Description placement.
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

  const STYLE_ID = "us-sign-design-v423-layout-style";
  const LAYOUT_CLASS = "us-sign-design-v423-layout";

  const IDS = {
    actionbar: "us-sign-design-actionbar",
    overview: "us-sign-job-overview",
    summary: "us-sign-design-summary",
    bottomGrid: "us-sign-design-bottom-grid",
    rightStack: "us-sign-design-right-stack"
  };

  const OLD_STYLE_IDS = [
    "us-sign-design-v42-layout-style",
    "us-sign-design-v421-layout-style",
    "us-sign-design-v422-layout-style"
  ];

  const OLD_LAYOUT_CLASSES = [
    "us-sign-design-v42-layout",
    "us-sign-design-v421-layout",
    "us-sign-design-v422-layout"
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
          minmax(0, 6.3fr)
          minmax(270px, 1.7fr) !important;
        grid-template-rows:
          auto
          auto
          auto
          16px
          auto !important;
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

      .${LAYOUT_CLASS} > #${IDS.actionbar} {
        grid-column: 1 !important;
        grid-row: 1 !important;
        width: 100% !important;
        margin: 0 !important;
      }

      .${LAYOUT_CLASS} > #${IDS.overview} {
        grid-column: 1 !important;
        grid-row: 2 !important;
        align-self: stretch !important;
        width: 100% !important;
        margin: 0 !important;
      }

      .${LAYOUT_CLASS} > #${IDS.summary} {
        grid-column: 1 !important;
        grid-row: 3 !important;
        align-self: stretch !important;
        width: 100% !important;
        margin: 0 !important;
      }

      .${LAYOUT_CLASS} > #${IDS.rightStack} {
        grid-column: 2 !important;
        grid-row: 1 / 4 !important;
        display: grid !important;
        grid-template-rows:
          auto
          minmax(70px, 1fr) !important;
        align-self: stretch !important;
        align-content: stretch !important;
        gap: 12px !important;
        width: 100% !important;
        min-width: 0 !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        position: relative !important;
        z-index: 1 !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .us-sign-designs-panel,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .us-sign-files-panel {
        box-sizing: border-box !important;
        width: 100% !important;
        min-width: 0 !important;
        min-height: 0 !important;
        margin: 0 !important;
        position: relative !important;
        inset: auto !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .us-sign-designs-panel {
        align-self: start !important;
        height: auto !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .us-sign-files-panel {
        align-self: stretch !important;
        min-height: 70px !important;
        height: 100% !important;
        margin-top: 0 !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-heading {
        min-height: 40px !important;
        padding: 7px 9px !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body {
        min-width: 0 !important;
        padding: 8px 9px !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS}
      > .us-sign-description-panel {
        grid-column: 1 / -1 !important;
        grid-row: 5 !important;
        align-self: start !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        position: relative !important;
        z-index: 0 !important;
        clear: both !important;
      }

      .${LAYOUT_CLASS} > #${IDS.bottomGrid} {
        display: contents !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      table,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .table {
        width: 100% !important;
        table-layout: fixed !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      td,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
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
      > #${IDS.rightStack}
      td:first-child {
        width: 55% !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      td:last-child {
        width: 45% !important;
        text-align: right !important;
      }

      .${LAYOUT_CLASS}
      #${IDS.overview}
      .us-sign-overview-value {
        min-width: 0 !important;
        word-break: normal !important;
        overflow-wrap: normal !important;
      }

      .${LAYOUT_CLASS}
      #${IDS.overview}
      .us-sign-overview-field {
        min-width: 0 !important;
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

        .${LAYOUT_CLASS} > #${IDS.actionbar},
        .${LAYOUT_CLASS} > #${IDS.overview},
        .${LAYOUT_CLASS} > #${IDS.summary},
        .${LAYOUT_CLASS} > #${IDS.rightStack},
        .${LAYOUT_CLASS} > .us-sign-description-panel {
          grid-column: 1 !important;
          grid-row: auto !important;
        }

        .${LAYOUT_CLASS} > #${IDS.rightStack} {
          grid-template-rows: auto auto !important;
          height: auto !important;
        }

        .${LAYOUT_CLASS}
        > #${IDS.rightStack}
        > .us-sign-files-panel {
          height: auto !important;
        }
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function normalizeStructure() {
    installStyle();

    const actionbar = document.getElementById(IDS.actionbar);
    const overview = document.getElementById(IDS.overview);
    const summary = document.getElementById(IDS.summary);
    const bottomGrid = document.getElementById(IDS.bottomGrid);
    const rightStack = document.getElementById(IDS.rightStack);

    if (!actionbar || !overview || !summary || !rightStack) {
      return false;
    }

    const parent = overview.parentElement;
    if (!parent) return false;

    const descriptionPanel =
      document.querySelector(
        `#${IDS.bottomGrid} > .us-sign-description-panel`
      ) ||
      parent.querySelector(
        ":scope > .us-sign-description-panel"
      );

    if (!descriptionPanel) return false;

    for (const className of OLD_LAYOUT_CLASSES) {
      parent.classList.remove(className);
    }

    parent.classList.add(LAYOUT_CLASS);

    const ordered = [
      actionbar,
      overview,
      summary,
      rightStack,
      descriptionPanel
    ];

    for (const element of ordered) {
      if (element.parentElement !== parent) {
        parent.appendChild(element);
      }
    }

    if (
      bottomGrid &&
      bottomGrid.parentElement === parent &&
      bottomGrid.childElementCount === 0
    ) {
      bottomGrid.remove();
    }

    return true;
  }

  let scheduled = false;

  function scheduleNormalize() {
    if (scheduled) return;
    scheduled = true;

    window.requestAnimationFrame(() => {
      scheduled = false;
      normalizeStructure();
    });
  }

  scheduleNormalize();
  window.setTimeout(scheduleNormalize, 250);
  window.setTimeout(scheduleNormalize, 900);
  window.addEventListener("pageshow", scheduleNormalize);

  const observer = new MutationObserver((mutations) => {
    if (
      mutations.some(
        (mutation) =>
          mutation.addedNodes.length ||
          mutation.removedNodes.length
      )
    ) {
      scheduleNormalize();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
