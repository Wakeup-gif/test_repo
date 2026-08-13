from pathlib import Path

p = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
s = p.read_text(encoding='utf-8')

if '// @version      2.1.10' in s:
    raise SystemExit(0)

if '// @version      2.1.9' not in s:
    raise SystemExit('Expected v2.1.9 canonical theme')

s = s.replace('// @version      2.1.9', '// @version      2.1.10', 1)
s = s.replace(
    '// @description  Stable SquareCoil layout with Roxborough display typography, transparent blue gradient chrome, matched blue-black navigation glass, and performance-safe scrolling surfaces. Paint only, no geometry overrides.',
    '// @description  Stable SquareCoil layout with Roxborough display typography, transparent blue glass chrome, performance-safe scrolling, and clean Description text with no pasted highlight backgrounds.',
    1,
)

block = r'''

    /* =========================================================
       v2.1.10 DESCRIPTION TEXT CLEANUP
       Preserve rich-text color and emphasis, but remove pasted/highlighter
       background paint from Description content only.
    ========================================================= */

    html body #descriptionbox .panel-body mark,
    html body #descriptionbox .panel-body .highlight,
    html body #descriptionbox .panel-body [class*="highlight" i],
    html body #descriptionbox .panel-body [style*="background" i],
    html body .us-sign-description-panel .panel-body mark,
    html body .us-sign-description-panel .panel-body .highlight,
    html body .us-sign-description-panel .panel-body [class*="highlight" i],
    html body .us-sign-description-panel .panel-body [style*="background" i] {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }

    /* Keep warning/markup copy readable without the tan/yellow block. */
    html body #descriptionbox .panel-body .text-danger,
    html body #descriptionbox .panel-body font[color="red" i],
    html body #descriptionbox .panel-body [style*="color: red" i],
    html body #descriptionbox .panel-body [style*="color:red" i],
    html body .us-sign-description-panel .panel-body .text-danger,
    html body .us-sign-description-panel .panel-body font[color="red" i],
    html body .us-sign-description-panel .panel-body [style*="color: red" i],
    html body .us-sign-description-panel .panel-body [style*="color:red" i] {
      color: #c98b8b !important;
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
'''

marker = '\n    @media print {'
pos = s.rfind(marker)
if pos < 0:
    raise SystemExit('Final print block not found')
s = s[:pos] + block + s[pos:]

p.write_text(s, encoding='utf-8')
