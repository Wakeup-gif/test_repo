# SquareCoil Companion — Canonical Codex Implementation Handoff

Status: **Logic closure complete; implementation authorization not active**

Current implementation gate: **B1 NOT_SETTLED / READY_FOR_REPAIR**

Browser acceptance: **PENDING**
B2: **BLOCKED / UNAPPROVED-DRAFT**

Next authorization required: **`REVIEW B1`**

This file is authoritative at the Git commit containing it. Verify live remote heads before acting; do not assume a printed SHA is still current.

---

## 1. Repository and verified checkpoint

```text
repository: Wakeup-gif/test_repo
project: browser-extension/squarecoil-companion/
production: main
planning: planning/squarecoil-companion-rebuild
B1 implementation: rebuild/squarecoil-companion-b1-lifecycle
```

Verified before logic closure on 2026-08-26:

| Ref | Head |
|---|---|
| `main` | `9378da24f393b40066816133e7fa0f48063115f0` |
| planning audited base | `20842abc973abd3ac0704f2cf18875007a8f07c5` |
| B1 | `c0afb241d91141ed818d9395ac14257207ad59ed` |

Production remains v0.7.1 Chrome Interaction Recovery. No rebuild implementation is on `main`. Reverify all three refs before every later phase.

---

## 2. Required reading order

Read completely, in order:

1. `HANDOFF-NEXT-CHAT.md`
2. `REBUILD-START-HERE.md`
3. `docs/REPOSITORY-EVIDENCE-MAP.md`
4. `docs/LOGIC-TRACEABILITY-MATRIX.md`
5. `CODEX-IMPLEMENTATION-HANDOFF.md`
6. `docs/REBUILD-MASTER-PLAN.md`
7. `docs/LOGIC-STAGE-PLAN.md`
8. `logic/L0-INVARIANTS.md`
9. `logic/L1-LIFECYCLE.md`
10. `logic/L2-STATE-TIME-MIGRATION.md`
11. `logic/L3-SQUARECOIL-BRIDGE.md`
12. `logic/L4-TIMER-BEHAVIOR.md`
13. `logic/L5-TIME-VIEWS-WORKSPACE.md`
14. `logic/L6-DATA-SAFETY-BACKUP.md`
15. `logic/L7-SETTINGS-SUPPORT-THEMES.md`
16. `logic/L8-ACCEPTANCE-HANDOFF.md`
17. B1 implementation handoff/stage records and actual source/tests.
18. `HANDOFF.md` and `CHROME-INTERACTION-DIAGNOSIS.md` as historical production evidence.

Legacy extension files, Tampermonkey sources, conversations, and attachments are evidence only and do not outrank the contracts above.

---

## 3. Authority and proof boundaries

Precedence:

1. verified current Git state;
2. settled L0-L8 contracts;
3. this handoff;
4. approved implementation for the active stage;
5. production v0.7.1 behavior;
6. historical sources;
7. local drafts.

Keep these proof layers separate:

```text
A1 static/package
A2 unit
A3 integration
A4 packaged browser behavioral acceptance
```

A workflow starting is not a pass. A ZIP existing is not browser acceptance. Chrome success is not Edge parity. Rebuilt bytes are not certified by evidence for earlier bytes.

---

## 4. Product and architecture invariants

- one Timer State owner;
- one Time Ledger;
- one UI renderer/router;
- one Lifecycle Coordinator per supported top-level document;
- one read-only SquareCoil Bridge;
- exactly one fenced authoritative writer across coordinated tabs;
- OBSERVER runtimes may read and route commands but may not write;
- modular source with consolidated runtime ownership;
- shared Chrome/Edge source and behavior;
- GitHub is the development/release source of truth.

SquareCoil remains authoritative for the company clock. Companion must never silently invoke native SquareCoil clock mutation, fabricate or backfill unverified time, restore fake live state, or silently prune authoritative history.

The UX must always make clear:

- the viewed job/context;
- the actual running/pending/paused context;
- Today time;
- Job/Context Total;
- today/this-week work;
- where Recent, History, Archives, Backup, reports, Settings, and Support live.

---

## 5. Exact authorization vocabulary

Authorization never carries between stages.

