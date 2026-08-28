# SquareCoil Companion Rebuild — Current Handoff

Updated: 2026-08-28
Repository: `Wakeup-gif/test_repo`
Branch: `codex/squarecoil-b2c-migration`

## Current gate

- B1 through B2-C: accepted and preserved.
- B3 Canonical Time Views / Workspace: accepted at exact source commit `e3b369e691df317462bf6ef53cd981f682cca1d2`.
- B4 Data Safety / Files: accepted at exact source commit `e5b6bb6014aee087b85fcd97901b3944e45a77ec`.
- B5-A Core Settings / Support / Themes: accepted at exact source commit `117b81604c66d57a3cbf356d6d974bef4a887242`.
- B5-B Optional Presentation: accepted at exact source commit `fff15682dd605c52264176a2a8282d897c6cb98b`.
- B5-C Probe-Backed Theme Delta: accepted at exact source `aeac7fe52a2e723106340bc6d283d2eb49521573`.
- B6 Full Acceptance / Candidate Packaging: accepted against the same exact source.

No merge/promotion to `main`, release/store publication, or new live SquareCoil mutation is authorized.

## Accepted through B6

The implementation preserves the accepted B1-B4 lifecycle, authority, Bridge, migration, Timer/Ledger, workspace, and data-safety gates. B5-A adds fenced Preferences, Settings, themes, and Support. B5-B adds the optional Cinematic and Design Dashboard packs, both off by default and without timing authority. B5-C adds only three route-bounded CSS adapter families. B6 reconciles all accepted scope against one exact clean package, immutable ZIP identity, clean-install and v0.7-upgrade profiles, installed Chrome/Edge, and CI.

See `implementation/B5C-PROBE-THEME-EVIDENCE.md`, `implementation/B6-RELEASE-CANDIDATE-EVIDENCE.md`, and `docs/FEATURE-LEDGER.md`.

## Accepted B5-A evidence

The aggregate 437-test gate and separate 13-test prototype compatibility gate passed. One clean package/ZIP passed 24/24 cases in installed Chrome 151 and Edge 151 with unchanged bytes, exact source identity, no unexpected network/console errors, and no native mutation attempts. GitHub Actions run `33158338455` succeeded. See `implementation/B5A-SETTINGS-PRESENTATION-EVIDENCE.md` for hashes and fixture mapping.

## Accepted B5-B evidence

The aggregate 477-test gate and separate 13-test prototype compatibility gate passed. Exact clean package `fff15682dd605c52264176a2a8282d897c6cb98b` passed 25/25 cases in installed Chrome 151 and Edge 151 with unchanged bytes, exact source identity, zero unpermitted Bing access, no unexpected network/console errors, and no native mutation attempts. GitHub Actions run `33162812787` succeeded. See `implementation/B5B-OPTIONAL-PRESENTATION-EVIDENCE.md` for hashes, permission proof boundary, and fixture mapping.

## Accepted B5-C and B6 evidence

Exact clean source `aeac7fe52a2e723106340bc6d283d2eb49521573` passed 482 aggregate tests, 13 prototype tests, all four B5-C installed-browser fixtures, clean 27/27 and upgrade 2/2 in installed Chrome 151 and Edge 151, immutable package/ZIP checks, and GitHub Actions run `33185826761`. There were zero failures, unsupported cases, unexpected requests, console/page errors, cleanup warnings, or native mutation attempts.

The earlier `a6b4eb55ef4ea411c92430ef11440e5ab6d00729` B6 run is superseded rehearsal evidence and is not the accepted candidate.

## Next authorization boundary

There is no later implementation gate authorized. B5-D, merge/promotion to `main`, release/store publication, rollout, and new live SquareCoil mutations require separate exact instructions.

## Safety boundary

Exactly one fenced OWNER remains the authoritative Timer/Ledger writer. SquareCoil remains the company clock. The Bridge remains observational/read-only. Presentation and optional features never become timer authority. All installed-browser work remains synthetic/read-only unless the user separately authorizes one exact live action.
