from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
FULL = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"
SCOPE = ROOT / "tampermonkey" / "US-Sign-Project-Scope-Workspace.user.js"

full = FULL.read_text(encoding="utf-8")
scope = SCOPE.read_text(encoding="utf-8")

if "@version      2.1.32" not in full:
    raise SystemExit("expected Full UI v2.1.32")
if "@version      1.2.0" not in scope:
    raise SystemExit("expected Project Scope Workspace v1.2.0")

# Project/Scope Workspace must not restructure the native Project Status page.
scope = scope.replace("@version      1.2.0", "@version      1.2.1", 1)
scope = scope.replace(
    "Preserves the working Scope layout while adding performance-conscious blue glass surfaces, lighter editor chrome, and matched project cards.",
    "Preserves the working Scope layout while explicitly leaving Project Status/Milestones on its native three-column structure.",
    1,
)
needle = '''(function () {\n  "use strict";\n\n'''
replacement = '''(function () {\n  "use strict";\n\n  // The Status/Milestones page has its own native split-pane layout. This\n  // workspace is intentionally excluded so Scope grid rules cannot reshape it.\n  if (/\\/project_milestones\\.php$/i.test(location.pathname)) return;\n\n'''
if needle not in scope:
    raise SystemExit("scope strict marker not found")
scope = scope.replace(needle, replacement, 1)

# Full UI: recognize Status explicitly and keep it out of the generic Job Dashboard marker.
full = full.replace("@version      2.1.32", "@version      2.1.33", 1)
full = full.replace(
    "Stable SquareCoil frosted-glass UI with aligned native top chrome, source-targeted true-blur main Dashboard, rotating curated Bing UHD wallpapers every 30 minutes with subtle pointer parallax, unified Job Dashboard and Design workspaces, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    "Stable SquareCoil frosted-glass UI with native-structure Project Status styling, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.",
    1,
)
needle = '''(function () {\n  "use strict";\n\n'''
replacement = '''(function () {\n  "use strict";\n\n  const usSignIsProjectStatusPage = /\\/project_milestones\\.php$/i.test(location.pathname);\n  if (usSignIsProjectStatusPage && document.documentElement) {\n    document.documentElement.classList.add("us-sign-project-status-page");\n  }\n\n'''
if needle not in full:
    raise SystemExit("full strict marker not found")
full = full.replace(needle, replacement, 1)

old_marker = '''  function usSignMarkJobDashboard() {\n    const hasCustomer = !!document.querySelector('#customer-info');\n    const hasImportantNotes = !!document.querySelector('.important-notes');\n    const isScope = !!document.querySelector('#ps-select, .us-sign-scope-enhanced');\n    const isDesign = !!document.querySelector('#us-sign-design-actionbar, #us-sign-design-bottom-grid');\n    if (hasCustomer && hasImportantNotes && !isScope && !isDesign) document.documentElement.classList.add('us-sign-job-dashboard');\n  }'''
new_marker = '''  function usSignMarkJobDashboard() {\n    const hasCustomer = !!document.querySelector('#customer-info');\n    const hasImportantNotes = !!document.querySelector('.important-notes');\n    const isScope = !!document.querySelector('#ps-select, .us-sign-scope-enhanced');\n    const isDesign = !!document.querySelector('#us-sign-design-actionbar, #us-sign-design-bottom-grid');\n    const isStatus = usSignIsProjectStatusPage || document.documentElement.classList.contains('us-sign-project-status-page');\n    if (isStatus) {\n      document.documentElement.classList.remove('us-sign-job-dashboard');\n      return;\n    }\n    if (hasCustomer && hasImportantNotes && !isScope && !isDesign) document.documentElement.classList.add('us-sign-job-dashboard');\n  }'''
if old_marker not in full:
    raise SystemExit("job dashboard marker not found")
full = full.replace(old_marker, new_marker, 1)

