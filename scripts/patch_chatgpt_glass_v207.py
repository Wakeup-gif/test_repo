from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.6" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.6")

text = text.replace("@version      2.0.6", "@version      2.0.7", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with resilient 30-minute Bing UHD rotation, optimized parallax, translucent sidebar glass, a wallpaper-only frosted reading rail, brighter menus, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with resilient 30-minute Bing UHD rotation, optimized parallax, translucent sidebar glass, a click-safe wallpaper-only frosted reading rail, brighter menus, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV206", "window.__chatgptUsSignGlassThemeV207")

old = '''    body > :not(script):not(style):not(link) {\n      position: relative !important;\n      z-index: 2 !important;\n    }'''
new = '''    /* v2.0.7: only elevate the actual ChatGPT application root.\n       Do not elevate every body child: ChatGPT mounts invisible portals,\n       live regions, and utility layers at body level that can otherwise\n       intercept link/button hit-testing. */\n    body > #root,\n    body > #__next {\n      position: relative !important;\n      z-index: 1 !important;\n    }'''
if old not in text:
    raise SystemExit("broad body-child z-index anchor not found")
text = text.replace(old, new, 1)

TARGET.write_text(text, encoding="utf-8")
