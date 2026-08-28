'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const CANONICAL_BUILD_ID = 'rebuild-b2-ready-settlement';
const CANONICAL_STAGE = 'B2-C';
const FIXTURE_ORIGIN = 'https://ussignandmill.squarecoil.net';
const FIXTURE_PATH = '/__b1_fixture__/a4.html';
const FRAME_PATH = '/__b1_fixture__/frame.html';
const UNSUPPORTED_URL = 'data:text/html,<meta charset="utf-8"><title>A4 unsupported document</title><p>Synthetic unsupported document</p>';
const ROOT_ID = 'ussign-job-timer';
const RUNTIME_KEY = '__squareCoilCompanionRuntime';
const CLAIM_KEY = '__squareCoilCompanionInjectionClaim';
const BOOTSTRAP_KEY = '__squareCoilCompanionBootstrap';
const DOCUMENT_TOKEN_DATASET_KEY = 'squarecoilCompanionDocumentToken';
const AUTHORITY_STORAGE_KEY = 'squarecoilCompanionB2AuthorityV1';
const EXPECTED_DEGRADED_REASON = 'coordination-not-implemented-b1';
const REQUIRED_A4_STABLE_FIXTURE_IDS = Object.freeze([
  'B1-LC-001',
  'B1-LC-002',
  'B1-LC-003',
  'B1-LC-004',
  'B1-LC-005',
  'B1-LC-006',
  'B1-LC-007',
  'B1-LC-008',
  'B1-LC-009',
  'B1-LC-010',
  'B1-LC-012',
  'B1-LC-013',
  'B1-LC-014',
  'B1-LC-015',
  'B1-LC-016',
  'B1-LC-017',
  'B1-LC-018'
]);
const REQUIRED_B2_1_A4_FIXTURE_IDS = Object.freeze([
  'B2-KERNEL-001',
  'B2-KERNEL-002'
]);
const REQUIRED_B2_2_A4_FIXTURE_IDS = Object.freeze([
  'B2-TRANSITION-001',
  'B2-TRANSITION-002',
  'B2-TRANSITION-003',
  'B2-TRANSITION-004',
  'B2-TRANSITION-005'
]);
const REQUIRED_B2_READY_A4_FIXTURE_IDS = Object.freeze([
  'B2-READY-001',
  'B2-READY-002',
  'B2-READY-003'
]);
const REQUIRED_PACKAGE_FILES = Object.freeze([
  'dist/background.js',
  'dist/build-info.json',
  'dist/companion-app.js',
  'dist/content-controller.js',
  'dist/popup.js',
  'manifest.json',
  'popup/popup.css',
  'popup/popup.html'
]);
const CANDIDATE_EMBEDDED_BUNDLES = Object.freeze([
  'dist/background.js',
  'dist/companion-app.js',
  'dist/content-controller.js'
]);
const MESSAGES = Object.freeze({
  BOOT: 'SC_COMPANION_BOOT',
  HEALTH: 'SC_COMPANION_GET_HEALTH',
  ENABLE: 'SC_COMPANION_SET_ENABLED',
  REVALIDATE: 'SC_COMPANION_REVALIDATE',
  RETRY: 'SC_COMPANION_RETRY_TEARDOWN'
});
const BROWSER_DEFAULTS = Object.freeze({
  chrome: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  edge: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
});

class UnsupportedCase extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsupportedCase';
  }
}

function parseArguments(argv) {
  const options = {
    packageDirectory: null,
    archivePath: null,
    expectedSourceSha: null,
    browsers: ['chrome', 'edge'],
    evidencePath: null,
    headed: false,
    allowDirtyDevelopment: false,
    timeoutMs: 20000,
    executables: { ...BROWSER_DEFAULTS }
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (!next || next.startsWith('--')) throw new Error(`Missing value for ${argument}`);
      index += 1;
      return next;
    };
    if (argument === '--package') options.packageDirectory = path.resolve(value());
    else if (argument === '--archive') options.archivePath = path.resolve(value());
    else if (argument === '--expected-source-sha') options.expectedSourceSha = value();
    else if (argument === '--browser') {
      const selected = value().toLowerCase();
      options.browsers = selected === 'all' ? ['chrome', 'edge'] : [selected];
    } else if (argument === '--evidence') options.evidencePath = path.resolve(value());
    else if (argument === '--chrome-executable') options.executables.chrome = path.resolve(value());
    else if (argument === '--edge-executable') options.executables.edge = path.resolve(value());
    else if (argument === '--timeout') options.timeoutMs = Number(value());
    else if (argument === '--headed') options.headed = true;
    else if (argument === '--allow-dirty-development') options.allowDirtyDevelopment = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (options.help) return options;
  if (!options.packageDirectory) throw new Error('--package is required');
  if (!options.archivePath) throw new Error('--archive is required');
  if (!/^[0-9a-f]{40}$/.test(String(options.expectedSourceSha || ''))) {
    throw new Error('--expected-source-sha must be an exact lowercase 40-character Git SHA');
  }
  if (!options.browsers.every(browser => ['chrome', 'edge'].includes(browser))) {
    throw new Error('--browser must be chrome, edge, or all');
  }
  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs < 1000 || options.timeoutMs > 120000) {
    throw new Error('--timeout must be between 1000 and 120000 milliseconds');
  }
  return options;
}

function usage() {
  return [
    'Usage:',
    '  node tests/b1-browser/run.js --package <exact-unpacked-directory> --archive <exact-zip> --expected-source-sha <sha> [options]',
    '',
    'Options:',
    '  --browser chrome|edge|all       Default: all',
    '  --archive <zip-path>             ZIP whose file bytes must equal the extracted package',
    '  --expected-source-sha <sha>      Required exact lowercase commit identity',
    '  --evidence <json-path>          Also write the complete JSON result',
    '  --headed                        Show browser windows',
    '  --timeout <milliseconds>         Per-condition timeout (default 20000)',
    '  --chrome-executable <path>       Override branded Chrome executable',
    '  --edge-executable <path>         Override branded Edge executable',
    '  --allow-dirty-development        Permit dirty bytes and label the run NON_ACCEPTANCE'
  ].join('\n');
}

function sha256(contents) {
  return crypto.createHash('sha256').update(contents).digest('hex');
}

function stableJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
}

function jsonSha256(value) {
  return sha256(Buffer.from(stableJson(value)));
}

function slash(value) {
  return value.split(path.sep).join('/');
}

function listFiles(directory, prefix = '') {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(absolute, relative));
    else if (entry.isFile()) files.push(slash(relative));
    else throw new Error(`Unsupported package entry: ${relative}`);
  }
  return files.sort();
}

function inventoryPackage(packageDirectory) {
  if (!fs.existsSync(packageDirectory) || !fs.statSync(packageDirectory).isDirectory()) {
    throw new Error(`Package directory does not exist: ${packageDirectory}`);
  }
  const files = listFiles(packageDirectory);
  const required = [...REQUIRED_PACKAGE_FILES].sort();
  if (JSON.stringify(files) !== JSON.stringify(required)) {
    throw new Error(`Exact package allowlist mismatch. Actual files: ${files.join(', ')}`);
  }
  const inventory = files.map(relative => {
    const contents = fs.readFileSync(path.join(packageDirectory, ...relative.split('/')));
    return { path: relative, bytes: contents.length, sha256: sha256(contents) };
  });
  const inventoryDigest = sha256(Buffer.from(inventory.map(item => `${item.sha256}  ${item.bytes}  ${item.path}`).join('\n') + '\n'));
  const manifest = JSON.parse(fs.readFileSync(path.join(packageDirectory, 'manifest.json'), 'utf8'));
  const buildInfo = JSON.parse(fs.readFileSync(path.join(packageDirectory, 'dist', 'build-info.json'), 'utf8'));
  const candidateFingerprint = String(buildInfo.candidateFingerprint || '');
  const candidateEmbeddingCounts = Object.fromEntries(CANDIDATE_EMBEDDED_BUNDLES.map(relative => {
    const code = fs.readFileSync(path.join(packageDirectory, ...relative.split('/')), 'utf8');
    const count = candidateFingerprint ? code.split(candidateFingerprint).length - 1 : 0;
    return [relative, count];
  }));
  return { files: inventory, inventoryDigest, manifest, buildInfo, candidateEmbeddingCounts };
}

function validatePackageIdentity(inventory, options) {
  const { manifest, buildInfo } = inventory;
  if (manifest.manifest_version !== 3) throw new Error('A4 requires a Manifest V3 package');
  if (manifest.background?.service_worker !== 'dist/background.js') throw new Error('A4 requires dist/background.js as the service worker');
  if (buildInfo.buildId !== CANONICAL_BUILD_ID) throw new Error(`A4 requires canonical buildId ${CANONICAL_BUILD_ID}`);
  if (buildInfo.stage !== CANONICAL_STAGE) throw new Error(`A4 requires canonical stage ${CANONICAL_STAGE}`);
  if (!/^[0-9a-f]{64}$/.test(String(buildInfo.candidateFingerprint || ''))) {
    throw new Error('A4 requires a concrete lowercase 64-character candidateFingerprint');
  }
  for (const relative of CANDIDATE_EMBEDDED_BUNDLES) {
    if (inventory.candidateEmbeddingCounts[relative] < 1) {
      throw new Error(`${relative} does not embed the packaged candidateFingerprint`);
    }
  }
  if (!/^[0-9a-f]{40}$/.test(String(buildInfo.sourceSha || ''))) throw new Error('A4 requires a concrete lowercase 40-character source SHA');
  if (buildInfo.sourceSha !== options.expectedSourceSha) {
    throw new Error(`Packaged source SHA ${buildInfo.sourceSha || '(missing)'} does not exactly match --expected-source-sha ${options.expectedSourceSha}`);
  }
  if (buildInfo.packageVersion !== manifest.version) throw new Error('Package and build-info versions differ');
  if (typeof buildInfo.sourceDirty !== 'boolean') throw new Error('Packaged build-info sourceDirty must be a boolean');
  if (buildInfo.sourceDirty !== false && !options.allowDirtyDevelopment) {
    throw new Error('A4 acceptance refuses a package built from dirty source bytes');
  }
}

function findEndOfCentralDirectory(buffer) {
  const minimum = Math.max(0, buffer.length - 0xffff - 22);
  for (let offset = buffer.length - 22; offset >= minimum; offset -= 1) {
    if (buffer.readUInt32LE(offset) !== 0x06054b50) continue;
    const commentLength = buffer.readUInt16LE(offset + 20);
    if (offset + 22 + commentLength === buffer.length) return offset;
  }
  throw new Error('Archive is not a supported ZIP: end-of-central-directory record missing');
}

function safeArchiveEntryPath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!normalized || normalized.includes('\0') || normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized)) {
    throw new Error(`Archive contains an unsafe path: ${JSON.stringify(value)}`);
  }
  const parts = normalized.split('/').filter(Boolean);
  if (parts.some(part => part === '.' || part === '..')) throw new Error(`Archive contains path traversal: ${normalized}`);
  return normalized;
}

function readZipFileEntries(archivePath) {
  if (!fs.existsSync(archivePath) || !fs.statSync(archivePath).isFile()) {
    throw new Error(`Archive does not exist: ${archivePath}`);
  }
  if (path.extname(archivePath).toLowerCase() !== '.zip') throw new Error('A4 --archive must be a .zip file');
  const archiveBytes = fs.readFileSync(archivePath);
  const eocd = findEndOfCentralDirectory(archiveBytes);
  const diskNumber = archiveBytes.readUInt16LE(eocd + 4);
  const centralDisk = archiveBytes.readUInt16LE(eocd + 6);
  const diskEntries = archiveBytes.readUInt16LE(eocd + 8);
  const totalEntries = archiveBytes.readUInt16LE(eocd + 10);
  const centralSize = archiveBytes.readUInt32LE(eocd + 12);
  const centralOffset = archiveBytes.readUInt32LE(eocd + 16);
  if (diskNumber !== 0 || centralDisk !== 0 || diskEntries !== totalEntries) throw new Error('Multi-disk ZIP archives are not supported');
  if (totalEntries === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff) throw new Error('ZIP64 archives are not supported');
  if (centralOffset + centralSize > eocd) throw new Error('ZIP central directory bounds are invalid');

  const entries = [];
  const seenNames = new Set();
  let cursor = centralOffset;
  for (let index = 0; index < totalEntries; index += 1) {
    if (cursor + 46 > archiveBytes.length || archiveBytes.readUInt32LE(cursor) !== 0x02014b50) {
      throw new Error(`ZIP central entry ${index + 1} is malformed`);
    }
    const flags = archiveBytes.readUInt16LE(cursor + 8);
    const method = archiveBytes.readUInt16LE(cursor + 10);
    const compressedSize = archiveBytes.readUInt32LE(cursor + 20);
    const uncompressedSize = archiveBytes.readUInt32LE(cursor + 24);
    const nameLength = archiveBytes.readUInt16LE(cursor + 28);
    const extraLength = archiveBytes.readUInt16LE(cursor + 30);
    const commentLength = archiveBytes.readUInt16LE(cursor + 32);
    const localOffset = archiveBytes.readUInt32LE(cursor + 42);
    if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff || localOffset === 0xffffffff) {
      throw new Error('ZIP64 entries are not supported');
    }
    const nameStart = cursor + 46;
    const nameEnd = nameStart + nameLength;
    if (nameEnd + extraLength + commentLength > archiveBytes.length) throw new Error('ZIP central entry exceeds archive bounds');
    const name = safeArchiveEntryPath(archiveBytes.subarray(nameStart, nameEnd).toString('utf8'));
    cursor = nameEnd + extraLength + commentLength;
    if (name.endsWith('/')) continue;
    if (seenNames.has(name)) throw new Error(`Archive contains a duplicate path: ${name}`);
    seenNames.add(name);
    if ((flags & 0x0001) !== 0) throw new Error(`Encrypted ZIP entries are not supported: ${name}`);
    if (![0, 8].includes(method)) throw new Error(`Unsupported ZIP compression method ${method}: ${name}`);
    if (localOffset + 30 > archiveBytes.length || archiveBytes.readUInt32LE(localOffset) !== 0x04034b50) {
      throw new Error(`ZIP local header is malformed: ${name}`);
    }
    const localFlags = archiveBytes.readUInt16LE(localOffset + 6);
    const localMethod = archiveBytes.readUInt16LE(localOffset + 8);
    const localNameLength = archiveBytes.readUInt16LE(localOffset + 26);
    const localExtraLength = archiveBytes.readUInt16LE(localOffset + 28);
    const localName = safeArchiveEntryPath(archiveBytes.subarray(localOffset + 30, localOffset + 30 + localNameLength).toString('utf8'));
    if (localName !== name || localFlags !== flags || localMethod !== method) throw new Error(`ZIP local/central metadata differs: ${name}`);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > archiveBytes.length) throw new Error(`ZIP entry data exceeds archive bounds: ${name}`);
    const compressed = archiveBytes.subarray(dataStart, dataEnd);
    const contents = method === 0 ? Buffer.from(compressed) : zlib.inflateRawSync(compressed);
    if (contents.length !== uncompressedSize) throw new Error(`ZIP entry size mismatch: ${name}`);
    entries.push({ path: name, contents });
  }
  if (cursor !== centralOffset + centralSize) throw new Error('ZIP central directory size does not match parsed entries');
  return {
    path: fs.realpathSync(archivePath),
    filename: path.basename(archivePath),
    bytes: archiveBytes.length,
    sha256: sha256(archiveBytes),
    entries
  };
}

