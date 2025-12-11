import { BREAKPOINT } from "./constant.js";

const viewportRules = [
  { name: BREAKPOINT.MOBILE, condition: (width) => width <= 475 },
  { name: BREAKPOINT.TABLET, condition: (width) => width <= 768 },
  { name: BREAKPOINT.SMALL_DESKTOP, condition: (width) => width <= 1440 },
  { name: BREAKPOINT.LARGE_DESKTOP, condition: (width) => width <= 1920 },
];

export function getViewportName() {
  const screenWidth = document.documentElement.clientWidth;
  console.log(screenWidth);
  const viewport = viewportRules.find((rule) => rule.condition(screenWidth));

  return viewport ? viewport.name : BREAKPOINT.SMALL_DESKTOP;
}

export function checkMotionReduce() {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  return query.matches;
}
