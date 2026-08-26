'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BUILD_ID, CANDIDATE_FINGERPRINT } = require('../../src/core/build-identity');
const DOCUMENT_TOKEN = 'document-token-background-12345';
const DOCUMENT_ID = 'document-id-background';

function installChromeHarness({
  timerEnabled,
  runtimeSnapshot = null,
  roots = [],
  onSetEnabled = null,
  onRetryTeardown = null,
  onRevalidate = null,
  onRecover = null
}) {
  let currentSnapshot = runtimeSnapshot ? { candidateFingerprint: CANDIDATE_FINGERPRINT, ...runtimeSnapshot } : null;
  for (const root of roots) {
    if (root?.dataset?.squarecoilCompanionRoot !== 'rebuild') continue;
    if (!root.dataset.packageVersion) root.dataset.packageVersion = runtimeSnapshot?.packageVersion || '0.7.1';
    if (!root.dataset.candidateFingerprint) root.dataset.candidateFingerprint = CANDIDATE_FINGERPRINT;
  }
  let enableCalls = 0;
  let retryCalls = 0;
  let revalidateCalls = 0;
  let recoverCalls = 0;
  let fileInjections = 0;

  global.window = {
    location: {
      origin: 'https://ussignandmill.squarecoil.net',
      href: 'https://ussignandmill.squarecoil.net/__b1_fixture__/'
    },
    __squareCoilCompanionRuntime: runtimeSnapshot ? {
      buildId: runtimeSnapshot.buildId,
      packageVersion: currentSnapshot.packageVersion,
      candidateFingerprint: currentSnapshot.candidateFingerprint,
      runtimeInstanceId: runtimeSnapshot.runtimeInstanceId,
      documentToken: runtimeSnapshot.documentToken || DOCUMENT_TOKEN,
      getHealth: () => currentSnapshot,
      boot: async () => currentSnapshot,
      teardown: async () => currentSnapshot,
      setEnabled: async enabled => {
        enableCalls += 1;
        const overridden = onSetEnabled
          ? await onSetEnabled({ enabled, currentSnapshot, roots })
          : null;
        currentSnapshot = overridden || {
            ...currentSnapshot,
            mode: enabled ? 'ENABLED' : 'DISABLED',
            teardownInProgress: false
          };
        return currentSnapshot;
      },
      retryTeardown: async () => {
        retryCalls += 1;
        const overridden = onRetryTeardown ? await onRetryTeardown({ currentSnapshot, roots }) : null;
        currentSnapshot = overridden || currentSnapshot;
        return currentSnapshot;
      },
      revalidate: async () => {
        revalidateCalls += 1;
        const overridden = onRevalidate ? await onRevalidate({ currentSnapshot, roots }) : null;
        currentSnapshot = overridden || currentSnapshot;
        return currentSnapshot;
      },
      recover: async () => {
        recoverCalls += 1;
        const overridden = onRecover ? await onRecover({ currentSnapshot, roots }) : null;
        currentSnapshot = overridden || currentSnapshot;
        return currentSnapshot;
      }
    } : null
  };
  if (!runtimeSnapshot) delete global.window.__squareCoilCompanionRuntime;
  global.window.top = global.window;
  global.document = {
    documentElement: { dataset: { squarecoilCompanionDocumentToken: DOCUMENT_TOKEN } },
    querySelectorAll: () => roots
  };
  global.chrome = {
    tabs: {
      sendMessage: async (_tabId, message) => ({
        ok: true,
        disconnected: true,
        protocolVersion: message.protocolVersion,
        documentToken: message.documentToken,
        runtimeInstanceId: message.runtimeInstanceId
      })
    },
    scripting: {
      executeScript: async options => {
        if (options.files) {
          fileInjections += 1;
          const bootstrap = global.window.__squareCoilCompanionBootstrap;
          if (bootstrap) {
            currentSnapshot = {
              buildId: bootstrap.buildId,
              packageVersion: bootstrap.packageVersion,
              candidateFingerprint: bootstrap.candidateFingerprint,
              runtimeInstanceId: bootstrap.runtimeInstanceId,
              documentToken: bootstrap.documentToken,
              mode: 'ENABLED',
              state: 'DEGRADED',
              reason: 'coordination-not-implemented-b1',
              teardownInProgress: false,
              readiness: {
                oneLifecycleOwner: true,
                validRuntimeIdentity: true,
                oneOwnedRoot: true,
                interactionReady: true,
                persistenceAvailable: true,
                bridgeInitialized: true,
                initialObservationAttempted: true,
                featureRegistryInitialized: true,
                teardownRegistered: true,
                coordinationPositive: false
              },
              ui: { rootPresent: true, interactionReady: true }
            };
            const freshRuntime = {
              buildId: bootstrap.buildId,
              packageVersion: bootstrap.packageVersion,
              candidateFingerprint: bootstrap.candidateFingerprint,
              runtimeInstanceId: bootstrap.runtimeInstanceId,
              documentToken: bootstrap.documentToken,
              getHealth: () => currentSnapshot,
              boot: async () => currentSnapshot,
              teardown: async () => currentSnapshot,
              setEnabled: async () => currentSnapshot,
              retryTeardown: async () => currentSnapshot,
              revalidate: async () => currentSnapshot,
              recover: async () => currentSnapshot
            };
            global.window.__squareCoilCompanionRuntime = freshRuntime;
            roots.push({
              dataset: {
                squarecoilCompanionRoot: 'rebuild',
                runtimeInstanceId: bootstrap.runtimeInstanceId,
                buildId: bootstrap.buildId,
                packageVersion: bootstrap.packageVersion,
                candidateFingerprint: bootstrap.candidateFingerprint,
                documentToken: bootstrap.documentToken
              }
            });
            delete global.window.__squareCoilCompanionBootstrap;
            delete global.window.__squareCoilCompanionInjectionClaim;
          }
          return [{ documentId: DOCUMENT_ID, frameId: 0 }];
        }
        const result = await options.func(...(options.args || []));
        return [{ result, documentId: DOCUMENT_ID, frameId: 0 }];
      }
    },
    storage: {
      local: {
        get: async () => ({ timerEnabled }),
        set: async values => {
          if (Object.hasOwn(values, 'timerEnabled')) timerEnabled = values.timerEnabled;
        },
        remove: async () => {}
      }
    },
    runtime: {
      getManifest: () => ({ version: '0.7.1' }),
      onInstalled: { addListener: () => {} },
      onMessage: { addListener: () => {} }
    }
  };

  return {
    enableCalls: () => enableCalls,
    retryCalls: () => retryCalls,
    revalidateCalls: () => revalidateCalls,
    recoverCalls: () => recoverCalls,
    fileInjections: () => fileInjections
  };
}

