from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FULL = ROOT / 'tampermonkey' / 'US-Sign-Full-UI-Theme.user.js'
DESIGN = ROOT / 'tampermonkey' / 'US-Sign-Design-Job-Tools.user.js'


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly 1 match, found {count}')
    return text.replace(old, new, 1)


def patch_design(text: str) -> str:
    text = replace_once(text, '// @version      4.1.9', '// @version      4.1.10', 'Design metadata version')
    text = replace_once(
        text,
        '// @description  Stable Design workspace with a unified project identity row plus focused DOM structure, geometry, data, and interactions; Dark Glass paint is owned centrally by Full UI Theme.',
        '// @description  Design workspace with layered project identity, job-state-first hierarchy, overview details, then actions; Dark Glass paint remains owned centrally by Full UI Theme.',
        'Design description'
    )
    text = replace_once(text, 'const VERSION = "4.1.9";', 'const VERSION = "4.1.10";', 'Design runtime version')
    text = replace_once(
        text,
        '    lookup: "us-sign-job-lookup-button",\n    projectHeader: "us-sign-design-project-header"\n',
        '    lookup: "us-sign-job-lookup-button",\n    projectHeader: "us-sign-design-project-header",\n    projectControls: "us-sign-design-project-controls"\n',
        'Design IDS project controls'
    )

    old_function = '''  function ensureProjectIdentityRow() {
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

    new_function = '''  function ensureProjectHeaderControls(header) {
    if (!header) return null;
    const customerName = header.querySelector("#customer-name");
    const heading = customerName?.querySelector("h1, h2, h3");
    if (!heading) return null;

    let controls = document.getElementById(IDS.projectControls);
    if (!controls) {
      controls = document.createElement("div");
      controls.id = IDS.projectControls;
      controls.className = "us-sign-design-project-controls";
      controls.setAttribute("aria-label", "Project controls");
    }

    const ussm = [...heading.querySelectorAll("span")]
      .find((element) => clean(element.textContent).toUpperCase() === "USSM") || null;
    const favorite = heading.querySelector(".toggle-favorite");

    if (ussm) {
      ussm.classList.add("us-sign-design-project-ussm");
      controls.appendChild(ussm);
    }
    if (favorite) {
      favorite.classList.add("us-sign-design-project-favorite");
      controls.appendChild(favorite);
    }

    if (controls.childElementCount && controls.parentElement !== header) header.appendChild(controls);
    return controls.childElementCount ? controls : null;
  }

  function ensureProjectIdentityRow() {
    const existing = document.getElementById(IDS.projectHeader);
    if (existing) {
      ensureProjectHeaderControls(existing);
      return existing;
    }

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
    ensureProjectHeaderControls(header);

    return header;
  }
