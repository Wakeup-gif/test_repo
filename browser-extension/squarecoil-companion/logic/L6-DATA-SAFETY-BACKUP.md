# SquareCoil Companion Rebuild
## Logic Stage L6: Archive, Housekeeping, Backup, Restore, and CSV

**Status:** Ready for review  
**Logic stage:** L6  
**Depends on:** L0 invariants, L1 lifecycle, L2 state/time/migration, L3 SquareCoil Bridge, L4 core timer behavior, L5 time views/workspace  
**Framework authority:** `docs/REBUILD-MASTER-PLAN.md`  
**Purpose:** Define all data-moving, data-cleaning, import/export, archive, and destructive behavior so ordinary workspace actions cannot silently destroy authoritative Companion-recorded time and external files cannot create unsafe live state.

---

# 1. Scope and Ownership

L6 owns behavior for:

- Archive one Context;
- Archive eligible Recent Contexts in bulk;
- restore from Archive;
- Clear Recent;
- Delete Job Data;
- Delete Archived Job Data;
- Delete All Archived Data;
- Wipe All Time History;
- Activity Log retention/clear behavior;
- Full Backup JSON;
- Full Backup validation;
- Restore Merge;
- Restore Replace;
- restore conflict handling;
- safe post-restore state;
- History CSV export/import;
- legacy v0.7 CSV compatibility;
- malformed/duplicate CSV behavior;
- Time Report CSV;
- external-file safety;
- data-mutation locking;
- large-file failure behavior;
- spreadsheet formula-injection safety.

L6 does **not**:

- redefine Timer State or time calculations;
- restore a live SquareCoil/Companion clock from file contents;
- define theme/support settings;
- define final destructive-dialog visual styling;
- choose a storage engine.

> Workspace cleanup, disaster recovery, portable history, and reporting are different jobs. L6 keeps them different.

**Settled scope**

---

# 2. Data Safety Classes

L6 separates operations into four classes:

```text
WORKSPACE_ONLY
HISTORY_PRESERVING_MOVE
EXTERNAL_DATA_MERGE
DESTRUCTIVE_DATA_MUTATION
```

Examples:

```text
Hide / Clear Recent       = WORKSPACE_ONLY
Archive / Restore Archive = HISTORY_PRESERVING_MOVE
Restore Merge / CSV Import = EXTERNAL_DATA_MERGE
Delete / Wipe / Replace   = DESTRUCTIVE_DATA_MUTATION
```

The UI and state service must not present these classes as equivalent.

**Settled**

---

# 3. Data Mutation Lock

Any L6 operation that changes authoritative historical data uses one **Data Mutation Lock** coordinated with the L2 state writer.

While held:

- a second import/restore/delete/wipe operation cannot commit concurrently;
- read-only views may remain available from the last committed revision;
- timer operations continue only when the requested mutation is explicitly safe with the current operational state;
- the mutation validates expected revision before commit;
- commit is atomic at the logical state-service level.

If revision changes in a way that invalidates the staged operation before commit:

```text
operation = STALE
commit = rejected
```

The operation must re-stage against the new state or ask the user to retry.

**Settled**

---

# 4. Operational-State Compatibility

Not every data operation requires the timer to be idle.

## 4.1 Allowed while another Context is ACTIVE

May be allowed when the target data does not touch a protected Context and the mutation can commit atomically:

- Archive an unrelated eligible inactive Context;
- Clear eligible Recent Contexts;
- Delete unrelated inactive Context data after explicit confirmation;
- Restore Merge / History CSV Import when staged records do not alter Shared Timer State and conflicts with the active session are rejected;
- read-only exports.

## 4.2 Requires no live operational Timer State

The initial rebuilt release requires:

```text
IDLE
no Safety Hold
no unresolved recovery mutation
```

for:

- Full Backup Restore Replace;
- Wipe All Time History;
- Delete All Archived Data when any archived target unexpectedly becomes protected during staging.

This avoids global destructive replacement racing a live current session.

## 4.3 Files never restore Timer State

Merge, Replace, and CSV Import never directly set:

```text
ACTIVE
PENDING
LOCAL_PAUSED
Safety Hold
accrual owner lease
live Bridge state
```

Current SquareCoil observation after the operation decides live behavior through L3/L4.

**Settled**

---

# 5. Archive Meaning

Archive is a history-preserving workspace state.

Archiving a Context:

- preserves Context identity;
- preserves every Time Ledger Segment;
- preserves `legacyUnattributedMs`;
- preserves Job/Context Total;
- preserves historical daily allocation;
- removes the Context from normal Recent/visible workspace membership;
- records archive membership/time metadata;
- does not change SquareCoil.

Archive is not Delete.

