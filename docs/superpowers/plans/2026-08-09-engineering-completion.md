# Will-web Engineering Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Will-web's non-visual engineering foundation with supported local entry, semantic and keyboard-correct HTML, complete SEO/share metadata, safe Vercel headers, stricter browser QA, and a documented production smoke/rollback loop.

**Architecture:** Preserve the accepted Vite/static-site rendering and its existing CSS/motion owners. Add narrow entry, semantics, interaction, metadata, deployment, and operations contracts around the current source; each behavior receives a focused module or script and a failing test before implementation. Retain Webflow, jQuery, Unicorn Studio, existing page imagery, and all branded motion timings.

**Tech Stack:** HTML5, CSS, JavaScript ES Modules, Vite 8, Node.js test runner, Playwright/Edge/Chromium, GitHub Actions, Vercel static hosting.

---

## Implementation boundaries

- Work only on `codex/portfolio-industrialization` in the existing isolated worktree.
- Use commit `6071c24` and the user's 2026-08-09 HTTP manual acceptance as the visual baseline.
- Do not change preloader duration, waterfall line breaks, horizontal animation distances/timelines, Methods & Skills reveal timing, About marquee motion, footer reveal, or reduced-motion final states.
- Do not remove or rewrite Webflow, jQuery, or Unicorn Studio in this plan.
- Do not push, merge, create a Vercel deployment, or mutate production.
- Use `node node_modules\vite\bin\vite.js ...` where a broken global npm launcher would otherwise block local execution.
- Run every browser round through HTTP. Direct-file QA verifies only the explicit unsupported-entry message, not the portfolio runtime.

## File responsibility map

**Create:**

- `scripts/manual-preview.mjs` — build, start, announce, open, and cleanly stop the production-like local preview.
- `scripts/qa-entry-guard.mjs` — real Edge/Chromium proof that `file://` shows only the unsupported-entry message.
- `scripts/capture-og-image.mjs` — deterministic 1200×630 hero share-image capture.
- `scripts/qa-production.mjs` — public root/www redirect, release, scroll, and contact smoke checks.
- `src/interactions/mobile-navigation.js` — sole mobile menu state/keyboard/focus owner.
- `tests/entry-operations.test.mjs` — launcher, README, direct-file boundary, and public-entry contracts.
- `tests/semantics-accessibility.test.mjs` — landmarks, headings, real controls, links, alt text, and contact-source contracts.
- `tests/mobile-navigation.test.mjs` — mobile menu controller behavior without a browser.
- `tests/contact-copy.test.mjs` — WeChat copy, fallback, and toast behavior.
- `tests/seo-deployment.test.mjs` — metadata, JSON-LD, share asset, robots, sitemap, and Vercel headers.
- `tests/production-smoke-contract.test.mjs` — smoke script/workflow and runbook contracts.
- `public/og-will-tech.png` — committed 1200×630 share card captured from the accepted hero.
- `public/robots.txt` — canonical crawler policy.
- `public/sitemap.xml` — canonical homepage sitemap.
- `vercel.json` — safe non-visual production response headers.
- `.github/workflows/production-smoke.yml` — scheduled/manual production entry smoke check.
- `docs/runbooks/preview-and-rollback.md` — preview approval and rollback procedure.
- `docs/audits/2026-08-09-engineering-completion-verification.md` — final evidence and retained debt.

**Modify:**

- `index.html` — early file-protocol guard, semantics, controls, alt text, and metadata.
- `src/main.js` — register the mobile navigation controller in the tested assembly order.
- `src/interactions/anchor-scroll.js` — retain real anchor `href` values while optionally intercepting smooth scroll.
- `src/interactions/contact-copy.js` — copy the documented WeChat ID with Clipboard API and fallback.
- `src/styles/foundations.css` — screen-reader-only utility and global focus-visible treatment.
- `src/styles/navigation.css` — semantic button reset/focus styles without changing geometry.
- `scripts/qa-portfolio.mjs` — strict normal release reason plus semantic/mobile/contact browser assertions.
- `scripts/run-qa-local.mjs` — run the file-entry guard after HTTP preview cleanup.
- `tests/build-foundation.test.mjs` — CI and local-entry scripts.
- `tests/content-refresh.test.mjs` — retarget semantic/contact assertions without weakening content truth.
- `tests/interaction-controllers.test.mjs` — anchors keep their real href under Lenis.
- `tests/source-modularization.test.mjs` — mobile navigation assembly owner.
- `package.json` — `acceptance:local`, `qa:entry`, `qa:production`, and `capture:og` commands.
- `.github/workflows/ci.yml` — retain full build/QA and validate the committed share/operations assets.
- `README.md` — supported commands and commit/push/preview/production model.
- `Start-Website.bat` — delegate to the deterministic local preview script.
- `docs/superpowers/plans/2026-08-09-engineering-completion.md` — checkbox tracking only.

**Project-driven knowledge notes outside the repository:**

- `D:/Obsidian--notes/notion/前端知识/语义化 HTML.md`
- `D:/Obsidian--notes/notion/前端知识/安全响应头.md`
- `D:/Obsidian--notes/notion/前端知识/Smoke Test.md`
- `D:/Obsidian--notes/notion/前端知识/前端知识.md`

Do not overwrite unrelated Obsidian changes. The vault currently has no Git repository, so verify exact target hashes rather than claiming a separate note commit.

---

### Task 1: Make the supported local entry explicit and reproducible

**Files:**

- Create: `tests/entry-operations.test.mjs`
- Create: `scripts/manual-preview.mjs`
- Modify: `index.html`
- Modify: `package.json`
- Modify: `Start-Website.bat`
- Create: `README.md`

- [ ] **Step 1: Write the failing local-entry contracts**

Create `tests/entry-operations.test.mjs` with these complete contracts:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(path, "utf8").catch(() => "");

