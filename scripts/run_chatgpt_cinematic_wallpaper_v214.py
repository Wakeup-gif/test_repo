from pathlib import Path

patcher = Path("scripts/patch_chatgpt_cinematic_wallpaper_v214.py")
source = patcher.read_text(encoding="utf-8")

faulty_guard = '''replace_once("__chatgptUsSignDarkGlassThemeV213", "__chatgptUsSignDarkGlassThemeV214", "guard read")
replace_once("window.__chatgptUsSignDarkGlassThemeV213 = true;", "window.__chatgptUsSignDarkGlassThemeV214 = true;", "guard write")'''
fixed_guard = '''replace_once("if (window.__chatgptUsSignDarkGlassThemeV213) return;", "if (window.__chatgptUsSignDarkGlassThemeV214) return;", "guard read")
replace_once("window.__chatgptUsSignDarkGlassThemeV213 = true;", "window.__chatgptUsSignDarkGlassThemeV214 = true;", "guard write")'''

if faulty_guard not in source:
    raise SystemExit("Could not locate v2.1.3 guard patch block")

source = source.replace(faulty_guard, fixed_guard, 1)

# html::after paints after the body in the root stacking order. Use body::before
# as the second fixed wallpaper plane so both background layers are inserted
# before application content rather than risking an overlay above ChatGPT.
source = source.replace("html::after", "body::before")

exec(compile(source, str(patcher), "exec"), {"__name__": "__main__"})
