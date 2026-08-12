from pathlib import Path

path = Path("tampermonkey/US-Sign-Full-UI-Theme.user.js")
text = path.read_text(encoding="utf-8")

text = text.replace("// @version      1.1.2", "// @version      1.2.0", 1)
text = text.replace(
    "// @description  Canonical SquareCoil dark UI theme with tray, layout, panel, form, table, dropdown, editor, modal, and readable-text repairs.",
    "// @description  Canonical SquareCoil dark glass UI with fixed site wallpaper, tray, layout, panel, form, table, dropdown, editor, modal, and readable-text repairs.",
    1,
)

marker = '''    ::-webkit-scrollbar {\n'''
wallpaper = r'''    /* Site-wide fixed wallpaper. Main canvas wrappers are transparent so the image remains visible behind the UI. */
    html {
      background-color: #111418 !important;
      background-image:
        linear-gradient(rgba(11, 14, 17, 0.44), rgba(11, 14, 17, 0.62)),
        url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1") !important;
      background-position: center center, center center !important;
      background-size: cover, cover !important;
      background-repeat: no-repeat, no-repeat !important;
      background-attachment: fixed, fixed !important;
    }

    body {
      background: rgba(17, 20, 24, 0.30) !important;
      background-color: rgba(17, 20, 24, 0.30) !important;
      background-image: none !important;
    }

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
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

'''

if "Site-wide fixed wallpaper" not in text:
    if marker not in text:
        raise SystemExit("wallpaper insertion marker not found")
    text = text.replace(marker, wallpaper + marker, 1)

path.write_text(text, encoding="utf-8")