test("file protocol fails explicitly before portfolio resources", async () => {
  const html = await read("index.html");
  const guardIndex = html.indexOf("guardUnsupportedFileProtocol");
  const firstResourceIndex = Math.min(
    ...[html.indexOf('<link href="./will-tech.core.v1.css"'), html.indexOf("<script src=")]
      .filter((index) => index >= 0),
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
  assert.equal(packageJson.scripts["acceptance:local"], "node scripts/manual-preview.mjs");
  assert.match(script, /viteEntry/);
  assert.match(script, /["']build["']/);
  assert.match(script, /["']preview["']/);
  assert.match(script, /--strictPort/);
  assert.match(script, /http:\/\/127\.0\.0\.1:4173\//);
  assert.match(script, /MANUAL_PREVIEW_OPEN/);
  assert.match(readme, /commit.*push.*Preview.*production/is);
  assert.match(readme, /Ctrl\+C/);
});
```

- [ ] **Step 2: Run the entry contracts and observe RED**

Run:

```powershell
node --test tests/entry-operations.test.mjs
```

Expected: both tests fail because the early guard, manual preview script, package command, and README do not exist and `Start-Website.bat` still uses `npx -y serve`.

- [ ] **Step 3: Add the dependency-free file-protocol guard**

Place this inline script immediately after charset/viewport metadata and before every stylesheet or external script in `index.html`:

```html
<script>
(function guardUnsupportedFileProtocol() {
  if (window.location.protocol !== "file:") return;

  document.open();
  document.write(`<!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Will-web requires an HTTP preview</title>
        <style>
          :root { color-scheme: light; font-family: Arial, sans-serif; }
          body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f5f5f2; color: #111; }
          main { width: min(34rem, calc(100% - 3rem)); }
          h1 { margin: 0 0 1rem; font-size: clamp(1.75rem, 5vw, 3rem); }
          p { line-height: 1.65; }
          code { padding: .15em .4em; border-radius: .3em; background: #fff; }
        </style>
      </head>
      <body>
        <main>
          <h1>请通过 HTTP 预览 Will-web</h1>
          <p>这个源码文件不能直接双击运行。请双击 <code>Start-Website.bat</code>，或运行 <code>node scripts\\manual-preview.mjs</code>。</p>
          <p>正确地址会显示为 <code>http://127.0.0.1:4173/</code>。</p>
        </main>
      </body>
    </html>`);
  document.close();
  window.stop();
})();
</script>
```

Do not reuse application CSS or import another script in this guard.

- [ ] **Step 4: Implement the manual preview script**

Create `scripts/manual-preview.mjs` with exported argument helpers and one executable `main()`:

```js
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createPreviewLifecycle } from "./preview-lifecycle.mjs";

export const manualPreviewUrl = "http://127.0.0.1:4173/";
export const viteEntry = path.resolve("node_modules", "vite", "bin", "vite.js");
export const buildArguments = [viteEntry, "build"];
export const previewArguments = [
  viteEntry,
  "preview",
  "--host",
  "127.0.0.1",
  "--port",
  "4173",
  "--strictPort",
];

function openBrowser(url) {
  if (process.env.MANUAL_PREVIEW_OPEN === "0") return;
  if (process.platform !== "win32") return;
  const opener = spawn("cmd.exe", ["/c", "start", "", url], {
    detached: true,
    windowsHide: true,
    stdio: "ignore",
  });
  opener.unref();
}

export async function main() {
  const build = spawnSync(process.execPath, buildArguments, { stdio: "inherit" });
  if (build.status !== 0) process.exitCode = build.status ?? 1;
  if (process.exitCode) return;

  const preview = spawn(process.execPath, previewArguments, {
    stdio: ["ignore", "pipe", "inherit"],
  });
  const lifecycle = createPreviewLifecycle(preview, { baseUrl: manualPreviewUrl });
  await lifecycle.waitForReady();
  console.log(`Manual acceptance: ${manualPreviewUrl}`);
  console.log("Press Ctrl+C to stop the preview.");
  openBrowser(manualPreviewUrl);

  await Promise.race([
    new Promise((resolve) => {
      process.once("SIGINT", resolve);
      process.once("SIGTERM", resolve);
    }),
    new Promise((_, reject) => {
      preview.once("close", (code, signal) => {
        reject(
          new Error(
            `Vite preview closed unexpectedly (code ${code ?? "none"}, signal ${signal ?? "none"})`,
          ),
        );
      });
    }),
  ]);
  await lifecycle.stop();
}

const isEntry =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isEntry) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
```

- [ ] **Step 5: Replace the Windows launcher and document the runtime model**

Replace `Start-Website.bat` with:

```bat
@echo off
setlocal
cd /d "%~dp0"
node scripts\manual-preview.mjs
if errorlevel 1 (
  echo.
  echo Will-web preview failed. Review the error above.
  pause
)
```

Add to `package.json`:

```json
"acceptance:local": "node scripts/manual-preview.mjs"
```

Create `README.md` with exact sections:

```markdown
# Will-web

Static Vite portfolio for WILL.

## Supported local entry

Run `node scripts/manual-preview.mjs` or double-click `Start-Website.bat`, then open `http://127.0.0.1:4173/`. Press `Ctrl+C` in the launcher terminal to stop it. Do not double-click `index.html`.

## Engineering commands

- Tests: `node --test tests/*.test.mjs`
- Build: `node node_modules/vite/bin/vite.js build`
- Full local QA: `node scripts/run-qa-local.mjs`

## Delivery model

`commit` saves local history. `push` sends a branch to GitHub. Vercel Preview publishes a review candidate. Production changes only after an explicitly authorized production deployment or merge-connected deployment.

## Safe release order

Local tests/build/QA → push isolated branch → inspect Vercel Preview → human approval → merge/deploy decision. See `docs/runbooks/preview-and-rollback.md` before release.
```

- [ ] **Step 6: Run GREEN checks and a bounded launcher smoke test**

Run:

```powershell
node --test tests/entry-operations.test.mjs
$env:MANUAL_PREVIEW_OPEN='0'
node scripts/manual-preview.mjs
```

Expected: Node tests pass; launcher builds, prints `Manual acceptance: http://127.0.0.1:4173/`, and remains active until Ctrl+C. After Ctrl+C, `netstat -ano | Select-String ':4173\s+.*LISTENING'` returns no listener.

- [ ] **Step 7: Commit the entry and operations contract**

```powershell
git add index.html package.json Start-Website.bat README.md scripts/manual-preview.mjs tests/entry-operations.test.mjs
git diff --cached --check
git commit -m "build: standardize manual acceptance entry"
```

---

### Task 2: Establish semantic landmarks and eliminate fake navigation targets

**Files:**

- Create: `tests/semantics-accessibility.test.mjs`
- Modify: `index.html`
- Modify: `src/interactions/anchor-scroll.js`
- Modify: `tests/interaction-controllers.test.mjs`
- Modify: `src/styles/foundations.css`

- [ ] **Step 1: Write failing semantics and anchor contracts**

Create `tests/semantics-accessibility.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile("index.html", "utf8");
const foundations = await readFile("src/styles/foundations.css", "utf8");

test("the document exposes one semantic landmark hierarchy", () => {
  for (const [name, pattern] of [
    ["main", /<main\b/g],
    ["nav", /<nav\b/g],
    ["footer", /<footer\b/g],
    ["h1", /<h1\b/g],
  ]) {
    assert.equal((html.match(pattern) ?? []).length, 1, `${name} count`);
  }
  assert.match(html, /<nav[^>]+aria-label="Primary"/);
  assert.match(html, /<h1[^>]+class="sr-only"/);
  assert.match(foundations, /\.sr-only\s*\{/);
});

test("navigation targets and content containers match their real purpose", () => {
  assert.doesNotMatch(html, /href=["']#["']/);
  assert.doesNotMatch(html, /href=["']javascript:/);
  assert.match(html, /class="nav--logo[^>]+href="\/"|href="\/"[^>]+class="nav--logo/);
  assert.match(html, /href="#identity"[^>]+class="button-big/);
  assert.equal((html.match(/<article\b[^>]*class="use-case__block/g) ?? []).length, 3);
  assert.doesNotMatch(html, /<a[^>]+class="use-case__block/);
  assert.doesNotMatch(html, /<a[^>]+class="link-block[^>]*>\s*<div class="div-hide">\s*<div[^>]*>Linkedin/i);
});

test("decorative and content images expose deliberate alt text", () => {
  assert.equal((html.match(/<img[^>]+src="marquee_logo\.png"[^>]+alt=""/g) ?? []).length, 4);
  assert.match(html, /alt="深圳大学校园标志"/);
  assert.match(html, /alt="微众银行金融科技学院学习环境"/);
  assert.match(html, /alt="联系 Will 的微信二维码"/);
});
```

In `tests/interaction-controllers.test.mjs`, replace the smooth-anchor expectation with:

```js
test("smooth anchors retain their native href while opting into controlled scroll", () => {
  const harness = createHarness(true);
  registerAnchorScroll({
    scrollController: harness.scrollController,
    document: harness.document,
    window: {},
  });
  harness.start();

  assert.equal(harness.attributes.get("href"), "#tech");
  assert.equal(harness.attributes.get("data-target"), "#tech");
  assert.equal(harness.clickListeners.length, 1);
});
```

- [ ] **Step 2: Run focused tests and observe RED**

```powershell
node --test tests/semantics-accessibility.test.mjs tests/interaction-controllers.test.mjs
```

Expected: semantic tests fail on missing landmarks/real controls; the smooth-anchor test fails because `anchor-scroll.js` rewrites `href` to `javascript:void(0);`.

- [ ] **Step 3: Retain real href values in the anchor controller**

In `src/interactions/anchor-scroll.js`, keep the source `href`, set `data-target`, and intercept click only when smooth scrolling is active:

```js
const target = link.getAttribute("href");
if (!target?.startsWith("#") || target === "#") return;
link.setAttribute("data-target", target);
link.addEventListener("click", (event) => {
  event.preventDefault();
  scrollController.scrollTo(target);
  window.history?.replaceState?.(null, "", target);
});
```

Do not write a `javascript:` URL.

- [ ] **Step 4: Convert structural elements without changing class hooks**

Apply these exact semantic mappings in `index.html`:

```html
<nav data-wf--nav--variant="base" class="navigation pre-hidden" aria-label="Primary">
  <a href="/" aria-current="page" class="nav--logo w-inline-block w--current">
```

```html
<main class="section-home" id="main-content">
  <h1 class="sr-only">WILL. — FinTech Student and Quant Developer</h1>
```

Close the current `.section-home` root with `</main>`. Convert the existing contact wrapper to:

```html
<footer id="contact" class="footer div-block-8">
```

and close it with `</footer>`.

Convert the current hero `javascript:void(0)` control to:

```html
<a data-follow="btn" href="#identity" aria-label="Continue to academic background" class="button-big w-inline-block" style="cursor: default;">
```

Convert each About card's `<a href="#" class="use-case__block w-inline-block">...</a>` to `<article class="use-case__block w-inline-block">...</article>` without changing its children.

Convert LinkedIn and copyright placeholder anchors to `<span class="link-block ...">...</span>`. Keep the visible text and inner wrappers unchanged.

- [ ] **Step 5: Add accessible region labels and image semantics**

Add screen-reader-only section headings:

```html
<h2 id="identity-title" class="sr-only">Academic background and current focus</h2>
<h2 id="experience-title" class="sr-only">Experience</h2>
<h2 id="skills-title" class="sr-only">Methods and skills</h2>
<h2 id="about-title" class="sr-only">About Will</h2>
```

Associate the existing major wrappers with `aria-labelledby` and use `section` elements only where the current wrapper is already block-level.

Update alts exactly:

```html
alt=""
alt="深圳大学校园标志"
alt="微众银行金融科技学院学习环境"
alt="联系 Will 的微信二维码"
```

Add to `src/styles/foundations.css`:

```css
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
```

- [ ] **Step 6: Verify semantics and unchanged source boundaries**

```powershell
node --test tests/semantics-accessibility.test.mjs tests/interaction-controllers.test.mjs tests/source-modularization.test.mjs tests/content-refresh.test.mjs
node node_modules\vite\bin\vite.js build
```

Expected: focused tests pass; Vite build exits 0. Do not accept new inline style or script blocks beyond the already documented early guard/reliability exceptions.

- [ ] **Step 7: Commit semantic structure**

```powershell
git add index.html src/interactions/anchor-scroll.js src/styles/foundations.css tests/semantics-accessibility.test.mjs tests/interaction-controllers.test.mjs
git diff --cached --check
git commit -m "refactor: establish semantic document structure"
```

---

### Task 3: Give mobile navigation one keyboard-correct owner

**Files:**

- Create: `src/interactions/mobile-navigation.js`
- Create: `tests/mobile-navigation.test.mjs`
- Modify: `index.html`
- Modify: `src/main.js`
- Modify: `src/styles/navigation.css`
- Modify: `tests/source-modularization.test.mjs`

- [ ] **Step 1: Write the controller behavior test first**

Create `tests/mobile-navigation.test.mjs` with a fake-DOM harness that records listeners, classes, attributes, and focus:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { registerMobileNavigation } from "../src/interactions/mobile-navigation.js";

function tokenList() {
  const values = new Set();
  return {
    add: (...tokens) => tokens.forEach((token) => values.add(token)),
    remove: (...tokens) => tokens.forEach((token) => values.delete(token)),
    toggle(token, force) {
      if (force === true) values.add(token);
      else if (force === false) values.delete(token);
      else if (values.has(token)) values.delete(token);
      else values.add(token);
    },
    contains: (token) => values.has(token),
  };
}

function createHarness() {
  const documentListeners = new Map();
  const triggerListeners = new Map();
  const linkListeners = new Map();
  const attributes = new Map([["aria-expanded", "false"]]);
  let focused = false;
  const root = { classList: tokenList() };
  const panel = { classList: tokenList(), id: "mobile-navigation" };
  const trigger = {
    classList: tokenList(),
    setAttribute: (name, value) => attributes.set(name, String(value)),
    addEventListener: (type, listener) => triggerListeners.set(type, listener),
    focus: () => { focused = true; },
  };
  const link = {
    addEventListener: (type, listener) => linkListeners.set(type, listener),
  };
  const document = {
    addEventListener: (type, listener) => documentListeners.set(type, listener),
    querySelector(selector) {
      return { ".navigation": root, "[data-mobile-nav-trigger]": trigger, "#mobile-navigation": panel }[selector] ?? null;
    },
    querySelectorAll: () => [link],
  };
  return {
    attributes, document, documentListeners, focused: () => focused,
    linkListeners, panel, root, triggerListeners,
  };
}

test("mobile menu owns open, escape, link close, aria state, and focus return", () => {
  const h = createHarness();
  registerMobileNavigation({ document: h.document, window: {} });
  h.documentListeners.get("DOMContentLoaded")();

  h.triggerListeners.get("click")();
  assert.equal(h.attributes.get("aria-expanded"), "true");
  assert.equal(h.panel.classList.contains("is-open"), true);
  assert.equal(h.root.classList.contains("menu-open"), true);

  h.documentListeners.get("keydown")({ key: "Escape" });
  assert.equal(h.attributes.get("aria-expanded"), "false");
  assert.equal(h.focused(), true);

  h.triggerListeners.get("click")();
  h.linkListeners.get("click")();
  assert.equal(h.panel.classList.contains("is-open"), false);
});
```

- [ ] **Step 2: Observe RED**

```powershell
node --test tests/mobile-navigation.test.mjs
```

Expected: `ERR_MODULE_NOT_FOUND` for `src/interactions/mobile-navigation.js`.

- [ ] **Step 3: Implement the focused controller**

Create `src/interactions/mobile-navigation.js`:

```js
export function registerMobileNavigation({
  document = globalThis.document,
  window = globalThis.window,
}) {
  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector(".navigation");
    const trigger = document.querySelector("[data-mobile-nav-trigger]");
    const panel = document.querySelector("#mobile-navigation");
    if (!root || !trigger || !panel) return;

    const links = document.querySelectorAll("#mobile-navigation a[href^='#']");
    let open = false;

    function setOpen(nextOpen, { restoreFocus = false } = {}) {
      open = nextOpen;
      root.classList.toggle("menu-open", open);
      panel.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      if (!open && restoreFocus) trigger.focus();
    }

    trigger.addEventListener("click", () => setOpen(!open));
    links.forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && open) setOpen(false, { restoreFocus: true });
    });

    window.addEventListener?.("resize", () => {
      if (window.innerWidth >= 992 && open) setOpen(false);
    });
  });
}
```

- [ ] **Step 4: Make the trigger and panel semantic**

Replace the outer nested trigger in `index.html` with:

```html
<button type="button" class="nav-burger" data-mobile-nav-trigger aria-label="Open navigation" aria-controls="mobile-navigation" aria-expanded="false">
  <span class="burger-icon w-embed" aria-hidden="true">
    <!-- keep the existing SVG and SMIL animation nodes unchanged -->
  </span>
