'use strict';

const { CANDIDATE_FINGERPRINT } = require('../core/build-identity');
const { createWorkspaceUi } = require('./workspace-ui');

(function startPrototypeWorkspace() {
  if (window.top !== window) return;
  void CANDIDATE_FINGERPRINT;
  const ui = createWorkspaceUi({
    document,
    window,
    storage: chrome.storage.local,
    getCoreHandle: () => globalThis.__squareCoilCompanionAuthorityHealth || null
  });
  ui.start().catch(() => {});
  window.addEventListener('pagehide', () => ui.teardown(), { once: true });
})();
