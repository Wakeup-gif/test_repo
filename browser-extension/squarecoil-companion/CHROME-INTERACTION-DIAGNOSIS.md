# Chrome interaction diagnosis

## Symptom

On the initial v0.7.0 Chrome rollout, the Job Timer could be visible while its core interactions, including the Settings gear/menu, did not respond.

## Root cause

`background.js` used two probe signals as if they were equivalent:

- `window.__squareCoilJobTimerUiVersion` exists
- `#ussign-job-timer` exists

They are not equivalent. A timer DOM root can survive as stale/dead UI without the MAIN-world timer runtime being alive. v0.7.0 skipped `page/timer-runtime.js` whenever either the global or the root existed. That allowed a visible timer with no core click controller.

## Correct invariant

The runtime global is authoritative for runtime existence. DOM presence alone is not sufficient.

If the root exists but the runtime global does not:

1. treat the root as stale,
2. remove the stale timer root and its runtime style,
3. inject `page/timer-runtime.js`,
4. probe again and require both the runtime global and timer root before layering controls/workspace/surface modules.

Do not solve this by blindly reinjecting the runtime when the runtime global already exists because that would duplicate timers, intervals, observers, and SquareCoil verification hooks.

## Related v0.7 regression

`page/timer-surface.js` initially observed the entire timer subtree. That contradicted the stability rule established after the old Settings freeze. The Glass presentation layer does not need subtree ownership. It should observe only direct root child replacement and use explicit click/theme hooks for settings patch timing.

## Acceptance checks

- Chrome fresh load: timer appears and Settings opens.
- Chrome stale-root recovery: a root without the runtime global is replaced by a live timer automatically.
- Edge continues to behave the same.
- Settings opens/closes repeatedly without page hangs.
- Glass/Solid changes still persist.
- No duplicate timer runtime or duplicate timer roots.
