# Will-web Direct-file Runtime Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore full self-hosted animation runtime loading when the repository `index.html` is opened directly while preserving Vite/Vercel `/vendor/` delivery and the existing visual behavior.

**Architecture:** Keep disk-valid `./public/vendor/` URLs in source HTML and transform that exact prefix to `/vendor/` through a named Vite `transformIndexHtml` pre-hook. Add a focused direct-file Playwright QA and run it alongside the existing same-origin and forced-fail-open browser rounds.

**Tech Stack:** Vite 8, Node.js test runner, Playwright 1.62, Microsoft Edge, GSAP 3.14.2, Lenis 1.3.15, anime.js 4.4.1

---

## File responsibilities

- `index.html`: contains URLs that work when the source file is opened directly.
- `vite.config.mjs`: owns the deterministic source-to-served vendor path transformation.
- `tests/dependency-localization.test.mjs`: defines the static and executable path contract.
- `scripts/qa-direct-file.mjs`: verifies real browser behavior for the `file://` entry point.
- `scripts/run-qa-local.mjs`: orchestrates HTTP normal, HTTP fail-open and direct-file QA rounds.
- `package.json`: exposes the focused direct-file QA command.

### Task 1: Reproduce the direct-file path regression with a test

**Files:**
- Modify: `tests/dependency-localization.test.mjs`
- Test: `tests/dependency-localization.test.mjs`

- [x] **Step 1: Replace the HTTP-only source-path assertion with the dual-entry contract**

Add `pathToFileURL` and `path` imports:

```js
import path from "node:path";
import { pathToFileURL } from "node:url";
```

Replace the existing `homepage loads approved animation runtimes from the same origin` test with:

```js
test("source vendor URLs work from disk and Vite rewrites them for HTTP", async () => {
  const sourcePaths = [
    "./public/vendor/gsap/gsap.min.js",
    "./public/vendor/gsap/SplitText.min.js",
    "./public/vendor/gsap/ScrollTrigger.min.js",
    "./public/vendor/lenis/lenis.min.js",
    "./public/vendor/lenis/lenis.css",
    "./public/vendor/anime/anime.umd.min.js",
  ];
  const servedPaths = sourcePaths.map((sourcePath) =>
    sourcePath.replace("./public/vendor/", "/vendor/"),
  );

  for (const sourcePath of sourcePaths) {
    assert.match(indexHtml, new RegExp(`["']${escapeRegExp(sourcePath)}["']`));
  }
  assert.doesNotMatch(indexHtml, /["']\/vendor\//);

  const configModule = await import(
    `${pathToFileURL(path.resolve("vite.config.mjs")).href}?test=${Date.now()}`
  );
  assert.equal(typeof configModule.rewriteVendorPathsForVite, "function");

  const servedHtml = configModule.rewriteVendorPathsForVite(indexHtml);
  for (const servedPath of servedPaths) {
    assert.match(servedHtml, new RegExp(`["']${escapeRegExp(servedPath)}["']`));
  }
  assert.doesNotMatch(servedHtml, /\.\/public\/vendor\//);

  const plugin = configModule.default.plugins.find(
    ({ name }) => name === "will-web-direct-file-vendor-paths",
  );
  assert.equal(plugin.transformIndexHtml.order, "pre");
  assert.equal(plugin.transformIndexHtml.handler(indexHtml), servedHtml);
});
```

Keep the existing forbidden-CDN assertions as a separate loop in this test so the repair cannot reintroduce Lenis, anime.js or GSAP runtime CDN URLs.

- [x] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test tests/dependency-localization.test.mjs
```

Expected: FAIL because `index.html` still contains `/vendor/` and `vite.config.mjs` does not export `rewriteVendorPathsForVite`.

- [x] **Step 3: Commit the regression contract**

```powershell
git add -- tests/dependency-localization.test.mjs
git diff --cached --check
git commit -m "test: reproduce direct-file vendor path regression"
```

### Task 2: Implement the dual-entry vendor path mapping

**Files:**
- Modify: `index.html`
- Modify: `vite.config.mjs`
- Test: `tests/dependency-localization.test.mjs`

- [x] **Step 1: Change the six source HTML references to disk-valid paths**

Use these exact source URLs without changing script order:

```html
<link rel="stylesheet" href="./public/vendor/lenis/lenis.css">
<script src="./public/vendor/gsap/gsap.min.js" type="text/javascript"></script>
<script src="./public/vendor/gsap/SplitText.min.js" type="text/javascript"></script>
<script src="./public/vendor/gsap/ScrollTrigger.min.js" type="text/javascript"></script>
<script src="./public/vendor/lenis/lenis.min.js"></script>
<script src="./public/vendor/anime/anime.umd.min.js"></script>
```

- [x] **Step 2: Add the named Vite pre-transform**

Add this code above the default config:

```js
const SOURCE_VENDOR_PREFIX = "./public/vendor/";
const SERVED_VENDOR_PREFIX = "/vendor/";

export function rewriteVendorPathsForVite(html) {
  return html.replaceAll(SOURCE_VENDOR_PREFIX, SERVED_VENDOR_PREFIX);
}

const directFileVendorPathsPlugin = {
  name: "will-web-direct-file-vendor-paths",
  transformIndexHtml: {
    order: "pre",
    handler: rewriteVendorPathsForVite,
  },
};
```

Add the plugin to `defineConfig`:

```js
export default defineConfig({
  plugins: [directFileVendorPathsPlugin],
  appType: "mpa",
  // Existing build, server and preview options remain unchanged.
});
```

- [x] **Step 3: Run the focused test and verify GREEN**

Run:

```powershell
node --test tests/dependency-localization.test.mjs
```

Expected: all dependency-localization tests pass.

- [x] **Step 4: Build and inspect the transformed output**

Run:

```powershell
node scripts/sync-vendor-assets.mjs
node node_modules/vite/bin/vite.js build
Select-String -Path dist/index.html -Pattern 'public/vendor|/vendor/'
Get-ChildItem dist/vendor -Recurse -File
```

Expected:

- build exits with code 0 and no unresolved vendor URL warnings;
- `dist/index.html` contains the six `/vendor/` URLs and no `public/vendor`;
- `dist/vendor/` contains six runtime files and three licence files.

- [x] **Step 5: Commit the minimal compatibility fix**

```powershell
git add -- index.html vite.config.mjs
git diff --cached --check
git commit -m "fix: support direct-file self-hosted runtimes"
```

### Task 3: Add a real direct-file browser regression test

**Files:**
- Create: `scripts/qa-direct-file.mjs`
- Create: `scripts/preview-lifecycle.mjs`
- Modify: `scripts/run-qa-local.mjs`
- Modify: `tests/dependency-localization.test.mjs`
- Modify: `tests/build-foundation.test.mjs`
- Modify: `package.json`
- Create: `tests/preview-lifecycle.test.mjs`
- Test: `tests/dependency-localization.test.mjs`
- Test: `tests/preview-lifecycle.test.mjs`
- Test: `scripts/qa-direct-file.mjs`

- [x] **Step 1: Add a failing orchestration contract**

Extend `tests/dependency-localization.test.mjs` to read `scripts/qa-direct-file.mjs` with an empty-string fallback:

```js
const directFileQa = await readFile("scripts/qa-direct-file.mjs", "utf8").catch(
  () => "",
);
```

Add:

```js
test("offline QA includes a real direct-file runtime round", () => {
  assert.equal(packageJson.scripts["qa:file"], "node scripts/qa-direct-file.mjs");
  assert.match(qaRunner, /scripts", "qa-direct-file\.mjs"/);
  assert.match(qaRunner, /direct-file/);
  assert.match(directFileQa, /pathToFileURL/);
  assert.match(directFileQa, /animation-complete/);
  assert.match(directFileQa, /window\.ScrollTrigger/);
  assert.match(directFileQa, /page\.mouse\.wheel/);
});
```

- [x] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test tests/dependency-localization.test.mjs
```

Expected: FAIL because `qa:file` and `scripts/qa-direct-file.mjs` do not exist and the local runner has no direct-file round.

- [x] **Step 3: Create the focused direct-file QA script**

Create `scripts/qa-direct-file.mjs` with:

```js
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(scriptDir, "..");
const entryUrl = pathToFileURL(path.join(repoDir, "index.html")).href;
const outputDir = path.resolve(
  process.env.QA_OUTPUT_DIR ||
    path.join(repoDir, ".artifacts", "qa", "direct-file"),
);
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BROWSER_EXECUTABLE || undefined,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const localRequestFailures = [];
const pageErrors = [];

page.on("requestfailed", (request) => {
  if (new URL(request.url()).protocol === "file:") {
    localRequestFailures.push(
      `${request.url()} — ${request.failure()?.errorText ?? "failed"}`,
    );
  }
});
page.on("pageerror", (error) => pageErrors.push(error.message));

await page.route("**/*", async (route) => {
  const protocol = new URL(route.request().url()).protocol;
  if (protocol === "http:" || protocol === "https:") {
    await route.abort("blockedbyclient");
  } else {
    await route.continue();
  }
});

try {
  await page.goto(entryUrl, { waitUntil: "load", timeout: 30_000 });
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.preloaderReleaseReason ===
      "animation-complete",
    null,
    { timeout: 10_000 },
  );

  const state = await page.evaluate(() => ({
    protocol: location.protocol,
    gsap: typeof window.gsap === "object",
    scrollTrigger: typeof window.ScrollTrigger === "function",
    splitText: typeof window.SplitText === "function",
    lenis: typeof window.Lenis === "function",
    anime: typeof window.anime === "object",
    preloaderPresent: Boolean(document.querySelector("#preloader")),
    releaseReason:
      document.documentElement.dataset.preloaderReleaseReason ?? "",
    navHidden:
      document.querySelector(".navigation")?.classList.contains("pre-hidden") ??
      false,
  }));

  assert.deepEqual(state, {
    protocol: "file:",
    gsap: true,
    scrollTrigger: true,
    splitText: true,
    lenis: true,
    anime: true,
    preloaderPresent: false,
    releaseReason: "animation-complete",
    navHidden: false,
  });
  assert.deepEqual(localRequestFailures, []);
  assert.deepEqual(pageErrors, []);

  await page.screenshot({
    path: path.join(outputDir, "hero-1440.png"),
    fullPage: false,
  });

  const beforeScroll = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 1_200);
  await page.waitForTimeout(1_000);
  const afterScroll = await page.evaluate(() => window.scrollY);
  assert.ok(
    afterScroll > beforeScroll + 20,
    `direct-file scroll did not progress: ${beforeScroll} -> ${afterScroll}`,
  );

  console.log("Direct-file runtime QA passed.");
} finally {
  await page.close();
  await browser.close();
}
```

- [x] **Step 4: Expose and orchestrate the new QA round**

Add to `package.json`:

```json
"qa:file": "node scripts/qa-direct-file.mjs"
```

In `scripts/run-qa-local.mjs`, add:

```js
const directFileQaScript = path.join(
  repoDir,
  "scripts",
  "qa-direct-file.mjs",
);
```

Generalize `runQa` so it accepts the script path:

```js
async function runQa(scriptPath, environment) {
  const qa = spawn(process.execPath, [scriptPath, ...(scriptPath === qaScript ? [baseUrl] : [])], {
    cwd: repoDir,
    stdio: "inherit",
    env: {
      ...process.env,
      ...environment,
    },
  });
  await waitForExit(qa);
}
```

Pass `qaScript` to the two existing calls, then add:

```js
await runQa(directFileQaScript, {
  QA_OUTPUT_DIR: path.join(outputDir, "direct-file"),
});
```

- [x] **Step 5: Run the focused test and direct-file QA**

Run:

```powershell
node --test tests/dependency-localization.test.mjs
$env:BROWSER_EXECUTABLE='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
node scripts/qa-direct-file.mjs
```

Expected:

- dependency-localization tests pass;
- Edge reports `Direct-file runtime QA passed.`;
- `.artifacts/qa/direct-file/hero-1440.png` shows the released hero;
- no local file request failures or page errors occur.

- [x] **Step 6: Commit the direct-file QA**

Review-driven hardening extracted preview ownership into
`scripts/preview-lifecycle.mjs`. Ten behavioral tests now cover split stdout,
premature process end, one absolute readiness deadline, bounded cleanup and
combined primary/cleanup failures. This replaces the earlier source-string-only
cleanup contract without changing website runtime behavior.

```powershell
git add -- package.json scripts/qa-direct-file.mjs scripts/run-qa-local.mjs tests/dependency-localization.test.mjs
git diff --cached --check
git commit -m "test: verify direct-file runtime loading"
```

### Task 4: Full regression and visual verification

**Files:**
- Verify: `.artifacts/qa/direct-file/hero-1440.png`
- Verify: `.artifacts/qa/portfolio-1920.png`
- Verify: `.artifacts/qa/fallback/portfolio-390.png`
- Modify: `docs/superpowers/plans/2026-07-29-direct-file-runtime-compatibility.md`

- [x] **Step 1: Run all static tests**

Run:

```powershell
node --test tests/build-foundation.test.mjs tests/content-refresh.test.mjs tests/dependency-localization.test.mjs tests/horizontal-animation.test.mjs
```

Expected: all tests pass with zero failures.

- [x] **Step 2: Rebuild the production artifact**

Run:

```powershell
node scripts/sync-vendor-assets.mjs
node node_modules/vite/bin/vite.js build
```

Expected: Vite exits with code 0 and emits `dist/index.html` plus nine files under `dist/vendor/`.

- [x] **Step 3: Run all three browser scenarios**

Run:

```powershell
$env:BROWSER_EXECUTABLE='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
node scripts/run-qa-local.mjs
```

Expected:

- six HTTP viewports pass with local runtimes;
- 1440px and 390px HTTP fallback viewports pass with `/vendor/` blocked;
- the direct-file runtime round passes;
- the preview server exits and port 4173 is clean.

- [x] **Step 4: Review screenshots**

Inspect:

```text
.artifacts/qa/direct-file/hero-1440.png
.artifacts/qa/portfolio-1920.png
.artifacts/qa/skills-1440.png
.artifacts/qa/fallback/portfolio-390.png
```

Confirm the direct-file hero has completed its preloader, the normal horizontal/Skills states remain intact, and fallback content remains visible.

- [x] **Step 5: Complete the plan and commit verification metadata**

Mark every plan checkbox complete, then run:

```powershell
git diff --check
git status --short
```

Commit the completed plan:

```powershell
git add -- docs/superpowers/plans/2026-07-29-direct-file-runtime-compatibility.md
git diff --cached --check
git commit -m "docs: record direct-file compatibility verification"
```

Do not push, merge or deploy.
