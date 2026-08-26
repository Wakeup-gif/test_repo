# SquareCoil Companion Rebuild
## Logic Stage L8: Failure Behavior, Acceptance Criteria, and Implementation Handoff

**Status:** Ready for review - implementation handoff not yet green  
**Logic stage:** L8  
**Depends on:** settled L0-L7 behavior contracts  
**Framework authority:** `docs/REBUILD-MASTER-PLAN.md`  
**Purpose:** Tie all settled behavior into one failure-priority model, acceptance system, fixture plan, browser gate, and implementation dependency map so the rebuild can move into staged implementation without inventing safety behavior or mistaking package success for product success.

---

# 1. L8 Scope

L8 owns:

- cross-module failure priority;
- user-visible failure behavior;
- safe degradation rules;
- release-blocking vs non-blocking failure classification;
- acceptance coverage across L0-L7;
- unit/integration/browser test boundaries;
- migration/backup/CSV fixture requirements;
- stale-root/duplicate-runtime regression requirements;
- Chrome-first browser acceptance;
- Edge parity acceptance;
- privacy/security acceptance;
- implementation-stage dependencies;
- implementation handoff readiness;
- repository recovery/source-of-truth completeness gate.

L8 does **not**:

- redesign settled L0-L7 behavior;
- choose the final build/test framework;
- choose the final persistence engine;
- define store-submission policy that should be checked against current browser-store requirements later;
- start implementation code.

> L8 is the contract for proving the rebuilt Companion is safe to implement, safe to test, and safe to advance toward release.

**Settled scope**

---

# 2. System Safety Priority

When two requirements compete during failure handling, use this order:

```text
1. Prevent authoritative data corruption/loss
2. Prevent duplicate or fabricated Companion time
3. Preserve SquareCoil authoritative clock truth
4. Preserve safe recoverability and one-owner lifecycle
5. Preserve core timer operability when evidence allows it
6. Preserve user access to known historical data
7. Preserve normal UI convenience
8. Preserve themes/support/developer-support polish
```

Examples:

- stop accrual rather than knowingly double-record time;
- show stale known totals rather than replace them with false zeroes;
- require reload rather than stack an ambiguous second runtime;
- reject an import rather than silently truncate it;
- fall back from Glass/theme styling rather than disturb timer state.

**Settled**

---

# 3. Failure Severity Classes

Canonical cross-module classes:

```text
F0_DATA_INTEGRITY_RISK
F1_ACCRUAL_TRUTH_RISK
F2_CORE_RUNTIME_FAILURE
F3_FEATURE_OPERATION_FAILURE
F4_PRESENTATION_FAILURE
F5_EXTERNAL_TRANSPORT_FAILURE
```

## 3.1 F0_DATA_INTEGRITY_RISK

Examples:

- persistence transaction cannot commit safely;
- restore/import would create unresolved temporal overlap;
- duplicate-writer/fencing failure could write competing history;
- destructive operation has ambiguous target/protection state;
- data schema/corruption prevents safe interpretation.

Required behavior:

- block unsafe authoritative mutation;
- do not claim success;
- preserve last known committed data;
- enter lifecycle DEGRADED/FAILED when the core store itself is unsafe;
- require reload/manual recovery when ownership/teardown cannot be proven safe.

F0 is release-blocking.

---

## 3.2 F1_ACCRUAL_TRUTH_RISK

Examples:

- SquareCoil Bridge unavailable;
- state unknown/conflicted beyond grace;
- strong unconfirmed clock-out evidence;
- coordination cannot prove one-writer ownership;
- fresh SquareCoil Context contradicts committed ACTIVE identity.

Required behavior:

- never invent a new Context or clock-out;
- use L4 provisional/Safety-Hold rules;
- cap accrual at the latest trustworthy boundary when continuity cannot be proven;
- do not backfill long unknown gaps;
- surface verification-degraded state.

F1 is release-blocking when unresolved in core scenarios.

---

## 3.3 F2_CORE_RUNTIME_FAILURE

Examples:

- visible root but dead interaction controller;
- lifecycle owner missing/duplicated;
- core renderer unavailable;
- required state service unavailable;
- teardown incomplete;
- version/legacy runtime conflict.

Required behavior follows L1:

- bounded recovery only when ownership is safe;
- no duplicate reinjection;
- reload-required for legacy/version/ownership ambiguity;
- historical data is not erased as a recovery technique.

F2 is release-blocking.

---

## 3.4 F3_FEATURE_OPERATION_FAILURE

