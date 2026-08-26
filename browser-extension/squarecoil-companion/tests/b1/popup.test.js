'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function deferred() {
  let resolve;
  const promise = new Promise(next => { resolve = next; });
  return { promise, resolve };
}

async function tick(turns = 4) {
  for (let index = 0; index < turns; index += 1) {
    await Promise.resolve();
    await new Promise(resolve => setImmediate(resolve));
  }
}

test('popup ignores an older health response after a newer toggle result', async () => {
  const listeners = new Map();
  const nodes = new Map();
  for (const id of ['classification', 'lifecycle', 'reason', 'runtimeId', 'retryCleanup', 'startFresh', 'enabled', 'refresh', 'version', 'stage']) {
    nodes.set(id, {
      id,
      textContent: '',
      hidden: false,
      checked: true,
      addEventListener(type, listener) { this[`on${type}`] = listener; }
    });
  }
  const document = {
    body: { dataset: {} },
    getElementById: id => nodes.get(id) || null,
    addEventListener: (type, listener) => listeners.set(type, listener)
  };
  const oldHealth = deferred();
  let healthRequested = false;
  const chrome = {
    tabs: { query: async () => [{ id: 7 }] },
    storage: {
      local: {
        get: async () => ({ timerEnabled: true }),
        set: async () => {}
      }
    },
    runtime: {
      getManifest: () => ({ version: '0.7.1' }),
      sendMessage: async message => {
        if (message.type === 'SC_COMPANION_GET_HEALTH') {
          healthRequested = true;
          return oldHealth.promise;
        }
        if (message.type === 'SC_COMPANION_SET_ENABLED') {
          return {
            classification: 'NONE',
            health: { state: 'UNINITIALIZED', mode: 'DISABLED', reason: 'user-disabled' }
          };
        }
        throw new Error(`unexpected message: ${message.type}`);
      }
    }
  };
  const source = fs.readFileSync(path.resolve(__dirname, '../../src/popup/popup.js'), 'utf8');
  vm.runInNewContext(source, { chrome, document, console }, { filename: 'src/popup/popup.js' });
  listeners.get('DOMContentLoaded')();
  while (!healthRequested) await tick(1);

  nodes.get('enabled').checked = false;
  nodes.get('enabled').onchange();
  await tick();
  assert.equal(nodes.get('lifecycle').textContent, 'UNINITIALIZED');
  assert.equal(nodes.get('reason').textContent, 'user-disabled');

  oldHealth.resolve({
    classification: 'DEGRADED_SAME_BUILD',
    health: { state: 'DEGRADED', reason: 'old-health' }
  });
  await tick();
  assert.equal(nodes.get('lifecycle').textContent, 'UNINITIALIZED');
  assert.equal(nodes.get('reason').textContent, 'user-disabled');
});

test('popup refresh waits for an in-flight toggle before reading lifecycle health', async () => {
  const listeners = new Map();
  const nodes = new Map();
  for (const id of ['classification', 'lifecycle', 'reason', 'runtimeId', 'retryCleanup', 'startFresh', 'enabled', 'refresh', 'version', 'stage']) {
    nodes.set(id, {
      id,
      textContent: '',
      hidden: false,
      checked: true,
      addEventListener(type, listener) { this[`on${type}`] = listener; }
    });
  }
  const document = {
    body: { dataset: {} },
    getElementById: id => nodes.get(id) || null,
    addEventListener: (type, listener) => listeners.set(type, listener)
  };
  const storageSet = deferred();
  let healthRequests = 0;
  const chrome = {
    tabs: { query: async () => [{ id: 7 }] },
    storage: {
      local: {
        get: async () => ({ timerEnabled: true }),
        set: async () => storageSet.promise
      }
    },
    runtime: {
      getManifest: () => ({ version: '0.7.1' }),
      sendMessage: async message => {
        if (message.type === 'SC_COMPANION_GET_HEALTH') {
          healthRequests += 1;
          return healthRequests === 1
            ? { classification: 'DEGRADED_SAME_BUILD', health: { state: 'DEGRADED', reason: 'pre-toggle-health' } }
            : { classification: 'NONE', health: { state: 'UNINITIALIZED', mode: 'DISABLED', reason: 'user-disabled' } };
        }
        if (message.type === 'SC_COMPANION_SET_ENABLED') {
          return { classification: 'NONE', health: { state: 'UNINITIALIZED', mode: 'DISABLED', reason: 'user-disabled' } };
        }
        throw new Error(`unexpected message: ${message.type}`);
      }
    }
  };
  const source = fs.readFileSync(path.resolve(__dirname, '../../src/popup/popup.js'), 'utf8');
  vm.runInNewContext(source, { chrome, document, console }, { filename: 'src/popup/popup.js' });
  await listeners.get('DOMContentLoaded')();
  assert.equal(nodes.get('reason').textContent, 'pre-toggle-health');

  nodes.get('enabled').checked = false;
  nodes.get('enabled').onchange();
  nodes.get('refresh').onclick();
  await tick();
  assert.equal(healthRequests, 1);

  storageSet.resolve();
  await tick(8);
  assert.equal(healthRequests, 2);
  assert.equal(nodes.get('lifecycle').textContent, 'UNINITIALIZED');
  assert.equal(nodes.get('reason').textContent, 'user-disabled');
});

