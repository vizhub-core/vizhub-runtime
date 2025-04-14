import type {
  RollupBuild,
  RollupOptions,
  OutputOptions,
} from "rollup";
import { FileCollection } from "@vizhub/viz-types";
import { virtualFileSystem } from "../common/virtualFileSystem.js";
import { sucrasePlugin } from "../common/sucrasePlugin.js";
import {
  getGlobals,
  packageJSON,
} from "../common/packageJson.js";

export const computeBundleJSV2 = async ({
  files,
  rollup,
  enableSourcemap = true,
}: {
  files: FileCollection;
  rollup: (options: RollupOptions) => Promise<RollupBuild>;
  enableSourcemap?: boolean;
}): Promise<string> => {
  const indexJSContent = files["index.js"];
  if (!indexJSContent) {
    throw new Error("Missing index.js");
  }

  const inputOptions: RollupOptions = {
    input: "./index.js",
    plugins: [virtualFileSystem(files), sucrasePlugin()],
    onwarn(warning, warn) {
      // Suppress "treating module as external dependency" warnings
      if (warning.code === "UNRESOLVED_IMPORT") return;
      warn(warning);
    },
  };

  const outputOptions: OutputOptions = {
    format: "iife",
    sourcemap: enableSourcemap,
  };

  const pkg = packageJSON(files);

  if (pkg) {
    const globals = getGlobals(pkg);
    if (globals) {
      inputOptions.external = Object.keys(globals);
      outputOptions.globals = globals;
    }
  }

  const bundle = await rollup(inputOptions);

  const { output } = await bundle.generate(outputOptions);
  return output[0].code;
};
