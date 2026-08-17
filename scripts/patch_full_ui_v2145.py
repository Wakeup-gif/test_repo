from pathlib import Path

CANON = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
FRESH = Path('tampermonkey/US-Sign-Full-UI-Theme-v2.1.45.user.js')

text = CANON.read_text(encoding='utf-8')

if '// @version      2.1.44' not in text:
    raise SystemExit('Expected v2.1.44 canonical theme')

text = text.replace('// @version      2.1.44', '// @version      2.1.45', 1)
text = text.replace(
    'Stable SquareCoil frosted-glass UI with directly wallpaper-mapped sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    'Stable SquareCoil frosted-glass UI with one shared wallpaper behind the sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1,
)

anchor = '''  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'''
if anchor not in text:
    raise SystemExit('Could not find CSS close / Bing anchor')

patch = r'''

    /* =========================================================
       v2.1.45 ONE SHARED WALLPAPER BEHIND SIDEBAR GLASS
       v2.1.44 proved the image could be visible, but painting --us-wallpaper
       directly on #sidebar_left created a second copy. The correct layering is:
       html owns the single wallpaper, body is transparent, and the sidebar is
       only translucent glass over the same root image.
    ========================================================= */

    /* Reveal the root/html wallpaper beneath fixed side chrome instead of
       letting the body paint a gray plate across the viewport. Main/content
       surfaces already own their page-specific paint later in the cascade. */
    html body:has(#sidebar_left) {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    /* Remove the v2.1.44 second wallpaper copy. This rail now contains tint +
       frost only, so the root image flows continuously behind it. */
    html body #sidebar_left {
      background:
        linear-gradient(180deg,
          rgba(7, 22, 35, 0.31) 0%,
          rgba(5, 18, 30, 0.25) 52%,
          rgba(4, 14, 24, 0.31) 100%) !important;
      background-color: rgba(5, 17, 28, 0.20) !important;
      background-image:
        linear-gradient(180deg,
          rgba(7, 22, 35, 0.31) 0%,
          rgba(5, 18, 30, 0.25) 52%,
          rgba(4, 14, 24, 0.31) 100%) !important;
      background-attachment: scroll !important;
      -webkit-backdrop-filter: blur(8px) saturate(120%) brightness(0.96) !important;
      backdrop-filter: blur(8px) saturate(120%) brightness(0.96) !important;
      border-right-color: rgba(171, 215, 248, 0.09) !important;
      box-shadow:
        6px 0 22px rgba(0, 0, 0, 0.07),
        inset -1px 0 0 rgba(255, 255, 255, 0.022) !important;
    }

    /* Inner rail elements remain paint-free. */
    html body #sidebar_left .sidebar-left-content,
    html body #sidebar_left .sidebar-menu,
    html body #sidebar_left .nav.sidebar-menu,
    html body #sidebar_left .sidebar-menu > li,
    html body #sidebar_left .nav.sidebar-menu > li {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

'''

text = text.replace(anchor, patch + anchor, 1)

CANON.write_text(text, encoding='utf-8')
FRESH.write_text(text, encoding='utf-8')
print('Patched Full UI Theme to v2.1.45')
