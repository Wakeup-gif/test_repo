from pathlib import Path

path = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
text = path.read_text(encoding='utf-8')

text = text.replace('// @version      2.1.4', '// @version      2.1.5', 1)
text = text.replace(
    '// @description  Stable pre-wallpaper SquareCoil layout with visible scenic wallpaper, blue macOS-inspired glass colors, and translucent canvas paint only. No project geometry overrides.',
    '// @description  Stable SquareCoil wallpaper layout with refined blue macOS-inspired glass hierarchy, stronger readability, and paint-only visual polish. No project geometry overrides.',
    1,
)

marker = '    @media print {'
css = r'''

    /* =========================================================
       v2.1.5 GLASS POLISH
       Visual hierarchy only. No display, position, sizing, spacing,
       transforms, tray geometry, or runtime DOM mutation.
    ========================================================= */

    :root {
      --us-glass-rail: rgba(9, 17, 27, 0.78);
      --us-glass-header: rgba(10, 18, 28, 0.86);
      --us-glass-hero: rgba(19, 31, 45, 0.58);
      --us-glass-card: rgba(13, 23, 35, 0.72);
      --us-glass-card-strong: rgba(10, 19, 30, 0.80);
      --us-glass-inner: rgba(5, 12, 20, 0.52);
      --us-glass-edge: rgba(174, 219, 255, 0.15);
      --us-glass-edge-soft: rgba(174, 219, 255, 0.09);
      --us-glass-highlight: rgba(255, 255, 255, 0.055);
      --us-glow-blue: rgba(44, 145, 255, 0.12);
      --us-shadow-glass: 0 10px 30px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.045);
      --us-shadow-glass-strong: 0 14px 36px rgba(0, 0, 0, 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.055);
    }

    header.navbar,
    #topbar,
    .topbar {
      background:
        linear-gradient(180deg, rgba(23, 36, 51, 0.88), rgba(8, 16, 25, 0.84)) !important;
      background-color: var(--us-glass-header) !important;
      border-bottom-color: var(--us-glass-edge-soft) !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.20), inset 0 -1px 0 rgba(92, 180, 255, 0.035) !important;
    }

    #sidebar_left {
      background:
        linear-gradient(180deg, rgba(17, 29, 42, 0.90), rgba(8, 16, 25, 0.88)) !important;
      background-color: rgba(9, 17, 27, 0.88) !important;
      border-right-color: var(--us-glass-edge-soft) !important;
      box-shadow: 10px 0 28px rgba(0, 0, 0, 0.12), inset -1px 0 0 rgba(255, 255, 255, 0.025) !important;
    }

    #pmlt {
      background:
        linear-gradient(180deg, rgba(20, 32, 46, 0.80), rgba(8, 16, 26, 0.82)) !important;
      background-color: var(--us-glass-rail) !important;
      border-right-color: var(--us-glass-edge) !important;
      box-shadow: 12px 0 30px rgba(0, 0, 0, 0.15), inset -1px 0 0 rgba(255, 255, 255, 0.035) !important;
    }

    #customer-name {
      background:
        linear-gradient(180deg, rgba(76, 98, 122, 0.42), rgba(20, 31, 44, 0.54)) !important;
      background-color: var(--us-glass-hero) !important;
      border-color: rgba(185, 222, 255, 0.16) !important;
      box-shadow: var(--us-shadow-glass), inset 0 1px 0 rgba(255, 255, 255, 0.065) !important;
    }

    #customer-info,
    #projectbox,
    #showbtns {
      background:
        linear-gradient(180deg, rgba(20, 31, 44, 0.82), rgba(8, 16, 26, 0.82)) !important;
      background-color: var(--us-glass-card-strong) !important;
      border-color: var(--us-glass-edge-soft) !important;
      box-shadow: var(--us-shadow-glass-strong) !important;
    }

    #descriptionbox,
    #designbox,
    #filesbox,
    .panel,
    .panel-default,
    .well {
      background:
        linear-gradient(180deg, rgba(22, 35, 49, 0.70), rgba(8, 16, 26, 0.72)) !important;
      background-color: var(--us-glass-card) !important;
      border-color: var(--us-glass-edge-soft) !important;
      box-shadow: var(--us-shadow-glass) !important;
    }

    #descriptionbox > .panel-heading,
    #designbox > .panel-heading,
    #filesbox > .panel-heading,
    .panel > .panel-heading {
      background:
        linear-gradient(180deg, rgba(73, 115, 154, 0.11), rgba(255, 255, 255, 0.018)) !important;
      background-color: rgba(255, 255, 255, 0.025) !important;
      border-bottom-color: var(--us-glass-edge-soft) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035) !important;
    }

    #descriptionbox .panel-body,
    #designbox .panel-body,
    #filesbox .panel-body,
    #projectbox .panel-body,
    #customer-info .panel-body {
      background: rgba(4, 10, 17, 0.08) !important;
      background-color: rgba(4, 10, 17, 0.08) !important;
    }

    html body #content table,
    html body #content .table,
    html body .panel table,
    html body .panel .table {
      background: rgba(5, 12, 20, 0.34) !important;
      border-color: rgba(174, 219, 255, 0.085) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.018) !important;
    }

    html body #content table thead,
    html body #content table thead tr,
    html body #content table thead th,
    html body .panel table thead th {
      background: rgba(116, 173, 224, 0.055) !important;
      border-color: rgba(174, 219, 255, 0.075) !important;
    }

    html body #content table tbody tr:hover,
    html body .panel table tbody tr:hover {
      background: rgba(76, 158, 230, 0.065) !important;
    }

    input:not([type="button"]):not([type="submit"]):not([type="reset"]),
    textarea,
    select,
    .form-control {
      background: rgba(4, 11, 19, 0.52) !important;
      background-color: rgba(4, 11, 19, 0.52) !important;
      border-color: rgba(174, 219, 255, 0.11) !important;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.018) !important;
    }

    input:not([type="button"]):not([type="submit"]):not([type="reset"]):focus,
    textarea:focus,
    select:focus,
    .form-control:focus {
      border-color: rgba(86, 177, 255, 0.40) !important;
      box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.10), inset 0 1px 2px rgba(0, 0, 0, 0.14) !important;
    }

    #sidebar_left .nav > li.active > a,
    #sidebar_left .active > a,
    #sidebar_left a.active {
      background:
        linear-gradient(180deg, rgba(35, 145, 255, 0.24), rgba(10, 90, 170, 0.16)) !important;
      border-color: rgba(115, 197, 255, 0.18) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035) !important;
    }

    #pmlt a:hover,
    #project_menu a:hover {
      color: #ffffff !important;
      text-shadow: 0 0 14px rgba(104, 194, 255, 0.22) !important;
    }

    /* Blur only the large glass surfaces. Avoid nested backdrop filters. */
    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      header.navbar,
      #sidebar_left,
      #pmlt,
      #customer-name,
      #customer-info,
      #projectbox,
      #descriptionbox,
      #designbox,
      #filesbox {
        -webkit-backdrop-filter: blur(18px) saturate(125%) !important;
        backdrop-filter: blur(18px) saturate(125%) !important;
      }

      #descriptionbox .panel,
      #designbox .panel,
      #filesbox .panel,
      #projectbox .panel,
      #customer-info .panel,
      #descriptionbox .well,
      #designbox .well,
      #filesbox .well {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
    }
'''

if 'v2.1.5 GLASS POLISH' not in text:
    if marker not in text:
        raise SystemExit('print marker not found')
    text = text.replace(marker, css + '\n' + marker, 1)

path.write_text(text, encoding='utf-8')
