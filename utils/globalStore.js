const state = {
  VW: window.innerWidth,
  VH: window.innerHeight,
  wheelScrollDist: 0,
};

export const STORE = state;

export function updateViewport() {
  state.VW = window.innerWidth;
  state.VH = window.innerHeight;
  return state;
}
