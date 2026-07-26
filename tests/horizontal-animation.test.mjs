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
  assert.match(
    html,
    /horizontal:first-ready/,
    "the wrapper timeline should only signal first-slide readiness",
  );
});
