# SquareCoil Companion Rebuild
## Logic Stage L5: Time Views, Recent Jobs, History, and Job Navigation

**Status:** Ready for review  
**Logic stage:** L5  
**Depends on:** L0 invariants, L1 lifecycle, L2 state/time/migration, L3 SquareCoil Bridge, L4 core timer behavior  
**Framework authority:** `docs/REBUILD-MASTER-PLAN.md`  
**Purpose:** Define how users inspect, distinguish, navigate, and organize Companion-recorded work without creating a second time model or allowing presentation actions to mutate timing.

---

# 1. Scope and Ownership

L5 owns behavior for:

- main timer information hierarchy;
- Selected vs Active/Pending/Local-Paused presentation;
- current operational-status presentation;
- provisional and Safety-Hold time presentation;
- state-appropriate main actions;
- timer tab selection/expand behavior;
- Recent membership and visible-tab behavior;
- hidden/overflow behavior;
- Recent status display;
- Time Overview queries and ordering;
- Today / This Week / By Day / By Job views;
- Context detail by date;
- legacy-unattributed-time disclosure;
- History session reconstruction/order/fields;
- History vs Activity Log separation;
- Open Job behavior;
- local search-assisted job lookup;
- invalid/missing job navigation behavior;
- large-history incremental loading expectations.

L5 does **not**:

- recalculate time independently of L2/L4;
- change Timer State from selection/navigation alone;
- define archive/delete data mutation semantics beyond the already-settled protection/intent distinctions;
- define Full Backup/CSV behavior;
- define final visual styling/themes;
- define final keyboard/focus polish beyond behavior necessary to avoid timing side effects.

> L2/L4 own what time exists. L5 owns how that truth is exposed and navigated.

**Settled scope**

---

# 2. Read-Model Contract

Every L5 view reads through one canonical query/read-model layer backed by L2 state, Ledger, Context Index, and L4 operational state.

A view must never recompute its own independent version of:

```text
Today
Today Total
This Week
Job Total / Context Total
Current running contribution
Safety Hold cap
legacyUnattributedMs
```

A read snapshot should carry enough metadata to identify:

```text
stateRevision
queryAtMs
workdayZone
operational Context/status
Selected Context
provisional/held disposition when applicable
```

Different views may format the same values differently, but they must derive from the same authoritative query result.

**Settled**

---

# 3. Main Timer Has Two Truths to Preserve

The main timer must preserve both:

```text
A. what the user is viewing
B. what the Companion is actually doing
```

These are represented by:

```text
Selected Context
Operational Context = ACTIVE | PENDING | LOCAL_PAUSED | none
```

When Selected Context differs from the Operational Context, the UI must make that difference explicit.

Example:

```text
ACTIVE = Job A
SELECTED = Job B
```

The user may inspect Job B's Today, Total, and History, while Job A continues to accrue.

Job B must never be labeled or animated as the running job merely because it is selected.

**Settled**

---

# 4. Current Tracking Strip

Whenever a non-IDLE operational Context exists, the read model exposes a **Current Tracking Strip** independent of Selected Context.

It identifies at minimum:

```text
operationalContextId
operationalContextLabel
operationalStatus
Today for that Context
provisional/hold flag if applicable
```

Behavior:

- if Selected = Operational Context, the renderer may visually integrate this truth into the main header rather than duplicate it;
- if Selected != Operational Context, a persistent compact indication of the actual operational Context is required;
- the strip may provide `Focus Current` / equivalent navigation intent;
- focusing current changes Selected Context only and never changes timing.

This is the primary protection against Selected Context visually impersonating the running/pending/paused Context.

**Settled**

---

# 5. Main Time Hierarchy

For a selected Job Context, the main expanded timer prioritizes:

```text
Primary   = Recorded Today / Today
Secondary = Job Total
Tertiary  = Current Session when currently ACTIVE and useful
```

For a selected General Context:

```text
Primary   = Recorded Today / Today
Secondary = Context Total
Tertiary  = Current Session when currently ACTIVE and useful
```

Rules:

- Today is the most prominent useful elapsed measure;
- Job/Context Total remains visible but secondary;
- Current Session must not visually compete with Today as the main measure;
- current-session time is shown only for the actual ACTIVE Context;
- Pending time is not counted as a current session before Resume/Start Fresh;
- Local-Paused time does not continue increasing;
- Safety-Held time is capped according to L4.

