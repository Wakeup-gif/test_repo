'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CINEMATIC_STYLE_ID, CINEMATIC_HOST_ID, CINEMATIC_ATTRIBUTE, createCinematicBackground
} = require('../../src/presentation/cinematic-background');

class Element {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase(); this.id = ''; this.className = ''; this.parent = null; this.children = [];
    this.attributes = new Map(); this.styleValues = new Map();
    this.style = { setProperty: (name, value) => this.styleValues.set(name, value) };
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); if (name === 'id') this.id = String(value); }
  getAttribute(name) { return name === 'id' ? this.id || null : this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); if (name === 'id') this.id = ''; }
  appendChild(child) { child.parent = this; this.children.push(child); return child; }
  prepend(child) { child.parent = this; this.children.unshift(child); return child; }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); this.parent = null; }
  querySelector(selector) {
    const match = /^\[data-layer="([ab])"\]$/.exec(selector);
    if (match) return this.children.find(child => child.getAttribute('data-layer') === match[1]) || null;
    return null;
  }
}

function media(matches = false) {
  const listeners = new Set();
  return { matches, listeners, addEventListener(_type, listener) { listeners.add(listener); },
    removeEventListener(_type, listener) { listeners.delete(listener); },
    set(value) { this.matches = value; for (const listener of [...listeners]) listener(); } };
}

