import { sucrasePlugin } from "../common/sucrasePlugin";
import type {
  RollupBuild,
  RollupOptions,
  OutputOptions,
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
  vizCache: VizCache;
  vizId: VizId;
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

  const inputOptions: RollupOptions = {
    input: "./index.js",
    plugins: [
      vizResolve({ vizId, slugCache }),
      transformDSV(),
      sucrasePlugin(),
      transformSvelte({ getSvelteCompiler }),
      vizLoad({ vizCache, trackCSSImport }),
    ],
    onwarn(warning, warn) {
      // Suppress "treating module as external dependency" warnings
      if (warning.code === "UNRESOLVED_IMPORT") return;
      warn(warning);
    },
  };

  const bundle = await rollup(inputOptions);

  const pkg = packageJSON(files);
  const globals = getGlobals(pkg);

  const outputOptions: OutputOptions = {
    format: "umd",
    name: "Viz",
    sourcemap: enableSourcemap ? true : false,
    compact: true,
    globals,
  };

  const { output } = await bundle.generate(outputOptions);
  return {
    src: output[0].code,
    cssFiles: Array.from(cssFilesSet),
  };
};
