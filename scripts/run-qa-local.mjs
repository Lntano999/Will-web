import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPreviewLifecycle,
  runWithPreviewLifecycle,
} from "./preview-lifecycle.mjs";

const repoDir = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const viteBin = fileURLToPath(
  new URL("../node_modules/vite/bin/vite.js", import.meta.url),
);
const qaScript = path.join(repoDir, "scripts", "qa-portfolio.mjs");
const baseUrl = "http://127.0.0.1:4173/";
const outputDir = path.resolve(
  process.env.QA_OUTPUT_DIR || path.join(repoDir, ".artifacts", "qa"),
);

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`process exited with code ${code} signal ${signal}`));
    });
  });
}

async function runQa(script, environment) {
  const qa = spawn(process.execPath, [script, baseUrl], {
    cwd: repoDir,
    stdio: "inherit",
    env: {
      ...process.env,
      ...environment,
    },
  });
  await waitForExit(qa);
}

const server = spawn(
  process.execPath,
  [viteBin, "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"],
  {
    cwd: repoDir,
    stdio: ["ignore", "pipe", "pipe"],
  },
);
server.stderr.on("data", (chunk) => process.stderr.write(chunk));
const previewLifecycle = createPreviewLifecycle(server, { baseUrl });

await runWithPreviewLifecycle(previewLifecycle, async () => {
  await runQa(qaScript, {
    QA_ALLOW_OFFLINE: "0",
    QA_BLOCK_EXTERNAL: "1",
    QA_BLOCK_VENDOR: "0",
    QA_OUTPUT_DIR: outputDir,
  });
  await runQa(qaScript, {
    QA_ALLOW_OFFLINE: "1",
    QA_BLOCK_EXTERNAL: "1",
    QA_BLOCK_VENDOR: "1",
    QA_VIEWPORTS: "1440,390",
    QA_OUTPUT_DIR: path.join(outputDir, "fallback"),
  });
});