Exact typography/wording is deferred to visual implementation, but hierarchy is settled.

**Settled**

---

# 6. Semantic Presentation Statuses

L5 uses presentation statuses derived from L4 state. They are not new Timer States.

Canonical semantic statuses:

```text
RUNNING
RUNNING_PROVISIONAL
VERIFICATION_HOLD
AWAITING_CHOICE
LOCALLY_PAUSED
NOT_RUNNING
SYNCING
```

## 6.1 RUNNING

Selected Context is ACTIVE, no Safety Hold is set, and current verification is normal.

## 6.2 RUNNING_PROVISIONAL

Selected Context is ACTIVE during the short L4 UNKNOWN/CONFLICT grace period and displayed running time includes provisional contribution.

The UI must indicate that the value is being verified and may reconcile.

## 6.3 VERIFICATION_HOLD

Selected Context is ACTIVE with a shared L4 Safety Hold.

Time is capped at `holdAtMs` and must not visually continue increasing.

This status must not be labeled merely `Paused`, because it is not a user Local Pause.

## 6.4 AWAITING_CHOICE

Selected Context is PENDING and awaiting Resume / Start Fresh.

No Pending interval is counted until a valid user choice commits.

## 6.5 LOCALLY_PAUSED

Selected Context is `LOCAL_PAUSED`.

This is a Companion-local pause and must not imply SquareCoil is clocked out.

## 6.6 NOT_RUNNING

Selected Context is historical/inactive and is not the current operational Context.

## 6.7 SYNCING

Used only during a short reconciliation interval where SquareCoil/Timer State has not yet safely settled into another presentation status.

**Settled semantic mapping; final labels may be refined in L7**

---

# 7. Global Native Clock Disposition

Context presentation status and SquareCoil native clock disposition are different concepts.

L5 may expose global native disposition such as:

```text
SquareCoil clocked out
No trackable project/context
SquareCoil state unknown
```

Rules:

- `CLOCKED_OUT` must not be shown as if every historical selected Context itself has a `Clocked Out` timer state;
- `NO_TRACKABLE_CONTEXT` must remain distinct from full clock-out;
- if a historical Job B is selected while SquareCoil is clocked out, Job B is `NOT_RUNNING` while the global native disposition may say clocked out.

**Settled**

---

# 8. Provisional Time Presentation

L4 permits provisional displayed time during a short verification gap and permits that displayed value to decrease after conservative reconciliation.

Any L5 value containing provisional running contribution must expose:

```text
isProvisional = true
```

At minimum this applies to:

- selected Context Today;
- selected Context Total when it includes the same running contribution;
- Today Total;
- This Week;
- active row inside Today-by-Context;
- current-session display.

Behavior:

- provisional values must be visually distinguishable from finalized/normal values;
- a later downward correction must update all affected views consistently;
- the UI must not describe this as deleted history;
- finalized Ledger history is unchanged by provisional-display correction.

**Settled**

---

# 9. Safety Hold Presentation

When ACTIVE has a Safety Hold:

- all live views stop increasing beyond the shared hold boundary;
- status becomes `VERIFICATION_HOLD`;
- the UI indicates that Companion is waiting for/needs SquareCoil verification;
- the Context still counts as operational/protected;
- the user must not be led to believe SquareCoil itself was paused by Companion.

A Safety Hold is therefore visible enough to explain why elapsed time stopped moving.

**Settled**

---

# 10. Pending Anchor Presentation

A Pending Context may expose its current valid safe anchor to help the user understand Resume / Start Fresh behavior.

Example conceptual information:

```text
Awaiting choice
Tracking can begin from 10:14 AM if resumed now
```

Rules:

- the Pending anchor is informational and is not yet added to Today/Total;
- if continuity breaks and L4 refreshes the safe anchor, L5 must display the refreshed anchor rather than stale original time;
- exact microcopy is deferred.

**Settled behavior**

---

# 11. Main Actions by State

Main actions are derived from actual state, not merely Selected Context existence.

## 11.1 ACTIVE selected

Available conceptually:

```text
Local Pause
Open Job (Job Context only)
```

Archive/Clear/Delete ordinary controls are unavailable because the Context is protected.

