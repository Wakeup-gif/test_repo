from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "// @version      2.1.27" not in text:
    raise SystemExit("Expected Full UI Theme v2.1.27 before patching")

text = text.replace("// @version      2.1.27", "// @version      2.1.28", 1)
text = text.replace(
    "// @description  Stable SquareCoil frosted-glass UI with aligned native top chrome, a true-blur main Dashboard, unified Job Dashboard and Design workspaces, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    "// @description  Stable SquareCoil frosted-glass UI with aligned native top chrome, reliable true-blur main Dashboard detection, unified Job Dashboard and Design workspaces, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    1,
)

old = r'''  // v2.1.27: distinguish the landing Dashboard from project/job dashboards.
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
'''

new = r'''  // v2.1.28: reliably distinguish the landing Dashboard from project/job pages.
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

if old not in text:
    raise SystemExit("v2.1.27 main Dashboard marker block not found")

text = text.replace(old, new, 1)
TARGET.write_text(text, encoding="utf-8")
