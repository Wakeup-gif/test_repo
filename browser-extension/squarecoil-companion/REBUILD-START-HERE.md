# SquareCoil Companion Rebuild: Start Here

This is the recovery checkpoint for the active SquareCoil Companion prototype/rebuild.

If chat context is lost or implementation direction becomes unclear, start here before changing code.

---

## Current checkpoint

**Active branch:** `proto/squirel-coil-plugin`  
**Production baseline:** `main` at `9378da24f393b40066816133e7fa0f48063115f0` (`v0.7.1 Chrome Interaction Recovery`)  
**Production main changed by prototype work:** No  
**Framework status:** Reconciled after full legacy feature mine  
**Logic status:** L0-L8 previously settled; targeted post-mine Logic delta now required  
**Implementation status:** B1 accepted; B2.1 accepted; B2.2 accepted; full B2 not yet settled  
**Prototype UI:** nested workspace prototype + dedicated UI interaction gate present  
**Latest accepted implementation/UI-gate checkpoint before documentation reconciliation:** `ba06297e689fa7a68574ea0c0fe6d12ee59e53bf`  
**Next architecture action:** targeted Logic reconciliation from `docs/LOGIC-DELTA-HANDOFF.md`  
**Next canonical build action after the Logic delta:** close remaining B2 gaps before treating B3 prototype work as canonical

The current branch intentionally contains exploratory B3-facing UI work on top of the accepted B2.2 core. That prototype does not promote itself to production and does not mean full B2 or B3 are settled.

---

## Read in this order

1. `REBUILD-START-HERE.md`
   - Current branch truth, recovery checkpoint, and next action.

2. `docs/REBUILD-MASTER-PLAN.md`
   - Original structural architecture and ownership authority.

3. `docs/FEATURE-MINE-RECONCILIATION.md`
   - Current feature ledger after mining Timer v1.x, Companion v0.x, and historical Full UI/theme lineage.
   - Classifies features as core parity, core rebuild, optional presentation, or excluded sibling systems.
   - Where old planning-branch/checkpoint metadata conflicts with this file, use this current reconciliation/checkpoint.

4. `docs/LOGIC-DELTA-HANDOFF.md`
   - Bounded post-mine Logic reconciliation scope.
   - Do not restart Logic from L0 unless a real contradiction is discovered.

5. `docs/LOGIC-STAGE-PLAN.md`
   - Original staged Logic architecture and implementation gate map.

6. `logic/L0-INVARIANTS.md`
   - Canonical vocabulary, compatibility baseline, non-negotiable invariants.

7. `logic/L1-LIFECYCLE.md`
   - Boot, READY, duplicate prevention, recovery, teardown, reload/update behavior.

8. `logic/L2-STATE-TIME-MIGRATION.md`
   - Timer State, Time Ledger, Workday rules, cross-tab ownership, recovery, migration model.

9. `logic/L3-SQUARECOIL-BRIDGE.md`
   - Read-only SquareCoil evidence normalization and native clock interpretation.

10. `logic/L4-TIMER-BEHAVIOR.md`
    - Core timer transitions: new/remembered jobs, Pending, Resume, Start Fresh, Local Pause, switches, uncertainty, Safety Holds.

11. `logic/L5-TIME-VIEWS-WORKSPACE.md`
    - Main timer, tabs/workspace, Recent, Time Overview, History, navigation, selected-vs-operational presentation.

12. `logic/L6-DATA-SAFETY-BACKUP.md`
    - Archive, Clear Recent, Delete, Full Backup, Restore, History CSV, Time Report CSV.

13. `logic/L7-SETTINGS-SUPPORT-THEMES.md`
    - Settings router, Timer Appearance, Website Themes, Support/Feedback, diagnostics privacy, Developer Support.

14. `logic/L8-ACCEPTANCE-HANDOFF.md`
    - Failure priorities, fixtures/tests, Chrome/Edge gates, staged implementation handoff.

15. `implementation/B1-ACCEPTANCE-EVIDENCE.md`
16. `implementation/B2-KERNEL-EVIDENCE.md`
17. `implementation/B2-TRUSTED-TRANSITION-EVIDENCE.md`
    - Accepted implementation checkpoints. Read actual implementation source before changing code.

18. `HANDOFF.md` and `CHROME-INTERACTION-DIAGNOSIS.md`
    - Historical v0.7.x source evidence. Do not treat the old multi-patch architecture as the rebuild pattern.

---

## Core structure now settled