Examples:

- backup export failed;
- restore validation failed before commit;
- CSV malformed;
- one Settings data route failed;
- Open Job navigation failed;
- clipboard failed.

Required behavior:

- fail that operation locally;
- authoritative data remains unchanged unless an atomic commit explicitly succeeded;
- retain known prior read data where appropriate;
- preserve a Back/Home/Retry path when safe;
- do not automatically downgrade timer lifecycle unless the failure reveals an F0-F2 core fault.

F3 may block the relevant feature acceptance but does not automatically block unrelated timer operation.

---

## 3.5 F4_PRESENTATION_FAILURE

Examples:

- Glass unavailable;
- theme CSS selector fails;
- custom logo missing;
- QR asset missing;
- optional decorative presentation fails.

Required behavior:

- readable/native/Solid fallback;
- no timer/history mutation;
- no second runtime/root;
- feature-level diagnostic only.

F4 does not block core timer release unless it makes core UI unusable or inaccessible.

---

## 3.6 F5_EXTERNAL_TRANSPORT_FAILURE

Examples:

- mailto handler does not open;
- external developer-support link cannot open;
- clipboard unavailable.

Required behavior:

- local fallback such as Copy Message/manual copy;
- never claim delivery/payment completion;
- no timer impact.

F5 does not block timer release unless the specific secondary feature is part of the candidate's required acceptance set and has no usable fallback.

**Settled**

---

# 4. Multiple Simultaneous Failures

When multiple failures coexist:

1. highest safety severity governs authoritative mutation/accrual behavior;
2. lower-severity UI messages must not hide the higher-severity problem;
3. secondary-feature retries must not restart core lifecycle;
4. recovery of a lower-severity feature does not clear an unresolved higher-severity state;
5. a theme/support error must never replace a persistence/ownership warning as the primary core status.

Example:

```text
Bridge unavailable + dark logo missing
```

Result:

- accrual follows F1 Safety-Hold behavior;
- dark logo independently falls back to native;
- logo recovery does not mark Bridge/timer healthy.

**Settled**

---

# 5. User-Visible Error Contract

Core error communication must be:

- plain-language;
- specific about what Companion can/cannot safely do;
- actionable when an action exists;
- clear that SquareCoil native clock is separate when relevant;
- free of raw stack traces/internal exception dumps by default;
- free of unsupported claims such as `your time is lost` unless confirmed.

Canonical action classes:

```text
Retry
Reload Page
Go Back / Home
Copy Diagnostics
Download Backup / Export when safely available
Cancel staged operation
```

Examples of semantic messages:

```text
Companion cannot verify SquareCoil right now. Recorded time is temporarily held at the last verified point.

Companion could not save this change safely. The previous committed data is still in use.

This SquareCoil page has an older Companion runtime. Reload the page to use the current extension.

This backup could not be restored. Your current Companion data was not changed.
```

Final microcopy may be refined without changing these semantics.

**Settled**

---

# 6. Safe Degradation Matrix

| Fault | Core timer behavior | Historical reads | Mutation behavior | Required user signal |
|---|---|---|---|---|
| Bridge DOM path fails, server works | continue with SERVER_FALLBACK evidence | available | normal if safe | optional degraded Bridge status |
| Bridge server path fails, audited DOM works | continue with DOM_FALLBACK evidence | available | normal if safe | optional degraded Bridge status |
| Bridge fully unavailable | grace then Safety Hold | available | no evidence-dependent start/resume | verification warning |
| coordination ownership unsafe | stop authoritative accrual writes | available | block timer mutation | ownership/core warning |
| persistence unavailable | no fake durable success; safety behavior | last committed reads when possible | block unsafe writes | persistence warning |
| core UI root missing but owner healthy | recover owned UI only | state remains owned | normal only through surviving core service | recovering status |
| root visible but interaction dead | not READY; recover/fail | state depends on core health | no blind reinjection | core interaction warning |
| theme/Glass/logo failure | unchanged | unchanged | unchanged | local fallback only |
| backup/CSV parse failure | unchanged | unchanged | no commit | local operation error |
| mailto/clipboard failure | unchanged | unchanged | unchanged | copy/manual fallback |

**Settled**

---

# 7. Authoritative Success Rule

An operation that changes authoritative timer/history/workspace data may be reported as successful only after its logical transaction has committed.

Therefore:

```text
button click != success
request started != success
validation passed != restore success
mailto opened != ticket sent
file serialization started != backup completed
```

