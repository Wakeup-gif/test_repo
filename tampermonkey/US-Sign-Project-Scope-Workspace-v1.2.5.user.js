// ==UserScript==
// @name         US Sign Project and Scope Workspace
// @namespace    us-sign-full-modules
// @version      1.2.5
// @description  Preserves native Status and repairs the live Scope editor around its actual SquareCoil DOM with aligned controls, true glass, and a cleaner CKEditor formatting toolbar.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Project-Scope-Workspace.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Project-Scope-Workspace.user.js
// ==/UserScript==

(function () {
  "use strict";

  // The Status/Milestones page has its own native split-pane layout. This
  // workspace is intentionally excluded so Scope grid rules cannot reshape it.
  if (/\/project_milestones\.php$/i.test(location.pathname)) return;

  GM_addStyle(String.raw`
    :root {
      --us-ws-bg: rgba(7, 16, 27, 0.16);
      --us-ws-soft-bg: rgba(122, 190, 244, 0.035);
      --us-ws-line: var(--us-border, rgba(214, 237, 255, 0.09));
      --us-ws-line-strong: var(--us-border-strong, rgba(220, 241, 255, 0.15));
      --us-ws-text: var(--us-text, #f4f6f8);
      --us-ws-soft: var(--us-text-soft, #c9ced5);
      --us-ws-muted: var(--us-text-muted, #8f98a3);
      --us-ws-accent: var(--us-accent-soft, rgba(72, 160, 231, 0.18));
      --us-ws-radius: var(--us-radius-lg, 14px);
      --us-ws-radius-sm: var(--us-radius-sm, 7px);
      --us-ws-shadow: 0 10px 28px rgba(0, 0, 0, 0.085), inset 0 1px 0 rgba(255, 255, 255, 0.035);
    }

    /* =====================================================
       PROJECT PAGE GRID
       Customer information = 2/8
       Important Notes      = 6/8
       Scope of Work        = full width below
    ===================================================== */

    html body:has(#pmlt)
    #content
    .tray-center
    > .pl15.pr15:has(> .row.no-gutter > #customer-info):has(> .well .important-notes) {
      box-sizing: border-box !important;
      display: grid !important;
      grid-template-columns: repeat(8, minmax(0, 1fr)) !important;
      grid-auto-flow: row !important;
      grid-auto-rows: max-content !important;
      gap: 12px !important;
      align-items: stretch !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 12px 12px !important;
    }

    html body:has(#pmlt)
    #content
    .tray-center
    > .pl15.pr15:has(> .row.no-gutter > #customer-info)
    > .alert.alert-micro {
      grid-column: 1 / -1 !important;
      grid-row: 1 !important;
      width: 100% !important;
      margin: 0 !important;
    }

    html body:has(#pmlt)
    #content
    .tray-center
    > .pl15.pr15:has(> .row.no-gutter > #customer-info)
    > .row.no-gutter:has(> #customer-name) {
      grid-column: 1 / -1 !important;
      grid-row: 2 !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    html body:has(#pmlt)
    #content
    .tray-center
    > .pl15.pr15
    > .row.no-gutter:has(> #customer-info) {
      grid-column: 1 / span 2 !important;
      grid-row: 3 !important;
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      float: none !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      transform: none !important;
    }

    html body:has(#pmlt)
    #content
    .tray-center
    > .pl15.pr15
    > .row.no-gutter:has(> #customer-info)::before,
    html body:has(#pmlt)
    #content
    .tray-center
    > .pl15.pr15
    > .row.no-gutter:has(> #customer-info)::after {
      content: none !important;
      display: none !important;
    }

    html body:has(#pmlt)
    #content
    .tray-center
    > .pl15.pr15
    > .well:has(.important-notes) {
      box-sizing: border-box !important;
      grid-column: 3 / span 6 !important;
      grid-row: 3 !important;
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      align-self: stretch !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 13px !important;
      overflow: visible !important;
      color: var(--us-ws-soft) !important;
      background: var(--us-ws-bg) !important;
      background-image: none !important;
      border: 1px solid var(--us-ws-line) !important;
      border-radius: var(--us-ws-radius) !important;
      box-shadow: var(--us-ws-shadow) !important;
      transform: none !important;
    }

    html body:has(#pmlt)
    #content
    .tray-center
    > .pl15.pr15
    > .well:has(#ps-select),
    html body:has(#pmlt)
    #content
    .tray-center
    > .pl15.pr15
    > .well.us-sign-scope-enhanced {
      box-sizing: border-box !important;
      grid-column: 1 / -1 !important;
      grid-row: 4 !important;
      position: relative !important;
      float: none !important;
      clear: both !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 12px !important;
      overflow: visible !important;
      color: var(--us-ws-soft) !important;
      background: var(--us-ws-bg) !important;
      background-image: none !important;
      border: 1px solid var(--us-ws-line) !important;
      border-radius: var(--us-ws-radius) !important;
      box-shadow: var(--us-ws-shadow) !important;
      transform: none !important;
    }

    /* =====================================================
       CUSTOMER CARD
       Preserve heading -> body -> row -> column nesting.
    ===================================================== */

    html body:has(#pmlt) #customer-info {
      box-sizing: border-box !important;
      position: relative !important;
      inset: auto !important;
      display: flex !important;
      flex: 1 1 auto !important;
      flex-direction: column !important;
      float: none !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      color: var(--us-ws-soft) !important;
      background: var(--us-ws-bg) !important;
      background-image: none !important;
      border: 1px solid var(--us-ws-line) !important;
      border-radius: var(--us-ws-radius) !important;
      box-shadow: var(--us-ws-shadow) !important;
      transform: none !important;
    }

    html body:has(#pmlt) #customer-info::before,
    html body:has(#pmlt) #customer-info::after,
    html body:has(#pmlt) #customer-info > .panel-body > .row::before,
    html body:has(#pmlt) #customer-info > .panel-body > .row::after {
      content: none !important;
      display: none !important;
    }

    /* Header has two real columns: address/date and Nearby Vendors. */
    html body:has(#pmlt) #customer-info > .panel-heading {
      box-sizing: border-box !important;
      position: relative !important;
      inset: auto !important;
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) auto !important;
      grid-template-areas:
        "address vendor"
        "date vendor" !important;
      gap: 4px 8px !important;
      align-items: center !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 9px 10px !important;
      overflow: visible !important;
      background: var(--us-ws-soft-bg) !important;
      background-image: none !important;
      border: 0 !important;
      border-bottom: 1px solid var(--us-ws-line) !important;
      border-radius: var(--us-ws-radius) var(--us-ws-radius) 0 0 !important;
      box-shadow: none !important;
      transform: none !important;
    }

    html body:has(#pmlt) #customer-info > .panel-heading .panel-title {
      grid-area: address !important;
      position: static !important;
      inset: auto !important;
      display: block !important;
      float: none !important;
      width: auto !important;
      min-width: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      color: var(--us-ws-soft) !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      line-height: 1.38 !important;
      text-transform: none !important;
      overflow-wrap: anywhere !important;
      transform: none !important;
    }

    html body:has(#pmlt) #customer-info > .panel-heading > span.pull-right {
      grid-area: date !important;
      position: static !important;
      inset: auto !important;
      display: block !important;
      float: none !important;
      width: auto !important;
      max-width: 100% !important;
      min-width: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      color: var(--us-ws-muted) !important;
      font-size: 10px !important;
      font-weight: 550 !important;
      line-height: 1.3 !important;
      text-align: left !important;
      white-space: normal !important;
      transform: none !important;
    }

    html body:has(#pmlt) #customer-info > .panel-heading > a.btn.pull-right {
      grid-area: vendor !important;
      position: static !important;
      inset: auto !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      align-self: center !important;
      float: none !important;
      width: auto !important;
      min-width: 0 !important;
      min-height: 30px !important;
      height: auto !important;
      margin: 0 !important;
      padding: 6px 9px !important;
      color: var(--us-ws-soft) !important;
      background: rgba(255, 255, 255, 0.035) !important;
      border: 1px solid var(--us-ws-line-strong) !important;
      border-radius: var(--us-ws-radius-sm) !important;
      font-size: 10px !important;
      line-height: 1.2 !important;
      text-align: center !important;
      white-space: normal !important;
      text-transform: none !important;
      transform: none !important;
    }

    /* The body remains a normal nested flow. */
    html body:has(#pmlt) #customer-info > .panel-body {
      box-sizing: border-box !important;
      position: static !important;
      display: block !important;
      flex: 1 1 auto !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 10px !important;
      overflow: visible !important;
      background: transparent !important;
      border: 0 !important;
      transform: none !important;
    }

    html body:has(#pmlt) #customer-info > .panel-body > .row {
      box-sizing: border-box !important;
      position: static !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 10px !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      transform: none !important;
    }

    html body:has(#pmlt) #customer-info > .panel-body > .row > [class*="col-"] {
      box-sizing: border-box !important;
      position: static !important;
      inset: auto !important;
      display: block !important;
      flex: 0 0 auto !important;
      float: none !important;
      clear: both !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      transform: none !important;
    }

    /* Explicitly defeat the native inline height:300px map column. */
    html body:has(#pmlt) #customer-info > .panel-body > .row > [style*="height" i] {
      min-height: 0 !important;
      height: auto !important;
      max-height: none !important;
    }

    html body:has(#pmlt) #customer-info address {
      position: static !important;
      inset: auto !important;
      display: block !important;
      float: none !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: auto !important;
      margin: 0 0 10px !important;
      padding: 0 !important;
      color: var(--us-ws-soft) !important;
      font-size: 11px !important;
      font-style: normal !important;
      line-height: 1.45 !important;
      overflow-wrap: anywhere !important;
      white-space: normal !important;
      transform: none !important;
    }

    html body:has(#pmlt) #customer-info address:last-of-type {
      margin-bottom: 0 !important;
    }

    html body:has(#pmlt) #customer-info address strong {
      display: block !important;
      margin: 0 0 2px !important;
      color: var(--us-ws-text) !important;
      font-size: 10.5px !important;
      font-weight: 650 !important;
      line-height: 1.3 !important;
    }

    html body:has(#pmlt) #customer-info > .panel-body > .row > [class*="col-"] > br {
      display: none !important;
    }

    html body:has(#pmlt) #customer-info #showbtns {
      box-sizing: border-box !important;
      position: static !important;
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) !important;
      gap: 7px !important;
      width: 100% !important;
      min-width: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      transform: none !important;
    }

    html body:has(#pmlt) #customer-info #showbtns br {
      display: none !important;
    }

    html body:has(#pmlt) #customer-info #showbtns .btn {
      position: static !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 30px !important;
      height: auto !important;
      margin: 0 !important;
      padding: 6px 8px !important;
      color: var(--us-ws-soft) !important;
      background: rgba(255, 255, 255, 0.028) !important;
      border: 1px solid var(--us-ws-line) !important;
      border-radius: var(--us-ws-radius-sm) !important;
      font-size: 10.5px !important;
      line-height: 1.2 !important;
      text-transform: none !important;
      transform: none !important;
    }

    html body:has(#pmlt) #customer-info #mapcontainer {
      position: static !important;
      display: block !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: transparent !important;
      border: 0 !important;
      border-radius: var(--us-ws-radius-sm) !important;
      box-shadow: none !important;
      transform: none !important;
    }

    html body:has(#pmlt) #customer-info #mapcontainer:has(> :not(script):not(style)) {
      min-height: 180px !important;
      height: 180px !important;
      margin-top: 8px !important;
      background: rgba(255, 255, 255, 0.02) !important;
      border: 1px solid var(--us-ws-line) !important;
    }

    /* =====================================================
       IMPORTANT NOTES
    ===================================================== */

    html body:has(#pmlt) .well:has(.important-notes) > strong:first-child {
      display: block !important;
      margin: 0 0 10px !important;
      color: var(--us-ws-text) !important;
      font-size: 13px !important;
      font-weight: 650 !important;
      line-height: 1.25 !important;
    }

    html body:has(#pmlt) .well:has(.important-notes) > br:first-of-type,
    html body:has(#pmlt) .well:has(.important-notes) textarea.important-notes + br {
      display: none !important;
    }

    html body:has(#pmlt) .well:has(.important-notes) > form {
      display: flex !important;
      flex: 1 1 auto !important;
      flex-direction: column !important;
      width: 100% !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    html body:has(#pmlt) .well:has(.important-notes) textarea.important-notes {
      flex: 1 1 auto !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 150px !important;
      height: auto !important;
      max-height: 420px !important;
      margin: 0 !important;
      padding: 10px 11px !important;
      resize: vertical !important;
      color: var(--us-ws-soft) !important;
      background: rgba(255, 255, 255, 0.024) !important;
      border: 1px solid var(--us-ws-line) !important;
      border-radius: var(--us-ws-radius-sm) !important;
      box-shadow: none !important;
      font-size: 11.5px !important;
      line-height: 1.48 !important;
    }

    html body:has(#pmlt) .well:has(.important-notes) input[type="submit"] {
      align-self: flex-start !important;
      min-height: 31px !important;
      margin: 9px 0 0 !important;
      padding: 6px 10px !important;
      font-size: 10.5px !important;
      text-transform: none !important;
    }

    /* =====================================================
       SCOPE OF WORK
       Works with both native markup and UI Runtime Fixes.
    ===================================================== */

    html body:has(#pmlt) .well.us-sign-scope-enhanced {
      display: flex !important;
      flex-direction: column !important;
      gap: 10px !important;
    }

    html body:has(#pmlt)
    .well.us-sign-scope-enhanced
    > :is(
      strong.us-sign-scope-native-title,
      br.us-sign-scope-native-title-break,
      .us-sign-scope-native-controls
    ) {
      display: none !important;
    }

    html body:has(#pmlt) #us-sign-scope-header {
      box-sizing: border-box !important;
      position: relative !important;
      z-index: 3000 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 12px !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 36px !important;
      margin: 0 !important;
      padding: 0 0 9px !important;
      overflow: visible !important;
      border-bottom: 1px solid var(--us-ws-line) !important;
    }

    html body:has(#pmlt) #us-sign-scope-header > .us-sign-scope-title {
      display: block !important;
      flex: 0 0 auto !important;
      width: auto !important;
      min-width: max-content !important;
      margin: 0 !important;
      padding: 0 !important;
      color: var(--us-ws-text) !important;
      font-size: 14px !important;
      font-weight: 650 !important;
      line-height: 1.2 !important;
      text-transform: none !important;
    }

    html body:has(#pmlt) #us-sign-scope-header > .us-sign-scope-controls {
      position: relative !important;
      z-index: 3100 !important;
      display: grid !important;
      grid-template-columns: minmax(260px, 420px) auto !important;
      gap: 7px !important;
      align-items: center !important;
      flex: 0 1 510px !important;
      width: min(100%, 510px) !important;
      min-width: 0 !important;
      margin-left: auto !important;
      overflow: visible !important;
    }

    html body:has(#pmlt) #us-sign-scope-header :is(.multiselect-native-select, .btn-group) {
      position: relative !important;
      z-index: 3200 !important;
      display: block !important;
      float: none !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
    }

    html body:has(#pmlt) #us-sign-scope-header button.multiselect,
    html body:has(#pmlt) #us-sign-scope-header .multiselect-native-select > .btn-group > .btn {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 9px !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 34px !important;
      margin: 0 !important;
      padding: 7px 10px !important;
      color: var(--us-ws-soft) !important;
      background: rgba(255, 255, 255, 0.035) !important;
      border: 1px solid var(--us-ws-line-strong) !important;
      border-radius: var(--us-ws-radius-sm) !important;
      box-shadow: none !important;
      font-size: 11px !important;
      text-align: left !important;
      text-transform: none !important;
    }

    html body:has(#pmlt) #us-sign-scope-header #insert-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: auto !important;
      min-width: 76px !important;
      min-height: 34px !important;
      margin: 0 !important;
      padding: 7px 12px !important;
      color: var(--us-ws-text) !important;
      background: var(--us-ws-accent) !important;
      border: 1px solid rgba(127, 146, 166, 0.25) !important;
      border-radius: var(--us-ws-radius-sm) !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      text-transform: none !important;
    }

    html body:has(#pmlt) #us-sign-scope-header .multiselect-container.dropdown-menu {
      box-sizing: border-box !important;
      position: absolute !important;
      inset: auto !important;
      top: calc(100% + 6px) !important;
      right: 0 !important;
      left: auto !important;
      z-index: 2147483000 !important;
      width: min(430px, calc(100vw - 40px)) !important;
      max-width: min(430px, calc(100vw - 40px)) !important;
      min-width: 100% !important;
      max-height: 360px !important;
      margin: 0 !important;
      padding: 6px !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      background: rgba(7, 15, 25, 0.94) !important;
      border: 1px solid var(--us-ws-line-strong) !important;
      border-radius: 10px !important;
      box-shadow: 0 22px 54px rgba(0, 0, 0, 0.34) !important;
      transform: none !important;
    }

    html body:has(#pmlt) .well.us-sign-scope-enhanced > form.us-sign-scope-form {
      display: flex !important;
      flex-direction: column !important;
      gap: 9px !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    html body:has(#pmlt) .well.us-sign-scope-enhanced :is(.cke, .cke_chrome, .cke_inner) {
      box-sizing: border-box !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      margin: 0 !important;
      background: rgba(5, 12, 20, 0.34) !important;
      border-color: var(--us-ws-line) !important;
      border-radius: 10px !important;
      box-shadow: none !important;
      overflow: hidden !important;
    }

    html body:has(#pmlt) .well.us-sign-scope-enhanced .cke_top {
      display: flex !important;
      align-items: center !important;
      flex-wrap: nowrap !important;
      gap: 5px !important;
      width: 100% !important;
      min-height: 40px !important;
      margin: 0 !important;
      padding: 5px 7px !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      background: rgba(255, 255, 255, 0.025) !important;
      border: 0 !important;
      border-bottom: 1px solid var(--us-ws-line) !important;
    }

    html body:has(#pmlt) .well.us-sign-scope-enhanced .cke_toolbar_break {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      clear: none !important;
    }

    html body:has(#pmlt) .well.us-sign-scope-enhanced .cke_contents {
      box-sizing: border-box !important;
      width: 100% !important;
      height: clamp(250px, 31vh, 340px) !important;
      min-height: 250px !important;
      max-height: 340px !important;
      overflow: hidden !important;
      background: rgba(5, 12, 20, 0.24) !important;
      border: 0 !important;
    }

    html body:has(#pmlt) .well.us-sign-scope-enhanced .cke_bottom {
      display: none !important;
    }

    html body:has(#pmlt) .well.us-sign-scope-enhanced .us-sign-scope-footer {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 7px !important;
      width: 100% !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 9px 0 0 !important;
      border-top: 1px solid var(--us-ws-line) !important;
    }

    html body:has(#pmlt) .well.us-sign-scope-enhanced .us-sign-scope-footer > [class*="col-"] {
      float: none !important;
      width: auto !important;
      max-width: none !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    html body:has(#pmlt) .well.us-sign-scope-enhanced .us-sign-scope-updated {
      order: 1 !important;
      margin-right: auto !important;
    }

    html body:has(#pmlt) .well.us-sign-scope-enhanced .us-sign-scope-update {
      order: 2 !important;
    }

    html body:has(#pmlt) .well.us-sign-scope-enhanced .us-sign-scope-print {
      order: 3 !important;
    }

    /* Native Scope fallback before Runtime Fixes finishes enhancing it. */
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) > .row,
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) > .row [class*="col-"] {
      float: none !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) > form {
      width: 100% !important;
      min-width: 0 !important;
      margin: 10px 0 0 !important;
    }


    /* =====================================================
       v1.2.0 SCOPE GLASS POLISH
       Paint only. Keep the proven v1.1.0 grid and geometry untouched.
    ===================================================== */

    html body:has(#pmlt) #customer-info,
    html body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well:has(.important-notes),
    html body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well.us-sign-scope-enhanced {
      background:
        linear-gradient(145deg, rgba(118, 188, 244, 0.040), transparent 34%),
        linear-gradient(180deg, rgba(8, 18, 30, 0.18), rgba(4, 11, 20, 0.12)) !important;
      background-color: var(--us-ws-bg) !important;
      border-color: var(--us-ws-line) !important;
      box-shadow: var(--us-ws-shadow) !important;
    }

    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      html body:has(#pmlt) #customer-info,
      html body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well:has(.important-notes),
      html body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well.us-sign-scope-enhanced {
        -webkit-backdrop-filter: blur(6px) saturate(118%) !important;
        backdrop-filter: blur(6px) saturate(118%) !important;
      }

      html body:has(#pmlt) .well.us-sign-scope-enhanced :is(.cke, .cke_chrome, .cke_inner, .cke_top, .cke_contents),
      html body:has(#pmlt) .well:has(.important-notes) :is(input, textarea, button),
      html body:has(#pmlt) #customer-info :is(.panel-heading, .panel-body, button, a.btn) {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
    }

    html body:has(#pmlt) #customer-info > .panel-heading,
    html body:has(#pmlt) #us-sign-scope-header,
    html body:has(#pmlt) .well.us-sign-scope-enhanced .cke_top {
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(92, 170, 232, 0.018)) !important;
      background-color: rgba(255, 255, 255, 0.012) !important;
    }

    html body:has(#pmlt) .well:has(.important-notes) textarea,
    html body:has(#pmlt) .well:has(.important-notes) input[type="text"],
    html body:has(#pmlt) .well.us-sign-scope-enhanced button.multiselect,
    html body:has(#pmlt) .well.us-sign-scope-enhanced .multiselect-native-select > .btn-group > .btn {
      background: rgba(5, 13, 23, 0.24) !important;
      background-color: rgba(5, 13, 23, 0.24) !important;
      border-color: var(--us-ws-line-strong) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
    }

    html body:has(#pmlt) .well.us-sign-scope-enhanced :is(.cke, .cke_chrome, .cke_inner) {
      background:
        linear-gradient(180deg, rgba(9, 19, 31, 0.32), rgba(4, 10, 18, 0.24)) !important;
      background-color: rgba(5, 12, 20, 0.30) !important;
      border-color: var(--us-ws-line) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
    }

    html body:has(#pmlt) .well.us-sign-scope-enhanced .cke_contents {
      background: rgba(5, 12, 20, 0.22) !important;
      background-color: rgba(5, 12, 20, 0.22) !important;
    }

    html body:has(#pmlt) #us-sign-scope-header #insert-btn,
    html body:has(#pmlt) .well.us-sign-scope-enhanced .us-sign-scope-footer .btn {
      background:
        linear-gradient(180deg, rgba(77, 164, 235, 0.16), rgba(27, 95, 158, 0.08)),
        rgba(7, 15, 25, 0.20) !important;
      border-color: rgba(131, 203, 255, 0.16) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
    }

    /* =====================================================
       RESPONSIVE
    ===================================================== */

    @media (max-width: 1100px) {
      html body:has(#pmlt)
      #content
      .tray-center
      > .pl15.pr15:has(> .row.no-gutter > #customer-info):has(> .well .important-notes) {
        grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
      }

      html body:has(#pmlt)
      #content
      .tray-center
      > .pl15.pr15
      > .row.no-gutter:has(> #customer-info) {
        grid-column: 1 / span 2 !important;
      }

      html body:has(#pmlt)
      #content
      .tray-center
      > .pl15.pr15
      > .well:has(.important-notes) {
        grid-column: 3 / span 4 !important;
      }
    }

    @media (max-width: 820px) {
      html body:has(#pmlt)
      #content
      .tray-center
      > .pl15.pr15:has(> .row.no-gutter > #customer-info):has(> .well .important-notes) {
        display: block !important;
        padding: 0 10px 10px !important;
      }

      html body:has(#pmlt)
      #content
      .tray-center
      > .pl15.pr15
      > :is(
        .alert.alert-micro,
        .row.no-gutter:has(> #customer-name),
        .row.no-gutter:has(> #customer-info),
        .well:has(.important-notes),
        .well:has(#ps-select)
      ) {
        width: 100% !important;
        margin: 0 0 10px !important;
      }

      html body:has(#pmlt) #us-sign-scope-header {
        align-items: stretch !important;
        flex-direction: column !important;
      }

      html body:has(#pmlt) #us-sign-scope-header > .us-sign-scope-controls {
        width: 100% !important;
        max-width: none !important;
        flex-basis: auto !important;
      }
    }

    @media (max-width: 520px) {
      html body:has(#pmlt) #customer-info > .panel-heading {
        grid-template-columns: minmax(0, 1fr) !important;
        grid-template-areas:
          "address"
          "date"
          "vendor" !important;
      }

      html body:has(#pmlt) #customer-info > .panel-heading > a.btn.pull-right {
        width: 100% !important;
      }

      html body:has(#pmlt) #us-sign-scope-header > .us-sign-scope-controls {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      html body:has(#pmlt) #us-sign-scope-header #insert-btn {
        width: 100% !important;
      }

      html body:has(#pmlt) .well.us-sign-scope-enhanced .us-sign-scope-footer {
        align-items: stretch !important;
        flex-wrap: wrap !important;
      }

      html body:has(#pmlt) .well.us-sign-scope-enhanced .us-sign-scope-updated {
        flex-basis: 100% !important;
        margin-right: 0 !important;
      }
    }

    /* v1.2.2 LIVE SCOPE PANEL REPAIR */
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced){display:grid!important;grid-template-columns:minmax(0,1fr) minmax(360px,560px)!important;grid-template-areas:"title controls" "form form"!important;gap:10px 12px!important;align-items:center!important;padding:12px!important;background:linear-gradient(145deg,rgba(118,188,244,.05),transparent 34%),linear-gradient(180deg,rgba(8,18,30,.25),rgba(4,11,20,.18))!important;background-color:rgba(7,16,27,.22)!important;border:1px solid var(--us-ws-line)!important;border-radius:var(--us-ws-radius)!important;box-shadow:var(--us-ws-shadow)!important}
    @supports ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px))){html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced){-webkit-backdrop-filter:blur(12px) saturate(128%)!important;backdrop-filter:blur(12px) saturate(128%)!important}html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) :is(.row,[class*="col-"],.btn-group,button,input,select,.cke,.cke_chrome,.cke_inner,.cke_top,.cke_contents,.cke_bottom){-webkit-backdrop-filter:none!important;backdrop-filter:none!important}}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>strong:first-of-type{grid-area:title!important;display:block!important;margin:0!important;color:var(--us-ws-text)!important;font-size:14px!important;font-weight:650!important;line-height:1.25!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>strong:first-of-type+br{display:none!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>.row:first-child{grid-area:controls!important;display:block!important;width:100%!important;margin:0!important;padding:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>.row:first-child>.col-md-8,html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>.row:first-child>.col-md-8>.col-md-10{position:static!important;float:none!important;width:100%!important;margin:0!important;padding:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>.row:first-child>.col-md-8>.col-md-10>.row{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:7px!important;align-items:center!important;width:100%!important;margin:0!important;padding:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>.row:first-child>.col-md-8>.col-md-10>.row>[class*="col-"]{position:static!important;float:none!important;width:auto!important;margin:0!important;padding:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) :is(.btn-group,button.multiselect){width:100%!important;margin:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) button.multiselect{display:flex!important;align-items:center!important;justify-content:space-between!important;min-height:34px!important;padding:7px 10px!important;color:var(--us-ws-soft)!important;background:rgba(5,13,23,.32)!important;border:1px solid var(--us-ws-line-strong)!important;border-radius:var(--us-ws-radius-sm)!important;font-size:11px!important;text-align:left!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) #insert-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:auto!important;min-width:74px!important;min-height:34px!important;margin:0!important;padding:7px 12px!important;font-size:11px!important;font-weight:600!important;white-space:nowrap!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>.row:first-child .multiselect-container.dropdown-menu{position:absolute!important;z-index:2147483000!important;top:calc(100% + 5px)!important;right:0!important;left:auto!important;width:min(560px,calc(100vw - 40px))!important;max-height:min(54vh,420px)!important;overflow:auto!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form{grid-area:form!important;display:flex!important;flex-direction:column!important;gap:8px!important;width:100%!important;margin:0!important;padding:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form>br{display:none!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) :is(.cke,.cke_chrome,.cke_inner){width:100%!important;margin:0!important;background:linear-gradient(180deg,rgba(10,22,35,.40),rgba(4,10,18,.32))!important;border:1px solid var(--us-ws-line)!important;border-radius:10px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;overflow:hidden!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_top{min-height:38px!important;padding:5px 7px!important;background:linear-gradient(180deg,rgba(255,255,255,.038),rgba(92,170,232,.016))!important;border:0!important;border-bottom:1px solid var(--us-ws-line)!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_contents{height:clamp(220px,26vh,300px)!important;min-height:220px!important;max-height:300px!important;background:rgba(4,10,18,.32)!important;border:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_bottom{display:none!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form>.row:last-of-type{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto!important;gap:10px!important;align-items:center!important;width:100%!important;margin:0!important;padding:8px 0 0!important;border-top:1px solid var(--us-ws-line)!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form>.row:last-of-type>.col-md-4{position:static!important;float:none!important;width:auto!important;margin:0!important;padding:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form>.row:last-of-type>.col-md-4:nth-child(2){justify-self:center!important;color:var(--us-ws-muted)!important;font-size:10.5px!important;text-align:center!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form>.row:last-of-type>.col-md-4:last-child{justify-self:end!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form>.row:last-of-type :is(.btn,input.btn,a.btn){min-height:30px!important;height:auto!important;margin:0!important;padding:5px 9px!important;font-size:10.5px!important;line-height:18px!important}
    @media(max-width:820px){html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced){grid-template-columns:minmax(0,1fr)!important;grid-template-areas:"title" "controls" "form"!important}}


    /* =====================================================
       v1.2.3 SCOPE WINDOW ALIGNMENT + TRUE GLASS
       Snapshot-grounded against the native project.php Scope DOM.
    ===================================================== */

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) {
      grid-template-columns: minmax(0, 1fr) minmax(380px, 520px) !important;
      grid-template-areas:
        "title controls"
        "form form" !important;
      gap: 10px 14px !important;
      align-items: center !important;
      padding: 14px !important;
      background:
        linear-gradient(145deg, rgba(138, 203, 250, 0.040), transparent 34%),
        linear-gradient(180deg, rgba(8, 18, 30, 0.14), rgba(4, 11, 20, 0.09)) !important;
      background-color: rgba(6, 14, 24, 0.11) !important;
      border-color: rgba(197, 226, 249, 0.09) !important;
      box-shadow:
        0 16px 38px rgba(0, 0, 0, 0.10),
        inset 0 1px 0 rgba(255, 255, 255, 0.035) !important;
    }

    @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
      html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) {
        -webkit-backdrop-filter: blur(16px) saturate(132%) !important;
        backdrop-filter: blur(16px) saturate(132%) !important;
      }

      html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) :is(
        .row,
        [class*="col-"],
        .btn-group,
        button,
        input,
        select,
        .cke,
        .cke_chrome,
        .cke_inner,
        .cke_top,
        .cke_contents,
        .cke_bottom
      ) {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) > strong:first-of-type {
      align-self: center !important;
      margin: 0 !important;
      font-size: 14px !important;
      line-height: 34px !important;
    }

    /* Native controls row is the first direct row. Explicitly place its two
       columns so Bootstrap's historical width/order rules cannot swap them. */
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    > .row:first-of-type {
      grid-area: controls !important;
      min-height: 34px !important;
      height: auto !important;
      align-self: center !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    > .row:first-of-type > .col-md-8,
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    > .row:first-of-type > .col-md-8 > .col-md-10 {
      width: 100% !important;
      height: auto !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    > .row:first-of-type > .col-md-8 > .col-md-10 > .row {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) auto !important;
      grid-template-rows: minmax(34px, auto) !important;
      gap: 7px !important;
      align-items: center !important;
      width: 100% !important;
      min-height: 34px !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    > .row:first-of-type > .col-md-8 > .col-md-10 > .row > .col-md-10:first-child {
      grid-column: 1 !important;
      grid-row: 1 !important;
      justify-self: stretch !important;
      width: 100% !important;
      min-width: 0 !important;
      height: auto !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    > .row:first-of-type > .col-md-8 > .col-md-10 > .row > .col-md-2:last-child {
      grid-column: 2 !important;
      grid-row: 1 !important;
      justify-self: end !important;
      width: auto !important;
      min-width: 0 !important;
      height: auto !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    .btn-group,
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    button.multiselect {
      width: 100% !important;
      min-width: 0 !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    button.multiselect,
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    #insert-btn {
      min-height: 34px !important;
      height: 34px !important;
      border-color: rgba(205, 231, 250, 0.10) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    button.multiselect {
      background: rgba(5, 13, 23, 0.18) !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    #insert-btn {
      min-width: 78px !important;
      color: #e9f6ff !important;
      background:
        linear-gradient(180deg, rgba(60, 146, 211, 0.19), rgba(22, 85, 140, 0.10)),
        rgba(7, 15, 25, 0.16) !important;
    }

    /* Editor chrome becomes a transparent part of the outer glass window. */
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    :is(.cke, .cke_chrome, .cke_inner) {
      background:
        linear-gradient(180deg, rgba(8, 18, 30, 0.14), rgba(3, 9, 16, 0.10)) !important;
      background-color: rgba(5, 12, 20, 0.10) !important;
      border-color: rgba(197, 226, 249, 0.085) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.022) !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    .cke_top {
      display: flex !important;
      align-items: center !important;
      flex-wrap: nowrap !important;
      min-height: 40px !important;
      padding: 5px 7px !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.026), rgba(90, 165, 225, 0.010)) !important;
      background-color: rgba(5, 12, 20, 0.07) !important;
      border-bottom-color: rgba(197, 226, 249, 0.075) !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    .cke_contents {
      height: clamp(230px, 29vh, 330px) !important;
      min-height: 230px !important;
      max-height: 330px !important;
      background: rgba(3, 9, 16, 0.08) !important;
      background-color: rgba(3, 9, 16, 0.08) !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    .cke_wysiwyg_frame {
      background: transparent !important;
      background-color: transparent !important;
    }

    /* The native footer is exactly three .col-md-4 children. Pin each one to
       its intended place instead of letting old float/pull-right rules reorder it. */
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    > form > .row:last-of-type {
      display: grid !important;
      grid-template-columns: auto minmax(0, 1fr) auto !important;
      grid-template-rows: minmax(32px, auto) !important;
      align-items: center !important;
      gap: 12px !important;
      width: 100% !important;
      min-height: 40px !important;
      margin: 0 !important;
      padding: 8px 0 0 !important;
      border-top: 1px solid rgba(197, 226, 249, 0.075) !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    > form > .row:last-of-type > .col-md-4 {
      position: static !important;
      float: none !important;
      width: auto !important;
      min-width: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    > form > .row:last-of-type > .col-md-4:nth-child(1) {
      grid-column: 1 !important;
      grid-row: 1 !important;
      justify-self: start !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    > form > .row:last-of-type > .col-md-4:nth-child(2) {
      grid-column: 2 !important;
      grid-row: 1 !important;
      justify-self: center !important;
      color: rgba(188, 202, 216, 0.72) !important;
      font-size: 10.5px !important;
      text-align: center !important;
      white-space: nowrap !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    > form > .row:last-of-type > .col-md-4:nth-child(3) {
      grid-column: 3 !important;
      grid-row: 1 !important;
      justify-self: end !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    > form > .row:last-of-type .pull-right {
      float: none !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
    > form > .row:last-of-type :is(.btn, input.btn, a.btn) {
      min-height: 32px !important;
      height: 32px !important;
      margin: 0 !important;
      padding: 6px 10px !important;
      border-color: rgba(205, 231, 250, 0.10) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
      font-size: 10.5px !important;
      line-height: 18px !important;
    }

    @media (max-width: 820px) {
      html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) {
        grid-template-columns: minmax(0, 1fr) !important;
        grid-template-areas:
          "title"
          "controls"
          "form" !important;
      }

      html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
      > form > .row:last-of-type {
        grid-template-columns: minmax(0, 1fr) auto !important;
      }

      html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
      > form > .row:last-of-type > .col-md-4:nth-child(1) {
        grid-column: 1 !important;
        grid-row: 1 !important;
      }

      html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
      > form > .row:last-of-type > .col-md-4:nth-child(2) {
        grid-column: 1 / -1 !important;
        grid-row: 2 !important;
        justify-self: start !important;
        white-space: normal !important;
      }

      html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)
      > form > .row:last-of-type > .col-md-4:nth-child(3) {
        grid-column: 2 !important;
        grid-row: 1 !important;
      }
    }


    /* =====================================================
       v1.2.4 CKEDITOR FORMATTING TOOLBAR GLASS CONTROLS
       Keep the outer Scope window as the only true blur layer.
       Toolbar controls use quiet translucent paint, not nested blur.
    ===================================================== */

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_top {
      gap: 4px !important;
      border-color: rgba(197, 226, 249, 0.065) !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_toolbox {
      display: flex !important;
      align-items: center !important;
      flex-wrap: wrap !important;
      gap: 4px 6px !important;
      width: 100% !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_toolbar {
      float: none !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 3px !important;
      margin: 0 !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_toolgroup {
      float: none !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 1px !important;
      min-height: 30px !important;
      margin: 0 !important;
      padding: 2px !important;
      background: rgba(4, 11, 19, 0.065) !important;
      border: 1px solid rgba(197, 226, 249, 0.055) !important;
      border-radius: 7px !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.018) !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_button {
      float: none !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-width: 26px !important;
      width: 26px !important;
      height: 26px !important;
      margin: 0 !important;
      padding: 3px !important;
      background: transparent !important;
      border: 0 !important;
      border-radius: 5px !important;
      box-shadow: none !important;
      opacity: 0.82 !important;
      transition: background-color 120ms ease, opacity 120ms ease !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_button:hover,
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_button:focus {
      background: rgba(101, 176, 232, 0.105) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.028) !important;
      opacity: 1 !important;
      outline: none !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_button_on {
      background: rgba(67, 143, 203, 0.17) !important;
      box-shadow: inset 0 0 0 1px rgba(144, 204, 247, 0.10) !important;
      opacity: 1 !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_button_disabled {
      opacity: 0.34 !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_button_icon {
      opacity: 0.90 !important;
      filter: none !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_toolbar_separator {
      width: 1px !important;
      height: 16px !important;
      margin: 0 2px !important;
      background: rgba(197, 226, 249, 0.075) !important;
      border: 0 !important;
    }

    /* Styles / Format / Font / Size become quiet glass fields instead of
       four hard outlined boxes. */
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_combo {
      float: none !important;
      display: inline-flex !important;
      align-items: center !important;
      height: 30px !important;
      margin: 0 !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_combo_button {
      float: none !important;
      display: inline-flex !important;
      align-items: center !important;
      min-width: 86px !important;
      height: 30px !important;
      margin: 0 !important;
      padding: 0 0 0 9px !important;
      color: rgba(220, 232, 242, 0.76) !important;
      background: rgba(4, 11, 19, 0.07) !important;
      border: 1px solid rgba(197, 226, 249, 0.055) !important;
      border-radius: 7px !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.016) !important;
      text-shadow: none !important;
      transition: background-color 120ms ease, border-color 120ms ease !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_combo_button:hover,
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_combo_button:focus,
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_combo_on .cke_combo_button {
      color: rgba(239, 247, 253, 0.92) !important;
      background: rgba(85, 160, 218, 0.09) !important;
      border-color: rgba(164, 210, 244, 0.09) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025) !important;
      outline: none !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_combo_text {
      float: none !important;
      display: block !important;
      width: auto !important;
      min-width: 0 !important;
      flex: 1 1 auto !important;
      height: 28px !important;
      padding: 0 5px 0 0 !important;
      color: inherit !important;
      font-size: 11px !important;
      line-height: 28px !important;
      text-shadow: none !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_combo_open {
      float: none !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 24px !important;
      height: 28px !important;
      margin: 0 !important;
      border-left: 1px solid rgba(197, 226, 249, 0.045) !important;
      background: transparent !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_combo_arrow {
      border-top-color: rgba(206, 224, 238, 0.62) !important;
      opacity: 0.82 !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_combo__styles .cke_combo_button {
      min-width: 108px !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_combo__format .cke_combo_button {
      min-width: 104px !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_combo__font .cke_combo_button {
      min-width: 108px !important;
    }

    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_combo__fontsize .cke_combo_button {
      min-width: 74px !important;
    }



    /* v1.2.5: Dark Glass bridge. Scoped so the preserved Glass theme is untouched. */
    html.us-sign-theme-dark-glass {
      --us-ws-bg: rgba(11, 11, 14, 0.58);
      --us-ws-soft-bg: rgba(255, 255, 255, 0.020);
      --us-ws-line: rgba(255, 255, 255, 0.070);
      --us-ws-line-strong: rgba(255, 255, 255, 0.105);
      --us-ws-accent: rgba(255, 255, 255, 0.060);
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) #customer-info,
    html.us-sign-theme-dark-glass body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well:has(.important-notes),
    html.us-sign-theme-dark-glass body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well.us-sign-scope-enhanced {
      background-color: rgba(11, 11, 14, 0.66) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.004)) !important;
      border-color: rgba(255,255,255,0.072) !important;
      -webkit-backdrop-filter: blur(var(--us-dark-glass-blur, 14px)) saturate(var(--us-dark-glass-saturation, 108%)) brightness(var(--us-dark-glass-brightness, .90)) !important;
      backdrop-filter: blur(var(--us-dark-glass-blur, 14px)) saturate(var(--us-dark-glass-saturation, 108%)) brightness(var(--us-dark-glass-brightness, .90)) !important;
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) #us-sign-scope-header button.multiselect,
    html.us-sign-theme-dark-glass body:has(#pmlt) #us-sign-scope-header .multiselect-native-select > .btn-group > .btn,
    html.us-sign-theme-dark-glass body:has(#pmlt) #us-sign-scope-header #insert-btn,
    html.us-sign-theme-dark-glass body:has(#pmlt) #customer-info #showbtns .btn {
      color: #d5d5d8 !important;
      background: rgba(255,255,255,0.040) !important;
      border-color: rgba(255,255,255,0.090) !important;
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) #us-sign-scope-header .multiselect-container.dropdown-menu {
      background: rgba(12, 12, 15, 0.96) !important;
      border-color: rgba(255,255,255,0.10) !important;
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) .well.us-sign-scope-enhanced :is(.cke, .cke_chrome, .cke_inner) {
      background: rgba(10, 10, 13, 0.46) !important;
      border-color: rgba(255,255,255,0.065) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) .well.us-sign-scope-enhanced .cke_top {
      background: rgba(255,255,255,0.018) !important;
      border-bottom-color: rgba(255,255,255,0.060) !important;
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) .well.us-sign-scope-enhanced .cke_contents {
      background: rgba(8, 8, 10, 0.30) !important;
    }
`);

  // CKEditor is a same-origin iframe. The outer Scope well owns the expensive
  // Gaussian blur; this bounded pass makes the iframe canvas transparent so the
  // already-blurred glass can remain visible behind editable text.
  function usSignPolishScopeEditorFrameV123() {
    const root = document.querySelector('.well:has(#ps-select)');
    if (!root) return;

    const frame = root.querySelector('.cke_wysiwyg_frame');
    if (!frame) return;

    frame.style.setProperty('background', 'transparent', 'important');
    frame.style.setProperty('background-color', 'transparent', 'important');

    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.documentElement || !doc.body) return;

      let style = doc.getElementById('us-sign-scope-frame-glass-v123');
      if (!style) {
        style = doc.createElement('style');
        style.id = 'us-sign-scope-frame-glass-v123';
        style.textContent = `
          html, body {
            background: transparent !important;
            background-color: transparent !important;
          }
          body {
            color: #d8e1e9 !important;
            padding: 14px 18px !important;
            font-size: 13px !important;
            line-height: 1.55 !important;
          }
          ::selection {
            background: rgba(78, 157, 220, 0.34) !important;
          }
        `;
        (doc.head || doc.documentElement).appendChild(style);
      }

      doc.documentElement.style.setProperty('background', 'transparent', 'important');
      doc.body.style.setProperty('background', 'transparent', 'important');
      doc.body.style.setProperty('background-color', 'transparent', 'important');

      if (frame.dataset.usScopeGlassBound !== 'true') {
        frame.dataset.usScopeGlassBound = 'true';
        frame.addEventListener('load', usSignPolishScopeEditorFrameV123, { passive: true });
      }
    } catch (_) {
      // Same-origin access is expected on SquareCoil, but failing safely keeps
      // the editor functional if its embedding behavior changes later.
    }
  }

  function usSignScheduleScopeEditorGlassV123() {
    [0, 120, 350, 800, 1600, 2800].forEach((delay) => {
      window.setTimeout(usSignPolishScopeEditorFrameV123, delay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', usSignScheduleScopeEditorGlassV123, { once: true });
  } else {
    usSignScheduleScopeEditorGlassV123();
  }
  window.addEventListener('pageshow', usSignScheduleScopeEditorGlassV123);
})();
