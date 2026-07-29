import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const repoDir = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const indexUrl = pathToFileURL(path.join(repoDir, "index.html")).href;
const outputDir = path.resolve(
  process.env.QA_OUTPUT_DIR || path.join(repoDir, ".artifacts", "qa", "direct-file"),
);
const vendorDir = path.join(repoDir, "public", "vendor");
const expectedVendorFiles = [
  "gsap.min.js",
  "SplitText.min.js",
  "ScrollTrigger.min.js",
  "lenis.min.js",
  "lenis.css",
  "anime.umd.min.js",
];

await mkdir(outputDir, { recursive: true });

let browser;
let page;
let primaryError;

try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_EXECUTABLE || undefined,
  });
  page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const localFileRequests = [];
  const localRequestFailures = [];
  const pageErrors = [];
  await page.route("**/*", async (route) => {
    const protocol = new URL(route.request().url()).protocol;
    if (protocol === "http:" || protocol === "https:") {
      await route.abort("blockedbyclient");
    } else {
      await route.continue();
    }
  });
  page.on("request", (request) => {
    const requestUrl = new URL(request.url());
    if (requestUrl.protocol === "file:") {
      localFileRequests.push({
        url: request.url(),
        filePath: path.resolve(fileURLToPath(requestUrl)),
      });
    }
  });
  page.on("requestfailed", (request) => {
    if (new URL(request.url()).protocol === "file:") {
      localRequestFailures.push(
        `${request.url()} — ${request.failure()?.errorText ?? "failed"}`,
      );
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto(indexUrl, { waitUntil: "load", timeout: 30_000 });
  await page.waitForFunction(
    () => document.documentElement.dataset.preloaderReleaseReason === "animation-complete",
    null,
    { timeout: 10_000 },
  );

  const runtime = await page.evaluate(() => {
    const navigation = document.querySelector(".navigation");
    const navigationStyle = navigation ? getComputedStyle(navigation) : null;
    const navigationBounds = navigation?.getBoundingClientRect();
    return {
      protocol: location.protocol,
      gsap: typeof window.gsap,
      scrollTrigger: typeof window.ScrollTrigger,
      splitText: typeof window.SplitText,
      lenis: typeof window.Lenis,
      anime: typeof window.anime,
      preloader: Boolean(document.querySelector("#preloader")),
      releaseReason: document.documentElement.dataset.preloaderReleaseReason,
      navigationPreHidden: navigation?.classList.contains("pre-hidden"),
      navigation: navigation
        ? {
            display: navigationStyle.display,
            visibility: navigationStyle.visibility,
            opacity: Number.parseFloat(navigationStyle.opacity),
            width: navigationBounds.width,
            height: navigationBounds.height,
          }
        : null,
    };
  });

  assert.equal(runtime.protocol, "file:");
  assert.equal(runtime.gsap, "object");
  assert.equal(runtime.scrollTrigger, "function");
  assert.equal(runtime.splitText, "function");
  assert.equal(runtime.lenis, "function");
  assert.equal(runtime.anime, "object");
  assert.equal(runtime.preloader, false);
  assert.equal(runtime.releaseReason, "animation-complete");
  assert.equal(runtime.navigationPreHidden, false);
  assert.ok(runtime.navigation, "navigation is missing after preloader release");
  assert.notEqual(runtime.navigation.display, "none");
  assert.equal(runtime.navigation.visibility, "visible");
  assert.ok(runtime.navigation.opacity > 0, "navigation is fully transparent");
  assert.ok(runtime.navigation.width > 0, "navigation has no width");
  assert.ok(runtime.navigation.height > 0, "navigation has no height");

  const vendorRequests = localFileRequests.filter(({ filePath }) =>
    expectedVendorFiles.includes(path.basename(filePath)),
  );
  assert.equal(vendorRequests.length, expectedVendorFiles.length);
  assert.deepEqual(
    vendorRequests.map(({ filePath }) => path.basename(filePath)).sort(),
    [...expectedVendorFiles].sort(),
  );
  for (const { filePath } of vendorRequests) {
    const relativePath = path.relative(vendorDir, filePath);
    assert.ok(
      relativePath !== ".." &&
        !relativePath.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relativePath),
      `vendor request escapes ${vendorDir}: ${filePath}`,
    );
  }

  await page.screenshot({ path: path.join(outputDir, "hero-1440.png") });

  const initialScrollY = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 1200);
  await page.waitForFunction(
    (startScrollY) => window.scrollY > startScrollY + 20,
    initialScrollY,
    { timeout: 3_000 },
  );
  await page.waitForTimeout(100);
  const finalScrollY = await page.evaluate(() => window.scrollY);
  assert.ok(
    finalScrollY > initialScrollY + 20,
    `scroll did not advance: ${initialScrollY}px to ${finalScrollY}px`,
  );
  assert.deepEqual(localRequestFailures, []);
  assert.deepEqual(pageErrors, []);

} catch (error) {
  primaryError = error;
}

const cleanupErrors = [];
try {
  await page?.close();
} catch (error) {
  cleanupErrors.push(error);
}
try {
  await browser?.close();
} catch (error) {
  cleanupErrors.push(error);
}

const errors = [primaryError, ...cleanupErrors].filter(Boolean);
if (errors.length === 1) throw errors[0];
if (errors.length > 1) {
  throw new AggregateError(errors, "Direct-file runtime QA and cleanup failed");
}

console.log("Direct-file runtime QA passed.");
