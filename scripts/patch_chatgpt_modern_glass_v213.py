from pathlib import Path
import shutil

CANONICAL = Path("tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js")
VERSIONED = Path("tampermonkey/ChatGPT-US-Sign-Glass-Theme-v2.1.3.user.js")

text = CANONICAL.read_text(encoding="utf-8")


def replace_once(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly 1 match, found {count}")
    text = text.replace(old, new, 1)


replace_once("// @version      2.1.2", "// @version      2.1.3", "version")
replace_once(
    "// @description  US Sign Dark Glass for ChatGPT with graphite translucent surfaces, restrained semantic blue, cached 14px reading frost, Bing UHD rotation, native layout, and full-viewport cutout geometric cursor coverage.",
    "// @description  Modern graphite glass for ChatGPT with bounded live blur on compact UI panels, cached reading frost, restrained semantic color, Bing UHD rotation, native layout, and optimized cursor coverage.",
    "description",
)
replace_once(
    "if (window.__chatgptUsSignDarkGlassThemeV212) return;\n  window.__chatgptUsSignDarkGlassThemeV212 = true;",
    "if (window.__chatgptUsSignDarkGlassThemeV213) return;\n  window.__chatgptUsSignDarkGlassThemeV213 = true;",
    "version guard",
)

replace_once(
    "      --us-radius-lg: 14px;\n      --us-font:",
    "      --us-radius-lg: 14px;\n      --us-frost: blur(18px) saturate(112%) brightness(0.92);\n      --us-frost-soft: blur(14px) saturate(108%) brightness(0.94);\n      --us-font:",
    "glass tokens",
)

for old, new, label in [
    ("--main-surface-primary: rgba(10, 10, 12, 0.30)", "--main-surface-primary: rgba(10, 10, 12, 0.24)", "main primary"),
    ("--main-surface-secondary: rgba(15, 15, 18, 0.42)", "--main-surface-secondary: rgba(15, 15, 18, 0.34)", "main secondary"),
    ("--main-surface-tertiary: rgba(20, 20, 23, 0.50)", "--main-surface-tertiary: rgba(20, 20, 23, 0.44)", "main tertiary"),
    ("--sidebar-surface-primary: rgba(12, 12, 15, 0.20)", "--sidebar-surface-primary: rgba(12, 12, 15, 0.14)", "sidebar primary"),
    ("--sidebar-surface-secondary: rgba(18, 18, 21, 0.22)", "--sidebar-surface-secondary: rgba(18, 18, 21, 0.18)", "sidebar secondary"),
    ("--sidebar-surface-tertiary: rgba(24, 24, 27, 0.18)", "--sidebar-surface-tertiary: rgba(24, 24, 27, 0.15)", "sidebar tertiary"),
    ("--composer-surface: rgba(10, 10, 13, 0.76)", "--composer-surface: rgba(10, 10, 13, 0.64)", "composer token"),
    ("--composer-surface-primary: rgba(10, 10, 13, 0.76)", "--composer-surface-primary: rgba(10, 10, 13, 0.64)", "composer primary token"),
    ("--message-surface: rgba(15, 15, 18, 0.30)", "--message-surface: rgba(15, 15, 18, 0.24)", "message token"),
    ("--interactive-bg-secondary-default: rgba(255, 255, 255, 0.035)", "--interactive-bg-secondary-default: rgba(255, 255, 255, 0.025)", "quiet default controls"),
]:
    replace_once(old, new, label)

replace_once(
    "        linear-gradient(180deg, rgba(8, 8, 10, 0.56), rgba(5, 5, 7, 0.68)),\n        var(--us-wallpaper) !important;",
    "        linear-gradient(180deg, rgba(8, 8, 10, 0.44), rgba(5, 5, 7, 0.58)),\n        var(--us-wallpaper) !important;",
    "reading frost tint",
)

replace_once(
    '''    #stage-slideover-sidebar {
      color: var(--us-text-soft) !important;
      background: rgba(12, 12, 15, 0.64) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.004)) !important;
      border-inline-end: 1px solid rgba(255,255,255,0.070) !important;
      box-shadow: 10px 0 32px rgba(0,0,0,0.12), inset -1px 0 0 rgba(255,255,255,0.025) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }''',
    '''    #stage-slideover-sidebar {
      color: var(--us-text-soft) !important;
      background: rgba(10, 10, 13, 0.46) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.040), rgba(255,255,255,0.006)) !important;
      border-inline-end: 1px solid rgba(255,255,255,0.075) !important;
      box-shadow: 12px 0 36px rgba(0,0,0,0.16), inset -1px 0 0 rgba(255,255,255,0.030) !important;
      -webkit-backdrop-filter: var(--us-frost) !important;
      backdrop-filter: var(--us-frost) !important;
    }''',
    "sidebar glass",
)

replace_once(
    '''    #conversation-header-actions {
      background: rgba(12, 12, 15, 0.78) !important;
      border: 1px solid rgba(255,255,255,0.090) !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.035) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }''',
    '''    #conversation-header-actions {
      background: rgba(10, 10, 13, 0.56) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.036), rgba(255,255,255,0.004)) !important;
      border: 1px solid rgba(255,255,255,0.085) !important;
      box-shadow: 0 10px 28px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.040) !important;
      -webkit-backdrop-filter: var(--us-frost-soft) !important;
      backdrop-filter: var(--us-frost-soft) !important;
    }''',
    "header actions glass and invalid rgba fix",
)

replace_once(
    '''    form[class*="group/composer"] [class*="bg-(--composer-surface-primary)"] {
      color: var(--us-text) !important;
      background: rgba(10, 10, 13, 0.80) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.004)) !important;
      border: 1px solid rgba(255,255,255,0.105) !important;
      box-shadow: 0 14px 38px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.040) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }''',
    '''    form[class*="group/composer"] [class*="bg-(--composer-surface-primary)"] {
      color: var(--us-text) !important;
      background: rgba(9, 9, 12, 0.58) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.006)) !important;
      border: 1px solid rgba(255,255,255,0.100) !important;
      box-shadow: 0 16px 42px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.050) !important;
      -webkit-backdrop-filter: var(--us-frost) !important;
      backdrop-filter: var(--us-frost) !important;
    }''',
    "composer glass",
)

replace_once(
    '''      background: rgba(13, 13, 16, 0.92) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.030), rgba(255,255,255,0.004)) !important;
      border: 1px solid rgba(255,255,255,0.105) !important;
      box-shadow: 0 18px 44px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.045) !important;
      -webkit-backdrop-filter: blur(14px) saturate(108%) brightness(90%) !important;
      backdrop-filter: blur(14px) saturate(108%) brightness(90%) !important;''',
    '''      background: rgba(11, 11, 14, 0.70) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.006)) !important;
      border: 1px solid rgba(255,255,255,0.100) !important;
      box-shadow: 0 20px 48px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.050) !important;
      -webkit-backdrop-filter: var(--us-frost) !important;
      backdrop-filter: var(--us-frost) !important;''',
    "menu glass",
)

replace_once(
    '''      background: rgba(12, 12, 15, 0.94) !important;
      border: 1px solid rgba(255,255,255,0.105) !important;
      box-shadow: 0 24px 64px rgba(0,0,0,0.32) !important;
      -webkit-backdrop-filter: blur(14px) saturate(108%) brightness(90%) !important;
      backdrop-filter: blur(14px) saturate(108%) brightness(90%) !important;''',
    '''      background: rgba(10, 10, 13, 0.76) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.040), rgba(255,255,255,0.004)) !important;
      border: 1px solid rgba(255,255,255,0.100) !important;
      box-shadow: 0 26px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.045) !important;
      -webkit-backdrop-filter: blur(22px) saturate(112%) brightness(0.90) !important;
      backdrop-filter: blur(22px) saturate(112%) brightness(0.90) !important;''',
    "dialog glass",
)

for old, new, label in [
    ("background: rgba(12, 12, 15, 0.52) !important;", "background: rgba(12, 12, 15, 0.40) !important;", "blockquote translucency"),
    ("background: rgba(5, 5, 7, 0.86) !important;", "background: rgba(5, 5, 7, 0.72) !important;", "code translucency"),
    ("background: rgba(10, 10, 12, 0.58) !important;", "background: rgba(10, 10, 12, 0.46) !important;", "table translucency"),
    ("rgba(0,0,0,0,0.42) 3%", "rgba(0,0,0,0.42) 3%", "mobile mask rgba fix"),
]:
    replace_once(old, new, label)

# v2.1.2 introduced a complete full-viewport cursor ownership block, but the
# older cursor block immediately before it was left in place. Remove only that
# superseded duplicate and keep the newer semantic pointer/text/drag restores.
start_marker = '''    html,
    body,
    #__next,
    #root,
    #main,
    #main *,
    #stage-slideover-sidebar,
    #stage-slideover-sidebar *,
    [role="dialog"],
    [role="dialog"] *,
    [role="menu"],
    [role="menu"] * {
      cursor: url('''
end_marker = '''

    /* =========================================================
       v2.1.2 FULL-VIEWPORT CURSOR COVERAGE'''
start = text.find(start_marker)
end = text.find(end_marker)
if start == -1 or end == -1 or end <= start:
    raise RuntimeError("duplicate cursor block markers not found")
text = text[:start] + end_marker + text[end + len(end_marker):]

# Preserve stable auto-update metadata. A fresh versioned filename is only a
# fallback installer and must continue tracking the canonical non-versioned URL.
canonical_url = "https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js"
if f"// @updateURL    {canonical_url}" not in text or f"// @downloadURL  {canonical_url}" not in text:
    raise RuntimeError("canonical update metadata changed unexpectedly")

CANONICAL.write_text(text, encoding="utf-8")
shutil.copyfile(CANONICAL, VERSIONED)
print(f"Patched {CANONICAL} and generated {VERSIONED}")
