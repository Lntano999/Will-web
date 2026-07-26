# One-Shot Scroll Reveals and Footer Period Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all horizontal and white-copy reveals play once per page load and remain fixed, while fully exposing the footer wordmark period without adding scrollbars.

**Architecture:** Replace the first horizontal group’s private animation lifecycle with a readiness signal consumed by the same slide controller as the later groups. Add a reusable one-shot masked-line controller for the homepage and footer white copy, with the homepage controller driven by the preloader timeline. Keep the footer overflow boundary intact and reserve local bottom space inside the large footer wordmark.

**Tech Stack:** Static HTML/CSS, GSAP 3.14, SplitText, ScrollTrigger, IntersectionObserver, Node.js built-in test runner.

---

## File Map

- Modify: `index.html` — horizontal animation lifecycle, white-copy masked-line controller, preloader integration, and scoped footer wordmark class/CSS.
- Modify: `tests/horizontal-animation.test.mjs` — source-level regression tests for shared one-shot state, white-copy integration, and footer period safety.
- Reference: `docs/superpowers/specs/2026-07-26-scroll-reveal-and-footer-clip-design.md` — approved behavior and verification contract.

### Task 1: Lock the Horizontal One-Shot Contract

**Files:**
- Modify: `tests/horizontal-animation.test.mjs`
- Test: `tests/horizontal-animation.test.mjs`

- [ ] **Step 1: Add a failing horizontal lifecycle test**

Append this test:

```js
test("all horizontal slides share one one-shot reveal lifecycle", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(
    html,
    /querySelectorAll\("\.split-timeline,\s*\.split-horizontal"\)/,
    "the shared slide controller should collect first and later slide targets",
  );
  assert.doesNotMatch(
    html,
    /\bsplitPlayed\b/,
    "the first slide must not keep a private played flag",
  );
  assert.doesNotMatch(
    html,
    /data\.played\s*=\s*false/,
    "played slides must not reset when they leave the viewport",
  );
  assert.match(
    html,
    /horizontal:first-ready/,
    "the wrapper timeline should only signal first-slide readiness",
  );
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test tests\horizontal-animation.test.mjs
```

Expected: FAIL because the first slide still uses `splitPlayed`, the shared selector only collects `.split-horizontal`, and the exit branch resets `data.played`.

- [ ] **Step 3: Convert the wrapper timeline into a readiness gate**

In the `.timeline-horizontal` script in `index.html`, remove the first slide’s private `SplitText`, `allLines`, `splitPlayed`, arrow tween, and `playIntroAnim` implementation.

Replace them with:

```js
let firstSlideUnlocked = false;

function unlockFirstSlide() {
  if (firstSlideUnlocked) return;
  firstSlideUnlocked = true;
  document.body.classList.add("h-slide-1-ready");
  window.dispatchEvent(new CustomEvent("horizontal:first-ready"));
}
```

Use `unlockFirstSlide` in both existing trigger points:

```js
ScrollTrigger.create({
  trigger: section,
  start: "top 80%",
  once: true,
  onEnter: unlockFirstSlide
});
```

```js
tl.call(unlockFirstSlide, null, ">");
```

- [ ] **Step 4: Register every slide in the shared controller**

In the `.horizontal-text` script, change target collection to:

```js
const targets = slide.querySelectorAll(".split-timeline, .split-horizontal");
```

Keep one `SplitText` pipeline:

```js
targets.forEach((el) => {
  const split = new SplitText(el, {
    type: "lines",
    mask: "lines",
    linesClass: "split-text-line"
  });
  splits.push(split);
});
```

Extract the existing entrance tween into one function:

```js
function playSlide(slide) {
  const data = slideDataMap.get(slide);
  if (!data || data.played) return;
  if (data.isFirst && !document.body.classList.contains("h-slide-1-ready")) return;

  data.played = true;
  slide.classList.add("scroll-reveal-inview");

  if (data.lines.length) {
    gsap.to(data.lines, {
      y: "0%",
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.1
    });
  }
  if (data.svgPaths.length) {
    gsap.to(data.svgPaths, {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: "power3.inOut"
    });
  }
  if (data.arrows.length) {
    gsap.to(data.arrows, {
      yPercent: 0,
      duration: 0.5,
      ease: "power3.out"
    });
  }
}
```

Replace the observer exit animation/reset branch with an early return:

```js
if (!entry.isIntersecting || entry.intersectionRatio < minRatio) return;
playSlide(entry.target);
```

Add the first-slide readiness listener after `playSlide` is defined:

```js
window.addEventListener("horizontal:first-ready", () => {
  const firstSlide = slides[0];
  if (firstSlide) playSlide(firstSlide);
});
```

