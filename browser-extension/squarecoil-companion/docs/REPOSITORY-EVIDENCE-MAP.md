# SquareCoil Companion Repository Evidence Map

Status: **Canonical logic-closure evidence index**

Verified: **2026-08-26, America/New_York**

Repository: `Wakeup-gif/test_repo`
Project root: `browser-extension/squarecoil-companion/`

This document records what each source can prove, what it cannot prove, and how conflicts are resolved. It is authoritative at the Git commit containing it. Printed branch heads are verification checkpoints, not substitutes for a fresh remote check.

---

## 1. Source precedence

Use this order:

1. current verified Git state;
2. settled L0-L8 contracts;
3. `CODEX-IMPLEMENTATION-HANDOFF.md`;
4. approved implementation for the active build stage;
5. production v0.7.1 as behavioral evidence;
6. historical extension, Tampermonkey, conversation, and audit material;
7. local drafts as unapproved evidence only.

If two sources conflict, keep the conflict visible. Do not silently select the more convenient source.

Classification vocabulary:

```text
CANONICAL
PRODUCTION-BASELINE
IMPLEMENTATION-EVIDENCE
AUTHORIZATION-RECORD
HISTORICAL-REFERENCE
UNAPPROVED-DRAFT
CONFLICTING
IRRELEVANT
```

---

## 2. Verified Git checkpoint

| Ref | Verified head | Meaning |
|---|---|---|
| `main` | `9378da24f393b40066816133e7fa0f48063115f0` | Production v0.7.1 Chrome Interaction Recovery |
| `planning/squarecoil-companion-rebuild` | `20842abc973abd3ac0704f2cf18875007a8f07c5` | Audited pre-closure planning head |
| `rebuild/squarecoil-companion-b1-lifecycle` | `c0afb241d91141ed818d9395ac14257207ad59ed` | Current remote B1 evidence head |

Relationship at verification:

- `main` is the merge base and ancestor of both planning and B1;
- planning and B1 diverge after `82207dcdf2e7f4c6d8b346c787433574c75e0a38`;
- planning has one unique handoff commit after that point;
- B1 has sixteen unique commits after that point;
- no remote B2-or-later SquareCoil rebuild branch exists;
- no rebuild implementation has been promoted to `main`.

Relevant release refs:

| Ref | Head | Evidence |
|---|---|---|
| `release/squarecoil-companion` | `dafa73eda5c7a70dcf894e5834b41b2d334e38e8` | v0.7.1 release checkpoint |
| `release/squarecoil-companion-chrome` | `dafa73eda5c7a70dcf894e5834b41b2d334e38e8` | v0.7.1 Chrome release checkpoint |
| `release/squarecoil-companion-edge` | `dafa73eda5c7a70dcf894e5834b41b2d334e38e8` | v0.7.1 Edge release checkpoint |

No `package/*` branch exists. Older Edge release refs are historical release checkpoints, not rebuild inputs.

---

## 3. Evidence records

