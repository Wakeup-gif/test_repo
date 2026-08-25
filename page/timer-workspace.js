(() => {
  'use strict';

  const VERSION = '0.6.0';
  const ROOT_ID = 'ussign-job-timer';
  const STYLE_ID = 'usx-timer-workspace-v060';
  const STATE_KEY = 'ussign-squarecoil-job-timer-v1';
  const ARCHIVE_KEY = 'ussign-squarecoil-job-timer-archive-v1';
  const ACTIVITY_KEY = 'ussign-squarecoil-job-timer-activity-v1';
  const CSV_SCHEMA = 'squarecoil-job-timer-csv-v1';
  const MAX_ARCHIVED = 500;

  const previous = window.__usxTimerWorkspace;
  if (previous?.teardown) {
    try { previous.teardown(); } catch (_) {}
  }

  let root = null;
  let rootObserver = null;
  let mountTimer = 0;
  let customView = null;

  function uid(prefix = 'id') {
    try { return `${prefix}-${crypto.randomUUID()}`; }
    catch (_) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[ch]));
  }

  function fmt(ms) {
    const total = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return hours ? `${hours}h ${String(mins).padStart(2, '0')}m` : `${mins}m ${String(secs).padStart(2, '0')}s`;
  }

  function hours(ms) {
    return (Math.max(0, Number(ms) || 0) / 3600000).toFixed(4);
  }

  function jobUrl(context) {
    const id = String(context?.projectId || '').trim();
    return /^\d{6}$/.test(id) ? `/project.php?id=${encodeURIComponent(id)}` : null;
  }

  function readState() {
    try {
      const value = JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
      return value && typeof value === 'object' ? value : null;
    } catch (_) { return null; }
  }

  function dispatchState(encoded) {
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: STATE_KEY,
        newValue: encoded,
        storageArea: localStorage,
        url: location.href
      }));
    } catch (_) {
      try { window.__squareCoilJobTimerSync?.(); } catch (_) {}
    }
  }

  function writeState(state, reason) {
    if (!state) return false;
    state.rev = Math.max(0, Number(state.rev) || 0) + 1;
    state.updatedAt = Date.now();
    state.lastReason = reason;
    const encoded = JSON.stringify(state);
    localStorage.setItem(STATE_KEY, encoded);
    dispatchState(encoded);
    return true;
  }

  function readArchive() {
    try {
      const raw = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || 'null');
      if (raw && typeof raw === 'object') {
        return {
          schema: 1,
          updatedAt: Number(raw.updatedAt) || 0,
          contexts: raw.contexts && typeof raw.contexts === 'object' ? raw.contexts : {}
        };
      }
    } catch (_) {}
    return { schema: 1, updatedAt: 0, contexts: {} };
  }

  function writeArchive(archive) {
    archive.schema = 1;
    archive.updatedAt = Date.now();
    const entries = Object.entries(archive.contexts || {})
      .sort((a, b) => (Number(b[1]?.archivedAt) || 0) - (Number(a[1]?.archivedAt) || 0))
      .slice(0, MAX_ARCHIVED);
    archive.contexts = Object.fromEntries(entries);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
  }

  function addActivity(label, detail = '') {
    try {
      const raw = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || 'null');
      const store = Array.isArray(raw)
        ? { entries: raw, lastRuntimeSignature: null }
        : raw && typeof raw === 'object'
          ? raw
          : { entries: [], lastRuntimeSignature: null };
      if (!Array.isArray(store.entries)) store.entries = [];
      store.entries.push({ id: uid('activity'), at: Date.now(), label, detail });
      store.entries = store.entries.slice(-200);
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(store));
    } catch (_) {}
  }

  function debugSnapshot() {
    try { return window.__squareCoilJobTimerDebug?.() || null; }
    catch (_) { return null; }
  }

  function selectedKey(state) {
    const snap = debugSnapshot();
    return snap?.selectedKey || state?.ui?.selectedKey || state?.active?.key || state?.pending?.key || null;
  }

  function effectiveElapsed(context, state, now = Date.now()) {
    if (!context) return 0;
    let ms = Math.max(0, Number(context.accumulatedMs) || 0);
    if (state?.active?.key === context.key) {
      ms += Math.max(0, now - Number(state.active.startedAt || now));
    }
    return ms;
  }

  function isProtected(state, key) {
    return Boolean(
      state?.active?.key === key ||
      state?.pending?.key === key ||
      state?.meta?.observedClockKey === key
    );
  }

  function statusFor(context, state) {
    if (!context) return 'Paused';
    if (state?.active?.key === context.key) return 'Running';
    if (state?.meta?.manualPausedKey === context.key) return 'Paused';
    if (state?.pending?.key === context.key) return 'Resume';
    if (context.lastPausedReason === 'clocked-out' || context.lastPausedReason === 'clocked-out-completely') return 'Clocked out';
    return 'Paused';
  }

  function removeContextFromState(state, key) {
    if (!state?.contexts?.[key]) return false;
    delete state.contexts[key];
    if (state.ui) {
      state.ui.hiddenKeys = (state.ui.hiddenKeys || []).filter(item => item !== key);
      state.ui.tabOrder = (state.ui.tabOrder || []).filter(item => item !== key);
      if (state.ui.selectedKey === key) state.ui.selectedKey = null;
    }
    if (state.meta?.manualPausedKey === key) state.meta.manualPausedKey = null;
    return true;
  }

  function addSession(context, active, endAt, reason) {
    const startAt = Number(active?.startedAt) || endAt;
    const durationMs = Math.max(0, endAt - startAt);
    if (!Array.isArray(context.sessions)) context.sessions = [];
    const sessionId = active?.sessionId || uid('session');
    if (!context.sessions.some(session => session?.id === sessionId)) {
      context.sessions.push({
        id: sessionId,
        cycleId: active?.cycleId || context.cycleId || uid('cycle'),
        startAt,
        endAt,
        durationMs,
        reason,
        certainty: 'exact',
        confidence: active?.confidence || 'tracked',
        source: 'companion-control'
      });
      if (context.sessions.length > 180) context.sessions = context.sessions.slice(-180);
      context.accumulatedMs = Math.max(0, Number(context.accumulatedMs) || 0) + durationMs;
    }
  }

  function pauseSelected() {
    const state = readState();
    const key = selectedKey(state);
    if (!state || !key || state.active?.key !== key || !state.contexts?.[key]) return;
    const now = Date.now();
    const context = state.contexts[key];
    addSession(context, state.active, now, 'manual-pause');
    context.lastTouchedAt = now;
    context.lastPausedReason = 'manual-pause';
    state.active = null;
    state.pending = { key, detectedAt: now, source: 'manual-pause', previousMs: context.accumulatedMs };
    state.meta = { ...(state.meta || {}), manualPausedKey: key, observedClockKey: state.meta?.observedClockKey || key };
    writeState(state, 'manual-pause');
    addActivity('Paused timer', `${context.shortLabel || context.projectId || ''} · SquareCoil clock unchanged`);
  }

  function resumeSelected() {
    const state = readState();
    const key = selectedKey(state);
    if (!state || !key || !state.contexts?.[key]) return;

    if (state.meta?.manualPausedKey !== key) {
      const runtimeResume = root?.querySelector('.jt-resume [data-action="resume"]');
      if (runtimeResume) runtimeResume.click();
      return;
    }

    if (state.meta?.observedClockKey !== key) {
      alert('This timer cannot resume because SquareCoil is no longer clocked into this job. Open or clock into the job in SquareCoil first.');
      return;
    }

    const context = state.contexts[key];
    const now = Date.now();
    state.active = {
      key,
      sessionId: uid('session'),
      cycleId: context.cycleId || uid('cycle'),
      startedAt: now,
      lastVerifiedAt: now,
      confidence: 'tracked',
      source: 'manual-resume'
    };
    state.pending = null;
    state.meta.manualPausedKey = null;
    context.lastPausedReason = null;
    context.lastTouchedAt = now;
    writeState(state, 'manual-resume');
    addActivity('Resumed timer', context.shortLabel || context.projectId || context.label || 'Job');
  }

  function deleteRecent(key) {
    const state = readState();
    const context = state?.contexts?.[key];
    if (!state || !context || context.type !== 'job') return;
    if (isProtected(state, key)) {
      alert('This job is tied to the current SquareCoil clock and cannot be deleted yet.');
      return;
    }
    if (!confirm(`Delete ${context.shortLabel || context.projectId} from Recent Jobs? Its timer history will be removed unless you archive or export it first.`)) return;
    removeContextFromState(state, key);
    writeState(state, 'delete-recent-job');
    addActivity('Deleted recent job', context.label || context.shortLabel || key);
  }

  function archiveOne(key) {
    const state = readState();
    const context = state?.contexts?.[key];
    if (!state || !context || context.type !== 'job') return false;
    if (isProtected(state, key)) return false;
    const archive = readArchive();
    archive.contexts[key] = {
      ...context,
      accumulatedMs: effectiveElapsed(context, state),
      sessions: Array.isArray(context.sessions) ? context.sessions : [],
      archivedAt: Date.now()
    };
    writeArchive(archive);
    removeContextFromState(state, key);
    writeState(state, 'archive-job');
    addActivity('Archived job', context.label || context.shortLabel || key);
    return true;
  }

  function archiveAll() {
    const state = readState();
    if (!state) return;
    const candidates = Object.values(state.contexts || {}).filter(context => context.type === 'job' && !isProtected(state, context.key));
    if (!candidates.length) {
      alert('There are no inactive recent jobs available to archive.');
      return;
    }
    if (!confirm(`Archive ${candidates.length} inactive recent job${candidates.length === 1 ? '' : 's'}? Their hours and history will be preserved.`)) return;
    const archive = readArchive();
    const now = Date.now();
    for (const context of candidates) {
      archive.contexts[context.key] = {
        ...context,
        accumulatedMs: effectiveElapsed(context, state, now),
        sessions: Array.isArray(context.sessions) ? context.sessions : [],
        archivedAt: now
      };
      removeContextFromState(state, context.key);
    }
    writeArchive(archive);
    writeState(state, 'archive-all-jobs');
    addActivity('Archived recent jobs', `${candidates.length} jobs`);
  }

  function clearRecent() {
    const state = readState();
    if (!state) return;
    const candidates = Object.values(state.contexts || {}).filter(context => context.type === 'job' && !isProtected(state, context.key));
    if (!candidates.length) {
      alert('There are no inactive recent jobs available to clear.');
      return;
    }
    if (!confirm(`Delete ${candidates.length} inactive recent job${candidates.length === 1 ? '' : 's'}? Archived jobs are not affected.`)) return;
    for (const context of candidates) removeContextFromState(state, context.key);
    writeState(state, 'clear-recent-jobs');
    addActivity('Cleared recent jobs', `${candidates.length} jobs`);
  }

  function restoreArchived(key) {
    const archive = readArchive();
    const imported = archive.contexts?.[key];
    if (!imported) return;
    const state = readState();
    if (!state) return;
    state.contexts = state.contexts || {};
    const existing = state.contexts[key];
    if (existing) {
      existing.accumulatedMs = Math.max(Number(existing.accumulatedMs) || 0, Number(imported.accumulatedMs) || 0);
      existing.sessions = mergeSessions(existing.sessions, imported.sessions);
      existing.label = existing.label || imported.label;
      existing.shortLabel = existing.shortLabel || imported.shortLabel;
      existing.lastTouchedAt = Date.now();
    } else {
      state.contexts[key] = { ...imported, archivedAt: undefined, lastTouchedAt: Date.now() };
    }
    state.ui = state.ui || { collapsed: false, selectedKey: null, hiddenKeys: [], tabOrder: [] };
    state.ui.hiddenKeys = (state.ui.hiddenKeys || []).filter(item => item !== key);
    if (!(state.ui.tabOrder || []).includes(key)) state.ui.tabOrder = [...(state.ui.tabOrder || []), key];
    state.ui.selectedKey = key;
    delete archive.contexts[key];
    writeArchive(archive);
    writeState(state, 'restore-archived-job');
    addActivity('Restored archived job', imported.label || imported.shortLabel || key);
  }

  function deleteArchived(key) {
    const archive = readArchive();
    const context = archive.contexts?.[key];
    if (!context) return;
    if (!confirm(`Permanently delete archived ${context.shortLabel || context.projectId || 'job'} and its history?`)) return;
    delete archive.contexts[key];
    writeArchive(archive);
    addActivity('Deleted archived job', context.label || context.shortLabel || key);
    patchAll();
  }

  function mergeSessions(left, right) {
    const seen = new Set();
    const out = [];
    for (const session of [...(Array.isArray(left) ? left : []), ...(Array.isArray(right) ? right : [])]) {
      if (!session || typeof session !== 'object') continue;
      const id = session.id || `${session.startAt || 0}:${session.endAt || 0}:${session.durationMs || 0}:${session.reason || ''}`;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ ...session, id });
    }
    return out.sort((a, b) => (Number(a.endAt) || 0) - (Number(b.endAt) || 0)).slice(-180);
  }

  function wipeHistory() {
    const state = readState();
    const archive = readArchive();
    if (!state) return;
    if (!confirm('Completely wipe all recorded timer hours, completed sessions, archived job hours, and the Activity Log? Job entries will remain. This cannot be undone unless you exported a CSV first.')) return;
    const now = Date.now();
    for (const context of Object.values(state.contexts || {})) {
      context.sessions = [];
      context.accumulatedMs = 0;
      context.cycleId = uid('cycle');
      context.lastPausedReason = null;
    }
    if (state.active?.key && state.contexts?.[state.active.key]) {
      state.active.startedAt = now;
      state.active.lastVerifiedAt = now;
      state.active.sessionId = uid('session');
      state.active.cycleId = state.contexts[state.active.key].cycleId;
    }
    if (state.pending?.key && state.contexts?.[state.pending.key]) {
      state.pending.previousMs = 0;
      state.pending.detectedAt = now;
    }
    for (const context of Object.values(archive.contexts || {})) {
      context.sessions = [];
      context.accumulatedMs = 0;
      context.cycleId = uid('cycle');
      context.lastPausedReason = null;
    }
    writeArchive(archive);
    localStorage.removeItem(ACTIVITY_KEY);
    writeState(state, 'wipe-history');
  }

  function csvEscape(value) {
    const text = String(value ?? '');
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function exportCsv() {
    const state = readState();
    if (!state) return;
    const archive = readArchive();
    const columns = [
      'schema','record_type','archived','context_key','context_type','project_id','short_label','label',
      'total_ms','total_hours','created_at','last_touched_at','archived_at','session_id','session_cycle_id',
      'session_start_at','session_end_at','session_duration_ms','session_hours','reason','certainty','confidence','source'
    ];
    const rows = [columns];
    const now = Date.now();

    function appendContext(context, archived) {
      if (!context) return;
      const totalMs = archived ? Math.max(0, Number(context.accumulatedMs) || 0) : effectiveElapsed(context, state, now);
      rows.push([
        CSV_SCHEMA,'context',archived ? '1' : '0',context.key || '',context.type || 'job',context.projectId || '',
        context.shortLabel || '',context.label || '',String(totalMs),hours(totalMs),context.createdAt || '',
        context.lastTouchedAt || '',context.archivedAt || '','','','','','','','','','',''
      ]);
      for (const session of Array.isArray(context.sessions) ? context.sessions : []) {
        rows.push([
          CSV_SCHEMA,'session',archived ? '1' : '0',context.key || '',context.type || 'job',context.projectId || '',
          context.shortLabel || '',context.label || '','','',context.createdAt || '',context.lastTouchedAt || '',
          context.archivedAt || '',session.id || '',session.cycleId || '',session.startAt || '',session.endAt || '',
          session.durationMs || 0,hours(session.durationMs),session.reason || '',session.certainty || '',session.confidence || '',session.source || ''
        ]);
      }
    }

    for (const context of Object.values(state.contexts || {})) appendContext(context, false);
    for (const context of Object.values(archive.contexts || {})) appendContext(context, true);

    const csv = rows.map(row => row.map(csvEscape).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `squarecoil-job-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    addActivity('Exported job history CSV', `${rows.length - 1} records`);
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;
    const source = String(text || '').replace(/^\uFEFF/, '');
    for (let i = 0; i < source.length; i += 1) {
      const ch = source[i];
      if (quoted) {
        if (ch === '"' && source[i + 1] === '"') { field += '"'; i += 1; }
        else if (ch === '"') quoted = false;
        else field += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
      else field += ch;
    }
    if (field.length || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
    return rows;
  }

  function importCsvText(text) {
    const rows = parseCsv(text);
    if (rows.length < 2) throw new Error('The CSV has no job data.');
    const headers = rows[0].map(value => String(value || '').trim());
    const index = Object.fromEntries(headers.map((name, i) => [name, i]));
    if (index.record_type == null || index.context_key == null) throw new Error('This is not a SquareCoil Job Timer CSV.');

    const imported = new Map();
    function cell(row, name) { return index[name] == null ? '' : row[index[name]] ?? ''; }

    for (const row of rows.slice(1)) {
      const schema = cell(row, 'schema');
      if (schema && schema !== CSV_SCHEMA) continue;
      const key = String(cell(row, 'context_key') || '').trim();
      if (!key) continue;
      let entry = imported.get(key);
      if (!entry) {
        entry = {
          key,
          type: cell(row, 'context_type') === 'general' ? 'general' : 'job',
          projectId: cell(row, 'project_id') || null,
          shortLabel: cell(row, 'short_label') || cell(row, 'project_id') || key,
          label: cell(row, 'label') || cell(row, 'short_label') || key,
          accumulatedMs: 0,
          sessions: [],
          cycleId: uid('cycle'),
          createdAt: Number(cell(row, 'created_at')) || Date.now(),
          lastTouchedAt: Date.now(),
          lastPausedReason: 'imported'
        };
        imported.set(key, entry);
      }
      if (cell(row, 'record_type') === 'context') {
        entry.accumulatedMs = Math.max(entry.accumulatedMs, Number(cell(row, 'total_ms')) || 0);
        entry.createdAt = Number(cell(row, 'created_at')) || entry.createdAt;
      } else if (cell(row, 'record_type') === 'session') {
        entry.sessions.push({
          id: cell(row, 'session_id') || uid('session'),
          cycleId: cell(row, 'session_cycle_id') || entry.cycleId,
          startAt: Number(cell(row, 'session_start_at')) || 0,
          endAt: Number(cell(row, 'session_end_at')) || 0,
          durationMs: Math.max(0, Number(cell(row, 'session_duration_ms')) || 0),
          reason: cell(row, 'reason') || 'imported',
          certainty: cell(row, 'certainty') || 'imported',
          confidence: cell(row, 'confidence') || 'imported',
          source: cell(row, 'source') || 'csv-import'
        });
      }
    }

    if (!imported.size) throw new Error('No compatible jobs were found in this CSV.');
    const state = readState();
    if (!state) throw new Error('Timer state is unavailable on this page.');
    const archive = readArchive();
    state.contexts = state.contexts || {};
    state.ui = state.ui || { collapsed: false, selectedKey: null, hiddenKeys: [], tabOrder: [] };

    for (const [key, incoming] of imported) {
      incoming.sessions = mergeSessions([], incoming.sessions);
      const existing = state.contexts[key];
      if (existing) {
        existing.accumulatedMs = Math.max(Number(existing.accumulatedMs) || 0, Number(incoming.accumulatedMs) || 0);
        existing.sessions = mergeSessions(existing.sessions, incoming.sessions);
        existing.label = existing.label || incoming.label;
        existing.shortLabel = existing.shortLabel || incoming.shortLabel;
        existing.projectId = existing.projectId || incoming.projectId;
        existing.lastTouchedAt = Date.now();
      } else {
        state.contexts[key] = { ...incoming, lastTouchedAt: Date.now() };
      }
      state.ui.hiddenKeys = (state.ui.hiddenKeys || []).filter(item => item !== key);
      if (!(state.ui.tabOrder || []).includes(key)) state.ui.tabOrder = [...(state.ui.tabOrder || []), key];
      delete archive.contexts[key];
    }

    writeArchive(archive);
    writeState(state, 'import-history-csv');
    addActivity('Imported job history CSV', `${imported.size} jobs restored`);
    return imported.size;
  }

  function recentView(state) {
    const hidden = new Set(state?.ui?.hiddenKeys || []);
    const contexts = Object.values(state?.contexts || {})
      .sort((a, b) => (Number(b.lastTouchedAt) || 0) - (Number(a.lastTouchedAt) || 0))
      .slice(0, 100);
    const rows = contexts.length ? contexts.map(context => {
      const url = jobUrl(context);
      const title = esc(context.shortLabel || context.projectId || context.label || context.key);
      const label = esc(context.label || '');
      const protectedJob = isProtected(state, context.key);
      const isHidden = hidden.has(context.key);
      const titleHtml = url
        ? `<a class="usx-job-title" href="${esc(url)}" target="_blank" rel="noopener">${title}</a><a class="usx-job-sub" href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`
        : `<b>${title}</b><small>${label}</small>`;
      const jobActions = context.type === 'job'
        ? `<button type="button" class="usx-inline-btn" data-usx-archive-job="${esc(context.key)}" ${protectedJob ? 'disabled' : ''}>Archive</button><button type="button" class="usx-inline-btn usx-danger-btn" data-usx-delete-job="${esc(context.key)}" ${protectedJob ? 'disabled' : ''}>Delete</button>`
        : '';
      return `<div class="usx-list-row usx-job-row"><div>${titleHtml}</div><div class="usx-row-meta"><code>${esc(fmt(effectiveElapsed(context, state)))}</code><span class="usx-pill">${esc(isHidden ? 'Hidden' : statusFor(context, state))}</span><div class="usx-row-actions"><button type="button" class="usx-inline-btn" data-usx-select-job="${esc(context.key)}">${isHidden ? 'Show' : 'View'}</button>${jobActions}</div></div></div>`;
    }).join('') : '<div class="usx-empty">No recent jobs yet.</div>';

    return `<div class="usx-settings-page usx-workspace-page"><div class="usx-page-head usx-page-head-actions"><button type="button" class="usx-back" data-usx-back aria-label="Back">‹</button><h4>Recent Jobs</h4><div class="usx-head-actions"><button type="button" class="usx-inline-btn" data-usx-archive-all>Archive all</button><button type="button" class="usx-inline-btn usx-danger-btn" data-usx-clear-recent>Clear recent</button></div></div><div class="usx-view-list">${rows}</div></div>`;
  }

  function archivesView() {
    const archive = readArchive();
    const contexts = Object.values(archive.contexts || {}).sort((a, b) => (Number(b.archivedAt) || 0) - (Number(a.archivedAt) || 0));
    const rows = contexts.length ? contexts.map(context => {
      const url = jobUrl(context);
      const title = esc(context.shortLabel || context.projectId || context.label || context.key);
      const label = esc(context.label || '');
      const titleHtml = url
        ? `<a class="usx-job-title" href="${esc(url)}" target="_blank" rel="noopener">${title}</a><a class="usx-job-sub" href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`
        : `<b>${title}</b><small>${label}</small>`;
      return `<div class="usx-list-row usx-job-row"><div>${titleHtml}</div><div class="usx-row-meta"><code>${esc(fmt(context.accumulatedMs))}</code><span class="usx-pill">Archived</span><div class="usx-row-actions"><button type="button" class="usx-inline-btn" data-usx-restore-archive="${esc(context.key)}">Restore</button><button type="button" class="usx-inline-btn usx-danger-btn" data-usx-delete-archive="${esc(context.key)}">Delete</button></div></div></div>`;
    }).join('') : '<div class="usx-empty">No archived jobs yet.</div>';

    return `<div class="usx-settings-page usx-workspace-page"><div class="usx-page-head usx-page-head-actions"><button type="button" class="usx-back" data-usx-workspace-back aria-label="Back">‹</button><h4>Archives & CSV</h4><small>${contexts.length} archived</small></div><div class="usx-backup-actions"><button type="button" class="jt-btn jt-primary" data-usx-export-csv>Export CSV</button><button type="button" class="jt-btn" data-usx-import-csv>Import CSV</button><button type="button" class="jt-btn jt-danger" data-usx-wipe-history>Wipe all history</button><input type="file" accept=".csv,text/csv" data-usx-csv-input hidden></div><p class="usx-backup-note">CSV export includes recent and archived jobs, total hours, and completed sessions. Imported jobs return to Recent Jobs as paused timers so tracking can continue.</p><div class="usx-view-list">${rows}</div></div>`;
  }

  function patchHome() {
    const app = root?.querySelector('.usx-settings-app');
    if (!app) return;
    const heading = app.querySelector('.usx-page-head h4')?.textContent?.trim();
    if (heading !== 'Timer settings') return;
    const libraryLabel = [...app.querySelectorAll('.usx-section-label')].find(el => el.textContent.trim().toLowerCase() === 'library');
    const stack = libraryLabel?.nextElementSibling;
    if (!stack?.classList.contains('usx-nav-stack') || stack.querySelector('[data-usx-view="archives"]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'usx-nav-card';
    button.dataset.usxView = 'archives';
    button.innerHTML = '<span><b>Archives & CSV</b><small>Archive jobs, export hours, or restore a backup</small></span><span>›</span>';
    stack.appendChild(button);
  }

  function patchSettings() {
    if (!root?.classList.contains('jt-settings-open') || root.classList.contains('jt-collapsed')) {
      customView = null;
      return;
    }
    const app = root.querySelector('.usx-settings-app');
    if (!app) return;
    if (customView === 'archives') {
      app.innerHTML = archivesView();
      return;
    }
    const heading = app.querySelector('.usx-page-head h4')?.textContent?.trim();
    if (heading === 'Recent Jobs') {
      const state = readState();
      if (state) app.innerHTML = recentView(state);
    } else if (heading === 'Timer settings') {
      patchHome();
      const version = app.querySelector('.usx-page-head small');
      if (version && /^v\d/.test(version.textContent.trim())) version.textContent = `v${VERSION}`;
    }
  }

  function patchMain() {
    if (!root || root.classList.contains('jt-collapsed')) return;
    const state = readState();
    const key = selectedKey(state);
    const context = state?.contexts?.[key];
    const main = root.querySelector('.jt-main');
    if (!state || !context || !main) return;

    const head = main.querySelector('.jt-main-head > div');
    const url = jobUrl(context);
    if (head && url) {
      const primary = head.querySelector('b');
      const secondary = head.querySelector('span');
      if (primary && !primary.querySelector('a')) primary.innerHTML = `<a class="usx-main-job-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(context.projectId || context.shortLabel)}</a>`;
      if (secondary && !secondary.querySelector('a')) secondary.innerHTML = `<a class="usx-main-job-link usx-main-job-label" href="${esc(url)}" target="_blank" rel="noopener">${esc(context.label || '')}</a>`;
    }

    const status = main.querySelector('.jt-main-head em');
    if (status && state.meta?.manualPausedKey === key) {
      status.textContent = 'Paused';
      status.dataset.timerState = 'paused';
    }

    main.querySelector(':scope > .usx-main-actions')?.remove();
    const actions = document.createElement('div');
    actions.className = 'usx-main-actions';
    const controls = [];
    if (state.active?.key === key) controls.push('<button type="button" class="jt-btn jt-primary" data-usx-pause>Pause</button>');
    else if (state.pending?.key === key) controls.push('<button type="button" class="jt-btn jt-primary" data-usx-resume>Resume</button>');
    if (url) controls.push(`<a class="jt-btn usx-button-link" href="${esc(url)}" target="_blank" rel="noopener">Open job</a>`);
    if (context.type === 'job') controls.push(`<button type="button" class="jt-btn jt-danger" data-usx-delete-job="${esc(context.key)}" ${isProtected(state, context.key) ? 'disabled' : ''}>Delete</button>`);
    actions.innerHTML = controls.join('');
    const time = main.querySelector(':scope > strong[data-role="time"]');
    if (time) time.insertAdjacentElement('afterend', actions);
    if (state.meta?.manualPausedKey === key) {
      const note = document.createElement('small');
      note.className = 'usx-manual-note';
      note.textContent = 'Timer paused locally. Your SquareCoil clock was not changed.';
      actions.insertAdjacentElement('afterend', note);
    }
  }

  function patchAll() {
    patchMain();
    patchSettings();
  }

  function onClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    if (target.closest('[data-usx-workspace-back]')) {
      event.preventDefault();
      customView = null;
      const settings = root?.querySelector('.jt-settings');
      const app = settings?.querySelector('.usx-settings-app');
      if (app) {
        const snap = debugSnapshot();
        const state = snap?.state || readState() || {};
        const limits = state.settings || { yellow: 60, orange: 120, red: 240 };
        app.innerHTML = `<div class="usx-settings-page"><div class="usx-page-head"><span></span><h4>Timer settings</h4><small>v${VERSION}</small></div><div class="usx-home-body"><div class="usx-section-label">Library</div><div class="usx-nav-stack"><button type="button" class="usx-nav-card" data-usx-view="recent"><span><b>Recent Jobs</b><small>Saved job timers and hidden tabs</small></span><span>›</span></button><button type="button" class="usx-nav-card" data-usx-view="history"><span><b>History</b><small>Completed and paused timer sessions</small></span><span>›</span></button><button type="button" class="usx-nav-card" data-usx-view="activity"><span><b>Activity Log</b><small>Timer and theme events</small></span><span>›</span></button><button type="button" class="usx-nav-card" data-usx-view="archives"><span><b>Archives & CSV</b><small>Archive jobs, export hours, or restore a backup</small></span><span>›</span></button></div><div class="usx-section-label" style="margin-top:11px">Timer limits</div><div class="usx-limits"><label>Yellow<input type="number" min="1" data-setting="yellow" value="${esc(limits.yellow)}"></label><label>Orange<input type="number" min="1" data-setting="orange" value="${esc(limits.orange)}"></label><label>Red<input type="number" min="1" data-setting="red" value="${esc(limits.red)}"></label></div></div></div>`;
      }
      return;
    }

    const nav = target.closest('[data-usx-view="archives"]');
    if (nav) {
      event.preventDefault();
      customView = 'archives';
      queueMicrotask(patchSettings);
      return;
    }

    if (target.closest('[data-usx-back]')) {
      customView = null;
      queueMicrotask(patchAll);
      return;
    }

    if (target.closest('[data-usx-pause]')) { event.preventDefault(); event.stopPropagation(); pauseSelected(); return; }
    if (target.closest('[data-usx-resume]')) { event.preventDefault(); event.stopPropagation(); resumeSelected(); return; }

    const select = target.closest('[data-usx-select-job]');
    if (select) {
      event.preventDefault();
      event.stopPropagation();
      try { window.__squareCoilJobTimerSelect?.(select.dataset.usxSelectJob); } catch (_) {}
      queueMicrotask(patchAll);
      return;
    }

    const del = target.closest('[data-usx-delete-job]');
    if (del) { event.preventDefault(); event.stopPropagation(); deleteRecent(del.dataset.usxDeleteJob); return; }
    const archive = target.closest('[data-usx-archive-job]');
    if (archive) { event.preventDefault(); event.stopPropagation(); archiveOne(archive.dataset.usxArchiveJob); return; }
    if (target.closest('[data-usx-archive-all]')) { event.preventDefault(); event.stopPropagation(); archiveAll(); return; }
    if (target.closest('[data-usx-clear-recent]')) { event.preventDefault(); event.stopPropagation(); clearRecent(); return; }

    const restore = target.closest('[data-usx-restore-archive]');
    if (restore) { event.preventDefault(); event.stopPropagation(); restoreArchived(restore.dataset.usxRestoreArchive); queueMicrotask(patchAll); return; }
    const deleteArchiveButton = target.closest('[data-usx-delete-archive]');
    if (deleteArchiveButton) { event.preventDefault(); event.stopPropagation(); deleteArchived(deleteArchiveButton.dataset.usxDeleteArchive); return; }

    if (target.closest('[data-usx-export-csv]')) { event.preventDefault(); event.stopPropagation(); exportCsv(); return; }
    if (target.closest('[data-usx-import-csv]')) {
      event.preventDefault();
      event.stopPropagation();
      root?.querySelector('[data-usx-csv-input]')?.click();
      return;
    }
    if (target.closest('[data-usx-wipe-history]')) { event.preventDefault(); event.stopPropagation(); wipeHistory(); queueMicrotask(patchAll); return; }

    if (target.closest('[data-usx-view]')) queueMicrotask(patchAll);
  }

  async function onChange(event) {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    if (!input?.matches('[data-usx-csv-input]') || !input.files?.[0]) return;
    try {
      const count = importCsvText(await input.files[0].text());
      alert(`Restored ${count} job${count === 1 ? '' : 's'} from the CSV. They are available in Recent Jobs.`);
      customView = 'archives';
      patchAll();
    } catch (error) {
      alert(`Could not import this CSV: ${String(error?.message || error)}`);
    } finally {
      input.value = '';
    }
  }

  function injectStyle() {
    document.getElementById(STYLE_ID)?.remove();
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${ROOT_ID} .usx-main-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06)}
#${ROOT_ID} .usx-button-link{display:inline-flex;align-items:center;justify-content:center;text-decoration:none!important}
#${ROOT_ID} .usx-main-job-link{color:inherit!important;text-decoration:none!important}
#${ROOT_ID} .usx-main-job-link:hover{text-decoration:underline!important;text-underline-offset:2px}
#${ROOT_ID} .usx-manual-note{display:block;margin-top:7px;color:rgba(201,209,218,.60);font-size:9.5px}
#${ROOT_ID} .usx-page-head-actions{grid-template-columns:auto minmax(80px,1fr) auto!important}
#${ROOT_ID} .usx-head-actions{display:flex;align-items:center;justify-content:flex-end;gap:5px}
#${ROOT_ID} .usx-row-actions{display:flex;justify-content:flex-end;gap:4px;margin-top:2px}
#${ROOT_ID} .usx-job-title,#${ROOT_ID} .usx-job-sub{display:block;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-decoration:none!important}
#${ROOT_ID} .usx-job-title{color:rgba(231,237,243,.92)!important;font-size:10.5px;font-weight:700}
#${ROOT_ID} .usx-job-sub{margin-top:2px;color:rgba(190,201,212,.65)!important;font-size:9.5px}
#${ROOT_ID} .usx-job-title:hover,#${ROOT_ID} .usx-job-sub:hover{text-decoration:underline!important;text-underline-offset:2px}
#${ROOT_ID} .usx-danger-btn{border-color:rgba(221,105,105,.18)!important;color:rgba(240,184,184,.88)!important}
#${ROOT_ID} button:disabled{opacity:.38!important;cursor:not-allowed!important}
#${ROOT_ID} .usx-backup-actions{display:flex;gap:6px;flex-wrap:wrap;padding:10px 10px 7px}
#${ROOT_ID} .usx-backup-note{margin:0;padding:0 10px 8px;color:rgba(190,201,212,.62);font-size:9.5px;line-height:1.45}

