'use strict';

const POSITIVE_AUTHORITY = new Set(['OWNER', 'OBSERVER_CONNECTED']);
const SETTLED_MIGRATION = new Set(['NOT_REQUIRED', 'COMPLETE_MATCH']);
const USABLE_BRIDGE = new Set(['FULL', 'VERIFICATION_FALLBACK', 'DOM_FALLBACK', 'SERVER_FALLBACK']);

const SHELL_REQUIREMENTS = Object.freeze([
  'oneLifecycleOwner',
  'validRuntimeIdentity',
  'oneOwnedRoot',
  'interactionReady',
  'persistenceAvailable',
  'bridgeInitialized',
  'initialObservationAttempted',
  'featureRegistryInitialized',
  'teardownRegistered'
]);

function failure(reason, details = {}) {
  return Object.freeze({ ready: false, reason, ...details });
}

function evaluateB2ReadySettlement(shellHealth, authority, core) {
  const readiness = shellHealth?.readiness;
  if (
    shellHealth?.mode !== 'ENABLED' ||
    shellHealth?.teardownInProgress === true ||
    !readiness ||
    !SHELL_REQUIREMENTS.every(key => readiness[key] === true)
  ) return failure(shellHealth?.reason || 'lifecycle-prerequisite-incomplete');

  if (authority?.enabled !== true || authority?.healthy !== true || !POSITIVE_AUTHORITY.has(authority.disposition)) {
    return failure('coordination-unavailable', { authorityDisposition: authority?.disposition || 'UNAVAILABLE' });
  }
  if (core?.initialized !== true || core?.disposed === true) return failure('trusted-core-not-initialized');
  if (core.blocked === true) return failure(core?.preflight?.reason || 'trusted-core-blocked');
  const migrationDisposition = core?.preflight?.disposition;
  if (!SETTLED_MIGRATION.has(migrationDisposition)) {
    return failure(core?.preflight?.reason || 'migration-unsettled', { migrationDisposition: migrationDisposition || 'UNAVAILABLE' });
  }
  if (core.readModelError) return failure('trusted-core-read-model-failed');

  const bridge = core.bridge;
  if (
    bridge?.initialized !== true ||
    bridge?.active !== true ||
    bridge?.disposed === true ||
    bridge?.listenersAttached !== true
  ) return failure('bridge-not-initialized');
  if (!USABLE_BRIDGE.has(bridge.capability)) {
    return failure('bridge-unavailable', { bridgeCapability: bridge?.capability || 'UNAVAILABLE' });
  }
  if (authority.disposition === 'OWNER' && !Number.isSafeInteger(bridge.requestCount)) {
    return failure('bridge-initial-observation-missing');
  }

  return Object.freeze({
    ready: true,
    reason: 'ready',
    authorityDisposition: authority.disposition,
    migrationDisposition,
    bridgeCapability: bridge.capability
  });
}

module.exports = {
  POSITIVE_AUTHORITY,
  SETTLED_MIGRATION,
  USABLE_BRIDGE,
  SHELL_REQUIREMENTS,
  evaluateB2ReadySettlement
};
