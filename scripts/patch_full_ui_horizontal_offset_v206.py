from pathlib import Path

path = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
text = path.read_text(encoding='utf-8')

text = text.replace('// @version      2.0.5', '// @version      2.0.6', 1)
text = text.replace(
    '// @description  Blue macOS-inspired glass theme for SquareCoil with corrected wallpaper stacking, removed native content-wrapper top gap, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.',
    '// @description  Blue macOS-inspired glass theme for SquareCoil with corrected wallpaper stacking, compact project positioning, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.',
    1,
)

marker = '''    @media print {\n'''
css = r'''    /* =========================================================
       v2.0.6 PROJECT HORIZONTAL OFFSET FIX
       The wallpaper stacking pass makes content_wrapper/content positioned.
       Neutralize SquareCoil's native left/right offsets so the project rail
       begins directly after the main sidebar instead of leaving a dead column.
    ========================================================= */

    html.us-sign-project-page body section#content_wrapper,
    html body:has(#pmlt) section#content_wrapper,
    html.us-sign-project-page body #content_wrapper,
    html body:has(#pmlt) #content_wrapper,
    html.us-sign-project-page body section#content,
    html body:has(#pmlt) section#content,
    html.us-sign-project-page body #content,
    html body:has(#pmlt) #content {
      left: 0 !important;
      right: auto !important;
      transform: none !important;
    }

'''

if 'v2.0.6 PROJECT HORIZONTAL OFFSET FIX' not in text:
    if marker not in text:
        raise SystemExit('print media marker not found')
    text = text.replace(marker, css + marker, 1)

path.write_text(text, encoding='utf-8')
