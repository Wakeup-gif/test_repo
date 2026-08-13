from pathlib import Path

path = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
text = path.read_text(encoding='utf-8')

text = text.replace('// @version      2.1.1', '// @version      2.1.2', 1)
text = text.replace(
    '// @description  Stable pre-wallpaper SquareCoil layout with blue macOS-inspired glass colors and scenic wallpaper applied through translucent paint only. No project geometry overrides.',
    '// @description  Stable pre-wallpaper SquareCoil layout with visible scenic wallpaper, blue macOS-inspired glass colors, and translucent canvas paint only. No project geometry overrides.',
    1,
)

marker = '''    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {\n'''
css = r'''    /* =========================================================
       v2.1.2 CANVAS OPACITY TUNING
       Keep the v1.1.2 geometry untouched. These structural wrappers retain
       their normal dimensions and flow; only their paint is made lighter so
       the root wallpaper remains visible through stacked canvas layers.
    ========================================================= */

    html body #main,
    html body #content_wrapper,
    html body #content,
    html body #content > .tray,
    html body #content > .tray-left,
    html body #content > .tray-right,
    html body #content > .tray-center,
    html body .tray,
    html body .tray-left,
    html body .tray-right,
    html body .tray-center,
    html body .tray-inner,
    html body [class^="tray-"],
    html body [class*=" tray-"],
    html body .content,
    html body .content-wrapper,
    html body .page-content,
    html body .content-body,
    html body .main-content,
    html body .main-panel,
    html body .admin-panels,
    html body .dashboard,
    html body .dashboard-page,
    html body .container,
    html body .container-fluid,
    html body .pl15,
    html body .pr15,
    html body .pl15.pr15 {
      background: rgba(8, 14, 22, 0.075) !important;
      background-color: rgba(8, 14, 22, 0.075) !important;
      background-image: none !important;
    }

'''

if 'v2.1.2 CANVAS OPACITY TUNING' not in text:
    if marker not in text:
        raise SystemExit('insertion marker not found')
    text = text.replace(marker, css + marker, 1)

path.write_text(text, encoding='utf-8')
