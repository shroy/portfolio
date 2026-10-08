# Agentic Engineering

Engineering Practice · AI & Tooling

I’ve been experimenting with ways to make AI-assisted software development more reliable. From planning and implementation to verification and review, I’ve built workflows that help agents produce work that’s easier to understand, maintain, and ship.

## The workflow behind KickFirst’s agents

1. **Plan:** Define the work and establish requirements.
2. **Implement:** Write code and tests.
3. **Verify:** Check the implementation against requirements and conventions.
4. **Review:** Evaluate the changes, findings, and risks.

When verification fails, findings return to the implementer for another iteration. Merging to main is always my call.

## Agent workflows

I’ve built workflows around specialized agents, durable context, reusable conventions, and verification loops. The goal is to keep work moving across sessions while making the resulting changes understandable to the people reviewing them.

Most of it took shape in [KickFirst](/kickfirst/), where each issue moves through its own planner, implementer, verifier and reviewer, and small decision records carry context from one session to the next. On [Unmute](/unmute/) I used the loop for a single job, the migration from Stimulus to HookTML. I used a tailored version of it all the time at Wistia.

At Wistia, I also experimented with agent-assigned PR risk levels. The idea was to distinguish changes needing careful human review from those that might eventually be safe to merge automatically.

## Scriptorium · Wistia hackathon

At Wistia, I explored a different problem: helping people turn ambitious ideas into manageable engineering work.

I built a prototype around Wizard, our internal AI coding agent. It interviewed users to clarify requirements, assembled a decision map and project brief, and broke the work into smaller GitHub issues. A requirements checklist gave the verifier something concrete to check against as the project progressed.

Scriptorium was an internal hackathon prototype. It was never released.

## Case study in progress

I’ll be sharing a closer look at the verification workflows, how I manage agent context and conventions, and the Scriptorium experiment that explored turning conversations into verifiable engineering work.

- [All work](/#work)
- [Next: Roleprint](/roleprint/)

---

Josh Shroy, Software Engineer

- [Contact](/contact/)
- [GitHub](https://github.com/shroy)
- [LinkedIn](https://www.linkedin.com/in/joshshroy/)
- [Source](https://github.com/shroy/portfolio)
