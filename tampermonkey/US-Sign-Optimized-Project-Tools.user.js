// ==UserScript==
// @name         US Sign Optimized Project Tools
// @namespace    us-sign-optimized
// @version      1.0.1
// @description  Lightweight Project-page helpers for Scope of Work and Description file paths.
// @match        https://ussignandmill.squarecoil.net/project.php*
// @run-at       document-idle
// @grant        GM_setClipboard
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  const PATH_TOOL_ID = "us-sign-optimized-path-tools";
  const STYLE_ID = "us-sign-optimized-project-style";
  const PROTOCOL = "ussign-onecommander";

  function clean(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\r/g, "")
      .trim();
  }

  function normalizeHeading(value) {
    return clean(value)
      .replace(/^\/+\s*/, "")
      .replace(/:\s*$/, "")
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      body.us-sign-project-page .us-sign-native-scope-title {
        display: none !important;
      }

      body.us-sign-project-page .us-sign-native-scope-row {
        position: relative !important;
        z-index: 3000 !important;
        overflow: visible !important;
      }

      body.us-sign-project-page .us-sign-native-scope-row .multiselect-native-select,
      body.us-sign-project-page .us-sign-native-scope-row .btn-group {
        position: relative !important;
        overflow: visible !important;
      }

      body.us-sign-project-page .us-sign-native-scope-row .multiselect-container.dropdown-menu {
        position: absolute !important;
        top: calc(100% + 6px) !important;
        right: 0 !important;
        left: auto !important;
        z-index: 2147483000 !important;
        width: min(430px, calc(100vw - 32px)) !important;
        min-width: 100% !important;
        max-height: 360px !important;
        overflow-y: auto !important;
      }

      #${PATH_TOOL_ID} {
        width: 100%;
        margin: 8px 0 0;
        padding: 9px;
        background: rgba(20, 25, 31, 0.96);
        border: 1px solid rgba(255, 255, 255, 0.10);
        border-radius: 9px;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.24);
        font-family: Inter, system-ui, sans-serif;
      }

      #${PATH_TOOL_ID} .us-sign-path-heading {
        margin: 0 0 7px;
        color: #9aa5b1;
        font-size: 10px;
        font-weight: 600;
      }

      #${PATH_TOOL_ID} .us-sign-path-list {
        display: grid;
        gap: 7px;
      }

      #${PATH_TOOL_ID} .us-sign-path-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 7px;
      }

      #${PATH_TOOL_ID} button {
        min-height: 31px !important;
        padding: 6px 9px !important;
        border: 1px solid rgba(255, 255, 255, 0.13) !important;
        border-radius: 7px !important;
        background: rgba(255, 255, 255, 0.04) !important;
        color: #c7d0d8 !important;
        font-size: 10.5px !important;
        box-shadow: none !important;
      }

      #${PATH_TOOL_ID} button:hover {
        background: rgba(255, 255, 255, 0.08) !important;
        color: #ffffff !important;
      }

      #${PATH_TOOL_ID} .us-sign-path-copy {
        overflow: hidden;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: Consolas, "Courier New", monospace !important;
      }

      @media (max-width: 650px) {
        #${PATH_TOOL_ID} .us-sign-path-row {
          grid-template-columns: minmax(0, 1fr);
        }

        #${PATH_TOOL_ID} .us-sign-path-copy {
          white-space: normal;
          overflow-wrap: anywhere;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function findScopeWell() {
    const select = document.querySelector("#ps-select");
    const textarea = document.querySelector("textarea#description");
    if (!select || !textarea) return null;

    const well = select.closest(".well");
    const form = textarea.closest("form");
    if (!well || !form || !well.contains(form)) return null;

    return { well, select, form };
  }

  function prepareNativeScope() {
    const context = findScopeWell();
    if (!context) return false;

    const { well, select } = context;
    document.body.classList.add("us-sign-project-page");

    const wrapper = select.closest(".multiselect-native-select") || select.parentElement;
    const directRow = wrapper?.closest(".row") || wrapper?.parentElement;
    directRow?.classList.add("us-sign-native-scope-row");

    const candidates = [
      ...well.querySelectorAll("strong, b, label, h1, h2, h3, h4")
    ];

    const nativeTitles = candidates.filter((element) => {
      if (element.closest(`#${PATH_TOOL_ID}`)) return false;
      return normalizeHeading(element.textContent) === "SCOPE OF WORK";
    });

    if (nativeTitles.length > 1) {
      nativeTitles.slice(1).forEach((element) => {
        element.classList.add("us-sign-native-scope-title");
      });
    }

    return true;
  }

  function findDescriptionPanel() {
    const exact = document.querySelector("#descriptionbox, #description-box, [data-section='description']");
    if (exact) return exact;

    return [...document.querySelectorAll(".panel, .box, section, article")]
      .find((panel) => {
        const heading = panel.querySelector(":scope > .panel-heading, :scope > .box-heading, :scope > header");
        if (!heading) return false;
        const clone = heading.cloneNode(true);
        clone.querySelectorAll("a, button, input, select, textarea, script, style").forEach((node) => node.remove());
        return normalizeHeading(clone.textContent) === "DESCRIPTION";
      }) || null;
  }

  function normalizePath(value) {
    let path = clean(value);
    if (!path) return "";

    try {
      path = decodeURIComponent(path);
    } catch {
      // Keep original text.
    }

    return path
      .replace(/^file:(?:\/\/\/?|\\\\)/i, "")
      .replace(/^\/([A-Z]:)/i, "$1")
      .replace(/\//g, "\\")
      .replace(/^["'`(\[]+/, "")
      .replace(/["'`)\],;.]+$/g, "")
      .replace(/\s+(?=(?:NOTE|DESCRIPTION|IMPORTANT|CHECK SET|SURVEY)\s*:).*$/i, "")
      .trim();
  }

  function isValidPath(path) {
    return /^[A-Z]:\\.+/i.test(path) || /^\\\\[^\\\s]+\\[^\\\s]+(?:\\.*)?$/i.test(path);
  }

  function extractPaths(panel) {
    if (!panel) return [];

    const clone = panel.cloneNode(true);
    clone.querySelector(`#${PATH_TOOL_ID}`)?.remove();
    clone.querySelectorAll("script, style, noscript").forEach((node) => node.remove());

    const paths = [];
    const add = (value) => {
      const path = normalizePath(value);
      if (!isValidPath(path) || paths.includes(path)) return;
      paths.push(path);
    };

    clone.querySelectorAll("a[href]").forEach((link) => {
      add(link.getAttribute("href"));
      add(link.textContent);
    });

    const text = String(clone.innerText || clone.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/\r/g, "");

    const pattern = /(?:file:(?:\/\/\/?|\\\\))?(?:[A-Z]:[\\/]|\\\\[^\\/\s]+[\\/][^\\/\s]+(?:[\\/]|$))[^<>\r\n]*/gi;

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
    await navigator.clipboard.writeText(path);
  }

  function encodeBase64Url(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function openInOneCommander(path) {
    const link = document.createElement("a");
    link.href = `${PROTOCOL}://open/${encodeBase64Url(path)}`;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => link.remove(), 1000);
  }

  function flash(button, label) {
    const original = button.textContent;
    button.textContent = label;
    window.setTimeout(() => {
      button.textContent = original;
    }, 1100);
  }

  function mountPathTools() {
    if (document.getElementById(PATH_TOOL_ID)) return true;

    const panel = findDescriptionPanel();
    if (!panel) return false;

    const content = panel.querySelector(":scope > .panel-body, :scope > .box-body") || panel;
    const paths = extractPaths(content);
    if (!paths.length) return true;

    const host = document.createElement("section");
    host.id = PATH_TOOL_ID;

    const heading = document.createElement("div");
    heading.className = "us-sign-path-heading";
    heading.textContent = "File paths";

    const list = document.createElement("div");
    list.className = "us-sign-path-list";

    for (const path of paths) {
      const row = document.createElement("div");
      row.className = "us-sign-path-row";

      const copy = document.createElement("button");
      copy.type = "button";
      copy.className = "us-sign-path-copy";
      copy.textContent = path;
      copy.title = `Copy ${path}`;
      copy.addEventListener("click", async () => {
        try {
          await copyPath(path);
          flash(copy, "Copied");
        } catch {
          flash(copy, "Failed");
        }
      });

      const open = document.createElement("button");
      open.type = "button";
      open.textContent = "Open";
      open.addEventListener("click", () => {
        openInOneCommander(path);
        flash(open, "Opening");
      });

      row.append(copy, open);
      list.appendChild(row);
    }

    host.append(heading, list);
    content.prepend(host);
    return true;
  }

  function start() {
    addStyle();
    document.body.classList.add("us-sign-project-page");

    let attempts = 0;
    const retry = () => {
      attempts += 1;
      const scopeReady = prepareNativeScope();
      const pathsReady = mountPathTools();

      if ((scopeReady && pathsReady) || attempts >= 20) return;
      window.setTimeout(retry, 250);
    };

    retry();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
