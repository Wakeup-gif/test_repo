// ==UserScript==
// @name         ChatGPT - US Sign Dark Glass Theme
// @namespace    us-sign-full-modules
// @version      2.1.8
// @description  Modern graphite glass for ChatGPT with wider live reading glass, cinematic Bing UHD motion, and a fresh today-only multi-market Bing wallpaper pool.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      www.bing.com
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme-v2.1.3.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme-v2.1.5.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme-v2.1.7.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__chatgptUsSignDarkGlassThemeV218) return;
  window.__chatgptUsSignDarkGlassThemeV218 = true;

  const root = document.documentElement;
  if (!root) return;

  root.dataset.usSignTheme = "dark-glass-cinematic-wide-fresh-bing";
  root.dataset.usSignThemeVersion = "2.1.8";
  root.dataset.usReadingGlass = "sibling-live-backdrop-wide";

  const CACHE_KEY = "chatgpt-us-sign-dark-glass-bing-wallpaper-pool-v1";
  const FRESH_POLICY = "today-only-localized-markets-v1";
  const REFRESH_MS = 55 * 60 * 1000;
  const MAX_MARKET_DATE_LAG_DAYS = 1;
  const MARKETS = [
    "en-US",
    "en-GB",
    "en-CA",
    "en-IN",
    "de-DE",
    "fr-FR",
    "fr-CA",
    "es-ES",
    "it-IT",
    "ja-JP",
    "pt-BR",
    "zh-CN"
  ];

  GM_addStyle(String.raw`
    /* v2.1.8 gives the conversation more contrast breathing room without
       turning the whole viewport into frosted glass. v2.1.7 still tracks the
       correct horizontal center; this !important width overrides its older
       1040px inline cap. */
    #us-reading-glass {
      width: min(1360px, calc(100vw - 56px)) !important;
      -webkit-mask-image: linear-gradient(
        90deg,
        transparent 0%,
        rgba(0,0,0,0.22) 2.5%,
        rgba(0,0,0,0.72) 7.5%,
        #000 13%,
        #000 87%,
        rgba(0,0,0,0.72) 92.5%,
        rgba(0,0,0,0.22) 97.5%,
        transparent 100%
      ) !important;
      mask-image: linear-gradient(
        90deg,
        transparent 0%,
        rgba(0,0,0,0.22) 2.5%,
        rgba(0,0,0,0.72) 7.5%,
        #000 13%,
        #000 87%,
        rgba(0,0,0,0.72) 92.5%,
        rgba(0,0,0,0.22) 97.5%,
        transparent 100%
      ) !important;
    }

    @media (max-width: 768px) {
      #us-reading-glass {
        width: calc(100vw - 2px) !important;
      }
    }
  `);

  let refreshTimer = 0;
  let refreshInFlight = false;
  let lastFreshRefresh = 0;

  function parseCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || !Array.isArray(parsed.images)) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function normalizeImage(image, market) {
    if (!image || typeof image.url !== "string") return null;

    try {
      const url = new URL(image.url, "https://www.bing.com/");
      if (url.protocol !== "https:") return null;

      return {
        url: url.href,
        key: String(image.urlbase || url.pathname),
        title: String(image.title || image.copyright || "Bing wallpaper"),
        startdate: String(image.startdate || ""),
        market: String(market || "")
      };
    } catch (_) {
      return null;
    }
  }

  function dateNumber(value) {
    const text = String(value || "");
    if (!/^\d{8}$/.test(text)) return NaN;
    const y = Number(text.slice(0, 4));
    const m = Number(text.slice(4, 6));
    const d = Number(text.slice(6, 8));
    return Date.UTC(y, m - 1, d);
  }

  function requestMarket(market) {
    return new Promise((resolve) => {
      if (typeof GM_xmlhttpRequest !== "function") {
        resolve([]);
        return;
      }

      /* idx=0 + n=1 is intentional: only each market's current homepage image.
         Variety comes from localized markets instead of recycling the previous
         seven days from every market. */
      const endpoint = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=${encodeURIComponent(market)}&uhd=1&uhdwidth=3840&uhdheight=2160&_=${Date.now()}`;

      GM_xmlhttpRequest({
        method: "GET",
        url: endpoint,
        timeout: 10000,
        headers: {
          Accept: "application/json,text/plain,*/*",
          "Cache-Control": "no-cache",
          Pragma: "no-cache"
        },
        onload(response) {
          if (response.status < 200 || response.status >= 300) {
            resolve([]);
            return;
          }

          try {
            const payload = JSON.parse(response.responseText || "{}");
            const images = Array.isArray(payload.images) ? payload.images : [];
            resolve(images.map((image) => normalizeImage(image, market)).filter(Boolean));
          } catch (_) {
            resolve([]);
          }
        },
        onerror() { resolve([]); },
        ontimeout() { resolve([]); }
      });
    });
  }

  function dedupeAndKeepFresh(images) {
    const unique = new Map();
    images.forEach((image) => {
      if (image?.url && image?.key && !unique.has(image.key)) unique.set(image.key, image);
    });

    const deduped = Array.from(unique.values());
    const dated = deduped
      .map((image) => ({ image, time: dateNumber(image.startdate) }))
      .filter((entry) => Number.isFinite(entry.time));

    const freshestTime = dated.length ? Math.max(...dated.map((entry) => entry.time)) : NaN;
    const freshestDate = dated.length
      ? dated.find((entry) => entry.time === freshestTime)?.image?.startdate || ""
      : "";

    const maxLagMs = MAX_MARKET_DATE_LAG_DAYS * 24 * 60 * 60 * 1000;
    const fresh = Number.isFinite(freshestTime)
      ? deduped.filter((image) => {
          const time = dateNumber(image.startdate);
          return !Number.isFinite(time) || freshestTime - time <= maxLagMs;
        })
      : deduped;

    return { images: fresh, freshestDate };
  }

  function publishFreshPool(images, freshestDate) {
    if (!Array.isArray(images) || images.length < 2) return false;

    const payload = {
      fetchedAt: Date.now(),
      images,
      freshPolicy: FRESH_POLICY,
      freshestStartdate: freshestDate,
      markets: MARKETS
    };

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (_) {
      return false;
    }

    lastFreshRefresh = payload.fetchedAt;
    root.dataset.usBingFreshPolicy = FRESH_POLICY;
    root.dataset.usBingFreshestDate = freshestDate || "";
    root.dataset.usBingFreshPoolSize = String(images.length);
    root.dataset.usBingFreshMarkets = String(MARKETS.length);

    /* v2.1.5 listens for pageshow and immediately rereads the shared pool.
       Reusing that path means the new current-day pool enters through the same
       cinematic crossfade rather than hard-cutting the wallpaper. */
    window.dispatchEvent(new Event("pageshow"));
    return true;
  }

  async function refreshFreshPool(force = false) {
    if (refreshInFlight) return false;

    const cached = parseCache();
    const cachedAge = cached ? Date.now() - Number(cached.fetchedAt || 0) : Infinity;
    const cacheIsOurs = cached?.freshPolicy === FRESH_POLICY;

    if (!force && cacheIsOurs && cachedAge >= 0 && cachedAge < REFRESH_MS && cached.images?.length >= 2) {
      lastFreshRefresh = Number(cached.fetchedAt || Date.now());
      root.dataset.usBingFreshPolicy = FRESH_POLICY;
      root.dataset.usBingFreshestDate = String(cached.freshestStartdate || "");
      root.dataset.usBingFreshPoolSize = String(cached.images.length);
      root.dataset.usBingFreshMarkets = String(MARKETS.length);
      return true;
    }

    refreshInFlight = true;
    try {
      const batches = await Promise.all(MARKETS.map(requestMarket));
      const result = dedupeAndKeepFresh(batches.flat());
      return publishFreshPool(result.images, result.freshestDate);
    } finally {
      refreshInFlight = false;
    }
  }

  function scheduleFreshRefresh() {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(async () => {
      await refreshFreshPool(true);
      scheduleFreshRefresh();
    }, REFRESH_MS);
  }

  function freshDebug() {
    const cached = parseCache();
    return {
      version: root.dataset.usSignThemeVersion,
      policy: cached?.freshPolicy || null,
      fetchedAt: cached?.fetchedAt ? new Date(cached.fetchedAt).toISOString() : null,
      ageMinutes: cached?.fetchedAt ? Math.round((Date.now() - cached.fetchedAt) / 6000) / 10 : null,
      freshestStartdate: cached?.freshestStartdate || null,
      poolSize: Array.isArray(cached?.images) ? cached.images.length : 0,
      marketsRequested: MARKETS,
      images: Array.isArray(cached?.images)
        ? cached.images.map((image) => ({
            market: image.market,
            startdate: image.startdate,
            title: image.title,
            key: image.key
          }))
        : []
    };
  }

  window.__usBingFreshDebug = freshDebug;
  window.__usBingFreshRefresh = () => refreshFreshPool(true);

  async function initFreshBing() {
    await refreshFreshPool(false);
    scheduleFreshRefresh();

    const refreshIfNeeded = () => {
      const age = Date.now() - Number(lastFreshRefresh || 0);
      if (age >= REFRESH_MS) refreshFreshPool(false);
    };

    window.addEventListener("focus", refreshIfNeeded, { passive: true });
    window.addEventListener("pageshow", refreshIfNeeded, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) refreshIfNeeded();
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFreshBing, { once: true });
  } else {
    initFreshBing();
  }
})();
