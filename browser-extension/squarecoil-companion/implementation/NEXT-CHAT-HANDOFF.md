# SquareCoil Companion Rebuild — Current Handoff

Updated: 2026-08-28
Repository: `Wakeup-gif/test_repo`
Branch: `codex/squarecoil-b2c-migration`

## Current gate

- B1 through B2-C: accepted and preserved.
- B3 Canonical Time Views / Workspace: accepted at exact source commit `e3b369e691df317462bf6ef53cd981f682cca1d2`.
- B4: explicitly authorized and current.
- B5-A, B5-B, B6: authorized sequentially after the preceding gates pass.

No merge/promotion to `main`, release/store publication, or new live SquareCoil mutation is authorized.

## B3 candidate

The implementation now provides one canonical revisioned read surface for compact Context Today tabs, Main, Recent, Overview, By Day, By Context, Context Detail, and finalized logical History. Selection, reorder, hide/show, and navigation are presentation-only. Real native Context transitions retain a durable focus identity across later verification, while boot discovery, same-Context verification, stale intent, and older deferred intent fail closed.

See `implementation/B3-WORKSPACE-EVIDENCE.md` and `docs/FEATURE-LEDGER.md`.

## Accepted B3 evidence

The aggregate 368-test gate and the separate 13-test inherited UI compatibility gate passed. One clean package/ZIP passed installed Chrome 151 and Edge 151 with unchanged bytes, exact source identity, no unexpected network/console errors, and no native mutation attempts. GitHub Actions run `33149161832` succeeded. See `implementation/B3-WORKSPACE-EVIDENCE.md` for hashes and fixture mapping.

## Next authorized gate

Read the complete B4 source set required by `AGENTS.md`, especially L6, the B4 readiness audit, relevant L2 persistence/migration rules, and L8 B4 acceptance. Implement only settled data-safety behavior. Imported/restored data must never fabricate Active, Pending, or Local Pause state; destructive actions require explicit, reviewable commands.

## Safety boundary

Exactly one fenced OWNER remains the authoritative Timer/Ledger writer. SquareCoil remains the company clock. The Bridge remains observational/read-only. Presentation and optional features never become timer authority. All installed-browser work remains synthetic/read-only unless the user separately authorizes one exact live action.