**Settled**

---

# 6. Archive One Context

Archive is allowed only when the Context is not protected by L4.

Transaction:

1. validate target Context and expected workspace revision;
2. verify target is not ACTIVE/PENDING/LOCAL_PAUSED/current-observed/unresolved-transition protected;
3. remove Recent/visible membership;
4. set Archived membership and `archivedAtMs`;
5. preserve all authoritative time;
6. update selection/workspace fallback through L5 rules;
7. commit once.

If protection changes before commit, Archive is rejected as stale.

**Settled**

---

# 7. Archive Eligible in Bulk

`Archive All` means:

> Archive all currently eligible inactive Recent Contexts.

It does **not** mean force every Context into Archive.

Protected Contexts are skipped.

The result returns a summary:

```text
archivedCount
skippedProtectedCount
skippedAlreadyArchivedCount
failedCount
```

A partial eligibility result is expected behavior, not a reason to delete or pause protected jobs.

The commit may be one atomic bulk workspace transaction when practical.

**Settled**

---

# 8. Archive Browser

Archive view may expose:

```text
Context label / job number
Job Total / Context Total
last recorded activity
archivedAt
legacy-unattributed indicator when relevant
Restore
Delete Data
Open Job when valid
```

Default ordering:

```text
newest archivedAt first
then stable Context identity
```

Archive browsing itself does not return a Context to Recent.

**Settled**

---

# 9. Restore from Archive

Restoring an archived Context means:

```text
Archived -> Recent
```

It does not Resume or Start Fresh.

Rules:

- preserve all time/history;
- remove archive membership;
- add Recent membership;
- visible-tab capacity is resolved through L5 soft-cap/overflow rules;
- restoring may return to Recent overflow instead of forcing another user-selected tab out;
- selection changes only if the user explicitly chooses to View/Focus it.

If SquareCoil independently makes an archived Context current before manual restore, L4/L5 current-context behavior automatically makes it operationally accessible and Archive membership must reconcile out of the way rather than hiding current work.

**Settled**

---

# 10. Clear Recent Final Semantics

L6 settles the previously open Clear Recent destination.

`Clear Recent` removes eligible inactive Contexts from **Recent workspace membership** and visible tabs.

Destination:

```text
INACTIVE_NON_RECENT
```

Clear Recent does **not** automatically Archive them.

Reason:

- Clear Recent is lightweight workspace cleanup;
- Archive is an intentional organization action;
- silently turning cleanup into Archive would blur two different user intents.

Authoritative time and Context identity remain available through History/By Job/search.

Protected Contexts are skipped.

**Settled**

---

# 11. Clear Recent Bulk Result

Bulk Clear Recent:

- removes every eligible inactive Recent Context;
- preserves archived membership for Contexts already archived;
- skips protected Contexts;
- preserves Time Ledger and legacy balances;
- does not change SquareCoil;
- returns counts for cleared/skipped/failed items.

If the currently Selected Context is cleared and is not protected, L5 chooses a deterministic fallback selection.

**Settled**

---

# 12. Delete Job Data

`Delete Job Data` is explicit permanent deletion of one inactive Context's Companion data.

For the target Context, deletion removes when present:

- Time Ledger Segments;
- legacy-unattributed balance;
- Context Index identity/labels/aliases;
- Recent/visible/hidden/archive membership;
- context-specific workspace ordering metadata;
- context-specific import/restore provenance needed only for the deleted records.

It does not:

- call SquareCoil;
- delete unrelated Contexts;
- clear unrelated preferences;
- clear unrelated Activity Log entries;
- delete official company time.

A minimal non-time Activity Log audit event may record that a destructive operation occurred, but it must not preserve the deleted historical time as a hidden alternate source.

**Settled**

---

# 13. Delete Preconditions

Delete Job Data is unavailable when target Context is protected.

Before commit:

- target must still be inactive/unprotected;
- user intent must be explicitly confirmed;
- confirmation must identify the target Context and make clear that Companion history/time for it will be removed;
- state revision/protection is rechecked.

If SquareCoil makes the target current before commit, deletion is rejected.

After successful deletion, if SquareCoil later observes that job again, it is a newly recreated zero-history Companion Context and normal L4 new-Context behavior applies.

**Settled**

---

# 14. Delete Archived Job Data

Deleting an archived Context uses the exact `Delete Job Data` destructive contract.

Archive membership does not make deletion safer or less destructive.

`Remove from Archive` and `Delete Data` must remain separate actions.

**Settled**

---

# 15. Delete All Archived Data

`Delete All Archived Data` permanently deletes Companion data for all currently eligible archived Contexts.

It:

