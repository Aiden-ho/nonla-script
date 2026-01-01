import { BREAKPOINT, GSAPCONFIG } from "../utils/constant.js";
import { STORE } from "../utils/globalStore.js";
import { getMotionOptByViewport, warn } from "../utils/helpers.js";

// Make animation functions
const DEFAULT_OPT = {
  scrollFactor: 3,
  scrub: GSAPCONFIG.SCRUB,
  ease: GSAPCONFIG.EASE,
  DUR: { startAt: 0.05, textDone: 0.1, headingDone: 0.85, videoDone: 0.9 },
};
const OVERRIDE_OPT = {
  [BREAKPOINT.MOBILE]: {
    ...DEFAULT_OPT,
    scrollFactor: 2,
    DUR: { startAt: 0.02, textDone: 0.06, headingDone: 0.85, videoDone: 0.9 },
  },
};

// Make animation functions
function expandVideoAnimation(motionConfig = {}) {
  const videoSection = document.querySelector('[data-video="section"]');

  if (!videoSection) {
    warn("[expandVideoSection]", "Missing ROOT DOM", { videoSection });
    return null;
  }

  const introContent = videoSection.querySelector(
    '[data-video="intro-content"]'
  );
  const introBg = videoSection.querySelector('[data-video="intro-bg"]');
  const videoCotent = videoSection.querySelector('[data-video="content"]');

  if (!introContent || !introBg || !videoCotent) {
    warn("[expandVideoSection]", "Missing ROOT DOM", {
      introContent,
      introBg,
      videoCotent,
    });
    return null;
  }

  const introHeading = gsap.utils.toArray('[data-video="heading"]');
  const introText = introContent.querySelector('[data-video="text"]');
  const videoEl = videoCotent.querySelector("video");

  if (!introHeading.length || !introText || !videoEl) {
    warn("[expandVideoSection]", "Missing CONTENT DOM", {
      introHeading,
      introText,
      videoEl,
    });
    return null;
  }

  const { scrollFactor, scrub, DUR, ease } = motionConfig;

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
      invalidateOnRefresh: true,
    },
  });

  let moveXMax = STORE.VW * 0.5;

  const tl = gsap.timeline({
    defaults: { ease },
    scrollTrigger: {
      trigger: videoSection,
      start: "top top",
      end: () => `+=${STORE.VH * scrollFactor}px`,
      pin: true,
      pinSpacing: true,
      scrub,
      invalidateOnRefresh: true,
      onRefresh: () => {
        moveXMax = STORE.VW * 0.5;
      },
    },
  });
  tl.to(
    introHeading,
    {
      x: (i) => {
        const dir = i === 0 ? -1 : 1;
        return dir * moveXMax;
      },
      duration: DUR.headingDone - DUR.startAt,
    },
    DUR.startAt
  );
  tl.to(
    introText,
    {
      autoAlpha: 0,
      height: 0,
      duration: DUR.textDone - DUR.startAt,
    },
    DUR.startAt
  );
  tl.to(
    videoCotent,
    { scale: 1, duration: DUR.videoDone - DUR.startAt },
    DUR.startAt
  );
  tl.to(
    introBg,
    { scale: 0, duration: DUR.videoDone - DUR.startAt },
    DUR.startAt
  );
  tl.to({}, { duration: 0.1 });
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
