---
name: architecture-patterns
description: Decision rules for system shape — when a component, token, wrapper pattern, utility, architecture layer, or dependency may exist, and how to simplify after building. Use before adding any of those, when planning how a feature is structured, and after finishing substantial implementation. Sits above html-patterns, css-patterns, hooktml-patterns, and ts-patterns.
---

# Architecture Patterns

The simplest architecture that fully solves the problem wins: least code, DOM,
CSS, JavaScript, and indirection. The code is read as closely as the interface
it produces — it should be small, coherent, and unsurprising.

This skill decides *whether* structure exists and what shape it takes.
html-patterns, css-patterns, hooktml-patterns, and ts-patterns own *how* it is
written.

## Order of resort

Solve each requirement at the first level that expresses it cleanly:

1. **Native platform** — HTML elements, CSS, browser behavior.
2. **Existing primitive** — a project component, hook, token, or layout
   primitive given new content. Search before moving on; name what you found.
3. **Local implementation** — written where it's used.
4. **Shared abstraction** — only through the gate.
5. **Dependency** — only through the gate.

A level is "clean" when the result is no larger or harder to read than the next
level's would be.

## The gate

Before adding a component, token, wrapper pattern, utility, architecture layer,
or dependency, answer in one sentence each:

1. What duplication or complexity exists in the code now? Point to it.
2. Why can't the current primitives express it?
3. What code does the addition remove?
4. Is the result simpler than leaving it local?

Hypothetical future reuse does not count. Done when all four answers name real
code and the addition removes more than it adds; otherwise keep it local. State
the answers in the reply, commit, or PR.

## Components

A component exists for repeated structure, reusable behavior, a semantic
boundary, or meaningful complexity — and makes its call sites simpler than the
markup it replaces. Single-use code stays local unless isolating it clearly
improves comprehension. When a component grows flags to serve different
callers, split it or compose smaller primitives.

## Shared systems

Build from a small vocabulary of reusable primitives. Similar features differ
through content and composition first, architecture last. A parallel
per-feature structure means the shared primitive is missing a parameter — add
the parameter.

## Tokens

A token names a recurring semantic decision: it appears more than once *and*
means the same thing each time. One-off composition or asset measurements stay
local, beside the rule that uses them.

## Minimal structure

Every CSS layer, state abstraction, and behavior has a concrete responsibility
you can name in one line. When the responsibility disappears, delete it.

## Simplification pass

After substantial implementation, walk the diff and delete:

- wrappers with no remaining responsibility
- duplicate CSS
- redundant tokens, and literals an existing token already names
- abstractions that fail the gate in hindsight
- JavaScript that can become CSS or native behavior
- dependencies that no longer earn their cost

Fix by deleting, not by adding a layer around awkward code. Done when every
item is removed or listed with the reason it stays.
