import { requestSTRefresh } from "../utils/helpers.js";
import { getLenis } from "../utils/gsapConfig.js";
import { resetDrawer } from "./drawerMaterialsSection.js";

export function scrollToTop() {
  const lenis = getLenis();
  lenis.stop();
  lenis.scrollTo(0, {
    immediate: true,
    force: true,
    onComplete: () => {
      resetDrawer();
      requestSTRefresh();
      lenis.start();
    },
  });
}
