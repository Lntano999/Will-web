# Will-web Source Modularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split Will-web's custom inline CSS and JavaScript into explicit source modules while preserving the current DOM, copy, motion timing, visual identity, fallbacks, and production behavior.

**Architecture:** Keep `index.html` as the static content and DOM source, retain `will-tech.core.v1.css` as the untouched Webflow baseline, and add one Vite CSS entry plus one ES Module assembly entry. Existing self-hosted UMD runtimes remain the third-party boundary; Will-web modules receive those runtimes through a small adapter and share one Lenis controller. The dependency-free preloader fail-open remains inline as the earliest safety layer.

**Tech Stack:** Vite 8, native HTML/CSS/JavaScript ES Modules, GSAP 3.14.2, Lenis 1.3.15, anime.js 4.4.1, Node test runner, Playwright with Microsoft Edge.

---

## File map

**Create:**

- `src/main.js` — sole normal application assembly entry.
- `src/runtime/animation-runtime.js` — validates/registers the existing UMD animation globals.
- `src/runtime/scroll-controller.js` — owns the only Lenis instance and native-scroll fallback.
- `src/motion/horizontal-layout.js` — owns horizontal pin, scale, track translation, and distance.
- `src/motion/horizontal-reveals.js` — owns horizontal line, arrow, and SVG reveal registration.
- `src/motion/project-reveals.js` — owns `.use-case__list` reset and reveal timelines.
- `src/motion/one-shot-reveals.js` — owns hero/footer explicit line-mask reveals.
- `src/motion/preloader.js` — owns the normal branded preloader animation.
- `src/interactions/custom-cursor.js` — owns the hero cursor replacement.
- `src/interactions/contact-copy.js` — owns copy feedback and toast lifecycle.
- `src/interactions/anchor-scroll.js` — owns navigation target resolution and offsets.
- `src/interactions/navigation-effects.js` — owns ghost-logo sync and elastic press feedback.
- `src/styles/index.css` — ordered CSS entry.
- `src/styles/foundations.css` — global overrides and the first part of the current large inline block.
- `src/styles/skills.css` — Methods & Skills layout and reveal state rules.
- `src/styles/navigation.css` — navigation, small-button, burger, and elastic rules.
- `src/styles/preloader.css` — preloader presentation and states.
- `src/styles/motion.css` — generic bounce/reveal rules that currently live in later blocks.
- `src/styles/horizontal.css` — horizontal SVG sizing and horizontal-specific late overrides.
- `tests/source-modularization.test.mjs` — source-boundary and assembly-order contracts.
- `tests/runtime-adapters.test.mjs` — behavioral tests for runtime and scroll adapters.
- `docs/audits/2026-08-09-source-modularization-verification.md` — verified result and remaining risks.

**Modify:**

- `index.html` — remove migrated blocks, use HTTP vendor URLs, link the two source entries.
- `package.json` — retire `qa:file`.
- `vite.config.mjs` — remove the direct-file path rewrite plugin.
- `scripts/run-qa-local.mjs` — run only supported HTTP normal/fallback rounds.
- `tests/build-foundation.test.mjs` — remove direct-file orchestration contract and retain bounded preview lifecycle checks.
- `tests/dependency-localization.test.mjs` — assert Vite/Vercel `/vendor/` URLs rather than disk URLs.
- `tests/content-refresh.test.mjs` — read CSS/JS entry sources for moved behavior contracts.
- `tests/horizontal-animation.test.mjs` — read horizontal/one-shot modules and CSS instead of assuming they are inline.
- `D:/Obsidian--notes/notion/前端知识/module.md` or a new `模块化.md` — merge, do not overwrite, the reusable module/entry/ownership concepts.

**Delete:**

- `scripts/qa-direct-file.mjs` — unsupported `file://` product path.

## Task 1: Retire the unsupported direct-file entry

**Files:**

- Modify: `index.html`
- Modify: `package.json`
- Modify: `vite.config.mjs`
- Modify: `scripts/run-qa-local.mjs`
- Modify: `tests/build-foundation.test.mjs`
- Modify: `tests/dependency-localization.test.mjs`
- Delete: `scripts/qa-direct-file.mjs`

