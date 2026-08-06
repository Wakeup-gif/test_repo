// ==UserScript==
// @name         US Sign Project and Scope Workspace
// @namespace    us-sign-full-modules
// @version      1.1.0
// @description  Organizes the project overview and Scope of Work while preserving the native customer-panel hierarchy.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Project-Scope-Workspace.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Project-Scope-Workspace.user.js
// ==/UserScript==

(function () {
  "use strict";

  GM_addStyle(String.raw`
    :root {
      --us-ws-bg: rgba(16, 20, 25, 0.92);
      --us-ws-soft-bg: rgba(255, 255, 255, 0.025);
      --us-ws-line: var(--us-border, rgba(255, 255, 255, 0.085));
      --us-ws-line-strong: var(--us-border-strong, rgba(255, 255, 255, 0.14));
      --us-ws-text: var(--us-text, #f4f6f8);
      --us-ws-soft: var(--us-text-soft, #c9ced5);
      --us-ws-muted: var(--us-text-muted, #8f98a3);
      --us-ws-accent: var(--us-accent-soft, rgba(155, 172, 189, 0.16));
      --us-ws-radius: var(--us-radius-lg, 14px);
      --us-ws-radius-sm: var(--us-radius-sm, 7px);
      --us-ws-shadow: var(--us-shadow-sm, 0 4px 14px rgba(0, 0, 0, 0.18));
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
      background: rgba(17, 21, 26, 0.995) !important;
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
      background: #0b0e12 !important;
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
      background: #0b0e12 !important;
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
  `);
})();
