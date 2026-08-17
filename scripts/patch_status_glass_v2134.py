from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.1.33" not in text:
    raise SystemExit("expected Full UI v2.1.33")

text = text.replace("@version      2.1.33", "@version      2.1.34", 1)
text = text.replace(
    "Stable SquareCoil frosted-glass UI with native-structure Project Status styling, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.",
    "Stable SquareCoil frosted-glass UI with native-structure Project Status glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.",
    1,
)

status_glass = r'''

    /* =========================================================
       v2.1.34 PROJECT STATUS TRUE GLASS
       Match the primary-card frost used elsewhere while preserving the
       snapshot-grounded native Status/Milestones geometry from v2.1.33.
       One blur layer per visible surface; nested controls remain blur-free.
    ========================================================= */
    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      html.us-sign-project-status-page #customer-info,
      html.us-sign-project-status-page #content .tray-center > .pl15.pr15 > .well,
      html.us-sign-project-status-page .tab-block > .tabs-left,
      html.us-sign-project-status-page .tab-block > .tab-content {
        -webkit-backdrop-filter: blur(14px) saturate(132%) !important;
        backdrop-filter: blur(14px) saturate(132%) !important;
      }

      html.us-sign-project-status-page #customer-info :is(
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
      html.us-sign-project-status-page #content .tray-center > .pl15.pr15 > .well :is(
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
      html.us-sign-project-status-page .tab-block > .tabs-left *,
      html.us-sign-project-status-page .tab-block > .tab-content * {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
    }
'''

if "v2.1.34 PROJECT STATUS TRUE GLASS" in text:
    raise SystemExit("v2.1.34 block already present")

marker = re.search(r'(\n  `\);\n\n  // =========================================================\n  // v2\.1\.30 CURATED BING WALLPAPER ROTATION)', text)
if not marker:
    raise SystemExit("Full UI CSS closing marker not found")
text = text[:marker.start()] + status_glass + text[marker.start():]

TARGET.write_text(text, encoding="utf-8")
