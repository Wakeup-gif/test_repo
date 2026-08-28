# B1-B5-A installed-browser acceptance harness

This harness loads one exact unpacked package into installed, branded Google Chrome and Microsoft Edge. It retains the settled B1 lifecycle, B2 authority/transition/READY, B3 workspace, and B4 data-safety gates while exercising B5-A settings and presentation against the exact packaged bytes. It serves only synthetic fixture HTML in memory. No request reaches SquareCoil or customer data.

## Required package

The `--package` directory must contain exactly the eight allowlisted release files:

- `manifest.json`
- `dist/background.js`
- `dist/build-info.json`
- `dist/companion-app.js`
- `dist/content-controller.js`
- `dist/popup.js`
- `popup/popup.html`
- `popup/popup.css`

`--archive` must name the ZIP from which the directory was extracted. The harness reads each ZIP entry and requires its eight file hashes and byte counts to match the extracted inventory exactly. It records the ZIP filename, SHA-256, optional single root prefix, and shared inventory digest, then verifies both the ZIP and directory are unchanged after both browsers. Stored and deflated ZIP entries are supported; encrypted, multi-disk, and ZIP64 archives fail closed.

`dist/build-info.json` must contain:

- `buildId: "rebuild-b5a-settings-presentation"`;
- `stage: "B5-A"`;
- a lowercase 64-character `candidateFingerprint` embedded exactly in `dist/background.js`, `dist/companion-app.js`, and `dist/content-controller.js`;
- a lowercase 40-character `sourceSha` exactly matching `--expected-source-sha`;
- boolean `sourceDirty`, which must be `false` for acceptance.

## Run

From `browser-extension/squarecoil-companion`:

```powershell
$env:NODE_PATH = "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules"
node tests/b1-browser/run.js `
  --package C:\absolute\path\to\exact-package `
  --archive C:\absolute\path\to\exact-package.zip `
  --expected-source-sha 0123456789abcdef0123456789abcdef01234567 `
  --browser all `
  --evidence C:\absolute\path\to\a4-evidence.json
