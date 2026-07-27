# Motion, Layout, and Evidence Repair Design

**Date:** 2026-07-27  
**Status:** Approved direction — Path A  
**Scope:** Repair the current portfolio without changing its visual language or rewriting the horizontal-scroll system.

## 1. Goal

Restore the missing skill-card entrance motion, make the horizontal SVG construction clearly observable, remove the final horizontal-slide edge leak, correct text overlap and waterfall line timing, and strengthen award credibility with privacy-safe evidence.

The finished page must still feel like the same website. The work extends the existing red-line, waterfall-mask, blue-texture, and monochrome SVG systems instead of introducing a new animation style.

## 2. Confirmed User Requirements

1. Restore the entrance animation for the four red skill icons, horizontal borders, and vertical dividers.
2. Remove any exposed or unfilled strip at the left edge when the final horizontal experience pair reaches its end position.
3. Slow the construction of all four horizontal divider SVGs so the drawing is visible during normal scrolling.
4. Fix text layout displacement and overlap.
5. Insert a deliberate waterfall break before `的交叉地带。`, so this phrase enters as a later line rather than appearing with the preceding line.
6. Apply the three accepted copy improvements:
   - Replace `英语口语表达偏向英式英语` with `英语口语表达以英式发音为主`.
   - Use the verified formal name and year of the modeling competition.
   - Rename the About card from a standalone `WeBank (微众银行)` identity to `微众银行金融科技学院`.
7. Publish redacted evidence for the modeling and CN Story awards.
8. Preserve the current horizontal-scroll concept and avoid adding a new interaction framework.
9. After implementation, produce a detailed architecture and professionalism audit based on the repaired version.

## 3. Evidence Verification

### 3.1 Mathematical modeling

The supplied PDF visually and textually verifies:

- Event: 第十八届“中国电机工程学会杯”全国大学生电工数学建模竞赛
- English event label: CSEE Cup 2026 — National University Students Electrical Math Modeling Competition
- Award: 全国三等奖 / Third Prize
- School: 深圳大学
- Competition dates: 2026-05-22 to 2026-05-25
- Winner includes: 唐嘉辰

The website may continue to state that 唐嘉辰 served as team captain because that role was supplied directly by the user. The certificate verifies participation, team membership, school, event, year, and award; it does not independently encode the captain role.

### 3.2 CN Story

The supplied certificate image verifies:

- Event: 第六届“用英语讲中国故事大会”
- English event label: The 6th “Stories of China Retold in English” Challenge
- Category: College Category
- Region/stage: Guangdong Provincial Final
- Award: Second Prize / 广东省级阶段二等奖
- Recipient: William Leo Tang / 唐嘉辰
- Date: 2026-06-23

The school-level 青衿文化桥一等奖 remains a text claim because no separate public certificate was supplied for it in this scope.

## 4. Root-Cause Findings

### 4.1 Missing skill-card icon and border motion

The current observer adds `scroll-reveal-inview` to `.value-item` and `.value-divider`, but the local stylesheet only defines reveal states for the text masks. The red icons and border elements have no deterministic local initial/end animation contract.

The same block later installs a `MutationObserver` and a 500ms interval that restore styles or force `opacity`, `transform`, `clip-path`, and dimensions to final values. This defensive layer can cancel Webflow-generated entrance states and makes ownership of the animation unclear.

### 4.2 Horizontal SVG construction finishes before visual focus

The current divider SVG animation:

- begins at approximately 12% intersection;
- animates all paths together;
- uses a 1.5-second duration;
- starts while the divider slide is still entering the viewport.

The result is technically animated but often visually complete before the viewer focuses on the icon.

### 4.3 Current Focus label overlap

The core stylesheet gives `.subtitle-in-text` a negative bottom margin of `-1.5vw`. A later override changes `.manifesto` to a substantially larger `line-height: 1.6`. The two rules now overlap instead of forming the original compact label/title stack. Runtime measurement at 1440px found roughly 14px of vertical collision.

### 4.4 Horizontal end seam

The horizontal track translation uses the exact difference between `track.scrollWidth` and the viewport width. Exact alignment is vulnerable to fractional layout values, browser zoom, scrollbar metrics, and GPU transform rounding. The final white content panel therefore has no overscan to conceal a one-pixel or sub-pixel exposure of the underlying background.

### 4.5 Waterfall line timing

The identity copy currently gives the browser and SplitText permission to keep `的交叉地带。` on the preceding visual line. An explicit semantic break is required so the phrase receives its own line mask and later reveal timing.

