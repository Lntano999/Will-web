import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadCustomCss() {
  const files = [
    "foundations",
    "skills",
    "navigation",
    "preloader",
    "motion",
    "horizontal",
  ];
  return (
    await Promise.all(
      files.map((name) =>
        readFile(
          new URL(`../src/styles/${name}.css`, import.meta.url),
          "utf8",
        ),
      ),
    )
  ).join("\n");
}

async function loadHorizontalSource() {
  const [layout, reveals] = await Promise.all([
    readFile(
      new URL("../src/motion/horizontal-layout.js", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/motion/horizontal-reveals.js", import.meta.url),
      "utf8",
    ),
  ]);
  return `${layout}\n${reveals}`;
}

test("the blue texture is painted by moving lines, not their mask ancestors", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const customCss = await loadCustomCss();
  const horizontalSource = await loadHorizontalSource();

  assert.doesNotMatch(
    customCss,
    /\.clipping-text\s*,\s*\.clipping-text\s+\*/,
    "mask wrappers must not inherit the clipping texture",
  );
  assert.match(
    customCss,
    /\.clipping-text\s+\.split-text-line/,
    "moving SplitText lines should own the clipping texture",
  );
  assert.equal(
    horizontalSource.match(/linesClass:\s*"split-text-line"/g)?.length,
    2,
    "the original first-slide and later-slide pipelines should each identify moving lines",
  );
});

test("horizontal slides keep the original layout pipelines but never reset after reveal", async () => {
  const html = await loadHorizontalSource();

  assert.match(
    html,
    /querySelectorAll\("\.split-timeline"\)/,
    "the first horizontal group should keep its original dedicated target pipeline",
  );
  assert.match(
    html,
    /querySelectorAll\("\.split-horizontal"\)/,
    "later horizontal groups should keep their original target pipeline",
  );
  assert.doesNotMatch(
    html,
    /querySelectorAll\("\.split-timeline,\s*\.split-horizontal"\)/,
    "the first group must not be forced through the later-group SplitText pipeline",
  );
  assert.match(
    html,
    /\bsplitPlayed\b/,
    "the original first-slide one-shot guard should remain intact",
  );
  assert.match(
    html,
    /function playIntroAnim\(\)/,
    "the original first-slide intro controller should be restored",
  );
  assert.doesNotMatch(
    html,
    /classList\.remove\(\s*["']scroll-reveal-inview["']\s*\)/,
    "revealed slides must stay visible after leaving the viewport",
  );
  assert.doesNotMatch(
    html,
    /data\.played\s*=\s*false/,
    "later slides must never reset their played state",
  );
  assert.match(
    html,
    /if\s*\(\s*!entry\.isIntersecting\s*\|\|\s*entry\.intersectionRatio\s*<\s*minRatio\s*\)\s*\{\s*return;\s*\}/,
    "observer exit updates should return without animating content out",
  );
  assert.match(
    html,
    /slide\.classList\.add\("scroll-reveal-inview"\);[\s\S]*?if \(data\.isFirst && !document\.body\.classList\.contains\("h-slide-1-ready"\)\)/,
    "the original CSS waterfall trigger should run before the first-slide animation gate",
  );
});

test("homepage and footer white copy use explicit line masks without SplitText reflow", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const customCss = await loadCustomCss();
  const controller = await readFile(
    new URL("../src/motion/one-shot-reveals.js", import.meta.url),
    "utf8",
  );

  assert.match(
    html,
    /class="claim-m one-shot-white-reveal"/,
    "the homepage claim should opt into the shared controller",
  );
  assert.match(
    html,
    /class="claim-m expertise-split one-shot-white-reveal"/,
    "the footer claim should opt into the shared controller",
  );
  assert.equal(
    html.match(/class="one-shot-white-mask"/g)?.length,
    7,
    "the four homepage lines and three footer lines should each have a stable clipping mask",
  );
  assert.match(
    customCss,
    /\.one-shot-white-mask\s*\{[^}]*overflow:\s*hidden/s,
    "each explicit line wrapper should clip its moving inner line",
  );
  assert.match(
    controller,
    /querySelectorAll\("\.one-shot-white-line"\)/,
    "the controller should animate the stable inner line elements",
  );
  assert.doesNotMatch(
    controller,
    /new SplitText/,
    "white-copy masks must not depend on SplitText or alter text layout",
  );
  assert.match(
    controller,
    /observer\.unobserve\(entry\.target\)/,
    "the footer observer should stop after the first reveal",
  );
  assert.doesNotMatch(
    html,
    /gsap\.set\(heroClaim,\s*\{\s*opacity:\s*0,\s*y:\s*30\s*\}\)/,
    "the old root-level hero animation must not compete with line masks",
  );
});

test("the footer wordmark reserves period space without opening footer overflow", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const customCss = await loadCustomCss();

  assert.match(
    html,
    /class="clipping-text footer-wordmark"/,
    "the large footer mark should have a scoped class",
  );
  assert.match(
    customCss,
    /#contact\s+\.footer-wordmark\s*\{[^}]*transform:\s*translateY\(-0\.08em\)/s,
    "the footer mark should move the actual glyphs above the clipping boundary",
  );
  assert.doesNotMatch(
    customCss,
    /#contact\s+\.footer-wordmark\s*\{[^}]*padding-bottom:/s,
    "the fix must not rely on padding that extends the clipped box downward",
  );
  assert.match(
    customCss,
    /#contact\.footer\s*\{[^}]*overflow:\s*hidden\s*!important/s,
    "footer overflow containment must remain enabled",
  );
});
