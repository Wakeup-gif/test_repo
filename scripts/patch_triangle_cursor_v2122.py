from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"

text = TARGET.read_text(encoding="utf-8")

if "@version      2.1.22" in text:
    raise SystemExit("v2.1.22 already applied")

required = [
    "@version      2.1.21",
    "dynamic expanding crosshair cursor.",
    "v2.1.21 DYNAMIC CROSSHAIR CURSOR",
    "us-sign-cursor-crosshair-v2121.svg",
    "us-sign-cursor-crosshair-hover-v2121.svg",
]
for marker in required:
    if marker not in text:
        raise SystemExit(f"Missing expected marker: {marker}")

text = text.replace("@version      2.1.21", "@version      2.1.22", 1)
text = text.replace(
    "dynamic expanding crosshair cursor.",
    "outline-free dynamic triangle cursor.",
    1,
)
text = text.replace(
    "v2.1.21 DYNAMIC CROSSHAIR CURSOR",
    "v2.1.22 DYNAMIC TRIANGLE CURSOR",
    1,
)
text = text.replace(
    "CSS-only cursor assets. The crosshair expands over interactive\n       controls with no mouse tracking, DOM overlay, or animation loop.",
    "CSS-only cursor assets. The triangle grows over interactive\n       controls with no mouse tracking, DOM overlay, or animation loop.",
    1,
)
text = text.replace(
    'url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-crosshair-v2121.svg") 12 12, crosshair',
    'url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-triangle-v2122.svg") 6 4, default',
    1,
)
text = text.replace(
    'url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-crosshair-hover-v2121.svg") 17 17, pointer',
    'url("https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/assets/us-sign-cursor-triangle-hover-v2122.svg") 7 5, pointer',
    1,
)

TARGET.write_text(text, encoding="utf-8")
print("Patched Full UI Theme to v2.1.22 triangle cursor")