For staged L6 operations, success occurs only after the committed result is known.

For native SquareCoil clock behavior, Companion reports only its observed/confirmed interpretation and does not claim control of the company clock.

**Settled**

---

# 8. Acceptance Layer Model

The rebuilt Companion requires four acceptance layers:

```text
A1 Static / Package
A2 Unit
A3 Integration
A4 Browser Smoke / Behavioral Acceptance
```

Passing an earlier layer cannot substitute for a later layer.

In particular:

> A valid ZIP and parsing JavaScript do not prove that Settings clicks, timer transitions, recovery, or browser interactions work.

**Settled**

---

# 9. A1 Static / Package Gate

Required checks include:

- manifest valid;
- all required packaged files present;
- JavaScript/build parses;
- no unexpected remote runtime code loading;
- one canonical package version propagated consistently;
- Chrome artifact builds;
- Edge artifact builds from the shared source/adapters;
- required approved assets referenced safely;
- no missing mandatory configuration values for the candidate channel;
- source maps/debug artifacts handled according to release policy;
- package contains no test fixture/customer/private data accidentally.

A1 does not certify runtime behavior.

**Settled**

---

# 10. A2 Unit Acceptance

Unit coverage is required for deterministic logic that does not require a live browser page.

Minimum domains:

## Lifecycle/state

- lifecycle transition guards;
- teardown idempotency;
- READY assertions;
- Timer State exclusivity;
- fencing/stale command rejection;
- Safety Hold calculations.

## Time Ledger

- Today/Week/Context Total;
- midnight splitting;
- DST elapsed duration;
- provisional/current contribution;
- legacy-unattributed balances;
- duplicate identity/fingerprint;
- no double-count after finalization.

## Migration

- v0.7 accumulated/session reconciliation;
- duration/timestamp precedence;
- active/pending/local-pause migration safety;
- migration idempotency.

## Bridge parser

- Job Context parsing;
- Production General;
- audited General Context rules;
- empty `data-time` behavior;
- stale request generation;
- candidate expiry/correlation;
- certainty mapping.

## Timer behavior

- new vs remembered Context;
- Pending continuity;
- Resume/Start Fresh;
- Local Pause/Resume;
- switch/leave/clock-out boundaries;
- unknown grace/hold;
- controlled reload vs crash recovery.

## Views

- Selected vs Operational presentation model;
- provisional propagation;
- visible-tab soft cap/overflow;
- logical History reconstruction;
- deterministic ordering.

## Data safety

- backup validation;
- Restore Merge/Replace plans;
- temporal overlap conflicts;
- Context identity conflicts;
- legacy balance lineage;
- CSV dedupe/security escaping.

## Settings/support

- preference validation/revision handling;
- Auto/effective appearance resolution;
- threshold validation;
- diagnostic whitelist/frozen snapshot;
- deterministic mail composition;
- external-link configuration validation.

**Settled**

---

# 11. A3 Integration Acceptance

Integration tests prove module boundaries rather than isolated functions.

Required flows include:

```text
L3 Bridge event -> L4 Timer transition -> L2 transaction -> L5 read model
```

```text
user Pause/Resume command -> cross-tab writer -> Ledger -> synchronized views
```

```text
v0.7 data -> migration -> Ledger/Context Index -> Today/Job Total/History
```

```text
backup/CSV file -> staging -> conflict analysis -> atomic store -> read-model refresh
```

```text
preference change -> durable preference revision -> renderer/theme service -> second live tab
```

```text
lifecycle teardown/recovery -> exactly one runtime/Bridge/listener set
```

```text
Support draft -> frozen diagnostics -> composed mailto/copy output
```

Integration acceptance must verify both positive outcomes and rejected/stale/failure paths.

**Settled**

---

# 12. A4 Browser Smoke / Behavioral Acceptance

A4 must run the actual packaged extension in a Chromium browser environment.

Required browser smoke categories:

## Runtime/lifecycle

- extension loads on supported SquareCoil page/fixture;
- exactly one current runtime/root;
- Settings gear opens and responds;
- collapse/expand works;
- repeated boot request does not duplicate listeners/root;
- stale orphan root recovers;
- visible-but-dead root fails readiness and recovers/fails safely;
- extension/service-worker restart does not duplicate runtime;
- page reload/recovery follows L1/L4 rules;
- build mismatch/legacy runtime requires reload rather than mixed injection.

## Timer

