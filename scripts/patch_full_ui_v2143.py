from pathlib import Path

CANON = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
FRESH = Path('tampermonkey/US-Sign-Full-UI-Theme-v2.1.43.user.js')

text = CANON.read_text(encoding='utf-8')
if '@version      2.1.42' not in text:
    raise SystemExit('Expected Full UI v2.1.42 canonical')

text = text.replace('@version      2.1.42', '@version      2.1.43', 1)
text = text.replace(
    'Stable SquareCoil frosted-glass UI with refined sidebar transparency/alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    'Stable SquareCoil frosted-glass UI with wallpaper-visible sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1
)

old = '''    html body #sidebar_left {
      background:
        radial-gradient(circle at 7% 8%, rgba(76, 165, 230, 0.105), transparent 36%),
        linear-gradient(180deg,
          rgba(7, 25, 41, 0.54) 0%,
          rgba(5, 18, 31, 0.48) 48%,
          rgba(3, 13, 23, 0.52) 100%) !important;
      background-color: rgba(5, 18, 30, 0.50) !important;
      border-right-color: rgba(156, 208, 250, 0.085) !important;
      box-shadow:
        8px 0 26px rgba(0, 0, 0, 0.075),
        inset -1px 0 0 rgba(255, 255, 255, 0.020),
        inset 0 1px 0 rgba(125, 192, 244, 0.020) !important;
      -webkit-backdrop-filter: blur(13px) saturate(130%) !important;
      backdrop-filter: blur(13px) saturate(130%) !important;
    }
'''
new = '''    html body #sidebar_left {
      background:
        radial-gradient(circle at 7% 8%, rgba(76, 165, 230, 0.060), transparent 36%),
        linear-gradient(180deg,
          rgba(7, 25, 41, 0.24) 0%,
          rgba(5, 18, 31, 0.18) 48%,
          rgba(3, 13, 23, 0.22) 100%) !important;
      background-color: rgba(5, 18, 30, 0.10) !important;
      border-right-color: rgba(156, 208, 250, 0.070) !important;
      box-shadow:
        7px 0 24px rgba(0, 0, 0, 0.060),
        inset -1px 0 0 rgba(255, 255, 255, 0.018),
        inset 0 1px 0 rgba(125, 192, 244, 0.018) !important;
      -webkit-backdrop-filter: blur(9px) saturate(122%) brightness(0.96) !important;
      backdrop-filter: blur(9px) saturate(122%) brightness(0.96) !important;
    }

    /* Native sidebar wrappers must not repaint an opaque gray layer over the
       wallpaper. Let #sidebar_left own the single glass surface. */
    html body #sidebar_left .sidebar-left-content,
    html body #sidebar_left .sidebar-menu,
    html body #sidebar_left .nav.sidebar-menu {
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }
'''
if old not in text:
    raise SystemExit('Sidebar v2.1.42 block not found')
text = text.replace(old, new, 1)

marker = '       v2.1.42 LEFT SIDEBAR GLASS + ALIGNMENT POLISH'
if marker not in text:
    raise SystemExit('Sidebar marker missing')
text = text.replace(marker, '       v2.1.43 LEFT SIDEBAR WALLPAPER-VISIBLE GLASS + ALIGNMENT', 1)

CANON.write_text(text, encoding='utf-8')
FRESH.write_text(text, encoding='utf-8')
print('Patched Full UI to v2.1.43')
