from pathlib import Path
import subprocess
import re

ROOT = Path('.')
TM = ROOT / 'tampermonkey'
ARCHIVE = TM / 'archive' / 'glass-era-final'
ARCHIVE.mkdir(parents=True, exist_ok=True)

SNAPSHOT = 'd710ac9173e0316cd4c06f6eafd19e9781d8b41b'


def git_show(path: str) -> str:
    return subprocess.check_output(
        ['git', 'show', f'{SNAPSHOT}:{path}'],
        text=True,
        encoding='utf-8'
    )


def write_archive(source_path: str, archive_name: str):
    (ARCHIVE / archive_name).write_text(git_show(source_path), encoding='utf-8')


# Preserve the exact last pre-Dark-Glass working set in one obvious folder.
archive_files = [
    ('tampermonkey/US-Sign-Glass-Theme.user.js', 'US-Sign-Glass-Theme-v1.0.0.user.js'),
    ('tampermonkey/US-Sign-Full-UI-Theme.user.js', 'US-Sign-Full-UI-Theme-v2.1.50.user.js'),
    ('tampermonkey/US-Sign-Design-Job-Tools.user.js', 'US-Sign-Design-Job-Tools-v4.1.4.user.js'),
    ('tampermonkey/US-Sign-Project-Scope-Workspace.user.js', 'US-Sign-Project-Scope-Workspace-v1.2.4.user.js'),
    ('tampermonkey/US-Sign-Menu-Cleanup.user.js', 'US-Sign-Menu-Cleanup-v3.0.1.user.js'),
    ('tampermonkey/US-Sign-Description-File-Path-Tools.user.js', 'US-Sign-Description-File-Path-Tools-v2.3.0.user.js'),
    ('tampermonkey/US-Sign-Scope-of-Work-File-Tools.user.js', 'US-Sign-Scope-of-Work-File-Tools-v2.6.0.user.js'),
    ('tampermonkey/US-Sign-UI-Runtime-Fixes.user.js', 'US-Sign-UI-Runtime-Fixes-v3.1.3.user.js'),
    ('tampermonkey/US-Sign-Sticky-Project-Rail.user.js', 'US-Sign-Sticky-Project-Rail-v2.1.0.user.js'),
]
for source, name in archive_files:
    write_archive(source, name)

(ARCHIVE / 'README.md').write_text(
    '''# Final Glass-era SquareCoil scripts\n\n'
    'This folder freezes the exact working Glass-era set immediately before the canonical Tampermonkey scripts were promoted to the graphite Dark Glass system.\n\n'
    'These files are archive/reference copies only. They intentionally keep their historical metadata and must not be used as the live Tampermonkey update endpoints.\n\n'
    '## Live update endpoints\n\n'
    'The active scripts remain at `tampermonkey/<canonical-name>.user.js`. Tampermonkey-installed scripts continue updating from those canonical raw GitHub URLs.\n''',
    encoding='utf-8'
)

# Promote the already-developed Dark Glass theme into the existing canonical
# Full UI path. This is what lets an existing Tampermonkey install update in
# place instead of requiring a second manually installed theme.
dark_path = TM / 'US-Sign-Dark-Glass-Theme.user.js'
dark = dark_path.read_text(encoding='utf-8')
replacements = [
    ('// @name         US Sign Dark Glass Theme', '// @name         US Sign Full UI Theme'),
    ('// @namespace    us-sign-dark-glass-theme', '// @namespace    us-sign-full-modules'),
    ('// @version      1.0.1', '// @version      2.2.0'),
    ('// @description  SquareCoil dark glass UI with graphite neutral surfaces, cohesive frost across primary panels, shared Bing wallpaper, semantic project states, refined sidebar, and geometric cursor.',
     '// @description  Canonical SquareCoil Dark Glass UI: graphite neutral surfaces, cohesive frost across primary panels, shared Bing wallpaper, semantic project states, refined sidebar, and geometric cursor.'),
    ('https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Dark-Glass-Theme.user.js',
     'https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Full-UI-Theme.user.js'),
]
for old, new in replacements:
    if old not in dark:
        raise SystemExit(f'Missing Full UI promotion anchor: {old}')
    dark = dark.replace(old, new)

(TM / 'US-Sign-Full-UI-Theme.user.js').write_text(dark, encoding='utf-8')

# Menu Cleanup already consumes theme variables. Bump it so existing installs
# visibly join this coordinated Dark Glass update and use neutral graphite
# fallbacks even if the main theme has not painted yet.
menu_path = TM / 'US-Sign-Menu-Cleanup.user.js'
menu = menu_path.read_text(encoding='utf-8')
if '// @version      3.0.1' not in menu:
    raise SystemExit('Expected Menu Cleanup v3.0.1')
menu = menu.replace('// @version      3.0.1', '// @version      3.0.2', 1)
menu = menu.replace('__usSignMenuCleanupV301', '__usSignMenuCleanupV302')
menu = menu.replace('var(--us-glass-strong, #171b20)', 'var(--us-glass-strong, #0b0b0e)')
menu = menu.replace('var(--us-border, #2d343c)', 'var(--us-border, rgba(255,255,255,.08))')
menu = menu.replace('var(--us-hover, #262c33)', 'var(--us-hover, #232328)')
menu = menu.replace('var(--us-bg-soft, #252d35)', 'var(--us-bg-soft, #141418)')
menu = menu.replace('var(--us-border-strong, #3a4652)', 'var(--us-border-strong, rgba(255,255,255,.12))')
menu = menu.replace('var(--us-glass, #1d2228)', 'var(--us-glass, #101013)')
menu = menu.replace('var(--us-hover, #282e35)', 'var(--us-hover, #232328)')
menu = menu.replace('var(--us-border, #353e48)', 'var(--us-border, rgba(255,255,255,.08))')
menu = menu.replace('var(--us-border-strong, #4b5662)', 'var(--us-border-strong, rgba(255,255,255,.13))')
menu_path.write_text(menu, encoding='utf-8')

# Remove the package detour and duplicate theme/current-version files created
# during the mistaken split. The canonical scripts above are the install/update
# surface; the old Glass set lives in the archive folder.
remove_paths = [
    'packages/US-Sign-Glass-Suite-v1.0.0.zip',
    'packages/US-Sign-Dark-Glass-Suite-v1.0.1.zip',
    'tampermonkey/US-Sign-Glass-Theme.user.js',
    'tampermonkey/US-Sign-Glass-Theme-v1.0.0.user.js',
    'tampermonkey/US-Sign-Dark-Glass-Theme.user.js',
    'tampermonkey/US-Sign-Dark-Glass-Theme-v1.0.0.user.js',
    'tampermonkey/US-Sign-Dark-Glass-Theme-v1.0.1.user.js',
    'tampermonkey/US-Sign-Design-Job-Tools-v4.1.5.user.js',
    'tampermonkey/US-Sign-Project-Scope-Workspace-v1.2.5.user.js',
    'tampermonkey/US-Sign-Description-File-Path-Tools-v2.3.1.user.js',
    'tampermonkey/US-Sign-Scope-of-Work-File-Tools-v2.6.1.user.js',
    'tampermonkey/US-Sign-UI-Runtime-Fixes-v3.1.4.user.js',
]
for rel in remove_paths:
    p = ROOT / rel
    if p.exists():
        p.unlink()

print('Promoted canonical Full UI to Dark Glass v2.2.0, updated Menu Cleanup, archived the Glass-era set, and removed package detour files.')