</button>
```

Remove the duplicate inner `.nav-burger` wrapper. Add `id="mobile-navigation"` to `.nav-mobile-panel`.

In `src/styles/navigation.css`, preserve geometry and add:

```css
button.nav-burger {
  appearance: none;
  font: inherit;
}

.nav-burger:focus-visible,
.nav-mobile__link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 5px;
}
```

- [ ] **Step 5: Register ownership in the tested assembly order**

In `src/main.js` import and register immediately after `registerNavigationEffects(appContext)`:

```js
import { registerMobileNavigation } from "./interactions/mobile-navigation.js";
```

```js
registerNavigationEffects(appContext);
registerMobileNavigation(appContext);
```

Extend `tests/source-modularization.test.mjs` to assert the import/call and place `registerMobileNavigation(appContext)` between navigation effects and one-shot/preloader assembly.

- [ ] **Step 6: Run GREEN and build**

```powershell
node --test tests/mobile-navigation.test.mjs tests/source-modularization.test.mjs
node node_modules\vite\bin\vite.js build
```

Expected: tests pass and build exits 0.

- [ ] **Step 7: Commit mobile navigation ownership**

```powershell
git add index.html src/main.js src/interactions/mobile-navigation.js src/styles/navigation.css tests/mobile-navigation.test.mjs tests/source-modularization.test.mjs
git diff --cached --check
git commit -m "feat: make mobile navigation keyboard accessible"
```

---

### Task 4: Normalize contact controls and copy behavior

**Files:**

- Create: `tests/contact-copy.test.mjs`
- Modify: `src/interactions/contact-copy.js`
- Modify: `index.html`
- Modify: `src/styles/foundations.css`
- Modify: `tests/semantics-accessibility.test.mjs`

- [ ] **Step 1: Write the copy behavior tests**

Create `tests/contact-copy.test.mjs` using injected clipboard and document harnesses:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { copyText, registerContactCopy } from "../src/interactions/contact-copy.js";

test("copyText prefers the Clipboard API", async () => {
  const writes = [];
  const result = await copyText("jc3400098970", {
    clipboard: { writeText: async (value) => writes.push(value) },
    document: {},
  });
  assert.equal(result, true);
  assert.deepEqual(writes, ["jc3400098970"]);
});

test("contact controls always copy the documented WeChat id", async () => {
  const documentListeners = new Map();
  const clickListeners = [];
  const appended = [];
  const button = { addEventListener: (type, listener) => type === "click" && clickListeners.push(listener) };
  const toastContainer = { appendChild: (node) => appended.push(node) };
  const document = {
    addEventListener: (type, listener) => documentListeners.set(type, listener),
    querySelectorAll: () => [button],
    getElementById: (id) => id === "toast-container" ? toastContainer : null,
    createElement: () => ({ classList: { add() {}, remove() {} }, remove() {}, style: {} }),
  };
  const writes = [];
  registerContactCopy({
    document,
    window: { setTimeout() {} },
    navigator: { clipboard: { writeText: async (value) => writes.push(value) } },
  });
  documentListeners.get("DOMContentLoaded")();
  await clickListeners[0]({ preventDefault() {} });
  assert.deepEqual(writes, ["jc3400098970"]);
  assert.equal(appended.length, 1);
});
```

