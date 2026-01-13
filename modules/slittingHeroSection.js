import { BREAKPOINT, GSAPCONFIG } from "../utils/constant.js";
import { getMotionOptByViewport, warn } from "../utils/helpers.js";

const ROOT_DOM = {
  intro: '[data-slit="intro"]',
  hero: '[data-slit="hero"]',
  introHeading: '[data-slit="heading"]',
  wrapper: '[data-slit="wrapper"]',
  polygon: "#slitPolygon",
};

// Make animation functions
const DEFAULT_OPT = {
  ease: GSAPCONFIG.EASE,
  start: "top top",
  end: "+=100%",
  duration: 0.67,
  hold: 0.33,
  scrub: GSAPCONFIG.SCRUB,
};

const OVERRIDE_OPT = {
  [BREAKPOINT.MOBILE]: {
    ...DEFAULT_OPT,
    end: "+=60%",
    duration: 0.85,
    hold: 0.15,
  },
};

function getDom() {
  const wrapper = document.querySelector(ROOT_DOM.wrapper);

  if (!wrapper) {
    warn("[SlittingHeroSection]", " Missing ROOT DOM", { wrapper });
    return null;
  }

  const intro = wrapper.querySelector(ROOT_DOM.intro);
  const hero = wrapper.querySelector(ROOT_DOM.hero);
  const headingIntro = wrapper.querySelector(ROOT_DOM.introHeading);
  const polygon = document.querySelector(ROOT_DOM.polygon);

  if (!intro || !hero || !headingIntro) {
    warn("[SlittingHeroSection]", " Missing ROOT DOM", {
      introSection,
      heroSection,
      headingIntro,
      polygon,
    });
    return null;
  }

  return { intro, hero, headingIntro, wrapper, polygon };
}

function createSlittingHeroAnimation(dom, motionConfig = {}) {
  const { intro, hero, headingIntro, wrapper, polygon } = dom;
  const { scrub, ease, start, end, duration, hold } = motionConfig;

  gsap.set(intro, {
    willChange: "transform, clip-path", // Báo trước cho trình duyệt
    force3D: true,
    z: 0.01, // Mẹo nhỏ để kích hoạt Hardware Acceleration
    backfaceVisibility: "hidden",
  });

  const tl = gsap.timeline({
    defaults: { ease },
    scrollTrigger: {
      trigger: wrapper,
      start,
      end,
      scrub,
      invalidateOnRefresh: true,
    },
  });

  tl.to(polygon, {
    attr: { points: "0 0, 0 1, 1 1, 1 0" },
    duration,
  });
  tl.to(hero, { opacity: 0, duration }, 0);
  tl.to(headingIntro, { opacity: 1, duration }, 0);
  tl.to({}, { duration: hold });
  // tl.progress(1).pause(0);

  return tl;
}

// main function
export function slittingHeroSectionInit(config = {}) {
  const { viewportName } = config;

  const dom = getDom();
  if (dom === null) return;

  const motionConfig = getMotionOptByViewport(
    viewportName,
    DEFAULT_OPT,
    OVERRIDE_OPT
  );

  const tl = createSlittingHeroAnimation(dom, motionConfig);

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();

    gsap.set([dom.intro, dom.hero, dom.headingIntro, dom.polygon], {
      clearProps: "all",
    });
  };
}
