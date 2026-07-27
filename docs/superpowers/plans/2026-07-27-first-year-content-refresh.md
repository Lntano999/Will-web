# First-Year Content Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio copy around Build → Model → Field → Speak, add a fourth horizontal experience with a coherent four-icon SVG system, expose the South+ evidence link, and preserve every existing animation controller.

**Architecture:** Keep the single-file Webflow-derived architecture and make scoped edits in `index.html`; do not split or refactor the existing animation code. Add source-level Node tests that treat content, slide structure, SVG geometry, evidence-link accessibility, and animation constants as contracts. Reuse the existing responsive CSS and GSAP/IntersectionObserver pipelines so the fourth slide pair is discovered dynamically.

**Tech Stack:** Static HTML/CSS, GSAP + SplitText + ScrollTrigger already loaded by the page, Node.js built-in test runner, Microsoft Edge headless for screenshot smoke checks.

---

## File Map

- Modify: `index.html` — metadata, navigation labels, Hero and Identity copy, four horizontal experience groups, four SVGs, skills, About cards, footer positioning, South+ evidence link styles.
- Create: `tests/content-refresh.test.mjs` — exact content, structure, SVG, accessibility, and negative-copy contracts.
- Preserve: `tests/horizontal-animation.test.mjs` — existing animation lifecycle and footer clipping regressions.
- Reference: `docs/superpowers/specs/2026-07-27-first-year-content-refresh-design.md` — approved copy, geometry, breakpoint, and scope requirements.

### Task 1: Lock and Update the Global Positioning Copy

**Files:**
- Create: `tests/content-refresh.test.mjs`
- Modify: `index.html:19-25`
- Modify: `index.html:1062-1065`
- Modify: `index.html:1167-1175`
- Modify: `index.html:1210-1239`
- Modify: `index.html:1982-1985`
- Modify: `index.html:2017-2018`

- [ ] **Step 1: Write the failing metadata, Hero, Identity, navigation, and negative-copy test**

Create `tests/content-refresh.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../index.html", import.meta.url);

async function loadHtml() {
  return readFile(pageUrl, "utf8");
}

test("global positioning reflects quant development without tutoring copy", async () => {
  const html = await loadHtml();

  assert.match(html, /<title>WILL\. \| FinTech Student &amp; Quant Developer<\/title>/);
  assert.match(
    html,
    /name="description"[^>]*content="WILL\. — 深圳大学金融科技学生，专注量化开发与金融科技后端，以独立开发、数学建模、县域调研与英语表达探索真实问题。"/,
  );
  assert.match(html, /property="og:title"[^>]*content="WILL\. \| FinTech Student &amp; Quant Developer"/);
  assert.match(html, /property="og:description"[^>]*content="WILL\. — 深圳大学金融科技学生，专注量化开发与金融科技后端，以独立开发、数学建模、县域调研与英语表达探索真实问题。"/);

  const heroLines = [
    "用代码构建，",
    "用模型分析，",
    "到真实世界调研，",
    "再把答案讲清楚。",
  ];
  for (const line of heroLines) {
    assert.match(html, new RegExp(`class="one-shot-white-line">${line}<`));
  }

  assert.match(html, /深圳大学微众银行金融科技学院 · 2025级/);
  assert.match(html, /完成大学第一年，持续探索金融、计算与现实问题的交叉地带。/);
  assert.match(html, />Current Focus</);
  assert.match(html, /量化开发 × 金融科技后端/);
  assert.match(html, /用建模、工程实现与真实场景调研，积累可验证的问题解决能力。/);

  assert.match(html, />Background</);
  assert.match(html, />Experience</);
  assert.match(html, />Skills</);
  assert.match(html, />About</);
  assert.match(html, /Build \/ Model \/ Field \/ Speak/);
  assert.match(html, /Quant Development &amp; FinTech Backend/);

  assert.doesNotMatch(html, /Quantitative Researcher|Finance Research/);
  assert.doesNotMatch(html, /家教|tutoring/i);
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```powershell
node --test tests/content-refresh.test.mjs
```

Expected: `1` failed test; the first mismatch is the old `<title>WILL. | Web Developer & Researcher</title>`.

- [ ] **Step 3: Replace global metadata and positioning copy**

Use these exact metadata values in `index.html`:

```html
<title>WILL. | FinTech Student &amp; Quant Developer</title>
<meta name="description" content="WILL. — 深圳大学金融科技学生，专注量化开发与金融科技后端，以独立开发、数学建模、县域调研与英语表达探索真实问题。"/>
<meta property="og:title" content="WILL. | FinTech Student &amp; Quant Developer"/>
<meta property="og:description" content="WILL. — 深圳大学金融科技学生，专注量化开发与金融科技后端，以独立开发、数学建模、县域调研与英语表达探索真实问题。"/>
```

Replace the desktop navigation labels while preserving the existing anchors and button:

```html
<a href="#identity" class="nav-tag color-white nav-link nav-minimal">Background</a>
<a href="#research" class="nav-tag color-white nav-link nav-minimal">Experience</a>
<a href="#tech" class="nav-tag color-white nav-link nav-minimal">Skills</a>
<a href="#projects" class="nav-tag color-white nav-link nav-minimal">About</a>
```

Replace the mobile list and positioning line:

```html
<ul role="list" class="nav-mobile__list-link">
  <li class="nav-mobile__list-item"><a href="#identity" class="nav-mobile__link">Background</a></li>
  <li class="nav-mobile__list-item"><a href="#research" class="nav-mobile__link">Experience</a></li>
  <li class="nav-mobile__list-item"><a href="#tech" class="nav-mobile__link">Skills</a></li>
  <li class="nav-mobile__list-item"><a href="#projects" class="nav-mobile__link">About</a></li>
  <li class="nav-mobile__list-item"><a href="#contact" class="nav-mobile__link">Contact</a></li>
