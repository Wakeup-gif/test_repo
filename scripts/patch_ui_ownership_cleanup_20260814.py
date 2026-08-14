from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def patch_file(rel_path, old_version, new_version, replacements):
    path = ROOT / rel_path
    text = path.read_text(encoding="utf-8")
    old_tag = f"// @version      {old_version}"
    new_tag = f"// @version      {new_version}"

    if new_tag in text:
        print(f"{rel_path}: already {new_version}")
        return False
    if old_tag not in text:
        raise SystemExit(f"{rel_path}: expected {old_version}")

    text = text.replace(old_tag, new_tag, 1)
    for old, new, count in replacements:
        if old not in text:
            raise SystemExit(f"{rel_path}: expected patch target missing: {old[:90]!r}")
        text = text.replace(old, new, count)

    path.write_text(text, encoding="utf-8")
    print(f"{rel_path}: {old_version} -> {new_version}")
    return True


full_ui_replacements = [
    (
        "      --us-accent-soft: rgba(10, 132, 255, 0.18);\n",
        "      --us-accent-soft: rgba(10, 132, 255, 0.18);\n"
        "      --us-design-surface: rgba(7, 15, 25, 0.14);\n"
        "      --us-design-surface-strong: rgba(7, 15, 25, 0.17);\n"
        "      --us-design-surface-soft: rgba(255, 255, 255, 0.018);\n"
        "      --us-design-hover: rgba(118, 190, 246, 0.055);\n"
        "      --us-design-border: rgba(226, 242, 255, 0.07);\n"
        "      --us-design-border-strong: rgba(226, 242, 255, 0.105);\n"
        "      --us-design-accent-soft: rgba(80, 165, 238, 0.10);\n",
        1,
    ),
    (
        "    /* Design Job Tools injects its CSS after the theme and defines .90/.96\n"
        "       surfaces. Higher specificity + !important keeps those runtime cards\n"
        "       aligned with the global glass system without editing layout behavior. */\n"
        "    html body #us-sign-design-actionbar,\n"
        "    html body #us-sign-job-overview,\n"
        "    html body #us-sign-design-summary,\n"
        "    html body #us-sign-design-bottom-grid,\n"
        "    html body #us-sign-design-right-stack {\n"
        "      --djt-surface: rgba(7, 15, 25, 0.14) !important;\n"
        "      --djt-surface-strong: rgba(7, 15, 25, 0.17) !important;\n"
        "      --djt-surface-soft: rgba(255, 255, 255, 0.018) !important;\n"
        "      --djt-hover: rgba(118, 190, 246, 0.055) !important;\n"
        "      --djt-border: rgba(226, 242, 255, 0.07) !important;\n"
        "      --djt-border-strong: rgba(226, 242, 255, 0.105) !important;\n"
        "      --djt-accent-soft: rgba(80, 165, 238, 0.10) !important;\n"
        "      --djt-font: var(--us-font) !important;\n"
        "    }\n\n",
        "    /* Design Job Tools consumes theme-owned paint tokens. Layout remains owned by Design Job Tools. */\n\n",
        1,
    ),
    (
        "    html body #sidebar_left,\n    html body #sidebar_left *,\n    html body button,\n",
        "    html body #sidebar_left,\n    html body button,\n",
        1,
    ),
]

