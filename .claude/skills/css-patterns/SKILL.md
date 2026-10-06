---
name: css-patterns
description: CSS conventions — composition-first layering, SUIT naming, data-attribute state, variables-not-overrides, intrinsic responsive layout. Use whenever writing, changing, or reviewing CSS or adding classes to markup.
---

# Composition CSS

Set boundaries and let the browser decide within them. CSS owns every piece of
presentation and state it can express cleanly.

## Order of resort

Before writing a rule, confirm a lower layer can't already do it:

1. **Base** — how an element looks *everywhere*: appearance only, never
   margins on flow content.
2. **Layout primitives** — `.stack`, `.cluster`, `.grid` arrange any children
   through flow and `gap`. Most layout problems are solved here, not with
   one-off positioning.
3. **Utilities** — single-job classes driven by tokens.
4. **Blocks** — styled components; skin, not layout.
5. **Exceptions** — states and variants, always data-attributes.

## Naming and state

- Blocks are capitalized (`.Card`, `.Card-header`); layout primitives and
  utilities are lowercase. A block is named for what it is, never for where it
  appears.
- State and variants are data-attributes (`[data-state="open"]`), never
  modifier classes. Scripts toggle `dataset`; CSS selects on it.

## Rules

- **Declare each property once; variants set variables.** A block reads
  `color: var(--card-color, grey)`; a variant only sets `--card-color`.
  Private variables are block-named (`--card-*`); global tokens are
  category-first (`--color-*`, `--space-*`).
- **Flat, low-specificity selectors.** Nest one level at most. A block never
  styles another block's internals (`.Card .Button`); pass variation through a
  variable or data-attribute. No `!important`.
- **No inline styles**, except setting a custom property a block reads as its
  configuration (`style="--progress: 40%"`).

## Responsive

- Intrinsic layout first: flow, flex, grid, `minmax()`, `auto-fit`, `min()`,
  `clamp()`.
- Container queries when a component's structure depends on its container;
  viewport media queries when the whole-page composition changes at a
  threshold.
- A responsive rule lives once, on the shared primitive — never repeated per
  section.
- Choose units by the relationship being expressed. Logical properties wherever
  direction isn't inherently physical.

## Motion and newer features

- Motion animates `transform`, `opacity`, `clip-path`, or masks — never
  `transition: all`. Every motion has a `prefers-reduced-motion` treatment, and
  no state depends on motion to be understood.
- Features not yet Baseline widely available ship behind `@supports` with a
  working fallback.
