// ==UserScript==
// @name         US Sign - Design Job Lookup Fix
// @namespace    us-sign-local-tools
// @version      1.0.0
// @description  Makes the Design Job Tools lookup search the base project number only, without revision suffixes such as -01.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        none
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Design-Job-Lookup-Fix.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Design-Job-Lookup-Fix.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__usSignDesignLookupFixV100) return;
  window.__usSignDesignLookupFixV100 = true;

  const LOOKUP_ID = "us-sign-job-lookup-button";

  function clean(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function baseProjectNumber() {
    const candidates = [
      document.querySelector("#us-sign-job-overview [data-value='projectRevision']")?.textContent,
      document.querySelector("#pmlt h1")?.textContent,
      document.querySelector("#pmlt h2")?.textContent,
      document.querySelector("#pmlt")?.textContent,
      location.href
    ];

    for (const value of candidates) {
      const match = clean(value).match(/\b(\d{5,})(?:-\d+)?\b/);
      if (match?.[1]) return match[1];
    }

    return "";
  }

  function findSearchContext() {
    const inputs = [...document.querySelectorAll([
      "input[placeholder*='search' i]",
      "input[name*='search' i]",
      "input[id*='search' i]",
      ".navbar input[type='search']",
      ".navbar input[type='text']"
    ].join(", "))];

    const input = inputs.find((element) => {
      const rect = element.getBoundingClientRect();
      return !element.disabled &&
        element.type !== "hidden" &&
        rect.width > 80 &&
        rect.height > 18 &&
        rect.top >= 0 &&
        rect.top < 130;
    });

    if (!input) return null;
    return { input, form: input.closest("form") };
  }

  function submit(context) {
    context.input.dispatchEvent(new Event("input", { bubbles: true }));
    context.input.dispatchEvent(new Event("change", { bubbles: true }));

    window.setTimeout(() => {
      if (context.form && typeof context.form.requestSubmit === "function") {
        context.form.requestSubmit();
        return;
      }

      context.input.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      }));
    }, 40);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(`#${LOOKUP_ID}`);
    if (!button) return;

    const number = baseProjectNumber();
    const context = findSearchContext();
    if (!number || !context) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    context.input.value = number;
    context.input.focus();
    submit(context);
  }, true);
})();