test('popup serializes cleanup retry before a following enable intent', async () => {
  const listeners = new Map();
  const nodes = new Map();
  for (const id of ['classification', 'lifecycle', 'reason', 'runtimeId', 'retryCleanup', 'startFresh', 'enabled', 'refresh', 'version', 'stage']) {
    nodes.set(id, {
      id,
      textContent: '',
      hidden: false,
      checked: false,
      addEventListener(type, listener) { this[`on${type}`] = listener; }
    });
  }
  const document = {
    body: { dataset: {} },
    getElementById: id => nodes.get(id) || null,
    addEventListener: (type, listener) => listeners.set(type, listener)
  };
  const retryTabLookup = deferred();
  const messageOrder = [];
  let tabQueries = 0;
  let storedEnabled = false;
  const chrome = {
    tabs: {
      query: async () => {
        tabQueries += 1;
        if (tabQueries === 2) return retryTabLookup.promise;
        return [{ id: 7 }];
      }
    },
    storage: {
      local: {
        get: async () => ({ timerEnabled: storedEnabled }),
        set: async values => { storedEnabled = values.timerEnabled !== false; }
      }
    },
    runtime: {
      getManifest: () => ({ version: '0.7.1' }),
      sendMessage: async message => {
        if (message.type === 'SC_COMPANION_GET_HEALTH') {
          return { classification: 'FAILED_SAME_BUILD', health: { state: 'FAILED', mode: 'DISABLED', reason: 'teardown-incomplete' } };
        }
        messageOrder.push(message.type);
        if (message.type === 'SC_COMPANION_RETRY_TEARDOWN') {
          return { classification: 'NONE', restartAvailable: true, health: { state: 'UNINITIALIZED', mode: 'DISABLED', reason: 'teardown-complete' } };
        }
        if (message.type === 'SC_COMPANION_SET_ENABLED') {
          return { classification: 'DEGRADED_SAME_BUILD', health: { state: 'DEGRADED', mode: 'ENABLED', reason: 'coordination-not-implemented-b1' } };
        }
        throw new Error(`unexpected message: ${message.type}`);
      }
    }
  };
  const source = fs.readFileSync(path.resolve(__dirname, '../../src/popup/popup.js'), 'utf8');
  vm.runInNewContext(source, { chrome, document, console }, { filename: 'src/popup/popup.js' });
  await listeners.get('DOMContentLoaded')();
  assert.equal(nodes.get('reason').textContent, 'teardown-incomplete');

  nodes.get('retryCleanup').onclick();
  await tick();
  nodes.get('enabled').checked = true;
  nodes.get('enabled').onchange();
  await tick();
  assert.deepEqual(messageOrder, []);

  retryTabLookup.resolve([{ id: 7 }]);
  await tick(10);
  assert.deepEqual(messageOrder, ['SC_COMPANION_RETRY_TEARDOWN', 'SC_COMPANION_SET_ENABLED']);
  assert.equal(storedEnabled, true);
  assert.equal(nodes.get('lifecycle').textContent, 'DEGRADED');
  assert.equal(nodes.get('reason').textContent, 'coordination-not-implemented-b1');
});

