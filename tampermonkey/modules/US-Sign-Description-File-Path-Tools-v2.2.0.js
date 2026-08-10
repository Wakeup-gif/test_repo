(function () {
  "use strict";

  if (window.__usSignDescriptionPathToolsV220) return;
  window.__usSignDescriptionPathToolsV220 = true;

  const HOST_ID = "us-sign-description-path-tools-standalone";
  const LEGACY_HOST_ID = "us-sign-description-path-tools";
  const PROTOCOL = "ussign-onecommander";

  let currentContent = null;
  let contentObserver = null;
  let refreshTimer = null;
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

  function neutralizeLegacyToolbar() {
    const legacy = document.getElementById(LEGACY_HOST_ID);
    if (!legacy) return;
    legacy.dataset.usSignStandaloneDisabled = "true";
    legacy.setAttribute("aria-hidden", "true");
    legacy.style.setProperty("display", "none", "important");
  }

  function panelHeading(panel) {
    const heading = panel?.querySelector(":scope > .panel-heading, :scope > .box-heading, :scope > header");
    if (!heading) return "";
    const clone = heading.cloneNode(true);
    clone.querySelectorAll("a,button,input,select,textarea,script,style,.widget-menu,.panel-menu").forEach((node) => node.remove());
    return headingText(clone.textContent);
  }

  function findDescriptionPanel() {
    const explicit = document.querySelector(".us-sign-description-panel, #descriptionbox, #description-box, [data-section='description']");
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
    try { path = decodeURIComponent(path); } catch (_) {}
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
    return /^[A-Z]:\\.+/i.test(path) || /^\\\\[^\\\s]+\\[^\\\s]+(?:\\.*)?$/i.test(path);
  }

  function extractPaths(content) {
    if (!content) return [];
    const clone = content.cloneNode(true);
    clone.querySelector(`#${HOST_ID}`)?.remove();
    clone.querySelector(`#${LEGACY_HOST_ID}`)?.remove();
    clone.querySelectorAll("script,style,noscript").forEach((node) => node.remove());

    const paths = [];
    const add = (value) => {
      const path = normalizePath(value);
      if (validPath(path) && !paths.includes(path)) paths.push(path);
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
    await navigator.clipboard?.writeText?.(path);
  }

  function encodeBase64Url(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function openInExplorer(path) {
    const anchor = document.createElement("a");
    anchor.href = `${PROTOCOL}://open/${encodeBase64Url(path)}`;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => anchor.remove(), 800);
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

  function observeContent(content) {
    if (currentContent === content && contentObserver) return;
    contentObserver?.disconnect();
    currentContent = content;
    contentObserver = null;
    if (!content) return;

    contentObserver = new MutationObserver((mutations) => {
      const relevant = mutations.some((mutation) => {
        const target = mutation.target.nodeType === Node.ELEMENT_NODE ? mutation.target : mutation.target.parentElement;
        return target && !target.closest?.(`#${HOST_ID}, #${LEGACY_HOST_ID}`);
      });
      if (relevant) scheduleRefresh(120);
    });

    contentObserver.observe(content, { childList: true, subtree: true, characterData: true });
  }

  function refresh() {
    refreshTimer = null;
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

  function scheduleRefresh(delay = 60) {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refresh, delay);
  }

  scheduleRefresh(0);
  setTimeout(() => scheduleRefresh(0), 300);
  setTimeout(() => scheduleRefresh(0), 1100);
  window.addEventListener("pageshow", () => scheduleRefresh(40));
  window.addEventListener("us-sign-location-change", () => scheduleRefresh(80));
  window.addEventListener("popstate", () => scheduleRefresh(80));
})();