- [ ] **Step 2: Run RED**

```powershell
node --test tests/contact-copy.test.mjs
```

Expected: import fails for missing `copyText` export and current controller queries only one ID/copies `hi@will.xyz`.

- [ ] **Step 3: Implement Clipboard API plus dependency-free fallback**

Refactor `src/interactions/contact-copy.js` around these interfaces:

```js
export async function copyText(value, {
  clipboard = globalThis.navigator?.clipboard,
  document = globalThis.document,
} = {}) {
  try {
    if (clipboard?.writeText) {
      await clipboard.writeText(value);
      return true;
    }
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    textArea.remove();
    return copied;
  } catch {
    return false;
  }
}
```

`registerContactCopy` must query `[data-copy-wechat]`, attach async click handlers, copy exactly `jc3400098970`, and announce `微信号 jc3400098970 已复制` or `复制失败，请手动添加 jc3400098970`. Use `textContent` for toast copy rather than injecting user-controlled HTML.

- [ ] **Step 4: Make contact controls real buttons and the toast a live region**

Convert the primary QR/contact control and footer `.ml-link` to:

```html
<button type="button" id="wechat-copy-btn" data-copy-wechat class="button-small is-footer-variant w-inline-block">
```

```html
<button type="button" data-copy-wechat class="link-block ml-link">
```