function loadBackground() {
  const modulePath = require.resolve('../../src/extension/background-entry');
  delete require.cache[modulePath];
  return require(modulePath);
}

test.afterEach(() => {
  delete global.chrome;
  delete global.document;
  delete global.window;
});

test('boot request waits for teardown, retires the old runtime, and injects a fresh generation', async () => {
  const runtimeInstanceId = 'runtime-teardown-race';
  const root = {
    dataset: {
      squarecoilCompanionRoot: 'rebuild',
      runtimeInstanceId,
      buildId: BUILD_ID,
      documentToken: DOCUMENT_TOKEN
    }
  };
  const harness = installChromeHarness({
    timerEnabled: true,
    roots: [root],
    runtimeSnapshot: {
      buildId: BUILD_ID,
      packageVersion: '0.7.1',
      runtimeInstanceId,
      documentToken: DOCUMENT_TOKEN,
      mode: 'DISABLED',
      state: 'DEGRADED',
      reason: 'coordination-not-implemented-b1',
      teardownInProgress: true,
      readiness: null,
      ui: { rootPresent: true, interactionReady: true }
    },
    onSetEnabled: async ({ enabled, currentSnapshot, roots: liveRoots }) => {
      assert.equal(enabled, true);
      liveRoots.splice(0);
      delete global.window.__squareCoilCompanionRuntime;
      return {
        ...currentSnapshot,
        mode: 'ENABLED',
        state: 'UNINITIALIZED',
        reason: 'fresh-runtime-required',
        teardownInProgress: false,
        ui: { rootPresent: false, interactionReady: false }
      };
    }
  });
  const background = loadBackground();

  const result = await background.bootPage(17);

  assert.equal(harness.enableCalls(), 1);
  assert.equal(harness.fileInjections(), 1);
  assert.equal(result.source, 'fresh-boot');
});

