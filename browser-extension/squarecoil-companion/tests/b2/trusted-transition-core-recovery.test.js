'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createTrustedTransitionCore } = require('../../src/content/trusted-transition-core');
const { LEGACY_KEYS } = require('../../src/data/legacy-preflight');
const { migrateV07 } = require('../../src/data/migration');
const { createEmptyDocument } = require('../../src/data/model');
const { PREFERENCE_COMMANDS, applyPreferenceCommand } = require('../../src/preferences/preferences');

const NOW_MS = Date.parse('2026-08-28T16:00:00.000Z');
const SESSION_START_MS = Date.parse('2026-08-28T14:00:00.000Z');
const SESSION_END_MS = Date.parse('2026-08-28T15:00:00.000Z');

function ids(namespace) {
  let sequence = 0;
  return prefix => `${namespace}-${prefix}-${String(++sequence).padStart(6, '0')}`;
}

function bridgeFactory(holder = {}) {
  return () => {
    let owner = false;
    let disposed = false;
    const bridge = {
      async ensure(values) { owner = values.owner === true; return bridge.snapshot(); },
      async setOwner(value) { owner = value === true; return bridge.snapshot(); },
      async verifyNow() { return bridge.snapshot(); },
      async teardown() { disposed = true; owner = false; return bridge.snapshot(); },
      snapshot() {
        return { initialized: true, active: !disposed, disposed, owner, capability: 'SYNTHETIC_RECOVERY' };
      }
    };
    holder.value = bridge;
    return bridge;
  };
}

function legacyStorage(initialRaw) {
  const state = { raw: initialRaw, unavailable: false, reads: 0 };
  return {
    state,
    storage: {
      getItem(key) {
        state.reads += 1;
        if (state.unavailable) throw new Error('synthetic-legacy-storage-unavailable');
        return key === LEGACY_KEYS[0] ? state.raw : null;
      },
      setItem() { throw new Error('retained-legacy-source-must-remain-read-only'); },
      removeItem() { throw new Error('retained-legacy-source-must-remain-read-only'); }
    }
  };
}

function authoritativeStore(initialDocument) {
  let document = structuredClone(initialDocument);
  const stats = { migrationCommands: 0, preferenceCommands: 0 };
  const subscribers = new Set();

  function publish() {
    const event = { document: structuredClone(document) };
    for (const subscriber of subscribers) subscriber(event);
  }

  function client(runtimeInstanceId, options = {}) {
    let remainingPreferenceFailures = options.preferenceFailures || 0;
    const runtimeStats = { migrationCommands: 0, preferenceCommands: 0 };
    const authoritySnapshot = Object.freeze({
      healthy: true,
      disposition: 'OWNER',
      coordinationEpoch: 1,
      workerInstanceId: 'worker-trusted-recovery-001',
      runtimeInstanceId,
      documentToken: `document-${runtimeInstanceId}`,
      nativeObservationAvailable: true
    });
    const read = () => ({ document: structuredClone(document) });

    const value = {
      async ensure() { return { initialRead: read() }; },
      async read() { return read(); },
      snapshot() { return authoritySnapshot; },
      subscribe(subscriber) {
        subscribers.add(subscriber);
        return () => subscribers.delete(subscriber);
      },
      async migrationCommand(command) {
        stats.migrationCommands += 1;
        runtimeStats.migrationCommands += 1;
        assert.equal(command.expectedRevision, document.revision);
        const result = migrateV07(document, command.legacySources, { nowMs: NOW_MS });
        if (result.migrated) {
          const next = structuredClone(result.document);
          next.revision = document.revision + 1;
          next.updatedAtMs = NOW_MS;
          document = next;
          publish();
        }
        return result;
      },
      async command(command) {
        if (command.type !== PREFERENCE_COMMANDS.INITIALIZE) {
          throw new Error(`unexpected-authority-command:${command.type}`);
        }
        stats.preferenceCommands += 1;
        runtimeStats.preferenceCommands += 1;
        if (remainingPreferenceFailures > 0) {
          remainingPreferenceFailures -= 1;
          throw new Error('synthetic-preference-initialization-failure');
        }
        assert.equal(command.expectedRevision, document.revision);
        const next = structuredClone(document);
        const result = applyPreferenceCommand(next, command);
        next.revision = document.revision + 1;
        next.updatedAtMs = NOW_MS;
        document = next;
        publish();
        return result;
      }
    };
    return { value, stats: runtimeStats };
  }

  return {
    client,
    stats,
    document() { return structuredClone(document); }
  };
}

