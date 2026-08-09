export function registerPreloader({
  runtime,
  oneShotReveals,
  document = globalThis.document,
  window = globalThis.window,
}) {
  const { anime, gsap } = runtime;
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  if (!anime || !gsap) {
    if (typeof window.releasePreloader === "function") {
      window.releasePreloader("animation-runtime-unavailable");
    } else {
      preloader.remove();
      document.querySelector(".navigation")?.classList.remove("pre-hidden");
    }
    return;
  }

  const curtainTop = preloader.querySelector(".pre-curtain--top");
  const curtainBot = preloader.querySelector(".pre-curtain--bot");
  const seam = preloader.querySelector(".pre-seam");
  const logoElement = preloader.querySelector(".pre-logo");
  const counterWrap = preloader.querySelector(".pre-counter-wrap");
  const counterElement = preloader.querySelector(".pre-counter__number");
  const readyElement = preloader.querySelector(".pre-ready-text");
  const progressCircle = preloader.querySelector(
    ".pre-circle-progress circle",
  );
  const dashedSvg = preloader.querySelector(".pre-circle-dashed");
  const corners = preloader.querySelectorAll(".pre-corner");
  const nav = document.querySelector(".navigation");
  const circumference = 2 * Math.PI * 90;

  anime.animate(corners, {
    opacity: [0, 1],
    translateY: [(element, index) => (index < 2 ? -10 : 10), 0],
    duration: 700,
    delay: anime.stagger(80, { start: 300 }),
    ease: "outQuart",
  });

  anime.animate(seam, {
    width: ["0px", "60px"],
    duration: 600,
    delay: 200,
    ease: "outQuart",
  });

  anime.animate(logoElement, {
    opacity: [0, 1],
    scale: [0.6, 1],
    duration: 800,
    delay: 400,
    ease: "outBack",
  });

  anime.animate(dashedSvg, {
    rotate: [0, 360],
    duration: 20000,
    ease: "linear",
    loop: true,
  });

  const counter = { value: 0 };
  const LOAD_DURATION = 2400;
  anime.animate(counter, {
    value: 100,
    duration: LOAD_DURATION,
    ease: "inOutCubic",
    onUpdate: () => {
      const value = Math.round(counter.value);
      counterElement.textContent = String(value).padStart(3, "0");
      progressCircle.style.strokeDashoffset =
        circumference * (1 - value / 100);
    },
    onComplete: startReadyPhase,
  });

  function startReadyPhase() {
    anime.animate(counterElement, {
      opacity: [1, 0],
      translateY: [0, -6],
      duration: 200,
      ease: "inQuad",
      onComplete: () => {
        counterElement.style.display = "none";
      },
    });
    anime.animate(readyElement, {
      opacity: [0, 1],
      translateY: [5, 0],
      duration: 400,
      delay: 150,
      ease: "outQuart",
    });
    anime.animate(logoElement, {
      scale: [1, 1.08, 1],
      duration: 500,
      delay: 150,
      ease: "inOutQuad",
    });
    anime.animate(seam, {
      width: ["60px", "100vw"],
      opacity: [1, 0.6],
      duration: 800,
      delay: 400,
      ease: "inOutQuart",
    });
    window.setTimeout(startExitTransition, 700);
  }

  function startExitTransition() {
    preloader.classList.add("is-leaving");

    anime.animate([logoElement, counterWrap], {
      opacity: 0,
      scale: 0.8,
      duration: 350,
      ease: "inQuart",
    });
    anime.animate(preloader.querySelectorAll(".pre-circles svg"), {
      opacity: 0,
      scale: 1.4,
      duration: 400,
      ease: "inQuart",
    });
    anime.animate(corners, {
      opacity: 0,
      duration: 250,
      ease: "inQuad",
    });
    anime.animate(seam, {
      opacity: 0,
      duration: 300,
      ease: "inQuad",
    });

    const background = document.querySelector(".background");
    const sectionHome = document.querySelector(".section-home");
    const heroClaim = document.querySelector(".home-hero .claim-m");
    const heroReveal = oneShotReveals?.hero;
    const heroLogo = document.querySelector(".test.w-embed");

    if (heroLogo) {
      gsap.set(heroLogo, {
        opacity: 0,
        y: 50,
        clipPath: "inset(100% -20% -20% -20%)",
      });
    }
    if (background) {
      gsap.set(background, {
        scale: 1.12,
        transformOrigin: "center center",
      });
    }
    if (sectionHome) {
      gsap.set(sectionHome, {
        scale: 1.12,
        transformOrigin: "center center",
      });
    }
    if (nav) {
      nav.classList.remove("pre-hidden");
      nav.style.opacity = "1";
      gsap.set(nav, { scale: 1.12, transformOrigin: "top center" });
      gsap.set(
        nav.querySelectorAll(
          ".nav--logo, .nav--item, .nav--buttons, .nav-burger",
        ),
        { opacity: 0, y: -15 },
      );
    }

    const exitTimeline = gsap.timeline({
      delay: 0.25,
      onComplete: finishPreloader,
    });

    exitTimeline.to(
      curtainTop,
      { yPercent: -100, duration: 1.2, ease: "power3.inOut" },
      0,
    );
    exitTimeline.to(
      curtainBot,
      { yPercent: 100, duration: 1.2, ease: "power3.inOut" },
      0,
    );

    const zoomElements = [];
    if (background) zoomElements.push(background);
    if (sectionHome) zoomElements.push(sectionHome);
    if (nav) zoomElements.push(nav);

    if (zoomElements.length > 0) {
      exitTimeline.to(
        zoomElements,
        {
          scale: 1,
          duration: 1.6,
          ease: "power3.out",
          clearProps: "scale,transformOrigin",
        },
        0.15,
      );
    }

    if (nav) {
      exitTimeline.to(
        nav.querySelectorAll(
          ".nav--logo, .nav--item, .nav--buttons, .nav-burger",
        ),
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          clearProps: "all",
        },
        0.3,
      );
    }

    if (heroLogo) {
      exitTimeline.to(
        heroLogo,
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(-20% -20% -20% -20%)",
          duration: 1.2,
          ease: "power4.out",
          clearProps: "all",
        },
        0.8,
      );
    }

    if (heroReveal) {
      heroReveal.play(exitTimeline, 1.0);
    } else if (heroClaim) {
      exitTimeline.fromTo(
        heroClaim,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          clearProps: "all",
        },
        1.0,
      );
    }
  }

  function finishPreloader() {
    if (typeof window.releasePreloader === "function") {
      window.releasePreloader("animation-complete");
    } else {
      preloader.remove();
      document.querySelector(".navigation")?.classList.remove("pre-hidden");
    }
  }
}
