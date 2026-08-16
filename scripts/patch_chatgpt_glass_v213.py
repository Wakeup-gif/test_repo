from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.12" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.12")

text = text.replace("@version      2.0.12", "@version      2.0.13", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with resilient 30-minute Bing UHD rotation, optimized parallax, translucent sidebar glass, DOM-grounded thread reading glass, native document stacking, brighter menus, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with resilient 30-minute Bing UHD rotation, optimized parallax, translucent sidebar glass, snapshot-grounded #thread reading glass, native document stacking, brighter menus, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV212", "window.__chatgptUsSignGlassThemeV213")

old_css = '''    .us-sign-chat-thread-root {\n      position: relative !important;\n      background: transparent !important;\n      background-image: none !important;\n    }\n\n    .us-sign-chat-thread-root::before {\n      content: "" !important;\n      position: absolute !important;\n      top: 0 !important;\n      bottom: 0 !important;\n      left: 50% !important;\n      width: min(920px, calc(100% - 56px)) !important;\n      transform: translateX(-50%) !important;\n      pointer-events: none !important;\n      z-index: 0 !important;\n      background: rgba(12, 25, 38, 0.42) !important;\n      background-image: linear-gradient(180deg, rgba(190, 224, 250, 0.070), rgba(255,255,255,0.016)) !important;\n      border-left: 1px solid rgba(195, 225, 249, 0.13) !important;\n      border-right: 1px solid rgba(195, 225, 249, 0.13) !important;\n      box-shadow: 0 0 68px rgba(0,0,0,0.17), inset 0 1px 0 rgba(255,255,255,0.045) !important;\n      -webkit-backdrop-filter: blur(18px) saturate(124%) !important;\n      backdrop-filter: blur(18px) saturate(124%) !important;\n    }\n\n    .us-sign-chat-thread-root > * {\n      position: relative !important;\n      z-index: 1 !important;\n    }'''

new_css = '''    /* v2.0.13: the visual snapshot confirms ChatGPT exposes a stable #thread\n       container (1630px wide in the captured desktop build) around the 768px\n       message column. Isolate only this thread stacking context so the frost is\n       guaranteed behind the messages, without touching header/main geometry. */\n    #thread {\n      position: relative !important;\n      isolation: isolate !important;\n      background: transparent !important;\n      background-image: none !important;\n    }\n\n    #thread::before {\n      content: "" !important;\n      position: absolute !important;\n      top: 0 !important;\n      bottom: 0 !important;\n      left: 50% !important;\n      width: min(920px, calc(100% - 56px)) !important;\n      transform: translateX(-50%) !important;\n      pointer-events: none !important;\n      z-index: -1 !important;\n      background: rgba(10, 23, 36, 0.50) !important;\n      background-image: linear-gradient(180deg, rgba(194, 228, 253, 0.085), rgba(255,255,255,0.018)) !important;\n      border-left: 1px solid rgba(201, 230, 252, 0.16) !important;\n      border-right: 1px solid rgba(201, 230, 252, 0.16) !important;\n      box-shadow: 0 0 72px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.055) !important;\n      -webkit-backdrop-filter: blur(20px) saturate(126%) !important;\n      backdrop-filter: blur(20px) saturate(126%) !important;\n    }'''

if old_css not in text:
    raise SystemExit("v2.0.12 thread glass CSS anchor not found")
text = text.replace(old_css, new_css, 1)

start = text.find('  /* v2.0.12: use the real full-width turn sections to find their shared')
end = text.find('  const PARALLAX_X = 5;', start)
if start == -1 or end == -1:
    raise SystemExit("v2.0.12 thread discovery runtime block not found")

replacement = '''  /* v2.0.13: no thread discovery observer is needed. The uploaded visual\n     snapshot exposes the stable native #thread container directly. */\n\n'''
text = text[:start] + replacement + text[end:]

TARGET.write_text(text, encoding="utf-8")
