'use strict';

const PROBE_RESULTS = Object.freeze({
  NONE: 'NONE',
  HEALTHY_SAME_BUILD: 'HEALTHY_SAME_BUILD',
  BOOTING_SAME_BUILD: 'BOOTING_SAME_BUILD',
  DEGRADED_SAME_BUILD: 'DEGRADED_SAME_BUILD',
  RECOVERING_SAME_BUILD: 'RECOVERING_SAME_BUILD',
  FAILED_SAME_BUILD: 'FAILED_SAME_BUILD',
  VERSION_MISMATCH: 'VERSION_MISMATCH',
  LEGACY_RUNTIME: 'LEGACY_RUNTIME',
  OWNERSHIP_CONFLICT: 'OWNERSHIP_CONFLICT',
  ORPHAN_ROOT_ONLY: 'ORPHAN_ROOT_ONLY'
});

function classifyRuntimeProbe(probe = {}, targetBuildId) {
  const runtime = probe.runtimeSnapshot || null;
  const rootCount = Number(probe.rootCount || 0);
  const roots = Array.isArray(probe.roots) ? probe.roots : [];
  const hasLegacy = probe.hasLegacyRuntime === true;

  if (runtime && hasLegacy) return PROBE_RESULTS.OWNERSHIP_CONFLICT;

  if (runtime) {
    if (runtime.buildId !== targetBuildId) return PROBE_RESULTS.VERSION_MISMATCH;
    if (rootCount > 1) return PROBE_RESULTS.OWNERSHIP_CONFLICT;
    if (rootCount === 1) {
      const root = roots[0] || {};
      if (root.runtimeInstanceId && root.runtimeInstanceId !== runtime.runtimeInstanceId) {
        return PROBE_RESULTS.OWNERSHIP_CONFLICT;
      }
    }

    switch (runtime.state) {
      case 'READY':
        return rootCount === 1 ? PROBE_RESULTS.HEALTHY_SAME_BUILD : PROBE_RESULTS.DEGRADED_SAME_BUILD;
      case 'BOOTING': return PROBE_RESULTS.BOOTING_SAME_BUILD;
      case 'DEGRADED': return PROBE_RESULTS.DEGRADED_SAME_BUILD;
      case 'RECOVERING': return PROBE_RESULTS.RECOVERING_SAME_BUILD;
      case 'FAILED': return PROBE_RESULTS.FAILED_SAME_BUILD;
      case 'UNINITIALIZED': return rootCount ? PROBE_RESULTS.DEGRADED_SAME_BUILD : PROBE_RESULTS.NONE;
      default: return PROBE_RESULTS.OWNERSHIP_CONFLICT;
    }
  }

  if (hasLegacy) return PROBE_RESULTS.LEGACY_RUNTIME;

  if (rootCount > 1) return PROBE_RESULTS.OWNERSHIP_CONFLICT;
  if (rootCount === 1) {
    const root = roots[0] || {};
    return root.rebuildOwned === true ? PROBE_RESULTS.ORPHAN_ROOT_ONLY : PROBE_RESULTS.OWNERSHIP_CONFLICT;
  }

  return PROBE_RESULTS.NONE;
}

module.exports = { PROBE_RESULTS, classifyRuntimeProbe };
