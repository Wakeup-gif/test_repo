// ==UserScript==
// @name         US Sign Scope of Work File Tools
// @namespace    us-sign-full-modules
// @version      2.6.2
// @description  Adds project-folder and reference-link controls from Important Notes with reliable OneCommander launching.
// @match        https://ussignandmill.squarecoil.net/project.php*
// @run-at       document-idle
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Scope-of-Work-File-Tools.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Scope-of-Work-File-Tools.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__usSignScopeFileToolsV262) return;
  window.__usSignScopeFileToolsV262 = true;

  const HOST_ID = "us-sign-scope-file-tools";
  const PROTOCOL = "ussign-onecommander";

  GM_addStyle(`
    #${HOST_ID} {
      margin: 0 0 10px !important;
      overflow: hidden;
      background: rgba(255,255,255,.018);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 9px;
      color: #c5cdd6;
      font-family: Inter, system-ui, sans-serif;
    }
    #${HOST_ID} .us-file-title {
      padding: 9px 11px;
      border-bottom: 1px solid rgba(255,255,255,.08);
      color: #e8edf2;
      font-size: 12px;
      font-weight: 650;
    }
    #${HOST_ID} .us-file-body { display:grid; gap:9px; padding:10px; }
    #${HOST_ID} .us-file-label {
      margin-bottom:5px;
      color:#87919c;
      font-size:9px;
      font-weight:600;
      letter-spacing:.03em;
      text-transform:uppercase;
    }
    #${HOST_ID} .us-path-row {
      display:grid;
      grid-template-columns:minmax(0,1fr) auto auto;
      gap:7px;
    }
    #${HOST_ID} .us-path-value {
      min-width:0;
      padding:8px 9px;
      overflow:hidden;
      color:#bcc4cd;
      background:rgba(255,255,255,.025);
      border:1px solid rgba(255,255,255,.08);
      border-radius:7px;
      font:10px/1.35 Consolas,monospace;
      text-overflow:ellipsis;
      white-space:nowrap;
    }
    #${HOST_ID} .us-link-grid {
      display:grid;
      grid-template-columns:repeat(5,minmax(0,1fr));
      gap:7px;
    }
    #${HOST_ID} button {
      min-height:32px !important;
      padding:6px 9px !important;
      color:#c5cdd6 !important;
      background:rgba(255,255,255,.04) !important;
      border:1px solid rgba(255,255,255,.12) !important;
      border-radius:7px !important;
      box-shadow:none !important;
      font-size:10.5px !important;
    }
    #${HOST_ID} button:disabled { opacity:.38; cursor:not-allowed; }

    html.us-sign-theme-dark-glass body #${HOST_ID} {
      color:#d0d0d4;
      background:rgba(11,11,14,.32);
      border-color:rgba(255,255,255,.070);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.018);
      -webkit-backdrop-filter:none;
      backdrop-filter:none;
    }
    html.us-sign-theme-dark-glass body #${HOST_ID} .us-file-title {
      color:#eeeeef;
      border-bottom-color:rgba(255,255,255,.065);
    }
    html.us-sign-theme-dark-glass body #${HOST_ID} .us-file-label { color:#96969d; }
    html.us-sign-theme-dark-glass body #${HOST_ID} .us-path-value {
      color:#ccccd1;
      background:rgba(255,255,255,.025);
      border-color:rgba(255,255,255,.070);
    }
    html.us-sign-theme-dark-glass body #${HOST_ID} button {
      color:#d2d2d6 !important;
      background:rgba(255,255,255,.038) !important;
      border-color:rgba(255,255,255,.085) !important;
    }
    html.us-sign-theme-dark-glass body #${HOST_ID} button:hover:not(:disabled) {
      color:#fff !important;
      background:rgba(255,255,255,.070) !important;
      border-color:rgba(255,255,255,.12) !important;
    }
    @media(max-width:700px){
      #${HOST_ID} .us-path-row{grid-template-columns:1fr;}
      #${HOST_ID} .us-link-grid{grid-template-columns:repeat(2,minmax(0,1fr));}
    }
  `);

  function extractUrl(value) {
    return String(value || "").match(/https?:\/\/[^\s<>"']+/i)?.[0]?.replace(/[),.;]+$/, "") || "";
  }

  function parseNotes(text) {
    const lines = String(text || "").replace(/\r/g, "").split("\n");
    const projectPath = lines.map((line) => line.trim()).find((line) => /^[A-Za-z]:\\/.test(line)) || "";

    function labeled(pattern) {
      for (let index = 0; index < lines.length; index += 1) {
        if (!pattern.test(lines[index])) continue;
        const same = extractUrl(lines[index]);
        if (same) return same;
        for (let next = index + 1; next < Math.min(lines.length, index + 3); next += 1) {
          const url = extractUrl(lines[next]);
          if (url) return url;
        }
      }
      return "";
    }

    const urls = lines.map(extractUrl).filter(Boolean);
    return {
      projectPath,
      checkSet: labeled(/\bCHECK\s*SET\b/i),
      survey: labeled(/\bSURVEY(?:\s*&\s*DD)?\b/i),
      dropbox: labeled(/^\s*(?:ROOT\s+)?DROP\s*BOX(?:\s+FOLDER)?\b/i) || urls.find((url) => /dropbox/i.test(url)) || "",
      bidPermit: labeled(/\bBID\s*(?:\/|-)\s*PERMIT\b/i),
      ddt: labeled(/^\s*DDT\b/i)
    };
  }

  function findNotes() {
    return document.querySelector("textarea.important-notes") || [...document.querySelectorAll("textarea")].find((textarea) => {
      return /^[ \t]*[A-Za-z]:\\/m.test(textarea.value) || /\bCHECK\s*SET\b|\bSURVEY\b|\bDROP\s*BOX\b/i.test(textarea.value);
    }) || null;
  }

  function encodeBase64Url(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function copyText(text) {
    if (!text) return;
    if (typeof GM_setClipboard === "function") GM_setClipboard(text, "text");
    else navigator.clipboard?.writeText(text);
  }

  function openPath(path) {
    if (!path) return;
    const anchor = document.createElement("a");
    anchor.href = `${PROTOCOL}://open/${encodeBase64Url(path)}`;
    anchor.style.display = "none";
    anchor.setAttribute("aria-hidden", "true");
    document.body.appendChild(anchor);
    anchor.click();
    window.setTimeout(() => anchor.remove(), 800);
  }

  function openUrl(url) {
    if (!url) return;
    if (typeof GM_openInTab === "function") GM_openInTab(url, { active: true, insert: true });
    else window.open(url, "_blank", "noopener");
  }

  function build(textarea) {
    const host = document.createElement("section");
    host.id = HOST_ID;
    host.innerHTML = `
      <div class="us-file-title">Job files</div>
      <div class="us-file-body">
        <div>
          <div class="us-file-label">Project folder</div>
          <div class="us-path-row">
            <div class="us-path-value" data-path></div>
            <button type="button" data-action="copy">Copy</button>
            <button type="button" data-action="open">Open</button>
          </div>
        </div>
        <div>
          <div class="us-file-label">Reference links</div>
          <div class="us-link-grid">
            <button type="button" data-link="checkSet">Check Set</button>
            <button type="button" data-link="survey">Survey</button>
            <button type="button" data-link="dropbox">Dropbox</button>
            <button type="button" data-link="bidPermit">Bid Permit</button>
            <button type="button" data-link="ddt">DDT</button>
          </div>
        </div>
      </div>`;

    host.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || button.disabled) return;

      event.preventDefault();
      event.stopPropagation();

      const data = parseNotes(textarea.value);
      if (button.dataset.action === "copy") copyText(data.projectPath);
      if (button.dataset.action === "open") openPath(data.projectPath);
      if (button.dataset.link) openUrl(data[button.dataset.link]);
    });

    return host;
  }

  function update(host, textarea) {
    const data = parseNotes(textarea.value);
    const path = host.querySelector("[data-path]");
    path.textContent = data.projectPath || "No project folder found";
    path.title = data.projectPath || "";

    host.querySelectorAll("button").forEach((button) => {
      if (button.dataset.action) button.disabled = !data.projectPath;
      if (button.dataset.link) button.disabled = !data[button.dataset.link];
    });
  }

  function mount() {
    const textarea = findNotes();
    if (!textarea) return false;

    let host = document.getElementById(HOST_ID);
    if (!host) {
      host = build(textarea);
      textarea.parentElement?.insertBefore(host, textarea);
    }
    update(host, textarea);

    if (!textarea.dataset.usScopeFileToolsBound) {
      textarea.dataset.usScopeFileToolsBound = "true";
      let timer = 0;
      textarea.addEventListener("input", () => {
        clearTimeout(timer);
        timer = window.setTimeout(() => update(host, textarea), 120);
      });
    }
    return true;
  }

  let attempts = 0;
  const retry = () => {
    attempts += 1;
    if (mount() || attempts >= 24) return;
    window.setTimeout(retry, 250);
  };
  retry();
})();
