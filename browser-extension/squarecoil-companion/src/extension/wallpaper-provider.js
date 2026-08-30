'use strict';

const BING_ORIGIN_PATTERN = 'https://www.bing.com/*';
const BING_ORIGIN = 'https://www.bing.com';
const CACHE_KEY = 'squarecoilCompanionB5BWallpaperCacheV1';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const ROTATION_INTERVAL_MS = 30 * 60 * 1000;
const FRESH_CACHE_MAX_AGE_MS = ROTATION_INTERVAL_MS;
const MAX_MARKET_DATE_LAG_DAYS = 1;
const MAX_METADATA_BYTES = 256_000;
const MAX_IMAGE_BYTES = 4_000_000;
const REQUEST_TIMEOUT_MS = 10_000;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const BING_MARKETS = Object.freeze([
  'en-US', 'en-GB', 'en-CA', 'en-IN', 'de-DE', 'fr-FR',
  'fr-CA', 'es-ES', 'it-IT', 'ja-JP', 'pt-BR', 'zh-CN'
]);

function metadataUrl(market = 'en-US') {
  const acceptedMarket = BING_MARKETS.includes(market) ? market : 'en-US';
  return `${BING_ORIGIN}/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=${encodeURIComponent(acceptedMarket)}&uhd=1&uhdwidth=3840&uhdheight=2160`;
}

