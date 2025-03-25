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

  const bundle = await rollup(inputOptions);

  const pkg = packageJSON(files);
  const globals = getGlobals(pkg);

  const outputOptions: OutputOptions = {
    format: "iife",
    globals,
    sourcemap: enableSourcemap,
  };

  const { output } = await bundle.generate(outputOptions);
  return output[0].code;
};
