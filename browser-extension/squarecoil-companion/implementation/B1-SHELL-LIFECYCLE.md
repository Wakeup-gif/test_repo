# B1 Implementation: Shell / Lifecycle

**Branch:** `rebuild/squarecoil-companion-b1-lifecycle`  
**Status:** Implemented, awaiting CI validation  
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

## B1 completion gate

B1 is green when:

1. `check:b1` passes;
2. generated JavaScript syntax checks pass;
3. Chrome and Edge B1 artifacts build;
4. no legacy `page/timer-*.js` module is injected by the rebuilt controller;
5. lifecycle unit tests prove root-only readiness is impossible;
6. planning `main` baseline remains untouched.
