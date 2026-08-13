from pathlib import Path

p = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
s = p.read_text(encoding='utf-8')
s = s.replace('// @version      2.1.3', '// @version      2.1.4', 1)
s = s.replace('v2.1.3 CANVAS WALLPAPER STACK', 'v2.1.4 CANVAS WALLPAPER STACK', 1)
marker = '       v2.1.4 CANVAS WALLPAPER STACK'
pos = s.find(marker)
if pos < 0:
    raise SystemExit('canvas block not found')
old = '    html body #main,\n    html body #content_wrapper,\n    html body #content,\n'
idx = s.find(old, pos)
if idx < 0:
    raise SystemExit('canvas selector list not found')
s = s[:idx] + '    html body #content,\n' + s[idx + len(old):]
p.write_text(s, encoding='utf-8')
