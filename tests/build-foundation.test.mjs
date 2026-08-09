import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const repoUrl = new URL("../", import.meta.url);

async function readText(relativePath) {
  return readFile(new URL(relativePath, repoUrl), "utf8");
}

test("package scripts expose a reproducible Vite lifecycle", async () => {
  const packageJson = JSON.parse(await readText("package.json"));

  assert.equal(packageJson.engines.node, ">=20.19.0");
  assert.equal(packageJson.scripts.dev, "vite");
  assert.equal(packageJson.scripts.build, "vite build");
  assert.equal(packageJson.scripts.preview, "vite preview");
  assert.equal(packageJson.scripts["qa:offline"], "node scripts/run-qa-local.mjs");
  assert.equal(packageJson.devDependencies.vite, "^8.1.0");

  const viteConfig = await readText("vite.config.mjs");
  assert.match(viteConfig, /outDir:\s*"dist"/);
  assert.match(viteConfig, /emptyOutDir:\s*true/);
  assert.match(viteConfig, /host:\s*"127\.0\.0\.1"/);
  assert.match(viteConfig, /port:\s*4173/);
  assert.match(viteConfig, /strictPort:\s*true/);
});

test("cross-platform WASM peer dependencies are fully locked", async () => {
  const lockfile = JSON.parse(await readText("package-lock.json"));
  const wasmRuntime =
    lockfile.packages["node_modules/@napi-rs/wasm-runtime"];

  assert.ok(wasmRuntime, "the Vite WASM fallback runtime must be locked");

  for (const packageName of Object.keys(wasmRuntime.peerDependencies ?? {})) {
    assert.ok(
      lockfile.packages[`node_modules/${packageName}`],
      `${packageName} must be locked for npm ci on non-Windows runners`,
    );
  }
});

test("page does not ship the unused Webflow icon font", async () => {
  const html = await readText("index.html");
  const css = await readText("will-tech.core.v1.css");

  assert.doesNotMatch(html, /font-family:\s*webflow-icons/);
  assert.doesNotMatch(css, /font-family:\s*webflow-icons/);
  assert.doesNotMatch(css, /\.w-icon-slider-left:before/);
});

test("evidence remains available at stable public paths", async () => {
  for (const relativePath of [
    "public/evidence/modeling-csee-cup-2026-third-prize-redacted.png",
    "public/evidence/cn-story-2026-guangdong-second-prize-redacted.jpg",
  ]) {
    await access(new URL(relativePath, repoUrl));
  }

  const html = await readText("index.html");
  assert.match(
    html,
    /href="evidence\/modeling-csee-cup-2026-third-prize-redacted\.png"/,
  );
  assert.match(
    html,
    /href="evidence\/cn-story-2026-guangdong-second-prize-redacted\.jpg"/,
  );
});

test("offline QA wrapper delegates preview lifecycle cleanup to its helper", async () => {
  const [runner, lifecycle] = await Promise.all([
    readText("scripts/run-qa-local.mjs"),
    readText("scripts/preview-lifecycle.mjs"),
  ]);

  assert.match(runner, /node_modules\/vite\/bin\/vite\.js/);
  assert.match(runner, /"preview"/);
  assert.match(runner, /const server = spawn\(/);
  assert.match(runner, /from "\.\/preview-lifecycle\.mjs"/);
  assert.match(runner, /createPreviewLifecycle\(server, \{ baseUrl \}\)/);
  assert.match(runner, /QA_ALLOW_OFFLINE:\s*"1"/);
  assert.match(runner, /QA_ALLOW_OFFLINE:\s*"0"/);
  assert.match(runner, /QA_BLOCK_EXTERNAL:\s*"1"/);
  assert.match(runner, /process\.env\.QA_OUTPUT_DIR/);

  const lifecycleRoundIndex = runner.indexOf(
    "await runWithPreviewLifecycle(previewLifecycle, async () => {",
  );
  assert.ok(lifecycleRoundIndex >= 0, "preview lifecycle round is not awaited");
  assert.doesNotMatch(runner, /direct-file|qa-direct-file/);

  assert.match(lifecycle, /export function createPreviewLifecycle\(/);
  assert.match(lifecycle, /async function stop\(\)/);
  assert.match(lifecycle, /await waitForClose\(\)/);
  assert.match(lifecycle, /cleanupTimeoutMs = 5_000/);
  assert.match(lifecycle, /ERR_PREVIEW_CLEANUP_TIMEOUT/);
  assert.match(lifecycle, /export async function runWithPreviewLifecycle\(/);
});

test("QA distinguishes supported HTTP from the explicit file guard", async () => {
  const packageJson = JSON.parse(await readText("package.json"));
  const runner = await readText("scripts/run-qa-local.mjs");
  const entryQa = await readText("scripts/qa-entry-guard.mjs").catch(() => "");

  assert.equal(packageJson.scripts["qa:entry"], "node scripts/qa-entry-guard.mjs");
  assert.match(runner, /qa-entry-guard\.mjs/);
  assert.match(entryQa, /pathToFileURL/);
  assert.match(entryQa, /Will-web requires an HTTP preview/);
  assert.match(entryQa, /failedRequests\.length, 0/);
});

test("full-page visual QA uses an isolated reduced-motion capture context", async () => {
  const qa = await readText("scripts/qa-portfolio.mjs");
  const contextIndex = qa.indexOf("const visualContext = await browser.newContext({");
  const reducedMotionIndex = qa.indexOf('reducedMotion: "reduce"', contextIndex);
  const paintIndex = qa.indexOf("await visualPage.screenshot();", contextIndex);
  const captureIndex = qa.indexOf("await visualPage.screenshot", contextIndex);
  const fullCaptureIndex = qa.indexOf("fullPage: true", captureIndex);
  const closeIndex = qa.indexOf("await visualContext.close()", contextIndex);

  assert.ok(contextIndex >= 0);
  assert.ok(contextIndex < reducedMotionIndex);
  assert.ok(reducedMotionIndex < paintIndex);
  assert.ok(paintIndex < captureIndex || paintIndex === captureIndex);
  assert.ok(captureIndex < fullCaptureIndex);
  assert.ok(fullCaptureIndex < closeIndex);
});

test("CI verifies build and offline browser behavior", async () => {
  const workflow = await readText(".github/workflows/ci.yml");

  assert.match(workflow, /node-version:\s*22\.12\.0/);
  assert.match(workflow, /run:\s*npm ci/);
  assert.match(workflow, /run:\s*npx playwright install --with-deps chromium/);
  assert.match(workflow, /run:\s*npm test/);
  assert.match(workflow, /run:\s*npm run build/);
  assert.match(workflow, /run:\s*npm run qa:offline/);
  assert.match(workflow, /path:\s*\.artifacts\/qa/);
});
