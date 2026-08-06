// ==UserScript==
// @name         US Sign - UI Runtime Fixes
// @namespace    us-sign-local-tools
// @version      2.1.0
// @description  Stable Scope workspace, readable rich-text colors, and cached custom USSM logo.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      i.imgur.com
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  const VERSION = "2.1.0";

  const CUSTOM_LOGO_URL =
    "https://i.imgur.com/7I1u2iF.png";

  const LOGO_CACHE_KEY =
    "us-sign-custom-logo-data-v1";

  let scopeBuilt = false;
  const observedRoots = new WeakSet();
  const processedIframes = new WeakSet();

  function clean(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizedText(element) {
    return clean(element?.textContent)
      .replace(/:+$/, "")
      .trim()
      .toLowerCase();
  }

  function directChildUnder(parent, element) {
    let current = element;

    while (
      current?.parentElement &&
      current.parentElement !== parent
    ) {
      current = current.parentElement;
    }

    return current?.parentElement === parent
      ? current
      : null;
  }

  /* =====================================================
     CUSTOM LOGO
  ===================================================== */

  function findHeaderLogo() {
    return (
      document.querySelector(
        "header.navbar .navbar-brand img"
      ) ||
      document.querySelector(
        ".navbar-branding .navbar-brand img"
      ) ||
      document.querySelector(
        'img[src*="US-Sign" i]'
      )
    );
  }

  function applyLogo(dataUrl) {
    const logo = findHeaderLogo();

    if (!logo || !dataUrl) {
      return false;
    }

    logo.dataset.usSignOriginalSrc =
      logo.dataset.usSignOriginalSrc ||
      logo.getAttribute("src") ||
      "";

    logo.src = dataUrl;
    logo.removeAttribute("srcset");

    logo.style.setProperty(
      "display",
      "block",
      "important"
    );

    logo.style.setProperty(
      "visibility",
      "visible",
      "important"
    );

    logo.style.setProperty(
      "opacity",
      "1",
      "important"
    );

    logo.style.setProperty(
      "max-height",
      "52px",
      "important"
    );

    logo.style.setProperty(
      "width",
      "auto",
      "important"
    );

    logo.dataset.usSignCustomLogo =
      "true";

    return true;
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () =>
        resolve(String(reader.result || ""));

      reader.onerror = () =>
        reject(
          reader.error ||
          new Error("Could not read logo.")
        );

      reader.readAsDataURL(blob);
    });
  }

  async function restoreCustomLogo() {
    const cached =
      await GM_getValue(
        LOGO_CACHE_KEY,
        ""
      );

    if (
      cached &&
      applyLogo(cached)
    ) {
      return;
    }

    GM_xmlhttpRequest({
      method: "GET",
      url: CUSTOM_LOGO_URL,
      responseType: "blob",
      timeout: 15000,

      onload: async (response) => {
        if (
          response.status < 200 ||
          response.status >= 300 ||
          !response.response
        ) {
          return;
        }

        try {
          const dataUrl =
            await blobToDataUrl(
              response.response
            );

          await GM_setValue(
            LOGO_CACHE_KEY,
            dataUrl
          );

          applyLogo(dataUrl);
        } catch {
          /* Keep the original logo as fallback. */
        }
      },

      onerror: () => {
        /* Keep the original logo as fallback. */
      },

      ontimeout: () => {
        /* Keep the original logo as fallback. */
      }
    });
  }

  /* =====================================================
     SCOPE WORKSPACE
  ===================================================== */

  function findScopeContext() {
    const select =
      document.querySelector("#ps-select");

    const description =
      document.querySelector(
        "textarea#description"
      );

    if (!select || !description) {
      return null;
    }

    const form =
      description.closest("form");

    const well =
      select.closest(".well");

    if (
      !form ||
      !well ||
      !well.contains(form)
    ) {
      return null;
    }

    const wrapper =
      select.closest(
        ".multiselect-native-select"
      ) ||
      select.parentElement;

    const insert =
      well.querySelector("#insert-btn") ||
      document.querySelector("#insert-btn");

    const multiselectButton =
      wrapper?.querySelector(
        "button.multiselect"
      );

    if (
      !wrapper ||
      !insert ||
      !multiselectButton
    ) {
      return null;
    }

    return {
      well,
      select,
      form,
      wrapper,
      insert
    };
  }

  function findScopeFooter(form) {
    return [
      ...form.querySelectorAll(
        ":scope > .row"
      )
    ].find((row) => {
      return Boolean(
        row.querySelector(
          'input[type="submit"]'
        ) &&
        row.querySelector(
          'a[href*="print_scope" i]'
        )
      );
    }) || null;
  }

  function classifyScopeFooter(footer) {
    if (!footer) {
      return;
    }

    footer.classList.add(
      "us-sign-scope-footer"
    );

    for (const column of footer.children) {
      const text =
        clean(column.textContent)
          .toLowerCase();

      if (
        column.querySelector(
          'input[type="submit"]'
        )
      ) {
        column.classList.add(
          "us-sign-scope-update"
        );
      } else if (
        column.querySelector(
          'a[href*="print_scope" i]'
        )
      ) {
        column.classList.add(
          "us-sign-scope-print"
        );
      } else if (
        text.includes("last updated")
      ) {
        column.classList.add(
          "us-sign-scope-updated"
        );
      }
    }
  }

  function hideNativeScopeTitle(well, header) {
    const directCandidates = [
      ...well.children
    ].filter((element) => {
      return [
        "STRONG",
        "B",
        "LABEL",
        "H1",
        "H2",
        "H3",
        "H4"
      ].includes(element.tagName);
    });

    for (const element of directCandidates) {
      if (
        element === header ||
        normalizedText(element) !==
          "scope of work"
      ) {
        continue;
      }

      element.classList.add(
        "us-sign-scope-native-title"
      );

      element.hidden = true;
      element.setAttribute(
        "aria-hidden",
        "true"
      );

      const next =
        element.nextElementSibling;

      if (next?.tagName === "BR") {
        next.classList.add(
          "us-sign-scope-native-title-break"
        );

        next.hidden = true;
        next.setAttribute(
          "aria-hidden",
          "true"
        );
      }
    }
  }

  function buildScopeWorkspace() {
    if (scopeBuilt) {
      return true;
    }

    const context =
      findScopeContext();

    if (!context) {
      return false;
    }

    const {
      well,
      form,
      wrapper,
      insert
    } = context;

    document
      .getElementById(
        "us-sign-scope-header"
      )
      ?.remove();

    const header =
      document.createElement("div");

    header.id =
      "us-sign-scope-header";

    header.dataset.version =
      VERSION;

    const title =
      document.createElement("span");

    title.className =
      "us-sign-scope-title";

    title.textContent =
      "Scope of Work";

    const controls =
      document.createElement("div");

    controls.className =
      "us-sign-scope-controls";

    header.append(title, controls);
    well.prepend(header);

    const nativeControlRow =
      directChildUnder(well, wrapper);

    const nativeInsertRow =
      directChildUnder(well, insert);

    controls.appendChild(wrapper);
    controls.appendChild(insert);

    for (const nativeRow of [
      nativeControlRow,
      nativeInsertRow
    ]) {
      if (
        nativeRow &&
        nativeRow !== header &&
        nativeRow !== form &&
        nativeRow.isConnected
      ) {
        nativeRow.classList.add(
          "us-sign-scope-native-controls"
        );

        nativeRow.hidden = true;
        nativeRow.setAttribute(
          "aria-hidden",
          "true"
        );
      }
    }

    well.classList.add(
      "us-sign-scope-enhanced"
    );

    form.classList.add(
      "us-sign-scope-form"
    );

    hideNativeScopeTitle(
      well,
      header
    );

    classifyScopeFooter(
      findScopeFooter(form)
    );

    scopeBuilt = true;
    return true;
  }

  function retryScopeWorkspace() {
    let attempts = 0;

    const timer =
      window.setInterval(() => {
        attempts += 1;

        if (
          buildScopeWorkspace() ||
          attempts >= 40
        ) {
          window.clearInterval(timer);
        }
      }, 250);
  }

  /* =====================================================
     ACCESSIBLE RICH-TEXT COLORS
  ===================================================== */

  function parseRgb(documentRef, rawValue) {
    const value =
      clean(rawValue);

    if (
      !value ||
      value === "transparent" ||
      value === "inherit" ||
      value === "initial"
    ) {
      return null;
    }

    const probe =
      documentRef.createElement("span");

    probe.style.color = "";
    probe.style.color = value;

    if (!probe.style.color) {
      return null;
    }

    documentRef.body.appendChild(probe);

    const computed =
      documentRef.defaultView
        .getComputedStyle(probe)
        .color;

    probe.remove();

    const match =
      computed.match(
        /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/i
      );

    if (!match) {
      return null;
    }

    return {
      r: Number(match[1]) / 255,
      g: Number(match[2]) / 255,
      b: Number(match[3]) / 255,
      a:
        match[4] === undefined
          ? 1
          : Number(match[4])
    };
  }

  function rgbToHsl({ r, g, b, a }) {
    const max =
      Math.max(r, g, b);

    const min =
      Math.min(r, g, b);

    const delta =
      max - min;

    let h = 0;

    if (delta !== 0) {
      if (max === r) {
        h =
          ((g - b) / delta) % 6;
      } else if (max === g) {
        h =
          (b - r) / delta + 2;
      } else {
        h =
          (r - g) / delta + 4;
      }

      h *= 60;

      if (h < 0) {
        h += 360;
      }
    }

    const l =
      (max + min) / 2;

    const s =
      delta === 0
        ? 0
        : delta /
          (1 - Math.abs(2 * l - 1));

    return { h, s, l, a };
  }

  function hslCss(h, s, l, a = 1) {
    return `hsla(${Math.round(h)}, ${Math.round(
      s * 100
    )}%, ${Math.round(
      l * 100
    )}%, ${Math.max(
      0,
      Math.min(1, a)
    )})`;
  }

  function readableTextColor(documentRef, rawValue) {
    const rgb =
      parseRgb(
        documentRef,
        rawValue
      );

    if (!rgb) {
      return null;
    }

    const hsl =
      rgbToHsl(rgb);

    if (hsl.a === 0) {
      return null;
    }

    if (hsl.s < 0.06) {
      return hslCss(
        hsl.h,
        0.04,
        0.76,
        hsl.a
      );
    }

    return hslCss(
      hsl.h,
      Math.min(hsl.s, 0.42),
      Math.max(
        0.68,
        Math.min(hsl.l, 0.80)
      ),
      hsl.a
    );
  }

  function readableBackgroundColor(
    documentRef,
    rawValue
  ) {
    const rgb =
      parseRgb(
        documentRef,
        rawValue
      );

    if (!rgb) {
      return null;
    }

    const hsl =
      rgbToHsl(rgb);

    if (hsl.a === 0) {
      return null;
    }

    return hslCss(
      hsl.h,
      Math.min(hsl.s, 0.28),
      0.24,
      Math.min(hsl.a, 0.88)
    );
  }

  function hasDirectText(element) {
    return [
      ...element.childNodes
    ].some((node) => {
      return (
        node.nodeType ===
          Node.TEXT_NODE &&
        clean(node.textContent)
      );
    });
  }

  function accessibleAccentForHue(hue) {
    if (
      hue >= 200 &&
      hue <= 265
    ) {
      return "#a9c2d8";
    }

    if (
      hue < 24 ||
      hue >= 338
    ) {
      return "#d9aaaa";
    }

    if (
      hue >= 78 &&
      hue <= 172
    ) {
      return "#acd0b5";
    }

    if (
      hue >= 38 &&
      hue < 78
    ) {
      return "#d9c18f";
    }

    if (
      hue > 265 &&
      hue < 338
    ) {
      return "#c8b0d4";
    }

    if (
      hue > 172 &&
      hue < 200
    ) {
      return "#9fc9cc";
    }

    return hslCss(
      hue,
      0.32,
      0.74,
      1
    );
  }

  function normalizeComputedColors(
    root
  ) {
    const documentRef =
      root.ownerDocument ||
      document;

    const windowRef =
      documentRef.defaultView;

    if (!windowRef) {
      return;
    }

    const elements = [
      root,
      ...root.querySelectorAll("*")
    ];

    for (const element of elements) {
      if (
        !(
          element instanceof
          windowRef.Element
        )
      ) {
        continue;
      }

      if (
        [
          "SCRIPT",
          "STYLE",
          "NOSCRIPT",
          "IFRAME",
          "IMG",
          "SVG",
          "PATH",
          "INPUT",
          "TEXTAREA",
          "SELECT",
          "OPTION",
          "BUTTON"
        ].includes(element.tagName)
      ) {
        continue;
      }

      if (
        !hasDirectText(element) &&
        ![
          "SPAN",
          "FONT",
          "A",
          "MARK"
        ].includes(element.tagName)
      ) {
        continue;
      }

      const computed =
        windowRef.getComputedStyle(
          element
        );

      const rgb =
        parseRgb(
          documentRef,
          computed.color
        );

      if (!rgb) {
        continue;
      }

      const hsl =
        rgbToHsl(rgb);

      if (
        hsl.s < 0.48 ||
        hsl.a === 0
      ) {
        continue;
      }

      const readable =
        accessibleAccentForHue(
          hsl.h
        );

      element.style.setProperty(
        "color",
        readable,
        "important"
      );

      element.style.setProperty(
        "-webkit-text-fill-color",
        readable,
        "important"
      );

      element.style.setProperty(
        "text-shadow",
        "none",
        "important"
      );

      element.style.setProperty(
        "filter",
        "none",
        "important"
      );

      element.dataset
        .usSignReadableColor =
        "true";
    }
  }

  function normalizeElementColor(
    element,
    documentRef
  ) {
    if (
      !(element instanceof
        documentRef.defaultView.Element)
    ) {
      return;
    }

    const fontColor =
      element.getAttribute("color");

    const inlineColor =
      element.style?.color;

    const rawTextColor =
      inlineColor || fontColor;

    if (rawTextColor) {
      const normalized =
        readableTextColor(
          documentRef,
          rawTextColor
        );

      if (normalized) {
        element.style.setProperty(
          "color",
          normalized,
          "important"
        );

        element.style.setProperty(
          "-webkit-text-fill-color",
          normalized,
          "important"
        );
      }
    }

    const bgcolor =
      element.getAttribute("bgcolor");

    const rawBackground =
      element.style?.backgroundColor ||
      bgcolor;

    if (rawBackground) {
      const normalized =
        readableBackgroundColor(
          documentRef,
          rawBackground
        );

      if (normalized) {
        element.style.setProperty(
          "background-color",
          normalized,
          "important"
        );

        element.style.setProperty(
          "color",
          "#e8edf2",
          "important"
        );
      }
    }

    element.style?.setProperty(
      "text-shadow",
      "none",
      "important"
    );
  }

  function normalizeRoot(root) {
    const documentRef =
      root.ownerDocument ||
      document;

    root.classList?.add(
      "us-sign-readable-content"
    );

    const selector = [
      "[style*='color' i]",
      "font[color]",
      "[style*='background' i]",
      "[bgcolor]",
      "mark"
    ].join(", ");

    if (
      root.matches?.(selector)
    ) {
      normalizeElementColor(
        root,
        documentRef
      );
    }

    for (
      const element of
      root.querySelectorAll(selector)
    ) {
      normalizeElementColor(
        element,
        documentRef
      );
    }

    normalizeComputedColors(root);

    if (
      observedRoots.has(root)
    ) {
      return;
    }

    observedRoots.add(root);

    const observer =
      new MutationObserver(
        (mutations) => {
          for (const mutation of mutations) {
            if (
              mutation.type ===
              "attributes"
            ) {
              normalizeElementColor(
                mutation.target,
                documentRef
              );
            }

            for (
              const node of
              mutation.addedNodes
            ) {
              if (
                node.nodeType ===
                Node.ELEMENT_NODE
              ) {
                normalizeRoot(node);
              }
            }
          }

          windowRef.requestAnimationFrame(
            () => {
              normalizeComputedColors(
                root
              );
            }
          );
        }
      );

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "style",
        "color",
        "bgcolor"
      ]
    });
  }

  function injectEditorBaseStyle(editorDocument) {
    if (
      editorDocument.getElementById(
        "us-sign-editor-readable-style"
      )
    ) {
      return;
    }

    const style =
      editorDocument.createElement("style");

    style.id =
      "us-sign-editor-readable-style";

    style.textContent = `
      html,
      body {
        background: #0b0e12 !important;
        color: #c5cdd6 !important;
        font-family:
          Inter,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif !important;
      }

      body {
        padding: 12px 16px !important;
        line-height: 1.55 !important;
      }

      a {
        color: #9bb8d2 !important;
      }

      strong,
      b,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: #e8edf2 !important;
      }

      mark {
        color: #e8edf2 !important;
        background: rgba(211, 186, 134, 0.18) !important;
        border-radius: 4px !important;
        padding: 0 0.12em !important;
      }
    `;

    (
      editorDocument.head ||
      editorDocument.documentElement
    ).appendChild(style);
  }

  function processEditorIframe(iframe) {
    if (
      processedIframes.has(iframe)
    ) {
      return;
    }

    const process = () => {
      try {
        const editorDocument =
          iframe.contentDocument;

        const body =
          editorDocument?.body;

        if (!editorDocument || !body) {
          return;
        }

        processedIframes.add(iframe);

        injectEditorBaseStyle(
          editorDocument
        );

        normalizeRoot(body);
      } catch {
        /* Ignore inaccessible frames. */
      }
    };

    iframe.addEventListener(
      "load",
      process
    );

    process();
  }

  function scanReadableContent() {
    for (
      const root of
      document.querySelectorAll(
        [
          "#descriptionbox",
          "#designbox",
          ".us-sign-description-panel",
          ".us-sign-description-panel .panel-body",
          "#us-sign-design-bottom-grid .panel-body",
          ".us-sign-scope-form"
        ].join(", ")
      )
    ) {
      normalizeRoot(root);
    }

    for (
      const iframe of
      document.querySelectorAll(
        "iframe.cke_wysiwyg_frame"
      )
    ) {
      processEditorIframe(iframe);
    }
  }

  function watchForContent() {
    scanReadableContent();

    const observer =
      new MutationObserver(
        (mutations) => {
          let shouldScan = false;

          for (const mutation of mutations) {
            for (
              const node of
              mutation.addedNodes
            ) {
              if (
                node.nodeType !==
                Node.ELEMENT_NODE
              ) {
                continue;
              }

              if (
                node.matches?.(
                  [
                    "#descriptionbox",
                    "#designbox",
                    ".us-sign-description-panel",
                    "iframe.cke_wysiwyg_frame"
                  ].join(", ")
                ) ||
                node.querySelector?.(
                  [
                    "#descriptionbox",
                    "#designbox",
                    ".us-sign-description-panel",
                    "iframe.cke_wysiwyg_frame"
                  ].join(", ")
                )
              ) {
                shouldScan = true;
              }
            }
          }

          if (shouldScan) {
            window.setTimeout(
              scanReadableContent,
              50
            );
          }
        }
      );

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /* =====================================================
     STARTUP
  ===================================================== */

  function start() {
    document.documentElement
      .dataset
      .usSignUiRuntime =
      VERSION;

    restoreCustomLogo();
    retryScopeWorkspace();
    watchForContent();

    window.addEventListener(
      "pageshow",
      () => {
        restoreCustomLogo();
        scanReadableContent();
      }
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      start,
      { once: true }
    );
  } else {
    start();
  }
})();