| Command | Scope |
|---|---|
| `REVIEW B1` | Read-only B1 inspection and proposed repair slice |
| `START B1` | Only the approved B1 repair slice, including tests/commit/push |
| `REVIEW B2` | Read-only review of the quarantined B2 draft after B1 is settled |
| `START B2` | Only the approved B2 implementation slice |
| `REVIEW B3`, `REVIEW B4`, `REVIEW B5`, `REVIEW B6` | Read-only review of that named stage after its prior dependencies are settled |
| `START B3`, `START B4`, `START B5`, `START B6` | Only that named stage |
| `REVIEW LOGIC AMENDMENT: <scope>` | Read-only review of one named contradiction and a proposed canonical-document/regression-mapping amendment |
| `START LOGIC AMENDMENT: <scope>` | Only the same specifically reviewed canonical-document amendment; no runtime/source implementation |
| `PROMOTE TO MAIN` | Separately approved production promotion |
| `CREATE RELEASE` | Separately approved release creation/publication |

Bare `start` or `review`, and general phrases such as “continue,” “proceed,” “go ahead,” “resume,” “pick it up,” or “keep working,” are not implementation authorization.

For a logic amendment, replace `<scope>` with the named owning contract and contradiction; the prefix alone is insufficient. `START B1` or any other build-stage command does not authorize edits to settled canonical logic. After an amendment, the affected implementation stage must be reviewed again and receive its exact `START Bn` authorization before source work resumes.

After this logic-closure commit, the next required authorization is `REVIEW B1`.

---

## 6. Current B1 state

Historical conversation authorization reached B1 commit:

`fac68612010d31edd8167270da41b245b41dfcec`

That checkpoint ended “CI green, ready for review; B2 has not started.” The current remote B1 head is fourteen commits later at `c0afb241...`. Those commits are implementation evidence, but the referenced conversation does not establish their approval or browser acceptance.

Remote B1 evidence:

- modular shell/lifecycle implementation exists;
- workflow run `32927743411` completed successfully at the current B1 head;
- the workflow runs automated checks, builds generated JavaScript, creates Chrome/Edge archives, and uploads artifacts;
- the rebuild manifest uses generated runtime bundles;
- validation rejects injection of the legacy v0.7 timer stack;
- real B2 coordination is not implemented, so `DEGRADED / coordination-not-implemented-b1` is intentionally truthful.

Remote evidence does not prove packaged Chrome/Edge interaction.

### Confirmed failed-cleanup blocker

Required behavior:

```text
1. Disable starts from a live initialized runtime.
2. At least one safety-critical cleanup fails.
3. State becomes FAILED / teardown-incomplete; mode remains DISABLED.
4. Boot while disabled returns the same failure.
5. Re-enable returns the same failure.
6. While cleanup remains unresolved, ensure/init/inject/root/listener counts do not increase.
7. A failed teardown-only cleanup retry remains locked; a later successful teardown-only retry reaches `UNINITIALIZED`.
8. Only after that success—or in a genuine new document—may exactly one fresh generation initialize.
```

Current behavior can rewrite the failure to `UNINITIALIZED / user-disabled` during disabled boot and later allocate a replacement generation. That violates the Teardown Lock and no-stacking invariant. Fixture L1-AC-23 and its A2/A3/A4 evidence are mandatory.

### Local B1 draft

```text
11 modified tracked files
1 untracked test
12 files total
725 added/new lines
19 deleted lines
0 staged files
classification: UNAPPROVED-DRAFT
```

It strengthens cleanup registration, identity checks, operation serialization, and tests, but still fails the exact disabled-boot sequence. It has not been rebuilt, packaged, or tested in Chrome/Edge as current dirty bytes. Preserve it until `REVIEW B1`; do not commit or discard it during documentation work.

### B1 review/repair boundary

The first approved repair slice should remain B1-only:

- make `FAILED / teardown-incomplete` sticky across disabled boot, revalidate, recover, and re-enable;
- retain cleanup ownership until actual teardown success;
- reject missing safety-critical teardown paths;
- distinguish teardown-only cleanup retry from generic Retry/recover and prove failure-then-success retry behavior;
- prohibit replacement generation/global deletion until exact clean retirement;
- add the complete L1-AC-23 unit, integration, Chrome, and Edge cases;
- close strict orphan-ownership, supported-document/iframe, same-tab injection, and automatic dead-root detection gaps;
- preserve `DEGRADED / coordination-not-implemented-b1`;
- exclude Timer State, Ledger, migration, Bridge semantics, and B2 coordination.

