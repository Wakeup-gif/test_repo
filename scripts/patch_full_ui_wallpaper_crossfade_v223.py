from pathlib import Path

TM = Path('tampermonkey')
path = TM / 'US-Sign-Full-UI-Theme.user.js'
text = path.read_text(encoding='utf-8')


def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly 1 match, found {count}')
    text = text.replace(old, new, 1)


replace_once('// @version      2.2.2', '// @version      2.2.3', 'version')
replace_once(
    '// @description  Canonical SquareCoil Dark Glass UI with centralized Design-page paint ownership, audited 14px frost, graphite neutral surfaces, shared Bing wallpaper, semantic states, refined spacing, and geometric cursor.',
    '// @description  Canonical SquareCoil Dark Glass UI with centralized Design paint, audited 14px frost, graphite surfaces, shared Bing wallpaper with a smooth preloaded crossfade, semantic states, refined spacing, and geometric cursor.',
    'description',
)

crossfade_module = r'''  // =========================================================
  // v2.2.3 PRELOADED WALLPAPER CROSSFADE
  // All wallpaper-painted roots already consume the same --us-wallpaper value.
  // Animate that single value with Chromium's image cross-fade so html, #main,
  // #content_wrapper, sidebar glass, and panel backdrops stay perfectly synced.
  // RAF exists only for ~1.4s when the 30-minute wallpaper slot changes.
  // =========================================================
  const US_SIGN_WALLPAPER_FADE_MS = 1400;
  const US_SIGN_WALLPAPER_PRELOAD_TIMEOUT_MS = 4500;
  let usSignWallpaperStable = '';
  let usSignWallpaperFadeRaf = 0;
  let usSignWallpaperFadeTarget = '';
  let usSignWallpaperTransitionToken = 0;

  function usSignSupportsWallpaperCrossfade() {
    try {
      return Boolean(window.CSS?.supports?.(
        'background-image',
        '-webkit-cross-fade(linear-gradient(#000,#000), linear-gradient(#fff,#fff), 0.5)'
      ));
    } catch (_) {
      return false;
    }
  }

  function usSignCurrentWallpaperValue() {
    if (!document.documentElement) return '';
    if (usSignWallpaperStable) return usSignWallpaperStable;

    const inlineValue = document.documentElement.style.getPropertyValue('--us-wallpaper').trim();
    if (inlineValue) return inlineValue;

    try {
      return window.getComputedStyle(document.documentElement)
        .getPropertyValue('--us-wallpaper')
        .trim();
    } catch (_) {
      return '';
    }
  }

  function usSignSetWallpaperDirect(cssValue) {
    if (!document.documentElement || !cssValue) return;
    document.documentElement.style.setProperty('--us-wallpaper', cssValue);
    usSignWallpaperStable = cssValue;
  }

  function usSignSettleWallpaperFade() {
    if (usSignWallpaperFadeRaf) {
      window.cancelAnimationFrame(usSignWallpaperFadeRaf);
      usSignWallpaperFadeRaf = 0;
    }
    if (usSignWallpaperFadeTarget) {
      usSignSetWallpaperDirect(usSignWallpaperFadeTarget);
      usSignWallpaperFadeTarget = '';
    }
  }

  function usSignPreloadWallpaper(url) {
    return new Promise((resolve) => {
      if (!url) {
        resolve(false);
        return;
      }

      const image = new Image();
      let settled = false;
      let timeoutId = 0;

      const finish = (loaded) => {
        if (settled) return;
        settled = true;
        if (timeoutId) window.clearTimeout(timeoutId);
        image.onload = null;
        image.onerror = null;
        resolve(Boolean(loaded));
      };

      image.decoding = 'async';
      image.onload = () => finish(true);
      image.onerror = () => finish(false);
      image.src = url;

      if (image.complete && image.naturalWidth > 0) {
        window.requestAnimationFrame(() => finish(true));
      }

      timeoutId = window.setTimeout(
        () => finish(image.complete && image.naturalWidth > 0),
        US_SIGN_WALLPAPER_PRELOAD_TIMEOUT_MS
      );
    });
  }

  function usSignStartWallpaperCrossfade(fromCssValue, nextCssValue, token) {
    if (!document.documentElement || !fromCssValue || !nextCssValue) {
      usSignSetWallpaperDirect(nextCssValue);
      return;
    }

    const root = document.documentElement;
    const startedAt = window.performance.now();
    usSignWallpaperFadeTarget = nextCssValue;

    const render = (now) => {
      if (token !== usSignWallpaperTransitionToken) return;

      const rawProgress = Math.min(1, Math.max(0, (now - startedAt) / US_SIGN_WALLPAPER_FADE_MS));
      // Smoothstep: soft start/end without a long muddy midpoint.
      const mix = rawProgress * rawProgress * (3 - (2 * rawProgress));
      root.style.setProperty(
        '--us-wallpaper',
        `-webkit-cross-fade(${fromCssValue}, ${nextCssValue}, ${mix.toFixed(4)})`
      );

      if (rawProgress < 1) {
        usSignWallpaperFadeRaf = window.requestAnimationFrame(render);
        return;
      }

      usSignWallpaperFadeRaf = 0;
      usSignWallpaperFadeTarget = '';
      usSignSetWallpaperDirect(nextCssValue);
    };

    usSignWallpaperFadeRaf = window.requestAnimationFrame(render);
  }

  async function usSignQueueWallpaperTransition(nextCssValue, preloadUrl) {
    if (!document.documentElement || !nextCssValue) return;

    // A second request is rare (usually only cache -> fresh pool on startup),
    // but settle the first fade cleanly before accepting the newer target.
    usSignSettleWallpaperFade();
    const token = ++usSignWallpaperTransitionToken;
    const fromCssValue = usSignCurrentWallpaperValue();

    if (!fromCssValue || fromCssValue === nextCssValue) {
      usSignSetWallpaperDirect(nextCssValue);
      return;
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduceMotion || !usSignSupportsWallpaperCrossfade()) {
      usSignSetWallpaperDirect(nextCssValue);
      return;
    }

    const loaded = await usSignPreloadWallpaper(preloadUrl);
    if (token !== usSignWallpaperTransitionToken) return;

    // Never strand rotation if preloading is blocked by page policy; preserve
    // the existing behavior as a direct swap in that uncommon fallback case.
    if (!loaded) {
      usSignSetWallpaperDirect(nextCssValue);
      return;
    }

    usSignStartWallpaperCrossfade(fromCssValue, nextCssValue, token);
  }

'''

anchor = '  function usSignApplyBingWallpaper(images = usSignBingPool) {'
replace_once(anchor, crossfade_module + anchor, 'wallpaper function anchor')

replace_once(
    "    document.documentElement.style.setProperty('--us-wallpaper', `url(\"${cssUrl}\")`);",
    "    void usSignQueueWallpaperTransition(`url(\"${cssUrl}\")`, image.url);",
    'wallpaper assignment',
)

path.write_text(text, encoding='utf-8', newline='\n')
(TM / 'US-Sign-Full-UI-Theme-v2.2.3.user.js').write_text(text, encoding='utf-8', newline='\n')
print('patched Full UI Theme 2.2.3 wallpaper crossfade')
