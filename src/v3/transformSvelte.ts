import type { InputPluginOption } from "rollup";
import { parseId } from "./parseId";
import type { ResolvedVizFileId } from "./types";

const debug = false;

// The cache of fetched files.
const fetchedFileCache = new Map<string, string>();

// The Svelte compiler.
export type SvelteCompiler = (
  code: string,
  options: any,
) => { js: { code: string; map?: object }; css?: { code: string; map?: object } };
let compile: SvelteCompiler;

const svelteURL =
  "https://cdn.jsdelivr.net/npm/svelte@5";

export const svelteCompilerUrl = `${svelteURL}/compiler.cjs`;

// Responsible for transforming Svelte files.
// Inspired by:
//  * https://github.com/sveltejs/sites/blob/master/packages/repl/src/lib/workers/compiler/index.js#L2
//  * https://github.com/sveltejs/sites/blob/master/packages/repl/src/lib/workers/bundler/index.js#L358
//  * https://github.com/sveltejs/rollup-plugin-svelte/blob/master/index.js#L146C4-L146C51
export const transformSvelte = ({
  getSvelteCompiler,
}: {
  getSvelteCompiler?: () => Promise<any>;
}): InputPluginOption => ({
  name: "transformSvelte",

  load: async (resolved: string) => {
    if (!resolved.startsWith(svelteURL)) {
      return;
    }
    if (debug) {
      console.log("[transformSvelte]: load() " + resolved);
    }

    const cachedFile = fetchedFileCache.get(resolved);
    if (cachedFile) return cachedFile;

    const fetchedFile = await fetch(resolved).then((res) =>
      res.text(),
    );

    fetchedFileCache.set(resolved, fetchedFile);

    return fetchedFile;
  },

  // From https://github.com/sveltejs/sites/blob/master/packages/repl/src/lib/workers/bundler/index.js#L255C2-L271C5
  resolveId: async (importee, importer) => {
    if (debug) {
      console.log(
        "[transformSvelte] resolveId() " + importee,
      );
      console.log("importee: " + importee);
      console.log("importer: " + importer);
    }
    // importing from Svelte
    if (importee === `svelte`) {
      return `${svelteURL}/src/runtime/index.js`;
    }
    if (importee.startsWith(`svelte/`)) {
      const sub_path = importee.slice(7);
      return `${svelteURL}/src/runtime/${sub_path}/index.js`;
    }

    // importing from a URL
    if (/^https?:/.test(importee)) return importee;

    // Relative imports
    if (importee.startsWith(".")) {
      if (importer && importer.startsWith(svelteURL)) {
        const resolved = new URL(importee, importer).href;
        const url = new URL(importee, importer).href;
        if (debug) {
          console.log(
            "[transformSvelte] resolveId() " + resolved,
          );
        }
        return resolved;
      }
    }
  },

  transform: async (
    code: string,
    id: ResolvedVizFileId,
  ) => {
    const { fileName } = parseId(id);

    const isSvelte = fileName.endsWith(".svelte");

    if (isSvelte) {
      if (!compile) {
        if (!getSvelteCompiler) {
          throw new Error("Svelte compiler not available");
        }
        compile = await getSvelteCompiler();
      }

      const compiled = compile(code, {
        filename: fileName,
        generate: 'client',        // Svelte 5 uses 'client' instead of 'dom'
        css: 'external',           // Extract CSS instead of auto-injecting
        dev: false,                // Production mode
      });

      // In Svelte 5, CSS is extracted separately if css: 'external' is used
      let result = compiled.js.code;
      
      // If there's CSS, inject it into the component
      if (compiled.css && compiled.css.code) {
        // Prepend CSS injection code to the component
        const cssCode = JSON.stringify(compiled.css.code);
        const cssInjection = `
// Auto-inject CSS for Svelte component
(function() {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = ${cssCode};
    document.head.appendChild(style);
  }
})();
`;
        result = cssInjection + result;
      }

      return result;
    }
    return undefined;
  },
});
