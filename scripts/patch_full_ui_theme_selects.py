from pathlib import Path

path = Path("tampermonkey/US-Sign-Full-UI-Theme.user.js")
text = path.read_text(encoding="utf-8")

text = text.replace("// @version      1.1.0", "// @version      1.1.1", 1)

needle = '''    select,
    select.form-control,
    #pmlt select,
    #content select,
    .panel select,
    .panel-body select {
      padding-right: 10px !important;
      appearance: auto !important;
      -webkit-appearance: auto !important;
    }
'''

patch = needle + '''
    /* Existing Projects search filters: prevent Chrome's native light select surface. */
    html body .tray-left form#form .field.select select,
    html body .tray-left form#form select.input-sm {
      color-scheme: dark !important;
      color: var(--us-text-soft) !important;
      -webkit-text-fill-color: var(--us-text-soft) !important;
      background: var(--us-bg-soft) !important;
      background-color: var(--us-bg-soft) !important;
      background-image: none !important;
      border: 1px solid var(--us-border) !important;
      box-shadow: none !important;
      appearance: none !important;
      -webkit-appearance: none !important;
    }

    html body .tray-left form#form .field.select select:hover,
    html body .tray-left form#form .field.select select:focus,
    html body .tray-left form#form select.input-sm:hover,
    html body .tray-left form#form select.input-sm:focus {
      color: var(--us-text) !important;
      -webkit-text-fill-color: var(--us-text) !important;
      background: rgba(255, 255, 255, 0.055) !important;
      background-color: var(--us-bg-soft) !important;
      border-color: var(--us-border-focus) !important;
      outline: none !important;
    }

    html body .tray-left form#form .field.select > i.arrow.double {
      color: var(--us-text-muted) !important;
      opacity: 0.9 !important;
      pointer-events: none !important;
    }

    html body .tray-left form#form select option,
    html body .tray-left form#form select optgroup {
      color: var(--us-text-soft) !important;
      background: var(--us-bg-elevated) !important;
      background-color: var(--us-bg-elevated) !important;
    }
'''

if "Existing Projects search filters: prevent Chrome's native light select surface." not in text:
    if needle not in text:
        raise SystemExit("Expected select styling block not found")
    text = text.replace(needle, patch, 1)

path.write_text(text, encoding="utf-8")