- [x] **Step 1: Replace direct-file expectations with the supported HTTP contract**

Update `tests/dependency-localization.test.mjs` so the source contract is explicit:

```js
const servedVendorPaths = [
  "/vendor/gsap/gsap.min.js",
  "/vendor/gsap/SplitText.min.js",
  "/vendor/gsap/ScrollTrigger.min.js",
  "/vendor/lenis/lenis.min.js",
  "/vendor/lenis/lenis.css",
  "/vendor/anime/anime.umd.min.js",
];

test("source HTML uses Vite public-directory vendor URLs", () => {
  for (const servedPath of servedVendorPaths) {
    assertVendorPathAttribute(indexHtml, servedPath, "source HTML");
  }
  assert.doesNotMatch(indexHtml, /\.\/public\/vendor\//);
});
```

Remove assertions for `rewriteVendorPathsForVite`, the direct-file plugin, `qa:file`, and the direct-file runner round. In `tests/build-foundation.test.mjs`, retain the preview lifecycle assertions but make the final orchestration assertion end after the vendor-blocked HTTP round and preview cleanup.

- [x] **Step 2: Run the focused tests and observe RED**

Run:

```powershell
node --test tests/dependency-localization.test.mjs tests/build-foundation.test.mjs
```

Expected: FAIL because `index.html`, `package.json`, `vite.config.mjs`, and the QA runner still contain the direct-file contract.

- [x] **Step 3: Remove only the unsupported entry path**

Apply these concrete changes:

```js
// vite.config.mjs
import { defineConfig } from "vite";

export default defineConfig({
  appType: "mpa",
  build: { outDir: "dist", emptyOutDir: true },
  server: { host: "127.0.0.1" },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
});
```

In `index.html`, replace each `./public/vendor/` prefix with `/vendor/`. Remove `qa:file` from `package.json`, remove the direct-file constant and invocation from `scripts/run-qa-local.mjs`, and delete `scripts/qa-direct-file.mjs`. Do not change the normal or vendor-blocked HTTP rounds.

Make the runner output root overridable so baseline and migrated evidence do not overwrite each other:

```js
const outputDir = path.resolve(
  process.env.QA_OUTPUT_DIR || path.join(repoDir, ".artifacts", "qa"),
);
```

- [x] **Step 4: Verify the supported entry**

Run:

```powershell
node --test tests/dependency-localization.test.mjs tests/build-foundation.test.mjs
node scripts/sync-vendor-assets.mjs
node node_modules/vite/bin/vite.js build
```

Expected: focused tests pass; 9 approved vendor files are synchronized; Vite build exits 0 and `dist/vendor/` contains the allowlisted assets.

- [x] **Step 5: Capture the supported HTTP visual baseline**

Run:

```powershell
$env:BROWSER_EXECUTABLE='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$env:QA_OUTPUT_DIR=(Join-Path (Get-Location) '.artifacts\qa-baseline')
node scripts/run-qa-local.mjs
Remove-Item Env:QA_OUTPUT_DIR
```

Expected: six normal viewports and two vendor-blocked fallback viewports pass; baseline screenshots are preserved under `.artifacts/qa-baseline/`; port 4173 is clean after shutdown.

- [x] **Step 6: Commit the support-boundary change**

```powershell
git add index.html package.json vite.config.mjs scripts/run-qa-local.mjs scripts/qa-direct-file.mjs tests/build-foundation.test.mjs tests/dependency-localization.test.mjs
git commit -m "build: standardize HTTP runtime entry"
```

## Task 2: Extract inline CSS without changing cascade order

**Files:**

- Create: `src/styles/index.css`
- Create: `src/styles/foundations.css`
- Create: `src/styles/skills.css`
- Create: `src/styles/navigation.css`
- Create: `src/styles/preloader.css`
- Create: `src/styles/motion.css`
- Create: `src/styles/horizontal.css`
- Create: `tests/source-modularization.test.mjs`
- Modify: `index.html`
- Modify: `tests/content-refresh.test.mjs`
- Modify: `tests/horizontal-animation.test.mjs`

