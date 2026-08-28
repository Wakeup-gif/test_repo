'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDefaultAuthorityKernel, AUTHORITY_STORAGE_KEY } = require('../../src/extension/authority-kernel');
const { createAuthorityRouter } = require('../../src/extension/authority-router');
const { createAuthorityClient } = require('../../src/extension/authority-client');
const { AUTHORITY_MESSAGES, AUTHORITY_PROTOCOL_VERSION } = require('../../src/extension/authority-protocol');
const { createTrustedTransitionCore } = require('../../src/content/trusted-transition-core');
const { LEGACY_KEYS } = require('../../src/data/legacy-preflight');

class FakeTimers {
  constructor() { this.intervals = new Map(); this.sequence = 0; }
  setTimeout(callback, delayMs) { return setTimeout(callback, delayMs); }
  clearTimeout(id) { clearTimeout(id); }
  setInterval(callback, delayMs) {
    const id = ++this.sequence;
    this.intervals.set(id, { callback, delayMs });
    return id;
  }
  clearInterval(id) { this.intervals.delete(id); }
}

function ids(namespace) {
  let sequence = 0;
  return prefix => `${namespace}-${prefix}-${String(++sequence).padStart(6, '0')}`;
}

function createFixture() {
  const values = {};
  const area = {
    async get(key) { return { [key]: values[key] === undefined ? undefined : structuredClone(values[key]) }; },
    async set(patch) { Object.assign(values, structuredClone(patch)); },
    read() { return structuredClone(values[AUTHORITY_STORAGE_KEY]); }
  };
  let lockQueue = Promise.resolve();
  const lockManager = {
    request(_name, _options, callback) {
      const run = lockQueue.then(callback, callback);
      lockQueue = run.then(() => undefined, () => undefined);
      return run;
    }
  };
  const clock = { value: 1_000 };
  const kernel = createDefaultAuthorityKernel({
    area,
    lockManager,
    runtimeWorkdayZone: 'UTC',
    now: () => clock.value,
    makeId: ids('kernel-core'),
    leaseDurationMs: 60_000,
    buildVersion: '0.8.0-b2.2'
  });
  const clients = [];
  const router = createAuthorityRouter({
    adapter: kernel,
    workerInstanceId: 'worker-trusted-core-001',
    randomId: ids('router-core'),
    publish: async update => {
      for (const client of clients) {
        client.handleWorkerUpdate({
          type: AUTHORITY_MESSAGES.UPDATE,
          protocolVersion: AUTHORITY_PROTOCOL_VERSION,
          ...update
        });
      }
      return true;
    }
  });
  function client(tabId, runtimeInstanceId) {
    const documentToken = `document-trusted-core-${tabId}`;
    const context = {
      tabId,
      expectedDocumentId: `browser-document-${tabId}`,
      documentToken,
      buildId: 'build-trusted-core-integration',
      packageVersion: '0.8.0-b2.2',
      candidateFingerprint: 'd'.repeat(64)
    };
    const value = createAuthorityClient({
      send: message => router.route(context, message),
      runtimeInstanceId,
      documentToken,
      runtimeOnMessage: null,
      requestTimeoutMs: 2_000,
      heartbeatIntervalMs: 30_000,
      randomId: ids(`client-core-${tabId}`),
      timers: new FakeTimers()
    });
    clients.push(value);
    return value;
  }
  return { area, clock, client };
}

function contextEvent(type, bridgeSeq, context, atMs, priorContextId = null) {
  return {
    type,
    bridgeGeneration: 1,
    bridgeSeq,
    observationId: `integration-observation-${bridgeSeq}`,
    observedAtMs: atMs,
    source: 'SERVER_ACTION_7',
    stateCertainty: 'VERIFIED_SERVER',
    boundaryAtMs: ['CONTEXT_DETECTED', 'CONTEXT_CHANGED'].includes(type) ? atMs : null,
    boundaryCertainty: ['CONTEXT_DETECTED', 'CONTEXT_CHANGED'].includes(type) ? 'DETECTED' : 'NONE',
    transitionCandidateId: null,
    verificationId: `integration-verification-${bridgeSeq}`,
    priorContextId,
    context
  };
}

function job(projectId, label) {
  return {
    contextId: `job:${projectId}`,
    kind: 'job',
    projectId,
    label,
    shortLabel: projectId
  };
}