function inventoryArchive(archivePath, extractedInventory) {
  const archive = readZipFileEntries(archivePath);
  const expectedPaths = [...REQUIRED_PACKAGE_FILES].sort();
  const rawPaths = archive.entries.map(entry => entry.path).sort();
  let rootPrefix = '';
  let normalizedEntries = archive.entries;
  if (JSON.stringify(rawPaths) !== JSON.stringify(expectedPaths)) {
    const firstParts = rawPaths[0]?.split('/') || [];
    const candidate = firstParts.length > 1 ? `${firstParts[0]}/` : '';
    if (!candidate || !rawPaths.every(entryPath => entryPath.startsWith(candidate))) {
      throw new Error(`Archive file allowlist mismatch. Actual: ${rawPaths.join(', ')}`);
    }
    normalizedEntries = archive.entries.map(entry => ({ ...entry, path: entry.path.slice(candidate.length) }));
    const normalizedPaths = normalizedEntries.map(entry => entry.path).sort();
    if (JSON.stringify(normalizedPaths) !== JSON.stringify(expectedPaths)) {
      throw new Error(`Archive file allowlist mismatch after root normalization. Actual: ${normalizedPaths.join(', ')}`);
    }
    rootPrefix = candidate;
  }
  const inventory = normalizedEntries
    .map(entry => ({ path: entry.path, bytes: entry.contents.length, sha256: sha256(entry.contents) }))
    .sort((left, right) => left.path.localeCompare(right.path));
  if (JSON.stringify(inventory) !== JSON.stringify(extractedInventory.files)) {
    throw new Error('ZIP file bytes do not exactly match the extracted package inventory');
  }
  const inventoryDigest = sha256(Buffer.from(inventory.map(item => `${item.sha256}  ${item.bytes}  ${item.path}`).join('\n') + '\n'));
  if (inventoryDigest !== extractedInventory.inventoryDigest) throw new Error('ZIP and extracted inventory digests differ');
  return {
    path: archive.path,
    filename: archive.filename,
    bytes: archive.bytes,
    sha256: archive.sha256,
    rootPrefix,
    inventoryDigest,
    files: inventory
  };
}

function pathIsWithin(candidate, directory) {
  const relative = path.relative(path.resolve(directory), path.resolve(candidate));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function resolvePlaywright() {
  const candidates = [
    process.env.SC_PLAYWRIGHT_MODULE,
    'playwright',
    path.join(os.homedir(), '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules', 'playwright')
  ].filter(Boolean);
  const errors = [];
  for (const candidate of candidates) {
    try {
      return { module: require(candidate), resolvedFrom: require.resolve(candidate) };
    } catch (error) {
      errors.push(`${candidate}: ${error.message}`);
    }
  }
  throw new UnsupportedCase(`Playwright 1.62+ is unavailable. Attempts: ${errors.join(' | ')}`);
}

function assert(condition, message, details = null) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

function isConcreteIdentity(value) {
  const normalized = String(value || '').trim();
  return normalized.length >= 8 && normalized.length <= 200;
}

async function waitFor(check, description, timeoutMs, intervalMs = 50) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  const suffix = lastError ? ` Last error: ${lastError.message}` : '';
  throw new Error(`Timed out waiting for ${description}.${suffix}`);
}

async function pageState(page) {
  return page.evaluate(({ rootId, runtimeKey, claimKey, bootstrapKey, tokenKey }) => {
    function safeRead(key) {
      try {
        if (!Object.prototype.hasOwnProperty.call(window, key)) return { present: false, readable: true, value: null };
        return { present: true, readable: true, value: window[key] };
      } catch (_) {
        return { present: true, readable: false, value: null };
      }
    }
    const runtimeProperty = safeRead(runtimeKey);
    const runtime = runtimeProperty.readable ? runtimeProperty.value : null;
    let health = null;
    try { health = runtime && typeof runtime.getHealth === 'function' ? runtime.getHealth() : null; } catch (_) {}
    const rootElements = [...document.querySelectorAll(`#${rootId}`)];
    for (const marked of document.querySelectorAll('[data-squarecoil-companion-root="rebuild"]')) {
      if (!rootElements.includes(marked)) rootElements.push(marked);
    }
    const roots = rootElements.map(root => ({
      id: root.id || null,
      canonicalId: root.id === rootId,
      rebuildOwned: root.dataset.squarecoilCompanionRoot === 'rebuild',
      runtimeInstanceId: root.dataset.runtimeInstanceId || null,
      buildId: root.dataset.buildId || null,
      packageVersion: root.dataset.packageVersion || null,
      candidateFingerprint: root.dataset.candidateFingerprint || null,
      documentToken: root.dataset.documentToken || null,
      lifecycleState: root.dataset.lifecycleState || null,
      lifecycleReason: root.dataset.lifecycleReason || null,
      a4Seed: root.dataset.a4Seed || null
    }));
    return {
      url: String(location.href),
      documentToken: document.documentElement?.dataset?.[tokenKey] || null,
      controller: document.documentElement?.dataset?.squarecoilCompanionController || null,
      controllerReason: document.documentElement?.dataset?.squarecoilCompanionControllerReason || null,
      probe: document.documentElement?.dataset?.squarecoilCompanionProbe || null,
      reloadRequired: document.documentElement?.dataset?.squarecoilCompanionReloadRequired || null,
      runtimeGlobalPresent: runtimeProperty.present,
      runtimeGlobalReadable: runtimeProperty.readable,
      runtimeInstanceId: runtime && runtime.runtimeInstanceId || null,
      runtimeBuildId: runtime && runtime.buildId || null,
      runtimePackageVersion: runtime && runtime.packageVersion || null,
      runtimeCandidateFingerprint: runtime && runtime.candidateFingerprint || null,
      runtimeDocumentToken: runtime && runtime.documentToken || null,
      health,
      rootCount: roots.length,
      canonicalRootCount: roots.filter(root => root.canonicalId).length,
      rebuildMarkerCount: roots.filter(root => root.rebuildOwned).length,
      roots,
      claimPresent: safeRead(claimKey).present,
      bootstrapPresent: safeRead(bootstrapKey).present
    };
  }, {
    rootId: ROOT_ID,
    runtimeKey: RUNTIME_KEY,
    claimKey: CLAIM_KEY,
    bootstrapKey: BOOTSTRAP_KEY,
    tokenKey: DOCUMENT_TOKEN_DATASET_KEY
  });
}

function assertExpectedB1Shell(state, label, candidateIdentity) {
  assert(state.runtimeGlobalPresent && state.runtimeGlobalReadable, `${label}: runtime global is not readable`);
  assert(state.rootCount === 1, `${label}: expected exactly one canonical-or-rebuild root`, state);
  assert(state.canonicalRootCount === 1, `${label}: expected exactly one canonical timer root`, state);
  assert(state.rebuildMarkerCount === 1, `${label}: expected exactly one rebuild-owned marker`, state);
  assert(state.roots[0].canonicalId === true && state.roots[0].rebuildOwned === true, `${label}: sole root is not the canonical rebuild-owned root`, state);
  assert(isConcreteIdentity(state.runtimeInstanceId), `${label}: runtime identity is not concrete`, state);
  assert(state.roots[0].runtimeInstanceId === state.runtimeInstanceId, `${label}: root/runtime identity differs`, state);
  assert(state.runtimeBuildId === candidateIdentity.buildId, `${label}: runtime build identity differs`, state);
  assert(state.runtimePackageVersion === candidateIdentity.packageVersion, `${label}: runtime package identity differs`, state);
  assert(state.runtimeCandidateFingerprint === candidateIdentity.candidateFingerprint, `${label}: runtime candidate identity differs`, state);
  assert(state.roots[0].buildId === candidateIdentity.buildId, `${label}: root build identity differs`, state);
  assert(state.roots[0].packageVersion === candidateIdentity.packageVersion, `${label}: root package identity differs`, state);
  assert(state.roots[0].candidateFingerprint === candidateIdentity.candidateFingerprint, `${label}: root candidate identity differs`, state);
  assert(state.runtimeDocumentToken === state.documentToken, `${label}: runtime/document identity differs`, state);
  assert(state.roots[0].documentToken === state.documentToken, `${label}: root/document identity differs`, state);
  const health = state.health;
  assert(health?.state === 'DEGRADED', `${label}: isolated MAIN shell must retain the pre-settlement sentinel`, health);
  assert(health?.state !== 'READY', `${label}: isolated MAIN shell bypassed worker-owned B2 settlement`, health);
  assert(health?.reason === EXPECTED_DEGRADED_REASON, `${label}: unexpected degraded reason`, health);
  assert(health?.buildId === candidateIdentity.buildId, `${label}: health build identity differs`, health);
  assert(health?.packageVersion === candidateIdentity.packageVersion, `${label}: health package identity differs`, health);
  assert(health?.candidateFingerprint === candidateIdentity.candidateFingerprint, `${label}: health candidate identity differs`, health);
  assert(health?.ui?.rootPresent === true, `${label}: UI root is not reported present`, health);
  assert(health?.ui?.interactionReady === true, `${label}: UI interaction probe is not healthy`, health);
  assert(health?.ui?.buildId === candidateIdentity.buildId, `${label}: UI build identity differs`, health);
  assert(health?.ui?.packageVersion === candidateIdentity.packageVersion, `${label}: UI package identity differs`, health);
  assert(health?.ui?.candidateFingerprint === candidateIdentity.candidateFingerprint, `${label}: UI candidate identity differs`, health);
  const readiness = health?.readiness || {};
  const requiredTrue = [
    'oneLifecycleOwner',
    'validRuntimeIdentity',
    'persistenceAvailable',
    'oneOwnedRoot',
    'interactionReady',
    'bridgeInitialized',
    'initialObservationAttempted',
    'featureRegistryInitialized',
    'teardownRegistered'
  ];
  for (const key of requiredTrue) assert(readiness[key] === true, `${label}: readiness.${key} is not true`, readiness);
  assert(readiness.coordinationPositive === false, `${label}: B2.1 kernel-only shell unexpectedly reported full coordination readiness`, readiness);
  assert(readiness.coordinationDisposition === 'KERNEL_CONNECTED_B2_1', `${label}: B2.1 kernel connection disposition is missing`, readiness);
  assert(state.claimPresent === false, `${label}: injection claim remained after boot`, state);
  assert(state.bootstrapPresent === false, `${label}: bootstrap marker remained after boot`, state);
}

function assertHealthyB2KernelAuthority(snapshot, label, pageSnapshot = null) {
  assert(snapshot && typeof snapshot === 'object', `${label}: isolated authority snapshot is unavailable`, snapshot);
  assert(!snapshot.snapshotError, `${label}: isolated authority snapshot failed`, snapshot);
  assert(snapshot.enabled === true, `${label}: isolated authority is not enabled`, snapshot);
  assert(snapshot.healthy === true, `${label}: isolated authority is not healthy`, snapshot);
  assert(['OWNER', 'OBSERVER_CONNECTED'].includes(snapshot.disposition), `${label}: isolated authority disposition is not positive`, snapshot);
  assert(isConcreteIdentity(snapshot.workerInstanceId), `${label}: authority worker identity is not concrete`, snapshot);
  assert(Number.isSafeInteger(snapshot.coordinationEpoch) && snapshot.coordinationEpoch >= 1, `${label}: coordination epoch is not concrete`, snapshot);
  assert(Number.isSafeInteger(snapshot.coordinationRevision) && snapshot.coordinationRevision >= 0, `${label}: coordination revision is not concrete`, snapshot);
  assert(Number.isSafeInteger(snapshot.revision) && snapshot.revision >= 0, `${label}: authoritative document revision is not concrete`, snapshot);
  assert(snapshot.subscribed === true, `${label}: isolated authority subscription is not active`, snapshot);
  assert(snapshot.lastError === null, `${label}: isolated authority retained an error`, snapshot);
  assert(isConcreteIdentity(snapshot.runtimeInstanceId), `${label}: authority runtime identity is not concrete`, snapshot);
  assert(isConcreteIdentity(snapshot.documentToken), `${label}: authority document identity is not concrete`, snapshot);
  if (pageSnapshot) {
    assert(snapshot.runtimeInstanceId === pageSnapshot.runtimeInstanceId, `${label}: authority/page runtime identities differ`, { snapshot, pageSnapshot });
    assert(snapshot.documentToken === pageSnapshot.documentToken, `${label}: authority/page document identities differ`, { snapshot, pageSnapshot });
  }
}

class ContentBridge {
  constructor(context, page, extensionId, timeoutMs, candidateIdentity) {
    this.context = context;
    this.page = page;
    this.extensionId = extensionId;
    this.timeoutMs = timeoutMs;
    this.candidateIdentity = { ...candidateIdentity };
    assert(this.candidateIdentity.buildId === CANONICAL_BUILD_ID, 'Content bridge build identity is not canonical', this.candidateIdentity);
    assert(String(this.candidateIdentity.packageVersion || '').trim().length > 0, 'Content bridge package identity is not concrete', this.candidateIdentity);
    assert(/^[0-9a-f]{64}$/.test(this.candidateIdentity.candidateFingerprint), 'Content bridge candidate identity is not concrete', this.candidateIdentity);
    this.session = null;
    this.contexts = new Map();
  }

  async initialize() {
    this.session = await this.context.newCDPSession(this.page);
    this.session.on('Runtime.executionContextCreated', event => {
      this.contexts.set(event.context.id, event.context);
    });
    this.session.on('Runtime.executionContextDestroyed', event => {
      this.contexts.delete(event.executionContextId);
    });
    this.session.on('Runtime.executionContextsCleared', () => this.contexts.clear());
    await this.session.send('Runtime.enable');
    await this.findContentContext();
  }

