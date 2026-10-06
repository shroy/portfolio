// hooktml 0.7.0 ships no types. Only what this site imports, kept narrow.
declare module "hooktml" {
  export type Signal<T> = { value: T; subscribe: (listener: () => void) => () => void };
  /** A component's named parts, by plural key: <a crumb-link> arrives as children.links. */
  export type Children<Key extends string> = { readonly [K in Key]: HTMLElement[] };

  type Cleanup = () => void;
  type Deps = readonly Signal<unknown>[];
  type Behavior = (el: HTMLElement, props: never) => unknown;

  export const start: () => void;
  export const registerComponent: (component: Behavior) => void;
  export const registerHook: (hook: Behavior) => void;

  export const signal: <T>(initial: T) => Signal<T>;
  export const computed: <T>(derive: () => T) => Readonly<Signal<T>>;
  export const useEffect: (effect: () => void, deps: Deps) => void;

  export const useEvents: (
    target: EventTarget | null,
    handlers: { readonly [type: string]: (event: Event) => void },
  ) => Cleanup;
  export const useAttributes: (
    target: HTMLElement | readonly HTMLElement[] | null | undefined,
    attributes: { readonly [name: string]: string | null | ((el: HTMLElement, index: number) => string | null) },
    deps?: Deps,
  ) => Cleanup;
  export const useText: (target: HTMLElement | null | undefined, text: () => string, deps?: Deps) => Cleanup;
}
