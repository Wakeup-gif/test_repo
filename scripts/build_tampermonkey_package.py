from pathlib import Path
import json, re, shutil, hashlib, zipfile

ROOT = Path(__file__).resolve().parents[1]
TM = ROOT / 'tampermonkey'
OUT = ROOT / 'packages'
PKG_NAME = 'US-Sign-Tampermonkey-Package-2026-08-14'
STAGE = ROOT / '.package-build' / PKG_NAME
ZIP = OUT / f'{PKG_NAME}.zip'

CURRENT = [
    'US-Sign-Full-UI-Theme.user.js',
    'US-Sign-Design-Job-Tools.user.js',
    'US-Sign-UI-Runtime-Fixes.user.js',
    'US-Sign-Description-File-Path-Tools.user.js',
    'US-Sign-Menu-Cleanup.user.js',
    'US-Sign-Project-Scope-Workspace.user.js',
    'US-Sign-Scope-File-Tools.user.js',
    'US-Sign-Sticky-Project-Rail-Installer.user.js',
]
OTHER = [
    'Adobe-Acrobat-US-Sign-Colors.user.js',
    'ChatGPT-US-Sign-Glass-Theme.user.js',
]

if STAGE.exists(): shutil.rmtree(STAGE)
STAGE.mkdir(parents=True)
OUT.mkdir(parents=True, exist_ok=True)

for name in CURRENT:
    src = TM / name
    if src.exists():
        dst = STAGE / 'CURRENT' / 'SquareCoil' / name
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

for name in OTHER:
    src = TM / name
    if src.exists():
        dst = STAGE / 'CURRENT' / 'Other-Sites' / name
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

# Assets referenced by the theme plus prior cursor iterations.
if (TM / 'assets').exists():
    shutil.copytree(TM / 'assets', STAGE / 'CURRENT' / 'assets', dirs_exist_ok=True)

# Archive every non-canonical userscript and the design/module source history.
current_set = set(CURRENT + OTHER)
for src in TM.glob('*.user.js'):
    if src.name not in current_set:
        dst = STAGE / 'ARCHIVE' / 'userscripts' / src.name
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
for folder in ['design-v4.1', 'modules']:
    if (TM / folder).exists():
        shutil.copytree(TM / folder, STAGE / 'ARCHIVE' / folder, dirs_exist_ok=True)

# Restore points and development tooling used during the iterative rebuild.
if (ROOT / 'restore-points').exists():
    shutil.copytree(ROOT / 'restore-points', STAGE / 'RESTORE-POINTS', dirs_exist_ok=True)
if (ROOT / 'scripts').exists():
    dev = STAGE / 'DEVELOPMENT' / 'scripts'
    dev.mkdir(parents=True, exist_ok=True)
    for src in (ROOT / 'scripts').iterdir():
        if src.is_file() and src.name != Path(__file__).name:
            shutil.copy2(src, dev / src.name)
if (ROOT / '.github' / 'workflows').exists():
    shutil.copytree(ROOT / '.github' / 'workflows', STAGE / 'DEVELOPMENT' / 'workflows', dirs_exist_ok=True)

# Build install/version manifest from actual current files.
def meta(path):
    text = path.read_text(encoding='utf-8', errors='replace')
    def get(key):
        m = re.search(rf'^//\s*@{re.escape(key)}\s+(.+)$', text, re.M)
        return m.group(1).strip() if m else ''
    return {'file': path.name, 'name': get('name'), 'version': get('version'), 'match': get('match')}

manifest = {'package': PKG_NAME, 'generated_from': 'Wakeup-gif/test_repo main', 'current': []}
for name in CURRENT:
    p = TM / name
    if p.exists():
        row = meta(p)
        row['raw_install'] = f'https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/{name}'
        manifest['current'].append(row)
for name in OTHER:
    p = TM / name
    if p.exists():
        row = meta(p)
        row['raw_install'] = f'https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/{name}'
        manifest['current'].append(row)

