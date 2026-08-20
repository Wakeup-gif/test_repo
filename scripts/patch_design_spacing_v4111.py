from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANONICAL = ROOT / "tampermonkey" / "US-Sign-Design-Job-Tools.user.js"
SNAPSHOT = ROOT / "tampermonkey" / "US-Sign-Design-Job-Tools-v4.1.11.user.js"

text = CANONICAL.read_text(encoding="utf-8")

replacements = [
    ("// @version      4.1.10", "// @version      4.1.11"),
    ('const VERSION = "4.1.10";', 'const VERSION = "4.1.11";'),
    ('// @description  Design workspace with layered project identity, job-state-first hierarchy, overview details, then actions; Dark Glass paint remains owned centrally by Full UI Theme.',
     '// @description  Design workspace with layered project identity, job-state-first hierarchy, explicit vertical section spacing, overview details, then actions; Dark Glass paint remains owned centrally by Full UI Theme.'),
    ('"grid-template-rows":"minmax(56px, auto)", width:"100%", "min-width":"0", "min-height":"56px", margin:"0", padding:"0"',
     '"grid-template-rows":"minmax(56px, auto)", width:"100%", "min-width":"0", "min-height":"56px", margin:"0 0 12px", padding:"0"'),
    ('min-height:58px!important;margin:0!important;padding:0!important;',
     'min-height:58px!important;margin:0 0 12px!important;padding:0!important;')
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f"Expected source marker not found: {old}")
    text = text.replace(old, new, 1)

if text.count('margin:"0 0 12px"') != 1:
    raise SystemExit("Inline summary spacing marker count is not exactly one")
if text.count('margin:0 0 12px!important') < 1:
    raise SystemExit("CSS summary spacing marker missing")

CANONICAL.write_text(text, encoding="utf-8")
SNAPSHOT.write_text(text, encoding="utf-8")
print("Patched Design Job Tools to v4.1.11 with 12px summary-to-overview spacing")
# Trigger release after workflow creation.
