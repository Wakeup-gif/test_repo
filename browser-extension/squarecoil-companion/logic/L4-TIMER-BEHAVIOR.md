# SquareCoil Companion Rebuild
## Logic Stage L4: Core Timer Behavior

**Status:** Ready for review  
**Logic stage:** L4  
**Depends on:** L0 invariants, L1 lifecycle, L2 state/time/migration, L3 SquareCoil Bridge  
**Framework authority:** `docs/REBUILD-MASTER-PLAN.md`  
**Purpose:** Define how normalized SquareCoil observations and explicit Companion user actions change Shared Timer State and Time Ledger behavior without letting UI modules or the Bridge become alternate state writers.

---

# 1. Scope and Ownership

L4 owns:

- new Context start behavior;
- remembered Context Pending behavior;
- Resume;
- Start Fresh;
- Local Pause;
- Local Resume;
- native Context switching;
- Context leave;
- full clock-out;
- same-Context verification;
- unknown/conflict safety handling;
- strong unconfirmed clock-out handling;
- conservative detected-transition boundaries;
- recovery from interrupted prior sessions;
- selected vs active behavior;
- auto-focus/expand intent on real native Context changes;
- time-threshold semantics;
- protection rules for destructive actions.

L4 does **not**:

- interpret raw SquareCoil DOM/AJAX evidence;
- write state outside the authoritative L2 state service;
- define Time Overview presentation;
- define archive/delete/backup implementation;
- define final Settings styling.

> L3 says what SquareCoil evidence means.  
> L4 says what the Companion timer does with that evidence.

---

# 2. Authoritative Mutation Rule

Every timer transition is applied through the single authoritative state service defined by L2.

A timer transition may atomically affect:

- Shared Timer State;
- Time Ledger Segments;
- Job/Context Index metadata;
- Recovery Checkpoint;
- revision/commit/fencing metadata.

No UI handler, Bridge handler, workspace feature, or secondary tab may independently edit timer JSON.

**Settled**

---

# 3. Canonical Operational Timer States

Within one Companion data scope, committed timing state is exactly one of:

```text
IDLE
ACTIVE(contextId)
PENDING(contextId)
LOCAL_PAUSED(contextId)
```

These map to L2 mutually exclusive records:

```text
IDLE         active=null, pending=null, localPause=null
ACTIVE       active!=null, pending=null, localPause=null
PENDING      active=null, pending!=null, localPause=null
LOCAL_PAUSED active=null, pending=null, localPause!=null
```

`Selected Context` remains separate UI/view state.

**Settled**

---

# 4. Current SquareCoil Context vs Timer State

The Companion may be in one of several valid combinations:

```text
SquareCoil Context A + ACTIVE A
SquareCoil Context A + PENDING A
SquareCoil Context A + LOCAL_PAUSED A
SquareCoil Context A + IDLE briefly during reconciliation
SquareCoil no Context + IDLE
```

Invalid committed combinations include:

```text
SquareCoil verified A + ACTIVE B
ACTIVE A + LOCAL_PAUSED A
ACTIVE A + PENDING A
```

If current SquareCoil evidence contradicts committed Active identity, L4 must reconcile before further authoritative accrual.

**Settled**

---

# 5. Historical-Time Test

A Context is considered **remembered** when its authoritative history is greater than zero.

Conceptually:

```text
remembered = attributed Ledger duration > 0
          or legacyUnattributedMs > 0
```

The existence of a Job Index record alone does not make a Context remembered.

A previously seen Context with zero recorded time is treated as a new zero-history Context for timer-start logic.

**Settled**

---

# 6. Safe Start Anchor

When L3 detects/confirms a Context, L4 derives one **safe start anchor** for any new session caused by that observation.

Priority:

```text
1. compatible NATIVE_CONFIRMED boundaryAtMs
2. compatible DETECTED boundaryAtMs
3. fresh observedAtMs
```

The anchor must never be earlier than evidence actually supports.

A click timestamp is never a safe start anchor by itself.

**Settled**

---

# 7. New Zero-History Context

Given:

- no current ACTIVE/PENDING/LOCAL_PAUSED state that should be preserved; and
- L3 emits a positive Context observation for Context B; and
- Context B has zero historical Companion time;

L4 automatically starts Companion tracking for B.

Transaction:

