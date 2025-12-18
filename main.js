import { GsapSetup } from "./utils/gsapConfig.js";
import { checkMotionReduce, getViewportRule } from "./utils/helpers.js";
import { VIEWPORTRULES } from "./utils/constant.js";
import { slittingHeroSectionInit } from "./modules/slittingHeroSection.js";
import { layerStackTopBottom } from "./modules/layerStackTopBottom.js";
import { horizonScrollAboutInit } from "./modules/horizonScrollAbout.js";
import { wheelRotateMomentSectionInit } from "./modules/wheelRotateMoment.js";
import { initMomentsRope } from "./modules/calcRolePosition.js";

const animationModules = [
  slittingHeroSectionInit,
  layerStackTopBottom,
  horizonScrollAboutInit,
  wheelRotateMomentSectionInit,
];

function initPage() {
  GsapSetup();
  initMomentsRope();
  const isMotionReduce = checkMotionReduce();
  const mm = gsap.matchMedia();

  VIEWPORTRULES.forEach((rule) => {
    mm.add(rule.query, () => {
      const ctx = gsap.context(() => {
        const globalConfig = {
          viewportName: rule.name,
          isMotionReduce,
        };

        animationModules.forEach((initModule) => {
          initModule(globalConfig);
        });
      });

      return () => {
        ctx.revert(); // kill tween, ScrollTrigger, clear inline styles
      };
    });
  });
}

document.addEventListener("DOMContentLoaded", () => initPage());
