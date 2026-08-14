# trigger: v2.1.30 Bing wallpaper rotation release
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.1.29" not in text:
    raise SystemExit("expected canonical Full UI Theme v2.1.29")

text = text.replace("@version      2.1.29", "@version      2.1.30", 1)
text = text.replace(
    "source-targeted true-blur main Dashboard, unified Job Dashboard and Design workspaces, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    "source-targeted true-blur main Dashboard, rotating curated Bing wallpapers every 30 minutes, unified Job Dashboard and Design workspaces, corrected Task-page contrast, and a cutout geometric triangle cursor.",
    1,
)

old_grants = "// @grant        GM_addStyle\n// @noframes"
new_grants = "// @grant        GM_addStyle\n// @grant        GM_xmlhttpRequest\n// @connect      www.bing.com\n// @noframes"
if old_grants not in text:
    raise SystemExit("metadata grant anchor not found")
text = text.replace(old_grants, new_grants, 1)

anchor = '''  `);\n\n  // v2.1.13: bounded cleanup'''
if anchor not in text:
    raise SystemExit("runtime insertion anchor not found")

runtime = r'''  `);

  // =========================================================
  // v2.1.30 CURATED BING WALLPAPER ROTATION
  // Fetch a small global pool of recent Bing homepage images, cache metadata,
  // and rotate locally every 30 minutes. Network refresh is capped at 6 hours.
  // The static --us-wallpaper value above remains the offline/failure fallback.
  // =========================================================
  const US_SIGN_BING_ROTATE_MS = 30 * 60 * 1000;
  const US_SIGN_BING_CACHE_MS = 6 * 60 * 60 * 1000;
  const US_SIGN_BING_CACHE_KEY = 'us-sign-bing-wallpaper-pool-v1';
  const US_SIGN_BING_MARKETS = ['en-US', 'en-GB', 'en-AU', 'ja-JP'];
  let usSignBingPool = [];
  let usSignBingRotateTimer = 0;
  let usSignBingRefreshInFlight = false;

  function usSignReadBingCache() {
    try {
      const raw = window.localStorage.getItem(US_SIGN_BING_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.images) || !parsed.images.length) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function usSignWriteBingCache(images) {
    try {
      window.localStorage.setItem(
        US_SIGN_BING_CACHE_KEY,
        JSON.stringify({ fetchedAt: Date.now(), images })
      );
    } catch (_) {
      // Storage may be blocked; live rotation still works for the current page.
    }
  }

  function usSignHashString(value) {
    let hash = 2166136261;
    const textValue = String(value || '');
    for (let i = 0; i < textValue.length; i += 1) {
      hash ^= textValue.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function usSignNormalizeBingImage(image, market) {
    if (!image || typeof image.url !== 'string') return null;
    try {
      const url = new URL(image.url, 'https://www.bing.com/');
      if (url.protocol !== 'https:') return null;
      return {
        url: url.href,
        key: String(image.urlbase || url.pathname),
        title: String(image.title || image.copyright || 'Bing wallpaper'),
        startdate: String(image.startdate || ''),
        market: String(market || '')
      };
    } catch (_) {
      return null;
    }
  }

  function usSignApplyBingWallpaper(images = usSignBingPool) {
    if (!Array.isArray(images) || !images.length || !document.documentElement) return;
    const slot = Math.floor(Date.now() / US_SIGN_BING_ROTATE_MS);
    const image = images[slot % images.length];
    if (!image || !image.url) return;

    const cssUrl = image.url.replace(/"/g, '%22');
    document.documentElement.style.setProperty('--us-wallpaper', `url("${cssUrl}")`);
    document.documentElement.dataset.usBingWallpaper = image.title || 'Bing wallpaper';
    document.documentElement.dataset.usBingMarket = image.market || '';
  }

  function usSignRequestBingMarket(market) {
    return new Promise((resolve) => {
      if (typeof GM_xmlhttpRequest !== 'function') {
        resolve([]);
        return;
      }

      const endpoint = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=${encodeURIComponent(market)}`;
      GM_xmlhttpRequest({
        method: 'GET',
        url: endpoint,
        timeout: 9000,
        headers: { Accept: 'application/json,text/plain,*/*' },
        onload(response) {
          if (response.status < 200 || response.status >= 300) {
            resolve([]);
            return;
          }
          try {
            const payload = JSON.parse(response.responseText || '{}');
            const images = Array.isArray(payload.images) ? payload.images : [];
            resolve(images.map((image) => usSignNormalizeBingImage(image, market)).filter(Boolean));
          } catch (_) {
            resolve([]);
          }
        },
        onerror() { resolve([]); },
        ontimeout() { resolve([]); }
      });
    });
  }

  async function usSignRefreshBingPool(force = false) {
    if (usSignBingRefreshInFlight) return;

    const cached = usSignReadBingCache();
    if (cached?.images?.length) {
      usSignBingPool = cached.images;
      usSignApplyBingWallpaper();
      const cacheAge = Date.now() - Number(cached.fetchedAt || 0);
      if (!force && cacheAge >= 0 && cacheAge < US_SIGN_BING_CACHE_MS) return;
    }

    usSignBingRefreshInFlight = true;
    try {
      const batches = await Promise.all(US_SIGN_BING_MARKETS.map(usSignRequestBingMarket));
      const unique = new Map();
      batches.flat().forEach((image) => {
        if (image?.url && !unique.has(image.key)) unique.set(image.key, image);
      });

      const images = Array.from(unique.values())
        .sort((a, b) => usSignHashString(a.key) - usSignHashString(b.key));

      if (images.length) {
        usSignBingPool = images;
        usSignWriteBingCache(images);
        usSignApplyBingWallpaper();
      }
    } finally {
      usSignBingRefreshInFlight = false;
    }
  }

  function usSignScheduleBingRotation() {
    if (usSignBingRotateTimer) window.clearTimeout(usSignBingRotateTimer);
    const now = Date.now();
    const untilNextSlot = US_SIGN_BING_ROTATE_MS - (now % US_SIGN_BING_ROTATE_MS) + 500;
    usSignBingRotateTimer = window.setTimeout(() => {
      usSignApplyBingWallpaper();
      usSignRefreshBingPool(false);
      usSignScheduleBingRotation();
    }, untilNextSlot);
  }

  function usSignInitBingWallpapers() {
    const cached = usSignReadBingCache();
    if (cached?.images?.length) {
      usSignBingPool = cached.images;
      usSignApplyBingWallpaper();
    }
    usSignRefreshBingPool(false);
    usSignScheduleBingRotation();
  }

  usSignInitBingWallpapers();

  // v2.1.13: bounded cleanup'''

text = text.replace(anchor, runtime, 1)
TARGET.write_text(text, encoding="utf-8")
