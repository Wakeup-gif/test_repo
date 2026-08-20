from pathlib import Path
import re
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
CANON = ROOT / 'tampermonkey' / 'ChatGPT-US-Sign-Glass-Theme.user.js'
SNAP = ROOT / 'tampermonkey' / 'ChatGPT-US-Sign-Dark-Glass-Theme-v2.1.1.user.js'

text = CANON.read_text(encoding='utf-8')
text = text.replace('// @version      2.1.0', '// @version      2.1.1', 1)
text = text.replace('window.__chatgptUsSignDarkGlassThemeV210', 'window.__chatgptUsSignDarkGlassThemeV211')

normal_svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 22 22"><defs><linearGradient id="g" x1="4" y1="3" x2="17" y2="18" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCEFFF"/></linearGradient></defs><path d="M3 2.6L20 10.7L7.7 20Z" fill="#6FA8D0" opacity=".14" transform="translate(.55 .7)"/><path fill-rule="evenodd" d="M3 2.6L20 10.7L7.7 20ZM8.05 7.65L14.5 10.72L9.75 14.65Z" fill="url(#g)"/></svg>'''
pointer_svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 27 27"><defs><linearGradient id="g" x1="5" y1="4" x2="21" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D6ECFF"/></linearGradient></defs><path d="M3.6 3L24.2 12.9L9.3 24Z" fill="#6FA8D0" opacity=".17" transform="translate(.7 .85)"/><path fill-rule="evenodd" d="M3.6 3L24.2 12.9L9.3 24ZM9.7 9.1L17.4 12.85L11.65 17.6Z" fill="url(#g)"/></svg>'''
normal_uri = 'data:image/svg+xml,' + quote(normal_svg, safe='')
pointer_uri = 'data:image/svg+xml,' + quote(pointer_svg, safe='')

start = text.index('    html,\n    body {\n      cursor: url("data:image/svg+xml,')
end = text.index('    input,\n    textarea,', start)
new_block = f'''    html,\n    body,\n    #__next,\n    #root,\n    #main,\n    #main *,\n    #stage-slideover-sidebar,\n    #stage-slideover-sidebar *,\n    [role="dialog"],\n    [role="dialog"] *,\n    [role="menu"],\n    [role="menu"] * {{\n      cursor: url("{normal_uri}") 4 4, default !important;\n    }}\n\n    a,\n    button,\n    [role="button"],\n    [role="menuitem"],\n    [role="option"],\n    summary,\n    label[for] {{\n      cursor: url("{pointer_uri}") 5 4, pointer !important;\n    }}\n\n'''
text = text[:start] + new_block + text[end:]

if '// @version      2.1.1' not in text:
    raise SystemExit('version bump failed')
if 'width%3D%2226%22' not in text or 'width%3D%2232%22' not in text:
    raise SystemExit('cursor size markers missing')
if 'M3p2.6' in text or 'M.6.6' in text:
    raise SystemExit('malformed legacy cursor data still present')

CANON.write_text(text, encoding='utf-8')
SNAP.write_text(text, encoding='utf-8')
print('Patched ChatGPT Dark Glass to v2.1.1 with larger continuous cursors')