- zero-history Context auto-start fixture;
- remembered Context Pending;
- Resume / Start Fresh;
- Local Pause/Resume;
- direct A->B switch;
- same-project department change no reset;
- full clock-out;
- leave-project distinction;
- unknown/conflict hold behavior;
- Selected inactive Context does not impersonate Active.

## Library/views

- Recent Jobs;
- Time Overview;
- History;
- Context Detail;
- Archives & Backup navigation;
- tab soft-cap/overflow;
- Current Context indication when viewing another job;
- provisional/hold presentation.

## Data safety

- Archive/restore preserves time;
- Clear Recent preserves history;
- protected destructive controls unavailable;
- Full Backup downloads/serializes completely;
- malformed restore causes no mutation;
- duplicate import causes no doubled hours;
- Replace requires idle/destructive confirmation path.

## Settings

- Home/Back/Close;
- Light/Dark/Auto;
- Solid/Glass fallback;
- Original/Refined Light/Sleek Dark;
- native logo fallback;
- threshold validation;
- Support ticket/feedback;
- frozen diagnostics preview/copy;
- Developer Support route/missing-config fallback.

A4 is mandatory before a Stable release candidate.

**Settled**

---

# 13. Live SquareCoil Safety During Browser Testing

Automated acceptance must not mutate a real production user's SquareCoil company clock merely to prove Companion behavior.

Preferred order:

```text
1. deterministic SquareCoil fixture/test page
2. controlled test account/environment if available
3. authenticated live-site observational smoke
4. user-initiated native clock transitions only when intentionally testing real workflow
```

Live-site automation must not blindly call action 2/3/4 against a production account.

When a real native clock transition is tested, SquareCoil remains the actor/authority and the test verifies Companion observation/reaction.

**Settled**

---

# 14. Required SquareCoil Bridge Fixtures

Fixture set must cover at least:

- numbered Job Context action-7/header HTML;
- Production General with `project.php?id=0`;
- Production General with empty-looking `data-time`;
- clocked-out native controls;
- no-trackable-context controls;
- same-project changed department/label;
- action-3 A->B;
- separate action-4 leave then action-3 enter;
- successful action-2 + confirming post-state;
- successful action-2 + temporarily unavailable post-state;
- stale action-7 response after newer transition;
- server/DOM conflict;
- malformed action-7 response;
- server unavailable / DOM valid;
- DOM unavailable / server valid;
- unaudited General label;
- Bridge teardown/reinitialize.

Fixtures must be synthetic/redacted and contain no real customer/private data.

**Settled**

---

# 15. Required Migration Fixtures

At minimum:

```text
MIG-01 clean v0.7 context with complete sessions
MIG-02 accumulated total > surviving session detail
MIG-03 surviving sessions > legacy accumulated total
MIG-04 duplicate legacy sessions
MIG-05 same Context in Recent + Archive
MIG-06 legacy active record
MIG-07 legacy pending record
MIG-08 legacy Local Pause record
MIG-09 duration-only row
MIG-10 timestamp/duration mismatch
MIG-11 cross-midnight session
MIG-12 malformed/partially unreadable legacy source
MIG-13 successful migration run twice
```

Expected outcomes must assert:

- no duplicate hours;
- no fabricated dates;
- legacy-unattributed balance correctness;
- no file-derived live Active state;
- idempotency.

**Settled**

---

# 16. Required Backup / Restore Fixtures

At minimum:

```text
BKP-01 valid current backup
BKP-02 valid older supported backup
BKP-03 unsupported future schema
BKP-04 truncated/record-count mismatch
BKP-05 malformed types/IDs/timestamps
BKP-06 duplicate stable Segments
BKP-07 Segment ID conflict
BKP-08 cross-Context temporal overlap
BKP-09 same-Context material overlap
BKP-10 hard Context identity conflict
BKP-11 duplicate legacy balance lineage
BKP-12 ambiguous legacy balance lineage
BKP-13 non-live Recovery Evidence
BKP-14 Recovery Evidence duplicate of finalized session
BKP-15 workspace import tries to hide/archive current protected Context
BKP-16 Replace with alternate valid Workday Time Zone
BKP-17 spreadsheet-dangerous labels/provenance
BKP-18 oversized input safety path
```

Each fixture must prove current data remains unchanged on validation/conflict failure.

**Settled**

---

# 17. Required History CSV Fixtures

At minimum:

```text
CSV-01 canonical SEGMENT rows
CSV-02 canonical LEGACY_BALANCE row
CSV-03 v0.7 squarecoil-job-timer-csv-v1
CSV-04 same file imported twice
CSV-05 duplicate IDs with same fields
CSV-06 conflicting same ID
CSV-07 temporal overlap
CSV-08 ambiguous zone-less current-schema timestamp
CSV-09 canonical duration/timestamp mismatch
CSV-10 malformed row
CSV-11 reviewed partial subset
CSV-12 formula-triggering label = + - @
CSV-13 large file processing limit
```

No fixture may rely on rounded decimal hours when canonical duration/timestamp fields exist.

**Settled**

---

# 18. Regression Suite: Historical v0.7.x Failure Classes

The rebuild must explicitly prevent regression of the known architecture failures:

```text
REG-01 visible root with no live interaction handler is not READY
REG-02 root existence alone never suppresses required runtime boot/recovery
REG-03 repeated boot does not inject a second runtime
REG-04 legacy v0.7 runtime and rebuilt runtime never coexist after detection
REG-05 module/feature scripts do not patch Settings independently
REG-06 only one Timer State writer exists
REG-07 timer UI recovery does not recreate healthy Bridge/state resources
REG-08 timer settings observers do not become document-wide patch chains
REG-09 package CI success is not treated as browser-interaction success
REG-10 browser background/service-worker restart does not duplicate listeners/runtime
REG-11 same-context heartbeat does not reopen manually collapsed timer
REG-12 active/pending/paused Context cannot disappear through ordinary housekeeping
REG-13 historical array/count limits never silently prune authoritative time
```

These are mandatory regression gates.

**Settled**

---

# 19. Cross-Tab / Concurrency Acceptance

Required scenarios:

- one OWNER + one OBSERVER can both reach READY;
- only current fenced writer commits authoritative timer changes;
- stale owner wakes and cannot write with old token;
- owner disappears and exactly one safe takeover occurs;
- observer Pause command retains valid originating timestamp only when expected state still matches;
- stale Resume/Start Fresh rejected after state moves;
- one tab selection remains independent from another;
- durable theme/tab-order preference propagates without propagating transient route/Support draft;
- shared Safety Hold caps every tab at one boundary;
- L6 Data Mutation Lock prevents concurrent restore/delete/import commits.

Any test that demonstrates two successful competing authoritative writers is a release blocker.

**Settled**

---

# 20. Privacy / Security Acceptance

Required checks:

- diagnostics default off;
- diagnostic preview equals diagnostic content actually copied/composed;
- no job ID/customer/history/private URL data in automatic diagnostics;
- Support draft not stored in backup/preferences/activity;
- no hidden Support network submission;
- developer-support links add no Companion tracking/job data;
- no donation completion tracking;
- CSV formula-triggering text is exported spreadsheet-safe;
- imports/backups are parsed as data, never evaluated executable content;
- packages contain no credentials/tokens/private fixtures;
- restored external data cannot assert live clock state.

Privacy failure involving automatic leakage of job/customer/private SquareCoil data is release-blocking.

**Settled**

---

# 21. Accessibility / Interaction Acceptance

At behavior level, required checks include:

- Settings controls keyboard reachable;
- focus returns safely on close;
- hidden controls are not focusable;
- keyboard event cannot leak into underlying Pause/Delete controls;
- destructive confirmation has reachable Cancel and cannot auto-confirm from opening keystroke;
- status is not communicated by color alone;
- provisional/Hold/Pending/Local Pause are semantically distinguishable;
- high-contrast/forced-colors mode remains readable and may override decorative theme/Glass effects;
- website theme never hides or disables a native SquareCoil business control merely for styling.

A presentation theme that makes core controls unreadable/inoperable is not treated as a harmless F4 failure for acceptance; it fails the relevant browser gate.

**Settled**

---

# 22. Performance / Resource Acceptance

Behavioral stability requirements:

- one runtime root;
- one lifecycle owner;
- one active Bridge listener/observer set per runtime;
- no duplicate heartbeat interval after reinit/recovery;
- no Settings MutationObserver patch chain;
- SquareCoil DOM observer is targeted/coalesced;
- repeated same-context verification does not create unbounded durable writes;
- large-history views use incremental retrieval;
- large-history retrieval does not change aggregate totals;
- optional Glass does not require nested blur on every component;
- teardown invalidates late callbacks/responses.

Exact memory/CPU thresholds are implementation/performance-test policy, but observable resource duplication is release-blocking.

**Settled**

---

# 23. Chrome-First Candidate Gate

Chrome is the first rebuilt acceptance/upload candidate.

A Chrome candidate may be created only when:

```text
A1 package gate = pass
A2 required logic/unit suites = pass
A3 required integration suites = pass
A4 Chrome browser smoke = pass
all P0/F0 data-integrity scenarios = pass
all core F1/F2 timer/lifecycle scenarios = pass
migration fixtures = pass
backup/CSV safety fixtures = pass
privacy acceptance = pass
stale-root/duplicate-runtime regressions = pass
```

A failed required gate blocks Stable advancement.

A candidate may still be labeled development/Beta while known noncritical F4/F5 polish issues remain, but those issues must be documented and must not violate accessibility/privacy/core acceptance.

**Settled**

---

# 24. Edge Parity Gate

Edge uses the same shared application source and the same behavioral contracts.

Edge Stable is not certified merely because Chrome passed.

Required Edge parity checks:

- lifecycle boot/reload/service-worker behavior;
- one root/runtime;
- Settings interaction;
- timer transitions;
- storage/migration/backup;
- Light/Dark/Auto;
- Solid/Glass fallback;
- Website Theme behavior;
- mailto/clipboard/external navigation fallback;
- package/manifest adapter differences;
- the same critical acceptance/regression cases where browser behavior could differ.

A browser adapter may normalize platform APIs/errors. It may not change timer/time/history semantics.

If Edge requires a browser-specific workaround, add a parity regression before Stable.

**Settled**

---

# 25. Release-Blocking Defect Policy

Stable is blocked by any known defect that can:

- lose/delete authoritative time without explicit user intent;
- double-record time;
- fabricate missed/unverified time;
- clock/claim native SquareCoil state without evidence;
- run two authoritative writers/runtimes;
- restore/import unsafe overlapping/duplicate history;
- bypass destructive confirmation/protection;
- restore fake live state from file;
- leave Settings/timer core visibly present but noninteractive without safe recovery;
- automatically leak private job/customer/SquareCoil data;
- make core controls unusable under a supported required presentation mode;
- falsely report destructive/import/backup success when commit/completeness failed.

A cosmetic mismatch that preserves usability, safety, and semantics may be non-blocking for Beta and evaluated separately for Stable polish.

**Settled**

---

# 26. Acceptance Evidence

Required test evidence should make failures diagnosable without exposing private user data.

Useful evidence includes:

- test/fixture ID;
- build/version;
- browser/version;
- pass/fail;
- normalized lifecycle/timer state;
- expected vs actual synthetic Context IDs;
- revision/owner token metadata in test environment;
- normalized error code;
- screenshots/video of synthetic/browser fixture when useful;
- sanitized console output.

Do not use real customer/project history as a test fixture merely because it is convenient.

**Settled**

---

# 27. Implementation Stage Dependencies

The staged build remains:

## B1 - Shell / Lifecycle

Depends on settled L0-L1.

May implement:

- source scaffold/build tooling;
- extension shell;
- lifecycle coordinator;
- one runtime/root ownership;
- teardown/recovery skeleton;
- package/static checks;
- lifecycle browser fixture tests.

Must not invent later Timer behavior.

---

## B2 - State / Ledger / Bridge / Core Timer

Depends on settled L2-L4.

May implement:

- persistence abstraction;
- Shared Timer State;
- Time Ledger/query service;
- coordination/fencing;
- migration;
- Recovery Checkpoint;
- SquareCoil Bridge;
- core Timer service;
- core timer read model/actions.

B2 must be green before higher features rely on its time semantics.

---

## B3 - Time Views / Workspace

Depends on settled L5 and green B2 contracts.

May implement:

- main timer information hierarchy;
- Recent;
- Time Overview;
- History;
- Context Detail;
- Job Navigation;
- tabs/overflow/order.

---

## B4 - Data Safety / Files

Depends on settled L6 and green authoritative storage contracts.

May implement:

- Archive/Clear/Delete;
- Full Backup;
- Restore Merge/Replace;
- History CSV;
- Time Report CSV;
- conflict staging;
- data mutation lock.

No file import may bypass the authoritative L2 transaction layer.

---

## B5 - Settings / Themes / Support

Depends on settled L7 and stable feature interfaces from B2-B4.

May implement:

- Settings router;
- appearance/finish;
- Website Themes;
- Timer Limits editor;
- Support/Feedback;
- diagnostics;
- Developer Support.

---

## B6 - Full Acceptance / Candidate Packaging

Depends on settled L8 and green B1-B5 required gates.

May perform:

- full regression suite;
- Chrome packaged browser acceptance;
- migration/backup/CSV fixture matrix;
- privacy/accessibility checks;
- release metadata/artifacts;
- first Chrome candidate;
- subsequent Edge parity candidate.

**Settled implementation dependency map**

---

# 28. Stage Completion Rule

A build stage is not complete merely because code exists.

Stage completion requires:

```text
implementation matches the applicable settled logic
required tests for that stage pass
no unresolved release-blocking defect exists in that stage's scope
documentation/diagnostics are sufficient for the next stage
```

If implementation discovers a real contradiction in settled logic:

1. stop inventing a local workaround;
2. document the contradiction;
3. return to the owning Logic/Framework stage;
4. amend the canonical logic contract deliberately;
5. add a regression test for the contradiction.

**Settled**

---

# 29. Source-of-Truth / Recovery Gate

GitHub is the implementation handoff source of truth.

Before Logic can be declared fully handed off, the planning branch must contain:

```text
REBUILD-START-HERE.md
REBUILD-MASTER-PLAN.md
LOGIC-STAGE-PLAN.md
logic/L0-INVARIANTS.md
logic/L1-LIFECYCLE.md
logic/L2-STATE-TIME-MIGRATION.md
logic/L3-SQUARECOIL-BRIDGE.md
logic/L4-TIMER-BEHAVIOR.md
logic/L5-TIME-VIEWS-WORKSPACE.md
logic/L6-DATA-SAFETY-BACKUP.md
logic/L7-SETTINGS-SUPPORT-THEMES.md
logic/L8-ACCEPTANCE-HANDOFF.md
```

Each settled file should state its settled/readiness status.

`REBUILD-START-HERE.md` should identify:

- production baseline;
- planning branch;
- current logic completion state;
- implementation next action;
- do-not-touch production rule until staged implementation is ready;
- recovery prompt/read order.

## Current repository audit at L8 draft time

The planning branch `logic/` directory currently exposes L3-L7, but L0-L2 are not present there.

Therefore:

```text
Logic behavior = settled through L7
Git recovery completeness = NOT YET GREEN
```

This must be corrected before final L8 handoff status becomes `Settled - ready for implementation`.

Missing developer-support payment configuration and future light-logo asset do **not** block logic handoff because L7 defines safe unavailable/native fallback behavior.

**Settled handoff gate; current gate result = blocked on repository completeness**

---

# 30. Implementation Handoff Package

When L8 is finally accepted, the implementation handoff should consist of:

1. Master Plan;
2. L0-L8 settled logic files;
3. Start Here recovery/index file;
4. fixture inventory/IDs from L8;
5. staged build dependency map B1-B6;
6. current production baseline reference;
7. known nonblocking configuration inputs still needed;
8. explicit statement that `main` remains production until staged rebuild acceptance permits promotion.

No implementation agent should need the original chat transcript to recover core product behavior.

**Settled target**

---

# 31. Nonblocking Configuration Inputs

These may remain unresolved during implementation scaffold/core work because safe fallback behavior already exists:

```text
Buy Me a Coffee URL
Cash App cashtag/name
Cash App QR packaged asset
approved future light custom logo
exact visual microcopy/polish
exact optional Activity retention count/age
exact processing-size limits after profiling
exact test/build framework choice
exact persistence technology behind the settled storage contract
```

They become release blockers only if a release claims the corresponding configured feature without a valid fallback/disabled state.

**Settled**

---

# 32. Logic Acceptance Summary

L0-L7 collectively settle:

- vocabulary/invariants;
- lifecycle;
- state/ledger/migration;
- SquareCoil interpretation;
- Timer behavior;
- time/workspace views;
- archive/backup/CSV data safety;
- Settings/themes/support/developer support.

L8 settles:

- how those contracts fail safely;
- how they are tested;
- what blocks a release;
- what fixtures prove migration/data safety;
- Chrome/Edge acceptance;
- how implementation is staged;
- what must exist in Git for recovery.

No new Timer State, time calculation, archive semantic, or theme/support ownership model is introduced by L8.

**Settled conceptual summary**

---

# 33. L8 Acceptance Scenarios

## H1 Bridge outage while Active

Bridge becomes unavailable during ACTIVE A -> short grace then shared Safety Hold at trustworthy boundary; historical reads remain available; theme/support remain independent.

## H2 Persistence failure during switch

A->B authoritative transaction cannot commit -> operation not presented as success; no alternate storage path; core persistence warning dominates presentation issues.

## H3 Theme failure plus healthy timer

