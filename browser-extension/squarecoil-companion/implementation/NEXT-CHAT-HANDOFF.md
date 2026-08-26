# SquareCoil Companion Rebuild - Next Chat Handoff

**Use this file to continue the project in a new ChatGPT conversation.**

## Current project state

- Repository: `Wakeup-gif/test_repo`
- Production `main`: `9378da24f393b40066816133e7fa0f48063115f0`
- Production package: v0.7.1 Chrome Interaction Recovery
- Production `main` has not been modified by rebuild work.
- Settled planning branch: `planning/squarecoil-companion-rebuild`
- Settled planning checkpoint: `82207dcdf2e7f4c6d8b346c787433574c75e0a38`
- Active implementation branch: `rebuild/squarecoil-companion-b1-lifecycle`
- Current B1 branch head before this handoff commit: `fac68612010d31edd8167270da41b245b41dfcec`
- Core B1 implementation commit: `c109fed7c1bdfab3a3023a58d1ba8966d5fe26b5`
- Current-head B1 validation run: GitHub Actions run `32926277039`, all steps passed.

## Framework / logic status

Framework and Logic L0-L8 are settled. The planning branch contains the complete recovery package:

1. `REBUILD-START-HERE.md`
2. `docs/REBUILD-MASTER-PLAN.md`
3. `docs/LOGIC-STAGE-PLAN.md`
4. `logic/L0-INVARIANTS.md`
5. `logic/L1-LIFECYCLE.md`
6. `logic/L2-STATE-TIME-MIGRATION.md`
7. `logic/L3-SQUARECOIL-BRIDGE.md`
8. `logic/L4-TIMER-BEHAVIOR.md`
9. `logic/L5-TIME-VIEWS-WORKSPACE.md`
10. `logic/L6-DATA-SAFETY-BACKUP.md`
11. `logic/L7-SETTINGS-SUPPORT-THEMES.md`
12. `logic/L8-ACCEPTANCE-HANDOFF.md`

Do not redefine those contracts during implementation unless a real contradiction is found. If a contradiction is found, stop local invention, document it, amend the owning logic contract deliberately, and add a regression test.

## B1 implementation status

B1 = **Shell / Lifecycle**.

Implemented on `rebuild/squarecoil-companion-b1-lifecycle`:

- modular dependency-free source under `src/`;
- generated MAIN-world application bundle and isolated controller via the build script;
- one lifecycle owner and one owned `#ussign-job-timer` shell root;
- root ownership and interaction-readiness checks;
- persistence preflight;
- stale/orphan root handling;
- legacy-runtime, version-mismatch, and ownership-conflict classification;
- idempotent teardown and bounded recovery skeleton;
- BFCache revalidation;
- service-worker memory treated as non-authoritative;
- minimal popup lifecycle/enablement surface;
- B1 Node unit tests;
- CI build, tests, generated-JS syntax validation, lean Chrome/Edge package creation, and artifact upload.

Read `implementation/B1-SHELL-LIFECYCLE.md` for the B1 implementation contract/checkpoint.

### Intentional B1 live state

The live B1 shell does **not** claim READY yet.

L1 requires a positive one-writer coordination result for READY. B2 owns that coordination layer, so the B1 live adapter reports:

`DEGRADED / coordination-not-implemented-b1`

This is intentional and must not be "fixed" by weakening the READY contract. Unit tests inject a valid `OWNER` coordination disposition to prove READY is reachable only when all L1 assertions pass.

## CI evidence

Current-head validation run `32926277039` passed:

- checkout/setup;
- build + unit tests + B1 validation;
- generated JavaScript syntax validation;
- lean Chrome package build;
- lean Edge package build;
- Chrome artifact upload;
- Edge artifact upload.

Earlier core implementation run `32926203944` also passed.

## Next action in the new chat

**Do not start B2 immediately.**

The next task is:

> Review and harden B1 against settled L0/L1/L8, inspect the implementation branch and CI evidence, fix any lifecycle/shell gaps on the same B1 branch, re-run validation, and only then mark B1 settled/green for B2.

Review especially:

- one runtime/root ownership;
- root-only readiness impossible;
- interaction readiness;
- safe stale-root recovery;
- version/legacy/ownership conflict behavior;
- teardown idempotency and resource cleanup;
- bounded recovery;
- BFCache/service-worker restart behavior;
- enable/disable lifecycle semantics;
- no old `page/timer-*.js` patch stack injected by the rebuilt controller;
- no B2 Timer State/Ledger/coordination behavior implemented prematurely;
- CI/package contents and branch isolation;
- whether B1 needs additional deterministic/browser fixture coverage before freeze.

After B1 review/hardening passes, the next implementation stage is **B2: State / Ledger / Bridge / Core Timer**.

## Interaction shorthand

The established workflow is:

- after a stage is drafted/implemented, `start` means review/harden that stage first;
- do not jump to the next stage before applying the review fixes;
- when no review fixes remain and the stage is explicitly settled, a later `start` may begin the next stage.

## Do not touch

- Do not modify production `main` during B1/B2 development.
- Do not merge the rebuild into production merely because CI parses/builds.
- Do not use package success as proof of browser interaction health.
- Do not reintroduce independent Settings DOM patch scripts or multiple timer-state writers.
- Do not silently prune historical time.
- Do not invent SquareCoil clock state.

## Recommended prompt for the next chat

> Continue the SquareCoil Companion rebuild in `Wakeup-gif/test_repo`. Work from branch `rebuild/squarecoil-companion-b1-lifecycle`. First read `browser-extension/squarecoil-companion/implementation/NEXT-CHAT-HANDOFF.md`, then `REBUILD-START-HERE.md`, `implementation/B1-SHELL-LIFECYCLE.md`, `logic/L1-LIFECYCLE.md`, and `logic/L8-ACCEPTANCE-HANDOFF.md`. Framework + L0-L8 are settled. B1 is implemented and CI-green but still needs its review/hardening pass. Review B1, apply fixes on the B1 branch, re-run validation, and do not start B2 until B1 is explicitly settled. Production `main` must remain untouched at `9378da24f393b40066816133e7fa0f48063115f0`.
