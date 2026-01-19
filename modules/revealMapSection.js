import {
  warn,
  getMotionOptByViewport,
  createRafDebouncer,
  getViewportRule,
} from "../utils/helpers.js";
import { createResizeObserver } from "../utils/observeHelper.js";
import { BREAKPOINT, GSAPCONFIG } from "../utils/constant.js";
import { STORE } from "../utils/globalStore.js";

const ROOT_DOM = {
  section: "[data-location='section']",
  action: "[data-location='actions']",
  map: "[data-location='map']",
  mapWrapper: "[data-location='map-wrapper']",
  content: "[data-location='content']",
  info: "[data-location='info']",
};

const CONTENT_DOM = {
  heading: "[data-location='heading']",
  text: "[data-location='text']",
};

const state = {
  activeTarget: null,
  isReaveled: false,
};

const DEFAULT_OPT = { pin: true };
const OVERRIDE_OPT = {
  [BREAKPOINT.TABLET]: { pin: false },
  [BREAKPOINT.MOBILE]: { pin: false },
};

function getDOM() {
  const section = document.querySelector(ROOT_DOM.section);

  if (!section) {
    warn("[revealMapSection]", "Missing SECTION DOM", { section });
    return null;
  }

  const content = section.querySelector(ROOT_DOM.content);
  const map = section.querySelector(ROOT_DOM.map);
  const action = section.querySelector(ROOT_DOM.action);
  const mapWrapper = section.querySelector(ROOT_DOM.mapWrapper);

  if (!content || !map || !action || !mapWrapper) {
    warn("[revealMapSection]", "Missing ROOT DOM", {
      content,
      map,
      action,
    });
    return null;
  }

  const heading = content.querySelector(CONTENT_DOM.heading);
  const text = content.querySelector(CONTENT_DOM.text);

  if (!heading || !text) {
    warn("[revealMapSection]", "Missing CONTENT DOM", { heading, text });
    return null;
  }

  const infoList = Array.from(section.querySelectorAll(ROOT_DOM.info));

  if (!infoList.length) {
    warn("[revealMapSection]", "Missing INFO DOM", { infoList });
    return null;
  }

  return { section, map, action, heading, text, infoList, mapWrapper };
}

function createRevealMapAnimation(dom = {}, motionConfig = {}) {
  const { section, map, action, heading, text } = dom;
  const { pin } = motionConfig;
  gsap.set([map, action], { autoAlpha: 0 });

  let headinngSpit, textSpit, tl;

  function init() {
    headinngSpit = SplitText.create(heading, {
      type: "lines",
      mask: "lines",
    });

    textSpit = SplitText.create(text, {
      type: "lines",
      mask: "lines",
    });

    tl = gsap.timeline({
      defaults: { ease: GSAPCONFIG.EASE },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom 10%",
        pin,
        pinSpacing: pin,
        invalidateOnRefresh: true,
        toggleActions: "play reverse play reverse",
      },
      onComplete: () => (state.isReaveled = true),
    });

    tl.from(
      headinngSpit.lines,
      {
        yPercent: 115,
        ease: GSAPCONFIG.SLIT_TEXT_EASE,
        stagger: 0.04,
      },
      0,
    )
      .from(
        textSpit.lines,
        {
          yPercent: 115,
          ease: GSAPCONFIG.SLIT_TEXT_EASE,
          stagger: 0.04,
        },
        ">",
      )
      .to(map, { autoAlpha: 1, duration: 0.5 }, "<+=0.2")
      .to(action, { autoAlpha: 1, duration: 0.5 }, "<");
  }

  if (document.fonts.status === "loaded") {
    init();
  } else {
    document.fonts.ready.then(init);
  }

  return {
    // tl,
    // headinngSpit,
    // textSpit,
    get tl() {
      return tl;
    },
    get headinngSpit() {
      return headinngSpit;
    },
    get textSpit() {
      return textSpit;
    },
  };
}

