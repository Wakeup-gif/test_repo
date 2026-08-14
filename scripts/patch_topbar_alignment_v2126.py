from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "// @version      2.1.25" not in text:
    raise SystemExit("Expected Full UI Theme v2.1.25 before patching")

text = text.replace("// @version      2.1.25", "// @version      2.1.26", 1)
text = text.replace(
    "// @description  Stable SquareCoil frosted-glass UI with unified Job Dashboard and Design workspaces, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    "// @description  Stable SquareCoil frosted-glass UI with aligned native top chrome, unified Job Dashboard and Design workspaces, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    1,
)

marker = '''    /* =========================================================\n       v2.1.23 CUTOUT GEOMETRIC CURSOR'''
if marker not in text:
    raise SystemExit("Cursor insertion marker not found")

block = r'''
    /* =========================================================
       v2.1.26 TOPBAR GEOMETRY REPAIR
       Restore SquareCoil's native 60px navbar rhythm, then center content
       inside those native boxes. Horizontal positioning remains native.
    ========================================================= */
    html body header.navbar,
    html body .navbar.navbar-fixed-top {
      height: 60px !important;
      min-height: 60px !important;
      margin-bottom: 0 !important;
    }

    html body header.navbar .navbar-branding {
      height: 60px !important;
    }

    html body header.navbar .navbar-branding .navbar-brand {
      display: flex !important;
      align-items: center !important;
      height: 60px !important;
      line-height: 58px !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }

    html body header.navbar .navbar-branding .navbar-brand img {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      align-self: center !important;
    }

    html body header.navbar #toggle_sidemenu_l,
    html body header.navbar #toggle_sidemenu_t {
      height: 60px !important;
      max-height: 60px !important;
      line-height: 58px !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }

    html body header.navbar .navbar-nav.navbar-left {
      max-height: 60px !important;
    }

    html body header.navbar .navbar-nav > li {
      height: 60px !important;
      max-height: 60px !important;
    }

    html body header.navbar .navbar-nav > li > a {
      display: flex !important;
      align-items: center !important;
      height: 59px !important;
      max-height: 59px !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      line-height: 1.2 !important;
    }

    html body header.navbar .navbar-form {
      display: flex !important;
      align-items: center !important;
      height: 60px !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }

    html body header.navbar .navbar-form.navbar-search.square input {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }

    html body header.navbar .navbar-text {
      display: flex !important;
      align-items: center !important;
      height: 60px !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      line-height: 1.2 !important;
    }

    html body header.navbar .navbar-btn {
      margin-top: 15px !important;
      margin-bottom: 15px !important;
      vertical-align: middle !important;
    }


'''

text = text.replace(marker, block + marker, 1)
TARGET.write_text(text, encoding="utf-8")
