---
name: verify
description: Verification loop for this repo — proportional self-checks after each change, a simplification pass, and an inspect-only fresh-context review at milestones. Use after finishing any change before calling it done, and when a milestone calls for an outside review.
---

# Verify

**Build → verify → simplify → continue.** The implementation agent owns the
branch, verifies its own work in the same session and model, and keeps its
context. Only a milestone review uses another agent. Verification inspects; it
never takes over implementation.

Scope every check to the current diff and the surface it affects. Read only
the local skills that govern the changed files.

## Self-check

Run the row that matches the change:

| Change | Steps |
|---|---|
| Copy, or a single style value | 2, 3, 5 |
| Markup, layout, or a component | 1–5, simplify |
| Behavior, motion, or focus | 1–6, simplify |

1. Typecheck and build pass.
2. The affected page is open in a real browser.
3. The console shows no new errors or warnings.
4. The changed behavior works as intended.
5. Affected desktop and mobile layouts match the approved design.
6. Keyboard and reduced-motion behave correctly.

**Simplify:** run architecture-patterns' simplification pass and ts-patterns'
review on the diff.

Fix in place with the smallest change that works. Rebuild only when the current
approach is fundamentally unsalvageable — say why before starting over.

Done when every step in the row passes and each simplification finding is
fixed or kept with a stated reason. Then continue.

## Milestone review

Milestones: landing page structurally complete; shared scene/scroll system
complete; View Transitions complete; a substantial interactive showcase
complete; shared project-page template complete; pre-launch. Ordinary tasks
never get one.

**Reviewer model:** one fresh-context reviewer from a different model family
than the implementer, so its judgment is independent rather than a replay of
the implementer's assumptions. Prefer OpenAI GPT-6.1 Sol or its direct
successor in the Sol line; otherwise the strongest available OpenAI
coding/reasoning model of comparable capability. Never substitute a lightweight
or fast model because it is newer. The orchestration layer picks the actual
model.

**Reviewer brief** — fill in the milestone and diff range:

> Read-only review. Do not modify files, take over the branch, or rebuild
> anything. Milestone: `<name>`. Inspect `git diff <base>...HEAD`, the files
> it directly affects, and the rendered surface where useful. Read only the
> local skills that govern those files. Report at most 5 findings, highest
> impact first, one line each: `file:line` — problem — smallest viable fix —
> `blocking` | `optional`. Prefer incremental correction; recommend a rewrite
> only when the code cannot be repaired in place. No speculative abstractions
> or unrelated cleanup. If nothing is meaningful, reply "No findings."

The implementation session applies the findings — every blocking one, and the
optional ones it agrees with — then re-runs its self-check for what changed.
