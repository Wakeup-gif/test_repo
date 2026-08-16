from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.8" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.8")

text = text.replace("@version      2.0.8", "@version      2.0.9", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with resilient 30-minute Bing UHD rotation, optimized parallax, translucent sidebar glass, main-scoped frosted reading glass, brighter menus, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with resilient 30-minute Bing UHD rotation, optimized parallax, translucent sidebar glass, native-aligned paint-only reading glass, brighter menus, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV208", "window.__chatgptUsSignGlassThemeV209")

old = '''    /* v2.0.8: keep the frosted reading rail inside the real <main> stacking\n       context. No body-level fixed backdrop layer, so message links and\n       ChatGPT portals keep their native hit-testing behavior. */\n    main {\n      position: relative !important;\n      isolation: isolate !important;\n    }\n\n    main::before {\n      content: "" !important;\n      position: fixed !important;\n      top: 48px !important;\n      bottom: 0 !important;\n      left: calc(var(--us-chat-sidebar-edge, 0px) + ((100vw - var(--us-chat-sidebar-edge, 0px)) / 2)) !important;\n      width: min(860px, calc(100vw - var(--us-chat-sidebar-edge, 0px) - 52px)) !important;\n      transform: translateX(-50%) !important;\n      pointer-events: none !important;\n      z-index: -1 !important;\n      background: rgba(15, 29, 43, 0.20) !important;\n      background-image: linear-gradient(180deg, rgba(183, 220, 249, 0.034), rgba(255,255,255,0.008)) !important;\n      border-left: 1px solid rgba(195, 225, 249, 0.070) !important;\n      border-right: 1px solid rgba(195, 225, 249, 0.070) !important;\n      box-shadow: 0 0 54px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.024) !important;\n      -webkit-backdrop-filter: blur(22px) saturate(122%) !important;\n      backdrop-filter: blur(22px) saturate(122%) !important;\n    }'''

new = '''    /* v2.0.9: paint-only center glass. Do not change ChatGPT's main/header\n       geometry, positioning, isolation, or z-index. The real main surface\n       owns one broad frost layer; the native conversation list only adds\n       a centered translucent reading tint on top. */\n    main {\n      background: rgba(10, 20, 31, 0.10) !important;\n      background-image: linear-gradient(180deg, rgba(173, 216, 248, 0.018), rgba(255,255,255,0.004)) !important;\n      -webkit-backdrop-filter: blur(14px) saturate(118%) !important;\n      backdrop-filter: blur(14px) saturate(118%) !important;\n    }\n\n    [data-testid="conversation-turn-list"] {\n      background: rgba(15, 29, 43, 0.18) !important;\n      background-image: linear-gradient(180deg, rgba(183, 220, 249, 0.028), rgba(255,255,255,0.006)) !important;\n      border-left: 1px solid rgba(195, 225, 249, 0.055) !important;\n      border-right: 1px solid rgba(195, 225, 249, 0.055) !important;\n      box-shadow: 0 0 42px rgba(0,0,0,0.065), inset 0 1px 0 rgba(255,255,255,0.018) !important;\n      -webkit-backdrop-filter: none !important;\n      backdrop-filter: none !important;\n    }'''

if old not in text:
    raise SystemExit("v2.0.8 main glass block anchor not found")
text = text.replace(old, new, 1)

TARGET.write_text(text, encoding="utf-8")