design_vars_old = "      #${IDS.actionbar},#${IDS.overview},#${IDS.summary},#${IDS.copyTools},#${IDS.nativeActions},#${IDS.bottomGrid},#${IDS.rightStack},#${IDS.lookup},.us-sign-search-with-lookup { --djt-surface:rgba(16,20,25,.90);--djt-surface-strong:rgba(13,17,22,.96);--djt-surface-soft:rgba(255,255,255,.025);--djt-hover:rgba(255,255,255,.045);--djt-border:rgba(255,255,255,.06);--djt-border-strong:rgba(255,255,255,.10);--djt-text:#e8edf2;--djt-text-soft:#bcc4cd;--djt-text-muted:#87919c;--djt-accent-soft:rgba(127,146,166,.13);--djt-danger:#c7a3a3;--djt-warning:#d0b786;--djt-radius-sm:7px;--djt-radius-lg:14px;--djt-font:var(--font-ui,\"Inter\",system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif);font-family:var(--djt-font)!important;text-shadow:none!important; }\n"
design_vars_new = "      #${IDS.actionbar},#${IDS.overview},#${IDS.summary},#${IDS.copyTools},#${IDS.nativeActions},#${IDS.bottomGrid},#${IDS.rightStack},#${IDS.lookup},.us-sign-search-with-lookup { --djt-surface:var(--us-design-surface,rgba(16,20,25,.90));--djt-surface-strong:var(--us-design-surface-strong,rgba(13,17,22,.96));--djt-surface-soft:var(--us-design-surface-soft,rgba(255,255,255,.025));--djt-hover:var(--us-design-hover,var(--us-hover,rgba(255,255,255,.045)));--djt-border:var(--us-design-border,var(--us-border,rgba(255,255,255,.06)));--djt-border-strong:var(--us-design-border-strong,var(--us-border-strong,rgba(255,255,255,.10)));--djt-text:var(--us-text,#e8edf2);--djt-text-soft:var(--us-text-soft,#bcc4cd);--djt-text-muted:var(--us-text-muted,#87919c);--djt-accent-soft:var(--us-design-accent-soft,var(--us-accent-soft,rgba(127,146,166,.13)));--djt-danger:var(--us-danger,#c7a3a3);--djt-warning:var(--us-warning,#d0b786);--djt-radius-sm:var(--us-radius-sm,7px);--djt-radius-lg:var(--us-radius-lg,14px);--djt-font:var(--us-font,var(--font-ui,\"Inter\",system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif));font-family:var(--djt-font)!important;text-shadow:none!important; }\n"

design_replacements = [
    ('const VERSION = "4.1.2";', 'const VERSION = "4.1.3";', 1),
    (design_vars_old, design_vars_new, 1),
    (
        ";white-space:nowrap!important;scrollbar-width:none!important;backdrop-filter:blur(14px) saturate(1.02)!important;-webkit-backdrop-filter:blur(14px) saturate(1.02)!important; }",
        ";white-space:nowrap!important;scrollbar-width:none!important; }",
        1,
    ),
]

menu_replacements = [
    ('window.__usSignMenuCleanupV300', 'window.__usSignMenuCleanupV301', 2),
    ('background: #171b20 !important;', 'background: var(--us-glass-strong, #171b20) !important;', 1),
    ('border: 1px solid #2d343c !important;', 'border: 1px solid var(--us-border, #2d343c) !important;', 1),
    ('color: #aeb8c3 !important;', 'color: var(--us-text-soft, #aeb8c3) !important;', 1),
    ('color: #f5f7f9 !important;', 'color: var(--us-text, #f5f7f9) !important;', 2),
    ('background: #262c33 !important;', 'background: var(--us-hover, #262c33) !important;', 1),
    ('color: #d4dbe3 !important;', 'color: var(--us-text-soft, #d4dbe3) !important;', 1),
    ('background: #252d35 !important;', 'background: var(--us-bg-soft, #252d35) !important;', 1),
    ('border: 1px solid #3a4652 !important;', 'border: 1px solid var(--us-border-strong, #3a4652) !important;', 1),
    ('color: #d1d7de !important;', 'color: var(--us-text-soft, #d1d7de) !important;', 1),
    ('background: #1d2228 !important;', 'background: var(--us-glass, #1d2228) !important;', 1),
    ('border: 1px solid #353e48 !important;', 'border: 1px solid var(--us-border, #353e48) !important;', 1),
    ('background: #282e35 !important;', 'background: var(--us-hover, #282e35) !important;', 1),
    ('border-color: #4b5662 !important;', 'border-color: var(--us-border-strong, #4b5662) !important;', 1),
    (
        '      counter.style.setProperty("background", "#252d35", "important");\n'
        '      counter.style.setProperty("background-color", "#252d35", "important");\n'
        '      counter.style.setProperty("background-image", "none", "important");\n'
        '      counter.style.setProperty("color", "#d4dbe3", "important");\n'
        '      counter.style.setProperty("border", "1px solid #3a4652", "important");\n'
        '      counter.style.setProperty("box-shadow", "none", "important");\n',
        '',
        1,
    ),
]

patch_file('tampermonkey/US-Sign-Full-UI-Theme.user.js', '2.1.19', '2.1.20', full_ui_replacements)
patch_file('tampermonkey/US-Sign-Design-Job-Tools.user.js', '4.1.2', '4.1.3', design_replacements)
patch_file('tampermonkey/US-Sign-Menu-Cleanup.user.js', '3.0.0', '3.0.1', menu_replacements)
