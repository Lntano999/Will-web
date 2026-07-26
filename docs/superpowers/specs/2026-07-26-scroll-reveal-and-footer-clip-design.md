# Scroll Reveal and Footer Clip Design

## Goal

Unify the three horizontal timeline groups under one one-shot reveal behavior, add one-shot line-mask reveals to the homepage and footer right-side white copy, and prevent the final period in the footer’s large `WILL.` mark from being clipped.

## Confirmed Interaction Rules

- Every reveal animation plays at most once per page load.
- After a reveal completes, its content stays visible and fixed.
- Scrolling away and returning from either direction must not reset or replay the animation.
- The first horizontal group may retain its initial wrapper-scale timing gate, but after that gate opens it must use the same reveal state and animation primitives as the other two groups.
- Existing animation duration, easing, stagger, arrow motion, and SVG drawing should remain visually consistent unless a small timing adjustment is required to eliminate a duplicate trigger.

## Horizontal Timeline Architecture

The existing first group uses a dedicated `splitPlayed` flag and a separate `SplitText` pipeline, while the later groups use `slideDataMap` and an `IntersectionObserver`. This split is the source of behavioral drift.

All three groups will be registered in one `slideDataMap`:

- Each slide stores its text lines, SVG paths, arrows, and `played` state.
- The first slide accepts both `.split-timeline` and shared horizontal targets.
- The wrapper-scale timeline only unlocks the first slide and requests its initial play.
- The shared observer plays any unlocked, unplayed slide when its visibility threshold is reached.
- Leaving a slide does not animate content out and does not set `played` back to `false`.
- Once `played` becomes `true`, the slide remains in its final visible state for the rest of the page lifecycle.

This preserves the first slide’s introductory composition while removing its separate animation lifecycle.

## Homepage and Footer White-Copy Reveals

The homepage right-side Chinese copy and footer upper-right English copy will use a shared one-shot line-reveal controller.

The controller will:

- Split each target into masked lines with `SplitText`.
- Initialize lines below their masks with zero opacity.
- Play the lines upward with the existing `power3.out` visual language and a short stagger.
- Mark the target as played and retain its final state.
- Never reset on intersection exit.

The homepage reveal must remain synchronized with the preloader exit. The preloader will invoke the controller’s play method instead of applying a second root-level opacity/translation animation. The footer reveal will start when the footer copy first reaches its visibility threshold.

## Footer `WILL.` Period Safety

The clipping is caused by the large footer wordmark sitting flush against a footer ancestor that intentionally uses `overflow: hidden`. Inner wrappers already allow overflow, so changing global overflow would be ineffective and could introduce an extra page scrollbar.

The fix will reserve a small local bottom safety area on the large footer clipping-text element. The adjustment must:

- Keep `#contact.footer` overflow containment intact.
- Move the glyph baseline far enough above the footer boundary to show the complete period.
- Avoid changing the homepage wordmark or navigation logo.
- Avoid increasing the document’s scrollable height.

The exact padding or local offset will be chosen from browser geometry measurements at the current desktop viewport and checked at responsive breakpoints.

## Failure Handling and Compatibility

- If `SplitText` is unavailable, the original unsplit copy remains visible rather than being hidden.
- Mobile retains the same one-shot semantics; the first slide’s mobile trigger unlocks and plays once.
- `prefers-reduced-motion` should show final content without staggered movement.
- Existing blue clipping-text rules remain isolated to actual moving text lines and must not leak onto mask ancestors.

## Verification

Automated source-level regression tests will assert:

- The horizontal controller no longer resets `played` on exit.
- The first and later horizontal groups are registered through the shared controller.
- Both white-copy targets use the reusable one-shot line-reveal controller.
- The footer wordmark has a scoped period-safety rule while footer overflow containment remains enabled.

Browser verification will cover:

1. Scroll downward through all three horizontal groups and confirm each reveals once.
2. Scroll upward through all three groups and confirm all content remains visible without replay.
3. Confirm the homepage Chinese copy reveals through line masks during preloader exit and remains fixed.
4. Confirm the footer English copy reveals once on entry and remains fixed after leaving and returning.
5. Confirm the footer period is fully visible with no additional horizontal or vertical scrollbar.
6. Confirm blue clipping-text masks and the existing small-text waterfall remain intact.
