from pathlib import Path
import re

path = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
text = path.read_text(encoding='utf-8')

text = text.replace('// @version      2.0.7', '// @version      2.0.8', 1)
text = text.replace(
    '// @description  Blue macOS-inspired glass theme for SquareCoil with measured project-rail gap repair, corrected wallpaper stacking, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.',
    '// @description  Blue macOS-inspired glass theme for SquareCoil with Design-only layout fixes, native project-page geometry elsewhere, corrected wallpaper stacking, and translucent workspace shells.',
    1,
)

# Remove the project-wide spacing experiments from v2.0.4/v2.0.5.
text = re.sub(
    r'\n\s*/\* =========================================================\n\s*v2\.0\.4 PROJECT PAGE TOP-GAP CLEANUP.*?(?=\n\s*@media print \{)',
    '\n',
    text,
    flags=re.S,
)

# Remove the v2.0.7 measured rail-gap repair entirely. It was too broad and
# should not own geometry on Scope / Status / Tasks pages.
text = re.sub(
    r'\n\s*function usSignCollapseEmptyProjectRailGap\(\) \{.*?\n\s*\}\n\n\s*function usSignWallpaperPass\(\) \{\n\s*usSignCollapseEmptyProjectRailGap\(\);',
    '\n\n  function usSignWallpaperPass() {\n    usSignMarkDesignPage();',
    text,
    flags=re.S,
)

# Add a cheap Design-page marker. It is evaluated only during the existing
# bounded wallpaper passes, so there is still no permanent observer/polling.
marker_fn = r'''
  function usSignMarkDesignPage() {
    const isDesignPage = Boolean(
      document.getElementById("us-sign-design-actionbar") ||
      document.querySelector(".us-sign-design-workbench, .us-sign-design-workspace-column")
    );
    document.documentElement.classList.toggle("us-sign-design-page", isDesignPage);
    return isDesignPage;
  }

'''
if 'function usSignMarkDesignPage()' not in text:
    anchor = '  function usSignWallpaperPass() {'
    if anchor not in text:
        raise SystemExit('wallpaper pass anchor not found')
    text = text.replace(anchor, marker_fn + anchor, 1)

# Only Design gets the wrapper/tray top-spacing repair. All other project pages
# keep SquareCoil's native geometry that was already working correctly.
css = r'''
    /* =========================================================
       v2.0.8 DESIGN-ONLY LAYOUT REPAIR
       Scope of Work / Project Status / Tasks keep native SquareCoil geometry.
       Only the Design workspace removes the native 60px wrapper offset.
    ========================================================= */

    html.us-sign-design-page body section#content_wrapper,
    html.us-sign-design-page body #content_wrapper,
    html.us-sign-design-page body #content {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }

    html.us-sign-design-page body #content > .tray,
    html.us-sign-design-page body #content > .tray-left,
    html.us-sign-design-page body #content > .tray-center,
    html.us-sign-design-page body #content > .tray-right {
      margin-top: 0 !important;
      padding-top: 10px !important;
    }

    html.us-sign-design-page body #content .tray-center > .pl15,
    html.us-sign-design-page body #content .tray-center > .pr15,
    html.us-sign-design-page body #content .tray-center > .pl15.pr15 {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }

'''
if 'v2.0.8 DESIGN-ONLY LAYOUT REPAIR' not in text:
    print_anchor = '    @media print {'
    if print_anchor not in text:
        raise SystemExit('print media anchor not found')
    text = text.replace(print_anchor, css + print_anchor, 1)

path.write_text(text, encoding='utf-8')
