'use strict';

const { normalizePreferenceSnapshot } = require('../preferences/preferences');
const { OPTIONAL_PRESENTATION_FEATURES } = require('./optional-feature-registry');

const DASHBOARD_STYLE_ID = 'squarecoil-companion-design-dashboard-profile';
const DASHBOARD_ATTRIBUTE = 'data-squarecoil-companion-dashboard-profile';
const AUDITED_SELECTORS = Object.freeze([
  '#widget-tasks', '#widget-designs', '#widget-estimates',
  '#page-content .panel.heading-border.panel-primary',
  '#page-content .panel-body.bg-light', '#multiple_location_id',
  '#inProgress', '#nextJob', '#onHold'
]);
const DASHBOARD_CSS = `
html[${DASHBOARD_ATTRIBUTE}="active"] #content{padding:22px 22px 54px!important}
html[${DASHBOARD_ATTRIBUTE}="active"] #content .mw1000.center-block.demo-block.mt30{width:calc(100% - 24px)!important;max-width:1180px!important;margin:20px auto 0!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(#page-content,#db-designs){width:100%!important;max-width:none!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(#widget-tasks,#widget-designs,#widget-estimates){min-height:94px!important;height:auto!important;margin-bottom:12px!important;color:#e7edf3!important;background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.004)),rgba(10,10,13,.55)!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:15px!important;overflow:hidden!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(#widget-tasks,#widget-designs,#widget-estimates)>div{min-height:92px!important;padding:14px 20px!important;background:transparent!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(#widget-tasks,#widget-designs,#widget-estimates) h2{margin:0 0 7px!important;color:#f5f7fa!important;font-size:30px!important;line-height:1!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(#widget-tasks,#widget-designs,#widget-estimates) h5{margin:0!important;color:#d5dae1!important;font-size:12.5px!important;line-height:1.25!important}
html[${DASHBOARD_ATTRIBUTE}="active"] #page-content .panel.heading-border.panel-primary{width:100%!important;margin:0!important;color:#d7dde5!important;background:rgba(10,10,13,.72)!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:16px!important;overflow:hidden!important}
html[${DASHBOARD_ATTRIBUTE}="active"] #page-content .panel-body.bg-light{width:100%!important;padding:22px 24px 24px!important;color:#d7dde5!important;background:transparent!important;overflow-x:auto!important;overflow-y:visible!important}
html[${DASHBOARD_ATTRIBUTE}="active"] #multiple_location_id{width:min(340px,100%)!important;min-height:38px!important;color:#f2f4f7!important;background:#11161c!important;border:1px solid #56616c!important;border-radius:9px!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(#inProgress,#nextJob,#onHold).design-list-container{width:100%!important;margin:0 0 18px!important;color:#d7dde5!important;background:rgba(255,255,255,.025)!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:12px!important;overflow:hidden!important}
html[${DASHBOARD_ATTRIBUTE}="active"] .design-list-container .clickableRowx,
html[${DASHBOARD_ATTRIBUTE}="active"] .design-list-container>.row{color:#dee3ea!important;border-bottom:1px solid rgba(255,255,255,.07)!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(.sort-btn,.existing-sort,.design-pop-icon,.fa-info-circle,.expander,.expander1){color:#9ccff0!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(.fa,i.fa,span.fa,[class^="fa-"],[class*=" fa-"]){font-family:"FontAwesome"!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(.glyphicon,[class^="glyphicon-"],[class*=" glyphicon-"]){font-family:"Glyphicons Halflings"!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(.glyphicons,[class^="glyphicons-"],[class*=" glyphicons-"]){font-family:"Glyphicons"!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(.imoon,[class^="imoon-"],[class*=" imoon-"],i[class^="icon-"],i[class*=" icon-"]){font-family:"icomoon"!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(#complete-tasks-form,#description-modal .modal-content,.show-materials-used-warning-modal-content,.popup-modal){color:#e7edf3!important;background:#151b21!important;border:1px solid #46515c!important;border-radius:14px!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(.alert-danger,.text-danger){color:#ffb8b8!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :is(.alert-warning,.text-warning){color:#ffda94!important}
html[${DASHBOARD_ATTRIBUTE}="active"] :focus-visible{outline:3px solid #9ccff0!important;outline-offset:2px!important}
@media (max-width:768px){html[${DASHBOARD_ATTRIBUTE}="active"] #content{padding:14px 12px 40px!important}html[${DASHBOARD_ATTRIBUTE}="active"] #page-content .panel-body.bg-light{padding:16px!important}}
`;

function exactDashboardRoute(location) {
  if (!location || String(location.pathname || '').toLowerCase() !== '/dashboard.php') return false;
  const params = new URLSearchParams(String(location.search || ''));
  return params.getAll('show').length === 1 && params.get('show') === '2';
}

