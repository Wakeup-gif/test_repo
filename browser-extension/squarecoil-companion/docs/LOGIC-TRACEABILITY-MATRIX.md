# SquareCoil Companion Logic Traceability Matrix

Status: **Canonical logic-to-build traceability index**

Logic state: **L0-L8 settled**
Current build state: **B1 NOT_SETTLED / READY_FOR_REPAIR; B2 BLOCKED**

This matrix gives stable documentation identifiers to settled requirement groups without renumbering existing invariants or changing product semantics. The cited contract remains the full authority; a row summarizes all requirements in the cited section group.

---

## 1. Evidence and result vocabulary

Workflow/evidence status:

```text
PENDING   required evidence has not been executed or verified
PARTIAL   only some required cases/layers are proven
DEFERRED  intentionally belongs to a later build stage
BLOCKED   an upstream gate prevents valid execution
COMPLETE  the required execution/evidence record is complete
```

Executed required-gate result:

```text
PASS            required behavior passed for the exact source/artifact
FAIL            required behavior was executed and failed
NOT_APPLICABLE  the contract explicitly makes the layer irrelevant, with a reason
```

No required test may be silently omitted. A pending/unexecuted gate has no result. `DEFERRED`, `BLOCKED`, and `NOT_APPLICABLE` require an explanation and do not count as `PASS`.

Fixture-family prefixes:

| Prefix | Layer |
|---|---|
| `UT-` | A2 deterministic unit fixture |
| `IT-` | A3 integration fixture |
| `A4-*-CH-` | packaged Chrome behavioral fixture |
| `A4-*-ED-` | packaged Edge parity fixture |
| `PKG-` | A1 static/package fixture |

---

## 2. L0-L8 requirement mapping

