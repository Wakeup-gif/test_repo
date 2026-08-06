// ==UserScript==
// @name         US Sign - Design Job Tools
// @namespace    us-sign-local-tools
// @version      4.2.4
// @description  Stable Design workspace with a true nested top row and aligned Designs, Files, and Job Overview columns.
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

  const STYLE_ID = "us-sign-design-v424-layout-style";
  const LAYOUT_CLASS = "us-sign-design-v424-layout";
  const TOP_ROW_ID = "us-sign-design-top-row";
  const LEFT_STACK_ID = "us-sign-design-left-stack";

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
    "us-sign-design-v422-layout-style",
    "us-sign-design-v423-layout-style"
  ];

  const OLD_LAYOUT_CLASSES = [
    "us-sign-design-v42-layout",
    "us-sign-design-v421-layout",
    "us-sign-design-v422-layout",
    "us-sign-design-v423-layout"
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
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
      }

      .${LAYOUT_CLASS} > #${TOP_ROW_ID} {
        display: grid !important;
        grid-template-columns:
          minmax(0, 6.3fr)
          minmax(270px, 1.7fr) !important;
        column-gap: 14px !important;
        align-items: stretch !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .${LAYOUT_CLASS} #${LEFT_STACK_ID} {
        display: flex !important;
        flex-direction: column !important;
        align-self: stretch !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .${LAYOUT_CLASS} #${LEFT_STACK_ID} > #${IDS.actionbar},
      .${LAYOUT_CLASS} #${LEFT_STACK_ID} > #${IDS.overview},
      .${LAYOUT_CLASS} #${LEFT_STACK_ID} > #${IDS.summary} {
        flex: 0 0 auto !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
      }

      .${LAYOUT_CLASS} > #${TOP_ROW_ID} > #${IDS.rightStack} {
        display: grid !important;
        grid-template-rows: auto minmax(70px, 1fr) !important;
        align-self: stretch !important;
        gap: 12px !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        position: relative !important;
        inset: auto !important;
        z-index: 1 !important;
      }

      .${LAYOUT_CLASS}
      > #${TOP_ROW_ID}
      > #${IDS.rightStack}
      > .us-sign-designs-panel,
      .${LAYOUT_CLASS}
      > #${TOP_ROW_ID}
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
      > #${TOP_ROW_ID}
      > #${IDS.rightStack}
      > .us-sign-designs-panel {
        align-self: start !important;
        height: auto !important;
      }

      .${LAYOUT_CLASS}
      > #${TOP_ROW_ID}
      > #${IDS.rightStack}
      > .us-sign-files-panel {
        align-self: stretch !important;
        min-height: 70px !important;
        height: auto !important;
        margin-top: 0 !important;
      }

      .${LAYOUT_CLASS}
      > #${TOP_ROW_ID}
      > #${IDS.rightStack}
      > .panel
      > .panel-heading {
        min-height: 40px !important;
        padding: 7px 9px !important;
      }

      .${LAYOUT_CLASS}
      > #${TOP_ROW_ID}
      > #${IDS.rightStack}
      > .panel
      > .panel-body {
        min-width: 0 !important;
        padding: 8px 9px !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS} > .us-sign-description-panel {
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 16px 0 0 !important;
        position: relative !important;
        inset: auto !important;
        z-index: 0 !important;
        clear: both !important;
      }

      .${LAYOUT_CLASS} > #${IDS.bottomGrid} {
        display: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .${LAYOUT_CLASS}
      > #${TOP_ROW_ID}
      > #${IDS.rightStack}
      table,
      .${LAYOUT_CLASS}
      > #${TOP_ROW_ID}
      > #${IDS.rightStack}
      .table {
        width: 100% !important;
        table-layout: fixed !important;
      }

      .${LAYOUT_CLASS}
      > #${TOP_ROW_ID}
      > #${IDS.rightStack}
      td,
      .${LAYOUT_CLASS}
      > #${TOP_ROW_ID}
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
      > #${TOP_ROW_ID}
      > #${IDS.rightStack}
      td:first-child {
        width: 55% !important;
      }

      .${LAYOUT_CLASS}
      > #${TOP_ROW_ID}
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

      @media (max-width: 1220px) {
        .${LAYOUT_CLASS} > #${TOP_ROW_ID} {
          grid-template-columns:
            minmax(0, 1fr)
            minmax(250px, 0.34fr) !important;
          column-gap: 12px !important;
        }
      }

      @media (max-width: 960px) {
        .${LAYOUT_CLASS} > #${TOP_ROW_ID} {
          grid-template-columns: minmax(0, 1fr) !important;
          row-gap: 12px !important;
        }

        .${LAYOUT_CLASS}
        > #${TOP_ROW_ID}
        > #${IDS.rightStack} {
          grid-template-rows: auto auto !important;
        }

        .${LAYOUT_CLASS} > .us-sign-description-panel {
          margin-top: 12px !important;
        }
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function childrenMatch(parent, elements) {
    if (!parent) return false;
    const children = Array.from(parent.children);
    return (
      children.length === elements.length &&
      elements.every((element, index) => children[index] === element)
    );
  }

  function normalizeStructure() {
    installStyle();

    const actionbar = document.getElementById(IDS.actionbar);
    const overview = document.getElementById(IDS.overview);
    const summary = document.getElementById(IDS.summary);
    const bottomGrid = document.getElementById(IDS.bottomGrid);
    const rightStack = document.getElementById(IDS.rightStack);
    let topRow = document.getElementById(TOP_ROW_ID);
    let leftStack = document.getElementById(LEFT_STACK_ID);

    if (!actionbar || !overview || !summary || !rightStack) {
      return false;
    }

    const descriptionPanel =
      bottomGrid?.querySelector(":scope > .us-sign-description-panel") ||
      document.querySelector(".us-sign-description-panel");

    if (!descriptionPanel) return false;

    const parent =
      topRow?.parentElement ||
      bottomGrid?.parentElement ||
      descriptionPanel.parentElement ||
      actionbar.parentElement;

    if (!parent) return false;

    for (const className of OLD_LAYOUT_CLASSES) {
      parent.classList.remove(className);
    }
    parent.classList.add(LAYOUT_CLASS);

    if (!topRow) {
      topRow = document.createElement("section");
      topRow.id = TOP_ROW_ID;
    }

    if (!leftStack) {
      leftStack = document.createElement("div");
      leftStack.id = LEFT_STACK_ID;
    }

    if (!childrenMatch(leftStack, [actionbar, overview, summary])) {
      leftStack.append(actionbar, overview, summary);
    }

    if (!childrenMatch(topRow, [leftStack, rightStack])) {
      topRow.append(leftStack, rightStack);
    }

    if (descriptionPanel.parentElement !== parent) {
      parent.appendChild(descriptionPanel);
    }

    if (topRow.parentElement !== parent) {
      parent.insertBefore(topRow, descriptionPanel);
    } else if (topRow.nextElementSibling !== descriptionPanel) {
      parent.insertBefore(topRow, descriptionPanel);
    }

    if (bottomGrid && bottomGrid.parentElement === parent) {
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
