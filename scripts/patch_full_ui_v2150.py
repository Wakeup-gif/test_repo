from pathlib import Path

CANON = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
FRESH = Path('tampermonkey/US-Sign-Full-UI-Theme-v2.1.50.user.js')

text = CANON.read_text(encoding='utf-8')
if '// @version      2.1.49' not in text:
    raise SystemExit('Expected v2.1.49 canonical theme')

text = text.replace('// @version      2.1.49', '// @version      2.1.50', 1)
text = text.replace(
    'Stable SquareCoil frosted-glass UI with a global 10% darker glass backdrop pass,',
    'Stable SquareCoil frosted-glass dark-mode UI with deeper high-contrast glass surfaces,',
    1,
)

anchor = '''  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'''
if anchor not in text:
    raise SystemExit('Could not find Full UI CSS close / Bing rotation anchor')

patch = r'''

    /* =========================================================
       v2.1.50 DARK MODE
       Preserve the current geometry, blur, wallpaper, semantic colors, and
       page-specific layouts. Only deepen the visual system: darker neutral
       canvas/surfaces, stronger text contrast, and quieter borders.
    ========================================================= */

    :root {
      --us-bg: rgba(3, 8, 14, 0.82) !important;
      --us-bg-elevated: rgba(5, 11, 19, 0.91) !important;
      --us-bg-soft: rgba(8, 16, 26, 0.86) !important;
      --us-glass: rgba(5, 11, 19, 0.78) !important;
      --us-glass-strong: rgba(3, 8, 15, 0.90) !important;
      --us-glass-soft: rgba(255, 255, 255, 0.030) !important;
      --us-hover: rgba(111, 185, 246, 0.095) !important;
      --us-text: #f7f9fc !important;
      --us-text-soft: #d7dee8 !important;
      --us-text-muted: #9aa9ba !important;
      --us-border: rgba(168, 207, 239, 0.095) !important;
      --us-border-strong: rgba(181, 220, 252, 0.145) !important;
      --us-shadow-sm: 0 5px 16px rgba(0, 0, 0, 0.24) !important;
      --us-shadow-md: 0 14px 36px rgba(0, 0, 0, 0.30) !important;
      --us-shadow-lg: 0 24px 60px rgba(0, 0, 0, 0.40) !important;

      --us-design-surface: rgba(3, 8, 15, 0.46) !important;
      --us-design-surface-strong: rgba(3, 8, 15, 0.58) !important;
      --us-design-surface-soft: rgba(255, 255, 255, 0.012) !important;
      --us-design-hover: rgba(118, 190, 246, 0.050) !important;
      --us-design-border: rgba(226, 242, 255, 0.060) !important;
      --us-design-border-strong: rgba(226, 242, 255, 0.090) !important;
    }

    /* Main neutral chrome. These override only paint, never geometry. */
    html body header,
    html body header.navbar,
    html body .navbar,
    html body .navbar-fixed-top,
    html body #topbar,
    html body .topbar {
      background-color: rgba(3, 9, 16, 0.90) !important;
      border-color: rgba(183, 218, 247, 0.085) !important;
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.25) !important;
    }

    html body #sidebar_left {
      background-color: rgba(3, 9, 16, 0.46) !important;
      border-right-color: rgba(183, 218, 247, 0.075) !important;
    }

    html body #pmlt {
      background-color: rgba(3, 8, 15, 0.72) !important;
      border-right-color: rgba(183, 218, 247, 0.075) !important;
    }

    /* Dark-mode glass surfaces. Keep existing gradients/background-images;
       changing background-color only lets their current character survive. */
    html body :is(
      .panel,
      .panel-default,
      .well,
      .modal-content,
      .popover,
      .dropdown-menu,
      #customer-info,
      #customer-name,
      #showbtns,
      #mapcontainer,
      #filesbox,
      #descriptionbox,
      #projectbox,
      #designbox,
      .note-editor,
      .cke,
      .cke_inner
    ) {
      background-color: rgba(4, 10, 18, 0.72) !important;
      border-color: rgba(185, 219, 247, 0.085) !important;
      box-shadow: 0 8px 26px rgba(0, 0, 0, 0.20) !important;
    }

    html body :is(
      .panel-heading,
      .panel-footer,
      .modal-header,
      .modal-footer,
      .cke_top,
      .cke_bottom,
      .note-toolbar,
      .panel-menu
    ) {
      background-color: rgba(255, 255, 255, 0.018) !important;
      border-color: rgba(185, 219, 247, 0.070) !important;
    }

    html body :is(
      input:not([type="checkbox"]):not([type="radio"]),
      textarea,
      select,
      .form-control,
      .input-group-addon
    ) {
      color: #f4f7fb !important;
      background-color: rgba(2, 7, 13, 0.72) !important;
      border-color: rgba(178, 213, 242, 0.105) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.018) !important;
    }

    html body :is(
      input:not([type="checkbox"]):not([type="radio"]),
      textarea,
      select,
      .form-control
    )::placeholder {
      color: rgba(183, 195, 209, 0.58) !important;
    }

    html body :is(
      .btn,
      button,
      input[type="button"],
      input[type="submit"],
      a.btn
    ):not([data-us-state]) {
      background-color: rgba(5, 12, 20, 0.70) !important;
      border-color: rgba(178, 213, 242, 0.10) !important;
      color: #e8eef6 !important;
    }

    html body :is(
      .btn,
      button,
      input[type="button"],
      input[type="submit"],
      a.btn
    ):not([data-us-state]):hover {
      background-color: rgba(17, 30, 44, 0.80) !important;
      border-color: rgba(178, 213, 242, 0.15) !important;
      color: #fff !important;
    }

    /* Tables stay readable without becoming opaque slabs. */
    html body :is(table, .table) {
      color: var(--us-text-soft) !important;
      background-color: rgba(3, 8, 14, 0.34) !important;
      border-color: rgba(177, 211, 240, 0.065) !important;
    }

    html body :is(table, .table) > :is(thead, tbody, tfoot) > tr > :is(th, td) {
      border-color: rgba(177, 211, 240, 0.060) !important;
    }

    html body :is(table, .table) > thead > tr > th {
      color: #f1f5fa !important;
      background-color: rgba(255, 255, 255, 0.022) !important;
    }

    /* Darken page-specific primary glass while preserving existing blur. */
    html.us-sign-main-dashboard :is(
      #widget-tasks,
      #widget-designs,
      #widget-estimates,
      #page-content .panel-body.bg-light
    ),
    html.us-sign-design-page :is(
      #customer-name,
      #customer-info,
      #showbtns,
      #projectbox,
      #descriptionbox,
      #designbox,
      #filesbox
    ),
    html.us-sign-job-dashboard :is(
      #customer-name,
      #customer-info,
      #showbtns,
      #projectbox,
      #descriptionbox,
      #designbox,
      #filesbox
    ),
    html.us-sign-project-status-page :is(
      #customer-info,
      #content .tray-center > .pl15.pr15 > .well,
      .tab-block > .tabs-left,
      .tab-block > .tab-content
    ) {
      background-color: rgba(3, 9, 16, 0.64) !important;
      border-color: rgba(184, 218, 247, 0.075) !important;
    }

    /* CKEditor content stays crisp but uses a true dark canvas. */
    html body .cke_contents,
    html body .cke_wysiwyg_frame {
      background-color: rgba(2, 6, 11, 0.70) !important;
    }

'''

text = text.replace(anchor, patch + anchor, 1)
CANON.write_text(text, encoding='utf-8')
FRESH.write_text(text, encoding='utf-8')
print('Patched Full UI Theme to v2.1.50 dark mode')