function bridgeFactory(holder, initialEvents = []) {
  return options => {
    let owner = false;
    let disposed = false;
    const bridge = {
      async ensure(value) {
        owner = value.owner === true;
        if (owner && initialEvents.length) await options.onEvents(initialEvents);
        return bridge.snapshot();
      },
      async setOwner(value) { owner = value === true; return bridge.snapshot(); },
      async verifyNow() { return bridge.snapshot(); },
      async teardown() { disposed = true; owner = false; return bridge.snapshot(); },
      snapshot() {
        return { initialized: true, active: !disposed, disposed, owner, capability: 'SYNTHETIC_A3' };
      },
      async emit(events) {
        if (!owner || disposed) throw new Error('synthetic-bridge-not-owner');
        return options.onEvents(events);
      }
    };
    holder.value = bridge;
    return bridge;
  };
}

const emptyLegacyStorage = { getItem() { return null; } };

async function waitFor(predicate, message) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  assert.fail(message);
}

test('IT-B2-BRIDGE-TIMER-001 Bridge events cross the owner fence into one Timer/Ledger truth and synchronized read models', async () => {
  const fixture = createFixture();
  const ownerClient = fixture.client(301, 'runtime-trusted-owner-0001');
  const observerClient = fixture.client(302, 'runtime-trusted-observer-01');
  const ownerBridge = {};
  const first = contextEvent(
    'CONTEXT_DETECTED',
    1,
    job('260701', '260701 - Design'),
    1_000
  );
  const ownerCore = createTrustedTransitionCore({
    authorityClient: ownerClient,
    legacyStorage: emptyLegacyStorage,
    now: () => fixture.clock.value,
    randomId: ids('owner-core-command'),
    createBridge: bridgeFactory(ownerBridge, [first])
  });
  await ownerCore.ensure();
  assert.equal(ownerCore.snapshot().readModelError, null);
  assert.equal(ownerCore.snapshot().timer.timerState, 'ACTIVE');
  assert.equal(ownerCore.snapshot().timer.currentContextId, 'job:260701');

  const observerBridge = {};
  const observerCore = createTrustedTransitionCore({
    authorityClient: observerClient,
    legacyStorage: emptyLegacyStorage,
    now: () => fixture.clock.value,
    randomId: ids('observer-core-command'),
    createBridge: bridgeFactory(observerBridge)
  });
  await observerCore.ensure();
  assert.equal(observerCore.snapshot().authorityOwner, false);
  assert.equal(observerCore.snapshot().timer.currentContextId, 'job:260701');

  const publicActive = await observerClient.read();
  assert.equal(publicActive.document.authorityView.redacted, true);
  assert.equal(Object.hasOwn(publicActive.document.timer.active, 'accrualOwnerToken'), false);
  assert.equal(publicActive.document.timer.active.accrualOwnershipBound, true);

  fixture.clock.value = 1_500;
  await ownerBridge.value.emit([
    contextEvent(
      'CONTEXT_CHANGED',
      2,
      job('260702', '260702 - Fabrication'),
      1_500,
      'job:260701'
    )
  ]);
  assert.equal(ownerCore.snapshot().timer.currentContextId, 'job:260702');
  assert.equal(ownerCore.snapshot().timer.selectedContextTotalMs, 0);
  assert.equal(observerCore.snapshot().timer.currentContextId, 'job:260702');
  assert.equal(fixture.area.read().document.ledger.length, 1);
  assert.equal(fixture.area.read().document.ledger[0].durationMs, 500);

  fixture.clock.value = 1_800;
  const disabled = await ownerCore.prepareDisable();
  const revisionAfterDisable = fixture.area.read().document.revision;
  await ownerCore.prepareDisable();
  assert.equal(disabled.disabled, true);
  assert.equal(fixture.area.read().document.revision, revisionAfterDisable);
  assert.equal(fixture.area.read().document.timer.active, null);
  assert.deepEqual(fixture.area.read().document.ledger.map(row => row.durationMs), [500, 300]);

  await observerCore.teardown();
  await ownerCore.teardown();
  await observerClient.teardown();
  await ownerClient.teardown();
});

test('IT-B2-BRIDGE-TIMER-002 MIG-C01 production OWNER performs one migration before creating the Bridge', async () => {
  const fixture = createFixture();
  const client = fixture.client(401, 'runtime-legacy-blocked-001');
  let bridgeCreated = false;
  const core = createTrustedTransitionCore({
    authorityClient: client,
    legacyStorage: {
      getItem(key) { return key === LEGACY_KEYS[0] ? '{"contexts":{}}' : null; }
    },
    now: () => fixture.clock.value,
    randomId: ids('legacy-core-command'),
    createBridge: bridgeFactory({})
  });

  const result = await core.ensure();
  bridgeCreated = result.bridge !== null;
  assert.equal(result.blocked, false, JSON.stringify(result));
  assert.equal(result.preflight.disposition, 'COMPLETE_MATCH');
  assert.equal(bridgeCreated, true);
  assert.equal(fixture.area.read().document.migration.completedSources['squarecoil-v07-localstorage-v1'].completionState, 'COMPLETE');
  assert.equal(fixture.area.read().document.revision, 1);
  assert.equal(JSON.stringify(result).includes('synthetic'), false);

  await core.teardown();
  await client.teardown();
});