- deletes their Ledger history and legacy balances;
- removes their Context records/workspace metadata;
- does not touch non-archived Context data;
- does not affect SquareCoil official time.

Before commit:

- the entire target set is staged;
- protected targets cause the operation to stop or require the user to retry after protection clears; the first rebuilt release does not silently skip protected targets inside this highly destructive bulk command;
- explicit bulk confirmation is required.

This operation is distinct from `Clear Archive` or `Restore All` and must never be triggered by ordinary housekeeping.

**Settled**

---

# 16. Wipe All Time History

`Wipe All Time History` is a system-level destructive operation for Companion-recorded time.

It removes:

- all Time Ledger Segments;
- all `legacyUnattributedMs` balances;
- time-specific import provenance and aggregate caches;
- finalized History derived from those records.

It preserves:

- application/theme preferences;
- compatible workspace/Context metadata;
- Recent/Archive organization unless the user separately deletes those Contexts;
- official SquareCoil data, which Companion does not own.

Because it changes the remembered/zero-history meaning of every Context, the initial rebuilt release requires Timer State IDLE and no unresolved recovery/Safety Hold before wipe.

After wipe, existing Context records may remain as zero-history workspace entries. Future SquareCoil observation follows normal L4 zero-history behavior.

**Settled**

---

# 17. Activity Log Retention

Activity Log is non-authoritative.

It may use bounded retention by age and/or count as implementation policy.

Rules:

- Activity pruning never changes Today/Week/Job Total/History;
- activity retention policy is independent from Time Ledger retention;
- `Clear Activity Log` is non-destructive to time/history;
- activity failure never becomes a Time Ledger failure.

The first rebuilt release has **no equivalent silent retention cap for authoritative Time Ledger history**.

**Settled**

---

# 18. No Destructive Time Compaction

The initial rebuilt release does not compact authoritative Ledger history by deleting detailed Sessions/Segments merely to save space.

A future storage optimization is acceptable only if it preserves the exact user-visible/history semantics and does not silently discard recoverable detail.

If storage becomes too large, the application must surface a storage problem rather than silently prune old authoritative time.

**Settled**

---

# 19. Full Backup Purpose

Full Backup JSON is the primary machine-oriented disaster-recovery format.

It is:

- versioned;
- complete for durable restorable Companion data;
- validated before restore;
- independent from Time Report CSV;
- not a live runtime snapshot.

**Settled**

---

# 20. Full Backup Envelope

A Full Backup must support the logical envelope:

```text
format = squarecoil-companion-backup
schemaVersion
backupId
exportedAtMs
appVersion
sourcePlatform/browser metadata when useful
workdayZone
workdayZoneDisposition
contexts
ledgerSegments
legacyBalances
workspace
preferences
migrationMetadata
optionalActivityLog
optionalRecoveryEvidence
```

Exact property names are implementation-level, but these categories are behaviorally required where applicable.

**Settled**

---

# 21. Required Backup Data

Full Backup includes when present:

- Context/job identity and labels;
- Job vs General kind;
- project ID when valid;
- Time Ledger Segments with stable IDs;
- session/cycle IDs;
- timestamps/duration/localDate/workdayZone;
- startCause/endReason/source/certainty/provenance when available;
- legacy-unattributed balances and lineage metadata;
- Archive membership;
- durable Recent membership;
- visible/hidden/tab ordering needed to reconstruct workspace;
- compatible timer thresholds/appearance/preferences;
- current persisted Workday Time Zone preference;
- migration metadata needed to interpret old imported history.

Backup may include bounded Activity Log data, but Activity Log is not required to calculate time.

**Settled**

---

# 22. Backup Excludes Live Claims

Full Backup must not restore/export as authoritative live state:

```text
ACTIVE
PENDING
LOCAL_PAUSED as a live assertion
Safety Hold
accrual owner/fencing lease
open Settings/modal state
current lifecycle state
Bridge observer/listener state
current root/DOM state
```

An exported file must never be able to say, by itself, "the user is currently clocked into Job A."

**Settled**

---

# 23. Optional Recovery Evidence in Backup

To reduce loss if a backup is created while a session is active, Full Backup may include a **sanitized recovery-evidence record** derived from the current durable Recovery Checkpoint.

It may contain only evidence such as:

```text
contextId
sessionId
cycleId
startedAtMs
lastVerifiedAtMs
checkpointedAtMs
source/provenance
```

Rules:

- it is explicitly marked `NON_LIVE_RECOVERY_EVIDENCE`;
- it cannot become ACTIVE/PENDING/LOCAL_PAUSED on restore;
- only the evidence-backed interval through `lastVerifiedAtMs` may later be reconciled;
- normal session/segment dedupe applies;
- restoring an older backup cannot duplicate a session that later finalized under the same stable session identity.

