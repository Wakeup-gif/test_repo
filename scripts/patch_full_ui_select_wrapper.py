from pathlib import Path
import re

path = Path("tampermonkey/US-Sign-Full-UI-Theme.user.js")
text = path.read_text(encoding="utf-8")
text = text.replace("// @version      1.1.1", "// @version      1.1.2", 1)

pattern = re.compile(r'''    /\* Existing Projects search filters: prevent Chrome's native light select surface\. \*/.*?    select option,\n    select optgroup \{''', re.S)

replacement = r'''    /* Existing Projects filters: own the complete select wrapper, not just the native select. */
    html body #content .tray-left form#form label.field.select,
    html body #content .tray-left form#form .field.select {
      color-scheme: dark !important;
      color: var(--us-text-soft) !important;
      background: var(--us-bg-soft) !important;
      background-color: var(--us-bg-soft) !important;
      background-image: none !important;
      border-radius: var(--us-radius-sm) !important;
      box-shadow: none !important;
    }

    html body #content .tray-left form#form label.field.select::before,
    html body #content .tray-left form#form label.field.select::after,
    html body #content .tray-left form#form .field.select::before,
    html body #content .tray-left form#form .field.select::after {
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    html body #content .tray-left form#form .field.select select,
    html body #content .tray-left form#form select.input-sm {
      color-scheme: dark !important;
      forced-color-adjust: none !important;
      color: var(--us-text-soft) !important;
      -webkit-text-fill-color: var(--us-text-soft) !important;
      background: #1c2127 !important;
      background-color: #1c2127 !important;
      background-image: none !important;
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-sm) !important;
      box-shadow: none !important;
      opacity: 1 !important;
      filter: none !important;
      mix-blend-mode: normal !important;
      appearance: none !important;
      -webkit-appearance: none !important;
    }

    html body #content .tray-left form#form .field.select select:disabled,
    html body #content .tray-left form#form .field.select select[disabled],
    html body #content .tray-left form#form select.input-sm:disabled,
    html body #content .tray-left form#form select.input-sm[disabled] {
      color: var(--us-text-muted) !important;
      -webkit-text-fill-color: var(--us-text-muted) !important;
      background: #1c2127 !important;
      background-color: #1c2127 !important;
      border-color: var(--us-border) !important;
      opacity: 1 !important;
      cursor: default !important;
    }

    html body #content .tray-left form#form .field.select select:hover,
    html body #content .tray-left form#form .field.select select:focus,
    html body #content .tray-left form#form select.input-sm:hover,
    html body #content .tray-left form#form select.input-sm:focus {
      color: var(--us-text) !important;
      -webkit-text-fill-color: var(--us-text) !important;
      background: #242a31 !important;
      background-color: #242a31 !important;
      border-color: var(--us-border-focus) !important;
      outline: none !important;
    }

    html body #content .tray-left form#form .field.select > i.arrow.double {
      color: var(--us-text-muted) !important;
      border-top-color: var(--us-text-muted) !important;
      border-bottom-color: var(--us-text-muted) !important;
      opacity: 0.9 !important;
      pointer-events: none !important;
    }

    html body #content .tray-left form#form select option,
    html body #content .tray-left form#form select optgroup {
      color: var(--us-text-soft) !important;
      background: var(--us-bg-elevated) !important;
      background-color: var(--us-bg-elevated) !important;
    }

    select option,
    select optgroup {'''

new_text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit(f"Expected one Existing Projects select block, found {count}")

path.write_text(new_text, encoding="utf-8")
