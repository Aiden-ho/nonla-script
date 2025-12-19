import { BREAKPOINT } from "../utils/constant.js";
import { getWindowWidth, createResizeScheduler } from "../utils/helpers.js";

// Make animation functions
function expandVideoAnimation({
  pinVh = 4,
  scrub = 1.4,
  moveRatio = 0.5,
  SEG = { startAt: 0.03, textDone: 0.1, headingDone: 0.85, videoDone: 0.9 },
} = {}) {
  const videoSection = document.querySelector('[data-video="section"]');
  const introContent = document.querySelector('[data-video="intro-content"]');
  const introBg = document.querySelector('[data-video="intro-bg"]');
  const videoCotent = document.querySelector('[data-video="content"]');

  if (!videoSection || !introContent || !introBg || !videoCotent) return;

  const introHeading = gsap.utils.toArray('[data-video="heading"]');
  const introText = introContent.querySelector('[data-video="text"]');
  const videoEl = videoCotent.querySelector("video");

  if (!introHeading.length || !introText || !videoEl) return;

  gsap.set(videoCotent, { scale: 0 });
  gsap.set(introText, { overflow: "hidden" });
  gsap.set(introContent, { opacity: 0 });

  gsap.to(introContent, {
    opacity: 1,
    scrollTrigger: {
      trigger: videoSection,
      start: "top 20%",
      end: "top top",
      scrub: true,
    },
  });

  let moveXMax = getWindowWidth() * moveRatio;

  const SEG1 = {
    startAt: 0.03,
    textDone: 0.1,
    headingDone: 0.85,
    videoDone: 0.9,
  };

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: videoSection,
      start: "top top",
      end: () => `+=${window.innerHeight * pinVh}px`,
      pin: true,
      pinSpacing: true,
      scrub,
      invalidateOnRefresh: true,
      onRefresh: () => {
        moveXMax = getWindowWidth() * moveRatio;
      },
    },
  });

  tl.to(
    introText,
    {
      autoAlpha: 0,
      height: 0,
      duration: SEG.textDone - SEG.startAt,
    },
    SEG.startAt
  );
  tl.to(
    videoCotent,
    { scale: 1, duration: SEG.videoDone - SEG.startAt },
    SEG.startAt
  );
  tl.to(
    introBg,
    { scale: 0, duration: SEG.videoDone - SEG.startAt },
    SEG.startAt
  );
  tl.to(
    introHeading,
    {
      x: (i) => {
        const dir = i === 0 ? -1 : 1;
        return dir * moveXMax;
      },
      duration: SEG.headingDone - SEG.startAt,
    },
    SEG.startAt
  );
}

// Strategies functions
function mobileConfig() {
  expandVideoAnimation({
    pinVh: 2.5,
    SEG: { startAt: 0.02, textDone: 0.09, headingDone: 0.85, videoDone: 0.9 },
  });
}

function desktopConfig() {
  expandVideoAnimation();
}

const AnimationStrategies = {
  [BREAKPOINT.MOBILE]: mobileConfig,
  [BREAKPOINT.TABLET]: desktopConfig,
  [BREAKPOINT.SMALL_DESKTOP]: desktopConfig,
  [BREAKPOINT.LARGE_DESKTOP]: desktopConfig,
};

export function expandVideoSectionInit(config) {
  const { viewportName, isMotionReduced } = config;

  //isMotionReduced for next update

  const animation = AnimationStrategies[viewportName];
  if (!animation) return;
  animation();

  const scheduleAnimation = createResizeScheduler({
    targetElement: document.querySelector('[data-video="section"]'),
    guardKey: "__ expandVideoResize__",
    callback: () => {
      ScrollTrigger.refresh();
    },
  });

  scheduleAnimation();
}
