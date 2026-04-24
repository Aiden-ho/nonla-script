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

export const requestSTRefresh = createRafDebouncer(() =>
  ScrollTrigger.refresh(),
);

export function getMotionOptByViewport(viewportName, defaultObj, overideObj) {
  let opt = overideObj[viewportName] ? overideObj[viewportName] : defaultObj;
  return opt;
}

export function warn(name, msg, extra) {
  console.warn(name, msg, extra);
}

////----------NEW

export const debounce = (func, delay = 100) => {
  let timeoutID;
  return function (...args) {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => func.apply(this, args), delay);
  };
};

export function logError(moduleName, key, selector) {
  console.error(
    `%c[${moduleName}]%c Missing element: %c${key} %c(selector: "${selector}")`,
    "color: #ff4757; font-weight: bold;", // red for moduleName
    "color: default;",
    "color: #ffa502; font-weight: bold;", // yellow for key
    "color: #747d8c; font-style: italic;", // grey for selector
  );
}

export function selectElements(
  parent,
  selectors,
  moduleName = "Unknown Module",
) {
  const dom = {};
  let hasError = false;

  for (const [key, selector] of Object.entries(selectors)) {
    const root = parent || document;
    const element = root.querySelector(selector);

    if (!element) {
      logError(moduleName, key, selector);
      hasError = true;
    }
    dom[key] = element;
  }
  return hasError ? null : dom;
}
