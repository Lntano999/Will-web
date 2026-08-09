export function registerAnchorScroll({
  scrollController,
  document = globalThis.document,
  window = globalThis.window,
}) {
  document.addEventListener("DOMContentLoaded", () => {
    if (!scrollController.isSmooth) return;

    const allAnchorLinks = document.querySelectorAll('a[href^="#"]');
    allAnchorLinks.forEach((link) => {
      const targetId = link.getAttribute("href");
      if (!targetId?.startsWith("#") || targetId === "#") return;
      link.setAttribute("data-target", targetId);

      link.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        const actualTargetId = this.getAttribute("data-target");
        if (!actualTargetId) return;
        window.history?.replaceState?.(null, "", actualTargetId);

        if (actualTargetId === "#WILL.") {
          const marqueeElement = document.querySelector(".item--marquee");
          const projectsElement = document.getElementById("projects");
          if (!marqueeElement || !projectsElement) return;
          let wrapperElement = marqueeElement.parentElement;
          while (wrapperElement && !wrapperElement.contains(projectsElement)) {
            wrapperElement = wrapperElement.parentElement;
          }
          if (!wrapperElement) return;
          const absoluteBottom =
            wrapperElement.getBoundingClientRect().bottom + window.scrollY;
          const targetScrollY =
            absoluteBottom - window.innerHeight + 40 - 250;
          const currentPosition = window.scrollY;
          const distance = Math.abs(targetScrollY - currentPosition);
          const dynamicDuration = Math.min(1.8, 0.8 + distance / 3000);
          scrollController.scrollTo(targetScrollY, {
            duration: dynamicDuration,
            lock: true,
            easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -12 * t)),
          });
          return;
        }

        const targetElement = document.querySelector(actualTargetId);
        if (!targetElement) return;

        const targetPosition =
          targetElement.getBoundingClientRect().top + window.scrollY;
        const currentPosition = window.scrollY;
        const distance = Math.abs(targetPosition - currentPosition);
        const dynamicDuration = Math.min(1.8, 0.8 + distance / 3000);

        let offsetValue = -120;
        if (actualTargetId === "#identity") {
          const horizontalLine = targetElement.querySelector(".h-line");
          if (horizontalLine) {
            const targetTop =
              targetElement.getBoundingClientRect().top + window.scrollY;
            const lineBottom =
              horizontalLine.getBoundingClientRect().bottom + window.scrollY;
            offsetValue = lineBottom - targetTop + 1;
          } else {
            offsetValue = 0;
          }
        } else if (
          actualTargetId === "#research" ||
          actualTargetId === "#tech" ||
          actualTargetId === "#contact"
        ) {
          offsetValue = 0;
        } else if (actualTargetId === "#projects") {
          const contactElement = document.querySelector("#contact");
          if (contactElement) {
            const projectsTop =
              targetElement.getBoundingClientRect().top + window.scrollY;
            const contactTop =
              contactElement.getBoundingClientRect().top + window.scrollY;
            offsetValue = contactTop - projectsTop - window.innerHeight;
          } else {
            offsetValue = 0;
          }
        }

        scrollController.scrollTo(targetElement, {
          duration: dynamicDuration,
          offset: offsetValue,
          lock: true,
          easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -12 * t)),
        });
      });
    });
  });
}
