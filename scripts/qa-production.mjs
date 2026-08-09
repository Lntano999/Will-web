import assert from "node:assert/strict";
import { chromium } from "playwright";

const rootUrl = process.env.PRODUCTION_ROOT_URL || "https://will-tech.xyz/";
const canonicalUrl =
  process.env.PRODUCTION_CANONICAL_URL || "https://www.will-tech.xyz/";
const canonicalOrigin = new URL(canonicalUrl).origin;
const knownOptionalHosts = new Set([
  "cdn.jsdelivr.net",
  "cdn.prod.website-files.com",
  "d3e54v103j8qbb.cloudfront.net",
]);

const warnings = [];
const runtimeErrors = [];
let browser;
let page;
let primaryError;

function describeRequest(request) {
  return `${request.url()} — ${request.failure()?.errorText ?? "failed"}`;
}

function isKnownOptionalUrl(value) {
  try {
    const url = new URL(value);
    return (
      knownOptionalHosts.has(url.hostname) ||
      (url.origin === canonicalOrigin && url.pathname === "/favicon.ico")
    );
  } catch {
    return false;
  }
}

function recordNetworkIssue(label, url, detail) {
  const message = `${label}: ${url}${detail ? ` — ${detail}` : ""}`;
  if (isKnownOptionalUrl(url)) warnings.push(message);
  else runtimeErrors.push(message);
}

async function runSmoke() {
  const redirectResponse = await fetch(rootUrl, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(
    redirectResponse.status,
    308,
    `${rootUrl} returned ${redirectResponse.status}, expected 308`,
  );
  const redirectTarget = redirectResponse.headers.get("location");
  assert.ok(redirectTarget, `${rootUrl} did not return a Location header`);
  assert.equal(new URL(redirectTarget, rootUrl).href, canonicalUrl);

  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_EXECUTABLE || undefined,
  });
  page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on("requestfailed", (request) => {
    recordNetworkIssue("request failed", request.url(), describeRequest(request));
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      recordNetworkIssue("HTTP response", response.url(), String(response.status()));
    }
  });
  page.on("pageerror", (error) => {
    const message = error.stack || error.message;
    if (/webflow|unicorn/i.test(message)) warnings.push(`page error: ${message}`);
    else runtimeErrors.push(`page error: ${message}`);
  });
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const sourceUrl = message.location().url;
    const detail = message.text();
    if (isKnownOptionalUrl(sourceUrl) || /webflow|unicorn/i.test(detail)) {
      warnings.push(`console error: ${sourceUrl || "inline"} — ${detail}`);
    } else {
      runtimeErrors.push(`console error: ${sourceUrl || "inline"} — ${detail}`);
    }
  });

  await page.goto(canonicalUrl, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  assert.equal(page.url(), canonicalUrl);
  await page.waitForFunction(
    () => document.documentElement.classList.contains("preloader-released"),
    null,
    { timeout: 12_000 },
  );

  const initialState = await page.evaluate(() => ({
    releaseReason:
      document.documentElement.dataset.preloaderReleaseReason ?? "",
    preloaderPresent: Boolean(document.getElementById("preloader")),
    logo: Boolean(document.querySelector(".nav--logo[href='/']")),
    navigation: Boolean(document.querySelector("nav.navigation")),
    email:
      document
        .querySelector("a[href='mailto:hi@will-tech.xyz']")
        ?.getAttribute("href") ?? "",
    wechatButtons: document.querySelectorAll("button[data-copy-wechat]").length,
    scrollY: window.scrollY,
  }));

  const contractIssues = [];
  if (initialState.releaseReason !== "animation-complete") {
    contractIssues.push(`release reason is ${initialState.releaseReason || "missing"}`);
  }
  if (initialState.releaseReason === "watchdog-timeout") {
    contractIssues.push("watchdog-timeout cannot satisfy production smoke");
  }
  if (initialState.preloaderPresent) contractIssues.push("preloader remains present");
  if (!initialState.logo) contractIssues.push("semantic home logo is missing");
  if (!initialState.navigation) contractIssues.push("semantic primary navigation is missing");
  if (initialState.email !== "mailto:hi@will-tech.xyz") {
    contractIssues.push(`email target is ${initialState.email || "missing"}`);
  }
  if (initialState.wechatButtons !== 2) {
    contractIssues.push(`found ${initialState.wechatButtons} WeChat buttons`);
  }

  await page.mouse.wheel(0, 1_000);
  const scrollAdvanced = await page
    .waitForFunction(
      (startingScrollY) => window.scrollY > startingScrollY + 20,
      initialState.scrollY,
      { timeout: 5_000 },
    )
    .then(() => true)
    .catch(() => false);
  const finalScrollY = await page.evaluate(() => window.scrollY);
  if (!scrollAdvanced || finalScrollY <= initialState.scrollY + 20) {
    contractIssues.push(
      `scrollY did not advance: ${initialState.scrollY} to ${finalScrollY}`,
    );
  }
  contractIssues.push(...runtimeErrors);

  assert.deepEqual(
    contractIssues,
    [],
    `Production core contract failed: ${JSON.stringify(initialState)}`,
  );
  console.log(
    `Production smoke passed: ${rootUrl} -> ${canonicalUrl}, scrollY ${initialState.scrollY} -> ${finalScrollY}.`,
  );
}

try {
  await runSmoke();
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

for (const warning of warnings) {
  console.warn(`WARNING: ${warning}`);
}

if (primaryError && cleanupErrors.length) {
  throw new AggregateError(
    [primaryError, ...cleanupErrors],
    "Production smoke failed and cleanup also failed",
  );
}
if (primaryError) throw primaryError;
if (cleanupErrors.length) {
  throw new AggregateError(cleanupErrors, "Production smoke cleanup failed");
}
