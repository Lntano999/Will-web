function resolveNativeTop(target, globals) {
  if (typeof target === "number") return target;
  if (target?.getBoundingClientRect) {
    return target.getBoundingClientRect().top + (globals.scrollY ?? 0);
  }
  return 0;
}

export function createScrollController({
  runtime,
  globals = globalThis,
  document = globalThis.document,
}) {
  let instance = null;
  let tickerCallback = null;
  let scrollListener = null;

  const resetNativeScroll = () => globals.scrollTo?.(0, 0);
  const resetScroll = () => {
    resetNativeScroll();
    instance?.scrollTo?.(0, { immediate: true });
  };
  const handleBeforeUnload = () => resetNativeScroll();
  const handlePreloaderReleased = () => instance?.start?.();
  const handleDomReady = () => resetScroll();

  if (globals.location?.hash) {
    globals.history?.replaceState?.(
      "",
      document?.title ?? "",
      `${globals.location.pathname}${globals.location.search}`,
    );
  }
  globals.addEventListener?.("beforeunload", handleBeforeUnload);

  if (runtime?.Lenis) {
    instance = new runtime.Lenis();

    if (runtime.ScrollTrigger?.update && instance.on) {
      scrollListener = runtime.ScrollTrigger.update;
      instance.on("scroll", scrollListener);
    }

    if (runtime.gsap?.ticker?.add && instance.raf) {
      tickerCallback = (time) => instance.raf(time * 1000);
      runtime.gsap.ticker.add(tickerCallback);
      runtime.gsap.ticker.lagSmoothing?.(0);
    }

    instance.scrollTo?.(0, { immediate: true });
    if (document?.documentElement?.classList?.contains("preloader-released")) {
      instance.start?.();
    } else {
      instance.stop?.();
    }

    globals.addEventListener?.("preloader:released", handlePreloaderReleased);
    document?.addEventListener?.("DOMContentLoaded", handleDomReady);
  }

  return {
    isSmooth: Boolean(instance),
    instance,
    start() {
      instance?.start?.();
    },
    stop() {
      instance?.stop?.();
    },
    scrollTo(target, options = {}) {
      if (instance) {
        instance.scrollTo?.(target, options);
        return;
      }

      globals.scrollTo?.({
        top: resolveNativeTop(target, globals),
        behavior: options.behavior ?? "auto",
      });
    },
    destroy() {
      globals.removeEventListener?.("beforeunload", handleBeforeUnload);
      globals.removeEventListener?.(
        "preloader:released",
        handlePreloaderReleased,
      );
      document?.removeEventListener?.("DOMContentLoaded", handleDomReady);

      if (tickerCallback) runtime.gsap?.ticker?.remove?.(tickerCallback);
      if (scrollListener) instance?.off?.("scroll", scrollListener);
      instance?.destroy?.();
    },
  };
}
