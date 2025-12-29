import { BREAKPOINT, GSAPCONFIG } from "../utils/constant.js";
import { getMotionOptByViewport, warn } from "../utils/helpers.js";

const ROOT_DOM = {
  tracker: '[data-horizon="tracker"]',
  wrapper: '[data-horizon="wrapper"]',
  progress: '[data-horizon="progress"]',
};
const DEFAULT_OPT = {
  scrub: GSAPCONFIG.SCRUB,
  ease: GSAPCONFIG.EASE,
  startHold: 0.02,
  endHold: 0.02,
};
const OVERRIDE_OPT = {
  [BREAKPOINT.MOBILE]: null,
};
let horizonTL = null;

function killHorizon() {
  horizonTL?.scrollTrigger?.kill(true);
  horizonTL?.kill();
  horizonTL = null;
}

function getScrollAmount(wrapper, tracker) {
  const wrapperSize = wrapper.clientWidth;
  const trackSize = tracker.scrollWidth;

  const diff = trackSize - wrapperSize;

  if (diff <= 0) return 0;

  return -diff; // âm để slide theo chiều ngược scroll
}

// Make animation functions
function createSlideScrollAnimation(motionConfig = {}) {
  const wrapper = document.querySelector(ROOT_DOM.wrapper);

  if (!wrapper) {
    warn("[horizonScrollAbout]", "Missing DOM", { wrapper });
    return null;
  }

  const tracker = wrapper.querySelector('[data-horizon="tracker"]');
  const progress = wrapper.querySelector('[data-horizon="progress"]');
  const progress_value = progress?.querySelector("div");

  if (!tracker || !progress || !progress_value) {
    console.warn("[horizonScrollAbout] Missing DOM");
    return null;
  }

  const { scrub, ease, startHold, endHold } = motionConfig;

  const getAmount = () => getScrollAmount(wrapper, tracker);
  const getDistance = () => Math.abs(getAmount());
  const totalEnd = 1 + startHold + endHold;

  const tl = gsap.timeline({
    defaults: {
      ease, // make all tweens use a ease of none, feels nicer with working with scrub
    },
    scrollTrigger: {
      trigger: wrapper,
      start: "top top",
      end: () => `+=${getDistance() * totalEnd}`,
      pin: true,
      pinSpacing: true,
      scrub,
      invalidateOnRefresh: true,
    },
  });

  tl.to({}, { duration: startHold });

  tl.to(tracker, {
    x: () => getAmount(),
  }).to(
    progress_value,
    {
      right: "0%",
      transformOrigin: "center left",
    },
    "<"
  );

  tl.to({}, { duration: endHold });

  return tl;
}

export function horizonScrollAboutInit(config = {}) {
  const { viewportName } = config;

  const motionConfig = getMotionOptByViewport(
    viewportName,
    DEFAULT_OPT,
    OVERRIDE_OPT
  );

  if (motionConfig === null) {
    killHorizon();
    return;
  }

  killHorizon();
  horizonTL = createSlideScrollAnimation(motionConfig);
}
