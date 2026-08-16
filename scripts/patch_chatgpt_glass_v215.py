from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.14" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.14")

text = text.replace("@version      2.0.14", "@version      2.0.15", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with snapshot-audited viewport glass, resilient Bing UHD rotation, low-overhead parallax, single-layer sidebar/composer frost, improved contrast, native layout, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with top-anchored tapered reading glass, resilient Bing UHD rotation, low-overhead parallax, single-layer sidebar/composer frost, improved contrast, native layout, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV214", "window.__chatgptUsSignGlassThemeV215")

old = '''    #thread::before {\n      content: "" !important;\n      display: block !important;\n      position: sticky !important;\n      top: 60px !important;\n      align-self: center !important;\n      flex: 0 0 auto !important;\n      box-sizing: border-box !important;\n      width: min(920px, calc(100% - 56px)) !important;\n      height: calc(100dvh - 152px) !important;\n      margin-bottom: calc(-100dvh + 152px) !important;\n      pointer-events: none !important;\n      z-index: -1 !important;\n      background: rgba(10, 23, 36, 0.64) !important;\n      background-image: linear-gradient(180deg, rgba(198, 229, 252, 0.075), rgba(3, 10, 17, 0.035)) !important;\n      border: 1px solid rgba(202, 230, 251, 0.16) !important;\n      border-radius: 24px !important;\n      box-shadow: 0 20px 60px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.055) !important;\n      -webkit-backdrop-filter: blur(16px) saturate(120%) !important;\n      backdrop-filter: blur(16px) saturate(120%) !important;\n    }'''

new = '''    /* v2.0.15: make the reading atmosphere meet the top of the viewport instead\n       of reading like a floating card. The elliptical mask keeps the center\n       opaque enough for text while progressively tapering the side/lower frost. */\n    #thread::before {\n      content: "" !important;\n      display: block !important;\n      position: sticky !important;\n      top: 0 !important;\n      align-self: center !important;\n      flex: 0 0 auto !important;\n      box-sizing: border-box !important;\n      width: min(1000px, calc(100% - 32px)) !important;\n      height: calc(100dvh - 92px) !important;\n      margin-bottom: calc(-100dvh + 92px) !important;\n      pointer-events: none !important;\n      z-index: -1 !important;\n      background: rgba(10, 23, 36, 0.64) !important;\n      background-image: linear-gradient(180deg, rgba(198, 229, 252, 0.072), rgba(3, 10, 17, 0.055)) !important;\n      border: 0 !important;\n      border-radius: 0 0 32px 32px !important;\n      box-shadow: 0 22px 68px rgba(0,0,0,0.14) !important;\n      -webkit-backdrop-filter: blur(16px) saturate(120%) !important;\n      backdrop-filter: blur(16px) saturate(120%) !important;\n      -webkit-mask-image: radial-gradient(ellipse 55% 125% at 50% 0%, #000 0%, #000 60%, rgba(0,0,0,0.96) 69%, rgba(0,0,0,0.72) 80%, rgba(0,0,0,0.38) 90%, transparent 100%) !important;\n      mask-image: radial-gradient(ellipse 55% 125% at 50% 0%, #000 0%, #000 60%, rgba(0,0,0,0.96) 69%, rgba(0,0,0,0.72) 80%, rgba(0,0,0,0.38) 90%, transparent 100%) !important;\n    }'''

if old not in text:
    raise SystemExit("v2.0.14 thread glass block not found")
text = text.replace(old, new, 1)

old_mobile = '''      #thread::before {\n        top: 52px !important;\n        width: calc(100% - 18px) !important;\n        height: calc(100dvh - 132px) !important;\n        margin-bottom: calc(-100dvh + 132px) !important;\n        border-radius: 16px !important;\n        background: rgba(10, 23, 36, 0.70) !important;\n        -webkit-backdrop-filter: blur(10px) saturate(112%) !important;\n        backdrop-filter: blur(10px) saturate(112%) !important;\n      }'''

new_mobile = '''      #thread::before {\n        top: 0 !important;\n        width: calc(100% - 6px) !important;\n        height: calc(100dvh - 78px) !important;\n        margin-bottom: calc(-100dvh + 78px) !important;\n        border-radius: 0 0 22px 22px !important;\n        background: rgba(10, 23, 36, 0.70) !important;\n        -webkit-backdrop-filter: blur(10px) saturate(112%) !important;\n        backdrop-filter: blur(10px) saturate(112%) !important;\n        -webkit-mask-image: radial-gradient(ellipse 62% 128% at 50% 0%, #000 0%, #000 64%, rgba(0,0,0,0.90) 75%, rgba(0,0,0,0.50) 90%, transparent 100%) !important;\n        mask-image: radial-gradient(ellipse 62% 128% at 50% 0%, #000 0%, #000 64%, rgba(0,0,0,0.90) 75%, rgba(0,0,0,0.50) 90%, transparent 100%) !important;\n      }'''

if old_mobile not in text:
    raise SystemExit("v2.0.14 mobile thread glass block not found")
text = text.replace(old_mobile, new_mobile, 1)

TARGET.write_text(text, encoding="utf-8")
