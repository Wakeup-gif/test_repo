'use strict';

const { normalizePreferenceSnapshot } = require('../preferences/preferences');
const { OPTIONAL_PRESENTATION_FEATURES } = require('./optional-feature-registry');

const CINEMATIC_STYLE_ID = 'squarecoil-companion-cinematic-style';
const CINEMATIC_HOST_ID = 'squarecoil-companion-cinematic-host';
const CINEMATIC_ATTRIBUTE = 'data-squarecoil-companion-cinematic';
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
const IMAGE_TIMEOUT_MS = 12_000;
const FALLBACK_IMAGE_DATA_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"%3E%3Cdefs%3E%3CradialGradient id="a" cx="22%25" cy="12%25" r="92%25"%3E%3Cstop stop-color="%232b5d78"/%3E%3Cstop offset=".48" stop-color="%23152331"/%3E%3Cstop offset="1" stop-color="%23090d12"/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width="1600" height="900" fill="url(%23a)"/%3E%3C/svg%3E';
const CINEMATIC_CSS = `
html[${CINEMATIC_ATTRIBUTE}="active"] body{background-color:transparent!important;background-image:none!important}
#${CINEMATIC_HOST_ID}{position:fixed;inset:-4%;z-index:-2147483647;overflow:hidden;pointer-events:none;background:#090d12}
#${CINEMATIC_HOST_ID} .sc-cinematic-layer{position:absolute;inset:0;opacity:0;background-position:center;background-size:cover;background-repeat:no-repeat;transform:scale(1.08);transition:opacity 1200ms ease;will-change:transform,opacity}
#${CINEMATIC_HOST_ID} .sc-cinematic-layer[data-active="true"]{opacity:1;animation:sc-companion-cinematic-drift 42s linear infinite alternate}
#${CINEMATIC_HOST_ID}::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,8,12,.42),rgba(3,8,12,.68));pointer-events:none}
@keyframes sc-companion-cinematic-drift{from{transform:translate3d(-1.2%,-.7%,0) scale(1.08)}to{transform:translate3d(1.2%,.7%,0) scale(1.13)}}
#${CINEMATIC_HOST_ID}[data-reduced-motion="true"] .sc-cinematic-layer{transition:none!important;animation:none!important;transform:scale(1.08)!important}
@media (prefers-reduced-motion:reduce){#${CINEMATIC_HOST_ID} .sc-cinematic-layer{transition:none!important;animation:none!important;transform:scale(1.08)!important}}
`;

function mediaListener(media, listener, enabled) {
  if (!media) return;
  const modern = enabled ? 'addEventListener' : 'removeEventListener';
  if (typeof media[modern] === 'function') media[modern]('change', listener);
  else {
    const legacy = enabled ? 'addListener' : 'removeListener';
    if (typeof media[legacy] === 'function') media[legacy](listener);
  }
}

function safeImageDataUrl(value) {
  const text = String(value || '');
  return /^data:image\/(?:jpeg|png|webp|svg\+xml);/i.test(text) && text.length <= 6_000_000 ? text : null;
}

function cssUrl(value) { return `url("${String(value).replace(/["\\\r\n]/g, character => encodeURIComponent(character))}")`; }

