# SquareCoil Companion update strategy

## Production update path

The recommended distribution is Microsoft Edge Add-ons. The extension version lives in `manifest.json`. Publish a new package with a higher version number through Partner Center and Microsoft Edge handles update delivery to installed users.

## Self-hosted enterprise path

Microsoft Edge also supports a self-hosted signed CRX update channel. That path requires a stable extension signing key, a packaged `.crx`, and an XML update manifest referenced by `update_url`. Every release must be signed with the same private key. Keep that private key outside the repository.

## Developer-mode installs

`Load unpacked` is for development and testing. It does not provide the production auto-update experience. Reload or replace the unpacked folder manually while testing.

## Version metadata

- Installed code version: `manifest.json` -> `version`
- Human-visible version: popup reads `chrome.runtime.getManifest().version`
- Latest published metadata: `release.json`
- Browser-downloaded update: tracked through `chrome.runtime.onUpdateAvailable`

Remote release metadata is data only. Extension JavaScript remains packaged with the extension and is never downloaded or executed from the update metadata endpoint.
