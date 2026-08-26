# SquareCoil Companion Rebuild: Start Here

This file is the recovery checkpoint for the SquareCoil Companion rebuild.

If chat context is lost or implementation direction becomes unclear, start here before changing code.

---

## Current checkpoint

**Framework status:** Settled  
**Logic status:** L0-L8 settled  
**Logic closure:** Complete; evidence map, traceability matrix, and Codex handoff present

**B1 status:** NOT_SETTLED / READY_FOR_REPAIR

**B1 browser acceptance:** PENDING

**B2 status:** BLOCKED / local draft UNAPPROVED-DRAFT

**Next authorization:** `REVIEW B1`

**Production baseline:** `main` at `9378da24f393b40066816133e7fa0f48063115f0`  
**Production package:** v0.7.1 Chrome Interaction Recovery  
**Planning branch:** `planning/squarecoil-companion-rebuild`  
**Production code changed by planning/logic work:** No

Production `main` has been rechecked and still points to the v0.7.1 baseline above.

---

## Read in this order

1. `HANDOFF-NEXT-CHAT.md`
   - Canonical recovery handoff, verified checkpoint, and stage boundary.

2. `REBUILD-START-HERE.md`
   - Current recovery checkpoint, read order, and next action.

3. `docs/REPOSITORY-EVIDENCE-MAP.md`
   - Verified refs, source classifications, conflicts, proof boundaries, and local-draft quarantine.

4. `docs/LOGIC-TRACEABILITY-MATRIX.md`
   - Stable requirement/fixture IDs and L0-L8 -> B1-B6 -> A1-A4 gate mapping.

5. `CODEX-IMPLEMENTATION-HANDOFF.md`
   - Current B1 blocker, B2 quarantine, exact authorization vocabulary, and Git/browser proof rules.

6. `docs/REBUILD-MASTER-PLAN.md`
   - Structural architecture and ownership authority.

7. `docs/LOGIC-STAGE-PLAN.md`
   - Explains why logic was staged and maps the implementation gates.

8. `logic/L0-INVARIANTS.md`
   - Canonical vocabulary, compatibility baseline, non-negotiable invariants.

9. `logic/L1-LIFECYCLE.md`
   - Boot, READY, duplicate prevention, recovery, teardown, reload/update behavior.

10. `logic/L2-STATE-TIME-MIGRATION.md`
   - Shared Timer State, Time Ledger, Workday rules, cross-tab ownership, Recovery Checkpoint, v0.7 migration.

11. `logic/L3-SQUARECOIL-BRIDGE.md`
   - Read-only SquareCoil evidence normalization and native clock interpretation.

12. `logic/L4-TIMER-BEHAVIOR.md`
   - Core timer transitions: new/remembered jobs, Pending, Resume, Start Fresh, Local Pause, switches, uncertainty, Safety Holds.

13. `logic/L5-TIME-VIEWS-WORKSPACE.md`
   - Main timer, Recent, Time Overview, History, navigation, selected-vs-operational presentation.

14. `logic/L6-DATA-SAFETY-BACKUP.md`
    - Archive, Clear Recent, Delete, Full Backup, Restore, History CSV, Time Report CSV.

15. `logic/L7-SETTINGS-SUPPORT-THEMES.md`
    - Settings router, Timer Appearance, Website Themes, Support/Feedback, diagnostics privacy, Developer Support.

16. `logic/L8-ACCEPTANCE-HANDOFF.md`
    - Failure priority, fixture/test requirements, release blockers, Chrome/Edge gates, staged implementation handoff.

17. B1 implementation handoff/stage records and actual source/tests.
    - Implementation evidence for the active review; it does not outrank settled contracts or prove browser acceptance.

18. `HANDOFF.md` and `CHROME-INTERACTION-DIAGNOSIS.md`.
    - Historical v0.7.x source material and failure context. Use as source evidence, not as the rebuild architecture.

---

## Core decisions now settled

