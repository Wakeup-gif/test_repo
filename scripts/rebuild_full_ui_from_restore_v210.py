from pathlib import Path

p = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
s = p.read_text(encoding='utf-8')

if '// @version      2.1.9' in s:
    raise SystemExit(0)

if '// @version      2.1.8' not in s:
    raise SystemExit('Expected v2.1.8 canonical theme')

s = s.replace('// @version      2.1.8', '// @version      2.1.9', 1)
s = s.replace(
    '// @description  Stable SquareCoil layout with lighter true-glass surfaces, Design workspace transparency fixes, and performance-safe blur limited to fixed chrome. Paint only, no geometry overrides.',
    '// @description  Stable SquareCoil layout with Roxborough display typography, transparent blue gradient chrome, matched blue-black navigation glass, and performance-safe scrolling surfaces. Paint only, no geometry overrides.',
    1,
)

block = r'''

    /* =========================================================
       v2.1.9 ROXBOROUGH + MATCHED GLASS CHROME
       Typography and paint only. Roxborough CF is loaded locally when the
       licensed font is installed; elegant serif fallbacks keep the intent.
    ========================================================= */

    @font-face {
      font-family: "US Roxborough";
      src:
        local("Roxborough CF"),
        local("RoxboroughCF"),
        local("Roxborough");
      font-style: normal;
      font-weight: 300 800;
      font-display: swap;
    }

    :root {
      --us-display-font: "US Roxborough", "Iowan Old Style", "Baskerville", "Times New Roman", serif;
      --us-chrome-blue: rgba(7, 22, 37, 0.50);
      --us-chrome-blue-deep: rgba(4, 13, 23, 0.58);
      --us-chrome-line: rgba(150, 207, 255, 0.12);
      --us-chrome-line-bright: rgba(176, 220, 255, 0.17);
    }

    /* Display serif is deliberate and sparse: project identity, not UI data. */
    html body #customer-name h1,
    html body #customer-name h2,
    html body #customer-name h3,
    html body #customer-name .panel-title,
    html body #pmlt h1,
    html body #pmlt h2,
    html body #pmlt .project-number,
    html body #pmlt [class*="project-number" i] {
      font-family: var(--us-display-font) !important;
      font-weight: 500 !important;
      letter-spacing: -0.028em !important;
      font-variant-numeric: lining-nums tabular-nums !important;
      text-rendering: optimizeLegibility !important;
    }

    /* Keep operational UI crisp and modern. */
    html body #customer-info,
    html body #customer-info *,
    html body #us-sign-design-actionbar,
    html body #us-sign-job-overview,
    html body #us-sign-design-summary,
    html body #sidebar_left,
    html body #sidebar_left *,
    html body button,
    html body input,
    html body select,
    html body textarea,
    html body table,
    html body th,
    html body td {
      font-family: var(--us-font) !important;
    }

    /* Top chrome: transparent macOS-style gradient instead of a dark slab. */
    html body header.navbar,
    html body .navbar-fixed-top,
    html body #topbar,
    html body .topbar {
      background:
        linear-gradient(110deg,
          rgba(4, 12, 22, 0.56) 0%,
          rgba(8, 27, 47, 0.43) 32%,
          rgba(14, 48, 72, 0.31) 63%,
          rgba(8, 27, 45, 0.36) 82%,
          rgba(4, 13, 23, 0.50) 100%),
        linear-gradient(180deg,
          rgba(255, 255, 255, 0.055) 0%,
          rgba(255, 255, 255, 0.012) 42%,
          rgba(0, 0, 0, 0.045) 100%) !important;
      background-color: rgba(6, 18, 31, 0.42) !important;
      border-bottom: 1px solid var(--us-chrome-line) !important;
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.10),
        inset 0 1px 0 rgba(255, 255, 255, 0.052),
        inset 0 -1px 0 rgba(75, 167, 236, 0.028) !important;
      -webkit-backdrop-filter: blur(14px) saturate(138%) !important;
      backdrop-filter: blur(14px) saturate(138%) !important;
    }

    /* Main left menu: blue-black glass, not neutral gray. */
    html body #sidebar_left {
      background:
        radial-gradient(circle at 4% 10%, rgba(62, 151, 219, 0.14), transparent 34%),
        linear-gradient(180deg,
          rgba(7, 25, 41, 0.69) 0%,
          rgba(5, 18, 31, 0.63) 48%,
          rgba(3, 13, 23, 0.68) 100%) !important;
      background-color: rgba(5, 18, 30, 0.65) !important;
      border-right: 1px solid var(--us-chrome-line) !important;
      box-shadow:
        10px 0 30px rgba(0, 0, 0, 0.09),
        inset -1px 0 0 rgba(255, 255, 255, 0.025),
        inset 0 1px 0 rgba(125, 192, 244, 0.025) !important;
      -webkit-backdrop-filter: blur(12px) saturate(132%) !important;
      backdrop-filter: blur(12px) saturate(132%) !important;
    }

    html body #sidebar_left .nav > li > a,
    html body #sidebar_left a {
      color: rgba(211, 225, 238, 0.82) !important;
    }

    html body #sidebar_left .nav > li > a:hover,
    html body #sidebar_left a:hover {
      color: rgba(248, 251, 255, 0.97) !important;
      background:
        linear-gradient(90deg, rgba(79, 169, 240, 0.11), rgba(79, 169, 240, 0.035)) !important;
    }

    html body #sidebar_left .nav > li.active > a,
    html body #sidebar_left .active > a,
    html body #sidebar_left a.active {
      color: #f5faff !important;
      background:
        linear-gradient(90deg,
          rgba(50, 151, 234, 0.22),
          rgba(27, 102, 177, 0.105) 72%,
          rgba(18, 71, 126, 0.055)) !important;
      border-color: rgba(127, 202, 255, 0.17) !important;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.032),
        inset 3px 0 0 rgba(108, 191, 255, 0.38) !important;
    }

    /* Project rail uses the same family, but is lighter so the two rails
       separate without looking like unrelated gray/red columns. */
    html body #pmlt {
      background:
        radial-gradient(circle at 0 18%, rgba(70, 155, 220, 0.075), transparent 38%),
        linear-gradient(180deg,
          rgba(7, 22, 37, 0.39) 0%,
          rgba(5, 16, 28, 0.31) 52%,
          rgba(4, 13, 23, 0.37) 100%) !important;
      background-color: rgba(5, 17, 29, 0.34) !important;
      border-right: 1px solid rgba(156, 208, 250, 0.10) !important;
      box-shadow:
        8px 0 26px rgba(0, 0, 0, 0.055),
        inset -1px 0 0 rgba(255, 255, 255, 0.022) !important;
      -webkit-backdrop-filter: blur(10px) saturate(126%) !important;
      backdrop-filter: blur(10px) saturate(126%) !important;
    }

    html body #pmlt a,
    html body #project_menu a {
      color: rgba(211, 227, 241, 0.88) !important;
    }

    html body #pmlt a:hover,
    html body #project_menu a:hover {
      color: #ffffff !important;
      text-shadow: 0 0 14px rgba(103, 190, 255, 0.16) !important;
    }
'''

marker = '\n    @media print {'
pos = s.rfind(marker)
if pos < 0:
    raise SystemExit('Final print block not found')
s = s[:pos] + block + s[pos:]

p.write_text(s, encoding='utf-8')
