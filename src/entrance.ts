import { signal, useAttributes, useEvents } from "hooktml";

// use-entrance: a content group arrives once (styles in scenes.css). Starting below the fold,
// it waits until it crosses 90% of the viewport, then arrives in role order. Reached mid-screen
// (a jump, a fling) it just fades; carried past without ever crossing, it's shown at rest.
// Groups already on screen, and reduced motion, are left alone.
const motion = matchMedia("(prefers-reduced-motion: no-preference)");

type State = "waiting" | "arrived" | "jumped" | "present";

export const useEntrance = (el: HTMLElement) => {
  const below = motion.matches && el.getBoundingClientRect().top >= innerHeight;
  const state = signal<State | null>(below ? "waiting" : null);
  const settle = (next: State) => {
    state.value = next;
    watcher.disconnect();
  };
  const watcher = new IntersectionObserver(
    (entries) =>
      entries.forEach(({ isIntersecting, boundingClientRect }) => {
        if (isIntersecting) settle(boundingClientRect.top < innerHeight * 0.55 ? "jumped" : "arrived");
        else if (boundingClientRect.bottom < 0) settle("present");
      }),
    { rootMargin: "0px 0px -10% 0px" },
  );
  if (below) watcher.observe(el);

  useAttributes(el, { "data-enter": () => state.value }, [state]);
  const stopSkipCheck = useEvents(below ? window : null, {
    scrollend: () => {
      if (state.value === "waiting" && el.getBoundingClientRect().bottom < 0) settle("present");
    },
  });

  return () => {
    watcher.disconnect();
    stopSkipCheck();
  };
};