If no safe recovery evidence exists, backup simply contains finalized durable history.

**Settled**

---

# 24. Consistent Backup Snapshot

Backup export is read-only and may occur while Companion is active.

It must use one consistent committed read snapshot:

```text
snapshotRevision
exportedAtMs
```

Records from different state revisions must not be mixed into one internally inconsistent backup.

If state changes while export is being assembled, implementation may:

- continue from a stable snapshot; or
- restart the read.

It must not silently mix revisions.

**Settled**

---

# 25. Backup Validation

Restore treats every uploaded file as untrusted input.

Validation checks at minimum:

- recognizable format identifier;
- supported schema version;
- valid top-level types;
- valid Context identity shapes;
- valid timestamps/durations;
- valid Segment/session IDs where required;
- internal duplicate/conflict detection;
- valid workspace membership values;
- bounded structural depth/string lengths/file size according to implementation safety limits;
- no executable content is evaluated.

Safety limits may reject a file with a clear error. They may **not silently truncate records and then report restore success**.

**Settled**

---

# 26. Schema Compatibility

Restore behavior by schema:

```text
current supported schema -> validate and stage
older explicitly supported schema -> migrate in staging, then validate
newer unsupported major schema -> reject safely
```

Unknown optional fields may be ignored when the schema contract permits them.

Unknown required semantics must not be guessed.

A failed migration/validation leaves current data unchanged.

**Settled**

---

# 27. Restore Pipeline

Canonical Restore pipeline:

```text
File
-> Parser
-> Schema Validator
-> Migration Adapter
-> Internal Invariant Validator
-> Conflict Analyzer
-> Staged Restore Plan
-> User Mode/Conflict Decision
-> Data Mutation Lock
-> Revision Recheck
-> Atomic Commit
-> Post-Restore Requery
-> Fresh SquareCoil verification
```

No uploaded JSON object is written directly into persistent state.

**Settled**

---

# 28. Restore Modes

Full Backup supports two explicit modes:

```text
MERGE
REPLACE
```

Default/recommended mode is `MERGE` because it is non-destructive to current unrelated history.

`REPLACE` is explicitly destructive and requires stronger confirmation.

**Settled**

---

# 29. Restore Merge Semantics

MERGE adds compatible durable history/context data without replacing current unrelated records.

Rules:

- stable Context identity merges by Context ID;
- stable Segment/session IDs dedupe;
- new compatible records are added;
- current operational Shared Timer State is untouched;
- current workspace membership/order wins for Contexts already present unless the user explicitly opts to restore workspace organization;
- new Contexts may inherit backup workspace membership;
- current compatible preferences win by default; user may separately choose to import backup preferences;
- current Workday Time Zone preference wins, while imported historical Segments retain their stored `localDate`/`workdayZone`.

**Settled**

---

# 30. Restore Replace Semantics

REPLACE means:

> Replace the current durable restorable Companion dataset with the validated backup dataset.

It replaces:

- Ledger/history;
- Context Index/restorable identity metadata;
- legacy balances;
- Recent/Archive/workspace organization;
- compatible restorable preferences selected by the restore contract.

It preserves local runtime/platform items that a backup must not own, including:

- current extension installation identity;
- browser permissions/connections;
- volatile lifecycle/runtime state.

Requirements:

- Timer State must satisfy Section 4.2 idle safety;
- explicit destructive confirmation;
- pre-commit current-state revision check;
- one atomic logical replacement;
- live state remains non-running after commit until SquareCoil is freshly observed.

**Settled**

---

# 31. Segment Dedupe During Merge

## 31.1 Same stable Segment ID, same material fields

Treat as duplicate. Add nothing.

## 31.2 Same stable Segment ID, conflicting time fields

Do not sum both and do not silently choose one.

Create a restore conflict.

## 31.3 Different IDs, same deterministic interval fingerprint

Treat as likely duplicate according to L2 fingerprint rules. Do not double-count solely because IDs differ.

## 31.4 Overlapping but materially different intervals

Do not automatically merge/split/trim them merely to maximize or minimize hours.

Flag for conflict analysis when they appear to represent the same source session; otherwise preserve distinct legitimate sessions.

**Settled**

---

# 32. Context Metadata Merge

For the same stable Context ID:

- identity does not fork because names differ;
- valid project ID remains authoritative identity;
- richer/newer label metadata may be adopted according to provenance/updated-time rules;
- a blank incoming label does not erase a useful current label;
- archive/recent status follows Restore Merge workspace policy, not label freshness.

A label conflict never creates extra time.

**Settled**

---

# 33. Legacy Unattributed Balance Merge

