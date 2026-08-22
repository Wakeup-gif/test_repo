from pathlib import Path
import shutil

CANONICAL = Path("tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js")
VERSIONED = Path("tampermonkey/ChatGPT-US-Sign-Glass-Theme-v2.1.4.user.js")

text = CANONICAL.read_text(encoding="utf-8")

replacements = []

def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")
    text = text.replace(old, new, 1)

replace_once("// @version      2.1.3", "// @version      2.1.4", "version")
replace_once(
    "// @description  Modern graphite glass for ChatGPT with bounded live blur on compact UI panels, cached reading frost, restrained semantic color, Bing UHD rotation, native layout, and optimized cursor coverage.",
    "// @description  Modern graphite glass for ChatGPT with bounded live blur, dual-layer cinematic Bing UHD wallpaper crossfades, randomized slow pan/zoom routes, cached reading frost, native layout, and optimized cursor coverage.",
    "description",
)
replace_once("__chatgptUsSignDarkGlassThemeV213", "__chatgptUsSignDarkGlassThemeV214", "guard read")
replace_once("window.__chatgptUsSignDarkGlassThemeV213 = true;", "window.__chatgptUsSignDarkGlassThemeV214 = true;", "guard write")

replace_once(
'''      --us-wallpaper: url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1");''',
'''      --us-wallpaper: url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1");
      --us-wallpaper-a: var(--us-wallpaper);
      --us-wallpaper-b: var(--us-wallpaper);
      --us-wallpaper-a-opacity: 1;
      --us-wallpaper-b-opacity: 0;
      --us-wallpaper-a-x: 0%;
      --us-wallpaper-a-y: 0%;
      --us-wallpaper-b-x: 0%;
      --us-wallpaper-b-y: 0%;
      --us-wallpaper-a-scale: 1.12;
      --us-wallpaper-b-scale: 1.12;
      --us-wallpaper-a-motion: 0ms;
      --us-wallpaper-b-motion: 0ms;
      --us-wallpaper-fade: 4800ms;''',
"wallpaper vars",
)

old_wallpaper_css = '''    /* One wallpaper plane. No pointer-driven animation and no second copy
       painted onto the sidebar. */
    html::before {
      content: "" !important;
      position: fixed !important;
      inset: -4vh -4vw !important;
      z-index: 0 !important;
      pointer-events: none !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(255, 255, 255, 0.030), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(255, 255, 255, 0.014), transparent 34%),
        linear-gradient(rgba(0, 0, 0, 0.20), rgba(0, 0, 0, 0.42)),
        var(--us-wallpaper) !important;
      background-position: center !important;
      background-size: auto, auto, auto, cover !important;
      background-repeat: no-repeat !important;
      transform: scale(1.06) !important;
      transform-origin: center center !important;
      transition: none !important;
      backface-visibility: hidden !important;
    }
'''
new_wallpaper_css = '''    /* v2.1.4 CINEMATIC WALLPAPER
       Two fixed compositor layers replace the old single-plane/parallax model.
       JS only changes CSS variables at long intervals: no mousemove listener,
       no per-frame JS, and no live blur on the wallpaper itself. The generous
       overscan plus 1.10-1.15 zoom keeps randomized pans inside safe image area. */
    html::before,
    html::after {
      content: "" !important;
      position: fixed !important;
      inset: -9vh -9vw !important;
      z-index: 0 !important;
      pointer-events: none !important;
      background-position: center !important;
      background-size: auto, auto, auto, cover !important;
      background-repeat: no-repeat !important;
      transform-origin: center center !important;
      will-change: transform, opacity !important;
      backface-visibility: hidden !important;
      contain: strict !important;
    }

    html::before {
      opacity: var(--us-wallpaper-a-opacity) !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(255,255,255,0.030), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(255,255,255,0.014), transparent 34%),
        linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.40)),
        var(--us-wallpaper-a) !important;
      transform: translate3d(var(--us-wallpaper-a-x), var(--us-wallpaper-a-y), 0) scale(var(--us-wallpaper-a-scale)) !important;
      transition-property: opacity, transform !important;
      transition-duration: var(--us-wallpaper-fade), var(--us-wallpaper-a-motion) !important;
      transition-timing-function: cubic-bezier(.22,.61,.36,1), cubic-bezier(.42,0,.22,1) !important;
    }

    html::after {
      opacity: var(--us-wallpaper-b-opacity) !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(255,255,255,0.030), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(255,255,255,0.014), transparent 34%),
        linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.40)),
        var(--us-wallpaper-b) !important;
      transform: translate3d(var(--us-wallpaper-b-x), var(--us-wallpaper-b-y), 0) scale(var(--us-wallpaper-b-scale)) !important;
      transition-property: opacity, transform !important;
      transition-duration: var(--us-wallpaper-fade), var(--us-wallpaper-b-motion) !important;
      transition-timing-function: cubic-bezier(.22,.61,.36,1), cubic-bezier(.42,0,.22,1) !important;
    }
'''
replace_once(old_wallpaper_css, new_wallpaper_css, "wallpaper css")

