// ==UserScript==
// @name         ChatGPT - US Sign Dark Glass Theme
// @namespace    us-sign-full-modules
// @version      2.1.5
// @description  Modern graphite glass for ChatGPT with bounded live blur, stronger cinematic Bing UHD pan/zoom, continuous soft waypoint redirects, direction-aware crossfades, cached reading frost, and no pointer parallax.
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

  if (window.__chatgptUsSignDarkGlassThemeV215) return;
  window.__chatgptUsSignDarkGlassThemeV215 = true;

  const root = document.documentElement;
  if (!root) return;

  root.dataset.usSignTheme = "dark-glass-cinematic";
  root.dataset.usSignThemeVersion = "2.1.5";

  const SHARED_CACHE_KEY = "chatgpt-us-sign-dark-glass-bing-wallpaper-pool-v1";
  const ROTATE_MS = 30 * 60 * 1000;
  const FADE_MS = 7200;
  const PAN_X_LIMIT = 11.0;
  const PAN_Y_LIMIT = 8.5;
  const START_X_LIMIT = 8.4;
  const START_Y_LIMIT = 6.4;
  const MIN_ZOOM = 1.24;
  const MAX_ZOOM = 1.38;
  const MIN_PAN_MS = 55000;
  const MAX_PAN_MS = 90000;
  const MIN_TRAVEL = 8.0;
  const MAX_TRAVEL = 14.5;
  const HANDOFF_MIN = 0.82;
  const HANDOFF_MAX = 0.89;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  GM_addStyle(String.raw`
    :root,
    html.dark,
    html[data-theme="dark"] {
      --us-cine-reading-image: var(--us-wallpaper);
      --us-cine-fade: ${FADE_MS}ms;
    }

    /* The v2.1.3 base supplies the glass UI and Bing cache. Its old static
       wallpaper plane is disabled so v2.1.5 owns the visible camera motion. */
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

    #us-cinematic-wallpaper {
      position: fixed !important;
      inset: 0 !important;
      z-index: -1 !important;
      overflow: hidden !important;
      pointer-events: none !important;
      contain: strict !important;
    }

    #us-cinematic-wallpaper .us-cine-layer {
      --us-cine-image: var(--us-wallpaper);
      position: absolute !important;
      inset: -12vh -12vw !important;
      opacity: 0;
      pointer-events: none !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(255,255,255,0.030), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(255,255,255,0.014), transparent 34%),
        linear-gradient(rgba(0,0,0,0.17), rgba(0,0,0,0.39)),
        var(--us-cine-image) !important;
      background-position: center !important;
      background-size: auto, auto, auto, cover !important;
      background-repeat: no-repeat !important;
      transform-origin: center center !important;
      will-change: transform, opacity !important;
      backface-visibility: hidden !important;
      transition: opacity var(--us-cine-fade) cubic-bezier(.22,.61,.36,1) !important;
    }

    #us-cinematic-wallpaper .us-cine-layer[data-active="true"] {
      opacity: 1;
    }

    /* The reading frost remains a cheap image blur rather than a giant live
       backdrop-filter. It switches at the midpoint of each photo crossfade. */
    #thread::before {
      background-image:
        linear-gradient(180deg, rgba(8,8,10,0.44), rgba(5,5,7,0.58)),
        var(--us-cine-reading-image) !important;
    }

    @media (prefers-reduced-motion: reduce) {
      #us-cinematic-wallpaper .us-cine-layer {
        inset: -5vh -5vw !important;
        transform: scale(1.08) !important;
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
  let host = null;

  const layers = { a: null, b: null };
  const motion = {
    a: makeMotionState(),
    b: makeMotionState()
  };

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

    host = document.getElementById("us-cinematic-wallpaper");
    if (!host) {
      host = document.createElement("div");
      host.id = "us-cinematic-wallpaper";
      host.setAttribute("aria-hidden", "true");
      document.body.prepend(host);
    }

    ["a", "b"].forEach((name) => {
      let layer = host.querySelector(`[data-us-cine-layer="${name}"]`);
      if (!layer) {
        layer = document.createElement("div");
        layer.className = "us-cine-layer";
        layer.dataset.usCineLayer = name;
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
    layer.style.setProperty("--us-cine-image", cssUrl(url));
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

    if (state.timer) window.clearTimeout(state.timer);
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

    /* Start bending inward before the crop edge. The outward component is
       damped and reflected rather than hard-reversed, which creates a softer
       camera turn and prevents any image boundary from entering the viewport. */
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

    root.dataset.usWallpaperLayer = layerName;
    root.dataset.usWallpaperMotion = reducedMotion ? "reduced" : "cinematic-pan-strong";
    root.dataset.usWallpaperPan = `${point.x.toFixed(2)},${point.y.toFixed(2)},${point.scale.toFixed(3)}`;
    root.dataset.usWallpaperDirection = state.direction
      ? `${state.direction.x.toFixed(2)},${state.direction.y.toFixed(2)}`
      : "0.00,0.00";
  }

  function startLeg(layerName, from, directionHint = null, zoomDirectionHint = 1) {
    const layer = layers[layerName];
    const state = motion[layerName];
    if (!layer || !state || reducedMotion) return;

    if (state.timer) window.clearTimeout(state.timer);
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

    /* Redirect before the current leg comes to rest. Because the old leg is
       sampled while still moving and the next direction stays close to the old
       heading, the camera glides through waypoints instead of stop-starting. */
    state.timer = window.setTimeout(() => {
      if (document.hidden || !state.running) return;
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

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!state.running) return;
        startLeg(layerName, start, direction, zoomDirection);
      });
    });
  }

  function chooseEntryFromDirection(directionHint, zoomDirectionHint = 1) {
    const direction = unitVector(directionHint || randomDirection());
    const point = randomStartPoint(zoomDirectionHint);

    /* Enter slightly behind the outgoing camera vector. The incoming photo
       then travels through the crossfade in the same direction instead of
       appearing to jump to a random unrelated crop. */
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
      window.setTimeout(() => finish(false), 12000);
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

    layers.a?.style.setProperty("--us-cine-image", baseWallpaper);
    root.style.setProperty("--us-cine-reading-image", baseWallpaper);
  }

  function updateWallpaperMetadata(image, slot, layerName) {
    root.dataset.usBingWallpaper = image?.title || "Bing wallpaper";
    root.dataset.usBingMarket = image?.market || "";
    root.dataset.usBingPoolSize = String(wallpaperPool.length);
    root.dataset.usBingSlot = String(slot);
    root.dataset.usWallpaperLayer = layerName;
  }

  async function transitionWallpaper(image, slot) {
    if (!image?.url || !ensureHost()) return false;

    const key = image.key || image.url;
    if (key === lastWallpaperKey || key === pendingWallpaperKey) {
      updateWallpaperMetadata(image, slot, activeLayer);
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
    root.style.setProperty("--us-cine-fade", `${reducedMotion ? 900 : FADE_MS}ms`);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (token !== swapToken) return;
        setLayerVisible(incoming, true);
        setLayerVisible(outgoing, false);
      });
    });

    window.setTimeout(() => {
      if (token !== swapToken) return;
      root.style.setProperty("--us-cine-reading-image", cssUrl(image.url));
    }, reducedMotion ? 450 : Math.round(FADE_MS / 2));

    window.setTimeout(() => {
      if (token !== swapToken) return;
      stopMotion(outgoing, false);
    }, reducedMotion ? 950 : FADE_MS + 180);

    lastWallpaperKey = key;
    lastAppliedSlot = slot;
    pendingWallpaperKey = "";
    updateWallpaperMetadata(image, slot, incoming);
    return true;
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

  function pauseMotionForVisibility() {
    ["a", "b"].forEach((layerName) => {
      const state = motion[layerName];
      if (!state?.running) return;
      const current = sampleMotionPoint(layerName) || state.from;
      stopMotion(layerName, false);
      if (current) {
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
    beginMotion(
      activeLayer,
      state?.direction || randomDirection(),
      point,
      state?.zoomDirection || 1
    );
  }

  function syncWallpaper() {
    refreshFromSharedCache();
    if (!motion[activeLayer]?.running) resumeActiveMotion();
    scheduleRotation();
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
        zoomDirection: state?.zoomDirection || 0,
        durationMs: state?.duration || 0,
        handoff: state?.handoff || 0
      };
    };

    return {
      version: root.dataset.usSignThemeVersion,
      motion: root.dataset.usWallpaperMotion,
      activeLayer,
      bingPhoto: root.dataset.usBingWallpaper || "",
      poolSize: wallpaperPool.length,
      reducedMotion,
      layerA: snapshotLayer("a"),
      layerB: snapshotLayer("b")
    };
  }

  function forceNextWallpaper() {
    if (wallpaperPool.length < 2) return false;

    const currentIndex = wallpaperPool.findIndex((image) => (image.key || image.url) === lastWallpaperKey);
    let nextIndex = currentIndex >= 0
      ? (currentIndex + 1) % wallpaperPool.length
      : Math.floor(Math.random() * wallpaperPool.length);

    if ((wallpaperPool[nextIndex]?.key || wallpaperPool[nextIndex]?.url) === lastWallpaperKey) {
      nextIndex = (nextIndex + 1) % wallpaperPool.length;
    }

    const image = wallpaperPool[nextIndex];
    if (!image?.url) return false;
    transitionWallpaper(image, `manual-${Date.now()}`);
    return true;
  }

  window.__usCinematicWallpaperDebug = debugSnapshot;
  window.__usCinematicWallpaperNext = forceNextWallpaper;

  function initCinematicWallpaper() {
    if (!ensureHost()) return;

    freezeBaseWallpaper();
    setLayerVisible("a", true);
    setLayerVisible("b", false);
    beginMotion("a", randomDirection(), randomStartPoint(), Math.random() < 0.5 ? -1 : 1);
    pollSharedCache(0);
    scheduleRotation();

    window.addEventListener("pageshow", syncWallpaper, { passive: true });
    window.addEventListener("focus", syncWallpaper, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseMotionForVisibility();
      else syncWallpaper();
    }, { passive: true });
  }

  if (document.body) initCinematicWallpaper();
  else document.addEventListener("DOMContentLoaded", initCinematicWallpaper, { once: true });
})();
