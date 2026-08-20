from pathlib import Path

TM = Path('tampermonkey')


def read(name):
    return (TM / name).read_text(encoding='utf-8')


def write(name, text):
    (TM / name).write_text(text, encoding='utf-8', newline='\n')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly 1 match, found {count}')
    return text.replace(old, new, 1)


# ---------------------------------------------------------------------------
# Design Job Tools 4.1.9: DOM-only unification of the three native project
# identity rows. This runs only after the Design page has been positively
# identified by its design table, so Scope keeps the native shared structure.
# ---------------------------------------------------------------------------
design_name = 'US-Sign-Design-Job-Tools.user.js'
design = read(design_name)
design = replace_once(design, '// @version      4.1.8', '// @version      4.1.9', 'Design version')
design = replace_once(
    design,
    '// @description  Stable Design workspace focused on DOM structure, geometry, data, and interactions; Dark Glass paint is owned centrally by Full UI Theme.',
    '// @description  Stable Design workspace with a unified project identity row plus focused DOM structure, geometry, data, and interactions; Dark Glass paint is owned centrally by Full UI Theme.',
    'Design description',
)
design = replace_once(design, 'const VERSION = "4.1.8";', 'const VERSION = "4.1.9";', 'Design VERSION const')
design = replace_once(
    design,
    '    rightStack: "us-sign-design-right-stack",\n    lookup: "us-sign-job-lookup-button"',
    '    rightStack: "us-sign-design-right-stack",\n    lookup: "us-sign-job-lookup-button",\n    projectHeader: "us-sign-design-project-header"',
    'Design project header ID',
)

header_function = r'''
  function ensureProjectIdentityRow() {
    const existing = document.getElementById(IDS.projectHeader);
    if (existing) return existing;

    const customerName = document.getElementById("customer-name");
    const customerInfo = document.getElementById("customer-info");
    if (!customerName || !customerInfo) return null;

    const nameAnchor = customerName.closest(".row.no-gutter") || customerName;
    const infoAnchor = customerInfo.closest(".row.no-gutter") || customerInfo;
    const container = nameAnchor.parentElement;
    if (!container || infoAnchor.parentElement !== container) return null;

    const statusAnchor = [...container.children].find((element) =>
      element.matches?.(".alert.alert-micro")
    ) || null;

    const header = document.createElement("section");
    header.id = IDS.projectHeader;
    header.className = "us-sign-design-project-header";
    header.setAttribute("aria-label", "Project identity");

    container.insertBefore(header, statusAnchor || nameAnchor);

    if (statusAnchor) {
      statusAnchor.classList.add("us-sign-design-project-status");
      header.appendChild(statusAnchor);
    }

    nameAnchor.classList.add("us-sign-design-project-name");
    infoAnchor.classList.add("us-sign-design-project-info");
    header.append(nameAnchor, infoAnchor);

    return header;
  }

'''
design = replace_once(
    design,
    '  function mountDesignWorkspace() {',
    header_function + '  function mountDesignWorkspace() {',
    'Insert Design project identity function',
)
design = replace_once(
    design,
    '      document.documentElement.classList.add("us-sign-design-page");\n      document.documentElement.classList.remove("us-sign-job-dashboard");\n      const { actionbar, copyTools } = ensureActionbar(workspace);',
    '      document.documentElement.classList.add("us-sign-design-page");\n      document.documentElement.classList.remove("us-sign-job-dashboard");\n      ensureProjectIdentityRow();\n      const { actionbar, copyTools } = ensureActionbar(workspace);',
    'Call Design project identity row',
)
write(design_name, design)
write('US-Sign-Design-Job-Tools-v4.1.9.user.js', design)


# ---------------------------------------------------------------------------
# Full UI Theme 2.2.4: visual ownership of the unified Design-only row.
# ---------------------------------------------------------------------------
theme_name = 'US-Sign-Full-UI-Theme.user.js'
theme = read(theme_name)
theme = replace_once(theme, '// @version      2.2.3', '// @version      2.2.4', 'Theme version')
theme = replace_once(
    theme,
    '// @description  Canonical SquareCoil Dark Glass UI with centralized Design paint, audited 14px frost, graphite surfaces, shared Bing wallpaper with a smooth preloaded crossfade, semantic states, refined spacing, and geometric cursor.',
    '// @description  Canonical SquareCoil Dark Glass UI with a unified Design project header, centralized Design paint, audited 14px frost, graphite surfaces, smooth shared wallpaper crossfade, semantic states, and refined spacing.',
    'Theme description',
)

