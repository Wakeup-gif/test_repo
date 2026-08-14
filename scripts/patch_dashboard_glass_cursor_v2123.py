from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"

text = TARGET.read_text(encoding="utf-8")

if "// @version      2.1.22" not in text:
    raise SystemExit("Expected canonical Full UI Theme v2.1.22")

text = text.replace("// @version      2.1.22", "// @version      2.1.23", 1)
text = re.sub(
    r"^// @description  .*?$",
    "// @description  Stable SquareCoil glass UI with a unified Job Dashboard, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    text,
    count=1,
    flags=re.MULTILINE,
)

start_marker = "    /* v2.1.16 JOB DASHBOARD GLASS BLUR */"
start = text.find(start_marker)
if start < 0:
    raise SystemExit("Dashboard glass block not found")

end_marker = "    @media print {"
end = text.find(end_marker, start)
if end < 0:
    raise SystemExit("Print block boundary not found")

replacement = r'''    /* =========================================================
       v2.1.23 JOB DASHBOARD GLASS SYSTEM
       Paint-only dashboard unification. Preserve native geometry while
       replacing opaque widget layers with the shared restrained glass UI.
    ========================================================= */
    html.us-sign-job-dashboard #content .tray-center {
      color: var(--us-text-soft) !important;
    }

    html.us-sign-job-dashboard #customer-name,
    html.us-sign-job-dashboard #customer-info,
    html.us-sign-job-dashboard #content .tray-center > .pl15.pr15 > .well:has(.important-notes) {
      background:
        linear-gradient(145deg, rgba(118, 190, 246, 0.038), transparent 36%),
        linear-gradient(180deg, rgba(8, 17, 28, 0.19), rgba(5, 11, 19, 0.12)) !important;
      background-color: rgba(7, 15, 25, 0.16) !important;
      border: 1px solid rgba(226, 242, 255, 0.10) !important;
      box-shadow:
        0 14px 34px rgba(0, 0, 0, 0.11),
        inset 0 1px 0 rgba(255, 255, 255, 0.040) !important;
      -webkit-backdrop-filter: blur(8px) saturate(118%) !important;
      backdrop-filter: blur(8px) saturate(118%) !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(
      .panel,
      .well,
      .panel-tile,
      .tab-content
    ) {
      color: var(--us-text-soft) !important;
      background: rgba(7, 15, 25, 0.095) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.070) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.022) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(
      .panel-heading,
      .panel-menu,
      .panel-footer
    ) {
      color: var(--us-text) !important;
      background: rgba(255, 255, 255, 0.025) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.070) !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-job-dashboard #content .tray-center .panel-heading {
      border-bottom-color: rgba(226, 242, 255, 0.080) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .panel-footer {
      background: rgba(255, 255, 255, 0.018) !important;
      border-top-color: rgba(226, 242, 255, 0.065) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .panel-body {
      color: var(--us-text-soft) !important;
      background: transparent !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.060) !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(
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

    html.us-sign-job-dashboard #content .tray-center :is(
      p,
      li,
      td,
      th,
      label,
      address,
      .timeline-desc
    ) {
      color: rgba(222, 231, 240, 0.90) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(
      small,
      .text-muted,
      .help-block,
      .timeline-date
    ) {
      color: var(--us-text-muted) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-job-dashboard #content .tray-center a:not(.btn) {
      color: rgba(174, 216, 250, 0.96) !important;
      -webkit-text-fill-color: currentColor !important;
    }

    html.us-sign-job-dashboard #content .tray-center a:not(.btn):hover,
    html.us-sign-job-dashboard #content .tray-center a:not(.btn):focus {
      color: #ffffff !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(
      [style*="color: black" i],
      [style*="color:black" i],
      [style*="color: #000" i],
      [style*="color:#000" i],
      [style*="color: rgb(0" i],
      font[color="black" i],
      font[color="#000" i],
      font[color="#000000" i]
    ) {
      color: rgba(232, 239, 247, 0.92) !important;
      -webkit-text-fill-color: rgba(232, 239, 247, 0.92) !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(table, .table) {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.012) !important;
      background-image: none !important;
      border-color: rgba(226, 242, 255, 0.065) !important;
      box-shadow: none !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(table, .table) :is(th, td) {
      background: transparent !important;
      border-color: rgba(226, 242, 255, 0.055) !important;
    }

    html.us-sign-job-dashboard #content .tray-center :is(table, .table) thead :is(th, td) {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.026) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .table-hover > tbody > tr:hover > :is(td, th) {
      background: rgba(118, 190, 246, 0.050) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .list-group-item {
      color: var(--us-text-soft) !important;
      background: transparent !important;
      border-color: rgba(226, 242, 255, 0.060) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .panel-tile .icon-bg {
      color: var(--us-accent) !important;
      opacity: 0.10 !important;
    }

    html.us-sign-job-dashboard #content .tray-center ol.timeline-list {
      color: var(--us-text-muted) !important;
    }

    html.us-sign-job-dashboard #content .tray-center ol.timeline-list li.timeline-item::after {
      background: rgba(226, 242, 255, 0.075) !important;
    }

    html.us-sign-job-dashboard #content .tray-center ol.timeline-list li.timeline-item + .timeline-item {
      border-top-color: rgba(226, 242, 255, 0.060) !important;
    }

    html.us-sign-job-dashboard #content .tray-center ol.timeline-list li.timeline-item .timeline-icon {
      color: var(--us-text) !important;
      background: rgba(80, 165, 238, 0.18) !important;
      border-color: rgba(226, 242, 255, 0.12) !important;
      opacity: 0.92 !important;
    }

    html.us-sign-job-dashboard #content .tray-center .task-widget ul.task-list,
    html.us-sign-job-dashboard #content .tray-center .task-widget.task-alt ul.task-list {
      background: transparent !important;
      border-color: rgba(226, 242, 255, 0.060) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .task-widget ul.task-list .task-label {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.026) !important;
      border-bottom-color: rgba(226, 242, 255, 0.060) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .task-widget ul.task-list .task-item {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.014) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .task-widget ul.task-list .task-item + .task-item {
      border-top: 1px solid rgba(226, 242, 255, 0.045) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .task-widget ul.task-list .task-item.item-checked .task-desc {
      color: rgba(150, 165, 181, 0.78) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .calendar-widget :is(
      .fc-toolbar,
      .fc-bg,
      th.fc-day-header,
      .fc-view-container .fc-event
    ) {
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.016) !important;
      border-color: rgba(226, 242, 255, 0.060) !important;
      box-shadow: none !important;
    }

    html.us-sign-job-dashboard #content .tray-center .calendar-widget .fc-bg .fc-other-month {
      background: rgba(255, 255, 255, 0.008) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .tab-block .nav-tabs > li > a {
      color: var(--us-text-muted) !important;
      background: rgba(255, 255, 255, 0.012) !important;
      border-color: rgba(226, 242, 255, 0.055) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .tab-block .nav-tabs > li.active > a,
    html.us-sign-job-dashboard #content .tray-center .tab-block .nav-tabs > li > a:hover {
      color: var(--us-text) !important;
      background: rgba(118, 190, 246, 0.060) !important;
      border-color: rgba(226, 242, 255, 0.090) !important;
    }

    html.us-sign-job-dashboard #content .tray-center .progress {
      background: rgba(255, 255, 255, 0.045) !important;
      box-shadow: none !important;
    }

    html.us-sign-job-dashboard #customer-info :is(
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
    ),
    html.us-sign-job-dashboard #content .tray-center > .pl15.pr15 > .well:has(.important-notes) :is(
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


    /* =========================================================
       v2.1.23 CUTOUT GEOMETRIC CURSOR
       CSS-only brand-like triangle glyph. No outline, mouse tracking,
       DOM overlay, observer, or animation loop.
    ========================================================= */
    @media (pointer: fine) {
      html,
      body {
        cursor: url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-cutout-v2123.svg") 3 3, default !important;
      }

      a,
      button,
      .btn,
      [role="button"],
      summary,
      select,
      label[for],
      input[type="button"],
      input[type="submit"],
      input[type="reset"],
      input[type="checkbox"],
      input[type="radio"] {
        cursor: url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-cutout-hover-v2123.svg") 4 3, pointer !important;
      }

      input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]),
      textarea,
      [contenteditable="true"],
      .cke_editable,
      .cke_contents,
      .cke_contents iframe {
        cursor: text !important;
      }

      [disabled],
      .disabled,
      [aria-disabled="true"] {
        cursor: not-allowed !important;
      }

      [class*="resize" i],
      [class*="resizer" i],
      .ui-resizable-handle {
        cursor: revert !important;
      }
    }

'''

text = text[:start] + replacement + text[end:]
TARGET.write_text(text, encoding="utf-8")
