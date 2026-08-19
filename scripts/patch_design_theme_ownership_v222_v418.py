from pathlib import Path
import re

ROOT = Path('.')
TM = ROOT / 'tampermonkey'


def read(name):
    return (TM / name).read_text(encoding='utf-8')


def write(name, text):
    (TM / name).write_text(text, encoding='utf-8', newline='\n')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly 1 match, found {count}')
    return text.replace(old, new, 1)


# ---------------------------------------------------------------------------
# Read current Design bridge before removing it. The goal of this release is
# to preserve the current look while moving visual ownership into Full UI.
# ---------------------------------------------------------------------------
design_name = 'US-Sign-Design-Job-Tools.user.js'
design = read(design_name)

bridge_match = re.search(
    r'  function installDarkGlassThemeBridge\(\) \{.*?themeStyle\.textContent = `(?P<css>.*?)`;\n\s*\(document\.head \|\| document\.documentElement\)\.appendChild\(themeStyle\);\n  \}\n\n  installDarkGlassThemeBridge\(\);',
    design,
    flags=re.S,
)
if not bridge_match:
    raise RuntimeError('Could not locate Design Dark Glass bridge')

bridge_css = bridge_match.group('css')
placeholder_map = {
    '${IDS.actionbar}': 'us-sign-design-actionbar',
    '${IDS.copyTools}': 'us-sign-job-copy-tools',
    '${IDS.nativeActions}': 'us-sign-native-action-group',
    '${IDS.overview}': 'us-sign-job-overview',
    '${IDS.summary}': 'us-sign-design-summary',
    '${IDS.bottomGrid}': 'us-sign-design-bottom-grid',
    '${IDS.rightStack}': 'us-sign-design-right-stack',
    '${IDS.lookup}': 'us-sign-job-lookup-button',
}
for token, value in placeholder_map.items():
    bridge_css = bridge_css.replace(token, value)
if '${IDS.' in bridge_css:
    raise RuntimeError('Unresolved IDS placeholder remained in migrated CSS')

# ---------------------------------------------------------------------------
# Full UI Theme 2.2.2 — becomes the single owner of Design-page paint.
# ---------------------------------------------------------------------------
theme_name = 'US-Sign-Full-UI-Theme.user.js'
theme = read(theme_name)
theme = replace_once(theme, '// @version      2.2.1', '// @version      2.2.2', 'Theme version')
theme = replace_once(
    theme,
    '// @description  Canonical SquareCoil Dark Glass UI with audited 14px outer-surface frost, graphite neutral surfaces, shared Bing wallpaper, semantic project states, refined sidebar, and geometric cursor.',
    '// @description  Canonical SquareCoil Dark Glass UI with centralized Design-page paint ownership, audited 14px frost, graphite neutral surfaces, shared Bing wallpaper, semantic states, refined spacing, and geometric cursor.',
    'Theme description',
)