- [x] **Step 1: Write the CSS entry and no-inline-style contracts**

Create the setup in `tests/source-modularization.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("custom CSS has one ordered Vite entry", async () => {
  const html = await read("index.html");
  const entry = await read("src/styles/index.css");
  assert.match(html, /<link rel="stylesheet" href="\/src\/styles\/index\.css">/);
  assert.doesNotMatch(html, /<style(?:\s[^>]*)?>/);
  assert.deepEqual(
    [...entry.matchAll(/@import\s+"\.\/([^\"]+)";/g)].map((match) => match[1]),
    ["foundations.css", "skills.css", "navigation.css", "preloader.css", "motion.css", "horizontal.css"],
  );
});
```

- [x] **Step 2: Run the new test and observe RED**

Run:

```powershell
node --test tests/source-modularization.test.mjs
```

Expected: FAIL because the CSS entry does not exist and `index.html` still contains seven `<style>` blocks.

- [x] **Step 3: Move the rules byte-for-byte in original cascade order**

Create `src/styles/index.css` exactly as:

```css
@import "./foundations.css";
@import "./skills.css";
@import "./navigation.css";
@import "./preloader.css";
@import "./motion.css";
@import "./horizontal.css";
```

Use the design-baseline `index.html` ranges as the move map:

```text
foundations.css = old lines 31–136, then 139–198
skills.css      = old lines 199–679
navigation.css  = old lines 680–953, 1292–1318, and 1341–1351
preloader.css   = old lines 954–1152
motion.css      = old lines 1387–1391
horizontal.css  = old lines 1472–1473
```

Preserve every selector, declaration, media query, comment, `!important`, and order inside those ranges. Remove the now-empty block at old lines 1935–1936. Add the entry link immediately after the Lenis stylesheet:

```html
<link rel="stylesheet" href="/vendor/lenis/lenis.css">
<link rel="stylesheet" href="/src/styles/index.css">
```

- [x] **Step 4: Retarget existing style assertions and verify GREEN**

In both existing test files, add a loader that concatenates the ordered CSS files:

```js
async function loadCustomCss() {
  const files = ["foundations", "skills", "navigation", "preloader", "motion", "horizontal"];
  return (await Promise.all(files.map((name) => readFile(
    new URL(`../src/styles/${name}.css`, import.meta.url),
    "utf8",
  )))).join("\n");
}
```

Use `html` only for DOM/content assertions and `customCss` for moved selector/timing assertions. Run:

```powershell
node --test tests/source-modularization.test.mjs tests/content-refresh.test.mjs tests/horizontal-animation.test.mjs
node node_modules/vite/bin/vite.js build
```

Expected: all focused tests pass; build exits 0; no CSS order warning appears.

- [x] **Step 5: Commit the CSS extraction**

```powershell
git add index.html src/styles tests/source-modularization.test.mjs tests/content-refresh.test.mjs tests/horizontal-animation.test.mjs
git commit -m "refactor: extract custom site styles"
```

## Task 3: Establish the runtime adapter, shared scroll controller, and main entry

**Files:**

- Create: `src/runtime/animation-runtime.js`
- Create: `src/runtime/scroll-controller.js`
- Create: `src/main.js`
- Create: `tests/runtime-adapters.test.mjs`
- Modify: `index.html`
- Modify: `tests/source-modularization.test.mjs`
- Modify: `tests/content-refresh.test.mjs`

- [x] **Step 1: Write behavioral adapter tests**

Test these public contracts in `tests/runtime-adapters.test.mjs`:

```js
test("animation runtime registers only available GSAP plugins", () => {
  const registered = [];
  const globals = {
    gsap: { registerPlugin: (...plugins) => registered.push(...plugins) },
    ScrollTrigger: { name: "ScrollTrigger" },
    SplitText: undefined,
    anime: { animate() {} },
    Lenis: class {},
  };
  const runtime = createAnimationRuntime(globals);
  assert.deepEqual(registered, [globals.ScrollTrigger]);
  assert.equal(runtime.gsap, globals.gsap);
  assert.equal(runtime.SplitText, null);
});

test("scroll controller falls back without constructing Lenis", () => {
  const calls = [];
  const controller = createScrollController({
    runtime: { Lenis: null, gsap: null, ScrollTrigger: null },
    globals: { scrollY: 10, scrollTo: (...args) => calls.push(args) },
    document: { documentElement: { classList: { contains: () => true } } },
  });
  assert.equal(controller.isSmooth, false);
  controller.scrollTo(120);
  assert.equal(calls.length, 1);
});
```

Also test that a fake Lenis constructor is called once, that `preloader:released` starts it, and that `destroy()` removes its ticker/listener when supported.

- [x] **Step 2: Run the adapter tests and observe RED**

Run:

```powershell
node --test tests/runtime-adapters.test.mjs
```

Expected: FAIL with module-not-found for `src/runtime/animation-runtime.js`.

- [x] **Step 3: Implement the narrow runtime boundary**

Implement these exact exports:

```js
// src/runtime/animation-runtime.js
export function createAnimationRuntime(globals = globalThis) {
  const gsap = globals.gsap ?? null;
  const ScrollTrigger = globals.ScrollTrigger ?? null;
  const SplitText = globals.SplitText ?? null;
  const anime = globals.anime ?? null;
  const Lenis = globals.Lenis ?? null;
  if (gsap) {
    const plugins = [SplitText, ScrollTrigger].filter(Boolean);
    if (plugins.length) gsap.registerPlugin(...plugins);
  }
  return { gsap, ScrollTrigger, SplitText, anime, Lenis };
}
```

`createScrollController({ runtime, globals = globalThis, document = globalThis.document })` must return:

```js
{
  isSmooth,
  instance,
  start(),
  stop(),
  scrollTo(target, options),
  destroy(),
}
```

Move the complete Lenis setup from design-baseline commit `3232faf`, `index.html` lines 2267–2311: construction, `ScrollTrigger.update`, GSAP ticker callback, lag smoothing, initial stop/start decision, and DOM reset. Add a `preloader:released` listener that calls `start()`. The fallback `scrollTo` must accept a number or element and call native `window.scrollTo`.

- [x] **Step 4: Add the assembly entry and remove duplicate inline runtime setup**

Start `src/main.js` with:

```js
import { createAnimationRuntime } from "./runtime/animation-runtime.js";
import { createScrollController } from "./runtime/scroll-controller.js";

const runtime = createAnimationRuntime(window);
const scrollController = createScrollController({ runtime });

export const appContext = { runtime, scrollController };

// Temporary compatibility bridge for the still-inline anchor controller.
// Task 5 removes this assignment with the old controller.
window.lenis = scrollController.instance ?? undefined;
```

Replace the inline GSAP plugin registration and inline Lenis block with one tag after the anime.js and Unicorn loader tags:

```html
<script type="module" src="/src/main.js"></script>
```

Keep the earliest scroll-reset block and dependency-free preloader fail-open inline. Keep its current `window.lenis?.start?.()` call during this transitional task so the old and new ownership paths remain compatible; Task 5 removes the temporary global bridge and that call together after anchor scrolling consumes `scrollController` directly.

- [x] **Step 5: Verify and commit**

Run:

```powershell
node --test tests/runtime-adapters.test.mjs tests/source-modularization.test.mjs tests/content-refresh.test.mjs
node node_modules/vite/bin/vite.js build
```

Expected: focused tests pass; the build contains a generated module chunk; `index.html` contains exactly one `type="module"` application entry.

```powershell
git add index.html src/main.js src/runtime tests/runtime-adapters.test.mjs tests/source-modularization.test.mjs tests/content-refresh.test.mjs
git commit -m "refactor: establish frontend runtime entry"
```

## Task 4: Extract the independent project reveal controller

**Files:**

