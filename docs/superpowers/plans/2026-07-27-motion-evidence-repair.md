# Motion, Layout, and Evidence Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the portfolio's missing reveal motion, slow and unify the horizontal SVG construction sequence, repair the two reported layout defects, strengthen the first-year experience copy, publish privacy-safe award evidence, and deliver an evidence-based architecture and professionalism audit.

**Architecture:** Preserve the current single-page `index.html` and its GSAP/ScrollTrigger horizontal narrative. Move deterministic entrance state into scoped CSS classes and let the existing IntersectionObserver add only an in-view class. Keep GSAP responsible for horizontal pinning and navigation, but normalize SVG drawing with `pathLength="1"` so CSS can provide a stable, staggered reveal. Add static redacted evidence images under `evidence/`; no backend, modal, account system, or new runtime dependency is introduced.

**Tech Stack:** Static HTML/CSS/JavaScript, GSAP 3 + ScrollTrigger, Node.js built-in test runner, Playwright for browser QA, Python + Pillow and Poppler for local evidence preparation.

---

## Task 1: Lock the requested content, layout, and motion behavior in regression tests

**Files:**
- Modify: `tests/content-refresh.test.mjs`
- Modify: `tests/horizontal-animation.test.mjs`
- Reference: `index.html`

- [ ] **Step 1: Add a failing content and evidence-link test**

Add assertions to `tests/content-refresh.test.mjs` for the exact claims approved by the user:

```js
assert.match(html, /第十八届“中国电机工程学会杯”全国大学生电工数学建模竞赛/);
assert.match(html, /作为队长/);
assert.match(html, /全国三等奖/);
assert.match(html, /英语口语表达以英式发音为主/);
assert.match(html, /第六届“用英语讲中国故事大会”/);
assert.match(html, /广东省级二等奖/);
assert.match(html, /微众银行金融科技学院/);
assert.match(html, /金融科技专业的学习环境/);
assert.doesNotMatch(html, /就职于微众银行/);
assert.doesNotMatch(html, /任职于微众银行/);
```

Require direct, static evidence links that open safely in a new tab:

```js
assert.match(
  html,
  /href="evidence\/modeling-csee-cup-2026-third-prize-redacted\.png"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/,
);
assert.match(
  html,
  /href="evidence\/cn-story-2026-guangdong-second-prize-redacted\.jpg"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/,
);
```

- [ ] **Step 2: Add a failing explicit-waterfall-line test**

Require the About identity statement to use these three reveal lines:

```html
<span class="reveal-text-line">深圳大学微众银行金融科技学院 · 2025级</span>
<span class="reveal-text-line">完成大学第一年，持续探索金融、计算与现实问题</span>
<span class="reveal-text-line">的交叉地带。</span>
```

The test must assert that `的交叉地带。` is not part of the preceding `reveal-text-line`.

- [ ] **Step 3: Add failing skill-reveal architecture tests**

Require all four skill cards to expose a stable `--reveal-order` and require CSS initial/final states:

```js
assert.equal((html.match(/style="--reveal-order:\s*[0-3]"/g) ?? []).length, 4);
assert.match(html, /\.w-mod-js\s+\.value-icon\s*\{[\s\S]*?opacity:\s*0[\s\S]*?transform:/);
assert.match(html, /\.w-mod-js\s+\.value-item__line\s*\{[\s\S]*?transform:\s*scaleX\(0\)/);
assert.match(html, /\.w-mod-js\s+\.value-item__divider\s*\{[\s\S]*?transform:\s*scaleY\(0\)/);
assert.match(html, /\.value-item\.scroll-reveal-inview\s+\.value-icon/);
assert.match(html, /transition-delay:\s*calc\(var\(--reveal-order,\s*0\)\s*\*\s*80ms\)/);
assert.match(html, /prefers-reduced-motion:\s*reduce/);
```

Require removal of the global style patrol:

```js
assert.doesNotMatch(html, /new MutationObserver/);
assert.doesNotMatch(html, /setInterval\([^)]*500/);
assert.doesNotMatch(html, /startStyleGuard/);
```