## 5. Selected Architecture: Local Deterministic Motion

### 5.1 Skill-card reveal

The skill section will use its existing `IntersectionObserver` and `scroll-reveal-inview` class, with local CSS owning the animation.

Initial states, active only when JavaScript is available:

- `.value-icon`: `opacity: 0`, slight downward translation, and restrained scale reduction.
- `.value-item__line`: full layout width retained, visual transform set to `scaleX(0)` from the left.
- `.value-divider`: full layout height retained, visual transform set to `scaleY(0)` from the top.

Revealed states:

- icon transitions to full opacity, zero translation, and scale 1;
- horizontal lines expand left-to-right;
- vertical dividers expand top-to-bottom;
- text continues to use the current waterfall masks.

Each observed element receives a numeric `--reveal-order` custom property. The animation delay is derived from that property so the four columns and three dividers form one continuous sequence without hard-coding DOM positions.

The previous `MutationObserver`, delayed style snapshots, and 500ms style-repair interval will be removed. The local CSS contract will use sufficient specificity to override Webflow inline animation residue without continuously mutating the DOM.

Reduced-motion behavior:

- all icons and lines render immediately in their final state;
- no translate, scale, or stagger is applied;
- content remains fully visible if `IntersectionObserver` is unavailable.

### 5.2 Horizontal SVG draw

Every path in the four 58×58 framed SVGs will use `pathLength="1"`. This normalizes all geometries and allows one stable CSS drawing contract:

- initial `stroke-dasharray: 1`;
- initial `stroke-dashoffset: 1`;
- final `stroke-dashoffset: 0`;
- approximately 2.4 seconds per path;
- path-to-path delay of approximately 120–160ms;
- complete icon construction remains visible for roughly 2.8–3 seconds.

Divider slides will not trigger the draw until they reach approximately 30–35% visibility. Text slides may keep the existing lower reveal threshold.

The horizontal observer will continue to add `scroll-reveal-inview`; it will no longer use GSAP to calculate each path length or animate path offsets. GSAP remains responsible for the existing horizontal pin/scale/translation system and arrow motion.

If JavaScript or `IntersectionObserver` is unavailable, all SVG paths and text must be revealed immediately. Under reduced motion, the SVG renders complete without a drawing transition.

### 5.3 Final horizontal alignment

The final translation distance will:

1. use the horizontal section’s measured client width rather than assuming `window.innerWidth`;
2. round the travel distance upward;
3. add a minimal 1–2px overscan;
4. preserve the existing 50/50 final content/divider composition.

The final white Speak panel may use a matching white edge overscan as an additional concealment layer. No visible spacing or panel-width change is permitted.

### 5.4 Typography and waterfall layout

The Current Focus label will receive a positive responsive bottom gap instead of the inherited negative margin. The correction must be scoped to `.horizontal-text-pin` so unrelated subtitle treatments do not move.

The identity copy will become:

```html
深圳大学微众银行金融科技学院 · 2025级<br/>
完成大学第一年，持续探索金融、计算与现实问题<br/>
的交叉地带。
```

Each intended waterfall line remains explicitly authored. Automated checks will reject rejoining `的交叉地带。` with the previous line.

### 5.5 Copy revisions

The Model slide will use the verified formal competition wording and year while preserving explicit line masks:

```text
大一担任队长参加
2026 第十八届“中国电机工程学会杯”
全国大学生电工数学建模竞赛，
组织问题拆解、模型构建、
结果检验与论文表达，
获全国三等奖。
同时担任课题组导师小组组长，
统筹 5 人协作与沟通。
```

The Speak slide begins with:

```text
英语口语表达以英式发音为主，
```

The About card title changes to:

```text
微众银行金融科技学院
```

Its supporting label and description will make clear that this is the student’s academic training environment, not employment or an internship at WeBank.

### 5.6 Public evidence assets

Only flattened derivative images will enter the public site. The source PDF and original certificate image must remain outside the repository.

Modeling certificate derivative:

- retain 唐嘉辰, event name, school, award, dates, and organizer marks;
- obscure 李庭宇 and 宋星佑;
- obscure `NO. 20264199`;
- obscure any repeated embedded serial number that remains legible in the seal area;
- use opaque raster redaction, not CSS overlays or reversible PDF annotations.

CN Story certificate derivative:

- retain William Leo Tang / 唐嘉辰, event, Guangdong provincial stage, Second Prize, and date;
- obscure certificate number `CPFP647111`;
- use opaque raster redaction.

