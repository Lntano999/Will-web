import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8").catch(() => "");

const withoutFileProtocolGuard = (html) =>
  html.replace(
    /<script>\s*\(function guardUnsupportedFileProtocol\(\)[\s\S]*?<\/script>/,
    "",
  );

test("custom CSS has one ordered Vite entry", async () => {
  const html = await read("index.html");
  const portfolioHtml = withoutFileProtocolGuard(html);
  const entry = await read("src/styles/index.css");

  assert.match(
    html,
    /<link rel="stylesheet" href="\/src\/styles\/index\.css">/,
  );
  assert.doesNotMatch(portfolioHtml, /<style(?:\s[^>]*)?>/);
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

test("application JavaScript has one explicit Vite module entry", async () => {
  const html = await read("index.html");
  const main = await read("src/main.js");
  const packageJson = JSON.parse(await read("package.json"));

  assert.equal(
    html.match(/<script type="module" src="\/src\/main\.js"><\/script>/g)
      ?.length,
    1,
  );
  assert.match(
    main,
    /import \{ createAnimationRuntime \} from "\.\/runtime\/animation-runtime\.js";/,
  );
  assert.match(
    main,
    /import \{ createScrollController \} from "\.\/runtime\/scroll-controller\.js";/,
  );
  assert.doesNotMatch(html, /availableGsapPlugins/);
  assert.doesNotMatch(html, /gsap\.registerPlugin/);
  assert.doesNotMatch(html, /\bvar lenis\b/);
  assert.equal(packageJson.type, "module");
});

test("project reveals are owned by one application module", async () => {
  const html = await read("index.html");
  const main = await read("src/main.js");

  assert.match(
    main,
    /import \{ registerProjectReveals \} from "\.\/motion\/project-reveals\.js";/,
  );
  assert.match(main, /registerProjectReveals\(appContext\);/);
  assert.doesNotMatch(html, /originalProjectList/);
});

test("site interactions are assembled from focused owners", async () => {
  const html = await read("index.html");
  const main = await read("src/main.js");

  for (const [name, path] of [
    ["registerCustomCursor", "custom-cursor"],
    ["registerContactCopy", "contact-copy"],
    ["registerAnchorScroll", "anchor-scroll"],
    ["registerNavigationEffects", "navigation-effects"],
  ]) {
    assert.match(
      main,
      new RegExp(`import \\{ ${name} \\} from "\\.\\/interactions\\/${path}\\.js";`),
    );
    assert.match(main, new RegExp(`${name}\\(appContext\\);`));
  }

  assert.doesNotMatch(
    html,
    /ACTIVATION_DELAY|initNavMinimalElastic|ghost-logo|allAnchorLinks/,
  );
  assert.doesNotMatch(main, /window\.lenis/);
  assert.doesNotMatch(html, /window\.lenis\?\.start/);
});

test("horizontal animation owners are assembled outside HTML", async () => {
  const html = await read("index.html");
  const main = await read("src/main.js");

  assert.match(
    main,
    /import \{ registerHorizontalLayout \} from "\.\/motion\/horizontal-layout\.js";/,
  );
  assert.match(
    main,
    /import \{ registerHorizontalReveals \} from "\.\/motion\/horizontal-reveals\.js";/,
  );
  assert.match(main, /registerHorizontalLayout\(appContext\);/);
  assert.match(main, /registerHorizontalReveals\(appContext\);/);
  assert.doesNotMatch(html, /querySelectorAll\("\.split-timeline"\)/);
  assert.doesNotMatch(html, /slideDataMap/);
});

test("branded entry motion stays behind the independent fail-open boundary", async () => {
  const html = await read("index.html");
  const main = await read("src/main.js");
  const preloaderModule = await read("src/motion/preloader.js");

  assert.match(html, /\(function installPreloaderFailOpen\(\)/);
  assert.ok(
    html.indexOf("installPreloaderFailOpen") < html.indexOf("<script src="),
  );
  assert.doesNotMatch(html, /\(function initOneShotWhiteReveals\(\)/);
  assert.doesNotMatch(html, /\(function initPreloader\(\)/);
  assert.match(
    main,
    /const oneShotReveals = createOneShotReveals\(appContext\);/,
  );
  assert.match(
    main,
    /Object\.assign\(appContext, \{ oneShotReveals \}\);/,
  );
  assert.match(main, /registerPreloader\(appContext\);/);
  assert.match(
    preloaderModule,
    /releasePreloader\("animation-runtime-unavailable"\)/,
  );
  assert.match(
    preloaderModule,
    /releasePreloader\("animation-complete"\)/,
  );
});

test("the final source boundary and assembly order stay explicit", async () => {
  const html = await read("index.html");
  const portfolioHtml = withoutFileProtocolGuard(html);
  const main = await read("src/main.js");

  for (const marker of [
    "var lenis",
    "originalProjectList",
    "slideDataMap",
    "ACTIVATION_DELAY",
    "initOneShotWhiteReveals",
    "initPreloader",
  ]) {
    assert.doesNotMatch(html, new RegExp(marker));
  }

  assert.equal((html.match(/type="module"/g) ?? []).length, 1);
  assert.doesNotMatch(portfolioHtml, /<style(?:\s[^>]*)?>/);
  assert.match(html, /installPreloaderFailOpen/);
  assert.match(html, /initSkillReveals/);

  const orderedCalls = [
    "registerHorizontalLayout(appContext)",
    "registerHorizontalReveals(appContext)",
    "registerProjectReveals(appContext)",
    "registerCustomCursor(appContext)",
    "registerContactCopy(appContext)",
    "registerAnchorScroll(appContext)",
    "registerNavigationEffects(appContext)",
    "createOneShotReveals(appContext)",
    "registerPreloader(appContext)",
  ];
  const positions = orderedCalls.map((call) => main.indexOf(call));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});
