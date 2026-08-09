import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8").catch(() => "");

test("custom CSS has one ordered Vite entry", async () => {
  const html = await read("index.html");
  const entry = await read("src/styles/index.css");

  assert.match(
    html,
    /<link rel="stylesheet" href="\/src\/styles\/index\.css">/,
  );
  assert.doesNotMatch(html, /<style(?:\s[^>]*)?>/);
  assert.deepEqual(
    [...entry.matchAll(/@import\s+"\.\/([^\"]+)";/g)].map(
      (match) => match[1],
    ),
    [
      "foundations.css",
      "skills.css",
      "navigation.css",
      "preloader.css",
      "motion.css",
      "horizontal.css",
    ],
  );
});
