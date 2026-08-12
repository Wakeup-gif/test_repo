from pathlib import Path

path = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
text = path.read_text(encoding='utf-8')

text = text.replace('// @version      2.0.3', '// @version      2.0.4', 1)
text = text.replace(
    '// @description  Blue macOS-inspired glass theme for SquareCoil with corrected wallpaper stacking, bounded shell cleanup, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.',
    '// @description  Blue macOS-inspired glass theme for SquareCoil with corrected wallpaper stacking, compact project-page top spacing, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.',
    1,
)

marker = '''    @media print {\n'''
patch = r'''    /* =========================================================
       v2.0.4 PROJECT PAGE TOP-GAP CLEANUP
       Native tray padding plus project-wrapper margins were stacking into
       the large empty band below the navbar. Keep one small consistent gap.
    ========================================================= */

    html.us-sign-project-page body #content,
    html body:has(#pmlt) #content {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }

    html.us-sign-project-page body #content > .tray,
    html.us-sign-project-page body #content > .tray-left,
    html.us-sign-project-page body #content > .tray-center,
    html.us-sign-project-page body #content > .tray-right,
    html body:has(#pmlt) #content > .tray,
    html body:has(#pmlt) #content > .tray-left,
    html body:has(#pmlt) #content > .tray-center,
    html body:has(#pmlt) #content > .tray-right {
      margin-top: 0 !important;
      padding-top: 10px !important;
    }

    html.us-sign-project-page body #pmlt,
    html body:has(#pmlt) #pmlt {
      margin-top: 0 !important;
    }

    html.us-sign-project-page body #content .tray-center > .pl15,
    html.us-sign-project-page body #content .tray-center > .pr15,
    html.us-sign-project-page body #content .tray-center > .pl15.pr15,
    html body:has(#pmlt) #content .tray-center > .pl15,
    html body:has(#pmlt) #content .tray-center > .pr15,
    html body:has(#pmlt) #content .tray-center > .pl15.pr15 {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }

    html.us-sign-project-page body #content .tray-center > .pl15 > :first-child,
    html.us-sign-project-page body #content .tray-center > .pr15 > :first-child,
    html.us-sign-project-page body #content .tray-center > .pl15.pr15 > :first-child,
    html body:has(#pmlt) #content .tray-center > .pl15 > :first-child,
    html body:has(#pmlt) #content .tray-center > .pr15 > :first-child,
    html body:has(#pmlt) #content .tray-center > .pl15.pr15 > :first-child {
      margin-top: 0 !important;
    }

'''

if 'v2.0.4 PROJECT PAGE TOP-GAP CLEANUP' not in text:
    if marker not in text:
        raise SystemExit('print media marker not found')
    text = text.replace(marker, patch + marker, 1)

path.write_text(text, encoding='utf-8')