function createDashboardProfile(options = {}) {
  const document = options.document;
  const window = options.window;
  if (!document || !window) throw new Error('dashboard-profile-environment-required');
  let disposed = false;
  let signature = null;
  let current = Object.freeze({
    featureId: OPTIONAL_PRESENTATION_FEATURES.DESIGN_DASHBOARD_PROFILE.id,
    featureVersion: OPTIONAL_PRESENTATION_FEATURES.DESIGN_DASHBOARD_PROFILE.version,
    preference: 'OFF', state: 'INACTIVE_PAGE', reason: 'not-applied', ownedLayerCount: 0,
    matchedSelectors: 0, auditedSelectorCount: AUDITED_SELECTORS.length
  });

  function removeOwned() {
    for (const node of Array.from(document.querySelectorAll?.(`#${DASHBOARD_STYLE_ID}`) || [])) node.remove?.();
    document.documentElement?.removeAttribute?.(DASHBOARD_ATTRIBUTE);
  }

  function publish(state, reason, preferences, matchedSelectors = 0, ownedLayerCount = 0) {
    current = Object.freeze({ featureId: OPTIONAL_PRESENTATION_FEATURES.DESIGN_DASHBOARD_PROFILE.id,
      featureVersion: OPTIONAL_PRESENTATION_FEATURES.DESIGN_DASHBOARD_PROFILE.version,
      preference: preferences.dashboardProfile, state, reason, ownedLayerCount,
      matchedSelectors, auditedSelectorCount: AUDITED_SELECTORS.length });
    return current;
  }

  function apply(preferences, basePresentation = {}) {
    if (disposed) throw new Error('dashboard-profile-disposed');
    const normalized = normalizePreferenceSnapshot(preferences);
    const nextSignature = JSON.stringify({ revision: normalized.preferenceRevision,
      profile: normalized.dashboardProfile, pathname: String(window.location?.pathname || ''),
      search: String(window.location?.search || ''), theme: basePresentation.websiteThemeEffective,
      forced: basePresentation.forcedColors === true, transparency: basePresentation.reducedTransparency === true });
    if (signature === nextSignature) {
      const layerCount = Array.from(document.querySelectorAll?.(`#${DASHBOARD_STYLE_ID}`) || []).length;
      if (['APPLIED', 'PARTIAL_SAFE'].includes(current.state) && layerCount === 1) {
        const matched = AUDITED_SELECTORS.filter(selector => Boolean(document.querySelector?.(selector))).length;
        return publish(matched === AUDITED_SELECTORS.length ? 'APPLIED' : 'PARTIAL_SAFE',
          matched === AUDITED_SELECTORS.length ? 'audited-surface-complete' : 'audited-selector-missing',
          normalized, matched, 1);
      }
      if (!['APPLIED', 'PARTIAL_SAFE'].includes(current.state)) return current;
    }
    signature = nextSignature;
    removeOwned();
    if (!exactDashboardRoute(window.location)) return publish('INACTIVE_PAGE', 'route-not-eligible', normalized);
    if (normalized.dashboardProfile !== 'ON') return publish('INACTIVE_THEME', 'preference-off', normalized);
    if (basePresentation.forcedColors === true || basePresentation.reducedTransparency === true) {
      return publish('SUSPENDED_ACCESSIBILITY', 'accessibility-override', normalized);
    }
    if (basePresentation.websiteThemeEffective !== 'SLEEK_DARK') {
      return publish('INACTIVE_THEME', 'sleek-dark-required', normalized);
    }
    const style = document.createElement?.('style');
    if (!style) return publish('PARTIAL_SAFE', 'style-element-unavailable', normalized);
    style.id = DASHBOARD_STYLE_ID;
    style.setAttribute?.('data-squarecoil-companion-owned', OPTIONAL_PRESENTATION_FEATURES.DESIGN_DASHBOARD_PROFILE.id);
    style.textContent = DASHBOARD_CSS;
    (document.head || document.documentElement)?.appendChild?.(style);
    document.documentElement?.setAttribute?.(DASHBOARD_ATTRIBUTE, 'active');
    const layers = Array.from(document.querySelectorAll?.(`#${DASHBOARD_STYLE_ID}`) || []);
    for (const duplicate of layers.slice(1)) duplicate.remove?.();
    const matched = AUDITED_SELECTORS.filter(selector => Boolean(document.querySelector?.(selector))).length;
    return publish(matched === AUDITED_SELECTORS.length ? 'APPLIED' : 'PARTIAL_SAFE',
      matched === AUDITED_SELECTORS.length ? 'audited-surface-complete' : 'audited-selector-missing',
      normalized, matched, Math.min(1, layers.length || 1));
  }

  function snapshot() { return current; }
  function teardown() { if (disposed) return; disposed = true; signature = null; removeOwned(); }
  return Object.freeze({ apply, snapshot, teardown });
}

module.exports = { DASHBOARD_STYLE_ID, DASHBOARD_ATTRIBUTE, AUDITED_SELECTORS, DASHBOARD_CSS,
  exactDashboardRoute, createDashboardProfile };