function setActive(dom, target) {
  if (state.activeTarget === target) return;

  if (state.activeTarget) {
    toggleState(dom, state.activeTarget, false);
  }

  state.activeTarget = target;
  toggleState(dom, target, true);
}

function toggleState(dom = {}, target, isActive) {
  const { map, action, infoList, section } = dom;

  const pin = map.querySelector(`[data-target="${target}"]`);
  const tab = action.querySelector(`[data-target="${target}"]`);
  const infos = infoList.filter((el) => el.dataset.key === target);

  if (!pin || !tab || !infos.length) {
    debugger;
    warn("[revealMapSection]", "Missing TOGGLE DOM", {
      pin,
      tab,
      infos,
    });
    return;
  }

  pin.classList.toggle("is-actived", isActive);
  tab.classList.toggle("is-actived", isActive);
  // info.classList.toggle("is-actived", isActive);

  infos.forEach((el) => {
    el.classList.toggle("is-actived", isActive);
  });

  const currentViewport = getViewportRule().name;
  if (currentViewport === BREAKPOINT.MOBILE && isActive) {
    focusPinToWrapper(pin, map, section);
  }
}

function focusPinToWrapper(pin, map, section) {
  const wrapper = section.querySelector(ROOT_DOM.mapWrapper);

  if (!wrapper) {
    warn("[revealMapSection]", "Missing WRAPPER MAP DOM");
    return;
  }

  const pinRect = pin.getBoundingClientRect();
  const mapRect = map.getBoundingClientRect();

  const pinCenterX = pinRect.left + pinRect.width / 2;
  const pinCenterY = pinRect.top + pinRect.height / 2;

  const mapCenterX = mapRect.left + mapRect.width / 2;
  const mapCenterY = mapRect.top + mapRect.height / 2;

  const dx = mapCenterX - pinCenterX;
  const dy = mapCenterY - pinCenterY;

  gsap.to(wrapper, {
    x: `+=${dx}`,
    y: `+=${dy}`,
    duration: 0.6,
    ease: "power3.out",
  });
}

export function revealMapInit(config) {
  const { viewportName } = config;

  const dom = getDOM();
  if (dom == null) return null;
  const { map, action, mapWrapper, section } = dom;

  const motionConfig = getMotionOptByViewport(
    viewportName,
    DEFAULT_OPT,
    OVERRIDE_OPT,
  );

  if (viewportName === BREAKPOINT.MOBILE) {
    setActive(dom, "HN");
  }

  const { headinngSpit, textSpit, tl } = createRevealMapAnimation(
    dom,
    motionConfig,
  );

  function clickAction(e) {
    if (!state.isReaveled) return;
    const tab = e.target.closest("[data-target]");
    if (!tab) return;
    setActive(dom, tab.dataset.target);
  }

  function clickMap(e) {
    if (!state.isReaveled) return;
    const pin = e.target.closest(".pin");
    if (!pin) return;
    setActive(dom, pin.dataset.target);
  }

  action.addEventListener("click", clickAction);
  map.addEventListener("click", clickMap);

  createResizeObserver(
    section,
    createRafDebouncer(() => {
      const w = window.innerWidth;
      if (w === STORE.VW) return;

      const currentViewport = getViewportRule().name;
      if (currentViewport === BREAKPOINT.MOBILE) {
        setActive(dom, "HN");
      } else {
        gsap.killTweensOf(mapWrapper);
        gsap.set(mapWrapper, { clearProps: "transform" });
      }
    }),
  );

  return function destroy() {
    if (state.activeTarget) {
      toggleState(dom, state.activeTarget, false);
      state.activeTarget = null;
    }
    state.isReaveled = false;

    tl?.kill();
    headinngSpit?.revert();
    textSpit?.revert();

    gsap.killTweensOf(mapWrapper);
    gsap.set(mapWrapper, { clearProps: "transform" });

    action.removeEventListener("click", clickAction);
    map.removeEventListener("click", clickMap);
  };
}
