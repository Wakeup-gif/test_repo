// ==UserScript==
// @name         US Sign - Description File Path Tools
// @namespace    us-sign-local-tools
// @version      2.3.0
// @description  Lightweight Description path detection with one scoped observer, no page-wide watcher, and no DOM cloning.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        GM_setClipboard
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Description-File-Path-Tools.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Description-File-Path-Tools.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__usSignDescriptionPathToolsV230) return;
  window.__usSignDescriptionPathToolsV230 = true;

  const HOST_ID = "us-sign-description-path-tools-standalone";
  const LEGACY_HOST_ID = "us-sign-description-path-tools";
  const PROTOCOL = "ussign-onecommander";

  let currentContent = null;
  let contentObserver = null;
  let refreshTimer = 0;
  let lastSignature = "";

  const clean = (value) => String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .trim();

  const headingText = (value) => clean(value)
    .replace(/^\/+\s*/, "")
    .replace(/:\s*$/, "")
    .replace(/\s+/g, " ")
    .toUpperCase();

  function isOwnedNode(node) {
    if (!node) return false;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
    return Boolean(
      node.id === HOST_ID ||
      node.id === LEGACY_HOST_ID ||
      node.closest?.(`#${HOST_ID}, #${LEGACY_HOST_ID}`)
    );
  }

  function neutralizeLegacyToolbar() {
    const legacy = document.getElementById(LEGACY_HOST_ID);
    if (!legacy) return;
    legacy.dataset.usSignStandaloneDisabled = "true";
    legacy.setAttribute("aria-hidden", "true");
    legacy.style.setProperty("display", "none", "important");
  }

  function panelHeading(panel) {
    const heading = panel?.querySelector(
      ":scope > .panel-heading, :scope > .box-heading, :scope > header"
    );
    if (!heading) return "";

    let text = "";
    for (const node of heading.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += ` ${node.nodeValue || ""}`;
        continue;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      if (node.matches("a,button,input,select,textarea,script,style,.widget-menu,.panel-menu")) continue;
      text += ` ${node.textContent || ""}`;
    }
    return headingText(text);
  }

  function findDescriptionPanel() {
    const explicit = document.querySelector(
      ".us-sign-description-panel, #descriptionbox, #description-box, [data-section='description']"
    );
    if (explicit) return explicit;

    return [...document.querySelectorAll(".panel, .box, section, article")]
      .find((panel) => panelHeading(panel) === "DESCRIPTION") || null;
  }

  function findContent(panel) {
    return panel?.querySelector(":scope > .panel-body, :scope > .box-body") || panel || null;
  }

  function normalizePath(value) {
    let path = clean(value);
    if (!path) return "";

    try {
      path = decodeURIComponent(path);
    } catch (_) {
      /* Raw text is still usable. */
    }

    path = path
      .replace(/^file:(?:\/\/\/?|\\\\)/i, "")
      .replace(/^\/([A-Z]:)/i, "$1")
      .replace(/\//g, "\\")
      .replace(/^["'`(\[]+/, "")
      .replace(/["'`)\],;.]+$/g, "")
      .replace(/\s+(?=(?:NOTE|DESCRIPTION|IMPORTANT|CHECK SET|SURVEY)\s*:).*$/i, "")
      .trim();

    return path;
  }

  function validPath(path) {
    return /^[A-Z]:\\.+/i.test(path) ||
      /^\\\\[^\\\s]+\\[^\\\s]+(?:\\.*)?$/i.test(path);
  }

  function collectReadableText(content) {
    const lines = [];
    const walker = document.createTreeWalker(
      content,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (isOwnedNode(parent)) return NodeFilter.FILTER_REJECT;
          if (parent.closest("script,style,noscript")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      const value = String(node.nodeValue || "").replace(/\u00a0/g, " ").trim();
      if (value) lines.push(value);
    }
    return lines.join("\n");
  }

  function extractPaths(content) {
    if (!content) return [];

    const paths = [];
    const seen = new Set();
    const add = (value) => {
      const path = normalizePath(value);
      const key = path.toLowerCase();
      if (!validPath(path) || seen.has(key)) return;
      seen.add(key);
      paths.push(path);
    };

    for (const link of content.querySelectorAll("a[href]")) {
      if (isOwnedNode(link)) continue;
      add(link.getAttribute("href"));
      add(link.textContent);
    }

    const pattern = /(?:file:(?:\/\/\/?|\\\\))?(?:[A-Z]:[\\/]|\\\\[^\\/\s]+[\\/][^\\/\s]+(?:[\\/]|$))[^<>\r\n]*/gi;
    const text = collectReadableText(content);
    for (const line of text.split("\n")) {
      for (const match of line.match(pattern) || []) add(match);
    }

    return paths;
  }

  async function copyPath(path) {
    if (typeof GM_setClipboard === "function") {
      GM_setClipboard(path, "text");
      return;
    }
    await navigator.clipboard?.writeText?.(path);
  }

  function encodeBase64Url(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  function openInExplorer(path) {
    const anchor = document.createElement("a");
    anchor.href = `${PROTOCOL}://open/${encodeBase64Url(path)}`;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    window.setTimeout(() => anchor.remove(), 800);
  }

  function createToolbar() {
    const host = document.createElement("div");
    host.id = HOST_ID;
    host.style.setProperty("width", "100%", "important");
    host.style.setProperty("margin", "0 0 10px", "important");
    host.style.setProperty("position", "relative", "important");
    host.style.setProperty("z-index", "2", "important");

    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host, *, *::before, *::after { box-sizing: border-box; }
        :host { display:block; width:100%; color:#f4f6f8; font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
        .toolbar { padding:8px; background:rgba(16,20,25,.92); border:1px solid rgba(255,255,255,.085); border-radius:10px; }
        .heading { margin:0 0 6px; color:#8f98a3; font-size:9px; font-weight:600; }
        .list { display:grid; gap:5px; }
        .row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:6px; min-width:0; }
        button { min-height:29px; margin:0; padding:5px 8px; color:#c9ced5; background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.11); border-radius:7px; font:500 10px/1.25 inherit; cursor:pointer; }
        button:hover { color:#fff; background:rgba(255,255,255,.065); }
        .path { min-width:0; overflow:hidden; text-align:left; text-overflow:ellipsis; white-space:nowrap; font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace; font-size:9.5px; }
        .open { white-space:nowrap; font-weight:600; }
      </style>
      <section class="toolbar" aria-label="Description file paths">
        <h3 class="heading">File paths</h3>
        <div class="list"></div>
      </section>
    `;

    shadow.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-path]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const path = button.dataset.path;
      if (button.dataset.action === "open") openInExplorer(path);
      else await copyPath(path);
    });

    return host;
  }

  function render(host, paths) {
    const signature = JSON.stringify(paths);
    if (signature === lastSignature) return;
    lastSignature = signature;

    const list = host.shadowRoot.querySelector(".list");
    list.replaceChildren();

    for (const path of paths) {
      const row = document.createElement("div");
      row.className = "row";

      const copy = document.createElement("button");
      copy.type = "button";
      copy.className = "path";
      copy.dataset.path = path;
      copy.title = path;
      copy.textContent = path;

      const open = document.createElement("button");
      open.type = "button";
      open.className = "open";
      open.dataset.path = path;
      open.dataset.action = "open";
      open.textContent = "Open in Explorer";

      row.append(copy, open);
      list.appendChild(row);
    }
  }

  function mutationOwnedByToolbar(mutation) {
    if (isOwnedNode(mutation.target)) return true;
    if (mutation.type !== "childList") return false;

    const changed = [...mutation.addedNodes, ...mutation.removedNodes];
    return changed.length > 0 && changed.every((node) => isOwnedNode(node));
  }

  function observeContent(content) {
    if (currentContent === content && contentObserver) return;

    contentObserver?.disconnect();
    currentContent = content;
    contentObserver = null;

    if (!content) return;

    contentObserver = new MutationObserver((mutations) => {
      if (mutations.every(mutationOwnedByToolbar)) return;
      scheduleRefresh(180);
    });

    contentObserver.observe(content, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function refresh() {
    refreshTimer = 0;
    neutralizeLegacyToolbar();

    const panel = findDescriptionPanel();
    const content = findContent(panel);

    if (!content) {
      observeContent(null);
      document.getElementById(HOST_ID)?.remove();
      lastSignature = "";
      return;
    }

    observeContent(content);
    const paths = extractPaths(content);

    if (!paths.length) {
      document.getElementById(HOST_ID)?.remove();
      lastSignature = "";
      return;
    }

    let host = document.getElementById(HOST_ID);
    if (!host) host = createToolbar();
    if (host.parentElement !== content) content.prepend(host);
    render(host, paths);
  }

  function scheduleRefresh(delay = 80) {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(refresh, delay);
  }

  scheduleRefresh(0);
  window.setTimeout(() => scheduleRefresh(0), 400);
  window.setTimeout(() => scheduleRefresh(0), 1400);
  window.addEventListener("pageshow", () => scheduleRefresh(40));
  window.addEventListener("us-sign-location-change", () => scheduleRefresh(100));
  window.addEventListener("popstate", () => scheduleRefresh(100));
})();
