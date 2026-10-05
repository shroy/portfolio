---
name: ts-patterns
description: TypeScript conventions — inference-first, narrow, local, strict types for a small browser app. Use whenever writing, changing, or reviewing TypeScript, or adding a type, annotation, assertion, generic, or compiler setting.
---

# TypeScript Patterns

TypeScript constrains ambiguity; it does not narrate what the compiler already
knows. The target style is inferred, narrow, local, strict, and boring.

## Where types go

- Type the boundaries; let inference carry the inside. An explicit type earns
  its place by catching a mistake inference would miss or by stating a
  contract.
- Exported functions may declare parameter and return types when that
  clarifies or stabilizes the API. Local functions infer their return types.
- One-off object shapes stay inline. Name a type when it is reused or names a
  domain concept.
- A type lives beside the code that owns it. There is no shared `types/` file.
- Derive from the source of truth — `typeof`, indexed access, `ReturnType`,
  `Parameters` — instead of restating a shape.

## Narrow, don't widen

- Domain values are literal unions, not `string`. When the values and their
  union are both needed, the value is the source:

  ```ts
  const sizes = ["small", "medium", "large"] as const;
  type Size = (typeof sizes)[number];
  ```

- `satisfies` checks config objects and lookup tables while keeping the narrow
  inferred type; use it instead of an annotation.
- Known keys get a union key type, never `Record<string, …>`.
- No `enum` or `const enum`; use literal unions or `as const` objects. An
  enum is allowed only when an external API requires that shape.
- `type` by default; `interface` only for declaration merging or augmenting a
  global or library type.

## Unknown and absent values

- No explicit or implicit `any`. Untrusted data — JSON, storage, `dataset`, URL
  params — enters as `unknown` and is narrowed by a guard before use.
- A function that parses data returns the type it validated, never a
  caller-chosen `T`.
- One representation of absence per concept, handled where it arises: keep the
  `null` DOM APIs return; use `undefined` for your own "not there."

## Escape hatches

`as` and non-null `!` are escape hatches. Each use carries a comment naming the
fact the compiler can't see. When a cast exists to silence an error, fix the
type or narrow instead.

## Keep the type system boring

- A generic relates two or more positions; a type parameter used once becomes
  the concrete type or `unknown`.
- Helper types serve more than one use site. No branded types, conditional
  types, or mapped-type puzzles — restructure the data instead.

## DOM

- Use the platform's DOM types as they are; never redeclare a browser API.
- Narrow elements with `instanceof` and control flow, not
  `querySelector<T>()` or `as`. When the same narrowing repeats, write one
  local guard.

## Compiler

`strict`, `noUncheckedIndexedAccess`, `erasableSyntaxOnly`, and
`verbatimModuleSyntax` stay on — they enforce this file.

## Review

For each annotation, named type, helper, generic, and assertion in the diff:
delete it and re-check. If safety is unchanged and the code reads better, it
stays deleted. Done when every remaining one changes a type error or documents
a boundary.
