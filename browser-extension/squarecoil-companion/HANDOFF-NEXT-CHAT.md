# SquareCoil Companion — Comprehensive Next-Chat Handoff

> **Paste this document into a new ChatGPT chat, or tell the new chat to open this file from GitHub. Read it completely before changing code.**

## 0. Role and mission

You are taking over an ongoing maintained software project called **SquareCoil Companion** for the internal US Sign & Mill SquareCoil site:

`https://ussignandmill.squarecoil.net/*`

The user is rebuilding an existing Manifest V3 browser extension into a stable, modular, easy-to-update Chrome/Edge product. This is not a greenfield toy extension and not just a CSS theme. Preserve the behavior and UX decisions already settled, but do **not** preserve the fragile v0.7.x architecture that caused Chrome/Edge interaction failures.

Your job is to continue from the canonical GitHub specifications, implement in stages, test each stage, preserve user data, and keep production `main` untouched until the rebuilt extension passes its release gates.

Do not ask the user to restate the project. Recover context from GitHub first.

---

# 1. GitHub source of truth

Repository:

`Wakeup-gif/test_repo`

Canonical extension directory:

`browser-extension/squarecoil-companion/`

Planning/specification branch:

`planning/squarecoil-companion-rebuild`

Audited planning base before logic closure:

`20842abc973abd3ac0704f2cf18875007a8f07c5`

Verified B1 implementation head before logic closure:

`c0afb241d91141ed818d9395ac14257207ad59ed`

Production branch:

`main`

Verified production baseline:

`9378da24f393b40066816133e7fa0f48063115f0`

Production package:

`v0.7.1 Chrome Interaction Recovery`

**Important:** production `main` is intentionally still the old v0.7.1 implementation. Planning and settled logic are on the planning branch. Do not rewrite production `main` merely because the rebuild specs are finished.

Before doing anything, re-fetch planning, B1, and `main` because commits may have advanced after this handoff was written.

---

# 2. Current exact resume point

The rebuild framework and detailed logic are **complete and settled through L8**, and the logic-closure evidence/traceability package is present.

B1 already exists. It is **NOT_SETTLED / READY_FOR_REPAIR**. Its packaged Chrome/Edge lifecycle acceptance is **PENDING**, and B2 is **BLOCKED / UNAPPROVED-DRAFT**.

Do **not** restart logic at L6 or L7 just because an older conversation summary says that. The canonical `REBUILD-START-HERE.md` and `logic/L8-ACCEPTANCE-HANDOFF.md` now establish:

```text
Framework: settled
Logic: L0-L8 settled
Logic closure: complete
B1: NOT_SETTLED / READY_FOR_REPAIR
B1 browser acceptance: PENDING
B2: BLOCKED
Next authorization: REVIEW B1
```

No rebuild implementation has yet been promoted to production `main`.

---

# 3. Read these files before changing code

Use the GitHub connector whenever available. Read the planning branch, not stale chat copies.

Read in this order:

1. `browser-extension/squarecoil-companion/HANDOFF-NEXT-CHAT.md`
2. `browser-extension/squarecoil-companion/REBUILD-START-HERE.md`
3. `browser-extension/squarecoil-companion/docs/REPOSITORY-EVIDENCE-MAP.md`
4. `browser-extension/squarecoil-companion/docs/LOGIC-TRACEABILITY-MATRIX.md`
5. `browser-extension/squarecoil-companion/CODEX-IMPLEMENTATION-HANDOFF.md`
6. `browser-extension/squarecoil-companion/docs/REBUILD-MASTER-PLAN.md`
7. `browser-extension/squarecoil-companion/docs/LOGIC-STAGE-PLAN.md`
8. `browser-extension/squarecoil-companion/logic/L0-INVARIANTS.md`
9. `browser-extension/squarecoil-companion/logic/L1-LIFECYCLE.md`
10. `browser-extension/squarecoil-companion/logic/L2-STATE-TIME-MIGRATION.md`
11. `browser-extension/squarecoil-companion/logic/L3-SQUARECOIL-BRIDGE.md`
12. `browser-extension/squarecoil-companion/logic/L4-TIMER-BEHAVIOR.md`
13. `browser-extension/squarecoil-companion/logic/L5-TIME-VIEWS-WORKSPACE.md`
14. `browser-extension/squarecoil-companion/logic/L6-DATA-SAFETY-BACKUP.md`
15. `browser-extension/squarecoil-companion/logic/L7-SETTINGS-SUPPORT-THEMES.md`
16. `browser-extension/squarecoil-companion/logic/L8-ACCEPTANCE-HANDOFF.md`
17. B1 implementation handoff/stage records and actual source/tests.
18. `browser-extension/squarecoil-companion/HANDOFF.md` and `CHROME-INTERACTION-DIAGNOSIS.md` as historical production evidence.

