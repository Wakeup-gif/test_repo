from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "// @version      2.1.26" not in text:
    raise SystemExit("Expected Full UI Theme v2.1.26 before patching")

text = text.replace("// @version      2.1.26", "// @version      2.1.27", 1)
text = text.replace(
    "// @description  Stable SquareCoil frosted-glass UI with aligned native top chrome, unified Job Dashboard and Design workspaces, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    "// @description  Stable SquareCoil frosted-glass UI with aligned native top chrome, a true-blur main Dashboard, unified Job Dashboard and Design workspaces, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    1,
)

css_marker = '''    /* =========================================================\n       v2.1.26 TOPBAR GEOMETRY REPAIR'''
if css_marker not in text:
    raise SystemExit("Topbar CSS insertion marker not found")

css_block = r'''    /* =========================================================
       v2.1.27 MAIN DASHBOARD TRUE FROST
       The landing Dashboard is a separate surface from project/job pages.
       Blur only its visible cards and leave their inner content unblurred.
    ========================================================= */
    html.us-sign-main-dashboard #content :is(
      .panel,
      .panel-default,
      .well,
      .tab-block > .tab-content,
      .task-widget,
      .calendar-widget
    ) {
      background:
        linear-gradient(145deg, rgba(138, 202, 252, 0.050), transparent 35%),
        linear-gradient(180deg, rgba(8, 17, 28, 0.32), rgba(4, 10, 18, 0.22)) !important;
      background-color: rgba(7, 15, 25, 0.26) !important;
      border-color: rgba(226, 242, 255, 0.095) !important;
      box-shadow:
        0 14px 36px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.050) !important;
      -webkit-backdrop-filter: blur(16px) saturate(132%) brightness(0.95) !important;
      backdrop-filter: blur(16px) saturate(132%) brightness(0.95) !important;
    }

    /* The three request/task tiles need a stronger, obvious frost. */
    html.us-sign-main-dashboard #content .panel-tile {
      background:
        linear-gradient(145deg, rgba(165, 216, 255, 0.070), transparent 38%),
        linear-gradient(180deg, rgba(14, 23, 35, 0.34), rgba(5, 12, 21, 0.24)) !important;
      background-color: rgba(9, 17, 28, 0.28) !important;
      border-color: rgba(226, 242, 255, 0.11) !important;
      box-shadow:
        0 12px 32px rgba(0, 0, 0, 0.11),
        inset 0 1px 0 rgba(255, 255, 255, 0.060) !important;
      -webkit-backdrop-filter: blur(22px) saturate(145%) brightness(0.96) !important;
      backdrop-filter: blur(22px) saturate(145%) brightness(0.96) !important;
    }

    /* Inner paint stays transparent so the parent frost remains visible. */
    html.us-sign-main-dashboard #content :is(
      .panel,
      .panel-default,
      .well,
      .panel-tile,
      .tab-block > .tab-content
    ) :is(.panel-heading, .panel-body, .panel-footer, .panel-menu) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-main-dashboard #content :is(.panel, .well, .panel-tile) > .panel-body {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    html.us-sign-main-dashboard #content :is(.panel, .well, .panel-tile) > :is(.panel-heading, .panel-footer, .panel-menu) {
      background: rgba(255, 255, 255, 0.026) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.065) !important;
    }

    /* Avoid expensive stacked blur if SquareCoil nests panels/widgets. */
    html.us-sign-main-dashboard #content :is(.panel, .well, .panel-tile, .tab-content) :is(
      .panel,
      .well,
      .panel-tile,
      .tab-content,
      .task-widget,
      .calendar-widget
    ) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-main-dashboard #content .panel-tile .icon-bg {
      opacity: 0.16 !important;
    }


'''
text = text.replace(css_marker, css_block + css_marker, 1)

js_marker = '''  function usSignMarkJobDashboard() {'''
if js_marker not in text:
    raise SystemExit("Job Dashboard JS insertion marker not found")

js_block = r'''  // v2.1.27: distinguish the landing Dashboard from project/job dashboards.
  // Bounded checks only; no permanent observer or polling loop.
  function usSignMarkMainDashboard() {
    document.documentElement.classList.remove('us-sign-main-dashboard');

    const projectContext = document.querySelector(
      '#customer-info, #customer-name, #us-sign-design-actionbar, #us-sign-design-bottom-grid, #ps-select, .us-sign-scope-enhanced, .important-notes'
    );
    if (projectContext) return;

    const headingNodes = document.querySelectorAll(
      '#topbar h1, #topbar h2, #topbar h3, #content h1, #content h2, #content h3, .content-header h1, .content-header h2'
    );
    const hasDashboardHeading = Array.from(headingNodes).some(
      (el) => /^\s*Dashboard\s*$/i.test(el.textContent || '')
    );

    if (hasDashboardHeading) {
      document.documentElement.classList.add('us-sign-main-dashboard');
    }
  }

  function usSignScheduleMainDashboardMark() {
    [0, 180, 600, 1400].forEach((delay) => window.setTimeout(usSignMarkMainDashboard, delay));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', usSignScheduleMainDashboardMark, { once: true });
  } else {
    usSignScheduleMainDashboardMark();
  }
  window.addEventListener('pageshow', usSignScheduleMainDashboardMark);
  window.addEventListener('us-sign-location-change', usSignScheduleMainDashboardMark);


'''
text = text.replace(js_marker, js_block + js_marker, 1)
TARGET.write_text(text, encoding="utf-8")
