from pathlib import Path

p = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
s = p.read_text(encoding='utf-8')

if '// @version      2.1.8' in s:
    raise SystemExit(0)

if '// @version      2.1.7' not in s:
    raise SystemExit('Expected v2.1.7 canonical theme')

s = s.replace('// @version      2.1.7', '// @version      2.1.8', 1)
s = s.replace(
    '// @description  Stable SquareCoil layout with ChatGPT-inspired translucent panels, macOS-style frosted glass, Manrope typography, and visible scenic wallpaper. Paint only, no project geometry overrides.',
    '// @description  Stable SquareCoil layout with lighter true-glass surfaces, Design workspace transparency fixes, and performance-safe blur limited to fixed chrome. Paint only, no geometry overrides.',
    1,
)

block = r'''

    /* =========================================================
       v2.1.8 PERFORMANCE TRUE GLASS
       Keep the wallpaper and layout. Remove expensive blur from scrolling
       content and override Design Job Tools' opaque runtime surfaces.
    ========================================================= */

    :root {
      --us-perf-glass: rgba(7, 15, 25, 0.13);
      --us-perf-glass-soft: rgba(9, 18, 30, 0.10);
      --us-perf-glass-readable: rgba(7, 15, 25, 0.20);
      --us-perf-hairline: rgba(226, 242, 255, 0.09);
      --us-perf-highlight: rgba(255, 255, 255, 0.035);
    }

    /* Scrolling content gets transparent paint only. Backdrop-filter on
       large moving surfaces is the main source of scroll/compositing jank. */
    html body #customer-name,
    html body #customer-info,
    html body #projectbox,
    html body #showbtns,
    html body #descriptionbox,
    html body #designbox,
    html body #filesbox,
    html body #content .panel,
    html body #content .panel-default,
    html body #content .well,
    html body #content .modal-content,
    html body #content .popover,
    html body #content .dropdown-menu {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html body #descriptionbox,
    html body #designbox,
    html body #filesbox,
    html body #content .panel,
    html body #content .panel-default,
    html body #content .well {
      background:
        linear-gradient(145deg, rgba(128, 194, 246, 0.028), transparent 32%),
        linear-gradient(180deg, rgba(8, 17, 28, 0.13), rgba(4, 10, 18, 0.09)) !important;
      background-color: var(--us-perf-glass) !important;
      border-color: var(--us-perf-hairline) !important;
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.055),
        inset 0 1px 0 var(--us-perf-highlight) !important;
    }

    html body #customer-name {
      background:
        linear-gradient(110deg, rgba(255, 255, 255, 0.055), transparent 30%),
        linear-gradient(180deg, rgba(103, 174, 232, 0.07), rgba(7, 15, 25, 0.08)) !important;
      background-color: rgba(8, 16, 27, 0.10) !important;
      border-color: rgba(226, 242, 255, 0.12) !important;
      box-shadow:
        0 8px 26px rgba(0, 0, 0, 0.055),
        inset 0 1px 0 rgba(255, 255, 255, 0.055) !important;
    }

    html body #customer-info,
    html body #projectbox,
    html body #showbtns {
      background:
        linear-gradient(145deg, rgba(104, 176, 236, 0.026), transparent 36%),
        linear-gradient(180deg, rgba(6, 14, 24, 0.20), rgba(4, 10, 18, 0.15)) !important;
      background-color: var(--us-perf-glass-readable) !important;
      border-color: var(--us-perf-hairline) !important;
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.065),
        inset 0 1px 0 rgba(255, 255, 255, 0.028) !important;
    }

    html body #content .panel-heading,
    html body #descriptionbox > .panel-heading,
    html body #designbox > .panel-heading,
    html body #filesbox > .panel-heading {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.028), rgba(91, 168, 230, 0.014)) !important;
      background-color: rgba(255, 255, 255, 0.010) !important;
      border-color: var(--us-perf-hairline) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
    }

    html body #content .panel-body,
    html body #descriptionbox .panel-body,
    html body #designbox .panel-body,
    html body #filesbox .panel-body,
    html body #projectbox .panel-body,
    html body #customer-info .panel-body {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    html body #content table,
    html body #content .table,
    html body #content .panel table,
    html body #content .panel .table {
      background: rgba(5, 12, 20, 0.055) !important;
      background-color: rgba(5, 12, 20, 0.055) !important;
      border-color: rgba(226, 242, 255, 0.05) !important;
      box-shadow: none !important;
    }

    /* Design Job Tools injects its CSS after the theme and defines .90/.96
       surfaces. Higher specificity + !important keeps those runtime cards
       aligned with the global glass system without editing layout behavior. */
    html body #us-sign-design-actionbar,
    html body #us-sign-job-overview,
    html body #us-sign-design-summary,
    html body #us-sign-design-bottom-grid,
    html body #us-sign-design-right-stack {
      --djt-surface: rgba(7, 15, 25, 0.14) !important;
      --djt-surface-strong: rgba(7, 15, 25, 0.17) !important;
      --djt-surface-soft: rgba(255, 255, 255, 0.018) !important;
      --djt-hover: rgba(118, 190, 246, 0.055) !important;
      --djt-border: rgba(226, 242, 255, 0.07) !important;
      --djt-border-strong: rgba(226, 242, 255, 0.105) !important;
      --djt-accent-soft: rgba(80, 165, 238, 0.10) !important;
      --djt-font: var(--us-font) !important;
    }

    html body #us-sign-design-actionbar {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(77, 151, 213, 0.012)),
        rgba(7, 15, 25, 0.16) !important;
      background-color: rgba(7, 15, 25, 0.16) !important;
      border-color: rgba(226, 242, 255, 0.075) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.026) !important;
    }

    html body #us-sign-job-overview,
    html body #us-sign-design-summary {
      background:
        linear-gradient(180deg, rgba(111, 181, 237, 0.018), rgba(5, 12, 20, 0.105)) !important;
      background-color: rgba(7, 15, 25, 0.13) !important;
      border-color: rgba(226, 242, 255, 0.065) !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html body #us-sign-job-overview .us-sign-overview-title,
    html body #us-sign-job-overview .us-sign-overview-field,
    html body #us-sign-design-summary > .us-sign-djt-summary-cell {
      background: transparent !important;
      background-color: transparent !important;
      border-color: rgba(226, 242, 255, 0.05) !important;
    }

    html body #us-sign-design-bottom-grid,
    html body #us-sign-design-right-stack,
    html body .us-sign-design-workbench,
    html body .us-sign-design-workspace-column {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      box-shadow: none !important;
    }

    html body #us-sign-design-bottom-grid > .us-sign-description-panel,
    html body #us-sign-design-right-stack > .us-sign-designs-panel,
    html body #us-sign-design-right-stack > .us-sign-files-panel {
      background:
        linear-gradient(145deg, rgba(119, 187, 241, 0.024), transparent 32%),
        rgba(6, 14, 24, 0.105) !important;
      background-color: rgba(6, 14, 24, 0.105) !important;
      border-color: rgba(226, 242, 255, 0.07) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      box-shadow:
        0 7px 22px rgba(0, 0, 0, 0.045),
        inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
    }

    /* Keep real blur on fixed chrome only. This preserves the macOS feel
       without forcing the GPU to continuously re-blur long scrolling cards. */
    html body header.navbar,
    html body #sidebar_left,
    html body #pmlt {
      -webkit-backdrop-filter: blur(12px) saturate(130%) !important;
      backdrop-filter: blur(12px) saturate(130%) !important;
    }
'''

marker = '\n    @media print {'
pos = s.rfind(marker)
if pos < 0:
    raise SystemExit('Final print block not found')
s = s[:pos] + block + s[pos:]

p.write_text(s, encoding='utf-8')
