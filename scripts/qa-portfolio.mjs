import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const baseUrl = process.argv[2];
if (!baseUrl) {
  throw new Error("Usage: node scripts/qa-portfolio.mjs <base-url>");
}

const moduleTarget = process.env.PLAYWRIGHT_MODULE_URL;
const allowOffline = process.env.QA_ALLOW_OFFLINE === "1";
const playwrightModule = moduleTarget
  ? await import(
      moduleTarget.startsWith("file:")
        ? moduleTarget
        : pathToFileURL(path.resolve(moduleTarget)).href
    )
  : await import("playwright");
const { chromium } = playwrightModule;

const allViewports = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
];
const requestedWidths = new Set(
  (process.env.QA_VIEWPORTS || "")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter(Number.isFinite),
);
const viewports = requestedWidths.size
  ? allViewports.filter(({ width }) => requestedWidths.has(width))
  : allViewports;

const screenshotWidths = new Set([1920, 1024, 390]);
const evidencePaths = [
  "evidence/modeling-csee-cup-2026-third-prize-redacted.png",
  "evidence/cn-story-2026-guangdong-second-prize-redacted.jpg",
];
const outputDir = path.resolve(
  process.env.QA_OUTPUT_DIR || path.join(os.tmpdir(), "will-portfolio-qa"),
);
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BROWSER_EXECUTABLE || undefined,
});
const failures = [];
const notes = [];

