from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.5" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.5")

text = text.replace("@version      2.0.5", "@version      2.0.6", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with rotating Bing UHD wallpaper, optimized parallax, translucent sidebar glass, a wallpaper-only frosted reading rail, brighter menus, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with resilient 30-minute Bing UHD rotation, optimized parallax, translucent sidebar glass, a wallpaper-only frosted reading rail, brighter menus, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV205", "window.__chatgptUsSignGlassThemeV206")

old_consts = '''  const ROTATE_MS = 30 * 60 * 1000;\n  const CACHE_MS = 6 * 60 * 60 * 1000;\n  const CACHE_KEY = "chatgpt-us-sign-bing-wallpaper-pool-v2";\n  const MARKETS = ["en-US", "en-GB", "en-AU", "ja-JP"];\n  let wallpaperPool = [];\n  let rotateTimer = 0;\n  let refreshInFlight = false;'''
new_consts = '''  const ROTATE_MS = 30 * 60 * 1000;\n  const CACHE_MS = 6 * 60 * 60 * 1000;\n  const CACHE_KEY = "chatgpt-us-sign-bing-wallpaper-pool-v3";\n  const MIN_ROTATION_POOL = 2;\n  const MARKETS = ["en-US", "en-GB", "en-AU", "ja-JP"];\n  let wallpaperPool = [];\n  let rotateTimer = 0;\n  let refreshInFlight = false;\n  let lastAppliedSlot = -1;\n  let lastWallpaperKey = "";'''
if old_consts not in text:
    raise SystemExit("wallpaper constants anchor not found")
text = text.replace(old_consts, new_consts, 1)

old_read = '''  function readCache() {\n    try {\n      const raw = localStorage.getItem(CACHE_KEY);\n      const parsed = raw ? JSON.parse(raw) : null;\n      return parsed && Array.isArray(parsed.images) ? parsed : null;\n    } catch (_) {\n      return null;\n    }\n  }'''
new_read = '''  function readCache() {\n    try {\n      const raw = localStorage.getItem(CACHE_KEY);\n      const parsed = raw ? JSON.parse(raw) : null;\n      if (!parsed || !Array.isArray(parsed.images)) return null;\n      const unique = new Map();\n      parsed.images.forEach((image) => {\n        if (image?.url && image?.key && !unique.has(image.key)) unique.set(image.key, image);\n      });\n      const images = Array.from(unique.values());\n      if (images.length < MIN_ROTATION_POOL) return null;\n      return { ...parsed, images };\n    } catch (_) {\n      return null;\n    }\n  }'''
if old_read not in text:
    raise SystemExit("readCache anchor not found")
text = text.replace(old_read, new_read, 1)

old_norm = '''      return {\n        url: url.href,\n        key: String(image.urlbase || url.pathname),\n        title: String(image.title || image.copyright || "Bing wallpaper"),\n        market: String(market || "")\n      };'''
new_norm = '''      return {\n        url: url.href,\n        key: String(image.urlbase || url.pathname),\n        title: String(image.title || image.copyright || "Bing wallpaper"),\n        startdate: String(image.startdate || ""),\n        market: String(market || "")\n      };'''
if old_norm not in text:
    raise SystemExit("normalizeImage anchor not found")
text = text.replace(old_norm, new_norm, 1)

old_apply = '''  function applyWallpaper(images = wallpaperPool) {\n    if (!Array.isArray(images) || !images.length) return;\n    const slot = Math.floor(Date.now() / ROTATE_MS);\n    const image = images[slot % images.length];\n    if (!image?.url) return;\n\n    document.documentElement.style.setProperty("--us-wallpaper", `url("${image.url.replace(/"/g, "%22")}")`);\n    document.documentElement.dataset.usBingWallpaper = image.title || "Bing wallpaper";\n    document.documentElement.dataset.usBingMarket = image.market || "";\n  }'''
new_apply = '''  function applyWallpaper(images = wallpaperPool) {\n    if (!Array.isArray(images) || images.length < MIN_ROTATION_POOL || !document.documentElement) return;\n    const slot = Math.floor(Date.now() / ROTATE_MS);\n    let index = slot % images.length;\n    let image = images[index];\n    if (!image?.url) return;\n\n    // If Bing ever returns duplicate-looking entries under different metadata,\n    // guarantee that a new half-hour slot still advances visually.\n    if (slot !== lastAppliedSlot && images.length > 1 && image.key === lastWallpaperKey) {\n      index = (index + 1) % images.length;\n      image = images[index];\n    }\n\n    document.documentElement.style.setProperty("--us-wallpaper", `url("${image.url.replace(/"/g, "%22")}")`);\n    document.documentElement.dataset.usBingWallpaper = image.title || "Bing wallpaper";\n    document.documentElement.dataset.usBingMarket = image.market || "";\n    document.documentElement.dataset.usBingPoolSize = String(images.length);\n    document.documentElement.dataset.usBingSlot = String(slot);\n    lastAppliedSlot = slot;\n    lastWallpaperKey = image.key || image.url;\n  }'''
if old_apply not in text:
    raise SystemExit("applyWallpaper anchor not found")
text = text.replace(old_apply, new_apply, 1)

old_refresh_tail = '''      if (images.length) {\n        wallpaperPool = images;\n        writeCache(images);\n        applyWallpaper();\n      }'''
new_refresh_tail = '''      if (images.length >= MIN_ROTATION_POOL) {\n        wallpaperPool = images;\n        writeCache(images);\n        applyWallpaper();\n      }'''
if old_refresh_tail not in text:
    raise SystemExit("refresh pool tail anchor not found")
text = text.replace(old_refresh_tail, new_refresh_tail, 1)

old_init = '''  function initWallpapers() {\n    const cached = readCache();\n    if (cached?.images?.length) {\n      wallpaperPool = cached.images;\n      applyWallpaper();\n    }\n    refreshPool(false);\n    scheduleRotation();\n  }\n\n  initWallpapers();'''
new_init = '''  function syncWallpaperRotation() {\n    applyWallpaper();\n    refreshPool(false);\n    scheduleRotation();\n  }\n\n  function initWallpapers() {\n    const cached = readCache();\n    if (cached?.images?.length >= MIN_ROTATION_POOL) {\n      wallpaperPool = cached.images;\n      applyWallpaper();\n    }\n    refreshPool(false);\n    scheduleRotation();\n\n    // Browsers aggressively throttle background tabs. Re-sync immediately\n    // whenever ChatGPT becomes active so a missed half-hour boundary cannot\n    // leave the wallpaper stuck on an old slot.\n    window.addEventListener("pageshow", syncWallpaperRotation, { passive: true });\n    window.addEventListener("focus", syncWallpaperRotation, { passive: true });\n    document.addEventListener("visibilitychange", () => {\n      if (!document.hidden) syncWallpaperRotation();\n    }, { passive: true });\n  }\n\n  initWallpapers();'''
if old_init not in text:
    raise SystemExit("initWallpapers anchor not found")
text = text.replace(old_init, new_init, 1)

TARGET.write_text(text, encoding="utf-8")
