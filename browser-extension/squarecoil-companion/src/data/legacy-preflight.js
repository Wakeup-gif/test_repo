'use strict';

const { LEGACY_SOURCE_KEYS } = require('./migration-schema');

const LEGACY_KEYS = Object.freeze(Object.values(LEGACY_SOURCE_KEYS));

function inspectLegacyPresence(storage) {
  if (!storage || typeof storage.getItem !== 'function') {
    throw new Error('legacy-preflight-storage-reader-required');
  }
  const presentKeys = [];
  for (const key of LEGACY_KEYS) {
    let value;
    try {
      value = storage.getItem(key);
    } catch (_) {
      return Object.freeze({
        checked: false,
        blocked: true,
        reason: 'legacy-preflight-unavailable',
        presentKeys: Object.freeze([])
      });
    }
    if (value !== null && value !== undefined) presentKeys.push(key);
  }
  return Object.freeze({
    checked: true,
    blocked: presentKeys.length > 0,
    reason: presentKeys.length ? 'legacy-migration-required' : 'legacy-source-absent',
    presentKeys: Object.freeze(presentKeys)
  });
}

module.exports = { LEGACY_KEYS, inspectLegacyPresence };
