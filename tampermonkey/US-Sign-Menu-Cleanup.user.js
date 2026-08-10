// ==UserScript==
// @name         US Sign Menu Cleanup and Reorder
// @namespace    us-sign-full-modules
// @version      2.7.0
// @description  Keeps the cleaned sidebar and project rail stable, reorders SquareCoil project links, and normalizes project-rail controls.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        none
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Menu-Cleanup.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Menu-Cleanup.user.js
// ==/UserScript==

(function () {
  "use strict";

  const SIDEBAR_HIDDEN_LINKS = new Set([
    "LEADS",
    "QUEUES",
    "PURCHASING",
    "SCHEDULE",
    "INSTALL CALENDAR",
    "CONTACTS",
    "ESTIMATES",
    "SHOP ORDER",
    "COST TO DATE",
    "PURCHASE ORDERS",
    "MATERIALS",
    "MACHINE TIME",
    "HELP CENTER"
  ]);

  const PROJECT_HIDDEN_LINKS = new Set([
    "CONTACTS",
    "ESTIMATES",
    "SHOP ORDER",
    "COST TO DATE",
    "PURCHASE ORDERS",
    "MATERIALS",
    "MACHINE TIME"
  ]);

  const PROJECT_LINKS = new Set([
    "DESIGN",
    "SCOPE OF WORK",
    "PROJECT STATUS",
    "TASKS",
    "DOCUMENTS",
    "PHOTOS",
    "PRODUCTION FILES"
  ]);

  const PRIMARY_PROJECT_ORDER = [
    "DESIGN",
    "SCOPE OF WORK",
    "PROJECT STATUS",
    "TASKS"
  ];

  const RAIL_ACTION_LABELS = new Set([
    "EDIT",
    "LIST",
    "DUPLICATE"
  ]);

  const HIDDEN_CLASS = "us-sign-menu-link-hidden";
  const ROW_HIDDEN_CLASS = "us-sign-menu-row-hidden";
  const RAIL_ACTION_CLASS = "us-sign-rail-action";
  const RAIL_NAV_CLASS = "us-sign-rail-nav";
  const RAIL_COUNTER_CLASS = "us-sign-rail-counter";
  const RAIL_CLOCK_CLASS = "us-sign-rail-clock";

  let scheduled = false;
  let applying = false;

  const style = document.createElement("style");
  style.id = "us-sign-menu-cleanup-style";
  style.textContent = `
    .${HIDDEN_CLASS},
    .${ROW_HIDDEN_CLASS} {
      display: none !important;
    }

    #pmlt a:not(.${HIDDEN_CLASS}) {
      pointer-events: auto !important;
      cursor: pointer !important;
    }

    /* ---------------------------------------------------------
       Project rail controls
       --------------------------------------------------------- */

    #pmlt .${RAIL_ACTION_CLASS},
    #pmlt .${RAIL_NAV_CLASS},
    #pmlt .${RAIL_COUNTER_CLASS},
    #pmlt .${RAIL_CLOCK_CLASS} {
      box-sizing: border-box !important;
      position: relative !important;
      inset: auto !important;
      float: none !important;
      transform: none !important;
      isolation: isolate !important;
      z-index: 3 !important;
      box-shadow: none !important;
      text-shadow: none !important;
      vertical-align: middle !important;
    }

    #pmlt .${RAIL_ACTION_CLASS}::before,
    #pmlt .${RAIL_ACTION_CLASS}::after,
    #pmlt .${RAIL_NAV_CLASS}::before,
    #pmlt .${RAIL_NAV_CLASS}::after,
    #pmlt .${RAIL_CLOCK_CLASS}::before,
    #pmlt .${RAIL_CLOCK_CLASS}::after {
      content: none !important;
      display: none !important;
    }

    #pmlt .${RAIL_ACTION_CLASS} {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: auto !important;
      min-width: 58px !important;
      height: 34px !important;
      min-height: 34px !important;
      margin: 0 5px 5px 0 !important;
      padding: 0 12px !important;
      color: #cfd6de !important;
      background: #22272e !important;
      background-image: none !important;
      border: 1px solid #404852 !important;
      border-radius: 7px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      line-height: 1 !important;
      letter-spacing: 0 !important;
      text-transform: none !important;
      overflow: hidden !important;
    }

    #pmlt .${RAIL_ACTION_CLASS}:hover,
    #pmlt .${RAIL_ACTION_CLASS}:focus-visible {
      color: #f4f6f8 !important;
      background: #2b3138 !important;
      border-color: #59636f !important;
      outline: none !important;
    }

    #pmlt .${RAIL_ACTION_CLASS}:active {
      color: #ffffff !important;
      background: #303740 !important;
      border-color: #687482 !important;
      transform: translateY(1px) !important;
    }

    #pmlt .${RAIL_NAV_CLASS} {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 20px !important;
      min-width: 20px !important;
      height: 24px !important;
      min-height: 24px !important;
      margin: 0 1px !important;
      padding: 0 !important;
      color: #aeb8c3 !important;
      background: transparent !important;
      background-image: none !important;
      border: 0 !important;
      border-radius: 5px !important;
      font-size: 16px !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      overflow: hidden !important;
    }

    #pmlt .${RAIL_NAV_CLASS}:hover,
    #pmlt .${RAIL_NAV_CLASS}:focus-visible {
      color: #ffffff !important;
      background: #272d34 !important;
      outline: none !important;
    }

    #pmlt .${RAIL_COUNTER_CLASS} {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: auto !important;
      min-width: 38px !important;
      height: 26px !important;
      min-height: 26px !important;
      margin: 0 3px !important;
      padding: 0 7px !important;
      color: #d8e0e8 !important;
      background: #2c3540 !important;
      background-image: none !important;
      border: 1px solid #465361 !important;
      border-radius: 5px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      line-height: 1 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
    }

    #pmlt .${RAIL_CLOCK_CLASS} {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      max-width: 190px !important;
      min-height: 40px !important;
      height: 40px !important;
      margin: 10px 0 12px !important;
      padding: 0 14px !important;
      color: #e7dcc7 !important;
      background: #302a20 !important;
      background-image: none !important;
      border: 1px solid #5a4a31 !important;
      border-radius: 7px !important;
      font-size: 13px !important;
      font-weight: 650 !important;
      line-height: 1 !important;
      overflow: hidden !important;
    }

    #pmlt .${RAIL_CLOCK_CLASS}:hover,
    #pmlt .${RAIL_CLOCK_CLASS}:focus-visible {
      color: #fff4df !important;
      background: #3a3124 !important;
      border-color: #715c3d !important;
      outline: none !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  const clean = (value) => String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  function labelFor(anchor) {
    const clone = anchor.cloneNode(true);
    clone.querySelectorAll(".badge, .label, small, sup").forEach((node) => node.remove());
    return clean(clone.textContent || clone.value);
  }

  function semanticRowFor(anchor, root) {
    const row = anchor.closest(
      "li, .nav-item, .menu-item, .project-menu-item, .list-group-item"
    );

    if (row && row !== root && root.contains(row)) {
      return row;
    }

    const parent = anchor.parentElement;
    if (!parent || parent === root) {
      return null;
    }

    const directLinks = parent.querySelectorAll(":scope > a");
    if (directLinks.length === 1) {
      return parent;
    }

    return null;
  }

  function setLinkHidden(anchor, root, hidden) {
    const row = semanticRowFor(anchor, root);

    anchor.classList.toggle(HIDDEN_CLASS, hidden);
    anchor.hidden = hidden;
    anchor.setAttribute("aria-hidden", hidden ? "true" : "false");

    if (row) {
      row.classList.toggle(ROW_HIDDEN_CLASS, hidden);
      row.hidden = hidden;
      row.dataset.usSignMenuOwned = "true";
    }

    if (!row) {
      const next = anchor.nextSibling;
      if (next && next.nodeType === Node.ELEMENT_NODE && next.tagName === "BR") {
        next.style.setProperty("display", hidden ? "none" : "", hidden ? "important" : "");
        next.dataset.usSignMenuBreak = "true";
      }
    }
  }

  function cleanMainSidebar() {
    const sidebar = document.getElementById("sidebar_left");
    if (!sidebar) return;

    for (const anchor of sidebar.querySelectorAll("a")) {
      const hidden = SIDEBAR_HIDDEN_LINKS.has(labelFor(anchor));
      setLinkHidden(anchor, sidebar, hidden);
    }
  }

  function cleanProjectRail() {
    const rail = document.getElementById("pmlt");
    if (!rail) return;

    for (const anchor of rail.querySelectorAll("a")) {
      const label = labelFor(anchor);
      setLinkHidden(anchor, rail, PROJECT_HIDDEN_LINKS.has(label));

      if (PROJECT_LINKS.has(label)) {
        anchor.hidden = false;
        anchor.classList.remove(HIDDEN_CLASS);
        anchor.removeAttribute("aria-hidden");
        anchor.style.removeProperty("display");
        anchor.style.removeProperty("visibility");
        anchor.style.removeProperty("opacity");
        anchor.style.setProperty("pointer-events", "auto", "important");

        const row = semanticRowFor(anchor, rail);
        if (row) {
          row.hidden = false;
          row.classList.remove(ROW_HIDDEN_CLASS);
          row.style.removeProperty("display");
          row.style.removeProperty("visibility");
          row.style.removeProperty("opacity");
        }
      }
    }
  }

  function markRailControls() {
    const rail = document.getElementById("pmlt");
    if (!rail) return;

    const controls = rail.querySelectorAll(
      "a, button, input[type='button'], input[type='submit']"
    );

    for (const control of controls) {
      const label = clean(
        control.value ||
        control.getAttribute("aria-label") ||
        control.getAttribute("title") ||
        control.textContent ||
        ""
      );

      control.classList.remove(
        RAIL_ACTION_CLASS,
        RAIL_NAV_CLASS,
        RAIL_COUNTER_CLASS,
        RAIL_CLOCK_CLASS
      );

      if (RAIL_ACTION_LABELS.has(label)) {
        control.classList.add(RAIL_ACTION_CLASS);
        continue;
      }

      if (label === "CLOCK IN" || label === "CLOCK OUT") {
        control.classList.add(RAIL_CLOCK_CLASS);
        continue;
      }

      if (/^OF\s*\d+$/i.test(label)) {
        control.classList.add(RAIL_COUNTER_CLASS);
        continue;
      }

      if (
        label &&
        label.length <= 6 &&
        !/[A-Z0-9]/.test(label) &&
        /[<>‹›«»◀▶⏮⏭←→|]/.test(label)
      ) {
        control.classList.add(RAIL_NAV_CLASS);
      }
    }

    /* Counter may be a non-clickable span rather than a button/link. */
    for (const element of rail.querySelectorAll("span, small, strong, em")) {
      const label = clean(element.textContent);
      if (/^OF\s*\d+$/i.test(label)) {
        element.classList.add(RAIL_COUNTER_CLASS);
      }
    }
  }

  function anchorsByLabel(rail) {
    const map = new Map();
    for (const anchor of rail.querySelectorAll("a")) {
      const label = labelFor(anchor);
      if (PRIMARY_PROJECT_ORDER.includes(label) && !anchor.hidden) {
        map.set(label, anchor);
      }
    }
    return map;
  }

  function reorderWrappedRows(rail, anchors) {
    const rows = PRIMARY_PROJECT_ORDER
      .map((label) => semanticRowFor(anchors.get(label), rail))
      .filter(Boolean);

    if (rows.length !== PRIMARY_PROJECT_ORDER.length) return false;
    if (new Set(rows).size !== rows.length) return false;

    const parent = rows[0].parentElement;
    if (!parent || !rows.every((row) => row.parentElement === parent)) return false;

    const current = Array.from(parent.children).filter((child) => rows.includes(child));
    const alreadyOrdered = current.length === rows.length &&
      current.every((row, index) => row === rows[index]);

    if (alreadyOrdered) return true;

    const marker = document.createComment("us-sign-primary-project-order");
    const firstInDom = current[0] || rows[0];
    parent.insertBefore(marker, firstInDom);

    const fragment = document.createDocumentFragment();
    rows.forEach((row) => fragment.appendChild(row));
    parent.insertBefore(fragment, marker);
    marker.remove();
    return true;
  }

  function flatUnitFor(anchor) {
    const nodes = [anchor];
    let node = anchor.nextSibling;

    while (node && node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
      nodes.push(node);
      node = node.nextSibling;
    }

    if (node && node.nodeType === Node.ELEMENT_NODE && node.tagName === "BR") {
      nodes.push(node);
    }

    return nodes;
  }

  function reorderFlatLinks(anchors) {
    const orderedAnchors = PRIMARY_PROJECT_ORDER.map((label) => anchors.get(label));
    if (orderedAnchors.some((anchor) => !anchor)) return false;

    const parent = orderedAnchors[0].parentElement;
    if (!parent || !orderedAnchors.every((anchor) => anchor.parentElement === parent)) {
      return false;
    }

    const domAnchors = Array.from(parent.children)
      .filter((node) => node.tagName === "A" && orderedAnchors.includes(node));

    const alreadyOrdered = domAnchors.length === orderedAnchors.length &&
      domAnchors.every((anchor, index) => anchor === orderedAnchors[index]);

    if (alreadyOrdered) return true;

    const firstInDom = domAnchors[0] || orderedAnchors[0];
    const marker = document.createComment("us-sign-primary-flat-project-order");
    parent.insertBefore(marker, firstInDom);

    const units = orderedAnchors.map(flatUnitFor);
    const fragment = document.createDocumentFragment();

    for (const unit of units) {
      for (const node of unit) {
        fragment.appendChild(node);
      }
    }

    parent.insertBefore(fragment, marker);
    marker.remove();
    return true;
  }

  function reorderProjectLinksOnce() {
    const rail = document.getElementById("pmlt");
    if (!rail) return;

    const anchors = anchorsByLabel(rail);
    if (anchors.size !== PRIMARY_PROJECT_ORDER.length) return;

    if (reorderWrappedRows(rail, anchors)) return;
    reorderFlatLinks(anchors);
  }

  function apply() {
    scheduled = false;
    if (applying) return;

    applying = true;
    try {
      cleanMainSidebar();
      cleanProjectRail();
      markRailControls();
      reorderProjectLinksOnce();
    } finally {
      applying = false;
    }
  }

  function scheduleApply() {
    if (scheduled || applying) return;
    scheduled = true;
    window.requestAnimationFrame(apply);
  }

  scheduleApply();
  window.setTimeout(scheduleApply, 350);
  window.setTimeout(scheduleApply, 1200);
  window.addEventListener("pageshow", scheduleApply);

  const observer = new MutationObserver((mutations) => {
    if (applying) return;

    const changed = mutations.some((mutation) =>
      mutation.addedNodes.length || mutation.removedNodes.length
    );

    if (changed) scheduleApply();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();