</ul>
```

```html
<p class="claim-s max-w-footer split">Build / Model / Field / Speak</p>
```

Replace the Hero masks:

```html
<p data-wf-target="[[[&quot;68f77e4ac7ca6bd68b326cb4&quot;,&quot;f795206b-cfea-47c2-42e7-3d1c4abaf727&quot;],[]]]" class="claim-m one-shot-white-reveal">
  <span class="one-shot-white-mask"><span class="one-shot-white-line">用代码构建，</span></span>
  <span class="one-shot-white-mask"><span class="one-shot-white-line">用模型分析，</span></span>
  <span class="one-shot-white-mask"><span class="one-shot-white-line">到真实世界调研，</span></span>
  <span class="one-shot-white-mask"><span class="one-shot-white-line">再把答案讲清楚。</span></span>
</p>
```

Replace the two Identity blocks:

```html
<div><div class="div-hide"><div class="nav-tag split-tag">Academic Background</div></div></div>
<div id="w-node-f795206b-cfea-47c2-42e7-3d1c4abaf737-8b326cb4">
  <p class="manifesto">深圳大学微众银行金融科技学院 · 2025级<br/>完成大学第一年，持续探索金融、计算与现实问题的交叉地带。</p>
</div>
```

```html
<div class="subtitle-in-text"><div class="nav-tag split-tag">Current Focus</div></div>
<p class="manifesto">量化开发 × 金融科技后端<br/>用建模、工程实现与真实场景调研，积累可验证的问题解决能力。</p>
```

Keep the three fixed footer white-copy masks, but update their text:

```html
<span class="one-shot-white-mask"><span class="one-shot-white-line">Discussing Quant,</span></span>
<span class="one-shot-white-mask"><span class="one-shot-white-line">Tech, or future</span></span>
<span class="one-shot-white-mask"><span class="one-shot-white-line">Opportunities?</span></span>
```

Replace the footer identity line:

```html
<p class="claim-s max-w-footer expertise-split">WILL.<br/>Quant Development &amp; FinTech Backend</p>
```

- [ ] **Step 4: Run the focused and existing tests**

Run:

```powershell
node --test tests/content-refresh.test.mjs tests/horizontal-animation.test.mjs
```

Expected: `5` tests pass, `0` fail. The existing white-copy test still sees exactly seven fixed masks.

- [ ] **Step 5: Commit the positioning copy**

```powershell
git add index.html tests/content-refresh.test.mjs
git commit -m "feat: refresh portfolio positioning copy"
```

### Task 2: Add Four Evidence-Driven Experience Groups

**Files:**
- Modify: `tests/content-refresh.test.mjs`
- Modify: `index.html:1244-1348`
- Modify: `index.html:30-380` for the evidence-link styles

- [ ] **Step 1: Append failing experience and South+ link tests**

Append to `tests/content-refresh.test.mjs`:

```js
test("horizontal experiences present four evidence-driven groups", async () => {
  const html = await loadHtml();
  const experienceOrder = [...html.matchAll(/data-experience="([^"]+)"/g)].map((match) => match[1]);
  const dividerOrder = [...html.matchAll(/data-experience-divider="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(experienceOrder, ["build", "model", "field", "speak"]);
  assert.deepEqual(dividerOrder, ["build", "model", "field", "speak"]);

  assert.match(html, /独立完成个人网站重构与上线/);
  assert.match(html, /电工杯数学建模大赛/);
  assert.match(html, /获全国三等奖/);
  assert.match(html, /课题组导师小组组长/);
  assert.match(html, /统筹 5 人协作与沟通/);
  assert.match(html, /“南粤大地写论文”/);
  assert.match(html, /为期 11 天的沉浸式蹲点调研/);
  assert.match(html, /调研日志、PPT 文书/);
  assert.match(html, /青衿文化桥英语演讲比赛一等奖/);
  assert.match(html, /CN Story 广东省二等奖/);

  assert.match(html, />Build<br\/>Ship</);
  assert.match(html, />Model<br\/>Lead</);
  assert.match(html, />Field<br\/>Research</);
  assert.match(html, />Speak<br\/>Connect</);
});

test("field research links to the public South+ evidence accessibly", async () => {
  const html = await loadHtml();

  assert.match(
    html,
    /<a[^>]+class="evidence-link"[^>]+href="https:\/\/static\.nfnews\.com\/content\/202607\/25\/c12659862\.html\?colID=0&amp;firstColID=24357&amp;appversion=13800&amp;from=weChatMessage&amp;enterColumnId=&amp;date=&amp;layer=3"[^>]+target="_blank"[^>]+rel="noopener noreferrer"[^>]+aria-label="查看陆丰县域发展调研的南方\+公开报道（在新窗口打开）"/,
  );
  assert.match(html, /查看南方\+公开报道/);
  assert.match(html, /\.evidence-link:focus-visible\s*\{/);
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```powershell
node --test --test-name-pattern="horizontal experiences|South\+ evidence" tests/content-refresh.test.mjs
```

Expected: `2` failed tests because `data-experience` and `.evidence-link` do not exist.

- [ ] **Step 3: Replace the three content groups with four groups**

Apply these exact content rules inside the existing `.track`:

Insert this unchanged arrow block after the copy in each of the four `.top` containers:

```html
<div class="div-hide">
  <div class="h-arrow w-embed">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"><path d="M16.0003 14.1421H11.9895V6.59024L3.14789 15.4319L0.568359 12.8524L9.41002 4.01071H1.85812V0H16.0003L16.0003 14.1421Z" fill="#FA4838"/></svg>
  </div>
</div>
```

```html
<div class="h-slide" data-experience="build">
  <div class="top">
    <p class="claim-s split-timeline">独立完成个人网站重构与上线，<br/>以大语言模型协同推进开发，<br/>从交互动效、响应式适配，<br/>到 Cloudflare 边缘部署与域名解析，<br/>走通从构想到交付的开发链路。</p>
  </div>
  <div class="bot col clipping-text gap">
    <div class="nav-tag clipping-text split-timeline">Build &amp; Deploy</div>
    <h2 class="clipping-text split-timeline home-h2">Build<br/>Ship</h2>
  </div>
</div>
```

Use fixed waterfall lines for the remaining three content slides:

```html
<div class="h-slide" data-experience="model">
  <div class="top">
    <div class="scroll-mask-block claim-s">
      <div class="mask-line-container"><span class="reveal-text-line">大一担任队长参加</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">电工杯数学建模大赛，</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">组织问题拆解、模型构建、</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">结果检验与论文表达，</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">获全国三等奖。</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">同时担任课题组导师小组组长，</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">统筹 5 人协作与沟通。</span></div>
    </div>
  </div>
  <div class="bot col clipping-text gap">
    <div class="nav-tag clipping-text split-horizontal">Mathematics &amp; Leadership</div>
    <h2 class="clipping-text split-reveal split-horizontal home-h2">Model<br/>Lead</h2>
  </div>
</div>
```

```html
<div class="h-slide" data-experience="field">
  <div class="top">
    <div class="scroll-mask-block claim-s">
      <div class="mask-line-container"><span class="reveal-text-line">参与广东哲社“南粤大地写论文”</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">县域发展调研（陆丰），</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">随院长领衔的跨学科团队</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">开展为期 11 天的沉浸式蹲点调研。</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">除一线走访与访谈外，</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">共同负责调研日志、PPT 文书</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">与新闻稿初稿撰写。</span></div>
    </div>
    <a class="evidence-link" href="https://static.nfnews.com/content/202607/25/c12659862.html?colID=0&amp;firstColID=24357&amp;appversion=13800&amp;from=weChatMessage&amp;enterColumnId=&amp;date=&amp;layer=3" target="_blank" rel="noopener noreferrer" aria-label="查看陆丰县域发展调研的南方+公开报道（在新窗口打开）">查看南方+公开报道 ↗</a>
  </div>
  <div class="bot col clipping-text gap">
    <div class="nav-tag clipping-text split-horizontal">County Development</div>
    <h2 class="clipping-text split-reveal split-horizontal home-h2">Field<br/>Research</h2>
  </div>
</div>
```

```html
<div class="h-slide" data-experience="speak">
  <div class="top">
    <div class="scroll-mask-block claim-s">
      <div class="mask-line-container"><span class="reveal-text-line">英语口语表达偏向英式英语，</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">获青衿文化桥英语演讲比赛一等奖，</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">及 CN Story 广东省二等奖。</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">曾参与法国留学生校园接待，</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">在竞赛与真实交流中持续打磨</span></div>
      <div class="mask-line-container"><span class="reveal-text-line">结构化表达与跨文化沟通。</span></div>
    </div>
  </div>
  <div class="bot col clipping-text gap">
    <div class="nav-tag clipping-text split-horizontal">English &amp; Communication</div>
    <h2 class="clipping-text split-horizontal split-reveal home-h2">Speak<br/>Connect</h2>
  </div>
</div>
```

Keep one side slide after each content slide and add the matching attributes:

```html
data-experience-divider="build"
data-experience-divider="model"
data-experience-divider="field"
data-experience-divider="speak"
```

Reuse the three existing side slides for Build, Model, and Speak at this stage. Insert this complete Field side slide between Field / Research and Speak / Connect; Task 3 will then normalize all four icons:

```html
<div class="h-slide side" data-experience-divider="field">
  <div class="slide-side__content">
    <div class="nav-tag color-white split-horizontal">Timeline</div>
    <div class="w-embed">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58" fill="none" class="svg-draw">
        <path d="M1 1H57V57H1V1Z" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
        <path d="M19.67 1V57M38.33 1V57" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
        <path d="M1 19.67H57M1 38.33H57" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
        <path d="M29 35C32.3137 35 35 32.3137 35 29C35 25.6863 32.3137 23 29 23C25.6863 23 23 25.6863 23 29C23 32.3137 25.6863 35 29 35Z" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
      </svg>
    </div>
    <div class="nav-tag color-white split-horizontal">Timeline</div>
  </div>
</div>
```

Add scoped, non-animated evidence-link styles in the inline stylesheet:

```css
.evidence-link {
  display: inline-flex;
  width: fit-content;
  margin-top: 1rem;
  color: #fa4838;
  font-size: clamp(0.75rem, 0.9vw, 0.95rem);
  font-weight: 700;
  line-height: 1.3;
  text-decoration: none;
  border-bottom: 1px solid currentColor;
}

.evidence-link:focus-visible {
  outline: 2px solid #fa4838;
  outline-offset: 4px;
}

@media (max-width: 479px) {
  .evidence-link {
    font-size: 3.48vw;
    margin-top: 4vw;
  }
}
```

- [ ] **Step 4: Run content and animation regressions**

Run:

```powershell
node --test tests/content-refresh.test.mjs tests/horizontal-animation.test.mjs
```

Expected: `7` tests pass, `0` fail. The original animation-controller assertions remain green.

- [ ] **Step 5: Commit the four-group content**

```powershell
git add index.html tests/content-refresh.test.mjs
git commit -m "feat: add evidence-driven experience timeline"
```

### Task 3: Replace All Divider SVGs with the Approved A System

**Files:**
- Modify: `tests/content-refresh.test.mjs`
- Modify: `index.html` inside the four `data-experience-divider` slides

- [ ] **Step 1: Append the failing SVG-system contract**

Append to `tests/content-refresh.test.mjs`:

```js
test("four divider icons share the approved framed four-path system", async () => {
  const html = await loadHtml();
  const dividerBlocks = [...html.matchAll(
    /<div class="h-slide side" data-experience-divider="([^"]+)">([\s\S]*?)<\/div>\s*<\/div>/g,
  )];

  assert.equal(dividerBlocks.length, 4);
  assert.deepEqual(dividerBlocks.map((match) => match[1]), ["build", "model", "field", "speak"]);

  for (const [, name, block] of dividerBlocks) {
    assert.match(block, /class="svg-draw"/, `${name} should use the shared draw class`);
    assert.match(block, /viewBox="0 0 58 58"/, `${name} should use the shared 58px viewBox`);
    assert.equal(block.match(/<path\b/g)?.length, 4, `${name} should contain exactly four paths`);
    assert.doesNotMatch(block, /<(circle|rect|mask|filter)\b/, `${name} should be path-only`);
    assert.match(block, /aria-hidden="true"/, `${name} icon should be decorative`);
    assert.match(block, /focusable="false"/, `${name} icon should not receive focus`);
  }

  assert.match(html, /M21 21H37V37H21V21Z/);
  assert.match(html, /M7 43C15 16 43 16 51 43/);
  assert.match(html, /M19\.67 1V57M38\.33 1V57/);
  assert.match(html, /M7 18C14 8 22 8 29 18C36 28 44 28 51 18/);
});
```

- [ ] **Step 2: Run the SVG test and verify it fails**

Run:

```powershell
node --test --test-name-pattern="framed four-path system" tests/content-refresh.test.mjs
```

Expected: `1` failed test because the legacy dividers have two to four paths and mixed viewBoxes.

- [ ] **Step 3: Replace the four SVG elements**

Use this Build SVG:

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58" fill="none" class="svg-draw" aria-hidden="true" focusable="false">
  <path d="M1 1H57V57H1V1Z" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
  <path d="M21 21H37V37H21V21Z" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
  <path d="M1 1L21 21M57 1L37 21M57 57L37 37M1 57L21 37" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
  <path d="M29 1V21M57 29H37M29 57V37M1 29H21" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
</svg>
```

Use this Model SVG:

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58" fill="none" class="svg-draw" aria-hidden="true" focusable="false">
  <path d="M1 1H57V57H1V1Z" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
  <path d="M7 29H51M29 7V51" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
  <path d="M7 43C15 16 43 16 51 43" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
  <path d="M7 15C15 42 43 42 51 15" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
</svg>
```

Use this Field SVG:

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58" fill="none" class="svg-draw" aria-hidden="true" focusable="false">
  <path d="M1 1H57V57H1V1Z" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
  <path d="M19.67 1V57M38.33 1V57" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
  <path d="M1 19.67H57M1 38.33H57" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
  <path d="M29 35C32.3137 35 35 32.3137 35 29C35 25.6863 32.3137 23 29 23C25.6863 23 23 25.6863 23 29C23 32.3137 25.6863 35 29 35Z" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
</svg>
```

Use this Speak SVG:

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58" fill="none" class="svg-draw" aria-hidden="true" focusable="false">
  <path d="M1 1H57V57H1V1Z" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
  <path d="M7 18C14 8 22 8 29 18C36 28 44 28 51 18" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
  <path d="M7 40C14 50 22 50 29 40C36 30 44 30 51 40" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
  <path d="M29 23C32.3137 23 35 25.6863 35 29C35 32.3137 32.3137 35 29 35C25.6863 35 23 32.3137 23 29C23 25.6863 25.6863 23 29 23Z" stroke="white" stroke-width="1" stroke-miterlimit="10"/>
</svg>
```

Retain the existing shared size style once, rather than duplicating it in every side slide:

```css
.svg-draw {
  width: 5.556vw !important;
  height: 5.556vw !important;
}

@media (max-width: 479px) {
  .svg-draw {
    width: 19.9vw !important;
    height: 19.9vw !important;
  }
}
```

- [ ] **Step 4: Run all source-level tests**

Run:

```powershell
node --test tests/content-refresh.test.mjs tests/horizontal-animation.test.mjs
```

Expected: `8` tests pass, `0` fail.

- [ ] **Step 5: Commit the SVG system**

```powershell
git add index.html tests/content-refresh.test.mjs
git commit -m "feat: unify horizontal experience icons"
```

### Task 4: Rewrite Skills and About Cards with Stable Waterfall Lines

**Files:**
- Modify: `tests/content-refresh.test.mjs`
- Modify: `index.html:1577-1677`
- Modify: `index.html:1719-1778`

- [ ] **Step 1: Append failing skills and About copy tests**

Append:

```js
test("skills and About cards use restrained first-year evidence", async () => {
  const html = await loadHtml();

  for (const heading of [
    "Python &amp; Data",
    "C++ &amp; Algorithms",
    "Web &amp; Deploy",
    "Research &amp; Writing",
  ]) {
    assert.match(html, new RegExp(`<h4>${heading}</h4>`));
  }

  assert.match(html, /使用 pandas 与 yfinance/);
  assert.match(html, /为量化开发和金融科技/);
  assert.match(html, /完成 Cloudflare 部署/);
  assert.match(html, /参与新闻稿初稿撰写。/);
  assert.match(html, /使用 Git 与 LaTeX/);

  assert.match(html, /2025 级金融科技学生/);
  assert.match(html, /英文名 William，也可以叫我 Will/);
  assert.match(html, /把课程问题带入竞赛、项目与真实场景/);

  assert.doesNotMatch(html, /极致安全|深度优化探索|卓越的跨文化|极强的共情力/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```powershell
node --test --test-name-pattern="skills and About" tests/content-refresh.test.mjs
```

Expected: `1` failed test on the missing `Python & Data` heading.

- [ ] **Step 3: Replace the four skill headings and waterfall lines**

Use these exact headings and line containers:

```html
<h4>Python &amp; Data</h4>
<div class="scroll-mask-block">
  <div class="mask-line-container"><span class="reveal-text-line">使用 pandas 与 yfinance</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">完成金融数据获取、清洗</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">与基础策略验证，</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">并以 Python 编写自动化脚本。</span></div>
</div>
```

```html
<h4>C++ &amp; Algorithms</h4>
<div class="scroll-mask-block">
  <div class="mask-line-container"><span class="reveal-text-line">持续训练算法、数据结构</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">与计算思维，</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">为量化开发和金融科技</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">后端实践夯实基础。</span></div>
</div>
```

```html
<h4>Web &amp; Deploy</h4>
<div class="scroll-mask-block">
  <div class="mask-line-container"><span class="reveal-text-line">独立处理网页结构、</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">交互动效与响应式适配，</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">完成 Cloudflare 部署</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">与域名解析配置。</span></div>
</div>
```

```html
<h4>Research &amp; Writing</h4>
<div class="scroll-mask-block">
  <div class="mask-line-container"><span class="reveal-text-line">具备访谈记录、</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">调研日志与 PPT 文书</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">协作经验，</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">参与新闻稿初稿撰写。</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">使用 Git 与 LaTeX</span></div>
  <div class="mask-line-container"><span class="reveal-text-line">管理代码与结构化文档。</span></div>
</div>
```

Update the section heading:

```html
<div class="nav-tag color-black split-tag">Methods &amp; Skills</div>
<p class="manifesto clipping-text">Turning ideas into<br/>evidence and execution.</p>
```

- [ ] **Step 4: Replace the three About descriptions**

Use:

```html
<p class="use-case-text">2025 级金融科技学生。大一通过独立开发、数学建模、县域调研与英语演讲，建立跨学科实践基础。</p>
```

```html
<p class="use-case-text">我是唐嘉辰，英文名 William，也可以叫我 Will。</p>
```

```html
<p class="use-case-text">在金融与技术交叉的培养环境中，把课程问题带入竞赛、项目与真实场景。</p>
```

- [ ] **Step 5: Run the complete tests**

Run:

```powershell
node --test tests/content-refresh.test.mjs tests/horizontal-animation.test.mjs
```

Expected: `9` tests pass, `0` fail.

- [ ] **Step 6: Commit the supporting content**

```powershell
git add index.html tests/content-refresh.test.mjs
git commit -m "feat: refine skills and About evidence"
```

### Task 5: Protect Animation Constants and Responsive Line Safety

**Files:**
- Modify: `tests/content-refresh.test.mjs`
- Verify: `index.html`
- Verify: `tests/horizontal-animation.test.mjs`

- [ ] **Step 1: Append explicit animation-invariant and mask-line tests**

Append:

```js
test("horizontal expansion preserves animation timing and explicit line masks", async () => {
  const html = await loadHtml();

  assert.match(
    html,
    /end:\s*\(\)\s*=>\s*"\+="\s*\+\s*\(getTotalDistance\(\)\s*\+\s*window\.innerHeight\s*\*\s*0\.5\)/,
  );
  assert.match(html, /const minRatio = 0\.12/);
  assert.match(html, /duration:\s*0\.7,[\s\S]*?ease:\s*"power3\.out",[\s\S]*?stagger:\s*0\.1/);
  assert.match(html, /duration:\s*1\.5,[\s\S]*?ease:\s*"power3\.inOut"/);
  assert.match(html, /duration:\s*0\.5,[\s\S]*?ease:\s*"power3\.out"/);

  const fixedExperienceLines = [
    ...html.matchAll(/data-experience="(?:model|field|speak)"[\s\S]*?<div class="scroll-mask-block claim-s">([\s\S]*?)<\/div>\s*(?:<a|<div class="div-hide">)/g),
  ];
  assert.equal(fixedExperienceLines.length, 3);
  for (const [, block] of fixedExperienceLines) {
    assert.doesNotMatch(block, /<br\s*\/?>/);
    assert.equal(
      block.match(/class="mask-line-container"/g)?.length,
      block.match(/class="reveal-text-line"/g)?.length,
    );
  }
});
```

- [ ] **Step 2: Run the full suite**

Run:

```powershell
node --test tests/content-refresh.test.mjs tests/horizontal-animation.test.mjs
```

Expected: `10` tests pass, `0` fail.

- [ ] **Step 3: Inspect the exact changed source and whitespace**

Run:

```powershell
git diff --check
git diff -- index.html tests/content-refresh.test.mjs
```

Expected: `git diff --check` prints nothing. The diff contains content, SVG, attributes, and scoped evidence-link CSS changes, but no changes inside the two horizontal animation `<script>` blocks.

- [ ] **Step 4: Start the local static server**

Run:

```powershell
python -m http.server 5500
```

Expected: server reports `Serving HTTP on :: port 5500`. Keep it running for the screenshot checks.

- [ ] **Step 5: Capture desktop and mobile screenshot smoke checks**

In a second PowerShell process, run:

```powershell
$qaDir = Join-Path ([System.IO.Path]::GetTempPath()) 'will-content-refresh-qa'
New-Item -ItemType Directory -Force $qaDir | Out-Null
& 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' --headless=new --disable-gpu --hide-scrollbars --window-size=1440,1200 --virtual-time-budget=5000 --screenshot="$qaDir\desktop-1440.png" http://localhost:5500
& 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' --headless=new --disable-gpu --hide-scrollbars --window-size=390,844 --force-device-scale-factor=1 --virtual-time-budget=5000 --screenshot="$qaDir\mobile-390.png" http://localhost:5500
Get-ChildItem $qaDir | Select-Object Name,Length
```

Expected: `desktop-1440.png` and `mobile-390.png` exist and have non-zero length.

- [ ] **Step 6: Inspect both images and perform interactive horizontal QA**

Open the screenshots and verify:

- Hero has four complete, unclipped lines.
- Navigation does not wrap.
- The mobile Hero and Identity remain within the viewport.
- No generic tutoring copy appears.

Then use the local page in a browser at `1440`, `1024`, `768`, `390`, and `360` CSS pixels:

1. Scroll through Build, Model, Field, and Speak in both directions.
2. Confirm each content waterfall, arrow, divider labels, and SVG plays once.
3. Confirm all four SVGs draw with the same visual weight and no residual dash.
4. Confirm the South+ link opens a new tab and receives a visible keyboard focus ring.
5. Confirm every explicit line remains one physical line inside its mask.
6. Confirm mobile stacks four content slides and four side slides with no page-level horizontal scrollbar.
7. Confirm existing project-card, footer, preloader, and marquee animations are unchanged.

- [ ] **Step 7: Commit the final regression contract**

```powershell
git add tests/content-refresh.test.mjs
git commit -m "test: protect content refresh animation contracts"
```

### Task 6: Final Verification and Handoff

**Files:**
- Verify: `index.html`
- Verify: `tests/content-refresh.test.mjs`
- Verify: `tests/horizontal-animation.test.mjs`
- Verify: `docs/superpowers/specs/2026-07-27-first-year-content-refresh-design.md`

- [ ] **Step 1: Run all automated tests from a clean command**

Run:

```powershell
node --test tests/content-refresh.test.mjs tests/horizontal-animation.test.mjs
```

Expected: `10` tests pass, `0` fail.

- [ ] **Step 2: Confirm only intended files are changed**

Run:

```powershell
git status --short
git log -6 --oneline
```

Expected: implementation files are clean after commits; `.superpowers/brainstorm/...` may remain untracked as local design-session material and must not be staged.

- [ ] **Step 3: Confirm the evidence URL and static-first scope**

Run:

```powershell
Select-String -Path index.html -Pattern 'static\.nfnews\.com/content/202607/25/c12659862|github|家教|tutoring|Quantitative Researcher|Finance Research'
```

Expected: one South+ URL match; no `家教`, `tutoring`, `Quantitative Researcher`, or `Finance Research` match. GitHub need not appear until a real project link is supplied.

- [ ] **Step 4: Record final verification evidence**

Report:

- exact Node test pass count;
- desktop and mobile screenshot paths;
- four-group interactive QA result;
- confirmation that the horizontal GSAP controller was not modified;
- confirmation that no backend, user accounts, database, or tutoring CTA was introduced.