- Create: `src/motion/project-reveals.js`
- Modify: `src/main.js`
- Modify: `index.html`
- Modify: `tests/content-refresh.test.mjs`
- Modify: `tests/horizontal-animation.test.mjs`
- Modify: `tests/source-modularization.test.mjs`

- [x] **Step 1: Add failing ownership tests**

Assert that `src/main.js` imports and calls the registration and that `index.html` no longer contains `originalProjectList`:

```js
assert.match(main, /registerProjectReveals\(appContext\)/);
assert.doesNotMatch(html, /originalProjectList/);
```

Run `node --test tests/source-modularization.test.mjs`; expect RED.

- [x] **Step 2: Extract the project controller without changing its timeline**

Export `registerProjectReveals({ runtime, document = globalThis.document, window = globalThis.window })`. Its complete implementation is the JavaScript body in design-baseline commit `3232faf`, `index.html` lines 2035–2111, wrapped by that function. Replace only `gsap` and `ScrollTrigger` global reads with `runtime.gsap` and `runtime.ScrollTrigger` local bindings.

Keep the existing selectors, `start: "top 75%"`, `once: true`, 2.5-second image/mask timing, 1.5-second text timing, 0.2 stagger, and 1.0 timeline position.

- [x] **Step 3: Register in `main.js` and retarget tests**

```js
import { registerProjectReveals } from "./motion/project-reveals.js";

registerProjectReveals(appContext);
```

Read `project-reveals.js` for existing project timing assertions. Keep the one-shot reveal inline until it can move atomically with the preloader in Task 7. Run the focused test files and Vite build; expect PASS.

- [x] **Step 4: Run focused verification**

```powershell
node --test tests/content-refresh.test.mjs tests/source-modularization.test.mjs
node node_modules/vite/bin/vite.js build
```

Expected: PASS; the project controller is external and the still-inline one-shot/preloader pair behaves as before.

- [x] **Step 5: Commit**

```powershell
git add index.html src/main.js src/motion/project-reveals.js tests/content-refresh.test.mjs tests/source-modularization.test.mjs
git commit -m "refactor: extract project reveal controller"
```

## Task 5: Extract interaction controllers

**Files:**

- Create: `src/interactions/custom-cursor.js`
- Create: `src/interactions/contact-copy.js`
- Create: `src/interactions/anchor-scroll.js`
- Create: `src/interactions/navigation-effects.js`
- Modify: `src/main.js`
- Modify: `index.html`
- Modify: `tests/source-modularization.test.mjs`

- [x] **Step 1: Add failing assembly and inline-removal tests**

Assert the four imports/calls exist in `main.js` and the old markers are absent from HTML:

```js
for (const call of [
  "registerCustomCursor(appContext)",
  "registerContactCopy(appContext)",
  "registerAnchorScroll(appContext)",
  "registerNavigationEffects(appContext)",
]) assert.match(main, new RegExp(call.replace(/[()]/g, "\\$&")));

assert.doesNotMatch(html, /ACTIVATION_DELAY|initNavMinimalElastic|ghost-logo|allAnchorLinks/);
```

Run the modularization test; expect RED.

- [x] **Step 2: Move each responsibility unchanged**

Use one public function per file:

```js
export function registerCustomCursor({ runtime, document = globalThis.document, window = globalThis.window }) {}
export function registerContactCopy({ document = globalThis.document, window = globalThis.window }) {}
export function registerAnchorScroll({ scrollController, document = globalThis.document, window = globalThis.window }) {}
export function registerNavigationEffects({ document = globalThis.document, window = globalThis.window }) {}
```

Move the complete interaction block from design-baseline commit `3232faf`, `index.html` lines 2315–2606, into the four owners according to its existing comment and `DOMContentLoaded` boundaries. Do not change cursor durations, toast text/timers, anchor offsets, dynamic duration formula, ghost-logo positioning, pointer classes, or elastic animation names.

`registerAnchorScroll` must intercept a link only when `scrollController.isSmooth` is true. When false, leave the original `href` intact so native anchors continue to work. This is the required Lenis-failure fallback. After this module is registered, remove `window.lenis = scrollController.instance ?? undefined` from `main.js` and remove `window.lenis?.start?.()` from the inline fail-open; the `preloader:released` listener is then the only scroll restart bridge.

