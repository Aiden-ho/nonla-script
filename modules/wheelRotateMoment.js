import { BREAKPOINT, GSAPCONFIG } from "../utils/constant.js";
import { STORE } from "../utils/globalStore.js";
import { getMotionOptByViewport, warn } from "../utils/helpers.js";
// Make animation functions
const DEFAULT_OPT = {
  scrub: GSAPCONFIG.SCRUB,
  scale: 0.95,
};
const OVERRIDE_OPT = {
  [BREAKPOINT.MOBILE]: {
    ...DEFAULT_OPT,
  },
};

const ROOT_DOM = {
  section: '[data-wheel="section"]',
  wheelBox: '[data-wheel="wheel"]',
  contentBox: '[data-wheel="contentBox"]',
  svg: "svg",
};

function getDom() {
  const section = document.querySelector(ROOT_DOM.section);

  if (!section) {
    warn("[wheelRotateMoment]", "Missing ROOT DOM", { section });
    return null;
  }

  const wheelBox = section.querySelector(ROOT_DOM.wheelBox);
  const contentBox = section.querySelector(ROOT_DOM.contentBox);
  const svg = wheelBox.querySelector(ROOT_DOM.svg);

  if (!wheelBox || !contentBox || !svg) {
    warn("[wheelRotateMoment]", "Missing ROOT DOM", {
      wheelBox,
      contentBox,
      svg,
    });
    return null;
  }

  return {
    section,
    wheelBox,
    contentBox,
    svg,
  };
}

// Make animation functions
function createWheelRotateAnimation(dom, motionConfig = {}) {
  const { section, wheelBox, contentBox, svg } = dom;
  const { scrub, scale } = motionConfig;

  const getMetrics = () => {
    const svgWidth = svg.getBoundingClientRect().width * scale;
    const contentHeight = contentBox.getBoundingClientRect().height;

    return {
      svgWidth,
      contentHeight,
      startX: -svgWidth * 1.8,
      endX: svgWidth * 1.8,
      rotation: (svgWidth * 3.6 * 360) / (svgWidth * Math.PI),
    };
  };

  // ================== TIMELINE ==================
  gsap.set(wheelBox, { transformOrigin: "50% 50%", scale });
  gsap.set(contentBox, { y: () => getMetrics().contentHeight * 1.5 });
  gsap.set(wheelBox, {
    x: () => getMetrics().startX,
    rotation: 0,
  });

  const tl = gsap.timeline({
    defaults: { ease: GSAPCONFIG.EASE },
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=200%",
      scrub: scrub,
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true,
    },
  });

  tl.to(contentBox, { y: () => -getMetrics().contentHeight * 1.5 }, 0);
  tl.to(
    wheelBox,
    {
      x: () => getMetrics().endX,
      rotation: () => getMetrics().rotation,
    },
    "<",
  );
  return tl;
}

export function wheelRotateMomentSectionInit(config = {}) {
  const { viewportName } = config;

  const dom = getDom();
  if (!dom) return;

  const motionConfig = getMotionOptByViewport(
    viewportName,
    DEFAULT_OPT,
    OVERRIDE_OPT,
  );

  const tl = createWheelRotateAnimation(dom, motionConfig);

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();

    gsap.set([dom.wheelBox, dom.contentBox], { clearProps: "all" });
  };
}
