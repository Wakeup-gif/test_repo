// ==UserScript==
// @name         US Sign - SquareCoil Quick Clock
// @namespace    us-sign-local-tools
// @version      0.1.1
// @description  Compact designer-focused Quick Clock modal for SquareCoil with streamlined project/general clock switching.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @grant        GM_addStyle
// @noframes
// @homepageURL   https://github.com/Wakeup-gif/test_repo
// @source        https://github.com/Wakeup-gif/test_repo/blob/main/tampermonkey/US-Sign-SquareCoil-Quick-Clock.user.js
// @updateURL     https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-SquareCoil-Quick-Clock.user.js
// @downloadURL   https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-SquareCoil-Quick-Clock.user.js
// ==/UserScript==

(function () {
  "use strict";

  const VERSION = "0.1.1";
  const ROOT_ID = "us-sign-quick-clock";
  const STYLE_ID = "us-sign-quick-clock-style";
  const OPEN_BUTTON_ID = "us-sign-quick-clock-open";
  const STORAGE_KEY = "us-sign-quick-clock-preferences-v1";

  const ENDPOINT = "/ajax_time_clock.php";
  const NOTES_ENDPOINT = "/ajax_time_clock_notes.php";

  const MODES = Object.freeze({
    design: { label: "Design", department: "47", requiresJob: true, note: "" },
    cad: { label: "CAD / Shop Drawings", department: "29", requiresJob: true, note: "" },
    switching: { label: "Switching Jobs", department: "labor_code_7", requiresJob: false, note: "Switching between jobs" },
    assets: { label: "Asset Creation", department: "labor_code_7", requiresJob: false, note: "Asset creation & organization" },
    research: { label: "Research", department: "labor_code_7", requiresJob: false, note: "Research" },
    productionCheck: { label: "Production Check", department: "labor_code_7", requiresJob: false, note: "Checking production progress on the shop floor" },
    meeting: { label: "Meeting", department: "labor_code_5", requiresJob: false, note: "" },
    training: { label: "Training", department: "labor_code_6", requiresJob: false, note: "" }
  });

  const state = { open: false, selectedMode: "cad", materialEntered: true, submitting: false, currentContext: null, currentProjectId: "", modalRoot: null, openButton: null };

  function readPrefs() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (parsed && MODES[parsed.selectedMode]) state.selectedMode = parsed.selectedMode;
      if (typeof parsed.materialEntered === "boolean") state.materialEntered = parsed.materialEntered;
    } catch (_) {}
  }

  function writePrefs() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedMode: state.selectedMode, materialEntered: state.materialEntered })); } catch (_) {}
  }

  function clean(value) { return String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(); }

  function detectCurrentProjectId() {
    const url = new URL(location.href);
    const fromUrl = url.searchParams.get("id");
    if (/^\d{5,}$/.test(fromUrl || "")) return fromUrl;
    const hidden = document.querySelector("#plt-project-id")?.value;
    if (/^\d{5,}$/.test(hidden || "")) return hidden;
    const rail = clean(document.querySelector("#pmlt")?.innerText);
    const railMatch = rail.match(/\b(\d{6})\b/);
    return railMatch ? railMatch[1] : "";
  }

  async function post(data, endpoint = ENDPOINT) {
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: new URLSearchParams(Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value ?? "")])))
    });
    return { ok: response.ok, status: response.status, text: await response.text() };
  }

  function parseClockContext(html) {
    const doc = new DOMParser().parseFromString(String(html || ""), "text/html");
    const bodyText = clean(doc.body?.textContent);
    const link = [...doc.querySelectorAll("a[href]")].map(a => a.getAttribute("href") || "").find(href => /project\.php\?id=\d+/i.test(href));
    const projectId = link?.match(/project\.php\?id=(\d+)/i)?.[1] || "";
    const label = bodyText;

    // SquareCoil uses project.php?id=0 for Production (General); id=0 is not a real job.
    // Resolve supported general contexts before nonzero project/job contexts.
    if (/Production\s*\(General\)/i.test(bodyText)) return { type: "general", general: "production-general", label };
    if (/Meeting/i.test(bodyText)) return { type: "general", general: "meeting", label };
    if (/Training/i.test(bodyText)) return { type: "general", general: "training", label };
    if (projectId && projectId !== "0") return { type: "job", projectId, label };

    const clockIn = document.querySelector("#clockin");
    const clockOut = document.querySelector("#clockout");
    const clockInVisible = clockIn && getComputedStyle(clockIn).display !== "none";
    const clockOutVisible = clockOut && getComputedStyle(clockOut).display !== "none";
    if (clockInVisible && !clockOutVisible) return { type: "clocked-out", label: "Clocked out" };
    return { type: "unknown", label: bodyText || "Unknown" };
  }

  async function readCurrentContext() {
    const result = await post({ action: 7 });
    if (!result.ok) throw new Error("Couldn’t read current clock state");
    state.currentContext = parseClockContext(result.text);
    return state.currentContext;
  }

  async function validateProjectDepartment(project, department) {
    const result = await post({ action: 15, project, department });
    if (!result.ok) throw new Error("Validation failed");
    return clean(result.text);
  }

  async function saveNotes(note) {
    if (!note) return;
    const result = await post({ action: 1, notes: note }, NOTES_ENDPOINT);
    if (!result.ok) throw new Error("Couldn’t save clock-in note");
  }

  async function sendClockIn(project, department, note) {
    const result = await post({ action: 3, project, department, notes: note || "" });
    if (!result.ok) throw new Error("Clock-in request failed");
    return result.text;
  }

  async function sendClockOut() {
    const result = await post({ action: 2 });
    if (!result.ok) throw new Error("Clock-out request failed");
    return result.text;
  }

  function modeTarget(mode, jobValue) {
    const config = MODES[mode];
    if (!config) throw new Error("Choose a clock target");
    const project = config.requiresJob ? clean(jobValue) : "";
    if (config.requiresJob && !/^\d{5,}$/.test(project)) throw new Error("Enter a job #");
    return { ...config, project };
  }

  function contextMatchesTarget(context, target) {
    if (!context || !target) return false;
    if (target.requiresJob) {
      if (context.type !== "job" || String(context.projectId) !== String(target.project)) return false;
      const label = clean(context.label).toLowerCase();
      if (target.department === "47") return label.includes("design");
      if (target.department === "29") return label.includes("file writing") || label.includes("cad") || label.includes("shop drawing");
      return false;
    }
    const label = clean(context.label).toLowerCase();
    if (target.department === "labor_code_7") return context.type === "general" && (context.general === "production-general" || label.includes("production (general)"));
    if (target.department === "labor_code_5") return context.type === "general" && (context.general === "meeting" || label.includes("meeting"));
    if (target.department === "labor_code_6") return context.type === "general" && (context.general === "training" || label.includes("training"));
    return false;
  }

  async function quickClockIn() {
    const root = state.modalRoot;
    if (!root || state.submitting) return;
    const status = root.querySelector(".us-qc-status");
    const jobInput = root.querySelector("#us-qc-job");
    let target;
    try { target = modeTarget(state.selectedMode, jobInput?.value); }
    catch (error) { status.textContent = error.message; jobInput?.focus(); return; }

    state.submitting = true;
    updateSubmittingUI(true);
    try {
      status.textContent = "Checking…";
      const before = await readCurrentContext();
      if (contextMatchesTarget(before, target)) { status.textContent = "Already clocked in"; return; }
      const validation = await validateProjectDepartment(target.requiresJob ? target.project : "", target.department);
      if (validation !== "1") throw new Error(validation === "2" ? "Job # is required or not valid" : `SquareCoil blocked this clock-in (${validation || "unknown"})`);
      if (!state.materialEntered && before?.type === "job") throw new Error("Material entry is not complete");
      if (target.note) await saveNotes(target.note);
      status.textContent = "Clocking…";
      await sendClockIn(target.project, target.department, target.note);
      status.textContent = "Verifying…";
      const after = await readCurrentContext();
      if (!contextMatchesTarget(after, target)) throw new Error("Couldn’t verify clock-in");
      state.currentContext = after;
      renderCurrentContext();
      status.textContent = "Clocked in";
      writePrefs();
      setTimeout(() => { if (state.open) closeModal(); }, 700);
    } catch (error) {
      console.error("[Quick Clock]", error);
      status.textContent = error?.message || "Clock-in failed";
    } finally {
      state.submitting = false;
      updateSubmittingUI(false);
    }
  }

  async function quickClockOut() {
    const root = state.modalRoot;
    if (!root || state.submitting) return;
    const button = root.querySelector("[data-action='clock-out']");
    const status = root.querySelector(".us-qc-status");
    if (button.dataset.confirm !== "1") {
      button.dataset.confirm = "1";
      button.textContent = "Confirm Out";
      status.textContent = "Confirm full clock out";
      return;
    }
    state.submitting = true;
    updateSubmittingUI(true);
    try {
      status.textContent = "Clocking out…";
      await sendClockOut();
      status.textContent = "Verifying…";
      const context = await readCurrentContext();
      if (context.type !== "clocked-out") throw new Error("Couldn’t verify clock-out");
      state.currentContext = context;
      renderCurrentContext();
      status.textContent = "Clocked out";
      setTimeout(() => { if (state.open) closeModal(); }, 700);
    } catch (error) {
      console.error("[Quick Clock]", error);
      status.textContent = error?.message || "Clock-out failed";
    } finally {
      button.dataset.confirm = "0";
      button.textContent = "Clock Out";
      state.submitting = false;
      updateSubmittingUI(false);
    }
  }

  function updateSubmittingUI(isSubmitting) {
    const root = state.modalRoot;
    if (!root) return;
    for (const control of root.querySelectorAll("button, input")) {
      if (control.matches(".us-qc-close")) continue;
      control.disabled = isSubmitting;
    }
    const submit = root.querySelector("[data-action='clock-in']");
    if (submit) submit.textContent = isSubmitting ? "Clocking…" : "Clock In";
  }

  function renderCurrentContext() {
    const root = state.modalRoot;
    if (!root) return;
    const current = root.querySelector(".us-qc-current");
    if (!current) return;
    const context = state.currentContext;
    if (!context) { current.textContent = "Reading current clock…"; return; }
    if (context.type === "job") { current.textContent = `${context.projectId} · ${clean(context.label).slice(0, 72)}`; return; }
    current.textContent = context.label || "Clocked out";
  }

  function updateModeUI() {
    const root = state.modalRoot;
    if (!root) return;
    const config = MODES[state.selectedMode];
    for (const button of root.querySelectorAll("[data-mode]")) button.setAttribute("aria-pressed", button.dataset.mode === state.selectedMode ? "true" : "false");
    const jobInput = root.querySelector("#us-qc-job");
    if (jobInput) {
      jobInput.disabled = !config.requiresJob;
      if (config.requiresJob && !jobInput.value) jobInput.value = state.currentProjectId || "";
    }
  }

  function updateMaterialUI() {
    const root = state.modalRoot;
    if (!root) return;
    for (const button of root.querySelectorAll("[data-material]")) button.setAttribute("aria-pressed", String((button.dataset.material === "yes") === state.materialEntered));
  }

  function buildModal() {
    const overlay = document.createElement("div");
    overlay.id = ROOT_ID;
    overlay.innerHTML = `<section class="us-qc-panel" role="dialog" aria-modal="true" aria-labelledby="us-qc-title"><div class="us-qc-head"><div><div id="us-qc-title" class="us-qc-title">Quick Clock</div><div class="us-qc-current">Reading current clock…</div></div><button type="button" class="us-qc-close" aria-label="Close">×</button></div><div class="us-qc-grid"><button type="button" class="us-qc-target" data-mode="design">Design</button><button type="button" class="us-qc-target" data-mode="cad">CAD / Shop Drawings</button></div><div class="us-qc-section"><div class="us-qc-section-label">Production</div><div class="us-qc-grid"><button type="button" class="us-qc-target" data-mode="switching">Switching Jobs</button><button type="button" class="us-qc-target" data-mode="assets">Asset Creation</button><button type="button" class="us-qc-target" data-mode="research">Research</button><button type="button" class="us-qc-target" data-mode="productionCheck">Production Check</button></div></div><div class="us-qc-section us-qc-grid"><button type="button" class="us-qc-target" data-mode="meeting">Meeting</button><button type="button" class="us-qc-target" data-mode="training">Training</button></div><div class="us-qc-bottom"><label class="us-qc-job-label" for="us-qc-job">Job #</label><input id="us-qc-job" class="us-qc-job" inputmode="numeric" autocomplete="off"><div class="us-qc-material"><span>Material entered</span><div class="us-qc-segment" role="group" aria-label="Material entered"><button type="button" data-material="yes">Yes</button><button type="button" data-material="no">No</button></div></div><div class="us-qc-footer"><button type="button" class="us-qc-action us-qc-cancel" data-action="cancel">Cancel</button><button type="button" class="us-qc-action us-qc-clock-in" data-action="clock-in">Clock In</button><button type="button" class="us-qc-action us-qc-clock-out" data-action="clock-out">Clock Out</button></div><div class="us-qc-status" aria-live="polite"></div></div></section>`;
    document.body.appendChild(overlay);
    state.modalRoot = overlay;
    overlay.addEventListener("mousedown", event => { if (event.target === overlay) closeModal(); });
    overlay.querySelector(".us-qc-close")?.addEventListener("click", closeModal);
    overlay.querySelector("[data-action='cancel']")?.addEventListener("click", closeModal);
    overlay.querySelector("[data-action='clock-in']")?.addEventListener("click", quickClockIn);
    overlay.querySelector("[data-action='clock-out']")?.addEventListener("click", quickClockOut);
    for (const button of overlay.querySelectorAll("[data-mode]")) button.addEventListener("click", () => { state.selectedMode = button.dataset.mode; writePrefs(); updateModeUI(); });
    for (const button of overlay.querySelectorAll("[data-material]")) button.addEventListener("click", () => { state.materialEntered = button.dataset.material === "yes"; writePrefs(); updateMaterialUI(); });
    const jobInput = overlay.querySelector("#us-qc-job");
    jobInput?.addEventListener("keydown", event => { if (event.key === "Enter") quickClockIn(); });
    document.addEventListener("keydown", escHandler, true);
    state.currentProjectId = detectCurrentProjectId();
    if (state.currentProjectId) jobInput.value = state.currentProjectId;
    updateModeUI();
    updateMaterialUI();
  }

  function escHandler(event) { if (event.key === "Escape" && state.open) closeModal(); }

  async function openModal() {
    if (state.open) return;
    state.open = true;
    buildModal();
    try { await readCurrentContext(); renderCurrentContext(); } catch (_) { const status = state.modalRoot?.querySelector(".us-qc-status"); if (status) status.textContent = "Couldn’t read current clock"; }
  }

  function closeModal() {
    state.open = false;
    state.submitting = false;
    document.removeEventListener("keydown", escHandler, true);
    state.modalRoot?.remove();
    state.modalRoot = null;
  }

  function installOpenButton() {
    if (document.getElementById(OPEN_BUTTON_ID)) return;
    const anchor = document.querySelector("#clockout") || document.querySelector("#clockin") || document.querySelector(".timeclock-container");
    if (!anchor) return;
    const button = document.createElement("button");
    button.id = OPEN_BUTTON_ID;
    button.type = "button";
    button.textContent = "Quick Clock";
    button.title = "Open Quick Clock";
    button.addEventListener("click", openModal);
    anchor.insertAdjacentElement("afterend", button);
    state.openButton = button;
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `#${OPEN_BUTTON_ID}{margin-left:8px!important;height:34px!important;padding:0 11px!important;border-radius:8px!important;border:1px solid rgba(185,205,220,.18)!important;background:rgba(7,13,18,.34)!important;color:rgba(232,239,244,.9)!important;backdrop-filter:blur(12px) saturate(115%)!important;font:600 12px/1 "Manrope","Segoe UI",Arial,sans-serif!important;cursor:pointer!important}#${ROOT_ID}{position:fixed!important;inset:0!important;z-index:2147483000!important;display:grid!important;place-items:center!important;padding:20px!important;background:rgba(2,7,11,.44)!important;backdrop-filter:blur(8px)!important}#${ROOT_ID} *{box-sizing:border-box!important}#${ROOT_ID} .us-qc-panel{width:min(520px,calc(100vw - 28px))!important;padding:14px!important;border-radius:15px!important;border:1px solid rgba(190,211,228,.24)!important;background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.006)),rgba(10,17,23,.74)!important;color:rgba(239,245,249,.94)!important;box-shadow:0 22px 70px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.03)!important;backdrop-filter:blur(22px) saturate(118%)!important;font-family:"Manrope","Segoe UI",Arial,sans-serif!important}#${ROOT_ID} .us-qc-head{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:12px!important;margin-bottom:10px!important}#${ROOT_ID} .us-qc-title{font-size:17px!important;font-weight:700!important}#${ROOT_ID} .us-qc-current{margin-top:3px!important;max-width:410px!important;overflow:hidden!important;white-space:nowrap!important;text-overflow:ellipsis!important;color:rgba(205,220,230,.62)!important;font-size:10.5px!important}#${ROOT_ID} .us-qc-close{width:30px!important;height:30px!important;border-radius:8px!important;border:1px solid rgba(190,211,228,.15)!important;background:rgba(255,255,255,.022)!important;color:rgba(210,223,232,.68)!important;font-size:18px!important;cursor:pointer!important}#${ROOT_ID} .us-qc-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}#${ROOT_ID} .us-qc-section{margin-top:9px!important}#${ROOT_ID} .us-qc-section-label{display:flex!important;align-items:center!important;gap:8px!important;margin:0 0 5px!important;color:rgba(205,219,230,.52)!important;font-size:9px!important;font-weight:700!important;letter-spacing:.09em!important;text-transform:uppercase!important}#${ROOT_ID} .us-qc-section-label::after{content:""!important;height:1px!important;flex:1!important;background:rgba(190,211,228,.10)!important}#${ROOT_ID} .us-qc-target{min-height:38px!important;padding:7px 10px!important;border-radius:8px!important;border:1px solid rgba(190,211,228,.13)!important;background:rgba(2,7,11,.38)!important;color:rgba(233,241,246,.9)!important;text-align:left!important;font-size:11.5px!important;font-weight:650!important;cursor:pointer!important}#${ROOT_ID} .us-qc-target[aria-pressed="true"]{background:rgba(112,157,188,.12)!important;border-color:rgba(152,191,216,.40)!important}#${ROOT_ID} .us-qc-bottom{margin-top:11px!important;padding-top:10px!important;border-top:1px solid rgba(190,211,228,.11)!important}#${ROOT_ID} .us-qc-job-label{display:block!important;margin-bottom:4px!important;color:rgba(221,232,239,.78)!important;font-size:10px!important;font-weight:650!important}#${ROOT_ID} .us-qc-job{width:100%!important;height:38px!important;padding:0 10px!important;border-radius:8px!important;border:1px solid rgba(190,211,228,.15)!important;background:rgba(0,5,9,.42)!important;color:rgba(240,246,249,.94)!important;font-size:14px!important}#${ROOT_ID} .us-qc-material{height:38px!important;margin-top:6px!important;padding:4px 5px 4px 10px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;border-radius:8px!important;border:1px solid rgba(190,211,228,.12)!important;background:rgba(255,255,255,.016)!important;color:rgba(211,223,231,.70)!important;font-size:10.5px!important}#${ROOT_ID} .us-qc-segment{display:flex!important;gap:2px!important}#${ROOT_ID} .us-qc-segment button{min-width:48px!important;height:27px!important;border:1px solid transparent!important;border-radius:6px!important;background:transparent!important;color:rgba(204,217,227,.62)!important;font-size:10px!important;font-weight:700!important;cursor:pointer!important}#${ROOT_ID} .us-qc-segment button[aria-pressed="true"]{border-color:rgba(147,194,166,.24)!important;background:rgba(130,171,149,.11)!important;color:rgba(224,239,230,.92)!important}#${ROOT_ID} .us-qc-footer{display:grid!important;grid-template-columns:.8fr 1.25fr .9fr!important;gap:6px!important;margin-top:8px!important}#${ROOT_ID} .us-qc-action{height:38px!important;border-radius:8px!important;border:1px solid rgba(190,211,228,.14)!important;font-size:11px!important;font-weight:700!important;cursor:pointer!important}#${ROOT_ID} .us-qc-cancel{background:rgba(255,255,255,.016)!important;color:rgba(204,217,227,.65)!important}#${ROOT_ID} .us-qc-clock-in{background:rgba(112,151,177,.14)!important;border-color:rgba(142,182,207,.26)!important;color:rgba(241,247,251,.95)!important}#${ROOT_ID} .us-qc-clock-out{background:rgba(161,88,88,.075)!important;border-color:rgba(183,111,111,.19)!important;color:rgba(232,198,198,.87)!important}#${ROOT_ID} .us-qc-status{min-height:14px!important;margin-top:5px!important;text-align:center!important;color:rgba(202,216,226,.58)!important;font-size:9px!important}`;
    document.head.appendChild(style);
  }

  function init() {
    readPrefs();
    installStyles();
    installOpenButton();
    const observer = new MutationObserver(() => { if (!state.openButton?.isConnected) installOpenButton(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.__usSignQuickClock = Object.freeze({ version: VERSION, open: openModal, close: closeModal });
  }

  init();
})();
