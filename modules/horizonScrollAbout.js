import { BREAKPOINT, DIRECTION } from "../utils/constant.js";
import { createResizeScheduler } from "../utils/helpers.js";

let horizonTL = null;

function killHorizon() {
  horizonTL?.scrollTrigger?.kill(true);
  horizonTL?.kill();
  horizonTL = null;
}

function refreshOnImageLoad(tracker) {
  const imgs = tracker.querySelectorAll("img");
  if (!imgs.length) return;

  imgs.forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  });
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
  }).to(
    progress_value,
    {
      right: "0%",
      transformOrigin: "center left",
    },
    "<"
  );

  refreshOnImageLoad(tracker);
  return tl;
}

// Strategies functions
function mobileConfig() {
  killHorizon();
}

function desktopConfig() {
  killHorizon();
  horizonTL = createSlideScrollAnimation();
}

const AnimationStrategies = {
  [BREAKPOINT.MOBILE]: mobileConfig,
  [BREAKPOINT.TABLET]: desktopConfig,
  [BREAKPOINT.SMALL_DESKTOP]: desktopConfig,
  [BREAKPOINT.LARGE_DESKTOP]: desktopConfig,
};

export function horizonScrollAboutInit(config) {
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
      ScrollTrigger.refresh();
    },
  });

  scheduleAnimation();
}
