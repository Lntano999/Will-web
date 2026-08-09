import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const indexHtml = await readFile("index.html", "utf8");
const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const gitignore = await readFile(".gitignore", "utf8");
const syncScript = await readFile("scripts/sync-vendor-assets.mjs", "utf8").catch(
  () => "",
);
const qaScript = await readFile("scripts/qa-portfolio.mjs", "utf8");
const qaRunner = await readFile("scripts/run-qa-local.mjs", "utf8");

test("runtime dependencies use exact reproducible versions", () => {
  assert.deepEqual(packageJson.dependencies, {
    animejs: "4.4.1",
    gsap: "3.14.2",
    lenis: "1.3.15",
  });
  assert.equal(
    packageJson.scripts["sync:vendor"],
    "node scripts/sync-vendor-assets.mjs",
  );
  assert.equal(packageJson.scripts.predev, "npm run sync:vendor");
  assert.equal(packageJson.scripts.prebuild, "npm run sync:vendor");
});

test("source HTML uses Vite public-directory vendor URLs", () => {
  const servedPaths = [
    "/vendor/gsap/gsap.min.js",
    "/vendor/gsap/SplitText.min.js",
    "/vendor/gsap/ScrollTrigger.min.js",
    "/vendor/lenis/lenis.min.js",
    "/vendor/lenis/lenis.css",
    "/vendor/anime/anime.umd.min.js",
  ];
  const forbiddenReferences = [
    "unpkg.com/lenis",
    "cdn.jsdelivr.net/npm/animejs",
    "cdn.prod.website-files.com/gsap",
    "InertiaPlugin",
    "Draggable",
  ];

  for (const servedPath of servedPaths) {
    assertVendorPathAttribute(indexHtml, servedPath, "source HTML");
  }
  assert.doesNotMatch(indexHtml, /\.\/public\/vendor\//);
  for (const forbiddenReference of forbiddenReferences) {
    assert.doesNotMatch(
      indexHtml,
      new RegExp(escapeRegExp(forbiddenReference)),
    );
  }
});

test("vendor synchronization uses a fixed allowlist and generated output stays ignored", () => {
  const requiredSourcePaths = [
    "animejs/dist/bundles/anime.umd.min.js",
    "gsap/dist/gsap.min.js",
    "gsap/dist/SplitText.min.js",
    "gsap/dist/ScrollTrigger.min.js",
    "lenis/dist/lenis.min.js",
    "lenis/dist/lenis.css",
  ];

  assert.match(gitignore, /^public\/vendor\/$/m);
  for (const sourcePath of requiredSourcePaths) {
    assert.match(syncScript, new RegExp(escapeRegExp(sourcePath)));
  }
  assert.doesNotMatch(syncScript, /InertiaPlugin|Draggable/);
});

test("offline QA verifies both self-hosted runtimes and dependency fail-open", () => {
  assert.match(
    qaScript,
    /const blockVendor = process\.env\.QA_BLOCK_VENDOR === "1";/,
  );
  assert.match(qaScript, /requestUrl\.origin === baseOrigin/);
  assert.match(qaScript, /requestUrl\.pathname\.startsWith\("\/vendor\/"\)/);

  assert.match(qaRunner, /async function runQa/);
  assert.match(qaRunner, /QA_BLOCK_EXTERNAL: "1"/);
  assert.match(qaRunner, /QA_ALLOW_OFFLINE: "0"/);
  assert.match(qaRunner, /QA_BLOCK_VENDOR: "1"/);
  assert.match(qaRunner, /QA_ALLOW_OFFLINE: "1"/);
  assert.match(qaRunner, /QA_VIEWPORTS: "1440,390"/);
  assert.match(qaRunner, /process\.env\.QA_OUTPUT_DIR/);
  assert.match(qaScript, /releaseReason\s*===\s*["']animation-complete["']/);
  assert.match(qaScript, /watchdog-timeout/);
  assert.match(qaScript, /data-mobile-nav-trigger/);
  assert.match(qaScript, /aria-expanded/);

  const previewLifecycleIndex = qaRunner.indexOf(
    "await runWithPreviewLifecycle(previewLifecycle,",
  );
  assert.ok(previewLifecycleIndex >= 0, "preview lifecycle must be awaited");
  assert.match(qaRunner, /createPreviewLifecycle/);
  assert.match(qaRunner, /runWithPreviewLifecycle/);
  assert.doesNotMatch(qaRunner, /direct-file|qa-direct-file/);
  assert.equal(packageJson.scripts["qa:file"], undefined);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertVendorPathAttribute(html, expectedPath, htmlLabel) {
  const { attribute, tag } = expectedPath.endsWith(".css")
    ? { attribute: "href", tag: "link" }
    : { attribute: "src", tag: "script" };
  const pattern = new RegExp(
    `<${tag}\\b[^>]*\\s${attribute}\\s*=\\s*(["'])${escapeRegExp(expectedPath)}\\1`,
  );
  const uncommentedHtml = html.replace(/<!--[\s\S]*?-->/g, "");

  assert.ok(
    pattern.test(uncommentedHtml),
    `${htmlLabel} is missing <${tag} ${attribute}="${expectedPath}">`,
  );
}
