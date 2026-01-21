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

let lenis = null;

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

  let footerTextSpit,
    tl = null;

  function init() {
    footerTextSpit = SplitText.create(footerMiddleText, {
      type: "lines",
      mask: "lines",
    });

    tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
      },
    });

    tl.to(footerTop, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100% )",
      duration: 0.5,
      ease: "power3.out",
    });

    tl.from(
      footerTextSpit.lines,
      {
        yPercent: 115,
        ease: "cubic-bezier(0.76, 0, 0.24, 1)",
        duration: 1,
      },
      "<0.2",
    );

    tl.to(
      footerImg,
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      },
      "<0.3",
    );

    tl.to(
      footerHeading,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100% )",
        duration: 0.08,
        ease: "power3.out",
      },
      "<0.4",
    );
  }

  if (document.fonts.status === "loaded") {
    init();
  } else {
    document.fonts.ready.then(init);
  }

  return {
    get tl() {
      return tl;
    },
    get footerTextSpit() {
      return footerTextSpit;
    },
  };
}

export function footerInit(config = {}) {
  const { viewportName } = config;

  const dom = getRootDom();
  if (dom === null) return;
  const { triggerToTop } = dom;

  if (!lenis) {
    lenis = getLenis();
  }

  function clickToTop() {
    scrollToTop();
  }

  triggerToTop.addEventListener("click", clickToTop);
  const { footerTextSpit, tl } = createFooterAnimation(dom);

  return () => {
    tl?.kill();
    footerTextSpit?.revert();
    triggerToTop.removeEventListener("click", clickToTop);
  };
}