css = r'''

    /* =========================================================
       v2.2.4 DESIGN-ONLY UNIFIED PROJECT IDENTITY ROW
       Design Job Tools moves the three native shared project elements into one
       wrapper only after identifying the Design page. Scope keeps its existing
       stacked/shared layout. The wrapper is the sole glass root; the native
       customer/status surfaces become transparent content inside it.
    ========================================================= */

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header {
      display: grid !important;
      grid-template-columns: minmax(300px, 1.02fr) minmax(430px, 1.28fr) auto !important;
      grid-template-areas: "name info status" !important;
      align-items: center !important;
      gap: 0 !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 68px !important;
      margin: 0 0 14px !important;
      padding: 8px 10px !important;
      color: #e8eaed !important;
      background-color: rgba(11, 11, 14, 0.58) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,.024), rgba(255,255,255,.004)) !important;
      border: 1px solid rgba(255,255,255,.060) !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 28px rgba(0,0,0,.20) !important;
      -webkit-backdrop-filter: blur(var(--us-dark-glass-blur,14px)) saturate(var(--us-dark-glass-saturation,108%)) brightness(var(--us-dark-glass-brightness,.90)) !important;
      backdrop-filter: blur(var(--us-dark-glass-blur,14px)) saturate(var(--us-dark-glass-saturation,108%)) brightness(var(--us-dark-glass-brightness,.90)) !important;
      overflow: hidden !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > :is(
      .us-sign-design-project-name,
      .us-sign-design-project-info
    ) {
      position: relative !important;
      inset: auto !important;
      float: none !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      transform: none !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .us-sign-design-project-name {
      grid-area: name !important;
      padding-right: 14px !important;
      border-right: 1px solid rgba(255,255,255,.060) !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .us-sign-design-project-info {
      grid-area: info !important;
      padding: 0 14px !important;
    }

    /* Pending / In Progress / etc. becomes a compact status chip rather than a
       third full-width glass card. It remains the original native status node. */
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .us-sign-design-project-status {
      grid-area: status !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      justify-self: end !important;
      width: auto !important;
      min-width: 88px !important;
      max-width: 180px !important;
      min-height: 34px !important;
      height: 34px !important;
      margin: 0 !important;
      padding: 0 12px !important;
      color: #dcecf8 !important;
      background: rgba(55, 111, 151, .26) !important;
      background-image: none !important;
      border: 1px solid rgba(120, 188, 236, .28) !important;
      border-radius: 9px !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.035) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      font-size: 11px !important;
      font-weight: 650 !important;
      line-height: 1 !important;
      white-space: nowrap !important;
    }

    /* The original project-name card becomes plain content inside the wrapper. */
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-name {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 12px !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 48px !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 2px !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      overflow: visible !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-name :is(h1,h2,h3,.panel-title) {
      min-width: 0 !important;
      margin: 0 !important;
      color: #f2f3f5 !important;
      font-size: clamp(21px, 1.45vw, 27px) !important;
      line-height: 1.08 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    /* Address/open-date card also becomes content, with one quiet separator. */
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-info {
      display: block !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 48px !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      color: #d7dbe0 !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      overflow: visible !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-info > .panel-heading {
      display: grid !important;
      grid-template-columns: minmax(0,1fr) auto !important;
      grid-template-areas: "address vendor" "date vendor" !important;
      align-items: center !important;
      gap: 3px 10px !important;
      min-height: 48px !important;
      margin: 0 !important;
      padding: 4px 0 !important;
      color: #d7dbe0 !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-info > .panel-heading .panel-title {
      grid-area: address !important;
      min-width: 0 !important;
      margin: 0 !important;
      color: #d7dbe0 !important;
      font-size: 10.5px !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-info > .panel-heading > span.pull-right {
      grid-area: date !important;
      display: block !important;
      float: none !important;
      margin: 0 !important;
      color: #959ba3 !important;
      font-size: 10px !important;
      line-height: 1.2 !important;
      text-align: left !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-info > .panel-heading > a.btn.pull-right {
      grid-area: vendor !important;
      float: none !important;
      align-self: center !important;
      margin: 0 !important;
    }

    /* Design's compact identity row should never reveal the larger contact/map
       body used by Scope. The DOM remains present for data extraction. */
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-info > .panel-body {
      display: none !important;
    }

    /* Neutralize inherited Bootstrap row pseudo-clears after the nodes move. */
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .row::before,
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .row::after {
      content: none !important;
      display: none !important;
    }

    @media (max-width: 1180px) {
      html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header {
        grid-template-columns: minmax(0,1fr) auto !important;
        grid-template-areas: "name status" "info info" !important;
        row-gap: 6px !important;
      }
      html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .us-sign-design-project-name {
        border-right: 0 !important;
      }
      html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .us-sign-design-project-info {
        padding: 6px 2px 0 !important;
        border-top: 1px solid rgba(255,255,255,.050) !important;
      }
    }
'''

anchor = '\n\n  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'
if anchor not in theme:
    raise RuntimeError('Full UI CSS closing anchor not found')
theme = theme.replace(anchor, css + anchor, 1)
write(theme_name, theme)
write('US-Sign-Full-UI-Theme-v2.2.4.user.js', theme)

print('patched Full UI 2.2.4 + Design Job Tools 4.1.9')
