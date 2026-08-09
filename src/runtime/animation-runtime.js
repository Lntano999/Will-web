export function createAnimationRuntime(globals = globalThis) {
  const gsap = globals.gsap ?? null;
  const ScrollTrigger = globals.ScrollTrigger ?? null;
  const SplitText = globals.SplitText ?? null;
  const anime = globals.anime ?? null;
  const Lenis = globals.Lenis ?? null;

  if (gsap) {
    const plugins = [SplitText, ScrollTrigger].filter(Boolean);
    if (plugins.length) gsap.registerPlugin(...plugins);
  }

  return { gsap, ScrollTrigger, SplitText, anime, Lenis };
}
