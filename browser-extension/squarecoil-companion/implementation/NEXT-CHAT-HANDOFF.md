# SquareCoil Companion Rebuild - B1 Settled Handoff

## Verified project baseline

- Repository: `Wakeup-gif/test_repo`
- Production `main`: `9378da24f393b40066816133e7fa0f48063115f0`
- Planning branch when B1 repair began: `42057ae7894a0f0051212a60cf764688a566b7d8`
- B1 branch: `rebuild/squarecoil-companion-b1-lifecycle`
- B1 remote baseline before repair: `c0afb241d91141ed818d9395ac14257207ad59ed`
- Accepted B1 implementation: `f2d1769ddbe2b6966411fee3764a09b904dfe6ff`
- Framework and Logic L0-L8: settled
- B1: `SETTLED`
- B1 browser acceptance: `COMPLETE / PASS`
- B2: `BLOCKED / UNAPPROVED-DRAFT`

Production `main`, the planning branch, and the quarantined B2 drafts are outside the controlled B1 repair and must remain unchanged.

## Read first

Read the canonical contract set from planning commit
`42057ae7894a0f0051212a60cf764688a566b7d8`, in this order:

1. `HANDOFF-NEXT-CHAT.md`
2. `REBUILD-START-HERE.md`
3. `docs/REBUILD-MASTER-PLAN.md`
4. `docs/LOGIC-STAGE-PLAN.md`
5. `logic/L0-INVARIANTS.md`
6. `logic/L1-LIFECYCLE.md`
7. `logic/L2-STATE-TIME-MIGRATION.md`
8. `logic/L3-SQUARECOIL-BRIDGE.md`
9. `logic/L4-TIMER-BEHAVIOR.md`
10. `logic/L5-TIME-VIEWS-WORKSPACE.md`
11. `logic/L6-DATA-SAFETY-BACKUP.md`
12. `logic/L7-SETTINGS-SUPPORT-THEMES.md`
13. `logic/L8-ACCEPTANCE-HANDOFF.md`
14. `docs/REPOSITORY-EVIDENCE-MAP.md`
15. `docs/LOGIC-TRACEABILITY-MATRIX.md`
16. `CODEX-IMPLEMENTATION-HANDOFF.md`

Then read the newer execution records from the B1 branch:

1. `implementation/B1-SHELL-LIFECYCLE.md`
2. `implementation/B1-ACCEPTANCE-EVIDENCE.md`

Planning remains the canonical behavior-contract authority. The B1 branch
records the newer verified implementation status but must not change planning's
product semantics.

## Recovered B1 state

The original B1 branch contained a useful shell/lifecycle implementation, but
review found evidence and correctness gaps. The authorized controlled repair
closed:

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

## Accepted evidence status

At this handoff checkpoint:

- A1 exact static/package validation: COMPLETE / PASS;
- A2 unit: 77 passed, 0 failed, 0 skipped or todo;
- A3 integration: 38 passed, 0 failed, 0 skipped or todo;
- A4 clean branded Chrome: 15 of 15 PASS;
- A4 clean branded Edge: 15 of 15 PASS;
- exact browser-tested source commit:
  `f2d1769ddbe2b6966411fee3764a09b904dfe6ff`;
- exact browser-tested ZIP SHA-256:
  `ade889c43b78d73a14421ecda5715624774bbf44a6e09855680c1b09c6a34f1e`;
- GitHub Actions run
  [`32992114188`](https://github.com/Wakeup-gif/test_repo/actions/runs/32992114188):
  completed successfully for the exact accepted implementation commit;
- production `main` and planning remained unchanged;
- the 24-file B2 draft remained quarantined and untouched.

See `implementation/B1-ACCEPTANCE-EVIDENCE.md` for exact candidate, inventory,
browser executable, workflow artifact, and proof-boundary details. The GitHub
workflow package is separate A1 evidence and must not be substituted for the
exact Windows package that passed A4.

## Next authorization

The exact next authorization is `REVIEW B2`. It permits read-only inspection of
the quarantined B2 draft against the settled L2-L4 contracts and this final B1
base. It does not authorize implementation.

Do not start B2 without a reviewed repair slice and a later exact `START B2`.
Do not modify `main`, merge, publish a release, or extend the B1 evidence beyond
its synthetic clean-profile lifecycle scope.

The protected planning branch remains the canonical behavior-contract authority
and still contains its pre-repair B1 status checkpoint. The newer verified
execution status is recorded on this B1 implementation branch.