test('popup marks a missing active tab as attention instead of healthy', async () => {
  const listeners = new Map();
  const nodes = new Map();
  for (const id of ['classification', 'lifecycle', 'reason', 'runtimeId', 'retryCleanup', 'startFresh', 'enabled', 'refresh', 'version', 'stage']) {
    nodes.set(id, {
      id,
      textContent: '',
      hidden: false,
      checked: true,
      addEventListener(type, listener) { this[`on${type}`] = listener; }
    });
  }
  const document = {
    body: { dataset: {} },
    getElementById: id => nodes.get(id) || null,
    addEventListener: (type, listener) => listeners.set(type, listener)
  };
  const chrome = {
    tabs: { query: async () => [] },
    storage: { local: { get: async () => ({ timerEnabled: true }), set: async () => {} } },
    runtime: {
      getManifest: () => ({ version: '0.7.1' }),
      sendMessage: async () => { throw new Error('message should not be sent'); }
    }
  };
  const source = fs.readFileSync(path.resolve(__dirname, '../../src/popup/popup.js'), 'utf8');
  vm.runInNewContext(source, { chrome, document, console }, { filename: 'src/popup/popup.js' });

  await listeners.get('DOMContentLoaded')();

  assert.equal(document.body.dataset.health, 'attention');
  assert.equal(nodes.get('classification').textContent, 'NO_ACTIVE_TAB');
  assert.equal(nodes.get('lifecycle').textContent, 'UNAVAILABLE');
});

test('popup marks a runtime transport error without health as attention', async () => {
  const listeners = new Map();
  const nodes = new Map();
  for (const id of ['classification', 'lifecycle', 'reason', 'runtimeId', 'retryCleanup', 'startFresh', 'enabled', 'refresh', 'version', 'stage']) {
    nodes.set(id, {
      id,
      textContent: '',
      hidden: false,
      checked: true,
      addEventListener(type, listener) { this[`on${type}`] = listener; }
    });
  }
  const document = {
    body: { dataset: {} },
    getElementById: id => nodes.get(id) || null,
    addEventListener: (type, listener) => listeners.set(type, listener)
  };
  const chrome = {
    tabs: { query: async () => [{ id: 7 }] },
    storage: { local: { get: async () => ({ timerEnabled: true }), set: async () => {} } },
    runtime: {
      getManifest: () => ({ version: '0.7.1' }),
      sendMessage: async () => { throw new Error('worker-unavailable'); }
    }
  };
  const source = fs.readFileSync(path.resolve(__dirname, '../../src/popup/popup.js'), 'utf8');
  vm.runInNewContext(source, { chrome, document, console }, { filename: 'src/popup/popup.js' });

  await listeners.get('DOMContentLoaded')();

  assert.equal(document.body.dataset.health, 'attention');
  assert.equal(nodes.get('classification').textContent, 'ERROR');
  assert.equal(nodes.get('lifecycle').textContent, 'UNAVAILABLE');
  assert.equal(nodes.get('reason').textContent, 'worker-unavailable');
});

test('popup gives actionable reload guidance for terminal recovery exhaustion', async () => {
  const listeners = new Map();
  const nodes = new Map();
  for (const id of ['classification', 'lifecycle', 'reason', 'runtimeId', 'retryCleanup', 'startFresh', 'enabled', 'refresh', 'version', 'stage']) {
    nodes.set(id, {
      id,
      textContent: '',
      hidden: false,
      checked: true,
      addEventListener(type, listener) { this[`on${type}`] = listener; }
    });
  }
  const document = {
    body: { dataset: {} },
    getElementById: id => nodes.get(id) || null,
    addEventListener: (type, listener) => listeners.set(type, listener)
  };
  const chrome = {
    tabs: { query: async () => [{ id: 7 }] },
    storage: { local: { get: async () => ({ timerEnabled: true }), set: async () => {} } },
    runtime: {
      getManifest: () => ({ version: '0.7.1' }),
      sendMessage: async () => ({
        ok: false,
        classification: 'FAILED_SAME_BUILD',
        reloadRequired: true,
        reason: 'runtime-failed',
        health: { state: 'FAILED', reason: 'recovery-exhausted' }
      })
    }
  };
  const source = fs.readFileSync(path.resolve(__dirname, '../../src/popup/popup.js'), 'utf8');
  vm.runInNewContext(source, { chrome, document, console }, { filename: 'src/popup/popup.js' });

  await listeners.get('DOMContentLoaded')();

  assert.equal(document.body.dataset.health, 'attention');
  assert.equal(nodes.get('classification').textContent, 'FAILED_SAME_BUILD');
  assert.equal(nodes.get('lifecycle').textContent, 'FAILED');
  assert.equal(nodes.get('reason').textContent, 'recovery-exhausted — Reload the SquareCoil tab.');
  assert.equal(nodes.get('retryCleanup').hidden, true);
});
