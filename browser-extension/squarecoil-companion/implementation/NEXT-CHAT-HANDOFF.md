# SquareCoil Companion Rebuild — Current Handoff

Updated: 2026-08-28
Repository: `Wakeup-gif/test_repo`
Branch: `codex/squarecoil-b2c-migration`

## Current gate

- B1 through B2-C: accepted and preserved.
- B3 Canonical Time Views / Workspace: implemented; final clean exact-package acceptance pending.
- B4: explicitly authorized after B3 passes; not started in this candidate.
- B5-A, B5-B, B6: authorized sequentially after the preceding gates pass.

No merge/promotion to `main`, release/store publication, or new live SquareCoil mutation is authorized.

## B3 candidate

The implementation now provides one canonical revisioned read surface for compact Context Today tabs, Main, Recent, Overview, By Day, By Context, Context Detail, and finalized logical History. Selection, reorder, hide/show, and navigation are presentation-only. Real native Context transitions retain a durable focus identity across later verification, while boot discovery, same-Context verification, stale intent, and older deferred intent fail closed.

See `implementation/B3-WORKSPACE-EVIDENCE.md` and `docs/FEATURE-LEDGER.md`.

## Required B3 closeout

1. Run `npm run test:b3:unit`.
2. Run `npm run test:b3:integration`.
3. Run `npm run test:proto-ui`.
4. Run `npm run check:b3-workspace`.
5. Commit the clean candidate.
6. Build one exact package with `sourceDirty: false` and the candidate commit SHA.
7. Run the same unchanged package/ZIP independently in installed Chrome and Edge.
8. Push, verify remote equality, and verify CI.
9. Record the immutable candidate/ZIP/browser evidence and mark B3 accepted.

Dirty development Chrome and Edge rehearsals already pass against the same bytes, but are not acceptance evidence.

## Next authorized gate

After B3 passes, read the complete B4 source set required by `AGENTS.md`, especially L6, the B4 readiness audit, relevant L2 persistence/migration rules, and L8 B4 acceptance. Implement only settled data-safety behavior. Imported/restored data must never fabricate Active, Pending, or Local Pause state; destructive actions require explicit, reviewable commands.

## Safety boundary

Exactly one fenced OWNER remains the authoritative Timer/Ledger writer. SquareCoil remains the company clock. The Bridge remains observational/read-only. Presentation and optional features never become timer authority. All installed-browser work remains synthetic/read-only unless the user separately authorizes one exact live action.
