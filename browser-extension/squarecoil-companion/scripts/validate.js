'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { BUILD_ID, BUILD_STAGE } = require('../src/core/build-identity');
const { computeCandidateFingerprint } = require('./candidate-identity');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const release = JSON.parse(fs.readFileSync(path.join(root, 'release.json'), 'utf8'));
const packageMetadata = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const buildInfo = JSON.parse(fs.readFileSync(path.join(root, 'dist/build-info.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(manifest.manifest_version === 3, 'manifest_version must be 3');
assert(manifest.version === release.latestVersion, `manifest version ${manifest.version} must match release metadata ${release.latestVersion}`);
assert(manifest.version === packageMetadata.version, `manifest version ${manifest.version} must match package metadata ${packageMetadata.version}`);
assert(JSON.stringify(manifest.permissions || []) === JSON.stringify(['storage', 'scripting']), 'B1 permissions must remain storage + scripting only');
assert(JSON.stringify(manifest.host_permissions || []) === JSON.stringify(['https://ussignandmill.squarecoil.net/*']), 'B1 host permission must remain limited to the exact SquareCoil tenant');
assert(JSON.stringify(Object.keys(manifest.background || {}).sort()) === JSON.stringify(['service_worker']), 'B1 background policy must contain only the service worker entry');
assert(manifest.background?.service_worker === 'dist/background.js', 'B1 manifest must use generated dist/background.js');
assert(manifest.action?.default_popup === 'popup/popup.html', 'B1 popup path must be explicit');
assert(buildInfo.buildId === BUILD_ID, 'dist build-info buildId must match canonical BUILD_ID');
assert(buildInfo.stage === BUILD_STAGE, 'dist build-info stage must match canonical BUILD_STAGE');
assert(/^[0-9a-f]{64}$/.test(buildInfo.candidateFingerprint), 'dist build-info must contain a concrete candidate fingerprint');
assert(buildInfo.candidateFingerprint === computeCandidateFingerprint(root), 'dist build-info candidate fingerprint must match the exact runtime/package inputs');
assert(buildInfo.packageVersion === manifest.version, 'dist build-info package version must match manifest');
assert(/^[0-9a-f]{40}$/.test(buildInfo.sourceSha), 'dist build-info must contain a concrete Git source SHA');
assert(typeof buildInfo.sourceDirty === 'boolean', 'dist build-info must state whether source bytes were dirty');
const gitHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim().toLowerCase();
assert(buildInfo.sourceSha === gitHead, `dist build-info source SHA ${buildInfo.sourceSha} must match authoritative Git HEAD ${gitHead}`);

const contentScripts = manifest.content_scripts || [];
assert(contentScripts.length === 1, 'B1 expects exactly one content controller entry');
assert(JSON.stringify(Object.keys(contentScripts[0]).sort()) === JSON.stringify(['all_frames', 'js', 'match_about_blank', 'matches', 'run_at']), 'B1 content controller policy contains unexpected fields');
assert(JSON.stringify(contentScripts[0].js || []) === JSON.stringify(['dist/content-controller.js']), 'B1 content script must use dist/content-controller.js only');
assert((contentScripts[0].css || []).length === 0, 'B1 must not preload legacy website-theme CSS');
assert(contentScripts[0].run_at === 'document_start', 'B1 content controller must start at document_start');
assert(contentScripts[0].all_frames === false, 'B1 content controller must be top-frame only');
assert(contentScripts[0].match_about_blank === false, 'B1 content controller must not enter about:blank frames');
assert(JSON.stringify(contentScripts[0].matches || []) === JSON.stringify(['https://ussignandmill.squarecoil.net/*']), 'B1 content match must remain limited to the exact SquareCoil tenant');

const required = [
  'dist/background.js',
  'dist/companion-app.js',
  'dist/content-controller.js',
  'dist/popup.js',
  'dist/build-info.json',
  'popup/popup.html',
  'popup/popup.css',
  'src/core/build-identity.js',
  'src/core/document-eligibility.js',
  'src/core/lifecycle.js',
  'src/core/runtime-probe.js',
  'src/core/feature-registry.js',
  'src/platform/runtime-ui.js',
  'src/squarecoil/bridge-shell.js',
  'tests/b1/background-entry.test.js',
  'tests/b1/document-eligibility.test.js',
  'tests/b1/feature-registry.test.js',
  'tests/b1/lifecycle.test.js',
  'tests/b1/runtime-probe.test.js',
  'tests/b1/runtime-ui.test.js',
  'tests/b1/popup.test.js',
  'tests/b1-integration/harness.js',
  'tests/b1-integration/lifecycle.integration.test.js',
  'tests/b1-browser/README.md',
  'tests/b1-browser/run.js',
  'scripts/validate-package.js',
  'scripts/candidate-identity.js'
];

for (const file of required) {
  assert(fs.existsSync(path.join(root, file)), `Missing B1 file: ${file}`);
}

const background = fs.readFileSync(path.join(root, 'dist/background.js'), 'utf8');
assert(/["']dist\/companion-app\.js["']/.test(background), 'B1 background bundle must contain the local companion-app.js injection dependency');
for (const name of ['background.js', 'companion-app.js', 'content-controller.js']) {
  const source = fs.readFileSync(path.join(root, 'dist', name), 'utf8');
  assert(source.includes(buildInfo.candidateFingerprint), `dist/${name} must embed the exact candidate fingerprint`);
}
const generatedBundles = ['background.js', 'companion-app.js', 'content-controller.js', 'popup.js']
  .map(name => fs.readFileSync(path.join(root, 'dist', name), 'utf8'));
for (const legacy of ['page/timer-runtime.js', 'page/timer-controls.js', 'page/timer-workspace.js', 'page/timer-surface.js']) {
  assert(generatedBundles.every(source => !source.includes(legacy)), `B1 generated code still references legacy module: ${legacy}`);
}

for (const [index, source] of generatedBundles.entries()) {
  assert(!/\beval\s*\(/.test(source), `Generated bundle ${index} must not use eval`);
  assert(!/\bnew\s+Function\s*\(/.test(source), `Generated bundle ${index} must not construct executable code`);
  assert(!/\bimportScripts\s*\(/.test(source), `Generated bundle ${index} must not load remote executable code`);
  assert(!/\bimport\s*\(/.test(source), `Generated bundle ${index} must not use dynamic import`);
}

const manifestReferences = [
  manifest.background.service_worker,
  manifest.action.default_popup,
  ...contentScripts.flatMap(entry => [...(entry.js || []), ...(entry.css || [])])
];
for (const reference of manifestReferences) {
  assert(typeof reference === 'string' && !reference.includes('..'), `Unsafe manifest reference: ${reference}`);
  assert(fs.existsSync(path.join(root, reference)), `Manifest reference is missing: ${reference}`);
}

const popupHtml = fs.readFileSync(path.join(root, 'popup/popup.html'), 'utf8');
assert(!/<base\b/i.test(popupHtml), 'B1 popup must not redefine its local base URL');
assert(!/<(?:iframe|object|embed)\b/i.test(popupHtml), 'B1 popup must not embed executable documents or plugins');
assert(!/\son[a-z]+\s*=/i.test(popupHtml), 'B1 popup must not use inline event handlers');
assert(!/javascript\s*:/i.test(popupHtml), 'B1 popup must not use javascript: URLs');
assert(!/\b(?:src|href)\s*=\s*["']\s*(?:https?:)?\/\//i.test(popupHtml), 'B1 popup executable/style references must be local');
const popupScripts = [...popupHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
assert(popupScripts.length === 1 && (popupHtml.match(/<script\b/gi) || []).length === 1, 'B1 popup must contain exactly one closed script tag');
assert(/^\s*src\s*=\s*(["'])\.\.\/dist\/popup\.js\1\s*$/.test(popupScripts[0][1]), 'B1 popup must load only ../dist/popup.js');
assert(popupScripts[0][2].trim() === '', 'B1 popup must not contain inline JavaScript');
const popupLinks = [...popupHtml.matchAll(/<link\b([^>]*)>/gi)];
assert(popupLinks.length === 1, 'B1 popup must contain exactly one local stylesheet link');
assert(/\brel\s*=\s*(["'])stylesheet\1/i.test(popupLinks[0][1]), 'B1 popup link must be a stylesheet');
assert(/\bhref\s*=\s*(["'])popup\.css\1/i.test(popupLinks[0][1]), 'B1 popup must load only popup.css');

function listJavaScriptFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listJavaScriptFiles(absolute));
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(absolute);
  }
  return files;
}

const fixtureDirectories = ['tests/b1', 'tests/b1-integration', 'tests/b1-browser'];
const fixtureFiles = fixtureDirectories.flatMap(directory => listJavaScriptFiles(path.join(root, directory)));
for (const file of fixtureFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).split(path.sep).join('/');
  assert(!/\b(?:test|it|describe|suite)\s*\.\s*(?:skip|todo|only)\s*\(/.test(source), `Required B1 fixture may not be skipped, todo, or focused: ${relative}`);
  assert(!/\b(?:skip|todo)\s*:/.test(source), `Required B1 fixture may not use skip/todo options: ${relative}`);
}

const unitFixtureMappings = [
  ['B1-LC-001', 'tests/b1/lifecycle.test.js', 'READY requires all L1 readiness assertions including ownership and positive coordination'],
  ['B1-LC-002', 'tests/b1/lifecycle.test.js', 'recover can return a known runtime to READY without creating another lifecycle owner'],
  ['B1-LC-003', 'tests/b1/runtime-probe.test.js', 'visible READY root with dead interaction is degraded, never healthy'],
  ['B1-LC-004', 'tests/b1/runtime-probe.test.js', 'orphan recovery requires concrete current-build and current-document ownership proof'],
  ['B1-LC-006', 'tests/b1/lifecycle.test.js', 're-enable during teardown waits for the lock and retires the old Runtime Instance ID'],
  ['B1-LC-007', 'tests/b1/lifecycle.test.js', 'UT-B1-LC-23 keeps failed cleanup sticky and retries only outstanding ownership'],
  ['B1-LC-009', 'tests/b1/background-entry.test.js', 'a stale disable message cannot tear down a runtime after the authoritative setting is enabled'],
  ['B1-LC-011', 'tests/b1/background-entry.test.js', 'concurrent persistence preflights use isolated probe keys'],
  ['B1-LC-012', 'tests/b1/runtime-probe.test.js', 'present but unreadable runtime global is an ownership conflict, not a fresh page'],
  ['B1-LC-013', 'tests/b1/document-eligibility.test.js', 'B1-LC-013 accepts only the exact HTTPS SquareCoil origin'],
  ['B1-LC-016', 'tests/b1/runtime-probe.test.js', 'different rebuild build requires version-mismatch handling']
];
for (const [fixtureId, file, marker] of unitFixtureMappings) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert(source.includes(marker), `A2 fixture ${fixtureId} lost its mapped regression in ${file}`);
}

function collectStableFixtureIds(source) {
  const identifiers = new Set();
  for (const match of source.matchAll(/B1-LC-(\d{3}(?:(?:\/|-)\d{3})*)/g)) {
    for (const suffix of match[1].split(/[\/-]/)) identifiers.add(`B1-LC-${suffix}`);
  }
  return identifiers;
}

const integrationFixtureIds = collectStableFixtureIds(fs.readFileSync(path.join(root, 'tests/b1-integration/lifecycle.integration.test.js'), 'utf8'));
const browserFixtureSource = [
  fs.readFileSync(path.join(root, 'tests/b1-browser/run.js'), 'utf8'),
  fs.readFileSync(path.join(root, 'tests/b1-browser/README.md'), 'utf8')
].join('\n');
const browserFixtureIds = collectStableFixtureIds(browserFixtureSource);
const requiredIntegrationFixtures = Array.from({ length: 16 }, (_, index) => `B1-LC-${String(index + 1).padStart(3, '0')}`);
const requiredBrowserFixtures = [
  ...Array.from({ length: 10 }, (_, index) => `B1-LC-${String(index + 1).padStart(3, '0')}`),
  ...Array.from({ length: 7 }, (_, index) => `B1-LC-${String(index + 12).padStart(3, '0')}`)
];
for (const fixtureId of requiredIntegrationFixtures) {
  assert(integrationFixtureIds.has(fixtureId), `A3 fixture register is missing ${fixtureId}`);
}
for (const fixtureId of requiredBrowserFixtures) {
  assert(browserFixtureIds.has(fixtureId), `A4 Chrome/Edge fixture register is missing ${fixtureId}`);
}

const serializedManifest = JSON.stringify(manifest);
assert(!serializedManifest.includes('raw.githubusercontent.com'), 'B1 manifest should not request raw GitHub host permission');
assert(!serializedManifest.includes('i.imgur.com'), 'B1 manifest should not request image host permission');

console.log(`B1 validation passed for SquareCoil Companion v${manifest.version}`);
console.log(`Canonical build identity: ${BUILD_ID} (${BUILD_STAGE}).`);
console.log('Lifecycle shell uses one generated MAIN-world application bundle and one isolated content controller.');
console.log(`Fixture register validated: ${unitFixtureMappings.length} A2 mappings, ${requiredIntegrationFixtures.length} A3 IDs, ${requiredBrowserFixtures.length} A4 IDs; no skipped/todo/focused fixtures.`);
