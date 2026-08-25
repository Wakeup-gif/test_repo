# US Sign SquareCoil Companion

Manifest V3 extension for Microsoft Edge and Google Chrome.

## v0.1.0

- Light mode: keeps the familiar white SquareCoil composition.
- Dark mode: solid charcoal night theme with no wallpaper or transparency dependency.
- Auto mode: follows the browser/Windows preferred color scheme.
- Theme changes apply immediately and persist with `chrome.storage.local`.
- Includes the existing SquareCoil Job Timer runtime and preserves its existing localStorage state key, so saved timer/history data can carry over.
- If a Tampermonkey Job Timer is already present, the extension does not inject a second timer. It only applies the extension control styling.

## Install in Microsoft Edge

1. Open `edge://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this `squarecoil-companion` folder.
5. Open SquareCoil and use the extension button to choose Light, Dark, or Auto.

## Install in Google Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this `squarecoil-companion` folder.

## Migration from Tampermonkey

The extension can coexist during testing, but for a true extension-only setup disable these Tampermonkey scripts after confirming the extension works:

- US Sign Full UI Theme
- SquareCoil Job Timer Manager

Keeping the old Full UI Theme enabled can override parts of Light mode because both systems style the same SquareCoil elements.

## Behavior boundary

SquareCoil remains authoritative for clock-in/clock-out state. The extension observes that state for the timer and never replaces SquareCoil time-clock actions.
