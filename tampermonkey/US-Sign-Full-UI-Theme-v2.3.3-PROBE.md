# SquareCoil Full UI Theme v2.3.3 — Read-Only Live Probe

Date: 2026-08-28
Mode: signed-in browser inspection, read-only
Business-data mutations: none

## Scope

The probe inspected presentation structure and computed CSS on these route families:

- Dashboard shell and top-right menus
- Leads search filters
- Design editor / CKEditor
- Install Calendar / FullCalendar

No forms were submitted, no controls that change SquareCoil data were used, and no clock action was invoked. Customer, project, job, employee, note, file, and schedule contents are intentionally omitted.

## Findings and v2.3.3 corrections

### Top-right menus

Both user/help menus use `.dropdown-menu.list-group.dropdown-persist.w250`. The outer menu and each `.list-group-item` independently paint white backgrounds and light borders. v2.3.3 styles the container, rows, links, hover, and keyboard-focus states as one dark surface.

### Leads filters

The Leads panel uses AdminDesigns controls rather than Select2:

- text fields: `.admin-form .gui-input`
- selects: `.admin-form select.input-sm`
- native panel: `.panel.heading-border.panel-primary`

The native controls paint opaque white backgrounds and light gray borders. v2.3.3 adds route-scoped dark control paint, dark native option colors, a consistent radius, and retained blue focus indication.

### CKEditor

The editor is split into two presentation layers:

1. outer `.cke_*` toolbar/chrome;
2. a separate `iframe.cke_wysiwyg_frame` document.

Outer CSS cannot reliably repaint the iframe document. The toolbar also uses the dark `bootstrapck/icons.png` sprite, so text-color rules do not improve icon contrast.

v2.3.3 adds:

- a bounded iframe scan at boot/recovery points, without a page-wide mutation observer;
- a same-origin editor-document stylesheet for dark canvas, readable text, caret, headings, links, and common legacy inline colors;
- a guaranteed dark iframe element fallback;
- high-contrast filtering for the CKEditor icon sprite;
- separate active, hover, and disabled icon opacity.

### Install Calendar

The live page uses FullCalendar 2.9.1 and loads both the shared vendor stylesheet and a versioned FullCalendar stylesheet. Native day cells, event anchors, and embedded `.cp` progress strips paint white after broad theme rules.

Event border colors are semantic schedule data. v2.3.3 therefore:

- darkens day cells and event surfaces;
- fixes white `.cp` strips;
- distinguishes other-month and current-day cells;
- preserves inline event border colors instead of replacing them with one generic theme border.

## Safety and performance

- Presentation only; no SquareCoil requests or business actions were added.
- No new wallpaper request loop or animation scheduler was added.
- CKEditor repair uses four bounded startup passes plus existing page lifecycle signals.
- No document-wide mutation observer or color crawler was added.
- Existing FullCalendar semantic border colors remain authoritative.

## Remaining acceptance work

- Install the exact v2.3.3 branch artifact in a controlled Tampermonkey session.
- Verify Dashboard, Leads, Design editor, Scope editor, Install Calendar, and both top-right menus.
- Verify keyboard focus, reduced motion, forced colors, print, and narrow viewport behavior.
- Confirm disabling v2.3.3 restores the underlying v2.2.6/v2.2.7 presentation without leftover editor-document styles after reload.