replace_once(
'''    @media (pointer: coarse), (prefers-reduced-motion: reduce) {
      html::before {
        transition: none !important;
      }
    }''',
'''    @media (prefers-reduced-motion: reduce) {
      html::before,
      html::after {
        transform: scale(1.08) !important;
        transition-property: opacity !important;
        transition-duration: 900ms !important;
      }
    }''',
"reduced motion css",
)

old_state = '''  const ROTATE_MS = 30 * 60 * 1000;
  const CACHE_MS = 6 * 60 * 60 * 1000;
  const CACHE_KEY = "chatgpt-us-sign-dark-glass-bing-wallpaper-pool-v1";
  const MIN_ROTATION_POOL = 2;
  const MARKETS = ["en-US", "en-GB", "en-AU", "ja-JP"];

  let wallpaperPool = [];
  let rotateTimer = 0;
  let refreshInFlight = false;
  let lastAppliedSlot = -1;
  let lastWallpaperKey = "";
'''
new_state = '''  const ROTATE_MS = 30 * 60 * 1000;
  const CACHE_MS = 6 * 60 * 60 * 1000;
  const CACHE_KEY = "chatgpt-us-sign-dark-glass-bing-wallpaper-pool-v1";
  const MIN_ROTATION_POOL = 2;
  const MARKETS = ["en-US", "en-GB", "en-AU", "ja-JP"];

  const WALLPAPER_FADE_MS = 4800;
  const PAN_X_LIMIT = 3.4;
  const PAN_Y_LIMIT = 2.7;
  const MIN_ZOOM = 1.105;
  const MAX_ZOOM = 1.155;
  const MIN_PAN_MS = 90000;
  const MAX_PAN_MS = 145000;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  let wallpaperPool = [];
  let rotateTimer = 0;
  let refreshInFlight = false;
  let lastAppliedSlot = -1;
  let lastWallpaperKey = "";
  let activeWallpaperLayer = "a";
  let wallpaperInitialized = false;
  let wallpaperSwapToken = 0;
  const layerMotion = {
    a: { timer: 0, point: null, direction: null, imageKey: "" },
    b: { timer: 0, point: null, direction: null, imageKey: "" }
  };
'''
replace_once(old_state, new_state, "wallpaper state")

