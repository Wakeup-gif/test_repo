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
# Full UI Theme 2.2.1 — authoritative outer-surface blur registry.
# ---------------------------------------------------------------------------
name = 'US-Sign-Full-UI-Theme.user.js'
text = read(name)
text = replace_once(text, '// @version      2.2.0', '// @version      2.2.1', 'Full UI version')
text = replace_once(
    text,
    '// @description  Canonical SquareCoil Dark Glass UI: graphite neutral surfaces, cohesive frost across primary panels, shared Bing wallpaper, semantic project states, refined sidebar, and geometric cursor.',
    '// @description  Canonical SquareCoil Dark Glass UI with audited 14px outer-surface frost, graphite neutral surfaces, shared Bing wallpaper, semantic project states, refined sidebar, and geometric cursor.',
    'Full UI description'
)

blur_css = r'''

    /* =========================================================
       v2.2.1 FULL DARK-GLASS BLUR ROOT AUDIT
       One compositor root per visible outer surface. This final registry is
       intentionally last in the theme cascade so older page-specific rules
       cannot leave a primary card at 4/6/7/11/16px or accidentally at none.
       Nested content remains blur-free to avoid double-frost and GPU churn.
    ========================================================= */

    html.us-sign-theme-dark-glass {
      --us-dark-glass-blur: 14px;
      --us-dark-glass-saturation: 108%;
      --us-dark-glass-brightness: 0.90;
    }

    /* Nested content inherits the already-frosted outer card. */
    html.us-sign-theme-dark-glass body :is(
      #customer-name,
      #customer-info,
      #showbtns,
      #mapcontainer,
      #filesbox,
      #descriptionbox,
      #projectbox,
      #designbox,
      #us-sign-design-actionbar,
      #us-sign-job-overview,
      #us-sign-design-summary,
      #us-sign-design-bottom-grid > .us-sign-description-panel,
      #us-sign-design-right-stack > .us-sign-designs-panel,
      #us-sign-design-right-stack > .us-sign-files-panel,
      #widget-tasks,
      #widget-designs,
      #widget-estimates,
      #page-content .panel-body.bg-light,
      .tray-center > .pl15.pr15 > .well:has(.important-notes),
      .tray-center > .pl15.pr15 > .well:has(#ps-select),
      .tab-block > .tabs-left,
      .tab-block > .tab-content,
      .modal-content,
      .popover,
      .dropdown-menu,
      #time-remaining-popup-modal,
      #remaining-time-in-popup,
      #show-materials-used-warning-modal
    ) :is(
      .panel-heading,
      .panel-body,
      .panel-footer,
      .panel-menu,
      .modal-header,
      .modal-body,
      .modal-footer,
      .popover-content,
      .us-sign-overview-title,
      .us-sign-overview-field,
      .us-sign-djt-summary-cell,
      .cke,
      .cke_chrome,
      .cke_inner,
      .cke_top,
      .cke_contents,
      .cke_bottom,
      input,
      textarea,
      select,
      button,
      a.btn,
      table,
      .table
    ) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    /* Containers are layout only; their direct child cards own the frost. */
    html.us-sign-theme-dark-glass body :is(
      #us-sign-design-bottom-grid,
      #us-sign-design-right-stack,
      .us-sign-design-workbench,
      .us-sign-design-workspace-column
    ) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    /* Authoritative primary/floating surface registry. Keep this rule after
       the nested neutralizers above so a moved .panel inside a .well still
       receives the same 14px frost as every other primary card. */
    html.us-sign-theme-dark-glass body header.navbar,
    html.us-sign-theme-dark-glass body #sidebar_left,
    html.us-sign-theme-dark-glass body #pmlt,
    html.us-sign-theme-dark-glass body #customer-name,
    html.us-sign-theme-dark-glass body #customer-info,
    html.us-sign-theme-dark-glass body #showbtns,
    html.us-sign-theme-dark-glass body #mapcontainer,
    html.us-sign-theme-dark-glass body #filesbox,
    html.us-sign-theme-dark-glass body #descriptionbox,
    html.us-sign-theme-dark-glass body #projectbox,
    html.us-sign-theme-dark-glass body #designbox,
    html.us-sign-theme-dark-glass body #us-sign-design-actionbar,
    html.us-sign-theme-dark-glass body #us-sign-job-overview,
    html.us-sign-theme-dark-glass body #us-sign-design-summary,
    html.us-sign-theme-dark-glass body #us-sign-design-bottom-grid > .us-sign-description-panel,
    html.us-sign-theme-dark-glass body #us-sign-design-right-stack > .us-sign-designs-panel,
    html.us-sign-theme-dark-glass body #us-sign-design-right-stack > .us-sign-files-panel,
    html.us-sign-theme-dark-glass body #widget-tasks,
    html.us-sign-theme-dark-glass body #widget-designs,
    html.us-sign-theme-dark-glass body #widget-estimates,
    html.us-sign-theme-dark-glass body #page-content .panel-body.bg-light,
    html.us-sign-theme-dark-glass body .tray-center > .pl15.pr15 > .well:has(.important-notes),
    html.us-sign-theme-dark-glass body .tray-center > .pl15.pr15 > .well:has(#ps-select),
    html.us-sign-theme-dark-glass body .tab-block > .tabs-left,
    html.us-sign-theme-dark-glass body .tab-block > .tab-content,
    html.us-sign-theme-dark-glass body .modal-content,
    html.us-sign-theme-dark-glass body .popover,
    html.us-sign-theme-dark-glass body .dropdown-menu,
    html.us-sign-theme-dark-glass body #time-remaining-popup-modal,
    html.us-sign-theme-dark-glass body #remaining-time-in-popup,
    html.us-sign-theme-dark-glass body #show-materials-used-warning-modal,
    html.us-sign-theme-dark-glass.us-sign-search-page body #push-down .alert.alert-success,
    html.us-sign-theme-dark-glass.us-sign-semantic-project-ux body .alert[data-us-state="pending"],
    html.us-sign-theme-dark-glass body .tray-center > .pl15.pr15 > .alert.alert-micro {
      -webkit-backdrop-filter:
        blur(var(--us-dark-glass-blur))
        saturate(var(--us-dark-glass-saturation))
        brightness(var(--us-dark-glass-brightness)) !important;
      backdrop-filter:
        blur(var(--us-dark-glass-blur))
        saturate(var(--us-dark-glass-saturation))
        brightness(var(--us-dark-glass-brightness)) !important;
    }

    /* Clock Out is intentionally the one architectural exception: its full
       viewport overlay owns the Gaussian blur so the dialog itself does not
       create a nested backdrop root and turn into an opaque slab. */
    html.us-sign-theme-dark-glass body #modal-overlay.duplicate-modal-2 > .duplicate-modal-content-2 {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }
'''