test('a newer disable during retirement prevents the older boot from injecting', async () => {
  const runtimeInstanceId = 'runtime-disable-wins';
  const roots = [{
    dataset: {
      squarecoilCompanionRoot: 'rebuild',
      runtimeInstanceId,
      buildId: BUILD_ID,
      documentToken: DOCUMENT_TOKEN
    }
  }];
  const harness = installChromeHarness({
    timerEnabled: true,
    roots,
    runtimeSnapshot: {
      buildId: BUILD_ID,
      packageVersion: '0.7.1',
      runtimeInstanceId,
      documentToken: DOCUMENT_TOKEN,
      mode: 'DISABLED',
      state: 'DEGRADED',
      reason: 'coordination-not-implemented-b1',
      teardownInProgress: true,
      readiness: null,
      ui: { rootPresent: true, interactionReady: true }
    },
    onSetEnabled: async ({ currentSnapshot, roots: liveRoots }) => {
      await global.chrome.storage.local.set({ timerEnabled: false });
      liveRoots.splice(0);
      delete global.window.__squareCoilCompanionRuntime;
      return {
        ...currentSnapshot,
        mode: 'ENABLED',
        state: 'UNINITIALIZED',
        reason: 'fresh-runtime-required',
        teardownInProgress: false,
        ui: { rootPresent: false, interactionReady: false }
      };
    }
  });
  const background = loadBackground();

  const result = await background.bootPage(19);

  assert.equal(harness.enableCalls(), 1);
  assert.equal(harness.fileInjections(), 0);
  assert.equal(result.enabled, false);
  assert.equal(result.health.state, 'UNINITIALIZED');
});

test('BFCache revalidation cannot boot a page while Companion is disabled', async () => {
  const harness = installChromeHarness({ timerEnabled: false });
  const background = loadBackground();

  const result = await background.revalidatePage(23);

  assert.equal(result.enabled, false);
  assert.equal(result.health.state, 'UNINITIALIZED');
  assert.equal(result.health.reason, 'user-disabled');
  assert.equal(harness.fileInjections(), 0);
});

test('disable never invokes an older-build runtime and requires a reload boundary', async () => {
  const olderBuildId = 'rebuild-older-incompatible-build';
  const root = {
    dataset: {
      squarecoilCompanionRoot: 'rebuild',
      runtimeInstanceId: 'runtime-older',
      buildId: olderBuildId,
      documentToken: DOCUMENT_TOKEN
    }
  };
  const harness = installChromeHarness({
    timerEnabled: false,
    roots: [root],
    runtimeSnapshot: {
      buildId: olderBuildId,
      packageVersion: '0.7.0',
      runtimeInstanceId: 'runtime-older',
      documentToken: DOCUMENT_TOKEN,
      mode: 'ENABLED',
      state: 'READY',
      reason: 'ready',
      teardownInProgress: false,
      readiness: {},
      ui: { rootPresent: true, interactionReady: true }
    }
  });
  const background = loadBackground();

  const result = await background.bootPage(29);

  assert.equal(harness.enableCalls(), 0);
  assert.equal(harness.fileInjections(), 0);
  assert.equal(result.enabled, false);
  assert.equal(result.classification, 'VERSION_MISMATCH');
  assert.equal(result.reloadRequired, true);
  assert.equal(result.reason, 'version-mismatch-reload-required');
});

