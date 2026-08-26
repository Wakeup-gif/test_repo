# SquareCoil Companion Rebuild: Start Here

This file is the recovery checkpoint for the SquareCoil Companion rebuild.

If a ChatGPT conversation is lost, a tool times out, or project context becomes unclear, start here before changing code.

---

## Current checkpoint

**Framework status:** Framework ready for logic  
**Production baseline:** `main` at `9378da24f393b40066816133e7fa0f48063115f0`  
**Production package:** v0.7.1 Chrome Interaction Recovery  
**Planning branch:** `planning/squarecoil-companion-rebuild`  
**Production code changed by planning work:** No

---

## Read in this order

1. `docs/REBUILD-MASTER-PLAN.md`
   - Complete structural source of truth.
   - Architecture, feature inventory, UX, Time Ledger, backup/restore, housekeeping, support, GitHub, browser, testing, and release direction.

2. `docs/LOGIC-STAGE-PLAN.md`
   - Defines the staged handoff to Logic Systems Architect.
   - Prevents logic work from becoming one giant noisy specification.

3. `HANDOFF.md`
   - Historical/current v0.7.x behavior and technical context.
   - Use as source material, not as the rebuild architecture.

4. `CHROME-INTERACTION-DIAGNOSIS.md`
   - Documents the visible-but-dead runtime problem that helped trigger the rebuild.

5. Actual current source files before judging implementation behavior.

---

## Core rebuild decisions already settled

- Preserve known-good existing behavior and saved history.
- Do not continue stacking features onto the v0.7.x patch architecture.
- One shared Chrome/Edge source.
- Chrome-first rebuilt acceptance/package target.
- One timer-state owner.
- One timer UI renderer/router.
- One explicit lifecycle with health/recovery.
- SquareCoil bridge owns native clock observation.
- SquareCoil remains authoritative for the company clock.
- Modular source, consolidated runtime ownership.
- Time Ledger owns authoritative historical hours.
- Main expanded timer shows **Today** and **Job Total**.
- Settings includes **Time Overview** with By Day and By Job views.
- Recent is workspace state, not the historical database.
- Clear Recent must not silently erase authoritative time.
- Archive retains historical time.
- No silent pruning of authoritative job-time history.
- Full Backup JSON, History CSV, and Time Report CSV have different purposes.
- Restored files cannot restore a fake live SquareCoil clock state.
- Timer appearance: Light/Dark/Auto, Light default.
- Panel finish: Solid/Glass, Solid default.
- Website themes: Original/Refined Light/Sleek Dark.
- Dark custom logo only until a light replacement is supplied.
- Settings gets Submit Ticket + Feedback to `cristian@ussignandmill.com`.
- Settings gets optional Support the Developer page with Buy Me a Coffee + Cash App.
- Developer support remains free/no-paywall/no-nag/no-tracking.
- GitHub is the recovery/build/release source of truth.
- Stable/Beta structure is planned.
- Browser runtime smoke tests are required before Stable.

---

## Do not do these things

- Do not infer the role of an unread implementation file from its name alone.
- Do not start the rebuild by rewriting timer behavior from memory.
- Do not let feature modules independently mutate timer JSON.
- Do not reintroduce Settings DOM patch chains.
- Do not use a visible timer root alone as a READY signal.
- Do not silently delete old authoritative time sessions.
- Do not restore an active clock from backup without live SquareCoil verification.
- Do not fork Chrome and Edge into separate applications unless a proven browser difference requires an adapter.
- Do not begin one giant implementation pass before staged logic is reviewed.

---

## Next action

Start **Logic Stage L0: Vocabulary, Invariants, and Compatibility Baseline** from `docs/LOGIC-STAGE-PLAN.md`.

Do not start production rebuild coding yet.

---

## Inputs still needed later

These do not block Logic:

- Buy Me a Coffee URL;
- Cash App cashtag;
- Cash App QR image;
- optional custom Refined Light logo;
- final store/distribution details for the first Chrome upload.

---

## Recovery instruction for a new chat

Tell the assistant:

> Continue the SquareCoil Companion rebuild from the `planning/squarecoil-companion-rebuild` branch in `Wakeup-gif/test_repo`. Read `browser-extension/squarecoil-companion/REBUILD-START-HERE.md`, then the Master Plan and Logic Stage Plan before making any architecture or code decision. Production `main` is the v0.7.1 baseline and should remain untouched until the staged rebuild is ready.
