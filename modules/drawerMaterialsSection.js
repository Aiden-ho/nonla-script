import { warn } from "../utils/helpers.js";
import { GSAPCONFIG } from "../utils/constant.js";
import { requestSTRefresh } from "../utils/helpers.js";

const ROOT_DOM = {
  list: '[data-drawer="list"]',
  item: '[data-drawer="item"]',
  overlay: '[data-drawer="overlay"]',
};

const ITEM_DOM = {
  desc: '[data-drawer="desc"]',
  img: '[data-drawer="img"]',
};

let activeItem = null;
let hasExpandedOnce = false;

function getItemDOM(item) {
  const desc = item.querySelector(ITEM_DOM.desc);
  const img = item.querySelector(ITEM_DOM.img);

  if (!desc || !img) {
    warn("[drawerMaterialsSection]", "Item missing content", {
      content,
      desc,
      img,
    });

    return null;
  }

  return { desc, img };
}

function openItem(item) {
  item.classList.add("is-actived");
  if (!hasExpandedOnce) {
    gsap.delayedCall(0.01, () => {
      requestSTRefresh();
      hasExpandedOnce = true;
    });
  }
  // if (activeItem === null) requestSTRefresh();

  activeItem = item;
  item.__tl?.play();
}

function closeItem(item) {
  item.classList.remove("is-actived");
  item.__tl?.reverse();
}

// Make animation functions
function createItemAnimation(item) {
  if (item.__tl) return;

  const { desc, img } = getItemDOM(item);
  if (!desc || !img) return null;
  function init() {
    const tl = gsap.timeline({ paused: true });
    const descSpilt = SplitText.create(desc, {
      type: "lines",
      mask: "lines",
    });

    tl.from(
      descSpilt.lines,
      {
        yPercent: 115,
        duration: 1,
        ease: GSAPCONFIG.SLIT_TEXT_EASE,
        stagger: 0.04,
      },
      "0",
    ).to(
      img,
      {
        opacity: 1,
        duration: 0.4,
      },
      "0",
    );

    item.__tl = tl;
    item.__split = descSpilt;
  }

  if (document.fonts.status === "loaded") {
    init();
  } else {
    document.fonts.ready.then(init);
  }
}

export function resetDrawer() {
  if (!activeItem) return;

  const item = activeItem;
  activeItem = null;
  closeItem(item);
}

export function drawerMaterialsInit(config) {
  const { viewportName } = config;

  const list = document.querySelector(ROOT_DOM.list);
  const overlay = document.querySelector(ROOT_DOM.overlay);

  if (!list || !overlay) {
    warn("[drawerMaterialsSection]", "Root DOM missing", { list, overlay });
    return null;
  }

  function onClickList(e) {
    const item = e.target.closest(ROOT_DOM.item);
    if (!item) return;

    if (activeItem === item) return;

    if (activeItem) {
      closeItem(activeItem);
    }

    createItemAnimation(item);
    openItem(item);
  }

  function onClickOverlay() {
    resetDrawer();
  }

  list.addEventListener("click", onClickList);
  overlay.addEventListener("click", onClickOverlay);

  return function destroy() {
    if (activeItem) {
      const item = activeItem;
      activeItem = null;

      // NOTE: force timeline về start, KHÔNG animate
      item.__tl?.pause(0);
      item.classList.remove("is-actived");
    }

    list.removeEventListener("click", onClickList);
    overlay.removeEventListener("click", onClickOverlay);
    const items = list.querySelectorAll(ROOT_DOM.item);

    items.forEach((item) => {
      item.__tl?.kill();
      item.__split?.revert();

      gsap.set(item.querySelectorAll(`${ITEM_DOM.desc}, ${ITEM_DOM.img}`), {
        clearProps: "all",
      });

      delete item.__tl;
      delete item.__split;
    });

    activeItem = null;
    hasExpandedOnce = false;
  };
}