`legacyUnattributedMs` is aggregate evidence and must never be blindly added during Merge.

Backup/export must preserve lineage/source metadata sufficient to identify the balance's migration origin when available.

Merge rules:

- same identifiable lineage/origin -> dedupe and preserve the non-duplicated authoritative balance, normally the maximum equivalent baseline rather than sum;
- clearly identical backup restored twice -> no added balance on second restore;
- incompatible/independent lineage where additive meaning cannot be proven -> conflict, not automatic sum;
- no fabricated dated Sessions are created to resolve the conflict.

**Settled**

---

# 34. Restore Conflict Resolution

A staged Merge with material conflicts cannot silently commit a guessed winner.

Conflict classes include:

```text
SEGMENT_ID_CONFLICT
SESSION_ID_CONFLICT
LEGACY_BALANCE_LINEAGE_CONFLICT
CONTEXT_IDENTITY_CONFLICT
UNSUPPORTED_SCHEMA_CONFLICT
```

For resolvable record conflicts, user-facing policy may offer conceptually:

```text
Keep Current
Use Incoming
Cancel Restore
```

Bulk policy may be offered only when it is explicit and does not mask materially different conflict types.

If any required conflict remains unresolved, authoritative commit does not occur.

**Settled**

---

# 35. Partial Restore Failure

Restore is staged first and authoritative commit is atomic.

Therefore:

- parse failure -> no mutation;
- validation failure -> no mutation;
- migration failure -> no mutation;
- unresolved conflict -> no mutation;
- persistence commit failure -> operation reports failure/recovery condition, never normal success.

The application must not restore the first 900 records and silently drop the last 100.

**Settled**

---

# 36. Safe Post-Restore State

After Merge or Replace:

- no file-derived ACTIVE/PENDING/LOCAL_PAUSED state is asserted;
- read models refresh from the new durable revision;
- caches are rebuilt/invalidated;
- SquareCoil Bridge performs fresh current-state verification;
- L4 decides whether current Context becomes zero-history Active, remembered Pending, or other valid live state.

Restore itself never clocks into SquareCoil.

**Settled**

---

# 37. Restore Activity / Provenance

A successful restore records a non-authoritative Activity event with:

```text
mode
backup schema/version
counts added/deduped/conflicted/replaced
completedAtMs
```

Do not place full customer/job history or uploaded file contents into Activity/diagnostics merely for convenience.

**Settled**

---

# 38. History CSV Purpose

History CSV is a portable compatible timer-history round-trip format.

It is not:

- a live runtime backup;
- the preferred full-fidelity application disaster backup;
- the human summary report format.

**Settled**

---

# 39. History CSV Canonical Records

The rebuilt canonical CSV schema supports explicit record types:

```text
SEGMENT
LEGACY_BALANCE
```

A SEGMENT row can preserve logically:

```text
schema_version
record_type
context_id
context_kind
project_id
context_label
segment_id
session_id
cycle_id
start_at_iso
end_at_iso
duration_ms
local_date
workday_zone
start_cause
end_reason
source
certainty
provenance
```

A LEGACY_BALANCE row preserves:

```text
context identity
legacy_unattributed_ms
lineage/provenance
```

Exact column naming may be implementation-specific only if exported/imported round-trip semantics remain equivalent and documented.

**Settled**

---

# 40. History CSV v0.7 Compatibility

The importer must continue to recognize safely interpretable records from the current legacy schema family:

```text
squarecoil-job-timer-csv-v1
```

The adapter:

- parses legacy fields according to the audited v0.7 contract;
- normalizes Context identity;
- applies L2 legacy timestamp/duration precedence;
- creates legacy-unattributed balance where aggregate time exceeds surviving dated rows;
- does not restore active/pending runtime claims;
- never invents missing dates to make totals match.

If a legacy row cannot be safely interpreted, it is rejected/reported rather than guessed.

**Settled compatibility requirement**

---

# 41. History CSV Export Snapshot

History CSV export uses one consistent read snapshot.

It exports finalized authoritative history and legacy balances.

The current unfinalized ACTIVE contribution is not exported as a finalized SEGMENT.

If a user needs disaster recovery of an in-progress session, Full Backup's optional Recovery Evidence is the correct mechanism.

**Settled**

---

# 42. History CSV Import Pipeline

History CSV Import follows:

```text
File
-> CSV parser
-> schema/header identification
-> row validation
-> legacy adapter when needed
-> Context normalization
-> dedupe/conflict analysis
-> staged import summary
-> Data Mutation Lock
-> revision recheck
-> atomic merge commit
```

It never writes one row at a time directly into authoritative storage.

**Settled**

---

# 43. Malformed CSV Rows

