from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
THEME = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"
DESIGN = ROOT / "tampermonkey" / "US-Sign-Design-Job-Tools.user.js"

theme = THEME.read_text(encoding="utf-8")
design = DESIGN.read_text(encoding="utf-8")

if "// @version      2.1.23" not in theme:
    raise SystemExit("Expected Full UI Theme v2.1.23")
if "// @version      4.1.3" not in design:
    raise SystemExit("Expected Design Job Tools v4.1.3")

# Design Job Tools owns page structure/detection. Mark the page only after
# the real Design workspace has successfully been found.
design = design.replace("// @version      4.1.3", "// @version      4.1.4", 1)
design = design.replace('const VERSION = "4.1.3";', 'const VERSION = "4.1.4";', 1)
design = design.replace(
    '      state.table = table;\n      state.workspace = workspace;\n',
    '      state.table = table;\n      state.workspace = workspace;\n      document.documentElement.classList.add("us-sign-design-page");\n      document.documentElement.classList.remove("us-sign-job-dashboard");\n',
    1,
)
design = design.replace(
    '  function startDiscovery() {\n    stopDiscovery();\n',
    '  function startDiscovery() {\n    document.documentElement.classList.remove("us-sign-design-page");\n    stopDiscovery();\n',
    1,
)

# Theme owns Design page paint. Keep geometry in Design Job Tools.
theme = theme.replace("// @version      2.1.23", "// @version      2.1.24", 1)
theme = theme.replace(
    "// @description  Stable SquareCoil glass UI with a unified Job Dashboard, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    "// @description  Stable SquareCoil glass UI with unified Job Dashboard and Design workspaces, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    1,
)

marker = '''\n\n    /* =========================================================\n       v2.1.23 CUTOUT GEOMETRIC CURSOR\n'''
if marker not in theme:
    raise SystemExit("Cursor marker not found")

