# B6 Pre-B5-C Candidate Rehearsal Evidence

Status: **passed rehearsal — superseded before final acceptance by authorized B5-C**
Branch: `codex/squarecoil-b2c-migration`
Owning contract: `logic/L8-ACCEPTANCE-HANDOFF.md`

This exact run passed before the authorized B5-C probe-backed theme delta reached the branch. It remains valid evidence for source `a6b4eb55ef4ea411c92430ef11440e5ab6d00729`, but it is not the final B6 candidate. B6 must be rebuilt and rerun from the accepted post-B5-C source before this document can become final acceptance evidence.

## Requirements-to-evidence matrix

| Requirement | Primary implementation | Automated evidence | Installed-browser evidence |
|---|---|---|---|
| One exact clean source commit produces one allowlisted package and immutable ZIP | `scripts/build.js`, `scripts/package.js`, `scripts/candidate-identity.js`, `scripts/check-b6-candidate.js` | `npm run check:b6-candidate`; clean source identity, embedded fingerprint, package inventory, ZIP root, and byte-stability checks | `B6-CANDIDATE-001` in Chrome and Edge |
| Every accepted B1-B5-B behavior remains green | aggregate test/validation scripts and B1 browser harness | 478 aggregate unit/integration tests plus 13 prototype-compatibility tests | `PROFILE-CLEAN`: 26/26 in each browser |
| Fresh installation has no inherited authority/runtime state | B1 lifecycle boot and B6 profile harness | stable B1-B5-B regression inventory | `B6-PROFILE-001`; `PROFILE-CLEAN` in Chrome and Edge |
| v0.7 upgrade is fenced, idempotent, and preserves retained legacy evidence | migration, Preferences adoption, settlement, and upgrade-profile harness | migration/Preferences/READY fixtures in the aggregate gate | `B6-PROFILE-002`; `PROFILE-UPGRADE-V07`: 2/2 in each browser |
| READY requires lifecycle health, current OWNER authority, completed migration, aligned trusted core, and usable Bridge evidence | lifecycle controller, authority kernel, migration, trusted core, Bridge, popup health reporting | inherited B2 settlement/tenure/race fixtures plus B6 validation | clean and upgrade settlement cases prove fail-closed degradation and later genuine READY |
| Chrome and Edge exercise the same packaged bytes without native mutation | shared MV3 package and A4 installed-browser harness | exact package fingerprint and inventory checks | same ZIP SHA-256 before/after; zero native mutation attempts in both browsers |
| Candidate preparation does not promote or publish | workflow/package naming and handoff boundary | `release.json` is not advanced by B6 | no `main` merge, store submission, release publication, rollout, or live SquareCoil mutation |

## Automated gate

`npm run check:b6-candidate` passed at exact source commit `a6b4eb55ef4ea411c92430ef11440e5ab6d00729` with a clean worktree. It passed:

- 478 aggregate unit/integration tests: 90 B1 unit, 168 B2 unit, 29 B3 unit, 28 B4 unit, 73 B5 unit, 38 B1 integration, 42 B2 integration, 2 B3 integration, 4 B4 integration, and 4 B5 integration;
- the separate 13-test prototype-compatibility suite;
- JavaScript parse, manifest, package allowlist, candidate identity, static validation, and earlier-stage regression checks;
- 222 B2, 31 B3, 32 B4, 77 B5, and 3 B6 stable fixture IDs.

`node --check tests/b1-browser/run.js` and `git diff --check` also passed.

## Exact candidate identity

- source commit: `a6b4eb55ef4ea411c92430ef11440e5ab6d00729`;
- package version: `0.7.1`;
- build ID/stage: `rebuild-b6-release-candidate` / `B6`;
- `sourceDirty: false` and `acceptanceEligible: true`;
- candidate fingerprint: `a7e29a1f64a7dec7272c1dac150187a1df15b8eae4c2159c0f1568a09b7d4c84`;
- archive: `SquareCoil-Companion-v0.7.1-B6-RELEASE-CANDIDATE.zip`;
- archive bytes: `211701`;
- archive SHA-256 before/after: `b5572eb446fd060fdb42de6298c333dde5e8e45e9c46fd1bdc7f628d12ba6ae0`;
- package/extracted ZIP inventory digest: `226d6b1f0dd582b6eec2a40d184bbf2b573ff00eebeb95124866b44e2fe3a856`;
- A4 evidence SHA-256: `ebc2e706a30c44ee10fdb1f7a62f40913ea902256b7fb6f637a86f47f2456ea3`;
- exact package inventory: 8/8 allowlisted files;
- archive and extracted package remained unchanged across every Chrome and Edge profile.

