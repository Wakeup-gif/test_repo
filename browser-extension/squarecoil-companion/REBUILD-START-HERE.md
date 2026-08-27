# SquareCoil Companion Rebuild: Start Here

This is the recovery checkpoint for the active SquareCoil Companion prototype/rebuild.

If chat context is lost or implementation direction becomes unclear, start here before changing code.

---

## Current checkpoint

**Active branch:** `proto/squirel-coil-plugin`  
**Production baseline:** `main` at `9378da24f393b40066816133e7fa0f48063115f0` (`v0.7.1 Chrome Interaction Recovery`)  
**Production main changed by prototype work:** No  
**Framework status:** Reconciled after full legacy feature mine  
**Logic status:** L0-L8 settled + post-mine L5A tab/focus delta settled  
**Implementation status:** B1 accepted; B2.1 accepted; B2.2 accepted; full B2 not yet settled  
**Prototype UI:** nested workspace prototype + dedicated UI interaction gate present  
**Latest accepted implementation/UI-gate checkpoint before documentation/logic reconciliation:** `ba06297e689fa7a68574ea0c0fe6d12ee59e53bf`  
**Logic delta authority:** `logic/L5A-TAB-PARITY-FOCUS-DELTA.md`  
**Next canonical build action:** close remaining B2 gaps before treating B3 prototype work as canonical

The current branch intentionally contains exploratory B3-facing UI work on top of the accepted B2.2 core. The prototype does not promote itself to production and does not mean full B2 or B3 are settled.

---

## Read in this order

1. `REBUILD-START-HERE.md`
   - Current branch truth, recovery checkpoint, and next action.

2. `docs/REBUILD-MASTER-PLAN.md`
   - Original structural architecture and ownership authority.

3. `docs/FEATURE-MINE-RECONCILIATION.md`
   - Current feature ledger after mining Timer v1.x, Companion v0.x, and historical Full UI/theme lineage.
   - Classifies features as core parity, core rebuild, optional presentation, or excluded sibling systems.

4. `docs/LOGIC-DELTA-HANDOFF.md`
   - Scope that produced the targeted post-mine Logic reconciliation.

5. `logic/L0-INVARIANTS.md`
6. `logic/L1-LIFECYCLE.md`
7. `logic/L2-STATE-TIME-MIGRATION.md`
8. `logic/L3-SQUARECOIL-BRIDGE.md`
9. `logic/L4-TIMER-BEHAVIOR.md`
10. `logic/L5-TIME-VIEWS-WORKSPACE.md`
11. `logic/L5A-TAB-PARITY-FOCUS-DELTA.md`
    - Canonical live-tab Today value, threshold behavior, real native focus-intent transitions, stale/dirty-route rules, and acceptance additions.
12. `logic/L6-DATA-SAFETY-BACKUP.md`
13. `logic/L7-SETTINGS-SUPPORT-THEMES.md`
14. `logic/L8-ACCEPTANCE-HANDOFF.md`

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
- Historical Cinematic Wallpaper remains an optional post-core presentation capability.
- Historical Design Dashboard refresh remains an optional page presentation profile, not Design Request business logic.
- Sibling Design/Scope/File/Menu tools remain outside Companion scope.
- Chrome/Edge use one shared behavior/source architecture with separate browser acceptance.
- Static/package success never substitutes for installed-browser acceptance.

---

## L5A post-mine logic now settled

The legacy parity delta is no longer open.

Canonical decisions:

- visible Context tab time = **Context Today**, not lifetime Job Total;
- tab Today comes from the canonical read model and never owns a separate clock;
- ACTIVE tabs include valid current contribution;
- PENDING anchors do not count before Resume/Start Fresh;
- LOCAL_PAUSED/inactive tabs remain stable;
- Safety Hold caps tab/Main/aggregate live contribution at the same boundary;
- provisional tab values may reconcile downward without deleting finalized history;
- threshold level uses unrounded Context Today and highest matching configured threshold;
- threshold accent and operational status are separate semantics;
- threshold meaning must not depend on color alone;
- real confirmed A -> B and real none -> B entry may focus/select/show/expand incoming B after authoritative evaluation;
- A -> none creates no arbitrary focus target;
- boot/recovery discovery of an existing Context does not impersonate a new native entry;
- same-Context verification/metadata does not steal focus or reopen manual collapse;
- dirty Settings/L6 routes may defer the newest focus intent instead of discarding work;
- newer explicit user selection beats an older unapplied focus intent;
- newer real Context focus supersedes older deferred intent.

See `logic/L5A-TAB-PARITY-FOCUS-DELTA.md` for the full interaction, failure, and A2/A3/A4 acceptance contract.

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
- null clock-out -> later Context behavior now has settled Logic in L5A but still needs implementation alignment/acceptance;
- live tab Today + threshold parity is now settled Logic but not yet canonical B3 implementation;
- destructive data tools remain intentionally locked;
- full installed-browser A4 acceptance for the new UI has not been completed.

---

## Canonical B2 gaps still open

Do not call full B2 settled until the owning implementation/acceptance work closes at least the currently known gaps:

- legacy migration invocation;
- safe observation of relevant native action 2/3/4 completion without Companion initiating native mutation;
- final READY/full B2 acceptance evidence;
- full B2 settlement.

The prototype UI and settled L5A Logic do not waive these requirements.

---

## Next action

### Complete canonical B2

Close the remaining B2 core authority gaps under the existing L2-L4 contracts.

### Then convert the prototype workspace into canonical B3

B3 must implement and accept the full L5 + L5A behavior, including:

- canonical live tab Today;
- threshold accent/accessibility;
- persistent reorder/select/hide neutrality;
- real incoming Context focus behavior;
- null -> Context re-entry behavior;
- same-Context no-focus/no-expand behavior;
- stale/deferred focus protection;
- real installed-browser interaction acceptance.

---

## Staged path from here

```text
R1  Targeted Logic delta — SETTLED
        ↓
B2-C  Complete canonical B2
        ↓
B3  Canonical Time Views / Workspace using L5 + L5A
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

## Logic readiness

**Ready** for implementation of the L5A delta under the existing staged dependencies.

There are no open behavior blockers in this delta. The next blockers are implementation/acceptance gaps in canonical B2, not missing framework or Logic definition.
