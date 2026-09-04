// ==UserScript==
// @name         US Sign - SquareCoil Quick Clock
// @namespace    us-sign-local-tools
// @version      0.3.0
// @description  Designer-focused SquareCoil Quick Clock with project validation, pending-job confirmation, Production General note presets, and direct Design/CAD actions.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-idle
// @noframes
// @homepageURL  https://github.com/Wakeup-gif/test_repo
// @source       https://github.com/Wakeup-gif/test_repo/blob/utility/squarecoil-quick-clock-v0.3.0/tampermonkey/US-Sign-SquareCoil-Quick-Clock.user.js
// @updateURL    https://github.com/Wakeup-gif/test_repo/raw/refs/heads/utility/squarecoil-quick-clock-v0.3.0/tampermonkey/US-Sign-SquareCoil-Quick-Clock.user.js
// @downloadURL  https://github.com/Wakeup-gif/test_repo/raw/refs/heads/utility/squarecoil-quick-clock-v0.3.0/tampermonkey/US-Sign-SquareCoil-Quick-Clock.user.js
// ==/UserScript==

(() => {
  'use strict';

  if (window.__usSignSquareCoilQuickClockV030) return;
  window.__usSignSquareCoilQuickClockV030 = true;

  const VERSION = '0.3.0';
  const ROOT_ID = 'us-sign-quick-clock';
  const OPEN_ID = 'us-sign-quick-clock-open';
  const PROJECT_HOST_ID = 'us-sign-project-quick-clock';
  const STYLE_ID = 'us-sign-quick-clock-style';
  const PREF_KEY = 'us-sign-quick-clock-preferences-v1';
  const ENDPOINT = '/ajax_time_clock.php';
  const NOTES_ENDPOINT = '/ajax_time_clock_notes.php';
  const REQUEST_TIMEOUT_MS = 12000;

  const MODES = Object.freeze({
    design: Object.freeze({
      label: 'Design',
      shortLabel: 'DESIGN CLOCK IN',
      category: 'job',
      department: '47',
      requiresJob: true,
      note: '',
      verify: /\bdesign\b/i
    }),
    cad: Object.freeze({
      label: 'CAD / Shop Drawings',
      shortLabel: 'CAD / SHOP DRAWINGS',
      category: 'job',
      department: '29',
      requiresJob: true,
      note: '',
      verify: /file writing|cad|shop drawing/i
    }),
    switching: Object.freeze({
      label: 'Switching Jobs',
      category: 'production',
      department: 'labor_code_7',
      requiresJob: false,
      note: 'Switching between jobs'
    }),
    assets: Object.freeze({
      label: 'Asset Creation',
      category: 'production',
      department: 'labor_code_7',
      requiresJob: false,
      note: 'Asset creation & organization'
    }),
    research: Object.freeze({
      label: 'Research',
      category: 'production',
      department: 'labor_code_7',
      requiresJob: false,
      note: 'Research'
    }),
    productionCheck: Object.freeze({
      label: 'Production Check',
      category: 'production',
      department: 'labor_code_7',
      requiresJob: false,
      note: 'Checking production progress on the shop floor'
    }),
    meeting: Object.freeze({
      label: 'Meeting',
      category: 'general',
      general: 'meeting',
      department: 'labor_code_5',
      requiresJob: false,
      note: ''
    }),
    training: Object.freeze({
      label: 'Training',
      category: 'general',
      general: 'training',
      department: 'labor_code_6',
      requiresJob: false,
      note: ''
    })
  });

  const state = {
    open: false,
    submitting: false,
    selectedMode: 'design',
    materialsLogged: true,
    currentContext: null,
    currentProjectId: '',
    modalRoot: null,
    pendingConfirmation: null,
    lastAction7Html: ''
  };

  const clean = value => String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function readPrefs() {
    try {
      const pref = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
      if (MODES[pref.selectedMode]) state.selectedMode = pref.selectedMode;
      if (typeof pref.materialsLogged === 'boolean') {
        state.materialsLogged = pref.materialsLogged;
      } else if (typeof pref.materialEntered === 'boolean') {
        state.materialsLogged = pref.materialEntered;
      }
    } catch (_) {}
  }

  function writePrefs() {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({
        selectedMode: state.selectedMode,
        materialsLogged: state.materialsLogged
      }));
    } catch (_) {}
  }

  function currentProjectId(nativeButton = null) {
    const fromButton = clean(nativeButton?.dataset?.id);
    if (/^\d{5,}$/.test(fromButton)) return fromButton;

    const urlId = new URL(location.href).searchParams.get('id') || '';
    if (/^\d{5,}$/.test(urlId)) return urlId;

    const hidden = clean(document.querySelector('#plt-project-id')?.value);
    if (/^\d{5,}$/.test(hidden)) return hidden;

    const railText = clean(document.querySelector('#pmlt')?.innerText);
    return railText.match(/\b(\d{6})\b/)?.[1] || '';
  }

  async function post(data, endpoint = ENDPOINT, timeoutMs = REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: new URLSearchParams(
          Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
              key,
              String(value ?? '')
            ])
          )
        ),
        signal: controller.signal
      });

      return {
        ok: response.ok,
        status: response.status,
        text: await response.text()
      };
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error('SquareCoil did not respond');
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  function parseClockContext(html, options = {}) {
    const doc = new DOMParser().parseFromString(
      String(html || ''),
      'text/html'
    );

    const label = clean(doc.body?.textContent);
    const href = [...doc.querySelectorAll('a[href]')]
      .map(anchor => anchor.getAttribute('href') || '')
      .find(value => /project\.php\?id=\d+/i.test(value));

    const projectId =
      href?.match(/project\.php\?id=(\d+)/i)?.[1] || '';

    if (projectId && projectId !== '0') {
      return {
        type: 'job',
        projectId,
        label
      };
    }

    if (/Production\s*\(General\)/i.test(label)) {
      return {
        type: 'general',
        general: 'production-general',
        projectId: '',
        label
      };
    }

    if (/\bMeeting\b/i.test(label)) {
      return {
        type: 'general',
        general: 'meeting',
        projectId: '',
        label
      };
    }

    if (/\bTraining\b/i.test(label)) {
      return {
        type: 'general',
        general: 'training',
        projectId: '',
        label
      };
    }

    if (options.afterClockOut && !label && !projectId) {
      return {
        type: 'clocked-out',
        projectId: '',
        label: 'Clocked out'
      };
    }

    const clockIn = document.querySelector('#clockin');
    const clockOut = document.querySelector('#clockout');
    const clockInVisible =
      clockIn && getComputedStyle(clockIn).display !== 'none';
    const clockOutVisible =
      clockOut && getComputedStyle(clockOut).display !== 'none';

    if (clockInVisible && !clockOutVisible) {
      return {
        type: 'clocked-out',
        projectId: '',
        label: 'Clocked out'
      };
    }

    return {
      type: 'unknown',
      projectId: '',
      label: label || 'Unknown'
    };
  }

  async function readCurrentContext(options = {}) {
    const result = await post({ action: 7 });
    if (!result.ok) throw new Error('Could not read current clock');

    state.lastAction7Html = result.text;
    state.currentContext = parseClockContext(result.text, options);
    return {
      context: state.currentContext,
      html: result.text
    };
  }

  function syncNativeClockUI(context, html = '') {
    const clockIn = document.querySelector('#clockin');
    const clockOut = document.querySelector('#clockout');
    const debug = document.querySelector('#clockin-debug');

    if (context?.type === 'clocked-out') {
      if (clockIn) clockIn.style.display = 'inline-block';
      if (clockOut) clockOut.style.display = 'none';
      if (debug) debug.innerHTML = '';
    } else {
      if (clockIn) clockIn.style.display = 'none';
      if (clockOut) clockOut.style.display = 'inline-block';
      if (debug && html) debug.innerHTML = html;
    }

    document.dispatchEvent(new CustomEvent('us-sign-quick-clock:changed', {
      detail: {
        version: VERSION,
        context: context ? {
          type: context.type,
          projectId: context.projectId || '',
          general: context.general || '',
          label: context.label || ''
        } : null
      }
    }));
  }

  function makeTarget(mode, jobValue) {
    const base = MODES[mode];
    if (!base) throw new Error('Choose where to clock in');

    const project = base.requiresJob ? clean(jobValue) : '';

    if (base.requiresJob && !/^\d{5,}$/.test(project)) {
      throw new Error('Enter a valid job #');
    }

    if (
      base.department === 'labor_code_7' &&
      base.category === 'production' &&
      !clean(base.note)
    ) {
      throw new Error('Choose a Production activity');
    }

    return {
      ...base,
      mode,
      project
    };
  }

  function contextMatchesTarget(context, target) {
    if (!context || !target) return false;

    if (target.requiresJob) {
      return (
        context.type === 'job' &&
        String(context.projectId) === String(target.project) &&
        target.verify.test(clean(context.label))
      );
    }

    if (target.category === 'production') return false;

    if (target.department === 'labor_code_5') {
      return context.type === 'general' && context.general === 'meeting';
    }

    if (target.department === 'labor_code_6') {
      return context.type === 'general' && context.general === 'training';
    }

    return false;
  }

  function isLeavingNumberedJob(before, target) {
    if (before?.type !== 'job') return false;
    return !contextMatchesTarget(before, target);
  }

  async function saveSessionNotes(note) {
    const result = await post(
      {
        action: 1,
        notes: note || ''
      },
      NOTES_ENDPOINT
    );

    if (!result.ok) throw new Error('Could not save clock note');
  }

  function classifyValidation(departmentCode, projectCode, target) {
    const dept = clean(departmentCode);
    const project = clean(projectCode);

    if (dept === '3' || project === '3') {
      return {
        kind: 'pending',
        departmentCode: dept,
        projectCode: project
      };
    }

    if (project === '2') {
      return {
        kind: target.requiresJob ? 'closed-or-unavailable' : 'blocked',
        departmentCode: dept,
        projectCode: project
      };
    }

    if (dept === '2') {
      return {
        kind: target.requiresJob ? 'invalid-job' : 'blocked',
        departmentCode: dept,
        projectCode: project
      };
    }

    if (dept === '1' && project === '1') {
      return {
        kind: 'ready',
        departmentCode: dept,
        projectCode: project
      };
    }

    return {
      kind: 'blocked',
      departmentCode: dept,
      projectCode: project
    };
  }

  async function validateTarget(target) {
    const departmentResult = await post({
      action: 15,
      project: target.requiresJob ? target.project : '',
      department: target.department
    });

    if (!departmentResult.ok) {
      throw new Error('Department validation failed');
    }

    const projectResult = await post({
      action: 12,
      project: target.requiresJob ? target.project : ''
    });

    if (!projectResult.ok) throw new Error('Job validation failed');

    return classifyValidation(
      departmentResult.text,
      projectResult.text,
      target
    );
  }

  async function readPendingPrompt(target) {
    const result = await post({
      action: 14,
      project_id: target.project,
      department_id: target.department,
      notes: target.note || ''
    });

    if (!result.ok) {
      return {
        title: 'Pending job',
        message: 'Clock in anyway?'
      };
    }

    const doc = new DOMParser().parseFromString(
      result.text,
      'text/html'
    );

    const raw = clean(
      doc.querySelector('.alert')?.textContent ||
      doc.body?.textContent ||
      ''
    );

    const status =
      raw.match(/This job is (.+?)\.\s*Are you sure/i)?.[1] ||
      raw.match(/This job is (.+?)\s+Are you sure/i)?.[1] ||
      'Pending job';

    return {
      title: clean(status),
      message: 'Clock in anyway?'
    };
  }

  async function sendClockIn(target, useSessionNote = false) {
    const payload = {
      action: 3,
      project: target.requiresJob ? target.project : '',
      department: target.department
    };

    if (useSessionNote) {
      payload.notes_from_session = 1;
    } else {
      payload.notes = target.note || '';
    }

    const result = await post(payload);
    if (!result.ok) throw new Error('Clock-in request failed');
  }

  async function verifyTarget(target) {
    let last = null;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      if (attempt) await sleep(250);
      last = await readCurrentContext();

      if (
        target.category === 'production' &&
        last.context?.type === 'general' &&
        last.context?.general === 'production-general'
      ) {
        return last;
      }

      if (contextMatchesTarget(last.context, target)) return last;
    }

    throw new Error('Could not verify clock-in');
  }

  async function completeClockIn(target, options = {}) {
    if (options.status) options.status('Clocking in…');
    await sendClockIn(target, Boolean(options.useSessionNote));
    if (options.status) options.status('Verifying…');

    const verified = await verifyTarget(target);
    state.currentContext = verified.context;
    syncNativeClockUI(verified.context, verified.html);
    return verified.context;
  }

  async function prepareClockIn(target, options = {}) {
    const current = await readCurrentContext();
    const before = current.context;

    if (contextMatchesTarget(before, target)) {
      return {
        kind: 'already',
        context: before
      };
    }

    if (
      isLeavingNumberedJob(before, target) &&
      !state.materialsLogged
    ) {
      return {
        kind: 'materials-required',
        context: before
      };
    }

    await saveSessionNotes(target.note || '');
    const validation = await validateTarget(target);

    if (validation.kind === 'pending') {
      const prompt = await readPendingPrompt(target);
      return {
        kind: 'pending',
        target,
        context: before,
        prompt,
        validation
      };
    }

    if (validation.kind === 'closed-or-unavailable') {
      throw new Error('Job is closed or unavailable');
    }

    if (validation.kind === 'invalid-job') {
      throw new Error('Job # is not valid');
    }

    if (validation.kind !== 'ready') {
      throw new Error('SquareCoil blocked this clock-in');
    }

    const context = await completeClockIn(target, {
      status: options.status,
      useSessionNote: false
    });

    return {
      kind: 'clocked',
      context
    };
  }

  function currentContextLabel() {
    const context = state.currentContext;
    if (!context) return 'Reading current clock…';

    if (context.type === 'job') {
      const label = clean(context.label);
      const suffix = label
        .replace(new RegExp(`.*?${context.projectId}\\s*[/·-]?\\s*`, 'i'), '')
        .trim();

      return suffix
        ? `${context.projectId} · ${suffix}`
        : context.projectId;
    }

    return context.label || 'Clocked out';
  }

  function renderCurrentContext() {
    const element = state.modalRoot?.querySelector('.us-qc-current');
    if (element) element.textContent = currentContextLabel();
  }

  function setStatus(text, tone = '') {
    const status = state.modalRoot?.querySelector('.us-qc-status');
    if (!status) return;
    status.textContent = text || '';
    status.dataset.tone = tone;
  }

  function setModalBusy(value, label = '') {
    const root = state.modalRoot;
    if (!root) return;

    root.dataset.busy = String(Boolean(value));

    root.querySelectorAll('button,input').forEach(element => {
      if (!element.classList.contains('us-qc-close')) {
        element.disabled = Boolean(value);
      }
    });

    const submit = root.querySelector('[data-action="clock-in"]');
    if (submit) {
      submit.textContent = label || (
        state.pendingConfirmation
          ? 'Confirm Clock In'
          : 'Clock In'
      );
    }
  }

  function clearPendingConfirmation() {
    state.pendingConfirmation = null;

    const root = state.modalRoot;
    if (!root) return;

    const pending = root.querySelector('.us-qc-pending');
    const checkbox = root.querySelector('#us-qc-pending-ok');

    if (pending) pending.hidden = true;
    if (checkbox) checkbox.checked = false;

    const submit = root.querySelector('[data-action="clock-in"]');
    if (submit) {
      submit.textContent = 'Clock In';
      submit.disabled = false;
    }
  }

  function showPendingConfirmation(result) {
    state.pendingConfirmation = result;

    const root = state.modalRoot;
    if (!root) return;

    const pending = root.querySelector('.us-qc-pending');
    const title = root.querySelector('.us-qc-pending-title');
    const checkbox = root.querySelector('#us-qc-pending-ok');
    const submit = root.querySelector('[data-action="clock-in"]');

    if (title) {
      title.textContent = result.prompt?.title || 'Pending job';
    }

    if (pending) pending.hidden = false;
    if (checkbox) checkbox.checked = false;

    if (submit) {
      submit.textContent = 'Confirm Clock In';
      submit.disabled = true;
    }

    setStatus('Confirmation required', 'warning');
  }

  function updateModalUI() {
    const root = state.modalRoot;
    if (!root) return;

    root.querySelectorAll('[data-mode]').forEach(button => {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.mode === state.selectedMode)
      );
    });

    root.querySelectorAll('[data-material]').forEach(button => {
      button.setAttribute(
        'aria-pressed',
        String(
          (button.dataset.material === 'yes') ===
          state.materialsLogged
        )
      );
    });

    const mode = MODES[state.selectedMode];
    const job = root.querySelector('#us-qc-job');
    const materialRow = root.querySelector('.us-qc-material');

    if (job) {
      job.disabled = !mode.requiresJob;
      if (mode.requiresJob && !job.value) {
        job.value = state.currentProjectId || '';
      }
    }

    let target = null;
    try {
      target = makeTarget(state.selectedMode, job?.value || '');
    } catch (_) {}

    const showMaterials =
      Boolean(target) &&
      isLeavingNumberedJob(state.currentContext, target);

    if (materialRow) materialRow.hidden = !showMaterials;

    const submit = root.querySelector('[data-action="clock-in"]');
    if (submit && !state.submitting) {
      if (state.pendingConfirmation) {
        const pendingOK = root.querySelector('#us-qc-pending-ok');
        submit.disabled = !pendingOK?.checked;
        submit.textContent = 'Confirm Clock In';
      } else {
        submit.disabled =
          mode.requiresJob &&
          !/^\d{5,}$/.test(clean(job?.value));
        submit.textContent = 'Clock In';
      }
    }
  }

  async function modalClockIn() {
    if (state.submitting || !state.modalRoot) return;

    const root = state.modalRoot;
    const jobValue = root.querySelector('#us-qc-job')?.value || '';

    let target;

    try {
      target = state.pendingConfirmation?.target ||
        makeTarget(state.selectedMode, jobValue);
    } catch (error) {
      setStatus(error.message, 'error');
      return;
    }

    if (state.pendingConfirmation) {
      const checkbox = root.querySelector('#us-qc-pending-ok');

      if (!checkbox?.checked) {
        setStatus('Check the pending-job confirmation', 'warning');
        return;
      }

      state.submitting = true;
      setModalBusy(true, 'Clocking in…');

      try {
        const context = await completeClockIn(target, {
          status: text => setStatus(text),
          useSessionNote: true
        });

        state.pendingConfirmation = null;
        state.currentContext = context;
        renderCurrentContext();
        setStatus('Clocked in', 'success');
        writePrefs();
        setTimeout(closeModal, 650);
      } catch (error) {
        console.error('[Quick Clock pending]', error);
        setStatus(error?.message || 'Clock-in failed', 'error');
      } finally {
        state.submitting = false;
        setModalBusy(false);
        updateModalUI();
      }

      return;
    }

    state.submitting = true;
    setModalBusy(true, 'Checking…');
    setStatus('Checking…');

    try {
      const result = await prepareClockIn(target, {
        status: text => setStatus(text)
      });

      if (result.kind === 'already') {
        setStatus('Already clocked in', 'success');
        state.currentContext = result.context;
        renderCurrentContext();
      } else if (result.kind === 'materials-required') {
        setStatus('Mark Materials logged to continue', 'warning');
      } else if (result.kind === 'pending') {
        showPendingConfirmation(result);
      } else if (result.kind === 'clocked') {
        state.currentContext = result.context;
        renderCurrentContext();
        setStatus('Clocked in', 'success');
        writePrefs();
        setTimeout(closeModal, 650);
      }
    } catch (error) {
      console.error('[Quick Clock]', error);
      setStatus(error?.message || 'Clock-in failed', 'error');
    } finally {
      state.submitting = false;
      setModalBusy(false);
      updateModalUI();
    }
  }

  async function verifyClockOut() {
    let consecutiveEmpty = 0;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      if (attempt) await sleep(250);

      const result = await post({ action: 7 });
      if (!result.ok) continue;

      const parsed = parseClockContext(result.text, {
        afterClockOut: true
      });

      if (parsed.type === 'clocked-out') {
        consecutiveEmpty += 1;

        if (consecutiveEmpty >= 2) {
          state.lastAction7Html = result.text;
          state.currentContext = parsed;
          return {
            context: parsed,
            html: result.text
          };
        }
      } else {
        consecutiveEmpty = 0;
      }
    }

    throw new Error('Could not verify clock-out');
  }

  async function modalClockOut() {
    if (state.submitting || !state.modalRoot) return;

    const root = state.modalRoot;
    const button = root.querySelector('[data-action="clock-out"]');

    if (button.dataset.confirm !== '1') {
      button.dataset.confirm = '1';
      button.textContent = 'Confirm Out';
      setStatus('Confirm full clock out', 'warning');
      return;
    }

    state.submitting = true;
    setModalBusy(true, 'Clocking out…');
    setStatus('Clocking out…');

    try {
      const result = await post({ action: 2 });

      if (!result.ok) throw new Error('Clock-out request failed');

      const verified = await verifyClockOut();
      state.currentContext = verified.context;
      syncNativeClockUI(verified.context, verified.html);
      renderCurrentContext();
      setStatus('Clocked out', 'success');
      setTimeout(closeModal, 650);
    } catch (error) {
      console.error('[Quick Clock clock-out]', error);
      setStatus(error?.message || 'Clock-out failed', 'error');
    } finally {
      button.dataset.confirm = '0';
      button.textContent = 'Clock Out';
      state.submitting = false;
      setModalBusy(false);
      updateModalUI();
    }
  }

  function buildModal(options = {}) {
    document.getElementById(ROOT_ID)?.remove();

    const overlay = document.createElement('div');
    overlay.id = ROOT_ID;

    overlay.innerHTML = `
      <section class="us-qc-panel" role="dialog" aria-modal="true" aria-labelledby="us-qc-title">
        <header class="us-qc-head">
          <div class="us-qc-heading">
            <div class="us-qc-title" id="us-qc-title">Quick Clock</div>
            <div class="us-qc-current">Reading current clock…</div>
          </div>
          <button class="us-qc-close" type="button" aria-label="Close">×</button>
        </header>

        <div class="us-qc-grid us-qc-job-modes">
          <button class="us-qc-target" type="button" data-mode="design">Design</button>
          <button class="us-qc-target" type="button" data-mode="cad">CAD / Shop Drawings</button>
        </div>

        <section class="us-qc-section" aria-labelledby="us-qc-production-label">
          <div class="us-qc-section-label" id="us-qc-production-label">Production General</div>
          <div class="us-qc-grid">
            <button class="us-qc-target" type="button" data-mode="switching">Switching Jobs</button>
            <button class="us-qc-target" type="button" data-mode="assets">Asset Creation</button>
            <button class="us-qc-target" type="button" data-mode="research">Research</button>
            <button class="us-qc-target" type="button" data-mode="productionCheck">Production Check</button>
          </div>
        </section>

        <div class="us-qc-grid us-qc-general-modes">
          <button class="us-qc-target" type="button" data-mode="meeting">Meeting</button>
          <button class="us-qc-target" type="button" data-mode="training">Training</button>
        </div>

        <div class="us-qc-bottom">
          <label for="us-qc-job">Job #</label>
          <input id="us-qc-job" inputmode="numeric" autocomplete="off" maxlength="12">

          <div class="us-qc-material" hidden>
            <span>Materials logged</span>
            <div class="us-qc-toggle" role="group" aria-label="Materials logged">
              <button type="button" data-material="yes">Yes</button>
              <button type="button" data-material="no">No</button>
            </div>
          </div>

          <label class="us-qc-pending" hidden>
            <input id="us-qc-pending-ok" type="checkbox">
            <span>
              <strong class="us-qc-pending-title">Pending job</strong>
              <small>Clock in anyway</small>
            </span>
          </label>

          <footer class="us-qc-footer">
            <button type="button" data-action="cancel">Cancel</button>
            <button type="button" data-action="clock-in">Clock In</button>
            <button type="button" data-action="clock-out">Clock Out</button>
          </footer>

          <div class="us-qc-status" role="status" aria-live="polite"></div>
        </div>
      </section>
    `;

    document.body.appendChild(overlay);
    state.modalRoot = overlay;

    state.currentProjectId = clean(options.jobValue) || currentProjectId();

    const job = overlay.querySelector('#us-qc-job');
    if (state.currentProjectId) job.value = state.currentProjectId;

    overlay.querySelector('.us-qc-close').addEventListener('click', closeModal);
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', closeModal);
    overlay.querySelector('[data-action="clock-in"]').addEventListener('click', modalClockIn);
    overlay.querySelector('[data-action="clock-out"]').addEventListener('click', modalClockOut);

    overlay.querySelectorAll('[data-mode]').forEach(button => {
      button.addEventListener('click', () => {
        if (state.submitting) return;

        state.selectedMode = button.dataset.mode;
        clearPendingConfirmation();
        setStatus('');
        writePrefs();
        updateModalUI();

        if (MODES[state.selectedMode].requiresJob) {
          overlay.querySelector('#us-qc-job')?.focus();
        }
      });
    });

    overlay.querySelectorAll('[data-material]').forEach(button => {
      button.addEventListener('click', () => {
        state.materialsLogged = button.dataset.material === 'yes';
        writePrefs();
        updateModalUI();
      });
    });

    overlay.querySelector('#us-qc-pending-ok').addEventListener(
      'change',
      event => {
        const submit = overlay.querySelector('[data-action="clock-in"]');
        if (submit && state.pendingConfirmation) {
          submit.disabled = !event.target.checked;
        }
      }
    );

    job.addEventListener('input', () => {
      clearPendingConfirmation();
      updateModalUI();
    });

    job.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        modalClockIn();
      }
    });

    overlay.addEventListener('mousedown', event => {
      if (event.target === overlay && !state.submitting) closeModal();
    });

    document.addEventListener('keydown', escapeModal, true);

    if (options.mode && MODES[options.mode]) {
      state.selectedMode = options.mode;
    }

    updateModalUI();
  }

  function escapeModal(event) {
    if (event.key === 'Escape' && state.open && !state.submitting) {
      closeModal();
    }
  }

  async function openModal(options = {}) {
    if (state.open) return;

    state.open = true;
    state.pendingConfirmation = null;
    buildModal(options);

    try {
      const current = await readCurrentContext();
      state.currentContext = current.context;
      renderCurrentContext();
      updateModalUI();

      if (options.pendingResult) {
        showPendingConfirmation(options.pendingResult);
      }
    } catch (error) {
      console.error('[Quick Clock read current]', error);
      setStatus('Could not read current clock', 'error');
    }
  }

  function closeModal() {
    if (state.submitting) return;

    state.open = false;
    state.submitting = false;
    state.pendingConfirmation = null;
    state.modalRoot?.remove();
    state.modalRoot = null;
    document.removeEventListener('keydown', escapeModal, true);
  }

  function findProjectClockButton() {
    const exact = document.querySelector(
      '#time-clock-clock-in-to-project-from-project'
    );

    if (exact) return exact;

    const rail =
      document.querySelector('#pmlt') ||
      document.querySelector('#sidebar_left');

    if (!rail) return null;

    return [...rail.querySelectorAll('a,button')].find(element =>
      clean(element.textContent).toUpperCase() === 'CLOCK IN'
    ) || null;
  }

  function setProjectButtonsDisabled(disabled) {
    document
      .querySelectorAll(`#${PROJECT_HOST_ID} button`)
      .forEach(button => {
        button.disabled = Boolean(disabled);
      });
  }

  function flashProjectButton(button, text, error = false) {
    if (!button) return;

    const original = button.dataset.original || button.textContent;
    button.dataset.original = original;
    button.textContent = text;
    button.classList.toggle('us-qc-error', error);

    setTimeout(() => {
      if (!button.isConnected) return;
      button.textContent = original;
      button.classList.remove('us-qc-error');
    }, 1500);
  }

  async function projectQuickClock(mode, button, nativeButton) {
    if (state.submitting) return;

    const project = currentProjectId(nativeButton);

    if (!project) {
      flashProjectButton(button, 'NO JOB #', true);
      return;
    }

    let target;

    try {
      target = makeTarget(mode, project);
    } catch (error) {
      flashProjectButton(button, clean(error.message).toUpperCase(), true);
      return;
    }

    state.submitting = true;
    setProjectButtonsDisabled(true);
    button.textContent = 'CHECKING…';

    try {
      const result = await prepareClockIn(target);

      if (result.kind === 'already') {
        flashProjectButton(button, 'ALREADY CLOCKED');
      } else if (result.kind === 'materials-required') {
        state.submitting = false;
        setProjectButtonsDisabled(false);

        await openModal({
          mode,
          jobValue: project
        });

        setStatus('Mark Materials logged to continue', 'warning');
        return;
      } else if (result.kind === 'pending') {
        state.submitting = false;
        setProjectButtonsDisabled(false);

        await openModal({
          mode,
          jobValue: project,
          pendingResult: result
        });

        return;
      } else if (result.kind === 'clocked') {
        flashProjectButton(button, 'CLOCKED IN');
      }
    } catch (error) {
      console.error('[Quick Clock project]', error);
      flashProjectButton(
        button,
        clean(error?.message || 'FAILED').toUpperCase(),
        true
      );
    } finally {
      state.submitting = false;
      setProjectButtonsDisabled(false);
    }
  }

  function installProjectButtons() {
    const existing = document.getElementById(PROJECT_HOST_ID);
    if (existing) return;

    const native = findProjectClockButton();
    const project = currentProjectId(native);

    if (!native || !project) return;

    const host = document.createElement('div');
    host.id = PROJECT_HOST_ID;

    ['design', 'cad'].forEach(mode => {
      const target = MODES[mode];
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'us-qc-project-btn';
      button.textContent = target.shortLabel;
      button.dataset.original = target.shortLabel;

      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        projectQuickClock(mode, button, native);
      });

      host.appendChild(button);
    });

    native.insertAdjacentElement('afterend', host);
    native.style.setProperty('display', 'none', 'important');
  }

  function installOpenButton() {
    if (document.getElementById(OPEN_ID)) return;

    const anchor =
      document.querySelector('#clockout') ||
      document.querySelector('#clockin') ||
      document.querySelector('.timeclock-container');

    if (!anchor) return;

    const button = document.createElement('button');
    button.id = OPEN_ID;
    button.type = 'button';
    button.textContent = 'Quick Clock';
    button.addEventListener('click', () => openModal());

    anchor.insertAdjacentElement('afterend', button);
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;

    style.textContent = `
      #${OPEN_ID}{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        height:36px!important;
        min-height:36px!important;
        margin:0 0 0 8px!important;
        padding:0 11px!important;
        border:1px solid rgba(185,205,220,.18)!important;
        border-radius:8px!important;
        background:rgba(7,13,18,.34)!important;
        color:rgba(232,239,244,.9)!important;
        -webkit-backdrop-filter:blur(12px)!important;
        backdrop-filter:blur(12px)!important;
        font:600 12px/1 Manrope,"Segoe UI",Arial,sans-serif!important;
        cursor:pointer!important;
        vertical-align:middle!important
      }

      #${PROJECT_HOST_ID}{
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:6px!important;
        width:100%!important;
        margin-top:8px!important
      }

      #${PROJECT_HOST_ID} .us-qc-project-btn{
        width:100%!important;
        min-height:36px!important;
        padding:7px 10px!important;
        border:1px solid rgba(180,204,222,.18)!important;
        border-radius:7px!important;
        background:rgba(8,15,21,.52)!important;
        color:rgba(230,239,245,.92)!important;
        -webkit-backdrop-filter:blur(12px)!important;
        backdrop-filter:blur(12px)!important;
        font:700 11px/1.15 Manrope,"Segoe UI",Arial,sans-serif!important;
        cursor:pointer!important
      }

      #${PROJECT_HOST_ID} .us-qc-project-btn:hover{
        background:rgba(255,255,255,.052)!important;
        border-color:rgba(195,216,230,.28)!important
      }

      #${PROJECT_HOST_ID} .us-qc-project-btn.us-qc-error{
        border-color:rgba(189,105,105,.35)!important;
        color:rgba(239,194,194,.92)!important
      }

      #${ROOT_ID}{
        position:fixed!important;
        inset:0!important;
        z-index:2147483000!important;
        display:grid!important;
        place-items:center!important;
        padding:18px!important;
        background:rgba(2,7,11,.44)!important;
        -webkit-backdrop-filter:blur(8px)!important;
        backdrop-filter:blur(8px)!important
      }

      #${ROOT_ID} *{box-sizing:border-box!important}

      #${ROOT_ID} .us-qc-panel{
        width:min(500px,calc(100vw - 28px))!important;
        padding:14px!important;
        border:1px solid rgba(190,211,228,.22)!important;
        border-radius:15px!important;
        background:
          linear-gradient(180deg,rgba(255,255,255,.024),rgba(255,255,255,.005)),
          rgba(10,17,23,.78)!important;
        color:rgba(239,245,249,.94)!important;
        box-shadow:0 22px 70px rgba(0,0,0,.34)!important;
        -webkit-backdrop-filter:blur(22px) saturate(118%)!important;
        backdrop-filter:blur(22px) saturate(118%)!important;
        font-family:Manrope,"Segoe UI",Arial,sans-serif!important
      }

      #${ROOT_ID} .us-qc-head{
        display:flex!important;
        align-items:flex-start!important;
        justify-content:space-between!important;
        gap:12px!important;
        margin-bottom:10px!important
      }

      #${ROOT_ID} .us-qc-title{
        font-size:17px!important;
        font-weight:700!important;
        line-height:1.2!important
      }

      #${ROOT_ID} .us-qc-current{
        max-width:410px!important;
        margin-top:3px!important;
        overflow:hidden!important;
        white-space:nowrap!important;
        text-overflow:ellipsis!important;
        color:rgba(205,220,230,.62)!important;
        font-size:10.5px!important
      }

      #${ROOT_ID} .us-qc-close{
        width:30px!important;
        height:30px!important;
        padding:0!important;
        border:1px solid rgba(190,211,228,.15)!important;
        border-radius:8px!important;
        background:rgba(255,255,255,.022)!important;
        color:rgba(210,223,232,.68)!important;
        font-size:18px!important;
        line-height:1!important;
        cursor:pointer!important
      }

      #${ROOT_ID} .us-qc-grid{
        display:grid!important;
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:6px!important
      }

      #${ROOT_ID} .us-qc-section{margin-top:9px!important}
      #${ROOT_ID} .us-qc-general-modes{margin-top:9px!important}

      #${ROOT_ID} .us-qc-section-label{
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
        margin:0 0 5px!important;
        color:rgba(205,219,230,.55)!important;
        font-size:9px!important;
        font-weight:700!important;
        letter-spacing:.09em!important;
        text-transform:uppercase!important
      }

      #${ROOT_ID} .us-qc-section-label:after{
        content:""!important;
        height:1px!important;
        flex:1!important;
        background:rgba(190,211,228,.10)!important
      }

      #${ROOT_ID} .us-qc-target{
        min-height:38px!important;
        padding:7px 10px!important;
        border:1px solid rgba(190,211,228,.13)!important;
        border-radius:8px!important;
        background:rgba(2,7,11,.38)!important;
        color:rgba(233,241,246,.9)!important;
        text-align:left!important;
        font-size:11.5px!important;
        font-weight:650!important;
        cursor:pointer!important
      }

      #${ROOT_ID} .us-qc-target:hover{
        background:rgba(255,255,255,.044)!important
      }

      #${ROOT_ID} .us-qc-target[aria-pressed="true"]{
        background:rgba(112,157,188,.12)!important;
        border-color:rgba(152,191,216,.40)!important
      }

      #${ROOT_ID} .us-qc-bottom{
        margin-top:11px!important;
        padding-top:10px!important;
        border-top:1px solid rgba(190,211,228,.11)!important
      }

      #${ROOT_ID} .us-qc-bottom>label[for="us-qc-job"]{
        display:block!important;
        margin-bottom:4px!important;
        font-size:10px!important;
        font-weight:650!important
      }

      #${ROOT_ID} #us-qc-job{
        width:100%!important;
        height:38px!important;
        padding:0 10px!important;
        border:1px solid rgba(190,211,228,.15)!important;
        border-radius:8px!important;
        outline:none!important;
        background:rgba(0,5,9,.42)!important;
        color:rgba(240,246,249,.94)!important;
        font-size:14px!important
      }

      #${ROOT_ID} #us-qc-job:focus{
        border-color:rgba(142,203,255,.42)!important;
        box-shadow:0 0 0 3px rgba(142,203,255,.08)!important
      }

      #${ROOT_ID} #us-qc-job:disabled{
        opacity:.38!important;
        cursor:not-allowed!important
      }

      #${ROOT_ID} .us-qc-material{
        min-height:38px!important;
        margin-top:6px!important;
        padding:4px 5px 4px 10px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        border:1px solid rgba(190,211,228,.12)!important;
        border-radius:8px!important;
        background:rgba(255,255,255,.016)!important;
        color:rgba(211,223,231,.72)!important;
        font-size:10.5px!important
      }

      #${ROOT_ID} .us-qc-material[hidden]{display:none!important}
      #${ROOT_ID} .us-qc-toggle{display:flex!important;gap:3px!important}

      #${ROOT_ID} .us-qc-material button{
        min-width:46px!important;
        height:27px!important;
        padding:0 8px!important;
        border:1px solid transparent!important;
        border-radius:6px!important;
        background:transparent!important;
        color:rgba(204,217,227,.62)!important;
        font-size:10px!important;
        font-weight:700!important;
        cursor:pointer!important
      }

      #${ROOT_ID} .us-qc-material button[aria-pressed="true"]{
        border-color:rgba(147,194,166,.24)!important;
        background:rgba(130,171,149,.11)!important;
        color:rgba(224,239,230,.92)!important
      }

      #${ROOT_ID} .us-qc-pending{
        min-height:42px!important;
        margin:6px 0 0!important;
        padding:7px 9px!important;
        display:flex!important;
        align-items:center!important;
        gap:9px!important;
        border:1px solid rgba(205,164,91,.25)!important;
        border-radius:8px!important;
        background:rgba(188,139,53,.085)!important;
        color:rgba(240,224,190,.92)!important;
        cursor:pointer!important
      }

      #${ROOT_ID} .us-qc-pending[hidden]{display:none!important}

      #${ROOT_ID} .us-qc-pending input{
        width:16px!important;
        height:16px!important;
        margin:0!important;
        accent-color:#d5a751!important
      }

      #${ROOT_ID} .us-qc-pending span{
        display:flex!important;
        flex-direction:column!important;
        gap:1px!important
      }

      #${ROOT_ID} .us-qc-pending strong{
        font-size:10.5px!important;
        font-weight:700!important
      }

      #${ROOT_ID} .us-qc-pending small{
        color:rgba(230,211,172,.72)!important;
        font-size:9px!important
      }

      #${ROOT_ID} .us-qc-footer{
        display:grid!important;
        grid-template-columns:.8fr 1.25fr .9fr!important;
        gap:6px!important;
        margin-top:8px!important
      }

      #${ROOT_ID} .us-qc-footer button{
        height:38px!important;
        border:1px solid rgba(190,211,228,.14)!important;
        border-radius:8px!important;
        background:rgba(255,255,255,.016)!important;
        color:rgba(230,239,245,.88)!important;
        font-size:11px!important;
        font-weight:700!important;
        cursor:pointer!important
      }

      #${ROOT_ID} [data-action="clock-in"]{
        background:rgba(112,151,177,.14)!important;
        border-color:rgba(142,182,207,.26)!important
      }

      #${ROOT_ID} [data-action="clock-out"]{
        background:rgba(161,88,88,.075)!important;
        border-color:rgba(183,111,111,.19)!important;
        color:rgba(232,198,198,.87)!important
      }

      #${ROOT_ID} button:disabled{
        opacity:.44!important;
        cursor:wait!important
      }

      #${ROOT_ID} .us-qc-status{
        min-height:14px!important;
        margin-top:5px!important;
        text-align:center!important;
        color:rgba(202,216,226,.62)!important;
        font-size:9px!important
      }

      #${ROOT_ID} .us-qc-status[data-tone="error"]{
        color:rgba(239,174,174,.94)!important
      }

      #${ROOT_ID} .us-qc-status[data-tone="warning"]{
        color:rgba(232,205,151,.92)!important
      }

      #${ROOT_ID} .us-qc-status[data-tone="success"]{
        color:rgba(177,224,193,.92)!important
      }

      @media (max-width:560px){
        #${ROOT_ID}{padding:10px!important}
        #${ROOT_ID} .us-qc-panel{padding:12px!important}
      }

      @media (prefers-reduced-motion:reduce){
        #${ROOT_ID},#${ROOT_ID} *{transition:none!important}
      }
    `;

    document.head.appendChild(style);
  }

  function install() {
    readPrefs();
    installStyles();
    installOpenButton();
    installProjectButtons();
  }

  function init() {
    install();

    let queued = false;

    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;

      requestAnimationFrame(() => {
        queued = false;
        installOpenButton();
        installProjectButtons();
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    window.__usSignQuickClock = Object.freeze({
      version: VERSION,
      open: openModal,
      close: closeModal
    });
  }

  init();
})();
