# US Sign SquareCoil Companion

Manifest V3 extension for Microsoft Edge and Google Chrome.

## v0.2.0

- Light mode: keeps the familiar white SquareCoil composition.
- Dark mode: solid charcoal night theme with no wallpaper or transparency dependency.
- Auto mode: follows the browser/Windows preferred color scheme.
- Theme changes apply immediately and persist with `chrome.storage.local`.
- Includes the existing SquareCoil Job Timer runtime and preserves its existing localStorage state key, so saved timer/history data can carry over.
- If a Tampermonkey Job Timer is already present, the extension does not inject a second timer. It only applies the extension control styling.
- The popup displays the installed extension version and the latest stable release metadata.
- The service worker records browser-native update availability and exposes it to the popup.
- A manual **Check for update** control can request a browser update check without replacing Edge's normal automatic update schedule.

## Update model

### Recommended: Microsoft Edge Add-ons

Publish the extension through Microsoft Edge Add-ons / Partner Center. Each release increments `manifest.json` -> `version`. Users who installed the store version receive browser-managed updates automatically.

The extension also reads `release.json` from this repository as non-executable release metadata so the popup can show the latest published stable version and release notes. Remote JavaScript is never executed.

### Self-hosted enterprise option

Microsoft Edge can also update a signed self-hosted CRX by using an `update_url` and XML update manifest. Every release must be packed with the same private signing key. Keep that private key outside this repository.

### Developer mode

`Load unpacked` is for development/testing. It shows version/update-channel status, but it is not the production automatic-update channel. Reload the unpacked extension manually while testing.

## Install in Microsoft Edge for testing

1. Open `edge://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this `squarecoil-companion` folder.
5. Open SquareCoil and use the extension button to choose Light, Dark, or Auto.

## Install in Google Chrome for testing

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