- [x] **Step 3: Register after the runtime context is created**

Add the four imports to `src/main.js`, then call them in the same relative order as the old combined block: cursor, contact/anchors, navigation effects. Remove only the migrated combined inline block from `index.html`.

- [x] **Step 4: Verify browser-neutral contracts and build**

Run:

```powershell
node --test tests/source-modularization.test.mjs tests/runtime-adapters.test.mjs tests/content-refresh.test.mjs
node node_modules/vite/bin/vite.js build
```

Expected: PASS; build exits 0; no old interaction marker remains inline.

- [x] **Step 5: Commit**

```powershell
git add index.html src/main.js src/interactions tests/source-modularization.test.mjs
git commit -m "refactor: extract site interaction controllers"
```

## Task 6: Extract the horizontal animation owners

**Files:**

- Create: `src/motion/horizontal-layout.js`
- Create: `src/motion/horizontal-reveals.js`
- Modify: `src/main.js`
- Modify: `index.html`
- Modify: `tests/horizontal-animation.test.mjs`
- Modify: `tests/content-refresh.test.mjs`
- Modify: `tests/source-modularization.test.mjs`

- [x] **Step 1: Make the existing horizontal contracts read the future owners**

Load the sources separately:

```js
const horizontalLayout = await readFile(
  new URL("../src/motion/horizontal-layout.js", import.meta.url), "utf8",
);
const horizontalReveals = await readFile(
  new URL("../src/motion/horizontal-reveals.js", import.meta.url), "utf8",
);
const horizontalSource = `${horizontalLayout}\n${horizontalReveals}`;
```

Retarget first-slide, later-slide, one-shot, threshold, SVG timing, tail-distance, and no-reset assertions to `horizontalSource`. Add an assertion that `index.html` contains neither `.split-timeline` controller code nor `slideDataMap`. Run the tests; expect module-not-found RED.

- [x] **Step 2: Extract layout ownership verbatim**

Export `registerHorizontalLayout({ runtime, document = globalThis.document, window = globalThis.window })`. Its complete implementation is the first horizontal JavaScript body in design-baseline commit `3232faf`, `index.html` lines 1605–1697. Wrap that body without rewriting its control flow, and bind `gsap`, `ScrollTrigger`, and `SplitText` from `runtime`.

Keep `Math.ceil(track.scrollWidth - section.clientWidth) + 1`, timeline durations `0.3 / 0.2 / 0.5 / 0.15`, `window.innerHeight * 0.5`, and the existing `scaleStart`/`scaleEnd` calculation exactly.

- [x] **Step 3: Extract reveal ownership verbatim**

Export `registerHorizontalReveals(context)`. Its complete implementation is the second horizontal JavaScript body in design-baseline commit `3232faf`, `index.html` lines 1703–1829. Bind runtime globals from `context.runtime`. Keep separate `.split-horizontal` processing, the first-slide `h-slide-1-ready` gate, `IntersectionObserver` thresholds, one-shot `played`, line duration/stagger, arrow duration, SVG initialization and draw timing. Preserve reduced-motion and runtime-unavailable immediate final states.

- [x] **Step 4: Register in original order and verify**

In `main.js`, place the horizontal calls before `registerProjectReveals(appContext)`, matching the original `load` listener registration order. Remove the two old embedded script blocks but retain their surrounding DOM containers only if they affect layout; otherwise remove the now-empty `w-script` wrappers after browser comparison.

```js
import { registerHorizontalLayout } from "./motion/horizontal-layout.js";
import { registerHorizontalReveals } from "./motion/horizontal-reveals.js";

registerHorizontalLayout(appContext);
registerHorizontalReveals(appContext);
```

Run:

```powershell
node --test tests/horizontal-animation.test.mjs tests/content-refresh.test.mjs tests/source-modularization.test.mjs
node node_modules/vite/bin/vite.js build
```

Expected: PASS with exactly two `linesClass: "split-text-line"` pipelines and no reset path.

