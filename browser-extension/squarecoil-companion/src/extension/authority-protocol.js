'use strict';

const AUTHORITY_PROTOCOL_VERSION = 1;
const AUTHORITY_MESSAGE_PREFIX = 'SC_COMPANION_AUTHORITY_';
const KERNEL_ONLY_DISPOSITION = 'KERNEL_CONNECTED_B2_1';

const AUTHORITY_MESSAGES = Object.freeze({
  CONNECT: `${AUTHORITY_MESSAGE_PREFIX}CONNECT`,
  READ: `${AUTHORITY_MESSAGE_PREFIX}READ`,
  COMMAND: `${AUTHORITY_MESSAGE_PREFIX}COMMAND`,
  SUBSCRIBE: `${AUTHORITY_MESSAGE_PREFIX}SUBSCRIBE`,
  HEARTBEAT: `${AUTHORITY_MESSAGE_PREFIX}HEARTBEAT`,
  FORWARD_NATIVE_EVIDENCE: `${AUTHORITY_MESSAGE_PREFIX}FORWARD_NATIVE_EVIDENCE`,
  DISCONNECT: `${AUTHORITY_MESSAGE_PREFIX}DISCONNECT`,
  UPDATE: `${AUTHORITY_MESSAGE_PREFIX}UPDATE`
});

const AUTHORITY_CONTROL_MESSAGES = Object.freeze({
  PREPARE_DISABLE: `${AUTHORITY_MESSAGE_PREFIX}PREPARE_DISABLE`
});

const AUTHORITY_UPDATE_ACK = `${AUTHORITY_MESSAGE_PREFIX}UPDATE_ACK`;

const REQUEST_TYPES = new Set([
  AUTHORITY_MESSAGES.CONNECT,
  AUTHORITY_MESSAGES.READ,
  AUTHORITY_MESSAGES.COMMAND,
  AUTHORITY_MESSAGES.SUBSCRIBE,
  AUTHORITY_MESSAGES.HEARTBEAT,
  AUTHORITY_MESSAGES.FORWARD_NATIVE_EVIDENCE,
  AUTHORITY_MESSAGES.DISCONNECT
]);

function isConcreteId(value) {
  const normalized = String(value || '').trim();
  return normalized.length >= 8 && normalized.length <= 200;
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  // Extension messages can cross isolated-world/worker realms. Their plain
  // object prototype is not reference-equal to this realm's Object.prototype,
  // but that prototype is still the top object prototype (its parent is null).
  return prototype === null || Object.getPrototypeOf(prototype) === null;
}

function isAuthorityMessageType(value) {
  return REQUEST_TYPES.has(value);
}

function createAuthorityUpdateAcknowledgment(message) {
  return Object.freeze({
    ok: true,
    type: AUTHORITY_UPDATE_ACK,
    protocolVersion: AUTHORITY_PROTOCOL_VERSION,
    sessionId: message.sessionId,
    workerInstanceId: message.workerInstanceId,
    sequence: message.sequence
  });
}

function isAuthorityUpdateAcknowledgment(value, message) {
  if (!isPlainObject(value) || !isPlainObject(message)) return false;
  const expected = createAuthorityUpdateAcknowledgment(message);
  const keys = Object.keys(value).sort();
  const expectedKeys = Object.keys(expected).sort();
  return keys.length === expectedKeys.length &&
    keys.every((key, index) => key === expectedKeys[index]) &&
    expectedKeys.every(key => value[key] === expected[key]);
}

function validateAuthorityRequest(message) {
  if (!isPlainObject(message)) return { ok: false, reason: 'authority-request-invalid' };
  if (message.protocolVersion !== AUTHORITY_PROTOCOL_VERSION) {
    return { ok: false, reason: 'authority-protocol-version-mismatch' };
  }
  if (!isAuthorityMessageType(message.type)) {
    return { ok: false, reason: 'authority-message-type-invalid' };
  }
  if (!isConcreteId(message.requestId)) {
    return { ok: false, reason: 'authority-request-id-invalid' };
  }
  if (!isConcreteId(message.runtimeInstanceId)) {
    return { ok: false, reason: 'authority-runtime-id-invalid' };
  }
  if (message.type !== AUTHORITY_MESSAGES.CONNECT && !isConcreteId(message.sessionId)) {
    return { ok: false, reason: 'authority-session-id-invalid' };
  }
  if (message.type === AUTHORITY_MESSAGES.COMMAND) {
    if (!isPlainObject(message.command)) return { ok: false, reason: 'authority-command-invalid' };
    if (!isConcreteId(message.command.commandId)) {
      return { ok: false, reason: 'authority-command-id-invalid' };
    }
    if (!String(message.command.type || '').trim()) {
      return { ok: false, reason: 'authority-command-type-invalid' };
    }
    if (!Number.isSafeInteger(message.command.expectedRevision) || message.command.expectedRevision < 0) {
      return { ok: false, reason: 'authority-command-expected-revision-invalid' };
    }
    if (
      message.command.originRuntimeId !== undefined &&
      !isConcreteId(message.command.originRuntimeId)
    ) {
      return { ok: false, reason: 'authority-command-origin-runtime-invalid' };
    }
  }
  if (message.type === AUTHORITY_MESSAGES.FORWARD_NATIVE_EVIDENCE && !isPlainObject(message.evidence)) {
    return { ok: false, reason: 'authority-native-evidence-invalid' };
  }
  return { ok: true };
}

module.exports = {
  AUTHORITY_PROTOCOL_VERSION,
  AUTHORITY_MESSAGES,
  AUTHORITY_CONTROL_MESSAGES,
  AUTHORITY_UPDATE_ACK,
  KERNEL_ONLY_DISPOSITION,
  isConcreteId,
  isPlainObject,
  isAuthorityMessageType,
  createAuthorityUpdateAcknowledgment,
  isAuthorityUpdateAcknowledgment,
  validateAuthorityRequest
};
