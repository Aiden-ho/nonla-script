import { requestSTRefresh } from "../utils/helpers.js";
import { getLenis } from "../utils/gsapConfig.js";

export function scrollToTop() {
  const lenis = getLenis();
  lenis.stop();
  lenis.scrollTo(0, {
    immediate: true,
    force: true,
    onComplete: () => {
      requestSTRefresh();
      lenis.start();
    },
  });
}
