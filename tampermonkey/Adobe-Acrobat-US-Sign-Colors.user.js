// ==UserScript==
// @name         Adobe Acrobat - US Sign Colors
// @namespace    us-sign-local-tools
// @version      1.2.0
// @description  Dark graphite Acrobat Web colors with native comment layout, color-only comment states, and Copy Comments. Leaves Adobe button styling untouched.
// @match        https://acrobat.adobe.com/*
// @match        https://documentcloud.adobe.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/Adobe-Acrobat-US-Sign-Colors.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/Adobe-Acrobat-US-Sign-Colors.user.js
// ==/UserScript==

(function () {
  "use strict";

  const COPY_ID = "us-acrobat-copy-comments";
  const COMMENT_CARD = "us-acrobat-comment-card";
  const COMMENT_SELECTED = "us-acrobat-comment-selected";
  let copyButton = null;
  let activeCommentsPanel = null;
  let scanTimer = 0;
  let burstTimers = [];

  GM_addStyle(String.raw`
    :root {
      color-scheme: dark;
      --us-acrobat-bg: #111418;
      --us-acrobat-surface: #171b20;
      --us-acrobat-surface-soft: #1c2127;
      --us-acrobat-surface-hover: #242a31;
      --us-acrobat-text: #f4f6f8;
      --us-acrobat-text-soft: #c9ced5;
      --us-acrobat-text-muted: #8f98a3;
      --us-acrobat-accent: #c1ccd7;
      --us-acrobat-border: rgba(255, 255, 255, 0.085);
      --us-acrobat-border-strong: rgba(255, 255, 255, 0.14);
      --us-acrobat-selection: rgba(193, 204, 215, 0.25);
      --us-acrobat-comment-active: rgba(193, 204, 215, 0.12);
    }

    html,
    body {
      color: var(--us-acrobat-text-soft) !important;
      background: var(--us-acrobat-bg) !important;
      background-color: var(--us-acrobat-bg) !important;
    }

    ::selection {
      color: var(--us-acrobat-text) !important;
      background: var(--us-acrobat-selection) !important;
    }

    /* App shell only. PDF content and annotation layers are not recolored. */
    #root,
    #app,
    [id*="root" i],
    [id*="app" i],
    main,
    [role="main"],
    [class*="app-shell" i],
    [class*="appshell" i],
    [class*="workspace" i],
    [class*="work-space" i],
    [class*="viewer-container" i],
    [class*="viewercontainer" i] {
      color: var(--us-acrobat-text-soft) !important;
      background-color: var(--us-acrobat-bg) !important;
    }

    header,
    nav,
    aside,
    [role="navigation"],
    [role="complementary"],
    [class*="header" i],
    [class*="topbar" i],
    [class*="top-bar" i],
    [class*="sidebar" i],
    [class*="side-bar" i],
    [class*="rail" i] {
      color: var(--us-acrobat-text-soft) !important;
      background-color: var(--us-acrobat-surface) !important;
      border-color: var(--us-acrobat-border) !important;
    }

    [class*="panel" i],
    [class*="drawer" i],
    [class*="tray" i],
    [class*="card" i],
    [class*="property" i],
    [class*="properties" i],
    [class*="inspector" i] {
      color: var(--us-acrobat-text-soft) !important;
      background-color: var(--us-acrobat-surface) !important;
      border-color: var(--us-acrobat-border) !important;
    }

    [role="menu"],
    [role="listbox"],
    [role="dialog"],
    [role="alertdialog"],
    [class*="menu" i],
    [class*="popover" i],
    [class*="popup" i],
    [class*="dialog" i],
    [class*="modal" i],
    [class*="tooltip" i] {
      color: var(--us-acrobat-text-soft) !important;
      background-color: var(--us-acrobat-surface-soft) !important;
      border-color: var(--us-acrobat-border-strong) !important;
    }

    [role="menuitem"],
    [role="option"] {
      color: var(--us-acrobat-text-soft) !important;
    }

    [role="menuitem"]:hover,
    [role="option"]:hover,
    [role="option"][aria-selected="true"] {
      color: var(--us-acrobat-text) !important;
      background-color: var(--us-acrobat-surface-hover) !important;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    label,
    legend,
    [role="heading"] {
      color: var(--us-acrobat-text) !important;
    }

    small,
    [class*="muted" i],
    [class*="secondary" i],
    [class*="description" i],
    [class*="subtitle" i],
    [class*="sub-title" i] {
      color: var(--us-acrobat-text-muted) !important;
    }

    a:not([role="button"]) {
      color: var(--us-acrobat-accent) !important;
    }

    a:not([role="button"]):hover,
    a:not([role="button"]):focus {
      color: var(--us-acrobat-text) !important;
    }

    input:not([type="button"]):not([type="submit"]):not([type="reset"]),
    textarea,
    select {
      color: var(--us-acrobat-text) !important;
      background-color: var(--us-acrobat-surface-soft) !important;
      border-color: var(--us-acrobat-border) !important;
    }

    input:not([type="button"]):not([type="submit"]):not([type="reset"])::placeholder,
    textarea::placeholder {
      color: var(--us-acrobat-text-muted) !important;
    }

    select option,
    select optgroup {
      color: var(--us-acrobat-text-soft) !important;
      background-color: var(--us-acrobat-surface) !important;
    }

    hr,
    [role="separator"] {
      border-color: var(--us-acrobat-border) !important;
      background-color: var(--us-acrobat-border) !important;
    }

    /* Comments: preserve Acrobat's native structure. Color changes only. */
    .${COMMENT_CARD} {
      color: var(--us-acrobat-text-soft) !important;
      background-color: #1a1f25 !important;
      border-color: rgba(255, 255, 255, 0.09) !important;
    }

    .${COMMENT_CARD}:hover {
      color: var(--us-acrobat-text) !important;
      background-color: #20262d !important;
      border-color: rgba(255, 255, 255, 0.13) !important;
    }

    .${COMMENT_CARD}.${COMMENT_SELECTED},
    .${COMMENT_CARD}:focus-within {
      color: var(--us-acrobat-text) !important;
      background-color: #252c34 !important;
      border-color: rgba(193, 204, 215, 0.30) !important;
    }

    .${COMMENT_CARD} :where(
      strong,
      b,
      [class*="author" i],
      [data-testid*="author" i]
    ) {
      color: #eef2f5 !important;
    }

    .${COMMENT_CARD} :where(
      time,
      [class*="time" i],
      [class*="date" i],
      [data-testid*="timestamp" i],
      [class*="resolved" i],
      [data-testid*="resolved" i]
    ) {
      color: #9ba5af !important;
    }

    /* Preserve Acrobat PDF text highlights, annotations, ink and comment markers. */
    [class*="annotationLayer" i],
    [class*="annotationLayer" i] *,
    [class*="textLayer" i],
    [class*="textLayer" i] *,
    [class*="xfaLayer" i],
    [class*="xfaLayer" i] *,
    canvas,
    iframe,
    embed,
    object,
    svg {
      color-scheme: normal !important;
      forced-color-adjust: auto !important;
    }

    /* This is the one custom functional button. Adobe's own buttons are untouched. */
    #${COPY_ID} {
      z-index: 2147483000 !important;
      min-width: 42px !important;
      min-height: 30px !important;
      margin: 4px !important;
      padding: 4px 7px !important;
      color: var(--us-acrobat-text-soft) !important;
      background: #1c2127 !important;
      border: 1px solid var(--us-acrobat-border-strong) !important;
      border-radius: 7px !important;
      box-shadow: none !important;
      font: 600 10px/1.1 system-ui, -apple-system, "Segoe UI", sans-serif !important;
      letter-spacing: 0.02em !important;
      cursor: pointer !important;
    }

    #${COPY_ID}:hover,
    #${COPY_ID}:focus-visible {
      color: var(--us-acrobat-text) !important;
      background: #242a31 !important;
      border-color: rgba(193, 204, 215, 0.34) !important;
      outline: none !important;
    }

    #${COPY_ID}[data-state="success"] {
      color: #dce9e0 !important;
      border-color: rgba(120, 168, 138, 0.44) !important;
    }

    #${COPY_ID}[data-state="error"] {
      color: #f0dcdc !important;
      border-color: rgba(196, 122, 122, 0.44) !important;
    }

    #${COPY_ID}.us-acrobat-copy-fallback {
      position: fixed !important;
      top: 170px !important;
      right: 6px !important;
    }

    * {
      scrollbar-color: #444c55 #171b20;
    }

    *::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    *::-webkit-scrollbar-track {
      background: #171b20;
    }

    *::-webkit-scrollbar-thumb {
      background: #444c55;
      border: 2px solid #171b20;
      border-radius: 10px;
    }

    *::-webkit-scrollbar-thumb:hover {
      background: #59636e;
    }
  `);

  function all(root, selector) {
    try {
      return Array.from(root.querySelectorAll(selector));
    } catch {
      return [];
    }
  }

  function visibleRect(element) {
    if (!(element instanceof Element)) return null;
    const rect = element.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return null;
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return null;
    return rect;
  }

  function textOf(element) {
    return (element?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function directText(element) {
    if (!(element instanceof Element)) return "";
    return Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function findPanelFromHeading(heading) {
    let current = heading;
    let best = null;
    let bestScore = -Infinity;

    for (let depth = 0; current && depth < 10; depth += 1) {
      const rect = visibleRect(current);
      if (rect) {
        const isRightSide = rect.left > window.innerWidth * 0.50;
        const widthOkay = rect.width >= 250 && rect.width <= 760;
        const heightOkay = rect.height >= window.innerHeight * 0.35;
        const reachesRight = rect.right > window.innerWidth * 0.78;
        if (isRightSide && widthOkay && heightOkay && reachesRight) {
          const score = rect.height + rect.width * 0.25 - depth * 8;
          if (score > bestScore) {
            best = current;
            bestScore = score;
          }
        }
      }
      current = current.parentElement;
    }

    return best;
  }

  function findCardFromActivity(element, panel) {
    const panelRect = visibleRect(panel);
    if (!panelRect) return null;
    let current = element.parentElement;

    for (let depth = 0; current && current !== panel && depth < 8; depth += 1) {
      const rect = visibleRect(current);
      if (
        rect &&
        rect.width >= panelRect.width * 0.68 &&
        rect.width <= panelRect.width * 1.03 &&
        rect.height >= 60 &&
        rect.height <= 600
      ) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }

  function findCommentsPanel() {
    const direct = all(
      document,
      [
        '[aria-label*="comments" i]',
        '[aria-label*="review" i]',
        '[data-testid*="comment" i]',
        '[data-testid*="review" i]',
        '[class*="commentsPanel" i]',
        '[class*="commentPanel" i]',
        '[class*="reviewPanel" i]'
      ].join(",")
    );

    const directMatch = direct.find((element) => {
      const rect = visibleRect(element);
      return Boolean(
        rect &&
        rect.left > window.innerWidth * 0.45 &&
        rect.width >= 240 &&
        rect.height > window.innerHeight * 0.30
      );
    });

    if (directMatch) return directMatch;

    const heading = all(document, "h1,h2,h3,h4,div,span")
      .find((element) => /^Comments(?:\s+\d+)?$/i.test(textOf(element)));

    return heading ? findPanelFromHeading(heading) : null;
  }

  const COMMENT_ACTIVITY_PATTERN =
    /^(?:\d+\s+(?:sec(?:ond)?s?|min(?:ute)?s?|hr(?:s)?|hour(?:s)?|day(?:s)?|week(?:s)?|month(?:s)?|year(?:s)?)\s+ago|resolved)$/i;
  const COMMENT_PAGE_PATTERN = /^page\s+\d+/i;

  function cleanCommentText(value) {
    return String(value || "")
      .replace(/\u200b/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizedLines(value) {
    return String(value || "")
      .replace(/\r/g, "")
      .split(/\n+/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  function firstUsefulText(elements, rejectPattern = null) {
    for (const element of elements) {
      const value = textOf(element);
      if (value && value.length <= 100 && (!rejectPattern || !rejectPattern.test(value))) {
        return value;
      }
    }
    return "";
  }

  function extractCommentRecord(card, currentPage) {
    const author = firstUsefulText(
      all(card, '[class*="author" i], [data-testid*="author" i], strong, b'),
      /^(?:page\s+\d+|reply|resolved)$/i
    );

    const meta = firstUsefulText(
      all(card, 'time, [class*="time" i], [class*="date" i], [data-testid*="timestamp" i], [class*="resolved" i], [data-testid*="resolved" i]'),
      /^(?:reply)$/i
    );

    const bodyLines = [];
    const seen = new Set();

    for (const line of normalizedLines(card.innerText || card.textContent)) {
      if (
        line === author ||
        line === meta ||
        /^page\s+\d+/i.test(line) ||
        /^reply$/i.test(line) ||
        COMMENT_ACTIVITY_PATTERN.test(line) ||
        /^(?:like|reaction|more options)$/i.test(line) ||
        /^(?:👍|👎|❤️|👏|🎉)\s*\d*$/u.test(line) ||
        /^(?:\.\.\.|…|\d+)$/i.test(line)
      ) {
        continue;
      }

      let cleaned = line;
      if (author && cleaned.startsWith(author)) cleaned = cleaned.slice(author.length).trim();
      if (meta && cleaned.startsWith(meta)) cleaned = cleaned.slice(meta.length).trim();
      if (!cleaned) continue;
      const key = cleaned.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        bodyLines.push(cleaned);
      }
    }

    return {
      page: currentPage || "UNASSIGNED",
      author: author || "Unknown reviewer",
      meta,
      body: bodyLines.join("\n").trim()
    };
  }

  function textItemScore(element) {
    let score = 0;
    const tag = element.tagName?.toLowerCase() || "";
    if (["strong", "b", "time", "a", "p"].includes(tag)) score += 5;
    if (element.childElementCount === 0) score += 4;
    if (element.matches('[class*="author" i], [data-testid*="author" i], time')) score += 10;
    return score;
  }

  function collectPanelTextItems(panel) {
    const candidates = all(panel, 'span,p,div,a,strong,b,time,button,[role="button"]');
    const byKey = new Map();

    for (const element of candidates) {
      const rect = visibleRect(element);
      if (!rect) continue;
      let value = directText(element);
      if (!value && element.childElementCount === 0) value = textOf(element);
      value = cleanCommentText(value);
      if (!value || value.length > 700) continue;

      const key = [Math.round(rect.top), Math.round(rect.left), value.toLowerCase()].join("|");
      const item = { element, text: value, rect, score: textItemScore(element) };
      const existing = byKey.get(key);
      if (!existing || item.score > existing.score) byKey.set(key, item);
    }

    return Array.from(byKey.values()).sort((a, b) => {
      const vertical = a.rect.top - b.rect.top;
      return Math.abs(vertical) > 2 ? vertical : a.rect.left - b.rect.left;
    });
  }

  function isCommentUiText(value) {
    const text = cleanCommentText(value);
    return Boolean(
      !text ||
      /^comments(?:\s+\d+)?$/i.test(text) ||
      COMMENT_PAGE_PATTERN.test(text) ||
      /^reply$/i.test(text) ||
      /^copy(?: all)?$/i.test(text) ||
      /^(?:looks great!|approved|thanks!)$/i.test(text) ||
      /^(?:comment or use @ to invite)$/i.test(text) ||
      /^(?:like|reaction|more options)$/i.test(text) ||
      /^(?:\d+\s+)?more comments?$/i.test(text) ||
      /^(?:👍|👎|❤️|👏|🎉)\s*\d*$/u.test(text) ||
      /^(?:\.\.\.|…|\d+)$/i.test(text)
    );
  }

  function uniqueItemsByPosition(items) {
    const found = [];
    const keys = new Set();
    for (const item of items) {
      const key = [
        Math.round(item.rect.top / 2) * 2,
        Math.round(item.rect.left / 2) * 2,
        item.text.toLowerCase()
      ].join("|");
      if (keys.has(key)) continue;
      keys.add(key);
      found.push(item);
    }
    return found;
  }

  function findAuthorItem(activity, items) {
    const candidates = items.filter((item) => {
      const text = item.text;
      if (
        item === activity ||
        isCommentUiText(text) ||
        COMMENT_ACTIVITY_PATTERN.test(text) ||
        text.startsWith("@") ||
        /@[\w.-]+\.[a-z]{2,}/i.test(text) ||
        text.length < 2 ||
        text.length > 90
      ) {
        return false;
      }

      return (
        item.rect.top >= activity.rect.top - 74 &&
        item.rect.top <= activity.rect.top + 5 &&
        Math.abs(item.rect.left - activity.rect.left) <= 125
      );
    });

    candidates.sort((a, b) => {
      const aSemantic = a.element.matches('strong,b,[class*="author" i],[data-testid*="author" i]') ? 30 : 0;
      const bSemantic = b.element.matches('strong,b,[class*="author" i],[data-testid*="author" i]') ? 30 : 0;
      const aDistance = Math.abs(activity.rect.top - a.rect.top) + Math.abs(activity.rect.left - a.rect.left) * 0.15;
      const bDistance = Math.abs(activity.rect.top - b.rect.top) + Math.abs(activity.rect.left - b.rect.left) * 0.15;
      return (bSemantic - aSemantic) || (aDistance - bDistance);
    });

    return candidates[0] || null;
  }

  function findPageForY(pageMarkers, y) {
    let page = "UNASSIGNED";
    for (const marker of pageMarkers) {
      if (marker.rect.top <= y + 2) {
        const match = marker.text.match(/page\s+\d+/i);
        if (match) page = match[0].replace(/\s+/g, " ");
      } else {
        break;
      }
    }
    return page;
  }

  function collectCommentRecords(panel) {
    const items = collectPanelTextItems(panel);
    const pageMarkers = uniqueItemsByPosition(items.filter((item) => COMMENT_PAGE_PATTERN.test(item.text)));
    const activities = uniqueItemsByPosition(items.filter((item) => COMMENT_ACTIVITY_PATTERN.test(item.text)));
    const seeds = activities.map((activity) => ({
      activity,
      authorItem: findAuthorItem(activity, items),
      page: findPageForY(pageMarkers, activity.rect.top)
    }));

    const records = [];
    const seenRecords = new Set();
    const panelRect = visibleRect(panel);

    for (let index = 0; index < seeds.length; index += 1) {
      const seed = seeds[index];
      const nextSeed = seeds[index + 1];
      const nextPage = pageMarkers.find((marker) => marker.rect.top > seed.activity.rect.top + 2);
      let endY = panelRect?.bottom || window.innerHeight;

      if (nextSeed) {
        endY = Math.min(endY, nextSeed.authorItem?.rect.top ?? nextSeed.activity.rect.top);
      }
      if (nextPage) endY = Math.min(endY, nextPage.rect.top);

      const author = seed.authorItem?.text || "Unknown reviewer";
      const bodyCandidates = items.filter((item) => {
        if (
          item === seed.activity ||
          item === seed.authorItem ||
          item.rect.top < seed.activity.rect.bottom - 2 ||
          item.rect.top >= endY - 2
        ) {
          return false;
        }
        if (item.element.closest("button,[role='button'],input,textarea")) return false;
        if (isCommentUiText(item.text) || COMMENT_ACTIVITY_PATTERN.test(item.text) || item.text === author) return false;
        return true;
      });

      const bodyLines = [];
      const bodyKeys = new Set();
      for (const item of bodyCandidates) {
        const value = cleanCommentText(item.text);
        const key = value.toLowerCase();
        if (!value || bodyKeys.has(key)) continue;
        bodyKeys.add(key);
        bodyLines.push(value);
      }

      if (!bodyLines.length) {
        const card = findCardFromActivity(seed.activity.element, panel);
        if (card) {
          const fallback = extractCommentRecord(card, seed.page);
          for (const line of normalizedLines(fallback.body)) {
            const key = line.toLowerCase();
            if (!bodyKeys.has(key)) {
              bodyKeys.add(key);
              bodyLines.push(line);
            }
          }
        }
      }

      const record = {
        page: seed.page,
        author,
        meta: seed.activity.text,
        body: bodyLines.join("\n").trim()
      };

      const recordKey = [record.page, record.author, record.meta, record.body].join("|").toLowerCase();
      if (!seenRecords.has(recordKey) && (record.body || record.author !== "Unknown reviewer")) {
        seenRecords.add(recordKey);
        records.push(record);
      }
    }

    return records;
  }

  function formatCommentRecords(records) {
    if (!records.length) return "No comments were found in the open Comments panel.";

    const documentName = document.title
      .replace(/\s*[-|]\s*Adobe Acrobat.*$/i, "")
      .trim();
    const output = [];
    if (documentName) output.push(`COMMENTS: ${documentName}`, "");

    let lastPage = "";
    for (const record of records) {
      if (record.page !== lastPage) {
        if (output.length && output[output.length - 1] !== "") output.push("");
        output.push(record.page.toUpperCase(), "");
        lastPage = record.page;
      }
      output.push(record.meta ? `${record.author} • ${record.meta}` : record.author);
      if (record.body) output.push(record.body);
      output.push("");
    }
    return output.join("\n").trim();
  }

  function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  async function expandMoreCommentControls(panel) {
    for (let pass = 0; pass < 4; pass += 1) {
      const controls = all(panel, 'button,[role="button"],a').filter((element) => {
        const rect = visibleRect(element);
        const value = cleanCommentText(textOf(element));
        return Boolean(rect && /^(?:\d+\s+)?more comments?$/i.test(value));
      });
      if (!controls.length) break;
      for (const control of controls) control.click();
      await wait(220);
    }
  }

  async function writeClipboardText(value) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.documentElement.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Clipboard copy failed.");
  }

  function setCopyState(state, count = 0) {
    if (!copyButton) return;
    copyButton.dataset.state = state;
    if (state === "success") {
      copyButton.textContent = "✓";
      copyButton.title = `Copied ${count} comments`;
      return;
    }
    if (state === "error") {
      copyButton.textContent = "!";
      copyButton.title = "Copy failed";
      return;
    }
    if (state === "missing") {
      copyButton.textContent = "COPY";
      copyButton.title = "Open the Comments panel first";
      return;
    }
    copyButton.textContent = "COPY";
    copyButton.title = "Copy all PDF review comments";
  }

  function ensureCopyButton() {
    if (copyButton?.isConnected) return copyButton;

    copyButton = document.getElementById(COPY_ID) || document.createElement("button");
    copyButton.id = COPY_ID;
    copyButton.type = "button";
    copyButton.setAttribute("aria-label", "Copy all comments");
    setCopyState("idle");

    if (!copyButton.dataset.bound) {
      copyButton.dataset.bound = "true";
      copyButton.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const panel = activeCommentsPanel?.isConnected ? activeCommentsPanel : findCommentsPanel();
        if (!(panel instanceof Element)) {
          setCopyState("missing");
          window.setTimeout(() => setCopyState("idle"), 1400);
          return;
        }

        copyButton.disabled = true;
        try {
          await expandMoreCommentControls(panel);
          await wait(120);
          const records = collectCommentRecords(panel);
          await writeClipboardText(formatCommentRecords(records));
          setCopyState("success", records.length);
        } catch (error) {
          console.error("[Acrobat US Sign Colors] Could not copy comments:", error);
          setCopyState("error");
        }

        window.setTimeout(() => {
          copyButton.disabled = false;
          setCopyState("idle");
        }, 1600);
      });
    }

    return copyButton;
  }

  function findRightToolbar() {
    const candidates = all(
      document,
      'aside,[role="toolbar"],[class*="toolbar" i],[class*="rail" i],[class*="sidebar" i]'
    );

    return candidates
      .map((element) => ({ element, rect: visibleRect(element) }))
      .filter(({ rect }) => Boolean(
        rect &&
        rect.right > window.innerWidth - 36 &&
        rect.width >= 32 &&
        rect.width <= 160 &&
        rect.height > 220
      ))
      .sort((a, b) => a.rect.width - b.rect.width)[0]?.element || null;
  }

  function mountCopyButton() {
    const button = ensureCopyButton();
    const toolbar = findRightToolbar();

    if (toolbar) {
      button.classList.remove("us-acrobat-copy-fallback");
      if (button.parentElement !== toolbar) {
        const children = Array.from(toolbar.children);
        const insertionTarget = children.length > 1 ? children[1] : children[0] || null;
        toolbar.insertBefore(button, insertionTarget);
      }
      return;
    }

    if (button.parentElement !== document.documentElement) {
      document.documentElement.appendChild(button);
    }
    button.classList.add("us-acrobat-copy-fallback");
  }

  function markCommentCards(panel) {
    const oldCards = all(panel, `.${COMMENT_CARD}`);
    for (const card of oldCards) card.classList.remove(COMMENT_SELECTED);

    const activities = all(panel, "div,span,p,time").filter((element) => {
      const value = cleanCommentText(textOf(element));
      return value.length <= 48 && COMMENT_ACTIVITY_PATTERN.test(value);
    });

    for (const activity of activities) {
      const card = findCardFromActivity(activity, panel);
      if (!card) continue;
      card.classList.add(COMMENT_CARD);

      const selectedSignal =
        card.matches('[aria-selected="true"],[aria-current="true"],[data-selected="true"]') ||
        Boolean(card.querySelector('[aria-selected="true"],[aria-current="true"],[data-selected="true"]')) ||
        /(?:^|\s)(?:selected|active|focused)(?:\s|$)/i.test(card.className) ||
        card.contains(document.activeElement);

      if (selectedSignal) card.classList.add(COMMENT_SELECTED);
    }
  }

  function scan() {
    const panel = findCommentsPanel();
    activeCommentsPanel = panel instanceof Element ? panel : null;
    if (activeCommentsPanel) markCommentCards(activeCommentsPanel);
    mountCopyButton();
  }

  function scheduleScan(delay = 80) {
    window.clearTimeout(scanTimer);
    scanTimer = window.setTimeout(scan, delay);
  }

  function scheduleBurst() {
    for (const timer of burstTimers) window.clearTimeout(timer);
    burstTimers = [
      window.setTimeout(scan, 60),
      window.setTimeout(scan, 320),
      window.setTimeout(scan, 900)
    ];
  }

  function boot() {
    scheduleBurst();
    document.addEventListener("click", scheduleBurst, true);
    document.addEventListener("focusin", () => scheduleScan(60), true);
    window.addEventListener("pageshow", scheduleBurst);
    window.addEventListener("popstate", scheduleBurst);
    window.addEventListener("hashchange", scheduleBurst);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
