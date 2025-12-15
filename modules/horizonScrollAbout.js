import { BREAKPOINT, DIRECTION } from "../utils/constant.js";
import { createResizeScheduler } from "../utils/helpers.js";

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
  run = true,
} = {}) {
  if (!run) return;

  const tracker = document.querySelector('[data-horizon="tracker"]');
  const wrapper = document.querySelector('[data-horizon="wrapper"]');
  const progress = document.querySelector('[data-horizon="progress"]');
  const progress_value = progress.querySelector("div");

  if (!tracker || !wrapper || !progress || !progress_value) return null;

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
  }).from(
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
  createSlideScrollAnimation({ direc: DIRECTION.VERTICAL, run: false });
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

export function horizonScrollAbout(config) {
  const { viewportName, isMotionReduced } = config;

  //isMotionReduced for next update

  const animation = AnimationStrategies[viewportName];
  if (!animation) return;
  animation();

  if (viewportName === BREAKPOINT.MOBILE) return;

  const scheduleAnimation = createResizeScheduler({
    targetElement: document.querySelector('[data-horizon="wrapper"]'),
    guardKey: "__horizonScrollAboutResize__",
    callback: () => {
      console.log("run");
      ScrollTrigger.refresh();
    },
  });

  scheduleAnimation();
}