- [x] **Step 5: Commit**

```powershell
git add index.html src/main.js src/motion/horizontal-layout.js src/motion/horizontal-reveals.js tests/horizontal-animation.test.mjs tests/content-refresh.test.mjs tests/source-modularization.test.mjs
git commit -m "refactor: separate horizontal motion ownership"
```

## Task 7: Extract one-shot masks and the branded preloader atomically

**Files:**

- Create: `src/motion/one-shot-reveals.js`
- Create: `src/motion/preloader.js`
- Modify: `src/main.js`
- Modify: `index.html`
- Modify: `tests/content-refresh.test.mjs`
- Modify: `tests/source-modularization.test.mjs`

- [x] **Step 1: Add failing preloader-boundary tests**

Assert all of the following:

```js
assert.match(html, /\(function installPreloaderFailOpen\(\)/);
assert.ok(html.indexOf("installPreloaderFailOpen") < html.indexOf("<script src="));
assert.doesNotMatch(html, /\(function initOneShotWhiteReveals\(\)/);
assert.doesNotMatch(html, /\(function initPreloader\(\)/);
assert.match(main, /const oneShotReveals = createOneShotReveals\(appContext\)/);
assert.match(main, /registerPreloader\(appContext\)/);
assert.match(preloaderModule, /releasePreloader\("animation-runtime-unavailable"\)/);
assert.match(preloaderModule, /releasePreloader\("animation-complete"\)/);
```

Run the focused test; expect RED because the one-shot controller and normal preloader animation remain inline.

- [x] **Step 2: Move the one-shot controller and preserve its returned handles**

Create `createOneShotReveals({ runtime, document = globalThis.document, window = globalThis.window })` from the complete body in design-baseline commit `3232faf`, `index.html` lines 2608–2676. Return `{ hero, footer }` instead of assigning `window.oneShotWhiteReveals`.

Keep hero defaults `duration: 0.8`, `stagger: 0.08`; footer `duration: 1.05`, `stagger: 0.14`; reduced-motion final states; and footer threshold `0.25`.

- [x] **Step 3: Move the normal animation into one module**

Create `registerPreloader({ runtime, oneShotReveals, document = globalThis.document, window = globalThis.window })` from the complete normal animation body in design-baseline commit `3232faf`, `index.html` lines 2679–2951.

Replace global reads with `runtime.anime`, `runtime.gsap`, and `oneShotReveals.hero`. Keep all current durations, delays, easings, selectors, counter formula, curtain movement, zoom cleanup, nav stagger, hero mask timing, and release reasons unchanged.

- [x] **Step 4: Register the pair in order and keep fail-open independent**

In `main.js`, assemble the pair exactly as:

```js
import { createOneShotReveals } from "./motion/one-shot-reveals.js";
import { registerPreloader } from "./motion/preloader.js";

const oneShotReveals = createOneShotReveals(appContext);
Object.assign(appContext, { oneShotReveals });
registerPreloader(appContext);
```

The inline fail-open must continue to:

```text
install before every external script
release idempotently
clear its watchdog
remove the preloader
reveal navigation
record documentElement.dataset.preloaderReleaseReason
dispatch preloader:released
refresh ScrollTrigger when available
expire after 8,000ms
```

Do not import any module from this inline block. Remove both old inline blocks only after the two calls above exist.

- [x] **Step 5: Run focused and full static verification**

```powershell
node --test tests/source-modularization.test.mjs tests/content-refresh.test.mjs tests/runtime-adapters.test.mjs
node --test tests/*.test.mjs
node node_modules/vite/bin/vite.js build
```

Expected: all tests pass; build exits 0; the branded normal path and the fail-open path are both still asserted.

- [ ] **Step 6: Commit**

```powershell
git add index.html src/main.js src/motion/one-shot-reveals.js src/motion/preloader.js tests/content-refresh.test.mjs tests/horizontal-animation.test.mjs tests/source-modularization.test.mjs
git commit -m "refactor: extract branded entry motion"
```

## Task 8: Integration cleanup, browser/visual QA, and knowledge record