| Stable ID | Canonical contract | Settled requirement group | Build owner / interface | A2 fixture family | A3 fixture family | A4 Chrome / Edge | Current evidence or blocker |
|---|---|---|---|---|---|---|---|
| L0-TR-01 | L0 architecture/source invariants | One Timer State owner, Time Ledger, UI owner, Lifecycle owner, read-only Bridge, shared source | B1 shell + B2 core services | `UT-B1-OWN-*`, `UT-B2-OWN-*` | `IT-B2-WRITER-*` | `A4-B1-CH/ED-*`, `A4-B2-CH/ED-*` | B1 partial; B2 blocked |
| L0-TR-02 | L0 SquareCoil authority | SquareCoil owns company clock; Companion never silently invokes native mutations | B2 Bridge boundary | `UT-B2-BRIDGE-RO-*` | `IT-B2-BRIDGE-RO-*` | `A4-B2-CH/ED-RO-*` | Deferred to B2 |
| L0-TR-03 | L0 time truth | Never fabricate/backfill unverified time or silently prune authoritative history | B2 Ledger + B4 data services | `UT-B2-TIME-*`, `UT-B4-RET-*` | `IT-B2-RECOVERY-*`, `IT-B4-RET-*` | `A4-B2/B4-CH/ED-*` | Deferred; local B2 is unapproved |
| L0-TR-04 | L0 context semantics | Selected, Observed, Active, Pending, Local Pause, General, and job identity stay distinct | B2 state/read model + B3 presentation | `UT-B2-CTX-*`, `UT-B3-PRES-*` | `IT-B2-B3-CTX-*` | `A4-B3-CH/ED-CTX-*` | Deferred |
| L0-TR-05 | L0 data-operation vocabulary | Recent, Archive, Delete, Wipe, backup, CSV, Activity have distinct safety semantics | B4 data-safety services | `UT-B4-DATA-*` | `IT-B4-DATA-*` | `A4-B4-CH/ED-DATA-*` | Deferred |
| L1-TR-01 | L1 §§3-5 | Lifecycle states and Application Mode have explicit legal transitions | B1 Lifecycle Coordinator | `UT-B1-LC-*` | `IT-B1-SHELL-*` | `A4-B1-CH/ED-LC-*` | Remote unit evidence partial |
| L1-TR-02 | L1 §6 R1-R9 | READY requires positive ownership, identity, UI interaction, persistence, Bridge, registry, teardown, and coordination | B1 proves guards/shell; B2 supplies real R5-R7/R9 positive services | `UT-B1-READY-*`, `UT-B2-READY-*` | `IT-B1-READY-GUARD-*`, `IT-B2-READY-*` | B1 truthful DEGRADED guard; B2 positive `A4-B2-CH/ED-READY-*` | Intentional `DEGRADED / coordination-not-implemented-b1` until B2 |
| L1-TR-03 | L1 §§9-12 | Existing runtime/root/version/legacy ownership is classified safely; ambiguous ownership is never guessed or deleted | B1 runtime probe + runtime UI | `UT-B1-PROBE-*` | `IT-B1-ROOT-*` | `A4-B1-CH/ED-ROOT-*` | Partial; strict orphan proof still pending |
| L1-TR-04 | L1 §§15,18 | Teardown Lock, resource registration, idempotent cleanup, and late-callback invalidation | B1 lifecycle + feature registry | `UT-B1-TD-*` | `IT-B1-TD-*` | `A4-B1-CH/ED-TD-*` | Remote failed-cleanup ownership is defective |
| L1-TR-05 | L1 §§18,20; L1-AC-23 | Failed disable remains `FAILED/teardown-incomplete`; disabled boot and re-enable cannot erase/bypass it or allocate replacements | B1 lifecycle + background orchestration | `UT-B1-LC-23` | `IT-B1-LC-23` | `A4-B1-CH-23`, `A4-B1-ED-23` | Confirmed blocker; local draft also fails full sequence |
| L1-TR-06 | L1 §19 | Reload, same-document changes, BFCache, service-worker restart, extension update do not duplicate resources | B1 page/background lifecycle | `UT-B1-PAGE-*` | `IT-B1-TRANSPORT-*` | `A4-B1-CH/ED-PAGE-*` | Browser evidence pending |
| L1-TR-07 | L1 §§21-23 | Honest lifecycle feedback and Chrome/Edge parity for supported documents | B1 popup/status + platform adapter | `UT-B1-STATUS-*` | `IT-B1-STATUS-*` | `A4-B1-CH/ED-PARITY-*` | Pending |
| L2-TR-01 | L2 state/data model | Shared Timer State, Ledger, Job Index, and tab view state have one owner and no duplicate contribution | B2 state/ledger services | `UT-B2-STATE-*`, `UT-B2-LEDGER-*` | `IT-B2-STATE-LEDGER-*` | `A4-B2-CH/ED-CORE-*` | B2 blocked |
| L2-TR-02 | L2 time rules | Integer milliseconds, workday zone, midnight/DST/week rules, virtual active contribution | B2 clock/query services | `UT-B2-TIME-*` | `IT-B2-TOTALS-*` | `A4-B2-CH/ED-TOTALS-*` | B2 blocked |
| L2-TR-03 | L2 coordination | One fenced OWNER writes; OBSERVER runtimes are read-only; stale owners cannot commit | B2 coordination/persistence | `UT-B2-FENCE-*` | `IT-B2-OWNER-*` | `A4-B2-CH/ED-TABS-*` | B2 blocked; atomic fence+commit required |
| L2-TR-04 | L2 migration | v0.7 migration is atomic, independent, idempotent, retry-safe, and preserves unattributed balance without fake sessions | B2 migration/data store | `UT-B2-MIG-*` | `IT-B2-MIG-*` | `A4-B2-CH/ED-UPGRADE-*` | Local draft incomplete/unapproved |
| L2-TR-05 | L2 recovery checkpoint | Checkpoints are bounded evidence, never authority to restore a live clock; late generations are rejected | B2 checkpoint + lifecycle interface | `UT-B2-CP-*` | `IT-B2-RESTART-*` | `A4-B2-CH/ED-RESTART-*` | B2 blocked |
| L3-TR-01 | L3 Bridge boundary | Bridge observes only and never calls native SquareCoil clock mutation | B2 Bridge service | `UT-B2-BRIDGE-RO-*` | `IT-B2-BRIDGE-RO-*` | `A4-B2-CH/ED-BRIDGE-RO-*` | B2 blocked |
| L3-TR-02 | L3 evidence model | Audited server/DOM/action evidence is normalized; conflict becomes `STATE_CONFLICT`; unknown stays bounded | B2 parser/Bridge engine | `UT-B2-EVID-*` | `IT-B2-EVID-*` | `A4-B2-CH/ED-EVID-*` | Arbitrary-link and conflict gaps remain in draft |
| L3-TR-03 | L3 context parsing | General, job, department change, leave, clock-out, and empty `data-time` rules are exact | B2 Bridge parser | `UT-B2-PARSE-*` | `IT-B2-PARSE-*` | `A4-B2-CH/ED-PARSE-*` | B2 blocked |
| L3-TR-04 | L3 action handling | Native action-2 clock-out requires bounded confirmation and disproof; passive hints never become silent authority | B2 Bridge candidate engine | `UT-B2-A2-*` | `IT-B2-A2-*` | `A4-B2-CH/ED-A2-*` | Confirmation/disproof incomplete |
| L3-TR-05 | L3 teardown/generation | Observers, listeners, requests, candidates, and stale responses are invalidated on teardown/reload | B2 Bridge + B1 lifecycle interface | `UT-B2-BRIDGE-TD-*` | `IT-B2-LATE-*` | `A4-B2-CH/ED-LATE-*` | B2 blocked |
| L4-TR-01 | L4 new/remembered behavior | Safe zero-history auto-start; remembered Context enters Pending with Resume/Start Fresh | B2 Timer service | `UT-B2-TIMER-START-*` | `IT-B2-TIMER-START-*` | `A4-B2-CH/ED-START-*` | B2 blocked |
| L4-TR-02 | L4 Local Pause | Pause/Resume is Companion-only, finalizes verified time once, and never mutates SquareCoil | B2 Timer/Ledger transaction | `UT-B2-PAUSE-*` | `IT-B2-PAUSE-*` | `A4-B2-CH/ED-PAUSE-*` | B2 blocked |
| L4-TR-03 | L4 boundaries | Context switch, action-2, project leave, same-project metadata, and atomic job switching preserve exact boundaries | B2 Timer + Bridge + Ledger | `UT-B2-BOUND-*` | `IT-B2-SWITCH-*` | `A4-B2-CH/ED-SWITCH-*` | B2 blocked |
| L4-TR-04 | L4 uncertainty | Grace, provisional time, Safety Hold, conservative end, and same-job return never fabricate continuity | B2 Timer recovery policy | `UT-B2-HOLD-*` | `IT-B2-HOLD-*` | `A4-B2-CH/ED-HOLD-*` | B2 blocked |
| L4-TR-05 | L4 controlled reload | Checkpoint plus fresh observation reconciles continuity; reload alone is not a work boundary | B2 checkpoint/timer interface | `UT-B2-RELOAD-*` | `IT-B2-RELOAD-*` | `A4-B2-CH/ED-RELOAD-*` | B2 blocked |
| L5-TR-01 | L5 presentation state | Selected Context never impersonates operational Context; Current Context Strip/status precedence is deterministic | B3 presentation read model/router | `UT-B3-PRES-*` | `IT-B3-PRES-*` | `A4-B3-CH/ED-PRES-*` | Deferred |
| L5-TR-02 | L5 totals | Today first, Job/Context Total second, provisional markings only where applicable | B3 views over B2 read model | `UT-B3-TOTAL-*` | `IT-B2-B3-TOTAL-*` | `A4-B3-CH/ED-TOTAL-*` | Deferred |
| L5-TR-03 | L5 tabs/Recent | Tabs are navigation, soft cap cannot hide protected context, Recent is not retention | B3 workspace | `UT-B3-TABS-*` | `IT-B3-TABS-*` | `A4-B3-CH/ED-TABS-*` | Deferred |
| L5-TR-04 | L5 views/history | Overview, By Day/Job, Context Detail, History reconstruction, and pagination preserve ledger truth | B3 query/view services | `UT-B3-VIEW-*` | `IT-B3-VIEW-*` | `A4-B3-CH/ED-VIEW-*` | Deferred |
| L5-TR-05 | L5 navigation | Open/search job has no timing side effects and handles invalid/missing IDs safely | B3 job navigation | `UT-B3-NAV-*` | `IT-B3-NAV-*` | `A4-B3-CH/ED-NAV-*` | Deferred |
| L6-TR-01 | L6 housekeeping | Clear Recent, Archive, Restore Archive, Delete Job Data, and Wipe have distinct protected semantics | B4 data mutation service | `UT-B4-HOUSE-*` | `IT-B4-HOUSE-*` | `A4-B4-CH/ED-HOUSE-*` | Deferred |
| L6-TR-02 | L6 backup | Full Backup is complete/versioned; live states are excluded; recovery evidence remains non-live | B4 backup service | `UT-B4-BACKUP-*` | `IT-B4-BACKUP-*` | `A4-B4-CH/ED-BACKUP-*` | Deferred |
| L6-TR-03 | L6 restore | Parse/validate/migrate/analyze/stage/atomic commit; merge default; replace protected; overlap/conflict explicit | B4 restore pipeline | `UT-B4-RESTORE-*` | `IT-B4-RESTORE-*` | `A4-B4-CH/ED-RESTORE-*` | Deferred |
| L6-TR-04 | L6 CSV/reporting | History CSV round-trips safely; Time Report is reporting-only; duplicate imports and formula injection are controlled | B4 CSV/report services | `UT-B4-CSV-*` | `IT-B4-CSV-*` | `A4-B4-CH/ED-CSV-*` | Deferred |
| L6-TR-05 | L6 locking/retention | Data Mutation Lock coordinates with writer; failures are atomic; authoritative history is never silently capped | B4 + B2 transaction interface | `UT-B4-LOCK-*` | `IT-B2-B4-LOCK-*` | `A4-B4-CH/ED-LOCK-*` | Deferred |
| L7-TR-01 | L7 Settings router | One router, safe focus/keyboard/back/close, coherent preference commits | B5 Settings/UI owner | `UT-B5-SET-*` | `IT-B5-SET-*` | `A4-B5-CH/ED-SET-*` | Deferred |
| L7-TR-02 | L7 themes | Light/Dark/Auto, Solid/Glass, and website themes are idempotent, accessible, and isolated from timer health | B5 theme services | `UT-B5-THEME-*` | `IT-B5-THEME-*` | `A4-B5-CH/ED-THEME-*` | Deferred; historical contrast defects are evidence |
| L7-TR-03 | L7 support | Ticket/Feedback validates, previews, encodes mailto, and never claims sent; copy fallbacks remain available | B5 support service | `UT-B5-SUPPORT-*` | `IT-B5-SUPPORT-*` | `A4-B5-CH/ED-SUPPORT-*` | Deferred |
| L7-TR-04 | L7 privacy | Diagnostics are opt-in, preview-frozen, whitelisted, sanitized, and excluded from backup/history | B5 diagnostics/privacy | `UT-B5-PRIV-*` | `IT-B5-PRIV-*` | `A4-B5-CH/ED-PRIV-*` | Deferred |
| L7-TR-05 | L7 developer support | Optional config fails safely; no nags, tracking, paywalls, or core dependency | B5 developer-support module | `UT-B5-DEV-*` | `IT-B5-DEV-*` | `A4-B5-CH/ED-DEV-*` | Deferred/nonblocking configuration |
| L8-TR-01 | L8 §§2-8 | Failure priority and truthful success/degradation rules apply across modules | B1-B6 | stage-specific `UT-*` | stage-specific `IT-*` | stage-specific `A4-*` | Canonical; implementation evidence varies |
| L8-TR-02 | L8 §§9-15 | A1-A4 are distinct; earlier layers cannot substitute for later required evidence | B1-B6 gate owner | `GATE-B*-A2` | `GATE-B*-A3` | `GATE-B*-A4-CH/ED` | B1 A4 pending |
| L8-TR-03 | L8 §§16,28-30 | Clean/upgrade profiles, exact artifact identity, Chrome candidate, and Edge parity are separately proven | B6 release/acceptance | `UT-B6-EVID-*` | `IT-B6-PKG-*` | `A4-B6-CH/ED-*` | Deferred to B6; stage A4 still required earlier where listed |
| L8-TR-04 | L8 §§18-27 | Required fixtures, concurrency, privacy, accessibility, resource, and recovery postconditions pass | Owning B1-B6 stage | fixture-specific | fixture-specific | fixture-specific | Pending by stage |
| L8-TR-05 | L8 §§31-39 | Release blockers, evidence package, staged completion, Git recovery, and handoff rules are enforced | B1-B6 + release owner | `GATE-B*-*` | `GATE-B*-*` | `GATE-B*-*` | Logic closure provides documentation; no release authorized |

