import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { chromium } from "playwright";
import { verifyExperienceFlow } from "./qa-experience-flow.mjs";

const baseUrl = new URL(process.argv[2]);
const scenarios = [
  { name: "GSAP missing", block: "/vendor/gsap/gsap.min.js", native: true, staticCards: true },
  { name: "Lenis missing", block: "/vendor/lenis/lenis.min.js", native: true, staticCards: false },
  { name: "ScrollTrigger missing", block: "/vendor/gsap/ScrollTrigger.min.js", native: false, staticCards: true },
  { name: "all vendor files missing", block: "/vendor/", native: true, staticCards: true },
];

let browser;
before(async () => {
  browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || undefined });
});
after(async () => { await browser?.close(); });

for (const { name, block, native, staticCards } of scenarios) {
  test(name, async (t) => {
    const checkTouchMenu = block === "/vendor/gsap/gsap.min.js";
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, hasTouch: checkTouchMenu });
    t.after(() => page.close());
    const blocked = new Set();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== baseUrl.origin) return route.abort();
      if (url.pathname === block || (block === "/vendor/" && url.pathname.startsWith(block))) {
        blocked.add(url.pathname);
        return route.abort();
      }
      return route.continue();
    });

    await page.goto(baseUrl.href);
    await page.waitForFunction(() => document.documentElement.classList.contains("preloader-released"));
    if (block === "/vendor/") assert.ok(blocked.size >= 5);
    else assert.deepEqual([...blocked], [block]);

    await page.mouse.move(700, 450);
    await page.mouse.wheel(0, 950);
    await page.waitForFunction(() => window.scrollY > 50, null, { timeout: 4_000 });
    assert.equal(await page.locator("html").evaluate((el) => el.classList.contains("lenis")), !native);
    await page.locator("nav a.nav-minimal[href='#tech']").click();
    await page.waitForFunction(() => location.hash === "#tech" &&
      !document.documentElement.classList.contains("lenis-locked") &&
      Math.abs(document.querySelector("#tech").getBoundingClientRect().top) < 100,
      null, { timeout: 4_000 });

    if (staticCards) {
      await verifyExperienceFlow(page);
    } else {
      assert.ok(await page.locator("#research").evaluate((el) => el.closest(".pin-spacer") !== null));
    }
    if (checkTouchMenu) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator("[data-mobile-nav-trigger]").tap();
      await page.locator("#mobile-navigation a[href='#contact']").tap({ timeout: 4_000 });
      await page.waitForFunction(() => location.hash === "#contact" &&
        document.querySelector("#contact").getBoundingClientRect().top < innerHeight);
    }
    assert.deepEqual(errors, []);
  });
}