  async evaluateInContext(contextId, expression) {
    const result = await this.session.send('Runtime.evaluate', {
      contextId,
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Content-world evaluation failed');
    }
    return result.result?.value;
  }

  async findContentContext() {
    return waitFor(async () => {
      for (const [contextId, metadata] of [...this.contexts.entries()]) {
        if (metadata.auxData?.isDefault === true) continue;
        try {
          const probe = await this.evaluateInContext(contextId, `(() => ({
            extensionId: typeof chrome === 'object' && chrome.runtime ? chrome.runtime.id : null,
            topLevel: window.top === window,
            token: document.documentElement?.dataset?.${DOCUMENT_TOKEN_DATASET_KEY} || null
          }))()`);
          if (probe?.extensionId === this.extensionId && probe.topLevel === true) return contextId;
        } catch (_) {}
      }
      return null;
    }, 'the top-frame extension content world', this.timeoutMs);
  }

  async run(expressionBuilder) {
    let contextId = await this.findContentContext();
    try {
      return await this.evaluateInContext(contextId, expressionBuilder());
    } catch (error) {
      if (!/context|execution/i.test(error.message)) throw error;
      contextId = await this.findContentContext();
      return this.evaluateInContext(contextId, expressionBuilder());
    }
  }

  async send(message) {
    const serialized = JSON.stringify(message);
    const serializedIdentity = JSON.stringify(this.candidateIdentity);
    return this.run(() => `(async () => {
      const message = ${serialized};
      Object.assign(message, ${serializedIdentity});
      message.documentToken = document.documentElement?.dataset?.${DOCUMENT_TOKEN_DATASET_KEY} || null;
      return chrome.runtime.sendMessage(message);
    })()`);
  }

  async sendConcurrent(message, count) {
    const serialized = JSON.stringify(message);
    const serializedIdentity = JSON.stringify(this.candidateIdentity);
    return this.run(() => `(async () => {
      const base = ${serialized};
      const token = document.documentElement?.dataset?.${DOCUMENT_TOKEN_DATASET_KEY} || null;
      const identity = ${serializedIdentity};
      return Promise.all(Array.from({ length: ${Number(count)} }, () => chrome.runtime.sendMessage({ ...base, ...identity, documentToken: token })));
    })()`);
  }

  async setEnabled(enabled) {
    const value = Boolean(enabled);
    const serializedIdentity = JSON.stringify(this.candidateIdentity);
    return this.run(() => `(async () => {
      await chrome.storage.local.set({ timerEnabled: ${value} });
      const documentToken = document.documentElement?.dataset?.${DOCUMENT_TOKEN_DATASET_KEY} || null;
      const identity = ${serializedIdentity};
      return chrome.runtime.sendMessage({ type: ${JSON.stringify(MESSAGES.ENABLE)}, enabled: ${value}, ...identity, documentToken });
    })()`);
  }

  async getStorage(keys) {
    const serialized = JSON.stringify(keys);
    return this.run(() => `chrome.storage.local.get(${serialized})`);
  }

  async authoritySnapshot() {
    return this.run(() => `(() => {
      const health = globalThis.__squareCoilCompanionAuthorityHealth;
      if (!health || typeof health.snapshot !== 'function') return null;
      try {
        const snapshot = health.snapshot();
        if (!snapshot || typeof snapshot !== 'object') return null;
        return {
          enabled: snapshot.enabled,
          healthy: snapshot.healthy,
          disposition: snapshot.disposition,
          workerInstanceId: snapshot.workerInstanceId,
          coordinationEpoch: snapshot.coordinationEpoch,
          coordinationRevision: snapshot.coordinationRevision,
          leaseExpiry: snapshot.leaseExpiry,
          revision: snapshot.revision,
          subscribed: snapshot.subscribed,
          lastSequence: snapshot.lastSequence,
          lastError: snapshot.lastError,
          runtimeInstanceId: snapshot.runtimeInstanceId,
          documentToken: snapshot.documentToken
        };
      } catch (error) {
        return { snapshotError: String(error?.message || error) };
      }
    })()`);
  }

  async removeStorage(keys) {
    const serialized = JSON.stringify(keys);
    return this.run(() => `chrome.storage.local.remove(${serialized})`);
  }

  async coreSnapshot() {
    return this.run(() => `(() => {
      const health = globalThis.__squareCoilCompanionAuthorityHealth;
      if (!health || typeof health.coreSnapshot !== 'function') return null;
      return health.coreSnapshot();
    })()`);
  }

  async syncBridge() {
    return this.run(() => `globalThis.__squareCoilCompanionAuthorityHealth.syncBridge()`);
  }

  async timerAction(type) {
    const serialized = JSON.stringify(type);
    return this.run(() => `globalThis.__squareCoilCompanionAuthorityHealth.timerAction(${serialized})`);
  }

  async setLegacyValue(key, value) {
    const serializedKey = JSON.stringify(key);
    const serializedValue = JSON.stringify(value);
    return this.run(() => `(() => {
      localStorage.setItem(${serializedKey}, ${serializedValue});
      return localStorage.getItem(${serializedKey});
    })()`);
  }

  async removeLegacyValue(key) {
    const serializedKey = JSON.stringify(key);
    return this.run(() => `(() => {
      localStorage.removeItem(${serializedKey});
      return localStorage.getItem(${serializedKey});
    })()`);
  }

  async authorityTeardown() {
    return this.run(() => `(async () => {
      const health = globalThis.__squareCoilCompanionAuthorityHealth;
      if (!health || typeof health.teardown !== 'function') return { disconnected: true, absent: true };
      return health.teardown();
    })()`);
  }

  async installOneShotResponseHold(type) {
    const serialized = JSON.stringify(type);
    return this.run(() => `(() => {
      if (window.__a4MessageHold) return { installed: false, reason: 'hold-already-installed' };
      const original = chrome.runtime.sendMessage;
      const hold = { type: ${serialized}, seen: 0, releases: [], original, wrapper: null };
      hold.wrapper = function(message, ...args) {
        const result = Reflect.apply(original, chrome.runtime, [message, ...args]);
        if (message?.type !== hold.type || hold.seen > 0) return result;
        hold.seen += 1;
        return Promise.resolve(result).then(value => new Promise(resolve => hold.releases.push(() => resolve(value))));
      };
      try { chrome.runtime.sendMessage = hold.wrapper; } catch (error) {
        return { installed: false, reason: String(error?.message || error) };
      }
      if (chrome.runtime.sendMessage !== hold.wrapper) return { installed: false, reason: 'sendMessage-not-writable' };
      window.__a4MessageHold = hold;
      return { installed: true };
    })()`);
  }

  async heldResponseCount() {
    return this.run(() => `window.__a4MessageHold?.seen || 0`);
  }

  async dispatchPersistedPageShow() {
    return this.run(() => `(() => {
      const event = new Event('pageshow');
      Object.defineProperty(event, 'persisted', { configurable: true, value: true });
      return window.dispatchEvent(event);
    })()`);
  }

  async releaseAndRestoreResponseHold() {
    return this.run(() => `(() => {
      const hold = window.__a4MessageHold;
      if (!hold) return { restored: false, released: 0 };
      const releases = hold.releases.splice(0);
      chrome.runtime.sendMessage = hold.original;
      delete window.__a4MessageHold;
      for (const release of releases) release();
      return { restored: chrome.runtime.sendMessage !== hold.wrapper, released: releases.length };
    })()`);
  }

  async detach() {
    if (this.session) await this.session.detach().catch(() => {});
  }
}

async function createScriptTracker(context, page, extensionId) {
  const session = await context.newCDPSession(page);
  const scripts = new Map();
  session.on('Debugger.scriptParsed', event => {
    if (event.url && event.url.startsWith(`chrome-extension://${extensionId}/`)) {
      scripts.set(`${event.scriptId}:${event.url}`, { scriptId: event.scriptId, url: event.url });
    }
  });
  await session.send('Debugger.enable');
  return {
    companionCount: () => [...scripts.values()].filter(script => script.url.endsWith('/dist/companion-app.js')).length,
    snapshot: () => [...scripts.values()],
    detach: () => session.detach().catch(() => {})
  };
}

function clockContextHtml(clockContext) {
  const id = String(clockContext.projectId);
  const label = String(clockContext.label);
  return `<a href="/project.php?id=${id}">${label}</a>`;
}

function action7Html(clockContext) {
  return `<span id="clockin-remaining-time">${clockContextHtml(clockContext)}</span>`;
}

function fixtureHtml(clockContext) {
  const context = clockContextHtml(clockContext);
  return '<!doctype html><html><head><meta charset="utf-8"><title>SquareCoil B2.2 A4 Synthetic Fixture</title><link rel="icon" href="data:,"></head><body><main><h1>A4 synthetic lifecycle fixture</h1><p>No customer data is loaded.</p><section class="timeclock-container"><button id="clockin" hidden>Clock in</button><button id="clockout">Clock out</button><span id="clockin-debug"></span><span id="clockin-remaining-time">' + context + '</span><div class="clock-actions"></div></section><iframe id="a4-frame" src="' + FRAME_PATH + '"></iframe></main></body></html>';
}

function frameHtml() {
  return '<!doctype html><html><head><meta charset="utf-8"><title>A4 child frame</title><link rel="icon" href="data:,"></head><body><p>Synthetic child frame</p></body></html>';
}

async function installSyntheticRouting(context, networkEvidence, transitionFixture) {
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.protocol === 'chrome-extension:') return route.continue();
    if (url.origin === FIXTURE_ORIGIN && url.pathname === FIXTURE_PATH) {
      networkEvidence.fulfilled.push(url.href);
      return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: fixtureHtml(transitionFixture.clockContext) });
    }
    if (url.origin === FIXTURE_ORIGIN && url.pathname === FRAME_PATH) {
      networkEvidence.fulfilled.push(url.href);
      return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: frameHtml() });
    }
    if (url.origin === FIXTURE_ORIGIN && url.pathname === '/ajax_time_clock.php') {
      const body = request.postData() || '';
      const record = { url: url.href, method: request.method(), body };
      if (request.method() === 'POST' && body === 'action=7') {
        networkEvidence.action7.push(record);
        return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: action7Html(transitionFixture.clockContext) });
      }
      networkEvidence.nativeMutationAttempts.push(record);
      return route.abort('blockedbyclient');
    }
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      networkEvidence.blockedUnexpected.push({ url: url.href, resourceType: request.resourceType() });
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
}

async function runCase(cases, id, name, task, metadata = {}) {
  const started = Date.now();
  try {
    const evidence = await task();
    const record = { id, name, ...metadata, status: 'PASS', durationMs: Date.now() - started, evidence: evidence || null };
    cases.push(record);
    return record;
  } catch (error) {
    const record = {
      id,
      name,
      ...metadata,
      status: error instanceof UnsupportedCase ? 'UNSUPPORTED' : 'FAIL',
      durationMs: Date.now() - started,
      error: error.message,
      details: error.details || null
    };
    cases.push(record);
    return record;
  }
}

function browserFixtureId(family, stableFixtureIds, slug) {
  const browserCode = family === 'chrome' ? 'CH' : 'ED';
  const stable = stableFixtureIds.map(value => value.replace('B1-LC-', '')).join('-');
  return `A4-B1-${browserCode}-${stable}-${slug}`;
}

function runBrowserCase(cases, family, stableFixtureIds, slug, name, task) {
  for (const fixtureId of stableFixtureIds) {
    if (!REQUIRED_A4_STABLE_FIXTURE_IDS.includes(fixtureId)) throw new Error(`Unknown A4 stable fixture ID: ${fixtureId}`);
  }
  return runCase(cases, browserFixtureId(family, stableFixtureIds, slug), name, task, { stableFixtureIds });
}

function runB2KernelBrowserCase(cases, family, b2KernelFixtureIds, stableFixtureIds, slug, name, task, extraMetadata = {}) {
  for (const fixtureId of b2KernelFixtureIds) {
    if (!REQUIRED_B2_1_A4_FIXTURE_IDS.includes(fixtureId)) throw new Error(`Unknown B2.1 A4 fixture ID: ${fixtureId}`);
  }
  for (const fixtureId of stableFixtureIds) {
    if (!REQUIRED_A4_STABLE_FIXTURE_IDS.includes(fixtureId)) throw new Error(`Unknown B1 A4 stable fixture ID: ${fixtureId}`);
  }
  for (const fixtureId of extraMetadata.b2ReadyFixtureIds || []) {
    if (!REQUIRED_B2_READY_A4_FIXTURE_IDS.includes(fixtureId)) throw new Error(`Unknown final B2 READY A4 fixture ID: ${fixtureId}`);
  }
  const browserCode = family === 'chrome' ? 'CH' : 'ED';
  const fixtureCode = b2KernelFixtureIds.map(value => value.replace('B2-KERNEL-', '')).join('-');
  return runCase(
    cases,
    `A4-B2.1-${browserCode}-${fixtureCode}-${slug}`,
    name,
    task,
    {
      stableFixtureIds,
      b2KernelFixtureIds,
      b2Scope: 'ISOLATED_AUTHORITY_KERNEL_ONLY',
      ...extraMetadata
    }
  );
}

function runB2TransitionBrowserCase(cases, family, fixtureIds, slug, name, task, extraMetadata = {}) {
  for (const fixtureId of fixtureIds) {
    if (!REQUIRED_B2_2_A4_FIXTURE_IDS.includes(fixtureId)) throw new Error(`Unknown B2.2 A4 fixture ID: ${fixtureId}`);
  }
  for (const fixtureId of extraMetadata.b2ReadyFixtureIds || []) {
    if (!REQUIRED_B2_READY_A4_FIXTURE_IDS.includes(fixtureId)) throw new Error(`Unknown final B2 READY A4 fixture ID: ${fixtureId}`);
  }
  const browserCode = family === 'chrome' ? 'CH' : 'ED';
  const fixtureCode = fixtureIds.map(value => value.replace('B2-TRANSITION-', '')).join('-');
  return runCase(cases, `A4-B2.2-${browserCode}-${fixtureCode}-${slug}`, name, task, {
    b2TransitionFixtureIds: fixtureIds,
    b2Scope: 'TRUSTED_TRANSITION_CORE_PARTIAL',
    ...extraMetadata
  });
}

function runB2TransitionLifecycleBrowserCase(cases, family, fixtureIds, stableFixtureIds, slug, name, task, extraMetadata = {}) {
  for (const fixtureId of fixtureIds) {
    if (!REQUIRED_B2_2_A4_FIXTURE_IDS.includes(fixtureId)) throw new Error(`Unknown B2.2 A4 fixture ID: ${fixtureId}`);
  }
  for (const fixtureId of stableFixtureIds) {
    if (!REQUIRED_A4_STABLE_FIXTURE_IDS.includes(fixtureId)) throw new Error(`Unknown B1 A4 stable fixture ID: ${fixtureId}`);
  }
  for (const fixtureId of extraMetadata.b2ReadyFixtureIds || []) {
    if (!REQUIRED_B2_READY_A4_FIXTURE_IDS.includes(fixtureId)) throw new Error(`Unknown final B2 READY A4 fixture ID: ${fixtureId}`);
  }
  const browserCode = family === 'chrome' ? 'CH' : 'ED';
  const fixtureCode = fixtureIds.map(value => value.replace('B2-TRANSITION-', '')).join('-');
  return runCase(cases, `A4-B2.2-${browserCode}-${fixtureCode}-${slug}`, name, task, {
    stableFixtureIds,
    b2TransitionFixtureIds: fixtureIds,
    b2Scope: 'TRUSTED_TRANSITION_CORE_PARTIAL',
    ...extraMetadata
  });
}

function runB2ReadyBrowserCase(cases, family, fixtureIds, slug, name, task) {
  for (const fixtureId of fixtureIds) {
    if (!REQUIRED_B2_READY_A4_FIXTURE_IDS.includes(fixtureId)) throw new Error(`Unknown final B2 READY A4 fixture ID: ${fixtureId}`);
  }
  const browserCode = family === 'chrome' ? 'CH' : 'ED';
  const fixtureCode = fixtureIds.map(value => value.replace('B2-READY-', '')).join('-');
  return runCase(cases, `A4-B2-C-${browserCode}-${fixtureCode}-${slug}`, name, task, {
    b2ReadyFixtureIds: fixtureIds,
    b2Scope: 'FINAL_READY_SETTLEMENT'
  });
}

function serviceWorkerTarget(targets, extensionId) {
  return targets.targetInfos.find(target => target.type === 'service_worker' && target.url === `chrome-extension://${extensionId}/dist/background.js`) || null;
}

