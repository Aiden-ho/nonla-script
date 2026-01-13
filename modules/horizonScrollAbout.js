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

function getDom() {
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

  return {
    wrapper,
    tracker,
    progress,
    progress_value,
  };
}

// Make animation functions
function createSlideScrollAnimation(dom, motionConfig = {}) {
  const { wrapper, tracker, progress_value } = dom;
  const { scrub, ease, holdEnd } = motionConfig;

  // gsap.set(tracker, { force3D: true, willChange: "transform", z: 0.01 });

  const getAmount = () => {
    const diff = tracker.scrollWidth - wrapper.clientWidth;
    return diff > 0 ? -diff : 0;
  };

  const mainDuration = 1;
  const scrollRatio = mainDuration + holdEnd;

  const tl = gsap.timeline({
    defaults: {
      ease, // make all tweens use a ease of none, feels nicer with working with scrub
    },
    scrollTrigger: {
      trigger: wrapper,
      start: "top top",
      end: () => `+=${Math.abs(getAmount()) * scrollRatio}`,
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
    lazy: true,
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
  const dom = getDom();
  if (dom === null) return;

  const motionConfig = getMotionOptByViewport(
    viewportName,
    DEFAULT_OPT,
    OVERRIDE_OPT
  );

  if (!motionConfig) return;
  const tl = createSlideScrollAnimation(dom, motionConfig);

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();

    gsap.set([dom.tracker, dom.progress_value], { clearProps: "all" });
  };
}
