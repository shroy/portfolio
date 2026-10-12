import { useEvents } from "hooktml";
import { isAttribution } from "./attribution";

const key = "portfolio-attribution";

export const recordTaggedView = (path: string) => {
  if (document.visibilityState !== "visible") return;

  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (!isAttribution(stored)) return;

    void fetch("/api/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: stored.company, role: stored.role, path }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Storage can be disabled; tracking must never affect the page.
  }
};

// A tagged link replaces this tab's attribution. Ordinary internal links keep it without
// carrying query parameters around the site.
export const useTrackView = (el: HTMLElement) => {
  const track = () => {
    if (document.visibilityState !== "visible" || el.hasAttribute("data-view-tracked")) return;
    el.dataset.viewTracked = "";

    try {
      const params = new URL(location.href).searchParams;
      const company = params.get("company")?.trim();
      const role = params.get("role")?.trim();
      if (params.has("company") || params.has("role")) {
        if (isAttribution({ company, role })) sessionStorage.setItem(key, JSON.stringify({ company, role }));
        else sessionStorage.removeItem(key);
      }

      recordTaggedView(location.pathname);
    } catch {
      // Storage can be disabled; tracking must never affect the page.
    }
  };

  // A prerendered document runs scripts before anyone sees it. Only send after activation.
  if (document.visibilityState === "visible") track();
  const stop = useEvents(document, { visibilitychange: track });
  return stop;
};
