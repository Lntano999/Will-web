import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const viteBin = fileURLToPath(
  new URL("../node_modules/vite/bin/vite.js", import.meta.url),
);
const qaScript = fileURLToPath(
  new URL("./qa-portfolio.mjs", import.meta.url),
);
const baseUrl = "http://127.0.0.1:4173/";
const outputDir = path.join(repoDir, ".artifacts", "qa");

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`process exited with code ${code} signal ${signal}`));
    });
  });
}

async function waitForPreview() {
  const deadline = Date.now() + 15_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
      lastError = new Error(`preview returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Vite preview did not become ready: ${lastError?.message}`);
}

const server = spawn(
  process.execPath,
  [viteBin, "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"],
  {
    cwd: repoDir,
    stdio: ["ignore", "pipe", "pipe"],
  },
);

server.stdout.on("data", (chunk) => process.stdout.write(chunk));
server.stderr.on("data", (chunk) => process.stderr.write(chunk));

try {
  await waitForPreview();
  const qa = spawn(process.execPath, [qaScript, baseUrl], {
    cwd: repoDir,
    stdio: "inherit",
    env: {
      ...process.env,
      QA_ALLOW_OFFLINE: "1",
      QA_BLOCK_EXTERNAL: "1",
      QA_OUTPUT_DIR: outputDir,
    },
  });
  await waitForExit(qa);
} finally {
  server.kill();
}
