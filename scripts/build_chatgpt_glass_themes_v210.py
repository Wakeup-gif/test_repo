from pathlib import Path
import base64

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / 'scripts' / 'chatgpt-theme-seed'
TAMPER = ROOT / 'tampermonkey'

parts = sorted(SEED.glob('part*.b64'))
if len(parts) != 6:
    raise SystemExit(f'Expected 6 source parts, found {len(parts)}')
raw_b64 = ''.join(p.read_text(encoding='utf-8').strip() for p in parts)
source = base64.b64decode(raw_b64).decode('utf-8').replace('\r\n', '\n')

required = [
    '// @name         ChatGPT - US Sign Glass Theme',
    '// @version      2.0.20',
    'window.__chatgptUsSignGlassThemeV220 = true;',
    'const CACHE_KEY = "chatgpt-us-sign-bing-wallpaper-pool-v3";',
]
for marker in required:
    if marker not in source:
        raise SystemExit(f'Missing original marker: {marker}')


def replace_once(text, old, new):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'Expected exactly one occurrence, found {count}: {old[:90]!r}')
    return text.replace(old, new, 1)

clear = source
clear_replacements = [
    ('// @name         ChatGPT - US Sign Glass Theme', '// @name         ChatGPT - US Sign Clear Glass Theme'),
    ('// @description  US Sign-inspired ChatGPT theme with cached Gaussian reading glass, resilient Bing UHD rotation, static low-overhead wallpaper, lightweight persistent surfaces, improved contrast, native layout, and a cutout geometric cursor.',
     '// @description  Preserved Clear Glass ChatGPT theme with cool translucent surfaces, cached Gaussian reading glass, resilient Bing UHD rotation, native layout, and the cutout geometric cursor.'),
    ('// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js',
     '// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Clear-Glass-Theme.user.js'),
    ('// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js',
     '// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Clear-Glass-Theme.user.js'),
    ('  if (window.__chatgptUsSignGlassThemeV220) return;\n  window.__chatgptUsSignGlassThemeV220 = true;',
     '  if (window.__chatgptUsSignClearGlassThemeV220) return;\n  window.__chatgptUsSignClearGlassThemeV220 = true;\n  document.documentElement?.classList.add("us-sign-theme-clear-glass");\n  if (document.documentElement) document.documentElement.dataset.usSignTheme = "clear-glass";'),
    ('const CACHE_KEY = "chatgpt-us-sign-bing-wallpaper-pool-v3";',
     'const CACHE_KEY = "chatgpt-us-sign-clear-glass-bing-wallpaper-pool-v1";'),
]
for old, new in clear_replacements:
    clear = replace_once(clear, old, new)

