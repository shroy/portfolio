# joshshroy.com

The portfolio of Josh Shroy, software engineer.

**Live: [joshshroy.com](https://joshshroy.com)**

Hand-built, with no framework and no template: real HTML pages, one small
stylesheet, and about a thousand lines of TypeScript for the behavior CSS
can't express.

## How it's built

- **Real pages.** A Vite multi-page app: each route is its own HTML document,
  so content and navigation work without JavaScript.
- **CSS first.** Layout, motion and state live in CSS: a frosted sticky top
  bar whose text changes ink exactly where a section's edge crosses it,
  one-time entrances, and cross-document View Transitions between pages. All
  scrolling is native.
- **HookTML for behavior.** What JavaScript there is attaches to existing
  markup as hooks and components from
  [HookTML](https://github.com/shroy/hooktml), my open-source library.
- **Synthesized sound.** Opt-in Web Audio with no samples. The 404 page is a
  playable drum kit.
- **Contact without an address.** The form posts to a Cloudflare Pages
  Function that sends mail through Resend, so no email address appears
  anywhere on the site.
- **Measured.** The budget is LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1. The
  main pages score 99–100 in Lighthouse.
- **Readable by machines too.** Every page ships a Markdown version of its
  copy ("Read as Markdown"), and the build fails if a page is missing one.

## How it's worked on

It's built with AI agents working from a written brief. [`AGENTS.md`](AGENTS.md)
sets the rules, and [`.claude/skills/`](.claude/skills) holds the conventions
(architecture, HTML, CSS, HookTML, TypeScript) and the verification loop every
change goes through. Milestones get an independent review (`bin/review`),
`bin/audit` runs Lighthouse against the production build, CI typechecks and
builds every pull request, and merging to `main` deploys.

## Run it

Needs Node 22.

```sh
npm ci
npm run dev                       # http://localhost:5173
npm run build && npm run preview  # the production build
```

## Layout

| Path | What's there |
|---|---|
| `index.html`, `wistia/`, `unmute/`, `provide/`, `kickfirst/`, `roleprint/`, `story/`, `agentic-engineering/`, `resume/`, `contact/`, `404.html` | The pages |
| `src/styles/` | Tokens, base, layout, components, and `scenes.css` for motion |
| `src/*.ts` | HookTML hooks and components |
| `content/` | Approved copy, transcribed verbatim into the pages |
| `functions/api/contact.ts` | The contact form's Pages Function |
| `public/` | Static files, including each page's Markdown |

## Rights

The code is here to read and learn from. The copy, photos, screenshots and
other media are mine and aren't licensed for reuse. The fonts (Pathway Extreme
and Geist) are under the SIL Open Font License; see `src/assets/fonts/`.
