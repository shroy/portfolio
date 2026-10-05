# Josh Shroy — portfolio

A personal portfolio for Josh Shroy, Software Engineer. The source is part of
the portfolio: keep it unusually small, clean, and unsurprising.

## Stack and routes

- Vite multi-page app: real HTML documents per route (`/`, `/wistia`,
  `/unmute`, `/kickfirst`, `/provide`). No SPA router, no React, no
  animation or utility-CSS libraries unless a requirement proves the need.
- Semantic HTML and CSS first; TypeScript plus HookTML only for behavior
  CSS can't express. Content and layout work without JavaScript.
- Cross-document View Transitions carry continuity between routes; navigation
  works normally without them. Native scrolling only; no scrolljacking.

## Sources of truth

- Design: Paper file "Portfolio — Homepage Explorations". Desktop "Landing —
  A v5 (real assets)" (page "Round 6 — Locked direction"); mobile "Mobile —
  Final (refined from 3)" (page "Round 10 — Mobile pass"). Both approved —
  implement, don't redesign. Project-page bodies are not designed yet.
- Copy: `content/landing.md`, transcribed verbatim. Copy changes start there,
  only with Josh's approval.
- Motion: `src/styles/scenes.css` — locked. Project scenes pin and break away
  into large mixed-size blocks (masks in `src/assets/masks/`, mirrored on
  alternate scenes) revealing the next scene in place; tempo is two variables.
  Dissolve/melt, sheet and tab directions were tried and rejected.
- Conventions: `.claude/skills/` — architecture-patterns decides whether
  structure exists; html-, css-, hooktml- and ts-patterns decide how.

## Delivery

- One small global stylesheet; minimal shared JS. Project-specific code and
  media load only on routes that need them.
- Fingerprinted assets get long-lived immutable caching; HTML revalidates.
- Preload only above-the-fold font and media. Give every media element
  explicit dimensions; lazy-load below the fold.
- Prefetch project routes opportunistically (hover, focus, intent) once base
  navigation works — never eagerly prefetch everything.
- Media is optimized once and committed under `src/assets/`; no
  image-processing dependency.

## Intermediate widths (later pass)

Once scenes, motion and routes are stable, refine 768–1180px and tablet
landscape: type scale, copy-column width, media/copy balance, scene rhythm,
top-bar/index crowding. Intrinsic or fluid layout first; a new breakpoint only
when the whole composition changes; no per-project tablet fixes.

## Telemetry detail (later phase)

Developer easter egg: 2–3 real metrics (e.g. LCP, CLS, JS weight), shown
after first paint for ~8–12 s, dismissible, once per visit, lazy-loaded.

## Quality bar

- LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 — measured, lab and field reported
  separately.
- Verify every change with the `verify` skill; milestone reviews run
  `bin/review`.
- Never add a `CLAUDE.md` anywhere in this repo: Claude Code would then
  ignore this file.
