import assert from "node:assert/strict";
import test from "node:test";

import {
  copyText,
  registerContactCopy,
} from "../src/interactions/contact-copy.js";

test("copyText prefers the Clipboard API", async () => {
  const writes = [];
  const result = await copyText("jc3400098970", {
    clipboard: { writeText: async (value) => writes.push(value) },
    document: {},
  });
  assert.equal(result, true);
  assert.deepEqual(writes, ["jc3400098970"]);
});

test("copyText falls back to a temporary textarea", async () => {
  let selected = false;
  let removed = false;
  let command = "";
  const appended = [];
  const textArea = {
    style: {},
    select: () => {
      selected = true;
    },
    remove: () => {
      removed = true;
    },
  };
  const document = {
    createElement: () => textArea,
    body: { appendChild: (node) => appended.push(node) },
    execCommand: (value) => {
      command = value;
      return true;
    },
  };

  const result = await copyText("jc3400098970", {
    clipboard: null,
    document,
  });

  assert.equal(result, true);
  assert.equal(textArea.value, "jc3400098970");
  assert.deepEqual(appended, [textArea]);
  assert.equal(selected, true);
  assert.equal(command, "copy");
  assert.equal(removed, true);
});

test("contact controls always copy the documented WeChat id", async () => {
  const documentListeners = new Map();
  const clickListeners = [];
  const appended = [];
  const buttons = [
    {
      addEventListener: (type, listener) =>
        type === "click" && clickListeners.push(listener),
    },
    {
      addEventListener: (type, listener) =>
        type === "click" && clickListeners.push(listener),
    },
  ];
  const toastContainer = { appendChild: (node) => appended.push(node) };
  const document = {
    addEventListener: (type, listener) => documentListeners.set(type, listener),
    querySelectorAll: () => buttons,
    getElementById: (id) => (id === "toast-container" ? toastContainer : null),
    createElement: (tagName) => ({
      tagName,
      classList: { add() {}, remove() {} },
      appendChild() {},
      remove() {},
      style: {},
    }),
  };
  const writes = [];
  registerContactCopy({
    document,
    window: { setTimeout() {} },
    navigator: {
      clipboard: { writeText: async (value) => writes.push(value) },
    },
  });
  documentListeners.get("DOMContentLoaded")();
  await clickListeners[0]({ preventDefault() {} });
  await clickListeners[1]({ preventDefault() {} });
  assert.deepEqual(writes, ["jc3400098970", "jc3400098970"]);
  assert.equal(appended.length, 2);
});
