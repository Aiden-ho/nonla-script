import { getLenis } from "../utils/gsapConfig.js";
import { warn } from "../utils/helpers.js";
const ROOT_DOM = {
  section: '[data-loading="section"]',
  sectionInner: '[data-loading="section-inner"]',
  messWrapper: '[data-loading="mess-wrapper"]',
  messload: '[data-loading="mess-load"]',
  messholder: '[data-loading="mess-holder"]',
  headingWrapper: '[data-loading="heading-wrapper"]',
  headingLoad: '[data-loading="heading-load"]',
};

function getDom() {
  const section = document.querySelector(ROOT_DOM.section);
  if (!section) {
    warn("[loadingScreen]", "Missing Root Dom", { section });
    return null;
  }

  const messWrapper = section.querySelector(ROOT_DOM.messWrapper);
  const messload = section.querySelector(ROOT_DOM.messload);
  const messholder = section.querySelector(ROOT_DOM.messholder);
  const headingWrapper = section.querySelector(ROOT_DOM.headingWrapper);
  const headingLoad = section.querySelector(ROOT_DOM.headingLoad);

  if (
    !messWrapper ||
    !messload ||
    !messholder ||
    !headingWrapper ||
    !headingLoad
  ) {
    warn("[loadingScreen]", "Missing Root Dom", { section });
    return null;
  }

  return {
    messWrapper,
    messload,
    messholder,
    headingWrapper,
    headingLoad,
    section,
  };
}

export function loadingScreenInit() {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const dom = getDom();
  if (dom === null) return;

  const {
    messWrapper,
    messload,
    messholder,
    headingWrapper,
    headingLoad,
    section,
  } = dom;

  const lenis = getLenis();
  if (lenis) {
    lenis.stop(); // Khóa scroll
    lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo(0, 0);
  }

  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.clearScrollMemory("manual");
  }

  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    // onComplete: () => {
    //   if (lenis) lenis.start();
    // },
  });

  tl.to(messWrapper, {
    autoAlpha: 1,
    duration: 0.6,
  });
  tl.addPause("+=0.6", () => {
    const limit_percent = 100;
    let current_percent = 0;
    const interval = setInterval(() => {
      current_percent += 1;
      if (current_percent > limit_percent) {
        clearInterval(interval);
        return tl.play();
      }
      const clip = `polygon( 0 0, 0 100%, ${current_percent}% 100%, ${current_percent}% 0)`;
      messload.style.clipPath = clip;
      headingLoad.style.clipPath = clip;
    }, 30);
  });
  tl.to(messholder, {
    autoAlpha: 0,
    duration: 0.1,
  });
  tl.to(messload, {
    yPercent: 100,
    duration: 0.6,
    ease: "power2.out",
  });
  tl.to(
    {},
    {
      duration: 1,
      onStart() {
        const state = Flip.getState(headingWrapper);

        // 2. Đổi layout thật
        messWrapper.style.display = "none";

        Flip.from(state, {
          duration: 1,
          ease: "power2.out",
          absolute: true,
        });
      },
    },
    ">",
  );
  tl.to(section, {
    autoAlpha: 0,
    duration: 1.5,
    onStart: () => {
      // 1. Trả lại quyền scroll ngay khi màn hình loading BẮT ĐẦU mờ đi
      if (lenis) lenis.start();

      // 2. Refresh lại ScrollTrigger (rất quan trọng)
      // Vì lúc này layout thật mới chính thức lộ diện,
      // cần tính lại tọa độ cho mấy cái Pin/Sticky ở dưới.
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    },
    onComplete: () => {
      // Dọn dẹp DOM cho nhẹ máy (autoAlpha đã lo visibility hidden,
      // nhưng set display none sẽ gỡ element ra khỏi render tree)
      section.style.display = "none";
    },
  });
}