Sleek Dark CSS/logo fails -> native/readable fallback; ACTIVE timing continues unchanged.

## H4 Support mail failure plus healthy timer

mailto unavailable -> Copy Message/Email fallback; no Timer State/lifecycle change.

## H5 Restore malformed backup

Validation fails -> zero authoritative mutation; current timer/history unchanged.

## H6 Restore overlap

Incoming B interval overlaps A historical interval -> conflict; no guessed trim/sum; current dataset unchanged until explicit safe resolution.

## H7 Visible dead root regression

Root exists but interaction readiness fails -> not READY; safe recovery or reload-required result; never accepted because root exists.

## H8 Service-worker restart

Worker memory resets while page runtime is healthy -> existing runtime probed/reused, no duplicate root/listeners.

## H9 Stale owner wakes

Old cross-tab writer wakes after ownership moved -> stale token write rejected; no duplicate hours.

## H10 Provisional correction

Short unknown interval displays provisional time; later conservative reconciliation reduces live displayed total -> all affected views update consistently and finalized History is unchanged.

## H11 Backup active session

Full Backup includes finalized snapshot + safe non-live Recovery Evidence where available; restore never creates ACTIVE state.

## H12 Duplicate CSV

Same canonical/v0.7-compatible file imported twice -> second import adds zero duplicate time.

## H13 Privacy diagnostics

Support diagnostics on real-like synthetic project fixture contain coarse page/lifecycle data but no project ID/name/history/URL identifiers.

## H14 Website theme native-control safety

Theme applies but a new/unknown native control appears -> control remains usable/visible; theme does not broadly hide/modify its business semantics.

## H15 Chrome core browser gate

Packaged Chrome candidate passes lifecycle/timer/views/data/settings critical smoke before Stable candidate can advance.

## H16 Edge parity difference

Edge exposes a browser-specific API quirk -> adapter fix added with parity regression; Timer semantics remain identical.

## H17 Package CI only

Artifact builds and parses but Settings click smoke fails -> candidate is rejected; A1 cannot substitute for A4.

## H18 Implementation contradiction

Builder discovers settled rules cannot both be implemented -> implementation stops local invention, raises contradiction, canonical logic is amended, regression added.

## H19 Repository recovery

A new implementation session reads Start Here + Master Plan + L0-L8 from Git and can recover staged implementation direction without chat history.

## H20 Missing optional developer config

No Buy Me a Coffee/Cash App config -> developer-support methods degrade/disable as L7 defines; core logic implementation and timer acceptance continue.

---

# 34. Continuity States After L8 Draft

## Settled in this draft

- safety priority order;
- failure severity classes and precedence;
- user-visible error semantics;
- safe degradation matrix;
- authoritative success rule;
- four-layer acceptance model;
- static/unit/integration/browser test boundaries;
- live SquareCoil testing safety;
- required Bridge/migration/backup/CSV fixtures;
- v0.7 regression suite;
- cross-tab/privacy/accessibility/performance acceptance;
- Chrome-first gate;
- Edge parity gate;
- release-blocking defect policy;
- implementation stages B1-B6;
- contradiction escalation rule;
- repository source-of-truth completeness gate;
- final handoff package target.

## Provisional / implementation choices

- exact unit/browser test framework;
- exact CI job names;
- exact performance numeric thresholds;
- exact storage implementation;
- exact artifact naming/version automation;
- exact store-submission steps at release time;
- exact synthetic SquareCoil fixture implementation technology.

## Current blocker before final L8 freeze

- L0-L2 settled logic artifacts must be persisted into the planning branch `logic/` directory and verified.
- `REBUILD-START-HERE.md` must be updated after final logic acceptance to point to L0-L8 and the implementation next action.

## Not blockers

- Buy Me a Coffee URL;
- Cash App cashtag/QR;
- approved light custom logo;
- final visual polish/microcopy.

---

# 35. L8 Readiness Judgment

**Status: Ready for review - implementation handoff not yet green**

The failure/acceptance/implementation contract is now defined strongly enough for review. The behavioral logic chain is settled through L7, but final Logic handoff cannot be declared complete until the Git recovery package contains L0-L8 and Start Here is updated accordingly.

After L8 review/hardening and repository-completeness repair, the intended final status is:

```text
Framework + Logic = Settled - ready for staged implementation
```

The next action after final acceptance is **not** an immediate full rewrite. It is staged implementation beginning at the appropriate Build Stage, with Chrome-first acceptance and `main` left untouched until the staged rebuild is ready.