function check(condition, message) {
  try {
    assert.ok(condition, message);
  } catch (error) {
    failures.push(error.message);
  }
}

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const requestFailures = [];
    page.on("requestfailed", (request) => {
      requestFailures.push(`${request.url()} — ${request.failure()?.errorText ?? "failed"}`);
    });

    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForLoadState("load", { timeout: 5_000 }).catch(() => {});
    await page.waitForTimeout(1_000);

    const runtime = await page.evaluate(() => ({
      gsap: typeof window.gsap === "object",
      scrollTrigger: typeof window.ScrollTrigger === "function",
      splitText: typeof window.SplitText === "function",
      anime: typeof window.anime === "object",
    }));
    if (!allowOffline) {
      check(
        Object.values(runtime).every(Boolean),
        `${viewport.width}px: external animation runtime incomplete ${JSON.stringify(runtime)}`,
      );
    }

    if (Object.values(runtime).every(Boolean)) {
      await page
        .waitForFunction(() => !document.querySelector("#preloader"), null, {
          timeout: 9_000,
        })
        .catch(async () => {
          notes.push(
            `${viewport.width}px: preloader did not self-remove; overlay removed for scoped layout QA`,
          );
          await page.evaluate(() => {
            document.querySelector("#preloader")?.remove();
            window.lenis?.start?.();
          });
        });
    } else {
      await page.evaluate(() => {
        document.querySelector("#preloader")?.remove();
        window.lenis?.start?.();
      });
      notes.push(
        `${viewport.width}px: external runtime unavailable; preloader removed for scoped layout QA`,
      );
    }

    const basicLayout = await page.evaluate(() => {
      const root = document.documentElement;
      const focus = document.querySelector(".horizontal-text-pin .subtitle-in-text");
      const focusText = focus?.nextElementSibling;
      const identity = document.querySelector("#identity .manifesto");
      const splitMasks = [
        ...identity.querySelectorAll(":scope > .gsap_split_line[class*='-mask']"),
      ];
      const identityLines = splitMasks.length
        ? splitMasks
        : [...identity.querySelectorAll(".reveal-text-line")].slice(0, 3);

      const focusRect = focus?.getBoundingClientRect();
      const textRect = focusText?.getBoundingClientRect();
      const identityRects = identityLines.map((line) => line.getBoundingClientRect());

      return {
        overflow: root.scrollWidth - root.clientWidth,
        focusGap:
          focusRect && textRect ? textRect.top - focusRect.bottom : Number.NaN,
        identityCount: identityLines.length,
        identityAdvance:
          identityRects.length === 3
            ? Math.min(
                identityRects[1].top - identityRects[0].top,
                identityRects[2].top - identityRects[1].top,
              )
            : Number.NEGATIVE_INFINITY,
        identityText: identityLines.map((line) =>
          line.textContent.replace(/\s+/g, ""),
        ),
      };
    });

    check(
      basicLayout.overflow <= 1,
      `${viewport.width}px: document overflow is ${basicLayout.overflow}px`,
    );
    check(
      basicLayout.focusGap >= -1,
      `${viewport.width}px: Current Focus overlap is ${basicLayout.focusGap}px`,
    );
    check(
      basicLayout.identityCount === 3,
      `${viewport.width}px: expected three explicit identity lines`,
    );
    check(
      basicLayout.identityAdvance > 1,
      `${viewport.width}px: identity lines do not advance vertically (${basicLayout.identityAdvance}px)`,
    );
    check(
      basicLayout.identityText.includes("的交叉地带。"),
      `${viewport.width}px: third identity line is not isolated`,
    );

    const initialSkillState = await page.evaluate(() =>
      [...document.querySelectorAll(".value-item")].map((item) => {
        const icon = getComputedStyle(item.querySelector(".value-icon"));
        const titleElement = item.querySelector(".skill-title-line");
        const titleMask = titleElement.closest(".skill-title-mask");
        const title = getComputedStyle(titleElement);
        const titleRect = titleElement.getBoundingClientRect();
        const titleMaskRect = titleMask.getBoundingClientRect();
        const textLines = [
          ...item.querySelectorAll(".scroll-mask-block .reveal-text-line"),
        ];
        const ruleScaleX = [...item.querySelectorAll(".value-item__line")].map(
          (line) => new DOMMatrix(getComputedStyle(line).transform).a,
        );
        return {
          inView: item.classList.contains("scroll-reveal-inview"),
          iconOpacity: Number(icon.opacity),
          iconClipPath: icon.clipPath,
          titleOpacity: Number(title.opacity),
          titleMaskHeadroom: titleMask.clientHeight - titleElement.scrollHeight,
          titleMaskClearance: titleRect.top - titleMaskRect.bottom,
          ruleScaleX,
          hiddenTextLines: textLines.filter(
            (line) => Number(getComputedStyle(line).opacity) < 0.01,
          ).length,
          textLineCount: textLines.length,
          textLineDelays: textLines.map((line) =>
            Number.parseFloat(getComputedStyle(line).transitionDelay),
          ),
          textLineDurations: textLines.map((line) =>
            Number.parseFloat(getComputedStyle(line).transitionDuration),
          ),
        };
      }),
    );
    check(
      initialSkillState.length === 4,
      `${viewport.width}px: expected four initially masked skill cards`,
    );
    for (const [index, state] of initialSkillState.entries()) {
      const hasApprovedTiming = state.textLineDelays.every(
        (delay, lineIndex) => {
          const expectedDelay = (260 + lineIndex * 150 + index * 110) / 1_000;
          return Math.abs(delay - expectedDelay) < 0.002;
        },
      );
      check(
        !state.inView &&
          state.iconOpacity < 0.01 &&
          state.iconClipPath !== "none" &&
          state.titleOpacity < 0.01 &&
          state.ruleScaleX.every((scale) => Math.abs(scale) < 0.001) &&
          state.hiddenTextLines === state.textLineCount,
        `${viewport.width}px: skill ${index + 1} did not start fully masked`,
      );
      check(
        hasApprovedTiming &&
          state.textLineDurations.every(
            (duration) => Math.abs(duration - 1.1) < 0.002,
          ),
        `${viewport.width}px: skill ${index + 1} computed waterfall timing is ${JSON.stringify({
          delays: state.textLineDelays,
          durations: state.textLineDurations,
        })}`,
      );
      check(
        state.titleMaskHeadroom >= 2,
        `${viewport.width}px: skill ${index + 1} title mask headroom is ${state.titleMaskHeadroom}px`,
      );
      check(
        state.titleMaskClearance >= 0.5,
        `${viewport.width}px: skill ${index + 1} title is not fully below its mask`,
      );
    }
    const initialDividerState = await page.evaluate(() =>
      [...document.querySelectorAll(".value-divider")].map(
        (divider) => new DOMMatrix(getComputedStyle(divider).transform).d,
      ),
    );
    check(
      initialDividerState.length === 3 &&
        initialDividerState.every((scale) => Math.abs(scale) < 0.001),
      `${viewport.width}px: skill dividers did not start collapsed`,
    );

    await page.locator("#tech").scrollIntoViewIfNeeded();
    const skillCards = page.locator(".value-item");
    for (let index = 0; index < (await skillCards.count()); index += 1) {
      await skillCards.nth(index).scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
    }
    const skillDividers = page.locator(".value-divider");
    for (let index = 0; index < (await skillDividers.count()); index += 1) {
      await skillDividers.nth(index).scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(2_700);
    const skillState = await page.evaluate(() =>
      [...document.querySelectorAll(".value-item")].map((item) => {
        const icon = getComputedStyle(item.querySelector(".value-icon"));
        const title = getComputedStyle(item.querySelector(".skill-title-line"));
        const textLines = [
          ...item.querySelectorAll(".scroll-mask-block .reveal-text-line"),
        ];
        const lines = [...item.querySelectorAll(".value-item__line")].map((line) =>
          getComputedStyle(line).transform,
        );
        return {
          inView: item.classList.contains("scroll-reveal-inview"),
          iconOpacity: Number(icon.opacity),
          iconTransform: icon.transform,
          iconClipPath: icon.clipPath,
          titleOpacity: Number(title.opacity),
          titleTransform: title.transform,
          hiddenTextLines: textLines.filter(
            (line) => Number(getComputedStyle(line).opacity) < 0.99,
          ).length,
          textLineTransforms: textLines.map(
            (line) => getComputedStyle(line).transform,
          ),
          lines,
        };
      }),
    );
    check(skillState.length === 4, `${viewport.width}px: expected four skill cards`);
    for (const [index, state] of skillState.entries()) {
      check(state.inView, `${viewport.width}px: skill ${index + 1} was not revealed`);
      check(
        state.iconOpacity > 0.99,
        `${viewport.width}px: skill ${index + 1} icon opacity is ${state.iconOpacity}`,
      );
      check(
        state.iconClipPath === "none" ||
          /^inset\(0(px)?(?:\s+0(px)?){0,3}\)$/.test(state.iconClipPath),
        `${viewport.width}px: skill ${index + 1} icon mask is ${state.iconClipPath}`,
      );
      check(
        state.titleOpacity > 0.99 &&
          (state.titleTransform === "none" ||
            state.titleTransform === "matrix(1, 0, 0, 1, 0, 0)"),
        `${viewport.width}px: skill ${index + 1} title did not finish its mask reveal`,
      );
      check(
        state.hiddenTextLines === 0 &&
          state.textLineTransforms.every(
            (transform) =>
              transform === "none" ||
              transform === "matrix(1, 0, 0, 1, 0, 0)",
          ),
        `${viewport.width}px: skill ${index + 1} body lines did not finish their waterfall`,
      );
      check(
        state.lines.every(
          (transform) =>
            transform === "none" ||
            transform === "matrix(1, 0, 0, 1, 0, 0)",
        ),
        `${viewport.width}px: skill ${index + 1} rules did not reach full scale`,
      );
    }
    const dividerState = await page.evaluate(() =>
      [...document.querySelectorAll(".value-divider")].map((divider) => ({
        inView: divider.classList.contains("scroll-reveal-inview"),
        transform: getComputedStyle(divider).transform,
      })),
    );
    check(dividerState.length === 3, `${viewport.width}px: expected three skill dividers`);
    for (const [index, state] of dividerState.entries()) {
      check(state.inView, `${viewport.width}px: divider ${index + 1} was not revealed`);
      check(
        state.transform === "none" ||
          state.transform === "matrix(1, 0, 0, 1, 0, 0)",
        `${viewport.width}px: divider ${index + 1} did not reach full scale`,
      );
    }

    for (const relativePath of evidencePaths) {
      const response = await page.request.get(new URL(relativePath, baseUrl).href);
      check(
        response.ok(),
        `${viewport.width}px: ${relativePath} returned ${response.status()}`,
      );
    }

    if (screenshotWidths.has(viewport.width)) {
      await page.screenshot({
        path: path.join(outputDir, `portfolio-${viewport.width}.png`),
        fullPage: true,
      });
    }
    if (viewport.width === 1440) {
      await page.locator("#tech .section-values").screenshot({
        path: path.join(outputDir, "skills-1440.png"),
      });
    }

    if (requestFailures.length) {
      notes.push(
        `${viewport.width}px request failures:\n${requestFailures
          .slice(0, 8)
          .join("\n")}`,
      );
    }
    await page.close();
  }

  for (const [index, relativePath] of evidencePaths.entries()) {
    const evidencePage = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    await evidencePage.goto(new URL(relativePath, baseUrl).href, {
      waitUntil: "load",
      timeout: 30_000,
    });
    await evidencePage.screenshot({
      path: path.join(outputDir, `evidence-${index + 1}.png`),
      fullPage: true,
    });
    await evidencePage.close();
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForLoadState("load", { timeout: 5_000 }).catch(() => {});
  await page.waitForTimeout(1_000);
  const motionRuntimeReady = await page.evaluate(
    () => typeof window.gsap === "object" && typeof window.ScrollTrigger === "function",
  );
  if (motionRuntimeReady) {
    await page
      .waitForFunction(() => !document.querySelector("#preloader"), null, {
        timeout: 9_000,
      })
      .catch(async () => {
        await page.evaluate(() => document.querySelector("#preloader")?.remove());
      });
  } else {
    await page.evaluate(() => document.querySelector("#preloader")?.remove());
  }

  const motionBaseline = await page.evaluate(() => {
    const paths = [...document.querySelectorAll(".svg-draw path")];
    return {
      pathCount: paths.length,
      initialOffsets: paths.map((path) => getComputedStyle(path).strokeDashoffset),
      durations: paths.map((path) => getComputedStyle(path).transitionDuration),
      delays: paths.slice(0, 4).map((path) => getComputedStyle(path).transitionDelay),
    };
  });
  check(motionBaseline.pathCount === 16, "desktop motion: expected 16 SVG paths");
  check(
    motionBaseline.initialOffsets.every(
      (offset) => Math.abs(Number.parseFloat(offset) - 1) < 0.001,
    ),
    `desktop motion: SVG paths did not start unbuilt ${motionBaseline.initialOffsets.join(", ")}`,
  );
  check(
    motionBaseline.durations.every((duration) => duration === "2.4s"),
    `desktop motion: unexpected durations ${motionBaseline.durations.join(", ")}`,
  );
  check(
    JSON.stringify(motionBaseline.delays) ===
      JSON.stringify(["0s", "0.14s", "0.28s", "0.42s"]),
    `desktop motion: unexpected stagger ${motionBaseline.delays.join(", ")}`,
  );

  const horizontalRange = await page.evaluate(() => {
    const section = document.querySelector(".horizontal-section");
    const trigger = window.ScrollTrigger?.getAll().find(
      (candidate) => candidate.trigger === section && candidate.animation,
    );
    return trigger ? { start: trigger.start, end: trigger.end } : null;
  });
  if (!allowOffline || motionRuntimeReady) {
    check(horizontalRange, "desktop motion: horizontal ScrollTrigger was not created");
  } else {
    notes.push("desktop motion: skipped ScrollTrigger travel checks in offline fallback mode");
  }

  if (horizontalRange) {
    const dividerNames = ["build", "model", "field", "speak"];
    const startedStates = new Map();
    for (let step = 0; step <= 100; step += 1) {
      const progress = step / 100;
      await page.evaluate(
        ({ start, end, progress: nextProgress }) =>
          window.scrollTo(0, start + (end - start) * nextProgress),
        { ...horizontalRange, progress },
      );
      await page.waitForTimeout(40);
      const states = await page.evaluate(
        (names) =>
          Object.fromEntries(
            names.map((name) => {
              const divider = document.querySelector(
                `[data-experience-divider="${name}"]`,
              );
              return [
                name,
                {
                  inView: divider.classList.contains("scroll-reveal-inview"),
                  offsets: [...divider.querySelectorAll("path")].map((path) =>
                    Number.parseFloat(getComputedStyle(path).strokeDashoffset),
                  ),
                },
              ];
            }),
          ),
        dividerNames,
      );
      for (const dividerName of dividerNames) {
        if (states[dividerName].inView && !startedStates.has(dividerName)) {
          startedStates.set(dividerName, states[dividerName]);
        }
      }
      if (startedStates.size === dividerNames.length) break;
    }

    for (const dividerName of dividerNames) {
      const startedState = startedStates.get(dividerName);
      check(
        startedState?.inView,
        `desktop motion: ${dividerName} divider did not trigger`,
      );
      check(
        startedState?.offsets.some((offset) => offset > 0.01),
        `desktop motion: ${dividerName} SVG was already complete at first observation`,
      );
    }
    await page.waitForTimeout(3_000);
    for (const dividerName of dividerNames) {
      const finishedOffsets = await page.evaluate((name) => {
        const divider = document.querySelector(
          `[data-experience-divider="${name}"]`,
        );
        return [...divider.querySelectorAll("path")].map((path) =>
          Number.parseFloat(getComputedStyle(path).strokeDashoffset),
        );
      }, dividerName);
      check(
        finishedOffsets.every((offset) => Math.abs(offset) < 0.001),
        `desktop motion: ${dividerName} divider did not finish ${finishedOffsets.join(", ")}`,
      );
    }

    await page.evaluate(({ end }) => window.scrollTo(0, end), horizontalRange);
    await page.waitForTimeout(300);
    const finalCoverage = await page.evaluate(() => {
      const sectionRect = document
        .querySelector(".horizontal-section")
        .getBoundingClientRect();
      const slides = document.querySelectorAll(".horizontal-section .h-slide");
      const penultimate = slides[slides.length - 2].getBoundingClientRect();
      const last = slides[slides.length - 1].getBoundingClientRect();
      return {
        leftCoverage: penultimate.left - sectionRect.left,
        rightUnderCoverage: sectionRect.right - last.right,
        oneDevicePixel: 1 / window.devicePixelRatio,
      };
    });
    check(
      finalCoverage.leftCoverage >= -3 &&
        finalCoverage.leftCoverage <= finalCoverage.oneDevicePixel,
      `desktop motion: final text slide leaves ${finalCoverage.leftCoverage}px at left`,
    );
    check(
      finalCoverage.rightUnderCoverage >= -3 &&
        finalCoverage.rightUnderCoverage <= finalCoverage.oneDevicePixel,
      `desktop motion: final side under-covers by ${finalCoverage.rightUnderCoverage}px`,
    );
  }
  await page.close();

  const reducedPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await reducedPage.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await reducedPage.evaluate(() => document.querySelector("#preloader")?.remove());
  const reducedState = await reducedPage.evaluate(() => {
    const isIdentity = (transform) =>
      transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)";
    return {
      hiddenIcons: [...document.querySelectorAll(".value-icon")].filter(
        (icon) => Number(getComputedStyle(icon).opacity) < 1,
      ).length,
      hiddenSkillTitles: [
        ...document.querySelectorAll(".skill-title-line"),
      ].filter((title) => {
        const style = getComputedStyle(title);
        return Number(style.opacity) < 1 || !isIdentity(style.transform);
      }).length,
      hiddenSkillTextLines: [
        ...document.querySelectorAll(
          "#tech .scroll-mask-block .reveal-text-line",
        ),
      ].filter((line) => {
        const style = getComputedStyle(line);
        return Number(style.opacity) < 1 || !isIdentity(style.transform);
      }).length,
      unfinishedSkillRules: [
        ...document.querySelectorAll(".value-item__line"),
      ].filter((line) => !isIdentity(getComputedStyle(line).transform)).length,
      unfinishedSkillDividers: [
        ...document.querySelectorAll(".value-divider"),
      ].filter((divider) => !isIdentity(getComputedStyle(divider).transform))
        .length,
      unfinishedPaths: [...document.querySelectorAll(".svg-draw path")].filter(
        (path) =>
          Math.abs(
            Number.parseFloat(getComputedStyle(path).strokeDashoffset),
          ) > 0.001,
      ).length,
    };
  });
  check(reducedState.hiddenIcons === 0, "reduced motion: skill icons remain hidden");
  check(
    reducedState.hiddenSkillTitles === 0,
    "reduced motion: skill titles remain hidden",
  );
  check(
    reducedState.hiddenSkillTextLines === 0,
    "reduced motion: skill body lines remain hidden",
  );
  check(
    reducedState.unfinishedSkillRules === 0,
    "reduced motion: skill rules remain collapsed",
  );
  check(
    reducedState.unfinishedSkillDividers === 0,
    "reduced motion: skill dividers remain collapsed",
  );
  check(reducedState.unfinishedPaths === 0, "reduced motion: SVG paths remain unfinished");
  await reducedPage.close();
} finally {
  await browser.close();
}

for (const note of notes) {
  console.log(`NOTE: ${note}`);
}

if (failures.length) {
  console.error(`\nPortfolio QA failed (${failures.length}):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Portfolio QA passed for ${viewports.length} responsive viewports.`);
}