1. ensure Context B exists in Job/Context Index;
2. create a new `cycleId`;
3. create a new `sessionId`;
4. set `active.contextId = B`;
5. set `active.startedAtMs = safeStartAnchor`;
6. set `lastVerifiedAtMs` only from eligible L3 evidence;
7. clear incompatible Pending/Local Pause state;
8. update Recovery Checkpoint;
9. commit once.

No Resume prompt is shown for a true zero-history Context.

**Settled**

---

# 8. Remembered Context Detection

Given a positively observed Context B with prior authoritative Companion history and no valid Local Pause marker for B:

- do not auto-start accrual;
- enter `PENDING(B)`;
- store a safe start anchor from the observation;
- expose Resume / Start Fresh as user choices later through UI;
- do not accrue while Pending until the user makes a valid choice.

Pending protects the user from accidentally joining separate work periods without deciding how to continue.

**Settled**

---

# 9. Pending Record Requirements

A Pending record must support at minimum:

```text
contextId
safeStartAnchorMs
detectedAtMs
source
boundaryCertainty
createdAtMs
```

The Pending record does not own a copied elapsed total. Job Total is always queried from the Time Ledger.

If SquareCoil leaves or changes away from the Pending Context before the user acts, that Pending state is cleared/replaced through the appropriate native transition logic.

**Settled**

---

# 10. Resume from Pending

A Resume action is valid only when:

1. Shared Timer State is `PENDING(A)`;
2. current SquareCoil evidence positively supports the same Context A;
3. Bridge state is not UNKNOWN/CONFLICT/UNAVAILABLE for the required verification;
4. current writer/fencing ownership is valid.

If valid:

- create a new `sessionId`;
- continue the existing/current `cycleId` when one is meaningfully available, otherwise create one;
- start the new session at the Pending `safeStartAnchorMs`;
- clear Pending;
- set ACTIVE A;
- preserve all historical time.

The interval between Context detection and the user's Resume choice is included because SquareCoil was positively observed in A from the safe anchor onward.

Resume must never start before the safe anchor.

**Settled**

---

# 11. Start Fresh from Pending

Start Fresh is valid under the same SquareCoil verification requirements as Resume.

If valid:

- preserve all prior Time Ledger history;
- preserve legacyUnattributedMs;
- preserve Job/Context Total;
- create a **new cycleId**;
- create a new `sessionId`;
- start at the Pending `safeStartAnchorMs`;
- clear Pending;
- set ACTIVE for the same Context.

Difference:

```text
Resume      = continue prior logical cycle when available
Start Fresh = create a new logical cycle
```

Start Fresh does **not** mean reset historical Job Total to zero.

**Settled**

---

# 12. Stale Pending Action

If the user clicks Resume/Start Fresh but current SquareCoil state no longer positively supports the Pending Context:

- reject the action;
- do not create a new session;
- do not fabricate elapsed time;
- reconcile Pending with the newest L3 event;
- UI later communicates that the SquareCoil Context changed.

**Settled**

---

# 13. Local Pause

Local Pause is allowed only when:

- Shared Timer State is ACTIVE(A);
- the current user action targets A;
- current writer ownership is valid.

Local Pause does **not** call SquareCoil clock APIs.

Transaction:

1. choose pause boundary = user Local Pause action time;
2. finalize the current ACTIVE session to that boundary;
3. append day-split Ledger Segments atomically;
4. clear ACTIVE;
5. create `LOCAL_PAUSED(A)` marker;
6. preserve current cycleId for later Local Resume;
7. update Recovery Checkpoint;
8. commit once.

SquareCoil remains unchanged.

**Settled**

---

# 14. Local Pause Verification Behavior

While `LOCAL_PAUSED(A)` and SquareCoil continues to verify A:

- Companion does not accrue time;
- Context verification may update observed/metadata state but does not remove Local Pause;
- same-Context heartbeats never auto-resume;
- page reload/restart preserves Local Pause candidate behavior through L2 recovery.

**Settled**

---

# 15. Local Resume

Local Resume is valid only when:

1. state is `LOCAL_PAUSED(A)`;
2. current SquareCoil evidence positively supports A;
3. Bridge is sufficiently healthy to verify A;
4. current writer ownership is valid.

If valid:

- create a new `sessionId`;
- preserve the prior cycleId;
- start at the Local Resume user-action timestamp;
- clear Local Pause;
- set ACTIVE A;
- do not backfill the locally paused interval.

If SquareCoil no longer supports A, Resume is unavailable/rejected.

**Settled**

---

# 16. Native Direct Context Switch A to B

L3 may emit `CONTEXT_CHANGED A -> B` for one native transition episode.

If ACTIVE A:

1. finalize A using the boundary policy in Section 24;
2. clear ACTIVE A;
3. evaluate B through the incoming-Context rule:
   - zero history -> auto-start B;
   - remembered -> PENDING B;
4. use the incoming B safe start anchor from L3;
5. commit all compatible changes atomically where one transition transaction is appropriate.

If PENDING A:

- clear Pending A;
- evaluate B normally.

If LOCAL_PAUSED A:

- clear Local Pause A because SquareCoil left A;
- no extra A time is finalized because Local Pause already ended accrual;
- evaluate B normally.

**Settled**

---

# 17. Distinct Leave then Enter Transitions

When L3 preserves two native boundaries, for example:

```text
10:00:00 CONTEXT_LEFT A
10:00:20 CONTEXT_DETECTED B
```

L4 must preserve the gap.

- finalize A at its leave boundary;
- state becomes IDLE after leaving A;
- do not attribute the gap to A or B;
- evaluate/start/prompt B only at B's own safe start anchor.

Distinct native transitions may not be collapsed into one seamless A -> B Companion session.

**Settled**

---

# 18. Context Left

On confirmed `CONTEXT_LEFT`:

If ACTIVE A:

- finalize A using the event boundary policy;
- clear ACTIVE;
- enter IDLE.

If PENDING A:

- clear Pending;
- enter IDLE.

If LOCAL_PAUSED A:

- clear Local Pause;
- enter IDLE.

Reason metadata must distinguish `context-left` from full clock-out.

**Settled**

---

# 19. Full Clock-Out

On confirmed `CLOCKED_OUT`:

If ACTIVE A:

- finalize A using the event boundary policy;
- clear ACTIVE.

If PENDING/LOCAL_PAUSED:

- clear that non-running state.

Then enter IDLE.

Reason metadata must represent company clock-out distinctly from project/context leave.

A full clock-out never deletes historical time.

**Settled**

---

# 20. Same-Context Verification

On `CONTEXT_VERIFIED(A)`:

## ACTIVE A

- keep current session;
- no session boundary;
- eligible evidence may advance `lastVerifiedAtMs`;
- metadata may update.

## PENDING A

- remain Pending;
- refresh verification metadata if useful;
- do not auto-start.

## LOCAL_PAUSED A

- remain Local Paused;
- do not accrue.

## IDLE with positively observed A

This is a reconciliation condition. L4 re-evaluates A as if positively detected:

- zero history -> auto-start;
- remembered -> Pending;
- preserved valid Local Pause candidate -> Local Paused.

**Settled**

---

# 21. Context Metadata Update

`CONTEXT_METADATA_UPDATED` never creates a timer boundary by itself.

For the same Context identity:

- update Job/Context Index display metadata;
- preserve ACTIVE/PENDING/LOCAL_PAUSED state;
- preserve sessionId/cycleId;
- preserve Job Total.

**Settled**

---

# 22. Strong Unconfirmed Clock-Out Safety Hold

L3 may provide strong unconfirmed clock-out transition evidence after SquareCoil successfully completes action 2 but post-state confirmation is temporarily unavailable.

L4 applies an **Accrual Safety Hold** to an ACTIVE Context.

The hold is an operational modifier of ACTIVE, not a new canonical timer state.

Logical fields:

```text
holdAtMs
reason
transitionCandidateId
createdAtMs
```

While held:

- displayed/virtual running contribution is capped at `holdAtMs`;
- no new elapsed time is added beyond the hold boundary;
- the active record is not yet finalized solely from unconfirmed current state.

Resolution:

### Later confirmed CLOCKED_OUT
Finalize at the correlated native action-2 boundary/holdAtMs and enter IDLE.

### Later positive same-Context verification
Remove the Safety Hold. The original ACTIVE session continues from its original startedAtMs, including the temporarily held interval, because fresh SquareCoil evidence contradicted the suspected clock-out.

