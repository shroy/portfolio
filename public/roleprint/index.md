# Roleprint

AI tooling

A résumé tailored to the role, grounded in real experience.

Roleprint is an AI-assisted résumé tailoring system I built using Jev, with a ChatGPT plugin interface. It takes a job description and identifies the most relevant parts of my existing professional history, producing a tailored résumé without inventing qualifications or accomplishments.

[Download my résumé ↓](/josh-shroy-resume.pdf)

Interactive tailoring coming soon

## How it works

1. **The role:** A job description.
2. **Jev:** Judges what the role needs and how relevant each documented achievement is.
3. **The résumé:** Code picks the strongest matches and builds the experience section from wording I’ve already approved.

## The principle

Roleprint changes what gets emphasized, not what is true. Jev makes judgments and never writes the résumé itself. Every experience bullet is copied word for word from a record that cites its source, and the build fails if one doesn’t.

## Under the hood

It’s a TypeScript app that ChatGPT talks to through an MCP server. Jev answers typed questions about fit and relevance. Chromium renders the PDF, and the PDF gets checked before it goes back to ChatGPT.

- [All work](/#work)
- [Next: Story](/story/)

---

Josh Shroy, Software Engineer

- [Contact](/contact/)
- [GitHub](https://github.com/shroy)
- [LinkedIn](https://www.linkedin.com/in/joshshroy/)
- [Source](https://github.com/shroy/portfolio)
