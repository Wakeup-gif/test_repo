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

old_root = '''      --us-wallpaper-x: 50%;
      --us-wallpaper-y: 50%;
      --us-wallpaper-size: 106vw auto;'''
new_root = '''      --us-wallpaper-x: 50%;
      --us-wallpaper-y: 50%;
      --us-wallpaper-size: 106vw auto;
      --us-wallpaper-shift-x: 0px;
      --us-wallpaper-shift-y: 0px;'''
if old_root not in text:
    raise SystemExit("wallpaper root variables anchor not found")
text = text.replace(old_root, new_root, 1)

old_html = '''    html {
      min-height: 100% !important;
      color-scheme: dark !important;
      background-color: #081019 !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.15), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.07), transparent 34%),
        linear-gradient(rgba(4, 8, 13, 0.24), rgba(6, 11, 17, 0.48)),
        var(--us-wallpaper) !important;
      background-position: center, center, center, var(--us-wallpaper-x) var(--us-wallpaper-y) !important;
      background-size: auto, auto, auto, var(--us-wallpaper-size) !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
    }'''
new_html = '''    html {
      min-height: 100% !important;
      color-scheme: dark !important;
      background: #081019 !important;
      isolation: isolate !important;
    }

    /* v2.0.1: one fixed, compositor-friendly wallpaper layer.
       Parallax moves this layer with transform instead of repainting the
       root background-position on every pointer frame / scroll. */
    html::before {
      content: "" !important;
      position: fixed !important;
      inset: -4vh -4vw !important;
      z-index: 0 !important;
      pointer-events: none !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.15), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.07), transparent 34%),
        linear-gradient(rgba(4, 8, 13, 0.24), rgba(6, 11, 17, 0.48)),
        var(--us-wallpaper) !important;
      background-position: center !important;
      background-size: auto, auto, auto, cover !important;
      background-repeat: no-repeat !important;
      transform: translate3d(var(--us-wallpaper-shift-x), var(--us-wallpaper-shift-y), 0) scale(1.06) !important;
      transform-origin: center center !important;
      will-change: transform !important;
      backface-visibility: hidden !important;
    }'''
if old_html not in text:
    raise SystemExit("root wallpaper CSS anchor not found")
text = text.replace(old_html, new_html, 1)

old_body = '''    body,
    #__next,
    #root {
      min-height: 100% !important;
      color: var(--us-text) !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      font-family: var(--us-font) !important;
    }'''
new_body = '''    body,
    #__next,
    #root {
      position: relative !important;
      z-index: 1 !important;
      min-height: 100% !important;
      color: var(--us-text) !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      font-family: var(--us-font) !important;
    }'''
if old_body not in text:
    raise SystemExit("body stacking anchor not found")
text = text.replace(old_body, new_body, 1)

old_main = '''    main,
    [role="main"],
    [data-testid="conversation-turn-list"],
    [data-testid="conversation-turn-list"] > div,
    [class*="bg-token-main-surface-primary"],
    [class*="bg-token-main-surface-secondary"] {
      background-color: transparent !important;
      background-image: none !important;
    }'''
new_main = '''    main,
    [role="main"],
    [data-testid="conversation-turn-list"] > div,
    [class*="bg-token-main-surface-primary"],
    [class*="bg-token-main-surface-secondary"] {
      background-color: transparent !important;
      background-image: none !important;
    }

    /* v2.0.1: one restrained blur layer for the actual conversation rail.
       Nested messages/code are translucent paint only, avoiding stacked blur. */
    [data-testid="conversation-turn-list"] {
      position: relative !important;
      background: rgba(8, 17, 27, 0.20) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0.006)) !important;
      border-left: 1px solid rgba(196, 226, 251, 0.045) !important;
      border-right: 1px solid rgba(196, 226, 251, 0.045) !important;
      -webkit-backdrop-filter: blur(10px) saturate(116%) !important;
      backdrop-filter: blur(10px) saturate(116%) !important;
    }'''
if old_main not in text:
    raise SystemExit("main surface CSS anchor not found")
