---
name: html-patterns
description: Markup conventions — semantic elements, native controls, flat structure, correct document outline, ARIA only as a last resort. Use whenever writing or reviewing HTML, templates, or any markup a script or style attaches to.
---

# Semantic, Flat HTML

Every element is either semantic (it *means* something) or load-bearing
(something attaches to it). Anything else is soup — delete it.

## Rules

- **Semantic element first.** `<button>`, `<a>`, `<nav>`, `<article>`,
  `<section>`, `<dialog>`, `<details>`, `<time>` — `<div>` and `<span>` are the
  last resort. A native element's built-in behavior replaces script: a
  `<dialog>` needs no modal code, `<details>` needs no toggle code.
- **Elements match their behavior.** A link navigates (`<a href>`); a button
  acts (`<button type="button">`). Never style one to impersonate the other.
- **ARIA only where native HTML can't express it.** A design that specifies
  `aria-expanded` or `role="dialog"` is describing a native element in
  longhand — build the element.
- **Outline is real.** One `<main>`; landmarks wrap their actual regions;
  headings descend without skipping levels and are chosen for rank, not size.
- **Source order is reading order.** Visual reordering never contradicts it.
- **Content works first.** Text, links, media, and primary navigation are in
  the markup and usable before any script runs; scripts enhance markup that
  already works.

## Keep it flat

- Add a wrapper only when something attaches to it — a layout primitive, a
  component, a behavior, an ARIA relationship, or a concrete presentation job
  (clipping, masking, sticky staging, a layer that moves or fades
  independently, containment).
- One element can do several jobs: semantic tag, component class, and layout
  class stack on a single element.
- Group elements because they belong together, not because the mockup boxes
  them; visual grouping is the CSS's job.
- A presentation wrapper leaves reading order unchanged, is not focusable, and
  holds no duplicate meaningful content; a purely visual layer is hidden from
  assistive technology.

## The test

**Name the interaction before you name the element.** "Click a control, reveal
a region, click again to hide it" is a disclosure, and `<details>`/`<summary>`
*is* one.

Then walk the tree once: for each element, name what it means or what attaches
to it. Can't name either? Remove it and re-check the render. Done when every
element survives both passes.
