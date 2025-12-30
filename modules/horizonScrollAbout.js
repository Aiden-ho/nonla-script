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
  holdEnd: 0.06,
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
    warn("[horizonScrollAbout]", "Missing ROOT DOM", { wrapper });
    return null;
  }

  const tracker = wrapper.querySelector('[data-horizon="tracker"]');
  const progress = wrapper.querySelector('[data-horizon="progress"]');
  const progress_value = progress?.querySelector("div");

  if (!tracker || !progress || !progress_value) {
    warn("[horizonScrollAbout]", "Missing ROOT DOM", {
      tracker,
      progress,
      progress_value,
    });
    return null;
  }

  const { scrub, ease, holdEnd } = motionConfig;

  const getAmount = () => getScrollAmount(wrapper, tracker);
  const getDistance = () => Math.abs(getAmount());
  const mainDuration = 1;
  const scroll_ratio = mainDuration + holdEnd;

  const tl = gsap.timeline({
    defaults: {
      ease, // make all tweens use a ease of none, feels nicer with working with scrub
    },
    scrollTrigger: {
      trigger: wrapper,
      start: "top top",
      end: () => `+=${getDistance() * scroll_ratio}`,
      pin: true,
      pinSpacing: true,
      scrub,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  tl.to(tracker, {
    x: () => getAmount(),
    duration: mainDuration,
  }).to(
    progress_value,
    {
      right: "0%",
      transformOrigin: "center left",
      duration: mainDuration,
    },
    "<"
  );
  tl.to({}, { duration: holdEnd });

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