test('disable rechecks identity when a different runtime wins an orphan-removal race', async () => {
  const roots = [];
  let incompatibleEnableCalls = 0;
  const olderSnapshot = {
    buildId: 'rebuild-race-older-build',
    packageVersion: '0.7.0',
    runtimeInstanceId: 'runtime-race-older',
    documentToken: DOCUMENT_TOKEN,
    mode: 'ENABLED',
    state: 'READY',
    reason: 'ready',
    teardownInProgress: false,
    readiness: {},
    ui: { rootPresent: false, interactionReady: false }
  };
  const orphan = {
    dataset: {
      squarecoilCompanionRoot: 'rebuild',
      runtimeInstanceId: 'orphan-runtime',
      buildId: BUILD_ID,
      documentToken: DOCUMENT_TOKEN
    },
    remove() {
      roots.splice(0);
      global.window.__squareCoilCompanionRuntime = {
        buildId: olderSnapshot.buildId,
        runtimeInstanceId: olderSnapshot.runtimeInstanceId,
        documentToken: DOCUMENT_TOKEN,
        getHealth: () => olderSnapshot,
        setEnabled: async () => {
          incompatibleEnableCalls += 1;
          return olderSnapshot;
        }
      };
    }
  };
  roots.push(orphan);
  installChromeHarness({ timerEnabled: true, roots });
  const background = loadBackground();
  await global.chrome.storage.local.set({ timerEnabled: false });

  const result = await background.setPageEnabled(31, false);

  assert.equal(incompatibleEnableCalls, 0);
  assert.equal(result.classification, 'VERSION_MISMATCH');
  assert.equal(result.reloadRequired, true);
});

test('concurrent persistence preflights use isolated probe keys', async () => {
  installChromeHarness({ timerEnabled: true });
  const values = new Map();
  let writes = 0;
  let releaseWrites;
  const bothWritten = new Promise(resolve => { releaseWrites = resolve; });
  global.chrome.storage.local = {
    set: async entries => {
      for (const [key, value] of Object.entries(entries)) values.set(key, value);
      writes += 1;
      if (writes === 2) releaseWrites();
      await bothWritten;
    },
    get: async key => ({ [key]: values.get(key) }),
    remove: async key => { values.delete(key); }
  };
  const background = loadBackground();

  const results = await Promise.all([
    background.checkPersistence(),
    background.checkPersistence()
  ]);

  assert.deepEqual(results, [true, true]);
  assert.equal(values.size, 0);
});

test('UT-B1-LC-23 orchestration keeps disabled checks read-only and exposes only explicit cleanup retry', async () => {
  let cleanupFailuresRemaining = 1;
  const failedSnapshot = {
    buildId: BUILD_ID,
    packageVersion: '0.7.1',
    runtimeInstanceId: 'runtime-cleanup-locked',
    documentToken: DOCUMENT_TOKEN,
    mode: 'DISABLED',
    state: 'FAILED',
    reason: 'teardown-incomplete',
    teardownInProgress: false,
    cleanupRequired: true,
    outstandingResources: ['ownership', 'bridge'],
    readiness: null,
    ui: { rootPresent: false, interactionReady: false }
  };
  const harness = installChromeHarness({
    timerEnabled: false,
    runtimeSnapshot: failedSnapshot,
    onRetryTeardown: async ({ currentSnapshot }) => {
      if (cleanupFailuresRemaining > 0) {
        cleanupFailuresRemaining -= 1;
        return currentSnapshot;
      }
      const clean = {
        ...currentSnapshot,
        state: 'UNINITIALIZED',
        reason: 'teardown-complete',
        cleanupRequired: false,
        outstandingResources: []
      };
      delete global.window.__squareCoilCompanionRuntime;
      return clean;
    }
  });
  const background = loadBackground();

  const disabledBoot = await background.bootPage(37);
  const disabledRevalidate = await background.revalidatePage(37);
  const repeatedDisable = await background.setPageEnabled(37, false);
  await global.chrome.storage.local.set({ timerEnabled: true });
  const blockedEnable = await background.setPageEnabled(37, true);

  for (const result of [disabledBoot, disabledRevalidate, repeatedDisable, blockedEnable]) {
    assert.equal(result.health.state, 'FAILED');
    assert.equal(result.health.reason, 'teardown-incomplete');
  }
  assert.equal(harness.enableCalls(), 0);
  assert.equal(harness.revalidateCalls(), 0);
  assert.equal(harness.recoverCalls(), 0);
  assert.equal(harness.retryCalls(), 0);
  assert.equal(harness.fileInjections(), 0);

  const failedRetry = await background.retryTeardown(37);
  assert.equal(failedRetry.health.state, 'FAILED');
  assert.equal(failedRetry.cleanupComplete, false);
  assert.equal(harness.retryCalls(), 1);
  assert.equal(harness.fileInjections(), 0);

  const successfulRetry = await background.retryTeardown(37);
  assert.equal(successfulRetry.health.state, 'UNINITIALIZED');
  assert.equal(successfulRetry.cleanupComplete, true);
  assert.equal(successfulRetry.restartAvailable, true);
  assert.equal(harness.retryCalls(), 2);
  assert.equal(harness.fileInjections(), 0);

  const freshBoot = await background.bootPage(37);
  assert.equal(freshBoot.injectionPerformed, true);
  assert.equal(harness.fileInjections(), 1);
});

