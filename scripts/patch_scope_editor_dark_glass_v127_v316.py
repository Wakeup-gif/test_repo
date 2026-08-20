from pathlib import Path
import re

TM = Path('tampermonkey')

scope_path = TM / 'US-Sign-Project-Scope-Workspace.user.js'
runtime_path = TM / 'US-Sign-UI-Runtime-Fixes.user.js'

scope = scope_path.read_text(encoding='utf-8')
runtime = runtime_path.read_text(encoding='utf-8')

# ---------------------------------------------------------------------------
# Scope Workspace 1.2.7
# ---------------------------------------------------------------------------
scope = scope.replace('// @version      1.2.6', '// @version      1.2.7', 1)
scope = scope.replace(
    '// @description  Preserves native Status and repairs the live Scope editor around its actual SquareCoil DOM with aligned controls, true glass, and a cleaner CKEditor formatting toolbar.',
    '// @description  Preserves native Status and gives the live Scope workspace cohesive Dark Glass panels with a true dark translucent CKEditor canvas, aligned controls, and clean formatting chrome.',
    1,
)

late_css = r'''

  /* =========================================================
     v1.2.7 SCOPE PAGE DARK GLASS CANVAS
     Outer page cards share one black/graphite frost recipe. CKEditor chrome is
     nested paint only; the expensive Gaussian blur remains on the outer Scope
     well so the editor stays crisp and performant.
  ========================================================= */
  GM_addStyle(String.raw`
    html.us-sign-theme-dark-glass body:has(#pmlt) {
      --us-scope-panel-bg: rgba(10, 10, 12, 0.58);
      --us-scope-panel-bg-strong: rgba(7, 7, 9, 0.66);
      --us-scope-editor-bg: rgba(4, 4, 6, 0.46);
      --us-scope-toolbar-bg: rgba(12, 12, 15, 0.58);
      --us-scope-line: rgba(255,255,255,0.065);
      --us-scope-line-strong: rgba(255,255,255,0.105);
    }

    /* Customer, Notes, and Scope are peer glass roots. */
    html.us-sign-theme-dark-glass body:has(#pmlt) #customer-info,
    html.us-sign-theme-dark-glass body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well:has(.important-notes),
    html.us-sign-theme-dark-glass body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well:has(#ps-select),
    html.us-sign-theme-dark-glass body:has(#pmlt) #content .tray-center > .pl15.pr15 > .well.us-sign-scope-enhanced {
      background-color: var(--us-scope-panel-bg) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,.022), rgba(255,255,255,.004)) !important;
      border-color: var(--us-scope-line) !important;
      box-shadow: 0 10px 28px rgba(0,0,0,.22) !important;
      -webkit-backdrop-filter: blur(var(--us-dark-glass-blur,14px)) saturate(var(--us-dark-glass-saturation,108%)) brightness(var(--us-dark-glass-brightness,.90)) !important;
      backdrop-filter: blur(var(--us-dark-glass-blur,14px)) saturate(var(--us-dark-glass-saturation,108%)) brightness(var(--us-dark-glass-brightness,.90)) !important;
    }

    /* Nested pieces never stack another blur. */
    html.us-sign-theme-dark-glass body:has(#pmlt) .well:has(#ps-select) :is(
      .cke,.cke_chrome,.cke_inner,.cke_top,.cke_contents,.cke_bottom,
      iframe.cke_wysiwyg_frame,button,input,select,.btn-group,.row,[class*="col-"]
    ) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    /* The CKEditor shell is a dark translucent inset instead of a white page. */
    html.us-sign-theme-dark-glass body:has(#pmlt) .well:has(#ps-select) :is(.cke,.cke_chrome,.cke_inner) {
      background: var(--us-scope-panel-bg-strong) !important;
      background-color: var(--us-scope-panel-bg-strong) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,.018), rgba(255,255,255,.003)) !important;
      border-color: var(--us-scope-line) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.018) !important;
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) .well:has(#ps-select) .cke_top {
      background: var(--us-scope-toolbar-bg) !important;
      background-color: var(--us-scope-toolbar-bg) !important;
      background-image: none !important;
      border: 0 !important;
      border-bottom: 1px solid var(--us-scope-line) !important;
      box-shadow: none !important;
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) .well:has(#ps-select) .cke_contents {
      background: var(--us-scope-editor-bg) !important;
      background-color: var(--us-scope-editor-bg) !important;
      background-image: linear-gradient(180deg, rgba(255,255,255,.008), transparent 24%) !important;
      border: 0 !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.018) !important;
      overflow: hidden !important;
    }

    /* CKEditor itself can carry a native white background on the iframe node.
       Force the viewport transparent so the dark .cke_contents canvas shows. */
    html.us-sign-theme-dark-glass body:has(#pmlt) .well:has(#ps-select) iframe.cke_wysiwyg_frame {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      box-shadow: none !important;
      color-scheme: dark !important;
    }

    /* Toolbar controls read as one restrained graphite control system. */
    html.us-sign-theme-dark-glass body:has(#pmlt) .well:has(#ps-select) .cke_top :is(.cke_toolgroup,.cke_combo_button) {
      background: rgba(255,255,255,.018) !important;
      background-image: none !important;
      border-color: rgba(255,255,255,.050) !important;
      box-shadow: none !important;
    }
    html.us-sign-theme-dark-glass body:has(#pmlt) .well:has(#ps-select) .cke_top :is(.cke_button,.cke_combo_button):hover,
    html.us-sign-theme-dark-glass body:has(#pmlt) .well:has(#ps-select) .cke_top :is(.cke_button,.cke_combo_button).cke_button_on {
      background: rgba(255,255,255,.060) !important;
      border-color: rgba(255,255,255,.090) !important;
      box-shadow: none !important;
    }

    html.us-sign-theme-dark-glass body:has(#pmlt) .well:has(#ps-select) .cke_bottom {
      background: transparent !important;
      background-color: transparent !important;
      border-color: var(--us-scope-line) !important;
      box-shadow: none !important;
    }
  `);
'''

