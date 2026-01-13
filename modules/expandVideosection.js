import { BREAKPOINT, GSAPCONFIG } from "../utils/constant.js";
import { STORE } from "../utils/globalStore.js";
import { getMotionOptByViewport, warn } from "../utils/helpers.js";

// Make animation functions
const DEFAULT_OPT = {
  scrollFactor: 3,
  scrub: GSAPCONFIG.SCRUB,
  ease: GSAPCONFIG.EASE,
  PHASE: {
    introStart: 0,
    introEnd: 0.15,
    mainStart: 0.2,
    mainEnd: 0.95,
    textEnd: 0.25,
  },
};
const OVERRIDE_OPT = {
  [BREAKPOINT.MOBILE]: {
    ...DEFAULT_OPT,
    scrollFactor: 2,
    PHASE: {
      introStart: 0,
      introEnd: 0.1,
      mainStart: 0.12,
      mainEnd: 0.9,
      textEnd: 0.18,
    },
  },
};

const ROOT_DOM = {
  videoSection: '[data-video="section"]',
  introBg: '[data-video="intro-bg"]',
  bgEl: "img",
  videoCotent: '[data-video="content"]',
  introHeading: '[data-video="heading"]',
  introText: '[data-video="text"]',
  videoEl: "video",
};

function getDom() {
  const videoSection = document.querySelector(ROOT_DOM.videoSection);

  if (!videoSection) {
    warn("[expandVideoSection]", "Missing ROOT DOM", { videoSection });
    return null;
  }

  const introContent = videoSection.querySelector(
    '[data-video="intro-content"]'
  );
  const introBg = videoSection.querySelector(ROOT_DOM.introBg);
  const videoCotent = videoSection.querySelector(ROOT_DOM.videoCotent);
  const bgEl = videoSection.querySelector(ROOT_DOM.bgEl);

  if (!videoCotent || !introBg || !bgEl || !introContent) {
    warn("[expandVideoSection]", "Missing INTRO DOM", {
      videoCotent,
      introContent,
      introBg,
      bgEl,
    });
    return null;
  }

  const introHeading = gsap.utils.toArray(ROOT_DOM.introHeading);
  const introText = introContent.querySelector(ROOT_DOM.introText);
  const videoEl = videoCotent.querySelector(ROOT_DOM.videoEl);

  if (!introHeading.length || !introText || !videoEl) {
    warn("[expandVideoSection]", "Missing CONTENT DOM", {
      introHeading,
      introText,
      videoEl,
    });
    return null;
  }

  return {
    videoSection,
    videoCotent,
    introContent,
    introBg,
    bgEl,
    introHeading,
    introText,
    videoEl,
  };
}

// Make animation functions
export function expandVideoAnimation(dom, motionConfig = {}) {
  const {
    videoSection,
    introHeading,
    introText,
    introContent,
    introBg,
    videoCotent,
    bgEl,
  } = dom;
  const { scrub, ease, PHASE } = motionConfig;

  const getMoveX = () => window.innerWidth * 0.5;

  gsap.set([videoCotent, introBg, ...introHeading], {
    force3D: true,
    willChange: "transform",
  });

  gsap.set(videoCotent, { scale: 0 });
  gsap.set(introContent, { opacity: 0 });
  gsap.set(bgEl, { yPercent: 120, scale: 0.8 });

  const st = ScrollTrigger.create({
    defaults: { ease },
    trigger: videoSection,
    start: "top top",
    end: () => `+=200%`,
    pin: true,
    scrub: scrub,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const progress = self.progress;

      // --- PHASE 1: INTRO (0 -> 0.15) ---
      const introProgress = gsap.utils.clamp(
        0,
        1,
        gsap.utils.normalize(PHASE.introStart, PHASE.introEnd, progress)
      );

      gsap.set(introContent, { opacity: introProgress });
      gsap.set(bgEl, {
        yPercent: (1 - introProgress) * 120,
        scale: 0.8 + introProgress * 0.2,
      });

      // --- PHASE 2: MAIN ANIMATION (0.20 -> 0.80) ---
      const mainProgress = gsap.utils.clamp(
        0,
        1,
        gsap.utils.normalize(PHASE.mainStart, PHASE.mainEnd, progress)
      );

      // Scale Video (Giờ đây khi mainP = 0, video chắc chắn scale = 0)
      gsap.set(videoCotent, { scale: mainProgress });
      gsap.set(introBg, { scale: 1 - mainProgress });

      // Headings
      introHeading.forEach((el, i) => {
        const dir = i === 0 ? -1 : 1;
        gsap.set(el, { x: dir * mainProgress * getMoveX() });
      });

      // Text
      const textP = gsap.utils.clamp(
        0,
        1,
        gsap.utils.normalize(PHASE.mainStart, PHASE.textEnd, progress)
      );
      gsap.set(introText, {
        opacity: 1 - textP,
        height: introText.offsetHeight * (1 - textP),
      });
    },
  });

  return () => {
    st?.kill();
    gsap.set(
      [videoCotent, introContent, bgEl, introText, introBg, ...introHeading],
      {
        clearProps: "all",
      }
    );
  };
}

export function expandVideoSectionInit(config = {}) {
  const { viewportName } = config;
  const dom = getDom();
  if (dom === null) return;

  const motionConfig = getMotionOptByViewport(
    viewportName,
    DEFAULT_OPT,
    OVERRIDE_OPT
  );

  return expandVideoAnimation(dom, motionConfig);
}