test('disabled observation fails closed when the page cannot be inspected', async () => {
  installChromeHarness({ timerEnabled: false });
  global.chrome.scripting.executeScript = async () => { throw new Error('target-closed'); };
  const background = loadBackground();

  const observed = await background.bootPage(39);
  assert.equal(observed.ok, false);
  assert.equal(observed.classification, 'OWNERSHIP_CONFLICT');
  assert.equal(observed.reason, 'page-inspection-failed');
  assert.equal(observed.reloadRequired, true);

  const disabled = await background.setPageEnabled(39, false);
  assert.equal(disabled.ok, false);
  assert.equal(disabled.reason, 'page-inspection-failed');
  assert.equal(disabled.reloadRequired, true);
});

test('a forged health snapshot cannot hide a mismatched runtime handle', async () => {
  const runtimeInstanceId = 'runtime-forged-health-12345';
  const root = {
    dataset: {
      squarecoilCompanionRoot: 'rebuild',
      runtimeInstanceId,
      buildId: BUILD_ID,
      documentToken: DOCUMENT_TOKEN
    }
  };
  installChromeHarness({
    timerEnabled: true,
    roots: [root],
    runtimeSnapshot: {
      buildId: BUILD_ID,
      runtimeInstanceId,
      documentToken: DOCUMENT_TOKEN,
      mode: 'ENABLED',
      state: 'READY',
      teardownInProgress: false,
      readiness: {
        oneLifecycleOwner: true,
        validRuntimeIdentity: true,
        oneOwnedRoot: true,
        interactionReady: true,
        persistenceAvailable: true,
        bridgeInitialized: true,
        initialObservationAttempted: true,
        featureRegistryInitialized: true,
        teardownRegistered: true,
        coordinationPositive: true
      },
      ui: { rootPresent: true, interactionReady: true }
    }
  });
  global.window.__squareCoilCompanionRuntime.documentToken = 'different-document-token-12345';
  const background = loadBackground();

  const result = await background.getHealth(43);
  assert.equal(result.classification, 'OWNERSHIP_CONFLICT');
  assert.equal(result.reloadRequired, true);
});

test('a stranded valid injection claim requires a reload boundary instead of reinjection', async () => {
  const harness = installChromeHarness({ timerEnabled: true });
  global.window.__squareCoilCompanionInjectionClaim = {
    claimId: 'claim-stranded-12345',
    buildId: BUILD_ID,
    packageVersion: '0.7.1',
    candidateFingerprint: CANDIDATE_FINGERPRINT,
    runtimeInstanceId: 'runtime-stranded-12345',
    documentToken: DOCUMENT_TOKEN
  };
  const background = loadBackground();

  const result = await background.bootPage(47);
  assert.equal(result.classification, 'BOOTING_SAME_BUILD');
  assert.equal(result.reason, 'injection-claim-incomplete');
  assert.equal(result.reloadRequired, true);
  assert.equal(harness.fileInjections(), 0);
});