html[data-usx-theme="light"] #${ROOT_ID}{color:#28323c!important}
html[data-usx-theme="light"] #${ROOT_ID} .jt-main-head span,html[data-usx-theme="light"] #${ROOT_ID} .jt-empty{color:#5c6975!important}
html[data-usx-theme="light"] #${ROOT_ID} .jt-main-head em{color:#52606d!important;background:#f2f5f7!important;border-color:#d5dde4!important}
html[data-usx-theme="light"] #${ROOT_ID} .jt-main-head em[data-timer-state="running"]{color:#245b82!important;background:#eaf5fc!important;border-color:#b8d9ee!important}
html[data-usx-theme="light"] #${ROOT_ID} .usx-page-head{border-bottom-color:#dfe5ea!important}
html[data-usx-theme="light"] #${ROOT_ID} .usx-page-head h4{color:#222d37!important}
html[data-usx-theme="light"] #${ROOT_ID} .usx-page-head small{color:#687581!important}
html[data-usx-theme="light"] #${ROOT_ID} .usx-section-label{color:#66737f!important}
html[data-usx-theme="light"] #${ROOT_ID} .usx-nav-card small,html[data-usx-theme="light"] #${ROOT_ID} .usx-list-row small,html[data-usx-theme="light"] #${ROOT_ID} .usx-site-theme-card small{color:#66737f!important}
html[data-usx-theme="light"] #${ROOT_ID} .usx-nav-card>span:last-child{color:#73808c!important}
html[data-usx-theme="light"] #${ROOT_ID} .usx-limits label{color:#5c6975!important}
html[data-usx-theme="light"] #${ROOT_ID} .usx-pill{color:#52606d!important;background:#f1f4f6!important;border-color:#d8e0e6!important}
html[data-usx-theme="light"] #${ROOT_ID} .usx-row-meta code{color:#394651!important}
html[data-usx-theme="light"] #${ROOT_ID} .usx-job-title{color:#1f4f78!important}
html[data-usx-theme="light"] #${ROOT_ID} .usx-job-sub,html[data-usx-theme="light"] #${ROOT_ID} .usx-backup-note,html[data-usx-theme="light"] #${ROOT_ID} .usx-manual-note{color:#5f6d79!important}
html[data-usx-theme="light"] #${ROOT_ID} .usx-main-actions{border-top-color:#e0e5e9!important}
html[data-usx-theme="light"] #${ROOT_ID} .jt-danger,html[data-usx-theme="light"] #${ROOT_ID} .usx-danger-btn{color:#a13c3c!important;border-color:#efcaca!important;background:#fff7f7!important}

