import { BREAKPOINT } from "../utils/constant.js";
import { getWindowWidth } from "../utils/helpers.js";
import { getMotionOptByViewport } from "../utils/helpers.js";
// Make animation functions
const DEFAULT_OPT = {
  pinVh: 4,
  scrub: 1.4,
  moveRatio: 0.5,
  SEG: { startAt: 0.03, textDone: 0.1, headingDone: 0.85, videoDone: 0.9 },
};
const OVERRIDE_OPT = {
  [BREAKPOINT.MOBILE]: {
    ...DEFAULT_OPT,
    pinVh: 2.5,
    SEG: { startAt: 0.02, textDone: 0.09, headingDone: 0.85, videoDone: 0.9 },
  },
};

// Make animation functions
function expandVideoAnimation(motionConfig = {}) {
  const videoSection = document.querySelector('[data-video="section"]');
  const introContent = document.querySelector('[data-video="intro-content"]');
  const introBg = document.querySelector('[data-video="intro-bg"]');
  const videoCotent = document.querySelector('[data-video="content"]');

  if (!videoSection || !introContent || !introBg || !videoCotent) {
    console.warn("[expandVideoSection] Missing DOM");
    return null;
  }

  const introHeading = gsap.utils.toArray('[data-video="heading"]');
  const introText = introContent.querySelector('[data-video="text"]');
  const videoEl = videoCotent.querySelector("video");

  if (!introHeading.length || !introText || !videoEl) {
    console.warn("[expandVideoSection] Missing content DOM");
    return null;
  }

  const { pinVh, scrub, moveRatio, SEG } = motionConfig;

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

export function expandVideoSectionInit(config = {}) {
  const { viewportName } = config;

  const motionConfig = getMotionOptByViewport(
    viewportName,
    DEFAULT_OPT,
    OVERRIDE_OPT
  );

  expandVideoAnimation(motionConfig);
}
