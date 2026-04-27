import { GSAPCONFIG, MEDIARULE } from "../utils/constant.js";
import { selectElements } from "../utils/helpers.js";

let activeItem = null;

export function drawerMaterialsInit({ mm }) {
  const moduleName = "[drawerMaterialsSection]";

  const selectors = {
    list: '[data-drawer="list"]',
    item: '[data-drawer="item"]',
    overlay: '[data-drawer="overlay"]',
    desc: '[data-drawer="desc"]',
    img: '[data-drawer="img"]',
  };

  const {
    item: itemSelector,
    desc: descSelector,
    img: imgSelector,
    ...rootSelectors
  } = selectors;

  const dom = selectElements(null, rootSelectors, moduleName);
  if (!dom) return;
  const { list, overlay } = dom;

  mm.add(
    { isDesktop: MEDIARULE.desktop.query, isMobile: MEDIARULE.mobile.query },
    (context) => {
      function createItemAnimation(item, onReady) {
        if (item.__tl) {
          if (onReady) onReady();
          return;
        }

        const dom = selectElements(
          item,
          { img: imgSelector, desc: descSelector },
          moduleName,
        );
        if (!dom) return;
        const { img, desc } = dom;

        const init = () => {
          context.add(() => {
            const tl = gsap.timeline({ paused: true });
            const descSpilt = SplitText.create(desc, {
              type: "lines",
              mask: "lines",
            });

            gsap.set(descSpilt.lines, { yPercent: 115 });
            gsap.set(img, { autoAlpha: 0 });

            tl.to(
              descSpilt.lines,
              {
                yPercent: 0,
                duration: 0.6,
                ease: GSAPCONFIG.SLIT_TEXT_EASE,
                stagger: 0.04,
              },
              "0",
            ).to(
              img,
              {
                autoAlpha: 1,
                duration: 0.02,
              },
              "-=0.4",
            );

            item.__tl = tl;
            item.__split = descSpilt;

            if (onReady) onReady(); // Gọi chạy sau khi setup xong
          });
        };

        if (document.fonts.status === "loaded") {
          init();
        } else {
          document.fonts.ready.then(init);
        }
      }

      function onClickList(e) {
        const item = e.target.closest(itemSelector);
        if (!item || activeItem === item) return;

        // Xử lý item cũ
        if (activeItem) {
          activeItem.classList.remove("is-actived");
          activeItem.__tl?.reverse();
        }

        // Tạo (hoặc gọi lại) animation cho item mới và Play qua callback
        createItemAnimation(item, () => {
          item.classList.add("is-actived");
          item.__tl.play();
          activeItem = item;
        });
      }

      list.addEventListener("click", onClickList);
      overlay.addEventListener("click", resetDrawer);

      return () => {
        list.removeEventListener("click", onClickList);
        overlay.removeEventListener("click", resetDrawer);

        const items = list.querySelectorAll(itemSelector);
        items.forEach((item) => {
          item.classList.remove("is-actived");
          item.__split?.revert();
          delete item.__split;
          delete item.__tl;
        });
        activeItem = null;
      };
    },
  );
}

export function resetDrawer() {
  if (!activeItem) return;
  activeItem.classList.remove("is-actived");
  activeItem.__tl?.reverse();
  activeItem = null;
}
