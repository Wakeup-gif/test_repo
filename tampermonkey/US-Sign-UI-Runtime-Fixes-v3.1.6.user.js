// ==UserScript==
// @name         US Sign - UI Runtime Fixes
// @namespace    us-sign-local-tools
// @version      3.1.6
// @description  Lightweight cached logo and hardened Dark Glass CKEditor iframe transparency. No page-wide observers, color crawlers, or Scope DOM ownership.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      i.imgur.com
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-UI-Runtime-Fixes.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-UI-Runtime-Fixes.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__usSignUiRuntimeV316) return;
  window.__usSignUiRuntimeV316 = true;

  const VERSION = "3.1.6";
  const CUSTOM_LOGO_URL = "https://i.imgur.com/7I1u2iF.png";
  const LOGO_CACHE_KEY = "us-sign-custom-logo-data-v1";
  const processedIframes = new WeakSet();

  let logoTask = null;
  let cachedLogoData = "";
  let navigationTimer = 0;

  document.documentElement.dataset.usSignUiRuntime = VERSION;

  function findHeaderLogo() {
    return (
      document.querySelector("header.navbar .navbar-brand img") ||
      document.querySelector(".navbar-branding .navbar-brand img") ||
      document.querySelector('img[src*="US-Sign" i]') ||
      document.querySelector('img[src*="USSIGN" i]')
    );
  }

  function applyLogo(dataUrl) {
    const logo = findHeaderLogo();
    if (!logo || !dataUrl) return false;
    if (logo.dataset.usSignCustomLogo === "true" && logo.src === dataUrl) return true;
    logo.dataset.usSignOriginalSrc = logo.dataset.usSignOriginalSrc || logo.getAttribute("src") || "";
    logo.src = dataUrl;
    logo.removeAttribute("srcset");
    logo.dataset.usSignCustomLogo = "true";
    logo.style.setProperty("display", "block", "important");
    logo.style.setProperty("visibility", "visible", "important");
    logo.style.setProperty("opacity", "1", "important");
    logo.style.setProperty("max-height", "52px", "important");
    logo.style.setProperty("width", "auto", "important");
    return true;
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("Could not read logo."));
      reader.readAsDataURL(blob);
    });
  }

  function requestLogoBlob() {
    return new Promise((resolve) => {
      if (typeof GM_xmlhttpRequest !== "function") return resolve("");
      GM_xmlhttpRequest({
        method: "GET",
        url: CUSTOM_LOGO_URL,
        responseType: "blob",
        timeout: 12000,
        onload: async (response) => {
          if (response.status < 200 || response.status >= 300 || !response.response) return resolve("");
          try { resolve(await blobToDataUrl(response.response)); } catch (_) { resolve(""); }
        },
        onerror: () => resolve(""),
        ontimeout: () => resolve("")
      });
    });
  }

  function getLogoData() {
    if (cachedLogoData) return Promise.resolve(cachedLogoData);
    if (logoTask) return logoTask;
    logoTask = (async () => {
      try {
        const stored = await GM_getValue(LOGO_CACHE_KEY, "");
        if (stored) {
          cachedLogoData = String(stored);
          return cachedLogoData;
        }
      } catch (_) {}
      const downloaded = await requestLogoBlob();
      if (!downloaded) return "";
      cachedLogoData = downloaded;
      try { await GM_setValue(LOGO_CACHE_KEY, downloaded); } catch (_) {}
      return downloaded;
    })().finally(() => { logoTask = null; });
    return logoTask;
  }

  async function restoreCustomLogo() {
    const dataUrl = cachedLogoData || await getLogoData();
    if (dataUrl) applyLogo(dataUrl);
  }

  function injectEditorStyle(editorDocument) {
    if (!editorDocument || editorDocument.getElementById("us-sign-editor-readable-style")) return;
    const style = editorDocument.createElement("style");
    style.id = "us-sign-editor-readable-style";
    style.textContent = `
      html, body {
        background: #111418 !important;
        color: #c9ced5 !important;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
      }
      body { padding: 12px 16px !important; line-height: 1.55 !important; }
      a { color: #9bb8d2 !important; }
      strong, b, h1, h2, h3, h4, h5, h6 { color: #f4f6f8 !important; }
      mark, .marker, .highlight, [class*="highlight" i] {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      font[color="blue"], [style*="color: blue" i], [style*="#0000ff" i] { color: #a9c2d8 !important; }
      font[color="red"], [style*="color: red" i], [style*="#ff0000" i] { color: #d9aaaa !important; }
      font[color="green"], [style*="color: green" i], [style*="#008000" i] { color: #acd0b5 !important; }
    `;

    if (document.documentElement?.classList.contains("us-sign-theme-dark-glass")) {
      style.textContent += `
        html, html body, html body.cke_editable, html body.cke_editable_themed { background:transparent !important; background-color:transparent !important; background-image:none !important; color:#d4d4d7 !important; caret-color:#fff !important; color-scheme:dark !important; }
        a { color:#c6c8cc !important; }
        strong, b, h1, h2, h3, h4, h5, h6 { color:#f4f4f5 !important; }
        font[color="blue"], [style*="color: blue" i], [style*="#0000ff" i] { color:#c3c5c9 !important; }
        font[color="red"], [style*="color: red" i], [style*="#ff0000" i] { color:#dbaaaa !important; }
        font[color="green"], [style*="color: green" i], [style*="#008000" i] { color:#b6d1bb !important; }
      `;
    }
    (editorDocument.head || editorDocument.documentElement).appendChild(style);
  }

  function processEditorIframe(iframe) {
    if (!iframe) return;

    // A transparent document is not enough when CKEditor/native CSS paints the
    // iframe element itself white. Clear both layers before/after load.
    iframe.setAttribute("allowtransparency", "true");
    iframe.style.setProperty("background", "transparent", "important");
    iframe.style.setProperty("background-color", "transparent", "important");
    iframe.style.setProperty("background-image", "none", "important");
    iframe.style.setProperty("border", "0", "important");
    if (document.documentElement?.classList.contains("us-sign-theme-dark-glass")) {
      iframe.style.setProperty("color-scheme", "dark", "important");
    }

    if (processedIframes.has(iframe)) return;
    const process = () => {
      try {
        const editorDocument = iframe.contentDocument;
        if (!editorDocument?.documentElement || !editorDocument?.body) return;
        processedIframes.add(iframe);
        injectEditorStyle(editorDocument);

        if (document.documentElement?.classList.contains("us-sign-theme-dark-glass")) {
          editorDocument.documentElement.style.setProperty("background", "transparent", "important");
          editorDocument.documentElement.style.setProperty("background-color", "transparent", "important");
          editorDocument.documentElement.style.setProperty("background-image", "none", "important");
          editorDocument.documentElement.style.setProperty("color-scheme", "dark", "important");
          editorDocument.body.style.setProperty("background", "transparent", "important");
          editorDocument.body.style.setProperty("background-color", "transparent", "important");
          editorDocument.body.style.setProperty("background-image", "none", "important");
          editorDocument.body.style.setProperty("color", "#d4d4d7", "important");
          editorDocument.body.style.setProperty("caret-color", "#ffffff", "important");
        }
      } catch (_) {}
    };
    iframe.addEventListener("load", process, { once: true });
    process();
  }

  function scanEditors() {
    for (const iframe of document.querySelectorAll("iframe.cke_wysiwyg_frame")) processEditorIframe(iframe);
  }

  function runPass() {
    restoreCustomLogo();
    scanEditors();
  }

  function scheduleNavigationPass(delay = 80) {
    window.clearTimeout(navigationTimer);
    navigationTimer = window.setTimeout(runPass, delay);
  }

  runPass();
  window.setTimeout(runPass, 450);
  window.addEventListener("pageshow", runPass);
  window.addEventListener("us-sign-location-change", () => scheduleNavigationPass(80));
})();
