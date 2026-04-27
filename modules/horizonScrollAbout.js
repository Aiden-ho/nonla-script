import { MEDIARULE, GSAPCONFIG } from "../utils/constant.js";
import { logError, selectElements } from "../utils/helpers.js";
import { STORE } from "../utils/globalStore.js";

const MOTION_DEFAULTS = {
  scrub: 0.8,
  ease: GSAPCONFIG.EASE,
  holdEnd: 0.06,
};

const FIRSTFRAME = "1";

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
    willChange: "transform, clip-path, opacity",
    force3D: true,
  });

  function initMatchMedia() {
    mm.add({ isDesktop: MEDIARULE.desktop.query }, (context) => {
      const motionConfig = MOTION_DEFAULTS;
      const mainDuration = 1;
      const scrollRatio = mainDuration + motionConfig.holdEnd;
      const splitTextInstances = [];

      const mainTl = gsap.timeline({
        defaults: { ease: motionConfig.ease },
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
        const frameNumber = frame.querySelector('[frame-content="number"]');
        const frameDetail = frame.querySelector('[frame-content="detail"]');
        const imgLarge = frame.querySelector('[frame-img="large"]');
        const imgMedium = frame.querySelector('[frame-img="medium"]');
        const medSmallImgs = frame.querySelectorAll(
          '[frame-img="medium"], [frame-img="small"]',
        );
        const imgSmall = frame.querySelector('[frame-img="small"]');

        const imgs = [imgMedium, imgSmall, imgLarge].filter(Boolean); // Lọc bỏ nếu lỡ thiếu DOM
        gsap.set(imgs, { autoAlpha: 0, clipPath: "inset(50%)" });

        let numberLines = [];
        let detailLines = [];

        if (frameNumber) {
          const splitNumber = new SplitText(frameNumber, {
            type: "lines",
            mask: "lines",
          });
          splitTextInstances.push(splitNumber);
          gsap.set(splitNumber.lines, { yPercent: 100, autoAlpha: 0 });
          numberLines = splitNumber.lines;
        }

        if (frameDetail) {
          const splitDetail = new SplitText(frameDetail, {
            type: "lines",
            mask: "lines",
          });
          splitTextInstances.push(splitDetail);
          gsap.set(splitDetail.lines, { yPercent: 100, autoAlpha: 0 });
          detailLines = splitDetail.lines;
        }

        const isFirstFrame = frameName === FIRSTFRAME;

        const stConfig = {
          trigger: isFirstFrame ? wrapper : frame,
          start: isFirstFrame ? "top 20%" : "left 62%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
          // markers: isFirstFrame ? false : true,
          ...(isFirstFrame ? {} : { containerAnimation: mainTl }),
        };

        const frameTl = gsap.timeline({ scrollTrigger: stConfig });

        frameTl
          .to(numberLines, {
            yPercent: 0,
            autoAlpha: 1,
            stagger: 0.05,
            duration: 0.6,
            ease: GSAPCONFIG.SLIT_TEXT_EASE,
          })
          .to(
            detailLines,
            {
              yPercent: 0,
              autoAlpha: 1,
              stagger: 0.05,
              duration: 0.6,
              ease: GSAPCONFIG.SLIT_TEXT_EASE,
            },
            "-=0.4",
          ) // Gối đầu lên Number: Bắt đầu khi Number chạy được 0.2s (0.6 - 0.4)
          .to(
            medSmallImgs,
            {
              autoAlpha: 1,
              clipPath: "inset(0%)",
              duration: 0.8,
              ease: "power3.out",
            },
            "-=0.3",
          ) // Gối đầu lên Detail: Hình ảnh hé ra ngay khi detail vừa hiện
          .to(
            imgLarge,
            {
              autoAlpha: 1,
              clipPath: "inset(0%)",
              duration: 0.8,
              ease: "power3.out",
            },
            "-=0.4",
          );
      });
    });
  }

  if (document.fonts.status === "loaded") {
    initMatchMedia();
  } else {
    document.fonts.ready.then(initMatchMedia);
  }
}
