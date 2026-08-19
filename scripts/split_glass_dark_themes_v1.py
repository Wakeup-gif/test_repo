from pathlib import Path

SRC_GLASS = Path('tampermonkey/US-Sign-Full-UI-Theme-v2.1.49.user.js')
SRC_DARK = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')

GLASS = Path('tampermonkey/US-Sign-Glass-Theme.user.js')
GLASS_FRESH = Path('tampermonkey/US-Sign-Glass-Theme-v1.0.0.user.js')
DARK = Path('tampermonkey/US-Sign-Dark-Glass-Theme.user.js')
DARK_FRESH = Path('tampermonkey/US-Sign-Dark-Glass-Theme-v1.0.0.user.js')

raw_glass = SRC_GLASS.read_text(encoding='utf-8')
raw_dark = SRC_DARK.read_text(encoding='utf-8')

if '// @version      2.1.49' not in raw_glass:
    raise SystemExit('Expected v2.1.49 glass source')
if '// @version      2.1.50' not in raw_dark:
    raise SystemExit('Expected v2.1.50 dark source')


def replace_meta(text, *, name, namespace, version, description, filename):
    lines = text.splitlines()
    replacements = {
        '// @name         ': name,
        '// @namespace    ': namespace,
        '// @version      ': version,
        '// @description  ': description,
        '// @updateURL    ': f'https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/{filename}',
        '// @downloadURL  ': f'https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/{filename}',
    }
    out = []
    for line in lines:
        replaced = False
        for prefix, value in replacements.items():
            if line.startswith(prefix):
                out.append(prefix + value)
                replaced = True
                break
        if not replaced:
            out.append(line)
    return '\n'.join(out) + ('\n' if text.endswith('\n') else '')


glass = replace_meta(
    raw_glass,
    name='US Sign Glass Theme',
    namespace='us-sign-glass-theme',
    version='1.0.0',
    description='Saved classic SquareCoil glass UI: shared Bing wallpaper, frosted translucent surfaces, semantic project states, refined sidebar, status/design/dashboard layouts, and geometric cursor.',
    filename='US-Sign-Glass-Theme.user.js',
)

# Dark Glass starts from the current dark build, then neutralizes the blue cast
# on background surfaces and enforces one coherent blur recipe on primary glass.
dark = replace_meta(
    raw_dark,
    name='US Sign Dark Glass Theme',
    namespace='us-sign-dark-glass-theme',
    version='1.0.0',
    description='SquareCoil dark glass UI with graphite neutral surfaces, cohesive frost across primary panels, shared Bing wallpaper, semantic project states, refined sidebar, and geometric cursor.',
    filename='US-Sign-Dark-Glass-Theme.user.js',
)

anchor = '''    /* CKEditor content stays crisp but uses a true dark canvas. */\n    html body .cke_contents,\n    html body .cke_wysiwyg_frame {\n      background-color: rgba(2, 6, 11, 0.70) !important;\n    }\n\n  `);'''
if anchor not in dark:
    raise SystemExit('Could not find v2.1.50 CSS close anchor')

