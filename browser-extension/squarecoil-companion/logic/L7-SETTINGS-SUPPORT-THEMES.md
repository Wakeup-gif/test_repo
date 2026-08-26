# SquareCoil Companion Rebuild
## Logic Stage L7: Settings, Themes, Support, and Developer Support

**Status:** Ready for review  
**Logic stage:** L7  
**Depends on:** L0 invariants, L1 lifecycle, L2 state/time/migration, L3 SquareCoil Bridge, L4 core timer behavior, L5 time views/workspace, L6 data safety/backup  
**Framework authority:** `docs/REBUILD-MASTER-PLAN.md`  
**Purpose:** Define Settings navigation, preferences, appearance/theme behavior, Support/Feedback, diagnostics privacy, and optional developer-support behavior without allowing secondary UI features to own Timer State, lifecycle health, or authoritative historical time.

---

# 1. Scope and Ownership

L7 owns behavior for:

- Settings router/navigation;
- Settings open/close/back behavior;
- Settings route persistence/reset policy;
- state-independent accessibility/focus behavior needed for safe Settings interaction;
- Timer Appearance: Light / Dark / Auto;
- Panel Finish: Solid / Glass;
- SquareCoil Website Theme: Original / Refined Light / Sleek Dark;
- logo switching/fallback behavior;
- Timer Limits preference editing/validation;
- routing to L5 Library views and L6 Archives & Backup;
- Support ticket form;
- Feedback form;
- diagnostics whitelist/preview/copy behavior;
- mail-client transport behavior;
- support transport fallback;
- Developer Support page;
- Buy Me a Coffee external-link behavior;
- Cash App QR/tag display/copy behavior;
- optional/free/no-nag/no-tracking rules;
- failure isolation for all secondary presentation/support features.

L7 does **not**:

- change SquareCoil company clock state;
- write Timer State directly;
- calculate Today/Week/Total independently;
- redefine backup/delete/import semantics;
- implement payment processing;
- collect donation/payment information;
- define final CSS polish or exact visual spacing.

> Settings owns preference/navigation UI. Feature services own their domain behavior. Timer State remains owned by L2/L4.

**Settled scope**

---

# 2. Settings Router Ownership

Exactly one Settings router is owned by the single Companion renderer.

Feature modules do not patch Settings DOM after render and do not insert controls through MutationObserver chains.

Canonical Settings routes support at least:

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

L6 may expose nested Archives & Backup subroutes through the same router.

**Settled**

---

# 3. Settings Home Information Architecture

Settings Home presents these logical groups:

```text
TIMER APPEARANCE
Light | Dark | Auto

PANEL FINISH
Solid | Glass / Blur

LIBRARY
Recent Jobs
Time Overview
History
Activity Log
Archives & Backup

SQUARECOIL
Website Theme

TIMER LIMITS
Yellow | Orange | Red

SUPPORT
Submit a Ticket
Send Feedback

ABOUT
Support the Developer
```

The exact card/list styling is visual implementation. Grouping and ownership are settled.

**Settled**

---

# 4. Open / Close / Back Behavior

## 4.1 Open Settings

Opening Settings from the timer:

- does not change Selected Context;
- does not pause/resume timing;
- opens `SETTINGS_HOME` by default;
- records the element/control that opened Settings so focus can return when closed.

## 4.2 Open subview

Choosing a Settings destination pushes/navigates to that route inside the Companion router.

## 4.3 Back

`Back` returns one Settings level.

For first-level destinations:

```text
Subview -> SETTINGS_HOME
```

For L6 nested destinations, Back returns to the immediate parent inside Archives & Backup before returning Home.

Back never changes timing or browser page navigation.

## 4.4 Close Settings

Close returns to the main Companion timer/view state without changing current Selected Context or Timer State.

## 4.5 Reopen policy

Settings route is transient UI state and is not persisted as durable application preference.

After Settings is fully closed, reopening starts at `SETTINGS_HOME` rather than restoring a stale destructive/support subview.

**Settled**

---

# 5. Browser History Isolation

