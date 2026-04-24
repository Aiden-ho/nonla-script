import { GSAPCONFIG, MEDIARULE } from "../utils/constant.js";
import { logError, selectElements } from "../utils/helpers.js";

const MOTION_DEFAULTS = {
  ease: GSAPCONFIG.EASE,
  start: "top top",
  end: "+=150%",
  scrub: 0.8,
};

const MOTION_MOBILE = {
  end: "+=100%",
};

export function slittingHeroSectionInit({ mm }) {
  const moduleName = "[SlittingHero]";
  const wrapper = document.querySelector('[data-slit="wrapper"]');

  if (!wrapper) {
    logError(moduleName, wrapper, '[data-slit="wrapper"]');
    return;
  }

  const selectors = {
    intro: '[data-slit="intro"]',
    hero: '[data-slit="hero"]',
    introHeading: '[data-slit="heading"]',
    polygon: "#slitPolygon",
  };

  const dom = selectElements(wrapper, selectors, moduleName);
  if (!dom) return;
  const { intro, hero, introHeading, polygon } = dom;

  gsap.set(intro, {
    willChange: "transform, clip-path",
    force3D: true,
  });

  mm.add(
    {
      isDesktop: MEDIARULE.desktop.query,
      isMobile: MEDIARULE.mobile.query,
    },
    (context) => {
      const isMobile = context.conditions.isMobile;
      const motionConfig = isMobile
        ? { ...MOTION_DEFAULTS, ...MOTION_MOBILE }
        : MOTION_DEFAULTS;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: motionConfig.start,
          end: motionConfig.end,
          scrub: motionConfig.scrub,
          invalidateOnRefresh: true,
        },
      });

      tl.to(polygon, {
        attr: { points: "0 0, 0 1, 1 1, 1 0" },
        ease: "power2.out",
      });
      tl.to(hero, { autoAlpha: 0 }, 0);
      tl.to(introHeading, { autoAlpha: 1 }, 0);
    },
  );
}
