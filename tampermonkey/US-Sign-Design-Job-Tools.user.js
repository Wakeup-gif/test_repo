// ==UserScript==
// @name         US Sign - Design Job Tools
// @namespace    us-sign-local-tools
// @version      4.2.5
// @description  Stable Design workspace with measured column alignment, compact side panels, and consistent spacing.
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

  const STYLE_ID = "us-sign-design-v425-layout-style";
  const LAYOUT_CLASS = "us-sign-design-v425-layout";
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
    "us-sign-design-v423-layout-style",
    "us-sign-design-v424-layout-style"
  ];

  const OLD_LAYOUT_CLASSES = [
    "us-sign-design-v42-layout",
    "us-sign-design-v421-layout",
    "us-sign-design-v422-layout",
    "us-sign-design-v423-layout",
    "us-sign-design-v424-layout"
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
          minmax(280px, 22%) !important;
        grid-template-areas:
          "actions side"
          "overview side"
          "summary side"
          ". ."
          "description description" !important;
        grid-template-rows:
          auto
          auto
          auto
          16px
          auto !important;
        column-gap: 16px !important;
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
        grid-area: actions !important;
        width: 100% !important;
        margin: 0 !important;
      }

      .${LAYOUT_CLASS} > #${IDS.overview} {
        grid-area: overview !important;
        width: 100% !important;
        margin: 0 !important;
      }

      .${LAYOUT_CLASS} > #${IDS.summary} {
        grid-area: summary !important;
        width: 100% !important;
        margin: 0 !important;
      }

      .${LAYOUT_CLASS} > #${IDS.rightStack} {
        grid-area: side !important;
        display: flex !important;
        flex-direction: column !important;
        align-self: stretch !important;
        gap: 12px !important;
        width: 100% !important;
        min-width: 0 !important;
        min-height: var(--us-sign-left-stack-height, 0px) !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        position: relative !important;
        inset: auto !important;
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
        margin: 0 !important;
        position: relative !important;
        inset: auto !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .us-sign-designs-panel {
        flex: 0 0 auto !important;
        min-height: 0 !important;
        height: auto !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .us-sign-files-panel {
        display: flex !important;
        flex: 1 1 74px !important;
        flex-direction: column !important;
        min-height: 74px !important;
        height: auto !important;
        margin-top: 0 !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .us-sign-files-panel
      > .panel-body {
        flex: 1 1 auto !important;
        min-height: 28px !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-heading {
        min-height: 40px !important;
        padding: 7px 10px !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body {
        min-width: 0 !important;
        padding: 8px 10px !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS} > .us-sign-description-panel {
        grid-area: description !important;
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        position: relative !important;
        inset: auto !important;
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
        width: 58% !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      td:last-child {
        width: 42% !important;
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
        .${LAYOUT_CLASS} {
          grid-template-columns:
            minmax(0, 1fr)
            minmax(250px, 24%) !important;
          column-gap: 14px !important;
        }
      }

      @media (max-width: 960px) {
        .${LAYOUT_CLASS} {
          grid-template-columns: minmax(0, 1fr) !important;
          grid-template-areas:
            "actions"
            "overview"
            "summary"
            "side"
            "description" !important;
          grid-template-rows: auto !important;
          row-gap: 12px !important;
        }

        .${LAYOUT_CLASS} > #${IDS.rightStack} {
          min-height: 0 !important;
        }
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function unwrapLegacyLayout() {
    const topRow = document.getElementById(TOP_ROW_ID);
    const leftStack = document.getElementById(LEFT_STACK_ID);

    if (!topRow) return;

    const parent = topRow.parentElement;
    if (!parent) return;

    const description = parent.querySelector(":scope > .us-sign-description-panel");
    const actionbar = document.getElementById(IDS.actionbar);
    const overview = document.getElementById(IDS.overview);
    const summary = document.getElementById(IDS.summary);
    const rightStack = document.getElementById(IDS.rightStack);

    const anchor = description || topRow.nextSibling;

    for (const element of [actionbar, overview, summary, rightStack]) {
      if (element) parent.insertBefore(element, anchor);
    }

    leftStack?.remove();
    topRow.remove();
  }

  function normalizeStructure() {
    installStyle();
    unwrapLegacyLayout();

    const actionbar = document.getElementById(IDS.actionbar);
    const overview = document.getElementById(IDS.overview);
    const summary = document.getElementById(IDS.summary);
    const bottomGrid = document.getElementById(IDS.bottomGrid);
    const rightStack = document.getElementById(IDS.rightStack);

    if (!actionbar || !overview || !summary || !rightStack) {
      return false;
    }

    const descriptionPanel =
      bottomGrid?.querySelector(":scope > .us-sign-description-panel") ||
      document.querySelector(".us-sign-description-panel");

    if (!descriptionPanel) return false;

    const parent =
      bottomGrid?.parentElement ||
      descriptionPanel.parentElement ||
      actionbar.parentElement;

    if (!parent) return false;

    for (const className of OLD_LAYOUT_CLASSES) {
      parent.classList.remove(className);
    }
    parent.classList.add(LAYOUT_CLASS);

    for (const element of [actionbar, overview, summary, rightStack, descriptionPanel]) {
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

    const leftHeight =
      actionbar.getBoundingClientRect().height +
      overview.getBoundingClientRect().height +
      summary.getBoundingClientRect().height;

    if (leftHeight > 0) {
      parent.style.setProperty(
        "--us-sign-left-stack-height",
        `${Math.ceil(leftHeight)}px`
      );
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
  window.addEventListener("resize", scheduleNormalize, { passive: true });

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