`HANDOFF.md` is historical v0.7.x source context. It is useful evidence but **does not outrank the rebuild Master Plan or L0-L8**.

---

# 4. How to work with GitHub on this project

## Before every implementation session

1. Fetch `planning/squarecoil-companion-rebuild`, `rebuild/squarecoil-companion-b1-lifecycle`, and `main` heads.
2. Confirm production `main` has not unexpectedly moved.
3. Read `REBUILD-START-HERE.md` and the logic files applicable to the build stage.
4. Fetch the actual source files you intend to change.
5. Search the repository for related modules/selectors/functions before adding new ownership.
6. Identify the correct module owner before editing.

## Branch strategy

Treat `planning/squarecoil-companion-rebuild` as the recoverable specification checkpoint.

The existing B1 implementation branch is:

`rebuild/squarecoil-companion-b1-lifecycle`

Do not create a second B1 branch or write implementation to planning or production `main`. Inspect the existing B1 worktree and preserve its unapproved local changes during `REVIEW B1`.

## During implementation

- Commit small coherent changes.
- Keep modules within their settled ownership boundaries.
- Add/update tests alongside behavior.
- Do not silently reinterpret a settled logic contract to make code easier.
- If implementation exposes a contradiction, stop, document it, amend the owning logic contract deliberately, add regression coverage, then resume.
- Re-fetch the committed canonical file after a write when correctness matters.
- Never say a GitHub change was committed unless the GitHub write actually succeeded.
- Never say a build/release passed because a workflow merely started; inspect its result.

## Production promotion

Do not merge/promote the rebuild to production `main` until the appropriate L8 acceptance gates pass. The package bytes that pass browser acceptance must be the same artifact bytes promoted as the candidate/release.

---

# 5. Why the rebuild exists

The v0.7.x feature set became useful but structurally fragile.

The old interactive stack was effectively:

```text
theme-controller.js
  -> background.js injection
  -> timer-runtime.js
  -> timer-controls.js
  -> timer-workspace.js
  -> timer-surface.js
```

Problems included:

- multiple scripts patching the same timer/Settings DOM;
- more than one state writer touching timer JSON;
- timer root existence being treated as proof the runtime was healthy;
- visible-but-dead widgets in Chrome/Edge;
- no complete lifecycle/teardown ownership;
- service-worker/runtime recovery races;
- additive patch layers creating regressions;
- package/syntax CI being mistaken for actual browser interaction testing;
- historical session/archive caps risking loss of detailed time history.

The rebuild preserves the useful behavior but replaces this architecture.

---

# 6. Target architecture

Core rule:

> **One state owner. One UI owner. One application lifecycle. Feature modules communicate through services/events, not by patching one another's DOM or JSON.**

Target shape:

```text
Browser Extension Shell
  Manifest / permissions
  Background service worker
  Popup
  Browser preferences/platform adapter
  Release/update integration
            |
            v
Companion Application
  Core
    App Controller
    Lifecycle Coordinator
    Feature Registry / Event Bus

  State/Data
    Shared Timer State
    Time Ledger
    Job/Context Index
    Preferences
    Migrations
    Recovery Checkpoint

  SquareCoil Bridge
    Clock observer
    Server verifier
    Context parser

  Feature Services
    Timer
    Job Navigation
    Recent Jobs
    Time Overview
    History
    Activity
    Archive
    Backup / Restore
    History CSV
    Time Reporting
    Themes
    Support / Feedback
    Developer Support

  UI
    Single renderer
    Single Settings router
    Components / styles
```

Source should be modular for development and tests, but the built runtime should have consolidated ownership rather than re-creating many independent scripts that all mutate one application.

