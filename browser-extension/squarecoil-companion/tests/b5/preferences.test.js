'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createEmptyDocument, validateDocument } = require('../../src/data/model');
const { createTimerReadModel } = require('../../src/timer/read-model');
const {
  DEFAULT_PREFERENCES,
  PREFERENCE_COMMANDS,
  normalizePreferenceSnapshot,
  validatePreferencePatch,
  applyPreferenceCommand,
  restoredPreferenceStorage
} = require('../../src/preferences/preferences');

const NOW = Date.parse('2026-08-28T15:00:00Z');

function documentFixture() {
  return createEmptyDocument({ nowMs: NOW, workdayZone: 'UTC', datasetId: 'b5-preference-fixture' });
}

test('UT-B5-PREF-001 first-install snapshot resolves the settled Light Solid Original and 60 120 240 defaults', () => {
  assert.deepEqual(normalizePreferenceSnapshot({}), {
    schemaVersion: 1,
    initialized: false,
    preferenceRevision: 0,
    ...DEFAULT_PREFERENCES
  });
});

test('UT-B5-PREF-002 initialization preserves valid v0.7 appearance and Timer Limit choices in one revision', () => {
  const document = documentFixture();
  const timerBefore = structuredClone(document.timer);
  const ledgerBefore = structuredClone(document.ledger);
  const result = applyPreferenceCommand(document, {
    type: PREFERENCE_COMMANDS.INITIALIZE,
    expectedPreferenceRevision: 0,
    legacyPreferences: {
      themePreference: 'auto',
      timerSurface: 'glass',
      squareCoilTheme: 'dark',
      settings: { yellow: 15, orange: 45, red: 90 }
    }
  });
  assert.equal(result.preferences.preferenceRevision, 1);
  assert.equal(result.preferences.timerAppearance, 'AUTO');
  assert.equal(result.preferences.panelFinish, 'GLASS');
  assert.equal(result.preferences.websiteTheme, 'SLEEK_DARK');
  assert.deepEqual([result.preferences.yellowMinutes, result.preferences.orangeMinutes, result.preferences.redMinutes], [15, 45, 90]);
  assert.deepEqual(document.timer, timerBefore);
  assert.deepEqual(document.ledger, ledgerBefore);
  assert.equal(validateDocument(document), true);
});

test('UT-B5-PREF-003 immediate appearance commits increment one preference revision without timing mutation', () => {
  const document = documentFixture();
  applyPreferenceCommand(document, { type: PREFERENCE_COMMANDS.INITIALIZE, expectedPreferenceRevision: 0, legacyPreferences: {} });
  const before = { timer: structuredClone(document.timer), ledger: structuredClone(document.ledger) };
  const result = applyPreferenceCommand(document, {
    type: PREFERENCE_COMMANDS.COMMIT,
    expectedPreferenceRevision: 1,
    patch: { timerAppearance: 'DARK' }
  });
  assert.equal(result.preferences.preferenceRevision, 2);
  assert.equal(result.preferences.timerAppearance, 'DARK');
  assert.deepEqual(document.timer, before.timer);
  assert.deepEqual(document.ledger, before.ledger);
});

test('UT-B5-PREF-004 stale multi-field limits draft fails closed without replacing committed values', () => {
  const document = documentFixture();
  applyPreferenceCommand(document, { type: PREFERENCE_COMMANDS.INITIALIZE, expectedPreferenceRevision: 0, legacyPreferences: {} });
  applyPreferenceCommand(document, { type: PREFERENCE_COMMANDS.COMMIT, expectedPreferenceRevision: 1,
    patch: { timerAppearance: 'DARK' } });
  const before = structuredClone(document.dataSafety.preferences);
  assert.throws(() => applyPreferenceCommand(document, { type: PREFERENCE_COMMANDS.COMMIT, expectedPreferenceRevision: 1,
    patch: { yellowMinutes: 30, orangeMinutes: 60, redMinutes: 120 } }), /preference-revision-conflict/);
  assert.deepEqual(document.dataSafety.preferences, before);
});

