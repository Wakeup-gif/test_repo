'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { PACKAGE_FILES, CANDIDATE_EMBEDDED_BUNDLES, copyPackageFiles, assertExactPackageFiles } = require('../../scripts/package-inventory');

const root = path.resolve(__dirname, '..', '..');
const repositoryRoot = path.resolve(root, '..', '..');
const read = relative => fs.readFileSync(path.join(root, ...relative.split('/')), 'utf8');

test('UT-B6-PKG-001 one canonical inventory drives build validation browser packaging and CI', () => {
  assert.equal(PACKAGE_FILES.length, 11);
  assert.equal(new Set(PACKAGE_FILES).size, PACKAGE_FILES.length);
  assert.deepEqual(CANDIDATE_EMBEDDED_BUNDLES, [
    'dist/background.js',
    'dist/companion-app.js',
    'dist/content-controller.js',
    'dist/presentation-bootstrap.js'
  ]);
  for (const source of ['scripts/build.js', 'scripts/validate.js', 'scripts/validate-package.js', 'tests/b1-browser/run.js']) {
    assert.match(read(source), /package-inventory/);
  }
  const workflow = fs.readFileSync(path.join(repositoryRoot, '.github', 'workflows', 'squarecoil-extension-validate.yml'), 'utf8');
  assert.match(workflow, /scripts\/package-inventory\.js" --copy-to/);

  const destination = fs.mkdtempSync(path.join(os.tmpdir(), 'squarecoil-package-inventory-test-'));
  try {
    copyPackageFiles(root, destination);
    assert.deepEqual(assertExactPackageFiles(destination), [...PACKAGE_FILES].sort());
  } finally {
    fs.rmSync(destination, { recursive: true, force: true });
  }
});
