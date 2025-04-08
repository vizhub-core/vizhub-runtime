import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es", "cjs"],
      fileName: (format) =>
        `index.${format === "es" ? "js" : "cjs"}`,
    },
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      external: [], // Add external dependencies here if needed
    },
  },
});
