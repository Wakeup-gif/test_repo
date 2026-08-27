'use strict';

const EVIDENCE_KINDS = Object.freeze({
  CONTEXT: 'CONTEXT',
  NEGATIVE_CANDIDATE: 'NEGATIVE_CANDIDATE',
  STATE_UNKNOWN: 'STATE_UNKNOWN',
  STATE_CONFLICT: 'STATE_CONFLICT'
});

const NEGATIVE_KINDS = Object.freeze({
  NO_CONTEXT: 'NO_CONTEXT',
  CLOCKED_OUT: 'CLOCKED_OUT',
  NO_TRACKABLE_CONTEXT: 'NO_TRACKABLE_CONTEXT'
});

const STATE_CERTAINTY = Object.freeze({
  VERIFIED_SERVER: 'VERIFIED_SERVER',
  NATIVE_CONFIRMED_POSTSTATE: 'NATIVE_CONFIRMED_POSTSTATE',
  OBSERVED_DOM: 'OBSERVED_DOM',
  FALLBACK: 'FALLBACK',
  UNKNOWN: 'UNKNOWN',
  CONFLICT: 'CONFLICT'
});

const AUDITED_GENERAL_CONTEXTS = Object.freeze([
  Object.freeze({
    contextId: 'general:production-general',
    generalKey: 'production-general',
    canonicalLabel: 'Production (General)',
    shortLabel: 'General',
    aliases: Object.freeze(['production (general)'])
  })
]);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function assertObservedAtMs(value) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error('observedAtMs must be a non-negative safe integer');
  }
  return value;
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function normalizeText(value) {
  return decodeHtml(String(value || '').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizedLabelKey(value) {
  return normalizeText(value).toLocaleLowerCase('en-US');
}

function readAttribute(tag, name) {
  const escaped = String(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(tag || '').match(new RegExp(`\\b${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match ? decodeHtml(match[1] ?? match[2] ?? match[3] ?? '') : null;
}

function extractElementById(html, id) {
  const raw = String(html || '');
  const tags = raw.matchAll(/<([a-z][\w:-]*)\b[^>]*>/gi);
  for (const match of tags) {
    if (readAttribute(match[0], 'id') !== id) continue;
    const tagName = match[1];
    const start = match.index;
    const contentStart = start + match[0].length;
    const close = new RegExp(`</${tagName}\\s*>`, 'ig');
    close.lastIndex = contentStart;
    const end = close.exec(raw);
    if (!end) return { html: match[0], innerHtml: '', openTag: match[0] };
    return {
      html: raw.slice(start, end.index + end[0].length),
      innerHtml: raw.slice(contentStart, end.index),
      openTag: match[0]
    };
  }
  return null;
}

function extractProjectHref(html) {
  for (const match of String(html || '').matchAll(/<a\b[^>]*>/gi)) {
    const href = readAttribute(match[0], 'href');
    if (href && /(?:^|\/)project\.php(?:\?|$)/i.test(href)) return href;
  }
  return null;
}

function projectIdFromHref(href) {
  const raw = decodeHtml(href).trim();
  if (!raw) return null;
  const match = raw.match(/[?&]id=(\d+)(?:&|#|$)/i);
  if (!match) return null;
  const normalized = match[1].replace(/^0+(?=\d)/, '');
  return normalized || '0';
}

function fallbackJobIdFromLabel(label) {
  const match = normalizeText(label).match(/(?:^|#|\b)(\d{6})(?=\b|\s*[-/])/);
  return match ? match[1] : null;
}

function auditedGeneralRule(label) {
  const key = normalizedLabelKey(label);
  return AUDITED_GENERAL_CONTEXTS.find(rule => rule.aliases.includes(key)) || null;
}

function makeGeneralContext(rule, label, department) {
  return deepFreeze({
    contextId: rule.contextId,
    kind: 'general',
    generalKey: rule.generalKey,
    label: normalizeText(label) || rule.canonicalLabel,
    shortLabel: rule.shortLabel,
    department: normalizeText(department) || null
  });
}

function makeJobContext(projectId, label, department) {
  return deepFreeze({
    contextId: `job:${projectId}`,
    kind: 'job',
    projectId,
    label: normalizeText(label) || `Job ${projectId}`,
    shortLabel: projectId,
    department: normalizeText(department) || null
  });
}

function parseClockContext(parts = {}) {
  const label = normalizeText(parts.label);
  const department = normalizeText(parts.department);
  const projectId = projectIdFromHref(parts.href);
  const generalRule = auditedGeneralRule(label);

  if (generalRule) {
    if (projectId && projectId !== '0') {
      return deepFreeze({ context: null, reason: 'GENERAL_PROJECT_ID_CONFLICT', conflict: true });
    }
    return deepFreeze({
      context: makeGeneralContext(generalRule, label, department),
      reason: 'AUDITED_GENERAL_CONTEXT',
      provenance: 'AUDITED_GENERAL_ALLOWLIST'
    });
  }

  if (projectId && projectId !== '0') {
    return deepFreeze({
      context: makeJobContext(projectId, label, department),
      reason: 'PROJECT_LINK_CONTEXT',
      provenance: 'CLOCK_PROJECT_LINK'
    });
  }

  if (projectId === '0') {
    return deepFreeze({ context: null, reason: label ? 'UNSUPPORTED_GENERAL_LABEL' : 'EMPTY_GENERAL_LABEL' });
  }

  const fallbackId = parts.allowSixDigitFallback === false ? null : fallbackJobIdFromLabel(label);
  if (fallbackId) {
    return deepFreeze({
      context: makeJobContext(fallbackId, label, department),
      reason: 'AUDITED_CLOCK_LABEL_CONTEXT',
      provenance: 'CLOCK_LABEL_SIX_DIGIT_FALLBACK'
    });
  }

  return deepFreeze({ context: null, reason: label ? 'UNSUPPORTED_CLOCK_LABEL' : 'NO_CONTEXT_TEXT' });
}

function evidence(value) {
  return deepFreeze(value);
}

function unknown(source, observedAtMs, reason) {
  return evidence({
    kind: EVIDENCE_KINDS.STATE_UNKNOWN,
    polarity: 'UNKNOWN',
    source,
    observedAtMs,
    stateCertainty: STATE_CERTAINTY.UNKNOWN,
    reason
  });
}

function conflict(source, observedAtMs, reason) {
  return evidence({
    kind: EVIDENCE_KINDS.STATE_CONFLICT,
    polarity: 'CONFLICT',
    source,
    observedAtMs,
    stateCertainty: STATE_CERTAINTY.CONFLICT,
    reason
  });
}

function positive(source, observedAtMs, stateCertainty, parsed) {
  return evidence({
    kind: EVIDENCE_KINDS.CONTEXT,
    polarity: 'POSITIVE',
    source,
    observedAtMs,
    stateCertainty,
    context: parsed.context,
    provenance: parsed.provenance
  });
}

function negative(source, observedAtMs, negativeKind, reason) {
  return evidence({
    kind: EVIDENCE_KINDS.NEGATIVE_CANDIDATE,
    polarity: 'NEGATIVE',
    source,
    observedAtMs,
    stateCertainty: STATE_CERTAINTY.UNKNOWN,
    negativeKind,
    reason
  });
}

function parseServerSnapshot(html, options = {}) {
  const observedAtMs = assertObservedAtMs(options.observedAtMs);
  const source = 'SERVER_ACTION_7';
  if (options.available === false || options.success === false) {
    return unknown(source, observedAtMs, 'SERVER_UNAVAILABLE');
  }
  if (typeof html !== 'string' || !html.trim()) {
    return unknown(source, observedAtMs, 'EMPTY_OR_MALFORMED_SERVER_SNAPSHOT');
  }
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return unknown(source, observedAtMs, 'MALFORMED_SERVER_SNAPSHOT');
  }

  const clockElement = extractElementById(html, 'clockin-remaining-time');
  const scope = clockElement ? clockElement.innerHtml : html;
  const label = normalizeText(scope);
  const parsed = parseClockContext({
    href: extractProjectHref(scope),
    label,
    department: options.department,
    allowSixDigitFallback: true
  });

  if (parsed.context) return positive(source, observedAtMs, STATE_CERTAINTY.VERIFIED_SERVER, parsed);
  if (parsed.conflict) return conflict(source, observedAtMs, parsed.reason);
  if (label) return unknown(source, observedAtMs, parsed.reason);
  return negative(source, observedAtMs, NEGATIVE_KINDS.NO_CONTEXT, 'SERVER_NO_CONTEXT_CANDIDATE');
}

function parseDomContextSource(snapshot, key) {
  const html = String(snapshot[`${key}Html`] || '');
  const explicitText = snapshot[`${key}Text`];
  const label = normalizeText(explicitText === undefined ? html : explicitText);
  const href = snapshot[`${key}Href`] || extractProjectHref(html);
  return { label, href };
}

function parseDomSnapshot(snapshot, options = {}) {
  const observedAtMs = assertObservedAtMs(options.observedAtMs);
  const source = 'CLOCK_DOM';
  if (!snapshot || typeof snapshot !== 'object' || options.available === false) {
    return unknown(source, observedAtMs, 'DOM_UNAVAILABLE');
  }

  const primaryParts = parseDomContextSource(snapshot, 'remainingTime');
  const primary = parseClockContext({
    ...primaryParts,
    department: snapshot.department,
    allowSixDigitFallback: true
  });
  if (primary.context) return positive(source, observedAtMs, STATE_CERTAINTY.OBSERVED_DOM, primary);
  if (primary.conflict) return conflict(source, observedAtMs, primary.reason);

  const debugParts = parseDomContextSource(snapshot, 'debug');
  const debug = parseClockContext({
    ...debugParts,
    department: snapshot.department,
    allowSixDigitFallback: true
  });
  if (debug.context) return positive(source, observedAtMs, STATE_CERTAINTY.OBSERVED_DOM, debug);
  if (debug.conflict) return conflict(source, observedAtMs, debug.reason);

  if (primaryParts.label || debugParts.label) {
    return unknown(source, observedAtMs, primaryParts.label ? primary.reason : debug.reason);
  }

  // remainingTimeDataTime is intentionally ignored here. Empty-looking values
  // such as || or |||| are not negative state evidence.
  if (snapshot.clockInVisible === true && snapshot.clockOutVisible === false) {
    return negative(source, observedAtMs, NEGATIVE_KINDS.CLOCKED_OUT, 'CLOCKED_OUT_CONTROL_CANDIDATE');
  }
  if (snapshot.clockOutVisible === true) {
    return negative(source, observedAtMs, NEGATIVE_KINDS.NO_TRACKABLE_CONTEXT, 'NO_TRACKABLE_CONTROL_CANDIDATE');
  }
  return unknown(source, observedAtMs, 'DOM_STATE_INSUFFICIENT');
}

module.exports = {
  EVIDENCE_KINDS,
  NEGATIVE_KINDS,
  STATE_CERTAINTY,
  AUDITED_GENERAL_CONTEXTS,
  normalizeText,
  projectIdFromHref,
  parseClockContext,
  parseServerSnapshot,
  parseDomSnapshot
};