start = text.index("  function applyWallpaper(images = wallpaperPool) {")
end = text.index("\n  function requestMarket(market) {", start)
old_apply = text[start:end]
new_apply = r'''  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function randomPoint() {
    return {
      x: randomBetween(-PAN_X_LIMIT, PAN_X_LIMIT),
      y: randomBetween(-PAN_Y_LIMIT, PAN_Y_LIMIT),
      scale: randomBetween(MIN_ZOOM, MAX_ZOOM)
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

  function chooseTarget(from, preferredDirection = null) {
    let direction = unitVector(preferredDirection || randomDirection());

    // If a route arrives near a safe edge while still heading outward, reflect
    // that component so the next leg naturally pans back across the photo.
    if (Math.abs(from.x) > PAN_X_LIMIT * 0.78 && Math.sign(direction.x) === Math.sign(from.x)) {
      direction.x *= -1;
    }
    if (Math.abs(from.y) > PAN_Y_LIMIT * 0.78 && Math.sign(direction.y) === Math.sign(from.y)) {
      direction.y *= -1;
    }

    // Small angular wander keeps the route organic without abrupt 90° turns.
    const baseAngle = Math.atan2(direction.y, direction.x);
    const angle = baseAngle + randomBetween(-0.34, 0.34);
    direction = { x: Math.cos(angle), y: Math.sin(angle) };

    const distance = randomBetween(2.5, 5.1);
    let target = {
      x: clamp(from.x + direction.x * distance, -PAN_X_LIMIT, PAN_X_LIMIT),
      y: clamp(from.y + direction.y * distance, -PAN_Y_LIMIT, PAN_Y_LIMIT),
      scale: from.scale
    };

    if (Math.hypot(target.x - from.x, target.y - from.y) < 1.55) {
      target.x = clamp(from.x - direction.x * distance, -PAN_X_LIMIT, PAN_X_LIMIT);
      target.y = clamp(from.y - direction.y * distance, -PAN_Y_LIMIT, PAN_Y_LIMIT);
    }

    let zoomDirection = Math.random() < 0.5 ? -1 : 1;
    if (from.scale >= MAX_ZOOM - 0.006) zoomDirection = -1;
    if (from.scale <= MIN_ZOOM + 0.006) zoomDirection = 1;
    target.scale = clamp(
      from.scale + zoomDirection * randomBetween(0.006, 0.018),
      MIN_ZOOM,
      MAX_ZOOM
    );

    const actualDirection = unitVector({ x: target.x - from.x, y: target.y - from.y });
    return { point: target, direction: actualDirection };
  }

  function layerVar(layer, suffix) {
    return `--us-wallpaper-${layer}-${suffix}`;
  }

  function setLayerPoint(layer, point, durationMs) {
    const style = document.documentElement?.style;
    if (!style || !point) return;
    style.setProperty(layerVar(layer, "motion"), `${Math.max(0, Math.round(durationMs))}ms`);
    style.setProperty(layerVar(layer, "x"), `${point.x.toFixed(3)}%`);
    style.setProperty(layerVar(layer, "y"), `${point.y.toFixed(3)}%`);
    style.setProperty(layerVar(layer, "scale"), point.scale.toFixed(4));
  }

  function stopLayerMotion(layer) {
    const state = layerMotion[layer];
    if (!state) return;
    if (state.timer) window.clearTimeout(state.timer);
    state.timer = 0;
  }

  function scheduleLayerLeg(layer, from, directionHint = null) {
    stopLayerMotion(layer);
    const state = layerMotion[layer];
    if (!state) return;

    if (reducedMotion) {
      state.point = { x: 0, y: 0, scale: 1.08 };
      state.direction = { x: 0, y: 0 };
      setLayerPoint(layer, state.point, 0);
      return;
    }

    const next = chooseTarget(from, directionHint);
    const duration = Math.round(randomBetween(MIN_PAN_MS, MAX_PAN_MS));
    state.point = next.point;
    state.direction = next.direction;
    setLayerPoint(layer, next.point, duration);

    state.timer = window.setTimeout(() => {
      if (layer !== activeWallpaperLayer || document.hidden) return;
      scheduleLayerLeg(layer, state.point, state.direction);
    }, duration + 80);
  }

  function beginLayerMotion(layer, directionHint = null, startPoint = null) {
    stopLayerMotion(layer);
    const state = layerMotion[layer];
    if (!state) return;

    const start = reducedMotion ? { x: 0, y: 0, scale: 1.08 } : (startPoint || randomPoint());
    state.point = start;
    state.direction = directionHint || randomDirection();
    setLayerPoint(layer, start, 0);

    if (reducedMotion) return;

    // Two frames guarantee the randomized start point is committed before the
    // long transform transition begins. JS does no per-frame animation work.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (layer !== activeWallpaperLayer && wallpaperInitialized) return;
        scheduleLayerLeg(layer, start, directionHint || state.direction);
      });
    });
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
      window.setTimeout(() => finish(false), 9000);
    });
  }

  function cssUrl(url) {
    return `url("${String(url || "").replace(/"/g, "%22")}")`;
  }

  function updateWallpaperMetadata(image, slot, layer) {
    const root = document.documentElement;
    if (!root) return;
    root.dataset.usBingWallpaper = image.title || "Bing wallpaper";
    root.dataset.usBingMarket = image.market || "";
    root.dataset.usBingPoolSize = String(wallpaperPool.length);
    root.dataset.usBingSlot = String(slot);
    root.dataset.usWallpaperLayer = layer;
    root.dataset.usWallpaperMotion = reducedMotion ? "reduced" : "cinematic-pan";
  }

  function chooseEntryFromDirection(directionHint) {
    const direction = unitVector(directionHint || randomDirection());
    const base = randomPoint();
    // Enter slightly behind the current travel vector so the incoming photo
    // continues moving in the same visual direction during the crossfade.
    base.x = clamp(base.x - direction.x * 1.35, -PAN_X_LIMIT, PAN_X_LIMIT);
    base.y = clamp(base.y - direction.y * 1.05, -PAN_Y_LIMIT, PAN_Y_LIMIT);
    return base;
  }

  async function transitionWallpaper(image, slot) {
    const root = document.documentElement;
    if (!root || !image?.url) return;

    const key = image.key || image.url;
    if (wallpaperInitialized && key === lastWallpaperKey) {
      updateWallpaperMetadata(image, slot, activeWallpaperLayer);
      return;
    }

    const token = ++wallpaperSwapToken;
    const loaded = await preloadWallpaper(image.url);
    if (!loaded || token !== wallpaperSwapToken) return;

    const outgoing = activeWallpaperLayer;
    const incoming = outgoing === "a" ? "b" : "a";
    const outgoingDirection = layerMotion[outgoing]?.direction || randomDirection();
    const entryPoint = chooseEntryFromDirection(outgoingDirection);

    root.style.setProperty(`--us-wallpaper-${incoming}`, cssUrl(image.url));
    root.style.setProperty("--us-wallpaper-fade", `${reducedMotion ? 900 : WALLPAPER_FADE_MS}ms`);
    layerMotion[incoming].imageKey = key;

    // Prepare the new photo at a randomized safe crop, then start its route in
    // the same direction the old photo is already travelling.
    activeWallpaperLayer = incoming;
    beginLayerMotion(incoming, outgoingDirection, entryPoint);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (token !== wallpaperSwapToken) return;
        root.style.setProperty(`--us-wallpaper-${incoming}-opacity`, "1");
        root.style.setProperty(`--us-wallpaper-${outgoing}-opacity`, "0");
      });
    });

    // Change the cached reading-frost image at the visual midpoint when both
    // wallpaper layers are blended, hiding the otherwise abrupt CSS image swap.
    window.setTimeout(() => {
      if (token !== wallpaperSwapToken) return;
      root.style.setProperty("--us-wallpaper", cssUrl(image.url));
    }, reducedMotion ? 450 : Math.round(WALLPAPER_FADE_MS / 2));

    window.setTimeout(() => {
      if (token !== wallpaperSwapToken) return;
      stopLayerMotion(outgoing);
      updateWallpaperMetadata(image, slot, incoming);
    }, reducedMotion ? 950 : WALLPAPER_FADE_MS + 120);

    wallpaperInitialized = true;
    lastAppliedSlot = slot;
    lastWallpaperKey = key;
  }

  function applyWallpaper(images = wallpaperPool) {
    if (!Array.isArray(images) || images.length < MIN_ROTATION_POOL || !document.documentElement) return;

    const slot = Math.floor(Date.now() / ROTATE_MS);
    let index = slot % images.length;
    let image = images[index];
    if (!image?.url) return;

    if (slot !== lastAppliedSlot && images.length > 1 && image.key === lastWallpaperKey) {
      index = (index + 1) % images.length;
      image = images[index];
    }

    if (!wallpaperInitialized) {
      const key = image.key || image.url;
      const layer = activeWallpaperLayer;
      document.documentElement.style.setProperty(`--us-wallpaper-${layer}`, cssUrl(image.url));
      document.documentElement.style.setProperty("--us-wallpaper", cssUrl(image.url));
      layerMotion[layer].imageKey = key;
      beginLayerMotion(layer);
      wallpaperInitialized = true;
      lastAppliedSlot = slot;
      lastWallpaperKey = key;
      updateWallpaperMetadata(image, slot, layer);
      return;
    }

    transitionWallpaper(image, slot);
  }
'''
text = text[:start] + new_apply + text[end:]

