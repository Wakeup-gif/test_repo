from pathlib import Path

TM = Path('tampermonkey')
path = TM / 'US-Sign-Design-Job-Tools.user.js'
text = path.read_text(encoding='utf-8')


def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected 1 match, found {count}')
    text = text.replace(old, new, 1)

replace_once('// @version      4.1.6', '// @version      4.1.7', 'metadata version')
replace_once(
    '// @description  Stable Design workspace with bounded startup discovery, one scoped data observer, and no permanent content watcher.',
    '// @description  Stable Design workspace with audited Dark Glass spacing, cleaner actions, stronger contrast, native-artifact cleanup, bounded startup discovery, and one scoped data observer.',
    'metadata description'
)
replace_once('const VERSION = "4.1.6";', 'const VERSION = "4.1.7";', 'runtime version')

marker = '      /* v4.1.7 DESIGN DARK GLASS POLISH */'
if marker in text:
    raise RuntimeError('v4.1.7 polish already present')

anchor = '    `;\n    (document.head || document.documentElement).appendChild(themeStyle);'
if text.count(anchor) < 1:
    raise RuntimeError('Dark Glass bridge closing anchor not found')

polish = r'''

      /* v4.1.7 DESIGN DARK GLASS POLISH */
      /* The audit showed #bottomGrid and #rightStack were painted as dark cards
         behind the real glass cards. They are layout-only and must stay clear. */
      html.us-sign-theme-dark-glass body #${IDS.bottomGrid},
      html.us-sign-theme-dark-glass body #${IDS.rightStack} {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        border: 0 !important;
        box-shadow: none !important;
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }

      /* Hide the empty legacy data-table wrapper that survives immediately after
         the replacement summary and creates a phantom vertical gap. */
      html.us-sign-theme-dark-glass body #${IDS.summary} + div:has(> table[aria-hidden="true"]) {
        display: none !important;
      }

      /* One spacing rhythm for the lower workspace. */
      html.us-sign-theme-dark-glass body #${IDS.bottomGrid} {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
        gap: 14px !important;
        align-items: start !important;
        margin-top: 14px !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} {
        display: grid !important;
        gap: 14px !important;
        align-content: start !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.bottomGrid} > .us-sign-description-panel,
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel,
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-files-panel {
        margin: 0 !important;
      }

      /* Action bar: compact but no longer cramped. Utility actions stay neutral;
         destructive and creation actions regain clear semantic contrast. */
      html.us-sign-theme-dark-glass body #${IDS.actionbar} {
        min-height: 50px !important;
        padding: 8px 10px !important;
        gap: 12px !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.copyTools} .us-sign-copy-toolbar,
      html.us-sign-theme-dark-glass body #${IDS.nativeActions} {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.actionbar} :is(button, a.btn, .us-sign-native-action) {
        min-height: 32px !important;
        height: 32px !important;
        padding: 0 11px !important;
        color: #dfe3e8 !important;
        background: rgba(255, 255, 255, 0.045) !important;
        background-image: none !important;
        border: 1px solid rgba(255, 255, 255, 0.09) !important;
        border-radius: 8px !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.025) !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        line-height: 1 !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.actionbar} :is(button, a.btn, .us-sign-native-action):hover,
      html.us-sign-theme-dark-glass body #${IDS.actionbar} :is(button, a.btn, .us-sign-native-action):focus-visible {
        color: #ffffff !important;
        background: rgba(255, 255, 255, 0.078) !important;
        border-color: rgba(255, 255, 255, 0.14) !important;
        outline: none !important;
      }
      html.us-sign-theme-dark-glass body #delete-design[data-us-action="danger"] {
        color: #ffd8d8 !important;
        background: rgba(132, 42, 46, 0.42) !important;
        border-color: rgba(229, 114, 120, 0.34) !important;
      }
      html.us-sign-theme-dark-glass body #delete-design[data-us-action="danger"]:hover,
      html.us-sign-theme-dark-glass body #delete-design[data-us-action="danger"]:focus-visible {
        color: #ffffff !important;
        background: rgba(158, 48, 53, 0.56) !important;
        border-color: rgba(242, 137, 142, 0.48) !important;
      }

      /* Overview values are copy targets, not giant flat table cells. Give them
         subtle card separation and a clear hover affordance without nested blur. */
      html.us-sign-theme-dark-glass body #${IDS.overview} .us-sign-overview-stack {
        display: grid !important;
        gap: 5px !important;
        padding: 5px 6px 5px 0 !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.overview} .us-sign-overview-row {
        gap: 5px !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.overview} .us-sign-overview-title {
        display: flex !important;
        align-items: center !important;
        padding: 0 12px !important;
        color: #eef1f4 !important;
        background: rgba(255,255,255,.018) !important;
        border-right: 1px solid rgba(255,255,255,.055) !important;
        font-size: 12px !important;
        font-weight: 650 !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.overview} .us-sign-overview-field {
        min-height: 43px !important;
        padding: 6px 9px !important;
        color: #d9dde2 !important;
        background: rgba(255,255,255,.018) !important;
        background-image: none !important;
        border: 1px solid rgba(255,255,255,.045) !important;
        border-radius: 7px !important;
        box-shadow: none !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.overview} .us-sign-overview-field:hover,
      html.us-sign-theme-dark-glass body #${IDS.overview} .us-sign-overview-field:focus-visible {
        color: #ffffff !important;
        background: rgba(255,255,255,.045) !important;
        border-color: rgba(255,255,255,.09) !important;
        outline: none !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.overview} .us-sign-overview-label,
      html.us-sign-theme-dark-glass body #${IDS.summary} .us-sign-djt-summary-label {
        color: #949aa2 !important;
        font-size: 9.5px !important;
        font-weight: 650 !important;
        letter-spacing: .015em !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.overview} .us-sign-overview-value {
        color: #dde1e6 !important;
        font-size: 12px !important;
        font-weight: 600 !important;
      }

      /* Summary: preserve semantic pills, but separate the five cells enough to
         scan quickly and remove the old transparent-border artifacts. */
      html.us-sign-theme-dark-glass body #${IDS.summary} {
        gap: 5px !important;
        padding: 5px !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.summary} > .us-sign-djt-summary-cell {
        min-height: 50px !important;
        padding: 7px 9px !important;
        background: rgba(255,255,255,.016) !important;
        border: 1px solid rgba(255,255,255,.04) !important;
        border-radius: 7px !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.summary} .us-sign-djt-summary-value:not([data-us-state]) {
        color: #e2e5e9 !important;
        font-size: 12px !important;
        font-weight: 600 !important;
      }

      /* Panel shells and headings: remove Bootstrap's little 1px boxed heading
         artifacts and use one border around the actual outer glass panel. */
      html.us-sign-theme-dark-glass body #${IDS.bottomGrid} > .us-sign-description-panel,
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel,
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-files-panel {
        overflow: hidden !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.bottomGrid} > .us-sign-description-panel > .panel-heading,
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel > .panel-heading,
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-files-panel > .panel-heading {
        display: flex !important;
        align-items: center !important;
        min-height: 40px !important;
        height: 40px !important;
        padding: 0 12px !important;
        color: #f0f2f5 !important;
        background: rgba(255,255,255,.022) !important;
        background-image: none !important;
        border: 0 !important;
        border-bottom: 1px solid rgba(255,255,255,.055) !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        font-size: 13px !important;
        font-weight: 650 !important;
        line-height: 1.2 !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} .panel-heading :is(.widget-menu, .pull-right) {
        display: flex !important;
        align-items: center !important;
        float: none !important;
        margin-left: auto !important;
      }

      /* Header creation controls are primary actions, so blue is reserved here
         rather than tinting neutral surfaces. */
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel > .panel-heading a.btn,
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-files-panel > .panel-heading a.btn {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 30px !important;
        height: 30px !important;
        padding: 0 10px !important;
        color: #edf7ff !important;
        background: rgba(49, 116, 177, .58) !important;
        background-image: none !important;
        border: 1px solid rgba(132, 194, 244, .28) !important;
        border-radius: 8px !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.05) !important;
        font-size: 11.5px !important;
        font-weight: 650 !important;
        line-height: 1 !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-files-panel > .panel-heading a.btn {
        width: 30px !important;
        padding: 0 !important;
        font-size: 16px !important;
        font-weight: 500 !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > :is(.us-sign-designs-panel,.us-sign-files-panel) > .panel-heading a.btn:hover,
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > :is(.us-sign-designs-panel,.us-sign-files-panel) > .panel-heading a.btn:focus-visible {
        color: #ffffff !important;
        background: rgba(59, 139, 208, .72) !important;
        border-color: rgba(153, 211, 255, .42) !important;
        outline: none !important;
      }

      /* Body spacing and description readability. The native max-width/overflow
         inline artifact is safe to remove after the panel was moved into the grid. */
      html.us-sign-theme-dark-glass body #${IDS.bottomGrid} > .us-sign-description-panel > .panel-body {
        padding: 14px 16px 16px !important;
        color: #d7dbe0 !important;
        line-height: 1.55 !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.bottomGrid} > .us-sign-description-panel > .panel-body > .row {
        margin: 0 !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.bottomGrid} > .us-sign-description-panel > .panel-body > .row > [class*="col-"] {
        width: 100% !important;
        max-width: none !important;
        padding: 0 !important;
        overflow: visible !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > :is(.us-sign-designs-panel,.us-sign-files-panel) > .panel-body {
        padding: 10px 12px 12px !important;
      }

      /* Native Designs markup carries bgcolor=cecece and inline color:black.
         Explicitly neutralize both so they cannot leak through Dark Glass. */
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel table {
        width: 100% !important;
        background: transparent !important;
        border: 0 !important;
        border-collapse: separate !important;
        border-spacing: 0 !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel tr[bgcolor],
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel td[bgcolor] {
        background: transparent !important;
        background-color: transparent !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel td {
        padding: 8px 10px !important;
        background: rgba(255,255,255,.018) !important;
        border-top: 1px solid rgba(255,255,255,.045) !important;
        border-bottom: 1px solid rgba(255,255,255,.045) !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel td:first-child {
        border-left: 1px solid rgba(255,255,255,.045) !important;
        border-radius: 7px 0 0 7px !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel td:last-child {
        border-right: 1px solid rgba(255,255,255,.045) !important;
        border-radius: 0 7px 7px 0 !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel tr:hover td {
        background: rgba(255,255,255,.038) !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel a.linknostyle,
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel a.linknostyle[style] {
        color: #dce2e8 !important;
        font-weight: 600 !important;
        text-decoration: none !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel a.linknostyle:hover {
        color: #ffffff !important;
      }

      /* Empty Files tables currently render as a 1px bordered artifact. Replace
         that with a quiet empty-state label instead. */
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-files-panel > .panel-body:has(table:not(:has(td,th))) {
        display: flex !important;
        align-items: center !important;
        min-height: 46px !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-files-panel > .panel-body:has(table:not(:has(td,th))) table {
        display: none !important;
      }
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-files-panel > .panel-body:has(table:not(:has(td,th)))::after {
        content: "No files attached";
        color: #8f959d;
        font-size: 11px;
        font-weight: 500;
      }
'''

text = text.replace(anchor, polish + '\n' + anchor, 1)
path.write_text(text, encoding='utf-8', newline='\n')
(TM / 'US-Sign-Design-Job-Tools-v4.1.7.user.js').write_text(text, encoding='utf-8', newline='\n')
