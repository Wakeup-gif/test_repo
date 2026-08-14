from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "// @version      2.1.24" not in text:
    raise SystemExit("Expected Full UI Theme v2.1.24 before patching")

text = text.replace("// @version      2.1.24", "// @version      2.1.25", 1)
text = text.replace(
    "// @description  Stable SquareCoil glass UI with unified Job Dashboard and Design workspaces, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    "// @description  Stable SquareCoil frosted-glass UI with unified Job Dashboard and Design workspaces, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    1,
)

marker = '''    /* =========================================================\n       v2.1.23 CUTOUT GEOMETRIC CURSOR'''
if marker not in text:
    raise SystemExit("Cursor insertion marker not found")

block = r'''
    /* =========================================================
       v2.1.25 VISIBLE GLASS BLUR RESTORE
       Restore true frosted-glass blur to primary Dashboard and Design cards.
       Inner surfaces remain blur-free to avoid stacked backdrop filters.
    ========================================================= */
    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      /* Dashboard: one blur layer per visible card. */
      html.us-sign-job-dashboard #customer-name,
      html.us-sign-job-dashboard #customer-info,
      html.us-sign-job-dashboard #content .tray-center > .pl15.pr15 > .well:has(.important-notes) {
        -webkit-backdrop-filter: blur(14px) saturate(132%) !important;
        backdrop-filter: blur(14px) saturate(132%) !important;
      }

      html.us-sign-job-dashboard #content .tray-center :is(.panel, .well, .panel-tile, .tab-content) {
        -webkit-backdrop-filter: blur(10px) saturate(124%) !important;
        backdrop-filter: blur(10px) saturate(124%) !important;
      }

      /* Do not stack blur inside an already blurred Dashboard card. */
      html.us-sign-job-dashboard #content .tray-center :is(.panel, .well, .panel-tile, .tab-content) :is(.panel, .well, .panel-tile, .tab-content),
      html.us-sign-job-dashboard #content .tray-center :is(.panel-heading, .panel-body, .panel-footer, .panel-menu),
      html.us-sign-job-dashboard #customer-info :is(.panel, .panel-heading, .panel-body, .panel-footer, .panel-menu, input, textarea, select, button, a.btn),
      html.us-sign-job-dashboard #content .tray-center > .pl15.pr15 > .well:has(.important-notes) :is(.panel, .panel-heading, .panel-body, .panel-footer, .panel-menu, input, textarea, select, button, a.btn) {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }

      /* Design: primary identity cards get stronger frost. */
      html.us-sign-design-page #customer-name,
      html.us-sign-design-page #customer-info {
        -webkit-backdrop-filter: blur(14px) saturate(132%) !important;
        backdrop-filter: blur(14px) saturate(132%) !important;
      }

      /* Design workspace modules get a restrained but clearly visible frost. */
      html.us-sign-design-page #us-sign-design-actionbar,
      html.us-sign-design-page #us-sign-job-overview,
      html.us-sign-design-page #us-sign-design-summary,
      html.us-sign-design-page #us-sign-design-bottom-grid > .us-sign-description-panel,
      html.us-sign-design-page #us-sign-design-right-stack > .us-sign-designs-panel,
      html.us-sign-design-page #us-sign-design-right-stack > .us-sign-files-panel {
        -webkit-backdrop-filter: blur(11px) saturate(126%) !important;
        backdrop-filter: blur(11px) saturate(126%) !important;
      }

      /* Keep nested Design controls/surfaces crisp and cheap. */
      html.us-sign-design-page #us-sign-design-actionbar :is(button, a.btn, .us-sign-native-action),
      html.us-sign-design-page #us-sign-job-overview :is(.us-sign-overview-title, .us-sign-overview-field),
      html.us-sign-design-page #us-sign-design-summary > .us-sign-djt-summary-cell,
      html.us-sign-design-page #us-sign-design-bottom-grid > .us-sign-description-panel :is(.panel-heading, .panel-body, .panel-footer, .panel-menu),
      html.us-sign-design-page #us-sign-design-right-stack > .us-sign-designs-panel :is(.panel-heading, .panel-body, .panel-footer, .panel-menu),
      html.us-sign-design-page #us-sign-design-right-stack > .us-sign-files-panel :is(.panel-heading, .panel-body, .panel-footer, .panel-menu),
      html.us-sign-design-page #customer-info :is(.panel, .panel-heading, .panel-body, .panel-footer, .panel-menu, input, textarea, select, button, a.btn) {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
    }


'''
text = text.replace(marker, block + marker, 1)
TARGET.write_text(text, encoding="utf-8")