function emptyDocument() {
  return createEmptyDocument({ nowMs: 1, workdayZone: 'UTC', datasetId: 'trusted-recovery-fixture' });
}

function migratedDocument(raw) {
  const result = migrateV07(emptyDocument(), { [LEGACY_KEYS[0]]: raw }, { nowMs: NOW_MS });
  const document = structuredClone(result.document);
  document.revision = 1;
  document.updatedAtMs = NOW_MS;
  return document;
}

function preferenceLegacyRaw() {
  return JSON.stringify({
    contexts: {
      'job:260828': {
        key: 'job:260828',
        type: 'job',
        projectId: '260828',
        label: '260828 - Recovery Fixture',
        shortLabel: '260828',
        accumulatedMs: SESSION_END_MS - SESSION_START_MS,
        sessions: [{
          id: 'legacy-recovery-session-001',
          cycleId: 'legacy-recovery-cycle-001',
          startAt: SESSION_START_MS,
          endAt: SESSION_END_MS,
          durationMs: SESSION_END_MS - SESSION_START_MS
        }]
      }
    },
    settings: {
      themePreference: 'auto',
      timerSurface: 'glass',
      squareCoilTheme: 'dark',
      yellow: 15,
      orange: 45,
      red: 90
    }
  });
}

test('UT-B2-MIG-029 explicit settlement re-inspects transient and source-change preflight failures', async () => {
  const retainedRaw = JSON.stringify({ contexts: {} });
  const legacy = legacyStorage(retainedRaw);
  const store = authoritativeStore(migratedDocument(retainedRaw));
  const authority = store.client('runtime-preflight-reinspection-001');
  const core = createTrustedTransitionCore({
    authorityClient: authority.value,
    legacyStorage: legacy.storage,
    now: () => NOW_MS,
    randomId: ids('preflight-reinspection'),
    createBridge: bridgeFactory()
  });

  legacy.state.unavailable = true;
  const unavailable = await core.ensure();
  assert.equal(unavailable.blocked, true);
  assert.equal(unavailable.preflight.disposition, 'UNAVAILABLE');

  legacy.state.unavailable = false;
  const recoveredUnavailable = await core.settle();
  assert.equal(recoveredUnavailable.blocked, false);
  assert.equal(recoveredUnavailable.preflight.disposition, 'COMPLETE_MATCH');
  assert.notEqual(recoveredUnavailable.bridge, null);

  legacy.state.raw = '{malformed';
  const failed = await core.settle();
  assert.equal(failed.blocked, true);
  assert.equal(failed.preflight.disposition, 'FAILED');
  legacy.state.raw = retainedRaw;
  assert.equal((await core.settle()).blocked, false);

  legacy.state.raw = JSON.stringify({ contexts: { changed: {} } });
  const changed = await core.settle();
  assert.equal(changed.blocked, true);
  assert.equal(changed.preflight.disposition, 'SOURCE_CHANGED_AFTER_COMPLETION');
  assert.equal((await core.settle()).blocked, true);
  legacy.state.raw = retainedRaw;
  const restored = await core.settle();
  assert.equal(restored.blocked, false);
  assert.equal(restored.preflight.disposition, 'COMPLETE_MATCH');
  assert.equal(store.stats.migrationCommands, 0);
  assert.equal(store.stats.preferenceCommands, 0);
  assert.equal(legacy.state.raw, retainedRaw);

  await core.teardown();
});

