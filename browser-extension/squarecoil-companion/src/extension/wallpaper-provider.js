'use strict';

const BING_ORIGIN_PATTERN = 'https://www.bing.com/*';
const BING_ORIGIN = 'https://www.bing.com';
const CACHE_KEY = 'squarecoilCompanionB5BWallpaperCacheV1';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const FRESH_CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const MAX_IMAGE_BYTES = 4_000_000;
const REQUEST_TIMEOUT_MS = 10_000;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function metadataUrl() {
  return `${BING_ORIGIN}/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US&uhd=1&uhdwidth=3840&uhdheight=2160`;
}

function normalizeBingImageUrl(raw) {
  let parsed;
  try { parsed = new URL(String(raw || ''), `${BING_ORIGIN}/`); } catch (_) { return null; }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'www.bing.com' || parsed.port) return null;
  if (parsed.pathname !== '/th') return null;
  const allowed = new Set(['id', 'rf', 'pid']);
  if ([...parsed.searchParams.keys()].some(key => !allowed.has(key))) return null;
  if (!/^OHR\.[A-Za-z0-9_.-]+(?:_UHD\.jpg)?$/i.test(parsed.searchParams.get('id') || '')) return null;
  return parsed.href;
}

function cachedWallpaper(raw, nowMs) {
  const item = raw?.[CACHE_KEY];
  if (!item || item.schemaVersion !== 1 || !Number.isSafeInteger(item.fetchedAtMs) ||
      item.fetchedAtMs > nowMs || nowMs - item.fetchedAtMs > CACHE_MAX_AGE_MS) return null;
  if (!/^data:image\/(?:jpeg|png|webp);base64,/i.test(String(item.dataUrl || '')) || String(item.dataUrl).length > 6_000_000) return null;
  return item;
}

function bytesToDataUrl(bytes, contentType) {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, Math.min(offset + 0x8000, bytes.length)));
  }
  return `data:${contentType};base64,${btoa(binary)}`;
}

function createWallpaperProvider(options = {}) {
  const permissions = options.permissions;
  const storage = options.storage;
  const fetchFn = options.fetch || globalThis.fetch;
  const now = typeof options.now === 'function' ? options.now : () => Date.now();
  if (!permissions || !storage || typeof fetchFn !== 'function') throw new Error('wallpaper-provider-environment-required');
  let inFlight = null;

  async function hasPermission() {
    try { return await permissions.contains({ origins: [BING_ORIGIN_PATTERN] }); } catch (_) { return false; }
  }

  async function requestPermission() {
    try {
      const granted = await permissions.request({ origins: [BING_ORIGIN_PATTERN] });
      return Object.freeze({ ok: granted === true, granted: granted === true,
        reason: granted === true ? 'optional-origin-granted' : 'optional-origin-denied' });
    } catch (error) {
      return Object.freeze({ ok: false, granted: false, reason: String(error?.message || error) });
    }
  }

  async function removePermission() {
    let removed = false;
    let reason = null;
    try {
      removed = await permissions.remove({ origins: [BING_ORIGIN_PATTERN] });
    } catch (error) { reason = String(error?.message || error); }
    let cacheCleared = false;
    try { await storage.remove(CACHE_KEY); cacheCleared = true; } catch (_) {}
    return Object.freeze({ ok: reason === null, removed: removed === true, cacheCleared, reason });
  }

  async function readCache(maxAgeMs = CACHE_MAX_AGE_MS) {
    try {
      const raw = await storage.get(CACHE_KEY);
      const cached = cachedWallpaper(raw, now());
      if (!cached) {
        if (raw?.[CACHE_KEY] !== undefined) {
          try { await storage.remove(CACHE_KEY); } catch (_) {}
        }
        return null;
      }
      return now() - cached.fetchedAtMs <= maxAgeMs ? cached : null;
    } catch (_) { return null; }
  }

  async function cacheFallback(reason) {
    const cached = await readCache();
    if (cached) return Object.freeze({ ok: true, source: 'CACHE', dataUrl: cached.dataUrl,
      title: cached.title || 'Cached Bing wallpaper', imageDate: cached.imageDate || '', reason });
    return Object.freeze({ ok: false, source: null, reason });
  }

  async function fetchWithTimeout(url, init = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try { return await fetchFn(url, { ...init, signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' }); }
    finally { clearTimeout(timer); }
  }

  async function retrieveWallpaper() {
    const freshCache = await readCache(FRESH_CACHE_MAX_AGE_MS);
    if (freshCache) return Object.freeze({ ok: true, source: 'CACHE_FRESH', dataUrl: freshCache.dataUrl,
      title: freshCache.title || 'Cached Bing wallpaper', imageDate: freshCache.imageDate || '', reason: 'fresh-cache-reused' });
    if (!await hasPermission()) return cacheFallback('optional-origin-permission-required');
    try {
      const metadataResponse = await fetchWithTimeout(metadataUrl(), { headers: { Accept: 'application/json' } });
      if (!metadataResponse?.ok) return cacheFallback(`metadata-http-${metadataResponse?.status || 0}`);
      const payload = await metadataResponse.json();
      const image = Array.isArray(payload?.images) ? payload.images[0] : null;
      const imageUrl = normalizeBingImageUrl(image?.url);
      if (!imageUrl) return cacheFallback('metadata-image-policy-rejected');
      const imageResponse = await fetchWithTimeout(imageUrl, { headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg' } });
      if (!imageResponse?.ok) return cacheFallback(`image-http-${imageResponse?.status || 0}`);
      const contentType = String(imageResponse.headers?.get?.('content-type') || '').split(';')[0].toLowerCase();
      if (!ACCEPTED_IMAGE_TYPES.has(contentType)) return cacheFallback('image-content-type-rejected');
      const declaredLength = Number(imageResponse.headers?.get?.('content-length') || 0);
      if (declaredLength > MAX_IMAGE_BYTES) return cacheFallback('image-size-rejected');
      const bytes = new Uint8Array(await imageResponse.arrayBuffer());
      if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) return cacheFallback('image-size-rejected');
      const dataUrl = bytesToDataUrl(bytes, contentType);
      const cache = { schemaVersion: 1, fetchedAtMs: now(), dataUrl,
        title: String(image?.title || image?.copyright || 'Bing wallpaper').slice(0, 300),
        imageDate: /^\d{8}$/.test(String(image?.startdate || '')) ? String(image.startdate) : '' };
      try { await storage.set({ [CACHE_KEY]: cache }); } catch (_) {}
      return Object.freeze({ ok: true, source: 'REMOTE', dataUrl: cache.dataUrl, title: cache.title,
        imageDate: cache.imageDate, reason: 'fresh-bing-image' });
    } catch (error) { return cacheFallback(`provider-failed:${String(error?.name || error?.message || error)}`); }
  }

  function getWallpaper() {
    if (inFlight) return inFlight;
    inFlight = retrieveWallpaper().finally(() => { inFlight = null; });
    return inFlight;
  }

  return Object.freeze({ hasPermission, requestPermission, removePermission, getWallpaper });
}

module.exports = { BING_ORIGIN_PATTERN, BING_ORIGIN, CACHE_KEY, CACHE_MAX_AGE_MS, FRESH_CACHE_MAX_AGE_MS, MAX_IMAGE_BYTES,
  metadataUrl, normalizeBingImageUrl, cachedWallpaper, bytesToDataUrl, createWallpaperProvider };
