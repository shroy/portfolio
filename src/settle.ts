import { signal, useEvents } from "hooktml";

// use-settle (desktop): when a scroll comes to rest within a fifth of the viewport (at most
// 200px) of this section's top, glide onto it. CSS proximity snapping reaches a third of the
// viewport in Chrome, which pulls at almost every rest; this only catches near misses. The glide
// is its own (native smooth scrolling is quick and can't be slowed), and any wheel, touch, key
// or press hands control straight back without settling what follows.
const desktop = matchMedia("(width >= 60rem)");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const GLIDE_MS = 750;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

export const useSettle = (el: HTMLElement) => {
  const frame = signal(0);
  const interrupted = signal(false);

  const glide = (from: number, delta: number, start: number) => (now: number) => {
    const t = Math.min(1, (now - start) / GLIDE_MS);
    scrollTo({ top: from + delta * easeInOut(t), behavior: "instant" });
    frame.value = t < 1 ? requestAnimationFrame(glide(from, delta, start)) : 0;
  };

  const settle = () => {
    // The glide's own frames end in scrollend too.
    if (frame.value || !desktop.matches) return;
    if (interrupted.value) {
      interrupted.value = false;
      return;
    }
    const delta = el.getBoundingClientRect().top;
    if (Math.abs(delta) < 1 || Math.abs(delta) > Math.min(200, innerHeight / 5)) return;
    if (still.matches) return scrollTo({ top: scrollY + delta, behavior: "instant" });
    frame.value = requestAnimationFrame(glide(scrollY, delta, performance.now()));
  };

  const yieldToReader = () => {
    if (!frame.value) return;
    cancelAnimationFrame(frame.value);
    frame.value = 0;
    interrupted.value = true;
  };

  return useEvents(window, {
    scrollend: settle,
    wheel: yieldToReader,
    touchstart: yieldToReader,
    keydown: yieldToReader,
    pointerdown: yieldToReader,
  });
};
