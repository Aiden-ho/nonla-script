import { BREAKPOINT, GSAPCONFIG } from "../utils/constant.js";
import { getMotionOptByViewport, warn } from "../utils/helpers.js";

const ROOT_DOM = {
  intro: '[data-slit="intro"]',
  hero: '[data-slit="hero"]',
  introHeading: '[data-slit="heading"]',
  wrapper: '[data-slit="wrapper"]',
};

// Make animation functions
const DEFAULT_OPT = {
  ease: GSAPCONFIG.EASE,
  start: "top top",
  end: "+=140%",
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

function createSlittingHeroAnimation(motionConfig = {}) {
  const wrapper = document.querySelector(ROOT_DOM.wrapper);

  if (!wrapper) {
    warn("[SlittingHeroSection]", " Missing ROOT DOM", { wrapper });
    return null;
  }

  const intro = wrapper.querySelector(ROOT_DOM.intro);
  const hero = wrapper.querySelector(ROOT_DOM.hero);
  const headingIntro = wrapper.querySelector(ROOT_DOM.introHeading);

  if (!intro || !hero || !headingIntro) {
    warn("[SlittingHeroSection]", " Missing ROOT DOM", {
      introSection,
      heroSection,
      headingIntro,
    });
    return null;
  }

  const { scrub, ease, start, end, duration, hold } = motionConfig;

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

  tl.to(
    intro,
    {
      clipPath: "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)",
      duration,
    },
    0
  );
  tl.to(hero, { opacity: 0, duration }, 0);
  tl.to(headingIntro, { opacity: 1, duration }, 0);
  tl.to({}, { duration: hold });
}

// main function
export function slittingHeroSectionInit(config = {}) {
  const { viewportName } = config;

  const motionConfig = getMotionOptByViewport(
    viewportName,
    DEFAULT_OPT,
    OVERRIDE_OPT
  );

  createSlittingHeroAnimation(motionConfig);
}