| ID | Source | Classification | What it proves | What it does not prove |
|---|---|---|---|---|
| EVID-001 | `logic/L0-INVARIANTS.md` through `logic/L8-ACCEPTANCE-HANDOFF.md` on planning | `CANONICAL` | Settled architecture, state, time, Bridge, UX, data-safety, settings, and acceptance contracts | Any implementation or browser result |
| EVID-002 | `docs/REBUILD-MASTER-PLAN.md` | `CANONICAL` | Structural ownership and staged architecture | Current B1 completion status by itself |
| EVID-003 | `docs/LOGIC-STAGE-PLAN.md` | `CANONICAL` | Logic-to-build dependency model | A test pass or stage settlement by itself |
| EVID-004 | Current `REBUILD-START-HERE.md` and `HANDOFF-NEXT-CHAT.md` after this closure | `CANONICAL` | Recovery order, current stage status, and next authorization | Implementation or browser acceptance by themselves |
| EVID-004-HIST | Pre-closure revisions of `REBUILD-START-HERE.md` and `HANDOFF-NEXT-CHAT.md` | `HISTORICAL-REFERENCE` + `CONFLICTING` | Prior recovery checkpoint and settled framework/logic | Their stale claim that B1 had not yet been implemented |
| EVID-005 | `main` source, `manifest.json`, `release.json`, and `CURRENT.md` | `PRODUCTION-BASELINE` | Actual production v0.7.1 source and version metadata | Rebuild design correctness or B1 acceptance |
| EVID-006 | Production `HANDOFF.md`, `README.md`, and `DOWNLOAD.md` | `HISTORICAL-REFERENCE` + `CONFLICTING` | v0.7.x behavior and release history | Current version wording; they still report v0.7.0 |
| EVID-007 | `CHROME-INTERACTION-DIAGNOSIS.md` | `HISTORICAL-REFERENCE` | Root existence is not readiness; stale-root and duplicate-runtime failure history | Proof that current B1 passes browser recovery |
| EVID-008 | Remote B1 source/tests/workflow at `c0afb241...` | `IMPLEMENTATION-EVIDENCE` | Concrete B1 implementation, static validation, unit-test and package behavior | Approval provenance for every commit or real browser acceptance |
| EVID-009 | B1 CI run `32927743411` | `IMPLEMENTATION-EVIDENCE` | Workflow completed successfully at the B1 head; tests/build/package jobs ran | Chrome/Edge interaction, service-worker recovery, BFCache, or parity |
| EVID-010 | `implementation/B1-SHELL-LIFECYCLE.md` | `IMPLEMENTATION-EVIDENCE` + `CONFLICTING` | Intended B1 design and recorded automated evidence | Its “Settled - ready for B2” claim; browser proof is absent and a teardown blocker remains |
| EVID-011 | `implementation/NEXT-CHAT-HANDOFF.md` | `IMPLEMENTATION-EVIDENCE` + `CONFLICTING` | Correctly says B1 still needs review and B2 must not start | Current head/run metadata; it cites an older B1 checkpoint |
| EVID-012 | Complete referenced `CSS Styling` conversation, 139 turns | `HISTORICAL-REFERENCE` | Historical authorization through B1 commit `fac68612010d31edd8167270da41b245b41dfcec`, ending “ready for review” | Authorization for fourteen later remote B1 commits, B1 settlement, local hardening, or B2 |
| EVID-013 | Legacy `timer-runtime.js`, controls, workspace, surface, and matching Tampermonkey lineage | `HISTORICAL-REFERENCE`; packaged main copies also `PRODUCTION-BASELINE` | Existing useful behavior and the multi-writer patch-chain failure history | Rebuild module ownership or retention-cap policy |
| EVID-014 | Attached superseded `L0-INVARIANTS(1).md` | `HISTORICAL-REFERENCE` | Earlier logic draft | Canonical L0; the Git version is later and settled |
| EVID-015 | Milestone DOM audits and associated screenshots | `HISTORICAL-REFERENCE` | Viewed project context can differ from SquareCoil clock context; known legacy structures | Current selector stability or B1/B2 acceptance |
| EVID-016 | File labelled Dashboard audit | `HISTORICAL-REFERENCE` + `CONFLICTING` | Generic shell/design-page evidence | Dashboard selectors; the captured URL is a Designs page |
| EVID-017 | Timer UI contrast audit and theme screenshots | `HISTORICAL-REFERENCE` | Legacy light-mode contrast and incomplete-theme defects | Broad accessibility pass for v0.7.1 or rebuild |
| EVID-018 | Unrelated agent/restore/theme branches | `IRRELEVANT` | Nothing within the rebuild evidence boundary | Any SquareCoil rebuild status |
| EVID-019 | Current control thread: explicit `START LOGIC` followed by approval of the SquareCoil Logic Closure plan | `AUTHORIZATION-RECORD` | Permission to edit the named documentation-only closure, commit it with the approved message, push planning, and perform remote verification | That any Git write or remote verification actually occurred; independent Git evidence is required, and it does not authorize B1/B2 source edits, promotion, or release |

Approval boundary: the referenced CSS Styling conversation authorized only the historical B1 work through `fac6861...` and ended at review. The current control thread separately authorized this documentation-only logic closure. No recovered instruction authorizes B1 repair, B2 implementation, production promotion, or release; the next valid action is `REVIEW B1`.

---

## 4. Local-draft quarantine

These files existed before logic closure and must not be swept into documentation work.

### Local B1 hardening

```text
branch: rebuild/squarecoil-companion-b1-lifecycle
head: c0afb241d91141ed818d9395ac14257207ad59ed
staged: 0
tracked modifications: 11
untracked files: 1
total: 12 files, +725/-19
classification: UNAPPROVED-DRAFT
```

