import { GsapSetup } from "./utils/gsapConfig.js";
import { SlittingHeroSectionInit } from "./modules/slittingHeroSection.js";
import { getViewportName, checkMotionReduce } from "./utils/helpers.js";

function initPage() {
  const viewportName = getViewportName();
  const isMotionReduce = checkMotionReduce();
  const context = { viewportName, isMotionReduce };

  GsapSetup();
  SlittingHeroSectionInit(context);
}

document.addEventListener("DOMContentLoaded", () => initPage());