## 11.2 ACTIVE with Safety Hold

Local Pause may remain available, but L4 prevents finalization beyond the hold.

Open Job remains available for a Job Context.

## 11.3 PENDING selected

Available:

```text
Resume
Start Fresh
Open Job (Job Context only)
```

Protected workspace/destructive controls remain unavailable.

## 11.4 LOCAL_PAUSED selected

Available:

```text
Local Resume
Open Job (Job Context only)
```

Protected workspace/destructive controls remain unavailable.

## 11.5 Inactive selected

May expose:

```text
Open Job
Hide from visible tabs
Archive
Delete Job Data
```

subject to L4 protection and L6 destructive/archive contracts.

## 11.6 General Context

A General Context has no `Open Job` action unless a future explicit navigation contract exists.

**Settled action availability; L6 owns destructive mutation/confirmation details**

---

# 12. Collapse and Expand

Established interaction behavior is preserved:

- single click on a Context tab selects/focuses it only;
- double click may select and expand the timer;
- manual collapse is remembered at runtime according to UI state policy;
- same-Context verification/heartbeat must not reopen a manually collapsed timer;
- metadata updates must not reopen it;
- a real native Context identity transition may request expansion so the new work state is visible.

Expansion/collapse never changes Timer State by itself.

**Settled**

---

# 13. Initial Selection

On a fresh rendered UI, choose Selected Context in this order:

```text
1. operational Context if L4 emits current-focus intent
2. valid lastSelectedContextId when still available to view
3. most recently seen visible Recent Context
4. none / empty main state
```

A user manually selecting another Context after boot overrides automatic initial selection until a later real native Context transition legitimately requests focus.

**Settled**

---

# 14. Recent Is Workspace Membership

Recent is not History and not a retention cap.

A Context is in Recent because it belongs to the user's current working set.

A Context normally enters/returns to Recent when:

- SquareCoil positively observes it as current; or
- the user explicitly chooses `Show in Recent` / restore-to-workspace behavior from another view.

Merely viewing a History row or opening a project URL does not by itself have to add the Context to Recent.

Historical Ledger data remains regardless of Recent membership.

**Settled**

---

# 15. Recent Last-Seen Metadata

Positive current SquareCoil observation may update the Context's `lastSeenAtMs` / equivalent workspace metadata.

UI selection alone does not pretend that a Context was newly seen in SquareCoil.

This metadata may drive Recent ordering/overflow choices but does not alter time.

**Settled**

---

# 16. Visible Timer Tab Capacity

To preserve established compact behavior, the first rebuilt release uses a default visible numbered-job-tab capacity of:

```text
maxVisibleJobTabs = 5
```

This is a workspace presentation limit, **not** a Recent membership limit and never a historical retention limit.

Production General / recognized General Contexts do not consume a numbered-job slot under this compatibility rule.

The exact capacity may become configurable later without changing time/history semantics.

**Settled default policy**

---

# 17. Overflow Instead of Destruction

When the visible numbered-job capacity is full and a new current Job Context must be shown:

1. protected/current Contexts remain visible;
2. manually protected operational state cannot be displaced;
3. choose an eligible inactive, unprotected visible Job Context for overflow using least-recently-seen workspace order;
4. move that Context out of visible tabs into Recent overflow;
5. do not remove it from Recent;
6. do not delete/archive its Time Ledger history.

A hidden/overflow Context that later becomes current through SquareCoil is made visible before/with current-focus intent.

**Settled**

---

# 18. Manual Hide

Hide affects visible-tab workspace only.

Allowed only for unprotected Contexts.

Hide:

- does not remove authoritative history;
- does not alter Job Total;
- does not alter SquareCoil;
- does not necessarily remove Recent membership;
- persists as workspace preference until the Context becomes operational or the user shows it again.

If SquareCoil later makes a hidden Context current, current-state visibility outranks the hide preference.

**Settled**

---

# 19. Tab Order

Visible timer tabs are draggable/reorderable.

Rules:

- order is durable workspace metadata;
- reordering never changes Recent history or timing;
- cross-tab updates synchronize the durable order without changing another tab's Selected Context;
- when a previously hidden/overflow Context returns, preserve its prior relative order when practical; otherwise place it in a deterministic incoming position without rewriting timer state.

