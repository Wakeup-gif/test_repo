from pathlib import Path
import subprocess

SOURCE_REF = '3fa26dfdfae63b2ebdda972a2133ffcaacfd23d7'
THEME_PATH = 'tampermonkey/US-Sign-Full-UI-Theme.user.js'

source = subprocess.check_output(['git', 'show', f'{SOURCE_REF}:{THEME_PATH}'], text=True)

source = source.replace('// @version      1.1.2', '// @version      2.1.1', 1)
source = source.replace(
    '// @description  Canonical SquareCoil dark UI theme with tray, layout, panel, form, table, dropdown, editor, modal, and readable-text repairs.',
    '// @description  Stable pre-wallpaper SquareCoil layout with blue macOS-inspired glass colors and scenic wallpaper applied through translucent paint only. No project geometry overrides.',
    1,
)

# Native/system typography and blue glass palette only.
source = source.replace('    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;650;700&display=swap");\n\n', '')
replacements = {
    '--us-bg: #111418;': '--us-bg: rgba(9, 15, 23, 0.52);',
    '--us-bg-elevated: #171b20;': '--us-bg-elevated: rgba(16, 24, 34, 0.82);',
    '--us-bg-soft: #1c2127;': '--us-bg-soft: rgba(22, 31, 42, 0.76);',
    '--us-glass: rgba(30, 35, 42, 0.78);': '--us-glass: rgba(18, 27, 38, 0.70);',
    '--us-glass-strong: rgba(25, 29, 35, 0.94);': '--us-glass-strong: rgba(13, 21, 31, 0.86);',
    '--us-glass-soft: rgba(255, 255, 255, 0.035);': '--us-glass-soft: rgba(255, 255, 255, 0.045);',
    '--us-hover: rgba(255, 255, 255, 0.065);': '--us-hover: rgba(100, 180, 255, 0.10);',
    '--us-text: #f4f6f8;': '--us-text: #f5f8fb;',
    '--us-text-soft: #c9ced5;': '--us-text-soft: #d2d9e1;',
    '--us-text-muted: #8f98a3;': '--us-text-muted: #96a5b5;',
    '--us-accent: #c1ccd7;': '--us-accent: #8ecbff;',
    '--us-accent-soft: rgba(155, 172, 189, 0.16);': '--us-accent-soft: rgba(10, 132, 255, 0.18);',
    '--us-info: #7d9eb8;': '--us-info: #78c7ff;',
    '--us-border: rgba(255, 255, 255, 0.085);': '--us-border: rgba(169, 211, 247, 0.12);',
    '--us-border-strong: rgba(255, 255, 255, 0.14);': '--us-border-strong: rgba(181, 220, 252, 0.19);',
    '--us-border-focus: rgba(193, 204, 215, 0.42);': '--us-border-focus: rgba(10, 132, 255, 0.52);',
    '--us-font: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;': '--us-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", system-ui, sans-serif;',
}
for old, new in replacements.items():
    source = source.replace(old, new)

root_marker = '      --us-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;\n'
source = source.replace(
    root_marker,
    root_marker + '      --us-wallpaper: url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1");\n',
    1,
)

visual_css = r'''

    /* =========================================================
       v2.1.1 VISUAL-ONLY WALLPAPER + BLUE GLASS
       Source layout is the known-good v1.1.2 immediately before the
       wallpaper commit. Paint changes only: no display/position/spacing,
       tray geometry, widths, transforms, or runtime DOM mutation.
    ========================================================= */

    html {
      background-color: #081019 !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.18), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.08), transparent 34%),
        linear-gradient(rgba(4, 8, 13, 0.30), rgba(6, 11, 17, 0.56)),
        var(--us-wallpaper) !important;
      background-position: center center !important;
      background-size: cover !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
    }

    body {
      background: rgba(7, 11, 16, 0.10) !important;
      background-color: rgba(7, 11, 16, 0.10) !important;
      background-image: none !important;
    }

    header,
    header.navbar,
    .navbar,
    .navbar-fixed-top,
    #topbar,
    .topbar {
      background: rgba(11, 18, 28, 0.84) !important;
      background-color: rgba(11, 18, 28, 0.84) !important;
      border-bottom-color: rgba(100, 210, 255, 0.13) !important;
    }

    #sidebar_left,
    #pmlt {
      background: rgba(10, 17, 26, 0.84) !important;
      background-color: rgba(10, 17, 26, 0.84) !important;
      border-color: rgba(100, 210, 255, 0.13) !important;
    }

    .panel,
    .panel-default,
    .well,
    .modal-content,
    .popover,
    .dropdown-menu,
    #customer-info,
    #customer-name,
    #showbtns,
    #mapcontainer,
    #filesbox,
    #descriptionbox,
    #projectbox,
    #designbox,
    .note-editor,
    .cke {
      background: var(--us-glass) !important;
      background-color: var(--us-glass) !important;
      border-color: var(--us-border) !important;
    }

    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      header.navbar,
      #sidebar_left,
      #pmlt,
      .panel,
      .panel-default,
      .well,
      .modal-content,
      .popover,
      .dropdown-menu,
      #customer-info,
      #customer-name,
      #filesbox,
      #descriptionbox,
      #projectbox,
      #designbox {
        -webkit-backdrop-filter: blur(16px) saturate(130%) !important;
        backdrop-filter: blur(16px) saturate(130%) !important;
      }
    }

    #sidebar_left .nav > li.active > a,
    #sidebar_left .active > a,
    #sidebar_left a.active,
    .pagination > .active > a,
    .pagination > .active > span {
      background: rgba(10, 132, 255, 0.20) !important;
      border-color: rgba(100, 210, 255, 0.20) !important;
    }
'''

print_marker = '    @media print {'
if print_marker not in source:
    raise SystemExit('print marker missing')
source = source.replace(print_marker, visual_css + '\n' + print_marker, 1)

for forbidden in [
    'Site-wide fixed wallpaper. Main canvas wrappers are transparent',
    'usSignWallpaperPass',
    'usSignCollapseEmptyProjectRailGap',
    'us-sign-design-page',
    'NATIVE CONTENT WRAPPER GAP FIX',
    'PROJECT PAGE TOP-GAP CLEANUP',
    'PROJECT HORIZONTAL OFFSET FIX',
]:
    if forbidden in source:
        raise SystemExit(f'forbidden wallpaper/layout experiment present: {forbidden}')

Path(THEME_PATH).write_text(source, encoding='utf-8')
