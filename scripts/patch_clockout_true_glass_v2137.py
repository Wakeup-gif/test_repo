from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'tampermonkey' / 'US-Sign-Full-UI-Theme.user.js'
s = p.read_text()

if '@version      2.1.36' not in s:
    raise SystemExit('expected v2.1.36')

s = s.replace('@version      2.1.36', '@version      2.1.37', 1)
s = s.replace(
    'Stable SquareCoil frosted-glass UI with native-structure Status and fully frosted Clock Out dialogs, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    'Stable SquareCoil frosted-glass UI with native-structure Status and true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1,
)

old_overlay = '''    #modal-overlay.duplicate-modal-2 {\n      box-sizing: border-box !important;\n      padding: clamp(48px, 12vh, 132px) 24px 28px !important;\n      overflow: auto !important;\n      background: rgba(3, 8, 14, 0.32) !important;\n      background-image:\n        radial-gradient(circle at 50% 34%, rgba(76, 151, 214, 0.055), transparent 42%),\n        linear-gradient(180deg, rgba(7, 18, 29, 0.055), rgba(2, 6, 10, 0.12)) !important;\n      -webkit-backdrop-filter: blur(8px) saturate(92%) brightness(0.78) !important;\n      backdrop-filter: blur(8px) saturate(92%) brightness(0.78) !important;\n    }'''
new_overlay = '''    #modal-overlay.duplicate-modal-2 {\n      box-sizing: border-box !important;\n      padding: clamp(48px, 12vh, 132px) 24px 28px !important;\n      overflow: auto !important;\n      background: rgba(3, 8, 14, 0.18) !important;\n      background-image:\n        radial-gradient(circle at 50% 34%, rgba(94, 174, 238, 0.040), transparent 46%),\n        linear-gradient(180deg, rgba(7, 18, 29, 0.025), rgba(2, 6, 10, 0.060)) !important;\n      -webkit-backdrop-filter: blur(14px) saturate(108%) brightness(0.80) !important;\n      backdrop-filter: blur(14px) saturate(108%) brightness(0.80) !important;\n    }'''
if old_overlay not in s:
    raise SystemExit('overlay block not found')
s = s.replace(old_overlay, new_overlay, 1)

old_panel = '''      background:\n        linear-gradient(145deg, rgba(166, 218, 255, 0.085), transparent 34%),\n        linear-gradient(180deg, rgba(12, 25, 39, 0.49), rgba(5, 12, 20, 0.38)) !important;\n      background-color: rgba(7, 15, 24, 0.46) !important;\n      border: 1px solid rgba(198, 228, 251, 0.20) !important;\n      border-radius: 16px !important;\n      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.070) !important;'''
new_panel = '''      background:\n        linear-gradient(145deg, rgba(205, 236, 255, 0.095), transparent 34%),\n        linear-gradient(180deg, rgba(24, 48, 68, 0.18), rgba(6, 14, 23, 0.12)) !important;\n      background-color: rgba(8, 18, 29, 0.16) !important;\n      border: 1px solid rgba(210, 236, 255, 0.24) !important;\n      border-radius: 16px !important;\n      box-shadow:\n        0 20px 52px rgba(0, 0, 0, 0.20),\n        inset 0 1px 0 rgba(255, 255, 255, 0.12),\n        inset 0 0 0 1px rgba(255, 255, 255, 0.025) !important;'''
if old_panel not in s:
    raise SystemExit('panel paint block not found')
s = s.replace(old_panel, new_panel, 1)

old_blur = '''      #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {\n        -webkit-backdrop-filter: blur(22px) saturate(142%) brightness(0.97) !important;\n        backdrop-filter: blur(22px) saturate(142%) brightness(0.97) !important;\n      }'''
new_blur = '''      #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {\n        /* The full-screen overlay already owns the Gaussian blur. Keeping the\n           dialog itself filter-free avoids Chrome's nested-backdrop root, which\n           was making the panel read as a dark slab instead of transparent glass. */\n        -webkit-backdrop-filter: none !important;\n        backdrop-filter: none !important;\n      }'''
if old_blur not in s:
    raise SystemExit('modal blur block not found')
s = s.replace(old_blur, new_blur, 1)

old_comment = '''    /* v2.1.36: the overlay itself blurs/dims the page, while the dialog uses a\n       stronger local frost so the wallpaper remains visible as soft color rather\n       than reading as a flat dark modal. */'''
new_comment = '''    /* v2.1.37: one Gaussian backdrop layer only. The overlay blurs the live page;\n       the dialog is deliberately low-opacity glass so that blurred page color and\n       structure remain visibly present through the surface. */'''
if old_comment not in s:
    raise SystemExit('v2.1.36 comment not found')
s = s.replace(old_comment, new_comment, 1)

p.write_text(s)
