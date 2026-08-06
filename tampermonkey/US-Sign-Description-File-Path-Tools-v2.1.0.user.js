// ==UserScript==
// @name         US Sign - Description File Path Tools
// @namespace    us-sign-local-tools
// @version      2.1.0
// @description  Reliably detects Description file paths with a dark flat glass toolbar and no duplicate layout stuttering.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        GM_setClipboard
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  /*
   * Unique ID owned only by this standalone script.
   *
   * Design Job Tools v3.7 uses:
   * us-sign-description-path-tools
   *
   * Reusing that ID caused both scripts to move,
   * remove, and rebuild the same toolbar.
   */
  const HOST_ID =
    "us-sign-description-path-tools-standalone";

  const LEGACY_HOST_ID =
    "us-sign-description-path-tools";

  const PROTOCOL =
    "ussign-onecommander";

  let currentPanel = null;
  let currentContent = null;
  let contentObserver = null;
  let updateTimer = null;
  let lastSignature = "";

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

  function isInsideToolbar(element) {
    return Boolean(
      element?.closest?.(
        `#${HOST_ID}, #${LEGACY_HOST_ID}`
      )
    );
  }

  /*
   * Hide the older integrated path toolbar.
   *
   * Design Job Tools may continue maintaining it,
   * but it will no longer appear or compete visually
   * with this standalone toolbar.
   */
  function neutralizeLegacyToolbar() {
    const legacy =
      document.getElementById(
        LEGACY_HOST_ID
      );

    if (!legacy) {
      return;
    }

    legacy.dataset
      .usSignStandaloneDisabled =
      "true";

    legacy.setAttribute(
      "aria-hidden",
      "true"
    );

    legacy.style.setProperty(
      "display",
      "none",
      "important"
    );

    legacy.style.setProperty(
      "width",
      "0",
      "important"
    );

    legacy.style.setProperty(
      "height",
      "0",
      "important"
    );

    legacy.style.setProperty(
      "min-height",
      "0",
      "important"
    );

    legacy.style.setProperty(
      "margin",
      "0",
      "important"
    );

    legacy.style.setProperty(
      "padding",
      "0",
      "important"
    );

    legacy.style.setProperty(
      "overflow",
      "hidden",
      "important"
    );
  }

  function getDirectPanelHeading(panel) {
    if (!panel) {
      return "";
    }

    const heading =
      panel.querySelector(
        ":scope > .panel-heading, " +
        ":scope > .box-heading, " +
        ":scope > header"
      );

    if (!heading) {
      return "";
    }

    const clone =
      heading.cloneNode(true);

    clone.querySelectorAll(
      [
        "a",
        "button",
        "input",
        "select",
        "textarea",
        "script",
        "style",
        ".widget-menu",
        ".panel-menu"
      ].join(", ")
    ).forEach((element) => {
      element.remove();
    });

    return normalizeHeading(
      clone.textContent
    );
  }

  function findDescriptionHeading() {
    const selectors = [
      ".panel-title",
      ".box-title",
      ".panel-heading",
      ".box-heading",
      "h1",
      "h2",
      "h3",
      "h4",
      "header",
      "strong",
      "b"
    ].join(", ");

    return [
      ...document.querySelectorAll(
        selectors
      )
    ].find((element) => {
      if (isInsideToolbar(element)) {
        return false;
      }

      return (
        normalizeHeading(
          element.innerText ||
          element.textContent
        ) === "DESCRIPTION"
      );
    }) || null;
  }

  function findDescriptionPanel() {
    /*
     * First locate an actual panel whose direct heading
     * is exactly DESCRIPTION.
     */
    const exactPanel = [
      ...document.querySelectorAll(
        ".panel, .box, section, article"
      )
    ].find((panel) => {
      if (isInsideToolbar(panel)) {
        return false;
      }

      return (
        getDirectPanelHeading(panel) ===
        "DESCRIPTION"
      );
    });

    if (exactPanel) {
      return exactPanel;
    }

    /*
     * Older pages may have a specific Description ID.
     */
    const exactId =
      document.querySelector(
        "#descriptionbox, " +
        "#description-box, " +
        "[data-section='description']"
      );

    if (
      exactId &&
      !isInsideToolbar(exactId)
    ) {
      return exactId;
    }

    /*
     * Fall back to the exact Description heading.
     */
    const heading =
      findDescriptionHeading();

    if (!heading) {
      return null;
    }

    return heading.closest(
      [
        ".panel",
        ".box",
        "section",
        "article",
        "fieldset"
      ].join(", ")
    ) || heading.parentElement;
  }

  function findDescriptionContent(panel) {
    if (!panel) {
      return null;
    }

    return (
      panel.querySelector(
        ":scope > .panel-body"
      ) ||
      panel.querySelector(
        ":scope > .box-body"
      ) ||
      panel
    );
  }

  function normalizePath(value) {
    let path = clean(value);

    if (!path) {
      return "";
    }

    try {
      path =
        decodeURIComponent(path);
    } catch (_error) {
      // Keep the original path.
    }

    path = path
      .replace(
        /^file:(?:\/\/\/?|\\\\)/i,
        ""
      )
      .replace(
        /^\/([A-Z]:)/i,
        "$1"
      )
      .replace(/\//g, "\\")
      .replace(/^["'`(\[]+/, "")
      .replace(/["'`)\],;.]+$/g, "")
      .trim();

    /*
     * Remove common notes accidentally captured
     * after a path on the same line.
     */
    path = path
      .replace(
        /\s+(?=(?:NOTE|DESCRIPTION|IMPORTANT|CHECK SET|SURVEY)\s*:).*$/i,
        ""
      )
      .trim();

    return path;
  }

  function isValidPath(path) {
    return (
      /^[A-Z]:\\.+/i.test(path) ||
      /^\\\\[^\\\s]+\\[^\\\s]+(?:\\.*)?$/i.test(
        path
      )
    );
  }

  function extractPaths(content) {
    if (!content) {
      return [];
    }

    const clone =
      content.cloneNode(true);

    clone.querySelector(
      `#${HOST_ID}`
    )?.remove();

    clone.querySelector(
      `#${LEGACY_HOST_ID}`
    )?.remove();

    clone.querySelectorAll(
      "script, style, noscript"
    ).forEach((element) => {
      element.remove();
    });

    const paths = [];

    function addPath(value) {
      const path =
        normalizePath(value);

      if (
        !isValidPath(path) ||
        paths.includes(path)
      ) {
        return;
      }

      paths.push(path);
    }

    /*
     * Read file links first.
     */
    clone.querySelectorAll(
      "a[href]"
    ).forEach((link) => {
      addPath(
        link.getAttribute("href")
      );

      addPath(
        link.textContent
      );
    });

    /*
     * Read visible Description lines.
     *
     * Supported examples:
     *
     * Z:\PROJECTS\260083\DESIGN
     * Z:\!MASTERFILES\! HARDWARE DXF\G2G LIGHTING
     * \\SERVER\PROJECTS\260083
     * file:///Z:/PROJECTS/260083
     */
    const text = String(
      clone.innerText ||
      clone.textContent ||
      ""
    )
      .replace(/\u00a0/g, " ")
      .replace(/\r/g, "");

    const pathPattern =
      /(?:file:(?:\/\/\/?|\\\\))?(?:[A-Z]:[\\/]|\\\\[^\\/\s]+[\\/][^\\/\s]+(?:[\\/]|$))[^<>\r\n]*/gi;

    for (
      const line of text.split("\n")
    ) {
      const matches =
        line.match(pathPattern) || [];

      for (const match of matches) {
        addPath(match);
      }
    }

    return paths;
  }

  async function copyPath(path) {
    if (!path) {
      throw new Error(
        "No path found"
      );
    }

    if (
      typeof GM_setClipboard ===
      "function"
    ) {
      GM_setClipboard(
        path,
        "text"
      );

      return;
    }

    if (
      navigator.clipboard?.writeText
    ) {
      await navigator.clipboard
        .writeText(path);

      return;
    }

    const helper =
      document.createElement(
        "textarea"
      );

    helper.value = path;

    helper.style.position =
      "fixed";

    helper.style.opacity = "0";

    helper.style.pointerEvents =
      "none";

    document.body.appendChild(
      helper
    );

    helper.select();

    document.execCommand("copy");

    helper.remove();
  }

  function encodeBase64Url(text) {
    const bytes =
      new TextEncoder()
        .encode(text);

    let binary = "";

    for (const byte of bytes) {
      binary +=
        String.fromCharCode(byte);
    }

    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  function openInOneCommander(path) {
    if (!path) {
      throw new Error(
        "No path found"
      );
    }

    const launcher =
      document.createElement("a");

    launcher.href =
      `${PROTOCOL}://open/` +
      encodeBase64Url(path);

    launcher.style.display =
      "none";

    launcher.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.appendChild(
      launcher
    );

    launcher.click();

    window.setTimeout(() => {
      launcher.remove();
    }, 1000);
  }

  function flashButton(
    button,
    message,
    error = false
  ) {
    if (
      button.dataset.flashing ===
      "true"
    ) {
      return;
    }

    const original =
      button.innerHTML;

    button.dataset.flashing =
      "true";

    button.textContent =
      message;

    button.classList.toggle(
      "error",
      error
    );

    window.setTimeout(() => {
      button.innerHTML =
        original;

      button.classList.remove(
        "error"
      );

      delete button.dataset
        .flashing;
    }, 1300);
  }

  function createToolbar() {
    const host =
      document.createElement("div");

    host.id = HOST_ID;

    host.style.setProperty(
      "display",
      "block",
      "important"
    );

    host.style.setProperty(
      "position",
      "relative",
      "important"
    );

    host.style.setProperty(
      "z-index",
      "100",
      "important"
    );

    host.style.setProperty(
      "pointer-events",
      "auto",
      "important"
    );

    host.style.setProperty(
      "width",
      "100%",
      "important"
    );

    host.style.setProperty(
      "margin",
      "0 0 14px",
      "important"
    );

    const shadow =
      host.attachShadow({
        mode: "open"
      });

    shadow.innerHTML = `
      <style>
        :host,
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        :host {
          display: block;
          width: 100%;
          color: inherit;
          font: inherit;
          pointer-events: auto;
        }

        .toolbar {
          width: 100%;
          padding: 10px;

          color:
            var(
              --text-main,
              #f4f7f0
            );

          background:
            rgba(3, 9, 13, 0.86);

          border:
            1px solid
            rgba(42, 183, 255, 0.22);

          border-radius: 0;
        }

        .heading {
          margin: 0 0 8px;

          color:
            var(
              --acid,
              #b7ff00
            );

          font-family:
            var(
              --font-mono,
              Consolas,
              monospace
            );

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .path-list {
          display: grid;
          gap: 7px;
        }

        .path-card {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            auto;

          align-items: stretch;
          gap: 6px;
        }

        button {
          position: relative;
          z-index: 1;

          min-height: 30px;
          margin: 0;
          padding: 6px 9px;

          color:
            var(
              --cyan-2,
              #78ddff
            );

          background:
            rgba(5, 14, 19, 0.98);

          border:
            1px solid
            rgba(42, 183, 255, 0.32);

          border-radius: 0;

          font:
            inherit;

          pointer-events: auto;
          cursor: pointer;
        }

        button:hover,
        button:focus-visible {
          color:
            var(
              --acid,
              #b7ff00
            );

          background:
            rgba(183, 255, 0, 0.08);

          border-color:
            rgba(183, 255, 0, 0.42);

          outline: none;
        }

        button.error {
          color: #ff6879;

          border-color:
            rgba(255, 48, 71, 0.58);
        }

        .path-code {
          min-width: 0;

          overflow: hidden;

          font-family:
            Consolas,
            "Courier New",
            monospace;

          font-size: 10px;
          line-height: 1.4;

          text-align: left;
          text-overflow: ellipsis;
          text-transform: none;
          white-space: nowrap;

          cursor: copy;
        }

        .open-button {
          font-size: 10px;
          font-weight: 750;

          white-space: nowrap;
        }

        @media (max-width: 650px) {
          .path-card {
            grid-template-columns:
              minmax(0, 1fr);
          }

          .path-code {
            white-space: normal;
            overflow-wrap: anywhere;
          }

          .open-button {
            justify-self: start;
          }
        }

        /* ===============================================
           FLAT GLASS THEME v5.2
           Shadow DOM styling matched to the main UI.
        =============================================== */

        :host {
          --path-bg: #0b0e12;
          --path-surface: rgba(16, 20, 25, 0.92);
          --path-surface-soft: rgba(255, 255, 255, 0.025);
          --path-hover: rgba(255, 255, 255, 0.05);
          --path-border: rgba(255, 255, 255, 0.065);
          --path-border-strong: rgba(255, 255, 255, 0.11);
          --path-text: #e8edf2;
          --path-text-soft: #bcc4cd;
          --path-text-muted: #87919c;
          --path-accent-soft: rgba(127, 146, 166, 0.13);
          --path-danger: #c7a3a3;
          --path-radius-sm: 7px;
          --path-radius-md: 10px;
          --path-font:
            var(
              --font-ui,
              "Inter",
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif
            );

          color: var(--path-text);
          font-family: var(--path-font);
        }

        .toolbar {
          padding: 10px;
          color: var(--path-text);
          background: var(--path-surface);
          border: 1px solid var(--path-border);
          border-radius: var(--path-radius-md);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.24);
          backdrop-filter: blur(14px) saturate(1.02);
          -webkit-backdrop-filter: blur(14px) saturate(1.02);
        }

        .heading {
          margin: 0 0 8px;
          color: var(--path-text-muted);
          font-family: var(--path-font);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0;
          line-height: 1.2;
          text-transform: none;
        }

        .path-list {
          gap: 7px;
        }

        .path-card {
          gap: 7px;
        }

        button {
          min-height: 32px;
          padding: 7px 10px;
          color: var(--path-text-soft);
          background: var(--path-surface-soft);
          border: 1px solid var(--path-border-strong);
          border-radius: var(--path-radius-sm);
          box-shadow: none;
          font-family: var(--path-font);
          font-size: 11px;
          font-weight: 550;
          letter-spacing: 0;
          line-height: 1.3;
          text-transform: none;
          transition:
            background 160ms ease,
            border-color 160ms ease,
            color 160ms ease;
        }

        button:hover,
        button:focus-visible {
          color: var(--path-text);
          background: var(--path-hover);
          border-color: rgba(255, 255, 255, 0.16);
          box-shadow: none;
          outline: none;
        }

        button:active {
          background: rgba(255, 255, 255, 0.065);
        }

        button.error {
          color: #ead7d7;
          background: rgba(199, 163, 163, 0.10);
          border-color: rgba(199, 163, 163, 0.24);
        }

        .path-code {
          color: var(--path-text-soft);
          background: rgba(255, 255, 255, 0.022);
          font-family:
            var(
              --font-mono,
              "SFMono-Regular",
              Consolas,
              "Liberation Mono",
              monospace
            );
          font-size: 10.5px;
          font-weight: 500;
          line-height: 1.4;
        }

        .path-code:hover,
        .path-code:focus-visible {
          color: var(--path-text);
          background: rgba(255, 255, 255, 0.045);
        }

        .open-button {
          color: var(--path-text);
          background: var(--path-accent-soft);
          border-color: rgba(127, 146, 166, 0.22);
          font-family: var(--path-font);
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0;
        }

        .open-button:hover,
        .open-button:focus-visible {
          color: #ffffff;
          background: rgba(127, 146, 166, 0.18);
          border-color: rgba(127, 146, 166, 0.30);
        }

        @media (prefers-reduced-motion: reduce) {
          button {
            transition: none;
          }
        }

      </style>

      <section
        class="toolbar"
        aria-label="Description file paths"
      >
        <h3 class="heading">
          File paths
        </h3>

        <div
          class="path-list"
        ></div>
      </section>
    `;

    shadow.addEventListener(
      "click",
      async (event) => {
        const button =
          event.target.closest(
            "button[data-path]"
          );

        if (!button) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const path =
          button.dataset.path;

        try {
          if (
            button.dataset.action ===
            "oneCommander"
          ) {
            openInOneCommander(path);

            flashButton(
              button,
              "Opening..."
            );
          } else {
            await copyPath(path);

            flashButton(
              button,
              "Copied ✓"
            );
          }
        } catch (_error) {
          flashButton(
            button,
            "Failed",
            true
          );
        }
      }
    );

    return host;
  }

  function mountToolbar(
    host,
    content
  ) {
    if (
      !host ||
      !content
    ) {
      return;
    }

    if (
      host.parentElement !==
      content
    ) {
      content.prepend(host);
      return;
    }

    if (
      content.firstElementChild !==
      host
    ) {
      content.prepend(host);
    }
  }

  function renderPaths(
    host,
    paths
  ) {
    const signature =
      JSON.stringify(paths);

    if (
      signature ===
      lastSignature
    ) {
      return;
    }

    lastSignature = signature;
    host.dataset.signature =
      signature;

    const list =
      host.shadowRoot.querySelector(
        ".path-list"
      );

    list.replaceChildren();

    for (const path of paths) {
      const card =
        document.createElement("div");

      card.className =
        "path-card";

      const copyButton =
        document.createElement(
          "button"
        );

      copyButton.type = "button";
      copyButton.className =
        "path-code";

      copyButton.dataset.path =
        path;

      copyButton.title =
        "Click to copy this path";

      copyButton.textContent =
        path;

      const openButton =
        document.createElement(
          "button"
        );

      openButton.type = "button";
      openButton.className =
        "open-button";

      openButton.dataset.action =
        "oneCommander";

      openButton.dataset.path =
        path;

      openButton.textContent =
        "Open in Explorer";

      card.append(
        copyButton,
        openButton
      );

      list.appendChild(card);
    }
  }

  function observeDescription(
    content
  ) {
    if (
      currentContent === content &&
      contentObserver
    ) {
      return;
    }

    contentObserver?.disconnect();

    currentContent = content;

    if (!content) {
      contentObserver = null;
      return;
    }

    contentObserver =
      new MutationObserver(
        (mutations) => {
          const relevant =
            mutations.some(
              (mutation) => {
                const target =
                  mutation.target
                    .nodeType ===
                    Node.ELEMENT_NODE
                    ? mutation.target
                    : mutation.target
                      .parentElement;

                return (
                  target &&
                  !target.closest(
                    `#${HOST_ID}, ` +
                    `#${LEGACY_HOST_ID}`
                  )
                );
              }
            );

          if (relevant) {
            scheduleUpdate(120);
          }
        }
      );

    contentObserver.observe(
      content,
      {
        childList: true,
        subtree: true,
        characterData: true
      }
    );
  }

  function removeToolbar() {
    document
      .getElementById(HOST_ID)
      ?.remove();

    lastSignature = "";
  }

  function updateToolbar() {
    updateTimer = null;

    neutralizeLegacyToolbar();

    const panel =
      findDescriptionPanel();

    if (!panel) {
      currentPanel = null;
      observeDescription(null);
      removeToolbar();
      return;
    }

    const content =
      findDescriptionContent(panel);

    if (!content) {
      removeToolbar();
      return;
    }

    currentPanel = panel;

    observeDescription(content);

    const paths =
      extractPaths(content);

    if (!paths.length) {
      removeToolbar();
      return;
    }

    let host =
      document.getElementById(
        HOST_ID
      );

    if (!host) {
      host = createToolbar();
    }

    mountToolbar(
      host,
      content
    );

    renderPaths(
      host,
      paths
    );
  }

  function scheduleUpdate(
    delay = 80
  ) {
    window.clearTimeout(
      updateTimer
    );

    updateTimer =
      window.setTimeout(
        updateToolbar,
        delay
      );
  }

  /*
   * Observe structural page changes only.
   *
   * Unlike the old one-second loop, this does not
   * continuously clone and scan the Description.
   */
  const pageObserver =
    new MutationObserver(
      (mutations) => {
        neutralizeLegacyToolbar();

        if (
          currentPanel &&
          !currentPanel.isConnected
        ) {
          scheduleUpdate(50);
          return;
        }

        const relevant =
          mutations.some(
            (mutation) => {
              return [
                ...mutation.addedNodes,
                ...mutation.removedNodes
              ].some((node) => {
                if (
                  node.nodeType !==
                  Node.ELEMENT_NODE
                ) {
                  return false;
                }

                const element = node;

                if (
                  isInsideToolbar(element)
                ) {
                  return false;
                }

                return (
                  element.matches?.(
                    ".panel, " +
                    ".box, " +
                    "#descriptionbox, " +
                    "#description-box"
                  ) ||
                  element.querySelector?.(
                    ".panel, " +
                    ".box, " +
                    "#descriptionbox, " +
                    "#description-box"
                  )
                );
              });
            }
          );

        if (relevant) {
          scheduleUpdate(120);
        }
      }
    );

  function start() {
    neutralizeLegacyToolbar();
    updateToolbar();

    pageObserver.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );

    window.addEventListener(
      "load",
      () => {
        scheduleUpdate(50);
      },
      { once: true }
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