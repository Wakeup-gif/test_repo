'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createRuntimeUi, ROOT_ID } = require('../../src/platform/runtime-ui');
const { BUILD_ID } = require('../../src/core/build-identity');

class FakeCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

class FakeElement {
  constructor(doc) {
    this.doc = doc;
    this.id = '';
    this.dataset = {};
    this.style = { cssText: '' };
    this.attributes = {};
    this.listeners = new Map();
    this.isConnected = false;
    this.innerHTML = '';
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(handler);
  }

  removeEventListener(type, handler) {
    this.listeners.get(type)?.delete(handler);
  }

  dispatchEvent(event) {
    for (const handler of this.listeners.get(event.type) || []) handler.call(this, event);
    return true;
  }

  querySelector() {
    return null;
  }

  remove() {
    this.isConnected = false;
  }
}

function createFakeDocument() {
  const nodes = [];
  const doc = {
    defaultView: { CustomEvent: FakeCustomEvent },
    documentElement: null,
    body: null,
    createElement: () => new FakeElement(doc),
    querySelectorAll: selector => {
      if (selector !== `#${ROOT_ID}`) return [];
      return nodes.filter(node => node.isConnected && node.id === ROOT_ID);
    }
  };
  const host = {
    appendChild(element) {
      if (!nodes.includes(element)) nodes.push(element);
      element.isConnected = true;
      return element;
    }
  };
  doc.documentElement = host;
  doc.body = host;
  doc._nodes = nodes;
  return doc;
}

test('recreating a removed owned root rebinds the interaction controller', async () => {
  const doc = createFakeDocument();
  const ui = createRuntimeUi({ document: doc, runtimeInstanceId: 'r1', buildId: BUILD_ID });

  const first = await ui.ensure();
  assert.equal(first.interactionReady, true);
  const firstRoot = doc.querySelectorAll(`#${ROOT_ID}`)[0];
  assert.ok(firstRoot);

  firstRoot.remove();
  assert.equal(ui.snapshot().interactionReady, false);

  const second = await ui.ensure();
  const secondRoot = doc.querySelectorAll(`#${ROOT_ID}`)[0];
  assert.ok(secondRoot);
  assert.notEqual(secondRoot, firstRoot);
  assert.equal(second.interactionReady, true);
  assert.equal(ui.snapshot().interactionReady, true);
});

test('runtime UI refuses a foreign timer root instead of taking it over', async () => {
  const doc = createFakeDocument();
  const foreign = doc.createElement('section');
  foreign.id = ROOT_ID;
  foreign.dataset.squarecoilCompanionRoot = 'legacy-or-foreign';
  doc.body.appendChild(foreign);

  const ui = createRuntimeUi({ document: doc, runtimeInstanceId: 'r1', buildId: BUILD_ID });
  await assert.rejects(() => ui.ensure(), /ownership-conflict:foreign-timer-root/);
});

test('teardown removes the owned root and interaction readiness', async () => {
  const doc = createFakeDocument();
  const ui = createRuntimeUi({ document: doc, runtimeInstanceId: 'r1', buildId: BUILD_ID });
  await ui.ensure();
  await ui.teardown();
  assert.equal(doc.querySelectorAll(`#${ROOT_ID}`).length, 0);
  assert.equal(ui.snapshot().interactionReady, false);
});
