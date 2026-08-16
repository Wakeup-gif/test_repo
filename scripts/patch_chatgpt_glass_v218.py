from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.17" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.17")

text = text.replace("@version      2.0.17", "@version      2.0.18", 1)
text = text.replace(
    "if (window.__chatgptUsSignGlassThemeV217) return;\n  window.__chatgptUsSignGlassThemeV216 = true;",
    "if (window.__chatgptUsSignGlassThemeV218) return;\n  window.__chatgptUsSignGlassThemeV218 = true;",
    1,
)

TARGET.write_text(text, encoding="utf-8")
