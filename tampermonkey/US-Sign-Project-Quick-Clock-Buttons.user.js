// ==UserScript==
// @name         US Sign - Project Quick Clock Buttons
// @namespace    us-sign-local-tools
// @version      0.1.0
// @description  Replaces the native project CLOCK IN button with one-click Design and File Write / CAD clock actions.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Project-Quick-Clock-Buttons.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Project-Quick-Clock-Buttons.user.js
// ==/UserScript==

(() => {
  "use strict";

  const VERSION = "0.1.0";
  const HOST_ID = "us-sign-project-quick-clock";
  const STYLE_ID = "us-sign-project-quick-clock-style";

  const TARGETS = Object.freeze({
    design: {
      label: "DESIGN CLOCK IN",
      department: "47",
      verify: /\bdesign\b/i
    },
    cad: {
      label: "FILE WRITE / CAD",
      department: "29",
      verify: /file writing|cad|shop drawing/i
    }
  });

  let busy = false;

  function clean(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function currentProjectId(nativeButton = null) {
    const nativeId = nativeButton?.dataset?.id;
    if (/^\d{5,}$/.test(nativeId || "")) return nativeId;

    const urlId = new URL(location.href).searchParams.get("id");
    if (/^\d{5,}$/.test(urlId || "")) return urlId;

    const hidden = document.querySelector("#plt-project-id")?.value;
    if (/^\d{5,}$/.test(hidden || "")) return hidden;

    const railText = clean(document.querySelector("#pmlt")?.innerText);
    return railText.match(/\b(\d{6})\b/)?.[1] || "";
  }

  async function post(data) {
    const response = await fetch("/ajax_time_clock.php", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: new URLSearchParams(
        Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            String(value ?? "")
          ])
        )
      )
    });

    return {
      ok: response.ok,
      status: response.status,
      text: await response.text()
    };
  }

  function parseClock(html) {
    const doc = new DOMParser().parseFromString(
      String(html || ""),
      "text/html"
    );

    const text = clean(doc.body?.textContent);

    const href = [...doc.querySelectorAll("a[href]")]
      .map(a => a.getAttribute("href") || "")
      .find(value => /project\.php\?id=\d+/i.test(value));

    const projectId =
      href?.match(/project\.php\?id=(\d+)/i)?.[1] || "";

    return { text, projectId };
  }

  async function verifyTarget(projectId, target) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      if (attempt) {
        await new Promise(resolve => setTimeout(resolve, 250));
      }

      const state = await post({ action: 7 });
      if (!state.ok) continue;

      const parsed = parseClock(state.text);

      if (
        parsed.projectId === String(projectId) &&
        target.verify.test(parsed.text)
      ) {
        return true;
      }
    }

    return false;
  }

  function setButtonsDisabled(disabled) {
    document
      .querySelectorAll(`#${HOST_ID} button`)
      .forEach(button => {
        button.disabled = disabled;
      });
  }

  function flash(button, text, error = false) {
    const original = button.dataset.originalLabel || button.textContent;
    button.dataset.originalLabel = original;
    button.textContent = text;
    button.classList.toggle("us-pqc-error", error);

    setTimeout(() => {
      if (!button.isConnected) return;
      button.textContent = original;
      button.classList.remove("us-pqc-error");
    }, 1500);
  }

  async function quickClock(button, mode, nativeButton) {
    if (busy) return;

    const target = TARGETS[mode];
    const projectId = currentProjectId(nativeButton);

    if (!target || !projectId) {
      flash(button, "NO JOB #", true);
      return;
    }

    busy = true;
    setButtonsDisabled(true);
    button.textContent = "CLOCKING…";

    try {
      const current = await post({ action: 7 });

      if (current.ok) {
        const parsed = parseClock(current.text);

        if (
          parsed.projectId === String(projectId) &&
          target.verify.test(parsed.text)
        ) {
          flash(button, "ALREADY CLOCKED");
          return;
        }
      }

      const validation = await post({
        action: 15,
        project: projectId,
        department: target.department
      });

      const validationCode = clean(validation.text);

      if (!validation.ok || validationCode !== "1") {
        throw new Error(
          validationCode === "2"
            ? "INVALID JOB"
            : `BLOCKED ${validationCode || ""}`.trim()
        );
      }

      const mutation = await post({
        action: 3,
        project: projectId,
        department: target.department,
        notes: ""
      });

      if (!mutation.ok) {
        throw new Error("CLOCK FAILED");
      }

      const verified = await verifyTarget(projectId, target);

      if (!verified) {
        throw new Error("NOT VERIFIED");
      }

      flash(button, "CLOCKED IN");

    } catch (error) {
      console.error("[Project Quick Clock]", error);
      flash(
        button,
        clean(error?.message || "FAILED").toUpperCase(),
        true
      );
    } finally {
      busy = false;
      setButtonsDisabled(false);
    }
  }

  function findNativeProjectClockButton() {
    const exact = document.querySelector(
      "#time-clock-clock-in-to-project-from-project"
    );

    if (exact) return exact;

    const rail =
      document.querySelector("#pmlt") ||
      document.querySelector("#sidebar_left") ||
      document.body;

    return [...rail.querySelectorAll("a, button")]
      .find(element => {
        const text = clean(element.textContent).toUpperCase();
        return text === "CLOCK IN" && (
          element.dataset.id ||
          /project/i.test(element.id || "")
        );
      }) || null;
  }

  function installButtons() {
    if (document.getElementById(HOST_ID)) return;

    const nativeButton = findNativeProjectClockButton();
    if (!nativeButton) return;

    const projectId = currentProjectId(nativeButton);
    if (!projectId) return;

    const host = document.createElement("div");
    host.id = HOST_ID;

    for (const [mode, target] of Object.entries(TARGETS)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "us-pqc-button";
      button.textContent = target.label;
      button.dataset.originalLabel = target.label;

      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        quickClock(button, mode, nativeButton);
      });

      host.appendChild(button);
    }

    nativeButton.insertAdjacentElement("afterend", host);

    nativeButton.dataset.usQuickClockNative = "hidden";
    nativeButton.style.setProperty("display", "none", "important");
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
      #${HOST_ID} {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 6px !important;
        width: 100% !important;
        margin-top: 8px !important;
      }

      #${HOST_ID} .us-pqc-button {
        width: 100% !important;
        min-height: 36px !important;
        padding: 7px 10px !important;
        border: 1px solid rgba(180, 204, 222, .18) !important;
        border-radius: 7px !important;
        background:
          linear-gradient(
            180deg,
            rgba(255,255,255,.022),
            rgba(255,255,255,.006)
          ),
          rgba(8, 15, 21, .52) !important;
        color: rgba(230, 239, 245, .92) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.025) !important;
        backdrop-filter:
          blur(12px)
          saturate(112%) !important;
        -webkit-backdrop-filter:
          blur(12px)
          saturate(112%) !important;
        font-family:
          "Manrope",
          "Segoe UI",
          Arial,
          sans-serif !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        line-height: 1.15 !important;
        text-align: center !important;
        cursor: pointer !important;
        transition:
          background-color 120ms ease,
          border-color 120ms ease !important;
      }

      #${HOST_ID} .us-pqc-button:hover {
        background: rgba(255,255,255,.052) !important;
        border-color: rgba(195, 216, 230, .28) !important;
      }

      #${HOST_ID} .us-pqc-button:disabled {
        opacity: .58 !important;
        cursor: wait !important;
      }

      #${HOST_ID} .us-pqc-button.us-pqc-error {
        border-color: rgba(189, 105, 105, .35) !important;
        color: rgba(239, 194, 194, .92) !important;
      }
    `;

    document.head.appendChild(style);
  }

  function init() {
    installStyles();
    installButtons();

    const observer = new MutationObserver(() => {
      const host = document.getElementById(HOST_ID);
      if (!host?.isConnected) installButtons();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    window.__usSignProjectQuickClock = Object.freeze({
      version: VERSION
    });
  }

  init();
})();