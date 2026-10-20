/**
 * Libertad - Minimal DOM mock
 *
 * Implements only the subset of the DOM that the content-script modules
 * actually touch, so the pure-JS logic (capture and restore of rewritten
 * text, chip recycling, payload validation) can be verified in Node without
 * pulling a browser engine into the toolchain.
 *
 * Selector support is intentionally small: tag names, classes, ids and
 * [data-*] attributes. Anything more complex is resolved through the fixture
 * registry, where a test declares explicitly which elements a given query
 * must return. If a module changes the selector it queries, the registry
 * stops matching and the test fails loudly instead of silently passing.
 */

const SHOW_TEXT = 4;

function dataAttrToDatasetKey(attr) {
  return attr
    .replace(/^data-/, '')
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function hasAttr(element, name) {
  if (name.startsWith('data-')) {
    return element.dataset[dataAttrToDatasetKey(name)] !== undefined;
  }
  return element.attributes[name] !== undefined;
}

function matchesSimple(element, selector) {
  if (!selector) return false;

  const attrOnly = selector.match(/^\[([a-zA-Z0-9-]+)\]$/);
  if (attrOnly) return hasAttr(element, attrOnly[1]);

  if (selector.startsWith('#')) {
    return element.attributes.id === selector.slice(1);
  }

  const tagAndClass = selector.match(/^([a-z][a-z0-9-]*)?\.([\w-]+)$/i);
  if (tagAndClass) {
    const tagOk =
      !tagAndClass[1] || element.tagName === tagAndClass[1].toUpperCase();
    return tagOk && element.classList.contains(tagAndClass[2]);
  }

  if (selector.startsWith('.')) {
    return element.classList.contains(selector.slice(1));
  }

  if (/^[a-z][a-z0-9-]*$/i.test(selector)) {
    return element.tagName === selector.toUpperCase();
  }

  return false;
}

function matchesSelector(element, selector) {
  return selector
    .split(',')
    .some((part) => matchesSimple(element, part.trim()));
}

class FakeTextNode {
  constructor(value, ownerDocument) {
    this.nodeType = 3;
    this.nodeValue = String(value);
    this.ownerDocument = ownerDocument;
    this.parentElement = null;
    this.childNodes = [];
  }

  get textContent() {
    return this.nodeValue;
  }

  set textContent(value) {
    this.nodeValue = String(value);
  }
}

class FakeClassList {
  constructor() {
    this.items = new Set();
  }

  add(...names) {
    for (const name of names) this.items.add(name);
  }

  remove(...names) {
    for (const name of names) this.items.delete(name);
  }

  contains(name) {
    return this.items.has(name);
  }

  toggle(name, force) {
    const shouldAdd = force === undefined ? !this.items.has(name) : force;
    if (shouldAdd) {
      this.items.add(name);
    } else {
      this.items.delete(name);
    }
    return shouldAdd;
  }
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = String(tagName || 'div').toUpperCase();
    this.ownerDocument = ownerDocument;
    this.childNodes = [];
    this.parentElement = null;
    this.attributes = {};
    this.dataset = {};
    this.classList = new FakeClassList();
    this.style = {
      setProperty() {},
      removeProperty() {},
    };
    this.isConnected = true;
    this.href = '';
  }

  get textContent() {
    if (this.childNodes.length === 0) return '';
    let out = '';
    for (const child of this.childNodes) out += child.textContent;
    return out;
  }

  set textContent(value) {
    this.childNodes = [];
    if (value !== '' && value !== null && value !== undefined) {
      this.appendChild(this.ownerDocument.createTextNode(value));
    }
  }

  appendChild(node) {
    node.parentElement = this;
    this.childNodes.push(node);
    return node;
  }

  removeChild(node) {
    const index = this.childNodes.indexOf(node);
    if (index !== -1) this.childNodes.splice(index, 1);
    node.parentElement = null;
    return node;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name.startsWith('data-')) {
      this.dataset[dataAttrToDatasetKey(name)] = String(value);
    }
  }

  getAttribute(name) {
    if (name.startsWith('data-')) {
      const key = dataAttrToDatasetKey(name);
      return this.dataset[key] !== undefined ? this.dataset[key] : null;
    }
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name.startsWith('data-')) {
      delete this.dataset[dataAttrToDatasetKey(name)];
    }
  }

  hasAttribute(name) {
    return this.getAttribute(name) !== null;
  }

  querySelector(selector) {
    return this.ownerDocument.query(this, selector)[0] || null;
  }

  querySelectorAll(selector) {
    return this.ownerDocument.query(this, selector);
  }

  closest(selector) {
    let node = this;
    while (node) {
      if (matchesSelector(node, selector)) return node;
      node = node.parentElement;
    }
    return null;
  }
}

class FakeDocument {
  constructor() {
    this.body = new FakeElement('body', this);
    this.documentElement = new FakeElement('html', this);
    this.title = '';
    this.fixtures = [];
  }

  /**
   * Declares which elements a query must return. The matcher is a substring
   * of the selector the module is expected to use.
   */
  register(matcher, elements) {
    this.fixtures.push({ matcher, elements });
  }

  query(root, selector) {
    for (const fixture of this.fixtures) {
      if (selector.includes(fixture.matcher)) {
        return fixture.elements.filter((element) =>
          root === this || root.contains(element),
        );
      }
    }

    const found = [];
    const walk = (node) => {
      for (const child of node.childNodes) {
        if (child instanceof FakeTextNode) continue;
        if (matchesSimple(child, selector.trim())) found.push(child);
        walk(child);
      }
    };
    walk(root === this ? this.body : root);
    return found;
  }

  querySelector(selector) {
    return this.query(this, selector)[0] || null;
  }

  querySelectorAll(selector) {
    return this.query(this, selector);
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }

  createElementNS(_ns, tagName) {
    return new FakeElement(tagName, this);
  }

  createTextNode(text) {
    return new FakeTextNode(text, this);
  }

  createTreeWalker(root) {
    const nodes = [];
    const walk = (node) => {
      for (const child of node.childNodes) {
        if (child instanceof FakeTextNode) {
          nodes.push(child);
        } else {
          walk(child);
        }
      }
    };
    walk(root);
    let index = 0;
    return {
      nextNode() {
        return index < nodes.length ? nodes[index++] : null;
      },
    };
  }

  addEventListener() {}

  removeEventListener() {}
}

class FakeWindow {
  constructor(document) {
    this.document = document;
    this.location = {
      href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      pathname: '/watch',
      origin: 'https://www.youtube.com',
      search: '?v=dQw4w9WgXcQ',
    };
    this.listeners = new Map();
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }

  removeEventListener(type, handler) {
    const list = this.listeners.get(type);
    if (!list) return;
    const index = list.indexOf(handler);
    if (index !== -1) list.splice(index, 1);
  }

  dispatchEvent(event) {
    const list = this.listeners.get(event.type);
    if (list) {
      for (const handler of list.slice()) handler(event);
    }
    return true;
  }

  requestIdleCallback(handler) {
    return setTimeout(handler, 0);
  }

  cancelIdleCallback(handle) {
    clearTimeout(handle);
  }
}

// `contains` is used by the fixture registry to keep results inside the
// queried subtree.
FakeElement.prototype.contains = function contains(node) {
  let current = node;
  while (current) {
    if (current === this) return true;
    current = current.parentElement;
  }
  return false;
};

module.exports = {
  FakeDocument,
  FakeElement,
  FakeWindow,
  SHOW_TEXT,
};