text = text.replace(old_main, new_main, 1)

old_user_blur = '''      -webkit-backdrop-filter: blur(14px) saturate(124%) !important;
      backdrop-filter: blur(14px) saturate(124%) !important;'''
if old_user_blur not in text:
    raise SystemExit("user bubble blur anchor not found")
text = text.replace(old_user_blur, '''      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;''', 1)

old_code_blur = '''      -webkit-backdrop-filter: blur(12px) saturate(120%) !important;
      backdrop-filter: blur(12px) saturate(120%) !important;'''
if old_code_blur not in text:
    raise SystemExit("code block blur anchor not found")
text = text.replace(old_code_blur, '''      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;''', 1)

old_menu = '''      background: rgba(10, 18, 28, 0.60) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012)) !important;
      border: 1px solid var(--us-border-strong) !important;
      box-shadow: var(--us-shadow-lg) !important;
      -webkit-backdrop-filter: blur(24px) saturate(136%) !important;
      backdrop-filter: blur(24px) saturate(136%) !important;'''
new_menu = '''      background: rgba(28, 43, 58, 0.54) !important;
      background-image: linear-gradient(180deg, rgba(167, 216, 255, 0.055), rgba(255,255,255,0.012)) !important;
      border: 1px solid rgba(191, 225, 252, 0.18) !important;
      box-shadow: 0 18px 48px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.045) !important;
      -webkit-backdrop-filter: blur(18px) saturate(128%) !important;
      backdrop-filter: blur(18px) saturate(128%) !important;'''
if old_menu not in text:
    raise SystemExit("menu glass anchor not found")
text = text.replace(old_menu, new_menu, 1)

menu_anchor = '''    [role="menuitem"] {
      border-radius: var(--us-radius-sm) !important;
    }'''
menu_extra = '''    [data-radix-popper-content-wrapper] [role="listbox"],
    [data-radix-popper-content-wrapper] [data-radix-menu-content],
    [data-radix-popper-content-wrapper] [data-radix-select-content],
    [role="listbox"] {
      color: var(--us-text-soft) !important;
      background: rgba(28, 43, 58, 0.54) !important;
      border: 1px solid rgba(191, 225, 252, 0.18) !important;
      box-shadow: 0 18px 48px rgba(0,0,0,0.28) !important;
      -webkit-backdrop-filter: blur(18px) saturate(128%) !important;
      backdrop-filter: blur(18px) saturate(128%) !important;
    }

'''
if menu_anchor not in text:
    raise SystemExit("menu item anchor not found")
text = text.replace(menu_anchor, menu_extra + menu_anchor, 1)

old_render = '''    document.documentElement.style.setProperty("--us-wallpaper-x", `${currentX.toFixed(3)}%`);
    document.documentElement.style.setProperty("--us-wallpaper-y", `${currentY.toFixed(3)}%`);'''
new_render = '''    const shiftX = (currentX - 50) * 3.2;
    const shiftY = (currentY - 50) * 3.2;
    document.documentElement.style.setProperty("--us-wallpaper-shift-x", `${shiftX.toFixed(2)}px`);
    document.documentElement.style.setProperty("--us-wallpaper-shift-y", `${shiftY.toFixed(2)}px`);'''
if old_render not in text:
    raise SystemExit("parallax render anchor not found")
text = text.replace(old_render, new_render, 1)

old_overscan = '''  function updateOverscan() {
    const ratio = Math.max(1, window.innerWidth) / Math.max(1, window.innerHeight);
    document.documentElement.style.setProperty(
      "--us-wallpaper-size",
      ratio >= (16 / 9) ? "106vw auto" : "auto 106vh"
    );
  }'''
new_overscan = '''  function updateOverscan() {
    document.documentElement.style.setProperty("--us-wallpaper-size", "cover");
  }'''
if old_overscan not in text:
    raise SystemExit("overscan function anchor not found")
text = text.replace(old_overscan, new_overscan, 1)

TARGET.write_text(text, encoding="utf-8")