anchor = '\n\n  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'
if anchor not in text:
    raise RuntimeError('Full UI CSS closing anchor not found')
text = text.replace(anchor, blur_css + anchor, 1)
write(name, text)

# ---------------------------------------------------------------------------
# Design Job Tools 4.1.6 — the late-injected bridge previously disabled blur
# on the actual moved Description / Designs / Files panel roots.
# ---------------------------------------------------------------------------
name = 'US-Sign-Design-Job-Tools.user.js'
text = read(name)
text = replace_once(text, '// @version      4.1.5', '// @version      4.1.6', 'Design version')
text = replace_once(text, 'const VERSION = "4.1.5";', 'const VERSION = "4.1.6";', 'Design VERSION const')

paint_block = '''      html.us-sign-theme-dark-glass body #${IDS.actionbar},
      html.us-sign-theme-dark-glass body #${IDS.overview},
      html.us-sign-theme-dark-glass body #${IDS.summary},
      html.us-sign-theme-dark-glass body #${IDS.bottomGrid},
      html.us-sign-theme-dark-glass body #${IDS.rightStack},
      html.us-sign-theme-dark-glass body .us-sign-designs-panel,
      html.us-sign-theme-dark-glass body .us-sign-files-panel,
      html.us-sign-theme-dark-glass body .us-sign-description-panel {
        background-color: rgba(11, 11, 14, 0.62) !important;
        background-image: linear-gradient(180deg, rgba(255,255,255,0.022), rgba(255,255,255,0.004)) !important;
        border-color: rgba(255, 255, 255, 0.075) !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important;
      }
'''

