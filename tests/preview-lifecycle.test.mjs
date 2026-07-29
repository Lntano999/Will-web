import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import test from "node:test";
import {
  createPreviewLifecycle,
  runWithPreviewLifecycle,
} from "../scripts/preview-lifecycle.mjs";

function createChild({ kill } = {}) {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.exitCode = null;
  child.signalCode = null;
  child.pid = 41730;
  child.kill = kill ?? (() => true);
  return child;
}

function closeChild(child, code = 0, signal = null) {
  child.exitCode = code;
  child.signalCode = signal;
  child.emit("close", code, signal);
}

test("split ANSI-stripped stdout chunks announce preview readiness", async () => {
  const child = createChild();
  const lifecycle = createPreviewLifecycle(child, {
    baseUrl: "http://127.0.0.1:4173/",
    readinessTimeoutMs: 100,
    fetchImpl: async () => ({ ok: true }),
    writeStdout: () => {},
  });

  const ready = lifecycle.waitForReady();
  child.stdout.write("\u001B[32mLocal\u001B[39m:");
  child.stdout.write(" http://127.0.0.1:4173/\n");
  await ready;

  closeChild(child);
  await lifecycle.stop();
});

test("a live preview without a readiness announcement times out", async () => {
  const child = createChild();
  const lifecycle = createPreviewLifecycle(child, {
    readinessTimeoutMs: 60,
    writeStdout: () => {},
  });
  const startedAt = Date.now();

  await assert.rejects(lifecycle.waitForReady(), {
    code: "ERR_PREVIEW_READINESS_TIMEOUT",
    message: /Vite preview did not become ready/,
  });
  assert.ok(
    Date.now() - startedAt < 220,
    "a missing readiness announcement was not bounded by the deadline",
  );

  closeChild(child);
  await lifecycle.stop();
});

test("premature preview error and close reject readiness with lifecycle details", async (t) => {
  await t.test("error", async () => {
    const child = createChild();
    const lifecycle = createPreviewLifecycle(child, {
      readinessTimeoutMs: 100,
      writeStdout: () => {},
    });
    const ready = lifecycle.waitForReady();
    child.emit("error", new Error("port unavailable"));
    await assert.rejects(ready, {
      code: "ERR_PREVIEW_ENDED",
      message: /failed before readiness: port unavailable/,
    });
    closeChild(child, 1);
    await lifecycle.stop();
  });

  await t.test("close", async () => {
    const child = createChild();
    const lifecycle = createPreviewLifecycle(child, {
      readinessTimeoutMs: 100,
      writeStdout: () => {},
    });
    const ready = lifecycle.waitForReady();
    closeChild(child, 1, "SIGTERM");
    await assert.rejects(ready, {
      code: "ERR_PREVIEW_ENDED",
      message: /code 1, signal SIGTERM/,
    });
    await lifecycle.stop();
  });
});

test("one absolute timeout bounds announcement and readiness polling", async () => {
  const child = createChild();
  let fetchAttempts = 0;
  const lifecycle = createPreviewLifecycle(child, {
    readinessTimeoutMs: 30,
    pollIntervalMs: 5,
    fetchImpl: async () => {
      fetchAttempts += 1;
      return { ok: false, status: 503 };
    },
    writeStdout: () => {},
  });
  const startedAt = Date.now();
  const ready = lifecycle.waitForReady();
  child.stdout.write("Local: http://127.0.0.1:4173/\n");

  await assert.rejects(ready, {
    code: "ERR_PREVIEW_READINESS_TIMEOUT",
    message: /Vite preview did not become ready/,
  });
  assert.ok(Date.now() - startedAt < 250, "readiness timeout was not absolute");
  assert.ok(fetchAttempts > 1, "readiness polling never retried");

  closeChild(child);
  await lifecycle.stop();
});

test("a delayed announcement leaves only the remaining readiness budget for polling", async () => {
  const child = createChild();
  let fetchAttempts = 0;
  const lifecycle = createPreviewLifecycle(child, {
    readinessTimeoutMs: 160,
    pollIntervalMs: 5,
    fetchImpl: async () => {
      fetchAttempts += 1;
      return { ok: false, status: 503 };
    },
    writeStdout: () => {},
  });
  const startedAt = Date.now();
  const ready = lifecycle.waitForReady();
  setTimeout(() => {
    child.stdout.write("Local: http://127.0.0.1:4173/\n");
  }, 110);

  await assert.rejects(ready, { code: "ERR_PREVIEW_READINESS_TIMEOUT" });
  const elapsedMs = Date.now() - startedAt;
  assert.ok(fetchAttempts > 1, "polling never retried after the announcement");
  assert.ok(
    elapsedMs < 230,
    `polling received a restarted deadline instead of the remaining budget (${elapsedMs}ms)`,
  );

  closeChild(child);
  await lifecycle.stop();
});

test("cleanup accepts a close observed after kill reports false", async () => {
  let child;
  child = createChild({
    kill: () => {
      queueMicrotask(() => closeChild(child));
      return false;
    },
  });
  const lifecycle = createPreviewLifecycle(child, {
    cleanupTimeoutMs: 30,
    writeStdout: () => {},
  });

  await lifecycle.stop();
});

test("cleanup reports a bounded close failure with process state", async () => {
  const child = createChild({ kill: () => true });
  const lifecycle = createPreviewLifecycle(child, {
    cleanupTimeoutMs: 30,
    writeStdout: () => {},
  });

  await assert.rejects(lifecycle.stop(), {
    code: "ERR_PREVIEW_CLEANUP_TIMEOUT",
    message: /pid 41730, exitCode null, signal none/,
  });
});

test("orchestration preserves both primary and cleanup failures", async () => {
  const primary = new Error("primary readiness failure");
  const cleanup = new Error("cleanup close failure");
  const lifecycle = {
    waitForReady: async () => {
      throw primary;
    },
    stop: async () => {
      throw cleanup;
    },
  };

  await assert.rejects(runWithPreviewLifecycle(lifecycle, async () => {}), (error) => {
    assert.ok(error instanceof AggregateError);
    assert.deepEqual(error.errors, [primary, cleanup]);
    return true;
  });
});
