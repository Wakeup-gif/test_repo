# SquareCoil Companion Execution Gate Matrix

**Status:** active UI/theme/lab/Figma stabilization on `codex/squarecoil-b2c-migration`; exact candidate acceptance is pending
**Execution authority:** `docs/EXECUTION-ENFORCEMENT-PLAN.md`

This file maps the cross-stage requirements most relevant to the current stabilization work. `OPEN` means the requirement must be verified against the new exact candidate even if an older artifact previously passed related checks.

## Active stabilization batch — safe test lab, coherent Glass themes, and Chrome-style job tabs

```text
Intent: provide a sealed fictional SquareCoil lab, repair mixed Glass surfaces and the current Bing URL policy, and move job tabs above the Companion frame with safe reorder/archive gestures
Behavior changed or restored: fake actions 2/3/4/7 exercise the real observation pipeline without a real account; Dark/Light Glass remain one integrated background-and-surface choice; tabs protrude, scroll, reorder, and archive only inactive Recent Contexts through fenced Data authority
Files expected: local lab, wallpaper provider, generated theme ports, workspace UI/model, data protection read model, Figma handoff, targeted/unit/browser tests, package evidence
Impact tags: SHARED_UI_ROOT, AUTHORITY_FENCING, TIMER_LEDGER, WORKSPACE_SETTINGS, PRESENTATION, PACKAGE_ARTIFACT, DOCS_ONLY
Contracts touched: L2/L5/L5A workspace membership and focus, L6 archive/recovery protection, L7 Settings/Themes, B5-B optional presentation, B5-D theme/UI, L8 installed acceptance
Targeted gates: theme-port freshness, B3 workspace, B4 data/UI, B5 theme/settings/Figma, sealed-lab smoke/visual checks, check:b5e-integration, check:b6-candidate
Composed journeys: fictional job A -> B -> no Context -> C -> clock out; zero-history Settings; Dark/Light Glass fallback and Bing policy; tab reorder; eligible drag-to-page Archive + Undo; protected/canceled drag; short viewport
Full candidate gate required at completion: yes
Explicit exclusions: no real account/login or clock action; no Timer/Ledger/Bridge/native-clock authority change; no generated or packaged wallpaper artwork; no store publication or main-branch promotion
```

