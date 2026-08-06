// ==UserScript==
// @name         US Sign Menu Cleanup and Reorder
// @namespace    us-sign-full-modules
// @version      2.4.0
// @description  Keeps the cleaned sidebar and project rail stable without moving links during clicks.
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

  const PROJECT_ORDER = [
    "TASKS",
    "SCOPE OF WORK",
    "DESIGN",
    "PROJECT STATUS",
    "DOCUMENTS",
    "PHOTOS",
    "PRODUCTION FILES"
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

      if (PROJECT_ORDER.includes(label)) {
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

  function reorderProjectLinksOnce() {
    const rail = document.getElementById("pmlt");
    if (!rail) return;

    const rows = new Map();

    for (const anchor of rail.querySelectorAll("a")) {
      const label = labelFor(anchor);
      if (!PROJECT_ORDER.includes(label)) continue;

      const row = semanticRowFor(anchor, rail);
      if (row && !row.hidden) rows.set(label, row);
    }

    const ordered = PROJECT_ORDER.map((label) => rows.get(label)).filter(Boolean);
    if (ordered.length < 2 || new Set(ordered).size !== ordered.length) return;

    const parent = ordered[0].parentElement;
    if (!parent || !ordered.every((row) => row.parentElement === parent)) return;

    const current = Array.from(parent.children).filter((child) => ordered.includes(child));
    const alreadyOrdered = current.length === ordered.length &&
      current.every((row, index) => row === ordered[index]);

    if (alreadyOrdered) return;

    const marker = document.createComment("us-sign-project-order");
    parent.insertBefore(marker, ordered[0]);

    const fragment = document.createDocumentFragment();
    ordered.forEach((row) => fragment.appendChild(row));
    parent.insertBefore(fragment, marker);
    marker.remove();
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
