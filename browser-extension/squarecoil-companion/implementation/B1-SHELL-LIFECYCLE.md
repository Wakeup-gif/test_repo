# B1 Implementation: Shell / Lifecycle

**Branch:** `rebuild/squarecoil-companion-b1-lifecycle`

**Status:** `NOT_SETTLED / VALIDATION_CANDIDATE`

**Repair baseline:** `c0afb241d91141ed818d9395ac14257207ad59ed`

**Depends on:** settled L0-L1 and the L8 acceptance rules

**Does not implement:** B2 Timer State, Time Ledger, or one-writer coordination behavior.

## Current decision

The earlier B1 checkpoint is historical evidence, not current acceptance proof. Review found lifecycle, orchestration, package-identity, and browser-fixture gaps. The controlled repair remains unaccepted until all A1-A4 gates pass against one immutable candidate commit and one byte-identical Chrome/Edge archive.

B2 remains blocked. Production `main`, the planning branch, and the quarantined B2 drafts are not part of this repair.

## B1 scope

B1 owns only the extension shell and lifecycle boundary:

- dependency-free modular source under `src/`;
- one generated MAIN-world application bundle;
- one isolated content controller;
- one page lifecycle owner and one owned `#ussign-job-timer` root;
- exact top-level SquareCoil document eligibility;
- persistence preflight;
- strict runtime, root, claim, build, package-version, candidate-fingerprint, and document identity checks;
- safe orphan handling that removes only positively owned current-document artifacts;
- idempotent boot, teardown, explicit failed-cleanup retry, and bounded recovery;
- BFCache, navigation, service-worker restart, disable/re-enable, and stale-callback fencing;
- a minimal popup for enablement, cleanup retry, and lifecycle health;
- package validation and branded Chrome/Edge acceptance fixtures.

## Intentional B1 degraded state

L1 requires positive one-writer coordination before `READY`. B2 owns that coordination system, so the real B1 page adapter must preserve:

```text
coordinationDisposition = UNAVAILABLE_B1
DEGRADED / coordination-not-implemented-b1
```

Tests may inject an `OWNER` disposition to prove the READY contract, but production B1 must not weaken the contract or implement B2 prematurely.

## Controlled repair requirements

The repair must prove all of the following before B1 can be settled:

1. A1 static/package validation is complete and fail-closed.
2. A2 unit tests cover lifecycle ownership, teardown, runtime probing, settings ordering, and package/fixture invariants without skips.
3. A3 integration fixtures execute the generated runtime bundles and cover lifecycle races at deterministic boundaries.
4. A4 loads one clean immutable package in branded Chrome and branded Edge and exercises the required browser behaviors.
5. The archive SHA-256, extracted inventory digest, build identity, and source commit agree.
6. The source checkout is clean and its actual Git HEAD matches the package metadata.
7. No production, planning, B2, manifest permission expansion, remote executable content, or unrelated source enters the diff.

## Current local evidence

The repair worktree currently passes:

- A2 unit: 77 passed, 0 failed, 0 skipped;
- A3 integration: 38 passed, 0 failed, 0 skipped;
- static B1 validation: passed.

These are pre-commit local results. They do not settle B1. A1 package hardening is locally implemented, but it and the final A4 Chrome/Edge run must still pass against clean bytes from the exact candidate commit.

## Historical evidence classification

Earlier commits, workflow runs, and Chrome/Edge package hashes recorded by prior handoffs remain useful historical evidence only. They did not include the complete current A4 browser contract and must not be cited as proof that this repair is settled.

## Acceptance record

The final acceptance record must identify:

- the exact tested implementation commit;
- the canonical archive filename and SHA-256;
- the extracted package inventory digest;
- Chrome and Edge executable versions and hashes;
- A1, A2, A3, and A4 case totals;
- the remote B1 head after push;
- unchanged `main`, planning, and quarantined B2 state.

Until that record is written from verified evidence, the only correct next action is to finish and validate the controlled B1 repair. Do not start B2.
