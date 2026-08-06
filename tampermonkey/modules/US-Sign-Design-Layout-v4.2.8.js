(function () {
  "use strict";

  const STYLE_ID = "us-sign-design-v428-layout-style";
  const LAYOUT_CLASS = "us-sign-design-v428-layout";
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
    "us-sign-design-v426-layout-style",
    "us-sign-design-v427-layout-style"
  ];

  const OLD_LAYOUT_CLASSES = [
    "us-sign-design-v42-layout",
    "us-sign-design-v421-layout",
    "us-sign-design-v422-layout",
    "us-sign-design-v423-layout",
    "us-sign-design-v424-layout",
    "us-sign-design-v425-layout",
    "us-sign-design-v426-layout",
    "us-sign-design-v427-layout"
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
        color-scheme: dark !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .us-sign-designs-panel,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .us-sign-files-panel {
        box-sizing: border-box !important;
        display: flex !important;
        flex: 1 1 0 !important;
        flex-direction: column !important;
        width: 100% !important;
        min-width: 0 !important;
        min-height: 0 !important;
        max-height: calc((var(--us-sign-left-stack-height, 220px) - 8px) / 2) !important;
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
        flex: 0 0 30px !important;
        align-items: center !important;
        min-height: 30px !important;
        height: 30px !important;
        padding: 3px 7px !important;
        gap: 6px !important;
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
        line-height: 1 !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .us-sign-compact-text-action {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 42px !important;
        width: auto !important;
        min-height: 0 !important;
        height: 23px !important;
        padding: 0 7px !important;
        margin: 0 !important;
        border-radius: 6px !important;
        font-size: 9px !important;
        line-height: 21px !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .us-sign-compact-icon-action {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex: 0 0 22px !important;
        min-width: 22px !important;
        width: 22px !important;
        min-height: 0 !important;
        height: 22px !important;
        padding: 0 !important;
        margin: 0 !important;
        border-radius: 6px !important;
        font-size: 10px !important;
        line-height: 20px !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body {
        flex: 1 1 auto !important;
        min-width: 0 !important;
        min-height: 0 !important;
        padding: 3px 5px !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        overscroll-behavior: contain !important;
        scrollbar-gutter: stable !important;
        scrollbar-width: thin !important;
        scrollbar-color: #625746 #17191d !important;
        color-scheme: dark !important;
      }

      .${LAYOUT_CLASS}
      .us-sign-scroll-region {
        scrollbar-width: thin !important;
        scrollbar-color: #625746 #17191d !important;
        color-scheme: dark !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body::-webkit-scrollbar,
      .${LAYOUT_CLASS}
      .us-sign-scroll-region::-webkit-scrollbar {
        width: 6px !important;
        height: 6px !important;
        background: #17191d !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body::-webkit-scrollbar-track,
      .${LAYOUT_CLASS}
      .us-sign-scroll-region::-webkit-scrollbar-track {
        background: #17191d !important;
        border-radius: 999px !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body::-webkit-scrollbar-thumb,
      .${LAYOUT_CLASS}
      .us-sign-scroll-region::-webkit-scrollbar-thumb {
        min-height: 24px !important;
        background: #625746 !important;
        border: 1px solid #17191d !important;
        border-radius: 999px !important;
        background-clip: padding-box !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body::-webkit-scrollbar-thumb:hover,
      .${LAYOUT_CLASS}
      .us-sign-scroll-region::-webkit-scrollbar-thumb:hover {
        background: #7a6c57 !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body::-webkit-scrollbar-button,
      .${LAYOUT_CLASS}
      .us-sign-scroll-region::-webkit-scrollbar-button {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      > .panel
      > .panel-body::-webkit-scrollbar-corner,
      .${LAYOUT_CLASS}
      .us-sign-scroll-region::-webkit-scrollbar-corner {
        background: #17191d !important;
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
      tbody tr {
        min-height: 22px !important;
        height: 22px !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      td,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      th,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .list-group-item,
      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .us-sign-auto-trim {
        min-width: 0 !important;
        max-width: 100% !important;
        min-height: 0 !important;
        height: 22px !important;
        padding: 2px 5px !important;
        overflow: hidden !important;
        color: inherit !important;
        font-size: 9px !important;
        line-height: 18px !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        word-break: normal !important;
        overflow-wrap: normal !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .us-sign-file-row {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) 22px !important;
        align-items: center !important;
        gap: 5px !important;
        min-width: 0 !important;
        min-height: 26px !important;
        height: 26px !important;
        padding: 2px 4px !important;
        overflow: hidden !important;
      }

      .${LAYOUT_CLASS}
      > #${IDS.rightStack}
      .us-sign-file-row
      > :not(button):not(.btn) {
        min-width: 0 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
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
          flex: 0 0 auto !important;
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

  function cleanText(element) {
    return String(element?.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function decorateButtons(rightStack) {
    const buttons = rightStack.querySelectorAll(
      ".panel-heading button, .panel-heading .btn, .panel-heading a.btn, .panel-body button, .panel-body .btn"
    );

    for (const button of buttons) {
      const label = cleanText(button);
      const aria = String(button.getAttribute("aria-label") || "").trim();
      const compactIcon = /^[+\-−×]$/.test(label) || /^(add|remove|delete)$/i.test(aria);

      button.classList.toggle("us-sign-compact-icon-action", compactIcon);
      button.classList.toggle("us-sign-compact-text-action", !compactIcon);
    }
  }

  function addTrimTargets(rightStack) {
    const selectors = [
      "td",
      "th",
      ".list-group-item",
      ".panel-body a:not(.btn)",
      ".panel-body li",
      ".panel-body [class*='name' i]",
      ".panel-body [class*='file' i]",
      ".panel-body [class*='design' i]"
    ].join(",");

    for (const element of rightStack.querySelectorAll(selectors)) {
      if (
        element.matches("button, .btn, input, select, textarea") ||
        element.querySelector("button, .btn, input, select, textarea")
      ) {
        continue;
      }

      const fullText = cleanText(element);
      if (!fullText) continue;

      element.classList.add("us-sign-auto-trim");
      element.setAttribute("title", fullText);
    }
  }

  function markScrollRegions(rightStack) {
    const candidates = rightStack.querySelectorAll(
      ".panel-body, .table-responsive, .list-group, ul, ol, [style*='overflow' i]"
    );

    for (const element of candidates) {
      element.classList.add("us-sign-scroll-region");
    }
  }

  function markFileRows(rightStack) {
    const filesPanel = rightStack.querySelector(".us-sign-files-panel");
    const body = filesPanel?.querySelector(":scope > .panel-body");
    if (!body) return;

    const candidates = body.querySelectorAll(
      ":scope > .list-group-item, :scope > li, :scope > div, .list-group-item"
    );

    for (const row of candidates) {
      const action = row.querySelector("button, .btn");
      const text = cleanText(row);
      if (!action || !text) continue;

      row.classList.add("us-sign-file-row");
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

    decorateButtons(rightStack);
    addTrimTargets(rightStack);
    markScrollRegions(rightStack);
    markFileRows(rightStack);
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
