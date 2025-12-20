import { BREAKPOINT } from "../utils/constant.js";
import { getWindowWidth, getWindowHeight } from "../utils/helpers.js";
import { getMotionOptByViewport } from "../utils/helpers.js";
// Make animation functions
const DEFAULT_OPT = {
  scrub: 1.2,
  turns: 6,
  endPerTurn: 30,
  fromValueTop: "70%",
};
const OVERRIDE_OPT = {
  [BREAKPOINT.MOBILE]: {
    ...DEFAULT_OPT,
    turns: 4,
    endPerTurn: 20,
    fromValueTop: "30%",
  },
};

// Make animation functions
function createWheelRotateAnimation(motionConfig = {}) {
  const wheel = document.querySelector('[data-wheel="wheel"]');
  const contentBox = document.querySelector('[data-wheel="contentBox"]');
  const section = document.querySelector('[data-wheel="section"]');

  if (!wheel || !section || !contentBox) {
    console.warn("[wheelRotateMoment] Missing DOM");
    return null;
  }

  const { scrub, turns, endPerTurn, fromValueTop } = motionConfig;

  const PRE_PROGRESS = 0.2;

  // ================== TIMELINE ==================
  const tl = gsap.timeline({ default: { ease: "none" }, paused: true });
  tl.fromTo(
    contentBox,
    {
      y: () => getWindowHeight(),
    },
    {
      y: () => -getWindowHeight(),
      ease: "none",
    },
    0
  );

  tl.fromTo(
    wheel,
    {
      top: fromValueTop,
      x: () => -getWindowWidth(),
      rotation: 0,
    },
    {
      top: "50%",
      x: () => getWindowWidth(),
      rotation: 360 * turns,
    },
    0
  );

  // ================== SCROLLTRIGGER 1 ==================
  ScrollTrigger.create({
    trigger: section,
    start: "top 80%",
    end: "top top",
    scrub: scrub,
    onUpdate: (self) => {
      tl.progress(self.progress * PRE_PROGRESS);
    },
  });

  // ================== SCROLLTRIGGER 2 ==================
  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => `+=${turns * endPerTurn}%`,
    scrub: scrub,
    pin: true,
    pinSpacing: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      tl.progress(PRE_PROGRESS + self.progress * (1 - PRE_PROGRESS));
    },
  });
}

export function wheelRotateMomentSectionInit(config = {}) {
  const { viewportName } = config;

  const motionConfig = getMotionOptByViewport(
    viewportName,
    DEFAULT_OPT,
    OVERRIDE_OPT
  );

  createWheelRotateAnimation(motionConfig);
}
