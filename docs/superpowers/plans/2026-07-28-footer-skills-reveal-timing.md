# Footer and Skills Reveal Timing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the footer text reveal more slowly and make the Methods & Skills body-copy waterfall visibly sequential without changing any other animation group.

**Architecture:** Keep the existing one-shot GSAP reveal and CSS/IntersectionObserver skill reveal systems. Parameterize the shared white-text reveal so only the footer receives slower values, and add scoped skill-card CSS overrides for displacement, duration, and stagger. Extend static contracts and browser QA timing so the localized behavior cannot regress.

**Tech Stack:** HTML, scoped CSS, vanilla JavaScript, GSAP, Node.js test runner, Playwright QA.

---

### Task 1: Lock the approved timing contract with failing tests

**Files:**
- Modify: `tests/content-refresh.test.mjs`
- Test: `tests/content-refresh.test.mjs`

- [ ] **Step 1: Add a focused static timing test**

Add this test after the existing skill reveal tests:

```js
test("footer and skill copy use scoped, moderately slower reveal timing", async () => {
  const html = await readFile(indexPath, "utf8");

  assert.match(
    html,
    /function createReveal\(element,\s*options\s*=\s*\{\}\)/,
  );
  assert.match(
    html,
    /duration\s*=\s*0\.8[\s\S]*?stagger\s*=\s*0\.08/,
  );
  assert.match(
    html,
    /createReveal\(targets\.footer,\s*\{\s*duration:\s*1\.05,\s*stagger:\s*0\.14\s*\}\)/,
  );
  assert.match(
    html,
    /\.value-item\s+\.scroll-mask-block\s+\.reveal-text-line\s*\{[\s\S]*?transform:\s*translateY\(125%\)[\s\S]*?transition-duration:\s*1\.1s,\s*1\.1s[\s\S]*?var\(--reveal-order,\s*0\)\s*\*\s*110ms/,
  );

  for (const [line, delay] of [
    [1, 260],
    [2, 410],
    [3, 560],
    [4, 710],
    [5, 860],
    [6, 1010],
  ]) {
    assert.match(
      html,
      new RegExp(
        `mask-line-container:nth-child\\(${line}\\) \\{ --skill-line-delay: ${delay}ms; \\}`,
      ),
    );
  }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test --test-name-pattern="footer and skill copy use scoped" tests/content-refresh.test.mjs
```

Expected: FAIL because `createReveal` does not accept options and the skill body-copy timing still uses the old values.

### Task 2: Implement the scoped footer and skill timing

**Files:**
- Modify: `index.html:469-478`
- Modify: `index.html:2518-2554`
- Test: `tests/content-refresh.test.mjs`

- [ ] **Step 1: Replace the skill body-copy timing rules**

Use these scoped rules:

```css
.value-item .scroll-mask-block .mask-line-container:nth-child(1) { --skill-line-delay: 260ms; }
.value-item .scroll-mask-block .mask-line-container:nth-child(2) { --skill-line-delay: 410ms; }
.value-item .scroll-mask-block .mask-line-container:nth-child(3) { --skill-line-delay: 560ms; }
.value-item .scroll-mask-block .mask-line-container:nth-child(4) { --skill-line-delay: 710ms; }
.value-item .scroll-mask-block .mask-line-container:nth-child(5) { --skill-line-delay: 860ms; }
.value-item .scroll-mask-block .mask-line-container:nth-child(6) { --skill-line-delay: 1010ms; }
.value-item .scroll-mask-block .reveal-text-line {
  transform: translateY(125%);
  transition-duration: 1.1s, 1.1s;
  transition-delay:
    calc(var(--reveal-order, 0) * 110ms + var(--skill-line-delay, 260ms));
}
```

Keep the existing in-view final transform and reduced-motion override unchanged.

- [ ] **Step 2: Parameterize the white-text reveal**

Change the function boundary and parameter defaults:

```js
function createReveal(element, options = {}) {
  if (!element || typeof gsap === "undefined") {
    return null;
  }

  const {
    duration = 0.8,
    stagger = 0.08
  } = options;
```

