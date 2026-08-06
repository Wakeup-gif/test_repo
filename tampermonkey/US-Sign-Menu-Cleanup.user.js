// ==UserScript==
// @name         US Sign Menu Cleanup and Reorder
// @namespace    us-sign-full-modules
// @version      2.3.0
// @description  Keeps the cleaned main sidebar and project rail stable even when SquareCoil loads menu links late.
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

  let scheduled = false;

  const clean = (value) => String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  function rowFor(anchor) {
    return anchor.closest("li") || anchor.parentElement;
  }

  function labelFor(anchor) {
    const clone = anchor.cloneNode(true);
    clone.querySelectorAll(".badge, .label, small, sup").forEach((node) => node.remove());
    return clean(clone.textContent);
  }

  function setRowHidden(row, hidden, marker) {
    if (!row) return;

    if (hidden) {
      row.dataset[marker] = "true";
      row.style.setProperty("display", "none", "important");
      row.hidden = true;
      return;
    }

    if (row.dataset[marker] === "true") {
      delete row.dataset[marker];
      row.style.removeProperty("display");
      row.hidden = false;
    }
  }

  function cleanMainSidebar() {
    const sidebar = document.getElementById("sidebar_left");
    if (!sidebar) return;

    for (const anchor of sidebar.querySelectorAll("a")) {
      const row = rowFor(anchor);
      const shouldHide = SIDEBAR_HIDDEN_LINKS.has(labelFor(anchor));
      setRowHidden(row, shouldHide, "usSignSidebarHidden");
    }
  }

  function cleanProjectRail() {
    const rail = document.getElementById("pmlt");
    if (!rail) return;

    for (const anchor of rail.querySelectorAll("a")) {
      const label = labelFor(anchor);
      const row = rowFor(anchor);

      if (PROJECT_HIDDEN_LINKS.has(label)) {
        setRowHidden(row, true, "usSignProjectHidden");
        continue;
      }

      if (PROJECT_ORDER.includes(label)) {
        setRowHidden(row, false, "usSignProjectHidden");
        row?.style.removeProperty("visibility");
        row?.style.removeProperty("opacity");
        anchor.style.removeProperty("display");
        anchor.style.removeProperty("visibility");
        anchor.style.removeProperty("opacity");
      }
    }
  }

  function reorderProjectLinks() {
    const rail = document.getElementById("pmlt");
    if (!rail) return;

    const rows = new Map();

    for (const anchor of rail.querySelectorAll("a")) {
      const label = labelFor(anchor);
      if (!PROJECT_ORDER.includes(label)) continue;

      const row = rowFor(anchor);
      if (row && !row.hidden) rows.set(label, row);
    }

    const ordered = PROJECT_ORDER
      .map((label) => rows.get(label))
      .filter(Boolean);

    if (ordered.length < 2) return;

    const parent = ordered[0].parentElement;
    if (!parent || !ordered.every((row) => row.parentElement === parent)) return;

    const fragment = document.createDocumentFragment();
    ordered.forEach((row) => fragment.appendChild(row));
    parent.appendChild(fragment);
  }

  function apply() {
    scheduled = false;
    cleanMainSidebar();
    cleanProjectRail();
    reorderProjectLinks();
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(apply);
  }

  scheduleApply();
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