test('document navigation fencing rejects stale requests before injection', async () => {
  const harness = installChromeHarness({ timerEnabled: true });
  const background = loadBackground();

  const result = await background.bootPage({
    tabId: 53,
    expectedDocumentId: 'previous-document-id',
    documentToken: DOCUMENT_TOKEN,
    source: 'content'
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'document-changed');
  assert.equal(result.reloadRequired, true);
  assert.equal(harness.fileInjections(), 0);
});

test('content setting notifications do not write global settings back out of order', async () => {
  installChromeHarness({ timerEnabled: false });
  let settingWrites = 0;
  global.chrome.storage.local.set = async values => {
    if (Object.hasOwn(values, 'timerEnabled')) settingWrites += 1;
  };
  const background = loadBackground();

  const result = await background.setPageEnabled({
    tabId: 59,
    expectedDocumentId: DOCUMENT_ID,
    documentToken: DOCUMENT_TOKEN,
    source: 'content'
  }, false);
  assert.equal(result.enabled, false);
  assert.equal(settingWrites, 0);
});

test('a stale disable message cannot tear down a runtime after the authoritative setting is enabled', async () => {
  const runtimeInstanceId = 'runtime-authoritative-enabled';
  const root = {
    dataset: {
      squarecoilCompanionRoot: 'rebuild',
      runtimeInstanceId,
      buildId: BUILD_ID,
      documentToken: DOCUMENT_TOKEN
    }
  };
  const harness = installChromeHarness({
    timerEnabled: true,
    roots: [root],
    runtimeSnapshot: {
      buildId: BUILD_ID,
      packageVersion: '0.7.1',
      runtimeInstanceId,
      documentToken: DOCUMENT_TOKEN,
      mode: 'ENABLED',
      state: 'READY',
      reason: 'ready',
      teardownInProgress: false,
      readiness: {
        oneLifecycleOwner: true,
        validRuntimeIdentity: true,
        oneOwnedRoot: true,
        interactionReady: true,
        persistenceAvailable: true,
        bridgeInitialized: true,
        initialObservationAttempted: true,
        featureRegistryInitialized: true,
        teardownRegistered: true,
        coordinationPositive: true
      },
      ui: { rootPresent: true, interactionReady: true }
    }
  });
  const background = loadBackground();

  const result = await background.setPageEnabled({
    tabId: 61,
    expectedDocumentId: DOCUMENT_ID,
    documentToken: DOCUMENT_TOKEN,
    source: 'content'
  }, false);
  assert.equal(result.staleRequestIgnored, true);
  assert.equal(result.enabled, true);
  assert.equal(result.ready, true);
  assert.equal(harness.enableCalls(), 0);
  assert.equal(global.window.__squareCoilCompanionRuntime.runtimeInstanceId, runtimeInstanceId);
});

test('content messages reject unsupported frames before any page operation', () => {
  installChromeHarness({ timerEnabled: true });
  const background = loadBackground();
  const resolved = background.requestFromMessage(
    { type: 'SC_COMPANION_BOOT', documentToken: DOCUMENT_TOKEN },
    {
      tab: { id: 41, url: 'https://ussignandmill.squarecoil.net/jobs/1' },
      url: 'https://ussignandmill.squarecoil.net/jobs/1',
      frameId: 2,
      documentId: 'iframe-document'
    }
  );
  assert.equal(resolved.error, 'unsupported-frame');
});

test('content messages require the exact B1 package candidate identity', () => {
  installChromeHarness({ timerEnabled: true });
  const background = loadBackground();
  const sender = {
    tab: { id: 67, url: 'https://ussignandmill.squarecoil.net/jobs/1' },
    url: 'https://ussignandmill.squarecoil.net/jobs/1',
    frameId: 0,
    documentId: DOCUMENT_ID
  };

  const accepted = background.requestFromMessage({
    type: 'SC_COMPANION_BOOT',
    documentToken: DOCUMENT_TOKEN,
    buildId: BUILD_ID,
    packageVersion: '0.7.1',
    candidateFingerprint: CANDIDATE_FINGERPRINT
  }, sender);
  assert.equal(accepted.error, undefined);
  assert.equal(accepted.request.source, 'content');

  const rejected = background.requestFromMessage({
    type: 'SC_COMPANION_BOOT',
    documentToken: DOCUMENT_TOKEN,
    buildId: BUILD_ID,
    packageVersion: '0.7.1',
    candidateFingerprint: 'b'.repeat(64)
  }, sender);
  assert.equal(rejected.error, 'content-controller-version-mismatch');
  assert.equal(rejected.classification, 'VERSION_MISMATCH');
  assert.equal(rejected.reloadRequired, true);
});

test('terminal recovery exhaustion requires a reload when no safe general retry exists', async () => {
  const runtimeInstanceId = 'runtime-recovery-exhausted';
  const roots = [{
    dataset: {
      squarecoilCompanionRoot: 'rebuild',
      runtimeInstanceId,
      buildId: BUILD_ID,
      packageVersion: '0.7.1',
      candidateFingerprint: CANDIDATE_FINGERPRINT,
      documentToken: DOCUMENT_TOKEN
    }
  }];
  const harness = installChromeHarness({
    timerEnabled: true,
    roots,
    runtimeSnapshot: {
      buildId: BUILD_ID,
      packageVersion: '0.7.1',
      candidateFingerprint: CANDIDATE_FINGERPRINT,
      runtimeInstanceId,
      documentToken: DOCUMENT_TOKEN,
      mode: 'ENABLED',
      state: 'FAILED',
      reason: 'recovery-exhausted',
      teardownInProgress: false,
      cleanupRequired: false,
      outstandingResources: [],
      readiness: null,
      ui: { rootPresent: true, interactionReady: false }
    },
    onSetEnabled: async ({ enabled, currentSnapshot, roots: liveRoots }) => {
      assert.equal(enabled, false);
      liveRoots.splice(0);
      delete global.window.__squareCoilCompanionRuntime;
      return {
        ...currentSnapshot,
        mode: 'DISABLED',
        state: 'UNINITIALIZED',
        reason: 'teardown-complete',
        outstandingResources: [],
        ui: { rootPresent: false, interactionReady: false }
      };
    }
  });
  const background = loadBackground();

  const result = await background.bootPage(71);

  assert.equal(result.ok, false);
  assert.equal(result.classification, 'FAILED_SAME_BUILD');
  assert.equal(result.reason, 'runtime-failed');
  assert.equal(result.reloadRequired, true);
  assert.equal(harness.enableCalls(), 0);
  assert.equal(harness.recoverCalls(), 0);
  assert.equal(harness.fileInjections(), 0);

  await global.chrome.storage.local.set({ timerEnabled: false });
  const disabled = await background.setPageEnabled(71, false);
  assert.equal(disabled.ok, true);
  assert.equal(disabled.enabled, false);
  assert.equal(disabled.health.state, 'UNINITIALIZED');
  assert.equal(disabled.health.reason, 'teardown-complete');
  assert.equal(disabled.reloadRequired, false);
  assert.equal(harness.enableCalls(), 1);
  assert.equal(roots.length, 0);
  assert.equal(global.window.__squareCoilCompanionRuntime, undefined);
});

test('disable cannot report success when runtime ownership remains after an uninitialized result', async () => {
  const runtimeInstanceId = 'runtime-incomplete-disable';
  const roots = [{
    dataset: {
      squarecoilCompanionRoot: 'rebuild',
      runtimeInstanceId,
      buildId: BUILD_ID,
      packageVersion: '0.7.1',
      candidateFingerprint: CANDIDATE_FINGERPRINT,
      documentToken: DOCUMENT_TOKEN
    }
  }];
  const harness = installChromeHarness({
    timerEnabled: false,
    roots,
    runtimeSnapshot: {
      buildId: BUILD_ID,
      packageVersion: '0.7.1',
      candidateFingerprint: CANDIDATE_FINGERPRINT,
      runtimeInstanceId,
      documentToken: DOCUMENT_TOKEN,
      mode: 'ENABLED',
      state: 'DEGRADED',
      reason: 'ui-missing',
      teardownInProgress: false,
      readiness: null,
      ui: { rootPresent: true, interactionReady: false }
    },
    onSetEnabled: async ({ enabled, currentSnapshot }) => {
      assert.equal(enabled, false);
      return {
        ...currentSnapshot,
        mode: 'DISABLED',
        state: 'UNINITIALIZED',
        reason: 'teardown-complete',
        ui: { rootPresent: false, interactionReady: false }
      };
    }
  });
  const background = loadBackground();

  const result = await background.setPageEnabled(73, false);

  assert.equal(harness.enableCalls(), 1);
  assert.equal(result.ok, false);
  assert.equal(result.reloadRequired, true);
  assert.equal(result.reason, 'teardown-complete');
  assert.notEqual(result.classification, 'NONE');
  assert.equal(roots.length, 1);
  assert.notEqual(global.window.__squareCoilCompanionRuntime, undefined);
});
