import { GsapSetup } from "./utils/gsapConfig.js";
import { checkMotionReduce, createRafDebouncer } from "./utils/helpers.js";
import { VIEWPORTRULES } from "./utils/constant.js";
import {
  triggerPlayVideo,
  createResizeObserver,
} from "./utils/observeHelper.js";
import { STORE, updateViewport } from "./utils/globalStore.js";
import { slittingHeroSectionInit } from "./modules/slittingHeroSection.js";
import { layerStackTopBottomInit } from "./modules/layerStackTopBottom.js";
import { horizonScrollAboutInit } from "./modules/horizonScrollAbout.js";
import { wheelRotateMomentSectionInit } from "./modules/wheelRotateMoment.js";
import { initMomentsRope } from "./modules/calcRolePosition.js";
import { expandVideoSectionInit } from "./modules/expandVideosection.js";
import { drawerMaterialsInit } from "./modules/drawerMaterialsSection.js";
import { VariantSectionInit } from "./modules/3DvariantsSection.js";

const animationModules = [
  slittingHeroSectionInit,
  layerStackTopBottomInit,
  horizonScrollAboutInit,
  wheelRotateMomentSectionInit,
  expandVideoSectionInit,
  drawerMaterialsInit,
  VariantSectionInit,
];

const requestSTRefresh = createRafDebouncer(() => ScrollTrigger.refresh());

function initOnce() {
  //observer resize
  createResizeObserver(document.documentElement, () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (w === STORE.VW && h === STORE.VH) return;

    updateViewport();
    requestSTRefresh();
  });

  //watch load img
  document.addEventListener(
    "load",
    (e) => {
      if (e.target?.tagName === "IMG") {
        requestSTRefresh();
      }
    },
    true
  );
}

function initPage() {
  GsapSetup();
  initOnce();
  initMomentsRope();
  triggerPlayVideo();
  updateViewport();
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
  requestSTRefresh();
}

document.addEventListener("DOMContentLoaded", () => initPage());
