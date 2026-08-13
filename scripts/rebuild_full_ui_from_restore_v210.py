from pathlib import Path

p = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
s = p.read_text(encoding='utf-8')

s = s.replace('// @version      2.1.6', '// @version      2.1.7', 1)
s = s.replace(
    '// @description  Stable SquareCoil wallpaper layout with lighter true-glass transparency, visible wallpaper, and paint-only visual polish. No project geometry overrides.',
    '// @description  Stable SquareCoil layout with ChatGPT-inspired translucent panels, macOS-style frosted glass, Manrope typography, and visible scenic wallpaper. Paint only, no project geometry overrides.',
    1,
)

font_import = '    @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;650;700&display=swap");\n\n'
style_start = '  GM_addStyle(String.raw`\n'
if font_import not in s:
    if style_start not in s:
        raise SystemExit('style block start not found')
    s = s.replace(style_start, style_start + font_import, 1)

old_font = '--us-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", system-ui, sans-serif;'
new_font = '--us-font: "Manrope", "Avenir Next", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;'
s = s.replace(old_font, new_font)

marker = '       v2.1.7 TRUE GLASS SYSTEM'
if marker not in s:
    glass_css = r'''

    /* =========================================================
       v2.1.7 TRUE GLASS SYSTEM
       ChatGPT-like restraint + macOS frosted translucency.
       Paint and typography only. No display, sizing, spacing,
       positioning, transforms, tray geometry, or DOM mutation.
    ========================================================= */

    :root {
      --us-glass-clear: rgba(8, 15, 24, 0.16);
      --us-glass-soft-clear: rgba(10, 18, 29, 0.21);
      --us-glass-medium-clear: rgba(9, 17, 28, 0.28);
      --us-glass-readable: rgba(8, 16, 27, 0.34);
      --us-glass-nav: rgba(8, 16, 27, 0.52);
      --us-hairline: rgba(220, 239, 255, 0.105);
      --us-hairline-bright: rgba(230, 244, 255, 0.16);
      --us-surface-shine: rgba(255, 255, 255, 0.045);
      --us-blue-haze: rgba(72, 151, 231, 0.065);
      --us-blue-haze-strong: rgba(74, 158, 245, 0.105);
      --us-text: rgba(247, 250, 253, 0.96);
      --us-text-soft: rgba(220, 228, 237, 0.84);
      --us-text-muted: rgba(166, 181, 198, 0.68);
      --us-accent: #83c4ff;
    }

    html,
    body,
    input,
    textarea,
    select,
    button,
    table,
    th,
    td,
    .panel,
    .panel-heading,
    .panel-body,
    #pmlt {
      font-family: var(--us-font) !important;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    .panel-title,
    #customer-name,
    #customer-name * {
      font-family: var(--us-font) !important;
      letter-spacing: -0.022em !important;
    }

    /* Navigation glass remains a little denser for legibility. */
    header.navbar,
    #topbar,
    .topbar {
      background:
        linear-gradient(180deg, rgba(29, 45, 62, 0.32), rgba(4, 11, 19, 0.24)),
        rgba(7, 14, 23, 0.38) !important;
      background-color: rgba(7, 14, 23, 0.38) !important;
      border-bottom-color: var(--us-hairline) !important;
      box-shadow:
        0 10px 28px rgba(0, 0, 0, 0.12),
        inset 0 -1px 0 rgba(255, 255, 255, 0.025) !important;
      -webkit-backdrop-filter: blur(24px) saturate(155%) !important;
      backdrop-filter: blur(24px) saturate(155%) !important;
    }

    #sidebar_left {
      background:
        linear-gradient(180deg, rgba(17, 31, 45, 0.44), rgba(5, 12, 21, 0.38)),
        rgba(7, 14, 23, 0.42) !important;
      background-color: rgba(7, 14, 23, 0.42) !important;
      border-right-color: var(--us-hairline) !important;
      box-shadow:
        10px 0 30px rgba(0, 0, 0, 0.09),
        inset -1px 0 0 rgba(255, 255, 255, 0.025) !important;
      -webkit-backdrop-filter: blur(24px) saturate(150%) !important;
      backdrop-filter: blur(24px) saturate(150%) !important;
    }

    #pmlt {
      background:
        linear-gradient(145deg, rgba(92, 166, 230, 0.055), transparent 44%),
        linear-gradient(180deg, rgba(11, 23, 36, 0.28), rgba(5, 12, 21, 0.22)) !important;
      background-color: rgba(7, 15, 25, 0.24) !important;
      border-right-color: var(--us-hairline) !important;
      box-shadow:
        10px 0 30px rgba(0, 0, 0, 0.08),
        inset -1px 0 0 rgba(255, 255, 255, 0.035) !important;
      -webkit-backdrop-filter: blur(22px) saturate(145%) !important;
      backdrop-filter: blur(22px) saturate(145%) !important;
    }

    /* Hero/title surface: luminous glass, not a solid banner. */
    #customer-name {
      background:
        linear-gradient(115deg, rgba(255, 255, 255, 0.075), transparent 32%),
        linear-gradient(180deg, rgba(114, 177, 230, 0.095), rgba(9, 17, 28, 0.12)) !important;
      background-color: rgba(10, 18, 29, 0.15) !important;
      border-color: var(--us-hairline-bright) !important;
      box-shadow:
        0 12px 34px rgba(0, 0, 0, 0.10),
        inset 0 1px 0 rgba(255, 255, 255, 0.075) !important;
      -webkit-backdrop-filter: blur(24px) saturate(150%) !important;
      backdrop-filter: blur(24px) saturate(150%) !important;
    }

    /* Job overview stays slightly denser because the data is tiny. */
    #customer-info,
    #projectbox,
    #showbtns {
      background:
        linear-gradient(145deg, rgba(88, 165, 232, 0.045), transparent 38%),
        linear-gradient(180deg, rgba(7, 16, 27, 0.31), rgba(5, 12, 21, 0.25)) !important;
      background-color: var(--us-glass-readable) !important;
      border-color: var(--us-hairline) !important;
      box-shadow:
        0 12px 30px rgba(0, 0, 0, 0.105),
        inset 0 1px 0 rgba(255, 255, 255, 0.035) !important;
      -webkit-backdrop-filter: blur(20px) saturate(145%) !important;
      backdrop-filter: blur(20px) saturate(145%) !important;
    }

    /* Main work panels: mostly transparent, like floating ChatGPT panes. */
    #descriptionbox,
    #designbox,
    #filesbox,
    .panel,
    .panel-default,
    .well {
      background:
        linear-gradient(145deg, rgba(119, 187, 241, 0.045), transparent 34%),
        linear-gradient(180deg, rgba(9, 18, 30, 0.20), rgba(5, 12, 21, 0.16)) !important;
      background-color: var(--us-glass-soft-clear) !important;
      border-color: var(--us-hairline) !important;
      box-shadow:
        0 10px 28px rgba(0, 0, 0, 0.085),
        inset 0 1px 0 rgba(255, 255, 255, 0.04) !important;
    }

    #descriptionbox,
    #designbox,
    #filesbox {
      -webkit-backdrop-filter: blur(20px) saturate(145%) !important;
      backdrop-filter: blur(20px) saturate(145%) !important;
    }

    #descriptionbox > .panel-heading,
    #designbox > .panel-heading,
    #filesbox > .panel-heading,
    .panel > .panel-heading,
    .panel-heading,
    .panel-footer {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(86, 165, 231, 0.025)) !important;
      background-color: rgba(255, 255, 255, 0.018) !important;
      border-color: var(--us-hairline) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035) !important;
    }

    #descriptionbox .panel-body,
    #designbox .panel-body,
    #filesbox .panel-body,
    #projectbox .panel-body,
    #customer-info .panel-body,
    .panel-body {
      background: rgba(5, 12, 20, 0.025) !important;
      background-color: rgba(5, 12, 20, 0.025) !important;
    }

    /* Tables should read as content, not nested black boxes. */
    html body #content table,
    html body #content .table,
    html body .panel table,
    html body .panel .table {
      background: rgba(5, 12, 20, 0.10) !important;
      background-color: rgba(5, 12, 20, 0.10) !important;
      border-color: rgba(220, 239, 255, 0.065) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.014) !important;
    }

    html body #content table thead,
    html body #content table thead tr,
    html body #content table thead th,
    html body .panel table thead th {
      background: rgba(117, 185, 239, 0.022) !important;
      border-color: rgba(220, 239, 255, 0.06) !important;
    }

    html body #content table tbody tr:hover,
    html body .panel table tbody tr:hover {
      background: rgba(92, 176, 246, 0.055) !important;
    }

    /* Inputs use a translucent smoked inset, not opaque charcoal. */
    input:not([type="button"]):not([type="submit"]):not([type="reset"]),
    textarea,
    select,
    .form-control {
      background: rgba(4, 11, 19, 0.24) !important;
      background-color: rgba(4, 11, 19, 0.24) !important;
      border-color: rgba(220, 239, 255, 0.085) !important;
      box-shadow:
        inset 0 1px 2px rgba(0, 0, 0, 0.11),
        inset 0 1px 0 rgba(255, 255, 255, 0.022) !important;
    }

    input:not([type="button"]):not([type="submit"]):not([type="reset"]):focus,
    textarea:focus,
    select:focus,
    .form-control:focus {
      border-color: rgba(103, 190, 255, 0.34) !important;
      box-shadow:
        0 0 0 2px rgba(10, 132, 255, 0.075),
        inset 0 1px 2px rgba(0, 0, 0, 0.10) !important;
    }

    /* Existing button geometry is untouched; paint becomes frosted. */
    .btn,
    button,
    input[type="button"],
    input[type="submit"] {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(60, 125, 183, 0.025)),
        rgba(7, 15, 25, 0.24) !important;
      background-color: rgba(7, 15, 25, 0.24) !important;
      border-color: rgba(220, 239, 255, 0.10) !important;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.035),
        0 4px 12px rgba(0, 0, 0, 0.07) !important;
    }

    .btn:hover,
    button:hover,
    input[type="button"]:hover,
    input[type="submit"]:hover {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(72, 152, 220, 0.04)),
        rgba(9, 20, 33, 0.31) !important;
      border-color: rgba(131, 196, 255, 0.18) !important;
    }

    #sidebar_left .nav > li.active > a,
    #sidebar_left .active > a,
    #sidebar_left a.active {
      background:
        linear-gradient(180deg, rgba(53, 153, 245, 0.16), rgba(14, 92, 172, 0.075)) !important;
      border-color: rgba(126, 200, 255, 0.14) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
    }

    #pmlt a,
    #project_menu a {
      color: rgba(218, 230, 242, 0.88) !important;
    }

    #pmlt a:hover,
    #project_menu a:hover {
      color: #ffffff !important;
      text-shadow: 0 0 16px rgba(105, 193, 255, 0.18) !important;
    }
'''

    print_pos = s.rfind('    @media print {')
    if print_pos < 0:
        raise SystemExit('print block not found')
    s = s[:print_pos] + glass_css + '\n' + s[print_pos:]

p.write_text(s, encoding='utf-8')