The exact drag implementation is not part of logic.

**Settled**

---

# 20. Recent Jobs View

Recent Jobs provides a broader workspace list than the compact timer tabs.

Each row should be able to expose:

```text
Context identity / label
Today
Job Total or Context Total
last seen / recent activity
semantic operational status
visible vs hidden/overflow state
```

Running/Pending/Local-Paused/Held status must be derived from L4, not inferred from row selection.

**Settled**

---

# 21. View vs Show

Recent Jobs separates two intents:

```text
View
Show in Tabs
```

- `View` selects the Context for inspection.
- `Show in Tabs` changes visible workspace state when allowed.

Neither action starts/resumes timing.

If a Context is already visible, `Show in Tabs` is unnecessary/no-op.

**Settled**

---

# 22. Clear Recent / Archive / Delete Distinction

L5 must communicate distinct intents:

```text
Clear Recent = workspace cleanup, non-destructive to authoritative time
Archive      = move Context to archive workspace state, time preserved
Delete Data  = explicit destructive data operation
```

Rules:

- protected Contexts cannot participate in ordinary Clear Recent/Archive/Delete actions;
- Clear Recent must never be presented with wording that implies authoritative time deletion;
- Archive must not be described as deleting hours;
- Delete must be visually/semantically distinct and is completed only through the L6 contract;
- L6 decides Clear Recent's final membership destination and destructive confirmation details.

**Settled presentation distinction; mutation details deferred to L6**

---

# 23. Time Overview Structure

Time Overview answers four different user questions without requiring export:

```text
How much time have I recorded today?
How much this week?
What did I spend today on?
How much time exists for each day/job overall?
```

Required destinations/sections:

```text
Today Total
This Week
Today by Job/Context
By Day
By Job/Context
Context Detail
```

All values come from L2 query rules, including L4 running/provisional/hold behavior.

**Settled**

---

# 24. Today Total

`Today Total` is L2's sum across all attributed Contexts for the current Workday Time Zone date plus valid current contribution.

Presentation rules:

- includes Job and General Contexts;
- includes the ACTIVE Context's valid running contribution;
- may be marked provisional if that contribution is provisional;
- excludes legacy-unattributed balance;
- does not independently sum rounded display values from rows.

**Settled**

---

# 25. Today by Job / Context

The user-facing section may be titled `Today by Job`, but its data includes all Contexts with time today, including General Contexts.

Default ordering:

```text
1. highest Today duration first
2. ties by most recent activity
3. stable Context identity as final deterministic tie-break
```

Each row exposes at least:

```text
Context label
Today duration
semantic status when operational
provisional/hold indicator when applicable
```

Zero-duration Contexts are normally omitted from the time-allocation list unless they are operational and showing them helps explain current state.

**Settled**

---

# 26. This Week

`This Week` uses L2's current week query policy.

It:

- includes attributed Ledger time inside the current reporting week;
- includes valid current contribution;
- may be provisional when current contribution is provisional;
- excludes `legacyUnattributedMs` because that balance has no date attribution.

L5 does not recalculate week boundaries itself.

**Settled**

---

# 27. By Day

By Day presents daily attributed Companion time.

Default ordering:

```text
newest localDate first
```

Each date row may expose:

```text
localDate
Daily Total
number of contributing Contexts
optional top Context summary
```

Selecting a date opens/reveals that day's Context allocation using the same Ledger attribution rules.

Legacy-unattributed time is not assigned to a fake day.

**Settled**

---

# 28. By Job / Context

By Job/Context lists known Contexts with authoritative Companion time.

Default ordering:

```text
most recent authoritative activity first
```

Rows expose at least:

```text
Context label / job number
Job Total or Context Total
Today when useful
last recorded activity date/time
legacy-unattributed indicator when present
```

The view may later support user sort/search options, but default behavior must remain deterministic.

**Settled default ordering**

---

# 29. Context Detail

Context Detail is the canonical human-readable drilldown for one Job/General Context.

Summary includes:

```text
Recorded Today
This Week for this Context
Job Total / Context Total
current semantic status when applicable
```

Detail includes:

```text
daily attributed totals
finalized logical sessions
legacy-unattributed balance when present
Open Job for valid Job Context
Show/View workspace actions when applicable
```

