export function triggerPlayVideo() {
  const gifVideos = Array.from(document.querySelectorAll(".is-gif-video"));

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

export function createResizeObserver(targetElement, callback) {
  if (!targetElement || typeof callback !== "function") {
    return () => {};
  }

  if (typeof ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(function (entry) {
        if (entry.target === targetElement) callback();
      });
    });
    resizeObserver.observe(targetElement);
  } else {
    window.addEventListener("resize", callback, { passive: true });
  }
}
