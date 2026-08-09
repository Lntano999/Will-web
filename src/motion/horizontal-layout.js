export function registerHorizontalLayout({
  runtime,
  document = globalThis.document,
  window = globalThis.window,
}) {
  const { gsap, ScrollTrigger, SplitText } = runtime;

  window.addEventListener("load", () => {
    if (!gsap || !ScrollTrigger) {
      document.body.classList.add("horizontal-reveal-immediate");
      document
        .querySelectorAll(".h-slide")
        .forEach((slide) => slide.classList.add("scroll-reveal-inview"));
      return;
    }

    const section = document.querySelector(".horizontal-section");
    const wrapper = section?.querySelector(".horizontal-wrapper");
    const track = section?.querySelector(".track");
    const textPin = document.querySelector(".horizontal-text-pin");
    if (!section || !wrapper || !track) return;
    const isMobile = window.matchMedia("(max-width: 479px)").matches;
    const splitElems = document.querySelectorAll(".split-timeline");
    let allLines = [];
    let splitPlayed = false;

    if (splitElems.length && SplitText) {
      const splits = [];
      splitElems.forEach((element) => {
        const split = new SplitText(element, {
          type: "lines",
          mask: "lines",
          linesClass: "split-text-line",
        });
        splits.push(split);
      });
      allLines = splits.flatMap((split) => split.lines);
      gsap.set(allLines, { y: "140%", opacity: 0 });
    }

    const firstSlide = section.querySelector(".h-slide");
    const firstArrows = firstSlide?.querySelectorAll(".h-arrow");
    if (firstArrows?.length) gsap.set(firstArrows, { yPercent: 150 });

    function playIntroAnim() {
      if (splitPlayed) return;
      splitPlayed = true;
      document.body.classList.add("h-slide-1-ready");
      if (allLines.length) {
        gsap.to(allLines, {
          y: "0%",
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.05,
        });
      }
      if (firstArrows?.length) {
        gsap.to(firstArrows, {
          yPercent: 0,
          duration: 0.7,
          ease: "power3.out",
        });
      }
    }

    if (isMobile) {
      gsap.set(wrapper, { scale: 1, x: 0, y: 0 });
      gsap.set(track, { x: 0 });
      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        once: true,
        onEnter: playIntroAnim,
      });
      return;
    }

    const getViewportWidth = () => section.clientWidth;
    const getTotalDistance = () =>
      Math.max(0, Math.ceil(track.scrollWidth - getViewportWidth()) + 1);
    gsap.set(wrapper, { scale: 0, x: 0, y: 0 });
    gsap.set(track, { x: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () =>
          "+=" + (getTotalDistance() + window.innerHeight * 0.5),
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    });

    tl.addLabel("scaleStart");
    tl.to(wrapper, { scale: 1, x: "50vw", duration: 0.3 });
    tl.call(playIntroAnim, null, ">");
    tl.addLabel("scaleEnd");
    tl.to(wrapper, { x: "0vw", duration: 0.2 });
    tl.to(track, { x: () => -getTotalDistance(), duration: 0.5 });
    tl.to({}, { duration: 0.15 });

    if (textPin) {
      ScrollTrigger.create({
        trigger: section,
        start: "top 20%",
        end: () => {
          const scrollTrigger = tl.scrollTrigger;
          const scaleStart =
            scrollTrigger.start +
            tl.labels.scaleStart * (scrollTrigger.end - scrollTrigger.start);
          const scaleEnd =
            scrollTrigger.start +
            tl.labels.scaleEnd * (scrollTrigger.end - scrollTrigger.start);
          const scaleDuration = scaleEnd - scaleStart;
          return scaleStart + scaleDuration * 0.7;
        },
        pin: textPin,
        pinSpacing: false,
        scrub: true,
        anticipatePin: 1,
      });
    }
  });
}
