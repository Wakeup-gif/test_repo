// ==UserScript==
// @name         SquareCoil Job Timer Manager
// @namespace    us-sign-squarecoil-tools
// @version      1.1.1
// @description  Consolidated SquareCoil job timer with lower runtime churn, safer clock-state confirmation, lazy history rendering, and robust tab controls.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-end
// @grant        none
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// ==/UserScript==

(() => {
  'use strict';

  const VERSION = '1.1.1';
  const KEY = 'ussign-squarecoil-job-timer-v1';
  const ROOT_ID = 'ussign-job-timer';
  const CHANNEL = 'ussign-squarecoil-job-timer';
  const MAX_HISTORY = 250;
  const MAX_SESSIONS = 180;
  const HEARTBEAT_MS = 60000;
  const VERIFY_PERSIST_MS = 30000;
  const UNOBSERVED_GAP_MS = 90000;
  const DRAG_CLICK_GUARD_MS = 280;
  const ORIGIN = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  let state = load();
  let bc = null;
  let settingsOpen = false;
  let jqHooked = false;
  let syncing = false;
  let mutationDebounce = 0;
  let idleConfirmTimer = 0;
  let draggedKey = null;
  let dragChanged = false;
  let lastDragEndAt = 0;

  window.__squareCoilJobTimerUiVersion = VERSION;
  window.__squareCoilJobTimerInteractionVersion = VERSION;

  injectStyle();

  function id(prefix) {
    try { return `${prefix}-${crypto.randomUUID()}`; }
    catch (_) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  }

  function freshState() {
    return {
      schema: 3,
      version: VERSION,
      rev: 0,
      updatedAt: 0,
      origin: '',
      ui: { collapsed: false, selectedKey: null, hiddenKeys: [], tabOrder: [] },
      settings: { yellow: 60, orange: 120, red: 240, maxJobTabs: 5 },
      contexts: {},
      active: null,
      pending: null,
      meta: { lastServerCheckAt: 0, observedClockKey: null, lastVerifyPersistAt: 0 }
    };
  }

  function dedupeSessions(items) {
    const seen = new Set();
    const rows = [];
    for (const raw of Array.isArray(items) ? items : []) {
      const session = raw && typeof raw === 'object' ? { ...raw } : null;
      if (!session) continue;
      const key = session.id || `${session.startAt || 0}:${session.endAt || 0}:${session.durationMs || 0}:${session.reason || ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(session);
    }
    return rows.slice(-MAX_SESSIONS);
  }

  function normalize(raw) {
    const base = freshState();
    if (!raw || typeof raw !== 'object') return base;
    const out = {
      ...base,
      ...raw,
      ui: { ...base.ui, ...(raw.ui || {}) },
      settings: { ...base.settings, ...(raw.settings || {}) },
      meta: { ...base.meta, ...(raw.meta || {}) },
      contexts: raw.contexts && typeof raw.contexts === 'object' ? raw.contexts : {}
    };

    for (const [key, c] of Object.entries(out.contexts)) {
      out.contexts[key] = {
        key,
        type: c?.type === 'general' ? 'general' : 'job',
        projectId: c?.projectId == null ? null : String(c.projectId),
        label: String(c?.label || key),
        shortLabel: String(c?.shortLabel || c?.projectId || c?.label || key),
        accumulatedMs: Math.max(0, Number(c?.accumulatedMs) || 0),
        sessions: dedupeSessions(c?.sessions),
        cycleId: String(c?.cycleId || id('cycle')),
        createdAt: Number(c?.createdAt) || Date.now(),
        lastTouchedAt: Number(c?.lastTouchedAt) || 0,
        lastPausedReason: c?.lastPausedReason || null
      };
    }

    const keys = new Set(Object.keys(out.contexts));
    out.ui.hiddenKeys = [...new Set((Array.isArray(out.ui.hiddenKeys) ? out.ui.hiddenKeys : []).filter(key => keys.has(key)))];
    out.ui.tabOrder = [...new Set((Array.isArray(out.ui.tabOrder) ? out.ui.tabOrder : []).filter(key => keys.has(key)))];
    for (const key of keys) if (!out.ui.tabOrder.includes(key)) out.ui.tabOrder.push(key);

    out.settings.yellow = Math.max(1, Math.round(Number(out.settings.yellow) || 60));
    out.settings.orange = Math.max(out.settings.yellow, Math.round(Number(out.settings.orange) || 120));
    out.settings.red = Math.max(out.settings.orange, Math.round(Number(out.settings.red) || 240));
    out.settings.maxJobTabs = Math.max(1, Math.min(5, Math.round(Number(out.settings.maxJobTabs) || 5)));

    if (out.active?.key && !keys.has(out.active.key)) out.active = null;
    if (out.pending?.key && !keys.has(out.pending.key)) out.pending = null;
    if (out.ui.selectedKey && !keys.has(out.ui.selectedKey)) out.ui.selectedKey = null;
    if (out.meta.observedClockKey && !keys.has(out.meta.observedClockKey)) out.meta.observedClockKey = null;
    out.schema = 3;
    return out;
  }

  function load() {
    try { return normalize(JSON.parse(localStorage.getItem(KEY) || 'null')); }
    catch (_) { return freshState(); }
  }

  function pull() {
    const latest = load();
    if ((latest.updatedAt || 0) >= (state.updatedAt || 0)) state = latest;
  }

  function save(reason, { renderNow = true, broadcast = true } = {}) {
    const stored = load();
    state.rev = Math.max(state.rev || 0, stored.rev || 0) + 1;
    state.updatedAt = Date.now();
    state.origin = ORIGIN;
    state.version = VERSION;
    state.schema = 3;
    state.lastReason = reason;
    localStorage.setItem(KEY, JSON.stringify(state));
    if (broadcast) {
      try { bc?.postMessage({ origin: ORIGIN, at: state.updatedAt, reason }); } catch (_) {}
    }
    if (renderNow) render();
  }

  function persistVerification(reason, now, force = false) {
    const last = Number(state.meta.lastVerifyPersistAt) || 0;
    if (!force && now - last < VERIFY_PERSIST_MS) return;
    state.meta.lastVerifyPersistAt = now;
    save(reason, { renderNow: false, broadcast: false });
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[ch]));
  }

  function visible(sel) {
    const el = document.querySelector(sel);
    if (!el) return false;
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) !== 0;
  }

  function projectIdFromHref(href) {
    if (!href) return null;
    try { return new URL(href, location.href).searchParams.get('id'); }
    catch (_) { return String(href).match(/[?&]id=(\d+)/i)?.[1] || null; }
  }

  function projectIdFromLabel(label) {
    const clean = String(label || '').replace(/\s+/g, ' ').trim();
    return clean.match(/(?:^|#|\b)(\d{6})(?=\b|\s*[-/])/i)?.[1] || null;
  }

  function slug(value) {
    return String(value || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'general';
  }

  function makeContext(projectId, label) {
    const pid = projectId == null ? null : String(projectId);
    const clean = String(label || '').replace(/\s+/g, ' ').trim();
    if (!clean && (!pid || pid === '0')) return null;

    if (/production\s*\(general\)/i.test(clean)) {
      return { key: 'general:production-general', type: 'general', projectId: '0', shortLabel: 'General', label: clean || 'Production (General)' };
    }

    const resolvedPid = pid && pid !== '0' ? pid : projectIdFromLabel(clean);
    if (resolvedPid) {
      return { key: `job:${resolvedPid}`, type: 'job', projectId: resolvedPid, shortLabel: resolvedPid, label: clean || `Job ${resolvedPid}` };
    }

    if (!clean) return null;
    return { key: `general:${slug(clean)}`, type: 'general', projectId: '0', shortLabel: clean.slice(0, 16), label: clean };
  }

  function fromDom() {
    const hasIn = !!document.querySelector('#clockin');
    const hasOut = !!document.querySelector('#clockout');
    if (hasIn && hasOut && visible('#clockin') && !visible('#clockout')) return { kind: 'out' };

    const span = document.querySelector('#clockin-remaining-time');
    const debug = document.querySelector('#clockin-debug');
    const anchor = span?.querySelector('a[href*="project.php?id="]');
    const label = (span?.textContent || debug?.textContent || '').replace(/\s+/g, ' ').trim();
    const pid = projectIdFromHref(anchor?.getAttribute('href') || anchor?.href || '');
    if (label) {
      const context = makeContext(pid, label);
      if (context) return { kind: 'context', context };
    }
    if (hasOut && visible('#clockout')) return { kind: 'idle' };
    return { kind: 'unknown' };
  }

  function fromHeader(html) {
    const raw = String(html || '').trim();
    if (!raw) return null;
    try {
      const doc = new DOMParser().parseFromString(`<div>${raw}</div>`, 'text/html');
      const span = doc.querySelector('#clockin-remaining-time') || doc.body;
      const anchor = span.querySelector('a[href*="project.php?id="]');
      const label = (span.textContent || '').replace(/\s+/g, ' ').trim();
      return makeContext(projectIdFromHref(anchor?.getAttribute('href') || ''), label);
    } catch (_) { return null; }
  }

  function ensureTabOrder(key) {
    if (!state.ui.tabOrder.includes(key)) state.ui.tabOrder.push(key);
  }

  function showContext(key) {
    state.ui.hiddenKeys = state.ui.hiddenKeys.filter(item => item !== key);
    ensureTabOrder(key);
    const context = state.contexts[key];
    if (!context || context.type !== 'job') return;

    const max = state.settings.maxJobTabs;
    const visibleJobs = Object.values(state.contexts)
      .filter(item => item.type === 'job' && !state.ui.hiddenKeys.includes(item.key))
      .sort((a, b) => (a.lastTouchedAt || 0) - (b.lastTouchedAt || 0));
    const protectedKeys = new Set([key, state.active?.key, state.pending?.key].filter(Boolean));
    while (visibleJobs.filter(item => !state.ui.hiddenKeys.includes(item.key)).length > max) {
      const victim = visibleJobs.find(item => !protectedKeys.has(item.key) && !state.ui.hiddenKeys.includes(item.key));
      if (!victim) break;
      state.ui.hiddenKeys.push(victim.key);
    }
  }

  function ensureContext(incoming, now = Date.now()) {
    const current = state.contexts[incoming.key];
    let changed = false;
    if (!current) {
      state.contexts[incoming.key] = {
        ...incoming,
        accumulatedMs: 0,
        sessions: [],
        cycleId: id('cycle'),
        createdAt: now,
        lastTouchedAt: now,
        lastPausedReason: null
      };
      changed = true;
    } else {
      if (incoming.type !== current.type || incoming.projectId !== current.projectId || (incoming.label && incoming.label !== current.label) || (incoming.shortLabel && incoming.shortLabel !== current.shortLabel)) changed = true;
      Object.assign(current, {
        type: incoming.type,
        projectId: incoming.projectId,
        label: incoming.label || current.label,
        shortLabel: incoming.shortLabel || current.shortLabel
      });
      current.lastTouchedAt = now;
    }
    showContext(incoming.key);
    return { context: state.contexts[incoming.key], changed };
  }

  function elapsed(key, now = Date.now()) {
    const context = state.contexts[key];
    if (!context) return 0;
    let ms = Math.max(0, Number(context.accumulatedMs) || 0);
    if (state.active?.key === key) ms += Math.max(0, now - Number(state.active.startedAt || now));
    return ms;
  }

  function pauseActive(endAt, reason, certainty = 'exact') {
    if (!state.active) return;
    const active = state.active;
    const context = state.contexts[active.key];
    if (!context) { state.active = null; return; }

    const end = Math.max(Number(active.startedAt) || endAt, Number(endAt) || Date.now());
    const durationMs = Math.max(0, end - Number(active.startedAt || end));
    const duplicate = context.sessions.some(session => session.id && active.sessionId && session.id === active.sessionId);
    if (!duplicate) {
      context.accumulatedMs = Math.max(0, Number(context.accumulatedMs) || 0) + durationMs;
      context.sessions.push({
        id: active.sessionId || id('session'),
        cycleId: active.cycleId || context.cycleId,
        startAt: Number(active.startedAt) || end,
        endAt: end,
        durationMs,
        reason,
        certainty,
        confidence: active.confidence || 'tracked',
        source: active.source || 'native'
      });
      if (context.sessions.length > MAX_SESSIONS) context.sessions = context.sessions.slice(-MAX_SESSIONS);
    }
    context.lastTouchedAt = Date.now();
    context.lastPausedReason = reason;
    state.active = null;
  }

  function conservativeEnd(now) {
    if (!state.active) return now;
    const verified = Number(state.active.lastVerifiedAt) || Number(state.active.startedAt) || now;
    return now - verified > UNOBSERVED_GAP_MS ? verified : now;
  }

  function shouldAutoOpen(previousKey, incomingKey, source) {
    if (previousKey && previousKey !== incomingKey) return true;
    return source === 'native-action-3';
  }

  function observe(observation, source = 'dom', exact = false) {
    pull();
    const now = Date.now();
    if (!observation || observation.kind === 'unknown' || observation.kind === 'idle') return;

    if (observation.kind === 'out') {
      if (!state.active && !state.pending && !state.meta.observedClockKey) return;
      if (state.active) pauseActive(exact ? now : conservativeEnd(now), source === 'native-action-2' ? 'clocked-out-completely' : 'clocked-out', exact ? 'exact' : 'detected');
      state.pending = null;
      state.meta.observedClockKey = null;
      save('clocked-out');
      return;
    }

    const incoming = observation.context;
    if (!incoming?.key) return;
    const previousKey = state.active?.key || state.pending?.key || state.meta.observedClockKey || null;
    const autoOpen = shouldAutoOpen(previousKey, incoming.key, source);
    const { context, changed } = ensureContext(incoming, now);
    state.meta.observedClockKey = incoming.key;

    if (state.active?.key === incoming.key) {
      state.active.lastVerifiedAt = now;
      if (changed) {
        save('active-label-update');
      } else {
        persistVerification('verify-active', now);
      }
      return;
    }

    if (state.pending?.key === incoming.key) {
      let uiChanged = changed;
      if (autoOpen) {
        if (state.ui.selectedKey !== incoming.key || state.ui.collapsed) uiChanged = true;
        state.ui.selectedKey = incoming.key;
        state.ui.collapsed = false;
        settingsOpen = false;
      }
      if (uiChanged) save('verify-pending-update');
      else persistVerification('verify-pending', now);
      return;
    }

    if (state.active && state.active.key !== incoming.key) pauseActive(exact ? now : conservativeEnd(now), 'switched-context', exact ? 'exact' : 'detected');
    if (state.pending && state.pending.key !== incoming.key) state.pending = null;

    state.ui.selectedKey = incoming.key;
    showContext(incoming.key);
    if (autoOpen) {
      state.ui.collapsed = false;
      settingsOpen = false;
    }

    const remembered = context.accumulatedMs > 0 || context.sessions.length > 0;
    if (remembered) {
      state.pending = { key: incoming.key, detectedAt: now, source, previousMs: context.accumulatedMs };
      save(autoOpen ? 'switch-ask-resume' : 'ask-resume');
      return;
    }

    state.pending = null;
    state.active = {
      key: incoming.key,
      sessionId: id('session'),
      cycleId: context.cycleId,
      startedAt: now,
      lastVerifiedAt: now,
      confidence: exact ? 'tracked' : 'detected',
      source
    };
    save(autoOpen ? 'switch-start-context' : 'start-new-context');
  }

  function startPending(restart) {
    pull();
    const pending = state.pending;
    if (!pending?.key || !state.contexts[pending.key]) return;
    const context = state.contexts[pending.key];
    if (restart) {
      context.accumulatedMs = 0;
      context.cycleId = id('cycle');
    }
    state.active = {
      key: pending.key,
      sessionId: id('session'),
      cycleId: context.cycleId,
      startedAt: Number(pending.detectedAt) || Date.now(),
      lastVerifiedAt: Date.now(),
      confidence: String(pending.source || '').startsWith('native') ? 'tracked' : 'detected',
      source: pending.source || 'resume'
    };
    state.pending = null;
    state.ui.selectedKey = context.key;
    state.ui.collapsed = false;
    settingsOpen = false;
    showContext(context.key);
    save(restart ? 'start-fresh' : 'resume-timer');
  }

  function fmt(ms, compact = false) {
    const total = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (compact) return hours ? `${hours}h ${String(mins).padStart(2, '0')}m` : `${mins}m ${String(secs).padStart(2, '0')}s`;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function level(ms) {
    const mins = ms / 60000;
    return mins >= state.settings.red ? 3 : mins >= state.settings.orange ? 2 : mins >= state.settings.yellow ? 1 : 0;
  }

  function orderedVisibleContexts() {
    const hidden = new Set(state.ui.hiddenKeys);
    const jobs = Object.values(state.contexts)
      .filter(context => context.type === 'job' && !hidden.has(context.key))
      .sort((a, b) => (b.lastTouchedAt || 0) - (a.lastTouchedAt || 0))
      .slice(0, state.settings.maxJobTabs);
    const general = Object.values(state.contexts)
      .filter(context => context.type === 'general' && !hidden.has(context.key))
      .sort((a, b) => (b.lastTouchedAt || 0) - (a.lastTouchedAt || 0));
    const order = new Map(state.ui.tabOrder.map((key, index) => [key, index]));
    return [...jobs, ...general].sort((a, b) => {
      const ai = order.has(a.key) ? order.get(a.key) : Number.MAX_SAFE_INTEGER;
      const bi = order.has(b.key) ? order.get(b.key) : Number.MAX_SAFE_INTEGER;
      return ai !== bi ? ai - bi : (b.lastTouchedAt || 0) - (a.lastTouchedAt || 0);
    });
  }

  function displayKey() {
    if (state.ui.selectedKey && state.contexts[state.ui.selectedKey] && !state.ui.hiddenKeys.includes(state.ui.selectedKey)) return state.ui.selectedKey;
    if (state.active?.key) return state.active.key;
    if (state.pending?.key) return state.pending.key;
    return orderedVisibleContexts()[0]?.key || null;
  }

  function friendlyReason(reason) {
    const map = { 'switched-context': 'Switched jobs', 'clocked-out-completely': 'Clocked out', 'clocked-out': 'Clocked out', 'left-job-context': 'Switched jobs', paused: 'Paused' };
    return map[reason] || String(reason || 'Paused').replace(/[-_]+/g, ' ').replace(/^./, char => char.toUpperCase());
  }

  function statusFor(key) {
    if (!key) return 'No timer';
    if (state.active?.key === key) return 'Running';
    if (state.pending?.key === key) return 'Resume';
    const reason = state.contexts[key]?.lastPausedReason;
    return reason === 'clocked-out-completely' || reason === 'clocked-out' ? 'Clocked out' : 'Paused';
  }

  function historyRows() {
    const rows = [];
    for (const context of Object.values(state.contexts)) for (const session of context.sessions) rows.push({ context, session });
    return rows.sort((a, b) => (b.session.endAt || 0) - (a.session.endAt || 0)).slice(0, MAX_HISTORY);
  }

  function closeButton(context) {
    return `<button type="button" class="jt-x" data-action="hide-tab" data-key="${esc(context.key)}" aria-label="Hide ${esc(context.shortLabel)}" title="Hide tab"><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2.2 2.2 9.8 9.8M9.8 2.2 2.2 9.8"/></svg></button>`;
  }

  function renderTabs(now) {
    const selectedKey = displayKey();
    return orderedVisibleContexts().map(context => {
      const ms = elapsed(context.key, now);
      const protectedTab = state.active?.key === context.key || state.pending?.key === context.key;
      return `<div class="jt-tab jt-tab-level-${level(ms)}${context.key === selectedKey ? ' jt-selected' : ''}${protectedTab ? ' jt-clock-active' : ''}" draggable="true" role="tab" aria-selected="${context.key === selectedKey ? 'true' : 'false'}" data-action="select-tab" data-key="${esc(context.key)}" title="${esc(context.label)} • Click to view • Double-click to open • Drag to reorder"><i class="jt-tab-dot"></i><span>${esc(context.shortLabel)}</span><b class="jt-tab-time" data-tab-time="${esc(context.key)}">${esc(fmt(ms))}</b>${protectedTab ? '' : closeButton(context)}</div>`;
    }).join('');
  }

  function renderSettings() {
    if (!settingsOpen) return '<div class="jt-settings" aria-hidden="true"></div>';
    const hidden = state.ui.hiddenKeys.map(key => state.contexts[key]).filter(Boolean).sort((a, b) => (b.lastTouchedAt || 0) - (a.lastTouchedAt || 0));
    const hiddenRows = hidden.length
      ? hidden.map(context => `<div class="jt-row"><div><b>${esc(context.shortLabel)} · ${esc(context.label)}</b><small>Saved ${esc(fmt(elapsed(context.key), true))}</small></div><button class="jt-btn" data-action="restore" data-key="${esc(context.key)}">Show</button></div>`).join('')
      : '<small class="jt-archive-empty">No hidden tabs.</small>';
    const history = historyRows();
    const historyHtml = history.length
      ? history.map(({ context, session }) => {
          const when = new Date(session.endAt || Date.now()).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
          return `<div class="jt-row"><div><b>${esc(context.shortLabel)} · ${esc(friendlyReason(session.reason))}</b><small>${esc(when)}</small></div><code>${esc(fmt(session.durationMs, true))}</code></div>`;
        }).join('')
      : '<small class="jt-archive-empty">No history yet.</small>';
    return `<div class="jt-settings"><h4>Timer settings</h4><div class="jt-thresholds"><label>Yellow<input type="number" min="1" data-setting="yellow" value="${esc(state.settings.yellow)}"></label><label>Orange<input type="number" min="1" data-setting="orange" value="${esc(state.settings.orange)}"></label><label>Red<input type="number" min="1" data-setting="red" value="${esc(state.settings.red)}"></label></div><div class="jt-archive-scroll"><div class="jt-archive-section"><h5>Hidden tabs</h5>${hiddenRows}</div><div class="jt-archive-section"><h5>History</h5>${historyHtml}</div></div><div class="jt-actions"><button class="jt-btn" data-action="clear-selected">Clear selected</button><button class="jt-btn jt-danger" data-action="clear-all">Clear all</button></div></div>`;
  }

  function render() {
    if (!document.body) return;
    let root = document.getElementById(ROOT_ID);
    const archiveScroll = root?.querySelector('.jt-archive-scroll')?.scrollTop || 0;
    const tabScroll = root?.querySelector('.jt-tabs')?.scrollLeft || 0;
    if (!root) {
      root = document.createElement('div');
      root.id = ROOT_ID;
      document.body.appendChild(root);
      bindRootEvents(root);
    }

    const now = Date.now();
    const key = displayKey();
    if (key) state.ui.selectedKey = key;
    const context = key ? state.contexts[key] : null;
    const ms = key ? elapsed(key, now) : 0;
    root.className = `jt-level-${level(ms)}${state.active ? ' jt-running' : ''}${state.ui.collapsed ? ' jt-collapsed' : ''}${settingsOpen ? ' jt-settings-open' : ''}`;
    root.dataset.version = VERSION;

    const promptContext = state.pending?.key ? state.contexts[state.pending.key] : null;
    const prompt = promptContext
      ? `<div class="jt-resume"><b>Resume ${esc(promptContext.shortLabel)}?</b><span>Saved time ${esc(fmt(promptContext.accumulatedMs))}</span><div><button class="jt-btn jt-primary" data-action="resume">Resume</button><button class="jt-btn" data-action="restart">Start fresh</button></div></div>`
      : '';
    const main = context
      ? `<div class="jt-main"><div class="jt-main-head"><div><b>${esc(context.type === 'job' ? context.projectId : context.shortLabel)}</b><span title="${esc(context.label)}">${esc(context.label)}</span></div><em data-timer-state="${statusFor(key).toLowerCase().replace(/\s+/g, '-')}">${esc(statusFor(key))}</em></div><strong data-role="time">${esc(fmt(ms))}</strong></div>`
      : '<div class="jt-empty">No recent timers.</div>';
    const contextLabel = context ? (context.type === 'job' ? context.projectId : context.shortLabel) : 'No timer';

    root.innerHTML = `<div class="jt-shell"><div class="jt-tabs" role="tablist">${renderTabs(now)}</div><header><span class="jt-brand"><i></i><span>Job Timer</span></span><span class="jt-head-context">${esc(contextLabel)}</span><b data-role="compact-time">${esc(fmt(ms))}</b><button data-action="settings" title="Timer settings" aria-label="Timer settings">⚙</button><button data-action="collapse" title="${state.ui.collapsed ? 'Expand' : 'Collapse'}" aria-label="${state.ui.collapsed ? 'Expand' : 'Collapse'}">${state.ui.collapsed ? '▴' : '▾'}</button></header><section>${prompt}${main}${renderSettings()}</section></div>`;
    const archive = root.querySelector('.jt-archive-scroll');
    if (archive) archive.scrollTop = archiveScroll;
    const tabs = root.querySelector('.jt-tabs');
    if (tabs) tabs.scrollLeft = tabScroll;
  }

  function bindRootEvents(root) {
    root.addEventListener('click', onClick);
    root.addEventListener('dblclick', onDoubleClick);
    root.addEventListener('change', onChange);
    root.addEventListener('dragstart', onDragStart);
    root.addEventListener('dragover', onDragOver);
    root.addEventListener('drop', onDrop);
    root.addEventListener('dragend', onDragEnd);
  }

  function tabFromEvent(event) {
    const target = event.target instanceof Element ? event.target : null;
    return target?.closest?.('.jt-tab[data-key]') || null;
  }

  function onClick(event) {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    const key = actionEl.dataset.key;
    pull();

    if (action === 'select-tab') {
      if (Date.now() - lastDragEndAt < DRAG_CLICK_GUARD_MS || !key || !state.contexts[key]) return;
      state.ui.selectedKey = key;
      state.ui.hiddenKeys = state.ui.hiddenKeys.filter(item => item !== key);
      save('tab-focus');
      return;
    }
    if (action === 'collapse') {
      state.ui.collapsed = !state.ui.collapsed;
      if (state.ui.collapsed) settingsOpen = false;
      save('toggle-collapse');
      return;
    }
    if (action === 'settings') {
      if (state.ui.collapsed) state.ui.collapsed = false;
      settingsOpen = !settingsOpen;
      save('toggle-settings');
      return;
    }
    if (action === 'hide-tab' && key && state.contexts[key]) {
      event.stopPropagation();
      if (state.active?.key === key || state.pending?.key === key) return;
      if (!state.ui.hiddenKeys.includes(key)) state.ui.hiddenKeys.push(key);
      if (state.ui.selectedKey === key) state.ui.selectedKey = null;
      save('hide-tab');
      return;
    }
    if (action === 'restore' && key && state.contexts[key]) {
      state.ui.hiddenKeys = state.ui.hiddenKeys.filter(item => item !== key);
      state.contexts[key].lastTouchedAt = Date.now();
      state.ui.selectedKey = key;
      showContext(key);
      save('restore-tab');
      return;
    }
    if (action === 'resume') { startPending(false); return; }
    if (action === 'restart') { startPending(true); return; }
    if (action === 'clear-selected') {
      const selected = displayKey();
      if (!selected || !state.contexts[selected] || !confirm(`Clear saved timer/history for ${state.contexts[selected].shortLabel}?`)) return;
      const context = state.contexts[selected];
      context.sessions = [];
      context.accumulatedMs = 0;
      context.cycleId = id('cycle');
      context.lastPausedReason = null;
      if (state.active?.key === selected) Object.assign(state.active, { startedAt: Date.now(), sessionId: id('session'), cycleId: context.cycleId, lastVerifiedAt: Date.now() });
      save('clear-selected');
      return;
    }
    if (action === 'clear-all') {
      if (!confirm('Clear all saved timer history and hidden tabs? This does not change SquareCoil clocking.')) return;
      const activeKey = state.active?.key || null;
      const pendingKey = state.pending?.key || null;
      const keep = {};
      for (const keepKey of [activeKey, pendingKey]) {
        if (!keepKey || !state.contexts[keepKey] || keep[keepKey]) continue;
        keep[keepKey] = { ...state.contexts[keepKey], sessions: [], accumulatedMs: 0, cycleId: id('cycle'), lastPausedReason: null, lastTouchedAt: Date.now() };
      }
      state.contexts = keep;
      state.ui.hiddenKeys = [];
      state.ui.tabOrder = Object.keys(keep);
      state.ui.selectedKey = activeKey || pendingKey;
      state.meta.observedClockKey = activeKey || pendingKey || null;
      if (activeKey && keep[activeKey]) Object.assign(state.active, { startedAt: Date.now(), sessionId: id('session'), cycleId: keep[activeKey].cycleId, lastVerifiedAt: Date.now() });
      else state.active = null;
      if (pendingKey && keep[pendingKey]) Object.assign(state.pending, { previousMs: 0, detectedAt: Date.now() });
      else state.pending = null;
      save('clear-all');
    }
  }

  function onDoubleClick(event) {
    const tab = tabFromEvent(event);
    if (!tab || event.target.closest('.jt-x')) return;
    const key = tab.dataset.key;
    pull();
    if (!key || !state.contexts[key]) return;
    state.ui.selectedKey = key;
    state.ui.hiddenKeys = state.ui.hiddenKeys.filter(item => item !== key);
    state.ui.collapsed = false;
    settingsOpen = false;
    save('tab-focus-open');
  }

  function onChange(event) {
    const input = event.target.closest('[data-setting]');
    if (!input) return;
    pull();
    state.settings[input.dataset.setting] = Math.max(1, Math.round(Number(input.value) || 1));
    if (state.settings.orange < state.settings.yellow) state.settings.orange = state.settings.yellow;
    if (state.settings.red < state.settings.orange) state.settings.red = state.settings.orange;
    save('settings');
  }

  function onDragStart(event) {
    const tab = tabFromEvent(event);
    if (!tab || event.target.closest('.jt-x')) { if (tab) event.preventDefault(); return; }
    draggedKey = tab.dataset.key;
    dragChanged = false;
    tab.classList.add('jt-dragging');
    try {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', draggedKey || '');
      event.dataTransfer.setDragImage(tab, Math.min(70, tab.offsetWidth / 2), 18);
    } catch (_) {}
  }

  function clearDropHints(bar) {
    bar?.querySelectorAll('.jt-drop-before,.jt-drop-after').forEach(tab => tab.classList.remove('jt-drop-before', 'jt-drop-after'));
  }

  function onDragOver(event) {
    if (!draggedKey) return;
    const bar = event.target.closest('.jt-tabs');
    if (!bar) return;
    const dragged = bar.querySelector(`.jt-tab[data-key="${CSS.escape(draggedKey)}"]`);
    if (!dragged) return;
    event.preventDefault();
    try { event.dataTransfer.dropEffect = 'move'; } catch (_) {}
    const target = tabFromEvent(event);
    clearDropHints(bar);
    if (!target || target === dragged) return;
    const rect = target.getBoundingClientRect();
    const after = event.clientX > rect.left + rect.width / 2;
    target.classList.add(after ? 'jt-drop-after' : 'jt-drop-before');
    const reference = after ? target.nextElementSibling : target;
    if (reference === dragged || (!reference && dragged === bar.lastElementChild)) return;
    if (reference) bar.insertBefore(dragged, reference);
    else bar.appendChild(dragged);
    dragChanged = true;
  }

  function saveDomTabOrder(bar) {
    pull();
    const visibleOrder = [...bar.querySelectorAll('.jt-tab[data-key]')].map(tab => tab.dataset.key).filter(Boolean);
    state.ui.tabOrder = [...visibleOrder, ...state.ui.tabOrder.filter(key => !visibleOrder.includes(key))];
    save('tab-reorder');
  }

  function onDrop(event) {
    if (!draggedKey) return;
    const bar = event.target.closest('.jt-tabs');
    if (!bar) return;
    event.preventDefault();
    clearDropHints(bar);
    saveDomTabOrder(bar);
    dragChanged = false;
  }

  function onDragEnd(event) {
    const tab = tabFromEvent(event);
    const bar = tab?.closest('.jt-tabs');
    if (tab) tab.classList.remove('jt-dragging');
    if (bar) {
      clearDropHints(bar);
      if (dragChanged) saveDomTabOrder(bar);
    }
    draggedKey = null;
    dragChanged = false;
    lastDragEndAt = Date.now();
  }

  function tick() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const now = Date.now();
    const selected = displayKey();
    const selectedMs = selected ? elapsed(selected, now) : 0;
    root.classList.remove('jt-level-0', 'jt-level-1', 'jt-level-2', 'jt-level-3');
    root.classList.add(`jt-level-${level(selectedMs)}`);
    root.querySelectorAll('[data-role="time"],[data-role="compact-time"]').forEach(el => { el.textContent = fmt(selectedMs); });
    root.querySelectorAll('[data-tab-time]').forEach(el => {
      const ms = elapsed(el.dataset.tabTime, now);
      el.textContent = fmt(ms);
      const tab = el.closest('.jt-tab');
      if (tab) {
        tab.classList.remove('jt-tab-level-0', 'jt-tab-level-1', 'jt-tab-level-2', 'jt-tab-level-3');
        tab.classList.add(`jt-tab-level-${level(ms)}`);
      }
    });
  }

  async function post(url, data) {
    const body = new URLSearchParams(Object.entries(data).map(([key, value]) => [key, String(value)]));
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
      body: body.toString(),
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  }

  function scheduleIdleConfirmation() {
    clearTimeout(idleConfirmTimer);
    idleConfirmTimer = setTimeout(() => syncServer('idle-confirm', false), 260);
  }

  async function syncServer(source = 'server', exact = false) {
    if (syncing) return;
    syncing = true;
    try {
      const html = await post('ajax_time_clock.php', { action: 7 });
      pull();
      state.meta.lastServerCheckAt = Date.now();
      const context = fromHeader(html);
      if (context) {
        observe({ kind: 'context', context }, source, exact);
      } else if (source === 'native-action-2') {
        observe({ kind: 'out' }, source, true);
      } else {
        const dom = fromDom();
        if (dom.kind === 'context' || dom.kind === 'out') observe(dom, source, exact);
      }
    } catch (_) {
      // Read-only verification failures never modify SquareCoil's clock state.
    } finally { syncing = false; }
  }

  function syncDom(source = 'dom') {
    const observation = fromDom();
    if (observation.kind === 'idle') { scheduleIdleConfirmation(); return; }
    if (observation.kind === 'context' || observation.kind === 'out') observe(observation, source, false);
  }

  function parseAjaxData(data) {
    if (!data) return {};
    if (typeof data === 'string') return Object.fromEntries(new URLSearchParams(data).entries());
    if (data instanceof URLSearchParams) return Object.fromEntries(data.entries());
    if (typeof data === 'object') return { ...data };
    return {};
  }

  function hookJquery() {
    if (jqHooked || !window.jQuery?.fn) return;
    jqHooked = true;
    window.jQuery(document).ajaxComplete((_event, xhr, settings) => {
      try {
        if (!/(^|\/)ajax_time_clock\.php(?:\?|$)/i.test(String(settings?.url || '')) || Number(xhr?.status || 200) >= 400) return;
        const action = String(parseAjaxData(settings?.data).action || '');
        if (action === '2') setTimeout(() => syncServer('native-action-2', true), 220);
        else if (action === '3' || action === '4') setTimeout(() => syncServer(`native-action-${action}`, true), 260);
      } catch (_) {}
    });
  }

  function passiveClockClickFallback() {
    document.addEventListener('click', event => {
      const button = event.target.closest('.clock-actions');
      if (!button) return;
      const exact = ['clock-out-completely', 'clock-out-of-project', 'time-clock-clock-in-to-project-department-2', 'confirm-clockin', 'clock-into-project-from-calendar'].includes(button.id);
      setTimeout(() => syncDom('native-click-dom'), 450);
      setTimeout(() => syncServer(button.id === 'clock-out-completely' ? 'native-action-2' : 'native-click', exact), 900);
    }, true);
  }

  function watchClockDom() {
    const observer = new MutationObserver(mutations => {
      const relevant = mutations.some(mutation => {
        const target = mutation.target instanceof Element ? mutation.target : mutation.target?.parentElement;
        return target?.closest?.('#clockin,#clockout,#clockin-debug,#clockin-remaining-time,.timeclock-container');
      });
      if (!relevant) return;
      clearTimeout(mutationDebounce);
      mutationDebounce = setTimeout(() => syncDom('clock-dom-mutation'), 180);
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['style', 'class', 'data-time'] });
  }

  function crossTab() {
    try {
      bc = new BroadcastChannel(CHANNEL);
      bc.addEventListener('message', event => {
        if (event.data?.origin === ORIGIN) return;
        state = load();
        render();
      });
    } catch (_) {}
    window.addEventListener('storage', event => {
      if (event.key !== KEY) return;
      state = load();
      render();
    });
  }

  function debugApi() {
    window.__squareCoilJobTimerDebug = () => ({ version: VERSION, origin: ORIGIN, jqHooked, domClock: fromDom(), selectedKey: displayKey(), visibleKeys: orderedVisibleContexts().map(context => context.key), state: JSON.parse(JSON.stringify(state)) });
    window.__squareCoilJobTimerSync = () => syncServer('manual', false);
    window.__squareCoilJobTimerSelect = key => {
      pull();
      if (!state.contexts[key]) return false;
      state.ui.selectedKey = key;
      state.ui.hiddenKeys = state.ui.hiddenKeys.filter(item => item !== key);
      save('debug-select');
      return true;
    };
  }

  function init() {
    crossTab();
    render();
    syncDom('initial-dom');
    passiveClockClickFallback();
    watchClockDom();
    debugApi();

    let attempts = 0;
    const jqWait = setInterval(() => {
      hookJquery();
      if (jqHooked || ++attempts >= 40) clearInterval(jqWait);
    }, 250);
    setInterval(tick, 1000);
    setInterval(() => { if (document.visibilityState === 'visible') syncServer('heartbeat', false); }, HEARTBEAT_MS);
    window.addEventListener('focus', () => syncServer('focus', false));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncServer('visible', false); });
    setTimeout(() => syncServer('initial-server', false), 800);
  }

  function injectStyle() {
    const style = document.createElement('style');
    style.id = 'ussign-job-timer-v111-style';
    style.textContent = `
#${ROOT_ID}{--a:#7baaf2;--as:rgba(123,170,242,.14);--jt-glass:var(--us-glass,rgba(18,18,21,.62));--jt-glass-soft:var(--us-glass-soft,rgba(18,18,21,.55));--jt-line:var(--us-line,rgba(255,255,255,.08));position:fixed;right:18px;bottom:18px;z-index:2147483000;width:min(500px,calc(100vw - 24px));padding-top:39px;color:var(--us-text,#eef1f5);font:13px/1.35 var(--us-font,Manrope,"Segoe UI",Arial,sans-serif);isolation:isolate}
#${ROOT_ID},#${ROOT_ID} *{box-sizing:border-box}#${ROOT_ID} button,#${ROOT_ID} input{font:inherit}
#${ROOT_ID} .jt-shell{position:relative;overflow:visible;border:1px solid var(--jt-line);border-radius:14px;background:linear-gradient(180deg,rgba(255,255,255,.022),rgba(255,255,255,.003)),var(--jt-glass);box-shadow:0 14px 38px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.025);-webkit-backdrop-filter:blur(18px) saturate(114%) brightness(91%);backdrop-filter:blur(18px) saturate(114%) brightness(91%)}
#${ROOT_ID}.jt-collapsed .jt-shell{border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.028),rgba(255,255,255,.004)),rgba(15,16,20,.68);box-shadow:0 14px 34px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.03);-webkit-backdrop-filter:blur(20px) saturate(116%) brightness(92%);backdrop-filter:blur(20px) saturate(116%) brightness(92%)}
#${ROOT_ID} header{min-height:52px;display:grid;grid-template-columns:minmax(105px,1fr) auto auto auto;align-items:center;gap:10px;padding:8px 10px 8px 14px;border-bottom:1px solid rgba(255,255,255,.065)}
#${ROOT_ID}.jt-collapsed header{min-height:50px;grid-template-columns:auto minmax(70px,1fr) auto auto auto;border-bottom:0;border-radius:18px}
#${ROOT_ID} .jt-brand{display:flex;align-items:center;gap:9px;color:rgba(235,239,244,.88);font-size:12.5px;font-weight:650;white-space:nowrap}#${ROOT_ID} .jt-brand>i{position:relative;width:14px;height:14px;flex:0 0 14px;border:2px solid rgba(113,177,229,.90);border-radius:50%}#${ROOT_ID} .jt-brand>i::before{content:"";position:absolute;left:4px;top:-5px;width:3px;height:3px;border-radius:1px;background:rgba(113,177,229,.90)}#${ROOT_ID} .jt-brand>i::after{content:"";position:absolute;left:5px;top:2px;width:1px;height:5px;background:rgba(113,177,229,.90);transform-origin:bottom center;transform:rotate(18deg)}
#${ROOT_ID} .jt-head-context{display:none;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(242,245,248,.90);font-size:12px;font-weight:650}#${ROOT_ID}.jt-collapsed .jt-head-context{display:block;padding-left:12px;border-left:1px solid rgba(255,255,255,.07)}
#${ROOT_ID} header>[data-role="compact-time"]{justify-self:end;color:rgba(245,247,249,.94);font:700 14px/1 var(--us-font,Manrope,"Segoe UI",sans-serif);font-variant-numeric:tabular-nums}#${ROOT_ID}.jt-collapsed header>[data-role="compact-time"]{padding-left:12px;border-left:1px solid rgba(255,255,255,.07)}
#${ROOT_ID} header>button{width:33px;height:33px;padding:0;border:1px solid rgba(255,255,255,.075);border-radius:9px;background:rgba(255,255,255,.035);color:rgba(235,239,244,.76);cursor:pointer;box-shadow:none}#${ROOT_ID}.jt-collapsed header>button{width:34px;height:34px;border-radius:11px;background:rgba(255,255,255,.045)}#${ROOT_ID} header>button:hover{background:rgba(255,255,255,.075);border-color:rgba(255,255,255,.11);color:#fff}
#${ROOT_ID} section{padding:10px}#${ROOT_ID}.jt-collapsed section{display:none}
#${ROOT_ID} .jt-tabs{position:absolute;left:16px;right:16px;top:-39px;z-index:8;height:40px;display:flex;align-items:flex-end;gap:3px;overflow-x:auto;overflow-y:hidden;padding:3px 2px 0;scrollbar-width:none}#${ROOT_ID} .jt-tabs::-webkit-scrollbar{display:none}
#${ROOT_ID} .jt-tab{--tc:123,170,242;position:relative;flex:0 0 auto;min-width:104px;max-width:190px;height:37px;display:flex;align-items:center;gap:7px;padding:7px 8px 7px 11px;border:1px solid rgba(var(--tc),.20);border-bottom-color:rgba(255,255,255,.055);border-radius:13px 13px 0 0;background:linear-gradient(180deg,rgba(var(--tc),.075),rgba(var(--tc),.016)),rgba(18,19,24,.78);color:rgba(var(--tc),.92);box-shadow:0 5px 16px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.02);-webkit-backdrop-filter:blur(17px) saturate(114%) brightness(90%);backdrop-filter:blur(17px) saturate(114%) brightness(90%);cursor:grab;user-select:none;transition:transform 130ms ease,opacity 130ms ease,border-color 130ms ease,background-color 130ms ease}
#${ROOT_ID} .jt-tab:hover{background:linear-gradient(180deg,rgba(var(--tc),.11),rgba(var(--tc),.022)),rgba(19,20,26,.86);border-color:rgba(var(--tc),.28)}#${ROOT_ID} .jt-tab.jt-selected{z-index:4;height:40px;transform:translateY(1px);color:#f8fafc;background:linear-gradient(180deg,rgba(var(--tc),.10),rgba(var(--tc),.022)),rgba(20,21,27,.91);border-color:rgba(var(--tc),.30);border-bottom-color:rgba(16,17,21,.92);box-shadow:0 -5px 14px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.03)}#${ROOT_ID} .jt-tab.jt-dragging{opacity:.42;transform:translateY(2px) scale(.985);box-shadow:none}
#${ROOT_ID} .jt-tab.jt-drop-before::after,#${ROOT_ID} .jt-tab.jt-drop-after::after{content:"";position:absolute;top:6px;bottom:5px;width:2px;border-radius:999px;background:rgb(var(--tc));box-shadow:0 0 0 3px rgba(var(--tc),.10)}#${ROOT_ID} .jt-tab.jt-drop-before::after{left:-3px}#${ROOT_ID} .jt-tab.jt-drop-after::after{right:-3px}
#${ROOT_ID} .jt-tab-level-0{--tc:123,170,242}#${ROOT_ID} .jt-tab-level-1{--tc:217,185,105}#${ROOT_ID} .jt-tab-level-2{--tc:226,146,85}#${ROOT_ID} .jt-tab-level-3{--tc:221,105,105}
#${ROOT_ID} .jt-tab-dot{width:6px;height:6px;flex:0 0 6px;border-radius:50%;background:rgb(var(--tc));box-shadow:0 0 0 3px rgba(var(--tc),.085)}#${ROOT_ID} .jt-tab>span{min-width:0;max-width:74px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:650;color:inherit}#${ROOT_ID} .jt-tab-time{margin-left:auto;white-space:nowrap;color:rgba(var(--tc),.82);font:650 10px/1 var(--us-font,Manrope,"Segoe UI",sans-serif);font-variant-numeric:tabular-nums}
#${ROOT_ID} .jt-x{width:20px;height:20px;min-width:20px;flex:0 0 20px;display:grid;place-items:center;padding:0;margin:0;border:0;border-radius:7px;cursor:pointer;background:rgba(255,255,255,.055);color:rgba(236,240,245,.80);appearance:none;-webkit-appearance:none}#${ROOT_ID} .jt-x svg{display:block;width:10px;height:10px;pointer-events:none;overflow:visible}#${ROOT_ID} .jt-x path{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;vector-effect:non-scaling-stroke}#${ROOT_ID} .jt-x:hover{background:rgba(255,255,255,.12);color:#fff}
#${ROOT_ID} .jt-main,#${ROOT_ID} .jt-empty{border:1px solid rgba(255,255,255,.065);border-radius:12px;background:rgba(255,255,255,.016);box-shadow:none}#${ROOT_ID} .jt-main{padding:14px 14px 13px}#${ROOT_ID} .jt-main-head{display:flex;justify-content:space-between;gap:12px}#${ROOT_ID} .jt-main-head>div{min-width:0}#${ROOT_ID} .jt-main-head b{display:block;color:rgba(242,245,248,.92);font-size:12.5px;font-weight:650}#${ROOT_ID} .jt-main-head span{display:block;max-width:330px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(210,216,224,.63);font-size:11.5px}#${ROOT_ID} .jt-main-head em{flex:0 0 auto;padding:5px 8px;border:1px solid rgba(255,255,255,.065);border-radius:8px;background:rgba(255,255,255,.025);color:rgba(215,221,229,.64);font-size:9px;font-style:normal;font-weight:700;text-transform:uppercase;letter-spacing:.02em}#${ROOT_ID} .jt-main-head em[data-timer-state="running"]{border-color:rgba(80,151,205,.20);background:rgba(80,151,205,.09);color:rgba(184,217,242,.88)}#${ROOT_ID} .jt-main-head em[data-timer-state="resume"]{border-color:rgba(217,185,105,.18);background:rgba(217,185,105,.07);color:rgba(232,207,149,.88)}#${ROOT_ID} .jt-main>strong{display:block;margin-top:11px;color:rgba(247,249,251,.96);font-size:34px;font-weight:650;line-height:1;letter-spacing:-.035em;font-variant-numeric:tabular-nums}#${ROOT_ID} .jt-empty{padding:12px;color:rgba(205,211,220,.62)}
#${ROOT_ID} .jt-resume{margin-bottom:8px;padding:9px 10px;border:1px solid rgba(217,185,105,.14);border-radius:10px;background:rgba(217,185,105,.05)}#${ROOT_ID} .jt-resume>b{display:block;color:rgba(246,240,226,.94);font-size:11.5px}#${ROOT_ID} .jt-resume>span{display:block;margin-top:2px;color:rgba(219,209,187,.62);font-size:10.5px}#${ROOT_ID} .jt-resume>div{display:flex;gap:7px;margin-top:9px}
#${ROOT_ID} .jt-settings{display:none;margin-top:9px;overflow:hidden;border:1px solid rgba(255,255,255,.065);border-radius:12px;background:var(--jt-glass-soft);box-shadow:none}#${ROOT_ID}.jt-settings-open .jt-settings{display:flex;flex-direction:column}#${ROOT_ID} .jt-settings>h4{margin:0;padding:11px 11px 7px;color:rgba(239,242,246,.90);font-size:11.5px;font-weight:650}#${ROOT_ID} .jt-thresholds{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:0 11px 11px}#${ROOT_ID} .jt-thresholds label{color:rgba(207,213,221,.60);font-size:9.5px;font-weight:550}#${ROOT_ID} .jt-thresholds input{display:block;width:100%;height:32px;margin-top:4px;padding:5px 8px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(255,255,255,.025);color:rgba(240,243,247,.90);box-shadow:none}#${ROOT_ID} .jt-thresholds input:focus{border-color:rgba(103,169,218,.28);box-shadow:0 0 0 3px rgba(103,169,218,.055);outline:none}
#${ROOT_ID} .jt-archive-scroll{min-height:92px;max-height:min(360px,43vh);overflow-y:auto;overscroll-behavior:contain;padding:4px 10px 10px;border-top:1px solid rgba(255,255,255,.05);border-bottom:1px solid rgba(255,255,255,.05);scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.16) transparent}#${ROOT_ID} .jt-archive-scroll::-webkit-scrollbar{width:8px}#${ROOT_ID} .jt-archive-scroll::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(255,255,255,.15)}#${ROOT_ID} .jt-archive-section{padding-top:4px}#${ROOT_ID} .jt-archive-section+.jt-archive-section{margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.05)}#${ROOT_ID} .jt-archive-section h5{position:sticky;top:-4px;z-index:2;margin:0 -2px 6px;padding:8px 2px 6px;background:linear-gradient(180deg,rgba(10,10,13,.91) 70%,rgba(10,10,13,.70));color:rgba(223,228,234,.68);font-size:9px;font-weight:700;letter-spacing:.065em;text-transform:uppercase}#${ROOT_ID} .jt-archive-empty{display:block;padding:6px 2px;color:rgba(198,205,214,.47);font-size:9.5px}
#${ROOT_ID} .jt-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:7px;margin-top:5px;padding:7px 8px;border:1px solid rgba(255,255,255,.05);border-radius:8px;background:rgba(255,255,255,.015)}#${ROOT_ID} .jt-row b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(229,233,238,.82);font-size:10.5px;font-weight:600}#${ROOT_ID} .jt-row small{display:block;margin-top:2px;color:rgba(198,205,214,.47);font-size:9.5px}#${ROOT_ID} .jt-row code{color:rgba(224,229,235,.68);background:transparent;font:10.5px/1.2 ui-monospace,monospace}
#${ROOT_ID} .jt-actions{display:flex;gap:7px;flex-wrap:wrap;padding:9px 11px 11px}#${ROOT_ID} .jt-btn{min-height:31px;padding:6px 10px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(255,255,255,.035);color:rgba(237,240,244,.84);font-size:10.5px;font-weight:600;cursor:pointer;box-shadow:none}#${ROOT_ID} .jt-btn:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.10);color:#fff}#${ROOT_ID} .jt-primary{background:rgba(103,169,218,.09);border-color:rgba(103,169,218,.18)}#${ROOT_ID} .jt-danger{border-color:rgba(206,115,115,.12);background:rgba(206,115,115,.035);color:rgba(237,196,196,.78)}
#${ROOT_ID}.jt-level-0{--a:#7baaf2;--as:rgba(123,170,242,.14)}#${ROOT_ID}.jt-level-1{--a:#d9b969;--as:rgba(217,185,105,.14)}#${ROOT_ID}.jt-level-2{--a:#e29255;--as:rgba(226,146,85,.14)}#${ROOT_ID}.jt-level-3{--a:#dd6969;--as:rgba(221,105,105,.15)}
@media(max-width:640px){#${ROOT_ID}{right:8px;bottom:8px;width:calc(100vw - 16px);padding-top:37px}#${ROOT_ID} .jt-tabs{left:9px;right:9px;top:-37px;height:38px}#${ROOT_ID} .jt-tab{min-width:88px;max-width:155px;height:35px}#${ROOT_ID} .jt-tab.jt-selected{height:38px}#${ROOT_ID} .jt-tab-time{font-size:9.5px}#${ROOT_ID} .jt-brand>span{display:none}#${ROOT_ID} .jt-main>strong{font-size:31px}#${ROOT_ID} .jt-thresholds{grid-template-columns:1fr}#${ROOT_ID} .jt-archive-scroll{max-height:38vh}}
`;
    document.documentElement.appendChild(style);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
