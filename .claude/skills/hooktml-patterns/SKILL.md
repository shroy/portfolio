---
name: hooktml-patterns
description: HookTML hook, component, and signal conventions for interactive behavior. Use whenever writing, changing, or reviewing code that imports `hooktml` or markup with `use-*` attributes or capitalized component classes.
---

# HookTML Patterns

HookTML attaches behavior to existing HTML. Use it only for behavior or state
that remains after HTML and CSS have done their part.

For API facts — prop binding and coercion, children, signals, deps arrays,
context, the chainable API — open [reference.md](reference.md), the library
README.

## Rules

- **Hook or component.** A hook is a behavior any element can take on: small,
  local, and named for the interaction (`useDisclosure`), never the screen it
  serves. A component is a named thing in the interface (a toggle, a
  breadcrumb) whose behavior is its own; it owns its parts and may use hooks.
  Ask whether the behavior travels to other elements (hook) or belongs to
  this thing (component).
- **Markup is never generated.** Hooks and components receive an existing
  element and attach behavior to it.
- **The DOM is the state when it already holds the truth.** Read and toggle
  attributes, `dataset`, `open`, `hidden`, or form values before mirroring
  them in a signal. No module-level state shared between elements.
- **Signals, not framework state.** `signal()` and `computed()` carry
  reactivity; the function runs once per element and never re-renders.
- **Use browser APIs directly** (`matchMedia`, `IntersectionObserver`,
  `<dialog>.showModal()`); wrap one only when the hook adds real behavior.
- **Owned parts are named children.** Use `querySelector` only for content a
  consumer supplies that the abstraction can't name.
- **Props are configuration.** Never re-coerce a prop; values that must survive
  verbatim go in `data-*` attributes.
- **Call hooks at the top level** of a hook or component body, never inside an
  effect or callback. Call utility hooks (`useEvents`, `useClasses`,
  `useAttributes`, `useStyles`, `useText`) without null guards — they no-op on
  missing elements.

## Cleanup

Bindings on the element clean up with it. Listeners on `document` or `window`,
observers, and timers are yours: return their teardown from the hook or
component (or as `cleanup` alongside `context`). A `useEvents(document, …)`
call returns its remover — return that.
