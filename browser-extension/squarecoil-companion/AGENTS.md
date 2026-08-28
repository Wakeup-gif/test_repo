# SquareCoil Companion — Codex Working Instructions

This file scopes only `browser-extension/squarecoil-companion/`.

## Current task

B2-C, B3, B4, and B5-A are accepted on `codex/squarecoil-b2c-migration`. B5-B Optional Presentation is the current authorized task. The user has explicitly authorized sequential continuation through B6 after B5-B passes.

Do not merge or promote to `main`, publish a release/store build, or add a new live SquareCoil mutation without separate exact approval.

Before B3 changes, read:

1. `logic/L2-STATE-TIME-MIGRATION.md`
2. `logic/L4-TIMER-BEHAVIOR.md`
3. `logic/L5-TIME-VIEWS-WORKSPACE.md`
4. `logic/L5A-TAB-PARITY-FOCUS-DELTA.md`
5. `logic/L8-ACCEPTANCE-HANDOFF.md`
6. `logic/B3-WORKSPACE-READINESS-AUDIT.md`
7. accepted B1/B2 evidence and the actual source/tests

Before B4 changes, read all of B3's preserved contracts plus:

1. `logic/L6-DATA-SAFETY-BACKUP.md`
2. `logic/B4-DATA-READINESS-AUDIT.md`
3. the L2 persistence/migration rules referenced by that audit
4. the B4 acceptance requirements in `logic/L8-ACCEPTANCE-HANDOFF.md`

Before B5-A/B5-B changes, read `logic/L7-SETTINGS-SUPPORT-THEMES.md`, the applicable B5 readiness audit, the feature reconciliation/ledger, and every source/audit artifact explicitly required there.

Do not redesign settled behavior. If implementation exposes a true contradiction, stop and report it.

## Architecture constraints

- Exactly one authoritative Timer/Time Ledger writer.
- SquareCoil remains company-clock authority.
- The Bridge is observational/read-only.
- Migration and authoritative mutations are OWNER-only and fenced.
- OBSERVER runtimes never create fallback local authority.
- Exact acknowledgments and current-generation evidence remain mandatory.
- Retained v0.7 localStorage keys are read-only forensic evidence; do not delete or rewrite them.
- Imported data cannot fabricate live Active, Pending, or Local Pause state.
- Workspace selection, visibility, order, navigation, appearance, and optional presentation never own timing.
- Optional presentation failures must not degrade healthy Timer authority.
- Disabled optional features must remove their owned resources and leave native SquareCoil/core Companion behavior intact.
- Do not weaken revision, fencing, lifecycle, migration, or READY settlement checks.

## Source and generated output

Work from this directory for npm scripts. Node.js 22 is the CI baseline. The project has no external npm dependencies and no lockfile.

Do not edit `dist/` directly. `scripts/build.js` generates it from `src/`; `dist/` is intentionally untracked.

## Required regression checks

Run all of these after B3 code changes:

```bash
npm run test:b3:unit
npm run test:b3:integration
npm run test:proto-ui
npm run check:b3-workspace
```

All accepted B1/B2 checks in the aggregate gate must remain green. B3 fixtures use stable unique `UT-B3-*` or `IT-B3-*` IDs.

B3 exact-candidate evidence is recorded in `implementation/B3-WORKSPACE-EVIDENCE.md` and must remain green.

Before any later-stage commit, run that stage's explicit gate plus every earlier aggregate regression and the installed-browser acceptance required by its owning audit.

Also run:

```bash
git diff --check
git status --short
```

Do not finish with unrelated changes.

## Accepted B3 gate

- One canonical revision feeds Main, tabs, Recent, Overview, By Day, By Context, Context Detail, and finalized History.
- Tab time is Context Today; thresholds compare exact unrounded Today and are not the operational-status signal.
- General Contexts do not consume numbered-job capacity; selected/current truth is protected.
- Selection, reorder, hide/show, and navigation never mutate Timer/Ledger state or native SquareCoil.
- Real incoming Context transitions produce ordered focus intent; boot discovery, same-Context verification, stale intent, and older deferred intent do not steal focus.
- Current/native disposition remains distinct from selected historical inspection.
- Pending, provisional, Safety Hold, time-basis fallback, and undated legacy balances are disclosed without fabricated attribution.
- History is finalized-only, reconstructs logical sessions safely, and loads incrementally without pruning authoritative history.
- Cross-tab order/visibility converges, and active interactions are not broken by refresh.
- Installed Chrome and Edge pass the B3 A4 fixtures with no native mutation attempts.

## Accepted B5-A gate

- One fenced Preferences service owns durable appearance and Timer Limit revisions; stale multi-field drafts fail closed.
- Timer Appearance, Panel Finish, and Website Theme preserve durable preference versus effective accessibility/capability fallback.
- Theme application owns at most one removable layer and never gains Timer, Ledger, Bridge, lifecycle, or native-clock authority.
- Settings routes and Support drafts remain transient and guarded; diagnostics are opt-in, frozen, and privacy-whitelisted.
- Missing Developer Support configuration stays unavailable without fabricated links, payment state, or QR content.
- Exact candidate `117b81604c66d57a3cbf356d6d974bef4a887242` passed aggregate, prototype, installed Chrome/Edge, package-integrity, and CI gates with no native mutation attempts.

## Stage boundary

Implement only the settled, explicitly activated B5-B optional-presentation behavior, update its evidence/current-state documents, commit and push the coherent gate, and require exact acceptance before continuing to B6. Keep optional features off by default and fail closed when source, route, permission, accessibility, lifecycle, or teardown evidence is incomplete. Promotion, publication, and new live mutations remain out of scope.