### Later confirmed different Context
Finalize the prior Context using the compatible hold/native boundary, then evaluate the new Context.

**Settled**

---

# 23. STATE_UNKNOWN / STATE_CONFLICT Handling

A transient unknown/conflict must not immediately destroy a valid ACTIVE session.

Default verification grace policy:

```text
verificationGraceMs approximately 90 seconds
```

The exact duration is configurable implementation policy.

## 23.1 Within grace

If ACTIVE A and current Bridge state becomes UNKNOWN/CONFLICT without a strong native mutation candidate:

- retain ACTIVE A provisionally;
- do not advance `lastVerifiedAtMs`;
- allow current display to continue provisionally;
- expose verification-degraded status to later UI;
- aggressively re-verify according to L1/L3 bounded policy.

## 23.2 Same Context returns within grace

If positive verification of A returns before grace expires:

- ACTIVE remains continuous;
- no session boundary;
- provisional interval remains part of the current session.

## 23.3 Grace expires

If positive verification does not return before grace expires:

- apply an Accrual Safety Hold at the latest trustworthy `lastVerifiedAtMs`;
- stop further provisional running contribution;
- do not fabricate a clock-out or new Context;
- lifecycle remains degraded according to L1/L3 health.

## 23.4 Same Context returns after hold/grace expiry

A later same-Context observation does not prove uninterrupted SquareCoil continuity across the long unknown gap.

Therefore:

1. finalize the evidence-backed prior session through the hold/lastVerified boundary if not already finalized;
2. leave the unverified gap unattributed;
3. start a new session from the fresh re-verification safe anchor;
4. preserve the same cycleId unless a separate Start Fresh action occurs.

No automatic backfill is allowed for the unknown gap.

**Settled**

---

# 24. Event Boundary Policy

When an ACTIVE session must be finalized because SquareCoil left/changed/clocked out, choose the end boundary conservatively.

## 24.1 Native-confirmed boundary

If L3 supplies compatible:

```text
boundaryCertainty = NATIVE_CONFIRMED
boundaryAtMs
```

use that boundary, clamped no earlier than session start.

## 24.2 Detected boundary with fresh verification

If transition is DETECTED and:

```text
boundaryAtMs - lastVerifiedAtMs <= verificationGraceMs
```

use the detected boundary.

## 24.3 Detected boundary after long unverified gap

If:

```text
boundaryAtMs - lastVerifiedAtMs > verificationGraceMs
```

use `lastVerifiedAtMs` as the conservative end boundary.

The remaining gap is not automatically attributed.

## 24.4 Existing Safety Hold

If a compatible earlier Safety Hold exists, finalization cannot extend beyond the hold without positive evidence resolving it.

**Settled**

---

# 25. Initial Boot with Current SquareCoil Context

After L1/L3 initialize and current SquareCoil Context is positively observed:

1. apply any L2 Recovery Checkpoint reconciliation first;
2. then evaluate the current Context:
   - valid Local Pause candidate for same Context -> LOCAL_PAUSED;
   - zero history -> ACTIVE from safe fresh anchor;
   - remembered history -> PENDING;
3. never restore live ACTIVE solely because old persisted state said Active.

**Settled**

---

# 26. Recovery Checkpoint Reconciliation

Suppose prior runtime ended unexpectedly while ACTIVE A.

L2 may provide evidence-backed recoverable time through `lastVerifiedAtMs`.

## 26.1 Current SquareCoil again verifies A

- finalize any not-yet-ledgered evidence-backed prior interval through prior `lastVerifiedAtMs`;
- do not backfill the crash/unknown gap;
- start/evaluate a new current session from the fresh observation anchor;
- if existing history now exists, the normal remembered/Pending policy applies unless recovery-specific UX later explicitly permits continuation.

For the first rebuilt release, conservative default is **Pending** for a recovered remembered Context rather than silently auto-resuming across an unknown interruption.

## 26.2 Current SquareCoil verifies B

- preserve/finalize only evidence-backed prior A time;
- do not bridge the gap;
- evaluate B normally.

## 26.3 Current SquareCoil has no Context

- preserve/finalize evidence-backed prior A time only;
- enter IDLE.

**Settled**

---

# 27. Local Pause Recovery

If L2 restores a reliable Local Pause candidate for A and fresh SquareCoil evidence still supports A:

