from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.1.34" not in text:
    raise SystemExit("expected Full UI v2.1.34")
if "v2.1.35 CLOCK OUT / MATERIAL USED MODAL" in text:
    raise SystemExit("v2.1.35 block already present")

text = text.replace("@version      2.1.34", "@version      2.1.35", 1)
text = text.replace(
    "Stable SquareCoil frosted-glass UI with native-structure Project Status glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.",
    "Stable SquareCoil frosted-glass UI with native-structure Status and Clock Out dialogs, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.",
    1,
)

css = r'''

    /* =========================================================
       v2.1.35 CLOCK OUT / MATERIAL USED MODAL
       Snapshot-grounded repair for #modal-overlay. The native dialog uses
       margin:15% auto (vertical percentages resolve from width), full-width
       btn-lg controls, Bootstrap columns, and a static close glyph. Keep all
       native IDs/click handlers; repair paint and geometry with CSS only.
    ========================================================= */
    #modal-overlay.duplicate-modal-2 {
      box-sizing: border-box !important;
      padding: clamp(48px, 12vh, 132px) 24px 28px !important;
      overflow: auto !important;
      background: rgba(3, 8, 14, 0.56) !important;
      background-image: linear-gradient(180deg, rgba(7, 18, 29, 0.10), rgba(2, 6, 10, 0.18)) !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {
      box-sizing: border-box !important;
      position: relative !important;
      width: min(620px, calc(100vw - 48px)) !important;
      max-width: 620px !important;
      min-width: 0 !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      margin: 0 auto !important;
      padding: 18px !important;
      overflow: visible !important;
      color: var(--us-text) !important;
      background:
        linear-gradient(145deg, rgba(133, 202, 255, 0.060), transparent 36%),
        linear-gradient(180deg, rgba(10, 21, 33, 0.72), rgba(5, 12, 20, 0.62)) !important;
      background-color: rgba(7, 15, 24, 0.68) !important;
      border: 1px solid rgba(190, 224, 250, 0.16) !important;
      border-radius: 16px !important;
      box-shadow: 0 22px 54px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.050) !important;
      transition: none !important;
    }

    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {
        -webkit-backdrop-filter: blur(18px) saturate(132%) !important;
        backdrop-filter: blur(18px) saturate(132%) !important;
      }

      #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 :is(
        .row,
        [class*="col-"],
        .alert,
        .btn,
        input,
        select,
        textarea
      ) {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > br {
      display: none !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-cancel-button {
      position: absolute !important;
      z-index: 4 !important;
      top: 11px !important;
      right: 11px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 30px !important;
      min-width: 30px !important;
      height: 30px !important;
      min-height: 30px !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      color: transparent !important;
      background: rgba(255, 255, 255, 0.040) !important;
      border: 1px solid rgba(208, 231, 249, 0.12) !important;
      border-radius: 9px !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035) !important;
      font-size: 0 !important;
      line-height: 1 !important;
      cursor: pointer !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-cancel-button::before {
      content: "×" !important;
      display: block !important;
      color: var(--us-text-soft) !important;
      font-size: 18px !important;
      font-weight: 500 !important;
      line-height: 1 !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-cancel-button:hover {
      background: rgba(255, 255, 255, 0.080) !important;
      border-color: rgba(208, 231, 249, 0.20) !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row::before,
    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row::after,
    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12::before,
    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12::after {
      content: none !important;
      display: none !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 {
      box-sizing: border-box !important;
      display: grid !important;
      grid-template-columns: minmax(132px, 0.34fr) minmax(0, 1fr) !important;
      grid-template-areas:
        "warning warning"
        "yes proceed"
        "clock clock"
        "divider divider"
        "footer footer" !important;
      gap: 10px !important;
      float: none !important;
      width: 100% !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > br {
      display: none !important;
    }

    #modal-overlay.duplicate-modal-2 #tc-warning {
      grid-area: warning !important;
      width: 100% !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 10px 42px 10px 12px !important;
      color: var(--us-text) !important;
      background: rgba(189, 102, 102, 0.105) !important;
      border: 1px solid rgba(217, 152, 152, 0.16) !important;
      border-radius: 10px !important;
      font-size: 12.5px !important;
      font-weight: 600 !important;
      line-height: 1.4 !important;
    }

    #modal-overlay.duplicate-modal-2 #tc-yes-btn,
    #modal-overlay.duplicate-modal-2 #no-btn {
      box-sizing: border-box !important;
      position: static !important;
      inset: auto !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 38px !important;
      height: auto !important;
      margin: 0 !important;
      padding: 8px 12px !important;
      border-radius: 9px !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035), 0 5px 16px rgba(0, 0, 0, 0.08) !important;
      font-size: 12.5px !important;
      font-weight: 600 !important;
      line-height: 1.35 !important;
      text-align: center !important;
      white-space: normal !important;
      transform: none !important;
    }

    #modal-overlay.duplicate-modal-2 #tc-yes-btn {
      grid-area: yes !important;
      color: #dcebe1 !important;
      background: rgba(72, 142, 96, 0.18) !important;
      border: 1px solid rgba(132, 191, 151, 0.20) !important;
    }

    #modal-overlay.duplicate-modal-2 #no-btn {
      grid-area: proceed !important;
      color: #e6edf4 !important;
      background: rgba(65, 130, 187, 0.16) !important;
      border: 1px solid rgba(130, 190, 239, 0.18) !important;
    }

    #modal-overlay.duplicate-modal-2 #tc-yes-btn:hover,
    #modal-overlay.duplicate-modal-2 #no-btn:hover {
      color: #fff !important;
      border-color: rgba(212, 235, 252, 0.26) !important;
      background-color: rgba(88, 155, 210, 0.22) !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-into-project-dept-2 {
      grid-area: clock !important;
      width: 100% !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-into-project-dept-2 > br {
      display: none !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-into-project-dept-2 > :is(input, select, textarea, .alert, a.btn) {
      width: 100% !important;
      margin: 0 0 8px !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-into-project-dept-2 textarea {
      min-height: 72px !important;
      resize: vertical !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > hr {
      grid-area: divider !important;
      width: 100% !important;
      height: 1px !important;
      margin: 2px 0 0 !important;
      border: 0 !important;
      border-top: 1px solid rgba(202, 228, 248, 0.12) !important;
      opacity: 1 !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > .row {
      grid-area: footer !important;
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) auto !important;
      align-items: center !important;
      gap: 10px !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > .row::before,
    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > .row::after {
      content: none !important;
      display: none !important;
    }

    #modal-overlay.duplicate-modal-2 #cocbtn {
      grid-column: 1 !important;
      float: none !important;
      width: auto !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > .row > .col-md-9 {
      display: none !important;
    }

    #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 > .row > .col-md-3 {
      grid-column: 2 !important;
      justify-self: end !important;
      float: none !important;
      width: auto !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-out-completely,
    #modal-overlay.duplicate-modal-2 #clock-actions-cancel {
      box-sizing: border-box !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: auto !important;
      min-width: 100px !important;
      min-height: 34px !important;
      height: auto !important;
      margin: 0 !important;
      padding: 7px 12px !important;
      color: var(--us-text-soft) !important;
      background: rgba(255, 255, 255, 0.035) !important;
      border: 1px solid rgba(205, 229, 247, 0.13) !important;
      border-radius: 9px !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.030) !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
      text-align: center !important;
      white-space: normal !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-out-completely {
      min-width: 170px !important;
      color: #eddede !important;
      background: rgba(159, 73, 73, 0.14) !important;
      border-color: rgba(207, 131, 131, 0.18) !important;
    }

    #modal-overlay.duplicate-modal-2 #clock-actions-cancel:hover,
    #modal-overlay.duplicate-modal-2 #clock-out-completely:hover {
      color: #fff !important;
      background: rgba(255, 255, 255, 0.070) !important;
      border-color: rgba(214, 235, 251, 0.22) !important;
    }

    @media (max-width: 640px) {
      #modal-overlay.duplicate-modal-2 {
        padding: 24px 14px !important;
      }

      #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {
        width: 100% !important;
        padding: 14px !important;
      }

      #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 > .row > .col-md-12 {
        grid-template-columns: minmax(0, 1fr) !important;
        grid-template-areas:
          "warning"
          "yes"
          "proceed"
          "clock"
          "divider"
          "footer" !important;
      }
    }
'''

marker = re.search(r'(\n  `\);\n\n  // =========================================================\n  // v2\.1\.30 CURATED BING WALLPAPER ROTATION)', text)
if not marker:
    raise SystemExit("Full UI CSS closing marker not found")
text = text[:marker.start()] + css + text[marker.start():]
TARGET.write_text(text, encoding="utf-8")