Chrome and Edge should share one application source. Browser adapters may normalize platform mechanics but may not change timer/time/history semantics.

---

# 7. Product scope and user-facing features

The rebuilt Companion is a lightweight SquareCoil work/time companion. It should help users understand work quickly without making them learn timer internals.

Primary user questions the UX must answer:

1. What job/context am I looking at?
2. How much Companion-recorded time do I have on it **today**?
3. How much Companion-recorded time do I have on it **overall**?
4. What is actually running/pending/paused right now?
5. What did I work on today/this week?
6. Where are Recent Jobs, History, Archives, backups, reports, and support?

Major features in scope:

- SquareCoil context observation;
- Job + Production General contexts;
- Companion timer with Today + Job/Context Total;
- recent Chrome-like job tabs;
- tab selection, reorder, hide/overflow;
- Pause / Resume;
- remembered-job Pending -> Resume / Start Fresh;
- History and Time Overview;
- By Day / By Job views;
- direct Open Job and local job lookup;
- Archive / Restore;
- Clear Recent;
- explicit Delete / Wipe operations;
- Full Backup JSON;
- History CSV export/import;
- human-readable Time Report CSV;
- Light / Dark / Auto timer appearance;
- Solid / Glass panel finish;
- Original / Refined Light / Sleek Dark website themes;
- dark-theme custom logo;
- Support ticket / Feedback via user's mail client;
- Copy Diagnostics with privacy whitelist;
- optional Support the Developer page;
- GitHub-driven version/build/release workflow;
- Chrome-first acceptance, then Edge parity.

---

# 8. Non-negotiable behavioral invariants

- SquareCoil is authoritative for the real company clock/context.
- Companion time is informational local history, not official payroll/timecard truth.
- Companion must never silently clock a user into/out of SquareCoil.
- At most one logical Companion Context accrues at a time in one Companion data scope.
- UI selection never creates/stops time.
- Tabs are workspace/navigation, not concurrent clocks.
- Same project ID + changed department/label remains the same Job Context.
- Missed/unverified elapsed time is never invented.
- A current running contribution is counted exactly once.
- Historical/display rounding never mutates authoritative precision.
- Authoritative time is not silently pruned due to list/session/archive caps.
- Routine housekeeping is non-destructive to time.
- Archive preserves time.
- Clear Recent preserves time.
- Restore/import cannot claim a live SquareCoil/Companion state from file contents.
- Chrome and Edge use the same behavioral contracts.
- Theme/logo/Glass/support failures cannot own timer health.

---

# 9. Settled logic summary L0-L8

## L0 — vocabulary/invariants

Defines SquareCoil authoritative clock, Context/Job/General, Selected/Observed/Active/Pending, Start Fresh, Local Pause, Current/Historical Session, Time Ledger, Today, Job/Context Total, Recent/Archive/Delete/Wipe, Activity Log, Full Backup, History CSV, Time Report CSV, Runtime State, Recovery Checkpoint, and restorable historical state.

Key rules:

- Start Fresh starts a new tracking cycle but preserves prior time/Job Total.
- Recovery Checkpoint is evidence, never permission to restore live state.
- Generic `Paused` is presentation wording; underlying state remains explicit.
- legacy totals may be preserved without fabricating timestamped history.

## L1 — lifecycle/browser boot

Canonical states:

```text
UNINITIALIZED
BOOTING
READY
DEGRADED
RECOVERING
FAILED
```

Separate Application Mode `ENABLED | DISABLED`.

READY requires actual healthy runtime ownership, not just DOM:

- one lifecycle owner;
- valid Runtime Instance ID/build identity;
- exactly one owned root;
- working core interaction controller;
- persistence available;
- SquareCoil Bridge initialized;
- core feature registry initialized;
- idempotent teardown registered;
- positive cross-tab/accrual ownership safety result.

Important:

- orphan root can be recovered;
- ambiguous multiple owners -> reload required;
- legacy v0.7 runtime and rebuilt runtime may not coexist in a live document;
- build/version mismatch -> reload boundary, no hot layer stacking;
- service-worker memory is not authoritative;
- BFCache/reloads revalidate ownership;
- Teardown Lock prevents boot during teardown;
- automatic recovery bounded to three attempts (default timing tunable).

