# Release workflow

1. Update `manifest.json` version.
2. Update `release.json` latestVersion and release notes.
3. Validate the extension package.
4. Publish the new package through Microsoft Edge Add-ons Partner Center for normal users, or repack the self-hosted CRX with the same private key for managed self-host deployments.
5. Never ship or host the private signing key in this repository.

The popup always displays the installed version. The background service worker records when Edge reports a downloaded update and exposes that status to the popup.
