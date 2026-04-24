import { MEDIARULE, GSAPCONFIG } from "../utils/constant.js";
import { selectElements } from "../utils/helpers.js";

const MOTION_DEFAULTS = {
  ease: "power2.out",
  start: "top 90%",
  end: "top top",
  scrub: 0.8,
  filter: "brightness(50%) blur(10px)",
  scale: 0.95,
};
const MOTION_MOBILE = {
  filter: "brightness(70%) blur(4px)",
  scrub: 0.6,
};

export function layerStackTopBottomInit({ mm }) {
  const moduleName = "[LayerStackTopBottom]";
  const selectors = {
    topLayer: '[data-layer="top"]',
    bottomLayer: '[data-layer="bottom"]',
  };

  const dom = selectElements(null, selectors, moduleName);
  if (!dom) return;
  const { topLayer, bottomLayer } = dom;

  gsap.set(topLayer, {
    willChange: "filter, transform",
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
          trigger: bottomLayer,
          start: motionConfig.start,
          end: motionConfig.end,
          scrub: motionConfig.scrub,
          invalidateOnRefresh: true,
        },
      });

      tl.to(topLayer, {
        startAt: { filter: "brightness(100%) blur(0px)" },
        filter: motionConfig.filter,
        ease: motionConfig.ease,
        scale: motionConfig.scale,
        duration: 1,
      });

      tl.to(
        topLayer,
        {
          autoAlpha: 0,
          duration: 0.2,
          ease: "none",
        },
        ">-0.1",
      );
    },
  );
}
