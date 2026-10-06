import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // Keep font files out of the render-blocking stylesheet; they load only where used.
    assetsInlineLimit: (file) => (file.endsWith(".woff2") ? false : undefined),
    // HookTML registers components and hooks by their function names.
    rolldownOptions: { output: { keepNames: true } },
  },
});
