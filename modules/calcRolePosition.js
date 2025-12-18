import { BREAKPOINT } from "../utils/constant.js";
import { getViewportRule, createResizeScheduler } from "../utils/helpers.js";
/*** ========== UTILITIES ========== ***/
const ROPE_SPECS = {
  [BREAKPOINT.MOBILE]: {
    outerGap: 30,
    baseScale: 0.7,
    minInnerGap: 8,
    minScale: 0.5,
  },
  [BREAKPOINT.TABLET]: {
    outerGap: 100,
    baseScale: 0.8,
    minInnerGap: 8,
    minScale: 0.5,
  },
  [BREAKPOINT.SMALL_DESKTOP]: {
    outerGap: 100,
    baseScale: 0.8,
    minInnerGap: 8,
    minScale: 0.5,
  },
  [BREAKPOINT.LARGE_DESKTOP]: {
    outerGap: 300,
    baseScale: 1.2,
    minInnerGap: 8,
    minScale: 0.5,
  },
};

/*** ========== UTILITIES ========== ***/

function getPointInScreenFromMatrix(
  svgMatrix,
  svgX,
  svgY,
  svgElForLegacyFallback
) {
  if (!svgMatrix) return null;

  if (window.DOMPoint) {
    const pointInSVG = new DOMPoint(svgX, svgY);
    const pointInScreen = pointInSVG.matrixTransform(svgMatrix);
    return { x: pointInScreen.x, y: pointInScreen.y };
  }

  // Legacy fallback (very old browsers).
  const legacyPointInSVG = svgElForLegacyFallback.createSVGPoint();
  legacyPointInSVG.x = svgX;
  legacyPointInSVG.y = svgY;
  const legacyPointInScreen = legacyPointInSVG.matrixTransform(svgMatrix);
  return { x: legacyPointInScreen.x, y: legacyPointInScreen.y };
}