'''
    text = replace_once(text, old_function, new_function, 'Design project identity function')
    text = replace_once(
        text,
        '      ensureOrderedBefore(workspace.workspaceBody, workspace.tableAnchor, [actionbar, overview, summary]);',
        '      ensureOrderedBefore(workspace.workspaceBody, workspace.tableAnchor, [summary, overview, actionbar]);',
        'Design information hierarchy order'
    )
    return text


def patch_full(text: str) -> str:
    text = replace_once(text, '// @version      2.2.4', '// @version      2.2.5', 'Full UI metadata version')
    text = replace_once(
        text,
        '// @description  Canonical SquareCoil Dark Glass UI with a unified Design project header, centralized Design paint, audited 14px frost, graphite surfaces, smooth shared wallpaper crossfade, semantic states, and refined spacing.',
        '// @description  Canonical SquareCoil Dark Glass UI with layered Design identity, job-state-first hierarchy, overview-before-actions spacing, audited 14px frost, graphite surfaces, shared wallpaper crossfade, and semantic states.',
        'Full UI description'
    )

    insertion = r'''

    /* =========================================================
       v2.2.5 DESIGN INFORMATION HIERARCHY
       Layer project identity vertically, keep status beside the job name,
       move native USSM/favorite controls to the far edge, then separate the
       job-state summary, overview details, and action tools into clear groups.
    ========================================================= */

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header {
      grid-template-columns: minmax(0, 1fr) auto auto !important;
      grid-template-rows: auto auto !important;
      grid-template-areas:
        "name status controls"
        "info info controls" !important;
      align-items: center !important;
      column-gap: 10px !important;
      row-gap: 7px !important;
      min-height: 82px !important;
      margin: 0 0 14px !important;
      padding: 10px 12px !important;
      overflow: hidden !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .us-sign-design-project-name {
      grid-area: name !important;
      padding: 0 !important;
      border: 0 !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-name {
      min-height: 30px !important;
      padding: 0 !important;
      justify-content: flex-start !important;
      gap: 8px !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-name :is(h1,h2,h3,.panel-title) {
      display: block !important;
      margin: 0 !important;
      font-size: clamp(20px, 1.4vw, 26px) !important;
      line-height: 1.08 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .us-sign-design-project-status {
      grid-area: status !important;
      justify-self: start !important;
      align-self: center !important;
      width: auto !important;
      min-width: 0 !important;
      max-width: 190px !important;
      min-height: 30px !important;
      height: 30px !important;
      margin: 0 !important;
      padding: 0 10px !important;
      border-radius: 8px !important;
      white-space: nowrap !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .us-sign-design-project-status > .row,
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .us-sign-design-project-status > .row > [class*="col-"] {
      display: flex !important;
      align-items: center !important;
      width: auto !important;
      min-width: 0 !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      border: 0 !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .us-sign-design-project-status > .row > [class*="col-"]:empty {
      display: none !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .us-sign-design-project-info {
      grid-area: info !important;
      padding: 0 !important;
      border: 0 !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-info,
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-info > .panel-heading {
      min-height: 28px !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-info > .panel-heading {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 0 !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-info > .panel-heading .panel-title {
      flex: 1 1 auto !important;
      min-width: 0 !important;
      font-size: 10.5px !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-info > .panel-heading > span.pull-right {
      flex: 0 0 auto !important;
      float: none !important;
      margin: 0 !important;
      text-align: right !important;
      white-space: nowrap !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-controls {
      grid-area: controls !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      align-self: center !important;
      gap: 8px !important;
      min-width: 72px !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-controls > .us-sign-design-project-ussm,
    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-controls > .us-sign-design-project-favorite {
      position: static !important;
      float: none !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: auto !important;
      min-width: 0 !important;
      height: 30px !important;
      margin: 0 !important;
      padding: 0 !important;
      line-height: 1 !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-controls > .us-sign-design-project-ussm {
      color: var(--us-accent, #83c4ff) !important;
      font-size: 13px !important;
      font-weight: 650 !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-controls > .us-sign-design-project-favorite {
      min-width: 30px !important;
      cursor: pointer !important;
      font-size: 16px !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-summary {
      margin: 0 0 12px !important;
      border: 1px solid var(--us-design-border, rgba(255,255,255,.06)) !important;
      border-radius: 12px !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-job-overview {
      margin: 0 0 12px !important;
      border: 1px solid var(--us-design-border, rgba(255,255,255,.06)) !important;
      border-radius: 12px !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-actionbar {
      margin: 0 0 14px !important;
      border: 1px solid var(--us-design-border, rgba(255,255,255,.06)) !important;
      border-radius: 12px !important;
    }

    html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-bottom-grid {
      margin-top: 0 !important;
    }

    @media (max-width: 900px) {
      html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header {
        grid-template-columns: minmax(0,1fr) auto !important;
        grid-template-areas:
          "name controls"
          "status controls"
          "info info" !important;
      }
      html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header > .us-sign-design-project-status {
        justify-self: start !important;
      }
      html.us-sign-theme-dark-glass.us-sign-design-page body #us-sign-design-project-header #customer-info > .panel-heading {
        flex-wrap: wrap !important;
      }
    }
'''

    anchor = '''\n\n  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'''
    start = text.find('       v2.2.4 DESIGN-ONLY UNIFIED PROJECT IDENTITY ROW')
    if start < 0:
        raise RuntimeError('Full UI v2.2.4 Design header marker not found')
    idx = text.find(anchor, start)
    if idx < 0:
        raise RuntimeError('Full UI main stylesheet closing anchor not found')
    text = text[:idx] + insertion + text[idx:]
    return text


design = patch_design(DESIGN.read_text(encoding='utf-8'))
full = patch_full(FULL.read_text(encoding='utf-8'))

DESIGN.write_text(design, encoding='utf-8')
FULL.write_text(full, encoding='utf-8')
(ROOT / 'tampermonkey' / 'US-Sign-Design-Job-Tools-v4.1.10.user.js').write_text(design, encoding='utf-8')
(ROOT / 'tampermonkey' / 'US-Sign-Full-UI-Theme-v2.2.5.user.js').write_text(full, encoding='utf-8')

print('Patched Design Job Tools 4.1.10 and Full UI Theme 2.2.5')
