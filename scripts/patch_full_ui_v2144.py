from pathlib import Path

CANON = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
FRESH = Path('tampermonkey/US-Sign-Full-UI-Theme-v2.1.44.user.js')

text = CANON.read_text(encoding='utf-8')

if '// @version      2.1.43' not in text:
    raise SystemExit('Expected v2.1.43 canonical theme')

text = text.replace('// @version      2.1.43', '// @version      2.1.44', 1)
text = text.replace(
    'Stable SquareCoil frosted-glass UI with wallpaper-visible sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    'Stable SquareCoil frosted-glass UI with directly wallpaper-mapped sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1,
)

anchor = '''  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'''
if anchor not in text:
    raise SystemExit('Could not find CSS close / Bing anchor')

patch = r'''

    /* =========================================================
       v2.1.44 SIDEBAR DIRECT WALLPAPER MAPPING
       Backdrop-filter alone was compositing against SquareCoil's painted body
       layer, so the sidebar looked like flat gray even when its alpha was low.
       Paint the same live --us-wallpaper directly on the sidebar, with the
       same viewport-fixed position/size as the page, then add only a restrained
       dark tint. This guarantees the photo remains visible and aligned.
    ========================================================= */

    html body #sidebar_left {
      background-color: rgba(5, 14, 23, 0.18) !important;
      background-image:
        linear-gradient(180deg,
          rgba(5, 17, 28, 0.34) 0%,
          rgba(4, 14, 24, 0.28) 52%,
          rgba(3, 11, 20, 0.34) 100%),
        var(--us-wallpaper) !important;
      background-position:
        center center,
        var(--us-wallpaper-x, 50%) var(--us-wallpaper-y, 50%) !important;
      background-size:
        auto,
        var(--us-wallpaper-size, cover) !important;
      background-repeat: no-repeat, no-repeat !important;
      background-attachment: fixed, fixed !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      border-right-color: rgba(171, 215, 248, 0.10) !important;
      box-shadow:
        7px 0 24px rgba(0, 0, 0, 0.08),
        inset -1px 0 0 rgba(255, 255, 255, 0.025) !important;
    }

    /* Nothing inside the rail gets to repaint a gray plate over the photo. */
    html body #sidebar_left,
    html body #sidebar_left .sidebar-left-content,
    html body #sidebar_left .sidebar-menu,
    html body #sidebar_left .nav.sidebar-menu,
    html body #sidebar_left .sidebar-menu > li,
    html body #sidebar_left .nav.sidebar-menu > li {
      background-color: transparent !important;
    }

    html body #sidebar_left .sidebar-left-content,
    html body #sidebar_left .sidebar-menu,
    html body #sidebar_left .nav.sidebar-menu,
    html body #sidebar_left .sidebar-menu > li,
    html body #sidebar_left .nav.sidebar-menu > li {
      background-image: none !important;
    }

    /* Re-apply the photo/tint to the owning rail after the transparency reset. */
    html body #sidebar_left {
      background-color: rgba(5, 14, 23, 0.18) !important;
      background-image:
        linear-gradient(180deg,
          rgba(5, 17, 28, 0.34) 0%,
          rgba(4, 14, 24, 0.28) 52%,
          rgba(3, 11, 20, 0.34) 100%),
        var(--us-wallpaper) !important;
    }

'''

text = text.replace(anchor, patch + anchor, 1)

CANON.write_text(text, encoding='utf-8')
FRESH.write_text(text, encoding='utf-8')
print('Patched Full UI Theme to v2.1.44')
