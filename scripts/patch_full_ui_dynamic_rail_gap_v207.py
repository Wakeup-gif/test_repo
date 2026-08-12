from pathlib import Path

path = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
text = path.read_text(encoding='utf-8')

text = text.replace('// @version      2.0.6', '// @version      2.0.7', 1)
text = text.replace(
    '// @description  Blue macOS-inspired glass theme for SquareCoil with corrected wallpaper stacking, compact project positioning, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.',
    '// @description  Blue macOS-inspired glass theme for SquareCoil with measured project-rail gap repair, corrected wallpaper stacking, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.',
    1,
)

# Remove the ineffective v2.0.6 static offset rule so it cannot fight the measured repair.
start = text.find('    /* =========================================================\n       v2.0.6 PROJECT HORIZONTAL OFFSET FIX')
if start != -1:
    end = text.find('    @media print {', start)
    if end == -1:
        raise SystemExit('Could not find end of v2.0.6 block')
    text = text[:start] + text[end:]

needle = '''  function usSignWallpaperPass() {\n'''
repair = r'''  function usSignCollapseEmptyProjectRailGap() {
    const sidebar = document.getElementById("sidebar_left");
    const rail = document.getElementById("pmlt");
    const content = document.getElementById("content");
    if (!sidebar || !rail || !content) return;

    const sidebarRect = sidebar.getBoundingClientRect();
    let railRect = rail.getBoundingClientRect();
    let gap = railRect.left - sidebarRect.right;
    if (gap <= 18) return;

    /* First repair padding/margin on an ancestor that already begins where the
       main sidebar ends but pushes #pmlt inward. */
    let current = rail.parentElement;
    while (current && current !== content && current !== document.body) {
      const rect = current.getBoundingClientRect();
      if (
        rect.width > 0 &&
        rect.left <= sidebarRect.right + 8 &&
        railRect.left - rect.left > 18
      ) {
        current.style.setProperty("padding-left", "0", "important");
        current.style.setProperty("margin-left", "0", "important");
        current.style.setProperty("text-indent", "0", "important");
      }
      current = current.parentElement;
    }

    railRect = rail.getBoundingClientRect();
    gap = railRect.left - sidebarRect.right;
    if (gap <= 18) return;

    /* If the gap is a separate empty tray/cell, identify the direct #content
       child before the rail and collapse only empty structural siblings. */
    let railCell = rail;
    while (railCell.parentElement && railCell.parentElement !== content) {
      railCell = railCell.parentElement;
    }

    if (railCell.parentElement === content) {
      const siblings = Array.from(content.children);
      const railIndex = siblings.indexOf(railCell);
      for (let index = 0; index < railIndex; index += 1) {
        const sibling = siblings[index];
        if (!(sibling instanceof Element)) continue;
        const rect = sibling.getBoundingClientRect();
        if (rect.width < 20 || rect.right <= sidebarRect.right + 2) continue;

        const hasVisibleControl = Array.from(
          sibling.querySelectorAll("a,button,input,select,textarea,img,svg,canvas,iframe")
        ).some((element) => {
          const r = element.getBoundingClientRect();
          const s = getComputedStyle(element);
          return r.width > 1 && r.height > 1 && s.display !== "none" && s.visibility !== "hidden";
        });
        const meaningfulText = (sibling.textContent || "").replace(/\s+/g, " ").trim();

        if (!hasVisibleControl && !meaningfulText) {
          sibling.style.setProperty("display", "none", "important");
          sibling.style.setProperty("width", "0", "important");
          sibling.style.setProperty("min-width", "0", "important");
          sibling.style.setProperty("max-width", "0", "important");
          sibling.style.setProperty("margin", "0", "important");
          sibling.style.setProperty("padding", "0", "important");
          sibling.style.setProperty("border", "0", "important");
        }
      }
    }

    railRect = rail.getBoundingClientRect();
    gap = railRect.left - sidebarRect.right;
    if (gap <= 18) return;

    /* Last structural case: the direct rail cell itself starts after the
       sidebar because of a native left margin/padding. Remove only those two
       offsets, never translate the rail or alter its width. */
    if (railCell instanceof Element) {
      railCell.style.setProperty("margin-left", "0", "important");
      railCell.style.setProperty("padding-left", "0", "important");
      rail.style.setProperty("margin-left", "0", "important");
      rail.style.setProperty("left", "auto", "important");
      rail.style.setProperty("transform", "none", "important");
    }
  }

'''

if 'function usSignCollapseEmptyProjectRailGap()' not in text:
    if needle not in text:
        raise SystemExit('usSignWallpaperPass marker not found')
    text = text.replace(needle, repair + needle, 1)

call_needle = '''  function usSignWallpaperPass() {\n    [\n'''
call_replacement = '''  function usSignWallpaperPass() {\n    usSignCollapseEmptyProjectRailGap();\n\n    [\n'''
if call_needle in text:
    text = text.replace(call_needle, call_replacement, 1)
elif 'usSignCollapseEmptyProjectRailGap();' not in text:
    raise SystemExit('Could not insert rail-gap repair call')

path.write_text(text, encoding='utf-8')
