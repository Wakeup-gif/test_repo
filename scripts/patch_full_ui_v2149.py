from pathlib import Path
import re

CANON = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
FRESH = Path('tampermonkey/US-Sign-Full-UI-Theme-v2.1.49.user.js')

text = CANON.read_text(encoding='utf-8')

if '// @version      2.1.48' not in text:
    raise SystemExit('Expected v2.1.48 canonical theme')

text = text.replace('// @version      2.1.48', '// @version      2.1.49', 1)
text = text.replace(
    'Stable SquareCoil frosted-glass UI with a dedicated usable collapsed-sidebar toggle row, one shared wallpaper behind sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    'Stable SquareCoil frosted-glass UI with a global 10% darker glass backdrop pass, a dedicated usable collapsed-sidebar toggle row, one shared wallpaper behind sidebar glass, refined sidebar alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1,
)

# Darken every actual blur declaration by 10% without affecting foreground text/icons.
# Anchoring to whole CSS declaration lines avoids touching @supports conditions.
pattern = re.compile(
    r'^(?P<indent>\s*)(?P<prop>-webkit-backdrop-filter|backdrop-filter)\s*:\s*'
    r'(?P<value>[^;\n]*\bblur\([^;\n]*\))\s*(?P<important>!important)?\s*;\s*$',
    re.MULTILINE | re.IGNORECASE,
)

count = 0

def darken(match):
    global count
    value = match.group('value').rstrip()
    if 'brightness(0.90)' in value:
        return match.group(0)
    count += 1
    important = f" {match.group('important')}" if match.group('important') else ''
    return f"{match.group('indent')}{match.group('prop')}: {value} brightness(0.90){important};"

text = pattern.sub(darken, text)

if count < 8:
    raise SystemExit(f'Expected multiple blur declarations, only patched {count}')

marker = '''
    /* =========================================================
       v2.1.49 GLOBAL GLASS DARKENING
       Every authored backdrop blur in this theme receives a final
       brightness(0.90) filter. This darkens only the sampled backdrop by
       10% while preserving each surface's existing tint, blur radius,
       saturation, borders, shadows, text, icons, and interaction states.
    ========================================================= */
'''

anchor = '  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'
if anchor not in text:
    raise SystemExit('Could not find CSS close / Bing anchor')
text = text.replace(anchor, marker + '\n' + anchor, 1)

CANON.write_text(text, encoding='utf-8')
FRESH.write_text(text, encoding='utf-8')
print(f'Patched Full UI Theme to v2.1.49; darkened {count} blur declarations')