- [ ] **Step 4: Add failing horizontal SVG and final-distance tests**

Update the current horizontal timing assertions so they require:

```js
assert.match(html, /const getViewportWidth = \(\) => section\.clientWidth/);
assert.match(
  html,
  /Math\.max\(0,\s*Math\.ceil\(track\.scrollWidth\s*-\s*getViewportWidth\(\)\)\s*\+\s*2\)/,
);
assert.match(html, /const minRatio = data\.isDivider \? 0\.35 : 0\.12/);
assert.match(html, /\.svg-draw path\s*\{[\s\S]*?stroke-dasharray:\s*1[\s\S]*?stroke-dashoffset:\s*1/);
assert.match(html, /transition:\s*stroke-dashoffset\s+2\.4s/);
assert.match(html, /\.svg-draw path:nth-child\(2\)[\s\S]*?transition-delay:\s*0\.14s/);
assert.match(html, /\.svg-draw path:nth-child\(3\)[\s\S]*?transition-delay:\s*0\.28s/);
assert.match(html, /\.svg-draw path:nth-child\(4\)[\s\S]*?transition-delay:\s*0\.42s/);
assert.doesNotMatch(html, /getTotalLength\(/);
```

Parse every `<svg class="svg-draw">` block and require each `<path>` to contain `pathLength="1"`.

- [ ] **Step 5: Add a failing evidence-file test**

Use Node's `readFile` to require both output assets and verify their file signatures:

```js
const modelingEvidence = await readFile(
  new URL("../evidence/modeling-csee-cup-2026-third-prize-redacted.png", import.meta.url),
);
assert.deepEqual([...modelingEvidence.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);

const englishEvidence = await readFile(
  new URL("../evidence/cn-story-2026-guangdong-second-prize-redacted.jpg", import.meta.url),
);
assert.deepEqual([...englishEvidence.subarray(0, 3)], [255, 216, 255]);
```

- [ ] **Step 6: Run the focused tests and confirm the expected failures**

Run:

```powershell
node --test tests/content-refresh.test.mjs tests/horizontal-animation.test.mjs
```

Expected: failures for the missing evidence assets, old copy, old SVG timing, absent skill CSS states, and old distance calculation. Existing unrelated tests must still execute.

- [ ] **Step 7: Commit only the test changes**

```powershell
git add -- tests/content-refresh.test.mjs tests/horizontal-animation.test.mjs
git commit -m "test: lock portfolio motion and evidence requirements"
```

## Task 2: Generate irreversible public evidence derivatives

**Files:**
- Create: `scripts/redact_evidence.py`
- Create: `evidence/modeling-csee-cup-2026-third-prize-redacted.png`
- Create: `evidence/cn-story-2026-guangdong-second-prize-redacted.jpg`
- Do not copy: the original PDF or original certificate JPG

- [ ] **Step 1: Create a reproducible redaction utility**

Implement `scripts/redact_evidence.py` with:

```python
from argparse import ArgumentParser
from pathlib import Path
from PIL import Image, ImageDraw

NAVY = (15, 34, 57)
MODEL_REFERENCE_SIZE = (1241, 1754)
MODEL_BOXES = (
    (694, 871, 989, 925),   # teammate names
    (860, 1371, 1008, 1425), # certificate number
    (306, 1517, 481, 1568),  # repeated serial in seal
)
CN_REFERENCE_SIZE = (908, 640)
CN_BOXES = ((757, 22, 888, 62),)
```

Scale each reference box to the actual source image dimensions, fill it with a single opaque color, save the output, reopen it, and assert that every redacted region contains only the fill color. The script accepts:

```text
--modeling-render <png>
--cn-story <jpg>
--out-dir evidence
```

The script must not blur, pixelate, or retain editable layers.

- [ ] **Step 2: Render the modeling certificate outside the public site**

Run Poppler at 150 DPI into a temporary working directory:

