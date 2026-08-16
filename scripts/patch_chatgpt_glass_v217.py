from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.16" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.16")

text = text.replace("@version      2.0.16", "@version      2.0.17", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with full-height tapered reading glass, resilient Bing UHD rotation, immediate low-overhead parallax, single-layer sidebar/composer frost, improved contrast, native layout, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with bottom-continuous tapered reading glass, resilient Bing UHD rotation, direct-rule low-overhead parallax, single-layer sidebar/composer frost, improved contrast, native layout, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV216", "window.__chatgptUsSignGlassThemeV217", 1)
text = text.replace("  GM_addStyle(String.raw`", "  const themeStyle = GM_addStyle(String.raw`", 1)

old_panel = '''    /* v2.0.16: keep the physical panel full viewport height so there is no\n       visible rectangular bottom edge. The mask itself now reaches zero near\n       the bottom center while continuing to feather the side edges. */\n    #thread::before {\n      content: "" !important;\n      display: block !important;\n      position: sticky !important;\n      top: 0 !important;\n      align-self: center !important;\n      flex: 0 0 auto !important;\n      box-sizing: border-box !important;\n      width: min(1000px, calc(100% - 32px)) !important;\n      height: 100dvh !important;\n      margin-bottom: -100dvh !important;\n      pointer-events: none !important;\n      z-index: -1 !important;\n      background: rgba(10, 23, 36, 0.64) !important;\n      background-image: linear-gradient(180deg, rgba(198, 229, 252, 0.072), rgba(3, 10, 17, 0.042)) !important;\n      border: 0 !important;\n      border-radius: 0 !important;\n      box-shadow: 0 18px 64px rgba(0,0,0,0.12) !important;\n      -webkit-backdrop-filter: blur(16px) saturate(120%) !important;\n      backdrop-filter: blur(16px) saturate(120%) !important;\n      -webkit-mask-image: radial-gradient(ellipse 58% 101% at 50% -1%, #000 0%, #000 57%, rgba(0,0,0,0.96) 68%, rgba(0,0,0,0.78) 79%, rgba(0,0,0,0.48) 89%, rgba(0,0,0,0.16) 96%, transparent 100%) !important;\n      mask-image: radial-gradient(ellipse 58% 101% at 50% -1%, #000 0%, #000 57%, rgba(0,0,0,0.96) 68%, rgba(0,0,0,0.78) 79%, rgba(0,0,0,0.48) 89%, rgba(0,0,0,0.16) 96%, transparent 100%) !important;\n    }'''

new_panel = '''    /* v2.0.17: the rear glass now remains present all the way through the\n       disclaimer/composer zone. Only the left/right edges feather away, so\n       there is no horizontal transparency seam behind the footer copy. */\n    #thread::before {\n      content: "" !important;\n      display: block !important;\n      position: sticky !important;\n      top: 0 !important;\n      align-self: center !important;\n      flex: 0 0 auto !important;\n      box-sizing: border-box !important;\n      width: min(1000px, calc(100% - 32px)) !important;\n      height: 100dvh !important;\n      margin-bottom: -100dvh !important;\n      pointer-events: none !important;\n      z-index: -1 !important;\n      background: rgba(10, 23, 36, 0.69) !important;\n      background-image: linear-gradient(180deg, rgba(198, 229, 252, 0.066), rgba(3, 10, 17, 0.050)) !important;\n      border: 0 !important;\n      border-radius: 0 !important;\n      box-shadow: 0 18px 64px rgba(0,0,0,0.11) !important;\n      -webkit-backdrop-filter: blur(9px) saturate(116%) !important;\n      backdrop-filter: blur(9px) saturate(116%) !important;\n      -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.22) 4%, rgba(0,0,0,0.62) 10%, #000 18%, #000 82%, rgba(0,0,0,0.62) 90%, rgba(0,0,0,0.22) 96%, transparent 100%) !important;\n      mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.22) 4%, rgba(0,0,0,0.62) 10%, #000 18%, #000 82%, rgba(0,0,0,0.62) 90%, rgba(0,0,0,0.22) 96%, transparent 100%) !important;\n    }'''

if old_panel not in text:
    raise SystemExit("v2.0.16 desktop panel block not found")
text = text.replace(old_panel, new_panel, 1)

text = text.replace(
    '''    #thread-bottom-container::after {\n      background: linear-gradient(180deg, rgba(5, 12, 20, 0), rgba(5, 12, 20, 0.46)) !important;\n      opacity: 1 !important;\n    }''',
    '''    #thread-bottom-container::after {\n      background: linear-gradient(180deg, rgba(10, 23, 36, 0) 0%, rgba(10, 23, 36, 0.12) 48%, rgba(10, 23, 36, 0.30) 100%) !important;\n      opacity: 1 !important;\n    }''',
    1,
)

old_mobile = '''      #thread::before {\n        top: 0 !important;\n        width: calc(100% - 6px) !important;\n        height: 100dvh !important;\n        margin-bottom: -100dvh !important;\n        border-radius: 0 !important;\n        background: rgba(10, 23, 36, 0.70) !important;\n        -webkit-backdrop-filter: blur(10px) saturate(112%) !important;\n        backdrop-filter: blur(10px) saturate(112%) !important;\n        -webkit-mask-image: radial-gradient(ellipse 65% 101% at 50% -1%, #000 0%, #000 59%, rgba(0,0,0,0.90) 73%, rgba(0,0,0,0.52) 88%, rgba(0,0,0,0.18) 96%, transparent 100%) !important;\n        mask-image: radial-gradient(ellipse 65% 101% at 50% -1%, #000 0%, #000 59%, rgba(0,0,0,0.90) 73%, rgba(0,0,0,0.52) 88%, rgba(0,0,0,0.18) 96%, transparent 100%) !important;\n      }'''

new_mobile = '''      #thread::before {\n        top: 0 !important;\n        width: calc(100% - 6px) !important;\n        height: 100dvh !important;\n        margin-bottom: -100dvh !important;\n        border-radius: 0 !important;\n        background: rgba(10, 23, 36, 0.72) !important;\n        -webkit-backdrop-filter: blur(7px) saturate(110%) !important;\n        backdrop-filter: blur(7px) saturate(110%) !important;\n        -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.42) 4%, #000 12%, #000 88%, rgba(0,0,0,0.42) 96%, transparent 100%) !important;\n        mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.42) 4%, #000 12%, #000 88%, rgba(0,0,0,0.42) 96%, transparent 100%) !important;\n      }'''

if old_mobile not in text:
    raise SystemExit("v2.0.16 mobile panel block not found")
text = text.replace(old_mobile, new_mobile, 1)

needle = '''  const PARALLAX_X_PX = 10;\n  const PARALLAX_Y_PX = 6;\n  let parallaxRaf = 0;'''
replacement = '''  const PARALLAX_X_PX = 9;\n  const PARALLAX_Y_PX = 5;\n  let wallpaperRule = null;\n  let parallaxRaf = 0;'''
if needle not in text:
    raise SystemExit("parallax constants block not found")
text = text.replace(needle, replacement, 1)

old_commit = '''  function commitParallax() {\n    parallaxRaf = 0;\n    document.documentElement.style.setProperty(\n      "--us-wallpaper-transform",\n      `translate3d(${pendingShiftX.toFixed(2)}px, ${pendingShiftY.toFixed(2)}px, 0) scale(1.06)`\n    );\n  }'''

new_commit = '''  function resolveWallpaperRule() {\n    if (wallpaperRule) return wallpaperRule;\n    try {\n      const sheet = themeStyle?.sheet;\n      if (!sheet) return null;\n      for (const rule of sheet.cssRules) {\n        if (rule?.selectorText === "html::before") {\n          wallpaperRule = rule;\n          return wallpaperRule;\n        }\n      }\n    } catch (_) {}\n    return null;\n  }\n\n  function commitParallax() {\n    parallaxRaf = 0;\n    const transform = `translate3d(${pendingShiftX.toFixed(2)}px, ${pendingShiftY.toFixed(2)}px, 0) scale(1.06)`;\n    const rule = resolveWallpaperRule();\n    if (rule) {\n      rule.style.setProperty("transform", transform, "important");\n      return;\n    }\n    // Rare fallback for userscript engines that do not expose the inserted\n    // stylesheet object. This path is only used if direct-rule mutation fails.\n    document.documentElement.style.setProperty("--us-wallpaper-transform", transform);\n  }'''

if old_commit not in text:
    raise SystemExit("commitParallax block not found")
text = text.replace(old_commit, new_commit, 1)

text = text.replace(
    '''  /* v2.0.16: pointer motion is sampled once per animation frame and the\n     compositor transform is applied immediately. No CSS trailing transition\n     and no recursive easing loop. */''',
    '''  /* v2.0.17: pointer motion is sampled once per animation frame, but the\n     transform is written directly to the one html::before CSS rule instead of\n     mutating an inherited root custom property across the entire ChatGPT tree. */''',
    1,
)

TARGET.write_text(text, encoding="utf-8")