DOCS = STAGE / 'DOCS'
DOCS.mkdir(parents=True, exist_ok=True)
(DOCS / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')

install_lines = ['# Current raw install links', '']
for row in manifest['current']:
    install_lines += [f"## {row['name'] or row['file']} v{row['version'] or '?'}", row['raw_install'], '']
(DOCS / 'INSTALL-LINKS.md').write_text('\n'.join(install_lines), encoding='utf-8')

README = '''# US Sign Tampermonkey Package

This package captures the current working userscripts plus the historical source and tooling used to build them.

## Folder map

- `CURRENT/SquareCoil/` — canonical scripts to install for SquareCoil.
- `CURRENT/Other-Sites/` — Acrobat and ChatGPT visual scripts.
- `CURRENT/assets/` — cursor assets referenced by the Full UI Theme and prior cursor iterations.
- `ARCHIVE/` — old, experimental, versioned, and modular source. Do not install these over CURRENT unless intentionally restoring/testing.
- `RESTORE-POINTS/` — rollback notes preserved from the redesign process.
- `DEVELOPMENT/` — optimization, patch, and GitHub Actions tooling used while iterating.
- `DOCS/` — install links, ownership rules, AI handoff prompt, manifest, and change summary.

## Recommended SquareCoil stack

Install the CURRENT SquareCoil scripts as separate full userscripts. Do not replace them with loader wrappers or `@require` shells.

1. US Sign Full UI Theme
2. US Sign UI Runtime Fixes
3. US Sign Menu Cleanup and Reorder
4. US Sign Project and Scope Workspace
5. US Sign Scope File Tools
6. US Sign Description File Path Tools
7. US Sign Design Job Tools
8. US Sign Sticky Project Rail

The scripts intentionally have separate ownership boundaries. The theme owns global paint/typography. Runtime owns logo/CKEditor compatibility. Design owns Design DOM/layout. Scope owns Scope DOM/layout. Description owns Description path extraction. Menu owns project navigation order. Sticky owns rail positioning. Scope File Tools owns Scope path actions.

## Important performance rule

Avoid broad permanent MutationObservers, body-wide color crawlers, frequent polling, nested backdrop filters on scrolling cards, and repeated full-table scans. Prefer bounded discovery, scoped observers, signature checks, and CSS-only paint where possible.

## Current wallpaper note

The current Full UI Theme still contains a static Bing wallpaper URL. Daily Bing/Spotlight cycling was requested as the next enhancement but is not represented here as a completed production feature.
'''
(DOCS / 'README.md').write_text(README, encoding='utf-8')

OWNERSHIP = '''# Script ownership and conflict rules

## Full UI Theme
Owns global colors, typography, glass treatment, wallpaper, page-specific paint fixes, and cursor styling. Do not use it to move Design/Scope DOM structure.

## UI Runtime Fixes
Owns cached logo handling and CKEditor iframe compatibility. This is where iframe-only visual issues must be fixed because parent-page CSS cannot reach CKEditor iframe content.

## Design Job Tools
Owns Design workspace restructuring, overview/summary/actionbar, Design/Files/Description placement, Design data refresh, and bounded Design discovery.

## Project and Scope Workspace
Owns Scope page restructuring and Scope editor shell. Keep its grid/layout logic isolated from the global theme.

## Description File Path Tools
Owns Description path extraction and toolbar generation. Observe only actual Description content, not the whole page.

## Scope File Tools
Owns Scope path/open-file actions such as OneCommander integration.

## Menu Cleanup
Owns main/project navigation ordering and hidden menu entries. Avoid permanent observers.

## Sticky Project Rail
Owns sticky project rail behavior only.

## Rule for visual fixes
Before adding a new override, identify which script paints or creates the element. Fix the owner first. Example: the yellow Description highlight was inside CKEditor and therefore belonged to UI Runtime Fixes, not Full UI Theme.
'''
(DOCS / 'SCRIPT-OWNERSHIP.md').write_text(OWNERSHIP, encoding='utf-8')

AI = '''# AI HANDOFF PROMPT — TAMpermonkey / SquareCoil Maintenance

You are maintaining Cristian's Tampermonkey stack for the private US Sign & Mill SquareCoil site and related helper sites. Treat the CURRENT scripts in this package as the production baseline.

## Non-negotiable delivery rules

1. Update the existing canonical script whenever a feature belongs to an existing owner. Do not create a new script merely to avoid editing the correct one.
2. Keep each permanent `@name` stable. Increment `@version` for published updates.
3. Deliver self-contained full `.user.js` source. Never replace a working full script with a tiny `@require` loader or blank wrapper.
4. Preserve canonical raw GitHub URLs and return a direct raw `.user.js` install link after publishing.
5. Label deliveries as UPDATE, NEW INSTALL, or REPLACES when useful.
6. Verify the canonical file header/version after every write before claiming the update is live.
7. When a change can break layout, create or preserve a restore point first.
8. Do not promise a file is published until the canonical repository file actually reflects it.

## Architecture / ownership

- Full UI Theme: global paint, wallpaper, typography, glass, cursor, page-specific visual corrections.
- UI Runtime Fixes: logo + CKEditor iframe compatibility. Iframe styling must be fixed inside the iframe owner.
- Design Job Tools: Design workspace DOM/layout/data lifecycle.
- Project and Scope Workspace: Scope DOM/layout/editor shell.
- Description File Path Tools: Description path extraction/toolbar.
- Scope File Tools: Scope path / OneCommander actions.
- Menu Cleanup: navigation visibility/order.
- Sticky Project Rail: sticky project rail only.

Never solve a problem in the wrong layer merely because a selector can override it.

## Performance doctrine

Cristian is highly sensitive to stutter. Before adding runtime behavior, inspect the current script for existing observers/polling and remove duplication.

Prefer:
- bounded startup discovery
- one narrow observer on the actual data root when truly required
- signature comparisons before DOM writes
- event-driven refresh on navigation/pageshow
- CSS paint-only changes for visuals
- blur on limited top-level surfaces, not nested long scrolling panels

Avoid:
- body-wide permanent MutationObservers
- `querySelectorAll('*')` crawlers
- recurring `setInterval` discovery
- endless retry loops
- deep clone parsing for simple text extraction
- multiple scripts owning the same layout or paint behavior
- nested `backdrop-filter` on large scrolling cards

## Debugging workflow

1. Reproduce from the user's screenshot/description.
2. Identify the exact page and element owner.
3. Inspect the canonical CURRENT source before editing.
4. Search for competing selectors, inline styles, iframe boundaries, duplicate observers, and later cascade overrides.
5. Make the smallest owner-correct change.
6. Keep geometry untouched when the request is visual-only.
7. Run syntax validation (`node --check` for userscripts) and `git diff --check`.
8. Publish to the canonical path.
9. Fetch the canonical file again and verify `@name`, `@version`, and the changed block.
10. Return the raw GitHub `.user.js` link and concise change summary.

## GitHub publishing workflow

Repository: `Wakeup-gif/test_repo`
Canonical folder: `tampermonkey/`
Raw base: `https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/`

For a small script, fetch the current file and SHA, edit the complete file, then update the same path. Never write the same path concurrently.

For a very large userscript when direct replacement is unreliable, a temporary GitHub Actions patch workflow is acceptable:
- create a deterministic patch script
- patch only the intended canonical userscript
- validate syntax/diff
- commit/push the resulting canonical file
- verify the canonical version
- delete temporary workflow/patch files after success

Do not leave a wrapper as the canonical userscript.

## Visual design target

SquareCoil should read as restrained ChatGPT/macOS-inspired glass:
- wallpaper visible through primary surfaces
- blue-black / graphite glass, not flat gray
- subtle hairline edges and controlled blur
- modern sans serif for operational UI
- Roxborough CF used sparingly for project identity/display typography when installed locally
- desaturated coral warning/red text
- no yellow highlight chips in Description rich text
- icons must retain their native icon font; do not force the UI font onto icon descendants

## Known lessons from prior regressions

- A broad transparent-wrapper rule broke SquareCoil geometry/appearance. Paint wrappers carefully.
- Large/nested backdrop filters caused sluggish scrolling. Blur top-level surfaces only.
- Forcing Manrope onto `#sidebar_left *` broke icon fonts and produced square glyphs.
- The yellow Description highlight survived parent CSS because it was painted inside CKEditor; fixing Runtime iframe CSS solved it.
- Infinite Design discovery/rebuild loops caused sustained scanning. Use bounded discovery and scoped data observers.
- The duplicate empty Design Tampermonkey entry was not the performance cause; do not blame unrelated empty entries.

## User interaction style

Cristian wants direct implementation, concise status, and the actual full install link. Do not make him manually paste patches when you can update the canonical script. Avoid speculative fixes piled on top of other speculative fixes. Trace the source first.
'''
(DOCS / 'AI-HANDOFF-PROMPT.md').write_text(AI, encoding='utf-8')

CHANGELOG = '''# Build summary

Major work captured in this package includes:
- SquareCoil menu cleanup/reordering and compact project rail behavior.
- Design workspace restructuring and later performance re-optimization.
- Scope workspace restructuring and glass polish.
- Description file-path extraction and OneCommander-related path helpers.
- Global SquareCoil glass theme, wallpaper, typography, page-specific Search/Tasks/Dashboard styling, and custom cursor iterations.
- UI Runtime simplification plus CKEditor iframe styling/highlight repair.
- Sticky project rail behavior.
- Adobe Acrobat color/theme work and comment-area visual compatibility.
- ChatGPT glass-theme userscript.
- Restore points, optimization scripts, temporary patch workflows, modular experiments, and older userscript revisions retained under ARCHIVE/DEVELOPMENT.
'''
(DOCS / 'CHANGELOG-SUMMARY.md').write_text(CHANGELOG, encoding='utf-8')

# Checksums for packaged current scripts.
checks = []
for p in sorted((STAGE / 'CURRENT').rglob('*')):
    if p.is_file():
        checks.append(f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.relative_to(STAGE).as_posix()}")
(DOCS / 'SHA256SUMS.txt').write_text('\n'.join(checks) + '\n', encoding='utf-8')

# Zip with one top-level package folder.
if ZIP.exists(): ZIP.unlink()
with zipfile.ZipFile(ZIP, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in sorted(STAGE.rglob('*')):
        if p.is_file():
            arc = Path(PKG_NAME) / p.relative_to(STAGE)
            z.write(p, arc.as_posix())

sha = hashlib.sha256(ZIP.read_bytes()).hexdigest()
(OUT / f'{PKG_NAME}.sha256').write_text(f'{sha}  {ZIP.name}\n', encoding='utf-8')
print(ZIP)
