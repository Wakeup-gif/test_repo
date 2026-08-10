// ==UserScript==
// @name         US Sign Menu Cleanup and Reorder
// @namespace    us-sign-full-modules
// @version      2.8.0
// @description  Lightweight sidebar cleanup, stable project-link ordering, and compact project-rail controls without a permanent mutation observer.
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
  const ACTION_CLASS = "us-sign-rail-action";
  const ACTION_GROUP_CLASS = "us-sign-rail-actions";
  const NAV_HOST_CLASS = "us-sign-rail-nav-host";
  const NAV_CLASS = "us-sign-rail-nav";
  const COUNTER_CLASS = "us-sign-rail-counter";
  const CLOCK_CLASS = "us-sign-rail-clock";

  const style = document.createElement("style");
  style.id = "us-sign-menu-cleanup-style";
  style.textContent = `
    .${HIDDEN_CLASS}, .${ROW_HIDDEN_CLASS} { display: none !important; }

    #pmlt a:not(.${HIDDEN_CLASS}) {
      pointer-events: auto !important;
      cursor: pointer !important;
    }

    /* Project action buttons: one compact layer, no Bootstrap stacking. */
    #pmlt .${ACTION_GROUP_CLASS} {
      display: flex !important;
      flex-flow: row nowrap !important;
      align-items: center !important;
      gap: 6px !important;
      width: 100% !important;
      max-width: 190px !important;
      margin: 10px 0 10px !important;
      padding: 0 !important;
      position: relative !important;
      z-index: 1 !important;
      background: transparent !important;
      border: 0 !important;
    }

    #pmlt .${ACTION_CLASS} {
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
      height: 31px !important;
      min-height: 31px !important;
      margin: 0 !important;
      padding: 0 8px !important;
      overflow: hidden !important;
      color: #c8d0d9 !important;
      background: #1d2228 !important;
      background-image: none !important;
      border: 1px solid #353d46 !important;
      border-radius: 6px !important;
      box-shadow: none !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      line-height: 1 !important;
      letter-spacing: 0 !important;
      text-transform: none !important;
      text-shadow: none !important;
      transform: none !important;
      isolation: auto !important;
      z-index: auto !important;
    }

    #pmlt .${ACTION_CLASS}::before,
    #pmlt .${ACTION_CLASS}::after {
      content: none !important;
      display: none !important;
    }

    #pmlt .${ACTION_CLASS}:hover,
    #pmlt .${ACTION_CLASS}:focus-visible {
      color: #f5f7f9 !important;
      background: #272d34 !important;
      border-color: #4a5561 !important;
      outline: none !important;
    }

    /* Project navigator: neutral charcoal, not bright blue. */
    #pmlt .${NAV_HOST_CLASS} {
      display: inline-flex !important;
      flex-flow: row nowrap !important;
      align-items: center !important;
      gap: 2px !important;
      margin: 6px 0 4px !important;
      padding: 0 !important;
      background: transparent !important;
      border: 0 !important;
      white-space: nowrap !important;
    }

    #pmlt .${NAV_CLASS} {
      appearance: none !important;
      -webkit-appearance: none !important;
      position: relative !important;
      inset: auto !important;
      float: none !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 18px !important;
      min-width: 18px !important;
      max-width: 18px !important;
      height: 24px !important;
      min-height: 24px !important;
      margin: 0 !important;
      padding: 0 !important;
      color: #aeb8c3 !important;
      background: transparent !important;
      background-image: none !important;
      border: 0 !important;
      border-radius: 4px !important;
      box-shadow: none !important;
      font-size: 15px !important;
      line-height: 1 !important;
      text-shadow: none !important;
      transform: none !important;
    }

    #pmlt .${NAV_CLASS}:hover,
    #pmlt .${NAV_CLASS}:focus-visible {
      color: #f4f6f8 !important;
      background: #242a31 !important;
      outline: none !important;
    }

    #pmlt .${COUNTER_CLASS} {
      appearance: none !important;
      -webkit-appearance: none !important;
      position: relative !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-width: 38px !important;
      width: auto !important;
      height: 25px !important;
      min-height: 25px !important;
      margin: 0 2px !important;
      padding: 0 6px !important;
      color: #d4dbe3 !important;
      background: #26303a !important;
      background-image: none !important;
      border: 1px solid #3c4855 !important;
      border-radius: 5px !important;
      box-shadow: none !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      line-height: 1 !important;
      text-shadow: none !important;
      transform: none !important;
    }

    #pmlt .${CLOCK_CLASS} {
      appearance: none !important;
      -webkit-appearance: none !important;
      position: relative !important;
      inset: auto !important;
      float: none !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      max-width: 190px !important;
      height: 38px !important;
      min-height: 38px !important;
      margin: 10px 0 12px !important;
      padding: 0 12px !important;
      color: #dfd5c3 !important;
      background: #2c271f !important;
      background-image: none !important;
      border: 1px solid #55472f !important;
      border-radius: 6px !important;
      box-shadow: none !important;
      font-size: 12px !important;
      font-weight: 650 !important;
      line-height: 1 !important;
      text-shadow: none !important;
      transform: none !important;
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
    } else {
      const next = anchor.nextSibling;
      if (next?.nodeType === Node.ELEMENT_NODE && next.tagName === "BR") {
        next.style.setProperty("display", hidden ? "none" : "", hidden ? "important" : "");
      }
    }
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
    const current = Array.from(parent.children).filter((node) => node.tagName === "A" && orderedAnchors.includes(node));
    if (current.length === orderedAnchors.length && current.every((anchor, index) => anchor === orderedAnchors[index])) return;

    const marker = document.createComment("us-sign-project-flat-order");
    parent.insertBefore(marker, current[0] || orderedAnchors[0]);
    const fragment = document.createDocumentFragment();
    orderedAnchors.map(flatUnitFor).flat().forEach((node) => fragment.appendChild(node));
    parent.insertBefore(fragment, marker);
    marker.remove();
  }

  function findControl(rail, label) {
    return [...rail.querySelectorAll("a, button, input[type='button'], input[type='submit']")]
      .find((element) => textFor(element) === label) || null;
  }

  function removeAdjacentBreak(control) {
    if (!control) return;
    const next = control.nextSibling;
    if (next?.nodeType === Node.ELEMENT_NODE && next.tagName === "BR") next.remove();
    const previous = control.previousSibling;
    if (previous?.nodeType === Node.ELEMENT_NODE && previous.tagName === "BR") previous.remove();
  }

  function normalizeActionButtons(rail) {
    const controls = ["EDIT", "LIST", "DUPLICATE"].map((label) => findControl(rail, label));
    controls.filter(Boolean).forEach((control) => control.classList.add(ACTION_CLASS));
    if (controls.some((control) => !control)) return;

    const parent = controls[0].parentElement;
    if (!parent || !controls.every((control) => control.parentElement === parent)) return;

    let group = parent.querySelector(`:scope > .${ACTION_GROUP_CLASS}`);
    if (!group) {
      group = document.createElement("div");
      group.className = ACTION_GROUP_CLASS;
      parent.insertBefore(group, controls[0]);
    }

    for (const control of controls) {
      removeAdjacentBreak(control);
      group.appendChild(control);
    }
  }

  function findCounter(rail) {
    const candidates = rail.querySelectorAll(
      "span, small, strong, em, b, a, button, input[type='button'], input[type='submit']"
    );
    for (const element of candidates) {
      if (/^OF\s*\d+$/i.test(textFor(element))) return element;
    }
    return null;
  }

  function normalizeNavigator(rail) {
    const counter = findCounter(rail);
    if (!counter) return;
    counter.classList.add(COUNTER_CLASS);

    let host = counter.parentElement;
    while (host && host !== rail) {
      const interactives = [...host.querySelectorAll("a, button, input[type='button'], input[type='submit']")];
      const hasAction = interactives.some((element) => ["EDIT", "LIST", "DUPLICATE", "CLOCK IN", "CLOCK OUT"].includes(textFor(element)));
      if (!hasAction && interactives.length >= 2 && interactives.length <= 8) break;
      host = host.parentElement;
    }
    if (!host || host === rail) host = counter.parentElement;
    if (!host) return;

    host.classList.add(NAV_HOST_CLASS);
    for (const element of host.querySelectorAll("a, button, input[type='button'], input[type='submit']")) {
      if (element !== counter) element.classList.add(NAV_CLASS);
    }
    for (const br of host.querySelectorAll(":scope > br")) br.remove();
  }

  function normalizeClock(rail) {
    const clock = ["CLOCK IN", "CLOCK OUT"]
      .map((label) => findControl(rail, label))
      .find(Boolean);
    if (clock) clock.classList.add(CLOCK_CLASS);
  }

  function apply() {
    cleanMainSidebar();
    cleanProjectRail();
    reorderProjectLinks();

    const rail = document.getElementById("pmlt");
    if (!rail) return;
    normalizeActionButtons(rail);
    normalizeNavigator(rail);
    normalizeClock(rail);
  }

  /* Bounded startup passes only. No permanent MutationObserver. */
  apply();
  window.setTimeout(apply, 250);
  window.setTimeout(apply, 900);
  window.setTimeout(apply, 1800);
  window.addEventListener("pageshow", apply, { once: true });
})();
