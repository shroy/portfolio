import { signal, useAttributes, useEvents } from "hooktml";

// use-swipe-dismiss on a popover shown as a bottom sheet (phones): drag it down and let go to
// dismiss it, or let go early and it springs back. The drag is --drag, read by the sheet's
// translate (components.css). A press only becomes a drag past a few pixels, so a tap on a link
// inside still lands on the link.
const phone = matchMedia("(width < 60rem)");
const SLOP_PX = 8;
const FLICK_PX_PER_MS = 0.5;

export const useSwipeDismiss = (el: HTMLElement) => {
  const press = signal<{ id: number; y: number; at: number } | undefined>(undefined);
  const dragging = signal(false);
  const offset = signal(0);

  const drag = (px: number) => {
    offset.value = px;
    el.style.setProperty("--drag", `${px}px`);
  };

  const release = (event: Event) => {
    const start = press.value;
    if (!(event instanceof PointerEvent) || event.pointerId !== start?.id) return;
    const flick = offset.value / Math.max(1, event.timeStamp - start.at) > FLICK_PX_PER_MS;
    const away = dragging.value && (offset.value > el.offsetHeight * 0.3 || flick);
    press.value = undefined;
    dragging.value = false;
    if (away) el.hidePopover();
    else drag(0);
  };

  useAttributes(el, { "data-state": () => (dragging.value ? "dragging" : null) }, [dragging]);
  useEvents(el, {
    pointerdown: (event) => {
      if (!(event instanceof PointerEvent) || !event.isPrimary || !phone.matches) return;
      if (!el.matches(":popover-open")) return;
      press.value = { id: event.pointerId, y: event.clientY, at: event.timeStamp };
    },
    pointermove: (event) => {
      const start = press.value;
      if (!(event instanceof PointerEvent) || event.pointerId !== start?.id) return;
      const px = Math.max(0, event.clientY - start.y);
      // Capture only once it's a drag: capturing on press would retarget a tap's click.
      if (!dragging.value && px > SLOP_PX) {
        dragging.value = true;
        el.setPointerCapture(event.pointerId);
      }
      if (dragging.value) drag(px);
    },
    pointerup: release,
    pointercancel: release,
    toggle: (event) => {
      if (event instanceof ToggleEvent && event.newState === "closed") drag(0);
    },
  });
};
