import assert from "node:assert/strict";
import test from "node:test";

import { registerMobileNavigation } from "../src/interactions/mobile-navigation.js";

function tokenList() {
  const values = new Set();
  return {
    add: (...tokens) => tokens.forEach((token) => values.add(token)),
    remove: (...tokens) => tokens.forEach((token) => values.delete(token)),
    toggle(token, force) {
      if (force === true) values.add(token);
      else if (force === false) values.delete(token);
      else if (values.has(token)) values.delete(token);
      else values.add(token);
    },
    contains: (token) => values.has(token),
  };
}

function createHarness() {
  const documentListeners = new Map();
  const triggerListeners = new Map();
  const linkListeners = new Map();
  const attributes = new Map([["aria-expanded", "false"]]);
  let focused = false;
  const root = { classList: tokenList() };
  const panel = { classList: tokenList(), id: "mobile-navigation" };
  const trigger = {
    classList: tokenList(),
    setAttribute: (name, value) => attributes.set(name, String(value)),
    addEventListener: (type, listener) => triggerListeners.set(type, listener),
    focus: () => {
      focused = true;
    },
  };
  const link = {
    addEventListener: (type, listener) => linkListeners.set(type, listener),
  };
  const document = {
    addEventListener: (type, listener) => documentListeners.set(type, listener),
    querySelector(selector) {
      return {
        ".navigation": root,
        "[data-mobile-nav-trigger]": trigger,
        "#mobile-navigation": panel,
      }[selector] ?? null;
    },
    querySelectorAll: () => [link],
  };
  return {
    attributes,
    document,
    documentListeners,
    focused: () => focused,
    linkListeners,
    panel,
    root,
    triggerListeners,
  };
}

test("mobile menu owns open, escape, link close, aria state, and focus return", () => {
  const h = createHarness();
  registerMobileNavigation({ document: h.document, window: {} });
  h.documentListeners.get("DOMContentLoaded")();

  h.triggerListeners.get("click")();
  assert.equal(h.attributes.get("aria-expanded"), "true");
  assert.equal(h.panel.classList.contains("is-open"), true);
  assert.equal(h.root.classList.contains("menu-open"), true);

  h.documentListeners.get("keydown")({ key: "Escape" });
  assert.equal(h.attributes.get("aria-expanded"), "false");
  assert.equal(h.focused(), true);

  h.triggerListeners.get("click")();
  h.linkListeners.get("click")();
  assert.equal(h.panel.classList.contains("is-open"), false);
});
