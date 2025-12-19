import { BREAKPOINT, VIEWPORTRULES } from "./constant.js";

export function getViewportRule() {
  const screenWidth = document.documentElement.clientWidth;
  const viewport = VIEWPORTRULES.find((rule) => rule.condition(screenWidth));

  return viewport ? viewport : VIEWPORTRULES[BREAKPOINT.SMALL_DESKTOP];
}

export function checkMotionReduce() {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  return query.matches;
}

export function createResizeScheduler({ targetElement, guardKey, callback }) {
  if (!targetElement || typeof callback !== "function") {
    return () => {};
  }

  if (typeof targetElement[guardKey] === "function") {
    return targetElement[guardKey];
  }
  targetElement[guardKey] = true;

  let isScheduled = false;

  function schedule() {
    if (isScheduled) return;

    isScheduled = true;
    requestAnimationFrame(() => {
      isScheduled = false;
      callback();
    });
  }

  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver(() => {
      schedule();
    });
    resizeObserver.observe(targetElement);
  } else {
    window.addEventListener("resize", schedule, { passive: true });
  }

  // chạy 1 lần ban đầu
  schedule();

  return schedule;
}

export function getWindowWidth() {
  return window.innerWidth;
}
export function getWindowHeight() {
  return window.innerHeight;
}
