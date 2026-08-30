# SquareCoil Companion Execution Gate Matrix

**Status:** critical stabilization ledger; refresh against the active worktree before claiming candidate readiness
**Execution authority:** `docs/EXECUTION-ENFORCEMENT-PLAN.md`

This file maps the cross-stage requirements most relevant to the current stabilization work. `OPEN` means the requirement must be verified against the new exact candidate even if an older artifact previously passed related checks.

## Active stabilization batch — visible Glass background and workspace finish

```text
Intent: restore the accepted integrated Glass theme and finish the existing Companion workspace presentation
Behavior changed or restored: Bing/cache/gradient background must paint behind readable translucent SquareCoil surfaces; presentation state must be visible in privacy-safe diagnostics; existing pre-clock-in navigation remains usable
Files expected: cinematic background, theme service, workspace UI, support diagnostics, targeted/unit/browser tests, package evidence
Impact tags: PRESENTATION, WORKSPACE_SETTINGS, SUPPORT_PRIVACY, PACKAGE_ARTIFACT
Contracts touched: L7 Settings/Support/Themes, B5-B optional presentation, B5-D theme/UI, L8 installed acceptance
Targeted gates: B5 cinematic/theme/settings/support tests, check:b5e-integration, check:b6-candidate
Composed journeys: zero-history Settings -> Glass theme -> visible background; fallback -> permission retry -> Bing image; Advanced diagnostics -> truthful presentation state; Restore Native cleanup
Full candidate gate required at completion: yes
Explicit exclusions: no Timer/Ledger/Bridge/migration/lifecycle/native SquareCoil mutation changes; no generated or packaged wallpaper artwork; no store publication or main-branch promotion
```

| ID | Requirement | Impact tag | Targeted proof | Composed/candidate proof | Current state |
|---|---|---|---|---|---|
| `OWN-001` | Exactly one renderer owns the contents and friendly status surface inside `#ussign-job-timer`; lifecycle fallback uses a distinct target. | `SHARED_UI_ROOT` | runtime UI fallback regression plus `UT-B5-UI-014` | popup/workspace status remains friendly through lifecycle transitions | `MAPPED` |
| `LIFE-001` | BFCache does not retire the live workspace; one runtime/root remains and Settings is interactive after restore. | `LIFECYCLE`, `SHARED_UI_ROOT` | `B1-LC-005/008` persisted pagehide/pageshow regression | installed Chromium BFCache -> Settings journey | `MAPPED` |
| `LIFE-002` | Worker restart reuses the page runtime and preserves an interactive workspace without duplicate listeners/resources. | `LIFECYCLE`, `SHARED_UI_ROOT` | `B1-LC-005/008`, `B1-LC-005/009/014` | installed worker restart -> Settings journey | `MAPPED` |
| `LIFE-003` | Workspace startup failure is observable, bounded, and recoverable/fallback-safe; no empty terminal catch hides it. | `LIFECYCLE`, `SHARED_UI_ROOT` | `UT-B5-UI-015`, `UT-B5-UI-016`, `UT-B5-UI-014` | visible safe fallback or successful bounded retry | `MAPPED` |
| `REC-001` | Recoverable `FAILED`/`UNAVAILABLE` legacy preflight is re-inspected after repair in the same core and remains fail closed until then. | `MIGRATION_STORAGE` | `UT-B2-MIG-029`, `UT-B2-MIG-030`, `UT-B2-MIG-031` | upgrade-profile recovery journey | `MAPPED` |
| `REC-002` | A preference fault after a committed migration cannot relabel or duplicate migration/Ledger evidence. | `MIGRATION_STORAGE` | `UT-B2-MIG-030`, `UT-B2-MIG-031` | exact-once upgrade evidence after retry | `MAPPED` |
| `UX-001` | Settings, Recent, Overview, and History remain available with zero history and no current clock-in. | `WORKSPACE_SETTINGS` | `UT-B5-UI-011`, `UT-B5-UI-012` | installed clean-profile zero-history Settings/theme/diagnostics journey | `MAPPED` |
| `UX-002` | Blocked core state keeps safe Settings and diagnostics available while Timer actions remain absent. | `WORKSPACE_SETTINGS`, `MIGRATION_STORAGE` | `UT-B5-UI-014` | malformed-upgrade profile interaction journey | `MAPPED` |
| `PRES-001` | Dark Glass and Light Glass each include their background and translucent surfaces as one user choice, painted above the browser root canvas and below SquareCoil controls. | `PRESENTATION` | `UT-B5-CINE-*`, `UT-B5-UI-009`, painted-stack regression | installed `B5B-CINE-*` theme selection with representative opaque containers and screenshot evidence | `MAPPED` |
| `PRES-002` | Original/accessibility/disable/teardown removes or suspends all owned presentation without affecting Timer/Bridge/native controls; print hides Companion-owned UI/background resources. | `PRESENTATION` | cleanup, accessibility, authority-isolation tests, and `UT-B5-THEME-025` | installed restoration/forced-color/print journeys | `MAPPED` |
| `OBS-001` | Release-significant errors retain a stable privacy-safe phase/reason and user fallback; internal errors never overwrite primary friendly copy. Optional presentation state is reported separately from core readiness. | `LIFECYCLE`, `WORKSPACE_SETTINGS`, `SUPPORT_PRIVACY` | diagnostics whitelist plus workspace status/presentation-state tests | popup/workspace recovery and Advanced diagnostics journey | `MAPPED` |
| `PKG-001` | Build, validator, ZIP, browser harness, CI, and evidence consume one canonical package inventory. | `PACKAGE_ARTIFACT` | `UT-B6-PKG-001` | extracted ZIP inventory equals validated package | `MAPPED` |
| `PKG-002` | The exact downloaded ZIP is unchanged before/after installed Chrome and Edge clean/upgrade acceptance. | `PACKAGE_ARTIFACT` | package validator and A4 before/after digest checks | full browser/profile matrix on identical bytes | `MAPPED` |
| `DOC-001` | Start Here, AGENTS, live gate matrix, version/build identity, and current evidence agree; historical evidence remains SHA-bound. | `DOCS_ONLY`, `PACKAGE_ARTIFACT` | `npm run validate` documentation/status checks | candidate evidence records the same source/artifact | `MAPPED` |

## Update Rule

For each active batch:

1. add any newly exposed critical requirement;
2. replace generic proof descriptions with exact stable test IDs;
3. mark `MAPPED` only after the owner and tests are identified;
4. mark `PASS` only after the exact candidate evidence exists;
5. never carry `PASS` forward automatically after affected source bytes change.
