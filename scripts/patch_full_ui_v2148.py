from pathlib import Path

CANON = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
FRESH = Path('tampermonkey/US-Sign-Full-UI-Theme-v2.1.48.user.js')

text = CANON.read_text(encoding='utf-8')

if '// @version      2.1.47' not in text:
    raise SystemExit('Expected v2.1.47 canonical theme')

text = text.replace('// @version      2.1.47', '// @version      2.1.48', 1)
text = text.replace(
    'Stable SquareCoil frosted-glass UI with clean collapsed-sidebar controls, one shared wallpaper behind sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    'Stable SquareCoil frosted-glass UI with a dedicated usable collapsed-sidebar toggle row, one shared wallpaper behind sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1,
)

anchor = '''  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'''
if anchor not in text:
    raise SystemExit('Could not find CSS close / Bing anchor')

patch = r'''

    /* =========================================================
       v2.1.48 COLLAPSED SIDEBAR USABLE TOGGLE ROW
       v2.1.47 hid the real working navbar toggle and relied on the native
       bottom mini-toggle. In this deployment that left no practical way to
       restore the expanded rail. Re-show the real #toggle_sidemenu_l only in
       the minified state, move it into a dedicated row directly below the
       60px navbar, and reserve matching space above the first nav item.
    ========================================================= */

    body.sb-l-m header.navbar #toggle_sidemenu_l,
    body.sb-l-m .navbar #toggle_sidemenu_l,
    html.sb-l-m body header.navbar #toggle_sidemenu_l,
    html.sb-l-m body .navbar #toggle_sidemenu_l {
      display: flex !important;
      visibility: visible !important;
      pointer-events: auto !important;
      position: fixed !important;
      top: 68px !important;
      left: 11px !important;
      right: auto !important;
      z-index: 1042 !important;
      width: 38px !important;
      min-width: 38px !important;
      max-width: 38px !important;
      height: 34px !important;
      min-height: 34px !important;
      max-height: 34px !important;
      margin: 0 !important;
      padding: 0 !important;
      align-items: center !important;
      justify-content: center !important;
      line-height: 1 !important;
      color: rgba(224, 234, 242, 0.86) !important;
      background: rgba(7, 18, 29, 0.34) !important;
      border: 1px solid rgba(190, 220, 243, 0.10) !important;
      border-radius: 8px !important;
      box-shadow: 0 5px 16px rgba(0, 0, 0, 0.11), inset 0 1px 0 rgba(255,255,255,0.025) !important;
      transform: none !important;
      cursor: pointer !important;
    }

    body.sb-l-m header.navbar #toggle_sidemenu_l:hover,
    body.sb-l-m .navbar #toggle_sidemenu_l:hover,
    html.sb-l-m body header.navbar #toggle_sidemenu_l:hover,
    html.sb-l-m body .navbar #toggle_sidemenu_l:hover {
      color: #fff !important;
      background: rgba(46, 109, 159, 0.24) !important;
      border-color: rgba(150, 205, 245, 0.18) !important;
    }

    /* Reserve a real control row so Dashboard can never share the same y-space. */
    body.sb-l-m #sidebar_left .sidebar-menu,
    body.sb-l-m #sidebar_left .nav.sidebar-menu,
    html.sb-l-m body #sidebar_left .sidebar-menu,
    html.sb-l-m body #sidebar_left .nav.sidebar-menu {
      padding-top: 44px !important;
    }

    /* Keep the functional toggle icon centered regardless of native float/line-height rules. */
    body.sb-l-m #toggle_sidemenu_l > *,
    html.sb-l-m body #toggle_sidemenu_l > * {
      margin: 0 !important;
      padding: 0 !important;
      line-height: 1 !important;
      transform: none !important;
    }

'''

text = text.replace(anchor, patch + anchor, 1)

CANON.write_text(text, encoding='utf-8')
FRESH.write_text(text, encoding='utf-8')
print('Patched Full UI Theme to v2.1.48')