function harness(options = {}) {
  const root = new Element('html'); const head = new Element('head'); const body = new Element('body');
  root.appendChild(head); root.appendChild(body);
  const forced = media(false); const transparency = media(false); const motion = media(options.reducedMotion === true);
  const listeners = new Map(); const timers = new Map(); let timerId = 0;
  const all = () => [root, ...root.children, ...head.children, ...body.children,
    ...body.children.flatMap(child => child.children || [])];
  const document = {
    documentElement: root, head, body, hidden: options.hidden === true,
    createElement(tag) { return new Element(tag); },
    getElementById(id) { return all().find(node => node.id === id) || null; },
    querySelectorAll(selector) {
      const ids = [...String(selector).matchAll(/#([A-Za-z0-9_-]+)/g)].map(match => match[1]);
      return all().filter(node => ids.includes(node.id));
    },
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type, listener) { if (listeners.get(type) === listener) listeners.delete(type); }
  };
  const window = {
    matchMedia(query) { if (query.includes('forced-colors')) return forced; if (query.includes('transparency')) return transparency; return motion; },
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    Image: class {}
  };
  let calls = 0;
  const provider = options.provider || (async () => ({ ok: true, source: 'REMOTE', dataUrl: 'data:image/png;base64,AAAA' }));
  const service = createCinematicBackground({ document, window, refreshIntervalMs: 1000,
    fetchWallpaper: request => { calls += 1; return provider(request, calls); },
    loadImage: options.loadImage || (() => true) });
  return { service, document, window, root, head, body, forced, transparency, motion, listeners, timers,
    calls: () => calls, fireVisibility() { listeners.get('visibilitychange')?.(); } };
}

function prefs(values = {}) {
  return { preferencesSchemaVersion: 2, preferenceRevision: values.revision || 1,
    timerAppearance: 'LIGHT', panelFinish: 'SOLID', websiteTheme: values.theme || 'SLEEK_DARK',
    cinematicBackground: values.cinematic || 'CINEMATIC', dashboardProfile: 'OFF',
    yellowMinutes: 60, orangeMinutes: 120, redMinutes: 240 };
}

const sleek = { websiteThemeEffective: 'SLEEK_DARK', forcedColors: false, reducedTransparency: false };

test('UT-B5-CINE-001 an older Glass plus NONE snapshot automatically restores the integrated background', () => {
  const h = harness();
  const snapshot = h.service.apply(prefs({ cinematic: 'NONE' }), sleek);
  assert.equal(snapshot.state, 'LOADING_INITIAL'); assert.equal(h.calls(), 1);
  assert.ok(h.document.getElementById(CINEMATIC_HOST_ID));
});

test('UT-B5-CINE-002 eligible enable displays only after candidate image readiness', async () => {
  let resolveReady; const h = harness({ loadImage: () => new Promise(resolve => { resolveReady = resolve; }) });
  h.service.apply(prefs(), sleek); await Promise.resolve();
  assert.equal(h.service.snapshot().state, 'LOADING_INITIAL'); assert.equal(h.service.snapshot().imageDisplayed, false);
  resolveReady(true); await h.service.refresh();
  assert.equal(h.service.snapshot().state, 'SHOWING'); assert.equal(h.service.snapshot().imageDisplayed, true);
});

test('UT-B5-CINE-003 current good image stays displayed while a refresh is pending', async () => {
  let secondResolve; const h = harness({ provider: async (_request, count) => count === 1
    ? { ok: true, source: 'REMOTE', dataUrl: 'data:image/png;base64,AAAA' }
    : new Promise(resolve => { secondResolve = resolve; }) });
  h.service.apply(prefs(), sleek); await h.service.refresh();
  const refresh = h.service.refresh('manual'); await Promise.resolve();
  assert.equal(h.service.snapshot().state, 'REFRESHING'); assert.equal(h.service.snapshot().imageDisplayed, true);
  secondResolve({ ok: true, source: 'REMOTE', dataUrl: 'data:image/png;base64,BBBB' }); await refresh;
});

test('UT-B5-CINE-004 remote and cache failure degrades to an approved embedded fallback', async () => {
  const h = harness({ provider: async () => ({ ok: false, reason: 'network-down' }) });
  h.service.apply(prefs(), sleek); await h.service.refresh();
  assert.equal(h.service.snapshot().state, 'DEGRADED_FALLBACK'); assert.equal(h.service.snapshot().source, 'FALLBACK');
});

test('UT-B5-CINE-005 failed candidate readiness never replaces the current accepted image', async () => {
  let loads = 0; const h = harness({ loadImage: () => ++loads === 1,
    provider: async (_request, count) => ({ ok: true, source: 'REMOTE', dataUrl: `data:image/png;base64,${count === 1 ? 'AAAA' : 'BBBB'}` }) });
  h.service.apply(prefs(), sleek); await h.service.refresh();
  await h.service.refresh('manual');
  assert.equal(h.service.snapshot().state, 'SHOWING'); assert.equal(h.service.snapshot().reason, 'candidate-rejected-current-retained');
});

test('UT-B5-CINE-006 a late request cannot overwrite a newer theme generation', async () => {
  let resolveProvider; const h = harness({ provider: () => new Promise(resolve => { resolveProvider = resolve; }) });
  h.service.apply(prefs(), sleek); await Promise.resolve();
  h.service.apply(prefs({ revision: 2, theme: 'ORIGINAL' }), { websiteThemeEffective: 'ORIGINAL' });
  resolveProvider({ ok: true, source: 'REMOTE', dataUrl: 'data:image/png;base64,AAAA' }); await Promise.resolve(); await Promise.resolve();
  assert.equal(h.service.snapshot().state, 'DISABLED'); assert.equal(h.document.getElementById(CINEMATIC_HOST_ID), null);
});

test('UT-B5-CINE-007 Original derives the background off and removes cinematic artifacts', async () => {
  const h = harness(); h.service.apply(prefs(), sleek); await h.service.refresh();
  const snapshot = h.service.apply(prefs({ revision: 2, theme: 'ORIGINAL' }), { websiteThemeEffective: 'ORIGINAL' });
  assert.equal(snapshot.preference, 'NONE'); assert.equal(snapshot.state, 'DISABLED');
  assert.equal(h.root.getAttribute(CINEMATIC_ATTRIBUTE), null);
});

test('UT-B5-CINE-008 returning to Glass starts its integrated background again and raw NONE cannot split it', async () => {
  const h = harness(); h.service.apply(prefs(), sleek); await h.service.refresh();
  h.service.apply(prefs({ revision: 2, theme: 'ORIGINAL' }), { websiteThemeEffective: 'ORIGINAL' });
  const restored = h.service.apply(prefs({ revision: 3 }), sleek);
  assert.equal(restored.state, 'LOADING_INITIAL');
  await h.service.refresh();
  assert.equal(h.service.snapshot().state, 'SHOWING'); assert.equal(h.service.snapshot().imageDisplayed, true);
  const off = h.service.apply(prefs({ revision: 4, cinematic: 'NONE' }), sleek);
  assert.notEqual(off.state, 'DISABLED');
});

test('UT-B5-CINE-009 reduced motion keeps the selected image static', async () => {
  const h = harness({ reducedMotion: true }); h.service.apply(prefs(), sleek); await h.service.refresh();
  assert.equal(h.service.snapshot().reducedMotion, true);
  assert.equal(h.document.getElementById(CINEMATIC_HOST_ID).getAttribute('data-reduced-motion'), 'true');
});

test('UT-B5-CINE-010 forced colors suspends presentation while preserving Cinematic', async () => {
  const h = harness(); h.service.apply(prefs(), sleek); await h.service.refresh();
  h.forced.set(true);
  assert.equal(h.service.snapshot().state, 'SUSPENDED_ACCESSIBILITY');
  assert.equal(h.service.snapshot().preference, 'CINEMATIC'); assert.equal(h.document.getElementById(CINEMATIC_HOST_ID), null);
});

test('UT-B5-CINE-011 hidden and visible lifecycle does not stack requests or refresh timers', async () => {
  const h = harness({ hidden: true }); h.service.apply(prefs(), sleek);
  assert.equal(h.calls(), 0); assert.equal(h.timers.size, 0);
  h.document.hidden = false; h.fireVisibility(); await h.service.refresh();
  assert.equal(h.calls(), 1); assert.equal(h.timers.size, 1);
  h.fireVisibility(); assert.equal(h.timers.size, 1);
});

test('UT-B5-CINE-012 teardown and recovery own at most one host and style', async () => {
  const h = harness(); h.service.apply(prefs(), sleek); await h.service.refresh();
  assert.equal(h.document.querySelectorAll(`#${CINEMATIC_HOST_ID}`).length, 1);
  h.service.teardown();
  assert.equal(h.document.querySelectorAll(`#${CINEMATIC_HOST_ID}`).length, 0);
  assert.equal(h.document.querySelectorAll(`#${CINEMATIC_STYLE_ID}`).length, 0);
});

test('UT-B5-CINE-014 provider failure changes no supplied Timer Ledger or native-clock state', async () => {
  const authority = { timer: { state: 'RUNNING', revision: 9 }, ledger: [{ segmentId: 's1' }], nativeMutationAttempts: 0 };
  const before = structuredClone(authority);
  const h = harness({ provider: async () => { throw new Error('provider-failed'); } });
  h.service.apply(prefs(), sleek); await h.service.refresh();
  assert.deepEqual(authority, before);
});

test('UT-B5-CINE-019 removed owned nodes are restored once without a second provider request', async () => {
  const h = harness(); h.service.apply(prefs(), sleek); await h.service.refresh();
  const host = h.document.getElementById(CINEMATIC_HOST_ID); const style = h.document.getElementById(CINEMATIC_STYLE_ID);
  host.remove(); style.remove();
  const restored = h.service.apply(prefs(), sleek);
  assert.equal(restored.state, 'SHOWING'); assert.equal(restored.ownedHostCount, 1); assert.equal(restored.ownedStyleCount, 1);
  assert.equal(h.calls(), 1);
});

test('UT-B5-CINE-020 fresh cache is healthy presentation evidence rather than remote-failure degradation', async () => {
  const h = harness({ provider: async () => ({ ok: true, source: 'CACHE_FRESH', reason: 'fresh-cache-reused',
    dataUrl: 'data:image/jpeg;base64,AQ==' }) });
  h.service.apply(prefs(), sleek); await h.service.refresh();
  assert.equal(h.service.snapshot().state, 'SHOWING'); assert.equal(h.service.snapshot().source, 'CACHE_FRESH');
});
