from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"

OLD_VERSION = "// @version      2.1.20"
NEW_VERSION = "// @version      2.1.21"

OLD_BLOCK = r'''    /* =========================================================
       v2.1.17 CUSTOM CURSOR
       CSS-only cursor assets. No mouse tracking or animation loop.
    ========================================================= */
    @media (pointer: fine) {
      html,
      body {
        cursor: url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-arrow-elegant-v218.svg") 4 3, default !important;
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
        cursor: url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-pointer-elegant-v218b.svg") 4 3, pointer !important;
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

NEW_BLOCK = r'''    /* =========================================================
       v2.1.21 DYNAMIC CROSSHAIR CURSOR
       CSS-only cursor assets. The crosshair expands over interactive
       controls with no mouse tracking, DOM overlay, or animation loop.
    ========================================================= */
    @media (pointer: fine) {
      html,
      body {
        cursor: url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-crosshair-v2121.svg") 12 12, crosshair !important;
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
        cursor: url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-crosshair-hover-v2121.svg") 17 17, pointer !important;
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

text = TARGET.read_text(encoding="utf-8")

if NEW_VERSION in text and "v2.1.21 DYNAMIC CROSSHAIR CURSOR" in text:
    print("Full UI Theme v2.1.21 already applied.")
    raise SystemExit(0)

if OLD_VERSION not in text:
    raise SystemExit("Expected Full UI Theme v2.1.20 before patching.")
if OLD_BLOCK not in text:
    raise SystemExit("Expected v2.1.17 cursor block not found; refusing unsafe patch.")

text = text.replace(OLD_VERSION, NEW_VERSION, 1)
text = text.replace(
    "and a lightweight custom cursor.",
    "and a dynamic expanding crosshair cursor.",
    1,
)
text = text.replace(OLD_BLOCK, NEW_BLOCK, 1)
TARGET.write_text(text, encoding="utf-8")
print("Patched Full UI Theme to v2.1.21 dynamic crosshair cursor.")
