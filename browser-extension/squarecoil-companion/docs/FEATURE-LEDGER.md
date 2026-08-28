# SquareCoil Companion Current Feature Ledger

Updated: 2026-08-28
Branch: `codex/squarecoil-b2c-migration`

This is the execution ledger. Planning history remains in `docs/FEATURE-MINE-RECONCILIATION.md`.

| Feature | Stage | Source/evidence | Class/default | Permissions | Read/write classification | Status, tests, blockers |
|---|---|---|---|---|---|---|
| Lifecycle and one-root shell | B1 | lifecycle/controller + B1 evidence | Core/on | SquareCoil host, storage | lifecycle only | Accepted; inherited B1 gates green |
| OWNER/OBSERVER authority and fenced Timer/Ledger | B2.1 | authority kernel/store/protocol | Core/on | storage | sole authoritative local writer | Accepted; inherited B2 kernel gates green |
| Read-only Bridge and native action observation | B2.2/B2-C | Bridge service/engine, webRequest observer | Core/on | SquareCoil host, webRequest | observation/read-only transport; OWNER routes verified Timer command | Accepted; no direct native mutation path |
| Migration and final READY settlement | B2-C | migration + settlement evidence | Core/on | storage | fenced migration write; fail-closed health read | Accepted; blocked/incomplete states remain non-READY |
| Canonical workspace and time views | B3 | `src/timer/read-model.js`, `src/ui/*`, B3 evidence | Core/on | storage | read/navigation plus presentation preferences | Accepted at `e3b369e`; 31 stable B3 fixtures, Chrome/Edge PASS, CI success |
| Archive/Delete/Wipe | B4 | `src/data/data-safety*.js`, B4 evidence | Core/on | storage; in-page file/download APIs | fenced staged local data commands | Accepted at `e5b6bb6`; exact confirmations, protected-state and quiescence gates pass |
| Full Backup JSON and restore | B4 | `src/data/data-safety.js`, B4 evidence | Core/on | storage; in-page file/download APIs | staged export/import; never restores live state | Accepted; schema/count validation, merge/replace conflicts, lineage and overlap gates pass |
| History CSV and Time Report CSV | B4 | `src/data/data-safety.js`, B4 evidence | Core/on | in-page file/download APIs | History import/export; Time Report read-only | Accepted; v0.7 adapter, formula safety, size bounds, Chrome/Edge A4 pass |
| Core Settings and support | B5-A | `src/preferences/*`, `src/support/*`, Settings UI, B5-A evidence | Core/on | storage; external navigation only when explicit | fenced preferences/navigation | Accepted at `117b816`; 36 stable B5-A fixtures, Chrome/Edge PASS, CI success |
| Original / Refined Light / Sleek Dark | B5-A | `src/presentation/theme-service.js`, L7, B5-A evidence | Core; settled first-install defaults | storage | presentation-only | Accepted; preference/effective split, accessibility and logo fallbacks, idempotent teardown pass |
| Cinematic/Bing presentation pack | B5-B | `src/presentation/cinematic-background.js`, `src/extension/wallpaper-provider.js`, inventory, B5-B evidence | Optional/off | optional exact `https://www.bing.com/*` host access | presentation/network read only | Accepted at `fff1568`; 20 CINE unit fixtures, installed Chrome/Edge fallback/teardown PASS, CI success |
| Design Dashboard presentation profile | B5-B | `src/presentation/dashboard-profile.js`, inventory, B5-B evidence | Optional/off | existing exact SquareCoil route only | presentation-only | Accepted at `fff1568`; 15 DASH unit fixtures, exact/wrong-route Chrome/Edge PASS, native business state preserved |
| File-path/reference navigation utilities | future optional | userscript inventory | Optional/off | least-privilege route access | read/navigation only | Inventory pending B5-B; no business mutation allowed |
| Watched Jobs/notifications | future separately gated | site-audit roadmap | Optional/off | alarms/notifications/allowlisted reads only if proven | read-only polling + local notification | Excluded from current stages unless separately contracted |
| Adobe Acrobat tools | external integration | userscript inventory | Separate/off | separate Acrobat hosts | outside core Companion | Excluded from core; separate future contract |
| Old Job Timer userscript runtime | superseded | historical Timer lineage | Excluded/off | none | unsafe duplicate timer authority | Never integrate or run |

Every accepted B5-B optional feature has a stable ID/version, category, route list, permissions, dependencies/conflicts, storage/migration, activation/deactivation/teardown/recovery, health, privacy/retention, automated coverage, and installed-browser evidence. See `docs/TAMPERMONKEY-FEATURE-INVENTORY.md` and `implementation/B5B-OPTIONAL-PRESENTATION-EVIDENCE.md`.
