# SquareCoil Companion Lab

This is a sealed, manual test website for the real unpacked Companion extension.

## Safety boundary

- It creates a fresh temporary browser profile and copies only the exact extension package files into a temporary package directory.
- The address bar uses the audited SquareCoil origin so the production extension is exercised without a divergent development manifest.
- Every SquareCoil request is fulfilled in memory. Unexpected web traffic is blocked before DNS.
- No normal Chrome profile, login, cookie, customer record, or real SquareCoil clock action is available to the lab.
- Only exact Bing wallpaper requests may reach Bing after the user grants the optional browser permission.
- Closing the lab browser removes only the verified temporary profile and package directories it created.

## Start

From this extension directory:

```text
npm run lab:chrome
```

or:

```text
npm run lab:edge
```

## Suggested manual journey

1. Clock into fictional job `910001`.
2. Wait a few seconds, then switch to `910002`.
3. Open Companion and inspect the job tabs, Today totals, Recent Jobs, Time Overview, and History.
4. Leave the current job, then clock into `910003` to preserve the no-context gap.
5. Fully clock out and confirm the final session appears once.
6. Try appearance and website themes. If desired, grant the optional Bing permission from the trusted extension toolbar popup.

The guided tour performs those fake actions automatically, with short pauses, only after the button is clicked.

## Maintainer smoke check

```text
npm run lab:smoke
npm run lab:smoke:edge
```

These use fresh headless installed Chrome and Edge profiles, record eight fictional clock actions across three numbered jobs and Production General through the real observation pipeline, exercise the real local Resume choice on two known-Context revisits, verify one Companion root and the exact six finalized logical History sessions, then remove their temporary profile and package copy. They are development checks, not release acceptance.

The smoke check also verifies that four browser-like Context tabs sit above and before the Companion shell in a fixed `1280 × 720` viewport, overflow horizontally, respond to horizontal wheel/trackpad input, reveal keyboard-selected tabs, and reorder through a real drag without changing Context membership or selection. It drags an inactive fictional job onto the lab page, verifies the full-page archive veil and its message do not overlap the Companion shell, then cancels before release and confirms the job remains open. The same cancellation and prompt checks run at a narrow viewport, where the veil must rise above the Companion. Finally, trusted Settings clicks exercise matched Dark + Glass and Light + Glass Companion/website themes without optional Bing permission, verify the singular fallback background host and truthful status text, reject opposite-theme surfaces and washed-out strong or muted text, and restore Light + Solid with Native / Off.

## Visual evidence

To keep deterministic screenshots in a directory you choose outside temporary storage and outside this Git repository:

```text
npm run lab:evidence -- --evidence-dir "C:\path\to\empty-evidence-folder"
npm run lab:evidence:edge -- --evidence-dir "C:\path\to\separate-empty-edge-evidence-folder"
```

Each command creates `01-tabs-short-viewport.png`, `02-archive-veil-preview.png`, `03-dark-glass-fallback.png`, `04-light-glass-fallback.png`, and `visual-evidence.json`. Use separate empty directories because the deterministic filenames intentionally refuse overwrite. The manifest binds browser version, package candidate fingerprint, source SHA/dirty state, screenshot digests, and the explicit non-acceptance lab scope. The screenshots contain only fictional lab data and built-in gradients—not generated wallpaper art; no real SquareCoil page or account is opened.