anchor = "\n  // CKEditor is a same-origin iframe."
if anchor not in scope:
    raise RuntimeError('Scope CKEditor anchor not found')
scope = scope.replace(anchor, late_css + anchor, 1)

# Replace the bounded iframe pass with a stronger, deterministic version.
pattern = re.compile(
    r"  function usSignPolishScopeEditorFrameV123\(\) \{.*?\n  \}\n\n  function usSignScheduleScopeEditorGlassV123\(\)",
    re.S,
)
replacement = r'''  function usSignPolishScopeEditorFrameV123() {
    const root = document.querySelector('.well:has(#ps-select)');
    if (!root) return;

    const frame = root.querySelector('iframe.cke_wysiwyg_frame');
    if (!frame) return;

    // Clear the replaced element itself. CKEditor/native CSS may otherwise
    // leave a white iframe plate even when the document inside is transparent.
    frame.setAttribute('allowtransparency', 'true');
    frame.style.setProperty('background', 'transparent', 'important');
    frame.style.setProperty('background-color', 'transparent', 'important');
    frame.style.setProperty('background-image', 'none', 'important');
    frame.style.setProperty('border', '0', 'important');
    frame.style.setProperty('color-scheme', 'dark', 'important');

    try {
      const doc = frame.contentDocument;
      if (!doc?.documentElement || !doc.body) return;

      doc.documentElement.style.setProperty('background', 'transparent', 'important');
      doc.documentElement.style.setProperty('background-color', 'transparent', 'important');
      doc.documentElement.style.setProperty('background-image', 'none', 'important');
      doc.documentElement.style.setProperty('color-scheme', 'dark', 'important');
      doc.body.style.setProperty('background', 'transparent', 'important');
      doc.body.style.setProperty('background-color', 'transparent', 'important');
      doc.body.style.setProperty('background-image', 'none', 'important');
      doc.body.style.setProperty('color', '#d9dde2', 'important');
      doc.body.style.setProperty('caret-color', '#ffffff', 'important');

      let style = doc.getElementById('us-sign-scope-editor-dark-glass-v127');
      if (!style) {
        style = doc.createElement('style');
        style.id = 'us-sign-scope-editor-dark-glass-v127';
        style.textContent = `
          html,
          html body,
          html body.cke_editable,
          html body.cke_editable_themed {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
            color: #d9dde2 !important;
            caret-color: #ffffff !important;
          }
          body.cke_editable {
            padding: 14px 16px !important;
            font-family: Manrope, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
            font-size: 13px !important;
            line-height: 1.58 !important;
          }
          body.cke_editable :is(p,div,span,li,td,th) { color: inherit; }
          body.cke_editable :is(strong,b,h1,h2,h3,h4,h5,h6) { color: #f2f4f6 !important; }
          body.cke_editable a { color: #b9d9f2 !important; }
          body.cke_editable ::selection { background: rgba(128,178,218,.28) !important; color:#fff !important; }
        `;
        (doc.head || doc.documentElement).appendChild(style);
      }

      if (frame.dataset.usScopeGlassBound !== 'true') {
        frame.dataset.usScopeGlassBound = 'true';
        frame.addEventListener('load', usSignPolishScopeEditorFrameV123, { passive: true });
      }
    } catch (_) {
      // Same-origin access is expected on SquareCoil. Failing safely preserves
      // editing if its iframe policy changes later.
    }
  }

  function usSignScheduleScopeEditorGlassV123()'''