The daily sum may legitimately be less than Job Total when legacy-unattributed time exists. The UI must explain that difference rather than invent daily allocation.

**Settled**

---

# 30. Legacy Unattributed Time Disclosure

When `legacyUnattributedMs > 0`, L5 must disclose it in Context Detail and any overall-total view where its presence could otherwise make totals look inconsistent.

Conceptual presentation:

```text
Job Total                 18h 00m
Dated Companion history   12h 00m
Older imported time        6h 00m
```

Rules:

- do not assign the older balance to Today/This Week/By Day;
- do not invent session timestamps;
- do not hide the balance merely to make daily totals appear to add up;
- final wording may be softened/refined, but the distinction must remain understandable.

**Settled**

---

# 31. Empty States

Empty states must distinguish why no rows exist.

Examples of semantic empty conditions:

```text
No Companion time recorded today
No Companion history yet
No recent jobs in the workspace
No matching job found
No dated history available; imported total exists
```

An empty History result must not be rendered as `0h Job Total` when legacy-unattributed balance exists.

Empty states do not mutate data.

**Settled semantics; final microcopy deferred**

---

# 32. Loading / Stale / Error States

Views should distinguish:

```text
loading
loaded-empty
loaded-data
stale/revalidating
error
```

Rules:

- do not replace known loaded totals with zero during transient refresh failure;
- if a read snapshot is stale while revalidating, preserve the last successful value with stale/revalidating indication;
- persistence/read failure is surfaced according to L1/L8 rather than silently presenting zero history;
- a failed optional navigation/search lookup must not affect timer health.

**Settled**

---

# 33. Large-History Retrieval

Large history must remain accessible without silently pruning authoritative records.

Behavioral requirements:

- views load history incrementally rather than requiring every Ledger row in the initial render;
- pagination/cursor/virtualization is acceptable implementation detail;
- loading more rows cannot change prior totals because totals come from canonical aggregate queries, not currently rendered rows;
- absence from the current rendered page is not absence from History;
- no hard UI page size becomes a data-retention cap.

A default page/chunk size is implementation policy.

**Settled**

---

# 34. History Is Finalized Work History

History represents finalized Companion-recorded sessions/history.

The current in-progress ACTIVE session is not silently inserted into finalized History as if it were complete.

Current operational time is represented in:

- main timer;
- Time Overview live totals;
- optional current-session area in Context Detail.

Once finalized, that session appears in History.

**Settled**

---

# 35. Logical Session Reconstruction

L2 may split one logical Session into multiple Ledger Segments at midnight.

History should normally present that as **one logical session**, reconstructed by stable `sessionId`, rather than making one overnight work period look like multiple separate starts.

Example:

```text
Session 23:55 → 00:25 = 30m
```

History may show one 30m session, while By Day correctly allocates:

```text
Day 1 = 5m
Day 2 = 25m
```

If safe session reconstruction is not possible for legacy data, preserve separate evidence rather than invent grouping.

**Settled**

---

# 36. History Ordering

Default logical-session ordering:

```text
newest effective end time first
```

For equal end times:

```text
newest start time
then stable session identity
```

Within a Context/day drilldown, the same deterministic ordering applies.

History ordering never changes Ledger identity or timestamps.

**Settled**

---

# 37. History Row Data

A compact logical session row should be able to expose:

```text
Context / job number
local date or date range
start time
end time
duration
```

Expanded/detail information may expose:

```text
startCause
endReason
source/certainty when meaningful
migration/import provenance when meaningful
daily allocation for cross-midnight session
```

Rules:

- normal rows need not overwhelm the user with internal diagnostics;
- conservative/recovery/imported records should expose enough provenance to explain unusual boundaries;
- Start Cause and End Reason remain separate per L4;
- display formatting never rewrites source precision.

**Settled**

---

# 38. History vs Activity Log

History and Activity Log answer different questions.

```text
History      = when Companion time was recorded
Activity Log = what Companion/application events occurred
```

History must not be polluted with theme changes, support actions, tab reorders, or other non-time activity.

Activity Log may reference timer actions for diagnostics, but Activity Log entries are never used to calculate History totals.

**Settled**

---

# 39. Open Job

`Open Job` is available only for a Job Context with a valid recognized positive SquareCoil project ID.

