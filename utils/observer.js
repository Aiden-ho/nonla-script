import { updateViewport } from "./globalStore.js";
import { debounce } from "./helpers.js";

export const resizeManager = {
  resizeObserver: null,
  init() {
    let lastWidth = window.innerWidth;

    const debouncedRefresh = debounce(() => {
      ScrollTrigger.refresh();
      console.log("ScrollTrigger Refreshed");
    }, 400);

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]; // Vì bạn chỉ observe body
      const currentWidth = entry.contentRect.width;

      if (Math.abs(currentWidth - lastWidth) > 1) {
        lastWidth = currentWidth;
        updateViewport();
        debouncedRefresh();
      }
    });

    // Quan sát Body hoặc Container chính của LDP
    this.resizeObserver.observe(document.body);
  },
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      console.log("ResizeManager Stopped");
    }
  },
};

export const VisibleManager = {
  intersectionObserver: null,
  callbacks: new WeakMap(),

  init(options = { rootMargin: "30px 0px", threshold: 0.01 }) {
    if ("IntersectionObserver" in window) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const action = this.callbacks.get(entry.target);

          if (entry.isIntersecting) {
            if (action?.onEnter) action.onEnter(entry.target);
          } else {
            if (action?.onLeave) action.onLeave(entry.target);
          }
        });
      }, options);
    }
  },

  observe(element, onEnter = null, onLeave = null) {
    if (!element) return;
    if (this.intersectionObserver) {
      this.callbacks.set(element, { onEnter, onLeave });
      this.intersectionObserver.observe(element);
    }
  },

  unobserve(element) {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
      this.callbacks.delete(element);
    }
  },

  disconnect() {
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
  },
};
