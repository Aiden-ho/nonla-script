import { BREAKPOINT, GSAPCONFIG } from "../utils/constant.js";
import { getMotionOptByViewport, warn } from "../utils/helpers.js";

const DEFAULT_OPT = {
  ease: GSAPCONFIG.EASE,
  start: "top 80%",
  end: "top top",
  scrub: GSAPCONFIG.SCRUB,
  filter: "brightness(50%) blur(10px)",
  scale: 0.98,
};
const OVERRIDE_OPT = {
  [BREAKPOINT.MOBILE]: {
    ...DEFAULT_OPT,
    filter: "brightness(70%) blur(4px)",
  },
};

// Make animation functions
function createLayerStackAnimation(motionConfig = {}) {
  const topLayer = document.querySelector('[data-layer="top"]');
  const bottomLayer = document.querySelector('[data-layer="bottom"]');

  if (!topLayer || !bottomLayer) {
    warn("[LayerStackTopBottom]", "Missing DOM", { topLayer, bottomLayer });
    console.warn();
    return null;
  }

  const { ease, start, end, scrub, filter, scale } = motionConfig;

  gsap.to(topLayer, {
    ease,
    scale,
    startAt: { filter: "brightness(100%) blur(0px)" },
    filter,
    scrollTrigger: {
      trigger: bottomLayer,
      start,
      end,
      scrub,
    },
  });
}

export function layerStackTopBottomInit(config = {}) {
  const { viewportName } = config;

  const motionConfig = getMotionOptByViewport(
    viewportName,
    DEFAULT_OPT,
    OVERRIDE_OPT
  );

  createLayerStackAnimation(motionConfig);
}
