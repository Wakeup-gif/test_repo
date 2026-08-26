# SquareCoil Companion Rebuild - B1 Controlled Repair Handoff

## Verified project baseline

- Repository: `Wakeup-gif/test_repo`
- Production `main`: `9378da24f393b40066816133e7fa0f48063115f0`
- Planning branch when B1 repair began: `42057ae7894a0f0051212a60cf764688a566b7d8`
- B1 branch: `rebuild/squarecoil-companion-b1-lifecycle`
- B1 remote baseline before repair: `c0afb241d91141ed818d9395ac14257207ad59ed`
- Framework and Logic L0-L8: settled
- B1: `NOT_SETTLED / VALIDATION_CANDIDATE`
- B2: `BLOCKED / UNAPPROVED-DRAFT`

Production `main`, the planning branch, and the quarantined B2 drafts are outside the controlled B1 repair and must remain unchanged.

## Read first

Read these repository files before continuing:

1. `REBUILD-START-HERE.md`
2. `docs/REBUILD-MASTER-PLAN.md`
3. `docs/LOGIC-STAGE-PLAN.md`
4. `logic/L0-INVARIANTS.md`
5. `logic/L1-LIFECYCLE.md`
6. `logic/L8-ACCEPTANCE-HANDOFF.md`
7. `implementation/B1-SHELL-LIFECYCLE.md`

The planning branch also contains the later L2-L7 product contracts. They remain settled specifications, but B1 must not implement their behavior.

## Recovered B1 state

The original B1 branch contained a useful shell/lifecycle implementation, but review found evidence and correctness gaps. The authorized controlled repair addresses:

- truthful READY and degraded-state classification;
- one runtime/root owner per exact document;
- cancellation-safe boot, recovery, and teardown;
- sticky failed cleanup with explicit teardown-only retry;
- ownership-last release and partial-initialization cleanup;
- strict legacy, malformed, unreadable, orphan, build, package-version, candidate-fingerprint, and document identity handling;
- service-worker restart, BFCache, navigation, and disable/re-enable safety;
- stale callback, settings, injection, and teardown race fencing;
- package source identity and exact-byte validation;
- branded Chrome and Edge browser acceptance.

The real B1 runtime must continue to report:

```text
DEGRADED / coordination-not-implemented-b1
```

That is the settled L1 boundary. One-writer coordination belongs to B2.

## Current evidence status

At this handoff checkpoint:

- A2 unit: 77 passed, 0 failed, 0 skipped;
- A3 integration: 38 passed, 0 failed, 0 skipped;
- static B1 validation: passed;
- A1 package hardening: locally implemented; clean-candidate proof pending;
- A4 clean branded Chrome/Edge acceptance: pending;
- commit and push: not yet performed.

Local green tests are not acceptance by themselves. B1 remains unapproved until a clean candidate commit is packaged once, copied byte-for-byte for Chrome and Edge, validated, exercised in both branded browsers, and verified after the B1-only push.

## Next action

Finish the controlled B1 repair only:

1. complete fail-closed A1 package and identity validation;
2. re-run A1-A3 with no skips;
3. create the immutable candidate commit on the B1 branch;
4. build one canonical archive and verify byte-identical Chrome/Edge copies;
5. run the full A4 fixture set in branded Chrome and Edge against those exact bytes;
6. record the evidence, push only B1, and verify remote and protected heads;
7. stop and request `REVIEW B2` only if every B1 gate passes.

Do not start B2, modify `main`, merge, publish a release, or claim browser success from parse/package checks.