The patch improves teardown registration, operation serialization, identity checks, and synthetic tests. It does not close the full failed-disable sequence described in L1-AC-23.

### Local B2 draft

```text
local branch: rebuild/squarecoil-companion-b2-core-timer
head: c0afb241d91141ed818d9395ac14257207ad59ed
remote branch: none
unique commits: 0
tracked modifications: 0
untracked files: 24
volume: 5,877 lines
classification: UNAPPROVED-DRAFT
```

The draft remains quarantined until B1 is settled, `REVIEW B2` completes, and `START B2` is given separately.

---

## 5. B1 proof boundary

Verified remotely:

- modular B1 source and generated runtime bundles exist;
- validation rejects injection of the legacy four timer scripts;
- automated B1 tests pass at the remote head;
- Chrome and Edge archives are created by CI;
- live B1 intentionally reports `DEGRADED / coordination-not-implemented-b1` until B2 supplies positive coordination.

Not verified:

- real packaged Chrome interaction;
- Edge lifecycle parity;
- service-worker restart nonduplication;
- popup disable/re-enable;
- BFCache restoration;
- listener/root/runtime counts after recovery;
- version/update transition behavior;
- the complete failed-cleanup lock sequence.

Confirmed blocker:

```text
READY / ENABLED
-> disable cleanup fails
-> FAILED / DISABLED / teardown-incomplete
-> boot is requested while disabled
-> failure must remain sticky and no initialization may run
-> re-enable must remain blocked until cleanup succeeds or a genuine reload replaces the document
-> a failed teardown-only retry stays locked
-> a successful teardown-only retry may reach UNINITIALIZED; only then may one fresh generation start
```

The current local draft instead permits the disabled boot path to rewrite the failure and later reacquire resources. B1 is therefore `NOT_SETTLED / READY_FOR_REPAIR`; browser acceptance is `PENDING`.

---

## 6. Acceptance evidence layers

| Layer | Proves | Does not prove |
|---|---|---|
| A1 Static / Package | manifests, generated syntax, archive contents, metadata | runtime interaction |
| A2 Unit | isolated deterministic module behavior | real cross-world/browser integration |
| A3 Integration | connected module/data-flow behavior in a controlled harness | packaged browser behavior |
| A4 Browser Smoke / Behavioral Acceptance | required behavior in the exact packaged artifact | another browser, profile, or rebuilt byte sequence unless separately tested |

Passing an earlier layer never substitutes for a later required layer. Every evidence record must identify the source commit, build/run, artifact, browser/profile when applicable, expected result, actual result, and proof boundary.

---

## 7. Conflict resolutions for current work

| Conflict | Resolution |
|---|---|
| Planning says B1 is next; B1 branch already exists | Planning contracts remain canonical; status becomes B1 under review/not settled |
| B1 stage record says settled; later handoff says review required | Use verified implementation plus acceptance evidence: B1 is not settled |
| CI/package success versus missing browser execution | Record remote package/A1 and unit-subset successes as bounded evidence only; current dirty bytes have no completed A1, full A2 is `PARTIAL / FAIL` because L1-AC-23 is violated, and A4 remains pending |
| OWNER and OBSERVER both exist versus “two runtimes” release blocker | Multiple documents may have one runtime each; only one fenced OWNER may write, and only one lifecycle runtime may exist per supported document |
| Production v0.7.1 metadata versus v0.7.0 prose | Treat manifest/release/CURRENT as production version truth; stale prose remains historical until separately authorized |
| Conversation reports B2 not started versus local B2 files | Remote B2 remains absent; local files are an unauthorized quarantined draft |

---

## 8. Sensitive evidence handling

Historical DOM audits and screenshots may contain employee, customer, job, URL, or operational data. Record only sanitized structural findings. Do not commit the attachments, raw page contents, customer identifiers, real job history, tokens, or account data to this repository.

---

## 9. Revalidation rule

Before any later review or implementation:

1. verify live remote heads;
2. inspect the active branch and local status;
3. re-read the canonical handoff and applicable contracts;
4. compare CI evidence to the exact current commit;
5. treat any drift as new evidence and repeat the affected read-only review;
6. never infer approval, browser success, or release readiness from a commit title, started workflow, or archive creation.
