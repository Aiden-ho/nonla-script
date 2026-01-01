import { BREAKPOINT, GSAPCONFIG } from "../utils/constant.js";
import { STORE } from "../utils/globalStore.js";
import { getMotionOptByViewport, warn } from "../utils/helpers.js";
// Make animation functions
const DEFAULT_OPT = {
  scrub: GSAPCONFIG.SCRUB,
  moveYWheel: "220",
};
const OVERRIDE_OPT = {
  [BREAKPOINT.MOBILE]: {
    ...DEFAULT_OPT,
    moveYWheel: "0",
  },
};

// helpers/wheelGeometry.js
function getWheelGeometry({ svg, preProgress }) {
  const width = svg.getBoundingClientRect().width;
  const circumference = width * Math.PI;

  const start = -(STORE.VW / 2 + width / 2);
  const end = STORE.VW / 2 + width / 2;

  const travelDistance = end - start;
  const degPerPixel = 360 / circumference;

  const preDistance = travelDistance * preProgress;
  const pinDistance = travelDistance - preDistance;

  return {
    visualWidth: width,
    start,
    end,
    travelDistance,
    degPerPixel,
    preDistance,
    pinDistance,
  };
}

// Make animation functions
function createWheelRotateAnimation(motionConfig = {}) {
  const wheel = document.querySelector('[data-wheel="wheel"]');
  const contentBox = document.querySelector('[data-wheel="contentBox"]');
  const section = document.querySelector('[data-wheel="section"]');
  const svg = wheel.querySelector("svg");

  if (!wheel || !section || !contentBox || !svg) {
    warn("[wheelRotateMoment]", "Missing ROOT DOM", {
      wheel,
      contentBox,
      section,
      svg,
    });
    return null;
  }

  const { scrub, moveYWheel } = motionConfig;
  const PRE_PROGRESS = 0.2;
  const BOX_END_AT = 0.9;
  const PRE_BOX_PROGRESS = BOX_END_AT * PRE_PROGRESS;
  const SCALE = 0.8;

  const getWheelInfo = () =>
    getWheelGeometry({ svg, preProgress: PRE_PROGRESS });
  const getBoxH = () => contentBox.getBoundingClientRect().height;

  // ================== TIMELINE ==================
  gsap.set(wheel, { transformOrigin: "50% 50%", scale: SCALE });
  const wheelTl = gsap.timeline({
    default: { ease: GSAPCONFIG.EASE },
    paused: true,
  });
  const boxTl = gsap.timeline({
    default: { ease: GSAPCONFIG.EASE },
    paused: true,
  });

  boxTl.fromTo(
    contentBox,
    { y: () => STORE.VH + getBoxH() },
    { y: () => -getBoxH() * 2 },
    0
  );
  wheelTl.fromTo(
    wheel,
    { x: () => getWheelInfo().start, rotation: 0, y: `+=${moveYWheel}` },
    {
      x: () => getWheelInfo().end,
      rotation: () => {
        const geo = getWheelInfo();
        return geo.travelDistance * geo.degPerPixel;
      },
      y: `-=${moveYWheel}`,
    },
    0
  );

  ScrollTrigger.create({
    trigger: section,
    start: "top 80%",
    end: () => `top top`,
    scrub: scrub,
    onUpdate: (self) => {
      const wheelProgress = self.progress * PRE_PROGRESS;
      const boxProgress = self.progress * PRE_BOX_PROGRESS;
      wheelTl.progress(wheelProgress);
      boxTl.progress(boxProgress);
    },
  });

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => {
      const geo = getWheelInfo();
      return `+=${geo.pinDistance}`;
    },
    scrub: scrub,
    pin: true,
    pinSpacing: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const wheelProgress = PRE_PROGRESS + self.progress * (1 - PRE_PROGRESS);
      const boxProgress =
        PRE_BOX_PROGRESS + self.progress * (BOX_END_AT - PRE_BOX_PROGRESS);
      wheelTl.progress(wheelProgress);
      boxTl.progress(boxProgress);
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
