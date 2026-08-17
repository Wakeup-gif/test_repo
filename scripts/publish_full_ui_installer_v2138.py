from pathlib import Path

root = Path(__file__).resolve().parents[1]
canonical = root / 'tampermonkey' / 'US-Sign-Full-UI-Theme.user.js'
installer = root / 'tampermonkey' / 'US-Sign-Full-UI-Theme-v2.1.38.user.js'

s = canonical.read_text(encoding='utf-8-sig')
if '@version      2.1.37' not in s:
    raise SystemExit('expected canonical v2.1.37')

s = s.replace('@version      2.1.37', '@version      2.1.38', 1)
s = s.replace(
    '@description  Stable SquareCoil frosted-glass UI with native-structure Status and true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    '@description  Stable SquareCoil frosted-glass UI with native-structure Status and true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1,
)

# Publish v2.1.38 canonically too, then create a fresh-name installer alias.
canonical.write_text(s, encoding='utf-8', newline='\n')
installer.write_text(s, encoding='utf-8', newline='\n')
