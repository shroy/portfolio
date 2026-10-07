import { signal, useAttributes, useEvents } from "hooktml";

// use-entrance: a content group arrives once (styles in scenes.css). Starting below the fold,
// it waits until it's a quarter of the way up the viewport (where the eye is, not the bottom
// edge), then arrives in role order. Reached mid-screen
// (a jump, a fling) it just fades; carried past without ever crossing, it's shown at rest.
// Groups already on screen, and reduced motion, are left alone. "On screen" is judged by the
// observer's first report, not on load: a page opened at a section (/#unmute) scrolls there
// only after this runs, and that section's groups are already in place when it first paints.
const motion = matchMedia("(prefers-reduced-motion: no-preference)");

type State = "waiting" | "arrived" | "jumped" | "present";

export const useEntrance = (el: HTMLElement) => {
  const state = signal<State | null>(null);
  const settle = (next: State) => {
    state.value = next;
    watcher.disconnect();
  };
  // The first report: below the fold it waits; otherwise there's nothing more to watch.
  const place = (top: number) => {
    if (top >= innerHeight) state.value = "waiting";
    else watcher.disconnect();
  };
  const watcher = new IntersectionObserver(
    (entries) =>
      entries.forEach(({ isIntersecting, boundingClientRect }) => {
        if (state.value === null) place(boundingClientRect.top);
        else if (isIntersecting) settle(boundingClientRect.top < innerHeight * 0.55 ? "jumped" : "arrived");
        else if (boundingClientRect.bottom < 0) settle("present");
      }),
    { rootMargin: "0px 0px -25% 0px" },
  );
  if (motion.matches) watcher.observe(el);

  useAttributes(el, { "data-enter": () => state.value }, [state]);
  const stopSkipCheck = useEvents(motion.matches ? window : null, {
    scrollend: () => {
      if (state.value === "waiting" && el.getBoundingClientRect().bottom < 0) settle("present");
    },
  });

  return () => {
    watcher.disconnect();
    stopSkipCheck();
  };
};
