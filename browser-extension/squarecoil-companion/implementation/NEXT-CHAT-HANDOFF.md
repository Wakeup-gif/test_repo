# SquareCoil Companion Rebuild — Current Handoff

Updated: 2026-08-28
Repository: `Wakeup-gif/test_repo`
Branch: `codex/squarecoil-b2c-migration`

## Current gate

- B1 through B2-C: accepted and preserved.
- B3 Canonical Time Views / Workspace: accepted at exact source commit `e3b369e691df317462bf6ef53cd981f682cca1d2`.
- B4 Data Safety / Files: accepted at exact source commit `e5b6bb6014aee087b85fcd97901b3944e45a77ec`.
- B5-A Core Settings / Support / Themes: accepted at exact source commit `117b81604c66d57a3cbf356d6d974bef4a887242`.
- B5-B is explicitly authorized and current; B6 follows only after B5-B passes.

No merge/promotion to `main`, release/store publication, or new live SquareCoil mutation is authorized.

## Accepted through B5-A

The implementation preserves the accepted B1-B4 lifecycle, authority, Bridge, migration, Timer/Ledger, workspace, and data-safety gates. B5-A adds one fenced Preferences service, Settings navigation, canonical Timer Limits, bounded themes, privacy-safe Support/Feedback, and unavailable-by-default Developer Support without granting presentation any timing authority.

See `implementation/B5A-SETTINGS-PRESENTATION-EVIDENCE.md` and `docs/FEATURE-LEDGER.md`.

## Accepted B5-A evidence

The aggregate 437-test gate and separate 13-test prototype compatibility gate passed. One clean package/ZIP passed 24/24 cases in installed Chrome 151 and Edge 151 with unchanged bytes, exact source identity, no unexpected network/console errors, and no native mutation attempts. GitHub Actions run `33158338455` succeeded. See `implementation/B5A-SETTINGS-PRESENTATION-EVIDENCE.md` for hashes and fixture mapping.

## Next authorized gate

Read the complete B5-B source set required by `AGENTS.md`, especially `logic/B5B-OPTIONAL-PRESENTATION-BEHAVIOR.md`, L7/L8, the feature mine/ledger, and the actual Tampermonkey userscript inventory. Activate only independently safe presentation behavior, keep it opt-in/off by default, and fail closed on unproven source, permission, route, privacy, accessibility, stale-result, lifecycle, or teardown behavior.

## Safety boundary

Exactly one fenced OWNER remains the authoritative Timer/Ledger writer. SquareCoil remains the company clock. The Bridge remains observational/read-only. Presentation and optional features never become timer authority. All installed-browser work remains synthetic/read-only unless the user separately authorizes one exact live action.
