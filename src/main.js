import { createAnimationRuntime } from "./runtime/animation-runtime.js";
import { createScrollController } from "./runtime/scroll-controller.js";
import { registerProjectReveals } from "./motion/project-reveals.js";
import { registerCustomCursor } from "./interactions/custom-cursor.js";
import { registerContactCopy } from "./interactions/contact-copy.js";
import { registerAnchorScroll } from "./interactions/anchor-scroll.js";
import { registerNavigationEffects } from "./interactions/navigation-effects.js";
import { registerHorizontalLayout } from "./motion/horizontal-layout.js";
import { registerHorizontalReveals } from "./motion/horizontal-reveals.js";
import { createOneShotReveals } from "./motion/one-shot-reveals.js";
import { registerPreloader } from "./motion/preloader.js";

const runtime = createAnimationRuntime(window);
const scrollController = createScrollController({ runtime });

export const appContext = { runtime, scrollController };

registerHorizontalLayout(appContext);
registerHorizontalReveals(appContext);
registerProjectReveals(appContext);
registerCustomCursor(appContext);
registerContactCopy(appContext);
registerAnchorScroll(appContext);
registerNavigationEffects(appContext);
const oneShotReveals = createOneShotReveals(appContext);
Object.assign(appContext, { oneShotReveals });
registerPreloader(appContext);
