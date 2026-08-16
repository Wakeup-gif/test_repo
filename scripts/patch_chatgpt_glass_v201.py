from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.0" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.0")

text = text.replace("@version      2.0.0", "@version      2.0.1", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with rotating Bing UHD wallpaper, frosted glass surfaces, subtle pointer parallax, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with rotating Bing UHD wallpaper, optimized fixed-layer parallax, a frosted conversation rail, brighter menus, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV200", "window.__chatgptUsSignGlassThemeV201")

old_root = '''      --us-wallpaper-x: 50%;\n      --us-wallpaper-y: 50%;\n      --us-wallpaper-size: 106vw auto;'''
new_root = '''      --us-wallpaper-x: 50%;\n      --us-wallpaper-y: 50%;\n      --us-wallpaper-size: 106vw auto;\n      --us-wallpaper-shift-x: 0px;\n      --us-wallpaper-shift-y: 0px;'''
if old_root not in text:
    raise SystemExit("wallpaper root variables anchor not found")
text = text.replace(old_root, new_root, 1)

old_html = '''    html {\n      min-height: 100% !important;\n      color-scheme: dark !important;\n      background-color: #081019 !important;\n      background-image:\n        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.15), transparent 38%),\n        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.07), transparent 34%),\n        linear-gradient(rgba(4, 8, 13, 0.24), rgba(6, 11, 17, 0.48)),\n        var(--us-wallpaper) !important;\n      background-position: center, center, center, var(--us-wallpaper-x) var(--us-wallpaper-y) !important;\n      background-size: auto, auto, auto, var(--us-wallpaper-size) !important;\n      background-repeat: no-repeat !important;\n      background-attachment: fixed !important;\n    }'''
new_html = '''    html {\n      min-height: 100% !important;\n      color-scheme: dark !important;\n      background: #081019 !important;\n      isolation: isolate !important;\n    }\n\n    /* v2.0.1: one fixed, compositor-friendly wallpaper layer.\n       Parallax now moves this layer with transform instead of repainting the\n       root background-position on every pointer frame / scroll. */\n    html::before {\n      content: \"\" !important;\n      position: fixed !important;\n      inset: -4vh -4vw !important;\n      z-index: 0 !important;\n      pointer-events: none !important;\n      background-image:\n        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.15), transparent 38%),\n        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.07), transparent 34%),\n        linear-gradient(rgba(4, 8, 13, 0.24), rgba(6, 11, 17, 0.48)),\n        var(--us-wallpaper) !important;\n      background-position: center !important;\n      background-size: auto, auto, auto, cover !important;\n      background-repeat: no-repeat !important;\n      transform: translate3d(var(--us-wallpaper-shift-x), var(--us-wallpaper-shift-y), 0) scale(1.06) !important;\n      transform-origin: center center !important;\n      will-change: transform !important;\n      backface-visibility: hidden !important;\n    }'''
if old_html not in text:
    raise SystemExit("root wallpaper CSS anchor not found")
text = text.replace(old_html, new_html, 1)

old_body = '''    body,\n    #__next,\n    #root {\n      min-height: 100% !important;\n      color: var(--us-text) !important;\n      background: transparent !important;\n      background-color: transparent !important;\n      background-image: none !important;\n      font-family: var(--us-font) !important;\n    }'''
new_body = '''    body,\n    #__next,\n    #root {\n      position: relative !important;\n      z-index: 1 !important;\n      min-height: 100% !important;\n      color: var(--us-text) !important;\n      background: transparent !important;\n      background-color: transparent !important;\n      background-image: none !important;\n      font-family: var(--us-font) !important;\n    }'''
if old_body not in text:
    raise SystemExit("body stacking anchor not found")
text = text.replace(old_body, new_body, 1)

old_main = '''    main,\n    [role=\"main\"],\n    [data-testid=\"conversation-turn-list\"],\n    [data-testid=\"conversation-turn-list\"] > div,\n    [class*=\"bg-token-main-surface-primary\"],\n    [class*=\"bg-token-main-surface-secondary\"] {\n      background-color: transparent !important;\n      background-image: none !important;\n    }'''
new_main = '''    main,\n    [role=\"main\"],\n    [data-testid=\"conversation-turn-list\"] > div,\n    [class*=\"bg-token-main-surface-primary\"],\n    [class*=\"bg-token-main-surface-secondary\"] {\n      background-color: transparent !important;\n      background-image: none !important;\n    }\n\n    /* v2.0.1: one restrained blur layer for the actual conversation rail.\n       Nested messages/code are translucent paint only, avoiding stacked blur. */\n    [data-testid=\"conversation-turn-list\"] {\n      position: relative !important;\n      background: rgba(8, 17, 27, 0.20) !important;\n      background-image: linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0.006)) !important;\n      border-left: 1px solid rgba(196, 226, 251, 0.045) !important;\n      border-right: 1px solid rgba(196, 226, 251, 0.045) !important;\n      -webkit-backdrop-filter: blur(10px) saturate(116%) !important;\n      backdrop-filter: blur(10px) saturate(116%) !important;\n    }'''
if old_main not in text:
    raise SystemExit("main surface CSS anchor not found")
text = text.replace(old_main, new_main, 1)

text = text.replace(
    '''      -webkit-backdrop-filter: blur(14px) saturate(124%) !important;\n      backdrop-filter: blur(14px) saturate(124%) !important;''',
    '''      -webkit-backdrop-filter: none !important;\n      backdrop-filter: none !important;''',
    1,
)
text = text.replace(
    '''      -webkit-backdrop-filter: blur(12px) saturate(120%) !important;\n      backdrop-filter: blur(12px) saturate(120%) !important;''',
    '''      -webkit-backdrop-filter: none !important;\n      backdrop-filter: none !important;''',
    1,
)

old_menu = '''      background: rgba(10, 18, 28, 0.60) !important;\n      background-image: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.010)) !important;\n      border-color: var(--us-border-strong) !important;\n      box-shadow: var(--us-shadow-md) !important;'''
new_menu = '''      background: rgba(28, 43, 58, 0.54) !important;\n      background-image: linear-gradient(180deg, rgba(167, 216, 255, 0.055), rgba(255,255,255,0.012)) !important;\n      border-color: rgba(191, 225, 252, 0.18) !important;\n      box-shadow: 0 18px 48px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.045) !important;'''
if old_menu not in text:
    raise SystemExit("menu glass anchor not found")
text = text.replace(old_menu, new_menu, 1)

# Cover newer Radix/listbox popovers that may not expose role=menu immediately.
menu_anchor = '''    [role=\"menuitem\"] {\n      border-radius: var(--us-radius-sm) !important;\n    }'''
menu_extra = '''    [data-radix-popper-content-wrapper] [role=\"listbox\"],\n    [data-radix-popper-content-wrapper] [data-radix-menu-content],\n    [data-radix-popper-content-wrapper] [data-radix-select-content],\n    [role=\"listbox\"] {\n      color: var(--us-text-soft) !important;\n      background: rgba(28, 43, 58, 0.54) !important;\n      border: 1px solid rgba(191, 225, 252, 0.18) !important;\n      box-shadow: 0 18px 48px rgba(0,0,0,0.28) !important;\n      -webkit-backdrop-filter: blur(18px) saturate(128%) !important;\n      backdrop-filter: blur(18px) saturate(128%) !important;\n    }\n\n'''
if menu_anchor not in text:
    raise SystemExit("menu item anchor not found")
text = text.replace(menu_anchor, menu_extra + menu_anchor, 1)

old_render = '''    document.documentElement.style.setProperty(\"--us-wallpaper-x\", `${currentX.toFixed(3)}%`);\n    document.documentElement.style.setProperty(\"--us-wallpaper-y\", `${currentY.toFixed(3)}%`);'''
new_render = '''    const shiftX = (currentX - 50) * 3.2;\n    const shiftY = (currentY - 50) * 3.2;\n    document.documentElement.style.setProperty(\"--us-wallpaper-shift-x\", `${shiftX.toFixed(2)}px`);\n    document.documentElement.style.setProperty(\"--us-wallpaper-shift-y\", `${shiftY.toFixed(2)}px`);'''
if old_render not in text:
    raise SystemExit("parallax render anchor not found")
text = text.replace(old_render, new_render, 1)

# Overscan is now handled by the fixed layer's scale; do not rewrite background-size on resize.
old_overscan = '''  function updateOverscan() {\n    const ratio = Math.max(1, window.innerWidth) / Math.max(1, window.innerHeight);\n    document.documentElement.style.setProperty(\n      \"--us-wallpaper-size\",\n      ratio >= (16 / 9) ? \"106vw auto\" : \"auto 106vh\"\n    );\n  }'''
new_overscan = '''  function updateOverscan() {\n    document.documentElement.style.setProperty(\"--us-wallpaper-size\", \"cover\");\n  }'''
if old_overscan not in text:
    raise SystemExit("overscan function anchor not found")
text = text.replace(old_overscan, new_overscan, 1)

TARGET.write_text(text, encoding="utf-8")
