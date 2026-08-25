# SquareCoil Companion Downloads

Stable version: **v0.7.0 Dual Browser + Glass**.

GitHub Actions produces two explicit installation artifacts from the same validated MV3 source:

- `SquareCoil-Companion-v0.7.0-EDGE.zip`
- `SquareCoil-Companion-v0.7.0-CHROME.zip`

Release refs:

- Edge: `release/squarecoil-companion-edge`
- Chrome: `release/squarecoil-companion-chrome`
- Generic stable pointer: `release/squarecoil-companion`

The browser-specific packages are intentionally code-identical. They are separated only so downloads, testing, and future store publication can be tracked independently without forking implementation logic.

## Edge developer-mode install

Extract the Edge ZIP, open `edge://extensions`, enable Developer mode, choose **Load unpacked**, and select the extracted folder containing `manifest.json`.

## Chrome developer-mode install

Extract the Chrome ZIP, open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the extracted folder containing `manifest.json`.

After updating an unpacked installation, use the browser extension page's Reload button and refresh the SquareCoil tab.
