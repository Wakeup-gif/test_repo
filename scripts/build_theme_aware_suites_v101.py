from pathlib import Path
import re
import json
import zipfile

TM = Path('tampermonkey')
PKG = Path('packages')
PKG.mkdir(exist_ok=True)

paths = {
    'design': TM / 'US-Sign-Design-Job-Tools.user.js',
    'scope_workspace': TM / 'US-Sign-Project-Scope-Workspace.user.js',
    'menu': TM / 'US-Sign-Menu-Cleanup.user.js',
    'description': TM / 'US-Sign-Description-File-Path-Tools.user.js',
    'scope_files': TM / 'US-Sign-Scope-of-Work-File-Tools.user.js',
    'runtime': TM / 'US-Sign-UI-Runtime-Fixes.user.js',
    'glass': TM / 'US-Sign-Glass-Theme.user.js',
    'glass_v100': TM / 'US-Sign-Glass-Theme-v1.0.0.user.js',
    'dark': TM / 'US-Sign-Dark-Glass-Theme.user.js',
}

original = {k: p.read_text(encoding='utf-8') for k, p in paths.items() if p.exists()}


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing expected anchor for {label}')
    return text.replace(old, new, 1)

# ---------------------------------------------------------------------------
# Dark Glass Theme 1.0.1: mark the root so companion scripts can switch paint
# without changing their Glass/default appearance.
# ---------------------------------------------------------------------------
dark = original['dark']
if '// @version      1.0.0' not in dark:
    raise SystemExit('Expected Dark Glass Theme v1.0.0')
dark = replace_once(dark, '// @version      1.0.0', '// @version      1.0.1', 'dark version')
dark = replace_once(
    dark,
    '  "use strict";\n',
    '''  "use strict";\n\n  const US_SIGN_THEME_ID = "dark-glass";\n  if (document.documentElement) {\n    document.documentElement.dataset.usSignTheme = US_SIGN_THEME_ID;\n    document.documentElement.classList.add("us-sign-theme-dark-glass");\n  }\n''',
    'dark theme marker'
)
paths['dark'].write_text(dark, encoding='utf-8')
(TM / 'US-Sign-Dark-Glass-Theme-v1.0.1.user.js').write_text(dark, encoding='utf-8')

# ---------------------------------------------------------------------------
# Design Job Tools 4.1.5: dark-only graphite bridge. Glass/default CSS remains
# unchanged because every new selector is scoped to html.us-sign-theme-dark-glass.
# ---------------------------------------------------------------------------
design = original['design']
if '// @version      4.1.4' not in design:
    raise SystemExit('Expected Design Job Tools v4.1.4')
design = design.replace('// @version      4.1.4', '// @version      4.1.5', 1)
bridge = r'''

  function installDarkGlassThemeBridge() {
    if (!document.documentElement?.classList.contains("us-sign-theme-dark-glass")) return;
    if (document.getElementById("us-sign-design-dark-glass-bridge")) return;
    const themeStyle = document.createElement("style");
    themeStyle.id = "us-sign-design-dark-glass-bridge";
    themeStyle.textContent = `
      html.us-sign-theme-dark-glass body #${IDS.actionbar},
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

      html.us-sign-theme-dark-glass body #${IDS.summary} .us-sign-djt-summary-cell,
      html.us-sign-theme-dark-glass body #${IDS.overview} td,
      html.us-sign-theme-dark-glass body #${IDS.overview} th {
        background-color: rgba(255, 255, 255, 0.012) !important;
        border-color: rgba(255, 255, 255, 0.055) !important;
      }

      html.us-sign-theme-dark-glass body #${IDS.lookup},
      html.us-sign-theme-dark-glass body #${IDS.actionbar} :is(a,button,.btn):not([data-us-state]),
      html.us-sign-theme-dark-glass body #${IDS.copyTools} :is(a,button,.btn):not([data-us-state]),
      html.us-sign-theme-dark-glass body #${IDS.nativeActions} :is(a,button,.btn):not([data-us-state]) {
        color: #d5d5d8 !important;
        background: rgba(255, 255, 255, 0.038) !important;
        border-color: rgba(255, 255, 255, 0.080) !important;
        box-shadow: none !important;
      }

      html.us-sign-theme-dark-glass body #${IDS.lookup}:hover,
      html.us-sign-theme-dark-glass body #${IDS.actionbar} :is(a,button,.btn):not([data-us-state]):hover,
      html.us-sign-theme-dark-glass body #${IDS.copyTools} :is(a,button,.btn):not([data-us-state]):hover,
      html.us-sign-theme-dark-glass body #${IDS.nativeActions} :is(a,button,.btn):not([data-us-state]):hover {
        color: #fff !important;
        background: rgba(255, 255, 255, 0.070) !important;
        border-color: rgba(255, 255, 255, 0.120) !important;
      }

      html.us-sign-theme-dark-glass body #${IDS.bottomGrid} :is(.panel,.well),
      html.us-sign-theme-dark-glass body #${IDS.rightStack} :is(.panel,.well) {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
    `;
    (document.head || document.documentElement).appendChild(themeStyle);
  }

  installDarkGlassThemeBridge();
'''
design = replace_once(design, '  const VERSION = "4.1.4";\n', '  const VERSION = "4.1.5";' + bridge + '\n', 'design VERSION')
paths['design'].write_text(design, encoding='utf-8')
(TM / 'US-Sign-Design-Job-Tools-v4.1.5.user.js').write_text(design, encoding='utf-8')

