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
    2,
    "both horizontal SplitText pipelines should identify their moving lines",
  );
});
