// ==UserScript==
// @name         US Sign Full UI Theme
// @namespace    us-sign-full-modules
// @version      2.2.7
// @description  SquareCoil dark glass with cinematic fresh Bing UHD pan/zoom, true live backdrop glass surfaces, and clean Space Grotesk project identity with Manrope operational typography.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      www.bing.com
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/a340786458402732f0f78d48face95c940adabf3/tampermonkey/US-Sign-Full-UI-Theme-v2.2.6.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Full-UI-Theme.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Full-UI-Theme.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__usSignFullUIThemeV227) return;
  window.__usSignFullUIThemeV227 = true;

  const root = document.documentElement;
  if (!root) return;

  root.dataset.usSignThemeVersion = "2.2.7";
  root.dataset.usSignWallpaperMode = "cinematic-fresh-bing";
  root.dataset.usSignGlassMode = "live-backdrop";
  root.dataset.usSignDisplayFont = "Space Grotesk";

  const FALLBACK_WALLPAPER = "https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1";
  const CACHE_KEY = "us-sign-squarecoil-bing-fresh-v1";
  const ROTATE_MS = 30 * 60 * 1000;
  const REFRESH_MS = 55 * 60 * 1000;
  const FADE_MS = 7200;
  const MAX_MARKET_DATE_LAG_DAYS = 1;

  const PAN_X_LIMIT = 11.0;
  const PAN_Y_LIMIT = 8.5;
  const START_X_LIMIT = 8.4;
  const START_Y_LIMIT = 6.4;
  const MIN_ZOOM = 1.24;
  const MAX_ZOOM = 1.38;
  const MIN_PAN_MS = 50000;
  const MAX_PAN_MS = 82000;
  const MIN_TRAVEL = 8.0;
  const MAX_TRAVEL = 14.5;
  const HANDOFF_MIN = 0.82;
  const HANDOFF_MAX = 0.89;

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

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  GM_addStyle(String.raw`
    @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;650;700&family=Space+Grotesk:wght@500;600;700&display=swap");

    :root {
      --us-wallpaper: none !important;
      --us-display-font: "Space Grotesk", "Manrope", "Avenir Next", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif !important;
      --us-squarecoil-glass: rgba(10, 10, 13, 0.55);
      --us-squarecoil-glass-soft: rgba(10, 10, 13, 0.46);
      --us-squarecoil-glass-strong: rgba(8, 8, 11, 0.64);
      --us-squarecoil-glass-line: rgba(255, 255, 255, 0.080);
      --us-squarecoil-live-frost: blur(20px) saturate(118%) brightness(88%);
      --us-squarecoil-live-frost-soft: blur(16px) saturate(116%) brightness(90%);
      --us-squarecoil-fade: ${FADE_MS}ms;
    }

    html {
      background: #09090b !important;
      background-image: none !important;
    }

    body {
      position: relative !important;
      isolation: isolate !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    html body #main,
    html body #content_wrapper,
    html body #content,
    html body #content > .tray,
    html body #content > .tray-left,
    html body #content > .tray-right,
    html body #content > .tray-center,
    html body .tray,
    html body .tray-left,
    html body .tray-right,
    html body .tray-center,
    html body .tray-inner,
    html body [class^="tray-"],
    html body [class*=" tray-"],
    html body .content,
    html body .content-wrapper,
    html body .page-content,
    html body .content-body,
    html body .main-content,
    html body .main-panel,
    html body .admin-panels,
    html body .dashboard,
    html body .dashboard-page,
    html body .container,
    html body .container-fluid {
      background-color: transparent !important;
      background-image: none !important;
    }

    html body #main::before {
      content: none !important;
      display: none !important;
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    #us-squarecoil-cinematic-wallpaper {
      position: fixed !important;
      inset: 0 !important;
      z-index: -3 !important;
      overflow: hidden !important;
      pointer-events: none !important;
      contain: strict !important;
    }

    #us-squarecoil-cinematic-wallpaper .us-squarecoil-cine-layer {
      --us-squarecoil-cine-image: none;
      position: absolute !important;
      inset: -12vh -12vw !important;
      opacity: 0;
      pointer-events: none !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(255,255,255,0.026), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(255,255,255,0.012), transparent 34%),
        linear-gradient(rgba(0,0,0,0.22), rgba(0,0,0,0.46)),
        var(--us-squarecoil-cine-image) !important;
      background-position: center !important;
      background-size: auto, auto, auto, cover !important;
      background-repeat: no-repeat !important;
      transform-origin: center center !important;
      will-change: transform, opacity !important;
      backface-visibility: hidden !important;
      transition: opacity var(--us-squarecoil-fade) cubic-bezier(.22,.61,.36,1) !important;
    }

    #us-squarecoil-cinematic-wallpaper .us-squarecoil-cine-layer[data-active="true"] {
      opacity: 1;
    }

    header,
    header.navbar,
    .navbar,
    .navbar-fixed-top,
    #topbar,
    .topbar,
    #sidebar_left,
    #pmlt {
      background-color: var(--us-squarecoil-glass) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.004)) !important;
      border-color: var(--us-squarecoil-glass-line) !important;
      -webkit-backdrop-filter: var(--us-squarecoil-live-frost) !important;
      backdrop-filter: var(--us-squarecoil-live-frost) !important;
    }

    #customer-name,
    #customer-info,
    #projectbox,
    #descriptionbox,
    #designbox,
    #filesbox,
    #showbtns,
    #mapcontainer {
      background-color: var(--us-squarecoil-glass-soft) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.024), rgba(255,255,255,0.003)) !important;
      border-color: var(--us-squarecoil-glass-line) !important;
      -webkit-backdrop-filter: var(--us-squarecoil-live-frost) !important;
      backdrop-filter: var(--us-squarecoil-live-frost) !important;
    }

    .modal-content,
    .popover,
    .dropdown-menu,
    .well,
    .panel,
    .panel-default {
      background-color: var(--us-squarecoil-glass-soft) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.022), rgba(255,255,255,0.003)) !important;
      border-color: var(--us-squarecoil-glass-line) !important;
      -webkit-backdrop-filter: var(--us-squarecoil-live-frost-soft) !important;
      backdrop-filter: var(--us-squarecoil-live-frost-soft) !important;
    }

    #customer-info .panel,
    #projectbox .panel,
    #descriptionbox .panel,
    #designbox .panel,
    #filesbox .panel,
    #descriptionbox .well,
    #designbox .well,
    #filesbox .well,
    #projectbox .well,
    #customer-info .well,
    #sidebar_left .sidebar-left-content,
    #sidebar_left .sidebar-menu,
    #sidebar_left .nav.sidebar-menu {
      background-color: transparent !important;
      background-image: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    .panel-heading,
    .panel-footer,
    .modal-header,
    .modal-footer,
    .cke_top,
    .cke_bottom,
    .note-toolbar {
      background: rgba(255,255,255,0.025) !important;
      background-image: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page body #pmlt h1,
    html.us-sign-design-page body #pmlt h1 *,
    html.us-sign-design-page body #pmlt .project-number,
    html.us-sign-design-page body #pmlt [class*="project-number" i],
    html.us-sign-design-page body #pmlt .project-name,
    html.us-sign-design-page body #pmlt [class*="project-name" i],
    html.us-sign-design-page body #customer-name h1,
    html.us-sign-design-page body #customer-name h2,
    html.us-sign-design-page body #customer-name .project-number,
    html.us-sign-design-page body #customer-name .project-name {
      font-family: var(--us-display-font) !important;
      font-style: normal !important;
      font-weight: 700 !important;
      font-variation-settings: normal !important;
      letter-spacing: -0.035em !important;
      text-rendering: geometricPrecision !important;
    }

    body,
    input,
    textarea,
    select,
    button,
    table,
    td,
    th,
    label,
    .panel-title,
    .panel-body,
    .panel-heading,
    .nav,
    .navbar,
    #sidebar_left,
    #pmlt :not(h1):not(.project-number):not(.project-name) {
      font-family: var(--us-font) !important;
    }

    @media (prefers-reduced-motion: reduce) {
      #us-squarecoil-cinematic-wallpaper .us-squarecoil-cine-layer {
        inset: -5vh -5vw !important;
        transform: scale(1.08) !important;
        transition-duration: 900ms !important;
      }
    }

    @supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      header,
      header.navbar,
      .navbar,
      #sidebar_left,
      #pmlt,
      #customer-name,
      #customer-info,
      #projectbox,
      #descriptionbox,
      #designbox,
      #filesbox,
      .panel,
      .well,
      .modal-content,
      .popover,
      .dropdown-menu {
        background-color: rgba(10,10,13,0.88) !important;
      }
    }
  `);

  let wallpaperPool = [];
  let activeLayer = "a";
  let lastWallpaperKey = "";
  let pendingWallpaperKey = "";
  let lastAppliedSlot = -1;
  let swapToken = 0;
  let rotateTimer = 0;
  let refreshTimer = 0;
  let refreshInFlight = false;
  let host = null;

  const layers = { a: null, b: null };
  const motion = { a: makeMotionState(), b: makeMotionState() };

  function makeMotionState() {
    return {
      animation: null,
      timer: 0,
      from: null,
      to: null,
      direction: null,
      zoomDirection: 1,
      duration: 0,
      handoff: 0.86,
      running: false
    };
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function interpolatePoint(from, to, t) {
    return {
      x: lerp(from.x, to.x, t),
      y: lerp(from.y, to.y, t),
      scale: lerp(from.scale, to.scale, t)
    };
  }

  function unitVector(vector) {
    const x = Number(vector?.x || 0);
    const y = Number(vector?.y || 0);
    const length = Math.hypot(x, y) || 1;
    return { x: x / length, y: y / length };
  }

  function randomDirection() {
    const angle = randomBetween(0, Math.PI * 2);
    return { x: Math.cos(angle), y: Math.sin(angle) };
  }

  function cssUrl(url) {
    return `url("${String(url || "").replace(/"/g, "%22")}")`;
  }

  function transformFor(point) {
    return `translate3d(${point.x.toFixed(3)}%, ${point.y.toFixed(3)}%, 0) scale(${point.scale.toFixed(4)})`;
  }

  function randomStartPoint(zoomDirection = null) {
    const zoomDir = zoomDirection || (Math.random() < 0.5 ? -1 : 1);
    const scale = zoomDir > 0
      ? randomBetween(MIN_ZOOM, MIN_ZOOM + 0.075)
      : randomBetween(MAX_ZOOM - 0.075, MAX_ZOOM);

    return {
      x: randomBetween(-START_X_LIMIT, START_X_LIMIT),
      y: randomBetween(-START_Y_LIMIT, START_Y_LIMIT),
      scale
    };
  }

  function ensureHost() {
    if (host?.isConnected && layers.a?.isConnected && layers.b?.isConnected) return true;
    if (!document.body) return false;

    host = document.getElementById("us-squarecoil-cinematic-wallpaper");
    if (!host) {
      host = document.createElement("div");
      host.id = "us-squarecoil-cinematic-wallpaper";
      host.setAttribute("aria-hidden", "true");
      document.body.prepend(host);
    }

    ["a", "b"].forEach((name) => {
      let layer = host.querySelector(`[data-us-squarecoil-cine-layer="${name}"]`);
      if (!layer) {
        layer = document.createElement("div");
        layer.className = "us-squarecoil-cine-layer";
        layer.dataset.usSquarecoilCineLayer = name;
        layer.dataset.active = name === "a" ? "true" : "false";
        host.appendChild(layer);
      }
      layers[name] = layer;
    });

    return true;
  }

  function setLayerImage(layerName, url) {
    const layer = layers[layerName];
    if (!layer || !url) return;
    layer.style.setProperty("--us-squarecoil-cine-image", cssUrl(url));
  }

  function setLayerVisible(layerName, visible) {
    const layer = layers[layerName];
    if (!layer) return;
    layer.dataset.active = visible ? "true" : "false";
  }

  function sampleMotionPoint(layerName) {
    const state = motion[layerName];
    if (!state?.from) return null;
    if (!state.to || !state.animation || !state.duration) return { ...state.from };

    const currentTime = Number(state.animation.currentTime);
    const progress = Number.isFinite(currentTime)
      ? clamp(currentTime / state.duration, 0, 1)
      : 0;

    return interpolatePoint(state.from, state.to, progress);
  }

  function stopMotion(layerName, freeze = true) {
    const state = motion[layerName];
    const layer = layers[layerName];
    if (!state) return;

    if (state.timer) clearTimeout(state.timer);
    state.timer = 0;

    if (state.animation) {
      if (freeze && layer) {
        const point = sampleMotionPoint(layerName);
        if (point) {
          layer.style.transform = transformFor(point);
          state.from = point;
          state.to = point;
        }
      }
      state.animation.cancel();
      state.animation = null;
    }

    state.running = false;
  }

  function chooseTarget(from, preferredDirection = null, preferredZoomDirection = 1) {
    let direction = unitVector(preferredDirection || randomDirection());

    if (Math.abs(from.x) > PAN_X_LIMIT * 0.70 && Math.sign(direction.x) === Math.sign(from.x)) {
      direction.x *= -0.62;
    }
    if (Math.abs(from.y) > PAN_Y_LIMIT * 0.70 && Math.sign(direction.y) === Math.sign(from.y)) {
      direction.y *= -0.62;
    }
    direction = unitVector(direction);

    const baseAngle = Math.atan2(direction.y, direction.x);
    const angle = baseAngle + randomBetween(-0.20, 0.20);
    direction = { x: Math.cos(angle), y: Math.sin(angle) };

    const distance = randomBetween(MIN_TRAVEL, MAX_TRAVEL);
    let target = {
      x: clamp(from.x + direction.x * distance, -PAN_X_LIMIT, PAN_X_LIMIT),
      y: clamp(from.y + direction.y * distance, -PAN_Y_LIMIT, PAN_Y_LIMIT),
      scale: from.scale
    };

    if (Math.hypot(target.x - from.x, target.y - from.y) < 5.2) {
      direction = unitVector({ x: -direction.x, y: -direction.y });
      target.x = clamp(from.x + direction.x * distance, -PAN_X_LIMIT, PAN_X_LIMIT);
      target.y = clamp(from.y + direction.y * distance, -PAN_Y_LIMIT, PAN_Y_LIMIT);
    }

    let zoomDirection = preferredZoomDirection || 1;
    if (from.scale >= MAX_ZOOM - 0.012) zoomDirection = -1;
    else if (from.scale <= MIN_ZOOM + 0.012) zoomDirection = 1;
    else if (Math.random() < 0.13) zoomDirection *= -1;

    target.scale = clamp(
      from.scale + zoomDirection * randomBetween(0.028, 0.052),
      MIN_ZOOM,
      MAX_ZOOM
    );

    return {
      point: target,
      direction: unitVector({ x: target.x - from.x, y: target.y - from.y }),
      zoomDirection
    };
  }

  function updateMotionDebug(layerName) {
    const state = motion[layerName];
    const point = sampleMotionPoint(layerName) || state?.from;
    if (!state || !point) return;

    root.dataset.usSignWallpaperLayer = layerName;
    root.dataset.usSignWallpaperPan = `${point.x.toFixed(2)},${point.y.toFixed(2)},${point.scale.toFixed(3)}`;
    root.dataset.usSignWallpaperDirection = state.direction
      ? `${state.direction.x.toFixed(2)},${state.direction.y.toFixed(2)}`
      : "0.00,0.00";
  }

  function startLeg(layerName, from, directionHint = null, zoomDirectionHint = 1) {
    const layer = layers[layerName];
    const state = motion[layerName];
    if (!layer || !state || reducedMotion) return;

    if (state.timer) clearTimeout(state.timer);
    if (state.animation) state.animation.cancel();

    const next = chooseTarget(from, directionHint, zoomDirectionHint);
    const duration = Math.round(randomBetween(MIN_PAN_MS, MAX_PAN_MS));
    const handoff = randomBetween(HANDOFF_MIN, HANDOFF_MAX);

    state.from = { ...from };
    state.to = next.point;
    state.direction = next.direction;
    state.zoomDirection = next.zoomDirection;
    state.duration = duration;
    state.handoff = handoff;
    state.running = true;

    layer.style.transform = transformFor(from);
    state.animation = layer.animate(
      [
        { transform: transformFor(from) },
        { transform: transformFor(next.point) }
      ],
      {
        duration,
        easing: "linear",
        fill: "both"
      }
    );

    state.timer = setTimeout(() => {
      if (document.hidden || !state.running || layerName !== activeLayer) return;
      const current = sampleMotionPoint(layerName) || interpolatePoint(from, next.point, handoff);
      layer.style.transform = transformFor(current);
      state.animation?.cancel();
      state.animation = null;
      startLeg(layerName, current, state.direction, state.zoomDirection);
    }, Math.round(duration * handoff));

    updateMotionDebug(layerName);
  }

  function beginMotion(layerName, directionHint = null, startPoint = null, zoomDirectionHint = null) {
    const layer = layers[layerName];
    const state = motion[layerName];
    if (!layer || !state) return;

    stopMotion(layerName, false);

    if (reducedMotion) {
      const point = { x: 0, y: 0, scale: 1.08 };
      layer.style.transform = transformFor(point);
      state.from = point;
      state.to = point;
      state.direction = { x: 0, y: 0 };
      state.zoomDirection = 0;
      updateMotionDebug(layerName);
      return;
    }

    const zoomDirection = zoomDirectionHint || (Math.random() < 0.5 ? -1 : 1);
    const start = startPoint || randomStartPoint(zoomDirection);
    const direction = unitVector(directionHint || randomDirection());

    state.from = start;
    state.to = start;
    state.direction = direction;
    state.zoomDirection = zoomDirection;
    state.running = true;
    layer.style.transform = transformFor(start);
    updateMotionDebug(layerName);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!state.running || layerName !== activeLayer) return;
        startLeg(layerName, start, direction, zoomDirection);
      });
    });
  }

  function chooseEntryFromDirection(directionHint, zoomDirectionHint = 1) {
    const direction = unitVector(directionHint || randomDirection());
    const point = randomStartPoint(zoomDirectionHint);
    point.x = clamp(point.x - direction.x * 4.2, -PAN_X_LIMIT, PAN_X_LIMIT);
    point.y = clamp(point.y - direction.y * 3.2, -PAN_Y_LIMIT, PAN_Y_LIMIT);
    return point;
  }

  function preloadWallpaper(url) {
    return new Promise((resolve) => {
      const image = new Image();
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };

      image.decoding = "async";
      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      image.src = url;
      setTimeout(() => finish(false), 12000);
    });
  }

  function dateNumber(value) {
    const text = String(value || "");
    if (!/^\d{8}$/.test(text)) return NaN;
    const y = Number(text.slice(0, 4));
    const m = Number(text.slice(4, 6));
    const d = Number(text.slice(6, 8));
    return Date.UTC(y, m - 1, d);
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

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || !Array.isArray(parsed.images)) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function writeCache(images, freshestDate) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        fetchedAt: Date.now(),
        freshestStartdate: freshestDate || "",
        markets: MARKETS,
        images
      }));
    } catch (_) {}
  }

  function requestMarket(market) {
    return new Promise((resolve) => {
      if (typeof GM_xmlhttpRequest !== "function") {
        resolve([]);
        return;
      }

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

  async function refreshPool(force = false) {
    if (refreshInFlight) return false;

    const cached = readCache();
    const cachedAge = cached ? Date.now() - Number(cached.fetchedAt || 0) : Infinity;
    if (!force && cached?.images?.length >= 2 && cachedAge >= 0 && cachedAge < REFRESH_MS) {
      wallpaperPool = cached.images;
      root.dataset.usSignBingFreshestDate = String(cached.freshestStartdate || "");
      root.dataset.usSignBingPoolSize = String(wallpaperPool.length);
      applyWallpaper();
      return true;
    }

    refreshInFlight = true;
    try {
      const batches = await Promise.all(MARKETS.map(requestMarket));
      const result = dedupeAndKeepFresh(batches.flat());
      if (result.images.length >= 2) {
        wallpaperPool = result.images;
        writeCache(result.images, result.freshestDate);
        root.dataset.usSignBingFreshestDate = result.freshestDate || "";
        root.dataset.usSignBingPoolSize = String(result.images.length);
        applyWallpaper();
        return true;
      }
      return false;
    } finally {
      refreshInFlight = false;
    }
  }

  async function transitionWallpaper(image, slot) {
    if (!image?.url || !ensureHost()) return false;
    const key = image.key || image.url;

    if (key === lastWallpaperKey || key === pendingWallpaperKey) {
      root.dataset.usSignBingWallpaper = image.title || "Bing wallpaper";
      root.dataset.usSignBingMarket = image.market || "";
      return false;
    }

    pendingWallpaperKey = key;
    const token = ++swapToken;
    const loaded = await preloadWallpaper(image.url);
    if (!loaded || token !== swapToken) {
      if (pendingWallpaperKey === key) pendingWallpaperKey = "";
      return false;
    }

    const outgoing = activeLayer;
    const incoming = outgoing === "a" ? "b" : "a";
    const outgoingState = motion[outgoing];
    const outgoingDirection = outgoingState?.direction || randomDirection();
    const outgoingZoomDirection = outgoingState?.zoomDirection || 1;
    const entryPoint = chooseEntryFromDirection(outgoingDirection, outgoingZoomDirection);

    setLayerImage(incoming, image.url);
    setLayerVisible(incoming, false);
    beginMotion(incoming, outgoingDirection, entryPoint, outgoingZoomDirection);

    activeLayer = incoming;
    root.style.setProperty("--us-squarecoil-fade", `${reducedMotion ? 900 : FADE_MS}ms`);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (token !== swapToken) return;
        setLayerVisible(incoming, true);
        setLayerVisible(outgoing, false);
      });
    });

    setTimeout(() => {
      if (token !== swapToken) return;
      stopMotion(outgoing, false);
    }, reducedMotion ? 950 : FADE_MS + 180);

    lastWallpaperKey = key;
    lastAppliedSlot = slot;
    pendingWallpaperKey = "";
    root.dataset.usSignBingWallpaper = image.title || "Bing wallpaper";
    root.dataset.usSignBingMarket = image.market || "";
    root.dataset.usSignWallpaperLayer = incoming;
    return true;
  }

  function applyWallpaper() {
    if (!wallpaperPool.length) return;
    const slot = Math.floor(Date.now() / ROTATE_MS);
    let index = slot % wallpaperPool.length;
    let image = wallpaperPool[index];
    if (!image?.url) return;

    if (slot !== lastAppliedSlot && wallpaperPool.length > 1 && (image.key || image.url) === lastWallpaperKey) {
      index = (index + 1) % wallpaperPool.length;
      image = wallpaperPool[index];
    }

    void transitionWallpaper(image, slot);
  }

  function scheduleRotation() {
    if (rotateTimer) clearTimeout(rotateTimer);
    const now = Date.now();
    const untilNext = ROTATE_MS - (now % ROTATE_MS) + 600;
    rotateTimer = setTimeout(() => {
      applyWallpaper();
      scheduleRotation();
    }, untilNext);
  }

  function scheduleRefresh() {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(async () => {
      await refreshPool(true);
      scheduleRefresh();
    }, REFRESH_MS);
  }

  function pauseMotionForVisibility() {
    ["a", "b"].forEach((layerName) => {
      const state = motion[layerName];
      if (!state?.running) return;
      const current = sampleMotionPoint(layerName) || state.from;
      stopMotion(layerName, false);
      if (current && layers[layerName]) {
        layers[layerName].style.transform = transformFor(current);
        state.from = current;
        state.to = current;
      }
    });
  }

  function resumeActiveMotion() {
    if (reducedMotion) return;
    const state = motion[activeLayer];
    const point = state?.from || randomStartPoint(state?.zoomDirection || 1);
    beginMotion(activeLayer, state?.direction || randomDirection(), point, state?.zoomDirection || 1);
  }

  function debugSnapshot() {
    const snapshotLayer = (layerName) => {
      const state = motion[layerName];
      const point = sampleMotionPoint(layerName) || state?.from;
      return {
        visible: layers[layerName]?.dataset.active === "true",
        running: Boolean(state?.running),
        point: point ? {
          x: Number(point.x.toFixed(2)),
          y: Number(point.y.toFixed(2)),
          scale: Number(point.scale.toFixed(3))
        } : null,
        direction: state?.direction ? {
          x: Number(state.direction.x.toFixed(2)),
          y: Number(state.direction.y.toFixed(2))
        } : null,
        durationMs: state?.duration || 0,
        handoff: state?.handoff || 0
      };
    };

    return {
      version: root.dataset.usSignThemeVersion,
      displayFont: root.dataset.usSignDisplayFont,
      wallpaperMode: root.dataset.usSignWallpaperMode,
      glassMode: root.dataset.usSignGlassMode,
      activeLayer,
      bingPhoto: root.dataset.usSignBingWallpaper || "",
      bingMarket: root.dataset.usSignBingMarket || "",
      freshestDate: root.dataset.usSignBingFreshestDate || "",
      poolSize: wallpaperPool.length,
      reducedMotion,
      layerA: snapshotLayer("a"),
      layerB: snapshotLayer("b")
    };
  }

  function forceNextWallpaper() {
    if (wallpaperPool.length < 2) return false;
    const currentIndex = wallpaperPool.findIndex((image) => (image.key || image.url) === lastWallpaperKey);
    let nextIndex = currentIndex >= 0 ? (currentIndex + 1) % wallpaperPool.length : 0;
    if ((wallpaperPool[nextIndex]?.key || wallpaperPool[nextIndex]?.url) === lastWallpaperKey) {
      nextIndex = (nextIndex + 1) % wallpaperPool.length;
    }
    const image = wallpaperPool[nextIndex];
    if (!image?.url) return false;
    void transitionWallpaper(image, `manual-${Date.now()}`);
    return true;
  }

  window.__usSquareCoilThemeDebug = debugSnapshot;
  window.__usSquareCoilWallpaperNext = forceNextWallpaper;
  window.__usSquareCoilBingRefresh = () => refreshPool(true);

  async function init() {
    if (!ensureHost()) return;

    setLayerImage("a", FALLBACK_WALLPAPER);
    setLayerVisible("a", true);
    setLayerVisible("b", false);
    beginMotion("a", randomDirection(), randomStartPoint(), Math.random() < 0.5 ? -1 : 1);

    const cached = readCache();
    if (cached?.images?.length >= 2) {
      wallpaperPool = cached.images;
      root.dataset.usSignBingFreshestDate = String(cached.freshestStartdate || "");
      root.dataset.usSignBingPoolSize = String(wallpaperPool.length);
      applyWallpaper();
    }

    await refreshPool(false);
    scheduleRotation();
    scheduleRefresh();

    window.addEventListener("pageshow", () => {
      applyWallpaper();
      if (!motion[activeLayer]?.running) resumeActiveMotion();
    }, { passive: true });

    window.addEventListener("focus", () => {
      if (!motion[activeLayer]?.running) resumeActiveMotion();
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseMotionForVisibility();
      else {
        applyWallpaper();
        resumeActiveMotion();
      }
    }, { passive: true });
  }

  if (document.body) void init();
  else document.addEventListener("DOMContentLoaded", () => void init(), { once: true });
})();