# ---------------------------------------------------------------------------
# Project + Scope Workspace 1.2.5: dark-only neutral overrides at the end of
# its existing style payload. Existing Glass declarations are not changed.
# ---------------------------------------------------------------------------
workspace = original['scope_workspace']
if '// @version      1.2.4' not in workspace:
    raise SystemExit('Expected Project Scope Workspace v1.2.4')
workspace = workspace.replace('// @version      1.2.4', '// @version      1.2.5', 1)
dark_scope_css = r'''

    /* v1.2.5: Dark Glass bridge. Scoped so the preserved Glass theme is untouched. */
    html.us-sign-theme-dark-glass {
      --us-ws-bg: rgba(11, 11, 14, 0.58);
      --us-ws-soft-bg: rgba(255, 255, 255, 0.020);
      --us-ws-line: rgba(255, 255, 255, 0.070);
      --us-ws-line-strong: rgba(255, 255, 255, 0.105);
      --us-ws-accent: rgba(255, 255, 255, 0.060);
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) #customer-info,
    html.us-sign-theme-dark-glass body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well:has(.important-notes),
    html.us-sign-theme-dark-glass body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well.us-sign-scope-enhanced {
      background-color: rgba(11, 11, 14, 0.66) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.004)) !important;
      border-color: rgba(255,255,255,0.072) !important;
      -webkit-backdrop-filter: blur(var(--us-dark-glass-blur, 14px)) saturate(var(--us-dark-glass-saturation, 108%)) brightness(var(--us-dark-glass-brightness, .90)) !important;
      backdrop-filter: blur(var(--us-dark-glass-blur, 14px)) saturate(var(--us-dark-glass-saturation, 108%)) brightness(var(--us-dark-glass-brightness, .90)) !important;
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) #us-sign-scope-header button.multiselect,
    html.us-sign-theme-dark-glass body:has(#pmlt) #us-sign-scope-header .multiselect-native-select > .btn-group > .btn,
    html.us-sign-theme-dark-glass body:has(#pmlt) #us-sign-scope-header #insert-btn,
    html.us-sign-theme-dark-glass body:has(#pmlt) #customer-info #showbtns .btn {
      color: #d5d5d8 !important;
      background: rgba(255,255,255,0.040) !important;
      border-color: rgba(255,255,255,0.090) !important;
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) #us-sign-scope-header .multiselect-container.dropdown-menu {
      background: rgba(12, 12, 15, 0.96) !important;
      border-color: rgba(255,255,255,0.10) !important;
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) .well.us-sign-scope-enhanced :is(.cke, .cke_chrome, .cke_inner) {
      background: rgba(10, 10, 13, 0.46) !important;
      border-color: rgba(255,255,255,0.065) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) .well.us-sign-scope-enhanced .cke_top {
      background: rgba(255,255,255,0.018) !important;
      border-bottom-color: rgba(255,255,255,0.060) !important;
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) .well.us-sign-scope-enhanced .cke_contents {
      background: rgba(8, 8, 10, 0.30) !important;
    }
'''
pattern = re.compile(r'(GM_addStyle\(String\.raw`)(.*?)(`\);)', re.S)
m = pattern.search(workspace)
if not m:
    raise SystemExit('Could not find Project Scope GM_addStyle payload')
