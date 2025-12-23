import { warn } from "../utils/helpers.js";
import { STORE } from "../utils/globalStore.js";
import { BREAKPOINT } from "../utils/constant.js";

const ROOT_DOM = {
  section: "[data-zoom='section']",
  wrapper: "[data-zoom='wrapper']",
  imgs: "[data-zoom='img']",
};

function createDesktopAnimation() {
  const wrapper = document.querySelector(ROOT_DOM.wrapper);
  const imgs = gsap.utils.toArray(ROOT_DOM.imgs);

  if (!wrapper || !imgs) {
    warn("[3dVariantSection]", "Missing ROOT DOM", { wrapper, imgs });
    return null;
  }

  gsap.set(imgs, {
    opacity: 0.001,
    x: 0,
    y: 0,
    z: 0,
    scale: 0.01,
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: "top top",
      end: "+=" + imgs.length * 100,
      scrub: 1,
      pin: true,
    },
  });

  imgs.forEach((img, index) => {
    const at = index * 0.4;
    tl.to(img, { opacity: 1, duration: 0.01 }, at);
    tl.to(
      img,
      {
        x: () => generateX(index, STORE.VW),
        y: () => generateY(index, STORE.VH),
        z: 2000,
        rotationX: () => (index % 2 === 0 ? -2 : 2),
        rotationY: () => (index % 2 === 0 ? 8 : -8),
        scale: 1,
        ease: "cubic-bezier(0.33, 1, 0.68, 1)",
        duration: 1.2,
      },
      at
    );
  });
}

function createMobileAnimation() {
  const section = document.querySelector(ROOT_DOM.section);
  const imgs = document.querySelectorAll(ROOT_DOM.imgs);

  if (!section || !imgs) {
    warn("[3dVariantSection]", "Missing ROOT DOM", { wrapper, imgs });
    return null;
  }

  const imgWidths = Array.from(imgs).map(
    (el) => el.offsetWidth || el.getBoundingClientRect().width || 0
  );

  const totalHeigth = () =>
    imgWidths.reduce(
      (total_height, item_height) => total_height + item_height + 32,
      0
    );

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${totalHeigth()}px`,
      scrub: true,
      pin: true,
    },
  });

  tl.to(imgs, {
    y: () => -totalHeigth(),
  });
}

function generateY(index, vh) {
  const yOptions = [-0.25, -0.1, 0, 0.1, 0.25]; // các “slot” Y
  const layerOffset = Math.floor(index / yOptions.length) * 0.02;
  const y = vh * (yOptions[index % yOptions.length] + layerOffset);

  return y;
}

function generateX(index, vw) {
  const sideSign = index % 2 === 0 ? -1 : 1;
  const minX = vw * 0.15;
  const maxX = vw * 0.4;
  const random = Math.abs(Math.sign(index + 1) % 1);
  const x = (random * (maxX - minX) + minX) * sideSign;

  return x;
}

const VIEWPORT_MOTION = {
  [BREAKPOINT.MOBILE]: createMobileAnimation,
  [BREAKPOINT.TABLET]: createDesktopAnimation,
  [BREAKPOINT.SMALL_DESKTOP]: createDesktopAnimation,
  [BREAKPOINT.LARGE_DESKTOP]: createDesktopAnimation,
};

export function VariantSectionInit(config) {
  const { viewportName } = config;

  const animation = VIEWPORT_MOTION[viewportName];
  if (!animation) return null;
  animation();
}
