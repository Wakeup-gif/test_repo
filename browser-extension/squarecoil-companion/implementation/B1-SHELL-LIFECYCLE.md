# B1 Implementation: Shell / Lifecycle

**Branch:** `rebuild/squarecoil-companion-b1-lifecycle`  
**Status:** Settled - ready for B2  
**Initial implementation commit:** `c109fed7c1bdfab3a3023a58d1ba8966d5fe26b5`  
**Hardened code head:** `466b074035a51a058db99dccbf7a158fbc753c16`  
**Hardening validation run:** `32927221407` - success  
**Depends on:** settled L0-L1  
**Does not implement:** L2 Timer State/Time Ledger/coordination, L3 native clock interpretation, or later feature behavior.

## What B1 implements

- dependency-free modular source under `src/`;
- generated runtime bundles under `dist/` via `npm run build`;
- one isolated content controller;
- one MAIN-world Companion application bundle;
- one page lifecycle owner/global;
- one owned `#ussign-job-timer` shell root;
- interaction-readiness probing that does not depend on root existence alone;
- persistence read/write preflight in the extension controller;
- explicit legacy-runtime, version-mismatch, orphan-root, and ownership-conflict probes;
- safe orphan-root removal only when ownership is unambiguous;
- idempotent runtime boot/teardown and bounded lifecycle recovery;
- BFCache revalidation hook;
- service-worker memory is not used as authoritative page-boot state;
- minimal popup for enablement and lifecycle health;
- Node built-in unit tests for readiness, recovery, teardown, registry, runtime probing, and root recreation;
- CI build/test/validation plus lean Chrome/Edge B1 package artifacts.

## Intentional B1 degraded state

L1 requires a positive one-writer coordination result before `READY`.

B2 owns that coordination system. Therefore the real B1 page bootstrap supplies:

```text
coordinationDisposition = UNAVAILABLE_B1
```

and the live B1 shell truthfully reports:

```text
DEGRADED
coordination-not-implemented-b1
```

Unit tests inject a positive `OWNER` adapter to prove the lifecycle reaches `READY` only when every L1 readiness assertion passes.

This is intentional. B1 must not weaken the READY contract simply to show a green status before B2 exists.

## B1 review and hardening

The first green implementation was not frozen immediately. Review found and corrected lifecycle defects that package validation alone did not catch.

### Fixed in hardening

1. A runtime labeled `READY` is no longer classified healthy merely because one root exists. The external probe also requires the complete readiness snapshot and a live interaction probe.
2. Recreating a removed timer root now rebinds the interaction controller to the new root instead of retaining a stale bound-listener flag.
3. L1 `R1` is now positively checked through an ownership adapter instead of being hard-coded `true`.
4. Sentinel identities such as `runtime-unknown` / `build-unknown` cannot satisfy READY.
5. Teardown invalidates and waits for in-flight boot/recovery/readiness work, preventing READY from publishing after disable/teardown begins.
6. Incomplete teardown remains `FAILED / teardown-incomplete`; the page runtime global is preserved so a replacement runtime cannot be stacked over unreleased resources.
7. Ownership-conflict exceptions become immediate reload-safe `FAILED` states rather than generic recoverable degradation.
8. Recoverable boot/revalidation failures use bounded recovery. The intentional B1 coordination limitation is excluded from pointless recovery loops.
9. Orphan-root cleanup races re-probe the page before declaring an ownership conflict, avoiding a false reload warning when another valid boot won the race.
10. Build/stage identity now comes from one canonical `src/core/build-identity.js` source and is validated against generated build metadata.
11. The isolated content controller reports degraded/reload-required states as attention rather than treating every reusable runtime as healthy.

### Added regressions

Tests now cover:

- dead interaction under a nominal READY state;
- incomplete readiness under a nominal READY state;
- removed-root recreation and interaction rebinding;
- positive lifecycle-owner requirement;
- invalid/sentinel runtime identity;
- disable during BOOTING;
- ownership conflict classification;
- incomplete teardown blocking later boot;
- runtime/root metadata mismatch;
- UNINITIALIZED runtime global not being mistaken for a fresh page.

## Hardening validation evidence

GitHub Actions run `32927221407` passed all required B1 steps on hardened code head `466b074035a51a058db99dccbf7a158fbc753c16`:

1. checkout;
2. Node setup;
3. `npm run check:b1` (build + unit tests + validation);
4. generated JavaScript syntax checks;
5. lean Chrome/Edge package construction;
6. Chrome artifact upload;
7. Edge artifact upload.

Artifacts:

```text
squarecoil-companion-b1-chrome
sha256:80973c7628345181c4013d39ff1da567ac16f51b903af2ed65912210f8bc8453

squarecoil-companion-b1-edge
sha256:fd254aa5395da12334f6f9d3b390f29a6d1d1b96f1f732ad625447760fb83aef
```

These are development-stage B1 packages, not Stable release artifacts.

## Development commands

From `browser-extension/squarecoil-companion`:

```bash
npm run build
npm test
npm run validate
```

or:

```bash
npm run check:b1
```

`dist/` is generated and intentionally not committed. Run the build before loading the branch as an unpacked extension. CI packages only the runtime files needed by Chrome/Edge and excludes tests/source fixtures.

## B1 completion gate result

- lifecycle ownership/readiness contract: PASS
- root-only/dead-interaction false READY regression: PASS
- boot/disable/teardown serialization: PASS
- safe failed-teardown behavior: PASS
- root recreation interaction binding: PASS
- bounded recoverable lifecycle path: PASS
- `check:b1`: PASS
- generated JavaScript syntax: PASS
- Chrome B1 artifact: PASS
- Edge B1 artifact: PASS
- legacy `page/timer-*.js` injection removed from rebuilt controller: PASS
- production `main` unchanged at `9378da24f393b40066816133e7fa0f48063115f0`: PASS

Full packaged browser smoke and Stable acceptance remain governed by L8/B6. B1 is settled for its implementation scope and may be used as the base for B2.

**Next stage:** B2 - State / Ledger / Bridge / Core Timer.

B2 has not started in this B1 hardening pass.
