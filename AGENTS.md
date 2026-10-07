# Josh Shroy — portfolio

A personal portfolio for Josh Shroy, Software Engineer. The source is part of
the portfolio: keep it unusually small, clean, and unsurprising.

## Stack and routes

- Vite multi-page app: real HTML documents per route (`/`, `/resume/`,
  `/wistia`, `/unmute`, `/kickfirst`, `/provide`). No SPA router, no React, no
  animation or utility-CSS libraries unless a requirement proves the need.
- Semantic HTML and CSS first; TypeScript plus HookTML only for behavior
  CSS can't express. Content and layout work without JavaScript.
- Cross-document View Transitions carry continuity between routes; navigation
  works normally without them. Native scrolling only; no scrolljacking.

## Sources of truth

- Design: the implemented site is the source of truth. Paper file "Portfolio —
  Locked Design" mirrors it as the design reference (landing desktop + mobile,
  states, shared system); keep it in step when the site changes. "Portfolio —
  Homepage Explorations" is an exploration archive, not a reference. The
  Contact dialog and the Résumé chooser (popover, phone sheet, standalone
  `/resume/`) are built. The project-page template (project-coloured header
  with the career timeline, white section rows, back/next row) is built on
  `/wistia`; the other project pages, Story and the Roleprint flow are not
  designed yet.
- Copy: `content/*.md`, transcribed verbatim. Copy changes start there, only
  with Josh's approval.
- Motion (locked): `src/styles/scenes.css`, behavior in `src/*.ts` as HookTML.
  Native scroll; one screen per project; one-time role-ordered entrances; a
  frosted sticky top bar whose text splits ink at section edges, with a
  section crumb that unfolds into jump links; a gentle near-miss settle;
  opt-in synthesized sound. Rejected: dissolve, sheet/tab, glass refraction,
  block hand-offs (saved on `motion/blocks`).
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
- Hosting: Cloudflare Pages. The contact form posts to a Pages Function
  (`functions/api/contact.ts`) that sends mail through Resend with one
  `fetch`; secrets `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`. No address
  appears in any page. Shared HTML fragments live in `src/partials/` and are
  pulled in with `<!-- include … -->` (vite.config.ts).

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
- CI (`.github/workflows/ci.yml`) typechecks and builds every PR to `main`.
- Never add a `CLAUDE.md` anywhere in this repo: Claude Code would then
  ignore this file.
