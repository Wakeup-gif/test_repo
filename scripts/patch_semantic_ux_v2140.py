from pathlib import Path

root = Path(__file__).resolve().parents[1]
p = root / 'tampermonkey' / 'US-Sign-Full-UI-Theme.user.js'
s = p.read_text()

if '// @version      2.1.39' not in s:
    raise SystemExit('expected v2.1.39')

s = s.replace('// @version      2.1.39', '// @version      2.1.40', 1)
s = s.replace('semantic project states, native-structure Status', 'refined semantic project states, native-structure Status', 1)

# Tone down the semantic palette borders so color comes from tint/fill, not white-ish outlines.
repls = {
    '--us-state-blue-border: rgba(115, 190, 248, 0.28);': '--us-state-blue-border: rgba(115, 190, 248, 0.16);',
    '--us-state-teal-border: rgba(126, 213, 207, 0.27);': '--us-state-teal-border: rgba(126, 213, 207, 0.15);',
    '--us-state-green-border: rgba(135, 207, 157, 0.28);': '--us-state-green-border: rgba(135, 207, 157, 0.16);',
    '--us-state-amber-border: rgba(235, 181, 88, 0.30);': '--us-state-amber-border: rgba(235, 181, 88, 0.17);',
    '--us-state-red-border: rgba(231, 120, 120, 0.31);': '--us-state-red-border: rgba(231, 120, 120, 0.18);',
    '--us-state-purple-border: rgba(181, 157, 230, 0.27);': '--us-state-purple-border: rgba(181, 157, 230, 0.15);',
    'box-shadow: inset 0 1px 0 rgba(255,255,255,0.035) !important;': 'box-shadow: none !important;',
    'border-color: rgba(226, 242, 255, 0.10) !important;\n    }\n    html.us-sign-semantic-project-ux [data-us-action="utility"]:hover': 'border-color: rgba(226, 242, 255, 0.065) !important;\n    }\n    html.us-sign-semantic-project-ux [data-us-action="utility"]:hover',
    'border-color: rgba(142, 205, 252, 0.22) !important;': 'border-color: rgba(142, 205, 252, 0.13) !important;',
    'border-color: rgba(112, 191, 249, 0.31) !important;': 'border-color: rgba(112, 191, 249, 0.18) !important;',
    'box-shadow: inset 0 1px 0 rgba(255,255,255,0.055), 0 5px 16px rgba(0,0,0,0.08) !important;': 'box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important;',
    'border-color: rgba(137, 207, 255, 0.42) !important;': 'border-color: rgba(137, 207, 255, 0.23) !important;',
    'border-color: rgba(132, 207, 153, 0.27) !important;': 'border-color: rgba(132, 207, 153, 0.16) !important;',
    'border-color: rgba(220, 105, 105, 0.24) !important;': 'border-color: rgba(220, 105, 105, 0.15) !important;',
    'border-color: rgba(239, 127, 127, 0.40) !important;': 'border-color: rgba(239, 127, 127, 0.23) !important;',
    'border-color: rgba(223, 177, 91, 0.27) !important;': 'border-color: rgba(223, 177, 91, 0.16) !important;',
}
for old, new in repls.items():
    if old not in s:
        raise SystemExit(f'missing expected token: {old[:80]}')
    s = s.replace(old, new, 1)

# Hours is informational numeric/data content, not a workflow state. Keep it normal.
old = "      else if (label === 'priority' || label === 'status' || label === 'hours') state = usSignSemanticStateFromText(value);"
new = "      else if (label === 'priority' || label === 'status') state = usSignSemanticStateFromText(value);\n      if (label === 'hours') cell.dataset.usField = 'hours';"
if old not in s:
    raise SystemExit('hours state logic not found')
s = s.replace(old, new, 1)

marker = '''    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-label {
      color: rgba(174, 192, 208, 0.76) !important;
      font-weight: 600 !important;
    }
'''
insert = marker + '''
    /* v2.1.40: Hours is plain operational data, not a semantic badge. */
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-field="hours"] {
      border-color: transparent !important;
      background: transparent !important;
      padding-left: 0 !important;
    }
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-field="hours"]::before {
      content: none !important;
      display: none !important;
    }
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-field="hours"] .us-sign-djt-summary-value {
      display: block !important;
      min-height: 0 !important;
      padding: 0 !important;
      color: rgba(234, 241, 247, 0.90) !important;
      background: transparent !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
    }
'''
if marker not in s:
    raise SystemExit('semantic label marker not found')
s = s.replace(marker, insert, 1)

p.write_text(s)

# Fresh installer filename because browser/Tampermonkey caching has been flaky.
installer = root / 'tampermonkey' / 'US-Sign-Full-UI-Theme-v2.1.40.user.js'
installer.write_text(s)
print('patched v2.1.40')