Internal Settings navigation does not manipulate SquareCoil's browser history or URL merely to represent Settings routes.

The Back control in Settings is an application-router action, not browser Back.

External navigation such as Open Job or developer-support links follows its own explicit navigation contract.

**Settled**

---

# 6. Focus and Keyboard Safety

Settings must remain keyboard-operable without introducing timing shortcuts by accident.

Behavioral requirements:

- opening Settings moves focus into the Settings surface or its first meaningful heading/control;
- closing returns focus to the control that opened Settings when that control still exists;
- route changes move focus to the new view heading/first meaningful target;
- Tab/Shift+Tab follow normal focus order;
- Enter/Space activate the focused control according to native semantics;
- Escape may close the topmost non-destructive dialog or Settings surface when safe, but must never trigger timer Pause/Resume/Delete;
- destructive confirmation cannot be accepted solely because a globally handled key event leaked from the underlying timer;
- hidden Settings controls are not keyboard-focusable.

Exact focus-trap implementation is an implementation detail.

**Settled**

---

# 7. Preference Mutation Contract

Settings preferences are durable non-time application data.

A preference change:

1. validates the requested value;
2. applies through the Preferences service;
3. publishes one preference revision/change event;
4. renderer/theme service reacts idempotently;
5. unrelated Timer State/Time Ledger data is untouched.

Invalid preference values are rejected and the last valid value remains authoritative.

Preference changes do not directly write another feature's storage representation.

**Settled**

---

# 8. First-Install Defaults

First-install defaults are:

```text
Timer Appearance = Light
Panel Finish      = Solid
Website Theme     = Original
```

Timer threshold defaults remain the L4 values:

```text
Yellow = 60 minutes
Orange = 120 minutes
Red    = 240 minutes
```

Migration of existing valid preferences should preserve user choices rather than reapplying first-install defaults.

**Settled**

---

# 9. Timer Appearance

Canonical preference:

```text
LIGHT
DARK
AUTO
```

Timer Appearance affects Companion UI only. It does not change the SquareCoil website theme.

## 9.1 Light

Resolve Companion timer presentation to Light.

## 9.2 Dark

Resolve Companion timer presentation to Dark.

## 9.3 Auto

Auto retains the durable preference `AUTO` and resolves presentation from the current system/browser color-scheme signal.

While Auto is selected:

- system light/dark changes update Companion presentation live;
- the durable preference remains Auto rather than being rewritten to Light/Dark on every system change;
- no timer/state mutation occurs.

If system color-scheme detection is unavailable/invalid, resolve presentation to Light as the safe default while retaining `AUTO` and record a noncritical diagnostic disposition.

**Settled**

---

# 10. Timer Appearance Failure Isolation

If a timer appearance presentation layer fails:

- Timer State and lifecycle timer ownership remain untouched;
- renderer falls back to a readable base/default presentation when possible;
- preference failure is reported at feature/presentation level;
- no extra runtime/root is created as a recovery technique.

A theme/style failure alone cannot cause timer accrual to stop.

**Settled**

---

# 11. Panel Finish

Canonical preference:

```text
SOLID
GLASS
```

Panel Finish is independent from Timer Appearance.

Examples:

```text
Light + Solid
Light + Glass
Dark + Solid
Dark + Glass
Auto-resolved Dark + Glass
```

Glass is optional presentation treatment.

Behavioral requirements:

- expensive blur is concentrated on outer shell/tabs rather than every nested component;
- nested content remains readable and interaction-safe;
- finish never changes Timer State;
- first-install default is Solid.

**Settled**

---

# 12. Glass Capability Fallback

If the platform/browser cannot safely provide the required Glass treatment:

- retain the user's durable `GLASS` preference;
- resolve the current effective finish to `SOLID_FALLBACK`;
- optionally show a concise nonblocking availability note in Settings;
- do not repeatedly retry expensive unsupported effects;
- do not degrade timer lifecycle health.

When capability later becomes available, the effective finish may return to Glass without rewriting the preference.

**Settled**

---