For authoritative History CSV Import, the first rebuilt release uses an **all-valid-or-explicit-review** rule.

A malformed/unsafe row is not silently skipped while the import reports full success.

The staged result reports:

```text
validRows
invalidRows
conflictRows
duplicateRows
```

The user may:

- cancel and fix the file; or
- explicitly proceed with an import plan that excludes individually identified invalid rows if the UI later supports reviewed partial import.

No automatic silent partial import.

**Settled**

---

# 44. Duplicate CSV Import

Importing the same History CSV twice must not double recorded time.

Dedupe uses:

- stable Segment/session IDs when available;
- L2 deterministic interval fingerprint fallback;
- legacy-balance lineage rules.

A duplicate import may report:

```text
0 added
N duplicates
```

and is still a valid no-op result.

**Settled**

---

# 45. Imported Workspace State

History CSV import restores history, not workspace/live state.

Imported Contexts:

- become known in Context Index as needed for history access;
- do not automatically become visible timer tabs;
- do not automatically become Recent solely because they were imported;
- do not become Active/Pending/Local Paused solely from CSV;
- can later be shown/restored to workspace explicitly or become Recent when SquareCoil observes them.

**Settled**

---

# 46. Time Report CSV Purpose

Time Report CSV is a human-readable reporting export.

It is not accepted as a runtime/history restore format.

Default report mode is daily Context summary.

**Settled**

---

# 47. Time Report CSV Summary Columns

Default summary supports conceptually:

```text
Date
Job Number
Job / Context Name
Context Type
Daily Recorded Hours
Overall Job / Context Hours as of export
Status / Provisional flag when applicable
As Of
```

Rules:

- Job Number is blank for General Contexts;
- daily rows use L2 local-date attribution;
- legacy-unattributed time is not inserted into fake daily rows;
- overall total may include legacy-unattributed balance and valid current contribution;
- report must make any provisional snapshot value identifiable;
- export time/as-of timestamp is included in metadata or column data.

**Settled**

---

# 48. Time Report Detailed Mode

An optional detailed report mode may expose logical-session rows with:

```text
Context
start/end
duration
startCause
endReason
source/provenance when useful
```

Cross-midnight logical sessions may be shown as one session while a daily-allocation field/detail explains date splitting.

Detailed Time Report remains human reporting, not an import contract.

**Settled optional mode**

---

# 49. CSV Precision

CSV outputs derive from integer-millisecond source values.

If hours are displayed as decimals:

- conversion happens at export formatting time;
- source Ledger precision is not mutated;
- documented decimal precision is consistent within that file;
- repeated export/import of History CSV must rely on `duration_ms`/timestamps rather than re-parsing rounded human decimal hours when canonical fields exist.

**Settled**

---

# 50. Spreadsheet Formula-Injection Safety

Context labels and imported user-visible text are untrusted strings.

CSV export must protect spreadsheet users from formula execution when text begins with formula-triggering characters such as:

```text
=
+
-
@
```

Requirements:

- use RFC-compatible CSV quoting/escaping;
- apply a reversible or explicitly documented spreadsheet-safe text-escaping rule;
- never execute imported formulas/scripts;
- History CSV importer reverses only its own known safe escape convention, not arbitrary spreadsheet formulas.

Security escaping must not silently change Context identity.

**Settled**

---

# 51. File Size / Resource Safety

Backup/CSV parsers may enforce implementation safety limits for file size, nesting, row count per operation, and field length.

These are **input-processing limits**, not historical retention limits.

If a valid dataset exceeds one-operation limits:

- reject with a clear reason or support a streamed/chunked import design;
- never truncate the tail and claim full success.

**Settled**

---

# 52. Export Failure

If export serialization/download preparation fails:

- authoritative stored data remains unchanged;
- no partial file is presented as a successful complete backup/report when completeness cannot be guaranteed;
- failure is surfaced without degrading normal timer state unless the underlying persistence read itself is unhealthy.

**Settled**

---

# 53. Destructive Confirmation Semantics

Exact visual dialogs are deferred, but destructive actions must communicate consequences accurately.

At minimum:

## Delete Job Data

Identify target and say its Companion-recorded history/time will be permanently removed.

## Delete All Archived Data

State that all archived Companion Context data/time will be permanently deleted.

## Wipe All Time History

State that all Companion-recorded time history will be permanently removed while SquareCoil official records are unaffected.

## Restore Replace

State that current restorable Companion data will be replaced by the selected backup.

Confirmation wording must not imply these operations modify official SquareCoil/payroll data.

**Settled semantics**

---

# 54. Pre-Destructive Backup Opportunity

For high-impact global destructive operations, the UI should provide a clear opportunity to create a Full Backup first.

Required for first release conceptually before:

- Restore Replace;
- Delete All Archived Data;
- Wipe All Time History.

This is an opportunity, not an automatic hidden backup promise unless implementation explicitly confirms the backup was successfully created.

A failed backup must never be described as successful protection.

**Settled**

---

# 55. L6 Behavior Invariants

- **DATA-SAFE-01:** Clear Recent never deletes or archives authoritative time.
- **DATA-SAFE-02:** Clear Recent destination is inactive/non-recent, not automatic Archive.
- **DATA-SAFE-03:** Archive preserves all authoritative time.
- **DATA-SAFE-04:** Restore Archive changes workspace membership only.
- **DATA-SAFE-05:** Protected Contexts cannot be ordinarily archived/cleared/deleted.
- **DATA-SAFE-06:** Delete Job Data is explicit permanent Companion-data deletion.
- **DATA-SAFE-07:** Wipe All Time History never changes official SquareCoil data.
- **DATA-SAFE-08:** Authoritative Time Ledger has no silent count/age pruning policy.
- **DATA-SAFE-09:** Full Backup restores durable data, never live Timer State.
- **DATA-SAFE-10:** Restore validates/stages before commit.
- **DATA-SAFE-11:** Restore Merge is idempotent for stable duplicate records.
- **DATA-SAFE-12:** Restore conflicts are not silently summed/overwritten.
- **DATA-SAFE-13:** Restore Replace requires idle global safety and explicit confirmation.
- **DATA-SAFE-14:** Legacy unattributed balances are never blindly added.
- **DATA-SAFE-15:** Partial validation/import failure cannot masquerade as full success.
- **DATA-SAFE-16:** History CSV import cannot create live Timer State.
- **DATA-SAFE-17:** Importing the same compatible CSV twice cannot double time.
- **DATA-SAFE-18:** Time Report CSV is reporting-only and not a restore format.
- **DATA-SAFE-19:** CSV security escaping protects spreadsheet users without changing Context identity.
- **DATA-SAFE-20:** Input processing limits may reject, but never silently truncate authoritative history.

**All Settled**

---

# 56. Acceptance Scenarios

## D1. Archive inactive job

Inactive A with 12h history is archived -> leaves Recent, 12h remains, Job Total unchanged.

## D2. Attempt archive ACTIVE job

ACTIVE A -> Archive rejected/unavailable; timing unchanged.

## D3. Archive All with one protected Context

A/B inactive, C Pending -> A/B archived, C skipped/protected, summary reports result.

## D4. Restore archived job

Archived A -> Recent membership restored, time unchanged, no Resume/start.

## D5. Restore into full visible tabs

Restored A enters Recent overflow if needed; another actively inspected/protected tab is not destroyed.

## D6. Clear Recent

Inactive Recent A/B -> become inactive/non-recent; not archived; time remains searchable in History/By Job.

## D7. Clear Recent with ACTIVE A

A protected and skipped; eligible inactive rows clear.

## D8. Delete inactive job

Confirmed Delete A -> A Ledger/legacy balance/Context workspace metadata removed; unrelated B unchanged.

## D9. Delete target becomes current during confirmation

SquareCoil makes A current before commit -> stale/protection recheck rejects deletion.

## D10. Delete archived job

Uses same destructive semantics as Delete Job Data, not simple archive removal.

## D11. Delete all archived

All staged archived targets eligible -> archived Context data permanently removed; Recent data untouched.

## D12. Delete all archived encounters newly protected target

Global destructive commit stops/rejects instead of silently skipping an unexpected protected target.

## D13. Wipe History while ACTIVE

Operation blocked until Timer State meets idle safety precondition.

## D14. Wipe History while IDLE

All Ledger and legacy balances removed; workspace/preferences remain; official SquareCoil unaffected.

## D15. Activity log prune

Old Activity rows removed -> Today/Job Total/History unchanged.

## D16. Large Ledger

History exceeds old v0.7 caps -> no authoritative sessions are silently pruned.

## D17. Backup while idle

Backup contains durable Ledger/Context/workspace/preferences and no live Timer State.

## D18. Backup while active

Backup uses consistent committed snapshot; optional recovery evidence is marked non-live; no ACTIVE claim is exported.

## D19. Backup snapshot revision changes mid-export

Exporter uses stable snapshot or restarts; does not mix incompatible revisions.

## D20. Malformed backup

Validation fails -> current data unchanged.

## D21. Unsupported future backup schema

Safely rejected; no guessed import.

## D22. Merge new history

Backup contains new Context/Segments -> compatible records added, current operational state untouched.

## D23. Merge same backup twice

Second restore dedupes stable records; totals do not double.

## D24. Same Segment ID conflict