```powershell
pdftoppm.exe -png -r 150 -singlefile "C:\Users\lenovo\xwechat_files\wxid_6kkeeqhjjwt722_dacf\msg\file\2026-07\005680_1(2).pdf" "<temporary-dir>\modeling-certificate"
```

Expected: a single PNG page; the source PDF remains outside the repository.

- [ ] **Step 3: Build both public derivatives**

Run:

```powershell
python.exe scripts/redact_evidence.py `
  --modeling-render "<temporary-dir>\modeling-certificate.png" `
  --cn-story "C:\Users\lenovo\xwechat_files\wxid_6kkeeqhjjwt722_dacf\temp\RWTemp\2026-07\9e20f478899dc29eb19741386f9343c8\97ac6a8dcc9da13afe7926b79fd2a85f.jpg" `
  --out-dir evidence
```

Expected:

- modeling image keeps 唐嘉辰、深圳大学、赛事全称、全国三等奖和日期;
- modeling image removes both teammate names, certificate number, and repeated serial;
- English image keeps William Leo Tang/唐嘉辰、广东省级二等奖、大学组和日期;
- English image removes `CPFP647111`;
- no source certificate is copied into `evidence/`.

- [ ] **Step 4: Visually inspect both derivatives**

Open both output images at original detail and verify:

1. all required public claims are readable;
2. the user's own name is not covered;
3. all privacy-sensitive regions are completely opaque;
4. no redaction rectangle covers a seal, event title, award, institution, or date;
5. the images have no accidental crop or rotation.

- [ ] **Step 5: Run the evidence-file regression test**

Run:

```powershell
node --test tests/content-refresh.test.mjs
```

Expected: evidence signature assertions pass; content/link assertions remain red until Task 4.

- [ ] **Step 6: Commit only the redaction utility and public derivatives**

```powershell
git add -- scripts/redact_evidence.py evidence/modeling-csee-cup-2026-third-prize-redacted.png evidence/cn-story-2026-guangdong-second-prize-redacted.jpg
git commit -m "feat: add privacy-safe award evidence"
```

## Task 3: Restore skill-card reveal motion without a global style guard

**Files:**
- Modify: `index.html` skill-card styles
- Modify: `index.html` skill-card markup
- Modify: `index.html` skill-card IntersectionObserver script
- Delete from: `index.html` the MutationObserver/setInterval style guard

- [ ] **Step 1: Add stable reveal order to the four skill cards**

Add `style="--reveal-order: 0"` through `style="--reveal-order: 3"` to the four `.value-item` elements in visual order.

- [ ] **Step 2: Add scoped CSS initial and final states**

Under the existing skill-card CSS, add:

```css
.w-mod-js .value-icon {
  opacity: 0;
  transform: translateY(1.25rem) scale(0.9);
  transition:
    opacity 0.7s ease,
    transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--reveal-order, 0) * 80ms);
}

.w-mod-js .value-item__line {
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--reveal-order, 0) * 80ms);
}

.w-mod-js .value-item__divider {
  transform: scaleY(0);
  transform-origin: center top;
  transition: transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--reveal-order, 0) * 80ms + 80ms);
}

