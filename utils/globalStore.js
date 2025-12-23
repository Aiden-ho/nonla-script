export const STORE = {
  VW: 0,
  VH: 0,
};

export function updateViewport() {
  STORE.VW = window.innerWidth;
  STORE.VH = window.innerHeight;
}
