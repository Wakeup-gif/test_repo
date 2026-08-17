from pathlib import Path

root = Path(__file__).resolve().parents[1]
p = root / 'tampermonkey' / 'US-Sign-Full-UI-Theme.user.js'
s = p.read_text()

if '@version      2.1.40' not in s:
    raise SystemExit('Expected v2.1.40 canonical theme')

s = s.replace('@version      2.1.40', '@version      2.1.41', 1)
s = s.replace(
    'Stable SquareCoil frosted-glass UI with refined semantic project states, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    'Stable SquareCoil frosted-glass UI with softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1,
)

marker = '''    /* v2.1.40: Hours is plain operational data, not a semantic badge. */
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
    raise SystemExit('Hours marker not found')

addition = marker + '''

    /* =========================================================
       v2.1.41 SEMANTIC PILL POLISH
       Match the rest of the glass UI: low-contrast hairlines, state carried
       by translucent fill, and Urgent promoted to a true danger/red state.
    ========================================================= */
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state] {
      border: 1px solid rgba(226, 242, 255, 0.055) !important;
      box-shadow: none !important;
      text-shadow: none !important;
      outline: none !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="pending"] {
      color: #b9ddfa !important;
      background: rgba(51, 124, 183, 0.16) !important;
      border: 1px solid rgba(132, 193, 237, 0.085) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="submitted"] {
      color: #bce9e5 !important;
      background: rgba(49, 131, 126, 0.16) !important;
      border: 1px solid rgba(139, 211, 204, 0.085) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="success"] {
      color: #c8ebd2 !important;
      background: rgba(56, 125, 78, 0.17) !important;
      border: 1px solid rgba(148, 211, 166, 0.085) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="urgent"] {
      color: #ffd6d6 !important;
      background: rgba(165, 49, 49, 0.28) !important;
      border: 1px solid rgba(241, 128, 128, 0.12) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="due-today"],
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="due-soon"] {
      color: #f4dfa6 !important;
      background: rgba(151, 105, 29, 0.20) !important;
      border: 1px solid rgba(230, 184, 96, 0.095) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="overdue"],
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="danger"] {
      color: #ffd1d1 !important;
      background: rgba(160, 46, 46, 0.25) !important;
      border: 1px solid rgba(238, 120, 120, 0.11) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="hold"] {
      color: #ddcff8 !important;
      background: rgba(103, 79, 148, 0.16) !important;
      border: 1px solid rgba(190, 171, 226, 0.08) !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state="unset"] {
      color: rgba(205, 216, 226, 0.78) !important;
      background: rgba(255, 255, 255, 0.026) !important;
      border: 1px solid rgba(220, 237, 250, 0.055) !important;
    }

    /* Urgent is a danger signal; due dates remain amber until overdue. */
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-state="urgent"] {
      color: #f0a0a0 !important;
      background: rgba(151, 46, 46, 0.055) !important;
      border-color: transparent !important;
    }
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-state="urgent"]::before {
      background: rgba(229, 99, 99, 0.78) !important;
    }

    /* Keep operational data compact; Hours should never resemble a status. */
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-field="hours"] .us-sign-djt-summary-value {
      font-size: 12.5px !important;
      font-weight: 600 !important;
      letter-spacing: 0 !important;
    }
'''

s = s.replace(marker, addition, 1)

# Urgent should no longer share the amber group in the earlier semantic rule.
old = '''    html.us-sign-semantic-project-ux [data-us-state="urgent"],
    html.us-sign-semantic-project-ux [data-us-state="due-today"],
    html.us-sign-semantic-project-ux [data-us-state="due-soon"] {
      color: var(--us-state-amber) !important;
      border-color: var(--us-state-amber-border) !important;
      background-color: var(--us-state-amber-bg) !important;
    }
'''
new = '''    html.us-sign-semantic-project-ux [data-us-state="due-today"],
    html.us-sign-semantic-project-ux [data-us-state="due-soon"] {
      color: var(--us-state-amber) !important;
      border-color: var(--us-state-amber-border) !important;
      background-color: var(--us-state-amber-bg) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="urgent"] {
      color: var(--us-state-red) !important;
      border-color: var(--us-state-red-border) !important;
      background-color: rgba(177, 67, 67, 0.24) !important;
    }
'''
if old not in s:
    raise SystemExit('Urgent semantic group not found')
s = s.replace(old, new, 1)

p.write_text(s)
installer = root / 'tampermonkey' / 'US-Sign-Full-UI-Theme-v2.1.41.user.js'
installer.write_text(s)
