import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

// <!-- include path/to/file.html --> pulls a shared fragment into a page: the contact form
// appears in the dialog on every page and on /contact itself.
const includes = {
  name: "includes",
  transformIndexHtml: (html: string) =>
    html.replace(/<!-- include (\S+) -->/g, (_, file: string) => readFileSync(new URL(file, import.meta.url), "utf8")),
};

export default defineConfig({
  plugins: [includes],
  build: {
    // Keep font files out of the render-blocking stylesheet; they load only where used.
    assetsInlineLimit: (file) => (file.endsWith(".woff2") ? false : undefined),
    rolldownOptions: {
      input: { main: "index.html", contact: "contact/index.html", notfound: "404.html" },
      // HookTML registers components and hooks by their function names.
      output: { keepNames: true },
    },
  },
});