refine_css = r'''

    /* =========================================================
       v2.2.2 DESIGN PAGE PAINT OWNERSHIP + SCREENSHOT POLISH
       Full UI is now the only owner of Design-page color, frost, borders,
       button hierarchy, and panel hierarchy. Design Job Tools owns DOM,
       geometry, data, and interactions only.
    ========================================================= */

    html.us-sign-theme-dark-glass.us-sign-design-page {
      --us-design-panel-bg: rgba(11, 11, 14, 0.58);
      --us-design-panel-bg-strong: rgba(11, 11, 14, 0.64);
      --us-design-subtle: rgba(255, 255, 255, 0.020);
      --us-design-subtle-hover: rgba(255, 255, 255, 0.052);
      --us-design-line: rgba(255, 255, 255, 0.060);
      --us-design-line-strong: rgba(255, 255, 255, 0.095);
      --us-design-gap: 14px;
    }

    /* Layout wrappers must never become extra dark plates behind the real
       glass cards. Keeping these transparent is what lets the wallpaper feed
       the 14px backdrop blur instead of blurring an opaque parent. */
    html.us-sign-theme-dark-glass.us-sign-design-page body :is(
      #us-sign-design-bottom-grid,
      #us-sign-design-right-stack,
      .us-sign-design-workbench,
      .us-sign-design-workspace-column,
      .us-sign-design-source-column
    ) {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    /* One visual recipe for every major Design card. */
    html.us-sign-theme-dark-glass.us-sign-design-page body :is(
      #us-sign-design-actionbar,
      #us-sign-job-overview,
      #us-sign-design-summary,
      #us-sign-design-bottom-grid > .us-sign-description-panel,
      #us-sign-design-right-stack > .us-sign-designs-panel,
      #us-sign-design-right-stack > .us-sign-files-panel
    ) {
      background-color: var(--us-design-panel-bg) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,.024), rgba(255,255,255,.004)) !important;
      border: 1px solid var(--us-design-line) !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 28px rgba(0,0,0,.20) !important;
      -webkit-backdrop-filter: blur(var(--us-dark-glass-blur,14px)) saturate(var(--us-dark-glass-saturation,108%)) brightness(var(--us-dark-glass-brightness,.90)) !important;
      backdrop-filter: blur(var(--us-dark-glass-blur,14px)) saturate(var(--us-dark-glass-saturation,108%)) brightness(var(--us-dark-glass-brightness,.90)) !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-bottom-grid {
      gap: var(--us-design-gap) !important;
      margin-top: var(--us-design-gap) !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-right-stack {
      gap: var(--us-design-gap) !important;
    }

    /* Action bar: slightly larger targets and clearer grouping without making
       the toolbar feel oversized. */
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-actionbar {
      min-height: 52px !important;
      padding: 9px 10px !important;
      gap: 14px !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-actionbar :is(button,a.btn,.us-sign-native-action) {
      min-height: 34px !important;
      height: 34px !important;
      padding: 0 12px !important;
      color: #e1e4e8 !important;
      background: rgba(255,255,255,.048) !important;
      background-image: none !important;
      border: 1px solid rgba(255,255,255,.09) !important;
      border-radius: 8px !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.025) !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      line-height: 1 !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-actionbar :is(button,a.btn,.us-sign-native-action):hover,
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-actionbar :is(button,a.btn,.us-sign-native-action):focus-visible {
      color: #fff !important;
      background: rgba(255,255,255,.085) !important;
      border-color: rgba(255,255,255,.15) !important;
      outline: none !important;
    }

    /* Keep destructive action semantically obvious and creation actions blue. */
    html.us-sign-theme-dark-glass.us-sign-design-page body #delete-design[data-us-action="danger"] {
      color: #ffdada !important;
      background: rgba(132,42,46,.44) !important;
      border-color: rgba(229,114,120,.36) !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body :is(
      .us-sign-designs-panel,
      .us-sign-files-panel
    ) .panel-heading :is(.btn-primary,button[data-us-action="new"],a[data-us-action="new"]) {
      color: #eef7ff !important;
      background: rgba(29,104,161,.66) !important;
      border-color: rgba(112,184,236,.34) !important;
    }

    /* Job Overview: more breathing room and clearer label/value hierarchy. */
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-job-overview .us-sign-overview-stack {
      gap: 6px !important;
      padding: 6px 7px 6px 0 !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-job-overview .us-sign-overview-row {
      gap: 6px !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-job-overview .us-sign-overview-title {
      padding: 0 13px !important;
      color: #f0f2f5 !important;
      background: rgba(255,255,255,.018) !important;
      border-right: 1px solid var(--us-design-line) !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-job-overview .us-sign-overview-field {
      min-height: 46px !important;
      padding: 7px 10px !important;
      background: rgba(255,255,255,.018) !important;
      border: 1px solid rgba(255,255,255,.046) !important;
      border-radius: 8px !important;
      box-shadow: none !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-job-overview .us-sign-overview-field:hover {
      background: var(--us-design-subtle-hover) !important;
      border-color: var(--us-design-line-strong) !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-job-overview .us-sign-overview-label,
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-summary .us-sign-djt-summary-label {
      color: #a2a7ae !important;
      font-size: 9.5px !important;
      font-weight: 650 !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-job-overview .us-sign-overview-value {
      color: #e4e7eb !important;
      font-size: 12px !important;
      font-weight: 600 !important;
    }

    /* Summary cells read as a single card with five quiet sections, not five
       competing mini-panels. */
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-summary {
      gap: 4px !important;
      padding: 5px !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-summary > .us-sign-djt-summary-cell {
      min-height: 52px !important;
      padding: 8px 10px !important;
      background: rgba(255,255,255,.014) !important;
      border: 1px solid rgba(255,255,255,.036) !important;
      border-radius: 7px !important;
    }

    /* Panel headers use one consistent 40px rhythm and no Bootstrap bevels. */
    html.us-sign-theme-dark-glass.us-sign-design-page body :is(
      #us-sign-design-bottom-grid > .us-sign-description-panel,
      #us-sign-design-right-stack > .us-sign-designs-panel,
      #us-sign-design-right-stack > .us-sign-files-panel
    ) > .panel-heading {
      min-height: 40px !important;
      height: 40px !important;
      padding: 0 13px !important;
      color: #f1f3f5 !important;
      background: rgba(255,255,255,.022) !important;
      background-image: none !important;
      border: 0 !important;
      border-bottom: 1px solid var(--us-design-line) !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }

    /* Body copy was a little cramped in the screenshot. */
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-bottom-grid > .us-sign-description-panel > .panel-body {
      width: 100% !important;
      max-width: none !important;
      padding: 14px 16px 16px !important;
      overflow: visible !important;
      color: #d8dce1 !important;
      font-size: 12px !important;
      line-height: 1.55 !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-right-stack > :is(.us-sign-designs-panel,.us-sign-files-panel) > .panel-body {
      padding: 9px 11px 11px !important;
    }

    /* Native tables/rows: kill residual Bootstrap paint and keep row hit areas
       large enough to scan/click. */
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-right-stack table,
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-right-stack :is(tbody,tr,td,th)[bgcolor] {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-right-stack table > tbody > tr > :is(td,th) {
      min-height: 38px !important;
      padding: 9px 10px !important;
      color: #d7dbe0 !important;
      border-color: rgba(255,255,255,.045) !important;
      vertical-align: middle !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-right-stack table > tbody > tr:hover > :is(td,th) {
      background: rgba(255,255,255,.035) !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-right-stack a {
      color: #b7d8f2 !important;
    }
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-right-stack a:hover {
      color: #fff !important;
    }

    /* Focus is visible without a bright default browser outline artifact. */
    html.us-sign-theme-dark-glass.us-sign-design-page body :is(button,a.btn,[role="button"]):focus-visible {
      outline: 2px solid rgba(154,205,244,.52) !important;
      outline-offset: 2px !important;
    }
'''