# 13. SquareCoil Website Theme

Canonical Website Theme preference:

```text
ORIGINAL
REFINED_LIGHT
SLEEK_DARK
```

Website Theme affects native SquareCoil presentation only. It is independent from Timer Appearance/Finish.

**Settled**

---

# 14. Original Website Theme

`ORIGINAL` means Companion website-theme presentation is removed and native SquareCoil appearance is restored as closely as possible to the unmodified site.

The theme service must remove only presentation artifacts/classes/styles/logo substitutions it owns.

It must not reset unrelated native/user application state simply to restore Original.

Native SquareCoil logo is used.

**Settled**

---

# 15. Refined Light Website Theme

`REFINED_LIGHT`:

- keeps recognizable SquareCoil structure/proportions;
- applies restrained readability/contrast cleanup;
- preserves native semantic status colors;
- uses the native SquareCoil logo until an approved light custom asset is explicitly supplied.

A custom light logo must not be fabricated by the extension.

**Settled**

---

# 16. Sleek Dark Website Theme

`SLEEK_DARK`:

- preserves SquareCoil structure/proportions;
- uses graphite/charcoal hierarchy;
- avoids glaring white outlines;
- preserves semantic colors such as danger/warning/info/success/hold where meaningful;
- avoids decorative wallpaper as a default requirement;
- uses the approved configured dark-logo asset when available.

Presentation remains subordinate to native content usability.

**Settled**

---

# 17. Website Logo Policy and Fallback

Logo behavior:

```text
Original       -> native logo
Refined Light  -> native logo until approved light asset exists
Sleek Dark     -> configured approved dark logo when available
```

If the dark-logo asset fails to load:

- Sleek Dark may remain active;
- native logo is restored/used as fallback;
- the failure is a noncritical presentation diagnostic;
- timer lifecycle/state remain healthy.

Switching away from Sleek Dark restores the native logo unless another explicitly approved theme-specific asset is configured.

**Settled**

---

# 18. Website Theme Application Contract

Website-theme application is idempotent.

Changing themes:

1. resolves current theme preference;
2. removes/replaces only Companion-owned website-theme artifacts;
3. applies the new presentation;
4. verifies enough presentation ownership to avoid duplicate style/theme layers;
5. emits a feature-level result.

Repeated application of the same theme must not stack duplicate style tags/classes/listeners.

Website-theme failure cannot create a second Companion runtime or timer root.

**Settled**

---

# 19. Timer Limits Settings

Timer Limits edit the L4 threshold preferences only.

Fields:

```text
Yellow minutes
Orange minutes
Red minutes
```

Validation:

```text
integer minutes
1 <= Yellow <= Orange <= Red
```

Behavior:

- invalid draft values do not replace current valid thresholds;
- field/view displays a validation error;
- valid save publishes one preference update;
- threshold changes recalculate presentation status from canonical Today values;
- changing a threshold never creates/ends time.

A `Reset to Defaults` action may restore 60/120/240 after explicit user activation.

**Settled**

---

# 20. Library Routes

Settings Library routes delegate to settled L5/L6 read/action services:

```text
Recent Jobs       -> L5
Time Overview     -> L5
History           -> L5
Activity Log      -> L5/non-authoritative activity service
Archives & Backup -> L6
```

The router may display loading/empty/error states but does not recreate their data logic.

**Settled**

---

# 21. Archives & Backup Routing

`ARCHIVES_BACKUP` is the parent route for L6 actions such as:

- Browse Archives;
- Download Full Backup;
- Restore Backup;
- Export Time Report;
- Export History CSV;
- Import History CSV;
- Clear Recent;
- Manage Archived Jobs;
- danger actions such as Delete All Archived Data / Wipe All Time History.

Settings router owns navigation/back behavior only.

L6 continues to own validation, protection, confirmation, import/export, and destructive semantics.

**Settled**

---

# 22. Support Module Boundary

Support is a secondary feature and never controls timer health.

Initial transport is the user's default email client through a composed `mailto:` action.

The extension:

- does not send mail silently;
- does not require SMTP/API credentials;
- does not run a support backend in the first release;
- does not expose SquareCoil/customer data unless the user explicitly types it into the message or opts into whitelisted diagnostics.

Destination email is configured as:

```text
cristian@ussignandmill.com
```

**Settled**

---

# 23. Submit a Ticket Form

Ticket types:

```text
Bug
Feature Request
Question
Other
```

Required fields:

```text
Type
Subject
Description
```

Optional:

```text
Include Diagnostics
```

Validation:

- Type must be one supported value;
- Subject must contain non-whitespace text;
- Description must contain non-whitespace text;
- implementation may enforce reasonable field-length limits with clear errors;
- validation failure never clears the user's typed draft.

**Settled**

---

# 24. Send Feedback Form

Feedback categories:

```text
Suggestion
UI / UX
Feature Idea
General Feedback
```

Required fields:

```text
Category
Description
```

Optional:

```text
Subject / short title
Include Diagnostics
```

If Subject is omitted, the composed email may derive a concise generic subject from the category without altering the user's description.

Validation failure preserves the draft.

**Settled**

---

# 25. Email Composition

Support email composition is deterministic plain-text output.

Conceptual Ticket subject:

```text
[SquareCoil Companion][Bug] User subject
```

Conceptual Feedback subject:

```text
[SquareCoil Companion Feedback][UI / UX] Optional subject
```

Body includes only:

- user-entered fields;
- optional explicit diagnostic block when enabled;
- minimal app/version header needed to identify the Companion report.

All mailto subject/body values are URI-encoded.

The extension does not auto-submit the message after opening the mail client.

**Settled**

---

# 26. Diagnostics Are Opt-In

Diagnostics inclusion in Ticket/Feedback is **off by default**.

The user must explicitly enable `Include Diagnostics` for that message.

Before email composition, the form exposes the exact diagnostic text to be included or provides an equivalent preview path.

The user can disable diagnostics again without losing their ticket/feedback draft.

**Settled**

---

# 27. Diagnostics Whitelist

Safe diagnostics are generated only from an explicit whitelist.

Allowed categories:

```text
Companion package/version
browser family + browser version
coarse SquareCoil page type
lifecycle state
Bridge capability/status
core module readiness summary
Timer Appearance preference/effective mode
Panel Finish preference/effective mode
Website Theme preference/effective mode
runtime/root count health summary
current timestamp
```

Optional safe health booleans/counts may be added only when they do not expose job/customer/history content.

Diagnostics must **not automatically include**:

```text
customer names
project/job descriptions
project notes
job numbers / active Context IDs
full current URL/query string
page body/form content
Time Ledger records
Today/Job Total history
CSV contents
backup contents
Support draft contents beyond the message itself
SquareCoil private response payloads
cookies/tokens/credentials
email/account identifiers
full raw user-agent when a coarse browser/version value is sufficient
```

Adding a new diagnostic field requires explicit privacy review; it cannot silently expand the whitelist.

**Settled**

---

# 28. Copy Diagnostics

`Copy Diagnostics` generates the same current whitelist output used by Support preview.

Behavior:

- shows/uses only whitelisted fields;
- copy action never includes hidden extra metadata;
- clipboard failure falls back to visible selectable text/manual copy;
- clipboard failure does not affect timer health;
- copying diagnostics does not submit/send them anywhere.

**Settled**

---

# 29. Submit by Email / Mailto Behavior

On valid Support submission:

1. build the deterministic subject/body;
2. include diagnostics only if opted in;
3. open a `mailto:` target to the configured support email;
4. leave actual sending to the user's mail client.

Because browsers cannot reliably prove that a local mail handler successfully opened, the Support screen also keeps a visible fallback such as:

```text
Copy Message
Copy Diagnostics
Copy Support Email
```

After mailto launch, UI may say conceptually:

> If your mail app did not open, copy the message instead.

It must not falsely claim `Ticket sent` merely because the mailto URL was opened.

**Settled**

---

# 30. Mailto Size / Composition Failure

