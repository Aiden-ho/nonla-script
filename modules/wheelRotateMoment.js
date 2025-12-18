import { BREAKPOINT } from "../utils/constant.js";
import {
  getWindowWidth,
  getWindowHeight,
  createResizeScheduler,
} from "../utils/helpers.js";

// Make animation functions
function createWheelRotateAnimation({
  scrub = 1.2,
  turns = 6,
  endPerTurn = 30,
  fromValueTop = "70%",
} = {}) {
  const wheel = document.querySelector('[data-wheel="wheel"]');
  const contentBox = document.querySelector('[data-wheel="contentBox"]');
  const section = document.querySelector('[data-wheel="section"]');

  if (!wheel || !section || !contentBox) return;

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

// Strategies functions
function mobileConfig() {
  createWheelRotateAnimation({
    turns: 4,
    endPerTurn: 20,
    fromValueTop: "30%",
  });
}

function desktopConfig() {
  createWheelRotateAnimation();
}

const AnimationStrategies = {
  [BREAKPOINT.MOBILE]: mobileConfig,
  [BREAKPOINT.TABLET]: desktopConfig,
  [BREAKPOINT.SMALL_DESKTOP]: desktopConfig,
  [BREAKPOINT.LARGE_DESKTOP]: desktopConfig,
};

export function wheelRotateMomentSectionInit(config) {
  const { viewportName, isMotionReduced } = config;

  //isMotionReduced for next update

  const animation = AnimationStrategies[viewportName];
  if (!animation) return;
  animation();

  const scheduleAnimation = createResizeScheduler({
    targetElement: document.querySelector('[data-horizon="wrapper"]'),
    guardKey: "__wheelRotateMomentResize__",
    callback: () => {
      ScrollTrigger.refresh();
    },
  });

  scheduleAnimation();
}
