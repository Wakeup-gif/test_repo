# B1 lifecycle regression and B2.2 trusted transition-core browser harness

This harness loads one exact unpacked package into installed, branded Google Chrome and Microsoft Edge. It retains the settled B1 lifecycle and B2.1 authority-kernel gates while adding narrowly scoped B2.2 trusted transition-core checks. It serves only synthetic fixture HTML in memory. No request reaches SquareCoil or customer data.

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

- `buildId: "rebuild-b2-trusted-transition-core"`;
- `stage: "B2.2"`;
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
- MAIN lifecycle health remains `DEGRADED / coordination-not-implemented-b1`, never `READY`, while readiness reports the bounded `KERNEL_CONNECTED_B2_1` disposition;
- the isolated content world exposes healthy authority evidence independently of MAIN-world lifecycle health;
- two live tabs connect to one worker authority as exactly one `OWNER` and one `OBSERVER_CONNECTED`, observe the same authoritative revision, and require an explicit successful observer-disconnect acknowledgement before the observer tab closes;
- clearly owned noncanonical rebuild-marker orphan recovery and ambiguous noncanonical rebuild-marker retention;
- dead interaction and removed root recover without reinjection;
- iframe and unsupported documents allocate nothing;
- legacy runtime exclusion;
- malformed and unreadable runtime-global exclusion;
- build, package-version, and candidate-fingerprint mismatch reload boundaries;
- service-worker restart changes the authority worker identity, reconnects the isolated client, reuses the live page runtime, preserves `OWNER`, revision, and coordination epoch, and leaves the persisted authoritative document canonically equivalent by SHA-256;
- real BFCache restoration produces `pageshow.persisted === true` and reuses the runtime;
- clean disable/re-enable creates a fresh Runtime ID;
- the exact read-only `action=7` transport starts one authoritative Timer while lifecycle remains intentionally `DEGRADED`;
- OWNER and OBSERVER tabs share one redacted read model, with only OWNER performing Bridge verification;
- a synthetic Job A to Job B change closes one ledger segment and commits one authoritative revision;
- disable finalizes non-idle Timer state exactly once and issues no native SquareCoil mutation;
- detected legacy storage blocks Bridge and Timer writes without exposing stored values;
- a delayed stale content response cannot overwrite newer disabled state;
- a safely injected cleanup failure remains sticky until explicit cleanup-only retry succeeds.

Each browser result carries the canonical stable IDs it proves: `B1-LC-001` through `B1-LC-010` and `B1-LC-012` through `B1-LC-018`. `B1-LC-011` is intentionally an A2/A3-only persistence-concurrency fixture. The B2.1 cases carry `B2-KERNEL-001` (multi-tab OWNER/OBSERVER) and `B2-KERNEL-002` (worker-restart reconnection). The B2.2 cases carry `B2-TRANSITION-001` through `B2-TRANSITION-005` for action 7 start, owner/observer synchronization, atomic job switch, exactly-once disable, and legacy fail-closed behavior.

Passing these cases proves the fenced B2.1 authority-kernel slice, the partial B2.2 trusted Bridge-to-Timer transition slice, and the continuing B1 lifecycle regression gates. Full B2 acceptance remains **PENDING**: migration execution, the intentionally excluded native action 2 completion hook, broader concurrent Timer writes, and later-stage behavior must still be implemented and proven before B2 can be called settled.
