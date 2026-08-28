'use strict';

const { normalizePreferenceSnapshot } = require('../preferences/preferences');

const STYLE_ID = 'squarecoil-companion-site-theme';
const ROOT_THEME_ATTRIBUTE = 'data-squarecoil-companion-site-theme';
const ROOT_ROUTE_ATTRIBUTE = 'data-squarecoil-companion-site-route';
const EDITOR_STYLE_ID = 'squarecoil-companion-ckeditor-document-theme';
const EDITOR_FRAME_ATTRIBUTE = 'data-squarecoil-companion-editor-frame';
const ROUTE_BY_PATH = Object.freeze({
  '/dashboard.php': 'DASHBOARD',
  '/project_milestones.php': 'PROJECT_MILESTONES',
  '/project_designs.php': 'PROJECT_DESIGNS',
  '/project_tasks.php': 'PROJECT_TASKS',
  '/project_documents.php': 'PROJECT_DOCUMENTS',
  '/project_site_photos.php': 'PROJECT_PHOTOS',
  '/project.php': 'PROJECT_OVERVIEW',
  '/projects.php': 'PROJECTS',
  '/leads.php': 'LEADS',
  '/shopping_list.php': 'SHOPPING_LIST',
  '/purchase_orders.php': 'PURCHASE_ORDERS',
  '/tracking.php': 'TRACKING',
  '/receiving.php': 'RECEIVING',
  '/schedule.php': 'SCHEDULE',
  '/calendar.php': 'INSTALL_CALENDAR',
  '/vacation_calendar.php': 'VACATION_CALENDAR',
  '/active_inventory.php': 'ACTIVE_INVENTORY',
  '/sign_criteria.php': 'SIGN_CRITERIA',
  '/branding.php': 'BRANDING',
  '/report.php': 'REPORT',
  '/reports.php': 'REPORT'
});
const EDITOR_DOCUMENT_CSS = `
html,body,body.cke_editable,body.cke_editable_themed{color:#dce5ee!important;background:#0a1118!important;background-color:#0a1118!important;background-image:none!important;caret-color:#fff!important;color-scheme:dark!important;line-height:1.58!important}
body{padding:14px 18px!important}
a{color:#8fc9ff!important}
strong,b,h1,h2,h3,h4,h5,h6{color:#f5f8fb!important}
font[color="black"],font[color="#000000"],[style*="color:black" i],[style*="color: black" i],[style*="#000000" i],[style*="rgb(0, 0, 0)" i],[style*="rgb(0,0,0)" i]{color:#e6edf4!important}
font[color="blue"],[style*="color:blue" i],[style*="color: blue" i],[style*="#0000ff" i]{color:#8fc9ff!important}
font[color="red"],[style*="color:red" i],[style*="color: red" i],[style*="#ff0000" i]{color:#ffaaa7!important}
font[color="green"],[style*="color:green" i],[style*="color: green" i],[style*="#008000" i]{color:#9ed7aa!important}
@media(forced-colors:active){html,body,body.cke_editable,body.cke_editable_themed{color:CanvasText!important;background:Canvas!important;caret-color:CanvasText!important}}
@media print{html,body,body.cke_editable,body.cke_editable_themed{color:#111!important;background:#fff!important;background-image:none!important}}
`;
const REFINED_LIGHT_CSS = `
html[${ROOT_THEME_ATTRIBUTE}="REFINED_LIGHT"] body{background:#f4f6f8;color:#18212b}
html[${ROOT_THEME_ATTRIBUTE}="REFINED_LIGHT"] header.navbar,
html[${ROOT_THEME_ATTRIBUTE}="REFINED_LIGHT"] .navbar,
html[${ROOT_THEME_ATTRIBUTE}="REFINED_LIGHT"] .card,
html[${ROOT_THEME_ATTRIBUTE}="REFINED_LIGHT"] .panel,
html[${ROOT_THEME_ATTRIBUTE}="REFINED_LIGHT"] .modal-content{background-color:#fff;color:#18212b;border-color:#d8dee5}
html[${ROOT_THEME_ATTRIBUTE}="REFINED_LIGHT"] table{background-color:#fff;color:#18212b}
html[${ROOT_THEME_ATTRIBUTE}="REFINED_LIGHT"] th{background-color:#eef2f5;color:#2d3a46}
html[${ROOT_THEME_ATTRIBUTE}="REFINED_LIGHT"] input,
html[${ROOT_THEME_ATTRIBUTE}="REFINED_LIGHT"] select,
html[${ROOT_THEME_ATTRIBUTE}="REFINED_LIGHT"] textarea{background-color:#fff;color:#18212b;border-color:#b8c2cc}
html[${ROOT_THEME_ATTRIBUTE}="REFINED_LIGHT"] :focus-visible{outline:3px solid #315c7a;outline-offset:2px}
`;
const SLEEK_DARK_CSS = `
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]{color-scheme:dark}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] body{background:#101419;color:#e7edf3}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] header.navbar,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .navbar,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .card,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .panel,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .modal-content{background-color:#191f26;color:#e7edf3;border-color:#39434d}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] table{background-color:#191f26;color:#e7edf3}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] th{background-color:#222a33;color:#f1f5f8}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] td{border-color:#39434d}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] input,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] select,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] textarea{background-color:#11161c;color:#f1f5f8;border-color:#56616c}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] a{color:#8fc4e5}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .alert-danger,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .text-danger{color:#ffb1b1}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .alert-warning,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .text-warning{color:#ffd48b}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .alert-success,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .text-success{color:#8ed8af}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] :focus-visible{outline:3px solid #8fc4e5;outline-offset:2px}

/* Read-only live-probe adapters. Keep these CSS-only and narrowly scoped. */
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .navbar .dropdown-menu.list-group.dropdown-persist,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .navbar .dropdown-menu.list-group.dropdown-persist>li,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .navbar .dropdown-menu.list-group.dropdown-persist>.list-group-item,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .navbar .dropdown-menu.list-group.dropdown-persist>.dropdown-footer{color:#cbd7e2!important;background:#07101a!important;border-color:#39434d!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .navbar .dropdown-menu.list-group.dropdown-persist :is(a,button){color:#cbd7e2!important;background:transparent!important;border-color:transparent!important;text-shadow:none!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] .navbar .dropdown-menu.list-group.dropdown-persist :is(a,button):is(:hover,:focus-visible){color:#fff!important;background:rgba(143,196,229,.16)!important}

html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"][${ROOT_ROUTE_ATTRIBUTE}="LEADS"] .admin-form :is(.gui-input,.gui-textarea,select.input-sm),
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"][${ROOT_ROUTE_ATTRIBUTE}="LEADS"] .admin-form .panel :is(input,select,textarea){color:#f1f5f8!important;background:#0b141d!important;border:1px solid #56616c!important;border-radius:8px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;color-scheme:dark!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"][${ROOT_ROUTE_ATTRIBUTE}="LEADS"] .admin-form select option{color:#f1f5f8!important;background:#0b141d!important}

html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"][${ROOT_ROUTE_ATTRIBUTE}="INSTALL_CALENDAR"] .fc .fc-day,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"][${ROOT_ROUTE_ATTRIBUTE}="INSTALL_CALENDAR"] .fc .fc-widget-content,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"][${ROOT_ROUTE_ATTRIBUTE}="INSTALL_CALENDAR"] .fc .fc-widget-header{color:#cbd7e2!important;background-color:rgba(7,16,24,.92)!important;border-color:#39434d!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"][${ROOT_ROUTE_ATTRIBUTE}="INSTALL_CALENDAR"] .fc .fc-other-month{color:rgba(203,215,226,.48)!important;background-color:#081018!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"][${ROOT_ROUTE_ATTRIBUTE}="INSTALL_CALENDAR"] .fc .fc-today{background-color:rgba(48,118,177,.28)!important;box-shadow:inset 0 0 0 1px rgba(143,196,229,.24)!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"][${ROOT_ROUTE_ATTRIBUTE}="INSTALL_CALENDAR"] .fc .fc-event{color:#f1f5f8!important;background:#111c26!important;border-width:2px!important;border-style:solid!important;border-radius:7px!important;box-shadow:0 4px 12px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.035)!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"][${ROOT_ROUTE_ATTRIBUTE}="INSTALL_CALENDAR"] .fc .fc-event :is(.fc-content,.fc-title,.event-title){background:transparent!important;text-shadow:none!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"][${ROOT_ROUTE_ATTRIBUTE}="INSTALL_CALENDAR"] .fc .fc-event .cp{height:6px!important;background:rgba(255,255,255,.075)!important;border:1px solid rgba(192,221,244,.20)!important;border-radius:999px!important;box-shadow:inset 0 1px 2px rgba(0,0,0,.32)!important}

/* B5-D vendor adapters remain presentation-only and selector-bounded. */
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) :is(.dataTables_wrapper,.dataTables_info,.dataTables_length,.dataTables_filter){color:#cbd7e2!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) .dataTables_wrapper .dataTables_paginate .paginate_button{color:#cbd7e2!important;background:#111c26!important;border:1px solid #39434d!important;border-radius:6px!important;box-shadow:none!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) .dataTables_wrapper .dataTables_paginate .paginate_button:is(:hover,.current){color:#fff!important;background:rgba(143,196,229,.16)!important;border-color:#6687a1!important}

html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) :is(.select2-container--default .select2-selection--single,.select2-container--default .select2-selection--multiple,.select2-dropdown,.select2-search--dropdown){color:#f1f5f8!important;background:#0b141d!important;border-color:#56616c!important;border-radius:8px!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) :is(.select2-selection__rendered,.select2-results__option,.select2-search__field){color:#cbd7e2!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) .select2-results__option:is(.select2-results__option--highlighted,[aria-selected="true"]){color:#fff!important;background:rgba(143,196,229,.16)!important}

html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) :is(.qtip,.qtip-titlebar,.qtip-content,.mfp-content,.fancybox-skin,.fancybox-inner){color:#cbd7e2!important;background:#111c26!important;border-color:#39434d!important;border-radius:10px!important;box-shadow:0 18px 46px rgba(0,0,0,.42)!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) :is(.mfp-bg,.fancybox-overlay){background:rgba(2,7,11,.78)!important;backdrop-filter:blur(7px) saturate(108%)!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) :is(.mfp-close,.fancybox-close,.fancybox-nav){color:#f1f5f8!important;filter:none!important;opacity:.9!important}

html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) .dropzone{color:#cbd7e2!important;background:rgba(5,13,20,.82)!important;border:1px dashed rgba(143,196,229,.46)!important;border-radius:10px!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) .dropzone.dz-drag-hover{background:rgba(143,196,229,.16)!important;border-color:#8fc4e5!important}

html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) :is(.cke,.cke_inner,.cke_top,.cke_bottom,.cke_contents,.cke_toolbox,.cke_toolgroup,.cke_combo_button){color:#cbd7e2!important;background:#0d1822!important;border-color:#39434d!important;box-shadow:none!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) .cke_contents,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) iframe.cke_wysiwyg_frame{color:#f1f5f8!important;background:#0a1118!important;border-color:#39434d!important;color-scheme:dark!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) .cke_button_icon{filter:brightness(0) invert(1)!important;opacity:.86!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) .cke_button:is(:hover,:focus-visible) .cke_button_icon,
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) .cke_button_on .cke_button_icon{opacity:1!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) .cke_button_disabled .cke_button_icon{opacity:.28!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:not([${ROOT_ROUTE_ATTRIBUTE}="GENERIC"]) :is(.cke_combo_text,.cke_combo_arrow){color:#cbd7e2!important;text-shadow:none!important}

html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:is([${ROOT_ROUTE_ATTRIBUTE}="PROJECT_MILESTONES"],[${ROOT_ROUTE_ATTRIBUTE}="SCHEDULE"]) :is(.gantt,.gantt-container,.gantt_grid,.gantt_task,.gantt_grid_scale,.gantt_task_scale,#gantt){color:#cbd7e2!important;background-color:#111c26!important;border-color:#39434d!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:is([${ROOT_ROUTE_ATTRIBUTE}="PROJECT_MILESTONES"],[${ROOT_ROUTE_ATTRIBUTE}="SCHEDULE"]) :is(.gantt_grid_head_cell,.gantt_scale_cell,.gantt_row,.gantt_task_row){color:#cbd7e2!important;background-color:#0b141d!important;border-color:#39434d!important}

html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"]:is([${ROOT_ROUTE_ATTRIBUTE}="SHOPPING_LIST"],[${ROOT_ROUTE_ATTRIBUTE}="PROJECT_MILESTONES"],[${ROOT_ROUTE_ATTRIBUTE}="INSTALL_CALENDAR"]) #content{overflow-x:auto!important;scrollbar-color:rgba(143,196,229,.45) rgba(255,255,255,.04)}

@media(max-width:1100px){
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] body.mobile-view.sb-l-m #content_wrapper{left:0!important;margin-left:0!important;width:100%!important;max-width:100%!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] body.mobile-view.sb-l-m :is(#topbar,#content){left:0!important;width:100%!important;max-width:100%!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] #content :is(.panel-body,.tab-content,.table-responsive){max-width:100%!important;overflow-x:auto!important}
}
@media(max-width:767px){
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] #content{padding:14px 10px 38px!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] #topbar{padding:9px 12px!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] :is(.panel,.well,.modal-content,.qtip,.mfp-content,.fancybox-skin){border-radius:10px!important}
}
@media(prefers-reduced-motion:reduce){
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] :is(.qtip,.mfp-content,.mfp-bg,.fancybox-skin,.fancybox-overlay,.dropzone,.cke,.select2-dropdown){animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
}
@media print{
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"],html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] body,html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] :is(#main,#content_wrapper,#content,.panel,.well,table,.table,th,td,.dataTables_wrapper,.gantt,.gantt-container){color:#111!important;background:#fff!important;border-color:#bbb!important;box-shadow:none!important;backdrop-filter:none!important;text-shadow:none!important}
html[${ROOT_THEME_ATTRIBUTE}="SLEEK_DARK"] :is(#ussign-job-timer,#squarecoil-companion-cinematic-host,#squarecoil-companion-cinematic-style,.mfp-bg,.fancybox-overlay){display:none!important}
}
`;