function normalizeBingImageUrl(raw) {
  let parsed;
  try { parsed = new URL(String(raw || ''), `${BING_ORIGIN}/`); } catch (_) { return null; }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'www.bing.com' || parsed.port) return null;
  if (parsed.pathname !== '/th') return null;
  const allowed = new Set(['id', 'rf', 'pid', 'w', 'h', 'rs', 'c']);
  const keys = [...parsed.searchParams.keys()];
  if (keys.some(key => !allowed.has(key)) || new Set(keys).size !== keys.length) return null;
  const id = parsed.searchParams.get('id') || '';
  if (!/^OHR\.[A-Za-z0-9_.-]+(?:_UHD\.jpg)?$/i.test(id)) return null;
  const rf = parsed.searchParams.get('rf');
  if (rf !== null && !/^[A-Za-z0-9_.-]{1,160}\.jpg$/i.test(rf)) return null;
  const pid = parsed.searchParams.get('pid');
  if (pid !== null && pid !== 'hp') return null;
  const fixedKeys = ['w', 'h', 'rs', 'c'];
  const fixedValues = { w: '3840', h: '2160', rs: '1', c: '4' };
  const fixedCount = fixedKeys.filter(key => parsed.searchParams.has(key)).length;
  if (fixedCount !== 0 && (fixedCount !== fixedKeys.length || fixedKeys.some(key => parsed.searchParams.get(key) !== fixedValues[key]))) {
    return null;
  }
  const canonical = new URL('/th', BING_ORIGIN);
  for (const key of ['id', 'rf', 'pid', ...fixedKeys]) {
    const value = parsed.searchParams.get(key);
    if (value !== null) canonical.searchParams.set(key, value);
  }
  return canonical.href;
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
  const requestTimeoutMs = Number.isSafeInteger(options.requestTimeoutMs) && options.requestTimeoutMs > 0
    ? options.requestTimeoutMs : REQUEST_TIMEOUT_MS;
  const markets = Array.isArray(options.markets) && options.markets.length
    ? Object.freeze(options.markets.filter(market => BING_MARKETS.includes(market)))
    : BING_MARKETS;
  if (!permissions || !storage || typeof fetchFn !== 'function') throw new Error('wallpaper-provider-environment-required');
  let generation = 0;
  let inFlight = null;
  let permissionRemovalInProgress = false;
  const activeControllers = new Set();

  async function hasPermission() {
    if (permissionRemovalInProgress) return false;
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
    permissionRemovalInProgress = true;
    generation += 1;
    for (const controller of activeControllers) controller.abort();
    inFlight = null;
    let removed = false;
    let reason = null;
    try {
      removed = await permissions.remove({ origins: [BING_ORIGIN_PATTERN] });
    } catch (error) { reason = String(error?.message || error); }
    let cacheCleared = false;
    try { await storage.remove(CACHE_KEY); cacheCleared = true; } catch (_) {}
    permissionRemovalInProgress = false;
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

  async function cacheFallback(reason, requestGeneration = generation) {
    if (permissionRemovalInProgress || requestGeneration !== generation) return invalidatedResult();
    const cached = await readCache();
    if (permissionRemovalInProgress || requestGeneration !== generation) return invalidatedResult();
    if (cached) return Object.freeze({ ok: true, source: 'CACHE', dataUrl: cached.dataUrl,
      title: cached.title || 'Cached Bing wallpaper', imageDate: cached.imageDate || '', reason });
    return Object.freeze({ ok: false, source: null, reason });
  }

  async function readBoundedBody(response, maxBytes) {
    const rawLength = response.headers?.get?.('content-length');
    if (rawLength !== null && rawLength !== undefined && rawLength !== '') {
      if (!/^\d+$/.test(String(rawLength)) || Number(rawLength) > maxBytes) throw new Error('body-size-rejected');
    }
    const reader = response.body?.getReader?.();
    if (reader) {
      const chunks = [];
      let total = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = value instanceof Uint8Array ? value : new Uint8Array(value || []);
          total += chunk.byteLength;
          if (total > maxBytes) throw new Error('body-size-rejected');
          if (chunk.byteLength) chunks.push(chunk);
        }
      } catch (error) {
        try { await reader.cancel?.(); } catch (_) {}
        throw error;
      }
      const bytes = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      return bytes;
    }
    let buffer;
    if (typeof response.arrayBuffer === 'function') buffer = await response.arrayBuffer();
    else if (typeof response.text === 'function') buffer = new TextEncoder().encode(await response.text()).buffer;
    else if (typeof response.json === 'function') buffer = new TextEncoder().encode(JSON.stringify(await response.json())).buffer;
    else throw new Error('response-body-unavailable');
    const bytes = new Uint8Array(buffer);
    if (bytes.byteLength > maxBytes) throw new Error('body-size-rejected');
    return bytes;
  }

  async function fetchBounded(url, init, maxBytes) {
    const controller = new AbortController();
    activeControllers.add(controller);
    const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
    try {
      const requestedUrl = new URL(url).href;
      const response = await fetchFn(requestedUrl, { ...init, signal: controller.signal, credentials: 'omit',
        referrerPolicy: 'no-referrer', cache: 'no-store', redirect: 'error' });
      let finalUrl = null;
      try { finalUrl = new URL(String(response?.url || '')).href; } catch (_) {}
      if (!response || response.redirected === true || finalUrl !== requestedUrl) throw new Error('response-origin-policy-rejected');
      const bytes = await readBoundedBody(response, maxBytes);
      return { response, bytes };
    } finally {
      clearTimeout(timer);
      activeControllers.delete(controller);
    }
  }

  function invalidatedResult(reason = 'provider-invalidated') {
    return Object.freeze({ ok: false, source: null, reason });
  }

  async function retrieveWallpaper(requestGeneration) {
    if (permissionRemovalInProgress || requestGeneration !== generation) return invalidatedResult();
    const freshCache = await readCache(FRESH_CACHE_MAX_AGE_MS);
    if (permissionRemovalInProgress || requestGeneration !== generation) return invalidatedResult();
    if (freshCache) return Object.freeze({ ok: true, source: 'CACHE_FRESH', dataUrl: freshCache.dataUrl,
      title: freshCache.title || 'Cached Bing wallpaper', imageDate: freshCache.imageDate || '', reason: 'fresh-cache-reused' });
    if (!await hasPermission()) return cacheFallback('optional-origin-permission-required', requestGeneration);
    try {
      const metadataResults = await Promise.allSettled(markets.map(async market => {
        const { response: metadataResponse, bytes } = await fetchBounded(metadataUrl(market),
          { headers: { Accept: 'application/json' } }, MAX_METADATA_BYTES);
        if (!metadataResponse?.ok) throw new Error(`metadata-http-${metadataResponse?.status || 0}`);
        const metadataType = String(metadataResponse.headers?.get?.('content-type') || '').split(';')[0].toLowerCase();
        if (metadataType && metadataType !== 'application/json') throw new Error('metadata-content-type-rejected');
        let payload;
        try { payload = JSON.parse(new TextDecoder().decode(bytes)); } catch (_) { throw new Error('metadata-json-invalid'); }
        const image = Array.isArray(payload?.images) ? payload.images[0] : null;
        const imageUrl = normalizeBingImageUrl(image?.url);
        if (!imageUrl) throw new Error('metadata-image-policy-rejected');
        return { ...image, imageUrl, market };
      }));
      const candidates = [];
      const seenUrls = new Set();
      for (const result of metadataResults) {
        if (result.status !== 'fulfilled' || seenUrls.has(result.value.imageUrl)) continue;
        seenUrls.add(result.value.imageUrl);
        candidates.push(result.value);
      }
      if (!candidates.length) return cacheFallback('metadata-no-accepted-images', requestGeneration);
      const dated = candidates.filter(candidate => /^\d{8}$/.test(String(candidate.startdate || '')));
      const newestDate = dated.reduce((latest, candidate) => String(candidate.startdate) > latest ? String(candidate.startdate) : latest, '');
      const newestTime = newestDate ? Date.UTC(Number(newestDate.slice(0, 4)), Number(newestDate.slice(4, 6)) - 1,
        Number(newestDate.slice(6, 8))) : null;
      const freshCandidates = newestTime === null ? candidates : candidates.filter(candidate => {
        if (!/^\d{8}$/.test(String(candidate.startdate || ''))) return false;
        const value = String(candidate.startdate);
        const candidateTime = Date.UTC(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6, 8)));
        return newestTime - candidateTime <= MAX_MARKET_DATE_LAG_DAYS * 86400000;
      });
      const pool = freshCandidates.length ? freshCandidates : candidates;
      const image = pool[Math.floor(now() / ROTATION_INTERVAL_MS) % pool.length];
      const imageUrl = normalizeBingImageUrl(image?.url);
      if (!imageUrl) return cacheFallback('metadata-image-policy-rejected', requestGeneration);
      const { response: imageResponse, bytes } = await fetchBounded(imageUrl,
        { headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg' } }, MAX_IMAGE_BYTES);
      if (!imageResponse?.ok) return cacheFallback(`image-http-${imageResponse?.status || 0}`, requestGeneration);
      const contentType = String(imageResponse.headers?.get?.('content-type') || '').split(';')[0].toLowerCase();
      if (!ACCEPTED_IMAGE_TYPES.has(contentType)) return cacheFallback('image-content-type-rejected', requestGeneration);
      if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) return cacheFallback('image-size-rejected', requestGeneration);
      const dataUrl = bytesToDataUrl(bytes, contentType);
      const cache = { schemaVersion: 1, fetchedAtMs: now(), dataUrl,
        title: String(image?.title || image?.copyright || 'Bing wallpaper').slice(0, 300),
        imageDate: /^\d{8}$/.test(String(image?.startdate || '')) ? String(image.startdate) : '',
        market: String(image.market || '').slice(0, 10) };
      if (permissionRemovalInProgress || requestGeneration !== generation || !await hasPermission()) {
        return invalidatedResult('optional-origin-permission-required');
      }
      try { await storage.set({ [CACHE_KEY]: cache }); } catch (_) {}
      if (permissionRemovalInProgress || requestGeneration !== generation || !await hasPermission()) {
        try { await storage.remove(CACHE_KEY); } catch (_) {}
        return invalidatedResult('optional-origin-permission-required');
      }
      return Object.freeze({ ok: true, source: 'REMOTE', dataUrl: cache.dataUrl, title: cache.title,
        imageDate: cache.imageDate, reason: 'fresh-bing-image' });
    } catch (error) {
      if (permissionRemovalInProgress || requestGeneration !== generation) return invalidatedResult();
      return cacheFallback(`provider-failed:${String(error?.message || error?.name || error)}`, requestGeneration);
    }
  }

  function getWallpaper() {
    const requestGeneration = generation;
    if (inFlight?.generation === requestGeneration) return inFlight.promise;
    const record = { generation: requestGeneration, promise: null };
    record.promise = retrieveWallpaper(requestGeneration).finally(() => { if (inFlight === record) inFlight = null; });
    inFlight = record;
    return record.promise;
  }

  return Object.freeze({ hasPermission, requestPermission, removePermission, getWallpaper });
}

module.exports = { BING_ORIGIN_PATTERN, BING_ORIGIN, CACHE_KEY, CACHE_MAX_AGE_MS, ROTATION_INTERVAL_MS,
  FRESH_CACHE_MAX_AGE_MS, MAX_MARKET_DATE_LAG_DAYS, BING_MARKETS, MAX_METADATA_BYTES, MAX_IMAGE_BYTES,
  metadataUrl, normalizeBingImageUrl, cachedWallpaper, bytesToDataUrl, createWallpaperProvider };
