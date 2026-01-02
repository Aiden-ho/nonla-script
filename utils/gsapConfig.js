let lenis;

export function GsapSetup() {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  if (lenis) return lenis;

  // Initialize a new Lenis instance for smooth scrolling
  lenis = new Lenis({
    lerp: 0.08,
    touchMultiplier: 1.5,
  });

  // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
  lenis.on("scroll", ScrollTrigger.update);

  // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
  // This ensures Lenis's smooth scroll animation updates on each GSAP tick
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Convert time from seconds to milliseconds
  });

  // Disable lag smoothing in GSAP to prevent any delay in scroll animations
  gsap.ticker.lagSmoothing(0);

  // resize when scrollTrigger resize.
  ScrollTrigger.addEventListener("refresh", () => {
    lenis.resize();
  });

  return lenis;
}

export function getLenis() {
  return lenis;
}
