export function registerProjectReveals({
  runtime,
  document = globalThis.document,
  window = globalThis.window,
}) {
  const { gsap, ScrollTrigger } = runtime;

  window.addEventListener("load", () => {
    const originalProjectList = document.querySelector(".use-case__list");
    if (originalProjectList) {
      const clonedProjectList = originalProjectList.cloneNode(true);
      originalProjectList.parentNode.replaceChild(
        clonedProjectList,
        originalProjectList,
      );

      const allProjectElements = clonedProjectList.querySelectorAll("*");
      allProjectElements.forEach((el) => {
        if (el.style.opacity === "0" || el.style.opacity === 0) {
          el.style.opacity = "";
        }
        if (el.style.transform) el.style.transform = "";
      });

      if (!gsap || !ScrollTrigger) return;

      const containers = clonedProjectList.querySelectorAll(
        ".use-case__img-container",
      );
      containers.forEach((container) => {
        const mask = container.querySelector(".use-case__img-mask");
        const img = container.querySelector(".use-case__img-item");

        const parentBlock = container.closest(".use-case__block");
        const textTop = parentBlock.querySelector(".use-case__block-top");
        const allParagraphs = parentBlock.querySelectorAll("p.use-case-text");
        const textDesc =
          allParagraphs.length > 0
            ? allParagraphs[allParagraphs.length - 1]
            : null;

        const textElements = [];
        if (textTop) textElements.push(textTop);
        if (textDesc) textElements.push(textDesc);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: parentBlock,
            start: "top 75%",
            once: true,
          },
        });

        if (mask && img) {
          tl.fromTo(
            mask,
            { clipPath: "inset(50%)" },
            {
              clipPath: "inset(0%)",
              duration: 2.5,
              ease: "power2.inOut",
            },
            0,
          );
          tl.fromTo(
            img,
            { scale: 1.4 },
            { scale: 1, duration: 2.5, ease: "power2.inOut" },
            0,
          );
        }

        if (textElements.length > 0) {
          tl.fromTo(
            textElements,
            {
              clipPath:
                "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
              y: 40,
              opacity: 0,
            },
            {
              clipPath:
                "polygon(0% -50%, 100% -50%, 100% 150%, 0% 150%)",
              y: 0,
              opacity: 1,
              duration: 1.5,
              stagger: 0.2,
              ease: "power3.out",
              clearProps: "clipPath,transform,opacity",
            },
            1.0
          );
        }
      });
    }

    ScrollTrigger?.refresh();
  });
}