The initial `played: false` property in `slideDataMap` remains; only later assignments back to `false` are removed.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```powershell
node --test tests\horizontal-animation.test.mjs
```

Expected: all current tests pass.

- [ ] **Step 6: Commit the horizontal lifecycle**

```powershell
git add index.html tests/horizontal-animation.test.mjs
git commit -m "fix: unify horizontal one-shot reveals"
```

### Task 2: Add One-Shot Masked White Copy

**Files:**
- Modify: `tests/horizontal-animation.test.mjs`
- Modify: `index.html`
- Test: `tests/horizontal-animation.test.mjs`

- [ ] **Step 1: Add a failing white-copy integration test**

Append:

```js
test("homepage and footer white copy use the one-shot line controller", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(
    html,
    /class="claim-m one-shot-white-reveal"/,
    "the homepage claim should opt into the shared controller",
  );
  assert.match(
    html,
    /class="claim-m expertise-split one-shot-white-reveal"/,
    "the footer claim should opt into the shared controller",
  );
  assert.match(
    html,
    /window\.oneShotWhiteReveals/,
    "the preloader and observer should share reveal instances",
  );
  assert.match(
    html,
    /observer\.unobserve\(entry\.target\)/,
    "the footer observer should stop after the first reveal",
  );
  assert.doesNotMatch(
    html,
    /gsap\.set\(heroClaim,\s*\{\s*opacity:\s*0,\s*y:\s*30\s*\}\)/,
    "the old root-level hero animation must not compete with line masks",
  );
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test tests\horizontal-animation.test.mjs
```

Expected: FAIL because the white-copy classes and controller do not exist and the preloader still animates the root claim.

- [ ] **Step 3: Mark the two white-copy targets**

Change the homepage claim to:

```html
<p
  data-wf-target="..."
  class="claim-m one-shot-white-reveal"
>
```

Change the footer upper-right claim to:

```html
<div class="claim-m expertise-split one-shot-white-reveal">
  Discussing Quant,<br/>Tech, or potential<br/>Opportunities?
</div>
```

- [ ] **Step 4: Add the reusable one-shot line controller before the preloader script**

Insert:

```html
<script>
(function initOneShotWhiteReveals() {
  const targets = {
    hero: document.querySelector(".home-hero .one-shot-white-reveal"),
    footer: document.querySelector("#contact .one-shot-white-reveal")
  };

  function createReveal(element) {
    if (!element || typeof SplitText === "undefined" || typeof gsap === "undefined") {
      return null;
    }

    const split = new SplitText(element, {
      type: "lines",
      mask: "lines",
      linesClass: "one-shot-white-line"
    });
    const lines = split.lines;
    let played = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      gsap.set(lines, { y: "0%", opacity: 1 });
      played = true;
    } else {
      gsap.set(lines, { y: "140%", opacity: 0 });
    }

    function play(timeline, position) {
      if (played) return;
      played = true;
      const vars = {
        y: "0%",
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08
      };
      if (timeline) timeline.to(lines, vars, position);
      else gsap.to(lines, vars);
    }

    return { element, lines, play, get played() { return played; } };
  }

  const hero = createReveal(targets.hero);
  const footer = createReveal(targets.footer);
  window.oneShotWhiteReveals = { hero, footer };

  if (footer && !footer.played) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.25) return;
        footer.play();
        observer.unobserve(entry.target);
      });
    }, { threshold: [0, 0.1, 0.25, 0.5] });
    observer.observe(footer.element);
  }
})();
</script>
```

- [ ] **Step 5: Integrate the homepage lines into the preloader timeline**

Scope the existing claim query:

```js
const heroClaim = document.querySelector(".home-hero .claim-m");
const heroReveal = window.oneShotWhiteReveals?.hero;
```

Remove:

```js
if (heroClaim) gsap.set(heroClaim, { opacity: 0, y: 30 });
```

Replace the root-level `exitTl.to(heroClaim, ...)` block with:

```js
if (heroReveal) {
  heroReveal.play(exitTl, 1.0);
} else if (heroClaim) {
  exitTl.fromTo(
    heroClaim,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out",
      clearProps: "all"
    },
    1.0
  );
}
```

This fallback keeps the claim visible when `SplitText` is unavailable.

- [ ] **Step 6: Run the focused test and verify GREEN**

Run:

```powershell
node --test tests\horizontal-animation.test.mjs
```

Expected: all tests pass.

- [ ] **Step 7: Commit the white-copy controller**

```powershell
git add index.html tests/horizontal-animation.test.mjs
git commit -m "feat: add one-shot white line reveals"
```

