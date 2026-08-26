# B1 Implementation: Shell / Lifecycle

**Branch:** `rebuild/squarecoil-companion-b1-lifecycle`  
**Status:** CI green - ready for B1 review  
**Implementation commit:** `c109fed7c1bdfab3a3023a58d1ba8966d5fe26b5`  
**Validation run:** `32926203944` - success  
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
- Node built-in unit tests for readiness, recovery, teardown, registry, and page-runtime classification;
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

## Validation evidence

GitHub Actions run `32926203944` passed all required B1 steps:

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
sha256:c1e4cecc3dccd545fea2bb4467f96371ff0cbd4d246068a850883d63f1640cb1

squarecoil-companion-b1-edge
sha256:a9e801aad9769870da8fd49c4cdc40bf3ab6fd0c708f0dc8f52526b3be1e46c6
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

- `check:b1`: PASS
- generated JavaScript syntax: PASS
- Chrome B1 artifact: PASS
- Edge B1 artifact: PASS
- legacy `page/timer-*.js` injection removed from rebuilt controller: PASS
- root-only readiness impossible by unit contract: PASS
- production `main` unchanged at `9378da24f393b40066816133e7fa0f48063115f0`: PASS

B1 is implementation-complete enough for review. B2 has not started.
