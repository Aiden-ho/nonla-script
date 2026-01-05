import { warn } from "../utils/helpers.js";
import { createResizeObserver } from "../utils/observeHelper.js";
import { getLenis } from "../utils/gsapConfig.js";
import { STORE } from "../utils/globalStore.js";

const state = {
  scrollLimit: 0,
  thumbHeight: 0,
  maxThumbY: 0,
  visualThumbY: 0,
  viewportH: 0,
};

const ROOT_DOM = {
  bar: "[custom-scroll='scrollBar']",
  thumb: "[custom-scroll='thumb']",
};

let lastViewportH = STORE.VH;
const RATIO_DAMPING = 0.85;
const TRACK_PADDING = 2;

function calcScrollBar(lenis = {}) {
  if (!lenis || typeof lenis !== "object") return;

  state.viewportH = STORE.VH;
  state.scrollLimit = lenis.limit;
  state.thumbHeight = Math.max(
    (state.viewportH / (state.scrollLimit + state.viewportH)) *
      state.viewportH *
      RATIO_DAMPING,
    40 // min size
  );
  state.maxThumbY = state.viewportH - state.thumbHeight - TRACK_PADDING;
}

function getDom() {
  const bar = document.querySelector(ROOT_DOM.bar);
  const thumb = document.querySelector(ROOT_DOM.thumb);

  if (!bar || !thumb) {
    warn("[customScroll]", "Missing SCROLL DOM", { thumb, bar });
    return null;
  }

  return { bar, thumb };
}

export function customScrollInit() {
  const dom = getDom();
  if (dom === null) return;
  const { thumb, bar } = dom;

  const lenis = getLenis();
  calcScrollBar(lenis);
  thumb.style.height = `${state.thumbHeight}px`;
  gsap.set(document.documentElement, {
    "--_spacing---scroll--bar-width": 0,
    "--_spacing---scroll--bar-padding": 0,
  });

  createResizeObserver(document.documentElement, () => {
    if (STORE.VH === lastViewportH) return;
    lastViewportH = STORE.VH;
    calcScrollBar(lenis);
    thumb.style.height = `${state.thumbHeight}px`;
  });

  lenis.on("scroll", ({ progress, limit }) => {
    state.scrollLimit = limit;
    const targetThumbY = progress * state.maxThumbY;
    state.visualThumbY += (targetThumbY - state.visualThumbY) * 0.15;
    thumb.style.transform = `translate3d(0, ${state.visualThumbY}px, 0)`;
  });
}

export function showCustomeScroll() {
  const dom = getDom();
  if (dom === null) return;
  const { thumb, bar } = dom;

  if (bar) {
    gsap.to(document.documentElement, {
      "--_spacing---scroll--bar-width": 10,
      "--_spacing---scroll--bar-padding": 2,
      duration: 0.2,
    });
  }
}

export function refreshThumbY(lenis) {
  if (!lenis || !state.scrollLimit) return;

  const scroll = lenis.scroll;
  const limit = lenis.limit || state.scrollLimit;

  const progress = scroll / limit;
  const y = progress * state.maxThumbY;

  // ❗ snap ngay, không easing
  state.visualThumbY = y;

  const dom = getDom();
  if (dom === null) return;
  const { thumb } = dom;

  if (thumb) {
    thumb.style.transform = `translate3d(0, ${y}px, 0)`;
  }
}
