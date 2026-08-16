from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.9" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.9")

text = text.replace("@version      2.0.9", "@version      2.0.10", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with resilient 30-minute Bing UHD rotation, optimized parallax, translucent sidebar glass, native-aligned paint-only reading glass, brighter menus, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with resilient 30-minute Bing UHD rotation, optimized parallax, translucent sidebar glass, native conversation-list frost, click-safe controls, brighter menus, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV209", "window.__chatgptUsSignGlassThemeV210")

old_base = '''    [data-testid="conversation-turn-list"] {\n      position: relative !important;\n      background: transparent !important;\n      background-image: none !important;\n      border-color: transparent !important;\n      box-shadow: none !important;\n      -webkit-backdrop-filter: none !important;\n      backdrop-filter: none !important;\n    }'''
new_base = '''    [data-testid="conversation-turn-list"] {\n      background: transparent !important;\n      background-image: none !important;\n      border-color: transparent !important;\n      box-shadow: none !important;\n      -webkit-backdrop-filter: none !important;\n      backdrop-filter: none !important;\n    }'''
if old_base not in text:
    raise SystemExit("conversation-list base block not found")
text = text.replace(old_base, new_base, 1)

old_paint = '''    /* v2.0.9: paint-only center glass. Do not change ChatGPT's main/header\n       geometry, positioning, isolation, or z-index. The real main surface\n       owns one broad frost layer; the native conversation list only adds\n       a centered translucent reading tint on top. */\n    main {\n      background: rgba(10, 20, 31, 0.10) !important;\n      background-image: linear-gradient(180deg, rgba(173, 216, 248, 0.018), rgba(255,255,255,0.004)) !important;\n      -webkit-backdrop-filter: blur(14px) saturate(118%) !important;\n      backdrop-filter: blur(14px) saturate(118%) !important;\n    }\n\n    [data-testid="conversation-turn-list"] {\n      background: rgba(15, 29, 43, 0.18) !important;\n      background-image: linear-gradient(180deg, rgba(183, 220, 249, 0.028), rgba(255,255,255,0.006)) !important;\n      border-left: 1px solid rgba(195, 225, 249, 0.055) !important;\n      border-right: 1px solid rgba(195, 225, 249, 0.055) !important;\n      box-shadow: 0 0 42px rgba(0,0,0,0.065), inset 0 1px 0 rgba(255,255,255,0.018) !important;\n      -webkit-backdrop-filter: none !important;\n      backdrop-filter: none !important;\n    }'''
new_paint = '''    /* v2.0.10: keep ChatGPT's main/topbar out of any filter context.\n       The native conversation list is already correctly centered by ChatGPT,\n       so it alone owns the readable frosted rear panel. */\n    main {\n      background: transparent !important;\n      background-image: none !important;\n      -webkit-backdrop-filter: none !important;\n      backdrop-filter: none !important;\n    }\n\n    [data-testid="conversation-turn-list"] {\n      background: rgba(15, 29, 43, 0.22) !important;\n      background-image: linear-gradient(180deg, rgba(183, 220, 249, 0.032), rgba(255,255,255,0.008)) !important;\n      border-left: 1px solid rgba(195, 225, 249, 0.060) !important;\n      border-right: 1px solid rgba(195, 225, 249, 0.060) !important;\n      box-shadow: 0 0 42px rgba(0,0,0,0.070), inset 0 1px 0 rgba(255,255,255,0.020) !important;\n      -webkit-backdrop-filter: blur(18px) saturate(120%) !important;\n      backdrop-filter: blur(18px) saturate(120%) !important;\n    }'''
if old_paint not in text:
    raise SystemExit("v2.0.9 paint block not found")
text = text.replace(old_paint, new_paint, 1)

old_header = '''    header {\n      color: var(--us-text) !important;\n      background: rgba(9, 16, 25, 0.30) !important;\n      background-image: none !important;\n      border-color: var(--us-border) !important;\n      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.035) !important;\n      -webkit-backdrop-filter: blur(16px) saturate(128%) !important;\n      backdrop-filter: blur(16px) saturate(128%) !important;\n    }'''
new_header = '''    header {\n      color: var(--us-text) !important;\n      background: rgba(9, 16, 25, 0.30) !important;\n      background-image: none !important;\n      border-color: var(--us-border) !important;\n      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.035) !important;\n      -webkit-backdrop-filter: none !important;\n      backdrop-filter: none !important;\n    }'''
if old_header not in text:
    raise SystemExit("header glass block not found")
text = text.replace(old_header, new_header, 1)

TARGET.write_text(text, encoding="utf-8")
