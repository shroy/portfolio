import { signal, useEvents } from "hooktml";

// use-preview on a muted video: the first time it's mostly in view it plays a short phrase
// (under five seconds, so moving content needs no pause control), then rests; it plays again
// while a mouse rests on it. Reduced motion keeps the poster.
const motion = matchMedia("(prefers-reduced-motion: no-preference)");
const PHRASE_MS = 4500;

export const usePreview = (el: HTMLElement) => {
  const video = el instanceof HTMLVideoElement ? el : null;
  const phrase = signal(0);
  const play = () => {
    if (motion.matches) void video?.play().catch(() => undefined);
  };
  const rest = () => {
    clearTimeout(phrase.value);
    video?.pause();
  };

  const arrival = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      arrival.disconnect();
      play();
      phrase.value = window.setTimeout(rest, PHRASE_MS);
    },
    { threshold: 0.6 },
  );
  if (video) arrival.observe(video);

  useEvents(video, {
    pointerenter: (event) => {
      if (!(event instanceof PointerEvent && event.pointerType === "mouse")) return;
      clearTimeout(phrase.value);
      play();
    },
    pointerleave: rest,
  });

  return () => {
    arrival.disconnect();
    rest();
  };
};
