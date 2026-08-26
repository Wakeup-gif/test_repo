'use strict';

function createFeatureRegistry() {
  const features = new Map();
  const initialized = new Set();

  function register(name, feature) {
    const key = String(name || '').trim();
    if (!key) throw new Error('feature name is required');
    if (features.has(key)) throw new Error(`feature already registered: ${key}`);
    features.set(key, feature || {});
    return key;
  }

  async function ensure() {
    for (const [name, feature] of features) {
      if (initialized.has(name)) continue;
      if (typeof feature.initialize === 'function') await feature.initialize();
      initialized.add(name);
    }
    return {
      initialized: initialized.size === features.size,
      teardownRegistered: [...features.values()].every(feature => typeof feature.teardown === 'function')
    };
  }

  async function teardown() {
    const names = [...initialized].reverse();
    const errors = [];
    for (const name of names) {
      const feature = features.get(name);
      try {
        if (feature && typeof feature.teardown === 'function') await feature.teardown();
      } catch (error) {
        errors.push(`${name}:${String(error && (error.message || error) || 'error')}`);
      }
      initialized.delete(name);
    }
    if (errors.length) throw new Error(errors.join('; '));
  }

  function snapshot() {
    return [...features.keys()].map(name => ({ name, initialized: initialized.has(name) }));
  }

  return { register, ensure, teardown, snapshot };
}

module.exports = { createFeatureRegistry };
