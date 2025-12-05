import { GsapSetup } from "./utils/gsapConfig";
import { heroSectionInit } from "./modules/heroSection";
import { getViewportName, checkMotionReduce } from "./utils/helpers";

function initPage() {
  const viewportName = getViewportName();
  const isMotionReduce = checkMotionReduce();

  GsapSetup();
  heroSectionInit();
}

document.addEventListener("DOMContentLoaded", () => initPage());