- One state owner, one UI owner, one application lifecycle.
- SquareCoil remains authoritative for the company clock.
- Companion never silently clocks users in/out of SquareCoil.
- One logical active Companion Context across tabs in one data scope.
- Timer tabs are workspace/navigation, not multiple clocks.
- Selection has no timing side effects.
- Production General is a first-class Context.
- Same-project department/label changes do not reset the job timer.
- Unknown/missed time is never fabricated.
- New zero-history Contexts may auto-start from a safe evidence anchor.
- Remembered Contexts use Pending -> Resume / Start Fresh.
- Local Pause is Companion-only and never modifies SquareCoil.
- Prolonged verification uncertainty uses conservative Safety Hold behavior.
- Time Ledger is the authoritative local historical-time source.
- Today is primary in the main timer; Job/Context Total is secondary.
- Workday Time Zone, midnight splitting, DST, week, and precision rules are settled in L2.
- One-writer/fencing coordination prevents cross-tab duplicate accrual.
- Recent is workspace membership, not history retention.
- Clear Recent -> inactive/non-recent and preserves all time.
- Archive preserves all time.
- Delete/Wipe are explicit destructive operations only.
- No silent authoritative history pruning or old v0.7 count caps.
- Full Backup JSON, History CSV, and Time Report CSV have separate purposes.
- Restore/import cannot create fake live Timer State.
- Restore/import validates, stages, dedupes, overlap-checks, and commits atomically.
- Timer Appearance: Light/Dark/Auto; first-install Light.
- Panel Finish: Solid/Glass; first-install Solid.
- Website Theme: Original/Refined Light/Sleek Dark; first-install Original.
- Themes/support/developer-support are secondary and cannot own timer health.
- Support uses privacy-previewed opt-in diagnostics and mail-client composition.
- Developer Support is optional, free/no-paywall/no-nag/no-donation-tracking.
- Chrome is the first rebuilt acceptance/package target.
- Edge follows from the same shared source with its own parity gate.
- Static/package success never substitutes for real browser interaction acceptance.
- The exact package bytes that pass required smoke acceptance must be the bytes promoted as that candidate/release.

---

## Do not do these things

- Do not modify production `main` as part of planning/scaffold work.
- Do not start by copying the v0.7.x multi-script patch architecture.
- Do not let features independently mutate timer JSON or historical time.
- Do not reintroduce Settings DOM patch chains.
- Do not treat timer-root existence as runtime health.
- Do not stack another runtime when ownership is ambiguous.
- Do not invent SquareCoil state or unverified elapsed time.
- Do not silently prune authoritative sessions/history.
- Do not make Clear Recent destructive.
- Do not restore Active/Pending/Local Pause from backup/CSV file contents.
- Do not silently trim, sum, or guess overlapping imported historical intervals.
- Do not fork Chrome/Edge behavior semantics.
- Do not advance Stable based only on ZIP/package CI.
- Do not use production SquareCoil native clock mutation actions in automated tests.
- Do not let a builder silently work around a contradiction in settled logic. Escalate/amend the owning contract and add a regression.

---

## Current next action

Perform a read-only **`REVIEW B1`** from the current B1 branch and local hardening draft. Do not edit until that review produces an approved repair slice and the user separately says `START B1`.

The B1 branch already exists. It is not settled merely because automated CI and package construction pass. The confirmed L1-AC-23 failed-cleanup sequence still permits failure erasure/reallocation, and real packaged Chrome/Edge lifecycle acceptance remains pending.

B1 scope remains limited to:

- source/build scaffold;
- extension shell/platform boundary;
- Lifecycle Coordinator;
- one runtime/root ownership;
- READY health probe;
- teardown/recovery skeleton;
- static/package validation improvements;
- lifecycle fixture/browser tests.

B1 must use `logic/L0-INVARIANTS.md`, `logic/L1-LIFECYCLE.md`, `logic/L8-ACCEPTANCE-HANDOFF.md`, and the traceability matrix as authority. It must not invent B2 timer behavior early. Preserve `DEGRADED / coordination-not-implemented-b1` until B2 implements real coordination.

The staged build sequence is:

```text
B1 Shell / Lifecycle
B2 State / Ledger / Bridge / Core Timer
B3 Time Views / Workspace
B4 Data Safety / Files
B5 Settings / Themes / Support
B6 Full Acceptance / Candidate Packaging
```

Chrome candidate work happens only after the required gates in L8 are green.

---

## Inputs still needed later

These are intentionally nonblocking because L7/L8 define safe fallback behavior:

- Buy Me a Coffee URL;
- Cash App cashtag/name;
- Cash App QR packaged asset;
- optional approved Refined Light custom logo;
- final visual polish/microcopy;
- final profiled file-size/retention limits;
- final build/test framework choice;
- final persistence technology satisfying L2 transactions;
- current Chrome/Edge store-submission details verified at release time.

---

## Recovery instruction for a new chat / implementation session

> Continue the SquareCoil Companion rebuild from `planning/squarecoil-companion-rebuild` in `Wakeup-gif/test_repo`. Read `HANDOFF-NEXT-CHAT.md` first, then Start Here, Repository Evidence Map, Logic Traceability Matrix, canonical Codex handoff, Master Plan, Logic Stage Plan, L0-L8, and the active B1 evidence in the prescribed order. Framework + Logic are settled and the closure package is complete. B1 exists but is NOT_SETTLED / READY_FOR_REPAIR; browser acceptance is PENDING; B2 is BLOCKED. Production `main` must remain at v0.7.1. Do not edit until the user gives the exact stage authorization; the next required command is `REVIEW B1`.
