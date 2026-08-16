from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.4" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.4")

text = text.replace("@version      2.0.4", "@version      2.0.5", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with rotating Bing UHD wallpaper, optimized parallax, translucent sidebar glass, a correctly layered frosted reading rail, brighter menus, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with rotating Bing UHD wallpaper, optimized parallax, translucent sidebar glass, a wallpaper-only frosted reading rail, brighter menus, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV204", "window.__chatgptUsSignGlassThemeV205")

old = '''    /* v2.0.4: put the frost inside ChatGPT's main stacking context and\n       behind the actual conversation. The wallpaper is blurred; text is not. */\n    main,\n    [role="main"] {\n      position: relative !important;\n      isolation: isolate !important;\n    }\n\n    main::before,\n    [role="main"]:not(main)::before {\n      content: "" !important;\n      position: fixed !important;\n      top: 48px !important;\n      bottom: 0 !important;\n      left: calc(var(--us-chat-sidebar-edge, 0px) + ((100vw - var(--us-chat-sidebar-edge, 0px)) / 2)) !important;\n      width: min(860px, calc(100vw - var(--us-chat-sidebar-edge, 0px) - 52px)) !important;\n      transform: translateX(-50%) !important;\n      pointer-events: none !important;\n      z-index: -1 !important;\n      background: rgba(10, 21, 32, 0.30) !important;\n      background-image: linear-gradient(180deg, rgba(183, 220, 249, 0.042), rgba(255,255,255,0.010)) !important;\n      border-left: 1px solid rgba(195, 225, 249, 0.075) !important;\n      border-right: 1px solid rgba(195, 225, 249, 0.075) !important;\n      box-shadow: 0 0 60px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.028) !important;\n      -webkit-backdrop-filter: blur(22px) saturate(124%) !important;\n      backdrop-filter: blur(22px) saturate(124%) !important;\n    }'''
new = '''    /* v2.0.5: body-owned glass rail. It sits above only the Bing wallpaper\n       and below every top-level ChatGPT app layer, so it cannot blur chat text. */\n    body::before {\n      content: "" !important;\n      position: fixed !important;\n      top: 48px !important;\n      bottom: 0 !important;\n      left: calc(var(--us-chat-sidebar-edge, 0px) + ((100vw - var(--us-chat-sidebar-edge, 0px)) / 2)) !important;\n      width: min(860px, calc(100vw - var(--us-chat-sidebar-edge, 0px) - 52px)) !important;\n      transform: translateX(-50%) !important;\n      pointer-events: none !important;\n      z-index: 0 !important;\n      background: rgba(15, 29, 43, 0.20) !important;\n      background-image: linear-gradient(180deg, rgba(183, 220, 249, 0.034), rgba(255,255,255,0.008)) !important;\n      border-left: 1px solid rgba(195, 225, 249, 0.070) !important;\n      border-right: 1px solid rgba(195, 225, 249, 0.070) !important;\n      box-shadow: 0 0 54px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.024) !important;\n      -webkit-backdrop-filter: blur(22px) saturate(122%) !important;\n      backdrop-filter: blur(22px) saturate(122%) !important;\n    }\n\n    body > :not(script):not(style):not(link) {\n      position: relative !important;\n      z-index: 2 !important;\n    }'''
if old not in text:
    raise SystemExit("v2.0.4 main pseudo glass anchor not found")
text = text.replace(old, new, 1)

TARGET.write_text(text, encoding="utf-8")
