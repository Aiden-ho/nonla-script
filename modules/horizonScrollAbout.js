import { BREAKPOINT, DIRECTION } from "../utils/constant.js";

function getSlideScrollElements() {
  const tracker = document.querySelector('[data-horizon="tracker"]');
  const wrapper = document.querySelector('[data-horizon="wrapper"]');
  const progress = document.querySelector('[data-horizon="progress"]');
  const progress_value = progress.querySelector("div");

  if (!tracker || !wrapper || !progress || !progress_value) return null;

  return { tracker, wrapper, progress_value };
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
function createSlideScrollAnimation({
  direc = DIRECTION.HORIZON,
  scrub = 1,
  ease = "none",
} = {}) {
  const els = getSlideScrollElements();
  if (!els) return;

  const { tracker, wrapper, progress_value } = els;

  const isHorizon = direc === DIRECTION.HORIZON;
  const axis = isHorizon ? "x" : "y";

  const tl = gsap.timeline({
    defautls: {
      ease, // make all tweens use a ease of none, feels nicer with working with scrub
    },
    scrollTrigger: {
      trigger: wrapper,
      start: "top top",
      end: () => `+=${getScrollAmount(direc, wrapper, tracker) * -1}`,
      pin: true,
      pinSpacing: true,
      scrub,
    },
  });

  return tl
    .to(tracker, {
      [axis]: getScrollAmount(direc, wrapper, tracker),
    })
    .from(
      progress_value,
      {
        scaleX: 0,
        transformOrigin: "center left",
      },
      "<"
    );
}

// Strategies functions
function mobileConfig() {
  createSlideScrollAnimation({ direc: DIRECTION.VERTICAL });
}

function desktopConfig() {
  createSlideScrollAnimation();
}

const AnimationStrategies = {
  [BREAKPOINT.MOBILE]: mobileConfig,
  [BREAKPOINT.TABLET]: desktopConfig,
  [BREAKPOINT.SMALL_DESKTOP]: desktopConfig,
  [BREAKPOINT.LARGE_DESKTOP]: desktopConfig,
};

export function horizonScrollAbout(context) {
  const { viewportName, isMotionReduced } = context;

  //isMotionReduced for next update

  const animaiton = AnimationStrategies[viewportName]();
  if (!animaiton) return;
  animaiton();
}