Current and incoming share ID but different duration -> conflict; no silent sum/overwrite.

## D25. Same Context, newer label

Identity remains one Context; metadata may update without changing time identity.

## D26. Same legacy balance lineage twice

Balance does not double on second restore.

## D27. Ambiguous independent legacy balances

Restore reports conflict instead of adding them automatically.

## D28. Merge during unrelated ACTIVE job

Staged historical merge may commit only if current operational state remains untouched and revision/conflict checks pass.

## D29. Replace while ACTIVE

Blocked by global idle precondition.

## D30. Replace while IDLE

Validated backup replaces restorable durable dataset atomically; no live state restored.

## D31. Replace commit failure

Operation is not reported as successful; recovery/failure condition surfaced.

## D32. Restore then current SquareCoil Context exists

Fresh Bridge verification runs; L4 decides zero-history Active vs remembered Pending. File does not decide.

## D33. Legacy v0.7 CSV complete rows

Safely adapted to rebuilt Ledger/Context model.

## D34. Legacy CSV aggregate exceeds dated sessions

Excess becomes legacy-unattributed balance; no fake dates created.

## D35. History CSV imported twice

Second import adds no duplicate time.

## D36. CSV malformed row

Import stages invalid-row report; no silent partial success.

## D37. CSV imported Context absent from workspace

History becomes accessible but Context does not automatically clutter Recent/tabs.

## D38. History CSV during ACTIVE unrelated job

May merge only if it does not alter Shared Timer State/current session and revision checks remain valid.

## D39. Time Report daily summary

Rows reflect L2 daily attribution, include General Contexts, and do not assign legacy-unattributed time to dates.

## D40. Time Report active normal session

Valid current contribution may appear in snapshot with As Of metadata.

## D41. Time Report provisional session

Affected snapshot value is explicitly marked provisional.

## D42. History CSV active session

Current unfinalized Active session is not exported as a finalized SEGMENT.

## D43. Spreadsheet-dangerous label

Label beginning `=SUM(...)` exports as spreadsheet-safe text; opening CSV must not execute it as intended Companion content.

## D44. Oversized import

Parser rejects or uses supported streaming path; never truncates tail and claims full success.

## D45. Export failure

Stored history remains unchanged and user is not given a falsely complete backup.

## D46. Pre-destructive backup opportunity

Before Wipe/Replace/Delete-All-Archived, user can choose Full Backup first; destructive action does not claim protection unless backup succeeds.

---

# 57. Continuity States After L6

## Settled

- Archive preserves history and is distinct from Delete;
- Restore Archive returns to Recent without timing side effects;
- Clear Recent destination is inactive/non-recent, not Archive;
- protected-target recheck before workspace/destructive commit;
- exact Delete Job Data scope;
- Delete All Archived Data semantics;
- Wipe All Time History scope and idle requirement;
- Activity Log may be retention-bounded independently;
- no silent authoritative Time Ledger pruning;
- Full Backup required categories and live-state exclusions;
- optional non-live Recovery Evidence;
- consistent backup snapshots;
- untrusted-file validation and schema handling;
- Restore Merge vs Replace;
- merge workspace/preference behavior;
- segment/context/legacy-balance conflict semantics;
- atomic staged restore/import behavior;
- safe non-live post-restore state;
- canonical rebuilt History CSV record model;
- legacy v0.7 CSV compatibility requirement;
- malformed/duplicate CSV behavior;
- imported history does not automatically enter Recent;
- Time Report summary/detailed purpose and columns;
- CSV precision and spreadsheet safety;
- file-processing limits cannot become silent truncation;
- destructive confirmation semantics and backup opportunity.

## Provisional

- exact backup JSON property names;
- exact maximum file/row/string safety limits;
- exact Activity Log retention age/count;
- exact conflict-resolution UI for large conflict sets;
- exact spreadsheet-safe text escape marker;
- whether optional Activity Log is enabled by default in Full Backup;
- exact detailed Time Report column set;
- exact filename conventions.

## Open for later stages

- Settings navigation into Archives & Backup (L7);
- exact destructive-dialog visual/microcopy (L7);
- support diagnostics for restore/import failures (L7/L8);
- implementation storage transaction strategy (build stage);
- automated backup/CSV fixtures and corruption tests (L8/build).

## Blocked

None.

---

# 58. L6 Readiness Judgment

**Status: Ready for review**

L6 is ready for review when Archive/Clear/Delete, backup/restore, History CSV, and Time Report behavior can be implemented without silently deleting authoritative time, double-counting imported history, restoring fake live Timer State, or treating malformed external files as trusted application state.

If accepted and hardened, the next stage is:

**L7: Settings, Themes, Support, and Developer Support**
