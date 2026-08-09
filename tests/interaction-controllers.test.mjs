import assert from "node:assert/strict";
import test from "node:test";

import { registerAnchorScroll } from "../src/interactions/anchor-scroll.js";

function createHarness(isSmooth) {
  const documentListeners = new Map();
  const clickListeners = [];
  const attributes = new Map([["href", "#tech"]]);
  const scrollCalls = [];
  const link = {
    getAttribute: (name) => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
    addEventListener(type, listener) {
      if (type === "click") clickListeners.push(listener);
    },
  };
  const document = {
    addEventListener(type, listener) {
      documentListeners.set(type, listener);
    },
    querySelectorAll: () => [link],
    querySelector: () => ({ getBoundingClientRect: () => ({ top: 100 }) }),
  };
  const scrollController = {
    isSmooth,
    scrollTo(...args) {
      scrollCalls.push(args);
    },
  };
  const window = {
    history: { replaceState() {} },
    innerHeight: 800,
    scrollY: 0,
  };

  return {
    attributes,
    clickListeners,
    document,
    link,
    scrollCalls,
    scrollController,
    window,
    start() {
      documentListeners.get("DOMContentLoaded")?.();
    },
  };
}

test("native anchors remain untouched when smooth scrolling is unavailable", () => {
  const harness = createHarness(false);
  registerAnchorScroll({
    scrollController: harness.scrollController,
    document: harness.document,
    window: harness.window,
  });
  harness.start();

  assert.equal(harness.attributes.get("href"), "#tech");
  assert.equal(harness.attributes.has("data-target"), false);
  assert.equal(harness.clickListeners.length, 0);
});

test("smooth anchors retain their native href while opting into controlled scroll", () => {
  const harness = createHarness(true);
  registerAnchorScroll({
    scrollController: harness.scrollController,
    document: harness.document,
    window: harness.window,
  });
  harness.start();

  assert.equal(harness.attributes.get("href"), "#tech");
  assert.equal(harness.attributes.get("data-target"), "#tech");
  assert.equal(harness.clickListeners.length, 1);

  let defaultPrevented = false;
  let propagationStopped = false;
  harness.clickListeners[0].call(harness.link, {
    preventDefault() {
      defaultPrevented = true;
    },
    stopPropagation() {
      propagationStopped = true;
    },
    stopImmediatePropagation() {
      throw new Error("same-element listeners must remain available");
    },
  });
  assert.equal(defaultPrevented, true);
  assert.equal(propagationStopped, true);
  assert.equal(harness.scrollCalls.length, 1);
});
