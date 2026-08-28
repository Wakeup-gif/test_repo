'use strict';

const OPTIONAL_PRESENTATION_FEATURES = Object.freeze({
  CINEMATIC_BACKGROUND: Object.freeze({
    id: 'squarecoil.optional.cinematic-background',
    version: '1.0.0',
    category: 'presentation-network-read-only',
    defaultPreference: 'NONE',
    routes: Object.freeze(['https://ussignandmill.squarecoil.net/*']),
    optionalOrigins: Object.freeze(['https://www.bing.com/*']),
    dependencies: Object.freeze(['websiteTheme=SLEEK_DARK|LIGHT_GLASS']),
    conflicts: Object.freeze(['forced-colors', 'reduced-transparency']),
    storage: Object.freeze(['preferences.cinematicBackground', 'squarecoilCompanionB5BWallpaperCacheV1'])
  }),
  DESIGN_DASHBOARD_PROFILE: Object.freeze({
    id: 'squarecoil.optional.design-dashboard-profile',
    version: '1.0.0',
    category: 'presentation-route-profile',
    defaultPreference: 'OFF',
    routes: Object.freeze(['https://ussignandmill.squarecoil.net/dashboard.php?show=2']),
    optionalOrigins: Object.freeze([]),
    dependencies: Object.freeze(['websiteTheme=SLEEK_DARK']),
    conflicts: Object.freeze(['forced-colors', 'reduced-transparency']),
    storage: Object.freeze(['preferences.dashboardProfile'])
  })
});

function optionalFeatureCatalog() {
  return Object.freeze(Object.values(OPTIONAL_PRESENTATION_FEATURES).map(feature => Object.freeze({
    ...feature,
    routes: [...feature.routes],
    optionalOrigins: [...feature.optionalOrigins],
    dependencies: [...feature.dependencies],
    conflicts: [...feature.conflicts],
    storage: [...feature.storage]
  })));
}

module.exports = { OPTIONAL_PRESENTATION_FEATURES, optionalFeatureCatalog };
