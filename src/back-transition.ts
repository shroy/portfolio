import { useEvents } from "hooktml";

// use-back-transition (a project page): only Back carries the transition out to the landing
// page, which returns to the scene it plays into. A link from here lands elsewhere there (a
// section, the top), where the title and artifact would fly to a scene that isn't on screen, so
// those navigations skip the transition and simply load.
export const useBackTransition = () =>
  useEvents(window, {
    pageswap: (event) => {
      if (typeof PageSwapEvent === "undefined" || !(event instanceof PageSwapEvent)) return;
      if (event.activation?.navigationType === "push") event.viewTransition?.skipTransition();
    },
  });
