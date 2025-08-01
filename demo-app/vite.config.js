import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: [
      // Exclude Rollup v4 from being bundled,
      // because it messes up the WASM part of the build.
      "@rollup/browser",
      "@vizhub/runtime",
    ],
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: [".."],
    },
  },
});
