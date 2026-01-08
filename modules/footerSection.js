import { getLenis } from "../utils/gsapConfig.js";
import { warn } from "../utils/helpers.js";
import { scrollToTop } from "../modules/customScroll.js";

const ROOT_DOM = {
  section: "[data-footer='section']",
  footerTop: "[data-footer='top']",
  footerMiddleText: "[data-footer='middle-text']",
  footerMiddleImg: "[data-footer='middle-img']",
  footerHeading: "[data-footer='heading']",
  triggerToTop: "[data-totop='trigger']",
};

const state = {
  isInit: false,
};

function getRootDom() {
  const section = document.querySelector(ROOT_DOM.section);

  if (!section) {
    warn("[footerSection]", "Missing ROOT DOM", { section });
    return null;
  }

  const footerTop = section.querySelector(ROOT_DOM.footerTop);
  const footerMiddleText = section.querySelector(ROOT_DOM.footerMiddleText);
  const footerImg = section.querySelector(ROOT_DOM.footerMiddleImg);
  const footerHeading = section.querySelector(ROOT_DOM.footerHeading);
  const triggerToTop = section.querySelector(ROOT_DOM.triggerToTop);

  if (
    !footerTop ||
    !footerMiddleText ||
    !footerImg ||
    !footerHeading ||
    !triggerToTop
  ) {
    warn("[footerSection]", "Missing ROOT DOM", {
      footerTop,
      footerMiddleText,
      footerImg,
      footerHeading,
      triggerToTop,
    });
    return null;
  }

  return {
    section,
    footerTop,
    footerMiddleText,
    footerImg,
    footerHeading,
    triggerToTop,
  };
}

function initOnce(dom = {}) {
  if (state.isInit) return;
  state.isInit = true;

  const lenis = getLenis();
  const { triggerToTop } = dom;

  triggerToTop.addEventListener("click", () => {
    scrollToTop();
  });
}

function createFooterAnimation(dom = {}) {
  const { section, footerTop, footerMiddleText, footerImg, footerHeading } =
    dom;

  gsap.set([footerTop, footerHeading], {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0% )",
  });

  gsap.set(footerImg, {
    autoAlpha: 0,
    scale: 0.01,
  });

  const footerTextSpit = SplitText.create(footerMiddleText, {
    type: "lines",
    mask: "lines",
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
      end: "bottom bottom",
      scrub: 1,
      once: true,
      invalidateOnRefresh: true,
    },
  });

  tl.to(footerTop, {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100% )",
  });

  tl.from(footerTextSpit.lines, {
    yPercent: 115,
    duration: 2,
    ease: "cubic-bezier(0.76, 0, 0.24, 1)",
  });

  tl.to(footerImg, { autoAlpha: 1, scale: 1 });

  tl.to(footerHeading, {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100% )",
  });
}

export function footerInit(config = {}) {
  const { viewportName } = config;

  const dom = getRootDom();
  if (dom === null) return;

  initOnce(dom);
  createFooterAnimation(dom);
}