.value-item.scroll-reveal-inview .value-icon {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.value-item.scroll-reveal-inview .value-item__line,
.value-item.scroll-reveal-inview .value-item__divider {
  transform: scale(1);
}
```

Add a `prefers-reduced-motion: reduce` block that removes delays and transitions and places all three elements in their final state.

- [ ] **Step 3: Reduce the observer to one responsibility**

Keep the existing observer but make it only add `scroll-reveal-inview` once. If `IntersectionObserver` is unavailable, add the class immediately to every card. Do not write inline opacity or transform properties at runtime.

- [ ] **Step 4: Remove the global style guard**

Delete `startStyleGuard`, its `MutationObserver`, captured style snapshots, periodic `setInterval`, and its unload cleanup. Confirm no script globally forces opacity, transform, or transition values.

- [ ] **Step 5: Run the focused motion tests**

Run:

```powershell
node --test tests/content-refresh.test.mjs
```

Expected: skill reveal architecture and style-guard-removal assertions pass.

- [ ] **Step 6: Commit the skill reveal repair**

```powershell
git add -- index.html
git commit -m "fix: restore skill card reveal motion"
```

## Task 4: Repair SVG timing, horizontal end coverage, copy, and waterfall layout

**Files:**
- Modify: `index.html` horizontal-section CSS
- Modify: `index.html` all four horizontal divider SVG groups
- Modify: `index.html` horizontal-section IntersectionObserver and ScrollTrigger setup
- Modify: `index.html` Current Focus and About copy/layout
- Modify: `index.html` experience evidence links and supporting copy

- [ ] **Step 1: Normalize every horizontal SVG path**

Add `pathLength="1"` to every path inside the four `.svg-draw` groups. Preserve the approved four path-only icon geometries; do not introduce circles, rects, masks, or new external SVG assets.

- [ ] **Step 2: Move drawing animation to CSS**

Add:

```css
.svg-draw path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 2.4s cubic-bezier(0.65, 0, 0.35, 1);
}

.svg-draw path:nth-child(2) { transition-delay: 0.14s; }
.svg-draw path:nth-child(3) { transition-delay: 0.28s; }
.svg-draw path:nth-child(4) { transition-delay: 0.42s; }

.h-slide.side.scroll-reveal-inview .svg-draw path {
  stroke-dashoffset: 0;
}
```

Under reduced motion, set `stroke-dashoffset: 0` with no transition.

- [ ] **Step 3: Slow the side-slide trigger without delaying text**

Represent observer entries as `{ element, isDivider }` and use:

```js
const minRatio = data.isDivider ? 0.35 : 0.12;
```

Divider/side slides begin construction at 35% visibility. Text slides keep the 12% threshold and existing waterfall behavior.

- [ ] **Step 4: Remove GSAP SVG dash calculations**

Delete `getTotalLength()` usage and the GSAP tween that animates `strokeDashoffset`. Retain GSAP for the side-slide container entrance, arrows, the horizontal track, and navigation.

- [ ] **Step 5: Add an integer, viewport-scoped final distance**

Use:

```js
const getViewportWidth = () => section.clientWidth;
const getTotalDistance = () =>
  Math.max(0, Math.ceil(track.scrollWidth - getViewportWidth()) + 2);
```

Use the same function for `x`, the ScrollTrigger `end`, and arrow navigation. The two-pixel overscan must eliminate the exposed strip without changing the 50/50 slide system.

- [ ] **Step 6: Repair the Current Focus overlap**

Remove the negative bottom margin that lets `.subtitle-in-text` overlap the first manifesto line. Give the label a small positive block-end gap while keeping its uppercase scale and position.

- [ ] **Step 7: Enforce the requested About waterfall lines**

Use exactly:

```html
<span class="reveal-text-line">深圳大学微众银行金融科技学院 · 2025级</span>
<span class="reveal-text-line">完成大学第一年，持续探索金融、计算与现实问题</span>
<span class="reveal-text-line">的交叉地带。</span>
```

Do not rely on browser wrapping to create the third line.

- [ ] **Step 8: Strengthen copy without discarding the original portfolio story**

Update the relevant experience and About blocks:

- modeling: formal 2026 competition name, the user's captain role, national third prize, modeling/engineering implementation/team coordination;
- English: “英语口语表达以英式发音为主”, the school first prize, and the sixth CN Story Guangdong provincial second prize;
- field research: preserve the 11-day Lufeng research, log/PPT/news-draft responsibilities, and 南方+ publication link;
- About: state that the school provides the financial-technology learning environment; do not imply employment by WeBank;
- retain original strengths that still support the current quant-development direction, including Python/data, algorithms, web/deployment, research/writing, physics, and structured communication.

- [ ] **Step 9: Add direct evidence links**

Use the existing `evidence-link` visual treatment and add two links:

```html
<a class="evidence-link"
   href="evidence/modeling-csee-cup-2026-third-prize-redacted.png"
   target="_blank"
   rel="noopener noreferrer">查看获奖凭证 ↗</a>