Canonical navigation target:

```text
/project.php?id=${projectId}
```

For example:

```text
job:260702
→ /project.php?id=260702
```

Rules:

- Open Job is navigation only;
- it does not clock into the job;
- it does not Resume/Start Fresh;
- it does not alter Active/Pending/Local Pause state;
- it does not add Companion time;
- normal browser link behavior may permit same-tab/new-tab navigation depending UI implementation/user modifier.

**Settled**

---

# 40. General Context Navigation

General Contexts such as Production General have no fabricated project URL.

The UI must not generate:

```text
/project.php?id=0
```

as an `Open Job` action for Production General.

If a future audited General-context destination exists, it requires a separate explicit navigation contract.

**Settled**

---

# 41. Search-Assisted Job Lookup

Job lookup is a navigation convenience, not a clock feature.

Initial search sources:

```text
1. local Job/Context Index by project ID
2. local known labels/names/aliases when available
3. exact valid six-digit project-number direct navigation candidate
```

Behavior:

- local matching may be fuzzy for labels but project-ID identity remains exact;
- selecting a search result selects/views or opens the job according to explicit user action;
- merely typing/searching does not add the job to Recent;
- merely opening a job URL does not start Companion timing;
- SquareCoil must later positively observe a Context before timer logic reacts.

No unaudited SquareCoil server search endpoint is invented by L5.

**Settled initial contract**

---

# 42. Exact Six-Digit Direct Navigation Candidate

When the user enters an exact syntactically valid six-digit job number not already in the local Index, the UI may offer:

```text
Open job 260702
```

using the canonical project URL.

This action:

- does not create a durable Job Context record solely from typed text;
- does not add Recent membership;
- does not create time;
- relies on SquareCoil page/navigation truth after opening.

If SquareCoil later proves the ID invalid/closed/inaccessible, normal page behavior stands; Companion does not fabricate metadata.

**Settled**

---

# 43. Invalid / Missing Job ID

If a Context lacks a valid positive project ID:

- no `Open Job` link is generated;
- no guessed URL is generated from arbitrary label numbers;
- the UI may display the Context/history normally;
- navigation failure does not mutate timer/history.

Invalid free-form job search input returns a non-destructive `No matching job` / invalid-input state.

**Settled**

---

# 44. Navigation and Recent Membership

Navigation and workspace membership are separate.

Examples:

```text
View historical Job A → does not automatically make A Recent
Open Job A URL         → does not automatically make A Recent
SquareCoil observes A  → A returns/enters Recent
Show in Recent A       → explicit workspace membership action
```

This prevents browsing old history from cluttering the active workspace.

**Settled**

---

# 45. Threshold Presentation Separation

L4 threshold level derives from Context Today.

L5 may present threshold color/accent in main view or tabs, but threshold state is distinct from operational status.

Example:

```text
Inactive Job B with 4h recorded today
```

may carry a Red time-threshold indication but must not appear `RUNNING`.

Likewise `RUNNING` is not itself a threshold color.

**Settled**

---

# 46. View Consistency Across Tabs

Cross-tab behavior:

- authoritative Today/Total/status values synchronize from shared state/ledger revisions;
- each tab may keep its own Selected Context;
- a reorder/visibility workspace change may synchronize when durable;
- one tab selecting Job B does not force every other tab to select B;
- actual native Context change may emit current-focus intent independently in each live UI;
- no tab derives a separate running total.

**Settled**

---

# 47. L5 Behavior Invariants

- **VIEW-01:** Today/Week/Total are read from one canonical query model.
- **VIEW-02:** Selected Context and Operational Context remain visibly distinguishable.
- **VIEW-03:** Only the actual ACTIVE Context may present a current running session.
- **VIEW-04:** Provisional time is marked and may reconcile downward without deleting finalized history.
- **VIEW-05:** Safety Hold stops visible accrual across all views at the same shared boundary.
- **VIEW-06:** Pending anchor information is not counted as elapsed before a valid choice commits.
- **VIEW-07:** Recent is workspace membership, not time retention.
- **VIEW-08:** Visible-tab capacity never deletes/archives authoritative history.
- **VIEW-09:** Protected Contexts remain accessible and cannot be silently displaced from the operational UI.
- **VIEW-10:** Clear Recent, Archive, and Delete remain distinct intents.
- **VIEW-11:** Time Overview includes Job and General Contexts consistently.
- **VIEW-12:** Legacy unattributed time is disclosed, never assigned to fake dates.
- **VIEW-13:** History presents finalized logical sessions, not current running state as completed history.
- **VIEW-14:** Midnight-split Ledger Segments may reconstruct into one logical History session.
- **VIEW-15:** History and Activity Log remain separate data concepts.
- **VIEW-16:** Open Job/navigation never changes timing by itself.
- **VIEW-17:** General Contexts do not receive fabricated project URLs.
- **VIEW-18:** Searching/viewing history does not automatically clutter Recent.
- **VIEW-19:** Threshold presentation cannot impersonate operational Running state.
- **VIEW-20:** Large-history paging cannot become a retention cap.

