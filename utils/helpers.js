import { BREAKPOINT, VIEWPORTRULES } from "./constant.js";

export function getViewportRule() {
  const screenWidth = document.documentElement.clientWidth;
  const viewport = VIEWPORTRULES.find((rule) => rule.condition(screenWidth));
  return viewport
    ? viewport
    : VIEWPORTRULES.find((r) => r.name === BREAKPOINT.SMALL_DESKTOP);
}

export function checkMotionReduce() {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  return query.matches;
}

export function createRafDebouncer(callback) {
  if (typeof callback !== "function") return () => {};
  let isScheduled = false;

  return function request() {
    if (isScheduled) return;
    isScheduled = true;
    requestAnimationFrame(() => {
      isScheduled = false;
      callback();
    });
  };
}

export function getWindowWidth() {
  return window.innerWidth;
}

export function getWindowHeight() {
  return window.innerHeight;
}

export function getMotionOptByViewport(viewportName, defaultObj, overideObj) {
  let opt = overideObj[viewportName] ? overideObj[viewportName] : defaultObj;
  return opt;
}

export function warn(name, msg, extra) {
  console.warn(name, msg, extra);
}
