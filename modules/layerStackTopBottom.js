import { BREAKPOINT } from "../utils/constant.js";

// Make animation functions
function createLayerStackAnimation({
  duration = 0.5,
  ease = "power2.out",
  start = "top 50%",
  end = "top top",
  scrub = 1,
  filter = "brightness(50%) blur(10px)",
  scale = 0.98,
} = {}) {
  const topLayer = document.querySelector('[data-layer="top"]');
  const bottomLayer = document.querySelector('[data-layer="bottom"]');

  if (!topLayer || !bottomLayer) return;

  return gsap.to(topLayer, {
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

// Strategies functions
function mobileConfig() {
  createLayerStackAnimation({
    filter: "brightness(70%) blur(4px)",
    scale: 0.98,
  });
}

function desktopConfig() {
  createLayerStackAnimation();
}

const AnimationStrategies = {
  [BREAKPOINT.MOBILE]: mobileConfig,
  [BREAKPOINT.TABLET]: desktopConfig,
  [BREAKPOINT.SMALL_DESKTOP]: desktopConfig,
  [BREAKPOINT.LARGE_DESKTOP]: desktopConfig,
};

export function layerStackTopBottom(context) {
  const { viewportName, isMotionReduced } = context;

  //isMotionReduced for next update

  const animaiton = AnimationStrategies[viewportName]();
  if (!animaiton) return;
  animaiton();
}
