// ==UserScript==
// @name         US Sign Menu Cleanup and Project Reorder
// @namespace    us-sign-full-modules
// @version      2.2.0
// @description  Keeps the cleaned main sidebar while restoring and ordering the core project navigation.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  /*
   * These remain hidden only in the main SquareCoil sidebar.
   * Estimate Requests remains visible to match the user's existing layout.
   */
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

  /* Core links that must remain visible in the project rail. */
  const PROJECT_ORDER = [
    "DESIGN",
    "SCOPE OF WORK",
    "PROJECT STATUS",
    "TASKS",
    "DOCUMENTS",
    "PHOTOS",
    "PRODUCTION FILES"
  ];

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

  function restoreCoreProjectLinks() {
    const rail = document.getElementById("pmlt");
    if (!rail) return;

    for (const anchor of rail.querySelectorAll("a")) {
      const label = labelFor(anchor);
      if (!PROJECT_ORDER.includes(label)) continue;

      const row = rowFor(anchor);
      if (!row) continue;

      row.hidden = false;
      row.classList.remove("us-sign-hidden-menu-row");
      row.style.removeProperty("display");
      row.style.removeProperty("visibility");
      row.style.removeProperty("opacity");
      anchor.style.removeProperty("display");
      anchor.style.removeProperty("visibility");
      anchor.style.removeProperty("opacity");
    }
  }

  function cleanMainSidebar() {
    for (const anchor of document.querySelectorAll("#sidebar_left a")) {
      const row = rowFor(anchor);
      if (!row) continue;

      const shouldHide = SIDEBAR_HIDDEN_LINKS.has(labelFor(anchor));

      if (shouldHide) {
        row.style.setProperty("display", "none", "important");
      } else if (row.dataset.usSignMenuHidden === "true") {
        row.style.removeProperty("display");
      }

      if (shouldHide) {
        row.dataset.usSignMenuHidden = "true";
      } else {
        delete row.dataset.usSignMenuHidden;
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
      if (row) rows.set(label, row);
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
    cleanMainSidebar();
    restoreCoreProjectLinks();
    reorderProjectLinks();
  }

  apply();
  window.setTimeout(apply, 350);
  window.setTimeout(apply, 1200);
  window.addEventListener("pageshow", () => window.setTimeout(apply, 50));
})();