Use the variables in the animation:

```js
const vars = {
  y: "0%",
  opacity: 1,
  duration,
  ease: "power3.out",
  stagger
};
```

Keep the hero on defaults and pass slower footer values:

```js
const hero = createReveal(targets.hero);
const footer = createReveal(targets.footer, {
  duration: 1.05,
  stagger: 0.14
});
```

- [ ] **Step 3: Run the focused test and verify GREEN**

Run:

```powershell
node --test --test-name-pattern="footer and skill copy use scoped" tests/content-refresh.test.mjs
```

Expected: PASS.

- [ ] **Step 4: Run the complete static suite**

Run:

```powershell
node --test tests/*.test.mjs
```

Expected: 16 tests pass and 0 fail.

- [ ] **Step 5: Commit the behavior change**

```powershell
git add -- index.html tests/content-refresh.test.mjs
git commit -m "fix: clarify footer and skill reveal timing"
```

### Task 3: Align browser QA with the longer waterfall

**Files:**
- Modify: `scripts/qa-portfolio.mjs:230`
- Modify: `tests/content-refresh.test.mjs`
- Test: `tests/content-refresh.test.mjs`

- [ ] **Step 1: Add a failing QA timing assertion**

Extend the existing browser-QA static test with:

```js
assert.match(qa, /await page\.waitForTimeout\(2_700\)/);
```

- [ ] **Step 2: Run the QA contract test and verify RED**

Run:

```powershell
node --test --test-name-pattern="browser QA is reproducible" tests/content-refresh.test.mjs
```

Expected: FAIL because browser QA still waits `1_300ms`.

- [ ] **Step 3: Increase the completion wait**

In `scripts/qa-portfolio.mjs`, replace:

```js
await page.waitForTimeout(1_300);
```

with:

```js
await page.waitForTimeout(2_700);
```

This covers the approved maximum `2.44s` completion window with a small rendering buffer.

- [ ] **Step 4: Verify the QA contract and full static suite**

Run:

```powershell
node --check scripts/qa-portfolio.mjs
node --test tests/*.test.mjs
git diff --check
```

Expected: JavaScript syntax succeeds, 16 tests pass, and `git diff --check` reports no errors.

- [ ] **Step 5: Run responsive browser verification**

Start the existing local server if required, then run:

```powershell
$env:BROWSER_EXECUTABLE='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$env:QA_VIEWPORTS='1440'
node scripts/qa-portfolio.mjs http://127.0.0.1:59339
```

Expected: `Portfolio QA passed for 1 responsive viewports.`

Then run the six-width offline fallback:

```powershell
$env:QA_ALLOW_OFFLINE='1'
Remove-Item Env:QA_VIEWPORTS -ErrorAction SilentlyContinue
node scripts/qa-portfolio.mjs http://127.0.0.1:59339
```

Expected: `Portfolio QA passed for 6 responsive viewports.`

- [ ] **Step 6: Commit the QA update**

```powershell
git add -- scripts/qa-portfolio.mjs tests/content-refresh.test.mjs
git commit -m "test: cover slower reveal completion"
```

### Task 4: Final verification and handoff

**Files:**
- Verify: `index.html`
- Verify: `scripts/qa-portfolio.mjs`
- Verify: `tests/content-refresh.test.mjs`

- [ ] **Step 1: Confirm repository state**

Run:

```powershell
git status --short
git log -3 --oneline
```

Expected: only the user's pre-existing `.superpowers/brainstorm/codex-1785135971/` directory remains untracked; the reveal changes are committed.

- [ ] **Step 2: Report the exact scope and verification evidence**

Report:

- Footer only: `1.05s` duration and `0.14s` stagger.
- Skill body copy only: `125%` displacement, `1.1s` duration, `0.15s` line stagger, `110ms` card-order offset.
- Hero, icons, titles, borders, and reduced-motion behavior remain unchanged.
- Static test count and browser QA results.
