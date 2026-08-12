from pathlib import Path
import subprocess

RESTORE_REF = 'origin/restore/squarecoil-pre-macos-glass-v1.2.0-2026-08-12'
THEME_PATH = 'tampermonkey/US-Sign-Full-UI-Theme.user.js'

source = subprocess.check_output(
    ['git', 'show', f'{RESTORE_REF}:{THEME_PATH}'],
    text=True,
)

source = source.replace('// @version      1.2.0', '// @version      2.1.0', 1)
source = source.replace(
    '// @description  Canonical SquareCoil dark glass UI with fixed site wallpaper, tray, layout, panel, form, table, dropdown, editor, modal, and readable-text repairs.',
    '// @description  Stable SquareCoil layout from the v1.2.0 restore point with blue macOS-inspired glass colors and a fixed scenic wallpaper. No project geometry overrides.',
    1,
)

# Keep the known-good layout, only change visual tokens.
replacements = {
    '--us-bg: #111418;': '--us-bg: rgba(9, 15, 23, 0.46);',
    '--us-bg-elevated: #171b20;': '--us-bg-elevated: rgba(16, 24, 34, 0.80);',
    '--us-bg-soft: #1c2127;': '--us-bg-soft: rgba(22, 31, 42, 0.74);',
    '--us-glass: rgba(30, 35, 42, 0.78);': '--us-glass: rgba(18, 27, 38, 0.68);',
    '--us-glass-strong: rgba(25, 29, 35, 0.94);': '--us-glass-strong: rgba(13, 21, 31, 0.84);',
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

# Remove the Google-font import; use the native system/SF stack instead.
source = source.replace('    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;650;700&display=swap");\n\n', '')

# Add wallpaper token without changing layout rules.
root_marker = '      --us-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;\n'
source = source.replace(
    root_marker,
    root_marker + '      --us-wallpaper: url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1");\n',
    1,
)

# Override only paint properties. No display/position/margin/padding/width/transform changes.
visual_css = r'''

    /* =========================================================
       v2.1.0 VISUAL-ONLY WALLPAPER + BLUE GLASS
       Built on the known-good v1.2.0 layout. These rules intentionally
       change paint only. No project/tray geometry is modified here.
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

    html body #main,
    html body #content_wrapper,
    html body #content,
    html body #content > .tray,
    html body #content > .tray-left,
    html body #content > .tray-right,
    html body #content > .tray-center,
    html body .tray,
    html body .tray-left,
    html body .tray-right,
    html body .tray-center,
    html body .tray-inner,
    html body [class^="tray-"],
    html body [class*=" tray-"],
    html body .content,
    html body .content-wrapper,
    html body .page-content,
    html body .content-body,
    html body .main-content,
    html body .main-panel,
    html body .admin-panels,
    html body .dashboard,
    html body .dashboard-page,
    html body .container,
    html body .container-fluid,
    html body .pl15,
    html body .pr15,
    html body .pl15.pr15 {
      background: var(--us-bg) !important;
      background-color: var(--us-bg) !important;
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
      background: rgba(10, 17, 26, 0.82) !important;
      background-color: rgba(10, 17, 26, 0.82) !important;
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
    raise SystemExit('print marker not found in restore theme')
source = source.replace(print_marker, visual_css + '\n' + print_marker, 1)

# Safety: strip any later experimental runtime if this source ever changes.
for forbidden in [
    'usSignWallpaperPass',
    'usSignCollapseEmptyProjectRailGap',
    'us-sign-design-page',
    'PROJECT HORIZONTAL OFFSET FIX',
    'NATIVE CONTENT WRAPPER GAP FIX',
    'PROJECT PAGE TOP-GAP CLEANUP',
]:
    if forbidden in source:
        raise SystemExit(f'layout experiment unexpectedly present: {forbidden}')

Path(THEME_PATH).write_text(source, encoding='utf-8')
