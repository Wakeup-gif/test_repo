from pathlib import Path

p = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
s = p.read_text(encoding='utf-8')

if '// @version      2.1.17' in s:
    raise SystemExit(0)
if '// @version      2.1.16' not in s:
    raise SystemExit('Expected Full UI Theme v2.1.16')

s = s.replace('// @version      2.1.16', '// @version      2.1.17', 1)
s = s.replace(
    'Stable SquareCoil layout with Roxborough display typography, blue glass chrome, frosted Project Search panels, corrected Task-page text contrast, and blurred Job Dashboard glass.',
    'Stable SquareCoil layout with Roxborough display typography, blue glass chrome, frosted Project Search panels, corrected Task-page text contrast, blurred Job Dashboard glass, and a lightweight custom cursor.',
    1,
)

css = r'''

    /* =========================================================
       v2.1.17 CUSTOM CURSOR
       CSS-only cursor assets. No mouse tracking or animation loop.
    ========================================================= */
    @media (pointer: fine) {
      html,
      body {
        cursor: url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-arrow.svg") 5 4, default !important;
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
        cursor: url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-pointer.svg") 5 4, pointer !important;
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

marker = '\n    @media print {'
pos = s.rfind(marker)
if pos < 0:
    raise SystemExit('Print marker missing')
s = s[:pos] + css + s[pos:]

p.write_text(s, encoding='utf-8')
