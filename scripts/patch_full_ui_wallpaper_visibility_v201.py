from pathlib import Path

path = Path("tampermonkey/US-Sign-Full-UI-Theme.user.js")
text = path.read_text(encoding="utf-8")

text = text.replace("// @version      2.0.0", "// @version      2.0.1", 1)
text = text.replace(
    "// @description  Blue macOS-inspired glass theme for SquareCoil with fixed wallpaper, translucent shells, polished forms, tables, menus, editors, and readable project content.",
    "// @description  Blue macOS-inspired glass theme for SquareCoil with reliably loaded wallpaper, translucent workspace shells, polished forms, tables, menus, editors, and readable project content.",
    1,
)

if "// @grant        GM_xmlhttpRequest" not in text:
    text = text.replace(
        "// @grant        GM_addStyle\n",
        "// @grant        GM_addStyle\n// @grant        GM_xmlhttpRequest\n// @connect      www.bing.com\n",
        1,
    )

override = r'''
    /* =========================================================
       v2.0.1 WALLPAPER VISIBILITY + LATE SHELL OWNERSHIP
       The native Design page and later userscripts can repaint outer
       workspace layers after the theme starts. These selectors own only
       structural shells, leaving functional cards and content panels intact.
    ========================================================= */

    html,
    body {
      background-color: var(--us-bg-deep) !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.18), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.08), transparent 34%),
        linear-gradient(rgba(5, 9, 14, 0.38), rgba(7, 11, 16, 0.66)),
        var(--us-wallpaper) !important;
      background-position: center center !important;
      background-size: cover !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
    }

    html body #main,
    html body #content_wrapper,
    html body #content,
    html body #content > .tray,
    html body #content > .tray-left,
    html body #content > .tray-right,
    html body #content > .tray-center,
    html body .tray,
    html body .tray-left,
    html body .tray-right,
    html body .tray-center,
    html body .tray-inner,
    html body .tray-center > .pl15,
    html body .tray-center > .pr15,
    html body .tray-center > .pl15.pr15,
    html body #content .us-sign-design-workbench,
    html body #content .us-sign-design-workspace-column {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    /* The outer Design panel is a layout shell. Inner panels remain glass. */
    html body #content .us-sign-design-workspace-column > .panel,
    html body #content .us-sign-design-workspace-column > .panel > .panel-body {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-color: transparent !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    /* Force the project rail to stay dark glass even when later project CSS runs. */
    html.us-sign-project-page body #pmlt,
    html body:has(#pmlt) #pmlt {
      color: var(--us-text-soft) !important;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012)),
        rgba(9, 15, 23, 0.70) !important;
      background-color: rgba(9, 15, 23, 0.70) !important;
      background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012)) !important;
      border-right: 1px solid var(--us-blue-border) !important;
      box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.035), 10px 0 32px rgba(0, 0, 0, 0.18) !important;
      -webkit-backdrop-filter: blur(20px) saturate(140%) !important;
      backdrop-filter: blur(20px) saturate(140%) !important;
    }

    /* Keep the main Design content readable while letting wallpaper breathe around it. */
    html body #content #us-sign-design-actionbar,
    html body #content #us-sign-job-overview,
    html body #content #us-sign-design-summary,
    html body #content #us-sign-design-bottom-grid .panel,
    html body #content #customer-name,
    html body #content #customer-info,
    html body #content .well {
      border-color: rgba(165, 210, 245, 0.13) !important;
    }

'''

marker = "    @media print {\n"
if "v2.0.1 WALLPAPER VISIBILITY" not in text:
    if marker not in text:
        raise SystemExit("print marker not found")
    text = text.replace(marker, override + marker, 1)

loader = r'''

  /* Load the supplied Bing wallpaper through Tampermonkey so page CSP/hotlinking
     cannot leave the interface with only the fallback background. */
  const US_SIGN_WALLPAPER_URL = "https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1";

  function installWallpaperDataUrl() {
    if (typeof GM_xmlhttpRequest !== "function") return;

    GM_xmlhttpRequest({
      method: "GET",
      url: US_SIGN_WALLPAPER_URL,
      responseType: "blob",
      onload(response) {
        if (!response.response || response.status < 200 || response.status >= 400) return;
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = String(reader.result || "");
          if (!dataUrl.startsWith("data:image/")) return;
          document.documentElement.style.setProperty(
            "--us-wallpaper",
            `url("${dataUrl}")`
          );
        };
        reader.readAsDataURL(response.response);
      }
    });
  }

  installWallpaperDataUrl();
'''

closing = "  `);\n})();\n"
if "installWallpaperDataUrl" not in text:
    if closing not in text:
        raise SystemExit("script closing marker not found")
    text = text.replace(closing, "  `);" + loader + "\n})();\n", 1)

path.write_text(text, encoding="utf-8")
