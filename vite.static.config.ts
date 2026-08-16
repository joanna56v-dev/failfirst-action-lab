import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "static",
  publicDir: "../public",
  base: "/",
  plugins: [react()],
  build: {
    outDir: "../out",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "static/index.html"),
        play: resolve(import.meta.dirname, "static/play/index.html"),
      },
    },
  },
});
