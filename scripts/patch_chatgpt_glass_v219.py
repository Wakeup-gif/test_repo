from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.18" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.18")

text = text.replace("@version      2.0.18", "@version      2.0.19", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with bottom-continuous tapered reading glass, resilient Bing UHD rotation, direct-rule low-overhead parallax, single-layer sidebar/composer frost, improved contrast, native layout, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with cached Gaussian reading glass, resilient Bing UHD rotation, smooth low-overhead parallax, lightweight persistent surfaces, improved contrast, native layout, and a cutout geometric cursor.",
    1,
)
text = text.replace(
    "if (window.__chatgptUsSignGlassThemeV218) return;\n  window.__chatgptUsSignGlassThemeV218 = true;",
    "if (window.__chatgptUsSignGlassThemeV219) return;\n  window.__chatgptUsSignGlassThemeV219 = true;",
    1,
)

panel_pattern = re.compile(
    r"    /\* v2\.0\.17: the rear glass.*?^    #thread::before \{.*?^    \}\n",
    re.S | re.M,
)
new_panel = '''    /* v2.0.19: real Gaussian-style frost without live backdrop-filter. The\n       panel owns a duplicate of the current Bing image and blurs that cached\n       image directly. The moving wallpaper underneath is no longer re-blurred\n       every pointer frame. The layer extends past both viewport edges so no\n       footer/disclaimer seam can become visible. */\n    #thread::before {\n      content: "" !important;\n      display: block !important;\n      position: sticky !important;\n      top: -28px !important;\n      align-self: center !important;\n      flex: 0 0 auto !important;\n      box-sizing: border-box !important;\n      width: min(1040px, calc(100% - 24px)) !important;\n      height: calc(100dvh + 56px) !important;\n      margin-bottom: calc(-100dvh - 56px) !important;\n      pointer-events: none !important;\n      z-index: -1 !important;\n      background-image:\n        linear-gradient(180deg, rgba(8, 18, 29, 0.55), rgba(5, 14, 24, 0.66)),\n        var(--us-wallpaper) !important;\n      background-position: center, center !important;\n      background-size: auto, cover !important;\n      background-repeat: no-repeat !important;\n      border: 0 !important;\n      border-radius: 0 !important;\n      box-shadow: none !important;\n      -webkit-backdrop-filter: none !important;\n      backdrop-filter: none !important;\n      -webkit-filter: blur(14px) saturate(114%) brightness(0.92) !important;\n      filter: blur(14px) saturate(114%) brightness(0.92) !important;\n      transform: translateZ(0) scale(1.028) !important;\n      backface-visibility: hidden !important;\n      contain: paint !important;\n      -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 3%, rgba(0,0,0,0.62) 9%, #000 17%, #000 83%, rgba(0,0,0,0.62) 91%, rgba(0,0,0,0.18) 97%, transparent 100%) !important;\n      mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 3%, rgba(0,0,0,0.62) 9%, #000 17%, #000 83%, rgba(0,0,0,0.62) 91%, rgba(0,0,0,0.18) 97%, transparent 100%) !important;\n    }\n'''
text, count = panel_pattern.subn(new_panel, text, count=1)
if count != 1:
    raise SystemExit("v2.0.18 thread panel block not found")

# Persistent surfaces must not ask Chrome to recompute backdrop blur while the
# wallpaper moves. Keep the visual glass tone with opacity/gradients instead.
text = text.replace(
    "      background: rgba(22, 38, 53, 0.46) !important;",
    "      background: rgba(22, 38, 53, 0.64) !important;",
    1,
)
text = text.replace(
    "      -webkit-backdrop-filter: blur(14px) saturate(116%) !important;\n      backdrop-filter: blur(14px) saturate(116%) !important;",
    "      -webkit-backdrop-filter: none !important;\n      backdrop-filter: none !important;",
    1,
)

text = text.replace(
    "      background: rgba(20, 34, 48, 0.62) !important;",
    "      background: rgba(20, 34, 48, 0.74) !important;",
    1,
)
text = text.replace(
    "      -webkit-backdrop-filter: blur(12px) saturate(118%) !important;\n      backdrop-filter: blur(12px) saturate(118%) !important;",
    "      -webkit-backdrop-filter: none !important;\n      backdrop-filter: none !important;",
    1,
)

