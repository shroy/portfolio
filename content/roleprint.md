# Roleprint page copy

Drafted 2026-10-08 from Josh's brief and checked against the code (the
Candidraft repo: Roleprint's name in code). Approved by Josh, 2026-10-08.
Transcribe into markup verbatim, including curly apostrophes (’) and the
middle dot (·). Change copy here first, and only with Josh's approval.

What's true, from the code: Jev never writes text. It answers typed questions
(which base profile fits, what the role requires, how relevant each documented
achievement is) and plain code selects. Every experience bullet is copied word
for word from an approved record whose evidence cites a registered source; the
build fails otherwise. The headline and summary are profile text, not sourced
records, so never claim "every line sourced". ChatGPT connects through an MCP
server. v0 has no tailoring on the site: don't imply it.

## Header

- Eyebrow: AI tooling
- Title: Roleprint
- Subtitle: A résumé tailored to the role, grounded in real experience.
- Intro: Roleprint is an AI-assisted résumé tailoring system I built using Jev, with a ChatGPT plugin interface. It takes a job description and identifies the most relevant parts of my existing professional history, producing a tailored résumé without inventing qualifications or accomplishments.
- Action: Download my résumé ↓ (the public PDF, /josh-shroy-resume.pdf)
- Note: Interactive tailoring coming soon

## How it works (the diagram)

1. The role: A job description.
2. Jev: Judges what the role needs and how relevant each documented achievement is.
3. The résumé: Code picks the strongest matches and builds the experience section from wording I’ve already approved.

## The principle

- Heading: The principle
- Body: Roleprint changes what gets emphasized, not what is true. Jev makes judgments and never writes the résumé itself. Every experience bullet is copied word for word from a record that cites its source, and the build fails if one doesn’t.

## Under the hood

- Heading: Under the hood
- Body: It’s a TypeScript app that ChatGPT talks to through an MCP server. Jev answers typed questions about fit and relevance. Chromium renders the PDF, and the PDF gets checked before it goes back to ChatGPT.

## Closing row

- All work (back to the landing page's work index)
- Next: Story
