// TEMPORARY design arena: loads the selected candidate's script, if it has one.
const scripts = import.meta.glob("./*/index.ts");
const slug = document.documentElement.dataset["arena"];
const load = slug ? scripts[`./${slug}/index.ts`] : undefined;
void load?.();
