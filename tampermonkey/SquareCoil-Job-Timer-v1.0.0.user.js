// ==UserScript==
// @name         SquareCoil Job Timer Manager
// @namespace    us-sign-squarecoil-tools
// @version      1.0.0
// @description  Standalone SquareCoil recent-job timer dock with history, resume prompts, Production General support, color thresholds, and cross-tab sync.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-end
// @grant        none
// @noframes
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// ==/UserScript==

(() => {
  'use strict';

  const VERSION = '1.0.0';
  const KEY = 'ussign-squarecoil-job-timer-v1';
  const ROOT_ID = 'ussign-job-timer';
  const CHANNEL = 'ussign-squarecoil-job-timer';
  const MAX_HISTORY = 24;
  const HEARTBEAT_MS = 60000;
  const UNOBSERVED_GAP_MS = 90000;
  const ORIGIN = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  let state = load();
  let bc = null;
  let settingsOpen = false;
  let jqHooked = false;
  let syncing = false;
  let mutationDebounce = 0;

  injectStyle();

  function freshState() {
    return {
      schema: 1,
      version: VERSION,
      rev: 0,
      updatedAt: 0,
      origin: '',
      ui: { collapsed: false, selectedKey: null, hiddenKeys: [] },
      settings: { yellow: 60, orange: 120, red: 240, maxJobTabs: 5 },
      contexts: {},
      active: null,
      pending: null,
      meta: { lastServerCheckAt: 0 }
    };
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
    if (!Array.isArray(out.ui.hiddenKeys)) out.ui.hiddenKeys = [];
    for (const [key, c] of Object.entries(out.contexts)) {
      out.contexts[key] = {
        key,
        type: c.type === 'general' ? 'general' : 'job',
        projectId: c.projectId == null ? null : String(c.projectId),
        label: String(c.label || key),
        shortLabel: String(c.shortLabel || c.projectId || c.label || key),
        accumulatedMs: Math.max(0, Number(c.accumulatedMs) || 0),
        sessions: Array.isArray(c.sessions) ? c.sessions : [],
        cycleId: String(c.cycleId || id('cycle')),
        createdAt: Number(c.createdAt) || Date.now(),
        lastTouchedAt: Number(c.lastTouchedAt) || 0,
        lastPausedReason: c.lastPausedReason || null
      };
    }
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

  function save(reason) {
    const stored = load();
    state.rev = Math.max(state.rev || 0, stored.rev || 0) + 1;
    state.updatedAt = Date.now();
    state.origin = ORIGIN;
    state.version = VERSION;
    state.lastReason = reason;
    localStorage.setItem(KEY, JSON.stringify(state));
    try { bc?.postMessage({ origin: ORIGIN, at: state.updatedAt }); } catch (_) {}
    render();
  }

  function id(prefix) {
    try { return `${prefix}-${crypto.randomUUID()}`; }
    catch (_) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  }

  function esc(v) {
    return String(v ?? '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  }

  function visible(sel) {
    const el = document.querySelector(sel);
    if (!el) return false;
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity || 1) !== 0;
  }

  function projectIdFromHref(href) {
    if (!href) return null;
    try { return new URL(href, location.href).searchParams.get('id'); }
    catch (_) { return String(href).match(/[?&]id=(\d+)/i)?.[1] || null; }
  }

  function slug(v) {
    return String(v || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'general';
  }

  function makeContext(projectId, label) {
    const pid = projectId == null ? null : String(projectId);
    const clean = String(label || '').replace(/\s+/g, ' ').trim();
    if (pid && pid !== '0') {
      return { key: `job:${pid}`, type: 'job', projectId: pid, shortLabel: pid, label: clean || `Job ${pid}` };
    }
    if (!clean) return null;
    const isProdGeneral = /production\s*\(general\)/i.test(clean);
    return {
      key: `general:${isProdGeneral ? 'production-general' : slug(clean)}`,
      type: 'general',
      projectId: '0',
      shortLabel: isProdGeneral ? 'General' : clean.slice(0, 16),
      label: clean
    };
  }

  function fromDom() {
    const hasIn = !!document.querySelector('#clockin');
    const hasOut = !!document.querySelector('#clockout');
    if (hasIn && hasOut && visible('#clockin') && !visible('#clockout')) return { kind: 'out' };

    const span = document.querySelector('#clockin-remaining-time');
    const debug = document.querySelector('#clockin-debug');
    const a = span?.querySelector('a[href*="project.php?id="]');
    const label = (span?.textContent || debug?.textContent || '').replace(/\s+/g, ' ').trim();
    const pid = projectIdFromHref(a?.getAttribute('href') || a?.href || '');
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
      const a = span.querySelector('a[href*="project.php?id="]');
      const label = (span.textContent || '').replace(/\s+/g, ' ').trim();
      return makeContext(projectIdFromHref(a?.getAttribute('href') || ''), label);
    } catch (_) { return null; }
  }

  function ensureContext(c) {
    const now = Date.now();
    if (!state.contexts[c.key]) {
      state.contexts[c.key] = {
        ...c,
        accumulatedMs: 0,
        sessions: [],
        cycleId: id('cycle'),
        createdAt: now,
        lastTouchedAt: now,
        lastPausedReason: null
      };
    } else {
      Object.assign(state.contexts[c.key], {
        type: c.type,
        projectId: c.projectId,
        label: c.label || state.contexts[c.key].label,
        shortLabel: c.shortLabel || state.contexts[c.key].shortLabel,
        lastTouchedAt: now
      });
    }
    showContext(c.key);
    return state.contexts[c.key];
  }

  function showContext(key) {
    state.ui.hiddenKeys = state.ui.hiddenKeys.filter(k => k !== key);
    const ctx = state.contexts[key];
    if (!ctx || ctx.type !== 'job') return;
    const max = Math.max(1, Math.min(5, Number(state.settings.maxJobTabs) || 5));
    const visibleJobs = Object.values(state.contexts)
      .filter(c => c.type === 'job' && !state.ui.hiddenKeys.includes(c.key))
      .sort((a, b) => (a.lastTouchedAt || 0) - (b.lastTouchedAt || 0));
    const protectedKeys = new Set([key, state.active?.key, state.pending?.key].filter(Boolean));
    while (visibleJobs.filter(c => !state.ui.hiddenKeys.includes(c.key)).length > max) {
      const victim = visibleJobs.find(c => !protectedKeys.has(c.key) && !state.ui.hiddenKeys.includes(c.key));
      if (!victim) break;
      state.ui.hiddenKeys.push(victim.key);
    }
  }

  function elapsed(key, now = Date.now()) {
    const c = state.contexts[key];
    if (!c) return 0;
    let ms = Math.max(0, Number(c.accumulatedMs) || 0);
    if (state.active?.key === key) ms += Math.max(0, now - Number(state.active.startedAt || now));
    return ms;
  }

  function pauseActive(endAt, reason, certainty = 'exact') {
    if (!state.active) return;
    const a = state.active;
    const c = state.contexts[a.key];
    if (!c) { state.active = null; return; }
    const end = Math.max(Number(a.startedAt) || endAt, Number(endAt) || Date.now());
    const durationMs = Math.max(0, end - Number(a.startedAt || end));
    c.accumulatedMs = Math.max(0, Number(c.accumulatedMs) || 0) + durationMs;
    c.sessions.push({
      id: a.sessionId || id('session'),
      cycleId: a.cycleId || c.cycleId,
      startAt: Number(a.startedAt) || end,
      endAt: end,
      durationMs,
      reason,
      certainty,
      confidence: a.confidence || 'tracked',
      source: a.source || 'native'
    });
    if (c.sessions.length > 160) c.sessions = c.sessions.slice(-160);
    c.lastTouchedAt = Date.now();
    c.lastPausedReason = reason;
    state.active = null;
  }

  function conservativeEnd(now) {
    if (!state.active) return now;
    const verified = Number(state.active.lastVerifiedAt) || Number(state.active.startedAt) || now;
    return now - verified > UNOBSERVED_GAP_MS ? verified : now;
  }

  function observe(obs, source = 'dom', exact = false) {
    pull();
    const now = Date.now();
    if (!obs || obs.kind === 'unknown') return;

    if (obs.kind === 'out' || obs.kind === 'idle') {
      if (state.active) {
        const reason = obs.kind === 'out' ? (source === 'native-action-2' ? 'clocked-out-completely' : 'clocked-out') : 'left-job-context';
        pauseActive(exact ? now : conservativeEnd(now), reason, exact ? 'exact' : 'detected');
      }
      state.pending = null;
      save(obs.kind === 'out' ? 'clocked-out' : 'idle-clock-context');
      return;
    }

    const incoming = obs.context;
    if (!incoming?.key) return;
    const c = ensureContext(incoming);

    if (state.active?.key === incoming.key) {
      state.active.lastVerifiedAt = now;
      c.lastTouchedAt = now;
      showContext(incoming.key);
      save('verify-active');
      return;
    }

    if (state.active && state.active.key !== incoming.key) {
      pauseActive(exact ? now : conservativeEnd(now), 'switched-context', exact ? 'exact' : 'detected');
    }

    state.ui.selectedKey = incoming.key;
    showContext(incoming.key);

    if (state.pending?.key === incoming.key) {
      save('verify-pending');
      return;
    }

    const remembered = c.accumulatedMs > 0 || c.sessions.length > 0;
    if (remembered) {
      state.pending = { key: incoming.key, detectedAt: now, source, previousMs: c.accumulatedMs };
      save('ask-resume');
      return;
    }

    state.pending = null;
    state.active = {
      key: incoming.key,
      sessionId: id('session'),
      cycleId: c.cycleId,
      startedAt: now,
      lastVerifiedAt: now,
      confidence: exact ? 'tracked' : 'detected',
      source
    };
    save('start-new-context');
  }

  function startPending(restart) {
    pull();
    const p = state.pending;
    if (!p?.key || !state.contexts[p.key]) return;
    const c = state.contexts[p.key];
    if (restart) {
      c.accumulatedMs = 0;
      c.cycleId = id('cycle');
    }
    state.active = {
      key: p.key,
      sessionId: id('session'),
      cycleId: c.cycleId,
      startedAt: Number(p.detectedAt) || Date.now(),
      lastVerifiedAt: Date.now(),
      confidence: String(p.source || '').startsWith('native') ? 'tracked' : 'detected',
      source: p.source || 'resume'
    };
    state.pending = null;
    state.ui.selectedKey = c.key;
    showContext(c.key);
    save(restart ? 'start-fresh' : 'resume-timer');
  }

  function fmt(ms, compact = false) {
    const t = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    if (compact) return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m ${String(s).padStart(2, '0')}s`;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function level(ms) {
    const m = ms / 60000;
    const y = Math.max(1, Number(state.settings.yellow) || 60);
    const o = Math.max(y, Number(state.settings.orange) || 120);
    const r = Math.max(o, Number(state.settings.red) || 240);
    return m >= r ? 3 : m >= o ? 2 : m >= y ? 1 : 0;
  }

  function visibleContexts() {
    const hidden = new Set(state.ui.hiddenKeys);
    const jobs = Object.values(state.contexts)
      .filter(c => c.type === 'job' && !hidden.has(c.key))
      .sort((a, b) => (b.lastTouchedAt || 0) - (a.lastTouchedAt || 0))
      .slice(0, Math.max(1, Math.min(5, Number(state.settings.maxJobTabs) || 5)));
    const general = Object.values(state.contexts)
      .filter(c => c.type === 'general' && !hidden.has(c.key))
      .sort((a, b) => (b.lastTouchedAt || 0) - (a.lastTouchedAt || 0));
    return [...jobs, ...general];
  }

  function displayKey() {
    if (state.ui.selectedKey && state.contexts[state.ui.selectedKey] && !state.ui.hiddenKeys.includes(state.ui.selectedKey)) return state.ui.selectedKey;
    if (state.active?.key) return state.active.key;
    if (state.pending?.key) return state.pending.key;
    return visibleContexts()[0]?.key || null;
  }

  function statusFor(key) {
    if (!key) return 'No timer';
    if (state.active?.key === key) return state.active.confidence === 'detected' ? 'Running · detected' : 'Running';
    if (state.pending?.key === key) return 'Resume?';
    const r = state.contexts[key]?.lastPausedReason;
    return r === 'clocked-out-completely' || r === 'clocked-out' ? 'Clocked out' : 'Paused';
  }

  function noteFor(key) {
    if (!key) return '';
    if (state.pending?.key === key) return 'SquareCoil is on this context. Choose whether to resume the saved timer.';
    if (state.active?.key === key) return state.active.confidence === 'detected' ? 'Tracking from when this active clock was detected.' : 'Tracking from the observed SquareCoil clock transition.';
    const r = state.contexts[key]?.lastPausedReason;
    if (r === 'clocked-out-completely' || r === 'clocked-out') return 'Paused because SquareCoil was fully clocked out.';
    if (r === 'switched-context') return 'Paused when SquareCoil switched to another job or clock context.';
    return 'Viewing this tab never starts its timer.';
  }

  function historyRows() {
    const rows = [];
    for (const c of Object.values(state.contexts)) for (const s of c.sessions) rows.push({ c, s });
    return rows.sort((a, b) => (b.s.endAt || 0) - (a.s.endAt || 0)).slice(0, MAX_HISTORY);
  }

  function render() {
    if (!document.body) return;
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement('div');
      root.id = ROOT_ID;
      document.body.appendChild(root);
      root.addEventListener('click', onClick);
      root.addEventListener('change', onChange);
    }

    const key = displayKey();
    if (key) state.ui.selectedKey = key;
    const c = key ? state.contexts[key] : null;
    const ms = key ? elapsed(key) : 0;
    root.className = `jt-level-${level(ms)}${state.active ? ' jt-running' : ''}${state.ui.collapsed ? ' jt-collapsed' : ''}${settingsOpen ? ' jt-settings-open' : ''}`;

    const tabs = visibleContexts().map(t => {
      const active = state.active?.key === t.key || state.pending?.key === t.key;
      return `<div class="jt-tab${t.key === key ? ' jt-selected' : ''}${active ? ' jt-active' : ''}" data-action="select-tab" data-key="${esc(t.key)}" title="${esc(t.label)}"><span>${esc(t.shortLabel)}</span>${active ? '' : `<button type="button" class="jt-x" data-action="hide-tab" data-key="${esc(t.key)}" title="Hide recent tab">×</button>`}</div>`;
    }).join('');

    const p = state.pending?.key ? state.contexts[state.pending.key] : null;
    const prompt = p ? `<div class="jt-resume"><b>Resume ${esc(p.shortLabel)}?</b><span>SquareCoil says you are clocked here. Saved timer: ${esc(fmt(p.accumulatedMs))}</span><div><button class="jt-btn jt-primary" data-action="resume">Resume</button><button class="jt-btn" data-action="restart">Start fresh</button></div></div>` : '';

    const main = c ? `<div class="jt-main"><div class="jt-main-head"><div><b>${esc(c.type === 'job' ? c.projectId : c.shortLabel)}</b><span title="${esc(c.label)}">${esc(c.label)}</span></div><em>${esc(statusFor(key))}</em></div><strong data-role="time">${esc(fmt(ms))}</strong><small>${esc(noteFor(key))}</small></div>` : `<div class="jt-empty">No tracked jobs yet. Clock into a SquareCoil job or Production General.</div>`;

    const hidden = state.ui.hiddenKeys.map(k => state.contexts[k]).filter(Boolean).sort((a,b)=>(b.lastTouchedAt||0)-(a.lastTouchedAt||0)).map(t => `<div class="jt-row"><div><b>${esc(t.shortLabel)} · ${esc(t.label)}</b><small>Saved ${esc(fmt(elapsed(t.key), true))}</small></div><button class="jt-btn" data-action="restore" data-key="${esc(t.key)}">Show</button></div>`).join('') || '<small>No hidden recent tabs.</small>';

    const hist = historyRows().map(({c:h,s}) => {
      const when = new Date(s.endAt || Date.now()).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
      return `<div class="jt-row"><div><b>${esc(h.shortLabel)} · ${esc(s.reason || 'paused')}</b><small>${esc(when)} · ${esc(s.certainty === 'detected' ? 'detected' : 'exact')}</small></div><code>${esc(fmt(s.durationMs, true))}</code></div>`;
    }).join('') || '<small>No completed timer segments yet.</small>';

    const settings = `<div class="jt-settings"><h4>Timer settings</h4><div class="jt-thresholds"><label>Yellow<input type="number" min="1" data-setting="yellow" value="${esc(state.settings.yellow)}"></label><label>Orange<input type="number" min="1" data-setting="orange" value="${esc(state.settings.orange)}"></label><label>Red<input type="number" min="1" data-setting="red" value="${esc(state.settings.red)}"></label></div><h5>Hidden recent tabs</h5>${hidden}<h5>Recent history</h5>${hist}<div class="jt-actions"><button class="jt-btn" data-action="clear-selected">Clear selected</button><button class="jt-btn jt-danger" data-action="clear-all">Clear all cache</button></div></div>`;

    const compactLabel = c ? (c.type === 'job' ? c.projectId : c.shortLabel) : 'No active job';
    root.innerHTML = `<div class="jt-shell"><header><i></i><div><small>Job timer</small><span>${esc(compactLabel)} <b data-role="compact-time">${esc(fmt(ms))}</b></span></div><button data-action="settings" title="Timer settings">⚙</button><button data-action="collapse" title="${state.ui.collapsed ? 'Expand' : 'Collapse'}">${state.ui.collapsed ? '▴' : '▾'}</button></header><section>${prompt}<div class="jt-tabs">${tabs}</div>${main}${settings}</section></div>`;
  }

  function onClick(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const key = el.dataset.key;
    pull();

    if (action === 'collapse') {
      state.ui.collapsed = !state.ui.collapsed;
      if (state.ui.collapsed) settingsOpen = false;
      save('toggle-collapse');
    } else if (action === 'settings') {
      if (state.ui.collapsed) state.ui.collapsed = false;
      settingsOpen = !settingsOpen;
      save('toggle-settings');
    } else if (action === 'select-tab' && key && state.contexts[key]) {
      state.ui.selectedKey = key;
      save('select-tab');
    } else if (action === 'hide-tab' && key && state.contexts[key]) {
      e.stopPropagation();
      if (state.active?.key === key || state.pending?.key === key) return;
      if (!state.ui.hiddenKeys.includes(key)) state.ui.hiddenKeys.push(key);
      if (state.ui.selectedKey === key) state.ui.selectedKey = null;
      save('hide-tab');
    } else if (action === 'restore' && key && state.contexts[key]) {
      state.ui.hiddenKeys = state.ui.hiddenKeys.filter(k => k !== key);
      state.contexts[key].lastTouchedAt = Date.now();
      state.ui.selectedKey = key;
      showContext(key);
      save('restore-tab');
    } else if (action === 'resume') {
      startPending(false);
    } else if (action === 'restart') {
      startPending(true);
    } else if (action === 'clear-selected') {
      const selected = displayKey();
      if (!selected || !state.contexts[selected]) return;
      if (!confirm(`Clear saved timer/history for ${state.contexts[selected].shortLabel}?`)) return;
      const c = state.contexts[selected];
      c.sessions = [];
      c.accumulatedMs = 0;
      c.cycleId = id('cycle');
      c.lastPausedReason = null;
      if (state.active?.key === selected) Object.assign(state.active, { startedAt: Date.now(), sessionId: id('session'), cycleId: c.cycleId, lastVerifiedAt: Date.now() });
      save('clear-selected');
    } else if (action === 'clear-all') {
      if (!confirm('Clear all saved timer history and hidden tabs? This does not change SquareCoil clocking.')) return;
      const activeKey = state.active?.key || null;
      const pendingKey = state.pending?.key || null;
      const keep = {};
      for (const k of [activeKey, pendingKey]) if (k && state.contexts[k] && !keep[k]) keep[k] = { ...state.contexts[k], sessions: [], accumulatedMs: 0, cycleId: id('cycle'), lastPausedReason: null, lastTouchedAt: Date.now() };
      state.contexts = keep;
      state.ui.hiddenKeys = [];
      state.ui.selectedKey = activeKey || pendingKey;
      if (activeKey && keep[activeKey]) Object.assign(state.active, { startedAt: Date.now(), sessionId: id('session'), cycleId: keep[activeKey].cycleId, lastVerifiedAt: Date.now() }); else state.active = null;
      if (pendingKey && keep[pendingKey]) Object.assign(state.pending, { previousMs: 0, detectedAt: Date.now() }); else state.pending = null;
      save('clear-all');
    }
  }

  function onChange(e) {
    const input = e.target.closest('[data-setting]');
    if (!input) return;
    pull();
    state.settings[input.dataset.setting] = Math.max(1, Math.round(Number(input.value) || 1));
    if (state.settings.orange < state.settings.yellow) state.settings.orange = state.settings.yellow;
    if (state.settings.red < state.settings.orange) state.settings.red = state.settings.orange;
    save('settings');
  }

  function tick() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const key = displayKey();
    const ms = key ? elapsed(key) : 0;
    root.classList.remove('jt-level-0','jt-level-1','jt-level-2','jt-level-3');
    root.classList.add(`jt-level-${level(ms)}`);
    root.querySelectorAll('[data-role="time"],[data-role="compact-time"]').forEach(el => { el.textContent = fmt(ms); });
  }

  async function post(url, data) {
    const body = new URLSearchParams(Object.entries(data).map(([k,v]) => [k, String(v)]));
    const r = await fetch(url, { method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8','X-Requested-With':'XMLHttpRequest'}, body:body.toString(), cache:'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  }

  async function syncServer(source = 'server', exact = false) {
    if (syncing) return;
    syncing = true;
    try {
      const html = await post('ajax_time_clock.php', { action: 7 });
      pull();
      state.meta.lastServerCheckAt = Date.now();
      const c = fromHeader(html);
      if (c) observe({ kind:'context', context:c }, source, exact);
      else {
        const dom = fromDom();
        if (dom.kind !== 'unknown') observe(dom, source, exact);
      }
    } catch (_) {
      // Read-only sync failures never touch SquareCoil or stop the local timer.
    } finally { syncing = false; }
  }

  function syncDom(source = 'dom') {
    const obs = fromDom();
    if (obs.kind !== 'unknown') observe(obs, source, false);
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
    window.jQuery(document).ajaxComplete((_e, xhr, settings) => {
      try {
        if (!/(^|\/)ajax_time_clock\.php(?:\?|$)/i.test(String(settings?.url || ''))) return;
        if (Number(xhr?.status || 200) >= 400) return;
        const action = String(parseAjaxData(settings?.data).action || '');
        if (action === '2') {
          setTimeout(() => syncServer('native-action-2', true), 220);
        } else if (action === '3' || action === '4') {
          setTimeout(() => syncServer(`native-action-${action}`, true), 260);
        }
      } catch (_) {}
    });
  }

  function passiveClockClickFallback() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.clock-actions');
      if (!btn) return;
      const exact = ['clock-out-completely','clock-out-of-project','time-clock-clock-in-to-project-department-2','confirm-clockin','clock-into-project-from-calendar'].includes(btn.id);
      setTimeout(() => syncDom('native-click-dom'), 450);
      setTimeout(() => syncServer(btn.id === 'clock-out-completely' ? 'native-action-2' : 'native-click', exact), 900);
    }, true);
  }

  function watchClockDom() {
    const mo = new MutationObserver(muts => {
      if (!muts.some(m => {
        const t = m.target instanceof Element ? m.target : m.target?.parentElement;
        return t?.closest?.('#clockin,#clockout,#clockin-debug,#clockin-remaining-time,.timeclock-container');
      })) return;
      clearTimeout(mutationDebounce);
      mutationDebounce = setTimeout(() => syncDom('clock-dom-mutation'), 180);
    });
    mo.observe(document.body, { subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['style','class','data-time'] });
  }

  function crossTab() {
    try {
      bc = new BroadcastChannel(CHANNEL);
      bc.addEventListener('message', e => {
        if (e.data?.origin === ORIGIN) return;
        state = load();
        render();
      });
    } catch (_) {}
    window.addEventListener('storage', e => {
      if (e.key !== KEY) return;
      state = load();
      render();
    });
  }

  function debugApi() {
    window.__squareCoilJobTimerDebug = () => ({ version:VERSION, origin:ORIGIN, jqHooked, domClock:fromDom(), selectedKey:displayKey(), visibleKeys:visibleContexts().map(c=>c.key), state:JSON.parse(JSON.stringify(state)) });
    window.__squareCoilJobTimerSync = () => syncServer('manual', false);
  }

  function init() {
    crossTab();
    render();
    syncDom('initial-dom');
    passiveClockClickFallback();
    watchClockDom();
    debugApi();

    let tries = 0;
    const jqWait = setInterval(() => { hookJquery(); if (jqHooked || ++tries >= 40) clearInterval(jqWait); }, 250);
    setInterval(tick, 1000);
    setInterval(() => { if (document.visibilityState === 'visible') syncServer('heartbeat', false); }, HEARTBEAT_MS);
    window.addEventListener('focus', () => syncServer('focus', false));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncServer('visible', false); });
    setTimeout(() => syncServer('initial-server', false), 800);
  }

  function injectStyle() {
    const style = document.createElement('style');
    style.textContent = `
#${ROOT_ID}{--a:#a1c1dc;--as:rgba(161,193,220,.14);position:fixed;right:18px;bottom:18px;z-index:2147483000;width:min(390px,calc(100vw - 24px));color:#f5f7fa;font:13px/1.35 Inter,Manrope,"Segoe UI",Arial,sans-serif;isolation:isolate}
#${ROOT_ID},#${ROOT_ID} *{box-sizing:border-box}#${ROOT_ID} button,#${ROOT_ID} input{font:inherit}
#${ROOT_ID} .jt-shell{overflow:hidden;border:1px solid rgba(255,255,255,.10);border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.006)),rgba(12,13,16,.90);box-shadow:0 18px 48px rgba(0,0,0,.34);backdrop-filter:blur(20px) saturate(118%)}
#${ROOT_ID} header{min-height:46px;display:flex;align-items:center;gap:9px;padding:9px 10px 9px 12px;border-bottom:1px solid rgba(255,255,255,.09)}#${ROOT_ID}.jt-collapsed header{border-bottom:0}
#${ROOT_ID} header>i{width:8px;height:8px;border-radius:50%;background:rgba(180,187,197,.42);box-shadow:0 0 0 3px rgba(255,255,255,.035)}#${ROOT_ID}.jt-running header>i{background:var(--a);box-shadow:0 0 0 3px var(--as)}
#${ROOT_ID} header>div{min-width:0;flex:1}#${ROOT_ID} header small{display:block;color:rgba(205,211,220,.64);font-size:9.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}#${ROOT_ID} header span{display:flex;gap:8px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:650;color:rgba(238,242,247,.88)}#${ROOT_ID} header span b{margin-left:auto;color:var(--a);font-variant-numeric:tabular-nums}
#${ROOT_ID} header button{width:30px;height:30px;padding:0;border:1px solid rgba(255,255,255,.075);border-radius:9px;background:rgba(255,255,255,.035);color:rgba(235,239,244,.78);cursor:pointer}#${ROOT_ID} header button:hover{background:rgba(255,255,255,.075);color:#fff}
#${ROOT_ID} section{padding:10px}#${ROOT_ID}.jt-collapsed section{display:none}.jt-tabs{display:flex;gap:6px;overflow-x:auto;padding:1px 1px 8px;scrollbar-width:thin}.jt-tab{flex:0 0 auto;max-width:142px;min-height:31px;display:flex;align-items:center;gap:6px;padding:6px 7px 6px 9px;border:1px solid rgba(255,255,255,.075);border-radius:9px;background:rgba(255,255,255,.028);color:rgba(221,226,233,.72);cursor:pointer}.jt-tab>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px;font-weight:750}.jt-tab.jt-selected{color:#fff;background:rgba(255,255,255,.075);border-color:rgba(255,255,255,.14)}.jt-tab.jt-active{box-shadow:inset 0 -2px 0 var(--a)}.jt-x{width:17px;height:17px;padding:0;border:0;border-radius:5px;background:transparent;color:rgba(210,216,224,.45);cursor:pointer}.jt-x:hover{background:rgba(255,255,255,.08);color:#fff}
.jt-main{padding:15px 14px 13px;border:1px solid rgba(255,255,255,.07);border-radius:13px;background:linear-gradient(180deg,rgba(255,255,255,.027),rgba(255,255,255,.008)),rgba(6,7,9,.36)}.jt-main-head{display:flex;justify-content:space-between;gap:12px}.jt-main-head>div{min-width:0}.jt-main-head b{display:block;font-size:12px}.jt-main-head span{display:block;max-width:275px;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(205,211,220,.67);font-size:11.5px}.jt-main-head em{flex:0 0 auto;padding:4px 7px;border:1px solid rgba(255,255,255,.07);border-radius:999px;background:rgba(255,255,255,.03);color:rgba(205,211,220,.65);font-size:9px;font-style:normal;font-weight:800;text-transform:uppercase}.jt-main>strong{display:block;margin-top:12px;color:var(--a);font-size:34px;line-height:1;font-weight:780;font-variant-numeric:tabular-nums;letter-spacing:-.035em}.jt-main>small{display:block;margin-top:7px;color:rgba(204,211,220,.57);font-size:10.5px}.jt-empty{color:rgba(205,211,220,.65);padding:10px 2px 4px}
.jt-resume{margin-bottom:8px;padding:10px;border:1px solid rgba(226,183,103,.20);border-radius:11px;background:rgba(226,183,103,.075)}.jt-resume>b{display:block;color:#fff4df}.jt-resume>span{display:block;margin-top:3px;color:rgba(232,220,197,.7);font-size:11px}.jt-resume>div{display:flex;gap:7px;margin-top:9px}.jt-btn{min-height:30px;padding:6px 9px;border:1px solid rgba(255,255,255,.085);border-radius:8px;background:rgba(255,255,255,.045);color:rgba(240,243,247,.88);font-size:11px;font-weight:700;cursor:pointer}.jt-btn:hover{background:rgba(255,255,255,.085)}.jt-primary{background:rgba(161,193,220,.13);border-color:rgba(161,193,220,.25)}
.jt-settings{display:none;margin-top:9px;padding:11px;border:1px solid rgba(255,255,255,.075);border-radius:12px;background:rgba(6,7,9,.55)}#${ROOT_ID}.jt-settings-open .jt-settings{display:block}.jt-settings h4{margin:0 0 9px;font-size:12px}.jt-settings h5{margin:13px 0 6px;color:rgba(235,239,244,.85);font-size:10px;text-transform:uppercase;letter-spacing:.06em}.jt-thresholds{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.jt-thresholds label{color:rgba(205,211,220,.62);font-size:9.5px}.jt-thresholds input{display:block;width:100%;height:31px;margin-top:4px;padding:5px 7px;border:1px solid rgba(255,255,255,.08);border-radius:7px;background:rgba(255,255,255,.035);color:#fff}.jt-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:7px;margin-top:5px;padding:7px 8px;border:1px solid rgba(255,255,255,.055);border-radius:8px;background:rgba(255,255,255,.022)}.jt-row b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(229,233,239,.84);font-size:10.5px}.jt-row small{display:block;margin-top:2px;color:rgba(198,205,214,.48);font-size:9.5px}.jt-row code{color:rgba(231,235,240,.74);font:10.5px/1.2 ui-monospace,monospace}.jt-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}.jt-danger{color:#ffd1d1;border-color:rgba(225,113,113,.16);background:rgba(225,113,113,.055)}
#${ROOT_ID}.jt-level-0{--a:#a1c1dc;--as:rgba(161,193,220,.14)}#${ROOT_ID}.jt-level-1{--a:#d9b969;--as:rgba(217,185,105,.14)}#${ROOT_ID}.jt-level-2{--a:#e29255;--as:rgba(226,146,85,.14)}#${ROOT_ID}.jt-level-3{--a:#dd6969;--as:rgba(221,105,105,.15)}
@media(max-width:640px){#${ROOT_ID}{right:8px;bottom:8px;width:calc(100vw - 16px)}.jt-main>strong{font-size:30px}.jt-thresholds{grid-template-columns:1fr}}
`;
    document.documentElement.appendChild(style);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();
})();