'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  EVIDENCE_KINDS,
  NEGATIVE_KINDS,
  STATE_CERTAINTY,
  AUDITED_GENERAL_CONTEXTS,
  parseServerSnapshot,
  parseDomSnapshot
} = require('../../src/squarecoil/bridge-parser');

test('UT-B2-PARSER-001 action-7 project link yields a normalized Job Context', () => {
  const parsed = parseServerSnapshot(`
    <span id="clockin-remaining-time" data-time="01|02|03">
      <a href="/project.php?id=260702">260702 - Fabrication</a>
    </span>
  `, { observedAtMs: 1_000 });

  assert.equal(parsed.kind, EVIDENCE_KINDS.CONTEXT);
  assert.equal(parsed.polarity, 'POSITIVE');
  assert.equal(parsed.stateCertainty, STATE_CERTAINTY.VERIFIED_SERVER);
  assert.equal(parsed.provenance, 'CLOCK_PROJECT_LINK');
  assert.deepEqual(parsed.context, {
    contextId: 'job:260702',
    kind: 'job',
    projectId: '260702',
    label: '260702 - Fabrication',
    shortLabel: '260702',
    department: null
  });
});

test('UT-B2-PARSER-002 Production General id=0 uses the audited General identity and never job:0', () => {
  const parsed = parseServerSnapshot(`
    <span id="clockin-remaining-time">
      <a href="project.php?id=0">Production (General)</a>
    </span>
  `, { observedAtMs: 2_000 });

  assert.equal(parsed.kind, EVIDENCE_KINDS.CONTEXT);
  assert.equal(parsed.context.contextId, 'general:production-general');
  assert.equal(parsed.context.kind, 'general');
  assert.equal(parsed.context.projectId, undefined);
  assert.equal(AUDITED_GENERAL_CONTEXTS.length, 1);
  assert.equal(Object.isFrozen(AUDITED_GENERAL_CONTEXTS), true);
});

test('UT-B2-PARSER-003 empty-looking data-time cannot erase a positive Production General Context', () => {
  const parsed = parseDomSnapshot({
    remainingTimeHtml: '<a href="/project.php?id=0">Production (General)</a>',
    remainingTimeDataTime: '||||',
    clockInVisible: true,
    clockOutVisible: false
  }, { observedAtMs: 3_000 });

  assert.equal(parsed.kind, EVIDENCE_KINDS.CONTEXT);
  assert.equal(parsed.context.contextId, 'general:production-general');
  assert.equal(parsed.stateCertainty, STATE_CERTAINTY.OBSERVED_DOM);

  const emptyOnly = parseDomSnapshot({
    remainingTimeDataTime: '||'
  }, { observedAtMs: 3_001 });
  assert.equal(emptyOnly.kind, EVIDENCE_KINDS.STATE_UNKNOWN);
  assert.notEqual(emptyOnly.kind, EVIDENCE_KINDS.NEGATIVE_CANDIDATE);
});

test('UT-B2-PARSER-004 unknown General labels and generic clock phrases stay unclassified', () => {
  const unaudited = parseServerSnapshot(`
    <span id="clockin-remaining-time">
      <a href="/project.php?id=0">Warehouse General</a>
    </span>
  `, { observedAtMs: 4_000 });
  const generic = parseDomSnapshot({
    remainingTimeText: 'Change / Clock Out',
    clockOutVisible: true
  }, { observedAtMs: 4_001 });

  assert.equal(unaudited.kind, EVIDENCE_KINDS.STATE_UNKNOWN);
  assert.equal(unaudited.reason, 'UNSUPPORTED_GENERAL_LABEL');
  assert.equal(generic.kind, EVIDENCE_KINDS.STATE_UNKNOWN);
  assert.equal(generic.reason, 'UNSUPPORTED_CLOCK_LABEL');
});

test('UT-B2-PARSER-005 audited six-digit clock-label fallback is allowed only from clock snapshot fields', () => {
  const parsed = parseDomSnapshot({
    debugText: '260703 - Installation',
    bodyHtml: '<a href="/project.php?id=999999">Unrelated page project</a>'
  }, { observedAtMs: 5_000 });

  assert.equal(parsed.kind, EVIDENCE_KINDS.CONTEXT);
  assert.equal(parsed.context.contextId, 'job:260703');
  assert.equal(parsed.provenance, 'CLOCK_LABEL_SIX_DIGIT_FALLBACK');

  const bodyOnly = parseDomSnapshot({
    bodyHtml: '<a href="/project.php?id=999999">Unrelated page project</a>'
  }, { observedAtMs: 5_001 });
  assert.equal(bodyOnly.kind, EVIDENCE_KINDS.STATE_UNKNOWN);
});

test('UT-B2-PARSER-006 clock controls produce distinct negative candidates while malformed server data stays unknown', () => {
  const clockedOut = parseDomSnapshot({
    clockInVisible: true,
    clockOutVisible: false
  }, { observedAtMs: 6_000 });
  const noTrackable = parseDomSnapshot({
    clockInVisible: false,
    clockOutVisible: true
  }, { observedAtMs: 6_001 });
  const serverNoContext = parseServerSnapshot(
    '<span id="clockin-remaining-time"></span>',
    { observedAtMs: 6_002 }
  );
  const malformed = parseServerSnapshot('not clock header html', { observedAtMs: 6_003 });

  assert.equal(clockedOut.kind, EVIDENCE_KINDS.NEGATIVE_CANDIDATE);
  assert.equal(clockedOut.negativeKind, NEGATIVE_KINDS.CLOCKED_OUT);
  assert.equal(noTrackable.negativeKind, NEGATIVE_KINDS.NO_TRACKABLE_CONTEXT);
  assert.equal(serverNoContext.negativeKind, NEGATIVE_KINDS.NO_CONTEXT);
  assert.equal(malformed.kind, EVIDENCE_KINDS.STATE_UNKNOWN);
});
