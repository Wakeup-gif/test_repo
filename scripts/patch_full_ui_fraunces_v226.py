from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANONICAL = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"
SNAPSHOT = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme-v2.2.6.user.js"

text = CANONICAL.read_text(encoding="utf-8")

replacements = [
    ("// @version      2.2.5", "// @version      2.2.6"),
    (
        "// @description  Canonical SquareCoil Dark Glass UI with layered Design identity, job-state-first hierarchy, overview-before-actions spacing, audited 14px frost, graphite surfaces, shared wallpaper crossfade, and semantic states.",
        "// @description  Canonical SquareCoil Dark Glass UI with bold Fraunces project identity, Manrope operational typography, layered Design hierarchy, audited 14px frost, graphite surfaces, shared wallpaper crossfade, and semantic states."
    ),
    (
        '@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;650;700&display=swap");',
        '@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,800&family=Manrope:wght@400;500;600;650;700&display=swap");'
    ),
    (
        '      --us-display-font: "US Roxborough", "Iowan Old Style", "Baskerville", "Times New Roman", serif;',
        '      --us-display-font: "Fraunces", "Iowan Old Style", "Baskerville", "Times New Roman", serif;'
    ),
    (
        '      font-family: var(--us-display-font) !important;\n      font-weight: 500 !important;\n      letter-spacing: -0.028em !important;',
        '      font-family: var(--us-display-font) !important;\n      font-weight: 700 !important;\n      letter-spacing: -0.032em !important;'
    ),
]

for old, new in replacements:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one source marker, found {count}: {old[:100]!r}")
    text = text.replace(old, new, 1)

anchor = '''    /* Keep operational UI crisp and modern. */\n'''
if text.count(anchor) != 1:
    raise SystemExit("Could not find operational typography anchor")

fraunces_override = '''    /* v2.2.6: Bold Fraunces is reserved for project identity. The project\n       number carries the strongest weight; the job title stays bold but cleaner. */\n    html.us-sign-design-page body #pmlt h1,\n    html.us-sign-design-page body #pmlt .project-number,\n    html.us-sign-design-page body #pmlt [class*="project-number" i] {\n      font-family: var(--us-display-font) !important;\n      font-weight: 800 !important;\n      letter-spacing: -0.038em !important;\n      font-optical-sizing: auto !important;\n    }\n\n    html.us-sign-design-page body #us-sign-design-project-header #customer-name :is(h1,h2,h3,.panel-title) {\n      font-family: var(--us-display-font) !important;\n      font-weight: 700 !important;\n      letter-spacing: -0.032em !important;\n      font-optical-sizing: auto !important;\n    }\n\n'''
text = text.replace(anchor, fraunces_override + anchor, 1)

required = [
    "// @version      2.2.6",
    'family=Fraunces:opsz,wght@9..144,700;9..144,800',
    '--us-display-font: "Fraunces"',
    'font-weight: 800 !important;',
    '#us-sign-design-project-header #customer-name :is(h1,h2,h3,.panel-title)',
]
for marker in required:
    if marker not in text:
        raise SystemExit(f"Missing final marker: {marker}")

CANONICAL.write_text(text, encoding="utf-8")
SNAPSHOT.write_text(text, encoding="utf-8")
print("Patched Full UI to v2.2.6 with bold Fraunces project identity")
