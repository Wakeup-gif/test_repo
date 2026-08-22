// ==UserScript==
// @name         ChatGPT - US Sign Dark Glass Theme
// @namespace    us-sign-full-modules
// @version      2.1.4
// @description  Modern graphite glass for ChatGPT with bounded live blur, cinematic Bing UHD crossfades, randomized slow pan and zoom routes, direction-aware image changes, cached reading frost, and no pointer parallax.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      www.bing.com
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme-v2.1.3.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__chatgptUsSignDarkGlassThemeV214) return;
  window.__chatgptUsSignDarkGlassThemeV214 = true;

  const root = document.documentElement;
  if (!root) return;
  root.dataset.usSignTheme = "dark-glass-cinematic";
  root.dataset.usSignThemeVersion = "2.1.4";

  const SHARED_CACHE_KEY = "chatgpt-us-sign-dark-glass-bing-wallpaper-pool-v1";
  const ROTATE_MS = 30 * 60 * 1000;
  const FADE_MS = 5200;
  const PAN_X_LIMIT = 3.6;
  const PAN_Y_LIMIT = 2.9;
  const MIN_ZOOM = 1.115;
  const MAX_ZOOM = 1.165;
  const MIN_PAN_MS = 110000;
  const MAX_PAN_MS = 190000;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  GM_addStyle(String.raw`
    :root,
    html.dark,
    html[data-theme="dark"] {
      --us-cine-a-image: var(--us-wallpaper);
      --us-cine-b-image: var(--us-wallpaper);
      --us-cine-reading-image: var(--us-wallpaper);
      --us-cine-a-opacity: 1;
      --us-cine-b-opacity: 0;
      --us-cine-a-x: 0%;
      --us-cine-a-y: 0%;
      --us-cine-b-x: 0%;
      --us-cine-b-y: 0%;
      --us-cine-a-scale: 1.13;
      --us-cine-b-scale: 1.13;
      --us-cine-a-motion: 0ms;
      --us-cine-b-motion: 0ms;
      --us-cine-fade: ${FADE_MS}ms;
    }

    html::before {
      content: none !important;
      display: none !important;
      background-image: none !important;
      transform: none !important;
    }

    body {
      position: relative !important;
      isolation: isolate !important;
    }

    body::before,
    body::after {
      content: "" !important;
      position: fixed !important;
      inset: -10vh -10vw !important;
      z-index: -1 !important;
      pointer-events: none !important;
      background-position: center !important;
      background-size: auto, auto, auto, cover !important;
      background-repeat: no-repeat !important;
      transform-origin: center center !important;
      will-change: transform, opacity !important;
      backface-visibility: hidden !important;
      contain: paint !important;
    }

    body::before {
      opacity: var(--us-cine-a-opacity) !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(255,255,255,0.030), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(255,255,255,0.014), transparent 34%),
        linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.40)),
        var(--us-cine-a-image) !important;
      transform: translate3d(var(--us-cine-a-x), var(--us-cine-a-y), 0) scale(var(--us-cine-a-scale)) !important;
      transition-property: opacity, transform !important;
      transition-duration: var(--us-cine-fade), var(--us-cine-a-motion) !important;
      transition-timing-function: cubic-bezier(.22,.61,.36,1), cubic-bezier(.42,0,.22,1) !important;
    }

    body::after {
      opacity: var(--us-cine-b-opacity) !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(255,255,255,0.030), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(255,255,255,0.014), transparent 34%),
        linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.40)),
        var(--us-cine-b-image) !important;
      transform: translate3d(var(--us-cine-b-x), var(--us-cine-b-y), 0) scale(var(--us-cine-b-scale)) !important;
      transition-property: opacity, transform !important;
      transition-duration: var(--us-cine-fade), var(--us-cine-b-motion) !important;
      transition-timing-function: cubic-bezier(.22,.61,.36,1), cubic-bezier(.42,0,.22,1) !important;
    }

    #thread::before {
      background-image:
        linear-gradient(180deg, rgba(8,8,10,0.44), rgba(5,5,7,0.58)),
        var(--us-cine-reading-image) !important;
    }

    @media (prefers-reduced-motion: reduce) {
      body::before,
      body::after {
        transform: scale(1.08) !important;
        transition-property: opacity !important;
        transition-duration: 900ms !important;
      }
    }
  `);

  let wallpaperPool = [];
  let rotateTimer = 0;
  let cachePollTimer = 0;
  let activeLayer = "a";
  let lastWallpaperKey = "";
  let lastAppliedSlot = -1;
  let pendingWallpaperKey = "";
  let swapToken = 0;

  const layerMotion = {
    a: { timer: 0, point: null, direction: null },
    b: { timer: 0, point: null, direction: null }
  };

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function cssUrl(url) {
    return `url("${String(url || "").replace(/"/g, "%22")}")`;
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

  function randomPoint() {
    return {
      x: randomBetween(-PAN_X_LIMIT, PAN_X_LIMIT),
      y: randomBetween(-PAN_Y_LIMIT, PAN_Y_LIMIT),
      scale: randomBetween(MIN_ZOOM, MAX_ZOOM)
    };
  }

  function layerVar(layer, suffix) {
    return `--us-cine-${layer}-${suffix}`;
  }

  function setLayerPoint(layer, point, durationMs) {
    if (!point) return;
    root.style.setProperty(layerVar(layer, "motion"), `${Math.max(0, Math.round(durationMs))}ms`);
    root.style.setProperty(layerVar(layer, "x"), `${point.x.toFixed(3)}%`);
    root.style.setProperty(layerVar(layer, "y"), `${point.y.toFixed(3)}%`);
    root.style.setProperty(layerVar(layer, "scale"), point.scale.toFixed(4));
  }

  function stopLayerMotion(layer) {
    const state = layerMotion[layer];
    if (!state) return;
    if (state.timer) window.clearTimeout(state.timer);
    state.timer = 0;
  }

  function chooseTarget(from, preferredDirection = null) {
    let direction = unitVector(preferredDirection || randomDirection());

    if (Math.abs(from.x) > PAN_X_LIMIT * 0.78 && Math.sign(direction.x) === Math.sign(from.x)) {
      direction.x *= -1;
    }
    if (Math.abs(from.y) > PAN_Y_LIMIT * 0.78 && Math.sign(direction.y) === Math.sign(from.y)) {
      direction.y *= -1;
    }

    const baseAngle = Math.atan2(direction.y, direction.x);
    const angle = baseAngle + randomBetween(-0.30, 0.30);
    direction = { x: Math.cos(angle), y: Math.sin(angle) };

    const distance = randomBetween(2.6, 5.3);
    let target = {
      x: clamp(from.x + direction.x * distance, -PAN_X_LIMIT, PAN_X_LIMIT),
      y: clamp(from.y + direction.y * distance, -PAN_Y_LIMIT, PAN_Y_LIMIT),
      scale: from.scale
    };

    if (Math.hypot(target.x - from.x, target.y - from.y) < 1.6) {
      target.x = clamp(from.x - direction.x * distance, -PAN_X_LIMIT, PAN_X_LIMIT);
      target.y = clamp(from.y - direction.y * distance, -PAN_Y_LIMIT, PAN_Y_LIMIT);
    }

    let zoomDirection = Math.random() < 0.5 ? -1 : 1;
    if (from.scale >= MAX_ZOOM - 0.006) zoomDirection = -1;
    if (from.scale <= MIN_ZOOM + 0.006) zoomDirection = 1;
    target.scale = clamp(from.scale + zoomDirection * randomBetween(0.006, 0.017), MIN_ZOOM, MAX_ZOOM);

    return {
      point: target,
      direction: unitVector({ x: target.x - from.x, y: target.y - from.y })
    };
  }

  function updateMotionDebug(layer, state) {
    if (!state?.point || !state?.direction) return;
    root.dataset.usWallpaperLayer = layer;
    root.dataset.usWallpaperMotion = reducedMotion ? "reduced" : "cinematic-pan";
    root.dataset.usWallpaperPan = `${state.point.x.toFixed(2)},${state.point.y.toFixed(2)},${state.point.scale.toFixed(3)}`;
    root.dataset.usWallpaperDirection = `${state.direction.x.toFixed(2)},${state.direction.y.toFixed(2)}`;
  }

  function scheduleLayerLeg(layer, from, directionHint = null) {
    stopLayerMotion(layer);
    const state = layerMotion[layer];
    if (!state) return;

    if (reducedMotion) {
      state.point = { x: 0, y: 0, scale: 1.08 };
      state.direction = { x: 0, y: 0 };
      setLayerPoint(layer, state.point, 0);
      updateMotionDebug(layer, state);
      return;
    }

    const next = chooseTarget(from, directionHint);
    const duration = Math.round(randomBetween(MIN_PAN_MS, MAX_PAN_MS));
    state.point = next.point;
    state.direction = next.direction;
    setLayerPoint(layer, next.point, duration);
    updateMotionDebug(layer, state);

    state.timer = window.setTimeout(() => {
      if (document.hidden || layer !== activeLayer) return;
      scheduleLayerLeg(layer, state.point, state.direction);
    }, duration + 100);
  }

  function beginLayerMotion(layer, directionHint = null, startPoint = null) {
    stopLayerMotion(layer);
    const state = layerMotion[layer];
    if (!state) return;

    const start = reducedMotion ? { x: 0, y: 0, scale: 1.08 } : (startPoint || randomPoint());
    state.point = start;
    state.direction = unitVector(directionHint || randomDirection());
    setLayerPoint(layer, start, 0);
    updateMotionDebug(layer, state);

    if (reducedMotion) return;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (layer !== activeLayer) return;
        scheduleLayerLeg(layer, start, state.direction);
      });
    });
  }

  function chooseEntryFromDirection(directionHint) {
    const direction = unitVector(directionHint || randomDirection());
    const point = randomPoint();
    point.x = clamp(point.x - direction.x * 1.45, -PAN_X_LIMIT, PAN_X_LIMIT);
    point.y = clamp(point.y - direction.y * 1.10, -PAN_Y_LIMIT, PAN_Y_LIMIT);
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
      window.setTimeout(() => finish(false), 10000);
    });
  }

  function readSharedPool() {
    try {
      const raw = localStorage.getItem(SHARED_CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || !Array.isArray(parsed.images)) return [];
      const unique = new Map();
      parsed.images.forEach((image) => {
        if (image?.url && image?.key && !unique.has(image.key)) unique.set(image.key, image);
      });
      return Array.from(unique.values());
    } catch (_) {
      return [];
    }
  }

  function freezeBaseWallpaper() {
    const baseWallpaper = getComputedStyle(root).getPropertyValue("--us-wallpaper").trim();
    if (!baseWallpaper) return;
    root.style.setProperty("--us-cine-a-image", baseWallpaper);
    root.style.setProperty("--us-cine-reading-image", baseWallpaper);
  }

  function updateWallpaperMetadata(image, slot, layer) {
    root.dataset.usBingWallpaper = image?.title || "Bing wallpaper";
    root.dataset.usBingMarket = image?.market || "";
    root.dataset.usBingPoolSize = String(wallpaperPool.length);
    root.dataset.usBingSlot = String(slot);
    root.dataset.usWallpaperLayer = layer;
  }

  async function transitionWallpaper(image, slot) {
    if (!image?.url) return;
    const key = image.key || image.url;
    if (key === lastWallpaperKey || key === pendingWallpaperKey) {
      updateWallpaperMetadata(image, slot, activeLayer);
      return;
    }

    pendingWallpaperKey = key;
    const token = ++swapToken;
    const loaded = await preloadWallpaper(image.url);
    if (!loaded || token !== swapToken) {
      if (pendingWallpaperKey === key) pendingWallpaperKey = "";
      return;
    }

    const outgoing = activeLayer;
    const incoming = outgoing === "a" ? "b" : "a";
    const outgoingDirection = layerMotion[outgoing]?.direction || randomDirection();
    const entryPoint = chooseEntryFromDirection(outgoingDirection);

    root.style.setProperty(`--us-cine-${incoming}-image`, cssUrl(image.url));
    root.style.setProperty("--us-cine-fade", `${reducedMotion ? 900 : FADE_MS}ms`);

    activeLayer = incoming;
    beginLayerMotion(incoming, outgoingDirection, entryPoint);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (token !== swapToken) return;
        root.style.setProperty(`--us-cine-${incoming}-opacity`, "1");
        root.style.setProperty(`--us-cine-${outgoing}-opacity`, "0");
      });
    });

    window.setTimeout(() => {
      if (token !== swapToken) return;
      root.style.setProperty("--us-cine-reading-image", cssUrl(image.url));
    }, reducedMotion ? 450 : Math.round(FADE_MS / 2));

    window.setTimeout(() => {
      if (token !== swapToken) return;
      stopLayerMotion(outgoing);
    }, reducedMotion ? 950 : FADE_MS + 160);

    lastWallpaperKey = key;
    lastAppliedSlot = slot;
    pendingWallpaperKey = "";
    updateWallpaperMetadata(image, slot, incoming);
  }

  function applyWallpaper(images = wallpaperPool) {
    if (!Array.isArray(images) || images.length < 2) return;
    const slot = Math.floor(Date.now() / ROTATE_MS);
    let index = slot % images.length;
    let image = images[index];
    if (!image?.url) return;

    if (slot !== lastAppliedSlot && images.length > 1 && image.key === lastWallpaperKey) {
      index = (index + 1) % images.length;
      image = images[index];
    }
    transitionWallpaper(image, slot);
  }

  function refreshFromSharedCache() {
    const images = readSharedPool();
    if (images.length >= 2) {
      wallpaperPool = images;
      applyWallpaper(images);
      return true;
    }
    return false;
  }

  function pollSharedCache(attempt = 0) {
    if (cachePollTimer) window.clearTimeout(cachePollTimer);
    if (refreshFromSharedCache()) return;
    const nextDelay = attempt < 8 ? 1500 : 30000;
    cachePollTimer = window.setTimeout(() => pollSharedCache(attempt + 1), nextDelay);
  }

  function scheduleRotation() {
    if (rotateTimer) window.clearTimeout(rotateTimer);
    const now = Date.now();
    const untilNext = ROTATE_MS - (now % ROTATE_MS) + 600;
    rotateTimer = window.setTimeout(() => {
      refreshFromSharedCache();
      scheduleRotation();
    }, untilNext);
  }

  function resumeMotion() {
    const state = layerMotion[activeLayer];
    if (!reducedMotion && state?.point) {
      scheduleLayerLeg(activeLayer, state.point, state.direction || randomDirection());
    }
  }

  function syncWallpaper() {
    refreshFromSharedCache();
    resumeMotion();
    scheduleRotation();
  }

  function initCinematicWallpaper() {
    freezeBaseWallpaper();
    beginLayerMotion("a", randomDirection(), randomPoint());
    pollSharedCache(0);
    scheduleRotation();

    window.addEventListener("pageshow", syncWallpaper, { passive: true });
    window.addEventListener("focus", syncWallpaper, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopLayerMotion("a");
        stopLayerMotion("b");
      } else {
        syncWallpaper();
      }
    }, { passive: true });
  }

  initCinematicWallpaper();
})();
