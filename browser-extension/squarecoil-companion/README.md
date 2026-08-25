# US Sign SquareCoil Companion

Manifest V3 extension for Microsoft Edge and Google Chrome.

## v0.3.0

- Extension styling is scoped to the **Job Timer widget only**.
- SquareCoil itself remains visually untouched and uses its native website CSS.
- Timer widget supports Light, Dark, and Auto appearance modes.
- Expanded timer shell/header corners are explicitly rounded while preserving the floating timer tabs.
- Includes the existing SquareCoil Job Timer runtime and preserves its existing localStorage state key, so saved timer/history data can carry over.
- If a Tampermonkey Job Timer is already present, the extension does not inject a second timer.
- The popup displays the installed extension version and latest stable release metadata.
- A manual **Check for update** control can request a browser update check without replacing Edge's normal automatic update schedule.

## Update model

### Recommended: Microsoft Edge Add-ons

Publish through Microsoft Edge Add-ons / Partner Center. Each release increments the `manifest.json` version. Users who installed the store version receive browser-managed updates automatically.

The extension reads `release.json` from this repository as non-executable release metadata so the popup can show the latest published version and release notes. Remote JavaScript is never executed.

### Developer mode

`Load unpacked` is for development/testing. After pulling or replacing the extension files, reload the extension from `edge://extensions`.

## Install in Microsoft Edge for testing

1. Open `edge://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this `squarecoil-companion` folder.
5. Open SquareCoil and use the extension button to choose the **Job Timer** appearance.

## Migration from Tampermonkey

The extension can coexist during testing. For extension-only use, disable the Tampermonkey `SquareCoil Job Timer Manager` after confirming the extension works.

The separate Tampermonkey `US Sign Full UI Theme` is independent. The extension no longer styles the SquareCoil website itself.

## Behavior boundary

SquareCoil remains authoritative for clock-in/clock-out state. The extension observes that state for the timer and never replaces SquareCoil time-clock actions.
