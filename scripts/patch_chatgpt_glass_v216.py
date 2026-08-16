from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.15" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.15")

text = text.replace("@version      2.0.15", "@version      2.0.16", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with top-anchored tapered reading glass, resilient Bing UHD rotation, low-overhead parallax, single-layer sidebar/composer frost, improved contrast, native layout, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with full-height tapered reading glass, resilient Bing UHD rotation, immediate low-overhead parallax, single-layer sidebar/composer frost, improved contrast, native layout, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV215", "window.__chatgptUsSignGlassThemeV216")

text = text.replace(
    '      transition: transform 170ms cubic-bezier(.2,.7,.2,1) !important;\n',
    '      transition: none !important;\n',
    1,
)

old_panel = '''    #thread::before {\n      content: "" !important;\n      display: block !important;\n      position: sticky !important;\n      top: 0 !important;\n      align-self: center !important;\n      flex: 0 0 auto !important;\n      box-sizing: border-box !important;\n      width: min(1000px, calc(100% - 32px)) !important;\n      height: calc(100dvh - 92px) !important;\n      margin-bottom: calc(-100dvh + 92px) !important;\n      pointer-events: none !important;\n      z-index: -1 !important;\n      background: rgba(10, 23, 36, 0.64) !important;\n      background-image: linear-gradient(180deg, rgba(198, 229, 252, 0.072), rgba(3, 10, 17, 0.055)) !important;\n      border: 0 !important;\n      border-radius: 0 0 32px 32px !important;\n      box-shadow: 0 22px 68px rgba(0,0,0,0.14) !important;\n      -webkit-backdrop-filter: blur(16px) saturate(120%) !important;\n      backdrop-filter: blur(16px) saturate(120%) !important;\n      -webkit-mask-image: radial-gradient(ellipse 55% 125% at 50% 0%, #000 0%, #000 60%, rgba(0,0,0,0.96) 69%, rgba(0,0,0,0.72) 80%, rgba(0,0,0,0.38) 90%, transparent 100%) !important;\n      mask-image: radial-gradient(ellipse 55% 125% at 50% 0%, #000 0%, #000 60%, rgba(0,0,0,0.96) 69%, rgba(0,0,0,0.72) 80%, rgba(0,0,0,0.38) 90%, transparent 100%) !important;\n    }'''

new_panel = '''    /* v2.0.16: keep the physical panel full viewport height so there is no\n       visible rectangular bottom edge. The mask itself now reaches zero near\n       the bottom center while continuing to feather the side edges. */\n    #thread::before {\n      content: "" !important;\n      display: block !important;\n      position: sticky !important;\n      top: 0 !important;\n      align-self: center !important;\n      flex: 0 0 auto !important;\n      box-sizing: border-box !important;\n      width: min(1000px, calc(100% - 32px)) !important;\n      height: 100dvh !important;\n      margin-bottom: -100dvh !important;\n      pointer-events: none !important;\n      z-index: -1 !important;\n      background: rgba(10, 23, 36, 0.64) !important;\n      background-image: linear-gradient(180deg, rgba(198, 229, 252, 0.072), rgba(3, 10, 17, 0.042)) !important;\n      border: 0 !important;\n      border-radius: 0 !important;\n      box-shadow: 0 18px 64px rgba(0,0,0,0.12) !important;\n      -webkit-backdrop-filter: blur(16px) saturate(120%) !important;\n      backdrop-filter: blur(16px) saturate(120%) !important;\n      -webkit-mask-image: radial-gradient(ellipse 58% 101% at 50% -1%, #000 0%, #000 57%, rgba(0,0,0,0.96) 68%, rgba(0,0,0,0.78) 79%, rgba(0,0,0,0.48) 89%, rgba(0,0,0,0.16) 96%, transparent 100%) !important;\n      mask-image: radial-gradient(ellipse 58% 101% at 50% -1%, #000 0%, #000 57%, rgba(0,0,0,0.96) 68%, rgba(0,0,0,0.78) 79%, rgba(0,0,0,0.48) 89%, rgba(0,0,0,0.16) 96%, transparent 100%) !important;\n    }'''

if old_panel not in text:
    raise SystemExit("v2.0.15 desktop panel block not found")
text = text.replace(old_panel, new_panel, 1)

old_mobile = '''      #thread::before {\n        top: 0 !important;\n        width: calc(100% - 6px) !important;\n        height: calc(100dvh - 78px) !important;\n        margin-bottom: calc(-100dvh + 78px) !important;\n        border-radius: 0 0 22px 22px !important;\n        background: rgba(10, 23, 36, 0.70) !important;\n        -webkit-backdrop-filter: blur(10px) saturate(112%) !important;\n        backdrop-filter: blur(10px) saturate(112%) !important;\n        -webkit-mask-image: radial-gradient(ellipse 62% 128% at 50% 0%, #000 0%, #000 64%, rgba(0,0,0,0.90) 75%, rgba(0,0,0,0.50) 90%, transparent 100%) !important;\n        mask-image: radial-gradient(ellipse 62% 128% at 50% 0%, #000 0%, #000 64%, rgba(0,0,0,0.90) 75%, rgba(0,0,0,0.50) 90%, transparent 100%) !important;\n      }'''

new_mobile = '''      #thread::before {\n        top: 0 !important;\n        width: calc(100% - 6px) !important;\n        height: 100dvh !important;\n        margin-bottom: -100dvh !important;\n        border-radius: 0 !important;\n        background: rgba(10, 23, 36, 0.70) !important;\n        -webkit-backdrop-filter: blur(10px) saturate(112%) !important;\n        backdrop-filter: blur(10px) saturate(112%) !important;\n        -webkit-mask-image: radial-gradient(ellipse 65% 101% at 50% -1%, #000 0%, #000 59%, rgba(0,0,0,0.90) 73%, rgba(0,0,0,0.52) 88%, rgba(0,0,0,0.18) 96%, transparent 100%) !important;\n        mask-image: radial-gradient(ellipse 65% 101% at 50% -1%, #000 0%, #000 59%, rgba(0,0,0,0.90) 73%, rgba(0,0,0,0.52) 88%, rgba(0,0,0,0.18) 96%, transparent 100%) !important;\n      }'''

if old_mobile not in text:
    raise SystemExit("v2.0.15 mobile panel block not found")
text = text.replace(old_mobile, new_mobile, 1)

text = text.replace(
    '''  /* v2.0.14: one JS update per pointer animation frame. CSS handles the\n     easing on the compositor; there is no recursive RAF easing loop. */\n  const PARALLAX_X_PX = 14;\n  const PARALLAX_Y_PX = 9;''',
    '''  /* v2.0.16: pointer motion is sampled once per animation frame and the\n     compositor transform is applied immediately. No CSS trailing transition\n     and no recursive easing loop. */\n  const PARALLAX_X_PX = 10;\n  const PARALLAX_Y_PX = 6;''',
    1,
)

TARGET.write_text(text, encoding="utf-8")
