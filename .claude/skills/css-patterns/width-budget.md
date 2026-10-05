# Width budget: a worked sum

Open this when a layout has a hard space budget. The sum decides whether the
composition can hold its content; a screenshot only shows one width.

## Two controls side by side in a card

Two buttons in a `.cluster` inside a card, page at the mobile width. Tokens from
`app/frontend/cadence/foundations/01-tokens.css`.

```
viewport                                   390
− page gutters       2 × --space-gutter (20)             −40  → 350
− card inset         2 × --space-card-inset-inline (18)  −36  → 314
− cluster gap        1 × --space-cluster (10)            −10  → 304
÷ 2 controls                                                  → 152 per control
− control inset      2 × --space-control-inset-inline (16) −32
− border             2 × --border-width (1)                −2  → 118 px for each label
```

118 px holds "Save reps" at the control type size; it does not hold
"Save and start next set". The label decides, not the breakpoint.

## The same row at the 200 % zoom viewport

WCAG's 200 % check is a viewport of 195 (390 × 100 ÷ 200):

```
195 − 40 − 36 − 10 = 109 → ÷ 2 = 54 → − 32 − 2 = 20 px per label
```

No label fits in 20 px, so at this viewport the cluster must wrap to one control
per row. That is a `flex-wrap` outcome of the composition, not a breakpoint
chosen by device name.

## Writing it down

The arithmetic goes above the rule it justifies, in the tokens' names:

```css
/* 390 − 2·gutter(20) − 2·card-inset-inline(18) − cluster(10) = 304; ÷2 = 152 per control */
.set-actions {
  --cluster-gap: var(--space-cluster);
}
```

A reader re-checks the sum against the tokens; a changed token changes the
comment, and the sweep proves the result.