- restore `LOCAL_PAUSED(A)`;
- do not convert to Pending;
- do not auto-start;
- Local Resume remains an explicit user action.

If SquareCoil no longer supports A:

- clear the Local Pause marker;
- evaluate the actual current SquareCoil Context normally.

**Settled**

---

# 28. Selected Context Behavior

Selected Context is UI state only.

If:

```text
ACTIVE = A
SELECTED = B
```

then:

- A continues accruing;
- B may display its own Today/Job Total/history;
- selecting B does not Pause A;
- selecting B does not start B;
- B must not visually impersonate the running Context.

A real native SquareCoil Context transition may request UI focus on the incoming Context, but selection itself never causes the transition.

**Settled**

---

# 29. Auto-Focus / Expand Intent

To preserve established useful behavior:

- an actual confirmed native Context identity change may request the UI to select/focus the incoming Context;
- an actual new native Context may request expansion of a manually collapsed timer so the user sees the change;
- same-Context verification/heartbeat must never reopen a manually collapsed timer;
- metadata-only updates must not reopen it;
- selecting another saved tab manually does not clock into it.

The state service emits UI intent; the renderer implements presentation in L5.

**Settled**

---

# 30. Threshold Semantics

Timer thresholds remain configurable:

```text
Yellow
Orange
Red
```

For the rebuild, threshold level is based on **Context Today** time, not lifetime Job Total.

Reason:

- Job Total may span many days and would otherwise remain permanently Red once a long-running project crosses the limit;
- Today represents the current day's useful time-on-job signal;
- current running contribution is included according to L2/L4 rules.

Default values remain conceptually:

```text
Yellow 60 minutes
Orange 120 minutes
Red 240 minutes
```

Validation requires:

```text
1 <= Yellow <= Orange <= Red
```

Thresholds are presentation/status signals only. Crossing a threshold never changes Timer State.

**Settled**

---

# 31. Protected Context Rule

A Context is **protected from ordinary destructive/workspace removal** when any of these are true:

- it is ACTIVE;
- it is PENDING;
- it is LOCAL_PAUSED;
- it is the current positively observed SquareCoil Context;
- a current transition/recovery episode still ties it to unresolved native clock evidence.

Protected Contexts cannot be:

- deleted;
- archived through ordinary Archive;
- removed by Clear Recent;
- hidden when hiding would make active/pending state inaccessible.

L6 defines explicit destructive data operations, but ordinary workspace actions must respect protection.

**Settled**

---

# 32. Tab Hide Rule

A Context tab may be hidden only when it is not protected.

Hiding:

- changes workspace visibility only;
- never deletes Time Ledger data;
- never changes Job Total;
- never changes SquareCoil state.

If a hidden Context later becomes current through SquareCoil, it is automatically made visible before/with incoming Context focus intent.

**Settled**

---

# 33. Cross-Tab Command Rule

User timer actions from any tab must flow through the L2 single-writer coordination service.

For Pause, Resume, Start Fresh, or any authoritative transition command:

- observer tab does not directly mutate state;
- current fenced owner processes the command, or safe ownership transfer occurs;
- command carries expected revision/context so stale commands can be rejected;
- retries are idempotent and must not create duplicate sessions.

**Settled**

---

# 34. Stale User Command

A user command is stale when its expected Context/revision no longer matches current authoritative state.

Examples:

- user clicks Resume A after SquareCoil already moved to B;
- user clicks Pause A after another tab already clocked out;
- user clicks Start Fresh on an old Pending prompt after state changed.

Stale commands:

- do not mutate authoritative time;
- do not create sessions;
- return a normalized rejection so UI can refresh.

**Settled**

---

# 35. Bridge Unavailable While Idle

If the Bridge becomes UNAVAILABLE while Timer State is IDLE:

- remain IDLE;
- do not invent a Context;
- lifecycle may become DEGRADED according to L1;
- automatic tracking cannot begin until positive SquareCoil evidence returns.

**Settled**

---

# 36. Bridge Unavailable While Pending / Local Paused

## PENDING A

- retain Pending A temporarily as remembered user decision state;
- disable Resume/Start Fresh until A is positively verified again;
- if later evidence shows another Context/no Context, reconcile normally.

## LOCAL_PAUSED A

- retain Local Pause marker;
- disable Local Resume until A is positively verified again;
- no accrual occurs.

