from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.7" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.7")

text = text.replace("@version      2.0.7", "@version      2.0.8", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with resilient 30-minute Bing UHD rotation, optimized parallax, translucent sidebar glass, a click-safe wallpaper-only frosted reading rail, brighter menus, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with resilient 30-minute Bing UHD rotation, optimized parallax, translucent sidebar glass, main-scoped frosted reading glass, brighter menus, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV207", "window.__chatgptUsSignGlassThemeV208")

old_body_glass = '''    /* v2.0.5: body-owned glass rail. It sits above only the Bing wallpaper\n       and below every top-level ChatGPT app layer, so it cannot blur chat text. */\n    body::before {\n      content: "" !important;\n      position: fixed !important;\n      top: 48px !important;\n      bottom: 0 !important;\n      left: calc(var(--us-chat-sidebar-edge, 0px) + ((100vw - var(--us-chat-sidebar-edge, 0px)) / 2)) !important;\n      width: min(860px, calc(100vw - var(--us-chat-sidebar-edge, 0px) - 52px)) !important;\n      transform: translateX(-50%) !important;\n      pointer-events: none !important;\n      z-index: 0 !important;\n      background: rgba(15, 29, 43, 0.20) !important;\n      background-image: linear-gradient(180deg, rgba(183, 220, 249, 0.034), rgba(255,255,255,0.008)) !important;\n      border-left: 1px solid rgba(195, 225, 249, 0.070) !important;\n      border-right: 1px solid rgba(195, 225, 249, 0.070) !important;\n      box-shadow: 0 0 54px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.024) !important;\n      -webkit-backdrop-filter: blur(22px) saturate(122%) !important;\n      backdrop-filter: blur(22px) saturate(122%) !important;\n    }\n\n    /* v2.0.7: only elevate the actual ChatGPT application root.\n       Do not elevate every body child: ChatGPT mounts invisible portals,\n       live regions, and utility layers at body level that can otherwise\n       intercept link/button hit-testing. */\n    body > #root,\n    body > #__next {\n      position: relative !important;\n      z-index: 1 !important;\n    }'''

new_main_glass = '''    /* v2.0.8: keep the frosted reading rail inside the real <main> stacking\n       context. No body-level fixed backdrop layer, so message links and\n       ChatGPT portals keep their native hit-testing behavior. */\n    main {\n      position: relative !important;\n      isolation: isolate !important;\n    }\n\n    main::before {\n      content: "" !important;\n      position: fixed !important;\n      top: 48px !important;\n      bottom: 0 !important;\n      left: calc(var(--us-chat-sidebar-edge, 0px) + ((100vw - var(--us-chat-sidebar-edge, 0px)) / 2)) !important;\n      width: min(860px, calc(100vw - var(--us-chat-sidebar-edge, 0px) - 52px)) !important;\n      transform: translateX(-50%) !important;\n      pointer-events: none !important;\n      z-index: -1 !important;\n      background: rgba(15, 29, 43, 0.20) !important;\n      background-image: linear-gradient(180deg, rgba(183, 220, 249, 0.034), rgba(255,255,255,0.008)) !important;\n      border-left: 1px solid rgba(195, 225, 249, 0.070) !important;\n      border-right: 1px solid rgba(195, 225, 249, 0.070) !important;\n      box-shadow: 0 0 54px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.024) !important;\n      -webkit-backdrop-filter: blur(22px) saturate(122%) !important;\n      backdrop-filter: blur(22px) saturate(122%) !important;\n    }'''

if old_body_glass not in text:
    raise SystemExit("v2.0.7 body glass block anchor not found")
text = text.replace(old_body_glass, new_main_glass, 1)

TARGET.write_text(text, encoding="utf-8")
