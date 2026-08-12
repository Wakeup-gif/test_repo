from pathlib import Path

path = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
text = path.read_text(encoding='utf-8')

text = text.replace('// @version      2.0.2', '// @version      2.0.3', 1)
text = text.replace(
    '// @description  Blue macOS-inspired glass theme for SquareCoil with a dedicated fixed wallpaper layer, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.',
    '// @description  Blue macOS-inspired glass theme for SquareCoil with corrected wallpaper stacking, bounded shell cleanup, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.',
    1,
)

css_marker = '''    @media print {\n'''
css = r'''    /* =========================================================
       v2.0.3 WALLPAPER STACKING FIX
       v2.0.2 used body::before with a negative stack level inside an
       isolated body. Move the image to the root stacking context instead.
    ========================================================= */

    html {
      position: relative !important;
      isolation: isolate !important;
      background: #081019 !important;
      background-color: #081019 !important;
      background-image: none !important;
    }

    html::before {
      content: "" !important;
      position: fixed !important;
      inset: 0 !important;
      z-index: 0 !important;
      display: block !important;
      pointer-events: none !important;
      background-color: #0a1018 !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.20), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.10), transparent 34%),
        linear-gradient(rgba(4, 8, 13, 0.30), rgba(6, 11, 17, 0.58)),
        url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1"),
        url("https://bing.gifposter.com/bingImages/LagoPehoe_1920x1080.jpg") !important;
      background-position: center center !important;
      background-size: cover !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
    }

    body {
      position: relative !important;
      z-index: 1 !important;
      isolation: auto !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    body::before {
      content: none !important;
      display: none !important;
      background: none !important;
    }

    /* Keep the real app above the root wallpaper layer. */
    header.navbar,
    #main,
    #content_wrapper,
    #content {
      position: relative !important;
      z-index: 1 !important;
    }

    /* Structural shells only. Functional cards keep their glass surfaces. */
    html body #main,
    html body #content_wrapper,
    html body #content,
    html body #content.table-layout,
    html body #content > .tray,
    html body #content > aside.tray,
    html body #content > section.tray,
    html body #content .tray-center,
    html body #content .tray-left,
    html body #content .tray-right,
    html body #content .tray-inner,
    html body #content .tray-center > .pl15,
    html body #content .tray-center > .pr15,
    html body #content .tray-center > .pl15.pr15,
    html body #content .us-sign-design-workbench,
    html body #content .us-sign-design-workspace-column,
    html body #content .us-sign-design-workspace-column > .panel,
    html body #content .us-sign-design-workspace-column > .panel > .panel-body {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

'''

if 'v2.0.3 WALLPAPER STACKING FIX' not in text:
    if css_marker not in text:
        raise SystemExit('print media marker not found')
    text = text.replace(css_marker, css + css_marker, 1)

js = r'''
  /* v2.0.3: bounded late-shell cleanup. Design Job Tools mounts after this
     theme, so clear only its outer ancestor shells a few times during startup.
     No observer and no recurring interval. */
  function usSignClearWallpaperShell(element) {
    if (!(element instanceof Element)) return;
    element.style.setProperty("background", "transparent", "important");
    element.style.setProperty("background-color", "transparent", "important");
    element.style.setProperty("background-image", "none", "important");
  }

  function usSignWallpaperPass() {
    [
      "#main",
      "#content_wrapper",
      "#content",
      "#content.table-layout",
      "#content > .tray",
      "#content .tray-center",
      "#content .tray-left",
      "#content .tray-right",
      "#content .tray-inner",
      "#content .tray-center > .pl15",
      "#content .tray-center > .pr15",
      "#content .tray-center > .pl15.pr15",
      "#content .us-sign-design-workbench",
      "#content .us-sign-design-workspace-column"
    ].forEach((selector) => {
      document.querySelectorAll(selector).forEach(usSignClearWallpaperShell);
    });

    const actionbar = document.getElementById("us-sign-design-actionbar");
    if (actionbar) {
      let current = actionbar.parentElement;
      while (current && current !== document.body) {
        usSignClearWallpaperShell(current);
        if (current.id === "content") break;
        current = current.parentElement;
      }
    }

    const rail = document.getElementById("pmlt");
    if (rail) {
      rail.style.setProperty(
        "background",
        "linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.012)), rgba(8,14,22,.67)",
        "important"
      );
      rail.style.setProperty("background-color", "rgba(8,14,22,.67)", "important");
    }
  }

  function usSignScheduleWallpaperPasses() {
    [0, 220, 650, 1300, 2400, 3600].forEach((delay) => {
      window.setTimeout(usSignWallpaperPass, delay);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", usSignScheduleWallpaperPasses, { once: true });
  } else {
    usSignScheduleWallpaperPasses();
  }
  window.addEventListener("pageshow", usSignScheduleWallpaperPasses);
'''

end_marker = '\n\n})();'
if 'function usSignWallpaperPass()' not in text:
    if end_marker not in text:
        raise SystemExit('script end marker not found')
    text = text.replace(end_marker, '\n' + js + end_marker, 1)

path.write_text(text, encoding='utf-8')
