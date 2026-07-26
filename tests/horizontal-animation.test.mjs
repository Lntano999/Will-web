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
