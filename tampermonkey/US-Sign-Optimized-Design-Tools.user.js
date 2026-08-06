// ==UserScript==
// @name         US Sign Optimized Design Tools
// @namespace    us-sign-optimized
// @version      1.0.1
// @description  Lightweight Design-page tools with reliable Open Date and Project Manager detection.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  const TOOLBAR_ID = "us-sign-optimized-design-tools";
  const STYLE_ID = "us-sign-optimized-design-style";

  function clean(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function textWithBreaks(root) {
    if (!root) return "";

    const clone = root.cloneNode(true);
    clone.querySelectorAll("script, style, noscript").forEach((node) => node.remove());
    clone.querySelectorAll("br").forEach((node) => node.replaceWith("\n"));
    clone.querySelectorAll("div, p, li, tr, td, th, address, section, header, footer")
      .forEach((node) => node.append("\n"));

    return String(clone.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/[–—]/g, "-")
      .replace(/\r/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function isDesignPage() {
    const path = location.pathname.toLowerCase();
    return (
      path.includes("design") ||
      Boolean(document.querySelector("#designbox, #projectbox")) ||
      [...document.querySelectorAll("table")].some((table) => {
        const text = clean(table.textContent).toLowerCase();
        return text.includes("assigned to") && text.includes("date required");
      })
    );
  }

  function getProjectNumber() {
    const fromTitle = document.title.match(/\b(\d{5,})\b/);
    if (fromTitle) return fromTitle[1];

    const fromRail = textWithBreaks(document.querySelector("#pmlt"))
      .match(/PROJECT\s*(?:NUMBER|NO\.?|#)?\s*(\d{5,})/i);
    if (fromRail) return fromRail[1];

    const id = new URL(location.href).searchParams.get("id") || "";
    return /^\d{5,}$/.test(id) ? id : "";
  }

  function getJobName(projectNumber) {
    const heading = document.querySelector("#customer-name h1, #customer-name h2, #customer-name h3");
    let value = clean(heading?.textContent || document.title);

    if (projectNumber) {
      value = value.replace(new RegExp(`^${projectNumber}(?:-\\d+)?\\s*-\\s*`, "i"), "");
    }

    return value
      .replace(/\s*(?:[-|•·]\s*)?USSM(?:\s*[★☆*])?\s*$/i, "")
      .replace(/\s*-\s*US Sign and Mill.*$/i, "")
      .trim();
  }

  function getOpenDate() {
    const roots = [
      document.querySelector("#customer-info"),
      document.querySelector("#mapcontainer"),
      document.querySelector("#projectbox"),
      document.body
    ].filter(Boolean);

    const patterns = [
      /OPEN\s*DATE\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /DATE\s*OPENED\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /OPENED\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i
    ];

    for (const root of roots) {
      const source = textWithBreaks(root);
      for (const pattern of patterns) {
        const match = source.match(pattern);
        if (match?.[1]) return clean(match[1]);
      }
    }

    return "";
  }

  function getProjectManager() {
    const rail = document.querySelector("#pmlt");
    if (!rail) return "";

    const walker = document.createTreeWalker(rail, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node = walker.nextNode();

    while (node) {
      const value = clean(node.nodeValue).replace(/[–—]/g, "-");
      if (value) nodes.push(value);
      node = walker.nextNode();
    }

    for (let index = 0; index < nodes.length; index += 1) {
      const sameNode = nodes[index].match(/(?:^|\b)(?:PM|PROJECT MANAGER)\s*[-:]\s*(.+)$/i);
      if (sameNode?.[1]) return clean(sameNode[1]);

      if (/^(?:PM|PROJECT MANAGER)\s*[-:]?\s*$/i.test(nodes[index])) {
        for (let next = index + 1; next < nodes.length; next += 1) {
          const candidate = clean(nodes[next]);
          if (!candidate) continue;
          if (/^(?:SALES|PROJECT TOOLS|DESIGN|SCOPE OF WORK|TASKS|DOCUMENTS|PHOTOS)$/i.test(candidate)) break;
          return candidate;
        }
      }
    }

    const lines = textWithBreaks(rail).split("\n").map(clean).filter(Boolean);
    for (let index = 0; index < lines.length; index += 1) {
      const sameLine = lines[index].match(/^(?:PM|PROJECT MANAGER)\s*[-:]\s*(.+)$/i);
      if (sameLine?.[1]) return clean(sameLine[1]);
      if (/^(?:PM|PROJECT MANAGER)\s*[-:]?\s*$/i.test(lines[index])) {
        return clean(lines[index + 1]);
      }
    }

    return "";
  }

  async function copyText(value) {
    const text = clean(value);
    if (!text) throw new Error("Nothing to copy");

    if (typeof GM_setClipboard === "function") {
      GM_setClipboard(text, "text");
      return;
    }

    await navigator.clipboard.writeText(text);
  }

  function flash(button, label) {
    const original = button.textContent;
    button.textContent = label;
    window.setTimeout(() => {
      button.textContent = original;
    }, 1100);
  }

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${TOOLBAR_ID} {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 7px;
        width: 100%;
        margin: 0 0 10px;
        padding: 9px 10px;
        color: #e8edf2;
        background: rgba(20, 25, 31, 0.96);
        border: 1px solid rgba(255, 255, 255, 0.10);
        border-radius: 10px;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.25);
        font-family: Inter, system-ui, sans-serif;
      }

      #${TOOLBAR_ID} .us-sign-summary {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 14px;
        flex: 1 1 420px;
        min-width: 0;
        font-size: 11px;
        color: #bfc8d2;
      }

      #${TOOLBAR_ID} .us-sign-summary strong {
        color: #eef2f5;
      }

      #${TOOLBAR_ID} .us-sign-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-left: auto;
      }

      #${TOOLBAR_ID} button {
        min-height: 30px !important;
        padding: 5px 9px !important;
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
        border-radius: 7px !important;
        background: rgba(255, 255, 255, 0.045) !important;
        color: #dce3e9 !important;
        font-size: 10.5px !important;
        box-shadow: none !important;
      }

      #${TOOLBAR_ID} button:hover {
        background: rgba(255, 255, 255, 0.085) !important;
        color: #ffffff !important;
      }
    `;

    document.head.appendChild(style);
  }

  function findMountPoint() {
    return (
      document.querySelector("#projectbox .panel-body") ||
      document.querySelector("#projectbox") ||
      document.querySelector("#designbox") ||
      document.querySelector("#content .tray-center") ||
      document.querySelector("#content")
    );
  }

  function mount() {
    if (!isDesignPage() || document.getElementById(TOOLBAR_ID)) return true;

    const mountPoint = findMountPoint();
    if (!mountPoint) return false;

    addStyle();
    document.body.classList.add("us-sign-design-page");

    const projectNumber = getProjectNumber();
    const jobName = getJobName(projectNumber);
    const openDate = getOpenDate();
    const projectManager = getProjectManager();

    const toolbar = document.createElement("section");
    toolbar.id = TOOLBAR_ID;

    const summary = document.createElement("div");
    summary.className = "us-sign-summary";
    summary.innerHTML = `
      <span><strong>Job:</strong> ${jobName || "Not detected"}</span>
      <span><strong>Project:</strong> ${projectNumber || "Not detected"}</span>
      <span><strong>PM:</strong> ${projectManager || "Not detected"}</span>
      <span><strong>Open Date:</strong> ${openDate || "Not detected"}</span>
    `;

    const actions = document.createElement("div");
    actions.className = "us-sign-actions";

    const copyJob = document.createElement("button");
    copyJob.type = "button";
    copyJob.textContent = "Copy Job";
    copyJob.addEventListener("click", async () => {
      try {
        await copyText([projectNumber, jobName].filter(Boolean).join(" - "));
        flash(copyJob, "Copied");
      } catch {
        flash(copyJob, "No data");
      }
    });

    const copyDetails = document.createElement("button");
    copyDetails.type = "button";
    copyDetails.textContent = "Copy Details";
    copyDetails.addEventListener("click", async () => {
      const details = [
        projectNumber && `Project: ${projectNumber}`,
        jobName && `Job: ${jobName}`,
        projectManager && `Project Manager: ${projectManager}`,
        openDate && `Open Date: ${openDate}`
      ].filter(Boolean).join("\n");

      try {
        await copyText(details);
        flash(copyDetails, "Copied");
      } catch {
        flash(copyDetails, "No data");
      }
    });

    const maps = document.createElement("button");
    maps.type = "button";
    maps.textContent = "Open Map";
    maps.addEventListener("click", () => {
      const address = clean(document.querySelector("#mapcontainer address, #customer-info address")?.textContent);
      if (!address) {
        flash(maps, "No address");
        return;
      }

      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      if (typeof GM_openInTab === "function") {
        GM_openInTab(url, { active: true, insert: true, setParent: true });
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    });

    actions.append(copyJob, copyDetails, maps);
    toolbar.append(summary, actions);
    mountPoint.prepend(toolbar);

    return true;
  }

  function start() {
    let attempts = 0;
    const retry = () => {
      attempts += 1;
      if (mount() || attempts >= 20) return;
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
