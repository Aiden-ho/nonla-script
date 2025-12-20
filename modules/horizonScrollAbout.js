import { BREAKPOINT, DIRECTION } from "../utils/constant.js";
import { getMotionOptByViewport } from "../utils/helpers.js";

const DEFAULT_OPT = { direc: DIRECTION.HORIZON, scrub: 1, ease: "none" };
const OVERRIDE_OPT = {
  [BREAKPOINT.MOBILE]: null,
};
let horizonTL = null;

function killHorizon() {
  horizonTL?.scrollTrigger?.kill(true);
  horizonTL?.kill();
  horizonTL = null;
}

function getScrollAmount(direc, wrapper, tracker) {
  const isHorizon = direc === DIRECTION.HORIZON;

  const wrapperSize = isHorizon ? wrapper.clientWidth : wrapper.clientHeight;
  const trackSize = isHorizon ? tracker.scrollWidth : tracker.scrollHeight;

  const diff = trackSize - wrapperSize;

  if (diff <= 0) return 0;

  return -diff; // âm để slide theo chiều ngược scroll
}

// Make animation functions
function createSlideScrollAnimation(motionConfig = {}) {
  const tracker = document.querySelector('[data-horizon="tracker"]');
  const wrapper = document.querySelector('[data-horizon="wrapper"]');
  const progress = document.querySelector('[data-horizon="progress"]');
  const progress_value = progress?.querySelector("div");

  if (!tracker || !wrapper || !progress || !progress_value) {
    console.warn("[horizonScrollAbout] Missing DOM");
    return null;
  }

  const { direc, scrub, ease } = motionConfig;

  const isHorizon = direc === DIRECTION.HORIZON;
  const axis = isHorizon ? "x" : "y";

  const getAmount = () => getScrollAmount(direc, wrapper, tracker);
  const getDistance = () => Math.abs(getAmount());

  const tl = gsap.timeline({
    defaults: {
      ease, // make all tweens use a ease of none, feels nicer with working with scrub
    },
    scrollTrigger: {
      trigger: wrapper,
      start: "top top",
      end: () => `+=${getDistance()}`,
      pin: true,
      pinSpacing: true,
      scrub,
      invalidateOnRefresh: true,
    },
  });

  tl.to(tracker, {
    [axis]: () => getAmount(),
  }).to(
    progress_value,
    {
      right: "0%",
      transformOrigin: "center left",
    },
    "<"
  );

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
