// ==UserScript==
// @name         US Sign All-in-One
// @namespace    https://ussignandmill.squarecoil.net/
// @version      1.0.1
// @description  Lightweight dark reskin, stable Scope menu, readable modified text, logo repair, and Design metadata.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  const VERSION = "1.0.1";

  GM_addStyle(String.raw`
    :root {
      --us-bg: #101318;
      --us-panel: #1a1f26;
      --us-panel-2: #20262e;
      --us-border: rgba(255,255,255,.10);
      --us-border-2: rgba(255,255,255,.17);
      --us-text: #eef2f5;
      --us-soft: #c5ced6;
      --us-muted: #8f9aa6;
      --us-blue: #b7cee2;
      --us-red: #dfb2b2;
      --us-green: #b6d5bd;
      --us-gold: #dcc899;
      --us-radius: 10px;
      --us-shadow: 0 12px 30px rgba(0,0,0,.28);
      --us-font: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    html.us-sign-ui,
    html.us-sign-ui body {
      min-height: 100%;
      background: var(--us-bg) !important;
      color: var(--us-text) !important;
      font-family: var(--us-font) !important;
    }

    html.us-sign-ui *,
    html.us-sign-ui *::before,
    html.us-sign-ui *::after { box-sizing: border-box; }

    html.us-sign-ui body,
    html.us-sign-ui input,
    html.us-sign-ui textarea,
    html.us-sign-ui select,
    html.us-sign-ui button { font-family: var(--us-font) !important; }

    html.us-sign-ui #main,
    html.us-sign-ui #content,
    html.us-sign-ui #content_wrapper,
    html.us-sign-ui .tray,
    html.us-sign-ui .tray-center,
    html.us-sign-ui .container,
    html.us-sign-ui .container-fluid {
      background: transparent !important;
      color: var(--us-text) !important;
    }

    html.us-sign-ui header.navbar,
    html.us-sign-ui .navbar,
    html.us-sign-ui #sidebar_left,
    html.us-sign-ui #pmlt {
      background: #15191f !important;
      background-image: none !important;
      color: var(--us-soft) !important;
      border-color: var(--us-border) !important;
      box-shadow: none !important;
    }

    html.us-sign-ui header.navbar {
      border-bottom: 1px solid var(--us-border) !important;
      box-shadow: 0 5px 18px rgba(0,0,0,.22) !important;
    }

    html.us-sign-ui header.navbar a,
    html.us-sign-ui .navbar a,
    html.us-sign-ui #sidebar_left a,
    html.us-sign-ui #pmlt a,
    html.us-sign-ui #project_menu a {
      color: var(--us-soft) !important;
      background: transparent !important;
      text-shadow: none !important;
    }

    html.us-sign-ui header.navbar a:hover,
    html.us-sign-ui .navbar a:hover,
    html.us-sign-ui #sidebar_left a:hover,
    html.us-sign-ui #pmlt a:hover,
    html.us-sign-ui #project_menu a:hover,
    html.us-sign-ui #project_menu a.selected {
      color: #fff !important;
      background: rgba(255,255,255,.06) !important;
    }

    html.us-sign-ui header.navbar .navbar-brand,
    html.us-sign-ui header.navbar .navbar-branding {
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      overflow: visible !important;
    }

    html.us-sign-ui header.navbar .navbar-brand img {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      width: auto !important;
      max-width: 175px !important;
      height: auto !important;
      max-height: 52px !important;
      object-fit: contain !important;
      filter: none !important;
      background: transparent !important;
    }

    html.us-sign-ui .panel,
    html.us-sign-ui .panel-default,
    html.us-sign-ui .well,
    html.us-sign-ui .modal-content,
    html.us-sign-ui .popover,
    html.us-sign-ui #customer-info,
    html.us-sign-ui #customer-name,
    html.us-sign-ui #descriptionbox,
    html.us-sign-ui #designbox,
    html.us-sign-ui #filesbox,
    html.us-sign-ui #projectbox,
    html.us-sign-ui .note-editor,
    html.us-sign-ui .cke {
      background: var(--us-panel) !important;
      background-image: none !important;
      color: var(--us-text) !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius) !important;
      box-shadow: var(--us-shadow) !important;
    }

    html.us-sign-ui .panel-heading,
    html.us-sign-ui .panel-footer,
    html.us-sign-ui .modal-header,
    html.us-sign-ui .modal-footer,
    html.us-sign-ui .cke_top,
    html.us-sign-ui .cke_bottom {
      background: var(--us-panel-2) !important;
      background-image: none !important;
      color: var(--us-text) !important;
      border-color: var(--us-border) !important;
      box-shadow: none !important;
    }

    html.us-sign-ui .panel-body,
    html.us-sign-ui .modal-body,
    html.us-sign-ui .popover-content {
      background: transparent !important;
      color: var(--us-soft) !important;
    }

    html.us-sign-ui h1,
    html.us-sign-ui h2,
    html.us-sign-ui h3,
    html.us-sign-ui h4,
    html.us-sign-ui h5,
    html.us-sign-ui h6,
    html.us-sign-ui strong,
    html.us-sign-ui b,
    html.us-sign-ui .panel-title { color: var(--us-text) !important; text-shadow: none !important; }

    html.us-sign-ui p,
    html.us-sign-ui li,
    html.us-sign-ui label,
    html.us-sign-ui td,
    html.us-sign-ui th,
    html.us-sign-ui address { color: var(--us-soft) !important; }

    html.us-sign-ui a { color: #d0dae2 !important; text-decoration: none !important; }
    html.us-sign-ui a:hover { color: #fff !important; }

    html.us-sign-ui input,
    html.us-sign-ui textarea,
    html.us-sign-ui select,
    html.us-sign-ui .form-control,
    html.us-sign-ui .cke_combo_button,
    html.us-sign-ui .cke_toolgroup {
      background: #11161c !important;
      background-image: none !important;
      color: var(--us-text) !important;
      border: 1px solid var(--us-border-2) !important;
      border-radius: 7px !important;
      box-shadow: none !important;
    }

    html.us-sign-ui .btn,
    html.us-sign-ui button,
    html.us-sign-ui input[type="button"],
    html.us-sign-ui input[type="submit"] {
      min-height: 34px !important;
      padding: 7px 12px !important;
      background: rgba(255,255,255,.055) !important;
      background-image: none !important;
      color: var(--us-text) !important;
      border: 1px solid var(--us-border-2) !important;
      border-radius: 7px !important;
      text-shadow: none !important;
      box-shadow: none !important;
    }

    html.us-sign-ui .btn:hover,
    html.us-sign-ui button:hover,
    html.us-sign-ui input[type="button"]:hover,
    html.us-sign-ui input[type="submit"]:hover {
      background: rgba(255,255,255,.095) !important;
      border-color: rgba(255,255,255,.25) !important;
      color: #fff !important;
    }

    html.us-sign-ui table,
    html.us-sign-ui .table,
    html.us-sign-ui table th,
    html.us-sign-ui table td,
    html.us-sign-ui .table th,
    html.us-sign-ui .table td {
      background: transparent !important;
      color: var(--us-soft) !important;
      border-color: var(--us-border) !important;
    }

    html.us-sign-ui .dropdown-menu,
    html.us-sign-ui .popover {
      background: #151a20 !important;
      color: var(--us-soft) !important;
      border: 1px solid var(--us-border-2) !important;
      border-radius: 9px !important;
      box-shadow: var(--us-shadow) !important;
    }

    html.us-sign-ui .dropdown-menu > li > a { color: var(--us-soft) !important; background: transparent !important; }
    html.us-sign-ui .dropdown-menu > li > a:hover { color: #fff !important; background: rgba(255,255,255,.065) !important; }

    html.us-sign-ui .cke_wysiwyg_frame,
    html.us-sign-ui .cke_contents { background: #0d1116 !important; }

    html.us-sign-ui .us-scope-well { overflow: visible !important; }

    html.us-sign-ui .us-scope-title {
      display: block !important;
      margin: 0 0 10px !important;
      color: var(--us-text) !important;
      font-size: 14px !important;
      font-weight: 650 !important;
    }

    html.us-sign-ui .us-scope-well .multiselect-native-select,
    html.us-sign-ui .us-scope-well .multiselect-native-select > .btn-group,
    html.us-sign-ui .us-scope-well .btn-group {
      position: relative !important;
      overflow: visible !important;
    }

    html.us-sign-ui .us-scope-well .multiselect-container.dropdown-menu {
      position: absolute !important;
      inset: auto 0 auto auto !important;
      top: calc(100% + 6px) !important;
      z-index: 100000 !important;
      width: min(430px, calc(100vw - 36px)) !important;
      min-width: 100% !important;
      max-height: 360px !important;
      margin: 0 !important;
      padding: 6px !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      transform: none !important;
    }

    html.us-sign-ui .us-scope-well .btn-group.open > .multiselect-container.dropdown-menu,
    html.us-sign-ui .us-scope-well .multiselect-container.dropdown-menu.show { display: block !important; }

    html.us-sign-ui #us-sign-design-meta {
      display: grid;
      grid-template-columns: repeat(2, minmax(0,1fr));
      gap: 8px;
      margin: 0 0 12px;
      padding: 10px;
      background: var(--us-panel);
      border: 1px solid var(--us-border);
      border-radius: var(--us-radius);
      box-shadow: var(--us-shadow);
    }

    html.us-sign-ui #us-sign-design-meta .us-meta-item {
      padding: 8px 10px;
      background: rgba(255,255,255,.028);
      border: 1px solid var(--us-border);
      border-radius: 8px;
    }

    html.us-sign-ui #us-sign-design-meta .us-meta-label {
      display: block;
      margin-bottom: 3px;
      color: var(--us-muted) !important;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    html.us-sign-ui #us-sign-design-meta .us-meta-value { color: var(--us-text) !important; font-size: 12px; font-weight: 600; }

    html.us-sign-ui [style*="color: blue" i],
    html.us-sign-ui [style*="color:blue" i],
    html.us-sign-ui [style*="#0000ff" i],
    html.us-sign-ui [style*="#00f" i],
    html.us-sign-ui [style*="rgb(0, 0, 255)" i],
    html.us-sign-ui font[color="blue" i],
    html.us-sign-ui font[color="#0000ff" i] {
      color: var(--us-blue) !important;
      -webkit-text-fill-color: var(--us-blue) !important;
      text-shadow: none !important;
      filter: none !important;
    }

    html.us-sign-ui [style*="color: red" i],
    html.us-sign-ui [style*="color:red" i],
    html.us-sign-ui [style*="#ff0000" i],
    html.us-sign-ui font[color="red" i] {
      color: var(--us-red) !important;
      -webkit-text-fill-color: var(--us-red) !important;
    }

    html.us-sign-ui [style*="color: green" i],
    html.us-sign-ui [style*="color:green" i],
    html.us-sign-ui [style*="#008000" i],
    html.us-sign-ui [style*="#00ff00" i],
    html.us-sign-ui font[color="green" i] {
      color: var(--us-green) !important;
      -webkit-text-fill-color: var(--us-green) !important;
    }

    html.us-sign-ui mark,
    html.us-sign-ui [style*="background-color: yellow" i],
    html.us-sign-ui [style*="background: yellow" i],
    html.us-sign-ui [style*="#ffff00" i] {
      color: var(--us-text) !important;
      -webkit-text-fill-color: var(--us-text) !important;
      background: rgba(220,200,153,.19) !important;
      border-radius: 4px !important;
    }

    @media (max-width: 760px) {
      html.us-sign-ui #us-sign-design-meta { grid-template-columns: minmax(0,1fr); }
      html.us-sign-ui .us-scope-well .multiselect-container.dropdown-menu { right: auto !important; left: 0 !important; }
    }
  `);

  const clean = (value) => String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

  function repairLogo() {
    const logo = document.querySelector("header.navbar .navbar-brand img") || document.querySelector('img[src*="US-Sign" i]');
    if (!logo) return;
    logo.src = new URL("images/US-Sign&-Mill-Logo - sized for SC site.png", location.href).href;
    logo.removeAttribute("srcset");
    logo.removeAttribute("hidden");
  }

  function findOpenDate() {
    const text = clean(document.querySelector("#customer-info")?.textContent);
    return clean(text.match(/(?:OPEN\s*DATE|DATE\s*OPENED|OPENED)\s*:?[\s-]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i)?.[1]);
  }

  function findProjectManager() {
    const rail = document.querySelector("#pmlt");
    if (!rail) return "";
    const walker = document.createTreeWalker(rail, NodeFilter.SHOW_TEXT);
    const values = [];
    let node = walker.nextNode();
    while (node) {
      const value = clean(node.nodeValue).replace(/[–—]/g, "-");
      if (value) values.push(value);
      node = walker.nextNode();
    }
    for (let i = 0; i < values.length; i += 1) {
      const same = values[i].match(/(?:^|\b)(?:PM|PROJECT MANAGER)\s*[-:]\s*(.+)$/i);
      if (same?.[1]) return clean(same[1]);
      if (/^(?:PM|PROJECT MANAGER)\s*[-:]?$/i.test(values[i])) return clean(values[i + 1]);
    }
    return "";
  }

  function initScope() {
    const select = document.querySelector("#ps-select");
    const description = document.querySelector("textarea#description");
    if (!select || !description) return;
    const well = select.closest(".well");
    if (!well || well.dataset.usSignScope === VERSION) return;
    well.dataset.usSignScope = VERSION;
    well.classList.add("us-scope-well");
    const titles = [...well.querySelectorAll("strong,b,h1,h2,h3,h4,label")].filter((el) => clean(el.textContent).replace(/:+$/, "").toLowerCase() === "scope of work");
    titles.forEach((el, index) => {
      if (index === 0) {
        el.classList.add("us-scope-title");
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    });
  }

  function initDesignMeta() {
    const designPage = /design/i.test(location.pathname) || Boolean(document.querySelector("#designbox"));
    if (!designPage || document.getElementById("us-sign-design-meta")) return;
    const meta = document.createElement("section");
    meta.id = "us-sign-design-meta";
    meta.innerHTML = '<div class="us-meta-item"><span class="us-meta-label">Project Manager</span><span class="us-meta-value"></span></div><div class="us-meta-item"><span class="us-meta-label">Open Date</span><span class="us-meta-value"></span></div>';
    const values = meta.querySelectorAll(".us-meta-value");
    values[0].textContent = findProjectManager() || "Not detected";
    values[1].textContent = findOpenDate() || "Not detected";
    const customer = document.querySelector("#customer-info");
    const target = customer || document.querySelector("#designbox") || document.querySelector("#content .tray-center");
    if (!target) return;
    if (customer) customer.insertAdjacentElement("afterend", meta);
    else target.prepend(meta);
  }

  function normalizeColors(root) {
    if (!root || root.dataset.usSignColors === VERSION) return;
    root.dataset.usSignColors = VERSION;
    const elements = [root, ...root.querySelectorAll("span,font,p,div,li,td,th,a,strong,b,mark")];
    for (const el of elements) {
      const match = getComputedStyle(el).color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
      if (!match) continue;
      const r = Number(match[1]);
      const g = Number(match[2]);
      const b = Number(match[3]);
      if (Math.max(r,g,b) - Math.min(r,g,b) < 100) continue;
      let color = "";
      if (b > r * 1.35 && b > g * 1.2) color = "#b7cee2";
      else if (r > g * 1.35 && r > b * 1.25) color = "#dfb2b2";
      else if (g > r * 1.2 && g > b * 1.1) color = "#b6d5bd";
      if (!color) continue;
      el.style.setProperty("color", color, "important");
      el.style.setProperty("-webkit-text-fill-color", color, "important");
      el.style.setProperty("text-shadow", "none", "important");
      el.style.setProperty("filter", "none", "important");
    }
  }

  function initReadableColors() {
    document.querySelectorAll("#descriptionbox,#designbox,.us-sign-description-panel").forEach(normalizeColors);
    document.querySelectorAll("iframe.cke_wysiwyg_frame").forEach((iframe) => {
      const process = () => {
        try {
          const doc = iframe.contentDocument;
          if (!doc?.body) return;
          if (!doc.getElementById("us-sign-editor-style")) {
            const style = doc.createElement("style");
            style.id = "us-sign-editor-style";
            style.textContent = 'html,body{background:#0d1116!important;color:#c5ced6!important;font-family:Inter,system-ui,sans-serif!important}body{padding:12px 16px!important;line-height:1.55!important}a{color:#b7cee2!important}strong,b,h1,h2,h3,h4{color:#eef2f5!important}mark{color:#eef2f5!important;background:rgba(220,200,153,.19)!important}';
            doc.head.appendChild(style);
          }
          normalizeColors(doc.body);
        } catch {}
      };
      iframe.addEventListener("load", process, { once: true });
      process();
    });
  }

  function init() {
    document.documentElement.classList.add("us-sign-ui");
    document.documentElement.dataset.usSignAllInOne = VERSION;
    repairLogo();
    initScope();
    initDesignMeta();
    initReadableColors();
  }

  document.documentElement.classList.add("us-sign-ui");
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
  window.addEventListener("load", init, { once: true });
  window.setTimeout(init, 700);
})();
