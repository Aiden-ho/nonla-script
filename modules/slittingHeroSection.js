import { BREAKPOINT } from "../utils/constant.js";

// Make animation functions

function createSlittingHeroAnimation({
  duration = 0.5,
  ease = "power1.out",
  start = "top top",
  end = "+=100%",
  scrub = 1,
} = {}) {
  const introSection = document.querySelector('[data-section="intro"]');
  const heroSection = document.querySelector('[data-section="hero"]');
  const triggerSlitting = document.querySelector('[data-trigger="slit"]');

  if (!introSection || !heroSection || !triggerSlitting) return;

  return gsap.to(introSection, {
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

function applyReducedMotionSlittingHero() {
  const introSection = document.querySelector('[data-section="intro"]');
  const heroSection = document.querySelector('[data-section="hero"]');
  const triggerSlitting = document.querySelector('[data-trigger="slit"]');

  if (!introSection || !heroSection || !topSection) return;

  gsap.set(heroSection, { opacity: 1, clearProps: "transform" });

  gsap.To(introSection, {
    clipPath: "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)",
    ease: "power1.out",
    duration: 0.3,
    scrollTrigger: {
      trigger: triggerSlitting,
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });
}

// Strategies functions

function mobileConfig() {
  createSlittingHeroAnimation({ duration: 0.3, scrub: 0.3, end: "+=60%" });
}

function desktopConfig() {
  createSlittingHeroAnimation();
}

const AnimationStrategies = {
  [BREAKPOINT.MOBILE]: mobileConfig,
  [BREAKPOINT.TABLET]: desktopConfig,
  [BREAKPOINT.SMALL_DESKTOP]: desktopConfig,
  [BREAKPOINT.LARGE_DESKTOP]: desktopConfig,
};

// main function

export function slittingHeroSectionInit(context) {
  const { viewportName, isMotionReduced } = context;

  if (isMotionReduced) {
    applyReducedMotionSlittingHero();
    return;
  }

  const animaiton = AnimationStrategies[viewportName]();
  if (!animaiton) return;
  animaiton();
}