async function runBrowserSuite({ playwright, family, executablePath, packageDirectory, packageInventory, archiveInventory, options }) {
  const suiteStarted = Date.now();
  const candidateIdentity = Object.freeze({
    buildId: packageInventory.buildInfo.buildId,
    packageVersion: packageInventory.manifest.version,
    candidateFingerprint: packageInventory.buildInfo.candidateFingerprint
  });
  const result = {
    family,
    status: 'RUNNING',
    executablePath,
    browserIdentity: null,
    extension: null,
    candidateIdentity,
    network: { fulfilled: [], action7: [], nativeMutationAttempts: [], blockedUnexpected: [] },
    console: { errors: [], pageErrors: [] },
    stableFixtureCoverage: null,
    b2KernelFixtureCoverage: null,
    cases: [],
    durationMs: null,
    cleanupWarning: null
  };
  if (!fs.existsSync(executablePath)) {
    result.status = 'UNSUPPORTED';
    result.cases.push({ id: 'A4-ENV', name: 'Installed branded browser', status: 'UNSUPPORTED', error: `Executable not found: ${executablePath}` });
    result.durationMs = Date.now() - suiteStarted;
    return result;
  }

  const profileDirectory = fs.mkdtempSync(path.join(os.tmpdir(), `squarecoil-b1-a4-${family}-`));
  let context = null;
  let browserCdp = null;
  let bridge = null;
  let tracker = null;
  try {
    context = await playwright.chromium.launchPersistentContext(profileDirectory, {
      executablePath,
      headless: !options.headed,
      ignoreDefaultArgs: ['--disable-extensions', '--disable-back-forward-cache'],
      viewport: { width: 1280, height: 900 },
      args: [
        '--enable-unsafe-extension-debugging',
        '--disable-background-networking',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-sync',
        '--host-resolver-rules=MAP * ~NOTFOUND',
        '--metrics-recording-only',
        '--no-default-browser-check',
        '--no-first-run'
      ]
    });
    const browser = context.browser();
    if (!browser || typeof browser.newBrowserCDPSession !== 'function') {
      throw new UnsupportedCase('Browser-level CDP is unavailable for the persistent profile');
    }
    browserCdp = await browser.newBrowserCDPSession();
    const protocolVersion = await browserCdp.send('Browser.getVersion');
    result.browserIdentity = {
      ...protocolVersion,
      playwrightReportedVersion: browser.version(),
      executableRealPath: fs.realpathSync(executablePath),
      executableSha256: sha256(fs.readFileSync(executablePath))
    };

    let loadResult;
    try {
      loadResult = await browserCdp.send('Extensions.loadUnpacked', { path: packageDirectory, enableInIncognito: false });
    } catch (error) {
      throw new UnsupportedCase(`Extensions.loadUnpacked is unavailable: ${error.message}`);
    }
    const extensionId = loadResult?.id;
    assert(isConcreteIdentity(extensionId), 'Extensions.loadUnpacked did not return a concrete extension ID', loadResult);
    result.extension = { loadResult, id: extensionId, registryVerified: false };
    const extensionInfo = await waitFor(async () => {
      const extensionList = await browserCdp.send('Extensions.getExtensions');
      return extensionList.extensions?.find(extension => extension.id === extensionId) || null;
    }, 'the unpacked extension registry entry', options.timeoutMs);
    assert(extensionInfo?.enabled === true, 'Loaded extension is not enabled', extensionInfo);
    assert(fs.realpathSync(extensionInfo.path).toLowerCase() === fs.realpathSync(packageDirectory).toLowerCase(), 'Browser loaded a different extension path', extensionInfo);
    assert(extensionInfo.version === packageInventory.manifest.version, 'Browser loaded a different extension version', extensionInfo);
    result.extension = { ...extensionInfo, id: extensionId, loadResult, registryVerified: true };

    await runBrowserCase(
      result.cases,
      family,
      family === 'chrome' ? ['B1-LC-017'] : ['B1-LC-018'],
      'PACKAGE-IDENTITY',
      'Loaded browser identity matches the exact commit, ZIP, and extracted bytes',
      async () => {
        const expectedProduct = family === 'chrome' ? /^Chrome\// : /^Edg\//;
        assert(expectedProduct.test(result.browserIdentity.product), `Unexpected ${family} CDP product identity`, result.browserIdentity);
        assert(result.extension.registryVerified === true, 'Extension registry identity was not verified', result.extension);
        assert(packageInventory.buildInfo.buildId === CANONICAL_BUILD_ID, 'Loaded package buildId is not canonical', packageInventory.buildInfo);
        assert(packageInventory.buildInfo.stage === CANONICAL_STAGE, 'Loaded package stage is not canonical', packageInventory.buildInfo);
        assert(/^[0-9a-f]{64}$/.test(packageInventory.buildInfo.candidateFingerprint), 'Loaded package candidate fingerprint is not concrete', packageInventory.buildInfo);
        assert(packageInventory.buildInfo.sourceSha === options.expectedSourceSha, 'Loaded package source SHA differs from the commanded SHA', packageInventory.buildInfo);
        assert(CANDIDATE_EMBEDDED_BUNDLES.every(relative => packageInventory.candidateEmbeddingCounts[relative] >= 1), 'A required runtime bundle does not embed the exact candidate fingerprint', packageInventory.candidateEmbeddingCounts);
        assert(archiveInventory.inventoryDigest === packageInventory.inventoryDigest, 'Archive/extracted identity differs', archiveInventory);
        return {
          browser: result.browserIdentity,
          extension: result.extension,
          candidateIdentity,
          candidateEmbeddingCounts: packageInventory.candidateEmbeddingCounts,
          buildInfo: packageInventory.buildInfo,
          archive: {
            filename: archiveInventory.filename,
            sha256: archiveInventory.sha256,
            inventoryDigest: archiveInventory.inventoryDigest
          }
        };
      }
    );

    const setupPage = await context.newPage();
    try {
      await setupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`, { waitUntil: 'domcontentloaded', timeout: options.timeoutMs });
      await setupPage.evaluate(() => chrome.storage.local.set({ timerEnabled: false }));
    } finally {
      await setupPage.close().catch(() => {});
    }
    const transitionFixture = {
      clockContext: { projectId: '260701', label: '260701 - Design' }
    };
    await installSyntheticRouting(context, result.network, transitionFixture);

    const existingPages = context.pages();
    const page = existingPages[0] || await context.newPage();
    for (const extra of existingPages.slice(1)) await extra.close().catch(() => {});
    page.on('console', message => {
      if (message.type() === 'error' || message.type() === 'warning') result.console.errors.push({ type: message.type(), text: message.text() });
    });
    page.on('pageerror', error => result.console.pageErrors.push(String(error?.message || error)));
    await page.goto(`${FIXTURE_ORIGIN}${FIXTURE_PATH}`, { waitUntil: 'domcontentloaded', timeout: options.timeoutMs });
    await waitFor(async () => (await pageState(page)).documentToken, 'content-controller document identity', options.timeoutMs);
    bridge = new ContentBridge(context, page, extensionId, options.timeoutMs, candidateIdentity);
    await bridge.initialize();
    tracker = await createScriptTracker(context, page, extensionId);

    await runBrowserCase(result.cases, family, ['B1-LC-013'], 'DISABLED', 'Disabled boot is observation-only', async () => {
      const state = await pageState(page);
      assert(state.runtimeGlobalPresent === false, 'Disabled boot allocated a runtime', state);
      assert(state.rootCount === 0, 'Disabled boot allocated a root', state);
      assert(tracker.companionCount() === 0, 'Disabled boot injected the companion bundle', tracker.snapshot());
      const storage = await bridge.getStorage(['timerEnabled']);
      assert(storage?.timerEnabled === false, 'Disabled setting was not authoritative', storage);
      return { state, companionBundleParses: tracker.companionCount(), storage };
    });

    await runBrowserCase(result.cases, family, ['B1-LC-004'], 'ORPHAN', 'Clearly owned rebuild-marker orphan recovers while ambiguous ownership is retained', async () => {
      const parseBaseline = tracker.companionCount();
      const ownedSeed = await page.evaluate(identity => {
        const root = document.createElement('section');
        root.id = 'a4-owned-rebuild-marker-orphan';
        root.dataset.squarecoilCompanionRoot = 'rebuild';
        root.dataset.runtimeInstanceId = 'a4-owned-orphan-runtime-0001';
        root.dataset.buildId = identity.buildId;
        root.dataset.packageVersion = identity.packageVersion;
        root.dataset.candidateFingerprint = identity.candidateFingerprint;
        root.dataset.documentToken = document.documentElement.dataset.squarecoilCompanionDocumentToken;
        root.dataset.a4Seed = 'owned-orphan';
        document.body.appendChild(root);
        return {
          id: root.id,
          runtimeInstanceId: root.dataset.runtimeInstanceId,
          buildId: root.dataset.buildId,
          packageVersion: root.dataset.packageVersion,
          candidateFingerprint: root.dataset.candidateFingerprint,
          documentToken: root.dataset.documentToken
        };
      }, candidateIdentity);
      const ownedBefore = await pageState(page);
      assert(ownedBefore.rootCount === 1 && ownedBefore.canonicalRootCount === 0 && ownedBefore.rebuildMarkerCount === 1, 'Harness did not inventory the noncanonical owned rebuild marker', ownedBefore);
      assert(ownedBefore.roots[0].buildId === candidateIdentity.buildId && ownedBefore.roots[0].packageVersion === candidateIdentity.packageVersion && ownedBefore.roots[0].candidateFingerprint === candidateIdentity.candidateFingerprint, 'Owned orphan seed did not carry the exact candidate identity', ownedBefore);
      const ownedResponse = await bridge.setEnabled(true);
      const recovered = await waitFor(async () => {
        const state = await pageState(page);
        return state.health?.state === 'DEGRADED' ? state : null;
      }, 'clearly owned orphan recovery', options.timeoutMs);
      assertExpectedB1Shell(recovered, 'clearly owned orphan recovery', candidateIdentity);
      assert(recovered.runtimeInstanceId !== ownedSeed.runtimeInstanceId, 'Owned orphan runtime identity was reused', recovered);
      assert(await page.locator('[data-a4-seed="owned-orphan"]').count() === 0, 'Clearly owned orphan root was retained');
      assert(tracker.companionCount() === parseBaseline + 1, 'Owned orphan recovery did not execute exactly one fresh bundle', tracker.snapshot());
      await bridge.setEnabled(false);
      await waitFor(async () => {
        const state = await pageState(page);
        return !state.runtimeGlobalPresent && state.rootCount === 0 ? state : null;
      }, 'owned orphan cleanup', options.timeoutMs);

      const ambiguousSeed = await page.evaluate(identity => {
        const root = document.createElement('section');
        root.id = 'a4-ambiguous-rebuild-marker-orphan';
        root.dataset.squarecoilCompanionRoot = 'rebuild';
        root.dataset.buildId = identity.buildId;
        root.dataset.packageVersion = identity.packageVersion;
        root.dataset.candidateFingerprint = identity.candidateFingerprint;
        root.dataset.documentToken = document.documentElement.dataset.squarecoilCompanionDocumentToken;
        root.dataset.a4Seed = 'ambiguous-orphan';
        document.body.appendChild(root);
        return {
          id: root.id,
          buildId: root.dataset.buildId,
          packageVersion: root.dataset.packageVersion,
          candidateFingerprint: root.dataset.candidateFingerprint,
          documentToken: root.dataset.documentToken
        };
      }, candidateIdentity);
      const ambiguousBefore = await pageState(page);
      assert(ambiguousBefore.rootCount === 1 && ambiguousBefore.canonicalRootCount === 0 && ambiguousBefore.rebuildMarkerCount === 1, 'Harness did not inventory the noncanonical ambiguous rebuild marker', ambiguousBefore);
      assert(ambiguousBefore.roots[0].buildId === candidateIdentity.buildId && ambiguousBefore.roots[0].packageVersion === candidateIdentity.packageVersion && ambiguousBefore.roots[0].candidateFingerprint === candidateIdentity.candidateFingerprint, 'Ambiguous orphan seed did not carry the exact candidate identity', ambiguousBefore);
      const ambiguousResponse = await bridge.setEnabled(true);
      const ambiguous = await pageState(page);
      assert(ambiguousResponse?.classification === 'OWNERSHIP_CONFLICT', 'Ambiguous orphan did not fail closed', ambiguousResponse);
      assert(ambiguousResponse?.reloadRequired === true, 'Ambiguous orphan did not require a reload boundary', ambiguousResponse);
      assert(ambiguous.runtimeGlobalPresent === false, 'Ambiguous orphan allocated a runtime', ambiguous);
      assert(ambiguous.rootCount === 1, 'Ambiguous orphan root was deleted or stacked', ambiguous);
      assert(ambiguous.canonicalRootCount === 0 && ambiguous.rebuildMarkerCount === 1, 'Ambiguous noncanonical rebuild marker was hidden, rewritten, or stacked', ambiguous);
      assert(tracker.companionCount() === parseBaseline + 1, 'Ambiguous orphan triggered bundle execution', tracker.snapshot());
      await bridge.setEnabled(false);
      const removedAmbiguous = await page.evaluate(() => {
        const root = document.querySelector('[data-a4-seed="ambiguous-orphan"]');
        if (!root) return false;
        root.remove();
        return true;
      });
      assert(removedAmbiguous, 'Harness could not remove its exact ambiguous-orphan seed');
      return { ownedSeed, ownedBefore, ownedResponse, recoveredRuntimeInstanceId: recovered.runtimeInstanceId, ambiguousSeed, ambiguousBefore, ambiguousResponse, companionBundleParses: tracker.companionCount() };
    });

    await runBrowserCase(result.cases, family, ['B1-LC-010'], 'LEGACY', 'Legacy v0.7 timer ownership excludes B1 injection', async () => {
      const parseBaseline = tracker.companionCount();
      await page.evaluate(() => { window.__squareCoilJobTimerUiVersion = 'a4-legacy-v0.7'; });
      const response = await bridge.setEnabled(true);
      const state = await pageState(page);
      assert(response?.classification === 'LEGACY_RUNTIME', 'Legacy runtime was not classified explicitly', response);
      assert(response?.reloadRequired === true, 'Legacy runtime did not require a reload boundary', response);
      assert(state.runtimeGlobalPresent === false && state.rootCount === 0, 'B1 stacked over the legacy runtime', state);
      assert(tracker.companionCount() === parseBaseline, 'Legacy exclusion still executed the B1 bundle', tracker.snapshot());
      await bridge.setEnabled(false);
      const cleaned = await page.evaluate(() => {
        if (window.__squareCoilJobTimerUiVersion !== 'a4-legacy-v0.7') return false;
        return delete window.__squareCoilJobTimerUiVersion;
      });
      assert(cleaned, 'Harness could not remove its exact legacy seed');
      return { response, state, companionBundleParses: tracker.companionCount() };
    });

    await runBrowserCase(result.cases, family, ['B1-LC-012'], 'RUNTIME-GLOBAL', 'Malformed and unreadable runtime globals fail closed', async () => {
      const parseBaseline = tracker.companionCount();
      const malformedCreated = await page.evaluate(identity => {
        Object.defineProperty(window, '__squareCoilCompanionRuntime', {
          configurable: true,
          enumerable: false,
          writable: true,
          value: {
            __a4Seed: 'malformed-runtime',
            buildId: identity.buildId,
            packageVersion: identity.packageVersion,
            candidateFingerprint: identity.candidateFingerprint,
            documentToken: document.documentElement.dataset.squarecoilCompanionDocumentToken,
            runtimeInstanceId: 'a4-malformed-runtime-0001',
            getHealth: 'not-callable'
          }
        });
        return true;
      }, candidateIdentity);
      assert(malformedCreated, 'Harness could not seed a malformed runtime global');
      const malformedResponse = await bridge.setEnabled(true);
      const malformedState = await pageState(page);
      assert(malformedResponse?.classification === 'OWNERSHIP_CONFLICT', 'Malformed runtime global did not fail closed', malformedResponse);
      assert(malformedResponse?.reloadRequired === true, 'Malformed runtime global did not require reload', malformedResponse);
      assert(malformedState.rootCount === 0 && tracker.companionCount() === parseBaseline, 'Malformed runtime global allowed stacking', { malformedState, scripts: tracker.snapshot() });
      await bridge.setEnabled(false);
      const malformedRemoved = await page.evaluate(() => {
        const value = window.__squareCoilCompanionRuntime;
        if (value?.__a4Seed !== 'malformed-runtime') return false;
        return delete window.__squareCoilCompanionRuntime;
      });
      assert(malformedRemoved, 'Harness could not remove its exact malformed-runtime seed');

      await page.evaluate(() => {
        Object.defineProperty(window, '__squareCoilCompanionRuntime', {
          configurable: true,
          enumerable: false,
          get() { throw new Error('a4-unreadable-runtime-global'); }
        });
      });
      const unreadableResponse = await bridge.setEnabled(true);
      const unreadableState = await pageState(page);
      assert(unreadableResponse?.classification === 'OWNERSHIP_CONFLICT', 'Unreadable runtime global did not fail closed', unreadableResponse);
      assert(unreadableResponse?.reloadRequired === true, 'Unreadable runtime global did not require reload', unreadableResponse);
      assert(unreadableState.runtimeGlobalPresent && !unreadableState.runtimeGlobalReadable, 'Unreadable global probe evidence was lost', unreadableState);
      assert(unreadableState.rootCount === 0 && tracker.companionCount() === parseBaseline, 'Unreadable runtime global allowed stacking', { unreadableState, scripts: tracker.snapshot() });
      await bridge.setEnabled(false);
      const unreadableRemoved = await page.evaluate(() => delete window.__squareCoilCompanionRuntime);
      assert(unreadableRemoved, 'Harness could not remove its configurable unreadable-runtime seed');
      return { malformedResponse, malformedState, unreadableResponse, unreadableState, companionBundleParses: tracker.companionCount() };
    });

    await runBrowserCase(result.cases, family, ['B1-LC-016'], 'VERSION-MISMATCH', 'Build, package, and candidate mismatches require reload and are never hot-stacked', async () => {
      const parseBaseline = tracker.companionCount();
      const differentCandidate = candidateIdentity.candidateFingerprint === '0'.repeat(64) ? '1'.repeat(64) : '0'.repeat(64);
      const mismatchSeeds = [
        { name: 'build', buildId: 'a4-different-build-identity', packageVersion: candidateIdentity.packageVersion, candidateFingerprint: candidateIdentity.candidateFingerprint },
        { name: 'package', buildId: candidateIdentity.buildId, packageVersion: 'a4-different-package-version', candidateFingerprint: candidateIdentity.candidateFingerprint },
        { name: 'candidate', buildId: candidateIdentity.buildId, packageVersion: candidateIdentity.packageVersion, candidateFingerprint: differentCandidate }
      ];
      const mismatchEvidence = [];
      for (const mismatch of mismatchSeeds) {
        const seed = await page.evaluate(({ rootId, mismatch }) => {
          const root = document.createElement('section');
          root.id = rootId;
          root.dataset.squarecoilCompanionRoot = 'rebuild';
          root.dataset.runtimeInstanceId = `a4-${mismatch.name}-mismatch-runtime-0001`;
          root.dataset.buildId = mismatch.buildId;
          root.dataset.packageVersion = mismatch.packageVersion;
          root.dataset.candidateFingerprint = mismatch.candidateFingerprint;
          root.dataset.documentToken = document.documentElement.dataset.squarecoilCompanionDocumentToken;
          root.dataset.a4Seed = `${mismatch.name}-mismatch`;
          document.body.appendChild(root);
          return {
            name: mismatch.name,
            runtimeInstanceId: root.dataset.runtimeInstanceId,
            buildId: root.dataset.buildId,
            packageVersion: root.dataset.packageVersion,
            candidateFingerprint: root.dataset.candidateFingerprint
          };
        }, { rootId: ROOT_ID, mismatch });
        const response = await bridge.setEnabled(true);
        const state = await pageState(page);
        assert(response?.classification === 'VERSION_MISMATCH', `${mismatch.name} ownership was not classified as version mismatch`, response);
        assert(response?.reloadRequired === true, `${mismatch.name} mismatch did not require a reload boundary`, response);
        assert(state.runtimeGlobalPresent === false && state.rootCount === 1, `${mismatch.name} mismatch was deleted or hot-stacked`, state);
        assert(state.roots[0].buildId === seed.buildId && state.roots[0].packageVersion === seed.packageVersion && state.roots[0].candidateFingerprint === seed.candidateFingerprint, `${mismatch.name} mismatch identity evidence changed`, state);
        assert(tracker.companionCount() === parseBaseline, `${mismatch.name} mismatch executed the B1 bundle`, tracker.snapshot());
        await bridge.setEnabled(false);
        const removed = await page.evaluate(seedName => {
          const root = document.querySelector(`[data-a4-seed="${seedName}-mismatch"]`);
          if (!root) return false;
          root.remove();
          return true;
        }, mismatch.name);
        assert(removed, `Harness could not remove its exact ${mismatch.name}-mismatch seed`);
        mismatchEvidence.push({ seed, response, state });
      }
      return { candidateIdentity, mismatches: mismatchEvidence, companionBundleParses: tracker.companionCount() };
    });

    // The ownership-classification probes above intentionally create and tear
    // down short-lived runtimes. Reset their synthetic authority record and
    // worker before the canonical B1/B2 behavioral sequence so timing in those
    // probes cannot manufacture remembered Timer history.
    await bridge.removeStorage([AUTHORITY_STORAGE_KEY]);
    const setupWorker = serviceWorkerTarget(await browserCdp.send('Target.getTargets'), extensionId);
    if (setupWorker) {
      const closed = await browserCdp.send('Target.closeTarget', { targetId: setupWorker.targetId });
      assert(closed.success === true, 'Harness could not retire the synthetic setup worker', closed);
      await waitFor(
        async () => !serviceWorkerTarget(await browserCdp.send('Target.getTargets'), extensionId),
        'synthetic setup worker retirement',
        options.timeoutMs
      );
    }

    let activeRuntimeId = null;
    const primaryBootParseBaseline = tracker.companionCount();
    await runBrowserCase(result.cases, family, ['B1-LC-001', 'B1-LC-002', 'B1-LC-015'], 'BOOT', 'Concurrent boot creates one runtime and one root without false READY', async () => {
      const enableResponse = await bridge.setEnabled(true);
      const stable = await waitFor(async () => {
        const state = await pageState(page);
        return ['DEGRADED', 'READY', 'FAILED'].includes(state.health?.state) ? state : null;
      }, 'initial B1 lifecycle completion', options.timeoutMs);
      assertExpectedB1Shell(stable, 'initial boot', candidateIdentity);
      activeRuntimeId = stable.runtimeInstanceId;
      const responses = await bridge.sendConcurrent({ type: MESSAGES.BOOT }, 12);
      const repeated = await pageState(page);
      assertExpectedB1Shell(repeated, 'concurrent repeated boot', candidateIdentity);
      assert(repeated.runtimeInstanceId === activeRuntimeId, 'Repeated boot changed runtime identity', { activeRuntimeId, repeated });
      assert(repeated.rootCount === 1, 'Repeated boot stacked roots', repeated);
      assert(tracker.companionCount() === primaryBootParseBaseline + 1, 'Companion bundle was not injected exactly once for the primary boot', tracker.snapshot());
      assert(responses.every(response => response?.ready === false), 'A repeated B1 response falsely reported ready', responses);
      assert(responses.every(response => response?.health?.runtimeInstanceId === activeRuntimeId), 'Repeated responses did not join one runtime', responses);
      assert(responses.every(response => response?.health?.buildId === candidateIdentity.buildId && response?.health?.packageVersion === candidateIdentity.packageVersion && response?.health?.candidateFingerprint === candidateIdentity.candidateFingerprint), 'Repeated responses did not carry the exact candidate identity', responses);
      assert(responses.every(response => response?.classification === 'DEGRADED_SAME_BUILD'), 'Repeated responses were not the expected B1 degraded classification', responses);
      assert(responses.every(response => response?.injectionPerformed !== true), 'Repeated boot reported another injection', responses);
      return {
        enableResponse,
        directContentMessageIdentity: candidateIdentity,
        runtimeInstanceId: activeRuntimeId,
        rootCount: repeated.rootCount,
        companionBundleParses: tracker.companionCount(),
        repeatedResponses: responses.length,
        lifecycle: repeated.health
      };
    });

    await runB2TransitionBrowserCase(
      result.cases,
      family,
      ['B2-TRANSITION-001'],
      'ACTION7-START',
      'Exact action 7 evidence derives authoritative Timer state and settles effective READY',
      async () => {
        let core = await waitFor(async () => {
          const snapshot = await bridge.coreSnapshot();
          return ['ACTIVE', 'PENDING'].includes(snapshot?.timer?.timerState) &&
            snapshot.timer.currentContextId === 'job:260701' &&
            snapshot.bridge?.verificationInFlight === false
            ? snapshot
            : null;
        }, 'initial Bridge to Timer transition', options.timeoutMs);
        const derivedState = core.timer.timerState;
        if (derivedState === 'PENDING') {
          await bridge.timerAction('TIMER_START_FRESH');
          core = await waitFor(async () => {
            const snapshot = await bridge.coreSnapshot();
            return snapshot?.timer?.timerState === 'ACTIVE' && snapshot.timer.currentContextId === 'job:260701'
              ? snapshot
              : null;
          }, 'explicit fresh start from remembered Context', options.timeoutMs);
        }
        const shell = await pageState(page);
        const settledHealth = await bridge.send({ type: MESSAGES.HEALTH });
        assert(core.authorityOwner === true, 'Initial trusted transition core did not hold OWNER authority', core);
        assert(core.readModelError === null, 'Initial Timer read model failed', core);
        assert(Number.isSafeInteger(core.ledgerSegmentCount) && core.ledgerSegmentCount >= 0, 'Timer ledger diagnostics were unavailable', core);
        assert(core.bridge.capability === 'FULL', 'Packaged Bridge reported an unexpected capability', core.bridge);
        assert(core.bridge.requestCount >= 1 && core.bridge.nativeMutationRequestCount === 0, 'Packaged Bridge transport was not read-only action 7', core.bridge);
        assert(shell.health?.state === 'DEGRADED' && shell.health?.reason === EXPECTED_DEGRADED_REASON, 'MAIN shell no longer preserved its isolated-authority boundary', shell);
        assert(settledHealth?.ready === true && settledHealth?.health?.state === 'READY', 'Settled B2 health did not report READY', settledHealth);
        assert(settledHealth?.b2Settlement?.authorityDisposition === 'OWNER', 'Settled B2 health did not preserve positive OWNER evidence', settledHealth);
        assert(['NOT_REQUIRED', 'COMPLETE_MATCH'].includes(settledHealth?.b2Settlement?.migrationDisposition), 'Settled B2 health accepted unresolved migration', settledHealth);
        assert(settledHealth?.b2Settlement?.bridgeCapability === 'FULL', 'Settled B2 health did not report the actual Bridge capability', settledHealth);
        assert(result.network.action7.length >= 1, 'Synthetic action 7 endpoint was not called', result.network);
        assert(result.network.nativeMutationAttempts.length === 0, 'A native SquareCoil mutation was attempted', result.network.nativeMutationAttempts);
        return { derivedState, core, lifecycle: shell.health, settledHealth, action7Requests: result.network.action7.length };
      }
    );

    await runB2ReadyBrowserCase(
      result.cases,
      family,
      ['B2-READY-001'],
      'OWNER-POPUP',
      'OWNER effective health and the packaged popup report final B2 READY',
      async () => {
        const settledHealth = await bridge.send({ type: MESSAGES.HEALTH });
        assert(settledHealth?.ready === true && settledHealth?.health?.state === 'READY', 'OWNER effective health was not READY', settledHealth);
        assert(settledHealth?.b2Settlement?.authorityDisposition === 'OWNER', 'OWNER settlement lost its authority disposition', settledHealth);

        const popupPage = await context.newPage();
        try {
          await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`, { waitUntil: 'domcontentloaded', timeout: options.timeoutMs });
          const popupTarget = await popupPage.evaluate(async fixtureOrigin => {
            const candidates = await chrome.tabs.query({ url: `${fixtureOrigin}/*` });
            const target = candidates.find(tab => Number.isInteger(tab.id));
            if (!target) return { activated: false, reason: 'fixture-tab-not-found' };
            await chrome.tabs.update(target.id, { active: true });
            const active = await chrome.tabs.query({ active: true, currentWindow: true });
            return {
              activated: active?.[0]?.id === target.id,
              targetTabId: target.id,
              activeTabId: active?.[0]?.id ?? null,
              activeUrl: active?.[0]?.url || null
            };
          }, FIXTURE_ORIGIN);
          assert(popupTarget.activated === true, 'Harness could not restore the SquareCoil fixture as the popup target tab', popupTarget);
          await popupPage.evaluate(() => document.getElementById('refresh')?.click());
          let lastPopupHealth = null;
          let popupHealth;
          try {
            popupHealth = await waitFor(async () => popupPage.evaluate(() => ({
              stage: document.getElementById('stage')?.textContent || '',
              classification: document.getElementById('classification')?.textContent || '',
              lifecycle: document.getElementById('lifecycle')?.textContent || '',
              reason: document.getElementById('reason')?.textContent || '',
              healthTone: document.body.dataset.health || '',
              explanation: document.querySelector('.health > p')?.textContent || ''
            })).then(value => {
              lastPopupHealth = value;
              return value.lifecycle === 'READY' ? value : null;
            }), 'packaged popup READY rendering', options.timeoutMs);
          } catch (error) {
            error.details = { popupTarget, popupUrl: popupPage.url(), lastPopupHealth };
            throw error;
          }
          assert(popupHealth.stage === 'B2 · Settlement-gated runtime', 'Popup stage did not identify the final B2 settlement runtime', popupHealth);
          assert(popupHealth.classification === 'HEALTHY_SAME_BUILD', 'Popup did not display healthy same-build classification', popupHealth);
          assert(popupHealth.reason === 'ready' && popupHealth.healthTone === 'ok', 'Popup did not render positive READY health', popupHealth);
          assert(popupHealth.explanation.includes('Incomplete or blocked checks stay degraded.'), 'Popup did not retain fail-closed settlement guidance', popupHealth);
          return { settledHealth, popupTarget, popupHealth };
        } finally {
          await popupPage.close().catch(() => {});
          await page.bringToFront().catch(() => {});
        }
      }
    );

    await runB2KernelBrowserCase(
      result.cases,
      family,
      ['B2-KERNEL-001'],
      [],
      'MULTI-TAB',
      'Two tabs share one authority kernel and settle READY as OWNER and non-writing OBSERVER',
      async () => {
        assert(activeRuntimeId, 'Initial runtime was unavailable because the prerequisite case failed');
        const primaryAuthorityBefore = await waitFor(async () => {
          const snapshot = await bridge.authoritySnapshot();
          return snapshot?.healthy === true ? snapshot : null;
        }, 'primary isolated authority health', options.timeoutMs);
        const primaryBeforeState = await pageState(page);
        assertExpectedB1Shell(primaryBeforeState, 'primary multi-tab shell', candidateIdentity);
        assertHealthyB2KernelAuthority(primaryAuthorityBefore, 'primary multi-tab authority', primaryBeforeState);

        const observerPage = await context.newPage();
        let observerBridge = null;
        let evidence = null;
        observerPage.on('console', message => {
          if (message.type() === 'error' || message.type() === 'warning') result.console.errors.push({ type: message.type(), text: message.text(), page: 'observer' });
        });
        observerPage.on('pageerror', error => result.console.pageErrors.push(`observer: ${String(error?.message || error)}`));
        try {
          await observerPage.goto(`${FIXTURE_ORIGIN}${FIXTURE_PATH}`, { waitUntil: 'domcontentloaded', timeout: options.timeoutMs });
          await waitFor(async () => (await pageState(observerPage)).documentToken, 'observer content-controller document identity', options.timeoutMs);
          observerBridge = new ContentBridge(context, observerPage, extensionId, options.timeoutMs, candidateIdentity);
          await observerBridge.initialize();

          const observerAuthority = await waitFor(async () => {
            const snapshot = await observerBridge.authoritySnapshot();
            return snapshot?.healthy === true ? snapshot : null;
          }, 'observer isolated authority health', options.timeoutMs);
          const primaryAuthority = await waitFor(async () => {
            const snapshot = await bridge.authoritySnapshot();
            return snapshot?.healthy === true ? snapshot : null;
          }, 'primary authority health with observer connected', options.timeoutMs);
          const primaryState = await pageState(page);
          const observerState = await pageState(observerPage);

          assertExpectedB1Shell(primaryState, 'primary shell with observer', candidateIdentity);
          assertExpectedB1Shell(observerState, 'observer shell', candidateIdentity);
          assertHealthyB2KernelAuthority(primaryAuthority, 'primary authority with observer', primaryState);
          assertHealthyB2KernelAuthority(observerAuthority, 'observer authority', observerState);
          assert(primaryAuthority.disposition === 'OWNER', 'First tab did not retain OWNER authority', { primaryAuthority, observerAuthority });
          assert(observerAuthority.disposition === 'OBSERVER_CONNECTED', 'Second tab did not join as OBSERVER_CONNECTED', { primaryAuthority, observerAuthority });
          assert(primaryAuthority.workerInstanceId === observerAuthority.workerInstanceId, 'Tabs did not connect to one worker authority', { primaryAuthority, observerAuthority });
          assert(primaryAuthority.revision === observerAuthority.revision, 'Tabs did not observe the same authoritative revision', { primaryAuthority, observerAuthority });
          assert(primaryState.health?.state !== 'READY' && observerState.health?.state !== 'READY', 'Isolated MAIN shells bypassed worker-owned settlement', { primaryState, observerState });
          const effectiveHealth = await waitFor(async () => {
            const owner = await bridge.send({ type: MESSAGES.HEALTH });
            const observer = await observerBridge.send({ type: MESSAGES.HEALTH });
            return owner?.ready === true && observer?.ready === true ? { owner, observer } : null;
          }, 'OWNER and OBSERVER effective READY settlement', options.timeoutMs);
          assert(effectiveHealth.owner.b2Settlement?.authorityDisposition === 'OWNER', 'Primary effective health did not settle as OWNER', effectiveHealth);
          assert(effectiveHealth.observer.b2Settlement?.authorityDisposition === 'OBSERVER_CONNECTED', 'Observer effective health did not settle as OBSERVER_CONNECTED', effectiveHealth);
          const observerCore = await observerBridge.coreSnapshot();
          assert(observerCore?.authorityOwner === false, 'Observer trusted core became an authority owner', observerCore);
          assert(observerCore?.bridge?.owner === false && observerCore.bridge.requestCount === 0, 'Observer Bridge became a verification writer', observerCore?.bridge);
          evidence = {
            primaryAuthority,
            observerAuthority,
            effectiveHealth,
            observerCore,
            primaryRuntimeInstanceId: primaryState.runtimeInstanceId,
            observerRuntimeInstanceId: observerState.runtimeInstanceId,
            sharedRevision: primaryAuthority.revision,
            sharedWorkerInstanceId: primaryAuthority.workerInstanceId
          };
        } finally {
          try {
            if (observerBridge) {
              const observerCleanup = await observerBridge.authorityTeardown();
              assert(observerCleanup?.disconnected === true, 'Observer authority teardown did not confirm disconnection', observerCleanup);
              const observerAuthorityAfterCleanup = await observerBridge.authoritySnapshot();
              assert(
                observerAuthorityAfterCleanup?.enabled === false && observerAuthorityAfterCleanup?.healthy === false,
                'Observer isolated authority remained active after teardown',
                observerAuthorityAfterCleanup
              );
              if (evidence) {
                evidence.observerCleanup = observerCleanup;
                evidence.observerAuthorityAfterCleanup = observerAuthorityAfterCleanup;
              }
            }
          } finally {
            if (observerBridge) await observerBridge.detach();
            await observerPage.close().catch(() => {});
          }
        }

        assert(evidence, 'Multi-tab authority evidence was not captured');
        const afterCleanup = await waitFor(async () => {
          const snapshot = await bridge.authoritySnapshot();
          return snapshot?.healthy === true && snapshot.disposition === 'OWNER' ? snapshot : null;
        }, 'primary OWNER authority after observer cleanup', options.timeoutMs);
        const fixturePages = context.pages().filter(candidate => candidate.url() === `${FIXTURE_ORIGIN}${FIXTURE_PATH}`);
        assert(fixturePages.length === 1 && fixturePages[0] === page, 'Observer fixture page was not cleaned up', fixturePages.map(candidate => candidate.url()));
        assertHealthyB2KernelAuthority(afterCleanup, 'primary authority after observer cleanup', await pageState(page));
        return { ...evidence, afterCleanup, remainingFixturePages: fixturePages.length };
      },
      { b2ReadyFixtureIds: ['B2-READY-002'] }
    );

    await runB2TransitionBrowserCase(
      result.cases,
      family,
      ['B2-TRANSITION-002', 'B2-TRANSITION-003'],
      'OWNER-OBSERVER-SWITCH',
      'OWNER and OBSERVER synchronize one atomic Job A to Job B transition',
      async () => {
        const observerPage = await context.newPage();
        let observerBridge = null;
        try {
          await observerPage.goto(`${FIXTURE_ORIGIN}${FIXTURE_PATH}`, { waitUntil: 'domcontentloaded', timeout: options.timeoutMs });
          await waitFor(async () => (await pageState(observerPage)).documentToken, 'B2.2 observer document identity', options.timeoutMs);
          observerBridge = new ContentBridge(context, observerPage, extensionId, options.timeoutMs, candidateIdentity);
          await observerBridge.initialize();
          const before = await waitFor(async () => {
            const ownerCore = await bridge.coreSnapshot();
            const observerCore = await observerBridge.coreSnapshot();
            return ownerCore?.authorityOwner === true && observerCore?.authorityOwner === false &&
              ownerCore.bridge?.initialized === true && observerCore.bridge?.initialized === true &&
              ownerCore.revision === observerCore.revision && ownerCore.timer?.currentContextId === 'job:260701' &&
              observerCore.timer?.currentContextId === 'job:260701'
              ? { ownerCore, observerCore }
              : null;
          }, 'synchronized B2.2 OWNER and OBSERVER read models', options.timeoutMs);
          assert(before.observerCore.bridge.requestCount === 0, 'OBSERVER issued a server verification request', before.observerCore.bridge);

          await page.waitForTimeout(25);
          transitionFixture.clockContext = { projectId: '260702', label: '260702 - Fabrication' };
          await page.evaluate(contextValue => {
            for (const selector of ['#clockin-remaining-time', '#clockin-debug']) {
              const element = document.querySelector(selector);
              if (!element) continue;
              element.innerHTML = selector === '#clockin-remaining-time'
                ? `<a href="/project.php?id=${contextValue.projectId}">${contextValue.label}</a>`
                : '';
            }
          }, transitionFixture.clockContext);
          await bridge.syncBridge();
          let lastPropagation = null;
          let after;
          try {
            after = await waitFor(async () => {
              const ownerCore = await bridge.coreSnapshot();
              const observerCore = await observerBridge.coreSnapshot();
              lastPropagation = { ownerCore, observerCore };
              return ownerCore?.timer?.currentContextId === 'job:260702' &&
                observerCore?.timer?.currentContextId === 'job:260702' &&
                ownerCore.bridge?.initialized === true && observerCore.bridge?.initialized === true &&
                ownerCore.revision === observerCore.revision &&
                ownerCore.ledgerSegmentCount === 1 && observerCore.ledgerSegmentCount === 1
                ? lastPropagation
                : null;
            }, 'atomic Job A to Job B propagation', options.timeoutMs);
          } catch (error) {
            error.details = {
              before,
              lastPropagation,
              action7Requests: result.network.action7.length,
              fixtureContext: transitionFixture.clockContext
            };
            throw error;
          }
          assert(after.ownerCore.revision === before.ownerCore.revision + 1, 'Job switch did not commit as one authoritative revision', { before, after });
          assert(after.ownerCore.timer.todayTotalMs > 0, 'Closed Job A interval was not reflected in today total', after.ownerCore.timer);
          assert(after.ownerCore.timer.currentContextTotalMs >= 0, 'Job B total was unavailable', after.ownerCore.timer);
          assert(after.observerCore.bridge.requestCount === 0, 'OBSERVER became a duplicate Bridge writer during the switch', after.observerCore.bridge);
          assert(result.network.nativeMutationAttempts.length === 0, 'Job switch attempted a native SquareCoil mutation', result.network.nativeMutationAttempts);
          return { before, after, action7Requests: result.network.action7.length };
        } finally {
          if (observerBridge) {
            await observerBridge.authorityTeardown().catch(() => {});
            await observerBridge.detach();
          }
          await observerPage.close().catch(() => {});
        }
      }
    );

    await runBrowserCase(result.cases, family, ['B1-LC-003', 'B1-LC-014'], 'RECOVERY', 'Dead interaction and removed root recover in place', async () => {
      assert(activeRuntimeId, 'Initial runtime was unavailable because the prerequisite case failed');
      const dead = await page.evaluate(({ rootId, probeEvent }) => {
        const root = document.getElementById(rootId);
        if (!root) return { patched: false };
        root.__a4OriginalDispatchEvent = root.dispatchEvent;
        root.dispatchEvent = function(event) {
          if (event?.type === probeEvent) return true;
          return root.__a4OriginalDispatchEvent.call(this, event);
        };
        return { patched: true, interactionReady: window.__squareCoilCompanionRuntime.getHealth().ui.interactionReady };
      }, { rootId: ROOT_ID, probeEvent: 'squarecoil-companion:interaction-probe' });
      assert(dead.patched && dead.interactionReady === false, 'Could not safely create a dead interaction path', dead);
      await page.evaluate(rootId => {
        const root = document.getElementById(rootId);
        if (root?.__a4OriginalDispatchEvent) {
          root.dispatchEvent = root.__a4OriginalDispatchEvent;
          delete root.__a4OriginalDispatchEvent;
        }
      }, ROOT_ID);
      const revalidated = await bridge.send({ type: MESSAGES.REVALIDATE });
      const repairedInteraction = await waitFor(async () => {
        const state = await pageState(page);
        return state.health?.ui?.interactionReady === true &&
          state.health?.state === 'DEGRADED' &&
          state.health?.reason === EXPECTED_DEGRADED_REASON
          ? state
          : null;
      }, 'dead-interaction recovery', options.timeoutMs);
      assertExpectedB1Shell(repairedInteraction, 'dead-interaction recovery', candidateIdentity);
      assert(repairedInteraction.runtimeInstanceId === activeRuntimeId, 'Interaction recovery replaced the runtime', repairedInteraction);

      const removedMarker = await page.evaluate(rootId => {
        const root = document.getElementById(rootId);
        if (!root) return null;
        root.dataset.a4RemovedMarker = 'removed-root';
        root.remove();
        return 'removed-root';
      }, ROOT_ID);
      assert(removedMarker === 'removed-root', 'Could not remove the owned root');
      const repairedRoot = await waitFor(async () => {
        const state = await pageState(page);
        return state.rootCount === 1 && state.roots[0].lifecycleReason === EXPECTED_DEGRADED_REASON && state.health?.ui?.interactionReady === true ? state : null;
      }, 'removed-root recovery', options.timeoutMs);
      assertExpectedB1Shell(repairedRoot, 'removed-root recovery', candidateIdentity);
      assert(repairedRoot.runtimeInstanceId === activeRuntimeId, 'Root recovery replaced the runtime', repairedRoot);
      assert(tracker.companionCount() === primaryBootParseBaseline + 1, 'Recovery reinjected the companion bundle', tracker.snapshot());
      return { revalidated, runtimeInstanceId: activeRuntimeId, companionBundleParses: tracker.companionCount() };
    });

    await runBrowserCase(result.cases, family, ['B1-LC-013'], 'UNSUPPORTED', 'Iframe and unsupported document allocate nothing', async () => {
      const child = await waitFor(() => page.frames().find(frame => frame !== page.mainFrame() && new URL(frame.url()).pathname === FRAME_PATH), 'synthetic child frame', options.timeoutMs);
      const childState = await child.evaluate(({ rootId, runtimeKey, tokenKey }) => {
        const roots = new Set([
          ...document.querySelectorAll(`#${rootId}`),
          ...document.querySelectorAll('[data-squarecoil-companion-root="rebuild"]')
        ]);
        return {
          runtimePresent: Object.prototype.hasOwnProperty.call(window, runtimeKey),
          rootCount: roots.size,
          documentToken: document.documentElement?.dataset?.[tokenKey] || null
        };
      }, { rootId: ROOT_ID, runtimeKey: RUNTIME_KEY, tokenKey: DOCUMENT_TOKEN_DATASET_KEY });
      assert(childState.runtimePresent === false && childState.rootCount === 0 && childState.documentToken === null, 'Iframe allocated companion state', childState);

      const unsupported = await context.newPage();
      try {
        await unsupported.goto(UNSUPPORTED_URL, { waitUntil: 'domcontentloaded', timeout: options.timeoutMs });
        await unsupported.waitForTimeout(500);
        const unsupportedState = await pageState(unsupported);
        assert(unsupportedState.runtimeGlobalPresent === false, 'Unsupported origin allocated a runtime', unsupportedState);
        assert(unsupportedState.rootCount === 0, 'Unsupported origin allocated a root', unsupportedState);
        assert(unsupportedState.documentToken === null, 'Unsupported origin received a content-controller identity', unsupportedState);
        return { childState, unsupportedState };
      } finally {
        await unsupported.close().catch(() => {});
      }
    });

    await runB2KernelBrowserCase(result.cases, family, ['B2-KERNEL-002'], ['B1-LC-005'], 'WORKER-RESTART', 'Service-worker restart reconnects isolated authority while reusing the live page runtime', async () => {
      assert(activeRuntimeId, 'Initial runtime was unavailable because the prerequisite case failed');
      const authorityBefore = await waitFor(async () => {
        const snapshot = await bridge.authoritySnapshot();
        return snapshot?.healthy === true ? snapshot : null;
      }, 'isolated authority before service-worker restart', options.timeoutMs);
      assertHealthyB2KernelAuthority(authorityBefore, 'authority before service-worker restart', await pageState(page));
      const persistedBeforeResult = await bridge.getStorage([AUTHORITY_STORAGE_KEY]);
      const persistedBefore = persistedBeforeResult?.[AUTHORITY_STORAGE_KEY];
      assert(persistedBefore && typeof persistedBefore === 'object', 'Persisted authority envelope was unavailable before service-worker restart', { recordPresent: Boolean(persistedBefore) });
      assert(persistedBefore.document && typeof persistedBefore.document === 'object', 'Persisted authoritative document was unavailable before service-worker restart', { documentPresent: Boolean(persistedBefore?.document) });
      assert(persistedBefore.document.revision === authorityBefore.revision, 'Persisted and isolated authority revisions differed before restart', { authorityBefore, persistedBeforeRevision: persistedBefore.document.revision });
      const persistedDocumentBeforeSha256 = jsonSha256(persistedBefore.document);
      let targets = await browserCdp.send('Target.getTargets');
      const before = await waitFor(async () => serviceWorkerTarget(await browserCdp.send('Target.getTargets'), extensionId), 'extension service-worker target', options.timeoutMs);
      const closed = await browserCdp.send('Target.closeTarget', { targetId: before.targetId });
      assert(closed.success === true, 'Browser did not close the service-worker target', closed);
      const terminationObserved = await waitFor(
        async () => !serviceWorkerTarget(await browserCdp.send('Target.getTargets'), extensionId),
        'service-worker termination',
        options.timeoutMs
      );
      const response = await bridge.send({ type: MESSAGES.HEALTH });
      const after = await waitFor(async () => serviceWorkerTarget(await browserCdp.send('Target.getTargets'), extensionId), 'service-worker restart', options.timeoutMs);
      let authorityAfter = await waitFor(async () => {
        const snapshot = await bridge.authoritySnapshot();
        return snapshot?.healthy === true &&
          ['OWNER', 'OBSERVER_CONNECTED'].includes(snapshot.disposition) &&
          isConcreteIdentity(snapshot.workerInstanceId) &&
          snapshot.workerInstanceId !== authorityBefore.workerInstanceId
          ? snapshot
          : null;
      }, 'autonomous isolated-authority heartbeat reconnection to the restarted worker', options.timeoutMs);
      targets = await browserCdp.send('Target.getTargets');
      const state = await pageState(page);
      assertExpectedB1Shell(state, 'service-worker restart', candidateIdentity);
      assertHealthyB2KernelAuthority(authorityAfter, 'authority after service-worker restart', state);
      assert(state.runtimeInstanceId === activeRuntimeId, 'Worker restart replaced the live page runtime', state);
      assert(response?.health?.runtimeInstanceId === activeRuntimeId, 'Restarted worker did not reuse the live runtime', response);
      assert(response?.classification === 'HEALTHY_SAME_BUILD' && response?.ready === true, 'Fresh settlement did not reconnect through the restarted worker before reporting READY', response);
      assert(response?.b2Settlement?.authorityDisposition === 'OWNER', 'Post-restart settlement did not retain OWNER authority', response);
      assert(authorityAfter.workerInstanceId !== authorityBefore.workerInstanceId, 'Isolated authority retained the terminated worker identity', { authorityBefore, authorityAfter });
      assert(authorityBefore.disposition === 'OWNER' && authorityAfter.disposition === 'OWNER', 'Worker restart did not preserve OWNER disposition', { authorityBefore, authorityAfter });
      assert(authorityAfter.coordinationEpoch === authorityBefore.coordinationEpoch, 'Worker restart changed the live ownership epoch', { authorityBefore, authorityAfter });
      const synchronizedAfter = await waitFor(async () => {
        const authority = await bridge.authoritySnapshot();
        const persisted = (await bridge.getStorage([AUTHORITY_STORAGE_KEY]))?.[AUTHORITY_STORAGE_KEY];
        return authority?.healthy === true && persisted?.document?.revision === authority.revision
          ? { authority, persisted }
          : null;
      }, 'post-restart authority and persistence revision convergence', options.timeoutMs);
      authorityAfter = synchronizedAfter.authority;
      const persistedAfter = synchronizedAfter.persisted;
      assert(persistedAfter && typeof persistedAfter === 'object', 'Persisted authority envelope was unavailable after service-worker restart', { recordPresent: Boolean(persistedAfter) });
      assert(persistedAfter.document && typeof persistedAfter.document === 'object', 'Persisted authoritative document was unavailable after service-worker restart', { documentPresent: Boolean(persistedAfter?.document) });
      assert(persistedAfter.document.revision === authorityAfter.revision, 'Persisted and isolated authority revisions differed after restart', { authorityAfter, persistedAfterRevision: persistedAfter.document.revision });
      const persistedDocumentAfterSha256 = jsonSha256(persistedAfter.document);
      assert(authorityAfter.revision >= authorityBefore.revision, 'Worker restart regressed the authoritative document revision', { authorityBefore, authorityAfter });
      if (authorityAfter.revision === authorityBefore.revision) {
        assert(persistedDocumentAfterSha256 === persistedDocumentBeforeSha256, 'Stable-revision worker restart changed the persisted authoritative document', {
          persistedDocumentBeforeSha256,
          persistedDocumentAfterSha256
        });
      }
      assert(tracker.companionCount() === primaryBootParseBaseline + 1, 'Worker restart reinjected the companion bundle', tracker.snapshot());
      return {
        beforeTargetId: before.targetId,
        afterTargetId: after.targetId,
        browserTargetIdChanged: before.targetId !== after.targetId,
        workerInstanceIdChanged: authorityAfter.workerInstanceId !== authorityBefore.workerInstanceId,
        terminationObserved,
        serviceWorkerTargets: targets.targetInfos.filter(target => target.type === 'service_worker' && target.url.startsWith(`chrome-extension://${extensionId}/`)),
        response,
        authorityBefore,
        authorityAfter,
        persistedDocumentBefore: {
          revision: persistedBefore.document.revision,
          sha256: persistedDocumentBeforeSha256
        },
        persistedDocumentAfter: {
          revision: persistedAfter.document.revision,
          sha256: persistedDocumentAfterSha256
        },
        runtimeInstanceId: state.runtimeInstanceId,
        companionBundleParses: tracker.companionCount()
      };
    });

    const bfcacheCase = await runBrowserCase(result.cases, family, ['B1-LC-008'], 'BFCACHE', 'Real BFCache restore revalidates without duplicate resources', async () => {
      assert(activeRuntimeId, 'Initial runtime was unavailable because the prerequisite case failed');
      const parseBaseline = tracker.companionCount();
      await page.evaluate(() => {
        window.__a4BfCacheEvents = [];
        window.addEventListener('pageshow', event => window.__a4BfCacheEvents.push({ persisted: event.persisted, time: performance.now() }));
      });
      await page.goto(UNSUPPORTED_URL, { waitUntil: 'domcontentloaded', timeout: options.timeoutMs });
      await page.goBack({ waitUntil: 'commit', timeout: options.timeoutMs });
      const restored = await waitFor(async () => {
        const state = await pageState(page);
        return state.health?.ui?.interactionReady === true ? state : null;
      }, 'BFCache-restored runtime health', options.timeoutMs);
      const events = await page.evaluate(() => window.__a4BfCacheEvents || []);
      if (!events.some(event => event.persisted === true)) {
        throw new UnsupportedCase('The branded browser did not place the synthetic page in BFCache; no persisted pageshow event was observed');
      }
      assertExpectedB1Shell(restored, 'BFCache restore', candidateIdentity);
      assert(restored.runtimeInstanceId === activeRuntimeId, 'BFCache restore replaced the runtime generation', restored);
      assert(restored.rootCount === 1, 'BFCache restore duplicated or lost the root', restored);
      assert(tracker.companionCount() === parseBaseline, 'BFCache restore re-executed the companion bundle', tracker.snapshot());
      return { events, runtimeInstanceId: restored.runtimeInstanceId, companionBundleParses: tracker.companionCount() };
    });
    if (bfcacheCase.status === 'UNSUPPORTED') {
      result.status = 'UNSUPPORTED';
      return result;
    }

    await runB2TransitionLifecycleBrowserCase(result.cases, family, ['B2-TRANSITION-004'], ['B1-LC-006'], 'CLEAN-TOGGLE', 'Clean disable finalizes Timer once and re-enable creates a fresh runtime generation', async () => {
      assert(activeRuntimeId, 'Initial runtime was unavailable because the prerequisite case failed');
      const coreBeforeDisable = await bridge.coreSnapshot();
      assert(coreBeforeDisable?.timer && coreBeforeDisable.timer.timerState !== 'IDLE', 'Clean toggle had no Timer state to finalize', coreBeforeDisable);
      const disabledResponse = await bridge.setEnabled(false);
      const disabled = await waitFor(async () => {
        const state = await pageState(page);
        return !state.runtimeGlobalPresent && state.rootCount === 0 ? state : null;
      }, 'clean disable teardown', options.timeoutMs);
      assert(disabled.claimPresent === false && disabled.bootstrapPresent === false, 'Clean disable retained injection markers', disabled);
      const persistedAfterDisable = (await bridge.getStorage([AUTHORITY_STORAGE_KEY]))?.[AUTHORITY_STORAGE_KEY]?.document;
      assert(persistedAfterDisable?.timer && persistedAfterDisable.timer.active === null && persistedAfterDisable.timer.pending === null && persistedAfterDisable.timer.localPause === null, 'Clean disable did not finalize Timer state to IDLE', persistedAfterDisable?.timer);
      const repeatedDisableResponse = await bridge.setEnabled(false);
      const persistedAfterRepeatedDisable = (await bridge.getStorage([AUTHORITY_STORAGE_KEY]))?.[AUTHORITY_STORAGE_KEY]?.document;
      assert(persistedAfterRepeatedDisable?.revision === persistedAfterDisable.revision, 'Repeated disable committed a second Timer transition', {
        firstRevision: persistedAfterDisable?.revision,
        repeatedRevision: persistedAfterRepeatedDisable?.revision
      });
      assert(result.network.nativeMutationAttempts.length === 0, 'Disable attempted a native SquareCoil mutation', result.network.nativeMutationAttempts);
      const enabledResponse = await bridge.setEnabled(true);
      const fresh = await waitFor(async () => {
        const state = await pageState(page);
        return state.health?.state === 'DEGRADED' && state.runtimeInstanceId !== activeRuntimeId ? state : null;
      }, 'fresh re-enabled runtime', options.timeoutMs);
      assertExpectedB1Shell(fresh, 'clean re-enable', candidateIdentity);
      assert(fresh.runtimeInstanceId !== activeRuntimeId, 'Re-enable reused a retired runtime identity', fresh);
      assert(tracker.companionCount() === primaryBootParseBaseline + 2, 'Re-enable did not produce exactly one fresh bundle execution', tracker.snapshot());
      const priorRuntimeId = activeRuntimeId;
      activeRuntimeId = fresh.runtimeInstanceId;
      return {
        disabledResponse,
        repeatedDisableResponse,
        timerBeforeDisable: coreBeforeDisable.timer,
        authoritativeRevisionAfterDisable: persistedAfterDisable.revision,
        enabledResponse,
        priorRuntimeInstanceId: priorRuntimeId,
        freshRuntimeInstanceId: activeRuntimeId,
        companionBundleParses: tracker.companionCount()
      };
    });

    await runBrowserCase(result.cases, family, ['B1-LC-009'], 'STALE-RESPONSE', 'A delayed stale response cannot overwrite the newer disabled state', async () => {
      assert(activeRuntimeId, 'Fresh runtime was unavailable because the prerequisite case failed');
      const parseBaseline = tracker.companionCount();
      const installed = await bridge.installOneShotResponseHold(MESSAGES.REVALIDATE);
      if (!installed?.installed) throw new UnsupportedCase(`Content response fencing could not be instrumented safely: ${installed?.reason || 'unknown reason'}`);
      let release = null;
      try {
        await bridge.dispatchPersistedPageShow();
        await waitFor(async () => (await bridge.heldResponseCount()) === 1, 'one delayed revalidation response', options.timeoutMs);

        const disabledResponse = await bridge.setEnabled(false);
        const disabled = await waitFor(async () => {
          const state = await pageState(page);
          return state.controller === 'disabled' && !state.runtimeGlobalPresent && state.rootCount === 0 ? state : null;
        }, 'newer disabled publication', options.timeoutMs);
        release = await bridge.releaseAndRestoreResponseHold();
        assert(release.restored === true && release.released === 1, 'Held response was not released and restored exactly once', release);
        await page.waitForTimeout(150);
        const afterStale = await pageState(page);
        assert(afterStale.controller === 'disabled', 'Stale revalidation response overwrote the newer disabled controller state', afterStale);
        assert(afterStale.runtimeGlobalPresent === false && afterStale.rootCount === 0, 'Stale revalidation response recreated runtime resources', afterStale);
        assert(tracker.companionCount() === parseBaseline, 'Stale response caused a bundle execution', tracker.snapshot());

        const enabledResponse = await bridge.setEnabled(true);
        const fresh = await waitFor(async () => {
          const state = await pageState(page);
          return state.health?.state === 'DEGRADED' && state.runtimeInstanceId !== activeRuntimeId ? state : null;
        }, 'fresh runtime after stale-response fence', options.timeoutMs);
        assertExpectedB1Shell(fresh, 'stale-response fence restart', candidateIdentity);
        assert(tracker.companionCount() === parseBaseline + 1, 'Restart after stale response did not execute exactly one fresh bundle', tracker.snapshot());
        const priorRuntimeId = activeRuntimeId;
        activeRuntimeId = fresh.runtimeInstanceId;
        return { installed, disabledResponse, disabled, release, afterStale, enabledResponse, priorRuntimeId, freshRuntimeId: activeRuntimeId, companionBundleParses: tracker.companionCount() };
      } finally {
        if (!release) await bridge.releaseAndRestoreResponseHold().catch(() => {});
      }
    });

    await runBrowserCase(result.cases, family, ['B1-LC-007'], '23', 'Failed cleanup remains sticky until explicit cleanup-only retry succeeds', async () => {
      assert(activeRuntimeId, 'Fresh runtime was unavailable because the prerequisite case failed');
      const patch = await page.evaluate(rootId => {
        const root = document.getElementById(rootId);
        if (!root || typeof root.remove !== 'function') return { patched: false };
        root.__a4OriginalRemove = root.remove;
        root.remove = function() { throw new Error('a4-injected-root-removal-failure'); };
        return { patched: root.remove !== root.__a4OriginalRemove };
      }, ROOT_ID);
      if (!patch.patched) throw new UnsupportedCase('The owned root could not be safely instrumented for a cleanup failure');

      const disableResponse = await bridge.setEnabled(false);
      const failed = await waitFor(async () => {
        const state = await pageState(page);
        return state.health?.state === 'FAILED' && state.health?.reason === 'teardown-incomplete' ? state : null;
      }, 'sticky failed cleanup state', options.timeoutMs);
      assert(failed.runtimeInstanceId === activeRuntimeId, 'Failed cleanup lost its owning runtime', failed);
      assert(failed.health.mode === 'DISABLED', 'Failed cleanup did not remain disabled', failed.health);
      assert(failed.health.cleanupRequired === true, 'Failed cleanup did not advertise cleanupRequired', failed.health);
      assert(failed.health.outstandingResources?.includes('ui'), 'Failed cleanup did not retain UI ownership', failed.health);
      assert(failed.health.outstandingResources?.includes('ownership'), 'Failed cleanup did not retain runtime ownership', failed.health);
      const parseCountAtFailure = tracker.companionCount();

      const disabledBoot = await bridge.send({ type: MESSAGES.BOOT });
      const blockedEnable = await bridge.setEnabled(true);
      const failedRetry = await bridge.send({ type: MESSAGES.RETRY });
      const stillFailed = await pageState(page);
      assert(stillFailed.health?.state === 'FAILED' && stillFailed.health?.reason === 'teardown-incomplete', 'A normal command cleared sticky cleanup failure', stillFailed);
      assert(stillFailed.runtimeInstanceId === activeRuntimeId, 'A normal command replaced failed runtime ownership', stillFailed);
      assert(tracker.companionCount() === parseCountAtFailure, 'A normal command reinjected over failed ownership', tracker.snapshot());
      assert(disabledBoot?.health?.reason === 'teardown-incomplete', 'Disabled boot did not observe sticky failure', disabledBoot);
      assert(blockedEnable?.health?.reason === 'teardown-incomplete', 'Enable was not blocked by sticky failure', blockedEnable);
      assert(failedRetry?.health?.reason === 'teardown-incomplete', 'Failed cleanup retry did not remain sticky', failedRetry);

      const restored = await page.evaluate(rootId => {
        const root = document.getElementById(rootId);
        if (!root?.__a4OriginalRemove) return false;
        root.remove = root.__a4OriginalRemove;
        delete root.__a4OriginalRemove;
        return true;
      }, ROOT_ID);
      assert(restored, 'Could not restore the root removal method after injected failure');
      const successfulRetry = await bridge.send({ type: MESSAGES.RETRY });
      const cleaned = await waitFor(async () => {
        const state = await pageState(page);
        return !state.runtimeGlobalPresent && state.rootCount === 0 ? state : null;
      }, 'successful cleanup-only retry', options.timeoutMs);
      assert(successfulRetry?.cleanupComplete === true, 'Explicit cleanup retry did not report completion', successfulRetry);
      assert(successfulRetry?.restartAvailable === true, 'Completed cleanup did not advertise a fresh restart', successfulRetry);
      assert(cleaned.claimPresent === false && cleaned.bootstrapPresent === false, 'Cleanup retry retained ownership markers', cleaned);

      const restartedResponse = await bridge.setEnabled(true);
      const fresh = await waitFor(async () => {
        const state = await pageState(page);
        return state.health?.state === 'DEGRADED' && state.runtimeInstanceId !== activeRuntimeId ? state : null;
      }, 'fresh runtime after cleanup-only retry', options.timeoutMs);
      assertExpectedB1Shell(fresh, 'fresh runtime after cleanup retry', candidateIdentity);
      assert(tracker.companionCount() === parseCountAtFailure + 1, 'Cleanup completion did not allow exactly one fresh bundle execution', tracker.snapshot());
      const failedRuntimeId = activeRuntimeId;
      activeRuntimeId = fresh.runtimeInstanceId;
      return {
        disableResponse,
        failedRuntimeId,
        failedState: failed.health,
        disabledBoot,
        blockedEnable,
        failedRetry,
        successfulRetry,
        restartedResponse,
        freshRuntimeId: activeRuntimeId,
        companionBundleParses: tracker.companionCount()
      };
    });

    await runB2TransitionBrowserCase(
      result.cases,
      family,
      ['B2-TRANSITION-005'],
      'LEGACY-PREFLIGHT',
      'Malformed legacy migration fails closed without exposing stored values',
      async () => {
        await bridge.setEnabled(false);
        await waitFor(async () => {
          const state = await pageState(page);
          return !state.runtimeGlobalPresent && state.rootCount === 0 ? state : null;
        }, 'legacy preflight setup disable', options.timeoutMs);
        const legacyKey = 'ussign-squarecoil-job-timer-v1';
        const sensitiveSentinel = 'A4-SENSITIVE-LEGACY-VALUE-MUST-NOT-LEAK';
        const seeded = await bridge.setLegacyValue(legacyKey, sensitiveSentinel);
        assert(seeded === sensitiveSentinel, 'Synthetic legacy marker was not seeded');
        const beforeEnvelope = (await bridge.getStorage([AUTHORITY_STORAGE_KEY]))?.[AUTHORITY_STORAGE_KEY];
        const action7Before = result.network.action7.length;
        const enabledResponse = await bridge.setEnabled(true);
        const blockedCore = await waitFor(async () => {
          const snapshot = await bridge.coreSnapshot();
          return snapshot?.initialized === true && snapshot.blocked === true ? snapshot : null;
        }, 'legacy fail-closed trusted core', options.timeoutMs);
        const afterEnvelope = (await bridge.getStorage([AUTHORITY_STORAGE_KEY]))?.[AUTHORITY_STORAGE_KEY];
        assert(blockedCore.preflight?.reason === 'legacy-preflight-failed' && blockedCore.preflight?.disposition === 'FAILED', 'Legacy preflight returned an unexpected block reason', blockedCore);
        assert(blockedCore.preflight?.presentKeys?.length === 1 && blockedCore.preflight.presentKeys[0] === legacyKey, 'Legacy preflight did not report only the key identity', blockedCore.preflight);
        assert(JSON.stringify(blockedCore).includes(sensitiveSentinel) === false, 'Legacy preflight leaked the stored value', blockedCore);
        const blockedHealth = await bridge.send({ type: MESSAGES.HEALTH });
        assert(blockedHealth?.ready === false && blockedHealth?.health?.state === 'DEGRADED', 'Blocked migration falsely reported READY', blockedHealth);
        assert(blockedHealth?.reason === 'legacy-preflight-failed', 'Blocked migration reported an unexpected settlement reason', blockedHealth);
        assert(afterEnvelope?.document?.revision === beforeEnvelope?.document?.revision, 'Legacy-blocked boot committed a Timer write', {
          beforeRevision: beforeEnvelope?.document?.revision,
          afterRevision: afterEnvelope?.document?.revision
        });
        assert(result.network.action7.length === action7Before, 'Legacy-blocked boot issued an action 7 request', { action7Before, action7After: result.network.action7.length });
        assert(result.network.nativeMutationAttempts.length === 0, 'Legacy-blocked boot attempted a native SquareCoil mutation', result.network.nativeMutationAttempts);
        await bridge.setEnabled(false);
        const removed = await bridge.removeLegacyValue(legacyKey);
        assert(removed === null, 'Synthetic legacy marker was not removed');
        return {
          enabledResponse,
          blockedHealth,
          blockedCore,
          authoritativeRevision: afterEnvelope?.document?.revision,
          action7RequestsBeforeAndAfter: [action7Before, result.network.action7.length]
        };
      },
      { b2ReadyFixtureIds: ['B2-READY-003'] }
    );

    const finalState = await pageState(page);
    if (finalState.runtimeGlobalPresent) {
      await bridge.setEnabled(false).catch(() => {});
      await waitFor(async () => {
        const state = await pageState(page);
        return !state.runtimeGlobalPresent && state.rootCount === 0;
      }, 'final clean browser teardown', options.timeoutMs).catch(() => {});
    }
    await runCase(result.cases, `A4-B1-${family === 'chrome' ? 'CH' : 'ED'}-EVIDENCE-HEALTH`, 'Synthetic-only network and browser console remain clean', async () => {
      assert(result.network.blockedUnexpected.length === 0, 'Unexpected network requests were attempted', result.network.blockedUnexpected);
      assert(result.network.nativeMutationAttempts.length === 0, 'Native SquareCoil mutation requests were attempted', result.network.nativeMutationAttempts);
      assert(result.console.errors.length === 0, 'Browser console emitted warnings or errors', result.console.errors);
      assert(result.console.pageErrors.length === 0, 'Fixture page emitted uncaught errors', result.console.pageErrors);
      return { network: result.network, console: result.console };
    });
    const requiredFixtureIds = REQUIRED_A4_STABLE_FIXTURE_IDS.filter(fixtureId =>
      family === 'chrome' ? fixtureId !== 'B1-LC-018' : fixtureId !== 'B1-LC-017'
    );
    const observedFixtureIds = [...new Set(result.cases.flatMap(testCase => testCase.stableFixtureIds || []))].sort();
    result.stableFixtureCoverage = {
      required: requiredFixtureIds,
      observed: observedFixtureIds,
      missing: requiredFixtureIds.filter(fixtureId => !observedFixtureIds.includes(fixtureId))
    };
    if (result.stableFixtureCoverage.missing.length) {
      result.cases.push({
        id: `A4-B1-${family === 'chrome' ? 'CH' : 'ED'}-FIXTURE-COVERAGE`,
        name: 'Mandatory stable A4 fixture register coverage',
        status: 'FAIL',
        error: `Missing stable fixture IDs: ${result.stableFixtureCoverage.missing.join(', ')}`
      });
    }
    const observedB2KernelFixtureIds = [...new Set(result.cases.flatMap(testCase => testCase.b2KernelFixtureIds || []))].sort();
    result.b2KernelFixtureCoverage = {
      scope: 'B2_1_AUTHORITY_KERNEL',
      required: [...REQUIRED_B2_1_A4_FIXTURE_IDS],
      observed: observedB2KernelFixtureIds,
      missing: REQUIRED_B2_1_A4_FIXTURE_IDS.filter(fixtureId => !observedB2KernelFixtureIds.includes(fixtureId))
    };
    if (result.b2KernelFixtureCoverage.missing.length) {
      result.cases.push({
        id: `A4-B2.1-${family === 'chrome' ? 'CH' : 'ED'}-FIXTURE-COVERAGE`,
        name: 'Mandatory B2.1 isolated authority-kernel fixture coverage',
        b2Scope: 'ISOLATED_AUTHORITY_KERNEL_ONLY',
        status: 'FAIL',
        error: `Missing B2.1 fixture IDs: ${result.b2KernelFixtureCoverage.missing.join(', ')}`
      });
    }
    const observedB2TransitionFixtureIds = [...new Set(result.cases.flatMap(testCase => testCase.b2TransitionFixtureIds || []))].sort();
    result.b2TransitionFixtureCoverage = {
      scope: 'B2.2_TRUSTED_TRANSITION_CORE_PARTIAL',
      required: [...REQUIRED_B2_2_A4_FIXTURE_IDS],
      observed: observedB2TransitionFixtureIds,
      missing: REQUIRED_B2_2_A4_FIXTURE_IDS.filter(fixtureId => !observedB2TransitionFixtureIds.includes(fixtureId))
    };
    if (result.b2TransitionFixtureCoverage.missing.length) {
      result.cases.push({
        id: `A4-B2.2-${family === 'chrome' ? 'CH' : 'ED'}-FIXTURE-COVERAGE`,
        name: 'Mandatory B2.2 trusted transition-core fixture coverage',
        b2Scope: 'TRUSTED_TRANSITION_CORE_PARTIAL',
        status: 'FAIL',
        error: `Missing B2.2 fixture IDs: ${result.b2TransitionFixtureCoverage.missing.join(', ')}`
      });
    }
    const observedB2ReadyFixtureIds = [...new Set(result.cases.flatMap(testCase => testCase.b2ReadyFixtureIds || []))].sort();
    result.b2ReadySettlementCoverage = {
      scope: 'B2_FINAL_READY_SETTLEMENT_A4',
      required: [...REQUIRED_B2_READY_A4_FIXTURE_IDS],
      observed: observedB2ReadyFixtureIds,
      missing: REQUIRED_B2_READY_A4_FIXTURE_IDS.filter(fixtureId => !observedB2ReadyFixtureIds.includes(fixtureId))
    };
    if (result.b2ReadySettlementCoverage.missing.length) {
      result.cases.push({
        id: `A4-B2-C-${family === 'chrome' ? 'CH' : 'ED'}-FIXTURE-COVERAGE`,
        name: 'Mandatory final B2 READY settlement fixture coverage',
        b2Scope: 'FINAL_READY_SETTLEMENT',
        status: 'FAIL',
        error: `Missing final B2 READY fixture IDs: ${result.b2ReadySettlementCoverage.missing.join(', ')}`
      });
    }
    const failedCases = result.cases.filter(testCase => testCase.status === 'FAIL');
    const unsupportedCases = result.cases.filter(testCase => testCase.status === 'UNSUPPORTED');
    result.status = failedCases.length ? 'FAIL' : unsupportedCases.length ? 'UNSUPPORTED' : 'PASS';
  } catch (error) {
    result.cases.push({
      id: 'A4-HARNESS',
      name: 'Browser harness setup and control',
      status: error instanceof UnsupportedCase ? 'UNSUPPORTED' : 'FAIL',
      error: error.message,
      details: error.details || null
    });
    result.status = error instanceof UnsupportedCase ? 'UNSUPPORTED' : 'FAIL';
  } finally {
    if (tracker) await tracker.detach();
    if (bridge) await bridge.detach();
    if (browserCdp) await browserCdp.detach().catch(() => {});
    if (context) await context.close().catch(() => {});
    const tempRoot = path.resolve(os.tmpdir());
    const resolvedProfile = path.resolve(profileDirectory);
    const safeProfile = resolvedProfile.toLowerCase().startsWith(`${tempRoot.toLowerCase()}${path.sep}`) && path.basename(resolvedProfile).startsWith(`squarecoil-b1-a4-${family}-`);
    if (safeProfile) {
      try { fs.rmSync(resolvedProfile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); }
      catch (error) { result.cleanupWarning = `Temporary profile retained at ${resolvedProfile}: ${error.message}`; }
    } else {
      result.cleanupWarning = `Refused to remove unexpected profile path: ${resolvedProfile}`;
    }
    result.durationMs = Date.now() - suiteStarted;
  }
  return result;
}