## L2 — state/time/coordination/migration

Data layers:

```text
Shared Timer State
Time Ledger
Job/Context Index
Runtime View State
```

Active, Pending, Local Pause are mutually exclusive committed timing states.

Per-tab Selected Context is view state and never changes shared timing by itself.

Time Ledger is authoritative completed time. Cached totals are rebuildable only.

Time rules:

- integer milliseconds authoritative;
- persisted IANA Workday Time Zone;
- explicit UTC fallback if a valid zone cannot be obtained;
- local midnight splits sessions into day segments;
- DST uses real elapsed milliseconds;
- initial This Week policy starts Monday 00:00;
- Today excludes legacy unattributed time;
- Job/Context Total may include legacy unattributed balance;
- current active contribution is virtual until finalized and cannot double-count.

Legacy migration:

- `ussign-squarecoil-job-timer-v1`
- `ussign-squarecoil-job-timer-archive-v1`
- `ussign-squarecoil-job-timer-activity-v1`

Old detailed sessions may have been pruned. Preserve trustworthy accumulated totals using `legacyUnattributedMs`; never manufacture fake dated sessions to make old totals balance.

Cross-tab model:

- one authoritative writer OWNER;
- other tabs OBSERVER_CONNECTED;
- fencing tokens/epochs prevent stale writer commits;
- ownership transfer itself does not start/end/reset a timer session.

## L3 — SquareCoil Bridge

Bridge is read-only with respect to native SquareCoil clock mutation.

Known native action classification:

```text
action 1  open clock-in flow/modal hint
action 2  full company clock-out mutation
action 3  clock into/change project/department mutation
action 4  leave project context mutation
action 5  department metadata
action 7  read-only current header/context snapshot
action 8/9/12/13/14 modal/validation helpers
action 19 remaining-time UI, not clock-context authority
```

Native clicks are hints only. Successful relevant native mutation completion creates a bounded Transition Candidate; resulting state must still be reconciled with fresh evidence.

Evidence may come from:

- native action completion;
- action-7 read-only server snapshot;
- audited clock-specific DOM;
- passive click hints.

Key DOM selectors:

```text
#clockin
#clockout
#clockin-debug
#clockin-remaining-time
.timeclock-container
```

Important audited fact: `data-time` can be `||` / `||||` while a valid Job or `Production (General)` is active. Never use empty `data-time` as clock-out evidence.

Normalized observations/events distinguish:

- CONTEXT;
- CLOCKED_OUT;
- NO_TRACKABLE_CONTEXT;
- STATE_UNKNOWN;
- STATE_CONFLICT;
- context detected/changed/verified/metadata updated/left.

`Production (General)` with `project.php?id=0` is a stable General Context, never `job:0`.

Same-project department change is metadata/verification, not a time boundary.

Distinct native action 4 then action 3 remain two real boundaries if both occurred; do not coalesce real no-context gaps.

Bridge teardown must invalidate observers/listeners/heartbeats/in-flight request generations/candidates so ghost callbacks cannot survive restart.

## L4 — core timer behavior

New zero-history current Context may auto-start from a safe evidence boundary.

A remembered Context with historical time enters Pending and offers:

```text
Resume
Start Fresh
```

Pending retroactive anchoring is allowed only while verification continuity remains safe. Long unverified gaps are not backfilled.

Resume continues the existing logical cycle from a safe anchor.

Start Fresh creates a new cycle from a safe anchor while preserving previous history/Job Total.

Local Pause:

- Companion-only;
- SquareCoil clock unchanged;
- finalizes only validated/evidence-backed time;
- same Context does not automatically restart while Local Pause applies.

Local Resume requires current compatible SquareCoil Context.

Unknown/conflict uses short provisional grace and, if uncertainty persists, shared authoritative Safety Hold at a safe evidence boundary.

Strong unconfirmed action-2 evidence is conservative: do not keep accruing blindly. If the same job later appears, do not assume uninterrupted continuity; the user may have clocked out and re-entered the same job.

Controlled page reload/teardown is not itself a work boundary. Recovery Checkpoint + fresh SquareCoil verification reconcile continuity.

Provenance separates:

```text
startCause: new-context, resume, start-fresh, local-resume, recovery, ...
endReason: context-switch, context-left, clock-out, local-pause, conservative-end, companion-disabled, ...
```

Timer warning thresholds use **Today**, not lifetime Job Total.

## L5 — time views/workspace/history/navigation

Main expanded timer is Today-first:

```text
Selected Context identity
TODAY
<time>
Job Total / Context Total
<time>
status/actions
```

Selected Context may differ from Operational Context. A persistent **Current Context Strip** identifies actual Active/Pending/Local-Paused/Safety-Hold context when the user inspects another job.

Presentation statuses include distinct states such as:

- RUNNING;
- RUNNING_PROVISIONAL;
- VERIFICATION_HOLD;
- AWAITING_CHOICE;
- LOCALLY_PAUSED;
- NOT_RUNNING.

Provisional markers apply only to values containing provisional contribution. Async views are revision-aware; stale results cannot overwrite newer totals.

Tabs:

- single-click select;
- double-click expand;
- user reorder persists;
- target five visible numbered jobs by default;
- five is a soft convenience cap, not a safety limit;
- protected/current/selected contexts may force temporary extra visibility;
- Production General does not consume a numbered-job slot.

Recent is workspace membership, not historical retention.

Time Overview includes Today, This Week, Today by Context, By Day, By Job, Context Detail.

History is session-centric and may safely reconstruct midnight-split ledger pieces from the same logical Session. Large history loads incrementally but retrieval pagination may never become a data-retention cap.

Open Job uses `/project.php?id=<id>` for numbered jobs and has no timing side effects.

## L6 — archive/housekeeping/backup/restore/CSV

Data operations are classified and serialized through a **Data Mutation Lock** coordinated with the L2 writer.

Final Clear Recent semantics:

```text
Recent -> INACTIVE_NON_RECENT
```

It does **not** Archive and does not delete history. Cleared contexts remain findable in History/By Context/search.

Archive:

```text
Recent -> Archived
Restore Archive -> Recent
```

Archive always preserves Ledger/balances/totals/history.

Delete Job Data is explicit permanent deletion of that inactive Context's Companion-owned history/metadata/provenance, with protection + confirmation. It never deletes official SquareCoil data.

Wipe All Time History removes all Ledger + legacy unattributed time but preserves preferences and Context/workspace metadata. After wipe, fresh SquareCoil verification evaluates current context as zero-history from a fresh anchor.

Activity Log may be bounded/pruned; authoritative Time Ledger may not be silently pruned.

Full Backup JSON is primary disaster recovery. Logical envelope includes schema/app/version/revision/counts/workday zone/contexts/ledger/legacy balances/workspace/preferences/migration metadata and non-live recovery evidence where applicable.

Backup never restores live Active/Pending/LocalPause/SafetyHold/lease/lifecycle state.

Restore pipeline:

```text
File
-> Parser
-> Schema Validator
-> Migration Adapter
-> Internal Invariant Validator
-> Recovery Evidence Normalizer
-> Dedupe Analyzer
-> Temporal-Overlap Analyzer
-> Conflict Analyzer
-> Staged Restore Plan
-> User Decision
-> Data Mutation Lock
-> Protection/Revision Recheck
-> Atomic Commit
-> Requery
-> Fresh SquareCoil Verification
```

Restore modes:

- MERGE default;
- REPLACE destructive and requires timer quiescence + stronger confirmation + backup opportunity.

Imported/restored history may never silently create overlapping simultaneous time across contexts. Conflicts are staged/rejected, not trimmed or guessed.

History CSV is portable history/import. Time Report CSV is human-readable reporting. They are separate from Full Backup.

CSV/report exports must protect against spreadsheet formula injection for text beginning with `=`, `+`, `-`, `@`.

## L7 — Settings/themes/support

One Settings router; no DOM patch chain.

Routes include:

```text
SETTINGS_HOME
RECENT_JOBS
TIME_OVERVIEW
HISTORY
ACTIVITY_LOG
ARCHIVES_BACKUP
WEBSITE_THEME
TIMER_LIMITS
SUBMIT_TICKET
SEND_FEEDBACK
DEVELOPER_SUPPORT
```

