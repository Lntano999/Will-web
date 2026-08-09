import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8").catch(() => "");

test("file protocol fails explicitly before portfolio resources", async () => {
  const html = await read("index.html");
  const guardIndex = html.indexOf("guardUnsupportedFileProtocol");
  const firstResourceIndex = Math.min(
    ...[
      html.indexOf('<link href="./will-tech.core.v1.css"'),
      html.indexOf("<script src="),
    ].filter((index) => index >= 0),
  );

  assert.ok(guardIndex >= 0);
  assert.ok(guardIndex < firstResourceIndex);
  assert.match(html, /location\.protocol\s*!==\s*["']file:["']/);
  assert.match(html, /Will-web requires an HTTP preview/);
  assert.match(html, /window\.stop\(\)/);
});

test("manual acceptance uses the checked-in Vite preview", async () => {
  const [batch, script, packageJsonText, readme] = await Promise.all([
    read("Start-Website.bat"),
    read("scripts/manual-preview.mjs"),
    read("package.json"),
    read("README.md"),
  ]);
  const packageJson = JSON.parse(packageJsonText);

  assert.match(batch, /node scripts\\manual-preview\.mjs/);
  assert.doesNotMatch(batch, /npx|serve -l|5500/);
  assert.equal(
    packageJson.scripts["acceptance:local"],
    "node scripts/manual-preview.mjs",
  );
  assert.match(script, /viteEntry/);
  assert.match(script, /["']build["']/);
  assert.match(script, /["']preview["']/);
  assert.match(script, /--strictPort/);
  assert.match(script, /http:\/\/127\.0\.0\.1:4173\//);
  assert.match(script, /MANUAL_PREVIEW_OPEN/);
  assert.match(readme, /commit.*push.*Preview.*production/is);
  assert.match(readme, /Ctrl\+C/);
});
