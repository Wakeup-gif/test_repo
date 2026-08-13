from pathlib import Path
p=Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
s=p.read_text(encoding='utf-8')
if '// @version      2.1.19' in s:
    raise SystemExit(0)
if '// @version      2.1.18' not in s:
    raise SystemExit('Expected v2.1.18')
s=s.replace('// @version      2.1.18','// @version      2.1.19',1)
s=s.replace('us-sign-cursor-arrow-elegant-v218.svg\") 4 3','us-sign-cursor-crystal-v219.svg\") 4 3',1)
s=s.replace('us-sign-cursor-pointer-elegant-v218b.svg\") 4 3','us-sign-cursor-crystal-active-v219.svg\") 4 3',1)
s=s.replace('    html body #sidebar_left,\n    html body #sidebar_left *,\n    html body button,','    html body #sidebar_left,\n    html body button,',1)
css='''\n\n    /* v2.1.19 sidebar icon alignment */\n    html body #sidebar_left .nav > li > a :is(.fa,.glyphicon,.glyphicons,.imoon,[class^="fa-"],[class*=" fa-"],[class^="glyphicon-"],[class*=" glyphicon-"],[class^="glyphicons-"],[class*=" glyphicons-"],[class^="icon-"],[class*=" icon-"]) {\n      display:inline-flex !important;\n      align-items:center !important;\n      justify-content:center !important;\n      width:18px !important;\n      min-width:18px !important;\n      height:18px !important;\n      line-height:18px !important;\n      margin-right:8px !important;\n      vertical-align:-3px !important;\n      text-align:center !important;\n    }\n'''
marker='\n    @media print {'
pos=s.rfind(marker)
if pos<0: raise SystemExit('print marker missing')
s=s[:pos]+css+s[pos:]
p.write_text(s,encoding='utf-8')