**Settled**

---

# 37. Bridge Unavailable While Active

If Bridge health becomes UNAVAILABLE while ACTIVE A:

- apply the same verification-grace policy as prolonged STATE_UNKNOWN;
- do not immediately fabricate clock-out;
- after grace expiry, cap accrual at latest trustworthy `lastVerifiedAtMs` with a Safety Hold;
- do not auto-backfill an unknown gap when Bridge later returns.

**Settled**

---

# 38. Persistence Failure During Active Timing

L1/L2 define that normal READY cannot continue when authoritative persistence is unavailable.

L4 behavior:

- do not silently pretend timer mutations were durably committed;
- retain explicit unsafely-uncommitted condition only through the state service's recovery mechanism;
- do not let UI actions bypass persistence through a second storage path;
- if persistence cannot safely recover, apply accrual safety/failure behavior rather than accumulating unbounded uncommitted history.

Exact durable retry mechanism remains an implementation detail of L2 storage.

**Settled**

---

# 39. Reason Vocabulary for Historical Segments

Canonical timer-transition reasons should distinguish at minimum:

```text
native-context-switch
native-context-left
native-clock-out
local-pause
resume
start-fresh
new-context-start
recovery-finalize
unknown-gap-conservative-end
```

Reason metadata supports history/activity understanding but does not create separate time identity.

Exact display labels are deferred to L5/L7.

**Settled conceptual vocabulary**

---

# 40. Core Timer Invariants

## TIMER-01

At most one Context accrues Companion time.

## TIMER-02

Selected Context never changes native or Companion timing by selection alone.

## TIMER-03

Zero-history positively observed Context auto-starts from a safe evidence anchor.

## TIMER-04

Remembered positively observed Context enters Pending unless valid Local Pause recovery applies.

## TIMER-05

Pending accrues no time until valid Resume/Start Fresh.

## TIMER-06

Start Fresh preserves all prior Job/Context Total.

## TIMER-07

Local Pause never mutates SquareCoil.

## TIMER-08

Local Resume never backfills the local-pause interval.

## TIMER-09

Same-project metadata/department changes create no timer boundary.

## TIMER-10

Confirmed native Context changes finalize the prior active session once.

## TIMER-11

Distinct L3 native transition boundaries remain distinct in Timer history.

## TIMER-12

Unknown/conflict state never fabricates clock-out or a new Context.

## TIMER-13

Prolonged unverified state is conservatively capped rather than indefinitely accrued.

## TIMER-14

A later same-Context observation after a long unverified gap does not backfill that gap automatically.

## TIMER-15

Strong unconfirmed native clock-out evidence may freeze accrual before final state confirmation.

## TIMER-16

Protected Contexts cannot be removed by ordinary housekeeping.

## TIMER-17

Cross-tab commands use one fenced authoritative writer.

## TIMER-18

Thresholds are based on Today, not lifetime Job Total, and never change Timer State.

**All Settled**

---

# 41. State Transition Matrix

| Current state | L3 / user input | Result |
|---|---|---|
| IDLE | CONTEXT new zero-history B | ACTIVE B |
| IDLE | CONTEXT remembered B | PENDING B |
| IDLE | recovered valid Local Pause B + CONTEXT B | LOCAL_PAUSED B |
| ACTIVE A | CONTEXT_VERIFIED A | ACTIVE A |
| ACTIVE A | metadata update A | ACTIVE A |
| ACTIVE A | CONTEXT_CHANGED A->B | finalize A, evaluate B |
| ACTIVE A | CONTEXT_LEFT | finalize A, IDLE |
| ACTIVE A | CLOCKED_OUT | finalize A, IDLE |
| ACTIVE A | Local Pause | finalize A, LOCAL_PAUSED A |
| ACTIVE A | UNKNOWN/CONFLICT brief | ACTIVE A provisional |
| ACTIVE A | UNKNOWN/CONFLICT prolonged | ACTIVE A + Safety Hold |
| PENDING A | Resume with verified A | ACTIVE A |
| PENDING A | Start Fresh with verified A | ACTIVE A, new cycle |
| PENDING A | CONTEXT_CHANGED/LEFT/CLOCKED_OUT | clear Pending, reconcile new state |
| LOCAL_PAUSED A | Local Resume with verified A | ACTIVE A |
| LOCAL_PAUSED A | same Context verify | LOCAL_PAUSED A |
| LOCAL_PAUSED A | CONTEXT_CHANGED/LEFT/CLOCKED_OUT | clear Local Pause, reconcile |
| any | stale user command | no mutation, normalized rejection |

