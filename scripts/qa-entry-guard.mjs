import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BROWSER_EXECUTABLE || undefined,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const failedRequests = [];
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  const fileUrl = pathToFileURL(path.resolve("index.html")).href;
  // The guard deliberately calls window.stop() before the source document can
  // fetch its normal runtime, so a browser "load" event is not expected.
  await page.goto(fileUrl, { waitUntil: "commit" });
  await assert.doesNotReject(() =>
    page
      .getByRole("heading", { name: "请通过 HTTP 预览 Will-web" })
      .waitFor(),
  );
  assert.match(await page.title(), /Will-web requires an HTTP preview/);
  // window.stop() may abort requests found earlier by the browser's speculative
  // preload scanner. Once the guard is visible, it must remain network-quiet.
  page.on("requestfailed", (request) => failedRequests.push(request.url()));
  await page.waitForTimeout(250);
  assert.equal(failedRequests.length, 0, failedRequests.join("\n"));
  assert.deepEqual(pageErrors, []);
  console.log("Direct-file guard QA passed.");
} finally {
  await page.close();
  await browser.close();
}