### Task 3: Protect the Footer Wordmark Period

**Files:**
- Modify: `tests/horizontal-animation.test.mjs`
- Modify: `index.html`
- Test: `tests/horizontal-animation.test.mjs`

- [ ] **Step 1: Add a failing scoped period-safety test**

Append:

```js
test("the footer wordmark reserves period space without opening footer overflow", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(
    html,
    /class="clipping-text footer-wordmark"/,
    "the large footer mark should have a scoped class",
  );
  assert.match(
    html,
    /#contact\s+\.footer-wordmark\s*\{[^}]*padding-bottom:\s*0\.08em/s,
    "the footer mark should reserve local descent space",
  );
  assert.match(
    html,
    /#contact\.footer\s*\{[^}]*overflow:\s*hidden\s*!important/s,
    "footer overflow containment must remain enabled",
  );
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test tests\horizontal-animation.test.mjs
```

Expected: FAIL because `.footer-wordmark` and its local safety rule do not exist.

- [ ] **Step 3: Add the scoped wordmark class and safety space**

Change the footer wordmark element to:

```html
<div
  class="clipping-text footer-wordmark"
  style="font-size: 18vw; font-weight: 900; line-height: 0.85; margin-left: -0.5vw; letter-spacing: -0.05em;"
>
  <span>WILL.</span>
</div>
```

Add near the existing footer overflow fixes:

```css
#contact .footer-wordmark {
  display: block;
  box-sizing: border-box;
  padding-bottom: 0.08em;
}
```

Do not remove:

```css
#contact.footer {
  overflow: hidden !important;
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
node --test tests\horizontal-animation.test.mjs
```

Expected: all tests pass.

- [ ] **Step 5: Commit the footer period fix**

```powershell
git add index.html tests/horizontal-animation.test.mjs
git commit -m "fix: preserve footer wordmark period"
```

### Task 4: Browser Lifecycle and Geometry Verification

**Files:**
- Verify: `index.html`
- Test: `tests/horizontal-animation.test.mjs`

- [ ] **Step 1: Run the complete automated suite**

Run:

```powershell
node --test
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Check patch whitespace using the repository’s CRLF convention**

Run:

```powershell
git -c core.whitespace=cr-at-eol diff --check
```

Expected: exit code 0 with no whitespace errors.

- [ ] **Step 3: Verify downward horizontal playback**

Open the page at a 1500×1300 desktop viewport, finish the preloader, and scroll downward through all three horizontal groups.

Expected:

- Each group’s text, arrows, and SVG paths reveal once.
- The first group starts only after its wrapper readiness signal.
- Blue wordmarks remain clipped by their moving line masks.
- The small text waterfall remains visible.

- [ ] **Step 4: Verify upward fixed state**

Continue below the horizontal section, then scroll upward through all three groups.

Expected:

- No group animates out.
- No group replays.
- Previously revealed content remains at `opacity: 1` and final transforms.

- [ ] **Step 5: Verify homepage and footer one-shot white copy**

Expected:

- Homepage Chinese lines reveal through masks during preloader exit.
- Footer English lines reveal on first footer entry.
- Leaving and returning does not reset or replay either target.

- [ ] **Step 6: Verify footer geometry**

In the browser console, evaluate:

```js
(() => {
  const footer = document.querySelector("#contact");
  const mark = document.querySelector("#contact .footer-wordmark");
  const periodSource = mark?.querySelector("span");
  const footerRect = footer?.getBoundingClientRect();
  const markRect = mark?.getBoundingClientRect();
  return {
    footerBottom: footerRect?.bottom,
    markBottom: markRect?.bottom,
    insideFooter: Boolean(footerRect && markRect && markRect.bottom <= footerRect.bottom + 0.5),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    verticalOverflowAdded: markRect ? markRect.bottom > document.documentElement.scrollHeight + 0.5 : null,
    periodText: periodSource?.textContent
  };
})();
```

Expected:

- `insideFooter: true`
- `horizontalOverflow: false`
- `verticalOverflowAdded: false`
- `periodText: "WILL."`
- Visual inspection shows the complete circular period.

- [ ] **Step 7: Run final verification again after any geometry adjustment**

If browser geometry requires changing `0.08em`, update the CSS and matching test value together, then run:

```powershell
node --test
git -c core.whitespace=cr-at-eol diff --check
```

Expected: all tests pass and diff check exits 0.

- [ ] **Step 8: Commit final verified adjustments**

```powershell
git add index.html tests/horizontal-animation.test.mjs
git commit -m "test: verify one-shot reveal lifecycle"
```
