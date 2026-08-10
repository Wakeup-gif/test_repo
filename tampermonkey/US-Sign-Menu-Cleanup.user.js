// ==UserScript==
// @name         US Sign Menu Cleanup and Reorder
// @namespace    us-sign-full-modules
// @version      2.6.0
// @description  Keeps the cleaned sidebar and project rail stable and correctly reorders both wrapped and flat SquareCoil project links.
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

  /* Visible project links. */
  const PROJECT_LINKS = new Set([
    "DESIGN",
    "SCOPE OF WORK",
    "PROJECT STATUS",
    "TASKS",
    "DOCUMENTS",
    "PHOTOS",
    "PRODUCTION FILES"
  ]);

  /* Only reorder the upper workflow group. The Documents divider stays untouched. */
  const PRIMARY_PROJECT_ORDER = [
    "DESIGN",
    "SCOPE OF WORK",
    "PROJECT STATUS",
    "TASKS"
  ];

  const HIDDEN_CLASS = "us-sign-menu-link-hidden";
  const ROW_HIDDEN_CLASS = "us-sign-menu-row-hidden";

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
    return clean(clone.textContent);
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

    /* Keep whitespace and the line break attached to the link when it moves. */
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

    /* Prefer semantic rows. Fall back to SquareCoil's flat <a><br> rail. */
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