block = r'''

    /* =========================================================
       v2.1.24 DESIGN PAGE GLASS SYSTEM
       Paint-only unification for the Design workspace. Geometry, mounting,
       ordering, and responsive layout remain owned by Design Job Tools.
    ========================================================= */
    html.us-sign-design-page #customer-name,
    html.us-sign-design-page #customer-info {
      background:
        linear-gradient(145deg, rgba(118, 190, 246, 0.040), transparent 36%),
        linear-gradient(180deg, rgba(8, 17, 28, 0.18), rgba(5, 11, 19, 0.11)) !important;
      background-color: rgba(7, 15, 25, 0.15) !important;
      border-color: rgba(226, 242, 255, 0.10) !important;
      box-shadow:
        0 12px 30px rgba(0, 0, 0, 0.09),
        inset 0 1px 0 rgba(255, 255, 255, 0.040) !important;
      -webkit-backdrop-filter: blur(8px) saturate(118%) !important;
      backdrop-filter: blur(8px) saturate(118%) !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column > .panel {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #us-sign-design-actionbar {
      background:
        linear-gradient(145deg, rgba(118, 190, 246, 0.036), transparent 42%),
        linear-gradient(180deg, rgba(9, 18, 29, 0.18), rgba(5, 12, 20, 0.12)) !important;
      background-color: rgba(7, 15, 25, 0.15) !important;
      border-color: rgba(226, 242, 255, 0.085) !important;
      box-shadow:
        0 9px 24px rgba(0, 0, 0, 0.07),
        inset 0 1px 0 rgba(255, 255, 255, 0.032) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #us-sign-job-overview,
    html.us-sign-design-page #us-sign-design-summary {
      color: var(--us-text-soft) !important;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.018), rgba(84, 160, 222, 0.008)),
        rgba(7, 15, 25, 0.095) !important;
      background-color: rgba(7, 15, 25, 0.095) !important;
      border-color: rgba(226, 242, 255, 0.065) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.022) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #us-sign-job-overview .us-sign-overview-title {
      color: var(--us-text) !important;
      background: rgba(255, 255, 255, 0.020) !important;
      border-color: rgba(226, 242, 255, 0.060) !important;
      text-shadow: none !important;
    }

    html.us-sign-design-page #us-sign-job-overview .us-sign-overview-field,
    html.us-sign-design-page #us-sign-design-summary > .us-sign-djt-summary-cell {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.012) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.050) !important;
      box-shadow: none !important;
    }

    html.us-sign-design-page #us-sign-job-overview .us-sign-overview-field:hover,
    html.us-sign-design-page #us-sign-job-overview .us-sign-overview-field:focus-visible {
      background: rgba(118, 190, 246, 0.045) !important;
      border-color: rgba(226, 242, 255, 0.085) !important;
      outline: none !important;
    }

    html.us-sign-design-page #us-sign-job-overview :is(.us-sign-overview-label),
    html.us-sign-design-page #us-sign-design-summary :is(.us-sign-djt-summary-label) {
      color: var(--us-text-muted) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-design-page #us-sign-job-overview :is(.us-sign-overview-value),
    html.us-sign-design-page #us-sign-design-summary :is(.us-sign-djt-summary-value) {
      color: rgba(238, 245, 251, 0.96) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-design-page #us-sign-design-bottom-grid,
    html.us-sign-design-page #us-sign-design-right-stack,
    html.us-sign-design-page .us-sign-design-workbench,
    html.us-sign-design-page .us-sign-design-workspace-column {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #us-sign-design-bottom-grid > .us-sign-description-panel,
    html.us-sign-design-page #us-sign-design-right-stack > .us-sign-designs-panel,
    html.us-sign-design-page #us-sign-design-right-stack > .us-sign-files-panel {
      color: var(--us-text-soft) !important;
      background:
        linear-gradient(145deg, rgba(119, 187, 241, 0.025), transparent 35%),
        linear-gradient(180deg, rgba(7, 15, 25, 0.105), rgba(4, 10, 18, 0.075)) !important;
      background-color: rgba(6, 14, 24, 0.105) !important;
      border-color: rgba(226, 242, 255, 0.070) !important;
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.050),
        inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #us-sign-design-bottom-grid > .us-sign-description-panel > .panel-heading,
    html.us-sign-design-page #us-sign-design-right-stack > .us-sign-designs-panel > .panel-heading,
    html.us-sign-design-page #us-sign-design-right-stack > .us-sign-files-panel > .panel-heading,
    html.us-sign-design-page #content .us-sign-design-workspace-column :is(.panel-menu, .panel-footer) {
      color: var(--us-text) !important;
      background: rgba(255, 255, 255, 0.020) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.060) !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column .panel-body {
      color: var(--us-text-soft) !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.050) !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column :is(
      .panel-title,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      strong,
      b
    ) {
      color: var(--us-text) !important;
      -webkit-text-fill-color: currentColor !important;
      text-shadow: none !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column :is(
      p,
      li,
      td,
      th,
      label,
      address
    ) {
      color: rgba(222, 231, 240, 0.90) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column :is(
      small,
      .text-muted,
      .help-block
    ) {
      color: var(--us-text-muted) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column :is(table, .table) {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.010) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.055) !important;
      box-shadow: none !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column :is(table, .table) :is(th, td) {
      background: transparent !important;
      border-color: rgba(226, 242, 255, 0.050) !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column :is(table, .table) thead :is(th, td) {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.022) !important;
    }

    html.us-sign-design-page #content .us-sign-design-workspace-column .table-hover > tbody > tr:hover > :is(td, th) {
      background: rgba(118, 190, 246, 0.045) !important;
    }

    html.us-sign-design-page #us-sign-design-actionbar :is(button, a.btn, .us-sign-native-action),
    html.us-sign-design-page #us-sign-job-overview .us-sign-overview-field {
      color: var(--us-text-soft) !important;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.032), rgba(74, 148, 210, 0.012)),
        rgba(7, 15, 25, 0.16) !important;
      border-color: rgba(226, 242, 255, 0.075) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
    }

    html.us-sign-design-page #us-sign-design-actionbar :is(button, a.btn, .us-sign-native-action):hover,
    html.us-sign-design-page #us-sign-design-actionbar :is(button, a.btn, .us-sign-native-action):focus-visible {
      color: #ffffff !important;
      background: rgba(118, 190, 246, 0.060) !important;
      border-color: rgba(174, 219, 255, 0.12) !important;
      outline: none !important;
    }

    html.us-sign-design-page #customer-info :is(
      .panel,
      .panel-heading,
      .panel-body,
      .panel-footer,
      .panel-menu,
      input,
      textarea,
      select,
      button,
      a.btn
    ) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }
'''

theme = theme.replace(marker, block + marker, 1)

THEME.write_text(theme, encoding="utf-8")
DESIGN.write_text(design, encoding="utf-8")
