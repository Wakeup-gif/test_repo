from pathlib import Path

root = Path(__file__).resolve().parents[1]
p = root / 'tampermonkey' / 'US-Sign-Project-Scope-Workspace.user.js'
s = p.read_text()

if '@version      1.2.2' not in s:
    raise SystemExit('Expected v1.2.2 canonical project/scope workspace')

s = s.replace('@version      1.2.2', '@version      1.2.3', 1)
s = s.replace(
    'Preserves native Status and repairs the live Scope editor around its actual SquareCoil DOM with compact controls and true glass.',
    'Preserves native Status and repairs the live Scope editor around its actual SquareCoil DOM with aligned controls, a compact footer, and true glass through the CKEditor surface.',
    1,
)

needle = '\n  `);\n})();'
if needle not in s:
    raise SystemExit('Could not find final GM_addStyle close')

css = r'''

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
'''

js = r'''
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
'''

s = s.replace(needle, css + js, 1)

p.write_text(s)
installer = root / 'tampermonkey' / 'US-Sign-Project-Scope-Workspace-v1.2.3.user.js'
installer.write_text(s)