test('UT-B5-PREF-005 limits require one ordered integer batch', () => {
  assert.throws(() => validatePreferencePatch({ yellowMinutes: 30 }), /preference-limits-batch-required/);
  assert.throws(() => validatePreferencePatch({ yellowMinutes: 60, orangeMinutes: 30, redMinutes: 90 }), /preference-limits-order-invalid/);
  assert.throws(() => validatePreferencePatch({ yellowMinutes: 0, orangeMinutes: 30, redMinutes: 90 }), /preference-limits-order-invalid/);
  assert.deepEqual(validatePreferencePatch({ yellowMinutes: '30', orangeMinutes: '60', redMinutes: '90' }),
    { yellowMinutes: 30, orangeMinutes: 60, redMinutes: 90 });
});

test('UT-B5-PREF-006 restored preference batch advances from the current revision and never adopts a stale revision', () => {
  const current = { preferencesSchemaVersion: 1, preferenceRevision: 8, timerAppearance: 'LIGHT', panelFinish: 'SOLID',
    websiteTheme: 'ORIGINAL', yellowMinutes: 60, orangeMinutes: 120, redMinutes: 240 };
  const incoming = { preferencesSchemaVersion: 1, preferenceRevision: 2, timerAppearance: 'DARK', panelFinish: 'GLASS',
    websiteTheme: 'SLEEK_DARK', yellowMinutes: 10, orangeMinutes: 20, redMinutes: 30 };
  const restored = restoredPreferenceStorage(current, incoming);
  assert.equal(restored.preferenceRevision, 9);
  assert.deepEqual([restored.timerAppearance, restored.panelFinish, restored.websiteTheme], ['DARK', 'GLASS', 'SLEEK_DARK']);
  assert.deepEqual([restored.yellowMinutes, restored.orangeMinutes, restored.redMinutes], [10, 20, 30]);
});

test('UT-B5-PREF-007 invalid restored values fall back to the current compatible preference snapshot', () => {
  const current = { preferencesSchemaVersion: 1, preferenceRevision: 3, timerAppearance: 'AUTO', panelFinish: 'GLASS',
    websiteTheme: 'REFINED_LIGHT', yellowMinutes: 20, orangeMinutes: 40, redMinutes: 80 };
  const restored = restoredPreferenceStorage(current, { timerAppearance: 'invalid', yellowMinutes: 100, orangeMinutes: 10, redMinutes: 5 });
  assert.equal(restored.preferenceRevision, 4);
  assert.deepEqual(restored, { ...current, preferenceRevision: 4 });
});

test('UT-B5-PREF-008 canonical threshold presentation reads the committed preference revision and exact Today value', () => {
  const document = documentFixture();
  document.contexts['job:501'] = { contextId: 'job:501', kind: 'job', projectId: '501', currentLabel: 'Job 501', shortLabel: '501',
    aliases: [], createdAtMs: NOW - 1000, lastSeenAtMs: NOW, archivedAtMs: null, workspaceMembership: 'RECENT', legacyUnattributedMs: 0 };
  document.dataSafety.preferences = { preferencesSchemaVersion: 1, preferenceRevision: 6, timerAppearance: 'LIGHT', panelFinish: 'SOLID',
    websiteTheme: 'ORIGINAL', yellowMinutes: 1, orangeMinutes: 2, redMinutes: 3 };
  document.ledger.push({ segmentId: 'segment-b5-pref-008', sessionId: 'session-b5-pref-008', cycleId: 'cycle-b5-pref-008',
    contextId: 'job:501', startAtMs: NOW - 60_000, endAtMs: NOW, durationMs: 60_000, localDate: '2026-08-28', workdayZone: 'UTC' });
  const snapshot = createTimerReadModel(() => document, { now: () => NOW }).snapshot({ atMs: NOW });
  assert.equal(snapshot.sourcePreferenceRevision, 6);
  assert.equal(snapshot.contextRows[0].thresholdLevel, 'YELLOW');
});

test('UT-B5-PREF-009 unsupported preference fields and duplicate initialization fail closed', () => {
  const document = documentFixture();
  applyPreferenceCommand(document, { type: PREFERENCE_COMMANDS.INITIALIZE, expectedPreferenceRevision: 0, legacyPreferences: {} });
  assert.throws(() => applyPreferenceCommand(document, { type: PREFERENCE_COMMANDS.INITIALIZE,
    expectedPreferenceRevision: 1, legacyPreferences: {} }), /preferences-already-initialized/);
  assert.throws(() => validatePreferencePatch({ secretFeature: true }), /preference-patch-field-unsupported/);
});