function classifyWebsiteRoute(location) {
  const pathname = String(location?.pathname || '').toLowerCase();
  return ROUTE_BY_PATH[pathname] || 'GENERIC';
}

function mediaListener(media, listener, enabled) {
  if (!media) return;
  const method = enabled ? 'addEventListener' : 'removeEventListener';
  if (typeof media[method] === 'function') media[method]('change', listener);
  else {
    const legacy = enabled ? 'addListener' : 'removeListener';
    if (typeof media[legacy] === 'function') media[legacy](listener);
  }
}

function createThemeService(options = {}) {
  const document = options.document;
  const window = options.window;
  if (!document || !window) throw new Error('theme-service-environment-required');
  const onChange = typeof options.onChange === 'function' ? options.onChange : () => {};
  const darkMedia = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const forcedMedia = typeof window.matchMedia === 'function' ? window.matchMedia('(forced-colors: active)') : null;
  const reducedTransparencyMedia = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-transparency: reduce)') : null;
  const nativeLogoState = new WeakMap();
  let disposed = false;
  let preferenceSnapshot = normalizePreferenceSnapshot({});
  let effective = null;
  let autoListening = false;
  let forcedListening = false;
  let reducedTransparencyListening = false;
  const editorFrameListeners = new Map();
  const editorScanTimers = new Set();

  function editorFrames() {
    return Array.from(document.querySelectorAll?.('iframe.cke_wysiwyg_frame') || []);
  }

  function editorThemeActive() {
    return document.documentElement?.getAttribute?.(ROOT_THEME_ATTRIBUTE) === 'SLEEK_DARK' &&
      document.documentElement?.getAttribute?.(ROOT_ROUTE_ATTRIBUTE) !== 'GENERIC';
  }

  function removeEditorDocumentStyle(frame) {
    try { frame?.contentDocument?.getElementById?.(EDITOR_STYLE_ID)?.remove?.(); } catch (_) {}
    frame?.removeAttribute?.(EDITOR_FRAME_ATTRIBUTE);
  }

  function applyEditorDocumentTheme(frame) {
    if (!frame || disposed || !editorThemeActive()) return false;
    if (!editorFrameListeners.has(frame) && typeof frame.addEventListener === 'function') {
      const onLoad = () => applyEditorDocumentTheme(frame);
      frame.addEventListener('load', onLoad);
      editorFrameListeners.set(frame, onLoad);
    }
    try {
      const editorDocument = frame.contentDocument;
      if (!editorDocument?.documentElement || !editorDocument?.body) return false;
      let style = editorDocument.getElementById?.(EDITOR_STYLE_ID) || null;
      if (!style) {
        style = editorDocument.createElement?.('style');
        if (!style) return false;
        style.id = EDITOR_STYLE_ID;
        style.setAttribute?.('data-squarecoil-companion-owned', 'ckeditor-document-theme');
        style.textContent = EDITOR_DOCUMENT_CSS;
        (editorDocument.head || editorDocument.documentElement).appendChild?.(style);
      }
      frame.setAttribute?.(EDITOR_FRAME_ATTRIBUTE, 'dark');
      return true;
    } catch (_) {
      return false;
    }
  }

  function scanEditorFrames() {
    if (disposed || !editorThemeActive()) return 0;
    let themed = 0;
    for (const frame of editorFrames()) if (applyEditorDocumentTheme(frame)) themed += 1;
    return themed;
  }

  function clearEditorScans() {
    if (typeof window.clearTimeout === 'function') {
      for (const timer of editorScanTimers) window.clearTimeout(timer);
    }
    editorScanTimers.clear();
  }

  function scheduleEditorScans() {
    clearEditorScans();
    if (typeof window.setTimeout !== 'function') {
      scanEditorFrames();
      return;
    }
    for (const delay of [0, 350, 1000, 2400]) {
      let timer = null;
      timer = window.setTimeout(() => {
        editorScanTimers.delete(timer);
        scanEditorFrames();
      }, delay);
      editorScanTimers.add(timer);
    }
  }

  function removeOwnedEditorTheme() {
    clearEditorScans();
    const frames = new Set([...editorFrameListeners.keys(), ...editorFrames()]);
    for (const frame of frames) {
      removeEditorDocumentStyle(frame);
      const listener = editorFrameListeners.get(frame);
      if (listener) frame.removeEventListener?.('load', listener);
    }
    editorFrameListeners.clear();
  }

  function findLogo() {
    return document.querySelector?.('header.navbar .navbar-brand img, .navbar-branding .navbar-brand img, img[src*="US-Sign" i], img[src*="USSIGN" i]') || null;
  }

  function restoreLogo() {
    const logo = findLogo();
    if (!logo) return 'native-logo-not-found';
    const original = nativeLogoState.get(logo);
    if (original) {
      if (original.src === null) logo.removeAttribute?.('src'); else logo.setAttribute?.('src', original.src);
      if (original.srcset === null) logo.removeAttribute?.('srcset'); else logo.setAttribute?.('srcset', original.srcset);
      nativeLogoState.delete(logo);
    }
    logo.removeAttribute?.('data-squarecoil-companion-logo');
    return 'native-logo';
  }

  function applyLogo(websiteTheme) {
    if (websiteTheme !== 'SLEEK_DARK') return restoreLogo();
    const configured = String(options.darkLogoUrl || '').trim();
    if (!configured) {
      restoreLogo();
      return 'native-fallback-missing-dark-logo';
    }
    let parsed;
    try { parsed = new URL(configured); } catch (_) { parsed = null; }
    if (!parsed || !['https:', 'data:'].includes(parsed.protocol) || (parsed.protocol === 'data:' && !configured.startsWith('data:image/'))) {
      restoreLogo();
      return 'native-fallback-invalid-dark-logo';
    }
    const logo = findLogo();
    if (!logo) return 'native-fallback-logo-not-found';
    if (!nativeLogoState.has(logo)) nativeLogoState.set(logo, {
      src: logo.getAttribute?.('src') ?? null,
      srcset: logo.getAttribute?.('srcset') ?? null
    });
    logo.setAttribute?.('src', configured);
    logo.removeAttribute?.('srcset');
    logo.setAttribute?.('data-squarecoil-companion-logo', 'dark');
    return 'configured-dark-logo';
  }

  function removeOwnedTheme() {
    removeOwnedEditorTheme();
    const styles = Array.from(document.querySelectorAll?.(`#${STYLE_ID}`) || []);
    for (const style of styles) style.remove?.();
    document.documentElement?.removeAttribute?.(ROOT_THEME_ATTRIBUTE);
    document.documentElement?.removeAttribute?.(ROOT_ROUTE_ATTRIBUTE);
  }

  function applyOwnedTheme(websiteTheme) {
    removeOwnedTheme();
    if (websiteTheme === 'ORIGINAL') return { layerCount: 0, status: 'native' };
    const style = document.createElement?.('style');
    if (!style) return { layerCount: 0, status: 'style-element-unavailable' };
    style.id = STYLE_ID;
    style.setAttribute('data-squarecoil-companion-owned', 'website-theme');
    style.textContent = websiteTheme === 'SLEEK_DARK' ? SLEEK_DARK_CSS : REFINED_LIGHT_CSS;
    (document.head || document.documentElement)?.appendChild?.(style);
    document.documentElement?.setAttribute?.(ROOT_THEME_ATTRIBUTE, websiteTheme);
    document.documentElement?.setAttribute?.(ROOT_ROUTE_ATTRIBUTE, classifyWebsiteRoute(window.location));
    if (websiteTheme === 'SLEEK_DARK') scheduleEditorScans();
    const duplicateLayers = Array.from(document.querySelectorAll?.(`#${STYLE_ID}`) || []);
    for (const duplicate of duplicateLayers.slice(1)) duplicate.remove?.();
    return { layerCount: Math.min(1, duplicateLayers.length || 1), status: 'applied' };
  }

  function glassSupported() {
    if (forcedMedia?.matches || reducedTransparencyMedia?.matches) return false;
    const css = window.CSS || globalThis.CSS;
    return Boolean(css && typeof css.supports === 'function' &&
      (css.supports('backdrop-filter', 'blur(2px)') || css.supports('-webkit-backdrop-filter', 'blur(2px)')));
  }

  function resolve() {
    const forced = forcedMedia?.matches === true;
    const timerAppearanceEffective = preferenceSnapshot.timerAppearance === 'AUTO'
      ? darkMedia?.matches === true ? 'DARK' : 'LIGHT'
      : preferenceSnapshot.timerAppearance;
    const panelFinishEffective = preferenceSnapshot.panelFinish === 'GLASS' && !glassSupported()
      ? 'SOLID_FALLBACK' : preferenceSnapshot.panelFinish;
    const websiteThemeEffective = forced ? 'ORIGINAL' : preferenceSnapshot.websiteTheme;
    const themeResult = applyOwnedTheme(websiteThemeEffective);
    const logoStatus = applyLogo(websiteThemeEffective);
    return Object.freeze({
      preferenceRevision: preferenceSnapshot.preferenceRevision,
      timerAppearancePreference: preferenceSnapshot.timerAppearance,
      timerAppearanceEffective,
      panelFinishPreference: preferenceSnapshot.panelFinish,
      panelFinishEffective,
      websiteThemePreference: preferenceSnapshot.websiteTheme,
      websiteThemeEffective,
      autoSignalAvailable: Boolean(darkMedia),
      forcedColors: forced,
      reducedTransparency: reducedTransparencyMedia?.matches === true,
      ownedThemeLayerCount: themeResult.layerCount,
      websiteThemeStatus: themeResult.status,
      logoStatus
    });
  }

  function publishIfChanged(next) {
    const changed = JSON.stringify(next) !== JSON.stringify(effective);
    effective = next;
    if (changed) {
      try { onChange(next); } catch (_) {}
    }
    return effective;
  }

  function onMediaChange() {
    if (disposed) return;
    publishIfChanged(resolve());
  }

  function onDocumentReady() {
    if (disposed) return;
    publishIfChanged(resolve());
  }

  function syncListeners() {
    const shouldAutoListen = preferenceSnapshot.timerAppearance === 'AUTO' && Boolean(darkMedia);
    if (shouldAutoListen !== autoListening) {
      mediaListener(darkMedia, onMediaChange, shouldAutoListen);
      autoListening = shouldAutoListen;
    }
    if (!forcedListening && forcedMedia) {
      mediaListener(forcedMedia, onMediaChange, true);
      forcedListening = true;
    }
    const shouldReducedTransparencyListen = preferenceSnapshot.panelFinish === 'GLASS' && Boolean(reducedTransparencyMedia);
    if (shouldReducedTransparencyListen !== reducedTransparencyListening) {
      mediaListener(reducedTransparencyMedia, onMediaChange, shouldReducedTransparencyListen);
      reducedTransparencyListening = shouldReducedTransparencyListen;
    }
  }

  function apply(preferences) {
    if (disposed) throw new Error('theme-service-disposed');
    const nextPreferences = normalizePreferenceSnapshot(preferences);
    if (effective && JSON.stringify(nextPreferences) === JSON.stringify(preferenceSnapshot)) return effective;
    preferenceSnapshot = nextPreferences;
    syncListeners();
    return publishIfChanged(resolve());
  }

  function snapshot() {
    return effective || apply(preferenceSnapshot);
  }

  function teardown() {
    if (disposed) return;
    disposed = true;
    if (autoListening) mediaListener(darkMedia, onMediaChange, false);
    if (forcedListening) mediaListener(forcedMedia, onMediaChange, false);
    if (reducedTransparencyListening) mediaListener(reducedTransparencyMedia, onMediaChange, false);
    autoListening = false;
    forcedListening = false;
    reducedTransparencyListening = false;
    document.removeEventListener?.('DOMContentLoaded', onDocumentReady);
    window.removeEventListener?.('pageshow', onDocumentReady);
    removeOwnedTheme();
    restoreLogo();
  }

  document.addEventListener?.('DOMContentLoaded', onDocumentReady);
  window.addEventListener?.('pageshow', onDocumentReady);

  return Object.freeze({ apply, snapshot, teardown });
}

module.exports = { STYLE_ID, ROOT_THEME_ATTRIBUTE, ROOT_ROUTE_ATTRIBUTE, EDITOR_STYLE_ID, EDITOR_FRAME_ATTRIBUTE,
  ROUTE_BY_PATH, classifyWebsiteRoute, createThemeService };