Add:

```html
<div id="toast-container" role="status" aria-live="polite" aria-atomic="true" ...></div>
```

Ensure every mail link is `mailto:hi@will-tech.xyz`. Remove every `hi@will.xyz` source occurrence.

Reset visual button defaults without changing size:

```css
button.link-block,
button.button-small {
  appearance: none;
  border: 0;
  padding: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: inherit;
}

button.link-block:focus-visible,
button.button-small:focus-visible,
a.link-block:focus-visible,
a.button-small:focus-visible,
a.button-big:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 5px;
}
```

- [ ] **Step 5: Extend static contact contracts and run GREEN**

Add to `tests/semantics-accessibility.test.mjs`:

```js
test("contact sources are truthful and keyboard operable", () => {
  assert.doesNotMatch(html, /hi@will\.xyz/);
  assert.ok((html.match(/mailto:hi@will-tech\.xyz/g) ?? []).length >= 2);
  assert.equal((html.match(/<button[^>]+data-copy-wechat/g) ?? []).length, 2);
  assert.match(html, /id="toast-container"[^>]+role="status"[^>]+aria-live="polite"/);
});
```

Run:

```powershell
node --test tests/contact-copy.test.mjs tests/semantics-accessibility.test.mjs
node node_modules\vite\bin\vite.js build
```

Expected: tests and build pass.

- [ ] **Step 6: Commit contact correctness**

```powershell
git add index.html src/interactions/contact-copy.js src/styles/foundations.css tests/contact-copy.test.mjs tests/semantics-accessibility.test.mjs
git diff --cached --check
git commit -m "fix: normalize accessible contact controls"
```

---

### Task 5: Complete canonical search and share assets

**Files:**

- Create: `tests/seo-deployment.test.mjs`
- Create: `scripts/capture-og-image.mjs`
- Create: `public/og-will-tech.png`
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`
- Modify: `index.html`
- Modify: `package.json`

- [ ] **Step 1: Write failing SEO/share contracts**

Create `tests/seo-deployment.test.mjs` initially with metadata/public-asset checks:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile("index.html", "utf8");

test("canonical and social metadata use the public www origin", () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.will-tech\.xyz\/">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/www\.will-tech\.xyz\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/www\.will-tech\.xyz\/og-will-tech\.png">/);
  assert.match(html, /<meta name="twitter:title"/);
  assert.match(html, /<meta name="twitter:description"/);
  assert.match(html, /<meta name="twitter:image" content="https:\/\/www\.will-tech\.xyz\/og-will-tech\.png">/);
});

test("Person JSON-LD is parseable and conservative", () => {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match);
  const data = JSON.parse(match[1]);
  assert.equal(data["@context"], "https://schema.org");
  assert.equal(data["@type"], "Person");
  assert.equal(data.url, "https://www.will-tech.xyz/");
  assert.match(data.affiliation.name, /深圳大学/);
  assert.equal(data.sameAs, undefined);
});

test("share image and crawler files are deployable", async () => {
  const [png, robots, sitemap] = await Promise.all([
    readFile("public/og-will-tech.png"),
    readFile("public/robots.txt", "utf8"),
    readFile("public/sitemap.xml", "utf8"),
  ]);
  assert.equal(png.toString("ascii", 1, 4), "PNG");
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  assert.match(robots, /Sitemap: https:\/\/www\.will-tech\.xyz\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/www\.will-tech\.xyz\/<\/loc>/);
});
```

- [ ] **Step 2: Run RED**

```powershell
node --test tests/seo-deployment.test.mjs
```

Expected: all tests fail because required head tags/public assets do not exist.

- [ ] **Step 3: Add canonical and truthful structured metadata**

Add to the document head:

```html
<link rel="canonical" href="https://www.will-tech.xyz/">
<meta property="og:url" content="https://www.will-tech.xyz/">
<meta property="og:image" content="https://www.will-tech.xyz/og-will-tech.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="zh_CN">
<meta name="twitter:title" content="WILL. | FinTech Student &amp; Quant Developer">
<meta name="twitter:description" content="WILL. — 深圳大学金融科技学生，专注量化开发与金融科技后端，以独立开发、数学建模、县域调研与英语表达探索真实问题。">
<meta name="twitter:image" content="https://www.will-tech.xyz/og-will-tech.png">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "唐嘉辰",
  "alternateName": ["William Leo Tang", "Will"],
  "url": "https://www.will-tech.xyz/",
  "description": "深圳大学金融科技学生，持续学习量化开发与金融科技后端。",
  "affiliation": {
    "@type": "CollegeOrUniversity",
    "name": "深圳大学微众银行金融科技学院"
  },
  "knowsAbout": ["Python", "C++", "Quantitative Development", "FinTech Backend", "Mathematical Modeling"]
}
</script>
```

Do not add `sameAs`, employer, job, award, or project fields without a verified public target.

- [ ] **Step 4: Add crawler assets and capture script**

Create `public/robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://www.will-tech.xyz/sitemap.xml
```

Create `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.will-tech.xyz/</loc>
  </url>
</urlset>
```

Create `scripts/capture-og-image.mjs` to spawn strict Vite preview through `createPreviewLifecycle`, launch Playwright at 1200×630, block non-local requests, wait for `preloader-released`, and capture exactly the viewport to `public/og-will-tech.png`:

```js
await page.setViewportSize({ width: 1200, height: 630 });
await page.route("**/*", async (route) => {
  const url = new URL(route.request().url());
  if (url.origin === baseUrl.origin) await route.continue();
  else await route.abort("blockedbyclient");
});
await page.goto(baseUrl.href, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.documentElement.classList.contains("preloader-released"));
await page.screenshot({ path: outputPath, fullPage: false });
```

Use the same bounded preview lifecycle/cleanup pattern as `scripts/run-qa-local.mjs`; do not leave port 4173 active.

Add to `package.json`:

```json
"capture:og": "node scripts/capture-og-image.mjs"
```

- [ ] **Step 5: Generate and verify the committed share image**