async function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
    if (options.help) {
      process.stdout.write(`${usage()}\n`);
      return;
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n\n${usage()}\n`);
    process.exitCode = 1;
    return;
  }

  const startedAt = new Date().toISOString();
  let packageBefore;
  let archiveBefore;
  let playwright;
  let playwrightResolvedFrom = null;
  try {
    packageBefore = inventoryPackage(options.packageDirectory);
    validatePackageIdentity(packageBefore, options);
    archiveBefore = inventoryArchive(options.archivePath, packageBefore);
    if (options.evidencePath && pathIsWithin(options.evidencePath, options.packageDirectory)) {
      throw new Error('Evidence output must be outside the immutable package directory');
    }
    if (options.evidencePath && path.resolve(options.evidencePath) === path.resolve(options.archivePath)) {
      throw new Error('Evidence output cannot overwrite the tested ZIP archive');
    }
    const resolved = resolvePlaywright();
    playwright = resolved.module;
    playwrightResolvedFrom = resolved.resolvedFrom;
  } catch (error) {
    const status = error instanceof UnsupportedCase ? 'UNSUPPORTED' : 'FAIL';
    const evidence = {
      schemaVersion: 1,
      gate: 'A4',
      status,
      acceptanceEligible: false,
      startedAt,
      finishedAt: new Date().toISOString(),
      packageDirectory: options.packageDirectory,
      archivePath: options.archivePath,
      expectedSourceSha: options.expectedSourceSha,
      error: error.message
    };
    process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
    const safeEvidencePath = options.evidencePath &&
      !pathIsWithin(options.evidencePath, options.packageDirectory) &&
      path.resolve(options.evidencePath) !== path.resolve(options.archivePath);
    if (safeEvidencePath) {
      fs.mkdirSync(path.dirname(options.evidencePath), { recursive: true });
      fs.writeFileSync(options.evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
    }
    process.exitCode = status === 'UNSUPPORTED' ? 2 : 1;
    return;
  }

  const suites = [];
  for (const family of options.browsers) {
    process.stderr.write(`A4 ${family}: running exact-package lifecycle checks\n`);
    suites.push(await runBrowserSuite({
      playwright,
      family,
      executablePath: options.executables[family],
      packageDirectory: options.packageDirectory,
      packageInventory: packageBefore,
      archiveInventory: archiveBefore,
      options
    }));
  }

  const packageAfter = inventoryPackage(options.packageDirectory);
  const packageUnchanged = packageAfter.inventoryDigest === packageBefore.inventoryDigest;
  const archiveAfterBytes = fs.readFileSync(options.archivePath);
  const archiveAfterSha256 = sha256(archiveAfterBytes);
  const archiveUnchanged = archiveAfterSha256 === archiveBefore.sha256 && archiveAfterBytes.length === archiveBefore.bytes;
  if (!packageUnchanged || !archiveUnchanged) {
    suites.push({
      family: 'package-integrity',
      status: 'FAIL',
      cases: [{
        id: 'A4-BYTES',
        name: 'Package directory and ZIP bytes remain immutable during A4',
        status: 'FAIL',
        error: !packageUnchanged ? 'Extracted package inventory changed during browser execution' : 'ZIP archive changed during browser execution'
      }]
    });
  }
  const hasFailure = suites.some(suite => suite.status === 'FAIL');
  const hasUnsupported = suites.some(suite => suite.status === 'UNSUPPORTED');
  const dirtyDevelopment = packageBefore.buildInfo.sourceDirty === true;
  const status = hasFailure ? 'FAIL' : hasUnsupported ? 'UNSUPPORTED' : dirtyDevelopment ? 'NON_ACCEPTANCE' : 'PASS';
  const evidence = {
    schemaVersion: 1,
    gate: 'A4',
    status,
    acceptanceEligible: status === 'PASS' && packageUnchanged && archiveUnchanged && !dirtyDevelopment,
    startedAt,
    finishedAt: new Date().toISOString(),
    host: { platform: process.platform, release: os.release(), arch: process.arch, node: process.version },
    playwright: { version: require(path.join(path.dirname(playwrightResolvedFrom), 'package.json')).version, resolvedFrom: playwrightResolvedFrom },
    mode: dirtyDevelopment ? 'NON_ACCEPTANCE_DIRTY_DEVELOPMENT' : 'ACCEPTANCE_CANDIDATE',
    expectedSourceSha: options.expectedSourceSha,
    archive: {
      path: archiveBefore.path,
      filename: archiveBefore.filename,
      bytes: archiveBefore.bytes,
      sha256Before: archiveBefore.sha256,
      sha256After: archiveAfterSha256,
      unchanged: archiveUnchanged,
      rootPrefix: archiveBefore.rootPrefix,
      inventoryDigest: archiveBefore.inventoryDigest,
      extractedInventoryMatch: archiveBefore.inventoryDigest === packageBefore.inventoryDigest
    },
    package: {
      directory: options.packageDirectory,
      packageVersion: packageBefore.manifest.version,
      buildId: packageBefore.buildInfo.buildId,
      stage: packageBefore.buildInfo.stage,
      candidateFingerprint: packageBefore.buildInfo.candidateFingerprint,
      candidateEmbeddingCounts: packageBefore.candidateEmbeddingCounts,
      sourceSha: packageBefore.buildInfo.sourceSha,
      sourceDirty: packageBefore.buildInfo.sourceDirty,
      inventoryDigestBefore: packageBefore.inventoryDigest,
      inventoryDigestAfter: packageAfter.inventoryDigest,
      unchanged: packageUnchanged,
      files: packageBefore.files
    },
    browsers: suites
  };
  const serialized = `${JSON.stringify(evidence, null, 2)}\n`;
  process.stdout.write(serialized);
  if (options.evidencePath) {
    fs.mkdirSync(path.dirname(options.evidencePath), { recursive: true });
    fs.writeFileSync(options.evidencePath, serialized, 'utf8');
  }
  process.exitCode = status === 'PASS' || status === 'NON_ACCEPTANCE' ? 0 : status === 'UNSUPPORTED' ? 2 : 1;
}

main().catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
