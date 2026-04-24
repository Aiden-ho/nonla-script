import { GsapSetup } from "./utils/gsapConfig.js";
import { VisibleManager, resizeManager } from "./utils/observer.js";
import { slittingHeroSectionInit } from "./modules/slittingHeroSection.js";
import { layerStackTopBottomInit } from "./modules/layerStackTopBottom.js";
import { horizonScrollAboutInit } from "./modules/horizonScrollAbout.js";
import { wheelRotateMomentSectionInit } from "./modules/wheelRotateMoment.js";
import { expandVideoSectionInit } from "./modules/expandVideosection.js";
import { drawerMaterialsInit } from "./modules/drawerMaterialsSection.js";
import { VariantSectionInit } from "./modules/3DvariantsSection.js";
import { revealMapInit } from "./modules/revealMapSection.js";
import { footerInit } from "./modules/footerSection.js";
import { loadingScreenInit } from "./modules/loadingScreen.js";

const animationModules = [
  loadingScreenInit,
  slittingHeroSectionInit,
  layerStackTopBottomInit,
  horizonScrollAboutInit,
  wheelRotateMomentSectionInit,
  expandVideoSectionInit,
  drawerMaterialsInit,
  VariantSectionInit,
  revealMapInit,
  footerInit,
];

// function initDocumentEvent() {
//   document.addEventListener(
//     "load",
//     (e) => {
//       if (e.target?.tagName === "IMG") {
//         setTimeout(() => requestSTRefresh(), 50);
//       }
//     },
//     true,
//   );
// }

function initPage() {
  GsapSetup();
  // initDocumentEvent();
  resizeManager.init();
  VisibleManager.init();

  const mm = gsap.matchMedia();

  animationModules.forEach((initModule) => {
    initModule({ mm });
  });
}

window.addEventListener("load", () => initPage());