```

```html
<a class="evidence-link"
   href="evidence/cn-story-2026-guangdong-second-prize-redacted.jpg"
   target="_blank"
   rel="noopener noreferrer">查看获奖凭证 ↗</a>
```

Do not add a modal, backend, tracking script, or certificate carousel.

- [ ] **Step 10: Run the two focused test files**

Run:

```powershell
node --test tests/content-refresh.test.mjs tests/horizontal-animation.test.mjs
```

Expected: all tests pass.

- [ ] **Step 11: Commit the horizontal, content, and layout repair**

```powershell
git add -- index.html
git commit -m "fix: refine horizontal story motion and content"
```

## Task 5: Browser-verify motion and responsive behavior

**Files:**
- Create: `scripts/qa-portfolio.mjs`
- Modify only if a defect is reproduced: `index.html`

- [ ] **Step 1: Add a repeatable Playwright QA script**

The script starts against a passed base URL and tests these widths:

```js
const viewports = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
];
```

For each viewport:

1. assert there is no horizontal document overflow outside the intentional pinned track;
2. measure `.subtitle-in-text` and the first manifesto line and assert a non-negative vertical gap;
3. assert the three requested About lines exist and their bounding boxes do not overlap;
4. scroll the skill section into view and assert every icon/line/divider reaches its final transform/opacity;
5. scroll through the horizontal section and assert every divider SVG path starts with dash offset `1` and later reaches `0`;
6. at maximum horizontal progress, compare the visible track end to the section right edge and allow at most one device pixel of under-coverage;
7. assert both evidence URLs return HTTP 200 from the local server.

- [ ] **Step 2: Start a local static server**

Run:

```powershell
python.exe -m http.server 59339 --bind 127.0.0.1
```

Keep the server hidden/backgrounded and record its process ID for cleanup.

- [ ] **Step 3: Run browser QA**

Run:

```powershell
node scripts/qa-portfolio.mjs http://127.0.0.1:59339
```

Expected: all viewport assertions pass. Save screenshots for 1920×1080, 1024×768, 390×844, and both certificate pages to a temporary QA directory outside the public site.

- [ ] **Step 4: Perform a visual motion pass**

At 1440×900:

1. reload at the top;
2. confirm skill red icon, horizontal line, and vertical divider animate visibly and sequentially;
3. confirm the first horizontal divider remains unbuilt before entry, begins near 35% visibility, and completes over roughly 2.8 seconds;
4. navigate forward and backward through all four horizontal groups;
5. confirm no SVG remains half-built and the final left-side seam is covered;
6. confirm text masks still reveal in the intended sentence order.

- [ ] **Step 5: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce`, reload, and assert all content and paths render in their final state with no hidden evidence or inaccessible controls.

- [ ] **Step 6: Fix only reproduced in-scope defects and rerun the full QA script**

For each failure, first capture the computed style/bounding-box evidence, make the smallest correction, rerun the focused Node tests, then rerun Playwright.

- [ ] **Step 7: Commit the QA harness and any verified fixes**

```powershell
git add -- scripts/qa-portfolio.mjs index.html
git commit -m "test: add responsive portfolio browser QA"
```

## Task 6: Deliver the architecture and professionalism audit

**Files:**
- Create: `docs/audits/2026-07-27-portfolio-architecture-professionalism-review.md`
- Reference: `index.html`
- Reference: `tests/content-refresh.test.mjs`
- Reference: `tests/horizontal-animation.test.mjs`
- Reference: `scripts/qa-portfolio.mjs`

- [ ] **Step 1: Record the post-repair architecture inventory**

Document:

- single-page static architecture and dependency boundaries;
- content/animation/test/evidence file inventory;
- GSAP/ScrollTrigger responsibility versus IntersectionObserver/CSS responsibility;
- hosting assumptions and which features do not require a backend;
- source-of-truth risks caused by a large inline `index.html`.

- [ ] **Step 2: Separate repaired findings from remaining findings**

Include a table with columns:

```text
Priority | Area | Finding | Evidence | User impact | Recommendation | Status
```

Mark the following as repaired only after browser verification:

- missing skill red-icon/line/divider entrance motion;
- imperceptibly fast horizontal SVG drawing;
- final-track exposed strip;
- Current Focus overlap;
- About waterfall line break;
- imprecise competition and college claims;
- absent public award evidence.

- [ ] **Step 3: Audit remaining architecture risk**

At minimum, assess:

- monolithic inline CSS/JS maintainability;
- external CDN failure/fallback behavior;
- preloader and first-content availability;
- mobile navigation discoverability;
- existing mobile `100vh` clipping behavior;
- reduced-motion coverage;
- semantic heading hierarchy, keyboard focus, link names, image alt text, contrast;
- SEO/Open Graph/structured data;
- contact-link validity and placeholder destinations;
- evidence privacy and future document workflow;
- performance cost of background textures, pinned sections, and resize refreshes.

Do not silently implement the mobile navigation or separate mobile clipping redesign in this scope; rank them in the roadmap.

- [ ] **Step 4: Audit professional positioning**

Evaluate:

- whether the first screen communicates “quantitative development” rather than quantitative research;
- whether math, physics, English, software, and field research form one credible narrative;
- whether each claim has an evidence level: verified link, named result, concrete responsibility, or unsupported adjective;
- whether WeBank wording could be read as employment;
- whether tutoring intent remains absent from the public-facing tone;
- whether text density and bilingual labels support seniority rather than overclaim it.

- [ ] **Step 5: Explain backend needs accurately**

State clearly:

- static project pages, code links, demos, PDFs/images, GitHub links, and external project links do not require a custom backend;
- a backend/serverless function becomes useful for private accounts, persistent user data, protected admin editing, database-backed content, secure contact submission, analytics requiring server ownership, or proxying secret API keys;
- static hosting plus external services is sufficient for the current portfolio.

- [ ] **Step 6: Provide a prioritized roadmap**

Use:

- P0: accessibility/content availability and broken destinations;
- P1: mobile navigation, mobile section-height strategy, semantic/SEO foundation;
- P2: split inline code into maintainable modules, local/fallback assets, reusable content data;
- P3: richer project case studies, demo/code integration, optional CMS/serverless contact.

Give each recommendation an effort estimate (`S`, `M`, `L`) and a concrete acceptance criterion.

- [ ] **Step 7: Commit the audit**

```powershell
git add -- docs/audits/2026-07-27-portfolio-architecture-professionalism-review.md
git commit -m "docs: audit portfolio architecture and professionalism"
```

## Task 7: Final verification and handoff

**Files:**
- Verify: all modified and created files

- [ ] **Step 1: Run the complete automated suite**

Run:

```powershell
node --test tests/*.test.mjs
```

Expected: zero failures.

- [ ] **Step 2: Run the final browser suite**

Run:

```powershell
node scripts/qa-portfolio.mjs http://127.0.0.1:59339
```

Expected: all six viewports pass, evidence links return 200, and the final horizontal seam remains covered.

- [ ] **Step 3: Inspect repository scope**

Run:

```powershell
git status --short
git diff --check
git log --oneline -7
```

Expected:

- no source certificate, temporary render, screenshot, cache, or local server artifact is tracked;
- no whitespace errors;
- pre-existing unrelated user changes are not overwritten or staged accidentally;
- the implementation is split into the planned focused commits.

- [ ] **Step 4: Stop the temporary server**

Stop only the recorded QA server process and confirm port 59339 is no longer owned by it.

- [ ] **Step 5: Request code review**

Use the `requesting-code-review` skill to review the final diff against the approved design spec and this plan. Address only findings that are in scope and reproducible.

- [ ] **Step 6: Prepare the final handoff**

Report:

- exactly what was repaired;
- the final test and browser-QA results;
- the two privacy-safe evidence files;
- the audit report path and its highest-priority remaining recommendations;
- any pre-existing dirty files preserved;
- the branch and commit list.
