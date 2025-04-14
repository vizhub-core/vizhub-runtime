import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "./src/index.ts",
        worker: "./src/worker.ts",
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      external: [
        "react",
        "@rollup/browser",
        "@vizhub/viz-types",
        "@vizhub/viz-utils",
        "magic-sandbox",
        "sucrase",
      ],
    },
  },
});
