import { getLenis } from "../utils/gsapConfig.js";
import { warn } from "../utils/helpers.js";

const ROOT_DOM = {
  section: "[data-footer='section']",
  footerTop: "[data-footer='top']",
  footerMiddleText: "[data-footer='middle-text']",
  footerMiddleImg: "[data-footer='middle-img']",
  footerHeading: "[data-footer='heading']",
};

const TO_TOP_DOM = {
  section: "[data-toTop='section']",
  content: "[data-toTop='content']",
  headingWrapper: "[data-toTop='heading-wrapper']",
  headingInverse: "[data-toTop='heading-inverse']",
  heading: "[data-toTop='heading']",
  trigger: "[data-toTop='trigger']",
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

  if (!footerTop || !footerMiddleText || !footerImg || !footerHeading) {
    warn("[footerSection]", "Missing ROOT DOM", {
      footerTop,
      footerMiddleText,
      footerImg,
      footerHeading,
    });
    return null;
  }

  return {
    section,
    footerTop,
    footerMiddleText,
    footerImg,
    footerHeading,
  };
}

function getToTopDom() {
  const section = document.querySelector(TO_TOP_DOM.section);

  if (!section) {
    warn("[footerSection]", "Missing TO TOP DOM", { section });
    return null;
  }

  const content = section.querySelector(TO_TOP_DOM.content);
  const headingWrapper = section.querySelector(TO_TOP_DOM.headingWrapper);
  const headingInverse = section.querySelector(TO_TOP_DOM.headingInverse);
  const heading = section.querySelector(TO_TOP_DOM.heading);
  const trigger = document.querySelector(TO_TOP_DOM.trigger);

  if (!content || !headingWrapper || !headingInverse || !heading || !trigger) {
    warn("[footerSection]", "Missing TO TOP DOM", {
      content,
      headingWrapper,
      headingInverse,
      trigger,
    });
    return null;
  }

  return {
    content,
    headingWrapper,
    headingInverse,
    trigger,
    section,
  };
}

function initOnce() {
  if (state.isInit) return;
  state.isInit = true;

  const toTopDom = getToTopDom();
  if (toTopDom === null) return;

  const { content, headingWrapper, headingInverse, trigger, section } =
    getToTopDom();

  const lenis = getLenis();

  trigger.addEventListener("click", function () {
    lenis.stop();
    const tl = gsap.timeline();

    tl.to(section, { autoAlpha: 1, duration: 0.4 });
    tl.call(() => {
      lenis.scrollTo(0, {
        immediate: true,
        force: true,
      });
    });
    // tl.to(section, { autoAlpha: 0, duration: 0.4 });
    // tl.call(() => {
    //   lenis.start();
    // });
  });
}

function createFooterAnimation() {
  const dom = getRootDom();
  if (dom === null) return;

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
  initOnce();
  createFooterAnimation();
}
