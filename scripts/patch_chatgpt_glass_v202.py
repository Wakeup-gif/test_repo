from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.1" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.1")

text = text.replace("@version      2.0.1", "@version      2.0.2", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with rotating Bing UHD wallpaper, optimized fixed-layer parallax, a frosted conversation rail, brighter menus, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with rotating Bing UHD wallpaper, optimized fixed-layer parallax, brighter smoky sidebar glass, a stronger frosted conversation rail, brighter menus, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV201", "window.__chatgptUsSignGlassThemeV202")

old_vars = '''      --sidebar-surface-primary: rgba(11, 18, 27, 0.46) !important;\n      --sidebar-surface-secondary: rgba(17, 26, 37, 0.42) !important;\n      --sidebar-surface-tertiary: rgba(24, 34, 47, 0.38) !important;'''
new_vars = '''      --sidebar-surface-primary: rgba(27, 43, 58, 0.46) !important;\n      --sidebar-surface-secondary: rgba(34, 51, 68, 0.42) !important;\n      --sidebar-surface-tertiary: rgba(42, 60, 78, 0.38) !important;'''
if old_vars not in text:
    raise SystemExit("sidebar variable anchor not found")
text = text.replace(old_vars, new_vars, 1)

old_rail = '''    /* v2.0.1: one restrained blur layer for the actual conversation rail.\n       Nested messages/code are translucent paint only, avoiding stacked blur. */\n    [data-testid="conversation-turn-list"] {\n      position: relative !important;\n      background: rgba(8, 17, 27, 0.20) !important;\n      background-image: linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0.006)) !important;\n      border-left: 1px solid rgba(196, 226, 251, 0.045) !important;\n      border-right: 1px solid rgba(196, 226, 251, 0.045) !important;\n      -webkit-backdrop-filter: blur(10px) saturate(116%) !important;\n      backdrop-filter: blur(10px) saturate(116%) !important;\n    }'''
new_rail = '''    /* v2.0.2: stronger single-layer conversation frost for readability.\n       Keep one blur layer only; nested messages/code remain paint-only. */\n    [data-testid="conversation-turn-list"] {\n      position: relative !important;\n      background: rgba(12, 25, 38, 0.32) !important;\n      background-image: linear-gradient(180deg, rgba(171, 215, 248, 0.035), rgba(255,255,255,0.010)) !important;\n      border-left: 1px solid rgba(196, 226, 251, 0.070) !important;\n      border-right: 1px solid rgba(196, 226, 251, 0.070) !important;\n      box-shadow: inset 0 1px 0 rgba(255,255,255,0.025), 0 0 48px rgba(0,0,0,0.08) !important;\n      -webkit-backdrop-filter: blur(16px) saturate(126%) !important;\n      backdrop-filter: blur(16px) saturate(126%) !important;\n    }'''
if old_rail not in text:
    raise SystemExit("conversation rail anchor not found")
text = text.replace(old_rail, new_rail, 1)

old_sidebar = '''    nav,\n    aside,\n    [data-testid="left-sidebar"],\n    [data-testid="sidebar"],\n    [data-testid="navigation-sidebar"] {\n      color: var(--us-text-soft) !important;\n      background: rgba(10, 17, 26, 0.40) !important;\n      background-image: none !important;\n      border-color: var(--us-border) !important;\n      box-shadow: 10px 0 32px rgba(0, 0, 0, 0.18) !important;\n      -webkit-backdrop-filter: blur(22px) saturate(132%) !important;\n      backdrop-filter: blur(22px) saturate(132%) !important;\n    }'''
new_sidebar = '''    nav,\n    aside,\n    [data-testid="left-sidebar"],\n    [data-testid="sidebar"],\n    [data-testid="navigation-sidebar"] {\n      color: var(--us-text-soft) !important;\n      background: rgba(27, 43, 58, 0.42) !important;\n      background-image: linear-gradient(180deg, rgba(169, 214, 248, 0.040), rgba(255,255,255,0.010)) !important;\n      border-color: rgba(182, 219, 247, 0.13) !important;\n      box-shadow: 10px 0 32px rgba(0, 0, 0, 0.14), inset -1px 0 0 rgba(255,255,255,0.025) !important;\n      -webkit-backdrop-filter: blur(18px) saturate(126%) !important;\n      backdrop-filter: blur(18px) saturate(126%) !important;\n    }'''
if old_sidebar not in text:
    raise SystemExit("sidebar glass anchor not found")
text = text.replace(old_sidebar, new_sidebar, 1)

TARGET.write_text(text, encoding="utf-8")

# release trigger
