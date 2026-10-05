---
name: hooktml-patterns
description: HookTML component, hook, and signal conventions for all JavaScript behavior in this app. Use whenever writing, changing, or reviewing JavaScript — this app uses HookTML instead of Stimulus, and Stimulus- or React-style code must never be written.
---

# HookTML Patterns

## When to use

When writing or modifying code that uses the `hooktml` library — components, hooks, signals, or HTML with `use-*` attributes or component class bindings.

## Where things live in this app

- Components: `app/frontend/components/<Name>/<Name>.js` — one folder per component, self-registered at the bottom of the file. Co-located CSS lives beside it (`<Name>.css`) — see file-organization
- Hooks: `app/frontend/hooks/use<Name>.js` — flat, one file each, no CSS. A hook that needs its own stylesheet is a component wearing a hook's name
- Entry point: `app/frontend/application.js` must `import "components/<Name>/<Name>"` for every component (no index files; an unimported file never activates), then calls `HookTML.start()`
- Open [reference.md](reference.md) when you need a hook's exact signature, use a hook not shown below, or are debugging component activation. **Note:** reference.md mirrors the library README verbatim, so its examples show raw library idiom — when copying them into app code, house rules (js-patterns) still apply.

## Core rules

HookTML is NOT React. It enhances existing HTML with behavior — no JSX, no virtual DOM, no re-renders.

### Hooks first, components second

Default to writing hooks. Keep them generalized and reusable. Only create a component when you need very specific coordinated behavior across multiple elements, or when a component is essentially a group of hooks. This keeps HTML lean — unlike React, hooks are the primary unit of abstraction.

**Name a hook for the interaction, never for the screen or field it happens to operate on** — `useDisclosure`, not `useTeamCodeToggle`. Renaming a feature-named hook after the fact isn't enough: it will have grown that screen's assumptions, so rewrite it. Check first whether a native element already is the interaction — html-patterns owns that test and the naming criterion with it.

### Never generate HTML from JS

Components receive a DOM element (`el`) and attach behavior. They never return markup.

### One initialization, continuous reactivity

The component or hook function itself runs once per element — but the system is fully reactive. Signals plus effects provide fine-grained reactivity, and a MutationObserver automatically initializes new elements, updates hooks when attributes change, and runs cleanup when elements are removed.

### Use `signal()`, not `useState`

Signals are standalone reactive primitives. Write with `.value =`, read with `.value`.

### Hooks bind via `use-*` attributes

`use-tooltip="text"` calls `useTooltip(el, { value: "text" })`. Additional props come from matching prefixed attributes (`tooltip-placement="top"` → `props.placement`).

### Props are auto-coerced

HookTML coerces prop values: `"true"` → `true`, `"false"` → `false`, `"null"` → `null`, numeric strings → numbers. Do not manually coerce props with `Number()`, `=== 'true'`, etc.

### Props are configuration; verbatim payloads are data attributes

