// ==UserScript==
// @name         US Sign - Design Job Tools
// @namespace    us-sign-local-tools
// @version      4.1.0
// @description  Full Design workspace, job overview, summary, copy tools, lookup, and responsive panel layout.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Design-Job-Tools-v4.1.0.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Design-Job-Tools-v4.1.0.user.js
// @noframes
// ==/UserScript==

(async function () {
  "use strict";

  const BASE_URL =
    "https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/design-v4.1";

  const PART_URLS = Array.from(
    { length: 8 },
    (_unused, index) =>
      `${BASE_URL}/part-${String(index + 1).padStart(2, "0")}.txt`
  );

  const CACHE_KEY =
    "us-sign-design-job-tools-v4.1.0-source";

  const CACHE_TIME_KEY =
    "us-sign-design-job-tools-v4.1.0-checked";

  const CHECK_INTERVAL =
    6 * 60 * 60 * 1000;

  function requestText(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url,
        timeout: 20000,

        onload(response) {
          if (
            response.status >= 200 &&
            response.status < 300
          ) {
            resolve(String(response.responseText || ""));
            return;
          }

          reject(
            new Error(
              `Design source request failed: ${response.status}`
            )
          );
        },

        onerror() {
          reject(
            new Error("Design source network request failed.")
          );
        },

        ontimeout() {
          reject(
            new Error("Design source request timed out.")
          );
        }
      });
    });
  }

  async function fetchSource() {
    const parts = await Promise.all(
      PART_URLS.map(requestText)
    );

    const source = parts.join("\n");

    if (
      source.length < 70000 ||
      !source.includes("US Sign - Design Job Tools") ||
      !source.includes('const VERSION = "4.1.0"') ||
      !source.trimEnd().endsWith("})();")
    ) {
      throw new Error(
        "The downloaded Design Job Tools source is incomplete."
      );
    }

    return source;
  }

  function executeSource(source) {
    const run = new Function(
      "GM_setClipboard",
      "GM_openInTab",
      `${source}\n//# sourceURL=US-Sign-Design-Job-Tools-v4.1.0.js`
    );

    run(
      GM_setClipboard,
      GM_openInTab
    );
  }

  async function refreshCache(currentSource) {
    try {
      const freshSource = await fetchSource();

      if (freshSource !== currentSource) {
        executeSource;
        GM_setValue(CACHE_KEY, freshSource);
      }

      GM_setValue(
        CACHE_TIME_KEY,
        Date.now()
      );
    } catch (error) {
      console.warn(
        "US Sign Design Job Tools update check failed.",
        error
      );
    }
  }

  try {
    const cachedSource =
      String(GM_getValue(CACHE_KEY, "") || "");

    if (cachedSource) {
      executeSource(cachedSource);

      const lastCheck = Number(
        GM_getValue(CACHE_TIME_KEY, 0)
      );

      if (
        Date.now() - lastCheck >
        CHECK_INTERVAL
      ) {
        void refreshCache(cachedSource);
      }

      return;
    }

    const source = await fetchSource();
    executeSource(source);

    GM_setValue(CACHE_KEY, source);
    GM_setValue(
      CACHE_TIME_KEY,
      Date.now()
    );
  } catch (error) {
    console.error(
      "US Sign Design Job Tools could not start.",
      error
    );
  }
})();