Settings Home groups:

```text
TIMER APPEARANCE: Light | Dark | Auto
PANEL FINISH: Solid | Glass / Blur
LIBRARY: Recent / Time Overview / History / Activity / Archives & Backup
SQUARECOIL: Website Theme
TIMER LIMITS: Yellow / Orange / Red
SUPPORT: Submit a Ticket / Send Feedback
ABOUT: Support the Developer
```

First-install defaults:

- Timer appearance = Light;
- Panel finish = Solid;
- Website theme = Original;
- timer enabled.

Website themes:

- Original: native SquareCoil paint;
- Refined Light: polished readable native-like light mode;
- Sleek Dark: graphite/neutral dark mode with readable contrast and no ugly white border halos.

Dark custom logo applies to Sleek Dark. Refined Light/Original use native logo until the user supplies an approved light logo.

Support:

- Submit Ticket / Feedback;
- initial mail-client transport to `cristian@ussignandmill.com`;
- user sees composed content before sending;
- diagnostics opt-in + privacy whitelist;
- Copy Diagnostics;
- no silent network submission;
- do not auto-include customer/project/private URLs/history/notes.

Developer Support:

- optional Support the Developer page;
- Buy Me a Coffee external link;
- Cash App cashtag + QR + Copy;
- playful/quasi-silly copy allowed;
- app is free, updates are free, tips never required;
- no paywall, nagging, donation tracking, or payment processing.

## L8 — failure/acceptance/implementation handoff

Safety priority:

```text
1 data integrity
2 duplicate/fabricated time prevention
3 SquareCoil authoritative truth
4 one-owner lifecycle/recovery
5 core timer when safe
6 historical data access
7 UI convenience
8 presentation/support polish
```

Failure classes F0-F5 separate data integrity/accrual/runtime/feature/presentation/external transport failures.

Acceptance layers:

```text
A1 Static / Package
A2 Unit
A3 Integration
A4 Browser Smoke / Behavioral Acceptance
```

A1 success never substitutes for A4 interaction testing.

Required browser profiles include fresh install and representative v0.7 upgrade/migration.

Automated tests must **not** mutate a real production SquareCoil account's native clock. Prefer synthetic fixtures; never blindly call native actions 2/3/4 in production automation.

The exact tested artifact bytes must be the bytes promoted to candidate/release.

---

# 10. Build stages B1-B6

## B1 — Shell / Lifecycle — **NOT_SETTLED / READY_FOR_REPAIR**

Depends on L0-L1.

May implement:

- source/build scaffold;
- extension shell/platform boundary;
- Lifecycle Coordinator;
- one runtime/root ownership;
- READY health probe;
- teardown/recovery skeleton;
- static/package validation improvements;
- lifecycle fixtures/tests.

Must **not** invent B2 timer/state behavior early.

## B2 — State / Ledger / Bridge / Core Timer

Depends on L2-L4.

Implement persistence abstraction, Shared Timer State, Ledger/query service, fencing/coordination, migration, Recovery Checkpoint, Bridge, Timer service, timer read-model/actions.

## B3 — Time Views / Workspace

Depends on L5 + green B2.

Implement main timer hierarchy, Recent, Time Overview, History, Context Detail, Job Navigation, tabs/overflow/order.

## B4 — Data Safety / Files

Depends on L6 + green authoritative storage.

Implement Archive/Clear/Delete, Full Backup, Restore, History CSV, Time Report, conflict staging, Data Mutation Lock.

## B5 — Settings / Themes / Support

Depends on L7 + stable B2-B4 interfaces.

Implement Settings router, appearance/finish, Website Themes, Timer Limits, Support/Feedback, diagnostics, Developer Support.

## B6 — Full Acceptance / Candidate Packaging

Depends on L8 + green B1-B5.

Run full regressions, packaged Chrome browser acceptance, fixture matrices, privacy/accessibility, artifact evidence, first Chrome candidate, then Edge parity.

---

# 11. How to review B1 in the next chat

Begin read-only. Do not edit until `REVIEW B1` has produced an approved repair slice and the user separately gives `START B1`.

First:

