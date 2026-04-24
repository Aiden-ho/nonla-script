import { MEDIARULE } from "../utils/constant.js";
import { STORE } from "../utils/globalStore.js";
import { selectElements } from "../utils/helpers.js";

const MOTION_DEFAULTS = {
  scrub: 1,
};

const MOTION_MOBILE = {
  scrub: 0.8,
};

export function wheelRotateMomentSectionInit({ mm }) {
  const moduleName = "[wheelRotateMoment]";
  const section = document.querySelector('[data-wheel="section"]');
  const scale = 0.95;
  if (!section) {
    logError(moduleName, section, '[data-wheel="section"]');
    return;
  }

  const selectors = {
    wheelBox: '[data-wheel="wheel"]',
    contentBox: '[data-wheel="contentBox"]',
    svg: "svg",
  };

  const dom = selectElements(section, selectors, moduleName);
  if (!dom) return;
  const { wheelBox, contentBox, svg } = dom;

  let metrics = {};

  const updateMetrics = (isMobile = false) => {
    const ratio = isMobile ? 2 : 1;
    const svgRect = svg.getBoundingClientRect();
    const svgWidth = svgRect.width * scale;
    const distanceToEdge = STORE.VW / 2 + svgWidth / 2 + 30;
    const travelDistance = distanceToEdge * ratio;
    const circumference = svgWidth * Math.PI;
    const totalRotation = (travelDistance / circumference) * 360;

    STORE.wheelScrollDist = travelDistance;

    metrics = {
      contentHeight: contentBox.offsetHeight,
      startX: -distanceToEdge,
      endX: distanceToEdge,
      rotation: totalRotation,
      scrollDistance: travelDistance,
    };
  };

  updateMetrics();
  // section.style.backgroundColor = "blue";
  gsap.set(svg, { transformOrigin: "50% 50%", scale });
  gsap.set(contentBox, { y: () => metrics.contentHeight * 1.5 });
  gsap.set(svg, {
    x: () => metrics.startX,
    rotation: 0,
  });

  mm.add(
    { isDesktop: MEDIARULE.desktop.query, isMobile: MEDIARULE.mobile.query },
    (context) => {
      const isMobile = context.conditions.isMobile;
      const motionConfig = isMobile
        ? { ...MOTION_DEFAULTS, ...MOTION_MOBILE }
        : MOTION_DEFAULTS;

      const tl = gsap.timeline({
        defaults: {
          ease: "none",
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${metrics.scrollDistance}px`,
          scrub: motionConfig.scrub,
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
          onRefresh: () => updateMetrics(isMobile),
        },
      });

      tl.to(contentBox, { y: () => -metrics.contentHeight * 1.5 }, 0);
      tl.to(
        svg,
        {
          x: () => metrics.endX,
          rotation: () => metrics.rotation,
        },
        "<",
      );
      tl.to(section, { opacity: 0, duration: 0.05 });
    },
  );
}
