export function registerCustomCursor({
  runtime,
  document = globalThis.document,
  window = globalThis.window,
}) {
  const { gsap, ScrollTrigger } = runtime;

  document.addEventListener("DOMContentLoaded", () => {
    if (!gsap || !ScrollTrigger) return;

    const root = document.querySelector(".button-big");
    const hero = document.querySelector(".home-hero");
    const nav = document.querySelector(".navigation");

    if (!root || !hero) return;
    if (/Mobi|Android/i.test(window.navigator.userAgent)) return;

    const ACTIVATION_DELAY = 1000;
    let delayOver = false;
    window.setTimeout(() => {
      delayOver = true;
    }, ACTIVATION_DELAY);

    const setX = gsap.quickTo(root, "x", {
      duration: 0.3,
      ease: "power3.out",
    });
    const setY = gsap.quickTo(root, "y", {
      duration: 0.3,
      ease: "power3.out",
    });

    let isOverNav = false;
    gsap.set(root, { scale: 0, pointerEvents: "none" });

    function getHeroVisibleRatio() {
      const rect = hero.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
      const clamped = Math.max(0, Math.min(visible, rect.height));
      return rect.height > 0 ? clamped / rect.height : 0;
    }

    function shouldBeActive() {
      if (!delayOver || isOverNav) return false;
      return getHeroVisibleRatio() >= 0.5;
    }

    function activateCursor() {
      if (!shouldBeActive()) return;
      hero.classList.add("cursor-replaced");
      gsap.to(root, { scale: 1, duration: 0.5, ease: "quart.out" });
    }

    function deactivateCursor() {
      hero.classList.remove("cursor-replaced");
      gsap.to(root, { scale: 0, duration: 0.4, ease: "quart.out" });
    }

    if (nav) {
      nav.addEventListener("mouseenter", () => {
        isOverNav = true;
        deactivateCursor();
      });
      nav.addEventListener("mouseleave", () => {
        isOverNav = false;
      });
    }

    ScrollTrigger.observe({
      type: "pointer",
      onMove: ({ x, y }) => {
        if (!shouldBeActive()) {
          deactivateCursor();
          return;
        }
        setX(x);
        setY(y);
        activateCursor();
      },
    });

    window.addEventListener("scroll", () => {
      if (!shouldBeActive()) deactivateCursor();
    });

    const targetHref = root.getAttribute("href") || root.dataset.href;
    if (targetHref) {
      hero.addEventListener("click", (event) => {
        if (!shouldBeActive()) return;
        if (event.target.closest("a, button")) return;
        window.location.href = targetHref;
      });
    }
  });
}