scope, count = pattern.subn(replacement, scope, count=1)
if count != 1:
    raise RuntimeError(f'Could not replace Scope iframe pass, matches={count}')

scope_path.write_text(scope, encoding='utf-8', newline='\n')
(TM / 'US-Sign-Project-Scope-Workspace-v1.2.7.user.js').write_text(scope, encoding='utf-8', newline='\n')

# ---------------------------------------------------------------------------
# Runtime Fixes 3.1.6
# ---------------------------------------------------------------------------
runtime = runtime.replace('// @version      3.1.5', '// @version      3.1.6', 1)
runtime = runtime.replace(
    '// @description  Lightweight cached logo and CKEditor iframe styling. No page-wide observers, color crawlers, or Scope DOM ownership.',
    '// @description  Lightweight cached logo and hardened Dark Glass CKEditor iframe transparency. No page-wide observers, color crawlers, or Scope DOM ownership.',
    1,
)
runtime = runtime.replace('window.__usSignUiRuntimeV315', 'window.__usSignUiRuntimeV316')
runtime = runtime.replace('const VERSION = "3.1.5";', 'const VERSION = "3.1.6";', 1)

# Strengthen the dark iframe document selector.
runtime = runtime.replace(
    'html, body { background:transparent !important; background-color:transparent !important; color:#d4d4d7 !important; }',
    'html, html body, html body.cke_editable, html body.cke_editable_themed { background:transparent !important; background-color:transparent !important; background-image:none !important; color:#d4d4d7 !important; caret-color:#fff !important; color-scheme:dark !important; }',
    1,
)

old_process = '''  function processEditorIframe(iframe) {\n    if (!iframe || processedIframes.has(iframe)) return;\n    const process = () => {\n      try {\n        const editorDocument = iframe.contentDocument;\n        if (!editorDocument?.body) return;\n        processedIframes.add(iframe);\n        injectEditorStyle(editorDocument);\n      } catch (_) {}\n    };\n    iframe.addEventListener("load", process, { once: true });\n    process();\n  }'''
new_process = '''  function processEditorIframe(iframe) {\n    if (!iframe) return;\n\n    // A transparent document is not enough when CKEditor/native CSS paints the\n    // iframe element itself white. Clear both layers before/after load.\n    iframe.setAttribute("allowtransparency", "true");\n    iframe.style.setProperty("background", "transparent", "important");\n    iframe.style.setProperty("background-color", "transparent", "important");\n    iframe.style.setProperty("background-image", "none", "important");\n    iframe.style.setProperty("border", "0", "important");\n    if (document.documentElement?.classList.contains("us-sign-theme-dark-glass")) {\n      iframe.style.setProperty("color-scheme", "dark", "important");\n    }\n\n    if (processedIframes.has(iframe)) return;\n    const process = () => {\n      try {\n        const editorDocument = iframe.contentDocument;\n        if (!editorDocument?.documentElement || !editorDocument?.body) return;\n        processedIframes.add(iframe);\n        injectEditorStyle(editorDocument);\n\n        if (document.documentElement?.classList.contains("us-sign-theme-dark-glass")) {\n          editorDocument.documentElement.style.setProperty("background", "transparent", "important");\n          editorDocument.documentElement.style.setProperty("background-color", "transparent", "important");\n          editorDocument.documentElement.style.setProperty("background-image", "none", "important");\n          editorDocument.documentElement.style.setProperty("color-scheme", "dark", "important");\n          editorDocument.body.style.setProperty("background", "transparent", "important");\n          editorDocument.body.style.setProperty("background-color", "transparent", "important");\n          editorDocument.body.style.setProperty("background-image", "none", "important");\n          editorDocument.body.style.setProperty("color", "#d4d4d7", "important");\n          editorDocument.body.style.setProperty("caret-color", "#ffffff", "important");\n        }\n      } catch (_) {}\n    };\n    iframe.addEventListener("load", process, { once: true });\n    process();\n  }'''
if old_process not in runtime:
    raise RuntimeError('Runtime processEditorIframe block not found')
runtime = runtime.replace(old_process, new_process, 1)

runtime_path.write_text(runtime, encoding='utf-8', newline='\n')
(TM / 'US-Sign-UI-Runtime-Fixes-v3.1.6.user.js').write_text(runtime, encoding='utf-8', newline='\n')

print('patched Scope Workspace 1.2.7 and Runtime Fixes 3.1.6')
