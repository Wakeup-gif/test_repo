from pathlib import Path

p = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
s = p.read_text(encoding='utf-8')
s = s.replace('// @version      2.1.2', '// @version      2.1.3', 1)
s = s.replace('v2.1.2 CANVAS OPACITY TUNING', 'v2.1.3 CANVAS WALLPAPER STACK', 1)
s = s.replace('background: rgba(8, 14, 22, 0.075) !important;\n      background-color: rgba(8, 14, 22, 0.075) !important;\n      background-image: none !important;', 'background: rgba(8, 14, 22, 0.10) !important;\n      background-color: rgba(8, 14, 22, 0.10) !important;\n      background-image: none !important;', 1)
insert = '''\n    html body #main,\n    html body #content_wrapper {\n      background-color: #081019 !important;\n      background-image:\n        linear-gradient(rgba(4, 8, 13, 0.28), rgba(6, 11, 17, 0.54)),\n        var(--us-wallpaper) !important;\n      background-position: center center !important;\n      background-size: cover !important;\n      background-repeat: no-repeat !important;\n      background-attachment: fixed !important;\n    }\n\n'''
marker = '    /* =========================================================\n       v2.1.3 CANVAS WALLPAPER STACK\n'
idx = s.find(marker)
if idx < 0:
    raise SystemExit('canvas block not found')
s = s[:idx] + insert + s[idx:]
p.write_text(s, encoding='utf-8')
