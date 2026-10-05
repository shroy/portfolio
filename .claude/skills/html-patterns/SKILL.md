---
name: html-patterns
description: Markup conventions for this app — semantic elements, flat structure, no div soup. Use whenever writing or reviewing HTML/ERB views, partials, layouts, or Turbo Frame/Stream templates.
---

# Semantic, Flat HTML

Markup earns its place: every element is either semantic (it *means* something) or
load-bearing (a composition, component, or hook attaches to it). Anything else is
soup — delete it.

## Rules

- **Reach for the semantic element first.** `<button>`, `<a>`, `<nav>`, `<article>`,
  `<section>`, `<dialog>`, `<details>`, `<time>`, `<output>` — a `<div>` or `<span>`
  is the last resort, not the default. Native elements bring keyboard handling,
  accessibility, and behavior for free (a `<dialog>` needs no modal component;
  `<details>` needs no toggle hook).
- **Keep it flat.** Add a wrapper only when something attaches to it — a composition
  class, a component, a hook, an ARIA relationship. A wrapper that exists "for
  styling" means the layout belongs on the parent composition (`.stack`, `.cluster` —
  see the css-patterns skill), not on a new div.
- **One element can do several jobs.** The component class, composition class, and
  semantic tag stack on a single element: `<section class="Card stack">` — not a
  section inside a div inside a div.
- **Structure follows content, not the design mockup.** Group elements because they
  belong together semantically; visual grouping is composition's job. A mockup that
  specifies ARIA attributes (`aria-expanded`, `aria-controls`, `role="dialog"`) is
  describing a native pattern in longhand — build the element, and the attributes
  come with it.

## The test

**Name the interaction before you name the element.** "Click a control, reveal a
region, click again to hide it" is a disclosure, and `<details>`/`<summary>` *is*
one. The name is right when it would still fit on a different screen holding
different content.

Then walk the tree once: for each element, name what it means or what attaches to
it. Can't name either? Remove the element and re-check the render. A view that
survives both passes is done.
