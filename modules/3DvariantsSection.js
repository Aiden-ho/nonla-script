import { warn, selectElements } from "../utils/helpers.js";
import { STORE } from "../utils/globalStore.js";
import { MEDIARULE } from "../utils/constant.js";

const MOTION_DEFAULTS = {
  scrub: 1.5,
};

const MOTION_MOBILE = {
  scrub: 1,
};

export function VariantSectionInit({ mm }) {
  const moduleName = "[3dVariantSection]";

  const selectors = {
    section: "[data-zoom='section']",
    wrapper: "[data-zoom='wrapper']",
    imgs: "[data-zoom='img']",
  };

  const { imgs: imgSelector, ...rootSelectors } = selectors;
  const dom = selectElements(document, rootSelectors, moduleName);
  if (!dom) return;
  const { section, wrapper } = dom;
  const imgs = gsap.utils.toArray(imgSelector, section);

  if (imgs.length === 0) {
    warn(moduleName, "No images found for", imgSelector);
    return;
  }

  mm.add(
    { isDesktop: MEDIARULE.desktop.query, isMobile: MEDIARULE.mobile.query },
    (context) => {
      const isMobile = context.conditions.isMobile;
      const motionConfig = isMobile ? MOTION_MOBILE : MOTION_DEFAULTS;

      if (isMobile) {
        gsap.set(section, { height: "300vh" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: motionConfig.scrub,
            invalidateOnRefresh: true,
          },
        });

        imgs.forEach((img, i) => {
          tl.fromTo(
            img,
            { yPercent: 150, autoAlpha: 0 },
            {
              yPercent: 0,
              rotation: i * (i % 2 === 0 ? 1 : -1),
              autoAlpha: 1,
              scale: 1,
              duration: 3,
            },
          );
        });
      } else {
        gsap.set(imgs, {
          willChange: "transform, opacity",
          autoAlpha: 0,
          force3D: true,
        });

        gsap.set(wrapper, {
          perspective: 1000,
          transformStyle: "preserve-3d",
        });

        gsap.set(imgs, {
          scale: 0,
          x: 0,
          y: 0,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
        });

        const preComputedData = imgs.map((_, i) => ({
          x: generateX(i, STORE.VW),
          y: generateY(i, STORE.VH),
          rotX: i % 2 === 0 ? -15 : 15,
          rotY: i % 2 === 0 ? 10 : -10,
        }));

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: () => `+=${imgs.length * 400}px`,
            scrub: motionConfig.scrub,
            pin: true,
            invalidateOnRefresh: true,
          },
        });

        imgs.forEach((img, index) => {
          const atTime = index * 0.5;
          const data = preComputedData[index];

          tl.to(img, { autoAlpha: 1, immediateRender: false }, atTime);
          tl.to(
            img,
            {
              x: data.x,
              y: data.y,
              z: 1000, // Random Z depth cho tự nhiên
              rotationX: data.rotX,
              rotationY: data.rotY,
              scale: 1,
              force3D: true,
              ease: "cubic-bezier(0.33, 1, 0.68, 1)",
              duration: 2,
            },
            atTime,
          );

          if (index > 0) {
            tl.to(
              imgs[index - 1],
              {
                autoAlpha: 0,
                display: "none", // Xóa khỏi GPU hoàn toàn
                duration: 0.5,
                overwrite: "auto",
              },
              atTime + 0.5,
            );
          }
        });
      }

      return () => {
        gsap.set([section, wrapper, ...imgs], { clearProps: "all" });
      };
    },
  );
}

function generateY(index, vh) {
  const yOptions = [-0.25, -0.1, 0, 0.1, 0.25];
  const layerOffset = Math.floor(index / yOptions.length) * 0.02;
  return vh * (yOptions[index % yOptions.length] + layerOffset);
}

function generateX(index, vw) {
  const sideSign = index % 2 === 0 ? -1 : 1;
  const minX = vw * 0.15;
  const maxX = vw * 0.4;
  const pseudoRandom = Math.abs(Math.sin(index * 999) % 1);
  const x = (pseudoRandom * (maxX - minX) + minX) * sideSign;
  return x;
}