**All Settled**

---

# 48. Acceptance Scenarios

## V1. Active equals Selected

ACTIVE A and SELECTED A → main shows A as Running, A Today primary, Job Total secondary, current session tertiary.

## V2. Selected differs from Active

ACTIVE A, SELECTED B → B shows its own historical values as Not Running; Current Tracking Strip identifies Running A.

## V3. Focus current

From V2, user chooses Focus Current → Selected becomes A; timing is unchanged.

## V4. Pending selected

PENDING A → main shows Awaiting Choice, Resume/Start Fresh, and valid current Pending anchor; Pending interval is not yet added to Today.

## V5. Pending anchor refresh

Pending continuity breaks and L4 replaces anchor → L5 stops showing the old anchor and displays the new valid anchor.

## V6. Local Pause

LOCAL_PAUSED A → Today/Total remain visible and stable; status is Locally Paused; SquareCoil is not labeled clocked out.

## V7. Provisional running time

ACTIVE A enters short verification grace → live values are marked provisional and may continue temporarily.

## V8. Provisional correction

V7 later reconciles to an earlier conservative boundary → all affected live totals update consistently downward; History does not lose finalized rows.

## V9. Safety Hold

ACTIVE A gains Safety Hold → main and all Time Overview values stop increasing at shared hold; status explains verification hold.

## V10. Historical selection while SquareCoil clocked out

SELECTED B is historical and native disposition is CLOCKED_OUT → B is Not Running; global native clock may say clocked out.

## V11. Five visible jobs then new job

Five numbered inactive jobs are visible, SquareCoil makes new Job F current → eligible least-recently-seen inactive job moves to Recent overflow, F becomes visible; no history is deleted.

## V12. General Context with five numbered jobs

Production General may remain visible without consuming a numbered-job slot under the initial compatibility rule.

## V13. Hidden job becomes current

Hidden B becomes current in SquareCoil → B is automatically shown before/with current focus intent.

## V14. Reorder tabs

User drags B before A → durable workspace order changes; no timing or Today values change.

## V15. Select tab

Single-click B → Selected B only; no clock/timer mutation.

## V16. Double-click tab

Double-click B → select/expand B; no timing mutation.

## V17. Same-context heartbeat collapsed

A is manually collapsed, heartbeat verifies A → remains collapsed.

## V18. Native switch collapsed

Native A→B occurs while collapsed → UI may request B focus/expand; timing transition remains L4-owned.

## V19. Today Total with General

Job A 2h + Production General 1h today → Today Total = 3h; General is included.

## V20. Today row ordering

A=2h, B=1h, General=30m → Today rows order A, B, General unless tie rules apply.

## V21. Week excludes legacy balance

A has 5h dated this week + 20h legacy-unattributed → This Week shows 5h; Job Total includes 25h plus other history/current contribution.

## V22. By Day

Newest date is listed first; selecting it reveals that day's Context allocation from Ledger attribution.

## V23. Cross-midnight session

One session 23:55→00:25 → History shows one logical 30m session while By Day shows 5m / 25m allocations.

## V24. Legacy unattributed detail

A has 12h dated + 6h legacy-unattributed → Context Detail shows Job Total 18h and separately discloses 6h older imported/unattributed time.

## V25. Empty today

No attributed/current time today but older history exists → Today empty state says no time recorded today, not no history exists.

## V26. No history but imported total

No dated sessions but legacy-unattributed balance exists → do not show `No history / 0h`; disclose imported/undated balance.