workspace = workspace[:m.start()] + m.group(1) + m.group(2) + dark_scope_css + m.group(3) + workspace[m.end():]
paths['scope_workspace'].write_text(workspace, encoding='utf-8')
(TM / 'US-Sign-Project-Scope-Workspace-v1.2.5.user.js').write_text(workspace, encoding='utf-8')

# ---------------------------------------------------------------------------
# Description File Path Tools 2.3.1: Shadow DOM cannot be themed externally,
# so add :host-context dark-only overrides. Glass/default markup is unchanged.
# ---------------------------------------------------------------------------
description = original['description']
if '// @version      2.3.0' not in description:
    raise SystemExit('Expected Description File Path Tools v2.3.0')
description = description.replace('// @version      2.3.0', '// @version      2.3.1', 1)
description = description.replace('__usSignDescriptionPathToolsV230', '__usSignDescriptionPathToolsV231')
shadow_dark = r'''
        :host-context(html.us-sign-theme-dark-glass) { color:#eeeeef; }
        :host-context(html.us-sign-theme-dark-glass) .toolbar { background:rgba(12,12,15,.90); border-color:rgba(255,255,255,.075); }
        :host-context(html.us-sign-theme-dark-glass) .heading { color:#9c9ca3; }
        :host-context(html.us-sign-theme-dark-glass) button { color:#d1d1d5; background:rgba(255,255,255,.038); border-color:rgba(255,255,255,.085); }
        :host-context(html.us-sign-theme-dark-glass) button:hover { color:#fff; background:rgba(255,255,255,.070); border-color:rgba(255,255,255,.12); }
'''
description = replace_once(description, '      </style>\n      <section class="toolbar"', shadow_dark + '      </style>\n      <section class="toolbar"', 'description shadow style')
paths['description'].write_text(description, encoding='utf-8')
(TM / 'US-Sign-Description-File-Path-Tools-v2.3.1.user.js').write_text(description, encoding='utf-8')

# ---------------------------------------------------------------------------
# Scope-of-Work File Tools 2.6.1: dark-only neutral paint.
# ---------------------------------------------------------------------------
scope_files = original['scope_files']
if '// @version      2.6.0' not in scope_files:
    raise SystemExit('Expected Scope of Work File Tools v2.6.0')
scope_files = scope_files.replace('// @version      2.6.0', '// @version      2.6.1', 1)
scope_files = scope_files.replace('__usSignScopeFileToolsV260', '__usSignScopeFileToolsV261')
scope_dark = r'''
    html.us-sign-theme-dark-glass body #${HOST_ID} {
      color:#d0d0d4;
      background:rgba(11,11,14,.46);
      border-color:rgba(255,255,255,.070);
    }
    html.us-sign-theme-dark-glass body #${HOST_ID} .us-file-title {
      color:#eeeeef;
      border-bottom-color:rgba(255,255,255,.065);
    }
    html.us-sign-theme-dark-glass body #${HOST_ID} .us-file-label { color:#96969d; }
    html.us-sign-theme-dark-glass body #${HOST_ID} .us-path-value {
      color:#ccccd1;
      background:rgba(255,255,255,.025);
      border-color:rgba(255,255,255,.070);
    }
    html.us-sign-theme-dark-glass body #${HOST_ID} button {
      color:#d2d2d6 !important;
      background:rgba(255,255,255,.038) !important;
      border-color:rgba(255,255,255,.085) !important;
    }
    html.us-sign-theme-dark-glass body #${HOST_ID} button:hover:not(:disabled) {
      color:#fff !important;
      background:rgba(255,255,255,.070) !important;
      border-color:rgba(255,255,255,.12) !important;
    }
'''
scope_files = replace_once(scope_files, '    @media(max-width:700px){', scope_dark + '    @media(max-width:700px){', 'scope file dark CSS')
paths['scope_files'].write_text(scope_files, encoding='utf-8')
(TM / 'US-Sign-Scope-of-Work-File-Tools-v2.6.1.user.js').write_text(scope_files, encoding='utf-8')

# ---------------------------------------------------------------------------
# UI Runtime Fixes 3.1.4: preserve current editor palette for Glass/default,
# append neutral graphite iframe paint only when Dark Glass is active.
# ---------------------------------------------------------------------------
runtime = original['runtime']
if '// @version      3.1.3' not in runtime:
    raise SystemExit('Expected UI Runtime Fixes v3.1.3')