dark = source
dark_replacements = [
    ('// @name         ChatGPT - US Sign Glass Theme', '// @name         ChatGPT - US Sign Dark Glass Theme'),
    ('// @version      2.0.20', '// @version      2.1.0'),
    ('// @description  US Sign-inspired ChatGPT theme with cached Gaussian reading glass, resilient Bing UHD rotation, static low-overhead wallpaper, lightweight persistent surfaces, improved contrast, native layout, and a cutout geometric cursor.',
     '// @description  US Sign Dark Glass for ChatGPT with graphite translucent surfaces, restrained semantic blue, cached 14px reading frost, Bing UHD rotation, native layout, and the cutout geometric cursor.'),
    ('  if (window.__chatgptUsSignGlassThemeV220) return;\n  window.__chatgptUsSignGlassThemeV220 = true;',
     '  if (window.__chatgptUsSignDarkGlassThemeV210) return;\n  window.__chatgptUsSignDarkGlassThemeV210 = true;\n  document.documentElement?.classList.add("us-sign-theme-dark-glass");\n  if (document.documentElement) document.documentElement.dataset.usSignTheme = "dark-glass";'),
    ('''      --us-bg: rgba(9, 15, 23, 0.18);\n      --us-bg-elevated: rgba(20, 31, 43, 0.62);\n      --us-bg-soft: rgba(24, 37, 50, 0.46);\n      --us-glass: rgba(18, 30, 43, 0.54);\n      --us-glass-strong: rgba(14, 25, 37, 0.76);\n      --us-glass-soft: rgba(255, 255, 255, 0.05);\n      --us-hover: rgba(123, 194, 255, 0.12);\n      --us-text: #f6f9fc;\n      --us-text-soft: #eaf0f5;\n      --us-text-muted: #b6c2ce;\n      --us-accent: #9bd3ff;\n      --us-accent-soft: rgba(72, 166, 244, 0.18);\n      --us-border: rgba(184, 220, 249, 0.14);\n      --us-border-strong: rgba(195, 227, 252, 0.22);\n      --us-border-focus: rgba(111, 190, 255, 0.62);\n      --us-shadow-sm: 0 5px 16px rgba(0, 0, 0, 0.18);\n      --us-shadow-md: 0 16px 42px rgba(0, 0, 0, 0.24);\n      --us-radius-sm: 8px;\n      --us-radius-md: 12px;\n      --us-radius-lg: 20px;''',
     '''      --us-bg: rgba(8, 8, 10, 0.34);\n      --us-bg-elevated: rgba(15, 15, 18, 0.76);\n      --us-bg-soft: rgba(20, 20, 23, 0.60);\n      --us-glass: rgba(12, 12, 15, 0.58);\n      --us-glass-strong: rgba(8, 8, 10, 0.76);\n      --us-glass-soft: rgba(255, 255, 255, 0.035);\n      --us-hover: rgba(255, 255, 255, 0.055);\n      --us-text: #f2f4f6;\n      --us-text-soft: #d5d5d8;\n      --us-text-muted: #92959b;\n      --us-accent: #8ecbff;\n      --us-accent-soft: rgba(10, 132, 255, 0.16);\n      --us-border: rgba(255, 255, 255, 0.070);\n      --us-border-strong: rgba(255, 255, 255, 0.105);\n      --us-border-focus: rgba(142, 203, 255, 0.48);\n      --us-shadow-sm: 0 4px 14px rgba(0, 0, 0, 0.20);\n      --us-shadow-md: 0 12px 32px rgba(0, 0, 0, 0.26);\n      --us-radius-sm: 7px;\n      --us-radius-md: 10px;\n      --us-radius-lg: 14px;'''),
    ('''      --main-surface-primary: rgba(17, 29, 42, 0.30) !important;\n      --main-surface-secondary: rgba(23, 37, 51, 0.40) !important;\n      --main-surface-tertiary: rgba(29, 45, 60, 0.48) !important;\n      --sidebar-surface-primary: rgba(27, 43, 58, 0.12) !important;\n      --sidebar-surface-secondary: rgba(38, 58, 76, 0.13) !important;\n      --sidebar-surface-tertiary: rgba(48, 68, 86, 0.11) !important;\n      --composer-surface: rgba(15, 28, 40, 0.70) !important;\n      --composer-surface-primary: rgba(15, 28, 40, 0.70) !important;\n      --composer-blue-bg: rgba(80, 165, 238, 0.14) !important;\n      --message-surface: rgba(20, 34, 48, 0.30) !important;''',
     '''      --main-surface-primary: rgba(10, 10, 12, 0.30) !important;\n      --main-surface-secondary: rgba(15, 15, 18, 0.42) !important;\n      --main-surface-tertiary: rgba(20, 20, 23, 0.50) !important;\n      --sidebar-surface-primary: rgba(12, 12, 15, 0.20) !important;\n      --sidebar-surface-secondary: rgba(18, 18, 21, 0.22) !important;\n      --sidebar-surface-tertiary: rgba(24, 24, 27, 0.18) !important;\n      --composer-surface: rgba(10, 10, 13, 0.76) !important;\n      --composer-surface-primary: rgba(10, 10, 13, 0.76) !important;\n      --composer-blue-bg: rgba(10, 132, 255, 0.12) !important;\n      --message-surface: rgba(15, 15, 18, 0.30) !important;'''),
    ('      --interactive-bg-secondary-default: rgba(255, 255, 255, 0.045) !important;\n      --interactive-bg-secondary-hover: rgba(123, 194, 255, 0.10) !important;',
     '      --interactive-bg-secondary-default: rgba(255, 255, 255, 0.035) !important;\n      --interactive-bg-secondary-hover: rgba(255, 255, 255, 0.060) !important;'),
    ('      background: #081019 !important;', '      background: #09090b !important;'),
    ('''        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.12), transparent 38%),\n        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.055), transparent 34%),\n        linear-gradient(rgba(4, 8, 13, 0.20), rgba(6, 11, 17, 0.38)),''',
     '''        radial-gradient(circle at 78% 0%, rgba(255, 255, 255, 0.030), transparent 38%),\n        radial-gradient(circle at 14% 100%, rgba(255, 255, 255, 0.014), transparent 34%),\n        linear-gradient(rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.46)),'''),
    ('        linear-gradient(180deg, rgba(8, 18, 29, 0.55), rgba(5, 14, 24, 0.66)),',
     '        linear-gradient(180deg, rgba(8, 8, 10, 0.56), rgba(5, 5, 7, 0.68)),'),
    ('      -webkit-filter: blur(14px) saturate(114%) brightness(0.92) !important;\n      filter: blur(14px) saturate(114%) brightness(0.92) !important;',
     '      -webkit-filter: blur(14px) saturate(108%) brightness(0.90) !important;\n      filter: blur(14px) saturate(108%) brightness(0.90) !important;'),
    ('      background: linear-gradient(180deg, rgba(10, 23, 36, 0) 0%, rgba(10, 23, 36, 0.12) 48%, rgba(10, 23, 36, 0.30) 100%) !important;',
     '      background: linear-gradient(180deg, rgba(8, 8, 10, 0) 0%, rgba(8, 8, 10, 0.14) 48%, rgba(8, 8, 10, 0.36) 100%) !important;'),
    ('      background: rgba(22, 38, 53, 0.64) !important;\n      background-image: linear-gradient(180deg, rgba(190, 222, 247, 0.040), rgba(255,255,255,0.008)) !important;\n      border-inline-end: 1px solid rgba(190, 224, 250, 0.13) !important;',
     '      background: rgba(12, 12, 15, 0.64) !important;\n      background-image: linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.004)) !important;\n      border-inline-end: 1px solid rgba(255,255,255,0.070) !important;'),
    ('      background: rgba(20, 34, 48, 0.74) !important;\n      border: 1px solid rgba(192, 224, 249, 0.16) !important;',
     '      background: rgba(12, 12, 15, 0.78) !important;\n      border: 1px solid rgba(255,255,255,0.090) !important;'),
    ('      background: rgba(123, 194, 255, 0.11) !important;', '      background: rgba(255,255,255,0.060) !important;'),
    ('      border-color: rgba(155, 211, 255, 0.32) !important;\n      background: rgba(13, 27, 41, 0.42) !important;',
     '      border-color: rgba(142, 203, 255, 0.22) !important;\n      background: rgba(12, 12, 15, 0.52) !important;'),
    ('      background: rgba(5, 11, 18, 0.84) !important;\n      border: 1px solid rgba(184, 220, 249, 0.15) !important;',
     '      background: rgba(5, 5, 7, 0.86) !important;\n      border: 1px solid rgba(255,255,255,0.080) !important;'),
    ('      background: rgba(10, 22, 34, 0.52) !important;', '      background: rgba(10, 10, 12, 0.58) !important;'),
    ('      background: rgba(15, 28, 40, 0.80) !important;\n      background-image: linear-gradient(180deg, rgba(201, 229, 250, 0.045), rgba(255,255,255,0.010)) !important;\n      border: 1px solid rgba(195, 227, 252, 0.19) !important;',
     '      background: rgba(10, 10, 13, 0.80) !important;\n      background-image: linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.004)) !important;\n      border: 1px solid rgba(255,255,255,0.105) !important;'),
    ('      background: rgba(28, 44, 59, 0.76) !important;\n      background-image: linear-gradient(180deg, rgba(176, 218, 249, 0.055), rgba(255,255,255,0.012)) !important;\n      border: 1px solid rgba(196, 226, 250, 0.20) !important;\n      box-shadow: 0 18px 44px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.045) !important;\n      -webkit-backdrop-filter: blur(12px) saturate(120%) !important;\n      backdrop-filter: blur(12px) saturate(120%) !important;',
     '      background: rgba(13, 13, 16, 0.92) !important;\n      background-image: linear-gradient(180deg, rgba(255,255,255,0.030), rgba(255,255,255,0.004)) !important;\n      border: 1px solid rgba(255,255,255,0.105) !important;\n      box-shadow: 0 18px 44px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.045) !important;\n      -webkit-backdrop-filter: blur(14px) saturate(108%) brightness(90%) !important;\n      backdrop-filter: blur(14px) saturate(108%) brightness(90%) !important;'),
    ('      background: rgba(24, 38, 52, 0.90) !important;\n      border: 1px solid rgba(196, 226, 250, 0.20) !important;\n      box-shadow: 0 24px 64px rgba(0,0,0,0.32) !important;\n      -webkit-backdrop-filter: blur(8px) saturate(112%) !important;\n      backdrop-filter: blur(8px) saturate(112%) !important;',
     '      background: rgba(12, 12, 15, 0.94) !important;\n      border: 1px solid rgba(255,255,255,0.105) !important;\n      box-shadow: 0 24px 64px rgba(0,0,0,0.32) !important;\n      -webkit-backdrop-filter: blur(14px) saturate(108%) brightness(90%) !important;\n      backdrop-filter: blur(14px) saturate(108%) brightness(90%) !important;'),
    ('      background: rgba(205, 229, 247, 0.18) !important;', '      background: rgba(255,255,255,0.16) !important;'),
    ('      background: rgba(205, 229, 247, 0.30) !important;', '      background: rgba(255,255,255,0.26) !important;'),
    ('      background: rgba(142, 203, 255, 0.30) !important;', '      background: rgba(255,255,255,0.20) !important;'),
    ('        -webkit-filter: blur(10px) saturate(110%) brightness(0.92) !important;\n        filter: blur(10px) saturate(110%) brightness(0.92) !important;',
     '        -webkit-filter: blur(10px) saturate(106%) brightness(0.90) !important;\n        filter: blur(10px) saturate(106%) brightness(0.90) !important;'),
    ('const CACHE_KEY = "chatgpt-us-sign-bing-wallpaper-pool-v3";',
     'const CACHE_KEY = "chatgpt-us-sign-dark-glass-bing-wallpaper-pool-v1";'),
]
for old, new in dark_replacements:
    dark = replace_once(dark, old, new)

outputs = {
    TAMPER / 'ChatGPT-US-Sign-Clear-Glass-Theme.user.js': clear,
    TAMPER / 'ChatGPT-US-Sign-Clear-Glass-Theme-v2.0.20.user.js': clear,
    TAMPER / 'ChatGPT-US-Sign-Glass-Theme.user.js': dark,
    TAMPER / 'ChatGPT-US-Sign-Dark-Glass-Theme-v2.1.0.user.js': dark,
}
TAMPER.mkdir(parents=True, exist_ok=True)
for path, text in outputs.items():
    path.write_text(text, encoding='utf-8', newline='\n')

if clear != (TAMPER / 'ChatGPT-US-Sign-Clear-Glass-Theme-v2.0.20.user.js').read_text(encoding='utf-8'):
    raise SystemExit('Clear canonical/snapshot mismatch')
if dark != (TAMPER / 'ChatGPT-US-Sign-Dark-Glass-Theme-v2.1.0.user.js').read_text(encoding='utf-8'):
    raise SystemExit('Dark canonical/snapshot mismatch')

print('Built ChatGPT Clear Glass 2.0.20 and Dark Glass 2.1.0')