## V27. Loading failure

Time Overview refresh fails after a prior successful read → do not flash totals to zero; keep prior values with stale/error state.

## V28. Large history

Only first chunk of 10,000-session history is rendered → overall totals remain complete and Load More/virtualization does not imply older time was deleted.

## V29. Current session not finalized History

ACTIVE A is running → current session contributes to Today/Total but is not shown as a completed History session until finalized.

## V30. History provenance

A Resume-started session later clocked out → expanded History can show `startCause=resume`, `endReason=native-clock-out` without conflating them.

## V31. Activity separation

Theme change and tab reorder occur → they may appear in Activity Log but never as time History rows.

## V32. Open valid job

Open Job 260702 → navigate to `/project.php?id=260702`; no timing state changes from navigation action itself.

## V33. Open Production General

Production General → no `/project.php?id=0` Open Job action exists.

## V34. Search known job

Search `260702` matches local known Job → user may View/Open explicitly; search itself does not alter Recent/timing.

## V35. Search exact unknown six-digit job

Enter valid `260999` absent from index → may offer direct Open candidate; do not create durable Context/time until SquareCoil later proves context.

## V36. Invalid search

Input `ABC999` with no local match → non-destructive no-match/invalid state, no guessed job URL.

## V37. Historical View does not clutter Recent

Open Context Detail for archived/old A → A does not silently return to Recent just because it was viewed.

## V38. Threshold vs status

Inactive A has 4h Today → may show Red threshold accent but must still display Not Running.

## V39. Protected row

PENDING A appears in Recent → ordinary Clear Recent/Archive/Delete controls are unavailable for A.

## V40. Cross-tab selection

Tab 1 selects A, Tab 2 selects B → both receive same shared time/status truth while preserving independent selection.

---

# 49. Continuity States After L5

## Settled

- one read-model/query authority for all time views;
- main Today-first hierarchy with Job/Context Total secondary;
- current-session tertiary presentation;
- persistent operational truth when Selected differs;
- semantic Running/Provisional/Hold/Pending/Local-Paused/Inactive presentation states;
- native clock disposition separate from selected Context status;
- provisional-time and Safety-Hold presentation requirements;
- Pending anchor disclosure semantics;
- state-dependent main action availability;
- single-click select / double-click expand behavior;
- Recent membership vs visible tab distinction;
- five numbered-job visible-tab default with overflow, not destruction;
- General Context not consuming numbered-job slot in initial compatibility behavior;
- durable tab order and hide/show behavior;
- Clear Recent / Archive / Delete presentation distinction;
- Time Overview Today/Week/Today-by-Context/By-Day/By-Context/Context-Detail behavior;
- legacy-unattributed-time disclosure;
- deterministic empty/loading/error semantics;
- incremental large-history retrieval without retention caps;
- finalized History vs current session separation;
- logical-session reconstruction across midnight splits;
- History ordering/fields/provenance;
- History vs Activity Log separation;
- Open Job and local search-assisted navigation behavior;
- invalid/missing ID safety;
- navigation separated from Recent/timer state;
- threshold status separated from Running status;
- cross-tab view consistency with independent Selected Context.

## Provisional

- exact user-facing status labels/microcopy;
- exact visible-tab capacity preference exposure if later configurable;
- exact default history page/chunk size;
- exact local fuzzy-search ranking algorithm;
- exact default sort-control UI beyond settled default ordering;
- exact current-session visibility density in compact mode.

## Open for later stages

- Clear Recent final destination/mutation semantics (L6);
- archive/delete confirmations and exact deletion scope (L6);
- Archive browser/restore behavior (L6);
- History CSV / Time Report behavior (L6);
- final Settings routing, keyboard/focus polish, themes, and microcopy (L7);
- failure-priority/acceptance integration and automated fixtures (L8/build).

## Blocked

None.

---

# 50. L5 Readiness Judgment

**Status: Ready for review**

L5 is complete enough for review when the UI/router can consume L2/L4 read models and present Main Timer, Recent, Time Overview, History, and Job Navigation without inventing new time calculations, allowing selection to change timing, hiding current operational truth, or confusing workspace cleanup with data deletion.

If accepted and hardened, the next stage is:

**L6: Archive, Housekeeping, Backup, Restore, and CSV**