**Files:**

- Modify: `index.html`
- Modify: `src/main.js`
- Modify: relevant `src/**` modules only if QA exposes a regression
- Modify: `tests/source-modularization.test.mjs`
- Create: `docs/audits/2026-08-09-source-modularization-verification.md`
- Modify or create: `D:/Obsidian--notes/notion/前端知识/module.md` or `模块化.md`

- [ ] **Step 1: Enforce the final source boundary**

The modularization test must prove:

```js
const forbiddenInlineMarkers = [
  "var lenis",
  "originalProjectList",
  "slideDataMap",
  "ACTIVATION_DELAY",
  "initOneShotWhiteReveals",
  "initPreloader",
];
for (const marker of forbiddenInlineMarkers) assert.doesNotMatch(html, new RegExp(marker));

assert.equal((html.match(/type="module"/g) ?? []).length, 1);
assert.doesNotMatch(html, /<style(?:\s[^>]*)?>/);
assert.match(html, /installPreloaderFailOpen/);
assert.match(html, /initSkillReveals/); // documented parser-time reliability exception
```

Also assert the final assembly order by comparing `main.indexOf(...)` for:

```js
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
```

Run `node --test tests/*.test.mjs`; expect PASS before browser work.

- [ ] **Step 2: Run syntax, vendor, build, and full HTTP QA**

Run:

```powershell
Get-ChildItem -Path src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
node scripts/sync-vendor-assets.mjs
node node_modules/vite/bin/vite.js build
$env:BROWSER_EXECUTABLE='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$env:QA_OUTPUT_DIR=(Join-Path (Get-Location) '.artifacts\qa-modularized')
node scripts/run-qa-local.mjs
Remove-Item Env:QA_OUTPUT_DIR
```

Expected:

```text
all JavaScript syntax checks exit 0
9 approved vendor files synchronized
Vite build exits 0
normal HTTP QA passes at 1920/1440/1024/768/390/360
vendor-blocked fallback passes at 1440/390
port 4173 is clean after preview shutdown
```

- [ ] **Step 3: Review the required visual states**

Compare `.artifacts/qa-modularized/` with `.artifacts/qa-baseline/` for:

```text
hero after preloader completion
horizontal groups 1–4 before trigger, during reveal, and completed
horizontal final tail coverage
Methods & Skills icon/title/rule completion
footer one-shot reveal completion
390px hero, horizontal reading state, skills, and footer
reduced-motion final states
vendor-blocked fail-open final states
```

Any difference in content position, mask clipping, transform ownership, reveal order, or final visibility is a regression. Fix only the owning module and rerun its focused tests plus the affected browser round.

- [ ] **Step 4: Write the verification report and update the atomic note**

The repo report must record exact commands, pass counts, browser viewports, screenshots, remaining Webflow/jQuery/Unicorn dependencies, and the fact that production was not deployed.

Before editing Obsidian, inspect the current note and its Git diff. Merge these concepts without overwriting user changes:

```text
模块：一个有明确职责和公开接口的代码单元
入口模块：负责组装模块，不负责实现所有功能
依赖方向：main.js 调用功能模块，功能模块通过明确参数取得运行时
动效所有权：同一视觉属性只有一个主要控制器
Will-web 实例：scroll-controller owns Lenis; horizontal-layout owns track x
边界：分文件不自动等于低耦合，仍依赖全局变量就只是物理拆分
```

Commit only the target Obsidian note; preserve all unrelated vault changes.

- [ ] **Step 5: Commit the verified result**

```powershell
git add index.html src tests/source-modularization.test.mjs docs/audits/2026-08-09-source-modularization-verification.md
git commit -m "docs: verify source modularization"
git status --short --branch
```

Expected: the Will-web worktree is clean on `codex/portfolio-industrialization`; no push, merge, Vercel deployment, or production mutation has occurred.

## Completion checkpoint

Before reporting completion, rerun the verification commands from Task 8 on the final commit, inspect `git show --check`, and confirm that only the intended Obsidian atomic note was committed in its separate vault repository.
