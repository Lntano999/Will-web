# Preloader Fail-Open Design

## Problem

The portfolio preloader depends on GSAP and anime.js loaded from external CDNs.
If either runtime is unavailable, the animation controller throws before the
counter advances and the full-screen overlay never leaves. Lenis initialization
can fail for the same reason and leave later scripts in an unsafe state.

## Approved behavior

- Preserve the existing animated preloader when its runtimes are available.
- Install a dependency-free release function before every external script.
- Release immediately when the animation controller detects a missing runtime.
- Release after eight seconds if a request or animation stalls unexpectedly.
- Make release idempotent, restore navigation, and resume smooth scrolling when
  Lenis exists.
- Keep the page usable with native scrolling when external runtimes are absent.

## Verification

- Static tests require the early release controller, runtime guards, and
  watchdog.
- Browser QA can block every external request deliberately.
- In offline QA, the page itself must remove the preloader and expose the
  navigation at all six supported responsive widths.
- Existing content, layout, evidence, and motion assertions must continue to
  pass.
