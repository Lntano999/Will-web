export function createOneShotReveals({
  runtime,
  document = globalThis.document,
  window = globalThis.window,
}) {
  const { gsap } = runtime;
  const targets = {
    hero: document.querySelector(".home-hero .one-shot-white-reveal"),
    footer: document.querySelector("#contact .one-shot-white-reveal"),
  };

  function createReveal(element, options = {}) {
    if (!element || !gsap) return null;

    const { duration = 0.8, stagger = 0.08 } = options;
    const lines = Array.from(
      element.querySelectorAll(".one-shot-white-line"),
    );
    if (!lines.length) return null;
    let played = false;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      gsap.set(lines, { y: "0%", opacity: 1 });
      played = true;
    } else {
      gsap.set(lines, { y: "120%", opacity: 0 });
    }

    function play(timeline, position) {
      if (played) return;
      played = true;
      const vars = {
        y: "0%",
        opacity: 1,
        duration,
        ease: "power3.out",
        stagger,
      };
      if (timeline) timeline.to(lines, vars, position);
      else gsap.to(lines, vars);
    }

    return { element, lines, play, get played() { return played; } };
  }

  const hero = createReveal(targets.hero);
  const footer = createReveal(targets.footer, {
    duration: 1.05,
    stagger: 0.14
  });

  if (footer && !footer.played) {
    if (!window.IntersectionObserver) {
      footer.play();
    } else {
      const observer = new window.IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.25) return;
            footer.play();
            observer.unobserve(entry.target);
          });
        },
        { threshold: [0, 0.1, 0.25, 0.5] },
      );
      observer.observe(footer.element);
    }
  }

  return { hero, footer };
}
