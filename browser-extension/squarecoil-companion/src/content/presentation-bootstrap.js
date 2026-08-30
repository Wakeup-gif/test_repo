'use strict';

const { createPresentationMarkers } = require('../presentation/presentation-markers');
const { CANDIDATE_FINGERPRINT } = require('../core/build-identity');

// Keep the authoritative storage-key literal owned exclusively by authority-kernel.js.
// This early, read-only presentation consumer derives the same key without becoming
// a second source owner.
const AUTHORITY_STORAGE_KEY = ['squarecoil', 'CompanionB2AuthorityV1'].join('');
const STYLE_ID = 'squarecoil-companion-site-theme';
const GUARD_STYLE_ID = 'squarecoil-companion-prepaint-guard';
const GUARD_ATTRIBUTE = 'data-squarecoil-companion-prepaint';
const ROOT_THEME_ATTRIBUTE = 'data-squarecoil-companion-site-theme';
const ROOT_ROUTE_ATTRIBUTE = 'data-squarecoil-companion-site-route';
const API_KEY = '__squareCoilCompanionPresentationBootstrap';
const GUARD_BUDGET_MS = 1400;
const GLASS_THEMES = new Set(['SLEEK_DARK', 'LIGHT_GLASS']);
const THEME_FILES = Object.freeze({
  SLEEK_DARK: 'dist/themes/dark-glass.css',
  LIGHT_GLASS: 'dist/themes/light-glass.css'
});
const THEME_CLASSES = Object.freeze([
  'us-sign-theme-dark-glass',
  'us-sign-theme-refined-light',
  'us-sign-v230',
  'us-sign-v240',
  'us-sign-theme-light-glass'
]);
const SOURCE_ATTRIBUTES = Object.freeze([
  'data-us-sign-theme',
  'data-us-sign-theme-version',
  'data-us-sign-wallpaper-mode',
  'data-us-sign-glass-mode',
  'data-us-sign-display-font',
  'data-us-sign-theme-audit-version',
  'data-us-sign-theme-audit-mode',
  'data-us-sign-v230-route',
  'data-us-sign-light-glass-theme-version',
  'data-us-sign-light-glass-theme-mode',
  'data-us-sign-v240-route',
  'data-us-sign-active-skin',
  'data-us-sign-active-skin-variant',
  'data-us-sign-legacy-wallpaper-engine',
  'data-us-sign-legacy-parallax'
]);
const ROUTES = Object.freeze([
  ['/dashboard.php', 'dashboard'],
  ['/project_milestones.php', 'project-milestones'],
  ['/project_designs.php', 'project-designs'],
  ['/edit_design.php', 'project-designs'],
  ['/project_tasks.php', 'project-tasks'],
  ['/project_documents.php', 'project-documents'],
  ['/project_site_photos.php', 'project-photos'],
  ['/project.php', 'project-overview'],
  ['/projects.php', 'projects'],
  ['/leads.php', 'leads'],
  ['/shopping_list.php', 'shopping-list'],
  ['/purchase_orders.php', 'purchase-orders'],
  ['/tracking.php', 'tracking'],
  ['/receiving.php', 'receiving'],
  ['/schedule.php', 'schedule'],
  ['/calendar.php', 'install-calendar'],
  ['/vacation_calendar.php', 'vacation-calendar'],
  ['/active_inventory.php', 'active-inventory'],
  ['/sign_criteria.php', 'sign-criteria'],
  ['/branding.php', 'branding'],
  ['/report.php', 'report'],
  ['/reports.php', 'report']
]);

