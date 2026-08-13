from pathlib import Path

p = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
s = p.read_text(encoding='utf-8')

replacements = {
    '// @version      2.1.5': '// @version      2.1.6',
    '// @description  Stable SquareCoil wallpaper layout with refined blue macOS-inspired glass hierarchy, stronger readability, and paint-only visual polish. No project geometry overrides.': '// @description  Stable SquareCoil wallpaper layout with lighter true-glass transparency, visible wallpaper, and paint-only visual polish. No project geometry overrides.',
    '--us-glass-rail: rgba(9, 17, 27, 0.78);': '--us-glass-rail: rgba(9, 17, 27, 0.50);',
    '--us-glass-header: rgba(10, 18, 28, 0.86);': '--us-glass-header: rgba(10, 18, 28, 0.58);',
    '--us-glass-hero: rgba(19, 31, 45, 0.58);': '--us-glass-hero: rgba(19, 31, 45, 0.32);',
    '--us-glass-card: rgba(13, 23, 35, 0.72);': '--us-glass-card: rgba(13, 23, 35, 0.40);',
    '--us-glass-card-strong: rgba(10, 19, 30, 0.80);': '--us-glass-card-strong: rgba(10, 19, 30, 0.48);',
    '--us-glass-inner: rgba(5, 12, 20, 0.52);': '--us-glass-inner: rgba(5, 12, 20, 0.24);',
    'linear-gradient(180deg, rgba(23, 36, 51, 0.88), rgba(8, 16, 25, 0.84))': 'linear-gradient(180deg, rgba(29, 48, 68, 0.54), rgba(6, 14, 23, 0.50))',
    'background-color: rgba(11, 18, 28, 0.84)': 'background-color: rgba(11, 18, 28, 0.58)',
    'linear-gradient(180deg, rgba(17, 29, 42, 0.90), rgba(8, 16, 25, 0.88))': 'linear-gradient(180deg, rgba(18, 34, 49, 0.66), rgba(6, 14, 23, 0.58))',
    'background-color: rgba(9, 17, 27, 0.88)': 'background-color: rgba(9, 17, 27, 0.62)',
    'linear-gradient(180deg, rgba(20, 32, 46, 0.80), rgba(8, 16, 26, 0.82))': 'linear-gradient(180deg, rgba(20, 39, 56, 0.48), rgba(5, 13, 22, 0.46))',
    'linear-gradient(180deg, rgba(76, 98, 122, 0.42), rgba(20, 31, 44, 0.54))': 'linear-gradient(180deg, rgba(112, 150, 186, 0.22), rgba(20, 36, 54, 0.28))',
    'linear-gradient(180deg, rgba(20, 31, 44, 0.82), rgba(8, 16, 26, 0.82))': 'linear-gradient(180deg, rgba(19, 36, 53, 0.50), rgba(6, 15, 25, 0.46))',
    'linear-gradient(180deg, rgba(22, 35, 49, 0.70), rgba(8, 16, 26, 0.72))': 'linear-gradient(180deg, rgba(25, 46, 65, 0.42), rgba(5, 14, 24, 0.38))',
    'linear-gradient(180deg, rgba(73, 115, 154, 0.11), rgba(255, 255, 255, 0.018))': 'linear-gradient(180deg, rgba(106, 169, 222, 0.075), rgba(255, 255, 255, 0.012))',
    'background-color: rgba(255, 255, 255, 0.025)': 'background-color: rgba(255, 255, 255, 0.018)',
    'background: rgba(4, 10, 17, 0.08)': 'background: rgba(3, 9, 16, 0.035)',
    'background-color: rgba(4, 10, 17, 0.08)': 'background-color: rgba(3, 9, 16, 0.035)',
    'background: rgba(5, 12, 20, 0.34)': 'background: rgba(4, 11, 19, 0.20)',
    'background: rgba(116, 173, 224, 0.055)': 'background: rgba(116, 173, 224, 0.035)',
    'background: rgba(4, 11, 19, 0.52)': 'background: rgba(3, 10, 18, 0.36)',
    'background-color: rgba(4, 11, 19, 0.52)': 'background-color: rgba(3, 10, 18, 0.36)',
}

for old, new in replacements.items():
    if old in s:
        s = s.replace(old, new)

p.write_text(s, encoding='utf-8')
