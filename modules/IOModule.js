export function triggerPlayVideo() {
  const gifVideos = Array.from(document.querySelectorAll(".is-lazy-video"));

  if ("IntersectionObserver" in window) {
    const gifVideoIO = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        const video = entry.target.querySelector("video");
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    });

    gifVideos.forEach(function (gifVideo) {
      gifVideoIO.observe(gifVideo);
    });
  }
}
