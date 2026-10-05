---
name: css-patterns
description: CSS conventions for this app — composition-first architecture (inspired by CUBE CSS) with SUIT naming, capitalized components, data-attribute state. Use whenever writing, changing, or reviewing CSS or adding classes to markup. This app uses no Tailwind and no preprocessor.
---

# Composition CSS

Composition-first architecture inspired by CUBE CSS (Composition → Utility → Block →
Exception) and SUIT naming, but its own methodology — where this file differs from
either, this file wins. Plain CSS served by Propshaft — every `.css` file under
`app/frontend/` is included automatically, no manifest to edit.

## Philosophy

**Be the browser's mentor, not its micromanager** (Andy Bell). Set boundaries —
fluid type with `clamp()`, flexible grids with `minmax()`/`auto-fit`, spacing from
custom properties — and let the browser make the final rendering decisions within
them. A hardcoded pixel dimension is a decision stolen from the browser; prefer
ranges, ratios, and intrinsic sizing (`min()`, `max()`, `fit-content`, `aspect-ratio`).
Media queries are a last resort — a well-set boundary adapts without them.

**Progressive enhancement.** Start from semantic HTML (owned by the html-patterns
skill) and core CSS that work on any device and network; layer advanced visuals
(`@supports`, view transitions, fancy selectors) on top so their absence degrades
gracefully, never breaking function. If a layout collapses without a cutting-edge
feature, restructure until the baseline stands on its own.

## Order of resort

Work top-down. Before writing a block, confirm the lower layers can't already do it:

0. **Element/base** — if this is what the element should look like *everywhere*, it
   goes in `cadence/foundations/03-base.css`, before any class exists. Appearance
   only (font stack, link underline, button reset, separator margins like `hr`);
   never margins on flow content (see appearance vs spacing below). The floor is
   the *rarest* edit — it shifts computed styles on every screen and must clear
   `bin/cadence-audit` where baselines exist.
1. **Composition** — layout primitives (`.stack`, `.cluster`, `.sidebar`, `.grid`)
   that arrange *any* children via flow and spacing. Most layout problems are
   composition problems. A page assembled from compositions + tokens should need
   almost no CSS of its own.
2. **Utility** — single-job classes (`.u-visuallyHidden`, `.u-textCenter`) doing one
   thing well, driven by design tokens (custom properties).
3. **Block** — a styled component, only for what composition and utilities can't
   express. Keep blocks thin: skin (color, border, radius), not layout.
4. **Exception** — a state or variant, always a **data-attribute**, never a class.

Structure-reaching element selectors *within a block* (`.Card p`, `.Nav li a`) are
never acceptable — they couple the block to document structure and break when markup
changes. Styling a block's own leaf children (Button svg icon sizing, Avatar img) is
fine: scoped, commented, and explicitly *not* a candidate for promotion to the floor.
The floor escape hatch (rung 0, `cadence/foundations/03-base.css`) is only for truly
global element appearance.

**Sanctioned exceptions:** `.Card :where(.Card)` (nested Card rule at (0,1,0))
and `:where(:is(ul, ol, dl):has(> .Card))` (list-of-Cards layout default in
composition layer). Both solve layout relationships where the parent cannot know
its children's class without repeating Card's own name, and both live in Card.css
to keep precedence predictable. Feature components load after Cadence at equal
specificity, so their overrides win. No other reach-in is permitted.

## Appearance vs spacing

**Element appearance is global; rhythm is contextual.**

Base element styles (rung 0) set appearance — font stack, color, underline, reset —
but never margins on flow content. Exception: separators like `hr` where the margin
*is* the function. Global margins on flow content break composition: a
`p { margin-block: … }` rule forces that rhythm into every context where a paragraph
appears, whether or not the parent wants it.

Instead:

- **App UI contexts** — use explicit composition (`.stack`, `gap` on a flex/grid
  parent). Deliberate spacing, no surprises.
