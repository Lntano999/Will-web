# Skill Title Mask Headroom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop Methods & Skills title descenders from being clipped while preserving the title waterfall mask and existing layout positions.

**Architecture:** Extend browser QA to measure the real height difference between each title mask and its title content before changing CSS. Add vertical padding only to the skill-title mask, then offset that padding with compensating margins so the title baseline and following body copy retain their current positions.

**Tech Stack:** HTML, scoped CSS, Node.js test runner, Playwright browser QA.

---

### Task 1: Add a browser-level clipping regression test

**Files:**
- Modify: `scripts/qa-portfolio.mjs:167-222`
- Modify: `tests/content-refresh.test.mjs`
- Test: `tests/content-refresh.test.mjs`

- [ ] **Step 1: Record the actual title-mask headroom**

In the `initialSkillState` page evaluation, keep references to the title mask and add measured headroom:

```js
const titleElement = item.querySelector(".skill-title-line");
const titleMask = titleElement.closest(".skill-title-mask");
const title = getComputedStyle(titleElement);
const titleRect = titleElement.getBoundingClientRect();
const titleMaskRect = titleMask.getBoundingClientRect();
```

Add these result fields:

```js
titleMaskHeadroom: titleMask.clientHeight - titleElement.scrollHeight,
titleMaskClearance: titleRect.top - titleMaskRect.bottom,
```

- [ ] **Step 2: Assert enough final glyph room and a fully masked initial position**

After the existing initial-state check, add:

```js
check(
  state.titleMaskHeadroom >= 2,
  `${viewport.width}px: skill ${index + 1} title mask headroom is ${state.titleMaskHeadroom}px`,
);
check(
  state.titleMaskClearance >= 0.5,
  `${viewport.width}px: skill ${index + 1} title is not fully below its mask`,
);
```

The `2px` headroom protects rounded glyph bounds; the `0.5px` clearance confirms the larger mask still hides the initial title.

- [ ] **Step 3: Lock the QA measurement into the static suite**

Extend the browser-QA source test:

```js
assert.match(qa, /titleMaskHeadroom/);
assert.match(qa, /titleMaskClearance/);
```

Add a new CSS contract test:

```js
test("skill title masks reserve glyph headroom without moving the layout", async () => {
  const html = await loadHtml();
  assert.match(
    html,
    /\.mask-line-container\.skill-title-mask\s*\{[\s\S]*?padding-top:\s*0?\.12em;[\s\S]*?margin-top:\s*-0?\.12em;[\s\S]*?padding-bottom:\s*0?\.12em;[\s\S]*?margin-bottom:\s*calc\(0?\.25rem\s*-\s*0?\.12em\);/,
  );
});
```

- [ ] **Step 4: Verify RED**

Run:

```powershell
node --test --test-name-pattern="skill title masks reserve glyph headroom|browser QA is reproducible" tests/content-refresh.test.mjs
```

Expected: the CSS contract test fails because the safety-area rule does not exist.

Then run the real browser regression:

```powershell
$env:BROWSER_EXECUTABLE='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$env:QA_ALLOW_OFFLINE='1'
$env:QA_VIEWPORTS='1440'
$env:PLAYWRIGHT_MODULE_URL='D:\My projects\Will-web\.worktrees\first-year-content-refresh\node_modules\playwright\index.mjs'
node scripts/qa-portfolio.mjs http://127.0.0.1:59341
```

Expected: FAIL with title-mask headroom `-2px` or another value below `2px`.

### Task 2: Add compensated vertical headroom

**Files:**
- Modify: `index.html:367-370`
- Test: `tests/content-refresh.test.mjs`
- Test: `scripts/qa-portfolio.mjs`

- [ ] **Step 1: Replace the title-mask rule**

Use the more specific selector and compensated safe area:

```css
.mask-line-container.skill-title-mask {
  overflow: hidden;
  padding-top: 0.12em;
  margin-top: -0.12em;
  padding-bottom: 0.12em;
  margin-bottom: calc(0.25rem - 0.12em);
}
```

This leaves the external footprint equivalent to the current generic `0.25rem` bottom margin.

- [ ] **Step 2: Verify GREEN in static and browser tests**

Run:

```powershell
node --check scripts/qa-portfolio.mjs
node --test tests/*.test.mjs
```

Expected: 17 tests pass and 0 fail.

Run the 1440px browser regression again:

```powershell
$env:QA_ALLOW_OFFLINE='1'
$env:QA_VIEWPORTS='1440'
node scripts/qa-portfolio.mjs http://127.0.0.1:59341
```

Expected: PASS; each mask has at least `2px` headroom and at least `0.5px` initial clearance.

- [ ] **Step 3: Run the complete responsive verification**

Run the real online animation check:

```powershell
Remove-Item Env:QA_ALLOW_OFFLINE -ErrorAction SilentlyContinue
$env:QA_VIEWPORTS='1440'
node scripts/qa-portfolio.mjs http://127.0.0.1:59341
```

Expected: `Portfolio QA passed for 1 responsive viewports.`

Run all six responsive widths:

```powershell
$env:QA_ALLOW_OFFLINE='1'
Remove-Item Env:QA_VIEWPORTS -ErrorAction SilentlyContinue
node scripts/qa-portfolio.mjs http://127.0.0.1:59341
```

Expected: `Portfolio QA passed for 6 responsive viewports.`

- [ ] **Step 4: Verify the final diff and commit**

Run:

```powershell
git diff --check
git status --short
```

Expected: only `index.html`, `scripts/qa-portfolio.mjs`, and `tests/content-refresh.test.mjs` are modified.

Commit:

```powershell
git add -- index.html scripts/qa-portfolio.mjs tests/content-refresh.test.mjs
git commit -m "fix: preserve skill title descenders"
```

### Task 3: Final review

**Files:**
- Review: `index.html`
- Review: `scripts/qa-portfolio.mjs`
- Review: `tests/content-refresh.test.mjs`

- [ ] **Step 1: Request code review**

Review the change from the pre-fix commit through `HEAD`, focusing on mask geometry, CSS specificity, initial animation hiding, reduced-motion behavior, and whether the QA measures real rendered sizes.

- [ ] **Step 2: Run fresh completion verification**

Run:

```powershell
node --check scripts/qa-portfolio.mjs
node --test tests/*.test.mjs
git diff --check
git status -sb
```

Expected: syntax succeeds, 17 tests pass, the worktree is clean, and the branch contains the committed fix.