function findTOnPathForX(
  targetX,
  pathLength,
  maxIterations,
  boxRect,
  ropePath,
  ropeSvg,
  svgMatrix
) {
  let low = 0.02;
  let high = 0.98;
  let best = 0;
  const EPSILON = 0.5; // allowed pixel error for X

  for (let i = 0; i < maxIterations; i++) {
    const middle = (low + high) / 2;
    const lengthAtMiddle = middle * pathLength;

    const pointOnPath = ropePath.getPointAtLength(lengthAtMiddle);
    const screenPoint = getPointInScreenFromMatrix(
      svgMatrix,
      pointOnPath.x,
      pointOnPath.y,
      ropeSvg
    );
    if (!screenPoint) break;

    const xInBox = screenPoint.x - boxRect.left;
    best = middle;

    const diff = xInBox - targetX;
    if (Math.abs(diff) < EPSILON) {
      // Good enough, stop searching
      break;
    }

    // If point is left to target, search the right half; otherwise left half
    if (xInBox < targetX) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return Math.abs(high - low) > 0 ? (low + high) / 2 : best;
}

function measureItemWidths(items) {
  return items.map(
    (el) => el.offsetWidth || el.getBoundingClientRect().width || 0
  );
}

function getPinOffsetFromItemCenter({ item, pinSelector }) {
  const pin = item.querySelector(pinSelector);
  if (!pin) return 0;

  const itemRect = item.getBoundingClientRect();
  const pinRect = pin.getBoundingClientRect();

  const itemCenterX = itemRect.left + itemRect.width / 2;
  const pinCenterX = pinRect.left + pinRect.width / 2;

  return pinCenterX - itemCenterX; // positive: pin is to the right
}

function computeScaleAndGap({
  itemWidths,
  boxWidth,
  outerGap,
  baseScale,
  minScale,
  minInnerGap,
}) {
  if (!Array.isArray(itemWidths) || itemWidths.length === 0) return;

  const availiableWidth = boxWidth - 2 * outerGap;
  if (availiableWidth < 0) return null;

  const itemCount = itemWidths.length;
  const innerGapCount = Math.max(itemCount - 1, 1);

  const totalWidthAtBase = itemWidths.reduce(
    (total_width, item_width) => total_width + item_width * baseScale,
    0
  );
  let finalScale = baseScale;
  const minTotalAtBase = totalWidthAtBase + innerGapCount * minInnerGap;

  if (minTotalAtBase > availiableWidth) {
    // Not enough space: scale items and minimal gaps down to fit.
    const shrinkFactor = availiableWidth / minTotalAtBase;
    finalScale = Math.max(baseScale * shrinkFactor, minScale);
  }

  const scaledTotalWidth = itemWidths.reduce(
    (total_width, item_width) => total_width + item_width * finalScale,
    0
  );

  let innerGap = (boxWidth - 2 * outerGap - scaledTotalWidth) / innerGapCount;
  innerGap = Math.max(innerGap, minInnerGap);

  return { scale: finalScale, innerGap };
}
/*** ========== MAIN ========== ***/
export function initMomentsRope({
  boxSelector = '[data-rope="box"]',
  itemSelector = '[data-rope="img-item"]',
  pinSelector = '[data-rope="item-spin"]',
  svgSelector = '[data-rope="wire"]',
  pathSelector = '[data-rope="ropePath"]',
} = {}) {
  const boxes = Array.from(document.querySelectorAll(boxSelector));

  if (boxes.length === 0) {
    console.warn("[momentsRope] no boxes found for selector:", boxSelector);
    return;
  }

  boxes.forEach((box, index) => {
    setupRopeInstance({
      box,
      instanceId: index,
      itemSelector,
      pinSelector,
      svgSelector,
      pathSelector,
    });
  });
}

/**
 * Create one rope instance inside a single box.
 * All DOM & logic inside here are scoped per-box, so multiple boxes can coexist.
 */
function setupRopeInstance({
  box,
  instanceId,
  itemSelector,
  pinSelector,
  svgSelector,
  pathSelector,
}) {
  /*** ========== DOM ELEMENTS (SCOPED TO THIS BOX) ========== ***/
  const ropeSvg = box.querySelector(svgSelector);
  const ropePath = box.querySelector(pathSelector);
  let items = Array.from(box.querySelectorAll(itemSelector));

  if (!ropeSvg || !ropePath || items.length === 0) {
    console.warn(`[momentsRope#${instanceId}] missing svg/path/items`, {
      ropeSvg,
      ropePath,
      itemsLen: items.length,
    });
    return;
  }

  function placeItemsCal() {
    // Ensure SVG layout is available
    const svgMatrix = ropeSvg.getScreenCTM?.();
    if (!svgMatrix) return;

    const boxRect = box.getBoundingClientRect();
    const boxWidth = boxRect.width;
    const pathLength = ropePath.getTotalLength?.() ?? 0;

    if (boxWidth <= 0 || pathLength <= 0) return;

    const visibleItems = items.filter((el) => {
      // Using offsetParent is a quick way to skip display:none elements.
      // Also guard against elements not connected to DOM anymore.
      if (!el.isConnected) return false;
      if (el.offsetParent === null) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    const itemWidths = measureItemWidths(visibleItems);
    const itemCount = itemWidths.length;

    if (itemCount <= 0) return;

    const viewportName = getViewportRule().name;
    const { outerGap, baseScale, minScale, minInnerGap } =
      ROPE_SPECS[viewportName];

    const spec = computeScaleAndGap({
      itemWidths,
      boxWidth,
      baseScale,
      minScale,
      minInnerGap,
      outerGap,
    });

    if (!spec) return;
    const { scale, innerGap } = spec;

    // 1D layout: compute anchorX (center of each item) along the box width.
    const anchorsX = [];
    let cursor = outerGap;

    for (let i = 0; i < itemCount; i++) {
      const itemFinalWidth = scale * itemWidths[i];
      const anchorX = cursor + itemFinalWidth / 2;
      anchorsX.push(anchorX);

      cursor += itemFinalWidth + (i < itemCount - 1 ? innerGap : 0);
    }

    // Map each anchorX to a parameter t on the curved rope path.
    const iterations = 22;
    const tValues = anchorsX.map((ax) =>
      findTOnPathForX(
        ax,
        pathLength,
        iterations,
        boxRect,
        ropePath,
        ropeSvg,
        svgMatrix
      )
    );

    // Position each item so its pin sits on the rope.
    for (let i = 0; i < itemCount; i++) {
      const item = visibleItems[i];
      const t = tValues[i];
      if (t == null) continue;

      const pointOnPath = ropePath.getPointAtLength(pathLength * t);
      const screenPoint = getPointInScreenFromMatrix(
        svgMatrix,
        pointOnPath.x,
        pointOnPath.y,
        ropeSvg
      );
      if (!screenPoint) continue;

      const anchorXInBox = screenPoint.x - boxRect.left;
      const anchorYInBox = screenPoint.y - boxRect.top;

      const pinOffsetFromCenter = getPinOffsetFromItemCenter({
        item,
        pinSelector,
      });
      const pinOffsetY = 8; // vertical offset to place the pin slightly below the rope

      const left = anchorXInBox - pinOffsetFromCenter;
      const top = anchorYInBox + pinOffsetY;

      // Ensure item is absolutely positioned inside the box.
      item.style.position = "absolute";
      item.style.left = left + "px";
      item.style.top = top + "px";
      item.style.transform = `translateX(-50%) scale(${scale})`;
      item.style.transformOrigin = "50% 0%";
    }
  }

  /*** ========== THROTTLING & LISTENERS (PER BOX) ========== ***/

  const schedulePlaceItems = createResizeScheduler({
    targetElement: box,
    guardKey: "__momentsRopeResizeOnce__",
    callback: placeItemsCal,
  });

  schedulePlaceItems();

  // Update when the rope box enters the viewport (optional).
  // let ropeInViewportObserver = null;
  // if (useIntersectionObserver && typeof IntersectionObserver !== "undefined") {
  //   ropeInViewportObserver = new IntersectionObserver(
  //     (entries) => {
  //       const entry = entries[0];
  //       if (!entry) return;
  //       if (entry.isIntersecting) {
  //         placeItems();
  //         // once time run
  //         ropeInViewportObserver.unobserve(box);
  //         ropeInViewportObserver.disconnect();
  //         ropeInViewportObserver = null;
  //       }
  //     },
  //     { root: null, threshold: 0 }
  //   );

  //   ropeInViewportObserver.observe(box);
  // }
}