replace_once(
'''    window.addEventListener("pageshow", syncWallpaperRotation, { passive: true });
    window.addEventListener("focus", syncWallpaperRotation, { passive: true });
    document.addEventListener(
      "visibilitychange",
      () => {
        if (!document.hidden) syncWallpaperRotation();
      },
      { passive: true }
    );''',
'''    window.addEventListener("pageshow", syncWallpaperRotation, { passive: true });
    window.addEventListener("focus", syncWallpaperRotation, { passive: true });
    document.addEventListener(
      "visibilitychange",
      () => {
        if (!document.hidden) {
          const state = layerMotion[activeWallpaperLayer];
          if (wallpaperInitialized && state?.point && !reducedMotion) {
            scheduleLayerLeg(activeWallpaperLayer, state.point, state.direction || randomDirection());
          }
          syncWallpaperRotation();
        } else {
          stopLayerMotion("a");
          stopLayerMotion("b");
        }
      },
      { passive: true }
    );''',
"visibility motion sync",
)

if "mousemove" in text or "pointermove" in text:
    raise SystemExit("Unexpected pointer-driven wallpaper motion listener found")
if "@version      2.1.4" not in text:
    raise SystemExit("Version bump missing")
if "html::after" not in text or "cinematic-pan" not in text:
    raise SystemExit("Cinematic wallpaper patch missing")

CANONICAL.write_text(text, encoding="utf-8")
shutil.copyfile(CANONICAL, VERSIONED)
print(f"Patched {CANONICAL} and wrote {VERSIONED}")