1. Re-fetch current planning, B1, and `main` heads.
2. Read the evidence map, traceability matrix, Codex handoff, L0/L1, and L8 B1/acceptance sections.
3. Inspect the existing B1 branch, local 12-file draft, workflow, and tests without changing them.
4. Verify the full L1-AC-23 sequence: disable -> cleanup failure -> boot while disabled -> re-enable remains locked -> failed teardown-only retry remains locked -> later successful teardown-only retry releases every outstanding resource and reaches `UNINITIALIZED` -> exactly one fresh generation may then start.
5. Review ownership/orphan classification, service-worker recovery, BFCache, stale generations, supported documents/iframes, listener duplication, and accidental B2 leakage.
6. Report the bounded repair slice and browser acceptance status.
7. Stop and require `START B1` before editing.

Minimum B1 behaviors to prove before B2:

- fresh supported page creates one runtime/root;
- repeated boot joins/returns existing runtime, no duplicate;
- visible orphan root is safely replaced only when ownership is unambiguous;
- visible root with missing interaction controller is not READY;
- ambiguous duplicate owner fails safely/requires reload;
- background service-worker restart does not duplicate runtime;
- page reload/BFCache revalidates safely;
- disable -> controlled teardown -> UNINITIALIZED/user-disabled;
- re-enable -> fresh BOOTING generation;
- teardown idempotent;
- boot during teardown does not stack runtime;
- failed cleanup remains `FAILED / teardown-incomplete` across boot while disabled, re-enable, and a failed teardown-only retry, with no new allocation;
- a later successful teardown-only retry releases every outstanding resource and reaches `UNINITIALIZED`; only then may exactly one fresh BOOTING generation start;
- legacy v0.7 runtime/build mismatch requires reload, not hot stacking;
- exactly one current lifecycle/listener/resource set remains after recovery.

Do not implement final Time Ledger, Bridge semantics, backups, or complete Settings in B1 merely because the future contracts exist.

---

# 12. Current legacy production data/behavior to preserve during rebuild

Legacy storage/source identifiers:

```text
ussign-squarecoil-job-timer-v1
ussign-squarecoil-job-timer-archive-v1
ussign-squarecoil-job-timer-activity-v1
squarecoil-job-timer-csv-v1
```

Do not delete legacy source keys during initial migration. L2 treats them as forensic/migration evidence, not as ongoing authoritative format or guaranteed rollback compatibility after new rebuilt data is written.

Current v0.7.1 production is valuable as behavior/source evidence, but its multi-script ownership architecture is specifically what the rebuild replaces.

---

# 13. UX / visual design direction

The Companion should feel helpful and calm, not like a second enterprise app glued onto SquareCoil.

Desired UX:

- compact;
- readable;
- low visual noise;
- strong hierarchy;
- user immediately sees Today and overall Job/Context Total;
- operational state is never ambiguous;
- destructive vs housekeeping actions are clearly separated;
- errors explain what happened and what to do;
- no modal-alert loops;
- no hidden destructive behavior;
- keyboard/focus safety;
- status is not color-only.

Dark visual language:

- neutral graphite/charcoal rather than navy-heavy;
- readable secondary text;
- restrained borders/shadows;
- meaningful color only;
- no hard white outlines around every control;
- preserve semantic red/amber/blue/green/purple meaning;
- Glass should use outer-surface blur, not stacked blur on every nested card.

Website themes and timer themes are separate axes.

---

# 14. Update/release architecture goals

GitHub is the development/release source of truth.

Long-term desired release flow:

```text
source
-> automated static/unit/integration/browser tests
-> one canonical version
-> Chrome artifact
-> Edge artifact
-> checksums / release metadata / notes
-> Stable/Beta channels
-> browser-store or managed distribution as appropriate
```

The extension should never download arbitrary remote JavaScript at runtime as a substitute for packaged code.

Developer-mode unpacked installs are suitable during development, but GitHub alone does not transparently auto-update an unpacked extension. Easy normal-user automatic updates generally require Chrome Web Store / Edge Add-ons or a managed/self-hosted signed deployment path.

Final store submission/update requirements must be rechecked against current browser-store documentation at release time rather than frozen from old assumptions.

---

# 15. Inputs still missing but intentionally nonblocking

The user still needs to supply later:

- Buy Me a Coffee URL;
- Cash App cashtag/name;
- Cash App QR image asset;
- optional approved custom logo for Refined Light;
- final visual/microcopy polish decisions.

Other implementation-level choices remain deliberately open until their build stage, including final persistence/build/test technology, provided they satisfy the settled contracts.

---

# 16. Do not do these things

- Do not modify production `main` during early rebuild work.
- Do not copy the v0.7.x patch-stack architecture into the rebuild.
- Do not let feature modules independently mutate timer JSON/Time Ledger.
- Do not rebuild Settings by multiple scripts patching DOM after render.
- Do not use root existence as runtime health.
- Do not stack another runtime when ownership is ambiguous.
- Do not fabricate SquareCoil Context or elapsed time.
- Do not silently prune historical sessions/time.
- Do not make Clear Recent destructive.
- Do not restore live Active/Pending/LocalPause state from backup/CSV.
- Do not silently merge/trim overlapping imported time.
- Do not let themes/support/payment UI affect timer health.
- Do not fork Chrome vs Edge timer semantics without a proven platform need.
- Do not declare package success as browser-behavior success.
- Do not blindly test SquareCoil native clock mutations on a real production account.
- Do not claim a GitHub write, workflow, test, package, or release succeeded without verifying it.
- Do not leak real customer/job/private SquareCoil data into fixtures, diagnostics, Support emails, logs, or repository files.

---

# 17. User interaction protocol for the next chat

The user likes concise progress updates and staged work. Authorization now uses exact commands; historical shorthand is superseded:

- `REVIEW B1` -> read-only B1 inspection and proposed repair slice;
- `START B1` -> only the approved B1 repair slice on `rebuild/squarecoil-companion-b1-lifecycle`, including tests/commit/push;
- `REVIEW B2` -> read-only B2 review after B1 is settled;
- `START B2` -> only the separately approved B2 slice;
- `REVIEW B3`, `REVIEW B4`, `REVIEW B5`, `REVIEW B6` -> read-only review of that named stage after its prior dependencies are settled;
- `START B3`, `START B4`, `START B5`, `START B6` -> only that named stage;
- `REVIEW LOGIC AMENDMENT: <scope>` -> read-only review of one named contract contradiction and proposed amendment;
- `START LOGIC AMENDMENT: <scope>` -> only that same reviewed canonical-document amendment, never runtime/source work;
- `PROMOTE TO MAIN` -> separately approved production promotion;
- `CREATE RELEASE` -> separately approved release creation/publication.

Bare `review` or `start`, and general phrases such as “continue,” “proceed,” “go ahead,” “resume,” “pick it up,” or “keep working,” are not implementation authorization. Authorization never carries between stages.

Replace `<scope>` with the owning logic document and named contradiction; the prefix alone is insufficient. A build-stage command such as `START B1` never authorizes canonical logic edits. After a logic amendment, repeat the affected stage review and obtain its exact `START Bn` authorization before source work resumes.

When beginning work, briefly state:

- what you verified;
- what module/stage owns the work;
- what you are about to change.

When finishing a GitHub change, report:

- what changed;
- branch/path;
- commit SHA if the write actually succeeded;
- tests/verification actually run;
- current next stage.

Do not drown the user in implementation narration while actively fixing something.

---

# 18. First response expected from the new chat

After reading the repo, respond succinctly along these lines:

> I recovered the SquareCoil Companion rebuild from GitHub. Framework and L0-L8 are settled, the logic-closure handoff is present, and production `main` is still v0.7.1. B1 exists but is NOT_SETTLED / READY_FOR_REPAIR; browser acceptance is PENDING; B2 is BLOCKED. I’ll keep all work read-only and preserve the local drafts until you give the exact next authorization, `REVIEW B1`.

Do not ask the user to explain the project again.

---

# 19. Immediate next action

**Stop after logic closure and require `REVIEW B1`.**

`REVIEW B1` is read-only and must inspect the existing B1 branch/local hardening, confirm the L1-AC-23 blocker and remaining lifecycle/browser gaps, then propose the minimal B1-only repair slice. `START B1` is required separately before any source edit, commit, or push.

Chrome is the first rebuilt package/acceptance target, but no Chrome upload candidate should be created until the staged gates in L8 are satisfied.