```powershell
node scripts/capture-og-image.mjs
node --test tests/seo-deployment.test.mjs
node node_modules\vite\bin\vite.js build
```

Expected: PNG is 1200×630; tests pass; `dist/og-will-tech.png`, `dist/robots.txt`, and `dist/sitemap.xml` exist after build.

Use `view_image` to inspect `public/og-will-tech.png`. Reject blank, preloader-covered, clipped, or non-brand output.

- [ ] **Step 6: Commit search and share metadata**

```powershell
git add index.html package.json scripts/capture-og-image.mjs public/og-will-tech.png public/robots.txt public/sitemap.xml tests/seo-deployment.test.mjs
git diff --cached --check
git commit -m "feat: complete search and sharing metadata"
```

---

### Task 6: Add safe Vercel headers without a misleading CSP

**Files:**

- Create: `vercel.json`
- Modify: `tests/seo-deployment.test.mjs`

- [ ] **Step 1: Extend the test before configuration exists**

Add:

```js
test("Vercel enforces the approved non-visual security headers", async () => {
  const config = JSON.parse(await readFile("vercel.json", "utf8"));
  const headers = new Map(config.headers[0].headers.map(({ key, value }) => [key, value]));
  assert.equal(config.headers[0].source, "/(.*)");
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.equal(headers.get("Permissions-Policy"), "camera=(), microphone=(), geolocation=()");
  assert.equal(headers.has("Content-Security-Policy"), false);
});
```

- [ ] **Step 2: Observe RED**

```powershell
node --test tests/seo-deployment.test.mjs
```

Expected: fail with `ENOENT: vercel.json`.

- [ ] **Step 3: Add the exact deploy configuration**

Create `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

- [ ] **Step 4: Run GREEN and validate JSON/build**

```powershell
node --test tests/seo-deployment.test.mjs
Get-Content -LiteralPath vercel.json -Raw | ConvertFrom-Json | Out-Null
node node_modules\vite\bin\vite.js build
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit deployment headers**

```powershell
git add vercel.json tests/seo-deployment.test.mjs
git diff --cached --check
git commit -m "build: add safe Vercel response headers"
```

---

### Task 7: Tighten browser QA around real entry, semantics, and release reasons

**Files:**

- Create: `scripts/qa-entry-guard.mjs`
- Modify: `scripts/qa-portfolio.mjs`
- Modify: `scripts/run-qa-local.mjs`
- Modify: `package.json`
- Modify: `tests/build-foundation.test.mjs`
- Modify: `tests/dependency-localization.test.mjs`

- [ ] **Step 1: Write failing QA orchestration contracts**

Extend `tests/build-foundation.test.mjs`:

```js
test("QA distinguishes supported HTTP from the explicit file guard", async () => {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  const runner = await readFile("scripts/run-qa-local.mjs", "utf8");
  const entryQa = await readFile("scripts/qa-entry-guard.mjs", "utf8").catch(() => "");

  assert.equal(packageJson.scripts["qa:entry"], "node scripts/qa-entry-guard.mjs");
  assert.match(runner, /qa-entry-guard\.mjs/);
  assert.match(entryQa, /pathToFileURL/);
  assert.match(entryQa, /Will-web requires an HTTP preview/);
  assert.match(entryQa, /failedRequests\.length, 0/);
});
```

Extend the static QA contract to require normal release inspection:

```js
assert.match(qaScript, /releaseReason\s*===\s*["']animation-complete["']/);
assert.match(qaScript, /watchdog-timeout/);
assert.match(qaScript, /data-mobile-nav-trigger/);
assert.match(qaScript, /aria-expanded/);
```

- [ ] **Step 2: Run RED**

```powershell
node --test tests/build-foundation.test.mjs tests/dependency-localization.test.mjs
```

Expected: fail because `qa:entry`, guard QA, strict normal-release check, and semantic browser assertions do not exist.

- [ ] **Step 3: Implement real browser QA for the unsupported entry**

Create `scripts/qa-entry-guard.mjs`:

```js
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.BROWSER_EXECUTABLE || undefined,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const failedRequests = [];
page.on("requestfailed", (request) => failedRequests.push(request.url()));

try {
  const fileUrl = pathToFileURL(path.resolve("index.html")).href;
  await page.goto(fileUrl, { waitUntil: "load" });
  await assert.doesNotReject(() =>
    page.getByRole("heading", { name: "请通过 HTTP 预览 Will-web" }).waitFor(),
  );
  assert.match(await page.title(), /Will-web requires an HTTP preview/);
  assert.equal(failedRequests.length, 0);
  console.log("Direct-file guard QA passed.");
} finally {
  await page.close();
  await browser.close();
}
```

Add `"qa:entry": "node scripts/qa-entry-guard.mjs"` to `package.json`.

- [ ] **Step 4: Make normal preloader release strict**

In the normal-runtime branch of `scripts/qa-portfolio.mjs`, after the preloader disappears, read:

```js
const normalReleaseState = await page.evaluate(() => ({
  released: document.documentElement.classList.contains("preloader-released"),
  releaseReason: document.documentElement.dataset.preloaderReleaseReason ?? "",
  navHidden: document.querySelector(".navigation")?.classList.contains("pre-hidden") ?? false,
}));
check(
  normalReleaseState.released &&
    normalReleaseState.releaseReason === "animation-complete" &&
    !normalReleaseState.navHidden,
  `${viewport.width}px: normal preloader state is ${JSON.stringify(normalReleaseState)}`,
);
check(
  normalReleaseState.releaseReason !== "watchdog-timeout",
  `${viewport.width}px: watchdog must not satisfy normal runtime QA`,
);
```

Remove the current behavior that merely notes/removes a stuck normal overlay and continues layout QA. A stuck or watchdog normal path must fail the round.

- [ ] **Step 5: Add mobile and contact browser assertions**

For 390/360 viewports after release and before long-scroll capture:

```js
const trigger = page.locator("[data-mobile-nav-trigger]");
await trigger.focus();
await page.keyboard.press("Space");
await check(await trigger.getAttribute("aria-expanded") === "true", `${viewport.width}px: mobile menu did not open`);
await page.keyboard.press("Escape");
await check(await trigger.getAttribute("aria-expanded") === "false", `${viewport.width}px: mobile menu did not close`);
await check(await trigger.evaluate((node) => node === document.activeElement), `${viewport.width}px: focus did not return`);
```

At the footer, assert both `[data-copy-wechat]` controls are buttons, email targets equal `mailto:hi@will-tech.xyz`, and no interactive `href="#"` exists. Do not change scroll capture positions or horizontal animation assertions.

- [ ] **Step 6: Run the guard after HTTP lifecycle cleanup**

In `scripts/run-qa-local.mjs`, resolve `scripts/qa-entry-guard.mjs` and call it only after `runWithPreviewLifecycle(...)` has completed and port 4173 is released:

```js
await runQa(entryGuardQaScript, {
  BROWSER_EXECUTABLE: process.env.BROWSER_EXECUTABLE,
});
```

Keep the normal six-view and fallback two-view rounds unchanged.

- [ ] **Step 7: Run focused and full QA GREEN**

```powershell
node --test tests/build-foundation.test.mjs tests/dependency-localization.test.mjs
$env:BROWSER_EXECUTABLE='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$env:QA_OUTPUT_DIR='.artifacts\qa-engineering-task7'
node scripts/run-qa-local.mjs
```

Expected:

```text
normal 1920/1440/1024/768/390/360 pass with animation-complete
fallback 1440/390 pass with animation-runtime-unavailable
Direct-file guard QA passed
port 4173 has no LISTENING process
```

- [ ] **Step 8: Commit strict QA boundaries**

```powershell
git add package.json scripts/qa-entry-guard.mjs scripts/qa-portfolio.mjs scripts/run-qa-local.mjs tests/build-foundation.test.mjs tests/dependency-localization.test.mjs
git diff --cached --check
git commit -m "test: enforce entry and semantic browser contracts"
```

---

### Task 8: Add production smoke monitoring and the Preview/rollback runbook

**Files:**

- Create: `tests/production-smoke-contract.test.mjs`
- Create: `scripts/qa-production.mjs`
- Create: `.github/workflows/production-smoke.yml`
- Create: `docs/runbooks/preview-and-rollback.md`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`
- Modify: `README.md`

- [ ] **Step 1: Write failing operations contracts**

Create `tests/production-smoke-contract.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [script, workflow, runbook, ci, packageJsonText] = await Promise.all([
  readFile("scripts/qa-production.mjs", "utf8").catch(() => ""),
  readFile(".github/workflows/production-smoke.yml", "utf8").catch(() => ""),
  readFile("docs/runbooks/preview-and-rollback.md", "utf8").catch(() => ""),
  readFile(".github/workflows/ci.yml", "utf8"),
  readFile("package.json", "utf8"),
]);
const packageJson = JSON.parse(packageJsonText);