HookTML coerces prop values, so payloads that must survive verbatim — copy-to-clipboard text, code snippets, anything code-shaped — never ride prop-shaped attributes. Put them in `data-*` attributes, which the coercion step ignores (unless `attributePrefix: "data"` is configured, which this app doesn't use). If you find yourself reading the raw attribute behind a prop to dodge coercion, the value should not be a prop.

## Null tolerance

**The five utility hooks — `useEvents`, `useClasses`, `useAttributes`, `useStyles`, `useText` — no-op on `null`, `undefined`, AND empty arrays.** Never wrap them in `if (el)`. A guard is legitimate only when its body dereferences the element — reads a property, narrows a type for handler code:

```js
// Wrong — useEvents already handles null/undefined/empty arrays
if (button) {
  useEvents(button, { click: onClick });
}

// Right — no guard needed
useEvents(button, { click: onClick });

// Guard legitimate — body dereferences the element
if (isHTMLElement(button)) {
  const action = button.dataset.action;
  useEvents(button, { click: () => performAction(action) });
}
```

**`useChildren(el, prefix)` and `with(el)` DO throw on non-elements.** Guard these only when the element is genuinely optional.

**Every hook throws on an empty or missing map argument.** `useEvents(el, {})` is a call-site error — delete the call.

## Owned parts come from the library

### Components read `props.children`

Components receive child elements through `props.children`. Elements with attributes like `dialog-header`, `dialog-close` are collected automatically:

```js
export const Dialog = (el, props) => {
  const { header, close } = props.children ?? {};
  // ...
};
```

**Both singular and plural keys are always created** when children exist: `{ button: HTMLElement, buttons: [HTMLElement] }` for one, `{ button: HTMLElement, buttons: [HTMLElement, HTMLElement] }` for many. Choose the access pattern you need.

**`props.children` itself is absent when nothing matches** — destructure with `?? {}`.

### Hooks call `useChildren(el, prefix)`

Hooks have no `props.children` and must query their own scoped children:

```js
export const useToggle = (el, props) => {
  const { button, content } = useChildren(el, "toggle");
  
  useEvents(button, { click: () => content.toggleAttribute("hidden") });
};
```

Same singular and plural key behavior as components.

For dynamic lists where children may be added or removed, make specific properties reactive:

```js
const children = useChildren(el, "list", { signals: ["item"] });

// Reactive — updates when DOM changes
const items = children.items.value; // HTMLElement[]

useEffect(() => {
  console.log(`Now have ${items.length} items`);
}, [children.items]);
```

### When `querySelector` is correct

Children name the parts the hook or component *owns*. **`querySelector` stays correct for markup a consumer supplies and the abstraction can't name** — the arbitrary form fields inside a disclosure, the user-provided content inside a slot. Querying for a part you could have named is the smell, not querying as such.

### Swap-safety in Turbo Stream/Frame regions

**`props.children` and plain `useChildren(el, prefix)` are init-time snapshots.** When a Turbo Stream or Frame replaces content that includes a named child, the reference becomes detached and the component silently breaks — clicks do nothing, attribute updates target removed elements, and `isConnected` checks fail.

A named child inside a swappable region must be resolved live. Use `useChildren` with the `signals` option — its MutationObserver re-scans the children on every DOM mutation, so the signal always points at the current element:

```js
// Wrong — detaches after first stream/frame swap
export const Panels = (el, props) => {
  const { emailRow } = props.children ?? {};
  const openEmail = () => {
    emailRow.hidden = true;  // targets detached node after swap
  };
};

// Right — reactive children stay live across swaps
export const Panels = (el, props) => {
  const children = useChildren(el, 'panels', {
    signals: ['emailRow', 'emailPanel']
  });

  const openEmail = () => {
    children.emailRow.value.hidden = true;  // always the current element
  };
};
```

Reaching for a hand-rolled `() => el.querySelector('#email-row')` getter to dodge the snapshot is the smell the `signals` option exists to remove — prefer `useChildren` with `signals`. Init-time collection (`props.children`, plain `useChildren`) remains correct for children that never swap: a dialog's header and close button, a form's submit, anything outside the stream/frame target.

## `useEvents` reach

`useEvents` accepts `HTMLElement`, `Document`, `Window`, and arrays of `HTMLElement`:

```js
// Document and window
useEvents(document, { keydown: onEscape });
useEvents(window, { resize: onResize });

// Arrays — handler receives (event, index)
useEvents(tabButtons, {
  click: (event, index) => activeTab.value = index
});
```

**Document and window listeners require explicit cleanup management.** When called compositionally (directly in the component body, not via a `use-*` directive), `useEvents` returns a remover function. Capture it and return it from the component — HookTML auto-registers a returned teardown and runs it when the element is removed:

```js
// Return the remover — it will be auto-registered as component cleanup
export const Modal = (el, props) => {
  const remover = useEvents(document, {
    keydown: (e) => {
      if (e.key === "Escape") close();
    }
  });

  return remover;
};
```

Never call `useEvents` — or any other hook — inside a `useEffect` callback to get its cleanup auto-registered. Nesting hooks re-runs the inner hook on every effect pass and hides the wiring. Capture-and-return (above) or the object return under [Cleanup behavior](#cleanup-behavior) is the idiom.

### Per-element function values

Class, style, and attribute maps accept per-element functions that receive `(element, index)`:

```js
useClasses(tabButtons, {
  active: (btn, index) => selectedTab.value === index
}, [selectedTab]);

useStyles(cards, {
  opacity: (card, index) => index === activeIndex.value ? 1 : 0.5
}, [activeIndex]);
```

Direct signal values (not accessed via `.value`) are detected automatically — no deps needed. Functions that access `.value` require a deps array.

## Signals and computed

```js
const count = signal(0);
const doubled = computed(() => count.value * 2);

// Deps arrays take signal objects, not .value
useText(display, () => `${count.value}`, [count]);

useEffect(() => {
  console.log(doubled.value);
}, [doubled]);
```

## Boolean attributes

HTML boolean attributes (`disabled`, `hidden`, `readonly`) are presence-based: any value means true. `useAttributes` only removes an attribute for `null` or `undefined` — `false` sets the literal string `disabled="false"`, which still disables. Return `""` to set the attribute, `null` to remove it:

```js
const booleanAttribute = (isOn) => (isOn ? "" : null);

useAttributes(button, {
  disabled: () => booleanAttribute(!canSubmit.value)
}, [canSubmit]);
```

## Component context

When components need to talk to each other, return a `context` object:

```js
export const Dialog = (el, props) => {
  const open = () => el.removeAttribute("hidden");
  const close = () => el.setAttribute("hidden", "");

  return {
    context: { open, close }
  };
};
```

Access the context at `el.component`:

```js
const dialog = el.closest(".Dialog")?.component;
dialog?.open();
```

## Cleanup behavior

HookTML auto-registers cleanup in two scenarios — everywhere else, the caller owns cleanup explicitly.

**Auto-registered:**

1. **Directive bindings** — when a hook is bound via a `use-*` attribute (`<div use-tooltip="...">`), the framework calls `scanDirectives`, which invokes the hook and auto-registers any returned teardown function. The cleanup runs when the element is removed from the DOM.

2. **Effect cleanups** — when you wrap wiring in `useEffect(() => { return cleanup; }, [])`, the cleanup function is auto-registered and runs when the element is removed or the effect re-runs due to dependency changes.

**Not auto-registered:**

3. **Compositional calls** — when you call a hook directly in a component or another hook's body (e.g., `useEvents(document, { ... })` outside `useEffect`), the return value is never auto-registered. The caller must handle it:

```js
// Return the remover — component cleanup auto-registers it
export const Modal = (el, props) => {
  const remove = useEvents(document, { keydown: onEscape });
  return remove;
};

// OR combine with component cleanup via object return
export const Modal = (el, props) => {
  const removeEscape = useEvents(document, { keydown: onEscape });
  const open = () => el.removeAttribute("hidden");

  return {
    context: { open },
    cleanup: removeEscape
  };
};
```

Do not reach for `useEffect(() => useEvents(...), [])` to auto-register the cleanup — that nests a hook inside a hook (see [What NOT to do](#what-not-to-do)). `useEffect` is for effects whose cleanup is a plain function (a manual `removeEventListener`, a `clearTimeout`), not for wrapping another hook.

Forgetting to return or wrap a document/window listener leaves it orphaned — the component is torn down, but the listener persists and keeps firing on a stale element reference.

## Chainable API

```js
import { with as withEl } from 'hooktml';

withEl(el)
  .useEvents({ click: handler })
  .useClasses({ active: isActive })
  .useAttributes({ 'aria-expanded': isOpen });
```

The chain returns itself from every method — there is no `.cleanup()` terminator. Each chained hook call binds to the element passed to `with()`, and those bindings clean up when that element is removed. Document or window listeners set via the chain are not auto-cleaned and will leak — use the compositional form (direct `useEvents` call) with explicit cleanup management instead.

## What NOT to do

- Don't return JSX or HTML strings from components
- Don't use `useState`, `useRef`, `useMemo`, or other React hooks
- Don't expect component functions to re-run
- Don't query for a child you could have named — declare it as a child attribute instead
- Don't forget to register components/hooks before `start()`
- Don't add signals to deps arrays as `.value` — pass the signal object itself: `[count]` not `[count.value]`
- Don't wrap utility hooks in `if (el)` guards — they already handle null/undefined/empty arrays
- Don't call a hook inside another hook's callback (e.g. `useEvents` inside a `useEffect`) — hooks run only at the top level of a component or hook body. For document/window cleanup, capture the remover and return it (or return `{ context, cleanup }`)
- Don't hand-roll a `querySelector` getter to keep a swappable child live — use `useChildren(el, prefix, { signals: [...] })`