runtime = runtime.replace('// @version      3.1.3', '// @version      3.1.4', 1)
runtime = runtime.replace('__usSignUiRuntimeV313', '__usSignUiRuntimeV314')
runtime = runtime.replace('const VERSION = "3.1.3";', 'const VERSION = "3.1.4";', 1)
runtime_dark = r'''
    if (document.documentElement?.classList.contains("us-sign-theme-dark-glass")) {
      style.textContent += `
        html, body { background:#0d0d0f !important; color:#d4d4d7 !important; }
        a { color:#c6c8cc !important; }
        strong, b, h1, h2, h3, h4, h5, h6 { color:#f4f4f5 !important; }
        font[color="blue"], [style*="color: blue" i], [style*="#0000ff" i] { color:#c3c5c9 !important; }
        font[color="red"], [style*="color: red" i], [style*="#ff0000" i] { color:#dbaaaa !important; }
        font[color="green"], [style*="color: green" i], [style*="#008000" i] { color:#b6d1bb !important; }
      `;
    }
'''
runtime = replace_once(runtime, '    (editorDocument.head || editorDocument.documentElement).appendChild(style);', runtime_dark + '    (editorDocument.head || editorDocument.documentElement).appendChild(style);', 'runtime dark iframe bridge')
paths['runtime'].write_text(runtime, encoding='utf-8')
(TM / 'US-Sign-UI-Runtime-Fixes-v3.1.4.user.js').write_text(runtime, encoding='utf-8')

# Menu Cleanup is already variable-driven, so preserve it byte-for-byte.
menu = original['menu']

# ---------------------------------------------------------------------------
# Package creation.
# Glass v1.0.0 uses the exact pre-bridge companion files captured above.
# Dark Glass v1.0.1 uses the theme-aware companions generated above.
# ---------------------------------------------------------------------------
core_names = {
    'design': 'US-Sign-Design-Job-Tools.user.js',
    'scope_workspace': 'US-Sign-Project-Scope-Workspace.user.js',
    'menu': 'US-Sign-Menu-Cleanup.user.js',
    'description': 'US-Sign-Description-File-Path-Tools.user.js',
    'scope_files': 'US-Sign-Scope-of-Work-File-Tools.user.js',
    'runtime': 'US-Sign-UI-Runtime-Fixes.user.js',
}

def write_zip(path, theme_filename, theme_text, companions, suite_name, suite_version, notes):
    manifest = {
        'suite': suite_name,
        'version': suite_version,
        'theme': theme_filename,
        'companions': list(core_names.values()),
        'notes': notes,
    }
    readme = f'''{suite_name} {suite_version}\n\nInstall the theme and companion userscripts in this ZIP.\nOnly enable one US Sign visual theme at a time.\n\nIncluded:\n- {theme_filename}\n''' + ''.join(f'- {name}\n' for name in core_names.values()) + '\n' + notes + '\n'
    with zipfile.ZipFile(path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr(theme_filename, theme_text)
        for key, filename in core_names.items():
            z.writestr(filename, companions[key])
        z.writestr('manifest.json', json.dumps(manifest, indent=2))
        z.writestr('README.txt', readme)

# Exact old Glass suite snapshot.
old_companions = {k: original[k] for k in core_names}
write_zip(
    PKG / 'US-Sign-Glass-Suite-v1.0.0.zip',
    'US-Sign-Glass-Theme.user.js',
    original['glass_v100'],
    old_companions,
    'US Sign Glass Suite',
    '1.0.0',
    'Frozen pre-Dark-Glass companion set. This package preserves the established Glass UI exactly.'
)

# Current Dark suite with theme-aware companions.
new_companions = {
    'design': design,
    'scope_workspace': workspace,
    'menu': menu,
    'description': description,
    'scope_files': scope_files,
    'runtime': runtime,
}
write_zip(
    PKG / 'US-Sign-Dark-Glass-Suite-v1.0.1.zip',
    'US-Sign-Dark-Glass-Theme.user.js',
    dark,
    new_companions,
    'US Sign Dark Glass Suite',
    '1.0.1',
    'Graphite Dark Glass theme plus companion scripts with dark-only paint bridges. Glass/default behavior remains unchanged.'
)

print('Built theme-aware companions and Glass/Dark suite packages.')