test("production smoke checks canonical entry and usable release", () => {
  assert.equal(packageJson.scripts["qa:production"], "node scripts/qa-production.mjs");
  assert.match(script, /https:\/\/will-tech\.xyz\//);
  assert.match(script, /https:\/\/www\.will-tech\.xyz\//);
  assert.match(script, /animation-complete/);
  assert.match(script, /watchdog-timeout/);
  assert.match(script, /scrollY/);
});

test("scheduled smoke and rollback documentation are explicit", () => {
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /playwright install --with-deps chromium/);
  assert.match(workflow, /npm run qa:production/);
  assert.match(runbook, /Vercel Preview/);
  assert.match(runbook, /last known-good/);
  assert.match(runbook, /git revert/);
  assert.match(runbook, /without explicit authorization/);
  assert.match(ci, /npm run qa:offline/);
  assert.match(ci, /portfolio-qa/);
});
```

- [ ] **Step 2: Run RED**

```powershell
node --test tests/production-smoke-contract.test.mjs
```

Expected: both tests fail because the script, workflow, runbook, and package command are absent.

- [ ] **Step 3: Implement bounded production smoke behavior**

Create `scripts/qa-production.mjs` using Playwright Chromium. It must:

1. request `https://will-tech.xyz/` with redirects disabled through `fetch` and assert status 308 plus `Location: https://www.will-tech.xyz/`;
2. navigate Edge/Chromium to canonical www;
3. collect `requestfailed`, response status ≥400, page errors, and console errors;
4. wait no longer than 12 seconds for `preloader-released`;
5. assert `releaseReason === "animation-complete"` and not `watchdog-timeout`;
6. assert logo, primary navigation, mailto, and WeChat controls exist;
7. scroll by 1000 px and assert `scrollY` increases;
8. print retained Unicorn/Webflow errors as warnings unless they block steps 4–7;
9. close page/browser in `finally` and aggregate primary plus cleanup errors.

Use this result structure:

```js
const state = await page.evaluate(() => ({
  releaseReason: document.documentElement.dataset.preloaderReleaseReason ?? "",
  preloaderPresent: Boolean(document.getElementById("preloader")),
  logo: Boolean(document.querySelector(".nav--logo[href='/']")),
  email: document.querySelector("a[href='mailto:hi@will-tech.xyz']")?.getAttribute("href") ?? "",
  wechatButtons: document.querySelectorAll("button[data-copy-wechat]").length,
  scrollY: window.scrollY,
}));
```

Allow `PRODUCTION_ROOT_URL`, `PRODUCTION_CANONICAL_URL`, and `BROWSER_EXECUTABLE` environment overrides, while defaulting to the public domains.

- [ ] **Step 4: Add the scheduled/manual workflow**

Create `.github/workflows/production-smoke.yml`:

```yaml
name: Production smoke

on:
  workflow_dispatch:
  schedule:
    - cron: "17 */6 * * *"

permissions:
  contents: read

jobs:
  smoke:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22.12.0
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run qa:production
```

Add `"qa:production": "node scripts/qa-production.mjs"` to `package.json`.

- [ ] **Step 5: Write the Preview and rollback runbook**

Create `docs/runbooks/preview-and-rollback.md` with these executable gates:

```markdown
# Preview and rollback runbook

## Candidate flow

1. Work on an isolated branch/worktree.
2. Run `node --test tests/*.test.mjs`.
3. Run `node node_modules/vite/bin/vite.js build`.
4. Run `node scripts/run-qa-local.mjs` and inspect screenshots.
5. Push the isolated branch only with explicit authorization.
6. Open the Vercel Preview URL and repeat the human visual checklist.
7. Merge or deploy only after explicit approval.

## Rollback

1. Confirm the production symptom with `npm run qa:production` or an equivalent direct Node command.
2. Identify the last known-good deployment and Git commit.
3. Prefer Vercel's last known-good deployment rollback for urgent recovery, or `git revert <bad-commit>` for auditable source rollback.
4. Rerun production smoke and inspect root/www manually.
5. Record the incident cause and prevention test.

No push, merge, deployment promotion, rollback, or production mutation occurs without explicit authorization.
```

Link this runbook from `README.md`.

- [ ] **Step 6: Keep ordinary CI complete**

Do not replace `.github/workflows/ci.yml`. Ensure it still runs `npm ci`, static tests, Vite build, offline browser QA, and always uploads `.artifacts/qa` as `portfolio-qa`. Add a static contract step only if the existing `npm test` no longer covers the new test files automatically; normally no YAML change is required because `tests/*.test.mjs` already includes them.

- [ ] **Step 7: Run GREEN and a live read-only smoke check**

```powershell
node --test tests/production-smoke-contract.test.mjs
$env:BROWSER_EXECUTABLE='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
node scripts/qa-production.mjs
```

Expected: contract tests pass. The live smoke check is read-only; if production still runs the old commit and returns watchdog/old contact semantics, record the expected pre-deployment failure rather than weakening the new contract. Do not modify production to manufacture GREEN.

- [ ] **Step 8: Commit operations closure**

```powershell
git add package.json README.md scripts/qa-production.mjs .github/workflows/production-smoke.yml .github/workflows/ci.yml docs/runbooks/preview-and-rollback.md tests/production-smoke-contract.test.mjs
git diff --cached --check
git commit -m "ops: add production smoke and rollback runbook"
```

---

### Task 9: Final integration, visual regression, report, and knowledge notes

**Files:**

- Create: `docs/audits/2026-08-09-engineering-completion-verification.md`
- Modify: `docs/superpowers/plans/2026-08-09-engineering-completion.md`
- Modify/create outside repo: `D:/Obsidian--notes/notion/前端知识/语义化 HTML.md`
- Modify/create outside repo: `D:/Obsidian--notes/notion/前端知识/安全响应头.md`
- Modify/create outside repo: `D:/Obsidian--notes/notion/前端知识/Smoke Test.md`
- Modify outside repo: `D:/Obsidian--notes/notion/前端知识/前端知识.md`

- [ ] **Step 1: Run all static, syntax, vendor, and build gates**

```powershell
node --test tests\*.test.mjs
Get-ChildItem -LiteralPath src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
node scripts\sync-vendor-assets.mjs
node node_modules\vite\bin\vite.js build
```

Expected: all Node tests pass, every source module syntax check exits 0, 9 approved vendor files synchronize, and Vite build exits 0.

- [ ] **Step 2: Run final Edge normal/fallback/entry QA**

```powershell
$env:BROWSER_EXECUTABLE='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$env:QA_OUTPUT_DIR='.artifacts\qa-engineering-final'
node scripts\run-qa-local.mjs
```

Expected:

- normal: 1920, 1440, 1024, 768, 390, 360 pass with `animation-complete`;
- fallback: 1440, 390 pass with explicit runtime-unavailable reason;
- file entry: explanatory guard passes with zero failed resource requests;
- port 4173 has no LISTENING process after cleanup.

- [ ] **Step 3: Perform the required visual comparison**

Use `view_image` on baseline and final:

```text
.artifacts/qa-baseline/portfolio-1920.png
.artifacts/qa-engineering-final/portfolio-1920.png
.artifacts/qa-baseline/skills-1440.png
.artifacts/qa-engineering-final/skills-1440.png
.artifacts/qa-baseline/portfolio-390.png
.artifacts/qa-engineering-final/portfolio-390.png
.artifacts/qa-baseline/fallback/portfolio-390.png
.artifacts/qa-engineering-final/fallback/portfolio-390.png
```

Also compare all four `evidence-*.png` horizontal checkpoints by SHA-256. Any change in content position, waterfall breaks, mask clipping, horizontal ownership, SVG order, skills timing, marquee, footer, or final visibility is a regression. Dynamic full-page capture position alone is not a failure when dedicated stable evidence frames match.

- [ ] **Step 4: Run keyboard/contact acceptance in real Edge**

At 390 px:

1. Tab to the mobile menu button.
2. Press Space; verify panel opens and `aria-expanded=true`.
3. Press Escape; verify close and focus return.
4. Reopen and select Skills; verify close and correct scroll target.
5. Reach both WeChat buttons; activate each and verify success toast.
6. Verify email opens `mailto:hi@will-tech.xyz`.
7. Verify LinkedIn/copyright/About cards do not jump the page.

Record results in the verification report.

- [ ] **Step 5: Write the final verification report**

Create `docs/audits/2026-08-09-engineering-completion-verification.md` with:

```markdown
# Will-web engineering completion verification

## Outcome
## Supported entry and delivery model
## Semantic/accessibility changes
## SEO/share/deployment changes
## Exact commands and pass counts
## Browser viewport matrix
## Manual keyboard/contact results
## Visual baseline comparison
## Production smoke status before deployment
## Retained Webflow/jQuery/Unicorn/remote-image debt
## Rollback commit chain
## Production status: not pushed/merged/deployed
```

Do not claim the new headers or smoke behavior is live before an authorized deployment.

- [ ] **Step 6: Update project-driven Obsidian atomic notes**

Before editing, read each target and `前端知识.md` with UTF-8 and inspect for user changes. Merge only these reusable concepts:

`语义化 HTML.md`:

```text
一句话：用元素本身表达“这块是什么、能做什么”，而不只依赖 class 和视觉。
Will-web：nav/main/footer/h1；button vs a；article cards；landmark navigation.
边界：语义化不要求改视觉，但默认样式和旧选择器必须回归验证。
```

`安全响应头.md`:

```text
一句话：服务器随 HTTP 响应发送给浏览器的安全规则。
Will-web：nosniff、Referrer-Policy、Permissions-Policy、X-Frame-Options.
边界：弱 CSP 不等于安全；保留外部/内联运行时期间不伪装成严格 CSP。
```

`Smoke Test.md`:

```text
一句话：用少量关键路径快速回答“部署后最核心能力是否还活着”。
Will-web：根域重定向、www 200、预加载释放原因、滚动、导航、联系入口。
边界：烟雾测试不替代完整 E2E/视觉回归。
```

Add all three links to the appropriate index sections. Copy through a patched workspace staging file and verify SHA-256 after the approved external write. The vault has no Git repo; report hash verification, not a Git commit.

- [ ] **Step 7: Mark plan checkboxes and commit the verified result**

After every preceding step is actually complete, mark remaining checkboxes `[x]`, then:

```powershell
git add docs/audits/2026-08-09-engineering-completion-verification.md docs/superpowers/plans/2026-08-09-engineering-completion.md
git diff --cached --check
git commit -m "docs: verify engineering completion"
```

- [ ] **Step 8: Re-run completion gates on the final commit**

```powershell
node --test tests\*.test.mjs
node node_modules\vite\bin\vite.js build
$env:BROWSER_EXECUTABLE='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$env:QA_OUTPUT_DIR='.artifacts\qa-engineering-final-commit'
node scripts\run-qa-local.mjs
git show --check --stat --oneline HEAD
git status --short --branch
```

Expected: all verification exits 0, `git show --check` is clean, worktree is clean on `codex/portfolio-industrialization`, and no push/merge/deploy has occurred.

---

## Execution checkpoint

The implementation is successful only when Tasks 1–9 are checked, the final report contains fresh evidence, the user-accepted visual baseline remains intact, and the production site has not been mutated.
