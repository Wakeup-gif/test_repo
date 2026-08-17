from pathlib import Path

root = Path(__file__).resolve().parents[1]
p = root / 'tampermonkey' / 'US-Sign-Project-Scope-Workspace.user.js'
s = p.read_text()

if '@version      1.2.3' not in s:
    raise SystemExit('Expected v1.2.3 canonical project/scope workspace')

s = s.replace('@version      1.2.3', '@version      1.2.4', 1)
s = s.replace(
    'Preserves native Status and repairs the live Scope editor around its actual SquareCoil DOM with aligned controls, a compact footer, and true glass through the CKEditor surface.',
    'Preserves native Status and repairs the live Scope editor around its actual SquareCoil DOM with aligned controls, true glass, and a cleaner CKEditor formatting toolbar.',
    1,
)

needle = '\n  `);\n\n  // CKEditor is a same-origin iframe.'
if needle not in s:
    raise SystemExit('Could not find Scope GM_addStyle close')

css = r'''

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
'''

s = s.replace(needle, css + needle, 1)
s = s.rstrip() + '\n'
p.write_text(s)

installer = root / 'tampermonkey' / 'US-Sign-Project-Scope-Workspace-v1.2.4.user.js'
installer.write_text(s)
