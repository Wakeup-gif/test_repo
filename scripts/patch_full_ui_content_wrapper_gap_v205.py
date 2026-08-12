from pathlib import Path

path = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
text = path.read_text(encoding='utf-8')

text = text.replace('// @version      2.0.4', '// @version      2.0.5', 1)
text = text.replace(
    '// @description  Blue macOS-inspired glass theme for SquareCoil with corrected wallpaper stacking, compact project-page top spacing, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.',
    '// @description  Blue macOS-inspired glass theme for SquareCoil with corrected wallpaper stacking, removed native content-wrapper top gap, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.',
    1,
)

marker = '    @media print {\n'
patch = r'''    /* =========================================================
       v2.0.5 NATIVE CONTENT WRAPPER GAP FIX
       DevTools confirmed SquareCoil keeps padding-top:60px on
       section#content_wrapper. Remove that native offset on project pages;
       v2.0.4 already provides the intended 10px tray breathing room.
    ========================================================= */

    html.us-sign-project-page body section#content_wrapper,
    html body:has(#pmlt) section#content_wrapper,
    html.us-sign-project-page body #content_wrapper,
    html body:has(#pmlt) #content_wrapper {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }

'''

if 'v2.0.5 NATIVE CONTENT WRAPPER GAP FIX' not in text:
    if marker not in text:
        raise SystemExit('print marker not found')
    text = text.replace(marker, patch + marker, 1)

path.write_text(text, encoding='utf-8')
