import assert from "node:assert/strict";
import test from "node:test";

import { createAnimationRuntime } from "../src/runtime/animation-runtime.js";
import { createScrollController } from "../src/runtime/scroll-controller.js";

function createEventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) {
      const group = listeners.get(type) ?? new Set();
      group.add(listener);
      listeners.set(type, group);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type) {
      for (const listener of listeners.get(type) ?? []) listener({ type });
    },
    listenerCount(type) {
      return listeners.get(type)?.size ?? 0;
    },
  };
}

test("animation runtime registers only available GSAP plugins", () => {
  const registered = [];
  const globals = {
    gsap: { registerPlugin: (...plugins) => registered.push(...plugins) },
    ScrollTrigger: { name: "ScrollTrigger" },
    SplitText: undefined,
    anime: { animate() {} },
    Lenis: class {},
  };

  const runtime = createAnimationRuntime(globals);

  assert.deepEqual(registered, [globals.ScrollTrigger]);
  assert.equal(runtime.gsap, globals.gsap);
  assert.equal(runtime.ScrollTrigger, globals.ScrollTrigger);
  assert.equal(runtime.SplitText, null);
  assert.equal(runtime.anime, globals.anime);
  assert.equal(runtime.Lenis, globals.Lenis);
});

test("animation runtime degrades to explicit null capabilities", () => {
  assert.deepEqual(createAnimationRuntime({}), {
    gsap: null,
    ScrollTrigger: null,
    SplitText: null,
    anime: null,
    Lenis: null,
  });
});

test("scroll controller uses native scrolling when Lenis is unavailable", () => {
  const calls = [];
  const globals = {
    scrollTo: (...args) => calls.push(args),
  };
  const document = {
    documentElement: { classList: { contains: () => true } },
  };
  const controller = createScrollController({
    runtime: { Lenis: null, gsap: null, ScrollTrigger: null },
    globals,
    document,
  });

  assert.equal(controller.isSmooth, false);
  assert.equal(controller.instance, null);
  controller.scrollTo(120);
  assert.deepEqual(calls, [[{ top: 120, behavior: "auto" }]]);

  const target = { getBoundingClientRect: () => ({ top: 70 }) };
  globals.scrollY = 30;
  controller.scrollTo(target, { behavior: "smooth" });
  assert.deepEqual(calls.at(-1), [{ top: 100, behavior: "smooth" }]);
});

test("smooth scroll setup is single-owner and cleans up every subscription", () => {
  const windowEvents = createEventTarget();
  const documentEvents = createEventTarget();
  const calls = [];
  const scrollListeners = new Map();

  class FakeLenis {
    constructor() {
      calls.push(["construct"]);
    }
    on(type, listener) {
      scrollListeners.set(type, listener);
      calls.push(["on", type, listener]);
    }
    off(type, listener) {
      scrollListeners.delete(type);
      calls.push(["off", type, listener]);
    }
    raf(time) {
      calls.push(["raf", time]);
    }
    scrollTo(target, options) {
      calls.push(["scrollTo", target, options]);
    }
    start() {
      calls.push(["start"]);
    }
    stop() {
      calls.push(["stop"]);
    }
    destroy() {
      calls.push(["destroy"]);
    }
  }

  const tickerCallbacks = new Set();
  const update = () => calls.push(["update"]);
  const globals = {
    ...windowEvents,
    scrollTo: (...args) => calls.push(["nativeScrollTo", ...args]),
  };
  const document = {
    ...documentEvents,
    documentElement: { classList: { contains: () => false } },
  };
  const runtime = {
    Lenis: FakeLenis,
    ScrollTrigger: { update },
    gsap: {
      ticker: {
        add(callback) {
          tickerCallbacks.add(callback);
          calls.push(["ticker.add", callback]);
        },
        remove(callback) {
          tickerCallbacks.delete(callback);
          calls.push(["ticker.remove", callback]);
        },
        lagSmoothing(value) {
          calls.push(["lagSmoothing", value]);
        },
      },
    },
  };

  const controller = createScrollController({ runtime, globals, document });

  assert.equal(controller.isSmooth, true);
  assert.ok(controller.instance instanceof FakeLenis);
  assert.equal(calls.filter(([name]) => name === "construct").length, 1);
  assert.equal(scrollListeners.get("scroll"), update);
  assert.equal(tickerCallbacks.size, 1);
  assert.ok(calls.some((call) => call[0] === "lagSmoothing" && call[1] === 0));
  assert.ok(calls.some((call) => call[0] === "scrollTo" && call[1] === 0 && call[2]?.immediate));
  assert.ok(calls.some((call) => call[0] === "stop"));
  assert.equal(globals.listenerCount("preloader:released"), 1);
  assert.equal(document.listenerCount("DOMContentLoaded"), 1);

  globals.dispatch("preloader:released");
  assert.equal(calls.at(-1)[0], "start");

  const ticker = [...tickerCallbacks][0];
  ticker(1.5);
  assert.deepEqual(calls.at(-1), ["raf", 1500]);

  document.dispatch("DOMContentLoaded");
  assert.ok(calls.some((call) => call[0] === "nativeScrollTo" && call[1] === 0 && call[2] === 0));

  controller.destroy();
  assert.equal(tickerCallbacks.size, 0);
  assert.equal(scrollListeners.size, 0);
  assert.equal(globals.listenerCount("preloader:released"), 0);
  assert.equal(document.listenerCount("DOMContentLoaded"), 0);
  assert.equal(calls.at(-1)[0], "destroy");
});

test("an already released page starts smooth scrolling immediately", () => {
  const calls = [];
  class FakeLenis {
    on() {}
    scrollTo() {}
    start() {
      calls.push("start");
    }
    stop() {
      calls.push("stop");
    }
  }

  createScrollController({
    runtime: { Lenis: FakeLenis, gsap: null, ScrollTrigger: null },
    globals: { addEventListener() {}, scrollTo() {} },
    document: {
      addEventListener() {},
      documentElement: { classList: { contains: () => true } },
    },
  });

  assert.deepEqual(calls, ["start"]);
});