paint_replacement = paint_block + '''
      /* v4.1.6: the visible Design modules are outer glass roots. The older
         bridge only painted them, then disabled blur on the moved .panel
         descendants; that overrode the Full UI theme because this style is
         injected later at document-idle. */
      html.us-sign-theme-dark-glass body #${IDS.actionbar},
      html.us-sign-theme-dark-glass body #${IDS.overview},
      html.us-sign-theme-dark-glass body #${IDS.summary},
      html.us-sign-theme-dark-glass body #${IDS.bottomGrid} > .us-sign-description-panel,
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel,
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-files-panel {
        -webkit-backdrop-filter: blur(var(--us-dark-glass-blur, 14px)) saturate(var(--us-dark-glass-saturation, 108%)) brightness(var(--us-dark-glass-brightness, .90)) !important;
        backdrop-filter: blur(var(--us-dark-glass-blur, 14px)) saturate(var(--us-dark-glass-saturation, 108%)) brightness(var(--us-dark-glass-brightness, .90)) !important;
      }
'''
text = replace_once(text, paint_block, paint_replacement, 'Design dark paint block')

old_none = '''      html.us-sign-theme-dark-glass body #${IDS.bottomGrid} :is(.panel,.well),
      html.us-sign-theme-dark-glass body #${IDS.rightStack} :is(.panel,.well) {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
'''
new_none = '''      /* Layout containers and inner controls stay blur-free. Direct child
         Description / Designs / Files panels are excluded because they are
         primary roots and receive the 14px rule above. */
      html.us-sign-theme-dark-glass body #${IDS.bottomGrid},
      html.us-sign-theme-dark-glass body #${IDS.rightStack},
      html.us-sign-theme-dark-glass body #${IDS.actionbar} :is(a,button,.btn,.us-sign-native-action),
      html.us-sign-theme-dark-glass body #${IDS.overview} :is(.us-sign-overview-title,.us-sign-overview-field),
      html.us-sign-theme-dark-glass body #${IDS.summary} > .us-sign-djt-summary-cell,
      html.us-sign-theme-dark-glass body #${IDS.bottomGrid} > .us-sign-description-panel :is(.panel-heading,.panel-body,.panel-footer,.panel-menu),
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-designs-panel :is(.panel-heading,.panel-body,.panel-footer,.panel-menu),
      html.us-sign-theme-dark-glass body #${IDS.rightStack} > .us-sign-files-panel :is(.panel-heading,.panel-body,.panel-footer,.panel-menu) {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
'''
text = replace_once(text, old_none, new_none, 'Design broad none rule')
write(name, text)

# ---------------------------------------------------------------------------
# Project + Scope Workspace 1.2.6 — standardize live/fallback Scope root too.
# ---------------------------------------------------------------------------
name = 'US-Sign-Project-Scope-Workspace.user.js'
text = read(name)
text = replace_once(text, '// @version      1.2.5', '// @version      1.2.6', 'Scope workspace version')
text = text.replace('/* v1.2.5: Dark Glass bridge. Scoped so the preserved Glass theme is untouched. */',
                    '/* v1.2.6: Dark Glass bridge. All outer Scope roots share the canonical 14px frost; preserved Glass archive remains untouched. */', 1)
old_selector = '''    html.us-sign-theme-dark-glass body:has(#pmlt) #customer-info,
    html.us-sign-theme-dark-glass body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well:has(.important-notes),
    html.us-sign-theme-dark-glass body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well.us-sign-scope-enhanced {
'''
new_selector = '''    html.us-sign-theme-dark-glass body:has(#pmlt) #customer-info,
    html.us-sign-theme-dark-glass body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well:has(.important-notes),
    html.us-sign-theme-dark-glass body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well:has(#ps-select) {
'''
text = replace_once(text, old_selector, new_selector, 'Scope dark outer selector')
write(name, text)