composer_pattern = re.compile(
    r'(form\[class\*="group/composer"\] \[class\*="bg-\(--composer-surface-primary\)"\] \{.*?background: )rgba\(15, 28, 40, 0\.70\)(.*?-webkit-backdrop-filter: )blur\(14px\) saturate\(120%\)( !important;\n      backdrop-filter: )blur\(14px\) saturate\(120%\)( !important;)',
    re.S,
)
def composer_repl(m):
    return m.group(1) + 'rgba(15, 28, 40, 0.80)' + m.group(2) + 'none' + m.group(3) + 'none' + m.group(4)
text, count = composer_pattern.subn(composer_repl, text, count=1)
if count != 1:
    raise SystemExit("composer persistent blur block not found")

# Mobile: keep the same self-blurred duplicate-image architecture, just with a
# smaller radius and broader mask for the narrow viewport.
mobile_pattern = re.compile(
    r'      #thread::before \{\n        top: 0 !important;.*?^      \}',
    re.S | re.M,
)
new_mobile = '''      #thread::before {\n        top: -18px !important;\n        width: calc(100% - 2px) !important;\n        height: calc(100dvh + 36px) !important;\n        margin-bottom: calc(-100dvh - 36px) !important;\n        border-radius: 0 !important;\n        -webkit-backdrop-filter: none !important;\n        backdrop-filter: none !important;\n        -webkit-filter: blur(10px) saturate(110%) brightness(0.92) !important;\n        filter: blur(10px) saturate(110%) brightness(0.92) !important;\n        transform: translateZ(0) scale(1.022) !important;\n        -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.42) 3%, #000 11%, #000 89%, rgba(0,0,0,0.42) 97%, transparent 100%) !important;\n        mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.42) 3%, #000 11%, #000 89%, rgba(0,0,0,0.42) 97%, transparent 100%) !important;\n      }'''
text, count = mobile_pattern.subn(new_mobile, text, count=1)
if count != 1:
    raise SystemExit("mobile thread panel block not found")

text = text.replace("  const PARALLAX_X_PX = 9;", "  const PARALLAX_X_PX = 6;", 1)
text = text.replace("  const PARALLAX_Y_PX = 5;", "  const PARALLAX_Y_PX = 4;", 1)
text = text.replace("  let lastPointerX = -9999;\n  let lastPointerY = -9999;\n", "", 1)

old_pointer = '''    window.addEventListener("pointermove", (event) => {\n      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;\n      if (Math.abs(event.clientX - lastPointerX) < 2 && Math.abs(event.clientY - lastPointerY) < 2) return;\n      lastPointerX = event.clientX;\n      lastPointerY = event.clientY;\n\n      const nx = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;\n      const ny = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;\n      pendingShiftX = -(nx * PARALLAX_X_PX);\n      pendingShiftY = -(ny * PARALLAX_Y_PX);\n      queueParallax();\n    }, { passive: true });'''
new_pointer = '''    window.addEventListener("pointermove", (event) => {\n      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;\n      const coalesced = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : null;\n      const sample = coalesced && coalesced.length ? coalesced[coalesced.length - 1] : event;\n      const nx = (sample.clientX / Math.max(1, window.innerWidth)) * 2 - 1;\n      const ny = (sample.clientY / Math.max(1, window.innerHeight)) * 2 - 1;\n      pendingShiftX = -(nx * PARALLAX_X_PX);\n      pendingShiftY = -(ny * PARALLAX_Y_PX);\n      queueParallax();\n    }, { passive: true });'''
if old_pointer not in text:
    raise SystemExit("v2.0.18 pointermove block not found")
text = text.replace(old_pointer, new_pointer, 1)

text = text.replace(
    "  /* v2.0.17: pointer motion is sampled once per animation frame, but the\n     transform is written directly to the one html::before CSS rule instead of\n     mutating an inherited root custom property across the entire ChatGPT tree. */",
    "  /* v2.0.19: the latest coalesced pointer sample is committed once per\n     animation frame. No 2px dead-zone quantization, no easing loop, and no\n     live backdrop-filter surfaces underneath the moving 4K wallpaper. */",
    1,
)

TARGET.write_text(text, encoding="utf-8")
