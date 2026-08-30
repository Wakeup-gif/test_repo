'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const read = relative => fs.readFileSync(path.join(root, ...relative.split('/')), 'utf8');

test('UT-B5-THEME-020 authoritative Glass ports preserve the pinned source layers without remote executable or style dependencies', () => {
  const dark = read('src/presentation/ports/dark-glass.css');
  const light = read('src/presentation/ports/light-glass.css');
  for (const css of [dark, light]) {
    assert.match(css, /Presentation-only port of the pinned SquareCoil Tampermonkey source chain/);
    assert.match(css, /0e6e6ef36534b33383358b4223ae1ae9054848aa/);
    assert.match(css, /b0a89382eabdbcb873b3f8d20bcacb05ada7b63c/);
    assert.doesNotMatch(css, /@import|raw\.githubusercontent\.com|fonts\.googleapis\.com|www\.bing\.com/);
    assert.match(css, /#squarecoil-companion-cinematic-host/);
    assert.match(css, /data:image\/svg\+xml/);
  }
  assert.match(dark, /html\.us-sign-v230/);
  assert.match(dark, /Theme-v2\.3\.4\.user\.js/);
  assert.match(light, /html\.us-sign-v240\.us-sign-theme-light-glass/);
  assert.match(light, /Light-Glass-Theme-v1\.0\.0\.user\.js/);
  assert.match(light, /Companion compatibility delta/);
  assert.match(light, /html\.us-sign-v240 body #content :is\(\.panel-body,\.panel-footer,\.table-responsive\)/);
});

test('UT-B5-THEME-021 document start orders the bounded fail-open presentation bootstrap before authority startup', () => {
  const manifest = JSON.parse(read('manifest.json'));
  assert.deepEqual(manifest.content_scripts[0].js, ['dist/presentation-bootstrap.js', 'dist/content-controller.js']);
  assert.equal(manifest.content_scripts[0].run_at, 'document_start');
  const source = read('src/content/presentation-bootstrap.js');
  assert.match(source, /GUARD_BUDGET_MS = 1400/);
  assert.match(source, /visibility:hidden!important/);
  assert.match(source, /releaseGuard\('budget-expired'\)/);
  assert.doesNotMatch(source, /MutationObserver/);
});

test('UT-B5-THEME-022 wallpaper paint uses the authoritative custom property above a transparent isolated page canvas', () => {
  const dark = read('src/presentation/ports/dark-glass.css');
  const cinematic = read('src/presentation/cinematic-background.js');
  assert.match(dark, /body\s*\{[\s\S]*?isolation:\s*isolate\s*!important/);
  assert.match(dark, /html body #main,[\s\S]*?background:\s*transparent\s*!important/);
  assert.match(dark, /var\(--us-squarecoil-cine-image\)\s*!important/);
  assert.match(cinematic, /setProperty\?\.\('--us-squarecoil-cine-image'/);
  assert.match(cinematic, /z-index:-1/);
});

test('UT-B5-THEME-023 Native teardown owns every imported theme marker and removes the generated style atomically', () => {
  const source = read('src/content/presentation-bootstrap.js');
  for (const marker of ['us-sign-v230', 'us-sign-v240', 'us-sign-theme-dark-glass', 'us-sign-theme-light-glass']) {
    assert.match(source, new RegExp(marker));
  }
  assert.match(source, /data-squarecoil-companion-theme-port/);
  assert.match(source, /=== 'authoritative'\) style\.remove/);
  assert.match(source, /markers\.remove\(\)/);
  assert.match(source, /clearSourceMarkers\(\)/);
});

test('UT-B5-THEME-024 presentation bootstrap keeps exact routes and cannot erase a later Refined Light owner', () => {
  const source = read('src/content/presentation-bootstrap.js');
  assert.match(source, /ROUTES\.find\(\(\[suffix\]\) => path === suffix\)/);
  assert.doesNotMatch(source, /path\.endsWith\(suffix\)/);
  assert.doesNotMatch(source, /path\.includes\('report'\)/);
  const markers = read('src/presentation/presentation-markers.js');
  assert.doesNotMatch(markers, /pathname\.endsWith\(/);
  assert.match(source, /rootTheme === activeTheme \|\| GLASS_THEMES\.has\(rootTheme\)/);
  assert.match(source, /clearSourceMarkers\(\{ forceRoot: true \}\)/);
});

test('UT-B5-THEME-025 authoritative Glass ports hide Companion-owned presentation from print output', () => {
  for (const file of ['src/presentation/ports/dark-glass.css', 'src/presentation/ports/light-glass.css']) {
    const css = read(file);
    assert.match(css, /Companion integration delta/);
    assert.match(css, /@media print[\s\S]*#ussign-job-timer[\s\S]*display:\s*none\s*!important/);
    assert.match(css, /@media print[\s\S]*#squarecoil-companion-cinematic-host[\s\S]*display:\s*none\s*!important/);
  }
});
