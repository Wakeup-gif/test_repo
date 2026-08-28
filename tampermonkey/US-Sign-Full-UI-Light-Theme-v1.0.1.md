# SquareCoil Refined Light v1.0.1

This standalone Tampermonkey skin provides a bright, low-glare alternative to the dark glass skin. It changes presentation only: it does not clock time, submit forms, edit jobs, or write SquareCoil business data.

## Design system

The skin uses the semantic colors sampled from SquareCoil's native UI during the read-only audit:

- Primary blue: `#4a89dc`
- Information cyan: `#3bafda`
- Success green: `#70ca63`
- Warning gold: `#f6bb42`
- Danger red: `#e9573f`

Neutral surfaces use cool white, pale blue-gray, and dark slate text. Schedule-event border colors are intentionally preserved because the live calendar encodes status with inline colors.

## Corrected components

- Top-right Help and account dropdowns
- Leads search inputs and native selects
- General inputs, tables, panels, and button states
- FullCalendar day cells, events, progress strips, today, and other-month states
- CKEditor toolbar, controls, iframe canvas, caret, and legacy inline text colors
- Current US Sign & Mill header logo, embedded in the skin for reliable loading and placed on a dark contrast plate
- Narrow-window overflow, reduced-motion, forced-color, and print behavior

## Use

Install `US-Sign-Full-UI-Light-Theme-v1.0.1.user.js` in Tampermonkey and keep only one standalone SquareCoil skin enabled. The light script wins if both v1.0.1 light and v2.3.3 dark are accidentally enabled, but using one avoids duplicate CSS and network work.

The Companion extension can later expose these as mutually exclusive options in Skin Settings: **System**, **Refined Light**, and **Dark Glass**.
