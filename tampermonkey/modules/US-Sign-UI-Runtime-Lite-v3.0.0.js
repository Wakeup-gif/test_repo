(function () {
  "use strict";

  if (window.__usSignUiRuntimeLiteV300) return;
  window.__usSignUiRuntimeLiteV300 = true;

  const VERSION = "3.0.0";
  const CUSTOM_LOGO_URL = "https://i.imgur.com/7I1u2iF.png";
  const LOGO_CACHE_KEY = "us-sign-custom-logo-data-v1";
  const processedIframes = new WeakSet();

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

    if (logo.src === dataUrl && logo.dataset.usSignCustomLogo === "true") return true;

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

  async function restoreCustomLogo() {
    try {
      const cached = await GM_getValue(LOGO_CACHE_KEY, "");
      if (cached && applyLogo(cached)) return;
    } catch (_) {
      /* Cache is optional. */
    }

    if (typeof GM_xmlhttpRequest !== "function") return;

    GM_xmlhttpRequest({
      method: "GET",
      url: CUSTOM_LOGO_URL,
      responseType: "blob",
      timeout: 12000,
      onload: async (response) => {
        if (response.status < 200 || response.status >= 300 || !response.response) return;
        try {
          const dataUrl = await blobToDataUrl(response.response);
          try { await GM_setValue(LOGO_CACHE_KEY, dataUrl); } catch (_) {}
          applyLogo(dataUrl);
        } catch (_) {}
      }
    });
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
      mark {
        color: #f4f6f8 !important;
        background: rgba(211, 186, 134, 0.18) !important;
        border-radius: 4px !important;
        padding: 0 .12em !important;
      }
      font[color="blue"], [style*="color: blue" i], [style*="#0000ff" i] { color: #a9c2d8 !important; }
      font[color="red"], [style*="color: red" i], [style*="#ff0000" i] { color: #d9aaaa !important; }
      font[color="green"], [style*="color: green" i], [style*="#008000" i] { color: #acd0b5 !important; }
    `;
    (editorDocument.head || editorDocument.documentElement).appendChild(style);
  }

  function processEditorIframe(iframe) {
    if (!iframe || processedIframes.has(iframe)) return;

    const process = () => {
      try {
        const editorDocument = iframe.contentDocument;
        if (!editorDocument?.body) return;
        processedIframes.add(iframe);
        injectEditorStyle(editorDocument);
      } catch (_) {}
    };

    iframe.addEventListener("load", process, { once: true });
    process();
  }

  function scanEditors() {
    for (const iframe of document.querySelectorAll("iframe.cke_wysiwyg_frame")) {
      processEditorIframe(iframe);
    }
  }

  function runPass() {
    restoreCustomLogo();
    scanEditors();
  }

  runPass();
  setTimeout(runPass, 350);
  setTimeout(runPass, 1200);
  window.addEventListener("pageshow", runPass);
  window.addEventListener("us-sign-location-change", () => setTimeout(runPass, 100));
})();