function createCinematicBackground(options = {}) {
  const document = options.document;
  const window = options.window;
  const fetchWallpaper = typeof options.fetchWallpaper === 'function' ? options.fetchWallpaper : async () => ({ ok: false, reason: 'provider-unavailable' });
  const now = typeof options.now === 'function' ? options.now : () => Date.now();
  const refreshIntervalMs = Number.isSafeInteger(options.refreshIntervalMs) && options.refreshIntervalMs > 0
    ? options.refreshIntervalMs : REFRESH_INTERVAL_MS;
  if (!document || !window) throw new Error('cinematic-background-environment-required');

  const forcedMedia = typeof window.matchMedia === 'function' ? window.matchMedia('(forced-colors: active)') : null;
  const transparencyMedia = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-transparency: reduce)') : null;
  const motionMedia = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  let disposed = false;
  let generation = 0;
  let signature = null;
  let preferences = normalizePreferenceSnapshot({});
  let basePresentation = {};
  let state = 'DISABLED';
  let reason = 'preference-none';
  let source = null;
  let currentImage = null;
  let activeLayer = 'a';
  let inFlight = null;
  let refreshTimer = null;
  let nextRefreshAtMs = null;

  function snapshot() {
    return Object.freeze({
      featureId: OPTIONAL_PRESENTATION_FEATURES.CINEMATIC_BACKGROUND.id,
      featureVersion: OPTIONAL_PRESENTATION_FEATURES.CINEMATIC_BACKGROUND.version,
      preference: preferences.cinematicBackground,
      state, reason, source,
      imageDisplayed: Boolean(currentImage && document.getElementById?.(CINEMATIC_HOST_ID)),
      reducedMotion: motionMedia?.matches === true,
      requestInFlight: Boolean(inFlight),
      nextRefreshAtMs,
      ownedHostCount: Number(document.querySelectorAll?.(`#${CINEMATIC_HOST_ID}`)?.length || 0),
      ownedStyleCount: Number(document.querySelectorAll?.(`#${CINEMATIC_STYLE_ID}`)?.length || 0)
    });
  }

  function publish(nextState, nextReason, nextSource = source) {
    state = nextState;
    reason = nextReason;
    source = nextSource;
    try { options.onChange?.(snapshot()); } catch (_) {}
    return snapshot();
  }

  function clearTimer() {
    if (refreshTimer !== null) window.clearTimeout?.(refreshTimer);
    refreshTimer = null;
    nextRefreshAtMs = null;
  }

  function removeOwned({ retainImage = false } = {}) {
    clearTimer();
    for (const node of Array.from(document.querySelectorAll?.(`#${CINEMATIC_HOST_ID}, #${CINEMATIC_STYLE_ID}`) || [])) node.remove?.();
    document.documentElement?.removeAttribute?.(CINEMATIC_ATTRIBUTE);
    if (!retainImage) { currentImage = null; source = null; activeLayer = 'a'; }
  }

  function ensureOwned() {
    let style = document.getElementById?.(CINEMATIC_STYLE_ID);
    if (!style) {
      style = document.createElement?.('style');
      if (!style) return null;
      style.id = CINEMATIC_STYLE_ID;
      style.setAttribute?.('data-squarecoil-companion-owned', OPTIONAL_PRESENTATION_FEATURES.CINEMATIC_BACKGROUND.id);
      style.textContent = CINEMATIC_CSS;
      (document.head || document.documentElement)?.appendChild?.(style);
    }
    for (const duplicate of Array.from(document.querySelectorAll?.(`#${CINEMATIC_STYLE_ID}`) || []).slice(1)) duplicate.remove?.();
    let host = document.getElementById?.(CINEMATIC_HOST_ID);
    if (!host) {
      host = document.createElement?.('div');
      if (!host) return null;
      host.id = CINEMATIC_HOST_ID;
      host.setAttribute?.('aria-hidden', 'true');
      host.setAttribute?.('data-squarecoil-companion-owned', OPTIONAL_PRESENTATION_FEATURES.CINEMATIC_BACKGROUND.id);
      for (const name of ['a', 'b']) {
        const layer = document.createElement?.('div');
        if (!layer) return null;
        layer.className = 'sc-cinematic-layer';
        layer.setAttribute?.('data-layer', name);
        layer.setAttribute?.('data-active', 'false');
        host.appendChild?.(layer);
      }
      (document.body || document.documentElement)?.prepend?.(host);
    }
    for (const duplicate of Array.from(document.querySelectorAll?.(`#${CINEMATIC_HOST_ID}`) || []).slice(1)) duplicate.remove?.();
    host.setAttribute?.('data-reduced-motion', motionMedia?.matches === true ? 'true' : 'false');
    document.documentElement?.setAttribute?.(CINEMATIC_ATTRIBUTE, 'active');
    return host;
  }

  function eligible() {
    if (preferences.cinematicBackground !== 'CINEMATIC') return { state: 'DISABLED', reason: 'preference-none' };
    if (!['SLEEK_DARK', 'LIGHT_GLASS'].includes(basePresentation.websiteThemeEffective)) {
      return { state: 'SUSPENDED_THEME', reason: 'glass-theme-required' };
    }
    if (basePresentation.forcedColors === true || basePresentation.reducedTransparency === true ||
        forcedMedia?.matches === true || transparencyMedia?.matches === true) {
      return { state: 'SUSPENDED_ACCESSIBILITY', reason: 'accessibility-override' };
    }
    return null;
  }

  function loadImage(dataUrl) {
    if (typeof options.loadImage === 'function') return Promise.resolve(options.loadImage(dataUrl));
    return new Promise(resolve => {
      const image = new window.Image();
      let timer = null;
      let settled = false;
      const finish = value => {
        if (settled) return;
        settled = true;
        if (timer !== null) window.clearTimeout?.(timer);
        resolve(value === true && Number(image.naturalWidth || 0) > 0 && Number(image.naturalHeight || 0) > 0);
      };
      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      image.decoding = 'async';
      image.src = dataUrl;
      timer = window.setTimeout?.(() => finish(false), IMAGE_TIMEOUT_MS) ?? null;
    });
  }

  function showImage(dataUrl) {
    const host = ensureOwned();
    if (!host) return false;
    const incoming = activeLayer === 'a' ? 'b' : 'a';
    const incomingNode = host.querySelector?.(`[data-layer="${incoming}"]`);
    const outgoingNode = host.querySelector?.(`[data-layer="${activeLayer}"]`);
    if (!incomingNode || !outgoingNode) return false;
    incomingNode.style?.setProperty?.('background-image', cssUrl(dataUrl));
    incomingNode.setAttribute?.('data-active', 'true');
    outgoingNode.setAttribute?.('data-active', 'false');
    activeLayer = incoming;
    currentImage = dataUrl;
    return true;
  }

  function scheduleRefresh() {
    clearTimer();
    if (disposed || eligible() || document.hidden === true) return;
    nextRefreshAtMs = now() + refreshIntervalMs;
    refreshTimer = window.setTimeout?.(() => {
      refreshTimer = null;
      nextRefreshAtMs = null;
      if (!disposed && !eligible() && document.hidden !== true) void refresh('scheduled');
    }, refreshIntervalMs) ?? null;
  }

  async function refresh(trigger = 'manual') {
    if (disposed || eligible() || document.hidden === true) return snapshot();
    if (inFlight) return inFlight;
    const requestGeneration = generation;
    publish(currentImage ? 'REFRESHING' : 'LOADING_INITIAL', trigger);
    inFlight = (async () => {
      let result;
      try { result = await fetchWallpaper({ trigger, generation: requestGeneration }); }
      catch (error) { result = { ok: false, reason: String(error?.message || error) }; }
      if (disposed || requestGeneration !== generation || eligible()) return snapshot();
      let candidate = result?.ok === true ? safeImageDataUrl(result.dataUrl) : null;
      let candidateSource = result?.source || null;
      if (!candidate && !currentImage) {
        candidate = FALLBACK_IMAGE_DATA_URL;
        candidateSource = 'FALLBACK';
      }
      if (candidate) {
        let ready = false;
        try { ready = await loadImage(candidate); } catch (_) { ready = false; }
        if (disposed || requestGeneration !== generation || eligible()) return snapshot();
        if (ready && showImage(candidate)) {
          scheduleRefresh();
          if (candidateSource === 'CACHE') return publish('DEGRADED_CACHE', result?.reason || 'remote-failed-cache-used', 'CACHE');
          if (candidateSource === 'FALLBACK') return publish('DEGRADED_FALLBACK', result?.reason || 'fallback-used', 'FALLBACK');
          if (candidateSource === 'CACHE_FRESH') return publish('SHOWING', result?.reason || 'fresh-cache-reused', 'CACHE_FRESH');
          return publish('SHOWING', 'valid-image-ready', 'REMOTE');
        }
      }
      scheduleRefresh();
      if (currentImage) return publish('SHOWING', 'candidate-rejected-current-retained', source);
      removeOwned({ retainImage: false });
      return publish('DEGRADED_NONE', result?.reason || 'no-safe-image', null);
    })().finally(() => { if (requestGeneration === generation) inFlight = null; });
    return inFlight;
  }

  function evaluate() {
    const disposition = eligible();
    if (disposition) {
      generation += 1;
      inFlight = null;
      removeOwned({ retainImage: disposition.state === 'SUSPENDED_THEME' });
      return publish(disposition.state, disposition.reason, null);
    }
    const host = ensureOwned();
    if (!host) return publish('DEGRADED_NONE', 'owned-host-unavailable', null);
    if (currentImage) {
      const layer = host.querySelector?.(`[data-layer="${activeLayer}"]`);
      layer?.style?.setProperty?.('background-image', cssUrl(currentImage));
      layer?.setAttribute?.('data-active', 'true');
      scheduleRefresh();
      return publish(source === 'CACHE' ? 'DEGRADED_CACHE' : source === 'FALLBACK' ? 'DEGRADED_FALLBACK' : 'SHOWING', 'eligible-current-restored', source);
    }
    if (document.hidden === true) return publish('LOADING_INITIAL', 'hidden-deferred', null);
    void refresh('initial');
    return snapshot();
  }

  function apply(nextPreferences, nextBasePresentation = {}) {
    if (disposed) throw new Error('cinematic-background-disposed');
    const normalized = normalizePreferenceSnapshot(nextPreferences);
    const nextSignature = JSON.stringify({ revision: normalized.preferenceRevision,
      cinematic: normalized.cinematicBackground, theme: nextBasePresentation.websiteThemeEffective,
      forced: nextBasePresentation.forcedColors === true, transparency: nextBasePresentation.reducedTransparency === true });
    preferences = normalized;
    basePresentation = nextBasePresentation;
    if (signature === nextSignature) {
      if (!eligible() && (!document.getElementById?.(CINEMATIC_HOST_ID) || !document.getElementById?.(CINEMATIC_STYLE_ID))) {
        signature = null;
        generation += 1;
        return evaluate();
      }
      const host = document.getElementById?.(CINEMATIC_HOST_ID);
      host?.setAttribute?.('data-reduced-motion', motionMedia?.matches === true ? 'true' : 'false');
      return snapshot();
    }
    signature = nextSignature;
    generation += 1;
    inFlight = null;
    return evaluate();
  }

  function onMediaChange() { if (!disposed) { signature = null; apply(preferences, basePresentation); } }
  function onVisibilityChange() {
    if (disposed) return;
    if (document.hidden === true) clearTimer();
    else if (!eligible()) {
      if (!currentImage || (nextRefreshAtMs !== null && now() >= nextRefreshAtMs)) void refresh('visible');
      else scheduleRefresh();
    }
  }
  for (const media of [forcedMedia, transparencyMedia, motionMedia]) mediaListener(media, onMediaChange, true);
  document.addEventListener?.('visibilitychange', onVisibilityChange);

  function teardown() {
    if (disposed) return;
    disposed = true;
    generation += 1;
    inFlight = null;
    for (const media of [forcedMedia, transparencyMedia, motionMedia]) mediaListener(media, onMediaChange, false);
    document.removeEventListener?.('visibilitychange', onVisibilityChange);
    removeOwned({ retainImage: false });
  }

  return Object.freeze({ apply, refresh, snapshot, teardown });
}

module.exports = { CINEMATIC_STYLE_ID, CINEMATIC_HOST_ID, CINEMATIC_ATTRIBUTE, REFRESH_INTERVAL_MS,
  FALLBACK_IMAGE_DATA_URL, safeImageDataUrl, createCinematicBackground };
