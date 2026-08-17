from pathlib import Path

CANON = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
FRESH = Path('tampermonkey/US-Sign-Full-UI-Theme-v2.1.47.user.js')

text = CANON.read_text(encoding='utf-8')

if '// @version      2.1.46' not in text:
    raise SystemExit('Expected v2.1.46 canonical theme')

text = text.replace('// @version      2.1.46', '// @version      2.1.47', 1)
text = text.replace(
    'Stable SquareCoil frosted-glass UI with the native gray main pseudo-layer removed so one shared wallpaper can show behind sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    'Stable SquareCoil frosted-glass UI with clean collapsed-sidebar controls, one shared wallpaper behind sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1,
)

anchor = '''  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'''
if anchor not in text:
    raise SystemExit('Could not find CSS close / Bing anchor')

patch = r'''

    /* =========================================================
       v2.1.47 COLLAPSED SIDEBAR TOGGLE SEPARATION
       SquareCoil exposes two left-nav controls: the navbar toggle
       (#toggle_sidemenu_l) and the dedicated mini-rail toggle
       (.sidebar-toggle-mini). In sb-l-m the navbar toggle's 45px box can
       visually collide with the first Dashboard icon. Keep the navbar toggle
       for the expanded rail, but remove it from the minified state and make
       the dedicated bottom mini-toggle the single restore control.
    ========================================================= */

    body.sb-l-m header.navbar #toggle_sidemenu_l,
    body.sb-l-m .navbar #toggle_sidemenu_l,
    html.sb-l-m body header.navbar #toggle_sidemenu_l,
    html.sb-l-m body .navbar #toggle_sidemenu_l {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /* Keep the Dashboard/home row completely independent of collapse chrome. */
    body.sb-l-m #sidebar_left .sidebar-menu > li:first-of-type > a,
    html.sb-l-m body #sidebar_left .sidebar-menu > li:first-of-type > a {
      position: relative !important;
      z-index: 1 !important;
    }

    /* The native mini toggle is the purpose-built control for the collapsed
       rail. Give it an explicit 60px lane and a centered click target so its
       geometry cannot drift back into menu-item space. */
    body.sb-l-m #sidebar_left .sidebar-toggle-mini,
    html.sb-l-m body #sidebar_left .sidebar-toggle-mini {
      display: block !important;
      width: 60px !important;
      height: 36px !important;
      margin: 18px 0 0 !important;
      padding: 0 !important;
      position: relative !important;
      left: 0 !important;
      right: auto !important;
      clear: both !important;
    }

    body.sb-l-m #sidebar_left .sidebar-toggle-mini > a,
    html.sb-l-m body #sidebar_left .sidebar-toggle-mini > a {
      position: static !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 60px !important;
      height: 36px !important;
      min-height: 36px !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    body.sb-l-m #sidebar_left .sidebar-toggle-mini > a > span,
    html.sb-l-m body #sidebar_left .sidebar-toggle-mini > a > span {
      margin: 0 !important;
      position: static !important;
    }

'''

text = text.replace(anchor, patch + anchor, 1)

CANON.write_text(text, encoding='utf-8')
FRESH.write_text(text, encoding='utf-8')
print('Patched Full UI Theme to v2.1.47')
