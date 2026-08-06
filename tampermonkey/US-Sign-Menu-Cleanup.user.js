// ==UserScript==
// @name         US Sign Menu Reorder
// @namespace    us-sign-full-modules
// @version      2.1.0
// @description  Preserves every SquareCoil menu item and only reorders project navigation links.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  const LEGACY_HIDDEN_LINKS = new Set([
    "LEADS",
    "QUEUES",
    "PURCHASING",
    "SCHEDULE",
    "INSTALL CALENDAR",
    "ESTIMATE REQUESTS",
    "CONTACTS",
    "ESTIMATES",
    "SHOP ORDER",
    "COST TO DATE",
    "PURCHASE ORDERS",
    "MATERIALS",
    "MACHINE TIME",
    "HELP CENTER"
  ]);

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

  function restoreLegacyHiddenLinks() {
    for (const anchor of document.querySelectorAll("#sidebar_left a, #pmlt a, header.navbar a")) {
      if (!LEGACY_HIDDEN_LINKS.has(clean(anchor.textContent))) continue;

      const row = rowFor(anchor);
      if (!row) continue;

      row.style.removeProperty("display");
      row.classList.remove("us-sign-hidden-menu-row");
      row.removeAttribute("hidden");
    }
  }

  function reorderProjectLinks() {
    const rail = document.getElementById("pmlt");
    if (!rail) return;

    const rows = new Map();

    for (const anchor of rail.querySelectorAll("a")) {
      const label = clean(anchor.textContent);
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
    restoreLegacyHiddenLinks();
    reorderProjectLinks();
  }

  apply();
  window.setTimeout(apply, 350);
  window.setTimeout(apply, 1200);
  window.addEventListener("pageshow", () => window.setTimeout(apply, 50));
})();