If composed mailto content is too large or cannot be safely generated:

- do not truncate the user's description/diagnostics silently and call it complete;
- keep the draft intact;
- offer Copy Message / Copy Diagnostics;
- optionally omit diagnostics only after explicit user choice;
- timer state remains unaffected.

**Settled**

---

# 31. Support Draft Lifecycle

Ticket/Feedback drafts are transient Settings state by default.

Navigating between Support form and its immediate preview/back path preserves the current draft during that open Settings session.

Closing Settings may discard the transient draft unless a future explicit Save Draft feature is added.

The first release does not persist Support message bodies into general preferences, diagnostics, Activity Log, or backups.

**Settled**

---

# 32. Support Activity Logging

Activity Log may record only minimal non-content events such as:

```text
support-ticket-mailto-opened
support-feedback-mailto-opened
diagnostics-copied
```

It must not store:

- Subject;
- Description;
- diagnostic text;
- copied message body;
- customer/job details contained in a user draft.

Support Activity is never authoritative time.

**Settled**

---

# 33. Future Support Transport Boundary

Support uses a transport interface conceptually:

```text
SupportTransport.compose(message)
SupportTransport.submitOrOpen(message)
```

Initial implementation:

```text
EmailTransport -> mailto/default mail client
```

A future API transport may be added only with separate privacy/security design. L7 does not authorize hidden network submission or embedded credentials.

**Settled**

---

# 34. Developer Support Is Separate from Technical Support

Developer Support lives at:

```text
ABOUT
-> Support the Developer
```

It is not a Ticket/Feedback destination and does not receive diagnostics.

It must clearly communicate:

- the Companion is free;
- updates are free;
- tips are optional;
- no feature is locked behind payment.

**Settled**

---

# 35. Developer Support Content Contract

Developer Support page supports:

```text
Playful short copy
Buy Me a Coffee button
Cash App QR image
Cash App cashtag/name
Copy Cash App name
free / free-updates / optional-tip statement
```

Tone may use restrained caffeine/bug-fix/weird-div/tiny-development-gremlin humor while remaining workplace-appropriate.

The page must not become a modal nag or interrupt normal timer work.

**Settled**

---

# 36. Missing Developer-Support Configuration

Configuration still required outside logic:

```text
Buy Me a Coffee URL
Cash App cashtag/name
Cash App QR packaged asset
```

Missing configuration does not block L7 or timer implementation.

Behavior:

- unavailable payment method is hidden or shown as clearly unavailable;
- no placeholder link/cashtag/QR is fabricated;
- remaining configured developer-support methods continue to work;
- Settings/Timer lifecycle remains healthy.

**Settled**

---

# 37. Buy Me a Coffee Link

If configured:

- URL must be a valid intentional HTTPS external destination;
- activation opens the external destination explicitly, normally in a new browser tab/window;
- implementation uses normal safe external-link isolation such as no opener relationship where applicable;
- navigation does not send diagnostics, timer history, job Context, or donation-tracking identifier from Companion;
- failed navigation is a feature-level error only.

No donation result is read back into Companion.

**Settled**

---

# 38. Cash App QR / Cashtag

If configured:

- QR image is a packaged/approved asset referenced by configuration;
- Companion does not generate a payment request dynamically from user data;
- cashtag/name is displayed exactly as configured after basic configuration validation;
- Copy copies only the configured cashtag/name;
- clipboard failure provides visible/manual-copy fallback;
- no payment status is tracked.

The extension does not handle card, bank, Cash App login, or payment credentials.

**Settled**

---

# 39. No Nag / No Tracking Rules

Developer Support must never:

- show startup nags;
- show update nags;
- auto-open after install/update;
- display persistent donation badges on the timer;
- reduce functionality for non-donors;
- alter timer limits or access based on donation;
- track whether the user donated;
- store payment status;
- use analytics to infer donation completion.

The user sees Developer Support only by intentionally navigating to it.

**Settled**

---

# 40. Secondary Feature Failure Isolation

Failure of any of these must not stop or restart timer tracking:

```text
Timer theme styling
Glass finish
Website theme
custom logo
Support form
mailto launch
clipboard copy
Developer Support
external developer-support link
QR asset
```

A failed secondary feature:

- exposes a local feature-level error/fallback;
- may record privacy-safe diagnostic status;
- does not create a second runtime;
- does not clear Timer State/history;
- does not downgrade lifecycle unless the failure reveals an independent core problem already covered by L1.

**Settled**

---

# 41. Settings Loading / Error States

Settings routes distinguish:

```text
loading
loaded
loaded-empty
feature-unavailable
error
```

Rules:

- failure in one destination does not blank unrelated Settings Home sections;
- known prior data is not silently replaced with zero because a read failed;
- Retry is offered where the underlying feature supports safe retry;
- a destructive action is not enabled while its required L6 data/protection state is unknown;
- error screens preserve a path Back/Home/Close.

**Settled**

---

# 42. Settings and Timer State Isolation

Settings navigation itself never:

- pauses/resumes a Context;
- changes Selected Context unless the invoked L5 feature explicitly performs a normal selection action;
- clocks into SquareCoil;
- finalizes a session;
- changes Today/Total;
- changes Recent/Archive except through explicit L5/L6 actions.

Opening Settings while ACTIVE must leave the timer running normally.

**Settled**

---

# 43. Cross-Tab Preference Synchronization

Durable presentation/settings preferences synchronize across live Companion tabs through the normal preference/state event channel.

Rules:

- another tab receiving a preference change updates presentation idempotently;
- per-tab transient route/focus state is not forcibly synchronized;
- one tab opening Developer Support does not open it in other tabs;
- one tab choosing Timer Dark may update Timer Appearance in other tabs because that is durable preference;
- one tab's Support draft is never synchronized to another tab.

**Settled**

---

# 44. Preference Import / Restore Interaction

L6 Restore may import compatible preferences according to its Merge/Replace policy.

After a restored preference revision commits:

- L7 re-resolves effective Timer Appearance/Finish/Website Theme;
- invalid/unavailable effective presentation falls back according to L7 capability rules;
- no restored preference may create live Timer State;
- Support drafts and Developer Support navigation are never restored from backup.

**Settled**

---

# 45. L7 Invariants

- **SETTINGS-01:** One router/renderer owns Settings UI.
- **SETTINGS-02:** Settings routes never become Timer State writers.
- **SETTINGS-03:** Closing/reopening Settings returns to Home rather than stale destructive routes.
- **SETTINGS-04:** Focus/keyboard behavior cannot leak destructive/timer commands to underlying UI.
- **PREF-01:** First install defaults Light / Solid / Original.
- **PREF-02:** Auto retains Auto preference while resolving current system Light/Dark.
- **PREF-03:** Glass capability failure may fall back visually without changing timing.
- **THEME-01:** Website Theme is independent from Timer Appearance.
- **THEME-02:** Original restores Companion-owned website-theme modifications only.
- **THEME-03:** Refined Light uses native logo until an approved light asset exists.
- **THEME-04:** Sleek Dark logo failure falls back to native logo without timer failure.
- **THEME-05:** Theme application is idempotent and cannot stack duplicate presentation layers.
- **LIMIT-01:** Timer Limit validation preserves `1 <= Yellow <= Orange <= Red`.
- **SUPPORT-01:** Ticket/Feedback messages are user-triggered and not silently sent.
- **SUPPORT-02:** Diagnostics are opt-in, previewable, and whitelist-only.
- **SUPPORT-03:** Diagnostics automatically exclude job/customer/history/private SquareCoil content.
- **SUPPORT-04:** Mailto launch is not falsely reported as a sent ticket.
- **SUPPORT-05:** Support drafts/message contents are not stored in Activity/backup/preferences by default.
- **DEV-01:** Developer Support is optional, free-feature preserving, and non-nagging.
- **DEV-02:** Missing payment configuration never fabricates destinations or breaks Settings.
- **DEV-03:** Companion never handles payment credentials or tracks donation completion.
- **FAIL-01:** Secondary presentation/support failure cannot become timer failure.

