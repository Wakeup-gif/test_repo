from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.1.28" not in text:
    raise SystemExit("expected v2.1.28 canonical theme")

text = text.replace("@version      2.1.28", "@version      2.1.29", 1)
text = text.replace(
    "reliable true-blur main Dashboard detection",
    "source-targeted true-blur main Dashboard",
    1,
)

old_detection = r'''  // v2.1.28: reliably distinguish the landing Dashboard from project/job pages.
  // The three native .panel-tile summary cards are the strongest signature.
  // Bounded checks only; no permanent observer or polling loop.
  function usSignMarkMainDashboard() {
    document.documentElement.classList.remove('us-sign-main-dashboard');

    const projectContext = document.querySelector(
      '#customer-info, #customer-name, #us-sign-design-actionbar, #us-sign-design-bottom-grid, #ps-select, .us-sign-scope-enhanced, .important-notes'
    );
    if (projectContext) return;

    const tileCount = document.querySelectorAll('#content .panel-tile').length;

    const dashboardNavActive = Array.from(
      document.querySelectorAll('#sidebar_left li.active > a, #sidebar_left .active a, #sidebar_left a.selected')
    ).some((el) => /^\s*Dashboard\s*$/i.test(el.textContent || ''));

    const headingNodes = document.querySelectorAll(
      '#topbar h1, #topbar h2, #topbar h3, #content h1, #content h2, #content h3, .content-header h1, .content-header h2'
    );
    const hasDashboardHeading = Array.from(headingNodes).some(
      (el) => /^\s*Dashboard\s*$/i.test(el.textContent || '')
    );

    if (tileCount >= 3 || dashboardNavActive || hasDashboardHeading) {
      document.documentElement.classList.add('us-sign-main-dashboard');
    }
  }

  function usSignScheduleMainDashboardMark() {
    [0, 120, 350, 700, 1400, 2600, 4200].forEach((delay) => window.setTimeout(usSignMarkMainDashboard, delay));
  }
'''

new_detection = r'''  // v2.1.29: source-targeted landing Dashboard detection.
  // dashboard.php owns #page-content plus the three native widget IDs.
  // Bounded checks only; no permanent observer or polling loop.
  function usSignMarkMainDashboard() {
    document.documentElement.classList.remove('us-sign-main-dashboard');

    const projectContext = document.querySelector(
      '#customer-info, #customer-name, #us-sign-design-actionbar, #us-sign-design-bottom-grid, #ps-select, .us-sign-scope-enhanced, .important-notes'
    );
    if (projectContext) return;

    const isDashboardPath = /\/dashboard\.php$/i.test(window.location.pathname);
    const hasPageContent = !!document.querySelector('#page-content');
    const hasNativeWidgets = !!(
      document.querySelector('#widget-tasks') &&
      document.querySelector('#widget-designs') &&
      document.querySelector('#widget-estimates')
    );
    const hasDashboardBreadcrumb = /^\s*Dashboard\s*$/i.test(
      (document.querySelector('#bread-crumb')?.textContent || '')
    );

    if ((isDashboardPath && hasPageContent) || hasNativeWidgets || hasDashboardBreadcrumb) {
      document.documentElement.classList.add('us-sign-main-dashboard');
    }
  }

  function usSignScheduleMainDashboardMark() {
    [0, 120, 350, 700, 1400, 2600, 4200].forEach((delay) => window.setTimeout(usSignMarkMainDashboard, delay));
  }
'''

if old_detection not in text:
    raise SystemExit("v2.1.28 dashboard detection block not found")
text = text.replace(old_detection, new_detection, 1)

anchor = '''    /* =========================================================\n       v2.1.26 TOPBAR GEOMETRY REPAIR'''
if anchor not in text:
    raise SystemExit("topbar anchor not found")

css = r'''

    /* =========================================================
       v2.1.29 SOURCE-TARGETED MAIN DASHBOARD FROST
       Targets the actual dashboard.php DOM from source: the three native
       widget-task panels and the AJAX-loaded #page-content panel body.
    ========================================================= */
    html.us-sign-main-dashboard #widget-tasks,
    html.us-sign-main-dashboard #widget-designs,
    html.us-sign-main-dashboard #widget-estimates {
      background:
        linear-gradient(145deg, rgba(168, 218, 255, 0.075), transparent 38%),
        linear-gradient(180deg, rgba(12, 22, 34, 0.30), rgba(5, 12, 21, 0.20)) !important;
      background-color: rgba(8, 17, 28, 0.22) !important;
      border-color: rgba(226, 242, 255, 0.11) !important;
      box-shadow:
        0 12px 32px rgba(0, 0, 0, 0.10),
        inset 0 1px 0 rgba(255, 255, 255, 0.060) !important;
      -webkit-backdrop-filter: blur(22px) saturate(145%) brightness(0.97) !important;
      backdrop-filter: blur(22px) saturate(145%) brightness(0.97) !important;
    }

    html.us-sign-main-dashboard #widget-tasks > div,
    html.us-sign-main-dashboard #widget-designs > div,
    html.us-sign-main-dashboard #widget-estimates > div {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    /* The loaded Designs/Tasks/Estimates shell must NOT be the backdrop root. */
    html.us-sign-main-dashboard #page-content > div > .panel,
    html.us-sign-main-dashboard #page-content .panel.heading-border {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      box-shadow: none !important;
    }

    /* This is the large visible queue surface shown in DevTools. */
    html.us-sign-main-dashboard #page-content .panel-body.bg-light {
      background:
        linear-gradient(145deg, rgba(142, 204, 252, 0.050), transparent 36%),
        linear-gradient(180deg, rgba(7, 15, 25, 0.23), rgba(4, 10, 18, 0.15)) !important;
      background-color: rgba(7, 15, 25, 0.18) !important;
      border-color: rgba(226, 242, 255, 0.085) !important;
      box-shadow:
        0 16px 38px rgba(0, 0, 0, 0.10),
        inset 0 1px 0 rgba(255, 255, 255, 0.045) !important;
      -webkit-backdrop-filter: blur(20px) saturate(138%) brightness(0.96) !important;
      backdrop-filter: blur(20px) saturate(138%) brightness(0.96) !important;
    }

    html.us-sign-main-dashboard #page-content .panel-body.bg-light > :is(.row, div, table, .table) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }
'''

text = text.replace(anchor, css + "\n" + anchor, 1)
TARGET.write_text(text, encoding="utf-8")