The page will link directly to these static images in a new tab, using the existing `.evidence-link` style and descriptive accessible labels. No modal, gallery library, account system, or backend will be added.

## 6. Files and Responsibilities

- `index.html`
  - copy updates;
  - explicit waterfall break;
  - normalized SVG paths;
  - local skill reveal states;
  - revised observer behavior;
  - horizontal end calculation;
  - static evidence links.
- `tests/content-refresh.test.mjs`
  - evidence and copy contracts;
  - explicit waterfall line contract;
  - skill reveal contract;
  - SVG normalized path and timing contract;
  - no style-guard interval contract;
  - end-overscan contract.
- `tests/horizontal-animation.test.mjs`
  - preservation of the approved horizontal layout timeline;
  - updated allowance for the measured travel-distance fix.
- `evidence/modeling-csee-cup-2026-third-prize-redacted.png`
  - flattened, privacy-safe modeling evidence.
- `evidence/cn-story-2026-guangdong-second-prize-redacted.jpg`
  - flattened, privacy-safe English award evidence.

No new runtime dependency is required.

## 7. Test Strategy

### 7.1 Source-level regression tests

Tests will be written and observed failing before production changes. They will verify:

- formal event names and accepted copy changes;
- explicit `<br/>` before `的交叉地带。`;
- redacted evidence paths, labels, `target="_blank"`, and `rel="noopener noreferrer"`;
- exactly four framed SVGs, each still containing four paths;
- every divider path has normalized `pathLength="1"`;
- SVG draw duration is no shorter than 2.4 seconds and has a path stagger;
- divider reveal threshold is higher than the text-only threshold;
- skill icons, horizontal borders, and vertical dividers have initial and revealed states;
- reduced-motion and no-observer fallbacks reveal all content;
- the MutationObserver/style snapshot/500ms patrol implementation is absent;
- horizontal travel uses section width, upward rounding, and overscan;
- the existing horizontal timing labels and track translation sequence remain intact.

### 7.2 Browser-level verification

Desktop widths:

- 1440×1000
- 1920×1080

Responsive widths:

- 1024×768
- 768×1024
- 390×844
- 360×800

Checks:

- Current Focus label and manifesto have zero overlap.
- Identity’s final phrase occupies a separate rendered line.
- All four red icons and seven border/divider elements visibly transition on first entry.
- SVG construction remains visible long enough to observe each path.
- Final Speak/Timeline pair covers the viewport without an exposed strip.
- No horizontal document overflow is introduced.
- Reduced-motion displays all content immediately.
- No runtime exception is introduced by the new code.

Certificate derivatives will be opened at original resolution after creation to confirm:

- required identity and award fields remain readable;
- private fields are fully opaque and unrecoverable from the public raster;
- no source PDF or unredacted image exists under the repository’s public paths.

## 8. Error and Fallback Behavior

- If `IntersectionObserver` is absent, add the final reveal class to all skill items and horizontal slides immediately.
- If GSAP is absent, local skill and SVG CSS still render content; the existing horizontal controller’s broader dependency risk will be documented in the post-implementation audit rather than expanded in this repair.
- If reduced motion is requested, all repaired animations resolve immediately.
- If an evidence image fails to load, the text claim and accessible link label remain readable; no remote fallback image will be used for certificates.

## 9. Non-Goals

This repair will not:

- rebuild the mobile navigation;
- fix the separate mobile 100vh timeline clipping issue identified in the architecture audit;
- refactor the full 2,700+ line HTML into modules;
- replace Webflow, Lenis, GSAP, anime.js, or Unicorn Studio;
- add a backend, database, user accounts, or a CMS;
- add a tutoring call-to-action;
- invent physics evidence that has not been supplied;
- redesign the four divider SVG motifs;
- change the overall desktop horizontal-scroll choreography.

Those items remain candidates for the detailed follow-up architecture improvement report.

## 10. Acceptance Criteria

The repair is accepted when:

1. The four red skill icons and all card borders/dividers visibly animate once on entry.
2. Each horizontal divider SVG builds over approximately 2.8–3 seconds and does not finish before becoming visually prominent.
3. The final horizontal pair has no exposed background seam at tested desktop widths.
4. Current Focus has no label/body overlap at tested widths.
5. `的交叉地带。` is a separate authored and rendered waterfall line.
6. The accepted English, competition, and institute copy revisions are present.
7. Both public certificate derivatives are flattened and privacy-safe.
8. All source-level tests pass.
9. Browser verification passes at all listed viewports.
10. The post-implementation report distinguishes repaired issues from remaining architectural risks.
