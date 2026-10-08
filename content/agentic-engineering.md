# Agentic Engineering page copy

Josh's brief (2026-10-08), with the diagram and the KickFirst/Unmute details
checked against the repos. Approved by Josh, 2026-10-08.
Transcribe into markup verbatim, including curly apostrophes (’) and the
middle dot (·). Change copy here first, and only with Josh's approval.

Accuracy rules: experiments are not shipped work. Scriptorium was an internal
Wistia hackathon prototype, never released and never rolled out. No invented
agents, integrations or metrics (no speed-ups, PR counts or adoption). Never
publish Wistia-internal repo names or issue numbers (the screenshot is cropped
to the decision map panel: no repo name, no issue number, no chat column), anything from Wistia's internal
skills repo, or the Bedrock key detail in KickFirst's decision log.

Sources: KickFirst `.claude/agents/{planner,implementer,verifier,reviewer}.md`
and `.claude/skills/{plan-epic,run-epic}` (repair rounds: WAVE_MAX_ROUNDS,
default 4; the merge to main is always the human's); `docs/decisions/` (one
fact per file); Unmute `CLAUDE.md` ("planner → builder → verifier"; used only for the Stimulus → HookTML migration).

## Header

- Eyebrow: Engineering Practice · AI & Tooling
- Title: Agentic Engineering
- Intro: I’ve been experimenting with ways to make AI-assisted software development more reliable. From planning and implementation to verification and review, I’ve built workflows that help agents produce work that’s easier to understand, maintain, and ship.

## Diagram: the workflow behind KickFirst's agents

One diagram, not cards: stages on a fine rule, a dashed return from Verify into
Implement. Risk belongs to Review; no fifth stage.

1. Plan: Define the work and establish requirements.
2. Implement: Write code and tests.
3. Verify: Check the implementation against requirements and conventions.
4. Review: Evaluate the changes, findings, and risks.
- Return label: When verification fails, findings return to the implementer for another iteration.
- Caption: The workflow behind KickFirst’s agents. Merging to main is always my call.

## Agent workflows

- Heading: Agent workflows
- Body:
  1. I’ve built workflows around specialized agents, durable context, reusable conventions, and verification loops. The goal is to keep work moving across sessions while making the resulting changes understandable to the people reviewing them.
  2. Most of it took shape in KickFirst, where each issue moves through its own planner, implementer, verifier and reviewer, and small decision records carry context from one session to the next. On Unmute I used the loop for a single job, the migration from Stimulus to HookTML. I used a tailored version of it all the time at Wistia.
     (Josh, 2026-10-08: on Unmute the loop was only used for the Stimulus → HookTML migration; a tailored version is used heavily at Wistia.)
  3. At Wistia, I also experimented with agent-assigned PR risk levels. The idea was to distinguish changes needing careful human review from those that might eventually be safe to merge automatically.
     (An experiment toward safer automation: autonomous merging was never built. Don't claim it.)

## Scriptorium · Wistia hackathon

- Heading: Scriptorium · Wistia hackathon
- Body:
  1. At Wistia, I explored a different problem: helping people turn ambitious ideas into manageable engineering work.
  2. I built a prototype around Wizard, our internal AI coding agent. It interviewed users to clarify requirements, assembled a decision map and project brief, and broke the work into smaller GitHub issues. A requirements checklist gave the verifier something concrete to check against as the project progressed.
  3. Scriptorium was an internal hackathon prototype. It was never released.
- Screenshot (the decision map panel only; tap to enlarge), caption: From the hackathon prototype: the decision map, turning answers into a feature spec.
- Alt: Scriptorium’s decision map: a feature spec written up from two decided questions

## Case study in progress

- Heading: Case study in progress
- Body: I’ll be sharing a closer look at the verification workflows, how I manage agent context and conventions, and the Scriptorium experiment that explored turning conversations into verifiable engineering work.

## Closing row

- All work (back to the landing page's work index)
- Next: Roleprint

## Later (not v0)

Each is a section row of its own when it comes: an interactive verification
workflow; a reconstruction of Scriptorium's interview and decision map; how
decisions, requirements, GitHub issues and verification relate; real examples
from KickFirst and Unmute; tradeoffs and lessons learned.
