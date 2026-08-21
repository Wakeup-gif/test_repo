from pathlib import Path
import re

path = Path('tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js')
text = path.read_text(encoding='utf-8')

if '@version      2.1.1' not in text:
    raise SystemExit('Expected ChatGPT theme v2.1.1')
if 'v2.1.2 FULL-VIEWPORT CURSOR COVERAGE' in text:
    raise SystemExit('v2.1.2 cursor patch already present')

text = text.replace('@version      2.1.1', '@version      2.1.2', 1)
text = text.replace(
    'US Sign Dark Glass for ChatGPT with graphite translucent surfaces, restrained semantic blue, cached 14px reading frost, Bing UHD rotation, native layout, and the cutout geometric cursor.',
    'US Sign Dark Glass for ChatGPT with graphite translucent surfaces, restrained semantic blue, cached 14px reading frost, Bing UHD rotation, native layout, and full-viewport cutout geometric cursor coverage.',
    1,
)
text = text.replace('window.__chatgptUsSignDarkGlassThemeV211', 'window.__chatgptUsSignDarkGlassThemeV212')

# Reuse the exact current cursor assets rather than duplicating or redrawing them.
default_match = re.search(r'cursor:\s*(url\("data:image/svg\+xml,[^\n]+?\)\s+4\s+4,\s*default)\s*!important;', text)
hover_match = re.search(r'cursor:\s*(url\("data:image/svg\+xml,[^\n]+?\)\s+5\s+4,\s*pointer)\s*!important;', text)
if not default_match or not hover_match:
    raise SystemExit('Could not locate current ChatGPT cursor assets')

default_cursor = default_match.group(1)
hover_cursor = hover_match.group(1)

anchor = '''    button:disabled,\n    [aria-disabled="true"] {\n      cursor: not-allowed !important;\n    }\n'''
if anchor not in text:
    raise SystemExit('Could not locate cursor exception anchor')

patch = f'''\n\n    /* =========================================================\n       v2.1.2 FULL-VIEWPORT CURSOR COVERAGE\n       ChatGPT now mounts some gutters/portals outside the historical #main\n       tree. Own the cursor across every body descendant so empty page zones\n       cannot fall through to hidden/foreign cursor rules, then restore the\n       native semantic cursor roles below. CSS-only: no mousemove listener.\n    ========================================================= */\n    @media (pointer: fine) {{\n      html,\n      body,\n      body * {{\n        cursor: {default_cursor} !important;\n      }}\n\n      input,\n      textarea,\n      [contenteditable="true"],\n      [contenteditable="true"] *,\n      [role="textbox"],\n      [role="textbox"] *,\n      .markdown,\n      .markdown *,\n      .prose,\n      .prose * {{\n        cursor: text !important;\n      }}\n\n      a,\n      a *,\n      button,\n      button *,\n      [role="button"],\n      [role="button"] *,\n      [role="menuitem"],\n      [role="menuitem"] *,\n      [role="option"],\n      [role="option"] *,\n      summary,\n      summary *,\n      label[for],\n      label[for] * {{\n        cursor: {hover_cursor} !important;\n      }}\n\n      button:disabled,\n      button:disabled *,\n      [aria-disabled="true"],\n      [aria-disabled="true"] * {{\n        cursor: not-allowed !important;\n      }}\n\n      [draggable="true"] {{\n        cursor: grab !important;\n      }}\n\n      [aria-grabbed="true"] {{\n        cursor: grabbing !important;\n      }}\n\n      [data-resize-handle],\n      [class*="resize-handle" i],\n      [style*="cursor: col-resize" i],\n      [style*="cursor: row-resize" i] {{\n        cursor: revert !important;\n      }}\n    }}\n'''

text = text.replace(anchor, anchor + patch, 1)

path.write_text(text, encoding='utf-8')
(Path('tampermonkey/ChatGPT-US-Sign-Glass-Theme-v2.1.2.user.js')).write_text(text, encoding='utf-8')
