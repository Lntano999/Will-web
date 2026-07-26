import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the blue texture is painted by moving lines, not their mask ancestors", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.doesNotMatch(
    html,
    /\.clipping-text\s*,\s*\.clipping-text\s+\*/,
    "mask wrappers must not inherit the clipping texture",
  );
  assert.match(
    html,
    /\.clipping-text\s+\.split-text-line/,
    "moving SplitText lines should own the clipping texture",
  );
  assert.equal(
    html.match(/linesClass:\s*"split-text-line"/g)?.length,
    1,
    "the shared horizontal SplitText pipeline should identify its moving lines",
  );
});

test("all horizontal slides share one one-shot reveal lifecycle", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(
    html,
    /querySelectorAll\("\.split-timeline,\s*\.split-horizontal"\)/,
    "the shared slide controller should collect first and later slide targets",
  );
  assert.match(
    html,
    /if\s*\(\s*!data\s*\|\|\s*data\.played\s*\)\s*return/,
    "played slides must be guarded from replay",
  );
  assert.equal(
    html.match(/data\.played\s*=\s*true/g)?.length,
    1,
    "the horizontal controller should mark each slide played in one place",
  );
  assert.doesNotMatch(
    html,
    /\bsplitPlayed\b/,
    "the first slide must not keep a private played flag",
  );
  assert.doesNotMatch(
    html,
    /data\.played\s*=\s*false/,
    "played slides must not reset when they leave the viewport",
  );
  assert.doesNotMatch(
    html,
    /classList\.remove\(\s*["']scroll-reveal-inview["']\s*\)/,
    "revealed slides must stay visible after leaving the viewport",
  );
  assert.match(
    html,
    /horizontal:first-ready/,
    "the wrapper timeline should only signal first-slide readiness",
  );
  assert.match(
    html,
    /dispatchEvent\(\s*new CustomEvent\("horizontal:first-ready"\)\s*\)/,
    "the wrapper timeline should dispatch first-slide readiness",
  );
  assert.match(
    html,
    /addEventListener\("horizontal:first-ready"/,
    "the shared slide controller should listen for first-slide readiness",
  );
  assert.match(
    html,
    /if\s*\(\s*!entry\.isIntersecting\s*\|\|\s*entry\.intersectionRatio\s*<\s*minRatio\s*\)\s*return;/,
    "observer exit and low-ratio updates must return without hiding or resetting",
  );
});

test("horizontal reveals progressively enhance and honor reduced motion", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(
    html,
    /body\.h-horizontal-split-ready\s+\.h-slide\s+\.bot\.col\.clipping-text/,
    "horizontal root backgrounds should only clear after SplitText setup succeeds",
  );
  assert.doesNotMatch(
    html,
    /(?:^|\n)\s*\.h-slide\s+\.bot\.col\.clipping-text\s*,/,
    "horizontal root backgrounds must not clear without the enhancement class",
  );
  assert.match(
    html,
    /if\s*\(typeof SplitText\s*!==\s*"function"\)[\s\S]*?new SplitText/,
    "the horizontal controller should check SplitText before registering masks",
  );
  assert.match(
    html,
    /prefers-reduced-motion:\s*reduce[\s\S]*?typeof IntersectionObserver[\s\S]*?if\s*\(!prefersReducedMotion\s*&&\s*canObserve\)[\s\S]*?gsap\.set\(data\.lines,\s*\{\s*y:\s*"140%"/,
    "motion preference and observer support should be checked before lines are hidden",
  );
  assert.match(
    html,
    /slides\.forEach\(slide => slide\.classList\.add\("scroll-reveal-inview"\)\)/,
    "the unenhanced fallback should reveal every horizontal slide",
  );
  assert.match(
    html,
    /function showSlideFinal\(slide\)[\s\S]*?gsap\.set\(data\.lines,[\s\S]*?gsap\.set\(data\.svgPaths,[\s\S]*?gsap\.set\(data\.arrows,/,
    "registered fallback slides should expose text, paths, and arrows without animation",
  );
  assert.match(
    html,
    /slideDataMap\.forEach\(\(_, slide\) => showSlideFinal\(slide\)\)/,
    "fallback and reduced-motion handling should finalize every registered slide",
  );
  assert.match(
    html,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.horizontal-section\s+\.scroll-mask-block\s+\.reveal-text-line\s*\{[^}]*transform:\s*translateY\(0\)[^}]*opacity:\s*1[^}]*transition:\s*none[^}]*transition-delay:\s*0s[^}]*animation:\s*none/s,
    "reduced-motion horizontal waterfall lines should be immediately visible without transitions",
  );
});

test("homepage and footer white copy use the one-shot line controller", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

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
  assert.match(
    html,
    /window\.oneShotWhiteReveals/,
    "the preloader and observer should share reveal instances",
  );
  assert.match(
    html,
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

  assert.match(
    html,
    /class="clipping-text footer-wordmark"/,
    "the large footer mark should have a scoped class",
  );
  assert.match(
    html,
    /#contact\s+\.footer-wordmark\s*\{[^}]*padding-bottom:\s*0\.08em/s,
    "the footer mark should reserve local descent space",
  );
  assert.match(
    html,
    /#contact\.footer\s*\{[^}]*overflow:\s*hidden\s*!important/s,
    "footer overflow containment must remain enabled",
  );
});
