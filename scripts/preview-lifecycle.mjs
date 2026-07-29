const ANSI_ESCAPE = /\u001B\[[0-?]*[ -/]*[@-~]/g;
const MAX_PREVIEW_STDOUT_BUFFER = 8_192;

function createDeadline(timeoutMs, createError) {
  let timeoutId;
  const promise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(createError()), timeoutMs);
    timeoutId.unref?.();
  });
  return {
    promise,
    clear() {
      clearTimeout(timeoutId);
    },
  };
}

function sleep(timeoutMs) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(resolve, timeoutMs);
    timeoutId.unref?.();
  });
}

function previewState(server) {
  return `pid ${server.pid ?? "unknown"}, exitCode ${server.exitCode ?? "null"}, signal ${server.signalCode ?? "none"}`;
}

function previewEndError(event) {
  const error =
    event.type === "error"
      ? new Error(`Vite preview failed before readiness: ${event.error.message}`)
      : new Error(
          `Vite preview closed before readiness (code ${event.code ?? "null"}, signal ${event.signal ?? "none"})`,
        );
  error.code = "ERR_PREVIEW_ENDED";
  return error;
}

function aggregateErrors(errors, message) {
  return errors.length === 1 ? errors[0] : new AggregateError(errors, message);
}

export function createPreviewLifecycle(
  server,
  {
    baseUrl = "http://127.0.0.1:4173/",
    readinessTimeoutMs = 15_000,
    cleanupTimeoutMs = 5_000,
    pollIntervalMs = 200,
    fetchImpl = fetch,
    writeStdout = (chunk) => process.stdout.write(chunk),
  } = {},
) {
  let resolvePreviewAnnouncement;
  const previewAnnouncement = new Promise((resolve) => {
    resolvePreviewAnnouncement = resolve;
  });
  let resolvePreviewEnd;
  const previewEnd = new Promise((resolve) => {
    resolvePreviewEnd = resolve;
  });
  let previewClosed = false;
  const previewClose = new Promise((resolve) => {
    server.once("close", (code, signal) => {
      previewClosed = true;
      resolve({ code, signal });
      resolvePreviewEnd({ type: "close", code, signal });
    });
  });
  server.once("error", (error) => {
    resolvePreviewEnd({ type: "error", error });
  });

  let previewStdoutBuffer = "";
  server.stdout?.on("data", (chunk) => {
    writeStdout(chunk);
    previewStdoutBuffer += chunk.toString().replace(ANSI_ESCAPE, "");
    previewStdoutBuffer = previewStdoutBuffer.slice(-MAX_PREVIEW_STDOUT_BUFFER);
    if (
      previewStdoutBuffer.includes("Local:") &&
      previewStdoutBuffer.includes(baseUrl)
    ) {
      resolvePreviewAnnouncement();
    }
  });

  async function racePreviewEnd(promise, deadline) {
    const outcome = await Promise.race([
      Promise.resolve(promise).then((value) => ({ type: "result", value })),
      previewEnd.then((event) => ({ type: "end", event })),
      deadline.promise,
    ]);
    if (outcome.type === "end") throw previewEndError(outcome.event);
    return outcome.value;
  }

  async function waitForReady() {
    const deadline = createDeadline(readinessTimeoutMs, () => {
      const error = new Error(
        `Vite preview did not become ready within ${readinessTimeoutMs}ms (${previewState(server)})`,
      );
      error.code = "ERR_PREVIEW_READINESS_TIMEOUT";
      return error;
    });
    try {
      await racePreviewEnd(previewAnnouncement, deadline);
      while (true) {
        try {
          const response = await racePreviewEnd(fetchImpl(baseUrl), deadline);
          if (response.ok && !previewClosed) return;
        } catch (error) {
          if (
            error.code === "ERR_PREVIEW_ENDED" ||
            error.code === "ERR_PREVIEW_READINESS_TIMEOUT"
          ) {
            throw error;
          }
        }
        await racePreviewEnd(sleep(pollIntervalMs), deadline);
      }
    } finally {
      deadline.clear();
    }
  }

  async function waitForClose() {
    const deadline = createDeadline(cleanupTimeoutMs, () => {
      const error = new Error(`Preview cleanup timed out (${previewState(server)})`);
      error.code = "ERR_PREVIEW_CLEANUP_TIMEOUT";
      return error;
    });
    try {
      await Promise.race([previewClose, deadline.promise]);
    } finally {
      deadline.clear();
    }
  }

  async function stop() {
    let signalError;
    if (!previewClosed && server.exitCode === null && server.signalCode === null) {
      try {
        if (!server.kill()) {
          signalError = new Error(
            `Preview cleanup could not signal (${previewState(server)})`,
          );
        }
      } catch (error) {
        signalError = new Error(
          `Preview cleanup could not signal (${previewState(server)}): ${error.message}`,
        );
      }
    }
    try {
      await waitForClose();
    } catch (closeError) {
      throw aggregateErrors(
        signalError ? [closeError, signalError] : [closeError],
        "Preview cleanup failed",
      );
    }
  }

  return { waitForReady, stop };
}

export async function runWithPreviewLifecycle(lifecycle, work) {
  let primaryError;
  try {
    await lifecycle.waitForReady();
    await work();
  } catch (error) {
    primaryError = error;
  }

  let cleanupError;
  try {
    await lifecycle.stop();
  } catch (error) {
    cleanupError = error;
  }

  if (primaryError && cleanupError) {
    throw new AggregateError(
      [primaryError, cleanupError],
      "Preview QA failed and preview cleanup also failed",
    );
  }
  if (primaryError) throw primaryError;
  if (cleanupError) throw cleanupError;
}
