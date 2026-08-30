'use strict';

const { normalizePreferenceSnapshot } = require('../preferences/preferences');
const { OPTIONAL_PRESENTATION_FEATURES } = require('./optional-feature-registry');

const CINEMATIC_STYLE_ID = 'squarecoil-companion-cinematic-style';
const CINEMATIC_HOST_ID = 'squarecoil-companion-cinematic-host';
const CINEMATIC_ATTRIBUTE = 'data-squarecoil-companion-cinematic';
const REFRESH_INTERVAL_MS = 30 * 60 * 1000;
const IMAGE_TIMEOUT_MS = 12_000;
const CINEMATIC_CSS = `
html[${CINEMATIC_ATTRIBUTE}="active"]{min-height:100%;background:#090d12!important}
html[${CINEMATIC_ATTRIBUTE}="active"] body{min-height:100%;isolation:isolate;background-color:transparent!important;background-image:none!important}
#${CINEMATIC_HOST_ID}{position:fixed;inset:-4%;z-index:-1;overflow:hidden;pointer-events:none;background:#090d12}
#${CINEMATIC_HOST_ID}[data-theme="SLEEK_DARK"]{background:radial-gradient(circle at 18% 10%,rgba(49,117,151,.92) 0,rgba(26,55,73,.76) 24%,transparent 47%),radial-gradient(circle at 82% 16%,rgba(76,56,123,.62) 0,transparent 38%),linear-gradient(145deg,#132531 0%,#0b141d 48%,#070b10 100%)}
#${CINEMATIC_HOST_ID}[data-theme="LIGHT_GLASS"]{background:radial-gradient(circle at 18% 10%,rgba(255,255,255,.98) 0,rgba(223,239,248,.86) 30%,transparent 55%),radial-gradient(circle at 78% 18%,rgba(163,205,226,.58) 0,transparent 43%),linear-gradient(145deg,#d9e9f2 0%,#bfd4e0 52%,#91adbd 100%)}
#${CINEMATIC_HOST_ID} .sc-cinematic-layer{position:absolute;inset:0;opacity:0;background-position:center;background-size:cover;background-repeat:no-repeat;transform:scale(1.08);transition:opacity 1200ms ease;will-change:transform,opacity}
#${CINEMATIC_HOST_ID} .sc-cinematic-layer[data-active="true"]{opacity:1;animation:sc-companion-cinematic-drift 42s linear infinite alternate}
#${CINEMATIC_HOST_ID}::after{content:"";position:absolute;inset:0;pointer-events:none}
#${CINEMATIC_HOST_ID}[data-theme="SLEEK_DARK"]::after{background:linear-gradient(180deg,rgba(3,8,12,.30),rgba(3,8,12,.58))}
#${CINEMATIC_HOST_ID}[data-theme="LIGHT_GLASS"]::after{background:linear-gradient(180deg,rgba(241,247,251,.16),rgba(225,236,243,.28))}
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
  let currentImageSource = null;
  let fallbackVisible = false;
  let fallbackReason = null;
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
      imageDisplayed: Boolean((currentImage || fallbackVisible) && document.getElementById?.(CINEMATIC_HOST_ID)),
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
    if (!retainImage) {
      currentImage = null;
      currentImageSource = null;
      fallbackVisible = false;
      fallbackReason = null;
      source = null;
      activeLayer = 'a';
    }
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
    host.setAttribute?.('data-theme', basePresentation.websiteThemeEffective || 'SLEEK_DARK');
    document.documentElement?.setAttribute?.(CINEMATIC_ATTRIBUTE, 'active');
    return host;
  }

  function eligible() {
    if (preferences.cinematicBackground !== 'CINEMATIC') return { state: 'DISABLED', reason: 'preference-none' };
    if (basePresentation.forcedColors === true || basePresentation.reducedTransparency === true ||
        forcedMedia?.matches === true || transparencyMedia?.matches === true) {
      return { state: 'SUSPENDED_ACCESSIBILITY', reason: 'accessibility-override' };
    }
    if (!['SLEEK_DARK', 'LIGHT_GLASS'].includes(basePresentation.websiteThemeEffective)) {
      return { state: 'SUSPENDED_THEME', reason: 'glass-theme-required' };
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

  function showImage(dataUrl, imageSource) {
    const host = ensureOwned();
    if (!host) return false;
    const incoming = activeLayer === 'a' ? 'b' : 'a';
    const incomingNode = host.querySelector?.(`[data-layer="${incoming}"]`);
    const outgoingNode = host.querySelector?.(`[data-layer="${activeLayer}"]`);
    if (!incomingNode || !outgoingNode) return false;
    // The authoritative source composes the photograph with its light/dark
    // overlays through this custom property. A direct background-image alone
    // loses to that pinned !important declaration and makes the photo vanish.
    incomingNode.style?.setProperty?.('--us-squarecoil-cine-image', cssUrl(dataUrl));
    incomingNode.style?.setProperty?.('background-image', cssUrl(dataUrl));
    incomingNode.setAttribute?.('data-active', 'true');
    outgoingNode.setAttribute?.('data-active', 'false');
    activeLayer = incoming;
    currentImage = dataUrl;
    currentImageSource = imageSource;
    fallbackVisible = false;
    fallbackReason = null;
    return true;
  }

  function showFallback(nextReason = fallbackReason) {
    const host = ensureOwned();
    if (!host) return false;
    for (const layer of Array.from(host.querySelectorAll?.('.sc-cinematic-layer') || [])) {
      layer.setAttribute?.('data-active', 'false');
      layer.style?.removeProperty?.('--us-squarecoil-cine-image');
      layer.style?.removeProperty?.('background-image');
    }
    currentImage = null;
    currentImageSource = null;
    fallbackVisible = true;
    fallbackReason = typeof nextReason === 'string' && nextReason ? nextReason : 'fallback-used';
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
      try { result = await fetchWallpaper({ trigger, generation: requestGeneration,
        websiteTheme: basePresentation.websiteThemeEffective }); }
      catch (error) { result = { ok: false, reason: String(error?.message || error) }; }
      if (disposed || requestGeneration !== generation || eligible()) return snapshot();
      const candidate = result?.ok === true ? safeImageDataUrl(result.dataUrl) : null;
      const candidateSource = result?.source || null;
      if (candidate) {
        let ready = false;
        try { ready = await loadImage(candidate); } catch (_) { ready = false; }
        if (disposed || requestGeneration !== generation || eligible()) return snapshot();
        const acceptedSource = candidateSource === 'CACHE' ? 'CACHE' :
          candidateSource === 'CACHE_FRESH' ? 'CACHE_FRESH' : 'REMOTE';
        if (ready && showImage(candidate, acceptedSource)) {
          scheduleRefresh();
          if (candidateSource === 'CACHE') return publish('DEGRADED_CACHE', result?.reason || 'remote-failed-cache-used', 'CACHE');
          if (candidateSource === 'CACHE_FRESH') return publish('SHOWING', result?.reason || 'fresh-cache-reused', 'CACHE_FRESH');
          return publish('SHOWING', 'valid-image-ready', 'REMOTE');
        }
      }
      scheduleRefresh();
      if (currentImage) return publish(currentImageSource === 'CACHE' ? 'DEGRADED_CACHE' : 'SHOWING',
        'candidate-rejected-current-retained', currentImageSource);
      const nextFallbackReason = result?.reason || 'fallback-used';
      if (showFallback(nextFallbackReason)) return publish('DEGRADED_FALLBACK', nextFallbackReason, 'FALLBACK');
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
      layer?.style?.setProperty?.('--us-squarecoil-cine-image', cssUrl(currentImage));
      layer?.style?.setProperty?.('background-image', cssUrl(currentImage));
      layer?.setAttribute?.('data-active', 'true');
      scheduleRefresh();
      return publish(currentImageSource === 'CACHE' ? 'DEGRADED_CACHE' : 'SHOWING',
        'eligible-current-restored', currentImageSource);
    }
    if (fallbackVisible) {
      const restoredReason = fallbackReason || 'eligible-fallback-restored';
      showFallback(restoredReason);
      scheduleRefresh();
      return publish('DEGRADED_FALLBACK', restoredReason, 'FALLBACK');
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
  safeImageDataUrl, createCinematicBackground };
