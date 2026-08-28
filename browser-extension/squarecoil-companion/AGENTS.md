# SquareCoil Companion — Codex Working Instructions

This file scopes only `browser-extension/squarecoil-companion/`.

## Current task
Final B2-C is implemented on `codex/squarecoil-b2c-migration`: migration invocation, passive native action 2/3/4 observation, current-OWNER evidence routing, verification fallback, and the final READY settlement gate. Preserve that boundary and keep every B2 acceptance gate green.

Do not begin B3, B4, or B5 without a new explicit authorization. Final B2 settlement does not promote this branch to production `main`.

Read these before changing final B2 code:
1. `docs/B2C-BUILDER-HANDOFF.md`
2. `logic/B2C-COMPLETION-READINESS.md`
3. `logic/B2C-IMPLEMENTATION-ENTRY-AUDIT.md`
4. `logic/L2-STATE-TIME-MIGRATION.md`
5. `logic/L1-LIFECYCLE.md`
6. `logic/L3-SQUARECOIL-BRIDGE.md`
7. `logic/L8-ACCEPTANCE-HANDOFF.md`

Do not redesign settled behavior. If implementation exposes a true contradiction, stop and report it rather than inventing new product behavior.

## Architecture constraints
- Exactly one authoritative Timer/Ledger writer.
- SquareCoil remains company-clock authority.
- The Bridge is observational/read-only.
- Migration mutation is OWNER-only and fenced.
- OBSERVER runtimes never create fallback local authority.
- Retained v0.7 localStorage keys are read-only forensic evidence; do not delete or rewrite them.
- Do not silently rerun or merge migration after a completed marker when CURRENT/ARCHIVE source evidence changed.
- ACTIVITY-only post-migration source changes must not block timing when CURRENT/ARCHIVE still match.
- No Bridge-driven timing may begin while migration is REQUIRED, IN_PROGRESS, FAILED, UNAVAILABLE, or SOURCE_CHANGED_AFTER_COMPLETION.
- Imported data must not create live Active/Pending/Local Pause solely from file/source state.
- Do not weaken revision/fencing checks.

## Primary files for this slice
- `src/core/b2-ready-settlement.js`
- `src/content/trusted-transition-core.js`
- `src/extension/authority-client.js`
- `src/extension/authority-protocol.js`
- `src/extension/authority-router.js`
- `src/extension/background-entry.js`
- `src/extension/native-completion-observer.js`
- `src/squarecoil/bridge-engine.js`
- `src/squarecoil/bridge-service.js`
- `src/popup/popup.js`
- `popup/popup.html`

Add or modify tests under `tests/b2/` and `tests/b2-integration/` as needed.

Do not edit `dist/` directly. `scripts/build.js` generates it from `src/`.

## Environment
- Node.js 22 is the CI baseline.
- The project currently has no external npm dependencies and no lockfile.
- Work from `browser-extension/squarecoil-companion/` when running npm scripts.

## Required checks before finishing
Run all of these after code changes:

```bash
npm run test:b2:unit
npm run test:b2:integration
npm run test:proto-ui
npm run check:b2-transition
```

`check:b2-transition` runs the full build/unit/integration/validation path, so failures there are release-blocking for this task.

For a final B2 candidate, also build one clean exact package and run `tests/b1-browser/run.js` independently in installed branded Chrome and Edge. Both runs must be acceptance-eligible PASS results against unchanged package/ZIP bytes and the exact candidate source SHA.

Also confirm:

```bash
git status --short
```

Do not finish with unrelated changes.

## Acceptance gate for this task
All accepted B1/B2 behavior must remain green. The implementation must continue to cover MIG-C01 through MIG-C07, NAT-C01 through NAT-C09, and READY-C01 through READY-C04. READY must be derived only from current-generation, exact-acknowledged authority evidence plus aligned trusted-core, migration, and Bridge state. Cached/stale authority, ownership mismatch, incomplete preflight, missing initial OWNER observation, unavailable Bridge, and blocked migration must remain non-READY.

Do not proceed to B3, B4, or B5 in this task.

## Definition of done
- Actions 2/3/4 are observed passively only after successful completion.
- Sanitized evidence reaches exactly one current fenced OWNER.
- OWNER performs mandatory fresh verification before any Timer/Ledger mutation.
- Duplicate, stale-generation, retired-runtime, and genuinely superseded evidence fails closed.
- Missing native observation reports `VERIFICATION_FALLBACK`, never false `FULL`.
- OWNER and OBSERVER effective health report READY only when their authority and Bridge roles agree.
- Popup health uses the final settlement result and explains that incomplete/blocked prerequisites remain degraded.
- Installed branded Chrome and Edge pass against one exact clean package; dirty development runs are non-acceptance only.
- Existing accepted migration and B1/B2 behavior remains green.
- Changes are committed on the provided Codex branch; do not create another branch.
