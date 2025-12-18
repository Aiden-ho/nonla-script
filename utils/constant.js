export const BREAKPOINT = {
  MOBILE: "mobile",
  TABLET: "table",
  SMALL_DESKTOP: "small_desktop",
  LARGE_DESKTOP: "large_desktop",
};

export const DIRECTION = {
  VERTICAL: "vertical",
  HORIZON: "horizon",
};

export const VIEWPORTRULES = [
  {
    name: BREAKPOINT.MOBILE,
    query: "(max-width: 767px)",
    condition: (width) => width <= 767,
  },
  {
    name: BREAKPOINT.TABLET,
    query: "(min-width: 768px) and (max-width: 991px)",
    condition: (width) => 768 >= width <= 991,
  },
  {
    name: BREAKPOINT.SMALL_DESKTOP,
    query: "(min-width: 1024px) and (max-width: 1440px)",
    condition: (width) => 1024 >= width <= 1440,
  },
  {
    name: BREAKPOINT.LARGE_DESKTOP,
    query: "(min-width: 1441px)",
    condition: (width) => width >= 1441,
  },
];
