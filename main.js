import { GsapSetup } from "./utils/gsapConfig.js";
import { heroSectionInit } from "./modules/heroSection.js";
import { getViewportName, checkMotionReduce } from "./utils/helpers.js";

function initPage() {
  const viewportName = getViewportName();
  const isMotionReduce = checkMotionReduce();

  GsapSetup();
  heroSectionInit();
}

document.addEventListener("DOMContentLoaded", () => initPage());
