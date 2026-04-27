import { warn } from "../utils/helpers.js";
import { GSAPCONFIG, MEDIARULE } from "../utils/constant.js";

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
  isRevealed: false,
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

function setActive(dom, target, isMobile) {
  if (state.activeTarget === target) return;

  if (state.activeTarget) {
    toggleState(dom, state.activeTarget, false, isMobile);
  }

  state.activeTarget = target;
  toggleState(dom, target, true, isMobile);
}

function toggleState(dom = {}, target, isActive, isMobile) {
  const { map, action, infoList, section } = dom;

  const pin = map.querySelector(`[data-target="${target}"]`);
  const tab = action.querySelector(`[data-target="${target}"]`);
  const infos = infoList.filter((el) => el.dataset.key === target);

  if (!pin || !tab || !infos.length) {
    warn("[revealMapSection]", "Missing TOGGLE DOM", {
      pin,
      tab,
      infos,
    });
    return;
  }

  pin.classList.toggle("is-actived", isActive);
  tab.classList.toggle("is-actived", isActive);

  infos.forEach((el) => {
    el.classList.toggle("is-actived", isActive);
  });

  if (isMobile && isActive) {
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

export function revealMapInit({ mm }) {
  const dom = getDOM();
  if (!dom) return;

  function initMatchMedia() {
    mm.add(
      {
        isDesktop: MEDIARULE.desktop.query,
        isMobile: MEDIARULE.mobile.query,
      },
      (context) => {
        const { isDesktop, isMobile } = context.conditions;
        const { section, map, action, mapWrapper, heading, text } = dom;

        // 1. Khởi tạo trạng thái ban đầu
        gsap.set([map, action], { autoAlpha: 0 });

        // SplitText
        const headingSplit = SplitText.create(heading, {
          type: "lines",
          mask: "lines",
        });
        const textSplit = SplitText.create(text, {
          type: "lines",
          mask: "lines",
        });

        gsap.set(headingSplit.lines, { yPercent: 100, autoAlpha: 0 });
        gsap.set(textSplit.lines, { yPercent: 100, autoAlpha: 0 });

        // 2. Setup Timeline
        const tl = gsap.timeline({
          defaults: { ease: GSAPCONFIG.EASE },
          scrollTrigger: {
            trigger: section,
            start: "top 20%",
            end: "bottom bottom",
            toggleActions: "play none none none",
            invalidateOnRefresh: true,
          },
          onComplete: () => {
            state.isRevealed = true;
          },
        });

        tl.to(
          headingSplit.lines,
          {
            yPercent: 0,
            autoAlpha: 1,
            stagger: 0.05,
            duration: 0.6,
            ease: GSAPCONFIG.SLIT_TEXT_EASE,
          },
          0,
        )
          .to(
            textSplit.lines,
            {
              yPercent: 0,
              autoAlpha: 1,
              stagger: 0.05,
              duration: 0.6,
              ease: GSAPCONFIG.SLIT_TEXT_EASE,
            },
            "-=0.4",
          )
          .to(map, { autoAlpha: 1, duration: 0.5 }, "<+=0.2")
          .to(action, { autoAlpha: 1, duration: 0.5 }, "<");

        // 3. Xử lý Logic Viewport ban đầu
        if (isMobile) {
          setActive(dom, "HN", isMobile);
        } else {
          // Khi từ Mobile về Desktop, clear transform của wrapper do hàm focusPinToWrapper gây ra
          gsap.set(mapWrapper, { clearProps: "transform" });
        }

        // 4. Khai báo Event Listeners trong Context
        const clickAction = (e) => {
          if (!state.isRevealed) return;
          const tab = e.target.closest("[data-target]");
          if (tab) setActive(dom, tab.dataset.target, isMobile);
        };

        const clickMap = (e) => {
          if (!state.isRevealed) return;
          const pin = e.target.closest(".pin");
          if (pin) setActive(dom, pin.dataset.target, isMobile);
        };

        action.addEventListener("click", clickAction);
        map.addEventListener("click", clickMap);

        // 5. Cleanup Function (Tự động chạy khi Breakpoint thay đổi hoặc component destroy)
        return () => {
          state.isRevealed = false;
          action.removeEventListener("click", clickAction);
          map.removeEventListener("click", clickMap);

          // Revert Text
          headingSplit.revert();
          textSplit.revert();

          // Reset active states
          if (state.activeTarget) {
            toggleState(dom, state.activeTarget, false, isMobile);
            state.activeTarget = null;
          }

          // Clear toàn bộ inline CSS để không rác DOM khi chuyển viewport
          gsap.set([map, action, mapWrapper], { clearProps: "all" });
        };
      },
    );
  }

  // Đảm bảo load font xong mới chạy tính toán vị trí/split text
  if (document.fonts.status === "loaded") {
    initMatchMedia();
  } else {
    document.fonts.ready.then(initMatchMedia);
  }
}
