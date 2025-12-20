import { BREAKPOINT } from "../utils/constant.js";
import { getMotionOptByViewport } from "../utils/helpers.js";
// Make animation functions
const DEFAULT_OPT = {
  duration: 0.5,
  ease: "power1.out",
  start: "top top",
  end: "+=100%",
  scrub: 1,
};
const OVERRIDE_OPT = {
  [BREAKPOINT.MOBILE]: {
    ...DEFAULT_OPT,
    duration: 0.3,
    scrub: 0.3,
    end: "+=60%",
  },
};

function createSlittingHeroAnimation(motionConfig = {}) {
  const introSection = document.querySelector('[data-section="intro"]');
  const heroSection = document.querySelector('[data-section="hero"]');
  const triggerSlitting = document.querySelector('[data-trigger="slit"]');

  if (!introSection || !heroSection || !triggerSlitting) {
    console.warn("[SlittingHeroSection] Missing DOM");
    return null;
  }

  const { duration, scrub, ease, start, end } = motionConfig;

  gsap.to(introSection, {
    clipPath: "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0% )",
    ease,
    duration,
    scrollTrigger: {
      trigger: triggerSlitting,
      start,
      end,
      scrub,
      onUpdate: ({ progress }) => {
        gsap.set(heroSection, { opacity: 1 - progress });
      },
    },
  });
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
