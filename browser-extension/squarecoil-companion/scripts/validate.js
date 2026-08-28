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
assert(BUILD_ID === 'rebuild-b2-trusted-transition-core', 'B2.2 build ID must identify the trusted transition core');
assert(BUILD_STAGE === 'B2.2', 'B2.2 build stage must remain explicit');
assert(JSON.stringify(manifest.permissions || []) === JSON.stringify(['storage', 'scripting', 'webRequest']), 'B2-C permissions must remain storage + scripting + passive webRequest observation only');
assert(JSON.stringify(manifest.host_permissions || []) === JSON.stringify(['https://ussignandmill.squarecoil.net/*']), 'Rebuild host permission must remain limited to the exact SquareCoil tenant');
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

const b2KernelRequired = [
  'src/coordination/coordinator.js',
  'src/data/checkpoint.js',
  'src/data/ledger.js',
  'src/data/migration-command.js',
  'src/data/migration-schema.js',
  'src/data/migration.js',
  'src/data/model.js',
  'src/data/store.js',
  'src/data/workday-zone.js',
  'src/extension/authority-client.js',
  'src/extension/authority-kernel.js',
  'src/extension/authority-protocol.js',
  'src/extension/authority-router.js',
  'src/persistence/chrome-storage.js',
  'src/timer/read-model.js',
  'tests/b2/authority-kernel.test.js',
  'tests/b2/authority-store.test.js',
  'tests/b2/background-authority.test.js',
  'tests/b2/checkpoint.test.js',
  'tests/b2/coordination-kernel.test.js',
  'tests/b2/ledger.test.js',
  'tests/b2/migration-command.test.js',
  'tests/b2/migration.test.js',
  'tests/b2/model.test.js',
  'tests/b2/persistence-authority.test.js',
  'tests/b2/read-model.test.js',
  'tests/b2/workday-zone.test.js',
  'tests/b2-integration/authority-boundary.integration.test.js',
  'tests/b2-integration/authority-router.integration.test.js'
];

const b2TransitionRequired = [
  'src/content/trusted-transition-core.js',
  'src/data/command-dispatcher.js',
  'src/data/legacy-preflight.js',
  'src/squarecoil/bridge-engine.js',
  'src/squarecoil/bridge-parser.js',
  'src/squarecoil/bridge-service.js',
  'src/timer/commands.js',
  'src/timer/service.js',
  'tests/b2/bridge-engine.test.js',
  'tests/b2/bridge-parser.test.js',
  'tests/b2/bridge-service.test.js',
  'tests/b2/command-dispatcher.test.js',
  'tests/b2/legacy-preflight.test.js',
  'tests/b2/timer-service.test.js',
  'tests/b2-integration/bridge-timer.integration.test.js',
  'tests/b2-integration/timer-authority.integration.test.js'
];