- One lifecycle owner.
- One fenced authoritative Timer/Time writer.
- One canonical read model.
- One Companion renderer/router.
- SquareCoil Bridge is read-only and normalizes native truth.
- SquareCoil remains authoritative for company clock state.
- Companion never silently clocks users in/out.
- One operational Companion Context exists across tabs in one data scope.
- Timer tabs are workspace/navigation, not concurrent clocks.
- Selection has no timing side effect.
- Selected Context may differ from operational Context and the UI must preserve both truths.
- Production General is a first-class Context and is never Job 0.
- Same-project department/label changes do not reset job-level timing merely because metadata changed.
- Unknown/missed time is never fabricated.
- New zero-history Contexts may use safe evidence anchors under L4 rules.
- Remembered Contexts use Pending -> Resume / Start Fresh.
- Local Pause is Companion-only.
- Prolonged verification uncertainty uses conservative Safety Hold behavior.
- Time Ledger is authoritative local historical-time truth.
- Today is primary in the main timer; Job/Context Total is secondary.
- Workday zone/midnight/DST/week/precision rules remain owned by L2.
- One-writer/fencing prevents cross-tab duplicate accrual.
- Recent is workspace membership, not historical retention.
- Clear Recent preserves authoritative time.
- Archive preserves authoritative time.
- Delete/Wipe are explicit destructive operations only.
- Full Backup JSON, History CSV, and Time Report CSV have different purposes.
- Restore/import cannot fabricate live Timer State.
- Timer Appearance remains Light/Dark/Auto.
- Panel Finish remains Solid/Glass.
- Core Website Theme remains Original/Refined Light/Sleek Dark.
- Historical Cinematic Wallpaper is preserved as an optional post-core presentation capability, not a core dependency.
- Historical Design Dashboard refresh is preserved as an optional page presentation profile, not Design Request business logic.
- Sibling Design/Scope/File/Menu tools remain outside Companion scope.
- Chrome/Edge use one shared behavior/source architecture with separate browser acceptance.
- Static/package success never substitutes for installed-browser acceptance.

---

## Newly mined parity that must not be lost

The post-mine reconciliation explicitly adds these established Timer UX details to the canonical feature ledger:

- live authoritative elapsed summary in visible Job tabs;
- threshold accent in visible tabs;
- persistent drag reorder;
- single-click selection;
- double-click focus/expand behavior;
- safe incoming focus on real SquareCoil Context changes;
- collapse persistence across same-Context verification;
- history/recent/archive continuity.

Most of this was already present in L5. The required Logic delta is mainly to make live tab time + threshold presentation explicit and verify current-focus transition coverage.

---

## Current prototype UI

The active prototype provides:

- Chrome-like visible job tabs with a five-numbered-job cap;
- selected-vs-operational separation;
- main Today / Job Total / status presentation;
- Current/Actually Running indication when selection differs from operational truth;
- Recent Jobs;
- Time Overview;
- History;
- Settings;
- Light/Dark;
- Solid/Glass;
- search/open exact Job #;
- hide/show tab behavior;
- trusted-user interaction gating for Timer commands/navigation;
- dedicated prototype UI tests.

Known prototype limitations still include:

- full `innerHTML` refresh strategy rather than retained-node rendering;
- search focus is guarded, but scroll preservation is not solved;
- direct non-null A -> B current-focus works, while null clock-out -> later B still needs deliberate contract/implementation handling;
- destructive data tools remain intentionally locked;
- full installed-browser A4 acceptance for the new UI has not been completed.

---

## Canonical B2 gaps still open

Do not call full B2 settled until the owning implementation/acceptance work closes at least the currently known gaps:

- legacy migration invocation;
- safe observation of relevant native action 2/3/4 completion without Companion initiating native mutation;
- final READY/full B2 acceptance evidence;
- full B2 settlement.

The prototype UI does not waive these requirements.

---

## Next action

### 1. Run the targeted Logic delta

Use:

`docs/LOGIC-DELTA-HANDOFF.md`

Required focus:

- L5 visible-tab elapsed parity;
- L5 threshold accent parity;
- current-focus transition coverage;
- L8 acceptance additions.

Optional visual packs do not block core Logic.

### 2. Complete canonical B2

After the delta is settled, close the remaining B2 core authority gaps.

### 3. Convert prototype workspace work into canonical B3

Only then treat the B3-facing prototype as a candidate for canonical Time Views / Workspace implementation and browser acceptance.

---

## Staged path from here

```text
R1  Targeted Logic delta
        ↓
B2-C  Complete canonical B2
        ↓
B3  Canonical Time Views / Workspace
        ↓
B4  Data Safety / Backup / CSV
        ↓
B5-A  Core Settings / Themes / Support
        ↓
B5-B  Optional Presentation Packs
        ↓
B6  Chrome + Edge Acceptance / Candidate
```

Optional presentation must never block a core build that does not include it.

---

## Do not do these things

- Do not merge/promote the prototype branch to `main` without explicit promotion approval.
- Do not restart the old v0.7.x multi-script patch architecture.
- Do not let features independently mutate Timer State or Ledger data.
- Do not use root DOM existence as runtime health.
- Do not inject a second authority when ownership is ambiguous.
- Do not invent SquareCoil state or elapsed time.
- Do not silently prune authoritative history.
- Do not make Clear Recent destructive.
- Do not restore Active/Pending/Local Pause from file contents.
- Do not guess or silently sum overlapping imported intervals.
- Do not fork Chrome/Edge behavior semantics.
- Do not let visual packs own Timer health.
- Do not absorb sibling Design/Scope/File/Menu business tools into Companion without a separate scope decision.
- Do not call a prototype interaction gate a substitute for real installed-browser acceptance.
- Do not let implementation silently work around a contradiction in owning Logic. Amend the contract and add a regression.

---

## Framework readiness

**Framework ready for logic**

Reason: the post-mine feature ancestry is now classified and placed. Logic does not need to invent whether a feature belongs to core Timer/Workspace, presentation, optional visual profiles, or a separate sibling tool.

The next Logic work is a bounded reconciliation pass, not a greenfield architecture exercise.