**All Settled**

---

# 46. Acceptance Scenarios

## S1 Open Settings while ACTIVE

ACTIVE A continues running; Settings opens Home; no timer mutation.

## S2 Close Settings

Return to main timer with same Selected Context and operational state.

## S3 Reopen Settings

After full close, Settings reopens at Home, not prior Delete/Restore/Support subview.

## S4 Back from Time Overview

Returns to Settings Home; browser/SquareCoil page navigation unchanged.

## S5 Nested Archives Back

Nested restore/archive screen -> Archives & Backup parent -> Settings Home.

## S6 Keyboard Close

Escape closes a safe topmost Settings layer but never triggers Pause/Resume/Delete underneath.

## S7 First install defaults

Timer Light + Solid + Website Original.

## S8 Existing migrated preferences

Valid existing preference survives rebuild instead of being overwritten by first-install default.

## S9 Timer Dark

Companion timer changes to Dark; native SquareCoil Website Theme remains unchanged.

## S10 Auto system switch

Auto + OS changes light to dark -> effective Companion timer changes; durable preference remains Auto.

## S11 Auto detection unavailable

Effective timer resolves Light fallback; preference remains Auto; timer health unaffected.

## S12 Glass supported

Glass selected -> effective Glass presentation; no timing change.

## S13 Glass unsupported

Preference remains Glass, effective Solid fallback, feature note/diagnostic allowed, timer remains healthy.

## S14 Website Original

Companion-owned website theme artifacts removed; native SquareCoil logo restored.

## S15 Refined Light

Refined Light applies restrained site treatment and native logo; no fabricated light logo.

## S16 Sleek Dark

Dark theme applies independently from Timer Appearance and uses configured dark logo when available.

## S17 Dark logo failure

Sleek Dark remains usable with native-logo fallback; no timer/lifecycle restart.

## S18 Reapply same Website Theme

No duplicate style tags/classes/listeners are stacked.

## S19 Threshold invalid ordering

Yellow 120 / Orange 60 / Red 240 -> save rejected; prior valid thresholds remain.

## S20 Threshold valid save

60/120/240 or another ordered valid set saves once and presentation recalculates without changing time.

## S21 Reset thresholds

Explicit Reset returns defaults; no timer boundary created.

## S22 Ticket missing subject

Validation error; description/type/draft preserved; no mailto opened.

## S23 Valid Bug ticket

Build encoded mailto to configured support email with typed subject/description; mail client decides actual send.

## S24 Feedback without optional subject

Valid generic subject derived from category; description preserved exactly.

## S25 Diagnostics default off

Ticket contains no diagnostic block until user explicitly opts in.

## S26 Diagnostics preview

Preview shows exact whitelist output that will be appended.

## S27 Diagnostics privacy

Current job/customer/history exists but diagnostics contain no job number, label, URL query, history rows, CSV, backup, token, or private page payload.

## S28 Copy Diagnostics

Copies only visible whitelist output; nothing is transmitted.

## S29 Clipboard unavailable

Selectable diagnostics/message remain available for manual copy; timer unaffected.

## S30 Mail handler unavailable

Mailto may fail to visibly open; UI does not say Sent and provides Copy Message/Email fallback.

## S31 Mailto too large

Draft is preserved; content is not silently truncated; Copy Message offered.

## S32 Support draft Back

Moving to preview/back inside same Settings session preserves draft.

## S33 Close Support draft

Closing Settings may discard transient draft; it is not silently written into backup/preferences/activity.

## S34 Support Activity privacy

Activity may record `support-ticket-mailto-opened` but not subject/description/diagnostic block.

## S35 Developer Support free statement

Page clearly states Companion and updates are free and tips optional.

## S36 Missing all developer-support config

Page does not fabricate URL/cashtag/QR; unavailable methods are hidden/disabled gracefully; timer remains healthy.

## S37 Buy Me a Coffee configured

Intentional HTTPS external navigation opens; no job/history/diagnostics tracking parameters are added by Companion.

