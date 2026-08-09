import { createAnimationRuntime } from "./runtime/animation-runtime.js";
import { createScrollController } from "./runtime/scroll-controller.js";
import { registerProjectReveals } from "./motion/project-reveals.js";

const runtime = createAnimationRuntime(window);
const scrollController = createScrollController({ runtime });

export const appContext = { runtime, scrollController };

registerProjectReveals(appContext);

// Transitional bridge for inline controllers. It is removed once scrolling
// consumers import the shared controller directly.
window.lenis = scrollController.instance ?? undefined;
