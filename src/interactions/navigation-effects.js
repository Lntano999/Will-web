export function registerNavigationEffects({
  document = globalThis.document,
  window = globalThis.window,
}) {
  document.addEventListener("DOMContentLoaded", () => {
    const realLogo = document.querySelector(".nav--logo");
    if (realLogo) {
      const ghostLogo = realLogo.cloneNode(true);
      ghostLogo.classList.add("ghost-logo");
      document.body.appendChild(ghostLogo);

      realLogo.style.opacity = "0";
      realLogo.style.pointerEvents = "none";

      const syncPosition = () => {
        const rect = realLogo.getBoundingClientRect();
        ghostLogo.style.position = "fixed";
        ghostLogo.style.left = `${rect.left}px`;
        ghostLogo.style.top = `${rect.top}px`;
        ghostLogo.style.width = `${rect.width}px`;
        ghostLogo.style.height = `${rect.height}px`;
        ghostLogo.style.margin = "0";
      };

      window.addEventListener("resize", syncPosition);
      window.addEventListener("scroll", syncPosition);
      window.requestAnimationFrame(syncPosition);
      window.setTimeout(syncPosition, 100);
    }

    const root = document.querySelector(".navigation");
    if (!root) return;
    const nodes = root.querySelectorAll("a.nav-minimal");
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function wantsHoverBranch(element) {
      return element.matches(":hover") || element.matches(":focus-visible");
    }

    function clearPlay(element) {
      element.classList.remove(
        "is-elastic-play-hover",
        "is-elastic-play-rest",
      );
    }

    nodes.forEach((element) => {
      let down = false;

      element.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        down = true;
        try {
          element.setPointerCapture(event.pointerId);
        } catch {}
        clearPlay(element);
        element.classList.add("is-pressed");
      });

      function onRelease(event) {
        if (!down) return;
        down = false;
        try {
          element.releasePointerCapture(event.pointerId);
        } catch {}
        element.classList.remove("is-pressed");
        if (reduce) return;
        clearPlay(element);
        void element.offsetWidth;
        element.classList.add(
          wantsHoverBranch(element)
            ? "is-elastic-play-hover"
            : "is-elastic-play-rest",
        );
      }

      element.addEventListener("pointerup", onRelease);
      element.addEventListener("pointercancel", onRelease);
      element.addEventListener("lostpointercapture", onRelease);
      element.addEventListener("animationend", (event) => {
        if (
          event.animationName !== "elastic-bounce" &&
          event.animationName !== "elastic-bounce-rest"
        ) {
          return;
        }
        clearPlay(element);
      });
    });
  });
}
