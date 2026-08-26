'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createFeatureRegistry } = require('../../src/core/feature-registry');

test('feature registry initializes once and tears down in reverse order', async () => {
  const calls = [];
  const registry = createFeatureRegistry();
  registry.register('first', {
    initialize: async () => calls.push('init:first'),
    teardown: async () => calls.push('teardown:first')
  });
  registry.register('second', {
    initialize: async () => calls.push('init:second'),
    teardown: async () => calls.push('teardown:second')
  });

  const firstEnsure = await registry.ensure();
  const secondEnsure = await registry.ensure();
  assert.equal(firstEnsure.initialized, true);
  assert.equal(secondEnsure.initialized, true);
  assert.deepEqual(calls, ['init:first', 'init:second']);

  await registry.teardown();
  assert.deepEqual(calls, ['init:first', 'init:second', 'teardown:second', 'teardown:first']);
});