neutral_css = r'''

    /* =========================================================
       DARK GLASS v1.0.0 GRAPHITE + COHESIVE FROST
       Keep the existing geometry and semantic state colors. Neutral chrome
       loses the blue cast and all primary glass surfaces share one blur recipe.
    ========================================================= */

    :root {
      --us-bg: rgba(10, 10, 12, 0.84) !important;
      --us-bg-elevated: rgba(14, 14, 17, 0.92) !important;
      --us-bg-soft: rgba(20, 20, 24, 0.88) !important;
      --us-glass: rgba(11, 11, 14, 0.78) !important;
      --us-glass-strong: rgba(7, 7, 10, 0.91) !important;
      --us-glass-soft: rgba(255, 255, 255, 0.026) !important;
      --us-hover: rgba(255, 255, 255, 0.065) !important;
      --us-border: rgba(255, 255, 255, 0.080) !important;
      --us-border-strong: rgba(255, 255, 255, 0.125) !important;
      --us-border-focus: rgba(188, 198, 208, 0.42) !important;

      --us-design-surface: rgba(9, 9, 12, 0.48) !important;
      --us-design-surface-strong: rgba(8, 8, 11, 0.60) !important;
      --us-design-surface-soft: rgba(255, 255, 255, 0.012) !important;
      --us-design-hover: rgba(255, 255, 255, 0.045) !important;
      --us-design-border: rgba(255, 255, 255, 0.060) !important;
      --us-design-border-strong: rgba(255, 255, 255, 0.090) !important;

      --us-dark-glass-blur: 14px;
      --us-dark-glass-saturation: 108%;
      --us-dark-glass-brightness: 0.90;
    }

    html,
    body {
      color-scheme: dark;
    }

    /* Neutral top chrome: graphite, no navy/blue base. */
    html body header,
    html body header.navbar,
    html body .navbar,
    html body .navbar-fixed-top,
    html body #topbar,
    html body .topbar {
      background: rgba(9, 9, 11, 0.92) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.020), rgba(255,255,255,0.004)) !important;
      border-color: rgba(255, 255, 255, 0.075) !important;
    }

    /* Sidebar/project rail keep the wallpaper visible but use neutral smoke. */
    html body #sidebar_left,
    html body #pmlt {
      background-color: rgba(10, 10, 12, 0.50) !important;
      background-image: linear-gradient(180deg, rgba(18,18,21,0.42), rgba(8,8,10,0.34)) !important;
      border-color: rgba(255, 255, 255, 0.070) !important;
    }

    /* Primary neutral glass surfaces use one graphite recipe. */
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
      .cke_inner,
      #widget-tasks,
      #widget-designs,
      #widget-estimates,
      #page-content .panel-body.bg-light,
      .tab-block > .tabs-left,
      .tab-block > .tab-content
    ) {
      background-color: rgba(11, 11, 14, 0.68) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.030), rgba(255,255,255,0.006)) !important;
      border-color: rgba(255, 255, 255, 0.075) !important;
      box-shadow: 0 9px 28px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255,255,255,0.018) !important;
    }

    /* One visible frost level for every major outer surface. */
    html body #sidebar_left,
    html body #pmlt,
    html body .modal-content,
    html body .popover,
    html body .dropdown-menu,
    html body #customer-info,
    html body #customer-name,
    html body #showbtns,
    html body #mapcontainer,
    html body #filesbox,
    html body #descriptionbox,
    html body #projectbox,
    html body #designbox,
    html body #widget-tasks,
    html body #widget-designs,
    html body #widget-estimates,
    html body #page-content .panel-body.bg-light,
    html body .tab-block > .tabs-left,
    html body .tab-block > .tab-content,
    html body .panel,
    html body .well {
      -webkit-backdrop-filter:
        blur(var(--us-dark-glass-blur))
        saturate(var(--us-dark-glass-saturation))
        brightness(var(--us-dark-glass-brightness)) !important;
      backdrop-filter:
        blur(var(--us-dark-glass-blur))
        saturate(var(--us-dark-glass-saturation))
        brightness(var(--us-dark-glass-brightness)) !important;
    }

    /* Never stack blur recursively; inner cards inherit the outer frost. */
    html body .panel .panel,
    html body .panel .well,
    html body .well .panel,
    html body .well .well {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    /* Re-assert known primary panels in case they happen to live inside a .well. */
    html body #customer-info,
    html body #customer-name,
    html body #showbtns,
    html body #filesbox,
    html body #descriptionbox,
    html body #projectbox,
    html body #designbox,
    html body #widget-tasks,
    html body #widget-designs,
    html body #widget-estimates,
    html body #page-content .panel-body.bg-light {
      -webkit-backdrop-filter:
        blur(var(--us-dark-glass-blur))
        saturate(var(--us-dark-glass-saturation))
        brightness(var(--us-dark-glass-brightness)) !important;
      backdrop-filter:
        blur(var(--us-dark-glass-blur))
        saturate(var(--us-dark-glass-saturation))
        brightness(var(--us-dark-glass-brightness)) !important;
    }

    /* Neutral subheaders/toolbar surfaces: grayscale instead of blue-gray. */
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
      background: rgba(255, 255, 255, 0.020) !important;
      background-image: none !important;
      border-color: rgba(255, 255, 255, 0.060) !important;
    }

    html body :is(
      input:not([type="checkbox"]):not([type="radio"]),
      textarea,
      select,
      .form-control,
      .input-group-addon
    ) {
      background-color: rgba(8, 8, 10, 0.78) !important;
      border-color: rgba(255, 255, 255, 0.090) !important;
    }

    html body :is(
      .btn,
      button,
      input[type="button"],
      input[type="submit"],
      a.btn
    ):not([data-us-state]) {
      background-color: rgba(16, 16, 19, 0.72) !important;
      border-color: rgba(255, 255, 255, 0.090) !important;
    }

    html body :is(
      .btn,
      button,
      input[type="button"],
      input[type="submit"],
      a.btn
    ):not([data-us-state]):hover {
      background-color: rgba(35, 35, 40, 0.84) !important;
      border-color: rgba(255, 255, 255, 0.145) !important;
    }

    html body :is(table, .table) {
      background-color: rgba(9, 9, 11, 0.38) !important;
      border-color: rgba(255, 255, 255, 0.055) !important;
    }

    html body :is(table, .table) > :is(thead, tbody, tfoot) > tr > :is(th, td) {
      border-color: rgba(255, 255, 255, 0.052) !important;
    }

    html body :is(table, .table) > thead > tr > th {
      background-color: rgba(255, 255, 255, 0.018) !important;
    }

    /* Preserve semantic blue only for information/pending/action states. */
    html body :is([data-us-state="pending"], [data-us-state="submitted"], [data-us-action="primary"]),
    html body a,
    html body .design-link {
      /* semantic/accent color rules from the base theme intentionally remain */
    }
'''

dark = dark.replace(anchor, anchor.replace('\n  `);', neutral_css + '\n\n  `);'), 1)

for path, content in (
    (GLASS, glass),
    (GLASS_FRESH, glass),
    (DARK, dark),
    (DARK_FRESH, dark),
):
    path.write_text(content, encoding='utf-8')

print('Created Glass Theme v1.0.0 and Dark Glass Theme v1.0.0')