# ---------------------------------------------------------------------------
# Description path tools 2.3.2 — nested toolbar should reveal parent frost,
# not look like an opaque unblurred slab. It intentionally does not add a
# second backdrop filter.
# ---------------------------------------------------------------------------
name = 'US-Sign-Description-File-Path-Tools.user.js'
text = read(name)
text = replace_once(text, '// @version      2.3.1', '// @version      2.3.2', 'Description path version')
text = replace_once(text, 'window.__usSignDescriptionPathToolsV231', 'window.__usSignDescriptionPathToolsV232', 'Description path guard')
text = replace_once(
    text,
    ':host-context(html.us-sign-theme-dark-glass) .toolbar { background:rgba(12,12,15,.90); border-color:rgba(255,255,255,.075); }',
    ':host-context(html.us-sign-theme-dark-glass) .toolbar { background:rgba(12,12,15,.38); border-color:rgba(255,255,255,.075); box-shadow:inset 0 1px 0 rgba(255,255,255,.018); -webkit-backdrop-filter:none; backdrop-filter:none; }',
    'Description dark toolbar'
)
write(name, text)

# ---------------------------------------------------------------------------
# Scope file tools 2.6.2 — same nested-surface principle as Description tools.
# ---------------------------------------------------------------------------
name = 'US-Sign-Scope-of-Work-File-Tools.user.js'
text = read(name)
text = replace_once(text, '// @version      2.6.1', '// @version      2.6.2', 'Scope file tools version')
text = replace_once(text, 'window.__usSignScopeFileToolsV261', 'window.__usSignScopeFileToolsV262', 'Scope file tools guard')
old_host = '''    html.us-sign-theme-dark-glass body #${HOST_ID} {
      color:#d0d0d4;
      background:rgba(11,11,14,.46);
      border-color:rgba(255,255,255,.070);
    }
'''
new_host = '''    html.us-sign-theme-dark-glass body #${HOST_ID} {
      color:#d0d0d4;
      background:rgba(11,11,14,.32);
      border-color:rgba(255,255,255,.070);
      box-shadow:inset 0 1px 0 rgba(255,255,255,.018);
      -webkit-backdrop-filter:none;
      backdrop-filter:none;
    }
'''
text = replace_once(text, old_host, new_host, 'Scope file dark host')
write(name, text)

# ---------------------------------------------------------------------------
# UI Runtime Fixes 3.1.5 — do not repaint the CKEditor iframe as an opaque
# charcoal panel after Scope Workspace intentionally made it transparent.
# ---------------------------------------------------------------------------
name = 'US-Sign-UI-Runtime-Fixes.user.js'
text = read(name)
text = replace_once(text, '// @version      3.1.4', '// @version      3.1.5', 'Runtime version')
text = replace_once(text, 'window.__usSignUiRuntimeV314', 'window.__usSignUiRuntimeV315', 'Runtime guard')
text = replace_once(text, 'const VERSION = "3.1.4";', 'const VERSION = "3.1.5";', 'Runtime VERSION const')
text = replace_once(
    text,
    '        html, body { background:#0d0d0f !important; color:#d4d4d7 !important; }',
    '        html, body { background:transparent !important; background-color:transparent !important; color:#d4d4d7 !important; }',
    'Runtime CKEditor dark background'
)
write(name, text)

# Fresh-name installers, useful when Tampermonkey refuses to show Update.
for src_name, fresh_name in [
    ('US-Sign-Full-UI-Theme.user.js', 'US-Sign-Full-UI-Theme-v2.2.1.user.js'),
    ('US-Sign-Design-Job-Tools.user.js', 'US-Sign-Design-Job-Tools-v4.1.6.user.js'),
    ('US-Sign-Project-Scope-Workspace.user.js', 'US-Sign-Project-Scope-Workspace-v1.2.6.user.js'),
    ('US-Sign-Description-File-Path-Tools.user.js', 'US-Sign-Description-File-Path-Tools-v2.3.2.user.js'),
    ('US-Sign-Scope-of-Work-File-Tools.user.js', 'US-Sign-Scope-of-Work-File-Tools-v2.6.2.user.js'),
    ('US-Sign-UI-Runtime-Fixes.user.js', 'US-Sign-UI-Runtime-Fixes-v3.1.5.user.js'),
]:
    write(fresh_name, read(src_name))

print('Patched Dark Glass blur audit: Full UI 2.2.1, Design 4.1.6, Scope 1.2.6, Description 2.3.2, Scope Files 2.6.2, Runtime 3.1.5')
