import { MEDIARULE, GSAPCONFIG } from "../utils/constant.js";
import { logError, selectElements } from "../utils/helpers.js";
import { STORE } from "../utils/globalStore.js";

const MOTION_DEFAULTS = {
  scrub: 0.8,
  ease: GSAPCONFIG.EASE,
  holdEnd: 0.06,
};

const FRAMEITEM = {
  FIRST: "1",
  SECOND: "2",
};

const getHorizontalPoint = (el, percentage, edge = "right") => {
  return () => {
    const imgSpec = el.getBoundingClientRect();
    let point;
    if (edge === "left") {
      const left =
        imgSpec.left > STORE.VW ? imgSpec.left - STORE.VW : imgSpec.left;
      point = left * percentage;
    } else {
      const right =
        imgSpec.right > STORE.VW ? imgSpec.right - STORE.VW : imgSpec.right;
      point = right * percentage;
    }

    return `${edge} ${point}px`;
  };
};

export function horizonScrollAboutInit({ mm }) {
  const moduleName = "[horizonScrollAbout]";
  const wrapper = document.querySelector('[data-horizon="wrapper"]');

  if (!wrapper) {
    logError(moduleName, wrapper, '[data-slit="wrapper"]');
    return;
  }

  const selectors = {
    tracker: '[data-horizon="tracker"]',
    progress: '[data-horizon="progress"]',
    progressValue: '[data-horizon="progress-value"]',
    frameItem: '[data-horizon="frame-item"]',
  };

  const dom = selectElements(wrapper, selectors, moduleName);
  if (!dom) return;
  const { tracker, progress, progressValue } = dom;

  const getAmount = () => {
    const diff = tracker.scrollWidth - wrapper.clientWidth;
    return diff > 0 ? -diff : 0;
  };

  const frameItems = wrapper.querySelectorAll(selectors.frameItem);

  if (!frameItems.length) {
    logError(moduleName, wrapper, selectors.frameItem);
    return;
  }

  gsap.set(frameItems, {
    willChange: "transform, clip-path",
    force3D: true,
  });

  mm.add({ isDesktop: MEDIARULE.desktop.query }, (context) => {
    const motionConfig = MOTION_DEFAULTS;
    const mainDuration = 1;
    const scrollRatio = mainDuration + motionConfig.holdEnd;

    const mainTl = gsap.timeline({
      defaults: {
        ease: motionConfig.ease, // make all tweens use a ease of none, feels nicer with working with scrub
      },
      scrollTrigger: {
        trigger: wrapper,
        start: "top top",
        end: () => `+=${Math.abs(getAmount()) * scrollRatio}`,
        pin: true,
        pinSpacing: true,
        scrub: motionConfig.scrub,
        invalidateOnRefresh: true,
      },
    });

    mainTl
      .to(tracker, {
        x: () => getAmount(),
        duration: mainDuration,
        lazy: true,
      })
      .to(
        progressValue,
        {
          right: "0%",
          transformOrigin: "center left",
          duration: mainDuration,
        },
        "<",
      );
    mainTl.to({}, { duration: motionConfig.holdEnd });

    Array.from(frameItems).forEach((frame) => {
      const frameName = frame.getAttribute("frame-name");
      const imgLarge = frame.querySelector('[frame-img="large"]');
      const imgMedium = frame.querySelector('[frame-img="medium"]');
      const imgSmall = frame.querySelector('[frame-img="small"]');

      gsap.set(imgLarge, { clipPath: "inset(20%)" });
      gsap.to(imgLarge, {
        clipPath: "inset(0%)",
        scrollTrigger: {
          trigger: imgLarge,
          containerAnimation: mainTl, // Kết nối với Main Timeline của bạn
          start: "left 33%",
          end: "left 10%",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      if (frameName === FRAMEITEM.FIRST) {
        gsap.from(imgSmall, {
          xPercent: 60,
          scrollTrigger: {
            trigger: imgSmall,
            containerAnimation: mainTl, // Kết nối với Main Timeline của bạn
            start: getHorizontalPoint(imgSmall, 0.9, "right"),
            end: getHorizontalPoint(imgSmall, 0.4, "right"),
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        gsap.to(imgMedium, {
          xPercent: -10,
          scrollTrigger: {
            trigger: imgMedium,
            containerAnimation: mainTl,
            start: getHorizontalPoint(imgMedium, 0.9, "left"),
            end: getHorizontalPoint(imgMedium, 0.2, "left"),
            scrub: 2,
            invalidateOnRefresh: true,
          },
        });
      } else if (frameName === FRAMEITEM.SECOND) {
        gsap.to(imgSmall, {
          xPercent: -100,
          scrollTrigger: {
            trigger: imgSmall,
            containerAnimation: mainTl, // Kết nối với Main Timeline của bạn
            start: getHorizontalPoint(imgSmall, 0.9, "left"),
            end: getHorizontalPoint(imgSmall, 0.7, "left"),
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.to(imgMedium, {
          xPercent: 50,
          scrollTrigger: {
            trigger: imgMedium,
            containerAnimation: mainTl,
            start: getHorizontalPoint(imgMedium, 0.9, "left"),
            end: getHorizontalPoint(imgMedium, 0.6, "left"),
            scrub: 2,
            invalidateOnRefresh: true,
          },
        });
      }
    });
  });
}
