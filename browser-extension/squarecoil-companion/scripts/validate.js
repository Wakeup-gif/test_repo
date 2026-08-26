'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const release = JSON.parse(fs.readFileSync(path.join(root, 'release.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(manifest.manifest_version === 3, 'manifest_version must be 3');
assert(manifest.version === release.latestVersion, `manifest version ${manifest.version} must match release metadata ${release.latestVersion}`);
assert(manifest.background?.service_worker === 'dist/background.js', 'B1 manifest must use generated dist/background.js');

const contentScripts = manifest.content_scripts || [];
assert(contentScripts.length === 1, 'B1 expects exactly one content controller entry');
assert(JSON.stringify(contentScripts[0].js || []) === JSON.stringify(['dist/content-controller.js']), 'B1 content script must use dist/content-controller.js only');
assert((contentScripts[0].css || []).length === 0, 'B1 must not preload legacy website-theme CSS');

const required = [
  'dist/background.js',
  'dist/companion-app.js',
  'dist/content-controller.js',
  'dist/popup.js',
  'popup/popup.html',
  'popup/popup.css',
  'src/core/lifecycle.js',
  'src/core/runtime-probe.js',
  'src/core/feature-registry.js',
  'src/platform/runtime-ui.js',
  'src/squarecoil/bridge-shell.js',
  'tests/b1/lifecycle.test.js',
  'tests/b1/runtime-probe.test.js'
];

for (const file of required) {
  assert(fs.existsSync(path.join(root, file)), `Missing B1 file: ${file}`);
}

const background = fs.readFileSync(path.join(root, 'dist/background.js'), 'utf8');
for (const legacy of ['page/timer-runtime.js', 'page/timer-controls.js', 'page/timer-workspace.js', 'page/timer-surface.js']) {
  assert(!background.includes(legacy), `B1 background still injects legacy module: ${legacy}`);
}

const serializedManifest = JSON.stringify(manifest);
assert(!serializedManifest.includes('raw.githubusercontent.com'), 'B1 manifest should not request raw GitHub host permission');
assert(!serializedManifest.includes('i.imgur.com'), 'B1 manifest should not request image host permission');

console.log(`B1 validation passed for SquareCoil Companion v${manifest.version}`);
console.log('Lifecycle shell uses one generated MAIN-world application bundle and one isolated content controller.');
