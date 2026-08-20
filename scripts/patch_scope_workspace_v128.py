from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANONICAL = ROOT / "tampermonkey" / "US-Sign-Project-Scope-Workspace.user.js"
SNAPSHOT = ROOT / "tampermonkey" / "US-Sign-Project-Scope-Workspace-v1.2.8.user.js"

text = CANONICAL.read_text(encoding="utf-8")

old_version = "// @version      1.2.7"
new_version = "// @version      1.2.8"
old_description = "// @description  Preserves native Status and gives the live Scope workspace cohesive Dark Glass panels with a true dark translucent CKEditor canvas, aligned controls, and clean formatting chrome."
new_description = "// @description  Scope-only workspace with explicit Design/Status exclusions, cohesive Dark Glass panels, a true dark translucent CKEditor canvas, aligned controls, and clean formatting chrome."
old_guard = "  if (/\\/project_milestones\\.php$/i.test(location.pathname)) return;"
new_guard = "  if (/\\/project_milestones\\.php$/i.test(location.pathname)) return;\n\n  // Design owns its own DOM/layout through Design Job Tools. Keep Scope rules\n  // completely off that page instead of relying on CSS specificity.\n  if (/\\/project_designs\\.php$/i.test(location.pathname)) return;"

for needle in (old_version, old_description, old_guard):
    if needle not in text:
        raise SystemExit(f"Expected source marker not found: {needle}")

text = text.replace(old_version, new_version, 1)
text = text.replace(old_description, new_description, 1)
text = text.replace(old_guard, new_guard, 1)

if text.count("project_designs\\.php") != 1:
    raise SystemExit("Design exclusion count is not exactly one")
if "// @version      1.2.8" not in text:
    raise SystemExit("Version bump failed")

CANONICAL.write_text(text, encoding="utf-8")

if SNAPSHOT.exists():
    existing = SNAPSHOT.read_text(encoding="utf-8")
    if existing != text:
        raise SystemExit("Existing v1.2.8 snapshot differs from generated canonical")
else:
    SNAPSHOT.write_text(text, encoding="utf-8")

print("Patched Scope Workspace to v1.2.8 with explicit Design-page exclusion")
# Triggered after workflow creation so the release job runs on main.
