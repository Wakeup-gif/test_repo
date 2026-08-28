'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  BING_ORIGIN_PATTERN, CACHE_KEY, FRESH_CACHE_MAX_AGE_MS,
  metadataUrl, normalizeBingImageUrl, createWallpaperProvider
} = require('../../src/extension/wallpaper-provider');

test('UT-B5-CINE-013 provider policy sends only fixed public Bing parameters and rejects unapproved image URLs', async () => {
  const requests = [];
  const permissions = { async contains() { return true; }, async request() { return true; }, async remove() { return true; } };
  const storage = { async get() { return {}; }, async set() {} };
  const fetch = async url => {
    requests.push(String(url));
    if (requests.length === 1) return { ok: true, async json() { return { images: [{
      url: '/th?id=OHR.PublicWallpaper_UHD.jpg&rf=LaDigue_UHD.jpg&pid=hp', title: 'Public image', startdate: '20260828'
    }] }; } };
    return { ok: true, headers: { get(name) { return name === 'content-type' ? 'image/jpeg' : '4'; } },
      async arrayBuffer() { return Uint8Array.from([1, 2, 3, 4]).buffer; } };
  };
  const provider = createWallpaperProvider({ permissions, storage, fetch });
  const result = await provider.getWallpaper();
  assert.equal(result.ok, true); assert.equal(result.source, 'REMOTE');
  assert.equal(requests[0], metadataUrl());
  assert.equal(requests.every(url => !/squarecoil|project|timer|user|job/i.test(new URL(url).search)), true);
  assert.equal(normalizeBingImageUrl('https://evil.example/th?id=OHR.X_UHD.jpg'), null);
  assert.equal(normalizeBingImageUrl('https://www.bing.com/th?id=private-value'), null);
});

test('UT-B5-CINE-015 optional permission grant denial and removal are explicit and cache-clearing', async () => {
  const calls = [];
  const permissions = {
    async contains(details) { calls.push(['contains', details]); return false; },
    async request(details) { calls.push(['request', details]); return false; },
    async remove(details) { calls.push(['remove', details]); return true; }
  };
  const storage = { async get() { return {}; }, async set() {}, async remove(key) { calls.push(['cache-remove', key]); } };
  const provider = createWallpaperProvider({ permissions, storage, fetch: async () => { throw new Error('unexpected-fetch'); } });
  assert.deepEqual(await provider.requestPermission(), { ok: false, granted: false, reason: 'optional-origin-denied' });
  assert.deepEqual(await provider.removePermission(), { ok: true, removed: true, cacheCleared: true, reason: null });
  assert.deepEqual(calls, [
    ['request', { origins: [BING_ORIGIN_PATTERN] }],
    ['remove', { origins: [BING_ORIGIN_PATTERN] }],
    ['cache-remove', CACHE_KEY]
  ]);
});

test('UT-B5-CINE-016 concurrent consumers share one provider retrieval', async () => {
  let fetchCalls = 0;
  let releaseMetadata;
  let markMetadataStarted;
  const metadataStarted = new Promise(resolve => { markMetadataStarted = resolve; });
  const permissions = { async contains() { return true; }, async request() { return true; }, async remove() { return true; } };
  const storage = { async get() { return {}; }, async set() {}, async remove() {} };
  const fetch = async () => {
    fetchCalls += 1;
    if (fetchCalls === 1) {
      markMetadataStarted();
      await new Promise(resolve => { releaseMetadata = resolve; });
      return { ok: true, async json() { return { images: [{ url: '/th?id=OHR.Shared_UHD.jpg' }] }; } };
    }
    return { ok: true, headers: { get(name) { return name === 'content-type' ? 'image/jpeg' : '1'; } },
      async arrayBuffer() { return Uint8Array.from([1]).buffer; } };
  };
  const provider = createWallpaperProvider({ permissions, storage, fetch });
  const first = provider.getWallpaper();
  const second = provider.getWallpaper();
  await metadataStarted;
  releaseMetadata();
  const [a, b] = await Promise.all([first, second]);
  assert.deepEqual(a, b); assert.equal(a.source, 'REMOTE'); assert.equal(fetchCalls, 2);
});

test('UT-B5-CINE-017 fresh cache is reused without permission or network access', async () => {
  let permissionChecks = 0; let fetchCalls = 0;
  const now = 50_000_000;
  const cached = { schemaVersion: 1, fetchedAtMs: now - FRESH_CACHE_MAX_AGE_MS + 1,
    dataUrl: 'data:image/jpeg;base64,AQ==', title: 'Fresh cache', imageDate: '20260828' };
  const permissions = { async contains() { permissionChecks += 1; return false; }, async request() { return false; }, async remove() { return false; } };
  const storage = { async get() { return { [CACHE_KEY]: cached }; }, async set() {}, async remove() {} };
  const provider = createWallpaperProvider({ permissions, storage, now: () => now, fetch: async () => { fetchCalls += 1; } });
  const result = await provider.getWallpaper();
  assert.equal(result.ok, true); assert.equal(result.source, 'CACHE_FRESH');
  assert.equal(permissionChecks, 0); assert.equal(fetchCalls, 0);
});

test('UT-B5-CINE-018 invalid or future-dated cache is removed and fails closed', async () => {
  const removed = [];
  const now = 50_000_000;
  let value = { schemaVersion: 1, fetchedAtMs: now + 1, dataUrl: 'data:image/jpeg;base64,AQ==' };
  const permissions = { async contains() { return false; }, async request() { return false; }, async remove() { return false; } };
  const storage = { async get() { return value ? { [CACHE_KEY]: value } : {}; }, async set() {},
    async remove(key) { removed.push(key); value = null; } };
  const provider = createWallpaperProvider({ permissions, storage, now: () => now, fetch: async () => { throw new Error('unexpected-fetch'); } });
  const result = await provider.getWallpaper();
  assert.equal(result.ok, false); assert.equal(result.reason, 'optional-origin-permission-required');
  assert.deepEqual(removed, [CACHE_KEY]);
});
