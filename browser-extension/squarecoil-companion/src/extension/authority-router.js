'use strict';

const {
  AUTHORITY_PROTOCOL_VERSION,
  AUTHORITY_MESSAGES,
  isConcreteId,
  validateAuthorityRequest
} = require('./authority-protocol');
const {
  isPublicTimerCommandType,
  isOwnerOnlyTimerCommandType
} = require('../data/command-dispatcher');

const POSITIVE_DISPOSITIONS = new Set(['OWNER', 'OBSERVER_CONNECTED']);
const REQUIRED_ADAPTER_METHODS = Object.freeze([
  'initialize',
  'connect',
  'read',
  'command',
  'subscribe',
  'heartbeat',
  'disconnect'
]);
const PRIVATE_AUTHORITY_KEYS = new Set([
  'fencingToken',
  'ownerRuntimeId',
  'ownerDocumentToken',
  'ownerTabId',
  'owner',
  'writer',
  'requester',
  'requesterDisposition',
  'accrualOwnerToken',
  'commitFence',
  'commandReceipts',
  'commandReceiptOrder'
]);

function errorMessage(error) {
  return String(error && (error.message || error) || 'unknown-error');
}

function defaultRandomId(prefix) {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function validAdapter(value) {
  return Boolean(value && REQUIRED_ADAPTER_METHODS.every(name => typeof value[name] === 'function'));
}

function publicAuthorityValue(value, seen = new WeakSet()) {
  if (value === null || value === undefined || typeof value !== 'object') return value;
  if (seen.has(value)) throw new Error('authority-public-value-cyclic');
  seen.add(value);
  if (Array.isArray(value)) {
    const result = value.map(item => publicAuthorityValue(item, seen));
    seen.delete(value);
    return result;
  }
  const result = {};
  for (const [key, entry] of Object.entries(value)) {
    if (PRIVATE_AUTHORITY_KEYS.has(key)) continue;
    result[key] = publicAuthorityValue(entry, seen);
  }
  seen.delete(value);
  return result;
}

function hasPrivateAuthorityKey(value, seen = new WeakSet()) {
  if (!value || typeof value !== 'object') return false;
  if (seen.has(value)) return true;
  seen.add(value);
  for (const [key, entry] of Object.entries(value)) {
    if (PRIVATE_AUTHORITY_KEYS.has(key) || hasPrivateAuthorityKey(entry, seen)) {
      seen.delete(value);
      return true;
    }
  }
  seen.delete(value);
  return false;
}

function createAuthorityRouter(options = {}) {
  const randomId = options.randomId || defaultRandomId;
  const publish = typeof options.publish === 'function' ? options.publish : async () => false;
  const workerInstanceId = String(options.workerInstanceId || randomId('worker'));
  const sessions = new Map();
  const sessionByRuntime = new Map();
  const operationQueues = new Map();
  let adapter = validAdapter(options.adapter) ? options.adapter : null;
  let initializePromise = null;

  function installAdapter(nextAdapter) {
    if (!validAdapter(nextAdapter)) throw new Error('authority-adapter-contract-invalid');
    if (sessions.size) throw new Error('authority-adapter-change-with-live-sessions');
    adapter = nextAdapter;
    initializePromise = null;
    return true;
  }

  function isAvailable() {
    return validAdapter(adapter);
  }

  function runtimeKey(identity) {
    return `${identity.tabId}\u0000${identity.documentToken}\u0000${identity.runtimeInstanceId}`;
  }

  function response(message, values = {}) {
    return {
      ok: values.ok !== false,
      protocolVersion: AUTHORITY_PROTOCOL_VERSION,
      type: message.type,
      requestId: message.requestId,
      workerInstanceId,
      ...values
    };
  }

  function fail(message, reason, values = {}) {
    return response(message, { ok: false, reason, ...values });
  }

  function normalizeIdentity(context, message) {
    return Object.freeze({
      tabId: Number.isInteger(context?.tabId) ? context.tabId : null,
      expectedDocumentId: context?.expectedDocumentId || null,
      documentToken: String(context?.documentToken || ''),
      runtimeInstanceId: String(message.runtimeInstanceId || ''),
      buildId: String(context?.buildId || ''),
      packageVersion: String(context?.packageVersion || ''),
      candidateFingerprint: String(context?.candidateFingerprint || '')
    });
  }

  async function initializeAdapter() {
    if (!initializePromise) {
      const task = Promise.resolve().then(() => adapter.initialize());
      initializePromise = task.catch(error => {
        if (initializePromise) initializePromise = null;
        throw error;
      });
    }
    return initializePromise;
  }

  function publicConnection(session, extra = {}) {
    return {
      sessionId: session.sessionId,
      disposition: session.disposition,
      coordinationEpoch: session.connection?.coordinationEpoch ?? session.connection?.epoch ?? null,
      coordinationRevision: session.connection?.coordinationRevision ?? null,
      leaseExpiry: session.connection?.leaseExpiry ?? null,
      revision: session.connection?.revision ?? null,
      reason: session.connection?.reason ?? null,
      sequence: session.sequence,
      ...extra
    };
  }

  function getSession(context, message) {
    const session = sessions.get(String(message.sessionId || ''));
    if (!session) return null;
    const identity = normalizeIdentity(context, message);
    if (
      session.identity.tabId !== identity.tabId ||
      session.identity.expectedDocumentId !== identity.expectedDocumentId ||
      session.identity.documentToken !== identity.documentToken ||
      session.identity.runtimeInstanceId !== identity.runtimeInstanceId
    ) return null;
    return session;
  }

  async function connect(context, message) {
    const identity = normalizeIdentity(context, message);
    if (!Number.isInteger(identity.tabId) || !isConcreteId(identity.documentToken)) {
      return fail(message, 'authority-context-invalid');
    }
    const key = runtimeKey(identity);
    const existingId = sessionByRuntime.get(key);
    const existing = existingId ? sessions.get(existingId) : null;
    if (existing) return response(message, publicConnection(existing, { reused: true }));

    let connection;
    try {
      await initializeAdapter();
      connection = await adapter.connect(Object.freeze({
        runtimeId: identity.runtimeInstanceId,
        documentToken: identity.documentToken,
        tabId: identity.tabId
      }));
    } catch (error) {
      return fail(message, 'authority-connect-failed', { detail: errorMessage(error), retryable: true });
    }
    const disposition = String(connection?.disposition || 'UNAVAILABLE');
    if (!POSITIVE_DISPOSITIONS.has(disposition) || connection?.session == null) {
      try {
        if (connection?.session != null) await adapter.disconnect(connection.session);
      } catch (_) {}
      return fail(message, 'authority-positive-disposition-required', {
        disposition,
        retryable: true
      });
    }

    const session = {
      sessionId: randomId('authority-session'),
      identity,
      connection,
      adapterSession: connection.session,
      disposition,
      sequence: 0,
      unsubscribe: null,
      disconnecting: false
    };
    sessions.set(session.sessionId, session);
    sessionByRuntime.set(key, session.sessionId);
    return response(message, publicConnection(session));
  }

  async function recoverDisconnect(context, message) {
    const identity = normalizeIdentity(context, message);
    if (!Number.isInteger(identity.tabId) || !isConcreteId(identity.documentToken)) {
      return fail(message, 'authority-context-invalid');
    }
    const key = runtimeKey(identity);
    const activeSessionId = sessionByRuntime.get(key);
    const activeSession = activeSessionId ? sessions.get(activeSessionId) : null;
    if (activeSession) {
      return fail(message, 'authority-stale-disconnect-rejected', {
        retryable: false,
        reconnectRequired: false,
        currentSessionActive: true
      });
    }
    if (activeSessionId) sessionByRuntime.delete(key);
    try {
      await initializeAdapter();
      const connection = await adapter.connect(Object.freeze({
        runtimeId: identity.runtimeInstanceId,
        documentToken: identity.documentToken,
        tabId: identity.tabId
      }));
      const disposition = String(connection?.disposition || 'UNAVAILABLE');
      if (!POSITIVE_DISPOSITIONS.has(disposition) || connection?.session == null) {
        if (connection?.session != null) {
          try { await adapter.disconnect(connection.session); } catch (_) {}
        }
        return fail(message, 'authority-positive-disposition-required', {
          disposition,
          retryable: true
        });
      }
      await adapter.disconnect(connection.session);
      return response(message, {
        disconnected: true,
        sessionId: message.sessionId,
        recoveredAfterWorkerRestart: true
      });
    } catch (error) {
      return fail(message, 'authority-disconnect-failed', {
        detail: errorMessage(error),
        retryable: true,
        reconnectRequired: true,
        sessionId: message.sessionId
      });
    }
  }

  async function subscribe(session, message) {
    if (session.unsubscribe) {
      return response(message, publicConnection(session, { subscribed: true, reused: true }));
    }
    const onUpdate = event => {
      if (!sessions.has(session.sessionId)) return;
      session.sequence += 1;
      Promise.resolve(publish({
        tabId: session.identity.tabId,
        expectedDocumentId: session.identity.expectedDocumentId,
        documentToken: session.identity.documentToken,
        runtimeInstanceId: session.identity.runtimeInstanceId,
        sessionId: session.sessionId,
        workerInstanceId,
        sequence: session.sequence,
        event: publicAuthorityValue(event)
      })).catch(() => {});
    };
    let subscription;
    try {
      subscription = await adapter.subscribe(onUpdate);
    } catch (error) {
      return fail(message, 'authority-subscribe-failed', { detail: errorMessage(error), retryable: true });
    }
    const unsubscribe = typeof subscription === 'function'
      ? subscription
      : subscription && typeof subscription.unsubscribe === 'function'
        ? () => subscription.unsubscribe()
        : null;
    if (!unsubscribe) return fail(message, 'authority-subscription-contract-invalid');
    session.unsubscribe = unsubscribe;
    return response(message, publicConnection(session, { subscribed: true }));
  }

  async function read(session, message) {
    try {
      const result = await adapter.read(session.adapterSession);
      return response(message, publicConnection(session, { result: publicAuthorityValue(result) }));
    } catch (error) {
      return fail(message, 'authority-read-failed', { detail: errorMessage(error), retryable: true });
    }
  }

  async function command(session, message) {
    if (hasPrivateAuthorityKey(message.command)) {
      return fail(message, 'authority-private-command-field-rejected');
    }
    if (!isPublicTimerCommandType(message.command.type)) {
      return fail(message, 'authority-command-not-public');
    }
    if (
      message.command.originRuntimeId !== undefined &&
      message.command.originRuntimeId !== session.identity.runtimeInstanceId
    ) {
      return fail(message, 'authority-command-origin-runtime-mismatch');
    }
    if (isOwnerOnlyTimerCommandType(message.command.type) && session.disposition !== 'OWNER') {
      return fail(message, 'authority-command-owner-required');
    }
    const authenticatedCommand = {
      ...message.command,
      originRuntimeId: session.identity.runtimeInstanceId
    };
    try {
      const result = await adapter.command(session.adapterSession, authenticatedCommand);
      if (Number.isSafeInteger(result?.revision) && result.revision >= 0) {
        session.connection = { ...session.connection, revision: result.revision };
      }
      return response(message, publicConnection(session, { result: publicAuthorityValue(result) }));
    } catch (error) {
      return fail(message, 'authority-command-failed', { detail: errorMessage(error), retryable: false });
    }
  }

  async function heartbeat(session, message) {
    let result;
    try {
      result = await adapter.heartbeat(session.adapterSession);
    } catch (error) {
      return fail(message, 'authority-heartbeat-failed', { detail: errorMessage(error), retryable: true });
    }
    const disposition = String(result?.disposition || session.disposition || 'UNAVAILABLE');
    if (!POSITIVE_DISPOSITIONS.has(disposition)) {
      return fail(message, 'authority-coordination-lost', {
        disposition,
        retryable: true,
        reconnectRequired: true
      });
    }
    session.disposition = disposition;
    if (result && typeof result === 'object') {
      session.connection = { ...session.connection, ...result, disposition };
    }
    return response(message, publicConnection(session));
  }

  async function disconnect(session, message) {
    if (session.disconnecting) return fail(message, 'authority-disconnect-in-progress', { retryable: true });
    session.disconnecting = true;
    try {
      if (session.unsubscribe) await session.unsubscribe();
      session.unsubscribe = null;
      await adapter.disconnect(session.adapterSession);
      sessions.delete(session.sessionId);
      sessionByRuntime.delete(runtimeKey(session.identity));
      return response(message, { disconnected: true, sessionId: session.sessionId });
    } catch (error) {
      return fail(message, 'authority-disconnect-failed', {
        detail: errorMessage(error),
        retryable: true,
        sessionId: session.sessionId
      });
    } finally {
      session.disconnecting = false;
    }
  }

  function serialize(key, task) {
    const prior = operationQueues.get(key) || Promise.resolve();
    const run = prior.then(task, task);
    const tail = run.then(() => undefined, () => undefined);
    operationQueues.set(key, tail);
    tail.then(() => {
      if (operationQueues.get(key) === tail) operationQueues.delete(key);
    });
    return run;
  }

  async function route(context, message) {
    const validation = validateAuthorityRequest(message);
    if (!validation.ok) return fail(message || {}, validation.reason);
    if (!isAvailable()) return fail(message, 'authority-adapter-unavailable', { retryable: true });
    const identityKey = runtimeKey(normalizeIdentity(context, message));
    const matchingSession = message.type === AUTHORITY_MESSAGES.DISCONNECT
      ? getSession(context, message)
      : null;
    const key = message.type === AUTHORITY_MESSAGES.CONNECT ||
      (message.type === AUTHORITY_MESSAGES.DISCONNECT && !matchingSession)
      ? identityKey
      : String(message.sessionId);
    return serialize(key, async () => {
      if (message.type === AUTHORITY_MESSAGES.CONNECT) return connect(context, message);
      const session = getSession(context, message);
      if (!session) {
        if (message.type === AUTHORITY_MESSAGES.DISCONNECT) {
          return recoverDisconnect(context, message);
        }
        return fail(message, 'authority-session-unknown', {
          retryable: true,
          reconnectRequired: true
        });
      }
      if (message.type === AUTHORITY_MESSAGES.SUBSCRIBE) return subscribe(session, message);
      if (message.type === AUTHORITY_MESSAGES.READ) return read(session, message);
      if (message.type === AUTHORITY_MESSAGES.COMMAND) return command(session, message);
      if (message.type === AUTHORITY_MESSAGES.HEARTBEAT) return heartbeat(session, message);
      if (message.type === AUTHORITY_MESSAGES.DISCONNECT) return disconnect(session, message);
      return fail(message, 'authority-message-type-invalid');
    });
  }

  function snapshot() {
    return {
      available: isAvailable(),
      workerInstanceId,
      sessionCount: sessions.size,
      sessions: [...sessions.values()].map(session => ({
        sessionId: session.sessionId,
        tabId: session.identity.tabId,
        documentToken: session.identity.documentToken,
        runtimeInstanceId: session.identity.runtimeInstanceId,
        disposition: session.disposition,
        subscribed: Boolean(session.unsubscribe),
        sequence: session.sequence
      }))
    };
  }

  return Object.freeze({
    workerInstanceId,
    installAdapter,
    isAvailable,
    route,
    snapshot
  });
}

module.exports = {
  POSITIVE_DISPOSITIONS,
  REQUIRED_ADAPTER_METHODS,
  publicAuthorityValue,
  hasPrivateAuthorityKey,
  validAdapter,
  createAuthorityRouter
};