migrated_css = '\n\n    /* =========================================================\n       v2.2.2 MIGRATED DESIGN PAGE PAINT\n       Preserves the proven v4.1.7 Design styling while moving it out of the\n       behavior script so later Design DOM updates cannot unexpectedly win the\n       theme cascade.\n    ========================================================= */\n' + bridge_css + refine_css

anchor = '\n\n  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'
if anchor not in theme:
    raise RuntimeError('Full UI CSS closing anchor not found')
theme = theme.replace(anchor, migrated_css + anchor, 1)
write(theme_name, theme)

# ---------------------------------------------------------------------------
# Design Job Tools 4.1.8 — remove late visual CSS injection. Keep a small marker
# for diagnostics so it is obvious Full UI owns paint in future audits.
# ---------------------------------------------------------------------------
design = replace_once(design, '// @version      4.1.7', '// @version      4.1.8', 'Design version')
design = replace_once(
    design,
    '// @description  Stable Design workspace with audited Dark Glass spacing, cleaner actions, stronger contrast, native-artifact cleanup, bounded startup discovery, and one scoped data observer.',
    '// @description  Stable Design workspace focused on DOM structure, geometry, data, and interactions; Dark Glass paint is owned centrally by Full UI Theme.',
    'Design description',
)
design = replace_once(design, 'const VERSION = "4.1.7";', 'const VERSION = "4.1.8";', 'Design VERSION const')

replacement_bridge = '''  function installDarkGlassThemeBridge() {\n    if (!document.documentElement?.classList.contains("us-sign-theme-dark-glass")) return;\n    document.documentElement.dataset.usSignDesignPaintOwner = "full-ui";\n  }\n\n  installDarkGlassThemeBridge();'''
design = design[:bridge_match.start()] + replacement_bridge + design[bridge_match.end():]
write(design_name, design)

# Fresh installers for Tampermonkey fallback.
write('US-Sign-Full-UI-Theme-v2.2.2.user.js', theme)
write('US-Sign-Design-Job-Tools-v4.1.8.user.js', design)

print('patched theme 2.2.2 and design tools 4.1.8')
