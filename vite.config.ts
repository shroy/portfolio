import { existsSync, readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";

// <!-- include path/to/file.html --> pulls a shared fragment into a page: the contact form
// appears in the dialog on every page and on /contact itself.
const includes = {
  name: "includes",
  transformIndexHtml: (html: string) =>
    html.replace(/<!-- include (\S+) -->/g, (_, file: string) => readFileSync(new URL(file, import.meta.url), "utf8")),
};

// Every page with a footer has a Markdown twin of its copy, public/<route>/index.md, linked as
// "Read as Markdown". A new page without one fails the build, here and in CI.
const markdown: Plugin = {
  name: "markdown",
  apply: "build",
  writeBundle(_, bundle) {
    Object.values(bundle).forEach((file) => {
      if (file.type !== "asset" || !file.fileName.endsWith(".html")) return;
      const html = String(file.source);
      if (!html.includes('class="Footer"')) return;
      const href = /class="Footer-markdown" href="([^"]+)"/.exec(html)?.[1];
      if (!href) return this.error(`${file.fileName} has a footer but no "Read as Markdown" link`);
      if (!existsSync(new URL(`public${href}`, import.meta.url))) this.error(`${file.fileName} links ${href}, but public${href} doesn't exist`);
    });
  },
};

export default defineConfig({
  plugins: [includes, markdown],
  build: {
    // Keep font files out of the render-blocking stylesheet; they load only where used.
    assetsInlineLimit: (file) => (file.endsWith(".woff2") ? false : undefined),
    rolldownOptions: {
      input: { main: "index.html", contact: "contact/index.html", resume: "resume/index.html", wistia: "wistia/index.html", unmute: "unmute/index.html", provide: "provide/index.html", kickfirst: "kickfirst/index.html", roleprint: "roleprint/index.html", story: "story/index.html", notfound: "404.html" },
      // HookTML registers components and hooks by their function names.
      output: { keepNames: true },
    },
  },
});
