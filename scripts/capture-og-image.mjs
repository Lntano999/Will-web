import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import {
  createPreviewLifecycle,
  runWithPreviewLifecycle,
} from "./preview-lifecycle.mjs";

const repoDir = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const viteBin = fileURLToPath(
  new URL("../node_modules/vite/bin/vite.js", import.meta.url),
);
const baseUrl = new URL("http://127.0.0.1:4173/");
const outputPath = path.join(repoDir, "public", "og-will-tech.png");

const build = spawnSync(process.execPath, [viteBin, "build"], {
  cwd: repoDir,
  stdio: "inherit",
});
if (build.status !== 0) {
  throw new Error(`Vite build failed with status ${build.status ?? "unknown"}`);
}

const server = spawn(
  process.execPath,
  [
    viteBin,
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4173",
    "--strictPort",
  ],
  {
    cwd: repoDir,
    stdio: ["ignore", "pipe", "pipe"],
  },
);
server.stderr.on("data", (chunk) => process.stderr.write(chunk));

const lifecycle = createPreviewLifecycle(server, { baseUrl: baseUrl.href });
await runWithPreviewLifecycle(lifecycle, async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_EXECUTABLE || undefined,
  });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  try {
    await page.route("**/*", async (route) => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.origin === baseUrl.origin) await route.continue();
      else await route.abort("blockedbyclient");
    });
    await page.goto(baseUrl.href, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.documentElement.classList.contains("preloader-released"),
      { timeout: 12_000 },
    );
    const releaseReason = await page.evaluate(
      () => document.documentElement.dataset.preloaderReleaseReason ?? "",
    );
    assert.equal(releaseReason, "animation-complete");
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`Captured ${outputPath}`);
  } finally {
    await page.close();
    await browser.close();
  }
});
