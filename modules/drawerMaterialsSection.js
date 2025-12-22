import { createRafDebouncer, warn } from "../utils/helpers.js";
import { createResizeObserver } from "../utils/observeHelper.js";

const ROOT_DOM = {
  list: '[data-drawer="list"]',
  item: '[data-drawer="item"]',
  overlay: '[data-drawer="overlay"]',
};

const ITEM_DOM = {
  content: '[data-drawer="content"]',
  desc: '[data-drawer="desc"]',
  img: '[data-drawer="img"]',
};

const state = {
  isInit: false,
  activeItem: null,
};

const measureHeight = new Map();

function initEventOnce() {
  if (state.isInit) return;
  state.isInit = true;

  const list = document.querySelector(ROOT_DOM.list);
  const overlay = document.querySelector(ROOT_DOM.overlay);

  if (!list || !overlay) {
    warn("[drawerMaterialsSection]", "Root DOM missing", { list, overlay });
    return null;
  }

  list.addEventListener("click", function (e) {
    const item = e.target.closest(ROOT_DOM.item);

    if (!item) {
      warn("[drawerMaterialsSection]", "Root DOM missing", { item });
      return null;
    }

    if (state.activeItem === item) return;

    if (state.activeItem) {
      closeItem(state.activeItem);
    }

    createItemAnimation(item);
    openItem(item);
  });

  overlay.addEventListener("click", () => {
    if (!state.activeItem) return;
    closeItem(state.activeItem);
    state.activeItem = null;
  });
}

function getItemDOM(item) {
  return {
    content: item.querySelector(ITEM_DOM.content),
    desc: item.querySelector(ITEM_DOM.desc),
    img: item.querySelector(ITEM_DOM.img),
  };
}

function openItem(item) {
  const { content } = getItemDOM(item);

  if (!content) {
    warn("[drawerMaterialsSection]", "Item missing content", item);
    return null;
  }

  let height = measureHeight.get(item);
  if (!height) {
    height = getMeasureHeight(item, content);
    setupROMeasureHeight(item, content);
  }

  item.style.setProperty("--expand-height", `${height}px`);
  item.classList.add("is-actived");
  state.activeItem = item;
  item.__tl.play();
}

function closeItem(item) {
  item.classList.remove("is-actived");
  item.__tl.reverse();
}

function getMeasureHeight(item, content) {
  const height = content.scrollHeight;
  measureHeight.set(item, height);

  return height;
}

function setupROMeasureHeight(item, content) {
  const update = createRafDebouncer(() => {
    const newHeight = content.scrollHeight;
    measureHeight.set(item, newHeight);

    // 🔥 nếu item đang mở → update ngay
    if (state.activeItem === item) {
      item.style.setProperty("--expand-height", `${newHeight}px`);
    }
  });

  createResizeObserver(content, update);
}

// Make animation functions
function createItemAnimation(item) {
  if (item.__tl) return;

  const { desc, img } = getItemDOM(item);

  if (!desc || !img) {
    warn("[drawerMaterialsSection] Missing DOM DESC");
    return null;
  }

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
      ease: "cubic-bezier(0.76, 0, 0.24, 1)",
      stagger: 0.04,
    },
    "0"
  ).to(
    img,
    {
      opacity: 1,
      duration: 0.4,
    },
    "0"
  );

  tl.eventCallback("onReverseComplete", () => {
    item.classList.remove("is-actived");
  });

  item.__tl = tl;
}

export function drawerMaterialsInit(config) {
  const { viewportName } = config;
  initEventOnce();
}
