export function registerHorizontalReveals({
  runtime,
  document = globalThis.document,
  window = globalThis.window,
}) {
  const { gsap, SplitText } = runtime;

  window.addEventListener("load", () => {
    const slides = [...document.querySelectorAll(".h-slide")];
    if (!slides.length) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function revealSlidesImmediately() {
      document.body.classList.add("horizontal-reveal-immediate");
      slides.forEach((slide) =>
        slide.classList.add("scroll-reveal-inview"),
      );
      const splitLines = document.querySelectorAll(
        ".horizontal-section .split-text-line",
      );
      const arrows = document.querySelectorAll(".horizontal-section .h-arrow");
      if (gsap) {
        if (splitLines.length) {
          gsap.set(splitLines, { y: "0%", opacity: 1 });
        }
        if (arrows.length) gsap.set(arrows, { yPercent: 0 });
      }
    }

    if (!gsap || !SplitText || !window.IntersectionObserver) {
      revealSlidesImmediately();
      return;
    }

    const slideDataMap = new Map();
    const registeredSplits = [];

    try {
      slides.forEach((slide, index) => {
        const targets = slide.querySelectorAll(".split-horizontal");
        const svgPaths = slide.querySelectorAll(".svg-draw path");
        const arrows = slide.querySelectorAll(".h-arrow");
        const isFirst = index === 0;
        const isDivider = slide.classList.contains("side");
        if (!targets.length && !svgPaths.length && !arrows.length) return;
        let lines = [];
        if (targets.length) {
          const splits = [];
          targets.forEach((element) => {
            const split = new SplitText(element, {
              type: "lines",
              mask: "lines",
              linesClass: "split-text-line",
            });
            splits.push(split);
            registeredSplits.push(split);
          });
          lines = splits.flatMap((split) => split.lines);
          if (!prefersReducedMotion) {
            gsap.set(lines, { y: "140%", opacity: 0 });
          }
        }
        if (arrows.length && !prefersReducedMotion) {
          gsap.set(arrows, { yPercent: 150 });
        }
        slideDataMap.set(slide, {
          lines,
          svgPaths,
          arrows,
          isFirst,
          isDivider,
          played: false,
        });
      });

      if (!slideDataMap.size) {
        revealSlidesImmediately();
        return;
      }

      document.body.classList.add("h-horizontal-split-ready");
    } catch {
      registeredSplits.forEach((split) => {
        try {
          split.revert();
        } catch {}
      });
      revealSlidesImmediately();
      return;
    }

    if (prefersReducedMotion) {
      slideDataMap.forEach((data, slide) => {
        data.played = true;
        slide.classList.add("scroll-reveal-inview");
        if (data.lines.length) {
          gsap.set(data.lines, { y: "0%", opacity: 1 });
        }
        if (data.arrows.length) gsap.set(data.arrows, { yPercent: 0 });
      });
      return;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const slide = entry.target;
          const data = slideDataMap.get(slide);
          if (!data) return;
          const minRatio = data.isDivider ? 0.35 : 0.12;

          if (!entry.isIntersecting || entry.intersectionRatio < minRatio) {
            return;
          }

          slide.classList.add("scroll-reveal-inview");
          if (data.isFirst && !document.body.classList.contains("h-slide-1-ready")) return;
          if (data.played) return;
          data.played = true;
          if (data.lines.length) {
            gsap.to(data.lines, {
              y: "0%",
              opacity: 1,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.1,
            });
          }
          if (data.arrows.length) {
            gsap.to(data.arrows, {
              yPercent: 0,
              duration: 0.5,
              ease: "power3.out",
            });
          }
        });
      },
      { threshold: [0, 0.05, 0.1, 0.12, 0.25, 0.35, 0.5, 0.75] },
    );
    slideDataMap.forEach((_, slide) => observer.observe(slide));
  });
}