```

The harness also locates the bundled Codex Playwright runtime automatically when it is installed in its standard location. Use `SC_PLAYWRIGHT_MODULE` to point to another Playwright module without changing repository files.

Use `--headed` only when visible browser windows are useful. Browser executables default to the standard Windows Chrome and Edge locations and can be overridden with `--chrome-executable` and `--edge-executable`.

`--allow-dirty-development` permits a temporary dirty build for harness development. Such a run is always labeled `NON_ACCEPTANCE`; it cannot produce an acceptance pass.

## Exit and evidence rules

- Exit `0`, status `PASS`: both exact branded browsers passed and the package was clean and unchanged.
- Exit `0`, status `NON_ACCEPTANCE`: checks passed against explicitly allowed dirty development bytes.
- Exit `1`, status `FAIL`: a browser assertion, package check, or byte-integrity check failed.
- Exit `2`, status `UNSUPPORTED`: a required browser/control capability could not be exercised. This is not a pass.

The JSON evidence records browser/CDP identity, executable hash, extension ID/path/version, exact build/package/candidate identity, candidate embedding counts for all three runtime bundles, commanded and packaged source SHA, ZIP filename/hash, exact ZIP/extracted inventory binding, synthetic-network ledger, test results, lifecycle/root snapshots, and isolated-world authority snapshots. Evidence output must be outside the tested package and cannot overwrite the ZIP. A browser launch or extension load never counts as a gate pass by itself.

Every message the harness sends directly from the content-script execution world carries the exact packaged `buildId`, `packageVersion`, and `candidateFingerprint` plus the live document token. Popup messages originate from an extension page and remain extension-origin messages; the harness does not mislabel them as content-origin traffic.

## Covered gates

- disabled boot performs observation only;
- concurrent/repeated boot produces one injection, runtime, and root; root inventory is the deduplicated union of the canonical timer selector and every rebuild-owned marker, so a noncanonical rebuild node cannot be hidden;
- the isolated MAIN shell retains `DEGRADED / coordination-not-implemented-b1`; only the worker-owned, generation-bound settlement response may promote effective health to `READY`;
- the isolated content world refreshes authority against the current worker generation and exposes only narrowed settlement evidence independently of MAIN-world lifecycle health;
- exact refresh and post-probe confirmation acknowledgments each bind a unique request, worker generation, Runtime ID, and Document Token;
- OWNER and OBSERVER effective health both reach `READY` only after migration, trusted-core, Bridge-role, listener, and observation prerequisites agree;
- the packaged popup reports final B2 `READY` and retains fail-closed guidance for incomplete or blocked prerequisites;
- two live tabs connect to one worker authority as exactly one `OWNER` and one `OBSERVER_CONNECTED`, observe the same authoritative revision, and require an explicit successful observer-disconnect acknowledgement before the observer tab closes;
- clearly owned noncanonical rebuild-marker orphan recovery and ambiguous noncanonical rebuild-marker retention;
- dead interaction and removed root recover without reinjection;
- iframe and unsupported documents allocate nothing;
- legacy runtime exclusion;
- malformed and unreadable runtime-global exclusion;
- build, package-version, and candidate-fingerprint mismatch reload boundaries;
- an immediate health request after service-worker restart refreshes authority against the new worker before reporting `READY`, reuses the live page runtime, preserves `OWNER`, revision, and coordination epoch, and leaves the persisted authoritative document canonically equivalent by SHA-256;
- real BFCache restoration produces `pageshow.persisted === true` and reuses the runtime;
- clean disable/re-enable creates a fresh Runtime ID;
- the exact read-only `action=7` transport starts one authoritative Timer while the isolated MAIN shell remains intentionally degraded and effective health settles `READY`;
- OWNER and OBSERVER tabs share one redacted read model, with only OWNER performing Bridge verification;
- a synthetic Job A to Job B change closes one ledger segment and commits one authoritative revision;
- disable finalizes non-idle Timer state exactly once and issues no native SquareCoil mutation;
- detected malformed legacy storage blocks Bridge, Timer writes, and final READY without exposing stored values;
- a delayed stale content response cannot overwrite newer disabled state;
- a safely injected cleanup failure remains sticky until explicit cleanup-only retry succeeds.
- compact B3 tabs expose Today, threshold meaning, and operational status from one trusted revision;
- Overview and finalized History navigation do not mutate Timer/Ledger state;
- real A -> B focus reaches OWNER and OBSERVER, while a same-Context heartbeat preserves manual selection/collapse;
- B3 hidden/show and drag-order preferences synchronize across tabs without native or Timer mutations.
- B4 Full Backup JSON, History CSV, and reporting-only Time Report CSV come from one trusted revision and exports contain no live authority state;
- malformed restore inputs and active-state Replace fail closed without mutation;
- Archive and Restore preserve Context totals while passing through the fenced authoritative writer;
- an exact backup merge dedupes existing history and cannot double-count ledger time.
- Settings Home exposes the settled Appearance, Limits, Library, SquareCoil theme, Support, and About destinations;
- Auto/Glass preferences report their real effective presentation, and website themes own at most one removable style layer;
- one revisioned Preferences service synchronizes owner/observer tabs and rejects a stale Timer Limits form before allowing one coherent replacement batch;
- Support diagnostics are opt-in and frozen, expose only coarse allowlisted state, and delivery remains an explicit user action;
- dirty Settings drafts require confirmation, missing Developer Support configuration stays unavailable, and no settings action mutates Timer/Ledger or native SquareCoil state.

Each browser result carries the canonical stable IDs it proves: `B1-LC-001` through `B1-LC-010` and `B1-LC-012` through `B1-LC-018`. `B1-LC-011` is intentionally an A2/A3-only persistence-concurrency fixture. The B2.1 cases carry `B2-KERNEL-001` (multi-tab OWNER/OBSERVER) and `B2-KERNEL-002` (worker-restart reconnection). The B2.2 cases carry `B2-TRANSITION-001` through `B2-TRANSITION-005` for action 7 start, owner/observer synchronization, atomic job switch, exactly-once disable, and legacy fail-closed behavior. Final settlement cases carry `B2-READY-001` through `B2-READY-003` for OWNER plus popup READY, non-writing OBSERVER READY, and migration-blocked degradation.

The B3 cases carry `B3-WORKSPACE-001` through `B3-WORKSPACE-004`. The B4 cases carry `B4-DATA-001` through `B4-DATA-004`. The B5-A cases carry `B5-SETTINGS-001` through `B5-SETTINGS-005`. Passing the suite proves the installed-browser A4 portion of B5-A while preserving every earlier gate. READY-C04 verification-fallback behavior remains covered by mandatory unit/integration fixtures because the installed candidate has `chrome.webRequest`; A4 does not alter the candidate to manufacture an unavailable hook. Final B5-A acceptance requires this A4 pass together with the repository's unit, integration, prototype-compatibility, package, and CI gates.
