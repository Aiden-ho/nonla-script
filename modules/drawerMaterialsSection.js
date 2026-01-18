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

  if (activeItem === null) requestSTRefresh();

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
    if (!activeItem) return;

    const item = activeItem;
    activeItem = null;

    closeItem(item);
  }

  list.addEventListener("click", onClickList);
  overlay.addEventListener("click", onClickOverlay);

  return function destroy() {
    list.removeEventListener("click", onClickList);
    overlay.removeEventListener("click", onClickOverlay);

    items.forEach((item) => {
      item.__tl?.kill();
      item.__split?.revert();
      delete item.__tl;
      delete item.__split;
    });

    activeItem = null;
  };
}