- **Long-form / classless contexts** (blog posts, rendered markdown, user-generated
  HTML where you can't add classes) — one scoped **flow rule** reading `--flow-space`:
  ```css
  .prose {
    --flow-space: initial;
  }
  .prose > * + * {
    margin-block-start: var(--flow-space, 1.5em);
  }
  ```
  The lobotomized owl (`* + *`) is *only* legitimate here — `gap` can't space
  classless children, and per-element rhythm requires the selector. The child
  combinator (`>`) keeps the margin from leaking into nested components.
  `--flow-space` sets the space **above** the element it's declared on; for more
  space after a heading, target the following sibling: `h2 + * { --flow-space: … }`.
  Reset `--flow-space: initial` on the context root (mirroring `.stack`) so nested
  contexts don't inherit the outer value. Scope to `.prose` or equivalent — never
  apply flow globally.

This split keeps the composition layer predictable: app UI is explicit (`.stack` with
a known gap), long-form is scoped and customizable (owl + variable), and nothing leaks.

## Naming

- **Blocks are capitalized** (SUIT): `.Card`, `.StreakBadge`, `.Card-header` for
  descendants. Capitalization marks "this element is a styled component" in rendered
  HTML — and matches HookTML, where a capitalized class like `.Modal` is also a
  behavior component. One name, styling and behavior.
- **Compositions and utilities are lowercase**: `.stack`, `.cluster`, `.u-textCenter`.
- **A block is named for what it is, never for where a document put it.** Screen
  codes, wireframe numbers, ticket ids and mockup labels are all the same mistake:
  the name means nothing to a reader without the document, and it stays wrong once
  the screen is renamed, split, or reused. The component that owns the stylesheet
  is the name — `.LeaveDialog-actions`, not `.S23Profile-leave-actions`.
- **State and variants are data-attributes**: `[data-direction="top"]`,
  `[data-state="open"]`, `[data-variant="primary"]` — not `.Card--top` or `.is-open`.
  JS toggles `dataset`, CSS selects on the attribute.

```css
.Card {
  border-radius: var(--radius-md);
  background: var(--color-surface);

  &[data-direction="top"] {
    flex-direction: column;
  }
}
```

## Rules

### Fluid layout and units

- **Design intrinsically before adding a query.** Prefer normal flow, flexbox, grid,
  `minmax()`, `auto-fit`/`auto-fill`, `clamp()`, `min()`, `max()`, and `calc()` so
  layouts respond continuously instead of jumping between device presets.
- **Respond to the available container, not an assumed viewport.** Make reusable
  components size containers and use `@container` only when their structure truly
  needs to change. Use viewport media-query breakpoints only as a last resort for a
  page-level constraint that intrinsic layout and container queries cannot express.
  Never choose breakpoints from named devices.
- **Use relative units deliberately.** Default to `rem` for type, spacing, controls,
  and dimensions that should respect the user's root font size. Consider `em` for
  component-local scaling; `ch` for readable measures and content thresholds; `lh`
  for line-relative sizing; `%` for parent-relative sizing; `fr` for grid tracks;
  `cqi`/`cqb` for container-relative fluidity; and `svh`/`dvh` for mobile viewport
  bounds. Combine units with simple calculations when that better expresses a
  bounded relationship.
- **Pixels require a concrete reason.** They are appropriate for genuinely
  device-pixel-like details such as a thin border, but not as the default unit for
  typography, spacing, touch targets, layout, or breakpoints. A `px` value in a
  component should be uncommon and defensible in review.
- **Use logical properties.** Prefer `inline-size`, `block-size`, `margin-inline`,
  `padding-block`, and logical inset/border properties over physical directions
  unless the direction is inherently visual.
- **No inline styles.** A `style=` attribute in markup is a layer failure — the
  rule belongs in a composition, utility, or block. The one exception: setting a
  **custom property** that a composition or component reads as its configuration
  API (`style="--stack-gap: var(--space-4)"`, a progress partial emitting
  `--progress-value`). Raw properties in `style=` (`style="padding-block: …"`)
  are never acceptable, including in specimens and demos — if a demo needs a
  one-off constraint, give it a demo class in the page's own stylesheet. Lint
  catches both spellings, the `style=` attribute and the `style:` argument to a
  tag helper (see CSS linting below).

### Measure before you size

For anything with a hard space budget — controls sharing a row, a number that
can grow digits, a label that must fit beside a button — measure, then write:

1. Render the state with the widest content it can hold (the longest label, the
   four-digit value) and measure the elements in headless Chrome with
   `bin/inspect-screen --sweep FROM..TO` (the inspect-screen skill).
2. Write the budget as arithmetic in a comment above the rule: available width
   minus every inset, gap and border, down to the space left for content.
   When a layout has a hard space budget, open [width-budget.md](width-budget.md)
   for the worked sum.
3. Change one value, re-measure the same sweep.

Done when the sweep shows no overflow at any width in the range and the
comment's arithmetic matches the tokens the rule uses.

### Modern CSS and resilience

- Prefer stable platform features over JavaScript for presentation and layout.
  Useful defaults include container queries, subgrid, `aspect-ratio`, `accent-color`,
  `text-wrap`, modern viewport units, and native HTML primitives styled with CSS.
- Use OKLCH for new palette work and derive controlled variations with
  `color-mix()` or relative colors when browser support and contrast validation make
  that safe. Semantic tokens remain the public color API; components do not invent
  palette values.
- Check the Web Platform Baseline or primary browser documentation before relying on
  a newer feature. Widely or newly available features may be used directly when they
  satisfy the app's supported browsers. Limited features require `@supports`, a
  functional fallback, and graceful degradation. Do not ship proposed or
  behind-a-flag syntax as a production dependency.
- Motion is progressive enhancement. Keep the interface complete without it, prefer
  transforms and opacity when animation adds meaning, and provide a
  `prefers-reduced-motion` treatment. Never make scroll-driven or view-transition
  effects necessary to understand state or complete a task.
- Use media queries freely for user and device capabilities such as
  `prefers-reduced-motion`, `prefers-contrast`, hover, and pointer precision. The
  last-resort rule applies to viewport-width layout breakpoints, not accessibility
  preferences or input capabilities.

- **Declare properties once; variants set variables.** A block assigns each property
  exactly once, reading from a custom property with a fallback. Exceptions and
  variants only reassign the variable — never redeclare the property. This keeps one
  authoritative line per property, so there are no cascade fights and nothing to
  override.

  ```css
  /* Bad — the property is declared twice, later variants must out-compete earlier ones */
  .Card {
    color: grey;

    &[data-variant="success"] {
      color: green;
    }
  }

  /* Good — the property is declared once; variants just feed it a value */
  .Card {
    color: var(--card-color, grey);

    &[data-variant="success"] {
      --card-color: green;
    }
  }
  ```

  **Namespace the variable per block** (`--card-color`, not `--color`). Custom
  properties inherit, so a bare `--color` set on an ancestor leaks into every
  descendant block that reads the same name. The block-prefixed name makes the
  variable private by construction.

  **Where you set a private decides who wins.** Namespacing stops leaks across
  blocks; it does nothing within one. Two siblings sharing the rule that reads
  `--card-color` can't hold different values while it's set on their common
  parent — key the state off each element's own selector instead. And a variant
  that assigns a private on the element itself outranks every ancestor, so a
  consumer needing a different value has to out-specify that variant rather than
  set the private higher up. A block whose variants do this states so in its
  header comment, next to the configuration API.
  
  **Tokens are category-first and unprefixed; block-private variables are
  block-named.** Global design tokens (`--color-surface`, `--space-gutter`,
  `--radius-md`) live in `app/frontend/cadence/foundations/` and use
  category-first names (color, space, type, radius, etc.) without additional
  prefixes — the category is the namespace. Component-private variables use
  the block name (`--card-bg`, `--input-border`). Never name a component after
  a token category (Color, Space, Type, …) — that would collide with the
  global token namespace.
  
  **Third category: deliberate token overrides for subtrees.** A component may
  reassign a global token on its own root to retheme the entire subtree —
  the correct mechanism when the change must cascade through components you
  don't own. Because it's indistinguishable from a component-private variable
  by name alone, it MUST carry a comment stating it's a deliberate token
  override. Example: `--space-gutter: var(--space-md); /* Override: denser
  layout for coach mode */`.

- **`!important` is a code smell.** Needing it means two declarations are fighting —
  which the variables-not-overrides rule exists to prevent. Find the competing
  declaration and restructure; reach for `!important` only when overpowering CSS you
  don't control (third-party widgets, user-agent quirks), and comment why.
- **`all: unset` comes first and takes `display` with it.** It resets every property
  except custom properties, so it goes at the top of its rule and anything it wipes —
  `display`, `list-style` — gets restated after. It is also what clears the radius the
  base `button` rule sets and `border: 0` leaves behind, so a `<button>` skinned as a
  text link starts here rather than with a list of resets.
- **Nest one level deep, maximum.** Native CSS nesting; a selector inside a selector
  inside a selector means restructure.
- **Values come from tokens.** Sizes, colors, space, radii are custom properties
  defined once; a raw hex or px in a block is a smell.
- **Style children through composition, not reach-in selectors.** `.Card .Button`
  couples two blocks; pass the variance through a data-attribute or token instead.
  Exceptions: `.Card :where(.Card)` and `:where(:is(ul, ol, dl):has(> .Card))`
  in Card.css solve nested-Card and list-of-Cards layout where the relationship
  requires naming the child's class.

## File layout

All frontend code lives in `app/frontend/` — see the file-organization skill.
Component CSS is co-located with its JS (`components/Card/Card.css`); the
Cadence design system (tokens, reset, compositions, utilities) lives in
`app/frontend/cadence/`. Every `.css` file on the load path is included
automatically — no manifest to edit.

## CSS linting

Stylelint enforces these patterns in development and CI via `npm run lint:css`
(included in `npm run check` and therefore `bin/ci`). Configuration lives in
`stylelint.config.mjs` at the project root. The linter rejects invalid
declarations, unknown properties, raw color values outside token files, excessive
nesting depth, descending specificity, `!important`, and `transition: all`. Class
naming pattern enforcement (SUIT conventions) is advisory — it flags likely
mistakes but cannot distinguish all valid cases, so edge cases remain review
responsibilities.

Inline styles are caught on the markup side: a custom herb rule in `.herb/rules/`
fails `npm run lint:erb` on any `style=` attribute or `style:` helper argument
that sets anything other than a custom property. Mailer views are exempt (the
mailer-patterns skill asks for inline CSS there). Write property names literally
— an interpolated property name, or a whole value from a variable, is reported
because the rule cannot tell whether it is a custom property.

After editing a rule in `.herb/rules/`, run `bin/herb-rules-check` and read the
reported line numbers back; the exit code alone cannot tell you the rule loaded
(docs/decisions/a-custom-herb-rule-that-throws-on-load-leaves-the-gate-passing-at-exit-0.md).

When the rule flags a file, fix the file. The per-rule `exclude` list in
`.herb.yml` only shrinks.