---

## 3. B1 stable fixture register

These IDs are mandatory before B1 can be settled.

| ID | Required behavior | Minimum layers |
|---|---|---|
| B1-LC-001 | Fresh supported page creates one runtime/root | A2, A3, A4 Chrome/Edge |
| B1-LC-002 | Repeated boot joins existing generation; no duplicate resources | A2, A3, A4 Chrome/Edge |
| B1-LC-003 | Visible-but-dead root is not READY | A2, A3, A4 Chrome/Edge |
| B1-LC-004 | Clearly owned orphan recovers; ambiguous ownership is not deleted | A2, A3, A4 Chrome/Edge |
| B1-LC-005 | Service-worker restart reuses the live runtime | A3, A4 Chrome/Edge |
| B1-LC-006 | Clean disable/re-enable retires the old Runtime Instance and boots one fresh generation | A2, A3, A4 Chrome/Edge |
| B1-LC-007 | Failed cleanup remains locked through boot-while-disabled/re-enable; a failed teardown-only retry stays locked; later teardown-only success reaches `UNINITIALIZED`; only then one fresh generation may allocate | A2 `UT-B1-LC-23`, A3 `IT-B1-LC-23`, A4 Chrome/Edge `*-23` |
| B1-LC-008 | BFCache restore revalidates without duplicate listeners | A3, A4 Chrome/Edge |
| B1-LC-009 | Stale callbacks/responses cannot publish health or mutate the current generation | A2, A3, A4 Chrome/Edge |
| B1-LC-010 | Legacy v0.7 timer stack is not injected or allowed to coexist | A1, A3, A4 Chrome/Edge |
| B1-LC-011 | Concurrent persistence probes use isolated keys and cannot interfere | A2, A3 |
| B1-LC-012 | Missing/malformed/unreadable runtime globals fail safely | A2, A3, A4 Chrome/Edge |
| B1-LC-013 | Unsupported documents and iframes do not acquire a runtime/root | A2, A3, A4 Chrome/Edge |
| B1-LC-014 | Removed root/dead interaction is detected and recovered or degraded automatically | A3, A4 Chrome/Edge |
| B1-LC-015 | Concurrent same-tab boot produces exactly one actual injection | A3, A4 Chrome/Edge |
| B1-LC-016 | Build/version mismatch requires a reload boundary, not hot stacking | A2, A3, A4 Chrome/Edge |
| B1-LC-017 | Chrome package identity and lifecycle evidence match the tested commit/bytes | A1, A4 Chrome |
| B1-LC-018 | Edge uses the same source/semantics and passes lifecycle parity | A1, A4 Edge |

