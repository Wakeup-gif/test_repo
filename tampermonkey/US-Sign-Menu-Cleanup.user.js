// ==UserScript==
// @name         US Sign Menu Cleanup and Reorder
// @namespace    us-sign-full-modules
// @version      3.0.1
// @description  Lightweight sidebar cleanup, project ordering, compact rail controls, project-page marker, and native sticky rail in one bounded runtime.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        none
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Menu-Cleanup.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Menu-Cleanup.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__usSignMenuCleanupV301) return;
  window.__usSignMenuCleanupV301 = true;

  const SIDEBAR_HIDDEN_LINKS = new Set([
    "LEADS", "QUEUES", "PURCHASING", "SCHEDULE", "INSTALL CALENDAR",
    "CONTACTS", "ESTIMATES", "SHOP ORDER", "COST TO DATE",
    "PURCHASE ORDERS", "MATERIALS", "MACHINE TIME", "HELP CENTER"
  ]);

  const PROJECT_HIDDEN_LINKS = new Set([
    "CONTACTS", "ESTIMATES", "SHOP ORDER", "COST TO DATE",
    "PURCHASE ORDERS", "MATERIALS", "MACHINE TIME"
  ]);

  const PROJECT_LINKS = new Set([
    "DESIGN", "SCOPE OF WORK", "PROJECT STATUS", "TASKS",
    "DOCUMENTS", "PHOTOS", "PRODUCTION FILES"
  ]);

  const PRIMARY_PROJECT_ORDER = [
    "DESIGN", "SCOPE OF WORK", "PROJECT STATUS", "TASKS"
  ];

  const HIDDEN_CLASS = "us-sign-menu-link-hidden";
  const ROW_HIDDEN_CLASS = "us-sign-menu-row-hidden";

  const style = document.createElement("style");
  style.id = "us-sign-menu-cleanup-style";
  style.textContent = `
    .${HIDDEN_CLASS}, .${ROW_HIDDEN_CLASS} { display: none !important; }

    html.us-sign-project-page #pmlt {
      position: sticky !important;
      top: 58px !important;
      align-self: flex-start !important;
      max-height: calc(100vh - 58px) !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      scrollbar-width: thin !important;
    }

    #pmlt a:not(.${HIDDEN_CLASS}) {
      pointer-events: auto !important;
      cursor: pointer !important;
    }

    #us-sign-rail-nav-group,
    #us-sign-rail-action-group {
      box-sizing: border-box !important;
      position: relative !important;
      float: none !important;
      clear: both !important;
      transform: none !important;
      isolation: isolate !important;
      z-index: 2 !important;
    }

    #us-sign-rail-nav-group {
      display: inline-flex !important;
      flex-flow: row nowrap !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 1px !important;
      width: auto !important;
      min-width: 0 !important;
      height: 29px !important;
      margin: 5px 0 10px !important;
      padding: 2px !important;
      background: var(--us-glass-strong, #171b20) !important;
      border: 1px solid var(--us-border, #2d343c) !important;
      border-radius: 7px !important;
      box-shadow: none !important;
      white-space: nowrap !important;
    }

    #us-sign-rail-nav-group > * {
      box-sizing: border-box !important;
      position: relative !important;
      inset: auto !important;
      float: none !important;
      flex: 0 0 auto !important;
      margin: 0 !important;
      box-shadow: none !important;
      text-shadow: none !important;
      transform: none !important;
      vertical-align: middle !important;
    }

    #us-sign-rail-nav-group > a,
    #us-sign-rail-nav-group > button,
    #us-sign-rail-nav-group > input[type="button"],
    #us-sign-rail-nav-group > input[type="submit"] {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 22px !important;
      min-width: 22px !important;
      max-width: 22px !important;
      height: 23px !important;
      min-height: 23px !important;
      padding: 0 !important;
      color: var(--us-text-soft, #aeb8c3) !important;
      background: transparent !important;
      background-image: none !important;
      border: 0 !important;
      border-radius: 4px !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      overflow: hidden !important;
    }

    #us-sign-rail-nav-group > a:hover,
    #us-sign-rail-nav-group > button:hover,
    #us-sign-rail-nav-group > input[type="button"]:hover,
    #us-sign-rail-nav-group > input[type="submit"]:hover {
      color: var(--us-text, #f5f7f9) !important;
      background: var(--us-hover, #262c33) !important;
    }

    #us-sign-rail-counter {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: auto !important;
      min-width: 40px !important;
      max-width: 58px !important;
      height: 23px !important;
      min-height: 23px !important;
      padding: 0 6px !important;
      color: var(--us-text-soft, #d4dbe3) !important;
      background: var(--us-bg-soft, #252d35) !important;
      background-image: none !important;
      border: 1px solid var(--us-border-strong, #3a4652) !important;
      border-radius: 4px !important;
      box-shadow: none !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      line-height: 1 !important;
      white-space: nowrap !important;
    }

    #us-sign-rail-action-group {
      display: flex !important;
      flex-flow: row nowrap !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 5px !important;
      width: 100% !important;
      max-width: 212px !important;
      margin: 0 0 12px !important;
      padding: 0 !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      overflow: visible !important;
    }

    #us-sign-rail-action-group > * {
      box-sizing: border-box !important;
      appearance: none !important;
      -webkit-appearance: none !important;
      position: relative !important;
      inset: auto !important;
      float: none !important;
      display: inline-flex !important;
      flex: 1 1 0 !important;
      align-items: center !important;
      justify-content: center !important;
      width: auto !important;
      min-width: 0 !important;
      max-width: none !important;
      height: 29px !important;
      min-height: 29px !important;
      margin: 0 !important;
      padding: 0 7px !important;
      color: var(--us-text-soft, #d1d7de) !important;
      background: var(--us-glass, #1d2228) !important;
      background-image: none !important;
      border: 1px solid var(--us-border, #353e48) !important;
      border-radius: 6px !important;
      box-shadow: none !important;
      font-size: 10.5px !important;
      font-weight: 650 !important;
      line-height: 1 !important;
      letter-spacing: 0 !important;
      text-transform: none !important;
      text-shadow: none !important;
      transform: none !important;
      overflow: hidden !important;
    }

    #us-sign-rail-action-group > *:hover {
      color: var(--us-text, #f5f7f9) !important;
      background: var(--us-hover, #282e35) !important;
      border-color: var(--us-border-strong, #4b5662) !important;
    }

    #us-sign-rail-action-group > *::before,
    #us-sign-rail-action-group > *::after,
    #us-sign-rail-nav-group > *::before,
    #us-sign-rail-nav-group > *::after {
      content: none !important;
      display: none !important;
    }

    @media (max-width: 900px) {
      html.us-sign-project-page #pmlt {
        position: static !important;
        max-height: none !important;
        overflow: visible !important;
      }
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  const clean = (value) => String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  function textFor(element) {
    return clean(
      element?.value ||
      element?.getAttribute?.("aria-label") ||
      element?.getAttribute?.("title") ||
      element?.textContent ||
      ""
    );
  }

  function labelFor(anchor) {
    const clone = anchor.cloneNode(true);
    clone.querySelectorAll(".badge, .label, small, sup").forEach((node) => node.remove());
    return clean(clone.textContent || clone.value);
  }

  function semanticRowFor(anchor, root) {
    const row = anchor.closest("li, .nav-item, .menu-item, .project-menu-item, .list-group-item");
    if (row && row !== root && root.contains(row)) return row;

    const parent = anchor.parentElement;
    if (!parent || parent === root) return null;
    return parent.querySelectorAll(":scope > a").length === 1 ? parent : null;
  }

  function setLinkHidden(anchor, root, hidden) {
    const row = semanticRowFor(anchor, root);
    anchor.classList.toggle(HIDDEN_CLASS, hidden);
    anchor.hidden = hidden;
    anchor.setAttribute("aria-hidden", hidden ? "true" : "false");

    if (row) {
      row.classList.toggle(ROW_HIDDEN_CLASS, hidden);
      row.hidden = hidden;
      return;
    }

    const next = anchor.nextSibling;
    if (next?.nodeType === Node.ELEMENT_NODE && next.tagName === "BR") {
      if (hidden) next.style.setProperty("display", "none", "important");
      else next.style.removeProperty("display");
    }
  }

  function markProjectPage() {
    document.documentElement.classList.toggle(
      "us-sign-project-page",
      Boolean(document.getElementById("pmlt"))
    );
  }

  function cleanMainSidebar() {
    const sidebar = document.getElementById("sidebar_left");
    if (!sidebar) return;
    for (const anchor of sidebar.querySelectorAll("a")) {
      setLinkHidden(anchor, sidebar, SIDEBAR_HIDDEN_LINKS.has(labelFor(anchor)));
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
        anchor.style.setProperty("pointer-events", "auto", "important");
        const row = semanticRowFor(anchor, rail);
        if (row) {
          row.hidden = false;
          row.classList.remove(ROW_HIDDEN_CLASS);
        }
      }
    }
  }

  function anchorsByLabel(rail) {
    const map = new Map();
    for (const anchor of rail.querySelectorAll("a")) {
      const label = labelFor(anchor);
      if (PRIMARY_PROJECT_ORDER.includes(label) && !anchor.hidden) map.set(label, anchor);
    }
    return map;
  }

  function flatUnitFor(anchor) {
    const nodes = [anchor];
    let node = anchor.nextSibling;
    while (node && node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
      nodes.push(node);
      node = node.nextSibling;
    }
    if (node?.nodeType === Node.ELEMENT_NODE && node.tagName === "BR") nodes.push(node);
    return nodes;
  }

  function reorderProjectLinks() {
    const rail = document.getElementById("pmlt");
    if (!rail) return;

    const anchors = anchorsByLabel(rail);
    if (anchors.size !== PRIMARY_PROJECT_ORDER.length) return;

    const orderedAnchors = PRIMARY_PROJECT_ORDER.map((label) => anchors.get(label));
    const rows = orderedAnchors.map((anchor) => semanticRowFor(anchor, rail));

    if (rows.every(Boolean) && new Set(rows).size === rows.length) {
      const parent = rows[0].parentElement;
      if (parent && rows.every((row) => row.parentElement === parent)) {
        const current = Array.from(parent.children).filter((child) => rows.includes(child));
        if (!current.every((row, index) => row === rows[index])) {
          const marker = document.createComment("us-sign-project-order");
          parent.insertBefore(marker, current[0] || rows[0]);
          const fragment = document.createDocumentFragment();
          rows.forEach((row) => fragment.appendChild(row));
          parent.insertBefore(fragment, marker);
          marker.remove();
        }
        return;
      }
    }

    const parent = orderedAnchors[0].parentElement;
    if (!parent || !orderedAnchors.every((anchor) => anchor.parentElement === parent)) return;

    const current = Array.from(parent.children)
      .filter((node) => node.tagName === "A" && orderedAnchors.includes(node));

    if (current.length === orderedAnchors.length && current.every((anchor, index) => anchor === orderedAnchors[index])) return;

    const marker = document.createComment("us-sign-project-flat-order");
    parent.insertBefore(marker, current[0] || orderedAnchors[0]);
    const fragment = document.createDocumentFragment();
    orderedAnchors.map(flatUnitFor).flat().forEach((node) => fragment.appendChild(node));
    parent.insertBefore(fragment, marker);
    marker.remove();
  }

  function clickableControls(rail) {
    return [...rail.querySelectorAll("a, button, input[type='button'], input[type='submit']")]
      .filter((element) => !element.hidden && element.getClientRects().length);
  }

  function findClickable(rail, label) {
    return clickableControls(rail).find((element) => textFor(element) === label) || null;
  }

  function removeNeighborBreaks(element) {
    if (!element) return;
    for (const side of ["previousSibling", "nextSibling"]) {
      const node = element[side];
      if (node?.nodeType === Node.ELEMENT_NODE && node.tagName === "BR") node.remove();
    }
  }

  function normalizeActions(rail) {
    if (document.getElementById("us-sign-rail-action-group")) return true;

    const controls = [
      findClickable(rail, "EDIT"),
      findClickable(rail, "LIST"),
      findClickable(rail, "DUPLICATE")
    ];

    if (controls.some((control) => !control)) return false;
    if (new Set(controls.map((control) => control.parentElement)).size !== 1) return false;

    const parent = controls[0].parentElement;
    const ordered = [...controls].sort((a, b) => {
      const position = a.compareDocumentPosition(b);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    const group = document.createElement("div");
    group.id = "us-sign-rail-action-group";
    parent.insertBefore(group, ordered[0]);

    for (const control of controls) {
      removeNeighborBreaks(control);
      group.appendChild(control);
    }

    return true;
  }

  function counterCandidates(rail) {
    return [...rail.querySelectorAll("span, small, strong, em, b, a, button, div")]
      .filter((element) => element.id !== "us-sign-rail-nav-group" && /^OF\s*\d+$/i.test(textFor(element)))
      .sort((a, b) => a.children.length - b.children.length);
  }

  function normalizeNavigator(rail) {
    if (document.getElementById("us-sign-rail-nav-group")) return true;

    const counter = counterCandidates(rail)[0];
    if (!counter || !counter.getClientRects().length) return false;

    const counterRect = counter.getBoundingClientRect();
    const centerY = counterRect.top + counterRect.height / 2;

    const nearby = clickableControls(rail)
      .filter((element) => {
        if (element === counter || element.contains(counter) || counter.contains(element)) return false;
        const label = textFor(element);
        if (["EDIT", "LIST", "DUPLICATE", "CLOCK IN", "CLOCK OUT"].includes(label)) return false;
        if (PROJECT_LINKS.has(label)) return false;

        const rect = element.getBoundingClientRect();
        const elementCenterY = rect.top + rect.height / 2;
        const horizontalDistance = rect.right < counterRect.left
          ? counterRect.left - rect.right
          : rect.left > counterRect.right
            ? rect.left - counterRect.right
            : 0;

        return Math.abs(elementCenterY - centerY) <= 14 && horizontalDistance <= 70;
      })
      .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);

    if (nearby.length < 2) return false;

    const nodes = [...nearby, counter]
      .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);

    const parent = nodes[0].parentElement;
    if (!parent || !nodes.every((node) => node.parentElement === parent)) {
      counter.id = "us-sign-rail-counter";
      return true;
    }

    const group = document.createElement("div");
    group.id = "us-sign-rail-nav-group";
    parent.insertBefore(group, nodes[0]);

    for (const node of nodes) {
      removeNeighborBreaks(node);
      if (node === counter) node.id = "us-sign-rail-counter";
      group.appendChild(node);
    }

    return true;
  }

  function apply() {
    markProjectPage();
    cleanMainSidebar();
    cleanProjectRail();
    reorderProjectLinks();

    const rail = document.getElementById("pmlt");
    if (!rail) return false;

    normalizeNavigator(rail);
    normalizeActions(rail);
    return true;
  }

  function start() {
    apply();
    window.setTimeout(apply, 650);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  window.addEventListener("pageshow", () => requestAnimationFrame(apply));
})();
