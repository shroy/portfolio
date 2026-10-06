import { signal, useAttributes, useEvents, useText, type Children } from "hooktml";
import { cadence } from "./sound";

// The contact form (styles in components.css), in the dialog and on /contact. Checked only on
// Send, against the constraints in its markup, then posted in place. The root's data-state
// carries the rest; without JavaScript the endpoint renders the same states into the page.

const states = ["sending", "sent", "failed"] as const;
type State = (typeof states)[number];

export const Contact = (
  el: HTMLElement,
  { children }: { children: Children<"forms" | "fieldsets" | "fields" | "submits" | "greetings" | "names"> },
) => {
  const [form] = children.forms;
  if (!(form instanceof HTMLFormElement)) return undefined;
  const fields = children.fields.filter((field) => field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement);
  const [submit] = children.submits;
  const [greeting] = children.greetings;
  const [name] = children.names;
  const dialog = el instanceof HTMLDialogElement ? el : null;
  const label = el.getAttribute("aria-labelledby");

  // Start from whatever the page arrived with (the endpoint's rendering, without JavaScript).
  const state = signal<State | undefined>(states.find((s) => s === el.dataset.state));
  const firstName = signal(name?.textContent ?? "");
  const invalid = signal<readonly HTMLElement[]>([]);

  const post = async () => {
    // Read before the fields lock: disabled fields aren't submitted.
    const body = new FormData(form);
    state.value = "sending";
    const sent = await fetch(form.action, { method: "POST", body, headers: { Accept: "application/json" } }).then(
      (response) => response.ok,
      () => false,
    );
    if (sent) {
      firstName.value = String(body.get("name")).trim().split(/\s+/)[0] ?? "";
      state.value = "sent";
      greeting?.focus();
      cadence();
    } else {
      state.value = "failed";
      submit?.focus();
    }
  };

  const check = (event: Event) => {
    event.preventDefault();
    if (state.value === "sending") return;
    invalid.value = fields.filter((field) => !field.validity.valid || !field.value.trim());
    const [first] = invalid.value;
    if (first) first.focus();
    else void post();
  };

  // After Sent, a fresh form for next time, once the dialog has finished leaving.
  const reset = () =>
    requestAnimationFrame(() =>
      Promise.allSettled(el.getAnimations().map((animation) => animation.finished)).then(() => {
        form.reset();
        invalid.value = [];
        state.value = undefined;
      }),
    );

  useAttributes(el, { "data-state": () => state.value ?? null }, [state]);
  // A dialog is named by its visible heading: the thanks, once sent.
  useAttributes(dialog, { "aria-labelledby": () => (state.value === "sent" && greeting?.id) || label }, [state]);
  useAttributes(form, { novalidate: "" });
  useAttributes(children.fieldsets, { disabled: () => (state.value === "sending" ? "" : null) }, [state]);
  useAttributes(
    fields,
    {
      "aria-invalid": (field) => (invalid.value.includes(field) ? "true" : null),
      "aria-describedby": (field) => (invalid.value.includes(field) ? `${field.id}-error` : null),
    },
    [invalid],
  );
  useAttributes(submit, { "aria-describedby": () => (state.value === "failed" ? "contact-failed" : null) }, [state]);
  useText(name, () => firstName.value, [firstName]);

  useEvents(form, { submit: check });
  useEvents(fields, {
    keydown: (event) => {
      if (event instanceof KeyboardEvent && event.key === "Enter" && (event.metaKey || event.ctrlKey)) form.requestSubmit();
    },
  });
  useEvents(dialog, {
    close: () => {
      if (state.value === "sent") reset();
    },
  });
};