---

## 4. Build-stage gate matrix

| Stage | A1 | A2 | A3 | A4 Chrome | A4 Edge | Current status |
|---|---|---|---|---|---|---|
| B1 Shell/Lifecycle | `GATE-B1-A1` required | `GATE-B1-A2` required | `GATE-B1-A3` required | `GATE-B1-A4-CH` required | `GATE-B1-A4-ED` required | `NOT_SETTLED / READY_FOR_REPAIR`; A4 pending |
| B2 State/Ledger/Bridge/Timer | `GATE-B2-A1` required | `GATE-B2-A2` required | `GATE-B2-A3` required | `GATE-B2-A4-CH` required | `GATE-B2-A4-ED` required | `BLOCKED`; draft quarantined |
| B3 Time Views/Workspace | `GATE-B3-A1` required | `GATE-B3-A2` required | `GATE-B3-A3` required | `GATE-B3-A4-CH` required | `GATE-B3-A4-ED` required | Deferred |
| B4 Data Safety/Files | `GATE-B4-A1` required | `GATE-B4-A2` required | `GATE-B4-A3` required | `GATE-B4-A4-CH` required | `GATE-B4-A4-ED` required | Deferred |
| B5 Settings/Themes/Support | `GATE-B5-A1` required | `GATE-B5-A2` required | `GATE-B5-A3` required | `GATE-B5-A4-CH` required | `GATE-B5-A4-ED` required | Deferred |
| B6 Full Acceptance/Candidate | `GATE-B6-A1` required | `GATE-B6-A2` required | `GATE-B6-A3` required | `GATE-B6-A4-CH` required | `GATE-B6-A4-ED` required | Deferred; reruns full applicable exact-byte suite |