for (const file of required) {
  assert(fs.existsSync(path.join(root, file)), `Missing B1 file: ${file}`);
}
for (const file of b2KernelRequired) {
  assert(fs.existsSync(path.join(root, file)), `Missing B2 foundation file: ${file}`);
}
for (const file of b2TransitionRequired) {
  assert(fs.existsSync(path.join(root, file)), `Missing B2.2 transition file: ${file}`);
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

const fixtureDirectories = ['tests/b1', 'tests/b1-integration', 'tests/b1-browser', 'tests/b2', 'tests/b2-integration'];
const fixtureFiles = fixtureDirectories.flatMap(directory => listJavaScriptFiles(path.join(root, directory)));
for (const file of fixtureFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).split(path.sep).join('/');
  assert(!/\b(?:test|it|describe|suite)\s*\.\s*(?:skip|todo|only)\s*\(/.test(source), `Required fixture may not be skipped, todo, or focused: ${relative}`);
  assert(!/\b(?:skip|todo)\s*:/.test(source), `Required fixture may not use skip/todo options: ${relative}`);
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
for (const fixtureId of ['B2-KERNEL-001', 'B2-KERNEL-002']) {
  assert(browserFixtureSource.includes(fixtureId), `B2.1 browser fixture register is missing ${fixtureId}`);
}
for (const fixtureId of Array.from({ length: 5 }, (_, index) => `B2-TRANSITION-${String(index + 1).padStart(3, '0')}`)) {
  assert(browserFixtureSource.includes(fixtureId), `B2.2 browser fixture register is missing ${fixtureId}`);
}

const b2FixtureFiles = [
  ...listJavaScriptFiles(path.join(root, 'tests/b2')),
  ...listJavaScriptFiles(path.join(root, 'tests/b2-integration'))
];
const b2FixtureIdPattern = /\b(?:UT|IT)-B2-(?:[A-Z][A-Z0-9]*-)+\d{2,3}\b/g;
const b2FixtureIds = new Map();
let b2TestCount = 0;
for (const file of b2FixtureFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).split(path.sep).join('/');
  const titles = [...source.matchAll(/\btest\s*\(\s*(['"])([^'"\r\n]+)\1/g)].map(match => match[2]);
  b2TestCount += titles.length;
  for (const title of titles) {
    const match = title.match(b2FixtureIdPattern);
    assert(match && title.startsWith(match[0]), `B2 test title must start with a stable fixture ID in ${relative}: ${title}`);
  }
  for (const match of source.matchAll(b2FixtureIdPattern)) {
    const owners = b2FixtureIds.get(match[0]) || [];
    owners.push(relative);
    b2FixtureIds.set(match[0], owners);
  }
}
for (const [fixtureId, owners] of b2FixtureIds) {
  assert(owners.length === 1, `B2 fixture ID must be unique: ${fixtureId} appears in ${owners.join(', ')}`);
}
assert(b2FixtureIds.size === b2TestCount, `Every B2 test must own exactly one stable fixture ID (${b2FixtureIds.size} IDs for ${b2TestCount} tests)`);
const requiredB2FixtureFamilies = [
  'UT-B2-FENCE-',
  'UT-B2-MIG-',
  'UT-B2-CP-',
  'UT-B2-LEDGER-',
  'UT-B2-MODEL-',
  'UT-B2-ZONE-',
  'UT-B2-READ-',
  'UT-B2-AUTH-',
  'UT-B2-PERSIST-',
  'UT-B2-BRIDGE-',
  'UT-B2-TIMER-',
  'UT-B2-DISPATCH-',
  'IT-B2-AUTH-',
  'IT-B2-PERSIST-',
  'IT-B2-PLATFORM-',
  'IT-B2-TIMER-',
  'IT-B2-BRIDGE-'
];
for (const family of requiredB2FixtureFamilies) {
  assert([...b2FixtureIds.keys()].some(fixtureId => fixtureId.startsWith(family)), `B2 fixture register is missing family ${family}*`);
}

const sourceFiles = listJavaScriptFiles(path.join(root, 'src'));
const authorityStorageKey = 'squarecoilCompanionB2AuthorityV1';
const authorityStorageKeyOwners = sourceFiles.filter(file => fs.readFileSync(file, 'utf8').includes(authorityStorageKey));
assert(authorityStorageKeyOwners.length === 1, 'The B2.1 authoritative storage key must have one source owner');
assert(path.relative(root, authorityStorageKeyOwners[0]).split(path.sep).join('/') === 'src/extension/authority-kernel.js', 'The B2.1 authoritative storage key must be owned by authority-kernel.js');
const backgroundSource = fs.readFileSync(path.join(root, 'src/extension/background-entry.js'), 'utf8');
const contentSource = fs.readFileSync(path.join(root, 'src/content/controller.js'), 'utf8');
const pageSource = fs.readFileSync(path.join(root, 'src/page/entry.js'), 'utf8');
assert(backgroundSource.includes("require('./authority-kernel')"), 'The worker must import the real B2.1 authority kernel');
assert(backgroundSource.includes('const defaultAuthorityInstallation = installDefaultAuthorityAdapter();'), 'The worker must install the B2.1 authority kernel at startup');
assert(background.includes(authorityStorageKey), 'The generated worker bundle must contain the B2.1 authority storage key');
assert(background.includes('authority-web-locks-required'), 'The generated worker bundle must preserve fail-closed cross-context locking');
assert(contentSource.includes("require('../extension/authority-client')"), 'The isolated content controller must own the B2.1 authority client');
assert(contentSource.includes("require('./trusted-transition-core')"), 'The isolated content controller must own the B2.2 trusted transition coordinator');
assert(!contentSource.includes('postMessage'), 'The isolated authority boundary must not use page postMessage');
assert(!pageSource.includes('createAuthorityClient'), 'MAIN-world code must not own an authoritative client');
assert(!fs.existsSync(path.join(root, 'src/extension/authority-page-relay.js')), 'A MAIN-world authority relay must not exist');
const companionBundle = fs.readFileSync(path.join(root, 'dist/companion-app.js'), 'utf8');
const contentBundle = fs.readFileSync(path.join(root, 'dist/content-controller.js'), 'utf8');
assert(!companionBundle.includes('src/extension/authority-client.js'), 'The MAIN bundle must not package the authority client');
assert(!companionBundle.includes('src/squarecoil/bridge-service.js'), 'The MAIN bundle must not package the live Bridge service');
assert(!companionBundle.includes('src/timer/service.js'), 'The MAIN bundle must not package the Timer writer');
assert(contentBundle.includes('src/extension/authority-client.js'), 'The isolated content bundle must package the authority client');
assert(contentBundle.includes('src/content/trusted-transition-core.js'), 'The isolated content bundle must package the trusted B2.2 coordinator');
assert(contentBundle.includes('src/squarecoil/bridge-service.js'), 'The isolated content bundle must package the read-only Bridge service');
assert(contentBundle.includes("const ACTION_7_BODY = 'action=7'"), 'The packaged Bridge must retain the exact read-only action-7 body');
assert(!contentBundle.includes('createTimerCommandHandler'), 'The isolated content bundle must not package the Timer writer implementation');
assert(!contentBundle.includes('createMigrationCommandHandler'), 'The isolated content bundle must not package migration execution');
assert(background.includes('EXTENSION_WEBREQUEST_COMPLETION'), 'B2-C worker must package native webRequest completion observation');
assert(contentBundle.includes('VERIFICATION_FALLBACK'), 'B2-C must report reduced capability when completion observation is unavailable');
assert(!/action=(?:2|3|4)(?:\D|$)/.test(contentBundle), 'B2.2 packaged Bridge must not issue native SquareCoil mutation actions');
assert(!/localStorage\.(?:setItem|removeItem|clear)\s*\(/.test(contentBundle), 'B2.2 legacy preflight must remain read-only');
assert(!contentBundle.includes('squarecoil-companion-authority-v1'), 'The isolated content bundle must not expose the retired page authority channel');
assert(companionBundle.includes('coordination-not-implemented-b1'), 'B2.2 must retain the intentionally non-positive lifecycle reason');

const serializedManifest = JSON.stringify(manifest);
assert(!serializedManifest.includes('raw.githubusercontent.com'), 'B1 manifest should not request raw GitHub host permission');
assert(!serializedManifest.includes('i.imgur.com'), 'B1 manifest should not request image host permission');

console.log(`B2.2 trusted transition-core validation passed for SquareCoil Companion v${manifest.version}`);
console.log(`Canonical build identity: ${BUILD_ID} (${BUILD_STAGE}).`);
console.log('The worker owns one fenced authority kernel; only the isolated content controller owns its versioned client transport.');
console.log(`Fixture register validated: ${unitFixtureMappings.length} B1 A2 mappings, ${requiredIntegrationFixtures.length} B1 A3 IDs, ${requiredBrowserFixtures.length} B1 A4 IDs, 2 B2.1 A4 IDs, 5 B2.2 A4 IDs, ${b2FixtureIds.size} B2 stable IDs including B2.2 Bridge/Timer families; no skipped/todo/focused fixtures.`);