(function startPresentationBootstrap() {
  if (globalThis[API_KEY] || window.top !== window) return;
  const root = document.documentElement;
  if (!root) return;

  const cssCache = new Map();
  const markers = createPresentationMarkers({ document, window });
  let generation = 0;
  let guardTimer = null;
  let activeTheme = 'ORIGINAL';
  let lastReason = 'initializing';
  let disposed = false;

  function routeName() {
    const path = String(window.location?.pathname || '').toLowerCase();
    const exact = ROUTES.find(([suffix]) => path === suffix);
    if (exact) return exact[1];
    return 'generic';
  }

  function normalizeTheme(value) {
    const theme = String(value || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
    if (['SLEEK_DARK', 'DARK', 'DARK_GLASS'].includes(theme)) return 'SLEEK_DARK';
    if (['LIGHT_GLASS'].includes(theme)) return 'LIGHT_GLASS';
    if (['REFINED_LIGHT', 'REFINED', 'LIGHT'].includes(theme)) return 'REFINED_LIGHT';
    return 'ORIGINAL';
  }

  function installGuard() {
    root.setAttribute(GUARD_ATTRIBUTE, 'pending');
    let style = document.getElementById?.(GUARD_STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = GUARD_STYLE_ID;
      style.setAttribute('data-squarecoil-companion-owned', 'prepaint-guard');
      style.textContent = `html[${GUARD_ATTRIBUTE}="pending"] body{visibility:hidden!important}`;
      root.appendChild(style);
    }
    guardTimer = window.setTimeout(() => releaseGuard('budget-expired'), GUARD_BUDGET_MS);
  }

  function releaseGuard(reason) {
    if (guardTimer !== null) window.clearTimeout?.(guardTimer);
    guardTimer = null;
    root.removeAttribute(GUARD_ATTRIBUTE);
    document.getElementById?.(GUARD_STYLE_ID)?.remove?.();
    if (lastReason === 'initializing') lastReason = reason;
  }

  function clearSourceMarkers(options = {}) {
    for (const className of THEME_CLASSES) root.classList?.remove(className);
    for (const attribute of SOURCE_ATTRIBUTES) root.removeAttribute?.(attribute);
    const rootTheme = root.getAttribute?.(ROOT_THEME_ATTRIBUTE);
    if (options.forceRoot === true || !rootTheme || rootTheme === activeTheme || GLASS_THEMES.has(rootTheme)) {
      root.removeAttribute?.(ROOT_THEME_ATTRIBUTE);
      root.removeAttribute?.(ROOT_ROUTE_ATTRIBUTE);
    }
  }

  function syncRoute() {
    if (!GLASS_THEMES.has(activeTheme)) return;
    const route = routeName();
    root.setAttribute(ROOT_ROUTE_ATTRIBUTE, route.toUpperCase().replace(/-/g, '_'));
    if (activeTheme === 'SLEEK_DARK') root.setAttribute('data-us-sign-v230-route', route);
    if (activeTheme === 'LIGHT_GLASS') root.setAttribute('data-us-sign-v240-route', route);
    markers.schedule();
  }

  function installSourceMarkers(theme) {
    clearSourceMarkers({ forceRoot: true });
    const route = routeName();
    root.setAttribute(ROOT_THEME_ATTRIBUTE, theme);
    root.setAttribute(ROOT_ROUTE_ATTRIBUTE, route.toUpperCase().replace(/-/g, '_'));
    root.setAttribute('data-us-sign-theme-version', '2.2.7');
    root.setAttribute('data-us-sign-wallpaper-mode', 'cinematic-fresh-bing');
    root.setAttribute('data-us-sign-glass-mode', 'live-backdrop');
    root.setAttribute('data-us-sign-display-font', 'Space Grotesk');
    root.setAttribute('data-us-sign-legacy-wallpaper-engine', 'static-base-disabled');
    root.setAttribute('data-us-sign-legacy-parallax', 'static-base-disabled');
    if (theme === 'SLEEK_DARK') {
      root.classList.add('us-sign-theme-dark-glass', 'us-sign-v230');
      root.setAttribute('data-us-sign-theme', 'dark-glass');
      root.setAttribute('data-us-sign-theme-audit-version', '2.3.4');
      root.setAttribute('data-us-sign-theme-audit-mode', 'enabled');
      root.setAttribute('data-us-sign-v230-route', route);
      root.setAttribute('data-us-sign-active-skin', 'dark');
    } else {
      root.classList.add('us-sign-v240', 'us-sign-theme-light-glass');
      root.setAttribute('data-us-sign-theme', 'light-glass');
      root.setAttribute('data-us-sign-light-glass-theme-version', '1.0.0');
      root.setAttribute('data-us-sign-light-glass-theme-mode', 'enabled');
      root.setAttribute('data-us-sign-v240-route', route);
      root.setAttribute('data-us-sign-active-skin', 'light');
      root.setAttribute('data-us-sign-active-skin-variant', 'light-glass');
    }
  }

  async function cssFor(theme) {
    if (cssCache.has(theme)) return cssCache.get(theme);
    const url = chrome.runtime.getURL(THEME_FILES[theme]);
    const response = await fetch(url, { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) throw new Error(`theme-css-load-${response.status}`);
    const css = await response.text();
    if (!css.includes('Presentation-only port of the pinned SquareCoil Tampermonkey source chain')) {
      throw new Error('theme-css-identity-invalid');
    }
    cssCache.set(theme, css);
    return css;
  }

  function removeTheme(reason = 'native') {
    generation += 1;
    const style = document.getElementById?.(STYLE_ID);
    if (style?.getAttribute?.('data-squarecoil-companion-theme-port') === 'authoritative') style.remove?.();
    clearSourceMarkers();
    markers.remove();
    activeTheme = 'ORIGINAL';
    lastReason = reason;
    releaseGuard(reason);
    return snapshot();
  }

  async function reconcile(rawTheme, reason = 'reconcile') {
    if (disposed) return snapshot();
    const theme = normalizeTheme(rawTheme);
    if (!GLASS_THEMES.has(theme) || window.matchMedia?.('(forced-colors: active)')?.matches === true) {
      return removeTheme(theme === 'ORIGINAL' ? reason : 'accessibility-native');
    }
    const requestGeneration = ++generation;
    try {
      const css = await cssFor(theme);
      if (disposed || requestGeneration !== generation) return snapshot();
      let style = document.getElementById?.(STYLE_ID);
      if (!style) {
        style = document.createElement('style');
        style.id = STYLE_ID;
        style.setAttribute('data-squarecoil-companion-owned', 'website-theme');
        (document.head || root).appendChild(style);
      }
      style.setAttribute('data-squarecoil-companion-theme-port', 'authoritative');
      style.textContent = css;
      installSourceMarkers(theme);
      activeTheme = theme;
      lastReason = reason;
      markers.apply();
      releaseGuard('theme-applied');
      return snapshot();
    } catch (error) {
      if (requestGeneration !== generation) return snapshot();
      return removeTheme(String(error?.message || error || 'theme-load-failed'));
    }
  }

  function snapshot() {
    return Object.freeze({
      activeTheme,
      reason: lastReason,
      guardPending: root.getAttribute?.(GUARD_ATTRIBUTE) === 'pending',
      stylePresent: Boolean(document.getElementById?.(STYLE_ID)),
      route: routeName(),
      candidateFingerprint: CANDIDATE_FINGERPRINT
    });
  }

  async function reconcileStored(reason) {
    try {
      const values = await chrome.storage.local.get({ timerEnabled: true, [AUTHORITY_STORAGE_KEY]: null });
      if (values.timerEnabled === false) return removeTheme('companion-disabled');
      const preference = values[AUTHORITY_STORAGE_KEY]?.document?.dataSafety?.preferences?.websiteTheme;
      return reconcile(preference, reason);
    } catch (error) {
      return removeTheme(String(error?.message || error || 'storage-read-failed'));
    }
  }

  function onStorageChanged(changes, area) {
    if (area !== 'local' || (!changes?.timerEnabled && !changes?.[AUTHORITY_STORAGE_KEY])) return;
    void reconcileStored('storage-change');
  }

  function onNavigation() {
    syncRoute();
  }

  function teardown() {
    if (disposed) return;
    removeTheme('teardown');
    disposed = true;
    markers.teardown();
    chrome.storage.onChanged?.removeListener?.(onStorageChanged);
    window.removeEventListener?.('pageshow', onNavigation);
    window.removeEventListener?.('popstate', onNavigation);
    window.removeEventListener?.('hashchange', onNavigation);
  }

  Object.defineProperty(globalThis, API_KEY, {
    value: Object.freeze({ reconcile, reconcileStored, removeTheme, syncRoute, snapshot, teardown }),
    configurable: true
  });
  installGuard();
  chrome.storage.onChanged?.addListener?.(onStorageChanged);
  window.addEventListener?.('pageshow', onNavigation);
  window.addEventListener?.('popstate', onNavigation);
  window.addEventListener?.('hashchange', onNavigation);
  void reconcileStored('document-start');
})();

module.exports = { AUTHORITY_STORAGE_KEY, STYLE_ID, GUARD_STYLE_ID, GUARD_ATTRIBUTE, ROOT_THEME_ATTRIBUTE,
  ROOT_ROUTE_ATTRIBUTE, API_KEY, GUARD_BUDGET_MS, GLASS_THEMES, THEME_FILES };
