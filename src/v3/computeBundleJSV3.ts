import { sucrasePlugin } from "../common/sucrasePlugin";
import type {
  RollupBuild,
  RollupOptions,
  OutputOptions,
  Plugin,
} from "rollup";
import { FileCollection, VizId } from "@vizhub/viz-types";
import {
  getGlobals,
  packageJSON,
} from "../common/packageJson.js";
import { transformDSV } from "./transformDSV/index.js";
import { vizResolve } from "./vizResolve.js";
import { VizCache } from "./vizCache.js";
import { vizLoad } from "./vizLoad.js";
import { SlugCache } from "./slugCache.js";
import {
  SvelteCompiler,
  transformSvelte,
} from "./transformSvelte.js";

export const computeBundleJSV3 = async ({
  files,
  rollup,
  enableSourcemap = true,
  vizCache,
  vizId,
  slugCache,
  getSvelteCompiler,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
  vizCache?: VizCache;
  vizId?: VizId;
  slugCache?: SlugCache;
  getSvelteCompiler?: () => Promise<SvelteCompiler>;
}): Promise<{ src: string; cssFiles: string[] }> => {
  // Track CSS imports
  const cssFilesSet = new Set<string>();
  const trackCSSImport = (cssFile: string) => {
    cssFilesSet.add(cssFile);
  };
  const indexJSContent = files["index.js"];
  if (!indexJSContent) {
    throw new Error("Missing index.js");
  }

  // Create a replace plugin similar to the REPL implementation
  const replacePlugin: Plugin = {
    name: "replace",
    transform(code, id) {
      // Replace process.env.NODE_ENV and other environment variables
      let hasReplacements = false;
      let transformedCode = code;

      // Replace process.env.NODE_ENV
      if (
        transformedCode.includes("process.env.NODE_ENV")
      ) {
        transformedCode = transformedCode.replace(
          /\bprocess\.env\.NODE_ENV\b/g,
          JSON.stringify("production"),
        );
        hasReplacements = true;
      }

      return hasReplacements
        ? { code: transformedCode, map: null }
        : null;
    },
  };

  const inputOptions: RollupOptions = {
    input: "./index.js",
    plugins: [
      ...(vizId ? [vizResolve({ vizId, slugCache })] : []),
      transformDSV(),
      sucrasePlugin(),
      transformSvelte({ getSvelteCompiler }),
      replacePlugin,
      ...(vizCache
        ? [
            vizLoad({
              vizCache,
              trackCSSImport,
              vizId,
              files,
            }),
          ]
        : []),
    ],
    onwarn(warning, warn) {
      // Suppress "treating module as external dependency" warnings
      if (warning.code === "UNRESOLVED_IMPORT") return;
      warn(warning);
    },
  };

  const outputOptions: OutputOptions = {
    format: "umd",
    name: "Viz",
    sourcemap: enableSourcemap ? true : false,
    compact: true,
  };

  const pkg = packageJSON(files);
  if (pkg) {
    const globals = getGlobals(pkg);
    if (globals) {
      inputOptions.external = Object.keys(globals);
      outputOptions.globals = globals;
    }
  }

  // Handle Svelte internal modules that might be treated as external
  if (!inputOptions.external) {
    inputOptions.external = [];
  }
  if (!outputOptions.globals) {
    outputOptions.globals = {};
  }

  // Ensure Svelte internal modules are not treated as external
  // by filtering them out if they were added
  if (Array.isArray(inputOptions.external)) {
    inputOptions.external = inputOptions.external.filter(
      (ext) =>
        typeof ext === "string" &&
        !ext.startsWith("#client/"),
    );
  }

  const bundle = await rollup(inputOptions);

  const { output } = await bundle.generate(outputOptions);
  return {
    src: output[0].code,
    cssFiles: Array.from(cssFilesSet),
  };
};
