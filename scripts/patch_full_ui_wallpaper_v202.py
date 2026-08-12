from pathlib import Path
import re

path = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
text = path.read_text(encoding='utf-8')

text = text.replace('// @version      2.0.1', '// @version      2.0.2', 1)
text = text.replace(
    '// @description  Blue macOS-inspired glass theme for SquareCoil with reliably loaded wallpaper, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.',
    '// @description  Blue macOS-inspired glass theme for SquareCoil with a dedicated fixed wallpaper layer, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.',
    1,
)
text = text.replace('// @grant        GM_xmlhttpRequest\n', '', 1)
text = text.replace('// @connect      www.bing.com\n', '', 1)
text = text.replace(
    '--us-wallpaper: url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1");',
    '--us-wallpaper: url("https://bing.gifposter.com/bingImages/LagoPehoe_1920x1080.jpg");',
    1,
)

# Remove the v2.0.1 GM-based loader block if present.
text = re.sub(
    r'''\n  /\* Load the supplied Bing wallpaper through Tampermonkey.*?\n  installWallpaperDataUrl\(\);\n''',
    '\n',
    text,
    flags=re.S,
)

marker = '    @media print {\n'
block = r'''    /* =========================================================
       v2.0.2 DEDICATED WALLPAPER LAYER
       Keep the image in its own fixed layer so SquareCoil's native table
       layout cannot replace the viewport background with a flat color.
    ========================================================= */

    body {
      position: relative !important;
      isolation: isolate !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    body::before {
      content: "" !important;
      position: fixed !important;
      inset: 0 !important;
      z-index: -1 !important;
      pointer-events: none !important;
      background-color: #0a1018 !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.18), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.08), transparent 34%),
        linear-gradient(rgba(4, 8, 13, 0.34), rgba(6, 11, 17, 0.62)),
        var(--us-wallpaper) !important;
      background-position: center center !important;
      background-size: cover !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
    }

    html body #main,
    html body #content_wrapper,
    html body section#content_wrapper,
    html body #content,
    html body section#content,
    html body #content.table-layout,
    html body .table-layout,
    html body #content > .tray,
    html body #content > aside.tray,
    html body #content > section.tray,
    html body #content > .tray-left,
    html body #content > .tray-right,
    html body #content > .tray-center,
    html body #content .tray-center,
    html body #content .tray-left,
    html body #content .tray-right,
    html body .tray-inner,
    html body .tray-center > .pl15,
    html body .tray-center > .pr15,
    html body .tray-center > .pl15.pr15,
    html body #content .us-sign-design-workbench,
    html body #content .us-sign-design-workspace-column {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    html body #main::before,
    html body #main::after,
    html body #content_wrapper::before,
    html body #content_wrapper::after,
    html body #content::before,
    html body #content::after,
    html body #content.table-layout::before,
    html body #content.table-layout::after,
    html body .tray-center::before,
    html body .tray-center::after {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    /* Project rail remains translucent instead of reverting to native gray. */
    html.us-sign-project-page body #pmlt,
    html body:has(#pmlt) #pmlt {
      background:
        linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012)),
        rgba(8, 14, 22, 0.67) !important;
      background-color: rgba(8, 14, 22, 0.67) !important;
      border-right-color: rgba(100, 210, 255, 0.22) !important;
    }

'''

if 'v2.0.2 DEDICATED WALLPAPER LAYER' not in text:
    if marker not in text:
        raise SystemExit('print marker not found')
    text = text.replace(marker, block + marker, 1)

path.write_text(text, encoding='utf-8')
