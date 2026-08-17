from pathlib import Path

CANON = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
FRESH = Path('tampermonkey/US-Sign-Full-UI-Theme-v2.1.46.user.js')

text = CANON.read_text(encoding='utf-8')

if '// @version      2.1.45' not in text:
    raise SystemExit('Expected v2.1.45 canonical theme')

text = text.replace('// @version      2.1.45', '// @version      2.1.46', 1)
text = text.replace(
    'Stable SquareCoil frosted-glass UI with one shared wallpaper behind the sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    'Stable SquareCoil frosted-glass UI with the native gray main pseudo-layer removed so one shared wallpaper can show behind sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1,
)

anchor = '''  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'''
if anchor not in text:
    raise SystemExit('Could not find CSS close / Bing anchor')

patch = r'''

    /* =========================================================
       v2.1.46 SIDEBAR BACKDROP SOURCE FIX
       The sidebar audit identified the real blocker: SquareCoil's native
       #main::before is a viewport-sized fixed #eeeeee plate. Because the
       sidebar uses backdrop-filter, Chrome was blurring that gray plate,
       not the wallpaper painted on #main underneath it. Remove only that
       obsolete pseudo paint so the existing #main wallpaper becomes the
       true shared backdrop under the fixed sidebar.
    ========================================================= */

    html body #main::before {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      pointer-events: none !important;
    }

    /* Keep the sidebar itself as one restrained glass layer. With the gray
       native plate gone, this blur now samples the same #main wallpaper that
       is visible immediately to the right instead of averaging #eeeeee. */
    html body #sidebar_left {
      background:
        linear-gradient(180deg,
          rgba(7, 22, 35, 0.24) 0%,
          rgba(5, 18, 30, 0.18) 52%,
          rgba(4, 14, 24, 0.24) 100%) !important;
      background-color: rgba(5, 17, 28, 0.14) !important;
      background-image:
        linear-gradient(180deg,
          rgba(7, 22, 35, 0.24) 0%,
          rgba(5, 18, 30, 0.18) 52%,
          rgba(4, 14, 24, 0.24) 100%) !important;
      -webkit-backdrop-filter: blur(6px) saturate(116%) brightness(0.94) !important;
      backdrop-filter: blur(6px) saturate(116%) brightness(0.94) !important;
    }

'''

text = text.replace(anchor, patch + anchor, 1)

CANON.write_text(text, encoding='utf-8')
FRESH.write_text(text, encoding='utf-8')
print('Patched Full UI Theme to v2.1.46')