## S38 Cash App configured

Approved QR shown; cashtag copied exactly; no payment status tracked.

## S39 QR asset missing

Cash App QR method degrades locally; Settings and timer remain healthy.

## S40 No donation nag

Install/update/startup never auto-opens Developer Support and no timer badge appears.

## S41 Cross-tab Timer Appearance

Tab 1 chooses Dark -> Tab 2 updates durable timer appearance; Tab 2's current Settings route/Selected Context remain independent.

## S42 Cross-tab Support draft

Tab 1 draft never appears in Tab 2.

## S43 Restored appearance preference

L6 Restore commits valid Dark/Glass preference -> L7 applies it; unavailable Glass still falls back safely.

## S44 Feature route failure

Activity/Support/Theme subview fails -> Back/Home/Close remain usable; timer state/history untouched.

## S45 Destructive state unknown

Archives & Backup cannot enable a destructive action until L6 protection/current-state facts are loaded.

## S46 Original site theme with Dark timer

Native SquareCoil stays Original while Companion timer remains Dark; axes are independent.

## S47 Sleek Dark site with Light timer

SquareCoil is Sleek Dark while Companion timer stays Light; axes are independent.

## S48 General Context active while Settings open

Settings actions/presentation changes do not modify Production General timing.

## S49 Theme switch during active provisional time

Provisional timer status/time truth stays intact while presentation theme changes.

## S50 Support diagnostics during degraded Bridge

Diagnostics may report coarse Bridge capability/lifecycle state but do not include the last job/context identity.

---

# 47. Continuity States After L7

## Settled

- one Settings router/renderer;
- Home IA and transient route policy;
- open/close/back/browser-history isolation;
- keyboard/focus safety contract;
- preference validation/change events;
- first-install defaults;
- Timer Light/Dark/Auto including Auto fallback/system-change behavior;
- Solid/Glass independence and capability fallback;
- Original/Refined Light/Sleek Dark independence;
- native-logo/light-logo/dark-logo policy and failure fallback;
- idempotent website-theme application;
- Timer Limit validation/reset behavior;
- Library/Archives routing boundaries;
- mailto-based initial Support transport;
- Ticket/Feedback categories/validation;
- opt-in diagnostics preview and explicit whitelist/exclusions;
- Copy Diagnostics/Message fallbacks;
- Support draft privacy/lifecycle;
- minimal non-content Support activity logging;
- future support transport boundary;
- Developer Support free/optional/no-nag/no-tracking behavior;
- missing developer-support config fallback;
- external-link and Cash App QR/copy behavior;
- secondary feature failure isolation;
- cross-tab preference synchronization with per-tab transient state isolation.

## Provisional

- exact Settings visual layout/spacing/icons;
- exact final microcopy/status labels;
- exact theme CSS tokens/selector implementation;
- exact Glass capability detection method;
- exact approved dark-logo packaging/reference implementation;
- future approved light custom-logo asset;
- exact field-length limits for Support forms;
- exact mailto size threshold;
- Buy Me a Coffee URL;
- Cash App cashtag/name;
- Cash App QR packaged asset;
- exact playful Developer Support copy.

## Open for L8 / implementation

- cross-module failure-priority matrix;
- final user-visible error wording across core vs secondary failures;
- exact browser smoke-test fixtures for Settings/theme/Support;
- theme-selector regression fixtures against current SquareCoil DOM;
- mailto/clipboard/browser-external-link test harness behavior;
- Chrome/Edge acceptance parity.

## Blocked

None.

---

# 48. L7 Readiness Judgment

**Status: Ready for review**

L7 is ready for review when Settings, presentation themes, Support/Feedback, diagnostics, and Developer Support can be implemented without introducing a second timer/UI owner, leaking private SquareCoil content by default, confusing mailto launch with ticket delivery, or allowing optional presentation/payment-link failures to affect timer health.

If accepted and hardened, the next stage is:

**L8: Failure Behavior, Acceptance Criteria, and Implementation Handoff**