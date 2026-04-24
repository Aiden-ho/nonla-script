import { MEDIARULE, GSAPCONFIG } from "../utils/constant.js";
import { STORE } from "../utils/globalStore.js";
import { selectElements } from "../utils/helpers.js";
import { VisibleManager } from "../utils/observer.js";

// Make animation functions
const MOTION_DEFAULTS = {
  scrub: 1,
  bgScale: 0.8,
  scrollDist: 3,
  overlap: 0.6,
  ease: GSAPCONFIG.EASE,
  TIMING: {
    INTRO_APPEAR: 0.35,
    VIDEO_EXPAND: 0.65,
    TEXT_FADE: 0.05,
  },
};

const MOTION_MOBILE = {
  bgScale: 0.7,
  scrollDist: 2,
  TIMING: {
    INTRO_APPEAR: 0.15,
    VIDEO_EXPAND: 0.55,
    TEXT_FADE: 0.01,
  },
};

export function expandVideoSectionInit({ mm }) {
  const moduleName = "[expandVideoSection]";
  const section = document.querySelector('[data-video="section"]');

  if (!section) {
    logError(moduleName, section, '[data-video="section"]');
    return;
  }

  const selectors = {
    introBg: '[data-video="intro-bg"]',
    bgEl: "img",
    videoCotent: '[data-video="content"]',
    introHeading: '[data-video="heading"]',
    introContent: '[data-video="intro-content"]',
    introText: '[data-video="text"]',
    videoEl: "video",
  };

  const dom = selectElements(section, selectors, moduleName);
  if (!dom) return;
  const { videoCotent, introContent, introBg, bgEl, introText, videoEl } = dom;
  const introHeading = gsap.utils.toArray('[data-video="heading"]');

  VisibleManager.observe(
    videoEl,
    () => videoEl.play()?.catch(() => {}),
    () => videoEl.pause(),
  );

  gsap.set([videoCotent, introBg, ...introHeading], {
    force3D: true,
    willChange: "transform",
  });

  // document.querySelector(".video_section-intro").style.backgroundColor =
  //   "yellow";
  gsap.set(videoCotent, { scale: 0 });
  gsap.set(introContent, { opacity: 0 });

  mm.add(
    { isDesktop: MEDIARULE.desktop.query, isMobile: MEDIARULE.mobile.query },
    (context) => {
      const isMobile = context.conditions.isMobile;
      const motionConfig = isMobile
        ? { ...MOTION_DEFAULTS, ...MOTION_MOBILE }
        : MOTION_DEFAULTS;

      const getScrollDist = () => STORE.VH * motionConfig.scrollDist;
      const getTotalDist = () => STORE.wheelScrollDist + getScrollDist();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getTotalDist()}px`,
          pin: true,
          scrub: motionConfig.scrub,
          invalidateOnRefresh: true,
        },
      });

      const overlapPx = STORE.VH * motionConfig.overlap;
      let startRatio = (STORE.wheelScrollDist - overlapPx) / getTotalDist();
      startRatio = Math.max(0, startRatio);

      gsap.set(bgEl, {
        yPercent: () => STORE.VH * 0.5,
        scale: motionConfig.bgScale,
      });
      // --- PHASE 1: INTRO ---
      tl.to(
        introContent,
        { opacity: 1, duration: motionConfig.TIMING.INTRO_APPEAR },
        startRatio,
      );
      tl.to(
        bgEl,
        {
          yPercent: 0,
          scale: 1,
          duration: motionConfig.TIMING.INTRO_APPEAR,
        },
        startRatio,
      );

      // --- PHASE 2: MAIN ANIMATION (Video & Headings) ---
      const mainStartAt = startRatio + motionConfig.TIMING.INTRO_APPEAR;
      tl.to(
        videoCotent,
        {
          scale: 1,
          duration: motionConfig.TIMING.VIDEO_EXPAND,
        },
        mainStartAt,
      );

      tl.to(
        introBg,
        {
          scale: 0,
          duration: motionConfig.TIMING.VIDEO_EXPAND,
        },
        mainStartAt,
      );

      introHeading.forEach((el, i) => {
        const dir = i === 0 ? -1 : 1;
        tl.to(
          el,
          {
            x: () => dir * (STORE.VW * 0.5),
            duration: motionConfig.TIMING.VIDEO_EXPAND,
          },
          mainStartAt,
        );
      });

      // --- PHASE 2.1: TEXT FADE ---
      tl.to(
        introText,
        {
          opacity: 0,
          height: 0,
          transformOrigin: "top",
          duration: motionConfig.TIMING.TEXT_FADE,
        },
        mainStartAt,
      );
    },
  );
}