status_css = r'''

    /* =========================================================
       v2.1.33 PROJECT STATUS / MILESTONES
       Snapshot-grounded native structure. Paint the real SquareCoil layout
       instead of turning it into the generic Project/Scope dashboard grid.
       Native geometry from the captured page remains authoritative:
       app sidebar -> #pmlt project rail -> tray-center workspace, with the
       milestone tabs remaining a left rail + right tab-content split pane.
    ========================================================= */

    html.us-sign-project-status-page #customer-name {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-project-status-page #customer-info {
      background:
        linear-gradient(180deg, rgba(117, 184, 238, 0.040), rgba(5, 13, 22, 0.10)) !important;
      background-color: rgba(7, 15, 25, 0.16) !important;
      border: 1px solid rgba(226, 242, 255, 0.075) !important;
      border-radius: 7px !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.025) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-project-status-page #content .tray-center > .pl15.pr15 > .alert.alert-micro {
      background:
        linear-gradient(90deg, rgba(64, 145, 222, 0.24), rgba(37, 102, 168, 0.12)) !important;
      border: 1px solid rgba(128, 196, 255, 0.15) !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }

    html.us-sign-project-status-page #content .tray-center > .pl15.pr15 > .well {
      background:
        linear-gradient(145deg, rgba(126, 194, 246, 0.022), transparent 36%),
        rgba(6, 14, 24, 0.11) !important;
      background-color: rgba(6, 14, 24, 0.11) !important;
      border: 1px solid rgba(226, 242, 255, 0.065) !important;
      border-radius: 8px !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.020) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-project-status-page #content .tray-center > .pl15.pr15 > .tab-block {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-project-status-page .tab-block > .tabs-left {
      background: rgba(5, 13, 22, 0.13) !important;
      border: 1px solid rgba(226, 242, 255, 0.060) !important;
      border-right: 0 !important;
      box-shadow: none !important;
    }

    html.us-sign-project-status-page .tabs-left > li > a {
      min-height: 0 !important;
      margin: 0 !important;
      padding: 12px 16px !important;
      color: rgba(215, 226, 237, 0.78) !important;
      background: rgba(255,255,255,0.018) !important;
      border: 0 !important;
      border-bottom: 1px solid rgba(226,242,255,0.045) !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      font-size: 13px !important;
      line-height: 19.37px !important;
    }

    html.us-sign-project-status-page .tabs-left > li > a:hover {
      color: #fff !important;
      background: rgba(95, 174, 239, 0.075) !important;
    }

    html.us-sign-project-status-page .tabs-left > li > a.active-tab {
      color: #fff !important;
      background:
        linear-gradient(90deg, rgba(62, 153, 235, 0.24), rgba(53, 123, 188, 0.10)) !important;
      border-left: 2px solid rgba(137, 205, 255, 0.72) !important;
    }

    html.us-sign-project-status-page .tab-block > .tab-content {
      background:
        linear-gradient(145deg, rgba(119, 187, 241, 0.022), transparent 34%),
        rgba(5, 12, 20, 0.10) !important;
      background-color: rgba(5, 12, 20, 0.10) !important;
      border: 1px solid rgba(226, 242, 255, 0.060) !important;
      border-radius: 0 8px 8px 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-project-status-page .tab-content > .tab-pane {
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    /* Preserve the compact native controls captured on this page. The generic
       theme's 34px button floor was changing the milestone-page rhythm. */
    html.us-sign-project-status-page .btn-xs,
    html.us-sign-project-status-page input.btn-xs,
    html.us-sign-project-status-page a.btn-xs {
      min-height: 0 !important;
      height: auto !important;
      padding: 1px 5px !important;
      font-size: 12px !important;
      line-height: 18px !important;
    }

    html.us-sign-project-status-page .btn-sm,
    html.us-sign-project-status-page input.btn-sm,
    html.us-sign-project-status-page a.btn-sm {
      min-height: 0 !important;
      height: auto !important;
      padding: 5px 10px !important;
      font-size: 12px !important;
      line-height: 18px !important;
    }

    html.us-sign-project-status-page .tab-content :is(.btn, input.btn, a.btn):not(.btn-xs):not(.btn-sm) {
      min-height: 0 !important;
      height: auto !important;
      padding: 9px 12px !important;
      font-size: 13px !important;
      line-height: 19.37px !important;
    }

    html.us-sign-project-status-page #notes {
      min-height: 0 !important;
      height: 76px !important;
      resize: vertical !important;
    }
'''

marker_re = re.compile(r'(\n  `\);\n\n  // =========================================================\n  // v2\.1\.30 CURATED BING WALLPAPER ROTATION)')
match = marker_re.search(full)
if not match:
    raise SystemExit("Full UI CSS closing marker not found")
full = full[:match.start()] + status_css + full[match.start():]

FULL.write_text(full, encoding="utf-8")
SCOPE.write_text(scope, encoding="utf-8")
