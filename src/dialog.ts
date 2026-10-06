import { signal, useEvents } from "hooktml";

// use-dialog-route="/contact/" on a <dialog>: an overlay with an address. A plain click on any
// link to that path opens it as a modal over the current page and pushes the path, so Back
// closes it; loaded directly, the path is a real page. Esc, a method="dialog" button or a click
// on the scrim closes it, and focus returns to the link that opened it.
export const useDialogRoute = (el: HTMLElement, { value }: { value?: unknown }) => {
  const dialog = el instanceof HTMLDialogElement ? el : null;
  if (!dialog || typeof value !== "string") return undefined;
  const route = value;
  const opener = signal<HTMLElement | null>(null);
  const pressedOutside = signal(false);

  // A press on the scrim lands on the dialog itself, outside its box.
  const outside = (event: Event) => {
    const box = dialog.getBoundingClientRect();
    return (
      event instanceof MouseEvent &&
      event.target === dialog &&
      (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)
    );
  };

  const open = (event: Event) => {
    const plain = event instanceof MouseEvent && event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
    const link = event.target instanceof Element ? event.target.closest("a") : null;
    if (!plain || event.defaultPrevented || link?.origin !== location.origin || link.pathname !== route) return;
    event.preventDefault();
    opener.value = link;
    dialog.showModal();
    history.pushState(route, "", route);
  };

  useEvents(dialog, {
    pointerdown: (event) => {
      pressedOutside.value = outside(event);
    },
    click: (event) => {
      if (pressedOutside.value && outside(event)) dialog.close();
    },
    close: () => {
      if (history.state === route) history.back();
      // On phones the opening link has scrolled away; keep the page where it is.
      opener.value?.focus({ preventScroll: true });
    },
  });
  const stopLinks = useEvents(document, { click: open });
  // Back closes it; Forward, back onto its entry, opens it again.
  const stopHistory = useEvents(window, {
    popstate: () => {
      if (history.state === route && !dialog.open) dialog.showModal();
      else if (history.state !== route && dialog.open) dialog.close();
    },
  });

  return () => {
    stopLinks();
    stopHistory();
  };
};
