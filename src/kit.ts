import { useAttributes, useEvents, type Children } from "hooktml";
import { isPiece, play, unlock } from "./drums";

// The 404's drum kit (styles in notfound.css; sound in drums.ts). A drum sounds the moment a
// finger or the mouse goes down, not when it lifts, so a roll keeps up; each letter plays its
// drum too. The ring that blooms from a hit is the only motion, and it flashes in place under
// reduced motion.

const still = matchMedia("(prefers-reduced-motion: reduce)");

const flash = (drum: HTMLElement) => {
  if (!still.matches) drum.animate([{ scale: "0.96" }, { scale: "1" }], { duration: 160, easing: "ease-out" });
  drum.animate(
    [
      { opacity: 1, scale: "1" },
      { opacity: 0, scale: still.matches ? "1" : "1.3" },
    ],
    { duration: 480, easing: "ease-out", pseudoElement: "::after" },
  );
};

const strike = (drum: EventTarget | null | undefined) => {
  if (!(drum instanceof HTMLElement) || !isPiece(drum.dataset.piece)) return;
  play(drum.dataset.piece);
  flash(drum);
};

export const Kit = (el: HTMLElement, { children }: { children: Children<"drums"> }) => {
  // The drums do nothing without this script, so they stay hidden until it runs.
  useAttributes(el, { "data-ready": "" });

  useEvents(children.drums, {
    pointerdown: (event) => {
      if (event instanceof PointerEvent && event.button === 0) strike(event.currentTarget);
    },
    // iOS lets sound start only when a touch lifts.
    pointerup: unlock,
    // Enter or Space on a focused drum arrives as a click with no pointer behind it.
    click: (event) => {
      if (event instanceof MouseEvent && event.detail === 0) strike(event.currentTarget);
    },
  });

  return useEvents(document, {
    keydown: (event) => {
      if (!(event instanceof KeyboardEvent) || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      strike(children.drums.find((drum) => drum.dataset.key === event.key.toLowerCase()));
    },
  });
};
