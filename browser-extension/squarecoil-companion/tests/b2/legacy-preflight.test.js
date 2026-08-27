'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { LEGACY_KEYS, inspectLegacyPresence } = require('../../src/data/legacy-preflight');

test('UT-B2-MIG-015 legacy preflight reports presence without retaining, exposing, rewriting, or deleting source bytes', () => {
  const source = new Map([[LEGACY_KEYS[0], '{"private":"unchanged"}']]);
  const reads = [];
  const storage = {
    getItem(key) {
      reads.push(key);
      return source.has(key) ? source.get(key) : null;
    },
    setItem() { throw new Error('legacy-preflight-must-not-write'); },
    removeItem() { throw new Error('legacy-preflight-must-not-delete'); }
  };

  const before = new Map(source);
  const result = inspectLegacyPresence(storage);

  assert.equal(result.checked, true);
  assert.equal(result.blocked, true);
  assert.equal(result.reason, 'legacy-migration-required');
  assert.deepEqual(result.presentKeys, [LEGACY_KEYS[0]]);
  assert.deepEqual(reads, LEGACY_KEYS);
  assert.deepEqual(source, before);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.presentKeys), true);
});

test('UT-B2-MIG-016 inaccessible legacy storage fails closed without exposing values', () => {
  const result = inspectLegacyPresence({
    getItem() { throw new Error('synthetic-denial-with-sensitive-detail'); }
  });

  assert.deepEqual(result, {
    checked: false,
    blocked: true,
    reason: 'legacy-preflight-unavailable',
    presentKeys: []
  });
});