**Settled**

---

# 42. L4 Acceptance Scenarios

## C1. Brand-new job

Job A has no history and SquareCoil positively detects A.

Expected:
- Companion auto-starts A;
- session starts at safe observation/native boundary;
- no Resume prompt.

## C2. Remembered job

Job A has historical time and SquareCoil detects A.

Expected:
- state becomes PENDING A;
- no accrual while Pending;
- Resume and Start Fresh are available when A remains verified.

## C3. Resume delayed by 45 seconds

A enters Pending at 10:00:00, user presses Resume at 10:00:45, SquareCoil remains verified A.

Expected:
- Active session starts at safe Pending anchor 10:00:00;
- the 45 seconds are included;
- no time before 10:00:00 is invented.

## C4. Start Fresh preserves history

A has 12h historical time, enters Pending, user chooses Start Fresh.

Expected:
- prior 12h remains;
- new cycleId created;
- new session begins at safe Pending anchor;
- Job Total continues from prior history plus new accrual.

## C5. Local Pause

A is ACTIVE and user selects Local Pause at 11:15:00.

Expected:
- current session finalizes at 11:15:00;
- state becomes LOCAL_PAUSED A;
- SquareCoil native clock is untouched.

## C6. Local Resume

A remains SquareCoil Context while Local Paused. User resumes at 11:25:00.

Expected:
- new session begins at 11:25:00;
- 10-minute pause is not backfilled;
- prior cycle continues.

## C7. Local Resume after SquareCoil changed

A is Local Paused but SquareCoil now verifies B.

Expected:
- Resume A rejected/unavailable;
- Local Pause A cleared by Context transition;
- B evaluated normally.

## C8. Active A direct switch to new B

Native-confirmed A -> B at 12:00:00, B has zero history.

Expected:
- finalize A at 12:00:00;
- auto-start B from 12:00:00;
- one real transition boundary.

## C9. Active A direct switch to remembered B

Expected:
- finalize A;
- B becomes Pending;
- no B accrual until user choice.

## C10. Distinct action-4/action-3 gap

A leaves at 10:00:00, B enters at 10:00:20.

Expected:
- A ends at 10:00:00;
- 20-second gap unattributed;
- B evaluates at 10:00:20.

## C11. Same project department change

SquareCoil action 3 changes department but project ID remains A.

Expected:
- same ACTIVE session continues;
- no new session/cycle;
- label metadata may update.

## C12. Full clock-out

ACTIVE A receives confirmed CLOCKED_OUT at native boundary 15:00:00.

Expected:
- finalize A once at 15:00:00;
- enter IDLE;
- history reason identifies clock-out.

## C13. Context leave while Pending

A is Pending and receives CONTEXT_LEFT.

Expected:
- clear Pending;
- no historical duration added;
- enter IDLE.

## C14. Brief unknown recovers

ACTIVE A becomes STATE_UNKNOWN for 20 seconds, then verified A returns within grace.

Expected:
- session remains continuous;
- no artificial boundary;
- interval remains included.

## C15. Long unknown gap

ACTIVE A loses verification longer than grace.

Expected:
- Safety Hold at latest trustworthy verification;
- no further running contribution after hold;
- no fabricated clock-out.

## C16. Same Context returns after long unknown gap

A returns positively after Safety Hold/grace expiry.

Expected:
- prior evidence-backed session ends at hold/lastVerified boundary;
- unknown gap remains unattributed;
- new A session begins from fresh anchor;
- no automatic backfill.

## C17. Strong unconfirmed action 2

SquareCoil successfully completes action 2 but post-state verification is temporarily unavailable.

Expected:
- Safety Hold at action-2 boundary;
- no further provisional accrual;
- state is not yet confirmed CLOCKED_OUT.

## C18. Strong action 2 later contradicted

Following C17, fresh SquareCoil evidence confirms A is still current.

Expected:
- Safety Hold removed;
- original active session continuity restored;
- interval is included because positive evidence contradicted suspected clock-out.

