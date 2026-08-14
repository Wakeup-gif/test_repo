from pathlib import Path
p=Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
s=p.read_text(encoding='utf-8')
if '// @version      2.1.19' in s:
    raise SystemExit(0)
if '// @version      2.1.18' not in s:
    raise SystemExit('Expected v2.1.18')
s=s.replace('// @version      2.1.18','// @version      2.1.19',1)
s=s.replace('us-sign-cursor-arrow-elegant-v218.svg\\\") 4 3','us-sign-cursor-arrow-luxe-v219.svg\\\") 4 3')
s=s.replace('us-sign-cursor-pointer-elegant-v218b.svg\\\") 4 3','us-sign-cursor-pointer-luxe-v219.svg\\\") 4 3')
p.write_text(s, encoding='utf-8')
