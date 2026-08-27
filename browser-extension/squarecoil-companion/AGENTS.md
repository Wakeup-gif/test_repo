# SquareCoil Companion — Codex Working Instructions

This file scopes only `browser-extension/squarecoil-companion/`.

## Current task
Implement the first B2-C engineering slice only: production v0.7 migration invocation and marker-aware preflight.

Read these before editing code:
1. `docs/B2C-BUILDER-HANDOFF.md`
2. `logic/B2C-COMPLETION-READINESS.md`
3. `logic/B2C-IMPLEMENTATION-ENTRY-AUDIT.md`
4. `logic/L2-STATE-TIME-MIGRATION.md`
5. `logic/L1-LIFECYCLE.md`
6. `logic/L8-ACCEPTANCE-TEST-MATRIX.md`

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
- `src/content/trusted-transition-core.js`
- `src/data/legacy-preflight.js`
- `src/data/migration-command.js`
- `src/data/migration.js`
- `src/data/command-dispatcher.js`
- `src/extension/authority-router.js`
- `src/extension/authority-kernel.js`
- `src/data/store.js`

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

Also confirm:

```bash
git status --short
```

Do not finish with unrelated changes.

## Acceptance gate for this task
The implementation must cover the settled cases:
- MIG-C01 automatic OWNER migration
- MIG-C02 observer does not migrate
- MIG-C03 retained legacy keys do not block forever
- MIG-C04 production-path migration idempotency
- MIG-C05 migration failure remains atomic/fail-closed
- MIG-C06 CURRENT/ARCHIVE change after completion blocks automatic re-import
- MIG-C07 ACTIVITY-only change does not block timing
- READY-C03 unresolved/conflicted migration prevents false READY

Do not proceed to the native action 2/3/4 completion-hook slice in the same task unless explicitly instructed.

## Definition of done
- The migration flow is wired into production boot.
- OWNER performs at most one authoritative migration when REQUIRED.
- Matching retained legacy keys resolve COMPLETE_MATCH and normal boot continues.
- CURRENT/ARCHIVE source changes after completion fail closed without re-import.
- ACTIVITY-only change is nonblocking.
- Bridge starts only after migration resolves safely.
- Existing accepted B1/B2 behavior remains green.
- Changes are committed on the provided Codex branch; do not create another branch.