## C19. Strong action 2 later confirmed

Following C17, clock-out is confirmed.

Expected:
- finalize at action-2 boundary;
- enter IDLE;
- no double finalization.

## C20. Recovery checkpoint same Context

Prior runtime crashed while A active; fresh boot again verifies A.

Expected:
- preserve only evidence-backed prior time through old lastVerifiedAt;
- unknown crash gap not backfilled;
- remembered A enters conservative Pending for the new current period.

## C21. Recovery checkpoint different Context

Prior A, current B.

Expected:
- preserve only evidence-backed A time;
- evaluate B normally;
- no gap bridging.

## C22. Local Pause survives reload

Reliable Local Pause A marker exists and fresh SquareCoil verifies A.

Expected:
- restore LOCAL_PAUSED A;
- no Pending and no auto-start.

## C23. Selected inactive Job B

ACTIVE A, user selects B.

Expected:
- A continues;
- B does not start;
- B cannot visually claim Running state.

## C24. Same-Context heartbeat while collapsed

ACTIVE A is manually collapsed, heartbeat verifies A.

Expected:
- remains collapsed;
- no auto-expand.

## C25. Real native switch while collapsed

ACTIVE A collapsed, SquareCoil switches to B.

Expected:
- timer may request select/focus B and expand so change is visible;
- timing transition follows normal A/B rules.

## C26. Threshold after multiple days

A has 25h lifetime Job Total but only 30m Today.

Expected:
- threshold status uses 30m Today;
- lifetime total does not make A permanently Red.

## C27. Protected Context housekeeping

A is current SquareCoil Context and Local Paused.

Expected:
- Archive/Delete/Clear Recent ordinary actions are unavailable for A.

## C28. Hidden inactive Context becomes current

B is hidden and inactive, then SquareCoil switches to B.

Expected:
- B is made visible;
- incoming Context focus intent may select it;
- timing evaluated normally.

## C29. Observer-tab stale Resume

Observer tab shows Pending A; owner already transitioned to B before command arrives.

Expected:
- Resume A rejected as stale;
- no session created;
- observer refreshes from authoritative state.

## C30. Persistence failure during switch

A -> B transition cannot commit atomically.

Expected:
- transition not presented as successfully durable;
- no alternate UI storage write occurs;
- lifecycle/state layer enters persistence degradation/recovery path.

---

# 43. Continuity States After L4

## Settled

- canonical IDLE/ACTIVE/PENDING/LOCAL_PAUSED behavior;
- zero-history auto-start;
- remembered Context Pending behavior;
- Pending safe-start anchor;
- Resume vs Start Fresh cycle semantics;
- Start Fresh preserves total history;
- Local Pause/Resume behavior;
- direct Context switch behavior;
- distinct native transition gaps;
- Context-left vs full-clock-out handling;
- same-Context verification behavior;
- metadata updates create no boundary;
- strong unconfirmed clock-out Safety Hold;
- short unknown/conflict grace and prolonged conservative hold;
- no automatic backfill after long unverified gap;
- native-confirmed vs detected conservative end-boundary policy;
- Recovery Checkpoint reconciliation behavior;
- selected vs active isolation;
- actual Context-change focus/expand intent;
- threshold semantics based on Today;
- protected Context rules;
- cross-tab authoritative command routing;
- stale user-command rejection.

## Provisional

- exact `verificationGraceMs` value around the 90-second default;
- exact UI wording for Safety Hold/verification degraded states;
- exact cycleId continuation rule when very old/imported history has no meaningful prior cycle;
- exact implementation form of Accrual Safety Hold metadata.

## Open for later stages

- final main-view and Time Overview display rules (L5);
- history presentation labels (L5);
- archive/delete/clear exact workflows (L6);
- manual correction workflows if later added (L6/L8);
- final error/disabled-button UX (L5/L7);
- automated timer fixture implementation (L8/build).

## Blocked

None.

---

# 44. L4 Readiness Judgment

**Status: Ready for review**

L4 is complete when the Timer service can consume normalized L3 events and user commands through the single L2 state writer without inventing start/end boundaries, silently backfilling unknown time, conflating Local Pause with SquareCoil clock state, or allowing ordinary UI selection to change timing.

If accepted, the next stage is:

**L5: Time Views, Recent Jobs, History, and Job Navigation**
