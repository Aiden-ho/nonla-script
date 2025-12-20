import { BREAKPOINT } from "../utils/constant.js";
import { getMotionOptByViewport } from "../utils/helpers.js";

const DEFAULT_OPT = {
  duration: 0.5,
  ease: "power2.out",
  start: "top 50%",
  end: "top top",
  scrub: 1,
  filter: "brightness(50%) blur(10px)",
  scale: 0.98,
};
const OVERRIDE_OPT = {
  [BREAKPOINT.MOBILE]: {
    ...DEFAULT_OPT,
    filter: "brightness(70%) blur(4px)",
    scale: 0.98,
  },
};

// Make animation functions
function createLayerStackAnimation(motionConfig = {}) {
  const topLayer = document.querySelector('[data-layer="top"]');
  const bottomLayer = document.querySelector('[data-layer="bottom"]');

  if (!topLayer || !bottomLayer) {
    console.warn("[LayerStackTopBottom] Missing DOM");
    return null;
  }

  const { duration, ease, start, end, scrub, filter, scale } = motionConfig;

  gsap.to(topLayer, {
    ease,
    scale,
    duration,
    startAt: { filter: "brightness(100%) blur(0px)" },
    filter,
    immediateRender: false,
    duration,
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
