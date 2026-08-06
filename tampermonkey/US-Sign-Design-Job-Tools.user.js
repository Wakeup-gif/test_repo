// ==UserScript==
// @name         US Sign - Design Job Tools
// @namespace    us-sign-local-tools
// @version      4.2.7
// @description  Stable Design workspace with measured alignment, compact three-row side panels, themed scrollbars, and reliable text trimming.
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

  const STYLE_ID = "us-sign-design-v427-layout-style";
  const LAYOUT_CLASS = "us-sign-design-v427-layout";
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
    "us-sign-design-v424-layout-style",
    "us-sign-design-v425-layout-style",
    "us-sign-design-v426-layout-style"
  ];

  const OLD_LAYOUT_CLASSES = [
    "us-sign-design-v42-layout",
    "us-sign-design-v421-layout",
    "us-sign-design-v422-layout",
    "us-sign-design-v423-layout",
    "us-sign-design-v424-layout",
    "us-sign-design-v425-layout",
    "us-sign-design-v426-layout"
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
        --us-scroll-track: rgba(255, 255, 255, 0.035);
        --us-scroll-thumb: rgba(127, 146, 166, 0.46);
        --us-scroll-thumb-hover: rgba(154, 171, 188, 0.68);

        grid-area: side !important;
        display: grid !important;
        grid-template-rows: minmax(0, 1fr) minmax(0, 1fr) !important;
        align-self: stretch !important;
        gap: 8px !important;
        width: 100% !important;
        min-width: 0 !important;
        min-height: 0 !important;
        height: var(--us-sign-left-stack-height, auto) !important;
        max-height: var(--us-sign-left-stack-height, none) !important;
        margin: 0 !important;
        padding: 0 !important;
        position: relative !important;
        inset: auto !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .us-sign-designs-panel,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .us-sign-files-panel {
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        min-width: 0 !important;
        min-height: 0 !important;
        height: 100% !important;
        max-height: 100% !important;
        margin: 0 !important;
        position: relative !important;
        inset: auto !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-heading {
        display: flex !important;
        flex: 0 0 32px !important;
        align-items: center !important;
        justify-content: space-between !important;
        min-height: 32px !important;
        height: 32px !important;
        padding: 4px 8px !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-heading,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-heading * {
        font-size: 10px !important;
        line-height: 1.15 !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-heading .btn,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-heading button {
        min-width: 28px !important;
        min-height: 26px !important;
        height: 26px !important;
        padding: 0 8px !important;
        font-size: 9px !important;
        line-height: 1 !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body {
        flex: 1 1 auto !important;
        min-width: 0 !important;
        min-height: 0 !important;
        width: calc(100% - 8px) !important;
        margin: 4px 4px 5px !important;
        padding: 0 2px 0 0 !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        overscroll-behavior: contain !important;
        border-radius: 8px !important;
        scrollbar-gutter: stable !important;
        scrollbar-width: thin !important;
        scrollbar-color: var(--us-scroll-thumb) var(--us-scroll-track) !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body::-webkit-scrollbar {
        width: 8px !important;
        height: 8px !important;
        background: transparent !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body::-webkit-scrollbar-track {
        margin: 3px 0 !important;
        background: var(--us-scroll-track) !important;
        border-radius: 999px !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body::-webkit-scrollbar-thumb {
        min-height: 24px !important;
        background: var(--us-scroll-thumb) !important;
        border: 2px solid rgba(14, 18, 23, 0.94) !important;
        border-radius: 999px !important;
        background-clip: padding-box !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body::-webkit-scrollbar-thumb:hover {
        background: var(--us-scroll-thumb-hover) !important;
        background-clip: padding-box !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body::-webkit-scrollbar-button {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body::-webkit-scrollbar-corner {
        background: transparent !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      table,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .table {
        width: 100% !important;
        margin: 0 !important;
        table-layout: fixed !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      tr {
        height: 24px !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      td,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      th {
        min-width: 0 !important;
        max-width: 100% !important;
        height: 24px !important;
        padding: 3px 6px !important;
        overflow: hidden !important;
        font-size: 9.5px !important;
        line-height: 1.15 !important;
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
      > #${IDS.rightStack}
      .list-group,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      ul {
        margin: 0 !important;
        padding: 0 !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .us-sign-compact-file-row,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .list-group-item {
        box-sizing: border-box !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) auto !important;
        align-items: center !important;
        gap: 6px !important;
        width: 100% !important;
        min-width: 0 !important;
        min-height: 28px !important;
        margin: 0 0 4px !important;
        padding: 3px 5px 3px 7px !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .us-sign-compact-file-row:last-child,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .list-group-item:last-child {
        margin-bottom: 0 !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .us-sign-trim-text,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .us-sign-auto-trim {
        display: block !important;
        min-width: 0 !important;
        max-width: 100% !important;
        overflow: hidden !important;
        font-size: 9.5px !important;
        line-height: 1.15 !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        word-break: normal !important;
        overflow-wrap: normal !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .us-sign-compact-file-row
      :is(button, .btn),
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .list-group-item
      :is(button, .btn) {
        grid-column: 2 !important;
        min-width: 28px !important;
        width: 28px !important;
        min-height: 26px !important;
        height: 26px !important;
        margin: 0 !important;
        padding: 0 !important;
        font-size: 10px !important;
        line-height: 1 !important;
      }

      .${LAYOUT_CLASS}
      #${IDS.overview}
      .us-sign-overview-value {
        min-width: 0 !important;
        word-break: normal !important;
        overflow-wrap: normal !important;
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
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }

        .${LAYOUT_CLASS}
        > #${IDS.rightStack}
        > .us-sign-designs-panel,
        .${LAYOUT_CLASS}
        > #${IDS.rightStack}
        > .us-sign-files-panel {
          height: 150px !important;
          max-height: 150px !important;
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

  function trimElement(element) {
    if (!element || element.matches("button, .btn, input, select, textarea")) return;

    const fullText = String(element.textContent || "")
      .replace(/\s+/g, " ")
      .trim();

    if (!fullText) return;

    element.classList.add("us-sign-auto-trim");
    element.setAttribute("title", fullText);
  }

  function wrapDirectTextNodes(row) {
    for (const node of Array.from(row.childNodes)) {
      if (node.nodeType !== Node.TEXT_NODE) continue;

      const fullText = String(node.textContent || "")
        .replace(/\s+/g, " ")
        .trim();

      if (!fullText) continue;

      const span = document.createElement("span");
      span.className = "us-sign-trim-text";
      span.textContent = fullText;
      span.title = fullText;
      node.replaceWith(span);
    }
  }

  function decorateRightStack(rightStack) {
    if (!rightStack) return;

    for (const cell of rightStack.querySelectorAll("td, th")) {
      trimElement(cell);
    }

    const filesPanel = rightStack.querySelector(".us-sign-files-panel");
    const filesBody = filesPanel?.querySelector(":scope > .panel-body");

    if (filesBody) {
      const buttons = filesBody.querySelectorAll("button, .btn");

      for (const button of buttons) {
        const row =
          button.closest("li, .list-group-item, [class*='file-row' i], [class*='file-item' i]") ||
          button.parentElement;

        if (!row || row === filesBody || !filesBody.contains(row)) continue;

        row.classList.add("us-sign-compact-file-row");
        wrapDirectTextNodes(row);

        for (const child of Array.from(row.children)) {
          if (child === button || child.matches("button, .btn") || child.querySelector("button, .btn")) {
            continue;
          }
          trimElement(child);
        }
      }
    }

    const leafSelectors = [
      ".panel-body a:not(.btn)",
      ".panel-body li > :not(button):not(.btn)",
      ".panel-body [class*='name' i]",
      ".panel-body [class*='file' i]",
      ".panel-body [class*='design' i]"
    ].join(",");

    for (const element of rightStack.querySelectorAll(leafSelectors)) {
      if (element.querySelector("button, .btn, input, select, textarea")) continue;
      trimElement(element);
    }
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

    decorateRightStack(rightStack);
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
