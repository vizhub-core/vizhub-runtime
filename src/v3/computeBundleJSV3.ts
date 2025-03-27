import { FileCollection } from "../types";
import { virtualFileSystem } from "../common/virtualFileSystem";
import { sucrasePlugin } from "../common/sucrasePlugin";
import type {
  RollupBuild,
  RollupOptions,
  OutputOptions,
} from "rollup";
import {
  getGlobals,
  packageJSON,
} from "../common/packageJson";
import { transformDSV } from "./transformDSV";
import { vizResolve } from "./vizResolve";
import { VizCache } from "./vizCache";
import { VizId } from "@vizhub/viz-types";
import { vizLoad } from "./vizLoad";

export const computeBundleJSV3 = async ({
  files,
  rollup,
  enableSourcemap = true,
  vizCache,
  vizId,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
  vizCache: VizCache;
  vizId: VizId;
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
      vizResolve({ vizId }),
      transformDSV(),
      sucrasePlugin(),
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