| ID | Requirement | Impact tag | Targeted proof | Composed/candidate proof | Current state |
|---|---|---|---|---|---|
| `OWN-001` | Exactly one renderer owns the contents and friendly status surface inside `#ussign-job-timer`; lifecycle fallback uses a distinct target. | `SHARED_UI_ROOT` | runtime UI fallback regression plus `UT-B5-UI-014` | popup/workspace status remains friendly through lifecycle transitions | `PASS` |
| `LIFE-001` | BFCache does not retire the live workspace; one runtime/root remains and Settings is interactive after restore. | `LIFECYCLE`, `SHARED_UI_ROOT` | `B1-LC-005/008` persisted pagehide/pageshow regression | installed Chromium BFCache -> Settings journey | `PASS` |
| `LIFE-002` | Worker restart reuses the page runtime and preserves an interactive workspace without duplicate listeners/resources. | `LIFECYCLE`, `SHARED_UI_ROOT` | `B1-LC-005/008`, `B1-LC-005/009/014` | installed worker restart -> Settings journey | `PASS` |
| `LIFE-003` | Workspace startup failure is observable, bounded, and recoverable/fallback-safe; no empty terminal catch hides it. | `LIFECYCLE`, `SHARED_UI_ROOT` | `UT-B5-UI-015`, `UT-B5-UI-016`, `UT-B5-UI-014` | visible safe fallback or successful bounded retry | `PASS` |
| `REC-001` | Recoverable `FAILED`/`UNAVAILABLE` legacy preflight is re-inspected after repair in the same core and remains fail closed until then. | `MIGRATION_STORAGE` | `UT-B2-MIG-029`, `UT-B2-MIG-030`, `UT-B2-MIG-031` | upgrade-profile recovery journey | `PASS` |
| `REC-002` | A preference fault after a committed migration cannot relabel or duplicate migration/Ledger evidence. | `MIGRATION_STORAGE` | `UT-B2-MIG-030`, `UT-B2-MIG-031` | exact-once upgrade evidence after retry | `PASS` |
| `UX-001` | Settings, Recent, Overview, and History remain available with zero history and no current clock-in. | `WORKSPACE_SETTINGS` | `UT-B5-UI-011`, `UT-B5-UI-012` | installed clean-profile zero-history Settings/theme/diagnostics journey | `PASS` |
| `UX-002` | Blocked core state keeps safe Settings and diagnostics available while Timer actions remain absent. | `WORKSPACE_SETTINGS`, `MIGRATION_STORAGE` | `UT-B5-UI-014` | malformed-upgrade profile interaction journey | `PASS` |
| `WORK-001` | Job tabs are sibling surfaces above the Companion frame, remain reachable by horizontal scroll and keyboard, and reorder presentation only. | `WORKSPACE_SETTINGS`, `PRESENTATION` | `UT-B3-WORKSPACE-007/008`, `UT-B3-UI-014/016/020`, sealed-lab overflow/scroll/keyboard-reveal/exact-reorder assertions | sealed-lab tab geometry/overflow/keyboard reveal plus installed reorder, short-viewport, and no-Timer-mutation journey | `MAPPED` |
| `DATA-001` | Drag-to-page Archive uses only closure-owned Context identity, shows a full-page eligible/blocked veil, refreshes protection at drop, and preserves History/Ledger; blur/Escape/external drags fail closed. | `AUTHORITY_FENCING`, `TIMER_LEDGER`, `WORKSPACE_SETTINGS` | `UT-B4-DATA-009/010/011`, `UT-B4-UI-005` through `017` | installed eligible Archive + Undo, current/protected, Escape-cancel, short-viewport, and Timer/Ledger invariant journey | `MAPPED` |
| `LAB-001` | The manual lab uses isolated temporary profiles and in-memory fictional SquareCoil routes; unexpected traffic and real SquareCoil access are blocked. | `AUTHORITY_FENCING`, `PACKAGE_ARTIFACT` | `npm run lab:smoke` + `npm run lab:smoke:edge` plus shared visual-contract assertions | headless Chrome/Edge sealed-lab smoke, deterministic retained visual capture, and installed Chrome/Edge exact-package acceptance | `MAPPED` |
| `FIGMA-001` | Figma handoff tokens, components, states, and screen list match the implemented shell/tab geometry and preserve the runtime Bing/no-generated-art boundary. | `PRESENTATION`, `DOCS_ONLY` | `UT-B5-FIGMA-001/002/003` | compare prepared frames with exact installed-browser captures | `MAPPED` |
| `PRES-001` | Dark Glass and Light Glass each include their background and translucent surfaces as one user choice, painted above the browser root canvas and below SquareCoil controls. | `PRESENTATION` | `UT-B5-CINE-*`, `UT-B5-UI-009`, painted-stack regression | installed `B5B-CINE-*` theme selection with representative opaque containers and screenshot evidence | `MAPPED` |
| `PRES-002` | Original/accessibility/disable/teardown removes or suspends all owned presentation without affecting Timer/Bridge/native controls; print hides Companion-owned UI/background resources. | `PRESENTATION` | cleanup, accessibility, authority-isolation tests, and `UT-B5-THEME-025` | installed restoration/forced-color/print journeys | `PASS` |
| `OBS-001` | Release-significant errors retain a stable privacy-safe phase/reason and user fallback; internal errors never overwrite primary friendly copy. Optional presentation state is reported separately from core readiness. | `LIFECYCLE`, `WORKSPACE_SETTINGS`, `SUPPORT_PRIVACY` | diagnostics whitelist plus workspace status/presentation-state tests | popup/workspace recovery and Advanced diagnostics journey | `PASS` |
| `PKG-001` | Build, validator, ZIP, browser harness, CI, and evidence consume one canonical package inventory. | `PACKAGE_ARTIFACT` | `UT-B6-PKG-001` | extracted ZIP inventory equals validated package | `PASS` |
| `PKG-002` | The exact downloaded ZIP is unchanged before/after installed Chrome and Edge clean/upgrade acceptance. | `PACKAGE_ARTIFACT` | package validator and A4 before/after digest checks | full browser/profile matrix on identical bytes | `OPEN` |
| `DOC-001` | Start Here, AGENTS, live gate matrix, version/build identity, and current evidence agree; historical evidence remains SHA-bound. | `DOCS_ONLY`, `PACKAGE_ARTIFACT` | `UT-B6-DOC-001` plus final exact-SHA evidence reconciliation | candidate evidence records the same source/artifact | `MAPPED` |

`PRES-001` remains `MAPPED`: its bundled fallback, integrated Glass stack, mocked provider path, and browser presentation journeys pass, but the prior Glass candidate's short headed Chrome run did not observe the browser-owned optional Bing permission grant. See `implementation/B6-GLASS-STABILIZATION-EVIDENCE.md`.

## Update Rule

For each active batch:

1. add any newly exposed critical requirement;
2. replace generic proof descriptions with exact stable test IDs;
3. mark `MAPPED` only after the owner and tests are identified;
4. mark `PASS` only after the exact candidate evidence exists;
5. never carry `PASS` forward automatically after affected source bytes change.