test('IT-B2-BRIDGE-TIMER-003 MIG-C02 waiting OBSERVER adopts completed migration without reload or duplicate import', async () => {
  const fixture = createFixture();
  const ownerClient = fixture.client(501, 'runtime-migration-owner-001');
  const observerClient = fixture.client(502, 'runtime-migration-observer-01');
  const legacyStorage = { getItem(key) { return key === LEGACY_KEYS[0] ? '{"contexts":{}}' : null; } };
  await ownerClient.ensure();

  let observerMigrationCommands = 0;
  const observerAuthority = { ...observerClient, migrationCommand: (...args) => {
    observerMigrationCommands += 1;
    return observerClient.migrationCommand(...args);
  } };
  const observerBridge = {};
  const observerCore = createTrustedTransitionCore({
    authorityClient: observerAuthority,
    legacyStorage,
    now: () => fixture.clock.value,
    randomId: ids('migration-observer-command'),
    createBridge: bridgeFactory(observerBridge)
  });
  assert.equal((await observerCore.ensure()).preflight.disposition, 'REQUIRED');
  assert.equal(observerCore.snapshot().bridge, null);

  let ownerMigrationCommands = 0;
  const ownerAuthority = { ...ownerClient, migrationCommand: (...args) => {
    ownerMigrationCommands += 1;
    return ownerClient.migrationCommand(...args);
  } };
  const ownerCore = createTrustedTransitionCore({
    authorityClient: ownerAuthority,
    legacyStorage,
    now: () => fixture.clock.value,
    randomId: ids('migration-owner-command'),
    createBridge: bridgeFactory({})
  });
  await ownerCore.ensure();
  await waitFor(() => observerCore.snapshot().bridge !== null,
    'waiting observer did not adopt completed migration');

  assert.equal(ownerMigrationCommands, 1);
  assert.equal(observerMigrationCommands, 0);
  assert.equal(observerCore.snapshot().preflight.disposition, 'COMPLETE_MATCH');
  assert.equal(observerCore.snapshot().blocked, false);
  assert.equal(fixture.area.read().document.revision, 1);
  assert.equal(Object.keys(fixture.area.read().document.migration.completedSources).length, 1);

  await observerCore.teardown();
  await ownerCore.teardown();
  await observerClient.teardown();
  await ownerClient.teardown();
});

test('IT-B2-BRIDGE-TIMER-004 MIG-C02 waiting OBSERVER migrates after fenced ownership transfer', async () => {
  const fixture = createFixture();
  const firstOwner = fixture.client(601, 'runtime-migration-first-owner');
  const waitingClient = fixture.client(602, 'runtime-migration-waiting-001');
  const legacyStorage = { getItem(key) { return key === LEGACY_KEYS[0] ? '{"contexts":{}}' : null; } };
  await firstOwner.ensure();

  let migrationCommands = 0;
  const waitingAuthority = { ...waitingClient, migrationCommand: (...args) => {
    migrationCommands += 1;
    return waitingClient.migrationCommand(...args);
  } };
  const waitingCore = createTrustedTransitionCore({
    authorityClient: waitingAuthority,
    legacyStorage,
    now: () => fixture.clock.value,
    randomId: ids('migration-takeover-command'),
    createBridge: bridgeFactory({})
  });
  assert.equal((await waitingCore.ensure()).preflight.disposition, 'REQUIRED');
  await firstOwner.teardown();
  fixture.clock.value += 60_001;
  await waitingClient.heartbeat();
  await waitingCore.handleAuthoritySnapshot(waitingClient.snapshot());

  assert.equal(waitingCore.snapshot().authorityOwner, true);
  assert.equal(waitingCore.snapshot().preflight.disposition, 'COMPLETE_MATCH');
  assert.equal(waitingCore.snapshot().blocked, false);
  assert.notEqual(waitingCore.snapshot().bridge, null);
  assert.equal(migrationCommands, 1);
  assert.equal(fixture.area.read().document.revision, 1);

  await waitingCore.teardown();
  await waitingClient.teardown();
});