B1 cannot be settled without all applicable B1 gates in `docs/LOGIC-TRACEABILITY-MATRIX.md`, including packaged Chrome and Edge lifecycle acceptance.

---

## 7. B2 quarantine

No remote B2 branch exists. A local branch named `rebuild/squarecoil-companion-b2-core-timer` points at the B1 head and has no unique commits. It contains 24 untracked files and 5,877 lines.

Classification: `UNAPPROVED-DRAFT / QUARANTINED`.

Do not copy, wire, stage, commit, package, or count those files as acceptance until B1 is settled and the user separately gives `REVIEW B2`, then `START B2` for an approved slice.

Required B2 backlog:

1. connect timer, ledger, migration, coordination, and Bridge modules to the real extension;
2. make writer ownership verification and authoritative commit indivisible;
3. prevent fabricated time after crashes and restarts;
4. restrict Bridge evidence to audited structures;
5. convert conflicting evidence into `STATE_CONFLICT`;
6. complete native action-2 confirmation and disproof;
7. bound missing and uncertain evidence;
8. make migration atomic, independent, idempotent, and retry-safe;
9. prevent doubled legacy totals;
10. finalize active Companion time exactly once during disable;
11. add controlled-reload checkpoints and reject late events;
12. strengthen schema validation and bound receipt housekeeping;
13. add real extension integration and browser coverage for Bridge -> Timer -> Ledger -> displayed totals, coordination, takeover, restart, migration, persistence failure, disable finalization, late events, and synchronized read models.

The B2 core read model is limited to immutable L2-L4 service snapshots, queries, and core action interfaces. L5/B3 routes and presentation views—Recent, Time Overview, History, Context Detail, Archives, and workspace navigation—remain B3.

---

## 8. Stage sequence

```text
B1 Shell / Lifecycle
B2 State / Ledger / Bridge / Core Timer
B3 Time Views / Workspace
B4 Data Safety / Files
B5 Settings / Themes / Support
B6 Full Acceptance / Candidate Packaging
```

Later specifications never authorize premature implementation. Every stage requires its own review and exact `START` authorization.

---

## 9. Git and write-proof rules

Before editing:

1. verify live remote heads;
2. inspect active branch, HEAD, upstream, staged, unstaged, and untracked files;
3. preserve unrelated/local draft work;
4. read the canonical contracts and actual source;
5. stop if evidence materially drifted.

Before committing:

- inspect the complete diff;
- prove only approved files/scope changed;
- run required tests and package checks;
- scan for later-stage leakage and sensitive data;
- keep `main` untouched.

After committing/pushing:

- verify local commit SHA;
- verify the remote branch SHA independently;
- read back critical pushed files;
- inspect the completed workflow rather than its start event;
- record exact artifact identity when applicable;
- never claim success beyond the evidence layer actually executed.

---

## 10. Chrome and Edge delivery gates

Chrome and Edge must come from the same accepted source commit. Required delivery evidence includes:

- source commit SHA;
- manifest and permission review;
- Chrome package filename and SHA-256;
- Edge package filename and SHA-256;
- package-content validation;
- exact-byte Chrome browser acceptance;
- exact-byte Edge parity acceptance;
- clean-install profile;
- v0.7.1 upgrade/migration profile;
- backup/restore testing where applicable;
- release notes and known limitations.

Do not promote without `PROMOTE TO MAIN`. Do not create or publish a release without `CREATE RELEASE`.

---

## 11. Stop conditions

Stop the active stage if any of these occurs:

- remote heads or evidence materially change after review;
- the requested action lacks the exact phase authorization;
- unresolved cleanup ownership or runtime identity ambiguity remains;
- a diff includes later-stage, production, or unrelated work;
- tests, build, package, or browser evidence fail;
- artifact identity does not match the tested commit/bytes;
- Chrome/Edge parity is inferred rather than executed;
- implementation contradicts settled logic;
- sensitive production/customer data would be committed;
- a required Git write cannot be independently verified.

Do not solve a contradiction by silently weakening the contract. Return to the owning logic document, obtain `REVIEW LOGIC AMENDMENT: <scope>`, then `START LOGIC AMENDMENT: <same scope>` before editing canonical logic, add regression mapping/coverage, and require the affected stage's review and exact `START Bn` authorization again before source work resumes.
