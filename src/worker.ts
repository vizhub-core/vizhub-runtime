import { buildHTML } from "./buildHTML";
import { rollup } from "@rollup/browser";
import type { RollupBuild, RollupOptions } from "rollup";
import { svelteCompilerUrl } from "./v3/transformSvelte";
import { FileCollection } from "@vizhub/viz-types";

// Flag for debugging
const debug = false;

// Inspired by
// https://github.com/sveltejs/sites/blob/master/packages/repl/src/lib/workers/bundler/index.js#L44
// unpkg doesn't set the correct MIME type for .cjs files
// https://github.com/mjackson/unpkg/issues/355
// TODO try it from jsdelivr without using `eval`
const getSvelteCompiler = async () => {
  const compiler = await fetch(svelteCompilerUrl).then(
    (r) => r.text(),
  );
  (0, eval)(compiler);

  // console.log(self.svelte);
  // @ts-ignore
  return self.svelte.compile;
};

// Handle messages from the main thread
addEventListener("message", async (event) => {
  const { data } = event;

  if (debug) {
    console.log("[worker] received message:", data);
  }

  if (data.type === "buildHTMLRequest") {
    const files: FileCollection = data.files;

    try {
      // Build HTML from the files
      const html = await buildHTML({
        files,
        // TypeScript is stupid
        rollup: rollup as (
          options: RollupOptions,
        ) => Promise<RollupBuild>,
        getSvelteCompiler,
      });

      // Send the built HTML back to the main thread
      postMessage({
        type: "buildHTMLResponse",
        html,
      });
    } catch (error) {
      if (debug) {
        console.error("[worker] build error:", error);
      }

      // Send the error back to the main thread
      postMessage({
        type: "buildHTMLResponse",
        error,
      });
    }
  }
});
