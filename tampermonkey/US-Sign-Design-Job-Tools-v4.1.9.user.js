// ==UserScript==
// @name         US Sign - Design Job Tools
// @namespace    us-sign-local-tools
// @version      4.1.9
// @description  Stable Design workspace with a unified project identity row plus focused DOM structure, geometry, data, and interactions; Dark Glass paint is owned centrally by Full UI Theme.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Design-Job-Tools.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Design-Job-Tools.user.js
// ==/UserScript==

(function () {
  "use strict";

  const IDS = {
    style: "us-sign-design-runtime-style",
    actionbar: "us-sign-design-actionbar",
    copyTools: "us-sign-job-copy-tools",
    nativeActions: "us-sign-native-action-group",
    overview: "us-sign-job-overview",
    summary: "us-sign-design-summary",
    bottomGrid: "us-sign-design-bottom-grid",
    rightStack: "us-sign-design-right-stack",
    lookup: "us-sign-job-lookup-button",
    projectHeader: "us-sign-design-project-header"
  };

  const VERSION = "4.1.9";

  function installDarkGlassThemeBridge() {
    if (!document.documentElement?.classList.contains("us-sign-theme-dark-glass")) return;
    document.documentElement.dataset.usSignDesignPaintOwner = "full-ui";
  }

  installDarkGlassThemeBridge();


  const NATIVE_ACTION_ORDER = [
    "EDIT",
    "EMAIL FILE",
    "EMAIL LINK",
    "PRINT",
    "DELETE"
  ];

  const SUMMARY_FIELDS = [
    { label: "Job Type", key: "designType", kind: "type" },
    { label: "Due Date", key: "dateRequired", kind: "due" },
    { label: "Priority", key: "priority", kind: "priority" },
    { label: "Hours", key: "hours", kind: "hours" },
    { label: "Status", key: "status", kind: "status" }
  ];

  const PATH_HOST_IDS = [
    "us-sign-description-path-tools",
    "us-sign-description-path-tools-standalone"
  ];

  const STATUS_PATTERN = /^(?:SUBMITTED|IN PROGRESS|COMPLETE|COMPLETED|PENDING|PENDING REVIEW|ON HOLD|READY|READY TO BEGIN|APPROVED|REJECTED|CANCELLED|CANCELED|DRAFT|ACTIVE|OPEN|CLOSED|REVISION|IN REVISION|DESIGNING|PRODUCTION)$/i;

  const SECTION_STOP_LABELS = new Set([
    "SALES", "PROJECT TOOLS", "DESIGN", "SCOPE OF WORK", "PROJECT STATUS",
    "TASKS", "DOCUMENTS", "PHOTOS", "PRODUCTION FILES"
  ]);

  const state = {
    table: null,
    workspace: null,
    data: null,
    mounting: false,
    refreshTimer: null,
    startupTimer: null,
    startupStopTimer: null,
    startupObserver: null,
    dataObserver: null,
    lastDataSignature: ""
  };

  function clean(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\s*\n\s*/g, " ")
      .trim();
  }

  function cleanBlock(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\r/g, "")
      .replace(/[ \t]+$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function textWithBreaks(root) {
    if (!root) return "";
    const clone = root.cloneNode(true);
    for (const element of clone.querySelectorAll("script, style, noscript")) element.remove();
    for (const br of clone.querySelectorAll("br")) br.replaceWith("\n");
    for (const element of clone.querySelectorAll([
      "div", "p", "li", "tr", "td", "th", "address", "section", "header", "footer"
    ].join(", "))) element.append("\n");
    return String(clone.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/[–—]/g, "-")
      .replace(/\r/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function firstNonEmpty(...values) {
    return values.map(clean).find(Boolean) || "";
  }

  function normalizeHeading(value) {
    return clean(value).replace(/^\/+\s*/, "").replace(/:\s*$/, "").toUpperCase();
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function setImportant(element, property, value) {
    if (element) element.style.setProperty(property, value, "important");
  }

  function directChildUnder(parent, element) {
    let current = element;
    while (current?.parentElement && current.parentElement !== parent) current = current.parentElement;
    return current?.parentElement === parent ? current : null;
  }

  function cleanJobName(value, projectNumber = "") {
    let name = clean(value)
      .replace(/\s*(?:[-|•·]\s*)?USSM(?:\s*[★☆*])?\s*$/i, "")
      .trim();
    if (projectNumber) {
      name = name.replace(new RegExp(`^${escapeRegExp(projectNumber)}(?:-\\d+)?\\s*-\\s*`, "i"), "");
    }
    return name;
  }

  async function copyText(value) {
    const text = String(value || "").trim();
    if (!text) throw new Error("No text found");
    if (typeof GM_setClipboard === "function") {
      GM_setClipboard(text, "text");
      return;
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    helper.style.pointerEvents = "none";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }

  function flash(button, message, isError = false) {
    if (!button || button.dataset.flashing === "true") return;
    const original = button.dataset.originalHtml || button.innerHTML;
    button.dataset.originalHtml = original;
    button.dataset.flashing = "true";
    button.textContent = message;
    button.classList.toggle("error", isError);
    window.setTimeout(() => {
      button.innerHTML = original;
      button.classList.remove("error");
      delete button.dataset.flashing;
    }, 1250);
  }

  function openMaps(address) {
    if (!address) throw new Error("No address found");
    const url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);
    if (typeof GM_openInTab === "function") {
      GM_openInTab(url, { active: true, insert: true, setParent: true });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function findDesignTable() {
    return [...document.querySelectorAll("table")].find((table) => {
      const text = clean(table.innerText || table.textContent).toLowerCase();
      return text.includes("number") && text.includes("assigned to") && text.includes("date required");
    }) || null;
  }

  function getDirectPanelHeading(panel) {
    if (!panel) return "";
    const heading = panel.querySelector(":scope > .panel-heading, :scope > .box-heading, :scope > header");
    if (!heading) return "";
    const clone = heading.cloneNode(true);
    clone.querySelectorAll([
      "a", "button", "input", "select", "textarea", "form", "script", "style",
      ".widget-menu", ".panel-menu", ".popup-modal", ".popup-basic", ".mfp-hide", ".modal"
    ].join(", ")).forEach((element) => element.remove());
    return normalizeHeading(clone.textContent);
  }

  function findWorkspace(table = findDesignTable()) {
    if (!table) return null;
    const workspaceBody = table.closest(".panel-body");
    const workspacePanel = workspaceBody?.closest(".panel");
    const workspaceColumn = workspacePanel?.closest(".col-md-9, [class*='col-md-']");
    const row = workspaceColumn?.parentElement?.classList.contains("row")
      ? workspaceColumn.parentElement
      : workspaceColumn?.closest(".row");
    if (!workspaceBody || !workspacePanel || !workspaceColumn || !row) return null;
    const siblingColumns = [...row.children].filter((element) => element !== workspaceColumn);
    const sourceColumn = siblingColumns.find((column) =>
      [...column.querySelectorAll(".panel")].some((panel) => getDirectPanelHeading(panel) === "DESIGNS")
    ) || siblingColumns.find((column) => column.classList.contains("us-sign-design-source-column")) || siblingColumns[0] || null;
    if (!sourceColumn) return null;
    const tableAnchor = directChildUnder(workspaceBody, table);
    if (!tableAnchor) return null;
    return { table, row, sourceColumn, workspaceColumn, workspacePanel, workspaceBody, tableAnchor };
  }

  function findNativeSections(workspace) {
    const panels = [...workspace.workspaceBody.querySelectorAll(".panel")];
    const descriptionPanel = panels.find((panel) => getDirectPanelHeading(panel) === "DESCRIPTION") || null;
    const filesPanel = panels.find((panel) => getDirectPanelHeading(panel) === "FILES") || null;
    if (!descriptionPanel || !filesPanel || descriptionPanel === filesPanel) return null;
    return { descriptionPanel, filesPanel };
  }

  function findDesignsPanel(workspace) {
    const movedPanel = document.querySelector(`#${IDS.rightStack} > .us-sign-designs-panel`);
    if (movedPanel) return movedPanel;
    return [...workspace.sourceColumn.querySelectorAll(".panel")]
      .find((panel) => getDirectPanelHeading(panel) === "DESIGNS") || null;
  }

  function readCellValue(cell) {
    if (!cell) return "";
    const input = cell.querySelector("input, textarea, select");
    if (input) {
      return clean(input.tagName === "SELECT" ? input.selectedOptions?.[0]?.textContent : input.value);
    }
    return clean(cell.innerText || cell.textContent);
  }

  function normalizeTableLabel(value) {
    return clean(value).replace(/:\s*$/, "").toLowerCase();
  }

  function isLabelCell(cell) {
    return /:\s*$/.test(clean(cell?.innerText || cell?.textContent));
  }

  function findKnownStatus(table) {
    const controlSelectors = [
      "select[name*='status' i]", "input[name*='status' i]", "select[id*='status' i]",
      "input[id*='status' i]", "[data-status]", "[class*='status' i]"
    ];
    for (const selector of controlSelectors) {
      for (const element of table.querySelectorAll(selector)) {
        const value = element.tagName === "SELECT"
          ? clean(element.selectedOptions?.[0]?.textContent)
          : clean(element.value || element.innerText || element.textContent || element.getAttribute("data-status"));
        if (value && STATUS_PATTERN.test(value)) return value;
      }
    }
    for (const element of table.querySelectorAll("td, th, span, strong, label, a, button")) {
      const value = clean(element.innerText || element.textContent);
      if (value && STATUS_PATTERN.test(value)) return value;
    }
    return "";
  }

  function readTablePairs(table) {
    const values = {};
    const rows = [...(table?.rows || [])];
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const cells = [...rows[rowIndex].cells];
      for (let cellIndex = 0; cellIndex < cells.length; cellIndex += 1) {
        const rawLabel = clean(cells[cellIndex]?.innerText || cells[cellIndex]?.textContent);
        if (!/:\s*$/.test(rawLabel)) continue;
        const label = normalizeTableLabel(rawLabel);
        let value = "";
        for (let nextIndex = cellIndex + 1; nextIndex < cells.length; nextIndex += 1) {
          const nextCell = cells[nextIndex];
          const nextText = clean(nextCell?.innerText || nextCell?.textContent);
          if (!nextText) continue;
          if (isLabelCell(nextCell)) break;
          value = readCellValue(nextCell);
          if (value) break;
        }
        if (!value && label === "status") {
          for (let nextRowIndex = rowIndex + 1; nextRowIndex < Math.min(rows.length, rowIndex + 4); nextRowIndex += 1) {
            const nextCells = [...rows[nextRowIndex].cells];
            for (const nextCell of nextCells) {
              const candidate = readCellValue(nextCell);
              if (candidate && STATUS_PATTERN.test(candidate)) {
                value = candidate;
                break;
              }
            }
            if (value) break;
          }
        }
        if (label && value) values[label] = value;
      }
    }
    if (!values.status) values.status = findKnownStatus(table);
    return values;
  }

  function getProjectNumber(details) {
    const designNumber = details.number || details["design number"] || "";
    const match = designNumber.match(/^(\d{5,})/);
    if (match) return match[1];
    const rail = cleanBlock(document.querySelector("#pmlt")?.innerText);
    const railMatch = rail.match(/PROJECT\s*(?:NUMBER|NO\.?|#|NODE|MODE)?\s*(\d{5,})/i);
    if (railMatch) return railMatch[1];
    const urlNumber = new URL(location.href).searchParams.get("id") || "";
    return /^\d{5,}$/.test(urlNumber) ? urlNumber : "";
  }

  function getJobName(projectNumber) {
    const heading = document.querySelector("#customer-name h1") ||
      document.querySelector("#customer-name h2") ||
      document.querySelector("#customer-name h3");
    return heading ? cleanJobName(heading.innerText, projectNumber) : "";
  }

  function getPlazaName(jobName) {
    const parts = clean(jobName).split(/\s+-\s+/).map(clean).filter(Boolean);
    if (parts.length >= 3) return parts.slice(1, -1).join(" - ");
    if (parts.length === 2) return parts[1];
    return "";
  }

  function getProjectManager() {
    const rail = document.querySelector("#pmlt");
    if (!rail) return "";
    const walker = document.createTreeWalker(rail, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node = walker.nextNode();
    while (node) {
      const value = clean(node.nodeValue);
      if (value) textNodes.push(value);
      node = walker.nextNode();
    }
    for (let index = 0; index < textNodes.length; index += 1) {
      const value = textNodes[index].replace(/[–—]/g, "-");
      const sameNode = value.match(/(?:^|\b)(?:PM|PROJECT MANAGER)\s*[-:]\s*(.+)$/i);
      if (sameNode?.[1]) {
        const manager = clean(sameNode[1]);
        if (manager && !SECTION_STOP_LABELS.has(normalizeHeading(manager))) return manager;
      }
      if (/^(?:PM|PROJECT MANAGER)\s*[-:]?\s*$/i.test(value)) {
        for (let nextIndex = index + 1; nextIndex < textNodes.length; nextIndex += 1) {
          const candidate = clean(textNodes[nextIndex]);
          if (!candidate) continue;
          if (SECTION_STOP_LABELS.has(normalizeHeading(candidate))) break;
          if (/^(?:SALES|PM|PROJECT MANAGER)\s*[-:]?$/i.test(candidate)) continue;
          return candidate;
        }
      }
    }
    const lines = textWithBreaks(rail).split("\n").map(clean).filter(Boolean);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const sameLine = line.match(/^(?:PM|PROJECT MANAGER)\s*[-:]\s*(.+)$/i);
      if (sameLine?.[1]) return clean(sameLine[1]);
      if (/^(?:PM|PROJECT MANAGER)\s*[-:]?\s*$/i.test(line)) {
        const candidate = clean(lines[index + 1]);
        if (candidate && !SECTION_STOP_LABELS.has(normalizeHeading(candidate))) return candidate;
      }
    }
    return "";
  }

  function formatDesigner(name) {
    const parts = clean(name).replace(/[.,]+$/g, "").split(/\s+/).filter(Boolean);
    if (!parts.length) return "";
    if (parts.length === 1) return parts[0];
    const initial = parts.at(-1)?.match(/[A-Z]/i)?.[0];
    return initial ? `${parts[0]} ${initial.toUpperCase()}.` : parts[0];
  }

  function parseAddress(value) {
    let address = clean(value)
      .replace(/\b(?:UNITED STATES(?: OF AMERICA)?|U\.?S\.?A\.?)\b/gi, "")
      .replace(/\s*\|\s*/g, ", ")
      .replace(/\s*,\s*/g, ", ")
      .replace(/[,\s]+$/g, "")
      .trim();
    const stateMatch = address.match(/(?:,\s*|\s)([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\b/i);
    const stateZip = stateMatch ? `${stateMatch[1].toUpperCase()} ${stateMatch[2]}` : "";
    let beforeState = stateMatch ? address.slice(0, stateMatch.index) : address;
    beforeState = beforeState.replace(/[,\s]+$/g, "").trim();
    const parts = beforeState.split(/\s*,\s*/).map(clean).filter(Boolean);
    let streetAddress = "";
    let city = "";
    if (parts.length >= 2) {
      streetAddress = parts.slice(0, -1).join(", ");
      city = parts.at(-1);
    } else {
      streetAddress = beforeState;
    }
    const fullAddress = [streetAddress, city, stateZip].filter(Boolean).join(", ");
    return { streetAddress, city, stateZip, fullAddress: fullAddress || address };
  }

  function getCustomerInformation() {
    const root = document.querySelector("#customer-info");
    if (!root) return { streetAddress: "", city: "", stateZip: "", fullAddress: "", openDate: "" };
    const sourceText = textWithBreaks(root);
    const visibleText = cleanBlock(root.innerText || "");
    const datePatterns = [
      /OPEN\s*DATE\s*:?[ \t]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /DATE\s*OPENED\s*:?[ \t]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /OPENED\s*:?[ \t]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i
    ];
    let openDate = "";
    for (const pattern of datePatterns) {
      const match = sourceText.match(pattern) || visibleText.match(pattern);
      if (match?.[1]) {
        openDate = clean(match[1]);
        break;
      }
    }
    if (!openDate) {
      const labeledElement = [...root.querySelectorAll("span, div, p, label, strong, b, td, th")]
        .find((element) => /OPEN\s*DATE|DATE\s*OPENED/i.test(element.textContent || ""));
      const match = labeledElement?.textContent?.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
      openDate = clean(match?.[1]);
    }
    const addressElement = root.querySelector("address") || root.querySelector(".panel-title");
    let address = cleanBlock(addressElement?.textContent || addressElement?.innerText || "");
    if (!address) {
      address = sourceText
        .replace(/(?:OPEN\s*DATE|DATE\s*OPENED|OPENED)\s*:?[ \t]*\d{1,2}\/\d{1,2}\/\d{2,4}/gi, "")
        .replace(/^\/+\s*/, "");
    }
    return {
      ...parseAddress(address.split("\n").map(clean).filter(Boolean).join(", ")),
      openDate
    };
  }

  function getDescriptionText(workspace) {
    const sections = findNativeSections(workspace);
    const panel = sections?.descriptionPanel;
    if (!panel) return "";
    const clone = panel.cloneNode(true);
    clone.querySelector(":scope > .panel-heading")?.remove();
    for (const id of PATH_HOST_IDS) clone.querySelector(`#${id}`)?.remove();
    return cleanBlock(clone.innerText || clone.textContent)
      .replace(/^(?:\/\/\s*)?DESCRIPTION\s*:?\s*/i, "")
      .trim();
  }

  function collectJobData(table, workspace) {
    const details = readTablePairs(table);
    const designNumber = details.number || details["design number"] || "";
    const projectNumber = getProjectNumber(details);
    const revision = designNumber.match(/^\d{5,}-(.+)$/i)?.[1] || "";
    const jobName = getJobName(projectNumber);
    const address = getCustomerInformation();
    const openDate = firstNonEmpty(address.openDate, details["open date"], details["date opened"], details.opened);
    const projectManager = firstNonEmpty(
      getProjectManager(), details["project manager"], details.pm, details["assigned project manager"]
    );
    const designer = details.designer || details["assigned designer"] || details["assigned to"] || "";
    return {
      projectNumber,
      designNumber,
      projectRevision: [projectNumber, clean(revision)].filter(Boolean).join(" · "),
      projectReference: [projectNumber, jobName].filter(Boolean).join(" - "),
      plazaName: getPlazaName(jobName),
      openDate,
      projectManager,
      designer: formatDesigner(designer),
      fullAddress: address.fullAddress,
      streetAddress: address.streetAddress,
      city: address.city,
      stateZip: address.stateZip,
      designType: details.type || details["design type"] || "",
      dateRequired: details["date required"] || details["due date"] || details.due || "",
      priority: details.priority || "",
      hours: details.hours || details["design hours"] || "",
      status: details.status || "",
      description: getDescriptionText(workspace)
    };
  }

  function buildFullBrief(data) {
    return [
      "JOB BRIEF", "",
      `PROJECT NUMBER: ${data.projectNumber}`,
      `PROJECT REFERENCE: ${data.projectReference}`,
      `PLAZA NAME: ${data.plazaName}`, "",
      `STREET ADDRESS: ${data.streetAddress}`,
      `CITY: ${data.city}`,
      `STATE + ZIP: ${data.stateZip}`,
      `FULL ADDRESS: ${data.fullAddress}`, "",
      `OPEN DATE: ${data.openDate}`,
      `PROJECT MANAGER: ${data.projectManager}`,
      `DESIGNER: ${data.designer}`, "",
      "DESCRIPTION",
      data.description
    ].join("\n");
  }

  function installStyles() {
    let style = document.getElementById(IDS.style);
    if (!style) {
      style = document.createElement("style");
      style.id = IDS.style;
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = `
      .us-sign-search-with-lookup { display:inline-flex!important;align-items:center!important;gap:7px!important;width:auto!important;max-width:none!important; }
      #${IDS.lookup} { display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 auto!important;width:auto!important;min-width:max-content!important;min-height:34px!important;height:34px!important;margin:0!important;padding:0 11px!important;color:#bcc4cd!important;background:rgba(255,255,255,.025)!important;background-image:none!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:7px!important;box-shadow:none!important;font-size:11px!important;font-weight:550!important;letter-spacing:0!important;line-height:1!important;text-transform:none!important;white-space:nowrap!important; }
      #${IDS.lookup}:hover,#${IDS.lookup}:focus-visible { color:#e8edf2!important;background:rgba(255,255,255,.045)!important;border-color:rgba(255,255,255,.15)!important;outline:none!important; }
      #${IDS.lookup}:disabled { color:#87919c!important;opacity:.52!important; }
      html body:has(#pmlt) #content .row.us-sign-design-workbench { display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:0!important;width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;padding:0!important; }
      html body:has(#pmlt) #content .row.us-sign-design-workbench>.us-sign-design-source-column { display:none!important;width:0!important;max-width:0!important;min-width:0!important;margin:0!important;padding:0!important; }
      html body:has(#pmlt) #content .row.us-sign-design-workbench>.us-sign-design-workspace-column { grid-column:1/-1!important;float:none!important;width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;padding:0!important; }
      .us-sign-empty-native-heading,.us-sign-native-workspace-heading-hidden { display:none!important;height:0!important;min-height:0!important;max-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;border:0!important; }
      #${IDS.actionbar},#${IDS.overview},#${IDS.summary},#${IDS.copyTools},#${IDS.nativeActions},#${IDS.bottomGrid},#${IDS.rightStack},#${IDS.lookup},.us-sign-search-with-lookup { --djt-surface:var(--us-design-surface,rgba(16,20,25,.90));--djt-surface-strong:var(--us-design-surface-strong,rgba(13,17,22,.96));--djt-surface-soft:var(--us-design-surface-soft,rgba(255,255,255,.025));--djt-hover:var(--us-design-hover,var(--us-hover,rgba(255,255,255,.045)));--djt-border:var(--us-design-border,var(--us-border,rgba(255,255,255,.06)));--djt-border-strong:var(--us-design-border-strong,var(--us-border-strong,rgba(255,255,255,.10)));--djt-text:var(--us-text,#e8edf2);--djt-text-soft:var(--us-text-soft,#bcc4cd);--djt-text-muted:var(--us-text-muted,#87919c);--djt-accent-soft:var(--us-design-accent-soft,var(--us-accent-soft,rgba(127,146,166,.13)));--djt-danger:var(--us-danger,#c7a3a3);--djt-warning:var(--us-warning,#d0b786);--djt-radius-sm:var(--us-radius-sm,7px);--djt-radius-lg:var(--us-radius-lg,14px);--djt-font:var(--us-font,var(--font-ui,"Inter",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif));font-family:var(--djt-font)!important;text-shadow:none!important; }
      #${IDS.actionbar} { display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;justify-content:flex-start!important;gap:8px!important;width:100%!important;max-width:none!important;min-width:0!important;min-height:46px!important;margin:0!important;padding:7px 9px!important;overflow-x:auto!important;overflow-y:hidden!important;background:var(--djt-surface-strong)!important;background-image:none!important;border:1px solid var(--djt-border)!important;border-radius:var(--djt-radius-lg) var(--djt-radius-lg) 0 0!important;box-shadow:none!important;white-space:nowrap!important;scrollbar-width:none!important; }
      #${IDS.actionbar}::-webkit-scrollbar { display:none!important; }
      #${IDS.copyTools},#${IDS.copyTools} .us-sign-copy-toolbar,#${IDS.nativeActions} { display:inline-flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;gap:6px!important;flex:0 0 auto!important;width:max-content!important;min-width:max-content!important;margin:0!important;padding:0!important; }
      #${IDS.nativeActions} { margin-left:auto!important; }
      #${IDS.copyTools} button,#${IDS.nativeActions}>.us-sign-native-action { display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 auto!important;min-height:30px!important;height:30px!important;margin:0!important;padding:0 10px!important;color:var(--djt-text-soft)!important;background:var(--djt-surface-soft)!important;background-image:none!important;border:1px solid var(--djt-border-strong)!important;border-radius:var(--djt-radius-sm)!important;box-shadow:none!important;font-size:11px!important;font-weight:550!important;letter-spacing:0!important;line-height:1!important;text-transform:none!important;white-space:nowrap!important; }
      #${IDS.copyTools} button.primary { color:var(--djt-text)!important;background:var(--djt-accent-soft)!important;border-color:rgba(127,146,166,.22)!important; }
      #${IDS.copyTools} button:hover,#${IDS.nativeActions}>.us-sign-native-action:hover { color:var(--djt-text)!important;background:var(--djt-hover)!important;border-color:rgba(255,255,255,.15)!important; }
      #${IDS.copyTools} button:disabled,#${IDS.nativeActions}>.us-sign-native-action:disabled { color:var(--djt-text-muted)!important;background:rgba(255,255,255,.018)!important;opacity:.48!important; }
      #${IDS.overview} { display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;width:100%!important;min-width:0!important;background:var(--djt-surface)!important;border:1px solid var(--djt-border)!important;border-top:0!important;box-shadow:none!important; }
      #${IDS.overview} .us-sign-overview-title { display:flex!important;align-items:center!important;padding:0 12px!important;color:var(--djt-text-muted)!important;background:rgba(255,255,255,.018)!important;border-right:1px solid var(--djt-border)!important;font-size:10px!important;font-weight:600!important;text-transform:none!important; }
      #${IDS.overview} .us-sign-overview-stack { display:grid!important;min-width:0!important; }
      #${IDS.overview} .us-sign-overview-row { display:grid!important;width:100%!important;min-width:0!important; }
      #${IDS.overview} .us-sign-overview-row:first-child { grid-template-columns:minmax(112px,.88fr) minmax(150px,2fr) minmax(110px,1.2fr) minmax(82px,.78fr) minmax(105px,1fr) minmax(95px,.9fr)!important; }
      #${IDS.overview} .us-sign-overview-row:last-child { grid-template-columns:minmax(230px,2.2fr) minmax(170px,1.55fr) minmax(110px,.95fr) minmax(100px,.82fr)!important; }
      #${IDS.overview} .us-sign-overview-field { display:grid!important;align-content:center!important;justify-items:start!important;gap:3px!important;min-width:0!important;min-height:48px!important;margin:0!important;padding:7px 10px!important;overflow:hidden!important;color:var(--djt-text)!important;background:transparent!important;border:0!important;border-right:1px solid var(--djt-border)!important;border-radius:0!important;text-align:left!important; }
      #${IDS.overview} .us-sign-overview-label { color:var(--djt-text-muted)!important;font-size:9px!important;font-weight:550!important;text-transform:none!important; }
      #${IDS.overview} .us-sign-overview-value { display:block!important;width:100%!important;overflow:hidden!important;color:var(--djt-text-soft)!important;font-size:11px!important;font-weight:550!important;text-overflow:ellipsis!important;white-space:nowrap!important; }
      #${IDS.summary} { display:grid!important;grid-template-columns:minmax(190px,2.2fr) minmax(112px,1fr) minmax(94px,.85fr) minmax(72px,.55fr) minmax(112px,.95fr)!important;grid-template-rows:minmax(58px,auto)!important;align-items:stretch!important;width:100%!important;min-width:0!important;min-height:58px!important;margin:0!important;padding:0!important;overflow:hidden!important;background:var(--djt-surface)!important;border:1px solid var(--djt-border)!important;border-top:0!important;border-radius:0 0 var(--djt-radius-lg) var(--djt-radius-lg)!important;box-shadow:none!important; }
      #${IDS.summary}>.us-sign-djt-summary-cell { position:static!important;float:none!important;display:grid!important;align-content:center!important;justify-items:start!important;gap:4px!important;min-width:0!important;min-height:58px!important;margin:0!important;padding:8px 11px!important;transform:none!important;border-right:1px solid var(--djt-border)!important; }
      #${IDS.summary}>.us-sign-djt-summary-cell:last-child { border-right:0!important; }
      #${IDS.summary} .us-sign-djt-summary-label { color:var(--djt-text-muted)!important;font-size:9px!important;font-weight:550!important;line-height:1.15!important;text-transform:none!important;white-space:nowrap!important; }
      #${IDS.summary} .us-sign-djt-summary-value { display:block!important;max-width:100%!important;overflow:hidden!important;color:var(--djt-text)!important;font-size:12px!important;font-weight:600!important;line-height:1.25!important;text-overflow:ellipsis!important;white-space:nowrap!important; }
      #${IDS.summary}>[data-summary-kind="hours"] { justify-items:center!important;text-align:center!important; }
      #${IDS.summary}>[data-summary-kind="hours"] .us-sign-djt-summary-value { font-size:16px!important; }
      #${IDS.summary}>[data-summary-kind="priority"] .us-sign-djt-summary-value,#${IDS.summary}>[data-summary-kind="status"] .us-sign-djt-summary-value { width:auto!important;padding:3px 7px!important;color:var(--djt-text-soft)!important;background:rgba(255,255,255,.035)!important;border:1px solid var(--djt-border-strong)!important;border-radius:999px!important;font-size:10px!important;font-weight:550!important; }
      #${IDS.summary}>[data-due-state="overdue"] .us-sign-djt-summary-value { color:var(--djt-danger)!important; }
      #${IDS.summary}>[data-due-state="critical"] .us-sign-djt-summary-value { color:var(--djt-warning)!important; }
      #${IDS.bottomGrid} { display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;align-items:start!important;column-gap:12px!important;width:100%!important;min-width:0!important;margin:12px 0 0!important;padding:0!important; }
      #${IDS.bottomGrid}>.us-sign-description-panel { grid-column:1!important;grid-row:1!important;align-self:start!important;position:static!important;width:100%!important;min-width:0!important;margin:0!important;padding:0!important; }
      #${IDS.rightStack} { grid-column:2!important;grid-row:1!important;align-self:start!important;display:flex!important;flex-direction:column!important;width:100%!important;min-width:0!important;margin:0!important;padding:0!important; }
      #${IDS.rightStack}>.us-sign-designs-panel,#${IDS.rightStack}>.us-sign-files-panel { width:100%!important;min-width:0!important; }
      #${IDS.rightStack}>.us-sign-designs-panel { margin:0!important; }
      #${IDS.rightStack}>.us-sign-files-panel { margin:12px 0 0!important; }
      #${IDS.bottomGrid}>.us-sign-description-panel,#${IDS.rightStack}>.us-sign-designs-panel,#${IDS.rightStack}>.us-sign-files-panel { border-color:var(--djt-border)!important;box-shadow:none!important; }
      @media(max-width:1180px){#${IDS.overview} .us-sign-overview-title{display:none!important;}#${IDS.overview}{grid-template-columns:minmax(0,1fr)!important;}#${IDS.actionbar}{overflow-x:auto!important;}}
      @media(max-width:900px){#${IDS.bottomGrid}{grid-template-columns:minmax(0,1fr)!important;row-gap:12px!important;}#${IDS.bottomGrid}>.us-sign-description-panel,#${IDS.rightStack}{grid-column:1!important;}#${IDS.rightStack}{grid-row:2!important;}}
    `;
  }

  function findSearchContext() {
    const candidates = [...document.querySelectorAll([
      "input[placeholder*='search' i]", "input[name*='search' i]", "input[id*='search' i]",
      ".navbar input[type='search']", ".navbar input[type='text']"
    ].join(", "))].filter((input) => {
      const rect = input.getBoundingClientRect();
      return !input.disabled && input.type !== "hidden" && rect.width > 80 && rect.height > 18 && rect.top >= 0 && rect.top < 130;
    });
    const input = candidates[0] || null;
    if (!input) return null;
    return { input, form: input.closest("form"), mount: input.parentElement };
  }

  function submitSearch(context) {
    context.input.dispatchEvent(new Event("input", { bubbles: true }));
    context.input.dispatchEvent(new Event("change", { bubbles: true }));
    window.setTimeout(() => {
      if (context.form && typeof context.form.requestSubmit === "function") {
        context.form.requestSubmit();
        return;
      }
      context.input.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true
      }));
    }, 80);
  }

  function ensureLookupButton(data) {
    const context = findSearchContext();
    if (!context?.mount) return;
    context.mount.classList.add("us-sign-search-with-lookup");
    let button = document.getElementById(IDS.lookup);
    if (!button) {
      button = document.createElement("button");
      button.id = IDS.lookup;
      button.type = "button";
      button.textContent = "Look Up Job #";
      button.addEventListener("click", () => {
        const number = clean(state.data?.projectNumber);
        const current = findSearchContext();
        if (!number || !current) {
          flash(button, "Not found", true);
          return;
        }
        current.input.value = number;
        current.input.focus();
        flash(button, "Searching...");
        submitSearch(current);
      });
    }
    if (button.parentElement !== context.mount) {
      context.mount.insertBefore(button, context.input.nextSibling);
    }
    button.disabled = !clean(data.projectNumber);
  }

  function nativeActionLabel(control) {
    return clean(control?.innerText || control?.textContent || control?.value ||
      control?.getAttribute?.("aria-label") || control?.getAttribute?.("title")).toUpperCase();
  }

  function styleNativeAction(control) {
    control.classList.add("us-sign-native-action");
    for (const [property, value] of [
      ["position", "static"], ["inset", "auto"], ["float", "none"], ["display", "inline-flex"],
      ["align-items", "center"], ["justify-content", "center"], ["flex", "0 0 auto"], ["width", "auto"],
      ["min-width", "max-content"], ["height", "28px"], ["margin", "0"], ["transform", "none"]
    ]) setImportant(control, property, value);
  }

  function collectNativeActions(workspace) {
    const group = document.getElementById(IDS.nativeActions);
    const existing = group ? [...group.querySelectorAll("a, button, input[type='button'], input[type='submit']")] : [];
    const pageControls = [...workspace.workspacePanel.querySelectorAll("a, button, input[type='button'], input[type='submit']")]
      .filter((control) => !control.closest(`#${IDS.copyTools}, #${IDS.nativeActions}`) &&
        !control.closest(".modal, .mfp-hide, .popup-modal, .popup-basic"));
    return NATIVE_ACTION_ORDER.map((label) =>
      pageControls.find((control) => nativeActionLabel(control) === label) ||
      existing.find((control) => nativeActionLabel(control) === label)
    ).filter(Boolean);
  }

  function createCopyToolbar() {
    const host = document.createElement("div");
    host.id = IDS.copyTools;
    host.innerHTML = `<div class="us-sign-copy-toolbar">
      <button class="primary" type="button" data-copy="fullBrief">Copy Brief</button>
      <button type="button" data-copy="description">Copy Desc</button>
      <button type="button" data-action="maps">Maps</button>
    </div>`;
    host.addEventListener("click", async (event) => {
      const button = event.target.closest("button");
      if (!button || button.disabled) return;
      try {
        if (button.dataset.action === "maps") {
          openMaps(state.data?.fullAddress);
          flash(button, "Opened ✓");
          return;
        }
        const value = button.dataset.copy === "fullBrief" ? buildFullBrief(state.data || {}) : state.data?.description;
        await copyText(value);
        flash(button, "Copied ✓");
      } catch (_error) {
        flash(button, "Not found", true);
      }
    });
    return host;
  }

  function forceActionbarLayout(actionbar, copyTools, nativeGroup) {
    for (const [element, styles] of [
      [actionbar, { display:"flex", "flex-direction":"row", "flex-wrap":"nowrap", "align-items":"center", width:"100%", "min-width":"0" }],
      [copyTools, { display:"inline-flex", flex:"0 0 auto", width:"max-content", "min-width":"max-content" }],
      [nativeGroup, { display:"inline-flex", "flex-direction":"row", "flex-wrap":"nowrap", flex:"0 0 auto", width:"max-content", "min-width":"max-content", "margin-left":"auto" }]
    ]) {
      for (const [property, value] of Object.entries(styles)) setImportant(element, property, value);
    }
  }

  function ensureActionbar(workspace) {
    let actionbar = document.getElementById(IDS.actionbar);
    if (!actionbar) {
      actionbar = document.createElement("div");
      actionbar.id = IDS.actionbar;
    }
    let copyTools = document.getElementById(IDS.copyTools);
    if (!copyTools) copyTools = createCopyToolbar();
    let nativeGroup = document.getElementById(IDS.nativeActions);
    if (!nativeGroup) {
      nativeGroup = document.createElement("div");
      nativeGroup.id = IDS.nativeActions;
    }
    for (const control of collectNativeActions(workspace)) {
      styleNativeAction(control);
      nativeGroup.appendChild(control);
    }
    actionbar.append(copyTools, nativeGroup);
    forceActionbarLayout(actionbar, copyTools, nativeGroup);
    const heading = workspace.workspacePanel.querySelector(":scope > .panel-heading");
    if (heading) heading.classList.add("us-sign-empty-native-heading", "us-sign-native-workspace-heading-hidden");
    return { actionbar, copyTools };
  }

  function overviewField(label, key, action = "") {
    const attribute = action ? `data-action="${action}"` : `data-copy="${key}"`;
    return `<button class="us-sign-overview-field" type="button" ${attribute}>
      <span class="us-sign-overview-label">${label}</span>
      <span class="us-sign-overview-value" data-value="${key}"></span>
    </button>`;
  }

  function createOverview() {
    const host = document.createElement("div");
    host.id = IDS.overview;
    host.innerHTML = `<div class="us-sign-overview-title">Job Overview</div>
      <div class="us-sign-overview-stack">
        <div class="us-sign-overview-row">
          ${overviewField("Project", "projectRevision")}${overviewField("Linked Job", "projectReference")}
          ${overviewField("Plaza", "plazaName")}${overviewField("Open Date", "openDate")}
          ${overviewField("Project Manager", "projectManager")}${overviewField("Designer", "designer")}
        </div>
        <div class="us-sign-overview-row">
          ${overviewField("Full Address", "fullAddress")}${overviewField("Street", "streetAddress")}
          ${overviewField("City", "city")}${overviewField("State + ZIP", "stateZip")}
        </div>
      </div>`;
    host.addEventListener("click", async (event) => {
      const button = event.target.closest("button");
      if (!button || button.disabled) return;
      try {
        await copyText(state.data?.[button.dataset.copy]);
        flash(button, "Copied ✓");
      } catch (_error) {
        flash(button, "Not found", true);
      }
    });
    return host;
  }

  function updateOverview(host, data) {
    host.querySelectorAll("[data-value]").forEach((element) => {
      const value = clean(data[element.dataset.value]);
      element.textContent = value || "Not found";
      const button = element.closest("button");
      if (button) button.disabled = !value;
    });
  }

  function createSummaryCell(field, index) {
    const cell = document.createElement("div");
    cell.className = "us-sign-djt-summary-cell";
    cell.dataset.summaryKind = field.kind;
    cell.dataset.summaryKey = field.key;
    const label = document.createElement("span");
    label.className = "us-sign-djt-summary-label";
    label.textContent = field.label;
    const value = document.createElement("span");
    value.className = "us-sign-djt-summary-value";
    value.dataset.summaryValue = field.key;
    cell.append(label, value);
    setImportant(cell, "grid-column", String(index + 1));
    setImportant(cell, "grid-row", "1");
    return cell;
  }

  function forceSummaryLayout(host) {
    const hostStyles = {
      display:"grid", "grid-template-columns":"minmax(190px, 2.2fr) minmax(112px, 1fr) minmax(94px, 0.85fr) minmax(72px, 0.55fr) minmax(112px, 0.95fr)",
      "grid-template-rows":"minmax(56px, auto)", width:"100%", "min-width":"0", "min-height":"56px", margin:"0", padding:"0"
    };
    for (const [property, value] of Object.entries(hostStyles)) setImportant(host, property, value);
    [...host.querySelectorAll(":scope > .us-sign-djt-summary-cell")].forEach((cell, index) => {
      const styles = { position:"static", display:"grid", "grid-column":String(index + 1), "grid-row":"1", "align-content":"center", "min-width":"0", "min-height":"56px", margin:"0", padding:"8px 10px", transform:"none" };
      for (const [property, value] of Object.entries(styles)) setImportant(cell, property, value);
    });
  }

  function ensureSummaryHost() {
    const matches = [...document.querySelectorAll(`#${IDS.summary}`)];
    let host = matches.shift() || document.createElement("div");
    for (const duplicate of matches) duplicate.remove();
    host.id = IDS.summary;
    const valid = host.dataset.scriptVersion === VERSION &&
      host.querySelectorAll(":scope > .us-sign-djt-summary-cell").length === SUMMARY_FIELDS.length;
    if (!valid) {
      host.replaceChildren();
      SUMMARY_FIELDS.forEach((field, index) => host.appendChild(createSummaryCell(field, index)));
      host.dataset.scriptVersion = VERSION;
    }
    forceSummaryLayout(host);
    return host;
  }

  function daysUntilDate(value) {
    const match = clean(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (!match) return null;
    const year = match[3].length === 2 ? Number(`20${match[3]}`) : Number(match[3]);
    const due = new Date(year, Number(match[1]) - 1, Number(match[2]));
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.round((due - today) / 86400000);
  }

  function updateSummary(host, data) {
    forceSummaryLayout(host);
    host.querySelectorAll("[data-summary-value]").forEach((element) => {
      const value = clean(data[element.dataset.summaryValue]);
      element.textContent = value || "Not set";
    });
    const dueCell = host.querySelector('[data-summary-kind="due"]');
    if (dueCell) {
      const days = daysUntilDate(data.dateRequired);
      dueCell.dataset.dueState = days === null ? "normal" : days < 0 ? "overdue" : days <= 3 ? "critical" : "normal";
    }
  }

  function ensureBottomGrid(workspace) {
    const sections = findNativeSections(workspace);
    const designsPanel = findDesignsPanel(workspace);
    if (!sections || !designsPanel) return;
    let grid = document.getElementById(IDS.bottomGrid);
    if (!grid) {
      grid = document.createElement("section");
      grid.id = IDS.bottomGrid;
    }
    let rightStack = document.getElementById(IDS.rightStack);
    if (!rightStack) {
      rightStack = document.createElement("section");
      rightStack.id = IDS.rightStack;
    }
    const { descriptionPanel, filesPanel } = sections;
    descriptionPanel.classList.add("us-sign-description-panel");
    designsPanel.classList.add("us-sign-designs-panel");
    filesPanel.classList.add("us-sign-files-panel");
    setImportant(descriptionPanel, "margin-top", "0");
    setImportant(designsPanel, "margin-top", "0");
    setImportant(filesPanel, "margin-top", "15px");
    grid.append(descriptionPanel, rightStack);
    rightStack.append(designsPanel, filesPanel);
    workspace.workspaceBody.appendChild(grid);
    workspace.row.classList.add("us-sign-design-workbench");
    workspace.sourceColumn.classList.add("us-sign-design-source-column");
    workspace.workspaceColumn.classList.add("us-sign-design-workspace-column");
    setImportant(workspace.row, "display", "grid");
    setImportant(workspace.row, "grid-template-columns", "minmax(0, 1fr)");
    setImportant(workspace.row, "gap", "0");
    setImportant(workspace.workspaceColumn, "grid-column", "1 / -1");
    setImportant(workspace.workspaceColumn, "width", "100%");
    setImportant(workspace.workspaceColumn, "margin-left", "0");
    setImportant(workspace.sourceColumn, "display", "none");
  }

  function hideSourceRecord(table) {
    setImportant(table, "display", "none");
    table.setAttribute("aria-hidden", "true");
    const wrapper = table.closest(".table-responsive");
    if (wrapper && wrapper.querySelectorAll("table").length === 1) setImportant(wrapper, "display", "none");
  }

  function ensureOrderedBefore(parent, anchor, elements) {
    const children = [...parent.children];
    const startIndex = children.indexOf(elements[0]);
    const anchorIndex = children.indexOf(anchor);
    const alreadyCorrect = startIndex >= 0 && anchorIndex === startIndex + elements.length &&
      elements.every((element, index) => children[startIndex + index] === element);
    if (alreadyCorrect) return;
    const fragment = document.createDocumentFragment();
    for (const element of elements) fragment.appendChild(element);
    parent.insertBefore(fragment, anchor);
  }

  function updateCopyButtons(host, data) {
    const brief = host.querySelector('[data-copy="fullBrief"]');
    const description = host.querySelector('[data-copy="description"]');
    const maps = host.querySelector('[data-action="maps"]');
    if (brief) brief.disabled = !data.projectNumber;
    if (description) description.disabled = !data.description;
    if (maps) maps.disabled = !data.fullAddress;
  }

  function dataSignature(data) {
    return JSON.stringify([
      data.projectNumber, data.designNumber, data.projectRevision, data.projectReference,
      data.plazaName, data.openDate, data.projectManager, data.designer, data.fullAddress,
      data.streetAddress, data.city, data.stateZip, data.designType, data.dateRequired,
      data.priority, data.hours, data.status, data.description
    ]);
  }

  function refreshData() {
    if (!state.table?.isConnected || !state.workspace?.workspaceBody?.isConnected) {
      disconnectDataObserver();
      startDiscovery();
      return;
    }
    const data = collectJobData(state.table, state.workspace);
    const signature = dataSignature(data);
    if (signature === state.lastDataSignature) return;
    state.lastDataSignature = signature;
    state.data = data;
    const overview = document.getElementById(IDS.overview);
    const copyTools = document.getElementById(IDS.copyTools);
    const summary = document.getElementById(IDS.summary);
    if (overview) updateOverview(overview, data);
    if (summary) updateSummary(summary, data);
    if (copyTools) updateCopyButtons(copyTools, data);
    ensureLookupButton(data);
  }

  function scheduleRefresh(delay = 140) {
    window.clearTimeout(state.refreshTimer);
    state.refreshTimer = window.setTimeout(refreshData, delay);
  }

  function disconnectDataObserver() {
    state.dataObserver?.disconnect();
  }

  function connectDataObserver() {
    disconnectDataObserver();
    if (!state.dataObserver) {
      state.dataObserver = new MutationObserver(() => {
        if (!state.mounting) scheduleRefresh(140);
      });
    }
    const roots = [
      state.table, document.querySelector("#customer-name"), document.querySelector("#customer-info"), document.querySelector("#pmlt")
    ].filter(Boolean);
    for (const root of roots) {
      state.dataObserver.observe(root, { childList: true, subtree: true, characterData: true });
    }
  }


  function ensureProjectIdentityRow() {
    const existing = document.getElementById(IDS.projectHeader);
    if (existing) return existing;

    const customerName = document.getElementById("customer-name");
    const customerInfo = document.getElementById("customer-info");
    if (!customerName || !customerInfo) return null;

    const nameAnchor = customerName.closest(".row.no-gutter") || customerName;
    const infoAnchor = customerInfo.closest(".row.no-gutter") || customerInfo;
    const container = nameAnchor.parentElement;
    if (!container || infoAnchor.parentElement !== container) return null;

    const statusAnchor = [...container.children].find((element) =>
      element.matches?.(".alert.alert-micro")
    ) || null;

    const header = document.createElement("section");
    header.id = IDS.projectHeader;
    header.className = "us-sign-design-project-header";
    header.setAttribute("aria-label", "Project identity");

    container.insertBefore(header, statusAnchor || nameAnchor);

    if (statusAnchor) {
      statusAnchor.classList.add("us-sign-design-project-status");
      header.appendChild(statusAnchor);
    }

    nameAnchor.classList.add("us-sign-design-project-name");
    infoAnchor.classList.add("us-sign-design-project-info");
    header.append(nameAnchor, infoAnchor);

    return header;
  }

  function mountDesignWorkspace() {
    if (state.mounting) return false;
    state.mounting = true;
    disconnectDataObserver();
    let mounted = false;
    try {
      installStyles();
      const table = findDesignTable();
      if (!table) {
        state.table = null;
        state.workspace = null;
        return false;
      }
      const workspace = findWorkspace(table);
      if (!workspace) return false;
      state.table = table;
      state.workspace = workspace;
      document.documentElement.classList.add("us-sign-design-page");
      document.documentElement.classList.remove("us-sign-job-dashboard");
      ensureProjectIdentityRow();
      const { actionbar, copyTools } = ensureActionbar(workspace);
      let overview = document.getElementById(IDS.overview);
      if (!overview) overview = createOverview();
      const summary = ensureSummaryHost();
      ensureOrderedBefore(workspace.workspaceBody, workspace.tableAnchor, [actionbar, overview, summary]);
      ensureBottomGrid(workspace);
      hideSourceRecord(table);
      const data = collectJobData(table, workspace);
      state.data = data;
      state.lastDataSignature = dataSignature(data);
      updateOverview(overview, data);
      updateSummary(summary, data);
      updateCopyButtons(copyTools, data);
      ensureLookupButton(data);
      mounted = true;
      return true;
    } finally {
      state.mounting = false;
      if (mounted) connectDataObserver();
    }
  }

  function stopDiscovery() {
    window.clearTimeout(state.startupTimer);
    window.clearTimeout(state.startupStopTimer);
    state.startupTimer = null;
    state.startupStopTimer = null;
    state.startupObserver?.disconnect();
    state.startupObserver = null;
  }

  function scheduleDiscoveryAttempt(delay = 80) {
    window.clearTimeout(state.startupTimer);
    state.startupTimer = window.setTimeout(() => {
      state.startupTimer = null;
      if (mountDesignWorkspace()) stopDiscovery();
    }, delay);
  }

  function startDiscovery() {
    document.documentElement.classList.remove("us-sign-design-page");
    stopDiscovery();
    disconnectDataObserver();
    state.lastDataSignature = "";
    scheduleDiscoveryAttempt(0);
    const content = document.querySelector("#content");
    if (content) {
      state.startupObserver = new MutationObserver(() => scheduleDiscoveryAttempt(90));
      state.startupObserver.observe(content, { childList: true, subtree: true });
    }
    window.setTimeout(() => scheduleDiscoveryAttempt(0), 350);
    window.setTimeout(() => scheduleDiscoveryAttempt(0), 1100);
    window.setTimeout(() => scheduleDiscoveryAttempt(0), 2200);
    state.startupStopTimer = window.setTimeout(() => stopDiscovery(), 3600);
  }

  function installNavigationEvents() {
    if (window.__usSignDesignHistoryInstalled) return;
    window.__usSignDesignHistoryInstalled = true;
    for (const methodName of ["pushState", "replaceState"]) {
      const original = history[methodName];
      history[methodName] = function (...args) {
        const result = original.apply(this, args);
        window.dispatchEvent(new Event("us-sign-location-change"));
        return result;
      };
    }
    window.addEventListener("popstate", startDiscovery);
    window.addEventListener("us-sign-location-change", startDiscovery);
    window.addEventListener("pageshow", startDiscovery);
  }

  function start() {
    installNavigationEvents();
    startDiscovery();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
