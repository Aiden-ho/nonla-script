import { getLenis } from "../utils/gsapConfig.js";
import { showCustomeScroll } from "./customScroll.js";
const ROOT_DOM = {
  section: '[data-loading="section"]',
  sectionInner: '[data-loading="section-inner"]',
  progressWrapper: '[data-loading="progress-wrapper"]',
  progressValue: '[data-loading="progress-value"]',
  messWrapper: '[data-loading="mess-wrapper"]',
  messload: '[data-loading="mess-load"]',
  headingWrapper: '[data-loading="heading-wrapper"]',
  headingLoad: '[data-loading="heading-load"]',
};

export function loadingScreenInit() {
  const section = document.querySelector(ROOT_DOM.section);
  const progressWrapper = section.querySelector(ROOT_DOM.progressWrapper);
  const progressValue = section.querySelector(ROOT_DOM.progressValue);
  const messWrapper = section.querySelector(ROOT_DOM.messWrapper);
  const messload = section.querySelector(ROOT_DOM.messload);
  const headingWrapper = section.querySelector(ROOT_DOM.headingWrapper);
  const headingLoad = section.querySelector(ROOT_DOM.headingLoad);
  const lenis = getLenis();
  lenis.stop();
  progressValue.textContent = "0";
  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    onComplete: () => {
      showCustomeScroll();
      lenis.start();
    },
  });

  tl.to(messWrapper, {
    autoAlpha: 1,
    duration: 0.6,
  });
  tl.to(progressWrapper, {
    autoAlpha: 1,
    duration: 0.4,
  });
  tl.addPause("+=1", () => {
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
      progressValue.textContent = Math.floor(current_percent);
    }, 30);
  });
  tl.to([messWrapper, progressWrapper], {
    height: 0,
    opacity: 0,
    duration: 0.5,
  });
  tl.to(
    {},
    {
      duration: 0.6,
      onStart() {
        const state = Flip.getState(headingWrapper);

        // 2. Đổi layout thật
        messWrapper.style.display = "none";
        progressWrapper.style.display = "none";

        Flip.from(state, {
          duration: 0.6,
          ease: "power2.out",
          absolute: true,
        });
      },
    }
  );
  tl.to(section, { autoAlpha: 0, duration: 1.5 });
}
