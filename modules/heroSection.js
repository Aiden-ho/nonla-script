export function heroSectionInit() {
  gsap.to(".intro_section", {
    clipPath: "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0% )",
    duration: 1,
    ease: "none",
    duration: 0.5,
    scrollTrigger: {
      trigger: ".top_page",
      start: "top top",
      end: "+=100%", // kéo dài 1 viewport → đủ không gian mở
      scrub: 1, // scrub:1 → bám sát scroll (1s smoothing)
    },
  });
}
