from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'tampermonkey' / 'US-Sign-Full-UI-Theme.user.js'
s = p.read_text()

if '@version      2.1.35' not in s:
    raise SystemExit('expected v2.1.35')

s = s.replace('@version      2.1.35', '@version      2.1.36', 1)
s = s.replace(
    'Stable SquareCoil frosted-glass UI with native-structure Status and Clock Out dialogs, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    'Stable SquareCoil frosted-glass UI with native-structure Status and fully frosted Clock Out dialogs, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1,
)

old_overlay = '''    #modal-overlay.duplicate-modal-2 {\n      box-sizing: border-box !important;\n      padding: clamp(48px, 12vh, 132px) 24px 28px !important;\n      overflow: auto !important;\n      background: rgba(3, 8, 14, 0.56) !important;\n      background-image: linear-gradient(180deg, rgba(7, 18, 29, 0.10), rgba(2, 6, 10, 0.18)) !important;\n    }'''
new_overlay = '''    #modal-overlay.duplicate-modal-2 {\n      box-sizing: border-box !important;\n      padding: clamp(48px, 12vh, 132px) 24px 28px !important;\n      overflow: auto !important;\n      background: rgba(3, 8, 14, 0.32) !important;\n      background-image:\n        radial-gradient(circle at 50% 34%, rgba(76, 151, 214, 0.055), transparent 42%),\n        linear-gradient(180deg, rgba(7, 18, 29, 0.055), rgba(2, 6, 10, 0.12)) !important;\n      -webkit-backdrop-filter: blur(8px) saturate(92%) brightness(0.78) !important;\n      backdrop-filter: blur(8px) saturate(92%) brightness(0.78) !important;\n    }'''
if old_overlay not in s:
    raise SystemExit('overlay block not found')
s = s.replace(old_overlay, new_overlay, 1)

old_panel = '''      background:\n        linear-gradient(145deg, rgba(133, 202, 255, 0.060), transparent 36%),\n        linear-gradient(180deg, rgba(10, 21, 33, 0.72), rgba(5, 12, 20, 0.62)) !important;\n      background-color: rgba(7, 15, 24, 0.68) !important;\n      border: 1px solid rgba(190, 224, 250, 0.16) !important;\n      border-radius: 16px !important;\n      box-shadow: 0 22px 54px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.050) !important;'''
new_panel = '''      background:\n        linear-gradient(145deg, rgba(166, 218, 255, 0.085), transparent 34%),\n        linear-gradient(180deg, rgba(12, 25, 39, 0.49), rgba(5, 12, 20, 0.38)) !important;\n      background-color: rgba(7, 15, 24, 0.46) !important;\n      border: 1px solid rgba(198, 228, 251, 0.20) !important;\n      border-radius: 16px !important;\n      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.070) !important;'''
if old_panel not in s:
    raise SystemExit('panel paint block not found')
s = s.replace(old_panel, new_panel, 1)

old_blur = '''        -webkit-backdrop-filter: blur(18px) saturate(132%) !important;\n        backdrop-filter: blur(18px) saturate(132%) !important;'''
new_blur = '''        -webkit-backdrop-filter: blur(22px) saturate(142%) brightness(0.97) !important;\n        backdrop-filter: blur(22px) saturate(142%) brightness(0.97) !important;'''
if old_blur not in s:
    raise SystemExit('modal blur block not found')
s = s.replace(old_blur, new_blur, 1)

marker = '''    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > br {'''
insert = '''\n    /* v2.1.36: the overlay itself blurs/dims the page, while the dialog uses a\n       stronger local frost so the wallpaper remains visible as soft color rather\n       than reading as a flat dark modal. */\n    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {\n      isolation: isolate !important;\n    }\n\n'''
if marker not in s:
    raise SystemExit('insert marker not found')
s = s.replace(marker, insert + marker, 1)

p.write_text(s)