test('UT-B2-MIG-030 same-core retry initializes bounded legacy preferences after migration already committed', async () => {
  const retainedRaw = preferenceLegacyRaw();
  const legacy = legacyStorage(retainedRaw);
  const store = authoritativeStore(emptyDocument());
  const authority = store.client('runtime-same-core-preference-retry-001', { preferenceFailures: 1 });
  const core = createTrustedTransitionCore({
    authorityClient: authority.value,
    legacyStorage: legacy.storage,
    now: () => NOW_MS,
    randomId: ids('same-core-preference-retry'),
    createBridge: bridgeFactory()
  });

  const deferred = await core.ensure();
  assert.equal(deferred.blocked, false);
  assert.equal(deferred.preflight.disposition, 'COMPLETE_MATCH');
  assert.equal(deferred.preferences.initialized, false);
  assert.equal(store.document().ledger.length, 1);
  assert.equal(store.stats.migrationCommands, 1);
  assert.equal(store.stats.preferenceCommands, 1);

  const recovered = await core.settle();
  assert.equal(recovered.preferences.initialized, true);
  assert.equal(recovered.preferences.timerAppearance, 'AUTO');
  assert.equal(recovered.preferences.panelFinish, 'GLASS');
  assert.equal(recovered.preferences.websiteTheme, 'SLEEK_DARK');
  assert.deepEqual([
    recovered.preferences.yellowMinutes,
    recovered.preferences.orangeMinutes,
    recovered.preferences.redMinutes
  ], [15, 45, 90]);
  assert.equal(store.document().ledger.length, 1);
  assert.equal(store.stats.migrationCommands, 1);
  assert.equal(store.stats.preferenceCommands, 2);
  assert.equal(store.document().revision, 2);
  assert.equal(legacy.state.raw, retainedRaw);

  await core.teardown();
});

test('UT-B2-MIG-031 fresh runtime rederives retained preferences without re-running Timer or Ledger migration', async () => {
  const retainedRaw = preferenceLegacyRaw();
  const legacy = legacyStorage(retainedRaw);
  const store = authoritativeStore(emptyDocument());
  const firstAuthority = store.client('runtime-fresh-preference-source-001', { preferenceFailures: 1 });
  const firstCore = createTrustedTransitionCore({
    authorityClient: firstAuthority.value,
    legacyStorage: legacy.storage,
    now: () => NOW_MS,
    randomId: ids('fresh-preference-source'),
    createBridge: bridgeFactory()
  });

  const deferred = await firstCore.ensure();
  assert.equal(deferred.preferences.initialized, false);
  assert.equal(store.stats.migrationCommands, 1);
  assert.equal(store.document().ledger.length, 1);
  await firstCore.teardown();

  const retryAuthority = store.client('runtime-fresh-preference-retry-002');
  const retryCore = createTrustedTransitionCore({
    authorityClient: retryAuthority.value,
    legacyStorage: legacy.storage,
    now: () => NOW_MS,
    randomId: ids('fresh-preference-retry'),
    createBridge: bridgeFactory()
  });
  const recovered = await retryCore.ensure();

  assert.equal(recovered.blocked, false);
  assert.equal(recovered.preflight.disposition, 'COMPLETE_MATCH');
  assert.equal(recovered.preferences.initialized, true);
  assert.equal(recovered.preferences.timerAppearance, 'AUTO');
  assert.equal(recovered.preferences.panelFinish, 'GLASS');
  assert.equal(recovered.preferences.websiteTheme, 'SLEEK_DARK');
  assert.equal(store.document().ledger.length, 1);
  assert.equal(store.stats.migrationCommands, 1);
  assert.equal(firstAuthority.stats.migrationCommands, 1);
  assert.equal(retryAuthority.stats.migrationCommands, 0);
  assert.equal(store.stats.preferenceCommands, 2);
  assert.equal(store.document().revision, 2);
  assert.equal(Object.keys(store.document().migration.completedSources).length, 1);
  assert.equal(legacy.state.raw, retainedRaw);

  await retryCore.teardown();
});