html[data-usx-theme="dark"] #${ROOT_ID} .jt-shell{background:#12171c!important;border-color:#2a333c!important;box-shadow:0 18px 42px rgba(0,0,0,.32)!important}
html[data-usx-theme="dark"] #${ROOT_ID} .jt-main,html[data-usx-theme="dark"] #${ROOT_ID} .jt-settings,html[data-usx-theme="dark"] #${ROOT_ID} .jt-empty{background:#181e24!important;border-color:#2b343d!important}
html[data-usx-theme="dark"] #${ROOT_ID} .jt-tab{background:#171d23!important;box-shadow:none!important}
html[data-usx-theme="dark"] #${ROOT_ID} .jt-tab.jt-selected{background:#1d242b!important;border-bottom-color:#1d242b!important}
html[data-usx-theme="dark"] #${ROOT_ID} .usx-nav-card,html[data-usx-theme="dark"] #${ROOT_ID} .usx-list-row,html[data-usx-theme="dark"] #${ROOT_ID} .usx-site-theme-card{background:#1d242b!important;border-color:#303a44!important}
html[data-usx-theme="dark"] #${ROOT_ID} .usx-section-label{color:#9ba8b4!important}
html[data-usx-theme="dark"] #${ROOT_ID} .usx-nav-card small,html[data-usx-theme="dark"] #${ROOT_ID} .usx-list-row small,html[data-usx-theme="dark"] #${ROOT_ID} .usx-site-theme-card small{color:#a8b3bd!important}
html[data-usx-theme="dark"] #${ROOT_ID} .usx-job-title{color:#9dcef6!important}
html[data-usx-theme="dark"] #${ROOT_ID} .usx-job-sub{color:#a8b3bd!important}
`;
    document.documentElement.appendChild(style);
  }

  function onRootMutation() {
    queueMicrotask(patchAll);
  }

  function onThemeState() {
    queueMicrotask(patchAll);
  }

  function attach(nextRoot) {
    if (!nextRoot || root === nextRoot) return;
    if (root) {
      root.removeEventListener('click', onClick);
      root.removeEventListener('change', onChange);
    }
    rootObserver?.disconnect();
    root = nextRoot;
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    rootObserver = new MutationObserver(onRootMutation);
    rootObserver.observe(root, { childList: true });
    patchAll();
  }

  function findRoot() {
    const found = document.getElementById(ROOT_ID);
    if (found) { attach(found); return; }
    let attempts = 0;
    clearInterval(mountTimer);
    mountTimer = setInterval(() => {
      const candidate = document.getElementById(ROOT_ID);
      if (candidate) {
        clearInterval(mountTimer);
        mountTimer = 0;
        attach(candidate);
      } else if (++attempts >= 50) {
        clearInterval(mountTimer);
        mountTimer = 0;
      }
    }, 100);
  }

  function teardown() {
    clearInterval(mountTimer);
    mountTimer = 0;
    rootObserver?.disconnect();
    rootObserver = null;
    if (root) {
      root.removeEventListener('click', onClick);
      root.removeEventListener('change', onChange);
    }
    window.removeEventListener('USX_THEME_STATE', onThemeState);
    document.getElementById(STYLE_ID)?.remove();
    root = null;
  }

  window.__usxTimerWorkspace = { version: VERSION, teardown };
  window.addEventListener('USX_THEME_STATE', onThemeState);
  injectStyle();
  findRoot();
})();