A stage cannot be called settled while a required gate's workflow status is `PENDING`, even if later B6 will rerun the full suite. If browser execution is unavailable, the stage remains `NOT_SETTLED` and the gate has no executed result.

### Current B1 evidence disposition

| Gate | Remote B1 at `c0afb241...` | Local 12-file draft | Workflow status | Executed result |
|---|---|---|---|---|
| `GATE-B1-A1` | Workflow/package construction PASS for remote bytes | Not rebuilt or packaged | `PARTIAL` | none for current dirty bytes |
| `GATE-B1-A2` | Existing unit suite passes but omits the complete L1-AC-23 sequence | 46 synthetic tests pass, but a direct probe still violates L1-AC-23 | `PARTIAL` | `FAIL` |
| `GATE-B1-A3` | No complete content -> worker -> MAIN-world failed-cleanup proof | Not executed | `PENDING` | none |
| `GATE-B1-A4-CH` | No packaged Chrome lifecycle execution | Not executed | `PENDING` | none |
| `GATE-B1-A4-ED` | No packaged Edge parity execution | Not executed | `PENDING` | none |

The remote CI run remains useful historical implementation evidence. It cannot override the observed contract failure or certify different local bytes.

---

## 5. B2 quarantine requirements

| ID | Rule |
|---|---|
| Q-B2-01 | No implementation file or code from the local B2 draft is incorporated into B1 or planning documentation commits. Legitimate B2 specification text remains allowed. |
| Q-B2-02 | The local draft (24 files at the 2026-08-26 evidence checkpoint) remains `UNAPPROVED-DRAFT` until B1 is settled and `REVIEW B2` completes. |
| Q-B2-03 | `START B2` is required separately before any B2 edit, commit, or push. |
| Q-B2-04 | Isolated unit success cannot settle B2 without real extension integration and required A3/A4 evidence. |

---

## 6. Evidence record fields

Every completed gate must record:

- stable requirement and fixture ID;
- expected and actual result;
- workflow/evidence status;
- executed gate result (`PASS`, `FAIL`, or contract-permitted `NOT_APPLICABLE`) when execution exists;
- source commit SHA;
- workflow run/job where applicable;
- artifact filename and SHA-256 where applicable;
- manifest version/build identity;
- browser/version and isolated profile;
- clean-install or v0.7.1-upgrade profile;
- sanitized failure evidence;
- remaining proof boundary.

Rebuilding or modifying artifact bytes invalidates browser evidence for the previous bytes.
