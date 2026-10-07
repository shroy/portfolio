import { signal, useAttributes, useEvents, type Children } from "hooktml";

// The section crumb in the top bar (styles in components.css): names the section under the
// stuck bar's bottom edge, and on a jump names the destination at once and holds still while
// the page scrolls past the sections between. A project page's crumb only names that page and
// links to the others: it has no jump links, so there is nothing to track.
export const Crumb = (el: HTMLElement, { children }: { children?: Children<"links"> }) => {
  if (!children) return undefined;
  const links = children.links.filter((link) => link instanceof HTMLAnchorElement);
  const sections = links.map((link) => document.getElementById(link.hash.slice(1)));
  const bar = el.closest("header");
  const current = signal(-1);
  const jumping = signal(false);
  const hold = signal(0);
  const folded = signal(false);

  // The stuck bar's bottom edge: where it sticks (a negative top) plus its height. Where the
  // bar doesn't stick (small screens), its top is auto: just its height.
  const line = () => (bar ? (parseFloat(getComputedStyle(bar).top) || 0) + bar.offsetHeight : 0);
  const under = (y: number) =>
    sections.findIndex((section) => {
      const box = section?.getBoundingClientRect();
      return box !== undefined && box.top <= y && box.bottom > y;
    });
  const update = () => {
    if (!jumping.value) current.value = under(line() + 0.5);
  };

  // Only crossings matter: watch a 1px band at the bar's edge, re-made when the viewport resizes.
  const band = () => {
    const y = Math.round(line());
    const observer = new IntersectionObserver(update, {
      rootMargin: `-${y}px 0px -${Math.max(0, innerHeight - y - 1)}px 0px`,
    });
    sections.forEach((section) => section && observer.observe(section));
    return observer;
  };
  const watcher = signal(band());
  const rewatch = () => {
    watcher.value.disconnect();
    watcher.value = band();
  };

  const land = () => {
    clearTimeout(hold.value);
    jumping.value = false;
    update();
  };
  // Any in-page link (the crumb's, the work index's) to a section or something inside one.
  const jump = (event: Event) => {
    const link = event.target instanceof Element ? event.target.closest("a") : null;
    const target = link?.hash ? document.getElementById(link.hash.slice(1)) : null;
    const index = target ? sections.findIndex((section) => section?.contains(target)) : -1;
    if (index < 0) return;
    jumping.value = true;
    current.value = index;
    clearTimeout(hold.value);
    // Without scrollend, or with nothing to scroll, settle on a timer.
    hold.value = window.setTimeout(land, 1500);
  };

  useAttributes(links, { "aria-current": (_, i) => (i === current.value ? "location" : null) }, [current]);
  // After a pointer jump the pointer is still over the crumb: keep it folded until it leaves.
  // Keyboard activation (a click with no detail) keeps focus, and the names, where they are.
  useAttributes(el, { "data-folded": () => (folded.value ? "" : null) }, [folded]);
  // A jump in progress: the page scrolls smoothly only then (scenes.css).
  useAttributes(el, { "data-jumping": () => (jumping.value ? "" : null) }, [jumping]);
  useEvents(el, {
    click: (event) => {
      if (!(event instanceof MouseEvent && event.detail > 0)) return;
      folded.value = true;
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    },
    pointerleave: () => {
      folded.value = false;
    },
  });
  const stopJumps = useEvents(document, { click: jump });
  const stopViewport = useEvents(window, { resize: rewatch, scrollend: land });

  return () => {
    watcher.value.disconnect();
    clearTimeout(hold.value);
    stopJumps();
    stopViewport();
  };
};