## Exact package inventory

| File | Bytes | SHA-256 |
|---|---:|---|
| `dist/background.js` | 376326 | `8f05856de5621cb1e948c6a6906aacb9802e7636ffc192962e62b5e04adbd533` |
| `dist/build-info.json` | 271 | `fd430c4d41ea7452f38305aac2b9821559e9499a3767796957321d926906e828` |
| `dist/companion-app.js` | 56735 | `dec45200b264f722d3c6ec69f7d44190e38508006852e8f9a0e6043fbcb119b6` |
| `dist/content-controller.js` | 553018 | `78e454f476547cacfb257b8104e78748d221d4d79f5cda62bcea3da8265cbd3c` |
| `dist/popup.js` | 7223 | `33f4dac6568da5541f7ae679b5846c92b7b027c2ce37984c05beb9e168587a29` |
| `manifest.json` | 907 | `4c7590c54554187fff34b64475e6a93aea3a49643de2248ecef8d3013b64271e` |
| `popup/popup.css` | 1951 | `9b7faf1815c853bf53df35df49790d0f496701bc3d8a3df77aabf4f2f5731000` |
| `popup/popup.html` | 1629 | `2c460ad11eb1ae16fae556b543f5af5b6afeb6e1217e19f069a20212d4c8c52c` |

## Installed Chrome and Edge result

The acceptance-eligible A4 run started `2026-08-28T15:07:54.783Z` and finished `2026-08-28T15:13:56.260Z` on Windows x64 with Node `v24.14.0` and Playwright `1.62.1`.

| Browser | Installed identity | Executable SHA-256 | Clean profile | v0.7 upgrade profile |
|---|---|---|---:|---:|
| Google Chrome | `Chrome/151.0.7922.174` | `b6d40f55e48e61760335d18f46abcec929e1a11b8330e7f2b501037584af4aa4` | PASS 26/26 | PASS 2/2 |
| Microsoft Edge | `Edg/151.0.4129.107` | `1c43c32ab3d8442171fafa7614015dd5b6977e60f8fa22e63f0c30f0b1e6ccf8` | PASS 26/26 | PASS 2/2 |

Both browsers observed `B6-CANDIDATE-001`, `B6-PROFILE-001`, and `B6-PROFILE-002`. Across both profiles and browsers there were zero failures, unsupported cases, unexpected network requests, console/page errors, cleanup warnings, or native SquareCoil mutation attempts.

The upgrade cases preserved the retained v0.7 source, imported the synthetic ledger exactly once, adopted bounded nested legacy settings, kept optional presentation off, degraded when current settlement evidence was incomplete, and reported READY only after current OWNER authority, complete migration, trusted-core alignment, and full Bridge observation all agreed. Revalidation degraded fail closed and a new valid settlement restored READY.

## CI evidence

GitHub Actions run [`33183471632`](https://github.com/Wakeup-gif/test_repo/actions/runs/33183471632) completed successfully for exact source commit `a6b4eb55ef4ea411c92430ef11440e5ab6d00729`.

It produced these time-limited workflow artifacts:

- `squarecoil-companion-b6-release-candidate-chrome` — artifact `9690679883`;
- `squarecoil-companion-b6-release-candidate-edge` — artifact `9690680651`;
- `squarecoil-companion-b6-release-candidate-package-evidence` — artifact `9690681347`.

## Proof boundary and remaining authorization boundary

Installed-browser acceptance uses synthetic in-memory SquareCoil pages and intercepted read-only action-7 responses. It proves the exact packaged extension behavior, lifecycle/settlement gates, migration compatibility, and absence of native mutation attempts for the tested fixtures. It does not claim a live SquareCoil business action, production traffic, or store environment was exercised.

The real Chrome/Edge optional-host permission prompt for Bing was not accepted by automation. Its API grant/denial/acknowledgment behavior remains covered at the unit boundary; the installed-browser candidate proves default no-access, zero Bing requests, safe fallback, and teardown paths.

B6 candidate acceptance does **not** authorize or perform a merge to `main`, production promotion, release/store publication, rollout, or any new live SquareCoil mutation. Those remain separate explicit decisions.
