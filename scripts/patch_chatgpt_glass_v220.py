from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.19" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.19")

text = text.replace("@version      2.0.19", "@version      2.0.20", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with cached Gaussian reading glass, resilient Bing UHD rotation, smooth low-overhead parallax, lightweight persistent surfaces, improved contrast, native layout, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with cached Gaussian reading glass, resilient Bing UHD rotation, static low-overhead wallpaper, lightweight persistent surfaces, improved contrast, native layout, and a cutout geometric cursor.",
    1,
)
text = text.replace(
    "if (window.__chatgptUsSignGlassThemeV219) return;\n  window.__chatgptUsSignGlassThemeV219 = true;",
    "if (window.__chatgptUsSignGlassThemeV220) return;\n  window.__chatgptUsSignGlassThemeV220 = true;",
    1,
)
text = text.replace("  const themeStyle = GM_addStyle(String.raw`", "  GM_addStyle(String.raw`", 1)
text = text.replace('      --us-wallpaper-transform: translate3d(0px, 0px, 0) scale(1.06);\n', '', 1)
text = text.replace(
    '''    /* One compositor-friendly wallpaper plane. Mouse parallax only changes\n       this transform variable once per pointer animation frame. */''',
    '''    /* One static compositor-friendly wallpaper plane. Bing rotation swaps\n       only the image URL; there are no pointer-driven transforms or animation\n       frames. */''',
    1,
)
text = text.replace('      transform: var(--us-wallpaper-transform) !important;\n', '      transform: scale(1.06) !important;\n', 1)
text = text.replace('      transform-origin: center center !important;\n', '      transform-origin: center center !important;\n', 1)
text = text.replace('      transition: none !important;\n      will-change: transform !important;\n', '      transition: none !important;\n', 1)

# Remove the now-obsolete reduced-motion wallpaper-transform variable block.
text = text.replace(
    '''    @media (pointer: coarse), (prefers-reduced-motion: reduce) {\n      :root {\n        --us-wallpaper-transform: translate3d(0px, 0px, 0) scale(1.06);\n      }\n      html::before {\n        transition: none !important;\n      }\n    }''',
    '''    @media (pointer: coarse), (prefers-reduced-motion: reduce) {\n      html::before {\n        transition: none !important;\n      }\n    }''',
    1,
)

# Delete the complete parallax implementation after wallpaper initialization.
pattern = re.compile(
    r'''\n  /\* v2\.0\.13: no thread discovery observer is needed\..*?\n  initParallax\(\);\n''',
    re.S,
)
text, count = pattern.subn('\n', text, count=1)
if count != 1:
    raise SystemExit("parallax implementation block not found")

# Guard against any parallax/runtime leftovers.
for forbidden in [
    "PARALLAX_X_PX",
    "PARALLAX_Y_PX",
    "pointermove",
    "requestAnimationFrame",
    "commitParallax",
    "queueParallax",
    "centerParallax",
    "resolveWallpaperRule",
    "wallpaperRule",
    "themeStyle",
    "--us-wallpaper-transform",
    "will-change: transform",
]:
    if forbidden in text:
        raise SystemExit(f"parallax leftover: {forbidden}")

TARGET.write_text(text, encoding="utf-8")
