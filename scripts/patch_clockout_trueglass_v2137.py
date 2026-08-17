from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'tampermonkey' / 'US-Sign-Full-UI-Theme.user.js'
s = p.read_text()

if '@version      2.1.36' not in s:
    raise SystemExit('expected v2.1.36')

s = s.replace('@version      2.1.36', '@version      2.1.37', 1)
s = s.replace(
    'Stable SquareCoil frosted-glass UI with native-structure Status and fully frosted Clock Out dialogs, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    'Stable SquareCoil frosted-glass UI with native-structure Status and transparent true-glass Clock Out dialogs, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1,
)

old_overlay = '''    #modal-overlay.duplicate-modal-2 {\n      box-sizing: border-box !important;\n      padding: clamp(48px, 12vh, 132px) 24px 28px !important;\n      overflow: auto !important;\n      background: rgba(3, 8, 14, 0.32) !important;\n      background-image:\n        radial-gradient(circle at 50% 34%, rgba(76, 151, 214, 0.055), transparent 42%),\n        linear-gradient(180deg, rgba(7, 18, 29, 0.055), rgba(2, 6, 10, 0.12)) !important;\n      -webkit-backdrop-filter: blur(8px) saturate(92%) brightness(0.78) !important;\n      backdrop-filter: blur(8px) saturate(92%) brightness(0.78) !important;\n    }'''
new_overlay = '''    #modal-overlay.duplicate-modal-2 {\n      box-sizing: border-box !important;\n      padding: clamp(48px, 12vh, 132px) 24px 28px !important;\n      overflow: auto !important;\n      background: rgba(3, 8, 14, 0.12) !important;\n      background-image:\n        radial-gradient(circle at 50% 34%, rgba(103, 181, 240, 0.045), transparent 44%),\n        linear-gradient(180deg, rgba(7, 18, 29, 0.025), rgba(2, 6, 10, 0.065)) !important;\n      -webkit-backdrop-filter: blur(14px) saturate(96%) brightness(0.72) !important;\n      backdrop-filter: blur(14px) saturate(96%) brightness(0.72) !important;\n    }'''
if old_overlay not in s:
    raise SystemExit('overlay block not found')
s = s.replace(old_overlay, new_overlay, 1)

old_panel = '''      background:\n        linear-gradient(145deg, rgba(166, 218, 255, 0.085), transparent 34%),\n        linear-gradient(180deg, rgba(12, 25, 39, 0.49), rgba(5, 12, 20, 0.38)) !important;\n      background-color: rgba(7, 15, 24, 0.46) !important;\n      border: 1px solid rgba(198, 228, 251, 0.20) !important;\n      border-radius: 16px !important;\n      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.070) !important;'''
new_panel = '''      background:\n        linear-gradient(145deg, rgba(210, 238, 255, 0.090), transparent 34%),\n        linear-gradient(180deg, rgba(20, 39, 58, 0.15), rgba(7, 16, 26, 0.10)) !important;\n      background-color: rgba(8, 18, 29, 0.12) !important;\n      border: 1px solid rgba(211, 236, 255, 0.23) !important;\n      border-radius: 16px !important;\n      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.10) !important;'''
if old_panel not in s:
    raise SystemExit('panel paint block not found')
s = s.replace(old_panel, new_panel, 1)

old_local_blur = '''      #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {\n        -webkit-backdrop-filter: blur(22px) saturate(142%) brightness(0.97) !important;\n        backdrop-filter: blur(22px) saturate(142%) brightness(0.97) !important;\n      }'''
new_local_blur = '''      #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {\n        -webkit-backdrop-filter: none !important;\n        backdrop-filter: none !important;\n      }'''
if old_local_blur not in s:
    raise SystemExit('local blur block not found')
s = s.replace(old_local_blur, new_local_blur, 1)

old_note = '''    /* v2.1.36: the overlay itself blurs/dims the page, while the dialog uses a\n       stronger local frost so the wallpaper remains visible as soft color rather\n       than reading as a flat dark modal. */\n    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {\n      isolation: isolate !important;\n    }'''
new_note = '''    /* v2.1.37: avoid nested backdrop filters. The overlay owns the Gaussian\n       page blur; the dialog is intentionally translucent so the already-blurred\n       page remains visible through it as real glass rather than a navy slab. */\n    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {\n      isolation: auto !important;\n    }'''
if old_note not in s:
    raise SystemExit('v2.1.36 note block not found')
s = s.replace(old_note, new_note, 1)

old_controls = '''      background: rgba(255, 255, 255, 0.035) !important;\n      border: 1px solid rgba(205, 229, 247, 0.13) !important;'''
new_controls = '''      background: rgba(255, 255, 255, 0.055) !important;\n      border: 1px solid rgba(214, 236, 252, 0.16) !important;'''
if old_controls in s:
    s = s.replace(old_controls, new_controls, 1)

p.write_text(s)
